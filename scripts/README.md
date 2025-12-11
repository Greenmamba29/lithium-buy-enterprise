# Scripts Directory

This directory contains automation scripts for the Lithium Buy Enterprise project.

## Notion-GitHub Sync Scripts

### setup-notion-sync.sh

Automated setup script for configuring GitHub secrets required for Notion-GitHub bidirectional sync.

**Usage:**
```bash
chmod +x scripts/setup-notion-sync.sh
./scripts/setup-notion-sync.sh
```

**What it does:**
- Prompts for Notion Integration Token
- Configures all 5 GitHub repository secrets
- Verifies configuration
- Provides next steps

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- Notion integration created
- Repository access

### test-notion-sync.sh

Comprehensive test suite for validating Notion-GitHub sync functionality.

**Usage:**
```bash
chmod +x scripts/test-notion-sync.sh
./scripts/test-notion-sync.sh
```

**What it tests:**
- GitHub secrets configuration
- GitHub → Notion sync (creates test issue)
- Workflow execution
- Provides instructions for Notion → GitHub testing

**Output:**
- Colored status indicators
- Test summary checklist
- Links to verify results

## Additional Scripts

More automation scripts will be added as the project grows.

## Documentation

For detailed information about the Notion-GitHub sync:
- **Quick Start:** `docs/NOTION_SYNC_QUICK_START.md`
- **Test Results:** `docs/NOTION_SYNC_TEST_RESULTS.md`
- **Full Config:** `LITHIUM_LUX_NOTION_SYNC_CONFIG.md` (in project root)

## Support

Run `./scripts/test-notion-sync.sh` for troubleshooting help or check the documentation files.
