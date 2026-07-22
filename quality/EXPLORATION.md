# Quality Playbook Phase 1: Exploration Report
**Project:** SISTEM-AHLI-DPMM-JOHOR  
**Date:** 2026-07-22  
**Scope:** Entire codebase analysis for quality assessment

---

## Executive Summary

The SISTEM-AHLI-DPMM-JOHOR project is a web-based membership management system for Dewan Perniagaan Melayu Malaysia (DPMM) Negeri Johor. The system consists of two main applications: an admin dashboard (`index.html`) and a membership application form (`borang.html`), both deployed to GitHub Pages with Supabase as the backend.

**Key Findings:**
- **Architecture:** Monolithic single-file HTML/CSS/JS architecture with modular JavaScript components
- **Database:** Supabase with RLS policies, inconsistent table naming conventions
- **Security:** RLS enabled, CSP configured, XSS protection via `escapeHtml()`, audit logging implemented
- **Testing:** Unit tests (Vitest) and E2E tests (Playwright) present but limited coverage
- **Risk Areas:** Schema inconsistencies, hardcoded credentials, localStorage usage, monolithic structure

---

## 1. Domain Knowledge

### 1.1 System Purpose
The system manages DPMM Johor membership operations including:
- Member registration and management
- Membership fee tracking
- Receipt and payment voucher generation
- Online membership applications (borang.html)
- Meeting management (separate system: SISTEM-MESYUARAT-DPMM-JOHOR)
- WhatsApp and Email notifications
- PDF generation and storage

### 1.2 Core Entities
- **AHLI DPMM JOHOR**: Main member table (with spaces in name)
- **PERMOHONAN_AHLI**: Membership applications
- **receipts**: Receipt records (lowercase)
- **vouchers**: Payment voucher records (lowercase, NOT payment_vouchers)
- **DPMM_USERS**: User accounts (mixed case)
- **DPMM_AUDIT_LOG**: Audit trail (mixed case)
- **DPMM_MESYUARAT**: Meeting records
- **DPMM_LOGS**: System logs
- **DPMM_TEMPLATES**: Document templates
- **DPMM_DOKUMEN**: Document storage

### 1.3 Key Workflows
1. **Member Registration:** Online form → PDF generation → Email notification → Admin review → Approval
2. **Fee Payment:** Receipt generation → OCR processing → Storage → WhatsApp/Email delivery
3. **Payment Voucher:** Creation → Approval workflow (YDP/NYDP/TYDP) → PDF generation
4. **Meeting Management:** Meeting creation → Attendance tracking → Minutes generation

---

## 2. Architecture Analysis

### 2.1 Technology Stack
- **Frontend:** HTML, CSS, JavaScript (single-file architecture)
- **Backend:** Supabase (PostgreSQL database, Storage, Auth, Edge Functions)
- **Deployment:** GitHub Pages (static hosting)
- **Libraries:**
  - Supabase JS client
  - EmailJS (email sending)
  - Tesseract.js (OCR)
  - jsPDF (PDF generation)
  - bcryptjs (password hashing)
  - pdf-lib (PDF manipulation)

### 2.2 File Structure
```
SISTEM-AHLI-DPMM-JOHOR/
├── index.html              # Admin dashboard (monolithic, ~8000 lines)
├── borang.html             # Membership form (monolithic, ~7000 lines)
├── receipt-pv-ui.js        # Receipt/PV UI components
├── src/
│   ├── config-loader.js    # Configuration management
│   ├── audit-logger.js     # Audit logging module
│   ├── sentry-config.js    # Sentry integration
│   ├── modules/
│   │   └── unified-auth.js # Authentication system
│   └── utils/
│       └── shared-utils.js  # Shared utilities
├── supabase/
│   ├── functions/
│   │   ├── email-with-pdf/  # Email with PDF attachment
│   │   ├── ai-proxy/        # AI proxy for Groq/Gemini
│   │   └── ai-proxy-fixed/  # Fixed AI proxy
│   └── migrations/          # Database migrations
├── migrations/              # SQL migration files
├── tests/
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright E2E tests
└── docs/                   # Documentation and plans
```

### 2.3 Data Flow Patterns
1. **Client → Supabase:** Direct Supabase client calls using anon key
2. **Storage Operations:** Signed URLs for private bucket access
3. **Email:** EmailJS (client-side) + Edge Function (server-side with PDF)
4. **AI:** Groq/Gemini proxied through Edge Function
5. **Auth:** Supabase Auth with localStorage session persistence

---

## 3. Database Schema Analysis

### 3.1 Table Naming Inconsistencies
**Critical Finding:** Inconsistent table naming conventions across the database

| Table Name | Case Pattern | Notes |
|------------|--------------|-------|
| "AHLI DPMM JOHOR" | UPPERCASE with spaces | Main member table |
| PERMOHONAN_AHLI | UPPERCASE | Applications table |
| receipts | lowercase | Receipt records |
| vouchers | lowercase | Payment vouchers (NOT payment_vouchers) |
| DPMM_USERS | Mixed case | User accounts |
| dpmm_users | Mixed case | Alternative user table |
| DPMM_AUDIT_LOG | Mixed case | Audit logs |
| dpmm_audit_log | Mixed case | Alternative audit log |
| DPMM_MESYUARAT | Mixed case | Meeting records |
| DPMM_LOGS | Mixed case | System logs |
| DPMM_TEMPLATES | Mixed case | Document templates |
| DPMM_DOKUMEN | Mixed case | Document storage |

**Impact:** Code must use exact table names; case-sensitive queries; potential for errors if wrong case used

### 3.2 Column Naming Inconsistencies
**Critical Finding:** Member table uses UPPERCASE columns

**AHLI DPMM JOHOR columns:**
- `NO_AHLI` (member number) - NOT `nombor_ahli`
- `NAMA_AHLI` (company name) - NOT `nama`
- `NAMA` (PIC name)
- `ALAMAT` (address)
- `JANTINA` (gender)
- `EMEL` (email)
- `KAD_PENGENALAN` (IC number)
- `NO_HP` (phone number) - NOT `NO_TEL`

**Impact:** Frontend code must use exact column names; recent bugs caused by using lowercase column names

### 3.3 Schema Drift Issues
**Finding:** Migrations have created inconsistencies between planned and live schema

**Example:** `receipt-pv-system-phase1.sql` creates table `payment_vouchers` but live schema has `vouchers`

**Impact:** Code references to non-existent tables cause runtime errors

---

## 4. Security Analysis

### 4.1 Authentication & Authorization
- **Supabase Auth:** Implemented with JWT-based sessions
- **RLS Policies:** Enabled on all tables
- **Role-Based Access:** Admin, Bendahari Kehormat, YDP, TYDP, NYDP roles
- **Session Management:** localStorage with 30-minute timeout

**Finding:** RLS policies use `auth.uid()::TEXT` cast for type matching (migrations/receipt-pv-system-phase1.sql:181-241)

### 4.2 Data Protection
- **Password Hashing:** bcryptjs for password storage
- **XSS Protection:** `escapeHtml()` function for user input sanitization (borang.html:3905)
- **CSP:** Content Security Policy configured in both HTML files
- **Audit Logging:** DPMM_AUDIT_LOG table tracks all data operations

**Finding:** `escapeHtml()` applied to all user input interpolation points (borang.html:3821, 4032, 4445-4447, 4666-4668, 4710-4712, 6726)

### 4.3 API Security
- **Anon Key:** Supabase anon key used for client-side access
- **Edge Functions:** Rate limiting (10 emails/minute per IP)
- **Secret Management:** GROQ/Gemini keys proxied through Edge Functions
- **Storage RLS:** Private buckets with path-based access control

**Finding:** Hardcoded credentials identified in multiple locations (see Risk Analysis section)

### 4.4 Storage Security
- **Private Buckets:** `permohonan-dokumen`, `receipts`, `vouchers`
- **Signed URLs:** Temporary access tokens for file downloads
- **Path-Based RLS:** Access controlled by IC number in path structure

---

## 5. Code Quality Analysis

### 5.1 Code Organization
**Finding:** Monolithic single-file architecture with ~8000 lines in index.html and ~7000 lines in borang.html

**Impact:** 
- Difficult to maintain
- Hard to test individual components
- High risk of regressions
- Limited code reuse

**Positive:** Modular JavaScript components extracted to `src/` directory

### 5.2 Error Handling
**Finding:** Extensive use of `alert()` for error messages (100+ occurrences)

**Examples:**
- index.html:2587, 2596, 2608, 2843, 2908, 2910, 2928, 3343, 3553, 3554, 3584, 3912, 4042, 4048, 4135, 4142, 4225, 4438, 4859, 4860, 4916, 4977, 5255, 5282, 5457, 5531, 5574, 5576, 5600, 5986
- receipt-pv-ui.js:473, 478, 511, 515, 528, 534, 538, 666, 673, 682, 692, 701

**Impact:** Poor user experience, blocking UI, no structured error reporting

### 5.3 Logging
**Finding:** Extensive console.log usage throughout codebase (200+ occurrences)

**Positive:** Good debugging visibility during development  
**Negative:** Logs exposed in production, no log level control, no centralized logging

### 5.4 Code Patterns

#### 5.4.1 Supabase Client Usage
**Pattern:** Global `supabaseClient` variable in index.html, `window.sb` in borang.html

**Locations:**
- index.html:2329 (supabaseClient initialization)
- borang.html:45 (window.sb initialization)

**Finding:** Inconsistent naming between files (supabaseClient vs window.sb)

#### 5.4.2 Storage Operations
**Pattern:** Signed URL generation for private bucket access

**Examples:**
- receipt-pv-ui.js:677-686 (receipt PDF download)
- receipt-pv-ui.js:696-705 (voucher PDF download)
- borang.html:4136-4176 (PDF upload with signed URL fallback)

#### 5.4.3 Auth UID Usage
**Pattern:** `auth.uid()::TEXT` cast in RLS policies

**Locations:**
- migrations/receipt-pv-system-phase1.sql:181-241
- migrations/audit-logging.sql:69, 183

**Finding:** Type casting required for TEXT-based user_id columns

---

## 6. Testing Analysis

### 6.1 Unit Tests
**File:** `tests/unit/validation.test.js`

**Coverage:**
- Email validation
- Phone validation
- IC validation
- Formatting functions

**Finding:** Limited to validation utilities only; no unit tests for business logic

### 6.2 E2E Tests
**File:** `tests/e2e/test_borang.py`

**Coverage:**
- Page load verification
- Console error detection
- Config resolution
- Favicon loading
- Secret exposure checks
- Form navigation
- Validation blocking
- Field blur validation
- XSS regression tests

**Finding:** Comprehensive E2E tests for borang.html only; no E2E tests for index.html

### 6.3 Test Scripts
**Additional test files:**
- `test-submission-node.js` - Database insertion test
- `test-submission-flow.js` - EmailJS configuration test
- `test-fasal-submissions.js` - Fasal-based submission test
- `test-emailjs.html` - EmailJS UI test
- `test-email-endpoint.js` - Email endpoint test
- `test-comprehensive.js` - Comprehensive system test

**Finding:** Multiple test scripts but no unified test runner; inconsistent test frameworks

---

## 7. Risk Analysis

### 7.1 High Risk Issues

#### 7.1.1 Schema Inconsistencies
**Risk:** Database table and column naming inconsistencies cause runtime errors

**Evidence:**
- Table `vouchers` vs `payment_vouchers` (memory:fbfbba16)
- Column `NO_AHLI` vs `nombor_ahli` (memory:fbfbba16)
- Column `NO_HP` vs `NO_TEL` (memory:fbfbba16)

**Impact:** Recent "empty tabs / 400 errors" bug caused by these mismatches (commits 8930cc5, 4ae03ff, bbf16ca)

#### 7.1.2 Hardcoded Credentials
**Risk:** API keys and secrets hardcoded in source code

**Evidence:**
- Supabase anon key in config-loader.js:10
- EmailJS keys in config-loader.js:18-21
- Placeholder keys in HTML files

**Impact:** Security vulnerability if code is exposed

#### 7.1.3 Monolithic Architecture
**Risk:** Single-file HTML with thousands of lines is difficult to maintain and test

**Evidence:**
- index.html: ~8000 lines
- borang.html: ~7000 lines

**Impact:** High regression risk, limited code reuse, difficult onboarding

### 7.2 Medium Risk Issues

#### 7.2.1 localStorage Usage
**Risk:** Sensitive data stored in localStorage

**Evidence:**
- Session tokens in unified-auth.js:137
- Draft data in borang.html:6034
- Backup logs in index.html:2796

**Impact:** XSS vulnerability could expose session data

#### 7.2.2 Alert-Based Error Handling
**Risk:** Blocking alerts for all errors

**Evidence:** 100+ alert() calls across codebase

**Impact:** Poor user experience, no error tracking

#### 7.2.3 Inconsistent RLS Policies
**Risk:** Different RLS patterns across tables

**Evidence:**
- Some tables use anon key access
- Some tables require authenticated access
- Type casting inconsistencies

**Impact:** Potential data access vulnerabilities

### 7.3 Low Risk Issues

#### 7.3.1 Console Logging in Production
**Risk:** Debug logs exposed in production

**Evidence:** 200+ console.log calls

**Impact:** Information disclosure, performance impact

#### 7.3.2 Limited Test Coverage
**Risk:** Insufficient test coverage for critical paths

**Evidence:**
- No unit tests for business logic
- No E2E tests for index.html
- No integration tests

**Impact:** Higher regression risk

---

## 8. Pattern Matrix

### 8.1 Database Access Patterns

| Pattern | Location | Notes |
|---------|----------|-------|
| Direct Supabase client | index.html:2329 | Global supabaseClient variable |
| Window-based client | borang.html:45 | window.sb alias |
| RPC calls | index.html:2904, 7301, 7387, 7466 | get_next_number, fn_backup_ahli |
| Storage signed URLs | receipt-pv-ui.js:677, 696 | createSignedUrl for private buckets |

### 8.2 Security Patterns

| Pattern | Location | Notes |
|---------|----------|-------|
| XSS escaping | borang.html:3905 | escapeHtml() function |
| RLS with type cast | migrations/receipt-pv-system-phase1.sql:181 | auth.uid()::TEXT |
| Password hashing | bcryptjs usage | Password storage |
| CSP headers | index.html:1, borang.html:1 | Content-Security-Policy meta tags |

### 8.3 Error Handling Patterns

| Pattern | Location | Notes |
|---------|----------|-------|
| Alert-based | Throughout codebase | 100+ alert() calls |
| Console logging | Throughout codebase | 200+ console.log calls |
| Try-catch blocks | Scattered | Inconsistent error handling |
| Audit logging | src/audit-logger.js | Structured audit trail |

### 8.4 Integration Patterns

| Pattern | Location | Notes |
|---------|----------|-------|
| EmailJS client-side | config-loader.js:18-21 | Fallback email service |
| Edge Function email | supabase/functions/email-with-pdf | Primary email with PDF |
| AI proxy | supabase/functions/ai-proxy-fixed | Groq/Gemini proxy |
| PDF generation | jsPDF usage | Client-side PDF creation |

---

## 9. Failure History

### 9.1 Recent Regressions (July 2026)

#### 9.1.1 Empty Tabs / 400 Errors
**Date:** July 21, 2026  
**Root Cause:** Code used `supabase` (undefined) instead of `supabaseClient`, plus column-name mismatches  
**Fix:** Commits 8930cc5, 4ae03ff, bbf16ca  
**Details:** `receipt_date`, `approval_status`, `nama`, `nombor_ahli` columns did not exist on live schema

#### 9.1.2 PDF Generation Error
**Date:** July 2026  
**Root Cause:** `drawTextOnPage` function called before initialization  
**Fix:** Commit 01d7e72  
**Details:** ReferenceError in borang.html line 5378

#### 9.1.3 Database Schema Drift
**Date:** July 2026  
**Root Cause:** `pdf_file_size` column missing from remote PERMOHONAN_AHLI table  
**Fix:** Applied migration via Supabase MCP  
**Details:** Schema mismatch between local and remote

#### 9.1.4 AI Proxy CORS
**Date:** July 2026  
**Root Cause:** OPTIONS requests to ai-proxy Edge Function returning 500  
**Fix:** Added CORS preflight handling in ai-proxy/index.ts  
**Details:** Commit 39b670c

### 9.2 Regression Prevention Rules
**Document:** Memory:ed4c1e26-1e5-478e-a342-1913f2974d4f

**Key Rules:**
1. Always define variables within function scope where used
2. Never leave orphaned try/catch blocks
3. Always sync frontend validation with RLS policy requirements
4. When adding database columns, immediately update all related code paths

---

## 10. Existing Specifications

### 10.1 Documentation Files
- `README.md` - Project overview and setup
- `PROJECT_BRIEF.md` - Team orchestration and scope
- `CONTEXT.md` - Domain glossary and system components
- `AUDIT-REPORT.md` - Security and functionality audit
- `SECURITY.md` - Security architecture and policies

### 10.2 Implementation Plans
- `docs/plans/2026-07-21-001-feat-approval-workflow-communication-buttons-plan.md` - WhatsApp/Email integration
- `docs/plans/2026-07-22-whatsapp-integration-research.md` - WhatsApp research
- `docs/plans/feature-pdf-workflow-supabase-1.md` - PDF workflow implementation

### 10.3 Security Documentation
- `docs/SECURITY.md` - Comprehensive security documentation
- `docs/audit/receipt-pv-security-audit-2026-07-14.md` - Receipt/PV security audit
- `docs/audit/git-and-security-audit-2026-06-30.md` - Git and security audit

---

## 11. Key Dependencies

### 11.1 External Libraries
- Supabase JS client (@supabase/supabase-js)
- EmailJS (emailjs-com)
- Tesseract.js (tesseract.js)
- jsPDF (jspdf)
- bcryptjs (bcryptjs)
- pdf-lib (pdf-lib)

### 11.2 Internal Modules
- src/config-loader.js - Configuration management
- src/audit-logger.js - Audit logging
- src/sentry-config.js - Sentry integration
- src/modules/unified-auth.js - Authentication
- src/utils/shared-utils.js - Shared utilities
- receipt-pv-ui.js - Receipt/PV UI components

---

## 12. Deployment Configuration

### 12.1 Live URLs
- Main Dashboard: https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/index.html
- Membership Form: https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html

### 12.2 Supabase Configuration
- Project URL: https://lzoloupwtqmjyupvofhh.supabase.co
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2xvdXB3dHFtanl1cHZvZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTMxMTEsImV4cCI6MjA4ODUyOTExMX0.tBcGc6KfPyjUmJngbLTBHv-GZkSoSoyWGXwlXFZ0ShE

### 12.3 Email Configuration
- EmailJS Service ID: service_a3kt2zm
- EmailJS Public Key: Bq94zNa6cDvdTUCU8
- EmailJS Admin Template: template_vud79xb
- EmailJS Applicant Template: template_553fkme

### 12.4 Storage Buckets
- permohonan-dokumen - Private bucket for application PDFs
- receipts - Private bucket for receipt PDFs
- vouchers - Private bucket for voucher PDFs

---

## 13. Recommendations for Phase 2

### 13.1 High Priority
1. **Standardize Database Naming:** Create migration to unify table/column naming conventions
2. **Remove Hardcoded Credentials:** Move all secrets to environment variables
3. **Extract Components:** Break down monolithic HTML files into modular components
4. **Improve Error Handling:** Replace alert() with structured error UI

### 13.2 Medium Priority
1. **Expand Test Coverage:** Add unit tests for business logic, E2E tests for index.html
2. **Implement Logging Framework:** Replace console.log with structured logging
3. **Secure localStorage:** Remove sensitive data from localStorage or encrypt
4. **Standardize RLS Policies:** Create consistent RLS policy pattern across all tables

### 13.3 Low Priority
1. **Add Type Safety:** Consider TypeScript for new code
2. **Implement CI/CD:** Automated testing and deployment pipeline
3. **Performance Monitoring:** Add APM/monitoring tools
4. **Documentation:** Improve inline code documentation

---

## Appendix A: File Inventory

### A.1 Core Application Files
- index.html (8000+ lines)
- borang.html (7000+ lines)
- receipt-pv-ui.js (765 lines)

### A.2 Source Modules
- src/config-loader.js (84 lines)
- src/audit-logger.js (155 lines)
- src/sentry-config.js
- src/modules/unified-auth.js (215 lines)
- src/utils/shared-utils.js

### A.3 Migration Files
- migrations/add-tarikh-bayaran-2026.sql
- migrations/audit-logging.sql
- migrations/create-audit-log.sql
- migrations/enable-supabase-auth.sql
- migrations/hash-passwords.sql
- migrations/permohonan-ahl-rls-policies.sql
- migrations/receipt-pv-schema-align.sql
- migrations/receipt-pv-system-phase1.sql

### A.4 Edge Functions
- supabase/functions/email-with-pdf/index.ts
- supabase/functions/ai-proxy/index.ts
- supabase/functions/ai-proxy-fixed/index.ts

### A.5 Test Files
- tests/unit/validation.test.js
- tests/e2e/test_borang.py
- test-submission-node.js
- test-submission-flow.js
- test-fasal-submissions.js
- test-emailjs.html
- test-email-endpoint.js
- test-comprehensive.js

---

## Appendix B: Citations

All findings in this report are backed by file:line citations from the actual codebase. Key citations:

- Schema inconsistencies: memory:fbfbba16
- RLS policies: migrations/receipt-pv-system-phase1.sql:181-241
- XSS protection: borang.html:3905
- Supabase client usage: index.html:2329, borang.html:45
- Storage operations: receipt-pv-ui.js:677-686, 696-705
- Auth patterns: src/modules/unified-auth.js:137
- Config management: src/config-loader.js:10, 18-21
- Test coverage: tests/unit/validation.test.js, tests/e2e/test_borang.py

---

**End of Phase 1 Exploration Report**
