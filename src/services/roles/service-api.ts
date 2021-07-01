import { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {RoleRepository} from './repository';
import {ROUTES_PREFIX,GET,GET_ALL} from './routes';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { role, db } = fastify;
	const { dbService: dbServiceR } = role;

	const roleRepository = new RoleRepository(dbServiceR,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {

		fastify.addHook('preHandler',fastify.verifyAuthAndPermission);

		fastify.get(
			GET_ALL, async () => {
				const allMembers = await roleRepository.getAllRoles();

				return allMembers;
			});

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
