-- RLS Remediation for Accounting Tables
-- Restores anon SELECT/INSERT/UPDATE policies to match receipts/vouchers pattern
-- Keeps authenticated policies as backup
-- DELETE remains authenticated for security

-- Drop existing anon policies if they exist
DROP POLICY IF EXISTS anon_select_accounting_entries ON accounting_entries;
DROP POLICY IF EXISTS anon_insert_accounting_entries ON accounting_entries;
DROP POLICY IF EXISTS anon_update_accounting_entries ON accounting_entries;

DROP POLICY IF EXISTS anon_select_cash_accounts ON cash_accounts;
DROP POLICY IF EXISTS anon_insert_cash_accounts ON cash_accounts;
DROP POLICY IF EXISTS anon_update_cash_accounts ON cash_accounts;

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

-- Create anon policies for accounting_entries
CREATE POLICY anon_select_accounting_entries ON accounting_entries
  FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_accounting_entries ON accounting_entries
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_accounting_entries ON accounting_entries
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Create anon policies for cash_accounts
CREATE POLICY anon_select_cash_accounts ON cash_accounts
  FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_cash_accounts ON cash_accounts
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_cash_accounts ON cash_accounts
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Create anon policies for bank_accounts
CREATE POLICY anon_select_bank_accounts ON bank_accounts
  FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_bank_accounts ON bank_accounts
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_bank_accounts ON bank_accounts
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Create anon policies for cash_transactions
CREATE POLICY anon_select_cash_transactions ON cash_transactions
  FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_cash_transactions ON cash_transactions
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_cash_transactions ON cash_transactions
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Create anon policies for chart_of_accounts
CREATE POLICY anon_select_chart_of_accounts ON chart_of_accounts
  FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_chart_of_accounts ON chart_of_accounts
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_chart_of_accounts ON chart_of_accounts
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Create anon policies for journal_entries
CREATE POLICY anon_select_journal_entries ON journal_entries
  FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_journal_entries ON journal_entries
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_journal_entries ON journal_entries
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Create anon policies for journal_entry_lines
CREATE POLICY anon_select_journal_entry_lines ON journal_entry_lines
  FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_journal_entry_lines ON journal_entry_lines
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_journal_entry_lines ON journal_entry_lines
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
