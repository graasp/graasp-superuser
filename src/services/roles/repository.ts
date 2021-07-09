import { DatabaseTransactionHandler } from '../../plugins/db';
import {RoleService} from './db-service';
import {
	CreateSuperUserRolePermission,
	DeleteSuperUserPermission,
	DeleteSuperUserRole,
	MemberNotAdmin, SUPermissionNotAssignable, SUPermissionNotRemovable,
} from '../../util/graasp-error';
import {BasePermission} from '../permissions/base-permission';
import {BaseRole} from './base-role';
import {Permission} from '../../interfaces/permission';
import {AdminRole} from '../../interfaces/admin-role';

export class RoleRepository {
	protected roleService: RoleService;
	protected handler: DatabaseTransactionHandler;

	constructor(roleService: RoleService, handler: DatabaseTransactionHandler) {
		this.roleService = roleService;
		this.handler = handler;
	}

	async getCurrentRoles(adminRoles: AdminRole[]) {
		const roles = await this.roleService.getRoles(adminRoles,this.handler);
		return roles;
	}

	async getMemberRole(memberId) {
		const roles = await this.roleService.getRolesByMemberId(memberId,this.handler);
		return roles;
	}
	async getAllRoles() {
		const role = await this.roleService.getAllRoles(this.handler);
		return role;
	}

	async createRole({description}) {
		const role = new BaseRole(description);
		const result = await this.roleService.create(role,this.handler);
		return result;
	}

	async deleteRole(id,permissions: Permission[]) {

		if(BasePermission.checkSuperUserPermission(permissions)) throw new DeleteSuperUserRole(id);

		const result = await this.roleService.delete(id,this.handler);
		return result;
	}

	async createRolePermission(superUser,permission: Permission,rolePermissions: Permission[],roleId){

		if(BasePermission.checkSuperUserPermission([permission])) throw new SUPermissionNotAssignable();

		await this.roleService.createRolePermission(roleId,permission.id,this.handler);

	}

	async deleteRolePermission(superUser,permission: Permission,rolePermissions: Permission[],roleId){

		if(BasePermission.checkSuperUserPermission([permission]) && !BasePermission.checkSuperUserPermission(rolePermissions)) throw new SUPermissionNotRemovable();

		await this.roleService.deleteRolePermission(roleId,permission.id,this.handler);
		return;
	}
}
