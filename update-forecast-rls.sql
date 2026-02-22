
-- ─── UPDATE: PUBLIC READ ACCESS FOR FORECASTS ──────────────────
-- Drop the restrictive 'own' select policy if you want to replace it, 
-- or just add a new permissive one (policies are OR-ed).
-- We'll just add a new one for clarity.

CREATE POLICY "waste_forecasts_select_all" ON public.waste_forecasts
    FOR SELECT USING (true);

-- Enable Realtime for waste_forecasts
-- This is required for the frontend to receive live updates
ALTER PUBLICATION supabase_realtime ADD TABLE waste_forecasts;
