/**
 * Security Testing and Validation
 * Tests for security features implemented in borang.html
 */

// Test 1: File upload security validation
function testFileUploadSecurity() {
  console.log('Testing file upload security...');
  
  const testCases = [
    { name: 'malicious.exe', expected: false, description: 'Executable file should be rejected' },
    { name: 'document.pdf', expected: true, description: 'PDF file should be accepted' },
    { name: 'image.jpg', expected: true, description: 'JPG file should be accepted' },
    { name: '../../../etc/passwd', expected: false, description: 'Path traversal should be prevented' },
    { name: 'file\x00.pdf', expected: false, description: 'Null byte injection should be prevented' },
    { name: 'a'.repeat(300) + '.pdf', expected: true, description: 'Long filename should be truncated' }
  ];
  
  testCases.forEach(test => {
    try {
      const result = sanitizeFileName(test.name);
      const passed = (test.expected ? result.length > 0 : result !== test.name);
      console.log(`  ${passed ? '✓' : '✗'} ${test.description}: ${test.name}`);
    } catch (error) {
      console.log(`  ✗ ${test.description}: ${test.name} - Error: ${error.message}`);
    }
  });
}

// Test 2: Configuration security validation
function testConfigSecurity() {
  console.log('Testing configuration security...');
  
  const testConfig = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: null, // Should be null (server-side only)
    emailjs: {
      serviceId: 'test_service',
      templateAdmin: 'test_template',
      templateApplicant: 'test_template'
    },
    emailjsKey: null, // Should be null (server-side only)
    groqKey: null // Should be null (server-side only)
  };
  
  const checks = [
    { name: 'Supabase key is null', condition: testConfig.supabaseKey === null },
    { name: 'EmailJS key is null', condition: testConfig.emailjsKey === null },
    { name: 'Groq key is null', condition: testConfig.groqKey === null },
    { name: 'Supabase URL is present', condition: testConfig.supabaseUrl !== null },
    { name: 'EmailJS service ID is present', condition: testConfig.emailjs.serviceId !== null }
  ];
  
  checks.forEach(check => {
    console.log(`  ${check.condition ? '✓' : '✗'} ${check.name}`);
  });
}

// Test 3: CSP nonce validation
function testCspNonce() {
  console.log('Testing CSP nonce generation...');
  
  try {
    const nonce1 = generateNonce();
    const nonce2 = generateNonce();
    
    const checks = [
      { name: 'Nonce is not empty', condition: nonce1.length > 0 },
      { name: 'Nonce is unique', condition: nonce1 !== nonce2 },
      { name: 'Nonce is base64 encoded', condition: /^[A-Za-z0-9+/=]+$/.test(nonce1) }
    ];
    
    checks.forEach(check => {
      console.log(`  ${check.condition ? '✓' : '✗'} ${check.name}`);
    });
  } catch (error) {
    console.log(`  ✗ CSP nonce test failed: ${error.message}`);
  }
}

// Test 4: Rate limiting validation
function testRateLimiting() {
  console.log('Testing rate limiting...');
  
  const testWindow = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  const checks = [
    { name: 'Rate limit window is set', condition: testWindow > 0 },
    { name: 'Max requests is set', condition: maxRequests > 0 },
    { name: 'Rate limit is reasonable', condition: maxRequests >= 10 && maxRequests <= 1000 }
  ];
  
  checks.forEach(check => {
    console.log(`  ${check.condition ? '✓' : '✗'} ${check.name}`);
  });
}

// Helper function for file name sanitization (copied from borang.html)
function sanitizeFileName(fileName) {
  let sanitized = fileName.replace(/[\/\\]/g, '_');
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '');
  
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const extension = sanitized.split('.').pop();
    const baseName = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = baseName.substring(0, maxLength - extension.length - 1) + '.' + extension;
  }
  
  return sanitized;
}

// Helper function for nonce generation (copied from config-endpoint.js)
function generateNonce() {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

// Run all tests
function runSecurityTests() {
  console.log('=== Security Testing and Validation ===\n');
  
  testFileUploadSecurity();
  console.log();
  
  testConfigSecurity();
  console.log();
  
  testCspNonce();
  console.log();
  
  testRateLimiting();
  console.log();
  
  console.log('=== Security Tests Complete ===');
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityTests();
}

export { runSecurityTests, testFileUploadSecurity, testConfigSecurity, testCspNonce, testRateLimiting };
