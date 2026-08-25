-- Migration: Add Mixed Waste category
-- Run this in Supabase Dashboard > SQL Editor

INSERT INTO public.waste_categories (name, name_hi, color, icon, description, description_hi)
VALUES ('Mixed Waste', 'मिश्रित कचरा', '#ec4899', '🗑️', 'A combination of different waste types that cannot be separated easily', 'विभिन्न प्रकार के कचरे का संयोजन जिसे आसानी से अलग नहीं किया जा सकता')
ON CONFLICT DO NOTHING;
