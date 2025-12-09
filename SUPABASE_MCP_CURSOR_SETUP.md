# Supabase MCP Setup for Cursor

## ✅ Configuration Complete

The Supabase MCP server has been configured in Cursor at:
`~/.cursor/mcp.json`

The configuration uses your LithiumBuy project (`vuekwckknfjivjighhfd`) and expects the access token to be provided via environment variable.

## 📋 Next Steps

### 1. Generate a Supabase Personal Access Token

1. Log in to your Supabase account at https://supabase.com/dashboard
2. Navigate to **Settings** → **Access Tokens** (or go to https://supabase.com/dashboard/account/tokens)
3. Click **Create New Token**
4. Give it a descriptive name like "Cursor MCP Server"
5. Copy the generated token immediately (it won't be shown again!)

### 2. Set the Environment Variable

**Important:** Cursor needs to be able to access the environment variable. You have two options:

#### Option A: Set in Shell Profile (Recommended)

Add the access token to your shell profile so it's available when Cursor launches:

**For zsh (macOS default):**
```bash
echo 'export SUPABASE_ACCESS_TOKEN="your-personal-access-token-here"' >> ~/.zshrc
source ~/.zshrc
```

**For bash:**
```bash
echo 'export SUPABASE_ACCESS_TOKEN="your-personal-access-token-here"' >> ~/.bashrc
source ~/.bashrc
```

**For fish:**
```fish
set -Ux SUPABASE_ACCESS_TOKEN "your-personal-access-token-here"
```

**Then restart Cursor** (quit completely and reopen) so it picks up the environment variable.

#### Option B: Set in Cursor's Launch Environment

If Cursor doesn't inherit your shell environment, you may need to:

1. Create or edit `~/.cursor/argv.json` to include environment variables
2. Or launch Cursor from the terminal where the variable is set
3. Or add it to your system's environment (macOS: `launchctl setenv SUPABASE_ACCESS_TOKEN "your-token"`)

### 3. Verify Environment Variable (Optional)

Before restarting Cursor, verify the variable is set:

```bash
echo $SUPABASE_ACCESS_TOKEN
```

This should output your token. If it's empty, make sure you've:
- Added it to the correct shell profile file
- Run `source ~/.zshrc` (or `source ~/.bashrc` for bash)
- Opened a new terminal window

### 4. Restart Cursor

After setting the environment variable, **restart Cursor IDE** completely (quit and reopen) for the changes to take effect.

### 5. Verify the Connection

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to **Features** → **MCP & Integrations** (or search for "MCP")
3. Check that the Supabase MCP server is listed and shows as active/connected
4. If it shows an error, check the troubleshooting section below

## 🧪 Test the Integration

Once configured, you can interact with your Supabase database through natural language in Cursor. Try asking:

- "List all tables in my Supabase database"
- "Show me the schema of the users table"
- "Query the suppliers table"
- "What migrations have been applied to my database?"
- "Show me the logs from the API service"

## 🔐 Security Notes

- **Never commit** your access token to version control
- The access token has access to your Supabase projects - keep it secure
- Using environment variables (as configured) keeps the token out of config files
- Consider rotating the token periodically for security

## 📚 What You Can Do With Supabase MCP

The Supabase MCP server allows you to:

- **Database Operations:**
  - List tables, views, and schemas
  - Execute SQL queries
  - View and apply migrations
  - Check database extensions

- **Project Management:**
  - List projects and organizations
  - Get project details and URLs
  - Manage development branches
  - View project costs

- **Edge Functions:**
  - List and deploy Edge Functions
  - View Edge Function code

- **Monitoring:**
  - View logs from different services (API, Auth, Storage, etc.)
  - Check for security and performance advisors
  - Generate TypeScript types from your database schema

- **Documentation:**
  - Search Supabase documentation
  - Get error code details

All through natural language commands in Cursor!

## 🔧 Alternative Configuration (Direct Token)

If Cursor doesn't pick up the environment variable (common on macOS), you can set it directly in the MCP config. Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref",
        "vuekwckknfjivjighhfd"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-personal-access-token-here"
      }
    }
  }
}
```

**Or use the `--access-token` flag:**

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "your-personal-access-token-here",
        "--project-ref",
        "vuekwckknfjivjighhfd"
      ]
    }
  }
}
```

**⚠️ Security Note:** These approaches store the token in plain text in the config file. Only use if environment variables don't work, and be careful not to commit this file to version control.

## 🆘 Troubleshooting

### MCP Server Not Connecting

1. Verify the environment variable is set:
   ```bash
   echo $SUPABASE_ACCESS_TOKEN
   ```
   Should output your token (not empty).

2. Restart Cursor completely (quit and reopen).

3. Check Cursor's MCP logs in Settings → MCP & Integrations.

### Token Invalid

- Make sure you're using a **Personal Access Token**, not the service role key or anon key
- Generate a new token if the old one was lost or compromised
- Verify the token hasn't expired (check in Supabase dashboard)

### Project Not Found

- Verify your project ref is correct: `vuekwckknfjivjighhfd`
- Check that your access token has permissions for this project
- Try listing projects to verify access: "List my Supabase projects"
