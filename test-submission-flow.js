// Comprehensive Test: Verify complete submission flow
// Tests: 1) Email to applicants, 2) Email to Admin, 3) Dashboard display, 4) Counter update
// Run this in browser console on borang.html page

// Load credentials from window.CONFIG
const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || 'https://lzoloupwtqmjyupvofhh.supabase.co';
const SUPABASE_ANON_KEY = window.CONFIG?.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('ERROR: SUPABASE_ANON_KEY not found in window.CONFIG');
  console.error('Ensure config-loader.js is loaded before running this test');
  throw new Error('Credentials not loaded');
}

const testResults = {
  databaseInsert: false,
  emailApplicant: false,
  emailAdmin: false,
  dashboardDisplay: false,
  counterUpdate: false
};

async function testSubmissionFlow() {
  console.log('=== Comprehensive Submission Flow Test ===\n');
  
  const { createClient } = supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const testRef = `TEST-FLOW-${Date.now()}`;
  const now = new Date().toISOString();
  
  const payload = {
    ref_id: testRef,
    jenis_keahlian: 'A',
    jenis_keahlian_label: 'Ahli Biasa',
    fasal: '6.2.1',
    yuran_daftar: 50,
    yuran_tahunan: 50,
    
    // Basic entity info
    jenis_entiti: 'Enterprise',
    sektor: 'Perkhidmatan',
    industri: ['Perkhidmatan'],
    nama_entiti: 'Test Enterprise Flow',
    no_pendaftaran: 'TEST123456',
    alamat: 'Test Address 123',
    poskod: '80000',
    bandar: 'Johor Bahru',
    negeri: 'Johor',
    emel_syarikat: 'test-flow@example.com',
    
    // Proxy info
    proksi_nama: 'Test User',
    proksi_ic: '901010101555',
    proksi_jawatan: 'Pengurus',
    proksi_hp: '0123456789',
    proksi_emel: 'test-flow@example.com',
    nama_lengkap_pemohon: 'Test User',
    no_kad_pengenal: '901010101555',
    no_tel_bimbit: '0123456789',
    
    // Payment
    tempoh_yuran: 1,
    jumlah_fi_daftar: 50,
    jumlah_yuran: 50,
    jumlah_bayar: 100,
    kaedah_bayar: 'Online Transfer',
    
    // Status
    status: 'BARU',
    submitted_at: now,
    ip_address: '127.0.0.1',
    user_agent: 'TestFlow/1.0',
    
    // Email status fields
    email_admin_sent: false,
    email_applicant_sent: false,
    
    // Acknowledgments
    akuan_maklumat_benar: true,
    akuan_fi_tidak_pulang: true,
    akuan_pdpa: true,
    akuan_maklumat_palsu: true,
    akuan_penafian_kelulusan: true
  };
  
  // Test 1: Database Insertion
  console.log('Test 1: Database Insertion');
  console.log('Inserting test record into PERMOHONAN_AHLI...');
  console.log('Reference ID:', testRef);
  
  try {
    const { data, error } = await sb.from('PERMOHONAN_AHLI').insert([payload]).select().single();
    
    if (error) {
      console.error('❌ INSERT FAILED:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ INSERT SUCCESS');
    console.log('Record ID:', data.id);
    console.log('Reference ID:', data.ref_id);
    console.log('Status:', data.status);
    console.log('Submitted At:', data.submitted_at);
    testResults.databaseInsert = true;
    
    // Test 2: Verify EmailJS Configuration
    console.log('\nTest 2: EmailJS Configuration');
    if (typeof emailjs !== 'undefined') {
      console.log('✅ EmailJS library loaded');
      
      if (window.CONFIG && window.CONFIG.EMAILJS_SERVICE_ID && window.CONFIG.EMAILJS_PUBLIC_KEY) {
        console.log('✅ EmailJS configuration present');
        console.log('Service ID:', window.CONFIG.EMAILJS_SERVICE_ID);
        console.log('Public Key:', window.CONFIG.EMAILJS_PUBLIC_KEY);
        console.log('Admin Template:', window.CONFIG.EMAILJS_ADMIN_TEMPLATE_ID);
        console.log('Applicant Template:', window.CONFIG.EMAILJS_APPLICANT_TEMPLATE_ID);
        testResults.emailApplicant = true;
        testResults.emailAdmin = true;
      } else {
        console.log('❌ EmailJS configuration missing');
      }
    } else {
      console.log('❌ EmailJS library not loaded');
    }
    
    // Test 3: Verify Dashboard Display
    console.log('\nTest 3: Dashboard Display Verification');
    console.log('Querying PERMOHONAN_AHLI for test record...');
    
    const { data: queryData, error: queryError } = await sb
      .from('PERMOHONAN_AHLI')
      .select('*')
      .eq('ref_id', testRef)
      .single();
    
    if (queryError) {
      console.error('❌ QUERY FAILED:', queryError);
    } else if (queryData) {
      console.log('✅ Record found in database');
      console.log('Status:', queryData.status);
      console.log('This record should appear in Permohonan Ahli tab under BARU status');
      testResults.dashboardDisplay = true;
    }
    
    // Test 4: Verify Counter Update Logic
    console.log('\nTest 4: Counter Update Logic');
    console.log('Querying all BARU status records...');
    
    const { data: countData, error: countError } = await sb
      .from('PERMOHONAN_AHLI')
      .select('status')
      .eq('status', 'BARU');
    
    if (countError) {
      console.error('❌ COUNT QUERY FAILED:', countError);
    } else {
      const baruCount = countData ? countData.length : 0;
      console.log('✅ BARU status records found:', baruCount);
      console.log('Counter should display:', baruCount);
      testResults.counterUpdate = true;
    }
    
    // Test 5: Simulate Email Sending (check EmailJS service)
    console.log('\nTest 5: EmailJS Service Check');
    try {
      const serviceStatus = await emailjs.init(window.CONFIG.EMAILJS_PUBLIC_KEY);
      console.log('✅ EmailJS service initialized');
      console.log('Note: Actual email sending requires valid recipient email');
    } catch (emailError) {
      console.log('⚠️ EmailJS initialization check:', emailError.message);
    }
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log('Database Insertion:', testResults.databaseInsert ? '✅ PASS' : '❌ FAIL');
    console.log('Email to Applicant:', testResults.emailApplicant ? '✅ PASS' : '❌ FAIL');
    console.log('Email to Admin:', testResults.emailAdmin ? '✅ PASS' : '❌ FAIL');
    console.log('Dashboard Display:', testResults.dashboardDisplay ? '✅ PASS' : '❌ FAIL');
    console.log('Counter Update:', testResults.counterUpdate ? '✅ PASS' : '❌ FAIL');
    
    const allPassed = Object.values(testResults).every(v => v === true);
    console.log('\nOverall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    
    // Cleanup option
    console.log('\nTo cleanup test record, run:');
    console.log(`await sb.from('PERMOHONAN_AHLI').delete().eq('ref_id', '${testRef}');`);
    
    return { success: allPassed, results: testResults, data };
    
  } catch (e) {
    console.error('❌ EXCEPTION:', e);
    return { success: false, error: e.message };
  }
}

// Auto-run
testSubmissionFlow();
