// global
import {
	sql,
	DatabaseTransactionConnectionType as TrxHandler
} from 'slonik';
import { UnknownExtra } from '../interfaces/extra';

import { Member } from '../interfaces/member';

declare module 'fastify' {
	interface FastifyInstance {
		members: {
			dbService: MemberService
		};
	}
}

export class MemberService {
	// the 'safe' way to dynamically generate the columns names:
	private static allColumns = sql.join(
		[
			'id', 'name', 'email', 'type', 'extra',
			['created_at', 'createdAt'],
			['updated_at', 'updatedAt'],
		].map(c =>
			!Array.isArray(c) ?
				sql.identifier([c]) :
				sql.join(c.map(cwa => sql.identifier([cwa])), sql` AS `)
		),
		sql`, `
	);


	async getAllMembers(dbHandler: TrxHandler):Promise<Member[]> {

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return dbHandler.query<Member>(sql`
       	SELECT ${MemberService.allColumns}
        FROM member`).then(({rows}) => rows.slice(0));

	}
}
