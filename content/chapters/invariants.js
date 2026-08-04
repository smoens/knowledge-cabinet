/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["invariants"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "When you meet a system you do not understand, the highest-yield question is not “what does this do”. It is “what does this refuse to let me break”."
    },
    {
      "d": 1,
      "t": "p",
      "x": "An [[invariant]] is what stays true while everything around it changes. It is the smallest description with the most predictive power, because every behaviour you have not observed yet still has to respect it."
    },
    {
      "d": 2,
      "t": "h",
      "x": "Three questions that find them"
    },
    {
      "d": 2,
      "t": "list",
      "items": [
        "What is conserved? Total money, total bytes, reference counts, sum of shares.",
        "What is monotonic? Version numbers, log offsets, timestamps, generation counters.",
        "What can never hold at the same time? Two writers, two leaders, a row both visible and uncommitted."
      ]
    },
    {
      "d": 2,
      "t": "p",
      "x": "Answer those three and most questions about behaviour turn into questions about whether an invariant is threatened — a far smaller space to search."
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "What makes an invariant more useful than a description of behaviour?",
      "a": "It constrains every future state, including ones you have not observed. A behaviour description only covers the cases you happened to see.",
      "concept": "invariant"
    },
    {
      "d": 3,
      "t": "p",
      "x": "[[constraint|Constraints]] work the same way one level up. Goals tell you where a system is aiming; constraints tell you where it will actually end up. Most design arguments that feel like taste are really disagreements about which constraints are real."
    },
    {
      "d": 3,
      "t": "p",
      "x": "Push either far enough and you reach a [[first-principle]] — the point where the answer stops being about the domain and becomes physics, arithmetic, information, or economics. That stopping point is what [[transfer|transfers]]."
    },
    {
      "d": 3,
      "t": "aside",
      "x": "Practical test: restate the idea once with every domain noun deleted. If nothing survives the deletion, you learned a fact, not a pattern."
    }
  ],
  "sources": [
    {
      "label": "C. A. R. Hoare, “An Axiomatic Basis for Computer Programming”, CACM 12(10), 1969",
      "note": "Where invariants stopped being informal and became a proof obligation."
    },
    {
      "label": "Leslie Lamport — Who Builds a House Without Drawing Blueprints?",
      "url": "https://lamport.azurewebsites.net/pubs/lamport-blueprints.pdf",
      "note": "The argument for stating what must stay true before writing what happens."
    }
  ]
};
