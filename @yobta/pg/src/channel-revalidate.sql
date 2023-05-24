DROP FUNCTION yobta_revalidate_channel(character varying,character varying,bigint);

CREATE OR REPLACE FUNCTION yobta_revalidate_channel(
  IN p_collection VARCHAR(32),
  IN p_channel VARCHAR(64),
  IN p_merged BIGINT
)
RETURNS TABLE (
    id TEXT,
    type TEXT,
    channel TEXT,
    "snapshotId" TEXT,
    "nextSnapshotId" TEXT,
    committed BIGINT,
    merged BIGINT,
    data JSONB
)
LANGUAGE plpgsql AS $$
DECLARE
    _record RECORD;
    _column TEXT;
    revalidate_data JSONB;
BEGIN
    FOR _record IN (
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
            todo t ON t.id = yc."snapshotId"
        LEFT JOIN
            todo_yobta ty ON ty.id = t.id
        WHERE
            yc.collection = p_collection AND 
            yc.channel = p_channel AND 
            yc.merged > p_merged
        ORDER BY
        	yc.committed ASC
    )
    LOOP
        -- Skip record if data or meta is null
        IF _record.data IS NULL OR _record.meta IS NULL THEN
            CONTINUE;
        END IF;
        
        -- If type is 'yobta-channel-insert', create a revalidate entry first
        IF _record.type = 'yobta-channel-insert' THEN
            revalidate_data := jsonb_build_object(
                'id', 'r-' || _record.id,
                'type', 'yobta-collection-revalidate',
                'channel', _record.channel,
                'snapshotId', _record."snapshotId",
                'committed', _record.committed,
                'merged', _record.merged
            );

            FOR _column IN SELECT jsonb_object_keys(_record.data)
            LOOP
    			revalidate_data := jsonb_set(revalidate_data, '{data}', COALESCE(revalidate_data->'data', '[]'::jsonb) || jsonb_build_array(
        			jsonb_build_array(
           				_column, 
            			_record.data->_column, 
            			(_record.meta->CONCAT(_column, '_c')), 
            			(_record.meta->CONCAT(_column, '_m'))
        			)
    			));
			END LOOP;

            -- Set the output parameters
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

        -- Return the original record
        id := _record.id;
        type := _record.type;
        channel := _record.channel;
        "snapshotId" := _record."snapshotId";
        "nextSnapshotId" := _record."nextSnapshotId";
        committed := (revalidate_data->'committed');
		merged := (revalidate_data->'merged');
        data := NULL;

        RETURN NEXT;
  END LOOP;
END;
$$;


SELECT * FROM yobta_revalidate_channel('todo', 'all-todos', 3);
