-- Migration: Add 'viewed' status to complaints table
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_status_check;

ALTER TABLE public.complaints ADD CONSTRAINT complaints_status_check 
  CHECK (status IN ('pending', 'viewed', 'in_progress', 'resolved', 'rejected'));

-- Update any existing 'pending' complaints to 'viewed' if they have been accessed
-- This is optional - uncomment if you want to backfill
-- UPDATE public.complaints SET status = 'viewed' WHERE status = 'pending' AND updated_at > created_at;
