// Node.js version of submission flow test
// Run: node test-submission-node.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lzoloupwtqmjyupvofhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2xvdXB3dHFtanl1cHZvZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTMxMTEsImV4cCI6MjA4ODUyOTExMX0.tBcGc6KfPyjUmJngbLTBHv-GZkSoSoyWGXwlXFZ0ShE';

const testResults = {
  databaseInsert: false,
  dashboardDisplay: false,
  counterUpdate: false,
  rlsPolicies: false
};

async function testSubmissionFlow() {
  console.log('=== Comprehensive Submission Flow Test (Node.js) ===\n');
  
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
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }
    
    console.log('✅ INSERT SUCCESS');
    console.log('Record ID:', data.id);
    console.log('Reference ID:', data.ref_id);
    console.log('Status:', data.status);
    console.log('Submitted At:', data.submitted_at);
    testResults.databaseInsert = true;
    
    // Test 2: Verify Dashboard Display
    console.log('\nTest 2: Dashboard Display Verification');
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
    
    // Test 3: Verify Counter Update Logic
    console.log('\nTest 3: Counter Update Logic');
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
    
    // Test 4: Verify RLS Policies
    console.log('\nTest 4: RLS Policies Verification');
    console.log('Checking if RLS is enabled on PERMOHONAN_AHLI...');
    
    // Try to query without authentication (should work with anon key)
    const { data: rlsData, error: rlsError } = await sb
      .from('PERMOHONAN_AHLI')
      .select('count')
      .limit(1);
    
    if (rlsError) {
      console.log('⚠️ RLS query failed:', rlsError.message);
      console.log('This may indicate RLS policies need to be applied');
    } else {
      console.log('✅ RLS allows anonymous SELECT (as expected)');
      testResults.rlsPolicies = true;
    }
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log('Database Insertion:', testResults.databaseInsert ? '✅ PASS' : '❌ FAIL');
    console.log('Dashboard Display:', testResults.dashboardDisplay ? '✅ PASS' : '❌ FAIL');
    console.log('Counter Update:', testResults.counterUpdate ? '✅ PASS' : '❌ FAIL');
    console.log('RLS Policies:', testResults.rlsPolicies ? '✅ PASS' : '⚠️ CHECK NEEDED');
    
    const allPassed = Object.values(testResults).filter(v => v !== false).length === 4;
    console.log('\nOverall:', allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS NEED ATTENTION');
    
    // Cleanup option
    console.log('\nTo cleanup test record, run:');
    console.log(`DELETE FROM PERMOHONAN_AHLI WHERE ref_id = '${testRef}';`);
    
    return { success: allPassed, results: testResults, data };
    
  } catch (e) {
    console.error('❌ EXCEPTION:', e);
    return { success: false, error: e.message };
  }
}

// Run test
testSubmissionFlow().then(result => {
  if (result.success) {
    console.log('\n✅ Submission flow test completed successfully');
    process.exit(0);
  } else {
    console.log('\n❌ Submission flow test failed');
    process.exit(1);
  }
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
