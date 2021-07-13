import {DatabaseTransactionHandler} from '../../plugins/db';
import {ItemService} from './db-service';
import {ItemNotFound} from '../../util/graasp-error';

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
		if (!item) throw new ItemNotFound(itemId);
		return item;
	}

	async getChildren(itemId,order ,level ) {
		const item = await this.get(itemId);
		if (!item) throw new ItemNotFound(itemId);

		const children = await this.itemService.getDescendants(item,this.handler,order,level);

		return children;
	}

	async getItemsByMember(memberId) {
		const items = await this.itemService.getItemsByMemberId(memberId,this.handler);
		return items;
	}
}
