// Test script: Verify submission flow inserts into PERMOHONAN_AHLI
// Run this in browser console on borang.html page

const SUPABASE_URL = 'https://lzoloupwtqmjyupvofhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2xvdXB3dHFtanl1cHZvZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTMxMTEsImV4cCI6MjA4ODUyOTExMX0.tBcGc6KfPyjUmJngbLTBHv-GZkSoSoyWGXwlXFZ0ShE';

async function testSubmissionFlow() {
  console.log('=== Testing Submission Flow ===');
  
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
    proksi_ic: '901010-01-5555',
    proksi_jawatan: 'Pengurus',
    proksi_hp: '0123456789',
    proksi_emel: 'test-flow@example.com',
    nama_lengkap_pemohon: 'Test User',
    no_kad_pengenal: '901010-01-5555',
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
    
    // Acknowledgments
    akuan_maklumat_benar: true,
    akuan_fi_tidak_pulang: true,
    akuan_pdpa: true,
    akuan_maklumat_palsu: true,
    akuan_penafian_kelulusan: true
  };
  
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
    
    // Check audit log
    console.log('\nChecking audit log...');
    const { data: auditData, error: auditError } = await sb
      .from('dpmm_audit_log_enhanced')
      .select('*')
      .eq('table_name', 'PERMOHONAN_AHLI')
      .eq('record_id', data.id.toString())
      .single();
    
    if (auditError) {
      console.warn('⚠️ Audit log check failed (may not have trigger):', auditError.message);
    } else if (auditData) {
      console.log('✅ Audit log found');
      console.log('Action:', auditData.action);
      console.log('Created At:', auditData.created_at);
    } else {
      console.warn('⚠️ No audit log found for this record');
    }
    
    // Cleanup option
    console.log('\nTo cleanup, run:');
    console.log(`await sb.from('PERMOHONAN_AHLI').delete().eq('ref_id', '${testRef}');`);
    
    return { success: true, data };
    
  } catch (e) {
    console.error('❌ EXCEPTION:', e);
    return { success: false, error: e.message };
  }
}

// Auto-run
testSubmissionFlow();
