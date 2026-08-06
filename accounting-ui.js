// Accounting Software - Frontend UI Components (Perakaunan)
// Integrated with Sistem Ahli DPMM Johor
// Follows conventions established in receipt-pv-ui.js
// Cache-bust: 2026-08-06-02-00

// ── Roles allowed to write/approve accounting data ──
var ACCOUNTING_WRITE_ROLES = ['admin', 'bendahari'];
var ACCOUNTING_APPROVE_ROLES = ['admin', 'bendahari', 'ajk'];

function accountingCanWrite() {
  var role = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.role : null;
  return ACCOUNTING_WRITE_ROLES.indexOf(role) !== -1;
}
function accountingCanApprove() {
  var role = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.role : null;
  return ACCOUNTING_APPROVE_ROLES.indexOf(role) !== -1;
}

// ── Navigation injection (mirrors addReceiptPVNavigation pattern) ──
function addAccountingNavigation() {
  var navContainer = document.querySelector('nav.sb-nav');
  if (!navContainer) return;

  if (!document.getElementById('accounting-nav-item')) {
    var navItem =
      '<div class="nav-item" onclick="showPage(\'accounting\')" id="accounting-nav-item" style="display:none;">' +
      '<span class="nav-text">PERAKAUNAN</span>' +
      '</div>';
    var adminNavItem = document.getElementById('admin-nav-item');
    if (adminNavItem) {
      adminNavItem.insertAdjacentHTML('beforebegin', navItem);
    } else {
      navContainer.insertAdjacentHTML('beforeend', navItem);
    }
  }
  updateAccountingNavVisibility();
}

function updateAccountingNavVisibility() {
  var nav = document.getElementById('accounting-nav-item');
  if (!nav) return;
  var role = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.role : null;
  nav.style.display = (ACCOUNTING_APPROVE_ROLES.indexOf(role) !== -1) ? 'flex' : 'none';
}

// ── Income categories requiring conditional fields ──
var ACCOUNTING_INCOME_CATEGORIES = [
  { value: 'YURAN', label: 'Yuran' },
  { value: 'YURAN PENDAFTARAN', label: 'Yuran Pendaftaran' },
  { value: 'SUMBANGAN', label: 'Sumbangan' },
  { value: 'SEWA', label: 'Sewa' },
  { value: 'BANK STATEMENT', label: 'Bank Statement' },
  { value: 'OTHER', label: 'Lain-lain' }
];

// ── Page entry point ──
function showAccountingPage() {
  var dashEl = document.getElementById('accounting-dashboard');
  var listEl = document.getElementById('accounting-list');
  if (!dashEl || !listEl) return;

  var canWrite = accountingCanWrite();

  dashEl.innerHTML =
    '<div class="kpi-grid kpi-4" style="margin-bottom:24px;">' +
      '<div class="modern-kpi-card premium-glass"><div class="modern-kpi-label">JUMLAH PENDAPATAN (BULAN INI)</div><div class="modern-kpi-val" id="acct-kpi-month-total">RM 0.00</div></div>' +
      '<div class="modern-kpi-card modern-kpi-danger premium-glass"><div class="modern-kpi-label">MENUNGGU KELULUSAN</div><div class="modern-kpi-val" id="acct-kpi-pending">0</div></div>' +
      '<div class="modern-kpi-card premium-glass"><div class="modern-kpi-label">BAKI BANK (SEMUA AKAUN)</div><div class="modern-kpi-val" id="acct-kpi-bank-balance">RM 0.00</div></div>' +
      '<div class="modern-kpi-card premium-glass"><div class="modern-kpi-label">BAKI TUNAI</div><div class="modern-kpi-val" id="acct-kpi-cash-balance">RM 0.00</div></div>' +
    '</div>';

  listEl.innerHTML =
    '<div class="sec-card" style="margin-bottom:18px;">' +
      '<div class="sec-head"><h3>Akaun Bank</h3>' +
        (canWrite ? '<button class="btn btn-primary btn-sm" onclick="openBankAccountModal()">+ Tambah Akaun Bank</button>' : '') +
      '</div>' +
      '<div class="sec-body">' +
        '<div class="table-wrap"><table class="table"><thead><tr>' +
          '<th>Bank</th><th>No. Akaun</th><th>Jenis</th><th>Baki (RM)</th><th>Utama</th>' + (canWrite ? '<th>Tindakan</th>' : '') +
        '</tr></thead><tbody id="acct-bank-table-body"><tr><td colspan="6" style="text-align:center;color:var(--muted);">Memuatkan...</td></tr></tbody></table></div>' +
      '</div>' +
    '</div>' +

    '<div class="sec-card" style="margin-bottom:18px;">' +
      '<div class="sec-head"><h3>Akaun Tunai</h3>' +
        (canWrite ? '<button class="btn btn-primary btn-sm" onclick="openCashAccountModal()">+ Tambah Akaun Tunai</button>' : '') +
      '</div>' +
      '<div class="sec-body">' +
        '<div class="table-wrap"><table class="table"><thead><tr>' +
          '<th>Nama Akaun</th><th>Jenis</th><th>Lokasi</th><th>Pengurus</th><th>Baki (RM)</th><th>Aktif</th>' + (canWrite ? '<th>Tindakan</th>' : '') +
        '</tr></thead><tbody id="acct-cash-table-body"><tr><td colspan="7" style="text-align:center;color:var(--muted);">Memuatkan...</td></tr></tbody></table></div>' +
      '</div>' +
    '</div>' +

    (canWrite ?
    '<div class="sec-card" style="margin-bottom:18px;">' +
      '<div class="sec-head"><h3>Rekod Pendapatan Baru</h3></div>' +
      '<div class="sec-body">' +
        '<div class="field-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">' +
          '<div class="field-grp"><label class="field-label">Kategori Pendapatan</label>' +
            '<select id="acct-entry-category" class="field-input" onchange="onAccountingCategoryChange()">' +
              ACCOUNTING_INCOME_CATEGORIES.map(function(c){ return '<option value="' + c.value + '">' + c.label + '</option>'; }).join('') +
            '</select></div>' +
          '<div class="field-grp"><label class="field-label">Tarikh</label><input type="date" id="acct-entry-date" class="field-input" value="' + new Date().toISOString().slice(0,10) + '"></div>' +
          '<div class="field-grp" id="acct-entry-subcategory-grp" style="display:none;"><label class="field-label">Sub-Kategori</label>' +
            '<select id="acct-entry-subcategory" class="field-input"><option value="CORPORATE">Corporate</option><option value="GOVERNMENT">Government</option><option value="PERSONAL">Personal</option></select></div>' +
          '<div class="field-grp" id="acct-entry-property-grp" style="display:none;"><label class="field-label">Nama Hartanah</label><input type="text" id="acct-entry-property" class="field-input" placeholder="Nama / lokasi hartanah"></div>' +
          '<div class="field-grp" id="acct-entry-custom-desc-grp" style="display:none;grid-column:span 2;"><label class="field-label">Penerangan (Lain-lain)</label><textarea id="acct-entry-custom-desc" class="field-input" rows="2" placeholder="Nyatakan sumber pendapatan"></textarea></div>' +
          '<div class="field-grp" id="acct-entry-upload-grp" style="display:none;grid-column:span 2;"><label class="field-label">Muat Naik Dokumen Bank</label><div class="upload-zone" style="border:2px dashed var(--gray2);border-radius:8px;padding:16px;text-align:center;position:relative;cursor:pointer;" onclick="document.getElementById(\'acct-entry-upload\').click()"><input type="file" id="acct-entry-upload" accept="image/*,application/pdf" style="position:absolute;inset:0;opacity:0;cursor:pointer;" onchange="onAccountingFileSelected()"><span id="acct-upload-label" style="color:var(--muted);font-size:13px;">Klik untuk memilih fail (JPG, PNG atau PDF)</span></div></div>' +
          '<div class="field-grp"><label class="field-label">Ahli (Pilihan)</label><select id="acct-entry-member" class="field-input"><option value="">— Tidak berkaitan ahli —</option></select></div>' +
          '<div class="field-grp"><label class="field-label">Jumlah (RM)</label><input type="number" id="acct-entry-amount" class="field-input" step="0.01" placeholder="0.00"></div>' +
          '<div class="field-grp"><label class="field-label">Akaun Bank</label><select id="acct-entry-bank" class="field-input"></select></div>' +
          '<div class="field-grp"><label class="field-label">Kaedah Pembayaran</label><select id="acct-entry-method" class="field-input"><option value="cash">Tunai</option><option value="online">Pindahan Dalam Talian</option><option value="cheque">Cek</option><option value="other">Lain-lain</option></select></div>' +
          '<div class="field-grp"><label class="field-label">No. Rujukan</label><input type="text" id="acct-entry-reference" class="field-input" placeholder="No. resit / rujukan"></div>' +
          '<div class="field-grp" style="grid-column:span 2;"><label class="field-label">Penerangan</label><textarea id="acct-entry-desc" class="field-input" rows="2"></textarea></div>' +
        '</div>' +
        '<button class="btn btn-primary btn-shine" style="margin-top:14px;" onclick="createAccountingEntry()">Simpan Rekod</button>' +
      '</div>' +
    '</div>' : '') +

    '<div class="sec-card">' +
      '<div class="sec-head"><h3>Senarai Rekod Pendapatan</h3>' +
        '<div style="display:flex;gap:10px;align-items:center;">' +
          '<select id="acct-filter-month" class="field-input" style="width:auto;padding:6px 10px;font-size:13px;" onchange="filterAccountingEntries()">' +
            '<option value="">Semua Bulan</option>' +
          '</select>' +
          '<select id="acct-filter-year" class="field-input" style="width:auto;padding:6px 10px;font-size:13px;" onchange="filterAccountingEntries()">' +
            '<option value="">Semua Tahun</option>' +
          '</select>' +
          '<button class="btn btn-outline btn-sm" onclick="exportAccountingCSV()">Eksport CSV</button>' +
        '</div>' +
      '</div>' +
      '<div class="sec-body">' +
        '<div class="table-wrap"><table class="table"><thead><tr>' +
          '<th>No. Rekod</th><th>Tarikh</th><th>Kategori</th><th>Ahli</th><th>Jumlah (RM)</th><th>Status</th><th>Tindakan</th>' +
        '</tr></thead><tbody id="acct-entries-table-body"><tr><td colspan="7" style="text-align:center;color:var(--muted);">Memuatkan...</td></tr></tbody></table></div>' +
        '<div id="acct-summary" style="margin-top:14px;padding:12px;background:var(--gray1);border-radius:8px;display:none;">' +
          '<div><strong>Jumlah Rekod:</strong> <span id="acct-summary-count">0</span></div>' +
          '<div><strong>Jumlah Pendapatan (Diluluskan):</strong> RM <span id="acct-summary-total">0.00</span></div>' +
        '</div>' +
      '</div>' +
    '</div>';

  loadBankAccounts();
  loadCashAccounts();
  loadAccountingEntries();
  loadAccountingMembers();
  loadAccountingKpis();
  populateAccountingFilters();
}

// ── Conditional field logic ──
function onAccountingCategoryChange() {
  var cat = document.getElementById('acct-entry-category').value;
  document.getElementById('acct-entry-subcategory-grp').style.display = (cat === 'SUMBANGAN') ? 'block' : 'none';
  document.getElementById('acct-entry-property-grp').style.display = (cat === 'SEWA') ? 'block' : 'none';
  document.getElementById('acct-entry-custom-desc-grp').style.display = (cat === 'OTHER') ? 'block' : 'none';
  document.getElementById('acct-entry-upload-grp').style.display = (cat === 'BANK STATEMENT') ? 'block' : 'none';
}

// ── File upload indicator with OCR auto-fill ──
function onAccountingFileSelected() {
  var input = document.getElementById('acct-entry-upload');
  if (input && input.files && input.files[0]) {
    var file = input.files[0];
    var fileName = file.name;
    var label = document.getElementById('acct-upload-label');
    if (label) {
      label.innerHTML = '<span style="color:var(--muted);">Memproses ' + fileName + '...</span>';
    }
    
    // Process OCR for bank statements
    processBankStatementOCR(file);
  }
}

// ── OCR processing for bank statements ──
async function processBankStatementOCR(file) {
  var label = document.getElementById('acct-upload-label');
  
  try {
    // Check if PDF or image
    if (file.type === 'application/pdf') {
      // For PDF, use pdf.js to render first page then OCR
      if (typeof pdfjsLib !== 'undefined') {
        var arrayBuffer = await file.arrayBuffer();
        var pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        var page = await pdf.getPage(1);
        var scale = 2.0;
        var viewport = page.getViewport({ scale: scale });
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        
        // OCR the rendered canvas
        var result = await Tesseract.recognize(canvas, 'eng', {
          logger: function(m) {
            if (m.status === 'recognizing text') {
              var progress = Math.round(m.progress * 100);
              if (label) {
                label.innerHTML = '<span style="color:var(--muted);">Memproses ' + file.name + '... ' + progress + '%</span>';
              }
            }
          }
        });
        
        extractAndFillBankData(result.data.text);
      }
    } else {
      // For images, OCR directly
      var result = await Tesseract.recognize(file, 'eng', {
        logger: function(m) {
          if (m.status === 'recognizing text') {
            var progress = Math.round(m.progress * 100);
            if (label) {
              label.innerHTML = '<span style="color:var(--muted);">Memproses ' + file.name + '... ' + progress + '%</span>';
            }
          }
        }
      });
      
      extractAndFillBankData(result.data.text);
    }
    
    if (label) {
      label.innerHTML = '<span style="color:var(--success);font-weight:600;">' + file.name + ' (Selesai)</span>';
    }
    
  } catch (err) {
    console.error('OCR processing error:', err);
    if (label) {
      label.innerHTML = '<span style="color:var(--danger);font-weight:600;">' + file.name + ' (Gagal - Sila isi manual)</span>';
    }
    showError('OCR gagal: ' + err.message);
  }
}

// ── Extract and auto-fill bank statement data ──
function extractAndFillBankData(ocrText) {
  var text = ocrText.toUpperCase();
  
  // Try to extract amount (look for RM or currency patterns)
  var amountMatch = text.match(/RM\s*[\d,]+\.?\d*/g);
  if (amountMatch && amountMatch.length > 0) {
    var amountStr = amountMatch[0].replace(/RM\s*/, '').replace(/,/g, '');
    var amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount > 0) {
      document.getElementById('acct-entry-amount').value = amount;
    }
  }
  
  // Try to extract date (DD/MM/YYYY or DD-MM-YYYY patterns)
  var dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/);
  if (dateMatch) {
    var dateStr = dateMatch[0].replace(/\//g, '-');
    // Convert to YYYY-MM-DD format
    var parts = dateStr.split('-');
    if (parts.length === 3) {
      var day = parts[0].padStart(2, '0');
      var month = parts[1].padStart(2, '0');
      var year = parts[2];
      document.getElementById('acct-entry-date').value = year + '-' + month + '-' + day;
    }
  }
  
  // Try to extract reference number
  var refMatch = text.match(/(?:REF|RUJUKAN|NO\.?\s*)[:\s]*([A-Z0-9\-]+)/i);
  if (refMatch && refMatch[1]) {
    document.getElementById('acct-entry-reference').value = refMatch[1];
  }
  
  // Auto-fill description with bank name if found
  var bankMatch = text.match(/(?:BANK|CIMB|MAYBANK|PUBLIC BANK|RHB|HSBC|AMBANK)/i);
  if (bankMatch) {
    var bankName = bankMatch[0];
    var descField = document.getElementById('acct-entry-desc');
    if (descField && !descField.value) {
      descField.value = 'Bank Statement - ' + bankName;
    }
  }
  
  showSuccess('Data diekstrak secara automatik dari bank statement');
}

// ── Members dropdown (mirrors loadMembers in receipt-pv-ui.js) ──
async function loadAccountingMembers() {
  var select = document.getElementById('acct-entry-member');
  if (!select) return;
  try {
    var res = await supabaseClient
      .from('AHLI DPMM JOHOR')
      .select('id, NO_AHLI, NAMA_AHLI, NAMA')
      .order('NAMA_AHLI');
    if (res.error) throw res.error;
    var rows = res.data || [];
    var opts = '<option value="">— Tidak berkaitan ahli —</option>';
    rows.forEach(function(m){
      opts += '<option value="' + m.id + '">' + (m.NAMA_AHLI || m.NAMA || m.NO_AHLI || ('#' + m.id)) + '</option>';
    });
    select.innerHTML = opts;
  } catch (err) {
    console.error('Error loading members for accounting:', err);
  }
}

// ── Bank Accounts CRUD ──
async function loadBankAccounts() {
  var tbody = document.getElementById('acct-bank-table-body');
  var bankSelect = document.getElementById('acct-entry-bank');
  try {
    var res = await supabaseClient.from('bank_accounts').select('*').order('bank_name');
    if (res.error) throw res.error;
    var rows = res.data || [];
    var canWrite = accountingCanWrite();

    if (bankSelect) {
      bankSelect.innerHTML = rows.map(function(b){
        return '<option value="' + b.id + '">' + b.bank_name + ' - ' + b.account_number + '</option>';
      }).join('') || '<option value="">Tiada akaun bank</option>';
    }

    if (!tbody) return;
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);">Tiada akaun bank direkodkan.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(function(b){
      return '<tr>' +
        '<td>' + b.bank_name + '</td>' +
        '<td style="font-family:var(--mono);">' + b.account_number + '</td>' +
        '<td>' + (b.account_type || '—') + '</td>' +
        '<td style="font-family:var(--mono);font-weight:700;">' + Number(b.balance || 0).toLocaleString('en-MY', {minimumFractionDigits:2}) + '</td>' +
        '<td>' + (b.is_main ? 'Ya' : '—') + '</td>' +
        (canWrite ? '<td><button class="btn btn-outline btn-sm" onclick="openBankAccountModal(' + b.id + ')">Edit</button></td>' : '') +
      '</tr>';
    }).join('');
  } catch (err) {
    console.error('Error loading bank accounts:', err);
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--danger);">Ralat memuat akaun bank.</td></tr>';
  }
}

function openBankAccountModal(bankId) {
  var overlay = document.getElementById('accounting-bank-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'accounting-bank-modal';
    overlay.innerHTML =
      '<div class="modal" style="max-width:480px;">' +
        '<div class="modal-head"><h3>Akaun Bank</h3><button class="modal-close" onclick="closeModal(\'accounting-bank-modal\')">&#x2715;</button></div>' +
        '<div class="modal-body">' +
          '<input type="hidden" id="acct-bank-id">' +
          '<div class="field-grp"><label class="field-label">Nama Bank</label><input type="text" id="acct-bank-name" class="field-input" placeholder="cth: Maybank"></div>' +
          '<div class="field-grp"><label class="field-label">No. Akaun</label><input type="text" id="acct-bank-account-number" class="field-input"></div>' +
          '<div class="field-grp"><label class="field-label">Jenis Akaun</label><select id="acct-bank-account-type" class="field-input"><option value="current">Semasa (Current)</option><option value="savings">Simpanan (Savings)</option></select></div>' +
          '<div class="field-grp"><label class="field-label">Baki (RM)</label><input type="number" id="acct-bank-balance" class="field-input" step="0.01"></div>' +
          '<div class="field-grp"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="acct-bank-is-main"> Akaun Utama</label></div>' +
          '<div style="margin-top:14px;display:flex;gap:10px;">' +
            '<button class="btn btn-primary btn-shine" onclick="saveBankAccount()">Simpan</button>' +
            '<button class="btn btn-outline" onclick="closeModal(\'accounting-bank-modal\')">Batal</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  document.getElementById('acct-bank-id').value = '';
  document.getElementById('acct-bank-name').value = '';
  document.getElementById('acct-bank-account-number').value = '';
  document.getElementById('acct-bank-account-type').value = 'current';
  document.getElementById('acct-bank-balance').value = '';
  document.getElementById('acct-bank-is-main').checked = false;

  if (bankId) {
    supabaseClient.from('bank_accounts').select('*').eq('id', bankId).single().then(function(res){
      if (res.error || !res.data) return;
      var b = res.data;
      document.getElementById('acct-bank-id').value = b.id;
      document.getElementById('acct-bank-name').value = b.bank_name;
      document.getElementById('acct-bank-account-number').value = b.account_number;
      document.getElementById('acct-bank-account-type').value = b.account_type || 'current';
      document.getElementById('acct-bank-balance').value = b.balance;
      document.getElementById('acct-bank-is-main').checked = !!b.is_main;
    });
  }

  overlay.classList.add('show');
}

async function saveBankAccount() {
  if (!accountingCanWrite()) { showError('Tidak diiktiraf: Peranan admin/bendahari diperlukan'); return; }
  var id = document.getElementById('acct-bank-id').value;
  var payload = {
    bank_name: document.getElementById('acct-bank-name').value.trim(),
    account_number: document.getElementById('acct-bank-account-number').value.trim(),
    account_type: document.getElementById('acct-bank-account-type').value,
    balance: parseFloat(document.getElementById('acct-bank-balance').value) || 0,
    is_main: document.getElementById('acct-bank-is-main').checked
  };
  if (!payload.bank_name || !payload.account_number) {
    showError('Sila isi nama bank dan no. akaun');
    return;
  }
  try {
    var res;
    if (id) {
      res = await supabaseClient.from('bank_accounts').update(payload).eq('id', id);
    } else {
      res = await supabaseClient.from('bank_accounts').insert([payload]);
    }
    if (res.error) throw res.error;
    showSuccess('Akaun bank berjaya disimpan');
    closeModal('accounting-bank-modal');
    loadBankAccounts();
    loadAccountingKpis();
  } catch (err) {
    console.error('Error saving bank account:', err);
    showError('Ralat menyimpan akaun bank: ' + err.message);
  }
}

// ── Cash Accounts CRUD ──
async function loadCashAccounts() {
  var tbody = document.getElementById('acct-cash-table-body');
  if (!tbody) return;
  try {
    var res = await supabaseClient.from('cash_accounts').select('*').order('account_name');
    if (res.error) throw res.error;
    var rows = res.data || [];
    var canWrite = accountingCanWrite();

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);">Tiada akaun tunai direkodkan.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(function(c){
      return '<tr>' +
        '<td>' + c.account_name + '</td>' +
        '<td>' + (c.account_type || '—') + '</td>' +
        '<td>' + (c.location || '—') + '</td>' +
        '<td>' + (c.custodian || '—') + '</td>' +
        '<td style="font-family:var(--mono);font-weight:700;">' + Number(c.balance || 0).toLocaleString('en-MY', {minimumFractionDigits:2}) + '</td>' +
        '<td>' + (c.is_active ? 'Ya' : 'Tidak') + '</td>' +
        (canWrite ? '<td><button class="btn btn-outline btn-sm" onclick="openCashAccountModal(' + c.id + ')">Edit</button> <button class="btn btn-outline btn-sm" onclick="viewCashTransactions(' + c.id + ')">Transaksi</button></td>' : '<td><button class="btn btn-outline btn-sm" onclick="viewCashTransactions(' + c.id + ')">Transaksi</button></td>') +
      '</tr>';
    }).join('');
  } catch (err) {
    console.error('Error loading cash accounts:', err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger);">Ralat memuat akaun tunai.</td></tr>';
  }
}

function openCashAccountModal(cashId) {
  var overlay = document.getElementById('accounting-cash-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'accounting-cash-modal';
    overlay.innerHTML =
      '<div class="modal" style="max-width:480px;">' +
        '<div class="modal-head"><h3>Akaun Tunai</h3><button class="modal-close" onclick="closeModal(\'accounting-cash-modal\')">&#x2715;</button></div>' +
        '<div class="modal-body">' +
          '<input type="hidden" id="acct-cash-id">' +
          '<div class="field-grp"><label class="field-label">Nama Akaun</label><input type="text" id="acct-cash-name" class="field-input" placeholder="cth: Tunai Pejabat"></div>' +
          '<div class="field-grp"><label class="field-label">Jenis Akaun</label><select id="acct-cash-type" class="field-input"><option value="petty_cash">Petty Cash (Kecil)</option><option value="safe">Safe ( peti besi)</option><option value="drawer">Drawer (Laci)</option><option value="other">Lain-lain</option></select></div>' +
          '<div class="field-grp"><label class="field-label">Lokasi</label><input type="text" id="acct-cash-location" class="field-input" placeholder="cth: Pejabat Utama"></div>' +
          '<div class="field-grp"><label class="field-label">Pengurus</label><input type="text" id="acct-cash-custodian" class="field-input" placeholder="Nama penjaga"></div>' +
          '<div class="field-grp"><label class="field-label">Baki (RM)</label><input type="number" id="acct-cash-balance" class="field-input" step="0.01"></div>' +
          '<div class="field-grp"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="acct-cash-is-active" checked> Akaun Aktif</label></div>' +
          '<div style="margin-top:14px;display:flex;gap:10px;">' +
            '<button class="btn btn-primary btn-shine" onclick="saveCashAccount()">Simpan</button>' +
            '<button class="btn btn-outline" onclick="closeModal(\'accounting-cash-modal\')">Batal</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  document.getElementById('acct-cash-id').value = '';
  document.getElementById('acct-cash-name').value = '';
  document.getElementById('acct-cash-type').value = 'petty_cash';
  document.getElementById('acct-cash-location').value = '';
  document.getElementById('acct-cash-custodian').value = '';
  document.getElementById('acct-cash-balance').value = '';
  document.getElementById('acct-cash-is-active').checked = true;

  if (cashId) {
    supabaseClient.from('cash_accounts').select('*').eq('id', cashId).single().then(function(res){
      if (res.error || !res.data) return;
      var c = res.data;
      document.getElementById('acct-cash-id').value = c.id;
      document.getElementById('acct-cash-name').value = c.account_name;
      document.getElementById('acct-cash-type').value = c.account_type || 'petty_cash';
      document.getElementById('acct-cash-location').value = c.location || '';
      document.getElementById('acct-cash-custodian').value = c.custodian || '';
      document.getElementById('acct-cash-balance').value = c.balance;
      document.getElementById('acct-cash-is-active').checked = !!c.is_active;
    });
  }

  overlay.classList.add('show');
}

async function saveCashAccount() {
  if (!accountingCanWrite()) { showError('Tidak diiktiraf: Peranan admin/bendahari diperlukan'); return; }
  var id = document.getElementById('acct-cash-id').value;
  var payload = {
    account_name: document.getElementById('acct-cash-name').value.trim(),
    account_type: document.getElementById('acct-cash-type').value,
    location: document.getElementById('acct-cash-location').value.trim(),
    custodian: document.getElementById('acct-cash-custodian').value.trim(),
    balance: parseFloat(document.getElementById('acct-cash-balance').value) || 0,
    is_active: document.getElementById('acct-cash-is-active').checked
  };
  if (!payload.account_name) {
    showError('Sila isi nama akaun tunai');
    return;
  }
  try {
    var res;
    if (id) {
      res = await supabaseClient.from('cash_accounts').update(payload).eq('id', id);
    } else {
      res = await supabaseClient.from('cash_accounts').insert([payload]);
    }
    if (res.error) throw res.error;
    showSuccess('Akaun tunai berjaya disimpan');
    closeModal('accounting-cash-modal');
    loadCashAccounts();
    loadAccountingKpis();
  } catch (err) {
    console.error('Error saving cash account:', err);
    showError('Ralat menyimpan akaun tunai: ' + err.message);
  }
}

// ── Accounting Entries CRUD ──
async function createAccountingEntry() {
  if (!accountingCanWrite()) { showError('Tidak diiktiraf: Peranan admin/bendahari diperlukan'); return; }

  var category = document.getElementById('acct-entry-category').value;
  var entryDate = document.getElementById('acct-entry-date').value;
  var amount = parseFloat(document.getElementById('acct-entry-amount').value);
  var memberId = document.getElementById('acct-entry-member').value || null;
  var bankAccountId = document.getElementById('acct-entry-bank').value || null;
  var paymentMethod = document.getElementById('acct-entry-method').value;
  var reference = document.getElementById('acct-entry-reference').value.trim();
  var description = document.getElementById('acct-entry-desc').value.trim();
  var subcategory = (category === 'SUMBANGAN') ? document.getElementById('acct-entry-subcategory').value : null;
  var property = (category === 'SEWA') ? document.getElementById('acct-entry-property').value.trim() : null;
  var customDesc = (category === 'OTHER') ? document.getElementById('acct-entry-custom-desc').value.trim() : null;

  if (!entryDate || !amount || amount <= 0) {
    showError('Sila isi tarikh dan jumlah yang sah');
    return;
  }
  if (category === 'OTHER' && !customDesc) {
    showError('Sila nyatakan penerangan untuk kategori Lain-lain');
    return;
  }

  var memberName = null;
  if (memberId) {
    var mOpt = document.getElementById('acct-entry-member');
    memberName = mOpt.options[mOpt.selectedIndex] ? mOpt.options[mOpt.selectedIndex].textContent : null;
  }

  try {
    var yearMonth = entryDate.slice(0, 7);
    var rpcRes = await supabaseClient.rpc('get_next_number', { p_type: 'accounting_entry', p_year_month: yearMonth });
    if (rpcRes.error || !rpcRes.data) throw new Error('Gagal menjana nombor rekod: ' + (rpcRes.error ? rpcRes.error.message : 'null'));
    var entryNumber = rpcRes.data;

    var supportingDocumentUrl = null;
    var uploadInput = document.getElementById('acct-entry-upload');
    if (category === 'BANK STATEMENT' && uploadInput && uploadInput.files && uploadInput.files[0]) {
      var file = uploadInput.files[0];
      var filePath = entryNumber.replace(/\//g, '_') + '_' + Date.now() + '_' + file.name;
      var uploadRes = await supabaseClient.storage.from('bank-statements').upload(filePath, file);
      if (uploadRes.error) {
        console.warn('Bank statement upload failed:', uploadRes.error);
        showError('Amaran: Muat naik dokumen gagal, tetapi rekod tetap disimpan.');
      } else {
        var pub = supabaseClient.storage.from('bank-statements').getPublicUrl(filePath);
        supportingDocumentUrl = pub && pub.data ? pub.data.publicUrl : null;
      }
    }

    var payload = {
      entry_number: entryNumber,
      entry_date: entryDate,
      income_category: category,
      income_subcategory: subcategory,
      amount: amount,
      member_id: memberId,
      member_name: memberName,
      description: description || null,
      property_name: property,
      custom_description: customDesc,
      bank_account_id: bankAccountId,
      payment_method: paymentMethod,
      reference_number: reference || null,
      supporting_document_url: supportingDocumentUrl,
      approval_status: 'pending',
      created_by: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.id : 'system'
    };

    var insertRes = await supabaseClient.from('accounting_entries').insert([payload]).select();
    if (insertRes.error) throw insertRes.error;

    var newEntryId = insertRes.data && insertRes.data[0] ? insertRes.data[0].id : null;
    if (newEntryId) {
      await supabaseClient.from('approval_history').insert([{
        voucher_id: newEntryId,
        entity_type: 'accounting_entry',
        action: 'created',
        performed_by: payload.created_by,
        comments: 'Rekod pendapatan baru dicipta: ' + entryNumber
      }]);
    }

    showSuccess('Rekod pendapatan dijana: ' + entryNumber);
    document.getElementById('acct-entry-amount').value = '';
    document.getElementById('acct-entry-desc').value = '';
    document.getElementById('acct-entry-reference').value = '';
    loadAccountingEntries();
    loadAccountingKpis();
  } catch (err) {
    console.error('Error creating accounting entry:', err);
    showError('Ralat menyimpan rekod: ' + err.message);
  }
}

async function loadAccountingEntries() {
  var tbody = document.getElementById('acct-entries-table-body');
  if (!tbody) return;
  try {
    var res = await supabaseClient.from('accounting_entries').select('*').order('entry_date', { ascending: false }).limit(100);
    if (res.error) throw res.error;
    var rows = res.data || [];
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);">Tiada rekod pendapatan.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(function(e){
      var statusBadge = e.approval_status === 'approved'
        ? '<span style="color:var(--success);font-weight:700;">Diluluskan</span>'
        : (e.approval_status === 'rejected'
          ? '<span style="color:var(--danger);font-weight:700;">Ditolak</span>'
          : '<span style="color:var(--warning);font-weight:700;">Menunggu</span>');
      return '<tr>' +
        '<td style="font-family:var(--mono);">' + e.entry_number + '</td>' +
        '<td>' + e.entry_date + '</td>' +
        '<td>' + e.income_category + (e.income_subcategory ? ' (' + e.income_subcategory + ')' : '') + '</td>' +
        '<td>' + (e.member_name || '—') + '</td>' +
        '<td style="font-family:var(--mono);font-weight:700;">' + Number(e.amount).toLocaleString('en-MY', {minimumFractionDigits:2}) + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td><button class="btn btn-outline btn-sm" onclick="reviewAccountingEntry(' + e.id + ')">Semak</button></td>' +
      '</tr>';
    }).join('');
  } catch (err) {
    console.error('Error loading accounting entries:', err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger);">Ralat memuat rekod.</td></tr>';
  }
}

// ── KPI dashboard ──
async function loadAccountingKpis() {
  try {
    var monthStart = new Date();
    monthStart.setDate(1);
    var monthStartStr = monthStart.toISOString().slice(0, 10);

    var entriesRes = await supabaseClient.from('accounting_entries').select('amount, approval_status, entry_date').gte('entry_date', monthStartStr);
    if (!entriesRes.error) {
      var monthTotal = (entriesRes.data || []).filter(function(e){ return e.approval_status === 'approved'; })
        .reduce(function(s, e){ return s + Number(e.amount || 0); }, 0);
      var el = document.getElementById('acct-kpi-month-total');
      if (el) el.textContent = 'RM ' + monthTotal.toLocaleString('en-MY', {minimumFractionDigits:2});
    }

    var pendingRes = await supabaseClient.from('accounting_entries').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending');
    var pendingEl = document.getElementById('acct-kpi-pending');
    if (pendingEl) pendingEl.textContent = (pendingRes.count != null ? pendingRes.count : 0);

    var bankRes = await supabaseClient.from('bank_accounts').select('balance');
    if (!bankRes.error) {
      var bankTotal = (bankRes.data || []).reduce(function(s, b){ return s + Number(b.balance || 0); }, 0);
      var bEl = document.getElementById('acct-kpi-bank-balance');
      if (bEl) bEl.textContent = 'RM ' + bankTotal.toLocaleString('en-MY', {minimumFractionDigits:2});
    }

    var cashRes = await supabaseClient.from('cash_accounts').select('balance');
    if (!cashRes.error) {
      var cashTotal = (cashRes.data || []).reduce(function(s, c){ return s + Number(c.balance || 0); }, 0);
      var cEl = document.getElementById('acct-kpi-cash-balance');
      if (cEl) cEl.textContent = 'RM ' + cashTotal.toLocaleString('en-MY', {minimumFractionDigits:2});
    }
  } catch (err) {
    console.error('Error loading accounting KPIs:', err);
  }
}

// ── Approval Modal (review, approve, reject) ──
async function reviewAccountingEntry(entryId) {
  try {
    var entryRes = await supabaseClient.from('accounting_entries').select('*').eq('id', entryId).single();
    if (entryRes.error) throw entryRes.error;
    var entry = entryRes.data;

    var historyRes = await supabaseClient.from('approval_history').select('*')
      .eq('voucher_id', entryId).eq('entity_type', 'accounting_entry')
      .order('created_at', { ascending: false });
    var history = historyRes.data || [];

    var overlay = document.getElementById('accounting-review-modal');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'accounting-review-modal';

    var statusHtml = '';
    if (entry.approval_status !== 'pending') {
      var bg = entry.approval_status === 'approved' ? 'var(--success-lt)' : '#f8d7da';
      statusHtml =
        '<div style="background:' + bg + ';border-radius:8px;padding:14px;margin-bottom:16px;">' +
          '<div style="font-weight:700;font-size:13px;">Status: ' + (entry.approval_status === 'approved' ? 'DILULUSKAN' : 'DITOLAK') + '</div>' +
          '<div style="font-size:12px;margin-top:4px;">Oleh: ' + (entry.approved_by || '—') + ' | ' + (entry.approval_date || '—') + '</div>' +
          (entry.rejection_reason ? '<div style="font-size:12px;margin-top:4px;"><strong>Sebab:</strong> ' + entry.rejection_reason + '</div>' : '') +
        '</div>';
    }

    var historyHtml = history.length ? ('<div style="margin-bottom:16px;"><h4 style="font-size:13px;font-weight:700;margin-bottom:8px;">Sejarah</h4>' +
      history.map(function(h){
        return '<div style="padding:8px 0;border-bottom:1px solid var(--gray1);font-size:12px;">' +
          '<strong>' + h.action + '</strong> oleh ' + h.performed_by + ' &middot; ' + new Date(h.created_at).toLocaleString('ms-MY') +
          (h.comments ? '<div>' + h.comments + '</div>' : '') +
        '</div>';
      }).join('') + '</div>') : '';

    var actionsHtml = '';
    if (entry.approval_status === 'pending' && accountingCanApprove()) {
      actionsHtml =
        '<div class="field-grp"><label class="field-label">Sebab Penolakan (jika menolak)</label><textarea id="acct-rejection-reason" class="field-input" rows="2"></textarea></div>' +
        '<div style="display:flex;gap:10px;margin-top:14px;justify-content:flex-end;">' +
          '<button class="btn btn-outline" onclick="closeModal(\'accounting-review-modal\')">Batal</button>' +
          '<button class="btn" style="background:#dc3545;color:#fff;" onclick="handleAccountingApproval(' + entryId + ', \'rejected\')">Tolak</button>' +
          '<button class="btn btn-primary" onclick="handleAccountingApproval(' + entryId + ', \'approved\')">Luluskan</button>' +
        '</div>';
    } else {
      actionsHtml = '<div style="display:flex;justify-content:flex-end;margin-top:14px;"><button class="btn btn-outline" onclick="closeModal(\'accounting-review-modal\')">Tutup</button></div>';
    }

    overlay.innerHTML =
      '<div class="modal" style="max-width:640px;">' +
        '<div class="modal-head"><h3>Semak Rekod Pendapatan</h3><button class="modal-close" onclick="closeModal(\'accounting-review-modal\')">&#x2715;</button></div>' +
        '<div class="modal-body">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">' +
            '<div><label class="field-label">No. Rekod</label><div style="font-weight:700;font-family:var(--mono);">' + entry.entry_number + '</div></div>' +
            '<div><label class="field-label">Tarikh</label><div>' + entry.entry_date + '</div></div>' +
            '<div><label class="field-label">Kategori</label><div>' + entry.income_category + (entry.income_subcategory ? ' (' + entry.income_subcategory + ')' : '') + '</div></div>' +
            '<div><label class="field-label">Jumlah</label><div style="font-weight:700;">RM ' + Number(entry.amount).toLocaleString('en-MY', {minimumFractionDigits:2}) + '</div></div>' +
            '<div><label class="field-label">Ahli</label><div>' + (entry.member_name || '—') + '</div></div>' +
            '<div><label class="field-label">Kaedah Pembayaran</label><div>' + (entry.payment_method || '—') + '</div></div>' +
            '<div style="grid-column:span 2;"><label class="field-label">Penerangan</label><div>' + (entry.description || entry.custom_description || entry.property_name || '—') + '</div></div>' +
          '</div>' +
          statusHtml + historyHtml + actionsHtml +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.classList.add('show');
  } catch (err) {
    console.error('Error reviewing accounting entry:', err);
    showError('Ralat memuat rekod: ' + err.message);
  }
}

async function handleAccountingApproval(entryId, action) {
  if (!accountingCanApprove()) { showError('Tidak diiktiraf: Peranan kelulusan diperlukan'); return; }
  var rejectionReason = null;
  if (action === 'rejected') {
    var reasonEl = document.getElementById('acct-rejection-reason');
    rejectionReason = reasonEl ? reasonEl.value.trim() : '';
    if (!rejectionReason) { showError('Sila masukkan sebab penolakan'); return; }
  }

  var performedBy = (typeof currentUser !== 'undefined' && currentUser) ? (currentUser.name || currentUser.id) : 'system';
  var userRole = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.role : null;

  try {
    var entryRes = await supabaseClient.from('accounting_entries').select('amount, approval_status').eq('id', entryId).single();
    if (entryRes.error) throw entryRes.error;
    var entry = entryRes.data;

    if (action === 'approved') {
      var amount = Number(entry.amount || 0);
      
      // Check spending limits for bendahari and ajk
      if (userRole === 'bendahari' || userRole === 'ajk') {
        var limitCheckRes = await supabaseClient.rpc('check_spending_limit', {
          p_amount: amount,
          p_role: userRole,
          p_limit_type: 'single_transaction',
          p_date: new Date().toISOString().slice(0, 10)
        });
        if (limitCheckRes.error) {
          console.warn('Spending limit check failed:', limitCheckRes.error);
        } else if (limitCheckRes.data === false) {
          showError('Jumlah melebihi had perbelanjaan untuk peranan ' + userRole);
          return;
        }
      }

      // Dual-signature requirement for amounts above RM5000
      if (amount >= 5000) {
        var historyRes = await supabaseClient.from('approval_history').select('*')
          .eq('voucher_id', entryId).eq('entity_type', 'accounting_entry').eq('action', 'approved');
        if (!historyRes.error && historyRes.data && historyRes.data.length > 0) {
          showError('Jumlah RM5,000 ke atas memerlukan kelulusan berganda. Rekod ini telah diluluskan oleh ' + historyRes.data[0].performed_by);
          return;
        }
      }
    }

    var updateRes = await supabaseClient.from('accounting_entries').update({
      approval_status: action,
      approved_by: performedBy,
      approval_date: new Date().toISOString().slice(0, 10),
      rejection_reason: rejectionReason
    }).eq('id', entryId);
    if (updateRes.error) throw updateRes.error;

    // Capture IP address and user agent for audit trail
    var ipAddress = null;
    var userAgent = navigator.userAgent || 'unknown';
    try {
      var ipRes = await fetch('https://api.ipify.org?format=json');
      if (ipRes.ok) {
        var ipData = await ipRes.json();
        ipAddress = ipData.ip;
      }
    } catch (e) {
      console.warn('Failed to capture IP address:', e);
    }

    await supabaseClient.from('approval_history').insert([{
      voucher_id: entryId,
      entity_type: 'accounting_entry',
      action: action,
      performed_by: performedBy,
      comments: rejectionReason || 'Diluluskan',
      ip_address: ipAddress,
      user_agent: userAgent
    }]);

    showSuccess(action === 'approved' ? 'Rekod berjaya diluluskan' : 'Rekod berjaya ditolak');
    closeModal('accounting-review-modal');
    loadAccountingEntries();
    loadAccountingKpis();
  } catch (err) {
    console.error('Error updating approval:', err);
    showError('Ralat: ' + err.message);
  }
}

// ── Cash Transaction History ──
async function viewCashTransactions(cashAccountId) {
  try {
    var cashRes = await supabaseClient.from('cash_accounts').select('*').eq('id', cashAccountId).single();
    if (cashRes.error) throw cashRes.error;
    var cashAccount = cashRes.data;

    var transRes = await supabaseClient.from('cash_transactions').select('*').eq('cash_account_id', cashAccountId).order('transaction_date', { ascending: false }).limit(50);
    if (transRes.error) throw transRes.error;
    var transactions = transRes.data || [];

    var overlay = document.getElementById('cash-transactions-modal');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'cash-transactions-modal';

    var transHtml = '';
    if (transactions.length === 0) {
      transHtml = '<tr><td colspan="6" style="text-align:center;color:var(--muted);">Tiada transaksi direkodkan.</td></tr>';
    } else {
      transHtml = transactions.map(function(t){
        var typeBadge = t.transaction_type === 'deposit'
          ? '<span style="color:var(--success);font-weight:700;">Masuk</span>'
          : (t.transaction_type === 'withdrawal'
            ? '<span style="color:var(--danger);font-weight:700;">Keluar</span>'
            : (t.transaction_type === 'expense'
              ? '<span style="color:var(--warning);font-weight:700;">Perbelanjaan</span>'
              : '<span style="color:var(--info);font-weight:700;">Pindahan</span>'));
        return '<tr>' +
          '<td>' + t.transaction_date + '</td>' +
          '<td>' + typeBadge + '</td>' +
          '<td>' + (t.description || '—') + '</td>' +
          '<td>' + (t.recipient_payee || '—') + '</td>' +
          '<td style="font-family:var(--mono);font-weight:700;">' + Number(t.amount).toLocaleString('en-MY', {minimumFractionDigits:2}) + '</td>' +
          '<td>' + (t.reference_number || '—') + '</td>' +
        '</tr>';
      }).join('');
    }

    overlay.innerHTML =
      '<div class="modal" style="max-width:800px;">' +
        '<div class="modal-head"><h3>Sejarah Transaksi: ' + cashAccount.account_name + '</h3><button class="modal-close" onclick="closeModal(\'cash-transactions-modal\')">&#x2715;</button></div>' +
        '<div class="modal-body">' +
          '<div style="margin-bottom:16px;padding:12px;background:var(--gray1);border-radius:8px;">' +
            '<div><strong>Jenis Akaun:</strong> ' + (cashAccount.account_type || '—') + '</div>' +
            '<div><strong>Lokasi:</strong> ' + (cashAccount.location || '—') + '</div>' +
            '<div><strong>Pengurus:</strong> ' + (cashAccount.custodian || '—') + '</div>' +
            '<div><strong>Baki Semasa:</strong> RM ' + Number(cashAccount.balance || 0).toLocaleString('en-MY', {minimumFractionDigits:2}) + '</div>' +
          '</div>' +
          '<div class="table-wrap"><table class="table"><thead><tr>' +
            '<th>Tarikh</th><th>Jenis</th><th>Penerangan</th><th>Penerima/Pembayar</th><th>Jumlah (RM)</th><th>No. Rujukan</th>' +
          '</tr></thead><tbody>' + transHtml + '</tbody></table></div>' +
          '<div style="margin-top:14px;display:flex;justify-content:flex-end;"><button class="btn btn-outline" onclick="closeModal(\'cash-transactions-modal\')">Tutup</button></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.classList.add('show');
  } catch (err) {
    console.error('Error loading cash transactions:', err);
    showError('Ralat memuat sejarah transaksi: ' + err.message);
  }
}

// ── Accounting Reporting Functions ──
async function populateAccountingFilters() {
  try {
    var yearSelect = document.getElementById('acct-filter-year');
    var monthSelect = document.getElementById('acct-filter-month');
    if (!yearSelect || !monthSelect) return;

    var res = await supabaseClient.from('accounting_entries').select('entry_date');
    if (res.error) throw res.error;
    var entries = res.data || [];

    var years = new Set();
    var months = new Set();
    entries.forEach(function(e){
      if (e.entry_date) {
        var date = new Date(e.entry_date);
        years.add(date.getFullYear());
        months.add(date.getMonth() + 1);
      }
    });

    var yearOpts = '<option value="">Semua Tahun</option>';
    Array.from(years).sort().reverse().forEach(function(y){
      yearOpts += '<option value="' + y + '">' + y + '</option>';
    });
    yearSelect.innerHTML = yearOpts;

    var monthOpts = '<option value="">Semua Bulan</option>';
    var monthNames = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    Array.from(months).sort(function(a, b){ return a - b; }).forEach(function(m){
      monthOpts += '<option value="' + m + '">' + monthNames[m - 1] + '</option>';
    });
    monthSelect.innerHTML = monthOpts;
  } catch (err) {
    console.error('Error populating filters:', err);
  }
}

async function filterAccountingEntries() {
  var year = document.getElementById('acct-filter-year').value;
  var month = document.getElementById('acct-filter-month').value;
  var tbody = document.getElementById('acct-entries-table-body');
  if (!tbody) return;

  try {
    var query = supabaseClient.from('accounting_entries').select('*');
    
    if (year) {
      query = query.gte('entry_date', year + '-01-01').lte('entry_date', year + '-12-31');
    }
    if (month) {
      var yearFilter = year || new Date().getFullYear();
      var daysInMonth = new Date(yearFilter, month, 0).getDate();
      query = query.gte('entry_date', yearFilter + '-' + String(month).padStart(2, '0') + '-01')
                   .lte('entry_date', yearFilter + '-' + String(month).padStart(2, '0') + '-' + daysInMonth);
    }

    var res = await query.order('entry_date', { ascending: false }).limit(100);
    if (res.error) throw res.error;
    var rows = res.data || [];

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);">Tiada rekod pendapatan.</td></tr>';
      document.getElementById('acct-summary').style.display = 'none';
      return;
    }

    tbody.innerHTML = rows.map(function(e){
      var statusBadge = e.approval_status === 'approved'
        ? '<span style="color:var(--success);font-weight:700;">Diluluskan</span>'
        : (e.approval_status === 'rejected'
          ? '<span style="color:var(--danger);font-weight:700;">Ditolak</span>'
          : '<span style="color:var(--warning);font-weight:700;">Menunggu</span>');
      return '<tr>' +
        '<td style="font-family:var(--mono);">' + e.entry_number + '</td>' +
        '<td>' + e.entry_date + '</td>' +
        '<td>' + e.income_category + (e.income_subcategory ? ' (' + e.income_subcategory + ')' : '') + '</td>' +
        '<td>' + (e.member_name || '—') + '</td>' +
        '<td style="font-family:var(--mono);font-weight:700;">' + Number(e.amount).toLocaleString('en-MY', {minimumFractionDigits:2}) + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td><button class="btn btn-outline btn-sm" onclick="reviewAccountingEntry(' + e.id + ')">Semak</button></td>' +
      '</tr>';
    }).join('');

    var approvedTotal = rows.filter(function(e){ return e.approval_status === 'approved'; })
      .reduce(function(s, e){ return s + Number(e.amount || 0); }, 0);
    var summaryEl = document.getElementById('acct-summary');
    if (summaryEl) {
      summaryEl.style.display = 'block';
      document.getElementById('acct-summary-count').textContent = rows.length;
      document.getElementById('acct-summary-total').textContent = approvedTotal.toLocaleString('en-MY', {minimumFractionDigits:2});
    }
  } catch (err) {
    console.error('Error filtering entries:', err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger);">Ralat memuat rekod.</td></tr>';
  }
}

async function exportAccountingCSV() {
  var year = document.getElementById('acct-filter-year').value;
  var month = document.getElementById('acct-filter-month').value;
  
  try {
    var query = supabaseClient.from('accounting_entries').select('*');
    
    if (year) {
      query = query.gte('entry_date', year + '-01-01').lte('entry_date', year + '-12-31');
    }
    if (month) {
      var yearFilter = year || new Date().getFullYear();
      var daysInMonth = new Date(yearFilter, month, 0).getDate();
      query = query.gte('entry_date', yearFilter + '-' + String(month).padStart(2, '0') + '-01')
                   .lte('entry_date', yearFilter + '-' + String(month).padStart(2, '0') + '-' + daysInMonth);
    }

    var res = await query.order('entry_date', { ascending: true });
    if (res.error) throw res.error;
    var rows = res.data || [];

    if (rows.length === 0) {
      showError('Tiada rekod untuk dieksport');
      return;
    }

    var headers = ['No. Rekod', 'Tarikh', 'Kategori', 'Sub-Kategori', 'Ahli', 'Jumlah (RM)', 'Kaedah Pembayaran', 'No. Rujukan', 'Penerangan', 'Status', 'Diluluskan Oleh', 'Tarikh Kelulusan'];
    var csvContent = headers.join(',') + '\n';

    rows.forEach(function(e){
      var row = [
        e.entry_number,
        e.entry_date,
        e.income_category,
        e.income_subcategory || '',
        e.member_name || '',
        Number(e.amount).toFixed(2),
        e.payment_method || '',
        e.reference_number || '',
        (e.description || e.custom_description || e.property_name || '').replace(/,/g, ' '),
        e.approval_status,
        e.approved_by || '',
        e.approval_date || ''
      ];
      csvContent += row.map(function(cell){ return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',') + '\n';
    });

    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'laporan_perakaunan_' + (year || 'semua') + '_' + (month || 'semua') + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Laporan berjaya dieksport');
  } catch (err) {
    console.error('Error exporting CSV:', err);
    showError('Ralat mengeksport: ' + err.message);
  }
}
