// Self-validation for the god-mode-sde plugin. Run: node ingest/validate.mjs
// Checks: manifests parse; every SKILL.md/agent/command has required frontmatter.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN = join(ROOT, 'plugins', 'god-mode-sde');
let errors = 0, warns = 0;
const err = (m) => { console.error('  ✗ ' + m); errors++; };
const warn = (m) => { console.warn('  ! ' + m); warns++; };

function frontmatter(file) {
  const t = readFileSync(file, 'utf8');
  const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].trim();
  }
  return fm;
}

console.log('Manifests:');
for (const f of ['.claude-plugin/marketplace.json', 'plugins/god-mode-sde/.claude-plugin/plugin.json']) {
  try { JSON.parse(readFileSync(join(ROOT, f), 'utf8')); console.log('  ✓ ' + f); }
  catch (e) { err(`${f}: ${e.message}`); }
}

console.log('Skills:');
const skillsDir = join(PLUGIN, 'skills');
let skillCount = 0;
for (const name of readdirSync(skillsDir)) {
  const dir = join(skillsDir, name);
  if (!statSync(dir).isDirectory() || name === '_shared') continue;
  const sk = join(dir, 'SKILL.md');
  if (!existsSync(sk)) { err(`skill ${name}: missing SKILL.md`); continue; }
  const fm = frontmatter(sk);
  if (!fm) { err(`skill ${name}: no frontmatter`); continue; }
  if (!fm.description) err(`skill ${name}: missing description`);
  if (fm.description && fm.description.length < 30) warn(`skill ${name}: thin description`);
  skillCount++;
}
console.log(`  -> ${skillCount} skills`);

for (const [kind, req] of [['agents', ['description', 'model']], ['commands', ['description']]]) {
  console.log(kind[0].toUpperCase() + kind.slice(1) + ':');
  const d = join(PLUGIN, kind);
  let n = 0;
  if (existsSync(d)) for (const f of readdirSync(d)) {
    if (!f.endsWith('.md')) continue;
    const fm = frontmatter(join(d, f));
    if (!fm) { err(`${kind}/${f}: no frontmatter`); continue; }
    for (const r of req) if (!fm[r]) err(`${kind}/${f}: missing ${r}`);
    n++;
  }
  console.log(`  -> ${n} ${kind}`);
}

console.log(`\n${errors ? '✗' : '✓'} ${errors} errors, ${warns} warnings`);
process.exit(errors ? 1 : 0);
