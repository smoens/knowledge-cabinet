/* Catalogue detail for mem. Loaded when a reader opens a matching specimen. */
window.CABINET_CONCEPT_DETAILS = window.CABINET_CONCEPT_DETAILS || {};
Object.assign(window.CABINET_CONCEPT_DETAILS, {
  "forgetting-curve": {
    "fundamental": "Forgetting is the default and it is fast. Any learning system that does not schedule against decay is relying on luck.",
    "mechanism": "Retrievability falls steeply in the first days, then flattens. Each successful retrieval resets the curve and reduces its slope, so intervals can grow."
  },
  "spacing-effect": {
    "fundamental": "Difficulty at retrieval time is what produces durability. Spacing manufactures that difficulty for free, by letting decay happen first.",
    "mechanism": "Reviewing while the memory is still fresh does almost nothing. Reviewing just before you would have forgotten does the most. The optimal interval is therefore always slightly uncomfortable."
  },
  "retrieval-practice": {
    "fundamental": "The act of reconstruction is the learning event. Recognition feels like knowing, and is not.",
    "mechanism": "Re-reading raises fluency, which raises confidence, which is why it feels effective. A failed retrieval followed by the answer beats a comfortable re-read on every delayed test."
  },
  "desirable-difficulty": {
    "fundamental": "Immediate performance and durable learning are different quantities, and are often inversely related. Optimising the feeling of a session optimises the wrong one.",
    "mechanism": "Spacing, interleaving, testing, and generating rather than being shown all reduce in-session fluency and raise delayed retention. The discomfort is the signal that it is working."
  },
  "interleaving": {
    "fundamental": "Blocked practice trains execution; interleaved practice trains selection. Real problems arrive unlabelled.",
    "mechanism": "Blocking lets you reuse the previous answer’s approach without deciding. Interleaving forces you to identify the situation first, which is the part you actually need later."
  }
});
