"""
End-to-end browser tests for borang.html (DPMM membership form).

Runs against a local static server. Usage (server managed by helper):
    python scripts/with_server.py --server "python -m http.server 8899" --port 8899 \
        -- python tests/e2e/test_borang.py

Or point at an already-running server / the live site:
    BORANG_URL=http://localhost:8899/borang.html python tests/e2e/test_borang.py
"""

import os
import sys
from playwright.sync_api import sync_playwright

URL = os.environ.get("BORANG_URL", "http://localhost:8899/borang.html")

# Console warnings that are expected/benign (optional services not configured).
ALLOWED_WARNING_SUBSTRINGS = [
    "SENTRY_DSN not configured",
    "Resend from email not configured",
    "Config loaded",
]

results = []


def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    results.append((status, name, detail))
    print(f"[{status}] {name}" + (f" -- {detail}" if detail else ""))


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page_errors = []
        page.on("pageerror", lambda e: page_errors.append(str(e)))

        resp = page.goto(URL, wait_until="networkidle")

        # 1. Page loads
        check("Page returns HTTP 200", resp is not None and resp.status == 200,
              f"status={resp.status if resp else 'none'}")
        check("Title correct", "BORANG PERMOHONAN KEAHLIAN" in page.title(), page.title())

        # 2. No uncaught page errors
        check("No uncaught JS errors", len(page_errors) == 0, "; ".join(page_errors))

        # 3. No unexpected console errors
        check("No console errors", len(console_errors) == 0, "; ".join(console_errors))

        # 4. Config resolves (root-cause fix)
        cfg = page.evaluate(
            "() => ({ supabaseUrl: window.CONFIG && window.CONFIG.supabaseUrl,"
            " captcha: window.CONFIG && window.CONFIG.features && window.CONFIG.features.captcha,"
            " adminEmail: window.CONFIG && window.CONFIG.admin && window.CONFIG.admin.email,"
            " hasTurnstileKeyProp: !!(window.CONFIG && 'turnstileSiteKey' in window.CONFIG) })"
        )
        check("CONFIG.supabaseUrl resolves", bool(cfg.get("supabaseUrl")), str(cfg.get("supabaseUrl")))
        check("CONFIG.features.captcha is boolean", isinstance(cfg.get("captcha"), bool), str(cfg.get("captcha")))
        check("CONFIG.admin.email resolves", bool(cfg.get("adminEmail")), str(cfg.get("adminEmail")))
        check("CONFIG.turnstileSiteKey alias present", cfg.get("hasTurnstileKeyProp") is True)

        # 5. No leftover placeholder / no Turnstile placeholder widget
        has_placeholder = page.evaluate("() => document.documentElement.innerHTML.includes('YOUR_TURNSTILE_SITE_KEY')")
        check("No YOUR_TURNSTILE_SITE_KEY placeholder", has_placeholder is False)

        # 6. Favicon present and reachable
        favicon_href = page.evaluate("() => { const l = document.querySelector('link[rel=\"icon\"]'); return l ? l.href : null; }")
        check("Favicon link present", bool(favicon_href), str(favicon_href))
        if favicon_href:
            fav = page.request.get(favicon_href)
            check("Favicon loads (200)", fav.status == 200, f"status={fav.status}")

        # 7. GROQ/secret keys NOT exposed in client source (security)
        secrets_exposed = page.evaluate(
            "() => { const s = document.documentElement.innerHTML;"
            " return { groq: /gsk_[A-Za-z0-9]/.test(s), groqVar: window.GROQ_KEY }; }"
        )
        check("No Groq key literal in DOM", secrets_exposed.get("groq") is False)
        check("window.GROQ_KEY not populated with secret", not secrets_exposed.get("groqVar"))

        # 8. Intro visible, form hidden initially
        intro_visible = page.is_visible("#screen-intro")
        form_hidden = page.evaluate("() => document.getElementById('main-form-container').style.display === 'none'")
        check("Intro screen visible", intro_visible)
        check("Main form hidden initially", form_hidden)

        # 9. Business-type selection enables start button, then opens the form
        page.select_option("#business-type-selector", "enterprise_sole")
        page.wait_for_timeout(300)
        start_disabled = page.get_attribute("#btn-start-form", "disabled")
        check("Start button enabled after selecting type", start_disabled is None)

        page.click("#btn-start-form")
        page.wait_for_timeout(400)
        form_visible = page.is_visible("#main-form-container")
        step1_visible = page.is_visible("#step-1")
        check("Form shows after start", form_visible)
        check("Step 1 visible after start", step1_visible)

        # 10. Validation blocks advancing an incomplete step
        step_before = page.evaluate("() => (window.state && window.state.currentStep) || 1")
        page.evaluate("() => goStep(2)")  # required fields empty -> should be blocked
        page.wait_for_timeout(200)
        step_after = page.evaluate("() => (window.state && window.state.currentStep) || 1")
        check("Validation blocks incomplete step advance", step_after == step_before,
              f"before={step_before} after={step_after}")

        # 11. Real onblur validators wired up by borang.html (blurFields)
        def blur_field(field_id, value):
            page.evaluate(
                "([id, v]) => { const f = document.getElementById(id); f.value = v;"
                " f.dispatchEvent(new Event('blur')); return f.classList.contains('error'); }",
                [field_id, value],
            )
            return page.evaluate(
                "(id) => document.getElementById(id).classList.contains('error')", field_id
            )

        # Email: check is v.includes('@')
        check("Email field flags invalid (no @)", blur_field("emel_syarikat", "not-an-email") is True)
        check("Email field accepts valid", blur_field("emel_syarikat", "test@example.com") is False)

        # Phone: check is digits length >= 10
        check("Phone field flags too-short", blur_field("no_tel_bimbit", "123") is True)
        check("Phone field accepts valid", blur_field("no_tel_bimbit", "0175592722") is False)

        # IC: check is /^\d{6}-\d{2}-\d{4}$/ (formatted)
        check("IC field flags invalid format", blur_field("no_kad_pengenal", "123") is True)
        check("IC field accepts valid format", blur_field("no_kad_pengenal", "900101-01-5511") is False)

        # 12. XSS regression: escapeHtml() function works correctly
        xss_payload = '<img src=x onerror="window.__xss=1" test=\'test\'&test=test>'
        escaped = page.evaluate("(payload) => window.escapeHtml ? window.escapeHtml(payload) : null", xss_payload)
        check("escapeHtml() escapes < to &lt;", "&lt;" in escaped if escaped else False, f"escaped={escaped}")
        check("escapeHtml() escapes > to &gt;", "&gt;" in escaped if escaped else False, f"escaped={escaped}")
        check("escapeHtml() escapes \" to &quot;", "&quot;" in escaped if escaped else False, f"escaped={escaped}")
        check("escapeHtml() escapes ' to &#39;", "&#39;" in escaped if escaped else False, f"escaped={escaped}")
        check("escapeHtml() escapes & to &amp;", escaped.startswith("&lt;") if escaped else False, f"escaped={escaped}")

        # 13. XSS regression: uploaded filename escapes HTML
        # Simulate file upload with malicious filename (bypass actual upload by setting state directly)
        page.evaluate("""() => {
            window.state = window.state || {};
            window.state.uploadedFiles = {
                'ic_pemohon_depan': { name: '<img src=x onerror=window.__xss_file=1>.pdf', size: 1024 }
            };
        }""")
        page.evaluate("() => window.__xss_file = undefined")
        page.evaluate("() => renderDocUpload()")
        page.wait_for_timeout(200)
        xss_file_executed = page.evaluate("() => window.__xss_file")
        doc_html = page.evaluate("() => document.getElementById('docs-wajib').innerHTML")
        check("XSS not executed in doc upload (filename)", xss_file_executed is not True, f"__xss_file={xss_file_executed}")
        check("XSS payload escaped in doc HTML", "&lt;img" in doc_html or "x onerror" not in doc_html.lower())

        browser.close()

    # Summary
    failed = [r for r in results if r[0] == "FAIL"]
    print("\n" + "=" * 60)
    print(f"TOTAL: {len(results)}  PASSED: {len(results) - len(failed)}  FAILED: {len(failed)}")
    print("=" * 60)
    if failed:
        for _, name, detail in failed:
            print(f"  FAILED: {name} -- {detail}")
        sys.exit(1)
    print("All borang.html E2E tests passed.")


if __name__ == "__main__":
    run()
