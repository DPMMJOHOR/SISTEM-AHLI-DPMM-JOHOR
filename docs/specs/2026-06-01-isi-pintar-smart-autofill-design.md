# Isi Pintar — Smart Document Auto-Fill
**Date:** 2026-06-01  
**Status:** Approved — pending implementation plan  
**Scope:** `borang.html` welcome screen + form field population

---

## Problem

Users filling the DPMM membership form frequently:
- Are unsure which documents to prepare
- Make typos copying IC numbers and SSM registration numbers
- Drop off mid-form when they realise they don't have documents ready

## Solution

A "Smart Upload" entry point on the welcome screen that:
1. Shows the full list of required documents upfront
2. Lets users upload IC + SSM cert
3. Uses Groq Vision AI to extract structured data
4. Auto-fills the form with extracted data (amber-highlighted)
5. Users simply review and correct — no retyping needed

---

## UX Flow

```
Welcome Screen
  ├── Document checklist (visual prep guide)
  ├── [📄 Isi Pintar — Muat Naik IC & SSM]  ← primary CTA
  └── [✏️ Isi Secara Manual]                ← secondary CTA

If "Isi Pintar":
  ├── Upload IC (MyKad) field
  ├── Upload Sijil SSM / Dokumen Syarikat field
  ├── Consent checkbox (required before button enables)
  └── [Analisis Dokumen →] button

→ Loading overlay: "Sedang menganalisis dokumen anda..."
  (2 parallel Groq API calls)

→ On success:
  Form navigates to Step 1
  Pre-filled fields highlighted with .autofilled CSS class (amber)
  User proceeds through form editing wrong values inline
  Highlight removed on field edit

→ On failure (any of 3 fallback levels):
  Graceful message → redirect to manual form
```

---

## Welcome Screen — Document Checklist

Displayed prominently above both CTAs.

### Wajib (All Applicants)
- Kad Pengenalan (MyKad)
- Sijil Pendaftaran Perniagaan (SSM) — terkini
- Gambar Passport terbaru (2 keping)

### Tambahan (By Membership Type)
| Fasal | Additional Documents |
|-------|---------------------|
| 6.2.4, 6.2.5, 6.2.6 | Borang 24 & 49 (Sdn Bhd/Koperasi) |
| 6.3.1–6.3.5 | Penyata Bank 3 bulan / Laporan Tahunan |
| 6.4.1–6.4.2 | Surat Sokongan Pertubuhan |
| 6.5.1–6.5.2 | Surat Cadangan Ahli Kehormat |

Note: At welcome screen, fasal not yet known → show generic "mengikut jenis keahlian" label. Full fasal-specific checklist shown again at Step 5 (Dokumen Upload).

### File Format Reminder
- Format: JPG, PNG, PDF
- Saiz maksimum: 5MB setiap fail

---

## Field Extraction Map

### From IC (MyKad)
| Extracted | Form Field | Notes |
|-----------|-----------|-------|
| Full name | `nama_penuh_ic` | |
| IC number | `no_kad_pengenal` | |
| Gender | `jantina` | Derived from IC last digit (odd=lelaki, even=perempuan) — no OCR needed |
| Address | `alamat` | Full address block |
| Postcode | `poskod` | Parsed from address |
| City | `bandar` | Parsed from address |
| State | `negeri` | Parsed from address |

### From SSM Certificate
| Extracted | Form Field | Notes |
|-----------|-----------|-------|
| Business name | `jenama` | |
| Registration no. | `no_pendaftaran` | |
| Registration date | `tarikh_daftar` | Format: DD/MM/YYYY → YYYY-MM-DD |
| Expiry date | `tarikh_luput` | |
| Business type | `jenis_entiti` | Map: "Enterprise"→"Enterprise", "Sdn Bhd"→"Sdn. Bhd.", etc. |
| Business activity | `aktiviti_perniagaan` | |
| Business address | `alamat_perniagaan` | If different from IC |

**Coverage:** ~70% of form fields auto-filled from 2 documents.

**Cannot auto-fill** (always manual): `no_tel_bimbit`, `emel_peribadi`, `emel_syarikat`, `modal_berbayar`, `modal_pusingan`, proxy details.

---

## Technical Architecture

### AI Model
- Provider: Groq (free tier, ~14,400 req/day)
- Model: `meta-llama/llama-4-scout-17b-16e-instruct` or `llama-3.2-11b-vision-preview`
- Same API key as chatbot feature (single key, dual purpose)

### Extraction Pipeline
```
1. User uploads IC + SSM images
2. Client-side: compress/resize to max 1024px (canvas API)
   - Reduces payload ~70-80%, faster API response
3. Two parallel fetch() calls to Groq Vision API:
   - Call 1: IC extraction prompt → JSON
   - Call 2: SSM extraction prompt → JSON
4. Promise.allSettled() — handles partial failures gracefully
5. Merge JSON responses → mapExtractedToFormFields()
6. Populate: document.getElementById(fieldId).value = value
7. state.autoFilledFields = [fieldIds that were filled]
8. Add .autofilled CSS class to each filled input
9. goToStep(1) — form starts at Step 1
```

### Groq Prompt Design (IC)
```
Kamu adalah sistem ekstrak data dari MyKad Malaysia.
Baca imej kad pengenalan ini dan kembalikan JSON berikut SAHAJA:
{
  "nama": "nama penuh seperti di IC",
  "no_ic": "format: XXXXXX-XX-XXXX",
  "alamat": "alamat penuh",
  "poskod": "5 digit",
  "bandar": "nama bandar",
  "negeri": "nama negeri"
}
Jika sesuatu medan tidak dapat dibaca, gunakan nilai null.
Jangan tambah sebarang penjelasan — JSON sahaja.
```

### Groq Prompt Design (SSM)
```
Kamu adalah sistem ekstrak data dari sijil SSM Malaysia.
Baca dokumen perniagaan ini dan kembalikan JSON berikut SAHAJA:
{
  "nama_perniagaan": "nama perniagaan berdaftar",
  "no_pendaftaran": "nombor pendaftaran SSM",
  "tarikh_daftar": "DD/MM/YYYY",
  "tarikh_luput": "DD/MM/YYYY atau null",
  "jenis_entiti": "Enterprise / Sdn Bhd / Bhd / Perkongsian / Koperasi",
  "aktiviti": "kod atau penerangan aktiviti perniagaan",
  "alamat": "alamat perniagaan berdaftar"
}
Jangan tambah sebarang penjelasan — JSON sahaja.
```

### Auto-fill Visual Treatment
```css
.autofilled {
  background: #fffbeb;       /* amber-50 */
  border-color: #f59e0b;     /* amber-400 */
  border-width: 2px;
}
.autofilled::after {
  content: '✓ Diisi automatik';
  font-size: 11px;
  color: #92400e;
}
/* Remove highlight on user edit */
.autofilled:focus, .autofilled.edited {
  background: white;
  border-color: var(--color-border);
}
```

---

## Fallback Chain

| Scenario | Behaviour |
|----------|-----------|
| Groq API unavailable / timeout (>15s) | "Perkhidmatan AI tidak tersedia. Sila isi secara manual." → manual form |
| Wrong document uploaded (utility bill, etc.) | "Dokumen tidak dikenali. Cuba muat naik semula atau isi manual." |
| Partial extraction (blurry IC) | Fill what was found. Leave rest blank. Show: "Semak ruangan yang kosong." |
| User skips Isi Pintar entirely | Existing manual form flow unchanged |
| Groq returns invalid JSON | Catch parse error → fallback to manual |

---

## Privacy & Consent

### Consent Requirement
- Checkbox must be checked before "Analisis Dokumen" button enables
- Label: *"Saya bersetuju dokumen saya diproses oleh AI (Groq Inc.) untuk bacaan teks sahaja. Imej tidak disimpan."*

### Data Handling
- Images are resized client-side (canvas) before being sent — original file never transmitted
- Images sent to Groq API over HTTPS
- Groq standard API: data not retained per Groq's data policy
- Images NOT uploaded to Supabase Storage at this step
- Extracted text values only stored in JS `state` object (memory, cleared on page close)

---

## Implementation Scope

### New HTML Elements
- Welcome screen section (replaces or wraps current intro)
- Document checklist (static + dynamic from `DOCS_WAJIB`)
- Upload panel for IC + SSM (2 file inputs)
- Consent checkbox
- Loading overlay with spinner

### New JavaScript
- `initIsiPintar()` — mounts upload panel on welcome screen
- `compressImage(file)` → `Promise<base64>` — canvas resize
- `extractFromIC(base64)` → `Promise<{nama, no_ic, alamat, ...}>` — Groq call
- `extractFromSSM(base64)` → `Promise<{nama_perniagaan, no_pendaftaran, ...}>` — Groq call
- `mapExtractedToForm(icData, ssmData)` — maps extracted JSON to form field IDs
- `applyAutoFill(fieldMap)` — sets values + adds `.autofilled` class + updates `state`

### New CSS
- `.welcome-doc-checklist` — document prep section
- `.isi-pintar-panel` — upload panel
- `.autofilled` — amber highlight for auto-filled fields
- `.autofilled.edited` — removes highlight after user edits

### Configuration Addition
```javascript
const GROQ_KEY = 'your-groq-api-key';  // same key as chatbot
```

### No New Dependencies
- Uses existing fetch() API
- Uses existing HTML5 Canvas API for compression
- Uses existing Groq API key (shared with chatbot)

---

## Out of Scope
- Server-side extraction / proxy
- Storing uploaded images in Supabase
- Reading Borang 24/49 (complex multi-page tables — future phase)
- Automatic fasal recommendation from SSM data (overlaps with chatbot feature)
- Mobile camera integration (uses standard file picker which already allows camera)

---

## Success Criteria
- User can upload IC + SSM and have form >60% pre-filled in under 15 seconds
- Zero data stored beyond session memory
- Graceful fallback — user can always complete form manually
- All pre-filled fields clearly marked as auto-filled
- Field highlight removed when user edits
