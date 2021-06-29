// global
import fs from 'fs';
import path from 'path';
import jwt, { Secret, VerifyOptions, SignOptions } from 'jsonwebtoken';
import { promisify } from 'util';
import { JsonWebTokenError } from 'jsonwebtoken';

import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import fastifyAuth from 'fastify-auth';
import fastifySecureSession from 'fastify-secure-session';
import fastifyBearerAuth from 'fastify-bearer-auth';

import {
  AUTH_TOKEN_JWT_SECRET, AUTH_TOKEN_EXPIRATION_IN_MINUTES,
  TOKEN_BASED_AUTH, REFRESH_TOKEN_JWT_SECRET, REFRESH_TOKEN_EXPIRATION_IN_MINUTES
} from '../../util/config';

// other services
import { Member } from '../../interfaces/member';

// local
import { register, login, auth } from './schemas';
import { AuthPluginOptions } from './interfaces/auth';
import {MemberRepository} from '../../services/members/repository';
import {AdminRoleRepository} from '../../services/admin_role/repository';

const promisifiedJwtVerify = promisify<string, Secret, VerifyOptions, { sub: string }>(jwt.verify);
const promisifiedJwtSign = promisify<{ sub: string }, Secret, SignOptions, string>(jwt.sign);

const plugin: FastifyPluginAsync<AuthPluginOptions> = async (fastify, options) => {
  const {
    sessionCookieDomain: domain,
    uniqueViolationErrorName = 'UniqueIntegrityConstraintViolationError' // TODO: can we improve this?
  } = options;
  const { log, db, members: { dbService: mS }, adminRole: { dbService: rS} } = fastify;
  const  memberRepository = new MemberRepository(mS,db.pool);
  const adminRoleRepository = new AdminRoleRepository(rS,db.pool);

  // cookie based auth
  fastify.register(fastifySecureSession, {
    // TODO: maybe change to the 'secret' option, which is just a string (makes the boot slower).
    // Production needs its own key: https://github.com/fastify/fastify-secure-session#using-a-pregenerated-key
    key: fs.readFileSync(path.join(process.cwd(), 'secure-session-secret-key')),
    cookie: { domain, path: '/' }
  });

  async function verifyMemberInSession(request: FastifyRequest, reply: FastifyReply) {
    const { session } = request;
    const memberId = session.get('member');

    if (!memberId) {
      reply.status(401);
      throw new Error('no valid session');
    }

    // TODO: do we really need to get the user from the DB? (or actor: { id } is enough?)
    // maybe when the groups are implemented it will be necessary.
    const member = await memberRepository.get(memberId);
    const adminRole = await adminRoleRepository.getMemberRole(memberId);

    if(!adminRole || !member) {
      reply.status(401);
      session.delete();
      throw new Error('orphan session');
    }

    request.member = member;
    request.memberRole = adminRole;
  }

  async function fetchMemberInSession(request: FastifyRequest) {
    const { session } = request;
    const memberId = session.get('member');

    if (!memberId) return;

    // TODO: do we really need to get the user from the DB? (or actor: { id } is enough?)
    // maybe when the groups are implemented it will be necessary.
    request.member = await mS.get(memberId, db.pool);
  }

  fastify.decorate('validateSession', verifyMemberInSession);

  // for token based auth
  async function verifyMemberInAuthToken(jwtToken: string, request: FastifyRequest) {
    try {
      const { routerPath } = request;
      const refreshing = '/m/auth/refresh' === routerPath;
      const secret = refreshing ? REFRESH_TOKEN_JWT_SECRET : AUTH_TOKEN_JWT_SECRET;

      const { sub: memberId } = await promisifiedJwtVerify(jwtToken, secret, {});

      if (refreshing) {
        request.memberId = memberId;
      } else {
        const member = await mS.get(memberId, db.pool);
        if (!member) return false;
        request.member = member;
      }

      return true;
    } catch (error) {
      const { log } = request;
      log.warn('Invalid auth token');
      return false;
    }
  }

  await fastify
    .register(fastifyAuth)
    .register(fastifyBearerAuth, {
      addHook: false,
      keys: new Set<string>(),
      auth: verifyMemberInAuthToken
    });

  fastify.decorate('attemptVerifyAuthentication',
    TOKEN_BASED_AUTH ?
      fastify.auth([
        verifyMemberInSession,
        fastify.verifyBearerAuth,
        // this will make the chain of auth schemas to never fail,
        // which is what we want to happen with this auth hook
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        async () => { }
      ]) :
      fetchMemberInSession // this hook, by itself, will also never fail
  );

  const verifyAuthentication = TOKEN_BASED_AUTH ?
    fastify.auth([verifyMemberInSession, fastify.verifyBearerAuth]) :
    verifyMemberInSession;

  fastify.decorate('verifyAuthentication', verifyAuthentication);


};

export default fp(plugin);
