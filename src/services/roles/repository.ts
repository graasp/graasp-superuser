import { DatabaseTransactionHandler } from '../../plugins/db';
import {RoleService} from './db-service';
import {MemberNotAdmin} from '../../util/graasp-error';

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
}
