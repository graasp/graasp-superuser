import fastify, { FastifyPluginAsync } from 'fastify';
import common, { getOne, getBy, updateOne } from './schemas';
import {
	sql,
	DatabaseTransactionConnectionType as TrxHandler
} from 'slonik';
import {MemberRepository} from './repository';
import { Member } from '../interfaces/member';

const ROUTES_PREFIX = '/members';

const plugin: FastifyPluginAsync = async (fastify) => {
	const { members, db } = fastify;
	const { dbService } = members;

	const repository = new MemberRepository(dbService,db.pool);
	fastify.addSchema(common);

	fastify.register(async function (fastify) {
		fastify.get(
			'/all' , async (request,reply) => {
					const allMembers = await repository.getAllMembers();
					return allMembers;
			});
	}, { prefix: ROUTES_PREFIX });
};

export default plugin;
