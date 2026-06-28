-- ============================================================
-- MIGRATION: Enable Supabase Auth
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Enable Supabase Auth (if not already enabled)
-- This is done in Supabase Dashboard, but we verify here

-- Step 2: Migrate existing DPMM_USERS to Supabase Auth
-- Create a temporary table to hold migration data
CREATE TEMPORARY TABLE temp_user_migration AS
SELECT 
  user_id as email,
  nama as full_name,
  kata_laluan as password,
  peranan as role,
  aktif as active
FROM DPMM_USERS;

-- Step 3: Insert users into Supabase Auth using the auth.users table
-- Note: This requires service role key and should be done via Edge Function
-- The actual migration will be done via a script

-- Step 4: Update existing tables to reference auth.uid() instead of user_id
-- This will be done after users are migrated

-- Step 5: Set up user metadata for role-based access
-- This will be set during user creation

-- ============================================================
-- POST-MIGRATION: After users are migrated to Supabase Auth
-- ============================================================

-- Add role column to auth.users metadata (done during user creation)
-- No SQL needed - roles stored in raw_user_meta_data

-- Update AHLI DPMM JOHOR to use auth.uid()
ALTER TABLE "AHLI DPMM JOHOR" 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Migrate created_by to auth_user_id
UPDATE "AHLI DPMM JOHOR" m
SET auth_user_id = u.id
FROM auth.users u
WHERE m.created_by = u.email;

-- ============================================================
-- CLEANUP: After successful migration
-- ============================================================

-- Drop old DPMM_USERS table (after verification)
-- DROP TABLE DPMM_USERS;

-- Drop old text columns (after verification)
-- ALTER TABLE "AHLI DPMM JOHOR" DROP COLUMN created_by;
