import dotenv from 'dotenv';

enum Environment {
    production = 'production',
    staging = 'staging',
    development = 'development'
}

export let ENVIRONMENT: Environment;

switch (process.env.NODE_ENV) {
case Environment.production:
    dotenv.config({ path: 'production.env' });
    ENVIRONMENT = Environment.production;
    break;
case Environment.staging:
    dotenv.config({ path: 'staging.env' });
    ENVIRONMENT = Environment.staging;
    break;
    // case Environment.development:
default:
    dotenv.config({ path: 'development.env' });
    ENVIRONMENT = Environment.development;
    break;
}

const prod = ENVIRONMENT === Environment.production;
const { PORT: port } = process.env;

if (!port) {
    console.error('PORT environment variable missing.');
    process.exit(1);
}

export const PROTOCOL = process.env.PROTOCOL || 'http';
export const HOSTNAME = process.env.HOSTNAME || 'localhost';
export const EMAIL_LINKS_HOST = process.env.EMAIL_LINKS_HOST || HOSTNAME;

export const PORT = !prod ? port :
    // if launched using pm2 (multiple instances), get the intance number
    (port + (parseInt(process.env['NODE_APP_INSTANCE'], 10) || 0));

export const HOST = prod ? HOSTNAME : `${HOSTNAME}:${PORT}`;
export const CLIENT_HOST = process.env.CLIENT_HOST;

export const { PG_CONNECTION_URI, DATABASE_LOGS, DISABLE_LOGS } = process.env;

if (!PG_CONNECTION_URI) {
    console.error('PG_CONNECTION_URI environment variable missing.');
    process.exit(1);
}

// Graasp constants

/**
 * Graasp's "internal" actor
 */
export const GRAASP_ACTOR = { id: '12345678-1234-1234-1234-123456789012' };
/**
 * JWT
 */
export const JWT_SECRET = process.env.JWT_SECRET;
/** Register token expiration, in minutes */
export const REGISTER_TOKEN_EXPIRATION_IN_MINUTES = 60;
/** Login token expiration, in minutes */
export const LOGIN_TOKEN_EXPIRATION_IN_MINUTES = 30;

// Token based auth
export const TOKEN_BASED_AUTH = process.env.TOKEN_BASED_AUTH === 'true';
export const AUTH_TOKEN_JWT_SECRET = process.env.AUTH_TOKEN_JWT_SECRET;
export const REFRESH_TOKEN_JWT_SECRET = process.env.REFRESH_TOKEN_JWT_SECRET;
/** Auth token expiration, in minutes */
export const AUTH_TOKEN_EXPIRATION_IN_MINUTES = +process.env. AUTH_TOKEN_EXPIRATION_IN_MINUTES;
/** Refresh token expiration, in minutes */
export const REFRESH_TOKEN_EXPIRATION_IN_MINUTES = +process.env. REFRESH_TOKEN_EXPIRATION_IN_MINUTES;

// Graasp limits

/**
 * Maximun items tree depth
 */
export const MAX_TREE_LEVELS = 15;
/**
 * Maximun number of children an item can have
 */
export const MAX_NUMBER_OF_CHILDREN = 10;
/**
 * Maximun number of descendants (in the item's subtree) for a `delete`
 */
export const MAX_DESCENDANTS_FOR_DELETE = 5;
/**
 * Maximun number of descendants (in the item's subtree) for a `update`
 */
export const MAX_DESCENDANTS_FOR_UPDATE = 5;
/**
 * Maximun number of descendants (in the item's subtree) for a `move`
 */
export const MAX_DESCENDANTS_FOR_MOVE = 15;
/**
 * Maximun number of descendants (in the item's subtree) for a `copy`
 */
export const MAX_DESCENDANTS_FOR_COPY = 20;

/**
 * Maximun number of targets in a "many" request that only reads data (`get`)
 */
export const MAX_TARGETS_FOR_READ_REQUEST = MAX_TREE_LEVELS;
/**
 * Maximun number of targets in a "many" request that modifies data (`update`, `delete`)
 */
export const MAX_TARGETS_FOR_MODIFY_REQUEST = 20;
/**
 * Maximun number of targets in a "many" request for which the server
 * will execute the tasks and return the results in the same request's response.
 *
 * A request with more targets than this limit should get an immediate `202` response,
 * and the results should be pushed to the client (websockets, ...) as they happen.
 */
export const MAX_TARGETS_FOR_MODIFY_REQUEST_W_RESPONSE = 5;

// Graasp mailer config
export const MAILER_CONFIG_SMTP_HOST = process.env.MAILER_CONFIG_SMTP_HOST;
export const MAILER_CONFIG_USERNAME = process.env.MAILER_CONFIG_USERNAME;
export const MAILER_CONFIG_PASSWORD = process.env.MAILER_CONFIG_PASSWORD;
export const MAILER_CONFIG_FROM_EMAIL = 'no-reply@graasp.org';

// Graasp file item
// TODO: should this be here?
export const FILE_STORAGE_ROOT_PATH = process.env.FILE_STORAGE_ROOT_PATH || process.env.TMPDIR;

// Graasp S3 file item
// TODO: should this be here?
export const S3_FILE_ITEM_PLUGIN = process.env.S3_FILE_ITEM_PLUGIN === 'true';
export const S3_FILE_ITEM_REGION = process.env.S3_FILE_ITEM_REGION;
export const S3_FILE_ITEM_BUCKET = process.env.S3_FILE_ITEM_BUCKET;
export const S3_FILE_ITEM_ACCESS_KEY_ID = process.env.S3_FILE_ITEM_ACCESS_KEY_ID;
export const S3_FILE_ITEM_SECRET_ACCESS_KEY = process.env.S3_FILE_ITEM_SECRET_ACCESS_KEY;

// Graasp embedded link item
// TODO: should this be here?
export const EMBEDDED_LINK_ITEM_PLUGIN = process.env.EMBEDDED_LINK_ITEM_PLUGIN === 'true';
export const EMBEDDED_LINK_ITEM_IFRAMELY_HREF_ORIGIN = process.env.EMBEDDED_LINK_ITEM_IFRAMELY_HREF_ORIGIN;

// Graasp apps
export const APPS_PLUGIN = process.env.APPS_PLUGIN;
export const APPS_JWT_SECRET = process.env.APPS_JWT_SECRET;

export enum REQUEST_METHODS  {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

export const DIRECTION = {
    ASC: 'ASC',
    DESC: 'DESC'
};

export const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
    ALL: 'ALL'
};

export const LEVEL = {
    ALL: 'ALL'
};

export const ALL_SYMBOL = '.*';

export const SUPER_USER_ROLE_UUID = process.env.SUPER_USER_ROLE_UUID;

export const SECURE_SESSION_SECRET_KEY = process.env.SECURE_SESSION_SECRET_KEY;
