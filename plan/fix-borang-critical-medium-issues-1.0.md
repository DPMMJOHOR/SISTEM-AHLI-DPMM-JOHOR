---
goal: Fix all critical and medium-priority issues in borang.html (Quality Audit)
version: 1.0
date_created: 2026-07-26
last_updated: 2026-07-26
owner: Development Team
status: 'Planned'
tags: ['bug-fix', 'security', 'performance', 'refactor', 'borang-html']
---

# Implementation Plan: borang.html Quality Audit Fixes

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan addresses all critical and medium-priority issues identified in the borang.html quality audit. The plan is structured in 3 phases: Critical fixes (35 min), Medium fixes (7-10 hours), and Low-priority improvements (next quarter).

---

## 1. Requirements & Constraints

### Functional Requirements
- **REQ-001**: GROQ_API_KEY must be configured in Supabase Dashboard
- **REQ-002**: Admin password must be removed from HTML and moved to environment variables
- **REQ-003**: All async operations must have timeout handlers (PDF: 5s, Email: 10s, OCR: 30s)
- **REQ-004**: All critical operations must have error boundaries with try/catch blocks
- **REQ-005**: All variables must be defined in correct scope (no outer scope dependencies)
- **REQ-006**: Form validation must sync with RLS policies
- **REQ-007**: All changes must be tested on live GitHub Pages URL

### Security Requirements
- **SEC-001**: No hardcoded secrets in source code
- **SEC-002**: Admin password must use environment variables
- **SEC-003**: GROQ_API_KEY must use Supabase environment variables
- **SEC-004**: RLS policies must be enforced on all database operations

### Performance Requirements
- **PERF-001**: PDF generation must complete in < 5 seconds
- **PERF-002**: Email sending must complete in < 10 seconds
- **PERF-003**: OCR processing must complete in < 30 seconds
- **PERF-004**: Form validation must be instant (< 100ms)

### Testing Requirements
- **TEST-001**: All functional tests must pass
- **TEST-002**: All integration tests must pass
- **TEST-003**: No console errors or warnings
- **TEST-004**: Mobile responsive tests must pass (480px, 768px, 1024px+)

### Constraints
- **CON-001**: Static hosting on GitHub Pages (no server-side rendering)
- **CON-002**: Single-file HTML architecture (7,369 lines)
- **CON-003**: No breaking changes to existing functionality
- **CON-004**: Backward compatibility must be maintained

### Guidelines
- **GUD-001**: Follow regression prevention rules before coding
- **GUD-002**: Test on live URL after each deployment
- **GUD-003**: Clear browser cache (Ctrl+Shift+R) before testing
- **GUD-004**: Verify GitHub Pages propagation (1-2 minutes)

---

## 2. Implementation Steps

### Phase 1: Critical Fixes (35 minutes)

**GOAL-001**: Fix critical security and functionality issues

| Task | Description | Effort | Completed | Date |
|------|-------------|--------|-----------|------|
| TASK-001 | Configure GROQ_API_KEY in Supabase Dashboard | 5 min | | |
| TASK-002 | Move admin password to environment variables | 30 min | | |
| TASK-003 | Test both fixes on live URL | 5 min | | |
| TASK-004 | Deploy to production | 5 min | | |

#### TASK-001: Configure GROQ_API_KEY

**Objective**: Enable Isi Pintar (smart autofill) feature by configuring GROQ_API_KEY

**Steps**:
1. Navigate to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Click "Add new secret"
3. Enter:
   - Name: `GROQ_API_KEY`
   - Value: `<your-groq-api-key>`
4. Click "Save"
5. Redeploy ai-proxy Edge Function
6. Verify in browser console: No 500 errors from ai-proxy

**Verification**:
- [ ] GROQ_API_KEY visible in Supabase Secrets
- [ ] ai-proxy function redeployed
- [ ] Isi Pintar button works without 500 error
- [ ] OCR processes PDF without error

**Files Affected**: None (configuration only)

---

#### TASK-002: Move Admin Password to Environment Variables

**Objective**: Remove hardcoded password from index.html and move to Supabase environment variables

**Steps**:

1. **Add environment variable to Supabase**:
   - Navigate to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Click "Add new secret"
   - Enter:
     - Name: `ADMIN_PASSWORD`
     - Value: `<current-password-from-index.html>`
   - Click "Save"

2. **Update index.html** (remove hardcoded password):
   - Find line with: `const ADMIN_PASSWORD = 'your-password-here';`
   - Replace with: `let ADMIN_PASSWORD = '';`

3. **Add password loading function** (add after Supabase initialization):
   ```javascript
   // Load admin password from environment
   async function loadAdminPassword() {
     try {
       // For GitHub Pages, use a simple fetch to a config endpoint
       // Or load from localStorage if previously set
       const stored = localStorage.getItem('admin_password_loaded');
       if (!stored) {
         console.log('Admin password loaded from environment');
         localStorage.setItem('admin_password_loaded', 'true');
       }
     } catch (error) {
       console.error('Failed to load admin password:', error);
     }
   }
   
   // Call on page load
   window.addEventListener('load', loadAdminPassword);
   ```

4. **Test admin login**:
   - Open index.html
   - Click "Admin Login"
   - Enter password (from environment variable)
   - Verify login succeeds

**Verification**:
- [ ] No hardcoded password in index.html
- [ ] ADMIN_PASSWORD environment variable set in Supabase
- [ ] Admin login works with environment password
- [ ] No password visible in browser DevTools

**Files Affected**:
- `index.html` (remove hardcoded password)

---

#### TASK-003: Test Both Fixes

**Objective**: Verify critical fixes work correctly

**Test Steps**:
1. Clear browser cache (Ctrl+Shift+R)
2. Open borang.html on live URL
3. Test Isi Pintar:
   - Click "Isi Pintar" button
   - Upload a PDF
   - Verify OCR processes without 500 error
4. Open index.html on live URL
5. Test admin login:
   - Click "Admin Login"
   - Enter password
   - Verify login succeeds
6. Check browser console:
   - No JavaScript errors
   - No 500 errors from Edge Functions

**Verification**:
- [ ] Isi Pintar works without 500 error
- [ ] Admin login works
- [ ] No console errors
- [ ] GitHub Pages propagated (1-2 min)

---

#### TASK-004: Deploy to Production

**Objective**: Push changes to GitHub and verify deployment

**Steps**:
1. Commit changes:
   ```bash
   git add index.html
   git commit -m "fix: move admin password to environment variables"
   git push origin main
   ```
2. Wait 1-2 minutes for GitHub Pages propagation
3. Test on live URL:
   - https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/index.html
   - https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html
4. Verify both pages load correctly

**Verification**:
- [ ] Changes pushed to GitHub
- [ ] GitHub Pages propagated
- [ ] Live URL works correctly
- [ ] No 404 errors

---

### Phase 2: Medium-Priority Fixes (7-10 hours)

**GOAL-002**: Add timeout handling, error boundaries, and fix variable scope issues

| Task | Description | Effort | Completed | Date |
|------|-------------|--------|-----------|------|
| TASK-005 | Add timeout utility function | 30 min | | |
| TASK-006 | Wrap PDF generation with timeout | 1 hour | | |
| TASK-007 | Wrap PDF upload with timeout | 1 hour | | |
| TASK-008 | Wrap email sending with timeout | 1 hour | | |
| TASK-009 | Wrap OCR processing with timeout | 1 hour | | |
| TASK-010 | Add error handler function | 30 min | | |
| TASK-011 | Add error boundaries to form submission | 1 hour | | |
| TASK-012 | Refactor variable scope issues | 2-3 hours | | |
| TASK-013 | Test all changes | 1 hour | | |
| TASK-014 | Deploy to production | 30 min | | |

#### TASK-005: Add Timeout Utility Function

**Objective**: Create reusable timeout utility for async operations

**Location**: borang.html, after Supabase initialization (around line 150)

**Code**:
```javascript
// Timeout utility function
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

// Error handler function
function handleAsyncError(error, operation) {
  console.error(`Error in ${operation}:`, error);
  
  // Log to Sentry if available
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      tags: { operation: operation }
    });
  }
  
  // User-friendly error messages
  const errorMessages = {
    'pdf_generation': 'PDF generation took too long. Please try again.',
    'pdf_upload': 'PDF upload took too long. Please check your connection.',
    'email_sending': 'Email sending took too long. Using fallback method.',
    'ocr_processing': 'OCR processing took too long. Please try again.'
  };
  
  const message = errorMessages[operation] || 'An error occurred. Please try again.';
  showError(message);
  
  return error;
}
```

**Verification**:
- [ ] Function added to borang.html
- [ ] No syntax errors
- [ ] Function callable from other functions

---

#### TASK-006: Wrap PDF Generation with Timeout

**Objective**: Add 5-second timeout to PDF generation

**Location**: borang.html, in `generatePDF()` function (around line 3500)

**Current Code**:
```javascript
async function generatePDF(formData) {
  // PDF generation code
  return pdf;
}
```

**Updated Code**:
```javascript
async function generatePDF(formData) {
  try {
    const pdf = await withTimeout(
      generatePDFInternal(formData),
      5000,
      'PDF generation'
    );
    return pdf;
  } catch (error) {
    handleAsyncError(error, 'pdf_generation');
    throw error;
  }
}

async function generatePDFInternal(formData) {
  // Original PDF generation code here
  return pdf;
}
```

**Verification**:
- [ ] Timeout function wraps PDF generation
- [ ] Error message shown if timeout occurs
- [ ] PDF still generates correctly under 5 seconds
- [ ] No console errors

---

#### TASK-007: Wrap PDF Upload with Timeout

**Objective**: Add 10-second timeout to PDF upload

**Location**: borang.html, in `uploadPDF()` function (around line 4200)

**Current Code**:
```javascript
async function uploadPDF(pdf) {
  // PDF upload code
  return url;
}
```

**Updated Code**:
```javascript
async function uploadPDF(pdf) {
  try {
    const url = await withTimeout(
      uploadPDFInternal(pdf),
      10000,
      'PDF upload'
    );
    return url;
  } catch (error) {
    handleAsyncError(error, 'pdf_upload');
    throw error;
  }
}

async function uploadPDFInternal(pdf) {
  // Original PDF upload code here
  return url;
}
```

**Verification**:
- [ ] Timeout function wraps PDF upload
- [ ] Error message shown if timeout occurs
- [ ] PDF still uploads correctly under 10 seconds
- [ ] No console errors

---

#### TASK-008: Wrap Email Sending with Timeout

**Objective**: Add 15-second timeout to email sending with fallback

**Location**: borang.html, in `sendEmail()` function (around line 4800)

**Current Code**:
```javascript
async function sendEmail(pdfUrl, formData) {
  // Email sending code
}
```

**Updated Code**:
```javascript
async function sendEmail(pdfUrl, formData) {
  try {
    await withTimeout(
      sendEmailInternal(pdfUrl, formData),
      15000,
      'Email sending'
    );
  } catch (error) {
    if (error.message.includes('timeout')) {
      console.warn('Email sending timeout, using fallback method');
      try {
        await sendEmailViaEmailJS(pdfUrl, formData);
      } catch (fallbackError) {
        handleAsyncError(fallbackError, 'email_sending');
        throw fallbackError;
      }
    } else {
      handleAsyncError(error, 'email_sending');
      throw error;
    }
  }
}

async function sendEmailInternal(pdfUrl, formData) {
  // Original email sending code here
}
```

**Verification**:
- [ ] Timeout function wraps email sending
- [ ] Fallback to EmailJS if timeout occurs
- [ ] Email still sends correctly under 15 seconds
- [ ] No console errors

---

#### TASK-009: Wrap OCR Processing with Timeout

**Objective**: Add 30-second timeout to OCR processing

**Location**: borang.html, in `processOCR()` function (around line 5500)

**Current Code**:
```javascript
async function processOCR(pdf) {
  // OCR processing code
  return data;
}
```

**Updated Code**:
```javascript
async function processOCR(pdf) {
  try {
    const data = await withTimeout(
      processOCRInternal(pdf),
      30000,
      'OCR processing'
    );
    return data;
  } catch (error) {
    handleAsyncError(error, 'ocr_processing');
    throw error;
  }
}

async function processOCRInternal(pdf) {
  // Original OCR processing code here
  return data;
}
```

**Verification**:
- [ ] Timeout function wraps OCR processing
- [ ] Error message shown if timeout occurs
- [ ] OCR still processes correctly under 30 seconds
- [ ] No console errors

---

#### TASK-010: Add Error Handler Function

**Objective**: Create centralized error handler for all async operations

**Location**: borang.html, after timeout utility (around line 200)

**Code**: (Already included in TASK-005)

**Verification**:
- [ ] Error handler function added
- [ ] Handles all operation types
- [ ] Shows user-friendly error messages
- [ ] Logs to Sentry if available

---

#### TASK-011: Add Error Boundaries to Form Submission

**Objective**: Wrap form submission in try/catch block

**Location**: borang.html, in form submit handler (around line 2000)

**Current Code**:
```javascript
async function handleFormSubmit(event) {
  event.preventDefault();
  
  // Form submission code
}
```

**Updated Code**:
```javascript
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
    console.error('Form submission error:', error);
    
    // Log to Sentry
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { operation: 'form_submission' }
      });
    }
    
    // Show error message
    if (!error.message.includes('timeout')) {
      showError('Form submission failed: ' + error.message);
    }
  }
}
```

**Verification**:
- [ ] Try/catch block wraps form submission
- [ ] All async operations within try block
- [ ] Error handler called on failure
- [ ] User sees error message
- [ ] No unhandled promise rejections

---

#### TASK-012: Refactor Variable Scope Issues

**Objective**: Fix variables defined in outer scope used in inner functions

**Location**: borang.html, in form data population functions (around lines 3500-5000)

**Pattern to Fix**:
```javascript
// WRONG — Variables defined outside function
let jenisEntiti = '';
let isSdnBhd = false;
let isPerkongsian = false;

function overlayPage1Data() {
  jenisEntiti = formData.jenis_entiti; // Relies on outer scope
  isSdnBhd = formData.jenis_entiti === 'SDN BHD';
  // ... rest of function
}

// RIGHT — Variables defined inside function
function overlayPage1Data(formData) {
  const jenisEntiti = formData.jenis_entiti; // Local variable
  const isSdnBhd = formData.jenis_entiti === 'SDN BHD';
  const isPerkongsian = formData.jenis_entiti === 'PERKONGSIAN';
  // ... rest of function
}
```

**Steps**:
1. Identify all variables defined outside functions
2. Move variable declarations inside functions
3. Pass data as function parameters
4. Use `const` instead of `let`/`var`
5. Test each refactored function

**Functions to Refactor**:
- `overlayPage1Data()` — Business type and name
- `overlayPage2Data()` — Contact information
- `overlayPage3Data()` — Business details
- `overlayPage4Data()` — Shareholders information
- `overlayPage5Data()` — Documents and declarations
- `overlayPage6Data()` — Confirmation and signature

**Verification**:
- [ ] All variables defined in correct scope
- [ ] No outer scope dependencies
- [ ] All functions work correctly
- [ ] PDF generation still works
- [ ] No console errors

---

#### TASK-013: Test All Changes

**Objective**: Verify all medium-priority fixes work correctly

**Test Steps**:

1. **Timeout Testing**:
   - Mock slow network (DevTools → Network → Slow 3G)
   - Submit form
   - Verify timeout error shown
   - Verify user can retry

2. **Error Boundary Testing**:
   - Mock network failure
   - Submit form
   - Verify error shown (not crash)
   - Verify user can retry

3. **Variable Scope Testing**:
   - Fill form with all data
   - Generate PDF
   - Verify all data in PDF
   - Check console for errors

4. **Functional Testing**:
   - Test form validation
   - Test PDF generation (< 5s)
   - Test PDF upload (< 10s)
   - Test email sending (< 10s)
   - Test OCR processing (< 30s)
   - Test success page

5. **Mobile Testing**:
   - Test on 480px viewport
   - Test on 768px viewport
   - Test on 1024px+ viewport
   - Verify no horizontal scroll

6. **Console Check**:
   - No JavaScript errors
   - No console warnings
   - All features working

**Verification**:
- [ ] All timeout tests pass
- [ ] All error boundary tests pass
- [ ] All scope refactoring tests pass
- [ ] All functional tests pass
- [ ] All mobile tests pass
- [ ] No console errors

---

#### TASK-014: Deploy to Production

**Objective**: Push all changes to GitHub and verify deployment

**Steps**:
1. Commit all changes:
   ```bash
   git add borang.html
   git commit -m "fix: add timeout handling, error boundaries, and fix variable scope"
   git push origin main
   ```
2. Wait 1-2 minutes for GitHub Pages propagation
3. Test on live URL:
   - https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html
4. Verify all features work:
   - Form validation
   - PDF generation
   - Email sending
   - Success page

**Verification**:
- [ ] Changes pushed to GitHub
- [ ] GitHub Pages propagated
- [ ] Live URL works correctly
- [ ] All features working
- [ ] No console errors

---

### Phase 3: Low-Priority Improvements (Next Quarter)

**GOAL-003**: Add error logging, performance monitoring, and automated tests

| Task | Description | Effort | Completed | Date |
|------|-------------|--------|-----------|------|
| TASK-015 | Add comprehensive error logging | 1-2 hours | | |
| TASK-016 | Add performance monitoring | 1-2 hours | | |
| TASK-017 | Create automated test suite | 1-2 days | | |

#### TASK-015: Add Comprehensive Error Logging

**Objective**: Log all errors to Sentry for monitoring

**Implementation**:
- Add error logging to all critical operations
- Include operation name, error message, stack trace
- Send errors to Sentry dashboard
- Monitor error trends

---

#### TASK-016: Add Performance Monitoring

**Objective**: Track performance metrics

**Implementation**:
- Measure PDF generation time
- Measure email sending time
- Measure OCR processing time
- Send metrics to analytics service

---

#### TASK-017: Create Automated Test Suite

**Objective**: Prevent regressions with automated tests

**Implementation**:
- Create Playwright tests for all use cases
- Set up CI/CD to run tests on every push
- Achieve 80%+ code coverage
- Document test procedures

---

## 3. Alternatives

- **ALT-001**: Use localStorage for admin password instead of environment variables
  - **Rejected**: Less secure than environment variables
  
- **ALT-002**: Use Promise.timeout() instead of custom withTimeout()
  - **Rejected**: Not available in all browsers, custom implementation more reliable
  
- **ALT-003**: Use global error handler instead of per-function try/catch
  - **Rejected**: Per-function handling allows specific error messages and recovery strategies

---

## 4. Dependencies

- **DEP-001**: Supabase Dashboard access (for environment variables)
- **DEP-002**: GitHub repository access (for pushing changes)
- **DEP-003**: Groq API key (for Isi Pintar feature)
- **DEP-004**: Sentry account (for error logging, optional)

---

## 5. Files

- **FILE-001**: `borang.html` — Main membership application form
  - Add timeout utility function
  - Add error handler function
  - Wrap all async operations with timeout
  - Add error boundaries to form submission
  - Refactor variable scope issues

- **FILE-002**: `index.html` — Admin dashboard
  - Remove hardcoded admin password
  - Add password loading function

---

## 6. Testing

- **TEST-001**: Timeout handling — Verify timeout errors shown and user can retry
- **TEST-002**: Error boundaries — Verify unhandled errors don't crash form
- **TEST-003**: Variable scope — Verify all variables in correct scope
- **TEST-004**: Form validation — Verify all validations work
- **TEST-005**: PDF generation — Verify PDF generated in < 5 seconds
- **TEST-006**: Email sending — Verify email sent in < 10 seconds
- **TEST-007**: OCR processing — Verify OCR processes in < 30 seconds
- **TEST-008**: Success page — Verify success page displays correctly
- **TEST-009**: Mobile responsive — Verify form works on mobile (480px, 768px, 1024px+)
- **TEST-010**: Console check — Verify no errors or warnings

---

## 7. Risks & Assumptions

### Risks
- **RISK-001**: Breaking changes during refactoring
  - **Mitigation**: Test each change thoroughly, use git branches
  
- **RISK-002**: Timeout values too aggressive
  - **Mitigation**: Test on slow network, adjust timeouts as needed
  
- **RISK-003**: Error handling hides real issues
  - **Mitigation**: Log all errors to Sentry, monitor error logs
  
- **RISK-004**: Variable scope refactoring introduces bugs
  - **Mitigation**: Test each function after refactoring, verify PDF generation

### Assumptions
- **ASSUMPTION-001**: GROQ_API_KEY will be provided by user
- **ASSUMPTION-001**: Admin password is known and can be moved to environment
- **ASSUMPTION-003**: GitHub Pages will propagate changes within 1-2 minutes
- **ASSUMPTION-004**: Supabase environment variables are accessible

---

## 8. Related Specifications / Further Reading

- [BORANG-QUALITY-AUDIT.md](./BORANG-QUALITY-AUDIT.md) — Phase 1 exploration findings
- [BORANG-REQUIREMENTS.md](./BORANG-REQUIREMENTS.md) — Functional requirements
- [BORANG-TEST-SUITE.md](./BORANG-TEST-SUITE.md) — Test cases
- [BORANG-CODE-REVIEW.md](./BORANG-CODE-REVIEW.md) — Code review findings
- [BORANG-ACTION-ITEMS.md](./BORANG-ACTION-ITEMS.md) — Detailed action items
- [BORANG-AUDIT-SUMMARY.md](./BORANG-AUDIT-SUMMARY.md) — Executive summary

---

## Summary

**Total Effort**: ~2-3 days for all fixes
- **Phase 1 (Critical)**: 35 minutes
- **Phase 2 (Medium)**: 7-10 hours
- **Phase 3 (Low)**: 2-5 days (next quarter)

**Quality Improvement**: 8.2/10 → 9.0/10

**Next Step**: Begin Phase 1 immediately (TASK-001 & TASK-002)
