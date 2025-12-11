#!/bin/bash

# Notion-GitHub Sync Test Script
# This script tests the bidirectional sync between GitHub and Notion

set -e

echo "🧪 Notion-GitHub Sync Test Suite"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI found${NC}"
echo ""

# Test 1: Verify Secrets
echo "Test 1: Verify GitHub Secrets"
echo "------------------------------"
echo ""

SECRETS=$(gh secret list 2>&1)

if echo "$SECRETS" | grep -q "NOTION_TOKEN"; then
    echo -e "${GREEN}✓ NOTION_TOKEN configured${NC}"
else
    echo -e "${RED}❌ NOTION_TOKEN missing${NC}"
    echo "Run: ./scripts/setup-notion-sync.sh"
    exit 1
fi

if echo "$SECRETS" | grep -q "NOTION_FEATURE_DB"; then
    echo -e "${GREEN}✓ NOTION_FEATURE_DB configured${NC}"
else
    echo -e "${RED}❌ NOTION_FEATURE_DB missing${NC}"
    exit 1
fi

if echo "$SECRETS" | grep -q "NOTION_METRICS_DB"; then
    echo -e "${GREEN}✓ NOTION_METRICS_DB configured${NC}"
else
    echo -e "${RED}❌ NOTION_METRICS_DB missing${NC}"
    exit 1
fi

if echo "$SECRETS" | grep -q "NOTION_ARCHITECTURE_DB"; then
    echo -e "${GREEN}✓ NOTION_ARCHITECTURE_DB configured${NC}"
else
    echo -e "${RED}❌ NOTION_ARCHITECTURE_DB missing${NC}"
    exit 1
fi

if echo "$SECRETS" | grep -q "NOTION_SPRINT_DB"; then
    echo -e "${GREEN}✓ NOTION_SPRINT_DB configured${NC}"
else
    echo -e "${RED}❌ NOTION_SPRINT_DB missing${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All secrets configured correctly${NC}"
echo ""

# Test 2: Create Test Issue (GitHub → Notion)
echo "Test 2: GitHub → Notion Sync"
echo "----------------------------"
echo ""

read -p "Create a test GitHub issue? (y/n): " CREATE_ISSUE

if [ "$CREATE_ISSUE" = "y" ]; then
    echo ""
    echo "Creating test issue..."

    ISSUE_URL=$(gh issue create \
        --title "Test: Notion Sync - Data Governance Setup" \
        --body "**Test Issue for Notion-GitHub Sync**

## Purpose
This is a test issue to verify the GitHub → Notion sync is working correctly.

## Acceptance Criteria
- AC1: Issue appears in Notion Feature Tracker within 2 minutes
- AC2: Issue has correct epic label (epic-carbon)
- AC3: Issue has correct priority label (priority-p0)
- AC4: GitHub issue number and URL are populated in Notion

## Test Steps
1. Create this issue
2. Wait 2 minutes
3. Check Notion Feature Tracker: https://www.notion.so/1d7c583a519644e791bb10dd81913ce7
4. Verify all properties are synced correctly

## Expected Result
New page in Notion Feature Tracker with:
- Name: Test: Notion Sync - Data Governance Setup
- Status: Backlog
- Priority: P0-Critical
- Epic: Epic 1: Carbon Calculator
- GitHub Issue: #[number]
- GitHub URL: [this issue's URL]" \
        --label "epic-carbon" \
        --label "priority-p0")

    ISSUE_NUMBER=$(echo "$ISSUE_URL" | grep -oP '#\K\d+')

    echo ""
    echo -e "${GREEN}✅ Test issue created: ${ISSUE_URL}${NC}"
    echo ""
    echo -e "${YELLOW}Action Required:${NC}"
    echo "1. Wait 2 minutes for GitHub Actions to run"
    echo "2. Check Notion Feature Tracker:"
    echo "   https://www.notion.so/1d7c583a519644e791bb10dd81913ce7"
    echo "3. Look for: 'Test: Notion Sync - Data Governance Setup'"
    echo "4. Verify properties match the issue"
    echo ""
    echo "GitHub Actions URL:"
    echo "   https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
    echo ""
fi

# Test 3: Workflow Status
echo "Test 3: GitHub Actions Workflow"
echo "--------------------------------"
echo ""

read -p "Check workflow runs? (y/n): " CHECK_WORKFLOW

if [ "$CHECK_WORKFLOW" = "y" ]; then
    echo ""
    echo "Recent workflow runs:"
    gh run list --workflow=notion-github-sync.yml --limit 5

    echo ""
    echo -e "${BLUE}To view detailed logs:${NC}"
    echo "gh run view [RUN_ID]"
    echo ""
fi

# Test 4: Manual Notion → GitHub Test
echo ""
echo "Test 4: Notion → GitHub Sync"
echo "----------------------------"
echo ""
echo "To test Notion → GitHub sync:"
echo ""
echo "1. Open Feature Tracker:"
echo "   https://www.notion.so/1d7c583a519644e791bb10dd81913ce7"
echo ""
echo "2. Create a new page with:"
echo "   Name: Test: Carbon Calculator API"
echo "   Status: Planning"
echo "   Priority: P1-High"
echo "   Epic: Epic 1: Carbon Calculator"
echo "   Story Points: 5"
echo ""
echo "3. Save and wait 15 minutes (next scheduled sync)"
echo ""
echo "4. Check GitHub issues:"
echo "   gh issue list --label epic-carbon"
echo ""
echo "5. Look for 'Test: Carbon Calculator API'"
echo ""

# Summary
echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
echo ""
echo -e "${GREEN}✓ Secrets configured${NC}"
if [ "$CREATE_ISSUE" = "y" ]; then
    echo -e "${GREEN}✓ Test issue created: $ISSUE_URL${NC}"
fi
echo ""
echo "Checklist:"
echo "□ GitHub → Notion sync verified (check Notion in 2 min)"
echo "□ Notion database connections configured"
echo "□ Notion → GitHub sync tested (wait 15 min after creating Notion page)"
echo "□ Issue status updates work (close an issue, check Notion)"
echo "□ PR tracking works (merge a PR, check Sprint Planning)"
echo ""
