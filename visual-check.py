"""Quick visual screenshot of the Aiman chatbot widget."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto("http://localhost:8765/borang.html")
    page.wait_for_load_state("networkidle", timeout=12000)

    # Open chatbot
    page.locator("#chatbot-toggle").click()
    page.wait_for_timeout(800)

    # Screenshot of full page (widget visible bottom-right)
    page.screenshot(path="screenshot-aiman-widget.png", full_page=False)
    print("Full page screenshot saved: screenshot-aiman-widget.png")

    # Crop just the widget area — scroll into view then screenshot element
    widget = page.locator("#chatbot-window")
    widget.screenshot(path="screenshot-aiman-header.png")
    print("Widget screenshot saved: screenshot-aiman-header.png")

    browser.close()
    print("Done.")
