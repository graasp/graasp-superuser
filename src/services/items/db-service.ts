// global
import {DatabaseTransactionConnectionType as TrxHandler, sql} from 'slonik';
import {UnknownExtra} from '../../interfaces/extra';

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


	async getAllItems<E extends UnknownExtra>(dbHandler: TrxHandler): Promise<Item<E>[]> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return dbHandler.query<Item<E>>(sql`
       	SELECT ${ItemService.allColumns}
        FROM item`).then(({rows}) => rows.slice(0));
	}

	async get<E extends UnknownExtra>(id: string, transactionHandler: TrxHandler): Promise<Item<E>> {
		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Item<E>>(sql`
        SELECT ${ItemService.allColumns}
        FROM item
        WHERE id = ${id}
      `)
			.then(({rows}) => rows[0] || null);
	}
}
