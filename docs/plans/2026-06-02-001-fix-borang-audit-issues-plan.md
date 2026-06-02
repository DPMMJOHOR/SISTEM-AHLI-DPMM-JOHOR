# fix: Resolve All Audit Issues in borang.html (incl. IC Front/Back Upload)

**Created:** 2026-06-02  
**Status:** active  
**Depth:** Standard  
**Target file:** `borang.html`

---

## Problem Frame

A full-stack audit of `borang.html` found **4 critical bugs, 4 high-priority issues, 5 medium issues, 3 security gaps, and 4 low-priority improvements**. The most severe bug is that **IC (MyKad) document URLs are never saved to Supabase** because the payload uses the old key `ic_pemohon` while the upload system uses the new keys `ic_pemohon_depan` / `ic_pemohon_belakang`. Additionally, the UI never explicitly shows or enforces a two-part IC upload (front + back) — users are not guided through this requirement. Other critical bugs include a broken chatbot fasal guide, placeholder API keys passing truthy checks, and PDFs failing silently in Isi Pintar.

---

## Requirements

| ID | Requirement |
|----|------------|
| R1 | IC upload must show two distinct upload zones: **IC Depan (front)** and **IC Belakang (back)** |
| R2 | Both IC zones are mandatory (wajib) — form cannot advance to Step 6 without both |
| R3 | IC document URLs (`ic_pemohon_depan`, `ic_pemohon_belakang`) must be correctly saved to Supabase |
| R4 | Chatbot fasal guide must complete the full conversation flow |
| R5 | Placeholder API keys must not trigger API calls — use a proper configured-key check |
| R6 | Isi Pintar must warn users that PDFs are not supported; block PDF uploads for IC/SSM zones |
| R7 | Submit button must be disabled after first click to prevent double-submission |
| R8 | Loading overlay must time out after 60 seconds with a user-facing error |
| R9 | Draft restore must correctly re-apply business type to the DOM selector |
| R10 | Isi Pintar must map SSM address to the correct form field `alamat` not `alamat_perniagaan` |
| R11 | `no_kad_pengenal` and `nama_lengkap_pemohon` must be validated as required in Step 3 |
| R12 | Step 4 must validate at least one shareholder/board member for relevant fasal |
| R13 | `sektor` radio group must be validated as required in Step 2 |
| R14 | Auto-save must be debounced (≥800ms delay) to avoid performance hit on every keystroke |
| R15 | Supabase payload must include `url_ic_pemohon_depan` and `url_ic_pemohon_belakang` columns |
| R16 | Phone validation must enforce Malaysian standard (10–11 digits minimum) |
| R17 | Chatbot must use a more recent Groq model (`llama3-70b-8192` or `llama-3.1-8b-instant`) |
| R18 | `nama_entiti` must be auto-filled from SSM data in `mapExtractedToForm` |

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| IC upload split into two `DOCS_WAJIB` entries | `ic_pemohon_depan` and `ic_pemohon_belakang` already exist in `DOCS_WAJIB` — the only missing piece is the UI making this visually explicit and the Supabase payload including both URLs |
| Supabase table column addition (`url_ic_pemohon_depan`, `url_ic_pemohon_belakang`) | Old column `url_ic_pemohon` is retained as `null` for backward compatibility; two new columns added |
| Configured-key guard function `isKeyConfigured(k)` | A single reusable helper checks that key is not null, not the placeholder `YOUR_*` string, and has length > 20 — avoids scattered truthy checks |
| Debounce at 800ms for auto-save | Balances responsiveness against DOM-query cost on every keystroke |
| Submit button locked after first click, unlocked only on error | Prevents duplicates without permanently disabling the button if submission fails |
| 60-second upload timeout via `Promise.race` | Cleaner than a timeout inside the loop; wraps the entire upload+insert block |
| PDF blocked in Isi Pintar file inputs | Vision LLM cannot process PDFs — enforced at `accept` attribute level |

---

## High-Level Technical Design

```
DOCS_WAJIB array
  ├── gambar_1          (passport photo)
  ├── ic_pemohon_depan  ← Step 5 renders TWO upload zones side-by-side
  ├── ic_pemohon_belakang  (new explicit label + icon)
  └── profil_ssm

validateStep(5)
  └── checks both ic_pemohon_depan AND ic_pemohon_belakang are in uploadedFiles

Supabase payload (submitPermohonan)
  ├── url_ic_pemohon_depan    ← NEW (replaces url_ic_pemohon)
  ├── url_ic_pemohon_belakang ← NEW
  └── url_ic_pemohon: null    (deprecated, kept for column compatibility)

isKeyConfigured(k)
  └── used in: sendChatMessage, callGroqVision, emailjs.init guard

submitPermohonan
  ├── disable submit button (start)
  ├── Promise.race([uploadAndInsert(), timeout(60000)])
  └── re-enable submit button (on error only)
```

---

## Scope Boundaries

### In Scope
- All 20 items from the audit report (Critical, High, Medium, Low)
- IC two-part upload UI, validation, and Supabase payload fix
- Supabase table schema update (two new columns)

### Deferred to Follow-Up Work
- CAPTCHA / bot protection (requires external script integration and EmailJS template changes)
- Moving inline JS to a separate file to allow removal of `unsafe-inline` from CSP
- PDF generation footer overflow fix (requires dynamic page-height calculation with jsPDF)
- Groq model upgrade to latest available (requires testing chatbot output quality)

### Out of Scope
- Backend / server-side changes beyond Supabase schema
- Redesigning the form step flow or UI theme
- EmailJS template body changes

---

## Implementation Units

---

### U1. Add `isKeyConfigured` helper and fix all API key checks

**Goal:** Replace bare truthy checks on `GROQ_KEY` and `EMAILJS_KEY` with a proper configured-key guard that rejects placeholder strings.

**Requirements:** R5

**Dependencies:** none

**Files:**
- `borang.html` (lines ~4330, ~4578, ~2651)

**Approach:**
Add once after the `const GROQ_KEY = ...` line:
```js
function isKeyConfigured(k) {
  return !!(k && !k.startsWith('YOUR_') && k.length > 20);
}
```
Replace every `if (GROQ_KEY)` with `if (isKeyConfigured(GROQ_KEY))`.  
Replace `if (!GROQ_KEY)` (in `callGroqVision`) with `if (!isKeyConfigured(GROQ_KEY))`.  
Wrap `emailjs.init(EMAILJS_KEY)` with the same guard.

**Test scenarios:**
- Placeholder `'YOUR_GROQ_KEY_HERE'` → `isKeyConfigured` returns `false` → chatbot falls back to FAQ without API call
- Empty string `''` → returns `false`
- Real 32-char key → returns `true`
- Key shorter than 20 chars → returns `false`

**Verification:** Open chatbot without a Groq key configured — must fall back to FAQ immediately with no console 401 errors.

---

### U2. Fix IC document upload UI — explicit front/back zones in Step 5

**Goal:** Make the two IC upload zones visually distinct with clear labels ("IC Depan" and "IC Belakang"), helping users understand they must upload both sides.

**Requirements:** R1, R2

**Dependencies:** none (UI only)

**Files:**
- `borang.html` (Step 5 document upload section, `renderDocUpload` function ~line 3300)

**Approach:**
- `DOCS_WAJIB` already has `ic_pemohon_depan` and `ic_pemohon_belakang` as separate entries — no data change needed.
- In `renderDocUpload`, detect when both IC keys are being rendered sequentially and wrap them in a shared container with a heading: "Kad Pengenalan (MyKad) Pemohon — Muat Naik Kedua-Dua Muka".
- Each zone shows distinct icons: front (face icon 🪪) and back (fingerprint icon 🔒) or just clear text labels "DEPAN" / "BELAKANG" with the existing upload card style.
- Both zones use the same `accept` filter as the rest of IC docs (`.pdf,.jpg,.jpeg,.png`).

**Test scenarios:**
- Step 5 renders two separate upload cards labelled "Depan" and "Belakang"
- Uploading only `ic_pemohon_depan` and clicking Next → shows error toast "Sila muat naik IC Belakang"
- Uploading only `ic_pemohon_belakang` and clicking Next → shows error toast "Sila muat naik IC Depan"
- Uploading both → validation passes, proceeds to Step 6

**Verification:** Step 5 visually shows two upload zones clearly. `validateStep(5)` blocks when either is missing.

---

### U3. Fix Supabase payload — replace `url_ic_pemohon` with two new fields

**Goal:** Ensure IC document URLs are actually saved to the database after upload.

**Requirements:** R3, R15

**Dependencies:** U2 (IC upload keys must match)

**Files:**
- `borang.html` (line 3697 in `submitPermohonan`)

**Approach:**
Replace:
```js
url_ic_pemohon: uploadedUrls['ic_pemohon'] || null,
```
With:
```js
url_ic_pemohon_depan:    uploadedUrls['ic_pemohon_depan'] || null,
url_ic_pemohon_belakang: uploadedUrls['ic_pemohon_belakang'] || null,
```
Also run an `ALTER TABLE` on the Supabase `PERMOHONAN_AHLI` table:
```sql
ALTER TABLE "PERMOHONAN_AHLI"
  ADD COLUMN IF NOT EXISTS url_ic_pemohon_depan TEXT,
  ADD COLUMN IF NOT EXISTS url_ic_pemohon_belakang TEXT;
```
*(Old `url_ic_pemohon` column kept to avoid migration risk on existing records.)*

**Test scenarios:**
- Submit a test form with IC front + back uploaded → both URLs appear in Supabase row
- Submit without uploading IC → both columns are `null`
- Old `url_ic_pemohon` column is still present (not dropped), existing rows unaffected

**Verification:** Check Supabase table editor — new submission rows have non-null `url_ic_pemohon_depan` and `url_ic_pemohon_belakang`.

---

### U4. Fix chatbot fasal guide — route responses through `handleFasalGuideResponse`

**Goal:** Make the guided fasal selection conversation actually work end-to-end.

**Requirements:** R4

**Dependencies:** none

**Files:**
- `borang.html` (`sendChatMessage` function ~line 4316)

**Approach:**
Add routing at the very top of `sendChatMessage` before the keyword checks:
```js
if (chatbotState === 'fasal-guide') { handleFasalGuideResponse(text); return; }
if (chatbotState === 'fasal-guide-structure') { handleFasalGuideStructureResponse(text); return; }
```
Add `handleFasalGuideStructureResponse` to handle follow-up structure questions and map to a fasal recommendation.

**Test scenarios:**
- User types "fasal" → bot asks citizenship/Islam question, `chatbotState` = `'fasal-guide'`
- User replies "Ya" → bot asks structure question, `chatbotState` = `'fasal-guide-structure'`
- User replies "Tidak" → bot explains Ahli Bersekutu, `chatbotState` resets to `'idle'`
- User types something unrelated while guide is active → does NOT go to Groq/FAQ, stays in guide flow

**Verification:** Complete the fasal guide flow from start to recommendation without Groq being called.

---

### U5. Block PDFs in Isi Pintar and fix SSM address field mapping

**Goal:** Prevent silent failures when PDFs are uploaded to Isi Pintar (vision API can't read them). Fix auto-fill address mapping.

**Requirements:** R6, R10

**Dependencies:** none

**Files:**
- `borang.html` (Isi Pintar overlay HTML ~line 4736, `mapExtractedToForm` ~line 4681)

**Approach:**
1. Change both file inputs in Isi Pintar overlay from `accept="image/*,application/pdf"` to `accept="image/*"`.
2. Update the sub-label text from "JPG, PNG atau PDF — max 5MB" to "JPG atau PNG sahaja — max 5MB".
3. In `mapExtractedToForm`, change `applyIpField('alamat_perniagaan', ssmData.alamat)` to `applyIpField('alamat', ssmData.alamat)`.
4. Add `applyIpField('nama_entiti', ssmData.nama_perniagaan)` alongside the existing `applyIpField('jenama', ssmData.nama_perniagaan)`.

**Test scenarios:**
- Try selecting a PDF file in Isi Pintar → OS file picker does not show PDF files
- Upload valid JPG IC + JPG SSM → `alamat` field is filled with SSM address
- Upload valid JPG IC + JPG SSM → `nama_entiti` field is filled with company name
- Upload valid JPG IC + JPG SSM → `jenama` field is also filled (both fields get the same value)

**Verification:** After Isi Pintar runs, check that `alamat` and `nama_entiti` fields are populated.

---

### U6. Add submit protection — double-click guard and loading timeout

**Goal:** Prevent duplicate Supabase rows from double-click, and free users from a frozen loading screen if the network hangs.

**Requirements:** R7, R8

**Dependencies:** none

**Files:**
- `borang.html` (`submitPermohonan` function ~line 3488)

**Approach:**
At the start of `submitPermohonan`:
```js
const submitBtn = document.getElementById('btn-submit');
if (submitBtn) submitBtn.disabled = true;
```

Wrap the entire `try` block in a `Promise.race` against a 60-second timeout:
```js
const uploadTimeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Masa tamat (60s). Sila semak sambungan dan cuba semula.')), 60000)
);
// In catch block, re-enable: if (submitBtn) submitBtn.disabled = false;
```

**Test scenarios:**
- Click submit once → button becomes disabled, loading shows
- Submit succeeds → button stays disabled (success screen replaces form)
- Submit fails (network error) → button re-enabled, error toast shown
- Simulate 65-second hang → timeout error message shown, button re-enabled

**Verification:** Manually double-click submit — only one Supabase row is inserted.

---

### U7. Fix validation gaps — Step 2 `sektor`, Step 3 IC/name, Step 4 shareholders

**Goal:** Prevent form submission with missing required data that currently has no validation guard.

**Requirements:** R11, R12, R13

**Dependencies:** none

**Files:**
- `borang.html` (`validateStep` function ~line 2999)

**Approach:**

**Step 2** — add after existing checks:
```js
if (!getRadio('sektor')) { showErr('err-sektor'); ok = false; }
```
Add `<p id="err-sektor" class="field-error">Sila pilih sektor.</p>` in the HTML near the sektor radio group.

**Step 3** — add:
```js
if (!val('nama_lengkap_pemohon')) { showErr('err-nama_lengkap'); ok = false; }
if (!val('no_kad_pengenal'))      { showErr('err-ic'); ok = false; }
```

**Step 4** — add a conditional check for fasal that requires shareholders:
```js
if (n === 4) {
  const requiresShareholders = ['6.2.4','6.2.5','6.3.2','6.3.3','6.3.4'].includes(state.fasal);
  if (requiresShareholders) {
    const hasShareHolder = document.getElementById('saham_nama_1')?.value.trim();
    if (!hasShareHolder) { showToast('Sila isi sekurang-kurangnya satu pemegang saham.', 'error'); ok = false; }
  }
}
```

**Test scenarios:**
- Submit Step 2 without selecting `sektor` → error shown, cannot proceed
- Submit Step 3 without `no_kad_pengenal` → error shown
- Submit Step 3 without `nama_lengkap_pemohon` → error shown
- Submit Step 4 with fasal 6.2.5 and no shareholders → error toast shown
- Submit Step 4 with fasal 6.2.1 (sole proprietor) and no shareholders → no error (not required)

**Verification:** Each new validation fires correctly and clears when the user fills the field.

---

### U8. Fix draft restore — business type DOM sync and debounce auto-save

**Goal:** Draft resume correctly restores business type selection. Auto-save stops firing on every keystroke.

**Requirements:** R9, R14

**Dependencies:** none

**Files:**
- `borang.html` (`restoreDraft` ~line 4236, auto-save listener ~line 4262)

**Approach:**

**Draft restore fix** — replace the incorrect call:
```js
// OLD (does nothing):
if (draft.businessType) handleBusinessTypeChange(draft.businessType);

// NEW:
if (draft.businessType) {
  const radios = document.querySelectorAll(`input[name="business-type"]`);
  radios.forEach(r => { if (r.value === draft.businessType) r.checked = true; });
  handleBusinessTypeChange();
}
```
*(Exact radio `name` attribute must match what is in the HTML — verify during implementation.)*

**Debounce fix** — replace the direct listener:
```js
let _draftTimer;
document.addEventListener('input', (e) => {
  if (e.target.matches('input, textarea, select')) {
    clearTimeout(_draftTimer);
    _draftTimer = setTimeout(saveDraft, 800);
  }
});
```

**Test scenarios:**
- Fill in business type "enterprise_sole", refresh page, click "Teruskan" → correct radio is pre-selected
- Type rapidly in a text field → `saveDraft` called at most once per 800ms burst
- Draft restore triggers `handleBusinessTypeChange()` → document checklist updates correctly

**Verification:** After resume, the business type radio shows the saved value and the document checklist reflects it.

---

### U9. Fix phone validation and update Groq model

**Goal:** Phone number must meet Malaysian 10–11 digit standard. Chatbot uses a more capable Groq model.

**Requirements:** R16, R17

**Dependencies:** U1 (key guard should already be in place)

**Files:**
- `borang.html` (blur validation ~line 4456, Groq model string ~line 4340)

**Approach:**

**Phone validation** — change minimum from `>= 9` to `>= 10`:
```js
{ id: 'no_tel_bimbit', check: v => v === '' || v.replace(/\D/g,'').length >= 10 },
{ id: 'proksi_hp',     check: v => v === '' || v.replace(/\D/g,'').length >= 10 },
```

**Groq model** — change `'llama3-8b-8192'` to `'llama-3.1-8b-instant'`.

**Test scenarios:**
- Enter 9-digit phone number, blur field → error shown
- Enter 10-digit phone number → error clears, success state applied
- Chatbot responds with the updated model (verify model ID in network request)

**Verification:** Network inspector shows updated model ID in Groq API request payload.

---

## Open Questions

| ID | Question | Status |
|----|----------|--------|
| OQ1 | Does the Supabase `PERMOHONAN_AHLI` table already have `url_ic_pemohon_depan` / `url_ic_pemohon_belakang` columns? Needs manual check in Supabase Table Editor | Deferred to implementation |
| OQ2 | What is the exact `name` attribute on the business-type radio group in the HTML? (`business-type`, `businessType`, etc.) — required for U8 draft restore fix | Deferred to implementation |
| OQ3 | Is `nama_lengkap_pemohon` field ID confirmed in the HTML, or is it `nama_pemohon`? Verify ID before U7 | Deferred to implementation |

---

## System-Wide Impact

- **Supabase schema**: Two new columns added to `PERMOHONAN_AHLI`. Old `url_ic_pemohon` retained to avoid breaking existing integrations.
- **EmailJS**: No template changes — `url_ic_pemohon_depan` / `url_ic_pemohon_belakang` are not in the email template, which is acceptable.
- **Isi Pintar**: PDF files blocked from IC/SSM upload — users using PDFs will need to screenshot their documents first.
- **Performance**: Debounced auto-save reduces DOM queries from ~100/second (heavy typing) to ~1.25/second.

---

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Supabase `PERMOHONAN_AHLI` missing new columns → insert error | Medium | Critical | Run `ALTER TABLE` before deploying frontend changes |
| Business type radio `name` attribute mismatch in U8 | Low | Medium | Verify attribute before implementation via quick read |
| `llama-3.1-8b-instant` model retired or rate-limited | Low | Low | Falls back to FAQ via error handler |
| PDF block in Isi Pintar breaks users who only have PDF scans | Medium | Medium | Add clear guidance text: "Sila screenshot atau imbas semula sebagai JPG/PNG" |

---

## Implementation Order

Execute units in this sequence — each is independently safe but this order minimises regression:

1. **U1** — Key guard helper (affects U4, U9 safety)
2. **U3** — Supabase payload fix (most critical data bug; deploy schema change first)
3. **U2** — IC upload UI (pairs with U3)
4. **U5** — Isi Pintar PDF block + address fix
5. **U6** — Submit protection
6. **U7** — Validation gaps
7. **U8** — Draft restore + debounce
8. **U4** — Chatbot fasal guide fix
9. **U9** — Phone validation + Groq model
