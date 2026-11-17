# Unstuck

Unstuck turns a person's time horizon and tolerance for loss into a suggested split across short, medium and long term. The user's money never passes through Unstuck; they transfer directly to a licensed institution.

## Open the app

Open `index.html` directly in a web browser. No server, installation, or build step is needed.

## Core flow

The user enters their monthly rental income, how much they can set aside, the purpose, their time horizon, and what they would do if the balance dropped 10%. Those answers drive the suggested split: the horizon sets the starting mix, and the risk answer adjusts it. The purpose is recorded and shown but does not change the split.

## What is simulated and what is not

Every institution, screen, and account number in the execution guide is invented. The destination shown is the string `NOT A REAL ACCOUNT - DEMO ONLY`.

There is no sign-in or cross-user test. This is a static page with no server, database, or accounts, so there is no second user whose data could leak. The day the app stores anything, sign-in and that test come first.

There are no pull requests in this repository because I work alone. Review is done by a separate reviewer session with clean context and recorded in `BITACORA.md`.

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
