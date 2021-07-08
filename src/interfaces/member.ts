// global
import { Session } from 'fastify-secure-session';
import { Actor } from '../interfaces/actor';
import { UnknownExtra } from '../interfaces/extra';
import {AdminRole} from './admin-role';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session;
    member: Member;
    memberRoles: AdminRole[]
  }
}

export enum MemberType {
  Individual = 'individual',
  Group = 'group'
}

export interface Member<E extends UnknownExtra = UnknownExtra> extends Actor {
  name: string;
  email: string;
  type: MemberType;
  extra: E;
  createdAt: string;
  updatedAt: string;
}
