-- ============================================================
-- MOLE — Reports + Scheduled Reports Schema
-- Run this AFTER supabase-extended-schema.sql
-- Paste into Supabase Dashboard → SQL Editor → Run
-- ============================================================


-- ─── 10. REPORTS ─────────────────────────────────────────────
-- Stores generated ESG/compliance/analytics/impact reports per company
CREATE TABLE IF NOT EXISTS public.reports (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

    title           TEXT        NOT NULL,
    type            TEXT        NOT NULL DEFAULT 'analytics',
    -- type values: 'esg' | 'compliance' | 'analytics' | 'impact'

    status          TEXT        NOT NULL DEFAULT 'generating',
    -- status values: 'ready' | 'generating' | 'scheduled'

    description     TEXT        NOT NULL DEFAULT '',
    tags            TEXT[]      NOT NULL DEFAULT '{}',
    file_format     TEXT        NOT NULL DEFAULT 'PDF',
    file_size_kb    NUMERIC,
    file_url        TEXT,               -- Supabase Storage URL when ready

    generated_at    TIMESTAMPTZ,        -- when the report was completed
    scheduled_for   TIMESTAMPTZ,        -- for scheduled reports

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select_own" ON public.reports
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "reports_insert_own" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "reports_update_own" ON public.reports
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "reports_delete_own" ON public.reports
    FOR DELETE USING (auth.uid() = company_id);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS reports_company_created_idx
    ON public.reports(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_company_type_idx
    ON public.reports(company_id, type);
CREATE INDEX IF NOT EXISTS reports_status_idx
    ON public.reports(company_id, status);


-- ─── 11. SCHEDULED REPORTS ───────────────────────────────────
-- Stores recurring report schedules per company
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

    name            TEXT        NOT NULL,
    report_type     TEXT        NOT NULL DEFAULT 'analytics',
    -- report_type: 'esg' | 'compliance' | 'analytics' | 'impact'

    frequency       TEXT        NOT NULL DEFAULT 'monthly',
    -- frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'

    next_run_at     TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
    file_format     TEXT        NOT NULL DEFAULT 'PDF',
    is_active       BOOLEAN     NOT NULL DEFAULT true,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scheduled_reports_select_own" ON public.scheduled_reports
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "scheduled_reports_insert_own" ON public.scheduled_reports
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "scheduled_reports_update_own" ON public.scheduled_reports
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "scheduled_reports_delete_own" ON public.scheduled_reports
    FOR DELETE USING (auth.uid() = company_id);

CREATE INDEX IF NOT EXISTS scheduled_reports_company_idx
    ON public.scheduled_reports(company_id, is_active);
CREATE INDEX IF NOT EXISTS scheduled_reports_next_run_idx
    ON public.scheduled_reports(next_run_at ASC);


-- ============================================================
-- PLATFORM-WIDE STATS VIEW (for Layout.tsx metric pills)
-- These aggregate across ALL companies — no RLS needed since
-- the view is accessed via a Postgres security-definer function.
-- ============================================================

-- ─── Platform aggregate stats (public read, no user filter) ──
-- Used for the top stat bar: total listings, active opps, savings, CO2
-- NOTE: If you want per-user stats only (recommended for privacy),
--       the Layout.tsx component already filters by auth.uid() via RLS.
--       This view is optional — for a future admin dashboard.

CREATE OR REPLACE VIEW public.platform_stats AS
SELECT
    (SELECT COUNT(*) FROM public.waste_listings)                       AS total_waste_listings,
    (SELECT COUNT(*) FROM public.opportunities WHERE status = 'active')AS active_opportunities,
    (SELECT COALESCE(SUM(total_savings), 0) FROM public.impact_analytics) AS total_cost_savings,
    (SELECT COALESCE(SUM(co2_avoided_kg), 0) FROM public.impact_analytics) AS total_co2_avoided_kg,
    (SELECT COALESCE(SUM(waste_diverted_kg), 0) FROM public.impact_analytics) AS total_waste_diverted_kg,
    (SELECT COUNT(DISTINCT company_id) FROM public.network_connections) AS companies_in_network;


-- ============================================================
-- SEED: Auto-initialize a circularity_scores row for new users
-- Extend the existing handle_new_user trigger to also seed this
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Seed companies row
    INSERT INTO public.companies (id, company_name, industry_type, location)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'company', ''),
        COALESCE(NEW.raw_user_meta_data->>'industry', ''),
        COALESCE(NEW.raw_user_meta_data->>'location', '')
    )
    ON CONFLICT (id) DO NOTHING;

    -- Seed circularity_scores row with zeroed values
    INSERT INTO public.circularity_scores
        (company_id, overall_score, recycled_pct, reused_pct, recovered_pct, landfill_pct, sector_percentile, score_delta)
    VALUES
        (NEW.id, 0, 0, 0, 0, 100, 0, 0)
    ON CONFLICT (company_id) DO NOTHING;

    -- Seed impact_analytics row for the current month
    INSERT INTO public.impact_analytics
        (company_id, period_month, total_savings, transactions_count, co2_avoided_kg,
         water_saved_l, energy_saved_kwh, waste_diverted_kg, circularity_score,
         recycled_pct, reused_pct, recovered_pct, landfill_pct)
    VALUES
        (NEW.id, date_trunc('month', NOW())::DATE, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100)
    ON CONFLICT (company_id, period_month) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Drop old trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- USEFUL QUERIES FOR REPORTS
-- ============================================================

-- Q: Get all reports for the current user, newest first
-- SELECT * FROM public.reports
-- WHERE company_id = auth.uid()
-- ORDER BY created_at DESC;

-- Q: Get all active scheduled reports for the current user
-- SELECT * FROM public.scheduled_reports
-- WHERE company_id = auth.uid() AND is_active = true
-- ORDER BY next_run_at ASC;

-- Q: Mark a report as ready (run after your report generation job)
-- UPDATE public.reports
-- SET status = 'ready', generated_at = NOW(), file_url = '<storage_url>', file_size_kb = 124
-- WHERE id = '<report_uuid>';

-- Q: Manually seed an impact_analytics row for testing
-- INSERT INTO public.impact_analytics
--   (company_id, period_month, total_savings, co2_avoided_kg, waste_diverted_kg,
--    water_saved_l, energy_saved_kwh, transactions_count, circularity_score,
--    recycled_pct, reused_pct, recovered_pct, landfill_pct)
-- VALUES
--   (auth.uid(), '2026-02-01', 150000, 18400, 12000, 50000, 800, 5, 62, 40, 22, 18, 20)
-- ON CONFLICT (company_id, period_month) DO UPDATE
--   SET total_savings = EXCLUDED.total_savings,
--       co2_avoided_kg = EXCLUDED.co2_avoided_kg;

-- Q: Manually seed an opportunity row for testing
-- INSERT INTO public.opportunities
--   (company_id, title, material_from, material_to, compatibility_score,
--    cost_savings, cost_savings_pct, co2_saved_kg, energy_saved_pct,
--    volume, frequency, is_urgent, why_match, certifications)
-- VALUES
--   (auth.uid(), 'Steel Slag → Cement Additive', 'Steel Slag', 'Cement Additive',
--    97, 240000, 45, 8500, 30,
--    '50 MT/month', 'Monthly', true,
--    ARRAY['High chemical compatibility', 'Logistics route overlap', 'Verified ISO 14001 receiver'],
--    ARRAY['ISO 14001', 'BIS Certified']);
