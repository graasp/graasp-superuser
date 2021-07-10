// local
import { Permission } from '../..//interfaces/permission';
import {ALL_SYMBOL, METHODS} from '../../util/config';

export class BasePermission implements Permission {

	readonly id: string;
	description: string;
	endpoint: string;
	method: string;

	constructor(
		description: string,
		endpoint: string,
		method: string,
	) {
		this.description = description;
		this.endpoint = endpoint;
		this.method = this.validatemethod(method);
	}

	private endpointToRegex = (endpoint) => {
		return endpoint.replace();
	}
	private validatemethod = (method) => {
		return method === METHODS.ALL ? ALL_SYMBOL : method;
	}

	static getmethod = ({method}) => {
		const readablemethod = method === ALL_SYMBOL? METHODS.ALL : method;
		return readablemethod;
	}

	static getEndpoint = ({endpoint}) => {
		const readableEndpoint = endpoint.replace(/\^\.\*|\.\*/,'ALL');
		return readableEndpoint;
	}

	static getReadableFormat = (permission: Permission) => {
		const readableFormat = permission;
		readableFormat.method = BasePermission.getmethod(readableFormat);
		readableFormat.endpoint = BasePermission.getEndpoint(readableFormat);
		return readableFormat;
	}

	static checkSuperUserPermission = (permission: Permission) => {
		return (permission.method === ALL_SYMBOL && permission.endpoint === ALL_SYMBOL);
	}

}
