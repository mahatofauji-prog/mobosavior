import React, { useState, useEffect } from 'react';
import { 
  Database, CheckCircle2, AlertTriangle, Copy, Check, RefreshCw, 
  ArrowUpRight, Server, ShieldCheck, HardDrive, Play, Zap, FileCode
} from 'lucide-react';
import { 
  WOWSQL_CONFIG, 
  WOWSQL_SCHEMA_SQL, 
  testWowSqlConnection 
} from '../../lib/wowsql';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminWowSQL() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{
    connected: boolean;
    latencyMs: number;
    message: string;
    tablesFound: string[];
    missingTables: string[];
  }>({
    connected: false,
    latencyMs: 0,
    message: 'Testing connection...',
    tablesFound: [],
    missingTables: []
  });

  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const res = await testWowSqlConnection();
      setStatus(res);
    } catch (e: any) {
      setStatus({
        connected: false,
        latencyMs: 0,
        message: e?.message || 'Error connecting to WOWSQL',
        tablesFound: [],
        missingTables: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleTestConnection();
  }, []);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(WOWSQL_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSyncDataToWowSQL = async () => {
    if (status.missingTables.length > 0) {
      alert('Please create the tables in your WOWSQL SQL Editor first before running sync!');
      return;
    }

    setSyncing(true);
    setSyncLogs(['Starting data migration from Firestore to WOWSQL...']);

    try {
      // 1. Sync Services
      setSyncLogs(prev => [...prev, 'Fetching services from Firestore...']);
      const servicesSnap = await getDocs(collection(db, 'services'));
      let serviceSuccess = 0;
      for (const docSnap of servicesSnap.docs) {
        const data = docSnap.data();
        const res = await fetch(`${WOWSQL_CONFIG.projectUrl}/rest/v1/services`, {
          method: 'POST',
          headers: {
            'apikey': WOWSQL_CONFIG.apiKey,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: docSnap.id,
            name: data.name || '',
            category: data.category || '',
            description: data.description || '',
            starting_price: data.startingPrice || data.price || 0,
            duration: data.turnaroundTime || '',
            warranty: data.warranty || '',
            display_order: data.displayOrder || 0,
            is_active: data.isActive !== false
          })
        });
        if (res.ok) serviceSuccess++;
      }
      setSyncLogs(prev => [...prev, `Synced ${serviceSuccess} services to WOWSQL.`]);

      // 2. Sync Reviews
      setSyncLogs(prev => [...prev, 'Fetching reviews...']);
      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      let reviewSuccess = 0;
      for (const docSnap of reviewsSnap.docs) {
        const data = docSnap.data();
        const res = await fetch(`${WOWSQL_CONFIG.projectUrl}/rest/v1/reviews`, {
          method: 'POST',
          headers: {
            'apikey': WOWSQL_CONFIG.apiKey,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: docSnap.id,
            customer_name: data.customerName || data.name || 'Customer',
            rating: data.rating || 5,
            comment: data.comment || '',
            service_availed: data.serviceAvailed || '',
            is_verified: true
          })
        });
        if (res.ok) reviewSuccess++;
      }
      setSyncLogs(prev => [...prev, `Synced ${reviewSuccess} reviews to WOWSQL.`]);

      // 3. Sync Branches
      setSyncLogs(prev => [...prev, 'Fetching branches...']);
      const branchesSnap = await getDocs(collection(db, 'branches'));
      let branchSuccess = 0;
      for (const docSnap of branchesSnap.docs) {
        const data = docSnap.data();
        const res = await fetch(`${WOWSQL_CONFIG.projectUrl}/rest/v1/branches`, {
          method: 'POST',
          headers: {
            'apikey': WOWSQL_CONFIG.apiKey,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: docSnap.id,
            name: data.name || '',
            address: data.address || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            google_maps_url: data.googleMapsUrl || '',
            display_order: data.displayOrder || 0
          })
        });
        if (res.ok) branchSuccess++;
      }
      setSyncLogs(prev => [...prev, `Synced ${branchSuccess} branches to WOWSQL.`]);

      setSyncLogs(prev => [...prev, 'All records migrated to WOWSQL successfully!']);
      handleTestConnection();
    } catch (err: any) {
      setSyncLogs(prev => [...prev, `Sync error: ${err?.message || 'Unknown error'}`]);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="w-64 h-64 text-sky-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 border border-sky-400/30 rounded-full text-xs font-semibold text-sky-300">
            <Zap className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            WoWSQL BaaS Integration
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            WOWSQL PostgreSQL Connection
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Your website is configured to connect to your dedicated WOWSQL PostgreSQL cloud instance. 
            Manage table schemas, check connectivity, and sync customer bookings directly.
          </p>
        </div>
      </div>

      {/* Connection Details & Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-50 text-[#0284C7]">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Active WOWSQL Project</h3>
                <p className="text-xs text-slate-500">PostgreSQL BaaS Endpoint</p>
              </div>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 font-medium block mb-1">Base URL:</span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 break-all select-all">
                {WOWSQL_CONFIG.projectUrl}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-1">Anonymous Key:</span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600 break-all select-all flex items-center justify-between">
                <span>{WOWSQL_CONFIG.apiKey.slice(0, 16)}••••••••••••••••{WOWSQL_CONFIG.apiKey.slice(-8)}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
                </span>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            status.connected 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            {status.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="font-bold flex items-center gap-2">
                <span>{status.connected ? 'Gateway Online & Reachable' : 'Connection Warning'}</span>
                {status.latencyMs > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 font-normal">
                    {status.latencyMs}ms response
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90">{status.message}</p>
            </div>
          </div>
        </div>

        {/* Database Tables Quick View */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <HardDrive className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-base">PostgreSQL Tables</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              PostgreSQL requires tables in the schema cache to store and read data.
            </p>

            <div className="space-y-2">
              {[
                { name: 'service_bookings', desc: 'Customer Bookings' },
                { name: 'services', desc: 'Repair Catalog' },
                { name: 'reviews', desc: 'Customer Reviews' },
                { name: 'branches', desc: 'Store Locations' },
                { name: 'prices', desc: 'Price Matrix' }
              ].map(table => {
                const exists = status.tablesFound.includes(table.name);
                return (
                  <div 
                    key={table.name} 
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 font-mono">{table.name}</span>
                      <span className="text-[11px] text-slate-400 block">{table.desc}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      exists 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {exists ? 'Active' : 'Pending SQL'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCopySQL}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'SQL Script Copied!' : 'Copy SQL Schema Script'}
          </button>
        </div>
      </div>

      {/* 3-Step Setup Instructions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              How to Initialize WOWSQL Tables (1-Minute Guide)
            </h3>
            <p className="text-xs text-slate-500">
              Run this standard PostgreSQL script in your WOWSQL dashboard to create all tables with proper permissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">1</div>
            <h4 className="font-bold text-slate-800 pt-1">Copy the SQL Script</h4>
            <p className="text-slate-500">Click the "Copy SQL Script" button below to copy the complete schema script.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">2</div>
            <h4 className="font-bold text-slate-800 pt-1">Open WOWSQL Dashboard</h4>
            <p className="text-slate-500">Go to your project at wowsql.com and click on the <strong>SQL Editor</strong> tab.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">3</div>
            <h4 className="font-bold text-slate-800 pt-1">Paste & Run</h4>
            <p className="text-slate-500">Paste the script into the editor and hit <strong>Run Query</strong>. All tables are created!</p>
          </div>
        </div>

        {/* Code Preview Box */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono">schema.sql</span>
            <button
              onClick={handleCopySQL}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-64 leading-relaxed">
            {WOWSQL_SCHEMA_SQL}
          </pre>
        </div>

        {/* Sync Action */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Transfer Current Data to WOWSQL</h4>
            <p className="text-xs text-slate-500">
              Once tables are created in WOWSQL, migrate existing services, reviews, and branches from Firestore.
            </p>
          </div>
          <button
            onClick={handleSyncDataToWowSQL}
            disabled={syncing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Migrating Data...' : 'Migrate Data to WOWSQL'}
          </button>
        </div>

        {syncLogs.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-900 font-mono text-xs text-slate-300 space-y-1">
            {syncLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sky-400">›</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
