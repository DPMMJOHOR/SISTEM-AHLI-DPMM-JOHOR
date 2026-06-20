-- ============================================================
-- SUPABASE SETUP SQL — DPMM Negeri Johor
-- Run this in Supabase SQL Editor (Table Editor → SQL)
-- ============================================================

-- 1. DPMM_USERS — pengguna sistem (admin + staff)
-- ============================================================
CREATE TABLE IF NOT EXISTS "DPMM_USERS" (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL UNIQUE,       -- email / login ID
  nama       TEXT NOT NULL,              -- nama penuh
  kata_laluan TEXT NOT NULL,             -- plaintext (internal system only)
  peranan    TEXT NOT NULL DEFAULT 'user', -- 'admin' | 'user'
  aktif      BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default admin (change password after first login!)
INSERT INTO "DPMM_USERS" (user_id, nama, kata_laluan, peranan, aktif)
VALUES ('dpmmnj.pengurusan@gmail.com', 'Pentadbir DPMM Negeri Johor', '@dmin123', 'admin', true)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 2. RLS POLICIES — allow anon key access
-- ============================================================

-- ROOT CAUSE FIX: RLS policies alone do NOT grant table access.
-- The anon role also needs GRANT privileges. Tables created via raw SQL
-- do not always inherit these, which causes a 401 "permission denied" (42501).
GRANT SELECT, INSERT, UPDATE, DELETE ON "DPMM_USERS" TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable RLS on DPMM_USERS
ALTER TABLE "DPMM_USERS" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first so this script is safe to re-run (idempotent)
DROP POLICY IF EXISTS "anon_read_active_users" ON "DPMM_USERS";
DROP POLICY IF EXISTS "anon_insert_users"      ON "DPMM_USERS";
DROP POLICY IF EXISTS "anon_update_users"      ON "DPMM_USERS";

-- Allow anonymous SELECT for login (only active users)
CREATE POLICY "anon_read_active_users"
  ON "DPMM_USERS" FOR SELECT TO anon
  USING (aktif = true);

-- Allow anonymous INSERT (for adding new users from admin panel)
CREATE POLICY "anon_insert_users"
  ON "DPMM_USERS" FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous UPDATE (for editing/deactivating users)
CREATE POLICY "anon_update_users"
  ON "DPMM_USERS" FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- ============================================================
-- 3. PERMOHONAN_AHLI — ensure RLS policies exist
-- ============================================================
ALTER TABLE "PERMOHONAN_AHLI" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_permohonan" ON "PERMOHONAN_AHLI";
DROP POLICY IF EXISTS "anon_insert_permohonan" ON "PERMOHONAN_AHLI";
DROP POLICY IF EXISTS "anon_update_permohonan" ON "PERMOHONAN_AHLI";

CREATE POLICY "anon_select_permohonan"
  ON "PERMOHONAN_AHLI" FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_insert_permohonan"
  ON "PERMOHONAN_AHLI" FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_update_permohonan"
  ON "PERMOHONAN_AHLI" FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- ============================================================
-- 4. DPMM_LOGS — aktiviti log
-- ============================================================
CREATE TABLE IF NOT EXISTS "DPMM_LOGS" (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT,
  user_name  TEXT,
  aksi       TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE "DPMM_LOGS" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_logs" ON "DPMM_LOGS";
DROP POLICY IF EXISTS "anon_insert_logs" ON "DPMM_LOGS";

CREATE POLICY "anon_select_logs"
  ON "DPMM_LOGS" FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_insert_logs"
  ON "DPMM_LOGS" FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================================
-- 5. DPMM_TEMPLATES — WhatsApp / message templates
-- ============================================================
CREATE TABLE IF NOT EXISTS "DPMM_TEMPLATES" (
  id      SERIAL PRIMARY KEY,
  nama    TEXT NOT NULL,
  kategori TEXT,
  isi     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE "DPMM_TEMPLATES" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_templates" ON "DPMM_TEMPLATES";
DROP POLICY IF EXISTS "anon_insert_templates" ON "DPMM_TEMPLATES";
DROP POLICY IF EXISTS "anon_update_templates" ON "DPMM_TEMPLATES";
DROP POLICY IF EXISTS "anon_delete_templates" ON "DPMM_TEMPLATES";

CREATE POLICY "anon_select_templates"
  ON "DPMM_TEMPLATES" FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_insert_templates"
  ON "DPMM_TEMPLATES" FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_update_templates"
  ON "DPMM_TEMPLATES" FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_templates"
  ON "DPMM_TEMPLATES" FOR DELETE TO anon
  USING (true);

-- ============================================================
-- 6. DPMM_DOKUMEN — document storage metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS "DPMM_DOKUMEN" (
  id       SERIAL PRIMARY KEY,
  kategori TEXT,
  tajuk    TEXT,
  isi      TEXT,
  url      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE "DPMM_DOKUMEN" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_dokumen" ON "DPMM_DOKUMEN";
DROP POLICY IF EXISTS "anon_insert_dokumen" ON "DPMM_DOKUMEN";
DROP POLICY IF EXISTS "anon_update_dokumen" ON "DPMM_DOKUMEN";

CREATE POLICY "anon_select_dokumen"
  ON "DPMM_DOKUMEN" FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_insert_dokumen"
  ON "DPMM_DOKUMEN" FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_update_dokumen"
  ON "DPMM_DOKUMEN" FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- ============================================================
-- 7. AHLI DPMM JOHOR — main members table (if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS "AHLI DPMM JOHOR" (
  id                   SERIAL PRIMARY KEY,
  NO_AHLI              TEXT,
  NAMA_AHLI            TEXT,
  NAMA                 TEXT,
  KAD_PENGENALAN       TEXT,
  ALAMAT               TEXT,
  EMEL                 TEXT,
  NO_HP                TEXT,
  JENIS_PERNIAGAAN     TEXT,
  FASAL_AHLI           TEXT,
  TARIKH_DAFTAR        TEXT,
  JANTINA              TEXT,
  STATUS               TEXT,
  NO_SSM               TEXT,
  SSM_DATELINE         TEXT,
  YURAN_PENDAFTARAN    NUMERIC,
  YURAN_1_TAHUN        NUMERIC,
  JUMLAH_YURAN_TAHUNAN NUMERIC,
  JUMLAH_YURAN_KESELURUHAN NUMERIC,
  TEMPOH_BAYARAN_YURAN INTEGER,
  TARIKH_BAYARAN_2025  TEXT,
  TARIKH_BAYARAN_2026  TEXT,
  KAEDAH_BAYARAN       TEXT,
  DAERAH               TEXT DEFAULT 'Tidak Diketahui',
  JAWATAN              TEXT DEFAULT 'AHLI',
  created_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE "AHLI DPMM JOHOR" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ahli" ON "AHLI DPMM JOHOR";
DROP POLICY IF EXISTS "anon_insert_ahli" ON "AHLI DPMM JOHOR";
DROP POLICY IF EXISTS "anon_update_ahli" ON "AHLI DPMM JOHOR";

CREATE POLICY "anon_select_ahli"
  ON "AHLI DPMM JOHOR" FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_insert_ahli"
  ON "AHLI DPMM JOHOR" FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_update_ahli"
  ON "AHLI DPMM JOHOR" FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- ============================================================
-- 8. MIGRATION — add TARIKH_BAYARAN_2026 to existing databases
-- ============================================================
-- Run this if your "AHLI DPMM JOHOR" table already exists and
-- was created before this column was added:
ALTER TABLE "AHLI DPMM JOHOR"
  ADD COLUMN IF NOT EXISTS TARIKH_BAYARAN_2026 TEXT;

-- ============================================================
-- 9. STORAGE BUCKET — ensure public policy
-- ============================================================
-- Go to Supabase Dashboard → Storage → Policies
-- Add these policies for bucket "permohonan-dokumen":
--
--   Bucket: permohonan-dokumen
--   Policy 1: SELECT (anon) — Allow
--   Policy 2: INSERT (anon) — Allow
--   Policy 3: UPDATE (anon) — Allow
--   Policy 4: DELETE (anon) — Allow
--
-- Or run via SQL (if using legacy storage API):
-- CREATE POLICY "anon_storage_all"
--   ON storage.objects FOR ALL TO anon
--   USING (bucket_id = 'permohonan-dokumen')
--   WITH CHECK (bucket_id = 'permohonan-dokumen');
