# GoDaddy DNS Subdomain Management

Manage GoDaddy DNS CNAME records via MCP server and OpenCode skill.

## Quick Start

1. Clone this repo and set up credentials:

    ```bash
    git clone <repo-url> godaddy-dns-mcp
    cd godaddy-dns-mcp
    cp .env.example .env
    ```

2. Edit `.env` with your GoDaddy API credentials:

    ```bash
    GODADDY_API_KEY=your_api_key_here
    GODADDY_API_SECRET=your_api_secret_here
    # Optional:
    GODADDY_API_ENV=production  # or "ote" for testing
    ```

3. Install dependencies and build:
    ```bash
    npm install
    npm run build
    ```

## MCP Server Usage

Run the MCP server directly:
```bash
npm start
```

### Configuring with MCP Clients

**Claude Desktop** - Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "godaddy-dns": {
      "command": "node",
      "args": ["/path/to/godaddy-dns-mcp/dist/index.js"],
      "env": {
        "GODADDY_API_KEY": "your_key",
        "GODADDY_API_SECRET": "your_secret"
      }
    }
  }
}
```

**Gemini CLI** - Add to your MCP config:
```json
{
  "mcpServers": {
    "godaddy-dns": {
      "command": "node",
      "args": ["/path/to/godaddy-dns-mcp/dist/index.js"]
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `addCNAMERecord` | Add a CNAME record (domain, subdomain, target, ttl?) |
| `deleteCNAMERecord` | Delete a CNAME record with confirmation (domain, subdomain, confirm?) |

## OpenCode Skill

The `godaddy-subdomain` skill is automatically loaded when you run opencode in this directory. Simply ask:

- "Add a subdomain blog pointing to target.example.com for mydomain.com"
- "Delete the subdomain blog from mydomain.com"
- "Add a CNAME record"

The skill will prompt for any missing information and confirm deletions before proceeding.

## Environment Variables

| Variable             | Required | Description                                          |
| -------------------- | -------- | ---------------------------------------------------- |
| `GODADDY_API_KEY`    | Yes      | Your GoDaddy API key                                 |
| `GODADDY_API_SECRET` | Yes      | Your GoDaddy API secret                              |
| `GODADDY_API_ENV`    | No       | `production` (default) or `ote` for test environment |

Get API credentials at https://developer.godaddy.com/keys/
