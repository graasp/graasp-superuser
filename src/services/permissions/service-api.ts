import {FastifyPluginAsync} from 'fastify';
import common from './schemas';
import {PermissionRepository} from './repository';
import {ROUTES_PREFIX} from './routes';
import {GET, GET_ALL} from '../members/routes';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { permissions, db } = fastify;
	const { dbService } = permissions;

	const repository = new PermissionRepository(dbService,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);
		fastify.get(
			GET_ALL.route, async ({memberRole: {role: roleId}, log}) => {
				const route = ROUTES_PREFIX + GET_ALL.route;
				await repository.checkPermissions(roleId, route, GET_ALL.request_method);
				const allMembers = await repository.getAllPermissions();

				return allMembers;
			});

		fastify.get(
			GET.route ,
			async ({memberRole: {role: id} }) => {
				const role = await repository.getPermissions(id);
				return role;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
