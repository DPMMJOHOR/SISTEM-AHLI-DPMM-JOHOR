// Receipt and Payment Voucher System - Frontend UI Components
// Integrated with Sistem Ahli
// Cache-bust: 2026-07-14-16-45

// Receipt Management Section
function showReceiptsPage() {
  const container = document.getElementById('receipts-list');
  if (!container) return;
  container.innerHTML = `
    <div class="page-header" style="margin-bottom: 24px; padding: 0;">
      <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Pengurusan Resit</h2>
      <p style="font-size: 1rem; color: var(--text-muted);">Jana dan urus resit yuran keahlian</p>
    </div>
    
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <h3 style="font-size: 1.25rem;">Jana Resit Baru</h3>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>Ahli (untuk yuran keahlian)</label>
          <select id="receipt-member-select" class="form-control">
            <option value="">Pilih ahli...</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Jumlah (RM)</label>
          <input type="number" id="receipt-amount" class="form-control" placeholder="0.00" step="0.01">
        </div>
        
        <div class="form-group">
          <label>Kaedah Pembayaran</label>
          <select id="receipt-payment-method" class="form-control">
            <option value="cash">Tunai</option>
            <option value="online">Pindahan Dalam Talian</option>
            <option value="cheque">Cek</option>
            <option value="other">Lain-lain</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Tarikh Pembayaran</label>
          <input type="date" id="receipt-payment-date" class="form-control">
        </div>
        
        <div class="form-group">
          <label>Slip Pembayaran (pilihan)</label>
          <input type="file" id="receipt-payment-slip" class="form-control" accept="image/*">
          <small class="text-muted">Muat naik slip pembayaran untuk pemprosesan OCR</small>
        </div>
        
        <div id="ocr-status" class="alert" style="display:none;">
          <span id="ocr-status-text"></span>
        </div>
        
        <div id="transaction-id-display" class="alert alert-success" style="display:none;">
          <strong>ID Transaksi:</strong> <span id="transaction-id-text"></span>
        </div>
        
        <button onclick="generateReceipt()" class="btn btn-primary">Jana Resit</button>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <h3 style="font-size: 1.25rem;">Sejarah Resit</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nombor Resit</th>
                <th>Tarikh</th>
                <th>Ahli</th>
                <th>Jumlah</th>
                <th>Kaedah</th>
                <th>ID Transaksi</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody id="receipts-table-body">
              <tr>
                <td colspan="7" class="text-center">Memuatkan resit...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  loadMembers();
  loadReceipts();
}

// Payment Voucher Section
function showVouchersPage() {
  const container = document.getElementById('vouchers-list');
  if (!container) return;
  container.innerHTML = `
    <div class="page-header" style="margin-bottom: 24px; padding: 0;">
      <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Baucar Pembayaran</h2>
      <p style="font-size: 1rem; color: var(--text-muted);">Urus baucar pembayaran pihak ketiga</p>
    </div>
    
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <h3 style="font-size: 1.25rem;">Cipta Baucar Pembayaran</h3>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>Dibayar Kepada</label>
          <input type="text" id="voucher-payable-to" class="form-control" placeholder="Nama syarikat atau individu">
        </div>
        
        <div class="form-group">
          <label>Tujuan Pembayaran</label>
          <textarea id="voucher-purpose" class="form-control" rows="3" placeholder="Penerangan pembayaran"></textarea>
        </div>
        
        <div class="form-group">
          <label>Jumlah (RM)</label>
          <input type="number" id="voucher-amount" class="form-control" placeholder="0.00" step="0.01">
        </div>
        
        <div class="form-group">
          <label>Kaedah Pembayaran</label>
          <select id="voucher-payment-method" class="form-control">
            <option value="cash">Tunai</option>
            <option value="cheque">Cek</option>
            <option value="online">Pindahan Dalam Talian</option>
            <option value="other">Lain-lain</option>
          </select>
        </div>
        
        <button onclick="createPaymentVoucher()" class="btn btn-primary">Cipta Baucar</button>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <h3 style="font-size: 1.25rem;">Senarai Baucar Pembayaran</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nombor Baucar</th>
                <th>Tarikh</th>
                <th>Dibayar Kepada</th>
                <th>Tujuan</th>
                <th>Jumlah</th>
                <th>Kaedah</th>
                <th>Status</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody id="vouchers-table-body">
              <tr>
                <td colspan="8" class="text-center">Memuatkan baucar...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  loadVouchers();
}

// Approval Dashboard
function showApprovalsPage() {
  const container = document.getElementById('approvals-list');
  if (!container) return;
  container.innerHTML = `
    <div class="page-header" style="margin-bottom: 24px; padding: 0;">
      <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Papan Pemuka Kelulusan</h2>
      <p style="font-size: 1rem; color: var(--text-muted);">Semak dan lulus baucar pembayaran</p>
    </div>
    
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <h3 style="font-size: 1.25rem;">Kelulusan Tertunda</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nombor Baucar</th>
                <th>Tarikh</th>
                <th>Dibayar Kepada</th>
                <th>Tujuan</th>
                <th>Jumlah</th>
                <th>Disediakan Oleh</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody id="approvals-table-body">
              <tr>
                <td colspan="7" class="text-center">Memuatkan kelulusan...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  loadPendingApprovals();
}

// Load members into dropdown
async function loadMembers() {
  const select = document.getElementById('receipt-member-select');
  if (!select) return;
  
  try {
    // NOTE: 'AHLI DPMM JOHOR' uses uppercase columns: NO_AHLI, NAMA_AHLI (company), NAMA (PIC)
    const { data, error } = await supabaseClient
      .from('AHLI DPMM JOHOR')
      .select('id, NO_AHLI, NAMA_AHLI, NAMA')
      .order('NAMA_AHLI');
    
    if (error) throw error;
    
    select.innerHTML = '<option value="">Select member...</option>';
    data.forEach(member => {
      const option = document.createElement('option');
      option.value = member.id;
      const name = member.NAMA_AHLI || member.NAMA || 'Tanpa Nama';
      option.textContent = `${name} (${member.NO_AHLI || 'N/A'})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading members:', err);
    select.innerHTML = '<option value="">Error loading members: ' + err.message + '</option>';
  }
}

// Load receipts history
async function loadReceipts() {
  const tbody = document.getElementById('receipts-table-body');
  if (!tbody) return;
  
  try {
    const { data, error } = await supabaseClient
      .from('receipts')
      .select('*')
      .order('receipt_date', { ascending: false });
    
    if (error) {
      console.error('Supabase error loading receipts:', error);
      throw error;
    }
    
    if (data.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 7;
      td.className = 'text-center';
      td.textContent = 'No receipts found';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    
    tbody.innerHTML = '';
    data.forEach(receipt => {
      const tr = document.createElement('tr');
      
      const tdNumber = document.createElement('td');
      tdNumber.textContent = receipt.receipt_number;
      tr.appendChild(tdNumber);
      
      const tdDate = document.createElement('td');
      tdDate.textContent = new Date(receipt.receipt_date).toLocaleDateString();
      tr.appendChild(tdDate);
      
      const tdName = document.createElement('td');
      tdName.textContent = receipt.member_name;
      tr.appendChild(tdName);
      
      const tdAmount = document.createElement('td');
      tdAmount.textContent = 'RM' + parseFloat(receipt.amount).toFixed(2);
      tr.appendChild(tdAmount);
      
      const tdMethod = document.createElement('td');
      tdMethod.textContent = receipt.payment_method;
      tr.appendChild(tdMethod);
      
      const tdTransId = document.createElement('td');
      tdTransId.textContent = receipt.transaction_id || 'N/A';
      tr.appendChild(tdTransId);
      
      const tdAction = document.createElement('td');
      const btn = document.createElement('button');
      btn.textContent = 'Download PDF';
      btn.className = 'btn btn-sm btn-outline';
      btn.onclick = () => downloadReceiptPDF(receipt.receipt_pdf_url);
      tdAction.appendChild(btn);
      tr.appendChild(tdAction);
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading receipts:', err);
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading receipts: ' + err.message + '</td></tr>';
  }
}

// Load vouchers
async function loadVouchers() {
  const tbody = document.getElementById('vouchers-table-body');
  if (!tbody) return;
  
  try {
    const { data, error } = await supabaseClient
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error loading vouchers:', error);
      throw error;
    }
    
    if (data.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 8;
      td.className = 'text-center';
      td.textContent = 'No vouchers found';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    
    tbody.innerHTML = '';
    data.forEach(voucher => {
      const tr = document.createElement('tr');
      
      const tdNumber = document.createElement('td');
      tdNumber.textContent = voucher.voucher_number;
      tr.appendChild(tdNumber);
      
      const tdDate = document.createElement('td');
      tdDate.textContent = new Date(voucher.created_at).toLocaleDateString();
      tr.appendChild(tdDate);
      
      const tdPayable = document.createElement('td');
      tdPayable.textContent = voucher.payable_to;
      tr.appendChild(tdPayable);
      
      const tdPurpose = document.createElement('td');
      tdPurpose.textContent = voucher.payment_purpose;
      tr.appendChild(tdPurpose);
      
      const tdAmount = document.createElement('td');
      tdAmount.textContent = 'RM' + parseFloat(voucher.amount).toFixed(2);
      tr.appendChild(tdAmount);
      
      const tdMethod = document.createElement('td');
      tdMethod.textContent = voucher.payment_method;
      tr.appendChild(tdMethod);
      
      const tdStatus = document.createElement('td');
      const span = document.createElement('span');
      const statusClass = voucher.approval_status === 'approved' ? 'badge-success' : voucher.approval_status === 'rejected' ? 'badge-danger' : 'badge-warning';
      span.className = 'badge ' + statusClass;
      span.textContent = voucher.approval_status;
      tdStatus.appendChild(span);
      tr.appendChild(tdStatus);
      
      const tdAction = document.createElement('td');
      const btn = document.createElement('button');
      btn.textContent = 'Download PDF';
      btn.className = 'btn btn-sm btn-outline';
      btn.onclick = () => downloadVoucherPDF(voucher.voucher_pdf_url);
      tdAction.appendChild(btn);
      tr.appendChild(tdAction);
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading vouchers:', err);
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Error loading vouchers: ' + err.message + '</td></tr>';
  }
}

// Load pending approvals
async function loadPendingApprovals() {
  const tbody = document.getElementById('approvals-table-body');
  if (!tbody) return;
  
  try {
    const { data, error } = await supabaseClient
      .from('vouchers')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error loading approvals:', error);
      throw error;
    }
    
    if (data.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 7;
      td.className = 'text-center';
      td.textContent = 'No pending approvals';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    
    tbody.innerHTML = '';
    data.forEach(voucher => {
      const tr = document.createElement('tr');
      
      const tdNumber = document.createElement('td');
      tdNumber.textContent = voucher.voucher_number;
      tr.appendChild(tdNumber);
      
      const tdDate = document.createElement('td');
      tdDate.textContent = new Date(voucher.created_at).toLocaleDateString();
      tr.appendChild(tdDate);
      
      const tdPayable = document.createElement('td');
      tdPayable.textContent = voucher.payable_to;
      tr.appendChild(tdPayable);
      
      const tdPurpose = document.createElement('td');
      tdPurpose.textContent = voucher.payment_purpose;
      tr.appendChild(tdPurpose);
      
      const tdAmount = document.createElement('td');
      tdAmount.textContent = 'RM' + parseFloat(voucher.amount).toFixed(2);
      tr.appendChild(tdAmount);
      
      const tdPrepared = document.createElement('td');
      tdPrepared.textContent = voucher.prepared_by;
      tr.appendChild(tdPrepared);
      
      const tdAction = document.createElement('td');
      const btn = document.createElement('button');
      btn.textContent = 'Review';
      btn.className = 'btn btn-sm btn-primary';
      btn.onclick = () => reviewVoucher(voucher.id);
      tdAction.appendChild(btn);
      tr.appendChild(tdAction);
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading approvals:', err);
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading approvals: ' + err.message + '</td></tr>';
  }
}

// Generate receipt
async function generateReceipt() {
  const memberId = document.getElementById('receipt-member-select').value;
  const amount = document.getElementById('receipt-amount').value;
  const paymentMethod = document.getElementById('receipt-payment-method').value;
  const paymentDate = document.getElementById('receipt-payment-date').value;
  const slipFile = document.getElementById('receipt-payment-slip').files[0];
  
  if (!memberId || !amount || !paymentDate) {
    alert('Please fill in all required fields');
    return;
  }
  
  try {
    // If payment slip uploaded, process OCR first
    if (slipFile) {
      const ocrStatus = document.getElementById('ocr-status');
      const ocrText = document.getElementById('ocr-status-text');
      ocrStatus.style.display = 'block';
      ocrText.textContent = 'Processing payment slip with OCR...';
      
      const slipUrl = await uploadPaymentSlip(slipFile, memberId, amount, paymentMethod, paymentDate);
      const transactionId = await processOCR(slipUrl);
      
      ocrText.textContent = `OCR Complete. Transaction ID: ${transactionId}`;
      document.getElementById('transaction-id-display').style.display = 'block';
      document.getElementById('transaction-id-text').textContent = transactionId;
    }
    
    // Generate receipt
    const receiptData = await generateReceipt(memberId, amount, paymentMethod, paymentDate, null);
    alert(`Receipt generated: ${receiptData.receipt_number}`);
    loadReceipts();
  } catch (err) {
    console.error('Error generating receipt:', err);
    alert('Error generating receipt: ' + err.message);
  }
}

// Create payment voucher
async function createPaymentVoucher() {
  const payableTo = document.getElementById('voucher-payable-to').value;
  const purpose = document.getElementById('voucher-purpose').value;
  const amount = document.getElementById('voucher-amount').value;
  const paymentMethod = document.getElementById('voucher-payment-method').value;
  const preparedBy = 'Admin'; // Default prepared by
  
  if (!payableTo || !purpose || !amount || !paymentMethod) {
    alert('Please fill in all required fields');
    return;
  }
  
  try {
    const voucherData = await createPaymentVoucher(payableTo, purpose, amount, paymentMethod, preparedBy);
    alert(`Payment voucher created: ${voucherData.voucherNumber}`);
    loadVouchers();
  } catch (err) {
    console.error('Error creating voucher:', err);
    alert('Error creating voucher: ' + err.message);
  }
}

// Review voucher
async function reviewVoucher(voucherId) {
  try {
    const { data, error } = await supabaseClient
      .from('vouchers')
      .select('*')
      .eq('id', voucherId)
      .single();
    
    if (error) throw error;
    
    const reviewModal = document.createElement('div');
    reviewModal.className = 'modal';
    reviewModal.style.display = 'block';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    reviewModal.appendChild(modalContent);
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalContent.appendChild(modalHeader);
    
    const title = document.createElement('h3');
    title.textContent = 'Review Payment Voucher';
    modalHeader.appendChild(title);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'btn btn-sm btn-outline';
    closeBtn.onclick = () => reviewModal.remove();
    modalHeader.appendChild(closeBtn);
    
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalContent.appendChild(modalBody);
    
    const pVoucherNumber = document.createElement('p');
    const strongVoucher = document.createElement('strong');
    strongVoucher.textContent = 'Voucher Number: ';
    pVoucherNumber.appendChild(strongVoucher);
    const spanVoucher = document.createElement('span');
    spanVoucher.textContent = data.voucher_number;
    pVoucherNumber.appendChild(spanVoucher);
    modalBody.appendChild(pVoucherNumber);
    
    const pPayableTo = document.createElement('p');
    const strongPayable = document.createElement('strong');
    strongPayable.textContent = 'Payable To: ';
    pPayableTo.appendChild(strongPayable);
    const spanPayable = document.createElement('span');
    spanPayable.textContent = data.payable_to;
    pPayableTo.appendChild(spanPayable);
    modalBody.appendChild(pPayableTo);
    
    const pPurpose = document.createElement('p');
    const strongPurpose = document.createElement('strong');
    strongPurpose.textContent = 'Purpose: ';
    pPurpose.appendChild(strongPurpose);
    const spanPurpose = document.createElement('span');
    spanPurpose.textContent = data.payment_purpose;
    pPurpose.appendChild(spanPurpose);
    modalBody.appendChild(pPurpose);
    
    const pAmount = document.createElement('p');
    const strongAmount = document.createElement('strong');
    strongAmount.textContent = 'Amount: ';
    pAmount.appendChild(strongAmount);
    const spanAmount = document.createElement('span');
    spanAmount.textContent = 'RM' + parseFloat(data.amount).toFixed(2);
    pAmount.appendChild(spanAmount);
    modalBody.appendChild(pAmount);
    
    const pMethod = document.createElement('p');
    const strongMethod = document.createElement('strong');
    strongMethod.textContent = 'Payment Method: ';
    pMethod.appendChild(strongMethod);
    const spanMethod = document.createElement('span');
    spanMethod.textContent = data.payment_method;
    pMethod.appendChild(spanMethod);
    modalBody.appendChild(pMethod);
    
    const pPrepared = document.createElement('p');
    const strongPrepared = document.createElement('strong');
    strongPrepared.textContent = 'Prepared By: ';
    pPrepared.appendChild(strongPrepared);
    const spanPrepared = document.createElement('span');
    spanPrepared.textContent = data.prepared_by;
    pPrepared.appendChild(spanPrepared);
    modalBody.appendChild(pPrepared);
    
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    modalBody.appendChild(formGroup);
    
    const label = document.createElement('label');
    label.textContent = 'Rejection Reason (if rejecting)';
    formGroup.appendChild(label);
    
    const textarea = document.createElement('textarea');
    textarea.id = 'rejection-reason';
    textarea.className = 'form-control';
    textarea.rows = 2;
    formGroup.appendChild(textarea);
    
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalContent.appendChild(modalFooter);
    
    const approveBtn = document.createElement('button');
    approveBtn.textContent = 'Approve';
    approveBtn.className = 'btn btn-success';
    approveBtn.onclick = () => approveVoucher(voucherId);
    modalFooter.appendChild(approveBtn);
    
    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = 'Reject';
    rejectBtn.className = 'btn btn-danger';
    rejectBtn.onclick = () => rejectVoucher(voucherId);
    modalFooter.appendChild(rejectBtn);
    
    document.body.appendChild(reviewModal);
  } catch (err) {
    console.error('Error loading voucher for review:', err);
    alert('Error loading voucher: ' + err.message);
  }
}

// Download receipt PDF
function downloadReceiptPDF(pdfUrl) {
  if (!pdfUrl) {
    alert('PDF not available');
    return;
  }
  window.open(pdfUrl, '_blank');
}

// Download voucher PDF
function downloadVoucherPDF(pdfUrl) {
  if (!pdfUrl) {
    alert('PDF not available');
    return;
  }
  window.open(pdfUrl, '_blank');
}

// Add navigation items to sidebar
function addReceiptPVNavigation() {
  const navContainer = document.querySelector('nav.sb-nav');
  if (!navContainer) return;
  
  // Create nav items once (guard against duplicates)
  if (!document.getElementById('receipt-nav-item')) {
    const navItems = `
      <div class="nav-item" onclick="showPage('receipts')" id="receipt-nav-item" style="display:none;">
        <span class="nav-text">RESIT</span>
      </div>
      <div class="nav-item" onclick="showPage('vouchers')" id="voucher-nav-item" style="display:none;">
        <span class="nav-text">BAUCAR</span>
      </div>
      <div class="nav-item" onclick="showPage('approvals')" id="approval-nav-item" style="display:none;">
        <span class="nav-text">KELULUSAN</span>
      </div>
    `;
    
    // Insert before admin nav item
    const adminNavItem = document.getElementById('admin-nav-item');
    if (adminNavItem) {
      adminNavItem.insertAdjacentHTML('beforebegin', navItems);
    } else {
      navContainer.insertAdjacentHTML('beforeend', navItems);
    }
  }
  
  // Always refresh visibility based on the current user's role
  updateReceiptPVNavVisibility();
}

// Update nav item visibility based on current role (admin-only)
function updateReceiptPVNavVisibility() {
  const receiptNav = document.getElementById('receipt-nav-item');
  const voucherNav = document.getElementById('voucher-nav-item');
  const approvalNav = document.getElementById('approval-nav-item');
  if (!receiptNav || !voucherNav || !approvalNav) return;
  
  const userRole = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.role : null;
  const display = userRole === 'admin' ? 'flex' : 'none';
  
  receiptNav.style.display = display;
  voucherNav.style.display = display;
  approvalNav.style.display = display;
}

// Initialize navigation on page load (creates hidden items; visibility set after login)
document.addEventListener('DOMContentLoaded', function() {
  addReceiptPVNavigation();
});

// NOTE: Navigation for receipts/vouchers/approvals is handled by the native
// showPage() in index.html (same path as every other tab). Nav items call
// showPage('receipts'|'vouchers'|'approvals'); the page divs are #page-<id>;
// index.html PAGE_META supplies the header, and its dispatch calls
// showReceiptsPage()/showVouchersPage()/showApprovalsPage(). No override here.
