// Test script for EmailJS email endpoint
// Using native fetch (Node.js 18+)

async function testEmailEndpoint() {
  try {
    const response = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'admin',
        toEmail: 'dpmmnj.pengurusan@gmail.com',
        data: {
          ref_id: 'TEST-EMAILJS-001',
          jenis: 'Ahli Biasa (A)',
          fasal: '6.2.1',
          nama_entiti: 'Test Enterprise Sdn Bhd',
          proksi_nama: 'Test User',
          proksi_hp: '0123456789',
          proksi_emel: 'test@example.com',
          jumlah: 'RM 100',
          pesan: '[TEST EMAILJS] This is a test email from the new EmailJS integration.',
          html: '<h2>Test Email - EmailJS Integration</h2><p>This is a test email from the EmailJS integration verification.</p>'
        }
      })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ EmailJS endpoint test PASSED');
    } else {
      console.log('❌ EmailJS endpoint test FAILED');
    }
  } catch (error) {
    console.error('❌ EmailJS endpoint test ERROR:', error.message);
  }
}

testEmailEndpoint();
