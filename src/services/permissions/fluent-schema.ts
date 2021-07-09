import S from 'fluent-json-schema';
import {direction, error, idParam, level, requestMethod, uuid} from '../../schemas/fluent-schema';

const permission = S.object()
	.additionalProperties(false)
	.prop('id', uuid)
	.prop('endpoint', S.string())
	.prop('description', S.string())
	.prop('requestMethod', requestMethod);


const permissionBody = S.object()
	.additionalProperties(false)
	.prop('endpoint', S.string().minLength(2))
	.prop('description', S.string())
	.prop('method', requestMethod)
	.required(['endpoint', 'description','method']);

export const createPermission = {
	body: permissionBody,
	response: {
		200: permission,
		'4xx': error
	}
};

export const deletePermission = {
	params: { $ref: 'http://graasp.org/#/definitions/idParam' },
	response: {
		200: permission,
		'4xx': error
	}
};

export const getPermissions = {
	querystring: S.object()
		.additionalProperties(false)
		.prop('roleId',uuid)
	,
	response: {
		200: S.array().items(permission),
		'4xx': error
	}
};

export const getOne = {
	params: idParam,
	response: { 200: permission, '4xx': error }
};
