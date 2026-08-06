# User Flow: Accounting Module

## User Flow: Income Recording

**Entry Point**: User clicks "Rekod Pendapatan Baru" button on accounting dashboard

**Flow Steps**:

1. **Form Display**
   - Show income recording form with progressive disclosure
   - Default category: YURAN
   - Default date: Today
   - Primary action: "Simpan Rekod"
   - Secondary action: "Batal"

2. **Category Selection**
   - User selects income category from dropdown
   - Conditional fields appear based on selection:
     - SUMBANGAN: Show subcategory dropdown (Corporate/Government/Personal)
     - SEWA: Show property name field
     - BANK STATEMENT: Show document upload field
     - OTHER: Show custom description field
   - Add tooltip: "Klik untuk maklumat lanjut tentang kategori ini"

3. **Member Selection (Optional)**
   - User can select member from dropdown
   - Dropdown shows: NO_AHLI - NAMA_AHLI format
   - Default: "— Tidak berkaitan ahli —"
   - Add help text: "Pilihan sahaja - tinggalkan kosong jika tidak berkaitan ahli"

4. **Amount Entry**
   - User enters amount in RM
   - Validation: Must be > 0
   - Auto-format: Show "RM X,XXX.XX" format on blur
   - Add error message: "Sila masukkan jumlah yang sah"

5. **Bank Account Selection**
   - User selects bank account from dropdown
   - Dropdown shows: Bank Name - Account Number format
   - Mark main account with "(Utama)" label
   - Add help text: "Pilih akaun bank yang menerima bayaran ini"

6. **Payment Method Selection**
   - User selects payment method (Tunai/Online/Cek/Lain-lain)
   - If Cek selected: Show additional fields (No. Cek, Bank)
   - Add validation: Reference number required for Online and Cek

7. **Document Upload (Conditional)**
   - If BANK STATEMENT category: Show file upload
   - Accept: PNG, JPG, JPEG, PDF (max 5MB)
   - Show progress bar during upload
   - Show success message: "Dokumen berjaya dimuat naik"
   - Show error message: "Muat naik gagal - cuba lagi"

8. **Form Submission**
   - User clicks "Simpan Rekod"
   - Client-side validation:
     - Required fields filled
     - Amount > 0
     - Valid date
   - If validation fails: Show inline error messages
   - If validation passes: Submit to database

9. **Success Feedback**
   - Show success message: "Rekod pendapatan dijana: DPMMJHR/AE/2026-08-0001"
   - Clear form fields
   - Refresh accounting entries list
   - Refresh KPI dashboard
   - Auto-scroll to entries list

**Exit Points**:
- Success: Record saved, form cleared, list refreshed
- Validation error: Show inline errors, keep form data
- Cancel: Close form, discard unsaved changes
- Network error: Show error message, keep form data for retry

## User Flow: Approval Workflow

**Entry Point**: User clicks "Semak" button on pending income record

**Flow Steps**:

1. **Approval Modal Display**
   - Show modal with record details
   - Layout: Two-column grid for key information
   - Primary actions: "Luluskan", "Tolak"
   - Secondary action: "Batal"

2. **Record Details Display**
   - Show all record fields in organized layout:
     - No. Rekod (monospace font)
     - Tarikh
     - Kategori (with subcategory if applicable)
     - Jumlah (bold, RM format)
     - Ahli (or "—" if not applicable)
     - Kaedah Pembayaran
     - No. Rujukan
     - Penerangan
   - Add supporting document viewer if available
   - Add link to member detail modal if member selected

3. **Approval History Display**
   - Show timeline of all approval actions
   - Format: "Action oleh User &middot; Date Time"
   - Include comments if present
   - Show most recent action first
   - Add visual separator between actions

4. **Status Display (if not pending)**
   - Show status banner at top of modal
   - Approved: Green background, "DILULUSKAN" label
   - Rejected: Red background, "DITOLAK" label
   - Show approver name and date
   - Show rejection reason if rejected

5. **Rejection Reason Entry (if rejecting)**
   - Show textarea: "Sebab Penolakan (jika menolak)"
   - Required field when rejecting
   - Placeholder: "Nyatakan sebab penolakan..."
   - Validation: Cannot be empty when clicking "Tolak"

6. **Approval Action**
   - User clicks "Luluskan" or "Tolak"
   - Client-side validation:
     - Rejection reason required if rejecting
     - User has approval role
     - Separation of duties check (creator cannot approve)
   - If validation fails: Show error message
   - If validation passes: Submit to database

7. **Success Feedback**
   - Show success message: "Rekod diluluskan/ditolak"
   - Close modal
   - Refresh accounting entries list
   - Refresh KPI dashboard (pending count)

**Exit Points**:
- Success: Action completed, modal closed, list refreshed
- Validation error: Show error message, keep modal open
- Cancel: Close modal, no changes
- Network error: Show error message, keep modal open for retry

## Design Principles

### 1. Progressive Disclosure
- Show only relevant fields based on user selections
- Hide advanced options behind "Advanced" toggle
- Reveal conditional fields dynamically
- Reduce cognitive load by showing less initially

### 2. Clear Progress Indication
- Show "Step X of Y" for multi-step workflows
- Use progress bar for file uploads
- Show checkmarks for completed sections
- Display status badges (Pending/Approved/Rejected)

### 3. Contextual Help
- Add tooltips to unfamiliar terms
- Show inline help text below key fields
- Provide example values in placeholders
- Add "?" icon links to documentation

### 4. Immediate Feedback
- Show validation errors inline (not on submit)
- Display success messages prominently
- Auto-refresh relevant sections after actions
- Show loading states during async operations

### 5. Error Recovery
- Keep form data on validation errors
- Provide clear error messages with actionable guidance
- Offer retry options for network errors
- Show previous values for reference

## Accessibility Requirements

### Keyboard Navigation
- All interactive elements reachable via Tab key
- Logical tab order (top to bottom, left to right)
- Visual focus indicators (2px outline + color change)
- Enter/Space activate buttons
- Escape closes modals
- Arrow keys navigate dropdowns

### Screen Reader Support
- All images have alt text describing content/function
- Form inputs have associated labels (not just placeholders)
- Error messages are announced
- Dynamic content changes are announced via ARIA live regions
- Headings create logical document structure (h1, h2, h3)
- Status changes announced (e.g., "Record approved")

### Visual Accessibility
- Text contrast minimum 4.5:1 (WCAG AA)
- Interactive elements minimum 24x24px touch target
- Don't rely on color alone (use icons + color)
- Text resizes to 200% without breaking layout
- Focus visible at all times
- No flashing content (avoid animations >3 times per second)

### Example for Implementation:

**Form Field with Accessibility**:
```html
<div class="field-grp">
  <label for="acct-entry-amount" class="field-label">
    Jumlah (RM) <span aria-hidden="true">*</span>
    <span class="sr-only">diperlukan</span>
  </label>
  <input 
    type="number" 
    id="acct-entry-amount" 
    class="field-input" 
    step="0.01" 
    min="0.01"
    aria-required="true"
    aria-describedby="acct-entry-amount-help"
    aria-invalid="false"
  >
  <div id="acct-entry-amount-help" class="field-help">
    Masukkan jumlah dalam Ringgit Malaysia (contoh: 100.00)
  </div>
  <div id="acct-entry-amount-error" class="field-error" role="alert" aria-live="polite"></div>
</div>
```

**Modal with Accessibility**:
```html
<div 
  class="modal-overlay" 
  id="accounting-review-modal" 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
>
  <div class="modal">
    <div class="modal-head">
      <h3 id="modal-title">Semak Rekod Pendapatan</h3>
      <button 
        class="modal-close" 
        aria-label="Tutup modal"
        onclick="closeModal('accounting-review-modal')"
      >&#x2715;</button>
    </div>
    <div class="modal-body">
      <!-- Modal content -->
    </div>
  </div>
</div>
```

## For Figma Design Team

**Research artifacts ready**:
- Jobs-to-be-Done: docs/ux/accounting-jtbd.md
- User Journey: docs/ux/accounting-journey.md
- Flow Specification: docs/ux/accounting-flow.md

**Next steps**:
1. Review user journey to understand emotional states at each step
2. Use flow specification to build screens in Figma
3. Apply accessibility requirements from checklist
4. Create prototype and validate against JTBD success criteria
5. Test with actual bendahari users before implementation

**Key success metrics**:
- Income recording time: <2 minutes per entry
- Approval time: <1 minute per record
- User satisfaction: 4+ out of 5 rating
- Accessibility compliance: WCAG AA standard
