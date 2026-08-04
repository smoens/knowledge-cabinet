/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["decay"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "Retention after a single exposure decays roughly exponentially. Most of what you read today is unavailable within a week, and this is a property of the machine, not a verdict on your effort."
    },
    {
      "d": 1,
      "t": "p",
      "x": "Each successful retrieval resets the curve and flattens its slope. That is the entire mechanism behind [[spacing-effect|spaced repetition]]: not more study, differently timed study."
    },
    {
      "d": 2,
      "t": "figure",
      "fig": "retention",
      "caption": "Each review resets retention to full and flattens the decay. Add reviews and watch the ninety-day floor rise — note how little the fourth review costs compared with what it buys."
    },
    {
      "d": 2,
      "t": "h",
      "x": "Why the timing has to be uncomfortable"
    },
    {
      "d": 2,
      "t": "p",
      "x": "Reviewing while a memory is fresh does almost nothing, because there is no retrieval effort to make. Reviewing just before you would have forgotten does the most. So the optimal schedule is always slightly harder than it feels like it should be — a [[desirable-difficulty]]."
    },
    {
      "d": 2,
      "t": "p",
      "x": "This is also why re-reading is so seductive. It raises fluency, fluency feels like knowing, and the feeling is uncorrelated with the delayed test. [[retrieval-practice]] feels worse and works better."
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "You re-read a chapter and it feels completely familiar. What has that told you about whether you will remember it in a month?",
      "a": "Almost nothing. Familiarity is recognition, not retrieval. The only reliable signal is trying to reconstruct it without the text in front of you.",
      "concept": "retrieval-practice"
    },
    {
      "d": 3,
      "t": "p",
      "x": "[[interleaving]] supplies the other half. Blocked practice trains execution; interleaved practice trains selection. Real problems arrive unlabelled, so identifying which situation you are in is the part that has to be trained."
    },
    {
      "d": 3,
      "t": "aside",
      "x": "The same curve appears in the bottleneck chapter, upside down. Both are a rate acting against a store. Noticing that is [[analogy|associative thinking]] doing its job."
    },
    {
      "d": 4,
      "t": "p",
      "x": "Practical scheduling: a modest SM-2 variant is enough. Grade recall as forgot, hard, good, or easy; multiply or reset the interval; keep an ease factor per item. The gains come almost entirely from doing any spacing at all rather than from the exact algorithm."
    }
  ],
  "sources": [
    {
      "label": "Cepeda, Pashler, Vul, Wixted & Rohrer, “Distributed practice in verbal recall tasks: a review and quantitative synthesis”, Psychological Bulletin 132(3), 2006",
      "note": "The meta-analysis behind the spacing numbers."
    },
    {
      "label": "Roediger & Karpicke, “Test-Enhanced Learning”, Psychological Science 17(3), 2006",
      "note": "Retrieval practice beating restudy, repeatedly."
    },
    {
      "label": "SuperMemo — the SM-2 algorithm",
      "url": "https://super-memory.com/english/ol/sm2.htm",
      "note": "The scheduling variant this prototype implements."
    },
    {
      "label": "Andy Matuschak & Michael Nielsen — How can we develop transformative tools for thought?",
      "url": "https://numinous.productions/ttft/",
      "note": "The mnemonic-medium framing this whole book borrows from."
    }
  ]
};
