# DPMM Johor - Domain Context

## Domain Glossary

### Core Entities

- **Ahli (Member)**: Registered member of DPMM Negeri Johor with profile, membership status, and payment records
- **Mesyuarat (Meeting)**: Scheduled meeting with attendance tracking, agenda, and minutes
- **Kehadiran (Attendance)**: Attendance record linking members to meetings with status (Hadir/Tidak Hadir)
- **Dokumen (Document)**: SSM certificates, company registration docs, and related files
- **Borang (Form)**: Membership application form for new member registration
- **Bayaran (Payment)**: Membership fee payment records and status

### Key Concepts

- **DPMM_PENGGUNA**: User authentication table (currently plaintext passwords - security issue)
- **DPMM_AHLI**: Member data table with profile information
- **DPMM_KEHADIRAN**: Attendance tracking table
- **DPMM_MESYUARAT**: Meeting management table
- **DPMM_DOKUMEN**: Document storage and metadata
- **DPMM_TEMPLATES**: Reusable templates for documents and communications

### System Components

- **SISTEM-AHLI**: Main member management system (index.html - 1.4MB monolith)
- **SISTEM-MESYUARAT**: Meeting management system (separate repo)
- **borang.html**: Membership application form (148KB)
- **AI Clerk**: Chatbot widget for natural language queries
- **WAHA**: WhatsApp blast queue for notifications

### Current Architecture Issues

- **Monolithic HTML**: Single 1.4MB file with inline CSS/JS
- **No module separation**: All code in one file
- **Hardcoded credentials**: Passwords and API keys in code
- **Direct Supabase access**: Client-side without server validation
- **No audit logging**: No DPMM_AUDIT_LOG table
- **No testing**: Zero automated tests

### Planned Improvements

- **Unified Design System**: Navy #0B2545 + Red #C41230 palette
- **Security Hardening**: Supabase Auth + RLS + Edge Functions
- **Modular Architecture**: Split monolith into proper modules
- **AI Features**: Document auto-fill, meeting insights
- **PWA**: Offline app shell with service worker
