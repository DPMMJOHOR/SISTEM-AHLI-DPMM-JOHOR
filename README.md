# Sistem Pengurusan Ahli — DPMM Negeri Johor

Sistem pengurusan ahli berasaskan web untuk Dewan Perniagaan Melayu Malaysia (DPMM) Negeri Johor.

## 🌐 Live App
**Live URL:** https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/
- **Main Dashboard:** https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/index.html
- **Membership Form:** https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html

## 📋 Ciri-ciri
- Dashboard ringkasan ahli
- Senarai ahli dengan carian & penapis
- Pengurusan mengikut daerah
- Penjejakan yuran & SSM
- Eksport CSV
- Data langsung dari Supabase
- **Sistem Resit & Baucar Pembayaran** (baru ditambah)
  - Jana resit yuran keahlian
  - Cipta baucar pembayaran pihak ketiga
  - Papan pemuka kelulusan
  - Sokongan OCR untuk slip pembayaran (imej dan PDF)
  - Bukti pembayaran disimpan secara kekal untuk audit
  - Laporan resit dengan penapis bulan/tahun dan eksport CSV
  - Antaramuka dalam Bahasa Malaysia sepenuhnya
- **Sistem Perakaunan** (baru ditambah)
  - Pengurusan akaun bank (CRUD penuh)
  - Pengurusan akaun tunai (petty cash, safe, drawer)
  - Rekod pendapatan dengan kategori pelbagai (Yuran, Sumbangan, Sewa, dll)
  - Aliran kerja kelulusan (pending → approved/rejected)
  - Papan pemuka KPI (pendapatan bulanan, baki bank, baki tunai)
  - Muat naik dokumen bank statement
  - Sokongan ahli berkaitan dengan rekod pendapatan
  - Sejarah kelulusan lengkap
  - Kawalan akses berdasarkan peranan (admin, bendahari, ajk)
- **Sistem Permohonan Keahlian** (borang.html)
  - Borang permohonan keahlian dalam talian
  - Pengesahan dokumen automatik
  - Penjanaan PDF borang dengan header pengesahan dalam talian
  - **Penyimpanan PDF di Supabase Storage** dengan RLS policies
  - **Hantar emel dengan lampiran PDF** melalui Supabase Edge Functions (Gmail SMTP)
  - **Penonton PDF interaktif** di halaman kejayaan dan admin panel
  - Notifikasi emel melalui EmailJS (fallback)
  - Sistem audit log untuk keselamatan

## 🛠️ Teknologi
- HTML / CSS / JavaScript (satu fail)
- Supabase (pangkalan data & Storage)
- Supabase Edge Functions (hantar emel dengan lampiran PDF)
- EmailJS (hantar emel - fallback)
- Tesseract.js (OCR untuk slip pembayaran)
- pdf.js (rasterisasi PDF untuk OCR)
- bcryptjs (hash kata laluan)
- pdf-lib (penjanaan PDF borang)
- nodemailer (SMTP untuk emel dalam Edge Functions)

## 📁 Struktur Fail
```
index.html              ← Aplikasi penuh (satu fail)
borang.html            ← Borang permohonan keahlian
receipt-pv-ui.js       ← Komponen UI sistem Resit & Baucar
accounting-ui.js       ← Komponen UI sistem Perakaunan
src/
  config-loader.js      ← Konfigurasi Supabase
  audit-logger.js      ← Sistem log audit
  sentry-ai-wrapper.js ← Integrasi AI dengan Sentry
  modules/
    unified-auth.js    ← Sistem pengesahan terpadu
supabase/
  functions/           ← Supabase Edge Functions
    email-with-pdf/    ← Edge Function untuk emel dengan lampiran PDF
    ai-proxy/          ← Edge Function untuk AI (Groq/Gemini)
  migrations/          ← Skema pangkalan data Supabase
    storage_rls_policies.sql ← RLS policies untuk bucket permohonan-dokumen
    add_pdf_url_columns.sql   ← Kolom untuk tracking PDF
    accounting-cash-accounts-alter.sql ← Kolom untuk akaun tunai
docs/                  ← Dokumentasi projek
  plans/               ← Pelan pelaksanaan
    feature-pdf-workflow-supabase-1.md ← Pelan PDF workflow
  ACCOUNTING-USER-GUIDE.md ← Panduan pengguna sistem perakaunan
README.md              ← Dokumentasi ini
```

## 🚀 Cara Deploy ke GitHub Pages

1. **Buat repositori baru** di GitHub (contoh: `sistem-ahli-dpmm-johor`)
2. **Upload** fail `index.html` ke repositori
3. Pergi ke **Settings → Pages**
4. Di bawah *Source*, pilih **Deploy from a branch**
5. Pilih branch `main` dan folder `/ (root)`
6. Klik **Save**
7. Tunggu beberapa minit — URL akan muncul di bahagian Pages

## 🔐 Keselamatan
- Supabase RLS (Row Level Security) diaktifkan
- Akses baca: awam (anon)
- Akses tulis: pengguna yang log masuk sahaja
- Kata laluan login disimpan dalam fail HTML (tukar jika perlu)
- Sistem log audit untuk jejak aktiviti penting
- Hash kata laluan menggunakan bcryptjs

## 📝 Perubahan Terkini (Ogos 2026)

### Permohonan Ahli — RLS Fix, Document Viewer & Checklist Report (15 Ogos 2026)
- **RLS Policy Fix (`permohonan-dokumen` bucket):**
  - Migration `supabase/migrations/20260815000000_fix_permohonan_dokumen_rls.sql` fixes broken storage RLS policies blocking admin access to applicant documents
- **Delete Button Fix (Permohonan Ahli tab):**
  - Fixed delete action for permohonan records that was silently failing
- **Document/Photo/Slip Viewer Fix:**
  - `viewAdminDokumen()` now always opens via a freshly-signed Supabase Storage URL
  - Handles both the new storage-path format and legacy broken public URLs (extracts path after bucket name so older uploads remain viewable)
- **New: Document Checklist Report ("Jana Laporan" button):**
  - Added to Permohonan Ahli topbar next to "QR Borang"
  - `generatePermohonanDocReport()` prints an A4-landscape checklist — one row per applicant, one column per required document (Borang PDF, gambar, SSM sijil, M&AA, Borang 9/24/49, sijil profesional, slip bayaran, etc.), with a checkmark if uploaded
  - Fixed mm-based column widths (`<colgroup>`) so all 23 columns fit exactly within A4 landscape printable width
  - Applicant Ref ID, business name, and status rendered in uppercase
  - Official DPMM logo included in the report header (reuses `DPMM_LOGO` constant)
- **Known issue (unresolved):** A large vertical gap appears between the page topbar and the summary bar/KPI cards on the Permohonan Ahli page; root cause not yet identified from static code review — pending live DevTools inspection.

### UI/UX Enhancements & OCR Improvements (7 Ogos 2026)
- **Perakaunan Tab UI Fixes:**
  - Reduced counter font size from 38px to 24px for better visual hierarchy
  - Reduced sidebar navigation font size from 10px to 9px
  - Increased organization logo size from 50px to 70px
  - Increased organization name font size from 14px to 18px
- **Accounting Tab Delete Functionality:**
  - Added delete button for pending accounting entries
  - Delete function with confirmation dialog
  - Only visible to users with write permissions (admin, bendahari)
- **OCR Enhancements for Bank Statements:**
  - Multi-page PDF processing (processes ALL pages, not just first page)
  - Extracts ALL transactions (both IN and OUT) from bank statements
  - Auto-selects largest transaction when multiple found
  - Stores extracted transactions globally for future use
  - Progress tracking across all pages
- **Data Cleanup:**
  - Removed test 250k bank statement entry
- **Status:** All changes committed and pushed to GitHub (commit 7c35e80)

### Comprehensive System Upgrade (6 Ogos 2026)
- **Security Enhancement (U11):**
  - RLS Policy Migration: Replace anon role with authenticated in accounting tables
  - All accounting tables now require authenticated role for secure access
  - Tables updated: cash_accounts, bank_accounts, accounting_entries, cash_transactions, chart_of_accounts, journal_entries, journal_entry_lines
- **UI Enhancement (U20):**
  - Removed all emoji icons from index.html and receipt-pv-ui.js
  - Replaced emoji crosses with multiplication sign (×)
  - Cleaned WhatsApp modal and QR code modal text
  - Professional UI without emoji clutter
- **Accounting Consolidation (U22):**
  - Single PERAKAUNAN tab already implemented
  - Unified accounting interface for receipts and payment vouchers
  - Role-based visibility (admin, bendahari, ajk)
- **AIMAN Chatbot Enhancements (U1-U8):**
  - All 8 features already implemented in borang.html
  - Conversation context, quick-reply buttons, animated typing indicator
  - Smooth animations, step-aware greetings, markdown stripping
  - Accessibility improvements and error handling
- **Branch:** feat/comprehensive-system-upgrade
- **Status:** Pushed to GitHub, PR ready for merge

### Sistem Perakaunan (5 Ogos 2026)
- **Phase 2: UI & Bank Accounts Management**
  - Halaman perakaunan baru dengan papan pemuka KPI
  - Pengurusan akaun bank (CRUD penuh)
  - Borang rekod pendapatan dengan medan bersyarat
  - Kategori pendapatan: Yuran, Yuran Pendaftaran, Sumbangan, Sewa, Bank Statement, Lain-lain
  - Sokongan muat naik dokumen bank statement
  - Kaitan dengan ahli untuk rekod pendapatan
- **Phase 3: Cash Accounts Management**
  - Pengurusan akaun tunai (petty cash, safe, drawer)
  - Medan: nama akaun, jenis, lokasi, pengurus, baki, status aktif
  - KPI baki tunai dipaparkan di papan pemuka
- **Phase 4: Approval Workflow**
  - Aliran kerja kelulusan (pending → approved/rejected)
  - Modal semak dengan sejarah kelulusan
  - Sebab penolakan untuk rekod ditolak
  - Kawalan akses berdasarkan peranan (admin, bendahari, ajk)
- **Database Schema**
  - bank_accounts: id, bank_name, account_number, account_type, balance, is_main
  - cash_accounts: id, account_name, account_type, balance, location, custodian, is_active
  - accounting_entries: id, entry_number, entry_date, income_category, amount, member_id, approval_status
  - approval_history: id, voucher_id, entity_type, action, performed_by, comments
- **Storage**
  - bank-statements bucket untuk dokumen bank statement
- **Migration Files**
  - accounting-cash-accounts-alter.sql: Tambah kolom ke cash_accounts
- **UI Files**
  - accounting-ui.js: Komponen UI sistem perakaunan

### OpenRouter AI Migration (30 Julai 2026)
- **AIMAN Chatbot Migration:**
  - Migrated from Groq llama-3.3-70b-versatile to OpenRouter openai/gpt-4o-mini
  - Improved multilingual support (Bahasa Melayu + English)
  - Better reasoning capabilities for business guidance
  - Cost-effective with strong performance
- **Isi Pintar OCR Migration:**
  - Migrated from Groq qwen/qwen3.6-27b to OpenRouter qwen/qwen3-vl-235b-a22b-instruct
  - Enhanced vision capabilities for OCR
  - Better performance on Malaysian document formats
  - Instruction-tuned for structured JSON output
- **Edge Functions Updated:**
  - ai-proxy: Added OpenRouter provider support with HTTP-Referer and X-Title headers
  - ai-proxy-fixed: Added OpenRouter provider support for vision models
  - Both functions now support: groq, openrouter, gemini providers
  - Logging added for OPENROUTER_API_KEY presence
- **Security:**
  - API keys remain in Supabase Edge Function environment variables
  - No API keys exposed in frontend code
  - CORS handling maintained
  - All existing guardrails preserved
- **Status:** Code changes deployed, awaiting manual testing with valid credentials

### Payment Slip & Receipt Enhancements (28 Julai 2026)
- **PDF Support for Payment Slips:**
  - Upload PDF files for payment slips (previously images only)
  - pdf.js integration to rasterize PDF first page for OCR processing
  - Supports PNG, JPG, JPEG, and PDF formats (max 5MB)
- **Bukti Pembayaran Column:**
  - Added "Bukti Pembayaran" column in receipts list
  - Shows view button for available proof-of-payment or "tiada bukti pembayaran" message
- **Receipt Detail Modal:**
  - Click receipt row to view detailed modal with all receipt fields
  - Displays linked proof-of-payment with view button
  - Shows "Dijana Oleh" field indicating user who created the receipt
  - Mimics member detail modal design for consistency
- **Report Generation:**
  - Month/year selector for filtering receipts
  - CSV export with all receipt details
  - Summary section with total receipt count and amount
  - Audit-ready reports for any time period
- **Redesigned Receipt Input Panel:**
  - Compact layout to reduce vertical space
  - Upload field moved to top of form
  - Ahli and Nama Penerima on same row
  - Jumlah, Kaedah Pembayaran, and No. Cek/Bank on same row
  - Professional and functional design
- **Default Issued By Text:**
  - Updated to: "Resit dijana secara atas talian dari sistem rasmi DPMM Johor. Tiada tandatangan di perlukan"
  - Signature box width increased to accommodate text

### Vengence UI Design System (23 Julai 2026) - Complete Rollout ✅
- **Live URL:** https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/
- **Final Commit:** f078a50 - Update login logo to new DPMM white background version
- **Button Shine Effect:**
  - Applied `.btn-shine` class to all interactive buttons across index.html and borang.html
  - Modern button shine effect with gradient background and hover animation
  - Consistent styling for login, logout, modal action, and all CTA buttons
  - Maintained corporate DPMM blue color scheme and accessibility standards
- **Login Banner Improvements:**
  - Updated gradient from hardcoded purple (#6C5CE7, #9B8EF5) to DPMM blue variables (var(--primary), var(--primary-dk))
  - Added text-shadow to login banner text for better readability against blue gradient
  - Increased text opacity for improved contrast
- **Logo Update:**
  - Replaced dpmm-logo-color.png with LOGO Bulat_ DPMMNJ_WHITEBGRD-01.png
  - New white background logo for better visibility on DPMM blue gradient
- **Status:** Fully deployed and live on GitHub Pages
- **Commits:**
  - 4cd5b79: docs: add commit reference to trigger GitHub Pages deployment
  - 39ec1ff: fix: update login banner gradient to use DPMM blue colors
  - 41cac8c: fix: add text shadow to login banner text for better readability
  - f078a50: feat: update login logo to new DPMM white background version

### PDF Workflow Enhancement (19 Julai 2026)
- **PDF Header Addition:**
  - Header pengesahan dalam talian ditambah ke semua 6 halaman PDF (top right)
  - URL: https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html
- **Supabase Storage Integration:**
  - PDF borang disimpan secara automatik di bucket `permohonan-dokumen`
  - RLS policies dikonfigurasi untuk keselamatan storage
  - Schema database dikemaskini dengan kolom `pdf_url`, `pdf_uploaded_at`, `pdf_file_size`
- **Email with PDF Attachment:**
  - Edge Function `email-with-pdf` dibuat untuk hantar emel dengan lampiran PDF
  - Menggunakan Gmail SMTP untuk penghantaran emel
  - Fallback ke EmailJS jika Edge Function gagal
- **PDF Viewer:**
  - Penonton PDF interaktif di halaman kejayaan (borang.html)
  - Penonton PDF di admin panel (index.html) dalam modal Semak
  - Fungsi cetak dan muat turun disediakan
- **Manual Deployment Required:**
  - Deploy migrations using Supabase CLI: `supabase db push`
  - This ensures SQL runs with sufficient privileges to modify storage.objects
  - Deploy Edge Function: `supabase functions deploy email-with-pdf`
  - Configure environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)

### EmailJS Integration & Security Enhancements (18 Julai 2026)
- **EmailJS Integration:**
  - Migrasi dari Resend ke EmailJS untuk notifikasi emel client-side
  - EmailJS Service ID: service_a3kt2zm
  - EmailJS Public Key: Bq94zNa6cDvdTUCU8
  - Template emel untuk admin dan pemohon
  - Resend kekal untuk endpoint server-side /api/send-email
- **Security Improvements:**
  - Groq API diproxy melalui /api/groq untuk keselamatan
  - RLS policies komprehensif untuk PERMOHONAN_AHLI
  - Pengesahan format IC dalam RLS (XXXXXX-XX-XXXX atau 12 digit)
  - Index prestasi untuk pertanyaan biasa
- **UI Fixes:**
  - Dropdown menu eksport diperbaiki di index.html
  - Event listener pemilih jenis perniagaan diperbaiki di borang.html
- **Testing:**
  - Suite ujian komprehensif dibuat (test-comprehensive.js)
  - Semua 15 ujian lulus (100% kadar kejayaan)
- **Deployment:**
  - Changes committed and pushed to GitHub main branch
  - Live URL updated and verified

### AIMAN Language Improvements & Security Fixes
- **English Language Support:** AIMAN kini boleh bertindak balas dalam Bahasa Inggeris apabila pengguna bertanya dalam Bahasa Inggeris
- **Conversational Tone:** Persona AIMAN dikemas kini menjadi lebih mesra dan mudah didekati
- **Security Fixes:**
  - GROQ_KEY validation diperbaiki untuk mengelakkan kegagalan API
  - CSP frame-src diperbaiki untuk membenarkan Turnstile CAPTCHA
  - Komen SUPABASE_KEY diperbetulkan untuk mengelakkan kekeliruan
- **Branch:** `feat/aiman-language-improvements-security-fixes`
- **Status:** PR #7 dihantar untuk semakan

### UI/UX Improvements - Sistem Resit & Baucar
- Buang ikon emoji dari navigasi panel kiri
- Standardkan margin dan padding menggunakan sistem spacing (8px, 16px, 24px, 32px)
- Tambah hierarki fon dengan Montserrat dan Inter
- Terjemahkan semua teks antaramuka ke Bahasa Malaysia
- Perbaiki susun atur kad, borang, dan jadual
- Antaramuka lebih profesional dan kemas

### Branch Development
- Feature branch: `feat/ui-ux-receipt-pv-improvements`
- Status: Dihantar ke GitHub, menunggu PR dan gabung ke main

## 📁 Struktur Fail
```
index.html    ← Aplikasi penuh (satu fail)
README.md     ← Dokumentasi ini
```
