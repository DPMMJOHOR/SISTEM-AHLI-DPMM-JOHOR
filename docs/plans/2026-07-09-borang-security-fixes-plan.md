---
goal: Remediate XSS, HTML-injection, PII-storage, and CSP findings in borang.html
version: 1.0
date_created: 2026-07-09
last_updated: 2026-07-09
owner: DPMM Johor Development Team
status: 'Completed'
completion_date: 2026-07-09
tags: ['security', 'xss', 'csp', 'pii', 'bugfix', 'borang']
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-green)

This plan remediates the findings from the 2026-07-09 security audit of `borang.html`: 1 HIGH (HTML injection into admin emails), 4 MEDIUM (two DOM-XSS sinks, unencrypted PII in localStorage, permissive CSP), and 2 LOW (client-side Groq key design, third-party IP lookup). Fixes are minimal and behavior-preserving. The central remediation is a single reusable `escapeHtml()` helper applied to every unescaped user-input interpolation, which closes the HIGH finding and both DOM-XSS MEDIUMs at once.

## 1. Requirements & Constraints

- **REQ-001**: All user-supplied field values must be HTML-escaped before insertion into any `innerHTML` sink or HTML email body
- **REQ-002**: Uploaded file names must be neutralized of HTML metacharacters before display
- **REQ-003**: Behavior and layout of the form must not visibly change for legitimate (non-malicious) input
- **SEC-001**: No secret/API key (Groq, Resend, Turnstile secret) may be embedded in the client bundle
- **SEC-002**: PDPA-sensitive PII (IC number, name, address, email) must not persist indefinitely in browser storage
- **SEC-003**: Content-Security-Policy must not weaken XSS defenses more than necessary for static hosting
- **CON-001**: `borang.html` is a single static file on GitHub Pages — no server-side rendering/escaping available
- **CON-002**: Existing unit tests (`npm test`) and E2E tests (`tests/e2e/test_borang.py`) must remain green
- **GUD-001**: Prefer `textContent` over `innerHTML` where markup is not required
- **PAT-001**: Centralize escaping in one `escapeHtml()` helper; do not scatter ad-hoc replacements

## 2. Implementation Steps

### Implementation Phase 1: Add escaping helper and fix DOM-XSS + HTML injection (HIGH-1, MEDIUM-1, MEDIUM-2)

- GOAL-001: Eliminate all unescaped user-input interpolation into HTML sinks and email bodies

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Add `escapeHtml(str)` helper in `borang.html` script scope: returns `''` for null/undefined; replaces `&`→`&amp;`, `<`→`&lt;`, `>`→`&gt;`, `"`→`&quot;`, `'`→`&#39;` (escape `&` first) | | |
| TASK-002 | Fix MEDIUM-1: at `borang.html` renderRingkasan (line ~3921) change ``div.innerHTML = `<h5>${k}</h5><p>${v || '—'}</p>`;`` to escape `v` (use `escapeHtml(v) || '—'`); keys `k` are static literals and need no escaping | | |
| TASK-003 | Fix MEDIUM-2: in `sanitizeFileName` (line ~3807) add `sanitized = sanitized.replace(/[<>"'&]/g, '_');` so filenames are HTML-safe before the innerHTML at line ~3797 | | |
| TASK-004 | Fix HIGH-1: wrap every `${val('...')}` inside the admin email template (lines ~4238-4247) with `escapeHtml(...)` | | |
| TASK-005 | Fix HIGH-1: wrap every `${val('...')}` inside the applicant email template (lines ~4276-4281) with `escapeHtml(...)` | | |
| TASK-006 | Audit remaining `innerHTML` sinks (lines ~3098, ~3678, ~3715, ~5384, ~5501) and confirm they interpolate only static/internal data (DOC_LABELS, d.label, fileName). Escape `fileName` at line ~5502 with `escapeHtml(fileName)` | | |

### Implementation Phase 2: Harden Content-Security-Policy (MEDIUM-4)

- GOAL-002: Reduce CSP attack surface without breaking the static page

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Assess feasibility of removing `'unsafe-inline'` from `script-src` in the CSP meta (`borang.html` line 8). Inventory inline `<script>` blocks and inline event handlers (`onclick=`, `onchange=`) | | |
| TASK-008 | If full removal is too invasive for this pass, document the decision and at minimum remove `'unsafe-inline'` from `style-src` if no inline styles block it; record residual risk | | |
| TASK-009 | Verify page still functions (form flow, chatbot toggle) after any CSP change via E2E test | | |

### Implementation Phase 3: Reduce PII persistence (MEDIUM-3)

- GOAL-003: Limit sensitive data lifetime in browser storage

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-010 | In `saveDraft()` (line ~4738) exclude high-sensitivity fields from the draft OR add a stored `timestamp`-based TTL (e.g. 24h) checked in `loadDraft()` (line ~4741) that purges expired drafts | | |
| TASK-011 | Call `clearDraft()` on successful submission (after `showSuccess`) so PII is not left in `localStorage` post-submit | | |
| TASK-012 | Add a one-line notice near the resume prompt informing users a local draft is stored on this device | | |

### Implementation Phase 4: Note client-side key & privacy items (LOW-1, LOW-2)

- GOAL-004: Document/guard the remaining lower-severity items

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | Add a code comment above the Groq `fetch` calls (lines ~5135, ~5559) stating the key MUST come from a backend proxy and must never be embedded in the deployed client | | |
| TASK-014 | Confirm chatbot/Isi-Pintar degrade gracefully when `GROQ_KEY` is null (no uncaught errors); add fallback message if missing | | |
| TASK-015 | Document the `api.ipify.org` IP lookup (line ~3983) in the privacy notice / audit log rationale | | |

### Implementation Phase 5: Verify and deploy

- GOAL-005: Prove fixes work and ship safely

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-016 | Extend `tests/e2e/test_borang.py` with XSS regression checks: set `nama_entiti` and a filename to `<img src=x onerror=window.__xss=1>`, render summary/upload, assert `window.__xss` is undefined and payload appears escaped | | |
| TASK-017 | Run `npm test` (expect 12/12) and `python tests/e2e/test_borang.py` (expect all pass incl. new XSS checks) | | |
| TASK-018 | Verify no console errors on a local server run | | |
| TASK-019 | Commit, push to `main`, confirm Pages deploy success, and re-verify live console shows 0 errors | | |

## 3. Alternatives

- **ALT-001**: Use DOMPurify library for sanitization (rejected — adds an external dependency/CDN for a single-file static form; a small `escapeHtml()` covers all identified sinks)
- **ALT-002**: Switch every `innerHTML` to DOM construction with `textContent` (partially adopted for MEDIUM-1; full rewrite rejected as high-churn for low marginal benefit)
- **ALT-003**: Encrypt the localStorage draft (rejected — client-side encryption without a server key offers little real protection; TTL + purge-on-submit is more effective)
- **ALT-004**: Nonce-based CSP (deferred — requires server-generated nonce, unavailable on static hosting; `applyCspNonce()` already exists for a future backend)

## 4. Dependencies

- **DEP-001**: No new runtime dependencies (pure vanilla JS helper)
- **DEP-002**: Existing test tooling — vitest (`npm test`) and Python Playwright (`tests/e2e/test_borang.py`)
- **DEP-003**: GitHub Pages deploy workflow (`.github/workflows/deploy.yml`) — no changes required
- **DEP-004**: Backend Groq proxy (out of scope; referenced by LOW-1 only)

## 5. Files

- **FILE-001**: `borang.html` — add `escapeHtml()`; patch summary sink, filename sanitizer, both email templates, SSM checklist filename; CSP meta; draft TTL/purge; Groq comments
- **FILE-002**: `tests/e2e/test_borang.py` — add XSS regression assertions
- **FILE-003**: `src/config-loader.js` — no functional change (already keeps secret keys empty); reference only for SEC-001 verification

## 6. Testing

- **TEST-001**: XSS regression — malicious `nama_entiti` value renders escaped in Step 7 summary; no script execution
- **TEST-002**: XSS regression — malicious uploaded filename renders escaped in upload status; no script execution
- **TEST-003**: HTML-injection — `escapeHtml()` unit behavior verified for `& < > " '` and null input
- **TEST-004**: Regression — full form flow, validation, and config still pass (existing 25 E2E + 12 unit)
- **TEST-005**: PII — after successful submit, `localStorage['dpmm_borang_draft']` is cleared; expired draft is purged on load
- **TEST-006**: No console errors locally and on the live site after deploy

## 7. Risks & Assumptions

- **RISK-001**: Over-escaping could double-encode values already displayed elsewhere — mitigate by escaping only at HTML sinks, not at data capture
- **RISK-002**: Removing `'unsafe-inline'` from CSP may break inline handlers — mitigate by phased assessment (TASK-007) and E2E verification before shipping
- **RISK-003**: Excluding fields from draft may reduce resume convenience — mitigate by TTL+purge approach instead of full exclusion where possible
- **ASSUMPTION-001**: `/api/send-email` renders the provided `html` as-is (so client-side escaping is the correct control point)
- **ASSUMPTION-002**: Supabase RLS is enforced (covered by a separate audit; not in this plan's scope)
- **ASSUMPTION-003**: No other page consumes the same fields via `innerHTML` in a way that re-introduces XSS (SISTEM-MESYUARAT / admin portal to be audited separately)

## 8. Related Specifications / Further Reading

- Audit source: security-review of `borang.html` (2026-07-09, this session)
- Prior fix plan: `docs/plans/2026-07-09-fix-deployment-secrets-plan.md`
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP DOM-based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Malaysia PDPA 2010 overview](https://www.pdp.gov.my/)
