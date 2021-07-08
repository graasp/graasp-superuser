// global
import {
	sql,
	DatabaseTransactionConnectionType as TrxHandler
} from 'slonik';
import { UnknownExtra } from '../../interfaces/extra';

import {AdminRole} from '../../interfaces/admin-role';

declare module 'fastify' {
	interface FastifyInstance {
		adminRole: {
			dbService: AdminRoleService
		};
	}
}

export class AdminRoleService {
	// the 'safe' way to dynamically generate the columns names:
	private static allColumns = sql.join(
		[
			'id', 'admin', 'role',
		].map(c =>
			!Array.isArray(c) ?
				sql.identifier([c]) :
				sql.join(c.map(cwa => sql.identifier([cwa])), sql` AS `)
		),
		sql`, `
	);

	async getMemberRoles(id: string, transactionHandler: TrxHandler): Promise<AdminRole[]> {

		return transactionHandler
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		.query<Role>(sql`
				SELECT admin_role.*
				FROM member
				JOIN admin_role ON admin_role.admin = member.id
				WHERE member.id = ${id}
			`).then(({rows}) => rows.slice(0));
	}
}
