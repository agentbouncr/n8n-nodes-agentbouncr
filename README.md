# n8n-nodes-agentbouncr

[n8n](https://n8n.io/) community node for [AgentBouncr](https://agentbouncr.com) — the AI Agent Governance Platform.

Evaluate tool calls against governance policies, manage AI agents, control the kill-switch, and receive real-time governance events — all from your n8n workflows.

## Installation

1. Open your n8n instance
2. Go to **Settings > Community Nodes**
3. Click **Install a community node**
4. Enter: `n8n-nodes-agentbouncr`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-agentbouncr
```

Restart n8n after installation.

## Authentication

1. Sign up at [agentbouncr.com](https://agentbouncr.com)
2. Create an agent token in the Dashboard (Agent Detail > Create Token)
3. In n8n, go to **Credentials > Add Credential > AgentBouncr API**
4. Paste your `gov_` API key
5. (Optional) Change the API URL for self-hosted instances

## Nodes

### AgentBouncr

The main node for interacting with the AgentBouncr API.

#### Resource: Evaluate

**Execute** — Check if an AI agent is allowed to use a specific tool before execution.

| Field | Required | Description |
|-------|----------|-------------|
| Agent ID | Yes | The agent making the tool call. Auto-registered if unknown. |
| Tool | Yes | The tool name (e.g. `send_email`, `search`) |
| Parameters (JSON) | No | Tool call parameters (logged in audit trail) |
| Trace ID | No | Correlation ID across systems |

**Output:**
```json
{
  "decision": "allow",
  "reason": "Matched rule: allow-all"
}
```

Use an **IF** node after AgentBouncr to branch on `decision === "allow"`.

#### Resource: Agent

| Operation | Description |
|-----------|-------------|
| **List** | Get all registered AI agents |
| **Get** | Get details of a specific agent |
| **Create** | Register a new agent with name, description, allowed tools, and policy |
| **Update** | Change agent status (active/stopped/suspended/decommissioned) or policy binding |
| **Delete** | Deregister an agent |

#### Resource: Kill Switch

| Operation | Description |
|-----------|-------------|
| **Activate** | Emergency stop — immediately block all AI agent actions |
| **Deactivate** | Resume normal agent operations |
| **Get Status** | Check if the kill switch is currently active |

### AgentBouncr Trigger

Webhook-based trigger that fires when governance events occur. When the workflow is activated, it automatically creates a webhook subscription in AgentBouncr. When deactivated, the subscription is removed.

**Available Events:**

- `tool_call.allowed`, `tool_call.denied`, `tool_call.error`
- `approval.requested`, `approval.granted`, `approval.rejected`, `approval.timeout`
- `agent.started`, `agent.stopped`, `agent.error`, `agent.suspended`, `agent.idle`, `agent.decommissioned`, `agent.config_changed`
- `killswitch.activated`
- `injection.detected`, `audit.integrity_violation`
- `policy.created`, `policy.updated`, `policy.deleted`
- `rate_limit.exceeded`, `license.validated`, `license.expired`
- `*` (all events)

**Default:** `tool_call.denied` + `killswitch.activated`

**Optional:** Filter events by a specific Agent ID.

## Example Workflows

### Pre-Tool-Check Pattern

```
[Trigger] → [AgentBouncr: Evaluate] → [IF: decision = allow] → [Your Tool Node]
                                       └─[Denied] → [Slack: Notify Team]
```

### Alert on Denied Tool Calls

```
[AgentBouncr Trigger: tool_call.denied] → [Slack: Post Message]
```

### Emergency Stop via Manual Trigger

```
[Manual Trigger] → [AgentBouncr: Kill Switch Activate]
```

## Auto-Registration

AgentBouncr supports **auto-registration**: if you use an Agent ID that doesn't exist yet in the `Evaluate` operation, the agent is automatically created with a default policy. No need to create agents manually first.

This is the "Stripe model" — your first API call is the registration moment.

## Security Note

In v0.1.0, incoming webhook events from the AgentBouncr Trigger are **not cryptographically verified** (no HMAC signature check). HMAC verification will be added in v0.2.0. The webhook URL itself provides basic security as it is unique and not guessable.

## Compatibility

- **n8n:** v1.0.0 and later
- **Node.js:** 20+

## Links

- [AgentBouncr Website](https://agentbouncr.com)
- [AgentBouncr Dashboard](https://app.agentbouncr.com)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-agentbouncr)
- [GitHub Repository](https://github.com/agentbouncr/n8n-nodes-agentbouncr)

## License

MIT
