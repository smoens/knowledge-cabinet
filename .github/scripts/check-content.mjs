/* Integrity check for the content model. Catches the mistakes that are silent
   in the browser: a dangling seeAlso, a [[link]] to a concept that does not
   exist, a prompt scheduled against a missing id, a figure with no renderer,
   a chapter with a hole in its depth ladder. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../../', import.meta.url));
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(readFileSync(root + 'content.js', 'utf8'), ctx);

const BOOK = ctx.window.BOOK;
const figSrc = readFileSync(root + 'figures.js', 'utf8');

const errors = [];
const warn = [];

const areas = new Set(BOOK.areas.map(a => a.id));
const concepts = new Map(BOOK.concepts.map(c => [c.id, c]));
const chapters = new Map(BOOK.chapters.map(c => [c.id, c]));
const mentioned = new Set();

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
  for (const b of ch.blocks) {
    if (!(b.d >= 1 && b.d <= 4)) errors.push(`chapter ${ch.id}: block depth ${b.d} out of range`);
    depths.add(b.d);
    if (b.t === 'figure') {
      if (!new RegExp(`LB\\.${b.fig}\\s*=`).test(figSrc)) {
        errors.push(`chapter ${ch.id}: figure "${b.fig}" has no renderer in figures.js`);
      }
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
