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
    AUTH_TOKEN_JWT_SECRET,
    AUTH_TOKEN_EXPIRATION_IN_MINUTES,
    TOKEN_BASED_AUTH,
    REFRESH_TOKEN_JWT_SECRET,
    REFRESH_TOKEN_EXPIRATION_IN_MINUTES,
    LOGIN_TOKEN_EXPIRATION_IN_MINUTES,
    JWT_SECRET, EMAIL_LINKS_HOST, PROTOCOL, CLIENT_HOST, SUPER_USER_UUID
} from '../../util/config';

// other services
import { Member } from '../../interfaces/member';

// local
import { register, login, auth } from './schemas';
import { AuthPluginOptions } from './interfaces/auth';
import {MemberRepository} from '../../services/members/repository';
import {AdminRoleRepository} from '../../services/admin_role/repository';
import {GET_ALL, ROUTES_PREFIX} from '../../services/members/routes';
import {PermissionRepository} from '../../services/permissions/repository';
import {RequestNotAllowed} from '../../util/graasp-error';
import {RoleRepository} from '../../services/roles/repository';

const promisifiedJwtVerify = promisify<string, Secret, VerifyOptions, { sub: string }>(jwt.verify);
const promisifiedJwtSign = promisify<{ sub: string }, Secret, SignOptions, string>(jwt.sign);

const plugin: FastifyPluginAsync<AuthPluginOptions> = async (fastify, options) => {
  const {
    sessionCookieDomain: domain,
    uniqueViolationErrorName = 'UniqueIntegrityConstraintViolationError' // TODO: can we improve this?
  } = options;
  const { log, db, members: { dbService: mS }, permissions: { dbService: pS}, role: { dbService: rS} } = fastify;
  const  memberRepository = new MemberRepository(mS,db.pool);
  const permissionRepository = new PermissionRepository(pS,db.pool);
  const roleRepository = new RoleRepository(rS,db.pool);

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
    const adminRole = await roleRepository.getMemberRole(memberId);

    if(!adminRole || !member) {
      reply.status(401);
      session.delete();
      throw new Error('orphan session');
    }

    request.member = member;
    request.memberRoles = adminRole;
    request.superUser = Boolean(adminRole.find((role) => role.id === SUPER_USER_UUID));
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



  async function verifyPermission(request: FastifyRequest, reply: FastifyReply){
        const { memberRoles,routerMethod,url} = request;
        const permission = await permissionRepository.checkPermissions(memberRoles,url,routerMethod);
        if (permission.length === 0) throw new RequestNotAllowed();
  }

  fastify.decorate('verifyPermission',verifyPermission);

  const verifyAuthAndPermission = TOKEN_BASED_AUTH ?
      fastify.auth([verifyMemberInSession, fastify.verifyBearerAuth,fastify.verifyPermission],
          {
              relation: 'and',
              run: 'all'
          }) :
      fastify.auth([verifyMemberInSession, fastify.verifyPermission],
          {
          relation: 'and',
          run: 'all'
      });


  fastify.decorate('verifyAuthAndPermission',verifyAuthAndPermission);

  async function generateAuthTokensPair(memberId: string): Promise<{ authToken: string, refreshToken: string }> {
    const [authToken, refreshToken] = await Promise.all([
      promisifiedJwtSign(
          { sub: memberId }, AUTH_TOKEN_JWT_SECRET,
          { expiresIn: `${AUTH_TOKEN_EXPIRATION_IN_MINUTES}m` }
      ),
      promisifiedJwtSign(
          { sub: memberId }, REFRESH_TOKEN_JWT_SECRET,
          { expiresIn: `${REFRESH_TOKEN_EXPIRATION_IN_MINUTES}m` }
      )
    ]);
    return { authToken, refreshToken };
  }

  fastify.decorate('generateAuthTokensPair', generateAuthTokensPair);




  fastify.register(async function (fastify) {
    async function generateLoginLinkAndEmailIt(member, reRegistrationAttempt?) {
      // generate token with member info and expiration
      const token = await promisifiedJwtSign({ sub: member.id }, JWT_SECRET,
          { expiresIn: `${LOGIN_TOKEN_EXPIRATION_IN_MINUTES}m` });

      const link = `${PROTOCOL}://${EMAIL_LINKS_HOST}/auth?t=${token}`;
      // don't wait for mailer's response; log error and link if it fails.
      fastify.mailer.sendLoginEmail(member, link, reRegistrationAttempt)
          .catch(err => log.warn(err, `mailer failed. link: ${link}`));
    }

    // login
    fastify.post<{ Body: { email: string } }>(
        '/login',
        { schema: login },
        async ({ body, log }, reply) => {
          const members = await memberRepository.getMatching(body);
          const adminRole = await roleRepository.getMemberRole(members[0].id);

          if (members.length && adminRole) {
            const member = members[0];
            await generateLoginLinkAndEmailIt(member);
          }
          else if(!members.length) {
            const { email } = body;
            log.warn(`Login attempt with non-existent email '${email}'`);
          }
          else if(!adminRole && members.length) {
              const { email } = members[0];
              log.warn(`${email} is not an Admin'`);
          }

          reply.status(204);
        }
    );

    // authenticate
    fastify.get<{ Querystring: { t: string } }>(
        '/auth',
        { schema: auth },
        async (request, reply) => {
          const { query: { t: token }, session } = request;

          try {
            // verify and extract member info
            const { sub: memberId } = await promisifiedJwtVerify(token, JWT_SECRET, {});

            // add member id to session
            session.set('member', memberId);

            if (CLIENT_HOST) {
              reply.redirect(303, `//${CLIENT_HOST}`);
            } else {
              reply.status(204);
            }
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              session.delete();
              reply.status(401);
            }

            throw error;
          }
        }
    );

    // logout
    fastify.get(
        '/logout',
        async ({ session }, reply) => {
          // remove session
          session.delete();
          reply.status(204);
        }
    );
  });


  // token based auth and endpoints
  fastify.register(async function (fastify) {

    fastify.decorateRequest('memberId', null);

    fastify.get<{ Querystring: { t: string } }>(
        '/auth',
        { schema: auth },
        async (request, reply) => {
          const { query: { t: token } } = request;

          try {
            const { sub: memberId } = await promisifiedJwtVerify(token, JWT_SECRET, {});
            // TODO: should we fetch/test the member from the DB?
            return generateAuthTokensPair(memberId);
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              reply.status(401);
            }
            throw error;
          }
        }
    );

    fastify.get(
        '/auth/refresh',
        { preHandler: fastify.verifyBearerAuth },
        async ({ memberId }) => generateAuthTokensPair(memberId)
    );

  }, { prefix: '/m' });
};

export default fp(plugin);
