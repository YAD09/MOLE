-- ============================================================
-- RPC: Finalize Deal (Updated for Drafts)
-- Handles atomic transaction finalization (create or update), opportunity update, and impact analytics
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION finalize_deal(
  p_partner_id UUID,
  p_role TEXT, -- 'seller' or 'buyer'
  p_material TEXT,
  p_amount NUMERIC,
  p_price NUMERIC,
  p_notes TEXT,
  p_opportunity_id UUID DEFAULT NULL,
  p_transaction_id UUID DEFAULT NULL -- If provided, updates existing draft
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator
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

  -- 1. Create or Update Transaction
  IF p_transaction_id IS NOT NULL THEN
    -- Update existing draft
    UPDATE public.transactions
    SET 
      status = 'active',
      stage = 'payment_pending',
      material = p_material,
      amount = p_amount,
      price = p_price,
      notes = p_notes,
      updated_at = now() -- Assuming updated_at exists or is handled by trigger, but let's ignore if not present in schema yet
    WHERE id = p_transaction_id;
  ELSE
    -- Create new active transaction
    INSERT INTO public.transactions (seller_id, buyer_id, material, amount, price, notes, status, stage)
    VALUES (v_seller_id, v_buyer_id, p_material, p_amount, p_price, p_notes, 'active', 'payment_pending');
  END IF;

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

  -- Buyer Impact: Transactions Count
  INSERT INTO public.impact_analytics (company_id, period_month, transactions_count)
  VALUES (v_buyer_id, v_current_month, 1)
  ON CONFLICT (company_id, period_month) DO UPDATE
  SET 
    transactions_count = impact_analytics.transactions_count + 1;

END;
$$;
