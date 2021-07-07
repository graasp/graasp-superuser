// global
import {
	sql,
	DatabaseTransactionConnectionType as TrxHandler
} from 'slonik';

import {Role} from '../../interfaces/role';
import {Permission} from '../../interfaces/permission';

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

	async getAllRoles(transactionHandler: TrxHandler): Promise<Role[]> {

		return transactionHandler
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		.query<Role>(sql`
				SELECT ${RoleService.allColumns} FROM role
			`).then(({rows}) => rows.slice(0));
	}

	async getRole(id: string, transactionHandler: TrxHandler): Promise<Role> {

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Role>(sql`
				SELECT ${RoleService.allColumns} 
				FROM role 
				WHERE id = ${id}
			`).then(({rows}) => rows[0]);
	}

	async getPermissions(role: Role, transactionHandler: TrxHandler): Promise<Role> {
		const { description } = role;

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Role>(sql`
        INSERT INTO role (description)
        VALUES (${description})
        RETURNING ${RoleService.allColumns}
      `)
			.then(({ rows }) => rows[0]);
	}

	async create(role: Role, transactionHandler: TrxHandler): Promise<Role> {
		const { description } = role;

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Role>(sql`
        INSERT INTO role (description)
        VALUES (${description})
        RETURNING ${RoleService.allColumns}
      `)
			.then(({ rows }) => rows[0]);
	}

	async delete(id: string, transactionHandler: TrxHandler): Promise<Role> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return transactionHandler.query<Role>(sql`
        DELETE FROM role
        WHERE id = ${id}
        RETURNING ${RoleService.allColumns}
      `).then(({ rows }) => rows[0] || null);
	}
}
