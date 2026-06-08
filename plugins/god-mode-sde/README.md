# god-mode-sde (plugin)

The God-Mode SDE plugin. See the [repository README](../../README.md) for the full overview
and install instructions.

## Layout
```
god-mode-sde/
├── .claude-plugin/plugin.json
├── skills/
│   ├── _shared/god-mode-principles.md   # canonical operating principles
│   ├── sde-orchestrator/                # the lead — drives the gated pipeline
│   └── <domain + methodology skills>/
├── agents/                              # the specialist team (subagents)
├── commands/                            # pipeline entry points (/kickoff, /prd, ...)
└── hooks/                               # runtime security/QA guardrails (Node.js)
```

## How it works
The `sde-orchestrator` skill triggers when you ask to build/improve a platform. It runs a
strict, gated SDLC, delegating to the specialist subagents and applying the methodology
skills, while the hooks apply best-effort security/QA guardrails (heuristic, fail-open — a
safety net, not a security boundary).

Guardrail mode: best-effort blocking by default (these are bypassable regex heuristics, not a
security boundary — they fail open); set `GODMODE_GUARDRAILS=advisory` to downgrade blocks to
warnings. The dangerous-delete guard intentionally ALLOWS deletes of build/dependency dirs
(node_modules, dist, build, .cache, target, …) — even by absolute path — while still blocking
home-root, system, drive-root, and bare-root targets.
