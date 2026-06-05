---
name: qa-gates
description: Use to run the multi-lens QA model that gates every feature and the final ship. Trigger before closing any feature ("is this feature done", "QA this", "feature check") and before shipping ("ship check", "final QA", "ready to release"). Per feature, dispatch security-engineer + code-quality-reviewer + adversarial-tester + qa-engineer in PARALLEL — all must pass. Final gate adds a best-practices pass + UAT + smoke before ship.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# QA Gates — the multi-lens quality model

Quality is gated, not assumed. No feature closes and nothing ships without the lenses confirming.
Evidence-based only: a lens "passes" when it has actually run and verified, never on assertion
(#8). Each lens fixes what it finds (or files it precisely) before declaring pass.

## Fits in the pipeline
- **Stage 7** (`/feature-check`) — runs before closing EACH feature.
- **Stage 8** (`/ship-check`) — final pass + UAT + smoke before shipping to end users.

## Stage 7 — per-feature gate (4 lenses, IN PARALLEL)
Before a feature is marked done, dispatch these four agents **in parallel**; all must pass:

1. **`security-engineer`** — OWASP + cyber best practices: authz at boundaries, input validation/
   output encoding, secrets handling, dependency/SCA scan, no injection sinks. (See `secure-coding`.)
2. **`code-quality-reviewer`** — refactor/simplify where warranted: anti-overeagerness, dead code,
   duplication, readability, surgical-change discipline. Simpler-where-simpler-is-correct.
3. **`adversarial-tester`** — flaw-finding: attack the feature, hunt edge cases, boundary
   conditions, race conditions, malformed input; find and fix defects.
4. **`qa-engineer`** — functional QA from frontend, backend, USER, and code perspectives. Verifies
   it works as intended AND runs the **consistency / no-orphans check**:
   - UI ↔ backend in sync (no UI element without a working backend; no removed backend the UI
     still advertises).
   - Every call site of changed code updated; no half-wired feature.
   - No dead/orphaned code the change left behind.
   - Accessibility (WCAG 2.2 AA) + cross-browser/perf budgets for UI.

◆ **Only when all four lenses confirm** does the feature close and the swarm move to the next task.
A single failing lens blocks the feature.

## Stage 8 — final gate before ship
1. A **fresh** set of QA agents runs a thorough **best-practices pass** and fixes findings (fresh
   eyes catch what the build team normalized).
2. Run the **UAT plan** — real-world acceptance scenarios from the build roadmap, tied to PRD
   requirements.
3. Run the **smoke-test plan** — critical-path checks on a deploy-like environment.
◆ Confirm all green with the user, then ship for end-user review.

## How to run it
- Dispatch the four Stage-7 lenses concurrently (one agent per lens) — don't serialize them.
- Aggregate: report per-lens pass/fail with evidence (test output, scan results, screenshots for
  a11y). Surface any blocker plainly; don't paper over a fail to advance.
- Re-run after fixes until clean. "Green" means actually green, observed.
