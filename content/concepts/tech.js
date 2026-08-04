/* Catalogue detail for tech. Loaded when a reader opens a matching specimen. */
window.CABINET_CONCEPT_DETAILS = window.CABINET_CONCEPT_DETAILS || {};
Object.assign(window.CABINET_CONCEPT_DETAILS, {
  "impedance-mismatch": {
    "fundamental": "Wherever two components meet, the cost of the boundary is set by how far apart their native representations are — not by how fast either side runs.",
    "mechanism": "The boundary inserts a translation step. Translation costs allocation, copying, and a serial bottleneck that neither side can optimise away, because neither side owns it. Speeding up either component leaves the translation untouched, so the boundary becomes a larger and larger share of total time.",
    "sources": [
      {
        "label": "Arrow — why a shared in-memory format",
        "url": "https://arrow.apache.org/overview/"
      }
    ]
  },
  "row-oriented": {
    "fundamental": "Storage order is an implicit bet about access order. Rows bet you want whole records.",
    "mechanism": "Reading one field of a million records touches a million separate cache lines, most of whose bytes you discard. Reading one whole record touches one."
  },
  "columnar": {
    "fundamental": "Storage order is an implicit bet about access order. Columns bet you want whole fields.",
    "mechanism": "One field of a million records becomes one contiguous run. The prefetcher predicts it, the cache line is fully used, the type is uniform so the loop can be vectorised, and the values compress well because neighbours resemble each other."
  },
  "layout-is-interface": {
    "fundamental": "Any representation two parties agree on becomes an interface, whether or not anyone documented it. Agreeing on the bytes removes the translation; agreeing only on the semantics guarantees it.",
    "mechanism": "When producer and consumer share a layout, handing data over is passing a pointer. When they share only a schema, handing data over is encode, transmit, decode. Same semantics, different order of magnitude."
  },
  "serialization": {
    "fundamental": "Every format conversion is a full pass over the data with allocation at the far end. It is invisible in profiles that only measure \"the query\".",
    "mechanism": "Encode walks the source structure and writes a linear buffer; the decoder allocates and rebuilds. Cost scales with values, not bytes, so wide narrow rows are the worst case."
  },
  "zero-copy": {
    "fundamental": "The fastest transformation is the one you deleted, and you delete it by making the two ends agree beforehand.",
    "mechanism": "Producer writes buffers in the shared layout. Consumer reads those same buffers. No encode, no decode, no second allocation; often no crossing of a process boundary at all."
  },
  "cache-line": {
    "fundamental": "You never fetch a value; you fetch its neighbourhood. Locality is therefore free performance you either collect or discard.",
    "mechanism": "Touching one byte pulls 64. If the other 63 are useful, you got them free. If they belong to fields you are not reading, you paid full price for waste."
  },
  "vectorization": {
    "fundamental": "Uniformity is what makes parallelism cheap. Heterogeneous data forces the loop back to one value at a time.",
    "mechanism": "A SIMD register holds 8 or 16 values of the same type. The loop needs contiguity, uniform type, and no per-value branching — exactly what a column gives you and a row does not."
  },
  "batch": {
    "fundamental": "Any per-call overhead becomes negligible or dominant depending only on how many items ride along with it.",
    "mechanism": "Fixed cost F, per-item cost c, batch size n: cost per item is F/n + c. The curve is a hyperbola — brutal at n=1, nearly flat past a few thousand."
  },
  "amortization": {
    "fundamental": "When a cost is fixed per operation, the design lever is not making it cheaper — it is making the operation bigger.",
    "mechanism": "Identify what is charged per call rather than per byte: round trips, allocations, locks, context switches, syscalls, model calls. Then enlarge the unit of work until the fixed term is noise."
  },
  "cursor": {
    "fundamental": "An interface shaped for the smallest unit forces every consumer to pay per-unit overhead, even one that wanted the whole set.",
    "mechanism": "Each fetch crosses the driver boundary with binding, conversion, and often a round trip. The row is a fine mental model and a poor transfer unit."
  },
  "odbc": {
    "fundamental": "An interface encodes the hardware assumptions of its era, and then outlives them.",
    "mechanism": "The client binds application variables to result columns; the driver converts each value into those bindings as rows are fetched. Correct, universal, and per-value — which is why analytics traffic through it is dominated by conversion."
  },
  "adbc": {
    "fundamental": "You do not fix a boundary by optimising the translation. You fix it by removing the disagreement.",
    "mechanism": "The driver returns Arrow record batches. If the engine already speaks Arrow, the result reaches the consumer without a value-by-value conversion anywhere in the path.",
    "sources": [
      {
        "label": "ADBC specification",
        "url": "https://arrow.apache.org/adbc/"
      }
    ]
  },
  "arrow": {
    "fundamental": "A shared representation converts an N×N translation problem into N adapters.",
    "mechanism": "Arrow specifies the bytes: buffers, validity bitmaps, offsets, alignment. Anything that emits Arrow can be read by anything that reads Arrow, in the same process or over the wire, without decoding."
  },
  "littles-law": {
    "fundamental": "Three quantities, one equation, no assumptions about the distribution. Fix any two and the third is decided for you.",
    "mechanism": "It holds for any stable system over a long enough window. Its most practical use is negative: it tells you which of your three targets was already impossible."
  },
  "utilization": {
    "fundamental": "Queueing delay grows as ρ/(1−ρ). Past about 80% the curve stops being a slope and becomes a wall.",
    "mechanism": "A busy server cannot absorb variance, so arrivals wait for arrivals. At 50% you wait about one service time; at 90% about nine; at 99% about ninety-nine."
  },
  "tail-latency": {
    "fundamental": "Averages describe the system; tails describe the experience. Fan-out turns a rare tail into a common one.",
    "mechanism": "A request touching 100 services, each with a 1% slow path, is slow about 63% of the time. The tail stops being an outlier once you multiply it."
  },
  "latency": {
    "fundamental": "Latency and throughput are different quantities that trade against each other; optimising one silently taxes the other.",
    "mechanism": "Batching raises throughput and raises latency for the first item in the batch. Pipelining raises throughput without raising latency but adds coordination."
  },
  "throughput": {
    "fundamental": "Throughput is set by the narrowest stage, and only by that stage.",
    "mechanism": "Improving a non-bottleneck stage changes nothing measurable. This is why performance work not preceded by measurement usually produces no result."
  },
  "onelake": {
    "fundamental": "When every consumer is forced onto one storage namespace, integration stops being a pipeline problem and becomes a permissions problem.",
    "mechanism": "It is ADLS Gen2 underneath, addressed as tenant → workspace (a container) → item (a folder). Warehouse, Spark, KQL and Analysis Services all read the same Delta-Parquet files in place.",
    "sources": [
      {
        "label": "OneLake, the unified data lake",
        "url": "https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview"
      }
    ]
  },
  "shortcut": {
    "fundamental": "A shortcut is a symlink for analytics: it moves the integration boundary out of the pipeline and into the namespace.",
    "mechanism": "It stores a target path, not bytes. Reads resolve through to S3, ADLS Gen2, GCS, Dataverse or another OneLake item, passing your identity or a bound connection. Deleting it never deletes the target.",
    "sources": [
      {
        "label": "Unify data sources with OneLake shortcuts",
        "url": "https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts"
      }
    ]
  },
  "delta-lake": {
    "fundamental": "A log that names the current file set is what converts eventually-consistent object storage into something with transactions.",
    "mechanism": "The `_delta_log` directory records which files belong to which version. That single indirection buys ACID commits, schema enforcement, time travel, and a definition of “dead file” that VACUUM can act on.",
    "sources": [
      {
        "label": "Delta Lake table format interoperability",
        "url": "https://learn.microsoft.com/en-us/fabric/fundamentals/delta-lake-interoperability"
      }
    ]
  },
  "v-order": {
    "fundamental": "If you know who reads the file, you can pay their decoding cost once at write time instead of every time they read.",
    "mechanism": "It arranges row-group layout, dictionary encoding and compression to match what VertiPaq expects, so transcoding becomes an ID remap rather than a re-encode. Files stay valid open Parquet.",
    "sources": [
      {
        "label": "Delta Lake table optimization and V-Order",
        "url": "https://learn.microsoft.com/en-us/fabric/data-engineering/delta-optimization-and-v-order"
      }
    ]
  },
  "row-group": {
    "fundamental": "Columnar formats are still chunked by rows somewhere, because a reader needs a unit it can skip, parallelise and hold in memory.",
    "mechanism": "It is the unit of read parallelism, of statistics-based skipping, and of dictionary merging when a column is pulled into memory. Too many small ones and the overhead dominates the data."
  },
  "write-amplification": {
    "fundamental": "When the unit you must rewrite is larger than the unit you changed, cost is set by the block size, not by the edit.",
    "mechanism": "A one-row update that forces a 1 GB file to be rewritten is amplification of about a billion to one. Look for it wherever compaction, immutability or fixed-size blocks meet small frequent changes."
  },
  "capacity-unit": {
    "fundamental": "Buying a rate is not the same as buying an amount; everything strange about capacity follows from confusing the two.",
    "mechanism": "Think of it as a tap, not a tank. An F2 delivers 2 CU/s — 60 CUs in each 30-second timepoint, 172,800 across a day — and the whole bursting-and-smoothing apparatus exists to reconcile a steady tap with spiky demand.",
    "sources": [
      {
        "label": "Understand Microsoft Fabric licenses",
        "url": "https://learn.microsoft.com/en-us/fabric/enterprise/licenses"
      }
    ]
  },
  "bursting": {
    "fundamental": "Bursting trades a rate limit for a debt: the work finishes sooner, and the bill arrives on a later clock tick.",
    "mechanism": "The job runs as fast as it can rather than being paced to the SKU. What it consumed is then owed, which is why bursting is meaningless without smoothing.",
    "sources": [
      {
        "label": "Understand your Fabric capacity throttling",
        "url": "https://learn.microsoft.com/en-us/fabric/enterprise/throttling"
      }
    ]
  },
  "smoothing": {
    "fundamental": "Amortisation applied to a rate limit: if you average demand over a long enough window, a spike stops looking like a spike.",
    "mechanism": "Background operations are spread over 24 hours — 2,880 timepoints of 30 seconds. Interactive operations get a shorter window, a minimum of five minutes and up to sixty-four.",
    "sources": [
      {
        "label": "Understand your Fabric capacity throttling",
        "url": "https://learn.microsoft.com/en-us/fabric/enterprise/throttling"
      }
    ]
  },
  "throttling": {
    "fundamental": "A well-designed limit degrades in stages, because a system that is fine until it is dead teaches its operators nothing.",
    "mechanism": "Under ten minutes of borrowed capacity, nothing happens. Past ten, new interactive work is delayed twenty seconds. Past sixty, interactive work is rejected. Past twenty-four hours, everything is.",
    "sources": [
      {
        "label": "Understand your Fabric capacity throttling",
        "url": "https://learn.microsoft.com/en-us/fabric/enterprise/throttling"
      }
    ]
  },
  "direct-lake": {
    "fundamental": "When storage and the query engine already agree on a representation, the refresh step is not optimised — it is deleted.",
    "mechanism": "Import copies everything on a schedule; DirectQuery translates every question to SQL. Direct Lake does neither: it loads the columns a query actually needs, on demand, and keeps them resident.",
    "sources": [
      {
        "label": "Direct Lake overview",
        "url": "https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview"
      }
    ]
  },
  "transcoding": {
    "fundamental": "The cost of crossing a boundary is set by how far apart the two encodings are, not by how much data crosses it.",
    "mechanism": "If the Parquet column is dictionary-encoded the way VertiPaq expects, the load is an ID remap. If it is plain- or delta-encoded, the column must be re-encoded from scratch.",
    "sources": [
      {
        "label": "Understand Direct Lake query performance",
        "url": "https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-understand-storage"
      }
    ]
  },
  "framing": {
    "fundamental": "If a refresh only has to agree on which version is current, it costs metadata time rather than data time.",
    "mechanism": "It reads the Delta log, updates file pointers, and evicts only the column segments whose files actually changed. Seconds, not minutes — and the model then shows that frozen version until the next framing.",
    "sources": [
      {
        "label": "How Direct Lake works",
        "url": "https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-how-it-works"
      }
    ]
  },
  "medallion": {
    "fundamental": "Naming the layers is really naming who each one is optimised for, which is what lets you make different tradeoffs in each.",
    "mechanism": "It is why one optimisation answer is wrong across a lake: bronze is write-heavy so read-time preparation is waste there, and gold is read-heavy so it is worth paying for.",
    "sources": [
      {
        "label": "Implement medallion lakehouse architecture in Fabric",
        "url": "https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture"
      }
    ]
  },
  "deferred-write": {
    "fundamental": "A component that processes untrusted input can be steered into producing anything; safety comes not from making it trustworthy but from making its output inert until something else chooses to act on it.",
    "mechanism": "Split execution into a proposing stage with no ambient write capability, whose only output is data — a requested action, not the action itself — and a separate acting stage that reads that request and decides, with its own narrower permissions, whether to perform it.",
    "sources": [
      {
        "label": "GitHub Agentic Workflows — Safe Outputs reference",
        "url": "https://github.github.com/gh-aw/reference/safe-outputs/"
      }
    ]
  },
  "least-privilege": {
    "fundamental": "Every permission a component holds is a permission its compromise hands over. The size of a credential should track the size of the current step, not the size of the role.",
    "mechanism": "Scope each stage's token to exactly what that stage does — read-only where nothing is written, and write access limited to the one operation a job exists to perform — rather than issuing one broad credential up front."
  },
  "defense-in-depth": {
    "fundamental": "Design each layer as if the layer above it has already failed. Security then depends on the odds of every control failing at once, not on any single control being perfect.",
    "mechanism": "Stack controls built on different assumptions and different failure modes — kernel and container isolation, scoped tokens and validated configuration, staged execution enforced over time — so a breach of one is still contained by the others.",
    "sources": [
      {
        "label": "GitHub Agentic Workflows — Security Architecture",
        "url": "https://github.github.com/gh-aw/introduction/architecture/"
      }
    ]
  },
  "blast-radius": {
    "fundamental": "You cannot promise a component will never be compromised. You can promise what happens if it is — and that second number, not the first, is where design effort pays off.",
    "mechanism": "For every component, ask what it could read, reach, or change if it were fully controlled by an adversary right now. Shrink that answer with narrower tokens, no shared state, and one stage at a time, rather than only hardening the component itself."
  },
  "sandbox": {
    "fundamental": "A control only holds if it survives the compromise of what it constrains. A sandbox works because it is enforced by a layer the sandboxed process cannot reach or negotiate with.",
    "mechanism": "Isolate memory, filesystem and network at the substrate below the process — containers for memory and filesystem, an egress proxy with a domain allowlist for network — so the boundary holds regardless of what the process inside it does.",
    "sources": [
      {
        "label": "GitHub Agentic Workflows — Security Architecture",
        "url": "https://github.github.com/gh-aw/introduction/architecture/"
      }
    ]
  }
});
