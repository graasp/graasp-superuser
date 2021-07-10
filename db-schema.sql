CREATE TABLE IF NOT EXISTS "permission"
(
    "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "endpoint" VARCHAR(500) NOT NULL,
    "method" VARCHAR(6) NOT NULL,
    "description" VARCHAR(5000) NOT NULL,
    CONSTRAINT "endpoint_method"
        UNIQUE ("endpoint", "method")
);

CREATE TABLE IF NOT EXISTS "role"
(
    "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "description" VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "role_permission"
(
    "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "role" uuid REFERENCES "role" ("id") ON DELETE CASCADE,
    "permission" uuid REFERENCES "permission" ("id") ON DELETE CASCADE,
     CONSTRAINT "role_permission_unique_key"
            UNIQUE ("role_id", "permission")
);

CREATE TABLE IF NOT EXISTS "admin_role"
(
    "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "admin" uuid REFERENCES "member" ("id") ON DELETE CASCADE,
    "role" uuid REFERENCES "role" ("id") ON DELETE CASCADE,
    CONSTRAINT "admin_role_unique_key"
        unique (admin, role)
);

INSERT INTO role (id,description)
VALUES ('4f43341f-a5a9-4b1e-a104-fc0f9a3e985f','SuperUser');

INSERT INTO permission (id,endpoint,request_method,description)
VALUES ('60e64678-beeb-4763-908f-050ac663eba7','.*','.*','SuperUser Rights');

INSERT INTO role_permission (role,permission)
VALUES ('4f43341f-a5a9-4b1e-a104-fc0f9a3e985f','60e64678-beeb-4763-908f-050ac663eba7');
