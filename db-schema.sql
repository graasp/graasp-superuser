create table if not exists permission
(
    id uuid default uuid_generate_v4() not null,
    endpoint varchar(500) not null,
    request_method varchar(6) not null,
    description varchar(5000) not null,
    constraint permission_pkey
        primary key (id),
    constraint endpoint_method
        unique (endpoint, request_method)
);

create table if not exists role
(
    id uuid default uuid_generate_v4() not null,
    description varchar(100) not null,
    constraint role_pkey
        primary key (id),
    constraint description_key
        unique (description)
);

create table if not exists role_permission
(
    id uuid default uuid_generate_v4() not null,
    role uuid,
    permission uuid,
    constraint role_permission_pkey
        primary key (id),
    constraint role_permission_key
        unique (role, permission),
    constraint role_permision_role_fkey
        foreign key (role) references role
            on delete cascade,
    constraint role_permision_permission_fkey
        foreign key (permission) references permission
            on delete cascade
);

create table if not exists admin_role
(
    id uuid default uuid_generate_v4() not null,
    admin uuid not null,
    role uuid not null,
    constraint admin_role_pkey
        primary key (id),
    constraint admin_role_unique_key
        unique (admin, role),
    constraint admin_role_role_fkey
        foreign key (role) references role,
    constraint admin_role_admin_fkey
        foreign key (admin) references member
);4
