--DROP TABLE sections_roles;
--DROP TABLE sections_resources;
--DROP TABLE resources;
--DROP TABLE sections;

CREATE TABLE IF NOT EXISTS public.sections (
    id identity,
    title character varying(255) not null,
    visible boolean default true not null,
    html_description clob not null,
    image_url character varying(255),
    parent integer references sections (id)
);

CREATE TABLE IF NOT EXISTS public.resources (
    id identity,
    title character varying(255) not null,
    jcr_path character varying(255) not null unique,
    visible boolean default true not null,
    html_description clob not null,
    image_url character varying(255)
);

CREATE TABLE IF NOT EXISTS public.sections_resources (
    id identity,
    section_id integer not null references sections (id),
    resource_id integer not null references resources (id),
    constraint uk_sections_resources unique (section_id, resource_id)
);

CREATE TABLE IF NOT EXISTS public.sections_roles (
    id identity,
    section_id integer not null references sections (id),
    role_name character varying(255) not null,
    constraint uk_sections_roles unique (section_id, role_name)
);
