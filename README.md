# Sistem Pengurusan Ahli — DPMM Negeri Johor

Sistem pengurusan ahli berasaskan web untuk Dewan Perniagaan Melayu Malaysia (DPMM) Negeri Johor.

## 🌐 Live App
Setelah deploy ke GitHub Pages, akses di:
`https://<username>.github.io/<repo-name>/`

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

## 🛠️ Teknologi
- HTML / CSS / JavaScript (satu fail)
- Supabase (pangkalan data)
- EmailJS (hantar emel)
- Tesseract.js (OCR untuk slip pembayaran)
- bcryptjs (hash kata laluan)

## 📁 Struktur Fail
```
index.html              ← Aplikasi penuh (satu fail)
receipt-pv-ui.js       ← Komponen UI sistem Resit & Baucar
src/
  config-loader.js      ← Konfigurasi Supabase
  audit-logger.js      ← Sistem log audit
  modules/
    unified-auth.js    ← Sistem pengesahan terpadu
migrations/             ← Skema pangkalan data Supabase
docs/                  ← Dokumentasi projek
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
