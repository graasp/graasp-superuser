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

	async getDescendants(item: Item, transactionHandler: TrxHandler,
		direction: ('ASC' | 'DESC') = 'ASC', levels: number | 'ALL' = 'ALL', properties?: (keyof Item)[]): Promise<Item[]> {
		let selectColumns;

		if (properties && properties.length) {
			selectColumns = sql.join(
				properties.map(p => sql.identifier([p])),
				sql`, `
			);
		}

		const levelLimit = levels !== 'ALL' && levels > 0 ?
			sql`AND nlevel(path) <= nlevel(${item.path}) + ${levels}` : sql``;

		return transactionHandler
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.query<Item>(sql`
        SELECT ${selectColumns || ItemService.allColumns} FROM item
        WHERE path <@ ${item.path}
          AND id != ${item.id}
          ${levelLimit}
        ORDER BY nlevel(path) ${direction === 'DESC' ? sql`DESC` : sql`ASC`}
      `) // `AND id != ${item.id}` because <@ includes the item's path
			// TODO: is there a better way to avoid the error of assigning
			// this result to a mutable property? (.slice(0))
			.then(({ rows }) => rows.slice(0));
	}

}
