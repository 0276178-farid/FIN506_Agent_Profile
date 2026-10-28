# FIN506 Agent Profile

Copy-ready guardrails for your semester project. One folder, one agent, scoped autonomy,
verified work. Set this up once in week 2 and it runs all semester.

## The autonomy dial (course policy)

| Position | When | What it means |
|---|---|---|
| 1. Ask everything | Weeks 1 and 2 | Every command shows an approval card. Slow on purpose: learn what your agent does. |
| 2. Scoped autonomy | Semester default | Safe categories run without asking (read-only, tests, git status/diff). Cards appear only for installs, deletions, network calls, anything outside the folder. |
| 3. Full auto | Disposable environments only | No cards. Only in a GitHub Codespace or throwaway sandbox with nothing to lose. Never on your laptop. |

Rationale: approval fatigue is a real failure mode. One approval that means something
beats forty that mean nothing.

## Setup (10 minutes)

1. Create your project folder and open ONLY that folder in VS Code.
2. Initialize git: `git init`, first commit.
3. Copy `AGENTS.md`, `SPEC.md` and `BITACORA.md` into the project root. Fill in the
   "Project facts" section of `AGENTS.md` and all of `SPEC.md`.
4. **VS Code + Copilot:** merge `vscode-settings.jsonc` into your settings
   (Ctrl+Shift+P, "Preferences: Open Workspace Settings (JSON)"). Setting names move
   between versions: if a key is not recognized, search Settings for "terminal auto approve".
5. **Copilot reviewer:** copy `reviewer.chatmode.md` to `.github/chatmodes/reviewer.chatmode.md`
   in your repo. It appears in the Copilot Chat mode picker as "reviewer".
6. **Claude Code users:** copy `claude-settings.json` to `.claude/settings.json` and
   `claude-reviewer-agent.md` to `.claude/agents/reviewer.md`.

## The session ritual (every build session)

1. `git pull` (if pairing across machines), then `git commit` a clean checkpoint BEFORE the agent runs.
2. Work in agent mode. Read every card that appears: the allowlist means the ones you see matter.
3. When the session ends, run the **reviewer** on the diff. Read its report.
4. Fix or accept, commit, and write one entry in `BITACORA.md` (three lines is enough).

## Gates (when a human must sign off)

- New dependency, new top-level folder, or a data model change: both partners present.
- Anything touching money logic or formulas: reviewer report plus both partners.
- Before each entrega: full reviewer pass, tests green, bitacora up to date.

## Full auto, the honest way

Want to let the agent run unattended? Do it in a GitHub Codespace (free for students):
the environment is the guardrail. Nothing sensitive to reach, delete it when done.
Auto-approve settings on your own laptop stay off for course work.

## Reviewer model tip

Verification is high-volume and does not need the most expensive model. A cheap fast
frontier model (for example the Gemini Flash tier in Copilot's model picker) is a good
reviewer; keep your strongest model for building and for judgment calls.

## What this costs you

Nothing. Everything in this profile runs on the free student plan: VS Code is free,
Copilot Pro is free through the GitHub Student Developer Pack (including frontier
models in the picker, subject to your monthly premium-request quota), and Codespaces
has a free student tier for the full-auto sandbox. Spend your quota on building and
judgment calls; route high-volume review to the cheaper models in the picker. No API
keys, no cards on file, nothing to expense.

## The external documentation this profile is built on

Maintained references, in order of usefulness:

- AGENTS.md open convention: https://agents.md
- VS Code Copilot customization and agent mode (instructions files, chat modes, terminal auto-approve): https://code.visualstudio.com/docs/copilot
- Claude Code settings, permissions and subagents: https://docs.claude.com
- Model Context Protocol (tools standard): https://modelcontextprotocol.io
- OWASP GenAI security guidance (when you want the formal risk framing): https://genai.owasp.org
- UP lineamientos de IA: https://ciie.up.edu.mx/ai4ed · Codigo de honor: https://codigodehonor.up.edu.mx

This handout is the course-specific layer on top of those documents. When a menu or
setting name changes, the principle does not: scoped autonomy, gates at milestones,
independent review, everything logged.

FIN506 Financial Technology · Universidad Panamericana · Fall 2026
