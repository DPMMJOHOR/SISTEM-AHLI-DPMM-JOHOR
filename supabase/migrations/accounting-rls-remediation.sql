-- RLS Remediation for Accounting Tables
-- Restores anon SELECT policies to match established pattern
-- Keeps authenticated policies for INSERT/UPDATE/DELETE operations

-- Drop existing anon SELECT policies if they exist
DROP POLICY IF EXISTS anon_select_accounting_entries ON accounting_entries;
DROP POLICY IF EXISTS anon_select_cash_accounts ON cash_accounts;
DROP POLICY IF EXISTS anon_select_bank_accounts ON bank_accounts;
DROP POLICY IF EXISTS anon_select_cash_transactions ON cash_transactions;
DROP POLICY IF EXISTS anon_select_chart_of_accounts ON chart_of_accounts;
DROP POLICY IF EXISTS anon_select_journal_entries ON journal_entries;
DROP POLICY IF EXISTS anon_select_journal_entry_lines ON journal_entry_lines;

-- Create anon SELECT policies for accounting_entries
CREATE POLICY anon_select_accounting_entries ON accounting_entries
  FOR SELECT TO anon
  USING (true);

-- Create anon SELECT policies for cash_accounts
CREATE POLICY anon_select_cash_accounts ON cash_accounts
  FOR SELECT TO anon
  USING (true);

-- Create anon SELECT policies for bank_accounts
CREATE POLICY anon_select_bank_accounts ON bank_accounts
  FOR SELECT TO anon
  USING (true);

-- Create anon SELECT policies for cash_transactions
CREATE POLICY anon_select_cash_transactions ON cash_transactions
  FOR SELECT TO anon
  USING (true);

-- Create anon SELECT policies for chart_of_accounts
CREATE POLICY anon_select_chart_of_accounts ON chart_of_accounts
  FOR SELECT TO anon
  USING (true);

-- Create anon SELECT policies for journal_entries
CREATE POLICY anon_select_journal_entries ON journal_entries
  FOR SELECT TO anon
  USING (true);

-- Create anon SELECT policies for journal_entry_lines
CREATE POLICY anon_select_journal_entry_lines ON journal_entry_lines
  FOR SELECT TO anon
  USING (true);
