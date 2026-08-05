-- Migration: Create spending_limits table for role-based spending controls
-- Description: Spending limits by role and limit type (single transaction, daily, monthly)
-- Date: 2026-08-06
-- Project: SISTEM-AHLI-DPMM-JOHOR

-- Create spending_limits table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spending_limits_role ON spending_limits(role);
CREATE INDEX IF NOT EXISTS idx_spending_limits_active ON spending_limits(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_spending_limits_effective ON spending_limits(effective_from, effective_to);

-- Enable RLS
ALTER TABLE spending_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Read access for all authenticated users
CREATE POLICY "authenticated_select_spending_limits" 
  ON spending_limits FOR SELECT 
  TO authenticated 
  USING (true);

-- Write access for admin only
CREATE POLICY "admin_write_spending_limits" 
  ON spending_limits FOR ALL 
  TO authenticated 
  USING (
    (SELECT peranan FROM dpmm_users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT peranan FROM dpmm_users WHERE id = auth.uid()) = 'admin'
  );

-- Insert default spending limits for DPMM Johor
INSERT INTO spending_limits (limit_type, role, limit_amount, effective_from) VALUES
-- Bendahari limits
('single_transaction', 'bendahari', 5000.00, CURRENT_DATE),
('daily', 'bendahari', 10000.00, CURRENT_DATE),
('monthly', 'bendahari', 50000.00, CURRENT_DATE),
-- AJK limits
('single_transaction', 'ajk', 2000.00, CURRENT_DATE),
('daily', 'ajk', 5000.00, CURRENT_DATE),
('monthly', 'ajk', 20000.00, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Create function to check spending limit before approval
CREATE OR REPLACE FUNCTION check_spending_limit(
  p_amount NUMERIC,
  p_role VARCHAR,
  p_limit_type VARCHAR,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit NUMERIC;
  v_total_spent NUMERIC;
BEGIN
  -- Get the applicable limit
  SELECT limit_amount INTO v_limit
  FROM spending_limits
  WHERE role = p_role
    AND limit_type = p_limit_type
    AND is_active = true
    AND effective_from <= p_date
    AND (effective_to IS NULL OR effective_to >= p_date)
  ORDER BY effective_from DESC
  LIMIT 1;
  
  -- If no limit found, allow transaction
  IF v_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if amount exceeds single transaction limit
  IF p_limit_type = 'single_transaction' THEN
    RETURN p_amount <= v_limit;
  END IF;
  
  -- For daily/monthly limits, calculate total spent
  IF p_limit_type = 'daily' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_total_spent
    FROM accounting_entries
    WHERE approved_by IN (
      SELECT email FROM dpmm_users WHERE role = p_role
    )
    AND approval_status = 'approved'
    AND approval_date = p_date;
  ELSIF p_limit_type = 'monthly' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_total_spent
    FROM accounting_entries
    WHERE approved_by IN (
      SELECT email FROM dpmm_users WHERE role = p_role
    )
    AND approval_status = 'approved'
    AND DATE_TRUNC('month', approval_date) = DATE_TRUNC('month', p_date);
  END IF;
  
  -- Check if total + new amount exceeds limit
  RETURN (v_total_spent + p_amount) <= v_limit;
END;
$$ LANGUAGE plpgsql;
