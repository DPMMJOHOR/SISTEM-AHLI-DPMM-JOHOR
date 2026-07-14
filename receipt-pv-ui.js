// Receipt and Payment Voucher System - Frontend UI Components
// Integrated with Sistem Ahli

// Receipt Management Section
function showReceiptsPage() {
  const container = document.getElementById('main-content');
  container.innerHTML = `
    <div class="page-header">
      <h2>Receipt Management</h2>
      <p>Generate and manage membership fee receipts</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3>Generate New Receipt</h3>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>Member (for membership fees)</label>
          <select id="receipt-member-select" class="form-control">
            <option value="">Select member...</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Amount (RM)</label>
          <input type="number" id="receipt-amount" class="form-control" placeholder="0.00" step="0.01">
        </div>
        
        <div class="form-group">
          <label>Payment Method</label>
          <select id="receipt-payment-method" class="form-control">
            <option value="cash">Cash</option>
            <option value="online">Online Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Payment Date</label>
          <input type="date" id="receipt-payment-date" class="form-control">
        </div>
        
        <div class="form-group">
          <label>Payment Slip (optional)</label>
          <input type="file" id="receipt-payment-slip" class="form-control" accept="image/*">
          <small class="text-muted">Upload payment slip for OCR processing</small>
        </div>
        
        <div id="ocr-status" class="alert" style="display:none;">
          <span id="ocr-status-text"></span>
        </div>
        
        <div id="transaction-id-display" class="alert alert-success" style="display:none;">
          <strong>Transaction ID:</strong> <span id="transaction-id-text"></span>
        </div>
        
        <button onclick="generateReceipt()" class="btn btn-primary">Generate Receipt</button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3>Receipt History</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Receipt Number</th>
                <th>Date</th>
                <th>Member</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="receipts-table-body">
              <tr>
                <td colspan="7" class="text-center">Loading receipts...</td>
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
  const container = document.getElementById('main-content');
  container.innerHTML = `
    <div class="page-header">
      <h2>Payment Vouchers</h2>
      <p>Manage payment vouchers for third-party payments</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3>Create Payment Voucher</h3>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>Payable To</label>
          <input type="text" id="voucher-payable-to" class="form-control" placeholder="Company or individual name">
        </div>
        
        <div class="form-group">
          <label>Payment Purpose</label>
          <textarea id="voucher-purpose" class="form-control" rows="3" placeholder="Description of payment"></textarea>
        </div>
        
        <div class="form-group">
          <label>Amount (RM)</label>
          <input type="number" id="voucher-amount" class="form-control" placeholder="0.00" step="0.01">
        </div>
        
        <div class="form-group">
          <label>Payment Method</label>
          <select id="voucher-payment-method" class="form-control">
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="online">Online Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <button onclick="createPaymentVoucher()" class="btn btn-primary">Create Voucher</button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3>Payment Voucher List</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Voucher Number</th>
                <th>Date</th>
                <th>Payable To</th>
                <th>Purpose</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="vouchers-table-body">
              <tr>
                <td colspan="8" class="text-center">Loading vouchers...</td>
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
  const container = document.getElementById('main-content');
  container.innerHTML = `
    <div class="page-header">
      <h2>Approval Dashboard</h2>
      <p>Review and approve payment vouchers</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3>Pending Approvals</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Voucher Number</th>
                <th>Date</th>
                <th>Payable To</th>
                <th>Purpose</th>
                <th>Amount</th>
                <th>Prepared By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="approvals-table-body">
              <tr>
                <td colspan="7" class="text-center">Loading pending approvals...</td>
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
    const { data, error } = await supabase
      .from('AHLI DPMM JOHOR')
      .select('id, nama, nombor_ahli')
      .order('nama');
    
    if (error) throw error;
    
    select.innerHTML = '<option value="">Select member...</option>';
    data.forEach(member => {
      const option = document.createElement('option');
      option.value = member.id;
      option.textContent = `${member.nama} (${member.nombor_ahli || 'N/A'})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading members:', err);
    select.innerHTML = '<option value="">Error loading members</option>';
  }
}

// Load receipts history
async function loadReceipts() {
  const tbody = document.getElementById('receipts-table-body');
  if (!tbody) return;
  
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('receipt_date', { ascending: false });
    
    if (error) throw error;
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No receipts found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(receipt => `
      <tr>
        <td>${receipt.receipt_number}</td>
        <td>${new Date(receipt.receipt_date).toLocaleDateString()}</td>
        <td>${receipt.member_name}</td>
        <td>RM${parseFloat(receipt.amount).toFixed(2)}</td>
        <td>${receipt.payment_method}</td>
        <td>${receipt.transaction_id || 'N/A'}</td>
        <td>
          <button onclick="downloadReceiptPDF('${receipt.receipt_pdf_url}')" class="btn btn-sm btn-outline">Download PDF</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading receipts:', err);
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading receipts</td></tr>';
  }
}

// Load vouchers
async function loadVouchers() {
  const tbody = document.getElementById('vouchers-table-body');
  if (!tbody) return;
  
  try {
    const { data, error } = await supabase
      .from('payment_vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No vouchers found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(voucher => `
      <tr>
        <td>${voucher.voucher_number}</td>
        <td>${new Date(voucher.created_at).toLocaleDateString()}</td>
        <td>${voucher.payable_to}</td>
        <td>${voucher.payment_purpose}</td>
        <td>RM${parseFloat(voucher.amount).toFixed(2)}</td>
        <td>${voucher.payment_method}</td>
td>
          <span class="badge ${voucher.approval_status === 'approved' ? 'badge-success' : voucher.approval_status === 'rejected' ? 'badge-danger' : 'badge-warning'}">
            ${voucher.approval_status}
          </span>
        </td>
        <td>
          <button onclick="downloadVoucherPDF('${voucher.voucher_pdf_url}')" class="btn btn-sm btn-outline">Download PDF</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading vouchers:', err);
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Error loading vouchers</td></tr>';
  }
}

// Load pending approvals
async function loadPendingApprovals() {
  const tbody = document.getElementById('approvals-table-body');
  if (!tbody) return;
  
  try {
    const { data, error } = await supabase
      .from('payment_vouchers')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No pending approvals</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(voucher => `
      <tr>
        <td>${voucher.voucher_number}</td>
        <td>${new Date(voucher.created_at).toLocaleDateString()}</td>
        <td>${voucher.payable_to}</td>
        <td>${voucher.payment_purpose}</td>
        <td>RM${parseFloat(voucher.amount).toFixed(2)}</td>
        <td>${voucher.prepared_by}</td>
        <td>
          <button onclick="reviewVoucher('${voucher.id}')" class="btn btn-sm btn-primary">Review</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading approvals:', err);
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading approvals</td></tr>';
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
  
  if (!payableTo || !purpose || !amount || !paymentMethod) {
    alert('Please fill in all required fields');
    return;
  }
  
  try {
    const voucherData = await createPaymentVoucherAPI(payableTo, purpose, amount, paymentMethod);
    alert(`Payment voucher created: ${voucherData.voucher_number}`);
    loadVouchers();
  } catch (err) {
    console.error('Error creating voucher:', err);
    alert('Error creating voucher: ' + err.message);
  }
}

// Review voucher
async function reviewVoucher(voucherId) {
  try {
    const { data, error } = await supabase
      .from('payment_vouchers')
      .select('*')
      .eq('id', voucherId)
      .single();
    
    if (error) throw error;
    
    const reviewModal = document.createElement('div');
    reviewModal.className = 'modal';
    reviewModal.style.display = 'block';
    reviewModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Review Payment Voucher</h3>
          <button onclick="this.closest('.modal').remove()" class="btn btn-sm btn-outline">Close</button>
        </div>
        <div class="modal-body">
          <p><strong>Voucher Number:</strong> ${data.voucher_number}</p>
          <p><strong>Payable To:</strong> ${data.payable_to}</p>
          <p><strong>Purpose:</strong> ${data.payment_purpose}</p>
          <p><strong>Amount:</strong> RM${parseFloat(data.amount).toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${data.payment_method}</p>
          <p><strong>Prepared By:</strong> ${data.prepared_by}</p>
          
          <div class="form-group">
            <label>Rejection Reason (if rejecting)</label>
            <textarea id="rejection-reason" class="form-control" rows="2"></textarea>
          </div>
          
          <div class="modal-footer">
            <button onclick="approveVoucher('${voucherId}')" class="btn btn-success">Approve</button>
            <button onclick="rejectVoucher('${voucherId}')" class="btn btn-danger">Reject</button>
          </div>
        </div>
      </div>
    `;
    
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
  const navContainer = document.querySelector('.sidebar');
  if (!navContainer) return;
  
  // Check if already added
  if (document.getElementById('receipt-nav-item')) return;
  
  const navItems = `
    <div class="nav-item" onclick="showPage('receipts')" id="receipt-nav-item" style="display:none;">
      <div class="nav-icon">📄</div>
      <div class="nav-text">Receipts</div>
    </div>
    <div class="nav-item" onclick="showPage('vouchers')" id="voucher-nav-item" style="display:none;">
      <div class="nav-icon">💳</div>
      <div class="nav-text">Vouchers</div>
    </div>
    <div class="nav-item" onclick="showPage('approvals')" id="approval-nav-item" style="display:none;">
      <div class="nav-icon">✅</div>
      <div="nav-text">Approvals</div>
    </div>
  `;
  
  // Insert before admin nav item
  const adminNavItem = document.getElementById('admin-nav-item');
  if (adminNavItem) {
    adminNavItem.insertAdjacentHTML('beforebegin', navItems);
  } else {
    navContainer.insertAdjacentHTML('beforeend', navItems);
  }
  
  // Show based on role
  const userRole = currentUser?.role;
  if (userRole === 'admin' || userRole === 'bendahari') {
    document.getElementById('receipt-nav-item').style.display = 'flex';
    document.getElementById('voucher-nav-item').style.display = 'flex';
  }
  if (userRole === 'admin' || userRole === 'ydp' || userRole === 'tydp' || userRole === 'nydp') {
    document.getElementById('approval-nav-item').style.display = 'flex';
  }
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', function() {
  addReceiptPVNavigation();
});

// Extend showPage function to handle new pages
const originalShowPage = window.showPage;
window.showPage = function(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  
  // Remove active class from all nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  // Show selected page
  const page = document.getElementById(pageId);
  if (page) {
    page.style.display = 'block';
  }
  
  // Set active nav item
  const navItem = document.querySelector(`.nav-item[onclick="showPage('${pageId}')"]`);
  if (navItem) {
    navItem.classList.add('active');
  }
  
  // Handle new pages
  if (pageId === 'receipts') {
    showReceiptsPage();
  } else if (pageId === 'vouchers') {
    showVouchersPage();
  } else if (pageId === 'approvals') {
    showApprovalsPage();
  } else if (originalShowPage) {
    originalShowPage(pageId);
  }
};
