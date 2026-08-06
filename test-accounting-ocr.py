from playwright.sync_api import sync_playwright
import time

def test_accounting_ocr():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        # Open live GitHub Pages URL
        page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/index.html')
        page.wait_for_load_state('networkidle')
        
        # Take initial screenshot
        page.screenshot(path='test-screenshots/01-initial-load.png')
        
        # Login (if needed)
        try:
            page.fill('input[type="password"]', 'admin123')
            page.click('button:has-text("Log Masuk")')
            page.wait_for_timeout(2000)
            page.screenshot(path='test-screenshots/02-after-login.png')
        except:
            print("Login not required or already logged in")
        
        # Navigate to accounting section
        try:
            page.click('text=PERAKAUNAN')
            page.wait_for_timeout(1000)
            page.screenshot(path='test-screenshots/03-accounting-tab.png')
        except:
            print("Could not find PERAKAUNAN tab, trying alternative selector")
            page.screenshot(path='test-screenshots/03-accounting-tab-error.png')
        
        # Test OCR library loading
        console_logs = []
        page.on('console', lambda msg: console_logs.append(msg.text))
        
        # Check if Tesseract and pdfjsLib are loaded
        library_check = page.evaluate('''() => {
            return {
                tesseract: typeof Tesseract !== 'undefined',
                pdfjsLib: typeof pdfjsLib !== 'undefined'
            };
        }''')
        
        print("Library Check:", library_check)
        
        # Try to find upload zone
        try:
            upload_zone = page.locator('#acct-upload-zone, .upload-zone').first
            if upload_zone.count() > 0:
                print("Found upload zone")
                page.screenshot(path='test-screenshots/04-upload-zone.png')
                
                # Upload APRIL 2026.pdf
                file_input = page.locator('input[type="file"]').first
                file_input.set_input_files('c:/Users/DELL/Documents/GitHub/SISTEM-AHLI-DPMM-JOHOR/APRIL 2026.pdf')
                
                # Wait for OCR processing
                page.wait_for_timeout(10000)
                page.screenshot(path='test-screenshots/05-after-upload.png')
                
                # Check console logs for OCR output
                print("Console Logs:", console_logs[-10:])
                
                # Check if fields were filled
                amount_value = page.evaluate('''() => {
                    const el = document.getElementById('acct-entry-amount');
                    return el ? el.value : null;
                }''')
                
                date_value = page.evaluate('''() => {
                    const el = document.getElementById('acct-entry-date');
                    return el ? el.value : null;
                }''')
                
                print("OCR Results - Amount:", amount_value, "Date:", date_value)
                
            else:
                print("Upload zone not found")
        except Exception as e:
            print(f"Error during upload test: {e}")
            page.screenshot(path='test-screenshots/04-upload-error.png')
        
        browser.close()
        
        return {
            libraries_loaded: library_check,
            console_logs: console_logs,
            test_completed: True
        }

if __name__ == '__main__':
    import os
    os.makedirs('test-screenshots', exist_ok=True)
    result = test_accounting_ocr()
    print("Test Result:", result)
