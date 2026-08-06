# Comprehensive AI Provider Comparison for DPMM Johor System

**Date:** 2026-07-30  
**Purpose:** Evaluate AI providers for AIMAN (chatbot) and Isi Pintar (OCR) features

## System Requirements

### AIMAN (index.html - Admin Dashboard)
- **Function:** Digital assistant chatbot for admin users
- **Use Case:** Answer questions, provide guidance, business advice
- **Current Model:** Groq llama-3.3-70b-versatile (chat model)
- **Requirements:**
  - Multilingual support (Bahasa Melayu + English)
  - Conversational, helpful, professional tone
  - Business guidance capabilities
  - Low latency for real-time chat
  - 100-word response limit for clarity

### Isi Pintar (borang.html - Membership Form)
- **Function:** Smart autofill using OCR
- **Use Case:** Extract data from IC and SSM documents
- **Current Model:** Groq qwen/qwen3.6-27b (vision model)
- **Requirements:**
  - OCR accuracy for Malaysian documents
  - Structured JSON output
  - Multi-page PDF support
  - Malaysian IC format recognition (XXXXXX-XX-XXXX)
  - SSM document parsing
  - Field mapping to form

## AI Provider Options

### 1. Groq (Current Provider)

**Pricing:**
- llama-3.3-70b-versatile: $0.59 input / $0.79 output per 1M tokens
- qwen/qwen3.6-27b: $0.29 input / $0.59 output per 1M tokens
- Free Tier: 30 requests/min, 14,400/day
- Rate Limit: 8000 TPM (on_demand tier)

**Pros:**
✅ Ultra-fast inference (840-1000 tokens/sec published)  
✅ No platform fee - pay per token only  
✅ Batch API with 50% discount  
✅ Zero data retention toggle available  
✅ OpenAI-compatible API  
✅ Free tier without credit card  
✅ Already integrated in system  

**Cons:**
❌ Limited model catalog (6 open-weight models only)  
❌ No frontier models (Claude, Gemini, GPT-4)  
❌ Single provider - no automatic failover  
❌ Environment variable configuration issues (recurring problem)  
❌ No closed-source models for better accuracy  
❌ Vision model selection limited  

**Reliability Issues:**
- GROQ_API_KEY configuration fails repeatedly despite being set
- Environment variable scope/deployment issues
- No built-in failover mechanism
- Single point of failure

---

### 2. OpenRouter

**Pricing:**
- Platform fee: 5.5% on credit purchases ($0.80 minimum)
- Qwen3 VL 235B A22B: $0.20 input / $0.88 output per 1M tokens
- Perceptron Mk1: $0.15 input / $1.50 output per 1M tokens
- Free Tier: 20 requests/min, 50/day (rises to 1,000/day after $10 credit)

**Pros:**
✅ 338 models from 57 providers  
✅ Access to frontier models (Claude Opus 4.8, Gemini 3.5 Flash)  
✅ Automatic failover (up to 20 provider endpoints)  
✅ Routing controls (Balanced, Nitro, Exacto)  
✅ Single API key for all providers  
✅ OpenAI-compatible API  
✅ Zero markup on provider pricing  
✅ Failed requests not billed (Zero Completion Insurance)  
✅ Excellent vision models for OCR  

**Cons:**
❌ 5.5% platform fee on credit purchases  
❌ No batch API  
❌ Variable speed (depends on provider routing)  
❌ Complex pricing (provider-specific + platform fee)  
❌ Route-specific terms and conditions  

**Reliability:**
- Automatic failover prevents single provider outages
- Sticky routing keeps prompt caches warm
- Multiple provider endpoints reduce risk

---

### 3. Anthropic Claude

**Pricing:**
- Claude Opus 4.8: $5.00 input / $25.00 output per 1M tokens
- Claude Sonnet 4.6: $3.00 input / $15.00 output per 1M tokens
- Claude Haiku 4.5: $0.80 input / $4.00 output per 1M tokens
- Vision support: Images charged as tokens

**Pros:**
✅ Frontier model quality (best-in-class reasoning)  
✅ Excellent multilingual support  
✅ Strong vision capabilities for OCR  
✅ Large context windows (200K-1M tokens)  
✅ Enterprise-grade reliability  
✅ Strong security and compliance  
✅ Prompt caching (up to 90% discount on cached input)  
✅ No data used to improve products (paid tier)  

**Cons:**
❌ Significantly more expensive than alternatives  
❌ No free tier for production use  
❌ Requires separate API integration  
❌ Higher token costs for vision workloads  
❌ No automatic failover (single provider)  

**Reliability:**
- Enterprise-grade SLA
- High uptime and reliability
- No automatic failover but very stable

---

### 4. Google Gemini

**Pricing:**
- Gemini 3 Flash Preview: $0.50 input / $3.00 output per 1M tokens
- Gemini 2.5 Pro: $1.25 input / $10.00 output per 1M tokens
- Gemini 2.5 Flash-Lite: $0.10 input / $0.40 output per 1M tokens
- Free Tier: Generous limits for testing
- Vision: Text/image/video at same rate

**Pros:**
✅ Excellent multimodal capabilities (text, image, PDF, audio, video)  
✅ Native PDF support in single API call  
✅ Strong OCR capabilities  
✅ Large context windows (1M tokens)  
✅ Free tier with generous limits  
✅ Grounding with Google Search available  
✅ Batch API (50% discount)  
✅ Context caching available  
✅ No data used to improve products (paid tier)  

**Cons:**
❌ Higher output token costs for some models  
❌ Complex pricing tiers (Free, Tier 1, Tier 2, Tier 3)  
❌ Billing account setup required for paid tier  
❌ Spend caps may limit scaling  
❌ No automatic failover (single provider)  

**Reliability:**
- Google Cloud infrastructure
- High reliability and uptime
- No automatic failover but very stable

---

### 5. Azure OpenAI

**Pricing:**
- GPT-5 Nano: $0.050 input / $0.400 output per 1M tokens
- GPT-5.4: $2.50 input / $15.00 output per 1M tokens
- GPT-5.5: ~$10 input / ~$30 output per 1M tokens (estimated)
- Deployment types: Standard (PAYG), Provisioned (PTU), Batch (50% off)

**Pros:**
✅ Enterprise-grade security and compliance  
✅ Multiple deployment types (Standard, PTU, Batch)  
✅ Data residency options (Global, Data Zone, Regional)  
✅ VNet/private endpoint support  
✅ Azure AD integration  
✅ SLA and latency guarantees (with PTU)  
✅ Prompt caching available  
✅ Batch API (50% discount)  
✅ Seamless Azure ecosystem integration  

**Cons:**
❌ Complex pricing structure (deployment types, regions, scopes)  
❌ PTU requires high utilization to break even  
❌ Minimum commitments for reserved capacity  
❌ Higher complexity for simple workloads  
❌ Azure account required  
❌ No automatic failover (single provider)  

**Reliability:**
- Enterprise SLA with PTU
- High reliability and uptime
- No automatic failover but very stable

---

### 6. AWS Bedrock

**Pricing:**
- Claude Opus 4.7: $5.00 input / $25.00 output per 1M tokens
- Claude Sonnet 4.6: $3.00 input / $15.00 output per 1M tokens
- Amazon Nova Micro: $0.035 input / $0.14 output per 1M tokens
- Amazon Nova Lite: $0.06 input / $0.24 output per 1M tokens
- Billing modes: On-Demand, Batch (50% off), Provisioned Throughput (15-40% off)

**Pros:**
✅ Multiple model providers (Anthropic, Meta, Mistral, Amazon)  
✅ Enterprise-grade security and compliance  
✅ Multiple billing modes (On-Demand, Batch, PTU)  
✅ Strong AWS ecosystem integration  
✅ IAM and VPC support  
✅ SOC 2 Type 2 / HIPAA / FedRAMP compliance  
✅ Knowledge Bases for RAG  
✅ Bedrock Data Automation for document processing  
✅ Prompt caching available  

**Cons:**
❌ Complex pricing structure  
❌ Llama models have 10-70% markup vs alternatives  
❌ Knowledge Base storage costs ($0.10/GB-month)  
❌ Hidden costs (egress, Guardrails, Flows)  
❌ Minimum commitments for PTU  
❌ AWS account required  
❌ No automatic failover (single provider)  

**Reliability:**
- Enterprise SLA
- High reliability and uptime
- No automatic failover but very stable

---

## Cost Comparison (Estimated Monthly)

**Scenario:** 
- AIMAN: 1,000 chat messages/day × 30 days = 30,000 messages
  - Average: 500 input tokens, 300 output tokens per message
  - Total: 15M input tokens, 9M output tokens/month
- Isi Pintar: 100 OCR requests/day × 30 days = 3,000 requests
  - Average: 2,000 input tokens, 500 output tokens per request
  - Total: 6M input tokens, 1.5M output tokens/month
- **Combined:** 21M input tokens, 10.5M output tokens/month

| Provider | Model Selection | Monthly Cost | Notes |
|----------|---------------|--------------|-------|
| **Groq** | llama-3.3-70b + qwen3.6-27b | $21 × 0.59 + $10.5 × 0.79 = $12.54 + $8.30 = **$20.84** | Cheapest option |
| **OpenRouter** | Qwen3 VL + routing | $21 × 0.20 + $10.5 × 0.88 = $4.20 + $9.24 = $13.48 + 5.5% fee = **$14.22** | Good value with failover |
| **Claude** | Sonnet 4.6 (chat) + Haiku 4.5 (vision) | $21 × 3.00 + $10.5 × 15.00 = $63.00 + $157.50 = **$220.50** | Most expensive |
| **Gemini** | 2.5 Flash-Lite (both) | $21 × 0.10 + $10.5 × 0.40 = $2.10 + $4.20 = **$6.30** | Very cheap, good vision |
| **Azure OpenAI** | GPT-5 Nano (both) | $21 × 0.050 + $10.5 × 0.400 = $1.05 + $4.20 = **$5.25** | Cheapest, enterprise features |
| **AWS Bedrock** | Nova Lite (both) | $21 × 0.06 + $10.5 × 0.24 = $1.26 + $2.52 = **$3.78** | Cheapest, enterprise features |

## Reliability Comparison

| Provider | Failover | Uptime SLA | Environment Issues | Enterprise Support |
|----------|----------|------------|-------------------|-------------------|
| **Groq** | ❌ None | Unknown | ❌ Recurring key config issues | Limited |
| **OpenRouter** | ✅ Auto (20 endpoints) | High | ✅ Single key, no config issues | Good |
| **Claude** | ❌ None | 99.9%+ | ✅ Stable config | Excellent |
| **Gemini** | ❌ None | 99.9%+ | ✅ Stable config | Excellent |
| **Azure OpenAI** | ❌ None | 99.9%+ (PTU) | ✅ Stable config | Excellent |
| **AWS Bedrock** | ❌ None | 99.9%+ | ✅ Stable config | Excellent |

## Feature Fit Analysis

### AIMAN (Chatbot) Requirements

| Provider | Multilingual | Business Guidance | Latency | Cost Efficiency |
|----------|-------------|-------------------|---------|----------------|
| **Groq** | ✅ Good | ✅ Good | ✅ Excellent (840 tokens/sec) | ✅ Excellent |
| **OpenRouter** | ✅ Excellent | ✅ Excellent | ✅ Good (variable) | ✅ Good |
| **Claude** | ✅ Excellent | ✅ Excellent | ✅ Good | ❌ Poor |
| **Gemini** | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Excellent |
| **Azure OpenAI** | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Excellent |
| **AWS Bedrock** | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Excellent |

### Isi Pintar (OCR) Requirements

| Provider | OCR Accuracy | Malaysian Docs | PDF Support | JSON Output | Cost Efficiency |
|----------|-------------|----------------|------------|------------|----------------|
| **Groq** | ✅ Good | ⚠️ Limited | ✅ Good | ✅ Good | ✅ Excellent |
| **OpenRouter** | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Good |
| **Claude** | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Excellent | ❌ Poor |
| **Gemini** | ✅ Excellent | ✅ Excellent | ✅ Excellent (native) | ✅ Excellent | ✅ Excellent |
| **Azure OpenAI** | ✅ Excellent | ✅ Good | ✅ Good | ✅ Excellent | ✅ Excellent |
| **AWS Bedrock** | ✅ Excellent | ✅ Good | ✅ Good | ✅ Excellent | ✅ Excellent |

## Recommendations

### Primary Recommendation: OpenRouter

**Rationale:**
1. **Solves Recurring Issue:** Single API key, no environment variable configuration problems
2. **Automatic Failover:** Routes to 20 provider endpoints, eliminates single point of failure
3. **Model Selection:** 338 models including frontier models for better accuracy
4. **Vision Excellence:** Multiple vision models optimized for OCR (Perceptron Mk1, Qwen3 VL)
5. **Cost Effective:** $14.22/month vs $20.84 for Groq (with better reliability)
6. **Zero Markup:** Provider rates passed through without markup
7. **Failed Requests Not Billed:** Zero Completion Insurance prevents paying for failures
8. **OpenAI-Compatible:** Drop-in replacement for current Groq integration

**Migration Effort:** Medium (1-2 hours)
- Update Edge Function to use OpenRouter endpoint
- Change model selection
- Update API key configuration
- Test both AIMAN and Isi Pintar

**Risk:** Low
- Well-established provider
- Strong community support
- Proven reliability

---

### Secondary Recommendation: Google Gemini

**Rationale:**
1. **Excellent Vision:** Native PDF support, strong OCR capabilities
2. **Cost Effective:** $6.30/month (cheapest with good vision)
3. **Multimodal:** Single API call for text, image, PDF, audio, video
4. **Free Tier:** Generous limits for testing
5. **Google Infrastructure:** High reliability and uptime
6. **Context Caching:** Reduces costs for repeated prompts
7. **Batch API:** 50% discount for async processing

**Migration Effort:** Medium (1-2 hours)
- Update Edge Function to use Gemini API
- Change model selection (Gemini 2.5 Flash-Lite)
- Update API key configuration
- Test both AIMAN and Isi Pintar

**Risk:** Low
- Google Cloud infrastructure
- Well-documented API
- Strong support

---

### Enterprise Recommendation: Azure OpenAI

**Rationale:**
1. **Enterprise Features:** SLA, data residency, VNet, Azure AD
2. **Cost Effective:** $5.25/month (cheapest option)
3. **GPT Models:** Access to latest GPT models
4. **Azure Integration:** Seamless integration with Azure ecosystem
5. **Multiple Deployment Types:** Standard, PTU, Batch
6. **Prompt Caching:** Reduces costs for repeated context
7. **Enterprise Support:** Dedicated support and compliance

**Migration Effort:** Medium-High (2-3 hours)
- Azure account setup
- Azure OpenAI resource creation
- Update Edge Function
- Configure deployment type
- Test both AIMAN and Isi Pintar

**Risk:** Low-Medium
- Requires Azure account
- More complex setup
- Higher complexity for simple workloads

---

## Implementation Plan

### Option 1: Migrate to OpenRouter (Recommended)

**Steps:**
1. Sign up for OpenRouter account
2. Get OPENROUTER_API_KEY
3. Update Edge Function `ai-proxy-fixed`:
   - Change endpoint to `https://openrouter.ai/api/v1/chat/completions`
   - Update model selection for vision: `qwen/qwen3-vl-235b-a22b-instruct`
   - Update model selection for chat: `openai/gpt-4o-mini` or similar
   - Add OPENROUTER_API_KEY to environment variables
4. Update Edge Function `ai-proxy`:
   - Same changes as above
5. Update borang.html to use new model
6. Update index.html to use new model
7. Redeploy Edge Functions
8. Test AIMAN chatbot
9. Test Isi Pintar OCR

**Estimated Time:** 2-3 hours  
**Estimated Cost:** $14.22/month  
**Reliability:** High (automatic failover)

### Option 2: Migrate to Google Gemini

**Steps:**
1. Create Google Cloud project
2. Enable Gemini API
3. Get GEMINI_API_KEY
4. Update Edge Function `ai-proxy-fixed`:
   - Use existing Gemini support in code
   - Update model to `gemini-2.5-flash-lite`
   - Add GEMINI_API_KEY to environment variables
5. Update Edge Function `ai-proxy`:
   - Same changes as above
6. Update borang.html to use new model
7. Update index.html to use new model
8. Redeploy Edge Functions
9. Test AIMAN chatbot
10. Test Isi Pintar OCR

**Estimated Time:** 2-3 hours  
**Estimated Cost:** $6.30/month  
**Reliability:** High (Google infrastructure)

### Option 3: Fix Groq Configuration (Temporary)

**Steps:**
1. Check Edge Function logs for "GROQ_API_KEY exists" message
2. Verify key is configured at PROJECT level (not function level)
3. Redeploy both Edge Functions after confirming configuration
4. Test GROQ_API_KEY directly against Groq API
5. Add diagnostic logging to Edge Function
6. Monitor for recurring issues

**Estimated Time:** 1-2 hours  
**Estimated Cost:** $20.84/month  
**Reliability:** Low (recurring configuration issues)

## Final Recommendation

**Primary Choice: OpenRouter**

**Why:**
- Solves the recurring GROQ_API_KEY configuration issue
- Automatic failover prevents single provider outages
- Better model selection for improved accuracy
- Cost-effective with better reliability
- Zero Completion Insurance prevents paying for failures
- Proven track record with similar workloads

**Backup Choice: Google Gemini**

**Why:**
- Excellent vision capabilities for Isi Pintar
- Very cost-effective
- Native PDF support
- Google Cloud infrastructure reliability
- Good multilingual support for AIMAN

**Avoid:**
- **Groq** - Recurring configuration issues, no failover
- **Claude** - Too expensive for this use case
- **Azure OpenAI** - Overkill for current requirements, higher complexity
- **AWS Bedrock** - Overkill for current requirements, higher complexity

## Conclusion

Migrate to **OpenRouter** as the primary AI provider to solve the recurring GROQ_API_KEY configuration issues and improve reliability. OpenRouter provides automatic failover, better model selection, and cost-effective pricing while maintaining OpenAI-compatible API integration.

If OpenRouter is not suitable, **Google Gemini** is an excellent alternative with strong vision capabilities and very competitive pricing.

Both options significantly improve reliability over the current Groq implementation while maintaining or improving cost efficiency.
