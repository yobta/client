DROP FUNCTION IF EXISTS yobta_channel_insert(
    collection VARCHAR(32),
    operation JSONB
);

CREATE OR REPLACE FUNCTION yobta_channel_insert(
    collection VARCHAR(32),
    operation JSONB
)
RETURNS JSONB AS $$
DECLARE
    existing_operation JSONB;

BEGIN
    operation := jsonb_set(operation, '{merged}', to_jsonb(yobta_js_timestamp()));

    EXECUTE format('SELECT to_jsonb(yobta_channel.*) FROM yobta_channel WHERE "operationId" = %L', operation->>'id') INTO existing_operation;
    
    IF existing_operation IS NULL THEN
        RAISE NOTICE 'yobta_channel_insert: %', operation;
        INSERT INTO yobta_channel (
          "operationId", "type", "collection", "channel", "snapshotId", "nextSnapshotId", "committed", "merged"
        ) VALUES (
            operation->>'id',
            (operation->>'type')::yobta_channel_type,
            collection,
            operation->>'channel',
            operation->>'snapshotId',
            operation->>'nextSnapshotId',
            (operation->'committed')::BIGINT,
            (operation->'merged')::BIGINT
        );
        RETURN operation;
    END IF;

    RETURN existing_operation;
END;
$$ LANGUAGE plpgsql;
