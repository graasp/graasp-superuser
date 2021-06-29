import fastify, { FastifyPluginAsync } from 'fastify';
import common from './schemas';
import {RoleRepository} from './repository';
import {GET, GET_ALL} from '../members/routes';
import {IdParam} from '../../interfaces/requests';
import {getOne} from '../members/schemas';
import {MemberRepository} from '../members/repository';
import {PermissionRepository} from '../permissions/repository';
import {ROUTES_PREFIX} from './routes';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { role, db, permissions } = fastify;
	const { dbService: dbServiceR } = role;
	const { dbService: dbServiceP } = permissions;

	const roleRepository = new RoleRepository(dbServiceR,db.pool);
	const permissionRepository = new PermissionRepository(dbServiceP,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);
		fastify.get(
			GET_ALL.route, async ({ memberRole, log }) => {
				const route = ROUTES_PREFIX+GET_ALL.route;
				await permissionRepository.checkPermissions(memberRole.role,route,GET_ALL.request_method);
				const allMembers = await roleRepository.getAllRoles();

				return allMembers;
			});

		fastify.get(
			GET.route ,
			async ({memberRole: {role: id} }) => {
				const role = await roleRepository.getCurrentRole(id);
				return role;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
