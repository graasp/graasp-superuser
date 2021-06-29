import {DatabaseTransactionHandler} from '../../plugins/db';
import {PermissionService} from './db-service';
import {RequestNotAllowed} from '../../util/graasp-error';

export class PermissionRepository {
	protected permissionService: PermissionService;
	protected handler: DatabaseTransactionHandler;

	constructor(roleService: PermissionService, handler: DatabaseTransactionHandler) {
		this.permissionService = roleService;
		this.handler = handler;
	}

	async checkPermissions(roleId,prefix,route) {
		const permissions = await this.permissionService.getPermissions(roleId, this.handler);
		const {path, method} = route;

		const allowed =
			permissions.filter(({endpoint, requestMethod}) => {
				const endpointExpression = endpoint.replace('*','.*');
				const requestMethodExpression = requestMethod.replace('*','.*');

				const endpointRegex = new RegExp('^'+endpointExpression);
				const requestMethodRegex = new RegExp(requestMethodExpression);

				return (endpointRegex.test(prefix+path) && requestMethodRegex.test(method));
			});

		if (allowed.length === 0) throw new RequestNotAllowed(roleId);
		return true;
	}

	async getPermissions(roleId) {
		const permissions = await this.permissionService.getPermissions(roleId,this.handler);
 		return permissions;
	}

	async getAllPermissions() {
		const permissions = await this.permissionService.getAllPermissions(this.handler);
		return permissions;
	}

}
