import { DatabaseTransactionHandler } from '../../plugins/db';
import {UnknownExtra} from '../../interfaces/extra';
import {ItemService} from './db-service';

export class ItemRepository  {
	protected itemService: ItemService;
	protected handler: DatabaseTransactionHandler;

	constructor(itemService: ItemService, handler: DatabaseTransactionHandler) {
		this.itemService = itemService;
		this.handler = handler;
	}

	async getAllItems() {
		const allItems = await this.itemService.getAllItems(this.handler);
		return allItems;
	}
}
