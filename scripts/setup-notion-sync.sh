#!/bin/bash

# Notion-GitHub Sync Setup Script
# This script helps configure GitHub secrets for Notion integration

set -e

echo "🚀 Notion-GitHub Sync Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI found${NC}"
echo ""

# Database IDs from the configuration
FEATURE_DB="bc6b0c4e-dd57-4e52-a72d-666408edd7ba"
METRICS_DB="f6d08cc9-825e-44e8-bf4b-003f845ce9c5"
ARCHITECTURE_DB="aaf4f126-c46a-46c4-b0c6-a5fbc89564a9"
SPRINT_DB="ac6f0276-752a-462a-8a7e-ef16798e1e35"

# Step 1: Get Notion Integration Token
echo "Step 1: Notion Integration Token"
echo "--------------------------------"
echo ""
echo "To get your Notion Integration Token:"
echo "1. Go to https://www.notion.so/my-integrations"
echo "2. Click 'New integration'"
echo "3. Name: 'Lithium Lux GitHub Sync'"
echo "4. Select workspace: 'Casius's Workspace'"
echo "5. Copy the token"
echo ""
read -p "Enter your Notion Integration Token: " NOTION_TOKEN

if [ -z "$NOTION_TOKEN" ]; then
    echo -e "${RED}❌ Token cannot be empty${NC}"
    exit 1
fi

echo ""
echo "Step 2: Setting GitHub Secrets"
echo "--------------------------------"
echo ""

# Set secrets
echo "Setting NOTION_TOKEN..."
echo "$NOTION_TOKEN" | gh secret set NOTION_TOKEN

echo "Setting NOTION_FEATURE_DB..."
echo "$FEATURE_DB" | gh secret set NOTION_FEATURE_DB

echo "Setting NOTION_METRICS_DB..."
echo "$METRICS_DB" | gh secret set NOTION_METRICS_DB

echo "Setting NOTION_ARCHITECTURE_DB..."
echo "$ARCHITECTURE_DB" | gh secret set NOTION_ARCHITECTURE_DB

echo "Setting NOTION_SPRINT_DB..."
echo "$SPRINT_DB" | gh secret set NOTION_SPRINT_DB

echo ""
echo -e "${GREEN}✓ All secrets have been set!${NC}"
echo ""

# Step 3: Verify secrets
echo "Step 3: Verifying Secrets"
echo "--------------------------------"
echo ""
echo "Configured secrets:"
gh secret list

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next Steps:"
echo "1. Connect the integration to your Notion databases:"
echo "   - Feature Tracker: https://www.notion.so/1d7c583a519644e791bb10dd81913ce7"
echo "   - Success Metrics: https://www.notion.so/9e844c21d96f4ef08269a00f8fd51379"
echo "   - Architecture: https://www.notion.so/92d5e7b6e10b4d29be3f2fe44d92858e"
echo "   - Sprint Planning: https://www.notion.so/60228527636544cbbb38f20ab02378fb"
echo ""
echo "   For each database:"
echo "   a) Click '...' menu (top right)"
echo "   b) Scroll to 'Connections'"
echo "   c) Click '+ Add connection'"
echo "   d) Select 'Lithium Lux GitHub Sync'"
echo ""
echo "2. Run the test script: ./scripts/test-notion-sync.sh"
echo ""
