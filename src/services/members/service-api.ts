import {FastifyPluginAsync} from 'fastify';
import common, {getOne} from './schemas';
import {MemberRepository} from './repository';
import {IdParam, RoleIdParam} from '../../interfaces/requests';
import {
	DELETE_MEMBER_ROLE,
	GET,
	GET_ADMINS,
	GET_ALL, GET_ITEMS,
	GET_PERMISSIONS,
	GET_ROLE,
	POST_MEMBER_ROLE,
	ROUTES_PREFIX
} from './routes';
import {PermissionRepository} from '../permissions/repository';
import {RoleRepository} from '../roles/repository';
import {createMemberRole, deleteMemberRole} from './fluent-schema';
import {ItemRepository} from '../items/repository';

const plugin: FastifyPluginAsync = async (fastify) => {
	const {
		members: {dbService: dbServiceM},
		permissions: {dbService: dbServiceP},
		role: { dbService: dbServiceR},
		items: { dbService: dbServiceI},
		db
	} = fastify;

	const memberRepository = new MemberRepository(dbServiceM,db.pool);
	const permissionRepository = new PermissionRepository(dbServiceP,db.pool);
	const roleRepository = new RoleRepository(dbServiceR,db.pool);
	const itemRepository = new ItemRepository(dbServiceI,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {

		fastify.addHook('preHandler',fastify.verifyAuthAndPermission);

		fastify.get<{ Params: IdParam }>(
			GET,
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
			GET_ITEMS, async ({ params: {id}}) => {
				const roles = await itemRepository.getItemsByMember(id);
				return roles;
			}
		);

		fastify.get<{ Params: IdParam}>(
			GET_PERMISSIONS, async ({ params: {id}}) => {
				const roles = await permissionRepository.getPermissionsByMember(id,true);
				return roles;
			}
		);

		fastify.post<{ Params: IdParam, Body: RoleIdParam }>(
			POST_MEMBER_ROLE, { schema: createMemberRole  },
			async ({superUser, params: {id}, body, log },reply) => {
				const { roleId } = body;
				await memberRepository.createMemberRole(superUser,roleId,id);
				reply.status(204);			}
		);

		fastify.delete<{ Params: IdParam, Body: RoleIdParam }>(
			DELETE_MEMBER_ROLE, { schema: deleteMemberRole  },
			async ({params: {id}, body, log },reply) => {
				const { roleId } = body;
				await memberRepository.deleteRolePermission(roleId,id);
				reply.status(204);			}
		);

	}, { prefix: ROUTES_PREFIX });

	fastify.register(async function (fastify) {

		fastify.addHook('preHandler', fastify.verifyAuthentication);

		// get current
		fastify.get('/current', async ({member}) => member);
	}, { prefix: ROUTES_PREFIX });

};

export default plugin;
