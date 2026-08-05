# Panduan Pengguna Sistem Perakaunan — DPMM Negeri Johor

**Versi:** 1.0  
**Tarikh:** 5 Ogos 2026  
**Audience:** Admin, Bendahari, AJK DPMM Negeri Johor

---

## PENTING: Status Pelaksanaan

**AMARAN**: Dokumen ini menerangkan ciri-ciri yang dirancang untuk modul perakaunan. Beberapa ciri yang diterangkan di bawah mungkin belum dilaksanakan sepenuhnya dalam pangkalan data semasa.

**Status Semasa**:
- Akaun Tunai (cash_accounts): Tersedia
- Akaun Bank (bank_accounts): BELUM dilaksanakan
- Rekod Pendapatan (accounting_entries): BELUM dilaksanakan
- Aliran Kerja Kelulusan: Bahagian tersedia
- Laporan: KPI asas tersedia, eksport CSV belum dilaksanakan

Sila rujuk IMPLEMENTATION-STATUS.md untuk status pelaksanaan terkini.

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

**A:** Tidak. Rekod yang sudah diluluskan tidak boleh dipadam untuk integriti audit. Jika terdapat ralat, buat rekod pembetulan baru.

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

- **Versi Semasa:** 1.0
- **Tarikh Keluaran:** 5 Ogos 2026
- **Tarikh Kemas Kini Terakhir:** 5 Ogos 2026

---

**Dokumen ini dikemaskini secara berkala. Sila rujuk versi terkini untuk maklumat terkini.**
