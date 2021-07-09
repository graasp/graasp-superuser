// local
import { Permission } from '../..//interfaces/permission';
import {ALL_SYMBOL, METHODS} from '../../util/config';

export class BasePermission implements Permission {

	readonly id: string;
	description: string;
	endpoint: string;
	requestMethod: string;

	constructor(
		description: string,
		endpoint: string,
		requestMethod: string,
	) {
		this.description = description;
		this.endpoint = endpoint;
		this.requestMethod = this.validateRequestMethod(requestMethod);
	}

	private endpointToRegex = (endpoint) => {
		return endpoint.replace();
	}
	private validateRequestMethod = (requestMethod) => {
		return requestMethod === METHODS.ALL ? ALL_SYMBOL : requestMethod;
	}

	static getRequestMethod = ({requestMethod}) => {
		const readableRequestMethod = requestMethod === ALL_SYMBOL? METHODS.ALL : requestMethod;
		return readableRequestMethod;
	}

	static getEndpoint = ({endpoint}) => {
		const readableEndpoint = endpoint.replace(/\^\.\*|\.\*/,'ALL');
		return readableEndpoint;
	}

	static getReadableFormat = (permission: Permission) => {
		const readableFormat = permission;
		readableFormat.requestMethod = BasePermission.getRequestMethod(readableFormat);
		readableFormat.endpoint = BasePermission.getEndpoint(readableFormat);
		return readableFormat;
	}

	static checkSuperUserPermission = (permissions: Permission[]) => {
		return permissions.find((permission) => permission.requestMethod === ALL_SYMBOL && permission.endpoint === ALL_SYMBOL);
	}

}
