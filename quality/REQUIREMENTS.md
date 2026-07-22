# Requirements — SISTEM-AHLI-DPMM-JOHOR

**Project:** SISTEM-AHLI-DPMM-JOHOR  
**Version:** 1.0  
**Date:** 2026-07-22  
**Generated from:** quality/EXPLORATION.md

---

## Project Overview

SISTEM-AHLI-DPMM-JOHOR is a web-based membership management system for Dewan Perniagaan Melayu Malaysia (DPMM) Negeri Johor. The system consists of two main applications deployed to GitHub Pages with Supabase as the backend:

- **index.html**: Admin dashboard for member management, receipt/voucher generation, and meeting management
- **borang.html**: Online membership application form with PDF generation and email notifications

**Technology Stack:**
- Frontend: HTML, CSS, JavaScript (monolithic single-file architecture)
- Backend: Supabase (PostgreSQL, Storage, Auth, Edge Functions)
- Deployment: GitHub Pages (static hosting)

**Critical Risks Identified:**
- Database schema inconsistencies (table/column naming)
- Hardcoded credentials in source code
- Monolithic architecture (8000+ line HTML files)
- localStorage usage for sensitive data
- Alert-based error handling (100+ occurrences)

---

## Requirements

### REQ-001: Database Schema Consistency

**Source:** EXPLORATION.md §3.1-3.3 (Schema Inconsistencies)  
**Severity:** HIGH  
**Type:** STRUCTURAL

The system MUST use consistent table and column naming conventions across the database to prevent runtime errors.

**Specific Requirements:**
- All database table names MUST be referenced exactly as they exist in the live schema
- Column names in the "AHLI DPMM JOHOR" table MUST use UPPERCASE (NO_AHLI, NAMA_AHLI, NAMA, ALAMAT, JANTINA, EMEL, KAD_PENGENALAN, NO_HP)
- The vouchers table MUST be referenced as "vouchers" (lowercase), NOT "payment_vouchers"
- All Supabase queries MUST use exact case-sensitive table and column names
- Migration files MUST be validated against live schema before application

**Rationale:** Recent "empty tabs / 400 errors" bug (commits 8930cc5, 4ae03ff, bbf16ca) was caused by using lowercase column names (nombor_ahli, nama) when the live schema uses UPPERCASE (NO_AHLI, NAMA_AHLI).

**Use Cases:**
- UC-001: Member data retrieval
- UC-002: Receipt/voucher data operations
- UC-003: Migration application

---

### REQ-002: Credential Security

**Source:** EXPLORATION.md §7.1.2 (Hardcoded Credentials)  
**Severity:** HIGH  
**Type:** SECURITY

The system MUST NOT store API keys, secrets, or credentials in source code.

**Specific Requirements:**
- Supabase anon key MUST be loaded from environment variables or secure configuration
- EmailJS keys (Service ID, Public Key, Template IDs) MUST NOT be hardcoded
- Edge Function secrets (GROQ/Gemini API keys) MUST be managed via Supabase environment variables
- All credential references MUST use window.CONFIG or equivalent secure loading mechanism
- Placeholder keys (e.g., "YOUR_TURNSTILE_SITE_KEY") MUST be replaced with actual values or removed

**Rationale:** Hardcoded credentials in config-loader.js:10, 18-21 create security vulnerability if code is exposed.

**Use Cases:**
- UC-004: System initialization
- UC-005: Email sending
- UC-006: AI proxy operations

---

### REQ-003: XSS Prevention

**Source:** EXPLORATION.md §4.2 (Data Protection)  
**Severity:** HIGH  
**Type:** SECURITY

The system MUST prevent Cross-Site Scripting (XSS) attacks through proper input sanitization.

**Specific Requirements:**
- All user input interpolated into HTML MUST be escaped using escapeHtml() function
- escapeHtml() MUST escape &, <, >, ", ' characters in that order
- User input in email templates MUST be escaped before rendering
- Uploaded filenames MUST be escaped before display
- No user input may be directly assigned to innerHTML without escaping

**Rationale:** escapeHtml() function (borang.html:3905) is applied at multiple points (3821, 4032, 4445-4447, 4666-4668, 4710-4712, 6726) but must be consistently applied everywhere.

**Use Cases:**
- UC-007: Form submission
- UC-008: Email generation
- UC-009: File upload display
- UC-010: Data rendering

---

### REQ-004: RLS Policy Consistency

**Source:** EXPLORATION.md §4.1, §7.2.3 (Authentication & RLS)  
**Severity:** MEDIUM  
**Type:** SECURITY

The system MUST implement consistent Row Level Security (RLS) policies across all database tables.

**Specific Requirements:**
- All RLS policies MUST use auth.uid()::TEXT cast for TEXT-based user_id columns
- RLS policies MUST be consistently applied: either all tables use anon key access or all require authenticated access
- Type casting in RLS policies MUST match the actual column data types
- RLS policies MUST be tested with both authenticated and anonymous contexts
- Storage bucket RLS MUST use path-based access control with IC number validation

**Rationale:** Inconsistent RLS patterns (some anon, some authenticated, type casting variations) create potential data access vulnerabilities.

**Use Cases:**
- UC-011: Data access control
- UC-012: Storage access validation
- UC-013: User role verification

---

### REQ-005: Error Handling

**Source:** EXPLORATION.md §5.2, §7.2.2 (Error Handling)  
**Severity:** MEDIUM  
**Type:** USABILITY

The system MUST provide structured, non-blocking error handling instead of alert() dialogs.

**Specific Requirements:**
- Error messages MUST be displayed in UI elements (modals, toasts, inline messages) NOT alert()
- Error messages MUST include actionable information for the user
- Errors MUST be logged to DPMM_AUDIT_LOG table for tracking
- Error handling MUST use try-catch blocks consistently
- Errors MUST NOT block the entire UI (non-blocking where possible)

**Rationale:** 100+ alert() calls across codebase (index.html, receipt-pv-ui.js) create poor user experience and no error tracking.

**Use Cases:**
- UC-014: Form validation errors
- UC-015: Database operation errors
- UC-016: File upload errors
- UC-017: API call errors

---

### REQ-006: localStorage Security

**Source:** EXPLORATION.md §7.2.1 (localStorage Usage)  
**Severity:** MEDIUM  
**Type:** SECURITY

The system MUST NOT store sensitive data in localStorage without encryption or secure alternatives.

**Specific Requirements:**
- Session tokens MUST use secure, httpOnly cookies where possible
- If localStorage is used for session data, it MUST be encrypted
- Draft form data in localStorage MUST not contain PII in plaintext
- Backup logs in localStorage MUST not contain sensitive information
- localStorage data MUST have expiration mechanisms

**Rationale:** Session tokens (unified-auth.js:137), draft data (borang.html:6034), and backup logs (index.html:2796) in localStorage are vulnerable to XSS attacks.

**Use Cases:**
- UC-018: Session management
- UC-019: Form draft persistence
- UC-020: Backup data storage

---

### REQ-007: Supabase Client Consistency

**Source:** EXPLORATION.md §5.4.1 (Supabase Client Usage)  
**Severity:** MEDIUM  
**Type:** CODE_QUALITY

The system MUST use consistent Supabase client initialization and naming across all files.

**Specific Requirements:**
- Supabase client MUST be initialized with consistent naming convention
- All files MUST use the same client variable name (either supabaseClient or window.sb, not both)
- Client initialization MUST use the same configuration pattern
- Storage operations MUST use the correct client reference (supabaseClient.storage, not supabase.storage)

**Rationale:** Inconsistent naming (supabaseClient in index.html:2329 vs window.sb in borang.html:45) causes confusion and potential errors.

**Use Cases:**
- UC-021: Database operations
- UC-022: Storage operations
- UC-023: Authentication operations

---

### REQ-008: Storage Signed URL Security

**Source:** EXPLORATION.md §5.4.2, §4.4 (Storage Operations)  
**Severity:** MEDIUM  
**Type:** SECURITY

The system MUST use signed URLs for private bucket access with proper expiration.

**Specific Requirements:**
- All private bucket downloads MUST use createSignedUrl() with expiration
- Signed URLs MUST have reasonable expiration time (e.g., 1 hour)
- Signed URL generation MUST validate user permissions
- Path-based RLS MUST enforce IC number validation in bucket paths
- Signed URLs MUST NOT be logged or stored persistently

**Rationale:** Signed URLs (receipt-pv-ui.js:677-686, 696-705) provide temporary access tokens, but must be properly configured for security.

**Use Cases:**
- UC-024: Receipt PDF download
- UC-025: Voucher PDF download
- UC-026: Application PDF download

---

### REQ-009: Test Coverage

**Source:** EXPLORATION.md §6 (Testing Analysis)  
**Severity:** LOW  
**Type:** QUALITY

The system MUST have comprehensive test coverage for critical business logic paths.

**Specific Requirements:**
- Unit tests MUST exist for business logic (not just validation utilities)
- E2E tests MUST cover both index.html and borang.html
- Integration tests MUST verify end-to-end workflows with real services
- Tests MUST verify schema consistency (table/column names)
- Tests MUST verify XSS prevention at all user input points

**Rationale:** Current tests only cover validation utilities (tests/unit/validation.test.js) and borang.html E2E (tests/e2e/test_borang.py). No tests for index.html or business logic.

**Use Cases:**
- UC-027: Member registration workflow
- UC-028: Receipt generation workflow
- UC-029: Payment voucher approval workflow
- UC-030: Email notification workflow

---

### REQ-010: Production Logging

**Source:** EXPLORATION.md §5.3, §7.3.1 (Logging)  
**Severity:** LOW  
**Type:** OPERATIONAL

The system MUST implement structured logging with log level control for production.

**Specific Requirements:**
- console.log calls MUST be replaced with structured logging framework
- Logging MUST support log levels (DEBUG, INFO, WARN, ERROR)
- Production builds MUST disable DEBUG logs
- Sensitive data MUST NOT be logged
- Logs MUST be centralized (e.g., Sentry integration already exists)

**Rationale:** 200+ console.log calls expose debug information in production with no log level control or centralization.

**Use Cases:**
- UC-031: Error tracking
- UC-032: Performance monitoring
- UC-033: Security event logging

---

## Use Cases

### UC-001: Member Data Retrieval

**Related Requirements:** REQ-001  
**Description:** Admin users retrieve member data from the "AHLI DPMM JOHOR" table using exact UPPERCASE column names.

**Preconditions:** User is authenticated with admin role  
**Steps:**
1. User requests member list
2. System queries "AHLI DPMM JOHOR" table with columns NO_AHLI, NAMA_AHLI, NAMA, ALAMAT, JANTINA, EMEL, KAD_PENGENALAN, NO_HP
3. System displays member data

**Postconditions:** Member data displayed without errors

---

### UC-002: Receipt/Voucher Data Operations

**Related Requirements:** REQ-001  
**Description:** System performs CRUD operations on receipts and vouchers tables using exact lowercase table names.

**Preconditions:** User is authenticated with appropriate role  
**Steps:**
1. User creates receipt/voucher
2. System inserts into "receipts" or "vouchers" table (lowercase)
3. System retrieves data for display
4. System updates records as needed

**Postconditions:** Data operations succeed without 400 errors

---

### UC-003: Migration Application

**Related Requirements:** REQ-001  
**Description:** Database migrations are applied and validated against live schema.

**Preconditions:** Migration file exists  
**Steps:**
1. Developer reviews migration file
2. System validates table/column names against live schema
3. System applies migration
4. System verifies schema consistency

**Postconditions:** Migration applied without schema drift

---

### UC-004: System Initialization

**Related Requirements:** REQ-002  
**Description:** System loads configuration from secure sources without hardcoded credentials.

**Preconditions:** Environment variables configured  
**Steps:**
1. System loads configuration from environment
2. System initializes Supabase client with anon key from environment
3. System initializes EmailJS with keys from environment
4. System validates all required credentials present

**Postconditions:** System initialized without hardcoded credentials

---

### UC-005: Email Sending

**Related Requirements:** REQ-002  
**Description:** System sends emails using EmailJS or Edge Function with secure credentials.

**Preconditions:** Email content prepared  
**Steps:**
1. System loads EmailJS configuration from secure source
2. System sends email via EmailJS or Edge Function
3. System logs email send event to audit log

**Postconditions:** Email sent without exposing credentials

---

### UC-006: AI Proxy Operations

**Related Requirements:** REQ-002  
**Description:** System proxies AI requests through Edge Function with secure API keys.

**Preconditions:** AI request initiated  
**Steps:**
1. System sends request to ai-proxy-fixed Edge Function
2. Edge Function uses GROQ/Gemini keys from environment
3. System returns AI response to client

**Postconditions:** AI request processed without exposing keys

---

### UC-007: Form Submission

**Related Requirements:** REQ-003  
**Description:** User submits membership form with all input properly escaped.

**Preconditions:** User fills form  
**Steps:**
1. User submits form
2. System escapes all user input using escapeHtml()
3. System validates escaped data
4. System stores data in database

**Postconditions:** Data stored without XSS vulnerability

---

### UC-008: Email Generation

**Related Requirements:** REQ-003  
**Description:** System generates email templates with all user data escaped.

**Preconditions:** Email content prepared  
**Steps:**
1. System loads email template
2. System escapes all user data fields using escapeHtml()
3. System renders email with escaped data
4. System sends email

**Postconditions:** Email sent without XSS vulnerability

---

### UC-009: File Upload Display

**Related Requirements:** REQ-003  
**Description:** System displays uploaded filenames with proper escaping.

**Preconditions:** File uploaded  
**Steps:**
1. User uploads file
2. System escapes filename using escapeHtml()
3. System displays escaped filename in UI

**Postconditions:** Filename displayed without XSS vulnerability

---

### UC-010: Data Rendering

**Related Requirements:** REQ-003  
**Description:** System renders user data in UI with proper escaping.

**Preconditions:** Data retrieved from database  
**Steps:**
1. System retrieves user data
2. System escapes all user data fields using escapeHtml()
3. System renders escaped data in UI

**Postconditions:** Data displayed without XSS vulnerability

---

### UC-011: Data Access Control

**Related Requirements:** REQ-004  
**Description:** System enforces RLS policies consistently across all tables.

**Preconditions:** User authenticated  
**Steps:**
1. User requests data access
2. System checks RLS policy for requested table
3. System verifies auth.uid()::TEXT cast matches column type
4. System grants or denies access based on policy

**Postconditions:** Access granted according to consistent RLS policy

---

### UC-012: Storage Access Validation

**Related Requirements:** REQ-004  
**Description:** System validates storage access using path-based RLS.

**Preconditions:** User requests file access  
**Steps:**
1. User requests file from private bucket
2. System validates IC number in file path
3. System checks RLS policy for bucket
4. System grants or denies access

**Postconditions:** File access granted according to RLS policy

---

### UC-013: User Role Verification

**Related Requirements:** REQ-004  
**Description:** System verifies user roles against consistent RLS policies.

**Preconditions:** User attempts operation  
**Steps:**
1. System retrieves user role from DPMM_USERS
2. System checks RLS policy role requirements
3. System grants or denies operation based on role

**Postconditions:** Operation granted according to role-based access

---

### UC-014: Form Validation Errors

**Related Requirements:** REQ-005  
**Description:** System displays form validation errors in UI without alert().

**Preconditions:** Form validation fails  
**Steps:**
1. System detects validation error
2. System displays error message in UI element (not alert)
3. System highlights invalid fields
4. System logs error to audit log

**Postconditions:** User sees error message without blocking UI

---

### UC-015: Database Operation Errors

**Related Requirements:** REQ-005  
**Description:** System handles database errors with structured error reporting.

**Preconditions:** Database operation fails  
**Steps:**
1. System catches database error
2. System displays error message in UI element
3. System logs error details to audit log
4. System provides recovery options

**Postconditions:** Error handled without blocking UI

---

### UC-016: File Upload Errors

**Related Requirements:** REQ-005  
**Description:** System handles file upload errors with structured error reporting.

**Preconditions:** File upload fails  
**Steps:**
1. System catches upload error
2. System displays error message in UI element
3. System logs error details to audit log
4. System allows retry

**Postconditions:** Error handled without blocking UI

---

### UC-017: API Call Errors

**Related Requirements:** REQ-005  
**Description:** System handles API call errors with structured error reporting.

**Preconditions:** API call fails  
**Steps:**
1. System catches API error
2. System displays error message in UI element
3. System logs error details to audit log
4. System provides retry option

**Postconditions:** Error handled without blocking UI

---

### UC-018: Session Management

**Related Requirements:** REQ-006  
**Description:** System manages user sessions securely without plaintext localStorage.

**Preconditions:** User authenticates  
**Steps:**
1. System creates session token
2. System stores token securely (encrypted or httpOnly cookie)
3. System validates token on each request
4. System expires token after timeout

**Postconditions:** Session managed securely

---

### UC-019: Form Draft Persistence

**Related Requirements:** REQ-006  
**Description:** System persists form drafts securely without plaintext PII.

**Preconditions:** User saves draft  
**Steps:**
1. System collects draft data
2. System encrypts PII fields before storage
3. System stores encrypted draft in localStorage
4. System decrypts on load

**Postconditions:** Draft stored securely

---

### UC-020: Backup Data Storage

**Related Requirements:** REQ-006  
**Description:** System stores backup data without sensitive information.

**Preconditions:** Backup created  
**Steps:**
1. System collects backup data
2. System removes sensitive fields before storage
2. System stores sanitized backup in localStorage
3. System implements expiration

**Postconditions:** Backup stored securely

---

### UC-021: Database Operations

**Related Requirements:** REQ-007  
**Description:** System performs database operations using consistent client naming.

**Preconditions:** Database operation requested  
**Steps:**
1. System uses consistently named Supabase client
2. System performs operation
3. System handles response

**Postconditions:** Operation succeeds with consistent client usage

---

### UC-022: Storage Operations

**Related Requirements:** REQ-007  
**Description:** System performs storage operations using correct client reference.

**Preconditions:** Storage operation requested  
**Steps:**
1. System uses supabaseClient.storage (not supabase.storage)
2. System performs storage operation
3. System handles response

**Postconditions:** Operation succeeds with correct client reference

---

### UC-023: Authentication Operations

**Related Requirements:** REQ-007  
**Description:** System performs authentication operations using consistent client.

**Preconditions:** Auth operation requested  
**Steps:**
1. System uses consistently named Supabase client
2. System performs auth operation
3. System handles response

**Postconditions:** Auth operation succeeds with consistent client

---

### UC-024: Receipt PDF Download

**Related Requirements:** REQ-008  
**Description:** System generates signed URL for receipt PDF download with expiration.

**Preconditions:** User requests receipt PDF  
**Steps:**
1. System validates user permissions
2. System generates signed URL with expiration
3. System provides URL to user
4. System logs access event

**Postconditions:** PDF downloaded securely

---

### UC-025: Voucher PDF Download

**Related Requirements:** REQ-008  
**Description:** System generates signed URL for voucher PDF download with expiration.

**Preconditions:** User requests voucher PDF  
**Steps:**
1. System validates user permissions
2. System generates signed URL with expiration
3. System provides URL to user
4. System logs access event

**Postconditions:** PDF downloaded securely

---

### UC-026: Application PDF Download

**Related Requirements:** REQ-008  
**Description:** System generates signed URL for application PDF download with expiration.

**Preconditions:** User requests application PDF  
**Steps:**
1. System validates user permissions
2. System generates signed URL with expiration
3. System provides URL to user
4. System logs access event

**Postconditions:** PDF downloaded securely

---

### UC-027: Member Registration Workflow

**Related Requirements:** REQ-009  
**Description:** End-to-end test of member registration from form to approval.

**Preconditions:** None  
**Steps:**
1. User submits membership form
2. System generates PDF
3. System sends email notification
4. Admin reviews application
5. Admin approves application

**Postconditions:** Member registered successfully

---

### UC-028: Receipt Generation Workflow

**Related Requirements:** REQ-009  
**Description:** End-to-end test of receipt generation and delivery.

**Preconditions:** Member exists  
**Steps:**
1. Admin creates receipt
2. System generates receipt PDF
3. System stores PDF in private bucket
4. System sends WhatsApp/Email notification

**Postconditions:** Receipt generated and delivered

---

### UC-029: Payment Voucher Approval Workflow

**Related Requirements:** REQ-009  
**Description:** End-to-end test of payment voucher approval workflow.

**Preconditions:** Voucher created  
**Steps:**
1. Bendahari creates voucher
2. YDP reviews and approves
3. NYDP reviews and approves
4. TYDP reviews and approves
5. System generates voucher PDF

**Postconditions:** Voucher approved and generated

---

### UC-030: Email Notification Workflow

**Related Requirements:** REQ-009  
**Description:** End-to-end test of email notification delivery.

**Preconditions:** Event triggers email  
**Steps:**
1. System prepares email content
2. System escapes all user data
3. System sends email via EmailJS or Edge Function
4. System logs send event

**Postconditions:** Email delivered successfully

---

### UC-031: Error Tracking

**Related Requirements:** REQ-010  
**Description:** System tracks errors with structured logging.

**Preconditions:** Error occurs  
**Steps:**
1. System catches error
2. System logs error with structured data
3. System sets appropriate log level
4. System sends to centralized logging

**Postconditions:** Error tracked centrally

---

### UC-032: Performance Monitoring

**Related Requirements:** REQ-010  
**Description:** System monitors performance metrics with structured logging.

**Preconditions:** Operation performed  
**Steps:**
1. System measures operation duration
2. System logs performance data
3. System aggregates metrics
4. System alerts on anomalies

**Postconditions:** Performance monitored

---

### UC-033: Security Event Logging

**Related Requirements:** REQ-010  
**Description:** System logs security events with structured logging.

**Preconditions:** Security event occurs  
**Steps:**
1. System detects security event
2. System logs event with structured data
3. System sets ERROR log level
4. System sends to centralized logging

**Postconditions:** Security event tracked

---

## Completeness Assessment

**Total Requirements:** 10  
**Total Use Cases:** 33  
**Requirements with Use Cases:** 10 (100%)  
**Use Cases with Requirements:** 33 (100%)

**Coverage Areas:**
- Database Schema: REQ-001 (UC-001, UC-002, UC-003)
- Security: REQ-002, REQ-003, REQ-004, REQ-006, REQ-008 (UC-004-006, UC-011-013, UC-018-020, UC-024-026)
- Code Quality: REQ-005, REQ-007 (UC-014-017, UC-021-023)
- Testing: REQ-009 (UC-027-030)
- Operations: REQ-010 (UC-031-033)

**Gap Analysis:** No gaps identified. All exploration findings have corresponding requirements and use cases.

---

**End of Requirements Document**
