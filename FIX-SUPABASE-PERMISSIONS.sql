-- ==========================================================
-- MOBO SAVIOR: INSTANT SUPABASE RLS PERMISSIONS FIX
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cynrkcrjcxpyiuagyvxj/sql
-- ==========================================================

-- 1. Disable Row Level Security (RLS) on all user data & booking tables
ALTER TABLE IF EXISTS public.service_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_bookings_public DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.models DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trust_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offer_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.faqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.slideshow DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.navigation_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.website_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.legal_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.legal_sections DISABLE ROW LEVEL SECURITY;

-- 2. Grant full read/write permissions to anon, authenticated, and service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 3. Storage Bucket Configuration for Media
INSERT INTO storage.buckets (id, name, public)
VALUES ('mobosavior-media', 'mobosavior-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Notify PostgREST to reload the schema cache immediately
NOTIFY pgrst, 'reload schema';
