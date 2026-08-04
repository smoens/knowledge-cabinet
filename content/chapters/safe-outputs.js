/* Chapter body. Loaded only when this drawer is opened. */
window.CABINET_CHAPTERS = window.CABINET_CHAPTERS || {};
window.CABINET_CHAPTERS["safe-outputs"] = {
  "blocks": [
    {
      "d": 1,
      "t": "p",
      "x": "An agent reading a GitHub issue is reading its own attack surface — anything written there can steer what it does next. GitHub Agentic Workflows does not try to make the agent immune to that. It relies on [[deferred-write|refusing to let the agent hold write access at all]]."
    },
    {
      "d": 1,
      "t": "p",
      "x": "The agent's entire output — a comment, a pull request, a label — is written to a plain file, not to GitHub. A separate job, running with its own narrower permissions, decides afterward whether that file becomes a real action. A fully compromised agent has produced a file nobody is obliged to act on."
    },
    {
      "d": 2,
      "t": "h",
      "x": "Two jobs, two permission sets"
    },
    {
      "d": 2,
      "t": "p",
      "x": "Concretely: the agent job runs read-only, with no ambient GitHub token capable of writing. It calls an MCP server, reasons over the repository, and finishes by producing an output artifact. A second job downloads that artifact, and only that job is granted `issues: write` or `pull-requests: write` — an instance of [[least-privilege|granting exactly the access the step needs, no more]]."
    },
    {
      "d": 2,
      "t": "list",
      "items": [
        "Agent job: reads the repo and event, has no write-capable token, output is a JSON artifact.",
        "Threat-detection job: scans that artifact for secret leaks or malicious patches before anything downstream sees it.",
        "Safe-output job: one job per action type (create_issue, add_comment, create_pull_request), each scoped to only the permission that action requires."
      ]
    },
    {
      "d": 2,
      "t": "prompt",
      "q": "A prompt-injected agent tries to have the workflow delete a branch protection rule. Where does that attempt get stopped?",
      "a": "It never reaches GitHub as a direct call — the agent holds no token that could do it. At best it writes a request into its output artifact, and that request only becomes real if a safe-output job exists for it and is granted exactly that permission, which branch-protection changes are not.",
      "concept": "deferred-write"
    },
    {
      "d": 3,
      "t": "h",
      "x": "Layers that assume the layer above already failed"
    },
    {
      "d": 3,
      "t": "p",
      "x": "Zoom out and this two-job split is one instance of a three-layer trust model: a substrate layer (kernel, container runtime, network firewall) that holds even if every user-level process is compromised; a configuration layer (schemas, scoped tokens, pinned action SHAs) that decides what is wired to what; and a plan layer — the staged jobs above — that decides how data flows between stages over time. This is [[defense-in-depth|layering independent controls so a single failure is not a breach]]: each layer is designed assuming the one above it has already been beaten."
    },
    {
      "d": 3,
      "t": "p",
      "x": "The substrate layer is a [[sandbox|boundary enforced by something the sandboxed process cannot negotiate with]]: the agent runs in a container bound to a private network, and an egress proxy rewrites its traffic through a domain allowlist. A compromised agent cannot simply reach out to an attacker's server, because the constraint sits below the process, in `iptables` and a proxy config it never touches."
    },
    {
      "d": 3,
      "t": "p",
      "x": "None of this promises the agent will never be fooled — it will be, regularly, by design; that is what letting it read untrusted issues and pull requests means. What it promises instead is a bound on the [[blast-radius|damage a fooled agent can do]]: read access to what it was already permitted to read, egress limited to an allowlist, and exactly one kind of external effect — a proposal a separate, narrower job may still refuse."
    },
    {
      "d": 3,
      "t": "aside",
      "x": "The same shape shows up wherever staged failure beats a single cliff: [[progressive-degradation|a capacity limit that degrades over sixty minutes instead of failing outright]] is defense in depth applied to load instead of to trust — different threat, same refusal to let one control's failure be the whole story."
    },
    {
      "d": 3,
      "t": "prompt",
      "q": "A safe-output job itself grows a hundred lines of bespoke logic to decide which pull requests to auto-merge. What has happened to blast radius?",
      "a": "It moved, not shrank. The complex logic is now the thing that can be manipulated, and it sits in the stage that already holds write permission — the two things deferred writes exist to keep apart.",
      "concept": "blast-radius"
    },
    {
      "d": 4,
      "t": "aside",
      "x": "gh-aw adds one more twist worth noticing: safe outputs also get structural discipline, not just permission discipline. `max: 5` caps how many issues one run can create; `deduplicate-by-title` collapses near-duplicates; `expires: 7` auto-closes stale ones. A [[constraint|limit on what the system is allowed to do]] survives even inside the trusted job — least privilege is not only about credentials, it is also about how much a single credential is allowed to do."
    },
    {
      "d": 4,
      "t": "p",
      "x": "The architecture document names the failure mode plainly: if the substrate layer is broken — a container escape, a firewall misconfiguration — everything built above it is unenforced. Layering does not remove the need for any one layer to actually hold; it only means one failing is survivable rather than fatal."
    },
    {
      "d": 4,
      "t": "prompt",
      "q": "You are designing a CI pipeline that lets a third-party plugin propose changes to a deployment config. How would deferred-write and blast-radius change the design, compared to letting the plugin call the deploy API directly?",
      "a": "The plugin's job would produce a written proposal (a diff, a JSON patch) with no deploy credential at all. A separate, narrowly scoped job — permitted only to apply that specific kind of change, nothing else the deploy API can do — reads the proposal and acts. A compromised plugin can then only ever produce a bad proposal, never a live deploy.",
      "concept": "sandbox"
    }
  ],
  "sources": [
    {
      "label": "GitHub Agentic Workflows — overview",
      "url": "https://github.github.com/gh-aw/",
      "note": "What gh-aw is and the security-first framing for running coding agents in Actions."
    },
    {
      "label": "GitHub Agentic Workflows — Security Architecture",
      "url": "https://github.github.com/gh-aw/introduction/architecture/",
      "note": "The substrate / configuration / plan trust layers, and the SafeOutputs data flow diagrams."
    },
    {
      "label": "GitHub Agentic Workflows — Safe Outputs reference",
      "url": "https://github.github.com/gh-aw/reference/safe-outputs/",
      "note": "Source for the max/dedupe/expire structural limits and per-action permission scoping."
    }
  ]
};
