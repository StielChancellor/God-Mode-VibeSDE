---
name: no-orphans-sweep
trigger: no-orphans check, did I leave anything orphaned, dead code after a change, find all call sites
owner: qa-engineer
created: 2026-06-01
last-verified: 2026-06-10
proven-runs: 4
escalate-if: the impact set needs computed reachability beyond graphify's query output
---

# Recipe: No-orphans sweep after a change

## When to use
After adding, renaming, or removing a symbol/endpoint/UI string and you must confirm nothing was left
half-wired. NOT for: a brand-new file with no dependents yet.

## Preconditions  (abort if any fail)
- [ ] The change is implemented and the working tree builds. verify: the build/typecheck command exits 0
- [ ] graphify is available. verify: `cat .graphify-path` prints a command, or run `/graph` first

## Steps  (each step = an existing action + a `verify:` check)
1. **Find every dependent with graphify, not grep** — run `G="$(cat .graphify-path 2>/dev/null || echo graphify)"; $G affected "<symbol>" --depth 2`. verify: the output lists the impact set (or states none) and you did NOT fall back to a text grep for call sites
2. **Update every call site in the impact set** — edit each dependent the graph named. verify: re-running `$G affected "<symbol>"` shows no stale consumer and the build still exits 0
3. **Confirm no dead code** — for anything the change made unreachable, run `$G explain "<symbol>"`. verify: a symbol with no inbound edges is removed and nothing the team still uses was deleted
4. **Round-trip UI ↔ backend** — exercise the changed path end to end. verify: the UI action reaches the backend and back with no orphaned endpoint or dead control
   - ↳ if any verify fails: STOP and hand back to the owning engineer — do not mark the feature done.

## Done means
graphify shows zero stale dependents for the changed symbol, the build/tests are green, and the UI↔backend
round trip works — i.e. the Stage-7 consistency / no-orphans lens would pass.

## Fallback
If `.graphify-path` is missing, graphify errors, or any `verify:` fails, **abandon this recipe and run the
full `/feature-check` consistency lens from scratch.** The recipe is a shortcut, never a cage.
