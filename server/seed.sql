DROP DATABASE IF EXISTS atlasdb;
CREATE DATABASE atlasdb;

\c atlasdb;

CREATE TABLE fullNames (
  ID SERIAL PRIMARY KEY,
  name VARCHAR
);

INSERT INTO fullNames (name)
  VALUES ('Test');