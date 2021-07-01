import {FastifyPluginAsync} from 'fastify';
import common, {getOne} from './schemas';
import {MemberRepository} from './repository';
import {IdParam} from '../../interfaces/requests';
import {GET, GET_ALL, ROUTES_PREFIX} from './routes';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { members, db } = fastify;
	const { dbService: dbServiceM } = members;

	const memberRepository = new MemberRepository(dbServiceM,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {

		fastify.addHook('preHandler',fastify.verifyAuthAndPermission);

		fastify.get(
			GET_ALL, async () => {
				const allMembers = await memberRepository.getAllMembers();

				return allMembers;
			});

		fastify.get<{ Params: IdParam }>(
			GET, {schema: getOne},
			async ({ params: {id}}) => {
				const member = await memberRepository.get(id);
				return member;
			});

	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
