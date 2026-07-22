# Code Review Protocol — SISTEM-AHLI-DPMM-JOHOR

**Project:** SISTEM-AHLI-DPMM-JOHOR  
**Version:** 1.0  
**Date:** 2026-07-22

---

## Overview

This protocol defines the three-pass code review process for the SISTEM-AHLI-DPMM-JOHOR project. The review focuses on verifying code against requirements (REQUIREMENTS.md) and detecting quality issues identified in exploration (EXPLORATION.md).

---

## Three-Pass Review Process

### Pass 1: Structural Review

**Purpose:** Identify structural issues, code smells, and anti-patterns

**Focus Areas:**
1. **Monolithic File Size:** Check if files exceed 3000 lines (current: index.html ~8000, borang.html ~7000)
2. **Function Complexity:** Check cyclomatic complexity > 10
3. **Code Duplication:** Check for >5% duplication
4. **Naming Consistency:** Check Supabase client naming (supabaseClient vs window.sb)
5. **Error Handling:** Check for alert() usage (100+ occurrences expected)
6. **Logging:** Check for console.log usage (200+ occurrences expected)
7. **Variable Scope:** Check for variables defined outside function scope where used

**Procedure:**
1. Read the file(s) to be reviewed
2. Apply structural checks listed above
3. Document findings with file:line citations
4. Cite relevant requirements (REQ-005, REQ-007, REQ-010)

**Output:** Structural review findings with severity (HIGH/MEDIUM/LOW)

---

### Pass 2: Requirement Verification

**Purpose:** Verify code implements requirements correctly

**Focus Areas:**
1. **REQ-001 (Schema Consistency):** Verify all database queries use exact table/column names
   - Check "AHLI DPMM JOHOR" queries use UPPERCASE columns (NO_AHLI, NAMA_AHLI, etc.)
   - Check "receipts"/"vouchers" tables referenced in lowercase
   - Check no references to "payment_vouchers" (doesn't exist in live schema)
2. **REQ-002 (Credential Security):** Verify no hardcoded credentials
   - Check config-loader.js for hardcoded keys
   - Check HTML files for placeholder keys
   - Verify credentials loaded from window.CONFIG
3. **REQ-003 (XSS Prevention):** Verify all user input uses escapeHtml()
   - Check all innerHTML assignments
   - Check email template interpolations
   - Check filename display
4. **REQ-004 (RLS Consistency):** Verify RLS policies use auth.uid()::TEXT cast
   - Check migration files for RLS policies
   - Verify type casting matches column types
5. **REQ-006 (localStorage Security):** Verify sensitive data not in plaintext
   - Check unified-auth.js for session tokens
   - Check borang.html for draft data
   - Check index.html for backup logs
6. **REQ-007 (Client Consistency):** Verify consistent Supabase client naming
   - Check index.html uses supabaseClient
   - Check borang.html uses window.sb
   - Check storage operations use supabaseClient.storage
7. **REQ-008 (Signed URL Security):** Verify private bucket access uses signed URLs
   - Check receipt-pv-ui.js for createSignedUrl usage
   - Verify expiration times are set

**Procedure:**
1. Read REQUIREMENTS.md to understand requirements
2. For each requirement, grep the codebase for relevant patterns
3. Verify implementation matches requirement specification
4. Document violations with file:line citations
5. Cite specific requirement being violated

**Output:** Requirement verification findings with severity (HIGH/MEDIUM/LOW)

---

### Pass 3: Cross-Requirement Consistency

**Purpose:** Check for contradictions between requirements in implementation

**Focus Areas:**
1. **Schema vs Client Consistency:** Verify code uses same table/column names consistently
2. **XSS vs Email Consistency:** Verify escapeHtml() used in both UI and email templates
3. **RLS vs Auth Consistency:** Verify RLS policies match auth implementation
4. **Error vs Logging Consistency:** Verify errors are both displayed to user AND logged
5. **Storage vs RLS Consistency:** Verify storage RLS matches database RLS patterns

**Procedure:**
1. Compare implementation across files for each consistency area
2. Identify contradictions or inconsistencies
3. Document findings with file:line citations
4. Cite conflicting requirements

**Output:** Consistency findings with severity (HIGH/MEDIUM/LOW)

---

## Field Reference Table

| Requirement | Grep Pattern | Expected Pattern | Example Violation |
|-------------|--------------|-----------------|-------------------|
| REQ-001 | `\.from\(['"]AHLI DPMM JOHOR['"]` | Exact table name with spaces | `.from("ahlidpmmjohor")` |
| REQ-001 | `NO_AHLI\|NAMA_AHLI\|NAMA` | UPPERCASE column names | `nombor_ahli\|nama` |
| REQ-001 | `\.from\(['"]vouchers['"]` | Lowercase table name | `.from("payment_vouchers")` |
| REQ-002 | `SUPABASE_ANON_KEY\s*=` | Loaded from config | Hardcoded key string |
| REQ-002 | `EMAILJS.*KEY\s*=` | Loaded from config | Hardcoded key string |
| REQ-003 | `innerHTML\s*=\s*.*\$\{` | With escapeHtml() | Without escapeHtml() |
| REQ-003 | `val\(['"].*['"]\)` | With escapeHtml() | Without escapeHtml() |
| REQ-004 | `auth\.uid\(\)` | With `::TEXT` cast | Without cast |
| REQ-005 | `alert\(` | Should not exist | alert() call |
| REQ-006 | `localStorage\.setItem.*token` | Encrypted or cookie | Plaintext token |
| REQ-007 | `supabase\.storage` | Should be supabaseClient.storage | Incorrect reference |
| REQ-007 | `window\.sb` | In borang.html only | In index.html |
| REQ-008 | `createSignedUrl` | With expiresIn | Without expiration |

---

## Review Checklist

### Pre-Review
- [ ] Read EXPLORATION.md to understand context
- [ ] Read REQUIREMENTS.md to understand requirements
- [ ] Read QUALITY.md to understand quality standards
- [ ] Identify files to review (based on change scope)

### During Review
- [ ] Pass 1: Structural review completed
- [ ] Pass 2: Requirement verification completed
- [ ] Pass 3: Consistency check completed
- [ ] All findings documented with file:line citations
- [ ] All findings cite relevant requirements

### Post-Review
- [ ] Findings prioritized by severity
- [ ] Regression tests written for HIGH severity findings
- [ ] Review report generated
- [ ] Findings communicated to developer

---

## Severity Guidelines

### HIGH Severity
- Schema inconsistencies (REQ-001 violations)
- Hardcoded credentials (REQ-002 violations)
- XSS vulnerabilities (REQ-003 violations)
- RLS bypass vulnerabilities (REQ-004 violations)

### MEDIUM Severity
- localStorage security issues (REQ-006 violations)
- Client inconsistency (REQ-007 violations)
- Signed URL security issues (REQ-008 violations)
- Error handling issues (REQ-005 violations)

### LOW Severity
- Code organization issues (monolithic files)
- Logging issues (console.log in production)
- Test coverage gaps

---

## Regression Test Requirements

For each HIGH severity finding:
1. Write a regression test that fails on the buggy code
2. Verify the test passes after the fix
3. Add the test to the regression test suite

**Regression Test Template:**
```javascript
// Test for REQ-001 violation: incorrect column name
test('should use UPPERCASE column names for member table', async () => {
  // This test will fail if code uses lowercase column names
  const result = await supabaseClient
    .from('AHLI DPMM JOHOR')
    .select('NO_AHLI, NAMA_AHLI')  // UPPERCASE
    .limit(1);
  
  assert(result.error === null, 'Query should succeed with UPPERCASE columns');
});
```

---

## Review Report Template

```markdown
# Code Review Report

**Files Reviewed:** [list]
**Reviewer:** [name]
**Date:** [date]

## Pass 1: Structural Review

### Findings
- [Finding 1]
- [Finding 2]

## Pass 2: Requirement Verification

### REQ-001: Database Schema Consistency
- [Finding 1] - file:line
- [Finding 2] - file:line

### REQ-002: Credential Security
- [Finding 1] - file:line

[... other requirements]

## Pass 3: Cross-Requirement Consistency

### Findings
- [Finding 1] - file:line
- [Finding 2] - file:line

## Summary

**Total Findings:** N
**HIGH Severity:** N
**MEDIUM Severity:** N
**LOW Severity:** N

## Regression Tests Required

- [Test 1] for BUG-XXX
- [Test 2] for BUG-XXX
```

---

## Execution Instructions

To run a code review:

1. Load this protocol
2. Identify files to review (based on PR or change scope)
3. Execute Pass 1 (Structural Review)
4. Execute Pass 2 (Requirement Verification)
5. Execute Pass 3 (Consistency Check)
6. Generate review report
7. Write regression tests for HIGH severity findings

**Time Estimate:** 30-60 minutes for typical PR review

---

**End of Code Review Protocol**
