// Shared prompt-injection marker detection for recipe name/trigger — imported by BOTH the SessionStart
// recipe index (session-start.mjs) and recipe-lint.mjs, so the two can never drift. BEST-EFFORT, not
// proof: it strips zero-width/bidi, folds common Cyrillic homoglyphs, lowercases, and squashes to
// letters+digits, then matches injection-phrase STEMS — defeating zero-width / spacing / punctuation /
// homoglyph splitting of those phrases. The REAL boundary is the safe-charset sanitization + the
// UNTRUSTED framing + human review (see skills/recipes/SKILL.md §Safety). Tune STEMS conservatively:
// a false positive only drops a recipe from the index / fails its lint (annoying, not dangerous).
//
// NOTE: implemented with numeric codepoint checks (no literal control/zero-width/Cyrillic chars in
// source) so the file stays pure ASCII and auditable.

// the ONLY characters allowed into the SessionStart banner (drops backtick, <, >, newline, non-ASCII).
export const SAFE_CHARSET = /[^A-Za-z0-9 ,.:/_-]/g;

// strip control (0x00-0x1f, 0x7f), zero-width + bidi marks (0x200b-0x200f), bidi embeddings/overrides
// (0x202a-0x202e), bidi isolates (0x2066-0x2069), and BOM (0xfeff) — by codepoint.
export function stripInvisible(s) {
  let out = '';
  for (const ch of String(s ?? '')) {
    const c = ch.codePointAt(0);
    if (c < 0x20 || c === 0x7f) continue;
    if (c >= 0x200b && c <= 0x200f) continue;
    if (c >= 0x202a && c <= 0x202e) continue;
    if (c >= 0x2066 && c <= 0x2069) continue;
    if (c === 0xfeff) continue;
    out += ch;
  }
  return out;
}

// common Cyrillic homoglyphs (codepoint -> ASCII twin) so a Cyrillic 'c' (0x0441) in "curl" folds to ASCII.
const HOMO = {
  0x0430: 'a', 0x0435: 'e', 0x043e: 'o', 0x0441: 'c', 0x0440: 'p', 0x0443: 'y',
  0x0445: 'x', 0x0455: 's', 0x0456: 'i', 0x0458: 'j', 0x0501: 'd', 0x043a: 'k',
  0x043c: 'm', 0x0432: 'b', 0x0442: 't', 0x043d: 'h',
};

// Fold + squash to a separator-free, lowercase, ASCII letters+digits form.
export function squash(s) {
  let out = '';
  for (const ch of stripInvisible(s).toLowerCase()) {
    const c = ch.codePointAt(0);
    if (HOMO[c]) { out += HOMO[c]; continue; }
    if (c >= 0x61 && c <= 0x7a) out += ch;       // a-z
    else if (c >= 0x30 && c <= 0x39) out += ch;  // 0-9
    // everything else (spaces, punctuation, unmapped non-ASCII incl. Cyrillic) is dropped
  }
  return out;
}

// Injection-phrase stems, matched against the squashed form (no separators between letters).
const STEMS = [
  'ignoreprevious', 'ignoreprior', 'ignoreallprevious', 'ignoreallprior', 'ignoreallinstruction',
  'ignoreguidelines', 'ignoreyourrules', 'ignoreabove',
  'disregardprevious', 'disregardprior', 'disregardall', 'disregardabove', 'disregardthe',
  'forgeteverything', 'forgetallprevious', 'forgetabove', 'forgetprior',
  'youarenow', 'overrideallrules', 'overrideyour', 'overridethe',
  'newinstruction', 'newinstructions', 'systemprompt', 'systemoverride', 'jailbreak',
  'alwaysrun', 'curlhttp', 'wgethttp', 'base64',
];
const RE = new RegExp(STEMS.join('|'));

// true if the value carries a prompt-injection marker after de-obfuscation.
export function looksInjected(value) { return RE.test(squash(value)); }
