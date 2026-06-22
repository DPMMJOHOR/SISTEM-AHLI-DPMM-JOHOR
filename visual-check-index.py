"""Visual check — Aiman admin clerk button + header in index.html"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto("http://localhost:8765/index.html")
    page.wait_for_load_state("networkidle", timeout=15000)

    # Check if button is visible
    btn = page.locator("#admin-clerk-btn")
    print(f"Admin clerk button visible: {btn.is_visible()}")

    # Force show button if hidden (may require login in prod)
    page.evaluate("document.getElementById('admin-clerk-btn').style.display='flex'")
    page.evaluate("document.getElementById('admin-clerk-window').style.display='flex'")
    page.evaluate("document.getElementById('admin-clerk-window').classList.add('open')")
    page.wait_for_timeout(500)

    # Screenshot the button
    btn.screenshot(path="screenshot-aiman-btn.png")
    print("Button screenshot saved: screenshot-aiman-btn.png")

    # Screenshot the window header
    win = page.locator("#admin-clerk-window")
    win.screenshot(path="screenshot-aiman-admin-header.png")
    print("Admin header screenshot saved: screenshot-aiman-admin-header.png")

    browser.close()
    print("Done.")
