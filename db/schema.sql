CREATE TABLE [IF NOT EXISTS] candidates (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR (30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    industry_connected BOOLEAN NOT NULL
);
CREATE TABLE [IF NOT EXISTS] parties (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);