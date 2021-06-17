// global
import { Actor } from './actor';
import { UnknownExtra } from './extra';

export interface Member extends Actor {
  name: string;
  email: string;
  extra: any;
  createdAt: string;
  updatedAt: string;
}

