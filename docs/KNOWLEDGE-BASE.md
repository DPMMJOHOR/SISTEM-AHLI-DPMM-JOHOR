# Unified Knowledge Base — SISTEM-AHLI-DPMM-JOHOR

**Last Updated:** 28 Julai 2026  
**Synthesized From:** 44 documentation files + 8 memory snapshots  
**Purpose:** Single source of truth for project knowledge

---

## 🎯 Project Overview

**Name:** Sistem Pengurusan Ahli — DPMM Negeri Johor  
**Type:** Web-based membership management system  
**Organization:** Dewan Perniagaan Melayu Malaysia (DPMM) Negeri Johor  
**Live URLs:**
- Dashboard: https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/index.html
- Membership Form: https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html

**Current Phase:** Production (Live) + Phase 1 UI/UX Enhancements  
**Last Major Update:** 28 Julai 2026 (Payment Slip PDF Support & Report Generation)

---

## 🏗️ Architecture & Technology Stack

### **Frontend**
- **Single-File Architecture:** index.html (8,380 lines), borang.html (separate form)
- **Languages:** HTML5, CSS3, JavaScript (ES6+)
- **Frameworks:** None (vanilla JS for maximum compatibility)
- **UI Framework:** Vuexy-inspired design system (DPMM brand colors)
- **Design System:** Vengence UI (button shine effects, modern animations)

### **Backend & Services**
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth + custom password login
- **Storage:** Supabase Storage (permohonan-dokumen bucket)
- **Edge Functions:** Supabase (email-with-pdf, ai-proxy)
- **Email:** EmailJS (primary) + Gmail SMTP via Edge Function
- **AI/ML:** Groq API (vision OCR), Tesseract.js (local OCR)

### **Key Libraries**
- `@supabase/supabase-js@2` — Database and storage
- `@emailjs/browser@3` — Email notifications
- `bcryptjs@2.4.3` — Password hashing
- `tesseract.js@5` — OCR for payment slips
- `pdf.js@3.11.174` — PDF rasterization for OCR
- `jspdf@2.5.1` — PDF generation
- `pdf-lib` — PDF manipulation (embedded in borang.html)

### **Deployment**
- **Platform:** GitHub Pages (static hosting)
- **Branch:** main
- **Build:** No build process (direct HTML/CSS/JS)
- **HTTPS:** Automatic (GitHub Pages)

---

## 📊 Database Schema

### **Core Tables**

#### **AHLI DPMM JOHOR** (Main Member Table)
```
Columns: NO_AHLI, NAMA_AHLI, NAMA, ALAMAT, JANTINA, EMEL, KAD_PENGENALAN, NO_HP, DAERAH
Case: UPPERCASE with spaces in table name
Note: Primary member database
```

#### **PERMOHONAN_AHLI** (Membership Applications)
```
Columns: id, nama_pemohon, no_ic, emel, no_hp, jenis_entiti, nama_syarikat, 
         alamat, dokumen_url, status, pdf_url, pdf_uploaded_at, pdf_file_size,
         akuan1, akuan2, akuan3, created_at, updated_at
RLS Policies:
  - anon_insert_permohonan: INSERT with IC validation (XXXXXX-XX-XXXX or 12 digits)
  - anon_select_permohonan: SELECT for status='BARU' rows
CHECK Constraint: valid_ic_format
```

#### **receipts** (Receipt Management)
```
Columns: id, receipt_number, receipt_type, member_id, member_name, nombor_ahli, 
         amount, payment_method, payment_date, receipt_date, receipt_pdf_url, 
         digital_signature_url, transaction_id, payment_slip_id, created_by, 
         created_at, updated_at
Case: lowercase
```

#### **vouchers** (Payment Vouchers)
```
Columns: id, voucher_number, payable_to, payment_purpose, payment_method, amount, 
         prepared_by, approved_by, approval_status, approval_date, rejection_reason, 
         payment_status, payment_date, voucher_pdf_url, digital_signature_url, 
         created_at, updated_at
Case: lowercase
Note: NOT payment_vouchers (legacy name)
```

#### **dpmm_users / DPMM_USERS** (User Accounts)
```
Columns: user_id, nama, kata_laluan, peranan, aktif, created_at
Case: Mixed (both lowercase and UPPERCASE versions exist)
```

#### **dpmm_audit_log / DPMM_AUDIT_LOG** (Audit Trail)
```
Columns: id, user_id, action, table_name, record_id, changes, created_at
Case: Mixed (both lowercase and UPPERCASE versions exist)
Purpose: Track all important activities for security
```

### **Storage Buckets**
- **permohonan-dokumen:** Private bucket for PDF storage (10MB limit)
  - Path format: `borang/[ref_id]/borang-[ref_id].pdf`
  - RLS policies: Configured via Supabase CLI

---

## 🔐 Security Architecture

### **Authentication**
- **Admin Login:** Password stored in HTML (change if exposed)
- **Membership Form:** Anonymous submission with IC validation
- **Password Hashing:** bcryptjs (not plaintext)
- **Session Management:** Supabase Auth tokens

### **Row Level Security (RLS)**
- **Default:** Public read, authenticated write
- **PERMOHONAN_AHLI:** Anonymous INSERT with IC validation, authenticated SELECT/UPDATE
- **Storage:** RLS policies on permohonan-dokumen bucket (via Supabase CLI)

### **Data Protection**
- **PII Masking:** Applied in audit logs and error messages
- **IC Number Format:** Validated (XXXXXX-XX-XXXX or 12 digits)
- **Email Addresses:** Masked in logs (user@example.com → u***@e***.com)
- **Phone Numbers:** Masked in logs (0123456789 → 012***6789)

### **API Security**
- **CORS:** Configured for GitHub Pages origin
- **CSP:** Content Security Policy in place (report-only mode)
- **Email:** SMTP credentials in Supabase environment variables (not in code)
- **API Keys:** EmailJS public key only (no secret key in frontend)

### **Recent Security Fixes (July 2026)**
1. **CORS Preflight Handling:** Edge Functions now handle OPTIONS requests
2. **Email Retry Logic:** 3 attempts with exponential backoff
3. **PDF Storage RLS:** Configured via Supabase CLI (not SQL Editor)
4. **Groq API Proxy:** Proxied through Edge Function (not exposed to frontend)
5. **CSP Frame-src:** Updated to allow Turnstile CAPTCHA

---

## 📧 Email System

### **Primary: EmailJS**
- **Service ID:** service_a3kt2zm
- **Public Key:** Bq94zNa6cDvdTUCU8
- **Admin Template:** template_vud79xb
- **Applicant Template:** template_553fkme
- **Purpose:** Client-side email notifications (fallback)

### **Secondary: Edge Function (email-with-pdf)**
- **Purpose:** Send emails with PDF attachments
- **Method:** Gmail SMTP via nodemailer
- **Rate Limit:** 10 emails per minute per IP
- **Retry:** 3 attempts with exponential backoff
- **Status:** Deployed version 7 (commit 39b670c)
- **Environment Variables:** SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM

### **Fallback Chain**
1. Try Edge Function (email-with-pdf)
2. If fails, fallback to EmailJS
3. If both fail, show error to user

---

## 🎨 Design System (Vengence UI)

### **Color Palette**
- **Primary (DPMM Blue):** #1D3C96
- **Primary Light:** #E8EDF7
- **Primary Dark:** #142A6D
- **Success:** #00D4A0
- **Warning:** #FFA94D
- **Danger:** #FF6B6B
- **Info:** #00D4C5

### **Typography**
- **Headings:** Montserrat (300-900 weight)
- **Body:** Inter (300-800 weight)
- **Monospace:** JetBrains Mono (400-700 weight)

### **Components**
- **Button Shine Effect:** `.btn-shine` class with gradient background and hover animation
- **Cards:** 14px border-radius, 1.5px border, subtle shadow
- **Inputs:** 9px border-radius, 0.6rem padding, focus outline
- **Badges:** Status-based colors (hadir, tidak, belum, lain)

### **Animations**
- **Hover:** translateY(-2px) with 0.2s ease
- **Fade-up:** 0.3s ease on page load
- **Spin:** 0.7s linear for spinners

### **Mobile Breakpoints (Phase 1 UI/UX)**
- **768px:** Tablet view (reduced padding, 44px touch targets)
- **480px:** Mobile view (minimal padding, optimized font sizes)

---

## 📱 Features & Functionality

### **Dashboard (index.html)**
- **Member Summary:** KPI cards showing total members, new members, etc.
- **Member Search:** Real-time search with filtering
- **District Management:** View members by district
- **Fee Tracking:** Monitor membership fees and SSM status
- **CSV Export:** Export member data
- **Receipt & Voucher System:** Manage receipts and payment vouchers
- **PDF Viewer:** View submitted forms in modal
- **AIMAN AI Assistant:** Chat-based member assistance

### **Membership Form (borang.html)**
- **Online Application:** 6-page form with validation
- **PDF Generation:** Auto-generate PDF with online submission header
- **PDF Storage:** Upload to Supabase Storage
- **Email Notification:** Send PDF to admin and applicant
- **Isi Pintar (Smart Autofill):** AI-powered form completion using OCR
- **AIMAN Chatbot:** AI assistant for form guidance
- **Success Page:** Confirmation with PDF viewer

### **Receipt & Voucher System**
- **Receipt Generation:** Create and manage receipts
- **Voucher Management:** Create payment vouchers
- **Approval Workflow:** Approve/reject vouchers
- **OCR Support:** Extract data from payment slips
- **PDF Export:** Generate PDF receipts/vouchers

### **AIMAN AI Assistant**
- **Multilingual:** Responds in Malay and English
- **Context-Aware:** Understands member data and form context
- **Conversational:** Friendly and approachable tone
- **Integration:** Groq API (vision OCR), Tesseract.js (local OCR)

---

## 🚀 Recent Updates & Commits

### **Vengence UI Design System (23 Julai 2026)**
- Applied `.btn-shine` class to all buttons
- Updated login banner to DPMM blue colors
- Replaced logo with white background version
- Commits: 4cd5b79, 39ec1ff, 41cac8c, f078a50

### **Phase 1 UI/UX Enhancements (23 Julai 2026)**
- Mobile responsiveness (480px, 768px breakpoints)
- Accessibility focus enhancements (2px solid outlines)
- Animation consistency (translateY(-2px) with 0.2s ease)
- Status: ✅ Applied to SISTEM-AHLI, ⏳ Pending for SISTEM-MESYUARAT

### **PDF Workflow Enhancement (19 Julai 2026)**
- Added online submission header to all 6 PDF pages
- Integrated Supabase Storage for PDF storage
- Created Edge Function for email with PDF attachment
- Implemented interactive PDF viewer
- Commits: Various (see DEPLOYMENT.md)

### **EmailJS Integration (18 Julai 2026)**
- Migrated from Resend to EmailJS
- Implemented fallback email system
- Created comprehensive RLS policies
- Commits: Various (see DEPLOYMENT.md)

---

## ⚠️ Known Issues & Limitations

### **Current Issues**
1. **GROQ_API_KEY Missing:** Isi Pintar feature requires API key configuration
2. **SISTEM-MESYUARAT Phase 1 Fixes:** Pending GitHub permissions (blocked by 403 error)
3. **Static Hosting Limitations:** No server-side rendering (CSP, HSTS, CSRF limited)

### **Design Limitations**
- **Single-File Architecture:** Large file size (8,380+ lines)
- **No Build Process:** All code in HTML (no minification, bundling)
- **No Caching Strategy:** Every page load fetches full HTML

### **Security Limitations**
- **Password in HTML:** Admin password stored in code (change if exposed)
- **No CSRF Token:** Double-submit cookie pattern not possible on static hosting
- **CSP Report-Only:** Full CSP hardening requires server-side rendering

---

## 🔧 Critical Regression Prevention Rules

### **Borang.html Changes**
1. **Scope Check:** Variables must be defined in function scope
2. **Validation Sync:** Frontend validation must match RLS policies
3. **Schema Drift:** Database columns must be reflected in payload
4. **Code Structure:** No orphaned try/catch blocks

### **Database Changes**
1. **Table Names:** Case-sensitive, check for spaces (e.g., "AHLI DPMM JOHOR")
2. **Column Names:** Verify exact spelling and case
3. **RLS Policies:** Sync with frontend validation requirements
4. **Migrations:** Apply via Supabase CLI (not SQL Editor)

### **Pre-Coding Checklist**
- [ ] Grep table/column names in codebase
- [ ] Check migration files for schema
- [ ] Verify against live schema documentation
- [ ] Document findings in plan before coding
- [ ] Test on live URL after deployment

---

## 📞 Support & Escalation

| Issue | Resource |
|-------|----------|
| **Setup Problems** | [SETUP.md](SETUP.md) |
| **Deployment Issues** | [DEPLOYMENT.md](DEPLOYMENT.md) |
| **Security Concerns** | [SECURITY.md](SECURITY.md) + audit reports |
| **Feature Development** | [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) + implementation plans |
| **Design Questions** | [design-system/](design-system/) documentation |
| **Database Issues** | [CONTEXT.md](../CONTEXT.md) + migration files |
| **Email Problems** | [EMAIL-RETRY.md](EMAIL-RETRY.md) |

---

## 📈 Project Metrics

- **Total Documentation Files:** 44
- **Total Lines of Code:** 8,380+ (index.html) + borang.html
- **Database Tables:** 8+ (members, applications, receipts, vouchers, users, audit logs)
- **Edge Functions:** 2 (email-with-pdf, ai-proxy)
- **External APIs:** 3 (Supabase, EmailJS, Groq)
- **Live Users:** DPMM members (Negeri Johor)
- **Uptime:** 99.9% (GitHub Pages SLA)

---

**Last Reviewed:** 26 Julai 2026  
**Next Review:** 2 Ogos 2026  
**Maintainer:** Development Team  
**Status:** ✅ Current and Accurate
