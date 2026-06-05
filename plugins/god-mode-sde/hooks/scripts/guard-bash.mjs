// PreToolUse(Bash): hard-block dangerous shell commands. OWASP/ops hygiene.
import { readStdin, hardBlock } from './_lib.mjs';

const inp = await readStdin();
const cmd = String(inp?.tool_input?.command ?? '');
if (!cmd.trim()) process.exit(0);

const findings = [];
const add = (r) => findings.push(r);

// rm -rf on dangerous targets (/, ~, $HOME, *) or --no-preserve-root
const recursiveForce =
  /\brm\s+-[a-z]*r[a-z]*f[a-z]*\b/i.test(cmd) ||
  /\brm\s+-[a-z]*f[a-z]*r[a-z]*\b/i.test(cmd) ||
  (/\brm\b[^\n]*\s-[a-z]*r/i.test(cmd) && /\brm\b[^\n]*\s-[a-z]*f/i.test(cmd));
const dangerTarget = /(?:^|\s)(?:\/(?:\s|$)|~(?:\/|\s|$)|\$HOME\b|\*(?:\s|$)|\/\*)/.test(cmd);
if (/--no-preserve-root/.test(cmd) || (recursiveForce && dangerTarget))
  add('Destructive recursive force-delete (rm -rf) on a root/home/glob target');

// disk wipe / raw device write
if (/\bmkfs(?:\.\w+)?\b/.test(cmd) || /\bdd\b[^\n]*\bof=\/dev\/(?:sd|nvme|disk|hd|mmcblk)/.test(cmd))
  add('Direct disk format/overwrite (mkfs / dd of=/dev/...)');

// fork bomb
if (/:\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;?\s*:/.test(cmd) || /\(\)\s*\{\s*:\|:&\s*\}/.test(cmd))
  add('Fork bomb');

// remote code execution: pipe download to a shell / interpreter
if (/(?:curl|wget)\b[^\n|]*\|\s*(?:sudo\s+)?(?:ba|z|d|k|a)?sh\b/i.test(cmd))
  add('Piping a remote download straight into a shell (curl|bash)');
if (/\b(?:iwr|irm|curl|invoke-webrequest|invoke-restmethod)\b[^\n|]*\|\s*(?:iex|invoke-expression)\b/i.test(cmd))
  add('Piping a remote download into Invoke-Expression (iwr|iex)');
if (/\bbase64\s+(?:-d|--decode|-D)\b[^\n|]*\|\s*(?:ba)?sh\b/i.test(cmd))
  add('Decoding base64 and piping into a shell');

// world-writable perms
if (/\bchmod\s+(?:-R\s+)?0?777\b/.test(cmd)) add('chmod 777 (world-writable permissions)');

// force-push to a protected branch
if (/\bgit\s+push\b[^\n]*(?:--force(?!-with-lease)\b|\s-f\b)[^\n]*\b(?:main|master|production|release)\b/.test(cmd) ||
    /\bgit\s+push\b[^\n]*\b(?:main|master|production|release)\b[^\n]*(?:--force(?!-with-lease)\b|\s-f\b)/.test(cmd))
  add('Force-push to a protected branch (main/master/production)');

// disabling TLS / certificate verification
if (/NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*0/.test(cmd) ||
    /\bcurl\b[^\n]*\s(?:-k|--insecure)\b/.test(cmd) ||
    /git\s+-c\s+http\.sslVerify=false/.test(cmd) ||
    /\bGIT_SSL_NO_VERIFY\s*=/.test(cmd) ||
    /sslVerify\s*=\s*false/i.test(cmd))
  add('Disabling TLS/certificate verification');

// secret exfiltration: reads sensitive credential file AND has network egress
const sensitive = /(?:~\/\.ssh\/|\/\.ssh\/id_|\.aws\/credentials|(?:^|\s|\/)\.env\b|\.netrc\b|\bid_rsa\b|\.kube\/config|\.npmrc\b)/;
const egress = /\b(?:curl|wget|nc|ncat|netcat|scp|sftp|ftp|telnet|Invoke-WebRequest|Invoke-RestMethod)\b/i;
if (sensitive.test(cmd) && egress.test(cmd))
  add('Possible secret exfiltration (reads credentials AND sends them over the network)');

if (findings.length)
  hardBlock('PreToolUse', `God-Mode SDE blocked a dangerous shell command:\n- ${findings.join('\n- ')}\n\nIf this is genuinely required, run it yourself, or set GODMODE_GUARDRAILS=advisory to downgrade blocks to warnings.`);

process.exit(0);
