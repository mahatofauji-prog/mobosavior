-- ============================================================================
-- MOBO SAVIOR — WEB PUSH NOTIFICATION SYSTEM DATABASE MIGRATION
-- Run this in your Supabase SQL Editor (cynrkcrjcxpyiuagyvxj).
-- ============================================================================

-- Enable pgcrypto (UUIDs) and pg_net (async HTTP requests)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- Create table for admin Web Push subscriptions
CREATE TABLE IF NOT EXISTS public.admin_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id TEXT DEFAULT 'admin_auth',
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    device_label TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- Enable Row Level Security (RLS) on admin_push_subscriptions
ALTER TABLE public.admin_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Block all public access; only permit full read/write via service_role (e.g. Edge Functions)
DROP POLICY IF EXISTS "service_role_all" ON public.admin_push_subscriptions;
CREATE POLICY "service_role_all" ON public.admin_push_subscriptions 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Create background trigger to invoke Edge Function asynchronously on every new customer booking insertion
CREATE OR REPLACE FUNCTION public.trigger_new_booking_webhook()
RETURNS TRIGGER AS $$
DECLARE
    v_edge_function_url TEXT := 'https://cynrkcrjcxpyiuagyvxj.supabase.co/functions/v1/send-new-booking-notification';
    v_service_anon_key TEXT := 'sb_publishable_63nVtmzyXYHGi1lLJWxwxw_6rY8XeKh'; -- Project anon key to authenticate HTTP request
BEGIN
    PERFORM
        net.http_post(
            url := v_edge_function_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || v_service_anon_key
            ),
            body := json_build_object(
                'type', 'db_webhook_insert',
                'record', row_to_json(NEW)
            )::text,
            timeout_milliseconds := 5000
        );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to public.service_bookings
DROP TRIGGER IF EXISTS tr_new_booking_webhook ON public.service_bookings;
CREATE TRIGGER tr_new_booking_webhook
AFTER INSERT ON public.service_bookings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_new_booking_webhook();

-- Notify PostgREST to refresh schema cache
NOTIFY pgrst, 'reload schema';
