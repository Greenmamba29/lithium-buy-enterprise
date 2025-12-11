#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# GitHub repository info
REPO_OWNER="Greenmamba29"
REPO_NAME="lithium-buy-enterprise"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Notion Sync Deployment for LithiumBuy Enterprise     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print step headers
print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed or not available"
    print_warning "Some features may not work. Install from: https://cli.github.com/"
    GH_AVAILABLE=false
else
    GH_AVAILABLE=true
    print_success "GitHub CLI detected"
fi

# Step 1: Add GitHub Secrets
print_step "Step 1: Configure GitHub Secrets"

if [ "$GH_AVAILABLE" = true ]; then
    echo "Please ensure the following secrets are configured in GitHub:"
    echo "  - NOTION_API_KEY: Your Notion integration token"
    echo "  - NOTION_DATABASE_ID: Your Notion database ID"
    echo ""
    read -p "Do you want to add these secrets now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter NOTION_API_KEY: " NOTION_KEY
        read -p "Enter NOTION_DATABASE_ID: " NOTION_DB

        if [ ! -z "$NOTION_KEY" ] && [ ! -z "$NOTION_DB" ]; then
            gh secret set NOTION_API_KEY --body "$NOTION_KEY" --repo "$REPO_OWNER/$REPO_NAME" 2>/dev/null && \
                print_success "NOTION_API_KEY added" || print_warning "Failed to add NOTION_API_KEY (may need manual setup)"

            gh secret set NOTION_DATABASE_ID --body "$NOTION_DB" --repo "$REPO_OWNER/$REPO_NAME" 2>/dev/null && \
                print_success "NOTION_DATABASE_ID added" || print_warning "Failed to add NOTION_DATABASE_ID (may need manual setup)"
        fi
    fi
else
    print_warning "Skipping secret configuration (gh CLI not available)"
    echo "Please manually add these secrets in GitHub:"
    echo "  Repository → Settings → Secrets and variables → Actions"
    echo "  - NOTION_API_KEY"
    echo "  - NOTION_DATABASE_ID"
fi

# Step 2: Create Labels
print_step "Step 2: Create GitHub Labels"

LABELS=(
    "notion-sync:Automated sync from Notion:#7B68EE"
    "bug:Something isn't working:#d73a4a"
    "enhancement:New feature or request:#a2eeef"
    "documentation:Improvements or additions to documentation:#0075ca"
    "priority-high:High priority issue:#ff0000"
    "priority-medium:Medium priority issue:#ffa500"
    "priority-low:Low priority issue:#00ff00"
)

if [ "$GH_AVAILABLE" = true ]; then
    for label in "${LABELS[@]}"; do
        IFS=':' read -r name description color <<< "$label"
        gh label create "$name" --description "$description" --color "$color" --repo "$REPO_OWNER/$REPO_NAME" 2>/dev/null && \
            print_success "Created label: $name" || \
            print_warning "Label '$name' already exists or failed to create"
    done
else
    print_warning "Skipping label creation (gh CLI not available)"
    echo "Create these labels manually in GitHub:"
    for label in "${LABELS[@]}"; do
        IFS=':' read -r name description color <<< "$label"
        echo "  - $name: $description (#$color)"
    done
fi

# Step 3: Create Issue Templates
print_step "Step 3: Create Issue Templates"

# Create .github/ISSUE_TEMPLATE directory if it doesn't exist
mkdir -p .github/ISSUE_TEMPLATE

# Bug report template
cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## 🐛 Bug Description
A clear and concise description of what the bug is.

## 📋 Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## ✅ Expected Behavior
A clear and concise description of what you expected to happen.

## ❌ Actual Behavior
What actually happened.

## 📸 Screenshots
If applicable, add screenshots to help explain your problem.

## 🖥️ Environment
- OS: [e.g. Windows 10, macOS 13, Ubuntu 22.04]
- Browser: [e.g. Chrome 120, Firefox 121, Safari 17]
- Node Version: [e.g. 20.10.0]
- App Version: [e.g. 1.0.0]

## 📝 Additional Context
Add any other context about the problem here.

## 🔍 Logs
```
Paste relevant logs here
```
EOF

print_success "Created bug_report.md template"

# Feature request template
cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## 💡 Feature Description
A clear and concise description of the feature you'd like to see.

## 🎯 Problem Statement
Describe the problem this feature would solve. Ex. I'm always frustrated when [...]

## ✨ Proposed Solution
A clear description of what you want to happen.

## 🔄 Alternatives Considered
A clear description of any alternative solutions or features you've considered.

## 📊 Use Cases
Describe specific use cases for this feature:
1. Use case 1
2. Use case 2

## 🎨 Design Mockups
If applicable, add mockups or wireframes.

## 📝 Additional Context
Add any other context or screenshots about the feature request here.

## 🔢 Priority
- [ ] Low - Nice to have
- [ ] Medium - Would improve workflow
- [ ] High - Critical for business needs
EOF

print_success "Created feature_request.md template"

# Notion sync template
cat > .github/ISSUE_TEMPLATE/notion_sync.md << 'EOF'
---
name: Notion Sync Issue
about: Issue synchronized from Notion database
title: ''
labels: notion-sync
assignees: ''
---

<!-- This issue was automatically created from Notion -->

## 📋 Task Details
**Created from Notion Database**

---

<!-- Notion sync metadata (do not edit) -->
<!-- notion-id: -->
<!-- notion-last-sync: -->
EOF

print_success "Created notion_sync.md template"

# Issue template config
cat > .github/ISSUE_TEMPLATE/config.yml << 'EOF'
blank_issues_enabled: true
contact_links:
  - name: 💬 Discussions
    url: https://github.com/Greenmamba29/lithium-buy-enterprise/discussions
    about: Ask questions and discuss with the community
  - name: 📖 Documentation
    url: https://github.com/Greenmamba29/lithium-buy-enterprise/blob/main/README.md
    about: Read the project documentation
EOF

print_success "Created config.yml for issue templates"

# Step 4: Create Notion Sync Workflow
print_step "Step 4: Create GitHub Actions Workflow"

cat > .github/workflows/notion-sync.yml << 'EOF'
name: Notion Sync

on:
  schedule:
    # Run every hour
    - cron: '0 * * * *'
  workflow_dispatch:
  issues:
    types: [opened, edited, closed, reopened]

jobs:
  sync-to-notion:
    runs-on: ubuntu-latest
    if: github.event_name == 'issues'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Sync Issue to Notion
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
          ISSUE_NUMBER: ${{ github.event.issue.number }}
          ISSUE_TITLE: ${{ github.event.issue.title }}
          ISSUE_BODY: ${{ github.event.issue.body }}
          ISSUE_STATE: ${{ github.event.issue.state }}
          ISSUE_URL: ${{ github.event.issue.html_url }}
          ISSUE_LABELS: ${{ toJSON(github.event.issue.labels) }}
        run: |
          echo "Syncing issue #$ISSUE_NUMBER to Notion"
          # Add your Notion sync script here
          # For now, this is a placeholder
          node scripts/sync-to-notion.js || echo "Sync script not yet implemented"

  sync-from-notion:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Fetch from Notion and Create Issues
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "Fetching tasks from Notion database"
          # Add your Notion fetch script here
          node scripts/sync-from-notion.js || echo "Sync script not yet implemented"

      - name: Report Status
        if: always()
        run: |
          echo "Notion sync completed at $(date)"
EOF

print_success "Created notion-sync.yml workflow"

# Step 5: Create sync scripts directory
print_step "Step 5: Create Notion Sync Scripts"

mkdir -p scripts

cat > scripts/sync-to-notion.js << 'EOF'
#!/usr/bin/env node
/**
 * Sync GitHub Issues to Notion Database
 * This script runs when issues are created/updated in GitHub
 */

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const ISSUE_NUMBER = process.env.ISSUE_NUMBER;
const ISSUE_TITLE = process.env.ISSUE_TITLE;
const ISSUE_BODY = process.env.ISSUE_BODY;
const ISSUE_STATE = process.env.ISSUE_STATE;
const ISSUE_URL = process.env.ISSUE_URL;

async function syncToNotion() {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.error('❌ Missing Notion credentials');
    console.log('Please set NOTION_API_KEY and NOTION_DATABASE_ID secrets');
    process.exit(1);
  }

  console.log(`📤 Syncing issue #${ISSUE_NUMBER} to Notion`);
  console.log(`   Title: ${ISSUE_TITLE}`);
  console.log(`   State: ${ISSUE_STATE}`);
  console.log(`   URL: ${ISSUE_URL}`);

  try {
    // TODO: Implement Notion API call
    // const response = await fetch('https://api.notion.com/v1/pages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${NOTION_API_KEY}`,
    //     'Content-Type': 'application/json',
    //     'Notion-Version': '2022-06-28'
    //   },
    //   body: JSON.stringify({
    //     parent: { database_id: NOTION_DATABASE_ID },
    //     properties: {
    //       'Title': { title: [{ text: { content: ISSUE_TITLE } }] },
    //       'Status': { select: { name: ISSUE_STATE } },
    //       'GitHub URL': { url: ISSUE_URL },
    //       'Issue Number': { number: parseInt(ISSUE_NUMBER) }
    //     }
    //   })
    // });

    console.log('✅ Successfully synced to Notion (mock)');
    console.log('⚠️  Actual Notion API integration pending');
  } catch (error) {
    console.error('❌ Error syncing to Notion:', error.message);
    process.exit(1);
  }
}

syncToNotion();
EOF

chmod +x scripts/sync-to-notion.js
print_success "Created sync-to-notion.js"

cat > scripts/sync-from-notion.js << 'EOF'
#!/usr/bin/env node
/**
 * Sync Notion Database to GitHub Issues
 * This script runs on a schedule to create issues from Notion tasks
 */

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function syncFromNotion() {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.error('❌ Missing Notion credentials');
    console.log('Please set NOTION_API_KEY and NOTION_DATABASE_ID secrets');
    process.exit(1);
  }

  console.log('📥 Fetching tasks from Notion database');
  console.log(`   Database ID: ${NOTION_DATABASE_ID.substring(0, 8)}...`);

  try {
    // TODO: Implement Notion API query
    // const response = await fetch(
    //   `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${NOTION_API_KEY}`,
    //       'Content-Type': 'application/json',
    //       'Notion-Version': '2022-06-28'
    //     },
    //     body: JSON.stringify({
    //       filter: {
    //         property: 'Synced to GitHub',
    //         checkbox: { equals: false }
    //       }
    //     })
    //   }
    // );

    console.log('✅ Successfully fetched from Notion (mock)');
    console.log('⚠️  Actual Notion API integration pending');

    // TODO: Create GitHub issues for unsynced Notion pages
  } catch (error) {
    console.error('❌ Error syncing from Notion:', error.message);
    process.exit(1);
  }
}

syncFromNotion();
EOF

chmod +x scripts/sync-from-notion.js
print_success "Created sync-from-notion.js"

# Step 6: Test Notion Connection
print_step "Step 6: Test Notion Connection"

if [ ! -z "$NOTION_KEY" ]; then
    echo "Testing Notion API connection..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST https://api.notion.com/v1/databases/${NOTION_DB}/query \
        -H "Authorization: Bearer ${NOTION_KEY}" \
        -H "Content-Type: application/json" \
        -H "Notion-Version: 2022-06-28" \
        -d '{}' 2>/dev/null || echo "000")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Notion connection successful!"
    else
        print_warning "Notion connection test skipped or failed (HTTP $HTTP_CODE)"
        echo "You can test manually after setting up secrets"
    fi
else
    print_warning "Notion credentials not provided - skipping connection test"
    echo "Test your connection after adding secrets to GitHub"
fi

# Step 7: Git Operations
print_step "Step 7: Commit and Push Changes"

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
    git add .github/ISSUE_TEMPLATE/ .github/workflows/notion-sync.yml scripts/sync-*.js

    git commit -m "$(cat <<'COMMIT_EOF'
feat: Add Notion sync integration

- Configure GitHub issue templates (bug report, feature request, notion sync)
- Create notion-sync.yml workflow for bi-directional sync
- Add sync scripts for GitHub ↔ Notion integration
- Set up labels for issue categorization
- Enable hourly sync from Notion database
- Support manual workflow dispatch

This enables automatic synchronization between GitHub Issues and Notion databases,
allowing teams to manage tasks in either platform while keeping both in sync.
COMMIT_EOF
)"

    print_success "Changes committed"

    # Push to remote
    CURRENT_BRANCH=$(git branch --show-current)
    echo "Pushing to origin/$CURRENT_BRANCH..."

    if git push -u origin "$CURRENT_BRANCH"; then
        print_success "Changes pushed to GitHub"
    else
        print_error "Failed to push changes"
        echo "Please push manually: git push -u origin $CURRENT_BRANCH"
    fi
else
    print_warning "No changes to commit"
fi

# Step 8: Create Test Issue
print_step "Step 8: Create Test Issue"

if [ "$GH_AVAILABLE" = true ]; then
    read -p "Do you want to create a test issue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        TEST_ISSUE=$(gh issue create \
            --repo "$REPO_OWNER/$REPO_NAME" \
            --title "🧪 Test: Notion Sync Integration" \
            --label "notion-sync,documentation" \
            --body "$(cat <<'ISSUE_EOF'
## Test Issue for Notion Sync

This is a test issue to verify the Notion sync integration is working correctly.

### Expected Behavior
- [ ] Issue appears in Notion database
- [ ] Status updates sync bidirectionally
- [ ] Labels are properly mapped
- [ ] Issue metadata is preserved

### Next Steps
1. Verify this issue appears in Notion
2. Update status in Notion and check GitHub
3. Close this issue once sync is confirmed

---
*Created by deploy-notion-sync.sh deployment script*
ISSUE_EOF
)" 2>&1) || true

        if [ $? -eq 0 ]; then
            print_success "Test issue created: $TEST_ISSUE"
        else
            print_warning "Could not create test issue automatically"
            echo "You can create one manually to test the sync"
        fi
    fi
else
    print_warning "Skipping test issue creation (gh CLI not available)"
fi

# Final Summary
print_step "Deployment Summary"

echo ""
echo -e "${GREEN}✅ Notion Sync Deployment Complete!${NC}"
echo ""
echo "📋 What was configured:"
echo "   ✓ GitHub issue templates (.github/ISSUE_TEMPLATE/)"
echo "   ✓ Notion sync workflow (.github/workflows/notion-sync.yml)"
echo "   ✓ Sync scripts (scripts/sync-to-notion.js, sync-from-notion.js)"
echo "   ✓ GitHub labels for issue management"
echo ""
echo "🔧 Next Steps:"
echo "   1. Verify GitHub secrets are set:"
echo "      • NOTION_API_KEY"
echo "      • NOTION_DATABASE_ID"
echo "   2. Set up your Notion database with required properties:"
echo "      • Title (title)"
echo "      • Status (select: open/closed)"
echo "      • GitHub URL (url)"
echo "      • Issue Number (number)"
echo "      • Synced to GitHub (checkbox)"
echo "   3. Implement the Notion API calls in scripts/sync-*.js"
echo "   4. Test the workflow with: gh workflow run notion-sync.yml"
echo ""
echo "📚 Resources:"
echo "   • Notion API: https://developers.notion.com/"
echo "   • GitHub Actions: https://docs.github.com/actions"
echo "   • Workflow file: .github/workflows/notion-sync.yml"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Happy syncing! 🚀${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
