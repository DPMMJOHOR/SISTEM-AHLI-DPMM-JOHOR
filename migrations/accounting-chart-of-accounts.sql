-- Migration: Create chart_of_accounts table for double-entry bookkeeping
-- Description: Chart of accounts with account codes, types, and hierarchy
-- Date: 2026-08-06
-- Project: SISTEM-AHLI-DPMM-JOHOR

-- Create chart_of_accounts table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id SERIAL PRIMARY KEY,
  account_code VARCHAR(20) UNIQUE NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) NOT NULL, -- 'asset', 'liability', 'equity', 'income', 'expense'
  parent_account_id INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_chart_of_accounts_parent 
    FOREIGN KEY (parent_account_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    
  CONSTRAINT chk_chart_of_accounts_type 
    CHECK (account_type IN ('asset', 'liability', 'equity', 'income', 'expense'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_active ON chart_of_accounts(is_active) WHERE is_active = true;

-- Note: RLS policies will be added in a separate migration after table creation
-- due to type mismatch between auth.uid() (UUID) and dpmm_users.id (bigint)

-- Insert default chart of accounts for DPMM Johor
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
-- Assets
('1000', 'Aset Semasa', 'asset', 'Aset semasa seperti tunai dan bank'),
('1100', 'Tunai di Tangan', 'asset', 'Tunai fizikal di peti tunai'),
('1200', 'Akaun Bank', 'asset', 'Dana di akaun bank'),
('1300', 'Akaun Bank-Maybank', 'asset', 'Akaun bank Maybank'),
('1400', 'Akaun Bank-CIMB', 'asset', 'Akaun bank CIMB'),
('1500', 'Aset Tetap', 'asset', 'Aset tetap seperti peralatan'),
('1600', 'Peralatan Pejabat', 'asset', 'Komputer, printer, peralatan pejabat'),
('1700', 'Hutang Ahli', 'asset', 'Yuran tertunggak dari ahli'),

-- Liabilities
('2000', 'Liabiliti Semasa', 'liability', 'Liabiliti semasa yang perlu dibayar dalam setahun'),
('2100', 'Hutang Pembekal', 'liability', 'Hutang kepada pembekal'),
('2200', 'Yuran Tertunggak', 'liability', 'Yuran yang belum diterima'),
('2300', 'Liabiliti Lain', 'liability', 'Liabiliti lain-lain'),

-- Equity
('3000', 'Ekuiti', 'equity', 'Ekuiti pertubuhan'),
('3100', 'Modal Permulaan', 'equity', 'Modal permulaan pertubuhan'),
('3200', 'Baki Untung Rugi', 'equity', 'Baki untung rugi dibawa ke hadapan'),
('3300', 'Resit', 'equity', 'Yuran keahlian dan sumbangan'),

-- Income
('4000', 'Pendapatan', 'income', 'Semua sumber pendapatan'),
('4100', 'Yuran Keahlian', 'income', 'Yuran pendaftaran dan tahunan ahli'),
('4110', 'Yuran Pendaftaran', 'income', 'Yuran pendaftaran ahli baru'),
('4120', 'Yuran Tahunan', 'income', 'Yuran tahunan keahlian'),
('4200', 'Sumbangan', 'income', 'Sumbangan dari pihak luar'),
('4210', 'Sumbangan Korporat', 'income', 'Sumbangan dari syarikat'),
('4220', 'Sumbangan Kerajaan', 'income', 'Sumbangan dari kerajaan'),
('4230', 'Sumbangan Individu', 'income', 'Sumbangan dari individu'),
('4300', 'Sewa Hartanah', 'income', 'Pendapatan sewa hartanah'),
('4400', 'Faedah Bank', 'income', 'Faedah dari akaun bank'),
('4500', 'Pendapatan Lain', 'income', 'Pendapatan lain-lain'),

-- Expenses
('5000', 'Perbelanjaan', 'expense', 'Semua perbelanjaan operasi'),
('5100', 'Perbelanjaan Operasi', 'expense', 'Kos operasi harian'),
('5110', 'Sewa Pejabat', 'expense', 'Sewa premis pejabat'),
('5120', 'Utiliti', 'expense', 'Elektrik, air, internet'),
('5130', 'Penyelenggaraan', 'expense', 'Kos penyelenggaraan'),
('5200', 'Perbelanjaan Pentadbiran', 'expense', 'Kos pentadbiran umum'),
('5210', 'Gaji Upah', 'expense', 'Gaji pekerja dan upah'),
('5220', 'Perjalanan', 'expense', 'Kos perjalanan rasmi'),
('5230', 'Sukan', 'expense', 'Kos aktiviti sukan'),
('5300', 'Perbelanjaan Acara', 'expense', 'Kos acara dan program'),
('5310', 'Mesyuarat AGM', 'expense', 'Kos mesyuarat agung tahunan'),
('5320', 'Program Latihan', 'expense', 'Kos program latihan'),
('5400', 'Perbelanjaan Lain', 'expense', 'Perbelanjaan lain-lain')
ON CONFLICT (account_code) DO NOTHING;
