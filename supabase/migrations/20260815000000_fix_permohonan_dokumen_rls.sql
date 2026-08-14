-- Fix RLS policies for permohonan-dokumen bucket + PERMOHONAN_AHLI table
-- Context: This app has NO Supabase Auth session (no supabase.auth.signIn calls anywhere).
-- All requests — from the public borang.html submission form AND the admin index.html
-- panel — use the anon key only. Role/permission checks are handled entirely at the
-- application layer via a custom DPMM_USERS table, not Supabase Auth.
--
-- This means any RLS policy scoped `TO authenticated` or referencing `auth.uid()` never
-- applies to this app and silently blocks the operation (no error is even returned for
-- SELECT/DELETE — RLS just filters the row out).
--
-- Bugs this migration fixes:
-- 1) Applicant-uploaded documents (photos, SSM cert, payment slip, etc.) were uploaded to
--    paths like "{ref_id}/{key}.{ext}" but the only SELECT policy on the bucket restricted
--    reads to "borang/%.pdf" — so every non-PDF document 404'd as soon as anyone (admin)
--    tried to view it ("Bucket not found" from Supabase's private-bucket public-URL route).
-- 2) Admin could not delete a permohonan record — there was no DELETE policy at all on
--    PERMOHONAN_AHLI, so the delete request succeeded with 0 rows affected and no error.
--
-- IMPORTANT: Run this as a Supabase migration using: supabase db push

-- ── STORAGE: permohonan-dokumen bucket ──────────────────────────────────────
DROP POLICY IF EXISTS "Allow authenticated uploads to permohonan-dokumen" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads on permohonan-dokumen PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to own PDFs" ON storage.objects;

-- Allow inserts (uploads) from the public borang + admin panel (anon key, no auth session)
CREATE POLICY "Allow anon uploads to permohonan-dokumen"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'permohonan-dokumen');

-- Allow reads on ALL files in the bucket (previously restricted to borang/%.pdf only,
-- which excluded every applicant document: photos, SSM cert, payment slip, etc.)
CREATE POLICY "Allow anon reads on permohonan-dokumen"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'permohonan-dokumen');

-- Allow re-uploads/upserts (borang.html uses upsert:true on retries)
CREATE POLICY "Allow anon updates to permohonan-dokumen"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'permohonan-dokumen')
WITH CHECK (bucket_id = 'permohonan-dokumen');

-- ── TABLE: PERMOHONAN_AHLI ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow anon delete on PERMOHONAN_AHLI" ON "PERMOHONAN_AHLI";

-- Allow the admin panel (anon key, app-level role check only) to delete applications
CREATE POLICY "Allow anon delete on PERMOHONAN_AHLI"
ON "PERMOHONAN_AHLI"
FOR DELETE
TO anon, authenticated
USING (true);
