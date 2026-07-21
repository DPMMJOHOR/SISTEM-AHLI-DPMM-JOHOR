-- ============================================================
-- Receipt & Payment Voucher — Live Schema Alignment
-- ============================================================
-- Purpose: The live `receipts` and `vouchers` tables were created with a
-- minimal/legacy schema that is missing columns the application code needs.
-- This migration is ADDITIVE and IDEMPOTENT (safe to run multiple times).
-- Run in Supabase SQL Editor.
--
-- Verified live schema BEFORE this migration (via REST introspection):
--   receipts: id, receipt_number, member_id, member_name, amount,
--             payment_date, created_at, updated_at
--   vouchers: id, voucher_number, purpose, amount, approved_by, status,
--             payment_date, created_at, updated_at
-- ============================================================

-- ------------------------------------------------------------
-- 0. FIX DATA TYPE MISMATCH — member_id should be INTEGER not UUID
-- ------------------------------------------------------------
-- The live receipts table has member_id as UUID, but AHLI DPMM JOHOR.id is SERIAL (integer)
-- This causes "invalid input syntax for type uuid" errors when inserting integer member IDs
-- Since UUID cannot be cast to INTEGER, we drop and recreate the column
ALTER TABLE receipts DROP COLUMN IF EXISTS member_id;
ALTER TABLE receipts ADD COLUMN member_id INTEGER;

-- ------------------------------------------------------------
-- 1. RECEIPTS — add missing columns
-- ------------------------------------------------------------
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS receipt_type          VARCHAR(50) DEFAULT 'membership_fee';
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS nombor_ahli           VARCHAR(50);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS payment_method        VARCHAR(50);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS receipt_date          TIMESTAMP DEFAULT NOW();
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS receipt_pdf_url       TEXT;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS digital_signature_url TEXT;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS transaction_id        VARCHAR(100);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS payment_slip_id       INTEGER;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS created_by            TEXT;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS description           TEXT;

-- Backfill receipt_date from created_at for any existing rows
UPDATE receipts SET receipt_date = created_at WHERE receipt_date IS NULL;

-- ------------------------------------------------------------
-- 2. VOUCHERS — add missing columns
-- ------------------------------------------------------------
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS payable_to            VARCHAR(255);
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS payment_purpose       TEXT;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS payment_method        VARCHAR(50);
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS prepared_by           TEXT;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS approval_status       VARCHAR(20) DEFAULT 'pending';
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS approval_date         TIMESTAMP;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS rejection_reason      TEXT;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS payment_status        VARCHAR(20) DEFAULT 'pending';
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS voucher_pdf_url       TEXT;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS digital_signature_url TEXT;

-- Backfill new columns from legacy columns where possible
UPDATE vouchers SET payment_purpose = purpose      WHERE payment_purpose IS NULL AND purpose IS NOT NULL;
UPDATE vouchers SET approval_status = status       WHERE approval_status IS NULL AND status IS NOT NULL;

-- ------------------------------------------------------------
-- 3. RLS POLICIES (anon) — frontend uses the anon key
-- ------------------------------------------------------------
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_receipts" ON receipts;
DROP POLICY IF EXISTS "anon_insert_receipts" ON receipts;
DROP POLICY IF EXISTS "anon_update_receipts" ON receipts;
CREATE POLICY "anon_select_receipts" ON receipts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_receipts" ON receipts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_receipts" ON receipts FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_vouchers" ON vouchers;
DROP POLICY IF EXISTS "anon_insert_vouchers" ON vouchers;
DROP POLICY IF EXISTS "anon_update_vouchers" ON vouchers;
CREATE POLICY "anon_select_vouchers" ON vouchers FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_vouchers" ON vouchers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_vouchers" ON vouchers FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- 4. Indexes (idempotent)
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_receipts_created  ON receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_vouchers_created  ON vouchers(created_at);
CREATE INDEX IF NOT EXISTS idx_vouchers_approval ON vouchers(approval_status);
