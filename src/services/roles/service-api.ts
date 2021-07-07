import { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {RoleRepository} from './repository';
import {ROUTES_PREFIX,GET,GET_ALL, DELETE, POST} from './routes';
import {IdParam, PermissionBody} from '../../interfaces/requests';
import {createPermission, deletePermission} from '../permissions/fluent-schema';
import {Role} from '../../interfaces/role';
import {createRole} from './fluent-schema';
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
				const permission = await permissionRepository.getPermissionsByRole(id);
				const role = await roleRepository.deleteRole(id,permission);
				return role;
			}
		);


	}, { prefix: ROUTES_PREFIX });

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);

		fastify.get(
			GET ,
			async ({memberRole: {role: id} }) => {
				const role = await roleRepository.getCurrentRole(id);
				return role;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
