import { DatabaseTransactionHandler } from '../../plugins/db';
import {UnknownExtra} from '../../interfaces/extra';
import {MemberService} from './db-service';
import {
	MemberNotFound,
	SUPermissionNotAssignable,
	SUPermissionNotRemovable,
	SURoleNotAssignable, SURoleNotRemovable
} from '../../util/graasp-error';
import {Permission} from '../../interfaces/permission';
import {BasePermission} from '../permissions/base-permission';
import {Role} from '../../interfaces/role';
import {SUPER_USER_ROLE_UUID} from '../../util/config';

export class MemberRepository<E extends UnknownExtra>  {
	protected memberService: MemberService;
	protected handler: DatabaseTransactionHandler;

	constructor(memberService: MemberService, handler: DatabaseTransactionHandler) {
		this.memberService = memberService;
		this.handler = handler;
	}

	async get(memberId) {
		const member = await this.memberService.get<E>(memberId,this.handler);
		if(!member) throw new MemberNotFound(memberId);
		return member;
	}


	async getAllMembers() {
		const allMembers = await this.memberService.getAllMembers(this.handler);
		return allMembers;
	}

	async getMatching(data) {
		const members = await this.memberService.getMatching(data,this.handler);
		return members;
	}

	async getAdmins() {
		const admins = await this.memberService.getAdmins(this.handler);
		return admins;
	}

	async createMemberRole(superUser,roleId,memberId){

		if(!superUser && roleId === SUPER_USER_ROLE_UUID ) throw new SURoleNotAssignable();

		await this.memberService.createMemberRole(memberId,roleId,this.handler);

	}

	async deleteRolePermission(roleId,memberId){

		if(roleId === SUPER_USER_ROLE_UUID ) throw new SURoleNotRemovable();

		await this.memberService.deleteMemberRole(memberId,roleId,this.handler);
		return;
	}
}
