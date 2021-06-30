import fastify, { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
	PG_CONNECTION_URI, DATABASE_LOGS, DISABLE_LOGS,
	ENVIRONMENT, MAILER_CONFIG_SMTP_HOST, MAILER_CONFIG_USERNAME, MAILER_CONFIG_PASSWORD, MAILER_CONFIG_FROM_EMAIL
} from './util/config';
import shared from './schemas/fluent-schema';

import databasePlugin from './plugins/db';
import authPlugin from './plugins/auth/auth';
import mailerPlugin from 'graasp-mailer';

import {MemberService} from './services/members/db-service';
import MemberServiceAPI from './services/members/service-api';
import {ItemService} from './services/items/db-service';
import ItemServiceAPI from './services/items/service-api';
import {AdminRoleService} from './services/admin_role/db-service';
import AdminRoleServiceAPI from './services/admin_role/service-api';
import {PermissionService} from './services/permissions/db-service';
import PermissionServiceAPI from './services/permissions/service-api';
import {RoleService} from './services/roles/db-service';
import RoleServiceAPI from './services/roles/service-api';

const decorateFastifyInstance: FastifyPluginAsync = async (fastify) => {
	fastify.decorate('adminRole', { dbService: new AdminRoleService() });
	fastify.decorate('permissions', { dbService: new PermissionService() });
	fastify.decorate('members', { dbService: new MemberService() });
	fastify.decorate('items', { dbService: new ItemService() });
	fastify.decorate('role', { dbService: new RoleService() });
	fastify.decorateRequest('member', null);
	fastify.decorateRequest('memberRole', null);
	fastify.decorateRequest('permission', null);
};

const instance = fastify({ logger: !DISABLE_LOGS });
// const instance = fastify({ logger: { prettyPrint: true, level: 'debug' } });

// load some shared schema definitions
instance.addSchema(shared);

instance
	.register(fp(databasePlugin), { uri: PG_CONNECTION_URI, logs: DATABASE_LOGS })
	.register(fp(decorateFastifyInstance))
	.register(mailerPlugin, {
		host: MAILER_CONFIG_SMTP_HOST,
		username: MAILER_CONFIG_USERNAME,
		password: MAILER_CONFIG_PASSWORD,
		fromEmail: MAILER_CONFIG_FROM_EMAIL
	})
	.register(authPlugin, { sessionCookieDomain: (ENVIRONMENT === 'staging' ? 'ielsrv7.epfl.ch' : null) });

instance.register(async (instance) =>{
	instance.register(fp(MemberServiceAPI));
	instance.register(fp(ItemServiceAPI));
	instance.register(fp(AdminRoleServiceAPI));
	instance.register(fp(PermissionServiceAPI));
	instance.register(fp(RoleServiceAPI));
});

export default instance;
