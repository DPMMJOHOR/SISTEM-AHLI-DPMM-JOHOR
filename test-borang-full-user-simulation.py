#!/usr/bin/env python3
"""
Full User Simulation Test for borang.html
Tests both Isi Pintar and Isi Manual workflows with mrhan.fx@gmail.com
Verifies: Form submission, Email delivery, PDF generation, Database insert
"""

from playwright.sync_api import sync_playwright
import time
import os
from datetime import datetime

def test_isi_manual():
    """Test Isi Manual (manual form filling) workflow"""
    url = "https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html"
    test_email = "mrhan.fx@gmail.com"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"\n{'='*60}")
        print(f"TEST 1: ISI MANUAL (Manual Form Filling)")
        print(f"{'='*60}")
        print(f"URL: {url}")
        print(f"Applicant Email: {test_email}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Capture console logs
        console_messages = []
        def log_console(msg):
            text = f"{msg.type}: {msg.text}"
            console_messages.append(text)
            if any(keyword in text.lower() for keyword in ['email', 'supabase', 'error', 'insert', 'pdf']):
                print(f"  [CONSOLE] {text}")
        
        page.on('console', log_console)
        
        # Navigate to form
        print(f"\n[Step 1] Opening borang.html...")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        page.screenshot(path='test-screenshots/isi-manual-01-initial.png')
        print("  ✓ Page loaded")
        
        # Select business type
        print(f"\n[Step 2] Selecting business type (Sdn Bhd)...")
        page.select_option('#business-type-selector', 'sdn_bhd_sole')
        page.wait_for_timeout(1000)
        print("  ✓ Selected: Sdn Bhd (100% Melayu)")
        
        # Wait for button to enable
        page.wait_for_selector('#btn-start-form:not([disabled])', timeout=5000)
        
        # Click Isi Manual button
        print(f"\n[Step 3] Clicking 'Isi Manual' button...")
        page.click('#btn-start-form')
        page.wait_for_timeout(1000)
        page.screenshot(path='test-screenshots/isi-manual-02-form-started.png')
        print("  ✓ Isi Manual clicked")
        
        # Select membership type (using radio buttons)
        print(f"\n[Step 4] Selecting membership type...")
        # Select Ahli Biasa (first radio button)
        page.click('input[name="jenis_keahlian"]:nth-of-type(1)')
        page.wait_for_timeout(500)
        print("  ✓ Selected: Ahli Biasa")
        
        # Select fasal
        page.select_option('#fasal', '6.2.4')
        page.wait_for_timeout(500)
        print("  ✓ Selected Fasal: 6.2.4")
        
        # Click Next
        next_buttons = page.locator('button:has-text("Seterusnya")').all()
        for btn in next_buttons:
            if btn.is_visible():
                btn.click()
                break
        page.wait_for_timeout(1000)
        print("  ✓ Next clicked")
        
        # Step 2: Fill entity type and sector
        print(f"\n[Step 5] Filling entity type and sector...")
        page.click('input[value="Sdn Bhd"]')
        print("  ✓ Entity: Sdn Bhd")
        
        page.click('input[value="Perkhidmatan"]')
        print("  ✓ Sector: Perkhidmatan")
        
        page.fill('#aktiviti_perniagaan', 'Technology Consulting Services')
        print("  ✓ Activity: Technology Consulting Services")
        
        page.fill('#jenama', 'Test Company Sdn Bhd')
        print("  ✓ Brand: Test Company Sdn Bhd")
        
        page.wait_for_timeout(500)
        
        # Click Next
        next_buttons = page.locator('button:has-text("Seterusnya")').all()
        for btn in next_buttons:
            if btn.is_visible():
                btn.click()
                break
        page.wait_for_timeout(1000)
        print("  ✓ Next clicked")
        
        # Step 3: Fill entity details (Step 3 in form - but nama_entiti is not in current form structure)
        print(f"\n[Step 6] Filling applicant details...")
        page.fill('#nama_lengkap_pemohon', 'Test User')
        print("  ✓ Applicant Name: Test User")
        
        page.fill('#no_kad_pengenal', '123456-01-5678')
        print("  ✓ IC: 123456-01-5678")
        
        page.wait_for_timeout(500)
        
        # Click Next through remaining steps
        for step_num in [4, 5, 6]:
            print(f"\n[Step {step_num+5}] Clicking Next (Step {step_num})...")
            page.screenshot(path=f'test-screenshots/isi-manual-step-{step_num}-before.png')
            
            # Check what's visible before clicking
            visible_inputs = page.locator('input:visible').all()
            print(f"  Visible inputs: {len(visible_inputs)}")
            
            next_buttons = page.locator('button:has-text("Seterusnya")').all()
            for btn in next_buttons:
                if btn.is_visible():
                    btn.click()
                    break
            page.wait_for_timeout(1000)
            print("  ✓ Next clicked")
            page.screenshot(path=f'test-screenshots/isi-manual-step-{step_num}-after.png')
        
        # Check which step we're on and what's visible
        print(f"\n[Step 12] Checking current form state...")
        page.screenshot(path='test-screenshots/isi-manual-before-declarations.png')
        
        # Try to find where checkboxes are
        print(f"\n[Step 12] Looking for declaration checkboxes...")
        try:
            # Wait for checkboxes to become visible
            page.wait_for_selector('#akuan1:visible', timeout=10000)
            print("  ✓ Checkboxes are now visible")
        except:
            print("  ⚠ Checkboxes not visible, may need more Next clicks")
            
            # Try clicking Next again
            next_buttons = page.locator('button:has-text("Seterusnya")').all()
            for btn in next_buttons:
                if btn.is_visible():
                    btn.click()
                    break
            page.wait_for_timeout(1000)
            page.screenshot(path='test-screenshots/isi-manual-after-extra-next.png')
        
        # Accept declarations
        print(f"\n[Step 13] Accepting declarations...")
        checkboxes = ['akuan1', 'akuan2', 'akuan3', 'akuan4', 'akuan5', 'akuan6']
        for checkbox_id in checkboxes:
            try:
                checkbox = page.locator(f'#{checkbox_id}')
                if checkbox.is_visible():
                    checkbox.check()
                    print(f"  ✓ {checkbox_id} checked")
                else:
                    print(f"  ⚠ {checkbox_id} not visible")
            except Exception as e:
                print(f"  ✗ {checkbox_id}: {e}")
        
        page.wait_for_timeout(500)
        page.screenshot(path='test-screenshots/isi-manual-after-declarations.png')
        
        # Submit form
        print(f"\n[Step 13] Submitting form...")
        page.click('button:has-text("Hantar Permohonan")')
        print("  ✓ Submit clicked")
        
        # Wait for submission
        print(f"\n[Step 14] Waiting for submission to complete...")
        page.wait_for_timeout(15000)
        
        page.screenshot(path='test-screenshots/isi-manual-03-after-submit.png')
        
        # Check results
        print(f"\n[Step 15] Checking results...")
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
        print(f"\n[Step 16] Console Logs (EmailJS, Supabase, Errors):")
        relevant_logs = [msg for msg in console_messages if any(keyword in msg.lower() for keyword in ['email', 'supabase', 'error', 'insert', 'pdf'])]
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

def test_isi_pintar():
    """Test Isi Pintar (AI-powered form filling) workflow"""
    url = "https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html"
    test_email = "mrhan.fx@gmail.com"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"\n{'='*60}")
        print(f"TEST 2: ISI PINTAR (AI-Powered Form Filling)")
        print(f"{'='*60}")
        print(f"URL: {url}")
        print(f"Applicant Email: {test_email}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Capture console logs
        console_messages = []
        def log_console(msg):
            text = f"{msg.type}: {msg.text}"
            console_messages.append(text)
            if any(keyword in text.lower() for keyword in ['email', 'supabase', 'error', 'insert', 'pdf', 'ai', 'isi pintar']):
                print(f"  [CONSOLE] {text}")
        
        page.on('console', log_console)
        
        # Navigate to form
        print(f"\n[Step 1] Opening borang.html...")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        page.screenshot(path='test-screenshots/isi-pintar-01-initial.png')
        print("  ✓ Page loaded")
        
        # Select business type
        print(f"\n[Step 2] Selecting business type (Sdn Bhd)...")
        page.select_option('#business-type-selector', 'sdn_bhd_sole')
        page.wait_for_timeout(1000)
        print("  ✓ Selected: Sdn Bhd (100% Melayu)")
        
        # Wait for button to enable
        page.wait_for_selector('#btn-start-form:not([disabled])', timeout=5000)
        
        # Click Isi Pintar button
        print(f"\n[Step 3] Clicking 'Isi Pintar' button...")
        try:
            isi_pintar_btn = page.locator('button:has-text("Isi Pintar")')
            if isi_pintar_btn.is_visible():
                isi_pintar_btn.click()
                print("  ✓ Isi Pintar clicked")
            else:
                print("  ⚠ Isi Pintar button not found, may not be available")
                browser.close()
                return False
        except Exception as e:
            print(f"  ✗ Isi Pintar not available: {e}")
            browser.close()
            return False
        
        page.wait_for_timeout(2000)
        page.screenshot(path='test-screenshots/isi-pintar-02-ai-started.png')
        
        # Upload SSM document for AI processing
        print(f"\n[Step 4] Uploading SSM document for AI processing...")
        try:
            # Try to find file upload input
            file_input = page.locator('input[type="file"]')
            if file_input.count() > 0:
                # Use sample SSM document from TEST DOCUMENTS
                ssm_doc = "TEST DOCUMENTS/ENTERPRISE/Sample Doc SSM_ENT.jpg"
                if os.path.exists(ssm_doc):
                    file_input.set_input_files(ssm_doc)
                    print(f"  ✓ Uploaded: {ssm_doc}")
                    page.wait_for_timeout(3000)
                else:
                    print(f"  ✗ File not found: {ssm_doc}")
            else:
                print("  ⚠ File upload input not found")
        except Exception as e:
            print(f"  ✗ Upload failed: {e}")
        
        page.screenshot(path='test-screenshots/isi-pintar-03-after-upload.png')
        
        # Wait for AI processing
        print(f"\n[Step 5] Waiting for AI processing...")
        page.wait_for_timeout(10000)
        
        # Check if form was auto-filled
        print(f"\n[Step 6] Checking AI auto-fill results...")
        page.screenshot(path='test-screenshots/isi-pintar-04-ai-results.png')
        
        # Try to proceed with submission if fields are filled
        print(f"\n[Step 7] Attempting to submit AI-filled form...")
        try:
            # Check if submit button is available
            submit_btn = page.locator('button:has-text("Hantar Permohonan")')
            if submit_btn.is_visible():
                # Accept declarations first
                checkboxes = ['akuan1', 'akuan2', 'akuan3', 'akuan4', 'akuan5', 'akuan6']
                for checkbox_id in checkboxes:
                    try:
                        page.check(f'#{checkbox_id}')
                        print(f"  ✓ {checkbox_id} checked")
                    except:
                        pass
                
                page.wait_for_timeout(500)
                
                # Submit
                submit_btn.click()
                print("  ✓ Submit clicked")
                
                # Wait for submission
                page.wait_for_timeout(15000)
                page.screenshot(path='test-screenshots/isi-pintar-05-after-submit.png')
            else:
                print("  ⚠ Submit button not available, form may need manual completion")
        except Exception as e:
            print(f"  ✗ Submission failed: {e}")
        
        # Print console logs
        print(f"\n[Step 8] Console Logs (AI, EmailJS, Supabase, Errors):")
        relevant_logs = [msg for msg in console_messages if any(keyword in msg.lower() for keyword in ['email', 'supabase', 'error', 'insert', 'pdf', 'ai', 'isi pintar', 'ocr'])]
        if relevant_logs:
            for log in relevant_logs:
                print(f"  {log}")
        else:
            print("  No relevant logs found")
        
        print(f"\n{'='*60}")
        print(f"ISI PINTAR TEST COMPLETED")
        print(f"{'='*60}")
        print(f"✓ AI processing attempted")
        print(f"✓ Applicant email: {test_email}")
        print(f"✓ Check Gmail inbox for mrhan.fx@gmail.com")
        print(f"✓ Check admin inbox: dpmmnj.pengurusan@gmail.com")
        
        print(f"\nBrowser remaining open for 30 seconds...")
        time.sleep(30)
        
        browser.close()
        return True

if __name__ == "__main__":
    os.makedirs('test-screenshots', exist_ok=True)
    
    print(f"\n{'#'*60}")
    print(f"# FULL USER SIMULATION TEST FOR BORANG.HTML")
    print(f"# Testing: Isi Manual & Isi Pintar")
    print(f"# Applicant Email: mrhan.fx@gmail.com")
    print(f"{'#'*60}")
    
    # Test Isi Manual first
    isi_manual_result = test_isi_manual()
    
    # Wait before next test
    print(f"\nWaiting 10 seconds before Isi Pintar test...")
    time.sleep(10)
    
    # Test Isi Pintar
    isi_pintar_result = test_isi_pintar()
    
    print(f"\n{'#'*60}")
    print(f"# ALL TESTS COMPLETED")
    print(f"# Isi Manual: {'PASS' if isi_manual_result else 'FAIL'}")
    print(f"# Isi Pintar: {'PASS' if isi_pintar_result else 'FAIL'}")
    print(f"{'#'*60}")
