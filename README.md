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
  - Penjanaan PDF borang
  - Notifikasi emel melalui EmailJS
  - Sistem audit log untuk keselamatan

## 🛠️ Teknologi
- HTML / CSS / JavaScript (satu fail)
- Supabase (pangkalan data)
- EmailJS (hantar emel)
- Tesseract.js (OCR untuk slip pembayaran)
- bcryptjs (hash kata laluan)

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
migrations/             ← Skema pangkalan data Supabase
docs/                  ← Dokumentasi projek
  plans/               ← Pelan pelaksanaan
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
