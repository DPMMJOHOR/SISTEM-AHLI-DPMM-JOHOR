# Fix Receipt/PV System Security Issues

**Date:** 2026-07-14  
**Type:** Security Remediation  
**Priority:** HIGH  
**Related PR:** #4 (feature/receipt-pv-system)

## Summary

Fix security vulnerabilities in the Receipt and Payment Voucher system: XSS vulnerabilities in UI rendering, missing input validation for amounts and file uploads, and missing authorization checks for approval actions.

## Problem Frame

The security review identified 4 HIGH, 2 MEDIUM, and 1 LOW severity vulnerabilities in the Receipt/PV System implementation. The primary risks are:

- **XSS vulnerabilities:** Direct rendering of database content into `innerHTML` in `receipt-pv-ui.js` without sanitization
- **Missing server-side validation:** File uploads and amounts lack validation before database operations
- **Missing authentication enforcement:** Approval functions do not verify user permissions
- **Missing input validation:** Numeric fields lack range and type validation

These vulnerabilities could allow malicious users to inject scripts, upload arbitrary files, exceed amount limits, or perform unauthorized approvals.

## Requirements

### R1: Fix XSS Vulnerabilities (HIGH)
- Replace all `innerHTML` assignments with safe DOM methods (`textContent`, `createElement`)
- Affected locations: receipts table (lines 257-269), vouchers table (lines 294-311), approvals table (lines 337-349), review modal (lines 428-453) in `receipt-pv-ui.js`

### R2: Add Amount Validation (HIGH)
- Validate amounts are positive numbers before database operations
- Set maximum amount limit: RM 1,000,000
- Add `isNaN()` checks before `parseFloat()`
- Apply to: `uploadPaymentSlip`, `generateReceiptPDF`, `generateVoucherPDF`, approval functions

### R3: Add File Upload Validation (HIGH)
- Validate file type (only PNG, JPG, JPEG allowed)
- Validate file size (max 5MB)
- Add validation before Supabase Storage upload in `uploadPaymentSlip`

### R4: Add Authorization Check for Approvals (HIGH)
- Verify user has admin role before allowing approval in `approveVoucher`
- Check `currentUser.role === 'admin'` before updating approval status
- Return error if unauthorized

### R5: Fix Client-Side Credential Exposure (HIGH)
- Replace hardcoded `'current_user_id'` placeholder with actual user ID from Supabase auth session
- Use `supabaseClient.auth.getUser()` to get authenticated user ID
- Apply to: `uploadPaymentSlip` function (line 6894)

### R6: Add Date Validation (MEDIUM)
- Validate payment date is not in the future
- Add check in `uploadPaymentSlip` and voucher creation functions

## Key Technical Decisions

### Decision 1: Use DOM API Instead of innerHTML
- Replace template string + `innerHTML` pattern with `createElement` + `textContent` for XSS prevention
- Example: `td.textContent = receipt.receipt_number` instead of template literal
- This aligns with existing codebase pattern (line 2057 uses `textContent`)

### Decision 2: Validation Functions as Helpers
- Create reusable validation functions: `validateAmount()`, `validateFile()`, `validateDate()`
- Place in index.html before the Receipt/PV functions
- Returns `{ valid: boolean, error: string }` for consistent error handling

### Decision 3: Authorization Check Pattern
- Use existing `currentUser.role` check pattern (line 2574)
- Early return if not authorized: `if (currentUser.role !== 'admin') return { success: false, error: 'Unauthorized' }`

### Decision 4: Validation Thresholds
- Amount: > 0 and <= 1,000,000
- File size: <= 5,242,880 bytes (5MB)
- File types: image/png, image/jpeg, image/jpg
- Date: <= current date (no future dates)

## Implementation Units

### IU-1: Create Validation Helper Functions
**File:** `index.html`  
**Location:** Before `uploadPaymentSlip` function (around line 6860)

```javascript
function validateAmount(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return { valid: false, error: 'Invalid amount' };
  if (num <= 0) return { valid: false, error: 'Amount must be positive' };
  if (num > 1000000) return { valid: false, error: 'Amount exceeds maximum limit' };
  return { valid: true };
}

function validateFile(file) {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only PNG and JPG allowed.' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }
  return { valid: true };
}

function validateDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  if (isNaN(date.getTime())) return { valid: false, error: 'Invalid date' };
  if (date > now) return { valid: false, error: 'Date cannot be in the future' };
  return { valid: true };
}
```

### IU-2: Fix XSS in Receipts Table Rendering
**File:** `receipt-pv-ui.js`  
**Location:** `loadReceiptsPage` function (lines 257-269)

Replace `innerHTML` template literal with DOM methods:
```javascript
tbody.innerHTML = ''; // Clear existing
data.forEach(receipt => {
  const tr = document.createElement('tr');
  
  const tdNumber = document.createElement('td');
  tdNumber.textContent = receipt.receipt_number;
  tr.appendChild(tdNumber);
  
  const tdDate = document.createElement('td');
  tdDate.textContent = new Date(receipt.receipt_date).toLocaleDateString();
  tr.appendChild(tdDate);
  
  // ... similar for other columns
  
  const tdAction = document.createElement('td');
  const btn = document.createElement('button');
  btn.textContent = 'Download PDF';
  btn.className = 'btn btn-sm btn-outline';
  btn.onclick = () => downloadReceiptPDF(receipt.receipt_pdf_url);
  tdAction.appendChild(btn);
  tr.appendChild(tdAction);
  
  tbody.appendChild(tr);
});
```

### IU-3: Fix XSS in Vouchers Table Rendering
**File:** `receipt-pv-ui.js`  
**Location:** `loadVouchersPage` function (lines 294-311)

Same DOM method pattern as IU-2.

### IU-4: Fix XSS in Approvals Table Rendering
**File:** `receipt-pv-ui.js`  
**Location:** `loadApprovalsPage` function (lines 337-349)

Same DOM method pattern as IU-2.

### IU-5: Fix XSS in Review Modal
**File:** `receipt-pv-ui.js`  
**Location:** `reviewVoucher` function (lines 428-453)

Replace `innerHTML` template with DOM methods for modal content.

### IU-6: Add Validation to uploadPaymentSlip
**File:** `index.html`  
**Location:** `uploadPaymentSlip` function (line 6861)

Add validation at function start:
```javascript
async function uploadPaymentSlip(imageFile, memberId, amount, paymentMethod, paymentDate) {
  // Validate inputs
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return { success: false, error: amountCheck.error };
  
  const fileCheck = validateFile(imageFile);
  if (!fileCheck.valid) return { success: false, error: fileCheck.error };
  
  const dateCheck = validateDate(paymentDate);
  if (!dateCheck.valid) return { success: false, error: dateCheck.error };
  
  // ... rest of function
}
```

### IU-7: Fix Client-Side Credential Exposure
**File:** `index.html`  
**Location:** `uploadPaymentSlip` function (line 6894)

Replace hardcoded `'current_user_id'` with actual user ID:
```javascript
async function uploadPaymentSlip(imageFile, memberId, amount, paymentMethod, paymentDate) {
  // ... validation checks ...
  
  // Get authenticated user ID from Supabase auth
  const { data: { user } } } = await supabaseClient.auth.getUser();
  const userId = user?.id || 'anonymous';
  
  // Store in payment_slips table
  const { data: slipData, error: slipError } = await supabase
    .from('payment_slips')
    .insert({
      // ... other fields ...
      uploaded_by: userId
    });
  
  // ... rest of function
}
```

### IU-8: Add Authorization Check to approveVoucher
**File:** `index.html`  
**Location:** `approveVoucher` function (line 7055)

Add authorization check at function start:
```javascript
async function approveVoucher(voucherId, approvedBy, rejectionReason) {
  // Authorization check
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin role required' };
  }
  
  // ... rest of function
}
```

### IU-8: Add Validation to generateReceiptPDF
**File:** `index.html`  
**Location:** `generateReceiptPDF` function

Add amount validation before PDF generation.

### IU-9: Add Validation to generateVoucherPDF
**File:** `index.html`  
**Location:** `generateVoucherPDF` function

Add amount validation before PDF generation.

## Scope Boundaries

### In Scope
- Security fixes for Receipt/PV System only
- Files: `receipt-pv-ui.js`, `index.html` (backend functions)
- Validation and authorization checks as specified

### Out of Scope
- Database schema changes (RLS policies are already configured)
- Refactoring existing authentication system
- Adding new features or functionality
- Moving backend to server-side (current architecture is client-side Supabase)

## Acceptance Criteria

1. All `innerHTML` assignments in `receipt-pv-ui.js` replaced with DOM methods
2. Amount validation rejects non-positive and excessive amounts (> RM 1M)
3. File validation rejects non-image files and files > 5MB
4. Approval functions return error for non-admin users
5. Date validation rejects future dates
6. All validation functions return consistent error messages
7. No XSS vulnerabilities remain in Receipt/PV UI rendering
8. Authorization check prevents unauthorized approvals

## Testing Approach

### Manual Testing
1. Test XSS: Try injecting `<script>alert('xss')</script>` in member names, payable_to fields
2. Test amount validation: Try negative amounts, zero, and amounts > RM 1M
3. Test file validation: Try uploading non-image files and files > 5MB
4. Test authorization: Try approving voucher as non-admin user
5. Test date validation: Try setting future payment dates

### Verification
- Browser console shows no XSS execution attempts
- Validation errors display to user with clear messages
- Unauthorized approval attempts return error
- Existing functionality (receipt generation, PDF download) still works

## Dependencies

None - uses existing patterns and no new libraries.

## Risks and Mitigations

### Risk: Breaking existing functionality
- **Mitigation:** Test all existing flows after changes
- **Mitigation:** Keep function signatures unchanged, only add validation

### Risk: Performance impact from DOM methods
- **Mitigation:** DOM methods are used for small datasets (< 100 rows), impact negligible
- **Mitigation:** Batch DOM operations where possible

## Rollback Plan

If issues arise:
1. Revert `receipt-pv-ui.js` to previous version
2. Revert validation additions in `index.html`
3. All changes are in two files, easy to rollback via git

## Success Metrics

- All 7 security findings from review are addressed
- No new vulnerabilities introduced
- Existing functionality remains intact
- Validation error messages are user-friendly
