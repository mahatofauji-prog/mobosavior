import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit } from '../lib/supabase';
import { db } from '../lib/supabase';
import { Review, GoogleReviewsSettings } from '../types';
import { Star, MessageSquareQuote, ArrowRight, ShieldCheck } from 'lucide-react';
import { DEFAULT_REVIEWS } from '../lib/seed';

interface HomeReviewsSectionProps {
  onNavigate: (route: string) => void;
}

export default function HomeReviewsSection({ onNavigate }: HomeReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    async function fetchHomeReviews() {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('featured', '==', true),
          limit(6)
        );
        const snapshot = await getDocs(q);
        const fetched: Review[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<Review, 'id'>;
          if (data.active !== false) {
            fetched.push({ id: doc.id, ...data });
          }
        });

        if (fetched.length > 0) {
          setReviews(fetched);
        } else {
          // If no featured explicitly tagged, fetch active
          const activeQ = query(collection(db, 'reviews'), limit(6));
          const activeSnapshot = await getDocs(activeQ);
          const activeFetched: Review[] = [];
          activeSnapshot.forEach((doc) => {
            const data = doc.data() as Omit<Review, 'id'>;
            if (data.active !== false) {
              activeFetched.push({ id: doc.id, ...data });
            }
          });
          setReviews(activeFetched.length > 0 ? activeFetched : DEFAULT_REVIEWS);
        }
      } catch (err) {
        console.warn('Home reviews offline fallback:', err);
        setReviews(DEFAULT_REVIEWS);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeReviews();
  }, []);

  const isAnimationPaused = selectedReviewId !== null || isHoverPaused;

  return (
    <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-200/80 relative overflow-hidden">
      {/* Dynamic Keyframes Injection */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.3333%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-8">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              VERIFIED CLIENT FEEDBACK
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
              What Purulia Tech Owners Say
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Real reviews and testimonials from local clients who saved their dead motherboards, cracked OLED screens, and water-damaged iPhones with Saddam Bhai.
            </p>
          </div>

          <button
            onClick={() => onNavigate('reviews')}
            className="px-6 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center gap-2 self-start md:self-auto group"
          >
            <span>VIEW ALL CUSTOMER REVIEWS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Reviews Carousel or Fallback */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white animate-pulse rounded-[24px] h-48 border border-slate-150" />
            ))}
          </div>
        ) : prefersReducedMotion ? (
          /* Accessibility fallback when motion reduction is turned on */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((rev) => {
              const name = rev.customerName || rev.reviewerName || 'Satisfied Customer';
              const photo = rev.customerPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284C7&color=fff`;
              const isGoogle = rev.source === 'google';

              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-[24px] border border-blue-50 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={photo}
                          alt={name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{name}</h4>
                          <div className="flex items-center gap-1">
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
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">Verified</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"{rev.reviewText}"</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1 text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Verified Service Result
                    </span>
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Infinite Marquee Loop for general visitors */
          <div 
            className="relative w-full overflow-hidden py-4 select-none"
            onMouseEnter={() => setIsHoverPaused(true)}
            onMouseLeave={() => setIsHoverPaused(false)}
            onTouchStart={() => setIsHoverPaused(true)}
            onTouchEnd={() => setIsHoverPaused(false)}
            onClick={() => setSelectedReviewId(null)}
          >
            {/* Left and Right Blur Fade Edge Overlay */}
            <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-20 bg-gradient-to-r from-slate-50 via-slate-50/70 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-20 bg-gradient-to-l from-slate-50 via-slate-50/70 to-transparent z-10 pointer-events-none" />

            {/* Scrolling loop strip */}
            <div 
              className="flex gap-4 sm:gap-6 animate-marquee"
              style={{
                animationPlayState: isAnimationPaused ? 'paused' : 'running',
                width: 'max-content'
              }}
            >
              {/* Tripled list ensures uninterrupted overflow loops across any monitor resolution */}
              {[...reviews, ...reviews, ...reviews].map((rev, idx) => {
                const name = rev.customerName || rev.reviewerName || 'Satisfied Customer';
                const photo = rev.customerPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284C7&color=fff`;
                const isGoogle = rev.source === 'google';
                const isSelected = selectedReviewId === rev.id;

                return (
                  <div
                    key={`${rev.id}-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReviewId((prev) => (prev === rev.id ? null : rev.id));
                    }}
                    className={`w-[290px] xs:w-[330px] sm:w-[380px] flex-shrink-0 bg-white rounded-[24px] border p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      isSelected
                        ? 'border-2 border-[#0284C7] shadow-lg ring-4 ring-sky-100/80 bg-sky-50/5 scale-102 z-20'
                        : 'border-blue-50/80 hover:border-blue-100 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={photo}
                            alt={name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{name}</h4>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-150'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm ${
                            isGoogle
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}
                        >
                          {isGoogle ? 'Google Review' : 'Verified'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                        "{rev.reviewText}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1 text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Verified Service Result
                      </span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
