import fastify, { FastifyPluginAsync } from 'fastify';
import common, {getOne} from './schemas';
import {MemberRepository} from './repository';
import {IdParam} from '../../interfaces/requests';
import {PermissionRepository} from '../permissions/repository';
import {GET, GET_ALL, ROUTES_PREFIX} from './routes';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { members, db, permissions } = fastify;
	const { dbService: dbServiceM } = members;
	const { dbService: dbServiceP } = permissions;

	const memberRepository = new MemberRepository(dbServiceM,db.pool);
	const permissionRepository = new PermissionRepository(dbServiceP,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {

		fastify.addHook('preHandler', fastify.verifyAuthentication );

		fastify.get(
			GET_ALL.route, async ({ memberRole, log }) => {
				const route = ROUTES_PREFIX+GET_ALL.route;
				await permissionRepository.checkPermissions(memberRole.role,route,GET_ALL.request_method);
				const allMembers = await memberRepository.getAllMembers();

				return allMembers;
			});

		fastify.get<{ Params: IdParam }>(
			GET.route ,{ schema: getOne },
			async ({memberRole, params: { id } }) => {
				const route = ROUTES_PREFIX+GET.route;
				await permissionRepository.checkPermissions(memberRole.role,route,GET.request_method);
				const member = await memberRepository.get(id);
				return member;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
