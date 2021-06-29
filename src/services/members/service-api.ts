import {FastifyPluginAsync} from 'fastify';
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
			GET_ALL.path, async ({memberRole: {role: roleId}, log}) => {
				await permissionRepository.checkPermissions(roleId, ROUTES_PREFIX, GET_ALL);
				const allMembers = await memberRepository.getAllMembers();

				return allMembers;
			});

		fastify.get<{ Params: IdParam }>(
			GET.path, {schema: getOne},
			async ({memberRole: {role: roleId}, params: {id}}) => {
				await permissionRepository.checkPermissions(roleId, ROUTES_PREFIX, GET);
				const member = await memberRepository.get(id);
				return member;
			});

	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
