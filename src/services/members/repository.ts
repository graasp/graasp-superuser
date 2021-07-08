import { DatabaseTransactionHandler } from '../../plugins/db';
import {UnknownExtra} from '../../interfaces/extra';
import {MemberService} from './db-service';
import {MemberNotFound} from '../../util/graasp-error';

export class MemberRepository<E extends UnknownExtra>  {
	protected memberService: MemberService;
	protected handler: DatabaseTransactionHandler;

	constructor(memberService: MemberService, handler: DatabaseTransactionHandler) {
		this.memberService = memberService;
		this.handler = handler;
	}

	async getAllMembers() {
		const allMembers = await this.memberService.getAllMembers(this.handler);
		return allMembers;
	}

	async getMatching(data) {
		const members = await this.memberService.getMatching(data,this.handler);
		return members;
	}

	async get(memberId) {
		const member = await this.memberService.get<E>(memberId,this.handler);
		if(!member) throw new MemberNotFound(memberId);
		return member;
	}
}
