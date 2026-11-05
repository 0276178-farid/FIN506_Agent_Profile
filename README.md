# Unstuck

Unstuck turns a person's time horizon and tolerance for loss into a suggested split across short, medium and long term. The user's money never passes through Unstuck; they transfer directly to a licensed institution.

## Open the app

Open `index.html` directly in a web browser. No server, installation, or build step is needed.

## Demo inputs

The starting scenario is MXN 20,000.00 (2,000,000 centavos), a 2-to-5-year horizon, and “I would hold.” The suggested split is 40% short term, 40% medium term, and 20% long term. The guide and amount confirmation are simulated; no real transfer occurs.

## Files

- `index.html` — the app page, allocation display, confirmation form, and four-screen demo guide.
- `styles.css` — page layout, colors, and responsive styling.
- `app.js` — allocation math, money formatting, guide navigation, and simulated amount confirmation.
- `SPEC.md` — product requirements and source of truth for the demo behavior.
- `AGENTS.md` — standing instructions for AI agents working on the project.
- `BITACORA.md` — chronological log of work, decisions, and reviewer feedback.
- `DECISIONS.md` — important product and technical choices with reasons.
- `LATER.md` — ideas intentionally deferred beyond the current project scope.
- `PROJECT_METHOD.md` — the course workflow for planning, building, reviewing, and logging work.
- `CLAUDE.md` — points Claude Code to the project instructions in `AGENTS.md`.
- `claude-reviewer-agent.md` — read-only reviewer instructions for Claude Code.
- `claude-settings.json` — optional Claude Code permissions configuration.
- `vscode-settings.jsonc` — optional VS Code terminal approval settings for Copilot.
- `.github/chatmodes/reviewer.chatmode.md` — read-only reviewer instructions for GitHub Copilot.
- `.gitignore` — excludes local `.env` and macOS `.DS_Store` files from Git.
