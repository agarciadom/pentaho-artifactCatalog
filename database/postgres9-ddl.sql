SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET client_min_messages = warning;

CREATE EXTENSION IF NOT EXISTS adminpack;

--DROP TABLE sections_resources;
--DROP TABLE resources;
--DROP TABLE sections;

CREATE TABLE sections (
    id serial,
    title character varying(255) not null,
    visible boolean default true not null,
    html_description text not null,
    image_url character varying(255),
    constraint pk_sections primary key (id),
    parent integer references sections (id),
	allowed_roles character varying[]
);

CREATE TABLE resources (
    id serial,
    title character varying(255) not null,
    jcr_path character varying(255) not null unique,
    visible boolean default true not null,
    html_description text not null,
    image_url character varying(255),
    constraint pk_resources primary key (id)
);

CREATE TABLE sections_resources (
    id serial primary key,
    section_id integer not null references sections (id),
    resource_id integer not null references resources (id),
    constraint uk_sections_resources unique (section_id, resource_id)
);
