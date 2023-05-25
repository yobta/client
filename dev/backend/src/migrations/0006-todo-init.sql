BEGIN;

CREATE TABLE IF NOT EXISTS todo (
    id VARCHAR(32) PRIMARY KEY,
    text TEXT,
    completed BOOLEAN,
    time BIGINT
);

CREATE TABLE IF NOT EXISTS todo_yobta (
    id VARCHAR(32) REFERENCES todo(id),
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
