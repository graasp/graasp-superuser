import {FastifyPluginAsync} from 'fastify';
import common from './schemas';
import {ItemRepository} from './repository';
import {GET, GET_ALL, GET_CHILDREN, ROUTES_PREFIX} from './routes';
import {ChildrenParam, IdParam} from '../../interfaces/requests';
import {getOne} from '../members/schemas';
import {getChildren} from './fluent-schema';

const plugin: FastifyPluginAsync = async (fastify) => {
	const {items, db} = fastify;
	const {dbService: dbServiceI} = items;

	const itemsRepository = new ItemRepository(dbServiceI, db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {

		// fastify.addHook('preHandler', async function (request, reply) {
		// 	await fastify.verifyAuthentication(request,reply);
		// 	await fastify.verifyPermission(request,reply);
		// });

		fastify.addHook('preHandler',fastify.verifyAuthAndPermission);

		fastify.get(
			GET_ALL, async () => {
				const allItems = await itemsRepository.getAllItems();
				return allItems;
			});

		fastify.get<{ Params: IdParam }>(
			GET,
			async ({ params: {id}}) => {
				const item = await itemsRepository.get(id);
				return item;
			});

		fastify.get<{ Params: IdParam,Querystring: ChildrenParam}>(
			GET_CHILDREN, {schema: getChildren},
			async ({ params:{id},query:{level, direction} }) => {
				const children = await itemsRepository.getChildren(id,direction,level);
				return children;
			});

	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
