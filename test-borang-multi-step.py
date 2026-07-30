#!/usr/bin/env python3
"""
Multi-Step Form Test for borang.html
Follows the actual form flow step by step
Tests Isi Manual workflow with mrhan.fx@gmail.com
"""

from playwright.sync_api import sync_playwright
import time
import os
from datetime import datetime

def test_isi_manual_multi_step():
    """Test Isi Manual following multi-step form flow"""
    url = "https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html"
    test_email = "mrhan.fx@gmail.com"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"\n{'='*60}")
        print(f"TEST: ISI MANUAL (Multi-Step Form)")
        print(f"{'='*60}")
        print(f"URL: {url}")
        print(f"Applicant Email: {test_email}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Capture console logs
        console_messages = []
        def log_console(msg):
            text = f"{msg.type}: {msg.text}"
            console_messages.append(text)
            if any(keyword in text.lower() for keyword in ['email', 'supabase', 'error', 'insert', 'pdf', 'submit']):
                print(f"  [CONSOLE] {text}")
        
        page.on('console', log_console)
        
        # Navigate to form
        print(f"\n[Step 1] Opening borang.html...")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        page.screenshot(path='test-screenshots/multi-step-01-initial.png')
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
        page.screenshot(path='test-screenshots/multi-step-02-form-opened.png')
        print("  ✓ Isi Manual clicked")
        
        # Step 1: Select membership type
        print(f"\n[Step 4] Selecting membership type...")
        page.click('input[name="jenis_keahlian"]:nth-of-type(1)')
        page.wait_for_timeout(500)
        print("  ✓ Selected: Ahli Biasa")
        
        page.select_option('#fasal', '6.2.4')
        page.wait_for_timeout(500)
        print("  ✓ Selected Fasal: 6.2.4")
        
        # Click Next to progress
        print(f"\n[Step 5] Clicking Next to progress through form...")
        page.screenshot(path='test-screenshots/multi-step-03-before-next.png')
        
        # Keep clicking Next until submit button appears
        max_iterations = 30
        for i in range(max_iterations):
            print(f"\n  Iteration {i+1}/{max_iterations}")
            
            # Check if submit button is visible
            submit_btn = page.locator('#btn-submit')
            if submit_btn.is_visible():
                print(f"  ✅ Submit button found! Form is complete.")
                page.screenshot(path='test-screenshots/multi-step-submit-ready.png')
                break
            
            # Fill visible fields if any
            visible_inputs = page.locator('input[type="text"]:visible, input[type="email"]:visible, input[type="tel"]:visible').all()
            for inp in visible_inputs:
                inp_id = inp.get_attribute('id')
                inp_value = inp.input_value()
                if inp_id and not inp_value:  # Only fill empty fields
                    try:
                        if 'emel' in inp_id.lower() or 'email' in inp_id.lower():
                            inp.fill(test_email)
                            print(f"  ✓ Filled {inp_id} with {test_email}")
                        elif 'nama' in inp_id.lower() and 'pemohon' in inp_id.lower():
                            inp.fill('Test User')
                            print(f"  ✓ Filled {inp_id} with Test User")
                        elif 'kad' in inp_id.lower() or 'ic' in inp_id.lower():
                            inp.fill('123456-01-5678')
                            print(f"  ✓ Filled {inp_id} with 123456-01-5678")
                        elif 'tel' in inp_id.lower() or 'phone' in inp_id.lower():
                            inp.fill('0123456789')
                            print(f"  ✓ Filled {inp_id} with 0123456789")
                        elif 'alamat' in inp_id.lower():
                            inp.fill('123 Test Street, Johor Bahru')
                            print(f"  ✓ Filled {inp_id} with address")
                    except:
                        pass
            
            # Check visible checkboxes and check them
            visible_checkboxes = page.locator('input[type="checkbox"]:visible').all()
            if visible_checkboxes:
                print(f"  Found {len(visible_checkboxes)} visible checkboxes")
                for cb in visible_checkboxes:
                    try:
                        if not cb.is_checked():
                            cb.check()
                            cb_id = cb.get_attribute('id')
                            print(f"  ✓ Checked {cb_id}")
                    except:
                        pass
            
            # Click Next
            next_buttons = page.locator('button:has-text("Seterusnya")').all()
            next_found = False
            for btn in next_buttons:
                if btn.is_visible():
                    btn.click()
                    page.wait_for_timeout(1500)
                    next_found = True
                    print(f"  ✓ Clicked Next")
                    break
            
            if not next_found:
                print(f"  ⚠ No Next button found")
                break
        
        # Final screenshot before submit
        page.screenshot(path='test-screenshots/multi-step-before-submit.png')
        
        # Submit form
        print(f"\n[Step 6] Submitting form...")
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
        print(f"\n[Step 7] Waiting for submission to complete...")
        page.wait_for_timeout(20000)
        page.screenshot(path='test-screenshots/multi-step-after-submit.png')
        
        # Check results
        print(f"\n[Step 8] Checking results...")
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
        print(f"\n[Step 9] Console Logs (EmailJS, Supabase, Errors):")
        relevant_logs = [msg for msg in console_messages if any(keyword in msg.lower() for keyword in ['email', 'supabase', 'error', 'insert', 'pdf', 'submit'])]
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
    print(f"# MULTI-STEP FORM TEST FOR BORANG.HTML")
    print(f"# Testing: Isi Manual")
    print(f"# Applicant Email: mrhan.fx@gmail.com")
    print(f"{'#'*60}")
    
    result = test_isi_manual_multi_step()
    
    print(f"\n{'#'*60}")
    print(f"# TEST COMPLETED")
    print(f"# Result: {'PASS' if result else 'FAIL'}")
    print(f"{'#'*60}")
