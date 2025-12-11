# Notion-GitHub Sync - Quick Start Guide

**Status:** ✅ Workflow Deployed
**Branch:** `claude/github-notion-sync-setup-01NGq1fuSsDRfTkq6dAdqpBj`
**Date:** December 11, 2025

---

## 🚀 Quick Setup (5 Minutes)

### Prerequisites

- ✅ GitHub repository access
- ✅ Notion workspace access ("Casius's Workspace")
- ✅ GitHub CLI (`gh`) installed
- ✅ 4 Notion databases created (IDs provided below)

### Step 1: Configure GitHub Secrets (2 min)

```bash
# Run the automated setup script
./scripts/setup-notion-sync.sh
```

**What it does:**
- Prompts for your Notion Integration Token
- Configures all 5 required GitHub secrets
- Verifies configuration

**Manual alternative:**
```bash
gh secret set NOTION_TOKEN --body "YOUR_TOKEN_HERE"
gh secret set NOTION_FEATURE_DB --body "bc6b0c4e-dd57-4e52-a72d-666408edd7ba"
gh secret set NOTION_METRICS_DB --body "f6d08cc9-825e-44e8-bf4b-003f845ce9c5"
gh secret set NOTION_ARCHITECTURE_DB --body "aaf4f126-c46a-46c4-b0c6-a5fbc89564a9"
gh secret set NOTION_SPRINT_DB --body "ac6f0276-752a-462a-8a7e-ef16798e1e35"
```

### Step 2: Connect Integration to Databases (2 min)

For each database, grant integration access:

1. **Feature Tracker**
   https://www.notion.so/1d7c583a519644e791bb10dd81913ce7
   - Click "..." → Connections → Add "Lithium Lux GitHub Sync"

2. **Success Metrics**
   https://www.notion.so/9e844c21d96f4ef08269a00f8fd51379
   - Click "..." → Connections → Add "Lithium Lux GitHub Sync"

3. **Architecture Modules**
   https://www.notion.so/92d5e7b6e10b4d29be3f2fe44d92858e
   - Click "..." → Connections → Add "Lithium Lux GitHub Sync"

4. **Sprint Planning**
   https://www.notion.so/60228527636544cbbb38f20ab02378fb
   - Click "..." → Connections → Add "Lithium Lux GitHub Sync"

### Step 3: Test the Sync (1 min)

```bash
# Run the automated test suite
./scripts/test-notion-sync.sh
```

**What it tests:**
- ✓ All GitHub secrets configured
- ✓ Creates test GitHub issue
- ✓ Verifies GitHub → Notion sync
- ✓ Provides instructions for Notion → GitHub test

---

## 📋 Database Configuration

### Database IDs (Already Configured)

```bash
NOTION_FEATURE_DB=bc6b0c4e-dd57-4e52-a72d-666408edd7ba
NOTION_METRICS_DB=f6d08cc9-825e-44e8-bf4b-003f845ce9c5
NOTION_ARCHITECTURE_DB=aaf4f126-c46a-46c4-b0c6-a5fbc89564a9
NOTION_SPRINT_DB=ac6f0276-752a-462a-8a7e-ef16798e1e35
```

### Database URLs

| Database | URL |
|----------|-----|
| Feature Tracker | https://www.notion.so/1d7c583a519644e791bb10dd81913ce7 |
| Success Metrics | https://www.notion.so/9e844c21d96f4ef08269a00f8fd51379 |
| Architecture Modules | https://www.notion.so/92d5e7b6e10b4d29be3f2fe44d92858e |
| Sprint Planning | https://www.notion.so/60228527636544cbbb38f20ab02378fb |

---

## 🔄 How the Sync Works

### GitHub → Notion (Real-time)

**Triggers:**
- Issue created/updated/closed
- PR merged

**Actions:**
1. GitHub webhook fires
2. Workflow runs immediately (< 2 min)
3. Creates/updates Notion page in Feature Tracker
4. Maps labels to properties:
   - `epic-carbon` → Epic 1: Carbon Calculator
   - `priority-p0` → P0-Critical
   - Issue state → Status (open=Backlog, closed=Complete)

**Example:**
```bash
gh issue create \
  --title "Add Carbon Calculator API" \
  --label "epic-carbon" \
  --label "priority-p1"

# After ~2 minutes: Check Feature Tracker in Notion
```

### Notion → GitHub (Scheduled)

**Triggers:**
- Cron schedule: Every 15 minutes
- Manual: Workflow dispatch

**Actions:**
1. Queries Feature Tracker for pages without GitHub issues
2. Creates GitHub issue with:
   - Title from Notion "Name"
   - Body from "Acceptance Criteria"
   - Labels from Epic and Priority
3. Updates Notion with issue number and URL

**Example:**
1. Create page in Notion Feature Tracker
2. Wait up to 15 minutes
3. Check GitHub issues - new issue appears
4. Notion page updated with `#123` and URL

---

## 🏷️ Label Mapping

### Epic Labels

| GitHub Label | Notion Select |
|--------------|---------------|
| `epic-carbon` | Epic 1: Carbon Calculator |
| `epic-3pl` | Epic 2: 3PL Middleware |
| `epic-auctions` | Epic 3: Spot Auctions |
| `epic-green` | Epic 4: Green Directory |

### Priority Labels

| GitHub Label | Notion Select |
|--------------|---------------|
| `priority-p0` | P0-Critical |
| `priority-p1` | P1-High |
| `priority-p2` | P2-Medium |
| `priority-p3` | P3-Low |

### Status Labels

| GitHub State | Notion Select |
|--------------|---------------|
| Open + no label | Backlog |
| Open + `in-progress` | In Progress |
| Open + `testing` | Testing |
| Closed | Complete |

---

## 🧪 Testing Checklist

### Test 1: GitHub → Notion ✓

```bash
# Create test issue
gh issue create \
  --title "Test: Data Governance Framework" \
  --body "AC1: Verify sync works" \
  --label "epic-carbon" \
  --label "priority-p0"

# Wait 2 minutes
# Check: https://www.notion.so/1d7c583a519644e791bb10dd81913ce7
```

**Expected Result:**
- New page in Feature Tracker
- Name: "Test: Data Governance Framework"
- Status: Backlog
- Priority: P0-Critical
- Epic: Epic 1: Carbon Calculator
- GitHub Issue: #[number]
- GitHub URL: populated

### Test 2: Notion → GitHub

```
1. Open Feature Tracker: https://www.notion.so/1d7c583a519644e791bb10dd81913ce7
2. New page:
   - Name: "Test: Carbon API"
   - Priority: P1-High
   - Epic: Epic 1: Carbon Calculator
3. Save
4. Wait 15 minutes (next cron run)
5. Check: gh issue list --label epic-carbon
```

**Expected Result:**
- New GitHub issue appears
- Title: "Test: Carbon API"
- Labels: epic-carbon, priority-p1
- Notion page updated with issue #

### Test 3: Status Update

```bash
# Close the test issue
gh issue close 123

# Wait 2 minutes
# Check Notion - Status should be "Complete"
```

### Test 4: PR Tracking

```bash
# Create and merge a test PR
gh pr create --title "Test PR" --body "Test"
gh pr merge --squash

# Wait 2 minutes
# Check Sprint Planning - PR should appear in "Pull Requests" field
```

---

## 📊 Monitoring

### Check Workflow Runs

```bash
# List recent runs
gh run list --workflow=notion-github-sync.yml --limit 10

# View specific run
gh run view [RUN_ID]

# View logs
gh run view [RUN_ID] --log
```

### Check Secrets

```bash
# List configured secrets
gh secret list

# Should show:
# NOTION_TOKEN
# NOTION_FEATURE_DB
# NOTION_METRICS_DB
# NOTION_ARCHITECTURE_DB
# NOTION_SPRINT_DB
```

### GitHub Actions UI

https://github.com/Greenmamba29/lithium-buy-enterprise/actions

---

## 🔧 Troubleshooting

### Issue: Workflow doesn't run

**Check:**
1. Secrets configured: `gh secret list`
2. Workflow file exists: `.github/workflows/notion-github-sync.yml`
3. Branch merged to main (workflows only run on main)

**Fix:**
```bash
# Merge this branch to main
git checkout main
git merge claude/github-notion-sync-setup-01NGq1fuSsDRfTkq6dAdqpBj
git push
```

### Issue: Notion sync fails

**Check:**
1. Integration connected to all 4 databases
2. Token has correct permissions
3. Database IDs are correct

**Fix:**
```bash
# Verify database IDs in secrets
gh secret list

# Update if needed
gh secret set NOTION_FEATURE_DB --body "bc6b0c4e-dd57-4e52-a72d-666408edd7ba"
```

### Issue: Pages not creating in Notion

**Check:**
1. Workflow logs: `gh run view --log`
2. Integration permissions in Notion
3. Database structure matches expected schema

**Debug:**
```bash
# Manually trigger workflow
gh workflow run notion-github-sync.yml

# Check logs
gh run list --workflow=notion-github-sync.yml --limit 1
gh run view [RUN_ID] --log
```

---

## 📝 Usage Examples

### Example 1: Feature Request Flow

**Product Manager:**
1. Opens Feature Tracker in Notion
2. Creates page: "Supplier Profile Page"
3. Sets: Priority=P1-High, Epic=Carbon Calculator, Points=8
4. Adds acceptance criteria
5. Links to Sprint 2

**What happens:**
- 15 min later: GitHub issue auto-created
- Dev sees issue #456 in backlog
- Dev creates branch: `feature/supplier-profile`
- Dev opens PR
- PR merged → Issue closes → Notion status → Complete

### Example 2: Bug Report Flow

**Developer:**
1. Creates GitHub issue: "Fix auth token refresh"
2. Labels: `epic-carbon`, `priority-p0`, `bug`
3. Assigns to self

**What happens:**
- 2 min later: Notion page appears
- PM sees in Feature Tracker
- PM links to "Sprint 1"
- PM adds to metrics: "Auth Success Rate"

### Example 3: Sprint Planning Flow

**Engineering Lead:**
1. Opens Sprint Planning in Notion
2. Creates "Sprint 3 (Week 9-12)"
3. Links 5 features from Feature Tracker
4. Sets sprint goal and dates

**Team:**
- Developers see linked features
- As work completes, GitHub issues close
- Notion statuses update automatically
- PRs tracked in Sprint Planning

---

## 🎯 Next Steps

### Immediate (Today)

- [ ] Run `./scripts/setup-notion-sync.sh`
- [ ] Connect integration to all 4 databases
- [ ] Run `./scripts/test-notion-sync.sh`
- [ ] Verify test issue appears in Notion
- [ ] Create test page in Notion, verify issue in GitHub

### This Week

- [ ] Add relation properties (see full guide)
- [ ] Populate sample data
- [ ] Train team on workflow
- [ ] Create first real features in Notion

### Ongoing

- [ ] Monitor workflow runs weekly
- [ ] Review sync accuracy
- [ ] Adjust labels/mappings as needed
- [ ] Gather team feedback

---

## 📚 Additional Resources

- **Full Configuration Guide:** `LITHIUM_LUX_NOTION_SYNC_CONFIG.md`
- **Workflow File:** `.github/workflows/notion-github-sync.yml`
- **Setup Script:** `scripts/setup-notion-sync.sh`
- **Test Script:** `scripts/test-notion-sync.sh`

---

## 🆘 Getting Help

### Check Logs
```bash
# Workflow logs
gh run list --workflow=notion-github-sync.yml
gh run view [RUN_ID] --log

# Git status
git status
git log --oneline -5
```

### Common Commands
```bash
# List issues with labels
gh issue list --label epic-carbon
gh issue list --label priority-p0

# Manually trigger sync
gh workflow run notion-github-sync.yml

# View database in Notion
open "https://www.notion.so/1d7c583a519644e791bb10dd81913ce7"
```

---

**Setup Status:** ✅ Workflow Deployed, Ready for Configuration
**Last Updated:** December 11, 2025
**Version:** 1.0
