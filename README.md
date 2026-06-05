# God-Mode SDE

> A virtual enterprise engineering + product team for Claude Code. Install it, and a lead
> orchestrator guides you through building (or improving) any platform end-to-end — with a
> strict, gated SDLC, security/QA guardrails enforced at runtime, and OWASP + WCAG + OODA
> baked in.

This repository is a **Claude Code plugin marketplace** (`vibe-fde`) hosting one plugin:
**`god-mode-sde`**.

## Install (Claude Code desktop)

```
/plugin marketplace add StielChancellor/God-Mode-VibeSDE
/plugin install god-mode-sde@vibe-fde
```

## What you get

- **A lead orchestrator** (`sde-orchestrator`) that runs a strict, gated pipeline and never
  jumps straight to code:

  `Discover -> PRD -> Journey -> Stack & Cost -> Modules -> Foundation-first Build ->
   Per-feature QA -> UAT/Smoke -> Ship`  (any change re-enters at PRD)

- **A specialist team (subagents):** solution-architect, product-manager, ux-journey-designer
  (frontier model), backend-/frontend-/data-engineer, devops-sre, ai-agent-engineer, and a
  4-lens QA swarm (security-engineer, code-quality-reviewer, adversarial-tester, qa-engineer).

- **Battle-tested methodology skills** (adapted from superpowers): TDD, systematic debugging,
  planning, code review, parallel-agent dispatch, git worktrees, verification-before-completion.

- **Runtime guardrails (hooks):** hard-block secrets-in-code, dangerous shell commands, and
  injection sinks; advisory nudges for tests/lint/change-propagation. Cross-platform (Node.js).
  Downgrade to advisory with `GODMODE_GUARDRAILS=advisory`.

- **Compliance by default:** OWASP Top 10 + Secure Coding, WCAG 2.2 AA accessibility, OODA
  iteration, and cost-aware stack selection (always shows cheaper alternatives + tradeoffs).

- **Codebase awareness:** optional [graphify](https://github.com/safishamsi/graphify)
  integration (detect -> offer auto-install -> proceed-without -> lighter built-in fallback).

## Commands

`/kickoff` `/prd` `/journey` `/stack-and-cost` `/module-map` `/build-plan` `/build`
`/feature-check` `/ship-check` `/change-request` `/design-review` `/ingest-scan` `/graph`

## Security & provenance

Every third-party source bundled here was security-scanned (static, read-only, no install
scripts executed; markdown checked for prompt-injection) before ingestion. See
[`ingest/reports/`](ingest/reports/) and [`ATTRIBUTION.md`](ATTRIBUTION.md).

## License

MIT — see [`LICENSE`](LICENSE).
