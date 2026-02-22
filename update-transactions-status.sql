-- Add status and stage columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'finalized', -- 'draft', 'pending_payment', 'in_progress', 'completed', 'cancelled'
ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'agreement'; -- 'negotiation', 'payment', 'logistics', 'delivery', 'review'

-- Update RLS policies to allow updates
CREATE POLICY "transactions_update_own" ON public.transactions
    FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Create index for faster queries on status
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions(status);
CREATE INDEX IF NOT EXISTS transactions_seller_buyer_idx ON public.transactions(seller_id, buyer_id);
