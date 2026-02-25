# Changelog

## 0.1.0 (2026-02-25)

### Features

- **Credentials:** API Token (`gov_` prefix) + Base URL with built-in connection test
- **Governance:** Evaluate operation — pre-tool-call policy check with auto-registration
- **Agent:** List, Get, Create, Update, Delete operations
- **Kill Switch:** Get Status, Activate, Deactivate operations
- **Trigger:** Webhook-based trigger with 22 event types + wildcard (`*`)
- **Auto-Registration:** Unknown agents are created automatically on first Evaluate call
- **LLM-friendly:** All operations have `usableAsTool: true` for AI agent integration

### Known Issues

- n8n v2 Task Runner requires `N8N_RUNNERS_DISABLED=true` (affects all community nodes)
- No HMAC webhook signature verification (planned for v0.2.0)
