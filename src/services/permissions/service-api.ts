import {FastifyPluginAsync} from 'fastify';
import common from './schemas';
import {PermissionRepository} from './repository';
import {ROUTES_PREFIX,GET,GET_ALL} from './routes';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { permissions, db } = fastify;
	const { dbService } = permissions;

	const repository = new PermissionRepository(dbService,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler',fastify.verifyAuthAndPermission);

		fastify.get(
			GET_ALL, async () => {
				const allMembers = await repository.getAllPermissions();

				return allMembers;
			});

	}, { prefix: ROUTES_PREFIX });

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);

		fastify.get(
			GET ,
			async ({memberRole: {role: id} }) => {
				const role = await repository.getPermissions(id);
				return role;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
