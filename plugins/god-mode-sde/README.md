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
skills, while the hooks enforce security/QA guardrails regardless of model decisions.

Guardrail mode: hard-block by default; set `GODMODE_GUARDRAILS=advisory` to downgrade blocks
to warnings.
