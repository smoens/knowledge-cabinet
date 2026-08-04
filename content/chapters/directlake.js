/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["directlake"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "Import mode copies the data on a schedule and queries the copy. DirectQuery keeps no copy and translates every question into SQL. Each buys one thing by giving up the other."
    },
    {
      "d": 1,
      "t": "p",
      "x": "[[direct-lake|Direct Lake]] does neither. It reads the Parquet columns a query actually needs, straight from the lake, into the same in-memory engine Import uses — and keeps them there."
    },
    {
      "d": 2,
      "t": "h",
      "x": "Why this is possible at all"
    },
    {
      "d": 2,
      "t": "p",
      "x": "Because both sides already store data the same way. Parquet is columnar and dictionary-encoded; VertiPaq is columnar and dictionary-encoded. The refresh step in Import mode existed to bridge a gap that, in this configuration, is not there."
    },
    {
      "d": 2,
      "t": "p",
      "x": "That is [[zero-copy]] reasoning arriving in a completely different domain — and it is the same argument as [[adbc|ADBC]] versus [[odbc|ODBC]], one layer up."
    },
    {
      "d": 2,
      "t": "h",
      "x": "Three things called refresh"
    },
    {
      "d": 2,
      "t": "list",
      "items": [
        "[[framing|Framing]] reads the Delta log and repoints the model at the current file version. Metadata only. Seconds.",
        "[[transcoding|Transcoding]] loads one column into memory, merging its per-file dictionaries. Happens on demand, per column.",
        "Import-style refresh copies everything on a schedule. This is the one Direct Lake removes."
      ]
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "Why is framing fast when refreshing a large table would be slow?",
      "a": "Framing only has to agree on which version is current. It reads the transaction log and repoints file references — it never touches the data.",
      "concept": "framing"
    },
    {
      "d": 3,
      "t": "h",
      "x": "Where V-Order re-enters"
    },
    {
      "d": 3,
      "t": "p",
      "x": "[[transcoding|Transcoding]] cost depends entirely on how far apart the two encodings are. A [[v-order|V-Ordered]], dictionary-encoded column is close to an ID remap. A plain-encoded or delta-encoded column must be re-encoded from scratch."
    },
    {
      "d": 3,
      "t": "p",
      "x": "That is the same law as the driver boundary: cost is set by the distance between representations, not by the volume crossing. The 40–60% cold-cache figure for V-Order is this sentence, measured."
    },
    {
      "d": 3,
      "t": "h",
      "x": "Warm, and the fallback cliff"
    },
    {
      "d": 3,
      "t": "p",
      "x": "A model moves through cold, semiwarm, warm and hot as columns are pulled in and stay resident. Framing evicts only the segments whose files actually changed, which is why an incremental change does not send you back to cold."
    },
    {
      "d": 3,
      "t": "p",
      "x": "The cliff is guardrails. Each SKU has published limits on rows per table and Parquet file count, and framing fails outright above 10,000 Parquet files. Breach one, and the model falls back to DirectQuery — the whole model, not the offending table."
    },
    {
      "d": 4,
      "t": "aside",
      "x": "A single table can silently change the performance characteristics of every other table in the model. Blast radius is a property of the fallback rule, not of the table."
    },
    {
      "d": 4,
      "t": "p",
      "x": "Which closes the arc: OPTIMIZE is not housekeeping here. File count is a guardrail input, so compaction is what keeps the model on the fast path at all. Three chapters, one dependency chain — layout, capacity, and the reader that sits on top of both."
    },
    {
      "d": 4,
      "t": "prompt",
      "q": "One table in a Direct Lake model exceeds its SKU guardrail. What happens to the other tables?",
      "a": "They fall back too. Fallback applies to the whole semantic model, so a single unmaintained table degrades every query in it.",
      "concept": "direct-lake"
    }
  ],
  "sources": [
    {
      "label": "Direct Lake overview",
      "url": "https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview",
      "note": "Mode comparison and the fallback rule."
    },
    {
      "label": "Understand storage for Direct Lake semantic models",
      "url": "https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-understand-storage",
      "note": "Transcoding, column loading, and the cold-to-hot progression."
    },
    {
      "label": "Manage Direct Lake semantic models",
      "url": "https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-manage",
      "note": "Framing, reframing, and the guardrail tables per SKU."
    }
  ]
};
