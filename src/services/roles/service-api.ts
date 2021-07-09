import { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {RoleRepository} from './repository';
import {
	ROUTES_PREFIX,
	GET_ALL,
	DELETE,
	POST_ROLE_PERMISSION,
	POST,
	DELETE_ROLE_PERMISSION,
	GET_OWN, GET_BY_ID
} from './routes';
import {IdParam, PermissionIdParam} from '../../interfaces/requests';
import {Role} from '../../interfaces/role';
import {createRole, createRolePermission, deleteRole, deleteRolePermission,getOne} from './fluent-schema';
import {PermissionRepository} from '../permissions/repository';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { role, db, permissions } = fastify;
	const { dbService: dbServiceR } = role;
	const { dbService: dbServiceP } = permissions;
	const roleRepository = new RoleRepository(dbServiceR,db.pool);
	const permissionRepository = new PermissionRepository(dbServiceP,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {

		fastify.addHook('preHandler',fastify.verifyAuthAndPermission);

		fastify.get(
			GET_ALL, async () => {
				const allMembers = await roleRepository.getAllRoles();

				return allMembers;
			});

		fastify.get<{ Params: IdParam }>(
			GET_BY_ID, { schema: getOne },
			async ({  params: {id}, log }) => {
				const role = await roleRepository.get(id);
				return role;
			}
		);

		fastify.post<{ Body: Role }>(
			POST, { schema: createRole },
			async ({  body, log }) => {
				const role = await roleRepository.createRole(body);
				return role;
			}
		);

		fastify.delete<{ Params: IdParam }>(
			DELETE, { schema: deleteRole },
			async ({  params: {id}, log }) => {
				const permissions = await permissionRepository.getPermissionsByRole(id);
				const role = await roleRepository.deleteRole(id,permissions);
				return role;
			}
		);

		fastify.post<{ Params: IdParam, Body: PermissionIdParam }>(
			POST_ROLE_PERMISSION, { schema: createRolePermission  },
			async ({superUser, params: {id}, body, log },reply) => {
				const { permissionId } = body;
				const permission = await permissionRepository.get(permissionId);
				const rolePermissions = await permissionRepository.getPermissionsByRole(id);
				await roleRepository.createRolePermission(superUser,permission,rolePermissions,id);
				reply.status(204);			}
		);

		fastify.delete<{ Params: IdParam, Body: PermissionIdParam }>(
			DELETE_ROLE_PERMISSION, { schema: deleteRolePermission  },
			async ({superUser, params: {id}, body, log },reply) => {
				const { permissionId } = body;
				const permission = await permissionRepository.get(permissionId);
				const rolePermissions = await permissionRepository.getPermissionsByRole(id);
				await roleRepository.deleteRolePermission(superUser,permission,rolePermissions,id);
				reply.status(204);
			}
		);

	}, { prefix: ROUTES_PREFIX });

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);

		fastify.get(
			GET_OWN ,
			async ({memberRoles }) => {
				return memberRoles;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
