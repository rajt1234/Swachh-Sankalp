-- Migration: Insert sample complaints for existing users
-- Run this in Supabase Dashboard > SQL Editor

-- First, verify the profiles exist
DO $$
DECLARE
  anil_id uuid := 'b94ee5bd-1139-46fb-9f4c-8dc08a935a33';
  nayan_id uuid := '46c6be67-0c07-44f9-b504-9d38c913c5ba';
  akram_id uuid := '34e85b23-5630-46a3-8343-9d188fe02a32';
BEGIN
  -- Insert complaints for Anil Das (2 reports)
  INSERT INTO public.complaints (user_id, description, status, city, state, location_text, latitude, longitude, address, pin_code, ai_category, ai_verified, ai_severity, ai_recommendation, tracking_id, created_at)
  VALUES
    (anil_id, 'Overflowing garbage bin near main market area in Anand. Waste scattered across the road causing unhygienic conditions.', 'resolved', 'Anand', 'Gujarat', 'Main Market, Anand', 22.5645, 72.9289, 'Market Road, Near Temple, Anand', '388001', 'mixed-waste', true, 'high', 'Mixed waste requires immediate segregation. Contact local municipality for bulk clearance.', 'SWA-2025-000001', NOW() - INTERVAL '5 days'),
    (anil_id, 'Plastic waste dumped near residential area in Anand. Burning plastic causing air pollution.', 'in_progress', 'Anand', 'Gujarat', 'Residential Area, Anand', 22.5678, 72.9312, 'Near Park, Satellite, Anand', '388001', 'plastic', true, 'medium', 'Plastic waste should be collected and sent for recycling. Avoid burning plastic.', 'SWA-2025-000042', NOW() - INTERVAL '2 days');

  -- Insert complaints for Nayan Yadav (3 reports)
  INSERT INTO public.complaints (user_id, description, status, city, state, location_text, latitude, longitude, address, pin_code, ai_category, ai_verified, ai_severity, ai_recommendation, tracking_id, created_at)
  VALUES
    (nayan_id, 'Illegal dumping of construction waste near residential area in Panaji. Blocking the drainage system.', 'in_progress', 'Panaji', 'Goa', 'Residential Area, Panaji', 15.4909, 73.8278, 'Near Community Hall, Panaji', '403001', 'mixed-waste', true, 'medium', 'Construction waste should be disposed at designated sites. Report to local ward officer.', 'SWA-2025-000002', NOW() - INTERVAL '3 days'),
    (nayan_id, 'Wet waste and dry waste mixed together in community bin. No segregation happening.', 'resolved', 'Panaji', 'Goa', 'Community Bin Area', 15.4932, 73.8256, 'Near School, Panaji', '403001', 'organic', true, 'low', 'Segregate wet and dry waste at source. Use separate bins for better recycling.', 'SWA-2025-000015', NOW() - INTERVAL '10 days'),
    (nayan_id, 'E-waste dumped in regular garbage bin near market. Hazardous materials exposed.', 'pending', 'Panaji', 'Goa', 'Market Area, Panaji', 15.4889, 73.8290, 'Near Post Office, Panaji', '403001', 'e-waste', true, 'high', 'E-waste contains hazardous materials. Take to authorized e-waste collection center.', 'SWA-2025-000038', NOW() - INTERVAL '1 day');

  -- Insert complaints for Akram Khan (2 reports)
  INSERT INTO public.complaints (user_id, description, status, city, state, location_text, latitude, longitude, address, pin_code, ai_category, ai_verified, ai_severity, ai_recommendation, tracking_id, created_at)
  VALUES
    (akram_id, 'Garbage not collected for over a week in Jhansi locality. Children falling sick due to mosquitoes and foul smell.', 'pending', 'Jhansi', 'Uttar Pradesh', 'Civil Lines, Jhansi', 25.4484, 78.5686, 'Near Bus Stand, Civil Lines, Jhansi', '284001', 'organic', true, 'high', 'Organic waste decomposing near residential area poses health risk. Immediate collection required.', 'SWA-2025-000003', NOW() - INTERVAL '1 day'),
    (akram_id, 'Stray animals scattering garbage from open bin. Dirty water flowing on road.', 'in_progress', 'Jhansi', 'Uttar Pradesh', 'Station Road, Jhansi', 25.4512, 78.5701, 'Near Railway Station, Jhansi', '284001', 'mixed-waste', true, 'medium', 'Cover bins properly. Avoid open dumping. Municipality should provide covered bins.', 'SWA-2025-000029', NOW() - INTERVAL '4 days');

  RAISE NOTICE 'Inserted 7 complaints for 3 users.';
END $$;

-- Update points for these users based on new reports
-- Current points: Anil 175, Nayan 75, Akram 50
-- +50 per additional report
UPDATE public.profiles SET points = 275 WHERE id = 'b94ee5bd-1139-46fb-9f4c-8dc08a935a33';
UPDATE public.profiles SET points = 175 WHERE id = '46c6be67-0c07-44f9-b504-9d38c913c5ba';
UPDATE public.profiles SET points = 100 WHERE id = '34e85b23-5630-46a3-8343-9d188fe02a32';
