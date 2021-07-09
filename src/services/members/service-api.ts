import {FastifyPluginAsync} from 'fastify';
import common, {getOne} from './schemas';
import {MemberRepository} from './repository';
import {IdParam, PermissionIdParam, RoleIdParam} from '../../interfaces/requests';
import {GET, GET_ADMINS, GET_ALL, GET_PERMISSIONS, GET_ROLE, POST_MEMBER_ROLE, ROUTES_PREFIX} from './routes';
import {PermissionRepository} from '../permissions/repository';
import {AdminRoleRepository} from '../admin_role/repository';
import {RoleRepository} from '../roles/repository';
import {POST_ROLE_PERMISSION} from '../roles/routes';
import {createRolePermission} from '../roles/fluent-schema';
import {createMemberRole} from './fluent-schema';

const plugin: FastifyPluginAsync = async (fastify) => {
	const {
		members: {dbService: dbServiceM},
		permissions: {dbService: dbServiceP},
		adminRole: { dbService: dbServiceAR},
		role: { dbService: dbServiceR},
		db
	} = fastify;

	const memberRepository = new MemberRepository(dbServiceM,db.pool);
	const permissionRepository = new PermissionRepository(dbServiceP,db.pool);
	const roleRepository = new RoleRepository(dbServiceR,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {

		fastify.addHook('preHandler',fastify.verifyAuthAndPermission);

		fastify.get<{ Params: IdParam }>(
			GET, {schema: getOne},
			async ({ params: {id}}) => {
				const member = await memberRepository.get(id);
				return member;
			});

		fastify.get(
			GET_ALL, async () => {
				const allMembers = await memberRepository.getAllMembers();

				return allMembers;
			});

		fastify.get(
			GET_ADMINS,async () => {
				const admins = await memberRepository.getAdmins();
				return admins;
			});

		fastify.get<{ Params: IdParam}>(
			GET_ROLE, async ({ params: {id}}) => {
				const roles = await roleRepository.getMemberRole(id);
				return roles;
			}
		);

		fastify.get<{ Params: IdParam}>(
			GET_PERMISSIONS, async ({ params: {id}}) => {
				const roles = await permissionRepository.getPermissionsByMember(id,true);
				return roles;
			}
		);

		// fastify.post<{ Params: IdParam, Body: RoleIdParam }>(
		// 	POST_ROLE_PERMISSION, { schema: createMemberRole  },
		// 	async ({superUser, params: {id}, body, log },reply) => {
		// 		const { roleId } = body;
		// 		const role = await roleRepository.get(permissionId);
		// 		const rolePermissions = await permissionRepository.getPermissionsByRole(id);
		// 		await roleRepository.createRolePermission(superUser,permission,rolePermissions,id);
		// 		reply.status(204);			}
		// );

	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
