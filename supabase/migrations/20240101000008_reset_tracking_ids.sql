-- Reset tracking IDs and sequence
-- Run this in Supabase Dashboard > SQL Editor

DO $$
DECLARE
  counter INT := 0;
  complaint_record RECORD;
BEGIN
  FOR complaint_record IN
    SELECT id FROM public.complaints ORDER BY created_at ASC
  LOOP
    counter := counter + 1;
    UPDATE public.complaints
    SET tracking_id = 'SWA-2026-' || LPAD(counter::text, 6, '0')
    WHERE id = complaint_record.id;
  END LOOP;

  PERFORM setval('public.complaints_tracking_seq', counter);

  RAISE NOTICE 'Updated % complaints with new tracking IDs and reset sequence to %', counter, counter;
END $$;
