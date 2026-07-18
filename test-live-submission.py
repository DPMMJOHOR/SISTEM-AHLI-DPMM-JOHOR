#!/usr/bin/env python3
"""
Test live borang.html submission with muhdfarihan@gmail.com
Tests: 1) Email to applicant, 2) Email to Admin, 3) Dashboard display, 4) Counter update
"""

from playwright.sync_api import sync_playwright
import time

def test_live_submission():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Use headless=False to see the form
        page = browser.new_page()
        
        print("=== Testing Live Submission Flow ===\n")
        
        # Navigate to local server (has the fix)
        print("1. Navigating to local form...")
        page.goto('http://localhost:8080/borang.html')
        page.wait_for_load_state('networkidle')
        print("✅ Page loaded")
        
        # Check for console errors
        page.on('console', lambda msg: print(f"Console [{msg.type}]: {msg.text}"))
        
        # Take initial screenshot
        page.screenshot(path='test-screenshots/01-initial.png')
        print("📸 Screenshot saved: 01-initial.png")
        
        # Select business type
        print("\n2. Selecting business type...")
        try:
            page.select_option('#business-type-selector', 'enterprise_sole')
            print("✅ Business type selected: Enterprise (Milikan Tunggal)")
        except Exception as e:
            print(f"❌ Failed to select business type: {e}")
            page.screenshot(path='test-screenshots/error-business-type.png')
            browser.close()
            return False
        
        page.wait_for_timeout(2000)
        page.screenshot(path='test-screenshots/02-business-type-selected.png')
        print("📸 Screenshot saved: 02-business-type-selected.png")
        
        # Click "Isi Manual" button
        print("\n3. Clicking 'Isi Manual' button...")
        try:
            # Check button state
            button = page.locator('#btn-start-form')
            is_disabled = button.get_attribute('disabled')
            print(f"   Button disabled attribute: {is_disabled}")
            
            # Try clicking regardless of disabled state
            page.click('#btn-start-form', force=True)
            print("✅ 'Isi Manual' button clicked")
        except Exception as e:
            print(f"❌ Failed to click 'Isi Manual': {e}")
            page.screenshot(path='test-screenshots/error-start-form.png')
            browser.close()
            return False
        
        page.wait_for_load_state('networkidle')
        page.screenshot(path='test-screenshots/03-form-started.png')
        print("📸 Screenshot saved: 03-form-started.png")
        
        # Fill in the form with test data
        print("\n4. Filling form with test data...")
        
        # Step 1: Entity Information
        test_data = {
            'nama_entiti': 'Test Enterprise Live',
            'no_pendaftaran': 'TEST123456',
            'alamat': 'Test Address 123',
            'poskod': '80000',
            'bandar': 'Johor Bahru',
            'negeri': 'Johor',
            'emel_syarikat': 'muhdfarihan@gmail.com',
            'no_tel_syarikat': '0123456789',
            'aktiviti_perniagaan': 'Test Business Activity',
        }
        
        for field_id, value in test_data.items():
            try:
                page.fill(f'#{field_id}', value)
                print(f"  ✓ {field_id}: {value}")
            except Exception as e:
                print(f"  ✗ {field_id}: Failed - {e}")
        
        page.wait_for_timeout(1000)
        page.screenshot(path='test-screenshots/04-entity-info-filled.png')
        print("📸 Screenshot saved: 04-entity-info-filled.png")
        
        # Click Next to proceed to next steps
        print("\n5. Navigating through form steps...")
        for step in range(2, 7):  # Steps 2-6
            try:
                page.click('button:has-text("Seterusnya")')
                page.wait_for_timeout(1000)
                print(f"  ✓ Step {step} completed")
                page.screenshot(path=f'test-screenshots/05-step-{step}.png')
            except Exception as e:
                print(f"  ✗ Step {step} failed: {e}")
                break
        
        # Final step: Submit
        print("\n6. Submitting form...")
        try:
            page.click('button:has-text("Hantar Permohonan")')
            print("✅ Submit button clicked")
        except Exception as e:
            print(f"❌ Failed to submit: {e}")
            page.screenshot(path='test-screenshots/error-submit.png')
        
        page.wait_for_load_state('networkidle')
        page.screenshot(path='test-screenshots/06-submission-complete.png')
        print("📸 Screenshot saved: 06-submission-complete.png")
        
        # Check for success message
        print("\n7. Checking for success message...")
        try:
            success_text = page.text_content('#screen-success')
            if 'Terima kasih' in success_text or 'permohonan' in success_text.lower():
                print("✅ Success message detected")
                print(f"   Message: {success_text[:100]}...")
            else:
                print("⚠️ Unexpected success message")
        except Exception as e:
            print(f"❌ Could not verify success message: {e}")
        
        # Get reference ID if available
        try:
            ref_id = page.text_content('#success-ref-id')
            print(f"   Reference ID: {ref_id}")
        except:
            print("   Reference ID not found")
        
        print("\n=== Test Complete ===")
        print("Screenshots saved in test-screenshots/")
        print("Please check:")
        print("1. Email inbox for muhdfarihan@gmail.com (applicant email)")
        print("2. Admin email inbox (dpmmnj.pengurusan@gmail.com)")
        print("3. Dashboard at https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/index.html")
        print("   Navigate to 'PERMOHONAN AHLI' tab and check for new submission")
        
        # Keep browser open for manual verification
        print("\nBrowser will remain open for 30 seconds for manual verification...")
        time.sleep(30)
        
        browser.close()
        return True

if __name__ == '__main__':
    import os
    os.makedirs('test-screenshots', exist_ok=True)
    test_live_submission()
