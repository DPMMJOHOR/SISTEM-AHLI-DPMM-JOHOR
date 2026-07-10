# Automated Tracking

## GitHub Issues Setup

### Issue Template
Each implementation unit (U0-U15) has a corresponding GitHub Issue with:
- **Title**: "[U#] Task Name" (e.g., "[U0] Review Existing Documentation")
- **Labels**: `documentation`, `design`, or `orchestration`
- **Assignee**: AI agent (automated)
- **Milestone**: Sprint 1, Sprint 2, etc.
- **Description**: Task brief from plan

### Issue States
- **Open**: Task not started
- **In Progress**: Agent working on task
- **Closed**: Task completed and reviewed

## Progress Reporting

### Automated Progress Updates
When an agent completes a task:
1. Agent writes report to `.superpowers/sdd/[task]-report.md`
2. Controller updates progress ledger `.superpowers/sdd/progress.md`
3. GitHub Issue status updated to "Closed"
4. Commit message includes task reference (e.g., "U14: establish agent coordination")

### Progress Ledger Format
```markdown
# Sprint 1 Progress Ledger

**Sprint**: Sprint 1 (Week 1-2)
**Branch**: feature/sprint-1
**Base Commit**: 913d13d

## Task Completion Log

- U14: complete (commits <base>..<head>, review clean)
- U0: 
- U1:
- U9:
- U10:
```

## Milestone Tracking

### Sprint Milestones
- **Sprint 1**: U0, U1, U9, U10, U14 (Week 1-2)
- **Sprint 2**: U2, U11, U12 (Week 3-4)
- **Sprint 3**: U3, U4, U13 (Week 5)
- **Sprint 4**: U5, U6, U7 (Week 6)
- **Sprint 5**: U8, U15 (Week 7-8)

### Milestone Completion Criteria
- All tasks in milestone completed
- All reviews passed (spec compliance + code quality)
- Human review checkpoint passed (if applicable)
- No blocking issues

## Automated Reporting

### Daily Progress Report
Generated automatically from progress ledger:
- Tasks completed today
- Tasks in progress
- Tasks blocked
- Overall sprint progress percentage

### Weekly Progress Report
Generated at end of each week:
- Sprint progress summary
- Tasks completed this week
- Tasks planned for next week
- Blockers and risks
- Human review checkpoint status

## Integration with GitHub Actions

### Issue Automation
- GitHub Actions workflow triggers on commit
- Parses commit message for task reference (e.g., "U14:")
- Updates corresponding GitHub Issue status
- Adds comment to Issue with commit SHA and message

### Progress Dashboard
- GitHub Project board shows sprint progress
- Columns: To Do, In Progress, Review, Done
- Cards represent implementation units (U0-U15)
- Automated movement based on task status

## Monitoring and Alerts

### Blocker Alerts
When an agent reports BLOCKED:
- Immediate notification to controller
- GitHub Issue labeled with `blocker`
- Progress ledger updated with blocker details
- Human intervention required

### Quality Gate Alerts
When reviewer finds Critical/Important issues:
- GitHub Issue labeled with `needs-fix`
- Progress ledger updated with quality issues
- Fix subagent dispatched automatically
- Re-review triggered after fix

## Rollback Tracking

### Rollback Scenarios
- **Documentation**: Git revert if user manuals have critical errors
- **Design**: CSS backups maintained, revert to original colors if issues arise
- **Coordination**: Revert to previous tracking process if automated tracking fails

### Rollback Procedure
1. Identify commit before rollback point
2. Create rollback branch
3. Revert changes
4. Update progress ledger with rollback note
5. Notify human of rollback

## Audit Trail

### Commit History
All commits include:
- Task reference (e.g., "U14:")
- Descriptive commit message
- Reference to task brief
- Test results in commit body

### Review History
All reviews include:
- Task brief reference
- Report file reference
- Review package reference
- Review verdict (spec compliance + code quality)
- Findings and resolutions

## Recovery Procedures

### After Context Loss
If controller context is lost:
1. Read progress ledger `.superpowers/sdd/progress.md`
2. Verify commits listed in ledger exist via `git log`
3. Resume at first task not marked complete
4. Re-dispatch from that task forward

### After Git Clean
If `git clean -fdx` destroys ledger:
1. Recover from `git log` commit messages
2. Reconstruct progress ledger from commit history
3. Verify task completion status
4. Resume execution
