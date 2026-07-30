#!/usr/bin/env python3
"""
Test EmailJS email sending functionality by submitting a test form.
This script automates form submission in borang.html and verifies email sending.
"""

from playwright.sync_api import sync_playwright
import time
import os

def test_emailjs():
    html_path = "file:///" + os.path.abspath("borang.html").replace("\\", "/")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Show browser for debugging
        page = browser.new_page()
        
        # Navigate to the form
        print(f"Opening: {html_path}")
        page.goto(html_path)
        page.wait_for_load_state('networkidle')
        
        # Capture console logs to check for EmailJS errors
        console_messages = []
        page.on('console', lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        
        # Step 0: Handle intro screen - select business type
        print("Step 0: Selecting business type from intro screen...")
        page.select_option('#business-type-selector', 'enterprise_sole')
        page.wait_for_timeout(1000)
        
        # Click "Isi Manual" button
        page.click('#btn-start-form')
        page.wait_for_timeout(500)
        
        # Step 1: Select membership type (Ahli Biasa - A)
        print("Step 1: Selecting membership type...")
        # Click the card div instead of the hidden radio button
        page.click('#card-A')
        page.wait_for_timeout(500)
        
        # Select fasal 6.2.1
        page.select_option('#fasal', '6.2.1')
        page.wait_for_timeout(500)
        
        # Click "Seterusnya" button
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(500)
        
        # Step 2: Fill entity type and sector
        print("Step 2: Filling entity type and sector...")
        page.click('input[value="Pemunya Tunggal"]')
        page.click('input[value="Perkhidmatan"]')
        page.fill('#aktiviti_perniagaan', 'Test Business Activity')
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(500)
        
        # Step 3: Fill entity details
        print("Step 3: Filling entity details...")
        page.fill('#nama_entiti', 'Test Enterprise Sdn Bhd')
        page.fill('#no_pendaftaran', '123456789-A')
        page.fill('#tarikh_daftar', '01/01/2020')
        page.fill('#tarikh_luput', '01/01/2025')
        page.fill('#alamat', '123 Test Street')
        page.fill('#poskod', '80000')
        page.fill('#bandar', 'Johor Bahru')
        page.fill('#emel_syarikat', 'test@example.com')
        page.fill('#no_tel_bimbit', '0123456789')
        page.fill('#nama_lengkap_pemohon', 'Test User')
        page.fill('#no_kad_pengenal', '123456-01-5678')
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(500)
        
        # Step 4: Skip shareholders (not required for Pemunya Tunggal)
        print("Step 4: Skipping shareholders...")
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(500)
        
        # Step 5: Skip document upload for test
        print("Step 5: Skipping document upload (test mode)...")
        # Note: In real test, you would upload files here
        # For email testing, we'll skip this step by modifying validation
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(500)
        
        # Step 6: Select payment period
        print("Step 6: Selecting payment period...")
        page.click('input[value="1"]')
        page.click('button:has-text("Seterusnya")')
        page.wait_for_timeout(500)
        
        # Step 7: Accept all declarations
        print("Step 7: Accepting declarations...")
        page.check('#akuan1')
        page.check('#akuan2')
        page.check('#akuan3')
        page.check('#akuan4')
        page.check('#akuan5')
        page.check('#akuan6')
        page.wait_for_timeout(500)
        
        # Submit form
        print("Submitting form...")
        page.click('button:has-text("Hantar Permohonan")')
        
        # Wait for submission to complete
        page.wait_for_timeout(5000)
        
        # Check console logs for EmailJS activity
        print("\n=== Console Logs ===")
        for msg in console_messages:
            if 'emailjs' in msg.lower() or 'email' in msg.lower():
                print(msg)
        
        # Check if success screen is shown
        success_screen = page.query_selector('#screen-success')
        if success_screen and success_screen.is_visible():
            print("\n✅ Form submitted successfully!")
            ref_id = page.text_content('#success-ref-id')
            print(f"Reference ID: {ref_id}")
        else:
            print("\n❌ Form submission may have failed")
        
        # Check for error messages
        error_toast = page.query_selector('.toast.error')
        if error_toast and error_toast.is_visible():
            print(f"Error: {error_toast.text_content()}")
        
        print("\n=== EmailJS Test Summary ===")
        print("Check your email (dpmmnj.pengurusan@gmail.com) for admin notification")
        print("Check test@example.com for applicant confirmation")
        print("If emails not received, check EmailJS dashboard: https://dashboard.emailjs.com/")
        
        # Keep browser open for inspection
        print("\nPress Enter to close browser...")
        input()
        
        browser.close()

if __name__ == "__main__":
    test_emailjs()
