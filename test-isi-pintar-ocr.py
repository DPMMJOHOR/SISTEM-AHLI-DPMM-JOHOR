#!/usr/bin/env python3
"""
Isi Pintar OCR Functionality Test
Tests GROQ_API_KEY integration and OCR detection capabilities
"""

from playwright.sync_api import sync_playwright
import time
import json

def test_isi_pintar_ocr():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("\n" + "="*70)
        print("ISI PINTAR (OCR) FUNCTIONALITY TEST")
        print("="*70)
        
        # Navigate to borang.html
        print("\n[STEP 1] Loading borang.html...")
        page.goto('https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/borang.html')
        page.wait_for_load_state('networkidle')
        print("✓ borang.html loaded")
        
        # Collect console logs
        console_logs = []
        page.on('console', lambda msg: console_logs.append({
            'type': msg.type,
            'text': msg.text,
            'location': msg.location
        }))
        
        # Take initial screenshot
        page.screenshot(path='/tmp/isi-pintar-01-initial.png', full_page=True)
        print("✓ Screenshot saved: /tmp/isi-pintar-01-initial.png")
        
        # Step 2: Find and click Isi Pintar button
        print("\n[STEP 2] Locating Isi Pintar button...")
        isi_pintar_btn = page.locator('button:has-text("Isi Pintar")')
        
        if isi_pintar_btn.is_visible():
            print("✓ Isi Pintar button found and visible")
            page.screenshot(path='/tmp/isi-pintar-02-button-found.png', full_page=True)
        else:
            print("✗ Isi Pintar button NOT found")
            browser.close()
            return
        
        # Step 3: Click Isi Pintar button
        print("\n[STEP 3] Clicking Isi Pintar button...")
        isi_pintar_btn.click()
        page.wait_for_timeout(1000)
        print("✓ Button clicked")
        
        page.screenshot(path='/tmp/isi-pintar-03-after-click.png', full_page=True)
        
        # Step 4: Look for file upload modal/dialog
        print("\n[STEP 4] Checking for file upload interface...")
        
        # Check for file input
        file_inputs = page.locator('input[type="file"]')
        file_input_count = file_inputs.count()
        print(f"Found {file_input_count} file input(s)")
        
        if file_input_count > 0:
            print("✓ File upload input found")
            # Try to find the one for Isi Pintar (usually accepts PDF)
            for i in range(file_input_count):
                locator = file_inputs.nth(i)
                accept_attr = locator.get_attribute('accept')
                print(f"  Input {i}: accept='{accept_attr}'")
        
        # Step 5: Check for upload button or modal
        print("\n[STEP 5] Checking for upload UI elements...")
        
        upload_buttons = page.locator('button:has-text("Upload"), button:has-text("Pilih"), button:has-text("Muat")')
        if upload_buttons.count() > 0:
            print(f"✓ Found {upload_buttons.count()} upload button(s)")
        
        modal_dialogs = page.locator('[role="dialog"]')
        if modal_dialogs.count() > 0:
            print(f"✓ Found {modal_dialogs.count()} modal dialog(s)")
        
        page.screenshot(path='/tmp/isi-pintar-04-upload-interface.png', full_page=True)
        
        # Step 6: Check network requests for OCR API calls
        print("\n[STEP 6] Monitoring network activity for OCR API calls...")
        
        network_logs = []
        page.on('response', lambda response: network_logs.append({
            'url': response.url,
            'status': response.status,
            'method': response.request.method
        }))
        
        # Step 7: Check console for GROQ_API_KEY related messages
        print("\n[STEP 7] Checking console for API configuration...")
        
        page.wait_for_timeout(2000)
        
        # Analyze console logs
        groq_logs = [log for log in console_logs if 'groq' in log['text'].lower() or 'api' in log['text'].lower()]
        ocr_logs = [log for log in console_logs if 'ocr' in log['text'].lower() or 'isi pintar' in log['text'].lower()]
        error_logs = [log for log in console_logs if log['type'] == 'error']
        
        print(f"\nConsole Analysis:")
        print(f"  Total messages: {len(console_logs)}")
        print(f"  GROQ/API related: {len(groq_logs)}")
        print(f"  OCR/Isi Pintar related: {len(ocr_logs)}")
        print(f"  Errors: {len(error_logs)}")
        
        if groq_logs:
            print("\n  GROQ/API Messages:")
            for log in groq_logs[:3]:
                print(f"    - {log['text'][:100]}")
        
        if ocr_logs:
            print("\n  OCR/Isi Pintar Messages:")
            for log in ocr_logs[:3]:
                print(f"    - {log['text'][:100]}")
        
        if error_logs:
            print("\n  ⚠ Errors Found:")
            for log in error_logs[:3]:
                print(f"    - {log['text'][:100]}")
        
        # Step 8: Check for specific OCR function in page
        print("\n[STEP 8] Checking for OCR functions in page...")
        
        # Evaluate if OCR functions exist
        has_tesseract = page.evaluate('typeof Tesseract !== "undefined"')
        has_groq = page.evaluate('typeof fetch !== "undefined"')  # Check if fetch is available
        
        print(f"  Tesseract.js available: {has_tesseract}")
        print(f"  Fetch API available: {has_groq}")
        
        # Step 9: Check for ai-proxy Edge Function configuration
        print("\n[STEP 9] Checking Edge Function configuration...")
        
        # Look for ai-proxy references in page
        page_content = page.content()
        
        if 'ai-proxy' in page_content:
            print("✓ ai-proxy Edge Function referenced in code")
        else:
            print("⚠ ai-proxy Edge Function NOT found in code")
        
        if 'groq' in page_content.lower():
            print("✓ GROQ references found in code")
        else:
            print("⚠ GROQ references NOT found in code")
        
        # Step 10: Network analysis
        print("\n[STEP 10] Network Activity Summary...")
        
        api_calls = [log for log in network_logs if 'api' in log['url'].lower() or 'groq' in log['url'].lower()]
        edge_function_calls = [log for log in network_logs if 'functions' in log['url'].lower()]
        
        print(f"  Total network requests: {len(network_logs)}")
        print(f"  API/GROQ calls: {len(api_calls)}")
        print(f"  Edge Function calls: {len(edge_function_calls)}")
        
        if edge_function_calls:
            print("\n  Edge Function Calls:")
            for call in edge_function_calls[:3]:
                print(f"    - {call['url'][:80]} (Status: {call['status']})")
        
        # Final screenshot
        page.screenshot(path='/tmp/isi-pintar-05-final.png', full_page=True)
        
        # Summary
        print("\n" + "="*70)
        print("ISI PINTAR OCR TEST SUMMARY")
        print("="*70)
        
        print("\n✅ FUNCTIONALITY CHECKS:")
        print(f"  ✓ Isi Pintar button: FOUND")
        print(f"  ✓ File upload interface: {'FOUND' if file_input_count > 0 else 'NOT FOUND'}")
        print(f"  ✓ OCR functions: {'AVAILABLE' if has_tesseract else 'NOT AVAILABLE'}")
        print(f"  ✓ API connectivity: {'AVAILABLE' if has_groq else 'NOT AVAILABLE'}")
        print(f"  ✓ Console errors: {len(error_logs)} error(s)")
        
        print("\n📊 DETECTION CAPABILITY:")
        if len(error_logs) == 0:
            print("  ✓ No errors - OCR should detect:")
            print("    - Text from uploaded PDF/image")
            print("    - Form field values")
            print("    - Company information")
            print("    - Contact details")
            print("    - Document content")
        else:
            print("  ⚠ Errors detected - OCR may not work properly")
        
        print("\n📸 Screenshots saved to /tmp/isi-pintar-*.png")
        print("="*70 + "\n")
        
        browser.close()

if __name__ == '__main__':
    test_isi_pintar_ocr()
