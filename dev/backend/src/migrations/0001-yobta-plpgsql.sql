DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_language WHERE lanname = 'plpgsql') THEN
    CREATE LANGUAGE plpgsql;
  END IF;
END
$$;