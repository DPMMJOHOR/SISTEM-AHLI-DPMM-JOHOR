-- Add PDF tracking columns to PERMOHONAN_AHLI table
-- IMPORTANT: Run this as a Supabase migration using: supabase db push
-- This ensures the SQL runs with sufficient privileges

-- Add pdf_url column to store Supabase Storage URL
ALTER TABLE "PERMOHONAN_AHLI" 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add pdf_uploaded_at column to track PDF upload timestamp
ALTER TABLE "PERMOHONAN_AHLI" 
ADD COLUMN IF NOT EXISTS pdf_uploaded_at TIMESTAMPTZ;

-- Add pdf_file_size column to track PDF file size in bytes
ALTER TABLE "PERMOHONAN_AHLI" 
ADD COLUMN IF NOT EXISTS pdf_file_size BIGINT;

-- Add index on pdf_url for faster queries
CREATE INDEX IF NOT EXISTS idx_permohonan_ahli_pdf_url 
ON "PERMOHONAN_AHLI"(pdf_url) 
WHERE pdf_url IS NOT NULL;

-- Add index on pdf_uploaded_at for sorting by upload date
CREATE INDEX IF NOT EXISTS idx_permohonan_ahli_pdf_uploaded_at 
ON "PERMOHONAN_AHLI"(pdf_uploaded_at DESC) 
WHERE pdf_uploaded_at IS NOT NULL;

-- Update RLS policies to allow UPDATE on new columns
DROP POLICY IF EXISTS "Allow authenticated users to update their own applications" ON "PERMOHONAN_AHLI";

CREATE POLICY "Allow authenticated users to update their own applications"
ON "PERMOHONAN_AHLI"
FOR UPDATE
TO authenticated
USING (
  ref_id IN (
    SELECT ref_id FROM "PERMOHONAN_AHLI" 
    WHERE no_kad_pengenal = auth.uid()::text
  )
)
WITH CHECK (
  ref_id IN (
    SELECT ref_id FROM "PERMOHONAN_AHLI" 
    WHERE no_kad_pengenal = auth.uid()::text
  )
);