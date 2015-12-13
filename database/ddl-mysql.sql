CREATE TABLE IF NOT EXISTS sections (
    id mediumint unsigned not null auto_increment primary key,
    title character varying(255) not null,
    visible boolean default true not null,
    html_description text not null,
    image_url character varying(255),
    parent integer references sections (id)
) engine=innodb charset=utf8;

CREATE TABLE IF NOT EXISTS resources (
    id mediumint unsigned not null auto_increment primary key,
    title character varying(255) not null,
    jcr_path character varying(255) not null unique,
    visible boolean default true not null,
    html_description text not null,
    image_url character varying(255)
) engine=innodb charset=utf8;

CREATE TABLE IF NOT EXISTS sections_resources (
    id mediumint unsigned not null auto_increment primary key,
    section_id mediumint unsigned not null,
    resource_id mediumint unsigned not null,
    constraint uk_sections_resources unique (section_id, resource_id),
    constraint fk_sres_section foreign key (section_id) references sections(id),
    constraint fk_sres_resource foreign key (resource_id) references resources(id)
) engine=innodb charset=utf8;

CREATE TABLE IF NOT EXISTS sections_roles (
    id mediumint unsigned not null auto_increment primary key,
    section_id mediumint unsigned not null,
    role_name character varying(255) not null,
    constraint uk_sections_roles unique (section_id, role_name),
    constraint fk_sroles_section foreign key (section_id) references sections(id)
) engine=innodb charset=utf8;
