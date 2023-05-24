BEGIN;

CREATE TABLE IF NOT EXISTS todo (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL,
    time BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS todo_yobta (
    id TEXT REFERENCES todo(id),
    id_c BIGINT DEFAULT 0,
    id_m BIGINT DEFAULT 0,
    text_c BIGINT DEFAULT 0,
    text_m BIGINT DEFAULT 0,
    completed_c BIGINT DEFAULT 0,
    completed_m BIGINT DEFAULT 0,
    time_c BIGINT DEFAULT 0,
    time_m BIGINT DEFAULT 0
);

COMMIT;
