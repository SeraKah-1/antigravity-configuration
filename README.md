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

- Symlinks `CLAUDE.md` and `GEMINI.md` to your `$HOME` so any AI agent picks them up automatically.
- Initializes `session_state.md` as a token-efficient memory anchor.
- Creates a `.env` template for credentials (git-ignored, never pushed).

## What's Inside

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Behavior contract: PA-SDLC 5-phase workflow, skills, coding standards |
| `session_state.md` | Memory anchor with compaction policy (<10 entries) |
| `install.sh` | Single-command portable setup script |

## Update

```bash
git -C ~/.antigravity-config pull
```

Symlinks auto-reflect the latest changes.