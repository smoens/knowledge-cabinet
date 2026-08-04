/* Knowledge Cabinet — the startup index.
   Chapter bodies, catalogue detail, and figures are loaded only when read. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.BOOK = {
  "meta": {
    "title": "Knowledge Cabinet",
    "subtitle": "A book that keeps moving",
    "reader": "Sarah",
    "compiled": "2026-08-03"
  },
  "areas": [
    {
      "id": "tech",
      "name": "Technical growth",
      "ink": "#d2452f",
      "target": 240
    },
    {
      "id": "comm",
      "name": "Communication",
      "ink": "#d98a1f",
      "target": 90
    },
    {
      "id": "learn",
      "name": "Learning",
      "ink": "#1f8a5b",
      "target": 120
    },
    {
      "id": "mem",
      "name": "Memory",
      "ink": "#2f6fd4",
      "target": 90
    },
    {
      "id": "think",
      "name": "Thinking",
      "ink": "#7a4fd0",
      "target": 150
    }
  ],
  "concepts": [
    {
      "id": "impedance-mismatch",
      "term": "Impedance mismatch",
      "kind": "pattern",
      "area": "tech",
      "short": "Two systems that are each internally coherent but disagree about the shape of what they exchange.",
      "seeAlso": [
        "serialization",
        "columnar",
        "row-oriented",
        "zero-copy"
      ]
    },
    {
      "id": "row-oriented",
      "term": "Row-oriented layout",
      "kind": "concept",
      "area": "tech",
      "short": "Values belonging to one record are stored adjacently.",
      "seeAlso": [
        "columnar",
        "cache-line"
      ]
    },
    {
      "id": "columnar",
      "term": "Columnar layout",
      "kind": "concept",
      "area": "tech",
      "short": "Values belonging to one field are stored adjacently, across all records.",
      "seeAlso": [
        "cache-line",
        "vectorization",
        "arrow",
        "layout-is-interface"
      ]
    },
    {
      "id": "layout-is-interface",
      "term": "Layout is an interface",
      "kind": "pattern",
      "area": "tech",
      "short": "The memory arrangement of your data is a public contract, not an implementation detail.",
      "seeAlso": [
        "arrow",
        "zero-copy",
        "impedance-mismatch"
      ]
    },
    {
      "id": "serialization",
      "term": "Serialization",
      "kind": "concept",
      "area": "tech",
      "short": "Turning in-memory structure into a byte sequence, and back.",
      "seeAlso": [
        "zero-copy",
        "impedance-mismatch",
        "odbc"
      ]
    },
    {
      "id": "zero-copy",
      "term": "Zero-copy",
      "kind": "concept",
      "area": "tech",
      "short": "Handing over data by reference because both sides already agree on its layout.",
      "seeAlso": [
        "arrow",
        "adbc",
        "layout-is-interface"
      ]
    },
    {
      "id": "cache-line",
      "term": "Cache line",
      "kind": "concept",
      "area": "tech",
      "short": "The fixed-size block, typically 64 bytes, that memory actually moves in.",
      "seeAlso": [
        "columnar",
        "row-oriented"
      ]
    },
    {
      "id": "vectorization",
      "term": "Vectorization",
      "kind": "concept",
      "area": "tech",
      "short": "One instruction applied to many values at once.",
      "seeAlso": [
        "columnar",
        "batch"
      ]
    },
    {
      "id": "batch",
      "term": "Batch",
      "kind": "concept",
      "area": "tech",
      "short": "Paying a fixed cost once for many items instead of once per item.",
      "seeAlso": [
        "amortization",
        "cursor"
      ]
    },
    {
      "id": "amortization",
      "term": "Amortization",
      "kind": "pattern",
      "area": "tech",
      "short": "Spreading a fixed cost across enough work that it stops mattering.",
      "seeAlso": [
        "batch",
        "littles-law"
      ]
    },
    {
      "id": "cursor",
      "term": "Cursor",
      "kind": "concept",
      "area": "tech",
      "short": "A handle you advance to pull results one row at a time.",
      "seeAlso": [
        "odbc",
        "batch"
      ]
    },
    {
      "id": "odbc",
      "term": "ODBC",
      "kind": "concept",
      "area": "tech",
      "short": "A 1992 C API for database access, built around row-at-a-time cursors and bound buffers.",
      "seeAlso": [
        "cursor",
        "adbc",
        "impedance-mismatch"
      ]
    },
    {
      "id": "adbc",
      "term": "ADBC",
      "kind": "concept",
      "area": "tech",
      "short": "Arrow Database Connectivity: the same idea as ODBC with columnar batches as the transfer unit.",
      "seeAlso": [
        "arrow",
        "zero-copy",
        "odbc"
      ]
    },
    {
      "id": "arrow",
      "term": "Apache Arrow",
      "kind": "concept",
      "area": "tech",
      "short": "A standard in-memory columnar layout that many systems agree on.",
      "seeAlso": [
        "columnar",
        "zero-copy",
        "layout-is-interface"
      ]
    },
    {
      "id": "littles-law",
      "term": "Little's law",
      "kind": "concept",
      "area": "tech",
      "short": "Items in the system = arrival rate × time each spends there. L = λW.",
      "seeAlso": [
        "utilization",
        "throughput",
        "latency"
      ]
    },
    {
      "id": "utilization",
      "term": "Utilization",
      "kind": "concept",
      "area": "tech",
      "short": "The fraction of time a resource is busy.",
      "seeAlso": [
        "littles-law",
        "tail-latency",
        "slack"
      ]
    },
    {
      "id": "slack",
      "term": "Slack",
      "kind": "pattern",
      "area": "think",
      "short": "Deliberately unused capacity, which is what absorbs variance.",
      "seeAlso": [
        "utilization",
        "tail-latency"
      ]
    },
    {
      "id": "tail-latency",
      "term": "Tail latency",
      "kind": "concept",
      "area": "tech",
      "short": "What the slowest few percent of requests experience.",
      "seeAlso": [
        "utilization",
        "latency"
      ]
    },
    {
      "id": "latency",
      "term": "Latency",
      "kind": "concept",
      "area": "tech",
      "short": "Time for one item to get through.",
      "seeAlso": [
        "throughput",
        "littles-law",
        "batch"
      ]
    },
    {
      "id": "throughput",
      "term": "Throughput",
      "kind": "concept",
      "area": "tech",
      "short": "Items completed per unit time.",
      "seeAlso": [
        "latency",
        "littles-law"
      ]
    },
    {
      "id": "forgetting-curve",
      "term": "Forgetting curve",
      "kind": "concept",
      "area": "mem",
      "short": "Retention decays roughly exponentially from the moment of learning.",
      "seeAlso": [
        "spacing-effect",
        "retrieval-practice"
      ]
    },
    {
      "id": "spacing-effect",
      "term": "Spacing effect",
      "kind": "concept",
      "area": "mem",
      "short": "The same total study time produces far more retention when distributed than when massed.",
      "seeAlso": [
        "forgetting-curve",
        "desirable-difficulty",
        "retrieval-practice"
      ]
    },
    {
      "id": "retrieval-practice",
      "term": "Retrieval practice",
      "kind": "concept",
      "area": "mem",
      "short": "Pulling something out of memory strengthens it far more than putting it in again.",
      "seeAlso": [
        "spacing-effect",
        "desirable-difficulty"
      ]
    },
    {
      "id": "desirable-difficulty",
      "term": "Desirable difficulty",
      "kind": "pattern",
      "area": "mem",
      "short": "Conditions that slow learning down in the moment and improve it in the long run.",
      "seeAlso": [
        "spacing-effect",
        "interleaving",
        "retrieval-practice"
      ]
    },
    {
      "id": "interleaving",
      "term": "Interleaving",
      "kind": "concept",
      "area": "mem",
      "short": "Mixing problem types instead of blocking them.",
      "seeAlso": [
        "desirable-difficulty",
        "transfer"
      ]
    },
    {
      "id": "invariant",
      "term": "Invariant",
      "kind": "pattern",
      "area": "think",
      "short": "What stays true while everything around it changes.",
      "seeAlso": [
        "first-principle",
        "constraint"
      ]
    },
    {
      "id": "first-principle",
      "term": "First principle",
      "kind": "pattern",
      "area": "think",
      "short": "The lowest statement in a chain of reasoning that is not itself derived from something in the domain.",
      "seeAlso": [
        "invariant",
        "transfer",
        "analogy"
      ]
    },
    {
      "id": "constraint",
      "term": "Constraint",
      "kind": "concept",
      "area": "think",
      "short": "Something the system is not permitted to do.",
      "seeAlso": [
        "invariant",
        "slack"
      ]
    },
    {
      "id": "analogy",
      "term": "Associative thinking",
      "kind": "pattern",
      "area": "think",
      "short": "Reaching a new idea through its structural resemblance to one you already hold.",
      "seeAlso": [
        "first-principle",
        "transfer"
      ]
    },
    {
      "id": "abstraction-ladder",
      "term": "Ladder of abstraction",
      "kind": "pattern",
      "area": "comm",
      "short": "The same idea stated at many altitudes, from concrete instance to general law.",
      "seeAlso": [
        "transfer",
        "curse-of-knowledge"
      ]
    },
    {
      "id": "curse-of-knowledge",
      "term": "Curse of knowledge",
      "kind": "concept",
      "area": "comm",
      "short": "Once you know something, you cannot reconstruct not knowing it.",
      "seeAlso": [
        "abstraction-ladder",
        "shared-referent"
      ]
    },
    {
      "id": "shared-referent",
      "term": "Shared referent",
      "kind": "concept",
      "area": "comm",
      "short": "A concrete thing both people can point at.",
      "seeAlso": [
        "curse-of-knowledge",
        "abstraction-ladder"
      ]
    },
    {
      "id": "intuition",
      "term": "Intuition",
      "kind": "concept",
      "area": "learn",
      "short": "Fast, non-verbal judgement produced by compressed experience.",
      "seeAlso": [
        "worked-example",
        "transfer"
      ]
    },
    {
      "id": "worked-example",
      "term": "Worked example",
      "kind": "concept",
      "area": "learn",
      "short": "A fully solved instance studied before attempting your own.",
      "seeAlso": [
        "intuition",
        "desirable-difficulty"
      ]
    },
    {
      "id": "transfer",
      "term": "Transfer",
      "kind": "pattern",
      "area": "learn",
      "short": "Using something learned in one setting in a setting that does not resemble it.",
      "seeAlso": [
        "first-principle",
        "analogy",
        "abstraction-ladder"
      ]
    },
    {
      "id": "onelake",
      "term": "OneLake",
      "kind": "concept",
      "area": "tech",
      "short": "One automatically provisioned lake per Fabric tenant, that every engine reads from without copying.",
      "seeAlso": [
        "shortcut",
        "delta-lake",
        "layout-is-interface",
        "invariant"
      ]
    },
    {
      "id": "shortcut",
      "term": "Shortcut",
      "kind": "concept",
      "area": "tech",
      "short": "An object in OneLake that points at data somewhere else and appears as an ordinary folder.",
      "seeAlso": [
        "indirection",
        "zero-copy",
        "onelake",
        "layout-is-interface"
      ]
    },
    {
      "id": "indirection",
      "term": "Indirection",
      "kind": "pattern",
      "area": "think",
      "short": "Replacing a thing with a reference to the thing, so the reference can be rebound later.",
      "seeAlso": [
        "shortcut",
        "zero-copy",
        "abstraction-ladder",
        "layout-is-interface"
      ]
    },
    {
      "id": "delta-lake",
      "term": "Delta Lake",
      "kind": "concept",
      "area": "tech",
      "short": "A transaction log laid over a directory of Parquet files, which turns a pile of files into a table.",
      "seeAlso": [
        "onelake",
        "invariant",
        "columnar",
        "row-group"
      ]
    },
    {
      "id": "v-order",
      "term": "V-Order",
      "kind": "concept",
      "area": "tech",
      "short": "A write-time Parquet optimisation that pre-arranges encoding so the Power BI engine can load it almost without translating.",
      "seeAlso": [
        "layout-is-interface",
        "amortization",
        "transcoding",
        "serialization"
      ]
    },
    {
      "id": "row-group",
      "term": "Row group",
      "kind": "concept",
      "area": "tech",
      "short": "A horizontal slice inside a Parquet file holding the column chunks for a block of rows.",
      "seeAlso": [
        "columnar",
        "batch",
        "cache-line",
        "vectorization"
      ]
    },
    {
      "id": "write-amplification",
      "term": "Write amplification",
      "kind": "concept",
      "area": "tech",
      "short": "Writing far more bytes than the change actually contained.",
      "seeAlso": [
        "amortization",
        "batch",
        "delta-lake",
        "constraint"
      ]
    },
    {
      "id": "capacity-unit",
      "term": "Capacity unit",
      "kind": "concept",
      "area": "tech",
      "short": "Fabric’s unit of compute. The SKU number is the rate: an F2 supplies 2 CUs every second, continuously.",
      "seeAlso": [
        "throughput",
        "utilization",
        "littles-law",
        "bursting"
      ]
    },
    {
      "id": "bursting",
      "term": "Bursting",
      "kind": "concept",
      "area": "tech",
      "short": "Letting an operation consume compute faster than the capacity’s sustained rate.",
      "seeAlso": [
        "smoothing",
        "capacity-unit",
        "slack",
        "amortization"
      ]
    },
    {
      "id": "smoothing",
      "term": "Smoothing",
      "kind": "concept",
      "area": "tech",
      "short": "Spreading what an operation consumed across many later timepoints instead of charging it all at once.",
      "seeAlso": [
        "amortization",
        "bursting",
        "utilization",
        "slack"
      ]
    },
    {
      "id": "throttling",
      "term": "Throttling",
      "kind": "concept",
      "area": "tech",
      "short": "Progressive slowing and then refusal, once smoothed consumption has borrowed too far into the future.",
      "seeAlso": [
        "progressive-degradation",
        "utilization",
        "smoothing",
        "tail-latency"
      ]
    },
    {
      "id": "progressive-degradation",
      "term": "Progressive degradation",
      "kind": "pattern",
      "area": "think",
      "short": "Failing in visible stages rather than at a single cliff edge.",
      "seeAlso": [
        "throttling",
        "slack",
        "tail-latency",
        "constraint"
      ]
    },
    {
      "id": "direct-lake",
      "term": "Direct Lake",
      "kind": "concept",
      "area": "tech",
      "short": "A Power BI mode that pulls Parquet columns straight from the lake into the in-memory engine, with no scheduled copy and no SQL translation.",
      "seeAlso": [
        "transcoding",
        "framing",
        "v-order",
        "zero-copy"
      ]
    },
    {
      "id": "transcoding",
      "term": "Transcoding",
      "kind": "concept",
      "area": "tech",
      "short": "Loading one Parquet column into the in-memory engine, merging its per-file dictionaries into one.",
      "seeAlso": [
        "v-order",
        "serialization",
        "impedance-mismatch",
        "direct-lake"
      ]
    },
    {
      "id": "framing",
      "term": "Framing",
      "kind": "concept",
      "area": "tech",
      "short": "A Direct Lake refresh that reads only the transaction log and repoints the model at the current files.",
      "seeAlso": [
        "delta-lake",
        "direct-lake",
        "invariant",
        "amortization"
      ]
    },
    {
      "id": "medallion",
      "term": "Medallion architecture",
      "kind": "concept",
      "area": "tech",
      "short": "Bronze, silver and gold layers: raw as landed, cleaned and conformed, then shaped for consumption.",
      "seeAlso": [
        "v-order",
        "abstraction-ladder",
        "amortization",
        "layout-is-interface"
      ]
    }
  ],
  "chapters": [
    {
      "id": "boundary",
      "title": "Where the data stops being data",
      "area": "tech",
      "state": "evolving",
      "added": "2026-07-11",
      "revised": "2026-08-01",
      "minutes": 11,
      "summary": "A query that runs in 200 ms can take nine seconds to arrive. The gap is not the database and not the network — it is the shape disagreement at the driver boundary.",
      "concepts": [
        "impedance-mismatch",
        "serialization",
        "odbc",
        "cursor",
        "adbc",
        "arrow",
        "zero-copy",
        "layout-is-interface",
        "littles-law"
      ],
      "workingBlockCount": 15,
      "chunk": "content/chapters/boundary.js"
    },
    {
      "id": "layout",
      "title": "Layout is an interface",
      "area": "tech",
      "state": "live",
      "added": "2026-06-02",
      "revised": "2026-07-19",
      "minutes": 9,
      "summary": "Row versus column is usually taught as a storage tradeoff. It is better understood as a bet about access order, made once, that the hardware then rewards or punishes on every read.",
      "concepts": [
        "cache-line",
        "row-oriented",
        "columnar",
        "vectorization",
        "arrow"
      ],
      "workingBlockCount": 10,
      "chunk": "content/chapters/layout.js"
    },
    {
      "id": "bottleneck",
      "title": "The shape of a bottleneck",
      "area": "tech",
      "state": "new",
      "added": "2026-08-01",
      "revised": "2026-08-01",
      "minutes": 7,
      "summary": "Queueing delay is not linear in load. Everything about capacity planning follows from that one curve, including why the last tenth of utilization costs almost everything.",
      "concepts": [
        "utilization",
        "slack",
        "littles-law",
        "tail-latency"
      ],
      "workingBlockCount": 9,
      "chunk": "content/chapters/bottleneck.js"
    },
    {
      "id": "decay",
      "title": "The forgetting curve is a design surface",
      "area": "mem",
      "state": "live",
      "added": "2026-05-20",
      "revised": "2026-07-30",
      "minutes": 8,
      "summary": "Forgetting is exponential and fast. Once you treat that as a curve to schedule against rather than a personal failing, the design of a review system writes itself.",
      "concepts": [
        "spacing-effect",
        "desirable-difficulty",
        "retrieval-practice",
        "interleaving",
        "analogy"
      ],
      "workingBlockCount": 9,
      "chunk": "content/chapters/decay.js"
    },
    {
      "id": "invariants",
      "title": "Thinking in invariants",
      "area": "think",
      "state": "live",
      "added": "2026-06-14",
      "revised": "2026-07-22",
      "minutes": 7,
      "summary": "The fastest route into an unfamiliar system is not asking what it does. It is asking what it will never let you do.",
      "concepts": [
        "invariant",
        "constraint",
        "first-principle",
        "transfer"
      ],
      "workingBlockCount": 9,
      "chunk": "content/chapters/invariants.js"
    },
    {
      "id": "onestep",
      "title": "Explaining to the person one step behind you",
      "area": "comm",
      "state": "new",
      "added": "2026-08-02",
      "revised": "2026-08-02",
      "minutes": 5,
      "summary": "You cannot explain well to someone far behind you, because you can no longer see the steps. The person one step behind is the only audience you can still model accurately.",
      "concepts": [
        "curse-of-knowledge",
        "shared-referent",
        "abstraction-ladder"
      ],
      "workingBlockCount": 6,
      "chunk": "content/chapters/onestep.js"
    },
    {
      "id": "intuition",
      "title": "Intuition is compressed experience",
      "area": "learn",
      "state": "evolving",
      "added": "2026-07-06",
      "revised": "2026-07-28",
      "minutes": 6,
      "summary": "Intuition is not the opposite of rigour. It is rigour that has been run often enough against honest feedback to become a lookup.",
      "concepts": [
        "intuition",
        "worked-example",
        "transfer"
      ],
      "workingBlockCount": 6,
      "chunk": "content/chapters/intuition.js"
    },
    {
      "id": "jdbc-tuning",
      "title": "Notes on JDBC fetch-size tuning",
      "area": "tech",
      "state": "retiring",
      "added": "2025-11-03",
      "revised": "2026-07-11",
      "minutes": 4,
      "summary": "Superseded. The numbers survive, but the framing was wrong: this was treated as a driver setting when it is really a case of paying per call instead of per batch.",
      "supersededBy": "boundary",
      "concepts": [
        "amortization"
      ],
      "workingBlockCount": 3,
      "chunk": "content/chapters/jdbc-tuning.js"
    },
    {
      "id": "onelake-shortcuts",
      "title": "The pipeline you delete by pointing at it",
      "area": "tech",
      "state": "new",
      "added": "2026-08-06",
      "revised": "2026-08-06",
      "minutes": 8,
      "summary": "A shortcut in OneLake is a symlink wearing analytics clothes. What makes it interesting is not the convenience — it is where it moves the integration boundary, and what that move costs.",
      "concepts": [
        "shortcut",
        "onelake",
        "indirection",
        "delta-lake",
        "layout-is-interface"
      ],
      "workingBlockCount": 12,
      "chunk": "content/chapters/onelake-shortcuts.js"
    },
    {
      "id": "vorder",
      "title": "Paying at write time so every reader stops paying",
      "area": "tech",
      "state": "new",
      "added": "2026-08-04",
      "revised": "2026-08-09",
      "minutes": 9,
      "summary": "V-Order is usually filed as a Fabric setting. It is better understood as amortization with a named beneficiary: one writer absorbs a cost so that a specific, known reader can skip it.",
      "concepts": [
        "columnar",
        "v-order",
        "direct-lake",
        "amortization",
        "medallion",
        "row-group",
        "write-amplification",
        "delta-lake"
      ],
      "workingBlockCount": 12,
      "chunk": "content/chapters/vorder.js"
    },
    {
      "id": "capacity",
      "title": "A capacity is a tap, not a tank",
      "area": "tech",
      "state": "evolving",
      "added": "2026-07-24",
      "revised": "2026-08-08",
      "minutes": 10,
      "summary": "Bursting, smoothing and throttling look like three unrelated Fabric features. They are one mechanism: a fixed rate of supply, reconciled with spiky demand, degrading in stages instead of at a cliff.",
      "concepts": [
        "capacity-unit",
        "bursting",
        "smoothing",
        "throttling",
        "progressive-degradation",
        "utilization"
      ],
      "workingBlockCount": 14,
      "chunk": "content/chapters/capacity.js"
    },
    {
      "id": "directlake",
      "title": "The refresh you delete, and the one you keep",
      "area": "tech",
      "state": "new",
      "added": "2026-08-08",
      "revised": "2026-08-08",
      "minutes": 9,
      "summary": "Direct Lake removes the scheduled copy without adding a translation layer. Understanding it is really understanding three separate operations that all get called “refresh”.",
      "concepts": [
        "direct-lake",
        "zero-copy",
        "adbc",
        "odbc",
        "framing",
        "transcoding",
        "v-order"
      ],
      "workingBlockCount": 14,
      "chunk": "content/chapters/directlake.js"
    }
  ],
  "conceptDetailChunks": {
    "tech": "content/concepts/tech.js",
    "comm": "content/concepts/comm.js",
    "learn": "content/concepts/learn.js",
    "mem": "content/concepts/mem.js",
    "think": "content/concepts/think.js"
  },
  "frequency": {
    "impedance-mismatch": 1,
    "serialization": 2,
    "odbc": 2,
    "cursor": 1,
    "adbc": 2,
    "arrow": 2,
    "zero-copy": 2,
    "layout-is-interface": 3,
    "littles-law": 3,
    "cache-line": 1,
    "row-oriented": 1,
    "columnar": 3,
    "vectorization": 1,
    "utilization": 2,
    "slack": 1,
    "tail-latency": 1,
    "spacing-effect": 1,
    "desirable-difficulty": 1,
    "retrieval-practice": 2,
    "interleaving": 1,
    "analogy": 1,
    "invariant": 2,
    "constraint": 1,
    "first-principle": 1,
    "transfer": 2,
    "curse-of-knowledge": 2,
    "shared-referent": 1,
    "abstraction-ladder": 1,
    "intuition": 1,
    "worked-example": 2,
    "amortization": 2,
    "shortcut": 1,
    "onelake": 2,
    "indirection": 2,
    "delta-lake": 3,
    "v-order": 2,
    "direct-lake": 3,
    "medallion": 1,
    "row-group": 1,
    "write-amplification": 1,
    "capacity-unit": 1,
    "bursting": 1,
    "smoothing": 2,
    "throttling": 2,
    "progressive-degradation": 1,
    "framing": 2,
    "transcoding": 2
  }
};
