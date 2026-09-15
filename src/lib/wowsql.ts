import { WowSQLClient } from '@wowsql/sdk';

export const WOWSQL_CONFIG = {
  projectUrl: import.meta.env.VITE_WOWSQL_URL || 'https://mani-school-erp-e1d57a54.wowsqlconnect.com',
  apiKey: import.meta.env.VITE_WOWSQL_ANON_KEY || 'wowsql_anon_UKb-lxFN2jqPmdz5rX2prwwuM_z8Jf4JmG7IwlpO5KA'
};

export const wowsql = new WowSQLClient({
  projectUrl: WOWSQL_CONFIG.projectUrl,
  apiKey: WOWSQL_CONFIG.apiKey
});

/**
 * Checks connectivity to WOWSQL endpoint
 */
export async function testWowSqlConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  message: string;
  tablesFound: string[];
  missingTables: string[];
}> {
  const startTime = Date.now();
  const requiredTables = [
    'services',
    'service_bookings',
    'reviews',
    'branches',
    'brands',
    'models',
    'prices',
    'settings'
  ];
  
  const tablesFound: string[] = [];
  const missingTables: string[] = [];

  try {
    // Ping root REST endpoint to check latency and gateway response
    const pingRes = await fetch(`${WOWSQL_CONFIG.projectUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': WOWSQL_CONFIG.apiKey
      }
    });

    const latencyMs = Date.now() - startTime;

    // Check each required table via PostgREST
    await Promise.all(
      requiredTables.map(async (table) => {
        try {
          const res = await fetch(`${WOWSQL_CONFIG.projectUrl}/rest/v1/${table}?limit=1`, {
            headers: {
              'apikey': WOWSQL_CONFIG.apiKey
            }
          });
          if (res.ok) {
            tablesFound.push(table);
          } else {
            missingTables.push(table);
          }
        } catch {
          missingTables.push(table);
        }
      })
    );

    return {
      connected: pingRes.status !== 502 && pingRes.status !== 503,
      latencyMs,
      message: tablesFound.length > 0 
        ? `Connected to WOWSQL (${tablesFound.length} tables active)` 
        : `Connected to WOWSQL Gateway. Schema tables pending creation.`,
      tablesFound,
      missingTables
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      message: err?.message || 'Failed to connect to WOWSQL',
      tablesFound: [],
      missingTables: requiredTables
    };
  }
}

/**
 * Sends a booking record directly to WOWSQL if table exists
 */
export async function saveBookingToWowSQL(bookingData: {
  customer_name: string;
  customer_phone: string;
  device_brand?: string;
  device_model?: string;
  issue_description?: string;
  service_name?: string;
  preferred_date?: string;
  status?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${WOWSQL_CONFIG.projectUrl}/rest/v1/service_bookings`, {
      method: 'POST',
      headers: {
        'apikey': WOWSQL_CONFIG.apiKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        ...bookingData,
        created_at: new Date().toISOString()
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * The complete SQL schema to create all required tables in WOWSQL PostgreSQL database
 */
export const WOWSQL_SCHEMA_SQL = `-- ==========================================================
-- MOBO SAVIOR MOBILE REPAIRING - WOWSQL POSTGRESQL SCHEMA
-- Copy and paste this script into your WOWSQL SQL Editor
-- ==========================================================

-- 1. SERVICE BOOKINGS TABLE (Customer appointments & leads)
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

-- 2. SERVICES TABLE (Repair offerings & base pricing)
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

-- 3. BRANDS TABLE (Apple, Samsung, Xiaomi, Vivo, etc.)
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. MODELS TABLE (iPhone 15, Galaxy S24, Redmi Note 13, etc.)
CREATE TABLE IF NOT EXISTS public.models (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. PRICES TABLE (Exact part / repair rates per model)
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

-- 6. REVIEWS TABLE (Customer feedback & Google ratings)
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

-- 7. BRANCHES TABLE (Purulia Main Lab & other branches)
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

-- 8. SETTINGS TABLE (Branding, contact info, operating hours)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- GRANT PERMISSIONS TO ANON ROLE FOR REST API ACCESS
-- ==========================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
`;
