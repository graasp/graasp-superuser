// global
import {
	sql,
	DatabaseTransactionConnectionType as TrxHandler
} from 'slonik';
import { UnknownExtra } from '../../interfaces/extra';

import {Member} from '../../interfaces/member';

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

	private static allColumnsForJoins = sql.join(
		[
			[['member', 'id'], ['id']],
			[['member', 'name'], ['name']],
			[['member', 'email'], ['email']],
			[['member', 'type'], ['type']],
			[['member', 'extra'], ['extra']],
			[['member', 'created_at'], ['createdAt']],
			[['member', 'updated_at'], ['updatedAt']],
		].map(c => sql.join(c.map(cwa => sql.identifier(cwa)), sql` AS `)),
		sql`, `
	);

	async getAllMembers(transactionHandler: TrxHandler):Promise<Member[]> {

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return transactionHandler.query<Member>(sql`
       	SELECT ${MemberService.allColumns}
        FROM member`).then(({rows}) => rows.slice(0));

	}

	async getAdmins(transactionHandler: TrxHandler):Promise<Member[]> {

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return transactionHandler.query<Member>(sql`
       	SELECT DISTINCT ${MemberService.allColumnsForJoins} from member
		JOIN admin_role ar on member.id = ar.admin
		`).then(({rows}) => rows.slice(0));

	}

	async getMatching(member: Partial<Member>, transactionHandler: TrxHandler, properties?: (keyof Member)[]): Promise<Member[]> {
		let selectColumns;

		if (properties && properties.length) {
			selectColumns = sql.join(
				properties.map(p => sql.identifier([p])), // TODO: does not work for createdAt and updatedAt
				sql`, `
			);
		}

		// TODO: 'createdAt' and 'updatedAt' are not handled properly - will not match any column.
		const whereConditions = sql.join(
			Object.keys(member)
				.reduce((acc, key: keyof Member) =>
						(key === 'extra' || key === 'createdAt' || key === 'updatedAt') ? acc :
							acc.concat(sql.join([sql.identifier([key]), sql`${member[key]}`], sql` = `)),
					[]),
			sql` AND `
		);

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Member>(sql`
        SELECT ${selectColumns || MemberService.allColumns}
        FROM member
        WHERE ${whereConditions}
      `)
			// TODO: is there a better way?
			.then(({ rows }) => rows.slice(0));
	}

	/**
	 * Get member matching the given `id` or `null`, if not found.
	 * @param id Member's id
	 * @param transactionHandler Database handler
	 * @param properties List of Member properties to fetch - defaults to 'all'
	 */
	async get(id: string, transactionHandler: TrxHandler): Promise<Member> {
		// let selectColumns;
		//
		// if (properties && properties.length) {
		// 	selectColumns = sql.join(
		// 		properties.map(p => sql.identifier([p])),
		// 		sql`, `
		// 	);
		// }

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Member>(sql`
        SELECT ${MemberService.allColumns}
        FROM member
        WHERE id = ${id}
      `)
			.then(({ rows }) => rows[0]);
	}

	async createMemberRole(memberId: string, roleId: string, transactionHandler: TrxHandler): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await transactionHandler.query(sql`
        INSERT INTO admin_role (admin,role)
        VALUES (${memberId},${roleId})
      `);
	}

	async deleteMemberRole(memberId: string, roleId: string, transactionHandler: TrxHandler): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await transactionHandler.query(sql`
        DELETE FROM admin_role
        WHERE admin = ${memberId} AND role = ${roleId}
      `);
	}
}
