-- Verify NO_HP column exists in AHLI DPMM JOHOR
-- Date: 2026-07-22
-- Purpose: Verify phone number column exists for WhatsApp integration

-- Verify NO_HP column exists (should already exist)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'AHLI DPMM JOHOR' 
AND column_name = 'NO_HP';

-- Add comment if not present
COMMENT ON COLUMN "AHLI DPMM JOHOR".NO_HP IS 'Nombor telefon ahli untuk WhatsApp';
COMMENT ON COLUMN "AHLI DPMM JOHOR".EMEL IS 'E-mel ahli untuk komunikasi';
