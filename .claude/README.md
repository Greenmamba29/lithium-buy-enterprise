# Claude MCP Configuration

This directory contains Model Context Protocol (MCP) server configurations for Claude Code.

## Notion MCP Server

The Notion MCP server allows Claude to interact with your Notion workspace.

### Setup Instructions

1. **Create a Notion Integration**:
   - Go to https://www.notion.so/my-integrations
   - Click "+ New integration"
   - Give it a name (e.g., "LithiumBuy Claude Integration")
   - Select the workspace you want to use
   - Copy the "Internal Integration Token" (starts with `secret_`)

2. **Configure the Integration Token**:
   - Create a `.env` file in the project root (copy from `.env.example`)
   - Add your Notion integration token:
     ```
     NOTION_TOKEN=secret_your_actual_token_here
     ```

3. **Share Pages with the Integration**:
   - Open the Notion page(s) you want Claude to access
   - Click "Share" → "Invite"
   - Search for your integration name and add it
   - The integration needs explicit access to each page/database

4. **Test the Connection**:
   - The MCP server will automatically start when Claude Code loads
   - Available tools will include Notion operations (search, read, update pages)

### Configuration File

The `mcp.json` file configures the Notion MCP server:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}"
      }
    }
  }
}
```

This configuration:
- Uses `npx` to run the official Notion MCP server package (`@notionhq/notion-mcp-server`)
- The `-y` flag auto-confirms package installation
- Passes the `NOTION_TOKEN` environment variable to the server

### Available Capabilities

Once configured, Claude can:
- Search across your Notion workspace
- Read page content and database entries
- Create and update pages
- Query databases with filters
- Append blocks to existing pages

### Troubleshooting

**Issue**: "NOTION_TOKEN not found"
- **Solution**: Ensure the `.env` file exists and contains the correct token

**Issue**: "Permission denied" errors
- **Solution**: Make sure you've shared the specific Notion pages with your integration

**Issue**: MCP server not starting
- **Solution**: Check that Node.js and npx are installed and accessible

**Issue**: Cannot find pages
- **Solution**: Verify the integration has been added to the pages via the Share menu

### Security Notes

- Never commit your `.env` file to version control
- The `.env.example` file is safe to commit (contains no secrets)
- Notion integration tokens should be treated as passwords
- If a token is compromised, regenerate it at https://www.notion.so/my-integrations

### Additional Resources

- [Notion API Documentation](https://developers.notion.com/)
- [MCP Notion Server](https://github.com/modelcontextprotocol/servers/tree/main/src/notion)
- [Claude MCP Documentation](https://modelcontextprotocol.io/)
