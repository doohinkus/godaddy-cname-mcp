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

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Type checking
npm run typecheck
```

## MCP Server Usage

Run the MCP server directly:
```bash
npm start
```

### Configuring with MCP Clients

**Prerequisites:** Set environment variables in your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):
```bash
export GODADDY_API_KEY="your_api_key_here"
export GODADDY_API_SECRET="your_api_secret_here"
# Optional: export GODADDY_API_ENV="production"  # or "ote" for testing
```

**Optional:** Install globally for easier access:
```bash
npm install -g godaddy-dns-mcp
# Then use "godaddy-dns-mcp" command instead of "node /path/to/dist/index.js"
```

---

#### Claude Desktop

1. Open Claude Desktop settings and edit `claude_desktop_config.json`:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the following configuration (uses environment variables):
```json
{
  "mcpServers": {
    "godaddy-dns": {
      "command": "node",
      "args": ["/absolute/path/to/godaddy-dns-mcp/dist/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

4. Example usage in Claude:
   ```
   Add a subdomain "blog" pointing to "target.example.com" for mydomain.com
   ```

---

#### Gemini CLI

1. Create or edit your Gemini CLI config file:
   - Location: `~/.gemini/config.json` (or your project's config)

2. Add the MCP server configuration:
```json
{
  "mcpServers": {
    "godaddy-dns": {
      "command": "node",
      "args": ["/absolute/path/to/godaddy-dns-mcp/dist/index.js"]
    }
  }
}
```

3. Start Gemini CLI and use the tools:
   ```bash
   gemini
   > Use the addCNAMERecord tool to add a subdomain "api" pointing to "app.example.com" for mydomain.com
   ```

---

#### OpenCode

OpenCode automatically loads the `godaddy-subdomain` skill when you run `opencode` in this directory.

1. Navigate to the project directory:
   ```bash
   cd /path/to/godaddy-dns-mcp
   ```

2. Start OpenCode:
   ```bash
   opencode
   ```

3. Example usage in OpenCode:
   ```
   Add a subdomain blog pointing to target.example.com for mydomain.com
   ```
   
   ```
   Delete the subdomain blog from mydomain.com
   ```
   
   ```
   Add a CNAME record
   ```

The skill will prompt for any missing information and confirm deletions before proceeding.

---

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `addCNAMERecord` | Add a CNAME record (domain, subdomain, target, ttl?) |
| `deleteCNAMERecord` | Delete a CNAME record with confirmation (domain, subdomain, confirm?) |

## Environment Variables

| Variable             | Required | Description                                          |
| -------------------- | -------- | ---------------------------------------------------- |
| `GODADDY_API_KEY`    | Yes      | Your GoDaddy API key                                 |
| `GODADDY_API_SECRET` | Yes      | Your GoDaddy API secret                              |
| `GODADDY_API_ENV`    | No       | `production` (default) or `ote` for test environment |

Get API credentials at https://developer.godaddy.com/keys/

## CI/CD

This project uses GitHub Actions for continuous integration. The workflow runs on every push and pull request to `main`:

- Linting with ESLint
- Type checking with TypeScript
- Unit tests with Vitest
- Build verification

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for details.
