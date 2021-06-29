import {REQUEST_METHODS} from '../../util/config';

export const ROUTES_PREFIX = '/members';
export const GET_ALL = {
	path: '/getAll',
	method: REQUEST_METHODS.GET
};

export const GET = {
	path: '/:id',
	method: REQUEST_METHODS.GET
};
