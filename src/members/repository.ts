import { DatabaseTransactionHandler } from '../plugins/db';
import {UnknownExtra} from '../interfaces/extra';
import {MemberService} from './db-service';

export class MemberRepository  {
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
}
