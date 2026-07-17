# feat: AIMAN Language Improvements & Critical Security Fixes
**Date:** 2026-07-17  
**Origin:** docs/2026-06-01-borang-upgrade-requirements.md  
**Status:** Completed  

---

## Summary

This plan implements Phase 1 AIMAN communication enhancements (English language support, conversational tone) alongside critical security fixes identified in the audit. The work addresses user requests for AIMAN to respond in English when prompted in English, adopt a more conversational tone, and handle follow-up questions. Simultaneously, it fixes critical security issues: GROQ_KEY configuration, CSP frame-src policy, misleading SUPABASE_KEY comment, and missing toggleAdminCclerk function in index.html.

---

## Problem Frame

The current AIMAN chatbot in `borang.html` is restricted to Bahasa Malaysia responses with a formal tone and 100-word limit, which limits accessibility for English-speaking users and creates a robotic interaction experience. Additionally, the audit revealed critical security issues: GROQ_KEY falls back to placeholder, CSP blocks Turnstile CAPTCHA, misleading comments about service role keys, and missing admin clerk toggle function in index.html.

---

## Requirements

### AIMAN Communication (from user request)
- **R1:** AIMAN must support English language responses when the user asks in English
- **R2:** AIMAN must adopt a more conversational, less robotic tone
- **R3:** AIMAN must allow follow-up questions in conversation (deferred to Phase 2)

### Critical Security Fixes (from audit findings)
- **R4:** Fix GROQ_KEY configuration to prevent silent fallback to placeholder (audit finding #1)
- **R5:** Fix CSP frame-src policy to allow Turnstile CAPTCHA (audit finding #3)
- **R6:** Correct misleading SUPABASE_KEY comment that warns against service role key (audit finding #1)
- **R7:** Add missing toggleAdminClerk function to index.html (audit finding #1)

---

## Key Technical Decisions

### KTD1: Language Detection Strategy
- **Decision:** Use simple keyword-based language detection on user input (English words vs Malay words) before calling Groq API
- **Rationale:** Lightweight, no external dependencies, works within single-file constraint
- **Alternative considered:** Use Groq API to detect language (rejected: adds latency, token cost)

### KTD2: Conversational Tone Implementation
- **Decision:** Modify system prompt persona description to be "mesra dan mudah didekati" (friendly and approachable) instead of "formal tetapi mesra"
- **Rationale:** Simple prompt change, no code changes needed, aligns with user request
- **Trade-off:** Slightly longer responses, but within acceptable token limits

### KTD3: Follow-up Question Support (Deferred)
- **Decision:** Defer follow-up question capability to Phase 2 after monitoring Phase 1 token usage
- **Rationale:** Requires conversation history management and context window monitoring; evaluate token cost first
- **Note:** Conversation history exists (`_chat.history` with `maxHistory: 10`) but follow-up logic needs refinement for multi-turn conversations

### KTD4: GROQ_KEY Configuration Fix
- **Decision:** Add validation to prevent API calls when GROQ_KEY is placeholder or null
- **Rationale:** Prevents silent failures and wasted API calls
- **Trade-off:** Users without valid key will see fallback scripted FAQ instead of AI responses

### KTD5: CSP frame-src Fix
- **Decision:** Change `frame-src 'self'` to `frame-src 'self' https://challenges.cloudflare.com` in CSP meta tag
- **Rationale:** Required for Turnstile CAPTCHA to load Cloudflare challenge script
- **Security consideration:** Whitelisting specific domain instead of `*` maintains security posture

---

## Implementation Units

### U1. Update AIMAN System Prompt for English Support
**Goal:** Enable AIMAN to respond in English when user asks in English

**Requirements:** R1

**Dependencies:** None

**Files:** `borang.html` (lines 5474-5539, `buildSystemPrompt` function)

**Approach:**
- Modify language detection rule in system prompt to explicitly support English responses
- Update persona description to include English capability
- Maintain existing Malay language support as default

**Patterns to follow:** Existing system prompt structure in `borang.html`

**Test scenarios:**
- User asks "What is modal berbayar?" in English → AIMAN responds in English
- User asks "Apa itu modal berbayar?" in Malay → AIMAN responds in Malay
- User asks mixed-language question → AIMAN responds in detected language
- User switches languages mid-conversation → AIMAN adapts to new language

**Verification:** Manual testing of chatbot with English and Malay queries; verify buildSystemPrompt() function in borang.html (lines 5474-5539) contains updated language detection rule

---

### U2. Modify AIMAN Persona for Conversational Tone
**Goal:** Change AIMAN from formal to conversational tone

**Requirements:** R2

**Dependencies:** U1

**Files:** `borang.html` (lines 5474-5539, `buildSystemPrompt` function)

**Approach:**
- Update "Nada suara" from "Formal tetapi mesra" to "Mesra dan mudah didekati"
- Update "Gaya komunikasi" to emphasize conversational, action-oriented communication
- Keep 100-word limit to control token usage

**Patterns to follow:** Existing persona structure in `borang.html`

**Test scenarios:**
- AIMAN responses use more natural, less robotic language
- AIMAN uses phrases like "Boleh saya bantu?" instead of formal equivalents
- AIMAN maintains helpfulness while being less formal

**Verification:** Manual testing of chatbot tone across different queries

---

### U3. Fix GROQ_KEY Configuration
**Goal:** Prevent silent fallback to placeholder GROQ_KEY

**Requirements:** R4

**Dependencies:** None

**Files:** `borang.html` (lines 2872-2873, GROQ_KEY definition)

**Approach:**
- Add validation in `isKeyConfigured()` to specifically check for placeholder patterns like `YOUR_` or empty string
- Add user-facing error message when GROQ_KEY is not configured
- Ensure Groq API calls are guarded by this validation

**Patterns to follow:** Existing `isKeyConfigured()` function in `borang.html`

**Test scenarios:**
- GROQ_KEY is placeholder → API call blocked, shows fallback FAQ
- GROQ_KEY is null → API call blocked, shows fallback FAQ
- GROQ_KEY is valid → API call proceeds normally
- GROQ_KEY is empty string → API call blocked, shows fallback FAQ
- GROQ_KEY is 'YOUR_GROQ_KEY' → API call blocked, shows fallback FAQ

**Verification:** Check browser console for API call behavior and fallback activation

---

### U4. Fix CSP frame-src Policy
**Goal:** Allow Turnstile CAPTCHA to load by fixing CSP frame-src

**Requirements:** R5

**Dependencies:** None

**Files:** `borang.html` (line 11, CSP meta tag)

**Approach:**
- Change `frame-src 'self'` to `frame-src 'self' https://challenges.cloudflare.com`
- Keep other CSP directives unchanged

**Patterns to follow:** Existing CSP structure in `borang.html`

**Test scenarios:**
- Turnstile CAPTCHA loads successfully on form submission
- Browser console shows no CSP violations
- Other frame sources remain blocked (security maintained)

**Verification:** Browser console CSP compliance check, Turnstile CAPTCHA functionality test

---

### U5. Correct Misleading SUPABASE_KEY Comment
**Goal:** Remove misleading comment that warns against service role key

**Requirements:** R6

**Dependencies:** None

**Files:** `borang.html` (line 29, SUPABASE_KEY definition)

**Approach:**
- Remove or correct comment that says "Service Role Key" since the value is anon key
- Add clear comment explaining this is the anon key for public form access
- Maintain existing anon key value

**Patterns to follow:** Existing key definition structure in `borang.html`

**Test scenarios:**
- Comment accurately describes the key type (anon key, not service role)
- No misleading warnings about service role key
- Anon key value remains unchanged

**Verification:** Code review of comment text

---

### U6. Add toggleAdminClerk Function to index.html
**Goal:** Add missing toggleAdminClerk function to index.html

**Requirements:** R7

**Dependencies:** None

**Files:** `index.html` (search for existing chatbot code, add function near chatbot section)

**Approach:**
- Locate chatbot-related code in index.html (search for toggleChatbot or chatbot widget section)
- Add `toggleAdminClerk()` function following same pattern as in borang.html (lines ~5545-5550)
- Ensure function handles admin clerk mode toggle UI (button or toggle switch in chatbot widget)

**Patterns to follow:** Existing `toggleChatbot()` function in `borang.html`

**Test scenarios:**
- toggleAdminClerk function exists and is callable
- Function correctly toggles admin clerk mode
- UI updates correctly when function is called

**Verification:** Open index.html, locate admin clerk toggle button, click to toggle mode, verify UI state changes between admin and clerk modes

---

## Scope Boundaries

### In Scope
- AIMAN English language support via system prompt modification
- AIMAN conversational tone via persona description update
- GROQ_KEY configuration fix with validation
- CSP frame-src policy fix for Turnstile
- SUPABASE_KEY comment correction
- toggleAdminClerk function addition to index.html

### Out of Scope
- Follow-up question capability (deferred to Phase 2 after token usage monitoring)
- Phase B2 validation and UX quick wins from requirements (deferred to separate plan)
- Phase B3 save/resume and file preview features (deferred to separate plan)
- Phase B5 accessibility improvements (deferred to separate plan)
- Reference number race condition fix (deferred to separate plan due to complexity)
- Document validation fixes (tarikh_luput, gambar passport discrepancy)

### Deferred to Follow-Up Work
- Phase 2: Follow-up question capability after Phase 1 token usage evaluation
- Phase B2: Validation and UX quick wins (poskod, modal_berbayar validation, email validation, etc.)
- Phase B3: Save/resume and file preview features
- Phase B5: Accessibility improvements (ARIA attributes, focus-visible CSS)
- Phase B1: Reference number race condition fix (requires DB sequence or UUID prefix)

---

## Open Questions

- Phase 2: Follow-up question capability after Phase 1 token usage evaluation
- Phase B2: Validation and UX quick wins (poskod, modal_berbayar validation, email validation, etc.)
- Phase B3: Save/resume and file preview features
- Phase B5: Accessibility improvements (ARIA attributes, focus-visible CSS)
- Phase B1: Reference number race condition fix (requires DB sequence or UUID prefix)

---

## System-Wide Impact

**End users:** English-speaking users can now communicate with AIMAN in their preferred language. All users benefit from more conversational, less robotic interactions.

**Security:** Critical security vulnerabilities from audit are addressed: GROQ_KEY validation prevents silent failures, CSP fix enables Turnstile CAPTCHA functionality, misleading comment prevents future service role key misconfiguration.

**Operations:** No operational impact. Changes are client-side only (HTML/JS) with no backend changes.

---

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| English language detection produces false positives | Low | Low | Keyword-based detection is simple and effective for this use case; fallback to Malay if ambiguous |
| Conversational tone increases token usage | Medium | Low | 100-word limit remains in place; monitor Groq token usage in Phase 1 with baseline measurement (capture current usage before implementation, compare after 1 week, set acceptable threshold at 20% increase over baseline) |
| CSP frame-src change introduces security exposure | Low | Low | Whitelisting specific Cloudflare domain maintains security posture |
| toggleAdminClerk function breaks existing index.html chatbot | Low | Medium | Test thoroughly on index.html before deployment; follow existing pattern from borang.html |

---

## Success Criteria

- AIMAN responds in English when user asks in English
- AIMAN adopts conversational tone in both English and Malay
- GROQ_KEY validation prevents silent fallback to placeholder
- Turnstile CAPTCHA loads successfully with CSP compliance
- SUPABASE_KEY comment accurately describes anon key (not service role)
- toggleAdminClerk function exists and works in index.html
- Critical security vulnerabilities from audit are addressed
- Groq token usage remains within acceptable limits (monitor in Phase 1 with baseline measurement)

---

## Sources & Research

**Origin document:** docs/2026-06-01-borang-upgrade-requirements.md (25 audit findings, chatbot requirements, fix priority order)

**Local research:** borang.html (lines 5474-5539 for system prompt, lines 2872-2873 for GROQ_KEY, line 11 for CSP, line 29 for SUPABASE_KEY comment, index.html for toggleAdminClerk pattern)

**External research:** None required (local patterns sufficient for all changes)
