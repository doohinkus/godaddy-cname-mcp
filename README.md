# GoDaddy DNS MCP Server

Production-grade MCP server that provides tools for managing GoDaddy DNS records. Currently supports adding and verifying CNAME records.

## Quick Start

1. Install and build:
   ```bash
   git clone <repo-url> godaddy-dns-mcp
   cd godaddy-dns-mcp
   npm install
   npm run build
   ```

2. Set environment variables (in your shell or `.env` file):
   ```bash
   export GODADDY_API_KEY=your_api_key_here
   export GODADDY_API_SECRET=your_api_secret_here
   # Optional:
   export GODADDY_SHOPPER_ID=your_shopper_id
   export GODADDY_API_ENV=production  # or "ote" for testing
   ```

3. Run opencode in the project directory:
   ```bash
   opencode
   ```
   The local `opencode.json` will auto-detect and configure the MCP server.

## How It Works

This project includes a **local `opencode.json`** that configures the MCP server using environment variable substitution (`{env:VAR_NAME}`). When you run `opencode` in this directory, it automatically:

- Detects the local `opencode.json`
- Reads credentials from your environment variables
- Starts the `godaddy-dns-mcp` server

No global config changes needed — each project can have its own configuration.

## Alternative: Global Install

To use the server across all your projects, install globally:

```bash
npm install -g .
```

Then add to your `~/.config/opencode/opencode.json`:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "godaddy-dns": {
      "type": "local",
      "command": ["godaddy-dns-mcp"],
      "environment": {
        "GODADDY_API_KEY": "{env:GODADDY_API_KEY}",
        "GODADDY_API_SECRET": "{env:GODADDY_API_SECRET}"
      },
      "enabled": true
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GODADDY_API_KEY` | Yes | Your GoDaddy API key |
| `GODADDY_API_SECRET` | Yes | Your GoDaddy API secret |
| `GODADDY_SHOPPER_ID` | No | Shopper ID if managing domains for another account |
| `GODADDY_API_ENV` | No | `production` (default) or `ote` for test environment |

Get API credentials at https://developer.godaddy.com/keys/

## Tools

### `addCNAMERecord`

Adds a CNAME record to a GoDaddy-hosted domain and verifies the addition.

**Parameters:**
- `domain` (required): Domain to modify (e.g., `example.com`)
- `subdomain` (required): CNAME subdomain (e.g., `blog` for `blog.example.com`)
- `target` (required): CNAME target (e.g., `target.example.com`)
- `ttl` (optional): TTL in seconds, defaults to 3600

**Example:**
```json
{
  "domain": "example.com",
  "subdomain": "blog",
  "target": "cname.vercel.app",
  "ttl": 3600
}
```
