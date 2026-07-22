# Quality Constitution — SISTEM-AHLI-DPMM-JOHOR

**Project:** SISTEM-AHLI-DPMM-JOHOR  
**Version:** 1.0  
**Date:** 2026-07-22  
**Generated from:** quality/REQUIREMENTS.md

---

## Purpose

This document defines the quality standards for the SISTEM-AHLI-DPMM-JOHOR project. Every AI session and human contributor working on this codebase should read this first to understand what "good enough" means for this specific system.

---

## Coverage Targets

### Functional Coverage
- **Minimum:** 80% of use cases must have automated tests
- **Target:** 90% of use cases with automated tests
- **Critical Path:** 100% of member registration, receipt generation, and voucher approval workflows

### Code Coverage
- **Minimum:** 70% line coverage for business logic
- **Target:** 80% line coverage for business logic
- **Excluded:** Configuration files, test files, third-party libraries

### Security Coverage
- **XSS Prevention:** 100% of user input interpolation points must use escapeHtml()
- **RLS Coverage:** 100% of database tables must have RLS policies
- **Credential Security:** 0% hardcoded credentials in source code

---

## Fitness-to-Purpose Scenarios

### Scenario 1: Schema Consistency Failures
**Context:** Recent "empty tabs / 400 errors" bug caused by column name mismatches (nombor_ahli vs NO_AHLI)

**Failure Mode:** Code uses lowercase column names when live schema uses UPPERCASE

**Detection:**
- Any Supabase query using column names not matching live schema
- Migration files creating tables with different names than live schema
- Error messages indicating "column does not exist"

**Prevention:**
- All database queries MUST use exact case-sensitive column names from live schema
- Migration files MUST be validated against live schema before application
- Test suite MUST verify schema consistency before each deployment

**Recovery:**
- Rollback to last known good schema
- Fix column name references in code
- Re-run affected tests

---

### Scenario 2: XSS via User Input
**Context:** escapeHtml() function exists but may not be applied consistently

**Failure Mode:** User input injected into HTML without escaping causes script execution

**Detection:**
- Any innerHTML assignment with user data not wrapped in escapeHtml()
- Email templates with ${val('field')} not escaped
- Filename display with raw user input

**Prevention:**
- All user input MUST be escaped using escapeHtml() before HTML interpolation
- escapeHtml() MUST escape &, <, >, ", ' in that order
- Code review MUST check all innerHTML assignments

**Recovery:**
- Add escapeHtml() to all missing interpolation points
- Retest XSS injection vectors
- Deploy with CSP headers

---

### Scenario 3: Credential Exposure
**Context:** Hardcoded credentials in config-loader.js and HTML files

**Failure Mode:** API keys exposed in source code or client-side JavaScript

**Detection:**
- Hardcoded API keys in source files
- Credentials in client-side JavaScript
- Placeholder keys in production builds

**Prevention:**
- All credentials MUST be loaded from environment variables
- Client-side code MUST use window.CONFIG for credentials
- No credentials in source code or committed files

**Recovery:**
- Rotate exposed credentials immediately
- Move to environment variables
- Audit access logs for unauthorized usage

---

### Scenario 4: localStorage Session Theft
**Context:** Session tokens stored in localStorage without encryption

**Failure Mode:** XSS attack steals session tokens from localStorage

**Detection:**
- Session tokens in localStorage
- PII in localStorage in plaintext
- No encryption on sensitive localStorage data

**Prevention:**
- Use httpOnly cookies for session tokens where possible
- Encrypt localStorage data if used
- Implement session expiration
- No PII in localStorage

**Recovery:**
- Invalidate all sessions
- Implement secure session storage
- Force user re-authentication

---

### Scenario 5: RLS Policy Bypass
**Context:** Inconsistent RLS policies across tables

**Failure Mode:** User accesses data they shouldn't due to missing or incorrect RLS

**Detection:**
- Tables without RLS policies
- RLS policies not using auth.uid()::TEXT cast
- Inconsistent RLS patterns across tables

**Prevention:**
- All tables MUST have RLS policies
- RLS policies MUST use consistent type casting
- Test RLS with both authenticated and anonymous contexts

**Recovery:**
- Apply missing RLS policies
- Fix type casting issues
- Audit data access logs

---

### Scenario 6: Alert-Based Error Blocking
**Context:** 100+ alert() calls blocking UI

**Failure Mode:** Errors block entire UI with no recovery path

**Detection:**
- alert() calls in error handling
- No structured error UI
- No error logging

**Prevention:**
- Replace alert() with UI error elements
- Implement structured error messages
- Log all errors to audit log

**Recovery:**
- Replace alert() with proper error UI
- Add error recovery options
- Implement error tracking

---

## Theater Prevention

### Code Review Theater
**Definition:** Code review that finds structural issues but misses intent violations

**Prevention:**
- Three-pass review: structural → requirement verification → consistency
- Requirements MUST be read before code review
- Cross-requirement consistency checking

**Detection:**
- Review only checks style, not behavior
- No requirement citations in review findings
- No cross-file contradiction checks

---

### Coverage Theater
**Definition:** High coverage numbers but tests don't catch real bugs

**Prevention:**
- Tests MUST verify outcomes, not just presence
- Tests MUST include boundary conditions
- Tests MUST verify error paths
- Mutation testing to validate test quality

**Detection:**
- 95% coverage but 0% bug detection
- Tests only assert no exceptions thrown
- No assertion on actual output values

---

## Quality Gates

### Pre-Commit Gates
1. **Schema Validation:** All database queries use exact table/column names from live schema
2. **XSS Check:** All user input interpolation uses escapeHtml()
3. **Credential Check:** No hardcoded credentials in committed files
4. **Test Coverage:** Minimum 70% line coverage for changed code

### Pre-Deployment Gates
1. **RLS Verification:** All tables have RLS policies with consistent type casting
2. **Security Scan:** No XSS vulnerabilities detected
3. **Integration Tests:** All critical workflows pass end-to-end
4. **Performance:** No regression in page load time or API response time

### Post-Deployment Monitoring
1. **Error Tracking:** Monitor audit log for new error patterns
2. **Security Events:** Monitor for unauthorized access attempts
3. **Performance:** Monitor API response times and error rates
4. **User Feedback:** Monitor for UI blocking or error handling issues

---

## Anti-Patterns

### Database Anti-Patterns
- **Don't:** Guess table/column names - always verify against live schema
- **Don't:** Use lowercase when schema uses UPPERCASE
- **Don't:** Apply migrations without schema validation

### Security Anti-Patterns
- **Don't:** Hardcode credentials in source code
- **Don't:** Store session tokens in localStorage plaintext
- **Don't:** Skip escapeHtml() on user input
- **Don't:** Use inconsistent RLS policies

### Code Quality Anti-Patterns
- **Don't:** Use alert() for error handling
- **Don't:** Mix supabaseClient and window.sb naming
- **Don't:** Use supabase.storage instead of supabaseClient.storage
- **Don't:** Leave console.log in production code

### Testing Anti-Patterns
- **Don't:** Only test validation utilities
- **Don't** Skip E2E tests for index.html
- **Don't:** Assert no exceptions without checking output
- **Don't** Skip boundary condition tests

---

## Quality Metrics

### Code Quality Metrics
- **Monolithic File Size:** Maximum 3000 lines per file (current: 8000+ lines - needs refactoring)
- **Function Complexity:** Maximum cyclomatic complexity of 10
- **Code Duplication:** Maximum 5% duplication

### Security Metrics
- **XSS Coverage:** 100% of user input points escaped
- **RLS Coverage:** 100% of tables with RLS
- **Credential Security:** 0% hardcoded credentials
- **localStorage Security:** 0% PII in plaintext localStorage

### Testing Metrics
- **Unit Test Coverage:** 80% for business logic
- **E2E Test Coverage:** 100% for critical workflows
- **Integration Test Coverage:** 90% for API endpoints
- **Regression Test Coverage:** 100% for known bugs

### Performance Metrics
- **Page Load Time:** < 3 seconds for index.html, < 5 seconds for borang.html
- **API Response Time:** < 500ms for 95th percentile
- **Error Rate:** < 1% for all operations

---

## Quality Improvement Process

### Continuous Improvement
1. **Weekly:** Review new code for anti-patterns
2. **Monthly:** Run full quality playbook
3. **Quarterly:** Refactor monolithic files
4. **Annually:** Review and update quality standards

### Bug Response Process
1. **Immediate:** Triage bug severity
2. **High Severity:** Fix within 24 hours
3. **Medium Severity:** Fix within 1 week
4. **Low Severity:** Fix within 1 month
5. **All Bugs:** Add regression test before closing

### Regression Prevention
1. **Document:** Add bug to failure history
2. **Test:** Add regression test
3. **Prevent:** Add to anti-patterns list
4. **Review:** Update code review checklist

---

## Role-Specific Guidelines

### For AI Agents
- Read QUALITY.md before any code changes
- Follow anti-patterns strictly
- Verify schema consistency before database operations
- Use escapeHtml() on all user input
- Never add hardcoded credentials
- Replace alert() with structured error UI

### For Human Developers
- Read QUALITY.md before starting work
- Run tests before committing
- Review code against requirements
- Check for anti-patterns in PRs
- Document any new patterns discovered

### For Code Reviewers
- Verify requirements citations in review
- Check cross-requirement consistency
- Validate schema consistency
- Check XSS prevention coverage
- Verify no hardcoded credentials
- Check for alert() usage

---

## Enforcement

### Automated Enforcement
- Pre-commit hooks for schema validation
- CI/CD gates for test coverage
- Security scanning for credentials
- Linting for anti-patterns

### Manual Enforcement
- Code review checklist
- PR review process
- Quality gate sign-off
- Monthly quality audits

---

**End of Quality Constitution**
