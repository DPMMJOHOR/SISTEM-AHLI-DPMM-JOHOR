# User Journey: Accounting Module

## User Persona
- **Who**: Bendahari (Treasurer) of DPMM Negeri Johor
- **Goal**: Record, track, and approve income records; generate financial reports; reconcile accounts
- **Context**: Office environment, desktop computer, regular business hours
- **Success Metric**: Complete income recording in under 2 minutes, generate reports in under 5 minutes

## Journey Stages

### Stage 1: Dashboard Overview
**What user is doing**: Logging into the system and viewing the accounting dashboard

**What user is thinking**: "What's the current financial status? Do I have pending approvals? Are balances accurate?"

**What user is feeling**: Informed, in control, ready to take action

**Pain points**:
- KPI cards don't show trend information (up/down arrows)
- No quick access to recent activity
- Cannot see what needs immediate attention

**Opportunity**: 
- Add trend indicators to KPI cards (month-over-month comparison)
- Add "Recent Activity" section showing last 5 transactions
- Add "Needs Attention" section for pending approvals

### Stage 2: Recording Income
**What user is doing**: Creating a new income record from membership fees, donations, or other sources

**What user is thinking**: "I need to record this payment accurately. Which category does it belong to? Which bank account received it?"

**What user is feeling**: Focused, careful about accuracy

**Pain points**:
- Form is long and requires scrolling
- Not clear which fields are required vs optional
- Category selection doesn't explain what each category means
- No inline help for unfamiliar terms
- File upload has no progress indicator

**Opportunity**:
- Implement progressive disclosure (show only relevant fields based on category)
- Add required field indicators (asterisk)
- Add tooltips explaining each category
- Add inline help text below key fields
- Add upload progress bar and success confirmation

### Stage 3: Approval Workflow
**What user is doing**: Reviewing pending income records and approving or rejecting them

**What user is thinking**: "Is this information accurate? Do I have enough context to approve? Should I reject and ask for more info?"

**What user is feeling**: Cautious, responsible, needing confidence

**Pain points**:
- Approval modal doesn't show supporting documents inline
- No access to member details from approval screen
- Cannot see previous approval history clearly
- Rejection reason is required but no guidance on what to write
- No indication of spending limits or thresholds

**Opportunity**:
- Embed document viewer in approval modal
- Add link to member detail modal
- Show approval history as timeline
- Provide rejection reason templates
- Show spending limit warnings for large amounts

### Stage 4: Bank Account Management
**What user is doing**: Adding or editing bank account information

**What user is thinking**: "I need to add this new bank account. Should it be the main account? What's the current balance?"

**What user is feeling**: Administrative, methodical

**Pain points**:
- No indication of which account is currently main
- Balance field is manual entry (no auto-calculation from transactions)
- No way to deactivate accounts without deleting
- No audit trail for balance changes

**Opportunity**:
- Clearly mark main account with visual indicator
- Add "Calculate from transactions" button
- Add is_active toggle instead of delete
- Show balance change history

### Stage 5: Cash Account Management
**What user is doing**: Managing petty cash, safe, and other cash accounts

**What user is thinking**: "How much cash is in the safe? Who is responsible? When was it last counted?"

**What user is feeling**: Concerned about accuracy and security

**Pain points**:
- No transaction history for cash movements
- No reconciliation workflow
- Balance is manual entry (not calculated from transactions)
- No physical count verification process
- No indication of last reconciliation date

**Opportunity**:
- Add transaction history table
- Implement cash count verification form
- Auto-calculate balance from transactions
- Add reconciliation workflow with status tracking
- Show last reconciliation date prominently

### Stage 6: Report Generation
**What user is doing**: Generating financial reports for board meetings or audits

**What user is thinking**: "I need a report for last month. Which format should I use? Does it include all the data I need?"

**What user is feeling**: Pressured for time, needing accuracy

**Pain points**:
- No date range filtering (only month/year dropdowns)
- Limited to CSV export (no PDF option)
- No summary statistics in reports
- Cannot customize which columns to include
- No preview before download

**Opportunity**:
- Add full date range picker
- Add PDF export option
- Add summary section with totals and averages
- Add column selection checkboxes
- Add report preview modal

### Stage 7: Bank Reconciliation
**What user is doing**: Matching bank statement transactions with recorded income

**What user is thinking**: "Which of these transactions match? Are there any missing entries? Are there any discrepancies?"

**What user is feeling**: Analytical, detail-oriented

**Pain points**:
- No bank statement import (manual entry only)
- No auto-matching of transactions
- No flagging of unreconciled items
- No variance calculation
- No reconciliation report generation

**Opportunity**:
- Add bank statement import (CSV/PDF parsing)
- Implement auto-matching algorithm
- Add manual match/override capability
- Calculate and display variances
- Generate reconciliation report

### Stage 8: Outcome
**What user is doing**: Completing accounting tasks and reviewing results

**What user is thinking**: "I've recorded everything. The reports look good. I'm confident the financial records are accurate."

**What user is feeling**: Confident, productive, satisfied

**Success metrics**:
- Income recording time: <2 minutes per entry
- Approval time: <1 minute per record
- Report generation: <5 minutes
- Bank reconciliation: <30 minutes
- Data entry errors: <5%
- User satisfaction: 4+ out of 5

## Emotional Journey Map

```
High Control/Confidence
    ^
    |        Dashboard (Informed)
    |          /
    |         /
    |        /        Approval (Cautious)
    |       /          /
    |      /          /
    |     /          /
    |    /          /
    |   /          /
    |  /          /
    | /          /
    |/          /
    +----------+---------> Time
 Recording  Reconciliation
 (Focused)   (Analytical)
```

## Key Friction Points

1. **Form Complexity**: Long forms with many fields cause cognitive load
   - Solution: Progressive disclosure, smart defaults, inline help

2. **Lack of Context**: Approval modal doesn't provide enough information
   - Solution: Embedded documents, member links, history timeline

3. **Manual Processes**: Balance entry, reconciliation are manual
   - Solution: Auto-calculation, import tools, matching algorithms

4. **Limited Reporting**: No date ranges, limited export options
   - Solution: Full date picker, multiple formats, column selection

5. **No Visibility**: Can't see what needs attention
   - Solution: Dashboard alerts, activity feed, status indicators
