import { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {AdminRoleRepository} from './repository';

const ROUTES_PREFIX = '/admin-role';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { adminRole, db } = fastify;
	const { dbService } = adminRole;

	const repository = new AdminRoleRepository(dbService,db.pool);
	fastify.addSchema(common);

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', async function (request, reply) {
			await fastify.verifyAuthentication(request,reply);
			await fastify.verifyPermission(request,reply);
		});

	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
