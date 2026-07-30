#!/usr/bin/env python3
"""
Identify visible and fillable fields in borang.html
After Isi Manual is clicked, determine which fields are actually visible
"""

from playwright.sync_api import sync_playwright
import time
import os

def recon_visible_fields():
    url = "https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"Opening: {url}")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        
        # Select Sdn Bhd
        page.select_option('#business-type-selector', 'sdn_bhd_sole')
        page.wait_for_timeout(2000)
        
        # Click Isi Manual
        page.click('#btn-start-form')
        page.wait_for_timeout(2000)
        
        # Select membership type
        page.click('input[name="jenis_keahlian"]:nth-of-type(1)')
        page.wait_for_timeout(500)
        page.select_option('#fasal', '6.2.4')
        page.wait_for_timeout(500)
        
        print(f"\n=== VISIBLE FIELDS AFTER ISI MANUAL ===")
        page.screenshot(path='test-screenshots/recon-visible-01.png')
        
        # List all visible inputs with their attributes
        print(f"\n=== VISIBLE INPUTS ===")
        inputs = page.locator('input:visible').all()
        for inp in inputs:
            inp_id = inp.get_attribute('id')
            inp_type = inp.get_attribute('type')
            inp_name = inp.get_attribute('name')
            inp_value = inp.get_attribute('value')
            inp_placeholder = inp.get_attribute('placeholder')
            
            print(f"  ID: {inp_id}, Type: {inp_type}, Name: {inp_name}, Value: {inp_value}, Placeholder: {inp_placeholder}")
        
        # List all visible textareas
        print(f"\n=== VISIBLE TEXTAREAS ===")
        textareas = page.locator('textarea:visible').all()
        for ta in textareas:
            ta_id = ta.get_attribute('id')
            ta_name = ta.get_attribute('name')
            ta_placeholder = ta.get_attribute('placeholder')
            print(f"  ID: {ta_id}, Name: {ta_name}, Placeholder: {ta_placeholder}")
        
        # List all visible selects
        print(f"\n=== VISIBLE SELECTS ===")
        selects = page.locator('select:visible').all()
        for sel in selects:
            sel_id = sel.get_attribute('id')
            sel_name = sel.get_attribute('name')
            print(f"  ID: {sel_id}, Name: {sel_name}")
        
        # List visible checkboxes
        print(f"\n=== VISIBLE CHECKBOXES (first 20) ===")
        checkboxes = page.locator('input[type="checkbox"]:visible').all()
        for i, cb in enumerate(checkboxes[:20]):
            cb_id = cb.get_attribute('id')
            cb_name = cb.get_attribute('name')
            cb_checked = cb.is_checked()
            print(f"  {i+1}. ID: {cb_id}, Name: {cb_name}, Checked: {cb_checked}")
        
        # Check submit button
        print(f"\n=== SUBMIT BUTTON ===")
        submit_btn = page.locator('#btn-submit')
        print(f"  Visible: {submit_btn.is_visible()}")
        print(f"  Enabled: {submit_btn.is_enabled()}")
        
        print(f"\n=== Reconnaissance Complete ===")
        print(f"Browser remaining open for 60 seconds...")
        time.sleep(60)
        
        browser.close()

if __name__ == "__main__":
    os.makedirs('test-screenshots', exist_ok=True)
    recon_visible_fields()
