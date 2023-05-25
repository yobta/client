DROP FUNCTION IF EXISTS yobta_collection_revalidate(
    id VARCHAR(32),
    channel VARCHAR(64),
    snapshot_id VARCHAR(32),
    committed BIGINT,
    merged BIGINT,
    data JSONB,
    meta JSONB
);

CREATE OR REPLACE FUNCTION yobta_collection_revalidate(
    id VARCHAR(32),
    channel VARCHAR(64),
    snapshot_id VARCHAR(32),
    committed BIGINT,
    merged BIGINT,
    data JSONB,
    meta JSONB
)
RETURNS JSONB AS $$
DECLARE
    _column TEXT;
    revalidate_data JSONB;
BEGIN
    revalidate_data := jsonb_build_object(
        'id', 'r-' || id,
        'type', 'yobta-collection-revalidate',
        'channel', channel,
        'snapshotId', snapshot_id,
        'committed', committed,
        'merged', merged
    );

    FOR _column IN SELECT jsonb_object_keys(data)
    LOOP
        revalidate_data := jsonb_set(
            revalidate_data, 
            '{data}', 
            COALESCE(revalidate_data->'data', '[]'::jsonb) || jsonb_build_array(
                jsonb_build_array(
                    _column, 
                    data->_column, 
                    (meta->CONCAT(_column, '_c')), 
                    (meta->CONCAT(_column, '_m'))
                )
            )
        );
    END LOOP;
    
    RETURN revalidate_data;
END
$$ LANGUAGE plpgsql;
