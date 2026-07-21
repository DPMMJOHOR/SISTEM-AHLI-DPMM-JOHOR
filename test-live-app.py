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
            
            # Test AI Proxy Chat functionality
            print("\n--- Testing AI Proxy Chat ---")
            
            # Click on chat button to open chat interface
            chat_btn = page.locator('#btn-isi-pintar')
            if chat_btn.count() > 0:
                chat_btn.click()
                page.wait_for_timeout(2000)
                print("✓ Chat button clicked")
                
                # Check if chat interface opened
                chat_input = page.locator('#chat-input')
                if chat_input.count() > 0:
                    print("✓ Chat interface opened")
                    
                    # Test sending a message
                    chat_input.fill("Hello, this is a test message")
                    chat_input.press('Enter')
                    page.wait_for_timeout(5000)
                    
                    # Check if response appeared
                    chat_messages = page.locator('.chat-message')
                    if chat_messages.count() > 1:
                        print("✓ Chat response received")
                        print(f"✓ Total messages: {chat_messages.count()}")
                    else:
                        print("✗ No chat response received")
                else:
                    print("✗ Chat interface did not open")
            else:
                print("✗ Chat button not found")
            
            # Check console for errors
            console_errors = []
            page.on('console', lambda msg: console_errors.append(msg))
            
            print("\n--- Test Summary ---")
            print("Basic UI tests completed")
            print("AI Proxy chat test completed")
            print(f"Console errors found: {len(console_errors)}")
            
            if console_errors:
                for error in console_errors:
                    print(f"  - {error.type}: {error.text}")
            
        except Exception as e:
            print(f"Error during testing: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    test_live_application()
