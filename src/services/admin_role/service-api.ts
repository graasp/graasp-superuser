import fastify, { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {AdminRoleRepository} from './repository';

const ROUTES_PREFIX = '/admin-role';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { adminRole, db } = fastify;
	const { dbService } = adminRole;

	const repository = new AdminRoleRepository(dbService,db.pool);
	fastify.addSchema(common);

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);

	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
