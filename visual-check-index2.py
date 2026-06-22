from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto("http://localhost:8765/index.html")
    page.wait_for_load_state("networkidle", timeout=15000)

    # Force open the admin clerk window
    page.evaluate("""
        var btn = document.getElementById('admin-clerk-btn');
        var win = document.getElementById('admin-clerk-window');
        btn.style.cssText = 'display:flex !important';
        win.style.cssText = 'display:flex !important; bottom:92px; right:28px;';
        win.classList.add('open');
    """)
    page.wait_for_timeout(600)

    # Full viewport screenshot — shows button + open window bottom-right
    page.screenshot(path="screenshot-index-aiman.png", full_page=False)
    print("Saved: screenshot-index-aiman.png")
    browser.close()
