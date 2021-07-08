import { FastifyError } from 'fastify';

type ErrorOrigin = 'core' | 'plugin' | 'unknown' | string;

export interface GraaspError extends FastifyError {
  data?: unknown;
  origin: ErrorOrigin
}

export interface GraaspErrorDetails {
  code: string;
  message: string;
  statusCode: number;
}

export abstract class BaseGraaspError implements GraaspError {
  name: string;
  code: string
  statusCode?: number;
  message: string;
  data?: unknown;
  origin: ErrorOrigin;

  constructor({ code, statusCode, message }: GraaspErrorDetails, data?: unknown) {
    this.name = code;
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.origin = 'core';
    this.data = data;
  }
}

export class ItemNotFound extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR001', statusCode: 404, message: 'Item not found' }, data);
  }
}
export class UserCannotReadItem extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR002', statusCode: 403, message: 'User cannot read item' }, data);
  }
}
export class UserCannotWriteItem extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR003', statusCode: 403, message: 'User cannot write item' }, data);
  }
}
export class UserCannotAdminItem extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR004', statusCode: 403, message: 'User cannot admin item' }, data);
  }
}
export class InvalidMembership extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR005', statusCode: 400, message: 'Membership with this permission level cannot be created for this member in this item' }, data);
  }
}
export class ItemMembershipNotFound extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR006', statusCode: 404, message: 'Item membership not found' }, data);
  }
}
export class ModifyExisting extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR007', statusCode: 400, message: 'Cannot create membership for member in item. Should modify existing one' }, data);
  }
}
export class InvalidPermissionLevel extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR008', statusCode: 400, message: 'Cannot change to a worse permission level than the one inherited' }, data);
  }
}
export class HierarchyTooDeep extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR009', statusCode: 403, message: 'Hierarchy too deep' }, data);
  }
}
export class TooManyChildren extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR010', statusCode: 403, message: 'Too many children' }, data);
  }
}
export class TooManyDescendants extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR011', statusCode: 403, message: 'Too many descendants' }, data);
  }
}
export class InvalidMoveTarget extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR012', statusCode: 400, message: 'Invalid item to move to' }, data);
  }
}
export class MemberNotFound extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR013', statusCode: 404, message: 'Member not found' }, data);
  }
}

export class CannotModifyOtherMembers extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR014', statusCode: 403, message: 'Member cannot modify other member' }, data);
  }
}
export class MemberNotAdmin extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR015', statusCode: 403, message: 'Member is not an Admin' }, data);
  }
}
export class RequestNotAllowed extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR016', statusCode: 403, message: 'Member is not allowed to perform this request' }, data);
  }
}

export class DeleteSuperUserPermission extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR017', statusCode: 403, message: 'SuperUser permission cannot be deleted' }, data);
  }
}

export class DeleteSuperUserRole extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR017', statusCode: 403, message: 'Role with superuser permission cannot be deleted' }, data);
  }
}

export class CreateSuperUserRolePermission extends BaseGraaspError {
  constructor() {
    super({ code: 'GSUERR018', statusCode: 403, message: 'Only SuperUsers can assign SuperUser privilege to a Role' });
  }
}

export class DeleteSuperUserRolePermission extends BaseGraaspError {
  constructor() {
    super({ code: 'GSUERR019', statusCode: 403, message: 'Only SuperUsers can delete SuperUser privilege to a Role' });
  }
}

export class DatabaseError extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR998', statusCode: 500, message: 'Database error' }, data);
  }
}
export class UnexpectedError extends BaseGraaspError {
  constructor(data?: unknown) {
    super({ code: 'GSUERR999', statusCode: 500, message: 'Unexpected error' }, data);
    this.origin = 'unknown';
  }
}
