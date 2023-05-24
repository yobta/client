BEGIN;

-- Seed inserts for the `todo` table
INSERT INTO todo (id, text, completed, time) 
VALUES ('todo-1', 'Buy groceries', false, 1621857600);

INSERT INTO todo (id, text, completed, time) 
VALUES ('todo-2', 'Finish homework', false, 1621934400);

INSERT INTO todo (id, text, completed, time) 
VALUES ('todo-3', 'Go for a run', true, 1622020800);

-- Seed inserts for the `todo_yobta` table
INSERT INTO todo_yobta (id, id_c, id_m, text_c, text_m, completed_c, completed_m, time_c, time_m)
VALUES ('todo-1', 1, 1, 1, 1, 1, 1, 1, 1);

INSERT INTO todo_yobta (id, id_c, id_m, text_c, text_m, completed_c, completed_m, time_c, time_m)
VALUES ('todo-2', 2, 2, 2, 2, 2, 2, 2, 2);

INSERT INTO todo_yobta (id, id_c, id_m, text_c, text_m, completed_c, completed_m, time_c, time_m)
VALUES ('todo-3', 3, 3, 3, 3, 3, 3, 3, 3);

-- Seed inserts for the `yobta_channel` table
INSERT INTO yobta_channel (id, type, collection, channel, "snapshotId", "nextSnapshotId", committed, merged)
VALUES ('insert-1', 'yobta-channel-insert', 'todo', 'all-todos', 'todo-1', NULL, 1621857600, 1621857700);

INSERT INTO yobta_channel (id, type, collection, channel, "snapshotId", "nextSnapshotId", committed, merged)
VALUES ('insert-2', 'yobta-channel-insert', 'todo', 'all-todos', 'todo-2', NULL, 1621934400, 1621934500);

INSERT INTO yobta_channel (id, type, collection, channel, "snapshotId", "nextSnapshotId", committed, merged)
VALUES ('insert-3', 'yobta-channel-insert', 'todo', 'all-todos', 'todo-3', 'todo-2', 1622020800, 1622020900);

COMMIT;
