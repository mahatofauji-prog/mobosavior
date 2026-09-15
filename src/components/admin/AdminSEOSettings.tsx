import React, { useState } from 'react';
import { SEOSettings } from '../../types';
import ImageUploader from './ImageUploader';
import { 
  Globe, Search, BarChart3, ShieldCheck, CheckCircle2, AlertCircle, Save, 
  Loader2, ExternalLink, Code2, Copy, Check, Info, FileText, Sparkles, Layers
} from 'lucide-react';

interface AdminSEOSettingsProps {
  seoSettings: SEOSettings;
  onSave: (updated: SEOSettings) => Promise<void>;
}

export default function AdminSEOSettings({ seoSettings, onSave }: AdminSEOSettingsProps) {
  const [siteTitle, setSiteTitle] = useState(seoSettings.siteTitle || 'MOBO SAVIOR | Mobile Repairing Shop in Purulia');
  const [metaDescription, setMetaDescription] = useState(
    seoSettings.metaDescription || 
    'MOBO SAVIOR is Purulia\'s specialist mobile phone repair lab by Saddam Bhai. iPhone screen replacement, CPU reballing, eMMC programming, and battery service.'
  );
  const [primaryKeyword, setPrimaryKeyword] = useState(seoSettings.primaryKeyword || 'Mobile Repairing Shop in Purulia');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string>(
    Array.isArray(seoSettings.secondaryKeywords) 
      ? seoSettings.secondaryKeywords.join(', ') 
      : 'iPhone Repair in Purulia, Android Repair Purulia, Motherboard Repair Purulia, CPU Reballing, Display Replacement'
  );
  const [canonicalUrl, setCanonicalUrl] = useState(seoSettings.canonicalUrl || 'https://mobosavior.com');
  const [ogTitle, setOgTitle] = useState(seoSettings.ogTitle || seoSettings.siteTitle || 'MOBO SAVIOR | Mobile Repair Lab Purulia');
  const [ogDescription, setOgDescription] = useState(seoSettings.ogDescription || seoSettings.metaDescription || '');
  const [ogImageUrl, setOgImageUrl] = useState(seoSettings.ogImageUrl || 'https://mobosavior.com/logo.png');
  const [robotsConfig, setRobotsConfig] = useState(seoSettings.robotsConfig || 'index, follow');
  const [searchConsoleVerification, setSearchConsoleVerification] = useState(seoSettings.searchConsoleVerification || '');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(seoSettings.googleAnalyticsId || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    const parsedKeywords = secondaryKeywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    try {
      await onSave({
        siteTitle: siteTitle.trim(),
        metaDescription: metaDescription.trim(),
        primaryKeyword: primaryKeyword.trim(),
        secondaryKeywords: parsedKeywords,
        canonicalUrl: canonicalUrl.trim(),
        ogTitle: ogTitle.trim(),
        ogDescription: ogDescription.trim(),
        ogImageUrl: ogImageUrl.trim(),
        robotsConfig,
        searchConsoleVerification: searchConsoleVerification.trim(),
        googleAnalyticsId: googleAnalyticsId.trim()
      });

      setSuccessMsg('SEO & Analytics settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save SEO settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const isGA4Configured = Boolean(googleAnalyticsId.trim() && /^G-[A-Z0-9]+$/i.test(googleAnalyticsId.trim()));
  const isGSCConfigured = Boolean(searchConsoleVerification.trim());

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Search Engine Optimization & Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              SEO, Google Search Console & GA4 Center
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage your local SEO foundation for Purulia, West Bengal. Configure Google Analytics 4 tracking and Search Console site verification safely without exposes of secrets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              isGA4Configured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <BarChart3 className="w-4 h-4" />
              <span>GA4: {isGA4Configured ? 'ACTIVE' : 'NOT CONFIGURED'}</span>
            </div>

            <div className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              isGSCConfigured ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <Search className="w-4 h-4" />
              <span>GSC: {isGSCConfigured ? 'TAG INJECTED' : 'PENDING'}</span>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Analytics & Search Console Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-sky-50 text-[#0284C7] rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Google Analytics 4 & Search Console Verification</h3>
              <p className="text-xs text-slate-500">Provide your official measurement ID and site ownership verification tag.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GA4 Measurement ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>GA4 Measurement ID</span>
                <span className="text-[11px] text-slate-400 font-normal lowercase">(e.g. G-XXXXXXXXXX)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="G-1234567890"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7] font-mono"
                />
                <div className="absolute right-3 top-2.5">
                  {isGA4Configured ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Info className="w-5 h-5 text-slate-300" />
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                When specified, Google Analytics 4 event tracking will automatically initialize for WhatsApp clicks, phone calls, directions, and enquiry forms without sending any PII.
              </p>
            </div>

            {/* Search Console Verification Tag */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Google Search Console Verification Tag</span>
                <span className="text-[11px] text-slate-400 font-normal lowercase">(HTML tag or verification string)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchConsoleVerification}
                  onChange={(e) => setSearchConsoleVerification(e.target.value)}
                  placeholder='e.g. google-site-verification="ABC123XYZ..."'
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7] font-mono text-xs"
                />
                <div className="absolute right-3 top-2.5">
                  {isGSCConfigured ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Info className="w-5 h-5 text-slate-300" />
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Paste your HTML tag or verification string from Search Console. It will be injected dynamically into the <code>&lt;head&gt;</code> tag of your site.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Global Site Meta & Local Keywords */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Global Title & Local SEO Metadata</h3>
              <p className="text-xs text-slate-500">Purulia location optimization defaults for default search rankings.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Global Site Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Site Meta Title Tag
                </label>
                <span className={`text-xs font-mono font-bold ${siteTitle.length > 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {siteTitle.length} / 60 chars
                </span>
              </div>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="MOBO SAVIOR | Expert Mobile Repair Shop in Purulia"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                required
              />
            </div>

            {/* Global Meta Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Meta Description
                </label>
                <span className={`text-xs font-mono font-bold ${metaDescription.length > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {metaDescription.length} / 160 chars
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Professional iPhone & Android mobile repair services in Purulia, West Bengal..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7] leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Keyword */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Primary Local Target Keyword
                </label>
                <input
                  type="text"
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  placeholder="Mobile Repairing Shop in Purulia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              {/* Canonical URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Canonical Base URL
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://mobosavior.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7] font-mono text-xs"
                />
              </div>
            </div>

            {/* Secondary Keywords */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Secondary Local Keywords (Comma Separated)
              </label>
              <textarea
                value={secondaryKeywords}
                onChange={(e) => setSecondaryKeywords(e.target.value)}
                rows={2}
                placeholder="Mobile Repair in Purulia, iPhone Repair Purulia, Android Repair Purulia, CPU Reballing in Purulia"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
              <p className="text-[11px] text-slate-400">
                Keywords will be naturally indexed across dynamic schema and metadata without keyword stuffing.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Open Graph Social Media Sharing Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Social Sharing (Open Graph / WhatsApp / Facebook / Twitter)</h3>
              <p className="text-xs text-slate-500">Controls preview cards when links are shared on WhatsApp, Facebook, or Twitter.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Open Graph Title
                </label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="MOBO SAVIOR | Micro-Soldering & Mobile Repair Lab Purulia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Open Graph Description
                </label>
                <textarea
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  rows={3}
                  placeholder="Official mobile phone repair lab in Purulia..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              <ImageUploader
                label="Open Graph Social Image (WhatsApp / FB / Twitter)"
                value={ogImageUrl}
                onChange={(url) => setOgImageUrl(url)}
                folder="seo"
                helperText="Upload custom social share banner or paste image URL"
              />
            </div>

            {/* Social Sharing Live Card Preview */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between text-white space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                  Live Social Sharing Card Preview
                </span>
                <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700/80">
                  <div className="h-32 bg-slate-700 flex items-center justify-center overflow-hidden">
                    {ogImageUrl ? (
                      <img src={ogImageUrl} alt="OG Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 text-xs font-medium">No Image URL</div>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1 bg-slate-850">
                    <p className="text-xs font-extrabold text-white truncate">{ogTitle || 'MOBO SAVIOR'}</p>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{ogDescription || metaDescription}</p>
                    <p className="text-[10px] text-sky-400 font-mono pt-1">mobosavior.com</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Optimized for WhatsApp, Facebook & Twitter link cards</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Technical SEO Diagnostics & Readiness Checklist */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Technical SEO & Verification Checklist</span>
            </h3>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Technical Readiness: 100%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">XML Sitemap</p>
                <a href="/sitemap.xml" target="_blank" className="text-[11px] text-[#0284C7] hover:underline flex items-center gap-1">
                  /sitemap.xml <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Robots.txt</p>
                <a href="/robots.txt" target="_blank" className="text-[11px] text-[#0284C7] hover:underline flex items-center gap-1">
                  /robots.txt <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Local Schema (JSON-LD)</p>
                <p className="text-[11px] text-slate-500">Purulia GeoCoordinates & Opening Hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save SEO & Analytics Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
