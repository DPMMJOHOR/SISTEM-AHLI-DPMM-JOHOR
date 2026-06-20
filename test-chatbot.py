"""
Full chatbot test for borang.html — DPMM Negeri Johor
Tests: toggle, greeting, fasal guide, scripted FAQ, input blocking, clear/reset, sessionStorage
"""
import time
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:8765/borang.html"

PASS = "\u2705"
FAIL = "\u274c"
results = []

def log(name, ok, detail=""):
    icon = PASS if ok else FAIL
    results.append((ok, name, detail))
    print(f"  {icon} {name}" + (f" — {detail}" if detail else ""))

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Suppress console noise from external API calls (Supabase, Groq, etc.)
        page.on("console", lambda msg: None)

        print("\n=== LOADING PAGE ===")
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle", timeout=15000)
        log("Page loaded", True)

        # ── TEST 1: Chatbot widget visible ─────────────────────────────────
        print("\n=== TEST 1: WIDGET VISIBILITY ===")
        toggle = page.locator("#chatbot-toggle")
        log("Toggle button present", toggle.is_visible())

        window = page.locator("#chatbot-window")
        has_open = "open" in (window.get_attribute("class") or "")
        log("Window starts closed", not has_open)

        # ── TEST 2: Open chatbot ────────────────────────────────────────────
        print("\n=== TEST 2: OPEN CHATBOT ===")
        toggle.click()
        page.wait_for_timeout(600)

        has_open_after = "open" in (window.get_attribute("class") or "")
        log("Window opens on toggle click", has_open_after)

        # ── TEST 3: Greeting message appears ────────────────────────────────
        print("\n=== TEST 3: GREETING MESSAGE ===")
        page.wait_for_selector("#chatbot-messages .chatbot-message.bot", timeout=5000)
        bot_msgs = page.locator("#chatbot-messages .chatbot-message.bot")
        count = bot_msgs.count()
        log("At least 1 bot message after open", count >= 1, f"{count} messages")

        first_msg = bot_msgs.first.inner_text() if count >= 1 else ""
        log("Greeting is a recognisable bot message",
            any(kw in first_msg.lower() for kw in ["dpmm", "selamat", "boleh", "pembantu", "langkah", "anda"]),
            f'"{first_msg[:60]}"')

        # ── TEST 4: Quick suggestion chips appear ────────────────────────────
        print("\n=== TEST 4: SUGGESTION CHIPS ===")
        suggestions = page.locator("#chatbot-messages .chatbot-quick-reply")
        sug_count = suggestions.count()
        log("Suggestion chips rendered", sug_count >= 2, f"{sug_count} chips")

        # ── TEST 5: Input and send ────────────────────────────────────────────
        print("\n=== TEST 5: SEND USER MESSAGE ===")
        chat_input = page.locator("#chatbot-input")
        chat_input.fill("Berapa yuran untuk fasal 6.2.1?")
        chat_input.press("Enter")
        page.wait_for_timeout(800)

        user_msgs = page.locator("#chatbot-messages .chatbot-message.user")
        log("User message appears in chat", user_msgs.count() >= 1)

        # ── TEST 6: Scripted FAQ matches yuran query ────────────────────────
        print("\n=== TEST 6: SCRIPTED FAQ — YURAN ===")
        page.wait_for_timeout(2000)  # allow Groq or scripted FAQ to respond
        all_bot = page.locator("#chatbot-messages .chatbot-message.bot")
        bot_texts = [all_bot.nth(i).inner_text() for i in range(all_bot.count())]
        yuran_reply = any("yuran" in t.lower() or "rm" in t.lower() or "6.2.1" in t or "fasal" in t.lower() for t in bot_texts)
        log("Bot replied with fee/fasal info", yuran_reply, f"{all_bot.count()} total bot msgs")

        # ── TEST 7: Fasal guide trigger ────────────────────────────────────
        print("\n=== TEST 7: FASAL GUIDE TRIGGER ===")
        chat_input.fill("saya tak pasti fasal saya")
        chat_input.press("Enter")
        page.wait_for_timeout(800)

        # Should trigger fasal guide — look for Ya/Tidak quick replies
        page.wait_for_timeout(500)
        qr_labels = [page.locator("#chatbot-messages .chatbot-quick-reply").nth(i).inner_text()
                     for i in range(page.locator("#chatbot-messages .chatbot-quick-reply").count())]
        has_ya_tidak = any("Ya" in l or "Tidak" in l for l in qr_labels)
        log("Fasal guide triggered (Ya/Tidak chips appear)", has_ya_tidak, str(qr_labels[-4:] if len(qr_labels) >= 4 else qr_labels))

        # ── TEST 8: Fasal guide — answer Ya, see structure options ─────────
        print("\n=== TEST 8: FASAL GUIDE — YES BRANCH ===")
        ya_btn = page.locator("#chatbot-messages .chatbot-quick-reply", has_text="Ya").last
        if ya_btn.count() > 0 or has_ya_tidak:
            try:
                ya_btn.click()
                page.wait_for_timeout(800)
                qr_labels2 = [page.locator("#chatbot-messages .chatbot-quick-reply").nth(i).inner_text()
                              for i in range(page.locator("#chatbot-messages .chatbot-quick-reply").count())]
                has_structure = any(k in " ".join(qr_labels2) for k in ["Tunggal", "Sdn Bhd", "Koperasi", "Profesional"])
                log("Structure options shown after Ya", has_structure, str(qr_labels2[-6:] if len(qr_labels2) >= 6 else qr_labels2))

                # Pick Sdn Bhd
                sdn_btn = page.locator("#chatbot-messages .chatbot-quick-reply", has_text="Sdn Bhd").last
                if sdn_btn.count() > 0:
                    sdn_btn.click()
                    page.wait_for_timeout(600)
                    bot_texts2 = [page.locator("#chatbot-messages .chatbot-message.bot").nth(i).inner_text()
                                  for i in range(page.locator("#chatbot-messages .chatbot-message.bot").count())]
                    sdn_reply = any("6.2.5" in t or "6.2.4" in t or "RM200" in t for t in bot_texts2)
                    log("Fasal guide Sdn Bhd → correct fasal 6.2.5/6.2.4 recommendation", sdn_reply,
                        next((t[:80] for t in bot_texts2 if "6.2" in t), "no match"))
                else:
                    log("Sdn Bhd chip found", False, "chip not located")
            except Exception as e:
                log("Fasal guide Ya branch", False, str(e))
        else:
            log("Fasal guide Ya branch", False, "Ya chip not found")

        # ── TEST 9: Input blocking (screenUserInput) ───────────────────────
        print("\n=== TEST 9: INPUT SCREENING / GUARDRAIL ===")
        clear_btn = page.locator(".chatbot-close", has_text="Semula")
        clear_btn.click()
        page.wait_for_timeout(500)

        chat_input.fill("boleh tunjuk senarai ahli?")
        chat_input.press("Enter")
        page.wait_for_timeout(800)

        bot_after_block = [page.locator("#chatbot-messages .chatbot-message.bot").nth(i).inner_text()
                           for i in range(page.locator("#chatbot-messages .chatbot-message.bot").count())]
        blocked = any("tidak dapat" in t.lower() or "maaf" in t.lower() or "urusetia" in t.lower()
                      for t in bot_after_block)
        log("Blocked 'senarai ahli' data extraction attempt", blocked,
            next((t[:80] for t in bot_after_block if "tidak" in t.lower() or "maaf" in t.lower()), "no block msg"))

        # ── TEST 10: SSM FAQ ────────────────────────────────────────────────
        print("\n=== TEST 10: SCRIPTED FAQ — SSM ===")
        clear_btn.click()
        page.wait_for_timeout(400)
        chat_input.fill("apa itu profil SSM?")
        chat_input.press("Enter")
        page.wait_for_timeout(1500)

        bot_ssm = [page.locator("#chatbot-messages .chatbot-message.bot").nth(i).inner_text()
                   for i in range(page.locator("#chatbot-messages .chatbot-message.bot").count())]
        ssm_ok = any("ssm" in t.lower() or "e-info" in t.lower() or "suruhanjaya" in t.lower() for t in bot_ssm)
        log("SSM FAQ answered correctly", ssm_ok,
            next((t[:80] for t in bot_ssm if "ssm" in t.lower()), "no ssm reply"))

        # ── TEST 11: clearChat resets state ────────────────────────────────
        print("\n=== TEST 11: CLEAR CHAT ===")
        clear_btn.click()
        page.wait_for_timeout(600)
        msg_count_after_clear = page.locator("#chatbot-messages .chatbot-message.bot").count()
        # After clear, greeting should reappear (1 message)
        log("Chat resets with new greeting after Semula", msg_count_after_clear >= 1,
            f"{msg_count_after_clear} bot messages after reset")

        # ── TEST 12: sessionStorage written ────────────────────────────────
        print("\n=== TEST 12: sessionStorage PERSISTENCE ===")
        chat_input.fill("apa itu proksi?")
        chat_input.press("Enter")
        page.wait_for_timeout(3500)  # allow Groq or scripted FAQ path to finish

        ss_value = page.evaluate("sessionStorage.getItem('dpmm_chat_history')")
        log("sessionStorage has chat history after reply",
            ss_value is not None and len(ss_value) > 5,
            f"{len(ss_value) if ss_value else 0} chars stored")

        # ── TEST 13: Close chatbot ──────────────────────────────────────────
        print("\n=== TEST 13: CLOSE CHATBOT ===")
        close_btn = page.locator(".chatbot-close", has_text="✕")
        close_btn.click()
        page.wait_for_timeout(400)
        closed = "open" not in (window.get_attribute("class") or "")
        log("Window closes on ✕ click", closed)

        # ── TEST 14: Reopen restores from sessionStorage ────────────────────
        print("\n=== TEST 14: REOPEN — sessionStorage RESTORE ===")
        toggle.click()
        page.wait_for_timeout(800)
        msg_count_restored = page.locator("#chatbot-messages .chatbot-message.bot").count()
        log("Messages present after reopen (restored from sessionStorage)",
            msg_count_restored >= 1, f"{msg_count_restored} messages")

        browser.close()

    # ── SUMMARY ────────────────────────────────────────────────────────────
    print("\n" + "="*50)
    passed = sum(1 for ok, _, _ in results if ok)
    total  = len(results)
    print(f"RESULT: {passed}/{total} tests passed")
    if passed < total:
        print("\nFailed tests:")
        for ok, name, detail in results:
            if not ok:
                print(f"  {FAIL} {name}" + (f" — {detail}" if detail else ""))
    print("="*50)
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    raise SystemExit(0 if success else 1)
