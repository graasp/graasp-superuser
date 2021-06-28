import fastify, { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
	PG_CONNECTION_URI, DATABASE_LOGS, DISABLE_LOGS,
	ENVIRONMENT
} from './util/config';
import shared from './schemas/fluent-schema';

import databasePlugin from './plugins/db';
import authPlugin from './plugins/auth/auth';

import {MemberService} from './services/members/db-service';
import MemberServiceAPI from './services/members/service-api';
import {ItemService} from './services/items/db-service';
import ItemServiceAPI from './services/items/service-api';
import {AdminRoleService} from './services/admin_role/db-service';
import AdminRoleServiceAPI from './services/admin_role/service-api';


const decorateFastifyInstance: FastifyPluginAsync = async (fastify) => {
	fastify.decorate('adminRole', { dbService: new AdminRoleService() });
	fastify.decorate('members', { dbService: new MemberService() });
	fastify.decorate('items', { dbService: new ItemService() });
	fastify.decorateRequest('member', null);
	fastify.decorateRequest('memberRole', null);

};

const instance = fastify({ logger: !DISABLE_LOGS });
// const instance = fastify({ logger: { prettyPrint: true, level: 'debug' } });

// load some shared schema definitions
instance.addSchema(shared);

instance
	.register(fp(databasePlugin), { uri: PG_CONNECTION_URI, logs: DATABASE_LOGS })
	.register(fp(decorateFastifyInstance))
	.register(authPlugin, { sessionCookieDomain: (ENVIRONMENT === 'staging' ? 'ielsrv7.epfl.ch' : null) });


instance.register(async (instance) =>{
	instance.register(fp(MemberServiceAPI));
	instance.register(fp(ItemServiceAPI));
	instance.register(fp(AdminRoleServiceAPI));
});

export default instance;
