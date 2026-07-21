-- Receipt and Payment Voucher System - Phase 1 Database Setup
-- Run this in Supabase SQL Editor (Table Editor → SQL)

-- ============================================================
-- 1. RECEIPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  receipt_type VARCHAR(50) DEFAULT 'membership_fee',
  member_id INTEGER, -- References "AHLI DPMM JOHOR".id (SERIAL, not UUID)
  member_name VARCHAR(255),
  nombor_ahli VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_date DATE,
  receipt_date TIMESTAMP DEFAULT NOW(),
  receipt_pdf_url TEXT,
  digital_signature_url TEXT,
  transaction_id VARCHAR(100),
  payment_slip_id INTEGER, -- References payment_slips.id (SERIAL, not UUID)
  created_by TEXT, -- References DPMM_USERS.user_id
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_receipts_number ON receipts(receipt_number);
CREATE INDEX idx_receipts_member ON receipts(member_id);
CREATE INDEX idx_receipts_date ON receipts(receipt_date);
CREATE INDEX idx_receipts_transaction ON receipts(transaction_id);
CREATE INDEX idx_receipts_slip ON receipts(payment_slip_id);

-- ============================================================
-- 2. PAYMENT SLIPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_slips (
  id SERIAL PRIMARY KEY,
  slip_number VARCHAR(50) UNIQUE NOT NULL,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  member_id INTEGER, -- References "AHLI DPMM JOHOR".id (SERIAL, not UUID)
  member_name VARCHAR(255),
  nombor_ahli VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_date DATE,
  slip_image_url TEXT,
  ocr_status VARCHAR(20) DEFAULT 'pending', -- pending, processed, failed
  ocr_confidence DECIMAL(3,2),
  uploaded_by TEXT, -- References DPMM_USERS.user_id
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_slips_number ON payment_slips(slip_number);
CREATE INDEX idx_slips_transaction ON payment_slips(transaction_id);
CREATE INDEX idx_slips_member ON payment_slips(member_id);
CREATE INDEX idx_slips_status ON payment_slips(ocr_status);

-- ============================================================
-- 3. PAYMENT VOUCHERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id SERIAL PRIMARY KEY,
  voucher_number VARCHAR(50) UNIQUE NOT NULL,
  payable_to VARCHAR(255) NOT NULL,
  payment_purpose TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  prepared_by TEXT NOT NULL, -- References DPMM_USERS.user_id
  approved_by TEXT, -- References DPMM_USERS.user_id
  approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approval_date TIMESTAMP,
  rejection_reason TEXT,
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  payment_date DATE,
  voucher_pdf_url TEXT,
  digital_signature_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vouchers_number ON payment_vouchers(voucher_number);
CREATE INDEX idx_vouchers_status ON payment_vouchers(approval_status);
CREATE INDEX idx_vouchers_prepared ON payment_vouchers(prepared_by);
CREATE INDEX idx_vouchers_approved ON payment_vouchers(approved_by);

-- ============================================================
-- 4. APPROVAL HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS approval_history (
  id SERIAL PRIMARY KEY,
  voucher_id INTEGER NOT NULL, -- References payment_vouchers.id
  action VARCHAR(20) NOT NULL, -- created, approved, rejected
  performed_by TEXT NOT NULL, -- References DPMM.user_id
  action_date TIMESTAMP DEFAULT NOW(),
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_approval_history_voucher ON approval_history(voucher_id);
CREATE INDEX idx_approval_history_date ON approval_history(action_date);

-- ============================================================
-- 5. RUNNING NUMBER COUNTER
-- ============================================================
CREATE TABLE IF NOT EXISTS running_numbers (
  id SERIAL PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL, -- receipt, payment_voucher
  year_month VARCHAR(7) NOT NULL, -- YYYY-MM
  sequence_number INT NOT NULL,
  UNIQUE(document_type, year_month)
);

-- Function to get next running number
CREATE OR REPLACE FUNCTION get_next_number(p_type VARCHAR(50), p_year_month VARCHAR(7))
RETURNS VARCHAR(50) AS $$
DECLARE
  v_seq INT;
  v_prefix VARCHAR(10);
BEGIN
  INSERT INTO running_numbers (document_type, year_month, sequence_number)
  VALUES (p_type, p_year_month, 1)
  ON CONFLICT (document_type, year_month)
  DO UPDATE SET sequence_number = sequence_number + 1
  RETURNING sequence_number INTO v_seq;
  
  v_prefix := UPPER(SUBSTRING(p_type, 1, 3)) || '-' || p_year_month || '-' || LPAD(v_seq::TEXT, 4, '0');
  RETURN v_prefix;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. RLS POLICIES FOR NEW TABLES
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE running_numbers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "anon_select_receipts" ON receipts;
DROP POLICY IF EXISTS "anon_insert_receipts" ON receipts;
DROP POLICY IF EXISTS "anon_update_receipts" ON receipts;
DROP POLICY IF EXISTS "anon_select_slips" ON payment_slips;
DROP POLICY IF EXISTS "anon_insert_slips" ON payment_slips;
DROP POLICY IF EXISTS "anon_update_slips" ON payment_slips;
DROP POLICY IF EXISTS "anon_select_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "anon_insert_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "anon_update_vouchers" ON payment_vouchers;
DROP POLICY IF EXISTS "anon_select_approval" ON approval_history;
DROP POLICY IF EXISTS "anon_insert_approval" ON approval_history;
DROP POLICY IF EXISTS "anon_select_running" ON running_numbers;
DROP POLICY IF EXISTS "anon_insert_running" ON running_numbers;

-- Receipts - Read-only for all authenticated users, Insert/Update for BK/Admin
CREATE POLICY "authenticated_select_receipts"
  ON receipts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "bk_insert_receipts"
  ON receipts FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "DPMM_USERS" 
      WHERE user_id = auth.uid()::TEXT 
      AND peranan IN ('admin', 'bendahari_kehormat')
    )
  );

CREATE POLICY "bk_update_receipts"
  ON receipts FOR UPDATE TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "DPMM_USERS" 
      WHERE user_id = auth.uid()::TEXT 
      AND peranan IN ('admin', 'bendahari_kehormat')
    )
  );

-- Payment Slips - Read-only for all authenticated users, Insert/Update for BK/Admin
CREATE POLICY "authenticated_select_slips"
  ON payment_slips FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "bk_insert_slips"
  ON payment_slips FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "DPMM_USERS" 
      WHERE user_id = auth.uid()::TEXT 
      AND peranan IN ('admin', 'bendahari_kehormat')
    )
  );

CREATE POLICY "bk_update_slips"
  ON payment_slips FOR UPDATE TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "DPMM_USERS" 
      WHERE user_id = auth.uid()::TEXT 
      AND peranan IN ('admin', 'bendahari_kehormat')
    )
  );

-- Payment Vouchers - Read-only for all authenticated users, Insert for BK/Admin, Update for BK/Admin/YDP/TYDP/NYDP
CREATE POLICY "authenticated_select_vouchers"
  ON payment_vouchers FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "bk_insert_vouchers"
  ON payment_vouchers FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "DPMM_USERS" 
      WHERE user_id = auth.uid()::TEXT 
      AND peranan IN ('admin', 'bendahari_kehormat')
    )
  );

CREATE POLICY "approval_update_vouchers"
  ON payment_vouchers FOR UPDATE TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "DPMM_USERS" 
      WHERE user_id = auth.uid()::TEXT 
      AND peranan IN ('admin', 'bendahari_kehormat', 'ydp', 'tydp', 'nydp')
    )
  );

-- Approval History - Read-only for all authenticated users, Insert for all authenticated users
CREATE POLICY "authenticated_select_approval"
  ON approval_history FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_approval"
  ON approval_history FOR INSERT TO authenticated
  WITH CHECK (true);

-- Running Numbers - Read-only for all authenticated users, Insert for all authenticated users
CREATE POLICY "authenticated_select_running"
  ON running_numbers FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_running"
  ON running_numbers FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 7. MEMBER TABLE UPDATE - Check if nombor_ahli exists
-- ============================================================
-- Check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'AHLI DPMM JOHOR' 
    AND column_name = 'nombor_ahli'
  ) THEN
    ALTER TABLE "AHLI DPMM JOHOR"
    ADD COLUMN nombor_ahli TEXT;
  END IF;
END $$;
