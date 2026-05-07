---
name: godaddy-subdomain
description: Manage GoDaddy DNS CNAME subdomains (add/delete). Use when the user wants to add, remove, or manage a subdomain for their GoDaddy domain, mentions CNAME records, DNS management, or wants to point a subdomain to another domain.
---

# GoDaddy Subdomain Management

Manage CNAME records for GoDaddy-hosted domains. This skill handles adding and removing CNAME subdomain records via the GoDaddy API.

## Setup

Read credentials from `.env` file:
- `GODADDY_API_KEY`
- `GODADDY_API_SECRET`
- `GODADDY_API_ENV` (optional, defaults to "production")

API base URL: `https://api.godaddy.com` (or `https://api.ote-godaddy.com` for OTE)

Auth header: `Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}`

## Instructions

First, ask the user: **"Would you like to add a subdomain or delete one?"**

### Adding a subdomain

Ask for (if not provided):
1. **Domain** - The domain to add the CNAME record to (e.g., example.com)
2. **Subdomain** - The CNAME subdomain (e.g., blog for blog.example.com)
3. **Target** - The CNAME target domain (e.g., target.example.com)

Then run:
```bash
curl -X PATCH "https://api.godaddy.com/v1/domains/${domain}/records" \
  -H "Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}" \
  -H "Content-Type: application/json" \
  -d '[{"type": "CNAME", "name": "${subdomain}", "data": "${target}", "ttl": 3600}]'
```

Verify with:
```bash
curl -s "https://api.godaddy.com/v1/domains/${domain}/records/CNAME/${subdomain}" \
  -H "Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}"
```

Report success or any errors.

### Deleting a subdomain

Ask for (if not provided):
1. **Domain** - The domain where the CNAME record exists (e.g., example.com)
2. **Subdomain** - The CNAME subdomain to delete (e.g., blog for blog.example.com)

Then:
1. Check existing record:
```bash
curl -s "https://api.godaddy.com/v1/domains/${domain}/records/CNAME/${subdomain}" \
  -H "Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}"
```

2. Show user what will be deleted and confirm
3. Delete:
```bash
curl -X DELETE "https://api.godaddy.com/v1/domains/${domain}/records/CNAME/${subdomain}" \
  -H "Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}"
```

4. Verify removal with same GET command
5. Report success or any errors
