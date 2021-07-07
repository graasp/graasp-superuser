export default {
	$id: 'http://graasp.org/permissions/',
	definitions: {
		member: {
			type: 'object',
			properties: {
				id: { type: 'string'},
				endpoint: { type: 'string' },
				requestMethod: { type: 'string' },
				description: { type: 'string' },
			},
			additionalProperties: false
		},
	}
};

