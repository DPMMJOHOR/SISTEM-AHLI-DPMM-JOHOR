# borang.html Requirements & Test Specifications

**Version:** 1.0  
**Date:** 26 Julai 2026  
**Status:** Production Ready with Improvements

---

## Functional Requirements

### REQ-001: Form Validation
**Requirement:** All form inputs must be validated before submission.

**Use Cases:**
- UC-001: User enters invalid IC format → Form shows error message
- UC-002: User leaves required field empty → Form prevents submission
- UC-003: User enters invalid email → Form shows error message

**Acceptance Criteria:**
- IC format validation: XXXXXX-XX-XXXX or 12 digits
- Required fields: nama_pemohon, no_ic, emel, jenis_entiti
- Email format: valid email address
- Business name: non-empty string
- Phone number: valid Malaysian format (optional)

**Test Cases:**
```javascript
// Valid IC formats
✓ "123456-12-1234"
✓ "123456121234"

// Invalid IC formats
✗ "12345-12-1234" (too short)
✗ "1234567-12-1234" (too long)
✗ "XXXXXX-XX-XXXX" (letters)

// Valid emails
✓ "user@example.com"
✓ "user+tag@example.co.uk"

// Invalid emails
✗ "user@" (incomplete)
✗ "@example.com" (no local part)
```

---

### REQ-002: PDF Generation
**Requirement:** Form must generate a 6-page PDF with all submitted data.

**Use Cases:**
- UC-004: User completes form → PDF is generated with all data
- UC-005: User submits form → PDF includes online submission header
- UC-006: PDF is generated → All 6 pages contain correct data

**Acceptance Criteria:**
- PDF has exactly 6 pages
- Online submission header on all pages (top right)
- All form fields populated correctly
- JPEG templates overlaid correctly
- PDF generated in < 5 seconds
- PDF file size < 10MB

**Test Cases:**
```javascript
// PDF generation
✓ Generate PDF with all fields filled
✓ Verify 6 pages in PDF
✓ Verify online submission header on all pages
✓ Verify all text fields populated
✓ Verify generation time < 5 seconds

// PDF content validation
✓ Page 1: Business type and name
✓ Page 2: Contact information
✓ Page 3: Business details
✓ Page 4: Shareholders information
✓ Page 5: Documents and declarations
✓ Page 6: Confirmation and signature
```

---

### REQ-003: PDF Storage & Upload
**Requirement:** Generated PDF must be uploaded to Supabase Storage with proper RLS policies.

**Use Cases:**
- UC-007: PDF is generated → Uploaded to permohonan-dokumen bucket
- UC-008: PDF is uploaded → Metadata stored in PERMOHONAN_AHLI table
- UC-009: PDF is stored → Only authenticated users can access

**Acceptance Criteria:**
- PDF uploaded to correct bucket (permohonan-dokumen)
- Path format: borang/[ref_id]/borang-[ref_id].pdf
- RLS policies enforced (authenticated users only)
- Metadata stored: pdf_url, pdf_uploaded_at, pdf_file_size
- File size < 10MB
- Upload completes in < 10 seconds

**Test Cases:**
```javascript
// Storage upload
✓ Upload PDF to permohonan-dokumen bucket
✓ Verify path format: borang/[ref_id]/borang-[ref_id].pdf
✓ Verify file size < 10MB
✓ Verify upload time < 10 seconds

// Metadata storage
✓ Store pdf_url in PERMOHONAN_AHLI
✓ Store pdf_uploaded_at timestamp
✓ Store pdf_file_size in bytes

// RLS enforcement
✓ Authenticated user can read PDF
✓ Anonymous user cannot read PDF
✓ Different user cannot read other's PDF
```

---

### REQ-004: Email Notifications
**Requirement:** Email notifications must be sent to admin and applicant after form submission.

**Use Cases:**
- UC-010: Form submitted → Email sent to admin with PDF attachment
- UC-011: Form submitted → Email sent to applicant with confirmation
- UC-012: Email fails → Fallback to EmailJS
- UC-013: Both email methods fail → User sees error message

**Acceptance Criteria:**
- Admin receives email with PDF attachment
- Applicant receives confirmation email
- Email sent within 10 seconds
- Retry logic: 3 attempts with exponential backoff
- Rate limiting: 10 emails/min per IP
- Fallback to EmailJS if Edge Function fails

**Test Cases:**
```javascript
// Email delivery
✓ Send email to admin with PDF
✓ Send email to applicant with confirmation
✓ Email delivered within 10 seconds
✓ Email contains correct recipient
✓ Email contains correct subject

// Retry logic
✓ First attempt succeeds → Email sent
✓ First attempt fails → Retry after 1 second
✓ Second attempt fails → Retry after 2 seconds
✓ Third attempt fails → Show error to user

// Fallback mechanism
✓ Edge Function fails → Fallback to EmailJS
✓ EmailJS succeeds → Email sent
✓ Both fail → Show error message to user
```

---

### REQ-005: IC Number Validation
**Requirement:** IC numbers must be validated in both frontend and RLS policy.

**Use Cases:**
- UC-014: User enters valid IC → Form accepts submission
- UC-015: User enters invalid IC → Form shows error
- UC-016: RLS policy validates IC → Invalid IC rejected at database

**Acceptance Criteria:**
- Frontend validation: XXXXXX-XX-XXXX or 12 digits
- RLS policy enforces same validation
- Error message shown for invalid IC
- Database rejects invalid IC with 400 error

**Test Cases:**
```javascript
// Valid IC formats
✓ "123456-12-1234" (with dashes)
✓ "123456121234" (without dashes)

// Invalid IC formats
✗ "12345-12-1234" (5 digits before dash)
✗ "1234567-12-1234" (7 digits before dash)
✗ "123456-1-1234" (1 digit in middle)
✗ "123456-12-123" (3 digits at end)
✗ "XXXXXX-XX-XXXX" (letters)

// RLS validation
✓ Valid IC passes RLS check
✗ Invalid IC fails RLS check with 400 error
```

---

### REQ-006: Isi Pintar (Smart Autofill)
**Requirement:** Form must support AI-powered smart autofill using OCR.

**Use Cases:**
- UC-017: User uploads business registration document → OCR extracts data
- UC-018: OCR extracts data → Form fields auto-populated
- UC-019: Multi-page PDF → Each page processed separately

**Acceptance Criteria:**
- OCR processes multi-page PDFs
- Per-page merge to avoid 413 errors
- Extracted data auto-populates form fields
- Processing completes in < 30 seconds
- GROQ_API_KEY configured in Supabase

**Test Cases:**
```javascript
// OCR processing
✓ Upload single-page PDF
✓ Upload multi-page PDF (6 pages)
✓ Extract text from each page
✓ Merge results without errors
✓ Processing time < 30 seconds

// Data extraction
✓ Extract business name
✓ Extract IC number
✓ Extract business address
✓ Extract contact information

// Form population
✓ Auto-populate nama_syarikat
✓ Auto-populate no_ic
✓ Auto-populate alamat
✓ Auto-populate no_hp
```

---

### REQ-007: AIMAN Chatbot Integration
**Requirement:** Form must include AIMAN chatbot for user assistance.

**Use Cases:**
- UC-020: User asks question → AIMAN responds in Malay or English
- UC-021: User asks in Malay → AIMAN responds in Malay
- UC-022: User asks in English → AIMAN responds in English

**Acceptance Criteria:**
- Chatbot available on all form pages
- Bilingual support (Malay & English)
- Responses limited to 100 words
- Conversational and friendly tone
- No access to private member data

**Test Cases:**
```javascript
// Language detection
✓ User asks in Malay → Response in Malay
✓ User asks in English → Response in English
✓ User asks in mixed language → Detect primary language

// Response quality
✓ Response is helpful and relevant
✓ Response is limited to 100 words
✓ Response is conversational and friendly
✓ Response does not expose private data
```

---

### REQ-008: Success Page
**Requirement:** After successful submission, display success page with confirmation.

**Use Cases:**
- UC-023: Form submitted successfully → Show success page
- UC-024: Success page displayed → Show confirmation message
- UC-025: PDF viewer available → User can view submitted PDF

**Acceptance Criteria:**
- Success page displays after submission
- Confirmation message shown
- PDF viewer modal available
- Corporate styling (no icons, all caps title)
- Email-only delivery (PDF not displayed inline)

**Test Cases:**
```javascript
// Success page display
✓ Form submitted → Success page shown
✓ Success message displayed
✓ Confirmation details shown

// PDF viewer
✓ PDF viewer modal available
✓ User can open PDF viewer
✓ PDF displays correctly
✓ User can download PDF

// Styling
✓ No emoji icons
✓ All caps title
✓ Corporate styling applied
✓ Mobile responsive
```

---

### REQ-009: Cloudflare Turnstile CAPTCHA
**Requirement:** Form must include CAPTCHA to prevent bot submissions.

**Use Cases:**
- UC-026: User submits form → CAPTCHA challenge shown
- UC-027: User passes CAPTCHA → Form submission proceeds
- UC-028: User fails CAPTCHA → Form submission blocked

**Acceptance Criteria:**
- CAPTCHA widget displayed on form
- CAPTCHA validation required before submission
- Failed CAPTCHA blocks submission
- Passed CAPTCHA allows submission

**Test Cases:**
```javascript
// CAPTCHA display
✓ CAPTCHA widget visible on form
✓ CAPTCHA loads correctly

// CAPTCHA validation
✓ User passes CAPTCHA → Submission allowed
✓ User fails CAPTCHA → Submission blocked
✓ User skips CAPTCHA → Submission blocked
```

---

### REQ-010: Mobile Responsiveness
**Requirement:** Form must be fully responsive on mobile devices.

**Use Cases:**
- UC-029: User accesses form on mobile → Form displays correctly
- UC-030: User fills form on mobile → All fields accessible
- UC-031: User submits form on mobile → Submission works

**Acceptance Criteria:**
- Form responsive at 480px (mobile)
- Form responsive at 768px (tablet)
- Form responsive at 1024px+ (desktop)
- Touch targets at least 44px
- Font sizes readable on mobile
- No horizontal scrolling

**Test Cases:**
```javascript
// Mobile viewport (480px)
✓ Form displays without horizontal scroll
✓ All fields accessible
✓ Buttons have 44px touch targets
✓ Font sizes readable

// Tablet viewport (768px)
✓ Form displays correctly
✓ Layout optimized for tablet
✓ Touch targets adequate

// Desktop viewport (1024px+)
✓ Form displays correctly
✓ Layout optimized for desktop
✓ All features accessible
```

---

## Quality Constitution

### Coverage Targets
- **Functional test coverage:** ≥ 80% of use cases
- **Integration test coverage:** ≥ 90% of critical paths
- **Code review coverage:** 100% of changes
- **Spec audit coverage:** 100% of requirements

### Fitness-to-Purpose Scenarios

**Scenario 1: Happy Path — Complete Form Submission**
```
Given: User with valid business registration
When: User fills all form fields and submits
Then: PDF generated, uploaded, emails sent, success page shown
Expected: All operations complete in < 30 seconds
```

**Scenario 2: Validation Failure — Invalid IC**
```
Given: User with invalid IC format
When: User enters invalid IC and tries to submit
Then: Form shows error message, submission blocked
Expected: Error message clear and actionable
```

**Scenario 3: Email Failure & Fallback**
```
Given: Edge Function email fails
When: Form submitted
Then: Fallback to EmailJS, email still sent
Expected: User receives email via fallback method
```

**Scenario 4: PDF Generation Timeout**
```
Given: Large form with many attachments
When: User submits form
Then: PDF generation takes > 5 seconds
Expected: User sees progress indicator, no timeout error
```

**Scenario 5: Mobile Submission**
```
Given: User on mobile device (480px)
When: User fills and submits form
Then: Form responsive, submission works
Expected: No horizontal scrolling, all fields accessible
```

---

## Behavioral Contracts

### Contract 1: Form Validation
```
Input: Form data (name, IC, email, etc.)
Process: Validate each field
Output: Validation result (pass/fail) + error messages
Guarantee: All required fields validated before submission
```

### Contract 2: PDF Generation
```
Input: Form data + JPEG templates
Process: Generate 6-page PDF with data overlay
Output: PDF file (< 10MB)
Guarantee: PDF generated in < 5 seconds, all data included
```

### Contract 3: Email Delivery
```
Input: PDF URL + recipient email
Process: Send email with PDF attachment (retry 3x if fails)
Output: Email delivered or fallback to EmailJS
Guarantee: Email delivered within 10 seconds or error shown
```

### Contract 4: IC Validation
```
Input: IC number string
Process: Validate format (XXXXXX-XX-XXXX or 12 digits)
Output: Validation result (pass/fail)
Guarantee: Frontend and RLS policy use same validation
```

---

## Known Issues & Limitations

### Critical Issues
1. **GROQ_API_KEY Missing** — Isi Pintar feature broken
2. **Admin Password in HTML** — Security exposure

### Medium Issues
3. **No Timeout Handling** — Async operations could hang
4. **Missing Error Boundaries** — Unhandled errors could crash form
5. **Variable Scope Issues** — Regression risk

### Low Issues
6. **CSP Report-Only Mode** — Static hosting limitation
7. **No CSRF Protection** — Static hosting limitation

---

## Test Execution Order

1. **Functional Tests** — Validate all use cases
2. **Integration Tests** — Test end-to-end workflows
3. **Security Tests** — Validate RLS, IC validation, CAPTCHA
4. **Performance Tests** — Verify < 5s PDF, < 10s email
5. **Mobile Tests** — Verify responsive design
6. **Regression Tests** — Verify no scope issues

---

**Requirements Complete**  
**Next:** Phase 3 (Code Review) to identify bugs and verify requirements.
