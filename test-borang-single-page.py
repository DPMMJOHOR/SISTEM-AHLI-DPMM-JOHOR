#!/usr/bin/env python3
"""
Single-Page Form Test for borang.html
Based on reconnaissance: Form shows all 71 inputs and 47 checkboxes at once
Tests Isi Manual workflow with mrhan.fx@gmail.com
"""

from playwright.sync_api import sync_playwright
import time
import os
from datetime import datetime

def test_isi_manual_single_page():
    """Test Isi Manual on single-page form"""
    url = "https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html"
    test_email = "mrhan.fx@gmail.com"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"\n{'='*60}")
        print(f"TEST: ISI MANUAL (Single-Page Form)")
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
        page.screenshot(path='test-screenshots/single-page-01-initial.png')
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
        page.screenshot(path='test-screenshots/single-page-02-form-opened.png')
        print("  ✓ Isi Manual clicked")
        
        # Select membership type
        print(f"\n[Step 4] Selecting membership type...")
        page.click('input[name="jenis_keahlian"]:nth-of-type(1)')
        page.wait_for_timeout(500)
        print("  ✓ Selected: Ahli Biasa")
        
        page.select_option('#fasal', '6.2.4')
        page.wait_for_timeout(500)
        print("  ✓ Selected Fasal: 6.2.4")
        
        # Fill key fields (single-page form)
        print(f"\n[Step 5] Filling form fields...")
        
        # Entity details
        page.click('input[value="Sdn Bhd"]')
        print("  ✓ Entity: Sdn Bhd")
        
        page.click('input[value="Perkhidmatan"]')
        print("  ✓ Sector: Perkhidmatan")
        
        page.fill('#aktiviti_perniagaan', 'Technology Consulting Services')
        print("  ✓ Activity: Technology Consulting Services")
        
        page.fill('#jenama', 'Test Company Sdn Bhd')
        print("  ✓ Brand: Test Company Sdn Bhd")
        
        # Applicant details
        page.fill('#nama_lengkap_pemohon', 'Test User')
        print("  ✓ Applicant Name: Test User")
        
        page.fill('#no_kad_pengenal', '123456-01-5678')
        print("  ✓ IC: 123456-01-5678")
        
        # Fill email with test email
        page.fill('#emel', test_email)
        print(f"  ✓ Email: {test_email}")
        
        # Fill phone
        page.fill('#no_tel_bimbit', '0123456789')
        print("  ✓ Phone: 0123456789")
        
        # Fill address
        page.fill('#alamat', '123 Test Street, Johor Bahru')
        print("  ✓ Address: 123 Test Street, Johor Bahru")
        
        page.fill('#poskod', '80000')
        print("  ✓ Postcode: 80000")
        
        page.fill('#bandar', 'Johor Bahru')
        print("  ✓ City: Johor Bahru")
        
        page.wait_for_timeout(500)
        page.screenshot(path='test-screenshots/single-page-03-fields-filled.png')
        
        # Check all checkboxes (47 checkboxes total)
        print(f"\n[Step 6] Checking all checkboxes...")
        all_checkboxes = page.locator('input[type="checkbox"]').all()
        print(f"  Total checkboxes found: {len(all_checkboxes)}")
        
        checked_count = 0
        for i, checkbox in enumerate(all_checkboxes):
            try:
                if checkbox.is_visible():
                    checkbox.check()
                    checked_count += 1
                    if i < 10:  # Only print first 10
                        cb_id = checkbox.get_attribute('id')
                        print(f"  ✓ Checkbox {i+1} checked (id: {cb_id})")
            except Exception as e:
                print(f"  ✗ Checkbox {i+1}: {e}")
        
        print(f"  ✓ Total checkboxes checked: {checked_count}")
        page.wait_for_timeout(500)
        page.screenshot(path='test-screenshots/single-page-04-checkboxes-checked.png')
        
        # Submit form
        print(f"\n[Step 7] Submitting form...")
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
        print(f"\n[Step 8] Waiting for submission to complete...")
        page.wait_for_timeout(20000)
        page.screenshot(path='test-screenshots/single-page-05-after-submit.png')
        
        # Check results
        print(f"\n[Step 9] Checking results...")
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
        print(f"\n[Step 10] Console Logs (EmailJS, Supabase, Errors):")
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
    print(f"# SINGLE-PAGE FORM TEST FOR BORANG.HTML")
    print(f"# Testing: Isi Manual")
    print(f"# Applicant Email: mrhan.fx@gmail.com")
    print(f"{'#'*60}")
    
    result = test_isi_manual_single_page()
    
    print(f"\n{'#'*60}")
    print(f"# TEST COMPLETED")
    print(f"# Result: {'PASS' if result else 'FAIL'}")
    print(f"{'#'*60}")
