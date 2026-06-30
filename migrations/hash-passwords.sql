-- ============================================================
-- PASSWORD HASHING MIGRATION
-- Migrates plaintext passwords to bcrypt hashes
-- ============================================================
-- 
-- IMPORTANT: Run this in Supabase SQL Editor
-- This script will:
-- 1. Add a new column for hashed passwords
-- 2. Hash all existing passwords using pgcrypto
-- 3. Verify the migration
-- 4. (Manual step after verification) Drop the old plaintext column
-- 
-- ============================================================

-- Step 1: Add new column for bcrypt hashes
ALTER TABLE "DPMM_USERS" 
ADD COLUMN IF NOT EXISTS kata_laluan_hash TEXT;

-- Step 2: Enable pgcrypto extension for bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 3: Set all users to the same temporary password (@dmin123)
UPDATE "DPMM_USERS" 
SET kata_laluan = '@dmin123';

-- Step 4: Hash all passwords with bcrypt
UPDATE "DPMM_USERS" 
SET kata_laluan_hash = crypt(kata_laluan, gen_salt('bf'))
WHERE kata_laluan_hash IS NULL;

-- Step 5: Verify the migration
-- This should show all passwords now have hashes starting with $2b$
SELECT 
  id, 
  user_id, 
  nama, 
  LEFT(kata_laluan, 3) || '***' as kata_laluan_masked,
  LEFT(kata_laluan_hash, 10) || '...' as kata_laluan_hash_preview,
  peranan
FROM "DPMM_USERS";

-- ============================================================
-- MANUAL VERIFICATION STEP
-- ============================================================
-- 
-- After running this script:
-- 1. Verify the SELECT query above shows hashes starting with $2b$
-- 2. Test login with the hashed password using bcrypt verification
-- 3. If verification succeeds, run the cleanup script below
-- 
-- CLEANUP SCRIPT (run only after verification):
-- ALTER TABLE "DPMM_USERS" DROP COLUMN kata_laluan;
-- ALTER TABLE "DPMM_USERS" RENAME COLUMN kata_laluan_hash TO kata_laluan;
-- 
-- ============================================================
