/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["boundary"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "A query returns in 200 ms. Your notebook shows the result nine seconds later. Nothing in the query plan explains it, nothing in the network trace explains it, and adding cores to either end changes almost nothing."
    },
    {
      "d": 1,
      "t": "p",
      "x": "The time is going into the boundary. The engine holds columns; your client wants rows of language-native objects. The gap between those two shapes is an [[impedance-mismatch]], and it is paid per value."
    },
    {
      "d": 2,
      "t": "h",
      "x": "Per value, not per byte"
    },
    {
      "d": 2,
      "t": "p",
      "x": "This is the detail that makes the arithmetic surprising. [[serialization]] cost tracks the number of values, not the number of bytes. Ten million rows of six narrow integer columns is sixty million conversions, and every one of them is a function call, a type check, and usually an allocation."
    },
    {
      "d": 2,
      "t": "p",
      "x": "A wide table of long strings can move faster than a narrow table of small integers carrying the same total bytes. Once you have seen that once, the boundary stops being invisible."
    },
    {
      "d": 3,
      "t": "figure",
      "fig": "transfer",
      "caption": "Move the slider. Row-at-a-time crosses the boundary once per value; columnar batches cross it once per batch. The counters are the honest part — watch conversions, not the bar."
    },
    {
      "d": 2,
      "t": "h",
      "x": "Why the old interface is built this way"
    },
    {
      "d": 2,
      "t": "p",
      "x": "[[odbc]] was designed in 1992, for transactional work, on machines where a result set was tens of rows and memory was the scarce resource. Its transfer unit is the [[cursor|row cursor]]: you bind application variables to columns and the driver fills them as you advance."
    },
    {
      "d": 3,
      "t": "p",
      "x": "For “fetch this customer record”, that is exactly right. For “fetch this fact table”, it means the interface itself is the bottleneck, and no driver can optimise its way out of a contract that says one row at a time."
    },
    {
      "d": 3,
      "t": "aside",
      "x": "Interfaces outlive the hardware assumptions they were designed against. Reading an old API well means reading it as an artefact of its constraints, not as a mistake."
    },
    {
      "d": 1,
      "t": "p",
      "x": "[[adbc]] does not make the translation faster. It removes the disagreement: the driver hands back [[arrow|Arrow]] record batches, and if the engine already speaks Arrow, no value is converted anywhere in the path. That is [[zero-copy]]."
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "Two tables carry the same total bytes. One is narrow and numeric, the other wide with long strings. Which crosses a row-at-a-time boundary faster, and why?",
      "a": "The wide string table. Conversion cost scales with the number of values, not bytes, so the narrow numeric table has far more per-value work despite the identical volume.",
      "concept": "serialization"
    },
    {
      "d": 3,
      "t": "h",
      "x": "The generalisation"
    },
    {
      "d": 3,
      "t": "p",
      "x": "Strip the database nouns out and what remains is this: when two components disagree about representation, the cost of the boundary grows independently of either side, so optimising either side has diminishing returns. That is why this chapter is filed under [[layout-is-interface]] and not under drivers."
    },
    {
      "d": 3,
      "t": "p",
      "x": "The same shape appears between services that re-encode JSON at every hop, between a GPU and a host that keep different tensor layouts, and between two teams whose models of the same customer disagree by one field."
    },
    {
      "d": 4,
      "t": "code",
      "lang": "python",
      "x": "conn = adbc_driver_postgresql.dbapi.connect(uri)\ncur = conn.cursor()\ncur.execute(\"select * from facts where day = ?\", (day,))\n\n# arrow batches out; no per-value conversion in this path\ntable = cur.fetch_arrow_table()\ndf = table.to_pandas(zero_copy_only=True)   # raises if a copy is required"
    },
    {
      "d": 4,
      "t": "p",
      "x": "Keeping `zero_copy_only=True` on during exploration is worth the noise. It turns a silent copy into a loud error, which is the only reliable way to discover that one nullable integer column quietly forced a full materialisation."
    },
    {
      "d": 4,
      "t": "prompt",
      "q": "What does L = λW let you rule out before you start tuning a pipeline?",
      "a": "Any pair of targets that fixes the third at an impossible value — for example a required throughput and a concurrency cap that together demand a latency the system cannot reach.",
      "concept": "littles-law"
    }
  ],
  "sources": [
    {
      "label": "Arrow Database Connectivity (ADBC)",
      "url": "https://arrow.apache.org/adbc/",
      "note": "The interface that removes the conversion rather than speeding it up."
    },
    {
      "label": "Apache Arrow columnar format specification",
      "url": "https://arrow.apache.org/docs/format/Columnar.html",
      "note": "The agreement that makes zero-copy possible at all."
    },
    {
      "label": "Wes McKinney — Apache Arrow and the “10 things I hate about pandas”",
      "url": "https://wesmckinney.com/blog/apache-arrow-pandas-internals/",
      "note": "The original argument for fixing the boundary instead of the endpoints."
    }
  ]
};
