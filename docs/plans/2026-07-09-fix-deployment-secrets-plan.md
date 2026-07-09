---
goal: Fix live borang.html configuration loading, Turnstile CAPTCHA, and Supabase connectivity on GitHub Pages
version: 2.0
date_created: 2026-07-09
last_updated: 2026-07-09
owner: DPMM Johor Development Team
status: 'Planned'
tags: ['deployment', 'bugfix', 'configuration', 'turnstile', 'static-hosting']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan fixes the live `borang.html` form on GitHub Pages. The form is broken by three code-level defects, NOT by missing secret injection. Root causes verified against the codebase:

1. **Config key-name casing mismatch.** `src/config-loader.js` writes `window.CONFIG.SUPABASE_URL` / `window.CONFIG.TURNSTILE_SITE_KEY` (UPPER_SNAKE), but `borang.html` reads `window.CONFIG.supabaseUrl` / `window.CONFIG.turnstileSiteKey` (camelCase). Values never resolve.
2. **`fetchConfig()` clobbers embedded config.** `config-loader.js` (loaded at head, line 17) already populates `window.CONFIG`. Then `fetchConfig()` (line 3256) calls `/api/config`, which 404s on static hosting, and sets `window.CONFIG = {}` — wiping the good config.
3. **Turnstile site key placeholder is hardcoded.** `borang.html:2725` renders `data-sitekey="YOUR_TURNSTILE_SITE_KEY"`, causing Cloudflare error 400020.

**Security note:** The Turnstile SITE key and Supabase ANON key are publishable and safe to embed in client code. `GROQ_KEY` and any Turnstile SECRET key are server-side only and MUST NOT be injected into the publicly served `borang.html`. This plan preserves the security posture of commit `e4eb8b4` (`GROQ_KEY = null` on the client).

## 1. Requirements & Constraints

- **REQ-001**: Turnstile CAPTCHA must render with a valid, publishable site key on the live site
- **REQ-002**: Configuration must resolve on GitHub Pages with no backend / no `/api/config` endpoint
- **REQ-003**: Supabase must connect using the publishable anon key already embedded in `config-loader.js`
- **REQ-004**: `borang.html` and `config-loader.js` must agree on config key names (single casing convention)
- **SEC-001**: `GROQ_KEY` and any Turnstile SECRET key MUST remain server-side only — never embedded in the public `borang.html`
- **SEC-002**: Only publishable keys (Turnstile SITE key, Supabase ANON key) may live in client code
- **SEC-003**: Preserve commit `e4eb8b4` posture — client-side `GROQ_KEY`/`SUPABASE_KEY` stay `null`
- **CON-001**: GitHub Pages is static hosting — no server-side API endpoints available
- **CON-002**: Config is embedded via `src/config-loader.js`; no runtime fetch is required
- **GUD-001**: Prefer the smallest upstream fix that resolves root cause; avoid new infrastructure
- **PAT-001**: Follow the existing `window.CONFIG` embedding pattern in `src/config-loader.js`

## 2. Implementation Steps

### Implementation Phase 1: Standardise config key names

- GOAL-001: Make `borang.html` read the exact keys `config-loader.js` writes

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Audit all `window.CONFIG.*` reads in `borang.html` (e.g. `supabaseUrl`, `turnstileSiteKey`) and list expected key names | | |
| TASK-002 | Decide single convention: keep camelCase reads in `borang.html`, add camelCase keys to `config-loader.js` `CONFIG` object | | |
| TASK-003 | In `src/config-loader.js`, expose camelCase aliases: `supabaseUrl`, `turnstileSiteKey`, `sentryDsn`, plus `features: { captcha: true }` used by `validateCaptcha()` | | |
| TASK-004 | Confirm `borang.html:2826` `window.CONFIG.supabaseUrl` and `initializeCaptcha()` `window.CONFIG.turnstileSiteKey` now resolve | | |

### Implementation Phase 2: Remove the failing `/api/config` fetch

- GOAL-002: Stop `fetchConfig()` from overwriting the embedded `window.CONFIG` on static hosting

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-005 | In `borang.html`, remove or guard the `await fetchConfig()` call at line ~3256 so it does not run on GitHub Pages | | |
| TASK-006 | If keeping `fetchConfig()` for local dev, wrap the `/api/config` call so a 404 leaves the existing `window.CONFIG` intact (do NOT set `window.CONFIG = {}`) | | |
| TASK-007 | Verify `initializeCaptcha()` still runs after config is available | | |

### Implementation Phase 3: Set the publishable Turnstile site key

- GOAL-003: Replace the hardcoded `YOUR_TURNSTILE_SITE_KEY` placeholder with a working site key

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-008 | Obtain the Turnstile SITE key from the Cloudflare dashboard (publishable — safe for client) | | |
| TASK-009 | Set `TURNSTILE_SITE_KEY` (and camelCase `turnstileSiteKey`) in `src/config-loader.js` | | |
| TASK-010 | Confirm `initializeCaptcha()` overrides `data-sitekey` on `.cf-turnstile` before the widget renders; if timing is an issue, set the key directly in the `borang.html:2725` markup | | |
| TASK-011 | Verify the Cloudflare Turnstile domain allowlist includes `dpmmjohor.github.io` | | |

### Implementation Phase 4: Add favicon

- GOAL-004: Remove the favicon 404

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-012 | Add `favicon.ico` (DPMM branding) to repository root | | |
| TASK-013 | Add `<link rel="icon" href="favicon.ico">` to the `borang.html` `<head>` | | |

### Implementation Phase 5: Deploy and verify

- GOAL-005: Deploy fixes and verify live functionality

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-014 | Run `npm test` locally to confirm no regressions | | |
| TASK-015 | Commit and push to `main` to trigger the existing deploy workflow | | |
| TASK-016 | Wait for GitHub Pages deployment to complete | | |
| TASK-017 | Load https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html and open DevTools console | | |
| TASK-018 | Verify: no `/api/config` error, Turnstile renders (no 400020), Supabase reachable, no favicon 404 | | |
| TASK-019 | Confirm browser network tab shows NO `GROQ_KEY` value in `borang.html` source (security check) | | |
| TASK-020 | Test form submission end-to-end | | |

## 3. Alternatives

- **ALT-001**: Inject keys via GitHub Actions `sed` into `borang.html` (REJECTED — `borang.html` is served publicly on Pages; would leak `GROQ_KEY`; 4 of 5 placeholders don't exist in the code)
- **ALT-002**: Deploy a backend API for `/api/config` (rejected — adds hosting cost/complexity; static hosting is sufficient for publishable keys)
- **ALT-003**: Cloudflare Worker as config proxy (deferred — only needed if a genuinely secret key must reach the client, which it should not)

## 4. Dependencies

- **DEP-001**: Cloudflare Turnstile SITE key (publishable) with `dpmmjohor.github.io` on the domain allowlist
- **DEP-002**: Supabase project URL + ANON key (already embedded in `config-loader.js`)
- **DEP-003**: Existing GitHub Pages deploy workflow (`.github/workflows/deploy.yml`) — no changes required
- **DEP-004**: Server-side handling for Groq (out of scope; keep `GROQ_KEY` off the client)

## 5. Files

- **FILE-001**: `src/config-loader.js` — add camelCase aliases + `features.captcha`; set Turnstile site key
- **FILE-002**: `borang.html` — remove/guard `fetchConfig()`; ensure config reads match; add favicon link
- **FILE-003**: `favicon.ico` — new site favicon (repository root)
- **FILE-004**: `.github/workflows/deploy.yml` — NO changes needed (plain checkout→deploy is correct)

## 6. Testing

- **TEST-001**: `npm test` passes (existing 12 validation tests, no regressions)
- **TEST-002**: Live console shows no `/api/config` fetch error
- **TEST-003**: Turnstile widget renders without error 400020
- **TEST-004**: Supabase query succeeds with the anon key
- **TEST-005**: `view-source` of live `borang.html` contains NO Groq/secret key value
- **TEST-006**: Form submission completes end-to-end
- **TEST-007**: No favicon 404 in the network tab

## 7. Risks & Assumptions

- **RISK-001**: Removing `fetchConfig()` could break a local-dev path that relies on `/api/config` — mitigate by guarding, not deleting (TASK-006)
- **RISK-002**: Turnstile site key may be domain-scoped; must allowlist `dpmmjohor.github.io` (TASK-011)
- **RISK-003**: Timing — widget may render before `initializeCaptcha()` runs; fallback is to hardcode the site key in markup (TASK-010)
- **RISK-004**: Other files may also read mismatched config key names — audit beyond `borang.html` if issues persist
- **ASSUMPTION-001**: The embedded Supabase anon key is current and RLS-protected
- **ASSUMPTION-002**: User has access to the Cloudflare Turnstile dashboard
- **ASSUMPTION-003**: Groq chatbot on the public form is either disabled or proxied server-side

## 8. Related Specifications / Further Reading

- [Cloudflare Turnstile — Client-side rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Supabase — API keys (anon vs service_role)](https://supabase.com/docs/guides/api/api-keys)
- [GitHub Pages Deployment Guide](https://docs.github.com/en/pages)
- Prior audit: `docs/audit/git-and-security-audit-2026-06-30.md`
- Security baseline: commit `e4eb8b4` (client keys set to `null`)
