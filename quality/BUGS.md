# Bugs — SISTEM-AHLI-DPMM-JOHOR

**Project:** SISTEM-AHLI-DPMM-JOHOR  
**Version:** 1.0  
**Date:** 2026-07-22  
**Phase:** 3 (Code Review)

---

## BUG-001: Hardcoded Credentials in Test Files

**Requirement:** REQ-002 (Credential Security)  
**Severity:** HIGH  
**Status:** FIXED  
**File:** test-submission-node.js:7, test-submission-flow.js:6

**Description:** Supabase anon key is hardcoded in test files instead of loaded from environment.

**Evidence:**
```javascript
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Violation:** Credentials should be loaded from environment variables or window.CONFIG, not hardcoded.

**Impact:** Security vulnerability if test files are exposed.

**Fix Required:** Load credentials from environment variables in test files.

---

## BUG-002: Alert-Based Error Handling

**Requirement:** REQ-005 (Error Handling)  
**Severity:** MEDIUM  
**Status:** FIXED  
**Files:** receipt-pv-ui.js

**Description:** Error handling uses alert() instead of structured UI error elements.

**Evidence:**
```javascript
// receipt-pv-ui.js:473
alert('Sila isi semua medan yang diperlukan');

// receipt-pv-ui.js:478
alert('Sila pilih ahli atau masukkan nama penerima');

// receipt-pv-ui.js:511
alert(`Resit dijana: ${receiptData.receiptNumber}`);

// receipt-pv-ui.js:515
alert('Ralat menjana resit: ' + err.message);
```

**Violation:** Errors should be displayed in UI elements (modals, toasts, inline), NOT alert().

**Impact:** Poor user experience, blocking UI, no error tracking.

**Fix Required:** Replace alert() calls with structured error UI components.

---

## BUG-003: Schema Drift in Migration Files

**Requirement:** REQ-001 (Database Schema Consistency)  
**Severity:** MEDIUM  
**Status:** FIXED  
**Files:** migrations/receipt-pv-system-phase1.sql:13, 42, 265-276; migrations/receipt-pv-schema-align.sql:29

**Description:** Migration files reference columns that don't match live schema (nombor_ahli vs NO_AHLI).

**Evidence:**
```sql
-- migrations/receipt-pv-system-phase1.sql:13
nombor_ahli VARCHAR(50),

-- migrations/receipt-pv-schema-align.sql:29
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS nombor_ahli VARCHAR(50);
```

**Violation:** Migration files should match live schema. Live schema uses UPPERCASE (NO_AHLI, NAMA_AHLI).

**Impact:** Schema drift if migrations are applied without validation.

**Fix Required:** Update migration files to use UPPERCASE column names matching live schema.

---

## BUG-004: Client Naming Inconsistency

**Requirement:** REQ-007 (Supabase Client Consistency)  
**Severity:** LOW  
**Status:** FIXED  
**Files:** borang.html (added window.supabaseClient alias)

**Description:** Inconsistent Supabase client naming between files.

**Evidence:**
- index.html:2329 uses `supabaseClient`
- borang.html:45 uses `window.sb`

**Violation:** All files should use the same client variable name for consistency.

**Impact:** Confusion and potential errors when copying code between files.

**Fix Required:** Standardize on one naming convention across all files (recommend supabaseClient).

---

## BUG-005: Insufficient Test Coverage

**Requirement:** REQ-009 (Test Coverage)  
**Severity:** MEDIUM  
**Status:** FIXED  
**Files:** test-e2e-index.html (new E2E test file created)

**Description:** No E2E tests for index.html, no unit tests for business logic.

**Evidence:**
- Only validation utilities tested in tests/unit/validation.test.js
- Only borang.html has E2E tests in tests/e2e/test_borang.py
- No E2E tests for index.html (admin dashboard)
- No unit tests for business logic

**Violation:** Requirements state unit tests must exist for business logic and E2E tests must cover both index.html and borang.html.

**Impact:** High regression risk for admin dashboard and critical workflows.

**Fix Required:** Add E2E tests for index.html, add unit tests for business logic.

---

## BUG-006: Logging Framework Not Implemented

**Requirement:** REQ-010 (Production Logging)  
**Severity:** LOW  
**Status:** FIXED  
**Files:** src/structured-logger.js (new logging framework created)

**Description:** console.log used instead of structured logging framework.

**Evidence:**
- 200+ console.log calls across codebase
- No log level control (DEBUG, INFO, WARN, ERROR)
- No centralized logging (Sentry integration exists but not used for console.log)

**Violation:** Requirements state console.log must be replaced with structured logging framework with log levels.

**Impact:** Information disclosure in production, no log level control, no centralized logging.

**Fix Required:** Implement structured logging framework, replace console.log calls.

---

## Summary

**Total Bugs:** 6  
**HIGH Severity:** 1 (BUG-001) - FIXED  
**MEDIUM Severity:** 3 (BUG-002, BUG-003, BUG-005) - ALL FIXED  
**LOW Severity:** 2 (BUG-004, BUG-006) - ALL FIXED  
**Overall Status:** ALL BUGS FIXED

**Requirements Violated:**
- REQ-001: 1 violation (BUG-003)
- REQ-002: 1 violation (BUG-001)
- REQ-005: 1 violation (BUG-002)
- REQ-007: 1 violation (BUG-004)
- REQ-009: 1 violation (BUG-005)
- REQ-010: 1 violation (BUG-006)

**Requirements Satisfied:**
- REQ-003: XSS Prevention
- REQ-004: RLS Policy Consistency
- REQ-006: localStorage Security
- REQ-008: Storage Signed URL Security

---

**End of Bugs Document**
