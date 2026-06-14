# Antigravity Configuration

SOTA Pragmatic Agentic SDLC (PA-SDLC) workflow configuration for AI coding assistants (Claude Code, Gemini CLI, Antigravity, Cursor, etc).

## Quick Install

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/SeraKah-1/antigravity-configuration/main/install.sh)"
```

Or clone manually:

```bash
git clone https://github.com/SeraKah-1/antigravity-configuration.git ~/.antigravity-config
cd ~/.antigravity-config && ./install.sh
```

## What It Does

The `install.sh` script:
- Clones this repo to `~/.antigravity-config` (or pulls latest if already installed)
- Symlinks `CLAUDE.md` and `GEMINI.md` to your `$HOME` — any AI agent auto-detects them
- Initializes `session_state.md` as a token-efficient memory anchor (won't overwrite existing)
- Creates a `.env` template for credentials (git-ignored, never pushed)

Idempotent — safe to run multiple times on any device.

## What's Inside

| File / Folder | Purpose |
|------|---------|
| `CLAUDE.md` | **Core behavior contract** — PA-SDLC 5-phase workflow, frontend-design/test-qa/simplify skills, anti-rationalization gates, coding standards |
| `session_state.md` | **Memory anchor** — token-efficient log with compaction policy (<10 entries, auto-archive) |
| `install.sh` | Single-command portable setup — symlinks config to `$HOME` |
| `token-monitor.sh` | **Token usage monitor (CLI)** — estimates session token consumption, shows model limits, health warnings |
| `token-monitor-dashboard.sh` | **Dashboard Launcher** — shell script to launch the local real-time web dashboard |
| `dashboard/` | **Web Dashboard App** — Express.js backend and Vanilla JS/Chart.js frontend |

## Token Monitor & Real-Time Dashboard

Track your Antigravity CLI token usage and avoid hitting limits mid-session. We offer two options:

### 1. Real-Time Web Dashboard (Recommended)

A gorgeous, live-updating cyberpunk/industrial web dashboard showing token growth charts, step counts, active models, and recent tool logs. It updates in real-time as the agent works!

```bash
# Start the web dashboard (default port: 3000)
./token-monitor-dashboard.sh

# Or start it on a custom port
./token-monitor-dashboard.sh 8080
```

Open `http://localhost:3000` (or your chosen port) in your browser.

**Dashboard Features:**
- **Live growth chart** — tracks token accumulation step-by-step using Chart.js.
- **Session details** — active model, start time, latest active timestamp.
- **Log Stream** — real-time list of system tool calls executed by the agent.
- **Health status** — visual warnings (Low/Moderate/High usage) with remediation advice.
- **Session history** — dropdown to review stats of previous CLI sessions.

### 2. CLI Monitor

For a quick terminal check:

```bash
# Monitor current (latest) session
./token-monitor.sh

# Monitor a specific session
./token-monitor.sh <conversation-id>
```

**Output includes:**
- Session activity stats (steps, messages, tool calls)
- Token estimation (compact & full transcript)
- Models used during the session (auto-detected from transcript)
- Rate limits reference table per model (RPM/TPM/RPD)
- Health check with warnings when usage gets high
- Quick links to Google AI Studio, Anthropic Console, and GCP quota dashboards

```
╔══════════════════════════════════════════════════════════════╗
║          🛰️  ANTIGRAVITY TOKEN MONITOR                      ║
╚══════════════════════════════════════════════════════════════╝

Session:  297b024a-4cb8-4361-b73a-be1ab3490127
Model:    Claude Opus 4.6 (Thinking)

── Session Activity ──────────────────────────────────────────
  Total steps:                 459
  User messages:               27
  Model responses:             185
  Tool invocations:            174

── Token Estimation ─────────────────────────────────────────
  Full transcript:             ~273,173 tokens

── Health Check ─────────────────────────────────────────────
  ⚡ MODERATE USAGE — Watch for checkpoint truncations.
```

> **Note:** Token counts are estimates (~4 chars/token). For precise billing data, use the Quick Links to official dashboards.

## PA-SDLC Workflow (5 Phases)

| Phase | What | Who |
|-------|------|-----|
| 1. Setup & Research | Challenge assumptions, list explicit assumptions, research SOTA, audit credentials, atomic planning | Antigravity (main) |
| 2. UI Design | Layout, typography, color systems, visual atmosphere | `ui-designer` subagent |
| 3. Core Coding | Modular code, real-time refactoring | Antigravity (main) |
| 4. Destructive QA | Boundary tests, empty states, failure cases | `qa-engineer` subagent |
| 5. Deep Debug | Root cause analysis, structural fixes, regression prevention | Antigravity (main) |

## Key Design Decisions

- **Subagents over skill bloat** — 3 focused subagents (`ui-designer`, `qa-engineer`, `code-simplifier`) instead of 1,500+ SKILL.md files
- **Session memory anchoring** — `session_state.md` prevents context drift across sessions with <300 token overhead
- **Anti-rationalization gates** — AI can't skip steps by claiming "too simple for tests"
- **Situational aesthetics** — Bold themes for consumer products, clean/neutral for internal tools & dashboards

## Update

```bash
git -C ~/.antigravity-config pull
```

Symlinks auto-reflect the latest changes. No reinstall needed.

## License

MIT