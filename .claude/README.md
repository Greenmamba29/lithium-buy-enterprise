# Claude Code Configuration

This directory contains configuration for Claude Code integration with external services.

## Notion MCP Integration

This project is configured to use the Notion Model Context Protocol (MCP) server, which allows Claude Code to:
- Search your Notion workspace
- Read page content
- Create new pages
- Query databases

### Setup Instructions

#### 1. Get Your Notion Token

1. Visit [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Give it a name (e.g., "LithiumBuy Claude Code")
4. Select your workspace
5. Click **"Submit"**
6. Copy the **Internal Integration Token** (starts with `ntn_`)

#### 2. Configure Your Environment

Add the token to your `.env` file:

```bash
echo "NOTION_TOKEN=ntn_your_token_here" >> .env
```

Or export it in your shell:

```bash
export NOTION_TOKEN=ntn_your_token_here
```

#### 3. Share Notion Pages with Integration

For Claude Code to access your Notion pages:

1. Open any Notion page you want Claude to access
2. Click **"Share"** in the top-right
3. Click **"Invite"** and select your integration
4. Repeat for all pages/databases you want Claude to access

#### 4. Using with Claude Code Web

When using Claude Code on the web (claude.ai), the MCP server will automatically load if:
- Your `.env` file contains `NOTION_TOKEN`
- The Notion API is accessible from the web environment
- You've shared the relevant pages with your integration

#### 5. Testing the Integration

Once configured, you can ask Claude:
- "Search my Notion workspace for X"
- "Show me all pages in my Notion"
- "Create a new page in Notion with..."
- "What's in my Notion database about Y?"

### Troubleshooting

**No Notion tools available:**
- Ensure `NOTION_TOKEN` is set in your environment
- Restart Claude Code to reload the MCP configuration
- Check that you're using Claude Code Web (not CLI, which may have network restrictions)

**403 Forbidden errors:**
- Verify your token is correct (copy it again from Notion)
- Make sure you've shared pages with your integration
- Check that the token hasn't expired

**MCP server not loading:**
- The MCP configuration requires internet access to `api.notion.com`
- Some network environments (corporate firewalls, etc.) may block Notion API
- Try using Claude Code Web which typically has better network access

### MCP Configuration

The MCP server configuration is defined in `.claude/mcp.json`. The server uses:
- Package: `@notionhq/notion-mcp-server` (official Notion MCP server)
- Environment variable: `NOTION_TOKEN`
- Command: `npx -y @notionhq/notion-mcp-server`

### Security Notes

- ⚠️ **Never commit your actual token** to version control
- The `NOTION_TOKEN` is kept in `.env` which is gitignored
- Only placeholder values are in `.env.example`
- Your integration token gives full access to shared pages - keep it secure

## Additional Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/claude-code)
