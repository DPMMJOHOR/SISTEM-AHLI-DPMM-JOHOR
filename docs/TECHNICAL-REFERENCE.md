# Technical Reference — SISTEM-AHLI-DPMM-JOHOR

**Last Updated:** 27 Julai 2026  
**Audience:** Developers, DevOps engineers, technical architects  
**Purpose:** Complete technical specifications and API reference

---

## 🏗️ System Architecture

### **High-Level Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Pages (Static)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  index.html (Dashboard) + borang.html (Form)         │   │
│  │  ├─ HTML5 + CSS3 + JavaScript (ES6+)                │   │
│  │  ├─ Supabase JS Client (@supabase/supabase-js@2)    │   │
│  │  ├─ EmailJS Client (@emailjs/browser@3)            │   │
│  │  └─ Tesseract.js (OCR)                             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS
        ┌──────────┴──────────┬──────────────┐
        │                     │              │
┌───────▼────────┐  ┌────────▼────────┐  ┌─▼─────────────┐
│   Supabase     │  │   EmailJS       │  │  Groq API     │
│   PostgreSQL   │  │   Email Service │  │  (Vision OCR) │
│   + Storage    │  │                 │  │               │
│   + Auth       │  │                 │  │               │
└────────────────┘  └─────────────────┘  └───────────────┘
        │
        └─ Edge Functions
           ├─ email-with-pdf (Gmail SMTP)
           └─ ai-proxy (Groq proxy)
```

### **Data Flow**

#### **Membership Application Flow**
```
User fills borang.html
    ↓
Client-side validation
    ↓
PDF generation (pdf-lib)
    ↓
Upload to Supabase Storage (permohonan-dokumen bucket)
    ↓
Insert into PERMOHONAN_AHLI table
    ↓
Call email-with-pdf Edge Function
    ↓
Send email with PDF attachment (Gmail SMTP)
    ↓
Fallback to EmailJS if Edge Function fails
    ↓
Show success page with PDF viewer
```

#### **Receipt/Voucher Workflow**
```
Admin creates receipt/voucher in index.html
    ↓
Client-side validation
    ↓
Insert into receipts/vouchers table
    ↓
Generate PDF
    ↓
Optional: OCR payment slip (Tesseract.js)
    ↓
Store PDF URL in database
    ↓
Send notification email
```

---

## 🗄️ Database Specifications

### **Connection Details**
- **Provider:** Supabase (PostgreSQL)
- **Project ID:** lzoloupwtqmjyupvofhh
- **Region:** (Check Supabase dashboard)
- **Connection:** Via @supabase/supabase-js@2 client
- **Auth:** Anon key + service role key (for Edge Functions)

### **Table Specifications**

#### **AHLI DPMM JOHOR** (Member Master)
```sql
CREATE TABLE "AHLI DPMM JOHOR" (
  NO_AHLI VARCHAR PRIMARY KEY,
  NAMA_AHLI VARCHAR NOT NULL,
  NAMA VARCHAR,
  ALAMAT TEXT,
  JANTINA VARCHAR,
  EMEL VARCHAR,
  KAD_PENGENALAN VARCHAR,
  NO_HP VARCHAR,
  DAERAH VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_no_ahli ON "AHLI DPMM JOHOR"(NO_AHLI);
CREATE INDEX idx_daerah ON "AHLI DPMM JOHOR"(DAERAH);
```

#### **PERMOHONAN_AHLI** (Applications)
```sql
CREATE TABLE PERMOHONAN_AHLI (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_pemohon VARCHAR NOT NULL,
  no_ic VARCHAR NOT NULL,
  emel VARCHAR NOT NULL,
  no_hp VARCHAR,
  jenis_entiti VARCHAR,
  nama_syarikat VARCHAR,
  alamat TEXT,
  dokumen_url TEXT,
  status VARCHAR DEFAULT 'BARU',
  pdf_url TEXT,
  pdf_uploaded_at TIMESTAMP,
  pdf_file_size INTEGER,
  akuan1 BOOLEAN DEFAULT FALSE,
  akuan2 BOOLEAN DEFAULT FALSE,
  akuan3 BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_ic_format CHECK (
    no_ic ~ '^\d{6}-\d{2}-\d{4}$' OR 
    no_ic ~ '^\d{12}$'
  )
);

-- RLS Policies
CREATE POLICY "anon_insert_permohonan" ON PERMOHONAN_AHLI
  FOR INSERT WITH CHECK (
    no_ic ~ '^\d{6}-\d{2}-\d{4}$' OR 
    no_ic ~ '^\d{12}$'
  );

CREATE POLICY "anon_select_permohonan" ON PERMOHONAN_AHLI
  FOR SELECT USING (status = 'BARU');

-- Indexes
CREATE INDEX idx_no_ic ON PERMOHONAN_AHLI(no_ic);
CREATE INDEX idx_status ON PERMOHONAN_AHLI(status);
CREATE INDEX idx_created_at ON PERMOHONAN_AHLI(created_at);
```

#### **receipts** (Receipt Management)
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR UNIQUE NOT NULL,
  receipt_type VARCHAR,
  member_id VARCHAR,
  member_name VARCHAR,
  nombor_ahli VARCHAR,
  amount DECIMAL(10,2),
  payment_method VARCHAR,
  payment_date DATE,
  receipt_date DATE,
  receipt_pdf_url TEXT,
  digital_signature_url TEXT,
  transaction_id VARCHAR,
  payment_slip_id VARCHAR,
  created_by VARCHAR,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_receipt_number ON receipts(receipt_number);
CREATE INDEX idx_member_id ON receipts(member_id);
CREATE INDEX idx_created_at ON receipts(created_at);
```

#### **vouchers** (Payment Vouchers)
```sql
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number VARCHAR UNIQUE NOT NULL,
  payable_to VARCHAR NOT NULL,
  payment_purpose VARCHAR,
  payment_method VARCHAR,
  amount DECIMAL(10,2),
  prepared_by VARCHAR,
  approved_by VARCHAR,
  approval_status VARCHAR DEFAULT 'PENDING',
  approval_date DATE,
  rejection_reason TEXT,
  payment_status VARCHAR DEFAULT 'UNPAID',
  payment_date DATE,
  voucher_pdf_url TEXT,
  digital_signature_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_voucher_number ON vouchers(voucher_number);
CREATE INDEX idx_approval_status ON vouchers(approval_status);
CREATE INDEX idx_created_at ON vouchers(created_at);
```

#### **dpmm_users** (User Accounts)
```sql
CREATE TABLE dpmm_users (
  user_id VARCHAR PRIMARY KEY,
  nama VARCHAR NOT NULL,
  kata_laluan VARCHAR NOT NULL,
  peranan VARCHAR,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_id ON dpmm_users(user_id);
```

#### **dpmm_audit_log** (Audit Trail)
```sql
CREATE TABLE dpmm_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR,
  action VARCHAR NOT NULL,
  table_name VARCHAR,
  record_id VARCHAR,
  changes JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_id ON dpmm_audit_log(user_id);
CREATE INDEX idx_action ON dpmm_audit_log(action);
CREATE INDEX idx_created_at ON dpmm_audit_log(created_at);
```

### **Storage Buckets**

#### **permohonan-dokumen** (PDF Storage)
```
Bucket Name: permohonan-dokumen
Type: Private
Max File Size: 10MB
Path Format: borang/[ref_id]/borang-[ref_id].pdf

RLS Policies:
- SELECT: Authenticated users only
- INSERT: Authenticated users only
- UPDATE: Authenticated users only
- DELETE: Authenticated users only
```

---

## 🔌 API Reference

### **Supabase Client Initialization**
```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lzoloupwtqmjyupvofhh.supabase.co';
const SUPABASE_KEY = 'your-anon-key-here';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
```

### **Edge Function: email-with-pdf**

**Endpoint:** `https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/email-with-pdf`

**Method:** POST

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [SUPABASE_ANON_KEY]
```

**Request Body:**
```json
{
  "recipient_type": "admin|applicant",
  "pdf_url": "https://...",
  "applicant_data": {
    "nama_pemohon": "John Doe",
    "emel": "john@example.com",
    "no_ic": "123456-12-1234"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "message_id": "..."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message",
  "retry_count": 3
}
```

**Rate Limiting:** 10 emails per minute per IP

**Retry Logic:** 3 attempts with exponential backoff (1s, 2s, 4s)

### **Edge Function: ai-proxy**

**Endpoint:** `https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/ai-proxy`

**Method:** POST

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [SUPABASE_ANON_KEY]
```

**Request Body:**
```json
{
  "model": "qwen/qwen3.6-27b",
  "messages": [
    {
      "role": "user",
      "content": "..."
    }
  ],
  "max_tokens": 600,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "content": "..."
      }
    }
  ]
}
```

**Rate Limiting:** 8000 TPM (Groq on_demand tier)

**CORS:** Preflight handling enabled (OPTIONS returns 200)

### **EmailJS Integration**

**Service ID:** service_a3kt2zm  
**Public Key:** Bq94zNa6cDvdTUCU8

**Admin Template (template_vud79xb):**
```
Variables: nama_pemohon, emel, no_ic, status
```

**Applicant Template (template_553fkme):**
```
Variables: nama_pemohon, emel, status, pdf_url
```

**Usage:**
```javascript
emailjs.send(
  'service_a3kt2zm',
  'template_vud79xb',
  {
    nama_pemohon: 'John Doe',
    emel: 'admin@dpmm.my',
    no_ic: '123456-12-1234',
    status: 'BARU'
  },
  'Bq94zNa6cDvdTUCU8'
);
```

---

## 🔐 Security Specifications

### **Authentication**
- **Admin Login:** Password-based (stored in HTML, hashed with bcryptjs)
- **Membership Form:** Anonymous submission with IC validation
- **Supabase Auth:** Optional (not currently used for admin)

### **Authorization (RLS)**
- **Default:** Public read, authenticated write
- **PERMOHONAN_AHLI:** Anonymous INSERT (with IC validation), authenticated SELECT/UPDATE
- **Storage:** RLS policies on permohonan-dokumen bucket

### **Data Encryption**
- **In Transit:** HTTPS (GitHub Pages + Supabase)
- **At Rest:** Supabase encryption (default)
- **Passwords:** bcryptjs hashing (10 rounds)

### **API Security**
- **CORS:** Configured for GitHub Pages origin
- **CSP:** Content Security Policy (report-only mode)
- **CSRF:** Not applicable (static hosting)
- **Rate Limiting:** 10 emails/min, 8000 TPM (Groq)

### **Secrets Management**
- **EmailJS Public Key:** Safe to expose (public key only)
- **Supabase Anon Key:** Safe to expose (limited permissions)
- **SMTP Credentials:** In Supabase environment variables (not in code)
- **Groq API Key:** In Supabase environment variables (not in code)

---

## 📦 Dependencies & Versions

### **Core Libraries**
| Library | Version | Purpose |
|---------|---------|---------|
| @supabase/supabase-js | 2.x | Database & Storage |
| @emailjs/browser | 3.x | Email notifications |
| bcryptjs | 2.4.3 | Password hashing |
| tesseract.js | 5.x | OCR for payment slips |
| jspdf | 2.5.1 | PDF generation |
| pdf-lib | Latest | PDF manipulation |

### **External Services**
| Service | Purpose | Status |
|---------|---------|--------|
| Supabase | Database, Storage, Auth, Edge Functions | ✅ Active |
| EmailJS | Email notifications | ✅ Active |
| Groq API | Vision OCR | ✅ Active (requires API key) |
| GitHub Pages | Hosting | ✅ Active |

---

## 🚀 Deployment Specifications

### **GitHub Pages**
- **Repository:** DPMMJOHOR/SISTEM-AHLI-DPMM-JOHOR
- **Branch:** main
- **Deploy Path:** / (root)
- **Build Command:** None (static files)
- **Deploy Time:** ~1-2 minutes after push

### **Supabase Deployment**
- **Migrations:** `supabase db push` (via CLI)
- **Edge Functions:** `supabase functions deploy [function-name]`
- **Environment Variables:** Set in Supabase Dashboard

### **Manual Deployment Steps**
```bash
# 1. Deploy migrations
supabase db push

# 2. Deploy Edge Functions
supabase functions deploy email-with-pdf
supabase functions deploy ai-proxy

# 3. Set environment variables in Supabase Dashboard
# SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
# GROQ_API_KEY

# 4. Push to GitHub (triggers GitHub Pages deployment)
git add .
git commit -m "feat: [description]"
git push origin main

# 5. Wait 1-2 minutes for GitHub Pages to update
# 6. Clear browser cache (Ctrl+Shift+R)
# 7. Test on live URL
```

---

## 🧪 Testing Specifications

### **Unit Testing**
- **Framework:** None (vanilla JS)
- **Approach:** Manual testing + browser console validation
- **Coverage:** Critical paths (form submission, PDF generation, email sending)

### **Integration Testing**
- **Scope:** Supabase integration, Edge Functions, EmailJS
- **Method:** Manual testing on live URL
- **Checklist:** See [DEPLOYMENT.md](DEPLOYMENT.md)

### **Security Testing**
- **RLS Validation:** Test anonymous INSERT with invalid IC format
- **CORS Testing:** Test requests from different origins
- **XSS Testing:** Test form inputs with malicious scripts
- **SQL Injection:** Test form inputs with SQL syntax

### **Performance Testing**
- **Page Load:** Target < 3 seconds on 4G
- **PDF Generation:** Target < 5 seconds
- **Email Sending:** Target < 10 seconds
- **OCR Processing:** Target < 30 seconds

---

## 🔧 Troubleshooting Guide

### **Common Issues & Solutions**

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not sending | SMTP credentials missing | Configure in Supabase Dashboard |
| PDF upload fails | Storage RLS policy missing | Run `supabase db push` |
| Isi Pintar not working | GROQ_API_KEY missing | Set in Supabase Dashboard |
| Form submission fails | RLS policy mismatch | Check IC validation format |
| CORS error | Origin not allowed | Check CSP and CORS headers |
| Page not updating | Browser cache | Clear cache (Ctrl+Shift+R) |

---

## 📊 Performance Metrics

### **Target Metrics**
- **Page Load Time:** < 3 seconds
- **First Contentful Paint:** < 1.5 seconds
- **Largest Contentful Paint:** < 2.5 seconds
- **Cumulative Layout Shift:** < 0.1
- **Time to Interactive:** < 3 seconds

### **Current Status**
- **GitHub Pages:** 99.9% uptime SLA
- **Supabase:** 99.95% uptime SLA
- **EmailJS:** 99.9% uptime SLA

---

**Last Updated:** 26 Julai 2026  
**Reviewed By:** Development Team  
**Next Review:** 2 Ogos 2026
