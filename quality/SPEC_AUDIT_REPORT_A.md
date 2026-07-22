# Spec Audit Report - Auditor A

**Auditor:** Auditor A (Database Schema and Data Access Focus)  
**Focus Area:** Database Schema and Data Access  
**Date:** 2026-07-22

---

## Findings by Requirement

### REQ-001: Database Schema Consistency

**Finding A-001:** Migration files reference incorrect column names
- **File:** migrations/receipt-pv-system-phase1.sql:13, 42, 265-276
- **File:** migrations/receipt-pv-schema-align.sql:29
- **Severity:** MEDIUM
- **Description:** Migration files use `nombor_ahli` but live schema uses `NO_AHLI`
- **Evidence:** SQL files define columns with lowercase names that don't match live UPPERCASE schema
- **Status:** VIOLATION

**Finding A-002:** Main application code uses correct schema
- **File:** index.html, borang.html, receipt-pv-ui.js
- **Severity:** N/A
- **Description:** Main code correctly uses UPPERCASE column names (NO_AHLI, NAMA_AHLI)
- **Evidence:** Code queries use exact column names from live schema
- **Status:** SATISFIED

---

### REQ-004: RLS Policy Consistency

**Finding A-003:** RLS policies use correct type casting
- **File:** migrations/receipt-pv-system-phase1.sql:181-241
- **Severity:** N/A
- **Description:** RLS policies consistently use auth.uid()::TEXT cast
- **Evidence:** All RLS policies include type casting for TEXT-based user_id columns
- **Status:** SATISFIED

---

### REQ-007: Supabase Client Consistency

**Finding A-004:** Client naming inconsistency between files
- **File:** index.html uses supabaseClient, borang.html uses window.sb
- **Severity:** LOW
- **Description:** Different client names in different files
- **Evidence:** index.html:2329 vs borang.html:45
- **Status:** VIOLATION

---

### REQ-008: Storage Signed URL Security

**Finding A-005:** Signed URLs used correctly
- **File:** receipt-pv-ui.js:677-686, 696-705
- **Severity:** N/A
- **Description:** Private bucket access uses createSignedUrl() with expiration
- **Evidence:** createSignedUrl called with expiresIn parameter
- **Status:** SATISFIED

---

## Summary

**Total Findings:** 3  
**VIOLATION:** 2 (A-001, A-004)  
**SATISFIED:** 3 (A-002, A-003, A-005)  
**INCONCLUSIVE:** 0  
**DEFERRED:** 0

**Requirements Violated:**
- REQ-001: 1 violation (migration schema drift)
- REQ-007: 1 violation (client naming inconsistency)

**Requirements Satisfied:**
- REQ-001: Main code (migration files separate issue)
- REQ-004: RLS Policy Consistency
- REQ-008: Storage Signed URL Security

---

**End of Spec Audit Report - Auditor A**
