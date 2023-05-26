DROP FUNCTION IF EXISTS yobta_collection_update(
    collection TEXT,
    operation JSONB
);
DROP FUNCTION IF EXISTS yobta_collection_create(
    collection TEXT,
    operation JSONB
);

CREATE OR REPLACE FUNCTION yobta_collection_update(
    collection TEXT,
    operation JSONB
)
RETURNS JSONB AS $$
DECLARE
    data JSONB;
    snapshot_id TEXT;
    collection_yobta TEXT;
    committed BIGINT;
    meta JSONB;
    key TEXT;
    result BOOLEAN;
    merged BIGINT;
    meta_assignments TEXT;

BEGIN
    data := operation->'data';
    snapshot_id := data->>'id';
    data := data - 'id';
    collection_yobta := collection || '_yobta';
    committed := operation->>'committed';
    merged := yobta_js_timestamp();

    EXECUTE format('INSERT INTO %I (id) SELECT %L WHERE NOT EXISTS (SELECT 1 FROM %I WHERE id = %L)', collection, snapshot_id, collection, snapshot_id);
    EXECUTE format('SELECT to_jsonb(%I.*) FROM %I WHERE id = %L', collection_yobta, collection_yobta, snapshot_id) INTO meta;

    FOR key IN (SELECT jsonb_object_keys(data))
    LOOP
    IF (meta->(key || '_c'))::BIGINT >= committed THEN
        data := data - key;
    END IF;
    END LOOP;
    
    IF (SELECT count(*) FROM jsonb_object_keys(data)) > 0 THEN
        EXECUTE format(
            'UPDATE %I SET (%s) = (SELECT %s FROM jsonb_populate_record(NULL::%I, %L)) WHERE id = %L',
            collection,
            (SELECT string_agg(key_alias, ', ') FROM jsonb_each_text(data) AS each(key_alias)),
            (SELECT string_agg(key_alias, ', ') FROM jsonb_each_text(data) AS each(key_alias)),
            collection,
            data::text,
            snapshot_id
        );
        SELECT INTO meta_assignments
            STRING_AGG(format('%s_m = %s, %s_c = %s', key_alias, merged, key_alias, committed), ', ')
        FROM jsonb_each_text(data) AS each(key_alias);
        EXECUTE format('UPDATE %I SET %s WHERE id = %L', collection_yobta, meta_assignments, snapshot_id);
    END IF;
    data := data || jsonb_build_object('id', snapshot_id);
    operation := operation || jsonb_build_object('merged', merged) || jsonb_build_object('data', data);

    RETURN operation;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION yobta_collection_create(
    collection TEXT,
    operation JSONB
)
RETURNS JSONB AS $$
DECLARE
    collection_yobta TEXT;
    data JSONB;
    channel TEXT;
    merged BIGINT;
    operation_id TEXT;
    meta_data JSONB;
    snapshot_id TEXT;
    committed BIGINT;
    snapshot JSONB;
    snapshot_yobta JSONB;
    revalidate_operation JSONB;
    _column TEXT;
    _snapshot_query TEXT;
    _snapshot_query_yobta TEXT;
BEGIN
    collection_yobta := collection || '_yobta';
    data := operation->'data';
    channel := operation->>'channel';
    operation_id := operation->>'id';
    snapshot_id := data->>'id';
    committed := operation->'committed';
    merged := yobta_js_timestamp();

    _snapshot_query := format('SELECT to_jsonb(%I.*) FROM %I WHERE id = %L', collection, collection, snapshot_id);
    _snapshot_query_yobta := format('SELECT to_jsonb(%I.*) FROM %I WHERE id = %L', collection_yobta, collection_yobta, snapshot_id);

    EXECUTE _snapshot_query INTO snapshot;
    EXECUTE _snapshot_query_yobta INTO snapshot_yobta;

    IF (snapshot IS NOT NULL AND snapshot_yobta IS NULL) OR (snapshot IS NULL AND snapshot_yobta IS NOT NULL) THEN
        EXECUTE format('DELETE FROM %I WHERE id = %L', collection, snapshot_id);
        EXECUTE format('DELETE FROM %I WHERE id = %L', collection_yobta, snapshot_id);
    END IF;

    IF (snapshot IS NOT NULL AND snapshot_yobta IS NOT NULL) THEN
        EXECUTE format('UPDATE %I SET id_c = %s, id_m = %s WHERE id = %L', collection_yobta, committed, merged, snapshot_id);
        -- yobta_collection_update(collection, operation);
        EXECUTE _snapshot_query INTO snapshot;
        EXECUTE _snapshot_query_yobta INTO snapshot_yobta;
        RETURN yobta_collection_revalidate(
          operation_id,
          channel,
          snapshot_id,
          committed,
          merged,
          snapshot,
          snapshot_yobta
        );
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