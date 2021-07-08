import { DatabaseTransactionHandler } from '../../plugins/db';
import {AdminRoleService} from './db-service';
import {MemberNotAdmin} from '../../util/graasp-error';

export class AdminRoleRepository {
	protected adminRoleService: AdminRoleService;
	protected handler: DatabaseTransactionHandler;

	constructor(roleService: AdminRoleService, handler: DatabaseTransactionHandler) {
		this.adminRoleService = roleService;
		this.handler = handler;
	}

	async getMemberRoles(memberId) {
		const roles = await this.adminRoleService.getMemberRoles(memberId,this.handler);
		if(!roles) throw new MemberNotAdmin(memberId);
		return roles;
	}

}
