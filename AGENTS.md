# Knowledge Cabinet — agent instructions

A continuously evolving personal book. Static, dependency-free, no build step. Served from GitHub Pages at the repository root.

## What this repository is

| File | Role |
|---|---|
| `index.html` | Shell, SVG sprite, PWA head, service-worker registration. Rarely changes. |
| `content.js` | **The book.** Growth areas, concepts and fundamental patterns, chapters with depth-tagged blocks and source lists. This is the file you edit to change the book. |
| `app.js` | All behaviour: routing, the extent dial, the concept slip, catalogue encodings, rounds scheduling, register metrics. |
| `figures.js` | The explorables. Each exports `LB.<name>(mount)` and is referenced by a `figure` block. |
| `cabinet.css` | The whole visual world. Read `DESIGN.md` before touching it. |
| `sw.js` | Offline shell. Bump `SHELL` when any shell file changes. |

There is no bundler, no framework, and no package manifest. Classic `<script>` tags in order: `content.js`, `figures.js`, `app.js`. Everything must keep working from `file://`.

## The content model

`window.BOOK` has four collections.

**`areas[]`** — `{ id, name, ink, target }`. The five growth channels: `tech`, `comm`, `learn`, `mem`, `think`. Do not add a sixth without also adding a specimen plate symbol (`#sp-<id>`) to the sprite in `index.html` and an entry to `INK` in `app.js`.

**`concepts[]`** — `{ id, term, kind, area, short, fundamental, mechanism, seeAlso[], sources?[] }`

- `kind` is `'concept'` or `'pattern'`. A **pattern** is what survives when every domain noun is deleted; a **concept** is domain-bound. If the entry only makes sense inside one technology, it is a concept.
- `short` is one sentence, no hedging.
- `fundamental` states the transferable law. `mechanism` states how to use it tomorrow.
- `seeAlso` must reference existing concept ids. A dangling id renders as plain text and loses the link.

**`chapters[]`** — `{ id, title, area, state, added, revised, minutes, summary, supersededBy?, blocks[], sources[] }`

- `state` drives the cabinet wall: `new`, `live`, `evolving`, `retiring`. A `retiring` chapter should carry `supersededBy` pointing at the chapter that replaced it.
- `sources[]` entries are `{ label, url?, note? }`. **Omit `url` rather than guessing one.** A citation with no link renders as plain text; a fabricated link is a defect.

**`blocks[]`** — the body, in order.

- Every block carries `d: 1..4`. It appears when the reader's extent dial is at or above that depth. 1 SPINE (the claim and nothing else), 2 WORKING (enough to use it tomorrow), 3 FULL (mechanism, figures, prompts), 4 SOURCE (caveats, code, provenance).
- `t` is one of `p`, `h`, `list`, `aside`, `code`, `figure`, `prompt`.
- Inline links use `[[concept-id]]` or `[[concept-id|display text]]`.
- A `prompt` block is `{ q, a, concept }` and feeds spaced repetition. `concept` must be a real concept id.

## Adding a chapter

1. Append to `chapters[]` in `content.js`.
2. Write blocks at all four depths. A chapter that only exists at depth 3 defeats the dial.
3. Every named idea gets a `concepts[]` entry and an inline `[[id]]` mention. A concept with no mention shows as *held by its links only* in the catalogue — acceptable for a supporting term, wrong for the chapter's subject.
4. Include at least one `prompt` block, and at least one real source.
5. Bridge to existing concepts through `seeAlso`. The point of the book is that queueing theory sits next to memory research; a chapter that links only to its own new terms has failed.

## Retiring a chapter

Set `state: 'retiring'` and `supersededBy: '<id>'`. Do not delete it. A retired chapter that once shaped your thinking is evidence about how your thinking changed.

## Adding a figure

Export `LB.<name> = function (mount) {...}` in `figures.js`, then reference it with `{ d: 3, t: 'figure', fig: '<name>', caption: '...' }`.

Figures must model something honestly and print their constants next to the result. No decorative charts.

## House rules

- Do not invent numbers. Where a source does not publish a figure, say so in the prose.
- Do not add dependencies, a build step, or a framework.
- Do not hard-wrap prose at a fixed column in Markdown.
- After editing `app.js`, `content.js` or `figures.js`, run `node --check` on each.
- After changing any shell file, bump `SHELL` in `sw.js`.

## Design

`DESIGN.md` holds the visual world: walnut cabinetwork, brass hairline fittings, baize-green linings, one warm ivory reading table. Read it before changing `cabinet.css`. Refinement preserves that world; it is not up for reinterpretation without an explicit decision.
