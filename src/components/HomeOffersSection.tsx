import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Offer, ContactSettings } from '../types';
import { getOfferStatus } from '../utils/offerHelpers';
import { DEFAULT_OFFERS } from '../lib/seed';
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeOffersSectionProps {
  onNavigate: (route: string) => void;
  contact: ContactSettings;
  offers?: Offer[];
}

export default function HomeOffersSection({ onNavigate, contact, offers: propOffers }: HomeOffersSectionProps) {
  const [offers, setOffers] = useState<Offer[]>(propOffers || []);
  const [loading, setLoading] = useState(!propOffers || propOffers.length === 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1); // 1 = right/next, -1 = left/prev
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Fetch offers from Supabase
  useEffect(() => {
    if (propOffers && propOffers.length > 0) {
      setOffers(propOffers);
      setLoading(false);
      return;
    }

    async function fetchOffers() {
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .order('displayOrder', { ascending: true });

        if (error) {
          console.warn('[Supabase Offers fetch error]:', error);
          setOffers(DEFAULT_OFFERS);
        } else if (data && data.length > 0) {
          const mappedOffers: Offer[] = data.map((item: any) => ({
            id: item.id,
            title: item.title || '',
            description: item.description || '',
            categoryId: item.categoryId || item.category_id || '',
            category: item.category || 'Special Offers',
            discount: item.discount || item.discount_amount || '',
            imageUrl: item.imageUrl || item.image_url || '',
            destinationUrl: item.destinationUrl || item.destination_url || item.ctaValue || '',
            startDate: item.startDate || '',
            endDate: item.endDate || item.valid_until || '',
            terms: item.terms || '',
            ctaText: item.ctaText || 'Claim Offer',
            ctaType: item.ctaType || (item.destinationUrl || item.destination_url ? 'url' : 'whatsapp'),
            ctaValue: item.ctaValue || item.destinationUrl || item.destination_url || '',
            isFeatured: item.isFeatured !== undefined ? item.isFeatured : true,
            isActive: item.isActive !== undefined ? item.isActive : (item.is_active !== undefined ? item.is_active : true),
            displayOrder: item.displayOrder !== undefined ? item.displayOrder : (item.display_order || 1),
            createdAt: item.createdAt || item.created_at || '',
            updatedAt: item.updatedAt || item.updated_at || ''
          }));
          setOffers(mappedOffers);
        } else {
          setOffers(DEFAULT_OFFERS);
        }
      } catch (err) {
        console.warn('Home offers load error:', err);
        setOffers(DEFAULT_OFFERS);
      } finally {
        setLoading(false);
      }
    }

    fetchOffers();
  }, [propOffers]);

  // Filter ONLY active offers and cap at exactly 6 active cards
  const activeOffers = offers
    .filter(offer => getOfferStatus(offer) === 'Active')
    .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1))
    .slice(0, 6);

  const totalCards = activeOffers.length;

  // Next & Previous navigation helpers
  const goToNext = useCallback(() => {
    if (totalCards <= 1) return;
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % totalCards);
  }, [totalCards]);

  const goToPrev = useCallback(() => {
    if (totalCards <= 1) return;
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  const goToIndex = useCallback((idx: number) => {
    if (idx === currentIndex || totalCards <= 1) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  }, [currentIndex, totalCards]);

  // Auto Slider Timer (slides every 4.5 seconds when not paused and >1 cards)
  useEffect(() => {
    if (totalCards <= 1 || isPaused) return;

    const timer = setInterval(() => {
      goToNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [totalCards, isPaused, goToNext]);

  // Safety check: ensure current index is within range
  useEffect(() => {
    if (currentIndex >= totalCards && totalCards > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalCards]);

  // Handle Offer Click Navigation
  const handleOfferClick = (offer: Offer) => {
    const rawDest = (offer.destinationUrl || offer.ctaValue || '').trim();
    const cleanPhone = (contact.whatsapp || contact.phone || '081675 49092').replace(/\D/g, '');

    if (!rawDest && offer.ctaType !== 'whatsapp') {
      // If no destination is specified, do nothing
      return;
    }

    if (rawDest.startsWith('http://') || rawDest.startsWith('https://') || rawDest.startsWith('//')) {
      window.open(rawDest, '_blank', 'noopener,noreferrer');
      return;
    }

    if (rawDest.startsWith('tel:')) {
      window.location.href = rawDest;
      return;
    }

    if (rawDest.startsWith('mailto:')) {
      window.location.href = rawDest;
      return;
    }

    if (rawDest.startsWith('#/')) {
      onNavigate(rawDest.substring(2));
      return;
    }

    if (rawDest.startsWith('#')) {
      onNavigate(rawDest.substring(1));
      return;
    }

    // Check if it matches an internal route
    const internalRoutes = [
      'services', 'gallery', 'videos', 'locations', 'book-repair',
      'track-service', 'reviews', 'faq', 'contact', 'about', 'offers'
    ];
    if (internalRoutes.includes(rawDest.toLowerCase()) || rawDest.includes('/')) {
      onNavigate(rawDest);
      return;
    }

    // Default: WhatsApp Enquiry
    const msg = rawDest || `Hello MOBO SAVIOR, I want to enquire about the special offer: "${offer.title}". Please share details.`;
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diff = touchStartXRef.current - touchEndXRef.current;
      const minSwipeDistance = 40; // in px
      if (diff > minSwipeDistance) {
        goToNext();
      } else if (diff < -minSwipeDistance) {
        goToPrev();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setIsPaused(false);
  };

  // If no active offers, return null (do not display empty carousel)
  if (!loading && totalCards === 0) {
    return null;
  }

  const currentOffer = activeOffers[currentIndex] || activeOffers[0];
  const hasDestination = Boolean((currentOffer?.destinationUrl || currentOffer?.ctaValue || '').trim());

  // Slide Animation Variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 }
      }
    })
  };

  return (
    <section 
      id="home-offers-slider-section" 
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 select-none"
      aria-label="Promotional Offers Slider"
    >
      {/* 16:9 Offer Card Container */}
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-slate-950 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Strict 16:9 Aspect Ratio Frame */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-900">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {currentOffer && (
              <motion.div
                key={currentOffer.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={`absolute inset-0 w-full h-full ${hasDestination ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => handleOfferClick(currentOffer)}
                role={hasDestination ? 'button' : undefined}
                tabIndex={hasDestination ? 0 : undefined}
                onKeyDown={(e) => {
                  if (hasDestination && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleOfferClick(currentOffer);
                  }
                }}
              >
                {/* 16:9 Promotional Banner Image */}
                <img
                  src={currentOffer.imageUrl || '/assets/images/slide_display_1788168074454.jpg'}
                  alt={currentOffer.title || 'Special Offer'}
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/slide_display_1788168074454.jpg';
                  }}
                />

                {/* Subtle Clickable Hint Pill if destination URL exists */}
                {hasDestination && (
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/20">
                      <span>View Offer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left Arrow Button (Only when > 1 offer) */}
          {totalCards > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              aria-label="Previous Offer"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-md transition-all opacity-80 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Right Arrow Button (Only when > 1 offer) */}
          {totalCards > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              aria-label="Next Offer"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-md transition-all opacity-80 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Pagination Indicator Dots (Only when > 1 active offer) */}
      {totalCards > 1 && (
        <div className="flex items-center justify-center gap-2 pt-3 pb-1" role="tablist" aria-label="Offer Cards Navigation">
          {activeOffers.map((offer, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={offer.id || idx}
                onClick={() => goToIndex(idx)}
                aria-label={`Go to offer slide ${idx + 1}`}
                aria-selected={isActive}
                role="tab"
                className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                  isActive
                    ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-[#0284C7] shadow-sm'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
