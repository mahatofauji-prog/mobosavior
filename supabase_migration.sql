-- ============================================================================
-- MOBO SAVIOR — MASTER SUPABASE SQL DATABASE MIGRATION SCRIPT
-- RUN THIS SCRIPT IN YOUR SUPABASE PROJECT'S SQL EDITOR
-- Features: Idempotent (safe to re-run), Creates missing tables, Adds missing columns,
-- Configures Row Level Security (RLS) policies, Grants public permissions,
-- Creates media storage bucket, and adds triggers for updated_at timestamps.
-- ============================================================================

BEGIN;

-- 1. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    branch_code TEXT,
    address TEXT,
    city TEXT DEFAULT 'Purulia',
    state TEXT DEFAULT 'West Bengal',
    pincode TEXT DEFAULT '723101',
    google_maps_url TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    business_hours JSONB,
    is_headquarters BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS branch_code TEXT;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS is_headquarters BOOLEAN DEFAULT FALSE;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    data JSONB DEFAULT '{}'::jsonb,
    value JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUSINESS PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.business_profile (
    id TEXT PRIMARY KEY DEFAULT 'main',
    brand_name TEXT DEFAULT 'MOBO SAVIOR',
    business_name TEXT DEFAULT 'MOBO SAVIOR',
    tagline TEXT DEFAULT 'PURULIA KA TRUSTED MOBILE REPAIRING SHOP',
    logo_url TEXT,
    primary_phone TEXT DEFAULT '081675 49092',
    phone TEXT DEFAULT '081675 49092',
    whatsapp_number TEXT DEFAULT '081675 49092',
    whatsapp TEXT DEFAULT '081675 49092',
    email TEXT DEFAULT 'mahatofauji@gmail.com',
    full_address TEXT DEFAULT 'Room No B4, Super Market, Hattola More, Purulia, West Bengal 723101',
    address TEXT DEFAULT 'Room No B4, Super Market, Hattola More, Purulia, West Bengal 723101',
    city TEXT DEFAULT 'Purulia',
    state TEXT DEFAULT 'West Bengal',
    pincode TEXT DEFAULT '723101',
    about_text TEXT,
    bio TEXT,
    about_highlight TEXT,
    facebook_page_url TEXT,
    facebook_url TEXT,
    instagram_profile_url TEXT,
    instagram_url TEXT,
    whatsapp_channel_link TEXT,
    whatsapp_channel_url TEXT,
    google_maps_link TEXT,
    google_maps_url TEXT,
    map_embed_iframe_link TEXT,
    map_iframe_url TEXT,
    youtube_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    overview TEXT,
    image_url TEXT,
    category TEXT,
    price TEXT,
    price_type TEXT DEFAULT 'starting_from',
    estimated_time TEXT,
    problems_covered JSONB DEFAULT '[]'::jsonb,
    symptoms JSONB DEFAULT '[]'::jsonb,
    diagnosis_process TEXT,
    repair_process_steps JSONB DEFAULT '[]'::jsonb,
    tools_and_tech JSONB DEFAULT '[]'::jsonb,
    supported_brands JSONB DEFAULT '[]'::jsonb,
    supported_models JSONB DEFAULT '[]'::jsonb,
    model_prices JSONB DEFAULT '[]'::jsonb,
    quality_options JSONB DEFAULT '[]'::jsonb,
    warranty TEXT,
    important_notes TEXT,
    faqs JSONB DEFAULT '[]'::jsonb,
    seo_title TEXT,
    meta_description TEXT,
    seo_keywords JSONB DEFAULT '[]'::jsonb,
    canonical_url TEXT,
    og_image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    long_description TEXT,
    image_url TEXT,
    badge TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    problems_covered JSONB DEFAULT '[]'::jsonb,
    service_slugs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    logo_url TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MODELS TABLE
CREATE TABLE IF NOT EXISTS public.models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    brand TEXT,
    release_year INTEGER,
    image_url TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    service_prices JSONB DEFAULT '[]'::jsonb,
    available_services JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRICES TABLE
CREATE TABLE IF NOT EXISTS public.prices (
    id TEXT PRIMARY KEY,
    service_id TEXT,
    service_slug TEXT,
    service_name TEXT,
    category TEXT,
    brand_id TEXT,
    brand TEXT,
    model_id TEXT,
    model TEXT,
    display_variant TEXT,
    price_type TEXT DEFAULT 'starting_from',
    amount NUMERIC,
    currency TEXT DEFAULT '₹',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    category TEXT,
    media_type TEXT DEFAULT 'image',
    image_url TEXT,
    video_url TEXT,
    video_platform TEXT,
    youtube_video_id TEXT,
    before_image_url TEXT,
    after_image_url TEXT,
    thumbnail_url TEXT,
    alt_text TEXT,
    featured BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    reviewer_name TEXT,
    rating NUMERIC DEFAULT 5,
    review_text TEXT,
    customer_photo_url TEXT,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'approved',
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    booking_id TEXT,
    service_availed TEXT,
    phone TEXT,
    device_model TEXT,
    comment TEXT,
    google_review_id TEXT,
    google_review_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    category TEXT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    destination_url TEXT,
    discount TEXT,
    start_date TEXT,
    end_date TEXT,
    valid_until TEXT,
    terms TEXT,
    cta_text TEXT DEFAULT 'Claim Offer',
    cta_type TEXT DEFAULT 'whatsapp',
    cta_value TEXT,
    is_featured BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. OFFER CATEGORIES
CREATE TABLE IF NOT EXISTS public.offer_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TRUST POINTS TABLE
CREATE TABLE IF NOT EXISTS public.trust_points (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. WEBSITE SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.website_sections (
    id TEXT PRIMARY KEY,
    page TEXT DEFAULT 'home',
    section_key TEXT NOT NULL,
    section_name TEXT NOT NULL,
    description TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. PAGES TABLE
CREATE TABLE IF NOT EXISTS public.pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    sections JSONB DEFAULT '[]'::jsonb,
    featured_image TEXT,
    seo_title TEXT,
    meta_description TEXT,
    og_image_url TEXT,
    display_order INTEGER DEFAULT 1,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'Published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    featured_image TEXT,
    author_name TEXT DEFAULT 'Saddam Bhai',
    category TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    publish_date TEXT,
    seo_title TEXT,
    meta_description TEXT,
    og_image_url TEXT,
    status TEXT DEFAULT 'Published',
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. BLOG CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. NAVIGATION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.navigation_items (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. LEGAL PAGES TABLE
CREATE TABLE IF NOT EXISTS public.legal_pages (
    id TEXT PRIMARY KEY,
    page_type TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    seo_title TEXT,
    meta_description TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. LEGAL SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.legal_sections (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL,
    heading TEXT NOT NULL,
    content TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. SERVICE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.service_bookings (
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
    status TEXT DEFAULT 'New Request',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    service_id TEXT,
    service_name TEXT,
    brand TEXT,
    model TEXT,
    problem_description TEXT,
    customer_name TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. MEDIA ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.media_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT,
    size BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. HERO SLIDES TABLE
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id TEXT PRIMARY KEY,
    title TEXT,
    image_url TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. SEO SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    site_title TEXT,
    meta_description TEXT,
    primary_keyword TEXT,
    secondary_keywords JSONB DEFAULT '[]'::jsonb,
    canonical_url TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image_url TEXT,
    robots_config TEXT DEFAULT 'index, follow',
    search_console_verification TEXT,
    google_analytics_id TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    category TEXT,
    video_url TEXT,
    image_url TEXT,
    thumbnail_url TEXT,
    video_platform TEXT,
    youtube_video_id TEXT,
    featured BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'branches', 'settings', 'business_profile', 'services', 'categories',
        'brands', 'models', 'prices', 'gallery', 'reviews', 'offers',
        'offer_categories', 'trust_points', 'faqs', 'website_sections',
        'pages', 'blog_posts', 'blog_categories', 'navigation_items',
        'legal_pages', 'legal_sections', 'service_bookings', 'bookings',
        'media_items', 'hero_slides', 'seo_settings', 'videos'
    ];
BEGIN
    FOR tbl IN SELECT unnest(tables) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow public full access', tbl);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true);', 'Allow public full access', tbl);
        EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role;', tbl);
    END LOOP;
END $$;

-- STORAGE BUCKET CREATION FOR MEDIA & LOGOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('mobosavior-media', 'mobosavior-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- STORAGE POLICIES FOR MEDIA BUCKET
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Access" ON storage.objects;
CREATE POLICY "Public Insert Access" ON storage.objects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;
CREATE POLICY "Public Update Access" ON storage.objects FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;
CREATE POLICY "Public Delete Access" ON storage.objects FOR DELETE USING (true);

COMMIT;
