# Spec Audit Protocol — SISTEM-AHLI-DPMM-JOHOR

**Project:** SISTEM-AHLI-DPMM-JOHOR  
**Version:** 1.0  
**Date:** 2026-07-22

---

## Overview

This protocol defines the Council of Three spec audit process for the SISTEM-AHLI-DPMM-JOHOR project. Three independent AI auditors review the code against requirements to catch defects that any single model might miss.

---

## Council of Three Process

### Auditor Roles
- **Auditor A:** Focus on database schema and data access patterns
- **Auditor B:** Focus on security (XSS, credentials, RLS, localStorage)
- **Auditor C:** Focus on code quality (error handling, logging, client consistency)

### Audit Scope
Each auditor reviews the codebase against all requirements (REQ-001 through REQ-010) but with their focus area emphasized.

---

## Audit Areas

### Area 1: Database Schema and Data Access (Auditor A)

**Requirements:** REQ-001, REQ-004, REQ-007, REQ-008

**Review Checklist:**
1. **REQ-001 (Schema Consistency):**
   - [ ] All database queries use exact table names from live schema
   - [ ] "AHLI DPMM JOHOR" queries use UPPERCASE columns (NO_AHLI, NAMA_AHLI, etc.)
   - [ ] "receipts"/"vouchers" tables referenced in lowercase
   - [ ] No references to "payment_vouchers" (doesn't exist)
   - [ ] Migration files validated against live schema

2. **REQ-004 (RLS Consistency):**
   - [ ] All RLS policies use auth.uid()::TEXT cast
   - [ ] RLS policies consistent across tables
   - [ ] Type casting matches column data types
   - [ ] Storage RLS uses path-based access control

3. **REQ-007 (Client Consistency):**
   - [ ] Supabase client naming consistent (supabaseClient vs window.sb)
   - [ ] Storage operations use supabaseClient.storage
   - [ ] Client initialization pattern consistent

4. **REQ-008 (Signed URL Security):**
   - [ ] Private bucket downloads use createSignedUrl()
   - [ ] Signed URLs have expiration times
   - [ ] Signed URL generation validates permissions
   - [ ] Path-based RLS enforces IC validation

**Audit Method:**
- Grep for database query patterns
- Verify table/column names against schema documentation
- Check migration files for RLS policies
- Verify client naming across files

---

### Area 2: Security (Auditor B)

**Requirements:** REQ-002, REQ-003, REQ-004, REQ-006

**Review Checklist:**
1. **REQ-002 (Credential Security):**
   - [ ] No hardcoded Supabase anon key in source
   - [ ] No hardcoded EmailJS keys in source
   - [ ] No placeholder keys in production builds
   - [ ] Credentials loaded from window.CONFIG
   - [ ] Edge Function uses environment variables

2. **REQ-003 (XSS Prevention):**
   - [ ] All user input uses escapeHtml() before HTML interpolation
   - [ ] escapeHtml() escapes &, <, >, ", ' in that order
   - [ ] Email template fields escaped
   - [ ] Uploaded filenames escaped
   - [ ] No innerHTML without escapeHtml()

3. **REQ-004 (RLS Consistency):**
   - [ ] RLS policies prevent unauthorized access
   - [ ] RLS policies tested in both contexts
   - [ ] No tables without RLS policies

4. **REQ-006 (localStorage Security):**
   - [ ] Session tokens use httpOnly cookies where possible
   - [ ] localStorage data encrypted if used
   - [ ] No PII in plaintext localStorage
   - [ ] localStorage data has expiration

**Audit Method:**
- Grep for hardcoded credentials
- Grep for innerHTML assignments
- Verify escapeHtml() usage at all user input points
- Check localStorage usage for sensitive data
- Review RLS policy definitions

---

### Area 3: Code Quality (Auditor C)

**Requirements:** REQ-005, REQ-007, REQ-009, REQ-010

**Review Checklist:**
1. **REQ-005 (Error Handling):**
   - [ ] No alert() calls for error messages
   - [ ] Errors displayed in UI elements (modals, toasts)
   - [ ] Errors logged to DPMM_AUDIT_LOG
   - [ ] Try-catch blocks used consistently
   - [ ] Errors don't block entire UI

2. **REQ-007 (Client Consistency):**
   - [ ] Supabase client naming consistent
   - [ ] No mixed supabaseClient/window.sb in same file
   - [ ] Storage operations use correct reference

3. **REQ-009 (Test Coverage):**
   - [ ] Unit tests exist for business logic
   - [ ] E2E tests cover both index.html and borang.html
   - [ ] Integration tests verify end-to-end workflows
   - [ ] Tests verify schema consistency
   - [ ] Tests verify XSS prevention

4. **REQ-010 (Production Logging):**
   - [ ] console.log replaced with structured logging
   - [ ] Log levels implemented (DEBUG, INFO, WARN, ERROR)
   - [ ] Production builds disable DEBUG logs
   - [ ] Sensitive data not logged
   - [ ] Logs centralized (Sentry)

**Audit Method:**
- Grep for alert() calls
- Grep for console.log calls
- Review test files for coverage
- Check logging implementation
- Verify error handling patterns

---

## Triage Process

### Step 1: Individual Audit Reports
Each auditor produces a report with:
- Findings per requirement
- Severity assessment (HIGH/MEDIUM/LOW)
- File:line citations
- Evidence description

### Step 2: Triage Meeting
Auditors review findings together and:
- **Consensus:** All three auditors agree on finding
- **Disagreement:** Auditors discuss and reach consensus
- **New Finding:** Discussion reveals additional issue not initially found
- **Dismissal:** Finding deemed false positive with justification

### Step 3: Verification Probes
For disputed findings, run verification probes:
- **Code Inspection:** Re-examine code at cited location
- **Test Execution:** Run test to verify behavior
- **Documentation Check:** Verify against requirements specification

### Step 4: Final Determination
Each finding gets one of:
- **SATISFIED:** Requirement met, no action needed
- **VIOLATION:** Requirement violated, bug report needed
- **INCONCLUSIVE:** Cannot determine, needs investigation
- **DEFERRED:** Not in scope for this audit

---

## Audit Report Template

```markdown
# Spec Audit Report - [Auditor Name]

**Auditor:** [name]
**Focus Area:** [database/security/code_quality]
**Date:** [date]

## Findings by Requirement

### REQ-001: Database Schema Consistency
- [Finding 1] - file:line - severity
- [Finding 2] - file:line - severity

### REQ-002: Credential Security
- [Finding 1] - file:line - severity

[... other requirements]

## Summary

**Total Findings:** N
**HIGH Severity:** N
**MEDIUM Severity:** N
**LOW Severity:** N
**SATISFIED Requirements:** N
**VIOLATED Requirements:** N
**INCONCLUSIVE:** N
**DEFERRED:** N
```

---

## Triage Report Template

```markdown
# Triage Report

**Date:** [date]
**Auditors:** A, B, C

## Consensus Findings

| Requirement | Finding | Severity | Status |
|-------------|---------|----------|--------|
| REQ-001 | [description] | HIGH | VIOLATION |
| REQ-002 | [description] | MEDIUM | SATISFIED |

## Disputed Findings

| Requirement | Finding | Auditor A | Auditor B | Auditor C | Resolution |
|-------------|---------|-----------|-----------|-----------|------------|
| REQ-003 | [description] | VIOLATION | SATISFIED | VIOLATION | VIOLATION |

## Verification Probes

| Probe | Result | Evidence |
|-------|--------|----------|
| [probe description] | PASS/FAIL | [evidence] |

## Final Determination

**Total Violations:** N
**Total Satisfied:** N
**Total Inconclusive:** N
**Total Deferred:** N
```

---

## Guardrails

### Before Audit
- Read REQUIREMENTS.md
- Read EXPLORATION.md
- Understand focus area

### During Audit
- Cite file:line for all findings
- Link findings to specific requirements
- Provide evidence for violations
- Distinguish between code issue and spec issue

### After Audit
- Participate in triage process
- Provide justification for disputed findings
- Accept consensus determination

---

## Execution Instructions

### Step 1: Individual Audits
Each auditor runs independently:
1. Load this protocol
2. Read REQUIREMENTS.md
3. Execute audit checklist for focus area
4. Generate individual audit report

### Step 2: Triage
1. Collect all three audit reports
2. Review findings together
3. Resolve disagreements through discussion
4. Run verification probes if needed
5. Generate triage report

### Step 3: Bug Reporting
For all VIOLATION findings:
1. Create bug entry in BUGS.md
2. Write regression test
3. Assign severity based on triage

**Time Estimate:**
- Individual audit: 60-90 minutes per auditor
- Triage: 30-60 minutes
- Total: 3-4 hours

---

## Quality Gates

### Before Code Merge
- All HIGH severity violations must be fixed
- MEDIUM severity violations should be fixed
- LOW severity violations can be deferred

### Before Deployment
- All violations must be fixed or explicitly deferred with justification
- All deferred violations documented in BUGS.md

---

**End of Spec Audit Protocol**
