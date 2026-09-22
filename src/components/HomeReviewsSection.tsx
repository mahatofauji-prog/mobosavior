import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Review } from '../types';
import { 
  Star, ArrowRight, ShieldCheck, MessageSquarePlus, ChevronLeft, 
  ChevronRight, Sparkles, MessageSquareHeart 
} from 'lucide-react';
import SubmitReviewModal from './SubmitReviewModal';

interface HomeReviewsSectionProps {
  onNavigate: (route: string) => void;
}

export default function HomeReviewsSection({ onNavigate }: HomeReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const fetchApprovedReviews = async () => {
    try {
      setLoading(true);
      // Fetch only approved reviews from Supabase
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase reviews query error:', error);
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

        setReviews(mapped);
      }
    } catch (err) {
      console.error('Error fetching approved reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedReviews();
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

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && reviews.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }
    if (isRightSwipe && reviews.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    }
  };

  const handleNext = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-200/80 relative overflow-hidden text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-8">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Verified Client Voice
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
              What Purulia Tech Owners Say
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Real experiences shared by customers of MOBO SAVIOR.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Primary Prominent "Share Your Experience" Button */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white text-xs font-black rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all group"
            >
              <MessageSquarePlus className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>SHARE YOUR EXPERIENCE</span>
            </button>

            {/* View All Reviews Link */}
            <button
              onClick={() => onNavigate('reviews')}
              className="px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-black rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center gap-2 group"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white animate-pulse rounded-3xl h-56 border border-slate-200" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Clean Empty State when 0 reviews exist */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
              <MessageSquareHeart className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Be the first to share your experience with MOBO SAVIOR.
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Had a motherboard, OLED display, or dead phone restored by Saddam Bhai? Share your honest feedback with fellow device owners in Purulia.
              </p>
            </div>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-6 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] active:scale-95 text-white text-xs font-black rounded-2xl shadow-lg shadow-sky-600/20 inline-flex items-center gap-2 transition-all"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Share Your Experience</span>
            </button>
          </div>
        ) : (
          /* Active Approved Customer Reviews Display */
          <div className="space-y-6">
            
            {/* Mobile Carousel (1 Card at a time) */}
            <div 
              className="md:hidden space-y-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {reviews[currentIndex] && (() => {
                const rev = reviews[currentIndex];
                const isGoogle = rev.source === 'google';
                const isVerified = rev.is_verified || !!rev.booking_id;
                const formattedDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : '';

                return (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-5 min-h-[240px]">
                    <div className="space-y-4">
                      {/* Customer Info & Badge */}
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

                        {/* Source / Verification Badge */}
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
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        "{rev.reviewText}"
                      </p>
                    </div>

                    {/* Footer Date & Status */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Authentic Feedback
                      </span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Mobile Carousel Controls & Dots */}
              <div className="flex items-center justify-between px-2 pt-1">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs transition-colors"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentIndex 
                          ? 'w-6 bg-[#0284C7]' 
                          : 'w-2 bg-slate-300'
                      }`}
                      aria-label={`Go to review ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs transition-colors"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop / Tablet Grid (Responsive 1 to 3 columns based on count) */}
            <div className={`hidden md:grid gap-6 ${
              reviews.length === 1 
                ? 'grid-cols-1 max-w-xl mx-auto' 
                : reviews.length === 2 
                ? 'grid-cols-2 max-w-4xl mx-auto' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {reviews.slice(0, 6).map((rev) => {
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
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Customer Info & Badge */}
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

                        {/* Source / Verification Badge */}
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

                    {/* Footer Date & Status */}
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

          </div>
        )}

      </div>

      {/* Customer Review Submission Modal */}
      <SubmitReviewModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onReviewSubmitted={() => {
          fetchApprovedReviews();
        }}
      />
    </section>
  );
}
