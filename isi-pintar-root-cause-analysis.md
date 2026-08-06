# Isi Pintar Root Cause Analysis

**Date:** 2026-07-30  
**Investigation Method:** Systematic Debugging

## Phase 1: Root Cause Investigation

### Issue Description
Isi Pintar (Smart Autofill) feature is not working. Users cannot use AI-powered document OCR to auto-fill the membership form.

### Error Tracing

**Call Flow:**
1. User clicks "Isi Pintar" button
2. Uploads document (IC + SSM)
3. `runIsiPintar()` function called (line 7334)
4. Calls `fileToImages()` to convert document to images (line 7341)
5. Calls `extractFromConsolidated()` to extract data (line 7342)
6. `extractFromConsolidated()` calls `extractAcrossPages()` (line 7239)
7. `extractAcrossPages()` calls `callGroqVision()` for each page (line 7122)
8. `callGroqVision()` makes POST request to Edge Function (line 7078)

**API Call:**
```javascript
var response = await fetch('https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/ai-proxy-fixed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'groq',
    type: 'vision',
    model: 'qwen/qwen3.6-27b',
    messages: [{ role: 'user', content: content }],
    max_tokens: 512
  })
});
```

### Root Cause Identified

**Primary Issue:** Missing `GROQ_API_KEY` environment variable in Supabase Dashboard

**Evidence:**
- Edge Function `ai-proxy-fixed` requires GROQ_API_KEY to authenticate with Groq API
- Without the API key, the Edge Function returns HTTP 500 error
- This causes `callGroqVision()` to throw error: "AI API error 500"
- Error propagates up: `extractAcrossPages()` → `extractFromConsolidated()` → `runIsiPintar()`
- User sees error message: "Tidak dapat membaca dokumen. Sila cuba semula atau isi borang secara manual."

**Configuration Status:**
- Edge Function deployed: ✅ Yes (ai-proxy-fixed)
- CORS handling: ✅ Fixed
- Multi-page PDF support: ✅ Implemented
- Rate limiting with retry: ✅ Implemented
- **GROQ_API_KEY configured:** ❌ NO

### Secondary Issues

**Rate Limiting:**
- Groq has rate limits (8000 TPM for on_demand tier)
- Current implementation has retry logic with exponential backoff
- If rate limit exceeded, user sees error after 3 retries

**Model Selection:**
- Using `qwen/qwen3.6-27b` model
- This is a good model for OCR but may not be optimal for Malaysian documents
- Alternative models could provide better accuracy

## Phase 2: Pattern Analysis

### Working Similar Code
- Email sending via Edge Function works correctly
- Other Edge Functions (email-with-pdf) have proper environment variables configured

### Difference
- `email-with-pdf` Edge Function has SMTP environment variables configured
- `ai-proxy-fixed` Edge Function is missing GROQ_API_KEY

### Dependencies
- Supabase Edge Functions require environment variables set in Dashboard
- Cannot be set via code or migrations
- Must be manually configured by project owner

## Phase 3: Hypothesis

**Hypothesis:** Isi Pintar feature fails because GROQ_API_KEY is not configured in Supabase Dashboard environment variables for the ai-proxy-fixed Edge Function.

**Test:** Configure GROQ_API_KEY in Supabase Dashboard → Edge Function will authenticate successfully → OCR will work.

## Phase 4: Implementation

### Fix Required

**Action:** Configure GROQ_API_KEY in Supabase Dashboard

**Steps:**
1. Log in to Supabase Dashboard
2. Navigate to Edge Functions
3. Select `ai-proxy-fixed` function
4. Go to Environment Variables
5. Add `GROQ_API_KEY` with actual Groq API key
6. Redeploy Edge Function
7. Test Isi Pintar feature

### Verification
After configuration, test:
1. Upload IC + SSM document
2. Click "Analyze" button
3. Verify form fields auto-fill correctly
4. Check Edge Function logs for successful API calls

## Alternative Solutions

If Groq API key cannot be obtained or configured, consider:
1. Switch to different AI provider (OpenRouter, Anthropic, etc.)
2. Use client-side OCR (Tesseract.js) - already in project for payment slips
3. Use Supabase AI (if available in plan)

## Conclusion

**Root Cause:** Missing GROQ_API_KEY environment variable in Supabase Dashboard

**Impact:** Complete failure of Isi Pintar OCR feature

**Fix:** Configure GROQ_API_KEY in Supabase Dashboard environment variables

**Complexity:** Low (manual configuration, no code changes needed)
