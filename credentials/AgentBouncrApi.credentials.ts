import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AgentBouncrApi implements ICredentialType {
	name = 'agentBouncrApi';
	displayName = 'AgentBouncr API';
	documentationUrl = 'https://agentbouncr.com/docs/integrations/n8n';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			placeholder: 'gov_abc123...',
			description:
				'Your AgentBouncr API key. Find it in the Dashboard under the agent\'s detail page → Create Token.',
		},
		{
			displayName: 'API URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.agentbouncr.com',
			description:
				'The base URL of your AgentBouncr API. Only change this for self-hosted instances.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/agents',
			method: 'GET',
		},
	};
}
