# DPMM Johor — Git & Security Audit Report
**Date**: June 30, 2026  
**Auditor**: Cascade AI Assistant  
**Repository**: SISTEM-AHLI-DPMM-JOHOR  
**Audit Type**: Git Repository Health + Security Vulnerability Scan

---

## Executive Summary

**MFM-Corp.cc.cd**: ❌ NOT FOUND - This file does not exist in the repository

**Overall Repository Health**: ⚠️ NEEDS ATTENTION

**Critical Issues Found**: 2
- Hardcoded Supabase credentials in source code
- 36 dangling git objects (orphaned data)

**High Issues Found**: 1
- GitHub Advanced Security not enabled (no automated secret scanning)

**System Rating**: C (Requires Remediation)

---

## Git Repository Audit

### ✅ PASSED: Repository Configuration
- **Remote**: https://github.com/DPMMJOHOR/SISTEM-AHLI-DPMM-JOHOR.git
- **Branches**: main, feat/borang-security-remediation
- **Status**: Connected and accessible

### ⚠️ WARNING: Dangling Git Objects (36 found)
**Severity**: Medium  
**Impact**: Repository contains orphaned data that wastes storage

**Details**:
- `git fsck` detected 36 dangling blobs
- These are orphaned git objects not referenced by any commit
- Common causes: force pushes, rebases, failed operations
- Storage impact: Each blob consumes space in .git/objects

**Remediation**:
```bash
# Option 1: Run garbage collection with aggressive pruning
git gc --prune=now --aggressive

# Option 2: If confident no data loss, expire reflog
git reflog expire --expire=now --all
git gc --prune=now
```

**Note**: Review dangling objects before cleanup to ensure no important data is lost.

---

## Security Audit

### ❌ CRITICAL: Hardcoded Supabase Credentials
**Severity**: CRITICAL  
**Location**: `src/config-loader.js` lines 9-10  
**Impact**: Database credentials exposed in source code

**Findings**:
```javascript
SUPABASE_URL: window.SUPABASE_URL || 'https://lzoloupwtqmjyupvofhh.supabase.co',
SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2xvdXB3dHFtanl1cHZvZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTMxMTEsImV4cCI6MjA4ODUyOTExMX0.tBcGc6KfPyjUmJngbLTBHv-GZkSoSoyWGXwlXFZ0ShE',
```

**Risk**:
- Anon key allows read access to database
- URL reveals Supabase project identifier
- Anyone with repository access can extract credentials
- Violates security best practices

**Remediation**:
1. **Immediate**: Rotate Supabase anon key in Supabase dashboard
2. **Code**: Replace hardcoded values with environment variables
3. **Deployment**: Use GitHub Actions secrets for production
4. **Git**: Remove credentials from commit history (BFG Repo-Cleaner or git filter-repo)

**Recommended Pattern**:
```javascript
SUPABASE_URL: window.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL,
SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
```

### ⚠️ HIGH: GitHub Advanced Security Not Enabled
**Severity**: HIGH  
**Impact**: No automated secret scanning or push protection

**Current State**:
- Repository does not have GitHub Advanced Security enabled
- Manual secret scanning required
- No push protection to block credential commits
- No automated vulnerability scanning

**Remediation**:
1. Enable GitHub Advanced Security (requires Team/Enterprise plan)
2. Configure secret scanning patterns
3. Enable push protection
4. Set up CodeQL for automated code analysis

---

## Architecture Audit

### ⚠️ WARNING: Monolithic HTML Files
**Severity**: MEDIUM  
**Files Affected**: 
- `index.html` (1.4MB, 6,858 lines)
- `borang.html` (235KB, 5,733 lines)

**Issues**:
- All CSS, JavaScript, and HTML in single files
- No module separation
- Difficult to maintain
- Poor version control granularity
- Hard to test individual components

**Recommendation**: 
- Split into separate CSS, JS, and HTML files
- Use build tools (Vite already configured)
- Implement component-based architecture

### ✅ PASSED: Configuration Pattern
- `config-loader.js` provides centralized configuration
- Environment variable support via window object
- Fallback to default values
- Backward compatibility maintained

---

## Previous Audit Status

Based on existing `AUDIT-REPORT.md` (June 20, 2026):

**Previously Addressed**:
- ✅ API key placeholders in borang.html
- ✅ config-local.js properly gitignored
- ✅ Input validation implemented
- ✅ PDPA consent checkboxes
- ✅ Document upload system operational
- ✅ Email notification system
- ✅ Chatbot functionality

**Still Outstanding**:
- ⚠️ Supabase schema migration (TARIKH_BAYARAN_2026)
- ⚠️ GROQ_KEY in config-local.js
- ⚠️ GitHub Actions deployment

---

## Recommendations

### Immediate (Critical)
1. **Rotate Supabase credentials** - Generate new anon key in Supabase dashboard
2. **Remove hardcoded credentials** - Replace with environment variables
3. **Clean git history** - Remove credentials from past commits
4. **Clean dangling objects** - Run `git gc --prune=now --aggressive`

### Short-term (High Priority)
1. **Enable GitHub Advanced Security** - If organization has Team/Enterprise plan
2. **Implement secret scanning** - Manual scan with Gitleaks as alternative
3. **Update .gitignore** - Ensure no config files with credentials are committed
4. **Add pre-commit hooks** - Prevent credential commits

### Long-term (Medium Priority)
1. **Refactor monolithic files** - Split index.html and borang.html
2. **Implement build process** - Use Vite for bundling
3. **Add automated testing** - Unit tests for critical functions
4. **Set up staging environment** - Separate from production

---

## Git Cleanup Commands

**For non-technical users**: These commands clean up orphaned data in the git repository. Run them in the repository directory.

```bash
# Step 1: Check current repository size
du -sh .git

# Step 2: Run garbage collection
git gc --prune=now --aggressive

# Step 3: Verify cleanup
git fsck
```

**Warning**: Garbage collection is generally safe, but always backup before running.

---

## Credential Rotation Guide

**For non-technical users**: Follow these steps to secure the database:

1. **Log in to Supabase Dashboard** (supabase.com)
2. **Navigate to Project Settings → API**
3. **Click "Regenerate" next to anon/public key**
4. **Copy new key**
5. **Update `config-local.js` with new key**
6. **Remove old key from `src/config-loader.js`**
7. **Test application locally**
8. **Commit and push changes**

---

## Conclusion

The DPMM Johor repository has **critical security vulnerabilities** that require immediate attention:

1. **Hardcoded Supabase credentials** must be rotated and removed from source code
2. **36 dangling git objects** should be cleaned up to optimize repository
3. **GitHub Advanced Security** should be enabled for automated protection

The monolithic architecture (1.4MB HTML file) is a maintenance concern but not a security issue. Previous audits show good progress on functionality and user experience.

**Action Required**: Address critical security issues before any production deployment.

---

**Audit Completed By**: Cascade AI Assistant  
**Audit Date**: June 30, 2026  
**Next Review**: After credential rotation and git cleanup
