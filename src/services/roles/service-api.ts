import { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {RoleRepository} from './repository';
import {ROUTES_PREFIX, GET, GET_ALL, DELETE, POST_ROLE_PERMISSION, POST, DELETE_ROLE_PERMISSION} from './routes';
import {IdParam, PermissionBody, PermissionIdParam} from '../../interfaces/requests';
import {createPermission, deletePermission} from '../permissions/fluent-schema';
import {Role} from '../../interfaces/role';
import {createRole, createRolePermission, deleteRolePermission} from './fluent-schema';
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


		fastify.post<{ Body: Role }>(
			POST, { schema: createRole },
			async ({  body, log }) => {
				const role = await roleRepository.createRole(body);
				return role;
			}
		);

		fastify.delete<{ Params: IdParam }>(
			DELETE, { schema: deletePermission },
			async ({  params: {id}, log }) => {
				const permissions = await permissionRepository.getPermissionsByRole(id);
				const role = await roleRepository.deleteRole(id,permissions);
				return role;
			}
		);

		fastify.post<{ Params: IdParam, Body: PermissionIdParam }>(
			POST_ROLE_PERMISSION, { schema: createRolePermission  },
			async ({ params: {id}, body, log },reply) => {
				const { permissionId } = body;
				const permission = await permissionRepository.getPermission(permissionId);
				const rolePermissions = await permissionRepository.getPermissionsByRole(id);
				await roleRepository.createRolePermission(permission,rolePermissions,id);
				reply.status(204);			}
		);

		fastify.delete<{ Params: IdParam, Body: PermissionIdParam }>(
			DELETE_ROLE_PERMISSION, { schema: deleteRolePermission  },
			async ({ params: {id}, body, log },reply) => {
				const { permissionId } = body;
				const permission = await permissionRepository.getPermission(permissionId);
				const rolePermissions = await permissionRepository.getPermissionsByRole(id);
				await roleRepository.deleteRolePermission(permission,rolePermissions,id);
				reply.status(204);
			}
		);

	}, { prefix: ROUTES_PREFIX });

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);

		fastify.get(
			GET ,
			async ({memberRoles }) => {
				const roles = await roleRepository.getCurrentRoles(memberRoles);
				return roles;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
