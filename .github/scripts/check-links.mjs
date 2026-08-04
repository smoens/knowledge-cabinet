/* Checks every curated chapter source URL is still reachable. This is the
   network-dependent sibling of check-content.mjs (which only validates that
   a source url is well-formed) — run it locally before leaning on "Random
   source" to surface a link, or whenever a source has been sitting for a
   while and might have rotted. Not part of the fast, offline content check
   because it makes real HTTP requests and can be slow or flaky on a bad
   connection. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../../', import.meta.url));
const ctx = { window: {} };
vm.createContext(ctx);
function run(file) { vm.runInContext(readFileSync(file, 'utf8'), ctx, { filename: file }); }
run(join(root, 'content.js'));
const BOOK = ctx.window.BOOK;

// One entry per distinct URL, remembering every chapter (and label) that
// cites it — a broken link is worth flagging once, not once per citation.
const byUrl = new Map();
for (const chapter of BOOK.chapters) {
  if (!chapter.chunk) continue;
  try { run(join(root, chapter.chunk)); } catch { continue; }
  const body = ctx.window.CABINET_CHAPTERS && ctx.window.CABINET_CHAPTERS[chapter.id];
  for (const s of (body && body.sources) || []) {
    if (!s.url) continue;
    if (!byUrl.has(s.url)) byUrl.set(s.url, { label: s.label, chapters: [] });
    byUrl.get(s.url).chapters.push(chapter.id);
  }
}

const TIMEOUT_MS = 10000;
const CONCURRENCY = 5;
const UA = 'Mozilla/5.0 (compatible; knowledge-cabinet-link-check/1.0)';

async function checkOne(url) {
  for (const method of ['HEAD', 'GET']) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } });
      clearTimeout(timer);
      // Some servers reject HEAD outright (405/501) or bounce it through a
      // WAF challenge (403) that a real GET would sail past — fall back
      // once before concluding anything about the link itself.
      if (method === 'HEAD' && [403, 405, 501].includes(res.status)) continue;
      return { ok: res.ok, status: res.status };
    } catch (err) {
      clearTimeout(timer);
      if (method === 'HEAD') continue;
      return { ok: false, error: err.name === 'AbortError' ? 'timed out' : err.message };
    }
  }
  return { ok: false, error: 'no response' };
}

async function pool(entries, limit, worker) {
  const results = new Array(entries.length);
  let next = 0;
  async function lane() {
    while (next < entries.length) {
      const i = next++;
      results[i] = await worker(entries[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, entries.length) }, lane));
  return results;
}

const entries = [...byUrl.entries()];
console.log(`checking ${entries.length} distinct source link(s)\u2026`);
const results = await pool(entries, CONCURRENCY, ([url]) => checkOne(url));

const broken = [];
const uncertain = [];
entries.forEach(([url, info], i) => {
  const r = results[i];
  const who = info.chapters.join(', ');
  if (r.ok) return;
  if (r.status) broken.push(`  \u2717 ${r.status}  ${url}\n      "${info.label}" \u2014 ${who}`);
  else uncertain.push(`  ?  ${r.error}  ${url}\n      "${info.label}" \u2014 ${who}`);
});

if (broken.length) {
  console.log(`\n${broken.length} broken link(s):`);
  broken.forEach(line => console.log(line));
}
if (uncertain.length) {
  console.log(`\n${uncertain.length} link(s) could not be confirmed (network issue, not necessarily broken):`);
  uncertain.forEach(line => console.log(line));
}
if (!broken.length && !uncertain.length) console.log('\nall source links responded.');

process.exit(broken.length ? 1 : 0);
