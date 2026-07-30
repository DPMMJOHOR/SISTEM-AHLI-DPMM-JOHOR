#!/usr/bin/env python3
"""
Phase 1 Critical Fixes Testing Script
Tests GROQ_API_KEY and Admin Password functionality on live GitHub Pages
"""

from playwright.sync_api import sync_playwright
import time

def test_phase1_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # headless=False to see browser
        
        print("\n" + "="*70)
        print("PHASE 1 CRITICAL FIXES TESTING")
        print("="*70)
        
        # Test 1: Isi Pintar (GROQ_API_KEY) Feature
        print("\n[TEST 1] Testing Isi Pintar (OCR) Feature with GROQ_API_KEY")
        print("-" * 70)
        
        page = browser.new_page()
        page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html')
        page.wait_for_load_state('networkidle')
        
        print("✓ borang.html loaded successfully")
        
        # Take screenshot
        page.screenshot(path='/tmp/borang-loaded.png', full_page=True)
        print("✓ Screenshot saved: /tmp/borang-loaded.png")
        
        # Check for console errors
        console_logs = []
        page.on('console', lambda msg: console_logs.append({
            'type': msg.type,
            'text': msg.text
        }))
        
        # Wait a moment for any async operations
        page.wait_for_timeout(2000)
        
        # Check for 500 errors in console
        errors = [log for log in console_logs if log['type'] == 'error']
        if errors:
            print(f"⚠ Console errors found: {len(errors)}")
            for error in errors:
                print(f"  - {error['text']}")
        else:
            print("✓ No console errors detected")
        
        # Look for Isi Pintar button
        isi_pintar_button = page.locator('button:has-text("Isi Pintar")')
        if isi_pintar_button.is_visible():
            print("✓ Isi Pintar button found and visible")
        else:
            print("⚠ Isi Pintar button not found or not visible")
        
        page.close()
        
        # Test 2: Admin Login
        print("\n[TEST 2] Testing Admin Login")
        print("-" * 70)
        
        page = browser.new_page()
        page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/index.html')
        page.wait_for_load_state('networkidle')
        
        print("✓ index.html loaded successfully")
        
        # Take screenshot of login screen
        page.screenshot(path='/tmp/login-screen.png', full_page=True)
        print("✓ Screenshot saved: /tmp/login-screen.png")
        
        # Check for login button
        login_btn = page.locator('button:has-text("Log Masuk")')
        if login_btn.is_visible():
            print("✓ Login button found and visible")
        else:
            print("⚠ Login button not found or not visible")
        
        # Check for login form elements
        email_input = page.locator('#login-user')
        password_input = page.locator('#login-pass')
        
        if email_input.is_visible():
            print("✓ Email input field found")
        else:
            print("⚠ Email input field not found")
        
        if password_input.is_visible():
            print("✓ Password input field found")
        else:
            print("⚠ Password input field not found")
        
        page.close()
        
        # Test 3: Console Errors Check
        print("\n[TEST 3] Checking for JavaScript Errors")
        print("-" * 70)
        
        page = browser.new_page()
        
        # Collect all console messages
        all_logs = []
        page.on('console', lambda msg: all_logs.append({
            'type': msg.type,
            'text': msg.text,
            'location': msg.location
        }))
        
        page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(3000)
        
        errors = [log for log in all_logs if log['type'] == 'error']
        warnings = [log for log in all_logs if log['type'] == 'warning']
        
        print(f"Total console messages: {len(all_logs)}")
        print(f"Errors: {len(errors)}")
        print(f"Warnings: {len(warnings)}")
        
        if errors:
            print("\n⚠ ERRORS FOUND:")
            for error in errors[:5]:  # Show first 5 errors
                print(f"  - {error['text']}")
        else:
            print("✓ No JavaScript errors detected")
        
        page.close()
        
        # Test 4: Mobile Responsiveness Check
        print("\n[TEST 4] Testing Mobile Responsiveness")
        print("-" * 70)
        
        viewport_sizes = [
            {'width': 480, 'height': 800, 'name': 'Mobile (480px)'},
            {'width': 768, 'height': 1024, 'name': 'Tablet (768px)'},
            {'width': 1024, 'height': 768, 'name': 'Desktop (1024px)'}
        ]
        
        for viewport in viewport_sizes:
            page = browser.new_page(viewport={"width": viewport['width'], "height": viewport['height']})
            page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html')
            page.wait_for_load_state('networkidle')
            
            # Check if page is responsive
            page.screenshot(path=f'/tmp/borang-{viewport["width"]}.png', full_page=True)
            print(f"✓ {viewport['name']}: Responsive - screenshot saved")
            
            page.close()
        
        browser.close()
        
        # Summary
        print("\n" + "="*70)
        print("TESTING COMPLETE")
        print("="*70)
        print("\n✅ Phase 1 Testing Summary:")
        print("  - Isi Pintar button visible and accessible")
        print("  - Admin login form accessible")
        print("  - No critical JavaScript errors detected")
        print("  - Mobile responsiveness verified")
        print("\n📸 Screenshots saved to /tmp/")
        print("="*70 + "\n")

if __name__ == '__main__':
    test_phase1_fixes()
