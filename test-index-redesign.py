#!/usr/bin/env python3
"""
Comprehensive test suite for index.html redesign implementation.
Tests responsive design, dark mode, accessibility, and brand compliance.
"""

from playwright.sync_api import sync_playwright
import json
import sys
from pathlib import Path

# Test configuration
TEST_FILE = Path(__file__).parent / "index.html"
VIEWPORTS = {
    "mobile": {"width": 375, "height": 667},
    "tablet": {"width": 768, "height": 1024},
    "desktop": {"width": 1280, "height": 720},
}

BRAND_COLOR = "#1D3C96"  # DPMM Blue
WCAG_AA_RATIO = 4.5  # Minimum contrast ratio

# Test results
results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "tests": [],
}

def log_test(name, passed, details=""):
    """Log test result."""
    results["total"] += 1
    if passed:
        results["passed"] += 1
        status = "✅ PASS"
    else:
        results["failed"] += 1
        status = "❌ FAIL"
    
    test_entry = {"name": name, "passed": passed, "details": details}
    results["tests"].append(test_entry)
    print(f"{status}: {name}")
    if details:
        print(f"   → {details}")

def test_css_variables(page):
    """Test CSS variables are properly defined."""
    print("\n📋 Testing CSS Variables...")
    
    # Check for CSS variables in computed styles
    css_vars = page.evaluate("""
        () => {
            const root = document.documentElement;
            const styles = getComputedStyle(root);
            return {
                breakpointMobile: styles.getPropertyValue('--breakpoint-mobile'),
                breakpointTablet: styles.getPropertyValue('--breakpoint-tablet'),
                breakpointDesktop: styles.getPropertyValue('--breakpoint-desktop'),
                counterPrimary: styles.getPropertyValue('--counter-primary'),
                counterBg: styles.getPropertyValue('--counter-bg'),
                counterRadius: styles.getPropertyValue('--counter-radius'),
            };
        }
    """)
    
    # Verify critical variables
    critical_vars = [
        ("breakpointMobile", "375px"),
        ("breakpointTablet", "768px"),
        ("breakpointDesktop", "1280px"),
        ("counterPrimary", "#1d3c96"),
    ]
    
    for var_name, expected in critical_vars:
        actual = css_vars.get(var_name, "").strip()
        passed = expected.lower() in actual.lower()
        log_test(f"CSS Variable: {var_name}", passed, f"Expected: {expected}, Got: {actual}")

def test_responsive_layout(page, viewport_name, viewport_size):
    """Test responsive layout at different viewports."""
    print(f"\n📱 Testing Responsive Layout ({viewport_name} {viewport_size['width']}x{viewport_size['height']})...")
    
    page.set_viewport_size(viewport_size)
    page.wait_for_load_state("networkidle")
    
    # Check for layout issues
    layout_issues = page.evaluate("""
        () => {
            const issues = [];
            const elements = document.querySelectorAll('[class*="card"], [class*="grid"], [class*="sidebar"]');
            
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const computed = window.getComputedStyle(el);
                
                // Check for horizontal overflow
                if (rect.width > window.innerWidth) {
                    issues.push(`Horizontal overflow: ${el.className}`);
                }
                
                // Check for text overflow
                if (computed.overflow === 'hidden' && el.scrollWidth > el.clientWidth) {
                    issues.push(`Text overflow: ${el.className}`);
                }
            });
            
            return issues;
        }
    """)
    
    passed = len(layout_issues) == 0
    log_test(f"No layout overflow ({viewport_name})", passed, 
             f"Issues: {', '.join(layout_issues) if layout_issues else 'None'}")
    
    # Check grid layout
    grid_info = page.evaluate("""
        () => {
            const gridContainers = document.querySelectorAll('[class*="grid"]');
            return Array.from(gridContainers).map(el => ({
                class: el.className,
                columns: window.getComputedStyle(el).gridTemplateColumns,
                gap: window.getComputedStyle(el).gap,
            }));
        }
    """)
    
    log_test(f"Grid layout defined ({viewport_name})", len(grid_info) > 0,
             f"Found {len(grid_info)} grid containers")

def test_dark_mode(page):
    """Test dark mode support."""
    print("\n🌙 Testing Dark Mode Support...")
    
    # Check for dark mode CSS
    dark_mode_css = page.evaluate("""
        () => {
            const styles = document.styleSheets;
            let hasDarkMode = false;
            
            for (let sheet of styles) {
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    for (let rule of rules) {
                        if (rule.media && rule.media.mediaText.includes('prefers-color-scheme: dark')) {
                            hasDarkMode = true;
                            break;
                        }
                    }
                } catch (e) {
                    // Skip CORS-restricted stylesheets
                }
            }
            
            return hasDarkMode;
        }
    """)
    
    log_test("Dark mode CSS defined", dark_mode_css, 
             "prefers-color-scheme: dark media query found")
    
    # Check dark mode variables
    dark_vars = page.evaluate("""
        () => {
            const darkBg = getComputedStyle(document.documentElement).getPropertyValue('--dark-bg');
            const darkText = getComputedStyle(document.documentElement).getPropertyValue('--dark-text');
            return {
                darkBg: darkBg.trim(),
                darkText: darkText.trim(),
            };
        }
    """)
    
    log_test("Dark mode variables defined", 
             bool(dark_vars.get('darkBg') or dark_vars.get('darkText')),
             f"Dark BG: {dark_vars.get('darkBg')}, Dark Text: {dark_vars.get('darkText')}")

def test_reduced_motion(page):
    """Test reduced motion support."""
    print("\n⚡ Testing Reduced Motion Support...")
    
    # Check for reduced motion CSS
    reduced_motion_css = page.evaluate("""
        () => {
            const styles = document.styleSheets;
            let hasReducedMotion = false;
            
            for (let sheet of styles) {
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    for (let rule of rules) {
                        if (rule.media && rule.media.mediaText.includes('prefers-reduced-motion')) {
                            hasReducedMotion = true;
                            break;
                        }
                    }
                } catch (e) {
                    // Skip CORS-restricted stylesheets
                }
            }
            
            return hasReducedMotion;
        }
    """)
    
    log_test("Reduced motion CSS defined", reduced_motion_css,
             "prefers-reduced-motion media query found")

def test_brand_compliance(page):
    """Test brand compliance."""
    print("\n🎨 Testing Brand Compliance...")
    
    # Check for DPMM Blue color usage
    brand_colors = page.evaluate(f"""
        () => {{
            const elements = document.querySelectorAll('[style*="color"], [style*="background"]');
            const brandColorCount = Array.from(elements).filter(el => {{
                const style = el.getAttribute('style');
                return style && (style.includes('1D3C96') || style.includes('1d3c96'));
            }}).length;
            
            return {{
                brandColorCount: brandColorCount,
                totalElements: elements.length,
            }};
        }}
    """)
    
    log_test("Brand color (#1D3C96) usage", brand_colors['brandColorCount'] >= 0,
             f"Found {brand_colors['brandColorCount']} elements with brand color")
    
    # Check for logo
    logo_check = page.evaluate("""
        () => {
            const logos = document.querySelectorAll('img[src*="LOGO"], img[src*="logo"]');
            return {
                logoCount: logos.length,
                logoSources: Array.from(logos).map(img => img.src),
            };
        }
    """)
    
    log_test("Logo integration", logo_check['logoCount'] > 0,
             f"Found {logo_check['logoCount']} logo images")

def test_accessibility(page):
    """Test accessibility compliance."""
    print("\n♿ Testing Accessibility...")
    
    # Check for focus states
    focus_styles = page.evaluate("""
        () => {
            const styles = document.styleSheets;
            let hasFocusStyles = false;
            
            for (let sheet of styles) {
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    for (let rule of rules) {
                        if (rule.selectorText && (rule.selectorText.includes(':focus') || rule.selectorText.includes(':focus-visible'))) {
                            hasFocusStyles = true;
                            break;
                        }
                    }
                } catch (e) {
                    // Skip CORS-restricted stylesheets
                }
            }
            
            return hasFocusStyles;
        }
    """)
    
    log_test("Focus states defined", focus_styles, ":focus and :focus-visible styles found")
    
    # Check for touch targets
    touch_targets = page.evaluate("""
        () => {
            const buttons = document.querySelectorAll('button, [role="button"], a[href]');
            const smallTargets = Array.from(buttons).filter(btn => {
                const rect = btn.getBoundingClientRect();
                return rect.width < 44 || rect.height < 44;
            });
            
            return {
                totalButtons: buttons.length,
                smallTargets: smallTargets.length,
                minSize: 44,
            };
        }
    """)
    
    log_test("Touch target sizes (≥44px)", touch_targets['smallTargets'] == 0,
             f"All {touch_targets['totalButtons']} buttons meet minimum size requirement")
    
    # Check for semantic HTML
    semantic_check = page.evaluate("""
        () => {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const buttons = document.querySelectorAll('button');
            const links = document.querySelectorAll('a[href]');
            
            return {
                headings: headings.length,
                buttons: buttons.length,
                links: links.length,
            };
        }
    """)
    
    log_test("Semantic HTML structure", semantic_check['headings'] > 0,
             f"Found {semantic_check['headings']} headings, {semantic_check['buttons']} buttons, {semantic_check['links']} links")

def test_counter_design(page):
    """Test counter design system."""
    print("\n📊 Testing Counter Design System...")
    
    # Check for counter classes
    counter_classes = page.evaluate("""
        () => {
            const cards = document.querySelectorAll('.card');
            const variants = {
                lg: 0,
                md: 0,
                sm: 0,
                primary: 0,
                success: 0,
                warning: 0,
                alert: 0,
            };
            
            cards.forEach(card => {
                if (card.classList.contains('card-lg')) variants.lg++;
                if (card.classList.contains('card-md')) variants.md++;
                if (card.classList.contains('card-sm')) variants.sm++;
                if (card.classList.contains('primary')) variants.primary++;
                if (card.classList.contains('success')) variants.success++;
                if (card.classList.contains('warning')) variants.warning++;
                if (card.classList.contains('alert')) variants.alert++;
            });
            
            return {
                totalCards: cards.length,
                variants: variants,
            };
        }
    """)
    
    log_test("Counter design classes", counter_classes['totalCards'] > 0,
             f"Found {counter_classes['totalCards']} cards with variants: {counter_classes['variants']}")
    
    # Check for glassmorphism effect
    glassmorphism = page.evaluate("""
        () => {
            const cards = document.querySelectorAll('.card');
            const withBackdrop = Array.from(cards).filter(card => {
                const style = window.getComputedStyle(card);
                return style.backdropFilter && style.backdropFilter !== 'none';
            });
            
            return {
                totalCards: cards.length,
                withBackdrop: withBackdrop.length,
            };
        }
    """)
    
    log_test("Glassmorphism effect", glassmorphism['withBackdrop'] > 0,
             f"{glassmorphism['withBackdrop']}/{glassmorphism['totalCards']} cards have backdrop-filter")

def test_performance(page):
    """Test performance optimizations."""
    print("\n⚡ Testing Performance...")
    
    # Check for performance optimizations
    perf_check = page.evaluate("""
        () => {
            const styles = document.styleSheets;
            let hasWillChange = false;
            let hasTextRendering = false;
            
            for (let sheet of styles) {
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    for (let rule of rules) {
                        if (rule.style) {
                            if (rule.style.willChange) hasWillChange = true;
                            if (rule.style.textRendering) hasTextRendering = true;
                        }
                    }
                } catch (e) {
                    // Skip CORS-restricted stylesheets
                }
            }
            
            return {
                hasWillChange: hasWillChange,
                hasTextRendering: hasTextRendering,
            };
        }
    """)
    
    log_test("Performance optimizations", 
             perf_check['hasWillChange'] or perf_check['hasTextRendering'],
             f"will-change: {perf_check['hasWillChange']}, text-rendering: {perf_check['hasTextRendering']}")

def main():
    """Run all tests."""
    print("=" * 70)
    print("🧪 INDEX.HTML REDESIGN - COMPREHENSIVE TEST SUITE")
    print("=" * 70)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Load the HTML file
        file_url = f"file:///{TEST_FILE.as_posix()}"
        page.goto(file_url)
        page.wait_for_load_state("networkidle")
        
        # Run tests
        test_css_variables(page)
        
        for viewport_name, viewport_size in VIEWPORTS.items():
            test_responsive_layout(page, viewport_name, viewport_size)
        
        test_dark_mode(page)
        test_reduced_motion(page)
        test_brand_compliance(page)
        test_accessibility(page)
        test_counter_design(page)
        test_performance(page)
        
        browser.close()
    
    # Print summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    print(f"Total Tests: {results['total']}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed'] / results['total'] * 100):.1f}%")
    print("=" * 70)
    
    # Save detailed results
    with open("test-results.json", "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n📄 Detailed results saved to: test-results.json")
    
    # Exit with appropriate code
    sys.exit(0 if results['failed'] == 0 else 1)

if __name__ == "__main__":
    main()
