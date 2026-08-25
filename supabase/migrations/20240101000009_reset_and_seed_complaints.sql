-- Reset complaints and reseed for Reports Filed section
-- Run in Supabase Dashboard > SQL Editor

-- Clear existing complaints
DELETE FROM public.complaints;

-- Reset tracking sequence
SELECT setval('public.complaints_tracking_seq', 0, false);

-- Insert fresh complaints for existing users
DO $$
DECLARE
  anil_id uuid := (SELECT id FROM public.profiles WHERE full_name = 'Anil Das' LIMIT 1);
  nayan_id uuid := (SELECT id FROM public.profiles WHERE full_name = 'Nayan Yadav' LIMIT 1);
  akram_id uuid := (SELECT id FROM public.profiles WHERE full_name = 'Akram Khan' LIMIT 1);
BEGIN
  IF anil_id IS NULL OR nayan_id IS NULL OR akram_id IS NULL THEN
    RAISE NOTICE 'Required profiles not found.';
    RETURN;
  END IF;

  INSERT INTO public.complaints (user_id, description, status, city, state, location_text, latitude, longitude, address, pin_code, ai_category, ai_verified, ai_severity, ai_recommendation, tracking_id, created_at)
  VALUES
    (anil_id, 'Overflowing garbage bin near main market area in Anand.', 'resolved', 'Anand', 'Gujarat', 'Main Market, Anand', 22.5645, 72.9289, 'Market Road, Anand', '388001', 'mixed-waste', true, 'high', 'Contact municipality for bulk clearance.', 'SWA-2026-000001', NOW() - INTERVAL '5 days'),
    (anil_id, 'Plastic waste dumped near residential area in Anand.', 'in_progress', 'Anand', 'Gujarat', 'Residential Area, Anand', 22.5678, 72.9312, 'Near Park, Anand', '388001', 'plastic', true, 'medium', 'Plastic should be sent for recycling.', 'SWA-2026-000002', NOW() - INTERVAL '2 days'),
    (nayan_id, 'Illegal dumping of construction waste in Panaji.', 'in_progress', 'Panaji', 'Goa', 'Residential Area, Panaji', 15.4909, 73.8278, 'Near Community Hall, Panaji', '403001', 'mixed-waste', true, 'medium', 'Report to local ward officer.', 'SWA-2026-000003', NOW() - INTERVAL '3 days'),
    (nayan_id, 'Wet and dry waste mixed in community bin.', 'resolved', 'Panaji', 'Goa', 'Community Bin Area', 15.4932, 73.8256, 'Near School, Panaji', '403001', 'organic', true, 'low', 'Segregate wet and dry waste at source.', 'SWA-2026-000004', NOW() - INTERVAL '10 days'),
    (nayan_id, 'E-waste dumped in regular garbage bin.', 'pending', 'Panaji', 'Goa', 'Market Area, Panaji', 15.4889, 73.8290, 'Near Post Office, Panaji', '403001', 'e-waste', true, 'high', 'Take to authorized e-waste center.', 'SWA-2026-000005', NOW() - INTERVAL '1 day'),
    (akram_id, 'Garbage not collected for over a week in Jhansi.', 'pending', 'Jhansi', 'Uttar Pradesh', 'Civil Lines, Jhansi', 25.4484, 78.5686, 'Near Bus Stand, Jhansi', '284001', 'organic', true, 'high', 'Immediate collection required.', 'SWA-2026-000006', NOW() - INTERVAL '1 day'),
    (akram_id, 'Stray animals scattering garbage from open bin.', 'in_progress', 'Jhansi', 'Uttar Pradesh', 'Station Road, Jhansi', 25.4512, 78.5701, 'Near Railway Station, Jhansi', '284001', 'mixed-waste', true, 'medium', 'Cover bins properly.', 'SWA-2026-000007', NOW() - INTERVAL '4 days');

  RAISE NOTICE 'Inserted 7 complaints.';
END $$;

-- Refresh user points
UPDATE public.profiles SET points = 275 WHERE full_name = 'Anil Das';
UPDATE public.profiles SET points = 175 WHERE full_name = 'Nayan Yadav';
UPDATE public.profiles SET points = 100 WHERE full_name = 'Akram Khan';
