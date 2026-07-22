-- Add proksi_hp column to PERMOHONAN_AHLI table for WhatsApp communication
-- This column stores the proxy phone number for membership applications

DO $$
BEGIN
  -- Check if column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'PERMOHONAN_AHLI' 
    AND column_name = 'proksi_hp'
  ) THEN
    ALTER TABLE "PERMOHONAN_AHLI" 
    ADD COLUMN proksi_hp VARCHAR(20);
    
    COMMENT ON COLUMN "PERMOHONAN_AHLI".proksi_hp IS 'Nombor telefon proksi untuk WhatsApp';
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_permohonan_proksi_hp 
ON "PERMOHONAN_AHLI"(proksi_hp);
