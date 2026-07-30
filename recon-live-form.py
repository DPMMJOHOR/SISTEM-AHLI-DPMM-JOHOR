#!/usr/bin/env python3
"""
Reconnaissance script to inspect LIVE borang.html form structure
"""

from playwright.sync_api import sync_playwright
import os

def recon_live_form():
    url = "https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"=== Reconnaissance: LIVE borang.html ===\n")
        print(f"Opening: {url}")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        
        # Step 0: Select business type and start form
        print("\n[Setup] Starting form...")
        page.select_option('#business-type-selector', 'enterprise_sole')
        page.wait_for_timeout(1000)
        page.wait_for_selector('#btn-start-form:not([disabled])', timeout=5000)
        page.click('#btn-start-form')
        page.wait_for_timeout(1000)
        
        # Step 1: Select membership type
        page.click('#card-A')
        page.wait_for_timeout(500)
        page.select_option('#fasal', '6.2.1')
        page.wait_for_timeout(500)
        
        # Click Next
        next_buttons = page.locator('button:has-text("Seterusnya")').all()
        for btn in next_buttons:
            if btn.is_visible():
                btn.click()
                break
        page.wait_for_timeout(1000)
        
        # Step 2: Fill entity type and sector
        page.click('input[value="Pemunya Tunggal"]')
        page.click('input[value="Perkhidmatan"]')
        page.fill('#aktiviti_perniagaan', 'Test Business Activity')
        page.wait_for_timeout(500)
        
        # Take screenshot to see what's visible
        page.screenshot(path='test-screenshots/recon-step2.png', full_page=True)
        print("📸 Screenshot: recon-step2.png")
        
        # Inspect visible inputs
        print("\n=== Visible Input Fields ===")
        inputs = page.locator('input').all()
        for inp in inputs:
            if inp.is_visible():
                inp_id = inp.get_attribute('id')
                inp_type = inp.get_attribute('type')
                inp_name = inp.get_attribute('name')
                print(f"  ID: {inp_id}, Type: {inp_type}, Name: {inp_name}")
        
        # Check if nama_entiti exists
        print("\n=== Checking for nama_entiti ===")
        nama_entiti = page.locator('#nama_entiti')
        if nama_entiti.count() > 0:
            print(f"  Found #nama_entiti (count: {nama_entiti.count()})")
            print(f"  Visible: {nama_entiti.is_visible()}")
            print(f"  Enabled: {nama_entiti.is_enabled()}")
        else:
            print("  #nama_entiti NOT FOUND")
        
        # Check step visibility
        print("\n=== Step Visibility ===")
        for i in range(1, 8):
            step = page.locator(f'#step-{i}')
            if step.count() > 0:
                print(f"  Step {i}: {'VISIBLE' if step.is_visible() else 'HIDDEN'}")
            else:
                print(f"  Step {i}: NOT FOUND")
        
        print("\nBrowser will remain open for 30 seconds for manual inspection...")
        time.sleep(30)
        
        browser.close()

if __name__ == "__main__":
    import time
    os.makedirs('test-screenshots', exist_ok=True)
    recon_live_form()
