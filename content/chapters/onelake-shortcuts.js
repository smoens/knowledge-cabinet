/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["onelake-shortcuts"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "The usual way to make someone else’s data usable is to copy it: a pipeline, a schedule, a landing zone, a reconciliation job, and a standing argument about which copy is current."
    },
    {
      "d": 1,
      "t": "p",
      "x": "A [[shortcut]] in [[onelake|OneLake]] does none of that. It stores a target path and appears as an ordinary folder. Every engine that can read the lake reads through it, and the bytes never move."
    },
    {
      "d": 2,
      "t": "h",
      "x": "What is actually being replaced"
    },
    {
      "d": 2,
      "t": "p",
      "x": "This is [[indirection]] applied at the namespace layer rather than the transport layer. The pipeline was doing two jobs — moving bytes and resolving “where does this live” — and only the second one was ever essential."
    },
    {
      "d": 2,
      "t": "p",
      "x": "It works because everything underneath already agreed on a representation. [[onelake|OneLake]] is ADLS Gen2 with a fixed hierarchy, and tables are [[delta-lake|Delta]] over Parquet. Shortcuts are only cheap because the disagreement was settled first. That is [[layout-is-interface]] in a different costume."
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "A shortcut avoids copying bytes. What has it not avoided?",
      "a": "The read itself. Every query pays the latency and egress of reaching the real location, on every access, instead of paying once at copy time. Indirection defers cost, it does not remove it.",
      "concept": "indirection"
    },
    {
      "d": 2,
      "t": "h",
      "x": "The published edges"
    },
    {
      "d": 2,
      "t": "list",
      "items": [
        "An item can hold up to 100,000 shortcuts, and a tenant is not otherwise capped.",
        "A single path can carry at most 10 shortcuts directly beneath it.",
        "Shortcuts can chain, but no more than 5 links deep.",
        "Deleting a shortcut deletes the pointer. The target is untouched."
      ]
    },
    {
      "d": 3,
      "t": "p",
      "x": "Those five numbers are worth reading as design statements rather than trivia. A depth limit of 5 exists because each link is a resolution step, and resolution steps are where staleness and permission surprises live."
    },
    {
      "d": 3,
      "t": "h",
      "x": "The caching asymmetry"
    },
    {
      "d": 3,
      "t": "p",
      "x": "Shortcut caching is available for GCS, S3, S3-compatible and on-premises targets, with a retention window you set between 1 and 28 days, and a per-file ceiling of 1 GB. It is not available for ADLS Gen2 targets."
    },
    {
      "d": 3,
      "t": "p",
      "x": "The asymmetry is the tell. Caching exists to pay down the cost of leaving the platform, so it is offered exactly where leaving is expensive. Read the feature matrix and you can usually infer which boundary the designers considered painful."
    },
    {
      "d": 4,
      "t": "aside",
      "x": "General move: when a capability is available in some cases and not others, the boundary between the cases is usually a cost boundary. Find it and you have found the architecture."
    },
    {
      "d": 4,
      "t": "p",
      "x": "Identity is the other half. A shortcut resolves either with the caller’s identity or with a stored connection, and those two choices produce very different audit stories. The convenience is in the namespace; the risk is in the delegation."
    },
    {
      "d": 4,
      "t": "prompt",
      "q": "What is the structural similarity between a OneLake shortcut and Arrow’s columnar format?",
      "a": "Both remove a translation step by getting everyone to agree in advance — Arrow on in-memory layout, OneLake on storage location and table format. Both convert an N² adapter problem into an N one.",
      "concept": "layout-is-interface"
    }
  ],
  "sources": [
    {
      "label": "OneLake shortcuts",
      "url": "https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts",
      "note": "Types, limits, and the delete-the-pointer-not-the-target semantics."
    },
    {
      "label": "OneLake shortcuts caching",
      "url": "https://learn.microsoft.com/en-us/fabric/onelake/shortcuts-file-caching",
      "note": "Where the 1–28 day retention window and 1 GB per-file ceiling come from."
    },
    {
      "label": "OneLake overview",
      "url": "https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview"
    }
  ]
};
