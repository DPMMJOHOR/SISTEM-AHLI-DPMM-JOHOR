// Receipt and Payment Voucher System - Frontend UI Components
// Integrated with Sistem Ahli
// Cache-bust: 2026-08-06-01-00

// Error and Success UI Helpers
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message premium-toast premium-toast-error';
  errorDiv.style.cssText = 'background: rgba(255, 107, 107, 0.95); color: white; padding: 14px 20px; border-radius: 10px; border: 1px solid rgba(255, 107, 107, 0.3); margin: 10px 0; font-size: 14px; font-weight: 500; backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(255, 107, 107, 0.2); animation: slideIn 0.3s ease-out;';
  errorDiv.textContent = message;
  
  const container = document.querySelector('.sec-body') || document.body;
  container.insertBefore(errorDiv, container.firstChild);
  
  setTimeout(() => {
    errorDiv.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => errorDiv.remove(), 300);
  }, 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message premium-toast premium-toast-success';
  successDiv.style.cssText = 'background: rgba(0, 212, 160, 0.95); color: white; padding: 14px 20px; border-radius: 10px; border: 1px solid rgba(0, 212, 160, 0.3); margin: 10px 0; font-size: 14px; font-weight: 500; backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0, 212, 160, 0.2); animation: slideIn 0.3s ease-out;';
  successDiv.textContent = message;
  
  const container = document.querySelector('.sec-body') || document.body;
  container.insertBefore(successDiv, container.firstChild);
  
  setTimeout(() => {
    successDiv.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => successDiv.remove(), 300);
  }, 5000);
}

// Show download and WhatsApp actions for generated receipt
function showReceiptActions(receiptData) {
  console.log('showReceiptActions called with:', receiptData);
  
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'receipt-actions premium-glass';
  actionsDiv.style.cssText = 'background: rgba(240, 248, 255, 0.9); padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(208, 224, 255, 0.5); display: block !important; box-shadow: 0 8px 32px rgba(29, 60, 150, 0.1);';
  
  actionsDiv.innerHTML = `
    <h4 style="margin: 0 0 16px 0; color: #1a365d; font-weight: 700; font-size: 15px; letter-spacing: 0.3px;">Tindakan Resit</h4>
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      <button id="download-receipt-btn" class="btn btn-primary btn-shine" style="flex: 1; min-width: 150px; padding: 12px 20px; font-weight: 600; border-radius: 8px; transition: all 0.2s;">
        Muat Turun PDF
      </button>
      <button id="print-receipt-template-btn" class="btn btn-outline" style="flex: 1; min-width: 150px; padding: 12px 20px; font-weight: 600; border-radius: 8px; transition: all 0.2s;">
        Cetak Resit
      </button>
      <button id="whatsapp-receipt-btn" class="btn btn-success" style="flex: 1; min-width: 150px; background: #25D366; padding: 12px 20px; font-weight: 600; border-radius: 8px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
        Hantar WhatsApp
      </button>
    </div>
  `;
  
  // Find the receipt form's sec-body specifically
  const receiptsListContainer = document.getElementById('receipts-list');
  if (receiptsListContainer) {
    const formSection = receiptsListContainer.querySelector('.sec-card .sec-body');
    if (formSection) {
      formSection.appendChild(actionsDiv);
      console.log('Actions div appended to form section');
    } else {
      console.error('Form section not found');
      receiptsListContainer.appendChild(actionsDiv);
    }
  } else {
    console.error('receipts-list container not found');
    document.body.appendChild(actionsDiv);
  }
  
  // Download button handler
  document.getElementById('download-receipt-btn').addEventListener('click', () => {
    console.log('Download button clicked');
    if (receiptData.pdfBlob && receiptData.fileName) {
      const url = URL.createObjectURL(receiptData.pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = receiptData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      console.error('PDF blob or fileName missing:', receiptData);
    }
  });
  
  // Print (receipt_template.html) button handler
  document.getElementById('print-receipt-template-btn').addEventListener('click', () => {
    console.log('Print receipt template button clicked');
    printReceiptTemplate(receiptData);
  });
  
  // WhatsApp button handler
  document.getElementById('whatsapp-receipt-btn').addEventListener('click', () => {
    console.log('WhatsApp button clicked');
    if (receiptData.pdfBlob && receiptData.fileName) {
      // Convert blob to base64 for WhatsApp
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Resit Pembayaran - ${receiptData.receiptNumber}\n\nSila muat turun resit dari lampiran.`)}`;
        window.open(whatsappUrl, '_blank');
      };
      reader.readAsDataURL(receiptData.pdfBlob);
    } else {
      console.error('PDF blob or fileName missing:', receiptData);
    }
  });
  
  // Remove actions div after 5 minutes
  setTimeout(() => actionsDiv.remove(), 300000);
}

// ── receipt_template.html rendering helpers ──────────────────────────

let _receiptTemplateHtmlCache = null;

// Fetch and cache receipt_template.html (lives alongside index.html)
async function loadReceiptTemplateHtml() {
  if (_receiptTemplateHtmlCache) return _receiptTemplateHtmlCache;
  const response = await fetch('receipt_template.html');
  if (!response.ok) {
    throw new Error(`Gagal memuat receipt_template.html (status ${response.status})`);
  }
  _receiptTemplateHtmlCache = await response.text();
  return _receiptTemplateHtmlCache;
}

// Format a 'YYYY-MM-DD' (or any Date-parseable) date string as 'DD/MM/YYYY'
function formatReceiptDateDMY(dateStr) {
  if (!dateStr) return '';
  // Parse 'YYYY-MM-DD' manually to avoid UTC/local timezone off-by-one issues
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}/${m}/${y}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// Format a numeric amount as '1,500.00'
function formatReceiptAmount(amount) {
  const num = parseFloat(amount) || 0;
  return num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Convert a ringgit amount (whole number part) to Malay words, e.g. 1500 -> "SATU RIBU LIMA RATUS"
function amountToWordsMY(amount) {
  const num = Math.floor(parseFloat(amount) || 0);
  if (num === 0) return 'KOSONG';
  
  const ones = ['', 'SATU', 'DUA', 'TIGA', 'EMPAT', 'LIMA', 'ENAM', 'TUJUH', 'LAPAN', 'SEMBILAN'];
  const teens = ['SEPULUH', 'SEBELAS', 'DUA BELAS', 'TIGA BELAS', 'EMPAT BELAS', 'LIMA BELAS', 'ENAM BELAS', 'TUJUH BELAS', 'LAPAN BELAS', 'SEMBILAN BELAS'];
  const tens = ['', '', 'DUA PULUH', 'TIGA PULUH', 'EMPAT PULUH', 'LIMA PULUH', 'ENAM PULUH', 'TUJUH PULUH', 'LAPAN PULUH', 'SEMBILAN PULUH'];
  const scales = ['', ' RIBU', ' JUTA', ' BILION'];
  
  function threeDigitsToWords(n) {
    let str = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0) {
      str += (h === 1 ? 'SERATUS' : ones[h] + ' RATUS');
      if (rem > 0) str += ' ';
    }
    if (rem >= 10 && rem < 20) {
      str += teens[rem - 10];
    } else {
      const t = Math.floor(rem / 10);
      const o = rem % 10;
      if (t > 0) str += tens[t];
      if (t > 0 && o > 0) str += ' ';
      if (o > 0) str += ones[o];
    }
    return str;
  }
  
  const groups = [];
  let n = num;
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  
  const parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      parts.push(threeDigitsToWords(groups[i]) + scales[i]);
    }
  }
  return parts.join(' ').trim();
}

// Map a payment_method value ('cash'/'online'/'cheque'/'other') to checkbox marks + cheque/reference no.
function getReceiptPaymentMarks(paymentMethod, referenceNo) {
  return {
    tunaiCheck: paymentMethod === 'cash' ? 'X' : '',
    onlineCheck: paymentMethod === 'online' ? 'X' : '',
    cekCheck: paymentMethod === 'cheque' ? 'X' : '',
    chequeNo: referenceNo || (paymentMethod === 'cheque' ? '' : 'N/A')
  };
}

// Fill receipt_template.html placeholders with real data and return the final HTML string
async function renderReceiptTemplateHtml(data) {
  const html = await loadReceiptTemplateHtml();
  const marks = getReceiptPaymentMarks(data.paymentMethod, data.transactionId);
  const amountWords = data.amountWords || (amountToWordsMY(data.amount) + ' SAHAJA');
  
  const values = {
    receipt_number: data.receiptNumber || '',
    date: formatReceiptDateDMY(data.paymentDate || data.date),
    received_from: data.receivedFrom || '',
    payment_for: data.paymentFor || '',
    amount: formatReceiptAmount(data.amount),
    amount_words: amountWords,
    tunai_check: marks.tunaiCheck,
    online_check: marks.onlineCheck,
    cek_check: marks.cekCheck,
    cheque_no: marks.chequeNo,
    issued_by: data.issuedBy || 'Resit dijana secara atas talian dari sistem rasmi DPMM Johor. Tiada tandatangan di perlukan'
  };
  
  const filled = html.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : '';
  });
  
  // Inject a <base> tag so relative asset paths (e.g. the logo image) resolve
  // correctly when this HTML is written into a blank popup window.
  const baseHref = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
  return filled.replace('<head>', `<head>\n<base href="${baseHref}">`);
}

// Open a print-ready window using receipt_template.html filled with receipt data
async function printReceiptTemplate(data) {
  try {
    const html = await renderReceiptTemplateHtml(data);
    const printWindow = window.open('', '_blank', 'width=650,height=400');
    if (!printWindow) {
      showError('Pop-up blocker menghalang pembukaan resit. Sila benarkan pop-up untuk ciri ini.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  } catch (error) {
    console.error('Error printing receipt template:', error);
    showError('Ralat mencetak resit: ' + error.message);
  }
}

// Open the stored proof-of-payment (image or PDF) in a new tab via a fresh signed URL
async function viewPaymentProof(slipImagePath) {
  try {
    const signedUrl = await getSignedPaymentSlipUrl(slipImagePath, 3600);
    if (!signedUrl) {
      showError('Gagal mendapatkan bukti pembayaran. Fail mungkin telah dipadam.');
      return;
    }
    window.open(signedUrl, '_blank');
  } catch (error) {
    console.error('Error viewing payment proof:', error);
    showError('Ralat memaparkan bukti pembayaran: ' + error.message);
  }
}

// Show a full detail popup for a receipt (same interaction pattern as clicking
// an "Ahli" in Senarai Ahli) - all receipt fields plus its Bukti Pembayaran.
async function showReceiptDetailModal(receipt, slip) {
  let modal = document.getElementById('receipt-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'receipt-detail-modal';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-head">
          <h3>Butiran Resit</h3>
          <button class="modal-close" onclick="closeModal('receipt-detail-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="field-grid" id="receipt-detail-fields"></div>
          <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;" id="receipt-detail-actions"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  const fieldsHtml = `
    <div class="field-grp"><label class="field-label">Nombor Resit</label><div>${receipt.receipt_number || '-'}</div></div>
    <div class="field-grp"><label class="field-label">Tarikh</label><div>${new Date(receipt.receipt_date).toLocaleDateString()}</div></div>
    <div class="field-grp"><label class="field-label">Diterima Daripada</label><div>${receipt.member_name || '-'}</div></div>
    <div class="field-grp"><label class="field-label">No. Ahli</label><div>${receipt.nombor_ahli || 'N/A'}</div></div>
    <div class="field-grp"><label class="field-label">Jumlah</label><div>RM ${parseFloat(receipt.amount || 0).toFixed(2)}</div></div>
    <div class="field-grp"><label class="field-label">Kaedah Pembayaran</label><div>${receipt.payment_method || '-'}</div></div>
    <div class="field-grp"><label class="field-label">Tarikh Pembayaran</label><div>${receipt.payment_date ? new Date(receipt.payment_date).toLocaleDateString() : '-'}</div></div>
    <div class="field-grp"><label class="field-label">ID Transaksi / No. Cek</label><div>${receipt.transaction_id || 'N/A'}</div></div>
    <div class="field-grp"><label class="field-label">Dijana Oleh</label><div>${receipt.created_by || '-'}</div></div>
    <div class="field-grp full"><label class="field-label">Penerangan Pembayaran</label><div>${receipt.description || '-'}</div></div>
    <div class="field-grp full">
      <label class="field-label">Bukti Pembayaran</label>
      <div>${slip && slip.slip_image_url
        ? `<span style="color: var(--success);">Slip pembayaran tersedia (No. Slip: ${slip.slip_number || '-'})</span>`
        : `<span style="color: var(--muted); font-style: italic;">Tiada bukti pembayaran</span>`}</div>
    </div>
  `;
  document.getElementById('receipt-detail-fields').innerHTML = fieldsHtml;
  
  let actionsHtml = `<button class="btn btn-outline" id="receipt-detail-print-btn">Lihat/Cetak Resit</button>`;
  if (slip && slip.slip_image_url) {
    actionsHtml += `<button class="btn btn-primary" id="receipt-detail-view-proof-btn">Lihat Bukti Pembayaran</button>`;
  }
  document.getElementById('receipt-detail-actions').innerHTML = actionsHtml;
  
  document.getElementById('receipt-detail-print-btn').onclick = () => viewAndPrintReceipt(receipt);
  
  const proofBtn = document.getElementById('receipt-detail-view-proof-btn');
  if (proofBtn) {
    proofBtn.onclick = () => viewPaymentProof(slip.slip_image_url);
  }
  
  modal.classList.add('show');
}

// Receipt Management Section
function showReceiptsPage() {
  const container = document.getElementById('receipts-list');
  if (!container) return;
  container.innerHTML = `
    <div class="sec-card" style="border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--card); box-shadow: var(--shadow-sm);">
      <div class="sec-head" style="padding: 16px; border-bottom: 1px solid var(--border); background: var(--muted)/30;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="color: var(--foreground); margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">JANA RESIT BARU</h3>
            <p style="color: var(--muted-foreground); margin: 2px 0 0 0; font-size: 12px; font-weight: 400;">Isi borang di bawah untuk menjana resit pembayaran</p>
          </div>
        </div>
      </div>
      <div class="sec-body" style="padding: 16px;">
        <div class="field-grp" style="margin-bottom: 16px;">
          <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Slip Pembayaran / Bukti Pembayaran (pilihan)</label>
          <div style="position: relative;">
            <input type="file" id="receipt-payment-slip" class="field-input" accept="image/*,application/pdf" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); cursor: pointer; transition: all 0.2s ease; font-size: 13px;">
            <small style="color: var(--muted-foreground); font-size: 11px; display: block; margin-top: 4px;">Muat naik imej atau PDF slip pembayaran. Fail ini akan disimpan sebagai bukti pembayaran dan diproses dengan OCR.</small>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div class="field-grp">
            <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Ahli (untuk yuran keahlian)</label>
            <select id="receipt-member-select" class="field-input" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); transition: all 0.2s ease; font-size: 13px;">
              <option value="">Pilih ahli...</option>
            </select>
          </div>
          <div class="field-grp">
            <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Nama Penerima (jika bukan ahli)</label>
            <input type="text" id="manual-payee-name" class="field-input" placeholder="Masukkan nama penerima..." style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); transition: all 0.2s ease; font-size: 13px;">
          </div>
        </div>
        
        <div class="field-grp" style="margin-bottom: 16px;">
          <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Penerangan Pembayaran</label>
          <input type="text" id="receipt-description" class="field-input" placeholder="Penerangan pembayaran..." style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); transition: all 0.2s ease; font-size: 13px;">
        </div>
        
        <div style="display: grid; grid-template-columns: 120px 1fr 1fr; gap: 12px; margin-bottom: 16px; align-items: end;">
          <div class="field-grp">
            <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Jumlah (RM)</label>
            <input type="number" id="receipt-amount" class="field-input" placeholder="0.00" step="0.01" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); font-weight: 600; font-size: 14px; transition: all 0.2s ease;">
          </div>
          <div class="field-grp">
            <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Kaedah Pembayaran</label>
            <div class="payment-method-checkboxes" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 500; padding: 6px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--background); transition: all 0.2s ease; font-size: 12px;">
                <input type="checkbox" id="receipt-pm-cash" class="receipt-pm-checkbox" data-method="cash" style="accent-color: var(--primary);">
                Tunai
              </label>
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 500; padding: 6px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--background); transition: all 0.2s ease; font-size: 12px;">
                <input type="checkbox" id="receipt-pm-online" class="receipt-pm-checkbox" data-method="online" style="accent-color: var(--primary);">
                Online
              </label>
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 500; padding: 6px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--background); transition: all 0.2s ease; font-size: 12px;">
                <input type="checkbox" id="receipt-pm-cheque" class="receipt-pm-checkbox" data-method="cheque" style="accent-color: var(--primary);">
                Cek
              </label>
            </div>
          </div>
          <div class="field-grp" id="receipt-cheque-info-grp" style="display: none;">
            <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">No. Cek / Bank</label>
            <input type="text" id="receipt-cheque-info" class="field-input" placeholder="123456 - MAYBANK" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); transition: all 0.2s ease; font-size: 13px;">
          </div>
        </div>
        
        <div class="field-grp" style="margin-bottom: 16px;">
          <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Tarikh Pembayaran</label>
          <input type="date" id="receipt-payment-date" class="field-input" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); transition: all 0.2s ease; font-size: 13px;">
        </div>
        
        <div id="ocr-status" class="alert" style="display: none; padding: 10px 12px; border-radius: var(--radius-md); margin-bottom: 12px; font-size: 12px;">
          <span id="ocr-status-text"></span>
        </div>
        
        <div id="transaction-id-display" class="alert alert-ok" style="display: none; padding: 10px 12px; border-radius: var(--radius-md); margin-bottom: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); font-size: 12px;">
          <strong style="color: var(--success);">ID Transaksi:</strong> <span id="transaction-id-text" style="font-weight: 600;"></span>
        </div>
        
        <button onclick="handleGenerateReceipt()" class="btn btn-primary btn-shine" style="width: 100%; padding: 10px 16px; font-size: 13px; font-weight: 600; border-radius: var(--radius-md); letter-spacing: 0.3px;">Jana Resit</button>
      </div>
    </div>
    
    <div class="sec-card" style="border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--card); box-shadow: var(--shadow-sm); margin-top: 16px;">
      <div class="sec-head" style="padding: 16px; border-bottom: 1px solid var(--border); background: var(--muted)/30;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="color: var(--foreground); margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">SEJARAH RESIT</h3>
            <p style="color: var(--muted-foreground); margin: 2px 0 0 0; font-size: 12px; font-weight: 400;">Lihat dan uruskan semua resit yang telah dijana</p>
          </div>
        </div>
      </div>
      <div class="sec-body" style="padding: 16px;">
        <div style="display: flex; gap: 8px; align-items: flex-end; margin-bottom: 12px; flex-wrap: wrap; background: var(--muted)/20; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div class="field-grp" style="flex: 0 0 auto; margin-bottom: 0;">
            <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 4px; display: block; font-size: 12px;">Bulan</label>
            <select id="report-month" class="field-input" style="min-width: 120px; padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--background); font-weight: 500; font-size: 12px;">
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Mac</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Jun</option>
              <option value="7">Julai</option>
              <option value="8">Ogos</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Disember</option>
            </select>
          </div>
          <div class="field-grp" style="flex: 0 0 auto; margin-bottom: 0;">
            <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 4px; display: block; font-size: 12px;">Tahun</label>
            <select id="report-year" class="field-input" style="min-width: 100px; padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--background); font-weight: 500; font-size: 12px;">
              <option value="">Semua Tahun</option>
            </select>
          </div>
          <button onclick="generateReceiptReport()" class="btn btn-primary btn-shine" style="flex: 0 0 auto; padding: 6px 12px; font-weight: 600; border-radius: var(--radius-md); font-size: 12px;">Jana Laporan</button>
        </div>
        <div class="table-wrap" style="border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border);">
          <table class="table" style="margin: 0;">
            <thead style="background: var(--muted)/50;">
              <tr>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Nombor Resit</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Tarikh</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Ahli</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Jumlah</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Kaedah</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">ID Transaksi</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Bukti Pembayaran</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Tindakan</th>
              </tr>
            </thead>
            <tbody id="receipts-table-body">
              <tr>
                <td colspan="8" style="text-align: center; color: var(--muted-foreground); padding: 32px 12px; font-size: 12px;">Memuatkan resit...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  loadMembers();
  loadReceipts();
  setupReceiptPaymentMethodCheckboxes();
  populateReportYears();
}

// Make the Tunai / Online Transfer / Cek checkboxes mutually exclusive,
// and show/hide the "No. Cek / Bank" field depending on selection.
function setupReceiptPaymentMethodCheckboxes() {
  const checkboxes = document.querySelectorAll('.receipt-pm-checkbox');
  const chequeInfoGrp = document.getElementById('receipt-cheque-info-grp');
  
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        checkboxes.forEach(other => {
          if (other !== cb) other.checked = false;
        });
      }
      const chequeChecked = document.getElementById('receipt-pm-cheque')?.checked;
      if (chequeInfoGrp) chequeInfoGrp.style.display = chequeChecked ? 'block' : 'none';
    });
  });
}

// Return the selected payment method ('cash'/'online'/'cheque') from the checkboxes, or null if none selected
function getSelectedReceiptPaymentMethod() {
  const checked = document.querySelector('.receipt-pm-checkbox:checked');
  return checked ? checked.dataset.method : null;
}

// Payment Voucher Section
function showVouchersPage() {
  const container = document.getElementById('vouchers-list');
  if (!container) return;
  container.innerHTML = `
    <div class="sec-card" style="border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--card); box-shadow: var(--shadow-sm);">
      <div class="sec-head" style="padding: 16px; border-bottom: 1px solid var(--border); background: var(--muted)/30;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="color: var(--foreground); margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">CIPTA BAUCAR PEMBAYARAN</h3>
            <p style="color: var(--muted-foreground); margin: 2px 0 0 0; font-size: 12px; font-weight: 400;">Isi borang di bawah untuk mencipta baucar pembayaran baru</p>
          </div>
        </div>
      </div>
      <div class="sec-body" style="padding: 16px;">
        <div class="field-grp" style="margin-bottom: 16px;">
          <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Dibayar Kepada</label>
          <input type="text" id="voucher-payable-to" class="field-input" placeholder="Nama syarikat atau individu" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); transition: all 0.2s ease; font-size: 13px;">
        </div>
        
        <div class="field-grp" style="margin-bottom: 16px;">
          <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Tujuan Pembayaran</label>
          <textarea id="voucher-purpose" class="field-input" rows="3" placeholder="Penerangan pembayaran" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); transition: all 0.2s ease; resize: vertical; font-size: 13px;"></textarea>
        </div>
        
        <div class="field-grp" style="margin-bottom: 16px;">
          <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Jumlah (RM)</label>
          <input type="number" id="voucher-amount" class="field-input" placeholder="0.00" step="0.01" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); font-weight: 600; font-size: 14px; transition: all 0.2s ease;">
        </div>
        
        <div class="field-grp" style="margin-bottom: 16px;">
          <label class="field-label" style="font-weight: 500; color: var(--foreground); margin-bottom: 6px; display: block; font-size: 13px;">Kaedah Pembayaran</label>
          <select id="voucher-payment-method" class="field-input" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); transition: all 0.2s ease; font-size: 13px;">
            <option value="cash">Tunai</option>
            <option value="cheque">Cek</option>
            <option value="online">Pindahan Dalam Talian</option>
            <option value="other">Lain-lain</option>
          </select>
        </div>
        
        <button onclick="createPaymentVoucher()" class="btn btn-primary btn-shine" style="width: 100%; padding: 10px 16px; font-size: 13px; font-weight: 600; border-radius: var(--radius-md); letter-spacing: 0.3px;">Cipta Baucar</button>
      </div>
    </div>
    
    <div class="sec-card" style="border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--card); box-shadow: var(--shadow-sm); margin-top: 16px;">
      <div class="sec-head" style="padding: 16px; border-bottom: 1px solid var(--border); background: var(--muted)/30;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="color: var(--foreground); margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">SENARAI BAUCAR PEMBAYARAN</h3>
            <p style="color: var(--muted-foreground); margin: 2px 0 0 0; font-size: 12px; font-weight: 400;">Lihat dan uruskan semua baucar pembayaran</p>
          </div>
        </div>
      </div>
      <div class="sec-body" style="padding: 16px;">
        <div class="table-wrap" style="border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border);">
          <table class="table" style="margin: 0;">
            <thead style="background: var(--muted)/50;">
              <tr>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Nombor Baucar</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Tarikh</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Dibayar Kepada</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Tujuan</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Jumlah</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Kaedah</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Status</th>
                <th style="color: var(--foreground); font-weight: 600; padding: 10px 12px; font-size: 12px; letter-spacing: 0.3px;">Tindakan</th>
              </tr>
            </thead>
            <tbody id="vouchers-table-body">
              <tr>
                <td colspan="8" style="text-align: center; color: var(--muted-foreground); padding: 32px 12px; font-size: 12px;">Memuatkan baucar...</td>
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
      td.colSpan = 8;
      td.className = 'text-center';
      td.textContent = 'Tiada resit dijumpai';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    
    // Batch-fetch the payment_slips linked to these receipts, so we can show
    // "Bukti Pembayaran" (proof of payment) for each row.
    const slipIds = data.map(r => r.payment_slip_id).filter(Boolean);
    const slipsById = await getPaymentSlipsByIds(slipIds);
    
    tbody.innerHTML = '';
    data.forEach(receipt => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      const slip = receipt.payment_slip_id ? slipsById[receipt.payment_slip_id] : null;
      
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
      
      // Bukti Pembayaran column
      const tdProof = document.createElement('td');
      if (slip && slip.slip_image_url) {
        const proofBtn = document.createElement('button');
        proofBtn.textContent = 'Lihat Bukti';
        proofBtn.className = 'btn btn-sm btn-outline';
        proofBtn.style.padding = '6px 12px';
        proofBtn.style.borderRadius = '6px';
        proofBtn.style.fontSize = '12px';
        proofBtn.style.fontWeight = '600';
        proofBtn.style.cursor = 'pointer';
        proofBtn.onclick = (e) => {
          e.stopPropagation();
          viewPaymentProof(slip.slip_image_url);
        };
        tdProof.appendChild(proofBtn);
      } else {
        const span = document.createElement('span');
        span.textContent = 'Tiada bukti pembayaran';
        span.style.color = 'var(--muted)';
        span.style.fontStyle = 'italic';
        span.style.fontSize = '12px';
        tdProof.appendChild(span);
      }
      tr.appendChild(tdProof);
      
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
      
      // View/Print button - regenerates PDF from database data
      const btnView = document.createElement('button');
      btnView.textContent = 'Lihat/Cetak';
      btnView.className = 'btn btn-sm btn-outline';
      btnView.style.padding = '8px 16px';
      btnView.style.borderRadius = '6px';
      btnView.style.fontSize = '13px';
      btnView.style.fontWeight = '600';
      btnView.style.cursor = 'pointer';
      btnView.style.transition = 'all 0.2s ease';
      btnView.onclick = (e) => { e.stopPropagation(); viewAndPrintReceipt(receipt); };
      buttonContainer.appendChild(btnView);
      
      // Delete button
      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Padam';
      btnDelete.className = 'btn btn-sm';
      btnDelete.style.background = '#dc3545';
      btnDelete.style.color = '#fff';
      btnDelete.style.border = 'none';
      btnDelete.style.padding = '8px 16px';
      btnDelete.style.borderRadius = '6px';
      btnDelete.style.fontSize = '13px';
      btnDelete.style.fontWeight = '600';
      btnDelete.style.cursor = 'pointer';
      btnDelete.style.transition = 'all 0.2s ease';
      btnDelete.onclick = (e) => { e.stopPropagation(); deleteReceipt(receipt.id, receipt.receipt_number); };
      buttonContainer.appendChild(btnDelete);
      
      tdAction.appendChild(buttonContainer);
      
      tr.appendChild(tdAction);
      
      // Clicking anywhere else on the row opens the full receipt detail popup
      // (same interaction pattern as clicking an "Ahli" in Senarai Ahli).
      tr.addEventListener('click', () => showReceiptDetailModal(receipt, slip));
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading receipts:', err);
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Ralat memuat resit: ' + err.message + '</td></tr>';
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
      btn.textContent = 'Muat Turun PDF';
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
      btn.textContent = 'Semak';
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
  const memberSelect = document.getElementById('receipt-member-select');
  const memberId = memberSelect.value;
  const amount = document.getElementById('receipt-amount').value;
  const paymentMethod = getSelectedReceiptPaymentMethod();
  const paymentDate = document.getElementById('receipt-payment-date').value;
  const slipFile = document.getElementById('receipt-payment-slip').files[0];
  const manualPayeeName = document.getElementById('manual-payee-name')?.value || null;
  const description = document.getElementById('receipt-description')?.value || null;
  const chequeInfoInput = document.getElementById('receipt-cheque-info');
  let chequeInfo = chequeInfoInput?.value || null;
  
  if (!amount || !paymentDate) {
    showError('Sila isi semua medan yang diperlukan');
    return;
  }
  
  if (!paymentMethod) {
    showError('Sila pilih kaedah pembayaran (Tunai / Pindahan Dalam Talian / Cek)');
    return;
  }
  
  if (!memberId && !manualPayeeName) {
    showError('Sila pilih ahli atau masukkan nama penerima');
    return;
  }
  
  // Bug fix: transactionId was previously scoped inside the `if (slipFile)` block
  // and never reached generateReceipt(), so OCR-derived transaction IDs were silently
  // discarded and never saved to the receipt record.
  let transactionId = null;
  // Bug fix: the uploaded slip's ID was never passed to generateReceipt(), so the
  // receipt's `payment_slip_id` column was always null and the uploaded proof of
  // payment could never be linked back to (or shown for) its receipt.
  let slipId = null;
  
  try {
    // If payment slip uploaded, process OCR first
    if (slipFile) {
      const ocrStatus = document.getElementById('ocr-status');
      const ocrText = document.getElementById('ocr-status-text');
      ocrStatus.style.display = 'block';
      ocrText.textContent = 'Memuat naik dan memproses slip pembayaran dengan OCR...';
      
      // Bug fix: uploadPaymentSlip() already runs OCR internally (with the correct
      // storage path + slip ID) and returns the result as `ocrResult`. The previous
      // code re-called processOCR() with the upload's return object (not a URL),
      // which always failed silently and produced an empty transaction ID.
      const uploadResult = await uploadPaymentSlip(slipFile, memberId || 0, amount, paymentMethod, paymentDate);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Gagal memuat naik slip pembayaran');
      }
      slipId = uploadResult.slipId;
      const ocrResult = uploadResult.ocrResult || {};
      transactionId = ocrResult.transactionId || '';
      
      ocrText.textContent = `Slip disimpan sebagai bukti pembayaran. OCR Selesai. ID Transaksi: ${transactionId || '-'}`;
      document.getElementById('transaction-id-display').style.display = 'block';
      document.getElementById('transaction-id-text').textContent = transactionId || '-';
      
      // For cheque payments, auto-fill the "No. Cek / Bank" field from OCR
      // (cheque number + detected bank name) if the user hasn't typed anything.
      if (paymentMethod === 'cheque' && !chequeInfo && (ocrResult.chequeNo || ocrResult.bankName)) {
        chequeInfo = [ocrResult.chequeNo, ocrResult.bankName].filter(Boolean).join(' - ');
        if (chequeInfoInput) chequeInfoInput.value = chequeInfo;
      }
    }
    
    // For cheque payments, store the cheque number/bank as the transaction reference
    // (this is what feeds the "BANK/NO. CEK" field on the printed receipt).
    if (paymentMethod === 'cheque' && chequeInfo) {
      transactionId = chequeInfo;
    }
    
    // Generate receipt (calls the implementation in index.html)
    console.log('Calling generateReceipt with:', memberId, amount, paymentMethod, paymentDate, transactionId, slipId);
    const receiptData = await generateReceipt(memberId || null, amount, paymentMethod, paymentDate, transactionId, slipId, manualPayeeName, description);
    console.log('generateReceipt returned:', receiptData);
    
    if (!receiptData) {
      throw new Error('generateReceipt returned undefined');
    }
    
    if (!receiptData.success) {
      throw new Error(receiptData.error || 'Receipt generation failed');
    }
    
    // Enrich receiptData with the raw form inputs so the receipt_template.html
    // print/preview has everything it needs without a round-trip to the database.
    const receivedFromLabel = manualPayeeName
      || (memberSelect.selectedOptions[0] ? memberSelect.selectedOptions[0].textContent.replace(/\s*\([^)]*\)\s*$/, '').trim() : '');
    receiptData.receivedFrom = receivedFromLabel;
    receiptData.paymentFor = description || 'Yuran Keahlian';
    receiptData.amount = amount;
    receiptData.paymentMethod = paymentMethod;
    receiptData.paymentDate = paymentDate;
    receiptData.transactionId = transactionId;
    
    // Show download, WhatsApp, and print-template buttons
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

// View and print receipt using receipt_template.html, filled with database data
async function viewAndPrintReceipt(receipt) {
  try {
    await printReceiptTemplate({
      receiptNumber: receipt.receipt_number,
      receivedFrom: receipt.member_name,
      paymentFor: receipt.description,
      amount: receipt.amount,
      paymentMethod: receipt.payment_method,
      paymentDate: receipt.payment_date || receipt.receipt_date,
      transactionId: receipt.transaction_id
    });
  } catch (error) {
    console.error('Error viewing receipt:', error);
    showError('Ralat memaparkan resit: ' + error.message);
  }
}

// Delete receipt from database
async function deleteReceipt(receiptId, receiptNumber) {
  if (!confirm(`Adakah anda pasti mahu memadam resit ${receiptNumber}?`)) {
    return;
  }
  
  try {
    const { error } = await supabaseClient
      .from('receipts')
      .delete()
      .eq('id', receiptId);
    
    if (error) throw error;
    
    showSuccess(`Resit ${receiptNumber} berjaya dipadam`);
    loadReceipts();
  } catch (error) {
    console.error('Error deleting receipt:', error);
    showError('Ralat memadam resit: ' + error.message);
  }
}

// Add navigation items to sidebar
function addReceiptPVNavigation() {
  const navContainer = document.querySelector('nav.sb-nav');
  if (!navContainer) return;
  
  // Create nav items once (guard against duplicates)
  if (!document.getElementById('receipt-nav-item')) {
    const navItems = `
      <div class="nav-item" onclick="showPage('receipts')" id="receipt-nav-item" style="display:none; padding: 8px 12px; margin-bottom: 4px; cursor: pointer; border-radius: var(--radius-sm); transition: all 0.2s ease;">
        <span class="nav-text" style="font-weight: 500; color: var(--muted-foreground); font-size: 12px; letter-spacing: 0.2px;">RESIT</span>
      </div>
      <div class="nav-item" onclick="showPage('vouchers')" id="voucher-nav-item" style="display:none; padding: 8px 12px; margin-bottom: 4px; cursor: pointer; border-radius: var(--radius-sm); transition: all 0.2s ease;">
        <span class="nav-text" style="font-weight: 500; color: var(--muted-foreground); font-size: 12px; letter-spacing: 0.2px;">BAUCAR</span>
      </div>
      <div class="nav-item" onclick="showPage('approvals')" id="approval-nav-item" style="display:none; padding: 8px 12px; margin-bottom: 4px; cursor: pointer; border-radius: var(--radius-sm); transition: all 0.2s ease;">
        <span class="nav-text" style="font-weight: 500; color: var(--muted-foreground); font-size: 12px; letter-spacing: 0.2px;">KELULUSAN</span>
      </div>
    `;
    
    // Insert before admin nav item
    const adminNavItem = document.getElementById('admin-nav-item');
    if (adminNavItem) {
      adminNavItem.insertAdjacentHTML('beforebegin', navItems);
    } else {
      navContainer.insertAdjacentHTML('beforeend', navItems);
    }
    
    // Add hover effects after insertion
    setTimeout(() => {
      const receiptNav = document.getElementById('receipt-nav-item');
      const voucherNav = document.getElementById('voucher-nav-item');
      const approvalNav = document.getElementById('approval-nav-item');
      
      [receiptNav, voucherNav, approvalNav].forEach(nav => {
        if (nav) {
          nav.addEventListener('mouseenter', () => {
            nav.style.background = 'var(--accent)';
            nav.querySelector('.nav-text').style.color = 'var(--accent-foreground)';
          });
          nav.addEventListener('mouseleave', () => {
            nav.style.background = 'transparent';
            nav.querySelector('.nav-text').style.color = 'var(--muted-foreground)';
          });
        }
      });
    }, 100);
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

// Populate report year dropdown with available years from receipts
async function populateReportYears() {
  const yearSelect = document.getElementById('report-year');
  if (!yearSelect) return;
  
  try {
    const { data, error } = await supabaseClient
      .from('receipts')
      .select('receipt_date');
    
    if (error) {
      console.error('Error fetching receipt years:', error);
      return;
    }
    
    if (!data || data.length === 0) return;
    
    const years = new Set();
    data.forEach(r => {
      if (r.receipt_date) {
        const year = new Date(r.receipt_date).getFullYear();
        years.add(year);
      }
    });
    
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    yearSelect.innerHTML = '<option value="">Semua Tahun</option>';
    sortedYears.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      if (year === currentYear) option.selected = true;
      yearSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Error populating report years:', err);
  }
}

// Generate receipt report for selected month/year
async function generateReceiptReport() {
  const month = document.getElementById('report-month').value;
  const year = document.getElementById('report-year').value;
  
  if (!month && !year) {
    showError('Sila pilih sekurang-kurangnya bulan atau tahun untuk menjana laporan');
    return;
  }
  
  try {
    let query = supabaseClient
      .from('receipts')
      .select('*')
      .order('receipt_date', { ascending: true });
    
    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('receipt_date', startDate).lte('receipt_date', endDate);
    }
    
    if (month) {
      const selectedYear = year || new Date().getFullYear();
      const startDate = `${selectedYear}-${month.padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, month, 0).getDate();
      const endDate = `${selectedYear}-${month.padStart(2, '0')}-${lastDay}`;
      query = query.gte('receipt_date', startDate).lte('receipt_date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching receipts for report:', error);
      showError('Gagal memuatkan data resit untuk laporan');
      return;
    }
    
    if (!data || data.length === 0) {
      showError('Tiada resit dijumpai untuk tempoh yang dipilih');
      return;
    }
    
    // Generate CSV report
    const csv = generateReceiptCSV(data, month, year);
    downloadCSV(csv, `laporan-resit-${year || 'semua'}-${month ? month : 'semua'}.csv`);
    
    showSuccess('Laporan berjaya dijana dan dimuat turun');
  } catch (err) {
    console.error('Error generating report:', err);
    showError('Gagal menjana laporan');
  }
}

// Generate CSV from receipt data
function generateReceiptCSV(receipts, month, year) {
  const headers = ['No. Resit', 'Tarikh', 'Nama Ahli', 'No. Ahli', 'Jumlah (RM)', 'Kaedah Pembayaran', 'Tarikh Pembayaran', 'ID Transaksi', 'Dijana Oleh', 'Penerangan'];
  
  let csv = headers.join(',') + '\n';
  
  receipts.forEach(r => {
    const row = [
      r.receipt_number || '',
      r.receipt_date ? new Date(r.receipt_date).toLocaleDateString() : '',
      r.member_name || '',
      r.nombor_ahli || 'N/A',
      r.amount ? parseFloat(r.amount).toFixed(2) : '0.00',
      r.payment_method || '',
      r.payment_date ? new Date(r.payment_date).toLocaleDateString() : '',
      r.transaction_id || 'N/A',
      r.DPMM_USERS?.nama || r.created_by || '-',
      r.description || '-'
    ];
    csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });
  
  // Add summary
  const totalAmount = receipts.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  csv += '\n';
  csv += `Jumlah Resit,${receipts.length}\n`;
  csv += `Jumlah Keseluruhan (RM),${totalAmount.toFixed(2)}\n`;
  
  return csv;
}

// Download CSV file
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
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
