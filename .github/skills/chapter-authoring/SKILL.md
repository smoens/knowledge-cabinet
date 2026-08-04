---
name: chapter-authoring
description: Draft, revise, or retire a chapter in the Knowledge Cabinet, including its concepts, depth-tagged blocks, spaced-repetition prompts, cross-links, and verified sources. Use when the user wants to add content to the book, turn an article or a set of docs into a chapter, add a concept or fundamental pattern to the catalogue, deepen an existing chapter, bridge new material to concepts already in the book, or mark a chapter as superseded. Do NOT use for changing the visual design (see DESIGN.md), for editing app behaviour in app.js, or for building a new explorable figure alone.
---

# Authoring a chapter

Read `AGENTS.md` first for the content model. This skill is the procedure.

## 1. Decide what the chapter actually is

A chapter earns its place by carrying one transferable idea, not by covering a topic. Write the one-sentence claim before anything else. If the claim is a fact about a product, keep digging until it is a fact about a class of systems.

The `summary` field is that claim, stated so it reads well on a closed drawer.

## 2. Gather sources before writing

Every number in the chapter must come from a source you actually read. Record each as `{ label, url?, note? }`.

- Prefer canonical documentation and primary papers over secondary summaries.
- **Omit `url` when you are not certain the link resolves.** A citation with no link is honest; a fabricated link is a defect that survives into a reader's trust.
- Where a source declines to publish a figure, say so in the prose rather than estimating.

## 3. Write at four depths, deliberately

The extent dial is the product. Each depth must stand alone as a complete reading.

| `d` | Name | What belongs here |
|---|---|---|
| 1 | Spine | The claim and the single mechanism that makes it true. A reader who stops here has the idea. |
| 2 | Working | Enough to act on tomorrow: the trade, the numbers that matter, one prompt. |
| 3 | Full | Mechanism, figures, the generalisation, the counterweight. |
| 4 | Source | Caveats, code, the exceptions, provenance-grade detail. |

Failure modes: a chapter whose depth-1 blocks are an introduction rather than the claim; a chapter with nothing at depth 4; a chapter where depth 3 repeats depth 2 at greater length.

## 4. Name every idea, then catalogue it

Every idea the chapter leans on gets a compact `concepts[]` entry in `content.js`, a full entry in `content/concepts/<area>.js`, and at least one inline `[[id]]` mention in its chapter body.

For each concept write:

- `short` — one sentence, no hedging.
- `fundamental` — the law that survives deleting every domain noun. This is the field that makes the book worth having.
- `mechanism` — how to use it tomorrow.

Classify honestly. `kind: 'pattern'` only if it genuinely transfers out of the domain.

## 5. Bridge to what is already in the cabinet

Before finishing, scan the existing `concepts[]` and find the ones this material rhymes with. Add them to `seeAlso` in both directions where the link is real.

A chapter that links only to its own new terms has failed the premise of the book.

## 6. Add prompts

At least one `prompt` block, ideally one per depth from 2 onward. A good prompt asks the reader to *apply* the idea to a case the chapter did not cover. A prompt that can be answered by recalling a sentence verbatim is wasted.

`concept` on the prompt must be a real concept id — it is what schedules the review.

## 7. Verify

```
node .github/scripts/check-content.mjs
find content figures -name '*.js' -print0 | xargs -0 -n1 node --check
node --check content.js && node --check figures.js && node --check app.js && node --check sw.js
```

Then open `index.html` and check:

- The chapter appears on the cabinet wall with the right state and specimen plate.
- Every `[[link]]` renders as a link, not as literal brackets.
- Each depth reads as a complete chapter on its own.
- The provenance section at the bottom lists the sources.
- Any new concept shows a sensible weight in the catalogue rather than *held by its links only*.

## Retiring

Set `state: 'retiring'` and `supersededBy`. Rewrite the `summary` to say what the framing got wrong. Keep the blocks. Never delete a chapter.
