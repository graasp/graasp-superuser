import fastify, { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {MemberRepository} from './repository';

const ROUTES_PREFIX = '/members';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { members, db } = fastify;
	const { dbService } = members;

	const repository = new MemberRepository(dbService,db.pool);
	fastify.addSchema(common);

	fastify.register(async function (fastify) {

		fastify.addHook('preHandler', fastify.verifyAuthentication );

		fastify.get(
			'/getAll' , async (request,reply) => {
					const allMembers = await repository.getAllMembers();
					return allMembers;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
