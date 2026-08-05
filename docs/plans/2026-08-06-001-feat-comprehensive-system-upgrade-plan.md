---
goal: Comprehensive System Upgrade - AIMAN Chatbot, Accounting Module & Bank Statement OCR
version: 1.0
date_created: 2026-08-06
last_updated: 2026-08-06
owner: Development Team
status: Planned
tags: feature, chatbot, accounting, ocr, database, security, ui-ux
---

# Comprehensive System Upgrade Implementation Plan

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan consolidates three major upgrade initiatives for SISTEM-AHLI-DPMM-JOHOR:
1. **AIMAN Chatbot Upgrade** - Transform from basic chatbot to context-aware personal assistant
2. **Accounting Module Overhaul** - Fix all accountant recommendations and implement proper accounting controls
3. **Bank Statement OCR Extraction** - Add intelligent transaction extraction from bank statements

## Summary

This comprehensive upgrade addresses critical gaps across three system areas:
- **AIMAN Chatbot**: Currently uses OpenRouter GPT-4o-mini but lacks context awareness, quick-reply buttons, animations, and accessibility features
- **Accounting Module**: Professional accountant review revealed documented features don't exist in database; missing security controls, proper RLS policies, and reporting capabilities
- **Bank Statement Processing**: Currently only stores files as attachments; needs OCR extraction, duplicate detection, and bulk import capabilities

The plan is organized into three tracks that can be executed in parallel where dependencies allow:
- Track A: AIMAN Chatbot Enhancement (8 tasks)
- Track B: Accounting Module Overhaul (13 tasks, including tab consolidation)
- Track C: Bank Statement OCR Integration (7 tasks)

## Current System State

### Database Schema (Supabase Project: lzoloupwtqmjyupvofhh)

**Public Schema Tables:**
- `AHLI DPMM JOHOR` - Main member table (90 rows, RLS enabled)
- `accounting_entries` - Income records (0 rows, RLS enabled)
- `bank_accounts` - Bank account management (0 rows, RLS enabled)
- `cash_accounts` - Cash account management (6 rows, RLS enabled)
- `cash_transactions` - Cash transaction history (0 rows, RLS enabled)
- `cash_reconciliation` - Cash reconciliation records (0 rows, RLS enabled)
- `chart_of_accounts` - Chart of accounts for double-entry (40 rows, RLS enabled)
- `journal_entries` - Journal entry headers (0 rows, RLS enabled)
- `journal_entry_lines` - Journal entry line items (0 rows, RLS enabled)
- `receipts` - Receipt records (0 rows, RLS enabled)
- `vouchers` - Payment voucher records (0 rows, RLS enabled)
- `spending_limits` - Role-based spending limits (6 rows, RLS enabled)
- `audit_report_snapshots` - Audit report storage (0 rows, RLS enabled)

**Storage Schema:**
- `bank-statements` bucket exists for bank statement storage
- `permohonan-dokumen` bucket for membership application documents

**Security Advisory:**
- `dpmm_templates` table has RLS disabled (critical security issue)

### Current Implementation Status

**AIMAN Chatbot:**
- Uses OpenRouter `openai/gpt-4o-mini` (migrated from Groq in July 2026)
- Basic question-answering only
- No conversation history context
- No quick-reply buttons
- No typing indicator animations
- No step-aware greetings
- No ARIA accessibility support

**Accounting Module:**
- Cash accounts: Available (6 rows)
- Bank accounts: NOT implemented (0 rows)
- Accounting entries: NOT implemented (0 rows)
- Double-entry bookkeeping: Tables exist but no data
- Approval workflow: Partial implementation
- Reports: Basic KPI only, no CSV export, no P&L/balance sheet

**Bank Statement Processing:**
- File upload to `bank-statements` bucket works
- URL stored in `supporting_document_url` column
- No OCR extraction
- No transaction data parsing
- No duplicate detection
- No bulk import capability

## Problem Frame

### Track A: AIMAN Chatbot Limitations
The current AIMAN chatbot is a basic Q&A system that:
- Lacks conversation context awareness
- Provides no interactive decision-making UI (no quick-reply buttons)
- Has no visual feedback during AI processing
- Lacks accessibility features for screen readers
- Does not provide step-aware contextual assistance
- Shows raw markdown formatting instead of clean text

### Track B: Accounting Module Gaps
Professional accountant review revealed:
- Documented features (bank_accounts, accounting_entries) don't exist in database
- Security vulnerabilities: anon role used instead of authenticated
- Missing RLS policies for new tables
- No separation of duties (creator can approve own entries)
- No dual-signature requirements for large amounts
- No proper audit trail with IP tracking
- Missing double-entry bookkeeping implementation
- No financial statement generation (P&L, balance sheet)
- No bank reconciliation workflow
- Emoji icons violate professional standards

### Track C: Bank Statement Processing Deficiencies
Current implementation:
- Only stores file as attachment
- Requires manual data entry for all transaction details
- No intelligent extraction of transaction data
- No duplicate detection to prevent re-import
- No bulk import capability for multi-transaction statements
- No validation of statement integrity

## Requirements

### Track A: AIMAN Chatbot Requirements
- **REQ-A001**: Implement conversation history context object
- **REQ-A002**: Add step-aware system prompt generation
- **REQ-A003**: Implement quick-reply buttons (Ya/Tidak) for decision tree
- **REQ-A004**: Add animated typing indicator (bouncing dots)
- **REQ-A005**: Implement smooth open/close animations (slide-up/fade-out)
- **REQ-A006**: Add step-aware greeting with suggestion chips
- **REQ-A007**: Strip markdown formatting from AI responses
- **REQ-A008**: Add ARIA accessibility attributes (aria-live, aria-expanded)
- **REQ-A009**: Polish toggle button with two-line label and "Mulakan Semula" button

### Track B: Accounting Module Requirements
- **REQ-B001**: Create bank_accounts table with proper schema and RLS
- **REQ-B002**: Create accounting_entries table with proper schema and RLS
- **REQ-B003**: Implement role-based RLS policies (replace anon with authenticated)
- **REQ-B004**: Add separation of duties (creator cannot approve own entries)
- **REQ-B005**: Implement dual-signature requirement for amounts > RM 10,000
- **REQ-B006**: Add IP address tracking in approval_history
- **REQ-B007**: Implement double-entry bookkeeping with chart_of_accounts
- **REQ-B008**: Add journal_entries and journal_entry_lines tables
- **REQ-B009**: Implement auto-posting function for approved entries
- **REQ-B010**: Create P&L statement generation function
- **REQ-B011**: Create balance sheet generation function
- **REQ-B012**: Add CSV export for accounting entries
- **REQ-B013**: Implement bank reconciliation workflow
- **REQ-B014**: Remove all emoji icons from codebase
- **REQ-B015**: Enable RLS on dpmm_templates table
- **REQ-B016**: Consolidate accounting tabs - merge Receipts and Payment Vouchers into single "Perakaunan" tab to reduce side panel clutter

### Track C: Bank Statement OCR Requirements
- **REQ-C001**: Implement OCR extraction using OpenRouter vision model
- **REQ-C002**: Extract transaction lines (date, description, amount, reference)
- **REQ-C003**: Handle multi-page PDF statements
- **REQ-C004**: Implement duplicate detection against existing entries
- **REQ-C005**: Add bulk import capability (create multiple entries from one statement)
- **REQ-C006**: Implement smart categorization based on description keywords
- **REQ-C007**: Add validation and quality checks (balance verification, suspicious amounts)

## Key Technical Decisions

### KTD-001: OpenRouter Vision Model for OCR
**Decision**: Use OpenRouter `qwen/qwen3-vl-235b-a22b-instruct` for bank statement OCR extraction
**Rationale**: 
- Already migrated to OpenRouter in July 2026 for AIMAN chatbot
- Vision model supports multi-page PDF processing
- Consistent with existing AI infrastructure
- Avoids additional API key management

### KTD-002: Context Storage for AIMAN
**Decision**: Store conversation context in browser sessionStorage with 10-message limit
**Rationale**:
- No database changes required
- Session-scoped context appropriate for chatbot
- 10-message limit balances context richness with performance
- Privacy-preserving (not persisted to server)

### KTD-003: Double-Entry Bookkeeping Implementation
**Decision**: Implement auto-posting via PostgreSQL trigger on approval_status change
**Rationale**:
- Ensures data integrity at database level
- Automatic journal entry creation when accounting_entries approved
- Maps income categories to chart_of_accounts via configuration table
- Centralizes accounting logic in database

### KTD-004: Bank Statement Duplicate Detection
**Decision**: Check against existing accounting_entries using date + amount + reference combination
**Rationale**:
- Simple but effective heuristic
- Prevents re-import of same transaction
- Allows manual override if needed
- Performance: indexed query on date and amount

### KTD-005: Separation of Duties Enforcement
**Decision**: Implement at both application level (accounting-ui.js validation) and database level (PostgreSQL trigger)
**Rationale**:
- Defense-in-depth approach
- Application layer provides immediate user feedback
- Database layer enforces rule even if bypassed
- Audit trail captures enforcement attempts

## Scope Boundaries

### In Scope
- AIMAN chatbot UI enhancements (animations, quick-reply, accessibility)
- Accounting module database schema completion
- Bank statement OCR extraction and bulk import
- Security enhancements (RLS policies, separation of duties)
- Financial reporting (P&L, balance sheet, CSV export)
- Emoji icon removal from codebase
- Documentation updates to reflect current state

### Out of Scope
- Complete rewrite of AIMAN chatbot backend
- Migration to different AI provider (staying with OpenRouter)
- Multi-currency support (MYR only)
- Advanced financial analytics beyond basic reports
- Integration with external accounting software
- Mobile app development
- Real-time collaboration features

### Deferred to Follow-Up Work
- Advanced AI features (sentiment analysis, intent classification)
- Automated fraud detection algorithms
- Machine learning-based categorization
- API integrations with banking systems
- Advanced reconciliation matching algorithms

## Implementation Units

### Track A: AIMAN Chatbot Enhancement

### U1. Conversation Context System
**Goal**: Implement conversation history context for AIMAN chatbot
**Requirements**: REQ-A001, REQ-A002
**Dependencies**: None
**Files**: 
- `index.html` (AIMAN chatbot section)
- `accounting-ui.js` (if chatbot integrated there)
**Approach**: 
- Create context object storing last 10 messages
- Implement step-aware system prompt generation based on current form step
- Add context to OpenRouter API calls
**Patterns to follow**: Existing OpenRouter integration pattern
**Test scenarios**:
- Happy path: Context persists across 10 messages
- Edge case: Context cleared after 10 messages (FIFO)
- Edge case: Context cleared on "Mulakan Semula"
- Integration: Context included in API request body
**Verification**: Manual testing of conversation continuity

### U2. Quick-Reply Buttons
**Goal**: Add Ya/Tidak quick-reply buttons for decision tree
**Requirements**: REQ-A003
**Dependencies**: U1
**Files**: `index.html`
**Approach**:
- Add button UI below chat response
- Implement click handlers that send predefined responses
- Style with existing CSS variables
**Patterns to follow**: Existing button patterns in borang.html
**Test scenarios**:
- Happy path: Clicking "Ya" sends affirmative response
- Happy path: Clicking "Tidak" sends negative response
- Edge case: Buttons disabled during AI processing
- Integration: Button click triggers next step in decision tree
**Verification**: Manual testing of decision tree flow

### U3. Animated Typing Indicator
**Goal**: Add bouncing dots animation during AI processing
**Requirements**: REQ-A004
**Dependencies**: None
**Files**: `index.html`
**Approach**:
- Create CSS animation for bouncing dots
- Show indicator before API call, hide after response
- Position below chat input
**Patterns to follow**: Existing animation patterns in borang.html
**Test scenarios**:
- Happy path: Indicator shows when user sends message
- Happy path: Indicator hides when AI response received
- Edge case: Indicator hides on API error
- Integration: Indicator timing matches API call duration
**Verification**: Visual inspection of animation timing

### U4. Smooth Open/Close Animations
**Goal**: Implement slide-up/fade-out transitions for chat widget
**Requirements**: REQ-A005
**Dependencies**: None
**Files**: `index.html`
**Approach**:
- Add CSS transitions for transform and opacity
- Apply to chat widget container
- Trigger on toggle button click
**Patterns to follow**: Existing modal animation patterns
**Test scenarios**:
- Happy path: Smooth slide-up on open
- Happy path: Smooth fade-out on close
- Edge case: Animation completes before state change
- Integration: Animation doesn't interfere with functionality
**Verification**: Visual inspection of smoothness

### U5. Step-Aware Greeting
**Goal**: Add contextual greetings per form step with suggestion chips
**Requirements**: REQ-A006
**Dependencies**: U1
**Files**: `index.html`
**Approach**:
- Map form steps to greeting messages
- Add suggestion chips for common actions
- Update greeting based on current step
**Patterns to follow**: Existing form step detection logic
**Test scenarios**:
- Happy path: Greeting changes when form step changes
- Happy path: Suggestion chips trigger relevant actions
- Edge case: Default greeting when step unknown
- Integration: Greeting context matches actual form state
**Verification**: Manual testing across form steps

### U6. Markdown Stripping
**Goal**: Clean up AI response formatting
**Requirements**: REQ-A007
**Dependencies**: None
**Files**: `index.html`
**Approach**:
- Add markdown parsing library (marked.js or similar)
- Strip formatting characters from responses
- Preserve line breaks and basic structure
**Patterns to follow**: Existing text processing patterns
**Test scenarios**:
- Happy path: Bold/italic markers removed
- Happy path: Line breaks preserved
- Edge case: Code blocks handled gracefully
- Integration: Stripped text remains readable
**Verification**: Visual inspection of response cleanliness

### U7. ARIA Accessibility
**Goal**: Add screen reader support
**Requirements**: REQ-A008
**Dependencies**: U2, U3, U4
**Files**: `index.html`
**Approach**:
- Add aria-live to chat message container
- Add aria-expanded to toggle button
- Add aria-labels to all interactive elements
**Patterns to follow**: WAI-ARIA best practices
**Test scenarios**:
- Happy path: Screen reader announces new messages
- Happy path: Screen reader announces widget state
- Edge case: ARIA attributes update dynamically
- Integration: Keyboard navigation works with ARIA
**Verification**: Screen reader testing (NVDA/JAWS)

### U8. Toggle Button Polish
**Goal**: Improve toggle button with two-line label and reset button
**Requirements**: REQ-A009
**Dependencies**: U4
**Files**: `index.html`
**Approach**:
- Update button text to two-line format
- Add "Mulakan Semula" button for context reset
- Style with existing design system
**Patterns to follow**: Existing button styling patterns
**Test scenarios**:
- Happy path: Two-line label displays correctly
- Happy path: Reset button clears context
- Edge case: Reset button disabled when no context
- Integration: Reset triggers context clearing
**Verification**: Visual inspection and manual testing

### Track B: Accounting Module Overhaul

### U9. Bank Accounts Table Creation
**Goal**: Create bank_accounts table with proper schema and RLS
**Requirements**: REQ-B001
**Dependencies**: None
**Files**: 
- `supabase/migrations/accounting-bank-accounts.sql` (new)
**Approach**:
- Create table with columns: id, bank_name, account_number, account_type, balance, is_primary, created_at, updated_at
- Add CHECK constraint for account_type values
- Add UNIQUE constraint for is_primary = true
- Create RLS policies for authenticated role
- Add indexes on bank_name, account_number
**Patterns to follow**: Existing table creation patterns in receipt-pv-system-phase1.sql
**Test scenarios**:
- Happy path: Table created with all constraints
- Happy path: RLS policies enforce authenticated access
- Edge case: Only one primary account allowed
- Integration: Foreign key to accounting_entries works
**Verification**: Supabase table inspection and RLS policy testing

### U10. Accounting Entries Table Creation
**Goal**: Create accounting_entries table with proper schema and RLS
**Requirements**: REQ-B002
**Dependencies**: U9
**Files**: 
- `supabase/migrations/accounting-entries-table.sql` (new)
**Approach**:
- Create table with columns: id, entry_number, entry_date, income_category, income_subcategory, amount, member_id, member_name, description, property_name, custom_description, bank_account_id, payment_method, reference_number, supporting_document_url, approval_status, created_by, created_at, updated_at
- Add CHECK constraint for income_category values
- Add UNIQUE constraint on entry_number
- Create RLS policies for authenticated role
- Add indexes on entry_date, approval_status, member_id
- Add foreign key to AHLI DPMM JOHOR.id
**Patterns to follow**: Existing receipts table schema
**Test scenarios**:
- Happy path: Table created with all constraints
- Happy path: Foreign key constraint enforced
- Edge case: Duplicate entry_number rejected
- Integration: Works with approval workflow
**Verification**: Supabase table inspection and constraint testing

### U11. RLS Policy Migration
**Goal**: Replace anon role with authenticated in all accounting tables
**Requirements**: REQ-B003
**Dependencies**: U9, U10
**Files**: 
- `supabase/migrations/accounting-rls-migration.sql` (new)
**Approach**:
- Update RLS policies on cash_accounts, bank_accounts, accounting_entries
- Replace anon role with authenticated
- Add role-based policies (admin, bendahari, ajk)
- Test policy permissions
**Patterns to follow**: Existing RLS policy patterns
**Test scenarios**:
- Happy path: Authenticated users can read/write
- Happy path: Unauthenticated users denied access
- Edge case: Role-based permissions enforced
- Integration: Existing functionality not broken
**Verification**: RLS policy testing with different roles

### U12. Separation of Duties Implementation
**Goal**: Prevent creator from approving own entries
**Requirements**: REQ-B004
**Dependencies**: U10, U11
**Files**: 
- `accounting-ui.js`
- `supabase/migrations/separation-of-duties-trigger.sql` (new)
**Approach**:
- Add application-level validation in accounting-ui.js
- Add PostgreSQL trigger to check approval_history
- Block approval if created_by = approving_user
- Log enforcement attempts
**Patterns to follow**: Existing approval workflow logic
**Test scenarios**:
- Happy path: Creator cannot approve own entry
- Happy path: Different user can approve
- Edge case: Admin override capability
- Integration: Enforcement logged in audit trail
**Verification**: Manual testing with different user accounts

### U13. Dual-Signature Requirement
**Goal**: Require two approvals for amounts > RM 10,000
**Requirements**: REQ-B005
**Dependencies**: U12
**Files**: 
- `accounting-ui.js`
- `supabase/migrations/dual-signature-trigger.sql` (new)
**Approach**:
- Check approval_history count before final approval
- Require at least 2 distinct approvers for amounts > RM 10,000
- Add UI indicator for dual-signature status
**Patterns to follow**: Existing approval chain logic
**Test scenarios**:
- Happy path: Amount <= RM 10,000 requires 1 approval
- Happy path: Amount > RM 10,000 requires 2 approvals
- Edge case: Same approver counted once
- Integration: UI shows dual-signature requirement
**Verification**: Manual testing with different amount thresholds

### U14. IP Address Tracking
**Goal**: Add IP address to approval_history
**Requirements**: REQ-B006
**Dependencies**: U10
**Files**: 
- `supabase/migrations/approval-history-enhancement.sql` (new)
- `accounting-ui.js`
**Approach**:
- Add ip_address column to approval_history
- Capture client IP on approval action
- Store in approval_history record
**Patterns to follow**: Existing audit logging patterns
**Test scenarios**:
- Happy path: IP address captured on approval
- Happy path: IP address displayed in audit trail
- Edge case: IP unavailable (localhost)
- Integration: IP tracking doesn't break approval flow
**Verification**: Manual inspection of approval_history records

### U15. Double-Entry Bookkeeping Setup
**Goal**: Implement chart_of_accounts and journal entry tables
**Requirements**: REQ-B007, REQ-B008
**Dependencies**: U10
**Files**: 
- `supabase/migrations/chart-of-accounts.sql` (new)
- `supabase/migrations/journal-entries-table.sql` (new)
**Approach**:
- Create chart_of_accounts with account codes and types
- Create journal_entries header table
- Create journal_entry_lines table for multi-line entries
- Add CHECK constraint for account_type
- Create RLS policies for all tables
**Patterns to follow**: Standard accounting schema patterns
**Test scenarios**:
- Happy path: Tables created with proper relationships
- Happy path: Account types enforced
- Edge case: Debit = credit validation
- Integration: Foreign key constraints work
**Verification**: Database schema inspection

### U16. Auto-Posting Function
**Goal**: Automatically create journal entries when accounting_entries approved
**Requirements**: REQ-B009
**Dependencies**: U15
**Files**: 
- `supabase/migrations/auto-posting-trigger.sql` (new)
**Approach**:
- Create PostgreSQL trigger on approval_status change
- Map income categories to chart_of_accounts
- Generate journal entry header and lines
- Handle errors gracefully
**Patterns to follow**: Existing trigger patterns
**Test scenarios**:
- Happy path: Approval creates journal entry
- Happy path: Debit/credit balanced
- Edge case: Mapping not found (default account)
- Integration: Journal entry linked to accounting entry
**Verification**: Manual approval and journal entry inspection

### U17. Financial Statement Generation
**Goal**: Create P&L and balance sheet generation functions
**Requirements**: REQ-B010, REQ-B011
**Dependencies**: U16
**Files**: 
- `supabase/migrations/financial-statements-functions.sql` (new)
- `accounting-ui.js`
**Approach**:
- Create SQL function for P&L statement
- Create SQL function for balance sheet
- Add UI to display statements
- Add date range filtering
**Patterns to follow**: Existing reporting patterns
**Test scenarios**:
- Happy path: P&L generated correctly
- Happy path: Balance sheet balances
- Edge case: No data in date range
- Integration: Statements match journal entries
**Verification**: Manual generation and calculation verification

### U18. CSV Export
**Goal**: Add CSV export for accounting entries
**Requirements**: REQ-B012
**Dependencies**: U10
**Files**: 
- `accounting-ui.js`
**Approach**:
- Implement CSV generation in JavaScript
- Add export button to entries list
- Include all relevant fields
- Handle date range filtering
**Patterns to follow**: Existing CSV export patterns (if any)
**Test scenarios**:
- Happy path: CSV downloads with correct data
- Happy path: Date range filtering applied
- Edge case: No data in range
- Integration: CSV format matches expectations
**Verification**: Manual export and file inspection

### U19. Bank Reconciliation Workflow
**Goal**: Implement bank statement reconciliation
**Requirements**: REQ-B013
**Dependencies**: U9, U10
**Files**: 
- `supabase/migrations/bank-reconciliation-table.sql` (new)
- `accounting-ui.js`
**Approach**:
- Create bank_reconciliation table
- Implement matching logic
- Add unreconciled items flagging
- Create reconciliation report
**Patterns to follow**: Existing reconciliation patterns
**Test scenarios**:
- Happy path: Transactions matched automatically
- Happy path: Unreconciled items flagged
- Edge case: No matches found
- Integration: Reconciliation report accurate
**Verification**: Manual reconciliation testing

### U20. Emoji Icon Removal
**Goal**: Remove all emoji icons from codebase
**Requirements**: REQ-B014
**Dependencies**: None
**Files**: 
- `accounting-ui.js`
- `receipt-pv-ui.js`
- `index.html`
- `docs/ACCOUNTING-USER-GUIDE.md`
**Approach**:
- Search for emoji characters in all files
- Replace with text labels or remove
- Verify no emojis remain
**Patterns to follow**: Professional documentation standards
**Test scenarios**:
- Happy path: All emojis removed from code
- Happy path: All emojis removed from docs
- Edge case: Unicode characters handled
- Integration: UI still functional without emojis
**Verification**: Grep search for emoji characters

### U21. RLS Security Fix
**Goal**: Enable RLS on dpmm_templates table
**Requirements**: REQ-B015
**Dependencies**: None
**Files**: 
- `supabase/migrations/dpmm-templates-rls-fix.sql` (new)
**Approach**:
- Enable RLS on dpmm_templates table
- Add appropriate policies
- Test access control
**Patterns to follow**: Existing RLS policy patterns
**Test scenarios**:
- Happy path: RLS enabled
- Happy path: Policies enforce access
- Edge case: Existing functionality not broken
- Integration: Templates still accessible to authorized users
**Verification**: RLS policy testing

### U22. Accounting Tab Consolidation
**Goal**: Merge Receipts and Payment Vouchers into single "Perakaunan" tab
**Requirements**: REQ-B016
**Dependencies**: None
**Files**: 
- `index.html`
- `accounting-ui.js`
**Approach**:
- Remove separate "Resit" and "Payment Voucher" tabs from side panel
- Create single "Perakaunan" tab with sub-navigation or toggle between Receipts/Vouchers
- Update tab switching logic to handle consolidated view
- Maintain all existing functionality (create, view, edit receipts and vouchers)
**Patterns to follow**: Existing tab consolidation patterns
**Test scenarios**:
- Happy path: Single "Perakaunan" tab displays correctly
- Happy path: Sub-navigation allows switching between Receipts and Vouchers
- Happy path: All receipt functionality preserved
- Happy path: All voucher functionality preserved
- Edge case: Tab state persists across navigation
- Integration: Side panel clutter reduced, user experience improved
**Verification**: Manual testing of consolidated tab functionality

### Track C: Bank Statement OCR Integration

### U23. OCR Extraction Function
**Goal**: Implement OCR extraction using OpenRouter vision model
**Requirements**: REQ-C001, REQ-C002
**Dependencies**: None
**Files**: 
- `accounting-ui.js`
**Approach**:
- Add OCR function using OpenRouter vision API
- Parse transaction lines from PDF
- Extract date, description, amount, reference
- Handle multi-page PDFs
**Patterns to follow**: Existing OCR pattern in receipt-pv-ui.js
**Test scenarios**:
- Happy path: Single-page PDF extracted correctly
- Happy path: Multi-page PDF merged correctly
- Edge case: PDF parsing fails
- Edge case: No transactions found
- Integration: Extracted data format matches schema
**Verification**: Manual testing with sample bank statements

### U24. Duplicate Detection
**Goal**: Prevent re-import of duplicate transactions
**Requirements**: REQ-C004
**Dependencies**: U10, U23
**Files**: 
- `accounting-ui.js`
**Approach**:
- Check existing accounting_entries by date + amount + reference
- Flag potential duplicates
- Allow manual override
- Add warning UI
**Patterns to follow**: Existing duplicate detection patterns
**Test scenarios**:
- Happy path: Duplicate detected and flagged
- Happy path: Unique transaction allowed
- Edge case: Similar but not duplicate
- Integration: User can override warning
**Verification**: Manual testing with duplicate data

### U25. Bulk Import
**Goal**: Create multiple entries from one statement
**Requirements**: REQ-C005
**Dependencies**: U23, U24
**Files**: 
- `accounting-ui.js`
**Approach**:
- Loop through extracted transactions
- Create accounting_entries for each
- Use batch insert for efficiency
- Show progress indicator
**Patterns to follow**: Existing batch operation patterns
**Test scenarios**:
- Happy path: All transactions imported
- Happy path: Progress indicator updates
- Edge case: Partial import on error
- Edge case: No transactions extracted
- Integration: All entries linked to statement
**Verification**: Manual testing with multi-transaction statement

### U26. Smart Categorization
**Goal**: Suggest income categories based on description keywords
**Requirements**: REQ-C006
**Dependencies**: U23
**Files**: 
- `accounting-ui.js`
**Approach**:
- Create keyword-to-category mapping
- Match description against keywords
- Pre-fill category field
- Allow manual override
**Patterns to follow**: Existing categorization patterns
**Test scenarios**:
- Happy path: Category suggested based on keyword
- Happy path: Manual override allowed
- Edge case: No keyword match
- Edge case: Multiple keyword matches
- Integration: Suggestion accuracy acceptable
**Verification**: Manual testing with various descriptions

### U27. Validation and Quality Checks
**Goal**: Add statement validation and quality checks
**Requirements**: REQ-C007
**Dependencies**: U22
**Files**: 
- `accounting-ui.js`
**Approach**:
- Verify statement balance (credits = debits)
- Flag suspicious amounts (thresholds)
- Validate date ranges
- Add quality score
**Patterns to follow**: Existing validation patterns
**Test scenarios**:
- Happy path: Balanced statement passes validation
- Happy path: Suspicious amount flagged
- Edge case: Unbalanced statement rejected
- Edge case: Date range validation
- Integration: Quality score displayed to user
**Verification**: Manual testing with various statement types

### U28. UI Integration
**Goal**: Integrate OCR features into accounting UI
**Requirements**: REQ-C001 through REQ-C007
**Dependencies**: U23, U24, U25, U26, U27
**Files**: 
- `accounting-ui.js`
- `index.html`
**Approach**:
- Add OCR button to bank statement upload
- Show extracted data for review
- Add bulk import confirmation
- Add duplicate warning UI
- Add quality check display
**Patterns to follow**: Existing UI patterns
**Test scenarios**:
- Happy path: OCR button triggers extraction
- Happy path: Extracted data displayed for review
- Happy path: Bulk import confirmed
- Edge case: OCR error handling
- Integration: UI flows smoothly
**Verification**: Manual end-to-end testing

### U29. Documentation Updates
**Goal**: Update all documentation to reflect current state
**Requirements**: All documentation requirements
**Dependencies**: All implementation units
**Files**: 
- `docs/ACCOUNTING-USER-GUIDE.md`
- `plan/accounting-module-overhaul-implementation-plan.md`
- `README.md`
**Approach**:
- Update status sections with actual implementation state
- Add disclaimers for not-yet-implemented features
- Update technical reference with new schemas
- Add migration guide
**Patterns to follow**: Existing documentation patterns
**Test scenarios**:
- Happy path: Documentation matches code
- Happy path: Status accurately reflected
- Edge case: Feature documented but not implemented
- Integration: Documentation helpful to users
**Verification**: Manual review of documentation

## Risks & Dependencies

### Risks
- **RISK-001**: Database migrations may fail if existing data conflicts with new constraints
  - Mitigation: Create data migration scripts to handle conflicts before applying constraints
- **RISK-002**: RLS policy changes may break existing functionality
  - Mitigation: Test thoroughly in staging environment before production deployment
- **RISK-003**: OCR extraction accuracy may vary across bank statement formats
  - Mitigation: Start with manual review before auto-import, add format-specific parsers incrementally
- **RISK-004**: OpenRouter API rate limits may affect chatbot responsiveness
  - Mitigation: Implement caching for common queries, add retry logic
- **RISK-005**: Performance impact from additional tables and indexes
  - Mitigation: Monitor query performance, add indexes as needed

### Dependencies
- **DEP-001**: Supabase project lzoloupwtqmjyupvofhh must be accessible
- **DEP-002**: OpenRouter API key must be configured in Supabase Edge Functions
- **DEP-003**: Existing member table "AHLI DPMM JOHOR" must remain unchanged
- **DEP-004**: Existing authentication system must continue working
- **DEP-005**: Existing receipts and vouchers tables must remain functional

## Testing Strategy

### Track A Testing
- Manual testing of chatbot UI enhancements
- Screen reader testing for accessibility
- Cross-browser testing for animations
- Conversation context persistence testing

### Track B Testing
- Database migration testing with sample data
- RLS policy testing with different roles
- Approval workflow testing with separation of duties
- Financial statement calculation verification
- CSV export format validation

### Track C Testing
- OCR extraction accuracy testing with sample bank statements
- Duplicate detection testing
- Bulk import performance testing
- Validation and quality check testing
- End-to-end workflow testing

## Success Metrics

- **AIMAN Chatbot**: All 8 enhancement tasks completed and tested
- **Accounting Module**: All 10 phases completed, database schema matches documentation
- **Bank Statement OCR**: OCR extraction working with 80%+ accuracy on sample statements
- **Security**: All RLS policies enabled, anon role replaced with authenticated
- **Documentation**: All documentation updated to reflect current state
- **Testing**: All test scenarios passing

## Related Documents

- [plan/accounting-module-overhaul-implementation-plan.md](../plan/accounting-module-overhaul-implementation-plan.md) - Original accounting overhaul plan
- [docs/ACCOUNTING-USER-GUIDE.md](../ACCOUNTING-USER-GUIDE.md) - User guide (to be updated)
- [docs/plans/2026-06-02-chatbot-personal-assistant.md](../plans/2026-06-02-chatbot-personal-assistant.md) - Original AIMAN upgrade plan
- [README.md](../README.md) - Project README (to be updated)
