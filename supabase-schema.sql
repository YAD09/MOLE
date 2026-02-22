-- ============================================================
-- MOLE — Supabase Schema + RLS
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 1. COMPANIES ───────────────────────────────────────────
-- Stores 1-to-1 company profile per auth user
CREATE TABLE IF NOT EXISTS public.companies (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT        NOT NULL,
    industry_type TEXT       NOT NULL DEFAULT '',
    location      TEXT       NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Each user can only see/edit their own company record
CREATE POLICY "companies_select_own" ON public.companies
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "companies_insert_own" ON public.companies
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "companies_update_own" ON public.companies
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "companies_delete_own" ON public.companies
    FOR DELETE USING (auth.uid() = id);


-- ─── 2. WASTE LISTINGS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waste_listings (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id       UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    waste_type       TEXT        NOT NULL,
    description      TEXT,
    quantity         NUMERIC     NOT NULL DEFAULT 0,
    unit             TEXT        NOT NULL DEFAULT 'Tons',
    frequency        TEXT        NOT NULL DEFAULT 'one-time',
    condition        TEXT        NOT NULL DEFAULT '',
    hazard_level     TEXT        NOT NULL DEFAULT 'non-hazardous',
    handling         TEXT,
    listing_location TEXT,
    price_per_unit   NUMERIC,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.waste_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waste_listings_select_own" ON public.waste_listings
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "waste_listings_insert_own" ON public.waste_listings
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "waste_listings_update_own" ON public.waste_listings
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "waste_listings_delete_own" ON public.waste_listings
    FOR DELETE USING (auth.uid() = company_id);


-- ─── 3. MATERIAL REQUESTS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.material_requests (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    material_needed     TEXT        NOT NULL,
    quantity_required   NUMERIC     NOT NULL DEFAULT 0,
    unit                TEXT        NOT NULL DEFAULT 'Tons',
    frequency           TEXT        NOT NULL DEFAULT 'recurring',
    quality_grade       TEXT,
    quality_constraints TEXT,
    delivery_location   TEXT,
    max_distance_km     NUMERIC,
    price_per_unit      NUMERIC,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "material_requests_select_own" ON public.material_requests
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "material_requests_insert_own" ON public.material_requests
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "material_requests_update_own" ON public.material_requests
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "material_requests_delete_own" ON public.material_requests
    FOR DELETE USING (auth.uid() = company_id);


-- ─── 4. AUTO-CREATE COMPANY ROW ON FIRST SIGN-UP ───────────
-- This function fires after a new user is created in auth.users
-- It seeds a companies row using the user_metadata that AuthContext passes during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.companies (id, company_name, industry_type, location)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'company', ''),
        COALESCE(NEW.raw_user_meta_data->>'industry', ''),
        COALESCE(NEW.raw_user_meta_data->>'location', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Drop old trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
