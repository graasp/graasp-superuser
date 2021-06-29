import fastify, { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {PermissionRepository} from './repository';

const ROUTES_PREFIX = '/permission';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { permissions, db } = fastify;
	const { dbService } = permissions;

	const repository = new PermissionRepository(dbService,db.pool);
	fastify.addSchema(common);

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);

	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
