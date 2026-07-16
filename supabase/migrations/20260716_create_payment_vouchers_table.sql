-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_number VARCHAR(50) UNIQUE NOT NULL,
  payable_to VARCHAR(255) NOT NULL,
  payment_purpose TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  approval_status VARCHAR(50) DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by VARCHAR(50),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE payment_vouchers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all reads
CREATE POLICY "Allow read access" ON payment_vouchers FOR SELECT USING (true);

-- Create policy to allow inserts
CREATE POLICY "Allow insert" ON payment_vouchers FOR INSERT WITH CHECK (true);

-- Create policy to allow updates
CREATE POLICY "Allow update" ON payment_vouchers FOR UPDATE USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_status ON payment_vouchers(approval_status);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_created_at ON payment_vouchers(created_at DESC);
