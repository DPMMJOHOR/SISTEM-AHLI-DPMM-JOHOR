-- Add document_path column to accounting_entries for signed URL generation
-- This stores the storage path for generating secure signed URLs

ALTER TABLE accounting_entries 
ADD COLUMN IF NOT EXISTS document_path TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accounting_entries_document_path 
ON accounting_entries(document_path) 
WHERE document_path IS NOT NULL;
