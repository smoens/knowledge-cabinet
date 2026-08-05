/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["dsl-reliability"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "Give an LLM a plain-English request in a general-purpose language and there are hundreds of equally valid ways to write the same intent — the model has to guess which one you meant. Give it the same request in a [[dsl|domain-specific language]] and there are only a handful. That narrowing, not any special understanding of the domain, is why models generate correct Mermaid diagrams, SQL queries, and Kubernetes manifests so reliably."
    },
    {
      "d": 1,
      "t": "p",
      "x": "The mechanism is a [[constrained-grammar|grammar constrained]] enough that a few in-context examples cover nearly every way a request can legally be expressed. Show the model three or four valid programs in the language and it has effectively seen the whole space — there is no equivalent shortcut for a general-purpose language, where the valid space is enormous."
    },
    {
      "d": 2,
      "t": "h",
      "x": "A DSL is a harness, not just a shortcut"
    },
    {
      "d": 2,
      "t": "p",
      "x": "For an agent running in an autonomous loop rather than a single-shot chat, a DSL usually brings something else along for free: a deterministic validator — a parser, a JSON schema, a type checker, a compiler. The [[generate-and-check|agent generates a candidate, runs it past the validator, and repairs it from the error]], with no human reading every attempt."
    },
    {
      "d": 2,
      "t": "p",
      "x": "Crucially, the errors come back phrased at the level of the domain — “you cannot select an action before choosing a client” — rather than as a stack trace buried in generated plumbing. A reviewer, or the agent itself, can act on that directly instead of tracing it back through incidental code."
    },
    {
      "d": 2,
      "t": "list",
      "items": [
        "A small vocabulary: few enough constructs that a handful of examples can cover them.",
        "A deterministic validator: something that rejects an invalid program before it ever runs.",
        "Domain-level errors: failures phrased in the DSL's own terms, not the host language's stack trace."
      ]
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "A team hand-writes a JSON config with no schema; the only parser error it can produce is \"unexpected token\". An LLM generates a plausible-looking file with two fields quietly swapped. What is missing that a good DSL would have supplied?",
      "a": "A deterministic validator that checks domain rules, not just syntax — a schema or type checker that would reject the swap as a semantic error, phrased in the domain's own terms, instead of letting invalid-but-parseable JSON through unnoticed.",
      "concept": "generate-and-check"
    },
    {
      "d": 3,
      "t": "h",
      "x": "The vocabulary underneath the syntax"
    },
    {
      "d": 3,
      "t": "p",
      "x": "A DSL's syntax is a carrier for something more important: a [[semantic-model|semantic model]] — the types and rules that give the syntax meaning. In a small tool, the parsed syntax tree can double as that model. In a harder domain it has to encode real design decisions: a distributed-systems test framework can fix threading, timing, and message delivery through types like `Replica`, `quorumRequest`, and `Handler`, so a prompt like “implement a quorum-based key-value store as a Replica” only has to supply the protocol logic, not reinvent the plumbing underneath it."
    },
    {
      "d": 3,
      "t": "p",
      "x": "Naming those types is also what makes the prompt work at all: it gives the model, and the person reading the result, a [[shared-referent|shared referent]] — the model is not inventing a threading model out of a paragraph of prose, it is filling in logic against a fixed, already-understood substrate. An existing implementation built the same way then serves as a [[worked-example|worked example]] for the next one — a Raft or Paxos protocol prompted against the same vocabulary."
    },
    {
      "d": 3,
      "t": "aside",
      "x": "Even without a purpose-built language, a clean set of named abstractions is a lighter version of the same idea. A framework's whole semantic model can be just a handful of seams — compute, network, storage, a logical clock — and that decomposition does most of the grounding work with no new syntax at all."
    },
    {
      "d": 3,
      "t": "p",
      "x": "None of this is free. Designing and maintaining a DSL and its semantic model is real upfront cost, and the advantage holds only while the language stays small enough that a few examples still cover its usage. The payoff concentrates in well-factored, genuinely constrained DSLs backed by a validator — not in reaching for a new language for every prompt."
    },
    {
      "d": 3,
      "t": "prompt",
      "q": "You can prompt an LLM to generate Kubernetes YAML directly, or to generate code against a hand-rolled deployment library with no schema. Which is more reliable, and why doesn't \"the model has seen a lot of Kubernetes\" fully explain the difference?",
      "a": "The YAML — because the reliability comes from the grammar being small and validated, not only from training exposure. A schema rejects an invalid manifest before it is ever applied. The hand-rolled library has no equivalent deterministic check, so a subtly wrong call can look plausible and pass unreviewed.",
      "concept": "semantic-model"
    },
    {
      "d": 4,
      "t": "aside",
      "x": "The [[constrained-grammar|grammar]] can be enforced by the host language itself. An internal DSL built as a fluent Java API can use progressive interfaces so that calling `.steps(...)` before `.servers(...)` simply does not compile — a malformed scenario is a compile error pinned to the illegal step, not a runtime surprise three calls later."
    },
    {
      "d": 4,
      "t": "p",
      "x": "This changes what becomes the maintained artifact. Once a scenario is expressed in the [[dsl|DSL's]] own vocabulary — servers, clients, a fault like a delayed message between two of them — that expression, not the prompt that produced it, is what a team edits next month. A DSL is dense and largely free of incidental boilerplate, so regenerating from the original English request stops being necessary once the artifact itself is readable."
    },
    {
      "d": 4,
      "t": "prompt",
      "q": "A team deletes the original design prompts for their internal DSL once the first version is generated, keeping only the resulting code. Have they lost anything essential?",
      "a": "Very little, if the DSL is well-factored — the generated artifact already carries the intent in a form that is more durable and more precisely checkable than the prompt ever was. The enduring asset was always meant to be the DSL and its semantic model, not the prompt.",
      "concept": "dsl"
    }
  ],
  "sources": [
    {
      "label": "Martin Fowler and Unmesh Joshi — \"LLMs and DSLs: Domain Abstractions for Reliable AI-Assisted Development\"",
      "url": "https://martinfowler.com/articles/llm-and-dsls.html",
      "note": "Primary source for the whole chapter: the constrained-grammar argument, the Tickloom Replica/quorumRequest semantic model, the Java-enforced scenario DSL, and the DSL-as-source-of-truth argument."
    },
    {
      "label": "Martin Fowler — Domain-Specific Language",
      "url": "https://martinfowler.com/dsl.html",
      "note": "Definition and catalogue of DSLs referenced by the article."
    },
    {
      "label": "Tickloom (GitHub)",
      "url": "https://github.com/unmeshjoshi/tickloom",
      "note": "The framework and scenario-testing DSL the article's code examples are drawn from."
    }
  ]
};
