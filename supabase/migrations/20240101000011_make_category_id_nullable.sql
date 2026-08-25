-- Make category_id nullable in waste_records
ALTER TABLE public.waste_records ALTER COLUMN category_id DROP NOT NULL;
