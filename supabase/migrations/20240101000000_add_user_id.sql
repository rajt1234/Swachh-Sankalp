-- Migration: Add user_id column to profiles
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Add the user_id column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id text unique not null default '';

-- Step 2: Backfill existing users with a sequential number per role
-- We use a temporary approach: add a serial column, update user_id, then drop it
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS temp_serial serial;

-- Backfill citizens
UPDATE public.profiles p
SET user_id = 'C' || LPAD(temp_serial::text, 5, '0')
WHERE user_id = '' AND (role IS NULL OR role = 'citizen' OR role NOT IN ('municipality', 'recycler'));

-- Backfill municipality
UPDATE public.profiles p
SET user_id = 'M' || LPAD(temp_serial::text, 5, '0')
WHERE user_id = '' AND role = 'municipality';

-- Backfill recycler
UPDATE public.profiles p
SET user_id = 'R' || LPAD(temp_serial::text, 5, '0')
WHERE user_id = '' AND role = 'recycler';

-- Step 3: Remove the temporary column
ALTER TABLE public.profiles DROP COLUMN temp_serial;

-- Step 4: Remove the default value so future inserts must provide user_id
ALTER TABLE public.profiles ALTER COLUMN user_id DROP DEFAULT;

-- Step 5: Verify
-- SELECT id, email, role, user_id FROM public.profiles LIMIT 10;
