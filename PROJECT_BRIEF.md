# DPMM Johor 2-Team Orchestration Project Brief

## Project Overview

Orchestrate two parallel teams (Documentation Team and UX/Design Team) to complete comprehensive documentation and propose incremental UX/design improvements for DPMM Johor systems (Sistem Ahli, Sistem Mesyuarat, and borang.html). Teams work in parallel with 8-week timeline including stakeholder review buffers.

## Concept / Product Description

**Documentation Team**: Create missing user-facing and operational documentation including user manuals, architecture diagrams, troubleshooting guides, API documentation, testing guides, maintenance guides, backup/recovery procedures, and developer onboarding guides.

**UX/Design Team**: Propose professional, modern, corporate design improvements using DPMM official branding (logo and brand colors). Apply DPMM logo consistently across all systems, standardize brand colors, propose incremental UX improvements for high-impact areas (login, dashboards, forms), create design system documentation, and propose responsive design improvements.

## Tech Stack

- **Documentation**: Markdown, Mermaid diagrams
- **Design**: CSS variables, HTML/CSS, WCAG accessibility guidelines
- **Systems**: HTML/JS, Supabase, Tailwind CSS (Sistem Mesyuarat), GitHub Pages
- **Version Control**: Git, GitHub PR workflow

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DPMM Johor Systems                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐      ┌──────────────────┐          │
│  │  Sistem Ahli      │      │  Sistem Mesyuarat│          │
│  │  (index.html)     │      │  (index.html)    │          │
│  │  - Purple/blue    │      │  - Blue only     │          │
│  │  - Supabase       │      │  - Supabase      │          │
│  │  - GitHub Pages   │      │  - GitHub Pages  │          │
│  └──────────────────┘      └──────────────────┘          │
│                                                             │
│  ┌──────────────────┐                                     │
│  │  borang.html      │                                     │
│  │  - DPMM blue/red  │                                     │
│  │  - Supabase       │                                     │
│  │  - Turnstile      │                                     │
│  └──────────────────┘                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Team Orchestration                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐      ┌──────────────────────┐   │
│  │  Documentation Team   │      │  UX/Design Team       │   │
│  │  - Technical writer   │      │  - UX designer         │   │
│  │  - Subject matter exp │      │  - Frontend developer  │   │
│  │                      │      │                      │   │
│  │  U0-U8 (16 units)     │      │  U9-U15 (7 units)      │   │
│  └──────────────────────┘      └──────────────────────┘   │
│                                                             │
│  Weekly syncs, shared milestones, integration planning      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Files Map

**Sistem Ahli**:
- `index.html` - Main application (purple/blue theme)
- `borang.html` - Membership form (DPMM blue/red theme)
- `README.md` - Basic documentation
- `docs/SETUP.md` - Comprehensive setup guide
- `docs/SECURITY.md` - Security architecture and RLS policies

**Sistem Mesyuarat** (in separate repo):
- `../SISTEM-MESYUARAT-DPMM-JOHOR-CLONE/index.html` - Main application (blue theme)
- `README.md` - Basic documentation

**Project**:
- `docs/plans/2026-07-10-002-org-two-team-orchestration-plan.md` - Implementation plan
- `PROJECT_BRIEF.md` - This file (single source of truth)

## Team Roles

### Documentation AI Agent
- **Capabilities**: Technical writing, code analysis, Markdown formatting, Mermaid diagram generation
- **Limitations**: Cannot test with actual non-technical users; requires human review for accuracy validation
- **Execution**: Continuous, faster than human teams, automated progress tracking

### UX/Design AI Agent
- **Capabilities**: CSS generation, design system documentation, accessibility analysis, mockup generation
- **Limitations**: Cannot conduct user testing; requires human review for visual validation
- **Execution**: Continuous, faster than human teams, automated progress tracking

### Human Reviewers
- **DPMM Leadership**: Final approval authority (Week 4 and Week 8 checkpoints)
- **System Administrators**: Technical accuracy validation for documentation
- **End Users**: UX feedback on proposals (Week 4 and Week 8 checkpoints)

## Sprint Status

**Current Sprint**: Sprint 1 (Week 1-2)
**Status**: Not started
**Start Date**: TBD
**End Date**: TBD

## Current State

**Documentation State**:
- Developer-focused documentation exists (README.md, SETUP.md, SECURITY.md)
- Missing: User manuals, architecture diagrams, troubleshooting guides, API documentation, testing guides, maintenance guides, backup/recovery procedures, onboarding guides
- AI agent will generate documentation with human review for accuracy validation

**Design State**:
- Inconsistent color schemes across systems (Sistem Ahli: purple/blue, borang.html: DPMM blue/red, Sistem Mesyuarat: blue)
- DPMM logo not consistently applied
- Missing: Design system documentation, UX improvement proposals, responsive design improvements
- AI agent will generate design proposals with human review for visual validation

**Orchestration State**:
- Plan converted to AI agent execution
- Resource allocation defined (AI agents with human review checkpoints)
- Timeline set to 8 weeks with human review checkpoints at Week 4 and Week 8
- Stakeholder sign-off process defined

## Security Rules

- No changes to RLS policies or authentication flows
- Color standardization must not break existing functionality
- Design changes must maintain WCAG AA accessibility (4.5:1 contrast ratio)
- No database schema changes
- No backend logic modifications
- All changes tested in staging before production

## How to Run Locally

**Sistem Ahli**:
```bash
cd c:\Users\DELL\Documents\GitHub\SISTEM-AHLI-DPMM-JOHOR
# Open index.html or borang.html in browser
# Requires Supabase credentials in environment
```

**Sistem Mesyuarat**:
```bash
cd c:\Users\DELL\Documents\GitHub\SISTEM-MESYUARAT-DPMM-JOHOR-CLONE
# Open index.html in browser
# Requires Supabase credentials in environment
```

## How to Deploy

**Documentation**:
- Markdown files committed to `docs/` directory
- No deployment required (documentation lives in repo)

**Design**:
- CSS changes committed to respective `index.html` files
- GitHub Pages auto-deploys on push to main branch
- Test changes in feature branch before merging

## Cross-Chat Handoff Protocol

1. **Weekly Sync Meetings**: Both teams meet to share progress, identify dependencies, resolve blockers
2. **Shared Milestone Tracking**: GitHub Issues/Projects used to track progress across teams
3. **Integration Planning**: U15 (Orchestration: Plan Integration) defines how documentation and design changes integrate
4. **Stakeholder Reviews**: Week 4 and Week 7 reviews involve both teams presenting together

## Bug & Fix Tracking

- GitHub Issues as single source of truth
- Format: `[Documentation] Title` or `[Design] Title`
- Each issue references relevant implementation unit (U0-U15)
- Fixes committed with issue reference: "fix: description (Fixes #NN)"

## Multi-Repo Setup

**Primary Repo**: `SISTEM-AHLI-DPMM-JOHOR`
- Documentation Team works here
- UX/Design Team works here for Sistem Ahli and borang.html

**Secondary Repo**: `SISTEM-MESYUARAT-DPMM-JOHOR-CLONE`
- UX/Design Team works here for Sistem Mesyuarat design changes
- Documentation Team references this repo for architecture diagrams

**Branch Strategy**:
- Feature branches: `feature/documentation-U{N}` or `feature/design-U{N}`
- PR to main branch with required reviewers
- No rebase (merge only to preserve commit history)

**Merge Rules**:
- Documentation: Reviewed by subject matter expert before merge
- Design: Reviewed by UX designer and tested for accessibility before merge
- Integration: U15 requires approval from all stakeholders before merge
