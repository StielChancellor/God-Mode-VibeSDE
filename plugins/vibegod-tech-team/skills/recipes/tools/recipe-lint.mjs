// recipe-lint — structural + safety linter for VibeGod recipes (Tier-1 codified flows).
// Usage: node recipe-lint.mjs <recipe.md>   Exit 0 = OK (warnings allowed) · 1 = FAIL · 2 = usage.
// Zero-dep. It is the LOCAL injection-scan for recipes (which bypass /ingest-scan, being project files).
// Enforces: required frontmatter; prose-only (no code fences); every step a real verify:; non-empty
// Fallback; no prompt-injection markers in name/trigger; sane proven-runs/last-verified; known owner.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { looksInjected } from '../../../hooks/scripts/_markers.mjs';

const file = process.argv[2];
if (!file) { console.error('usage: node recipe-lint.mjs <recipe.md>'); process.exit(2); }
if (!existsSync(file)) { console.error(`recipe-lint: file not found: ${file}`); process.exit(2); }

const src = readFileSync(file, 'utf8');
const fails = [], warns = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);

// 1. Frontmatter block.
const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!fm) { console.error('  ✗ missing YAML frontmatter (--- block)'); process.exit(1); }
const meta = {};
for (const line of fm[1].split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
  if (m) meta[m[1]] = m[2].trim();
}
for (const k of ['name', 'trigger', 'owner', 'created', 'last-verified', 'proven-runs']) {
  if (!meta[k]) fail(`frontmatter: missing or empty '${k}'`);
}

// 2. Injection markers in name/trigger — recipe-lint IS the local /ingest-scan for recipes.
for (const k of ['name', 'trigger']) {
  if (!meta[k]) continue;
  if (looksInjected(meta[k])) fail(`frontmatter '${k}': contains prompt-injection markers — recipes must not embed instructions`);
  if (/[`<>]/.test(meta[k])) fail(`frontmatter '${k}': contains backtick/angle-bracket (injection risk) — use plain words`);
}

// 3. proven-runs integer; last-verified a parseable, non-future date.
if (meta['proven-runs'] && !/^\d+$/.test(meta['proven-runs'])) fail(`frontmatter 'proven-runs' must be a non-negative integer`);
if (meta['last-verified']) {
  const d = Date.parse(meta['last-verified']);
  if (Number.isNaN(d)) fail(`frontmatter 'last-verified' is not a parseable date (use YYYY-MM-DD)`);
  else if (d > Date.now() + 86400000) fail(`frontmatter 'last-verified' is in the future`);
}

// 4. owner is a real vibegod agent (best-effort: resolve the plugin's agents/ relative to this tool).
try {
  const agentsDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'agents');
  if (existsSync(agentsDir)) {
    const names = new Set(readdirSync(agentsDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')));
    if (meta.owner && !names.has(meta.owner)) fail(`frontmatter 'owner': '${meta.owner}' is not a known vibegod agent`);
  } else { warn(`could not resolve agents/ to validate owner (ran outside the plugin tree)`); }
} catch { warn('owner validation skipped'); }

// 5. Prose-only: NO triple-backtick fenced code blocks (the mechanical enforcement of rule 1).
const body = src.slice(fm[0].length);
if (/^[ \t]*(?:```|~~~)/m.test(body)) fail(`prose-only: fenced code block found — reference existing commands with inline backticks, never embed a script`);

// Section extractor: from a heading until the next "## " heading or end-of-string.
const sec = (name) => {
  const m = ('\n' + body).match(new RegExp(`\\n##\\s+${name}\\b([\\s\\S]*?)(?=\\n##\\s|$)`, 'i'));
  return m ? m[1] : null;
};

// 6. Steps: each top-level list item must carry a real (non-vacuous) verify:.
const steps = sec('Steps');
if (steps === null) fail(`missing '## Steps' section`);
else {
  const items = steps.split(/\r?\n(?=(?:\d+\.|[-*])[ \t])/).filter((s) => /^(?:\d+\.|[-*])[ \t]/.test(s)).map((s) => s.trim());
  if (!items.length) fail(`'## Steps' has no checklist items`);
  for (const it of items) {
    const first = it.split(/\r?\n/)[0].slice(0, 50);
    const vm = it.match(/verify:\s*([\s\S]*)/i);
    if (!vm) fail(`step has no 'verify:' check: "${first}…"`);
    else if (vm[1].replace(/\s+/g, '').length < 8) fail(`step has a vacuous 'verify:' (too short to be a real check): "${first}…"`);
  }
}

// 7. Fallback section present + non-empty.
const fb = sec('Fallback');
if (fb === null) fail(`missing '## Fallback' section (mandatory — the safe exit when a step fails)`);
else if (fb.replace(/\s+/g, '').length < 20) fail(`'## Fallback' section is empty or too short`);

// Report.
const base = file.split(/[\\/]/).pop();
for (const w of warns) console.error(`  ! ${base}: ${w}`);
for (const f of fails) console.error(`  ✗ ${base}: ${f}`);
if (!fails.length) console.log(`  ✓ ${base}: recipe OK${warns.length ? ' (with warnings)' : ''}`);
process.exit(fails.length ? 1 : 0);
