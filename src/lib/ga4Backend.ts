import { BetaAnalyticsDataClient } from '@google-analytics/data';
import fs from 'fs';
import path from 'path';

const CONFIG_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'ga4-config.json');

export interface GA4Config {
  measurementId: string;
  propertyId: string;
  clientEmail: string;
  privateKey: string;
}

export function getSavedGA4Config(): GA4Config {
  let propertyId = process.env.GA4_PROPERTY_ID || '';
  let clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  let measurementId = process.env.VITE_GA_MEASUREMENT_ID || 'G-2TK1E36EP9';

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.propertyId) propertyId = parsed.propertyId;
      if (parsed.clientEmail) clientEmail = parsed.clientEmail;
      if (parsed.privateKey) privateKey = parsed.privateKey;
      if (parsed.measurementId) measurementId = parsed.measurementId;
    }
  } catch (err) {
    console.error('Error reading GA4 config file:', err);
  }

  return {
    measurementId: measurementId || 'G-2TK1E36EP9',
    propertyId: propertyId.trim(),
    clientEmail: clientEmail.trim(),
    privateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : '',
  };
}

export function saveGA4Config(config: Partial<GA4Config>): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const current = getSavedGA4Config();
    const updated = {
      measurementId: config.measurementId ?? current.measurementId ?? 'G-2TK1E36EP9',
      propertyId: config.propertyId ?? current.propertyId,
      clientEmail: config.clientEmail ?? current.clientEmail,
      privateKey: config.privateKey ?? current.privateKey,
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving GA4 config:', err);
    throw new Error('Failed to write GA4 configuration file on server.');
  }
}

export function getGA4Client(): { client: BetaAnalyticsDataClient; propertyId: string } {
  const config = getSavedGA4Config();

  if (!config.propertyId) {
    throw new Error('GA4 Property ID is not configured.');
  }
  if (!config.clientEmail || !config.privateKey) {
    throw new Error('Google Service Account credentials (clientEmail / privateKey) are missing.');
  }

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
  });

  return { client, propertyId: config.propertyId };
}

export async function testGA4Connection() {
  try {
    const { client, propertyId } = getGA4Client();

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    });

    return {
      success: true,
      message: 'Successfully connected to Google Analytics 4 Data API!',
      rowCount: response.rows ? response.rows.length : 0,
      propertyId,
    };
  } catch (err: any) {
    console.error('GA4 Connection Test Failed:', err);
    let userMsg = err.message || 'Failed to connect to GA4 Data API';

    if (err.message?.includes('PERMISSION_DENIED') || err.code === 7) {
      userMsg = 'Permission denied: Please ensure the Service Account email is added to your GA4 property with "Viewer" access.';
    } else if (err.message?.includes('NOT_FOUND') || err.message?.includes('invalid')) {
      userMsg = 'GA4 Property ID is invalid or could not be found.';
    } else if (err.message?.includes('UNAUTHENTICATED') || err.code === 16) {
      userMsg = 'Google Analytics authentication failed: Invalid Client Email or Private Key.';
    }

    return {
      success: false,
      error: userMsg,
      rawError: err.message,
    };
  }
}

// Memory cache to prevent excessive API calls
let reportCache: { key: string; timestamp: number; data: any } | null = null;
const CACHE_TTL = 30000; // 30 seconds cache

export async function fetchGA4DashboardData(options: {
  dateRangeKey?: string;
  startDate?: string;
  endDate?: string;
  filters?: {
    country?: string;
    city?: string;
    device?: string;
    channel?: string;
  };
}) {
  const config = getSavedGA4Config();
  if (!config.propertyId || !config.clientEmail || !config.privateKey) {
    return {
      success: false,
      configured: false,
      error: 'GA4 Analytics is not connected yet.',
    };
  }

  const rangeKey = options.dateRangeKey || '30days';
  let startDate = options.startDate || '30daysAgo';
  let endDate = options.endDate || 'today';

  if (rangeKey === 'today') {
    startDate = 'today';
    endDate = 'today';
  } else if (rangeKey === 'yesterday') {
    startDate = 'yesterday';
    endDate = 'yesterday';
  } else if (rangeKey === '7days') {
    startDate = '7daysAgo';
    endDate = 'today';
  } else if (rangeKey === '14days') {
    startDate = '14daysAgo';
    endDate = 'today';
  } else if (rangeKey === '30days') {
    startDate = '30daysAgo';
    endDate = 'today';
  } else if (rangeKey === '90days') {
    startDate = '90daysAgo';
    endDate = 'today';
  }

  const cacheKey = `${config.propertyId}_${startDate}_${endDate}_${JSON.stringify(options.filters || {})}`;
  if (reportCache && reportCache.key === cacheKey && Date.now() - reportCache.timestamp < CACHE_TTL) {
    return reportCache.data;
  }

  try {
    const { client, propertyId } = getGA4Client();
    const formattedProperty = `properties/${propertyId}`;

    // Prepare dimension filters if requested
    const dimensionFilterExpressions: any[] = [];
    if (options.filters?.country) {
      dimensionFilterExpressions.push({
        filter: { fieldName: 'country', stringFilter: { value: options.filters.country } },
      });
    }
    if (options.filters?.city) {
      dimensionFilterExpressions.push({
        filter: { fieldName: 'city', stringFilter: { value: options.filters.city } },
      });
    }
    if (options.filters?.device) {
      dimensionFilterExpressions.push({
        filter: { fieldName: 'deviceCategory', stringFilter: { value: options.filters.device } },
      });
    }

    const dimensionFilter = dimensionFilterExpressions.length > 0
      ? { andGroup: { expressions: dimensionFilterExpressions } }
      : undefined;

    // Run parallel reports for all dashboard sections
    const [
      overviewRes,
      trendRes,
      channelsRes,
      topPagesRes,
      geoRes,
      techRes,
      eventsRes,
      eventTrendRes,
    ] = await Promise.all([
      // 1. Total Overview Metrics
      client.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'engagementRate' },
          { name: 'screenPageViews' },
          { name: 'eventCount' },
        ],
        dimensionFilter,
      }),

      // 2. Trend over time (By Date)
      client.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
        ],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
        dimensionFilter,
      }),

      // 3. Traffic Channels
      client.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'engagementRate' },
          { name: 'eventCount' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        dimensionFilter,
      }),

      // 4. Top Pages
      client.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
          { name: 'userEngagementDuration' },
          { name: 'eventCount' },
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 15,
        dimensionFilter,
      }),

      // 5. Geography
      client.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }, { name: 'region' }, { name: 'city' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 15,
        dimensionFilter,
      }),

      // 6. Devices & OS
      client.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }, { name: 'operatingSystem' }, { name: 'browser' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 15,
        dimensionFilter,
      }),

      // 7. Event Totals
      client.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'eventName' }],
        metrics: [
          { name: 'eventCount' },
          { name: 'activeUsers' },
        ],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 25,
        dimensionFilter,
      }),

      // 8. Event Daily Breakdown for Lead Events
      client.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }, { name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          andGroup: {
            expressions: [
              ...(dimensionFilterExpressions || []),
              {
                filter: {
                  fieldName: 'eventName',
                  inListFilter: {
                    values: ['click_phone_call', 'click_whatsapp', 'click_get_directions', 'submit_booking'],
                  },
                },
              },
            ],
          },
        },
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
      }),
    ]);

    // Parse Overview Cards
    const overviewRow = overviewRes[0].rows?.[0]?.metricValues || [];
    const overview = {
      activeUsers: Number(overviewRow[0]?.value || 0),
      totalUsers: Number(overviewRow[1]?.value || 0),
      newUsers: Number(overviewRow[2]?.value || 0),
      sessions: Number(overviewRow[3]?.value || 0),
      engagedSessions: Number(overviewRow[4]?.value || 0),
      engagementRate: (Number(overviewRow[5]?.value || 0) * 100).toFixed(1) + '%',
      views: Number(overviewRow[6]?.value || 0),
      eventCount: Number(overviewRow[7]?.value || 0),
    };

    // Parse Trends over time
    const trends = (trendRes[0].rows || []).map((row) => ({
      date: formatDateString(row.dimensionValues?.[0]?.value || ''),
      users: Number(row.metricValues?.[0]?.value || 0),
      sessions: Number(row.metricValues?.[1]?.value || 0),
      views: Number(row.metricValues?.[2]?.value || 0),
    }));

    // Parse Channels
    const channels = (channelsRes[0].rows || []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value || 'Direct',
      users: Number(row.metricValues?.[0]?.value || 0),
      sessions: Number(row.metricValues?.[1]?.value || 0),
      engagementRate: (Number(row.metricValues?.[2]?.value || 0) * 100).toFixed(1) + '%',
      events: Number(row.metricValues?.[3]?.value || 0),
    }));

    // Parse Top Pages
    const topPages = (topPagesRes[0].rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || '/',
      title: row.dimensionValues?.[1]?.value || 'Home',
      views: Number(row.metricValues?.[0]?.value || 0),
      users: Number(row.metricValues?.[1]?.value || 0),
      avgEngagementTime: formatSeconds(Number(row.metricValues?.[2]?.value || 0) / Math.max(1, Number(row.metricValues?.[1]?.value || 1))),
      events: Number(row.metricValues?.[3]?.value || 0),
    }));

    // Parse Geography
    const geography = (geoRes[0].rows || []).map((row) => ({
      country: row.dimensionValues?.[0]?.value || 'India',
      region: row.dimensionValues?.[1]?.value || '-',
      city: row.dimensionValues?.[2]?.value || 'Purulia',
      users: Number(row.metricValues?.[0]?.value || 0),
      sessions: Number(row.metricValues?.[1]?.value || 0),
    }));

    // Parse Devices
    const devices = (techRes[0].rows || []).map((row) => ({
      category: row.dimensionValues?.[0]?.value || 'mobile',
      os: row.dimensionValues?.[1]?.value || 'Android',
      browser: row.dimensionValues?.[2]?.value || 'Chrome',
      users: Number(row.metricValues?.[0]?.value || 0),
      sessions: Number(row.metricValues?.[1]?.value || 0),
    }));

    // Parse Lead Events
    const leadEventsMap: Record<string, { name: string; count: number; users: number }> = {
      click_phone_call: { name: '📞 Phone Calls', count: 0, users: 0 },
      click_whatsapp: { name: '💬 WhatsApp Clicks', count: 0, users: 0 },
      click_get_directions: { name: '📍 Direction Clicks', count: 0, users: 0 },
      submit_booking: { name: '📋 Booking Submissions', count: 0, users: 0 },
    };

    const allEvents = (eventsRes[0].rows || []).map((row) => {
      const eventName = row.dimensionValues?.[0]?.value || '';
      const count = Number(row.metricValues?.[0]?.value || 0);
      const users = Number(row.metricValues?.[1]?.value || 0);

      if (leadEventsMap[eventName]) {
        leadEventsMap[eventName].count = count;
        leadEventsMap[eventName].users = users;
      }

      return { eventName, count, users };
    });

    // Parse Lead Event Trends
    const leadEventTrends: Record<string, Record<string, number>> = {};
    (eventTrendRes[0].rows || []).forEach((row) => {
      const rawDate = row.dimensionValues?.[0]?.value || '';
      const eventName = row.dimensionValues?.[1]?.value || '';
      const count = Number(row.metricValues?.[0]?.value || 0);
      const formattedDate = formatDateString(rawDate);

      if (!leadEventTrends[formattedDate]) {
        leadEventTrends[formattedDate] = {
          click_phone_call: 0,
          click_whatsapp: 0,
          click_get_directions: 0,
          submit_booking: 0,
        };
      }
      leadEventTrends[formattedDate][eventName] = count;
    });

    const leadTrendsList = Object.keys(leadEventTrends).map((date) => ({
      date,
      click_phone_call: leadEventTrends[date].click_phone_call || 0,
      click_whatsapp: leadEventTrends[date].click_whatsapp || 0,
      click_get_directions: leadEventTrends[date].click_get_directions || 0,
      submit_booking: leadEventTrends[date].submit_booking || 0,
    }));

    const result = {
      success: true,
      configured: true,
      updatedAt: new Date().toISOString(),
      dateRangeKey: rangeKey,
      overview,
      trends,
      channels,
      topPages,
      geography,
      devices,
      leadEvents: leadEventsMap,
      allEvents,
      leadTrends: leadTrendsList,
    };

    reportCache = {
      key: cacheKey,
      timestamp: Date.now(),
      data: result,
    };

    return result;
  } catch (err: any) {
    console.error('GA4 Fetch Report Error:', err);
    let errorType = 'generic';
    let errorMessage = err.message || 'Error executing GA4 Data API report.';

    if (err.message?.includes('PERMISSION_DENIED') || err.code === 7) {
      errorType = 'auth';
      errorMessage = 'Google Analytics authentication / permission failed. Please verify the Service Account has "Viewer" permission on Property ID.';
    } else if (err.message?.includes('NOT_FOUND') || err.message?.includes('invalid')) {
      errorType = 'property_invalid';
      errorMessage = 'GA4 Property ID is invalid or inaccessible.';
    } else if (err.message?.includes('UNAUTHENTICATED') || err.code === 16) {
      errorType = 'auth';
      errorMessage = 'Google Analytics authentication failed. Credentials may be incorrect or corrupted.';
    }

    return {
      success: false,
      configured: true,
      errorType,
      error: errorMessage,
      rawError: err.message,
    };
  }
}

export async function fetchGA4RealtimeData() {
  const config = getSavedGA4Config();
  if (!config.propertyId || !config.clientEmail || !config.privateKey) {
    return {
      success: false,
      configured: false,
      error: 'GA4 Analytics is not connected yet.',
    };
  }

  try {
    const { client, propertyId } = getGA4Client();

    const [realtimeRes] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [
        { name: 'activeUsers' },
        { name: 'eventCount' },
      ],
      dimensions: [
        { name: 'unifiedScreenName' },
        { name: 'eventName' },
        { name: 'city' },
        { name: 'country' },
      ],
    });

    let activeUsers = 0;
    const pagesMap: Record<string, number> = {};
    const eventsMap: Record<string, number> = {};
    const citiesMap: Record<string, number> = {};

    (realtimeRes.rows || []).forEach((row) => {
      const page = row.dimensionValues?.[0]?.value || 'Home';
      const eventName = row.dimensionValues?.[1]?.value || 'page_view';
      const city = row.dimensionValues?.[2]?.value || 'Purulia';
      const users = Number(row.metricValues?.[0]?.value || 0);

      activeUsers += users;
      pagesMap[page] = (pagesMap[page] || 0) + users;
      eventsMap[eventName] = (eventsMap[eventName] || 0) + users;
      citiesMap[city] = (citiesMap[city] || 0) + users;
    });

    return {
      success: true,
      configured: true,
      activeUsers,
      pages: Object.entries(pagesMap).map(([page, users]) => ({ page, users })).sort((a, b) => b.users - a.users).slice(0, 5),
      events: Object.entries(eventsMap).map(([event, users]) => ({ event, users })).sort((a, b) => b.users - a.users).slice(0, 5),
      cities: Object.entries(citiesMap).map(([city, users]) => ({ city, users })).sort((a, b) => b.users - a.users).slice(0, 5),
      updatedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('GA4 Realtime Report Error:', err);
    return {
      success: false,
      configured: true,
      error: 'Realtime GA4 report unavailable or restricted by Google API.',
      rawError: err.message,
    };
  }
}

function formatDateString(str: string): string {
  if (!str || str.length !== 8) return str;
  const yr = str.substring(0, 4);
  const mo = str.substring(4, 6);
  const da = str.substring(6, 8);
  return `${yr}-${mo}-${da}`;
}

function formatSeconds(sec: number): string {
  if (!sec || isNaN(sec)) return '0s';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
