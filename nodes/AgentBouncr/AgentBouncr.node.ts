import type { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class AgentBouncr implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AgentBouncr',
		name: 'agentBouncr',
		icon: 'file:agentbouncr.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'AI Agent Governance — evaluate tool calls, manage agents, and control kill-switch',
		defaults: {
			name: 'AgentBouncr',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'agentBouncrApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// ── Resource Selector ──────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Evaluate',
						value: 'evaluate',
						description: 'Check if an AI agent is allowed to use a specific tool',
					},
					{
						name: 'Agent',
						value: 'agent',
						description: 'Manage registered AI agents',
					},
					{
						name: 'Kill Switch',
						value: 'killSwitch',
						description: 'Emergency stop controls for all agents',
					},
				],
				default: 'evaluate',
			},

			// ── Evaluate Operations ────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['evaluate'] } },
				options: [
					{
						name: 'Execute',
						value: 'execute',
						description: 'Check if an AI agent is allowed to use a specific tool before execution',
						action: 'Evaluate a tool call',
						routing: {
							request: {
								method: 'POST',
								url: '/api/evaluate',
							},
						},
					},
				],
				default: 'execute',
			},

			// Evaluate fields — each with routing.send
			{
				displayName: 'Agent ID',
				name: 'agentId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['evaluate'] } },
				placeholder: 'my-agent',
				description:
					'The ID of the agent making the tool call. If the agent does not exist yet, it will be auto-registered.',
				routing: {
					send: {
						type: 'body',
						property: 'agentId',
					},
				},
			},
			{
				displayName: 'Tool',
				name: 'tool',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['evaluate'] } },
				placeholder: 'send_email',
				description: 'The name of the tool being called (e.g. "send_email", "search", "create_invoice")',
				routing: {
					send: {
						type: 'body',
						property: 'tool',
					},
				},
			},
			{
				displayName: 'Parameters (JSON)',
				name: 'params',
				type: 'json',
				default: '',
				displayOptions: { show: { resource: ['evaluate'] } },
				placeholder: '{"to": "user@example.com", "subject": "Hello"}',
				description: 'Optional JSON object with the tool call parameters. These are logged in the audit trail.',
				routing: {
					send: {
						type: 'body',
						property: 'params',
					},
				},
			},
			{
				displayName: 'Trace ID',
				name: 'traceId',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['evaluate'] } },
				description: 'Optional trace ID for request correlation across systems',
				routing: {
					send: {
						type: 'body',
						property: 'traceId',
					},
				},
			},

			// ── Agent Operations ───────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['agent'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Register a new AI agent in the governance platform',
						action: 'Create an agent',
						routing: {
							request: {
								method: 'POST',
								url: '/api/agents',
							},
						},
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Deregister an agent from the governance platform',
						action: 'Delete an agent',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/api/agents/{{$parameter["agentId"]}}',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get details of a specific registered agent',
						action: 'Get agent details',
						routing: {
							request: {
								method: 'GET',
								url: '=/api/agents/{{$parameter["agentId"]}}',
							},
						},
					},
					{
						name: 'List',
						value: 'list',
						description: 'Get a list of all registered AI agents',
						action: 'List all agents',
						routing: {
							request: {
								method: 'GET',
								url: '/api/agents',
							},
						},
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an agent\'s status or policy binding',
						action: 'Update an agent',
						routing: {
							request: {
								method: 'PATCH',
								url: '=/api/agents/{{$parameter["agentId"]}}',
							},
						},
					},
				],
				default: 'list',
			},

			// Agent fields — each with routing.send where needed
			{
				displayName: 'Agent ID',
				name: 'agentId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'my-agent',
				displayOptions: {
					show: {
						resource: ['agent'],
						operation: ['get', 'create', 'update', 'delete'],
					},
				},
				description: 'The unique identifier for the agent',
				routing: {
					send: {
						type: 'body',
						property: 'agentId',
					},
				},
			},
			{
				displayName: 'Name',
				name: 'agentName',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Customer Service Agent',
				displayOptions: { show: { resource: ['agent'], operation: ['create'] } },
				description: 'Human-readable name for the agent',
				routing: {
					send: {
						type: 'body',
						property: 'name',
					},
				},
			},
			{
				displayName: 'Description',
				name: 'agentDescription',
				type: 'string',
				default: '',
				placeholder: 'Handles customer inquiries via email',
				displayOptions: { show: { resource: ['agent'], operation: ['create'] } },
				description: 'Optional description of the agent\'s purpose',
				routing: {
					send: {
						type: 'body',
						property: 'description',
					},
				},
			},
			{
				displayName: 'Allowed Tools',
				name: 'allowedTools',
				type: 'string',
				default: '',
				placeholder: 'search, send_email, summarize',
				displayOptions: { show: { resource: ['agent'], operation: ['create'] } },
				description: 'Comma-separated list of tools this agent is allowed to use',
				routing: {
					send: {
						type: 'body',
						property: 'allowedTools',
					},
				},
			},
			{
				displayName: 'Policy Name',
				name: 'policyName',
				type: 'string',
				default: '',
				placeholder: 'finance-restricted',
				displayOptions: {
					show: { resource: ['agent'], operation: ['create', 'update'] },
				},
				description: 'Name of the governance policy to bind to this agent',
				routing: {
					send: {
						type: 'body',
						property: 'policyName',
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '',
				displayOptions: { show: { resource: ['agent'], operation: ['update'] } },
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Stopped', value: 'stopped' },
					{ name: 'Suspended', value: 'suspended' },
					{ name: 'Decommissioned', value: 'decommissioned' },
				],
				description: 'New status for the agent (state machine validated — invalid transitions return 400)',
				routing: {
					send: {
						type: 'body',
						property: 'status',
					},
				},
			},

			// ── Kill Switch Operations ─────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['killSwitch'] } },
				options: [
					{
						name: 'Activate',
						value: 'activate',
						description: 'Emergency stop — immediately block all AI agent actions',
						action: 'Activate kill switch',
						routing: {
							request: {
								method: 'POST',
								url: '/api/killswitch',
							},
						},
					},
					{
						name: 'Deactivate',
						value: 'deactivate',
						description: 'Deactivate the kill switch and resume normal agent operations',
						action: 'Deactivate kill switch',
						routing: {
							request: {
								method: 'DELETE',
								url: '/api/killswitch',
							},
						},
					},
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Check if the kill switch is currently active',
						action: 'Get kill switch status',
						routing: {
							request: {
								method: 'GET',
								url: '/api/killswitch/status',
							},
						},
					},
				],
				default: 'getStatus',
			},

			// Kill Switch fields
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Security incident detected',
				displayOptions: {
					show: {
						resource: ['killSwitch'],
						operation: ['activate', 'deactivate'],
					},
				},
				description: 'Reason for activating or deactivating the kill switch (logged in audit trail)',
				routing: {
					send: {
						type: 'body',
						property: 'reason',
					},
				},
			},
		],
	};
}
