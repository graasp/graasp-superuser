// global
import {
	sql,
	DatabaseTransactionConnectionType as TrxHandler
} from 'slonik';

import {Permission} from '../../interfaces/permission';
import {Item} from '../../interfaces/item';
import {Role} from '../../interfaces/role';
import {AdminRole} from '../../interfaces/admin-role';

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

	async getPermissions(roles: Role[], transactionHandler: TrxHandler): Promise<Permission[]> {
		const ids = roles.map((role) => role.id);
		return transactionHandler
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		.query<Permission>(sql`
					SELECT ${PermissionService.allColumnsForJoins}
					FROM permission
					INNER JOIN role_permission
					ON permission.id = role_permission.permission
					JOIN role
					ON role_permission.role = role.id
					
					WHERE role.id IN (${sql.join(ids,sql `, `)})
			`).then(({rows}) => rows.slice(0));
	}


	async getPermissionsByRoleId(roleId: string, transactionHandler: TrxHandler): Promise<Permission[]> {

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Permission>(sql`
					SELECT ${PermissionService.allColumnsForJoins}
					FROM permission
					INNER JOIN role_permission
					ON permission.id = role_permission.permission
					JOIN role
					ON role_permission.role = role.id
					
					WHERE role.id = ${roleId}
			`).then(({rows}) => rows.slice(0));
	}

	async getPermissionsByMemberId(memberId: string, transactionHandler: TrxHandler): Promise<Permission[]> {

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Permission>(sql`
					SELECT ${PermissionService.allColumnsForJoins}
					FROM permission
					JOIN role_permission rp on permission.id = rp.permission
					JOIN role r on r.id = rp.role
					JOIN admin_role ar on r.id = ar.role
					JOIN member m on m.id = ar.admin
					WHERE m.id = ${memberId}
			`).then(({rows}) => rows.slice(0));
	}

	async getAllPermissions(transactionHandler: TrxHandler): Promise<Permission[]> {

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Permission>(sql`
				SELECT ${PermissionService.allColumns} FROM permission
			`).then(({rows}) => rows.slice(0));
	}

	async get(id: string,transactionHandler: TrxHandler): Promise<Permission> {

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Permission>(sql`
        SELECT ${PermissionService.allColumns}
        FROM permission
        WHERE id = ${id}
      `)
			.then(({rows}) => rows[0] || null);
	}

	async create(permission: Permission, transactionHandler: TrxHandler): Promise<Permission> {
		const { description, endpoint, requestMethod } = permission;

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Permission>(sql`
        INSERT INTO permission (endpoint, request_method, description)
        VALUES (${endpoint}, ${requestMethod}, ${description})
        RETURNING ${PermissionService.allColumns}
      `)
			.then(({ rows }) => rows[0]);
	}

	async delete(id: string, transactionHandler: TrxHandler): Promise<Permission> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return transactionHandler.query<Permission>(sql`
        DELETE FROM permission
        WHERE id = ${id}
        RETURNING ${PermissionService.allColumns}
      `).then(({ rows }) => rows[0] || null);
	}
}
