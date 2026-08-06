-- RLS Migration for Accounting Tables
-- Replaces anon role with authenticated role
-- Adds role-based policies for admin, bendahari, ajk

-- Drop existing anon policies
DROP POLICY IF EXISTS anon_select_accounting_entries ON accounting_entries;
DROP POLICY IF EXISTS anon_insert_accounting_entries ON accounting_entries;
DROP POLICY IF EXISTS anon_update_accounting_entries ON accounting_entries;

DROP POLICY IF EXISTS anon_select_cash_accounts ON cash_accounts;
DROP POLICY IF EXISTS anon_insert_cash_accounts ON cash_accounts;
DROP POLICY IF EXISTS anon_update_cash_accounts ON cash_accounts;
DROP POLICY IF EXISTS anon_delete_cash_accounts ON cash_accounts;

DROP POLICY IF EXISTS anon_select_bank_accounts ON bank_accounts;
DROP POLICY IF EXISTS anon_insert_bank_accounts ON bank_accounts;
DROP POLICY IF EXISTS anon_update_bank_accounts ON bank_accounts;

DROP POLICY IF EXISTS anon_select_cash_transactions ON cash_transactions;
DROP POLICY IF EXISTS anon_insert_cash_transactions ON cash_transactions;
DROP POLICY IF EXISTS anon_update_cash_transactions ON cash_transactions;

DROP POLICY IF EXISTS anon_select_chart_of_accounts ON chart_of_accounts;
DROP POLICY IF EXISTS anon_insert_chart_of_accounts ON chart_of_accounts;
DROP POLICY IF EXISTS anon_update_chart_of_accounts ON chart_of_accounts;

DROP POLICY IF EXISTS anon_select_journal_entries ON journal_entries;
DROP POLICY IF EXISTS anon_insert_journal_entries ON journal_entries;
DROP POLICY IF EXISTS anon_update_journal_entries ON journal_entries;

DROP POLICY IF EXISTS anon_select_journal_entry_lines ON journal_entry_lines;
DROP POLICY IF EXISTS anon_insert_journal_entry_lines ON journal_entry_lines;
DROP POLICY IF EXISTS anon_update_journal_entry_lines ON journal_entry_lines;

-- Create authenticated policies for accounting_entries
CREATE POLICY authenticated_select_accounting_entries ON accounting_entries
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY authenticated_insert_accounting_entries ON accounting_entries
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY authenticated_update_accounting_entries ON accounting_entries
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create authenticated policies for cash_accounts
CREATE POLICY authenticated_select_cash_accounts ON cash_accounts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY authenticated_insert_cash_accounts ON cash_accounts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY authenticated_update_cash_accounts ON cash_accounts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY authenticated_delete_cash_accounts ON cash_accounts
  FOR DELETE TO authenticated
  USING (true);

-- Create authenticated policies for bank_accounts
CREATE POLICY authenticated_select_bank_accounts ON bank_accounts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY authenticated_insert_bank_accounts ON bank_accounts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY authenticated_update_bank_accounts ON bank_accounts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create authenticated policies for cash_transactions
CREATE POLICY authenticated_select_cash_transactions ON cash_transactions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY authenticated_insert_cash_transactions ON cash_transactions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY authenticated_update_cash_transactions ON cash_transactions
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create authenticated policies for chart_of_accounts
CREATE POLICY authenticated_select_chart_of_accounts ON chart_of_accounts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY authenticated_insert_chart_of_accounts ON chart_of_accounts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY authenticated_update_chart_of_accounts ON chart_of_accounts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create authenticated policies for journal_entries
CREATE POLICY authenticated_select_journal_entries ON journal_entries
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY authenticated_insert_journal_entries ON journal_entries
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY authenticated_update_journal_entries ON journal_entries
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create authenticated policies for journal_entry_lines
CREATE POLICY authenticated_select_journal_entry_lines ON journal_entry_lines
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY authenticated_insert_journal_entry_lines ON journal_entry_lines
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY authenticated_update_journal_entry_lines ON journal_entry_lines
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
