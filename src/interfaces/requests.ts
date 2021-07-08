export interface IdParam { id: string }
export interface IdsParams { id: string[] }
export interface ParentIdParam { parentId?: string }
export interface PermissionIdParam { permissionId: string}
export interface PermissionBody {
	endpoint: string,
	description: string,
	method: string
}
export interface ChildrenParam {
	level?: any
	direction?: string
}
export interface RoleBody {
	description:string
}
export interface RoleParam {
	roleId?: string
}
