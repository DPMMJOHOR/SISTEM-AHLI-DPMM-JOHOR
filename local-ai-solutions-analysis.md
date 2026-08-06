# Local AI Solutions Analysis for DPMM Johor & Cascade

**Date:** 2026-07-30  
**Purpose:** Evaluate local AI hosting solutions for DPMM Johor project and Cascade development

## Current Context

### DPMM Johor Project
- **Deployment:** GitHub Pages (static hosting)
- **Backend:** Supabase (database, storage, Edge Functions)
- **Current AI:** Groq API via Edge Functions (ai-proxy, ai-proxy-fixed)
- **Features:**
  - AIMAN: Chatbot for admin dashboard (index.html)
  - Isi Pintar: OCR for membership form (borang.html)
- **Issues:** Recurring GROQ_API_KEY configuration failures
- **Requirements:** Reliable AI provider, OCR capabilities, multilingual support

### Cascade (Local Development)
- **Environment:** Local development on user machine
- **Purpose:** AI coding assistant for development tasks
- **Current:** Uses cloud-based AI models
- **Requirements:** Privacy, cost control, local execution

## Repository Analysis

### 1. LocalAI (mudler/LocalAI)

**What it is:**
Open-source, modular AI runtime that runs various AI models locally with OpenAI-compatible API. Drop-in replacement for cloud AI services.

**Key Features:**
- Multi-modality: Text, vision, speech, image, video, embeddings, reranking
- API compatibility: OpenAI, Anthropic, Ollama, ElevenLabs
- AI agents: Built-in autonomous agents with RAG, memory, skills
- Privacy-first: All data processed locally
- Flexible deployment: CPU laptop to distributed GPU cluster
- Web interface: Built-in UI for model management
- Distributed mode: Horizontal scaling, P2P federation, model sharding

**How it works:**
- Go-based core orchestrates backend processes
- gRPC backends (llama.cpp, vLLM, whisper.cpp, stable-diffusion, MLX)
- ModelLoader spawns appropriate backend on demand
- OpenAI-compatible REST API

**System Requirements:**
- Hardware: CPU-only to GPU clusters
- GPU support: NVIDIA (CUDA), AMD (ROCm), Intel (oneAPI), Apple Silicon (Metal), Vulkan
- Storage: 1-3GB (small), 4-8GB (medium), 15-30GB+ (large models)
- Installation: Docker recommended

**Supported Models:**
- LLMs: llama.cpp, vLLM, SGLang, transformers, MLX
- Image: Stable Diffusion, Flux
- Audio: whisper.cpp, piper, Kokoro, VibeVoice, Qwen3-TTS
- Vision: Object detection, face recognition, depth estimation
- Embeddings, Video generation

---

### 2. Text Generation WebUI (oobabooga/text-generation-webui)

**What it is:**
Gradio-based web interface for running LLMs locally with unified interface for various backends.

**Key Features:**
- Multiple modes: Instruct, chat-instruct, chat, notebook
- Multimodal support: Image attachments, vision models
- Image generation: Diffusers models (Z-Image-Turbo)
- File attachments: Text, PDF, .docx documents
- Web search: Optional internet search integration
- OpenAI-compatible API: Chat and Completions endpoints
- Extension system: Additional functionalities
- Customization: Jinja2 templates, conversation branching
- Model management: Switch models without restart

**How it works:**
- Hub-and-spoke architecture with shared.py core
- server.py orchestrates Gradio UI and lifecycle
- modules/models.py provides unified model loading
- modules/text_generation.py handles generation
- UI built with Gradio (modules/ui*.py)

**System Requirements:**
- Disk space: ~10GB for one-click installer
- GPU: NVIDIA Ampere for bfloat16
- CPU: CPU-only possible (slow)
- Memory: CPU/disk offloading options
- Python: 3.9+ for manual install

**Supported Models:**
- llama.cpp (GGUF models)
- Transformers (Hugging Face)
- ExLlamaV3, ExLlamaV2
- TensorRT-LLM
- LoRA support

---

### 3. new-api (QuantumNous/new-api)

**What it is:**
Next-generation LLM gateway and AI asset management system built with Go, unified proxy for 40+ AI providers.

**Key Features:**
- Unified interface: Single OpenAI-compatible endpoint for 40+ providers
- Intelligent routing: Weighted random, priority levels, auto failover
- Format translation: OpenAI, Claude, Gemini bidirectional conversion
- Asset management: Multi-tenant, role-based access control
- Advanced billing: Three-phase quota, tiered pricing, custom expressions
- Multimodal support: Text, images, audio, task-based providers
- Authorization: Discord, LinuxDO, Telegram, OIDC

**How it works:**
- Intelligent abstraction layer for generative AI services
- Layered architecture: Gin web framework, React frontend
- API Gateway Layer for HTTP routing
- Relay Engine for upstream provider communication
- Service Layer for business logic
- Data Layer: SQLite/MySQL/PostgreSQL with hybrid caching

**System Requirements:**
- Databases: SQLite (local), MySQL ≥5.7.8, PostgreSQL ≥9.6
- Container: Docker or Docker Compose
- Architecture: 64-bit only (amd64/arm64)

**Supported Models:**
- OpenAI: GPT models, GPTs, OpenAI-compatible
- Claude: Messages format, thinking models
- Google Gemini: Gemini format, thinking/nothinking models
- Rerank: Cohere, Jina
- Multimodal: Midjourney-Proxy, Suno-API
- Other: Dify, custom endpoints

---

### 4. AgenticSeek (Fosowl/agenticSeek)

**What it is:**
100% local, voice-enabled AI assistant alternative to Manus AI, autonomous web browsing, coding, task planning.

**Key Features:**
- Fully local & private: All operations on device
- Smart web browsing: Autonomous search, content extraction, form filling
- Autonomous coding: Write, debug, execute code (Python, C, Go, Java)
- Smart agent selection: Automatic agent selection based on query
- Complex task planning: Break down tasks, orchestrate multiple agents
- Voice-enabled: Speech-to-text interface (in progress)

**How it works:**
- Language detection and translation
- Complexity estimation
- Agent selection (PlannerAgent for complex, specialized agents for simple)
- Response generation with reasoning tags
- Tool execution (PyInterpreter, Browser, FileOps)
- Memory management

**System Requirements:**
- Git, Python 3.10.x
- Docker Engine & Docker Compose
- Hardware for local LLMs:
  - 7B models: 8GB VRAM (not recommended)
  - 14B models: 12GB VRAM (RTX 3060)
  - 32B models: 24+ GB VRAM (RTX 4090)
  - 70B+ models: 48+ GB VRAM

**Supported Models:**
- Local: ollama, lm-studio, openai (local server), server
- Cloud: openai, google, deepseek, huggingface, togetherAI, openrouter
- Recommended: Magistral, Deepseek for reasoning

---

## Analysis for DPMM Johor Project

### Current Architecture
- GitHub Pages (static frontend)
- Supabase (database, storage, Edge Functions)
- Groq API (current AI provider)
- Features: AIMAN chatbot, Isi Pintar OCR

### Deployment Constraints
- **Static hosting:** GitHub Pages cannot run backend services
- **Edge Functions:** Supabase Edge Functions are serverless, not persistent
- **No GPU access:** GitHub Pages and Supabase Edge Functions have no GPU
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage

### Solution Evaluation

#### LocalAI for DPMM Johor

**Pros:**
✅ OpenAI-compatible API - drop-in replacement for Groq
✅ Privacy-first - data never leaves infrastructure
✅ Multi-modality - supports vision for Isi Pintar OCR
✅ Distributed mode - can scale with multiple workers
✅ Web interface - easy model management
✅ No API key configuration issues - self-hosted

**Cons:**
❌ Requires own server infrastructure (VPS/dedicated server)
❌ Requires GPU hardware for acceptable performance
❌ High setup complexity (Docker, model management)
❌ Ongoing maintenance (updates, security)
❌ Storage costs (models 15-30GB+)
❌ Bandwidth costs (if serving from remote server)
❌ Not compatible with GitHub Pages static hosting
❌ Not compatible with Supabase Edge Functions (no GPU)

**Deployment Options:**
1. **Self-hosted VPS:** $20-100/month + GPU server $100-500/month
2. **On-premise server:** Hardware costs + maintenance
3. **Cloud GPU:** AWS/GCP/Azure GPU instances $300-1000/month

**Verdict:** ❌ Not viable for DPMM Johor
- Requires significant infrastructure investment
- Not compatible with current static hosting
- Overkill for current usage volume
- Higher TCO than cloud APIs

---

#### Text Generation WebUI for DPMM Johor

**Pros:**
✅ OpenAI-compatible API - can replace Groq
✅ Multimodal support - vision for Isi Pintar
✅ Web interface - easy model management
✅ Extension system - customizable
✅ 100% offline - privacy

**Cons:**
❌ Requires own server infrastructure
❌ Requires GPU hardware
❌ High setup complexity
❌ Ongoing maintenance
❌ Not compatible with GitHub Pages
❌ Not compatible with Supabase Edge Functions
❌ Primarily designed for interactive use, not API service

**Deployment Options:**
1. **Self-hosted VPS:** Same as LocalAI
2. **On-premise server:** Same as LocalAI
3. **Cloud GPU:** Same as LocalAI

**Verdict:** ❌ Not viable for DPMM Johor
- Designed for interactive web UI, not API service
- Same infrastructure constraints as LocalAI
- No advantage over LocalAI for this use case

---

#### new-api for DPMM Johor

**Pros:**
✅ Unified interface - single endpoint for 40+ providers
✅ Intelligent routing - automatic failover, load balancing
✅ Format translation - OpenAI, Claude, Gemini compatibility
✅ Multi-tenant - organization-level management
✅ Advanced billing - quota management, cost tracking
✅ Can be self-hosted or cloud-deployed
✅ Lightweight - Go-based, efficient
✅ Compatible with current architecture - can run on VPS

**Cons:**
❌ Still requires own server infrastructure (VPS)
❌ Still requires cloud API subscriptions (unless fully local)
❌ Setup complexity (Docker, database configuration)
❌ Ongoing maintenance
❌ Not compatible with GitHub Pages
❌ Can be deployed on Supabase Edge Functions (possible but complex)

**Deployment Options:**
1. **Self-hosted VPS:** $5-20/month + cloud API costs
2. **Supabase Edge Functions:** Possible but complex setup
3. **Cloud deployment:** AWS/GCP/Azure

**Verdict:** ⚠️ Partially viable
- Solves the multi-provider routing problem
- Can be deployed on affordable VPS
- Still requires infrastructure investment
- Better than full local AI hosting

**Implementation Path:**
1. Deploy new-api on VPS ($5-10/month)
2. Configure OpenRouter, Gemini, or other providers
3. Update Edge Functions to point to new-api endpoint
4. Benefit: Automatic failover, unified billing

---

#### AgenticSeek for DPMM Johor

**Pros:**
✅ Fully local - privacy
✅ Autonomous coding - not relevant for DPMM Johor
✅ Web browsing - not relevant for DPMM Johor
✅ Voice-enabled - not relevant for DPMM Johor

**Cons:**
❌ Designed for autonomous agent tasks, not API service
❌ No OpenAI-compatible API
❌ Requires significant GPU hardware
❌ High setup complexity
❌ Not suitable for chatbot/OCR use case
❌ Not compatible with current architecture

**Verdict:** ❌ Not viable for DPMM Johor
- Wrong use case (autonomous agent vs API service)
- No API compatibility
- Overkill for current requirements

---

## Analysis for Cascade (Local Development)

### Current Context
- Local development environment
- AI coding assistant for development tasks
- Currently uses cloud-based AI models
- Requirements: Privacy, cost control, local execution

### Solution Evaluation

#### LocalAI for Cascade

**Pros:**
✅ OpenAI-compatible API - drop-in replacement
✅ Privacy-first - all data local
✅ Multi-modality - supports various AI tasks
✅ Web interface - easy model management
✅ Can run on local machine
✅ No API costs after initial setup
✅ Flexible - can use CPU or GPU

**Cons:**
❌ Requires significant disk space (15-30GB+ for models)
❌ Requires GPU for acceptable performance
❌ Setup complexity (Docker, model downloads)
❌ Maintenance (updates, model management)
❌ Performance depends on local hardware
❌ Limited to local hardware capabilities

**Deployment Options:**
1. **Local machine:** Docker installation, model downloads
2. **Local server:** Dedicated development machine

**Hardware Requirements:**
- CPU-only: Very slow, not recommended
- GPU: 12GB+ VRAM for usable performance
- Storage: 30GB+ SSD for models

**Verdict:** ✅ Viable for Cascade
- Suitable for local development
- Privacy benefit
- Cost control (no per-token costs)
- Performance acceptable with good GPU

**Implementation Path:**
1. Install Docker
2. Install LocalAI
3. Download appropriate models (e.g., Qwen, Llama)
4. Configure IDE to use LocalAI endpoint
5. Benefit: Privacy, cost control, local execution

---

#### Text Generation WebUI for Cascade

**Pros:**
✅ OpenAI-compatible API
✅ Web interface for model management
✅ Extension system
✅ Can run on local machine
✅ No API costs after setup
✅ Good for interactive development

**Cons:**
❌ Designed for interactive use, not API service
❌ Requires GPU for performance
❌ Setup complexity
❌ Maintenance
❌ Performance depends on hardware

**Verdict:** ⚠️ Partially viable
- Can work but designed for interactive use
- LocalAI better suited for API service
- May be useful for testing models interactively

---

#### new-api for Cascade

**Pros:**
✅ Unified interface for multiple providers
✅ Intelligent routing
✅ Can be self-hosted
✅ Lightweight
✅ Good for cost management

**Cons:**
❌ Still requires infrastructure (even if local)
❌ Still requires cloud API subscriptions (unless fully local)
❌ Setup complexity
❌ Overkill for single developer
❌ Designed for multi-tenant scenarios

**Verdict:** ❌ Not ideal for Cascade
- Designed for organization-level management
- Overkill for single developer
- LocalAI better suited for local development

---

#### AgenticSeek for Cascade

**Pros:**
✅ Fully local
✅ Autonomous coding assistant
✅ Can write, debug, execute code
✅ Privacy
✅ Voice-enabled (in progress)

**Cons:**
❌ Not an API service - different paradigm
❌ Requires significant GPU hardware
❌ High setup complexity
❌ Designed for autonomous tasks, not coding assistant API
❌ May not integrate with existing IDE workflow

**Verdict:** ⚠️ Potentially useful but different paradigm
- Could be complementary to existing workflow
- Not a direct replacement for current AI coding assistant
- Worth exploring for autonomous coding tasks

---

## Recommendations

### For DPMM Johor Project

**Primary Recommendation: new-api (Self-hosted on VPS)**

**Rationale:**
- Solves the recurring GROQ_API_KEY configuration issue
- Provides automatic failover across 40+ providers
- Unified billing and cost tracking
- Can be deployed on affordable VPS ($5-10/month)
- Compatible with current Edge Function architecture
- Lower infrastructure cost than full local AI hosting

**Implementation Plan:**
1. Deploy new-api on VPS (DigitalOcean, Linode, etc.)
2. Configure providers: OpenRouter, Gemini, or others
3. Update Edge Functions to point to new-api endpoint
4. Configure intelligent routing and failover
5. Set up billing and quota management
6. Test AIMAN and Isi Pintar

**Estimated Cost:**
- VPS: $5-10/month
- Cloud APIs: $6-30/month (depending on usage)
- Total: $11-40/month

**Benefits:**
- No more API key configuration issues
- Automatic failover prevents outages
- Better cost tracking and management
- Multi-provider redundancy

---

**Alternative Recommendation: OpenRouter (Direct Integration)**

**Rationale:**
- Simpler than self-hosting new-api
- Automatic failover built-in
- No infrastructure required
- Drop-in replacement for Groq
- Cost-effective

**Implementation Plan:**
1. Sign up for OpenRouter
2. Get OPENROUTER_API_KEY
3. Update Edge Functions to use OpenRouter endpoint
4. Configure model selection
5. Test AIMAN and Isi Pintar

**Estimated Cost:**
- Cloud APIs: $14.22/month (from previous analysis)
- Total: $14.22/month

**Benefits:**
- No infrastructure required
- Automatic failover
- Simple implementation
- Cost-effective

**Verdict:** OpenRouter is simpler and more cost-effective than new-api for DPMM Johor

---

### For Cascade (Local Development)

**Primary Recommendation: LocalAI**

**Rationale:**
- Privacy-first development
- Cost control (no per-token costs)
- OpenAI-compatible API
- Can run on local machine
- Suitable for coding assistant use case

**Implementation Plan:**
1. Install Docker on local machine
2. Install LocalAI via Docker
3. Download appropriate models (Qwen, Llama, etc.)
4. Configure IDE to use LocalAI endpoint
5. Test with coding tasks

**Hardware Requirements:**
- GPU: 12GB+ VRAM recommended (RTX 3060 or better)
- Storage: 30GB+ SSD
- RAM: 16GB+ recommended

**Estimated Cost:**
- One-time: Hardware investment (if not already available)
- Ongoing: Electricity costs

**Benefits:**
- Privacy - all code analysis local
- Cost control - no per-token billing
- Flexibility - can switch models
- Independence - no dependency on cloud services

---

**Alternative Recommendation: Ollama**

**Rationale:**
- Simpler than LocalAI
- Good for local LLM hosting
- OpenAI-compatible API
- Easy setup

**Implementation Plan:**
1. Install Ollama
2. Download models
3. Configure IDE to use Ollama endpoint
4. Test with coding tasks

**Verdict:** Ollama is simpler than LocalAI for basic local LLM hosting

---

## Comparison Summary

### DPMM Johor Project

| Solution | Infrastructure Cost | Monthly Cost | Complexity | Reliability | Verdict |
|----------|-------------------|-------------|------------|------------|---------|
| **Current (Groq)** | None | $20.84 | Low | Low (config issues) | ❌ |
| **OpenRouter** | None | $14.22 | Low | High (auto failover) | ✅ Best |
| **new-api (VPS)** | $5-10 | $11-40 | Medium | High (auto failover) | ⚠️ Good |
| **LocalAI (VPS)** | $100-500 | $0-20 | High | Medium | ❌ |
| **TextGen WebUI** | $100-500 | $0-20 | High | Medium | ❌ |
| **AgenticSeek** | $100-500 | $0-20 | High | Medium | ❌ |

### Cascade (Local Development)

| Solution | Hardware Cost | Setup Complexity | Performance | Privacy | Verdict |
|----------|---------------|-----------------|-------------|---------|---------|
| **Current (Cloud)** | None | None | High | Low | ❌ |
| **LocalAI** | $500-2000 (GPU) | Medium | Medium (GPU-dependent) | High | ✅ Best |
| **Ollama** | $500-2000 (GPU) | Low | Medium (GPU-dependent) | High | ✅ Good |
| **TextGen WebUI** | $500-2000 (GPU) | Medium | Medium (GPU-dependent) | High | ⚠️ |
| **new-api** | $500-2000 (GPU) | High | Medium (GPU-dependent) | High | ❌ |
| **AgenticSeek** | $1000-5000 (GPU) | High | High (GPU-dependent) | High | ⚠️ |

## Final Recommendations

### For DPMM Johor Project

**Recommended: OpenRouter (Direct Integration)**

**Why:**
- Solves recurring GROQ_API_KEY configuration issues
- Automatic failover across 20+ provider endpoints
- No infrastructure required
- Cost-effective ($14.22/month)
- Simple implementation (2-3 hours)
- Proven reliability

**Implementation Steps:**
1. Sign up for OpenRouter account
2. Get OPENROUTER_API_KEY
3. Update `ai-proxy` Edge Function:
   - Change endpoint to `https://openrouter.ai/api/v1/chat/completions`
   - Add OPENROUTER_API_KEY to environment variables
   - Update model selection
4. Update `ai-proxy-fixed` Edge Function:
   - Same changes as above
5. Update borang.html and index.html model references
6. Redeploy Edge Functions
7. Test AIMAN and Isi Pintar

---

### For Cascade (Local Development)

**Recommended: Ollama (for simplicity) or LocalAI (for features)**

**Why Ollama:**
- Simple setup
- Good for basic local LLM hosting
- OpenAI-compatible API
- Easy model management

**Why LocalAI:**
- More features (multi-modality, agents)
- Better for advanced use cases
- OpenAI-compatible API
- Web interface for management

**Implementation Steps (Ollama):**
1. Install Ollama
2. Download models (e.g., `ollama pull qwen2.5-coder`)
3. Configure IDE to use Ollama endpoint (`http://localhost:11434`)
4. Test with coding tasks

**Implementation Steps (LocalAI):**
1. Install Docker
2. Install LocalAI: `curl https://localai.io/install.sh | sh`
3. Start LocalAI: `local-ai run`
4. Download models via web interface
5. Configure IDE to use LocalAI endpoint
6. Test with coding tasks

**Hardware Requirement:**
- GPU with 12GB+ VRAM recommended
- 30GB+ SSD storage
- 16GB+ RAM

---

## Conclusion

**DPMM Johor:** Migrate to OpenRouter for reliability and cost-effectiveness. Avoid local AI hosting due to infrastructure costs and complexity.

**Cascade:** Implement Ollama or LocalAI for local development to achieve privacy and cost control. Requires GPU hardware investment.
