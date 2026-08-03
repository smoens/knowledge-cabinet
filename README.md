# Knowledge Cabinet

A personal book that never finishes. Chapters arrive and retire, extent is a dial rather than a search, any term can be pulled apart into the fundamental underneath it, and what you read comes back for a condition check.

**Read it: <https://smoens.github.io/knowledge-cabinet/>**

Install it from Safari or Chrome — *Share → Add to Home Screen* — and it opens full-screen and works offline. Everything you read is stored on that device only.

## Run it locally

```
python -m http.server 8899
```

Then open <http://127.0.0.1:8899/>. Opening `index.html` directly from the filesystem also works — there is no build step, no bundler, and no network dependency: the three typefaces are self-hosted in `fonts/`.

## What is real, and what is staged

Real:

- **Chapter lifecycle.** Every drawer carries a state (`new`, `evolving`, `live`, `retiring`). New and revised drawers stand half-open on their baize. The retiring one is struck through and names its successor. Adding or retiring a chapter is an edit to `content.js` only — no markup names a chapter anywhere.
- **The extent dial.** Every block is tagged 1–4. The dial re-lays the chapter rather than hiding things: SPINE is the load-bearing claims, WORKING is enough to use it tomorrow, FULL adds mechanism and figures, SOURCE adds code and caveats. Keys `1`–`4` work while reading.
- **Importance made visible.** Weight is computed at load from mention frequency, how many drawers name a term, and how many other specimens hang off it. Inline it is encoded in the underline; in the catalogue you can switch between four encodings — size, lamplight, engraving, and a thread map — because there is no one right way to make importance legible.
- **Drilldown from any selection.** Highlight anything in the reading column and the loupe appears. "Drill down" matches the catalogue; if there is no entry it opens a provisional one, which is the honest state for a phrase you noticed but have not earned yet.
- **Bidirectional links.** Derived at load from the `[[concept]]` markup plus declared `seeAlso`. A slip shows both the drawers that name it and the specimens that name it back.
- **Spaced repetition.** SM-2 with the corners taken off. Prompts sit inside the prose; keeping one files it. Highlights and catalogue entries can be filed too. Rounds are the same loop, not a second app.
- **Metrics.** Time at the table, passages read, drawers opened, specimens met, attention split by growth area, an eight-week strip, and a movement log. All local, wipeable from the register.
- **Four explorables.** Boundary crossings (row-at-a-time versus columnar), utilization against wait, retention against a review schedule, and a capacity burst being smoothed across a day until it crosses the throttling stages. Each prints its model constants next to the result.

Staged, and deliberately so:

- Content is authored in `content.js`. There is no authoring UI and no runtime generation of new chapters.
- Recommended sources are static links, not a live recommender.
- Everything persists to `localStorage` on one device. No accounts, no sync.
- Figure constants are illustrative and labelled as such. They are the right shape, not measurements.

## Files

| File | What it holds |
|---|---|
| `content.js` | All content: five growth areas, fifty-one concepts and fundamental patterns, twelve chapters with depth-tagged blocks, each carrying its own source list. The only file you edit to change the book. |
| `index.html` | Shell, the SVG sprite of specimen plates and icons, and the direction contract. |
| `cabinet.css` | The whole visual world — tokens, cabinet, reading table, catalogue encodings, rounds, register. |
| `figures.js` | The four explorables. |
| `sw.js` | The offline shell. Bump `SHELL` when any shell file changes. |
| `app.js` | Routing, rendering, weight computation, extent, drilldown, scheduling, metrics, persistence. |
| `fonts/` | Bricolage Grotesque, Literata and Azeret Mono, latin subset, self-hosted. All three are SIL Open Font License 1.1. |

## Adding a chapter

See [`AGENTS.md`](AGENTS.md) for the content model and [`.github/skills/chapter-authoring/SKILL.md`](.github/skills/chapter-authoring/SKILL.md) for the procedure.

The short version: append to `BOOK.chapters` in `content.js`, write blocks at all four depths, give every named idea a `concepts[]` entry and an inline `[[id]]` mention, bridge to concepts already in the book through `seeAlso`, and cite what you read. To retire a chapter, set `state: ''retiring''` and `supersededBy` — never delete it.

Then check the model holds together:

```
node .github/scripts/check-content.mjs
```

## Automation

Two agentic workflows, both manual-only, read-only, and staged — nothing is applied without you.

| Workflow | What it does |
|---|---|
| **Cabinet survey** | Surveys the whole book for orphan concepts, depth holes, missing bridges between growth areas, retirement candidates, and unsourced claims. Stages one issue. |
| **Chapter proposal** | Takes a topic and stages an outline: the claim, the depth ladder, concepts to add, bridges to existing entries, prompts, and sources to verify. |

Sources are `.github/workflows/*.md`; the `.lock.yml` files beside them are compiler output — run `gh aw compile` after editing front matter, never edit a lock by hand.

Both use the Copilot engine and need a `COPILOT_GITHUB_TOKEN` repository secret before their first run.

## Keyboard

`r` pulls a drawer at random · `1`–`4` set extent while reading · `Esc` closes a catalogue slip.