import fastify, { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {RoleRepository} from './repository';
import {PermissionRepository} from '../permissions/repository';
import {ROUTES_PREFIX,GET,GET_ALL} from './routes';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { role, db, permissions } = fastify;
	const { dbService: dbServiceR } = role;
	const { dbService: dbServiceP } = permissions;

	const roleRepository = new RoleRepository(dbServiceR,db.pool);
	const permissionRepository = new PermissionRepository(dbServiceP,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {

		fastify.addHook('preHandler', async function (request, reply) {
			await fastify.verifyAuthentication(request,reply);
			await fastify.verifyPermission(request,reply);
		});

		fastify.get(
			GET_ALL.path, async () => {
				const allMembers = await roleRepository.getAllRoles();

				return allMembers;
			});

	}, { prefix: ROUTES_PREFIX });

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);

		fastify.get(
			GET.path ,
			async ({memberRole: {role: id} }) => {
				const role = await roleRepository.getCurrentRole(id);
				return role;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
