import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { sanitizePayload } from '../../lib/dbSanitizer';
import { uploadMediaFile, compressImageToDataUrl, validateImageFile } from '../../lib/storageUpload';
import { Review, GoogleReviewsSettings } from '../../types';
import { 
  Plus, Edit, Trash2, Star, CheckCircle, AlertTriangle, ShieldCheck, 
  Settings, Save, Loader2, X, MessageSquareQuote, Check, Ban, Eye, 
  Search, ExternalLink, RefreshCw, User, Phone, Tag, Calendar, Sparkles
} from 'lucide-react';

export default function AdminReviewsManager() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'google' | 'all' | 'settings'>('pending');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Google Reviews Settings State
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [enableGoogleReviews, setEnableGoogleReviews] = useState(false);
  const [googleReviewUrl, setGoogleReviewUrl] = useState('https://maps.app.goo.gl/tU41BvTCk3dRAn6r9');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Edit / Add Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Review | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [source, setSource] = useState<'website' | 'google'>('website');
  const [isVerified, setIsVerified] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Photo Upload in Modal
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Delete Confirmation Modal
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Review | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Photo Zoom Modal
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      // 1. Fetch Reviews from Supabase
      const { data: revData, error: revErr } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (revErr) {
        console.error('[Supabase Reviews fetch error]:', revErr);
      } else if (revData) {
        const mapped: Review[] = (revData as any[]).map((d) => {
          const comment = d.comment || '';
          let derivedStatus: 'pending' | 'approved' | 'rejected' = 'approved';

          if (comment.includes('status:pending') || d.status === 'pending') {
            derivedStatus = 'pending';
          } else if (comment.includes('status:rejected') || d.status === 'rejected') {
            derivedStatus = 'rejected';
          } else if (d.active === false || d.is_active === false) {
            derivedStatus = 'pending';
          } else {
            derivedStatus = 'approved';
          }

          return {
            id: d.id,
            customerName: d.customer_name || d.customerName || d.reviewer_name || d.reviewerName || 'Valued Customer',
            reviewerName: d.reviewer_name || d.reviewerName || d.customer_name || d.customerName,
            rating: Number(d.rating) || 5,
            reviewText: d.review_text || d.reviewText || '',
            customerPhotoUrl: d.customer_photo_url || d.customerPhotoUrl || undefined,
            source: (d.source as any) || 'website',
            status: derivedStatus,
            active: derivedStatus === 'approved',
            is_active: derivedStatus === 'approved',
            is_verified: !!d.is_verified,
            service_availed: d.service_availed,
            device_model: d.device_model,
            booking_id: d.service_availed,
            phone: d.device_model,
            createdAt: d.created_at || d.createdAt || new Date().toISOString()
          };
        });

        setReviews(mapped);
      }

      // 2. Fetch Google Settings from Supabase settings table
      const { data: setData, error: setErr } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'googleReviews')
        .maybeSingle();

      if (!setErr && setData) {
        const raw = setData.data || setData.value || setData;
        setGooglePlaceId(raw.googlePlaceId || '');
        setGoogleApiKey(raw.googleApiKey || '');
        setEnableGoogleReviews(!!raw.enableGoogleReviews);
        if (raw.googleReviewUrl) {
          setGoogleReviewUrl(raw.googleReviewUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching admin reviews data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Quick Action: Approve Review
  const handleApprove = async (review: Review) => {
    try {
      setActionLoadingId(review.id);
      const { error } = await supabase
        .from('reviews')
        .update({
          active: true,
          is_active: true,
          comment: 'status:approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', review.id);

      if (error) throw error;

      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? { ...r, status: 'approved', active: true, is_active: true }
            : r
        )
      );
    } catch (err: any) {
      console.error('Failed to approve review:', err);
      alert('Error approving review: ' + (err?.message || 'Database error'));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Action: Reject Review
  const handleReject = async (review: Review) => {
    try {
      setActionLoadingId(review.id);
      const { error } = await supabase
        .from('reviews')
        .update({
          active: false,
          is_active: false,
          comment: 'status:rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', review.id);

      if (error) throw error;

      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? { ...r, status: 'rejected', active: false, is_active: false }
            : r
        )
      );
    } catch (err: any) {
      console.error('Failed to reject review:', err);
      alert('Error rejecting review: ' + (err?.message || 'Database error'));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmItem) return;
    try {
      setDeleteLoading(true);
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', deleteConfirmItem.id);

      if (error) throw error;

      setReviews((prev) => prev.filter((r) => r.id !== deleteConfirmItem.id));
      setDeleteConfirmItem(null);
    } catch (err: any) {
      console.error('Failed to delete review:', err);
      alert('Error deleting review: ' + (err?.message || 'Database error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Save Settings
  const handleSaveGoogleSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSuccess(false);

    try {
      const payload: GoogleReviewsSettings = {
        googlePlaceId: googlePlaceId.trim(),
        googleApiKey: googleApiKey.trim(),
        enableGoogleReviews,
        googleReviewUrl: googleReviewUrl.trim()
      };
      const { error } = await supabase.from('settings').upsert({
        id: 'googleReviews',
        data: payload,
        value: payload,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving Google Reviews settings:', err);
      alert('Failed to save settings: ' + (err?.message || 'Database error'));
    } finally {
      setSettingsSaving(false);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setCustomerName('');
    setRating(5);
    setReviewText('');
    setCustomerPhotoUrl('');
    setBookingId('');
    setPhone('');
    setStatus('approved');
    setSource('website');
    setIsVerified(true);
    setPhotoPreview(null);
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: Review) => {
    setEditingItem(item);
    setCustomerName(item.customerName || item.reviewerName || '');
    setRating(item.rating || 5);
    setReviewText(item.reviewText || '');
    setCustomerPhotoUrl(item.customerPhotoUrl || '');
    setBookingId(item.booking_id || item.service_availed || '');
    setPhone(item.phone || item.device_model || '');
    setStatus(item.status || (item.active ? 'approved' : 'pending'));
    setSource((item.source as any) || 'website');
    setIsVerified(!!item.is_verified);
    setPhotoPreview(item.customerPhotoUrl || null);
    setFormError(null);
    setModalOpen(true);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    const validation = validateImageFile(file, 10);
    if (!validation.valid) {
      setFormError(validation.error || 'Please upload a valid image file.');
      return;
    }

    try {
      const { dataUrl } = await compressImageToDataUrl(file, 800, 0.85);
      setPhotoPreview(dataUrl);
    } catch {
      setFormError('Failed to process image.');
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = customerName.trim();
    const cleanReview = reviewText.trim();
    const cleanBookingId = bookingId.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setFormError('Customer name is required.');
      return;
    }
    if (!cleanReview) {
      setFormError('Review text is required.');
      return;
    }

    setFormLoading(true);

    try {
      const revId = editingItem ? editingItem.id : `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const isActive = status === 'approved';
      const commentStatus = `status:${status}`;
      const timestamp = editingItem?.createdAt || new Date().toISOString();

      const payload = {
        id: revId,
        customer_name: cleanName,
        reviewer_name: cleanName,
        rating: Number(rating) || 5,
        review_text: cleanReview,
        customer_photo_url: photoPreview || customerPhotoUrl || null,
        source: source,
        active: isActive,
        is_active: isActive,
        comment: commentStatus,
        is_verified: isVerified || Boolean(cleanBookingId || cleanPhone),
        service_availed: cleanBookingId || null,
        device_model: cleanPhone || null,
        featured: true,
        display_order: 0,
        created_at: timestamp,
        updated_at: new Date().toISOString()
      };

      const cleanPayload = sanitizePayload('reviews', payload);
      const { error } = await supabase.from('reviews').upsert(cleanPayload);
      if (error) throw error;

      await fetchData();
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving review:', err);
      setFormError(err.message || 'Failed to save review.');
    } finally {
      setFormLoading(false);
    }
  };

  // Helper for initials
  const getInitials = (name: string) => {
    if (!name) return 'MS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Filter reviews by tab & search term
  const filteredReviews = reviews.filter((r) => {
    // Search match
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (r.customerName || '').toLowerCase().includes(term);
      const matchText = (r.reviewText || '').toLowerCase().includes(term);
      const matchBooking = (r.booking_id || r.service_availed || '').toLowerCase().includes(term);
      const matchPhone = (r.phone || r.device_model || '').toLowerCase().includes(term);
      if (!matchName && !matchText && !matchBooking && !matchPhone) return false;
    }

    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'approved') return r.status === 'approved';
    if (activeTab === 'rejected') return r.status === 'rejected';
    if (activeTab === 'google') return r.source === 'google';
    return true;
  });

  // Tab Counts
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;
  const googleCount = reviews.filter((r) => r.source === 'google').length;
  const totalCount = reviews.length;

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquareQuote className="w-6 h-6 text-[#0284C7]" />
            <span>Customer Reviews</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Moderate customer-submitted reviews, manage approval states, and configure Google Reviews integration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'approved'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Approved</span>
            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'rejected'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Rejected</span>
            {rejectedCount > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                {rejectedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'google'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Google Reviews</span>
            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
              {googleCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>All ({totalCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-[#0284C7] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Google Settings</span>
          </button>
        </div>

        {/* Search Bar */}
        {activeTab !== 'settings' && (
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, text, phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            />
          </div>
        )}
      </div>

      {/* TAB CONTENT: GOOGLE SETTINGS */}
      {activeTab === 'settings' ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#0284C7]" />
              <span>Google Business Profile & Reviews Settings</span>
            </h3>
            <p className="text-xs text-slate-500">
              Configure your Google Maps review URL so customers can easily copy and share their reviews on your Google Business listing.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Google Reviews settings saved successfully to Supabase!</span>
            </div>
          )}

          <form onSubmit={handleSaveGoogleSettings} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Official Google Maps / Review Destination URL
              </label>
              <input
                type="url"
                required
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/tU41BvTCk3dRAn6r9"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
              <p className="text-[11px] text-slate-400">
                This link opens when customers click "Share Review on Google" after submitting their feedback.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Google Place ID <span className="text-slate-400 font-normal">(Optional for API Sync)</span>
              </label>
              <input
                type="text"
                value={googlePlaceId}
                onChange={(e) => setGooglePlaceId(e.target.value)}
                placeholder="e.g. ChIJ... (Google Maps Place ID)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Google API Key <span className="text-slate-400 font-normal">(Optional Places API Key)</span>
              </label>
              <input
                type="password"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={settingsSaving}
                className="px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Google Settings</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* REVIEWS LIST VIEW */
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-36 animate-pulse" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <MessageSquareQuote className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-800">
                  No {activeTab !== 'all' ? activeTab : ''} reviews found
                </h4>
                <p className="text-xs text-slate-500">
                  {searchTerm ? 'No reviews matched your search criteria.' : 'Reviews submitted by customers will appear here for moderation.'}
                </p>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((item) => {
                const isPending = item.status === 'pending';
                const isApproved = item.status === 'approved';
                const isRejected = item.status === 'rejected';
                const isGoogle = item.source === 'google';
                const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '';

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs ${
                      isPending
                        ? 'border-amber-200 bg-amber-50/20'
                        : isApproved
                        ? 'border-slate-200 hover:border-blue-100'
                        : 'border-rose-200/80 bg-rose-50/10 opacity-75'
                    }`}
                  >
                    {/* Left: Customer Photo & Details */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Photo Thumbnail */}
                      {item.customerPhotoUrl ? (
                        <div 
                          className="relative group cursor-pointer shrink-0"
                          onClick={() => setZoomedPhoto(item.customerPhotoUrl!)}
                          title="Click to view full photo"
                        >
                          <img
                            src={item.customerPhotoUrl}
                            alt={item.customerName || 'Customer'}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                          {getInitials(item.customerName || 'Customer')}
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">
                            {item.customerName}
                          </h4>

                          {/* Star Rating */}
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < item.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Status Badge */}
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Pending Moderation
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Approved & Live
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <Ban className="w-3 h-3 text-rose-600" />
                              Rejected
                            </span>
                          )}

                          {/* Source Badge */}
                          {isGoogle ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                              Google Review
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              Website
                            </span>
                          )}

                          {/* Verified Badge */}
                          {item.is_verified && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified Customer
                            </span>
                          )}
                        </div>

                        {/* Review Content */}
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          "{item.reviewText}"
                        </p>

                        {/* Meta Tags: Booking ID, Phone, Timestamp */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium pt-1">
                          {(item.booking_id || item.service_availed) && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                              <Tag className="w-3 h-3 text-slate-500" />
                              Booking: {item.booking_id || item.service_availed}
                            </span>
                          )}

                          {(item.phone || item.device_model) && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                              <Phone className="w-3 h-3 text-slate-500" />
                              Phone: {item.phone || item.device_model}
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                      {/* Approve button */}
                      {item.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={actionLoadingId === item.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                          title="Approve and publish to website"
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve</span>
                        </button>
                      )}

                      {/* Reject button */}
                      {item.status !== 'rejected' && (
                        <button
                          onClick={() => handleReject(item)}
                          disabled={actionLoadingId === item.id}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
                          title="Reject review"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      {/* Edit button */}
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Edit review"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => setDeleteConfirmItem(item)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete review permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT REVIEW MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-[#0284C7] text-white flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight font-sans">
                {editingItem ? 'Edit Customer Review' : 'Add New Customer Review'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto space-y-4 text-left">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Subhasish Roy"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              {/* Rating */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Rating (1-5 Stars) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {rating} Star{rating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Review Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Customer feedback and repair experience..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              {/* Customer Photo Upload / Preview */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Customer Photo
                </label>
                {photoPreview ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-blue-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Photo Attached</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setCustomerPhotoUrl('');
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-[#0284C7] bg-slate-50 rounded-xl p-3 text-center cursor-pointer text-xs font-bold text-slate-600"
                  >
                    Click to upload customer photo (JPG, PNG, WEBP)
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Status & Source Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="approved">Approved (Live on Website)</option>
                    <option value="pending">Pending Moderation</option>
                    <option value="rejected">Rejected (Hidden)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="website">Website Customer</option>
                    <option value="google">Google Review</option>
                  </select>
                </div>
              </div>

              {/* Booking ID & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Booking / Job ID</label>
                  <input
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="e.g. BK-2026-9812"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Customer Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 081675 49092"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Verified Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalIsVerified"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded text-[#0284C7] focus:ring-[#0284C7]"
                />
                <label htmlFor="modalIsVerified" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Display "Verified Customer Review" badge
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl text-left border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Delete Review Permanently?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete the review by <strong>"{deleteConfirmItem.customerName}"</strong>? This will remove the review record permanently from Supabase.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO ZOOM MODAL */}
      {zoomedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomedPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] p-2 bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img 
              src={zoomedPhoto} 
              alt="Zoomed customer photo" 
              className="max-h-[75vh] w-auto rounded-2xl object-contain mx-auto" 
            />
            <button
              onClick={() => setZoomedPhoto(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
