// global
import { Actor } from './actor';
import { UnknownExtra } from './extra';

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
