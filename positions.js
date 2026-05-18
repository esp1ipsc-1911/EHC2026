// EHC 2026 — Overlay Positions
// This file is loaded by the app. Edit via the in-app editor, then click
// "Export positions" to download an updated positions.json, then replace
// this content with the exported data and commit to GitHub.
//
// Collaborators: whoever pushes the latest positions.json to GitHub wins.
// Split by stage key so merge conflicts are minimal.

window.POSITIONS_VERSION = "1.1";

// Loaded asynchronously from positions.json if available,
// otherwise falls back to this embedded default.
window.STAGE_POSITIONS = null; // will be populated by loadPositions()
