---
title: "feat: M2 Phase 1 — Foundation (Config Injection + Audit Log + Meeting Cross-Link)"
date: 2026-06-22
type: feat
status: ready
target_repos:
  - SISTEM-MESYUARAT-DPMM-JOHOR
  - SISTEM-AHLI-DPMM-JOHOR
origin: C:\Users\DELL\.windsurf\plans\dpmm-johor-meeting-integration-report-8a6723.md (Phase 1)
---

# feat: M2 Phase 1 — Foundation

**Target repos:** `SISTEM-MESYUARAT-DPMM-JOHOR` (primary), `SISTEM-AHLI-DPMM-JOHOR` (secondary)

---

## Summary

SISTEM-MESYUARAT currently ships with `YOUR_SUPABASE_KEY_HERE` hardcoded — the live GitHub Pages site cannot query Supabase at all. Neither system records an audit trail. SISTEM-AHLI has no visibility into meetings. This plan fixes all three in the smallest safe steps before Phase 2 (document-meeting linkage) can begin.

---

## Problem Frame

| Problem | Impact |
|---|---|
| SISTEM-MESYUARAT has placeholder keys in `index.html` | Live site broken — login fails, no data loads |
| No `DPMM_AUDIT_LOG` table | No accountability — who changed what attendance record? |
| SISTEM-AHLI has zero awareness of meetings | Admins must switch manually, no shared context |
| No cross-navigation between apps | Feels like two unrelated tools |

---

## Scope

**In scope:**
- Config injection for SISTEM-MESYUARAT (anon-key fallback + `config-local.js` + GitHub Actions)
- `DPMM_AUDIT_LOG` SQL migration + `logAudit()` helper wired into SISTEM-MESYUARAT operations
- "Mesyuarat" sub-tab in SISTEM-AHLI that reads `DPMM_MESYUARAT` table
- Cross-navigation links in both apps

**Out of scope (Phase 2+):**
- Jana Notis / Jana Minit / DPMM_JEMPUTAN
- Bcrypt password hashing / JWT auth (M3)
- RLS hardening beyond existing policies
- DPMM_MESYUARAT_AGENDA table

---

## Requirements

- R1: SISTEM-MESYUARAT live site successfully loads data from Supabase after push to `main`
- R2: `GROQ_KEY` for SISTEM-MESYUARAT Aiman widget injected via GitHub Secret (not committed)
- R3: Every login, meeting create/delete, attendance update, and blast queue save writes a row to `DPMM_AUDIT_LOG`
- R4: SISTEM-AHLI shows a list of meetings from `DPMM_MESYUARAT` without a full page reload
- R5: Both apps surface a one-click link to the other system

---

## Key Technical Decisions

**KTD1 — Anon key fallback in SISTEM-MESYUARAT**
Same as SISTEM-AHLI: hardcode the Supabase anon key as a fallback in `index.html`. The anon key is designed to be public (JWT with `role: anon`, no service privileges). `GROQ_KEY` has no fallback — it stays empty unless injected.

**KTD2 — GitHub Actions `sed` injection for GROQ_KEY**
SISTEM-MESYUARAT will get a `.github/workflows/deploy.yml` that uses `sed` to replace `YOUR_GROQ_KEY_HERE` in `index.html` with the `GROQ_KEY` GitHub Secret before deploying to GitHub Pages. This mirrors the intent of the SISTEM-AHLI pattern.

**KTD3 — logAudit() is fire-and-forget**
Audit log writes use `await db.from('DPMM_AUDIT_LOG').insert(...)` but failures are caught and silenced — a failed audit write must never block a user action.

**KTD4 — Meeting sub-tab goes under the existing Dokumen tab in SISTEM-AHLI**
Adding a new top-level nav tab would require touching the nav, tab state machine, and mobile layout. Placing it as a sub-tab under Dokumen (alongside the existing document categories) is the smallest change and keeps the nav clean.

---

## Implementation Units

### U1. Config Injection — SISTEM-MESYUARAT

**Goal:** Fix the live site so it can actually talk to Supabase and protect GROQ_KEY via GitHub Secrets.

**Requirements:** R1, R2

**Dependencies:** none

**Files:**
- `SISTEM-MESYUARAT-DPMM-JOHOR/index.html` — replace hardcoded placeholder vars with CONFIG pattern + anon key fallback
- `SISTEM-MESYUARAT-DPMM-JOHOR/config-local.js` — new, gitignored (GROQ_KEY + SUPABASE_KEY for local dev)
- `SISTEM-MESYUARAT-DPMM-JOHOR/config-local.example.js` — new, committed (safe template)
- `SISTEM-MESYUARAT-DPMM-JOHOR/.gitignore` — add `config-local.js`
- `SISTEM-MESYUARAT-DPMM-JOHOR/.github/workflows/deploy.yml` — new, GitHub Actions Pages deploy with secret injection

**Approach:**
1. In `index.html`, load `config-local.js` via `<script src="config-local.js"></script>` in `<head>` (before the main script block — same position as SISTEM-AHLI).
2. Replace the three config consts at line ~893:
   ```
   SUPABASE_KEY = CONFIG?.SUPABASE_KEY (non-placeholder) || <hardcoded anon key>
   GROQ_KEY     = CONFIG?.GROQ_KEY (non-placeholder) || ''
   GOOGLE_CID   = CONFIG?.GOOGLE_CID || 'YOUR_GOOGLE_CID_HERE'
   ```
3. `config-local.example.js` exports a `CONFIG` object with `YOUR_*_HERE` placeholders (committed, safe to view).
4. `deploy.yml`: checkout → set up Pages → `sed -i 's/YOUR_GROQ_KEY_HERE/${{ secrets.GROQ_KEY }}/g' index.html` → upload artifact → deploy Pages. Triggers on push to `main`.

**Patterns to follow:** `SISTEM-AHLI-DPMM-JOHOR/index.html` lines 2131–2142 for the CONFIG pattern.

**Test scenarios:**
- Local: `config-local.js` present with real GROQ_KEY → `GROQ_KEY` var is set; Aiman responds
- Local: `config-local.js` absent → `GROQ_KEY` is empty; Supabase still loads (anon key fallback)
- Live (after push): open DevTools on GitHub Pages site, confirm `db` is functional (a `loadMembers()` call succeeds) and `GROQ_KEY` is set (length > 20)
- Confirm `config-local.js` does NOT appear in git log after commit

**Verification:** GitHub Pages site loads meeting list without network errors; `GROQ_KEY` is truthy in browser console.

---

### U2. DPMM_AUDIT_LOG — Table Migration + logAudit() Helper

**Goal:** Every write operation in SISTEM-MESYUARAT records who did what and when.

**Requirements:** R3

**Dependencies:** none (SQL migration is independent)

**Files:**
- `SISTEM-MESYUARAT-DPMM-JOHOR/migrations/2026_06_22_audit_log.sql` — new migration file
- `SISTEM-MESYUARAT-DPMM-JOHOR/index.html` — add `logAudit()` helper + wire into 5 call sites

**Approach:**

*Migration:*
```sql
CREATE TABLE IF NOT EXISTS DPMM_AUDIT_LOG (
  id          BIGSERIAL PRIMARY KEY,
  tindakan    TEXT NOT NULL,
  jadual      TEXT NOT NULL,
  rekod_id    TEXT,
  pengguna    TEXT,
  butiran     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE DPMM_AUDIT_LOG ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon insert audit" ON DPMM_AUDIT_LOG FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read audit"  ON DPMM_AUDIT_LOG FOR SELECT USING (true);
```

*Helper (add near `logSend` function in index.html):*
```
async function logAudit(tindakan, jadual, rekodId, butiran) {
  try {
    await db.from('DPMM_AUDIT_LOG').insert({
      tindakan, jadual, rekod_id: rekodId || null,
      pengguna: user?.user_id || 'anon',
      butiran: butiran || null
    });
  } catch(e) { console.warn('logAudit failed (non-blocking):', e); }
}
```

*Wire into:*
1. `doLogin()` — after successful login: `logAudit('LOGIN', 'DPMM_USERS', user.user_id)`
2. `saveMeeting()` / meeting create path — `logAudit('CIPTA_MESYUARAT', 'DPMM_MESYUARAT', meetId)`
3. `deleteMeeting()` — `logAudit('PADAM_MESYUARAT', 'DPMM_MESYUARAT', meetId)`
4. `applyBulkStatus()` — `logAudit('KEMASKINI_KEHADIRAN_BULK', 'DPMM_KEHADIRAN', meeting.mesyuarat_id, {count: keys.length, status: s})`
5. `saveBlastQueue()` — `logAudit('SIMPAN_BLAST_QUEUE', 'DPMM_BLAST_QUEUE', meeting.mesyuarat_id, {count: records.length})`

**Test scenarios:**
- After login: `DPMM_AUDIT_LOG` gains a `LOGIN` row for that `user_id`
- After bulk attendance update: row with `tindakan = 'KEMASKINI_KEHADIRAN_BULK'` and correct `butiran.count`
- If Supabase is unreachable during audit write: the primary action still completes (fire-and-forget)
- Confirm RLS: anonymous SELECT returns rows (both apps can read audit log)

**Verification:** Run the migration in Supabase SQL Editor; perform a login + attendance update; query `SELECT * FROM DPMM_AUDIT_LOG ORDER BY created_at DESC LIMIT 5` and confirm rows appear.

---

### U3. Meeting Sub-Tab in SISTEM-AHLI

**Goal:** Admins in SISTEM-AHLI can see the full meeting list and jump to SISTEM-MESYUARAT.

**Requirements:** R4, R5

**Dependencies:** U1 (DPMM_MESYUARAT exists in shared Supabase; U1 ensures SISTEM-MESYUARAT is functional, but U3 only reads — can proceed independently)

**Files:**
- `SISTEM-AHLI-DPMM-JOHOR/index.html` — add "Mesyuarat" sub-tab UI + `loadMesyuarat()` JS function

**Approach:**
1. Under the Dokumen tab, add a new sub-tab button "🗓️ Mesyuarat" alongside existing sub-tabs (Semua Dokumen, Baru, etc.).
2. The sub-tab panel shows a simple table: Mesyuarat ID | Nama | Tarikh | Tempat | Status | Link.
3. Each row has a "Buka →" button linking to `https://dpmmjohor.github.io/SISTEM-MESYUARAT-DPMM-JOHOR/` (opens in new tab).
4. `loadMesyuarat()` queries `DPMM_MESYUARAT` table via the existing `supabaseClient`, ordered by `tarikh DESC`, limit 20.
5. Called on sub-tab click (lazy load — not on page boot).
6. Wire `logAudit('LIHAT_MESYUARAT', 'DPMM_MESYUARAT', null)` on sub-tab open — reuse the same `logAudit()` from U2, added to SISTEM-AHLI as well.

**Directional design sketch:**
```
[ Semua Dokumen ] [ Baru ] [ 🗓️ Mesyuarat ]   ← sub-tabs
─────────────────────────────────────────────
ID       Nama          Tarikh      Tempat    Status    
MSY-001  Mesyuarat AGM  22 Jun 2026  Dewan...  AKTIF   [Buka →]
MSY-002  Mesyuarat AJK  15 Mei 2026  Bilik...  SELESAI [Buka →]
─────────────────────────────────────────────
                        [ + Buka Sistem Mesyuarat ]
```

**Patterns to follow:** The existing Dokumen sub-tab switching in `index.html` (look for `showDokSub()` or equivalent function); the `loadMesyuarat()` function pattern mirrors `loadDokumen()`.

**Test scenarios:**
- Click "Mesyuarat" sub-tab → spinner shows → table renders with data from `DPMM_MESYUARAT`
- "Buka →" link opens SISTEM-MESYUARAT in a new tab
- If `DPMM_MESYUARAT` is empty: show "Tiada mesyuarat dijumpai" empty state
- Non-admin users: sub-tab still visible (read-only is fine); or hide via `admin-only` class if preferred

**Verification:** In SISTEM-AHLI browser, navigate to Dokumen → Mesyuarat sub-tab; confirm meeting rows load; confirm cross-link opens correct URL.

---

### U4. Cross-Navigation Links

**Goal:** One-click navigation between both apps in both directions.

**Requirements:** R5

**Dependencies:** U3 (establishes the URL pattern)

**Files:**
- `SISTEM-MESYUARAT-DPMM-JOHOR/index.html` — add "← Sistem Ahli" link in header
- `SISTEM-AHLI-DPMM-JOHOR/index.html` — add "Sistem Mesyuarat →" link in sidebar nav

**Approach:**
1. **SISTEM-MESYUARAT header** — add a small `<a>` link styled as a secondary button in the top header bar: `← Sistem Ahli` → `https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/`. Target `_blank`. Visible to all roles.
2. **SISTEM-AHLI sidebar** — add a nav entry at the bottom of the nav list: `🗓️ Sistem Mesyuarat` → `https://dpmmjohor.github.io/SISTEM-MESYUARAT-DPMM-JOHOR/`. Target `_blank`. Match existing nav item style.

**Test scenarios:**
- Click "← Sistem Ahli" in SISTEM-MESYUARAT → new tab opens correct URL
- Click "Sistem Mesyuarat" in SISTEM-AHLI nav → new tab opens correct URL
- Links are visible at all role levels (admin, ajk, staff)

**Verification:** Visual check in browser; confirm both URLs resolve to working deployed sites.

---

## Open Questions

- **Q1 (deferred to M3):** Should `doLogin()` in SISTEM-MESYUARAT eventually verify a bcrypt hash instead of plaintext? Yes — tracked as M3. For now, the `logAudit('LOGIN', ...)` call in U2 at least creates an audit trail.
- **Q2 (implementation-time):** What is the exact function name for Dokumen sub-tab switching in SISTEM-AHLI? Implementer should locate it by searching for `showDokSub` or the tab element with `id="tab-dok"`.

---

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GitHub Actions `sed` fails to inject key (typo in secret name) | Low | Medium | Test by checking `GROQ_KEY.length` in console after deploy |
| `DPMM_AUDIT_LOG` migration fails if run twice | Low | Low | SQL uses `CREATE TABLE IF NOT EXISTS` — safe to re-run |
| `loadMesyuarat()` CORS issue reading across apps | Low | Low | Both apps read the same Supabase project — no CORS issue |
| logAudit RLS blocks insert from anon role | Medium | Low | Policy explicitly uses `WITH CHECK (true)` for INSERT |

---

## Execution Order

U1 and U2 are independent — can be done in parallel.
U3 depends on the shared Supabase table being readable (it always was — independent of U1).
U4 depends on U3 being done (to confirm the cross-link URLs).

Recommended order: **U2 SQL migration first** (manual, 5 min), then **U1 + U3 in parallel** (code), then **U4** (small addition to both files after U1/U3).

---

*Plan written: June 22, 2026 — M2 Phase 1 of dpmm-johor-meeting-integration-report-8a6723.md*
