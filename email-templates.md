# EmailJS Email Templates

## Template 1: Admin Notification (New Application Received)

**Purpose:** Notify admin (Setiausaha) when a new membership application is submitted.

**Subject:** `[ADMIN ALERT] Permohonan Baharu Diterima - {{ref_id}}`

**Body:**

```
Salam Sejahtera,

Permohonan keahlian baharu telah diterima melalui sistem DPMM Negeri Johor.

Maklumat Permohonan:
-------------------
No. Rujukan: {{ref_id}}
Jenis Keahlian: {{jenis}}
Fasal: {{fasal}}
Nama Entiti: {{nama_entiti}}
Wakil / Proksi: {{proksi_nama}}
No. HP Proksi: {{proksi_hp}}
E-mel Proksi: {{proksi_emel}}
Jumlah Bayaran: {{jumlah}}
Tarikh: {{tarikh}}
IP Address: {{ip_address}}

Arahan:
--------
Sila log masuk ke sistem untuk semakan dan tindakan lanjut.

Sistem Keahlian DPMM Negeri Johor
https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/
```

**Placeholders:**
- `{{ref_id}}` - Reference number (e.g., DPMMJHR/BARU/2026/06-XXXXXX)
- `{{jenis}}` - Membership type (e.g., Ahli Biasa (A))
- `{{fasal}}` - Fasal clause (e.g., 6.2.1)
- `{{nama_entiti}}` - Entity/Business name
- `{{proksi_nama}}` - Proxy/Representative name
- `{{proksi_hp}}` - Proxy phone number
- `{{proksi_emel}}` - Proxy email
- `{{jumlah}}` - Total payment amount (e.g., RM 100)
- `{{tarikh}}` - Submission date
- `{{ip_address}}` - Applicant's IP address

---

## Template 2: Applicant Confirmation (Receipt Acknowledgment)

**Purpose:** Confirm receipt of application to the applicant with disclaimer.

**Subject:** `Pengesahan Penerimaan Permohonan - {{ref_id}}`

**Body:**

```
Terima kasih kerana menghantar permohonan keahlian DPMM Negeri Johor.

Maklumat Permohonan Anda:
-------------------------
No. Rujukan Sementara: {{ref_id}}
Jenis Keahlian: {{jenis}}
Fasal: {{fasal}}
Nama Entiti: {{nama_entiti}}
Wakil / Proksi: {{proksi_nama}}
No. HP: {{proksi_hp}}
E-mel: {{proksi_emel}}
Jumlah Bayaran: {{jumlah}}
Tarikh: {{tarikh}}

DISCLAIMER PENTING:
-------------------
E-mel ini adalah pengesahan PENERIMAAN sahaja dan BUKAN merupakan kelulusan automatik.

Permohonan anda sedang dalam proses semakan oleh Jawatankuasa DPMM Negeri Johor. Keputusan muktamad akan dimaklumkan kemudian melalui e-mel atau WhatsApp.

Sila simpan No. Rujukan Sementara ini untuk rujukan semasa.

Sistem Keahlian DPMM Negeri Johor
https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/

Untuk sebarang pertanyaan, sila hubungi:
E-mel: dpmmnj.pengurusan@gmail.com
WhatsApp: +6017-559 2722
```

**Placeholders:**
- `{{ref_id}}` - Reference number
- `{{jenis}}` - Membership type
- `{{fasal}}` - Fasal clause
- `{{nama_entiti}}` - Entity/Business name
- `{{proksi_nama}}` - Proxy/Representative name
- `{{proksi_hp}}` - Proxy phone number
- `{{proksi_emel}}` - Proxy email
- `{{jumlah}}` - Total payment amount
- `{{tarikh}}` - Submission date

---

## Implementation in EmailJS Dashboard

1. Go to https://dashboard.emailjs.com/
2. Navigate to Email Templates
3. Create 2 new templates using the content above
4. Update template IDs in `borang.html`:
   - Line 2806: `const EMAILJS_TPL_ADMIN = 'template_xxxxx';`
   - Line 2807: `const EMAILJS_TPL_APPLICANT = 'template_yyyyy';`
5. Update email sending code (lines 3969 and 3991) to use respective templates
