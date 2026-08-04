---
name: diagram-design
description: "Choose the right diagram type for a question and produce a custom-styled, well-designed diagram for it. Use when the user asks what chart or diagram to use for some data or a question, wants a chart, flowchart, ER diagram, data flow diagram (DFD), sequence diagram, state diagram, C4/architecture diagram, org chart, or Gantt chart built, wants an existing diagram redesigned or critiqued, or asks to visualize data, a process, a schema, or a system. Produces custom SVG for static diagrams and HTML/JS only when real interactivity (drill-down, filter, hover detail) is needed. Do NOT use for general edits to cabinet.css or the book's visual design system as a whole (see DESIGN.md) - only for the diagram content itself. Do NOT use for writing chapter prose or picking concepts (see chapter-authoring), though this skill may be invoked from within that workflow when a chapter needs a figure."
metadata:
  version: "0.1.0"
---

# Diagram design

Picks the diagram family that matches the reader's question, then renders it with deliberate visual design. Two different problems live under "which diagram": statistical/data questions (comparison, distribution, relationship...) and structural/systems questions (ERD, DFD, flowchart, sequence, architecture...). Treat them separately — a decision tree built for charts will misroute a schema question, and vice versa.

## Load

Read only the reference file(s) that match the question type:

- `references/chart-selection.md` — statistical/data questions (comparing, distributing, relating, composing, tracking over time, mapping spatially).
- `references/structural-diagrams.md` — structural/systems questions (ER diagrams, DFDs, flowcharts, sequence/state diagrams, C4 architecture).
- `references/visual-design.md` — always read this once a diagram family is chosen; it governs how the chosen diagram gets rendered.

## Procedure

1. **Classify the question first, not the data.** Ask: is this "what does the data show" (→ chart-selection.md) or "how is the system/process/schema structured" (→ structural-diagrams.md)? Many requests are ambiguous ("show me how orders flow") — clarify with the user if it's genuinely unclear whether they want a DFD (data movement) or a flowchart (control flow/decision steps).
2. **Pick the specific diagram type** from the matching decision table, driven by the comparison or relationship the reader needs to see — not by what data happens to be available.
3. **Decide static vs. interactive**, per the interactivity principle in `visual-design.md`: only add interaction the reader genuinely needs to explore. Default to static SVG.
4. **Build it as custom SVG (or HTML/JS if interactive), not a generic charting-library default theme.** Apply every applicable principle from `visual-design.md`: data-ink ratio, direct labeling, one accent color, title-as-finding, honest scale, and (if embedding in this book) the walnut/brass/baize/ivory palette from `DESIGN.md`.
5. **State assumptions/constants next to the diagram** if it encodes a model or simplification, per this repo's figure rule in `AGENTS.md`.
6. **Validate before calling it done:** does the diagram answer the original question in the time it takes to glance at it? If the reader has to study a legend or re-derive an axis to get the point, go back to step 2 or 4.
7. If embedding in a Knowledge Cabinet chapter, follow the figure-authoring step in `AGENTS.md`/`chapter-authoring`: export `LB.<name>(mount)` in `figures/<name>.js`, reference it via a `{ d: 3, t: 'figure', fig: '<name>' }` block, and run `node --check` on the new file.

## Output

The chosen diagram (SVG markup, or an HTML/JS snippet for the interactive case), plus a one-line note naming which diagram family was chosen and why — so the choice is auditable, not just asserted.
