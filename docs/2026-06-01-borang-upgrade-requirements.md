# Borang Permohonan — Upgrade & Chatbot Requirements
**Date:** 2026-06-01  
**Scope:** `SISTEM-AHLI-DPMM-JOHOR/borang.html`  
**Status:** Requirements confirmed — ready for planning

---

## Problem Statement

The current `borang.html` multi-step form has 25 identified issues across data integrity, validation, UX, performance, and accessibility. Additionally, users — mostly business owners unfamiliar with legal fasal classifications — frequently make wrong fasal choices or abandon the form due to confusion. A guided chatbot assistant would reduce drop-offs and admin rework from incorrect submissions.

---

## Audit Findings (25 items)

### 🔴 Critical / Data Integrity (5)
1. **SUPABASE_KEY comment is misleading** — comment says "Service Role Key" but value is anon key (correct for public form). Comment must be corrected to prevent future developer accidentally replacing it with service role key (catastrophic security breach).
2. **Reference number race condition** — `generateReferenceNumber()` reads DB count then increments client-side. Concurrent submissions can produce identical ref numbers.
3. **`tarikh_luput` (SSM expiry) not validated** — expired SSM passes through. Should warn if date < today.
4. **`tarikh_daftar` vs `tarikh_luput` not cross-validated** — expiry date can be set before registration date.
5. **Gambar passport discrepancy** — label says "Dua (2) keping" but only 1 upload field exists. Needs `gambar_2` upload field or label correction.

### 🟠 Validation Gaps (5)
6. **`poskod`** — no `inputmode="numeric"`, no 5-digit enforcement.
7. **`modal_berbayar` / `modal_pusingan`** — accepts negative numbers.
8. **Email format** — validated on blur only, not in `validateStep(3)`.
9. **Shareholder/director table** — if `jenis_entiti = Sdn Bhd/Bhd`, no check that ≥1 row is filled.
10. **IC cross-check** — no warning if `proksi_ic` = `no_kad_pengenal` (proxy shouldn't be same person as sole proprietor).

### 🟡 UX Issues (9)
11. **No save/resume** — closing tab loses all progress. No localStorage persistence.
12. **Progress bar not clickable** — users can't jump back to step 2 by clicking its badge.
13. **Intro dropdown only covers 5 of 8 types** — no path for Ahli Bersekutu (S), Bergabung (G), Kehormat (H).
14. **`aktiviti_perniagaan` is `<input>`, not `<textarea>`** — clips long descriptions.
15. **No field tooltips** — "Modal Berbayar", "Modal Pusingan", "Fasal 6.x.x" have no help text.
16. **No `inputmode` on numeric fields** — IC, phone, poskod show alphabetic keyboard on mobile.
17. **No file preview** — user uploads photo with no visual confirmation it's the right image.
18. **No copy-to-clipboard** on success screen reference number.
19. **No WhatsApp follow-up button** on success screen (standard in Malaysian gov/quasi-gov flows).

### 🔵 Performance / Tech (3)
20. **Google Fonts loads 9 weights × 3 families** — ~320KB, no `font-display:swap`.
21. **`api.ipify.org`** — extra external dependency on every submission.
22. **No localStorage auto-save** — refreshing mid-form loses all data including uploaded files.

### ⚪ Accessibility (3)
23. **No `aria-invalid`, `aria-describedby`** on error-state inputs.
24. **Progress bar missing ARIA** — needs `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
25. **Radio/checkbox** — no `:focus-visible` CSS ring for keyboard navigation.

---

## Chatbot Feature Requirements

### Goals
- **Reduce wrong fasal selection** — biggest cause of admin rework
- **Reduce form abandonment** — users confused by complex fields give up
- **Answer FAQ in real time** — without leaving the form to call/WhatsApp admin
- **Optional conversational input** — for users who prefer chat to form-filling

### Architecture Decision: Hybrid Rule-based + Groq AI

| Component | Approach | Rationale |
|-----------|----------|-----------|
| Fasal guide | Rule-based decision tree | Finite, deterministic, zero cost, offline-safe |
| Field FAQ | Groq Llama 3 API (free tier) | Handles unexpected BM questions; free; graceful fallback |
| Conversational form fill | Rule-based prompts + form-state bridge | Fills actual form fields from chat answers |
| Fallback | Scripted FAQ if Groq unavailable | Form never breaks |

**Groq API:** Free tier, ~14,400 requests/day. DPMM volume (~50 submissions/month) is well within limits. API key from console.groq.com, stored as JS constant (same pattern as EmailJS key).

---

### Chatbot Behaviour Spec

#### 1. Fasal Decision Guide (Rule-based)
User enters via "Tidak pasti jenis keahlian?" button on Step 1.  
Bot asks 4–5 yes/no questions:
1. "Adakah anda warganegara Malaysia yang beragama Islam?" → Yes/No
2. "Apakah struktur perniagaan anda?" → Sole/Partnership/Sdn Bhd/Professional/Koperasi/Persatuan
3. "Siapa yang memiliki perniagaan?" → 100% Melayu / 51%+ Melayu / Bercampur
4. "Adakah anda mempunyai SSM / Nombor Pendaftaran?" → Yes/No  
Output: Recommends fasal (e.g. 6.2.1) + auto-selects in Step 1 + explains why.

#### 2. Field FAQ Assistant (Groq AI)
Floating chat bubble (bottom-right), available throughout all steps.  
System prompt in BM, grounded in DPMM domain knowledge.  
Answers questions like:
- "Apa itu modal berbayar?"
- "Dokumen apa yang perlu untuk Sdn Bhd?"
- "Berapa yuran untuk fasal 6.2.5?"
- "Boleh proksi gunakan IC yang sama?"  
Context-aware: knows which step user is on, passes relevant field context.  
Fallback: if Groq fails → shows scripted FAQ accordion.

#### 3. Conversational Form Fill (Optional mode)
Accessible via "Isi dengan chat" toggle on intro screen.  
Bot collects fields conversationally, populates real form inputs via `document.getElementById`.  
Steps mirrored: bot handles Steps 2–4 (business info, personal details, proxy).  
Steps 5–7 (documents, payment, declaration) remain as standard form — too structured for chat.

---

### Chatbot UI Spec

- **Trigger:** Floating chat button (bottom-right, `position:fixed`), DPMM blue, "Perlukan Bantuan?" label
- **Window:** Slide-up panel, 360px wide, 500px tall, rounded corners, DPMM brand colours
- **Header:** "Pembantu DPMM Johor" + bot avatar (DPMM logo small)
- **Messages:** User bubble (blue, right) / Bot bubble (white with border, left)
- **Input:** Text field + send button; quick-reply chips for yes/no decisions
- **Fasal guide:** Starts automatically if user clicks "Tak pasti fasal?" on Step 1
- **Minimize/close:** X button, remembers open state during session
- **No external chat widget** — fully inline, single-file compatible

---

## Fix Priority Order

### Phase B1 — Critical Data Fixes (implement first)
- [ ] Fix misleading SUPABASE_KEY comment
- [ ] Fix ref number race condition (use DB sequence or UUID prefix + timestamp)
- [ ] Validate `tarikh_luput` ≥ today
- [ ] Cross-validate `tarikh_daftar` ≤ `tarikh_luput`
- [ ] Add `gambar_2` upload field or correct label

### Phase B2 — Validation + UX Quick Wins
- [ ] `poskod`: `inputmode="numeric"`, maxlength=5, digits only
- [ ] `modal_berbayar` / `modal_pusingan`: min=0
- [ ] Email validated in `validateStep(3)`
- [ ] `aktiviti_perniagaan` → `<textarea rows="2">`
- [ ] `inputmode="numeric"` on IC, phone, poskod
- [ ] Copy-to-clipboard on success ref number
- [ ] WhatsApp follow-up button on success screen (`wa.me/60...`)
- [ ] Clickable progress bar steps (back-navigation)
- [ ] Field tooltip icons for complex fields (modal, fasal)
- [ ] `font-display:swap` on Google Fonts import

### Phase B3 — Save/Resume + File Preview
- [ ] localStorage auto-save (text fields only, not file blobs)
- [ ] Resume prompt on page load if saved draft exists
- [ ] File image preview for passport photo upload

### Phase B4 — Chatbot
- [ ] Fasal decision tree (rule-based, Step 1 integration)
- [ ] Floating chat UI (inline CSS + JS, no external widget)
- [ ] Groq API integration (field FAQ, BM system prompt)
- [ ] Conversational form fill mode (optional)
- [ ] Scripted FAQ fallback

### Phase B5 — Accessibility
- [ ] `aria-invalid`, `aria-describedby` on error inputs
- [ ] Progress bar ARIA attributes
- [ ] `:focus-visible` ring on radio/checkbox

---

## Out of Scope
- Server-side validation (GitHub Pages = static hosting)
- Duplicate submission prevention via DB (needs Supabase Edge Function)
- PDF attachment in confirmation email
- WhatsApp automation (Phase 2 as per existing plan)

---

## Success Criteria
- Zero wrong-fasal submissions due to chatbot guide
- Form completion rate increases (measurable via Supabase submission count vs page views)
- Zero critical data integrity bugs in production
- Chatbot answers ≥90% of FAQ without admin intervention

---

## Tech Constraints
- Single HTML file, no build tools, no npm
- GitHub Pages (static, no server)
- Supabase anon key + RLS (existing)
- Groq API key added as JS constant (same as EmailJS pattern)
- All UI in Bahasa Malaysia
