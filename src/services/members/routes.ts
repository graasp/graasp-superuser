import {REQUEST_METHODS} from '../../util/config';

export const ROUTES_PREFIX = '/members';
export const GET_ALL = {
	route: '/getAll',
	request_method: REQUEST_METHODS.GET
};

export const GET = {
	route: '/:id',
	request_method: REQUEST_METHODS.GET
};
