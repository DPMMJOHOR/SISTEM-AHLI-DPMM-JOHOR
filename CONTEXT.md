# DPMM Johor - Domain Context

## Domain Glossary

### Core Entities

- **Ahli (Member)**: Registered member of DPMM Negeri Johor with profile, membership status, and payment records
- **Mesyuarat (Meeting)**: Scheduled meeting with attendance tracking, agenda, and minutes
- **Kehadiran (Attendance)**: Attendance record linking members to meetings with status (Hadir/Tidak Hadir)
- **Dokumen (Document)**: SSM certificates, company registration docs, and related files
- **Borang (Form)**: Membership application form for new member registration
- **Permohonan (Application)**: In-progress membership application record (before approval into Ahli) — tracked via tabs BARU / DOKUMEN_LENGKAP / DOKUMEN_TIDAK_LENGKAP / DALAM_PERHATIAN / LULUS / TIDAK_LULUS, with supporting documents in the private `permohonan-dokumen` Supabase Storage bucket
- **Bayaran (Payment)**: Membership fee payment records and status
- **Perakaunan (Accounting)**: Financial management including bank accounts, cash accounts, income records, and approval workflow

### Key Concepts

- **DPMM_PENGGUNA**: User authentication table (currently plaintext passwords - security issue)
- **DPMM_AHLI**: Member data table with profile information
- **DPMM_KEHADIRAN**: Attendance tracking table
- **DPMM_MESYUARAT**: Meeting management table
- **DPMM_DOKUMEN**: Document storage and metadata
- **DPMM_TEMPLATES**: Reusable templates for documents and communications
- **accounting_entries**: Income/expense records with approval workflow
- **bank_accounts**: Bank account management
- **cash_accounts**: Cash account management (petty cash, safe, drawer)
- **approval_history**: Audit trail for accounting approvals

### System Components

- **SISTEM-AHLI**: Main member management system (index.html - 1.4MB monolith)
- **SISTEM-MESYUARAT**: Meeting management system (separate repo)
- **borang.html**: Membership application form (148KB)
- **accounting-ui.js**: Accounting module UI component
- **receipt-pv-ui.js**: Receipt & Payment Voucher UI component
- **AI Clerk**: Chatbot widget for natural language queries
- **WAHA**: WhatsApp blast queue for notifications

### Current Architecture Issues

- **Monolithic HTML**: Single 1.4MB file with inline CSS/JS
- **No module separation**: All code in one file
- **Hardcoded credentials**: Passwords and API keys in code
- **Direct Supabase access**: Client-side without server validation
- **No audit logging**: No DPMM_AUDIT_LOG table
- **No testing**: Zero automated tests

### Recent Improvements (August 2026)

- **Accounting Module**: Full accounting system with bank/cash accounts, income records, approval workflow
- **OCR Enhancements**: Multi-page PDF processing, all transaction extraction (IN/OUT)
- **Delete Functionality**: Pending accounting entries can be deleted by admin/bendahari
- **UI/UX Fixes**: Counter font sizes, sidebar navigation, organization header sizing
- **OpenRouter AI Migration**: AIMAN chatbot and Isi Pintar OCR migrated to OpenRouter
- **PDF Workflow**: PDF storage in Supabase, email with PDF attachment via Edge Functions
- **EmailJS Integration**: Client-side email notifications with fallback
- **Permohonan Ahli fixes (15 Aug 2026)**: Fixed the delete button and the document/photo/slip viewer (now uses freshly-signed Supabase Storage URLs, handles legacy public URLs); fixed the `permohonan-dokumen` bucket RLS policies (`supabase/migrations/20260815000000_fix_permohonan_dokumen_rls.sql`); added a "Jana Laporan" A4-landscape document checklist report (`generatePermohonanDocReport()` in `index.html`)
- **Known open issue**: Large unexplained vertical gap between the page topbar and the summary bar/KPI cards specifically on the Permohonan Ahli page. Static review of `.page`, `#app`, `#perm-summary-bar`, `#permohonan-kpi` CSS found nothing conclusive — needs live DevTools inspection (computed height of the empty element) to diagnose.

### Planned Improvements

- **Unified Design System**: Navy #0B2545 + Red #C41230 palette
- **Security Hardening**: Supabase Auth + RLS + Edge Functions
- **Modular Architecture**: Split monolith into proper modules
- **AI Features**: Document auto-fill, meeting insights
- **PWA**: Offline app shell with service worker
