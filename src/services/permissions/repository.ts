import {DatabaseTransactionHandler} from '../../plugins/db';
import {PermissionService} from './db-service';
import {DeleteSuperUserPermission, RequestNotAllowed} from '../../util/graasp-error';
import {BasePermission} from './base-permission';
import {AdminRole} from '../../interfaces/admin-role';
import {Role} from '../../interfaces/role';

export class PermissionRepository {
	protected permissionService: PermissionService;
	protected handler: DatabaseTransactionHandler;

	constructor(roleService: PermissionService, handler: DatabaseTransactionHandler) {
		this.permissionService = roleService;
		this.handler = handler;
	}

	async checkPermissions(roles,path,method) {
		const permissions = await this.permissionService.getPermissions(roles, this.handler);

		const allowed =
			permissions.filter(({endpoint, requestMethod}) => {

				const endpointRegex = new RegExp(endpoint);
				const requestMethodRegex = new RegExp(requestMethod);

				return (endpointRegex.test(path) && requestMethodRegex.test(method));
			});

		return allowed;
	}

	async getOwnPermissions(roles: Role[]) {
		const permissions = await this.permissionService.getPermissions(roles,this.handler);
		return permissions.map((permission) => BasePermission.getReadableFormat(permission));
	}

	async getAllPermissions() {
		const permissions = await this.permissionService.getAllPermissions(this.handler);
		return permissions.map((permission) => BasePermission.getReadableFormat(permission));
	}

	async getPermissionsByRole (roleId,readability = false) {
		const permissions = await this.permissionService.getPermissionsByRoleId(roleId,this.handler);
		const result = readability? permissions.map((permission) => BasePermission.getReadableFormat(permission)): permissions;
		return  result;
	}

	async getPermissionsByMember (memberId,readability = false) {
		const permissions = await this.permissionService.getPermissionsByMemberId(memberId,this.handler);
		const result = readability? permissions.map((permission) => BasePermission.getReadableFormat(permission)): permissions;
		return  result;
	}

	async get(id) {
		const result = await this.permissionService.get(id,this.handler);
		return result;
	}

	async createPermission({endpoint,method,description}) {
		const permission = new BasePermission(description,endpoint,method);

		const result = await this.permissionService.create(permission,this.handler);
		return result;
	}

	async deletePermission(id) {
		const permission = await this.permissionService.get(id,this.handler);

		if(BasePermission.checkSuperUserPermission(permission)) throw new DeleteSuperUserPermission(id);

		const result = await this.permissionService.delete(id,this.handler);
		return result;
	}
}
