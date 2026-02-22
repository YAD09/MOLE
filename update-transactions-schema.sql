
-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id        UUID        NOT NULL REFERENCES public.companies(id),
    buyer_id         UUID        NOT NULL REFERENCES public.companies(id),
    material         TEXT        NOT NULL,
    amount           NUMERIC     NOT NULL DEFAULT 0,
    price            NUMERIC     NOT NULL DEFAULT 0,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view transactions they are part of
CREATE POLICY "transactions_select_own" ON public.transactions
    FOR SELECT USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Allow users to insert transactions they are part of
CREATE POLICY "transactions_insert_own" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = seller_id OR auth.uid() = buyer_id);
