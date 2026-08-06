-- Migration: Create journal_entries and journal_entry_lines tables for double-entry bookkeeping
-- Description: Double-entry bookkeeping system with journal entries and line items
-- Date: 2026-08-06
-- Project: SISTEM-AHLI-DPMM-JOHOR

-- Create journal_entries table
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

-- Create indexes for journal_entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);

-- Note: RLS policies will be added in a separate migration after table creation
-- due to type mismatch between auth.uid() (UUID) and dpmm_users.id (bigint)

-- Create journal_entry_lines table
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

-- Create indexes for journal_entry_lines
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account ON journal_entry_lines(account_id);

-- Note: RLS policies will be added in a separate migration after table creation
-- due to type mismatch between auth.uid() (UUID) and dpmm_users.id (bigint)

-- Create function to auto-post journal entries when accounting_entries are approved
CREATE OR REPLACE FUNCTION auto_post_journal_entry()
RETURNS TRIGGER AS $$
DECLARE
  new_journal_id INTEGER;
  income_account_id INTEGER;
  bank_account_id INTEGER;
  cash_account_id INTEGER;
BEGIN
  -- Only proceed when status changes to 'approved'
  IF OLD.approval_status = 'pending' AND NEW.approval_status = 'approved' THEN
    
    -- Get account IDs from chart_of_accounts
    SELECT id INTO income_account_id FROM chart_of_accounts WHERE account_code = '4100'; -- Yuran Keahlian
    SELECT id INTO bank_account_id FROM chart_of_accounts WHERE account_code = '1200'; -- Akaun Bank
    SELECT id INTO cash_account_id FROM chart_of_accounts WHERE account_code = '1100'; -- Tunai di Tangan
    
    -- If specific account codes not found, use generic ones
    IF income_account_id IS NULL THEN
      SELECT id INTO income_account_id FROM chart_of_accounts WHERE account_type = 'income' LIMIT 1;
    END IF;
    
    IF bank_account_id IS NULL THEN
      SELECT id INTO bank_account_id FROM chart_of_accounts WHERE account_type = 'asset' AND account_name LIKE '%Bank%' LIMIT 1;
    END IF;
    
    IF cash_account_id IS NULL THEN
      SELECT id INTO cash_account_id FROM chart_of_accounts WHERE account_type = 'asset' AND account_name LIKE '%Tunai%' LIMIT 1;
    END IF;
    
    -- Create journal entry
    INSERT INTO journal_entries (
      entry_number,
      entry_date,
      reference_type,
      reference_id,
      description,
      status,
      posted_by,
      posted_at,
      created_by
    ) VALUES (
      'JE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 4, '0'),
      NEW.entry_date,
      'accounting_entry',
      NEW.id,
      COALESCE(NEW.description, 'Pendapatan: ' || NEW.income_category),
      'posted',
      NEW.approved_by,
      NOW(),
      NEW.created_by
    ) RETURNING id INTO new_journal_id;
    
    -- Create debit line (asset - bank or cash)
    IF NEW.payment_method = 'cash' AND cash_account_id IS NOT NULL THEN
      INSERT INTO journal_entry_lines (
        journal_entry_id,
        account_id,
        debit_amount,
        credit_amount,
        description,
        line_order
      ) VALUES (
        new_journal_id,
        cash_account_id,
        NEW.amount,
        0.00,
        'Penerimaan tunai',
        1
      );
    ELSIF NEW.payment_method IN ('online', 'cheque') AND bank_account_id IS NOT NULL THEN
      INSERT INTO journal_entry_lines (
        journal_entry_id,
        account_id,
        debit_amount,
        credit_amount,
        description,
        line_order
      ) VALUES (
        new_journal_id,
        bank_account_id,
        NEW.amount,
        0.00,
        'Penerimaan bank',
        1
      );
    END IF;
    
    -- Create credit line (income)
    IF income_account_id IS NOT NULL THEN
      INSERT INTO journal_entry_lines (
        journal_entry_id,
        account_id,
        debit_amount,
        credit_amount,
        description,
        line_order
      ) VALUES (
        new_journal_id,
        income_account_id,
        0.00,
        NEW.amount,
        NEW.income_category || ': ' || COALESCE(NEW.income_subcategory, 'Umum'),
        2
      );
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-post journal entries
CREATE TRIGGER trigger_auto_post_journal_entry
  AFTER UPDATE ON accounting_entries
  FOR EACH ROW
  WHEN (OLD.approval_status = 'pending' AND NEW.approval_status = 'approved')
  EXECUTE FUNCTION auto_post_journal_entry();

-- Create function to generate trial balance
CREATE OR REPLACE FUNCTION generate_trial_balance(as_of_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  account_code VARCHAR(20),
  account_name VARCHAR(255),
  account_type VARCHAR(20),
  debit_balance NUMERIC(15,2),
  credit_balance NUMERIC(15,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    coa.account_code,
    coa.account_name,
    coa.account_type,
    COALESCE(SUM(jel.debit_amount), 0) AS debit_balance,
    COALESCE(SUM(jel.credit_amount), 0) AS credit_balance
  FROM chart_of_accounts coa
  LEFT JOIN journal_entry_lines jel ON jel.account_id = coa.id
  LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id
    AND je.entry_date <= as_of_date
    AND je.status = 'posted'
  WHERE coa.is_active = true
  GROUP BY coa.account_code, coa.account_name, coa.account_type
  HAVING COALESCE(SUM(jel.debit_amount), 0) != 0 
     OR COALESCE(SUM(jel.credit_amount), 0) != 0
  ORDER BY coa.account_type, coa.account_code;
END;
$$ LANGUAGE plpgsql;
