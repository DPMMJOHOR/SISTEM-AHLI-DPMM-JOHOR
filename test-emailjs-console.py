#!/usr/bin/env python3
"""
Test EmailJS configuration and submission via browser console
This bypasses the form UI and directly tests the submission logic
"""

from playwright.sync_api import sync_playwright
import time

def test_via_console():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("=== Testing EmailJS via Console ===\n")
        
        # Navigate to local form
        print("1. Navigating to form...")
        page.goto('http://localhost:8080/borang.html')
        page.wait_for_load_state('networkidle')
        print("✅ Page loaded")
        
        # Check EmailJS configuration
        print("\n2. Checking EmailJS configuration...")
        config_check = page.evaluate('''
            () => {
                return {
                    emailjsLoaded: typeof emailjs !== 'undefined',
                    configLoaded: typeof window.CONFIG !== 'undefined',
                    serviceId: window.CONFIG?.EMAILJS_SERVICE_ID,
                    publicKey: window.CONFIG?.EMAILJS_PUBLIC_KEY,
                    adminTemplate: window.CONFIG?.EMAILJS_ADMIN_TEMPLATE_ID,
                    applicantTemplate: window.CONFIG?.EMAILJS_APPLICANT_TEMPLATE_ID
                };
            }
        ''')
        
        print(f"   EmailJS loaded: {config_check['emailjsLoaded']}")
        print(f"   Config loaded: {config_check['configLoaded']}")
        print(f"   Service ID: {config_check['serviceId']}")
        print(f"   Public Key: {config_check['publicKey']}")
        print(f"   Admin Template: {config_check['adminTemplate']}")
        print(f"   Applicant Template: {config_check['applicantTemplate']}")
        
        if not config_check['emailjsLoaded'] or not config_check['configLoaded']:
            print("❌ EmailJS not properly configured")
            browser.close()
            return False
        
        print("✅ EmailJS configuration verified")
        
        # Direct database insertion test
        print("\n3. Testing database insertion...")
        ref_id = f"TEST-{int(time.time())}"
        
        insert_result = page.evaluate(f'''
            async () => {{
                const payload = {{
                    ref_id: "{ref_id}",
                    nama_entiti: "Test Enterprise EmailJS",
                    no_pendaftaran: "TEST123456",
                    alamat: "Test Address 123",
                    poskod: "80000",
                    bandar: "Johor Bahru",
                    negeri: "Johor",
                    emel_syarikat: "muhdfarihan@gmail.com",
                    proksi_nama: "Test User",
                    proksi_ic: "901010101555",
                    proksi_emel: "muhdfarihan@gmail.com",
                    nama_lengkap_pemohon: "Test User",
                    no_kad_pengenal: "901010101555",
                    no_tel_bimbit: "0123456789",
                    tempoh_yuran: 1,
                    jumlah_fi_daftar: 50,
                    jumlah_yuran: 50,
                    jumlah_bayar: 100,
                    kaedah_bayar: "Online Transfer",
                    status: "BARU",
                    submitted_at: new Date().toISOString()
                }};
                
                try {{
                    const {{ data, error }} = await window.sb
                        .from('PERMOHONAN_AHLI')
                        .insert([payload])
                        .select()
                        .single();
                    
                    if (error) {{
                        return {{ success: false, error: error.message }};
                    }}
                    
                    return {{ success: true, data: data }};
                }} catch (e) {{
                    return {{ success: false, error: e.message }};
                }}
            }}
        ''')
        
        print(f"   Insert result: {insert_result}")
        
        if insert_result['success']:
            print(f"✅ Database insertion successful")
            print(f"   Reference ID: {ref_id}")
            print(f"   Record ID: {insert_result['data']['id']}")
        else:
            print(f"❌ Database insertion failed: {insert_result['error']}")
            browser.close()
            return False
        
        # Test EmailJS send (admin)
        print("\n4. Testing EmailJS send to admin...")
        admin_email_result = page.evaluate(f'''
            async () => {{
                const params = {{
                    ref_id: "{ref_id}",
                    nama_entiti: "Test Enterprise EmailJS",
                    proksi_nama: "Test User",
                    proksi_hp: "0123456789",
                    proksi_emel: "muhdfarihan@gmail.com",
                    jumlah: "RM 100",
                    tarikh: new Date().toLocaleDateString('ms-MY'),
                    ip_address: "127.0.0.1",
                    pesan: "[TEST] Permohonan baharu diterima."
                }};
                
                try {{
                    const response = await emailjs.send(
                        window.CONFIG.EMAILJS_SERVICE_ID,
                        window.CONFIG.EMAILJS_ADMIN_TEMPLATE_ID,
                        params
                    );
                    return {{ success: true, response: response }};
                }} catch (e) {{
                    return {{ success: false, error: e.message }};
                }}
            }}
        ''')
        
        print(f"   Admin email result: {admin_email_result}")
        
        if admin_email_result['success']:
            print("✅ Admin email sent successfully")
        else:
            print(f"⚠️ Admin email failed: {admin_email_result['error']}")
        
        # Test EmailJS send (applicant)
        print("\n5. Testing EmailJS send to applicant...")
        applicant_email_result = page.evaluate(f'''
            async () => {{
                const params = {{
                    ref_id: "{ref_id}",
                    nama_entiti: "Test Enterprise EmailJS",
                    proksi_nama: "Test User",
                    proksi_hp: "0123456789",
                    proksi_emel: "muhdfarihan@gmail.com",
                    jumlah: "RM 100",
                    tarikh: new Date().toLocaleDateString('ms-MY'),
                    ip_address: "127.0.0.1",
                    pesan: "[TEST] Terima kasih kerana menghantar permohonan."
                }};
                
                try {{
                    const response = await emailjs.send(
                        window.CONFIG.EMAILJS_SERVICE_ID,
                        window.CONFIG.EMAILJS_APPLICANT_TEMPLATE_ID,
                        params
                    );
                    return {{ success: true, response: response }};
                }} catch (e) {{
                    return {{ success: false, error: e.message }};
                }}
            }}
        ''')
        
        print(f"   Applicant email result: {applicant_email_result}")
        
        if applicant_email_result['success']:
            print("✅ Applicant email sent successfully")
        else:
            print(f"⚠️ Applicant email failed: {applicant_email_result['error']}")
        
        print("\n=== Test Complete ===")
        print(f"Reference ID: {ref_id}")
        print("Please check:")
        print("1. Email inbox for muhdfarihan@gmail.com (applicant email)")
        print("2. Admin email inbox (dpmmnj.pengurusan@gmail.com)")
        print("3. Dashboard at http://localhost:8080/index.html")
        print("   Navigate to 'PERMOHONAN AHLI' tab and check for new submission")
        
        print("\nBrowser will remain open for 30 seconds...")
        time.sleep(30)
        
        browser.close()
        return True

if __name__ == '__main__':
    test_via_console()
