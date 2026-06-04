// Test script: Verify form submission works for all fasal types
// This directly tests the Supabase backend to verify all fasal values are accepted

const SUPABASE_URL = 'https://lzoloupwtqmjyupvofhh.supabase.co';
// Note: This script requires the SUPABASE_KEY to be set in environment

// All fasal values from FASAL_DATA
const ALL_FASALS = [
  // Ahli Biasa (A)
  { fasal: '6.2.1',  jenis: 'A', label: 'Individu/Pemunya Tunggal', daftar: 50, tahunan: 50 },
  { fasal: '6.2.2',  jenis: 'A', label: 'Perniagaan Berlesen Kerajaan', daftar: 50, tahunan: 50 },
  { fasal: '6.2.3a', jenis: 'A', label: 'Profesional Berdaftar', daftar: 200, tahunan: 150 },
  { fasal: '6.2.3b', jenis: 'A', label: 'Pengarah/Ketua Eksekutif', daftar: 200, tahunan: 150 },
  { fasal: '6.2.4',  jenis: 'A', label: 'Syarikat Kerajaan 100%', daftar: 200, tahunan: 150 },
  { fasal: '6.2.5',  jenis: 'A', label: 'Syarikat Melayu 100%', daftar: 200, tahunan: 150 },
  { fasal: '6.2.6',  jenis: 'A', label: 'Koperasi Melayu 100%', daftar: 200, tahunan: 150 },
  // Ahli Bersekutu (S)
  { fasal: '6.3.1',  jenis: 'S', label: 'Bumiputera Berlesen', daftar: 500, tahunan: 100 },
  { fasal: '6.3.2',  jenis: 'S', label: 'Perbadanan Akta/Enakmen', daftar: 1000, tahunan: 1000 },
  { fasal: '6.3.3',  jenis: 'S', label: 'Perbadanan 51% Melayu', daftar: 1000, tahunan: 1000 },
  { fasal: '6.3.4',  jenis: 'S', label: 'Syarikat Awam 30% Melayu', daftar: 1000, tahunan: 1000 },
  { fasal: '6.3.5',  jenis: 'S', label: 'Warganegara Islam', daftar: 1000, tahunan: 1000 },
  { fasal: '6.3.6',  jenis: 'S', label: 'Ahli Kelab Wanita/Pemuda', daftar: 10, tahunan: 10 },
  // Ahli Bergabung (G)
  { fasal: '6.4.1',  jenis: 'G', label: 'Persatuan Kebangsaan', daftar: 1000, tahunan: 500 },
  { fasal: '6.4.2',  jenis: 'G', label: 'Persatuan Negeri', daftar: 500, tahunan: 250 },
  // Ahli Kehormat (H)
  { fasal: '6.5.1',  jenis: 'H', label: 'Ahli Kehormat Dewan', daftar: 0, tahunan: 0 },
  { fasal: '6.5.2',  jenis: 'H', label: 'Ahli Kehormat JKP', daftar: 0, tahunan: 0 },
];

const JENIS_LABEL = { A: 'Ahli Biasa', S: 'Ahli Bersekutu', G: 'Ahli Bergabung', H: 'Ahli Kehormat' };

async function testAllFasals() {
  const key = typeof CONFIG !== 'undefined' ? CONFIG.SUPABASE_KEY : '';
  if (!key) {
    console.error('SUPABASE_KEY not available. Run this in browser console on a page with config-local.js loaded.');
    return;
  }

  const { createClient } = supabase;
  const sb = createClient(SUPABASE_URL, key);

  const results = [];
  const now = new Date().toISOString();

  for (const f of ALL_FASALS) {
    const refId = `TEST/FASAL/${f.fasal}/${Date.now()}`;
    const payload = {
      ref_id: refId,
      jenis_keahlian: f.jenis,
      jenis_keahlian_label: JENIS_LABEL[f.jenis],
      fasal: f.fasal,
      yuran_daftar: f.daftar,
      yuran_tahunan: f.tahunan,
      jenis_entiti: 'test',
      sektor: 'test',
      industri: ['test'],
      nama_entiti: `Test Fasal ${f.fasal}`,
      no_pendaftaran: 'TEST123',
      alamat: 'Test Address',
      poskod: '80000',
      bandar: 'Johor Bahru',
      negeri: 'Johor',
      nama_proksi: 'Test User',
      no_ic: 'TEST-IC-123',
      jawatan: 'Test',
      no_hp: '0123456789',
      emel: 'test@example.com',
      status: 'MOHON_BARU',
      submitted_at: now,
      client_ip: '127.0.0.1',
      user_agent: 'TestScript/1.0',
      dokumen_urls: {},
    };

    try {
      const { data, error } = await sb.from('PERMOHONAN_AHLI').insert([payload]).select().single();
      if (error) {
        results.push({ fasal: f.fasal, status: 'FAIL', error: error.message });
      } else {
        results.push({ fasal: f.fasal, status: 'PASS', ref: data.ref_id });
      }
    } catch (e) {
      results.push({ fasal: f.fasal, status: 'FAIL', error: e.message });
    }
  }

  console.table(results);

  // Cleanup: delete test records
  console.log('\nCleaning up test records...');
  for (const r of results) {
    if (r.status === 'PASS') {
      await sb.from('PERMOHONAN_AHLI').delete().eq('ref_id', r.ref);
    }
  }
  console.log('Cleanup complete.');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`\nRESULT: ${passed}/${ALL_FASALS.length} fasals passed, ${failed} failed`);

  return results;
}

// Run if executed directly
if (typeof window !== 'undefined') {
  testAllFasals();
}
