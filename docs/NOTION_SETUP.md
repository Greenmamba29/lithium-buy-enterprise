# Notion GitHub Integration Setup

This guide will help you set up the Notion database and configure the GitHub-Notion integration.

## Prerequisites

- A Notion account
- Admin access to your GitHub repository
- Access to GitHub repository settings (for adding secrets)

## Step 1: Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **+ New integration**
3. Name your integration (e.g., "GitHub Issues Sync")
4. Select the workspace where you want to create the database
5. Click **Submit**
6. Copy the **Internal Integration Token** (this is your `NOTION_API_KEY`)

## Step 2: Create a Notion Database

1. Open Notion and navigate to the workspace you selected
2. Create a new page or use an existing one
3. Add a new **Database** (choose "Table" view)
4. Name your database (e.g., "GitHub Issues")

## Step 3: Configure Database Properties

Add the following properties to your database with the exact names and types:

| Property Name | Property Type | Configuration |
|---------------|---------------|---------------|
| **Title** | Title | (default property, rename if needed) |
| **Status** | Select | Options: `open`, `closed` |
| **GitHub URL** | URL | - |
| **Issue Number** | Number | - |
| **Synced to GitHub** | Checkbox | - |

### How to Add Properties:

1. Click the **+** button in the table header to add a new property
2. Type the property name exactly as shown above
3. Select the appropriate property type from the dropdown
4. For **Status**, add two options: `open` and `closed`

## Step 4: Share Database with Integration

1. Open your Notion database
2. Click the **...** menu in the top right
3. Scroll down and click **Add connections**
4. Search for and select your integration (e.g., "GitHub Issues Sync")
5. Click **Confirm**

## Step 5: Get Database ID

1. Open your Notion database as a full page
2. Copy the URL from your browser
3. The database ID is the string between the workspace name and the `?v=`
   - URL format: `https://www.notion.so/workspace/{database_id}?v=...`
   - Example: If URL is `https://www.notion.so/myworkspace/a1b2c3d4e5f6...?v=...`
   - Database ID is: `a1b2c3d4e5f6...`

## Step 6: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Add the following repository secrets:

| Secret Name | Value |
|-------------|-------|
| `NOTION_API_KEY` | Your integration token from Step 1 |
| `NOTION_DATABASE_ID` | Your database ID from Step 5 |

## Step 7: Test the Integration

### Option 1: Create a Test Issue

1. Go to your GitHub repository
2. Click **Issues** > **New issue**
3. Title: "Test Notion Sync"
4. Description: "Testing the GitHub-Notion integration"
5. Click **Submit new issue**
6. The workflow should automatically trigger and sync the issue to Notion

### Option 2: Manually Trigger the Workflow

Using GitHub CLI:
```bash
gh workflow run notion-sync.yml
```

Or via GitHub UI:
1. Go to **Actions** tab
2. Select **Notion Sync** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Verification

After creating a test issue or manually triggering the workflow:

1. Go to your Notion database
2. Check if a new row appears with:
   - **Title**: The issue title
   - **Status**: `open` or `closed`
   - **GitHub URL**: Link to the GitHub issue
   - **Issue Number**: The issue number
   - **Synced to GitHub**: ✓ (checked)

## Troubleshooting

### Workflow fails with "Missing required environment variables"
- Verify that `NOTION_API_KEY` and `NOTION_DATABASE_ID` are set in GitHub Secrets
- Check that secret names match exactly (case-sensitive)

### Workflow fails with "object not found"
- Verify the database ID is correct
- Ensure the integration has been added to the database (Step 4)

### Properties not syncing correctly
- Check that property names in Notion match exactly (case-sensitive):
  - `Title`
  - `Status`
  - `GitHub URL`
  - `Issue Number`
  - `Synced to GitHub`
- Verify property types are correct

### Status shows as empty
- Ensure the Status property has options for `open` and `closed`
- Check that option names are lowercase

## Workflow Triggers

The Notion sync workflow automatically triggers on:
- New issues created
- Issues edited
- Issues closed
- Issues reopened
- Manual workflow dispatch

## Next Steps

- Customize the sync script in `scripts/sync-issue-to-notion.ts` for additional fields
- Add bidirectional sync (Notion → GitHub)
- Set up automated issue labeling based on Notion properties
