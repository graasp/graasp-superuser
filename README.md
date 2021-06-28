# Graasp Superuser
## Requirements

* Install PostgreSQL 12
* Node 14

## Installation and Setup

1. Run `yarn`
2. Create a database using `db-schema.sql`
3. Create an environment variable `development.env` and set the following value:
```
# Application server
# PROTOCOL=http
# HOSTNAME=localhost
PORT=3000
# EMAIL_LINKS_HOST=
# CLIENT_HOST=

# JWT secret
JWT_SECRET=

# PostgreSQL connection string: Required
PG_CONNECTION_URI= 

# Slonik database logging (uncomment both)
# DATABASE_LOGS=true
# ROARR_LOG=true

# Graasp file item file storage path
FILE_STORAGE_ROOT_PATH=

# Graasp s3 file item
S3_FILE_ITEM_PLUGIN=false
# S3_FILE_ITEM_REGION=
# S3_FILE_ITEM_BUCKET=
# S3_FILE_ITEM_ACCESS_KEY_ID=
# S3_FILE_ITEM_SECRET_ACCESS_KEY=

# Graasp embedded link item
EMBEDDED_LINK_ITEM_PLUGIN=false
# EMBEDDED_LINK_ITEM_IFRAMELY_HREF_ORIGIN=<protocol>://<hostname>:<port>

# Graasp apps
APPS_PLUGIN=true
APPS_JWT_SECRET=

```
4. Run `npm run-script build`
5. Run `npm run-script serve` to start the backend or `npm run-script watch-node` to monitor changes during development
