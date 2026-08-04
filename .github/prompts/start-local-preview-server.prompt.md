---
description: 'Start a local static server for the Knowledge Cabinet and open it in the browser canvas'
---

Start a local preview of this static site and open it for the user:

1. In the repository root, start a simple static HTTP server on port 8080 in the background (detached), e.g. `python -m http.server 8080`. If a server is already listening on 8080, skip starting a new one.
2. Open `http://localhost:8080` in the browser canvas so the user can view the running site.

Do not build, bundle, or transform anything — this repo is dependency-free and must be served as-is from its root.
