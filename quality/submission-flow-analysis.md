# Submission Flow Analysis - borang.html

## Current Implementation Analysis

### 1. Email to Applicants
**Location:** borang.html lines 4530-4560
**Function:** `sendEmailsInBackground()` - applicant email section
**Implementation:**
- Uses EmailJS client-side with template `template_553fkme`
- Sends to `proksi_emel` or `emel_syarikat`
- Updates `email_applicant_sent` and `email_applicant_sent_at` fields
- Non-blocking (runs in background after form submission)
- Error handling: logs warning but doesn't fail submission

**Status:** ✅ Implemented

### 2. Email to Admin DPMM
**Location:** borang.html lines 4464-4528
**Function:** `sendEmailsInBackground()` - admin email section
**Implementation:**
- Uses EmailJS client-side with template `template_vud79xb`
- Sends to admin with `[ADMIN ALERT]` prefix
- Updates `email_admin_sent` and `email_admin_sent_at` fields
- Non-blocking (runs in background after form submission)
- Error handling: logs warning but doesn't fail submission

**Status:** ✅ Implemented

### 3. Display in index.html (Permohonan Ahli tab)
**Location:** index.html lines 5595-5622, 5640-5644
**Functions:** `loadPermohonanData()`, `renderPermohonanPage()`
**Implementation:**
- Loads data from `PERMOHONAN_AHLI` table
- Orders by `submitted_at` descending
- Displays in table with tabs (BARU, DOKUMEN_LENGKAP, etc.)
- Filters by status based on selected tab
- Auto-refreshes when page is shown

**Status:** ✅ Implemented

### 4. Side Panel Counter Update
**Location:** index.html lines 5625-5637
**Function:** `updatePermohonanBadge()`
**Implementation:**
- Counts records with status: BARU, DOKUMEN_LENGKAP, DOKUMEN_TIDAK_LENGKAP, DALAM_PERHATIAN
- Updates `#permohonan-badge` element
- Hides badge if count is 0
- Called after data load

**Status:** ✅ Implemented

## Integration Flow

```
User submits form (borang.html)
    ↓
Insert into PERMOHONAN_AHLI with status='BARU'
    ↓
Show success screen immediately
    ↓
Background: sendEmailsInBackground()
    ├─ Update email_admin_sent=true
    ├─ Send admin email via EmailJS
    ├─ Update email_applicant_sent=true
    └─ Send applicant email via EmailJS
    ↓
User navigates to index.html
    ↓
renderPermohonanPage() called
    ├─ loadPermohonanData() from PERMOHONAN_AHLI
    ├─ updatePermohonanBadge() updates counter
    └─ renderPermohonanTable() displays in tab
```

## Potential Issues Identified

### Issue 1: No Real-time Counter Update
**Problem:** The counter only updates when the user manually refreshes or navigates to the Permohonan Ahli page. It doesn't update in real-time when a new submission is made.

**Impact:** Low - User needs to refresh to see new submissions

### Issue 2: Email Error Handling
**Problem:** Email errors are logged but not displayed to the user. If EmailJS fails, the user won't know the email wasn't sent.

**Impact:** Medium - User may think email was sent when it wasn't

### Issue 3: No Email Retry Mechanism
**Problem:** If EmailJS fails on first attempt, there's no retry logic.

**Impact:** Medium - Transient network issues could cause email failures

### Issue 4: Status Field Mismatch
**Problem:** The payload sets `status: 'BARU'` but the badge update checks for multiple statuses including 'DOKUMEN_LENGKAP', etc. This is correct for the badge but needs verification that the initial status is always 'BARU'.

**Impact:** Low - Current implementation is correct

## Test Plan

### Test 1: EmailJS Configuration
- Verify EmailJS is initialized correctly
- Check service ID, public key, template IDs
- Test email sending with test data

### Test 2: Database Insertion
- Verify submission inserts into PERMOHONAN_AHLI
- Check status is set to 'BARU'
- Verify email status fields are updated

### Test 3: Dashboard Display
- Verify new submission appears in Permohonan Ahli tab
- Check counter updates with new submission
- Verify tab filtering works correctly

### Test 4: End-to-End Flow
- Complete form submission
- Verify both emails are sent
- Verify submission appears in dashboard
- Verify counter is updated
