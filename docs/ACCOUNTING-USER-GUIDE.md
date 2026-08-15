# Panduan Pengguna Sistem Perakaunan — DPMM Negeri Johor

**Versi:** 1.1  
**Tarikh:** 7 Ogos 2026  
**Audience:** Admin, Bendahari, AJK DPMM Negeri Johor

---

## PENTING: Status Pelaksanaan

**AMARAN**: Dokumen ini menerangkan ciri-ciri yang dirancang untuk modul perakaunan. Beberapa ciri yang diterangkan di bawah mungkin belum dilaksanakan sepenuhnya dalam pangkalan data semasa.

**Status Semasa (7 Ogos 2026)**:
- Akaun Tunai (cash_accounts): Tersedia (6 akaun aktif)
- Akaun Bank (bank_accounts): Tersedia (1 akaun aktif)
- Rekod Pendapatan (accounting_entries): Tersedia
- Chart of Accounts: Tersedia (40 akaun)
- Journal Entries: BELUM dilaksanakan (0 rekod)
- Receipts: BELUM dilaksanakan (0 rekod)
- Vouchers: BELUM dilaksanakan (0 rekod)
- Spending Limits: Tersedia (6 konfigurasi)
- Aliran Kerja Kelulusan: Bahagian tersedia
- Laporan: KPI asas tersedia, eksport CSV belum dilaksanakan
- **Ciri Baru (7 Ogos 2026):**
  - Fungsi memadam rekod pendapatan (untuk status pending sahaja)
  - OCR dipertingkat untuk pemprosesan multi-halaman PDF
  - Ekstraksi semua transaksi (IN dan OUT) dari bank statement

**Isu Keselamatan**:
- dpmm_templates table: RLS dilumpuhkan (isu kritikal)

**Rancangan Pelaksanaan**:
Satu pelan pelaksanaan komprehensif telah dibuat untuk menyelesaikan semua isu:
- docs/plans/2026-08-06-001-feat-comprehensive-system-upgrade-plan.md

Pelan ini merangkumi:
- Pelengkapkan modul perakaunan (bank_accounts, accounting_entries)
- Peningkatan keselamatan (RLS policies, separation of duties)
- Integrasi OCR untuk bank statement
- Penambahbaikan AIMAN chatbot

---

## Kandungan

1. [Pengenalan](#pengenalan)
2. [Akses dan Keizinan](#akses-dan-keizinan)
3. [Papan Pemuka Perakaunan](#papan-pemuka-perakaunan)
4. [Pengurusan Akaun Bank](#pengurusan-akaun-bank)
5. [Pengurusan Akaun Tunai](#pengurusan-akaun-tunai)
6. [Rekod Pendapatan](#rekod-pendapatan)
7. [Aliran Kerja Kelulusan](#aliran-kerja-kelulusan)
8. [Laporan dan Analisis](#laporan-dan-analisis)
9. [Soalan Lazim (FAQ)](#soalan-lazim-faq)

---

## Pengenalan

Sistem Perakaunan DPMM Negeri Johor adalah modul bersepadu untuk menguruskan kewangan organisasi, termasuk:

- **Pengurusan Akaun Bank** — Tracking akaun bank dan baki
- **Pengurusan Akaun Tunai** — Petty cash, safe, dan drawer
- **Rekod Pendapatan** — Yuran keahlian, sumbangan, sewa, dan lain-lain
- **Aliran Kerja Kelulusan** — Sistem kelulusan berperingkat untuk rekod kewangan
- **Laporan** — KPI dan analisis kewangan

---

## Akses dan Keizinan

### Peranan dan Keizinan

| Peranan | Akses Tulis | Akses Kelulusan | Akses Laporan |
|---------|------------|----------------|---------------|
| Admin | ✅ | ✅ | ✅ |
| Bendahari | ✅ | ✅ | ✅ |
| AJK | ❌ | ✅ | ✅ |

### Keterangan Keizinan

- **Akses Tulis**: Boleh membuat, mengemas kini, dan memadam akaun bank, akaun tunai, dan rekod pendapatan
- **Akses Kelulusan**: Boleh meluluskan atau menolak rekod pendapatan yang tertunda
- **Akses Laporan**: Boleh melihat semua laporan dan KPI

### Cara Mengakses

1. Log masuk ke sistem: https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/index.html
2. Masukkan ID pengguna dan kata laluan
3. Klik menu **"Perakaunan"** di navigasi sebelah kiri
4. Halaman perakaunan akan dipaparkan

---

## Papan Pemuka Perakaunan

### KPI Dipaparkan

Papan pemuka perakaunan memaparkan 4 KPI utama:

1. **Pendapatan Bulan Ini** — Jumlah pendapatan untuk bulan semasa
2. **Jumlah Pendapatan** — Jumlah pendapatan keseluruhan
3. **Baki Bank** — Jumlah baki semua akaun bank aktif
4. **Baki Tunai** — Jumlah baki semua akaun tunai aktif

### Kemas Kini Automatik

- KPI dikemas kini secara automatik apabila:
  - Akaun bank baru ditambah/dikemas kini
  - Akaun tunai baru ditambah/dikemas kini
  - Rekod pendapatan baru dibuat
  - Rekod pendapatan diluluskan

---

## Pengurusan Akaun Bank

### Menambah Akaun Bank

1. Klik butang **"+ Tambah Akaun Bank"** di bahagian "Akaun Bank"
2. Isi borang:
   - **Nama Bank**: Nama bank (cth: Maybank, CIMB)
   - **No. Akaun**: Nombor akaun bank
   - **Jenis Akaun**: Simpanan / Semasa / Fixed Deposit
   - **Baki (RM)**: Baki semasa akaun
   - **Akaun Utama**: Tandakan jika ini akaun utama
3. Klik **"Simpan"**

### Mengemas Kini Akaun Bank

1. Klik butang **"Edit"** pada akaun bank yang ingin dikemas kini
2. Ubah maklumat yang diperlukan
3. Klik **"Simpan"**

### Memadam Akaun Bank

1. Klik butang **"Edit"** pada akaun bank
2. Klik butang **"Padam"** (jika tersedia)
3. Sahkan pemadaman

### Nota Penting

- Hanya satu akaun bank boleh ditandakan sebagai "Akaun Utama"
- Baki akaun dikemas kini secara manual (bukan automatik)
- Akaun bank yang dipadam tidak akan mempengaruhi rekod pendapatan sedia ada

---

## Pengurusan Akaun Tunai

### Menambah Akaun Tunai

1. Klik butang **"+ Tambah Akaun Tunai"** di bahagian "Akaun Tunai"
2. Isi borang:
   - **Nama Akaun**: Nama akaun (cth: Tunai Pejabat, Safe Utama)
   - **Jenis Akaun**: Petty Cash / Safe / Drawer / Lain-lain
   - **Lokasi**: Lokasi fizikal (cth: Pejabat Utama, Laci Bendahari)
   - **Pengurus**: Nama penjaga akaun
   - **Baki (RM)**: Baki semasa akaun
   - **Akaun Aktif**: Tandakan jika akaun masih aktif
3. Klik **"Simpan"**

### Mengemas Kini Akaun Tunai

1. Klik butang **"Edit"** pada akaun tunai yang ingin dikemas kini
2. Ubah maklumat yang diperlukan
3. Klik **"Simpan"**

### Menandakan Akaun Tidak Aktif

1. Klik butang **"Edit"** pada akaun tunai
2. Nyahaktifkan **"Akaun Aktif"**
3. Klik **"Simpan"**

### Nota Penting

- Akaun tunai tidak aktif tidak akan dipaparkan di KPI
- Baki akaun tunai dikemas kini secara manual
- Sejarah akaun tunai disimpan untuk audit

---

## Rekod Pendapatan

### Kategori Pendapatan

Sistem menyokong kategori pendapatan berikut:

1. **Yuran** — Yuran keahlian tahunan
2. **Yuran Pendaftaran** — Yuran pendaftaran ahli baru
3. **Sumbangan** — Sumbangan sukarela
4. **Sewa** — Pendapatan sewa harta
5. **Bank Statement** — Pendapatan dari bank statement
6. **Lain-lain** — Kategori lain

### Membuat Rekod Pendapatan

1. Klik butang **"+ Rekod Pendapatan"**
2. Isi borang:
   - **Tarikh**: Tarikh pendapatan
   - **Kategori**: Pilih kategori pendapatan
   - **Subkategori** (jika diperlukan): Subkategori spesifik
   - **Jumlah (RM)**: Jumlah pendapatan
   - **Penerangan**: Penerangan ringkas
   - **Ahli Berkaitan** (pilihan): Pilih ahli jika berkaitan
   - **Akaun Bank** (pilihan): Pilih akaun bank untuk deposit
   - **Kaedah Pembayaran**: Tunai / Online / Cek
   - **No. Rujukan** (pilihan): Nombor rujukan transaksi
   - **Dokumen Sokongan** (pilihan): Muat naik dokumen bank statement
3. Klik **"Simpan"**

### Medan Bersyarat

Beberapa medan akan muncul berdasarkan kategori yang dipilih:

- **Kategori = Yuran / Yuran Pendaftaran / Sumbangan**:
  - Ahli berkaitan (wajib)
  - Penerangan (wajib)

- **Kategori = Sewa**:
  - Nama Harta (wajib)
  - Penerangan (wajib)

- **Kategori = Bank Statement**:
  - Akaun Bank (wajib)
  - Dokumen Sokongan (wajib)
  - No. Rujukan (wajib)

- **Kategori = Lain-lain**:
  - Penerangan Khas (wajib)

### Muat Naik Dokumen Sokongan

1. Klik butang **"Muat Naik Dokumen"**
2. Pilih fail (PDF, PNG, JPG, JPEG, maks 5MB)
3. Tunggu muat naik selesai
4. Nama fail akan dipaparkan

### Memadam Rekod Pendapatan

**PENTING:** Hanya rekod dengan status "Pending" boleh dipadam.

1. Pergi ke bahagian **"Rekod Pendapatan"**
2. Cari rekod dengan status **"Pending"**
3. Klik butang **"Padam"** pada rekod (hanya kelihatan untuk Admin dan Bendahari)
4. Sahkan pemadaman
5. Rekod akan dipadam secara kekal

**Nota:**
- Rekod yang sudah diluluskan atau ditolak tidak boleh dipadam
- Butang "Padam" hanya kelihatan untuk pengguna dengan keizinan tulis (Admin, Bendahari)
- Tindakan pemadaman tidak boleh diundur

---

## Ciri OCR untuk Bank Statement

### Pemprosesan Multi-Halaman PDF

Sistem kini memproses SEMUA halaman bank statement, bukan hanya halaman pertama:
- Setiap halaman PDF akan dirasterisasi dan diproses dengan OCR
- Teks dari semua halaman akan digabungkan
- Progress bar menunjukkan kemajuan keseluruhan merentasi semua halaman

### Ekstraksi Transaksi

Sistem mengekstrak SEMUA transaksi dari bank statement:
- **Transaksi Masuk (IN):** Penerimaan ke akaun bank
- **Transaksi Keluar (OUT):** Pembayaran dari akaun bank
- Format transaksi dikenal pasti secara automatik
- Semua transaksi disimpan dalam `window.extractedBankTransactions`

### Auto-Isi Borang

Apabila bank statement diproses:
- Sistem akan memilih transaksi terbesar secara automatik
- Borang akan diisi dengan:
  - Tarikh transaksi
  - Jumlah transaksi
  - Nombor rujukan
  - Penerangan
- Pengguna boleh mengubah nilai jika perlu

### Menggunakan Transaksi Lain

Jika transaksi terbesar bukan yang diinginkan:
1. Semak `window.extractedBankTransactions` dalam konsol browser
2. Pilih transaksi yang diinginkan dari senarai
3. Isi borang secara manual dengan nilai transaksi tersebut

### Menyimpan Rekod

1. Semua medan wajib mesti diisi
2. Klik **"Simpan"**
3. Rekod akan disimpan dengan status **"Pending"**
4. Nombor rujukan akan dijana secara automatik (format: DPMMJHR/AC/YYYY-MM-XXXX)

---

## Aliran Kerja Kelulusan

### Status Rekod

Rekod pendapatan mempunyai 3 status:

1. **Pending** — Rekod baru, menunggu kelulusan
2. **Approved** — Rekod diluluskan, akan dimasukkan ke KPI
3. **Rejected** — Rekod ditolak, tidak akan dimasukkan ke KPI

### Meluluskan Rekod

1. Pergi ke bahagian **"Rekod Pendapatan"**
2. Cari rekod dengan status **"Pending"**
3. Klik butang **"Semak"** pada rekod
4. Modal semak akan dipaparkan dengan maklumat lengkap
5. Klik butang **"Luluskan"**
6. Rekod akan bertukar status kepada **"Approved"**
7. KPI akan dikemas kini secara automatik

### Menolak Rekod

1. Pergi ke bahagian **"Rekod Pendapatan"**
2. Cari rekod dengan status **"Pending"**
3. Klik butang **"Semak"** pada rekod
4. Modal semak akan dipaparkan dengan maklumat lengkap
5. Isi **"Sebab Penolakan"**
6. Klik butang **"Tolak"**
7. Rekod akan bertukar status kepada **"Rejected"**
8. Sebab penolakan akan disimpan dalam sejarah

### Sejarah Kelulusan

Setiap rekod menyimpan sejarah kelulusan lengkap:

- Tarikh dan masa tindakan
- Pengguna yang melakukan tindakan
- Jenis tindakan (create, approve, reject)
- Komen/sebab

### Kawalan Akses

- **Admin & Bendahari**: Boleh membuat, meluluskan, dan menolak rekod
- **AJK**: Boleh meluluskan dan menolak rekod sahaja (tidak boleh membuat rekod baru)

---

## Laporan dan Analisis

### Laporan KPI

Papan pemuka menyediakan 4 KPI utama:

1. **Pendapatan Bulan Ini**
   - Jumlah pendapatan untuk bulan semasa
   - Dikemas kini secara automatik
   - Hanya rekod diluluskan dikira

2. **Jumlah Pendapatan**
   - Jumlah pendapatan keseluruhan
   - Termasuk semua bulan
   - Hanya rekod diluluskan dikira

3. **Baki Bank**
   - Jumlah baki semua akaun bank aktif
   - Dikemas kini secara manual melalui pengurusan akaun bank

4. **Baki Tunai**
   - Jumlah baki semua akaun tunai aktif
   - Dikemas kini secara manual melalui pengurusan akaun tunai

### Penapis Rekod

Bahagian "Rekod Pendapatan" menyediakan penapis:

- **Status**: Semua / Pending / Approved / Rejected
- **Kategori**: Semua kategori
- **Tarikh**: Julat tarikh
- **Ahli**: Ahli berkaitan

### Eksport Data

Ciri eksport CSV akan ditambah dalam masa hadapan untuk:
- Laporan pendapatan bulanan
- Laporan pendapatan tahunan
- Laporan mengikut kategori
- Laporan audit

---

## Soalan Lazim (FAQ)

### Q: Bolehkah saya memadam rekod pendapatan yang sudah diluluskan?

**A:** Tidak. Rekod yang sudah diluluskan tidak boleh dipadam untuk integriti audit. Walau bagaimanapun, rekod dengan status "Pending" boleh dipadam oleh Admin dan Bendahari.

### Q: Bagaimana cara memadam rekod pendapatan?

**A:** Untuk memadam rekod pendapatan:
1. Pergi ke bahagian "Rekod Pendapatan"
2. Cari rekod dengan status "Pending"
3. Klik butang "Padam" pada rekod (hanya kelihatan untuk Admin dan Bendahari)
4. Sahkan pemadaman
5. Rekod akan dipadam secara kekal

### Q: Bolehkah AJK memadam rekod pendapatan?

**A:** Tidak. AJK hanya boleh meluluskan atau menolak rekod yang sedia ada. Hanya Admin dan Bendahari boleh memadam rekod (hanya status pending).

### Q: Bagaimana cara mengemas kini baki akaun bank?

**A:** Baki akaun bank dikemas kini secara manual melalui:
1. Klik "Edit" pada akaun bank
2. Ubah nilai "Baki (RM)"
3. Klik "Simpan"

### Q: Bolehkah saya membuat akaun tunai tanpa pengurus?

**A:** Ya, medan "Pengurus" adalah pilihan. Walau bagaimanapun, disarankan untuk mengisi untuk tujuan audit.

### Q: Apa yang berlaku jika saya menolak rekod pendapatan?

**A:** Rekod akan bertukar status kepada "Rejected" dan tidak akan dimasukkan ke KPI. Sebab penolakan akan disimpan dalam sejarah.

### Q: Bolehkah AJK membuat rekod pendapatan baru?

**A:** Tidak. AJK hanya boleh meluluskan atau menolak rekod yang sedia ada. Hanya Admin dan Bendahari boleh membuat rekod baru.

### Q: Berapa saiz maksimum fail untuk muat naik dokumen?

**A:** Saiz maksimum adalah 5MB. Format yang disokong: PDF, PNG, JPG, JPEG.

### Q: Adakah OCR memproses semua halaman bank statement?

**A:** Ya. Sistem kini memproses SEMUA halaman bank statement, bukan hanya halaman pertama. Setiap halaman akan dirasterisasi dan diproses dengan OCR.

### Q: Adakah semua transaksi diekstrak dari bank statement?

**A:** Ya. Sistem mengekstrak SEMUA transaksi (baik IN dan OUT) dari bank statement. Semua transaksi disimpan dalam `window.extractedBankTransactions` untuk rujukan.

### Q: Transaksi mana yang dipilih untuk auto-isi borang?

**A:** Sistem akan memilih transaksi terbesar secara automatik untuk auto-isi borang. Pengguna boleh mengubah nilai jika perlu.

### Q: Adakah rekod pendapatan yang ditolak boleh diluluskan semula?

**A:** Tidak. Rekod yang ditolak tidak boleh diluluskan semula. Jika perlu, buat rekod baru.

### Q: Bagaimana cara mengesan rekod pendapatan yang salah?

**A:** Gunakan penapis status untuk mencari rekod "Rejected" dan semak sebab penolakan dalam sejarah.

### Q: Bolehkah saya mempunyai lebih daripada satu akaun bank utama?

**A:** Tidak. Hanya satu akaun bank boleh ditandakan sebagai "Akaun Utama". Sistem akan menghalang jika cuba menandakan akaun kedua.

### Q: Apa format nombor rujukan untuk rekod pendapatan?

**A:** Format: DPMMJHR/AC/YYYY-MM-XXXX
- DPMMJHR: Kod organisasi
- AC: Accounting
- YYYY-MM: Tahun dan bulan
- XXXX: Nombor berurutan

---

## Sokongan Teknikal

### Hubungi

Jika menghadapi masalah teknikal:

1. Semak konsol browser untuk ralat JavaScript
2. Pastikan sambungan internet stabil
3. Clear cache browser (Ctrl+Shift+R)
4. Hubungi admin sistem

### Masalah Biasa

| Masalah | Penyelesaian |
|---------|-------------|
| Halaman tidak memuatkan | Clear cache browser |
| Butang tidak berfungsi | Semak konsol browser untuk ralat |
| Rekod tidak disimpan | Semak sambungan internet |
| Dokumen gagal muat naik | Semak saiz fail (maks 5MB) |
| KPI tidak dikemas kini | Refresh halaman |

---

## Versi

- **Versi Semasa:** 1.1
- **Tarikh Keluaran:** 5 Ogos 2026
- **Tarikh Kemas Kini Terakhir:** 7 Ogos 2026
- **Perubahan Versi 1.1:**
  - Ditambah: Fungsi memadam rekod pendapatan (status pending)
  - Ditambah: Ciri OCR multi-halaman PDF
  - Ditambah: Ekstraksi semua transaksi (IN dan OUT)
  - Dikemaskini: Status pelaksanaan akaun bank dan rekod pendapatan

---

**Dokumen ini dikemaskini secara berkala. Sila rujuk versi terkini untuk maklumat terkini.**
