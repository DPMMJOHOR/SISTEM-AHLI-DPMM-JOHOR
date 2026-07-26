-- Fix get_next_number return type to accommodate 23-character receipt numbers
-- Run this in Supabase SQL Editor (Table Editor → SQL)
-- Issue: Receipt number format "DPMMJHR/RR/2026-07-0001" is 23 characters but function returns VARCHAR(20)
-- Fix: Increase return type to VARCHAR(30)

CREATE OR REPLACE FUNCTION get_next_number(p_type VARCHAR(50), p_year_month VARCHAR(7))
RETURNS VARCHAR(30) SECURITY DEFINER AS $$
DECLARE
  v_seq INT;
  v_prefix VARCHAR(30);
  v_doc_code VARCHAR(10);
BEGIN
  INSERT INTO running_numbers (document_type, year_month, sequence_number)
  VALUES (p_type, p_year_month, 1)
  ON CONFLICT (document_type, year_month)
  DO UPDATE SET sequence_number = running_numbers.sequence_number + 1
  RETURNING sequence_number INTO v_seq;
  
  -- Determine document code based on type
  IF p_type = 'receipt' OR p_type = 'receipts' THEN
    v_doc_code := 'RR';
  ELSIF p_type = 'voucher' OR p_type = 'vouchers' THEN
    v_doc_code := 'PV';
  ELSE
    v_doc_code := UPPER(SUBSTRING(p_type, 1, 3));
  END IF;
  
  v_prefix := 'DPMMJHR/' || v_doc_code || '/' || p_year_month || '-' || LPAD(v_seq::TEXT, 4, '0');
  RETURN v_prefix;
END;
$$ LANGUAGE plpgsql;
