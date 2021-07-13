import {FastifyPluginAsync} from 'fastify';
import common from './schemas';
import {PermissionRepository} from './repository';
import {ROUTES_PREFIX, POST, DELETE, GET_OWN, GET_BY_ID, PATCH, GET_ALL} from './routes';
import {createPermission, deletePermission, getOne, getPermissions, update} from './fluent-schema';
import {ChildrenParam, IdParam, PermissionBody, RoleParam} from '../../interfaces/requests';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { permissions, db } = fastify;
	const { dbService } = permissions;

	const repository = new PermissionRepository(dbService,db.pool);

	fastify.addSchema(common);

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler',fastify.verifyAuthAndPermission);

		fastify.get<{ Params: IdParam }>(
			GET_BY_ID, { schema: getOne },
			async ({  params: {id}, log }) => {
				const permission = await repository.get(id);
				return permission;
			}
		);

		fastify.get(
			GET_ALL, async () => {
				const permissions = await repository.getAllPermissions();
				return permissions;

			});

		fastify.post<{ Body: PermissionBody }>(
			POST, { schema: createPermission },
			async ({  body, log }) => {
				const permission = await repository.createPermission(body);
				return permission;
			}
		);

		fastify.delete<{ Params: IdParam }>(
			DELETE, { schema: deletePermission },
			async ({  params: {id}, log }) => {
				const permission = await repository.deletePermission(id);
				return permission;
			}
		);

		fastify.patch<{Params: IdParam }>(
			PATCH, { schema: update},
			async ({params: {id},body},reply) => {
				const permission = await repository.update(id,body);
				return permission;
			}
		);

	}, { prefix: ROUTES_PREFIX });

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);

		fastify.get(
			GET_OWN ,
			async ({memberRoles }) => {
				const permissions = await repository.getOwnPermissions(memberRoles);
				return permissions;
			});
	}, { prefix: ROUTES_PREFIX });


};

export default plugin;
