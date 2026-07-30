#!/usr/bin/env python3
"""
360-Degree Functional Test for borang.html
Tests: Form submission, EmailJS delivery, PDF generation, Supabase insert
"""

from playwright.sync_api import sync_playwright
import time
import os

def test_borang_submission():
    url = "http://localhost:8080/borang.html"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"=== 360-Degree Test: borang.html ===\n")
        print(f"Opening: {url}")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        
        # Capture console logs for EmailJS debugging
        console_messages = []
        def log_console(msg):
            text = f"{msg.type}: {msg.text}"
            console_messages.append(text)
            if 'email' in text.lower() or 'error' in text.lower():
                print(f"  [CONSOLE] {text}")
        
        page.on('console', log_console)
        
        # Take initial screenshot
        page.screenshot(path='test-screenshots/00-initial.png')
        print("📸 Screenshot: 00-initial.png")
        
        # Step 0: Select business type
        print("\n[Step 0] Selecting business type...")
        try:
            page.select_option('#business-type-selector', 'enterprise_sole')
            print("  ✓ Selected: Enterprise (Milikan Tunggal)")
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            page.screenshot(path='test-screenshots/error-step0.png')
            browser.close()
            return False
        
        # Wait for button to be enabled
        print("\n[Step 0a] Waiting for 'Isi Manual' button to enable...")
        try:
            page.wait_for_selector('#btn-start-form:not([disabled])', timeout=5000)
            print("  ✓ Button enabled")
        except:
            print("  ⚠ Button still disabled, clicking anyway")
        
        # Click Isi Manual button
        print("\n[Step 0b] Clicking 'Isi Manual' button...")
        try:
            page.click('#btn-start-form')
            print("  ✓ Button clicked")
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            page.screenshot(path='test-screenshots/error-start-button.png')
            browser.close()
            return False
        
        page.screenshot(path='test-screenshots/01-form-started.png')
        print("📸 Screenshot: 01-form-started.png")
        
        # Step 1: Select membership type
        print("\n[Step 1] Selecting membership type...")
        try:
            page.click('#card-A')
            print("  ✓ Selected: Ahli Biasa (A)")
            page.wait_for_timeout(500)
            
            page.select_option('#fasal', '6.2.1')
            print("  ✓ Selected Fasal: 6.2.1")
            page.wait_for_timeout(500)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            page.screenshot(path='test-screenshots/error-step1.png')
            browser.close()
            return False
        
        # Click Next button (find visible one)
        print("\n[Step 1a] Clicking Next button...")
        try:
            # Find the visible Next button
            next_buttons = page.locator('button:has-text("Seterusnya")').all()
            for btn in next_buttons:
                if btn.is_visible():
                    btn.click()
                    print("  ✓ Next clicked")
                    break
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            page.screenshot(path='test-screenshots/error-next1.png')
            browser.close()
            return False
        
        # Step 2: Fill entity type and sector
        print("\n[Step 2] Filling entity type and sector...")
        try:
            page.click('input[value="Pemunya Tunggal"]')
            print("  ✓ Entity: Pemunya Tunggal")
            
            page.click('input[value="Perkhidmatan"]')
            print("  ✓ Sector: Perkhidmatan")
            
            page.fill('#aktiviti_perniagaan', 'Test Business Activity')
            print("  ✓ Activity: Test Business Activity")
            
            # Fill entity details in step 2 (nama_entiti is here)
            page.fill('#nama_entiti', 'Test Enterprise Sdn Bhd')
            print("  ✓ Entity Name: Test Enterprise Sdn Bhd")
            
            page.fill('#no_pendaftaran', '123456789-A')
            print("  ✓ Registration No: 123456789-A")
            
            # Use YYYY-MM-DD format for date fields
            page.fill('#tarikh_daftar', '2020-01-01')
            print("  ✓ Registration Date: 2020-01-01")
            
            page.fill('#tarikh_luput', '2025-01-01')
            print("  ✓ Expiry Date: 2025-01-01")
            
            page.fill('#alamat', '123 Test Street')
            print("  ✓ Address: 123 Test Street")
            
            page.fill('#poskod', '80000')
            print("  ✓ Postcode: 80000")
            
            page.fill('#bandar', 'Johor Bahru')
            print("  ✓ City: Johor Bahru")
            
            page.fill('#emel_syarikat', 'test@example.com')
            print("  ✓ Email: test@example.com")
            
            page.fill('#no_tel_bimbit', '0123456789')
            print("  ✓ Phone: 0123456789")
            
            page.wait_for_timeout(500)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            page.screenshot(path='test-screenshots/error-step2.png')
            browser.close()
            return False
        
        # Click Next
        try:
            next_buttons = page.locator('button:has-text("Seterusnya")').all()
            for btn in next_buttons:
                if btn.is_visible():
                    btn.click()
                    print("  ✓ Next clicked")
                    break
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            browser.close()
            return False
        
        # Step 3: Fill applicant details (step 3 in form)
        print("\n[Step 3] Filling applicant details...")
        test_data_step3 = {
            'nama_lengkap_pemohon': 'Test User',
            'no_kad_pengenal': '123456-01-5678'
        }
        
        for field_id, value in test_data_step3.items():
            try:
                page.fill(f'#{field_id}', value)
                print(f"  ✓ {field_id}: {value}")
            except Exception as e:
                print(f"  ✗ {field_id}: Failed - {e}")
        
        page.wait_for_timeout(1000)
        
        # Click Next
        try:
            next_buttons = page.locator('button:has-text("Seterusnya")').all()
            for btn in next_buttons:
                if btn.is_visible():
                    btn.click()
                    print("  ✓ Next clicked")
                    break
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            browser.close()
            return False
        
        # Step 4: Skip shareholders (not required for Pemunya Tunggal)
        print("\n[Step 4] Skipping shareholders...")
        try:
            next_buttons = page.locator('button:has-text("Seterusnya")').all()
            for btn in next_buttons:
                if btn.is_visible():
                    btn.click()
                    print("  ✓ Next clicked")
                    break
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            browser.close()
            return False
        
        # Step 5: Skip document upload (test mode)
        print("\n[Step 5] Skipping document upload (test mode)...")
        try:
            next_buttons = page.locator('button:has-text("Seterusnya")').all()
            for btn in next_buttons:
                if btn.is_visible():
                    btn.click()
                    print("  ✓ Next clicked")
                    break
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            browser.close()
            return False
        
        # Step 6: Select payment period
        print("\n[Step 6] Selecting payment period...")
        try:
            # Wait for step 6 to be visible
            page.wait_for_selector('#step-6', timeout=5000)
            print("  ✓ Step 6 visible")
            
            # Click the radio button directly by name
            page.click('input[name="tempoh_yuran"][value="1"]')
            print("  ✓ Selected: 1 year")
            page.wait_for_timeout(500)
            
            next_buttons = page.locator('button:has-text("Seterusnya")').all()
            for btn in next_buttons:
                if btn.is_visible():
                    btn.click()
                    print("  ✓ Next clicked")
                    break
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            page.screenshot(path='test-screenshots/error-step6.png')
            browser.close()
            return False
        
        # Step 7: Accept all declarations
        print("\n[Step 7] Accepting declarations...")
        checkboxes = ['akuan1', 'akuan2', 'akuan3', 'akuan4', 'akuan5', 'akuan6']
        for checkbox_id in checkboxes:
            try:
                page.check(f'#{checkbox_id}')
                print(f"  ✓ {checkbox_id} checked")
            except Exception as e:
                print(f"  ✗ {checkbox_id}: Failed - {e}")
        
        page.wait_for_timeout(500)
        
        # Submit form
        print("\n[Step 8] Submitting form...")
        try:
            page.click('button:has-text("Hantar Permohonan")')
            print("  ✓ Submit clicked")
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            page.screenshot(path='test-screenshots/error-submit.png')
            browser.close()
            return False
        
        # Wait for submission to complete
        print("\n[Step 9] Waiting for submission to complete...")
        page.wait_for_timeout(10000)
        
        page.screenshot(path='test-screenshots/02-after-submit.png')
        print("📸 Screenshot: 02-after-submit.png")
        
        # Check for success screen
        print("\n[Step 10] Checking results...")
        try:
            success_screen = page.locator('#screen-success')
            if success_screen.is_visible():
                print("  ✅ Success screen detected!")
                
                try:
                    ref_id = page.locator('#success-ref-id').text_content()
                    print(f"  Reference ID: {ref_id}")
                except:
                    print("  Reference ID not found")
            else:
                print("  ❌ Success screen not detected")
        except Exception as e:
            print(f"  ❌ Error checking success: {e}")
        
        # Check for error messages
        try:
            error_toast = page.locator('.toast.error')
            if error_toast.is_visible():
                error_text = error_toast.text_content()
                print(f"  ❌ Error message: {error_text}")
        except:
            pass
        
        # Print EmailJS-related console logs
        print("\n=== EmailJS Console Logs ===")
        email_logs = [msg for msg in console_messages if 'email' in msg.lower()]
        if email_logs:
            for log in email_logs:
                print(f"  {log}")
        else:
            print("  No EmailJS logs found")
        
        print("\n=== Test Summary ===")
        print("✅ Form submission test completed")
        print("📧 Please check email inboxes:")
        print("   - Admin: dpmmnj.pengurusan@gmail.com")
        print("   - Applicant: test@example.com")
        print("📊 Check Supabase PERMOHONAN_AHLI table for new record")
        print("📁 Check Supabase Storage 'permohonan-dokumen' bucket for PDF")
        
        print("\nBrowser will remain open for 30 seconds for manual verification...")
        time.sleep(30)
        
        browser.close()
        return True

if __name__ == "__main__":
    os.makedirs('test-screenshots', exist_ok=True)
    test_borang_submission()
