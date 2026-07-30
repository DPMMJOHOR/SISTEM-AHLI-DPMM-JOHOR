# borang.html Action Items & Implementation Plan

**Date:** 26 Julai 2026  
**Priority:** Critical (2 items), Medium (3 items), Low (3 items)  
**Total Effort:** ~2-3 days for all items

---

## 🔴 CRITICAL — Fix Immediately (Today)

### ACTION 1: Configure GROQ_API_KEY
**Priority:** CRITICAL  
**Effort:** 5 minutes  
**Impact:** Isi Pintar feature will work  

**Steps:**
1. Go to Supabase Dashboard
2. Navigate to: Project Settings → Edge Functions → Secrets
3. Add new secret:
   - Name: `GROQ_API_KEY`
   - Value: `<your-groq-api-key>`
4. Redeploy ai-proxy function
5. Test Isi Pintar feature on borang.html

**Verification:**
```bash
# Test Isi Pintar
1. Open borang.html
2. Click "Isi Pintar" button
3. Upload a PDF
4. Verify OCR processes without 500 error
```

**Status:** ⏳ PENDING

---

### ACTION 2: Move Admin Password to Environment Variables
**Priority:** CRITICAL  
**Effort:** 30 minutes  
**Impact:** Remove hardcoded password from source code  

**Steps:**
1. Go to Supabase Dashboard
2. Navigate to: Project Settings → Edge Functions → Secrets
3. Add new secret:
   - Name: `ADMIN_PASSWORD`
   - Value: `<current-password-from-index.html>`
4. Edit index.html:
   - Remove hardcoded password
   - Load password from environment on page load
5. Test admin login

**Code Changes:**
```javascript
// OLD (index.html) — REMOVE THIS
const ADMIN_PASSWORD = 'your-password-here';

// NEW (index.html) — ADD THIS
let ADMIN_PASSWORD = '';
async function loadAdminPassword() {
  try {
    const response = await fetch('/.netlify/functions/get-admin-password');
    const data = await response.json();
    ADMIN_PASSWORD = data.password;
  } catch (error) {
    console.error('Failed to load admin password:', error);
  }
}
loadAdminPassword();
```

**Verification:**
```bash
# Test admin login
1. Open index.html
2. Click "Admin Login"
3. Enter password (from environment variable)
4. Verify login succeeds
```

**Status:** ⏳ PENDING

---

## 🟡 MEDIUM — Fix This Sprint (Next 3 Days)

### ACTION 3: Add Timeout Handling for Async Operations
**Priority:** MEDIUM  
**Effort:** 2-3 hours  
**Impact:** Prevent operations from hanging indefinitely  

**Affected Operations:**
1. PDF generation (target: < 5s)
2. PDF upload (target: < 10s)
3. Email sending (target: < 10s)
4. OCR processing (target: < 30s)

**Implementation:**

**Step 1: Create timeout utility function**
```javascript
// Add to borang.html (around line 100)
function withTimeout(promise, timeoutMs, operationName) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => {
        reject(new Error(`${operationName} timeout after ${timeoutMs}ms`));
      }, timeoutMs)
    )
  ]);
}
```

**Step 2: Wrap PDF generation**
```javascript
// In generatePDF() function
try {
  const pdf = await withTimeout(
    generatePDFInternal(formData),
    5000,
    'PDF generation'
  );
  return pdf;
} catch (error) {
  if (error.message.includes('timeout')) {
    showError('PDF generation took too long. Please try again.');
  } else {
    showError('PDF generation failed: ' + error.message);
  }
  throw error;
}
```

**Step 3: Wrap PDF upload**
```javascript
// In uploadPDF() function
try {
  const url = await withTimeout(
    uploadPDFInternal(pdf),
    10000,
    'PDF upload'
  );
  return url;
} catch (error) {
  if (error.message.includes('timeout')) {
    showError('PDF upload took too long. Please try again.');
  } else {
    showError('PDF upload failed: ' + error.message);
  }
  throw error;
}
```

**Step 4: Wrap email sending**
```javascript
// In sendEmail() function
try {
  await withTimeout(
    sendEmailInternal(data),
    15000,
    'Email sending'
  );
} catch (error) {
  if (error.message.includes('timeout')) {
    showError('Email sending took too long. Using fallback method.');
    // Fallback to EmailJS
    await sendEmailViaEmailJS(data);
  } else {
    throw error;
  }
}
```

**Step 5: Wrap OCR processing**
```javascript
// In processOCR() function
try {
  const data = await withTimeout(
    processOCRInternal(pdf),
    30000,
    'OCR processing'
  );
  return data;
} catch (error) {
  if (error.message.includes('timeout')) {
    showError('OCR processing took too long. Please try again.');
  } else {
    showError('OCR processing failed: ' + error.message);
  }
  throw error;
}
```

**Testing:**
```bash
# Test timeout handling
1. Mock slow network (DevTools → Network → Slow 3G)
2. Submit form
3. Verify timeout error shown
4. Verify user can retry
```

**Status:** ⏳ PENDING

---

### ACTION 4: Add Error Boundaries Around Critical Operations
**Priority:** MEDIUM  
**Effort:** 2-3 hours  
**Impact:** Prevent unhandled errors from crashing form  

**Affected Operations:**
1. Form submission
2. PDF generation
3. PDF upload
4. Email sending
5. OCR processing

**Implementation:**

**Step 1: Create error handler**
```javascript
// Add to borang.html (around line 150)
function handleFormError(error, operation) {
  console.error(`Error in ${operation}:`, error);
  
  // Log to Sentry if available
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      tags: { operation: operation }
    });
  }
  
  // Show user-friendly error message
  const errorMessages = {
    'form_validation': 'Please check all required fields.',
    'pdf_generation': 'Failed to generate PDF. Please try again.',
    'pdf_upload': 'Failed to upload PDF. Please check your connection.',
    'email_sending': 'Failed to send email. Please try again.',
    'ocr_processing': 'Failed to process document. Please try again.'
  };
  
  showError(errorMessages[operation] || 'An error occurred. Please try again.');
}
```

**Step 2: Wrap form submission**
```javascript
// In form submit handler
async function handleFormSubmit(event) {
  event.preventDefault();
  
  try {
    // Validate form
    if (!validateForm()) {
      throw new Error('Form validation failed');
    }
    
    // Generate PDF
    const pdf = await generatePDF(getFormData());
    
    // Upload PDF
    const pdfUrl = await uploadPDF(pdf);
    
    // Send emails
    await sendEmail(pdfUrl, getFormData());
    
    // Show success page
    showSuccessPage();
    
  } catch (error) {
    handleFormError(error, 'form_submission');
  }
}
```

**Step 3: Wrap PDF generation**
```javascript
// In generatePDF() function
async function generatePDF(formData) {
  try {
    // PDF generation code
    return pdf;
  } catch (error) {
    handleFormError(error, 'pdf_generation');
    throw error;
  }
}
```

**Step 4: Wrap PDF upload**
```javascript
// In uploadPDF() function
async function uploadPDF(pdf) {
  try {
    // PDF upload code
    return url;
  } catch (error) {
    handleFormError(error, 'pdf_upload');
    throw error;
  }
}
```

**Step 5: Wrap email sending**
```javascript
// In sendEmail() function
async function sendEmail(pdfUrl, formData) {
  try {
    // Email sending code
  } catch (error) {
    handleFormError(error, 'email_sending');
    throw error;
  }
}
```

**Testing:**
```bash
# Test error boundaries
1. Mock network failure
2. Submit form
3. Verify error shown (not crash)
4. Verify user can retry
```

**Status:** ⏳ PENDING

---

### ACTION 5: Refactor Variable Scope Issues
**Priority:** MEDIUM  
**Effort:** 3-4 hours  
**Impact:** Prevent regression errors  

**Issue:** Variables defined in outer scope used in inner functions

**Example Problem:**
```javascript
// WRONG — jenisEntiti defined outside function
let jenisEntiti = '';
function overlayPage1Data() {
  jenisEntiti = formData.jenis_entiti; // Relies on outer scope
  // ... rest of function
}

// RIGHT — jenisEntiti defined inside function
function overlayPage1Data(formData) {
  const jenisEntiti = formData.jenis_entiti; // Local variable
  // ... rest of function
}
```

**Implementation:**

**Step 1: Identify all scope issues**
```bash
# Search for variables defined outside functions
grep -n "^let \|^var \|^const " borang.html | head -20
```

**Step 2: Refactor each function**
- Move variable declarations inside functions
- Pass data as function parameters
- Use const instead of let/var

**Step 3: Test each refactored function**
- Verify form data still populates correctly
- Verify PDF generation still works
- Verify no console errors

**Example Refactoring:**
```javascript
// BEFORE (lines ~3500)
let namaEntiti = '';
let isSdnBhd = false;
let isPerkongsian = false;
let isPLT = false;

function overlayPage1Data() {
  namaEntiti = formData.nama_syarikat;
  isSdnBhd = formData.jenis_entiti === 'SDN BHD';
  // ... rest of function
}

// AFTER
function overlayPage1Data(formData) {
  const namaEntiti = formData.nama_syarikat;
  const isSdnBhd = formData.jenis_entiti === 'SDN BHD';
  const isPerkongsian = formData.jenis_entiti === 'PERKONGSIAN';
  const isPLT = formData.jenis_entiti === 'PLT';
  
  // ... rest of function using local variables
}
```

**Testing:**
```bash
# Test refactored code
1. Fill form with all data
2. Generate PDF
3. Verify all data in PDF
4. Check console for errors
```

**Status:** ⏳ PENDING

---

## 🟢 LOW — Improve Next Quarter

### ACTION 6: Add Comprehensive Error Logging
**Priority:** LOW  
**Effort:** 1-2 hours  
**Impact:** Better debugging and monitoring  

**Implementation:**
- Add error logging to all critical operations
- Send errors to Sentry for monitoring
- Include operation name, error message, stack trace
- Log user actions for debugging

**Status:** ⏳ PENDING

---

### ACTION 7: Add Performance Monitoring
**Priority:** LOW  
**Effort:** 1-2 hours  
**Impact:** Track performance metrics  

**Implementation:**
- Measure PDF generation time
- Measure email sending time
- Measure OCR processing time
- Send metrics to analytics service

**Status:** ⏳ PENDING

---

### ACTION 8: Create Automated Test Suite
**Priority:** LOW  
**Effort:** 1-2 days  
**Impact:** Prevent regressions  

**Implementation:**
- Create Playwright tests for all use cases
- Set up CI/CD to run tests on every push
- Achieve 80%+ code coverage
- Document test procedures

**Status:** ⏳ PENDING

---

## Implementation Timeline

### Week 1 (Immediate)
```
Monday:
  - ACTION 1: Configure GROQ_API_KEY (5 min)
  - ACTION 2: Move admin password (30 min)
  - Test both fixes (15 min)
  - Deploy to production

Tuesday-Wednesday:
  - ACTION 3: Add timeout handling (2-3 hours)
  - ACTION 4: Add error boundaries (2-3 hours)
  - Test all changes (1 hour)
  - Deploy to production

Thursday-Friday:
  - ACTION 5: Refactor variable scope (3-4 hours)
  - Test all changes (1 hour)
  - Deploy to production
  - Code review and QA
```

### Week 2-3 (Next Sprint)
```
- ACTION 6: Error logging (1-2 hours)
- ACTION 7: Performance monitoring (1-2 hours)
- ACTION 8: Automated tests (1-2 days)
- Final testing and deployment
```

---

## Success Criteria

### Critical Actions (ACTION 1-2)
- [ ] GROQ_API_KEY configured
- [ ] Isi Pintar feature works
- [ ] Admin password removed from HTML
- [ ] Admin login works with environment variable
- [ ] No hardcoded secrets in source code

### Medium Actions (ACTION 3-5)
- [ ] Timeout handling implemented
- [ ] All async operations have timeouts
- [ ] Error boundaries in place
- [ ] Unhandled errors don't crash form
- [ ] Variable scope issues fixed
- [ ] No scope-related errors in console

### Low Actions (ACTION 6-8)
- [ ] Error logging implemented
- [ ] Performance metrics tracked
- [ ] Automated test suite created
- [ ] 80%+ code coverage achieved
- [ ] All tests passing

---

## Risk Assessment

### Risk 1: Breaking Changes During Refactoring
**Probability:** Medium  
**Impact:** Form stops working  
**Mitigation:** Test each change thoroughly, use git branches

### Risk 2: Timeout Values Too Aggressive
**Probability:** Low  
**Impact:** False timeout errors on slow networks  
**Mitigation:** Test on slow network (DevTools), adjust timeouts as needed

### Risk 3: Error Handling Hides Real Issues
**Probability:** Low  
**Impact:** Bugs not caught during testing  
**Mitigation:** Log all errors to Sentry, monitor error logs

---

## Rollback Plan

If any action causes issues:

1. **Revert to Previous Commit**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Clear Browser Cache**
   ```bash
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. **Verify Rollback**
   - Test on live URL
   - Check browser console
   - Verify form submission works

---

## Sign-Off

**Audit Completed By:** Quality Playbook v1.5.6  
**Date:** 26 Julai 2026  
**Status:** ✅ READY FOR IMPLEMENTATION  

**Next Steps:**
1. Review action items with team
2. Assign owners to each action
3. Create GitHub issues for tracking
4. Begin implementation immediately

---

**All action items documented and ready for implementation.**
