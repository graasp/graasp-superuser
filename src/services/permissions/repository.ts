import {DatabaseTransactionHandler} from '../../plugins/db';
import {PermissionService} from './db-service';
import {DeleteSuperUserPermission, RequestNotAllowed} from '../../util/graasp-error';
import {BasePermission} from './base-permission';
import {Role} from '../../interfaces/role';
import {Permission} from '../../interfaces/permission';

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
			permissions.filter(({endpoint, method}) => {

				const endpointRegex = new RegExp(endpoint);
				const methodRegex = new RegExp(method);

				return (endpointRegex.test(path) && methodRegex.test(method));
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

	async update(id,partialPermission: Partial<Permission>) {
		const result = await this.permissionService.update(id,partialPermission,this.handler);
		return result;
	}
}
