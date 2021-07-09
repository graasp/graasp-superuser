// global
import {
	sql,
	DatabaseTransactionConnectionType as TrxHandler
} from 'slonik';

import {Role} from '../../interfaces/role';
import {Permission} from '../../interfaces/permission';
import {AdminRole} from '../../interfaces/admin-role';

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

	private static allColumnsForJoins = sql.join(
		[
			[['role', 'id'], ['id']],
			[['role', 'description'], ['description']],
		].map(c => sql.join(c.map(cwa => sql.identifier(cwa)), sql` AS `)),
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

	async getRoles(adminRoles: AdminRole[], transactionHandler: TrxHandler): Promise<Role[]> {
		const ids = adminRoles.map((adminRole) => adminRole.role);

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Role>(sql`
				SELECT ${RoleService.allColumns} 
				FROM role 
				WHERE id IN (${sql.join(ids,sql `, `)})
			`).then(({rows}) => rows.slice(0));
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

	async createRolePermission(roleId: string, permissionId: string, transactionHandler: TrxHandler): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await transactionHandler.query(sql`
        INSERT INTO role_permission (role,permission)
        VALUES (${roleId},${permissionId})
      `);
	}

	async deleteRolePermission(roleId: string, permissionId: string, transactionHandler: TrxHandler): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await transactionHandler.query(sql`
        DELETE FROM role_permission
        WHERE role = ${roleId} AND permission = ${permissionId}
      `);
	}

	async getRolesByMemberId (memberId: string, transactionHandler: TrxHandler): Promise<Role[]> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return transactionHandler.query<Role>(sql`
			SELECT ${RoleService.allColumnsForJoins} FROM role
			JOIN admin_role ar on role.id = ar.role
			JOIN member m on m.id = ar.admin
			WHERE m.id = ${memberId}
		`).then(({rows}) => rows.slice(0));
	}
}
