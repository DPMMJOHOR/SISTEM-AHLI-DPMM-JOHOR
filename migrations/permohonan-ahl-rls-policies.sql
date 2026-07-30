-- RLS Policies for PERMOHONAN_AHLI (Membership Applications)
-- This migration enables proper Row Level Security for the membership application table

-- Enable RLS on PERMOHONAN_AHLI
ALTER TABLE "PERMOHONAN_AHLI" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon_select_permohonan" ON "PERMOHONAN_AHLI";
DROP POLICY IF EXISTS "anon_insert_permohonan" ON "PERMOHONAN_AHLI";
DROP POLICY IF EXISTS "anon_update_permohonan" ON "PERMOHONAN_AHLI";
DROP POLICY IF EXISTS "authenticated_select_permohonan" ON "PERMOHONAN_AHLI";
DROP POLICY IF EXISTS "authenticated_update_permohonan" ON "PERMOHONAN_AHLI";
DROP POLICY IF EXISTS "authenticated_delete_permohonan" ON "PERMOHONAN_AHLI";

-- Policy: Anonymous users can SELECT (read applications)
CREATE POLICY "anon_select_permohonan"
ON "PERMOHONAN_AHLI"
FOR SELECT
TO anon
USING (true);

-- Policy: Anonymous users can INSERT (submit new applications)
-- This allows the public form to submit membership applications
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

-- Policy: Authenticated users can SELECT all applications
CREATE POLICY "authenticated_select_permohonan"
ON "PERMOHONAN_AHLI"
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can UPDATE applications
CREATE POLICY "authenticated_update_permohonan"
ON "PERMOHONAN_AHLI"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Admin users can DELETE applications
CREATE POLICY "authenticated_delete_permohonan"
ON "PERMOHONAN_AHLI"
FOR DELETE
TO authenticated
USING (
  -- Only allow deletion for admin users (check via auth.uid)
  EXISTS (
    SELECT 1 FROM "DPMM_USERS"
    WHERE id = auth.uid AND role = 'admin'
  )
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON "PERMOHONAN_AHLI" TO anon, authenticated;
GRANT INSERT ON "PERMOHONAN_AHLI" TO anon;
GRANT UPDATE ON "PERMOHONAN_AHLI" TO authenticated;
GRANT DELETE ON "PERMOHONAN_AHLI" TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permohonan_ref_id ON "PERMOHONAN_AHLI"(ref_id);
CREATE INDEX IF NOT EXISTS idx_permohonan_status ON "PERMOHONAN_AHLI"(status);
CREATE INDEX IF NOT EXISTS idx_permohonan_jenis ON "PERMOHONAN_AHLI"(jenis_keahlian);
CREATE INDEX IF NOT EXISTS idx_permohonan_tarikh ON "PERMOHONAN_AHLI"(tarikh_permohonan);

COMMENT ON TABLE "PERMOHONAN_AHLI" IS 'Membership applications pending approval';
COMMENT ON POLICY "anon_select_permohonan" ON "PERMOHONAN_AHLI" IS 'Allow anonymous users to read application data';
COMMENT ON POLICY "anon_insert_permohonan" ON "PERMOHONAN_AHLI" IS 'Allow anonymous users to submit new membership applications with validation';
COMMENT ON POLICY "authenticated_select_permohonan" ON "PERMOHONAN_AHLI" IS 'Allow authenticated users to read all applications';
COMMENT ON POLICY "authenticated_update_permohonan" ON "PERMOHONAN_AHLI" IS 'Allow authenticated users to update application status';
COMMENT ON POLICY "authenticated_delete_permohonan" ON "PERMOHONAN_AHLI" IS 'Allow admin users to delete applications';
