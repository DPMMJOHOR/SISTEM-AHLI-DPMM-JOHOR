-- Migration: Rename nama_entiti to nama_perniagaan for consistency
-- This migration aligns the database column name with the frontend standard
-- Date: 2026-07-28

-- Rename the column in PERMOHONAN_AHLI table
ALTER TABLE "PERMOHONAN_AHLI" 
RENAME COLUMN nama_entiti TO nama_perniagaan;

-- Update RLS policy to use the new column name
DROP POLICY IF EXISTS "anon_insert_permohonan" ON "PERMOHONAN_AHLI";

CREATE POLICY "anon_insert_permohonan"
ON "PERMOHONAN_AHLI"
FOR INSERT
TO anon
WITH CHECK (
  -- Basic validation checks
  ref_id IS NOT NULL AND
  jenis_keahlian IS NOT NULL AND
  fasal IS NOT NULL AND
  nama_perniagaan IS NOT NULL AND
  LENGTH(TRIM(nama_perniagaan)) >= 3 AND
  -- IC validation for Malaysian IC format
  no_kad_pengenalan ~ '^\d{6}-\d{2}-\d{4}$' OR
  no_kad_pengenalan ~ '^\d{12}$' OR
  no_kad_pengenalan IS NULL
);

COMMENT ON POLICY "anon_insert_permohonan" ON "PERMOHONAN_AHLI" IS 'Allow anonymous users to submit new membership applications with validation (updated to use nama_perniagaan)';
