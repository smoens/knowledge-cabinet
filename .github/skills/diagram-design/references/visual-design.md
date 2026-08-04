# Visual design for custom SVG/HTML diagrams

Principles for the *rendering*, once the diagram type is chosen. Applies whether the output is static SVG or interactive HTML/JS.

## Derived principles

1. **Maximize data-ink ratio.** Every line, box, gridline, and gradient must earn its place by carrying information the reader needs. Delete: 3D bevels, drop shadows, decorative gridlines, redundant legends when direct labels fit. (Tufte, *The Visual Display of Quantitative Information*.)
2. **Label directly on the mark, not in a separate legend, whenever there are ≤6 series.** A legend forces the reader's eye to travel back and forth; a direct label at the line/bar's end does not. Fall back to a legend only past ~6 series or when direct labels would collide.
3. **One accent color for the point of the diagram; everything else in a muted neutral.** Color should mean something (highlight, category, sequence) — never decorate. If two things are the same color, they must be the same *kind* of thing.
4. **Typography carries hierarchy before size or color does.** A title states the finding, not the chart type ("Revenue grew 3x since Q1", not "Revenue Over Time"). Subtitle carries the scope/unit. Axis labels are the smallest, quietest text on the page.
5. **State the honest scale.** Bar charts start at zero unless the deviation from zero is explicitly called out; truncated axes get an explicit break mark or an explicit caption note, never a silent gap.
6. **Interactivity is earned, not decorative.** Add hover/zoom/filter only when the reader genuinely needs to explore (large N, drill-down, comparison across a dimension too large to show all at once statically). If a static image answers the question, ship a static image — interaction that doesn't change what the reader learns is overhead. This determines SVG-only vs HTML+JS.
7. **Every diagram should print its own constants/assumptions next to the result** when it encodes a model or simplification (matches this repo's figure-authoring rule in `AGENTS.md`) — no diagram should imply more precision or certainty than the underlying data supports.
8. **Whitespace is a structural element, not empty space.** Group related marks with proximity before reaching for borders/boxes (Gestalt proximity principle) — a box around a group is the last resort, not the first.
9. **Respect the surrounding design system.** In this repository, that means the walnut/brass/baize/ivory palette and typographic rules in `DESIGN.md` — do not introduce a competing visual language for a diagram embedded in the book.
10. **Prefer numbered callouts placed directly on the artifact over leader lines to a distant legend.** A pin/dot sitting on the feature itself, paired with a separately-listed numbered key, reads cleanly at any zoom. Diagonal or dashed leader lines connecting scattered callouts to a legend elsewhere on the page cross each other and clutter the diagram — avoid them; proximity numbering is a full substitute, not a compromise.
11. **Put the visual and its numbered explanation side by side when the container is wide enough; stack only when it isn't.** Use a responsive layout (e.g. an auto-fit/minmax CSS grid) so the figure and its key sit in two columns on a wide viewport and fall back to one column stacked vertically on a narrow one — do not hard-code a single stacked layout by default.
12. **Size the SVG `viewBox` to the aspect ratio of where it will actually render**, not an arbitrary landscape default. A wide diagram squeezed into a narrow panel shrinks its internal text disproportionately to any external HTML captions (which use fixed CSS units and don't scale with the SVG) — match the viewBox proportions to the real container, or keep captions inside the SVG so everything scales together.
13. **Always render the diagram before calling it done**, not just author the markup. Open it in an actual browser/canvas at the real target size and check: is every label legible, does every callout number have a visible, findable explanation, and do any elements overlap? Fix what you see, don't assume the markup is correct because it validates.

## Sources

- Edward Tufte, *The Visual Display of Quantitative Information* (Graphics Press, 1983) — data-ink ratio, chartjunk.
- Stephen Few, *Show Me the Numbers* (Analytics Press, 2004) — direct labeling, table vs. chart judgment.
- Cole Nussbaumer Knaflic, *Storytelling with Data* (Wiley, 2015) — title-as-finding, decluttering practice.
- Alberto Cairo, *The Truthful Art* (New Riders, 2016) — honest scale, avoiding visual lies.
- Gestalt principles of visual perception (proximity, similarity, continuity) as applied to information design — summarized in Few and in Ware, *Visual Thinking for Design* (Morgan Kaufmann, 2008).
- This repository's `DESIGN.md` and `AGENTS.md` (figure-authoring rule: "print constants next to the result").
- Principles 10–13 are derived from practice: iterating on a component/anatomy diagram of this repo's own cabinet-wall UI surfaced each pitfall directly (leader-line clutter, a stacked layout wasting a wide panel, a landscape viewBox illegible in a narrow one, and an unverified render that looked fine as markup but not on screen).
