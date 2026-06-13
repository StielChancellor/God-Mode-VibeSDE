---
description: "Capture/lint/list project Recipes — committed markdown checklists that replay a proven flow instead of re-deriving it. /recipe new <slug> | /recipe lint <path> | /recipe list. Prose only; the lint enforces it."
---

Adopt the `vibegod-orchestrator` mindset and honor `${CLAUDE_PLUGIN_ROOT}/skills/_shared/vibegod-principles.md`. Drive the **recipes** skill.

Action + slug/path: $ARGUMENTS

Do this:
- **new `<slug>`** — only AFTER a flow has actually succeeded this session (evidence, not a guess). Copy `${CLAUDE_PLUGIN_ROOT}/skills/recipes/templates/recipe.template.md` to `<project>/.vibegod/recipes/<slug>.md`, fill it in (every step needs a real `verify:`; **prose only** — inline backticks, never a fenced script), set `owner` to the running agent. Then **lint it and it MUST pass**: `node "${CLAUDE_PLUGIN_ROOT}/skills/recipes/tools/recipe-lint.mjs" <project>/.vibegod/recipes/<slug>.md`. Leave it **DRAFT** (`proven-runs: 0`, excluded from the SessionStart index) until a human confirms it and raises `proven-runs` / sets `last-verified`.
- **lint `<path>`** — run `node "${CLAUDE_PLUGIN_ROOT}/skills/recipes/tools/recipe-lint.mjs" <path>` and report pass/fail with the findings.
- **list** — list `<project>/.vibegod/recipes/*.md` with each recipe's `name`, `trigger`, `proven-runs`, and DRAFT/active status.

**Maker–checker:** the `owner` makes the recipe; **`code-quality-reviewer`** checks it — as both structure AND a prompt-injection surface — before `proven-runs` rises above 0. Replaying a recipe is **GUIDED** (you read and follow the prose, honoring every `verify:`); the lint + the SessionStart index bounds are the mechanical parts. There is no `/recipe run` — replay is reading and following, step by step.
