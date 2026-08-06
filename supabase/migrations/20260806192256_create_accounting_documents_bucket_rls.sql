-- Create accounting-documents storage bucket RLS policies
-- Run this AFTER creating the bucket in Supabase Dashboard
-- 
-- MANUAL STEPS (do this first):
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: accounting-documents
-- 4. Public bucket: Yes (public for document access)
-- 5. File size limit: 10MB
-- 6. Allowed MIME types: image/jpeg, image/png, application/pdf
-- 7. Click "Create bucket"
--
-- Then run this SQL to apply RLS policies

-- Allow authenticated users to upload accounting documents
CREATE POLICY "Allow authenticated uploads to accounting-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'accounting-documents'
  AND auth.role() = 'authenticated'
);

-- Allow public reads on accounting-documents (public bucket)
CREATE POLICY "Allow public reads on accounting-documents"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'accounting-documents'
);

-- Allow authenticated users to update accounting documents
CREATE POLICY "Allow authenticated updates to accounting-documents"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (
  bucket_id = 'accounting-documents'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete accounting documents
CREATE POLICY "Allow authenticated deletes on accounting-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'accounting-documents'
  AND auth.role() = 'authenticated'
);
