import { DatabaseTransactionHandler } from '../../plugins/db';
import {RoleService} from './db-service';
import {DeleteSuperUserPermission, DeleteSuperUserRole, MemberNotAdmin} from '../../util/graasp-error';
import {BasePermission} from '../permissions/base-permission';
import {BaseRole} from './base-role';
import {Permission} from '../../interfaces/permission';

export class RoleRepository {
	protected roleService: RoleService;
	protected handler: DatabaseTransactionHandler;

	constructor(roleService: RoleService, handler: DatabaseTransactionHandler) {
		this.roleService = roleService;
		this.handler = handler;
	}

	async getCurrentRole(roleId) {
		const role = await this.roleService.getRole(roleId,this.handler);
		return role;
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

		for ( const permission of permissions) {
			if(BasePermission.checkSuperUserPermission(permission)) throw new DeleteSuperUserRole(id);
		}

		const result = await this.roleService.delete(id,this.handler);
		return result;
	}
}
