---
description: Security remediation plan for borang.html public form
type: fix
created: 2026-06-29
status: Ready for Implementation
---

# Fix Borang.html Security Critical Issues

**Target repo:** SISTEM-AHLI-DPMM-JOHOR  
**Type:** Security remediation  
**Depth:** Deep  
**Risk Profile:** High (public form with P0 security vulnerabilities)

## Summary

This plan addresses critical security vulnerabilities in `borang.html`, a public membership application form shared widely across DPMM Johor channels. The form currently has hardcoded API keys, insufficient server-side validation, weak CSP configuration, and file upload security gaps that expose the system to data theft, abuse, and injection attacks. The remediation follows defense-in-depth principles: secure credential management, comprehensive validation, strict CSP, rate limiting, and proper error handling.

## Problem Frame

`borang.html` is a public-facing membership application form that:
- Accepts sensitive personal data (IC numbers, addresses, business registration)
- Integrates with multiple third-party services (Supabase, Groq AI, EmailJS)
- Handles file uploads (IC images, SSM certificates)
- Uses AI-powered document extraction
- Generates PDF applications

Current state exposes critical vulnerabilities:
- API keys hardcoded in client-side JavaScript
- No server-side validation (client-side only)
- CSP allows `'unsafe-inline'` defeating its purpose
- File uploads lack proper validation
- No rate limiting or abuse protection
- Insufficient error handling for external API failures

## Requirements

### R1. Secure Credential Management
- All API keys must be removed from client-side code
- Credentials must be stored in environment variables or server-side configuration
- No secrets exposed in browser source code or network requests

### R2. Comprehensive Input Validation
- Server-side validation for all form inputs
- Type checking, format validation, and sanitization
- Protection against SQL injection, XSS, and injection attacks
- Normalization of user input before storage

### R3. Strict Content Security Policy
- Remove `'unsafe-inline'` from CSP
- Implement nonce-based or hash-based CSP
- Restrict script sources to trusted domains only
- Enable Trusted Types for DOM sinks

### R4. File Upload Security
- Validate file types using magic bytes, not just MIME types
- Enforce file size limits
- Scan uploaded files for malicious content
- Store files securely with proper access controls

### R5. Rate Limiting and Abuse Protection
- Implement rate limiting on form submissions
- Add CAPTCHA or similar bot protection
- Monitor and block suspicious submission patterns
- Implement request throttling for API calls

### R7. CSRF Protection
- Implement CSRF tokens for form submissions
- Validate CSRF tokens on server-side
- Prevent cross-site request forgery attacks

### R8. HTTPS Enforcement
- Enforce HTTPS for all form submissions
- Implement HSTS headers
- Prevent downgrade attacks

### R9. Security Logging
- Log all security events and attempts
- Monitor for suspicious patterns
- Implement alerting for security incidents

### R6. Robust Error Handling
- Comprehensive error handling for all external API calls
- Retry logic with exponential backoff
- User-friendly error messages
- Proper logging without exposing sensitive data

## Key Technical Decisions

### KTD1. Environment-Based Configuration
**Decision:** Move all API keys to environment variables loaded via server-side configuration.  
**Rationale:** Client-side code cannot safely store secrets. Environment variables are the industry standard for credential management and prevent exposure in browser source code.  
**Trade-off:** Requires server-side endpoint for configuration, but this is necessary for security.

### KTD2. Server-Side Validation Layer
**Decision:** Implement comprehensive server-side validation using a shared validation schema.  
**Rationale:** Client-side validation is easily bypassed. Server-side validation is the only reliable security boundary. Using a shared schema (e.g., Zod) ensures rules don't drift between client and server.  
**Trade-off:** Additional server complexity, but essential for security.

### KTD6. CAPTCHA Implementation
**Decision:** Implement Cloudflare Turnstile for bot protection.  
**Rationale:** Turnstile provides user-friendly CAPTCHA without friction. Server-side validation is required for security.  
**Trade-off:** Additional dependency, but necessary for public form protection.

### KTD7. CSRF Token Strategy
**Decision:** Implement double-submit cookie pattern for CSRF protection.  
**Rationale:** Double-submit pattern is widely supported and doesn't require session storage. Provides strong protection against CSRF attacks.  
**Trade-off:** Additional cookie management, but essential for form security.

### KTD8. Security Logging Strategy
**Decision:** Implement structured logging with security event categorization.  
**Rationale:** Structured logging enables effective monitoring and alerting. Security events need separate tracking from application logs.  
**Trade-off:** Additional logging infrastructure, but necessary for security monitoring.

### KTD3. Nonce-Based CSP
**Decision:** Implement nonce-based CSP instead of allowlist CSP.  
**Rationale:** Nonce-based CSP provides stronger XSS protection than allowlist CSP and is more maintainable than hash-based CSP for dynamic content.  
**Trade-off:** Requires server-side nonce generation, but provides better security.

### KTD4. Magic Byte File Validation
**Decision:** Validate uploaded files using magic byte detection, not just MIME type.  
**Rationale:** MIME types are easily spoofed. Magic byte detection reliably identifies actual file types.  
**Trade-off:** Additional processing overhead, but necessary for security.

### KTD5. Rate Limiting with Token Bucket
**Decision:** Implement rate limiting using token bucket algorithm.  
**Rationale:** Token bucket provides smooth rate limiting while preventing abuse bursts. More sophisticated than simple counters.  
**Trade-off:** Requires state management, but necessary for effective abuse prevention.

## Scope Boundaries

### In Scope
- Security remediation of `borang.html`
- Server-side validation endpoint creation
- Environment variable configuration
- CSP hardening
- File upload security implementation
- Rate limiting and abuse protection
- Error handling improvements
- Security testing and validation

### Out of Scope
- Complete application refactoring to React (deferred to existing migration plan)
- UI/UX redesign (focus on security only)
- New feature additions
- Database schema changes (unless required for security)
- Mobile app changes

### Deferred to Follow-Up Work
- Migration to modern framework (see existing REACT-MIGRATION.md)
- Advanced bot protection (Cloudflare Turnstile integration)
- Comprehensive security audit of entire codebase
- Implementation of security monitoring and alerting

## Implementation Units

### U1. Create Server-Side Configuration Endpoint
**Goal:** Create a secure server-side endpoint to provide configuration without exposing secrets.  
**Requirements:** R1  
**Dependencies:** None  
**Files:** 
- `src/config-endpoint.js` (create)
- `.env.example` (update)
- `config.example.js` (update)

**Approach:** Create a Node.js/Express endpoint that loads configuration from environment variables and returns only safe, non-sensitive values to the client. API keys remain server-side and are used for backend API calls only.

**Test scenarios:**
- Happy path: Endpoint returns configuration without secrets
- Error path: Missing environment variables handled gracefully
- Security: API keys never included in response
- Integration: Client successfully loads configuration

**Verification:** Configuration endpoint serves safe values only; no secrets in response; client can load configuration without errors.

### U2. Implement Server-Side Validation Schema
**Goal:** Create comprehensive server-side validation using Zod schema.  
**Requirements:** R2  
**Dependencies:** U1  
**Files:**
- `src/validation-schema.js` (create)
- `src/validation-endpoint.js` (create)

**Approach:** Define Zod schemas for all form inputs including email, phone, IC number, SSM registration, addresses. Create validation endpoint that accepts form data and returns validation results. Implement type checking, format validation, and sanitization. Add input normalization (lowercase emails, trim whitespace, collapse spaces). Implement database security with parameterized queries to prevent SQL injection.

**Test scenarios:**
- Happy path: Valid data passes validation
- Edge cases: Boundary values, empty inputs, null states
- Error paths: Invalid email format, malformed IC numbers, SQL injection attempts, XSS payloads
- Integration: Validation endpoint correctly rejects malicious input
- Database: Parameterized queries prevent SQL injection
- Normalization: Email lowercasing, whitespace trimming works correctly

**Verification:** All malicious inputs rejected; valid inputs pass; normalization applied correctly; no injection attacks succeed; database queries use parameterized statements.

### U3. Remove Hardcoded Secrets from borang.html
**Goal:** Remove all API keys and secrets from client-side code.  
**Requirements:** R1  
**Dependencies:** U1  
**Files:**
- `borang.html` (modify)
- `config-local.js` (modify)

**Approach:** Replace hardcoded API keys with calls to configuration endpoint. Update all Supabase, Groq, and EmailJS initialization to use dynamically loaded credentials. Remove any remaining secret references from client-side code.

**Test scenarios:**
- Happy path: Form loads and initializes with dynamic configuration
- Error path: Configuration endpoint failure handled gracefully
- Security: No secrets visible in browser source or network requests
- Integration: All external APIs work with dynamic credentials

**Verification:** No API keys in borang.html source; network requests contain no secrets; form functions correctly with dynamic configuration.

### U4. Implement Nonce-Based CSP
**Goal:** Replace weak CSP with strict nonce-based policy.  
**Requirements:** R3  
**Dependencies:** U1  
**Files:**
- `borang.html` (modify)
- `src/config-endpoint.js` (modify)

**Approach:** Generate cryptographic nonces server-side for each request. Update CSP header to use nonce-based script-src directive. Remove `'unsafe-inline'` and `'unsafe-eval'`. Enable Trusted Types for DOM sinks.

**Test scenarios:**
- Happy path: Legitimate scripts load with valid nonces
- Error path: Invalid nonces blocked by CSP
- Security: XSS attacks blocked by CSP
- Integration: All inline scripts converted to nonce-based

**Verification:** CSP no longer allows unsafe-inline; all scripts use nonces; XSS attempts blocked; console shows no CSP violations.

### U5. Implement File Upload Security
**Goal:** Add comprehensive file upload validation and security.  
**Requirements:** R4  
**Dependencies:** U1  
**Files:**
- `src/file-upload-handler.js` (create)
- `src/file-validation.js` (create)
- `borang.html` (modify)

**Approach:** Implement magic byte detection for file type validation. Validate both magic bytes AND Content-Type header. Enforce file size limits (5MB max). Scan for malicious content patterns. Store files in secure Supabase Storage with proper access controls. Generate signed URLs with expiration.

**Test scenarios:**
- Happy path: Valid image files accepted and stored
- Edge cases: Maximum file size, minimum file size
- Error paths: Malicious files blocked, invalid file types rejected
- Security: Magic byte detection prevents MIME spoofing
- Security: Content-Type validation prevents header spoofing
- Integration: File upload flow works with validation

**Verification:** Invalid file types rejected; size limits enforced; magic byte validation works; Content-Type validation works; files stored securely; no malicious files accepted.

### U6. Implement Rate Limiting
**Goal:** Add rate limiting to prevent form abuse.  
**Requirements:** R5  
**Dependencies:** U1  
**Files:**
- `src/rate-limiter.js` (create)
- `src/config-endpoint.js` (modify)

**Approach:** Implement token bucket rate limiting algorithm. Store rate limit state in Supabase or Redis. Apply limits to form submissions and API calls. Return 429 status when limits exceeded. Implement exponential backoff for retries.

**Test scenarios:**
- Happy path: Normal usage within rate limits
- Edge cases: Rate limit boundary behavior
- Error paths: Exceeded limits return 429 status
- Security: Automated abuse blocked
- Integration: Rate limiting works with form submission

**Verification:** Rate limits enforced correctly; 429 responses for exceeded limits; normal usage unaffected; abuse patterns blocked.

### U7. Implement Comprehensive Error Handling
**Goal:** Add robust error handling for all external API calls.  
**Requirements:** R6  
**Dependencies:** U1, U2, U3  
**Files:**
- `src/error-handler.js` (create)
- `borang.html` (modify)

**Approach:** Implement try-catch blocks for all API calls with specific error types. Add retry logic with exponential backoff for transient failures. Provide user-friendly error messages. Log errors without exposing sensitive data. Implement circuit breaker pattern for failing services.

**Test scenarios:**
- Happy path: Successful API calls complete normally
- Error paths: Network failures, timeout errors, API errors handled gracefully
- Integration: Retry logic works for transient failures
- Security: Error messages don't expose sensitive data

**Verification:** All API calls have error handling; retry logic works; user sees helpful error messages; no sensitive data in errors.

### U8. Security Testing and Validation
**Goal:** Comprehensive security testing of all fixes.  
**Requirements:** All requirements  
**Dependencies:** U1-U7, U9-U12  
**Files:**
- `tests/security-validation.js` (create)
- `docs/security-test-results.md` (create)

**Approach:** Create security test suite covering all vulnerabilities. Test for secret exposure, input validation bypass, CSP evasion, file upload attacks, rate limit bypass, CSRF protection, CAPTCHA validation, HTTPS enforcement, and error handling. Run automated security scans. Document results and any remaining issues.

**Test scenarios:**
- Secret exposure: No API keys in client code
- Validation bypass: Server-side validation blocks all malicious input
- CSP security: XSS attempts blocked by CSP
- File upload: Malicious files rejected
- Rate limiting: Abuse patterns blocked
- CSRF protection: Cross-site request forgery blocked
- CAPTCHA: Bot submissions blocked
- HTTPS: Form submissions enforce HTTPS
- Error handling: No sensitive data in errors

**Verification:** All security tests pass; no vulnerabilities remain; documentation complete; form ready for production use.

### U9. Implement CAPTCHA Protection
**Goal:** Add Cloudflare Turnstile CAPTCHA to prevent automated abuse.  
**Requirements:** R5  
**Dependencies:** U1  
**Files:**
- `src/captcha-handler.js` (create)
- `borang.html` (modify)
- `.env.example` (update)

**Approach:** Integrate Cloudflare Turnstile widget into the form. Generate Turnstile tokens on client-side. Validate tokens server-side before processing form submissions. Implement fallback for CAPTCHA failures. Configure Turnstile site key and secret key in environment variables.

**Test scenarios:**
- Happy path: Legitimate users pass CAPTCHA verification
- Error path: Invalid tokens rejected
- Security: Automated bot submissions blocked
- Integration: CAPTCHA validation works with form submission

**Verification:** CAPTCHA widget loads correctly; valid tokens accepted; invalid tokens rejected; automated submissions blocked; form works for legitimate users.

### U10. Implement CSRF Protection
**Goal:** Add CSRF token protection to prevent cross-site request forgery.  
**Requirements:** R7  
**Dependencies:** U1  
**Files:**
- `src/csrf-handler.js` (create)
- `borang.html` (modify)

**Approach:** Implement double-submit cookie pattern for CSRF protection. Generate CSRF tokens server-side and set in HTTP-only cookie. Include token in form as hidden field. Validate token on form submission. Implement token regeneration for sensitive operations.

**Test scenarios:**
- Happy path: Valid CSRF tokens accepted
- Error path: Missing or invalid tokens rejected
- Security: Cross-site request forgery attacks blocked
- Integration: CSRF validation works with form submission

**Verification:** CSRF tokens generated correctly; valid tokens accepted; invalid tokens rejected; CSRF attacks blocked; form works for legitimate submissions.

### U11. Implement HTTPS Enforcement
**Goal:** Enforce HTTPS for all form submissions and implement HSTS.  
**Requirements:** R8  
**Dependencies:** U1  
**Files:**
- `src/https-handler.js` (create)
- `borang.html` (modify)

**Approach:** Configure server to redirect HTTP to HTTPS. Implement Strict-Transport-Security (HSTS) header with appropriate max-age and includeSubDomains. Ensure all form submissions use HTTPS. Implement secure cookie attributes (Secure, HttpOnly, SameSite).

**Test scenarios:**
- Happy path: HTTPS connections work correctly
- Error path: HTTP requests redirected to HTTPS
- Security: Downgrade attacks prevented
- Integration: Form submissions enforce HTTPS

**Verification:** HTTP redirects to HTTPS; HSTS header set correctly; form submissions use HTTPS only; secure cookies configured; downgrade attacks prevented.

### U12. Implement Security Logging
**Goal:** Add comprehensive security event logging and monitoring.  
**Requirements:** R9  
**Dependencies:** U1  
**Files:**
- `src/security-logger.js` (create)
- `src/config-endpoint.js` (modify)

**Approach:** Implement structured logging for security events. Log validation failures, CSRF attempts, rate limit violations, suspicious file uploads, and authentication failures. Categorize events by severity. Implement alerting for critical security events. Ensure logs don't expose sensitive data.

**Test scenarios:**
- Happy path: Security events logged correctly
- Error path: Logging failures don't break form functionality
- Security: Sensitive data not exposed in logs
- Integration: Security monitoring works with all security components

**Verification:** Security events logged with proper categorization; alerts fire for critical events; no sensitive data in logs; monitoring dashboard displays security metrics.

## Risk Analysis & Mitigation

### Risk 1: Breaking Existing Functionality
**Risk:** Security changes may break existing form functionality.  
**Probability:** Medium  
**Impact:** High  
**Mitigation:** Comprehensive testing before deployment; gradual rollout with monitoring; rollback plan prepared.

### Risk 2: Performance Degradation
**Risk:** Additional validation and security checks may slow form submission.  
**Probability:** Medium  
**Impact:** Medium  
**Mitigation:** Optimize validation logic; implement caching where appropriate; monitor performance metrics.

### Risk 3: User Experience Impact
**Risk:** Stricter validation may frustrate legitimate users.  
**Probability:** Low  
**Impact:** Medium  
**Mitigation:** Clear error messages; helpful validation feedback; progressive enhancement.

### Risk 4: Deployment Complexity
**Risk:** Server-side components add deployment complexity.  
**Probability:** Medium  
**Impact:** Medium  
**Mitigation:** Clear deployment documentation; environment variable templates; automated deployment scripts.

## Dependencies / Prerequisites

- Node.js and npm installed
- Supabase project with appropriate permissions
- Environment variable management system
- SSL certificate for HTTPS (required for production)
- Rate limiting storage (Supabase or Redis)
- Cloudflare Turnstile account (for CAPTCHA)
- Logging infrastructure (for security monitoring)

## Documentation Plan

- Update SETUP.md with new security requirements
- Update SECURITY.md with remediation details
- Create deployment guide for security components
- Document environment variable setup
- Create security testing guide

## Operational / Rollout Notes

### Pre-Deployment Checklist
- All security tests passing
- Environment variables configured
- Rate limiting storage provisioned
- SSL certificate valid
- Backup of current borang.html
- Monitoring and alerting configured

### Deployment Strategy
1. Deploy server-side components first
2. Test configuration endpoint
3. Deploy updated borang.html
4. Monitor for errors and issues
5. Gradual traffic increase
6. Full rollout after validation

### Monitoring Focus Areas
- Form submission success rate
- Error rates and types
- Rate limiting effectiveness
- File upload validation results
- API call performance
- Security events and alerts

## Success Metrics

- Zero API keys exposed in client-side code
- 100% of malicious input blocked by server-side validation
- CSP blocks all XSS attempts
- Zero malicious files accepted
- Rate limiting blocks 99% of abuse attempts
- CAPTCHA blocks 95% of automated bot submissions
- CSRF protection blocks 100% of cross-site request forgery attacks
- HTTPS enforced on 100% of form submissions
- Error handling covers 100% of API failures
- Security events logged with 100% coverage
- Security tests pass with zero findings
- Form submission success rate > 95%

## Sources & Research

- OWASP REST Security Cheat Sheet
- MDN Content Security Policy Guide
- MDN Client-Side Form Validation
- Cloudflare Form Protection Best Practices
- Console.log.tools Public Form Security Guide
- Zod Validation Library Documentation
