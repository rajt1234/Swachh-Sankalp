-- Migration: Add tracking_id to complaints table
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS tracking_id text UNIQUE;

CREATE SEQUENCE IF NOT EXISTS public.complaints_tracking_seq;

CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS text AS $$
DECLARE
  next_num int;
  year_str text;
  tracking_id text;
BEGIN
  year_str := to_char(now(), 'YYYY');
  next_num := nextval('public.complaints_tracking_seq');
  tracking_id := 'SWA-' || year_str || '-' || lpad(next_num::text, 6, '0');
  RETURN tracking_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_tracking_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := public.generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_tracking_id_trigger ON public.complaints;
CREATE TRIGGER set_tracking_id_trigger
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_id();
