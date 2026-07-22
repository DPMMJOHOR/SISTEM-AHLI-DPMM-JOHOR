# TDD Verification Protocol — SISTEM-AHLI-DPMM-JOHOR

**Project:** SISTEM-AHLI-DPMM-JOHOR  
**Version:** 1.0  
**Date:** 2026-07-22

---

## Overview

This protocol defines the Test-Driven Development (TDD) red-green verification process for confirmed bugs in the SISTEM-AHLI-DPMM-JOHOR project. Each confirmed bug must have a regression test that fails on the buggy code and passes after the fix.

---

## TDD Process

### Red Phase (Before Fix)

**Purpose:** Verify the bug is real by creating a failing test

**Procedure:**
1. Read the bug report in BUGS.md
2. Identify the file:line where the bug occurs
3. Write a regression test that:
   - Reproduces the bug condition
   - Fails on the current (buggy) code
   - Will pass when the bug is fixed
4. Run the test and verify it fails
5. Save the test output as `quality/results/BUG-NNN.red.log`

**Test Template:**
```javascript
// Regression test for BUG-NNN
test('BUG-NNN: [bug description]', async () => {
  // Setup: reproduce bug condition
  const result = await buggyOperation();
  
  // Assertion: should fail on buggy code
  assert(result.error !== null, 'Should fail with expected error');
  assert(result.error.message.includes('[expected error message]'), 'Error message should match');
});
```

### Green Phase (After Fix)

**Purpose:** Verify the fix works by running the same test

**Procedure:**
1. Apply the fix patch from `quality/patches/BUG-NNN-fix.patch`
2. Run the same regression test
3. Verify the test now passes
4. Save the test output as `quality/results/BUG-NNN.green.log`
5. Update bug status in BUGS.md to "FIXED"

**Verification:**
- Test passes with fix applied
- Test fails if fix is reverted
- Test is idempotent (same result on repeated runs)

---

## Regression Test Requirements

### Test Characteristics
- **Reproducible:** Test must consistently reproduce the bug
- **Specific:** Test must fail only for the specific bug, not other issues
- **Fast:** Test should complete in < 5 seconds
- **Independent:** Test should not depend on other tests
- **Clear:** Test failure message must clearly indicate the bug

### Test Location
- Regression tests go in `quality/test_regression.js`
- Each test must reference the bug ID in the test name
- Each test must cite the requirement being violated

### Test Data
- Use minimal test data to reproduce the bug
- Don't rely on complex setup
- Clean up test data after test

---

## Patch Validation

### Fix Patch Requirements
- Patch must be in `quality/patches/BUG-NNN-fix.patch`
- Patch must apply cleanly to current code
- Patch must not introduce new violations
- Patch must be minimal (smallest change that fixes the bug)

### Regression Test Patch Requirements
- Regression test patch in `quality/patches/BUG-NNN-regression-test.patch`
- Patch must add test to test file
- Patch must not modify existing tests
- Patch must be idempotent (can apply multiple times)

### Validation Procedure
1. Apply regression test patch: `git apply quality/patches/BUG-NNN-regression-test.patch`
2. Run test: verify it fails (red phase)
3. Apply fix patch: `git apply quality/patches/BUG-NNN-fix.patch`
4. Run test: verify it passes (green phase)
5. Revert fix patch: `git apply -R quality/patches/BUG-NNN-fix.patch`
6. Run test: verify it fails again (red phase confirmation)

---

## TDD Results Format

### Sidecar JSON: quality/results/tdd-results.json

```json
{
  "schema_version": "1.1",
  "skill_version": "1.5.6",
  "date": "2026-07-22",
  "project": "SISTEM-AHLI-DPMM-JOHOR",
  "bugs": [
    {
      "id": "BUG-001",
      "requirement": "REQ-001",
      "red_phase": "fail",
      "green_phase": "pass",
      "verdict": "TDD verified",
      "fix_patch_present": true,
      "writeup_path": "quality/writeups/BUG-001.md"
    }
  ],
  "summary": {
    "total": 10,
    "confirmed_open": 2,
    "red_failed": 0,
    "green_failed": 1,
    "verified": 7
  }
}
```

### Verdict Values
- **TDD verified:** Red phase failed, green phase passed, fix patch present
- **red failed:** Red phase test didn't fail (test doesn't reproduce bug)
- **green failed:** Green phase test didn't pass (fix doesn't work)
- **confirmed open:** No fix patch available, bug still open
- **deferred:** Bug deferred for later resolution

---

## Execution Instructions

### Running TDD Verification for All Bugs
```bash
# Run all regression tests (red phase)
npm run test:regression

# Apply all fix patches
for patch in quality/patches/*-fix.patch; do
  git apply "$patch"
done

# Run all regression tests (green phase)
npm run test:regression

# Generate TDD results
npm run test:tdd-report
```

### Running TDD Verification for Single Bug
```bash
# Apply regression test patch
git apply quality/patches/BUG-NNN-regression-test.patch

# Run test (should fail)
npm test -- BUG-NNN

# Apply fix patch
git apply quality/patches/BUG-NNN-fix.patch

# Run test (should pass)
npm test -- BUG-NNN

# Revert fix patch
git apply -R quality/patches/BUG-NNN-fix.patch
```

---

## Quality Gates

### Before Fix
- Regression test must fail (red phase)
- Test output saved as red.log
- Bug documented in BUGS.md

### After Fix
- Regression test must pass (green phase)
- Test output saved as green.log
- Fix patch applied and committed
- Bug status updated to "FIXED"

### Before Merge
- All bugs with fix patches must have TDD verified status
- No bugs with "red failed" or "green failed" status

---

## Failure Handling

### Red Phase Failure
If test doesn't fail:
1. Test doesn't reproduce bug
2. Revise test to better reproduce bug
3. Re-run red phase
4. If still doesn't fail, mark as "red failed" and investigate

### Green Phase Failure
If test doesn't pass after fix:
1. Fix doesn't work
2. Revise fix patch
3. Re-run green phase
4. If still doesn't pass, mark as "green failed" and investigate

### Patch Application Failure
If patch doesn't apply:
1. Code has changed since patch created
2. Re-create patch from current code
3. Re-run TDD verification

---

## Documentation Requirements

### Bug Writeup (quality/writeups/BUG-NNN.md)
Each bug must have a writeup with:
- Bug description
- File:line citation
- Requirement being violated
- Severity
- Reproduction steps
- Fix description
- Inline diff of fix
- Regression test description

### TDD Traceability (quality/TDD_TRACEABILITY.md)
Map each bug to:
- Requirement violated
- Regression test function
- Fix patch location
- TDD verification status

---

## Example TDD Cycle

### Bug: Schema Inconsistency (REQ-001)

**Red Phase:**
```javascript
test('BUG-001: should use UPPERCASE column names', async () => {
  // This test fails if code uses lowercase column names
  const { data, error } = await supabaseClient
    .from('AHLI DPMM JOHOR')
    .select('nombor_ahli')  // WRONG - should be NO_AHLI
    .limit(1);
  
  assert(error !== null, 'Should fail with column does not exist error');
  assert(error.message.includes('column "nombor_ahli" does not exist'));
});
```

**Test Result:** FAIL ✓ (red phase passes)

**Fix:**
Change `nombor_ahli` to `NO_AHLI` in code

**Green Phase:**
```javascript
test('BUG-001: should use UPPERCASE column names', async () => {
  const { data, error } = await supabaseClient
    .from('AHLI DPMM JOHOR')
    .select('NO_AHLI')  // CORRECT
    .limit(1);
  
  assert(error === null, 'Should succeed with UPPERCASE column');
});
```

**Test Result:** PASS ✓ (green phase passes)

**Verdict:** TDD verified

---

## Continuous Integration

### CI Pipeline Integration
1. On PR: Run regression tests for bugs with fix patches
2. On merge: Run all regression tests
3. On fix: Run TDD cycle for specific bug

### Automated TDD Verification
```bash
# CI job: TDD verification
npm run test:tdd-verify
```

This command:
- Runs all regression tests
- Checks tdd-results.json for verdicts
- Fails CI if any bug has "red failed" or "green failed" status

---

**End of TDD Verification Protocol**
