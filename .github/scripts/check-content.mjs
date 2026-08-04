/* Integrity check for the modular content model. Catches the mistakes that are
   silent in the browser: a missing chunk, stale startup metadata, dangling
   links, missing figure renderer, or a chapter with a hole in its depth ladder. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../../', import.meta.url));
const ctx = { window: {} };
const errors = [];
const warn = [];

function run(file) {
  vm.runInContext(readFileSync(file, 'utf8'), ctx, { filename: file });
}

vm.createContext(ctx);
run(join(root, 'content.js'));

const BOOK = ctx.window.BOOK;
for (const chapter of BOOK.chapters) {
  if (!chapter.chunk) {
    errors.push(`chapter ${chapter.id}: missing chunk path`);
    continue;
  }
  try {
    run(join(root, chapter.chunk));
  } catch (err) {
    errors.push(`chapter ${chapter.id}: cannot load ${chapter.chunk}: ${err.message}`);
  }
  const body = ctx.window.CABINET_CHAPTERS && ctx.window.CABINET_CHAPTERS[chapter.id];
  if (!body || !body.blocks) {
    errors.push(`chapter ${chapter.id}: chunk did not register a body`);
    continue;
  }
  Object.assign(chapter, body);
}

for (const area of BOOK.areas) {
  const chunk = BOOK.conceptDetailChunks && BOOK.conceptDetailChunks[area.id];
  if (!chunk) {
    errors.push(`concept details: missing chunk for ${area.id}`);
    continue;
  }
  try {
    run(join(root, chunk));
  } catch (err) {
    errors.push(`concept details: cannot load ${chunk}: ${err.message}`);
  }
}
for (const area of Object.keys(BOOK.conceptDetailChunks || {})) {
  if (!BOOK.areas.some(item => item.id === area)) {
    errors.push(`concept details: chunk declared for unknown area "${area}"`);
  }
}
const details = ctx.window.CABINET_CONCEPT_DETAILS || {};
for (const concept of BOOK.concepts) {
  if (!details[concept.id]) errors.push(`concept ${concept.id}: missing detail`);
  else Object.assign(concept, details[concept.id]);
}

const figSrc = [
  readFileSync(join(root, 'figures.js'), 'utf8'),
  ...readdirSync(join(root, 'figures'))
    .filter(file => file.endsWith('.js'))
    .map(file => readFileSync(join(root, 'figures', file), 'utf8'))
].join('\n');

const areas = new Set(BOOK.areas.map(a => a.id));
const concepts = new Map(BOOK.concepts.map(c => [c.id, c]));
const chapters = new Map(BOOK.chapters.map(c => [c.id, c]));
const mentioned = new Set();
const expectedFrequency = {};

const seen = new Set();
for (const c of BOOK.concepts) {
  if (seen.has(c.id)) errors.push(`duplicate concept id: ${c.id}`);
  seen.add(c.id);
  if (!areas.has(c.area)) errors.push(`concept ${c.id}: unknown area "${c.area}"`);
  if (c.kind !== 'concept' && c.kind !== 'pattern') errors.push(`concept ${c.id}: kind must be concept or pattern`);
  for (const f of ['term', 'short', 'fundamental', 'mechanism']) {
    if (!c[f] || !String(c[f]).trim()) errors.push(`concept ${c.id}: missing ${f}`);
  }
  for (const s of c.seeAlso || []) {
    if (!concepts.has(s)) errors.push(`concept ${c.id}: seeAlso -> unknown concept "${s}"`);
  }
  for (const s of c.sources || []) {
    if (!s.label) errors.push(`concept ${c.id}: source with no label`);
  }
}

function chapterReferences(chapter) {
  const ids = [];
  const seenIds = new Set();
  const ref = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

  function add(id) {
    if (!concepts.has(id)) return;
    expectedFrequency[id] = (expectedFrequency[id] || 0) + 1;
    if (!seenIds.has(id)) { seenIds.add(id); ids.push(id); }
  }
  function scan(text) {
    let match;
    ref.lastIndex = 0;
    while ((match = ref.exec(text))) add(match[1]);
  }

  scan(chapter.summary || '');
  for (const block of chapter.blocks || []) {
    scan((block.x || '') + ' ' + (block.items || []).join(' ') + ' ' + (block.q || '') + ' ' + (block.a || ''));
    if (block.concept) add(block.concept);
  }
  return ids;
}

const chSeen = new Set();
for (const ch of BOOK.chapters) {
  if (chSeen.has(ch.id)) errors.push(`duplicate chapter id: ${ch.id}`);
  chSeen.add(ch.id);
  if (!areas.has(ch.area)) errors.push(`chapter ${ch.id}: unknown area "${ch.area}"`);
  if (!['new', 'live', 'evolving', 'retiring'].includes(ch.state)) {
    errors.push(`chapter ${ch.id}: unknown state "${ch.state}"`);
  }
  if (ch.state === 'retiring' && !ch.supersededBy) {
    warn.push(`chapter ${ch.id}: retiring with no supersededBy`);
  }
  if (ch.supersededBy && !chapters.has(ch.supersededBy)) {
    errors.push(`chapter ${ch.id}: supersededBy -> unknown chapter "${ch.supersededBy}"`);
  }
  if (!ch.sources || !ch.sources.length) warn.push(`chapter ${ch.id}: no sources`);
  for (const s of ch.sources || []) {
    if (!s.label) errors.push(`chapter ${ch.id}: source with no label`);
    if (s.url && !/^https?:\/\//.test(s.url)) errors.push(`chapter ${ch.id}: source url is not absolute: ${s.url}`);
  }

  const depths = new Set();
  let prompts = 0;
  for (const b of ch.blocks || []) {
    if (!(b.d >= 1 && b.d <= 4)) errors.push(`chapter ${ch.id}: block depth ${b.d} out of range`);
    depths.add(b.d);
    if (b.t === 'figure' && !new RegExp(`LB\\.${b.fig}\\s*=`).test(figSrc)) {
      errors.push(`chapter ${ch.id}: figure "${b.fig}" has no renderer`);
    }
    if (b.t === 'prompt') {
      prompts++;
      if (!b.q || !b.a) errors.push(`chapter ${ch.id}: prompt missing q or a`);
      if (!concepts.has(b.concept)) errors.push(`chapter ${ch.id}: prompt -> unknown concept "${b.concept}"`);
      else mentioned.add(b.concept);
    }
    const text = [b.x, b.caption, b.q, b.a, ...(b.items || [])].filter(Boolean).join(' ');
    for (const m of text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
      const id = m[1].trim();
      if (!concepts.has(id)) errors.push(`chapter ${ch.id}: [[${id}]] is not a concept`);
      else mentioned.add(id);
    }
  }
  for (const d of [1, 2, 3]) {
    if (!depths.has(d)) warn.push(`chapter ${ch.id}: nothing at depth ${d}`);
  }
  if (!prompts) warn.push(`chapter ${ch.id}: no prompt blocks`);

  const refs = chapterReferences(ch);
  if (JSON.stringify(ch.concepts || []) !== JSON.stringify(refs)) {
    errors.push(`chapter ${ch.id}: startup concept references are stale`);
  }
  const workingBlockCount = (ch.blocks || []).filter(block => block.d <= 3).length;
  if (ch.workingBlockCount !== workingBlockCount) {
    errors.push(`chapter ${ch.id}: startup working block count is stale`);
  }
}

for (const id of concepts.keys()) {
  if ((BOOK.frequency[id] || 0) !== (expectedFrequency[id] || 0)) {
    errors.push(`concept ${id}: startup frequency is stale`);
  }
}
for (const id of Object.keys(BOOK.frequency || {})) {
  if (!concepts.has(id)) errors.push(`startup frequency references unknown concept "${id}"`);
}

const orphans = [...concepts.keys()].filter(id => !mentioned.has(id));

console.log(`${BOOK.chapters.length} chapters · ${BOOK.concepts.length} concepts · ${BOOK.areas.length} areas`);
if (orphans.length) console.log(`held by links only: ${orphans.join(', ')}`);
for (const w of warn) console.log(`  warn  ${w}`);
for (const e of errors) console.error(`  ERROR ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}
console.log('\ncontent model is consistent.');
