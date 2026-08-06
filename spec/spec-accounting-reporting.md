---
title: Accounting Reporting Requirements Specification
version: 1.0
date_created: 2026-08-06
last_updated: 2026-08-06
owner: Development Team
tags: reporting, accounting, export, analytics
---

# Introduction

This specification defines the reporting requirements for the accounting module overhaul. It addresses critical gaps in reporting capabilities identified in the professional accountant review, including CSV export, date range filtering, financial statement generation, and bank reconciliation reporting.

## 1. Purpose & Scope

This specification provides the complete reporting requirements for:
- CSV export functionality for all accounting data
- Date range filtering and flexible reporting periods
- Profit & Loss (P&L) statement generation
- Balance sheet generation
- Bank reconciliation reporting
- Variance analysis reports
- Month-over-month comparison reports

Intended audience: Backend developers, frontend developers, and business analysts implementing the accounting module.

## 2. Definitions

- **CSV Export**: Comma-Separated Values format for data export compatible with Excel
- **P&L Statement**: Profit & Loss statement showing income, expenses, and net profit/loss over a period
- **Balance Sheet**: Financial statement showing assets, liabilities, and equity at a point in time
- **Trial Balance**: List of all account balances to verify debit/credit equality
- **Variance Analysis**: Comparison of actual vs. budgeted amounts with explanations
- **Bank Reconciliation**: Process of matching bank statement transactions with recorded entries
- **Fiscal Year**: 12-month accounting period (January 1 - December 31 for DPMM Johor)

## 3. Reporting Requirements

### CSV Export Requirements

- **RPT-CSV-001**: accounting_entries table must support CSV export
- **RPT-CSV-002**: Export must include all visible columns from UI
- **RPT-CSV-003**: Export must support UTF-8 encoding with Malay language support
- **RPT-CSV-004**: Export must include header row with column names in Malay
- **RPT-CSV-005**: Monetary values must be formatted as "RM X,XXX.XX"
- **RPT-CSV-006**: Dates must be formatted as "DD/MM/YYYY"
- **RPT-CSV-007**: Export must be downloadable via browser
- **RPT-CSV-008**: Export filename must include date range: "accounting-entries-YYYYMMDD-to-YYYYMMDD.csv"

### Date Range Filtering Requirements

- **RPT-DATE-001**: All reports must support custom date range selection
- **RPT-DATE-002**: Date picker must support individual date selection (start and end)
- **RPT-DATE-003**: Quick select options: "Bulan Ini", "Bulan Lepas", "Tahun Ini", "Tahun Lepas", "Semua"
- **RPT-DATE-004**: Date range must be validated (end date >= start date)
- **RPT-DATE-005**: Date range must not exceed 1 year for performance (with override option)
- **RPT-DATE-006**: Selected date range must persist across report views

### Profit & Loss Statement Requirements

- **RPT-PNL-001**: P&L must show income by category (Yuran, Sumbangan, Sewa, Lain-lain)
- **RPT-PNL-002**: P&L must show expenses by category (Operasi, Pentadbiran, Acara)
- **RPT-PNL-003**: P&L must calculate net profit/loss (total income - total expenses)
- **RPT-PNL-004**: P&L must show comparison with previous period (month-over-month or year-over-year)
- **RPT-PNL-005**: P&L must show variance percentage with color coding (green for positive, red for negative)
- **RPT-PNL-006**: P&L must support export to CSV and PDF
- **RPT-PNL-007**: P&L must include organization name and reporting period in header

### Balance Sheet Requirements

- **RPT-BS-001**: Balance sheet must show assets (Bank, Tunai, Aset Lain)
- **RPT-BS-002**: Balance sheet must show liabilities (Hutang, Liabiliti Lain)
- **RPT-BS-003**: Balance sheet must show equity (Modal, Baki Untung Rugi)
- **RPT-BS-004**: Balance sheet must verify accounting equation (Assets = Liabilities + Equity)
- **RPT-BS-005**: Balance sheet must show as of specific date (not date range)
- **RPT-BS-006**: Balance sheet must support export to CSV and PDF
- **RPT-BS-007**: Balance sheet must include organization name and as-of date in header

### Trial Balance Requirements

- **RPT-TB-001**: Trial balance must list all chart of accounts with balances
- **RPT-TB-002**: Trial balance must show debit and credit columns
- **RPT-TB-003**: Trial balance must verify total debits = total credits
- **RPT-TB-004**: Trial balance must highlight accounts with non-zero balance
- **RPT-TB-005**: Trial balance must support filtering by account type (asset, liability, equity, income, expense)
- **RPT-TB-006**: Trial balance must support export to CSV

### Bank Reconciliation Report Requirements

- **RPT-BR-001**: Reconciliation report must show bank statement transactions
- **RPT-BR-002**: Reconciliation report must show recorded accounting entries
- **RPT-BR-003**: Reconciliation report must show matched items
- **RPT-BR-004**: Reconciliation report must show unreconciled items (bank-only and system-only)
- **RPT-BR-005**: Reconciliation report must calculate variance (bank balance vs. system balance)
- **RPT-BR-006**: Reconciliation report must support manual match/override
- **RPT-BR-007**: Reconciliation report must show reconciliation status (Reconciled, Partial, Unreconciled)
- **RPT-BR-008**: Reconciliation report must support export to CSV and PDF

### Variance Analysis Requirements

- **RPT-VAR-001**: Variance report must compare actual vs. budgeted amounts
- **RPT-VAR-002**: Variance report must show absolute variance (actual - budget)
- **RPT-VAR-003**: Variance report must show percentage variance ((actual - budget) / budget * 100)
- **RPT-VAR-004**: Variance report must require explanation for variances > 10%
- **RPT-VAR-005**: Variance report must support drill-down to transaction level
- **RPT-VAR-006**: Variance report must support export to CSV

## 4. Implementation Details

### CSV Export Implementation

#### Backend Function (Supabase Edge Function)

```typescript
// supabase/functions/export-accounting-entries/index.ts
import { createClient } from '@supabase/supabase-js';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

interface AccountingEntry {
  id: number;
  entry_number: string;
  entry_date: string;
  income_category: string;
  income_subcategory: string | null;
  amount: number;
  member_name: string | null;
  description: string | null;
  bank_account_id: number | null;
  payment_method: string;
  reference_number: string | null;
  approval_status: string;
  approved_by: string | null;
  approval_date: string | null;
  created_by: string;
  created_at: string;
}

serve(async (req) => {
  const { startDate, endDate } = await req.json();
  
  // Fetch data
  const { data: entries, error } = await supabase
    .from('accounting_entries')
    .select('*')
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: true });
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Generate CSV
  const headers = [
    'No. Rekod',
    'Tarikh',
    'Kategori',
    'Sub-Kategori',
    'Jumlah (RM)',
    'Nama Ahli',
    'Penerangan',
    'Akaun Bank',
    'Kaedah Pembayaran',
    'No. Rujukan',
    'Status Kelulusan',
    'Diluluskan Oleh',
    'Tarikh Kelulusan',
    'Dijana Oleh',
    'Tarikh Dijana'
  ];
  
  const rows = entries.map((entry: AccountingEntry) => [
    entry.entry_number,
    formatDate(entry.entry_date),
    entry.income_category,
    entry.income_subcategory || '',
    formatCurrency(entry.amount),
    entry.member_name || '',
    entry.description || '',
    entry.bank_account_id ? `Akaun ${entry.bank_account_id}` : '',
    translatePaymentMethod(entry.payment_method),
    entry.reference_number || '',
    translateApprovalStatus(entry.approval_status),
    entry.approved_by || '',
    entry.approval_date ? formatDate(entry.approval_date) : '',
    entry.created_by,
    formatDate(entry.created_at)
  ]);
  
  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  // Generate filename
  const filename = `accounting-entries-${startDate.replace(/-/g, '')}-to-${endDate.replace(/-/g, '')}.csv`;
  
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
}

function formatCurrency(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;
}

function translatePaymentMethod(method: string): string {
  const translations: Record<string, string> = {
    'cash': 'Tunai',
    'online': 'Pindahan Dalam Talian',
    'cheque': 'Cek',
    'other': 'Lain-lain'
  };
  return translations[method] || method;
}

function translateApprovalStatus(status: string): string {
  const translations: Record<string, string> = {
    'pending': 'Menunggu',
    'approved': 'Diluluskan',
    'rejected': 'Ditolak'
  };
  return translations[status] || status;
}
```

#### Frontend Integration (accounting-ui.js)

```javascript
async function exportAccountingEntriesToCSV() {
  const startDate = document.getElementById('report-start-date').value;
  const endDate = document.getElementById('report-end-date').value;
  
  if (!startDate || !endDate) {
    alert('Sila pilih julat tarikh untuk eksport.');
    return;
  }
  
  try {
    const response = await fetch('/functions/v1/export-accounting-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate })
    });
    
    if (!response.ok) {
      throw new Error('Eksport gagal');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert('Eksport berjaya!');
  } catch (error) {
    alert('Eksport gagal: ' + error.message);
  }
}
```

### P&L Statement Generation

#### Database Function (PostgreSQL)

```sql
CREATE OR REPLACE FUNCTION generate_profit_loss_statement(start_date DATE, end_date DATE)
RETURNS TABLE (
  category VARCHAR(50),
  subcategory VARCHAR(50),
  amount NUMERIC(15,2),
  type VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    income_category AS category,
    COALESCE(income_subcategory, 'Umum') AS subcategory,
    SUM(amount) AS amount,
    'income' AS type
  FROM accounting_entries
  WHERE entry_date BETWEEN start_date AND end_date
    AND approval_status = 'approved'
  GROUP BY income_category, income_subcategory
  
  UNION ALL
  
  SELECT 
    expense_category AS category,
    COALESCE(expense_subcategory, 'Umum') AS subcategory,
    SUM(amount) AS amount,
    'expense' AS type
  FROM expense_entries
  WHERE entry_date BETWEEN start_date AND end_date
    AND approval_status = 'approved'
  GROUP BY expense_category, expense_subcategory;
END;
$$ LANGUAGE plpgsql;
```

#### Frontend P&L Report Component

```javascript
async function generateProfitLossStatement() {
  const startDate = document.getElementById('pnl-start-date').value;
  const endDate = document.getElementById('pnl-end-date').value;
  
  const { data: pnlData, error } = await supabase
    .rpc('generate_profit_loss_statement', { start_date: startDate, end_date: endDate });
  
  if (error) {
    alert('Gagal menjana penyata P&L: ' + error.message);
    return;
  }
  
  // Calculate totals
  const totalIncome = pnlData
    .filter(row => row.type === 'income')
    .reduce((sum, row) => sum + parseFloat(row.amount), 0);
  
  const totalExpense = pnlData
    .filter(row => row.type === 'expense')
    .reduce((sum, row) => sum + parseFloat(row.amount), 0);
  
  const netProfit = totalIncome - totalExpense;
  
  // Render table
  renderPNLTable(pnlData, totalIncome, totalExpense, netProfit);
}
```

### Balance Sheet Generation

#### Database Function (PostgreSQL)

```sql
CREATE OR REPLACE FUNCTION generate_balance_sheet(as_of_date DATE)
RETURNS TABLE (
  account_code VARCHAR(20),
  account_name VARCHAR(255),
  account_type VARCHAR(20),
  balance NUMERIC(15,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    coa.account_code,
    coa.account_name,
    coa.account_type,
    COALESCE(SUM(jel.debit_amount - jel.credit_amount), 0) AS balance
  FROM chart_of_accounts coa
  LEFT JOIN journal_entry_lines jel ON jel.account_id = coa.id
  LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id
    AND je.entry_date <= as_of_date
    AND je.status = 'posted'
  WHERE coa.is_active = true
  GROUP BY coa.account_code, coa.account_name, coa.account_type
  HAVING COALESCE(SUM(jel.debit_amount - jel.credit_amount), 0) != 0
  ORDER BY coa.account_type, coa.account_code;
END;
$$ LANGUAGE plpgsql;
```

### Bank Reconciliation Report

#### Database Function (PostgreSQL)

```sql
CREATE OR REPLACE FUNCTION generate_bank_reconciliation(bank_account_id INTEGER, statement_date DATE)
RETURNS TABLE (
  transaction_type VARCHAR(20),
  transaction_date DATE,
  description TEXT,
  amount NUMERIC(15,2),
  match_status VARCHAR(20),
  reference_id INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH bank_transactions AS (
    SELECT 
      'bank' AS transaction_type,
      transaction_date,
      description,
      amount,
      'unmatched' AS match_status,
      NULL::INTEGER AS reference_id
    FROM bank_statement_imports
    WHERE bank_account_id = bank_account_id
      AND transaction_date = statement_date
      AND reconciliation_id IS NULL
  ),
  system_transactions AS (
    SELECT 
      'system' AS transaction_type,
      entry_date AS transaction_date,
      description,
      amount,
      'unmatched' AS match_status,
      id AS reference_id
    FROM accounting_entries
    WHERE bank_account_id = bank_account_id
      AND entry_date = statement_date
      AND reconciliation_id IS NULL
      AND approval_status = 'approved'
  )
  SELECT * FROM bank_transactions
  UNION ALL
  SELECT * FROM system_transactions
  ORDER BY transaction_date, transaction_type;
END;
$$ LANGUAGE plpgsql;
```

## 5. UI/UX Requirements

### Report Generation Interface

- **UI-RPT-001**: Report generation modal with date range picker
- **UI-RPT-002**: Quick select buttons for common date ranges
- **UI-RPT-003**: Export buttons (CSV, PDF) for each report type
- **UI-RPT-004**: Loading indicator during report generation
- **UI-RPT-005**: Error message display with actionable guidance
- **UI-RPT-006**: Report preview in modal before download
- **UI-RPT-007**: Progress bar for large exports

### Report Display

- **UI-RPT-008**: Tables with sortable columns
- **UI-RPT-009**: Monetary values right-aligned with RM prefix
- **UI-RPT-010**: Negative values in red with parentheses
- **UI-RPT-011**: Summary section with totals at top of report
- **UI-RPT-012**: Print-friendly layout for PDF generation
- **UI-RPT-013**: Responsive design for mobile viewing

## 6. Performance Requirements

- **PERF-RPT-001**: CSV export must complete within 30 seconds for up to 10,000 records
- **PERF-RPT-002**: P&L generation must complete within 10 seconds
- **PERF-RPT-003**: Balance sheet generation must complete within 10 seconds
- **PERF-RPT-004**: Bank reconciliation must complete within 15 seconds
- **PERF-RPT-005**: Reports must use database indexes for date-based queries
- **PERF-RPT-006**: Large exports must use streaming to avoid memory issues

## 7. Acceptance Criteria

- **AC-RPT-001**: Given date range selected, When CSV export clicked, Then CSV file downloaded with correct data
- **AC-RPT-002**: Given P&L report generated, When viewed, Then income, expenses, and net profit displayed correctly
- **AC-RPT-003**: Given balance sheet generated, When viewed, Then assets equal liabilities plus equity
- **AC-RPT-004**: Given bank reconciliation report, When viewed, Then matched and unmatched items shown
- **AC-RPT-005**: Given variance report, When viewed, Then variances > 10% require explanation
- **AC-RPT-006**: Given report with 10,000 records, When exported, Then export completes within 30 seconds
- **AC-RPT-007**: Given Malay language interface, When CSV exported, Then headers in Malay and UTF-8 encoding

## 8. Related Specifications

- [spec-accounting-database-schema.md](spec-accounting-database-schema.md) - Database schema for reporting queries
- [spec-accounting-security-controls.md](spec-accounting-security-controls.md) - Security requirements for reports
- [plan/accounting-module-overhaul-implementation-plan.md](../plan/accounting-module-overhaul-implementation-plan.md) - Implementation plan
