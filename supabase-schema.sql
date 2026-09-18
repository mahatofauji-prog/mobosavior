-- ==========================================================
-- MOBO SAVIOR - SUPABASE POSTGRESQL SCHEMA MIGRATION
-- 
-- Run this script in your Supabase SQL Editor to create 
-- all necessary tables for the application.
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SERVICE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    device_brand TEXT,
    device_model TEXT,
    service_name TEXT,
    issue_description TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    branch_id TEXT,
    status TEXT DEFAULT 'pending',
    estimated_cost NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    starting_price NUMERIC,
    duration TEXT,
    warranty TEXT,
    icon TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. MODELS TABLE
CREATE TABLE IF NOT EXISTS public.models (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. PRICES TABLE
CREATE TABLE IF NOT EXISTS public.prices (
    id TEXT PRIMARY KEY,
    service_id TEXT NOT NULL,
    brand_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    quality_grade TEXT DEFAULT 'OEM Original',
    price NUMERIC NOT NULL,
    warranty TEXT,
    turnaround_time TEXT
);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    rating INT DEFAULT 5,
    comment TEXT,
    service_availed TEXT,
    device_model TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    google_maps_url TEXT,
    is_headquarters BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0
);

-- 8. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    serviceSlugs JSONB,
    problemsCovered JSONB,
    display_order INT DEFAULT 0
);

-- 10. TRUST POINTS TABLE
CREATE TABLE IF NOT EXISTS public.trust_points (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0
);

-- 11. OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    discount_amount TEXT,
    valid_until TEXT,
    category_id TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 12. OFFER CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.offer_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INT DEFAULT 0
);

-- 13. LEGAL PAGES TABLE
CREATE TABLE IF NOT EXISTS public.legal_pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    last_updated TEXT
);

-- 14. LEGAL SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.legal_sections (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    display_order INT DEFAULT 0
);

-- 15. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    display_order INT DEFAULT 0
);

-- 16. SLIDESHOW TABLE
CREATE TABLE IF NOT EXISTS public.slideshow (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    image_url TEXT,
    primary_cta TEXT,
    primary_link TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- ==========================================================
-- GRANT ACCESS (Public REST API Access)
-- ==========================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable Realtime for all tables
alter publication supabase_realtime add table 
  service_bookings, services, brands, models, prices, reviews, 
  branches, settings, categories, trust_points, offers, offer_categories,
  legal_pages, legal_sections, faqs, slideshow;
