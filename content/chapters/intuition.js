/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["intuition"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "[[intuition|Intuition]] forms where feedback is fast, frequent, and honest. It fails to form where feedback is slow or noisy — which is exactly why you have good intuition about query latency and poor intuition about architectural decisions whose consequences arrive two years later."
    },
    {
      "d": 1,
      "t": "p",
      "x": "So intuition is not something you have. It is something a feedback loop either grants you or withholds."
    },
    {
      "d": 2,
      "t": "p",
      "x": "The practical consequence: if you want intuition in a domain with slow feedback, manufacture faster feedback. Predict before you measure. Write the number down first. An unrecorded prediction cannot correct anything."
    },
    {
      "d": 2,
      "t": "p",
      "x": "Early on, [[worked-example|worked examples]] beat problem-solving. Without a schema, all attention goes into search and none into learning. Study complete solutions, then fade the support one step at a time."
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "Why do worked examples beat problem-solving for a beginner and lose to it for an expert?",
      "a": "Beginners have no schema, so unguided search consumes working memory and leaves none for learning. Experts have the schema, so retrieval effort becomes the scarce and valuable ingredient.",
      "concept": "worked-example"
    },
    {
      "d": 3,
      "t": "p",
      "x": "And the compounding move: encode each new idea at the level you want it available. Filed as a fact about a driver, it stays with that driver. Filed as a boundary cost, it appears the next time two systems disagree about anything. That is [[transfer]], and it is decided at encoding time, not at recall time."
    }
  ],
  "sources": [
    {
      "label": "Kahneman & Klein, “Conditions for Intuitive Expertise: A Failure to Disagree”, American Psychologist 64(6), 2009",
      "note": "The two-condition test: regularity in the environment, and an opportunity to learn it."
    },
    {
      "label": "Chase & Simon, “Perception in chess”, Cognitive Psychology 4(1), 1973",
      "note": "Expertise as chunking rather than raw processing."
    },
    {
      "label": "Sweller, van Merriënboer & Paas, “Cognitive Architecture and Instructional Design”, 1998",
      "note": "The worked-example effect and its expertise reversal."
    }
  ]
};
