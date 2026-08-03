/* Living Book — content source.
   Chapters and concepts are data. Adding, revising, or retiring a chapter is an
   edit to this file only; nothing in the markup names a chapter.

   Block depth semantics (the RANGE dial reads these):
     1 SPINE    the load-bearing claims, nothing else
     2 WORKING  what you need to actually use the idea
     3 FULL     examples, figures, nuance
     4 SOURCE   derivations, code, caveats, references

   Inline concept markup: [[concept-id]] or [[concept-id|display text]]
*/
window.BOOK = {
  meta: {
    title: 'Living Book',
    subtitle: 'A book that keeps moving',
    reader: 'Sarah',
    compiled: '2026-08-03'
  },

  /* ── Growth areas. Five recorder channels, five pen inks. ─────────────── */
  areas: [
    { id: 'tech',  name: 'Technical growth', ink: '#d2452f', target: 240 },
    { id: 'comm',  name: 'Communication',    ink: '#d98a1f', target: 90  },
    { id: 'learn', name: 'Learning',         ink: '#1f8a5b', target: 120 },
    { id: 'mem',   name: 'Memory',           ink: '#2f6fd4', target: 90  },
    { id: 'think', name: 'Thinking',         ink: '#7a4fd0', target: 150 }
  ],

  /* ── Concepts and fundamental patterns. ───────────────────────────────── */
  concepts: [
    { id: 'impedance-mismatch', term: 'Impedance mismatch', kind: 'pattern', area: 'tech',
      short: 'Two systems that are each internally coherent but disagree about the shape of what they exchange.',
      fundamental: 'Wherever two components meet, the cost of the boundary is set by how far apart their native representations are — not by how fast either side runs.',
      mechanism: 'The boundary inserts a translation step. Translation costs allocation, copying, and a serial bottleneck that neither side can optimise away, because neither side owns it. Speeding up either component leaves the translation untouched, so the boundary becomes a larger and larger share of total time.',
      seeAlso: ['serialization', 'columnar', 'row-oriented', 'zero-copy'],
      sources: [{ label: 'Arrow — why a shared in-memory format', url: 'https://arrow.apache.org/overview/' }] },

    { id: 'row-oriented', term: 'Row-oriented layout', kind: 'concept', area: 'tech',
      short: 'Values belonging to one record are stored adjacently.',
      fundamental: 'Storage order is an implicit bet about access order. Rows bet you want whole records.',
      mechanism: 'Reading one field of a million records touches a million separate cache lines, most of whose bytes you discard. Reading one whole record touches one.',
      seeAlso: ['columnar', 'cache-line'] },

    { id: 'columnar', term: 'Columnar layout', kind: 'concept', area: 'tech',
      short: 'Values belonging to one field are stored adjacently, across all records.',
      fundamental: 'Storage order is an implicit bet about access order. Columns bet you want whole fields.',
      mechanism: 'One field of a million records becomes one contiguous run. The prefetcher predicts it, the cache line is fully used, the type is uniform so the loop can be vectorised, and the values compress well because neighbours resemble each other.',
      seeAlso: ['cache-line', 'vectorization', 'arrow', 'layout-is-interface'] },

    { id: 'layout-is-interface', term: 'Layout is an interface', kind: 'pattern', area: 'tech',
      short: 'The memory arrangement of your data is a public contract, not an implementation detail.',
      fundamental: 'Any representation two parties agree on becomes an interface, whether or not anyone documented it. Agreeing on the bytes removes the translation; agreeing only on the semantics guarantees it.',
      mechanism: 'When producer and consumer share a layout, handing data over is passing a pointer. When they share only a schema, handing data over is encode, transmit, decode. Same semantics, different order of magnitude.',
      seeAlso: ['arrow', 'zero-copy', 'impedance-mismatch'] },

    { id: 'serialization', term: 'Serialization', kind: 'concept', area: 'tech',
      short: 'Turning in-memory structure into a byte sequence, and back.',
      fundamental: 'Every format conversion is a full pass over the data with allocation at the far end. It is invisible in profiles that only measure "the query".',
      mechanism: 'Encode walks the source structure and writes a linear buffer; the decoder allocates and rebuilds. Cost scales with values, not bytes, so wide narrow rows are the worst case.',
      seeAlso: ['zero-copy', 'impedance-mismatch', 'odbc'] },

    { id: 'zero-copy', term: 'Zero-copy', kind: 'concept', area: 'tech',
      short: 'Handing over data by reference because both sides already agree on its layout.',
      fundamental: 'The fastest transformation is the one you deleted, and you delete it by making the two ends agree beforehand.',
      mechanism: 'Producer writes buffers in the shared layout. Consumer reads those same buffers. No encode, no decode, no second allocation; often no crossing of a process boundary at all.',
      seeAlso: ['arrow', 'adbc', 'layout-is-interface'] },

    { id: 'cache-line', term: 'Cache line', kind: 'concept', area: 'tech',
      short: 'The fixed-size block, typically 64 bytes, that memory actually moves in.',
      fundamental: 'You never fetch a value; you fetch its neighbourhood. Locality is therefore free performance you either collect or discard.',
      mechanism: 'Touching one byte pulls 64. If the other 63 are useful, you got them free. If they belong to fields you are not reading, you paid full price for waste.',
      seeAlso: ['columnar', 'row-oriented'] },

    { id: 'vectorization', term: 'Vectorization', kind: 'concept', area: 'tech',
      short: 'One instruction applied to many values at once.',
      fundamental: 'Uniformity is what makes parallelism cheap. Heterogeneous data forces the loop back to one value at a time.',
      mechanism: 'A SIMD register holds 8 or 16 values of the same type. The loop needs contiguity, uniform type, and no per-value branching — exactly what a column gives you and a row does not.',
      seeAlso: ['columnar', 'batch'] },

    { id: 'batch', term: 'Batch', kind: 'concept', area: 'tech',
      short: 'Paying a fixed cost once for many items instead of once per item.',
      fundamental: 'Any per-call overhead becomes negligible or dominant depending only on how many items ride along with it.',
      mechanism: 'Fixed cost F, per-item cost c, batch size n: cost per item is F/n + c. The curve is a hyperbola — brutal at n=1, nearly flat past a few thousand.',
      seeAlso: ['amortization', 'cursor'] },

    { id: 'amortization', term: 'Amortization', kind: 'pattern', area: 'tech',
      short: 'Spreading a fixed cost across enough work that it stops mattering.',
      fundamental: 'When a cost is fixed per operation, the design lever is not making it cheaper — it is making the operation bigger.',
      mechanism: 'Identify what is charged per call rather than per byte: round trips, allocations, locks, context switches, syscalls, model calls. Then enlarge the unit of work until the fixed term is noise.',
      seeAlso: ['batch', 'littles-law'] },

    { id: 'cursor', term: 'Cursor', kind: 'concept', area: 'tech',
      short: 'A handle you advance to pull results one row at a time.',
      fundamental: 'An interface shaped for the smallest unit forces every consumer to pay per-unit overhead, even one that wanted the whole set.',
      mechanism: 'Each fetch crosses the driver boundary with binding, conversion, and often a round trip. The row is a fine mental model and a poor transfer unit.',
      seeAlso: ['odbc', 'batch'] },

    { id: 'odbc', term: 'ODBC', kind: 'concept', area: 'tech',
      short: 'A 1992 C API for database access, built around row-at-a-time cursors and bound buffers.',
      fundamental: 'An interface encodes the hardware assumptions of its era, and then outlives them.',
      mechanism: 'The client binds application variables to result columns; the driver converts each value into those bindings as rows are fetched. Correct, universal, and per-value — which is why analytics traffic through it is dominated by conversion.',
      seeAlso: ['cursor', 'adbc', 'impedance-mismatch'] },

    { id: 'adbc', term: 'ADBC', kind: 'concept', area: 'tech',
      short: 'Arrow Database Connectivity: the same idea as ODBC with columnar batches as the transfer unit.',
      fundamental: 'You do not fix a boundary by optimising the translation. You fix it by removing the disagreement.',
      mechanism: 'The driver returns Arrow record batches. If the engine already speaks Arrow, the result reaches the consumer without a value-by-value conversion anywhere in the path.',
      seeAlso: ['arrow', 'zero-copy', 'odbc'],
      sources: [{ label: 'ADBC specification', url: 'https://arrow.apache.org/adbc/' }] },

    { id: 'arrow', term: 'Apache Arrow', kind: 'concept', area: 'tech',
      short: 'A standard in-memory columnar layout that many systems agree on.',
      fundamental: 'A shared representation converts an N×N translation problem into N adapters.',
      mechanism: 'Arrow specifies the bytes: buffers, validity bitmaps, offsets, alignment. Anything that emits Arrow can be read by anything that reads Arrow, in the same process or over the wire, without decoding.',
      seeAlso: ['columnar', 'zero-copy', 'layout-is-interface'] },

    { id: 'littles-law', term: "Little's law", kind: 'concept', area: 'tech',
      short: 'Items in the system = arrival rate × time each spends there. L = λW.',
      fundamental: 'Three quantities, one equation, no assumptions about the distribution. Fix any two and the third is decided for you.',
      mechanism: 'It holds for any stable system over a long enough window. Its most practical use is negative: it tells you which of your three targets was already impossible.',
      seeAlso: ['utilization', 'throughput', 'latency'] },

    { id: 'utilization', term: 'Utilization', kind: 'concept', area: 'tech',
      short: 'The fraction of time a resource is busy.',
      fundamental: 'Queueing delay grows as ρ/(1−ρ). Past about 80% the curve stops being a slope and becomes a wall.',
      mechanism: 'A busy server cannot absorb variance, so arrivals wait for arrivals. At 50% you wait about one service time; at 90% about nine; at 99% about ninety-nine.',
      seeAlso: ['littles-law', 'tail-latency', 'slack'] },

    { id: 'slack', term: 'Slack', kind: 'pattern', area: 'think',
      short: 'Deliberately unused capacity, which is what absorbs variance.',
      fundamental: 'A system run at full utilization has traded all of its responsiveness for throughput, and the trade is not linear — the last tenth of utilization costs most of the responsiveness.',
      mechanism: 'Variance has to go somewhere: into spare capacity, into queues, or into failures. Removing slack does not remove variance; it relocates it into delay.',
      seeAlso: ['utilization', 'tail-latency'] },

    { id: 'tail-latency', term: 'Tail latency', kind: 'concept', area: 'tech',
      short: 'What the slowest few percent of requests experience.',
      fundamental: 'Averages describe the system; tails describe the experience. Fan-out turns a rare tail into a common one.',
      mechanism: 'A request touching 100 services, each with a 1% slow path, is slow about 63% of the time. The tail stops being an outlier once you multiply it.',
      seeAlso: ['utilization', 'latency'] },

    { id: 'latency', term: 'Latency', kind: 'concept', area: 'tech',
      short: 'Time for one item to get through.',
      fundamental: 'Latency and throughput are different quantities that trade against each other; optimising one silently taxes the other.',
      mechanism: 'Batching raises throughput and raises latency for the first item in the batch. Pipelining raises throughput without raising latency but adds coordination.',
      seeAlso: ['throughput', 'littles-law', 'batch'] },

    { id: 'throughput', term: 'Throughput', kind: 'concept', area: 'tech',
      short: 'Items completed per unit time.',
      fundamental: 'Throughput is set by the narrowest stage, and only by that stage.',
      mechanism: 'Improving a non-bottleneck stage changes nothing measurable. This is why performance work not preceded by measurement usually produces no result.',
      seeAlso: ['latency', 'littles-law'] },

    { id: 'forgetting-curve', term: 'Forgetting curve', kind: 'concept', area: 'mem',
      short: 'Retention decays roughly exponentially from the moment of learning.',
      fundamental: 'Forgetting is the default and it is fast. Any learning system that does not schedule against decay is relying on luck.',
      mechanism: 'Retrievability falls steeply in the first days, then flattens. Each successful retrieval resets the curve and reduces its slope, so intervals can grow.',
      seeAlso: ['spacing-effect', 'retrieval-practice'] },

    { id: 'spacing-effect', term: 'Spacing effect', kind: 'concept', area: 'mem',
      short: 'The same total study time produces far more retention when distributed than when massed.',
      fundamental: 'Difficulty at retrieval time is what produces durability. Spacing manufactures that difficulty for free, by letting decay happen first.',
      mechanism: 'Reviewing while the memory is still fresh does almost nothing. Reviewing just before you would have forgotten does the most. The optimal interval is therefore always slightly uncomfortable.',
      seeAlso: ['forgetting-curve', 'desirable-difficulty', 'retrieval-practice'] },

    { id: 'retrieval-practice', term: 'Retrieval practice', kind: 'concept', area: 'mem',
      short: 'Pulling something out of memory strengthens it far more than putting it in again.',
      fundamental: 'The act of reconstruction is the learning event. Recognition feels like knowing, and is not.',
      mechanism: 'Re-reading raises fluency, which raises confidence, which is why it feels effective. A failed retrieval followed by the answer beats a comfortable re-read on every delayed test.',
      seeAlso: ['spacing-effect', 'desirable-difficulty'] },

    { id: 'desirable-difficulty', term: 'Desirable difficulty', kind: 'pattern', area: 'mem',
      short: 'Conditions that slow learning down in the moment and improve it in the long run.',
      fundamental: 'Immediate performance and durable learning are different quantities, and are often inversely related. Optimising the feeling of a session optimises the wrong one.',
      mechanism: 'Spacing, interleaving, testing, and generating rather than being shown all reduce in-session fluency and raise delayed retention. The discomfort is the signal that it is working.',
      seeAlso: ['spacing-effect', 'interleaving', 'retrieval-practice'] },

    { id: 'interleaving', term: 'Interleaving', kind: 'concept', area: 'mem',
      short: 'Mixing problem types instead of blocking them.',
      fundamental: 'Blocked practice trains execution; interleaved practice trains selection. Real problems arrive unlabelled.',
      mechanism: 'Blocking lets you reuse the previous answer\u2019s approach without deciding. Interleaving forces you to identify the situation first, which is the part you actually need later.',
      seeAlso: ['desirable-difficulty', 'transfer'] },

    { id: 'invariant', term: 'Invariant', kind: 'pattern', area: 'think',
      short: 'What stays true while everything around it changes.',
      fundamental: 'Understanding a system means knowing what it will not let you break. Invariants are the smallest description with the most predictive power.',
      mechanism: 'Ask what is conserved, what is monotonic, and what can never hold simultaneously. Then every question about behaviour becomes a question about whether an invariant is threatened.',
      seeAlso: ['first-principle', 'constraint'] },

    { id: 'first-principle', term: 'First principle', kind: 'pattern', area: 'think',
      short: 'The lowest statement in a chain of reasoning that is not itself derived from something in the domain.',
      fundamental: 'Drilling a concept until it stops being about its domain is what makes it portable to domains you have not met yet.',
      mechanism: 'Take a claim, ask why it is true, repeat. Stop when the answer is physics, arithmetic, information, or economics. That stopping point is what transfers.',
      seeAlso: ['invariant', 'transfer', 'analogy'] },

    { id: 'constraint', term: 'Constraint', kind: 'concept', area: 'think',
      short: 'Something the system is not permitted to do.',
      fundamental: 'Constraints are more informative than goals. Goals tell you where a system is aiming; constraints tell you where it will end up.',
      mechanism: 'Enumerate what is impossible and the space of possible designs collapses fast, usually to a handful. Most design arguments are really disagreements about which constraints are real.',
      seeAlso: ['invariant', 'slack'] },

    { id: 'analogy', term: 'Associative thinking', kind: 'pattern', area: 'think',
      short: 'Reaching a new idea through its structural resemblance to one you already hold.',
      fundamental: 'Novel ideas are mostly recombinations. The limiting factor is not intelligence but how many structures you hold in a form abstract enough to match against.',
      mechanism: 'Store ideas by their shape rather than their subject and unrelated fields start colliding usefully. Queueing delay and memory decay are the same curve: a rate acting against a store.',
      seeAlso: ['first-principle', 'transfer'] },

    { id: 'abstraction-ladder', term: 'Ladder of abstraction', kind: 'pattern', area: 'comm',
      short: 'The same idea stated at many altitudes, from concrete instance to general law.',
      fundamental: 'Understanding is the ability to move up and down the ladder on demand. Being stuck on one rung looks like understanding and is not.',
      mechanism: 'Down: give an instance. Up: name what the instance is an instance of. A reader who cannot descend has memorised; a reader who cannot ascend cannot transfer.',
      seeAlso: ['transfer', 'curse-of-knowledge'] },

    { id: 'curse-of-knowledge', term: 'Curse of knowledge', kind: 'concept', area: 'comm',
      short: 'Once you know something, you cannot reconstruct not knowing it.',
      fundamental: 'Expertise systematically destroys the model of the audience that the expert needs in order to explain.',
      mechanism: 'Chunking makes several steps feel like one, so they get skipped without anyone noticing a gap. The repair is not simplification; it is naming the steps that became invisible.',
      seeAlso: ['abstraction-ladder', 'shared-referent'] },

    { id: 'shared-referent', term: 'Shared referent', kind: 'concept', area: 'comm',
      short: 'A concrete thing both people can point at.',
      fundamental: 'Two people can agree on every word and mean different things until something specific is on the table.',
      mechanism: 'Introduce the instance before the abstraction: one query, one diagram, one number. Everything afterwards has somewhere to attach.',
      seeAlso: ['curse-of-knowledge', 'abstraction-ladder'] },

    { id: 'intuition', term: 'Intuition', kind: 'concept', area: 'learn',
      short: 'Fast, non-verbal judgement produced by compressed experience.',
      fundamental: 'Intuition is not the opposite of rigour; it is rigour run often enough to become a lookup.',
      mechanism: 'It forms where feedback is fast, frequent, and honest, and fails to form where feedback is slow or noisy. That is why it develops well for latency and badly for architecture.',
      seeAlso: ['worked-example', 'transfer'] },

    { id: 'worked-example', term: 'Worked example', kind: 'concept', area: 'learn',
      short: 'A fully solved instance studied before attempting your own.',
      fundamental: 'While the schema is missing, problem-solving spends all attention on search and none on learning.',
      mechanism: 'Study complete solutions early, then fade the support step by step until you are solving unaided. Beginners learn faster from examples; experts learn faster from problems.',
      seeAlso: ['intuition', 'desirable-difficulty'] },

    { id: 'transfer', term: 'Transfer', kind: 'pattern', area: 'learn',
      short: 'Using something learned in one setting in a setting that does not resemble it.',
      fundamental: 'Transfer follows the abstraction level at which you encoded the idea. Encoded as a fact about ODBC it stays there; encoded as a boundary cost it shows up everywhere.',
      mechanism: 'Deliberately restate every new idea once with its domain nouns removed. What survives is the part that will be available to you in an unfamiliar situation.',
      seeAlso: ['first-principle', 'analogy', 'abstraction-ladder'] },

    /* ── Fabric: storage, format, capacity ─────────────────────────────── */
    { id: 'onelake', term: 'OneLake', kind: 'concept', area: 'tech',
      short: 'One automatically provisioned lake per Fabric tenant, that every engine reads from without copying.',
      fundamental: 'When every consumer is forced onto one storage namespace, integration stops being a pipeline problem and becomes a permissions problem.',
      mechanism: 'It is ADLS Gen2 underneath, addressed as tenant → workspace (a container) → item (a folder). Warehouse, Spark, KQL and Analysis Services all read the same Delta-Parquet files in place.',
      seeAlso: ['shortcut', 'delta-lake', 'layout-is-interface', 'invariant'],
      sources: [{ label: 'OneLake, the unified data lake', url: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview' }] },

    { id: 'shortcut', term: 'Shortcut', kind: 'concept', area: 'tech',
      short: 'An object in OneLake that points at data somewhere else and appears as an ordinary folder.',
      fundamental: 'A shortcut is a symlink for analytics: it moves the integration boundary out of the pipeline and into the namespace.',
      mechanism: 'It stores a target path, not bytes. Reads resolve through to S3, ADLS Gen2, GCS, Dataverse or another OneLake item, passing your identity or a bound connection. Deleting it never deletes the target.',
      seeAlso: ['indirection', 'zero-copy', 'onelake', 'layout-is-interface'],
      sources: [{ label: 'Unify data sources with OneLake shortcuts', url: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts' }] },

    { id: 'indirection', term: 'Indirection', kind: 'pattern', area: 'think',
      short: 'Replacing a thing with a reference to the thing, so the reference can be rebound later.',
      fundamental: 'Every hard problem yields to another level of indirection, and the cost is always the same: one more place where the truth can be stale or wrong.',
      mechanism: 'Ask what is being named, who resolves the name, and when. The answers tell you what you have bought (late binding) and what you have paid (a resolution step, and a lie that is now possible).',
      seeAlso: ['shortcut', 'zero-copy', 'abstraction-ladder', 'layout-is-interface'] },

    { id: 'delta-lake', term: 'Delta Lake', kind: 'concept', area: 'tech',
      short: 'A transaction log laid over a directory of Parquet files, which turns a pile of files into a table.',
      fundamental: 'A log that names the current file set is what converts eventually-consistent object storage into something with transactions.',
      mechanism: 'The `_delta_log` directory records which files belong to which version. That single indirection buys ACID commits, schema enforcement, time travel, and a definition of “dead file” that VACUUM can act on.',
      seeAlso: ['onelake', 'invariant', 'columnar', 'row-group'],
      sources: [{ label: 'Delta Lake table format interoperability', url: 'https://learn.microsoft.com/en-us/fabric/fundamentals/delta-lake-interoperability' }] },

    { id: 'v-order', term: 'V-Order', kind: 'concept', area: 'tech',
      short: 'A write-time Parquet optimisation that pre-arranges encoding so the Power BI engine can load it almost without translating.',
      fundamental: 'If you know who reads the file, you can pay their decoding cost once at write time instead of every time they read.',
      mechanism: 'It arranges row-group layout, dictionary encoding and compression to match what VertiPaq expects, so transcoding becomes an ID remap rather than a re-encode. Files stay valid open Parquet.',
      seeAlso: ['layout-is-interface', 'amortization', 'transcoding', 'serialization'],
      sources: [{ label: 'Delta Lake table optimization and V-Order', url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/delta-optimization-and-v-order' }] },

    { id: 'row-group', term: 'Row group', kind: 'concept', area: 'tech',
      short: 'A horizontal slice inside a Parquet file holding the column chunks for a block of rows.',
      fundamental: 'Columnar formats are still chunked by rows somewhere, because a reader needs a unit it can skip, parallelise and hold in memory.',
      mechanism: 'It is the unit of read parallelism, of statistics-based skipping, and of dictionary merging when a column is pulled into memory. Too many small ones and the overhead dominates the data.',
      seeAlso: ['columnar', 'batch', 'cache-line', 'vectorization'] },

    { id: 'write-amplification', term: 'Write amplification', kind: 'concept', area: 'tech',
      short: 'Writing far more bytes than the change actually contained.',
      fundamental: 'When the unit you must rewrite is larger than the unit you changed, cost is set by the block size, not by the edit.',
      mechanism: 'A one-row update that forces a 1 GB file to be rewritten is amplification of about a billion to one. Look for it wherever compaction, immutability or fixed-size blocks meet small frequent changes.',
      seeAlso: ['amortization', 'batch', 'delta-lake', 'constraint'] },

    { id: 'capacity-unit', term: 'Capacity unit', kind: 'concept', area: 'tech',
      short: 'Fabric\u2019s unit of compute. The SKU number is the rate: an F2 supplies 2 CUs every second, continuously.',
      fundamental: 'Buying a rate is not the same as buying an amount; everything strange about capacity follows from confusing the two.',
      mechanism: 'Think of it as a tap, not a tank. An F2 delivers 2 CU/s — 60 CUs in each 30-second timepoint, 172,800 across a day — and the whole bursting-and-smoothing apparatus exists to reconcile a steady tap with spiky demand.',
      seeAlso: ['throughput', 'utilization', 'littles-law', 'bursting'],
      sources: [{ label: 'Understand Microsoft Fabric licenses', url: 'https://learn.microsoft.com/en-us/fabric/enterprise/licenses' }] },

    { id: 'bursting', term: 'Bursting', kind: 'concept', area: 'tech',
      short: 'Letting an operation consume compute faster than the capacity\u2019s sustained rate.',
      fundamental: 'Bursting trades a rate limit for a debt: the work finishes sooner, and the bill arrives on a later clock tick.',
      mechanism: 'The job runs as fast as it can rather than being paced to the SKU. What it consumed is then owed, which is why bursting is meaningless without smoothing.',
      seeAlso: ['smoothing', 'capacity-unit', 'slack', 'amortization'],
      sources: [{ label: 'Understand your Fabric capacity throttling', url: 'https://learn.microsoft.com/en-us/fabric/enterprise/throttling' }] },

    { id: 'smoothing', term: 'Smoothing', kind: 'concept', area: 'tech',
      short: 'Spreading what an operation consumed across many later timepoints instead of charging it all at once.',
      fundamental: 'Amortisation applied to a rate limit: if you average demand over a long enough window, a spike stops looking like a spike.',
      mechanism: 'Background operations are spread over 24 hours — 2,880 timepoints of 30 seconds. Interactive operations get a shorter window, a minimum of five minutes and up to sixty-four.',
      seeAlso: ['amortization', 'bursting', 'utilization', 'slack'],
      sources: [{ label: 'Understand your Fabric capacity throttling', url: 'https://learn.microsoft.com/en-us/fabric/enterprise/throttling' }] },

    { id: 'throttling', term: 'Throttling', kind: 'concept', area: 'tech',
      short: 'Progressive slowing and then refusal, once smoothed consumption has borrowed too far into the future.',
      fundamental: 'A well-designed limit degrades in stages, because a system that is fine until it is dead teaches its operators nothing.',
      mechanism: 'Under ten minutes of borrowed capacity, nothing happens. Past ten, new interactive work is delayed twenty seconds. Past sixty, interactive work is rejected. Past twenty-four hours, everything is.',
      seeAlso: ['progressive-degradation', 'utilization', 'smoothing', 'tail-latency'],
      sources: [{ label: 'Understand your Fabric capacity throttling', url: 'https://learn.microsoft.com/en-us/fabric/enterprise/throttling' }] },

    { id: 'progressive-degradation', term: 'Progressive degradation', kind: 'pattern', area: 'think',
      short: 'Failing in visible stages rather than at a single cliff edge.',
      fundamental: 'A limit that is invisible until it is fatal cannot be learned from; staged degradation converts a cliff into a gradient someone can feel.',
      mechanism: 'Ask what happens at 90, 100 and 150 percent of the limit. If the three answers are “fine, fine, dead”, you have a cliff, and someone will walk off it.',
      seeAlso: ['throttling', 'slack', 'tail-latency', 'constraint'] },

    { id: 'direct-lake', term: 'Direct Lake', kind: 'concept', area: 'tech',
      short: 'A Power BI mode that pulls Parquet columns straight from the lake into the in-memory engine, with no scheduled copy and no SQL translation.',
      fundamental: 'When storage and the query engine already agree on a representation, the refresh step is not optimised — it is deleted.',
      mechanism: 'Import copies everything on a schedule; DirectQuery translates every question to SQL. Direct Lake does neither: it loads the columns a query actually needs, on demand, and keeps them resident.',
      seeAlso: ['transcoding', 'framing', 'v-order', 'zero-copy'],
      sources: [{ label: 'Direct Lake overview', url: 'https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview' }] },

    { id: 'transcoding', term: 'Transcoding', kind: 'concept', area: 'tech',
      short: 'Loading one Parquet column into the in-memory engine, merging its per-file dictionaries into one.',
      fundamental: 'The cost of crossing a boundary is set by how far apart the two encodings are, not by how much data crosses it.',
      mechanism: 'If the Parquet column is dictionary-encoded the way VertiPaq expects, the load is an ID remap. If it is plain- or delta-encoded, the column must be re-encoded from scratch.',
      seeAlso: ['v-order', 'serialization', 'impedance-mismatch', 'direct-lake'],
      sources: [{ label: 'Understand Direct Lake query performance', url: 'https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-understand-storage' }] },

    { id: 'framing', term: 'Framing', kind: 'concept', area: 'tech',
      short: 'A Direct Lake refresh that reads only the transaction log and repoints the model at the current files.',
      fundamental: 'If a refresh only has to agree on which version is current, it costs metadata time rather than data time.',
      mechanism: 'It reads the Delta log, updates file pointers, and evicts only the column segments whose files actually changed. Seconds, not minutes — and the model then shows that frozen version until the next framing.',
      seeAlso: ['delta-lake', 'direct-lake', 'invariant', 'amortization'],
      sources: [{ label: 'How Direct Lake works', url: 'https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-how-it-works' }] },

    { id: 'medallion', term: 'Medallion architecture', kind: 'concept', area: 'tech',
      short: 'Bronze, silver and gold layers: raw as landed, cleaned and conformed, then shaped for consumption.',
      fundamental: 'Naming the layers is really naming who each one is optimised for, which is what lets you make different tradeoffs in each.',
      mechanism: 'It is why one optimisation answer is wrong across a lake: bronze is write-heavy so read-time preparation is waste there, and gold is read-heavy so it is worth paying for.',
      seeAlso: ['v-order', 'abstraction-ladder', 'amortization', 'layout-is-interface'],
      sources: [{ label: 'Implement medallion lakehouse architecture in Fabric', url: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture' }] }
  ],

  /* ── Chapters. State drives the rack lamps. ──────────────────────────── */
  chapters: [
    {
      id: 'boundary',
      title: 'Where the data stops being data',
      area: 'tech',
      state: 'evolving',
      added: '2026-07-11', revised: '2026-08-01', minutes: 11,
      summary: 'A query that runs in 200 ms can take nine seconds to arrive. The gap is not the database and not the network — it is the shape disagreement at the driver boundary.',
      blocks: [
        { d: 1, t: 'p', x: 'A query returns in 200 ms. Your notebook shows the result nine seconds later. Nothing in the query plan explains it, nothing in the network trace explains it, and adding cores to either end changes almost nothing.' },
        { d: 1, t: 'p', x: 'The time is going into the boundary. The engine holds columns; your client wants rows of language-native objects. The gap between those two shapes is an [[impedance-mismatch]], and it is paid per value.' },
        { d: 2, t: 'h', x: 'Per value, not per byte' },
        { d: 2, t: 'p', x: 'This is the detail that makes the arithmetic surprising. [[serialization]] cost tracks the number of values, not the number of bytes. Ten million rows of six narrow integer columns is sixty million conversions, and every one of them is a function call, a type check, and usually an allocation.' },
        { d: 2, t: 'p', x: 'A wide table of long strings can move faster than a narrow table of small integers carrying the same total bytes. Once you have seen that once, the boundary stops being invisible.' },
        { d: 3, t: 'figure', fig: 'transfer', caption: 'Move the slider. Row-at-a-time crosses the boundary once per value; columnar batches cross it once per batch. The counters are the honest part — watch conversions, not the bar.' },
        { d: 2, t: 'h', x: 'Why the old interface is built this way' },
        { d: 2, t: 'p', x: '[[odbc]] was designed in 1992, for transactional work, on machines where a result set was tens of rows and memory was the scarce resource. Its transfer unit is the [[cursor|row cursor]]: you bind application variables to columns and the driver fills them as you advance.' },
        { d: 3, t: 'p', x: 'For “fetch this customer record”, that is exactly right. For “fetch this fact table”, it means the interface itself is the bottleneck, and no driver can optimise its way out of a contract that says one row at a time.' },
        { d: 3, t: 'aside', x: 'Interfaces outlive the hardware assumptions they were designed against. Reading an old API well means reading it as an artefact of its constraints, not as a mistake.' },
        { d: 1, t: 'p', x: '[[adbc]] does not make the translation faster. It removes the disagreement: the driver hands back [[arrow|Arrow]] record batches, and if the engine already speaks Arrow, no value is converted anywhere in the path. That is [[zero-copy]].' },
        { d: 2, t: 'prompt', q: 'Two tables carry the same total bytes. One is narrow and numeric, the other wide with long strings. Which crosses a row-at-a-time boundary faster, and why?',
          a: 'The wide string table. Conversion cost scales with the number of values, not bytes, so the narrow numeric table has far more per-value work despite the identical volume.', concept: 'serialization' },
        { d: 3, t: 'h', x: 'The generalisation' },
        { d: 3, t: 'p', x: 'Strip the database nouns out and what remains is this: when two components disagree about representation, the cost of the boundary grows independently of either side, so optimising either side has diminishing returns. That is why this chapter is filed under [[layout-is-interface]] and not under drivers.' },
        { d: 3, t: 'p', x: 'The same shape appears between services that re-encode JSON at every hop, between a GPU and a host that keep different tensor layouts, and between two teams whose models of the same customer disagree by one field.' },
        { d: 4, t: 'code', lang: 'python', x: 'conn = adbc_driver_postgresql.dbapi.connect(uri)\ncur = conn.cursor()\ncur.execute("select * from facts where day = ?", (day,))\n\n# arrow batches out; no per-value conversion in this path\ntable = cur.fetch_arrow_table()\ndf = table.to_pandas(zero_copy_only=True)   # raises if a copy is required' },
        { d: 4, t: 'p', x: 'Keeping `zero_copy_only=True` on during exploration is worth the noise. It turns a silent copy into a loud error, which is the only reliable way to discover that one nullable integer column quietly forced a full materialisation.' },
        { d: 4, t: 'prompt', q: 'What does L = λW let you rule out before you start tuning a pipeline?', a: 'Any pair of targets that fixes the third at an impossible value — for example a required throughput and a concurrency cap that together demand a latency the system cannot reach.', concept: 'littles-law' }
      ],
      sources: [
        { label: 'Arrow Database Connectivity (ADBC)', url: 'https://arrow.apache.org/adbc/', note: 'The interface that removes the conversion rather than speeding it up.' },
        { label: 'Apache Arrow columnar format specification', url: 'https://arrow.apache.org/docs/format/Columnar.html', note: 'The agreement that makes zero-copy possible at all.' },
        { label: 'Wes McKinney — Apache Arrow and the “10 things I hate about pandas”', url: 'https://wesmckinney.com/blog/apache-arrow-pandas-internals/', note: 'The original argument for fixing the boundary instead of the endpoints.' }
      ]
    },

    {
      id: 'layout',
      title: 'Layout is an interface',
      area: 'tech',
      state: 'live',
      added: '2026-06-02', revised: '2026-07-19', minutes: 9,
      summary: 'Row versus column is usually taught as a storage tradeoff. It is better understood as a bet about access order, made once, that the hardware then rewards or punishes on every read.',
      blocks: [
        { d: 1, t: 'p', x: 'You never fetch a value from memory. You fetch its neighbourhood — a [[cache-line]], typically 64 bytes. Whether the other 63 bytes are useful was decided by a layout choice made long before the read.' },
        { d: 1, t: 'p', x: '[[row-oriented|Row layout]] bets you want whole records. [[columnar|Column layout]] bets you want whole fields. Neither is faster; each is faster at the thing it bet on.' },
        { d: 2, t: 'h', x: 'What a column buys, precisely' },
        { d: 2, t: 'list', items: [
          'Full cache lines. Every byte fetched is a byte you asked for.',
          'A predictable stride, so the hardware prefetcher can run ahead of you.',
          'Uniform type with no per-value branching, which is what [[vectorization]] requires.',
          'Neighbours that resemble each other, so run-length and dictionary encoding actually work.'
        ] },
        { d: 3, t: 'p', x: 'Those are not four optimisations. They are one decision, collected four times. Layout choices are characteristically like this: cheap to make, and compounding in both directions.' },
        { d: 2, t: 'prompt', q: 'Why does columnar data compress so much better than row data holding identical values?',
          a: 'Compression exploits similarity between neighbours. In a column, neighbours are values of the same field and are often nearly identical. In a row, neighbours are unrelated fields of different types.', concept: 'columnar' },
        { d: 2, t: 'h', x: 'The part that is actually the point' },
        { d: 2, t: 'p', x: 'Once two systems agree on a layout, that layout has become an interface whether or not anyone wrote it down. [[arrow|Arrow]] made the agreement explicit: buffers, validity bitmaps, offsets, alignment. Agreement becomes a fact rather than a coincidence.' },
        { d: 3, t: 'p', x: 'The leverage is combinatorial. N systems that each speak their own format need N² adapters; N systems that speak one shared layout need N. That is the whole argument, and it is the same argument as USB, the shipping container, and a common data model inside an organisation.' },
        { d: 3, t: 'aside', x: 'Whenever a standard wins, check whether it won on quality or on the exponent. Mostly it is the exponent.' },
        { d: 4, t: 'p', x: 'The honest counterweight: columnar is worse at point lookups and worse at writes that touch whole records, because one record is now scattered across as many buffers as it has fields. Hybrid layouts — PAX, and the row-group structure inside Parquet — exist precisely because the bet is rarely all-or-nothing.' }
      ],
      sources: [
        { label: 'Ulrich Drepper — What Every Programmer Should Know About Memory', url: 'https://people.freebsd.org/~lstewart/articles/cpumemory.pdf', note: 'Where the cache-line argument comes from, in full and painful detail.' },
        { label: 'Apache Parquet file format specification', url: 'https://parquet.apache.org/docs/file-format/', note: 'The hybrid row-group structure that keeps the bet from being all-or-nothing.' },
        { label: 'Apache Arrow columnar format specification', url: 'https://arrow.apache.org/docs/format/Columnar.html' }
      ]
    },

    {
      id: 'bottleneck',
      title: 'The shape of a bottleneck',
      area: 'tech',
      state: 'new',
      added: '2026-08-01', revised: '2026-08-01', minutes: 7,
      summary: 'Queueing delay is not linear in load. Everything about capacity planning follows from that one curve, including why the last tenth of utilization costs almost everything.',
      blocks: [
        { d: 1, t: 'p', x: 'Wait time does not rise in proportion to load. It rises as ρ/(1−ρ). At 50% [[utilization]] you wait about one service time. At 90%, nine. At 99%, ninety-nine.' },
        { d: 1, t: 'p', x: 'A system at 85% is not “a bit busier” than one at 70%. It is on a different part of a curve that turns vertical.' },
        { d: 2, t: 'figure', fig: 'queue', caption: 'Drag the utilization. The curve is the whole lesson: the flat region is where planning happens, and the wall is where incidents happen.' },
        { d: 2, t: 'p', x: 'The reason is variance. Arrivals are not evenly spaced and service times are not identical. A resource with spare capacity absorbs that variance; a saturated one has nowhere to put it, so arrivals begin waiting for other arrivals.' },
        { d: 2, t: 'p', x: 'Which means [[slack]] is not waste. Variance has to go somewhere: into spare capacity, into queues, or into failures. Removing slack relocates it, it does not remove it.' },
        { d: 3, t: 'h', x: 'Little’s law as an elimination tool' },
        { d: 3, t: 'p', x: '[[littles-law|L = λW]] holds for any stable system, with no assumptions about distributions. Its real use is negative: pick a target throughput and a target latency and it tells you the concurrency you must sustain. If that number is impossible, one of the two targets was fiction — and you know that before building anything.' },
        { d: 3, t: 'prompt', q: 'A service must handle 2,000 requests per second at 50 ms. How many must be in flight at once?',
          a: 'L = λW = 2000 × 0.05 = 100 concurrent requests. If the pool caps at 40, the latency target was never reachable.', concept: 'littles-law' },
        { d: 3, t: 'p', x: 'And then [[tail-latency]] multiplies it. A request that fans out to 100 services, each with a 1% slow path, is slow about 63% of the time. At scale the tail is not an outlier; it is the median experience.' },
        { d: 4, t: 'p', x: 'The M/M/1 formula above assumes Poisson arrivals and exponential service. Real systems are usually worse, not better, because real arrivals are bursty. Treat the curve as an optimistic bound and the intuition survives.' }
      ],
      sources: [
        { label: 'John D. C. Little, “Little’s Law as Viewed on Its 50th Anniversary”, Operations Research 59(3), 2011', note: 'The author’s own account of what the law does and does not assume.' },
        { label: 'Brendan Gregg — The USE Method', url: 'https://www.brendangregg.com/usemethod.html', note: 'Utilisation, saturation, errors: the practical companion to the curve.' },
        { label: 'Dean & Barroso, “The Tail at Scale”, Communications of the ACM 56(2), 2013', note: 'Source of the fan-out argument in the depth-3 section.' }
      ]
    },

    {
      id: 'decay',
      title: 'The forgetting curve is a design surface',
      area: 'mem',
      state: 'live',
      added: '2026-05-20', revised: '2026-07-30', minutes: 8,
      summary: 'Forgetting is exponential and fast. Once you treat that as a curve to schedule against rather than a personal failing, the design of a review system writes itself.',
      blocks: [
        { d: 1, t: 'p', x: 'Retention after a single exposure decays roughly exponentially. Most of what you read today is unavailable within a week, and this is a property of the machine, not a verdict on your effort.' },
        { d: 1, t: 'p', x: 'Each successful retrieval resets the curve and flattens its slope. That is the entire mechanism behind [[spacing-effect|spaced repetition]]: not more study, differently timed study.' },
        { d: 2, t: 'figure', fig: 'retention', caption: 'Each review resets retention to full and flattens the decay. Add reviews and watch the ninety-day floor rise — note how little the fourth review costs compared with what it buys.' },
        { d: 2, t: 'h', x: 'Why the timing has to be uncomfortable' },
        { d: 2, t: 'p', x: 'Reviewing while a memory is fresh does almost nothing, because there is no retrieval effort to make. Reviewing just before you would have forgotten does the most. So the optimal schedule is always slightly harder than it feels like it should be — a [[desirable-difficulty]].' },
        { d: 2, t: 'p', x: 'This is also why re-reading is so seductive. It raises fluency, fluency feels like knowing, and the feeling is uncorrelated with the delayed test. [[retrieval-practice]] feels worse and works better.' },
        { d: 2, t: 'prompt', q: 'You re-read a chapter and it feels completely familiar. What has that told you about whether you will remember it in a month?',
          a: 'Almost nothing. Familiarity is recognition, not retrieval. The only reliable signal is trying to reconstruct it without the text in front of you.', concept: 'retrieval-practice' },
        { d: 3, t: 'p', x: '[[interleaving]] supplies the other half. Blocked practice trains execution; interleaved practice trains selection. Real problems arrive unlabelled, so identifying which situation you are in is the part that has to be trained.' },
        { d: 3, t: 'aside', x: 'The same curve appears in the bottleneck chapter, upside down. Both are a rate acting against a store. Noticing that is [[analogy|associative thinking]] doing its job.' },
        { d: 4, t: 'p', x: 'Practical scheduling: a modest SM-2 variant is enough. Grade recall as forgot, hard, good, or easy; multiply or reset the interval; keep an ease factor per item. The gains come almost entirely from doing any spacing at all rather than from the exact algorithm.' }
      ],
      sources: [
        { label: 'Cepeda, Pashler, Vul, Wixted & Rohrer, “Distributed practice in verbal recall tasks: a review and quantitative synthesis”, Psychological Bulletin 132(3), 2006', note: 'The meta-analysis behind the spacing numbers.' },
        { label: 'Roediger & Karpicke, “Test-Enhanced Learning”, Psychological Science 17(3), 2006', note: 'Retrieval practice beating restudy, repeatedly.' },
        { label: 'SuperMemo — the SM-2 algorithm', url: 'https://super-memory.com/english/ol/sm2.htm', note: 'The scheduling variant this prototype implements.' },
        { label: 'Andy Matuschak & Michael Nielsen — How can we develop transformative tools for thought?', url: 'https://numinous.productions/ttft/', note: 'The mnemonic-medium framing this whole book borrows from.' }
      ]
    },

    {
      id: 'invariants',
      title: 'Thinking in invariants',
      area: 'think',
      state: 'live',
      added: '2026-06-14', revised: '2026-07-22', minutes: 7,
      summary: 'The fastest route into an unfamiliar system is not asking what it does. It is asking what it will never let you do.',
      blocks: [
        { d: 1, t: 'p', x: 'When you meet a system you do not understand, the highest-yield question is not “what does this do”. It is “what does this refuse to let me break”.' },
        { d: 1, t: 'p', x: 'An [[invariant]] is what stays true while everything around it changes. It is the smallest description with the most predictive power, because every behaviour you have not observed yet still has to respect it.' },
        { d: 2, t: 'h', x: 'Three questions that find them' },
        { d: 2, t: 'list', items: [
          'What is conserved? Total money, total bytes, reference counts, sum of shares.',
          'What is monotonic? Version numbers, log offsets, timestamps, generation counters.',
          'What can never hold at the same time? Two writers, two leaders, a row both visible and uncommitted.'
        ] },
        { d: 2, t: 'p', x: 'Answer those three and most questions about behaviour turn into questions about whether an invariant is threatened — a far smaller space to search.' },
        { d: 2, t: 'prompt', q: 'What makes an invariant more useful than a description of behaviour?',
          a: 'It constrains every future state, including ones you have not observed. A behaviour description only covers the cases you happened to see.', concept: 'invariant' },
        { d: 3, t: 'p', x: '[[constraint|Constraints]] work the same way one level up. Goals tell you where a system is aiming; constraints tell you where it will actually end up. Most design arguments that feel like taste are really disagreements about which constraints are real.' },
        { d: 3, t: 'p', x: 'Push either far enough and you reach a [[first-principle]] — the point where the answer stops being about the domain and becomes physics, arithmetic, information, or economics. That stopping point is what [[transfer|transfers]].' },
        { d: 3, t: 'aside', x: 'Practical test: restate the idea once with every domain noun deleted. If nothing survives the deletion, you learned a fact, not a pattern.' }
      ],
      sources: [
        { label: 'C. A. R. Hoare, “An Axiomatic Basis for Computer Programming”, CACM 12(10), 1969', note: 'Where invariants stopped being informal and became a proof obligation.' },
        { label: 'Leslie Lamport — Who Builds a House Without Drawing Blueprints?', url: 'https://lamport.azurewebsites.net/pubs/lamport-blueprints.pdf', note: 'The argument for stating what must stay true before writing what happens.' }
      ]
    },

    {
      id: 'onestep',
      title: 'Explaining to the person one step behind you',
      area: 'comm',
      state: 'new',
      added: '2026-08-02', revised: '2026-08-02', minutes: 5,
      summary: 'You cannot explain well to someone far behind you, because you can no longer see the steps. The person one step behind is the only audience you can still model accurately.',
      blocks: [
        { d: 1, t: 'p', x: 'The [[curse-of-knowledge]] is not that experts use jargon. It is that chunking has made several steps feel like one, so they get skipped without anyone noticing a gap — least of all the expert.' },
        { d: 1, t: 'p', x: 'The repair is not simplification. It is naming the steps that became invisible.' },
        { d: 2, t: 'p', x: 'Which is why the person one step behind you is the most useful audience you have. You can still remember not knowing what they do not know. Two steps back, you are guessing.' },
        { d: 2, t: 'p', x: 'Start with a [[shared-referent]]: one query, one diagram, one number that both of you can point at. Abstractions introduced before a concrete instance have nothing to attach to and slide off.' },
        { d: 2, t: 'prompt', q: 'Why is simplifying usually the wrong repair for the curse of knowledge?',
          a: 'The gap is missing intermediate steps, not excessive difficulty. Simplifying removes content on both sides of the gap and leaves the gap itself intact.', concept: 'curse-of-knowledge' },
        { d: 3, t: 'p', x: 'Then move deliberately on the [[abstraction-ladder]]. Down means giving an instance; up means naming what the instance is an instance of. A reader who cannot descend has memorised. A reader who cannot ascend cannot transfer. Good explanation makes both directions available.' }
      ],
      sources: [
        { label: 'Camerer, Loewenstein & Weber, “The Curse of Knowledge in Economic Settings”, Journal of Political Economy 97(5), 1989', note: 'The original naming of the effect.' },
        { label: 'Steven Pinker — The Sense of Style (2014), chapter 3', note: 'The curse of knowledge treated as the root cause of bad writing.' },
        { label: 'S. I. Hayakawa — Language in Thought and Action', note: 'Where the ladder of abstraction comes from.' }
      ]
    },

    {
      id: 'intuition',
      title: 'Intuition is compressed experience',
      area: 'learn',
      state: 'evolving',
      added: '2026-07-06', revised: '2026-07-28', minutes: 6,
      summary: 'Intuition is not the opposite of rigour. It is rigour that has been run often enough against honest feedback to become a lookup.',
      blocks: [
        { d: 1, t: 'p', x: '[[intuition|Intuition]] forms where feedback is fast, frequent, and honest. It fails to form where feedback is slow or noisy — which is exactly why you have good intuition about query latency and poor intuition about architectural decisions whose consequences arrive two years later.' },
        { d: 1, t: 'p', x: 'So intuition is not something you have. It is something a feedback loop either grants you or withholds.' },
        { d: 2, t: 'p', x: 'The practical consequence: if you want intuition in a domain with slow feedback, manufacture faster feedback. Predict before you measure. Write the number down first. An unrecorded prediction cannot correct anything.' },
        { d: 2, t: 'p', x: 'Early on, [[worked-example|worked examples]] beat problem-solving. Without a schema, all attention goes into search and none into learning. Study complete solutions, then fade the support one step at a time.' },
        { d: 2, t: 'prompt', q: 'Why do worked examples beat problem-solving for a beginner and lose to it for an expert?',
          a: 'Beginners have no schema, so unguided search consumes working memory and leaves none for learning. Experts have the schema, so retrieval effort becomes the scarce and valuable ingredient.', concept: 'worked-example' },
        { d: 3, t: 'p', x: 'And the compounding move: encode each new idea at the level you want it available. Filed as a fact about a driver, it stays with that driver. Filed as a boundary cost, it appears the next time two systems disagree about anything. That is [[transfer]], and it is decided at encoding time, not at recall time.' }
      ],
      sources: [
        { label: 'Kahneman & Klein, “Conditions for Intuitive Expertise: A Failure to Disagree”, American Psychologist 64(6), 2009', note: 'The two-condition test: regularity in the environment, and an opportunity to learn it.' },
        { label: 'Chase & Simon, “Perception in chess”, Cognitive Psychology 4(1), 1973', note: 'Expertise as chunking rather than raw processing.' },
        { label: 'Sweller, van Merriënboer & Paas, “Cognitive Architecture and Instructional Design”, 1998', note: 'The worked-example effect and its expertise reversal.' }
      ]
    },

    {
      id: 'jdbc-tuning',
      title: 'Notes on JDBC fetch-size tuning',
      area: 'tech',
      state: 'retiring',
      added: '2025-11-03', revised: '2026-07-11', minutes: 4,
      supersededBy: 'boundary',
      summary: 'Superseded. The numbers survive, but the framing was wrong: this was treated as a driver setting when it is really a case of paying per call instead of per batch.',
      blocks: [
        { d: 1, t: 'p', x: 'Retained because the measurements are still useful, retired because the framing was wrong. Raising fetch size helped, and the reason was never “JDBC has a bad default”.' },
        { d: 2, t: 'p', x: 'It was [[amortization]]: a fixed per-round-trip cost divided across more rows. The chapter that owns this idea now is “Where the data stops being data”.' },
        { d: 3, t: 'p', x: 'Kept in the archive because a retired chapter that once shaped your thinking is evidence about how your thinking changed, and that is worth more than a clean shelf.' }
      ],
      sources: [
        { label: 'JDBC ResultSet.setFetchSize — API documentation', url: 'https://docs.oracle.com/javase/8/docs/api/java/sql/ResultSet.html#setFetchSize-int-', note: 'The setting itself. The framing that replaced this chapter is in “Where the data stops being data”.' }
      ]
    },

    /* ── Fabric arc ────────────────────────────────────────────────────── */
    {
      id: 'onelake-shortcuts',
      title: 'The pipeline you delete by pointing at it',
      area: 'tech',
      state: 'new',
      added: '2026-08-06', revised: '2026-08-06', minutes: 8,
      summary: 'A shortcut in OneLake is a symlink wearing analytics clothes. What makes it interesting is not the convenience — it is where it moves the integration boundary, and what that move costs.',
      blocks: [
        { d: 1, t: 'p', x: 'The usual way to make someone else\u2019s data usable is to copy it: a pipeline, a schedule, a landing zone, a reconciliation job, and a standing argument about which copy is current.' },
        { d: 1, t: 'p', x: 'A [[shortcut]] in [[onelake|OneLake]] does none of that. It stores a target path and appears as an ordinary folder. Every engine that can read the lake reads through it, and the bytes never move.' },
        { d: 2, t: 'h', x: 'What is actually being replaced' },
        { d: 2, t: 'p', x: 'This is [[indirection]] applied at the namespace layer rather than the transport layer. The pipeline was doing two jobs — moving bytes and resolving “where does this live” — and only the second one was ever essential.' },
        { d: 2, t: 'p', x: 'It works because everything underneath already agreed on a representation. [[onelake|OneLake]] is ADLS Gen2 with a fixed hierarchy, and tables are [[delta-lake|Delta]] over Parquet. Shortcuts are only cheap because the disagreement was settled first. That is [[layout-is-interface]] in a different costume.' },
        { d: 2, t: 'prompt', q: 'A shortcut avoids copying bytes. What has it not avoided?',
          a: 'The read itself. Every query pays the latency and egress of reaching the real location, on every access, instead of paying once at copy time. Indirection defers cost, it does not remove it.', concept: 'indirection' },
        { d: 2, t: 'h', x: 'The published edges' },
        { d: 2, t: 'list', items: [
          'An item can hold up to 100,000 shortcuts, and a tenant is not otherwise capped.',
          'A single path can carry at most 10 shortcuts directly beneath it.',
          'Shortcuts can chain, but no more than 5 links deep.',
          'Deleting a shortcut deletes the pointer. The target is untouched.'
        ] },
        { d: 3, t: 'p', x: 'Those five numbers are worth reading as design statements rather than trivia. A depth limit of 5 exists because each link is a resolution step, and resolution steps are where staleness and permission surprises live.' },
        { d: 3, t: 'h', x: 'The caching asymmetry' },
        { d: 3, t: 'p', x: 'Shortcut caching is available for GCS, S3, S3-compatible and on-premises targets, with a retention window you set between 1 and 28 days, and a per-file ceiling of 1 GB. It is not available for ADLS Gen2 targets.' },
        { d: 3, t: 'p', x: 'The asymmetry is the tell. Caching exists to pay down the cost of leaving the platform, so it is offered exactly where leaving is expensive. Read the feature matrix and you can usually infer which boundary the designers considered painful.' },
        { d: 4, t: 'aside', x: 'General move: when a capability is available in some cases and not others, the boundary between the cases is usually a cost boundary. Find it and you have found the architecture.' },
        { d: 4, t: 'p', x: 'Identity is the other half. A shortcut resolves either with the caller\u2019s identity or with a stored connection, and those two choices produce very different audit stories. The convenience is in the namespace; the risk is in the delegation.' },
        { d: 4, t: 'prompt', q: 'What is the structural similarity between a OneLake shortcut and Arrow\u2019s columnar format?',
          a: 'Both remove a translation step by getting everyone to agree in advance — Arrow on in-memory layout, OneLake on storage location and table format. Both convert an N² adapter problem into an N one.', concept: 'layout-is-interface' }
      ],
      sources: [
        { label: 'OneLake shortcuts', url: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts', note: 'Types, limits, and the delete-the-pointer-not-the-target semantics.' },
        { label: 'OneLake shortcuts caching', url: 'https://learn.microsoft.com/en-us/fabric/onelake/shortcuts-file-caching', note: 'Where the 1–28 day retention window and 1 GB per-file ceiling come from.' },
        { label: 'OneLake overview', url: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview' }
      ]
    },

    {
      id: 'vorder',
      title: 'Paying at write time so every reader stops paying',
      area: 'tech',
      state: 'new',
      added: '2026-08-04', revised: '2026-08-09', minutes: 9,
      summary: 'V-Order is usually filed as a Fabric setting. It is better understood as amortization with a named beneficiary: one writer absorbs a cost so that a specific, known reader can skip it.',
      blocks: [
        { d: 1, t: 'p', x: 'Parquet already stores values [[columnar|by column]]. [[v-order|V-Order]] goes further: it arranges the sorting, encoding and compression inside each file to match what the Power BI in-memory engine expects to find.' },
        { d: 1, t: 'p', x: 'The files stay open Parquet — any reader can still open them. What changes is that one particular reader no longer has to translate.' },
        { d: 2, t: 'h', x: 'The trade, stated honestly' },
        { d: 2, t: 'list', items: [
          'Writes cost roughly 15% more, and 15–33% more under Spark.',
          'Files compress up to 50% better, so storage and network both fall.',
          '[[direct-lake|Direct Lake]] cold-cache reads improve by 40–60%.',
          'The SQL analytics endpoint gains about 10%.',
          'Spark reads gain nothing at all.'
        ] },
        { d: 2, t: 'p', x: 'That last line is the one that makes the pattern legible. This is [[amortization]] with a named beneficiary — and if your reader is not that beneficiary, you are paying the write premium for nothing.' },
        { d: 2, t: 'prompt', q: 'Bronze layer, ingest-heavy, read almost exclusively by Spark. Should V-Order be on?',
          a: 'No. You would pay 15–33% on every write for a read gain that Spark does not receive. Turn it on in the gold layer, where the reader is the semantic model.', concept: 'medallion' },
        { d: 2, t: 'h', x: 'Defaults disagree, and the disagreement is informative' },
        { d: 2, t: 'p', x: 'V-Order is off by default in new Fabric workspaces, and on by default in Warehouse. Same feature, opposite default, because the expected reader differs. A default is a statement about the median case, not about your case.' },
        { d: 3, t: 'h', x: 'The file-count problem underneath' },
        { d: 3, t: 'p', x: 'Encoding is only half of layout. The other half is file size, and streaming ingestion produces a lot of small files. Each one carries footer parsing, a metadata round-trip and its own [[row-group|row groups]] and dictionaries — overhead that is fixed per file and therefore ruinous when files are tiny.' },
        { d: 3, t: 'p', x: 'OPTIMIZE rewrites them into fewer, larger files. Its default target is 1 GB, while Spark\u2019s own write default is 128 MB, which is a sizeable gap and the reason compaction is a separate deliberate act rather than a side effect.' },
        { d: 3, t: 'p', x: 'Compaction is [[write-amplification]] bought on purpose: you rewrite far more bytes than changed, to make every future read cheaper. VACUUM then removes the files the [[delta-lake|Delta log]] no longer references, with a default retention of 7 days — which is also the length of the time-travel window you are giving up.' },
        { d: 4, t: 'code', lang: 'sql', x: '-- Fabric Spark SQL\nSET spark.sql.parquet.vorder.default = true;\n\nOPTIMIZE gold.sales VORDER;\n\n-- reclaim, and shorten the time-travel window in the same breath\nVACUUM gold.sales RETAIN 168 HOURS;' },
        { d: 4, t: 'aside', x: 'Three settings, one question: who reads this table, and how often relative to how often it is written? Every layout decision in this chapter falls out of that ratio.' },
        { d: 4, t: 'prompt', q: 'VACUUM\u2019s retention default is 7 days. What exactly are you shortening when you lower it?',
          a: 'The time-travel window. Retention is not a cleanup aggressiveness dial — it is the guarantee that older table versions are still readable.', concept: 'delta-lake' }
      ],
      sources: [
        { label: 'Delta Lake table optimization and V-Order', url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/delta-optimization-and-v-order', note: 'Source of the write-overhead, compression and read-gain figures, and of the per-engine breakdown.' },
        { label: 'Delta Lake table maintenance in Fabric', url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-table-maintenance', note: 'OPTIMIZE and VACUUM defaults.' },
        { label: 'Apache Parquet file format specification', url: 'https://parquet.apache.org/docs/file-format/', note: 'What a row group actually is, underneath all of the above.' }
      ]
    },

    {
      id: 'capacity',
      title: 'A capacity is a tap, not a tank',
      area: 'tech',
      state: 'evolving',
      added: '2026-07-24', revised: '2026-08-08', minutes: 10,
      summary: 'Bursting, smoothing and throttling look like three unrelated Fabric features. They are one mechanism: a fixed rate of supply, reconciled with spiky demand, degrading in stages instead of at a cliff.',
      blocks: [
        { d: 1, t: 'p', x: 'A Fabric SKU number is a rate. An F2 supplies 2 [[capacity-unit|capacity units]] every second — not two units to spend, but two per second, forever. Almost every confusing thing about capacity comes from reading a tap as a tank.' },
        { d: 1, t: 'p', x: 'Demand is not a rate. It arrives in bursts: a refresh, a notebook, forty people opening a report at 09:00. So the platform needs a way to serve a spike from a steady supply, and that is the whole design.' },
        { d: 2, t: 'h', x: 'Three names, one mechanism' },
        { d: 2, t: 'list', items: [
          '[[bursting|Bursting]] lets an operation consume faster than the sustained rate, so it finishes sooner.',
          '[[smoothing|Smoothing]] then spreads what it consumed across later timepoints, so the spike is repaid over time.',
          '[[throttling|Throttling]] is what happens when the repayment schedule has borrowed too far into the future.'
        ] },
        { d: 2, t: 'p', x: 'Bursting without smoothing would be free money. Smoothing without bursting would be pointless. Throttling is the debt ceiling. Once you see it as borrow-and-repay, the numbers stop being arbitrary.' },
        { d: 3, t: 'figure', fig: 'smoothing', caption: 'Drag the burst. Watch it get spread across the smoothing window and, when it is large enough, push future timepoints over the line into each throttling stage.' },
        { d: 2, t: 'h', x: 'The clock' },
        { d: 2, t: 'p', x: 'Consumption is evaluated in 30-second timepoints — 2,880 of them in a day. Background operations are smoothed across the full 24 hours. Interactive operations are smoothed over a shorter window: a minimum of 5 minutes, up to 64.' },
        { d: 2, t: 'p', x: 'The asymmetry is deliberate. Someone is waiting for the interactive one.' },
        { d: 2, t: 'prompt', q: 'Why smooth background work over 24 hours but interactive work over minutes?',
          a: 'Smoothing is about billing, not scheduling — but a long window on interactive work would let a single spike suppress a whole day of responsiveness. The window length encodes who is waiting.', concept: 'smoothing' },
        { d: 3, t: 'h', x: 'Degradation in stages' },
        { d: 3, t: 'list', items: [
          'Up to 10 minutes of future capacity borrowed: nothing happens.',
          'Between 10 and 60 minutes: new interactive requests are delayed by 20 seconds.',
          'Between 60 minutes and 24 hours: interactive requests are rejected.',
          'Beyond 24 hours: background requests are rejected too.'
        ] },
        { d: 3, t: 'p', x: 'This is [[progressive-degradation]] written as a table. The 20-second delay is the interesting stage: it is not a punishment, it is a signal, arriving while there is still time to act. A limit that is invisible until it is fatal teaches nobody anything.' },
        { d: 3, t: 'p', x: 'And it is [[utilization]] all over again. The queueing curve says delay climbs non-linearly as you approach full utilisation; the throttling table is that curve, discretised into four stages with names.' },
        { d: 4, t: 'h', x: 'The exceptions worth remembering' },
        { d: 4, t: 'list', items: [
          'Overage consumed beyond the capacity is billed at 3× the standard rate.',
          'Under Autoscale Billing for Spark, bursting and smoothing do not apply at all — Spark jobs are billed as consumed.',
          'Trial capacities do not throttle; they simply stop.'
        ] },
        { d: 4, t: 'p', x: 'The Autoscale exception is the one that catches people, because it silently removes the mechanism they have built their intuition around. When a billing mode changes, check whether it also changed the physics.' },
        { d: 4, t: 'prompt', q: 'Your capacity has borrowed 45 minutes of future compute. What does a user see?',
          a: 'A roughly 20-second delay on new interactive requests. Nothing is rejected yet — that starts past 60 minutes. This is the stage where the signal is still cheap.', concept: 'throttling' }
      ],
      sources: [
        { label: 'Understand your Fabric capacity throttling', url: 'https://learn.microsoft.com/en-us/fabric/enterprise/throttling', note: 'The throttling stages, the 30-second timepoint, and the smoothing windows.' },
        { label: 'Smoothing and throttling in Fabric Data Warehousing', url: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/compute-capacity-smoothing-throttling' },
        { label: 'Microsoft Fabric concepts and licenses', url: 'https://learn.microsoft.com/en-us/fabric/enterprise/licenses', note: 'Where “the SKU number is CU per second” is stated.' },
        { label: 'Autoscale Billing for Spark', url: 'https://learn.microsoft.com/en-us/fabric/data-engineering/autoscale-billing-for-spark-overview', note: 'The exception: bursting and smoothing do not apply.' }
      ]
    },

    {
      id: 'directlake',
      title: 'The refresh you delete, and the one you keep',
      area: 'tech',
      state: 'new',
      added: '2026-08-08', revised: '2026-08-08', minutes: 9,
      summary: 'Direct Lake removes the scheduled copy without adding a translation layer. Understanding it is really understanding three separate operations that all get called “refresh”.',
      blocks: [
        { d: 1, t: 'p', x: 'Import mode copies the data on a schedule and queries the copy. DirectQuery keeps no copy and translates every question into SQL. Each buys one thing by giving up the other.' },
        { d: 1, t: 'p', x: '[[direct-lake|Direct Lake]] does neither. It reads the Parquet columns a query actually needs, straight from the lake, into the same in-memory engine Import uses — and keeps them there.' },
        { d: 2, t: 'h', x: 'Why this is possible at all' },
        { d: 2, t: 'p', x: 'Because both sides already store data the same way. Parquet is columnar and dictionary-encoded; VertiPaq is columnar and dictionary-encoded. The refresh step in Import mode existed to bridge a gap that, in this configuration, is not there.' },
        { d: 2, t: 'p', x: 'That is [[zero-copy]] reasoning arriving in a completely different domain — and it is the same argument as [[adbc|ADBC]] versus [[odbc|ODBC]], one layer up.' },
        { d: 2, t: 'h', x: 'Three things called refresh' },
        { d: 2, t: 'list', items: [
          '[[framing|Framing]] reads the Delta log and repoints the model at the current file version. Metadata only. Seconds.',
          '[[transcoding|Transcoding]] loads one column into memory, merging its per-file dictionaries. Happens on demand, per column.',
          'Import-style refresh copies everything on a schedule. This is the one Direct Lake removes.'
        ] },
        { d: 2, t: 'prompt', q: 'Why is framing fast when refreshing a large table would be slow?',
          a: 'Framing only has to agree on which version is current. It reads the transaction log and repoints file references — it never touches the data.', concept: 'framing' },
        { d: 3, t: 'h', x: 'Where V-Order re-enters' },
        { d: 3, t: 'p', x: '[[transcoding|Transcoding]] cost depends entirely on how far apart the two encodings are. A [[v-order|V-Ordered]], dictionary-encoded column is close to an ID remap. A plain-encoded or delta-encoded column must be re-encoded from scratch.' },
        { d: 3, t: 'p', x: 'That is the same law as the driver boundary: cost is set by the distance between representations, not by the volume crossing. The 40–60% cold-cache figure for V-Order is this sentence, measured.' },
        { d: 3, t: 'h', x: 'Warm, and the fallback cliff' },
        { d: 3, t: 'p', x: 'A model moves through cold, semiwarm, warm and hot as columns are pulled in and stay resident. Framing evicts only the segments whose files actually changed, which is why an incremental change does not send you back to cold.' },
        { d: 3, t: 'p', x: 'The cliff is guardrails. Each SKU has published limits on rows per table and Parquet file count, and framing fails outright above 10,000 Parquet files. Breach one, and the model falls back to DirectQuery — the whole model, not the offending table.' },
        { d: 4, t: 'aside', x: 'A single table can silently change the performance characteristics of every other table in the model. Blast radius is a property of the fallback rule, not of the table.' },
        { d: 4, t: 'p', x: 'Which closes the arc: OPTIMIZE is not housekeeping here. File count is a guardrail input, so compaction is what keeps the model on the fast path at all. Three chapters, one dependency chain — layout, capacity, and the reader that sits on top of both.' },
        { d: 4, t: 'prompt', q: 'One table in a Direct Lake model exceeds its SKU guardrail. What happens to the other tables?',
          a: 'They fall back too. Fallback applies to the whole semantic model, so a single unmaintained table degrades every query in it.', concept: 'direct-lake' }
      ],
      sources: [
        { label: 'Direct Lake overview', url: 'https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview', note: 'Mode comparison and the fallback rule.' },
        { label: 'Understand storage for Direct Lake semantic models', url: 'https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-understand-storage', note: 'Transcoding, column loading, and the cold-to-hot progression.' },
        { label: 'Manage Direct Lake semantic models', url: 'https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-manage', note: 'Framing, reframing, and the guardrail tables per SKU.' }
      ]
    }
  ]
};
