# GROQ_API_KEY Investigation - Why It Fails Despite Being Configured

**Date:** 2026-07-30  
**Issue:** GROQ_API_KEY configured in secrets but Edge Function still returns 500 error

## System Architecture

### Two AI Features Using Groq

**1. AIMAN (index.html - Admin Dashboard)**
- **Purpose:** Digital assistant for admin users
- **Function:** Chatbot for answering questions, providing guidance
- **Edge Function:** `ai-proxy` (https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/ai-proxy)
- **Model:** llama-3.3-70b-versatile (chat model)
- **Code Location:** index.html line 7711

**2. Isi Pintar (borang.html - Membership Form)**
- **Purpose:** Smart autofill using OCR
- **Function:** Extract data from IC and SSM documents
- **Edge Function:** `ai-proxy-fixed` (https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/ai-proxy-fixed)
- **Model:** qwen/qwen3.6-27b (vision model)
- **Code Location:** borang.html line 7078

### Edge Function Code Analysis

Both `ai-proxy` and `ai-proxy-fixed` have identical code:

```typescript
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
console.log('GROQ_API_KEY exists:', !!GROQ_API_KEY);

if (!apiKey) {
  return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
    status: 500,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
```

## Potential Root Causes for Key Failure

### 1. Environment Variable Scope Issue
**Hypothesis:** GROQ_API_KEY configured at wrong scope level

**Supabase Environment Variable Scopes:**
- **Project-level:** Available to all Edge Functions in project
- **Function-level:** Available only to specific Edge Function
- **Local:** Available only during local development

**Investigation Needed:**
- Check if key is configured at project level or function level
- Verify both `ai-proxy` and `ai-proxy-fixed` have access
- Check if key is in secrets vs environment variables

### 2. Deployment Issue
**Hypothesis:** Edge Function deployed before environment variable was set

**Investigation Needed:**
- Check deployment timestamps
- Verify if redeployment required after adding environment variable
- Check if `supabase functions deploy` was run after key configuration

### 3. Key Validity Issue
**Hypothesis:** GROQ_API_KEY exists but is invalid/expired

**Investigation Needed:**
- Verify key is valid Groq API key
- Check if key has required permissions (vision API access)
- Test key directly against Groq API

### 4. Caching Issue
**Hypothesis:** Supabase caches environment variables and needs refresh

**Investigation Needed:**
- Check if environment variable changes require Edge Function redeployment
- Verify if Supabase has caching delay for environment variables

### 5. Case Sensitivity Issue
**Hypothesis:** Environment variable name mismatch

**Investigation Needed:**
- Verify exact variable name: `GROQ_API_KEY` vs `groq_api_key` vs `Groq_API_KEY`
- Check Edge Function code uses correct case

### 6. Regional/Instance Issue
**Hypothesis:** Edge Function deployed to different region/instance

**Investigation Needed:**
- Check Supabase project region
- Verify Edge Function deployment region matches project

## Diagnostic Steps Required

### Step 1: Check Edge Function Logs
```bash
supabase functions logs ai-proxy-fixed
```
Look for:
- "GROQ_API_KEY exists: false" → Key not accessible
- "GROQ_API_KEY exists: true" → Key accessible but API call fails
- Error messages from Groq API

### Step 2: Test Environment Variable Access
Add diagnostic logging to Edge Function:
```typescript
console.log('All env vars:', Object.keys(Deno.env.toObject()));
console.log('GROQ_API_KEY value:', GROQ_API_KEY ? GROQ_API_KEY.substring(0, 10) + '...' : 'NOT SET');
```

### Step 3: Verify Key Directly
Test GROQ_API_KEY directly against Groq API:
```bash
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"test"}]}'
```

### Step 4: Check Supabase Dashboard
1. Navigate to Edge Functions
2. Select `ai-proxy-fixed`
3. Check Environment Variables section
4. Verify GROQ_API_KEY is listed
5. Check if it's at function level or project level

### Step 5: Redeploy Edge Function
```bash
supabase functions deploy ai-proxy-fixed
```
Sometimes environment variables require redeployment to take effect.

## Most Likely Root Cause

Based on user statement "almost everytime the same issue", the most likely causes are:

1. **Environment Variable Not Propagating:** Key configured but Edge Function not redeployed after configuration
2. **Scope Mismatch:** Key configured at wrong scope (function vs project level)
3. **Caching Delay:** Supabase environment variable cache not refreshed

## Immediate Action Plan

1. Check Edge Function logs for "GROQ_API_KEY exists" message
2. Verify key is configured at PROJECT level (not function level)
3. Redeploy both Edge Functions after confirming configuration
4. Test with direct API call to verify key validity
5. If still fails, consider alternative AI provider

## Alternative Investigation

If key is confirmed valid and properly configured but still fails, this indicates a deeper issue with:
- Supabase Edge Function environment variable system
- Groq API access from Supabase infrastructure
- Network/firewall issues between Supabase and Groq

In this case, migrating to a different AI provider with better Supabase integration would be the solution.
