import fastify, { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {ItemRepository} from './repository';

const ROUTES_PREFIX = '/items';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { items, db } = fastify;
	const { dbService } = items;

	const repository = new ItemRepository(dbService,db.pool);
	fastify.addSchema(common);

	fastify.register(async function (fastify) {

		fastify.addHook('preHandler', fastify.verifyAuthentication);

		fastify.get(
			'/getAll' , async (request,reply) => {
					const allItems = await repository.getAllItems();
					return allItems;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
