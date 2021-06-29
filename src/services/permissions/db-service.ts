// global
import {
	sql,
	DatabaseTransactionConnectionType as TrxHandler
} from 'slonik';

import {Permission} from '../../interfaces/permission';

declare module 'fastify' {
	interface FastifyInstance {
		permissions: {
			dbService: PermissionService
		};
	}
}

export class PermissionService {
	// the 'safe' way to dynamically generate the columns names:
	private static allColumns = sql.join(
		[
			'id', 'endpoint', ['request_method','requestMethod'],'description',
		].map(c =>
			!Array.isArray(c) ?
				sql.identifier([c]) :
				sql.join(c.map(cwa => sql.identifier([cwa])), sql` AS `)
		),
		sql`, `
	);

	private static allColumnsForJoins = sql.join(
		[
			[['permission', 'id'], ['id']],
			[['permission', 'description'], ['description']],
			[['permission', 'endpoint'], ['endpoint']],
			[['permission', 'request_method'], ['requestMethod']],
		].map(c => sql.join(c.map(cwa => sql.identifier(cwa)), sql` AS `)),
		sql`, `
	);

	async getPermissions(id: string, dbHandler: TrxHandler): Promise<Permission[]> {

		return dbHandler
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		.query<Permission>(sql`
					SELECT ${PermissionService.allColumnsForJoins}
					FROM permission
					INNER JOIN role_permission
					ON permission.id = role_permission.permission
					JOIN role
					ON role_permission.role = role.id
					
					WHERE role.id = ${id}
			`).then(({rows}) => rows.slice(0));
	}

	async getAllPermissions(dbHandler: TrxHandler): Promise<Permission[]> {

		return dbHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Permission>(sql`
				SELECT ${PermissionService.allColumns} FROM permission
			`).then(({rows}) => rows.slice(0));
	}
}
