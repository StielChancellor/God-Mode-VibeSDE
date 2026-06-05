---
name: secure-coding
description: Apply OWASP-grounded secure coding when writing or reviewing backend, frontend, API, data, or infrastructure code, handling auth/secrets/user input, or doing a security pass. Use whenever code touches authentication, authorization, secrets, databases, file/network I/O, deserialization, or external input — and during the security-engineer QA lens and /ship-check.
allowed-tools: Read, Grep, Glob, Bash
---

# Secure Coding (OWASP)

Security is a default, not a phase. This skill backs the `security-engineer` agent, the
Stage-7 security QA lens, and `/ship-check`. The runtime guardrail hooks
(`guard-bash`, `guard-write`) enforce the hardest rules automatically; this skill is the
judgment layer.

## Fits in the pipeline
Continuous. Explicit gates at Stage 3 (threat model in the blueprint), Stage 6 (secure
implementation), Stage 7 (security QA lens), Stage 8 (`/ship-check`). Honors
god-mode-principles #7 (security by default). User > skills > default.

## OWASP Top 10 (2021) — what to enforce
- **A01 Broken Access Control** — deny by default; enforce authz on EVERY request server-side
  (never trust the client/UI); check object ownership (no IDOR); no privilege escalation paths.
- **A02 Cryptographic Failures** — TLS everywhere; encrypt sensitive data at rest; strong,
  current algorithms (Argon2/bcrypt/scrypt for passwords, AES-GCM, SHA-256+); never roll your
  own crypto; no secrets in code (hooks block this).
- **A03 Injection** — parameterized queries / prepared statements ONLY; never concatenate or
  interpolate untrusted input into SQL, shell, HTML, LDAP, or templates; encode output per
  context; avoid `eval`/dynamic code (hooks warn).
- **A04 Insecure Design** — threat-model in the blueprint (STRIDE); secure defaults; rate
  limits; abuse cases; fail safely (closed).
- **A05 Security Misconfiguration** — harden defaults; remove debug/sample/admin; least
  privilege; security headers (CSP, HSTS, X-Content-Type-Options, frame-ancestors).
- **A06 Vulnerable & Outdated Components** — pin & lock dependencies; run SCA (npm/pip/govuln
  audit); track CVEs; remove unused deps; never run untrusted package install scripts.
- **A07 Identification & Auth Failures** — strong session management (HttpOnly, Secure,
  SameSite cookies); MFA where appropriate; lockout/throttle; no default creds; rotate secrets.
- **A08 Software & Data Integrity Failures** — verify integrity of dependencies & CI artifacts;
  no insecure deserialization (`pickle`/`yaml.load`/Java native — hooks warn); sign releases.
- **A09 Logging & Monitoring Failures** — log security events; NEVER log secrets/PII/tokens;
  alert on anomalies; keep an audit trail.
- **A10 SSRF** — validate/allowlist outbound URLs; block private/loopback/metadata IPs
  (169.254.169.254, 10/8, 127/8); no user-controlled fetch without validation.

## OWASP Secure Coding Practices — checklist
- **Input validation:** validate at every trust boundary (type, length, range, format);
  allowlist over denylist; reject, don't sanitize-and-hope.
- **Output encoding:** context-aware (HTML, attribute, JS, URL, SQL) to prevent XSS/injection.
- **AuthN/Z:** centralize; enforce server-side; least privilege; re-check on every action.
- **Session mgmt:** secure cookies, rotation on login, idle/absolute timeouts, invalidate on logout.
- **Crypto:** vetted libraries; manage keys via a secret manager/KMS; encrypt in transit & at rest.
- **Error handling/logging:** generic errors to users, detailed server-side; no stack traces or
  secrets leaked; structured, tamper-evident logs without sensitive data.
- **Data protection:** classify data; minimize collection; mask/redact PII; secure deletion.
- **Comms:** TLS 1.2+; verify certs (never disable — hooks block); HSTS.
- **Config:** secure defaults; secrets from env/secret manager; separate per-environment config.

## Supply chain
- Lockfiles committed and pinned; verify checksums/provenance; prefer minimal, well-maintained
  deps; audit transitive deps; treat install scripts from untrusted packages as hostile;
  scan ingested third-party content with `/ingest-scan` before adopting it.

## Secrets — absolute rules
- No secrets in code, commits, logs, error messages, or client bundles. Env vars / secret
  manager only. The `guard-write` hook hard-blocks known secret patterns; do not work around it.

## How to run a security pass
1. Map trust boundaries and data flows; identify where untrusted input enters.
2. Walk the Top-10 against the change; check authz on every new endpoint/action.
3. Grep for sinks (`eval`, `exec`, shell=True, string-built SQL, innerHTML, deserialization).
4. Confirm secrets handling, TLS, headers, logging-without-PII, dependency posture.
5. Produce findings with severity + concrete fix; REJECT if a critical issue is unresolved.
