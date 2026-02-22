-- ============================================================
-- MOLE — Chat System Schema
-- Run this AFTER supabase-reports-schema.sql
-- Paste into Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ─── 12. MESSAGES ──────────────────────────────────────────
-- Stores chat messages between companies regarding specific opportunities
CREATE TABLE IF NOT EXISTS public.messages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id       UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    receiver_id     UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    opportunity_id  UUID        REFERENCES public.opportunities(id) ON DELETE SET NULL,
    
    content         TEXT        NOT NULL,
    is_read         BOOLEAN     NOT NULL DEFAULT false,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can see messages they sent or received
CREATE POLICY "messages_select_own" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can only send messages as themselves
CREATE POLICY "messages_insert_own" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Mark messages as read
CREATE POLICY "messages_update_own" ON public.messages
    FOR UPDATE USING (auth.uid() = receiver_id);

-- Indexes for fast chat retrieval
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_idx ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_opportunity_idx ON public.messages(opportunity_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at ASC);


-- ─── Helper function to get chat list ──────────────────────
-- Returns unique list of companies a user has chatted with
-- This can be used later for a "Conversations" list.
