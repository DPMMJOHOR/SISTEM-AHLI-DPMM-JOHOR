from playwright.sync_api import sync_playwright
import time
import os

def test_borang_email_fixes():
    """Test the email system fixes on the local borang.html file"""
    
    # Get the absolute path to borang.html
    script_dir = os.path.dirname(os.path.abspath(__file__))
    borang_path = os.path.join(script_dir, 'borang.html')
    
    if not os.path.exists(borang_path):
        print(f"❌ borang.html not found at: {borang_path}")
        return
    
    print(f"Testing local file: {borang_path}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        # Navigate to the local file
        print("Navigating to local borang.html...")
        page.goto(f'file:///{borang_path}')
        page.wait_for_load_state('domcontentloaded')
        
        # Take initial screenshot
        page.screenshot(path='test-screenshots/01-initial.png', full_page=True)
        print("Screenshot saved: 01-initial.png")
        
        # Capture console logs
        console_messages = []
        def handle_console(msg):
            console_messages.append({
                'type': msg.type,
                'text': msg.text,
                'location': msg.location
            })
            print(f"[CONSOLE {msg.type}] {msg.text}")
        
        page.on('console', handle_console)
        
        # Test 1: Check if email validation works when no email provided
        print("\n=== Test 1: Email Validation Without Email ===")
        
        # Try to navigate through form without email
        # This is a basic smoke test - full form submission would require more data
        
        # Look for email input field
        try:
            email_input = page.locator('#emel_syarikat')
            if email_input.is_visible():
                print("✅ Email input field found")
                
                # Try to proceed without email (this should fail validation)
                # Note: This is a simplified test - actual form submission requires all fields
                
            else:
                print("❌ Email input field not visible")
        except Exception as e:
            print(f"Error checking email field: {e}")
        
        # Test 2: Check for diagnostic logging capability
        print("\n=== Test 2: Diagnostic Logging Check ===")
        
        # Look for the isValidEmail function in the page
        has_validation = page.evaluate('''() => {
            return typeof isValidEmail !== 'undefined';
        }''')
        
        if has_validation:
            print("✅ isValidEmail function is defined")
        else:
            print("❌ isValidEmail function not found")
        
        # Test 3: Check for sendEmailsInBackground removal
        print("\n=== Test 3: Duplicate Email Fix Check ===")
        
        # Check if the function still exists in the page
        has_function = page.evaluate('''() => {
            return typeof sendEmailsInBackground !== 'undefined';
        }''')
        
        if has_function:
            print("⚠️  sendEmailsInBackground function still exists (should be unused)")
        else:
            print("✅ sendEmailsInBackground function removed")
        
        # Test 4: Check Tab 7 display logic
        print("\n=== Test 4: Tab 7 Display Logic Check ===")
        
        # Try to find the ringkasan-grid element
        try:
            ringkasan_grid = page.locator('#ringkasan-grid')
            if ringkasan_grid.is_visible():
                print("✅ Ringkasan grid found")
            else:
                print("⚠️  Ringkasan grid not visible (need to complete form first)")
        except Exception as e:
            print(f"Error checking ringkasan grid: {e}")
        
        # Wait a bit to capture any console messages
        time.sleep(2)
        
        # Print summary of console messages
        print("\n=== Console Messages Summary ===")
        diagnostic_logs = [msg for msg in console_messages if 'DIAGNOSTIC' in msg['text']]
        print(f"Total console messages: {len(console_messages)}")
        print(f"Diagnostic logs found: {len(diagnostic_logs)}")
        
        if diagnostic_logs:
            print("\nDiagnostic log samples:")
            for log in diagnostic_logs[:5]:  # Show first 5
                print(f"  - {log['text']}")
        
        # Take final screenshot
        page.screenshot(path='test-screenshots/02-final.png', full_page=True)
        print("Screenshot saved: 02-final.png")
        
        browser.close()
        
        print("\n=== Test Summary ===")
        print("Basic smoke test completed.")
        print("For full email testing, manual form submission is required.")
        print("See test-verification-steps.md for detailed manual testing instructions.")

if __name__ == '__main__':
    test_borang_email_fixes()
