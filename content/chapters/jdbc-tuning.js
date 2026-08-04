/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["jdbc-tuning"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "Retained because the measurements are still useful, retired because the framing was wrong. Raising fetch size helped, and the reason was never “JDBC has a bad default”."
    },
    {
      "d": 2,
      "t": "p",
      "x": "It was [[amortization]]: a fixed per-round-trip cost divided across more rows. The chapter that owns this idea now is “Where the data stops being data”."
    },
    {
      "d": 3,
      "t": "p",
      "x": "Kept in the archive because a retired chapter that once shaped your thinking is evidence about how your thinking changed, and that is worth more than a clean shelf."
    }
  ],
  "sources": [
    {
      "label": "JDBC ResultSet.setFetchSize — API documentation",
      "url": "https://docs.oracle.com/javase/8/docs/api/java/sql/ResultSet.html#setFetchSize-int-",
      "note": "The setting itself. The framing that replaced this chapter is in “Where the data stops being data”."
    }
  ]
};
