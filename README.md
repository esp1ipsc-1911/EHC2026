# EHC 2026 — Stage Analysis
### Classic Division · 10-round magazines

Tactical stage analysis tool for all 24 stages of the European Handgun Championship 2026.

## Quick start
1. Open `index.html` in Chrome or Firefox
2. Click a stage card → full analysis with overlay opens
3. Click **✏ Edit positions** → drag markers to correct locations
4. Click **⬇ Save to JSON** → downloads `positions.json`
5. Replace the file in the project folder → commit to GitHub

## GitHub Pages hosting
Push all files to a GitHub repo, then:
Settings → Pages → Source → main branch / root

Your app is live at: `https://yourusername.github.io/ehc2026/`

## Collaboration with a buddy
1. Add buddy as Collaborator on the GitHub repo
2. Both clone with `git clone`
3. Edit positions → export `positions.json` → commit + push
4. Buddy does `git pull` → sees your positions
5. Share the GitHub Pages URL for read-only access (no install needed)

## Keyboard shortcuts
- ← / → arrow keys: navigate between stages
- Esc: close

## Files
- `positions.json` — edit via app editor, then commit this file to GitHub
- `images/` — original EHC 2026 stage diagrams (do not modify)
- `stage_data.js` — all tactical data for 24 stages

Total rounds across all stages: 477
