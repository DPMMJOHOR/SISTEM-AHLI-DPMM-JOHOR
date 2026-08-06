# OpenRouter vs Groq for Isi Pintar OCR

**Date:** 2026-07-30  
**Purpose:** Compare AI providers for Isi Pintar (Smart Autofill) OCR functionality

## Current Solution: Groq via Edge Function

### Architecture
- Edge Function: `ai-proxy-fixed` hosted on Supabase
- API Provider: Groq (direct)
- Model: `qwen/qwen3.6-27b` (vision model)
- Authentication: GROQ_API_KEY environment variable

### Current Status
- ✅ Edge Function deployed
- ✅ CORS handling implemented
- ✅ Multi-page PDF support with per-page merge
- ✅ Rate limiting with exponential backoff retry
- ❌ **GROQ_API_KEY not configured** (root cause of failure)

### Groq Pricing (Current Model)
- **Model:** qwen/qwen3.6-27b
- **Input:** $0.29 per 1M tokens
- **Output:** $0.59 per 1M tokens
- **Rate Limit:** 8000 TPM (on_demand tier)
- **Free Tier:** 30 requests/min, 14,400/day on Llama 3.1 8B

### Groq Pros
✅ **Speed:** Ultra-fast inference on LPU chips (published throughput: 1,000 tokens/sec on GPT-OSS 20B, 840 on Llama 3.1 8B)  
✅ **No Platform Fee:** Pay per token with no additional charges  
✅ **Batch API:** 50% discount for batch jobs (24-hour to 7-day window)  
✅ **Zero Data Retention:** Toggle available on every account  
✅ **Simple Integration:** OpenAI-compatible API  
✅ **Free Tier:** No credit card required for testing

### Groq Cons
❌ **Limited Model Catalog:** Only 6 open-weight text models + Whisper/TTS  
❌ **No Closed Frontier Models:** Cannot access Claude, Gemini, GPT-4  
❌ **Single Provider:** No automatic failover - Groq outage = your outage  
❌ **Model Selection:** Limited to open-weight models only  
❌ **No Routing:** Cannot switch providers automatically  
❌ **Current Issue:** Requires manual GROQ_API_KEY configuration

## Alternative: OpenRouter

### Architecture
- Edge Function: `ai-proxy-fixed` (modify to use OpenRouter)
- API Provider: OpenRouter (aggregator)
- Model Options: 338 models from 57 providers
- Authentication: OPENROUTER_API_KEY environment variable

### OpenRouter Pricing (Vision Models for OCR)
**Recommended Vision Models:**
- **Qwen3 VL 235B A22B Instruct:** $0.20 input / $0.88 output per 1M tokens
- **Perceptron Mk1:** $0.15 input / $1.50 output per 1M tokens
- **Yi Vision:** Pricing varies by provider

**General Pricing:**
- **Platform Fee:** 5.5% on credit purchases ($0.80 minimum)
- **Free Tier:** 20 requests/min, 50/day on 14 free models (rises to 1,000/day after $10 credit purchase)
- **Pay-as-you-go:** Provider rates passed through unmarked
- **Enterprise:** Custom pricing available

### OpenRouter Pros
✅ **Massive Model Catalog:** 338 models from 57 providers  
✅ **Frontier Models:** Access to Claude Opus 4.8, Gemini 3.5 Flash, GPT-4  
✅ **Automatic Failover:** Routes to up to 20 provider endpoints  
✅ **Routing Controls:** Balanced (price+speed), Nitro (fastest), Exacto (accuracy)  
✅ **One API Key:** Single key for all models and providers  
✅ **OpenAI-Compatible:** Drop-in replacement for OpenAI API  
✅ **Zero Markup:** Provider rates passed through without markup  
✅ **Failed Requests Not Billed:** Zero Completion Insurance  
✅ **Free Tier:** No credit card required for testing  
✅ **Vision Support:** Multiple vision models optimized for OCR

### OpenRouter Cons
❌ **Platform Fee:** 5.5% on credit purchases  
❌ **No Batch API:** No discount for batch jobs  
❌ **Speed Variability:** Depends on provider routing (no guaranteed throughput)  
❌ **Complex Pricing:** Provider-specific rates + platform fee  
❌ **Routing Terms:** Route-specific terms and conditions apply

## Direct Comparison

| Criteria | Groq (Current) | OpenRouter (Alternative) |
|----------|-----------------|-------------------------|
| **Model Selection** | 6 models only | 338 models from 57 providers |
| **Vision Models** | Limited options | Multiple vision models available |
| **OCR Quality** | qwen/qwen3.6-27b (good) | Qwen3 VL, Perceptron Mk1, Yi Vision (excellent) |
| **Pricing** | $0.29/$0.59 per 1M tokens | $0.20/$0.88 per 1M tokens (Qwen3 VL) |
| **Platform Fee** | None | 5.5% on credit purchases |
| **Speed** | Ultra-fast (published 840-1000 tokens/sec) | Variable (depends on provider) |
| **Failover** | None (single provider) | Automatic (up to 20 endpoints) |
| **Free Tier** | 30 req/min, 14,400/day | 20 req/min, 50/day (rises to 1,000/day) |
| **Batch API** | Yes (50% discount) | No |
| **Data Retention** | Zero-retention toggle | Provider-dependent |
| **Integration** | OpenAI-compatible | OpenAI-compatible |
| **Configuration** | Requires GROQ_API_KEY | Requires OPENROUTER_API_KEY |

## Cost Comparison (Estimated)

**Scenario:** 100 OCR requests per day, average 512 tokens input, 256 tokens output

### Groq (qwen/qwen3.6-27b)
- Input: 100 × 512 = 51,200 tokens/day = 1.536M tokens/month
- Output: 100 × 256 = 25,600 tokens/day = 0.768M tokens/month
- **Monthly Cost:** (1.536 × $0.29) + (0.768 × $0.59) = $0.45 + $0.45 = **$0.90/month**

### OpenRouter (Qwen3 VL 235B A22B)
- Input: 1.536M tokens/month
- Output: 0.768M tokens/month
- **Monthly Cost:** (1.536 × $0.20) + (0.768 × $0.88) = $0.31 + $0.68 = **$0.99/month**
- **Plus 5.5% platform fee:** $0.99 × 1.055 = **$1.04/month**

**Result:** Groq is ~13% cheaper for this workload

## Migration Effort

### Option 1: Fix Current Groq Implementation
**Effort:** Very Low  
**Steps:**
1. Log in to Supabase Dashboard
2. Navigate to Edge Functions → ai-proxy-fixed
3. Add GROQ_API_KEY environment variable
4. Redeploy Edge Function
5. Test Isi Pintar

**Time:** 5-10 minutes  
**Risk:** Very Low

### Option 2: Migrate to OpenRouter
**Effort:** Medium  
**Steps:**
1. Sign up for OpenRouter account
2. Get OPENROUTER_API_KEY
3. Modify Edge Function `ai-proxy-fixed`:
   - Change API endpoint to `https://openrouter.ai/api/v1`
   - Update model selection (e.g., `qwen/qwen3-vl-235b-a22b-instruct`)
   - Add OPENROUTER_API_KEY to environment variables
4. Update `callGroqVision()` function in borang.html
5. Redeploy Edge Function
6. Test Isi Pintar

**Time:** 1-2 hours  
**Risk:** Medium (code changes required)

## Recommendations

### Recommendation 1: Fix Current Groq Implementation (Immediate)
**Rationale:**
- Minimal effort (5-10 minutes)
- No code changes required
- Proven architecture already in place
- Faster and cheaper for current workload
- Root cause is simply missing API key

**Action:**
1. Configure GROQ_API_KEY in Supabase Dashboard
2. Test Isi Pintar functionality
3. Monitor performance and accuracy

### Recommendation 2: Consider OpenRouter for Future (Strategic)
**Rationale:**
- Access to frontier models (Claude, Gemini) if needed
- Automatic failover for reliability
- Better vision models available (Perceptron Mk1, Qwen3 VL)
- Single API key for multiple use cases

**When to Consider:**
- If Groq accuracy is insufficient
- If need access to closed frontier models
- If reliability/failover becomes critical
- If expanding to other AI use cases

## Conclusion

**Immediate Action:** Configure GROQ_API_KEY in Supabase Dashboard to fix Isi Pintar

**Strategic Consideration:** OpenRouter offers better model selection and reliability at slightly higher cost. Migrate if:
- Current Groq model accuracy is insufficient
- Need access to frontier models
- Require automatic failover for production reliability
- Planning to expand AI capabilities beyond OCR

**Cost Impact:** Groq is ~13% cheaper for estimated workload, but OpenRouter's additional capabilities may justify the cost depending on future requirements.
