import { DatabaseTransactionHandler } from '../../plugins/db';
import {PermissionService} from './db-service';
import {RequestNotAllowed} from '../../util/graasp-error';

export class PermissionRepository {
	protected permissionService: PermissionService;
	protected handler: DatabaseTransactionHandler;

	constructor(roleService: PermissionService, handler: DatabaseTransactionHandler) {
		this.permissionService = roleService;
		this.handler = handler;
	}

	async checkPermissions(roleId,route,method) {
		const permissions = await this.permissionService.getPermissions(roleId,this.handler);
		const allowed = permissions.filter(({endpoint,request_method})=>
			(route===endpoint|| endpoint==='*') && (method===request_method || request_method==='*'));
		if(allowed.length===0) throw new RequestNotAllowed(roleId);

		return true;
	}

}
