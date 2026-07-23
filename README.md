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
  - Sokongan OCR untuk slip pembayaran
  - Antaramuka dalam Bahasa Malaysia sepenuhnya
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
- bcryptjs (hash kata laluan)
- pdf-lib (penjanaan PDF borang)
- nodemailer (SMTP untuk emel dalam Edge Functions)

## 📁 Struktur Fail
```
index.html              ← Aplikasi penuh (satu fail)
borang.html            ← Borang permohonan keahlian
receipt-pv-ui.js       ← Komponen UI sistem Resit & Baucar
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
docs/                  ← Dokumentasi projek
  plans/               ← Pelan pelaksanaan
    feature-pdf-workflow-supabase-1.md ← Pelan PDF workflow
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

## 📝 Perubahan Terkini (Julai 2026)

### Vengence UI Design System (23 Julai 2026) - Live Deployment ✅
- **Live URL:** https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/
- **Commit:** 7683055 - Documentation update to trigger deployment
- **Button Shine Effect:**
  - Applied `.btn-shine` class to all interactive buttons across index.html and borang.html
  - Modern button shine effect with gradient background and hover animation
  - Consistent styling for login, logout, modal action, and all CTA buttons
  - Maintained corporate DPMM blue color scheme and accessibility standards
- **Status:** Committed and pushed to main branch

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
