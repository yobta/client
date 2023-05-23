BEGIN;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'yobta_channel_type'
    ) THEN
        CREATE TYPE yobta_channel_type AS ENUM (
            'yobta-channel-insert',
            'yobta-channel-delete',
            'yobta-channel-restore',
            'yobta-channel-shift'
        );
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS yobta_channel (
    "operationId" VARCHAR(32) PRIMARY KEY,
    "type" yobta_channel_type NOT NULL,
    "collection" VARCHAR(32) NOT NULL,
    "channel" VARCHAR(64) NOT NULL,
    "snapshotId" VARCHAR(32) NOT NULL,
    "nextSnapshotId" VARCHAR(32),
    "committed" INTEGER NOT NULL,
    "merged" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS yobta_channel_collection_channel_merged_idx ON yobta_channel (collection, channel, merged);

COMMIT;
