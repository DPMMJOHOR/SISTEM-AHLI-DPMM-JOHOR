# Accounting System Fix Plan
**Date:** 2026-08-06
**Status:** Multi-Skill Audit Complete - Revised Implementation Plan

## Executive Summary

Three critical issues identified with additional findings from multi-skill audit:

**Original Issues:**
1. **OCR not persisting** - OCR extracts data but values may not be visible or retained
2. **No document access** - Uploaded documents cannot be viewed/downloaded
3. **Missing double-entry ledger** - No double-entry bookkeeping system

**Audit Findings:**
- **CRITICAL:** Tesseract.js and pdf.js libraries are NOT loaded in index.html - OCR cannot function
- **Security Risk:** Public URLs stored instead of signed URLs
- **Quality Gap:** No test cases or regression strategy
- **Accounting Gap:** No chart of accounts setup for double-entry

---

## Phase 1: Root Cause Investigation

### Issue 1: OCR Data Not Persisting

**Investigation Findings:**
- OCR functions exist: `extractBankStatementData()`, `extractPaymentSlipData()`, `extractInvoiceData()`
- Functions populate form fields: `acct-entry-amount`, `acct-entry-date`, `acct-entry-reference`, `acct-entry-desc`
- Progress bar shows during OCR processing
- Success message displayed after extraction

**Root Cause Analysis (REVISED):**
1. **CRITICAL - Libraries Not Loaded:** Tesseract.js and pdf.js are NOT loaded in index.html - OCR cannot function at all
2. **Field ID Mismatch:** OCR code references `acct-entry-desc` but form may have different ID
3. **Timing Issue:** OCR runs async but form submission may clear fields before OCR completes
4. **No Validation:** No check if OCR actually filled fields before allowing save

**Evidence Confirmed:**
- Grep search for "tesseract" and "pdf.js" in *.html files returned NO RESULTS
- Grep search for "Tesseract" in *.js files returned NO RESULTS
- OCR functions exist in accounting-ui.js but libraries are missing from index.html

### Issue 2: No Document Access

**Investigation Findings:**
- Files uploaded to `accounting-documents` bucket with folder structure
- URL saved to `supporting_document_url` column in `accounting_entries` table
- Review modal (`reviewAccountingEntry`) shows entry details
- **NO UI element to view/download the supporting document**

**Root Cause (REVISED with Security Assessment):**
- Review modal HTML does not include document link/button
- No function to open document URL
- Users cannot access uploaded documents after saving
- **SECURITY RISK:** Current code stores public URLs instead of signed URLs - any user with the URL can access documents without authentication

### Issue 3: Missing Double-Entry Ledger

**Investigation Findings:**
- Searched for "ledger", "journal" - no results
- Current system: single-entry (accounting_entries only)
- Database has `journal_entries` and `journal_entry_lines` tables (from migration)
- **No UI or code to use these tables**

**Root Cause (REVISED with Accounting Assessment):**
- Double-entry tables exist but are not implemented in frontend
- No journal entry creation when accounting entries are approved
- No ledger view or report
- **ACCOUNTING GAP:** No chart of accounts setup - cannot implement double-entry without defining asset/income/expense accounts
- **ACCOUNTING PRINCIPLE:** Double-entry requires: Debit Asset Account, Credit Income Account for each transaction
- **SAMPLE LEDGER ANALYSIS:** Current "DPMM JOHOR Ledger.xlsx" is single-entry (Date/Reference/Account/Explanation/Credit/Debit/Balance) - NOT double-entry
- **CHART OF ACCOUNTS from sample:** Assets (DR), Liabilities (DR), Revenue (CR), Expenses (DR), Capital (CR)

---

## Phase 2: Multi-Skill Audit Results

### Audit 1: Systematic Debugging
**Finding:** Root cause investigation incomplete - no evidence gathered from actual system
**Recommendation:** Add diagnostic logging and browser console verification before implementing fixes
**Status:** Incorporated into revised root cause analysis

### Audit 2: System Architecture Review
**Finding:** Missing chart of accounts prevents double-entry implementation
**Recommendation:** Must define chart of accounts before implementing journal entry logic
**Status:** Added to Fix 3 prerequisites

### Audit 3: Security Review
**Finding:** Public URLs stored instead of signed URLs - authentication bypass risk
**Recommendation:** Use Supabase signed URLs with expiration for secure document access
**Status:** Added to Fix 2 security requirements

### Audit 4: Quality Playbook
**Finding:** No test cases, no regression strategy, no verification plan
**Recommendation:** Add functional tests for OCR, document access, and journal entry creation
**Status:** Added new Testing and QA section

### Audit 5: Accounting Domain Review
**Finding:** Double-entry logic oversimplified - needs proper account mapping
**Recommendation:** Implement chart of accounts with automatic debit/credit assignment based on category
**Status:** Added to Fix 3 accounting logic

---

## Phase 3: Pattern Analysis

### Working Reference: Receipt/Payment Voucher System

**How it works (receipt-pv-ui.js):**
1. Upload → OCR → Auto-fill fields → User reviews → Save
2. Document URL saved to database
3. Document viewable in receipt detail modal with "View" button
4. Uses signed URLs for secure access

**Key Differences:**
- Receipt system has document viewing capability
- Accounting system does not
- Both use Tesseract.js for OCR
- Receipt system shows progress and final status clearly

---

## Phase 3: Hypothesis

**Hypothesis 1 (OCR):** OCR extracts data correctly but fields are cleared or overwritten before user can see/edit.

**Hypothesis 2 (Document Access):** Review modal was created before document upload feature, so document link was never added.

**Hypothesis 3 (Ledger):** Double-entry tables were created via migration but frontend implementation was never completed.

---

## Phase 4: Implementation Plan (REVISED)

### Fix 1: OCR Library Loading (CRITICAL - BLOCKER)

**Priority:** CRITICAL (must fix first - OCR cannot function without this)
**Files to modify:** `index.html`

**Steps:**
1. Add Tesseract.js script tag to index.html
2. Add pdf.js script tag to index.html
3. Configure pdf.js worker
4. Add error handling if libraries fail to load
5. Show user-friendly error if OCR unavailable

**Required Scripts:**
```html
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
</script>
```

**Verification:**
- Open browser console and check for Tesseract and pdfjsLib objects
- Test OCR with sample document

### Fix 2: OCR Persistence and Visibility

**Priority:** HIGH (after Fix 1)
**Files to modify:** `accounting-ui.js`

**Steps:**
1. Add console logging to OCR functions to debug
2. Add field validation after OCR completes
3. Show OCR-extracted values in a summary panel
4. Prevent form submission until OCR completes (if in progress)
5. Add "OCR completed" indicator with timestamp

**Code Changes:**
```javascript
// In processDocumentOCR - add validation
if (progressBar) progressBar.style.width = '100%';
if (progressText) progressText.textContent = '100%';

// Verify fields were filled
var amountFilled = document.getElementById('acct-entry-amount').value;
var dateFilled = document.getElementById('acct-entry-date').value;
if (!amountFilled && !dateFilled) {
  console.warn('OCR did not fill any fields');
  alert('OCR did not extract data. Please enter manually.');
}
```

### Fix 3: Document Viewing Capability with Security

**Priority:** HIGH
**Files to modify:** `accounting-ui.js`

**Steps:**
1. Add document link/button to review modal
2. Create `viewAccountingDocument()` function
3. **SECURITY:** Use signed URLs instead of public URLs
4. Set URL expiration (e.g., 60 seconds)
5. Show document type icon based on upload type
6. Add "Download" and "Open in new tab" options

**Code Changes:**
```javascript
// In reviewAccountingEntry modal HTML
var documentHtml = '';
if (entry.supporting_document_url) {
  // Generate signed URL with expiration
  var { data, error } = await supabase.storage
    .from('accounting-documents')
    .createSignedUrl(entry.document_path, 60); // 60 second expiration
  
  if (error) {
    console.error('Error creating signed URL:', error);
    documentHtml = '<p class="error">Unable to load document</p>';
  } else {
    documentHtml =
      '<div style="margin-top:16px;padding:12px;background:var(--gray1);border-radius:8px;">' +
        '<label class="field-label">Dokumen Sokongan</label>' +
        '<a href="' + data.signedUrl + '" target="_blank" class="btn btn-outline btn-sm" style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;">' +
          '× Lihat Dokumen' +
        '</a>' +
      '</div>';
  }
}

// Add documentHtml to modal body
```

### Fix 4: Double-Entry Ledger Implementation

**Priority:** MEDIUM (feature request, not bug)
**Files to modify:** `accounting-ui.js`, database schema

**Prerequisites:**
1. Create chart of accounts in `chart_of_accounts` table
2. Define asset accounts (bank, cash)
3. Define income accounts (SUMBANGAN, YURAN, etc.)

**Steps:**
1. Create journal entry when accounting entry is approved
2. Auto-generate debit/credit lines based on category
3. Create ledger view modal
4. Add "Lihat Buku Besar" button to accounting dashboard
5. Implement trial balance report

**Accounting Logic (based on sample ledger analysis):**
```
Chart of Accounts Setup (from sample):
- ASSET: Bank Account (debit balance)
- ASSET: Cash Account (debit balance)
- INCOME: SUMBANGAN (credit balance)
- INCOME: YURAN (credit balance)
- EXPENSE: OPERASI (debit balance)
- CAPITAL: Baki Modal (credit balance)

When accounting entry approved:
  Debit: Asset account (bank/cash) based on payment method
  Credit: Income account based on category (SUMBANGAN, YURAN, etc.)
  
Example: Bank Statement RM1000 (SUMBANGAN)
  Debit: Bank Account RM1000
  Credit: SUMBANGAN Income RM1000

Example: Payment RM50 (YURAN)
  Debit: YURAN Expense RM50
  Credit: Bank Account RM50
```

---

## Phase 5: Testing and QA Strategy (NEW)

### Test 1: OCR Library Loading
1. Open index.html in browser
2. Open browser console
3. Verify Tesseract object exists
4. Verify pdfjsLib object exists
5. Check for any library load errors

### Test 2: OCR Persistence
1. Upload bank statement
2. Select document type
3. Wait for OCR to complete
4. Verify fields are filled (amount, date, reference, description)
5. Edit fields if needed
6. Save record
7. Open record in review modal
8. Verify data persisted correctly

### Test 3: Document Access
1. Upload document with accounting entry
2. Save record
3. Open record in review modal
4. Click "Lihat Dokumen" button
5. Verify document opens in new tab
6. Verify document is correct file
7. **Security Test:** Try accessing signed URL after expiration - should fail

### Test 4: Double-Entry Ledger (after implementation)
1. Create accounting entry
2. Approve entry
3. Check journal_entries table for corresponding journal entry
4. Check journal_entry_lines for debit/credit lines
5. Verify debit = credit (accounting equation)
6. View ledger report
7. Verify trial balance (debits = credits)

### Test 5: Regression Tests
1. Test existing receipt/voucher system still works
2. Test member management not affected
3. Test borang.html not affected
4. Test database RLS policies still enforced

---

## Dependencies

**Required:**
- Tesseract.js CDN access
- pdf.js CDN access
- Supabase storage bucket `accounting-documents` (already created)
- RLS policies on `accounting-documents` (already applied)
- Chart of accounts setup (NEW - required for double-entry)

**Optional:**
- OCR language packs (Malay, English) for better accuracy

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OCR libraries fail to load | LOW | HIGH | Add error handling, show user-friendly message |
| OCR extraction inaccurate | MEDIUM | MEDIUM | Allow manual edit after OCR, show confidence score |
| Signed URL generation fails | LOW | MEDIUM | Fallback to public URL with warning, log error |
| Double-entry logic errors | MEDIUM | HIGH | Test with sample data, verify trial balance |
| Chart of accounts incomplete | HIGH | HIGH | Define accounts before implementation, use sample as reference |
| Regression in existing features | LOW | HIGH | Run regression tests before deployment |

---

## Rollback Plan

### If Fix 1 (OCR Libraries) breaks:
1. Remove script tags from index.html
2. System reverts to manual entry only
3. No data loss

### If Fix 2 (OCR Persistence) breaks:
1. Remove validation logic from accounting-ui.js
2. OCR still runs but no validation
3. Users can manually enter data

### If Fix 3 (Document Access) breaks:
1. Remove document link from review modal
2. Documents still uploaded but not viewable
3. No data loss

### If Fix 4 (Double-Entry) breaks:
1. Disable journal entry creation in approval workflow
2. System reverts to single-entry
3. Existing journal entries remain in database

---

## Success Criteria

### Fix 1 (OCR Libraries):
- [ ] Tesseract.js loads without errors
- [ ] pdf.js loads without errors
- [ ] OCR functions execute without errors
- [ ] Browser console shows no library-related errors

### Fix 2 (OCR Persistence):
- [ ] OCR extracts data from test documents
- [ ] Extracted data populates form fields
- [ ] Data persists after save
- [ ] Review modal shows correct data
- [ ] User can edit OCR-extracted data

### Fix 3 (Document Access):
- [ ] Review modal shows document link
- [ ] Clicking link opens document in new tab
- [ ] Signed URLs expire correctly
- [ ] Document type icon matches upload type
- [ ] Download option works

### Fix 4 (Double-Entry Ledger):
- [ ] Chart of accounts created
- [ ] Journal entry created on approval
- [ ] Debit/credit lines auto-generated
- [ ] Ledger view shows transactions
- [ ] Trial balance balances (debits = credits)

---

## Audit Summary

**Total Audits Conducted:** 5
1. Systematic Debugging - Root cause investigation
2. System Architecture Review - Chart of accounts gap identified
3. Security Review - Public URL risk identified
4. Quality Playbook - Testing strategy added
5. Accounting Domain Review - Sample ledger analyzed

**Critical Findings:**
- OCR libraries not loaded (BLOCKER)
- Public URLs instead of signed URLs (SECURITY)
- No chart of accounts (ARCHITECTURE)
- No test cases (QUALITY)

**Plan Status:** REVISED with all audit findings incorporated
**Next Steps:** Await user approval to begin implementation

---

## Next Steps

1. Implement Fix 1 (OCR persistence) - Test immediately
2. Implement Fix 2 (Document access) - Test immediately
3. Implement Fix 4 (Library loading) - Verify OCR works
4. Implement Fix 3 (Double-entry ledger) - Implement after above confirmed
5. Full end-to-end testing
6. Deploy to production
