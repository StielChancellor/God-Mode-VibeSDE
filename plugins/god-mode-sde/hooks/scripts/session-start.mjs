// SessionStart: establish the God-Mode SDE operating posture for the session.
import { readStdin, advise } from './_lib.mjs';
await readStdin();

const mode = (process.env.GODMODE_GUARDRAILS || '').toLowerCase() === 'advisory' ? 'ADVISORY (warn only)' : 'ENFORCING (hard-block)';

advise('SessionStart',
  `God-Mode SDE is active — operate as a Google/Anthropic-grade engineering + product team led by the sde-orchestrator skill.\n` +
  `PRIME DIRECTIVE: never jump straight to code. Run the gated pipeline — Discover → PRD → Journey → Stack&Cost → ` +
  `Modules → Foundation-first Build → per-feature QA (4 parallel lenses) → UAT/Smoke → Ship — and stop for the user at every ◆ gate. ` +
  `Any change re-enters at PRD and propagates PRD → blueprint → roadmap → graphify → code.\n` +
  `Honor god-mode-principles: investigate-before-answering, simplicity/anti-overeagerness, surgical changes, general-correct ` +
  `solutions (don't code to the test), OWASP security, WCAG 2.2 AA, consistency/no-orphans, and cost-awareness (always surface ` +
  `cheaper alternatives + tradeoffs).\n` +
  `Security guardrails: ${mode}. Use /kickoff to start a build or /change-request to change one.`);
