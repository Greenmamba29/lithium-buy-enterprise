#!/bin/bash

# Create GitHub Labels for Notion Sync
# This script creates all required labels for the Notion-GitHub sync workflow

set -e

echo "🏷️  Creating GitHub Labels for Notion Sync"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

echo "Creating Epic Labels..."
echo "----------------------"

# Epic Labels (Purple/Blue)
gh label create "epic-carbon" --description "Epic 1: Carbon Calculator" --color "7057ff" 2>/dev/null || echo "  ⚠️  epic-carbon already exists"
gh label create "epic-3pl" --description "Epic 2: 3PL Middleware" --color "0e8a16" 2>/dev/null || echo "  ⚠️  epic-3pl already exists"
gh label create "epic-auctions" --description "Epic 3: Spot Auctions" --color "fbca04" 2>/dev/null || echo "  ⚠️  epic-auctions already exists"
gh label create "epic-green" --description "Epic 4: Green Directory" --color "006b75" 2>/dev/null || echo "  ⚠️  epic-green already exists"

echo ""
echo "Creating Priority Labels..."
echo "---------------------------"

# Priority Labels (Red to Yellow gradient)
gh label create "priority-p0" --description "P0-Critical: Highest priority" --color "d93f0b" 2>/dev/null || echo "  ⚠️  priority-p0 already exists"
gh label create "priority-p1" --description "P1-High: High priority" --color "ff6b6b" 2>/dev/null || echo "  ⚠️  priority-p1 already exists"
gh label create "priority-p2" --description "P2-Medium: Medium priority" --color "fbca04" 2>/dev/null || echo "  ⚠️  priority-p2 already exists"
gh label create "priority-p3" --description "P3-Low: Low priority" --color "c5def5" 2>/dev/null || echo "  ⚠️  priority-p3 already exists"

echo ""
echo "Creating Status Labels..."
echo "-------------------------"

# Status Labels (for manual tagging)
gh label create "in-progress" --description "Currently being worked on" --color "0052cc" 2>/dev/null || echo "  ⚠️  in-progress already exists"
gh label create "testing" --description "In testing phase" --color "f9d0c4" 2>/dev/null || echo "  ⚠️  testing already exists"

echo ""
echo "Creating Type Labels..."
echo "-----------------------"

# Additional useful labels
gh label create "bug" --description "Bug or defect" --color "d73a4a" 2>/dev/null || echo "  ⚠️  bug already exists"
gh label create "enhancement" --description "New feature or enhancement" --color "a2eeef" 2>/dev/null || echo "  ⚠️  enhancement already exists"
gh label create "documentation" --description "Documentation updates" --color "0075ca" 2>/dev/null || echo "  ⚠️  documentation already exists"

echo ""
echo -e "${GREEN}✅ Label creation complete!${NC}"
echo ""
echo "View all labels:"
echo "  gh label list"
echo ""
echo "Or visit:"
echo "  https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/labels"
echo ""
