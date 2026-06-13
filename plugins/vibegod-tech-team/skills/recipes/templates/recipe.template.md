---
name: <kebab-slug>
trigger: <phrases that should surface this recipe, comma-separated — plain words only>
owner: <a real vibegod agent, e.g. release-manager>
created: <YYYY-MM-DD>
last-verified: <YYYY-MM-DD — set by a human/green run once confirmed>
proven-runs: 0
escalate-if: <when this outgrows a checklist — the capsule tripwire (optional)>
---

# Recipe: <Title>

## When to use
<one line: the situation this applies to.> NOT for: <one line: when to skip it.>

## Preconditions  (abort if any fail)
- [ ] <precondition> verify: <how you know it holds>

## Steps  (each step = an existing action + a `verify:` check; prose only — inline backticks, never a code fence)
1. **<action>** — run `<existing command>`. verify: <the observable check that it worked>
2. **<action>** — <existing tool/step>. verify: <the observable check>
   - ↳ if <failure>: STOP and hand back to `<owner>` — do not continue.

## Done means
<the observable end state — evidence a human could confirm.>

## Fallback
If any precondition or step `verify:` fails, **abandon this recipe and reason from scratch.** A recipe is
a shortcut, never a cage.
