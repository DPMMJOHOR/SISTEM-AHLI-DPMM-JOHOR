# Integration Test Protocol — SISTEM-AHLI-DPMM-JOHOR

**Project:** SISTEM-AHLI-DPMM-JOHOR  
**Version:** 1.0  
**Date:** 2026-07-22

---

## Overview

This protocol defines integration tests for the SISTEM-AHLI-DPMM-JOHOR project. Integration tests verify end-to-end workflows with real external services (Supabase, EmailJS, Edge Functions).

---

## Test Groups

### Group 1: Member Registration Workflow

**Use Cases:** UC-027  
**Related Requirements:** REQ-001, REQ-003, REQ-005

**Test Cases:**
1. **IT-001:** Complete member registration from form to approval
   - Submit membership form via borang.html
   - Verify PDF generation
   - Verify email notification sent
   - Verify data stored in PERMOHONAN_AHLI table
   - Verify admin can review application
   - Verify admin can approve application

**Prerequisites:**
- Supabase database accessible
- EmailJS configured
- Edge Function deployed

**Expected Results:**
- Form submission succeeds
- PDF generated and stored
- Email sent successfully
- Data in database with correct schema
- Admin can review and approve

---

### Group 2: Receipt Generation Workflow

**Use Cases:** UC-028  
**Related Requirements:** REQ-001, REQ-008

**Test Cases:**
1. **IT-002:** Complete receipt generation and delivery
   - Admin creates receipt via index.html
   - Verify receipt number format (DPMMJHR/RR/YYYY/MM-####)
   - Verify PDF generation
   - Verify PDF stored in receipts bucket
   - Verify signed URL generation
   - Verify WhatsApp/Email notification sent

**Prerequisites:**
- Member exists in AHLI DPMM JOHOR table
- receipts bucket configured
- WhatsApp/Email configured

**Expected Results:**
- Receipt created with correct number format
- PDF generated and stored
- Signed URL accessible
- Notification sent successfully

---

### Group 3: Payment Voucher Approval Workflow

**Use Cases:** UC-029  
**Related Requirements:** REQ-001, REQ-004

**Test Cases:**
1. **IT-003:** Complete voucher approval workflow
   - Bendahari creates voucher
   - Verify voucher number format (DPMMJHR/PV/YYYY/MM-####)
   - YDP reviews and approves
   - NYDP reviews and approves
   - TYDP reviews and approves
   - Verify PDF generation
   - Verify approval_status updated

**Prerequisites:**
- Users with YDP, NYDP, TYDP roles exist
- vouchers table configured
- RLS policies enabled

**Expected Results:**
- Voucher created with correct number format
- Each approval step updates status
- PDF generated after final approval
- RLS policies enforced at each step

---

### Group 4: Email Notification Workflow

**Use Cases:** UC-030  
**Related Requirements:** REQ-002, REQ-003

**Test Cases:**
1. **IT-004:** Email notification with escaped user data
   - Trigger email notification event
   - Verify all user data escaped using escapeHtml()
   - Verify email sent via EmailJS or Edge Function
   - Verify email content is safe (no XSS)

**Prerequisites:**
- EmailJS configured
- Edge Function deployed
- User data with special characters

**Expected Results:**
- Email sent successfully
- User data properly escaped
- No XSS in email content

---

### Group 5: Schema Consistency Validation

**Use Cases:** UC-001, UC-002, UC-003  
**Related Requirements:** REQ-001

**Test Cases:**
1. **IT-005:** Database schema consistency
   - Query "AHLI DPMM JOHOR" with UPPERCASE columns
   - Query "receipts" table (lowercase)
   - Query "vouchers" table (lowercase)
   - Verify no "payment_vouchers" table referenced
   - Verify column names match live schema

**Prerequisites:**
- Live database schema known
- Test database accessible

**Expected Results:**
- All queries succeed with exact table/column names
- No schema mismatch errors

---

### Group 6: XSS Prevention Validation

**Use Cases:** UC-007, UC-008, UC-009, UC-010  
**Related Requirements:** REQ-003

**Test Cases:**
1. **IT-006:** XSS prevention at all user input points
   - Submit form with XSS payload (<script>alert('xss')</script>)
   - Verify escapeHtml() applied
   - Verify payload not executed
   - Display uploaded filename with XSS payload
   - Verify filename escaped
   - Generate email with XSS payload in user data
   - Verify email content escaped

**Prerequisites:**
- escapeHtml() function available
- XSS test payloads prepared

**Expected Results:**
- All XSS payloads escaped
- No script execution
- HTML entities properly encoded

---

### Group 7: RLS Policy Validation

**Use Cases:** UC-011, UC-012, UC-013  
**Related Requirements:** REQ-004

**Test Cases:**
1. **IT-007:** RLS policy consistency
   - Test authenticated user access to tables
   - Test anonymous user access (where applicable)
   - Verify auth.uid()::TEXT cast in policies
   - Verify storage bucket RLS with IC validation
   - Verify role-based access control

**Prerequisites:**
- RLS policies defined
- Test users with different roles

**Expected Results:**
- Authenticated users access appropriate data
- Anonymous users blocked where required
- Type casting works correctly
- Storage RLS enforced

---

### Group 8: Credential Security Validation

**Use Cases:** UC-004, UC-005, UC-006  
**Related Requirements:** REQ-002

**Test Cases:**
1. **IT-008:** Credential security
   - Verify Supabase anon key loaded from environment
   - Verify EmailJS keys loaded from environment
   - Verify no hardcoded credentials in source
   - Verify Edge Function uses environment variables

**Prerequisites:**
- Environment variables configured
- Source code accessible

**Expected Results:**
- Credentials loaded from environment
- No hardcoded credentials in source
- Edge Function uses environment variables

---

### Group 9: Error Handling Validation

**Use Cases:** UC-014, UC-015, UC-016, UC-017  
**Related Requirements:** REQ-005

**Test Cases:**
1. **IT-009:** Error handling with structured UI
   - Trigger form validation error
   - Verify error displayed in UI (not alert)
   - Trigger database error
   - Verify error displayed in UI and logged
   - Trigger file upload error
   - Verify error displayed in UI and logged
   - Trigger API call error
   - Verify error displayed in UI and logged

**Prerequisites:**
- Error UI components available
- Audit logging functional

**Expected Results:**
- Errors displayed in UI elements
- No alert() dialogs
- Errors logged to audit log

---

## Test Matrix

| Group | Test Cases | Requirements Covered | Priority |
|-------|-----------|----------------------|----------|
| 1 | IT-001 | REQ-001, REQ-003, REQ-005 | HIGH |
| 2 | IT-002 | REQ-001, REQ-008 | HIGH |
| 3 | IT-003 | REQ-001, REQ-004 | HIGH |
| 4 | IT-004 | REQ-002, REQ-003 | MEDIUM |
| 5 | IT-005 | REQ-001 | HIGH |
| 6 | IT-006 | REQ-003 | HIGH |
| 7 | IT-007 | REQ-004 | MEDIUM |
| 8 | IT-008 | REQ-002 | HIGH |
| 9 | IT-009 | REQ-005 | MEDIUM |

---

## Execution Instructions

### Prerequisites
1. Supabase project accessible
2. Environment variables configured
3. Edge Functions deployed
4. Test database available

### Running Tests
```bash
# Run all integration tests
npm run test:integration

# Run specific group
npm run test:integration --group 1

# Run specific test
npm run test:integration --test IT-001
```

### Test Data Setup
- Create test member in AHLI DPMM JOHOR table
- Create test users with different roles
- Configure test environment variables

### Cleanup
- Delete test data after tests
- Revert any test-specific configurations

---

## Quality Gates

### Before Merge
- All HIGH priority groups must pass (Groups 1, 2, 3, 5, 6, 8)
- MEDIUM priority groups should pass (Groups 4, 7, 9)

### Before Deployment
- All groups must pass
- No test skipped without justification

### Continuous Integration
- Run Groups 1, 2, 3, 5, 6, 8 on every PR
- Run all groups on main branch merge

---

## Test Result Format

```json
{
  "group": 1,
  "name": "Member Registration Workflow",
  "use_cases": ["UC-027"],
  "result": "pass",
  "tests_passed": 6,
  "tests_failed": 0,
  "tests_skipped": 0,
  "duration_seconds": 45,
  "notes": ""
}
```

---

## Failure Handling

### Test Failure Procedure
1. Identify which test failed
2. Check logs for error details
3. Verify requirement being tested
4. Fix code or test as appropriate
5. Re-run test
6. Document fix in commit message

### Known Issues
- Document any flaky tests
- Document any environment-specific failures
- Document any test data dependencies

---

**End of Integration Test Protocol**
