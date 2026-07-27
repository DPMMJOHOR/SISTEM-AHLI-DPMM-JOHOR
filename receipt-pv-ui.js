// Receipt and Payment Voucher System - Frontend UI Components
// Integrated with Sistem Ahli
// Cache-bust: 2026-07-27-20-20

// Error and Success UI Helpers
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.cssText = 'background: #fee; color: #c33; padding: 12px; border-radius: 6px; border: 1px solid #fcc; margin: 10px 0; font-size: 14px;';
  errorDiv.textContent = message;
  
  const container = document.querySelector('.sec-body') || document.body;
  container.insertBefore(errorDiv, container.firstChild);
  
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.style.cssText = 'background: #efe; color: #3c3; padding: 12px; border-radius: 6px; border: 1px solid #cfc; margin: 10px 0; font-size: 14px;';
  successDiv.textContent = message;
  
  const container = document.querySelector('.sec-body') || document.body;
  container.insertBefore(successDiv, container.firstChild);
  
  setTimeout(() => successDiv.remove(), 5000);
}

// Show download and WhatsApp actions for generated receipt
function showReceiptActions(receiptData) {
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'receipt-actions';
  actionsDiv.style.cssText = 'background: #f0f8ff; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #d0e0ff;';
  
  actionsDiv.innerHTML = `
    <h4 style="margin: 0 0 12px 0; color: #1a365d;">Tindakan Resit</h4>
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      <button id="download-receipt-btn" class="btn btn-primary" style="flex: 1; min-width: 150px;">
        📥 Muat Turun PDF
      </button>
      <button id="whatsapp-receipt-btn" class="btn btn-success" style="flex: 1; min-width: 150px; background: #25D366;">
        📱 Hantar WhatsApp
      </button>
    </div>
  `;
  
  const container = document.querySelector('.sec-body') || document.body;
  container.insertBefore(actionsDiv, container.firstChild);
  
  // Download button handler
  document.getElementById('download-receipt-btn').addEventListener('click', () => {
    if (receiptData.pdfBlob && receiptData.fileName) {
      const url = URL.createObjectURL(receiptData.pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = receiptData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
  
  // WhatsApp button handler
  document.getElementById('whatsapp-receipt-btn').addEventListener('click', () => {
    if (receiptData.pdfBlob && receiptData.fileName) {
      // Convert blob to base64 for WhatsApp
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Resit Pembayaran - ${receiptData.receiptNumber}\n\nSila muat turun resit dari lampiran.`)}`;
        window.open(whatsappUrl, '_blank');
      };
      reader.readAsDataURL(receiptData.pdfBlob);
    }
  });
  
  // Remove actions div after 5 minutes
  setTimeout(() => actionsDiv.remove(), 300000);
}

// Receipt Management Section
function showReceiptsPage() {
  const container = document.getElementById('receipts-list');
  if (!container) return;
  container.innerHTML = `
    <div class="sec-card">
      <div class="sec-head">
        <h3>JANA RESIT BARU</h3>
      </div>
      <div class="sec-body">
        <div class="field-grp">
          <label class="field-label">Ahli (untuk yuran keahlian)</label>
          <select id="receipt-member-select" class="field-input">
            <option value="">Pilih ahli...</option>
          </select>
        </div>
        
        <div class="field-grp">
          <label class="field-label">Nama Penerima (jika bukan ahli)</label>
          <input type="text" id="manual-payee-name" class="field-input" placeholder="Masukkan nama penerima...">
        </div>
        
        <div class="field-grp">
          <label class="field-label">Penerangan Pembayaran</label>
          <input type="text" id="receipt-description" class="field-input" placeholder="Penerangan pembayaran...">
        </div>
        
        <div class="field-grp">
          <label class="field-label">Jumlah (RM)</label>
          <input type="number" id="receipt-amount" class="field-input" placeholder="0.00" step="0.01">
        </div>
        
        <div class="field-grp">
          <label class="field-label">Kaedah Pembayaran</label>
          <select id="receipt-payment-method" class="field-input">
            <option value="cash">Tunai</option>
            <option value="online">Pindahan Dalam Talian</option>
            <option value="cheque">Cek</option>
            <option value="other">Lain-lain</option>
          </select>
        </div>
        
        <div class="field-grp">
          <label class="field-label">Tarikh Pembayaran</label>
          <input type="date" id="receipt-payment-date" class="field-input">
        </div>
        
        <div class="field-grp">
          <label class="field-label">Slip Pembayaran (pilihan)</label>
          <input type="file" id="receipt-payment-slip" class="field-input" accept="image/*">
          <small style="color: var(--muted); font-size: 12px;">Muat naik slip pembayaran untuk pemprosesan OCR</small>
        </div>
        
        <div id="ocr-status" class="alert" style="display:none;">
          <span id="ocr-status-text"></span>
        </div>
        
        <div id="transaction-id-display" class="alert alert-ok" style="display:none;">
          <strong>ID Transaksi:</strong> <span id="transaction-id-text"></span>
        </div>
        
        <button onclick="handleGenerateReceipt()" class="btn btn-primary">Jana Resit</button>
      </div>
    </div>
    
    <div class="sec-card">
      <div class="sec-head">
        <h3>SEJARAH RESIT</h3>
      </div>
      <div class="sec-body">
        <div class="table-wrap">
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
                <td colspan="7" style="text-align: center; color: var(--muted);">Memuatkan resit...</td>
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
    <div class="sec-card">
      <div class="sec-head">
        <h3>CIPTA BAUCAR PEMBAYARAN</h3>
      </div>
      <div class="sec-body">
        <div class="field-grp">
          <label class="field-label">Dibayar Kepada</label>
          <input type="text" id="voucher-payable-to" class="field-input" placeholder="Nama syarikat atau individu">
        </div>
        
        <div class="field-grp">
          <label class="field-label">Tujuan Pembayaran</label>
          <textarea id="voucher-purpose" class="field-input" rows="3" placeholder="Penerangan pembayaran"></textarea>
        </div>
        
        <div class="field-grp">
          <label class="field-label">Jumlah (RM)</label>
          <input type="number" id="voucher-amount" class="field-input" placeholder="0.00" step="0.01">
        </div>
        
        <div class="field-grp">
          <label class="field-label">Kaedah Pembayaran</label>
          <select id="voucher-payment-method" class="field-input">
            <option value="cash">Tunai</option>
            <option value="cheque">Cek</option>
            <option value="online">Pindahan Dalam Talian</option>
            <option value="other">Lain-lain</option>
          </select>
        </div>
        
        <button onclick="createPaymentVoucher()" class="btn btn-primary">Cipta Baucar</button>
      </div>
    </div>
    
    <div class="sec-card">
      <div class="sec-head">
        <h3>SENARAI BAUCAR PEMBAYARAN</h3>
      </div>
      <div class="sec-body">
        <div class="table-wrap">
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
                <td colspan="8" style="text-align: center; color: var(--muted);">Memuatkan baucar...</td>
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
    <div class="sec-card">
      <div class="sec-head">
        <h3>KELULUSAN TERTUNDA</h3>
      </div>
      <div class="sec-body">
        <div class="table-wrap">
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
                <td colspan="7" style="text-align: center; color: var(--muted);">Memuatkan kelulusan...</td>
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
    
    select.innerHTML = '<option value="">Pilih ahli...</option>';
    data.forEach(member => {
      const option = document.createElement('option');
      option.value = member.id;
      const name = member.NAMA_AHLI || member.NAMA || 'Tanpa Nama';
      option.textContent = `${name} (${member.NO_AHLI || 'N/A'})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading members:', err);
    select.innerHTML = '<option value="">Ralat memuat ahli: ' + err.message + '</option>';
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
      td.textContent = 'Tiada resit dijumpai';
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
      tdAction.style.textAlign = 'center';
      tdAction.style.padding = '12px';
      tdAction.style.minWidth = '280px';
      
      // Button container for better spacing
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '8px';
      buttonContainer.style.justifyContent = 'center';
      buttonContainer.style.flexWrap = 'wrap';
      
      // Download PDF button
      const btnDownload = document.createElement('button');
      btnDownload.textContent = '📥 Muat Turun';
      btnDownload.className = 'btn btn-sm btn-outline';
      btnDownload.style.padding = '8px 16px';
      // Download button removed - PDF now available for immediate download after generation
      // WhatsApp button removed - PDF now available for immediate WhatsApp sharing after generation
      
      tdAction.appendChild(buttonContainer);
      
      tr.appendChild(tdAction);
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading receipts:', err);
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Ralat memuat resit: ' + err.message + '</td></tr>';
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
      td.textContent = 'Tiada voucher dijumpai';
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
      tdAction.style.textAlign = 'center';
      tdAction.style.padding = '12px';
      tdAction.style.minWidth = '200px';
      
      const btn = document.createElement('button');
      btn.textContent = '📥 Muat Turun PDF';
      btn.className = 'btn btn-sm btn-outline';
      btn.style.padding = '8px 16px';
      btn.style.borderRadius = '6px';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.2s ease';
      btn.style.width = '100%';
      btn.style.maxWidth = '180px';
      btn.onclick = () => downloadVoucherPDF(voucher.voucher_pdf_url);
      tdAction.appendChild(btn);
      tr.appendChild(tdAction);
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading vouchers:', err);
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Ralat memuat voucher: ' + err.message + '</td></tr>';
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
      tdAction.style.textAlign = 'center';
      tdAction.style.padding = '12px';
      tdAction.style.minWidth = '150px';
      
      const btn = document.createElement('button');
      btn.textContent = '🔍 Semak';
      btn.className = 'btn btn-sm btn-primary';
      btn.style.padding = '8px 16px';
      btn.style.borderRadius = '6px';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.2s ease';
      btn.style.width = '100%';
      btn.style.maxWidth = '120px';
      btn.onclick = () => reviewVoucher(voucher.id);
      tdAction.appendChild(btn);
      tr.appendChild(tdAction);
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading approvals:', err);
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Ralat memuat kelulusan: ' + err.message + '</td></tr>';
  }
}

// Generate receipt
async function handleGenerateReceipt() {
  const memberId = document.getElementById('receipt-member-select').value;
  const amount = document.getElementById('receipt-amount').value;
  const paymentMethod = document.getElementById('receipt-payment-method').value;
  const paymentDate = document.getElementById('receipt-payment-date').value;
  const slipFile = document.getElementById('receipt-payment-slip').files[0];
  const manualPayeeName = document.getElementById('manual-payee-name')?.value || null;
  const description = document.getElementById('receipt-description')?.value || null;
  
  if (!amount || !paymentDate) {
    showError('Sila isi semua medan yang diperlukan');
    return;
  }
  
  if (!memberId && !manualPayeeName) {
    showError('Sila pilih ahli atau masukkan nama penerima');
    return;
  }
  
  try {
    // If payment slip uploaded, process OCR first
    if (slipFile) {
      const ocrStatus = document.getElementById('ocr-status');
      const ocrText = document.getElementById('ocr-status-text');
      ocrStatus.style.display = 'block';
      ocrText.textContent = 'Memproses slip pembayaran dengan OCR...';
      
      const slipUrl = await uploadPaymentSlip(slipFile, memberId || 0, amount, paymentMethod, paymentDate);
      const transactionId = await processOCR(slipUrl);
      
      ocrText.textContent = `OCR Selesai. ID Transaksi: ${transactionId}`;
      document.getElementById('transaction-id-display').style.display = 'block';
      document.getElementById('transaction-id-text').textContent = transactionId;
    }
    
    // Generate receipt (calls the implementation in index.html)
    console.log('Calling generateReceipt with:', memberId, amount, paymentMethod, paymentDate);
    const receiptData = await generateReceipt(memberId || null, amount, paymentMethod, paymentDate, null, null, manualPayeeName, description);
    console.log('generateReceipt returned:', receiptData);
    
    if (!receiptData) {
      throw new Error('generateReceipt returned undefined');
    }
    
    if (!receiptData.success) {
      throw new Error(receiptData.error || 'Receipt generation failed');
    }
    
    // Show download and WhatsApp buttons
    showReceiptActions(receiptData);
    
    showSuccess(`Resit dijana: ${receiptData.receiptNumber}`);
    loadReceipts();
  } catch (err) {
    console.error('Error generating receipt:', err);
    showError('Ralat menjana resit: ' + err.message);
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
    showError('Sila isi semua medan yang diperlukan');
    return;
  }
  
  try {
    const voucherData = await createPaymentVoucher(payableTo, purpose, amount, paymentMethod, preparedBy);
    showSuccess(`Voucher pembayaran dijana: ${voucherData.voucherNumber}`);
    loadVouchers();
  } catch (err) {
    console.error('Error creating voucher:', err);
    showError('Ralat menjana voucher: ' + err.message);
  }
}

// Review voucher
async function reviewVoucher(voucherId) {
  try {
    const { data: voucher, error } = await supabaseClient
      .from('vouchers')
      .select('*')
      .eq('id', voucherId)
      .single();
    
    if (error) throw error;
    
    // Fetch approval history
    const { data: history } = await supabaseClient
      .from('approval_history')
      .select('*')
      .eq('voucher_id', voucherId)
      .order('created_at', { ascending: false });
    
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
    title.textContent = 'Semak Baucar Pembayaran';
    modalHeader.appendChild(title);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Tutup';
    closeBtn.className = 'btn btn-sm btn-outline';
    closeBtn.onclick = () => reviewModal.remove();
    modalHeader.appendChild(closeBtn);
    
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalContent.appendChild(modalBody);
    
    // Voucher details
    const detailsDiv = document.createElement('div');
    detailsDiv.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;';
    
    const createDetail = (label, value, isBold = false) => {
      const div = document.createElement('div');
      const labelEl = document.createElement('label');
      labelEl.style.cssText = 'font-weight: 600; font-size: 12px; color: var(--muted);';
      labelEl.textContent = label;
      div.appendChild(labelEl);
      const valueEl = document.createElement('div');
      valueEl.style.cssText = `font-size: 14px; ${isBold ? 'font-weight: 700;' : ''}`;
      valueEl.textContent = value;
      div.appendChild(valueEl);
      return div;
    };
    
    detailsDiv.appendChild(createDetail('No. Baucar', voucher.voucher_number, true));
    detailsDiv.appendChild(createDetail('Tarikh Cipta', new Date(voucher.created_at).toLocaleDateString('ms-MY')));
    detailsDiv.appendChild(createDetail('Dibayar Kepada', voucher.payable_to, true));
    detailsDiv.appendChild(createDetail('Jumlah', 'RM ' + parseFloat(voucher.amount).toFixed(2), true));
    
    const purposeDiv = document.createElement('div');
    purposeDiv.style.gridColumn = 'span 2';
    purposeDiv.appendChild(createDetail('Tujuan Pembayaran', voucher.payment_purpose));
    detailsDiv.appendChild(purposeDiv);
    
    detailsDiv.appendChild(createDetail('Kaedah Pembayaran', voucher.payment_method));
    detailsDiv.appendChild(createDetail('Disediakan Oleh', voucher.prepared_by));
    
    modalBody.appendChild(detailsDiv);
    
    // Status display if not pending
    if (voucher.approval_status !== 'pending') {
      const statusDiv = document.createElement('div');
      const bgColor = voucher.approval_status === 'approved' ? '#d4edda' : '#f8d7da';
      const borderColor = voucher.approval_status === 'approved' ? '#c3e6cb' : '#f5c6cb';
      statusDiv.style.cssText = `background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 16px; margin-bottom: 20px;`;
      
      const statusTitle = document.createElement('div');
      statusTitle.style.cssText = 'font-weight: 700; font-size: 13px; margin-bottom: 8px;';
      statusTitle.textContent = 'Status: ' + (voucher.approval_status === 'approved' ? 'DILULUSKAN' : 'DITOLAK');
      statusDiv.appendChild(statusTitle);
      
      const statusDetails = document.createElement('div');
      statusDetails.style.cssText = 'font-size: 12px;';
      statusDetails.innerHTML = `Diluluskan oleh: ${voucher.approved_by}<br>Tarikh: ${new Date(voucher.approval_date).toLocaleString('ms-MY')}`;
      statusDiv.appendChild(statusDetails);
      
      if (voucher.rejection_reason) {
        const reasonDiv = document.createElement('div');
        reasonDiv.style.cssText = 'margin-top: 8px; font-size: 12px;';
        reasonDiv.innerHTML = '<strong>Sebab Penolakan:</strong> ' + voucher.rejection_reason;
        statusDiv.appendChild(reasonDiv);
      }
      
      modalBody.appendChild(statusDiv);
    }
    
    // Approval history
    if (history && history.length > 0) {
      const historyDiv = document.createElement('div');
      historyDiv.style.cssText = 'margin-bottom: 20px;';
      
      const historyTitle = document.createElement('h4');
      historyTitle.style.cssText = 'font-size: 13px; font-weight: 700; margin-bottom: 12px;';
      historyTitle.textContent = 'Sejarah Kelulusan';
      historyDiv.appendChild(historyTitle);
      
      history.forEach(h => {
        const historyItem = document.createElement('div');
        historyItem.style.cssText = 'padding: 10px; border-bottom: 1px solid var(--gray1); font-size: 12px;';
        historyItem.innerHTML = `
          <div style="font-weight: 600;">${h.action === 'approved' ? 'Diluluskan' : 'Ditolak'}</div>
          <div style="color: var(--muted);">Oleh: ${h.performed_by} | ${new Date(h.created_at).toLocaleString('ms-MY')}</div>
          ${h.comments ? `<div style="margin-top: 4px;">${h.comments}</div>` : ''}
        `;
        historyDiv.appendChild(historyItem);
      });
      
      modalBody.appendChild(historyDiv);
    }
    
    // Rejection reason textarea and buttons for pending vouchers
    if (voucher.approval_status === 'pending') {
      const formGroup = document.createElement('div');
      formGroup.style.cssText = 'margin-top: 20px;';
      
      const label = document.createElement('label');
      label.style.cssText = 'font-weight: 600; font-size: 12px; color: var(--muted); display: block; margin-bottom: 8px;';
      label.textContent = 'Sebab Penolakan (jika menolak)';
      formGroup.appendChild(label);
      
      const textarea = document.createElement('textarea');
      textarea.id = 'rejection-reason';
      textarea.style.cssText = 'width: 100%; padding: 10px; border: 1.5px solid var(--gray2); border-radius: 7px; font-family: var(--sans); font-size: 13px; resize: vertical; min-height: 80px;';
      textarea.placeholder = 'Masukkan sebab penolakan...';
      formGroup.appendChild(textarea);
      
      modalBody.appendChild(formGroup);
      
      const modalFooter = document.createElement('div');
      modalFooter.style.cssText = 'display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;';
      modalContent.appendChild(modalFooter);
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Batal';
      cancelBtn.style.cssText = 'padding: 10px 20px; border: 1.5px solid var(--gray2); border-radius: 7px; background: var(--white); font-size: 13px; font-weight: 600; cursor: pointer;';
      cancelBtn.onclick = () => reviewModal.remove();
      modalFooter.appendChild(cancelBtn);
      
      const rejectBtn = document.createElement('button');
      rejectBtn.textContent = 'Tolak';
      rejectBtn.style.cssText = 'padding: 10px 20px; border: none; border-radius: 7px; background: #dc3545; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;';
      rejectBtn.onclick = () => handleVoucherApproval(voucherId, 'rejected');
      modalFooter.appendChild(rejectBtn);
      
      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Luluskan';
      approveBtn.style.cssText = 'padding: 10px 20px; border: none; border-radius: 7px; background: var(--primary); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;';
      approveBtn.onclick = () => handleVoucherApproval(voucherId, 'approved');
      modalFooter.appendChild(approveBtn);
    } else {
      // Close button for processed vouchers
      const modalFooter = document.createElement('div');
      modalFooter.style.cssText = 'display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;';
      modalContent.appendChild(modalFooter);
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Tutup';
      closeBtn.style.cssText = 'padding: 10px 20px; border: 1.5px solid var(--gray2); border-radius: 7px; background: var(--white); font-size: 13px; font-weight: 600; cursor: pointer;';
      closeBtn.onclick = () => reviewModal.remove();
      modalFooter.appendChild(closeBtn);
    }
    
    document.body.appendChild(reviewModal);
  } catch (err) {
    console.error('Error loading voucher for review:', err);
    showError('Ralat memuat voucher: ' + err.message);
  }
}

async function handleVoucherApproval(voucherId, action) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const rejectionReason = action === 'rejected' 
    ? document.getElementById('rejection-reason').value 
    : null;
  
  if (action === 'rejected' && !rejectionReason) {
    showError('Sila masukkan sebab penolakan');
    return;
  }
  
  const result = await approveVoucher(voucherId, user.email, rejectionReason);
  
  if (result.success) {
    showSuccess(action === 'approved' ? 'Baucar berjaya diluluskan' : 'Baucar berjaya ditolak');
    document.querySelector('.modal').remove();
    loadPendingApprovals();
  } else {
    showError('Ralat: ' + result.error);
  }
}

// Send receipt via WhatsApp
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
    showError('Nombor telefon ahli tidak dijumpai. Sila kemaskini profil ahli.');
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

// Send receipt via Email
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
    showError('E-mel ahli tidak dijumpai. Sila kemaskini profil ahli.');
    return;
  }
  
  // Generate signed URL for receipt PDF
  let pdfUrl = receipt.receipt_pdf_url;
  if (pdfUrl) {
    const { data: signedData, error: signedError } = await supabaseClient
      .storage
      .from('permohonan-dokumen')
      .createSignedUrl(pdfUrl, 3600); // 1 hour expiry
    
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
    
    showSuccess('E-mel berjaya dihantar');
  } catch (error) {
    console.error('Ralat menghantar e-mel:', error);
    showError('Ralat menghantar e-mel: ' + error.message);
  }
}

// Download receipt PDF - removed (PDF now available for immediate download after generation)
// Download voucher PDF - removed (PDF now available for immediate download after generation)

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
