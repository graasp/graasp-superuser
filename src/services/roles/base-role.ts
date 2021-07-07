// local
import { Role } from '../..//interfaces/role';
import {ALL_SYMBOL, METHODS} from '../../util/config';

export class BaseRole implements Role {

	readonly id: string;
	description: string;
	constructor(
		description: string,
	) {
		this.description = description;
	}

}
