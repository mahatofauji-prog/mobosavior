import React, { useState, useEffect } from 'react';
import { 
  BarChart2, RefreshCw, Calendar, TrendingUp, Users, Eye, 
  PhoneCall, MessageCircle, MapPin, ClipboardList, ShieldAlert, 
  CheckCircle2, XCircle, Settings, ExternalLink, Filter, Smartphone, 
  Globe2, Clock, Activity, ArrowUpRight, ChevronRight, AlertCircle, Key
} from 'lucide-react';

interface OverviewData {
  activeUsers: number;
  totalUsers: number;
  newUsers: number;
  sessions: number;
  engagedSessions: number;
  engagementRate: string;
  views: number;
  eventCount: number;
}

interface TrendPoint {
  date: string;
  users: number;
  sessions: number;
  views: number;
}

interface ChannelData {
  channel: string;
  users: number;
  sessions: number;
  engagementRate: string;
  events: number;
}

interface PageData {
  path: string;
  title: string;
  views: number;
  users: number;
  avgEngagementTime: string;
  events: number;
}

interface GeoData {
  country: string;
  region: string;
  city: string;
  users: number;
  sessions: number;
}

interface DeviceData {
  category: string;
  os: string;
  browser: string;
  users: number;
  sessions: number;
}

interface LeadItem {
  name: string;
  count: number;
  users: number;
}

interface EventLog {
  eventName: string;
  count: number;
  users: number;
}

interface LeadTrendPoint {
  date: string;
  click_phone_call: number;
  click_whatsapp: number;
  click_get_directions: number;
  submit_booking: number;
}

interface RealtimeData {
  success: boolean;
  activeUsers: number;
  pages: Array<{ page: string; users: number }>;
  events: Array<{ event: string; users: number }>;
  cities: Array<{ city: string; users: number }>;
  updatedAt: string;
}

export default function AdminAnalyticsDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'settings' | 'setup'>('dashboard');

  // Status & Settings State
  const [statusLoading, setStatusLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [measurementId, setMeasurementId] = useState('G-2TK1E36EP9');
  const [propertyId, setPropertyId] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Test Connection State
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string; rowCount?: number } | null>(null);

  // Dashboard Report State
  const [loadingReport, setLoadingReport] = useState(false);
  const [dateRange, setDateRange] = useState<string>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [reportError, setReportError] = useState<{ type?: string; message: string } | null>(null);

  // Filter States
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('');

  // Report Data
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [topPages, setTopPages] = useState<PageData[]>([]);
  const [geography, setGeography] = useState<GeoData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [leadEvents, setLeadEvents] = useState<Record<string, LeadItem>>({});
  const [allEvents, setAllEvents] = useState<EventLog[]>([]);
  const [leadTrends, setLeadTrends] = useState<LeadTrendPoint[]>([]);

  // Selected metric for main trend graph
  const [trendMetric, setTrendMetric] = useState<'users' | 'sessions' | 'views'>('users');
  // Selected lead event for lead trend graph
  const [selectedLeadEvent, setSelectedLeadEvent] = useState<'click_phone_call' | 'click_whatsapp' | 'click_get_directions' | 'submit_booking'>('click_phone_call');

  // Realtime Data
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [loadingRealtime, setLoadingRealtime] = useState(false);

  // Load GA4 config status on mount
  const checkStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/analytics/status');
      const data = await res.json();
      if (data.success) {
        setMeasurementId(data.measurementId || 'G-2TK1E36EP9');
        if (data.propertyId) setPropertyId(data.propertyId);
        if (data.clientEmail) setClientEmail(data.clientEmail);
        setIsConfigured(data.isFullyConfigured);
      }
    } catch (err) {
      console.error('Failed to check GA4 status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Fetch report data
  const loadDashboardData = async () => {
    setLoadingReport(true);
    setReportError(null);
    try {
      const res = await fetch('/api/analytics/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRangeKey: dateRange,
          startDate: dateRange === 'custom' ? customStartDate : undefined,
          endDate: dateRange === 'custom' ? customEndDate : undefined,
          filters: {
            device: selectedDeviceFilter || undefined,
            city: selectedCityFilter || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!data.success) {
        if (!data.configured) {
          setIsConfigured(false);
          setReportError({ type: 'not_configured', message: 'GA4 Analytics is not connected yet.' });
        } else {
          setReportError({ type: data.errorType || 'api_error', message: data.error || 'Failed to fetch GA4 report.' });
        }
      } else {
        setIsConfigured(true);
        setOverview(data.overview);
        setTrends(data.trends || []);
        setChannels(data.channels || []);
        setTopPages(data.topPages || []);
        setGeography(data.geography || []);
        setDevices(data.devices || []);
        setLeadEvents(data.leadEvents || {});
        setAllEvents(data.allEvents || []);
        setLeadTrends(data.leadTrends || []);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err: any) {
      console.error('Error fetching GA4 report:', err);
      setReportError({ message: 'Network error communicating with GA4 backend server.' });
    } finally {
      setLoadingReport(false);
    }
  };

  // Fetch Realtime Data
  const loadRealtimeData = async () => {
    setLoadingRealtime(true);
    try {
      const res = await fetch('/api/analytics/realtime', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRealtimeData(data);
      }
    } catch (err) {
      console.error('Realtime fetch error:', err);
    } finally {
      setLoadingRealtime(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'dashboard') {
      loadDashboardData();
      loadRealtimeData();
    }
  }, [activeSubTab, dateRange, customStartDate, customEndDate, selectedDeviceFilter, selectedCityFilter]);

  // Handle saving GA4 config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving configuration...');
    try {
      const res = await fetch('/api/analytics/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measurementId,
          propertyId,
          clientEmail,
          privateKey: privateKey || undefined, // send only if updated
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('✅ Settings saved server-side!');
        checkStatus();
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        setSaveStatus(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setSaveStatus(`❌ Network error: ${err.message}`);
    }
  };

  // Test GA4 Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/analytics/test-connection', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        setIsConfigured(true);
      }
    } catch (err: any) {
      setTestResult({ success: false, error: `Connection failed: ${err.message}` });
    } finally {
      setTestingConnection(false);
    }
  };

  // SVG Chart Helper
  const renderTrendChart = (
    data: any[],
    getValue: (item: any) => number,
    getLabel: (item: any) => string,
    color: string = '#0284C7'
  ) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-44 flex items-center justify-center text-slate-400 text-xs italic">
          No data points recorded for this date range.
        </div>
      );
    }

    const values = data.map(getValue);
    const maxVal = Math.max(...values, 1);
    const height = 150;
    const width = 600;
    const padding = 20;

    const points = values.map((val, idx) => {
      const x = padding + (idx / Math.max(1, values.length - 1)) * (width - padding * 2);
      const y = height - padding - (val / maxVal) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[500px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
            {/* Grid Lines */}
            {[0, 0.5, 1].map((ratio, i) => {
              const y = height - padding - ratio * (height - padding * 2);
              const val = Math.round(ratio * maxVal);
              return (
                <g key={i}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  <text x={padding - 5} y={y + 3} fill="#94a3b8" fontSize="8" textAnchor="end" className="font-mono">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Polyline Graph */}
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />

            {/* Data Points */}
            {values.map((val, idx) => {
              const x = padding + (idx / Math.max(1, values.length - 1)) * (width - padding * 2);
              const y = height - padding - (val / maxVal) * (height - padding * 2);
              return (
                <g key={idx} className="group cursor-pointer">
                  <circle cx={x} cy={y} r="3.5" fill={color} className="transition-all group-hover:r-5" />
                  <title>{`${getLabel(data[idx])}: ${val}`}</title>
                </g>
              );
            })}
          </svg>

          {/* Date Axis Labels */}
          <div className="flex justify-between text-[9px] font-mono text-slate-400 px-4 mt-1">
            <span>{getLabel(data[0])}</span>
            {data.length > 2 && <span>{getLabel(data[Math.floor(data.length / 2)])}</span>}
            <span>{getLabel(data[data.length - 1])}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Top Header Bar & Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-[#0284C7] rounded-xl border border-sky-100">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Google Analytics 4 (GA4)
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-200 uppercase font-mono">
                  LIVE API
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                MOBO SAVIOR Real-Time Traffic, Customer Calls, WhatsApp Enquiries & Booking Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-extrabold gap-1 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'dashboard'
                ? 'bg-white text-[#0284C7] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'settings'
                ? 'bg-white text-[#0284C7] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            GA4 Settings
          </button>
          <button
            onClick={() => setActiveSubTab('setup')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'setup'
                ? 'bg-white text-[#0284C7] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Setup Guide
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: LIVE DASHBOARD                                                */}
      {/* ==================================================================== */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Controls Header: Date Pickers, Refresh, Last Updated */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Calendar className="w-4 h-4 text-[#0284C7]" />
                <span>Date Range:</span>
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-extrabold text-slate-800 shadow-sm focus:outline-none focus:border-sky-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="14days">Last 14 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="custom">Custom Date Range</option>
              </select>

              {dateRange === 'custom' && (
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200">
              {lastUpdated && (
                <span className="text-[10px] text-slate-400 font-mono">
                  Refreshed: {lastUpdated}
                </span>
              )}
              <button
                onClick={() => {
                  loadDashboardData();
                  loadRealtimeData();
                }}
                disabled={loadingReport}
                className="px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingReport ? 'animate-spin' : ''}`} />
                <span>Refresh Analytics</span>
              </button>
            </div>
          </div>

          {/* ERROR OR UNCONFIGURED STATE */}
          {reportError && (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-left space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-rose-900 text-sm">
                    {reportError.type === 'not_configured'
                      ? 'GA4 Analytics is not connected yet.'
                      : reportError.type === 'auth'
                      ? 'Google Analytics Authentication Failed'
                      : reportError.type === 'property_invalid'
                      ? 'GA4 Property ID is invalid or inaccessible'
                      : 'Analytics Reporting Error'}
                  </h4>
                  <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
                    {reportError.message}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => setActiveSubTab('settings')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Configure GA4 Credentials
                    </button>
                    <button
                      onClick={() => setActiveSubTab('setup')}
                      className="px-4 py-2 bg-white text-rose-800 border border-rose-200 font-extrabold text-xs rounded-xl transition-all hover:bg-rose-100/50"
                    >
                      View Setup Instructions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REALTIME VISITORS BANNER */}
          {realtimeData && realtimeData.success && (
            <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider font-mono">
                    Realtime Active Right Now
                  </span>
                </div>
                <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                  {realtimeData.activeUsers}{' '}
                  <span className="text-xs font-bold text-slate-400">visitors on website</span>
                </div>
              </div>

              {/* Realtime breakdown pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {realtimeData.pages.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 space-y-0.5">
                    <span className="text-[10px] text-sky-300 font-bold block uppercase">Top Active Page</span>
                    <span className="font-extrabold text-white truncate max-w-[150px] block">
                      {realtimeData.pages[0].page} ({realtimeData.pages[0].users})
                    </span>
                  </div>
                )}
                {realtimeData.cities.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 space-y-0.5">
                    <span className="text-[10px] text-sky-300 font-bold block uppercase">Active Location</span>
                    <span className="font-extrabold text-white truncate max-w-[150px] block">
                      {realtimeData.cities[0].city} ({realtimeData.cities[0].users})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OVERVIEW METRIC CARDS (8 CARDS) */}
          {overview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Active Users</span>
                  <Users className="w-4 h-4 text-[#0284C7]" />
                </div>
                <div className="text-2xl font-black text-slate-900">{overview.activeUsers.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-medium">Unique active visitors</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
                  <Users className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{overview.totalUsers.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-medium">All user sessions</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">New Users</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{overview.newUsers.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-medium">First-time visitors</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Sessions</span>
                  <Activity className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{overview.sessions.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-medium">Total visits logged</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Engaged Visits</span>
                  <Clock className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{overview.engagedSessions.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-medium">Visits &gt;10s or 2+ pages</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Engagement Rate</span>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{overview.engagementRate}</div>
                <div className="text-[10px] text-slate-400 font-medium">User interest index</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Page Views</span>
                  <Eye className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{overview.views.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-medium">Total screen views</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Event Count</span>
                  <ClipboardList className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{overview.eventCount.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-medium">Total interaction triggers</div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION: LEAD & EVENT TELEMETRY (CRITICAL FOR MOBO SAVIOR)          */}
          {/* ==================================================================== */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm font-sans flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  Lead & Conversion Event Telemetry
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Direct customer phone calls, WhatsApp repair inquiries, Google Maps navigation clicks, and booking submissions
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-200 self-start sm:self-auto font-mono">
                CONVERSION METRICS
              </span>
            </div>

            {/* Lead Event Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Phone Calls */}
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900">📞 Phone Calls</span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {leadEvents['click_phone_call']?.users || 0} callers
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-950">
                  {leadEvents['click_phone_call']?.count || 0}
                </div>
                <p className="text-[10px] text-emerald-800/80 font-medium">Triggers on support phone button clicks</p>
              </div>

              {/* WhatsApp Clicks */}
              <div className="bg-teal-50/50 border border-teal-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-teal-900">💬 WhatsApp Clicks</span>
                  <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                    {leadEvents['click_whatsapp']?.users || 0} users
                  </span>
                </div>
                <div className="text-3xl font-black text-teal-950">
                  {leadEvents['click_whatsapp']?.count || 0}
                </div>
                <p className="text-[10px] text-teal-800/80 font-medium">Triggers on direct WhatsApp chat launches</p>
              </div>

              {/* Direction Clicks */}
              <div className="bg-sky-50/50 border border-sky-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-sky-900">📍 Location Clicks</span>
                  <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                    {leadEvents['click_get_directions']?.users || 0} users
                  </span>
                </div>
                <div className="text-3xl font-black text-sky-950">
                  {leadEvents['click_get_directions']?.count || 0}
                </div>
                <p className="text-[10px] text-sky-800/80 font-medium">Triggers on Google Maps direction links</p>
              </div>

              {/* Booking Submissions */}
              <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900">📋 Bookings Logged</span>
                  <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    {leadEvents['submit_booking']?.users || 0} submitters
                  </span>
                </div>
                <div className="text-3xl font-black text-indigo-950">
                  {leadEvents['submit_booking']?.count || 0}
                </div>
                <p className="text-[10px] text-indigo-800/80 font-medium">Triggers on booking form completions</p>
              </div>
            </div>

            {/* Lead Events Trend Chart */}
            {leadTrends.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-extrabold text-slate-800">Conversion Event Trend Graph</span>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 font-extrabold">
                    <button
                      onClick={() => setSelectedLeadEvent('click_phone_call')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        selectedLeadEvent === 'click_phone_call' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Calls
                    </button>
                    <button
                      onClick={() => setSelectedLeadEvent('click_whatsapp')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        selectedLeadEvent === 'click_whatsapp' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => setSelectedLeadEvent('click_get_directions')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        selectedLeadEvent === 'click_get_directions' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Directions
                    </button>
                    <button
                      onClick={() => setSelectedLeadEvent('submit_booking')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        selectedLeadEvent === 'submit_booking' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Bookings
                    </button>
                  </div>
                </div>

                {renderTrendChart(
                  leadTrends,
                  (item) => item[selectedLeadEvent] || 0,
                  (item) => item.date,
                  selectedLeadEvent === 'click_phone_call'
                    ? '#059669'
                    : selectedLeadEvent === 'click_whatsapp'
                    ? '#0d9488'
                    : selectedLeadEvent === 'click_get_directions'
                    ? '#0284c7'
                    : '#4f46e5'
                )}
              </div>
            )}
          </div>

          {/* ==================================================================== */}
          {/* SECTION: TRAFFIC TRENDS OVER TIME                                   */}
          {/* ==================================================================== */}
          {trends.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-sans flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0284C7]" />
                    Website Traffic & Engagement Timeline
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Daily breakdown of unique visitors, sessions, and screen page views</p>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-extrabold gap-1 self-start sm:self-auto">
                  <button
                    onClick={() => setTrendMetric('users')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      trendMetric === 'users' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => setTrendMetric('sessions')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      trendMetric === 'sessions' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sessions
                  </button>
                  <button
                    onClick={() => setTrendMetric('views')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      trendMetric === 'views' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Views
                  </button>
                </div>
              </div>

              {renderTrendChart(
                trends,
                (item) => item[trendMetric],
                (item) => item.date,
                '#0284C7'
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION: TRAFFIC SOURCES & TOP PAGES (GRID)                          */}
          {/* ==================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Channels */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-sm font-sans">Traffic Acquisition Channels</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Where your visitors are finding MOBO SAVIOR</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black">
                      <th className="pb-2">Channel</th>
                      <th className="pb-2 text-right">Users</th>
                      <th className="pb-2 text-right">Sessions</th>
                      <th className="pb-2 text-right">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {channels.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 italic">No channels recorded.</td>
                      </tr>
                    ) : (
                      channels.map((ch, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 font-bold text-slate-800">{ch.channel}</td>
                          <td className="py-2.5 text-right font-mono text-slate-700">{ch.users.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono text-slate-700">{ch.sessions.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">{ch.engagementRate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-sm font-sans">Most Visited Pages & Screens</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Top performing routes sorted by screen views</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black">
                      <th className="pb-2">Page Path</th>
                      <th className="pb-2 text-right">Views</th>
                      <th className="pb-2 text-right">Users</th>
                      <th className="pb-2 text-right">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {topPages.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 italic">No pages logged.</td>
                      </tr>
                    ) : (
                      topPages.map((pg, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5">
                            <span className="font-bold text-slate-800 block truncate max-w-[180px]" title={pg.title}>
                              {pg.path}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-700 font-bold">{pg.views.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono text-slate-700">{pg.users.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono text-slate-500">{pg.avgEngagementTime}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SECTION: GEOGRAPHY & DEVICES (GRID)                                 */}
          {/* ==================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visitors by Location */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-sans flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-[#0284C7]" />
                    Visitors by Location
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Cities, states, and countries sending traffic</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black">
                      <th className="pb-2">Location</th>
                      <th className="pb-2 text-right">Users</th>
                      <th className="pb-2 text-right">Sessions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {geography.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400 italic">No geographic data logged.</td>
                      </tr>
                    ) : (
                      geography.map((g, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5">
                            <span className="font-bold text-slate-800">{g.city !== '(not set)' ? g.city : g.country}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">{g.region}, {g.country}</span>
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-700 font-bold">{g.users.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono text-slate-700">{g.sessions.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Devices & Technology */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-sm font-sans flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#0284C7]" />
                  Devices & Technology
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Mobile vs Desktop hardware and operating systems</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black">
                      <th className="pb-2">Device & OS</th>
                      <th className="pb-2">Browser</th>
                      <th className="pb-2 text-right">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {devices.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400 italic">No device metrics logged.</td>
                      </tr>
                    ) : (
                      devices.map((d, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5">
                            <span className="font-bold text-slate-800 capitalize">{d.category}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">{d.os}</span>
                          </td>
                          <td className="py-2.5 text-slate-600 font-mono text-[11px]">{d.browser}</td>
                          <td className="py-2.5 text-right font-mono text-slate-700 font-bold">{d.users.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SECTION: ALL GA4 LOGGED EVENTS LIST                                 */}
          {/* ==================================================================== */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm font-sans">Complete GA4 Custom Event Log</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">All tracked events registered inside Google Analytics 4</p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black">
                    <th className="pb-2">Event Name</th>
                    <th className="pb-2 text-right">Event Count</th>
                    <th className="pb-2 text-right">Users Triggered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {allEvents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400 italic">No events recorded.</td>
                    </tr>
                  ) : (
                    allEvents.map((ev, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 font-mono font-bold text-slate-800">{ev.eventName}</td>
                        <td className="py-2.5 text-right font-mono text-[#0284C7] font-black">{ev.count.toLocaleString()}</td>
                        <td className="py-2.5 text-right font-mono text-slate-700">{ev.users.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: GOOGLE ANALYTICS SETTINGS                                    */}
      {/* ==================================================================== */}
      {activeSubTab === 'settings' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-slate-900 text-sm font-sans flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#0284C7]" />
              Google Analytics 4 Data API Credentials
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure your numeric GA4 Property ID and Google Service Account credentials to securely fetch reporting data server-side.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            {/* Status Banner */}
            <div className="p-4 rounded-2xl border flex items-center justify-between gap-4 bg-slate-50 border-slate-200">
              <div className="flex items-center gap-3">
                {isConfigured ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                )}
                <div>
                  <span className="font-extrabold text-slate-800 block text-xs">
                    API Connection Status: {isConfigured ? '🟢 Connected' : '🔴 Not Fully Configured'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isConfigured
                      ? 'Server credentials and Property ID are present and ready.'
                      : 'Enter numeric Property ID, Service Account Client Email and Private Key below.'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:border-[#0284C7] text-slate-800 font-extrabold rounded-xl shadow-sm text-xs transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-[#0284C7]' : ''}`} />
                Test Connection
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <div>
                    <span className="font-extrabold block">✓ Connection Successful!</span>
                    <span>{testResult.message} (Rows returned: {testResult.rowCount})</span>
                  </div>
                ) : (
                  <div>
                    <span className="font-extrabold block">❌ Connection Error:</span>
                    <span>{testResult.error}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  GA4 Measurement ID (Public Header Tag)
                </label>
                <input
                  type="text"
                  value={measurementId}
                  onChange={(e) => setMeasurementId(e.target.value)}
                  placeholder="G-2TK1E36EP9"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-xs focus:border-sky-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Fixed to G-2TK1E36EP9 for frontend tracking tag.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  GA4 Numeric Property ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  placeholder="e.g. 372309552 or 412345678"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-xs focus:border-sky-500 focus:outline-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Found in Google Analytics Property Settings (numeric ID only, e.g. 412345678).
                </p>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Google Service Account Client Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="my-service-account@my-project.iam.gserviceaccount.com"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-xs focus:border-sky-500 focus:outline-none"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Generated in Google Cloud IAM & Service Accounts. Must be added to your GA4 property with "Viewer" access.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Google Service Account Private Key (`GOOGLE_PRIVATE_KEY`)
              </label>
              <textarea
                rows={4}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] focus:border-sky-500 focus:outline-none leading-tight"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Stored strictly server-side in `data/ga4-config.json` or `.env`. Never exposed to browser frontend.
              </p>
            </div>

            {saveStatus && (
              <div className="p-3 bg-slate-100 rounded-xl font-bold text-slate-800 text-xs">
                {saveStatus}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Save GA4 Configuration Server-Side</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: GOOGLE CLOUD & GA4 SETUP GUIDE                               */}
      {/* ==================================================================== */}
      {activeSubTab === 'setup' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-slate-900 text-sm font-sans flex items-center gap-2">
              <Key className="w-4 h-4 text-[#0284C7]" />
              Step-by-Step Google Cloud & GA4 Data API Setup Guide
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Follow these simple 5 steps to connect your Google Analytics property without paying for any API subscription.
            </p>
          </div>

          <div className="space-y-6 text-slate-700">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-[#0284C7] text-white font-black flex items-center justify-center text-xs flex-shrink-0">
                1
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-slate-900 text-xs">Enable Google Analytics Data API</h5>
                <p className="text-slate-600 leading-relaxed">
                  Go to <a href="https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-[#0284C7] font-bold underline">Google Cloud Console API Library</a>, select your Google Cloud project, and click <strong>"ENABLE"</strong> for the <strong>Google Analytics Data API</strong>.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-[#0284C7] text-white font-black flex items-center justify-center text-xs flex-shrink-0">
                2
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-slate-900 text-xs">Create a Google Service Account</h5>
                <p className="text-slate-600 leading-relaxed">
                  Navigate to <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-[#0284C7] font-bold underline">IAM & Admin &rarr; Service Accounts</a>. Click <strong>"Create Service Account"</strong>, name it <code>mobosavior-analytics</code>, and click Create.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-[#0284C7] text-white font-black flex items-center justify-center text-xs flex-shrink-0">
                3
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-slate-900 text-xs">Generate JSON Key File</h5>
                <p className="text-slate-600 leading-relaxed">
                  Click on the created Service Account &rarr; Go to <strong>"Keys"</strong> tab &rarr; Click <strong>"Add Key" &rarr; "Create new key"</strong> &rarr; Select <strong>JSON</strong>. Download the JSON file to your computer.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-[#0284C7] text-white font-black flex items-center justify-center text-xs flex-shrink-0">
                4
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-slate-900 text-xs">Grant Viewer Access in Google Analytics</h5>
                <p className="text-slate-600 leading-relaxed">
                  Open your <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-[#0284C7] font-bold underline">Google Analytics Console</a> for property <code>G-2TK1E36EP9</code>. Go to <strong>Admin &rarr; Property Settings &rarr; Property Access Management</strong>. Click <strong>"+" &rarr; "Add users"</strong>, paste your Service Account email (e.g. <code>mobosavior-analytics@...iam.gserviceaccount.com</code>), and assign the <strong>"Viewer"</strong> role.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-[#0284C7] text-white font-black flex items-center justify-center text-xs flex-shrink-0">
                5
              </div>
              <div className="space-y-1">
                <h5 className="font-extrabold text-slate-900 text-xs">Copy Property ID & Private Key to GA4 Settings</h5>
                <p className="text-slate-600 leading-relaxed">
                  Find your numeric GA4 Property ID in Analytics Property Settings. Open the downloaded JSON key file, copy the <code>client_email</code> and <code>private_key</code>, and enter them in the <button onClick={() => setActiveSubTab('settings')} className="text-[#0284C7] font-bold underline">GA4 Settings tab</button> above!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
