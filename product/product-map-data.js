/* Knowledge Cabinet — product map seed data.
   The curated, grounded picture of the product: vision, product capabilities
   (grouped by what the product does, not by which file implements it),
   features, user stories, and the "build lens" (process/dev components).
   Edit this file by hand when the real product changes shape. Anything a
   reader adds at runtime (inbox captures, ad-hoc features/stories, status
   toggles) lives only in that browser's localStorage — see product-map.js —
   so this seed never needs a server to stay in sync. */
window.PRODUCT_MAP_SEED = {
  meta: {
    product: "Knowledge Cabinet",
    schema: "v3 - goal-labeled areas + area activity status + build lens + inbox + glossary",
    generatedFrom: "repository files, read directly - no invented figures",
    note: "featureGroups[].status ('stable'/'active'/'blocked'/'backlog') is the area's own activity, grounded in git history, not the same as a feature being shipped. featureGroups[].goal_ids labels which vision goals an area serves - not exhaustive, and a goal with no area is flagged honestly rather than force-mapped. devComponents status:'built' items are grounded in existing code/config; 'backlog'/'undefined'/'informal' are honestly flagged gaps, not invented content."
  },
  vision: {
    tagline: "A personal book that never finishes.",
    /* Each goal carries a stable id and a short label so a product area
       (featureGroups[].goal_ids below) can point back at it explicitly.
       Not every goal needs an area yet, and one area can serve several
       goals - the mapping is a many-to-many label, not a partition. An
       unmapped goal renders honestly as "no area mapped yet" rather than
       forcing a fit. */
    goals: [
      { id: "fun", label: "Fun", text: "Bring fun into reading." },
      { id: "trackable", label: "Trackable / gamified", text: "Make reading trackable, leaning into gamification." },
      { id: "fundamentals", label: "Fundamentals over facts", text: "Focus reading on understanding and learning from first principles and fundamental concepts, not just facts." },
      { id: "knowledge-fun", label: "Knowledge + fun", text: "Build knowledge and have fun with it along the way." },
      { id: "growth-visible", label: "Growth made visible", text: "Build growth across different areas and domains, and make that growth visible and tangible." }
    ]
  },
  components: [
    { id: "shell", name: "Shell", kind: "view", file_path: "index.html", description: "Views, SVG sprite of specimen plates and icons, PWA head, direction contract." },
    { id: "index-data", name: "Startup index", kind: "data", file_path: "content.js", description: "Areas, compact concept entries, chapter metadata, concept references and mention frequency - the only data delivered before a drawer is opened." },
    { id: "concept-chunks", name: "Concept detail chunks", kind: "data", file_path: "content/concepts/<area>.js", description: "Fundamental, mechanism and sources for one growth area, loaded on first drill-down into that area." },
    { id: "chapter-chunks", name: "Chapter chunks", kind: "data", file_path: "content/chapters/<id>.js", description: "One chapter body and source list per drawer, loaded when that drawer is opened." },
    { id: "app-core", name: "App core", kind: "behavior", file_path: "app.js", description: "Routing, rendering, weight computation, extent, drilldown, spaced-repetition scheduling, metrics, persistence, cross-device sync." },
    { id: "clippings", name: "Clippings module", kind: "behavior", file_path: "clippings.js", description: "IndexedDB-backed capture tray; fetches and parses external articles via the Jina Reader proxy." },
    { id: "figures", name: "Explorables", kind: "behavior", file_path: "figures.js + figures/<name>.js", description: "Shared helpers plus one renderer per explorable figure." },
    { id: "design", name: "Design system", kind: "design", file_path: "cabinet.css + DESIGN.md", description: "The whole visual world: tokens, cabinet, reading table, catalogue encodings, rounds, register." },
    { id: "offline-shell", name: "Offline shell", kind: "infra", file_path: "sw.js + manifest.webmanifest", description: "Eager shell cache and on-demand content cache; PWA install contract." }
  ],
  /* status is the area's own activity, distinct from whether its features
     shipped: "stable" = built and not currently being worked on, "active" =
     in development right now, "blocked" = waiting on a decision/review,
     "backlog" = named but not started. Grounded in recent commit history
     (see `git log`) rather than guessed - re-check this by hand when work
     actually starts or lands, the same way you'd edit any other seed here.
     goal_ids is likewise a first-pass editorial read of each area's own
     description above, not exhaustive - adjust freely. */
  featureGroups: [
    { id: "nav", name: "Reading & navigation", description: "Getting to a chapter and moving between the wall and the table.", component_ids: ["app-core"], status: "stable", goal_ids: ["growth-visible"] },
    { id: "dial", name: "Extent dial", description: "Depth as a dial the reader turns, not a search.", component_ids: ["app-core"], status: "stable", goal_ids: ["fundamentals"] },
    { id: "catalogue", name: "Catalogue & concepts", description: "The cross-cutting index of concepts and patterns, and drilling into any term.", component_ids: ["app-core"], status: "stable", goal_ids: ["fundamentals"] },
    { id: "rep", name: "Spaced repetition", description: "Prompts filed from reading come back on a schedule.", component_ids: ["app-core"], status: "stable", goal_ids: ["trackable", "knowledge-fun"] },
    { id: "capture", name: "Capture & promotion", description: "Saving something read elsewhere, and turning it into a chapter.", component_ids: ["clippings"], status: "active", goal_ids: ["knowledge-fun"] },
    { id: "metrics", name: "Metrics (register)", description: "What the reader can see about their own reading.", component_ids: ["app-core"], status: "stable", goal_ids: ["trackable", "growth-visible"] },
    { id: "sync", name: "Sync & persistence", description: "Where reading state lives and how it follows the reader.", component_ids: ["app-core"], status: "stable", goal_ids: [] },
    { id: "explorables", name: "Explorables", description: "Small interactive models that print their own constants.", component_ids: ["figures"], status: "stable", goal_ids: ["fun", "fundamentals"] },
    { id: "offline", name: "Offline & install", description: "Working with no signal, and installing to a home screen.", component_ids: ["offline-shell"], status: "stable", goal_ids: [] }
  ],
  features: [
    { id: "wall", group_id: "nav", component_id: "app-core", name: "The cabinet wall", description: "Browse every chapter at a glance, grouped by growth area and state.", origin: "story", status: "built" },
    { id: "table", group_id: "nav", component_id: "app-core", name: "The reading table", description: "One chapter at a time, at reading width.", origin: "story", status: "built" },
    { id: "focus", group_id: "nav", component_id: "app-core", name: "Growth-area focus", description: "Solo one area on the wall, click again to clear.", origin: "idea", status: "built" },
    { id: "share", group_id: "nav", component_id: "app-core", name: "Incoming share target", description: "A URL arriving via ?url= from the OS share sheet opens straight into the tray.", origin: "story", status: "built" },
    { id: "depth", group_id: "dial", component_id: "app-core", name: "Depth ladder (1-4)", description: "Spine, working, full, source - keys 1-4 re-lay the chapter live.", origin: "story", status: "built" },
    { id: "progress", group_id: "dial", component_id: "app-core", name: "Reading progress", description: "Tracks what has been read so a chapter can be resumed.", origin: "idea", status: "built" },
    { id: "cat-view", group_id: "catalogue", component_id: "app-core", name: "Catalogue view", description: "Every concept and pattern in one browsable list.", origin: "story", status: "built" },
    { id: "slip", group_id: "catalogue", component_id: "app-core", name: "Concept slip", description: "A detail card for one concept: fundamental, mechanism, sources.", origin: "idea", status: "built" },
    { id: "loupe", group_id: "catalogue", component_id: "app-core", name: "The loupe", description: "Highlight any selection while reading; drills into an existing entry or opens a provisional one.", origin: "story", status: "built" },
    { id: "links", group_id: "catalogue", component_id: "app-core", name: "Bidirectional links", description: "Derived at load from [[concept]] markup plus declared seeAlso.", origin: "idea", status: "built" },
    { id: "weight", group_id: "catalogue", component_id: "app-core", name: "Importance encodings", description: "Four switchable encodings of computed weight: size, lamplight, engraving, thread map.", origin: "idea", status: "built" },
    { id: "rounds", group_id: "rep", component_id: "app-core", name: "Rounds", description: "Filed prompts and highlights come back for review, in the same loop as reading.", origin: "story", status: "built" },
    { id: "sm2", group_id: "rep", component_id: "app-core", name: "SM-2 scheduling", description: "A trimmed SM-2 implementation schedules the next round.", origin: "idea", status: "built" },
    { id: "tray", group_id: "capture", component_id: "clippings", name: "Clippings tray", description: "Paste an article URL; it is fetched and parsed on the spot and read at reading width.", origin: "story", status: "built" },
    { id: "promote", group_id: "capture", component_id: "clippings", name: "Promote to chapter", description: "Packages a clipping into a handoff prompt for the chapter-authoring step - never auto-writes a chapter.", origin: "story", status: "built" },
    { id: "register-view", group_id: "metrics", component_id: "app-core", name: "Register", description: "Time at the table, passages read, drawers opened, specimens met, attention by growth area, an eight-week strip.", origin: "story", status: "built" },
    { id: "movement-log", group_id: "metrics", component_id: "app-core", name: "Movement log", description: "A running log of reading events, wipeable from the register.", origin: "idea", status: "built" },
    { id: "cross-sync", group_id: "sync", component_id: "app-core", name: "Cross-device sync", description: "The repo's own data branch is the backend; reads are unauthenticated, writes need a token pasted once.", origin: "story", status: "built" },
    { id: "local-persist", group_id: "sync", component_id: "app-core", name: "Local persistence", description: "Everything persists to localStorage on one device; no accounts.", origin: "idea", status: "built" },
    { id: "fig-queue", group_id: "explorables", component_id: "figures", name: "Boundary-crossing figure", description: "Row-at-a-time versus columnar throughput, with printed constants.", origin: "story", status: "built" },
    { id: "fig-retention", group_id: "explorables", component_id: "figures", name: "Retention figure", description: "Retention against a review schedule.", origin: "story", status: "built" },
    { id: "fig-smoothing", group_id: "explorables", component_id: "figures", name: "Smoothing figure", description: "A capacity burst smoothed across a day until it crosses throttling stages.", origin: "story", status: "built" },
    { id: "fig-transfer", group_id: "explorables", component_id: "figures", name: "Utilization figure", description: "Utilization against wait.", origin: "story", status: "built" },
    { id: "offline-cache", group_id: "offline", component_id: "offline-shell", name: "Offline shell cache", description: "The shell and each opened drawer are cached for offline reading.", origin: "story", status: "built" },
    { id: "install", group_id: "offline", component_id: "offline-shell", name: "Add to Home Screen", description: "Installs full-screen from Safari or Chrome via the PWA manifest.", origin: "idea", status: "built" }
  ],
  userStories: [
    { id: "us-wall", feature_id: "wall", story: "As a reader, I want to see every chapter at a glance so I can choose what to read next." },
    { id: "us-table", feature_id: "table", story: "As a reader, I want an uncluttered view of one chapter at a time." },
    { id: "us-share", feature_id: "share", story: "As a reader, I want to share an article into the cabinet straight from my phone's share sheet." },
    { id: "us-depth", feature_id: "depth", story: "As a reader, I want to control how much depth I see without leaving the chapter." },
    { id: "us-cat-view", feature_id: "cat-view", story: "As a reader, I want to browse every concept and pattern the book knows about in one place." },
    { id: "us-loupe", feature_id: "loupe", story: "As a reader, I want to select any phrase and see whether it is already a concept, or start one." },
    { id: "us-rounds", feature_id: "rounds", story: "As a reader, I want the prompts I filed to come back to me for a condition check." },
    { id: "us-tray", feature_id: "tray", story: "As a reader, I want to save an article I bumped into so I do not lose it before I can read it." },
    { id: "us-promote", feature_id: "promote", story: "As a reader, I want a saved clipping to become a real chapter without retyping everything." },
    { id: "us-register", feature_id: "register-view", story: "As a reader, I want to see how my time and attention are actually spread across growth areas." },
    { id: "us-cross-sync", feature_id: "cross-sync", story: "As a reader, I want my reading state to follow me between my phone and my laptop." },
    { id: "us-fig-queue", feature_id: "fig-queue", story: "As a reader, I want to see the model behind a claim move, not just read about it." },
    { id: "us-fig-retention", feature_id: "fig-retention", story: "As a reader, I want to see why spaced repetition actually works, not just be told it does." },
    { id: "us-fig-smoothing", feature_id: "fig-smoothing", story: "As a reader, I want to see what smoothing a burst really costs." },
    { id: "us-fig-transfer", feature_id: "fig-transfer", story: "As a reader, I want to see how utilization and wait trade off against each other." },
    { id: "us-offline-cache", feature_id: "offline-cache", story: "As a reader, I want the cabinet to open even with no signal." }
  ],
  devComponents: [
    {
      id: "agentic-harness",
      name: "Agentic harness",
      status: "built",
      summary: "The skills, agents, and MCP config that shape how an AI agent works on this repo.",
      details: [
        "Skill: chapter-authoring (.github/skills/chapter-authoring/SKILL.md) - the procedure for adding, revising, or retiring a chapter.",
        "Skill: diagram-design (.github/skills/diagram-design/SKILL.md) - picks the diagram family and renders it with the visual-design/structural-diagrams references.",
        "Agent: agentic-workflows (.github/agents/agentic-workflows.md) - dispatcher for creating/debugging/upgrading gh-aw workflows.",
        "MCP config: .github/mcp.json wires the MCP servers available to agents working in this repo.",
        "AGENTS.md carries the house rules every agent (and this map) follows: no invented numbers, cite sources, run node --check + check-content.mjs after edits."
      ]
    },
    {
      id: "scheduled-workflows",
      name: "Scheduled & on-demand agentic workflows",
      status: "built",
      summary: "Three real gh-aw workflows already run against this repo. All of them stage a single issue - none of them ever auto-edit content or auto-merge.",
      details: [
        "content-watch - daily schedule. Reads .github/content-sources.yml, fetches active sources, diffs against a cache-memory seen-list, and stages one digest issue of new items.",
        "chapter-proposal - on-demand (workflow_dispatch with a required topic input). Stages one outline issue: depth ladder, concepts, bridges, sources to verify.",
        "cabinet-survey - on-demand (workflow_dispatch). Surveys content.js for orphan concepts, depth holes, missing bridges, and retirement candidates; stages one ranked findings issue."
      ]
    },
    {
      id: "ci-verification",
      name: "CI & verification",
      status: "built",
      summary: "Automated checks that run on the actual repository, not just proposals.",
      details: [
        ".github/workflows/verify.yml - CI check.",
        ".github/scripts/check-content.mjs - rejects a chapter/concept index that has drifted from the chunk files (stale frequency counts, dangling concept ids, missing chunks).",
        ".github/scripts/check-safe-output-exclusivity.mjs - guards that a gh-aw run stages exactly one safe output, used by cabinet-survey and chapter-proposal."
      ]
    },
    {
      id: "release-branch-strategy",
      name: "Release & branch strategy",
      status: "undefined",
      summary: "No formal branch or release strategy is documented in this repo today. Everything ships directly from main via GitHub Pages. Flagging honestly rather than inventing one - add it here once you decide on one.",
      details: []
    },
    {
      id: "agentops-patterns",
      name: "AgentOps pattern adoption",
      status: "informal",
      summary: "The three workflows above already roughly follow named gh-aw architecture patterns (content-watch reads like DailyOps; chapter-proposal/cabinet-survey read like on-demand, human-gated dispatch patterns), but none of them have been deliberately reviewed against gh-aw's pattern catalogue (github.github.com/gh-aw/patterns/), so there's no record of which pattern was chosen and why.",
      details: []
    }
  ],
  glossary: [
    { term: "the cabinet wall", definition: "The browse view: every chapter at a glance, grouped by growth area and lifecycle state." },
    { term: "the reading table", definition: "The single-chapter reading view, at reading width, one drawer at a time." },
    { term: "drawer", definition: "A chapter. It carries a lifecycle state (new, live, evolving, retiring) and its own file under content/chapters/." },
    { term: "the extent dial", definition: "The depth control: 1 Spine (the claim), 2 Working (enough to use tomorrow), 3 Full (mechanism + figures), 4 Source (caveats + code). Keys 1-4 re-lay the chapter live." },
    { term: "specimen", definition: "A concept or pattern entry in the catalogue - the thing a chapter's terms drill into." },
    { term: "the loupe", definition: "Highlight any text while reading to drill into its concept entry, or open a provisional one if it doesn't exist yet." },
    { term: "rounds", definition: "Spaced-repetition review sessions for filed prompts and highlights, scheduled with a trimmed SM-2 algorithm." },
    { term: "the register", definition: "The reader's own metrics: time at the table, passages read, drawers opened, specimens met, attention by growth area, an eight-week strip, and a movement log." },
    { term: "clippings tray", definition: "Paste an external article URL; it's fetched and parsed on the spot (via the Jina Reader proxy) and stored in IndexedDB for reading at reading width." },
    { term: "promote to chapter", definition: "Packages a clipping into a handoff prompt for the chapter-authoring skill. It never auto-writes a chapter - a human still decides." },
    { term: "growth area", definition: "One of the five channels chapters and concepts are organized under (tech, communication, learning, memory, thinking)." }
  ]
};
