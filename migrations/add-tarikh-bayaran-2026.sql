-- ============================================================
-- MIGRATION: Add TARIKH_BAYARAN_2026 Column
-- Run this in Supabase SQL Editor for SISTEM-AHLI-DPMM-JOHOR
-- ============================================================

-- Add the new column to AHLI DPMM JOHOR table
ALTER TABLE "AHLI DPMM JOHOR"
ADD COLUMN IF NOT EXISTS TARIKH_BAYARAN_2026 TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'AHLI DPMM JOHOR'
AND column_name = 'TARIKH_BAYARAN_2026';

-- ============================================================
-- OPTIONAL: Set default value for existing records
-- ============================================================

-- If you want to set a default value for existing records:
-- UPDATE "AHLI DPMM JOHOR"
-- SET TARIKH_BAYARAN_2026 = 'BELUM BAYAR'
-- WHERE TARIKH_BAYARAN_2026 IS NULL;

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check the table structure
\d "AHLI DPMM JOHOR"

-- Sample query to verify column exists
SELECT NO_AHLI, NAMA_AHLI, TARIKH_BAYARAN_2025, TARIKH_BAYARAN_2026
FROM "AHLI DPMM JOHOR"
LIMIT 5;
