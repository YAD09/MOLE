-- Add missing price_per_unit columns to the tables
ALTER TABLE public.waste_listings ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC;
ALTER TABLE public.material_requests ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC;

-- Refresh the PostgREST schema cache so the JS client recognizes the newly added columns immediately
NOTIFY pgrst, 'reload schema';
