-- RLS Policies for permohonan-dokumen bucket
-- IMPORTANT: Run this as a Supabase migration using: supabase db push
-- This ensures the SQL runs with sufficient privileges to modify storage.objects

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated uploads to permohonan-dokumen" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads on permohonan-dokumen PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to own PDFs" ON storage.objects;

-- Allow authenticated users to upload to permohonan-dokumen bucket
CREATE POLICY "Allow authenticated uploads to permohonan-dokumen"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'permohonan-dokumen' 
  AND (storage.foldername(name))[1] = 'borang'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow public reads on PDFs in permohonan-dokumen bucket (for signed URLs)
CREATE POLICY "Allow public reads on permohonan-dokumen PDFs"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'permohonan-dokumen'
  AND name LIKE 'borang/%.pdf'
);

-- Allow authenticated users to update their own PDFs
CREATE POLICY "Allow authenticated updates to own PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'permohonan-dokumen'
  AND auth.uid()::text = (storage.foldername(name))[2]
)
WITH CHECK (
  bucket_id = 'permohonan-dokumen'
  AND auth.uid()::text = (storage.foldername(name))[2]
);