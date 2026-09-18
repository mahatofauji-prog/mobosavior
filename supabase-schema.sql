-- ==========================================================
-- MOBO SAVIOR - PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- 
-- Run this in your Supabase SQL Editor (cynrkcrjcxpyiuagyvxj).
-- This creates/updates all 26 tables with all required columns,
-- grants full permissions to anon & authenticated roles,
-- enables Realtime, and reloads the PostgREST schema cache.
-- ==========================================================

-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables to guarantee completely clean, up-to-date schema
DROP TABLE IF EXISTS public.service_bookings_public CASCADE;
DROP TABLE IF EXISTS public.service_bookings CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.models CASCADE;
DROP TABLE IF EXISTS public.prices CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.trust_points CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.offer_categories CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.slideshow CASCADE;
DROP TABLE IF EXISTS public.gallery CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.blog_categories CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.navigation_items CASCADE;
DROP TABLE IF EXISTS public.website_sections CASCADE;
DROP TABLE IF EXISTS public.media_library CASCADE;
DROP TABLE IF EXISTS public.legal_pages CASCADE;
DROP TABLE IF EXISTS public.legal_sections CASCADE;

-- 1. SETTINGS TABLE (Flexible JSON storage for branding, contact, seo, content, hours)
CREATE TABLE public.settings (
    id TEXT PRIMARY KEY,
    data JSONB DEFAULT '{}'::jsonb,
    value JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICE BOOKINGS (Private, detailed bookings submitted from Book Your Repair form)
CREATE TABLE public.service_bookings (
    id TEXT PRIMARY KEY,
    service_id TEXT,
    customer_name TEXT,
    address TEXT,
    pin_code TEXT,
    contact_number TEXT,
    whatsapp_number TEXT,
    mobile_brand TEXT,
    mobile_model TEXT,
    problem TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    front_image_url TEXT,
    back_image_url TEXT,
    status TEXT DEFAULT 'Booking Received',
    notes TEXT,
    estimated_cost NUMERIC,
    created_at TEXT DEFAULT NOW()::text,
    updated_at TEXT DEFAULT NOW()::text
);

-- 3. SERVICE BOOKINGS PUBLIC (Masked status for customer tracking page)
CREATE TABLE public.service_bookings_public (
    id TEXT PRIMARY KEY,
    service_id TEXT,
    customer_name_masked TEXT,
    mobile_brand TEXT,
    mobile_model TEXT,
    problem_summary TEXT,
    booking_date TEXT DEFAULT NOW()::text,
    preferred_date TEXT,
    preferred_time TEXT,
    status TEXT DEFAULT 'Booking Received',
    last_updated TEXT DEFAULT NOW()::text
);

-- 4. BOOKINGS (General Bookings table used by Admin and API)
CREATE TABLE public.bookings (
    id TEXT PRIMARY KEY,
    "serviceId" TEXT,
    service_id TEXT,
    "serviceName" TEXT,
    service_name TEXT,
    brand TEXT,
    model TEXT,
    "problemDescription" TEXT,
    problem_description TEXT,
    "customerName" TEXT,
    customer_name TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    "preferredDate" TEXT,
    preferred_date TEXT,
    "preferredTime" TEXT,
    preferred_time TEXT,
    message TEXT,
    "estimatedPrice" TEXT,
    status TEXT DEFAULT 'Pending',
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text,
    "updatedAt" TEXT DEFAULT NOW()::text,
    updated_at TEXT DEFAULT NOW()::text
);

-- 5. SERVICES TABLE
CREATE TABLE public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    overview TEXT,
    "imageUrl" TEXT,
    image_url TEXT,
    category TEXT,
    price TEXT,
    "priceType" TEXT DEFAULT 'starting_from',
    price_type TEXT DEFAULT 'starting_from',
    "estimatedTime" TEXT,
    estimated_time TEXT,
    "problemsCovered" JSONB DEFAULT '[]'::jsonb,
    problems_covered JSONB DEFAULT '[]'::jsonb,
    symptoms JSONB DEFAULT '[]'::jsonb,
    "diagnosisProcess" TEXT,
    "repairProcessSteps" JSONB DEFAULT '[]'::jsonb,
    "toolsAndTech" JSONB DEFAULT '[]'::jsonb,
    "supportedBrands" JSONB DEFAULT '[]'::jsonb,
    "supportedModels" JSONB DEFAULT '[]'::jsonb,
    "modelPrices" JSONB DEFAULT '[]'::jsonb,
    "qualityOptions" JSONB DEFAULT '[]'::jsonb,
    warranty TEXT,
    "importantNotes" TEXT,
    faqs JSONB DEFAULT '[]'::jsonb,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "seoKeywords" JSONB DEFAULT '[]'::jsonb,
    "canonicalUrl" TEXT,
    "ogImageUrl" TEXT,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text,
    "updatedAt" TEXT DEFAULT NOW()::text,
    updated_at TEXT DEFAULT NOW()::text
);

-- 6. REVIEWS TABLE
CREATE TABLE public.reviews (
    id TEXT PRIMARY KEY,
    "customerName" TEXT,
    customer_name TEXT,
    "reviewerName" TEXT,
    reviewer_name TEXT,
    rating NUMERIC DEFAULT 5,
    "reviewText" TEXT,
    review_text TEXT,
    comment TEXT,
    "customerPhotoUrl" TEXT,
    customer_photo_url TEXT,
    source TEXT DEFAULT 'google',
    featured BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text,
    "updatedAt" TEXT DEFAULT NOW()::text,
    updated_at TEXT DEFAULT NOW()::text,
    "serviceSlug" TEXT,
    service_slug TEXT,
    service_availed TEXT,
    device_model TEXT
);

-- 7. CATEGORIES TABLE
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    "longDescription" TEXT,
    "imageUrl" TEXT,
    image_url TEXT,
    icon TEXT,
    badge TEXT,
    "problemsCovered" JSONB DEFAULT '[]'::jsonb,
    "serviceSlugs" JSONB DEFAULT '[]'::jsonb,
    "seoTitle" TEXT,
    "h1Name" TEXT,
    "metaDescription" TEXT,
    "imageAltText" TEXT,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0
);

-- 8. BRANDS TABLE
CREATE TABLE public.brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    "logoUrl" TEXT,
    logo_url TEXT,
    popular BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0
);

-- 9. MODELS TABLE
CREATE TABLE public.models (
    id TEXT PRIMARY KEY,
    brand TEXT,
    "brandId" TEXT,
    brand_id TEXT,
    name TEXT NOT NULL,
    slug TEXT,
    "releaseYear" INT,
    "imageUrl" TEXT,
    image_url TEXT,
    category TEXT,
    "availableServices" JSONB DEFAULT '[]'::jsonb,
    "servicePrices" JSONB DEFAULT '{}'::jsonb,
    "displayTypes" JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0
);

-- 10. PRICES TABLE
CREATE TABLE public.prices (
    id TEXT PRIMARY KEY,
    "serviceId" TEXT,
    service_id TEXT,
    "serviceSlug" TEXT,
    service_slug TEXT,
    "serviceName" TEXT,
    service_name TEXT,
    category TEXT,
    "brandId" TEXT,
    brand_id TEXT,
    brand TEXT,
    "modelId" TEXT,
    model_id TEXT,
    model TEXT,
    "displayVariant" TEXT,
    "priceType" TEXT DEFAULT 'fixed',
    amount NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    currency TEXT DEFAULT '₹',
    notes TEXT,
    warranty TEXT,
    turnaround_time TEXT,
    "isActive" BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text,
    "updatedAt" TEXT DEFAULT NOW()::text,
    updated_at TEXT DEFAULT NOW()::text
);

-- 11. BRANCHES TABLE
CREATE TABLE public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    "branchCode" TEXT,
    branch_code TEXT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Purulia',
    state TEXT DEFAULT 'West Bengal',
    pincode TEXT DEFAULT '723101',
    "googleMapsUrl" TEXT,
    google_maps_url TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    "businessHours" JSONB DEFAULT '{}'::jsonb,
    business_hours JSONB DEFAULT '{}'::jsonb,
    "isHeadquarters" BOOLEAN DEFAULT FALSE,
    is_headquarters BOOLEAN DEFAULT FALSE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0
);

-- 12. FAQS TABLE
CREATE TABLE public.faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0
);

-- 13. SLIDESHOW TABLE
CREATE TABLE public.slideshow (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    "imageUrl" TEXT,
    image_url TEXT,
    "ctaText" TEXT,
    primary_cta TEXT,
    "ctaLink" TEXT,
    primary_link TEXT,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0
);

-- 14. TRUST POINTS TABLE
CREATE TABLE public.trust_points (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    "imageUrl" TEXT,
    image_url TEXT,
    "isFeatured" BOOLEAN DEFAULT TRUE,
    "isActive" BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text,
    "updatedAt" TEXT DEFAULT NOW()::text,
    updated_at TEXT DEFAULT NOW()::text
);

-- 15. OFFERS TABLE
CREATE TABLE public.offers (
    id TEXT PRIMARY KEY,
    "categoryId" TEXT,
    category_id TEXT,
    category TEXT,
    title TEXT NOT NULL,
    description TEXT,
    "imageUrl" TEXT,
    image_url TEXT,
    discount TEXT,
    discount_amount TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    valid_until TEXT,
    terms TEXT,
    "ctaText" TEXT,
    "ctaType" TEXT,
    "ctaValue" TEXT,
    "isFeatured" BOOLEAN DEFAULT FALSE,
    "isActive" BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0
);

-- 16. OFFER CATEGORIES TABLE
CREATE TABLE public.offer_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 17. GALLERY TABLE
CREATE TABLE public.gallery (
    id TEXT PRIMARY KEY,
    "imageUrl" TEXT,
    image_url TEXT,
    "videoUrl" TEXT,
    video_url TEXT,
    "videoPlatform" TEXT,
    "youtubeVideoId" TEXT,
    "beforeImageUrl" TEXT,
    "afterImageUrl" TEXT,
    "thumbnailUrl" TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Repairing Photos',
    "mediaType" TEXT DEFAULT 'photo',
    "altText" TEXT,
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text
);

-- 18. VIDEOS TABLE
CREATE TABLE public.videos (
    id TEXT PRIMARY KEY,
    "videoUrl" TEXT NOT NULL,
    video_url TEXT,
    "videoPlatform" TEXT DEFAULT 'youtube',
    "thumbnailUrl" TEXT,
    thumbnail_url TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Repairing Videos',
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text,
    "serviceSlug" TEXT,
    brand TEXT,
    model TEXT
);

-- 19. BLOG POSTS TABLE
CREATE TABLE public.blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    "featuredImage" TEXT,
    featured_image TEXT,
    "authorName" TEXT DEFAULT 'MOBO SAVIOR Expert',
    category TEXT DEFAULT 'Mobile Repair',
    tags JSONB DEFAULT '[]'::jsonb,
    "publishDate" TEXT DEFAULT NOW()::text,
    publish_date TEXT DEFAULT NOW()::text,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "ogImageUrl" TEXT,
    status TEXT DEFAULT 'Published',
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text
);

-- 20. BLOG CATEGORIES TABLE
CREATE TABLE public.blog_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0
);

-- 21. PAGES TABLE
CREATE TABLE public.pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    sections JSONB DEFAULT '[]'::jsonb,
    "featuredImage" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "ogImageUrl" TEXT,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'Published',
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text,
    "updatedAt" TEXT DEFAULT NOW()::text,
    updated_at TEXT DEFAULT NOW()::text
);

-- 22. NAVIGATION ITEMS TABLE
CREATE TABLE public.navigation_items (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    "order" INT DEFAULT 0,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    "imageUrl" TEXT
);

-- 23. WEBSITE SECTIONS TABLE
CREATE TABLE public.website_sections (
    id TEXT PRIMARY KEY,
    page TEXT DEFAULT 'home',
    "sectionKey" TEXT,
    section_key TEXT,
    "sectionName" TEXT,
    section_name TEXT,
    description TEXT,
    "isVisible" BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    settings JSONB DEFAULT '{}'::jsonb,
    "updatedAt" TEXT DEFAULT NOW()::text,
    updated_at TEXT DEFAULT NOW()::text
);

-- 24. MEDIA LIBRARY TABLE
CREATE TABLE public.media_library (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    size NUMERIC DEFAULT 0,
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text
);

-- 25. LEGAL PAGES TABLE
CREATE TABLE public.legal_pages (
    id TEXT PRIMARY KEY,
    "pageType" TEXT,
    page_type TEXT,
    title TEXT NOT NULL,
    slug TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN DEFAULT TRUE,
    last_updated TEXT,
    "updatedAt" TEXT DEFAULT NOW()::text,
    updated_at TEXT DEFAULT NOW()::text
);

-- 26. LEGAL SECTIONS TABLE
CREATE TABLE public.legal_sections (
    id TEXT PRIMARY KEY,
    "pageId" TEXT,
    page_id TEXT,
    heading TEXT,
    title TEXT,
    content TEXT,
    "displayOrder" INT DEFAULT 0,
    display_order INT DEFAULT 0,
    "isActive" BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    "createdAt" TEXT DEFAULT NOW()::text,
    created_at TEXT DEFAULT NOW()::text,
    "updatedAt" TEXT DEFAULT NOW()::text,
    updated_at TEXT DEFAULT NOW()::text
);

-- ==========================================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR SMOOTH PUBLIC ACCESS
-- (Since MOBO SAVIOR handles admin auth via passcode gate)
-- ==========================================================
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings_public DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshow DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_sections DISABLE ROW LEVEL SECURITY;

-- ==========================================================
-- GRANT FULL PERMISSIONS TO ANON AND AUTHENTICATED USERS
-- ==========================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- ==========================================================
-- REALTIME REPLICATION PUBLICATION
-- ==========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE 
  public.settings,
  public.service_bookings,
  public.service_bookings_public,
  public.bookings,
  public.services,
  public.reviews,
  public.categories,
  public.brands,
  public.models,
  public.prices,
  public.branches,
  public.faqs,
  public.slideshow,
  public.trust_points,
  public.offers,
  public.offer_categories,
  public.gallery,
  public.videos,
  public.blog_posts,
  public.blog_categories,
  public.pages,
  public.navigation_items,
  public.website_sections,
  public.media_library,
  public.legal_pages,
  public.legal_sections;

-- Notify PostgREST to immediately refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- ==========================================================
-- STORAGE BUCKET SETUP FOR MEDIA & BOOKINGS
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('mobosavior-media', 'mobosavior-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Storage Read' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Storage Read" ON storage.objects FOR SELECT USING (bucket_id = 'mobosavior-media');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Storage Insert' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mobosavior-media');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Storage Update' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Storage Update" ON storage.objects FOR UPDATE USING (bucket_id = 'mobosavior-media');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Storage Delete' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'mobosavior-media');
  END IF;
END $$;

