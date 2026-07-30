# Documentation Index — SISTEM-AHLI-DPMM-JOHOR

**Last Updated:** 26 Julai 2026  
**Project Status:** Production (Live on GitHub Pages)  
**Version:** 2.0 (Vengence UI + PDF Workflow + EmailJS)

---

## 📚 Quick Navigation

### **Getting Started**
- [Project Brief](../PROJECT_BRIEF.md) — Project scope, objectives, and stakeholders
- [Setup Guide](SETUP.md) — Local development environment setup
- [Deployment Guide](DEPLOYMENT.md) — Deploy to GitHub Pages

### **User Guides**
- [Borang User Guide](BORANG-USER-GUIDE.md) — Membership application form instructions
- [AIMAN Guide](AIMAN-GUIDE.md) — AI assistant usage and capabilities
- [Dashboard Guide](../README.md#-ciri-ciri) — Main dashboard features and navigation

### **Technical Reference**
- [Developer Guide](DEVELOPER-GUIDE.md) — Architecture, code structure, and conventions
- [Security Overview](SECURITY.md) — Authentication, RLS policies, and data protection
- [Database Schema](../CONTEXT.md) — Table structures and relationships
- [API Reference](../docs/plans/feature-pdf-workflow-supabase-1.md) — Supabase Edge Functions and integrations

### **Design System**
- [Color Guidelines](design-system/color-guidelines.md) — DPMM brand colors and usage
- [Logo Guidelines](design-system/logo-guidelines.md) — Logo specifications and placement
- [Vengence UI Research](plans/2026-07-22-vengence-ui-research.md) — Design system rationale

### **Implementation Plans**
- [PDF Workflow](plans/feature-pdf-workflow-supabase-1.md) — Supabase Storage, Edge Functions, PDF generation
- [Borang Security Fixes](plans/2026-07-09-borang-security-fixes-plan.md) — RLS policies and validation
- [Receipt & Voucher System](plans/2026-07-14-001-fix-receipt-pv-security-issues-plan.md) — Resit & Baucar implementation
- [AIMAN Language Improvements](plans/2026-07-17-001-feat-aiman-language-improvements-security-fixes-plan.md) — Multilingual AI assistant
- [Approval Workflow](plans/2026-07-21-001-feat-approval-workflow-communication-buttons-plan.md) — Workflow automation

### **Security & Audits**
- [Security Fixes](SECURITY-FIXES.md) — Recent security improvements
- [Data Masking](DATA-MASKING.md) — PII protection strategies
- [Email Retry Logic](EMAIL-RETRY.md) — Email delivery reliability
- [Security Audit (2026-06-30)](audit/git-and-security-audit-2026-06-30.md) — Comprehensive security review
- [Receipt/PV Security Audit (2026-07-14)](audit/receipt-pv-security-audit-2026-07-14.md) — Payment system security

### **Code Review & Analysis**
- [Security Review (2026-06-29)](code-review/2026-06-29-sistem-ahli-security-review.md) — Code quality and security findings
- [Documentation Gap Analysis](audit/existing-docs-gap-analysis.md) — Documentation completeness assessment
- [Audit Report](../AUDIT-REPORT.md) — Quality audit findings and recommendations

### **Research & Specifications**
- [Isi Pintar (Smart Autofill) Design](specs/2026-06-01-isi-pintar-smart-autofill-design.md) — AI-powered form completion
- [WhatsApp Integration Research](plans/2026-07-22-whatsapp-integration-research.md) — WAHA integration possibilities
- [Borang Upgrade Requirements](2026-06-01-borang-upgrade-requirements.md) — Feature requirements and specifications

---

## 📊 Document Organization by Type (Diátaxis Framework)

### **Tutorials** (Learning-Oriented)
- [Setup Guide](SETUP.md) — Step-by-step local development setup
- [Borang User Guide](BORANG-USER-GUIDE.md) — How to use the membership application form

### **How-to Guides** (Problem-Oriented)
- [Deployment Guide](DEPLOYMENT.md) — How to deploy to GitHub Pages
- [Email Retry Logic](EMAIL-RETRY.md) — How email delivery is handled and retried
- [Data Masking](DATA-MASKING.md) — How to mask sensitive data in logs

### **Reference** (Information-Oriented)
- [Developer Guide](DEVELOPER-GUIDE.md) — Code structure, architecture, conventions
- [Security Overview](SECURITY.md) — Authentication, RLS, encryption details
- [Database Schema](../CONTEXT.md) — Table definitions and relationships
- [Color Guidelines](design-system/color-guidelines.md) — Color palette specifications
- [Logo Guidelines](design-system/logo-guidelines.md) — Logo usage rules

### **Explanation** (Understanding-Oriented)
- [Project Brief](../PROJECT_BRIEF.md) — Why the project exists and its goals
- [AIMAN Guide](AIMAN-GUIDE.md) — How the AI assistant works
- [Vengence UI Research](plans/2026-07-22-vengence-ui-research.md) — Why we chose this design system
- [PDF Workflow](plans/feature-pdf-workflow-supabase-1.md) — How PDF generation and storage works
- [Security Audit Reports](audit/) — Why certain security measures are in place

---

## 🔄 Feature Status & Documentation Completeness

| Feature | Status | Documentation | Last Updated |
|---------|--------|---------------|----|
| **Dashboard** | ✅ Live | Complete | 23 Jul 2026 |
| **Borang (Membership Form)** | ✅ Live | Complete | 19 Jul 2026 |
| **PDF Generation & Storage** | ✅ Live | Complete | 19 Jul 2026 |
| **Email with PDF Attachment** | ✅ Live | Complete | 19 Jul 2026 |
| **EmailJS Integration** | ✅ Live | Complete | 18 Jul 2026 |
| **Receipt & Voucher System** | ✅ Live | Complete | 14 Jul 2026 |
| **AIMAN AI Assistant** | ✅ Live | Complete | 17 Jul 2026 |
| **Vengence UI Design System** | ✅ Live | Complete | 23 Jul 2026 |
| **Mobile Responsiveness (Phase 1)** | ✅ Live (SISTEM-AHLI) | Complete | 23 Jul 2026 |
| **Accessibility Focus (Phase 1)** | ✅ Live (SISTEM-AHLI) | Complete | 23 Jul 2026 |

---

## 📋 Documentation Checklist

### **Core Documentation** (Required)
- ✅ README.md — Main project overview
- ✅ PROJECT_BRIEF.md — Project scope and objectives
- ✅ CONTEXT.md — Project context and background
- ✅ SETUP.md — Development environment setup
- ✅ DEPLOYMENT.md — Deployment instructions
- ✅ SECURITY.md — Security overview

### **User Documentation** (Required)
- ✅ BORANG-USER-GUIDE.md — Form usage instructions
- ✅ AIMAN-GUIDE.md — AI assistant guide
- ✅ Dashboard Guide (in README) — Dashboard features

### **Technical Documentation** (Required)
- ✅ DEVELOPER-GUIDE.md — Code architecture and conventions
- ✅ Database Schema (in CONTEXT.md) — Table definitions
- ✅ API Reference (in PDF Workflow plan) — Edge Functions

### **Design System** (Required)
- ✅ color-guidelines.md — Color specifications
- ✅ logo-guidelines.md — Logo usage rules
- ✅ Vengence UI Research — Design rationale

### **Security Documentation** (Required)
- ✅ SECURITY-FIXES.md — Recent improvements
- ✅ Security Audit Reports — Comprehensive reviews
- ✅ Data Masking Guide — PII protection

---

## 🔍 How to Use This Index

1. **New to the project?** Start with [Project Brief](../PROJECT_BRIEF.md) → [Setup Guide](SETUP.md)
2. **Need to deploy?** Go to [Deployment Guide](DEPLOYMENT.md)
3. **Building a feature?** Check [Developer Guide](DEVELOPER-GUIDE.md) and relevant implementation plans
4. **Security concerns?** Review [Security Overview](SECURITY.md) and audit reports
5. **Design questions?** See [Design System](design-system/) documentation
6. **Troubleshooting?** Check relevant audit reports and code review findings

---

## 📞 Support & Escalation

- **Security Issues:** See [SECURITY.md](SECURITY.md) and [Security Audit Reports](audit/)
- **Deployment Problems:** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Feature Requests:** See relevant implementation plans in [plans/](plans/)
- **Code Questions:** See [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md)

---

**Next Steps:**
- Review [DOCUMENTATION-HEALTH.md](DOCUMENTATION-HEALTH.md) for completeness assessment
- Check [SYSTEM-HEALTH-REPORT.md](SYSTEM-HEALTH-REPORT.md) for current system status
- Review [KNOWLEDGE-BASE.md](KNOWLEDGE-BASE.md) for unified project knowledge
