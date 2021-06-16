import fastify, { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
	PG_CONNECTION_URI, DATABASE_LOGS, DISABLE_LOGS,

} from './util/config';
import shared from './schemas/fluent-schema';

import databasePlugin from './plugins/db';
import {MemberService} from './members/db-service';
import MemberServiceAPI from './members/service-api';

const decorateFastifyInstance: FastifyPluginAsync = async (fastify) => {
	fastify.decorate('members', { dbService: new MemberService(), taskManager: null });
};

const instance = fastify({ logger: !DISABLE_LOGS });
// const instance = fastify({ logger: { prettyPrint: true, level: 'debug' } });

// load some shared schema definitions
instance.addSchema(shared);

instance
	.register(fp(databasePlugin), { uri: PG_CONNECTION_URI, logs: DATABASE_LOGS })
	.register(fp(decorateFastifyInstance));

instance.register(async (instance) =>{
	instance.register(fp(MemberServiceAPI));
});

export default instance;
