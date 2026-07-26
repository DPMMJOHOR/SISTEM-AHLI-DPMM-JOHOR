-- Create receipts storage bucket for receipt PDFs
-- Run this in Supabase SQL Editor (Table Editor → SQL)
-- Note: Storage buckets must be created via Supabase Dashboard or CLI, not SQL
-- This script is for reference - use Supabase CLI or Dashboard to create the bucket

-- Manual steps:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: receipts
-- 4. Public bucket: No (private)
-- 5. File size limit: 10MB
-- 6. Allowed MIME types: application/pdf
-- 7. Click "Create bucket"

-- After creating bucket, run these RLS policies:
-- Allow authenticated users to upload receipts
CREATE POLICY "Allow authenticated uploads to receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to read receipts
CREATE POLICY "Allow authenticated reads on receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update receipts
CREATE POLICY "Allow authenticated updates to receipts"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND auth.role() = 'authenticated'
);
