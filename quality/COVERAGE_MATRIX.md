# Coverage Matrix — SISTEM-AHLI-DPMM-JOHOR

**Project:** SISTEM-AHLI-DPMM-JOHOR  
**Version:** 1.0  
**Date:** 2026-07-22

---

## Requirement to Test Mapping

| Requirement | Use Cases | Test Status | Notes |
|-------------|-----------|-------------|-------|
| REQ-001: Database Schema Consistency | UC-001, UC-002, UC-003 | NOT IMPLEMENTED | Need schema validation tests |
| REQ-002: Credential Security | UC-004, UC-005, UC-006 | NOT IMPLEMENTED | Need credential loading tests |
| REQ-003: XSS Prevention | UC-007, UC-008, UC-009, UC-010 | PARTIAL | E2E tests cover borang.html XSS (test_borang.py:138-145) |
| REQ-004: RLS Policy Consistency | UC-011, UC-012, UC-013 | NOT IMPLEMENTED | Need RLS policy tests |
| REQ-005: Error Handling | UC-014, UC-015, UC-016, UC-017 | NOT IMPLEMENTED | Need error handling tests |
| REQ-006: localStorage Security | UC-018, UC-019, UC-020 | NOT IMPLEMENTED | Need localStorage security tests |
| REQ-007: Supabase Client Consistency | UC-021, UC-022, UC-023 | NOT IMPLEMENTED | Need client consistency tests |
| REQ-008: Storage Signed URL Security | UC-024, UC-025, UC-026 | NOT IMPLEMENTED | Need signed URL tests |
| REQ-009: Test Coverage | UC-027, UC-028, UC-029, UC-030 | NOT IMPLEMENTED | Need E2E tests for critical workflows |
| REQ-010: Production Logging | UC-031, UC-032, UC-033 | NOT IMPLEMENTED | Need logging framework tests |

---

## Use Case to Requirement Mapping

| Use Case | Requirement | Test Status | Notes |
|----------|-------------|-------------|-------|
| UC-001: Member Data Retrieval | REQ-001 | NOT IMPLEMENTED | Need member retrieval tests |
| UC-002: Receipt/Voucher Data Operations | REQ-001 | NOT IMPLEMENTED | Need CRUD operation tests |
| UC-003: Migration Application | REQ-001 | NOT IMPLEMENTED | Need migration validation tests |
| UC-004: System Initialization | REQ-002 | NOT IMPLEMENTED | Need config loading tests |
| UC-005: Email Sending | REQ-002 | NOT IMPLEMENTED | Need EmailJS tests |
| UC-006: AI Proxy Operations | REQ-002 | NOT IMPLEMENTED | Need Edge Function tests |
| UC-007: Form Submission | REQ-003 | PARTIAL | Covered by E2E test_borang.py |
| UC-008: Email Generation | REQ-003 | NOT IMPLEMENTED | Need email template tests |
| UC-009: File Upload Display | REQ-003 | PARTIAL | Covered by E2E test_borang.py:138-145 |
| UC-010: Data Rendering | REQ-003 | NOT IMPLEMENTED | Need data rendering tests |
| UC-011: Data Access Control | REQ-004 | NOT IMPLEMENTED | Need RLS access tests |
| UC-012: Storage Access Validation | REQ-004 | NOT IMPLEMENTED | Need storage RLS tests |
| UC-013: User Role Verification | REQ-004 | NOT IMPLEMENTED | Need role-based access tests |
| UC-014: Form Validation Errors | REQ-005 | NOT IMPLEMENTED | Need validation error tests |
| UC-015: Database Operation Errors | REQ-005 | NOT IMPLEMENTED | Need database error tests |
| UC-016: File Upload Errors | REQ-005 | NOT IMPLEMENTED | Need upload error tests |
| UC-017: API Call Errors | REQ-005 | NOT IMPLEMENTED | Need API error tests |
| UC-018: Session Management | REQ-006 | NOT IMPLEMENTED | Need session security tests |
| UC-019: Form Draft Persistence | REQ-006 | NOT IMPLEMENTED | Need draft security tests |
| UC-020: Backup Data Storage | REQ-006 | NOT IMPLEMENTED | Need backup security tests |
| UC-021: Database Operations | REQ-007 | NOT IMPLEMENTED | Need client consistency tests |
| UC-022: Storage Operations | REQ-007 | NOT IMPLEMENTED | Need storage client tests |
| UC-023: Authentication Operations | REQ-007 | NOT IMPLEMENTED | Need auth client tests |
| UC-024: Receipt PDF Download | REQ-008 | NOT IMPLEMENTED | Need signed URL tests |
| UC-025: Voucher PDF Download | REQ-008 | NOT IMPLEMENTED | Need signed URL tests |
| UC-026: Application PDF Download | REQ-008 | NOT IMPLEMENTED | Need signed URL tests |
| UC-027: Member Registration Workflow | REQ-009 | NOT IMPLEMENTED | Need E2E workflow test |
| UC-028: Receipt Generation Workflow | REQ-009 | NOT IMPLEMENTED | Need E2E workflow test |
| UC-029: Payment Voucher Approval Workflow | REQ-009 | NOT IMPLEMENTED | Need E2E workflow test |
| UC-030: Email Notification Workflow | REQ-009 | NOT IMPLEMENTED | Need E2E workflow test |
| UC-031: Error Tracking | REQ-010 | NOT IMPLEMENTED | Need error logging tests |
| UC-032: Performance Monitoring | REQ-010 | NOT IMPLEMENTED | Need performance logging tests |
| UC-033: Security Event Logging | REQ-010 | NOT IMPLEMENTED | Need security logging tests |

---

## Coverage Summary

**Total Requirements:** 10  
**Total Use Cases:** 33  
**Requirements with Tests:** 1 (10%)  
**Use Cases with Tests:** 2 (6%)  
**Requirements without Tests:** 9 (90%)  
**Use Cases without Tests:** 31 (94%)

**Test Coverage by Category:**
- Database Schema: 0% (0/3 use cases)
- Security: 6% (2/33 use cases)
- Code Quality: 0% (0/7 use cases)
- Testing: 0% (0/4 use cases)
- Operations: 0% (0/3 use cases)

**Gap Analysis:**
- Critical gap: No E2E tests for index.html (admin dashboard)
- Critical gap: No tests for schema consistency validation
- Critical gap: No tests for credential security
- Critical gap: No tests for RLS policy consistency
- High gap: No tests for error handling patterns
- High gap: No tests for localStorage security
- High gap: No tests for critical workflows (receipt generation, voucher approval)

---

## Test Implementation Priorities

### Priority 1 (Critical - Immediate)
1. Schema consistency tests (REQ-001) - Prevents "empty tabs / 400 errors" regression
2. XSS prevention tests (REQ-003) - Security critical
3. E2E tests for index.html (REQ-009) - Covers admin dashboard

### Priority 2 (High - Within 1 week)
1. Credential security tests (REQ-002)
2. RLS policy consistency tests (REQ-004)
3. localStorage security tests (REQ-006)
4. Error handling tests (REQ-005)

### Priority 3 (Medium - Within 1 month)
1. Supabase client consistency tests (REQ-007)
2. Storage signed URL tests (REQ-008)
3. Production logging tests (REQ-010)
4. Critical workflow E2E tests (UC-027, UC-028, UC-029, UC-030)

---

**End of Coverage Matrix**
