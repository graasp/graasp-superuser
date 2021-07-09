export default {
	$id: 'http://graasp.org/role/',
	definitions: {
		member: {
			type: 'object',
			properties: {
				id: { $ref: 'http://graasp.org/#/definitions/uuid' },
				description: { type: 'string' },
				},
			additionalProperties: false
		},
	}
};

