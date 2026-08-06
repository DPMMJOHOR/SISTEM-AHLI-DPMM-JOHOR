---
goal: Migrate AIMAN and Isi Pintar from Groq to OpenRouter API
version: 1.0
date_created: 2026-07-30
last_updated: 2026-07-30
owner: DPMM Johor Development Team
status: 'Planned'
tags: ['feature', 'migration', 'ai', 'openrouter']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan migrates the AIMAN chatbot (index.html) and Isi Pintar OCR feature (borang.html) from Groq API to OpenRouter API. The migration addresses recurring GROQ_API_KEY configuration issues and provides automatic failover across multiple AI providers. The plan includes updates to both Supabase Edge Functions (ai-proxy and ai-proxy-fixed) and frontend model references.

## 1. Requirements & Constraints

- **REQ-001**: Migrate AIMAN chatbot from Groq to OpenRouter with no functional regression
- **REQ-002**: Migrate Isi Pintar OCR from Groq to OpenRouter with no functional regression
- **REQ-003**: Maintain multilingual support (Bahasa Melayu + English) for AIMAN
- **REQ-004**: Maintain OCR accuracy for Malaysian IC and SSM documents for Isi Pintar
- **REQ-005**: Use OpenRouter-compatible models with proven reliability
- **REQ-006**: User will provide OPENROUTER_API_KEY for configuration
- **SEC-001**: API key must be stored in Supabase Edge Function environment variables
- **SEC-002**: No API keys should be exposed in frontend code
- **CON-001**: GitHub Pages static hosting cannot run backend services
- **CON-002**: Supabase Edge Functions have no GPU access
- **GUD-001**: Follow existing Edge Function code structure and patterns
- **GUD-002**: Maintain CORS handling in Edge Functions
- **GUD-003**: Test both features thoroughly before deployment

## 2. Implementation Steps

### Implementation Phase 1: Edge Function Configuration

- GOAL-001: Update ai-proxy Edge Function to support OpenRouter API

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Update supabase/functions/ai-proxy/index.ts to add OPENROUTER_API_KEY environment variable retrieval | | |
| TASK-002 | Add OpenRouter provider support in ai-proxy Edge Function | | |
| TASK-003 | Update API endpoint to https://openrouter.ai/api/v1/chat/completions for OpenRouter provider | | |
| TASK-004 | Add OpenRouter-specific headers (Authorization: Bearer {key}, HTTP-Referer, X-Title) | | |
| TASK-005 | Maintain Groq provider as fallback option | | |
| TASK-006 | Add logging for provider selection and API key presence | | |

### Implementation Phase 2: Edge Function Configuration (Vision)

- GOAL-002: Update ai-proxy-fixed Edge Function to support OpenRouter API for vision models

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Update supabase/functions/ai-proxy-fixed/index.ts to add OPENROUTER_API_KEY environment variable retrieval | | |
| TASK-008 | Add OpenRouter provider support in ai-proxy-fixed Edge Function | | |
| TASK-009 | Update API endpoint to https://openrouter.ai/api/v1/chat/completions for OpenRouter provider | | |
| TASK-010 | Add OpenRouter-specific headers (Authorization: Bearer {key}, HTTP-Referer, X-Title) | | |
| TASK-011 | Maintain Groq provider as fallback option | | |
| TASK-012 | Add logging for provider selection and API key presence | | |

### Implementation Phase 3: Frontend Model Selection

- GOAL-003: Update AIMAN model selection in index.html

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | Update index.html line 7717 to change provider from 'groq' to 'openrouter' | | |
| TASK-014 | Update index.html line 7717 to change model from 'llama-3.3-70b-versatile' to 'openai/gpt-4o-mini' | | |
| TASK-015 | Verify system prompt remains compatible with new model | | |
| TASK-016 | Test AIMAN chatbot with new model in development environment | | |

### Implementation Phase 4: Frontend Model Selection (Vision)

- GOAL-004: Update Isi Pintar model selection in borang.html

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-017 | Update borang.html line 7082 to change provider from 'groq' to 'openrouter' | | |
| TASK-018 | Update borang.html line 7084 to change model from 'qwen/qwen3.6-27b' to 'qwen/qwen3-vl-235b-a22b-instruct' | | |
| TASK-019 | Verify OCR prompt remains compatible with new model | | |
| TASK-020 | Test Isi Pintar OCR with new model in development environment | | |

### Implementation Phase 5: Environment Configuration

- GOAL-005: Configure OPENROUTER_API_KEY in Supabase

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-021 | Add OPENROUTER_API_KEY to Supabase project environment variables | | |
| TASK-022 | Configure OPENROUTER_API_KEY at project level (not function level) | | |
| TASK-023 | Verify environment variable is accessible to both Edge Functions | | |
| TASK-024 | Add HTTP-Referer environment variable (https://dpmmjohor.github.io) | | |
| TASK-025 | Add X-Title environment variable (DPMM Johor Membership System) | | |

### Implementation Phase 6: Deployment

- GOAL-006: Deploy updated Edge Functions to Supabase

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-026 | Deploy supabase/functions/ai-proxy/index.ts to Supabase | | |
| TASK-027 | Deploy supabase/functions/ai-proxy-fixed/index.ts to Supabase | | |
| TASK-028 | Verify Edge Functions are running without errors | | |
| TASK-029 | Check Edge Function logs for successful startup | | |

### Implementation Phase 7: Testing

- GOAL-007: Test AIMAN chatbot functionality

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-030 | Open index.html in browser | | |
| TASK-031 | Login as admin user | | |
| TASK-032 | Open AIMAN chatbot | | |
| TASK-033 | Test Bahasa Melayu query: "Bagaimana cara mendaftar ahli baru?" | | |
| TASK-034 | Test English query: "How do I register as a new member?" | | |
| TASK-035 | Verify response is accurate and in correct language | | |
| TASK-036 | Check browser console for errors | | |
| TASK-037 | Check Edge Function logs for successful API calls | | |

### Implementation Phase 8: Testing

- GOAL-008: Test Isi Pintar OCR functionality

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-038 | Open borang.html in browser | | |
| TASK-039 | Navigate to membership form | | |
| TASK-040 | Click "Isi Pintar" dropdown | | |
| TASK-041 | Upload Malaysian IC document (JPEG/PNG) | | |
| TASK-042 | Upload SSM document (JPEG/PNG) | | |
| TASK-043 | Click "Auto-fill" button | | |
| TASK-044 | Verify OCR extracts IC data correctly (nama, no_ic, alamat) | | |
| TASK-045 | Verify OCR extracts SSM data correctly (nama_perniagaan, no_pendaftaran) | | |
| TASK-046 | Verify data maps to correct form fields | | |
| TASK-047 | Check browser console for errors | | |
| TASK-048 | Check Edge Function logs for successful API calls | |

## 3. Alternatives

- **ALT-001**: Use Google Gemini instead of OpenRouter
  - Rationale: Gemini has excellent vision capabilities and is cost-effective
  - Not chosen: OpenRouter provides automatic failover across multiple providers, which addresses the reliability concern better than a single provider switch

- **ALT-002: Use new-api self-hosted gateway
  - Rationale: Provides unified interface and intelligent routing
  - Not chosen: Requires additional infrastructure (VPS) and maintenance, adding complexity. OpenRouter is simpler and more cost-effective for current needs.

- **ALT-003**: Fix Groq configuration issues instead of migrating
  - Rationale: Could solve the problem without changing providers
  - Not chosen: Recurring configuration issues suggest systemic problem. Migration to OpenRouter provides better long-term reliability with automatic failover.

## 4. Dependencies

- **DEP-001**: User must provide OPENROUTER_API_KEY from OpenRouter account
- **DEP-002**: Supabase project must have Edge Functions enabled
- **DEP-003**: User must have Supabase project access to configure environment variables
- **DEP-004: Supabase CLI must be installed for Edge Function deployment
- **DEP-005**: Test documents (IC and SSM) must be available for OCR testing

## 5. Files

- **FILE-001**: supabase/functions/ai-proxy/index.ts - Edge Function for AIMAN chatbot
- **FILE-002**: supabase/functions/ai-proxy-fixed/index.ts - Edge Function for Isi Pintar OCR
- **FILE-003**: index.html - Admin dashboard with AIMAN chatbot (line 7711-7720)
- **FILE-004**: borang.html - Membership form with Isi Pintar (line 7078-7090)

## 6. Testing

- **TEST-001**: AIMAN chatbot responds correctly to Bahasa Melayu queries
- **TEST-002**: AIMAN chatbot responds correctly to English queries
- **TEST-003**: AIMAN chatbot maintains professional tone and business guidance
- **TEST-004**: Isi Pintar OCR correctly extracts Malaysian IC data
- **TEST-005**: Isi Pintar OCR correctly extracts SSM document data
- **TEST-006**: Isi Pintar OCR correctly maps extracted data to form fields
- **TEST-007**: No JavaScript errors in browser console
- **TEST-008**: Edge Function logs show successful API calls to OpenRouter
- **TEST-009**: Edge Function logs show no missing API key errors
- **TEST-010**: Both features work end-to-end without user-facing errors

## 7. Risks & Assumptions

- **RISK-001**: OpenRouter API may have different response format than Groq
  - Mitigation: Test thoroughly in development before deployment
- **RISK-002**: Selected models may not perform as well as current Groq models
  - Mitigation: Have fallback to Groq provider in Edge Functions
- **RISK-003**: OpenRouter API rate limits may affect performance
  - Mitigation: Monitor usage and adjust if needed
- **RISK-004**: Environment variable configuration may still have issues
  - Mitigation: Configure at project level, not function level; verify with logging
- **ASSUM-001**: User will provide valid OPENROUTER_API_KEY
- **ASSUM-002**: OpenRouter API is stable and reliable
- **ASSUM-003**: Selected models are available on OpenRouter platform
- **ASSUM-004**: Supabase Edge Functions can reach OpenRouter API endpoints

## 8. Model Selection Rationale

### AIMAN (index.html)
- **Current Model**: Groq llama-3.3-70b-versatile
- **New Model**: openai/gpt-4o-mini
- **Rationale**: 
  - Excellent multilingual support (Bahasa Melayu + English)
  - Strong reasoning capabilities for business guidance
  - Cost-effective with good performance
  - Widely used and well-tested
  - Good balance of quality and speed

### Isi Pintar (borang.html)
- **Current Model**: Groq qwen/qwen3.6-27b
- **New Model**: qwen/qwen3-vl-235b-a22b-instruct
- **Rationale**:
  - Excellent vision capabilities for OCR
  - Strong performance on document understanding
  - Good for Malaysian document formats
  - Instruction-tuned for structured output
  - Supports JSON output for form field mapping

## 9. Related Specifications / Further Reading

- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [OpenRouter Models List](https://openrouter.ai/models)
- [ai-provider-comprehensive-comparison.md](../ai-provider-comprehensive-comparison.md)
- [local-ai-solutions-analysis.md](../local-ai-solutions-analysis.md)
- [groq-key-investigation.md](../groq-key-investigation.md)
