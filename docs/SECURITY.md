# Security Architecture and RLS Policies Documentation

## Overview
This document details the security architecture and Row Level Security (RLS) policies implemented across the DPMM Johor systems.

## Table of Contents
1. Security Principles
2. Authentication Architecture
3. Authorization Architecture
4. Data Protection
5. RLS Policies
6. Edge Function Security
7. Infrastructure Security
8. Compliance

## 1. Security Principles

### Defense in Depth
- Multiple layers of security
- No single point of failure
- Redundant protections

### Least Privilege
- Minimum required access
- Role-based permissions
- Time-limited access

### Zero Trust
- Verify every request
- No implicit trust
- Continuous validation

### Security by Design
- Built-in security
- Not an afterthought
- Continuous improvement

## 2. Authentication Architecture

### Supabase Auth
- JWT-based authentication
- 30-minute session timeout
- Automatic token refresh
- Secure password storage (bcrypt)

### Unified Authentication
- Single sign-on (SSO)
- Shared session across systems
- Consistent auth flow
- Centralized user management

### Session Management
- Secure token storage
- Auto-expiration
- Logout from all systems
- Session invalidation

### Password Security
- Bcrypt hashing
- Minimum 8 characters
- Complexity requirements
- Password reset flow

## 3. Authorization Architecture

### Role-Based Access Control (RBAC)
- **Admin**: Full access
- **Staff**: Limited access
- **User**: Read-only access

### RLS Policies
- Database-level access control
- User-based filtering
- Action-based permissions
- Cross-user protection

### API Authorization
- JWT token validation
- Role verification
- Rate limiting
- Request signing

### UI Authorization
- Protected routes
- Role-based UI
- Permission checks
- Access denied handling

## 4. Data Protection

### PII Encryption
- Encrypted at rest
- Encrypted in transit (HTTPS)
- Field-level encryption
- Key management

### Encryption Methods
- AES-256 for PII
- bcrypt for passwords
- TLS 1.3 for transit
- Secure key storage

### Data Masking
- Masked display in UI
- Partial data exposure
- Role-based visibility
- Audit logging

### Data Retention
- Configurable retention periods
- Automatic cleanup
- Archive old data
- Compliance with PDPA

## 5. RLS Policies

### Meeting System Tables

#### DPMM_MESYUARAT
```sql
-- Admin: Full access
CREATE POLICY "Admin full access" ON DPMM_MESYUARAT
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Staff: Read and update own meetings
CREATE POLICY "Staff read own" ON DPMM_MESYUARAT
  FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Staff update own" ON DPMM_MESYUARAT
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Public: No access
CREATE POLICY "Public no access" ON DPMM_MESYUARAT
  FOR ALL
  USING (false);
```

#### DPMM_KEHADIRAN
```sql
-- Admin: Full access
CREATE POLICY "Admin full access" ON DPMM_KEHADIRAN
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Staff: Read and update own attendance
CREATE POLICY "Staff read own" ON DPMM_KEHADIRAN
  FOR SELECT
  USING (auth.uid() = updated_by);

-- Public: No access
CREATE POLICY "Public no access" ON DPMM_KEHADIRAN
  FOR ALL
  USING (false);
```

### Member System Tables

#### AHLI DPMM JOHOR
```sql
-- Admin: Full access
CREATE POLICY "Admin full access" ON "AHLI DPMM JOHOR"
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Staff: Read and update (limited fields)
CREATE POLICY "Staff read" ON "AHLI DPMM JOHOR"
  FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

CREATE POLICY "Staff update limited" ON "AHLI DPMM JOHOR"
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'staff') AND
    (TG_OP = 'UPDATE' AND (
      column_name IN ('STATUS', 'TARIKH_BAYARAN', 'TARIKH_BAYARAN_2026')
    ))
  );

-- Public: No access
CREATE POLICY "Public no access" ON "AHLI DPMM JOHOR"
  FOR ALL
  USING (false);
```

#### PERMOHONAN_AHLI (Membership Applications)
```sql
-- Anonymous users can SELECT (read applications)
CREATE POLICY "anon_select_permohonan"
ON "PERMOHONAN_AHLI"
FOR SELECT
TO anon
USING (true);

-- Anonymous users can INSERT (submit new applications) with validation
CREATE POLICY "anon_insert_permohonan"
ON "PERMOHONAN_AHLI"
FOR INSERT
TO anon
WITH CHECK (
  -- Basic validation checks
  ref_id IS NOT NULL AND
  jenis_keahlian IS NOT NULL AND
  fasal IS NOT NULL AND
  nama_entiti IS NOT NULL AND
  LENGTH(TRIM(nama_entiti)) >= 3 AND
  -- IC validation for Malaysian IC format
  no_kad_pengenalan ~ '^\d{6}-\d{2}-\d{4}$' OR
  no_kad_pengenalan ~ '^\d{12}$' OR
  no_kad_pengenalan IS NULL
);

-- Authenticated users can SELECT all applications
CREATE POLICY "authenticated_select_permohonan"
ON "PERMOHONAN_AHLI"
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can UPDATE applications
CREATE POLICY "authenticated_update_permohonan"
ON "PERMOHONAN_AHLI"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin users can DELETE applications
CREATE POLICY "authenticated_delete_permohonan"
ON "PERMOHONAN_AHLI"
FOR DELETE
TO authenticated
USING (
  -- Only allow deletion for admin users
  EXISTS (
    SELECT 1 FROM "DPMM_USERS"
    WHERE id = auth.uid AND role = 'admin'
  )
);
```

### Cross-System Access

#### Meeting System Read Access to Members
```sql
-- Meeting system can read member data (read-only)
CREATE POLICY "Meeting system read" ON "AHLI DPMM JOHOR"
  FOR SELECT
  USING (
    auth.jwt() ->> 'system' = 'meeting' AND
    auth.jwt() ->> 'role' IN ('admin', 'staff')
  );
```

## 6. Edge Function Security

### Authentication
- JWT token validation
- User role verification
- Service role key protection
- Request origin check

### Input Validation
- Schema validation
- Type checking
- Length limits
- Sanitization

### Output Filtering
- PII masking
- Field selection
- Data minimization
- Error message sanitization

### Rate Limiting
- Per-user limits (10 emails per minute for email-with-pdf)
- Per-endpoint limits
- Burst protection
- Throttling

### CORS Configuration (July 20, 2026)
- **email-with-pdf Edge Function**: CORS preflight handling implemented
  - OPTIONS requests return 200 with CORS headers
  - All responses include `Access-Control-Allow-Origin: '*'`
  - Headers: `Access-Control-Allow-Methods: POST, OPTIONS`
  - Headers: `Access-Control-Allow-Headers: Content-Type, Authorization`
- **ai-proxy-fixed Edge Function**: CORS preflight handling implemented
  - OPTIONS requests return 200 with CORS headers
  - All responses include `Access-Control-Allow-Origin: '*'`
  - Headers: `Access-Control-Allow-Methods: POST, OPTIONS`
  - Headers: `Access-Control-Allow-Headers: Content-Type, Authorization`

## 7. Infrastructure Security

### HTTPS Enforcement
- HTTPS only
- HSTS enabled
- SSL/TLS configuration
- Certificate management

### Content Security Policy
- Script source restrictions
- Style source restrictions
- Image source restrictions
- Connect source restrictions

### Subresource Integrity
- SRI for external scripts
- Hash verification
- Integrity checks
- Fallback handling

### Secure Cookies
- HttpOnly flag
- Secure flag
- SameSite attribute
- Expiration policy

## 8. Compliance

### PDPA Compliance
- Data minimization
- Purpose limitation
- Consent management
- Data subject rights

### Audit Logging
- All writes logged
- User identification
- Timestamp tracking
- Action details

### Data Deletion
- Right to be forgotten
- Data retention policy
- Automated cleanup
- Verification process

### Security Monitoring
- Failed login tracking
- Anomaly detection
- Alert configuration
- Incident response

## Security Checklist
- [ ] RLS policies enabled on all tables
- [ ] Auth implemented with Supabase
- [ ] PII encryption enabled
- [ ] HTTPS enforced
- [ ] CSP configured
- [ ] SRI enabled
- [ ] Rate limiting enabled
- [ ] Account lockout enabled
- [ ] Audit logging enabled
- [ ] Data retention policy implemented
