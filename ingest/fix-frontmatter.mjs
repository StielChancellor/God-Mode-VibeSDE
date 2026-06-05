// One-shot fixer: if a SKILL.md starts with an HTML comment before its YAML frontmatter,
// move the comment to directly after the frontmatter so `---` is on line 1.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(ROOT, 'plugins', 'god-mode-sde', 'skills');
const re = /^(﻿?\s*)(<!--[\s\S]*?-->)\s*\r?\n+(---\r?\n[\s\S]*?\r?\n---)([\s\S]*)$/;
let fixed = 0;
for (const name of readdirSync(skillsDir)) {
  const dir = join(skillsDir, name);
  if (!statSync(dir).isDirectory()) continue;
  const sk = join(dir, 'SKILL.md');
  if (!existsSync(sk)) continue;
  const t = readFileSync(sk, 'utf8');
  const m = t.match(re);
  if (m) {
    writeFileSync(sk, `${m[3]}\n${m[2]}${m[4]}`, 'utf8');
    console.log('fixed', name);
    fixed++;
  }
}
console.log(`\n${fixed} files fixed`);
