-- ============================================================
-- MOLE — Extended Schema (Run AFTER supabase-schema.sql)
-- Paste into Supabase Dashboard → SQL Editor → Run
-- ============================================================


-- ─── 5. NOTIFICATIONS ────────────────────────────────────────
-- Stores per-user notifications (alerts, matches, system messages)
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    type        TEXT        NOT NULL DEFAULT 'info',
    -- type values: 'match_found' | 'offer_received' | 'listing_expiring' | 'system' | 'impact_milestone'
    title       TEXT        NOT NULL,
    body        TEXT        NOT NULL,
    is_read     BOOLEAN     NOT NULL DEFAULT false,
    action_url  TEXT,           -- e.g. '/app/opportunities'
    meta        JSONB       DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "notifications_insert_own" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
    FOR DELETE USING (auth.uid() = company_id);

-- Useful indexes
CREATE INDEX IF NOT EXISTS notifications_company_id_read_idx
    ON public.notifications(company_id, is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx
    ON public.notifications(created_at DESC);


-- ─── 6. OPPORTUNITIES ────────────────────────────────────────
-- AI-identified circular economy matches (waste listing ↔ material request)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    -- which company this opportunity is shown to
    company_id          UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    -- the waste listing being offered
    waste_listing_id    UUID        REFERENCES public.waste_listings(id) ON DELETE SET NULL,
    -- the sourcing request that triggered the match
    material_request_id UUID        REFERENCES public.material_requests(id) ON DELETE SET NULL,
    -- counterparty company (the other side of the deal)
    counterparty_id     UUID        REFERENCES public.companies(id) ON DELETE SET NULL,

    title               TEXT        NOT NULL,
    material_from       TEXT        NOT NULL,
    material_to         TEXT        NOT NULL,
    compatibility_score NUMERIC     NOT NULL CHECK (compatibility_score BETWEEN 0 AND 100),
    quality_fit         NUMERIC     CHECK (quality_fit BETWEEN 0 AND 100),
    distance_km         NUMERIC,
    cost_savings        NUMERIC     DEFAULT 0,
    cost_savings_pct    NUMERIC     DEFAULT 0,
    co2_saved_kg        NUMERIC     DEFAULT 0,
    water_saved_l       NUMERIC     DEFAULT 0,
    energy_saved_pct    NUMERIC     DEFAULT 0,
    volume              TEXT,
    frequency           TEXT,
    estimated_roi       TEXT,
    time_to_close       TEXT,
    certifications      TEXT[]      DEFAULT '{}',
    why_match           TEXT[]      DEFAULT '{}',
    is_urgent           BOOLEAN     NOT NULL DEFAULT false,
    status              TEXT        NOT NULL DEFAULT 'active',
    -- status: 'active' | 'accepted' | 'rejected' | 'expired'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at          TIMESTAMPTZ
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opportunities_select_own" ON public.opportunities
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "opportunities_insert_own" ON public.opportunities
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "opportunities_update_own" ON public.opportunities
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "opportunities_delete_own" ON public.opportunities
    FOR DELETE USING (auth.uid() = company_id);

CREATE INDEX IF NOT EXISTS opportunities_company_status_idx
    ON public.opportunities(company_id, status);
CREATE INDEX IF NOT EXISTS opportunities_score_idx
    ON public.opportunities(compatibility_score DESC);


-- ─── 7. IMPACT ANALYTICS ─────────────────────────────────────
-- Monthly aggregated environmental + economic impact per company
CREATE TABLE IF NOT EXISTS public.impact_analytics (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    period_month        DATE        NOT NULL,
    -- always store as first-of-month, e.g. '2026-02-01'

    -- Economic
    total_savings       NUMERIC     NOT NULL DEFAULT 0,   -- ₹
    transactions_count  INTEGER     NOT NULL DEFAULT 0,

    -- Environmental
    co2_avoided_kg      NUMERIC     NOT NULL DEFAULT 0,
    water_saved_l       NUMERIC     NOT NULL DEFAULT 0,
    energy_saved_kwh    NUMERIC     NOT NULL DEFAULT 0,
    waste_diverted_kg   NUMERIC     NOT NULL DEFAULT 0,   -- kg diverted from landfill

    -- Circularity
    circularity_score   NUMERIC     CHECK (circularity_score BETWEEN 0 AND 100),
    recycled_pct        NUMERIC     DEFAULT 0,
    reused_pct          NUMERIC     DEFAULT 0,
    recovered_pct       NUMERIC     DEFAULT 0,
    landfill_pct        NUMERIC     DEFAULT 0,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(company_id, period_month)
);

ALTER TABLE public.impact_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impact_select_own" ON public.impact_analytics
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "impact_insert_own" ON public.impact_analytics
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "impact_update_own" ON public.impact_analytics
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "impact_delete_own" ON public.impact_analytics
    FOR DELETE USING (auth.uid() = company_id);

CREATE INDEX IF NOT EXISTS impact_company_period_idx
    ON public.impact_analytics(company_id, period_month DESC);


-- ─── 8. CIRCULARITY SCORES ───────────────────────────────────
-- Real-time circularity score per company (recomputed as transactions happen)
CREATE TABLE IF NOT EXISTS public.circularity_scores (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,

    overall_score       NUMERIC     NOT NULL DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
    recycled_pct        NUMERIC     NOT NULL DEFAULT 0,
    reused_pct          NUMERIC     NOT NULL DEFAULT 0,
    recovered_pct       NUMERIC     NOT NULL DEFAULT 0,
    landfill_pct        NUMERIC     NOT NULL DEFAULT 100,

    -- Sector/industry percentile rank (0-100, higher = better)
    sector_percentile   NUMERIC     DEFAULT 0,

    -- Trend vs last month
    score_delta         NUMERIC     DEFAULT 0,   -- e.g. +3.2 means improved by 3.2 pts

    last_computed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.circularity_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "circularity_select_own" ON public.circularity_scores
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "circularity_insert_own" ON public.circularity_scores
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "circularity_update_own" ON public.circularity_scores
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "circularity_delete_own" ON public.circularity_scores
    FOR DELETE USING (auth.uid() = company_id);


-- ─── 9. NETWORK CONNECTIONS ──────────────────────────────────
-- Tracks verified supplier/buyer relationships between companies
CREATE TABLE IF NOT EXISTS public.network_connections (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    from_company_id UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    to_company_id   UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

    connection_type TEXT        NOT NULL DEFAULT 'trade',
    -- types: 'trade' | 'pending' | 'verified_partner' | 'affiliate'

    material_type   TEXT,           -- what material is exchanged
    volume_mt       NUMERIC,        -- metric tons exchanged
    distance_km     NUMERIC,
    co2_saved_kg    NUMERIC DEFAULT 0,

    status          TEXT        NOT NULL DEFAULT 'active',
    -- status: 'active' | 'paused' | 'completed'

    established_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- prevent duplicate pairs
    UNIQUE(from_company_id, to_company_id, material_type)
);

ALTER TABLE public.network_connections ENABLE ROW LEVEL SECURITY;

-- A company can see connections where they are either endpoint
CREATE POLICY "network_select_own" ON public.network_connections
    FOR SELECT USING (
        auth.uid() = from_company_id OR auth.uid() = to_company_id
    );

CREATE POLICY "network_insert_own" ON public.network_connections
    FOR INSERT WITH CHECK (auth.uid() = from_company_id);

CREATE POLICY "network_update_own" ON public.network_connections
    FOR UPDATE USING (auth.uid() = from_company_id);

CREATE POLICY "network_delete_own" ON public.network_connections
    FOR DELETE USING (auth.uid() = from_company_id);

CREATE INDEX IF NOT EXISTS network_from_idx ON public.network_connections(from_company_id);
CREATE INDEX IF NOT EXISTS network_to_idx   ON public.network_connections(to_company_id);


-- ============================================================
-- USEFUL QUERIES (copy individually as needed)
-- ============================================================


-- ─── Q1: Unread notification count per user ───────────────────
-- SELECT COUNT(*) AS unread FROM public.notifications
-- WHERE company_id = auth.uid() AND is_read = false;


-- ─── Q2: Mark all notifications as read ──────────────────────
-- UPDATE public.notifications
-- SET is_read = true
-- WHERE company_id = auth.uid() AND is_read = false;


-- ─── Q3: Active opportunities sorted by score ────────────────
-- SELECT * FROM public.opportunities
-- WHERE company_id = auth.uid() AND status = 'active'
-- ORDER BY compatibility_score DESC;


-- ─── Q4: Impact trend — last 6 months ────────────────────────
-- SELECT
--     TO_CHAR(period_month, 'Mon') AS month,
--     co2_avoided_kg,
--     water_saved_l,
--     total_savings,
--     circularity_score
-- FROM public.impact_analytics
-- WHERE company_id = auth.uid()
--   AND period_month >= date_trunc('month', NOW()) - INTERVAL '5 months'
-- ORDER BY period_month ASC;


-- ─── Q5: Get circularity score ────────────────────────────────
-- SELECT * FROM public.circularity_scores
-- WHERE company_id = auth.uid();


-- ─── Q6: Get full network map (my connections + neighbor details)
-- SELECT
--     nc.connection_type,
--     nc.material_type,
--     nc.volume_mt,
--     nc.distance_km,
--     nc.co2_saved_kg,
--     nc.status,
--     nc.established_at,
--     c.company_name   AS partner_name,
--     c.industry_type  AS partner_industry,
--     c.location       AS partner_location
-- FROM public.network_connections nc
-- JOIN public.companies c
--     ON c.id = CASE
--         WHEN nc.from_company_id = auth.uid() THEN nc.to_company_id
--         ELSE nc.from_company_id
--     END
-- WHERE nc.from_company_id = auth.uid() OR nc.to_company_id = auth.uid()
-- ORDER BY nc.last_active_at DESC;


-- ─── Q7: Platform aggregate stats (admin) ─────────────────────
-- SELECT
--     COUNT(DISTINCT company_id)                   AS companies_active,
--     SUM(co2_avoided_kg)                          AS total_co2_kg,
--     SUM(water_saved_l)                           AS total_water_l,
--     SUM(total_savings)                           AS total_savings_inr,
--     AVG(circularity_score)                       AS avg_circularity_score
-- FROM public.impact_analytics;


-- ─── Q8: Seed your own circularity score row ─────────────────
-- INSERT INTO public.circularity_scores
--     (company_id, overall_score, recycled_pct, reused_pct, recovered_pct, landfill_pct, sector_percentile)
-- VALUES (
--     auth.uid(), 0, 0, 0, 0, 100, 0
-- )
-- ON CONFLICT (company_id) DO NOTHING;


-- ─── Q9: Seed a monthly impact row for current month ─────────
-- INSERT INTO public.impact_analytics
--     (company_id, period_month, co2_avoided_kg, water_saved_l,
--      energy_saved_kwh, waste_diverted_kg, total_savings, circularity_score)
-- VALUES (
--     auth.uid(),
--     date_trunc('month', NOW())::DATE,
--     0, 0, 0, 0, 0, 0
-- )
-- ON CONFLICT (company_id, period_month) DO NOTHING;
