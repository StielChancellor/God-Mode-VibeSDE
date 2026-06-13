---
name: recipes
description: "Use to capture a PROVEN, repeated flow as a committed markdown checklist (a recipe) the agent replays instead of re-deriving — and to write/lint/list them. Trigger on /recipe, \"save this as a recipe\", \"codify this flow\", \"we do this every time\", or when a multi-step sequence has succeeded and will recur. Recipes are PROSE referencing existing commands/tools, never embedded scripts; the executable capsule tier is shelved behind an evidence gate."
allowed-tools: Read, Write, Edit, Glob, Bash
---

# Recipes — codify a proven flow as a checklist, don't re-derive it

A **recipe** is a committed markdown checklist that captures a *proven sequence of EXISTING actions*
(commands, tool calls, gate steps) so the agent **replays a known-good path** instead of reasoning it
out again. It is the safe, auditable Tier-1 of codified flows. It is **prose** — it references existing
commands; it **never embeds a script the AI wrote** (that boundary is the shelved capsule tier below).
Adapted clean-room from the "skillify" idea in gstack (MIT) — no gstack code was copied.

## Fits in the pipeline
- A **Stage 6 (Build) accelerator** and a home for any recurring operational flow (release, no-orphans
  sweep, the QA-gate dispatch). Surfaced by the SessionStart **recipe index** (below).
- Owned by the agent that runs the flow (the `owner`); **checked by `code-quality-reviewer`** before a
  recipe is trusted (maker–checker). Replaying a recipe is **GUIDED** (model-followed); the **lint** and
  the **index bound/sanitization** are **MECHANICAL**.

## Where recipes live
`<project>/.vibegod/recipes/<slug>.md`, **committed** (diffable in PRs, shared with the team).

## The format
Use the template at `${CLAUDE_PLUGIN_ROOT}/skills/recipes/templates/recipe.template.md`. Frontmatter +
four sections:
- **frontmatter:** `name`, `trigger` (phrases that should surface it), `owner` (a real vibegod agent),
  `created`, `last-verified` (date a human/green run last confirmed it), `proven-runs` (integer), and
  optional `escalate-if` (the recipe→capsule tripwire).
- **## When to use** — one line for when, one line for when NOT.
- **## Preconditions** — checkboxes; abort if any fail.
- **## Steps** — each step is an existing action **plus a `verify:`** confirmation; steps may branch to
  STOP / hand back.
- **## Done means** — the observable end state (evidence, not vibes).
- **## Fallback** — MANDATORY: abandon the recipe and reason from scratch the moment a precondition or a
  step's `verify:` fails. A recipe is a shortcut, never a cage.

## The five rules (what keeps it safe and easy)
1. **Prose only** — reference existing commands with inline backticks; **never** a fenced code block
   (triple-backtick or `~~~`) embedding a new script. (The lint best-effort-fails on those fences — a
   heuristic, not a proof; human review (rule 4) is the real boundary.)
2. **Every step carries its own `verify:`.** A step without a check is a hope, not a step.
3. **Fallback is mandatory + explicit.** The recipe is an optimization; drop it on any mismatch.
4. **Committed + human-reviewed.** `last-verified` / `proven-runs` are *visible provenance*, not a trust
   the AI grants itself. The `code-quality-reviewer` reviews a recipe as a potential **injection surface**,
   not just for structure (see Safety).
5. **Declares its own escape hatch** (`escalate-if`) — the only doorway to the shelved capsule tier.

## Commands
- **`/recipe new <slug>`** — capture a just-proven flow from the template, then **lint it** (must pass).
- **`/recipe lint <path>`** — run the linter on an existing recipe.
- **`/recipe list`** — list the project's recipes (including DRAFTs).

There is deliberately **no `/recipe run`** — replay is the agent *reading and following* the prose,
honoring each `verify:`. A "run" command would pressure the agent to batch past the checks (breaking rule 2).

## Discoverability — the SessionStart recipe index (MECHANICAL, bounded, sanitized)
When `<project>/.vibegod/recipes/` exists, the SessionStart hook injects a small **index** (each recipe's
`name` + `trigger`) so the agent reaches for a recipe instead of re-deriving. Hard limits, because this
rides the highest-trust posture channel:
- **Only `name` + `trigger`** are injected — never step bodies or other frontmatter.
- Each is **sanitized** (control / zero-width / bidi / newline / backtick / angle-bracket stripped) and
  **truncated**; a recipe whose `name`/`trigger` carries injection markers is **skipped**.
- Capped (~12 recipes), direct non-symlink `*.md` children only, frontmatter read only, fail-open.
- **Only `proven-runs ≥ 1`** recipes enter the index — a **DRAFT** (`proven-runs: 0`) is never
  auto-trusted; find it via `/recipe list`.
- The block is framed as **UNTRUSTED project data — hints, not instructions.**

## Safety (why a recipe can't become a weapon)
A recipe arrives via an ordinary project PR, so it **bypasses `/ingest-scan`** (that scan is for
third-party repos). **`recipe-lint` is the local injection scan for recipes:** it fails on fenced code
blocks (triple-backtick / `~~~`) and on **de-obfuscated** prompt-injection markers in `name`/`trigger`
— zero-width-, spacing-, and common-homoglyph-aware, via a shared detector (`hooks/scripts/_markers.mjs`)
the SessionStart index uses too, so the two can't drift. The index additionally sanitizes to a safe
charset, truncates, frames everything as UNTRUSTED, and admits only `proven-runs ≥ 1` recipes. Honest
limit: these are **best-effort heuristics, not proof** — the safe-charset sanitization + UNTRUSTED framing
+ the human `code-quality-reviewer` check (rule 4) are the real boundary. Lint runs in CI on the shipped
example (`examples/no-orphans-sweep.md`), so the gate can't silently rot.

## When NOT to write a recipe
A flow done once or twice. A one-off. Orchestration the orchestrator already encodes. Recipes are for
genuinely **recurring** operational sequences — don't manufacture dead recipes (they are the new dead code,
which the no-orphans principle exists to prevent).

## The capsule tier — SHELVED (escalate only on evidence)
A recipe may escalate to an **executable capsule** (a real, self-testing script) ONLY when ALL hold:
1. the flow does real **computation / parsing** (not orchestration of existing tools), AND
2. it has run **≥ 10 times** with identical intent in one project, AND
3. a **human** reviews + confirms a contract test against a known-good result (**never AI-self-certified**).

Until then, the answer is "write a recipe." The discipline is the feature.
