/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["layout"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "You never fetch a value from memory. You fetch its neighbourhood — a [[cache-line]], typically 64 bytes. Whether the other 63 bytes are useful was decided by a layout choice made long before the read."
    },
    {
      "d": 1,
      "t": "p",
      "x": "[[row-oriented|Row layout]] bets you want whole records. [[columnar|Column layout]] bets you want whole fields. Neither is faster; each is faster at the thing it bet on."
    },
    {
      "d": 2,
      "t": "h",
      "x": "What a column buys, precisely"
    },
    {
      "d": 2,
      "t": "list",
      "items": [
        "Full cache lines. Every byte fetched is a byte you asked for.",
        "A predictable stride, so the hardware prefetcher can run ahead of you.",
        "Uniform type with no per-value branching, which is what [[vectorization]] requires.",
        "Neighbours that resemble each other, so run-length and dictionary encoding actually work."
      ]
    },
    {
      "d": 3,
      "t": "p",
      "x": "Those are not four optimisations. They are one decision, collected four times. Layout choices are characteristically like this: cheap to make, and compounding in both directions."
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "Why does columnar data compress so much better than row data holding identical values?",
      "a": "Compression exploits similarity between neighbours. In a column, neighbours are values of the same field and are often nearly identical. In a row, neighbours are unrelated fields of different types.",
      "concept": "columnar"
    },
    {
      "d": 2,
      "t": "h",
      "x": "The part that is actually the point"
    },
    {
      "d": 2,
      "t": "p",
      "x": "Once two systems agree on a layout, that layout has become an interface whether or not anyone wrote it down. [[arrow|Arrow]] made the agreement explicit: buffers, validity bitmaps, offsets, alignment. Agreement becomes a fact rather than a coincidence."
    },
    {
      "d": 3,
      "t": "p",
      "x": "The leverage is combinatorial. N systems that each speak their own format need N² adapters; N systems that speak one shared layout need N. That is the whole argument, and it is the same argument as USB, the shipping container, and a common data model inside an organisation."
    },
    {
      "d": 3,
      "t": "aside",
      "x": "Whenever a standard wins, check whether it won on quality or on the exponent. Mostly it is the exponent."
    },
    {
      "d": 4,
      "t": "p",
      "x": "The honest counterweight: columnar is worse at point lookups and worse at writes that touch whole records, because one record is now scattered across as many buffers as it has fields. Hybrid layouts — PAX, and the row-group structure inside Parquet — exist precisely because the bet is rarely all-or-nothing."
    }
  ],
  "sources": [
    {
      "label": "Ulrich Drepper — What Every Programmer Should Know About Memory",
      "url": "https://people.freebsd.org/~lstewart/articles/cpumemory.pdf",
      "note": "Where the cache-line argument comes from, in full and painful detail."
    },
    {
      "label": "Apache Parquet file format specification",
      "url": "https://parquet.apache.org/docs/file-format/",
      "note": "The hybrid row-group structure that keeps the bet from being all-or-nothing."
    },
    {
      "label": "Apache Arrow columnar format specification",
      "url": "https://arrow.apache.org/docs/format/Columnar.html"
    }
  ]
};
