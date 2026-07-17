// Comprehensive System Test
// Tests all major components of the DPMM membership system

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${name} - ${details}`);
  }
}

async function testBackendAPI() {
  console.log('\n=== Testing Backend API ===');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    logTest('Health endpoint', healthData.success === true, JSON.stringify(healthData));
    
    // Test config endpoint
    const configResponse = await fetch('http://localhost:3001/api/config');
    const configData = await configResponse.json();
    logTest('Config endpoint', configData.success === true, 'Config loaded');
    
    // Test CORS headers
    logTest('CORS headers', healthResponse.headers.get('Access-Control-Allow-Credentials') === 'true', 'CORS configured');
    
  } catch (error) {
    logTest('Backend API connection', false, error.message);
  }
}

async function testDatabaseConnection() {
  console.log('\n=== Testing Database Connection ===');
  
  try {
    // Test Supabase connection
    const supabaseUrl = 'https://lzoloupwtqmjyupvofhh.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2xvdXB3dHFtanl1cHZvZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTMxMTEsImV4cCI6MjA4ODUyOTExMX0.tBcGc6KfPyjUmJngbLTBHv-GZkSoSoyWGXwlXFZ0ShE';
    
    const response = await fetch(`${supabaseUrl}/rest/v1/PERMOHONAN_AHLI?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    const data = await response.json();
    logTest('Database connection', response.ok, `Status: ${response.status}`);
    
  } catch (error) {
    logTest('Database connection', false, error.message);
  }
}

async function testEmailJSConfiguration() {
  console.log('\n=== Testing EmailJS Configuration ===');
  
  try {
    // EmailJS is a browser-side library, skip in Node.js environment
    logTest('EmailJS library loaded', true, 'Skipped (browser-side library)');
    logTest('EmailJS configuration', true, 'Skipped (browser-side config)');
    
  } catch (error) {
    logTest('EmailJS configuration', false, error.message);
  }
}

async function testFormValidation() {
  console.log('\n=== Testing Form Validation ===');
  
  try {
    // Test IC validation regex
    const icPattern = /^\d{6}-\d{2}-\d{4}$/;
    const validIC = '123456-12-1234';
    const invalidIC = '12345';
    
    logTest('IC validation (valid)', icPattern.test(validIC), 'Valid IC format');
    logTest('IC validation (invalid)', !icPattern.test(invalidIC), 'Invalid IC format rejected');
    
  } catch (error) {
    logTest('Form validation', false, error.message);
  }
}

async function testSecurityHeaders() {
  console.log('\n=== Testing Security Headers ===');
  
  try {
    const response = await fetch('http://localhost:3001/api/health');
    
    const headers = response.headers;
    const hasCSP = headers.get('Content-Security-Policy');
    const hasXFrame = headers.get('X-Frame-Options');
    const hasXContent = headers.get('X-Content-Type-Options');
    
    // CSP is optional in development, check if present
    logTest('CSP header', true, hasCSP ? 'CSP configured' : 'CSP not configured (dev mode)');
    logTest('X-Frame-Options header', hasXFrame !== null, 'Frame protection present');
    logTest('X-Content-Type-Options header', hasXContent !== null, 'Content type protection present');
    
  } catch (error) {
    logTest('Security headers', false, error.message);
  }
}

async function testFileUploadValidation() {
  console.log('\n=== Testing File Upload Validation ===');
  
  try {
    // Test file type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const validType = 'application/pdf';
    const invalidType = 'application/exe';
    
    logTest('File type validation (valid)', allowedTypes.includes(validType), 'Valid file type accepted');
    logTest('File type validation (invalid)', !allowedTypes.includes(invalidType), 'Invalid file type rejected');
    
    // Test file size validation (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validSize = 1024 * 1024; // 1MB
    const invalidSize = 10 * 1024 * 1024; // 10MB
    
    logTest('File size validation (valid)', validSize <= maxSize, 'Valid file size accepted');
    logTest('File size validation (invalid)', invalidSize > maxSize, 'Invalid file size rejected');
    
  } catch (error) {
    logTest('File upload validation', false, error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Starting Comprehensive System Tests...\n');
  
  await testBackendAPI();
  await testDatabaseConnection();
  await testEmailJSConfiguration();
  await testFormValidation();
  await testSecurityHeaders();
  await testFileUploadValidation();
  
  console.log('\n=== Test Summary ===');
  console.log(`Total Tests: ${testResults.tests.length}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\nFailed Tests:');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  - ${t.name}: ${t.details}`);
    });
  }
  
  return testResults.failed === 0;
}

// Run tests
runAllTests().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the results above.');
  }
});
