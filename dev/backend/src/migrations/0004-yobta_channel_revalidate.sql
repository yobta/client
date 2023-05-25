DROP FUNCTION IF EXISTS yobta_channel_revalidate(
    p_collection VARCHAR(32),
    p_channel VARCHAR(64),
    p_merged BIGINT
);

CREATE OR REPLACE FUNCTION yobta_channel_revalidate(
    p_collection VARCHAR(32),
    p_channel VARCHAR(64),
    p_merged BIGINT
)
RETURNS TABLE (
    id TEXT,
    type TEXT,
    channel VARCHAR(64),
    "snapshotId" VARCHAR(32),
    "nextSnapshotId" VARCHAR(32),
    committed BIGINT,
    merged BIGINT,
    data JSONB
) AS $$
DECLARE
    _record RECORD;
    _column TEXT;
    _query TEXT;
    revalidate_data JSONB;
BEGIN
	_query := format('
        SELECT 
            yc.id,
            yc.type,
            yc.channel,
            yc."snapshotId",
            yc."nextSnapshotId",
            yc.committed,
            yc.merged,
            to_jsonb(t.*) as data,
            to_jsonb(ty.*) as meta
        FROM 
            yobta_channel AS yc
        LEFT JOIN
            %I t ON t.id = yc."snapshotId"
        LEFT JOIN
            %I ty ON ty.id = t.id
        WHERE
            yc.collection = %L AND 
            yc.channel = %L AND 
            yc.merged > %s
        ORDER BY
        	yc.committed ASC
        ', p_collection, (p_collection || '_yobta'), p_collection, p_channel, p_merged);
    
    FOR _record IN EXECUTE _query LOOP
        IF _record.data IS NULL OR _record.meta IS NULL THEN
            CONTINUE;
        END IF;
        IF _record.type = 'yobta-channel-insert' THEN
            revalidate_data := yobta_collection_revalidate(
                _record.id,
                _record.channel,
                _record."snapshotId",
                _record.committed,
                _record.merged,
                _record.data,
                _record.meta
            );
            id := revalidate_data->>'id';
            type := revalidate_data->>'type';
            channel := revalidate_data->>'channel';
            "snapshotId" := revalidate_data->>'snapshotId';
            "nextSnapshotId" := NULL;
            committed := (revalidate_data->'committed');
            merged := (revalidate_data->'merged');
            data := revalidate_data->'data';
            
            RETURN NEXT;
        END IF;

        id := _record.id;
        type := _record.type;
        channel := _record.channel;
        "snapshotId" := _record."snapshotId";
        "nextSnapshotId" := _record."nextSnapshotId";
        committed := _record.committed;
        merged := _record.merged;
        data := NULL;

        RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

