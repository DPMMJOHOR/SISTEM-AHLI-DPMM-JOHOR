#!/usr/bin/env python3
"""
Reconnaissance script for borang.html live form
Identifies actual selectors and form structure
"""

from playwright.sync_api import sync_playwright

def recon_borang():
    url = "https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"Opening: {url}")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        
        print(f"\n=== Initial Page State ===")
        page.screenshot(path='test-screenshots/recon-01-initial.png')
        
        # Check business type selector
        print(f"\n=== Business Type Selector ===")
        try:
            selector = page.locator('#business-type-selector')
            if selector.is_visible():
                options = selector.locator('option').all()
                print(f"Options found: {len(options)}")
                for opt in options:
                    print(f"  Value: {opt.get_attribute('value')}, Text: {opt.text_content()}")
        except Exception as e:
            print(f"Error: {e}")
        
        # Select Sdn Bhd
        print(f"\n=== Selecting Sdn Bhd ===")
        page.select_option('#business-type-selector', 'sdn_bhd_sole')
        page.wait_for_timeout(2000)
        page.screenshot(path='test-screenshots/recon-02-after-select.png')
        
        # Check what buttons are available
        print(f"\n=== Available Buttons ===")
        buttons = page.locator('button').all()
        for btn in buttons:
            if btn.is_visible():
                text = btn.text_content().strip()
                print(f"  Button: '{text}'")
        
        # Check Isi Manual button
        print(f"\n=== Isi Manual Button ===")
        try:
            isi_manual = page.locator('#btn-start-form')
            if isi_manual.is_visible():
                print(f"  Found #btn-start-form")
                isi_manual.click()
                page.wait_for_timeout(2000)
                page.screenshot(path='test-screenshots/recon-03-after-isi-manual.png')
        except Exception as e:
            print(f"Error: {e}")
        
        # Check form structure after clicking Isi Manual
        print(f"\n=== Form Structure After Isi Manual ===")
        
        # List all visible inputs
        print(f"\n=== Visible Input Fields ===")
        inputs = page.locator('input').all()
        for inp in inputs:
            if inp.is_visible():
                inp_id = inp.get_attribute('id')
                inp_type = inp.get_attribute('type')
                inp_name = inp.get_attribute('name')
                print(f"  Input: id={inp_id}, type={inp_type}, name={inp_name}")
        
        # List all visible selects
        print(f"\n=== Visible Select Fields ===")
        selects = page.locator('select').all()
        for sel in selects:
            if sel.is_visible():
                sel_id = sel.get_attribute('id')
                print(f"  Select: id={sel_id}")
        
        # List all visible divs with step in id
        print(f"\n=== Step Divs ===")
        step_divs = page.locator('div[id*="step"]').all()
        for div in step_divs:
            if div.is_visible():
                div_id = div.get_attribute('id')
                print(f"  Step div: {div_id}")
        
        print(f"\n=== Reconnaissance Complete ===")
        print(f"Browser will remain open for 60 seconds...")
        
        import time
        time.sleep(60)
        
        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs('test-screenshots', exist_ok=True)
    recon_borang()
