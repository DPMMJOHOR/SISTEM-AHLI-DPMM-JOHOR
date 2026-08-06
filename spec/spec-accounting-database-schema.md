---
title: Accounting Database Schema Specification
version: 1.0
date_created: 2026-08-06
last_updated: 2026-08-06
owner: Development Team
tags: database, schema, accounting, infrastructure
---

# Introduction

This specification defines the database schema requirements for the accounting module overhaul. It addresses critical gaps identified in the professional accountant review, including missing tables, insufficient constraints, and lack of proper relationships.

## 1. Purpose & Scope

This specification provides the complete database schema design for:
- Bank accounts management
- Accounting entries (income tracking)
- Cash accounts with transaction history
- Chart of accounts for double-entry bookkeeping
- Journal entries for debit/credit tracking
- Multi-level approval workflow
- Bank reconciliation

Intended audience: Database administrators, backend developers, and system architects implementing the accounting module.

## 2. Definitions

- **RLS**: Row Level Security - PostgreSQL feature for restricting row access based on user roles
- **FK**: Foreign Key - Database constraint enforcing referential integrity
- **CHECK**: Check constraint - Database constraint validating column values
- **UUID**: Universally Unique Identifier - 128-bit identifier used as primary key
- **SERIAL**: Auto-incrementing integer sequence
- **TIMESTAMPTZ**: Timestamp with time zone
- **Double-entry bookkeeping**: Accounting method where every transaction affects at least two accounts (debit and credit)

## 3. Requirements, Constraints & Guidelines

### Schema Requirements
- **REQ-DB-001**: bank_accounts table must use SERIAL primary key
- **REQ-DB-002**: accounting_entries table must use SERIAL primary key
- **REQ-DB-003**: All monetary columns must use NUMERIC(15,2) for precision
- **REQ-DB-004**: All timestamp columns must use TIMESTAMPTZ
- **REQ-DB-005**: All tables must have created_at and updated_at columns
- **REQ-DB-006**: All tables must have proper indexes for common queries

### Constraint Requirements
- **REQ-DB-007**: receipts.member_id must have FK to AHLI DPMM JOHOR.id
- **REQ-DB-008**: receipts.receipt_type must have CHECK constraint for valid values
- **REQ-DB-009**: accounting_entries.bank_account_id must have FK to bank_accounts.id
- **REQ-DB-010**: journal_entry_lines must have FK to journal_entries.id
- **REQ-DB-011**: journal_entry_lines must have FK to chart_of_accounts.id

### Security Requirements
- **SEC-DB-001**: All accounting tables must use authenticated role (not anon)
- **SEC-DB-002**: RLS policies must enforce role-based access control
- **SEC-DB-003**: Separation of duties must be enforced at database level
- **SEC-DB-004**: Audit trail must be immutable (no UPDATE on approval_history)

### Naming Constraints
- **CON-DB-001**: Table names must match existing conventions (lowercase for new tables)
- **CON-DB-002**: Column names must use snake_case
- **CON-DB-003**: Foreign key columns must use _id suffix
- **CON-DB-004**: Boolean columns must use is_ prefix

### Guidelines
- **GUD-DB-001**: Follow existing migration file structure
- **GUD-DB-002**: Use existing RLS policy patterns from receipt-pv-system-phase1.sql
- **GUD-DB-003**: All migrations must be idempotent (IF NOT EXISTS)
- **GUD-DB-004**: Add comments to tables and columns for documentation
- **GUD-DB-005**: Use existing get_next_number function pattern for sequential numbering

## 4. Interfaces & Data Contracts

### bank_accounts Table Schema

```sql
CREATE TABLE IF NOT EXISTS bank_accounts (
  id SERIAL PRIMARY KEY,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- 'current' or 'savings'
  balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  is_main BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_bank_account UNIQUE (bank_name, account_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_main ON bank_accounts(is_main) WHERE is_main = true;
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
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
  );
```

### accounting_entries Table Schema

```sql
CREATE TABLE IF NOT EXISTS accounting_entries (
  id SERIAL PRIMARY KEY,
  entry_number VARCHAR(50) UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  income_category VARCHAR(50) NOT NULL,
  income_subcategory VARCHAR(50),
  amount NUMERIC(15,2) NOT NULL,
  member_id INTEGER,
  member_name VARCHAR(255),
  description TEXT,
  property_name VARCHAR(255),
  custom_description TEXT,
  bank_account_id INTEGER,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  supporting_document_url TEXT,
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by VARCHAR(255),
  approval_date DATE,
  rejection_reason TEXT,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_accounting_entries_bank_account 
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
    
  CONSTRAINT fk_accounting_entries_member 
    FOREIGN KEY (member_id) REFERENCES "AHLI DPMM JOHOR"(id) ON DELETE SET NULL,
    
  CONSTRAINT chk_accounting_entries_approval_status 
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    
  CONSTRAINT chk_accounting_entries_amount 
    CHECK (amount > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounting_entries_date ON accounting_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_status ON accounting_entries(approval_status);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_member ON accounting_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_bank ON accounting_entries(bank_account_id);

-- RLS Policies
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_accounting_entries" 
  ON accounting_entries FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "admin_bendahari_write_accounting_entries" 
  ON accounting_entries FOR INSERT 
  TO authenticated 
  WITH CHECK (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) IN ('admin', 'bendahari')
  );

CREATE POLICY "admin_bendahari_ajk_approve_accounting_entries" 
  ON accounting_entries FOR UPDATE 
  TO authenticated 
  USING (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) IN ('admin', 'bendahari', 'ajk')
    AND approval_status = 'pending'
  )
  WITH CHECK (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) IN ('admin', 'bendahari', 'ajk')
  );
```

### cash_transactions Table Schema

```sql
CREATE TABLE IF NOT EXISTS cash_transactions (
  id SERIAL PRIMARY KEY,
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  cash_account_id INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'replenishment'
  amount NUMERIC(15,2) NOT NULL,
  balance_before NUMERIC(15,2) NOT NULL,
  balance_after NUMERIC(15,2) NOT NULL,
  description TEXT,
  reference_number VARCHAR(100),
  performed_by VARCHAR(255) NOT NULL,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_cash_transactions_account 
    FOREIGN KEY (cash_account_id) REFERENCES cash_accounts(id) ON DELETE CASCADE,
    
  CONSTRAINT chk_cash_transactions_type 
    CHECK (transaction_type IN ('deposit', 'withdrawal', 'replenishment')),
    
  CONSTRAINT chk_cash_transactions_amount 
    CHECK (amount > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cash_transactions_account ON cash_transactions(cash_account_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date ON cash_transactions(transaction_date DESC);

-- RLS Policies
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_cash_transactions" 
  ON cash_transactions FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "admin_bendahari_write_cash_transactions" 
  ON cash_transactions FOR ALL 
  TO authenticated 
  USING (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) IN ('admin', 'bendahari')
  );
```

### chart_of_accounts Table Schema

```sql
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id SERIAL PRIMARY KEY,
  account_code VARCHAR(20) UNIQUE NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) NOT NULL, -- 'asset', 'liability', 'equity', 'income', 'expense'
  parent_account_id INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_chart_of_accounts_parent 
    FOREIGN KEY (parent_account_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    
  CONSTRAINT chk_chart_of_accounts_type 
    CHECK (account_type IN ('asset', 'liability', 'equity', 'income', 'expense'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_active ON chart_of_accounts(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_chart_of_accounts" 
  ON chart_of_accounts FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "admin_write_chart_of_accounts" 
  ON chart_of_accounts FOR ALL 
  TO authenticated 
  USING (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) = 'admin'
  );
```

### journal_entries Table Schema

```sql
CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  entry_number VARCHAR(50) UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  reference_type VARCHAR(50), -- 'accounting_entry', 'payment_voucher', 'manual'
  reference_id INTEGER,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'posted', -- 'draft', 'posted'
  posted_by VARCHAR(255),
  posted_at TIMESTAMPTZ,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_journal_entries_status 
    CHECK (status IN ('draft', 'posted'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);

-- RLS Policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_journal_entries" 
  ON journal_entries FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "admin_write_journal_entries" 
  ON journal_entries FOR ALL 
  TO authenticated 
  USING (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) = 'admin'
  );
```

### journal_entry_lines Table Schema

```sql
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id SERIAL PRIMARY KEY,
  journal_entry_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  debit_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  credit_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  description TEXT,
  line_order INTEGER NOT NULL,
  
  CONSTRAINT fk_journal_entry_lines_entry 
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    
  CONSTRAINT fk_journal_entry_lines_account 
    FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    
  CONSTRAINT chk_journal_entry_lines_balanced 
    CHECK (debit_amount > 0 OR credit_amount > 0),
    
  CONSTRAINT chk_journal_entry_lines_not_both 
    CHECK (NOT (debit_amount > 0 AND credit_amount > 0))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account ON journal_entry_lines(account_id);

-- RLS Policies
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_journal_entry_lines" 
  ON journal_entry_lines FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "admin_write_journal_entry_lines" 
  ON journal_entry_lines FOR ALL 
  TO authenticated 
  USING (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) = 'admin'
  );
```

### approval_history Enhancement Schema

```sql
-- Add new columns to existing approval_history table
ALTER TABLE approval_history 
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS previous_value JSONB,
  ADD COLUMN IF NOT EXISTS new_value JSONB,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add index for IP tracking
CREATE INDEX IF NOT EXISTS idx_approval_history_ip ON approval_history(ip_address);
```

### spending_limits Table Schema

```sql
CREATE TABLE IF NOT EXISTS spending_limits (
  id SERIAL PRIMARY KEY,
  limit_type VARCHAR(50) NOT NULL, -- 'single_transaction', 'daily', 'monthly'
  role VARCHAR(50) NOT NULL, -- 'bendahari', 'ajk'
  limit_amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'MYR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_spending_limits_type 
    CHECK (limit_type IN ('single_transaction', 'daily', 'monthly')),
    
  CONSTRAINT chk_spending_limits_dates 
    CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_spending_limits_role ON spending_limits(role);
CREATE INDEX IF NOT EXISTS idx_spending_limits_active ON spending_limits(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE spending_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_write_spending_limits" 
  ON spending_limits FOR ALL 
  TO authenticated 
  USING (
    (SELECT role FROM dpmm_users WHERE id = auth.uid()) = 'admin'
  );
```

## 5. Acceptance Criteria

- **AC-DB-001**: Given a fresh database, When migration files are applied, Then all tables are created with correct schema
- **AC-DB-002**: Given bank_accounts table, When inserting duplicate bank_name and account_number, Then constraint violation occurs
- **AC-DB-003**: Given accounting_entries table, When inserting with invalid approval_status, Then CHECK constraint fails
- **AC-DB-004**: Given authenticated user with bendahari role, When inserting into bank_accounts, Then insert succeeds
- **AC-DB-005**: Given authenticated user with ajk role, When inserting into bank_accounts, Then permission denied
- **AC-DB-006**: Given accounting_entries with pending status, When creator tries to approve, Then UPDATE fails (separation of duties)
- **AC-DB-007**: Given journal_entry_lines, When inserting with both debit and credit > 0, Then CHECK constraint fails
- **AC-DB-008**: Given chart_of_accounts, When inserting with invalid account_type, Then CHECK constraint fails
- **AC-DB-009**: Given foreign key constraints, When deleting referenced row, Then appropriate CASCADE or RESTRICT behavior occurs
- **AC-DB-010**: Given all tables, When querying with common filters, Then indexes are used (verify with EXPLAIN)

## 6. Test Automation Strategy

- **Test Levels**: Unit (constraint validation), Integration (RLS policies), End-to-End (complete workflows)
- **Frameworks**: PostgreSQL pgTAP for database testing, Supabase CLI for migration testing
- **Test Data Management**: Use transaction rollback for test isolation, seed data for consistent testing
- **CI/CD Integration**: Run database tests in GitHub Actions before deployment
- **Coverage Requirements**: 100% constraint coverage, 100% RLS policy coverage
- **Performance Testing**: Benchmark queries with 10,000+ records to ensure index effectiveness

## 7. Rationale & Context

The database schema design addresses critical gaps identified in the accountant review:

1. **Missing tables**: bank_accounts and accounting_entries were documented but not created, causing frontend errors
2. **Insufficient constraints**: No foreign keys or CHECK constraints, leading to data integrity issues
3. **Security weaknesses**: Anon role with full permissions, no separation of duties at database level
4. **No audit trail**: Approval history lacked IP tracking and value change tracking
5. **No double-entry**: Without journal entries, cannot generate proper financial statements

The design follows PostgreSQL best practices and Supabase RLS patterns established in the existing codebase.

## 8. Dependencies & External Integrations

### External Systems
- **EXT-001**: Supabase PostgreSQL - Database platform hosting all tables
- **EXT-002**: Supabase Storage - bank-statements bucket for document storage

### Third-Party Services
- None required for database schema

### Infrastructure Dependencies
- **INF-001**: Supabase project lzoloupwtqmjyupvofhh - Must have sufficient capacity
- **INF-002**: PostgreSQL 15+ - Required for generated columns and advanced constraints

### Data Dependencies
- **DAT-001**: AHLI DPMM JOHOR table - Existing member table for foreign key references
- **DAT-002**: dpmm_users table - Existing user table for role-based RLS
- **DAT-003**: receipts table - Existing receipts table for integration

### Technology Platform Dependencies
- **PLT-001**: PostgreSQL 15+ - Required for database features
- **PLT-002**: Supabase CLI - Required for migration deployment

### Compliance Dependencies
- **COM-001**: Malaysian accounting standards - Schema must support MASB requirements
- **COM-002**: Data protection laws - Audit trail must meet regulatory requirements

## 9. Examples & Edge Cases

### Example: Creating Bank Account with Validation

```sql
-- Valid insert
INSERT INTO bank_accounts (bank_name, account_number, account_type, balance, is_main)
VALUES ('Maybank', '1234567890123', 'current', 5000.00, true);

-- Invalid: Duplicate account
INSERT INTO bank_accounts (bank_name, account_number, account_type, balance)
VALUES ('Maybank', '1234567890123', 'savings', 1000.00);
-- ERROR: duplicate key value violates unique constraint "uk_bank_account"
```

### Example: Accounting Entry with Foreign Key Validation

```sql
-- Valid insert with existing bank account
INSERT INTO accounting_entries (
  entry_number, entry_date, income_category, amount, 
  bank_account_id, payment_method, created_by
)
VALUES (
  'DPMMJHR/AE/2026-08-0001', '2026-08-06', 'YURAN', 100.00,
  1, 'online', 'admin'
);

-- Invalid: Non-existent bank account
INSERT INTO accounting_entries (
  entry_number, entry_date, income_category, amount, 
  bank_account_id, payment_method, created_by
)
VALUES (
  'DPMMJHR/AE/2026-08-0002', '2026-08-06', 'YURAN', 100.00,
  999, 'online', 'admin'
);
-- ERROR: insert or update on table "accounting_entries" violates foreign key constraint
```

### Example: Journal Entry with Balance Validation

```sql
-- Valid balanced journal entry
INSERT INTO journal_entries (entry_number, entry_date, description, status, created_by)
VALUES ('JE-2026-08-0001', '2026-08-06', 'Auto-post from accounting entry #1', 'posted', 'system');

INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, line_order)
VALUES 
  (1, 1, 100.00, 0.00, 1),  -- Debit cash account
  (1, 2, 0.00, 100.00, 2); -- Credit income account

-- Invalid: Unbalanced entry
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, line_order)
VALUES 
  (1, 1, 100.00, 0.00, 1),  -- Debit 100
  (1, 2, 0.00, 50.00, 2);   -- Credit only 50
-- Application must validate total debits = total credits before posting
```

### Edge Case: Separation of Duties Enforcement

```sql
-- User creates entry
INSERT INTO accounting_entries (entry_number, entry_date, income_category, amount, created_by)
VALUES ('DPMMJHR/AE/2026-08-0001', '2026-08-06', 'YURAN', 100.00, 'user123');

-- Same user tries to approve (should fail at application level)
-- RLS policy allows UPDATE for admin/bendahari/ajk, but application must check:
UPDATE accounting_entries 
SET approval_status = 'approved', approved_by = 'user123', approval_date = '2026-08-06'
WHERE id = 1 AND created_by = 'user123';
-- Application must reject: Creator cannot approve own entry
```

## 10. Validation Criteria

- All tables created with correct columns and data types
- All foreign key constraints created and tested
- All CHECK constraints created and tested
- All indexes created and verified with EXPLAIN
- All RLS policies created and tested with different user roles
- Migration files are idempotent (can run multiple times without error)
- Data integrity maintained after constraint application
- Performance benchmarks meet requirements (<100ms for common queries)

## 11. Related Specifications / Further Reading

- [spec-accounting-security-controls.md](spec-accounting-security-controls.md) - Security requirements
- [spec-accounting-reporting.md](spec-accounting-reporting.md) - Reporting requirements
- [plan/accounting-module-overhaul-implementation-plan.md](../plan/accounting-module-overhaul-implementation-plan.md) - Implementation plan
- [migrations/receipt-pv-system-phase1.sql](../migrations/receipt-pv-system-phase1.sql) - Reference for existing patterns
- [docs/TECHNICAL-REFERENCE.md](../docs/TECHNICAL-REFERENCE.md) - Existing schema documentation
