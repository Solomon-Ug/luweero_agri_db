// ============================================================
// Luweero Agri DB – Project Root Entrypoint Bridge
// ============================================================
// This file delegates directly to server/server.js so that:
// 1. Existing development commands ('node server.js') continue working.
// 2. Cloud platforms (like Render) that default to 'node server.js' start cleanly.
// ============================================================

require("./server/server.js");
