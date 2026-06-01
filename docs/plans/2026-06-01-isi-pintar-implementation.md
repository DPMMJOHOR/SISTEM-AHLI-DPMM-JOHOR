# Isi Pintar — Smart Document Auto-Fill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Isi Pintar" smart upload entry point to the welcome screen of `borang.html` that reads IC + SSM cert via Groq Vision AI and auto-fills the membership form fields.

**Architecture:** Single-file modification to `borang.html`. New welcome screen layout shows a document checklist + two CTAs (Isi Pintar / Isi Manual). Isi Pintar opens an overlay panel; on submit, two parallel Groq Vision API calls extract data; results are mapped to form fields and applied with amber `.autofilled` CSS highlight. Graceful fallback at every failure point.

**Tech Stack:** Vanilla JS, HTML5 Canvas API (image compression), Groq Vision API (`llama-3.2-11b-vision-preview`), existing CSS variables, no new dependencies.

---

## File Map

| File | Changes |
|------|---------|
| `borang.html` — CSS block (lines ~1–1170) | Add `.isi-pintar-*`, `.doc-checklist-static`, `.autofilled` styles |
| `borang.html` — `#screen-intro` HTML (lines ~1223–1295) | Add doc checklist section; replace single CTA with two CTAs; add Isi Pintar overlay |
| `borang.html` — Config constants (lines ~2026–2033) | Add `GROQ_KEY` constant |
| `borang.html` — `state` object (lines ~2043–2050) | Add `autoFilledFields: []` and `isiPintarUsed: false` |
| `borang.html` — JS functions (after existing functions) | Add 6 new functions: `compressImage`, `extractFromIC`, `extractFromSSM`, `mapExtractedToForm`, `applyAutoFill`, `initIsiPintar` |

---

## Task 1: Add CSS — Autofilled Field Highlight

**Files:**
- Modify: `borang.html` — CSS block, just before `</style>` tag (line ~1170)

- [ ] **Step 1: Locate the closing `</style>` tag**

  Search for `</style>` near line 1170 in `borang.html`. That is where new CSS goes.

- [ ] **Step 2: Insert autofilled field styles**

  Add the following CSS block immediately before `</style>`:

  ```css
  /* ========== ISI PINTAR — AUTO-FILL HIGHLIGHT ========== */
  .autofilled {
    background: #fffbeb !important;
    border-color: #f59e0b !important;
    border-width: 2px !important;
    transition: background 0.3s, border-color 0.3s;
  }
  .autofilled:focus {
    background: #ffffff !important;
    border-color: var(--primary) !important;
  }
  .autofill-badge {
    display: inline-block;
    font-size: 10px;
    color: #92400e;
    background: #fef3c7;
    border: 1px solid #fcd34d;
    border-radius: 4px;
    padding: 1px 5px;
    margin-left: 6px;
    vertical-align: middle;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  /* ========== ISI PINTAR — WELCOME SCREEN ========== */
  .doc-checklist-static {
    background: var(--grey-50, #f8f9fa);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 16px;
  }
  .doc-checklist-static h4 {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text);
    margin: 0 0 10px 0;
  }
  .doc-checklist-static ul {
    margin: 0;
    padding: 0 0 0 18px;
    list-style: none;
  }
  .doc-checklist-static ul li {
    padding: 3px 0;
    font-size: 0.88rem;
    color: var(--text-muted);
    display: flex;
    align-items: flex-start;
    gap: 7px;
  }
  .doc-checklist-static ul li::before {
    content: '📄';
    font-size: 0.8rem;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .doc-checklist-static .doc-section-title {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--navy, #152D7A);
    margin: 10px 0 4px 0;
  }
  .doc-format-note {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-top: 8px;
    padding: 6px 10px;
    background: #eef2ff;
    border-radius: 6px;
    border-left: 3px solid var(--navy-mid, #1D3C96);
  }

  /* ========== ISI PINTAR — DUAL CTA ========== */
  .welcome-cta-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 20px;
  }
  @media (max-width: 520px) {
    .welcome-cta-row { grid-template-columns: 1fr; }
  }
  .btn-isi-pintar {
    background: linear-gradient(135deg, var(--navy-mid, #1D3C96) 0%, var(--navy-light, #2B4DB8) 100%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 14px 16px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 14px rgba(29,60,150,0.3);
  }
  .btn-isi-pintar:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(29,60,150,0.4);
  }
  .btn-isi-pintar .cta-sub {
    display: block;
    font-size: 0.7rem;
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    opacity: 0.85;
    margin-top: 3px;
  }
  .btn-isi-manual {
    background: white;
    color: var(--text);
    border: 2px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .btn-isi-manual:hover {
    border-color: var(--navy-mid, #1D3C96);
    background: #eef2ff;
  }
  .btn-isi-manual .cta-sub {
    display: block;
    font-size: 0.7rem;
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    color: var(--text-muted);
    margin-top: 3px;
  }

  /* ========== ISI PINTAR — UPLOAD OVERLAY ========== */
  .isi-pintar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .isi-pintar-overlay.active {
    display: flex;
  }
  .isi-pintar-panel {
    background: white;
    border-radius: 14px;
    padding: 28px 28px 24px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
  }
  .isi-pintar-panel h3 {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 4px 0;
  }
  .isi-pintar-panel .panel-sub {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 20px;
  }
  .upload-zone {
    border: 2px dashed var(--border);
    border-radius: 10px;
    padding: 20px 16px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    margin-bottom: 12px;
    position: relative;
  }
  .upload-zone:hover, .upload-zone.has-file {
    border-color: var(--navy-mid, #1D3C96);
    background: #f0f4ff;
  }
  .upload-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
  .upload-zone-label {
    font-weight: 600;
    font-size: 0.88rem;
    color: var(--text);
    display: block;
    margin-bottom: 3px;
    pointer-events: none;
  }
  .upload-zone-sub {
    font-size: 0.75rem;
    color: var(--text-muted);
    pointer-events: none;
  }
  .upload-zone .file-name {
    font-size: 0.8rem;
    color: var(--navy-mid, #1D3C96);
    font-weight: 600;
    margin-top: 6px;
    display: none;
  }
  .upload-zone.has-file .file-name { display: block; }
  .consent-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 14px 0 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid var(--border);
  }
  .consent-row input[type="checkbox"] {
    flex-shrink: 0;
    margin-top: 2px;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  .consent-row label {
    font-size: 0.78rem;
    color: var(--text-muted);
    cursor: pointer;
    line-height: 1.4;
  }
  .isi-pintar-close {
    position: absolute;
    top: 14px;
    right: 16px;
    background: none;
    border: none;
    font-size: 1.4rem;
    cursor: pointer;
    color: var(--text-muted);
    line-height: 1;
    padding: 4px;
    border-radius: 4px;
    transition: color 0.15s, background 0.15s;
  }
  .isi-pintar-close:hover { color: var(--text); background: #f0f0f0; }
  .isi-pintar-loading {
    display: none;
    text-align: center;
    padding: 20px 0;
  }
  .isi-pintar-loading.active { display: block; }
  .isi-pintar-loading .spinner {
    width: 36px; height: 36px;
    border: 3px solid #e2e8f0;
    border-top-color: var(--navy-mid, #1D3C96);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 12px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .isi-pintar-error {
    display: none;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.83rem;
    color: #991b1b;
    margin-top: 12px;
  }
  .isi-pintar-error.active { display: block; }
  ```

- [ ] **Step 3: Verify CSS loads** — open `borang.html` in browser, no console errors.

- [ ] **Step 4: Commit**
  ```bash
  git add borang.html
  git commit -m "feat(isi-pintar): add CSS for autofill highlight, upload overlay, dual CTAs"
  ```

---

## Task 2: Add GROQ_KEY Config + State Fields

**Files:**
- Modify: `borang.html` — config block (around line 2031) and state object (around line 2043)

- [ ] **Step 1: Add GROQ_KEY constant**

  Locate the line `const ADMIN_EMAIL = 'dpmmnj.pengurusan@gmail.com';` (around line 2032).
  Insert after it:

  ```javascript
  const GROQ_KEY = '';  // Add your Groq API key — https://console.groq.com
  ```

  > **Note:** GROQ_KEY is intentionally left empty as a placeholder. It shares the same key pattern as the chatbot feature. The system will degrade gracefully (redirect to manual form) if key is absent.

- [ ] **Step 2: Add autoFill fields to state object**

  Locate the `state` object (around line 2043). The current closing brace `}` is after `refId: ''`.
  Change:
  ```javascript
  const state = {
    currentStep: 1,
    businessType: '',
    jenis_keahlian: '',
    fasal: '',
    uploadedFiles: {},
    refId: ''
  };
  ```
  To:
  ```javascript
  const state = {
    currentStep: 1,
    businessType: '',
    jenis_keahlian: '',
    fasal: '',
    uploadedFiles: {},
    refId: '',
    autoFilledFields: [],
    isiPintarUsed: false
  };
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add borang.html
  git commit -m "feat(isi-pintar): add GROQ_KEY config and autoFilledFields to state"
  ```

---

## Task 3: Modify Welcome Screen — Doc Checklist + Dual CTAs

**Files:**
- Modify: `borang.html` — `#screen-intro` section (lines ~1223–1295)

The goal is to:
1. Add a static document checklist card between the hero banner and the business type selector
2. Replace the existing single "MULA ISI BORANG" CTA button with two buttons: "Isi Pintar" and "Isi Manual"

- [ ] **Step 1: Add document checklist card**

  Locate the comment `<!-- Business Type Selection -->` (around line 1240).
  Insert the following block **immediately before** that comment:

  ```html
  <!-- Static Document Checklist — shown before business type selected -->
  <div class="intro-card doc-checklist-static" style="margin-bottom:12px;">
    <h4>📋 Sedia Dokumen Anda Sebelum Memulakan</h4>

    <p class="doc-section-title">Wajib (Semua Pemohon)</p>
    <ul>
      <li>Kad Pengenalan (MyKad) — pemohon utama</li>
      <li>Sijil Pendaftaran Perniagaan (SSM) — terkini &amp; sah</li>
      <li>Gambar Passport terbaru (2 keping)</li>
    </ul>

    <p class="doc-section-title">Tambahan (Mengikut Jenis Keahlian)</p>
    <ul>
      <li>Borang 24 &amp; Borang 49 — Sdn Bhd / Bhd / Koperasi</li>
      <li>Penyata Bank 3 bulan — Ahli Bersekutu (6.3.x)</li>
      <li>Surat Sokongan Pertubuhan — Ahli Bergabung (6.4.x)</li>
      <li>Surat Cadangan Ahli Kehormat — Fasal 6.5.1 / 6.5.2</li>
    </ul>

    <p class="doc-format-note">💡 Format diterima: <strong>JPG, PNG, PDF</strong> — saiz maksimum <strong>5MB</strong> setiap fail.</p>
  </div>
  ```

- [ ] **Step 2: Replace the single CTA with dual CTAs**

  Locate the `<!-- CTA Button -->` block (around line 1282):
  ```html
  <!-- CTA Button -->
  <div class="intro-cta" style="text-align: center; display: block; padding: 28px 40px;">
    <div style="text-align: center;">
      <p style="font-size:0.92rem;color:var(--text-muted);margin-bottom:16px;text-align: center;">Proses pengisian borang ini akan mengambil masa lebih kurang <strong>15–20 minit</strong> sahaja.</p>
    </div>
    <div style="text-align: center;">
      <button class="btn btn-gold btn-lg" id="btn-start-form" onclick="startFormWithBusinessType()" disabled style="display: block; margin: 0 auto; position: relative; overflow: hidden; transform: translateZ(0); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
        <span style="position: relative; z-index: 1;">MULA ISI BORANG PERMOHONAN &rarr;</span>
        <span style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transform: translateX(-100%); transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); z-index: 0;"></span>
      </button>
    </div>
  </div>
  ```

  Replace the entire block with:
  ```html
  <!-- CTA — Dual entry: Isi Pintar vs Manual -->
  <div class="intro-cta" style="padding: 20px 24px 28px;">
    <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:12px;text-align:center;">
      Proses pengisian borang mengambil masa lebih kurang <strong>15–20 minit</strong>.
    </p>
    <div class="welcome-cta-row">
      <button class="btn-isi-pintar" id="btn-isi-pintar" onclick="openIsiPintar()" disabled>
        📄 Isi Pintar
        <span class="cta-sub">Muat naik IC &amp; SSM — AI isi borang untuk anda</span>
      </button>
      <button class="btn-isi-manual" id="btn-start-form" onclick="startFormWithBusinessType()" disabled>
        ✏️ Isi Manual
        <span class="cta-sub">Isi borang sendiri langkah demi langkah</span>
      </button>
    </div>
    <p style="font-size:0.72rem;color:var(--text-muted);text-align:center;margin-top:10px;">
      Pilih <strong>Isi Pintar</strong> untuk pengalaman lebih cepat dan moden.
    </p>
  </div>
  ```

- [ ] **Step 3: Enable both buttons when business type is selected**

  In `handleBusinessTypeChange` (line ~2225 in `borang.html`), make these two targeted edits:

  **Edit A** — line ~2234, in the `if (!selectedType)` early-return block.
  Change:
  ```javascript
  startBtn.disabled = true;
  return;
  ```
  To:
  ```javascript
  startBtn.disabled = true;
  const ipBtn = document.getElementById('btn-isi-pintar');
  if (ipBtn) ipBtn.disabled = true;
  return;
  ```

  **Edit B** — line ~2276, where the button is enabled after a valid selection.
  Change:
  ```javascript
  // Enable start button
  startBtn.disabled = false;
  ```
  To:
  ```javascript
  // Enable start button and Isi Pintar
  startBtn.disabled = false;
  const ipBtn2 = document.getElementById('btn-isi-pintar');
  if (ipBtn2) ipBtn2.disabled = false;
  ```

- [ ] **Step 4: Test in browser**
  - Open `borang.html`, see checklist before business type dropdown
  - Select a business type → both buttons enable
  - Clear selection → both buttons disable
  - "Isi Manual" button starts the form as before

- [ ] **Step 5: Commit**
  ```bash
  git add borang.html
  git commit -m "feat(isi-pintar): add doc checklist and dual CTA (Isi Pintar / Isi Manual) to welcome screen"
  ```

---

## Task 4: Add Isi Pintar Upload Overlay HTML

**Files:**
- Modify: `borang.html` — just before `</body>` tag (bottom of file)

- [ ] **Step 1: Locate `</body>` tag**

  Search for `</body>` at the bottom of `borang.html`.

- [ ] **Step 2: Insert overlay HTML before `</body>`**

  ```html
  <!-- ========== ISI PINTAR UPLOAD OVERLAY ========== -->
  <div class="isi-pintar-overlay" id="isi-pintar-overlay" role="dialog" aria-modal="true" aria-labelledby="isi-pintar-title">
    <div class="isi-pintar-panel">
      <button class="isi-pintar-close" onclick="closeIsiPintar()" aria-label="Tutup">&times;</button>

      <h3 id="isi-pintar-title">📄 Isi Pintar</h3>
      <p class="panel-sub">Muat naik IC dan Sijil SSM anda. AI akan membaca dan mengisi borang secara automatik.</p>

      <!-- Upload zones -->
      <div class="upload-zone" id="zone-ic">
        <input type="file" id="file-ic" accept="image/*,application/pdf" onchange="onFileSelected('ic', this)">
        <span class="upload-zone-label">🪪 Kad Pengenalan (MyKad)</span>
        <span class="upload-zone-sub">JPG, PNG atau PDF — max 5MB</span>
        <span class="file-name" id="fname-ic"></span>
      </div>

      <div class="upload-zone" id="zone-ssm">
        <input type="file" id="file-ssm" accept="image/*,application/pdf" onchange="onFileSelected('ssm', this)">
        <span class="upload-zone-label">🏢 Sijil Pendaftaran SSM</span>
        <span class="upload-zone-sub">JPG, PNG atau PDF — max 5MB</span>
        <span class="file-name" id="fname-ssm"></span>
      </div>

      <!-- Consent -->
      <div class="consent-row">
        <input type="checkbox" id="consent-ai" onchange="updateAnalyzeBtn()">
        <label for="consent-ai">
          Saya bersetuju dokumen saya diproses oleh AI (<strong>Groq Inc.</strong>) untuk bacaan teks sahaja.
          Imej <strong>tidak disimpan</strong> oleh mana-mana pihak selepas pemprosesan selesai.
        </label>
      </div>

      <!-- Loading state -->
      <div class="isi-pintar-loading" id="isi-pintar-loading">
        <div class="spinner"></div>
        <p style="font-size:0.88rem;color:var(--text-muted);">Sedang menganalisis dokumen anda…<br><span style="font-size:0.78rem;">Ini mungkin mengambil masa 5–15 saat.</span></p>
      </div>

      <!-- Error message -->
      <div class="isi-pintar-error" id="isi-pintar-error"></div>

      <!-- Action buttons -->
      <div id="isi-pintar-actions" style="display:flex;gap:10px;margin-top:4px;">
        <button id="btn-analyze" class="btn-isi-pintar" style="flex:1;" onclick="runIsiPintar()" disabled>
          Analisis Dokumen →
        </button>
        <button onclick="closeIsiPintar()" style="padding:12px 16px;border:1px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:0.85rem;color:var(--text-muted);">
          Batal
        </button>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 3: Test overlay opens/closes**
  - Click "Isi Pintar" button → overlay appears
  - Click × or Batal → overlay closes
  - (JS for `openIsiPintar`/`closeIsiPintar` is added in Task 5)

- [ ] **Step 4: Commit**
  ```bash
  git add borang.html
  git commit -m "feat(isi-pintar): add upload overlay HTML with IC/SSM zones and consent checkbox"
  ```

---

## Task 5: Add Isi Pintar JavaScript Functions

**Files:**
- Modify: `borang.html` — add JS functions after the last `</script>` tag, or inside the existing `<script>` block at the end of the file.

Find the end of the main `<script>` block (search for the last `</script>` in the file). Insert all functions **inside** the script block, just before `</script>`.

- [ ] **Step 1: Add overlay open/close + file selection handlers**

  ```javascript
  /* ============================================================
     ISI PINTAR — SMART DOCUMENT AUTO-FILL
     ============================================================ */

  /** Internal state for Isi Pintar uploads */
  const _ip = { icFile: null, ssmFile: null };

  function openIsiPintar() {
    document.getElementById('isi-pintar-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeIsiPintar() {
    document.getElementById('isi-pintar-overlay').classList.remove('active');
    document.body.style.overflow = '';
    // Reset panel state
    _ip.icFile = null;
    _ip.ssmFile = null;
    document.getElementById('file-ic').value = '';
    document.getElementById('file-ssm').value = '';
    document.getElementById('zone-ic').classList.remove('has-file');
    document.getElementById('zone-ssm').classList.remove('has-file');
    document.getElementById('fname-ic').textContent = '';
    document.getElementById('fname-ssm').textContent = '';
    document.getElementById('consent-ai').checked = false;
    document.getElementById('btn-analyze').disabled = true;
    document.getElementById('isi-pintar-loading').classList.remove('active');
    document.getElementById('isi-pintar-error').classList.remove('active');
    document.getElementById('isi-pintar-actions').style.display = 'flex';
  }

  function onFileSelected(type, input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showIpError('Fail terlalu besar. Saiz maksimum adalah 5MB.');
      input.value = '';
      return;
    }
    if (type === 'ic') {
      _ip.icFile = file;
      document.getElementById('zone-ic').classList.add('has-file');
      document.getElementById('fname-ic').textContent = '✓ ' + file.name;
    } else {
      _ip.ssmFile = file;
      document.getElementById('zone-ssm').classList.add('has-file');
      document.getElementById('fname-ssm').textContent = '✓ ' + file.name;
    }
    updateAnalyzeBtn();
  }

  function updateAnalyzeBtn() {
    const ready = _ip.icFile && _ip.ssmFile && document.getElementById('consent-ai').checked;
    document.getElementById('btn-analyze').disabled = !ready;
  }

  function showIpError(msg) {
    const el = document.getElementById('isi-pintar-error');
    el.textContent = msg;
    el.classList.add('active');
  }
  ```

- [ ] **Step 2: Add image compression helper**

  ```javascript
  /**
   * Compress/resize an image or PDF-first-page to a base64 JPEG string.
   * For PDF files, converts the first page via canvas (requires browser PDF rendering).
   * Falls back to direct base64 encoding if canvas fails.
   * @param {File} file - Image or PDF file
   * @param {number} maxPx - Maximum dimension in pixels (default 1024)
   * @returns {Promise<string>} base64 data URL (image/jpeg)
   */
  function compressImage(file, maxPx = 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        // PDF: return as-is (Groq Vision can handle PDF data URLs)
        if (file.type === 'application/pdf') {
          resolve(dataUrl);
          return;
        }
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(dataUrl); // fallback: use original
        img.src = dataUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  ```

- [ ] **Step 3: Add Groq Vision API call helper**

  ```javascript
  /**
   * Send an image to Groq Vision API with a given prompt.
   * @param {string} base64DataUrl - data:image/... or data:application/pdf;...
   * @param {string} prompt - Extraction prompt
   * @returns {Promise<object>} Parsed JSON response from model
   */
  async function callGroqVision(base64DataUrl, prompt) {
    if (!GROQ_KEY) throw new Error('GROQ_KEY tidak dikonfigurasi.');

    // Extract mime type and base64 data from data URL
    const [header, base64Data] = base64DataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)[1];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
          ]
        }],
        temperature: 0.1,
        max_tokens: 512
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Groq API error ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Extract JSON from response (model sometimes wraps in markdown)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) throw new Error('Respons AI tidak dalam format yang dijangka.');
    return JSON.parse(jsonMatch[1]);
  }
  ```

- [ ] **Step 4: Add IC extraction function**

  ```javascript
  /**
   * Extract data from a MyKad image.
   * @param {string} base64DataUrl
   * @returns {Promise<{nama:string, no_ic:string, alamat:string, poskod:string, bandar:string, negeri:string}>}
   */
  async function extractFromIC(base64DataUrl) {
    const prompt = `Kamu adalah sistem ekstrak data dari MyKad Malaysia.
  Baca imej kad pengenalan ini dan kembalikan JSON berikut SAHAJA (tiada penjelasan lain):
  {
    "nama": "nama penuh seperti di IC huruf besar",
    "no_ic": "nombor IC format XXXXXX-XX-XXXX",
    "alamat": "alamat penuh seperti di IC",
    "poskod": "5 digit poskod sahaja",
    "bandar": "nama bandar",
    "negeri": "nama negeri penuh"
  }
  Jika sesuatu medan tidak dapat dibaca atau tidak kelihatan, gunakan nilai null.
  Kembalikan JSON sahaja — tiada teks lain.`;

    return callGroqVision(base64DataUrl, prompt);
  }
  ```

- [ ] **Step 5: Add SSM extraction function**

  ```javascript
  /**
   * Extract data from an SSM registration certificate.
   * @param {string} base64DataUrl
   * @returns {Promise<{nama_perniagaan:string, no_pendaftaran:string, tarikh_daftar:string, tarikh_luput:string, jenis_entiti:string, aktiviti:string, alamat:string}>}
   */
  async function extractFromSSM(base64DataUrl) {
    const prompt = `Kamu adalah sistem ekstrak data dari sijil pendaftaran perniagaan SSM Malaysia.
  Baca dokumen ini dan kembalikan JSON berikut SAHAJA (tiada penjelasan lain):
  {
    "nama_perniagaan": "nama perniagaan berdaftar",
    "no_pendaftaran": "nombor pendaftaran SSM",
    "tarikh_daftar": "tarikh pendaftaran format DD/MM/YYYY",
    "tarikh_luput": "tarikh luput format DD/MM/YYYY atau null jika tiada",
    "jenis_entiti": "Enterprise atau Perkongsian atau Sdn Bhd atau Bhd atau Koperasi",
    "aktiviti": "penerangan aktiviti atau kod perniagaan",
    "alamat": "alamat perniagaan berdaftar penuh"
  }
  Jika sesuatu medan tidak dapat dibaca, gunakan null.
  Kembalikan JSON sahaja — tiada teks lain.`;

    return callGroqVision(base64DataUrl, prompt);
  }
  ```

- [ ] **Step 6: Add field mapping + auto-fill function**

  ```javascript
  /**
   * Derive gender from IC number last digit (odd = Lelaki, even = Perempuan).
   * @param {string} icNum - IC number string
   * @returns {'Lelaki'|'Perempuan'|null}
   */
  function genderFromIC(icNum) {
    if (!icNum) return null;
    const digits = icNum.replace(/\D/g, '');
    if (digits.length < 12) return null;
    return parseInt(digits[11], 10) % 2 === 1 ? 'Lelaki' : 'Perempuan';
  }

  /**
   * Convert DD/MM/YYYY → YYYY-MM-DD for date inputs.
   * @param {string} dmyStr
   * @returns {string|null}
   */
  function dmyToIso(dmyStr) {
    if (!dmyStr) return null;
    const m = dmyStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (!m) return null;
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }

  /**
   * Apply a single extracted value to a form field by ID.
   * Tracks filled fields in state.autoFilledFields.
   * @param {string} fieldId - DOM element id
   * @param {string|null} value - Value to set
   */
  function applyField(fieldId, value) {
    if (!value) return;
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.value = value;
    el.classList.add('autofilled');
    // Remove highlight when user edits
    el.addEventListener('input', () => el.classList.remove('autofilled'), { once: true });
    if (!state.autoFilledFields.includes(fieldId)) {
      state.autoFilledFields.push(fieldId);
    }
  }

  /**
   * Map extracted IC + SSM data to form fields and apply.
   * @param {object|null} icData
   * @param {object|null} ssmData
   */
  function mapExtractedToForm(icData, ssmData) {
    // From IC
    if (icData) {
      applyField('nama_penuh_ic', icData.nama);
      applyField('no_kad_pengenal', icData.no_ic ? icData.no_ic.replace(/\D/g,'').replace(/(\d{6})(\d{2})(\d{4})/, '$1-$2-$3') : null);
      applyField('alamat', icData.alamat);
      applyField('poskod', icData.poskod);
      applyField('bandar', icData.bandar);
      applyField('negeri', icData.negeri);

      // Gender — derived from IC number (no OCR uncertainty)
      const gender = genderFromIC(icData.no_ic);
      if (gender) {
        // jantina is a select element
        const jantina = document.getElementById('jantina');
        if (jantina) {
          jantina.value = gender;
          jantina.classList.add('autofilled');
          if (!state.autoFilledFields.includes('jantina')) state.autoFilledFields.push('jantina');
        }
      }
    }

    // From SSM
    if (ssmData) {
      applyField('jenama', ssmData.nama_perniagaan);
      applyField('no_pendaftaran', ssmData.no_pendaftaran);
      applyField('aktiviti_perniagaan', ssmData.aktiviti);
      applyField('alamat_perniagaan', ssmData.alamat);

      const tDaftar = dmyToIso(ssmData.tarikh_daftar);
      const tLuput = dmyToIso(ssmData.tarikh_luput);
      applyField('tarikh_daftar', tDaftar);
      applyField('tarikh_luput', tLuput);

      // Map jenis_entiti string to select value
      if (ssmData.jenis_entiti) {
        const raw = ssmData.jenis_entiti.toLowerCase();
        const jenisMap = {
          'enterprise': 'Enterprise',
          'milikan tunggal': 'Enterprise',
          'perkongsian': 'Perkongsian',
          'sdn bhd': 'Sdn. Bhd.',
          'sdn. bhd': 'Sdn. Bhd.',
          'bhd': 'Bhd.',
          'koperasi': 'Koperasi',
        };
        for (const [key, val] of Object.entries(jenisMap)) {
          if (raw.includes(key)) {
            applyField('jenis_entiti', val);
            break;
          }
        }
      }
    }

    state.isiPintarUsed = true;
  }
  ```

- [ ] **Step 7: Add main `runIsiPintar()` orchestrator**

  ```javascript
  /**
   * Main Isi Pintar handler — compresses images, calls Groq, applies auto-fill, starts form.
   */
  async function runIsiPintar() {
    // Clear previous error
    document.getElementById('isi-pintar-error').classList.remove('active');

    // Show loading, hide buttons
    document.getElementById('isi-pintar-loading').classList.add('active');
    document.getElementById('isi-pintar-actions').style.display = 'none';

    try {
      // Parallel compress + extract
      const [icB64, ssmB64] = await Promise.all([
        compressImage(_ip.icFile),
        compressImage(_ip.ssmFile)
      ]);

      const [icResult, ssmResult] = await Promise.allSettled([
        extractFromIC(icB64),
        extractFromSSM(ssmB64)
      ]);

      const icData  = icResult.status  === 'fulfilled' ? icResult.value  : null;
      const ssmData = ssmResult.status === 'fulfilled' ? ssmResult.value : null;

      if (!icData && !ssmData) {
        throw new Error('Tidak dapat membaca kedua-dua dokumen. Sila cuba semula atau isi borang secara manual.');
      }

      // Close overlay, apply fill, start form
      closeIsiPintar();
      mapExtractedToForm(icData, ssmData);
      startFormWithBusinessType();

      // Show toast with count of filled fields
      const count = state.autoFilledFields.length;
      if (count > 0 && typeof showToast === 'function') {
        showToast(`✓ ${count} ruangan telah diisi automatik. Semak dan betulkan jika perlu.`, 'success');
      }

    } catch (err) {
      // Show error in panel, restore buttons
      document.getElementById('isi-pintar-loading').classList.remove('active');
      document.getElementById('isi-pintar-actions').style.display = 'flex';
      const msg = err.message || 'Ralat tidak diketahui.';
      showIpError('⚠️ ' + msg + ' Anda boleh tutup dan isi borang secara manual.');
    }
  }
  ```

- [ ] **Step 8: Close overlay on backdrop click**

  Add after the `closeIsiPintar` function:
  ```javascript
  // Close overlay when clicking the dark backdrop (not the panel itself)
  document.getElementById('isi-pintar-overlay')
    .addEventListener('click', function(e) {
      if (e.target === this) closeIsiPintar();
    });
  ```

- [ ] **Step 9: Test end-to-end in browser**
  - Open `borang.html`
  - Select a business type → both buttons enable
  - Click "Isi Pintar" → overlay appears
  - Upload IC + SSM images, check consent → "Analisis Dokumen" button enables
  - If GROQ_KEY empty: expect an error message "GROQ_KEY tidak dikonfigurasi" — form stays open, user can batal
  - If GROQ_KEY set: extraction runs, overlay closes, form opens with amber-highlighted fields
  - Check browser console: no JS errors

- [ ] **Step 10: Commit**
  ```bash
  git add borang.html
  git commit -m "feat(isi-pintar): add Groq Vision extraction, image compression, field mapping, and auto-fill logic"
  ```

---

## Task 6: Add Autofill Badge to Form Labels (Visual Polish)

**Files:**
- Modify: `borang.html` — JS functions

After `applyAutoFill` sets fields, it would also be nice to show a small "✓ Diisi automatik" badge next to the label of filled fields. This is optional polish.

- [ ] **Step 1: Enhance `applyField` to add badge to sibling label**

  Locate the `applyField` function added in Task 5, Step 6.
  Replace the function body with:

  ```javascript
  function applyField(fieldId, value) {
    if (!value) return;
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.value = value;
    el.classList.add('autofilled');
    el.addEventListener('input', () => {
      el.classList.remove('autofilled');
      // Remove badge too
      const badge = el.closest('.form-group, .field')?.querySelector('.autofill-badge');
      if (badge) badge.remove();
    }, { once: true });

    // Add badge to label in same .form-group or .field
    const container = el.closest('.form-group') || el.closest('.field');
    if (container) {
      const label = container.querySelector('label');
      if (label && !label.querySelector('.autofill-badge')) {
        const badge = document.createElement('span');
        badge.className = 'autofill-badge';
        badge.textContent = '✓ Auto';
        label.appendChild(badge);
      }
    }

    if (!state.autoFilledFields.includes(fieldId)) {
      state.autoFilledFields.push(fieldId);
    }
  }
  ```

- [ ] **Step 2: Test badge appears on auto-filled fields**
  - After running Isi Pintar, check that labels like "Nama Penuh" show "✓ Auto" badge
  - Type in the field → badge disappears, amber highlight removed

- [ ] **Step 3: Commit**
  ```bash
  git add borang.html
  git commit -m "feat(isi-pintar): add Auto badge to labels of auto-filled fields"
  ```

---

## Task 7: Final Verification

- [ ] **Step 1: Test with GROQ_KEY empty (no key)**
  - Click Isi Pintar, upload files, check consent, click Analisis
  - Expect: error message "GROQ_KEY tidak dikonfigurasi. Sila isi secara manual."
  - Buttons reappear, user can click Batal → manual form works

- [ ] **Step 2: Test "Isi Manual" still works**
  - Select business type → click "Isi Manual" → form starts normally
  - No auto-fill, no amber highlights, no regressions

- [ ] **Step 3: Test document checklist is visible on welcome screen**
  - Refresh page — checklist shows before any selection
  - All 3 wajib + 4 tambahan items visible
  - Format note at bottom

- [ ] **Step 4: Test responsive layout**
  - Narrow browser to < 520px → two CTA buttons stack vertically
  - Isi Pintar overlay fits on mobile screen

- [ ] **Step 5: Test file size guard**
  - Upload a file > 5MB → error "Fail terlalu besar"
  - Upload a valid file → zone turns to `has-file` state, filename shown

- [ ] **Step 6: Test backdrop close**
  - Open overlay → click dark backdrop area → closes cleanly, state reset

- [ ] **Step 7: Final commit**
  ```bash
  git add borang.html
  git commit -m "feat(isi-pintar): complete smart document auto-fill feature — welcome checklist, Groq Vision extraction, amber autofill highlight"
  ```

---

## Summary

| Task | Changes |
|------|---------|
| T1 | CSS: autofilled, upload overlay, dual CTAs |
| T2 | Config: GROQ_KEY, state.autoFilledFields |
| T3 | HTML: doc checklist, dual CTA buttons |
| T4 | HTML: upload overlay (IC + SSM zones, consent, loading) |
| T5 | JS: openIsiPintar, compressImage, callGroqVision, extractFromIC, extractFromSSM, mapExtractedToForm, runIsiPintar |
| T6 | JS: autofill-badge polish on field labels |
| T7 | Verification tests |

**All changes in one file: `borang.html`**
