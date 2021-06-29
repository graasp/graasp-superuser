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
			'id', 'endpoint', 'request_method','description',
		].map(c =>
			!Array.isArray(c) ?
				sql.identifier([c]) :
				sql.join(c.map(cwa => sql.identifier([cwa])), sql` AS `)
		),
		sql`, `
	);

	async getPermissions(id: string, dbHandler: TrxHandler): Promise<Permission[]> {

		return dbHandler
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		.query<Permission>(sql`
				SELECT public.permission.*
				FROM public.role
				JOIN public.role_permission
				ON public.role_permission.role = public.role.id
				JOIN public.permission
				ON public.role_permission.permission = public.permission.id

				WHERE public.role.id = ${id}
			`).then(({rows}) => rows.slice(0));
	}
}
