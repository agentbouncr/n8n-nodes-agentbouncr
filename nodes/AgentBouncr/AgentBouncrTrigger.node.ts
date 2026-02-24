import type {
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

export class AgentBouncrTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AgentBouncr Trigger',
		name: 'agentBouncrTrigger',
		icon: 'file:agentbouncr.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["eventTypes"].join(", ")}}',
		description:
			'Triggers when governance events occur — tool denials, kill-switch activations, policy changes, and more',
		defaults: {
			name: 'AgentBouncr Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'agentBouncrApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				required: true,
				default: ['tool_call.denied', 'killswitch.activated'],
				options: [
					// Tool Call Events
					{ name: 'Tool Call — Allowed', value: 'tool_call.allowed' },
					{ name: 'Tool Call — Denied', value: 'tool_call.denied' },
					{ name: 'Tool Call — Error', value: 'tool_call.error' },
					// Approval Events
					{ name: 'Approval — Requested', value: 'approval.requested' },
					{ name: 'Approval — Granted', value: 'approval.granted' },
					{ name: 'Approval — Rejected', value: 'approval.rejected' },
					{ name: 'Approval — Timeout', value: 'approval.timeout' },
					// Agent Lifecycle Events
					{ name: 'Agent — Started', value: 'agent.started' },
					{ name: 'Agent — Stopped', value: 'agent.stopped' },
					{ name: 'Agent — Error', value: 'agent.error' },
					{ name: 'Agent — Config Changed', value: 'agent.config_changed' },
					{ name: 'Agent — Suspended', value: 'agent.suspended' },
					{ name: 'Agent — Idle', value: 'agent.idle' },
					{ name: 'Agent — Decommissioned', value: 'agent.decommissioned' },
					// Security Events
					{ name: 'Injection Detected', value: 'injection.detected' },
					{ name: 'Kill-Switch — Activated', value: 'killswitch.activated' },
					{ name: 'Audit Integrity Violation', value: 'audit.integrity_violation' },
					// Policy Events
					{ name: 'Policy — Created', value: 'policy.created' },
					{ name: 'Policy — Updated', value: 'policy.updated' },
					{ name: 'Policy — Deleted', value: 'policy.deleted' },
					// System Events
					{ name: 'Rate Limit Exceeded', value: 'rate_limit.exceeded' },
					{ name: 'License — Validated', value: 'license.validated' },
					{ name: 'License — Expired', value: 'license.expired' },
					// Wildcard
					{ name: 'All Events (*)', value: '*' },
				],
				description: 'Which governance events should trigger this workflow',
			},
			{
				displayName: 'Agent Filter',
				name: 'agentId',
				type: 'string',
				default: '',
				placeholder: 'my-agent',
				description:
					'Only receive events for this specific agent. Leave empty to receive events for all agents.',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (!webhookData.webhookId) {
					return false;
				}

				const credentials = await this.getCredentials('agentBouncrApi');
				const baseUrl = credentials.baseUrl as string;

				try {
					await this.helpers.httpRequest({
						method: 'GET',
						url: `${baseUrl}/api/webhooks/${webhookData.webhookId}`,
						headers: {
							Authorization: `Bearer ${credentials.apiKey as string}`,
						},
					});
					return true;
				} catch {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const eventTypes = this.getNodeParameter('eventTypes', []) as string[];
				const agentId = this.getNodeParameter('agentId', '') as string;
				const credentials = await this.getCredentials('agentBouncrApi');
				const baseUrl = credentials.baseUrl as string;

				const body: Record<string, unknown> = {
					name: `n8n: ${this.getWorkflow().name || 'workflow'}`,
					url: webhookUrl,
					channelType: 'custom',
					eventTypes,
				};

				if (agentId) {
					body.agentId = agentId;
				}

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}/api/webhooks`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey as string}`,
						'Content-Type': 'application/json',
					},
					body,
				});

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = (response as { id: string }).id;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (!webhookData.webhookId) {
					return true;
				}

				const credentials = await this.getCredentials('agentBouncrApi');
				const baseUrl = credentials.baseUrl as string;

				try {
					await this.helpers.httpRequest({
						method: 'DELETE',
						url: `${baseUrl}/api/webhooks/${webhookData.webhookId}`,
						headers: {
							Authorization: `Bearer ${credentials.apiKey as string}`,
						},
					});
				} catch {
					// Webhook may have been manually deleted — ignore
				}

				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;

		return {
			workflowData: [
				this.helpers.returnJsonArray(body),
			],
		};
	}
}
