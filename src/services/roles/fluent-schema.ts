import {error, requestMethod, uuid} from '../../schemas/fluent-schema';
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
