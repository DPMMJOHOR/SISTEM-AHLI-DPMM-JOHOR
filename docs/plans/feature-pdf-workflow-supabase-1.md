---
goal: Implement PDF generation with Supabase Storage and Edge Functions for email attachments
version: 1.0
date_created: 2026-07-19
last_updated: 2026-07-19
owner: DPMM Johor Development Team
status: 'Planned'
tags: ['feature', 'supabase', 'pdf', 'email', 'storage']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan outlines the complete workflow for generating, storing, and emailing PDF membership application forms. The system will use Supabase Storage for PDF storage and Supabase Edge Functions for sending emails with PDF attachments to both administrators and applicants.

## 1. Requirements & Constraints

- **REQ-001**: All generated PDFs must include a header "https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html" on all 6 pages (top right corner)
- **REQ-002**: Generated PDFs must be stored in Supabase Storage bucket "permohonan-dokumen" (already exists, private, 10MB limit)
- **REQ-003**: PDF must be attached to both admin and applicant email notifications
- **REQ-004**: Applicants must be able to view and print their generated PDF on the success page
- **REQ-005**: Admin must be able to view generated PDFs in the existing "Semak" modal in index.html
- **REQ-006**: Email service must support PDF attachments (Supabase Edge Functions, not EmailJS)
- **REQ-007**: Use single Edge Function for both admin and applicant emails with parameters
- **REQ-008**: Success page should use modal approach for PDF display (less disruptive)
- **REQ-009**: PDF file naming convention: borang-[ref_id]-[timestamp].pdf
- **REQ-010**: PDF storage path: borang/[ref_id]/borang-[ref_id].pdf
- **SEC-001**: API keys must be stored in Supabase environment variables, not client-side
- **SEC-002**: PDF storage must use appropriate RLS policies for security
- **SEC-003**: PDF URLs should use signed URLs for private bucket access
- **SEC-004**: Email sending must use secure SMTP with TLS
- **CON-001**: Must use Supabase free tier (500k GB-hours/month is sufficient)
- **CON-002**: Existing EmailJS integration will be replaced for PDF-enabled emails
- **CON-003**: Bucket has 10MB file size limit - PDFs must be optimized if needed
- **CON-004**: Bucket is private - must use signed URLs for public access
- **GUD-001**: Follow existing Supabase Edge Function patterns (ai-proxy as reference)
- **GUD-002**: Follow existing RLS policy patterns from PERMOHONAN_AHLI table
- **GUD-003**: Use Supabase client library for storage operations
- **GUD-004**: Maintain backward compatibility with existing email system

## 2. Implementation Steps

### Implementation Phase 1: PDF Header Addition

- GOAL-001: Add online submission header to all 6 pages of generated PDF

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Modify downloadPDFFromTemplate() in borang.html to add header text on all pages | | |
| TASK-002 | Position header at top right corner (x: 450, y: height-30) on each page | | |
| TASK-003 | Use small font size (8pt) and gray color for header to be unobtrusive | | |
| TASK-004 | Test PDF generation to verify header appears on all 6 pages | | |

### Implementation Phase 2: Supabase Storage Configuration

- GOAL-002: Configure existing Supabase Storage bucket for PDF storage

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-005 | Verify existing bucket "permohonan-dokumen" configuration (already exists, private, 10MB limit) | | |
| TASK-006 | Configure RLS policy for bucket: allow authenticated uploads, allow public reads for PDFs | | |
| TASK-007 | Test bucket file upload via Supabase dashboard | | |
| TASK-008 | Verify allowed MIME types include application/pdf (already configured) | | |

### Implementation Phase 3: PDF Storage Integration

- GOAL-003: Store generated PDFs in Supabase Storage after form submission

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-009 | Modify downloadPDFFromTemplate() to return PDF bytes instead of direct download | | |
| TASK-010 | Create uploadPDFToSupabase() function in borang.html using Supabase Storage API | | |
| TASK-011 | Upload PDF to permohonan-dokumen bucket with path: borang/[ref_id]/borang-[ref_id].pdf | | |
| TASK-012 | Store PDF URL in PERMOHONAN_AHLI table (new column: pdf_url) | | |
| TASK-013 | Update form submission flow to call uploadPDFToSupabase() before email sending | | |
| TASK-014 | Handle upload errors with retry logic (max 3 attempts) | | |
| TASK-015 | Generate signed URL for PDF access (bucket is private) | | |
| TASK-016 | Add PDF metadata (created_at, file_size, mime_type) to storage metadata | | |
| TASK-017 | Implement PDF compression if file size exceeds 8MB (below 10MB limit) | | |
| TASK-018 | Add progress indicator for PDF upload to user | | |

### Implementation Phase 4: Edge Function for Email with PDF

- GOAL-004: Create Supabase Edge Function for sending emails with PDF attachments

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-019 | Create new Edge Function: supabase/functions/email-with-pdf/index.ts | | |
| TASK-020 | Configure environment variables: SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM | | |
| TASK-021 | Implement email sending using nodemailer library with TLS | | |
| TASK-022 | Add support for PDF attachments from Supabase Storage signed URLs | | |
| TASK-023 | Add parameters: recipient_type (admin|applicant), template_type, pdf_url, applicant_data | | |
| TASK-024 | Implement admin email template with PDF attachment (template_vud79xb equivalent) | | |
| TASK-025 | Implement applicant email template with PDF attachment (template_553fkme equivalent) | | |
| TASK-026 | Add error handling for SMTP failures with retry logic | | |
| TASK-027 | Add rate limiting to prevent email abuse (max 10 emails per minute) | | |
| TASK-028 | Add logging for email delivery tracking | | |
| TASK-029 | Deploy Edge Function to Supabase | | |
| TASK-030 | Test Edge Function locally before deployment | | |

### Implementation Phase 5: Email Integration Update

- GOAL-005: Replace EmailJS with Edge Function for PDF-enabled emails

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-031 | Update borang.html email sending logic to call Edge Function | | |
| TASK-032 | Pass PDF signed URL to Edge Function for attachment | | |
| TASK-033 | Keep EmailJS as fallback for non-PDF emails (if needed) | | |
| TASK-034 | Update email sending to handle both Edge Function and EmailJS paths | | |
| TASK-035 | Add email sending status indicator to user | | |
| TASK-036 | Test admin email with PDF attachment | | |
| TASK-037 | Test applicant email with PDF attachment | | |
| TASK-038 | Verify email content matches templates | | |
| TASK-039 | Add email delivery confirmation to success page | | |

### Implementation Phase 6: Success Page PDF Display

- GOAL-006: Add PDF viewer to success page using modal approach

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-040 | Create PDF viewer modal in borang.html success section | | |
| TASK-041 | Add "Lihat Borang" button on success page to open modal | | |
| TASK-042 | Embed PDF viewer using iframe with signed URL from Supabase Storage | | |
| TASK-043 | Add "Cetak" button in modal to trigger browser print | | |
| TASK-044 | Add "Muat Turun" button to download PDF directly | | |
| TASK-045 | Style modal to be responsive and user-friendly | | |
| TASK-046 | Add loading state while PDF loads | | |
| TASK-047 | Add error handling if PDF fails to load | | |
| TASK-048 | Implement PDF viewer fallback for mobile browsers | | |
| TASK-049 | Add close button to modal | | |
| TASK-050 | Add keyboard shortcut (ESC) to close modal | | |

### Implementation Phase 7: Admin PDF Viewer Integration

- GOAL-007: Add PDF viewer to existing "Semak" modal in index.html

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-051 | Add new sub-tab "Borang" to existing modal tabs (maklumat, saham, dokumen, bayaran, admin) | | |
| TASK-052 | Modify switchModalTab() function to handle "borang" tab | | |
| TASK-053 | Create buildTabBorang() function to display PDF viewer | | |
| TASK-054 | Load PDF from pdf_url column in PERMOHONAN_AHLI table | | |
| TASK-055 | Generate signed URL for PDF access (bucket is private) | | |
| TASK-056 | Add error handling if pdf_url is null or PDF not found | | |
| TASK-057 | Add print and download buttons in admin PDF viewer | | |
| TASK-058 | Add PDF metadata display (file size, upload date) | | |
| TASK-059 | Add loading state while PDF loads | | |
| TASK-060 | Style PDF viewer to match existing modal design | | |
| TASK-061 | Add PDF viewer to all existing modal tabs as optional view | | |
| TASK-062 | Test PDF viewer with different entity types and form data | | |

### Implementation Phase 8: Database Schema Update

- GOAL-008: Add PDF URL column to PERMOHONAN_AHLI table

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-063 | Create migration to add pdf_url column to PERMOHONAN_AHLI table | | |
| TASK-064 | Set column type as TEXT to store Supabase Storage URL | | |
| TASK-065 | Add pdf_uploaded_at column to track PDF upload timestamp | | |
| TASK-066 | Add pdf_file_size column to track PDF file size | | |
| TASK-067 | Apply migration to Supabase database | | |
| TASK-068 | Update RLS policies to allow UPDATE on pdf_url column | | |
| TASK-069 | Add index on pdf_url column for faster queries | | |
| TASK-070 | Add index on pdf_uploaded_at for sorting by upload date | | |
| TASK-071 | Test migration on development environment first | | |
| TASK-072 | Rollback plan if migration fails | | |

### Implementation Phase 9: Testing & Validation

- GOAL-009: Comprehensive testing of complete PDF workflow

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-073 | Test PDF generation with header on all 6 pages | | |
| TASK-074 | Test PDF upload to Supabase Storage with retry logic | | |
| TASK-075 | Test signed URL generation for private bucket access | | |
| TASK-076 | Test admin email with PDF attachment | | |
| TASK-077 | Test applicant email with PDF attachment | | |
| TASK-078 | Test success page modal PDF display | | |
| TASK-079 | Test admin "Semak" modal PDF viewer | | |
| TASK-080 | Test PDF print functionality in both viewers | | |
| TASK-081 | Test PDF download functionality in both viewers | | |
| TASK-082 | Test error handling for failed PDF uploads | | |
| TASK-083 | Test error handling for failed email sending | | |
| TASK-084 | Test PDF compression for files approaching 10MB limit | | |
| TASK-085 | Test rate limiting on Edge Function (10 emails/minute) | | |
| TASK-086 | Test RLS policies for bucket access | | |
| TASK-087 | Test database migration rollback plan | | |
| TASK-088 | Test with different entity types (Pemunya Tunggal, Sdn Bhd, etc.) | | |
| TASK-089 | Test with different browser types (Chrome, Firefox, Safari) | | |
| TASK-090 | Test on mobile devices for PDF viewer fallback | | |
| TASK-091 | Load test with 10 concurrent form submissions | | |
| TASK-092 | Test email delivery to spam folder | | |
| TASK-093 | Test PDF viewer with large PDF files | | |
| TASK-094 | Test signed URL expiration handling | | |
| TASK-095 | End-to-end test: Form submission → PDF generation → Storage → Email → Display | | |

## 3. Alternatives

- **ALT-001**: Use Resend API for email with attachments
  - Not chosen: Requires API key, less integrated with Supabase ecosystem
- **ALT-002**: Store PDFs as base64 in database
  - Not chosen: Database bloat, performance issues, not scalable
- **ALT-003**: Use full-page redirect for PDF display on success page
  - Not chosen: Modal approach is less disruptive, better UX
- **ALT-004**: Keep EmailJS and use separate service for PDFs
  - Not chosen: EmailJS cannot handle file attachments, unnecessary complexity

## 4. Dependencies

- **DEP-001**: Supabase Storage bucket "permohonan-dokumen" (already exists, needs RLS policy configuration)
- **DEP-002**: Supabase Edge Functions runtime must be enabled
- **DEP-003**: SMTP service credentials (SendGrid, Mailgun, or similar)
- **DEP-004**: pdf-lib library (already in use)
- **DEP-005**: nodemailer library for Edge Function
- **DEP-006**: PDF.js library for PDF viewer (optional, can use iframe)

## 5. Files

- **FILE-001**: borang.html - PDF generation, upload logic, success page modal
- **FILE-002**: index.html - Admin PDF viewer in "Semak" modal
- **FILE-003**: supabase/functions/email-with-pdf/index.ts - New Edge Function
- **FILE-004**: supabase/migrations/[timestamp]_add_pdf_url.sql - Database migration
- **FILE-005**: src/config-loader.js - Update to include Edge Function URL

## 6. Testing

- **TEST-001**: Verify PDF header appears on all 6 pages at correct position
- **TEST-002**: Verify PDF upload to Supabase Storage succeeds
- **TEST-003**: Verify PDF URL is stored in PERMOHONAN_AHLI table
- **TEST-004**: Verify admin email contains PDF attachment
- **TEST-005**: Verify applicant email contains PDF attachment
- **TEST-006**: Verify success page modal displays PDF correctly
- **TEST-007**: Verify admin "Semak" modal displays PDF correctly
- **TEST-008**: Verify print functionality works in both viewers
- **TEST-009**: Verify download functionality works in both viewers
- **TEST-010**: Verify error handling for missing PDFs
- **TEST-011**: Verify RLS policies prevent unauthorized access
- **TEST-012**: Verify Edge Function handles SMTP errors gracefully

## 7. Risks & Assumptions

- **RISK-001**: SMTP service may have attachment size limits
  - Mitigation: Compress PDF if needed, use service with higher limits
- **RISK-002**: Supabase Storage may have bandwidth limits on free tier
  - Mitigation: Monitor usage, upgrade to Pro tier if needed
- **RISK-003**: Edge Function cold start may delay email sending
  - Mitigation: Implement retry logic, provide user feedback
- **RISK-004**: PDF viewer may not work in all browsers
  - Mitigation: Use iframe with fallback to download link
- **ASSUMPTION-001**: SMTP service credentials are available
- **ASSUMPTION-002**: Supabase project has Edge Functions enabled
- **ASSUMPTION-003**: PDF file size is within email attachment limits (typically 25MB)
- **ASSUMPTION-004**: Users have PDF viewer capability in their browsers

## 8. Related Specifications / Further Reading

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [nodemailer Documentation](https://nodemailer.com/)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
