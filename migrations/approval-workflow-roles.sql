-- Approval Workflow Roles Migration
-- Date: 2026-07-22
-- Purpose: Ensure DPMM_USERS has proper role constraints for approval workflow

-- Ensure DPMM_USERS has proper role column with valid values
ALTER TABLE "DPMM_USERS" 
ALTER COLUMN peranan SET DATA TYPE TEXT,
ADD CONSTRAINT IF NOT EXISTS valid_roles CHECK (peranan IN ('admin', 'user', 'ydp', 'nydp', 'tydp'));

-- Update existing admin users if needed
UPDATE "DPMM_USERS" SET peranan = 'admin' WHERE peranan = 'user' AND user_id = 'dpmmnj.pengurusan@gmail.com';

-- Add comments for documentation
COMMENT ON COLUMN "DPMM_USERS".peranan IS 'Peranan pengguna: admin, user, ydp, nydp, tydp';
