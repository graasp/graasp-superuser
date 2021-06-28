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

	async getMemberRole(memberId) {
		const role = await this.adminRoleService.getMemberRole(memberId,this.handler);
		if(!role) throw new MemberNotAdmin(memberId);
		return role;
	}

}
