DROP FUNCTION IF EXISTS yobta_collection_create(
    collection TEXT,
    merged BIGINT,
    operation JSONB
);

CREATE OR REPLACE FUNCTION yobta_collection_create(
    collection TEXT,
    merged BIGINT,
    operation JSONB
)
RETURNS JSONB AS $$
DECLARE
    collection_yobta TEXT;
    data JSONB;
    channel TEXT;
    operation_id TEXT;
    meta_data JSONB;
    snapshot_id TEXT;
    committed BIGINT;
    snapshot JSONB;
    snapshot_yobta JSONB;
    revalidate_operation JSONB;
    _column TEXT;
BEGIN
    collection_yobta := collection || '_yobta';
    data := operation->'data';
    channel := operation->>'channel';
    operation_id := operation->>'id';
    snapshot_id := data->>'id';
    committed := operation->'committed';

    EXECUTE format('SELECT to_jsonb(%I.*) FROM %I WHERE id = %L', collection, collection, snapshot_id) INTO snapshot;
    EXECUTE format('SELECT to_jsonb(%I.*) FROM %I WHERE id = %L', collection_yobta, collection_yobta, snapshot_id) INTO snapshot_yobta;

    IF (snapshot IS NOT NULL AND snapshot_yobta IS NULL) OR (snapshot IS NULL AND snapshot_yobta IS NOT NULL) THEN
        EXECUTE format('DELETE FROM %I WHERE id = %L', collection, snapshot_id);
        EXECUTE format('DELETE FROM %I WHERE id = %L', collection_yobta, snapshot_id);
    END IF;

    IF (snapshot IS NOT NULL AND snapshot_yobta IS NOT NULL) THEN
        revalidate_operation := yobta_collection_revalidate(
          operation_id,
          channel,
          snapshot_id,
          committed,
          merged,
          snapshot,
          snapshot_yobta
        );
        RETURN revalidate_operation;
    END IF;

    meta_data := jsonb_build_object('id', snapshot_id);
    FOR _column IN SELECT jsonb_object_keys(data)
    LOOP
        meta_data := meta_data || jsonb_build_object(_column || '_c', committed) || jsonb_build_object(_column || '_m', merged);
    END LOOP;
    EXECUTE format('INSERT INTO %I SELECT * FROM jsonb_populate_record(NULL::%I, %L)', collection, collection, data);
    EXECUTE format('INSERT INTO %I SELECT * FROM jsonb_populate_record(NULL::%I, %L)', collection_yobta, collection_yobta, meta_data);

    operation := jsonb_set(operation, '{merged}', to_jsonb(merged));
    RETURN operation;
END;
$$ LANGUAGE plpgsql;