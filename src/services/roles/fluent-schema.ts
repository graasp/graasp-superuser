import {error, idParam, requestMethod, uuid} from '../../schemas/fluent-schema';
import S from 'fluent-json-schema';

const role = S.object()
	.additionalProperties(false)
	.prop('id', uuid)
	.prop('description', S.string());

export const createRole = {
	body: S.object().additionalProperties(false)
		.prop('description',S.string()),
	response: {
		200: role,
		'4xx': error
	}
};

export const deleteRole = {
	params: { $ref: 'http://graasp.org/#/definitions/idParam' },
	response: {
		200: role,
		'4xx': error
	}
};
export const getOne = {
	params: idParam,
	response: { 200: role, '4xx': error }
};


export const createRolePermission = {
	params: { $ref: 'http://graasp.org/#/definitions/idParam' },
	body: S.object().additionalProperties(false)
		.prop('permissionId',uuid)
		.required(['permissionId']),
	response: {
		'4xx': error
	}
};

export const deleteRolePermission = {
	params: { $ref: 'http://graasp.org/#/definitions/idParam' },
	body: S.object().additionalProperties(false)
		.prop('permissionId',uuid)
		.required(['permissionId']),
	response: {
		'4xx': error
	}
};

export const update = {
	params: { $ref: 'http://graasp.org/#/definitions/idParam' },
	body: S.object().additionalProperties(false)
		.prop('description',S.string())
		.required(['description']),
	response: {
		200:  role,
		'4xx': error
	}
};
