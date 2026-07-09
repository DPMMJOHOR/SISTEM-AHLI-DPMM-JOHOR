---
goal: Comprehensive Security Remediation and Implementation Plan for SISTEM-AHLI and SISTEM-MESYUARAT
version: 1.0
date_created: 2026-07-10
last_updated: 2026-07-10
owner: Team 2 DPMM
status: 'Planned'
tags: ['security', 'remediation', 'architecture', 'audit', 'multi-repo']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This comprehensive implementation plan addresses all critical security vulnerabilities identified in the SISTEM-MESYUARAT audit and consolidates all pending implementation tasks across both SISTEM-AHLI and SISTEM-MESYUARAT repositories. The plan is structured into phases based on priority and dependency, with measurable completion criteria for each phase.

## 1. Requirements & Constraints

### Security Requirements

- **SEC-001**: All passwords must be hashed using bcrypt (minimum 12 rounds)
- **SEC-002**: No API keys or secrets may be hardcoded in source code
- **SEC-003**: All write operations must pass through server-side validation (Edge Functions)
- **SEC-004**: Content Security Policy (CSP) must be implemented with nonce-based script loading
- **SEC-005**: Rate limiting must be implemented using token bucket algorithm
- **SEC-006**: CSRF protection must be implemented using double-submit cookie pattern
- **SEC-007**: HTTPS must be enforced with HSTS header
- **SEC-008**: All user input must be sanitized before rendering to prevent XSS
- **SEC-009**: Audit logging must be implemented for all security-relevant events
- **SEC-010**: Row Level Security (RLS) policies must be enabled on all Supabase tables

### Functional Requirements

- **REQ-001**: SISTEM-MESYUARAT must implement Supabase Auth for authentication
- **REQ-002**: SISTEM-MESYUARAT must implement Edge Functions for all database writes
- **REQ-003**: SISTEM-AHLI must implement config loading from environment variables
- **REQ-004**: SISTEM-AHLI must implement Turnstile CAPTCHA
- **REQ-005**: Cross-repo integration must enable meeting visibility in SISTEM-AHLI
- **REQ-006**: AI chatbot must be upgraded to context-aware personal assistant
- **REQ-007**: Isi Pintar smart document auto-fill feature must be implemented

### Architecture Requirements

- **ARCH-001**: SISTEM-MESYUARAT monolithic HTML must be refactored into modules
- **ARCH-002**: Clean Architecture or Hexagonal Architecture must be implemented
- **ARCH-003**: Separation of concerns between UI, business logic, and data access
- **ARCH-004**: Module extraction priority: Authentication → Meeting Management → Attendance → WhatsApp Blast → AI Chatbot

### Compliance Requirements

- **COM-001**: PDPA compliance must be achieved (password hashing, audit logging, data retention)
- **COM-002**: Security documentation must match actual implementation
- **COM-003**: Data retention and deletion policies must be defined and implemented

### Constraints

- **CON-001**: No breaking changes to existing user data during password migration
- **CON-002**: Deployment must not require downtime for existing users
- **CON-003**: All changes must be backward compatible where possible
- **CON-004**: GitHub Actions must be used for secret injection
- **CON-005**: Edge Functions must be used for server-side logic (no additional backend)

### Guidelines

- **GUD-001**: Use existing security documentation (SECURITY.md) as reference
- **GUD-002**: Follow existing implementation plan patterns from docs/plans/
- **GUD-003**: Test all security fixes in staging environment before production
- **GUD-004**: Implement comprehensive unit and integration tests
- **GUD-005**: Document all security decisions in SECURITY.md

## 2. Implementation Steps

### Implementation Phase 1: Critical Security Fixes (SISTEM-MESYUARAT)

**GOAL-001:** Address all P0 critical security vulnerabilities in SISTEM-MESYUARAT

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Implement bcrypt password hashing for DPMM_USERS table | | |
| TASK-002 | Create one-time migration script to hash existing plaintext passwords with rollback capability | | |
| TASK-002A | Define password migration rollback procedure and verification checkpoints | | |
| TASK-003 | Update doLogin() function to use bcrypt.compare() | | |
| TASK-004 | Remove hardcoded SUPABASE_KEY fallback from index.html | | |
| TASK-005 | Remove hardcoded GROQ_KEY fallback from index.html | | |
| TASK-006 | Configure GitHub Actions to inject secrets via sed command | | |
| TASK-007 | Create Supabase Edge Function for user authentication | | |
| TASK-008 | Create Supabase Edge Function for meeting creation with Zod validation | | |
| TASK-009 | Create Supabase Edge Function for attendance status updates with Zod validation | | |
| TASK-010 | Create Supabase Edge Function for WhatsApp blast queue operations with Zod validation | | |
| TASK-011 | Implement nonce-based Content Security Policy header in report-only mode first | | |
| TASK-011A | Test CSP in report-only mode for 48 hours before enforcement | | |
| TASK-011B | Enforce CSP after report-only testing completes successfully | | |
| TASK-012 | Add Subresource Integrity (SRI) for all external scripts | | |
| TASK-013 | Implement token bucket rate limiting in Edge Functions | | |
| TASK-014 | Implement account lockout after 5 failed login attempts in 15 minutes | | |
| TASK-015 | Enable and verify RLS policies on all Supabase tables | | |

### Implementation Phase 2: High Priority Security Fixes (SISTEM-MESYUARAT)

**GOAL-002:** Address all P1 high security vulnerabilities in SISTEM-MESYUARAT

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-016 | Implement double-submit cookie pattern for CSRF protection | | |
| TASK-017 | Add CSRF token validation in all Edge Functions | | |
| TASK-018 | Enable HSTS header with max-age=31536000 (1 year) | | |
| TASK-019 | Add HTTPS redirect in Edge Functions | | |
| TASK-020 | Configure GitHub Pages to enforce HTTPS | | |
| TASK-021 | Implement HTML escaping function for all user-generated content | | |
| TASK-022 | Integrate DOMPurify for rich content sanitization | | |
| TASK-023 | Replace innerHTML with textContent where possible | | |
| TASK-024 | Validate input length and character sets at database level | | |

### Implementation Phase 3: SISTEM-AHLI Deployment Fixes

**GOAL-003:** Fix deployment secrets and configuration for SISTEM-AHLI

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-025 | Standardize config key names to camelCase in borang.html | | |
| TASK-026 | Add camelCase aliases in src/config-loader.js | | |
| TASK-027 | Remove or guard failing /api/config fetch call in borang.html | | |
| TASK-028 | Set actual Turnstile SITE key in src/config-loader.js | | |
| TASK-029 | Verify Cloudflare Turnstile domain allowlist | | |
| TASK-030 | Add favicon.ico to repository root | | |
| TASK-031 | Link favicon in borang.html | | |
| TASK-032 | Test local configuration loading | | |
| TASK-033 | Deploy and verify live site functionality | | |

### Implementation Phase 4: SISTEM-AHLI Security Remediation

**GOAL-004:** Implement server-side validation, CSP, and rate limiting for SISTEM-AHLI

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-034 | Move all API keys to environment variables | | |
| TASK-035 | Implement Zod schema validation for all form inputs | | |
| TASK-036 | Implement nonce-based CSP for borang.html | | |
| TASK-037 | Remove unsafe-inline from CSP where possible | | |
| TASK-038 | Implement magic byte validation for file uploads | | |
| TASK-039 | Enforce file size limits (5MB maximum) | | |
| TASK-040 | Implement token bucket rate limiting for form submissions | | |
| TASK-041 | Integrate Cloudflare Turnstile CAPTCHA | | |
| TASK-042 | Implement CSRF token strategy for all forms | | |
| TASK-043 | Add comprehensive error handling for API calls | | |
| TASK-044 | Implement retry logic for failed API calls | | |
| TASK-045 | Add security logging for all security events | | |

### Implementation Phase 5: Audit Logging Implementation (Multi-Repo)

**GOAL-005:** Implement comprehensive audit logging across both repositories

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-046 | Create SQL migration for DPMM_AUDIT_LOG table in Supabase | | |
| TASK-047 | Implement logAudit() helper function in SISTEM-MESYUARAT | | |
| TASK-048 | Implement logAudit() helper function in SISTEM-AHLI | | |
| TASK-049 | Wire logAudit() into login/logout in SISTEM-MESYUARAT | | |
| TASK-050 | Wire logAudit() into meeting creation/deletion in SISTEM-MESYUARAT | | |
| TASK-051 | Wire logAudit() into attendance updates in SISTEM-MESYUARAT | | |
| TASK-052 | Wire logAudit() into blast queue saves in SISTEM-MESYUARAT | | |
| TASK-053 | Wire logAudit() into form submissions in SISTEM-AHLI | | |
| TASK-054 | Enable RLS policies on DPMM_AUDIT_LOG table | | |
| TASK-055 | Implement log retention and archival policy | | |

### Implementation Phase 6: Cross-Repo Integration

**GOAL-006:** Enable meeting visibility and cross-navigation between repositories

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-056 | Add "Mesyuarat" sub-tab under "Dokumen" tab in SISTEM-AHLI | | |
| TASK-057 | Implement meeting list fetching from DPMM_MESYARAT in SISTEM-AHLI | | |
| TASK-058 | Add navigation links from SISTEM-AHLI to SISTEM-MESYUARAT | | |
| TASK-059 | Add navigation links from SISTEM-MESYUARAT to SISTEM-AHLI | | |
| TASK-060 | Implement meeting view logging in SISTEM-AHLI | | |
| TASK-061 | Test cross-repo navigation and data flow | | |

### Implementation Phase 7: SISTEM-MESYUARAT Architecture Refactoring

**GOAL-007:** Refactor monolithic SISTEM-MESYUARAT into modular architecture (Extended to 8 weeks for iterative approach)

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-062 | Extract Authentication module (login, logout, user management) with comprehensive testing | | |
| TASK-063 | Extract Meeting Management module (CRUD operations) with comprehensive testing | | |
| TASK-064 | Extract Attendance Tracking module (status updates, bulk operations) with comprehensive testing | | |
| TASK-065 | Extract WhatsApp Blast module (templates, queue, sending) with comprehensive testing | | |
| TASK-066 | Extract AI Chatbot module (Aiman integration, context management) with comprehensive testing | | |
| TASK-067 | Implement Clean Architecture patterns incrementally | | |
| TASK-068 | Define domain entities and repositories | | |
| TASK-069 | Implement service layer for business logic | | |
| TASK-070 | Separate UI from business logic | | |
| TASK-070A | Validate each module extraction before proceeding to next module | | |

### Implementation Phase 8: SISTEM-AHLI Audit Issues Fixes

**GOAL-008:** Fix IC upload, chatbot, and validation gaps in SISTEM-AHLI

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-071 | Implement explicit UI for IC front/back uploads | | |
| TASK-072 | Fix IC URL saving to Supabase (split into two DOCS_WAJIB entries) | | |
| TASK-073 | Add Supabase table columns for url_ic_pemohon_depan and url_ic_pemohon_belakang | | |
| TASK-074 | Fix chatbot fasal guide functionality | | |
| TASK-075 | Implement isKeyConfigured() helper for API key checks | | |
| TASK-076 | Block PDFs in Isi Pintar feature | | |
| TASK-077 | Disable submit buttons after first click | | |
| TASK-078 | Fix loading overlay timeout issues | | |
| TASK-079 | Fix draft restore functionality | | |
| TASK-080 | Add validation for all required form fields | | |

### Implementation Phase 9: AI Chatbot Enhancement

**GOAL-009:** Upgrade chatbot to context-aware personal assistant

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-081 | Introduce _chat object for conversation history and step context | | |
| TASK-082 | Implement buildSystemPrompt() function for dynamic prompts | | |
| TASK-083 | Add quick-reply buttons for decision tree questions | | |
| TASK-084 | Implement animated typing indicator (bouncing dots) | | |
| TASK-085 | Implement smooth open/close animation for chatbot window | | |
| TASK-086 | Add showStepGreeting() function for contextual greetings | | |
| TASK-087 | Implement cleanBotText() helper to strip markdown symbols | | |
| TASK-088 | Add ARIA accessibility roles to chatbot HTML elements | | |
| TASK-089 | Add toggle button capability hint and clear chat functionality | | |

### Implementation Phase 10: Isi Pintar Smart Document Auto-Fill

**GOAL-010:** Implement smart document auto-fill feature using Groq Vision API

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-090 | Add CSS for autofilled fields and welcome screen elements | | |
| TASK-091 | Add GROQ_KEY and autoFilledFields to state object | | |
| TASK-092 | Modify welcome screen HTML to include document checklist and dual CTAs | | |
| TASK-093 | Add HTML for Isi Pintar upload overlay | | |
| TASK-094 | Implement overlay management functions | | |
| TASK-095 | Implement file selection and image compression functions | | |
| TASK-096 | Implement Groq Vision API interaction functions | | |
| TASK-097 | Implement IC data extraction from document images | | |
| TASK-098 | Implement SSM data extraction from document images | | |
| TASK-099 | Implement data mapping to form fields | | |
| TASK-100 | Add graceful degradation when GROQ_KEY is not configured | |

### Implementation Phase 11: Testing and Validation

**GOAL-011:** Implement comprehensive testing for all security fixes (Resource allocation: 1 dedicated tester + developer support)

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-101 | Implement unit tests for password hashing logic | | |
| TASK-102 | Implement unit tests for Edge Functions | | |
| TASK-103 | Implement integration tests for authentication flow | | |
| TASK-104 | Implement XSS testing for all user input fields | | |
| TASK-105 | Implement SQL injection testing for all database queries | | |
| TASK-106 | Implement CSRF protection testing | | |
| TASK-107 | Implement rate limiting testing | | |
| TASK-108 | Implement E2E tests for critical user flows | | |
| TASK-109 | Configure Vitest for automated test execution | | |
| TASK-110 | Achieve 80% code coverage target | | |
| TASK-110A | Define Edge Function performance targets (p95 < 500ms, p99 < 1s) | | |
| TASK-110B | Implement performance monitoring for Edge Functions | | |

### Implementation Phase 12: Documentation Updates

**GOAL-012:** Update documentation to match actual implementation

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-111 | Update SECURITY.md to reflect actual security implementation | | |
| TASK-112 | Document Edge Functions architecture | | |
| TASK-113 | Document RLS policies for all tables | | |
| TASK-114 | Update SETUP.md with new configuration requirements | | |
| TASK-115 | Document audit logging implementation | | |
| TASK-116 | Document cross-repo integration architecture | | |
| TASK-117 | Update DEPLOYMENT.md with new deployment process | | |
| TASK-118 | Create security runbook for incident response | | |
| TASK-118A | Create implementation incident response procedure | | |
| TASK-118B | Create user communication plan for password reset requirement | | |

## 3. Alternatives

- **ALT-001**: Deploy a separate backend API server instead of using Supabase Edge Functions
  - **Rejected**: Adds infrastructure complexity and operational overhead
  - **Chosen**: Supabase Edge Functions provide server-side logic without additional infrastructure

- **ALT-002**: Use a different password hashing algorithm (Argon2, scrypt)
  - **Rejected**: bcrypt is widely supported, well-tested, and sufficient for current security requirements
  - **Chosen**: bcrypt with 12 rounds provides adequate security with good performance

- **ALT-003**: Implement client-side rate limiting instead of server-side
  - **Rejected**: Client-side rate limiting can be bypassed
  - **Chosen**: Server-side rate limiting in Edge Functions provides reliable protection

- **ALT-004**: Use React or Vue.js instead of vanilla JavaScript for refactoring
  - **Rejected**: Would require complete rewrite, high effort, and introduces new dependencies
  - **Chosen**: Modular vanilla JavaScript maintains simplicity while improving architecture

- **ALT-005**: Implement separate databases for each repository
  - **Rejected**: Would break cross-repo integration and duplicate data
  - **Chosen**: Shared Supabase project with proper RLS policies enables secure data sharing

## 4. Dependencies

### External Dependencies

- **DEP-001**: Supabase (database, auth, Edge Functions)
- **DEP-002**: Groq API (AI chatbot functionality)
- **DEP-003**: Google APIs (Drive integration, OAuth)
- **DEP-004**: Cloudflare Turnstile (CAPTCHA)
- **DEP-005**: GitHub Actions (CI/CD, secret injection)

### Internal Dependencies

- **DEP-006**: Phase 1 (Critical Security Fixes) must complete before Phase 2
- **DEP-007**: Phase 3 (SISTEM-AHLI Deployment Fixes) can run in parallel with Phase 1-2
- **DEP-008**: Phase 5 (Audit Logging) must complete before Phase 6 (Cross-Repo Integration)
- **DEP-008A**: If Phase 5 is delayed, Phase 6 can proceed with basic meeting visibility without audit logging
- **DEP-009**: Phase 7 (Architecture Refactoring) should start after Phase 2 (High Priority Fixes)
- **DEP-010**: Phase 11 (Testing) should run in parallel with implementation phases
- **DEP-011**: Phase 12 (Documentation) should run in parallel with implementation phases

### Library Dependencies

- **DEP-011**: bcryptjs (password hashing)
- **DEP-012**: zod (schema validation)
- **DEP-013**: DOMPurify (HTML sanitization)
- **DEP-014**: vitest (testing framework)

## 5. Files

### SISTEM-MESYUARAT Files

- **FILE-001**: index.html (main application file - requires complete refactoring)
- **FILE-002**: config-local.example.js (configuration template)
- **FILE-003**: docs/SECURITY.md (security documentation - requires updates)
- **FILE-004**: docs/SETUP.md (setup documentation - requires updates)
- **FILE-005**: supabase/migrations/ (SQL migrations for audit log and password hashing)
- **FILE-006**: supabase/functions/auth/ (Edge Function for authentication)
- **FILE-007**: supabase/functions/meetings/ (Edge Function for meeting operations)
- **FILE-008**: supabase/functions/attendance/ (Edge Function for attendance operations)
- **FILE-009**: supabase/functions/blast/ (Edge Function for WhatsApp blast operations)

### SISTEM-AHLI Files

- **FILE-010**: borang.html (main application file - requires security fixes)
- **FILE-011**: src/config-loader.js (configuration loading - requires fixes)
- **FILE-012**: docs/SECURITY.md (security documentation - requires updates)
- **FILE-013**: docs/SETUP.md (setup documentation - requires updates)
- **FILE-014**: .github/workflows/deploy.yml (GitHub Actions - requires secret injection)

### New Files to Create

- **FILE-015**: supabase/migrations/20260710_add_password_hash.sql
- **FILE-016**: supabase/migrations/20260710_create_audit_log.sql
- **FILE-017**: supabase/migrations/20260710_add_ic_columns.sql
- **FILE-018**: src/modules/auth.js (authentication module)
- **FILE-019**: src/modules/meetings.js (meeting management module)
- **FILE-020**: src/modules/attendance.js (attendance tracking module)
- **FILE-021**: src/modules/whatsapp.js (WhatsApp blast module)
- **FILE-022**: src/modules/chatbot.js (AI chatbot module)
- **FILE-023**: src/utils/security.js (security utilities - HTML escaping, CSP)
- **FILE-024**: src/utils/validation.js (input validation utilities)
- **FILE-025**: tests/auth.test.js (authentication tests)
- **FILE-026**: tests/security.test.js (security tests)
- **FILE-027**: tests/integration.test.js (integration tests)

## 6. Testing

### Security Testing

- **TEST-001**: Verify bcrypt password hashing works correctly
- **TEST-002**: Verify password migration script successfully hashes all existing passwords
- **TEST-003**: Verify login works with hashed passwords
- **TEST-004**: Verify hardcoded keys are removed and not accessible
- **TEST-005**: Verify Edge Functions reject invalid input
- **TEST-006**: Verify CSP header blocks inline scripts
- **TEST-007**: Verify rate limiting blocks brute force attacks
- **TEST-008**: Verify CSRF tokens prevent cross-site request forgery
- **TEST-009**: Verify XSS payloads are blocked by input sanitization
- **TEST-010**: Verify RLS policies prevent unauthorized data access

### Functional Testing

- **TEST-011**: Verify user can login with correct credentials
- **TEST-012**: Verify user cannot login with incorrect credentials after 5 attempts
- **TEST-013**: Verify admin can create meetings
- **TEST-014**: Verify admin can update attendance status
- **TEST-015**: Verify WhatsApp blast queue works correctly
- **TEST-016**: Verify AI chatbot responds to queries
- **TEST-017**: Verify cross-repo meeting visibility works
- **TEST-018**: Verify IC upload saves correctly to Supabase
- **TEST-019**: Verify Isi Pintar extracts data from documents
- **TEST-020**: Verify audit logging captures all security events

### Integration Testing

- **TEST-021**: Verify SISTEM-AHLI can view SISTEM-MESYUARAT meetings
- **TEST-022**: Verify navigation links work between repositories
- **TEST-023**: Verify shared Supabase RLS policies work correctly
- **TEST-024**: Verify Edge Functions integrate with frontend correctly
- **TEST-025**: Verify GitHub Actions secret injection works

### Performance Testing

- **TEST-026**: Verify bcrypt hashing performance is acceptable
- **TEST-027**: Verify rate limiting does not impact legitimate users
- **TEST-028**: Verify Edge Functions respond within acceptable time limits
- **TEST-029**: Verify database queries are optimized
- **TEST-030**: Verify frontend load time is acceptable

## 7. Risks & Assumptions

### Risks

- **RISK-001**: Password migration may fail if database is large
  - **Mitigation**: Implement batch processing with error handling and rollback capability
  - **Rollback Procedure**: Backup DPMM_USERS table before migration, maintain plaintext column during migration, verify hash correctness before dropping plaintext
  - **Verification Checkpoints**: After each 1000 records, after 50% completion, after 100% completion
- **RISK-002**: Edge Functions may have cold start latency
  - **Mitigation**: Implement keep-alive mechanism and monitor performance
  - **Performance Target**: p95 < 500ms, p99 < 1s
- **RISK-003**: CSP may break existing functionality
  - **Mitigation**: Implement in staging first, use report-only mode initially
  - **CSP Testing Strategy**: 48-hour report-only mode monitoring, gradual enforcement starting with least critical pages
- **RISK-004**: Rate limiting may block legitimate users
  - **Mitigation**: Implement generous limits with admin override capability
- **RISK-005**: Architecture refactoring may introduce bugs
  - **Mitigation**: Comprehensive testing before deployment, gradual rollout
  - **Extended Timeline**: Phase 7 extended to 8 weeks for iterative extraction with validation checkpoints
- **RISK-006**: Cross-repo integration may break if one repo is updated independently
  - **Mitigation**: Version API contracts, implement backward compatibility
- **RISK-007**: AI API key exposure may occur during development
  - **Mitigation**: Strict gitignore policies, pre-commit hooks for secret scanning
- **RISK-008**: Audit logging may impact performance
  - **Mitigation**: Implement async logging, batch writes, monitor performance
- **RISK-009**: Testing resource constraints may delay implementation
  - **Mitigation**: Dedicated tester allocation, stagger test implementation with development

### Assumptions

- **ASSUMPTION-001**: Supabase Edge Functions are available and functional
- **ASSUMPTION-002**: GitHub Actions can inject secrets into static sites
- **ASSUMPTION-003**: Users will accept password reset requirement after migration
- **ASSUMPTION-004**: Existing users can be migrated without data loss
- **ASSUMPTION-005**: Cloudflare Turnstile is accessible and configured
- **ASSUMPTION-006**: Groq API remains available and stable
- **ASSUMPTION-007**: Google APIs OAuth flow works as documented
- **ASSUMPTION-008**: Development team has capacity to implement all phases
- **ASSUMPTION-009**: Testing environment accurately reflects production
- **ASSUMPTION-010**: No regulatory changes during implementation period
- **ASSUMPTION-011**: Dedicated testing resource available for Phase 11
- **ASSUMPTION-012**: Staging environment available for CSP report-only testing

## 8. Related Specifications / Further Reading

### Existing Implementation Plans

- [2026-07-09-fix-deployment-secrets-plan.md](../2026-07-09-fix-deployment-secrets-plan.md) - Config loading, Turnstile, Supabase connectivity
- [2026-06-29-004-fix-borang-security-critical-issues-plan.md](../2026-06-29-004-fix-borang-security-critical-issues-plan.md) - Security remediation
- [2026-06-02-001-fix-borang-audit-issues-plan.md](../2026-06-02-001-fix-borang-audit-issues-plan.md) - IC upload, chatbot, validation
- [2026-06-02-chatbot-personal-assistant.md](../2026-06-02-chatbot-personal-assistant.md) - Chatbot upgrade
- [2026-06-01-isi-pintar-implementation.md](../2026-06-01-isi-pintar-implementation.md) - Smart document auto-fill
- [2026-06-22-001-feat-m2-phase1-foundation-plan.md](../2026-06-22-001-feat-m2-phase1-foundation-plan.md) - Config injection, audit log, cross-link

### Audit Reports

- [SISTEM-MESYUARAT Comprehensive Audit Report](../../../../../../AppData/Local/Temp/sistem-mesyuarat-comprehensive-audit-20260710.md) - Full audit findings
- [SISTEM-MESYUARAT Security Audit](../../../../../../AppData/Local/Temp/sistem-mesyuarat-security-audit-20260710.md) - Security vulnerabilities
- [SISTEM-MESYUARAT XSS Testing Report](../../../../../../AppData/Local/Temp/sistem-mesyuarat-xss-testing-20260710.md) - XSS vulnerabilities
- [SISTEM-MESYUARAT Architecture Review](../../../../../../AppData/Local/Temp/architecture-review-sistem-mesyuarat-20260710.html) - Architecture issues

### External Documentation

- [OWASP Top 10 2021](https://owasp.org/Top10/) - Security best practices
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security) - Supabase security
- [Content Security Policy Level 3](https://www.w3.org/TR/CSP3/) - CSP specification
- [PDPA Malaysia](https://www.pdp.gov.my/) - Data protection regulations
