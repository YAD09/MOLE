-- ============================================================
-- MOLE — Marketplace RLS Policies
-- Run this in Supabase Dashboard → SQL Editor → Run
-- This allows authenticated buyers to read ALL waste listings
-- so the marketplace tab in Opportunities.tsx works correctly.
-- ============================================================

-- ─── Allow ALL authenticated users to read ANY waste listing ──
-- (They still can only INSERT/UPDATE/DELETE their own via existing policies)
DROP POLICY IF EXISTS "waste_listings_select_own" ON public.waste_listings;

CREATE POLICY "waste_listings_select_authenticated" ON public.waste_listings
    FOR SELECT USING (auth.role() = 'authenticated');

-- ─── Also allow all authenticated users to read all companies ──
-- Required for the JOIN: waste_listings JOIN companies(company_name, location)
DROP POLICY IF EXISTS "companies_select_own" ON public.companies;

CREATE POLICY "companies_select_authenticated" ON public.companies
    FOR SELECT USING (auth.role() = 'authenticated');

-- Note: INSERT/UPDATE/DELETE on companies still require auth.uid() = id
-- (those policies remain unchanged from supabase-schema.sql)
