import {FastifyPluginAsync} from 'fastify';
import common, {getOne} from './schemas';
import {MemberRepository} from './repository';
import {IdParam} from '../../interfaces/requests';
import {GET, GET_ALL, POST_MEMBER_ROLE, ROUTES_PREFIX} from './routes';
import {PermissionRepository} from '../permissions/repository';

const plugin: FastifyPluginAsync = async (fastify) => {
	const {
		members: {dbService: dbServiceM},
		permissions: {dbService: dbServiceP},
		db
	} = fastify;

	const memberRepository = new MemberRepository(dbServiceM,db.pool);
	const permissionRepository = new PermissionRepository(dbServiceP,db.pool);
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

		// fastify.get<{ Params: IdParam }>(
		// 	POST_MEMBER_ROLE, {schema: getOne},
		// 	async ({ params: {id}, memberRoles: {role: userRoleId}}) => {
		// 		const permissions = await permissionRepository.getPermissionsByRole(userRoleId);
		//
		// 		const member = await memberRepository.get(id);
		// 		return member;
		// 	});

	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
