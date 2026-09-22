import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { WebsiteSection } from '../../types';
import { DEFAULT_WEBSITE_SECTIONS } from '../../data/defaultSections';
import { getAllSectionsMerged } from '../../utils/sectionSettings';
import { 
  Eye, EyeOff, Save, RefreshCw, Search, Filter, Layers, CheckCircle2, 
  AlertCircle, ArrowUp, ArrowDown, Sparkles, Loader2, ExternalLink, HelpCircle, ShieldAlert
} from 'lucide-react';

interface AdminSectionsProps {
  onRefreshData?: () => void;
  onNavigate?: (route: string) => void;
}

const PAGE_LABELS: Record<string, { title: string; badgeColor: string; description: string }> = {
  home: { title: 'Home Page', badgeColor: 'bg-sky-100 text-[#0284C7]', description: 'Hero banner, featured services, trust section, reviews, offers, gallery, contact' },
  services: { title: 'Services Catalog Page', badgeColor: 'bg-purple-100 text-purple-700', description: 'Categories grid, brand services, pricing matrices, booking CTAs' },
  service_detail: { title: 'Individual Service Detail Pages', badgeColor: 'bg-emerald-100 text-emerald-700', description: 'Hero, symptoms, diagnosis, tools, brand/model prices, warranty, videos, FAQs' },
  gallery: { title: 'Repair Gallery Page', badgeColor: 'bg-amber-100 text-amber-800', description: 'Workmanship photos, before/after sliders, motherboard & display albums' },
  reviews: { title: 'Customer Reviews Page', badgeColor: 'bg-blue-100 text-blue-800', description: 'Google rating summary, verified customer testimonials, review CTAs' },
  offers: { title: 'Offers & Discounts Page', badgeColor: 'bg-pink-100 text-pink-700', description: 'Festival deals, discount banners, active & upcoming repair offers' },
  about: { title: 'About Lab Page', badgeColor: 'bg-indigo-100 text-indigo-700', description: 'Technician story, lab equipment, why choose us, trust guarantees' },
  contact: { title: 'Contact & Location Page', badgeColor: 'bg-slate-100 text-slate-800', description: 'Phone cards, WhatsApp CTAs, Google Maps embed, operating hours, form' },
  blog: { title: 'Repair Tips & Blog Page', badgeColor: 'bg-teal-100 text-teal-800', description: 'Repair guides, technical articles, category filters, featured posts' }
};

export default function AdminSections({ onRefreshData, onNavigate }: AdminSectionsProps) {
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  // Fetch sections from Supabase
  const fetchSections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('website_sections').select('*');
      if (error) {
        console.error('Error fetching website_sections:', error);
        setSections(DEFAULT_WEBSITE_SECTIONS);
      } else if (data && data.length > 0) {
        const merged = getAllSectionsMerged(data as WebsiteSection[]);
        setSections(merged);
      } else {
        setSections(DEFAULT_WEBSITE_SECTIONS);
      }
    } catch (err) {
      console.error('Error fetching website_sections:', err);
      setSections(DEFAULT_WEBSITE_SECTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Toggle Visibility for a single section
  const handleToggleVisibility = (id: string) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === id) {
        return { ...sec, isVisible: !sec.isVisible, updatedAt: new Date().toISOString() };
      }
      return sec;
    }));
  };

  // Change Display Order
  const handleOrderChange = (id: string, newOrder: number) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === id) {
        return { ...sec, displayOrder: Math.max(1, newOrder), updatedAt: new Date().toISOString() };
      }
      return sec;
    }));
  };

  // Move Up / Move Down within page
  const handleMoveOrder = (id: string, direction: 'up' | 'down') => {
    const secToMove = sections.find(s => s.id === id);
    if (!secToMove) return;

    const pageSections = sections
      .filter(s => s.page === secToMove.page)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const currentIndex = pageSections.findIndex(s => s.id === id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= pageSections.length) return;

    const targetSec = pageSections[targetIndex];
    const tempOrder = secToMove.displayOrder;

    setSections(prev => prev.map(s => {
      if (s.id === secToMove.id) return { ...s, displayOrder: targetSec.displayOrder };
      if (s.id === targetSec.id) return { ...s, displayOrder: tempOrder };
      return s;
    }));
  };

  // Show All Sections
  const handleShowAll = () => {
    setSections(prev => prev.map(sec => ({ ...sec, isVisible: true })));
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all section visibility to defaults (All Visible)?')) {
      setSections(DEFAULT_WEBSITE_SECTIONS);
    }
  };

  // Save changes to Supabase
  const handleSaveChanges = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const recordsToUpsert = sections.map(sec => ({
        id: sec.id,
        page: sec.page,
        sectionKey: sec.sectionKey,
        section_key: sec.sectionKey,
        sectionName: sec.sectionName,
        section_name: sec.sectionName,
        description: sec.description || '',
        isVisible: sec.isVisible,
        is_visible: sec.isVisible,
        displayOrder: sec.displayOrder || 1,
        display_order: sec.displayOrder || 1,
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('website_sections').upsert(recordsToUpsert);
      if (error) throw error;

      setSaveSuccess(true);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving section visibility settings:', err);
      alert('Failed to save section settings to database: ' + (err?.message || 'Database error'));
    } finally {
      setSaving(false);
    }
  };

  // Filter sections based on user search, page tab, and status
  const filteredSections = sections.filter(sec => {
    const matchesPage = selectedPage === 'all' || sec.page === selectedPage;
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'visible' ? sec.isVisible :
      !sec.isVisible;

    const matchesSearch = 
      sec.sectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.sectionKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sec.description && sec.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPage && matchesStatus && matchesSearch;
  });

  // Calculate Statistics
  const totalCount = sections.length;
  const visibleCount = sections.filter(s => s.isVisible).length;
  const hiddenCount = sections.filter(s => !s.isVisible).length;

  // Group filtered sections by page
  const pagesInFiltered: string[] = Array.from(new Set(filteredSections.map((s: WebsiteSection) => s.page)));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 border border-sky-400/30 text-sky-300 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>CMS Global Layout & Visibility Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Website Sections Visibility Control</h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
              Control which sections appear on the public MOBO SAVIOR website without touching code. Hide unused sections or reorder sections dynamically.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl shadow-lg hover:shadow-sky-500/20 transition-all flex items-center gap-2 focus:outline-none disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Visibility Settings'}</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              title="Reset all sections to visible default state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Website section visibility settings successfully updated and live on the public site!</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Total Managed Sections</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalCount}</div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider">Currently Public (Visible)</span>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{visibleCount}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase text-amber-600 tracking-wider">Currently Hidden</span>
            <div className="text-2xl font-black text-amber-700 mt-1 font-mono">{hiddenCount}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <EyeOff className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search section name, page or identifier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600">
                Clear
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Status:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('visible')}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                  statusFilter === 'visible' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Visible ({visibleCount})
              </button>
              <button
                onClick={() => setStatusFilter('hidden')}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                  statusFilter === 'hidden' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                Hidden ({hiddenCount})
              </button>
            </div>
          </div>
        </div>

        {/* Page Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          <button
            onClick={() => setSelectedPage('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedPage === 'all' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Pages
          </button>

          {Object.entries(PAGE_LABELS).map(([pageKey, labelObj]) => {
            const pageSecCount = sections.filter(s => s.page === pageKey).length;
            const pageHiddenCount = sections.filter(s => s.page === pageKey && !s.isVisible).length;

            return (
              <button
                key={pageKey}
                onClick={() => setSelectedPage(pageKey)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedPage === pageKey
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{labelObj.title}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  selectedPage === pageKey ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {pageSecCount}
                </span>
                {pageHiddenCount > 0 && (
                  <span className="w-2 h-2 bg-amber-500 rounded-full" title={`${pageHiddenCount} sections hidden on this page`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#0284C7] animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading website section visibility settings...</p>
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-800">No Matching Sections Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No sections match your search filter "{searchQuery}". Try clearing your filters or selecting a different page.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedPage('all'); setStatusFilter('all'); }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Section List Grouped by Page */
        <div className="space-y-8">
          {pagesInFiltered.map((pageKey: string) => {
            const pageConfig = PAGE_LABELS[pageKey] || {
              title: pageKey.toUpperCase(),
              badgeColor: 'bg-slate-100 text-slate-800',
              description: 'Section visibility settings'
            };

            const pageSections = filteredSections
              .filter(s => s.page === pageKey)
              .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

            return (
              <div key={pageKey} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Page Group Header */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{pageConfig.title}</h3>
                      <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${pageConfig.badgeColor}`}>
                        {pageKey}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{pageConfig.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate(pageKey === 'home' ? 'home' : pageKey)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                        title="View page in live website"
                      >
                        <ExternalLink className="w-3 h-3 text-sky-600" />
                        <span>Preview Page</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Cards */}
                <div className="divide-y divide-slate-100">
                  {pageSections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className={`p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        sec.isVisible ? 'bg-white' : 'bg-slate-50/60 opacity-80'
                      }`}
                    >
                      {/* Left: Info */}
                      <div className="space-y-1.5 flex-1 pr-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            {sec.sectionName}
                          </h4>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[9.5px] font-bold rounded-md">
                            {sec.id}
                          </span>
                          
                          {/* Status Badge */}
                          {sec.isVisible ? (
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                              🟢 Visible
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-black text-[10px] rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                              ⚪ Hidden (Publicly Suppressed)
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{sec.description}</p>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-between sm:justify-end">
                        {/* Display Order Controls */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-black uppercase text-slate-400 px-1.5">Order</span>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={sec.displayOrder || 1}
                            onChange={(e) => handleOrderChange(sec.id, parseInt(e.target.value) || 1)}
                            className="w-10 text-center py-1 bg-white border border-slate-200 text-xs font-mono font-bold rounded-lg focus:outline-none"
                          />
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleMoveOrder(sec.id, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 hover:bg-slate-200 text-slate-600 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(sec.id, 'down')}
                              disabled={idx === pageSections.length - 1}
                              className="p-0.5 hover:bg-slate-200 text-slate-600 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          onClick={() => handleToggleVisibility(sec.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm focus:outline-none ${
                            sec.isVisible
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          {sec.isVisible ? (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>Hide Section</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 text-amber-700" />
                              <span>Show Section</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Save Sticky Notice */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-4 border border-slate-800 z-20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <p className="text-xs text-slate-300 font-medium">
            Remember to click <strong className="text-white">Save Visibility Settings</strong> to persist your choices to the database and update the live website.
          </p>
        </div>

        <button
          onClick={handleSaveChanges}
          disabled={saving}
          className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings Now'}</span>
        </button>
      </div>
    </div>
  );
}
