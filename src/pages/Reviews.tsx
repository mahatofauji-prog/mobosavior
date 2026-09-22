import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Review, GoogleReviewsSettings } from '../types';
import { 
  Star, MessageSquarePlus, Calendar, ShieldCheck, Filter, 
  Sparkles, ExternalLink, MessageSquareHeart, CheckCircle2, User, Loader2
} from 'lucide-react';
import SubmitReviewModal from '../components/SubmitReviewModal';

export default function Reviews() {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'google' | '5star'>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [googleReviewUrl, setGoogleReviewUrl] = useState('https://maps.app.goo.gl/tU41BvTCk3dRAn6r9');

  const fetchReviewsData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Google settings if custom review URL is configured
      const { data: setData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'googleReviews')
        .maybeSingle();

      if (setData) {
        const raw = setData.data || setData.value || setData;
        if (raw.googleReviewUrl) {
          setGoogleReviewUrl(raw.googleReviewUrl);
        }
      }

      // 2. Fetch approved customer reviews from Supabase
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase Reviews fetch error]:', error);
      } else if (data) {
        // Filter strictly for approved reviews
        const approvedOnly = (data as any[]).filter((r) => {
          const comment = r.comment || '';
          if (comment.includes('status:rejected') || comment.includes('status:pending')) {
            return false;
          }
          if (r.status === 'rejected' || r.status === 'pending') {
            return false;
          }
          return r.active === true || r.is_active === true;
        });

        const mapped: Review[] = approvedOnly.map((d) => ({
          id: d.id,
          customerName: d.customer_name || d.customerName || d.reviewer_name || d.reviewerName || 'Valued Customer',
          reviewerName: d.reviewer_name || d.reviewerName || d.customer_name || d.customerName,
          rating: Number(d.rating) || 5,
          reviewText: d.review_text || d.reviewText || '',
          customerPhotoUrl: d.customer_photo_url || d.customerPhotoUrl || undefined,
          source: (d.source as any) || 'website',
          status: 'approved',
          active: true,
          is_active: true,
          is_verified: !!d.is_verified,
          service_availed: d.service_availed,
          device_model: d.device_model,
          booking_id: d.service_availed,
          phone: d.device_model,
          createdAt: d.created_at || d.createdAt || new Date().toISOString()
        }));

        setReviewsList(mapped);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  // Helper: Extract Initials for clean avatar when no photo exists
  const getInitials = (name: string) => {
    if (!name) return 'MS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Filter logic
  const filteredReviews = reviewsList.filter((r) => {
    if (selectedFilter === 'verified') return r.is_verified || !!r.booking_id;
    if (selectedFilter === 'google') return r.source === 'google';
    if (selectedFilter === '5star') return r.rating === 5;
    return true;
  });

  // Calculate statistics from real Supabase reviews
  const totalCount = reviewsList.length;
  const avgRating = totalCount > 0
    ? (reviewsList.reduce((sum, r) => sum + (r.rating || 5), 0) / totalCount).toFixed(1)
    : '5.0';
  const fiveStarCount = reviewsList.filter(r => r.rating === 5).length;
  const verifiedCount = reviewsList.filter(r => r.is_verified || !!r.booking_id).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 text-left">
      
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0369A1] text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-slate-800 relative overflow-hidden">
        <div className="space-y-3 max-w-xl z-10">
          <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            Authentic Customer Voices
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
            What Purulia Tech Owners Say
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            Real experiences shared by customers of MOBO SAVIOR. Genuine feedback from clients who got their motherboards, screens, and devices repaired with Saddam Bhai.
          </p>
        </div>

        {/* Action Buttons & Rating Box */}
        <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full md:w-auto">
          {totalCount > 0 && (
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15 flex items-center gap-4 text-center sm:text-left w-full sm:w-auto justify-center">
              <div className="text-3xl font-black text-amber-400">{avgRating}</div>
              <div>
                <div className="flex items-center gap-0.5 justify-center sm:justify-start">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-[11px] text-slate-300 font-bold mt-0.5">
                  {totalCount} Real Customer {totalCount === 1 ? 'Review' : 'Reviews'}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white text-xs font-black rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4 text-white" />
            <span>SHARE YOUR EXPERIENCE</span>
          </button>
        </div>

        {/* Decorative Background Blob */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Reviews ({totalCount})
          </button>

          <button
            onClick={() => setSelectedFilter('verified')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'verified'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Customer ({verifiedCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('5star')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === '5star'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>5 Stars ({fiveStarCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('google')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'google'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
            }`}
          >
            <span>Google Reviews</span>
          </button>
        </div>

        {/* Google Maps External Action */}
        <a
          href={googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:text-[#0369A1] transition-colors"
        >
          <span>View on Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 h-60 animate-pulse" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
            <MessageSquareHeart className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {reviewsList.length === 0 
                ? 'Be the first to share your experience with MOBO SAVIOR.'
                : 'No reviews found in this filter category.'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {reviewsList.length === 0
                ? 'Had a smartphone, iPhone, or motherboard repaired at MOBO SAVIOR? Submit your honest review to help others in Purulia.'
                : 'Try switching your filter or be the first to submit a review in this category.'}
            </p>
          </div>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-6 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-2xl shadow-lg shadow-sky-600/20 inline-flex items-center gap-2 transition-all"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Share Your Experience</span>
          </button>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => {
            const isGoogle = rev.source === 'google';
            const isVerified = rev.is_verified || !!rev.booking_id;
            const formattedDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : '';

            return (
              <div
                key={rev.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col justify-between space-y-5 relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Header: Photo, Name, Rating & Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {rev.customerPhotoUrl ? (
                        <img
                          src={rev.customerPhotoUrl}
                          alt={rev.customerName || 'Customer'}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                          {getInitials(rev.customerName || 'Customer')}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">
                          {rev.customerName}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Source / Verified Badge */}
                    {isGoogle ? (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 shadow-xs shrink-0 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        Google Review
                      </span>
                    ) : isVerified ? (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-xs shrink-0 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Customer Review
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-200 shadow-xs shrink-0">
                        Website Review
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    "{rev.reviewText}"
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Authentic Feedback
                  </span>
                  <span>{formattedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Review Submission Modal */}
      <SubmitReviewModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        googleReviewUrl={googleReviewUrl}
        onReviewSubmitted={() => {
          fetchReviewsData();
        }}
      />
    </div>
  );
}
