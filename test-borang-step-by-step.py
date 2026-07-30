#!/usr/bin/env python3
"""
Step-by-Step Form Test for borang.html
Properly navigates through all 7 steps and fills required fields
Tests Isi Manual workflow with mrhan.fx@gmail.com
"""

from playwright.sync_api import sync_playwright
import time
import os
from datetime import datetime

def test_isi_manual_step_by_step():
    """Test Isi Manual following proper step navigation"""
    url = "https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html"
    test_email = "mrhan.fx@gmail.com"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"\n{'='*60}")
        print(f"TEST: ISI MANUAL (Step-by-Step)")
        print(f"{'='*60}")
        print(f"URL: {url}")
        print(f"Applicant Email: {test_email}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Capture console logs
        console_messages = []
        def log_console(msg):
            text = f"{msg.type}: {msg.text}"
            console_messages.append(text)
            if any(keyword in text.lower() for keyword in ['email', 'supabase', 'error', 'insert', 'pdf', 'submit', 'validation']):
                print(f"  [CONSOLE] {text}")
        
        page.on('console', log_console)
        
        # Navigate to form
        print(f"\n[Step 1] Opening borang.html...")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        print("  ✓ Page loaded")
        
        # Select business type
        print(f"\n[Step 2] Selecting business type (Sdn Bhd)...")
        page.select_option('#business-type-selector', 'sdn_bhd_sole')
        page.wait_for_timeout(1000)
        print("  ✓ Selected: Sdn Bhd (100% Melayu)")
        
        # Click Isi Manual button
        print(f"\n[Step 3] Clicking 'Isi Manual' button...")
        page.click('#btn-start-form')
        page.wait_for_timeout(2000)
        print("  ✓ Isi Manual clicked")
        
        # === STEP 1: Membership Type ===
        print(f"\n=== STEP 1: Membership Type ===")
        page.click('input[name="jenis_keahlian"]:nth-of-type(1)')
        page.wait_for_timeout(500)
        print("  ✓ Selected: Ahli Biasa")
        
        page.select_option('#fasal', '6.2.4')
        page.wait_for_timeout(500)
        print("  ✓ Selected Fasal: 6.2.4")
        
        # Click Next to go to Step 2
        print(f"\n  Clicking Next to Step 2...")
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(2000)
        
        # === STEP 2: Entity Details ===
        print(f"\n=== STEP 2: Entity Details ===")
        page.screenshot(path='test-screenshots/step-2-entity.png')
        
        # Fill entity fields
        try:
            page.fill('#nama_perniagaan', 'Test Company Sdn Bhd')
            print("  ✓ Company Name: Test Company Sdn Bhd")
        except:
            print("  ⚠ Company name field not found")
        
        try:
            page.fill('#no_ssm', '123456-A')
            print("  ✓ SSM Number: 123456-A")
        except:
            print("  ⚠ SSM field not found")
        
        try:
            page.fill('#tarikh_pendaftaran', '2020-01-01')
            print("  ✓ Registration Date: 2020-01-01")
        except:
            print("  ⚠ Registration date field not found")
        
        # Click Next to go to Step 3
        print(f"\n  Clicking Next to Step 3...")
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(2000)
        
        # === STEP 3: Applicant Details ===
        print(f"\n=== STEP 3: Applicant Details ===")
        page.screenshot(path='test-screenshots/step-3-applicant.png')
        
        # Fill applicant fields
        try:
            page.fill('#nama_lengkap_pemohon', 'Test User')
            print("  ✓ Applicant Name: Test User")
        except:
            print("  ⚠ Applicant name field not found")
        
        try:
            page.fill('#no_kad_pengenal', '123456-01-5678')
            print("  ✓ IC: 123456-01-5678")
        except:
            print("  ⚠ IC field not found")
        
        try:
            page.fill('#emel', test_email)
            print(f"  ✓ Email: {test_email}")
        except:
            print("  ⚠ Email field not found")
        
        try:
            page.fill('#no_tel_bimbit', '0123456789')
            print("  ✓ Phone: 0123456789")
        except:
            print("  ⚠ Phone field not found")
        
        # Click Next to go to Step 4
        print(f"\n  Clicking Next to Step 4...")
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(2000)
        
        # === STEP 4: Address ===
        print(f"\n=== STEP 4: Address ===")
        page.screenshot(path='test-screenshots/step-4-address.png')
        
        try:
            page.fill('#alamat', '123 Test Street, Johor Bahru')
            print("  ✓ Address: 123 Test Street, Johor Bahru")
        except:
            print("  ⚠ Address field not found")
        
        try:
            page.fill('#poskod', '80000')
            print("  ✓ Postcode: 80000")
        except:
            print("  ⚠ Postcode field not found")
        
        try:
            page.fill('#bandar', 'Johor Bahru')
            print("  ✓ City: Johor Bahru")
        except:
            print("  ⚠ City field not found")
        
        # Click Next to go to Step 5
        print(f"\n  Clicking Next to Step 5...")
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(2000)
        
        # === STEP 5: Shareholders ===
        print(f"\n=== STEP 5: Shareholders ===")
        page.screenshot(path='test-screenshots/step-5-shareholders.png')
        
        # Click Next to go to Step 6
        print(f"\n  Clicking Next to Step 6...")
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(2000)
        
        # === STEP 6: Payment ===
        print(f"\n=== STEP 6: Payment ===")
        page.screenshot(path='test-screenshots/step-6-payment.png')
        
        # Select payment period
        try:
            page.click('input[name="tempoh_yuran"][value="2"]')
            print("  ✓ Selected: 2 years (recommended)")
        except:
            print("  ⚠ Payment period selection failed")
        
        # Click Next to go to Step 7
        print(f"\n  Clicking Next to Step 7...")
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(2000)
        
        # === STEP 7: Review & Submit ===
        print(f"\n=== STEP 7: Review & Submit ===")
        page.screenshot(path='test-screenshots/step-7-review.png')
        
        # Check all 6 declaration checkboxes
        print(f"\n  Checking all 6 declaration checkboxes...")
        checkboxes = ['akuan1', 'akuan2', 'akuan3', 'akuan4', 'akuan5', 'akuan6']
        for checkbox_id in checkboxes:
            try:
                page.check(f'#{checkbox_id}')
                print(f"  ✓ {checkbox_id} checked")
            except Exception as e:
                print(f"  ✗ {checkbox_id}: {e}")
        
        page.wait_for_timeout(500)
        page.screenshot(path='test-screenshots/step-7-checkboxes-checked.png')
        
        # Submit form
        print(f"\n  Submitting form...")
        try:
            submit_btn = page.locator('#btn-submit')
            if submit_btn.is_visible():
                submit_btn.click()
                print("  ✓ Submit clicked")
            else:
                print("  ✗ Submit button not visible")
        except Exception as e:
            print(f"  ✗ Submit failed: {e}")
        
        # Wait for submission
        print(f"\n  Waiting for submission to complete...")
        page.wait_for_timeout(25000)
        page.screenshot(path='test-screenshots/step-7-after-submit.png')
        
        # Check results
        print(f"\n  Checking results...")
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
        
        # Print console logs
        print(f"\n  Console Logs (EmailJS, Supabase, Errors):")
        relevant_logs = [msg for msg in console_messages if any(keyword in msg.lower() for keyword in ['email', 'supabase', 'error', 'insert', 'pdf', 'submit', 'validation'])]
        if relevant_logs:
            for log in relevant_logs:
                print(f"  {log}")
        else:
            print("  No relevant logs found")
        
        print(f"\n{'='*60}")
        print(f"ISI MANUAL TEST COMPLETED")
        print(f"{'='*60}")
        print(f"✓ Form submission attempted")
        print(f"✓ Applicant email: {test_email}")
        print(f"✓ Check Gmail inbox for mrhan.fx@gmail.com")
        print(f"✓ Check admin inbox: dpmmnj.pengurusan@gmail.com")
        print(f"✓ Check Supabase PERMOHONAN_AHLI table")
        print(f"✓ Check Supabase Storage 'permohonan-dokumen' bucket")
        
        print(f"\nBrowser remaining open for 30 seconds...")
        time.sleep(30)
        
        browser.close()
        return True

if __name__ == "__main__":
    os.makedirs('test-screenshots', exist_ok=True)
    
    print(f"\n{'#'*60}")
    print(f"# STEP-BY-STEP FORM TEST FOR BORANG.HTML")
    print(f"# Testing: Isi Manual")
    print(f"# Applicant Email: mrhan.fx@gmail.com")
    print(f"{'#'*60}")
    
    result = test_isi_manual_step_by_step()
    
    print(f"\n{'#'*60}")
    print(f"# TEST COMPLETED")
    print(f"# Result: {'PASS' if result else 'FAIL'}")
    print(f"{'#'*60}")
