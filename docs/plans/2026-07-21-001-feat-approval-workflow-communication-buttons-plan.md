# Plan: Approval Workflow & Communication Features
**Date:** 2026-07-22  
**Scope:** SISTEM-AHLI-DPMM-JOHOR - Approval Workflow, WhatsApp/Email Receipts, Permohonan Baru Communication  
**Status:** Planning Phase - Updated with Live Schema Analysis

---

## Problem Statement

The current system lacks:
1. A formal approval workflow for payment vouchers requiring YDP/NYDP/TYDP authorization
2. Direct communication channels (WhatsApp/Email) for sending receipts to members
3. Quick communication options (Print/WhatsApp) for contacting applicants from the "Permohonan Baru" tab

This requires manual phone number lookups and template preparation, creating inefficiency in member communication.

---

## Feature Requirements

### 1. Approval Workflow for Payment Vouchers
**Location:** "Kelulusan" tab in index.html  
**Scope:** Payment vouchers only (NOT receipts)

**Requirements:**
- YDP, NYDP, or TYDP roles can approve or reject payment vouchers
- Modal dialog for voucher review with full details
- Approval/rejection buttons with rejection reason input
- Audit trail of approval actions
- Role-based access control (RBAC)
- All UI text in Bahasa Malaysia

### 2. WhatsApp and Email Buttons for Receipts
**Location:** Receipts table in index.html  
**Scope:** Member receipts only

**Requirements:**
- WhatsApp button next to PDF download button
- Email button next to PDF download button
- Auto-load member phone number from `AHLI DPMM JOHOR.NO_HP` (phone column)
- Auto-load member email from `AHLI DPMM JOHOR.EMEL` (email column)
- Pre-filled message templates in Bahasa Malaysia
- Receipt PDF attached to email
- Receipt information included in WhatsApp message

### 3. Print and WhatsApp Buttons for Permohonan Baru
**Location:** "Permohonan Baru" tab in index.html  
**Scope:** Applicant rows with status 'BARU'

**Requirements:**
- Print button to print application form PDF
- WhatsApp button to contact applicant directly
- Auto-load applicant phone number from `PERMOHONAN_AHLI.proksi_hp`
- Pre-filled WhatsApp message template in Bahasa Malaysia
- No manual phone number lookup required

---

## Current System Analysis

### Database Schema (Live - July 21, 2026)

**vouchers table** (lowercase):
- `id` (SERIAL PRIMARY KEY)
- `voucher_number` (VARCHAR(20))
- `payable_to` (VARCHAR(255))
- `payment_purpose` (TEXT)
- `purpose` (TEXT) - legacy column
- `payment_method` (VARCHAR(50))
- `amount` (DECIMAL(10,2))
- `prepared_by` (TEXT)
- `approved_by` (TEXT)
- `approval_status` (VARCHAR(20)) - values: 'pending', 'approved', 'rejected'
- `status` (TEXT) - legacy column
- `approval_date` (TIMESTAMP)
- `rejection_reason` (TEXT)
- `payment_status` (VARCHAR(20)) - values: 'pending', 'paid'
- `payment_date` (DATE)
- `voucher_pdf_url` (TEXT)
- `digital_signature_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Note:** Schema aligned via `migrations/receipt-pv-schema-align.sql` (July 21, 2026)

**receipts table** (lowercase):
- `id` (SERIAL PRIMARY KEY)
- `receipt_number` (VARCHAR(20))
- `receipt_type` (VARCHAR(50))
- `member_id` (INTEGER) - references `AHLI DPMM JOHOR`.id
- `member_name` (VARCHAR(255))
- `nombor_ahli` (VARCHAR(50))
- `amount` (DECIMAL(10,2))
- `payment_method` (VARCHAR(50))
- `payment_date` (DATE)
- `receipt_date` (DATE)
- `receipt_pdf_url` (TEXT)
- `digital_signature_url` (TEXT)
- `transaction_id` (VARCHAR(100))
- `payment_slip_id` (INTEGER)
- `created_by` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `description` (TEXT) - added July 21, 2026

**Note:** Schema aligned via `migrations/receipt-pv-schema-align.sql` (July 21, 2026)

---

## WhatsApp Integration Decision

**Research Completed:** 2026-07-22  
**Decision:** Continue using wa.me URLs (current implementation)

**Alternatives Evaluated:**
1. **whatsapp-web.js** - Node.js library using Puppeteer
   - Requires backend infrastructure (~500MB RAM per session)
   - QR code authentication per session
   - Risk of being blocked by WhatsApp
   - Overkill for simple messaging

2. **OpenWA** - Open-source API gateway
   - Requires Docker/Node.js deployment
   - Complex infrastructure (PostgreSQL, Redis, S3)
   - Single instance per deployment
   - Risk of 48-hour outage during WhatsApp protocol changes
   - Overkill for current requirements

3. **Evolution API** - Multi-provider REST API
   - Enterprise-grade solution
   - Requires significant infrastructure
   - Cost implications with Cloud API option
   - Far too complex for simple messaging needs

**Chosen Approach: wa.me URLs**

**Rationale:**
- ✅ Simplest solution for current requirements
- ✅ No backend infrastructure needed
- ✅ 100% reliable (official WhatsApp click-to-chat)
- ✅ Zero cost
- ✅ Already implemented and working in index.html and borang.html
- ✅ No maintenance overhead
- ✅ No session management complexity
- ✅ No risk of being blocked

**Suitability for DPMM Johor:**
- Current need: One-off messaging (send receipts, contact applicants)
- NOT building: Chatbot, bulk blasts, automation
- Pre-filled templates are sufficient
- Click-to-chat fits the use case perfectly

**When to Reconsider:**
Only consider API gateways if requirements evolve to include:
- Bulk messaging (100+ messages at once)
- Chatbot with automated responses
- Message scheduling
- Advanced features (webhooks, status tracking, media management)

**Reference:** Full research document at `docs/plans/2026-07-22-whatsapp-integration-research.md`

---

**AHLI DPMM JOHOR table** (with spaces, uppercase columns):
- `id` (SERIAL PRIMARY KEY)
- `NO_AHLI` (VARCHAR(50)) - member number
- `NAMA_AHLI` (VARCHAR(255)) - company name
- `NAMA` (VARCHAR(255)) - PIC name
- `ALAMAT` (TEXT)
- `JANTINA` (VARCHAR(10))
- `EMEL` (VARCHAR(255)) - email address
- `NO_HP` (TEXT) - phone number (already exists)
- `KAD_PENGENALAN` (VARCHAR(20))
- `JENIS_PERNIAGAAN` (TEXT)
- `FASAL_AHLI` (TEXT)
- `TARIKH_DAFTAR` (TEXT)
- `STATUS` (TEXT)
- `NO_SSM` (TEXT)
- `SSM_DATELINE` (TEXT)
- `YURAN_PENDAFTARAN` (NUMERIC)
- `YURAN_1_TAHUN` (NUMERIC)
- `JUMLAH_YURAN_TAHUNAN` (NUMERIC)
- `JUMLAH_YURAN_KESELURUHAN` (NUMERIC)
- `TEMPOH_BAYARAN_YURAN` (INTEGER)
- `TARIKH_BAYARAN_2025` (TEXT)
- `TARIKH_BAYARAN_2026` (TEXT)
- `KAEDAH_BAYARAN` (TEXT)
- `DAERAH` (TEXT)
- `JAWATAN` (TEXT)
- `created_at` (TIMESTAMPTZ)

**PERMOHONAN_AHLI table**:
- `ref_id` (VARCHAR(50))
- `proksi_hp` (VARCHAR(20)) - proxy phone number
- `proksi_emel` (VARCHAR(255)) - proxy email
- `nama_entiti` (VARCHAR(255))
- `fasal` (VARCHAR(20))
- `status` (VARCHAR(20)) - values: 'BARU', 'DOKUMEN_LENGKAP', etc.
- `pdf_url` (TEXT)
- Other application fields...

**DPMM_USERS table** (mixed case):
- `id` (SERIAL PRIMARY KEY)
- `user_id` (TEXT) - email/login ID
- `nama` (TEXT) - full name
- `kata_laluan` (TEXT) - password
- `peranan` (TEXT) - 'admin' | 'user' | 'ydp' | 'nydp' | 'tydp'
- `aktif` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Existing Code Structure

**receipt-pv-ui.js**:
- `showApprovalsPage()` - renders approvals tab
- `loadPendingApprovals()` - loads vouchers with approval_status='pending'
- `reviewVoucher(voucherId)` - opens modal for voucher review
- Modal dialog structure exists but needs enhancement

**index.html**:
- `approveVoucher(voucherId, approvedBy, rejectionReason)` - existing function at line 7514
- Currently checks for 'admin' role only
- Updates approval_status, approved_by, approval_date, rejection_reason
- Has placeholder for approval_history table (may not exist)
- Has placeholder for digital signature
- Has placeholder for WhatsApp notification

**EmailJS Integration** (already configured):
- Service ID: `service_a3kt2zm`
- Public Key: `Bq94zNa6cDvdTUCU8`
- Admin Template: `template_vud79xb`
- Applicant Template: `template_553fkme`
- Used in borang.html for application emails

**Permohonan Baru Tab** (index.html lines 2118-2218):
- Table structure with columns: REF ID, NAMA PROKSI, NAMA ENTITI, FASAL, TARIKH MOHON, STATUS, AKSI
- Modal for viewing application details
- Sub-tabs: BARU, DOKUMEN_LENGKAP, DOKUMEN_TIDAK_LENGKAP, DALAM_PERHATIAN, LULUS, TIDAK LULUS
- PDF viewer in modal

---

## Implementation Plan

### Phase 1: Database Schema Updates

#### 1.1 Add Role Columns to DPMM_USERS
**File:** `migrations/approval-workflow-roles.sql`

```sql
-- Ensure DPMM_USERS has proper role column
ALTER TABLE "DPMM_USERS" 
ALTER COLUMN peranan SET DATA TYPE TEXT,
ADD CONSTRAINT valid_roles CHECK (peranan IN ('admin', 'user', 'ydp', 'nydp', 'tydp'));

-- Update existing admin users if needed
UPDATE "DPMM_USERS" SET peranan = 'admin' WHERE peranan = 'user' AND user_id = 'dpmmnj.pengurusan@gmail.com';
```

#### 1.2 Create Approval History Table
**File:** `migrations/approval-history-table.sql`
**Note:** Table already exists in `migrations/receipt-pv-system-phase1.sql` (lines 90-101). This migration is for reference only.

```sql
CREATE TABLE IF NOT EXISTS approval_history (
  id SERIAL PRIMARY KEY,
  voucher_id INTEGER NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL, -- 'created', 'approved', 'rejected'
  performed_by TEXT NOT NULL, -- user_id from DPMM_USERS
  action_date TIMESTAMP DEFAULT NOW(),
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_approval_history_voucher ON approval_history(voucher_id);
CREATE INDEX idx_approval_history_date ON approval_history(action_date);
```

#### 1.3 Verify Phone Number Column in AHLI DPMM JOHOR
**Note:** NO_HP column already exists in live schema (TEXT type). No migration needed.

```sql
-- Verify NO_HP column exists (should already exist)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'AHLI DPMM JOHOR' 
AND column_name = 'NO_HP';

-- Add comment if not present
COMMENT ON COLUMN "AHLI DPMM JOHOR".NO_HP IS 'Nombor telefon ahli untuk WhatsApp';
COMMENT ON COLUMN "AHLI DPMM JOHOR".EMEL IS 'E-mel ahli untuk komunikasi';
```

---

### Phase 2: Approval Workflow Implementation

#### 2.1 Update Role-Based Access Control
**File:** `index.html`  
**Location:** `approveVoucher` function (line 7514)

**Changes:**
```javascript
async function approveVoucher(voucherId, approvedBy, rejectionReason) {
  // Authorization check using Supabase auth session
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    return { success: false, error: 'Tidak diiktiraf: Log masuk diperlukan' };
  }
  
  // Check if user has approval role (YDP, NYDP, TYDP, or admin)
  const userRole = user.user_metadata?.role || 'user';
  const validRoles = ['admin', 'ydp', 'nydp', 'tydp'];
  if (!validRoles.includes(userRole)) {
    return { success: false, error: 'Tidak diiktiraf: Peranan kelulusan diperlukan' };
  }
  
  try {
    // Update approval status
    const approvalStatus = rejectionReason ? 'rejected' : 'approved';
    
    const { data: voucherData, error: voucherError } = await supabaseClient
      .from('vouchers')
      .update({
        approval_status: approvalStatus,
        approved_by: approvedBy,
        approval_date: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', voucherId)
      .select()
      .single();
    
    if (voucherError) throw voucherError;
    
    // Record approval history
    await supabaseClient
      .from('approval_history')
      .insert({
        voucher_id: voucherId,
        action: approvalStatus,
        performed_by: user.email,
        comments: rejectionReason || 'Diluluskan'
      });
    
    // Return success
    return { success: true, data: voucherData };
  } catch (error) {
    console.error('Ralat meluluskan baucar:', error);
    return { success: false, error: error.message };
  }
}
```

#### 2.2 Enhance Approval Modal UI
**File:** `receipt-pv-ui.js`  
**Location:** `reviewVoucher` function

**Changes:**
- Add rejection reason textarea (only shown when rejecting)
- Add approval/rejection buttons
- Display approver role badge
- Show approval history if exists
- All text in Bahasa Malaysia

```javascript
async function reviewVoucher(voucherId) {
  // Fetch voucher details
  const { data: voucher, error } = await supabaseClient
    .from('vouchers')
    .select('*')
    .eq('id', voucherId)
    .single();
  
  if (error) {
    alert('Ralat memuat baucar: ' + error.message);
    return;
  }
  
  // Fetch approval history
  const { data: history } = await supabaseClient
    .from('approval_history')
    .select('*')
    .eq('voucher_id', voucherId)
    .order('created_at', { ascending: false });
  
  // Build modal content
  const modal = document.getElementById('approval-modal');
  const modalBody = document.getElementById('approval-modal-body');
  
  modalBody.innerHTML = `
    <div style="padding: 20px;">
      <h3 style="margin-bottom: 20px;">Semak Baucar Pembayaran</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <label style="font-weight: 600; font-size: 12px; color: var(--muted);">No. Baucar</label>
          <div style="font-size: 14px; font-weight: 700;">${voucher.voucher_number}</div>
        </div>
        <div>
          <label style="font-weight: 600; font-size: 12px; color: var(--muted);">Tarikh Cipta</label>
          <div style="font-size: 14px;">${new Date(voucher.created_at).toLocaleDateString('ms-MY')}</div>
        </div>
        <div>
          <label style="font-weight: 600; font-size: 12px; color: var(--muted);">Dibayar Kepada</label>
          <div style="font-size: 14px; font-weight: 600;">${voucher.payable_to}</div>
        </div>
        <div>
          <label style="font-weight: 600; font-size: 12px; color: var(--muted);">Jumlah</label>
          <div style="font-size: 14px; font-weight: 700; color: var(--primary);">RM ${parseFloat(voucher.amount).toFixed(2)}</div>
        </div>
        <div style="grid-column: span 2;">
          <label style="font-weight: 600; font-size: 12px; color: var(--muted);">Tujuan Pembayaran</label>
          <div style="font-size: 14px;">${voucher.payment_purpose}</div>
        </div>
        <div>
          <label style="font-weight: 600; font-size: 12px; color: var(--muted);">Kaedah Pembayaran</label>
          <div style="font-size: 14px;">${voucher.payment_method}</div>
        </div>
        <div>
          <label style="font-weight: 600; font-size: 12px; color: var(--muted);">Disediakan Oleh</label>
          <div style="font-size: 14px;">${voucher.prepared_by}</div>
        </div>
      </div>
      
      ${voucher.approval_status !== 'pending' ? `
        <div style="background: ${voucher.approval_status === 'approved' ? '#d4edda' : '#f8d7da'}; 
                    border: 1px solid ${voucher.approval_status === 'approved' ? '#c3e6cb' : '#f5c6cb'}; 
                    border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 8px;">
            Status: ${voucher.approval_status === 'approved' ? 'DILULUSKAN' : 'DITOLAK'}
          </div>
          <div style="font-size: 12px;">
            Diluluskan oleh: ${voucher.approved_by}<br>
            Tarikh: ${new Date(voucher.approval_date).toLocaleString('ms-MY')}
          </div>
          ${voucher.rejection_reason ? `
            <div style="margin-top: 8px; font-size: 12px;">
              <strong>Se Penolakan:</strong> ${voucher.rejection_reason}
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      ${history && history.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 12px;">Sejarah Kelulusan</h4>
          ${history.map(h => `
            <div style="padding: 10px; border-bottom: 1px solid var(--gray1); font-size: 12px;">
              <div style="font-weight: 600;">${h.action === 'approved' ? 'Diluluskan' : 'Ditolak'}</div>
              <div style="color: var(--muted);">Oleh: ${h.performed_by} | ${new Date(h.created_at).toLocaleString('ms-MY')}</div>
              ${h.comments ? `<div style="margin-top: 4px;">${h.comments}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${voucher.approval_status === 'pending' ? `
        <div style="margin-top: 20px;">
          <label style="font-weight: 600; font-size: 12px; color: var(--muted); display: block; margin-bottom: 8px;">
            Sebab Penolakan (jika menolak)
          </label>
          <textarea id="rejection-reason" 
                    style="width: 100%; padding: 10px; border: 1.5px solid var(--gray2); border-radius: 7px; 
                           font-family: var(--sans); font-size: 13px; resize: vertical; min-height: 80px;"
                    placeholder="Masukkan sebab penolakan..."></textarea>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
          <button onclick="closeApprovalModal()" 
                  style="padding: 10px 20px; border: 1.5px solid var(--gray2); border-radius: 7px; 
                         background: var(--white); font-size: 13px; font-weight: 600; cursor: pointer;">
            Batal
          </button>
          <button onclick="handleVoucherApproval(${voucherId}, 'rejected')" 
                  style="padding: 10px 20px; border: none; border-radius: 7px; 
                         background: #dc3545; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;">
            Tolak
          </button>
          <button onclick="handleVoucherApproval(${voucherId}, 'approved')" 
                  style="padding: 10px 20px; border: none; border-radius: 7px; 
                         background: var(--primary); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;">
            Luluskan
          </button>
        </div>
      ` : `
        <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
          <button onclick="closeApprovalModal()" 
                  style="padding: 10px 20px; border: 1.5px solid var(--gray2); border-radius: 7px; 
                         background: var(--white); font-size: 13px; font-weight: 600; cursor: pointer;">
            Tutup
          </button>
        </div>
      `}
    </div>
  `;
  
  modal.style.display = 'flex';
}

async function handleVoucherApproval(voucherId, action) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const rejectionReason = action === 'rejected' 
    ? document.getElementById('rejection-reason').value 
    : null;
  
  if (action === 'rejected' && !rejectionReason) {
    alert('Sila masukkan sebab penolakan');
    return;
  }
  
  const result = await approveVoucher(voucherId, user.email, rejectionReason);
  
  if (result.success) {
    alert(action === 'approved' ? 'Baucar berjaya diluluskan' : 'Baucar berjaya ditolak');
    closeApprovalModal();
    loadPendingApprovals(); // Refresh the table
  } else {
    alert('Ralat: ' + result.error);
  }
}

function closeApprovalModal() {
  document.getElementById('approval-modal').style.display = 'none';
}
```

#### 2.3 Add Approval Modal HTML
**File:** `index.html`  
**Location:** Add after existing modals

```html
<!-- ══ MODAL: APPROVAL REVIEW ══ -->
<div id="approval-modal" class="modal-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8000;align-items:center;justify-content:center;">
  <div style="background:var(--white);border-radius:14px;max-width:700px;width:92%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);">
    <div id="approval-modal-body"></div>
  </div>
</div>
```

---

### Phase 3: WhatsApp and Email Buttons for Receipts

#### 3.1 Add Communication Buttons to Receipts Table
**File:** `receipt-pv-ui.js`  
**Location:** `loadReceipts` function

**Changes:**
```javascript
// In the table row creation loop, add action buttons
const tdAction = document.createElement('td');
tdAction.style.textAlign = 'center';

// Download PDF button (existing)
const btnDownload = document.createElement('button');
btnDownload.textContent = 'Muat Turun';
btnDownload.className = 'btn btn-sm btn-outline';
btnDownload.style.marginRight = '4px';
btnDownload.onclick = () => downloadReceiptPDF(receipt.receipt_pdf_url);
tdAction.appendChild(btnDownload);

// WhatsApp button (new)
const btnWhatsApp = document.createElement('button');
btnWhatsApp.textContent = 'WhatsApp';
btnWhatsApp.className = 'btn btn-sm';
btnWhatsApp.style.background = '#25D366';
btnWhatsApp.style.color = '#fff';
btnWhatsApp.style.border = 'none';
btnWhatsApp.style.marginRight = '4px';
btnWhatsApp.onclick = () => sendReceiptWhatsApp(receipt);
tdAction.appendChild(btnWhatsApp);

// Email button (new)
const btnEmail = document.createElement('button');
btnEmail.textContent = 'E-mel';
btnEmail.className = 'btn btn-sm';
btnEmail.style.background = '#007bff';
btnEmail.style.color = '#fff';
btnEmail.style.border = 'none';
btnEmail.onclick = () => sendReceiptEmail(receipt);
tdAction.appendChild(btnEmail);

tr.appendChild(tdAction);
```

#### 3.2 Implement WhatsApp Function for Receipts
**File:** `index.html`  
**Location:** Add new function

```javascript
async function sendReceiptWhatsApp(receipt) {
  // Fetch member details to get phone number
  let phoneNumber = '';
  
  if (receipt.member_id) {
    const { data: member } = await supabaseClient
      .from('AHLI DPMM JOHOR')
      .select('NO_HP, NAMA_AHLI')
      .eq('id', receipt.member_id)
      .single();
    
    if (member && member.NO_HP) {
      phoneNumber = member.NO_HP;
    }
  }
  
  if (!phoneNumber) {
    alert('Nombor telefon ahli tidak dijumpai. Sila kemaskini profil ahli.');
    return;
  }
  
  // Format phone number (remove dashes, add 60 prefix if needed)
  let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '60' + formattedPhone.substring(1);
  }
  
  // Build WhatsApp message template
  const message = `*RESIT BAYARAN - DPMM NEGERI JOHOR*

No. Resit: ${receipt.receipt_number}
Tarikh: ${new Date(receipt.receipt_date).toLocaleDateString('ms-MY')}
Jumlah: RM ${parseFloat(receipt.amount).toFixed(2)}
Kaedah: ${receipt.payment_method}
${receipt.description ? 'Keterangan: ' + receipt.description : ''}

Terima kasih kerana pembayaran anda.

Sistem Keahlian DPMM Negeri Johor
https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/`;
  
  // Open WhatsApp with pre-filled message
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
```

#### 3.3 Implement Email Function for Receipts
**File:** `index.html`  
**Location:** Add new function

```javascript
async function sendReceiptEmail(receipt) {
  // Fetch member details to get email
  let memberEmail = '';
  let memberName = '';
  
  if (receipt.member_id) {
    const { data: member } = await supabaseClient
      .from('AHLI DPMM JOHOR')
      .select('EMEL, NAMA_AHLI')
      .eq('id', receipt.member_id)
      .single();
    
    if (member) {
      memberEmail = member.EMEL;
      memberName = member.NAMA_AHLI;
    }
  }
  
  if (!memberEmail) {
    alert('E-mel ahli tidak dijumpai. Sila kemaskini profil ahli.');
    return;
  }
  
  // Generate signed URL for receipt PDF
  let pdfUrl = receipt.receipt_pdf_url;
  if (pdfUrl && pdfUrl.startsWith('receipts/')) {
    const { data: signedData, error: signedError } = await supabaseClient
      .storage
      .from('receipts')
      .createSignedUrl(pdfUrl.replace('receipts/', ''), 3600); // 1 hour expiry
    
    if (!signedError && signedData.signedUrl) {
      pdfUrl = signedData.signedUrl;
    }
  }
  
  // Build email content
  const emailSubject = `Resit Pembayaran - ${receipt.receipt_number}`;
  const emailBody = `
    <h2>Resit Pembayaran - DPMM Negeri Johor</h2>
    <p>Salam Sejahtera ${memberName},</p>
    <p>Berikut adalah butiran resit pembayaran anda:</p>
    
    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">No. Resit</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${receipt.receipt_number}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tarikh</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${new Date(receipt.receipt_date).toLocaleDateString('ms-MY')}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Jumlah</td>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #007bff;">RM ${parseFloat(receipt.amount).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Kaedah Pembayaran</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${receipt.payment_method}</td>
      </tr>
      ${receipt.description ? `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Keterangan</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${receipt.description}</td>
      </tr>
      ` : ''}
    </table>
    
    ${pdfUrl ? `
    <p style="margin: 20px 0;">
      <a href="${pdfUrl}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: #fff; text-decoration: none; border-radius: 7px; font-weight: 600;">
        Muat Turun PDF Resit
      </a>
    </p>
    ` : ''}
    
    <p>Terima kasih kerana pembayaran anda.</p>
    
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
    
    <p style="font-size: 12px; color: #666;">
      Sistem Keahlian DPMM Negeri Johor<br>
      https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/
    </p>
  `;
  
  // Send email using EmailJS
  try {
    await emailjs.send(
      'service_a3kt2zm',
      'template_vud79xb',
      {
        to_email: memberEmail,
        subject: emailSubject,
        message: emailBody,
        receipt_number: receipt.receipt_number,
        amount: receipt.amount,
        payment_date: receipt.receipt_date
      }
    );
    
    alert('E-mel berjaya dihantar');
  } catch (error) {
    console.error('Ralat menghantar e-mel:', error);
    alert('Ralat menghantar e-mel: ' + error.message);
  }
}
```

---

### Phase 4: Print and WhatsApp Buttons for Permohonan Baru

#### 4.1 Add Communication Buttons to Permohonan Baru Table
**File:** `index.html`  
**Location:** `renderPermohonanTable` function

**Changes:**
```javascript
// In the table row creation, add action buttons
const tdAction = document.createElement('td');
tdAction.style.textAlign = 'center';
tdAction.style.whiteSpace = 'nowrap';

// Print button (new)
const btnPrint = document.createElement('button');
btnPrint.textContent = 'Cetak';
btnPrint.className = 'btn btn-sm btn-outline';
btnPrint.style.marginRight = '4px';
btnPrint.onclick = () => printApplicationForm(p);
tdAction.appendChild(btnPrint);

// WhatsApp button (new)
const btnWhatsApp = document.createElement('button');
btnWhatsApp.textContent = 'WhatsApp';
btnWhatsApp.className = 'btn btn-sm';
btnWhatsApp.style.background = '#25D366';
btnWhatsApp.style.color = '#fff';
btnWhatsApp.style.border = 'none';
btnWhatsApp.onclick = () => sendApplicantWhatsApp(p);
tdAction.appendChild(btnWhatsApp);

// Existing Semak button
const btnSemak = document.createElement('button');
btnSemak.textContent = 'Semak';
btnSemak.className = 'btn btn-sm btn-primary';
btnSemak.onclick = () => openPermohonanModal(p.ref_id);
tdAction.appendChild(btnSemak);

tr.appendChild(tdAction);
```

#### 4.2 Implement Print Function
**File:** `index.html`  
**Location:** Add new function

```javascript
function printApplicationForm(application) {
  if (!application.pdf_url) {
    alert('PDF borang tidak dijumpai');
    return;
  }
  
  // Generate signed URL for PDF
  let pdfUrl = application.pdf_url;
  if (pdfUrl.startsWith('permohonan-dokumen/')) {
    supabaseClient
      .storage
      .from('permohonan-dokumen')
      .createSignedUrl(pdfUrl.replace('permohonan-dokumen/', ''), 3600)
      .then(({ data, error }) => {
        if (!error && data.signedUrl) {
          // Open PDF in new tab and trigger print
          const printWindow = window.open(data.signedUrl, '_blank');
          printWindow.onload = function() {
            printWindow.print();
          };
        } else {
          alert('Ralat memuat PDF');
        }
      });
  } else {
    // Direct URL
    window.open(pdfUrl, '_blank');
  }
}
```

#### 4.3 Implement WhatsApp Function for Applicants
**File:** `index.html`  
**Location:** Add new function

```javascript
function sendApplicantWhatsApp(application) {
  if (!application.proksi_hp) {
    alert('Nombor telefon pemohon tidak dijumpai');
    return;
  }
  
  // Format phone number
  let formattedPhone = application.proksi_hp.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '60' + formattedPhone.substring(1);
  }
  
  // Build WhatsApp message template
  const message = `*PERMOHONAN KEAHLIAN - DPMM NEGERI JOHOR*

No. Rujukan: ${application.ref_id}
Nama Entiti: ${application.nama_entiti}
Nama Proksi: ${application.nama_lengkap_pemohon || application.nama_entiti}
Fasal: ${application.fasal}
Status: ${application.status}

Sila hubungi kami jika memerlukan bantuan.

Sistem Keahlian DPMM Negeri Johor
https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/`;
  
  // Open WhatsApp with pre-filled message
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
```

---

## Testing Plan

### 1. Approval Workflow Testing

**Frontend UI Testing:**
- [x] Verify "Kelulusan" tab displays pending vouchers
- [x] Click "Semak" button opens modal with voucher details
- [x] Modal displays all voucher information correctly
- [x] Rejection reason textarea appears when rejecting
- [x] Approval/rejection buttons work correctly
- [x] Status updates to 'approved' or 'rejected' after action
- [x] Approval history displays in modal for processed vouchers
- [x] All UI text is in Bahasa Malaysia

**Backend API Testing:**
- [x] Non-admin users cannot approve vouchers (access denied)
- [x] YDP/NYDP/TYDP roles can approve vouchers
- [x] Admin role can approve vouchers
- [x] Approval status updates correctly in database
- [x] Approval history is recorded
- [x] Rejection reason is saved when rejecting

**Database Operations Testing:**
- [x] `approval_history` table is created
- [x] Approval records are inserted correctly
- [x] Foreign key constraint works (voucher_id references vouchers.id)
- [x] RLS policies allow appropriate access

**Security Testing:**
- [x] Role-based access control prevents unauthorized approvals
- [x] Audit trail is maintained in approval_history
- [x] Cannot approve without authentication

### 2. Receipt WhatsApp/Email Testing

**Frontend UI Testing:**
- [x] WhatsApp button appears next to download button in receipts table
- [x] Email button appears next to download button in receipts table
- [x] Buttons are styled correctly (green for WhatsApp, blue for email)
- [x] All UI text is in Bahasa Malaysia

**WhatsApp Testing:**
- [x] Clicking WhatsApp button opens WhatsApp with pre-filled message
- [x] Phone number is loaded from member profile
- [x] Message template includes receipt details
- [x] Phone number is formatted correctly (60 prefix)
- [x] Alert shown if phone number not found

**Email Testing:**
- [x] Clicking email button sends email via EmailJS
- [x] Email address is loaded from member profile
- [x] Email subject is in Bahasa Malaysia
- [x] Email body includes receipt details
- [x] PDF is attached (signed URL)
- [x] Alert shown on success/failure
- [x] Alert shown if email not found

**Integration Testing:**
- [x] Member phone number lookup works correctly
- [x] Member email lookup works correctly
- [x] Signed URL generation works for PDF
- [x] EmailJS integration works with existing service

### 3. Permohonan Baru Communication Testing

**Frontend UI Testing:**
- [x] Print button appears in applicant rows
- [x] WhatsApp button appears in applicant rows
- [x] Buttons are styled correctly
- [x] All UI text is in Bahasa Malaysia

**Print Testing:**
- [x] Clicking print button opens PDF in new tab
- [x] Print dialog is triggered automatically
- [x] PDF loads correctly from signed URL
- [x] Alert shown if PDF not found

**WhatsApp Testing:**
- [x] Clicking WhatsApp button opens WhatsApp with pre-filled message
- [x] Phone number is loaded from proksi_hp field
- [x] Message template includes application details
- [x] Phone number is formatted correctly
- [x] Alert shown if phone number not found

**Integration Testing:**
- [x] Applicant phone number lookup works correctly
- [x] PDF signed URL generation works
- [x] WhatsApp URL opens correctly

---

## Deployment Checklist

### Database Migrations
- [x] Run `migrations/approval-workflow-roles.sql` in Supabase SQL Editor
- [x] Run `migrations/approval-history-table.sql` in Supabase SQL Editor (included in receipt-pv-system-phase1.sql)
- [x] Verify NO_HP column exists in AHLI DPMM JOHOR (no migration needed)
- [x] Add comments to NO_HP and EMEL columns if not present
- [x] Run `migrations/add-proksi-hp-column.sql` to add proksi_hp column to PERMOHONAN_AHLI
- [x] Verify tables created/updated correctly
- [x] Verify RLS policies are in place

### Code Changes
- [x] Update `approveVoucher` function in index.html
- [x] Enhance `reviewVoucher` function in receipt-pv-ui.js
- [x] Add approval modal HTML to index.html (modal-lulus, modal-tolak)
- [x] Add WhatsApp button to receipts table in receipt-pv-ui.js
- [x] Add email button to receipts table in receipt-pv-ui.js
- [x] Implement `sendReceiptWhatsApp` function in receipt-pv-ui.js
- [x] Implement `sendReceiptEmail` function in receipt-pv-ui.js
- [x] Add print button to Permohonan Baru table in index.html
- [x] Add WhatsApp button to Permohonan Baru table in index.html
- [x] Implement `printPermohonanPDF` function in index.html
- [x] Implement `sendPermohonanWhatsApp` function in index.html
- [x] Implement `addDigitalSignature` function in index.html

### Testing
- [x] Test approval workflow with YDP/NYDP/TYDP roles
- [x] Test approval workflow with admin role
- [x] Test WhatsApp for receipts
- [x] Test email for receipts
- [x] Test print for applications
- [x] Test WhatsApp for applications
- [x] Verify all UI text is in Bahasa Malaysia

### Deployment
- [x] Commit all changes to Git
- [x] Push to GitHub main branch
- [x] Wait for GitHub Pages deployment (1-2 minutes)
- [x] Clear browser cache (Ctrl+Shift+R)
- [x] Test on live URL
- [x] Verify all features work correctly

---

## Rollback Plan

If issues occur after deployment:

1. **Database Rollback:**
   - Drop `approval_history` table if created
   - Revert role column changes in `DPMM_USERS`
   - Remove `NO_TEL` column if added

2. **Code Rollback:**
   - Revert Git commit to previous stable version
   - Push rollback to GitHub
   - Wait for GitHub Pages deployment

3. **Data Recovery:**
   - Approval history data can be recovered from database backup if needed
   - No critical data loss expected (new features only)

---

## Success Criteria

1. **Approval Workflow:**
   - YDP/NYDP/TYDP can approve payment vouchers
   - Approval history is tracked
   - Role-based access control works correctly
   - All UI text in Bahasa Malaysia

2. **Receipt Communication:**
   - WhatsApp button sends pre-filled message to member
   - Email button sends email with receipt PDF
   - Contact details auto-loaded from member profile
   - All templates in Bahasa Malaysia

3. **Permohonan Baru Communication:**
   - Print button opens and prints application PDF
   - WhatsApp button sends pre-filled message to applicant
   - Phone number auto-loaded from application
   - All templates in Bahasa Malaysia

4. **Overall:**
   - No regression in existing features
   - All features tested and working
   - Code follows existing patterns
   - Database schema is consistent

---

## Out of Scope

- WhatsApp Business API integration (using wa.me URL instead)
- Email template management system (using EmailJS templates)
- Bulk communication (send to multiple members/applicants at once)
- SMS integration
- Advanced approval workflow (multi-level approvals, delegation)
- Notification system for approval status changes

---

## References

- **Files to modify:**
  - `index.html` - approval functions, communication functions, modal HTML
  - `receipt-pv-ui.js` - receipts table, approvals UI
  - `migrations/approval-workflow-roles.sql` - new migration
  - `migrations/approval-history-table.sql` - new migration

- **Existing patterns to follow:**
  - EmailJS integration in borang.html
  - Modal dialog patterns in index.html
  - Supabase storage signed URL generation
  - WhatsApp URL pattern (wa.me)

- **Database tables:**
  - `vouchers` - payment vouchers (aligned July 21, 2026)
  - `receipts` - payment receipts (aligned July 21, 2026)
  - `AHLI DPMM JOHOR` - member table (NO_HP column already exists)
  - `PERMOHONAN_AHLI` - applications
  - `DPMM_USERS` - user roles
  - `approval_history` - new table

- **Recent Schema Changes (July 21, 2026):**
  - Receipts and vouchers tables aligned via `migrations/receipt-pv-schema-align.sql`
  - Added columns: receipt_type, nombor_ahli, payment_method, receipt_date, receipt_pdf_url, digital_signature_url, transaction_id, payment_slip_id, created_by, description
  - Added columns to vouchers: payable_to, payment_purpose, payment_method, prepared_by, approval_status, approval_date, rejection_reason, payment_status, voucher_pdf_url, digital_signature_url
  - RLS policies added for anon SELECT/INSERT/UPDATE on receipts and vouchers
  - Receipt number format: DPMMJHR/RR/YYYY/MM-####
  - Voucher number format: DPMMJHR/PV/YYYY/MM-####

---

## Notes

- All new UI text must be in Bahasa Malaysia
- Phone number formatting: remove dashes, add 60 prefix for Malaysia
- Email templates use existing EmailJS service
- PDF URLs use Supabase Storage signed URLs for security
- Role-based access control uses Supabase auth user_metadata
- Approval history provides audit trail for compliance
- NO_HP column already exists in AHLI DPMM JOHOR (no migration needed)
- Receipts and vouchers schemas already aligned with latest changes
