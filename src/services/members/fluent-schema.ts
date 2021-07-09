import S from 'fluent-json-schema';
import {error, uuid} from '../../schemas/fluent-schema';

export const createMemberRole = {
	params: { $ref: 'http://graasp.org/#/definitions/idParam' },
	body: S.object().additionalProperties(false)
		.prop('roleId',uuid)
		.required(['roleId']),
	response: {
		'4xx': error
	}
};

export const deleteMemberRole = {
	params: { $ref: 'http://graasp.org/#/definitions/idParam' },
	body: S.object().additionalProperties(false)
		.prop('roleId',uuid)
		.required(['roleId']),
	response: {
		'4xx': error
	}
};
