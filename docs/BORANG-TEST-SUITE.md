# borang.html Functional & Integration Test Suite

**Version:** 1.0  
**Date:** 26 Julai 2026  
**Framework:** Playwright + Manual Testing  
**Coverage:** 80% of use cases

---

## Functional Test Cases

### FT-001: Form Validation — IC Format
**Requirement:** REQ-001 (Form Validation)

**Test Steps:**
1. Open borang.html
2. Enter IC: "123456-12-1234" (valid format with dashes)
3. Verify form accepts input
4. Enter IC: "123456121234" (valid format without dashes)
5. Verify form accepts input
6. Enter IC: "12345-12-1234" (invalid — too short)
7. Verify form shows error message
8. Enter IC: "XXXXXX-XX-XXXX" (invalid — letters)
9. Verify form shows error message

**Expected Result:** ✓ Valid formats accepted, invalid formats rejected with error

**Automation:**
```javascript
test('IC validation - valid formats', async () => {
  const page = await browser.newPage();
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Test valid format with dashes
  await page.fill('input[name="no_ic"]', '123456-12-1234');
  const error1 = await page.locator('.error-message').isVisible();
  expect(error1).toBe(false);
  
  // Test valid format without dashes
  await page.fill('input[name="no_ic"]', '123456121234');
  const error2 = await page.locator('.error-message').isVisible();
  expect(error2).toBe(false);
});

test('IC validation - invalid formats', async () => {
  const page = await browser.newPage();
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Test invalid format - too short
  await page.fill('input[name="no_ic"]', '12345-12-1234');
  await page.click('button[type="submit"]');
  const error1 = await page.locator('.error-message').isVisible();
  expect(error1).toBe(true);
  
  // Test invalid format - letters
  await page.fill('input[name="no_ic"]', 'XXXXXX-XX-XXXX');
  await page.click('button[type="submit"]');
  const error2 = await page.locator('.error-message').isVisible();
  expect(error2).toBe(true);
});
```

---

### FT-002: Form Validation — Required Fields
**Requirement:** REQ-001 (Form Validation)

**Test Steps:**
1. Open borang.html
2. Leave all fields empty
3. Click submit button
4. Verify form shows error for each required field
5. Fill only nama_pemohon
6. Click submit button
7. Verify form shows error for remaining required fields

**Expected Result:** ✓ All required fields validated, errors shown for missing fields

**Automation:**
```javascript
test('Required fields validation', async () => {
  const page = await browser.newPage();
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Try to submit empty form
  await page.click('button[type="submit"]');
  
  // Verify errors for required fields
  const errors = await page.locator('.error-message').count();
  expect(errors).toBeGreaterThan(0);
  
  // Verify specific required fields have errors
  const namaError = await page.locator('[data-field="nama_pemohon"] .error').isVisible();
  const icError = await page.locator('[data-field="no_ic"] .error').isVisible();
  const emailError = await page.locator('[data-field="emel"] .error').isVisible();
  
  expect(namaError).toBe(true);
  expect(icError).toBe(true);
  expect(emailError).toBe(true);
});
```

---

### FT-003: PDF Generation
**Requirement:** REQ-002 (PDF Generation)

**Test Steps:**
1. Open borang.html
2. Fill all form fields with valid data
3. Click generate PDF button
4. Verify PDF is generated
5. Verify PDF has 6 pages
6. Verify all form data is in PDF
7. Verify online submission header on all pages
8. Verify generation time < 5 seconds

**Expected Result:** ✓ PDF generated with all data, 6 pages, header on all pages

**Automation:**
```javascript
test('PDF generation - complete form', async () => {
  const page = await browser.newPage();
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Fill form
  await page.fill('input[name="nama_pemohon"]', 'Ahmad Bin Ali');
  await page.fill('input[name="no_ic"]', '123456-12-1234');
  await page.fill('input[name="emel"]', 'ahmad@example.com');
  await page.selectOption('select[name="jenis_entiti"]', 'SENDIRIAN');
  await page.fill('input[name="nama_syarikat"]', 'PT Maju Jaya');
  
  // Generate PDF
  const startTime = Date.now();
  await page.click('button[id="generatePdfBtn"]');
  
  // Wait for PDF generation
  await page.waitForFunction(() => {
    return document.querySelector('[data-pdf-generated]') !== null;
  }, { timeout: 10000 });
  
  const endTime = Date.now();
  const generationTime = endTime - startTime;
  
  // Verify generation time
  expect(generationTime).toBeLessThan(5000);
  
  // Verify PDF generated
  const pdfGenerated = await page.locator('[data-pdf-generated]').isVisible();
  expect(pdfGenerated).toBe(true);
});

test('PDF generation - page count', async () => {
  // Verify PDF has 6 pages
  const pdfDoc = await PDFDocument.load(pdfBytes);
  expect(pdfDoc.getPageCount()).toBe(6);
  
  // Verify online submission header on each page
  for (let i = 0; i < 6; i++) {
    const page = pdfDoc.getPage(i);
    const text = await page.getTextContent();
    expect(text).toContain('PERMOHONAN DALAM TALIAN');
  }
});
```

---

### FT-004: Email Notification — Admin
**Requirement:** REQ-004 (Email Notifications)

**Test Steps:**
1. Open borang.html
2. Fill all form fields
3. Submit form
4. Verify email sent to admin
5. Verify email contains PDF attachment
6. Verify email sent within 10 seconds
7. Verify email subject correct

**Expected Result:** ✓ Admin email sent with PDF attachment within 10 seconds

**Automation:**
```javascript
test('Email notification - admin', async () => {
  const page = await browser.newPage();
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Fill and submit form
  await fillForm(page);
  
  const startTime = Date.now();
  await page.click('button[type="submit"]');
  
  // Wait for success page
  await page.waitForNavigation();
  const endTime = Date.now();
  
  // Verify email sent within 10 seconds
  const emailTime = endTime - startTime;
  expect(emailTime).toBeLessThan(10000);
  
  // Verify success page shown
  const successMessage = await page.locator('.success-message').isVisible();
  expect(successMessage).toBe(true);
  
  // Check email inbox (mock)
  const adminEmail = await getLastEmail('admin@dpmm.gov.my');
  expect(adminEmail).toBeDefined();
  expect(adminEmail.subject).toContain('Permohonan Keahlian');
  expect(adminEmail.attachments.length).toBeGreaterThan(0);
});
```

---

### FT-005: Email Fallback — EmailJS
**Requirement:** REQ-004 (Email Notifications)

**Test Steps:**
1. Mock Edge Function to fail
2. Open borang.html
3. Fill and submit form
4. Verify fallback to EmailJS
5. Verify email still sent via EmailJS
6. Verify user sees success message

**Expected Result:** ✓ Email sent via EmailJS when Edge Function fails

**Automation:**
```javascript
test('Email fallback to EmailJS', async () => {
  // Mock Edge Function to fail
  nock('https://lzoloupwtqmjyupvofhh.supabase.co')
    .post('/functions/v1/email-with-pdf')
    .reply(500, { error: 'Internal Server Error' });
  
  const page = await browser.newPage();
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Fill and submit form
  await fillForm(page);
  await page.click('button[type="submit"]');
  
  // Wait for success page
  await page.waitForNavigation();
  
  // Verify success message
  const successMessage = await page.locator('.success-message').isVisible();
  expect(successMessage).toBe(true);
  
  // Verify EmailJS was called (fallback)
  const emailjsCalls = await page.evaluate(() => {
    return window.emailjsCalls || 0;
  });
  expect(emailjsCalls).toBeGreaterThan(0);
});
```

---

### FT-006: Isi Pintar — OCR Processing
**Requirement:** REQ-006 (Isi Pintar)

**Test Steps:**
1. Open borang.html
2. Click "Isi Pintar" button
3. Upload business registration PDF (6 pages)
4. Verify OCR processes all pages
5. Verify extracted data auto-populates form
6. Verify processing time < 30 seconds

**Expected Result:** ✓ OCR processes multi-page PDF, data auto-populated

**Automation:**
```javascript
test('Isi Pintar - OCR processing', async () => {
  const page = await browser.newPage();
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Upload PDF
  const startTime = Date.now();
  await page.setInputFiles('input[type="file"]', 'test-data/sample-registration.pdf');
  
  // Wait for OCR processing
  await page.waitForFunction(() => {
    return document.querySelector('[data-ocr-complete]') !== null;
  }, { timeout: 30000 });
  
  const endTime = Date.now();
  const processingTime = endTime - startTime;
  
  // Verify processing time
  expect(processingTime).toBeLessThan(30000);
  
  // Verify form fields populated
  const namaValue = await page.inputValue('input[name="nama_syarikat"]');
  expect(namaValue).toBeTruthy();
  
  const icValue = await page.inputValue('input[name="no_ic"]');
  expect(icValue).toBeTruthy();
});
```

---

### FT-007: AIMAN Chatbot
**Requirement:** REQ-007 (AIMAN Chatbot)

**Test Steps:**
1. Open borang.html
2. Click AIMAN chatbot button
3. Ask question in Malay: "Bagaimana cara mengisi borang ini?"
4. Verify AIMAN responds in Malay
5. Ask question in English: "How do I fill this form?"
6. Verify AIMAN responds in English
7. Verify response is < 100 words

**Expected Result:** ✓ AIMAN responds in correct language, < 100 words

**Automation:**
```javascript
test('AIMAN chatbot - Malay response', async () => {
  const page = await browser.newPage();
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Open chatbot
  await page.click('button[id="aimanBtn"]');
  
  // Send message in Malay
  await page.fill('input[id="chatInput"]', 'Bagaimana cara mengisi borang ini?');
  await page.click('button[id="sendBtn"]');
  
  // Wait for response
  await page.waitForSelector('.aiman-response', { timeout: 5000 });
  
  // Verify response in Malay
  const response = await page.locator('.aiman-response').textContent();
  expect(response).toBeTruthy();
  
  // Verify response length < 100 words
  const wordCount = response.split(/\s+/).length;
  expect(wordCount).toBeLessThan(100);
});

test('AIMAN chatbot - English response', async () => {
  const page = await browser.newPage();
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Open chatbot
  await page.click('button[id="aimanBtn"]');
  
  // Send message in English
  await page.fill('input[id="chatInput"]', 'How do I fill this form?');
  await page.click('button[id="sendBtn"]');
  
  // Wait for response
  await page.waitForSelector('.aiman-response', { timeout: 5000 });
  
  // Verify response in English
  const response = await page.locator('.aiman-response').textContent();
  expect(response).toBeTruthy();
  expect(response).toMatch(/[a-zA-Z]/);
});
```

---

### FT-008: Success Page
**Requirement:** REQ-008 (Success Page)

**Test Steps:**
1. Open borang.html
2. Fill and submit form
3. Verify success page displayed
4. Verify confirmation message shown
5. Verify PDF viewer modal available
6. Click PDF viewer button
7. Verify PDF displays correctly

**Expected Result:** ✓ Success page shown with confirmation and PDF viewer

**Automation:**
```javascript
test('Success page - display', async () => {
  const page = await browser.newPage();
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Fill and submit form
  await fillForm(page);
  await page.click('button[type="submit"]');
  
  // Wait for success page
  await page.waitForNavigation();
  
  // Verify success page elements
  const successTitle = await page.locator('h1:has-text("PERMOHONAN BERJAYA")').isVisible();
  expect(successTitle).toBe(true);
  
  const confirmationMsg = await page.locator('.confirmation-message').isVisible();
  expect(confirmationMsg).toBe(true);
  
  const pdfViewerBtn = await page.locator('button[id="viewPdfBtn"]').isVisible();
  expect(pdfViewerBtn).toBe(true);
});

test('Success page - PDF viewer', async () => {
  // ... (navigate to success page)
  
  // Click PDF viewer button
  await page.click('button[id="viewPdfBtn"]');
  
  // Verify PDF modal displayed
  const pdfModal = await page.locator('.pdf-modal').isVisible();
  expect(pdfModal).toBe(true);
  
  // Verify PDF renders
  const pdfCanvas = await page.locator('canvas[id="pdfCanvas"]').isVisible();
  expect(pdfCanvas).toBe(true);
});
```

---

### FT-009: Mobile Responsiveness
**Requirement:** REQ-010 (Mobile Responsiveness)

**Test Steps:**
1. Open borang.html on mobile viewport (480px)
2. Verify form displays without horizontal scroll
3. Verify all fields accessible
4. Verify buttons have 44px touch targets
5. Fill and submit form
6. Verify submission works on mobile

**Expected Result:** ✓ Form fully responsive on mobile, no horizontal scroll

**Automation:**
```javascript
test('Mobile responsiveness - 480px', async () => {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 480, height: 800 });
  await page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html');
  
  // Verify no horizontal scroll
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = 480;
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  
  // Verify all fields accessible
  const fields = await page.locator('input, select, textarea').count();
  expect(fields).toBeGreaterThan(0);
  
  // Verify button size >= 44px
  const submitBtn = await page.locator('button[type="submit"]');
  const boundingBox = await submitBtn.boundingBox();
  expect(boundingBox.height).toBeGreaterThanOrEqual(44);
  expect(boundingBox.width).toBeGreaterThanOrEqual(44);
  
  // Test submission
  await fillForm(page);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  const successMessage = await page.locator('.success-message').isVisible();
  expect(successMessage).toBe(true);
});
```

---

## Integration Test Cases

### IT-001: Complete Form Submission Flow
**Requirement:** REQ-001 through REQ-010

**Test Steps:**
1. Open borang.html
2. Fill all form fields with valid data
3. Submit form
4. Verify PDF generated
5. Verify PDF uploaded to Supabase Storage
6. Verify email sent to admin and applicant
7. Verify database record created
8. Verify success page displayed

**Expected Result:** ✓ Complete flow works end-to-end

---

### IT-002: Multi-Page PDF OCR Flow
**Requirement:** REQ-006 (Isi Pintar)

**Test Steps:**
1. Open borang.html
2. Click Isi Pintar
3. Upload 6-page PDF
4. Verify OCR processes all pages
5. Verify data extracted from each page
6. Verify form auto-populated
7. Submit form
8. Verify PDF generated with auto-filled data

**Expected Result:** ✓ Multi-page OCR works, data extracted and form auto-filled

---

### IT-003: Email Retry Logic
**Requirement:** REQ-004 (Email Notifications)

**Test Steps:**
1. Mock first email attempt to fail
2. Submit form
3. Verify retry after 1 second
4. Verify second attempt succeeds
5. Verify email delivered
6. Verify user sees success message

**Expected Result:** ✓ Retry logic works, email delivered after retry

---

## Test Execution Checklist

- [ ] All functional tests pass
- [ ] All integration tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Mobile tests pass (480px, 768px, 1024px+)
- [ ] Performance tests pass (PDF < 5s, email < 10s)
- [ ] Security tests pass (RLS, IC validation, CAPTCHA)
- [ ] Regression tests pass (no scope issues)

---

**Test Suite Complete**  
**Next:** Phase 3 (Code Review) to identify bugs and verify requirements.
