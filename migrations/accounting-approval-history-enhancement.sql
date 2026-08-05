-- Migration: Enhance approval_history table with IP tracking and value change logging
-- Description: Add IP address, user agent, and value tracking for audit trail
-- Date: 2026-08-06
-- Project: SISTEM-AHLI-DPMM-JOHOR

-- Add new columns to approval_history table
ALTER TABLE approval_history 
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS previous_value JSONB,
  ADD COLUMN IF NOT EXISTS new_value JSONB;

-- Add index for IP tracking
CREATE INDEX IF NOT EXISTS idx_approval_history_ip ON approval_history(ip_address);

-- Add index for record tracking (using voucher_id and entity_type)
CREATE INDEX IF NOT EXISTS idx_approval_history_record 
  ON approval_history(voucher_id, entity_type, action_date DESC);
