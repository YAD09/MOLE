-- Allow sellers (counterparties) to see and respond to opportunities sent to them
DROP POLICY IF EXISTS "opportunities_select_own" ON public.opportunities;
CREATE POLICY "opportunities_select_own" ON public.opportunities
    FOR SELECT USING (auth.uid() = company_id OR auth.uid() = counterparty_id);

DROP POLICY IF EXISTS "opportunities_update_own" ON public.opportunities;
CREATE POLICY "opportunities_update_own" ON public.opportunities
    FOR UPDATE USING (auth.uid() = company_id OR auth.uid() = counterparty_id);

-- Optional: If they need to insert or delete, although typically only buyer inserts and maybe deletes.
-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
