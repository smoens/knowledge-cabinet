import { mkdir, readFile, rename, writeFile, appendFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const MAX_FEED_ITEMS = 20;
const MAX_SEEN_ITEMS = 200;
const MAX_CHANGED_LINES = 400;
const MAX_EXCERPT_LENGTH = 800;
const NATIVE_MERGE_TITLE = /^Merge pull request #\d+ from [^/\s]+\/\S+$/;
const METADATA_LINE = /^(?:ms\.(?:date|custom|author|reviewer|service|topic|subservice|prod|technology)|author|ms\.translationtype|ms\.contentlocale|ms\.lasthandoff):/i;

function option(args, name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed.startsWith('"')) return JSON.parse(trimmed);
  return trimmed;
}

export function parseSources(text) {
  const sources = [];
  let source;
  let nested;

  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith('#')) continue;

    const sourceMatch = rawLine.match(/^  - id:\s*(.+)$/);
    if (sourceMatch) {
      if (source) sources.push(source);
      source = { id: parseScalar(sourceMatch[1]) };
      nested = null;
      continue;
    }

    if (!source) continue;

    const fieldMatch = rawLine.match(/^    ([a-z_]+):(?:\s*(.*))?$/i);
    if (fieldMatch) {
      const [, key, rawValue = ''] = fieldMatch;
      if (!rawValue.trim()) {
        source[key] = {};
        nested = key;
      } else {
        source[key] = parseScalar(rawValue);
        nested = null;
      }
      continue;
    }

    const nestedMatch = rawLine.match(/^      ([a-z_]+):\s*(.+)$/i);
    if (nestedMatch && nested && typeof source[nested] === 'object') {
      source[nested][nestedMatch[1]] = parseScalar(nestedMatch[2]);
    }
  }

  if (source) sources.push(source);

  for (const item of sources) {
    if (!item.id || !item.name || !item.url || !item.type || typeof item.active !== 'boolean') {
      throw new Error(`Source "${item.id || '(missing id)'}" has an unsupported content-sources.yml shape.`);
    }
  }

  return sources;
}

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function textOnly(value = '') {
  return decodeEntities(
    value
      .replace(/<!\[CDATA\[([\s\S]*?)]]>/gi, '$1')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function trimText(value, maxLength = MAX_EXCERPT_LENGTH) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function tagValue(block, names) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
    if (match) return textOnly(match[1]);
  }
  return '';
}

function normaliseLink(link) {
  try {
    const url = new URL(textOnly(link));
    if (url.hash === '#atom-everything') url.hash = '';
    return url.toString();
  } catch {
    return textOnly(link);
  }
}

function linkValue(block) {
  const atomLink = block.match(/<link\b[^>]*\bhref=(?:"([^"]+)"|'([^']+)')[^>]*>/i);
  if (atomLink) return normaliseLink(atomLink[1] || atomLink[2]);
  return normaliseLink(tagValue(block, ['link', 'guid', 'id']));
}

export function parseFeed(xml) {
  const elementName = /<entry\b/i.test(xml) ? 'entry' : 'item';
  const blocks = [...xml.matchAll(new RegExp(`<${elementName}\\b[^>]*>([\\s\\S]*?)</${elementName}>`, 'gi'))]
    .slice(0, MAX_FEED_ITEMS)
    .map(match => match[1]);

  if (!blocks.length) throw new Error('The feed contained no RSS or Atom entries.');

  return blocks
    .map(block => ({
      title: trimText(tagValue(block, ['title'])),
      link: linkValue(block),
      published: tagValue(block, ['published', 'updated', 'pubDate', 'date']),
      excerpt: trimText(tagValue(block, ['summary', 'description', 'content']))
    }))
    .filter(item => item.link && item.title);
}

function parsePage(html, url) {
  const title = trimText(tagValue(html, ['title']) || url);
  const descriptionMatch = html.match(/<meta\b[^>]*\bname=(?:"description"|'description')[^>]*\bcontent=(?:"([^"]*)"|'([^']*)')[^>]*>/i);
  const excerpt = trimText(textOnly(descriptionMatch?.[1] || descriptionMatch?.[2] || ''));
  return [{ title, link: normaliseLink(url), published: '', excerpt }];
}

function getLegacySeenPath(stateDir, sourceId) {
  return join(stateDir, 'seen', `${sourceId}.json`);
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporaryPath, path);
}

function dedupeNewest(items, maxItems = MAX_SEEN_ITEMS) {
  const seen = new Set();
  return items.filter(item => {
    if (!item || seen.has(item)) return false;
    seen.add(item);
    return true;
  }).slice(0, maxItems);
}

async function existingSeen(stateDir, sourceId, state) {
  const stateSeen = state.sources?.[sourceId]?.seen;
  if (Array.isArray(stateSeen)) return stateSeen.map(normaliseLink);
  const legacy = await readJson(getLegacySeenPath(stateDir, sourceId), []);
  return Array.isArray(legacy) ? legacy.map(normaliseLink) : [];
}

async function fetchText(url, headers = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      'user-agent': 'knowledge-cabinet-content-watch/1.0',
      ...headers
    },
    signal: AbortSignal.timeout(30_000)
  });

  if (response.status === 304) {
    return { status: 304, headers: response.headers, text: '' };
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return { status: response.status, headers: response.headers, text: await response.text() };
}

function isMetadataOnly(changedLines) {
  return changedLines.length > 0 && changedLines.every(line => {
    const content = line.slice(1).trim();
    return !content || METADATA_LINE.test(content);
  });
}

function compactDiff(diff) {
  const compactLines = [];
  const changedLines = [];
  const filePaths = [];

  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith('diff --git ')) {
      compactLines.push(line);
      continue;
    }

    if (line.startsWith('+++ b/')) {
      const path = line.slice('+++ b/'.length);
      filePaths.push(path);
      compactLines.push(line);
      continue;
    }

    if (line.startsWith('--- a/') || line.startsWith('@@')) {
      compactLines.push(line);
      continue;
    }

    if ((line.startsWith('+') && !line.startsWith('+++')) || (line.startsWith('-') && !line.startsWith('---'))) {
      changedLines.push(line);
      compactLines.push(line);
    }
  }

  return {
    changedLineCount: changedLines.length,
    changedLines,
    filePaths: [...new Set(filePaths)],
    excerpt: compactLines.join('\n')
  };
}

function learnUrl(path, learn) {
  if (!learn?.strip_prefix || !learn?.base_url || !path.startsWith(learn.strip_prefix)) return '';

  let relative = path.slice(learn.strip_prefix.length).replace(/\.md$/i, '');
  if (relative === 'index' || path.endsWith('/toc.yml')) relative = '';
  return `${learn.base_url.replace(/\/$/, '')}${relative ? `/${relative}` : ''}`;
}

async function githubCandidate(source, item, problems, skipped) {
  if (NATIVE_MERGE_TITLE.test(item.title)) {
    skipped.nativeMerge += 1;
    return null;
  }

  let result;
  try {
    result = await fetchText(`${item.link}.diff`);
  } catch (error) {
    problems.push({
      sourceId: source.id,
      stage: 'diff',
      message: `${item.link}: ${error.message}`
    });
    return null;
  }

  const diff = compactDiff(result.text);
  if (diff.changedLineCount > MAX_CHANGED_LINES) {
    skipped.oversizedDiff += 1;
    return null;
  }
  if (diff.filePaths.length && diff.filePaths.every(path => path.endsWith('toc.yml'))) {
    skipped.tocOnly += 1;
    return null;
  }
  if (isMetadataOnly(diff.changedLines)) {
    skipped.metadataOnly += 1;
    return null;
  }

  return {
    sourceId: source.id,
    sourceName: source.name,
    type: source.type,
    title: item.title,
    link: item.link,
    published: item.published,
    excerpt: '',
    diff: {
      commitLink: item.link,
      changedLineCount: diff.changedLineCount,
      excerpt: diff.excerpt,
      files: diff.filePaths.map(path => ({ path, learnUrl: learnUrl(path, source.learn) }))
    }
  };
}

function loadCatalogue(contentPath) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(readFileSync(contentPath), context, { filename: contentPath });

  const book = context.window.BOOK;
  if (!book) throw new Error('content.js did not define window.BOOK.');

  return {
    areas: book.areas.map(({ id, name }) => ({ id, name })),
    chapters: book.chapters.map(({ id, title, area, state, summary }) => ({ id, title, area, state, summary })),
    concepts: book.concepts.map(({ id, term, kind, short }) => ({ id, term, kind, short }))
  };
}

export async function prepareContentWatch({ sourcePath, contentPath, stateDir, outputPath }) {
  const sources = parseSources(await readFile(sourcePath, 'utf8'));
  const statePath = join(stateDir, 'content-watch-state.json');
  const state = await readJson(statePath, { version: 1, sources: {} });
  state.sources ??= {};

  const candidates = [];
  const problems = [];
  const sourceResults = [];
  const skipped = { nativeMerge: 0, oversizedDiff: 0, tocOnly: 0, metadataOnly: 0 };

  const sourceReports = await Promise.all(sources.filter(item => item.active).map(async source => {
    const sourceCandidates = [];
    const sourceProblems = [];
    const sourceSkipped = { nativeMerge: 0, oversizedDiff: 0, tocOnly: 0, metadataOnly: 0 };
    const previous = state.sources[source.id] || {};
    const headers = {};
    if (previous.etag) headers['if-none-match'] = previous.etag;
    if (previous.lastModified) headers['if-modified-since'] = previous.lastModified;

    let fetched;
    try {
      fetched = await fetchText(source.url, headers);
    } catch (error) {
      sourceProblems.push({ sourceId: source.id, stage: 'feed', message: error.message });
      return {
        candidates: sourceCandidates,
        problems: sourceProblems,
        skipped: sourceSkipped,
        result: { id: source.id, status: 'failed', newItems: 0, candidates: 0 }
      };
    }

    if (fetched.status === 304) {
      return {
        candidates: sourceCandidates,
        problems: sourceProblems,
        skipped: sourceSkipped,
        result: { id: source.id, status: 'not-modified', newItems: 0, candidates: 0 }
      };
    }

    let items;
    try {
      items = source.type === 'page' ? parsePage(fetched.text, source.url) : parseFeed(fetched.text);
    } catch (error) {
      sourceProblems.push({ sourceId: source.id, stage: 'parse', message: error.message });
      return {
        candidates: sourceCandidates,
        problems: sourceProblems,
        skipped: sourceSkipped,
        result: { id: source.id, status: 'unparseable', newItems: 0, candidates: 0 }
      };
    }

    const seen = await existingSeen(stateDir, source.id, state);
    const seenSet = new Set(seen);
    const newItems = items.filter(item => !seenSet.has(normaliseLink(item.link)));
    const updatedSeen = dedupeNewest([
      ...items.map(item => normaliseLink(item.link)),
      ...seen
    ]);
    state.sources[source.id] = {
      etag: fetched.headers.get('etag') || previous.etag || '',
      lastModified: fetched.headers.get('last-modified') || previous.lastModified || '',
      seen: updatedSeen
    };
    await writeJson(getLegacySeenPath(stateDir, source.id), updatedSeen);

    for (const item of newItems) {
      if (source.type === 'github-commits') {
        const candidate = await githubCandidate(source, item, sourceProblems, sourceSkipped);
        if (!candidate) continue;
        sourceCandidates.push(candidate);
      } else {
        sourceCandidates.push({
          sourceId: source.id,
          sourceName: source.name,
          type: source.type,
          title: item.title,
          link: item.link,
          published: item.published,
          excerpt: item.excerpt
        });
      }
    }

    return {
      candidates: sourceCandidates,
      problems: sourceProblems,
      skipped: sourceSkipped,
      result: {
        id: source.id,
        status: 'updated',
        newItems: newItems.length,
        candidates: sourceCandidates.length
      }
    };
  }));

  for (const sourceReport of sourceReports) {
    candidates.push(...sourceReport.candidates);
    problems.push(...sourceReport.problems);
    sourceResults.push(sourceReport.result);
    for (const [kind, count] of Object.entries(sourceReport.skipped)) skipped[kind] += count;
  }

  await writeJson(statePath, state);

  const report = {
    version: 1,
    generatedAt: new Date().toISOString(),
    sourceCount: sourceResults.length,
    sourceResults,
    skipped,
    fetchProblems: problems,
    candidates,
    catalogue: loadCatalogue(contentPath)
  };
  await writeJson(outputPath, report);
  return report;
}

async function main() {
  const args = process.argv.slice(2);
  const report = await prepareContentWatch({
    sourcePath: resolve(option(args, '--sources', '.github/content-sources.yml')),
    contentPath: resolve(option(args, '--content', 'content.js')),
    stateDir: resolve(option(args, '--state-dir', '/tmp/gh-aw/cache-memory')),
    outputPath: resolve(option(args, '--output', '/tmp/gh-aw/content-watch/candidates.json'))
  });

  const hasWork = report.candidates.length > 0;
  const githubOutput = option(args, '--github-output', '');
  if (githubOutput) await appendFile(githubOutput, `has_work=${hasWork}\n`);

  const summaryPath = option(args, '--summary', '');
  if (summaryPath) {
    const changedSources = report.sourceResults.filter(source => source.status === 'updated').length;
    await appendFile(
      summaryPath,
      `## Content watch preflight\n\n- Checked ${report.sourceCount} active sources; ${changedSources} changed.\n- Prepared ${report.candidates.length} candidates; skipped ${Object.values(report.skipped).reduce((total, count) => total + count, 0)} deterministic non-content changes.\n- Fetch problems: ${report.fetchProblems.length}.\n`
    );
  }

  process.stdout.write(`${JSON.stringify({
    sourceCount: report.sourceCount,
    candidates: report.candidates.length,
    fetchProblems: report.fetchProblems.length,
    hasWork
  })}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    process.stderr.write(`content-watch preflight failed: ${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
