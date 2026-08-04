/* Catalogue detail for think. Loaded when a reader opens a matching specimen. */
window.CABINET_CONCEPT_DETAILS = window.CABINET_CONCEPT_DETAILS || {};
Object.assign(window.CABINET_CONCEPT_DETAILS, {
  "slack": {
    "fundamental": "A system run at full utilization has traded all of its responsiveness for throughput, and the trade is not linear — the last tenth of utilization costs most of the responsiveness.",
    "mechanism": "Variance has to go somewhere: into spare capacity, into queues, or into failures. Removing slack does not remove variance; it relocates it into delay."
  },
  "invariant": {
    "fundamental": "Understanding a system means knowing what it will not let you break. Invariants are the smallest description with the most predictive power.",
    "mechanism": "Ask what is conserved, what is monotonic, and what can never hold simultaneously. Then every question about behaviour becomes a question about whether an invariant is threatened."
  },
  "first-principle": {
    "fundamental": "Drilling a concept until it stops being about its domain is what makes it portable to domains you have not met yet.",
    "mechanism": "Take a claim, ask why it is true, repeat. Stop when the answer is physics, arithmetic, information, or economics. That stopping point is what transfers."
  },
  "constraint": {
    "fundamental": "Constraints are more informative than goals. Goals tell you where a system is aiming; constraints tell you where it will end up.",
    "mechanism": "Enumerate what is impossible and the space of possible designs collapses fast, usually to a handful. Most design arguments are really disagreements about which constraints are real."
  },
  "analogy": {
    "fundamental": "Novel ideas are mostly recombinations. The limiting factor is not intelligence but how many structures you hold in a form abstract enough to match against.",
    "mechanism": "Store ideas by their shape rather than their subject and unrelated fields start colliding usefully. Queueing delay and memory decay are the same curve: a rate acting against a store."
  },
  "indirection": {
    "fundamental": "Every hard problem yields to another level of indirection, and the cost is always the same: one more place where the truth can be stale or wrong.",
    "mechanism": "Ask what is being named, who resolves the name, and when. The answers tell you what you have bought (late binding) and what you have paid (a resolution step, and a lie that is now possible)."
  },
  "progressive-degradation": {
    "fundamental": "A limit that is invisible until it is fatal cannot be learned from; staged degradation converts a cliff into a gradient someone can feel.",
    "mechanism": "Ask what happens at 90, 100 and 150 percent of the limit. If the three answers are “fine, fine, dead”, you have a cliff, and someone will walk off it."
  }
});
