-- ============================================================
-- AUDIT LOG TABLE CREATION
-- Creates DPMM_AUDIT_LOG table for security audit trail
-- ============================================================
-- 
-- This table tracks all data operations for security compliance
-- ============================================================

-- Create DPMM_AUDIT_LOG table
CREATE TABLE IF NOT EXISTS "DPMM_AUDIT_LOG" (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT,                    -- who performed the action
  action      TEXT NOT NULL,           -- INSERT, UPDATE, DELETE, SELECT
  table_name  TEXT NOT NULL,           -- which table was affected
  record_id   TEXT,                    -- which record (if applicable)
  old_values  JSONB,                   -- previous state (for UPDATE/DELETE)
  new_values  JSONB,                   -- new state (for INSERT/UPDATE)
  ip_address  TEXT,                    -- client IP (if available)
  user_agent  TEXT,                    -- client user agent
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE "DPMM_AUDIT_LOG" ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON "DPMM_AUDIT_LOG" TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Drop existing policies
DROP POLICY IF EXISTS "anon_select_audit_log" ON "DPMM_AUDIT_LOG";
DROP POLICY IF EXISTS "anon_insert_audit_log" ON "DPMM_AUDIT_LOG";

-- Allow anonymous SELECT (for admin audit review)
CREATE POLICY "anon_select_audit_log"
  ON "DPMM_AUDIT_LOG" FOR SELECT TO anon
  USING (true);

-- Allow anonymous INSERT (for logging)
CREATE POLICY "anon_insert_audit_log"
  ON "DPMM_AUDIT_LOG" FOR INSERT TO anon
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON "DPMM_AUDIT_LOG"(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON "DPMM_AUDIT_LOG"(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON "DPMM_AUDIT_LOG"(created_at DESC);

-- ============================================================
-- VERIFICATION
-- ============================================================
-- This should show the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'DPMM_AUDIT_LOG'
ORDER BY ordinal_position;
