
-- ─── 5. WASTE FORECASTS ─────────────────────────────────────
-- Allows factories to input production schedules for future waste generation
CREATE TABLE IF NOT EXISTS public.waste_forecasts (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id       UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    waste_type       TEXT        NOT NULL,
    description      TEXT,
    quantity         NUMERIC     NOT NULL DEFAULT 0,
    unit             TEXT        NOT NULL DEFAULT 'Tons',
    available_from   TIMESTAMPTZ NOT NULL,
    status           TEXT        NOT NULL DEFAULT 'active', -- active, converted, cancelled
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.waste_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waste_forecasts_select_own" ON public.waste_forecasts
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "waste_forecasts_insert_own" ON public.waste_forecasts
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "waste_forecasts_update_own" ON public.waste_forecasts
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "waste_forecasts_delete_own" ON public.waste_forecasts
    FOR DELETE USING (auth.uid() = company_id);
