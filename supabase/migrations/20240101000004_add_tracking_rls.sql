-- Migration: Allow public tracking ID lookup on complaints
-- Run this in Supabase Dashboard > SQL Editor

CREATE POLICY "Tracking ID lookup is public" ON public.complaints
  FOR SELECT USING (tracking_id IS NOT NULL);
