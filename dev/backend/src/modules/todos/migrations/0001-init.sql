BEGIN;

CREATE TABLE IF NOT EXISTS todo (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL,
    time INT NOT NULL
);

CREATE TABLE IF NOT EXISTS todo_yobta (
    id TEXT REFERENCES todo(id),
    id_c INT,
    id_m INT,
    text_c INT,
    text_m INT,
    completed_c INT,
    completed_m INT,
    time_c INT,
    time_m INT
);

COMMIT;
