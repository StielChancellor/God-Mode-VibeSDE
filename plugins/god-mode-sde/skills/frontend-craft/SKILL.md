---
name: frontend-craft
description: Use whenever building or restyling any user-facing UI — web app, site, landing page, dashboard, or component. Trigger on "build the frontend", "make the UI", "style this page", "it looks generic/like AI slop", or any visual/design work. Enforces distinctive, sophisticated, committed design by default (anti "AI slop") and ties every choice to WCAG 2.2 AA accessibility. Loads before the frontend coding agents run.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Frontend Craft — distinctive UI by default

The default output of an AI frontend is generic: Inter font, a default-blue palette, no motion,
flat white background, predictable layout. **That is the failure mode this skill exists to
prevent.** Build UIs that look intentional, committed, and made by someone with taste — while
staying accessible. Match the product's character; don't apply one house style to everything.

## Fits in the pipeline
- **Stage 6** (`/build`), frontend track. Runs with `frontend-engineer`.
- Accessibility is part of "done" — pair with `accessibility-wcag` (checked at Stage 7/8).
- Any visual change re-enters the pipeline at Stage 9 like everything else.

## Aesthetic doctrine (apply this verbatim as guidance)

> **Typography:** Choose distinctive, characterful typefaces. Do NOT default to Inter, Roboto,
> Arial, or the system font stack. Do NOT reflexively converge on Space Grotesk either — that
> has become its own cliché. Pick a typeface (or a deliberate display/body pairing) that fits
> the product's voice, and commit to it.
>
> **Color:** Build a cohesive, committed color theme via CSS variables — a real palette with a
> point of view, not a default and a gray. Define semantic tokens (surface, accent, muted, etc.)
> and use them consistently. Vary light vs dark per context — don't ship the same theme everywhere.
>
> **Motion:** Use purposeful motion. Staggered page-load reveals so content arrives with rhythm
> instead of popping in flat. In React, use the Motion library (motion/Framer Motion). Motion
> should support comprehension and hierarchy — never gratuitous.
>
> **Backgrounds:** Atmospheric, layered backgrounds — subtle gradients, grain, depth, layered
> shapes — not a flat white void. Give the page a sense of space and material.
>
> **Make unexpected, context-fit choices.** Vary light/dark and the overall aesthetic to suit
> the specific product. The goal is a UI that feels designed, distinctive, and sophisticated —
> never templated, never "AI slop."

## How to apply it (surgical, not a redesign rampage)
- **Establish the system once:** font(s), CSS-variable palette, spacing/radius scale, motion
  primitives. Everything else references the tokens. No hard-coded colors scattered in components.
- **Commit to a direction** that fits this product's voice (editorial, technical, playful,
  brutalist, refined — pick one and execute it fully). Half-committed is worse than plain.
- **Respect anti-overeagerness (#2):** when asked to change one component, restyle that component
  within the existing system — don't silently re-theme the whole app. Propose a fuller refresh
  separately if warranted.

## Tie every choice to accessibility (WCAG 2.2 AA)
Distinctive is not an excuse to be inaccessible. Enforce alongside `accessibility-wcag`:
- **Contrast:** body text ≥ 4.5:1, large text/UI ≥ 3:1 — against the *actual* layered background,
  not a hypothetical white. Atmospheric backgrounds must not eat legibility.
- **Motion:** honor `prefers-reduced-motion` — reveals and transitions reduce to instant/opacity.
  Never gate content or meaning behind animation.
- **Focus:** visible, high-contrast focus states that match the theme (don't delete the outline).
- **Color is never the only signal:** pair it with text/icon/shape.

## Definition of done (frontend)
Distinctive committed design + WCAG 2.2 AA + reduced-motion support + theme driven by CSS vars +
no generic-default fonts. Verified at the Stage 7 QA gate before the feature closes.
