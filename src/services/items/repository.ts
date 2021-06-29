import {DatabaseTransactionHandler} from '../../plugins/db';
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

	async get(itemId) {
		const item = await this.itemService.get(itemId, this.handler);
		return item;
	}
}
