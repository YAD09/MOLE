-- ============================================================
-- RPC: Finalize Deal
-- Handles atomic transaction creation, opportunity update, and impact analytics for both parties
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION finalize_deal(
  p_partner_id UUID,
  p_role TEXT, -- 'seller' or 'buyer'
  p_material TEXT,
  p_amount NUMERIC,
  p_price NUMERIC,
  p_notes TEXT,
  p_opportunity_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (bypass RLS for partner updates)
AS $$
DECLARE
  v_user_id UUID;
  v_seller_id UUID;
  v_buyer_id UUID;
  v_current_month DATE;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Determine roles
  IF p_role = 'seller' THEN
    v_seller_id := v_user_id;
    v_buyer_id := p_partner_id;
  ELSE
    v_seller_id := p_partner_id;
    v_buyer_id := v_user_id;
  END IF;

  -- 1. Create Transaction
  INSERT INTO public.transactions (seller_id, buyer_id, material, amount, price, notes)
  VALUES (v_seller_id, v_buyer_id, p_material, p_amount, p_price, p_notes);

  -- 2. Update Opportunity (if exists)
  IF p_opportunity_id IS NOT NULL THEN
    UPDATE public.opportunities
    SET status = 'accepted'
    WHERE id = p_opportunity_id;
  END IF;

  -- 3. Update Impact Analytics
  v_current_month := date_trunc('month', now())::DATE;

  -- Seller Impact: Waste Diverted (kg), Total Savings (Revenue), Tx Count
  INSERT INTO public.impact_analytics (company_id, period_month, waste_diverted_kg, total_savings, transactions_count)
  VALUES (v_seller_id, v_current_month, p_amount * 1000, p_price, 1)
  ON CONFLICT (company_id, period_month) DO UPDATE
  SET 
    waste_diverted_kg = impact_analytics.waste_diverted_kg + EXCLUDED.waste_diverted_kg,
    total_savings = impact_analytics.total_savings + EXCLUDED.total_savings,
    transactions_count = impact_analytics.transactions_count + 1;

  -- Buyer Impact: Transactions Count (and potentially others in future)
  INSERT INTO public.impact_analytics (company_id, period_month, transactions_count)
  VALUES (v_buyer_id, v_current_month, 1)
  ON CONFLICT (company_id, period_month) DO UPDATE
  SET 
    transactions_count = impact_analytics.transactions_count + 1;

END;
$$;
