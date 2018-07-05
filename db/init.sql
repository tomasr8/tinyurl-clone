CREATE ROLE nodejs WITH LOGIN ENCRYPTED PASSWORD 'Monaco';
CREATE DATABASE tinyurl;
GRANT CONNECT ON DATABASE tinyurl TO nodejs;

-- switch to the DB
\c tinyurl
CREATE TABLE ips(
  id serial PRIMARY KEY,
  ip inet NOT NULL
);

CREATE UNIQUE INDEX ips_ip_idx ON ips(ip);

CREATE TABLE urls(
  id serial PRIMARY KEY,
  short_url varchar,
  full_url varchar,
  date_created timestamp NOT NULL DEFAULT now(),
  -- created_by inet NOT NULL
  created_by integer,
      FOREIGN KEY (created_by)
      REFERENCES ips(id)
);

CREATE UNIQUE INDEX urls_short_url_idx ON urls(short_url);
CREATE UNIQUE INDEX urls_full_url_idx ON urls(full_url);
CREATE INDEX urls_created_by_idx ON urls(created_by);

GRANT ALL PRIVILEGES ON TABLE urls TO nodejs;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nodejs;

