-- ============================================================
-- Accounting Module — Cash Accounts Table Alteration
-- ============================================================
-- Purpose: Add missing columns to existing cash_accounts table
-- to match the UI requirements (account_name, account_type, is_active)
-- Run in Supabase SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add missing columns (idempotent)
-- ------------------------------------------------------------
ALTER TABLE cash_accounts ADD COLUMN IF NOT EXISTS account_name VARCHAR(255);
ALTER TABLE cash_accounts ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) DEFAULT 'petty_cash';
ALTER TABLE cash_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ------------------------------------------------------------
-- 2. Backfill account_name from cash_box_name if account_name is null
-- ------------------------------------------------------------
UPDATE cash_accounts SET account_name = cash_box_name WHERE account_name IS NULL AND cash_box_name IS NOT NULL;

-- ------------------------------------------------------------
-- 3. Ensure RLS policies exist
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
-- 4. Ensure indexes exist
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cash_accounts_active ON cash_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_cash_accounts_type ON cash_accounts(account_type);

-- ------------------------------------------------------------
-- 5. Ensure GRANT privileges exist
-- ------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON cash_accounts TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
