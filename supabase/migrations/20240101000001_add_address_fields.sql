-- Migration: Add address fields to complaints table
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS pin_code text;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS state text;

-- Optional: Add indexes for faster queries by location
CREATE INDEX IF NOT EXISTS idx_complaints_pin_code ON public.complaints(pin_code);
CREATE INDEX IF NOT EXISTS idx_complaints_city ON public.complaints(city);
CREATE INDEX IF NOT EXISTS idx_complaints_state ON public.complaints(state);
