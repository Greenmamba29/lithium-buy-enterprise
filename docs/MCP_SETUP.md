# Notion MCP Setup Guide

This guide explains how to set up the Notion Model Context Protocol (MCP) integration for the LithiumBuy Enterprise project.

## What is MCP?

Model Context Protocol (MCP) is a standardized protocol that allows AI assistants like Claude to interact with external services and APIs. The Notion MCP server enables Claude to read, write, and manage content in your Notion workspace.

## Prerequisites

- Node.js 20+ installed
- A Notion account with workspace access
- Claude Code or Claude Desktop app

## Step-by-Step Setup

### 1. Create a Notion Integration

1. Navigate to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Configure your integration:
   - **Name**: `LithiumBuy Claude Integration` (or any name you prefer)
   - **Associated workspace**: Select your workspace
   - **Capabilities**: Enable the following:
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content
     - ✅ Read comments (optional)
     - ✅ Insert comments (optional)
4. Click **"Submit"**
5. Copy the **"Internal Integration Token"** (starts with `secret_`)
   - ⚠️ Keep this secret! Never commit it to version control

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Notion token:
   ```env
   NOTION_TOKEN=secret_your_actual_token_here
   ```

3. Verify `.env` is in `.gitignore` (it already is)

### 3. Share Notion Pages with the Integration

The integration needs **explicit permission** to access each page or database:

1. Open any Notion page you want Claude to access
2. Click **"Share"** in the top-right corner
3. Click **"Invite"**
4. Search for your integration name (e.g., "LithiumBuy Claude Integration")
5. Click to add it
6. Repeat for all pages/databases you want Claude to access

**Important Notes**:
- The integration inherits permissions from the parent page
- If you share a parent page, all child pages are also accessible
- You can share entire databases to query and update entries

### 4. MCP Configuration

The MCP configuration is already set up in `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    }
  }
}
```

This configuration:
- Uses the official `@notionhq/notion-mcp-server` package
- Runs via `npx` (no global installation needed)
- Automatically picks up `NOTION_TOKEN` from your `.env` file

### 5. Verify the Setup

1. **Check the package can be installed**:
   ```bash
   npx -y @notionhq/notion-mcp-server --help
   ```

   You should see the help output with available options.

2. **Test with a dummy token** (optional):
   ```bash
   NOTION_TOKEN=secret_test npx @notionhq/notion-mcp-server
   ```

   The server should start (it will fail authentication, but that confirms the setup works).

3. **Restart Claude Code**:
   - Close and reopen Claude Code
   - The Notion MCP server will automatically start
   - Look for Notion-related tools in Claude's capabilities

## Available Capabilities

Once configured, Claude can:

- 🔍 **Search** across your entire Notion workspace
- 📄 **Read** page content, properties, and metadata
- ✏️ **Create** new pages and databases
- 🔄 **Update** existing pages and database entries
- 📊 **Query** databases with filters and sorts
- ➕ **Append** blocks to existing pages
- 🏷️ **Manage** page properties and tags

## Usage Examples

### Search for a Page
```
"Find all pages in Notion related to lithium suppliers"
```

### Read Page Content
```
"Read the content from the 'Product Roadmap' page in Notion"
```

### Create a New Page
```
"Create a new page in Notion titled 'Meeting Notes - Dec 11' with today's discussion points"
```

### Update a Database
```
"Add a new entry to the 'Suppliers' database with name 'ABC Mining Co' and location 'Australia'"
```

### Query with Filters
```
"Show me all tasks in Notion that are marked as 'In Progress'"
```

## Troubleshooting

### Issue: "NOTION_TOKEN not found"

**Cause**: The environment variable is not set

**Solution**:
1. Verify `.env` file exists in project root
2. Check it contains: `NOTION_TOKEN=secret_...`
3. Restart Claude Code to reload environment variables

### Issue: "Authentication failed" or "Unauthorized"

**Cause**: Invalid or expired token

**Solution**:
1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Find your integration
3. If needed, click "Show" and copy the token again
4. Update `.env` with the new token
5. Restart Claude Code

### Issue: "Cannot find page" or "Permission denied"

**Cause**: The integration doesn't have access to the page

**Solution**:
1. Open the Notion page in your browser
2. Click "Share" → "Invite"
3. Add your integration to the page
4. Try again in Claude

### Issue: MCP server not starting

**Cause**: Package installation or configuration issue

**Solution**:
1. Verify Node.js is installed: `node --version`
2. Test package manually: `npx @notionhq/notion-mcp-server --help`
3. Check `.claude/mcp.json` for syntax errors
4. Review Claude Code logs for error messages

### Issue: "Rate limit exceeded"

**Cause**: Too many API calls to Notion

**Solution**:
- Wait a few minutes before trying again
- Notion has rate limits (3 requests/second per integration)
- Claude will automatically retry with backoff

## Security Best Practices

1. **Never commit secrets**:
   - ✅ `.env` is already in `.gitignore`
   - ❌ Don't add tokens to code or documentation
   - ❌ Don't share tokens in chat/email

2. **Use workspace-specific integrations**:
   - Create separate integrations for dev/staging/production
   - Limit integration capabilities to what's needed

3. **Regularly rotate tokens**:
   - If a token is compromised, regenerate it immediately
   - Update `.env` with the new token

4. **Audit integration access**:
   - Review which pages have the integration added
   - Remove access from sensitive pages if not needed

5. **Monitor integration activity**:
   - Check Notion's activity log for unexpected changes
   - Review integration permissions periodically

## Architecture

```
┌─────────────────┐
│  Claude Code    │
│   (AI Agent)    │
└────────┬────────┘
         │
         │ MCP Protocol
         │
┌────────▼────────┐      ┌──────────────────┐
│  MCP Server     │      │  Notion API      │
│  (@notionhq/    │◄────►│  (notion.so)     │
│  notion-mcp)    │ HTTP │                  │
└─────────────────┘      └──────────────────┘
         ▲
         │
         │ Environment
         │
┌────────┴────────┐
│  .env           │
│  NOTION_TOKEN   │
└─────────────────┘
```

## Additional Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Official Notion MCP Server (npm)](https://www.npmjs.com/package/@notionhq/notion-mcp-server)
- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- [Claude Code Documentation](https://github.com/anthropics/claude-code)

## Support

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Notion API status: [https://status.notion.so/](https://status.notion.so/)
3. Check Claude Code logs for detailed error messages
4. Open an issue on the project GitHub repository

---

**Last Updated**: December 11, 2025
**MCP Server Version**: @notionhq/notion-mcp-server@1.9.1
