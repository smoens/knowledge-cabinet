# Chart selection (statistical / data questions)

Use this table when the question is about **data** — numbers, categories, records — not about a system's structure or process.

## Decision table

| The question is about... | Diagram family | Specific forms |
|---|---|---|
| Comparing values across categories | Comparison | Bar, grouped bar, dot plot, bullet chart |
| Comparing few items over time | Comparison over time | Line, slope chart |
| How one measure is spread out | Distribution | Histogram, box plot, violin, strip plot |
| How two or more measures relate | Relationship | Scatter, bubble, connected scatter |
| How parts make up a whole | Composition (static) | Stacked bar, treemap, waffle |
| How composition changes over time | Composition (time) | Stacked area, streamgraph (use sparingly) |
| How a quantity changes over time | Time series | Line, area, candlestick |
| Where something happens | Spatial | Choropleth, proportional symbol, dot density |
| Flow/magnitude between categories | Flow | Sankey, chord diagram |
| A single ranked list | Ranking | Ordered bar, bump chart |

## Derived principles (not just "which chart")

1. **Match the chart to the comparison the reader must make, not to the data type.** Two columns of numbers can be a bar chart, a line chart, or a table — the deciding factor is whether the reader needs to compare magnitude (bar), see a trend (line), or look up an exact value (table). (FT Visual Vocabulary; Abela's Chart Chooser both organize by *reader intent*, not data shape — this is the single most-skipped step.)
2. **Pie charts answer "what fraction of the whole" for ≤3–4 categories only.** Beyond that, humans can't compare angles reliably — use a bar or treemap instead. (Few, *Show Me the Numbers*.)
3. **Never use 3D, dual independent y-axes without explicit note, or truncated bar axes.** These are the three most common ways a chart lies about magnitude even when the underlying numbers are correct. (Cairo, *The Truthful Art*; Fung, *Junk Charts*.)
4. **Streamgraphs and radar/spider charts are almost always a worse version of something else** (stacked area, grouped bar) — reach for them only when the shape itself carries meaning, not by default. (Schwabish, *Better Data Visualizations*.)
5. **A table beats a chart when the reader needs an exact value; a chart beats a table when the reader needs a pattern.** Don't chart a table's worth of precision requirements.
6. **Order categorical axes by value, not alphabetically**, unless alphabetical order is itself the point (e.g. a lookup reference).

## Sources

- FT Visual Vocabulary — ft.com/visual-vocabulary — chart-selection poster organized by comparison/distribution/relationship/composition/time/spatial.
- Andrew Abela, Chart Chooser — extremepresentation.com — decision-tree framing ("what do you want to show?").
- datavizcatalogue.com and data-to-viz.com — per-chart "when to use / when to avoid" notes.
- Jon Schwabish & Severino Ribecca, The Graphic Continuum — poster spanning simple to complex chart forms.
- Jon Schwabish, *Better Data Visualizations* (Columbia University Press, 2021).
- Cole Nussbaumer Knaflic, *Storytelling with Data* (Wiley, 2015).
- Alberto Cairo, *The Truthful Art* (New Riders, 2016).
- Stephen Few, *Show Me the Numbers* (Analytics Press, 2004).
- Kaiser Fung, Junk Charts blog — junkcharts.typepad.com — critiques of specific failed charts.
