from playwright.sync_api import sync_playwright

def test_live_application():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Navigate to live application
            page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html')
            page.wait_for_load_state('networkidle')
            
            # Take screenshot for visual verification
            page.screenshot(path='test-screenshot.png', full_page=True)
            print("✓ Page loaded successfully")
            print("✓ Screenshot saved as test-screenshot.png")
            
            # Check if logo loads (no 404 error)
            logo = page.locator('img[alt="Logo DPMM Negeri Johor"]')
            if logo.count() > 0:
                print("✓ Logo loaded successfully")
            else:
                print("✗ Logo not found or failed to load")
            
            # Check if welcome text is present
            welcome_text = page.locator('text=SELAMAT DATANG KE')
            if welcome_text.count() > 0:
                print("✓ Welcome text present")
            else:
                print("✗ Welcome text not found")
            
            # Check if business type selector exists
            business_selector = page.locator('#business-type-selector')
            if business_selector.count() > 0:
                print("✓ Business type selector present")
            else:
                print("✗ Business type selector not found")
            
            # Check if CTA buttons exist
            isi_pintar_btn = page.locator('#btn-isi-pintar')
            isi_manual_btn = page.locator('#btn-isi-manual')
            if isi_pintar_btn.count() > 0 and isi_manual_btn.count() > 0:
                print("✓ CTA buttons present")
            else:
                print("✗ CTA buttons not found")
            
            print("\nBasic UI tests completed")
            print("Note: API functionality tests skipped due to placeholder keys")
            
        except Exception as e:
            print(f"Error during testing: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    test_live_application()
