# superset-sh Analysis for Cascade Integration

**Date:** 28 Julai 2026  
**Purpose:** Evaluate whether superset-sh ecosystem benefits Cascade (AI coding assistant)  
**Research Scope:** Main repository, skills repository, MCP server capabilities

---

## Executive Summary

**Conclusion:** superset-sh is **NOT directly beneficial** for Cascade in its current form. The two systems serve different purposes and operate in different environments.

- **superset-sh:** Desktop application for orchestrating parallel AI coding agents in Git worktrees
- **Cascade:** IDE-integrated AI coding assistant (Windsurf/Cascade) with MCP server integration

**Key Finding:** superset-sh's MCP server could provide useful orchestration tools, but the desktop app architecture is incompatible with Cascade's IDE-integrated approach.

---

## superset-sh Overview

### Main Repository (superset-sh/superset)

**Purpose:** "The last developer tool you'll ever need" - Electron desktop app for running 10+ parallel AI coding agents

**Architecture:**
- **Frontend:** Electron 40.2.1 + React 19.2.0 + TanStack Router
- **Backend:** Next.js 16.0.10 API with tRPC
- **Database:** PostgreSQL (Drizzle ORM) + SQLite (local)
- **Real-time Sync:** Electric SQL
- **Build System:** Bun workspace monorepo with Turbo
- **AI Integration:** Mastra + Anthropic SDK

**Core Applications:**
1. **Desktop App** - Flagship Electron application
2. **API** - Next.js backend with tRPC endpoints
3. **Web** - Browser-based client
4. **Admin** - Internal administration panel

**Key Features:**
- Terminal management with XTerm.js
- Git worktree workflows
- Parallel agent execution (10+ agents simultaneously)
- Real-time collaboration
- Auto-updates via electron-updater
- Native installers (macOS DMG, Linux AppImage, Windows NSIS)

**Deployment:**
- Desktop: GitHub Releases with electron-builder
- API/Web: Vercel with preview environments
- Electric SQL: Fly.io for real-time sync

---

## Skills Repository (superset-sh/skills)

**Purpose:** Official agent skills for Superset via CLI and MCP

**Available Skills:**

### 1. superset Skill
**Use:** Drive Superset from CLI - create worktree workspaces, spawn coding agents, open terminals, schedule automations

**Capabilities:**
- Create Git worktree workspaces
- Launch coding agent sessions
- Open terminals in workspaces
- Schedule automations (RFC 5545 RRULE)
- Manage tasks from any shell

### 2. superset-mcp Skill
**Use:** Connect agents to Superset MCP server

**Setup:**
```bash
# Claude Code
claude mcp add superset --transport http https://api.superset.sh/api/v2/agent/mcp

# OpenAI Codex
codex mcp add superset --url https://api.superset.sh/api/v2/agent/mcp

# Gemini CLI
gemini mcp add --transport http superset https://api.superset.sh/api/v2/agent/mcp
```

**Authentication:**
- OAuth 2.1 (recommended) - authorization code + PKCE
- API key - user creates in Superset app

**Tools (27 total across 7 families):**
- **hosts/projects** - enumerate registered machines and repos
- **workspaces** - create/list/rename/delete Git worktrees
- **agents** - launch coding-agent sessions (Claude Code, Codex, OpenCode)
- **terminals** - open PTY in workspace
- **automations** - schedule recurring agent runs
- **tasks** - create/search/update/delete tasks
- **docs** - search and read documentation

**Typical Flow:**
1. `hosts_list` → pick online host
2. `projects_list` → pick repo
3. `workspaces_create` with branch/PR → spawn agent
4. Track with `tasks_create` / `automations_create`

---

## MCP Server Capabilities

**Endpoint:** `https://api.superset.sh/api/v2/agent/mcp` (alias: `https://api.superset.sh/mcp`)

**Protocol:** Streamable HTTP, JSON-RPC 2.0

**Tool Families:**
1. **Hosts/Projects** - Host and project enumeration
2. **Workspaces** - Git worktree management
3. **Agents** - Coding agent session management
4. **Terminals** - PTY terminal management
5. **Automations** - Recurring agent scheduling
6. **Tasks** - Task CRUD operations
7. **Documentation** - Docs search and read

**Behavioral Annotations:**
- Reads: `readOnlyHint`
- Deletes: `destructiveHint` (3 tools)
- Confirm with user before destructive operations

---

## Cascade Architecture Analysis

**Current Environment:**
- IDE: Windsurf/Cascade
- Integration: IDE-integrated AI assistant
- MCP Servers: Multiple (Figma, GitHub, Cloudflare, DeepWiki, etc.)
- Project: SISTEM-AHLI-DPMM-JOHOR (vanilla JS membership system)
- Tools: File operations, git, search, MCP integrations

**Cascade's Strengths:**
- Direct IDE integration (no context switching)
- Real-time code awareness
- File system access via IDE
- Multiple MCP server support
- Project-specific context

---

## Pros and Cons Analysis

### Pros of superset-sh for Cascade

#### 1. MCP Server Tools (HIGH VALUE)
**Benefit:** 27 orchestration tools available via MCP
- Workspace management
- Agent session control
- Terminal operations
- Task scheduling
- Documentation access

**Potential Use:** Cascade could leverage these tools for:
- Creating isolated workspaces for experiments
- Scheduling automated tasks
- Managing parallel operations

#### 2. Parallel Agent Orchestration (MEDIUM VALUE)
**Benefit:** superset-sh specializes in running 10+ agents in parallel
- Isolated Git worktrees
- Independent agent sessions
- Resource management

**Potential Use:** If Cascade needs to orchestrate multiple agents for complex tasks

#### 3. Automation Scheduling (MEDIUM VALUE)
**Benefit:** RFC 5545 RRULE-based automation scheduling
- Recurring agent runs
- Pause/resume/dispatch controls
- Run log tracking

**Potential Use:** Automated testing, periodic maintenance tasks

#### 4. Documentation System (LOW VALUE)
**Benefit:** Built-in documentation served over MCP
- Docs search and read
- Human-readable docs
- Unauthenticated access

**Potential Use:** Could supplement existing documentation

### Cons of superset-sh for Cascade

#### 1. Architecture Mismatch (CRITICAL)
**Issue:** superset-sh is a desktop app, Cascade is IDE-integrated
- superset-sh: Electron desktop application
- Cascade: IDE plugin/extension
- Different deployment models
- Different user workflows

**Impact:** Cannot directly integrate without major architectural changes

#### 2. Dependency on Superset Desktop App (CRITICAL)
**Issue:** MCP server requires Superset desktop app to be running
- Hosts must be registered with Superset
- Projects must be checked out in Superset
- Requires desktop app installation
- Requires user account on Superset platform

**Impact:** Adds external dependency and complexity

#### 3. Git Worktree Focus (MEDIUM)
**Issue:** superset-sh optimized for Git worktree workflows
- SISTEM-AHLI-DPMM-JOHOR uses single-branch workflow
- Worktree complexity not needed for current project
- Overkill for simple projects

**Impact:** Features don't align with current project needs

#### 4. Technology Stack Mismatch (MEDIUM)
**Issue:** superset-sh uses modern stack (React, TypeScript, Electron)
- SISTEM-AHLI-DPMM-JOHOR uses vanilla JS
- No framework alignment
- Different development paradigms

**Impact:** Learning curve if adopting superset-sh patterns

#### 5. Authentication Overhead (LOW)
**Issue:** MCP server requires OAuth 2.1 or API key
- Additional authentication setup
- User account management
- OAuth flow complexity

**Impact:** Adds setup complexity for marginal benefit

#### 6. Limited Relevance to Current Project (HIGH)
**Issue:** SISTEM-AHLI-DPMM-JOHOR is a simple vanilla JS system
- No need for parallel agents
- No need for complex workspaces
- No need for automation scheduling
- Current MCP servers (Figma, GitHub, Cloudflare) are more relevant

**Impact:** Most features are overkill for current needs

---

## Specific Use Case Analysis

### Use Case 1: Code Review Automation
**superset-sh:** Could schedule automated code reviews with agents
**Cascade:** Can already perform code reviews via MCP and file tools
**Verdict:** No benefit - Cascade already handles this

### Use Case 2: Parallel Testing
**superset-sh:** Could run parallel tests in isolated worktrees
**Cascade:** Can run tests sequentially, no parallel capability
**Verdict:** Potential benefit if parallel testing needed, but requires desktop app

### Use Case 3: Task Scheduling
**superset-sh:** Built-in automation scheduling with RRULE
**Cascade:** No native scheduling capability
**Verdict:** Potential benefit, but requires Superset desktop app

### Use Case 4: Workspace Isolation
**superset-sh:** Git worktree isolation for experiments
**Cascade:** Works in current workspace, no isolation
**Verdict:** Potential benefit for risky experiments, but overkill for current project

### Use Case 5: Documentation Access
**superset-sh:** Built-in docs server over MCP
**Cascade:** Can access web documentation via web_search
**Verdict:** No significant benefit

---

## Recommendation

### Short Term (Current State)
**DO NOT integrate superset-sh** with Cascade

**Reasons:**
1. Architecture mismatch (desktop app vs IDE integration)
2. External dependency on Superset platform
3. Features don't align with current project needs
4. Adds complexity without clear benefit

### Long Term (Future Consideration)
**EVALUATE superset-sh MCP server** if specific needs arise

**Conditions for future consideration:**
1. Need for parallel agent orchestration
2. Need for automation scheduling
3. Need for workspace isolation
4. Willingness to adopt Superset desktop app

**Alternative Approaches:**
1. Build custom MCP server for specific needs
2. Use existing MCP servers (already doing this)
3. Extend Cascade's native capabilities
4. Consider framework migration if project complexity grows

---

## Conclusion

**superset-sh is NOT beneficial for Cascade in its current form.**

The two systems serve different purposes:
- **superset-sh:** Desktop app for parallel agent orchestration in Git worktrees
- **Cascade:** IDE-integrated AI assistant with MCP server support

**Key Takeaways:**
1. MCP server tools could be useful but require desktop app dependency
2. Most features are overkill for current vanilla JS project
3. Architecture mismatch prevents direct integration
4. Current MCP ecosystem already meets Cascade's needs

**Recommendation:** Continue with current approach. Consider superset-sh MCP server only if specific orchestration needs emerge that justify the desktop app dependency.

---

## Research Methodology

**Sources:**
- superset-sh/superset repository wiki (DeepWiki)
- superset-sh/skills repository README and SKILL.md
- GitHub repository search and file analysis
- MCP server documentation

**Analysis Framework:**
- Architecture comparison
- Feature relevance assessment
- Integration feasibility evaluation
- Cost-benefit analysis
- Use case mapping

**Limitations:**
- Analysis based on documentation, not hands-on testing
- No evaluation of actual MCP server performance
- No assessment of Superset desktop app UX
- Limited understanding of internal implementation details
