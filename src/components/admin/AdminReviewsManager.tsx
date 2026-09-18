import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc, query, orderBy } from '../../lib/supabase';
import { db } from '../../lib/supabase';
import { uploadMediaFile } from '../../lib/storageUpload';
import { Review, GoogleReviewsSettings } from '../../types';
import ImageUploader from './ImageUploader';
import { Plus, Edit, Trash2, Star, CheckCircle, AlertTriangle, ShieldCheck, Settings, Save, Loader2, X, MessageSquareQuote } from 'lucide-react';

export default function AdminReviewsManager() {
  const [activeTab, setActiveTab] = useState<'testimonials' | 'googleSettings'>('testimonials');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Google Reviews Settings State
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [enableGoogleReviews, setEnableGoogleReviews] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Testimonial Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Review | null>(null);

  // Testimonial Form State
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [featured, setFeatured] = useState(true);
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      // 1. Fetch Testimonials
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items: Review[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as Review));
      setReviews(items);

      // 2. Fetch Google Settings
      const setSnap = await getDoc(doc(db, 'settings', 'googleReviews'));
      if (setSnap.exists()) {
        const data = setSnap.data() as GoogleReviewsSettings;
        setGooglePlaceId(data.googlePlaceId || '');
        setGoogleApiKey(data.googleApiKey || '');
        setEnableGoogleReviews(!!data.enableGoogleReviews);
      }
    } catch (err) {
      console.error('Error fetching admin reviews data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveGoogleSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSuccess(false);

    try {
      const payload: GoogleReviewsSettings = {
        googlePlaceId: googlePlaceId.trim(),
        googleApiKey: googleApiKey.trim(),
        enableGoogleReviews
      };
      await setDoc(doc(db, 'settings', 'googleReviews'), payload);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving Google Reviews settings:', err);
      alert('Failed to save Google Reviews settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setCustomerName('');
    setRating(5);
    setReviewText('');
    setCustomerPhotoUrl('');
    setPhotoFile(null);
    setFeatured(true);
    setActive(true);
    setDisplayOrder(reviews.length + 1);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: Review) => {
    setEditingItem(item);
    setCustomerName(item.customerName || item.reviewerName || '');
    setRating(item.rating || 5);
    setReviewText(item.reviewText || '');
    setCustomerPhotoUrl(item.customerPhotoUrl || '');
    setPhotoFile(null);
    setFeatured(!!item.featured);
    setActive(item.active !== false);
    setDisplayOrder(item.displayOrder || 1);
    setModalOpen(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let finalPhotoUrl = customerPhotoUrl;

      // Upload customer photo file if selected
      if (photoFile) {
        const res = await uploadMediaFile(photoFile, { folder: 'reviews' });
        if (!res.success || !res.url) {
          throw new Error(res.error || 'Failed to upload photo');
        }
        finalPhotoUrl = res.url;
      }

      const revId = editingItem ? editingItem.id : `rev-${Date.now()}`;
      const payload: Review = {
        id: revId,
        customerName: customerName.trim(),
        reviewerName: customerName.trim(),
        rating,
        reviewText: reviewText.trim(),
        customerPhotoUrl: finalPhotoUrl || undefined,
        source: 'testimonial',
        featured,
        active,
        displayOrder,
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'reviews', revId), payload);
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Error saving testimonial:', err);
      alert('Failed to save testimonial.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      await fetchData();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const handleToggleActive = async (item: Review) => {
    try {
      await updateDoc(doc(db, 'reviews', item.id), { active: !item.active });
      await fetchData();
    } catch (err) {
      console.error('Error toggling active review status:', err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Bar with Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-200/80">
        <div>
          <h3 className="text-xl font-black text-slate-900 font-sans flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-[#0284C7]" />
            Customer Reviews & Testimonials
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage admin-curated testimonials and configure live Google Reviews API integration.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all ${
              activeTab === 'testimonials'
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Manage Testimonials
          </button>
          <button
            onClick={() => setActiveTab('googleSettings')}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'googleSettings'
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Google Reviews Settings
          </button>
        </div>
      </div>

      {activeTab === 'googleSettings' ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <h4 className="font-extrabold text-slate-900 text-base">Google Reviews API Integration</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Configure live Google Place Reviews. If enabled, live reviews from your Google Business Profile will be automatically fetched. If disabled or unconfigured, the website gracefully presents your admin testimonials!
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Google Reviews configuration saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveGoogleSettings} className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="font-extrabold text-slate-800 block text-xs">Enable Live Google Reviews</span>
                <span className="text-[11px] text-slate-500 font-medium">Automatically pull real Google reviews</span>
              </div>
              <input
                type="checkbox"
                checked={enableGoogleReviews}
                onChange={(e) => setEnableGoogleReviews(e.target.checked)}
                className="w-5 h-5 text-[#0284C7] rounded focus:ring-[#0284C7] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Google Place ID
              </label>
              <input
                type="text"
                value={googlePlaceId}
                onChange={(e) => setGooglePlaceId(e.target.value)}
                placeholder="e.g. ChIJN1t_tDeX4TkR..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#0284C7] outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Find your Google Place ID using Google Maps Place ID Finder.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Google Places API Key
              </label>
              <input
                type="password"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                placeholder="e.g. AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#0284C7] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={settingsSaving}
              className="px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Google Reviews Settings</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">
              Showing {reviews.length} admin-managed testimonials
            </p>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Testimonial</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-100 animate-pulse rounded-3xl h-28 border border-slate-200" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => {
                const name = rev.customerName || rev.reviewerName || 'Customer';
                const photo = rev.customerPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284C7&color=fff`;

                return (
                  <div
                    key={rev.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between hover:border-sky-300 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={photo}
                            alt={name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">{name}</h4>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-md uppercase">
                          {rev.source || 'Testimonial'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3 font-medium">
                        "{rev.reviewText}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleActive(rev)}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase transition-all border ${
                          rev.active !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {rev.active !== false ? 'Active' : 'Hidden'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(rev)}
                          className="p-1.5 text-slate-500 hover:text-[#0284C7] bg-slate-50 hover:bg-sky-50 rounded-lg border border-slate-200"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg border border-slate-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-10 rounded-3xl text-center space-y-2">
              <MessageSquareQuote className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-extrabold text-slate-800 text-xs">No testimonials added yet</h4>
              <p className="text-[11px] text-slate-500">Click "Add Testimonial" to add customer feedback.</p>
            </div>
          )}
        </div>
      )}

      {/* Testimonial Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 text-xs text-slate-700 relative shadow-2xl border border-slate-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">
                {editingItem ? 'Edit Testimonial' : 'Add New Customer Testimonial'}
              </h3>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sourav Sen"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <ImageUploader
                label="Customer Photo / Avatar"
                value={customerPhotoUrl}
                onChange={(url) => setCustomerPhotoUrl(url)}
                folder="reviews"
                helperText="Upload customer photo from device gallery or paste URL"
              />

              <div>
                <label className="block text-slate-700 font-bold mb-1">Rating (1 to 5 Stars) *</label>
                <div className="flex gap-1 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Review Text *</label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write the customer's repair testimonial..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl leading-relaxed font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Active Visibility</label>
                  <select
                    value={String(active)}
                    onChange={(e) => setActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="true">Active / Published</option>
                    <option value="false">Hidden / Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Featured</label>
                  <select
                    value={String(featured)}
                    onChange={(e) => setFeatured(e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="true">Yes (Showcase)</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Save Testimonial'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
