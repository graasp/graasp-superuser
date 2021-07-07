import {FastifyPluginAsync} from 'fastify';
import common from './schemas';
import {PermissionRepository} from './repository';
import {ROUTES_PREFIX, GET, POST, DELETE, GET_OWN, GET_BY_ID} from './routes';
import {createPermission, deletePermission, getOne, getPermissions} from './fluent-schema';
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
				const permission = await repository.getPermission(id);
				return permission;
			}
		);

		fastify.get<{ Querystring: RoleParam}>(
			GET, {schema: getPermissions}, async ({query: {roleId}} ) => {

				console.log(roleId);

				if(roleId){
					const permissions = await repository.getPermissionsByRole(roleId);
					return permissions;
				}
				else{
					const permissions = await repository.getAllPermissions();

					return permissions;
				}

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

	}, { prefix: ROUTES_PREFIX });

	fastify.register(async function (fastify) {
		fastify.addHook('preHandler', fastify.verifyAuthentication);

		fastify.get(
			GET_OWN ,
			async ({memberRole: {role: id} }) => {
				const role = await repository.getOwnPermissions(id);
				return role;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
