# Knowledge Cabinet — agent instructions

A continuously evolving personal book. Static, dependency-free, no build step. Served from GitHub Pages at the repository root.

## What this repository is

| File | Role |
|---|---|
| `index.html` | Shell, SVG sprite, PWA head, service-worker registration. Rarely changes. |
| `content.js` | **The startup index.** Areas, compact concept entries, chapter metadata, concept references and mention frequency. |
| `content/concepts/<area>.js` | Catalogue detail for one growth area, loaded when a reader opens a matching concept slip. |
| `content/chapters/<id>.js` | Chapter bodies and sources, one file per drawer, loaded when read. |
| `app.js` | All behaviour: routing, the extent dial, the concept slip, catalogue encodings, rounds scheduling, register metrics. |
| `figures.js` | Shared helpers for explorables. |
| `figures/<name>.js` | An explorable renderer exporting `LB.<name>(mount)`, loaded only when its figure appears. |
| `cabinet.css` | The whole visual world. Read `DESIGN.md` before touching it. |
| `sw.js` | Offline shell. Bump `SHELL` when any shell file changes. |

There is no bundler, no framework, and no package manifest. Classic deferred scripts load `content.js`, `figures.js`, then `app.js`; deferred chapter and figure scripts are appended at runtime. Everything must keep working from `file://`.

## The content model

`window.BOOK` is the startup index. It carries the data needed to render the cabinet without downloading chapter prose.

**`areas[]`** — `{ id, name, ink, target }`. The five growth channels: `tech`, `comm`, `learn`, `mem`, `think`. Do not add a sixth without also adding a specimen plate symbol (`#sp-<id>`) to the sprite in `index.html` and an entry to `INK` in `app.js`.

**`concepts[]`** — `{ id, term, kind, area, short, seeAlso[] }`

- `kind` is `'concept'` or `'pattern'`. A **pattern** is what survives when every domain noun is deleted; a **concept** is domain-bound. If the entry only makes sense inside one technology, it is a concept.
- `short` is one sentence, no hedging.
- `seeAlso` must reference existing concept ids. A dangling id renders as plain text and loses the link.

**`content/concepts/<area>.js`** adds that area's concept ids to `window.CABINET_CONCEPT_DETAILS`, mapping each to `{ fundamental, mechanism, sources? }`.

- `fundamental` states the transferable law. `mechanism` states how to use it tomorrow.

**`chapters[]`** — `{ id, title, area, state, added, revised, minutes, summary, supersededBy?, concepts[], workingBlockCount, chunk }`

- `state` drives the cabinet wall: `new`, `live`, `evolving`, `retiring`. A `retiring` chapter should carry `supersededBy` pointing at the chapter that replaced it.
- `concepts` is the unique ordered list of concept ids mentioned by that chapter. `workingBlockCount` is the count of its blocks at depths 1–3. `chunk` is always `content/chapters/<id>.js`.
- `frequency` at the root of `window.BOOK` counts every inline link and prompt concept across all chapter bodies.

**`content/chapters/<id>.js`** registers `{ blocks[], sources[] }` under `window.CABINET_CHAPTERS['<id>']`. Sources are `{ label, url?, note? }`; **omit `url` rather than guessing one.**

**`blocks[]`** are the chapter body, in order.

- Every block carries `d: 1..4`. It appears when the reader's extent dial is at or above that depth. 1 SPINE (the claim and nothing else), 2 WORKING (enough to use it tomorrow), 3 FULL (mechanism, figures, prompts), 4 SOURCE (caveats, code, provenance).
- `t` is one of `p`, `h`, `list`, `aside`, `code`, `figure`, `prompt`.
- Inline links use `[[concept-id]]` or `[[concept-id|display text]]`.
- A `prompt` block is `{ q, a, concept }` and feeds spaced repetition. `concept` must be a real concept id.

## Adding a chapter

1. Add the chapter body and sources to `content/chapters/<id>.js`, with blocks at all four depths. A chapter that only exists at depth 3 defeats the dial.
2. Add its drawer metadata to `chapters[]` in `content.js`, including the chapter's unique, in-order `concepts`, its 1–3 `workingBlockCount`, and its chunk path.
3. Every named idea gets a compact `concepts[]` entry in `content.js`, a full entry in `content/concepts/<area>.js`, and an inline `[[id]]` mention. A concept with no mention shows as *held by its links only* in the catalogue — acceptable for a supporting term, wrong for the chapter's subject.
4. Update root `frequency` for every inline link and prompt concept. Do not guess: `node .github/scripts/check-content.mjs` rejects stale index data.
5. Include at least one prompt block, and at least one real source. Bridge to existing concepts through `seeAlso`. The point of the book is that queueing theory sits next to memory research; a chapter that links only to its own new terms has failed.

## Retiring a chapter

Set `state: 'retiring'` and `supersededBy: '<id>'`. Do not delete it. A retired chapter that once shaped your thinking is evidence about how your thinking changed.

## Adding a figure

Export `LB.<name> = function (mount) {...}` in `figures/<name>.js`, then reference it with `{ d: 3, t: 'figure', fig: '<name>', caption: '...' }`.

Figures must model something honestly and print their constants next to the result. No decorative charts.

## House rules

- Do not invent numbers. Where a source does not publish a figure, say so in the prose.
- Do not add dependencies, a build step, or a framework.
- Do not hard-wrap prose at a fixed column in Markdown.
- After editing JavaScript, run `node --check` on every changed `.js` file and `node .github/scripts/check-content.mjs`.
- After changing any shell file, bump `SHELL` in `sw.js`. Bump `CONTENT` only when the runtime chunk schema changes incompatibly.

## Design

`DESIGN.md` holds the visual world: walnut cabinetwork, brass hairline fittings, baize-green linings, one warm ivory reading table. Read it before changing `cabinet.css`. Refinement preserves that world; it is not up for reinterpretation without an explicit decision.
