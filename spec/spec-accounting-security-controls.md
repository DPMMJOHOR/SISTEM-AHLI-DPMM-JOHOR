---
title: Accounting Security Controls Specification
version: 1.0
date_created: 2026-08-06
last_updated: 2026-08-06
owner: Development Team
tags: security, accounting, rls, audit
---

# Introduction

This specification defines the security controls required for the accounting module overhaul. It addresses critical security gaps identified in the professional accountant review, including authentication, authorization, audit trails, and data protection.

## 1. Purpose & Scope

This specification provides the complete security requirements for:
- Role-based access control for all accounting tables
- Separation of duties enforcement
- Audit trail and logging requirements
- Data encryption and protection
- Session management
- Backup and recovery procedures

Intended audience: Security engineers, backend developers, database administrators, and system architects implementing the accounting module.

## 2. Definitions

- **RLS**: Row Level Security - PostgreSQL feature for restricting row access based on user roles
- **SoD**: Separation of Duties - Security principle ensuring different users perform different functions
- **Audit Trail**: Immutable log of all system changes with user attribution
- **Encryption at Rest**: Data encryption when stored in database or storage
- **Encryption in Transit**: Data encryption during network transmission (TLS)
- **Session Management**: Control of user authentication sessions including timeout and concurrent access

## 3. Security Requirements

### Authentication Requirements

- **SEC-AUTH-001**: All accounting operations must use authenticated role (not anon)
- **SEC-AUTH-002**: User identity must be verified via dpmm_users table
- **SEC-AUTH-003**: Session tokens must expire after 8 hours of inactivity
- **SEC-AUTH-004**: Maximum 3 concurrent sessions per user
- **SEC-AUTH-005**: Failed login attempts must be logged and locked after 5 consecutive failures

### Authorization Requirements

- **SEC-AUTHZ-001**: Role-based access control enforced at database level via RLS
- **SEC-AUTHZ-002**: Valid roles: admin, bendahari, ajk, ydp, tyyp, nyyp
- **SEC-AUTHZ-003**: Read access: All authenticated users
- **SEC-AUTHZ-004**: Write access: admin and bendahari only for accounting_entries
- **SEC-AUTHZ-005**: Approval access: admin, bendahari, and ajk
- **SEC-AUTHZ-006**: Chart of accounts modification: admin only

### Separation of Duties Requirements

- **SEC-SOD-001**: Creator of accounting entry cannot approve their own entry
- **SEC-SOD-002**: Dual-signature required for amounts above RM 10,000
- **SEC-SOD-003**: Spending limits enforced at database level
- **SEC-SOD-004**: Approval chain must include at least 2 different users for amounts above RM 5,000
- **SEC-SOD-005**: Cash count verification must be performed by different user than cash handler

### Audit Trail Requirements

- **SEC-AUDIT-001**: All INSERT operations on accounting tables must log user ID, timestamp, and IP address
- **SEC-AUDIT-002**: All UPDATE operations on approval status must log previous value and new value
- **SEC-AUDIT-003**: approval_history table must be immutable (no UPDATE or DELETE allowed)
- **SEC-AUDIT-004**: Audit logs must be retained for minimum 7 years
- **SEC-AUDIT-005**: All financial transactions must have traceable audit trail to original source document

### Data Protection Requirements

- **SEC-DATA-001**: Sensitive financial data must be encrypted at rest using AES-256
- **SEC-DATA-002**: All network connections must use TLS 1.3 or higher
- **SEC-DATA-003**: Bank account numbers must be masked in UI (show only last 4 digits)
- **SEC-DATA-004**: Supporting documents must be stored in private Supabase Storage bucket with RLS
- **SEC-DATA-005**: Backup data must be encrypted

### Session Management Requirements

- **SEC-SESS-001**: Session timeout: 8 hours of inactivity
- **SEC-SESS-002**: Session refresh: Must re-authenticate after timeout
- **SEC-SESS-003**: Concurrent session limit: Maximum 3 per user
- **SEC-SESS-004**: Session invalidation on password change
- **SEC-SESS-005**: Session invalidation on role change

### Backup and Recovery Requirements

- **SEC-BACKUP-001**: Daily automated backups of all accounting tables
- **SEC-BACKUP-002**: Backup retention: 30 days daily, 12 months weekly, 7 years monthly
- **SEC-BACKUP-003**: Backups must be encrypted at rest
- **SEC-BACKUP-004**: Backup integrity verification: Weekly checksum validation
- **SEC-BACKUP-005**: Disaster recovery: RTO 4 hours, RPO 24 hours
- **SEC-BACKUP-006**: Backup restoration must be tested quarterly

## 4. Implementation Details

### RLS Policy Implementation

#### bank_accounts Table

```sql
-- Enable RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated users
CREATE POLICY "authenticated_select_bank_accounts" 
  ON bank_accounts FOR SELECT 
  TO authenticated 
  USING (true);

-- Write access for admin and bendahari only
CREATE POLICY "admin_bendahari_write_bank_accounts" 
  ON bank_accounts FOR ALL 
  TO authenticated 
  USING (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) IN ('admin', 'bendahari')
  )
  WITH CHECK (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) IN ('admin', 'bendahari')
  );
```

#### accounting_entries Table

```sql
-- Enable RLS
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated users
CREATE POLICY "authenticated_select_accounting_entries" 
  ON accounting_entries FOR SELECT 
  TO authenticated 
  USING (true);

-- Insert access for admin and bendahari
CREATE POLICY "admin_bendahari_insert_accounting_entries" 
  ON accounting_entries FOR INSERT 
  TO authenticated 
  WITH CHECK (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) IN ('admin', 'bendahari')
  );

-- Update access for approval (admin, bendahari, ajk)
CREATE POLICY "admin_bendahari_ajk_approve_accounting_entries" 
  ON accounting_entries FOR UPDATE 
  TO authenticated 
  USING (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) IN ('admin', 'bendahari', 'ajk')
    AND approval_status = 'pending'
    AND created_by != (SELECT email FROM dpmm_users WHERE id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) IN ('admin', 'bendahari', 'ajk')
    AND approval_status IN ('approved', 'rejected')
  );
```

### Separation of Duties Implementation

#### Application-Level Check (accounting-ui.js)

```javascript
async function approveAccountingEntry(entryId, userId, userEmail) {
  // Fetch entry details
  const { data: entry, error } = await supabase
    .from('accounting_entries')
    .select('created_by, approval_status, amount')
    .eq('id', entryId)
    .single();
  
  if (error) throw error;
  
  // Separation of duties check
  if (entry.created_by === userEmail) {
    throw new Error('PENOLAKAN: Anda tidak boleh meluluskan rekod yang anda cipta.');
  }
  
  // Dual-signature check for amounts above RM 10,000
  if (entry.amount >= 10000) {
    const { count } = await supabase
      .from('approval_history')
      .select('*', { count: 'exact', head: false })
      .eq('record_id', entryId)
      .eq('action', 'approved');
    
    if (count < 1) {
      throw new Error('PENOLAKAN: Jumlah RM 10,000 ke atas memerlukan sekurang-kurangnya 2 kelulusan.');
    }
  }
  
  // Proceed with approval
  // ...
}
```

#### Database-Level Check (PostgreSQL Function)

```sql
CREATE OR REPLACE FUNCTION check_separation_of_duties()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent creator from approving own entry
  IF NEW.approved_by = OLD.created_by THEN
    RAISE EXCEPTION 'Separation of duties violation: Creator cannot approve own entry';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_separation_of_duties
  BEFORE UPDATE ON accounting_entries
  FOR EACH ROW
  WHEN (OLD.approval_status = 'pending' AND NEW.approval_status = 'approved')
  EXECUTE FUNCTION check_separation_of_duties();
```

### Audit Trail Implementation

#### approval_history Table Enhancement

```sql
-- Add audit columns
ALTER TABLE approval_history 
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS previous_value JSONB,
  ADD COLUMN IF NOT EXISTS new_value JSONB,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for audit queries
CREATE INDEX IF NOT EXISTS idx_approval_history_record 
  ON approval_history(record_id, record_type, created_at DESC);

-- Prevent updates and deletes on audit trail
CREATE POLICY "approval_history_read_only" 
  ON approval_history FOR ALL 
  TO authenticated 
  USING (false);
```

#### Audit Logging Function

```sql
CREATE OR REPLACE FUNCTION log_approval_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO approval_history (
    record_id,
    record_type,
    action,
    performed_by,
    ip_address,
    user_agent,
    previous_value,
    new_value
  ) VALUES (
    OLD.id,
    'accounting_entry',
    'status_change',
    auth.email(),
    inet_client_addr(),
    current_setting('request.user_agent', true),
    jsonb_build_object(
      'approval_status', OLD.approval_status,
      'approved_by', OLD.approved_by
    ),
    jsonb_build_object(
      'approval_status', NEW.approval_status,
      'approved_by', NEW.approved_by
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Encryption Implementation

#### Database-Level Encryption (pgcrypto Extension)

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encryption function
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    encrypt(data::bytea, key::bytea, 'aes'),
    'base64'
  );
END;
$$ LANGUAGE plpgsql;

-- Decryption function
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(encrypted_data, 'base64'),
      key::bytea,
      'aes'
    ),
    'SQL_ASCII'
  );
END;
$$ LANGUAGE plpgsql;
```

#### Application-Level Encryption (Supabase Edge Function)

```typescript
// Edge Function for encrypting sensitive data
import { createClient } from '@supabase/supabase-js';

const ENCRYPTION_KEY = Deno.env.get('ACCOUNTING_ENCRYPTION_KEY');

export async function encryptBankAccountNumber(accountNumber: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(accountNumber)
  );
  
  // Return iv + encrypted as base64
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
}
```

### Session Management Implementation

#### Session Timeout (Frontend)

```javascript
// accounting-ui.js
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
let sessionTimer;

function startSessionTimer() {
  clearTimeout(sessionTimer);
  sessionTimer = setTimeout(() => {
    alert('Sesi tamat tempoh. Sila log masuk semula.');
    window.location.href = '/login.html';
  }, SESSION_TIMEOUT);
}

function resetSessionTimer() {
  startSessionTimer();
}

// Reset timer on user activity
document.addEventListener('mousemove', resetSessionTimer);
document.addEventListener('keypress', resetSessionTimer);
document.addEventListener('click', resetSessionTimer);
```

#### Concurrent Session Limit (PostgreSQL)

```sql
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES dpmm_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user 
  ON user_sessions(user_id, last_activity DESC);

-- Function to check session limit
CREATE OR REPLACE FUNCTION check_session_limit(user_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  session_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO session_count
  FROM user_sessions
  WHERE user_id = user_id_param
    AND last_activity > NOW() - INTERVAL '8 hours';
  
  RETURN session_count < 3;
END;
$$ LANGUAGE plpgsql;
```

### Backup and Recovery Implementation

#### Automated Backup Script (Supabase CLI)

```bash
#!/bin/bash
# backup-accounting.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/accounting"
PROJECT_ID="lzoloupwtqmjyupvofhh"

# Daily backup
supabase db dump --db-url "$DATABASE_URL" \
  --schema public \
  --table bank_accounts \
  --table accounting_entries \
  --table cash_accounts \
  --table cash_transactions \
  --table chart_of_accounts \
  --table journal_entries \
  --table journal_entry_lines \
  --table approval_history \
  --table spending_limits \
  > "$BACKUP_DIR/accounting-daily-$DATE.sql"

# Encrypt backup
gpg --encrypt --recipient "backup@dpmmjohor.org" \
  "$BACKUP_DIR/accounting-daily-$DATE.sql"

# Upload to secure storage (implementation-specific)
# ...
```

#### Backup Verification Script

```bash
#!/bin/bash
# verify-backup.sh

BACKUP_FILE=$1
CHECKSUM_FILE="$BACKUP_FILE.sha256"

# Generate checksum
sha256sum "$BACKUP_FILE" > "$CHECKSUM_FILE"

# Compare with stored checksum
if sha256sum -c "$CHECKSUM_FILE"; then
  echo "Backup integrity verified: $BACKUP_FILE"
  exit 0
else
  echo "Backup integrity check failed: $BACKUP_FILE"
  exit 1
fi
```

## 5. Acceptance Criteria

- **AC-SEC-001**: Given authenticated user with bendahari role, When inserting into accounting_entries, Then insert succeeds
- **AC-SEC-002**: Given authenticated user with ajk role, When inserting into bank_accounts, Then permission denied
- **AC-SEC-003**: Given creator tries to approve own entry, Then operation fails with separation of duties error
- **AC-SEC-004**: Given amount above RM 10,000, When approving without dual-signature, Then operation fails
- **AC-SEC-005**: Given all accounting operations, When audit trail queried, Then all changes logged with user ID and timestamp
- **AC-SEC-006**: Given approval_history table, When UPDATE attempted, Then operation fails (immutable)
- **AC-SEC-007**: Given bank account number in database, When retrieved via API, Then only last 4 digits visible
- **AC-SEC-008**: Given user inactive for 8 hours, When attempting operation, Then session expired error
- **AC-SEC-009**: Given backup process, When daily backup runs, Then backup encrypted and stored
- **AC-SEC-010**: Given backup verification, When checksum validated, Then integrity confirmed

## 6. Testing Strategy

- **Security Testing**: Penetration testing for RLS bypass, SQL injection, XSS
- **Access Control Testing**: Verify role-based permissions with test users
- **Audit Trail Testing**: Verify all operations logged correctly
- **Session Testing**: Test timeout, concurrent session limits
- **Backup Testing**: Test backup creation, encryption, restoration
- **Compliance Testing**: Verify alignment with Malaysian data protection laws

## 7. Related Specifications

- [spec-accounting-database-schema.md](spec-accounting-database-schema.md) - Database schema with RLS policies
- [spec-accounting-reporting.md](spec-accounting-reporting.md) - Reporting security requirements
- [plan/accounting-module-overhaul-implementation-plan.md](../plan/accounting-module-overhaul-implementation-plan.md) - Implementation plan
