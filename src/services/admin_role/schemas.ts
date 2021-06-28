export default {
	$id: 'http://graasp.org/admin-role/',
	definitions: {
		member: {
			type: 'object',
			properties: {
				id: { $ref: 'http://graasp.org/#/definitions/uuid' },
				admin: { $ref: 'http://graasp.org/#/definitions/uuid' },
				role: { $ref: 'http://graasp.org/#/definitions/uuid' },
			},
			additionalProperties: false
		},
	}
};

// schema for getting a member
const getOne = {
	params: { $ref: 'http://graasp.org/#/definitions/idParam' },
	response: {
		200: { $ref: 'http://graasp.org/members/#/definitions/member' }
	}
};

// schema for getting members by
const getBy = {
	querystring: {
		type: 'object',
		properties: {
			email: { type: 'string', format: 'email' }
		},
		additionalProperties: false
	},
	response: {
		200: {
			type: 'array',
			items: { $ref: 'http://graasp.org/members/#/definitions/member' }
		}
	}
};

// schema for updating a member
const updateOne = {
	params: { $ref: 'http://graasp.org/#/definitions/idParam' },
	body: { $ref: 'http://graasp.org/members/#/definitions/partialMemberRequireOne' },
	response: {
		200: { $ref: 'http://graasp.org/members/#/definitions/member' }
	}
};

export {
	getOne,
	updateOne,
	getBy
};
