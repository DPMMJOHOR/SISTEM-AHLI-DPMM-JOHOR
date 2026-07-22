# Behavioral Contracts — SISTEM-AHLI-DPMM-JOHOR

**Project:** SISTEM-AHLI-DPMM-JOHOR  
**Version:** 1.0  
**Date:** 2026-07-22

---

## Contract 1: Database Schema Access

**Scope:** All database operations  
**Related Requirements:** REQ-001  

**Preconditions:**
- Live database schema is known and documented
- Table and column names are verified against live schema

**Behavior:**
- All Supabase queries MUST use exact table names as they exist in live schema
- All column references MUST use exact case as defined in live schema
- "AHLI DPMM JOHOR" table columns MUST be UPPERCASE (NO_AHLI, NAMA_AHLI, NAMA, etc.)
- "receipts" and "vouchers" tables MUST be referenced in lowercase
- Migration files MUST be validated against live schema before application

**Postconditions:**
- Database operations succeed without "column does not exist" errors
- No 400 errors due to schema mismatches

**Violation Detection:**
- Query returns error about missing column or table
- Test failures in schema validation
- Runtime errors with column name references

---

## Contract 2: Credential Management

**Scope:** All credential usage  
**Related Requirements:** REQ-002  

**Preconditions:**
- Environment variables are configured for deployment
- Configuration loading mechanism is in place

**Behavior:**
- Supabase anon key MUST be loaded from environment variables or window.CONFIG
- EmailJS keys MUST be loaded from secure configuration, not hardcoded
- Edge Function secrets MUST use Supabase environment variables
- No credentials may be hardcoded in source files
- Placeholder keys must be replaced with actual values or removed

**Postconditions:**
- System initializes without exposing credentials
- Credentials are not visible in source code or client-side JavaScript

**Violation Detection:**
- Credentials found in source code via grep
- Placeholder keys in production builds
- Configuration loading fails

---

## Contract 3: XSS Prevention

**Scope:** All user input handling  
**Related Requirements:** REQ-003  

**Preconditions:**
- escapeHtml() function is defined and available
- User input sources are identified

**Behavior:**
- All user input interpolated into HTML MUST pass through escapeHtml()
- escapeHtml() MUST escape &, <, >, ", ' in that order
- Email template fields MUST be escaped before rendering
- Uploaded filenames MUST be escaped before display
- No user input may be directly assigned to innerHTML without escaping

**Postconditions:**
- User input is sanitized before HTML rendering
- XSS attack vectors are neutralized

**Violation Detection:**
- innerHTML assignments without escapeHtml()
- Email templates with unescaped user data
- Filename display without escaping

---

## Contract 4: RLS Policy Enforcement

**Scope:** All database table access  
**Related Requirements:** REQ-004  

**Preconditions:**
- RLS policies are defined for all tables
- User authentication is in place

**Behavior:**
- All RLS policies MUST use auth.uid()::TEXT cast for TEXT-based user_id columns
- RLS policies MUST be consistent across all tables (either all anon or all authenticated)
- Type casting in RLS policies MUST match actual column data types
- Storage bucket RLS MUST use path-based access control
- RLS policies MUST be tested in both authenticated and anonymous contexts

**Postconditions:**
- Data access is controlled according to user roles
- No unauthorized data access occurs

**Violation Detection:**
- Missing RLS policies on tables
- Inconsistent type casting in policies
- Unauthorized data access in tests

---

## Contract 5: Error Handling

**Scope:** All error conditions  
**Related Requirements:** REQ-005  

**Preconditions:**
- Error UI components are available
- Audit logging system is functional

**Behavior:**
- Error messages MUST be displayed in UI elements (modals, toasts, inline), NOT alert()
- Error messages MUST include actionable information
- All errors MUST be logged to DPMM_AUDIT_LOG table
- Error handling MUST use try-catch blocks consistently
- Errors MUST NOT block the entire UI where possible

**Postconditions:**
- Users see helpful error messages
- Errors are tracked for analysis
- UI remains responsive during errors

**Violation Detection:**
- alert() calls in error handling
- Errors not logged to audit log
- UI completely blocked by errors

---

## Contract 6: localStorage Security

**Scope:** All localStorage usage  
**Related Requirements:** REQ-006  

**Preconditions:**
- Encryption mechanisms are available
- Secure cookie options are configured

**Behavior:**
- Session tokens MUST use secure, httpOnly cookies where possible
- If localStorage is used for session data, it MUST be encrypted
- Draft form data in localStorage MUST not contain PII in plaintext
- Backup logs in localStorage MUST not contain sensitive information
- localStorage data MUST have expiration mechanisms

**Postconditions:**
- Sensitive data is protected in localStorage
- Session tokens are not easily stealable via XSS

**Violation Detection:**
- PII in localStorage plaintext
- Session tokens in localStorage without encryption
- No expiration on sensitive localStorage data

---

## Contract 7: Supabase Client Consistency

**Scope:** All Supabase client usage  
**Related Requirements:** REQ-007  

**Preconditions:**
- Supabase client initialization pattern is defined

**Behavior:**
- Supabase client MUST be initialized with consistent naming convention
- All files MUST use the same client variable name (supabaseClient or window.sb, not both)
- Client initialization MUST use the same configuration pattern
- Storage operations MUST use supabaseClient.storage, not supabase.storage

**Postconditions:**
- Supabase operations use consistent client references
- No confusion from mixed naming conventions

**Violation Detection:**
- Mixed client naming (supabaseClient vs window.sb)
- Incorrect storage reference (supabase.storage)
- Inconsistent initialization patterns

---

## Contract 8: Storage Signed URL Security

**Scope:** All private bucket access  
**Related Requirements:** REQ-008  

**Preconditions:**
- Private buckets are configured
- Signed URL generation is available

**Behavior:**
- All private bucket downloads MUST use createSignedUrl() with expiration
- Signed URLs MUST have reasonable expiration time (e.g., 1 hour)
- Signed URL generation MUST validate user permissions
- Path-based RLS MUST enforce IC number validation in bucket paths
- Signed URLs MUST NOT be logged or stored persistently

**Postconditions:**
- File access is temporary and permission-controlled
- No permanent access tokens are exposed

**Violation Detection:**
- Direct bucket access without signed URLs
- Signed URLs without expiration
- Signed URLs stored persistently

---

## Contract 9: Test Coverage

**Scope:** All test suites  
**Related Requirements:** REQ-009  

**Preconditions:**
- Test framework is configured
- Test environment is available

**Behavior:**
- Unit tests MUST exist for business logic (not just validation utilities)
- E2E tests MUST cover both index.html and borang.html
- Integration tests MUST verify end-to-end workflows with real services
- Tests MUST verify schema consistency (table/column names)
- Tests MUST verify XSS prevention at all user input points

**Postconditions:**
- Critical business logic is tested
- Schema consistency is verified
- XSS prevention is validated

**Violation Detection:**
- Missing unit tests for business logic
- Missing E2E tests for index.html
- No schema consistency tests
- No XSS prevention tests

---

## Contract 10: Production Logging

**Scope:** All logging operations  
**Related Requirements:** REQ-010  

**Preconditions:**
- Logging framework is configured
- Centralized logging is available

**Behavior:**
- console.log calls MUST be replaced with structured logging framework
- Logging MUST support log levels (DEBUG, INFO, WARN, ERROR)
- Production builds MUST disable DEBUG logs
- Sensitive data MUST NOT be logged
- Logs MUST be centralized (e.g., Sentry)

**Postconditions:**
- Logs are structured and searchable
- Sensitive data is not exposed
- Production logs are appropriate for operations

**Violation Detection:**
- console.log in production code
- Sensitive data in logs
- No log level control
- No centralized logging

---

**End of Behavioral Contracts**
