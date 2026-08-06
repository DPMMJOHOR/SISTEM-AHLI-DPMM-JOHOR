-- ============================================================
-- Accounting Module — Cash Accounts Table
-- ============================================================
-- Purpose: Create cash_accounts table for tracking petty cash,
-- physical cash holdings, and other non-bank cash accounts.
-- Run in Supabase SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREATE cash_accounts table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cash_accounts (
  id             SERIAL PRIMARY KEY,
  account_name   VARCHAR(255) NOT NULL,
  account_type   VARCHAR(50) DEFAULT 'petty_cash', -- petty_cash, safe, drawer, other
  balance        NUMERIC(15,2) DEFAULT 0.00,
  location       VARCHAR(255), -- physical location (e.g., "Office Safe", "Front Desk")
  custodian      VARCHAR(255), -- person responsible for the cash
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. RLS POLICIES (anon) — frontend uses the anon key
-- ------------------------------------------------------------
ALTER TABLE cash_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cash_accounts" ON cash_accounts;
DROP POLICY IF EXISTS "anon_insert_cash_accounts" ON cash_accounts;
DROP POLICY IF EXISTS "anon_update_cash_accounts" ON cash_accounts;
DROP POLICY IF EXISTS "anon_delete_cash_accounts" ON cash_accounts;

CREATE POLICY "anon_select_cash_accounts"
  ON cash_accounts FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_insert_cash_accounts"
  ON cash_accounts FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_update_cash_accounts"
  ON cash_accounts FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_cash_accounts"
  ON cash_accounts FOR DELETE TO anon
  USING (true);

-- ------------------------------------------------------------
-- 3. Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cash_accounts_active ON cash_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_cash_accounts_type ON cash_accounts(account_type);

-- ------------------------------------------------------------
-- 4. GRANT privileges (required for anon role access)
-- ------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON cash_accounts TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
