import {REQUEST_METHODS} from '../../util/config';

export const ROUTES_PREFIX = '/permissions';
export const GET_ALL = {
	path: '/getAll',
	method: REQUEST_METHODS.GET
};

export const GET = {
	route: '/getAdminPermissions',
	method: REQUEST_METHODS.GET
};
