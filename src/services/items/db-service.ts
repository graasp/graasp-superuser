// global
import {
	sql,
	DatabaseTransactionConnectionType as TrxHandler
} from 'slonik';
import { UnknownExtra } from '../../interfaces/extra';

import {Item} from '../../interfaces/item';

declare module 'fastify' {
	interface FastifyInstance {
		items: {
			dbService: ItemService
		};
	}
}

export class ItemService {
	// the 'safe' way to dynamically generate the columns names:
	private static allColumns = sql.join(
		[
			'id', 'name', 'description', 'type', 'path', 'extra', 'creator',
			['created_at', 'createdAt'],
			['updated_at', 'updatedAt'],
		].map(c =>
			!Array.isArray(c) ?
				sql.identifier([c]) :
				sql.join(c.map(cwa => sql.identifier([cwa])), sql` AS `)
		),
		sql`, `
	);


	async getAllItems(dbHandler: TrxHandler):Promise<Item[]> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return dbHandler.query<Item>(sql`
       	SELECT ${ItemService.allColumns}
        FROM item`).then(({rows}) => rows.slice(0));
	}
}
