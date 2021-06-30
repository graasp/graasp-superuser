export interface IdParam { id: string }
export interface ChildrenParam {
	id: string,
	direction: string
	level: string
}
export interface IdsParams { id: string[] }
export interface ParentIdParam { parentId?: string }
