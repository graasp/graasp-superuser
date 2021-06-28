import { UnknownExtra } from './extra';

export interface Item<T extends UnknownExtra = UnknownExtra> {
	id: string;
	name: string;
	description: string;
	type: string;
	path: string; // up to ~55 levels deep if we consider the "preferable" length of 2kB, assuming 1 byte = 1 char in the path
	extra: T;
	creator: string;
	createdAt: string;
	updatedAt: string;
}
