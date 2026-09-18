import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, query, orderBy } from '../lib/supabase';
import { db } from '../lib/supabase';
import { Review, GoogleReviewsSettings } from '../types';
import { Star, Send, Calendar, CheckCircle, AlertTriangle, ShieldCheck, Filter, Upload, Sparkles, MessageSquareQuote } from 'lucide-react';
import { DEFAULT_REVIEWS } from '../lib/seed';

export default function Reviews() {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [googleSettings, setGoogleSettings] = useState<GoogleReviewsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'google' | 'testimonial' | '5star'>('all');

  // Submit Form State
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Fetch reviews & Google settings
  useEffect(() => {
    async function initReviewsData() {
      try {
        setLoading(true);

        // 1. Fetch Google Reviews settings
        const settingsSnap = await getDoc(doc(db, 'settings', 'googleReviews'));
        let gSettings: GoogleReviewsSettings | null = null;
        if (settingsSnap.exists()) {
          gSettings = settingsSnap.data() as GoogleReviewsSettings;
          setGoogleSettings(gSettings);
        }

        // 2. Fetch Firestore Testimonials
        const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetched: Review[] = [];
        querySnapshot.forEach((d) => {
          fetched.push({ id: d.id, ...d.data() } as Review);
        });

        let combined: Review[] = fetched.length > 0 ? fetched : DEFAULT_REVIEWS;

        // 3. If Live Google Reviews configured & enabled, attempt live fetch
        if (gSettings?.enableGoogleReviews && gSettings?.googlePlaceId && gSettings?.googleApiKey) {
          try {
            const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${gSettings.googlePlaceId}&fields=reviews,rating,user_ratings_total&key=${gSettings.googleApiKey}`;
            const res = await fetch(googleUrl);
            const data = await res.json();

            if (data?.result?.reviews && Array.isArray(data.result.reviews)) {
              const liveGoogleReviews: Review[] = data.result.reviews.map((g: any, idx: number) => ({
                id: `google-${idx}-${g.time || Date.now()}`,
                customerName: g.author_name,
                reviewerName: g.author_name,
                rating: g.rating || 5,
                reviewText: g.text,
                customerPhotoUrl: g.profile_photo_url,
                source: 'google' as const,
                featured: true,
                active: true,
                createdAt: g.time ? new Date(g.time * 1000).toISOString() : new Date().toISOString()
              }));

              // Combine live Google reviews with local testimonials
              combined = [...liveGoogleReviews, ...combined];
            }
          } catch (gErr) {
            console.warn('Google Reviews live fetch skipped or failed:', gErr);
          }
        }

        setReviewsList(combined);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviewsList(DEFAULT_REVIEWS);
      } finally {
        setLoading(false);
      }
    }

    initReviewsData();
  }, [success]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    if (customerName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      setSubmitting(false);
      return;
    }
    if (reviewText.trim().length < 10) {
      setError('Please write at least 10 characters to share helpful feedback.');
      setSubmitting(false);
      return;
    }

    try {
      const payload: Omit<Review, 'id'> = {
        customerName: customerName.trim(),
        reviewerName: customerName.trim(),
        rating,
        reviewText: reviewText.trim(),
        customerPhotoUrl: customerPhotoUrl.trim() || undefined,
        source: 'testimonial',
        featured: false,
        active: true, // Visible immediately
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'reviews'), payload);
      setSuccess(true);
      setCustomerName('');
      setCustomerPhotoUrl('');
      setReviewText('');
      setRating(5);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to post review. Please check your internet connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeReviews = reviewsList.filter((r) => r.active !== false);

  const filteredReviews = activeReviews.filter((r) => {
    if (selectedFilter === 'google') return r.source === 'google';
    if (selectedFilter === 'testimonial') return r.source !== 'google';
    if (selectedFilter === '5star') return r.rating === 5;
    return true;
  });

  // Calculate statistics
  const totalCount = activeReviews.length;
  const avgRating = totalCount > 0
    ? (activeReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalCount).toFixed(1)
    : '5.0';
  const fiveStarCount = activeReviews.filter(r => r.rating === 5).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 text-left">
      
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0369A1] text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-slate-800 relative overflow-hidden">
        <div className="space-y-3 max-w-xl z-10">
          <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            CLIENT TRUST & REPUTATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
            Customer Reviews & Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Discover verified testimonials and Google reviews from mobile owners in Purulia who brought their dead phones and cracked displays to Saddam Bhai at MOBO SAVIOR.
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex items-center gap-6 z-10 min-w-[260px]">
          <div className="text-center space-y-1">
            <span className="text-4xl font-black text-amber-400 font-sans">{avgRating}</span>
            <div className="flex text-amber-400 justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
          </div>
          <div className="border-l border-white/20 pl-6 space-y-1">
            <p className="text-xs font-black text-white">{totalCount} Verified Reviews</p>
            <p className="text-[10px] text-sky-200">{fiveStarCount} 5-Star Ratings</p>
            <p className="text-[9px] text-slate-300 font-mono pt-1">Purulia Top Rated Lab</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Reviews List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Source Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80 pb-4">
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 items-center">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-white text-[#0284C7] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({activeReviews.length})
              </button>

              {googleSettings?.enableGoogleReviews && (
                <button
                  onClick={() => setSelectedFilter('google')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    selectedFilter === 'google'
                      ? 'bg-[#0284C7] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Google Reviews
                </button>
              )}

              <button
                onClick={() => setSelectedFilter('testimonial')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedFilter === 'testimonial'
                    ? 'bg-white text-[#0284C7] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Testimonials
              </button>

              <button
                onClick={() => setSelectedFilter('5star')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedFilter === '5star'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                5-Stars ★
              </button>
            </div>
          </div>

          {/* List Rendering */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-100 animate-pulse rounded-3xl h-36 border border-slate-200" />
              ))}
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((rev) => {
                const name = rev.customerName || rev.reviewerName || 'Satisfied Client';
                const photo = rev.customerPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284C7&color=fff`;
                const isGoogle = rev.source === 'google';

                return (
                  <div
                    key={rev.id}
                    className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={photo}
                          alt={name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{name}</h4>
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

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                            isGoogle
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isGoogle ? 'Google Review' : 'Customer Testimonial'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium italic pl-1 border-l-2 border-sky-200">
                      "{rev.reviewText}"
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1 text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Verified Lab Customer
                      </span>
                      <span className="text-[#0284C7]">MOBO SAVIOR Purulia</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-10 rounded-3xl text-center space-y-3">
              <MessageSquareQuote className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-extrabold text-slate-800 text-sm">No reviews in this filter</h4>
              <p className="text-xs text-slate-500">Try selecting "All" to view all customer feedback.</p>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Review Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-lg space-y-6 text-left sticky top-24 self-start">
          <div className="space-y-1.5 border-b border-slate-100 pb-4">
            <span className="text-[10px] font-black text-[#0284C7] uppercase tracking-wider">SHARE YOUR EXPERIENCE</span>
            <h3 className="text-xl font-black text-slate-900 font-sans">Submit Your Testimonial</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Did Saddam Bhai fix your display screen, battery, or motherboard issue? Submit your review to help other Purulia users.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-black block text-sm mb-0.5">Testimonial Published!</span>
                Your review is now live on our website. Thank you for supporting local Purulia tech craftsmanship!
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Sourav Sen"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Photo URL (Optional)
              </label>
              <input
                type="text"
                value={customerPhotoUrl}
                onChange={(e) => setCustomerPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Service Rating *
              </label>
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded hover:bg-slate-50 focus:outline-none transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 transition-all ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400 scale-110'
                          : 'text-slate-200 hover:text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-extrabold text-slate-500 ml-2">
                  ({rating}/5 Stars)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Review Message *
              </label>
              <textarea
                required
                rows={4}
                minLength={10}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Describe your device issue and how the repair was completed..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 outline-none transition-all leading-relaxed text-slate-800 font-medium"
              />
              <span className="block text-[10px] text-slate-400 text-right mt-1">Minimum 10 characters</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-400 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none"
            >
              {submitting ? 'Publishing Review...' : 'Submit Customer Testimonial'}
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
