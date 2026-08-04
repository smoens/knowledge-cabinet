/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["vorder"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "Parquet already stores values [[columnar|by column]]. [[v-order|V-Order]] goes further: it arranges the sorting, encoding and compression inside each file to match what the Power BI in-memory engine expects to find."
    },
    {
      "d": 1,
      "t": "p",
      "x": "The files stay open Parquet — any reader can still open them. What changes is that one particular reader no longer has to translate."
    },
    {
      "d": 2,
      "t": "h",
      "x": "The trade, stated honestly"
    },
    {
      "d": 2,
      "t": "list",
      "items": [
        "Writes cost roughly 15% more, and 15–33% more under Spark.",
        "Files compress up to 50% better, so storage and network both fall.",
        "[[direct-lake|Direct Lake]] cold-cache reads improve by 40–60%.",
        "The SQL analytics endpoint gains about 10%.",
        "Spark reads gain nothing at all."
      ]
    },
    {
      "d": 2,
      "t": "p",
      "x": "That last line is the one that makes the pattern legible. This is [[amortization]] with a named beneficiary — and if your reader is not that beneficiary, you are paying the write premium for nothing."
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "Bronze layer, ingest-heavy, read almost exclusively by Spark. Should V-Order be on?",
      "a": "No. You would pay 15–33% on every write for a read gain that Spark does not receive. Turn it on in the gold layer, where the reader is the semantic model.",
      "concept": "medallion"
    },
    {
      "d": 2,
      "t": "h",
      "x": "Defaults disagree, and the disagreement is informative"
    },
    {
      "d": 2,
      "t": "p",
      "x": "V-Order is off by default in new Fabric workspaces, and on by default in Warehouse. Same feature, opposite default, because the expected reader differs. A default is a statement about the median case, not about your case."
    },
    {
      "d": 3,
      "t": "h",
      "x": "The file-count problem underneath"
    },
    {
      "d": 3,
      "t": "p",
      "x": "Encoding is only half of layout. The other half is file size, and streaming ingestion produces a lot of small files. Each one carries footer parsing, a metadata round-trip and its own [[row-group|row groups]] and dictionaries — overhead that is fixed per file and therefore ruinous when files are tiny."
    },
    {
      "d": 3,
      "t": "p",
      "x": "OPTIMIZE rewrites them into fewer, larger files. Its default target is 1 GB, while Spark’s own write default is 128 MB, which is a sizeable gap and the reason compaction is a separate deliberate act rather than a side effect."
    },
    {
      "d": 3,
      "t": "p",
      "x": "Compaction is [[write-amplification]] bought on purpose: you rewrite far more bytes than changed, to make every future read cheaper. VACUUM then removes the files the [[delta-lake|Delta log]] no longer references, with a default retention of 7 days — which is also the length of the time-travel window you are giving up."
    },
    {
      "d": 4,
      "t": "code",
      "lang": "sql",
      "x": "-- Fabric Spark SQL\nSET spark.sql.parquet.vorder.default = true;\n\nOPTIMIZE gold.sales VORDER;\n\n-- reclaim, and shorten the time-travel window in the same breath\nVACUUM gold.sales RETAIN 168 HOURS;"
    },
    {
      "d": 4,
      "t": "aside",
      "x": "Three settings, one question: who reads this table, and how often relative to how often it is written? Every layout decision in this chapter falls out of that ratio."
    },
    {
      "d": 4,
      "t": "prompt",
      "q": "VACUUM’s retention default is 7 days. What exactly are you shortening when you lower it?",
      "a": "The time-travel window. Retention is not a cleanup aggressiveness dial — it is the guarantee that older table versions are still readable.",
      "concept": "delta-lake"
    }
  ],
  "sources": [
    {
      "label": "Delta Lake table optimization and V-Order",
      "url": "https://learn.microsoft.com/en-us/fabric/data-engineering/delta-optimization-and-v-order",
      "note": "Source of the write-overhead, compression and read-gain figures, and of the per-engine breakdown."
    },
    {
      "label": "Delta Lake table maintenance in Fabric",
      "url": "https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-table-maintenance",
      "note": "OPTIMIZE and VACUUM defaults."
    },
    {
      "label": "Apache Parquet file format specification",
      "url": "https://parquet.apache.org/docs/file-format/",
      "note": "What a row group actually is, underneath all of the above."
    }
  ]
};
