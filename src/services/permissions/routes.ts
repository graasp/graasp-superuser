import {REQUEST_METHODS} from '../../util/config';

export const ROUTES_PREFIX = '/permissions';
export const GET_ALL = {
	route: '/getAll',
	request_method: REQUEST_METHODS.GET
};

export const GET = {
	route: '/getAdminPermissions',
	request_method: REQUEST_METHODS.GET
};
