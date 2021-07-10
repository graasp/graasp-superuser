import S from 'fluent-json-schema';
import {direction, error, idParam, level, method, uuid} from '../../schemas/fluent-schema';

const permission = S.object()
	.additionalProperties(false)
	.prop('id', uuid)
	.prop('endpoint', S.string())
	.prop('description', S.string())
	.prop('method', method);


const partialPermission = S.object()
	.additionalProperties(false)
	.prop('endpoint', S.string().minLength(2))
	.prop('description', S.string())
	.prop('method', method);

const partialPermissionAllRequired =
	partialPermission.required(['endpoint','description','method']);


const partialPermissionAnyOf =
	S.object().allOf([
		partialPermission,
		S.anyOf([
			S.required(['endpoint']),
			S.required(['description']),
			S.required(['method']),
		])
	]);

export const createPermission = {
	body: partialPermissionAllRequired,
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

export const update = {
	params: idParam,
	body: partialPermissionAnyOf,
	response: {
		200: permission,
		'4xx': error
	}
};
