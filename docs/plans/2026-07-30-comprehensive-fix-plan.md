# Comprehensive Fix Plan - SISTEM-AHLI-DPMM-JOHOR
**Date:** 2026-07-30
**Scope:** Email system, PDF generation, form validation, and column name alignment

---

## Executive Summary

This plan addresses critical issues in the membership application system:
1. **Duplicate admin emails** - Admin receives two emails per submission
2. **Missing applicant emails** - Applicants may not receive confirmation emails
3. **PDF attachment inconsistencies** - PDFs attached via some mechanisms but not others
4. **Column name alignment** - Verify consistent column usage across database, frontend, and backend
5. **Tab 7 display issue** - Incorrect display of applicant name in Tab 7

**Priority:** HIGH - Email delivery issues directly impact user experience and business operations

---

## Phase 1: Column Name Verification (MANDATORY FIRST STEP)

### Objective
Verify that all column names are consistent across:
- Database schema (Supabase)
- Frontend code (borang.html, index.html)
- Backend code (config-endpoint.js, Edge Functions)
- Migration files

### Verification Process

#### Step 1.1: Extract Database Schema
**Action:** Query Supabase to get actual column names for all relevant tables

**Tables to verify:**
- `PERMOHONAN_AHLI` (membership applications)
- `AHLI DPMM JOHOR` (approved members)
- `receipts` (receipts table)
- `vouchers` (vouchers table)

**Method:**
```sql
-- Get column names for PERMOHONAN_AHLI
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'PERMOHONAN_AHLI' 
ORDER BY ordinal_position;

-- Get column names for AHLI DPMM JOHOR
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'AHLI DPMM JOHOR' 
ORDER BY ordinal_position;
```

**Expected critical columns for PERMOHONAN_AHLI:**
- `ref_id` (TEXT)
- `nama_perniagaan` (TEXT) - NOT `nama_entiti`
- `emel_syarikat` (TEXT)
- `proksi_emel` (TEXT)
- `proksi_nama` (TEXT)
- `proksi_hp` (TEXT)
- `nama_lengkap_pemohon` (TEXT)
- `no_kad_pengenal` (TEXT)
- `jenis_keahlian` (TEXT)
- `fasal` (TEXT)
- `yuran_daftar` (NUMERIC)
- `yuran_tahunan` (NUMERIC)
- `pdf_url` (TEXT)
- `pdf_uploaded_at` (TIMESTAMP)
- `pdf_file_size` (BIGINT)
- `email_admin_sent` (BOOLEAN)
- `email_admin_sent_at` (TIMESTAMP)
- `email_applicant_sent` (BOOLEAN)
- `email_applicant_sent_at` (TIMESTAMP)
- `email_error` (TEXT)
- `ip_address` (TEXT)
- `user_agent` (TEXT)

#### Step 1.2: Grep Frontend Column Usage
**Action:** Search borang.html for all column references

**Commands:**
```bash
# Search for nama_perniagaan
grep -n "nama_perniagaan" borang.html

# Search for nama_entiti (should NOT exist after migration)
grep -n "nama_entiti" borang.html

# Search for email-related columns
grep -n "emel_syarikat\|proksi_emel" borang.html

# Search for PDF-related columns
grep -n "pdf_url\|pdf_uploaded" borang.html
```

**Expected findings:**
- `nama_perniagaan` should be used (NOT `nama_entiti`)
- `emel_syarikat` and `proksi_emel` should be present
- PDF columns should match database schema

#### Step 1.3: Grep Backend Column Usage
**Action:** Search backend files for column references

**Files to check:**
- `src/config-endpoint.js`
- `supabase/functions/email-with-pdf/index.ts`
- `index.html`

**Commands:**
```bash
# Search in config-endpoint.js
grep -n "nama_perniagaan\|nama_entiti" src/config-endpoint.js

# Search in index.html
grep -n "nama_perniagaan\|nama_entiti" index.html
```

#### Step 1.4: Check Migration Files
**Action:** Verify migration files match intended schema

**Files to review:**
- `migrations/rename-nama-entiti-to-nama-perniagaan.sql`
- `migrations/add-pdf-columns.sql`
- `migrations/approval-workflow-roles.sql`
- `migrations/audit-logging.sql`

**Expected:**
- Migration should rename `nama_entiti` → `nama_perniagaan`
- PDF columns should be added correctly
- Email tracking columns should be present

#### Step 1.5: Create Column Alignment Matrix
**Action:** Document all findings in a matrix

**Format:**
```markdown
| Column | Database | Frontend (borang.html) | Backend (config-endpoint.js) | Status |
|--------|----------|----------------------|------------------------------|--------|
| nama_perniagaan | ✅ | ✅ | ✅ | ALIGNED |
| nama_entiti | ❌ | ❌ | ❌ | DEPRECATED |
| emel_syarikat | ✅ | ✅ | ✅ | ALIGNED |
| proksi_emel | ✅ | ✅ | ✅ | ALIGNED |
| pdf_url | ✅ | ✅ | ✅ | ALIGNED |
```

**Decision Gate:**
- If any mismatches found → STOP and fix column names first
- Only proceed to Phase 2 after column alignment is verified

---

## Phase 2: Fix Duplicate Admin Emails

### Root Cause
Line 4759 in `borang.html` calls `sendEmailsInBackground()` AFTER the primary Edge Function email has already been sent. This function uses `/api/send-email` (Resend API) which does NOT support PDF attachments, resulting in:
- Admin receives **two emails** per submission
- First email: via Edge Function with PDF attachment ✅
- Second email: via `/api/send-email` without PDF ❌

### Evidence
**File:** `borang.html`
**Lines:** 4678-4710 (primary email), 4759 (duplicate)
**Code:**
```javascript
// Primary email with PDF (lines 4678-4710)
await sendEmailViaEdgeFunction('admin', pdfUploadResult?.signedUrl, applicantEmailData);

// Duplicate email WITHOUT PDF (line 4759)
sendEmailsInBackground(finalRef, payload, uploadedUrls, jenis, fasalVal, total);
```

**Function `sendEmailsInBackground` (lines 4800-4926):**
- Calls `/api/send-email` at lines 4854 and 4899
- `/api/send-email` implementation in `src/config-endpoint.js` (lines 186-218) only sends HTML, no attachments

### Fix
**Action:** Remove or comment out line 4759 in `borang.html`

**Before:**
```javascript
// Show success immediately (email is non-blocking)
hideLoading();
showSuccess(finalRef);

// Send emails in background (non-blocking)
sendEmailsInBackground(finalRef, payload, uploadedUrls, jenis, fasalVal, total);
```

**After:**
```javascript
// Show success immediately (email is non-blocking)
hideLoading();
showSuccess(finalRef);

// REMOVED: sendEmailsInBackground(finalRef, payload, uploadedUrls, jenis, fasalVal, total);
// Reason: Duplicate admin emails - Edge Function already sends with PDF attachment
```

**Verification:**
1. Test form submission
2. Verify admin receives exactly ONE email
3. Verify email has PDF attachment
4. Check database `email_admin_sent` is true

---

## Phase 3: Fix Missing Applicant Emails

### Root Cause
Line 4712 in `borang.html` conditionally sends applicant email:
```javascript
if (pemohonEmail) {
  // Send applicant email
}
```

**Email source:** `pemohonEmail = val('proksi_emel') || val('emel_syarikat')` (line 4663)

**Problem:** If both fields are empty/undefined:
- Email is silently skipped
- No error message to user
- No console warning
- No database record of failure
- User sees "success" but never receives email

**Why this happens:**
- PLT (Pemilik Tunggal) entities may not have proxy email
- SDN BHD/Perkongsian entities may not fill in `emel_syarikat`
- Form validation does NOT require at least one email field

### Fix 3.1: Add Email Validation Before Submission
**Action:** Add validation in `submitPermohonan()` or `validateStep(7)`

**Location:** `borang.html` - add before PDF generation

**Code:**
```javascript
// Validate email fields before submission
const pemohonEmail = val('proksi_emel') || val('emel_syarikat');
if (!pemohonEmail) {
  showToast('Sila masukkan sekurang-kurangnya satu e-mel (e-mel syarikat atau e-mel proksi)', 'error');
  return false;
}

// Validate email format if provided
if (val('emel_syarikat') && !isValidEmail(val('emel_syarikat'))) {
  showToast('Format e-mel syarikat tidak sah', 'error');
  return false;
}

if (val('proksi_emel') && !isValidEmail(val('proksi_emel'))) {
  showToast('Format e-mel proksi tidak sah', 'error');
  return false;
}
```

**Helper function (add to borang.html):**
```javascript
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### Fix 3.2: Add User Feedback for Email Failure
**Action:** Modify the conditional to log when email is skipped

**Location:** `borang.html` line 4712

**Before:**
```javascript
if (pemohonEmail) {
  try {
    await sendEmailViaEdgeFunction('applicant', pdfUploadResult?.signedUrl, applicantEmailData);
    console.log('Applicant email sent via Edge Function');
  } catch (applicantEmailErr) {
    // Fallback to EmailJS
  }
}
```

**After:**
```javascript
if (pemohonEmail) {
  try {
    await sendEmailViaEdgeFunction('applicant', pdfUploadResult?.signedUrl, applicantEmailData);
    console.log('Applicant email sent via Edge Function');
  } catch (applicantEmailErr) {
    console.warn('Edge Function applicant email error, falling back to EmailJS:', applicantEmailErr);
    // Fallback to EmailJS for applicant
    try {
      const params = {
        to_email: pemohonEmail,
        ref_id: finalRef,
        jenis: JENIS_LABEL[jenis] || jenis,
        fasal: fasalVal,
        nama_perniagaan: val('nama_perniagaan'),
        proksi_nama: val('proksi_nama') || val('nama_perniagaan'),
        proksi_hp: val('proksi_hp'),
        proksi_emel: pemohonEmail,
        jumlah: `RM ${total.toLocaleString()}`,
        tarikh: new Date().toLocaleDateString('ms-MY'),
        ip_address: clientIp,
        pesan: 'Terima kasih kerana menghantar permohonan keahlian DPMM Negeri Johor. E-mel ini adalah pengesahan penerimaan sahaja dan BUKAN kelulusan automatik.',
      };
      
      await emailjs.send(
        window.CONFIG.EMAILJS_SERVICE_ID,
        window.CONFIG.EMAILJS_APPLICANT_TEMPLATE_ID,
        params
      );
    } catch (emailjsErr) {
      console.warn('EmailJS pemohon error (non-critical):', emailjsErr);
      // Log to database
      await window.sb.from('PERMOHONAN_AHLI')
        .update({ email_error: 'Applicant email failed: ' + emailjsErr.message })
        .eq('ref_id', finalRef);
    }
  }
} else {
  // Log when email is skipped due to missing address
  console.warn('Applicant email not sent: no email address provided');
  await window.sb.from('PERMOHONAN_AHLI')
    .update({ email_error: 'No applicant email provided' })
    .eq('ref_id', finalRef);
}
```

### Fix 3.3: Add Database Column for Email Skip Reason
**Action:** Create migration to add tracking column

**Migration file:** `migrations/add-email-skip-reason.sql`

```sql
-- Add column to track why emails were not sent
ALTER TABLE PERMOHONAN_AHLI 
ADD COLUMN email_skip_reason TEXT;

-- Add comment
COMMENT ON COLUMN PERMOHONAN_AHLI.email_skip_reason IS 'Reason why email was not sent: no_email_provided, edge_function_failed, emailjs_failed, etc.';
```

**Values to store:**
- `'no_email_provided'` - when both email fields empty
- `'edge_function_failed'` - when Edge Function error
- `'emailjs_failed'` - when fallback failed
- `NULL` - when email sent successfully

### Fix 3.4: Update Form Validation UI
**Action:** Add visual indicator for required email field

**Location:** `borang.html` - Tab 7 (submission step)

**Add to email input fields:**
```html
<div class="form-group">
  <label>E-mel Syarikat <span class="required">*</span></label>
  <input type="email" id="emel_syarikat" name="emel_syarikat" placeholder="contoh@syarikat.com">
  <small class="help-text">Diperlukan untuk pengesahan permohonan</small>
</div>

<div class="form-group">
  <label>E-mel Proksi/Wakil <span class="optional">(atau guna e-mel syarikat)</span></label>
  <input type="email" id="proksi_emel" name="proksi_emel" placeholder="contoh@proxy.com">
</div>
```

**CSS for required indicator:**
```css
.required {
  color: #dc2626;
  font-weight: bold;
}

.optional {
  color: #6b7280;
  font-style: italic;
}
```

---

## Phase 4: PDF Architecture Documentation

### Current Architecture

The system has **three email mechanisms** with different PDF attachment capabilities:

| Mechanism | Location | PDF Support | Used For | Status |
|-----------|----------|-------------|----------|--------|
| **Edge Function** | `supabase/functions/email-with-pdf` | ✅ YES - via `pdf_url` parameter | Primary email sending (admin + applicant) | PRIMARY |
| **EmailJS** | Client-side (borang.html) | ❌ NO | Fallback when Edge Function fails | FALLBACK |
| **Resend API** | `/api/send-email` (server-side) | ❌ NO | Legacy server-side endpoint | LEGACY |

### Evidence

**Edge Function with PDF:**
- File: `supabase/functions/email-with-pdf/index.ts`
- Lines 220-238: Fetches PDF from `pdf_url` and attaches
- Code:
```typescript
if (pdf_url) {
  try {
    const pdfResponse = await fetch(pdf_url);
    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF from storage');
    }
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    mailOptions.attachments = [{
      filename: `Borang_Permohonan_${applicant_data.ref_id}.pdf`,
      content: Buffer.from(pdfBuffer),
      contentType: 'application/pdf'
    }];
  } catch (pdfError) {
    console.error('Failed to attach PDF:', pdfError);
    // Continue without PDF attachment
  }
}
```

**Resend API without PDF:**
- File: `src/config-endpoint.js`
- Lines 186-218: Only sends `from`, `to`, `subject`, `html`
- Code:
```javascript
let emailData = {
  from: process.env.RESEND_FROM_EMAIL || 'noreply@dpmmjohor.org',
  to: toEmail,
  subject: data.subject || 'DPMM Johor - Permohonan Keahlian',
  html: data.html || ''
};
// NO attachments field
```

### Recommendation

**Option A (Recommended):** Remove EmailJS fallback entirely
- Rely only on Edge Function for all emails
- Ensures PDFs are always attached
- Simplifies codebase
- If Edge Function fails, show error to user and retry

**Option B:** Keep EmailJS but document limitation
- EmailJS fallback sends email WITHOUT PDF
- Add clear disclaimer in email body: "PDF borang akan dihantar secara berasingan"
- Consider adding PDF download link in email body

**Option C:** Add PDF support to `/api/send-email`
- Implement Resend attachment API
- Requires backend changes
- More complex but ensures all paths have PDF support

**Decision:** Implement Option A (remove EmailJS fallback) for simplicity and consistency.

---

## Phase 5: Fix Tab 7 Display Issue

### Root Cause
Tab 7 displays applicant name using fallback logic that doesn't check all possible name fields.

**Current logic (from context):**
```javascript
// Falls back to generic string if proksi_nama is missing
const displayName = val('proksi_nama') || 'Pemilik Tunggal';
```

**Problem:** Does not check `nama_lengkap_pemohon` before falling back to generic string.

### Fix
**Action:** Update display logic to check all name fields in priority order

**Location:** `borang.html` - Tab 7 display logic

**Before:**
```javascript
const displayName = val('proksi_nama') || 'Pemilik Tunggal';
```

**After:**
```javascript
const displayName = val('proksi_nama') || val('nama_lengkap_pemohon') || val('nama_perniagaan') || 'Pemilik Tunggal';
```

**Priority order:**
1. `proksi_nama` (proxy name - most specific for SDN BHD/Perkongsian)
2. `nama_lengkap_pemohon` (applicant full name)
3. `nama_perniagaan` (business name)
4. `'Pemilik Tunggal'` (generic fallback for PLT)

---

## Phase 6: Improve Error Visibility

### Current State
Email failures are only logged to console:
- No user-facing error messages
- No database audit trail
- Silent failures possible

### Fix 6.1: Add User-Facing Error Messages
**Action:** Show toast notifications for email failures

**Location:** `borang.html` - email sending sections

**Add after email send attempts:**
```javascript
// After Edge Function success
showToast('E-mel berjaya dihantar', 'success');

// After Edge Function failure
showToast('Gagal menghantar e-mel melalui Edge Function, mencuba kaedah alternatif...', 'warning');

// After EmailJS fallback success
showToast('E-mel berjaya dihantar (kaedah alternatif)', 'success');

// After all methods fail
showToast('Gagal menghantar e-mel. Sila hubungi admin dengan no. rujukan: ' + finalRef, 'error');
```

### Fix 6.2: Add Database Audit Trail
**Action:** Ensure all email failures are recorded in database

**Columns already exist:**
- `email_error` (TEXT) - error message
- `email_admin_sent` (BOOLEAN) - admin email status
- `email_applicant_sent` (BOOLEAN) - applicant email status
- `email_admin_sent_at` (TIMESTAMP) - admin email timestamp
- `email_applicant_sent_at` (TIMESTAMP) - applicant email timestamp

**Update code to always set these fields:**
```javascript
// After admin email attempt
await window.sb.from('PERMOHONAN_AHLI')
  .update({ 
    email_admin_sent: true,
    email_admin_sent_at: new Date().toISOString(),
    email_error: null
  })
  .eq('ref_id', finalRef);

// On admin email failure
await window.sb.from('PERMOHONAN_AHLI')
  .update({ 
    email_admin_sent: false,
    email_error: 'Admin email failed: ' + adminEmailErr.message
  })
  .eq('ref_id', finalRef);
```

### Fix 6.3: Add Console Logging for Debugging
**Action:** Add structured logging for email operations

**Add to email sending sections:**
```javascript
console.log('[EMAIL] Attempting to send admin email via Edge Function');
console.log('[EMAIL] PDF URL:', pdfUploadResult?.signedUrl);
console.log('[EMAIL] Recipient:', ADMIN_EMAIL);
console.log('[EMAIL] Result:', success ? 'SUCCESS' : 'FAILED');
```

---

## Phase 7: Testing & Verification

### Test Case 1: Column Alignment
**Steps:**
1. Run Phase 1 verification
2. Check column alignment matrix
3. Fix any mismatches before proceeding

**Expected:** All columns aligned across database, frontend, backend

### Test Case 2: Duplicate Email Fix
**Steps:**
1. Remove line 4759 from borang.html
2. Submit test application
3. Check admin email inbox
4. Verify exactly ONE email received
5. Verify email has PDF attachment

**Expected:** Single email with PDF attachment

### Test Case 3: Applicant Email Validation
**Steps:**
1. Try submitting without any email field
2. Verify validation error appears
3. Fill in `emel_syarikat` only
4. Submit and verify applicant receives email
5. Fill in `proksi_emel` only
6. Submit and verify applicant receives email

**Expected:** Validation prevents submission without email, applicant receives email when provided

### Test Case 4: Tab 7 Display Fix
**Steps:**
1. Submit application with only `nama_lengkap_pemohon`
2. Navigate to Tab 7
3. Verify name displays correctly
4. Submit application with only `nama_perniagaan`
5. Verify name displays correctly

**Expected:** Name displays using best available field, not generic fallback

### Test Case 5: Error Visibility
**Steps:**
1. Simulate Edge Function failure (disable Edge Function temporarily)
2. Submit application
3. Verify user sees error message
4. Check database `email_error` field
5. Check console logs

**Expected:** User sees error, database records failure, console logs details

---

## Phase 8: Deployment Checklist

### Pre-Deployment
- [ ] Phase 1: Column verification completed and documented
- [ ] All column mismatches fixed
- [ ] Migration files reviewed and tested
- [ ] Code changes tested locally
- [ ] Test cases executed and passed

### Deployment Steps
1. **Apply migrations:**
   ```bash
   supabase db push migrations/add-email-skip-reason.sql
   ```

2. **Update borang.html:**
   - Remove line 4759 (duplicate email)
   - Add email validation (Fix 3.1)
   - Add email failure logging (Fix 3.2)
   - Update Tab 7 display logic (Phase 5)
   - Add error visibility (Phase 6)

3. **Test on staging:**
   - Submit test application
   - Verify email delivery
   - Check database records
   - Verify PDF attachments

4. **Deploy to production:**
   - Commit changes to git
   - Push to main branch
   - Wait for GitHub Pages deployment (1-2 minutes)
   - Clear browser cache (Ctrl+Shift+R)
   - Test live version

### Post-Deployment Verification
- [ ] Monitor email delivery for 24 hours
- [ ] Check database `email_error` field for failures
- [ ] Verify no duplicate admin emails
- [ ] Verify applicant emails being sent
- [ ] Check console logs for errors

---

## Phase 9: Rollback Plan

If issues arise after deployment:

### Rollback Steps
1. **Revert borang.html changes:**
   ```bash
   git checkout HEAD~1 borang.html
   ```

2. **Rollback migration:**
   ```sql
   ALTER TABLE PERMOHONAN_AHLI DROP COLUMN IF EXISTS email_skip_reason;
   ```

3. **Redeploy:**
   ```bash
   git push origin main
   ```

### Rollback Triggers
- Email delivery rate drops below 90%
- Users report missing emails
- Database errors related to new column
- PDF generation failures increase

---

## Phase 10: Documentation Updates

### Update README.md
Add section on email architecture:
```markdown
## Email System

The system uses a three-tier email architecture:

1. **Primary:** Supabase Edge Function (`email-with-pdf`)
   - Sends emails with PDF attachments
   - Used for both admin and applicant notifications
   - Retry logic: 3 attempts with exponential backoff

2. **Fallback:** None (removed EmailJS fallback for consistency)

3. **Legacy:** `/api/send-email` (Resend API)
   - Server-side endpoint
   - Does NOT support PDF attachments
   - Used only for admin panel retry functionality
```

### Update docs/EMAIL-RETRY.md
Document the email retry mechanism and skip reasons.

### Create docs/EMAIL-ARCHITECTURE.md
Comprehensive documentation of email system design and troubleshooting.

---

## Summary of All Fixes

| Issue | Phase | Priority | Status |
|-------|-------|----------|--------|
| Column name alignment | Phase 1 | CRITICAL | TODO |
| Duplicate admin emails | Phase 2 | HIGH | TODO |
| Missing applicant emails | Phase 3 | HIGH | TODO |
| PDF architecture documentation | Phase 4 | MEDIUM | TODO |
| Tab 7 display issue | Phase 5 | MEDIUM | TODO |
| Error visibility | Phase 6 | MEDIUM | TODO |
| Testing & verification | Phase 7 | HIGH | TODO |
| Deployment | Phase 8 | HIGH | TODO |
| Rollback plan | Phase 9 | MEDIUM | TODO |
| Documentation | Phase 10 | LOW | TODO |

---

## Dependencies

### External Services
- Supabase (database, storage, Edge Functions)
- EmailJS (fallback - to be removed)
- Resend API (legacy server-side)
- Gmail SMTP (Edge Function)

### Environment Variables Required
- `RESEND_API_KEY` (for `/api/send-email`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` (Edge Function)

### Supabase Configuration
- Project ID: `lzoloupwtqmjyupvofhh`
- Storage bucket: `permohonan-dokumen`
- Edge Function: `email-with-pdf`

---

## Risk Assessment

### Risks
1. **Risk-001:** Removing EmailJS fallback may reduce email delivery reliability if Edge Function fails
   - **Mitigation:** Add retry logic to Edge Function (already implemented), monitor delivery rates

2. **Risk-002:** Adding email validation may prevent legitimate submissions from users without email
   - **Mitigation:** Clear error messages, allow admin to manually add email later

3. **Risk-003:** Column name changes may break existing functionality
   - **Mitigation:** Comprehensive verification in Phase 1, test thoroughly

### Assumptions
1. **ASSUMPTION-001:** Edge Function is more reliable than EmailJS fallback
2. **ASSUMPTION-002:** All users have at least one email address
3. **ASSUMPTION-003:** Database schema matches migration files

---

## Success Criteria

Fix is considered successful when:
- [ ] Column names are consistent across all components
- [ ] Admin receives exactly ONE email per submission
- [ ] Admin email always has PDF attachment
- [ ] Applicant receives email when email field is provided
- [ ] Form validation prevents submission without email
- [ ] Tab 7 displays correct applicant name
- [ ] Email failures are visible to users and logged in database
- [ ] No regression in existing functionality
- [ ] All test cases pass

---

## Next Steps

1. **Execute Phase 1** - Column verification (DO THIS FIRST)
2. **Review findings** from Phase 1
3. **Fix any column mismatches** before proceeding
4. **Execute Phases 2-10** in order
5. **Test thoroughly** at each phase
6. **Deploy** when all phases complete and tests pass

**IMPORTANT:** Do not skip Phase 1. Column alignment is the foundation for all other fixes. Proceeding without verification risks introducing new bugs.
