-- Migration: Add RLS policies for new accounting tables using anon role
-- Description: Follows existing pattern from accounting_entries (anon SELECT/INSERT/UPDATE)
-- Date: 2026-08-06
-- Project: SISTEM-AHLI-DPMM-JOHOR

-- Enable RLS for chart_of_accounts
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chart_of_accounts
-- Read access for anon (matching existing pattern)
CREATE POLICY "anon_select_chart_of_accounts" 
  ON chart_of_accounts FOR SELECT 
  TO anon 
  USING (true);

-- Write access for anon (matching existing pattern)
CREATE POLICY "anon_insert_chart_of_accounts" 
  ON chart_of_accounts FOR INSERT 
  TO anon 
  WITH CHECK (true);

CREATE POLICY "anon_update_chart_of_accounts" 
  ON chart_of_accounts FOR UPDATE 
  TO anon 
  USING (true)
  WITH CHECK (true);

-- Enable RLS for journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for journal_entries
-- Read access for anon
CREATE POLICY "anon_select_journal_entries" 
  ON journal_entries FOR SELECT 
  TO anon 
  USING (true);

-- Write access for anon
CREATE POLICY "anon_insert_journal_entries" 
  ON journal_entries FOR INSERT 
  TO anon 
  WITH CHECK (true);

CREATE POLICY "anon_update_journal_entries" 
  ON journal_entries FOR UPDATE 
  TO anon 
  USING (true)
  WITH CHECK (true);

-- Enable RLS for journal_entry_lines
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for journal_entry_lines
-- Read access for anon
CREATE POLICY "anon_select_journal_entry_lines" 
  ON journal_entry_lines FOR SELECT 
  TO anon 
  USING (true);

-- Write access for anon
CREATE POLICY "anon_insert_journal_entry_lines" 
  ON journal_entry_lines FOR INSERT 
  TO anon 
  WITH CHECK (true);

CREATE POLICY "anon_update_journal_entry_lines" 
  ON journal_entry_lines FOR UPDATE 
  TO anon 
  USING (true)
  WITH CHECK (true);

-- Enable RLS for spending_limits
ALTER TABLE spending_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spending_limits
-- Read access for anon
CREATE POLICY "anon_select_spending_limits" 
  ON spending_limits FOR SELECT 
  TO anon 
  USING (true);

-- Write access for anon
CREATE POLICY "anon_insert_spending_limits" 
  ON spending_limits FOR INSERT 
  TO anon 
  WITH CHECK (true);

CREATE POLICY "anon_update_spending_limits" 
  ON spending_limits FOR UPDATE 
  TO anon 
  USING (true)
  WITH CHECK (true);
