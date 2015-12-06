--DROP TABLE sections_roles;
--DROP TABLE sections_resources;
--DROP TABLE resources;
--DROP TABLE sections;

CREATE TABLE IF NOT EXISTS sections (
    id serial,
    title character varying(255) not null,
    visible boolean default true not null,
    html_description text not null,
    image_url character varying(255),
    constraint pk_sections primary key (id),
    parent integer references sections (id)
);

CREATE TABLE IF NOT EXISTS resources (
    id serial,
    title character varying(255) not null,
    jcr_path character varying(255) not null unique,
    visible boolean default true not null,
    html_description text not null,
    image_url character varying(255),
    constraint pk_resources primary key (id)
);

CREATE TABLE IF NOT EXISTS sections_resources (
    id serial primary key,
    section_id integer not null references sections (id),
    resource_id integer not null references resources (id),
    constraint uk_sections_resources unique (section_id, resource_id)
);

CREATE TABLE IF NOT EXISTS sections_roles (
    id serial primary key,
    section_id integer not null references sections (id),
    role_name character varying(255) not null,
    constraint uk_sections_roles unique (section_id, role_name)
);
