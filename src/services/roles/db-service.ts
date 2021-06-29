// global
import {
	sql,
	DatabaseTransactionConnectionType as TrxHandler
} from 'slonik';

import {Role} from '../../interfaces/role';

declare module 'fastify' {
	interface FastifyInstance {
		role: {
			dbService: RoleService
		};
	}
}

export class RoleService {
	// the 'safe' way to dynamically generate the columns names:
	private static allColumns = sql.join(
		[
			'id', 'description',
		].map(c =>
			!Array.isArray(c) ?
				sql.identifier([c]) :
				sql.join(c.map(cwa => sql.identifier([cwa])), sql` AS `)
		),
		sql`, `
	);

	async getAllRoles(dbHandler: TrxHandler): Promise<Role[]> {

		return dbHandler
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		.query<Role>(sql`
				SELECT ${RoleService.allColumns} FROM role
			`).then(({rows}) => rows.slice(0));
	}

	async getRole(id: string, dbHandler: TrxHandler): Promise<Role> {

		return dbHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Role>(sql`
				SELECT ${RoleService.allColumns} 
				FROM role 
				WHERE id = ${id}
			`).then(({rows}) => rows[0]);
	}
}
