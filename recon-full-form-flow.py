#!/usr/bin/env python3
"""
Comprehensive reconnaissance for borang.html form flow
Maps out the exact step-by-step structure and visibility
"""

from playwright.sync_api import sync_playwright
import time

def recon_full_flow():
    url = "https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"Opening: {url}")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        
        print(f"\n=== STEP 0: Initial Page ===")
        page.screenshot(path='test-screenshots/recon-00-initial.png')
        
        # Select Sdn Bhd
        print(f"\n=== STEP 1: Select Business Type ===")
        page.select_option('#business-type-selector', 'sdn_bhd_sole')
        page.wait_for_timeout(2000)
        page.screenshot(path='test-screenshots/recon-01-business-selected.png')
        
        # Click Isi Manual
        print(f"\n=== STEP 2: Click Isi Manual ===")
        page.click('#btn-start-form')
        page.wait_for_timeout(2000)
        page.screenshot(path='test-screenshots/recon-02-isi-manual-started.png')
        
        # Select membership type
        print(f"\n=== STEP 3: Select Membership Type ===")
        page.click('input[name="jenis_keahlian"]:nth-of-type(1)')
        page.wait_for_timeout(500)
        page.select_option('#fasal', '6.2.4')
        page.wait_for_timeout(500)
        page.screenshot(path='test-screenshots/recon-03-membership-selected.png')
        
        # Click Next and investigate each step
        for step in range(1, 20):  # Up to 20 steps to be safe
            print(f"\n=== STEP {step+3}: Before Next Click ===")
            page.screenshot(path=f'test-screenshots/recon-step-{step}-before.png')
            
            # List visible elements
            visible_inputs = page.locator('input:visible').all()
            visible_selects = page.locator('select:visible').all()
            visible_checkboxes = page.locator('input[type="checkbox"]:visible').all()
            visible_buttons = page.locator('button:visible').all()
            
            print(f"  Visible inputs: {len(visible_inputs)}")
            print(f"  Visible selects: {len(visible_selects)}")
            print(f"  Visible checkboxes: {len(visible_checkboxes)}")
            print(f"  Visible buttons: {len(visible_buttons)}")
            
            # List visible button text
            for btn in visible_buttons:
                text = btn.text_content().strip()
                if text:
                    print(f"    Button: '{text}'")
            
            # List visible checkbox IDs
            for cb in visible_checkboxes:
                cb_id = cb.get_attribute('id')
                if cb_id:
                    print(f"    Checkbox: {cb_id}")
            
            # Check if submit button is visible
            submit_btn = page.locator('#btn-submit')
            if submit_btn.is_visible():
                print(f"  ✅ SUBMIT BUTTON FOUND - Form complete!")
                page.screenshot(path='test-screenshots/recon-final-submit-ready.png')
                break
            
            # Try to click Next
            next_buttons = page.locator('button:has-text("Seterusnya")').all()
            next_found = False
            for btn in next_buttons:
                if btn.is_visible():
                    print(f"  Clicking Next...")
                    btn.click()
                    page.wait_for_timeout(1500)
                    next_found = True
                    break
            
            if not next_found:
                print(f"  ⚠ No Next button found - may be at end or stuck")
                page.screenshot(path=f'test-screenshots/recon-step-{step}-no-next.png')
                break
            
            page.screenshot(path=f'test-screenshots/recon-step-{step}-after.png')
        
        print(f"\n=== Reconnaissance Complete ===")
        print(f"Browser will remain open for 60 seconds for manual inspection...")
        time.sleep(60)
        
        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs('test-screenshots', exist_ok=True)
    recon_full_flow()
