import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Offer, ContactSettings } from '../types';
import { getOfferStatus } from '../utils/offerHelpers';
import { DEFAULT_OFFERS } from '../firebase/seed';
import { Tag, Sparkles, ArrowRight, MessageSquare, Calendar, PhoneCall, Gift, Clock } from 'lucide-react';

interface HomeOffersSectionProps {
  onNavigate: (route: string) => void;
  contact: ContactSettings;
  offers?: Offer[];
}

export default function HomeOffersSection({ onNavigate, contact, offers: initialOffers }: HomeOffersSectionProps) {
  const [items, setItems] = useState<Offer[]>(initialOffers || []);
  const [loading, setLoading] = useState(!initialOffers || initialOffers.length === 0);

  useEffect(() => {
    if (initialOffers && initialOffers.length > 0) {
      setItems(initialOffers);
      setLoading(false);
      return;
    }

    async function fetchOffers() {
      try {
        const q = query(collection(db, 'offers'), orderBy('displayOrder', 'asc'));
        const snap = await getDocs(q);
        const fetched: Offer[] = [];
        snap.forEach(docSnap => {
          const data = docSnap.data();
          fetched.push({ id: docSnap.id, ...data } as Offer);
        });
        if (fetched.length > 0) {
          setItems(fetched);
        } else {
          setItems(DEFAULT_OFFERS);
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
        setItems(DEFAULT_OFFERS);
      } finally {
        setLoading(false);
      }
    }

    fetchOffers();
  }, [initialOffers]);

  // Filter only Active offers for Home page display
  const activeOffers = items
    .filter(offer => getOfferStatus(offer) === 'Active')
    .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

  if (!loading && activeOffers.length === 0) {
    return null; // Don't display empty section if no active offers
  }

  const handleCTAClick = (offer: Offer) => {
    const cleanPhone = (contact.whatsapp || contact.phone || '081675 49092').replace(/\D/g, '');
    
    if (offer.ctaType === 'whatsapp' || !offer.ctaType) {
      const msg = offer.ctaValue || `Hello MOBO SAVIOR, I want to enquire about the offer: "${offer.title}". Please share details!`;
      window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    } else if (offer.ctaType === 'service' && offer.ctaValue) {
      onNavigate(offer.ctaValue);
    } else if (offer.ctaType === 'enquiry') {
      onNavigate(`book-repair?offer=${encodeURIComponent(offer.title)}`);
    } else if (offer.ctaType === 'call') {
      window.location.href = `tel:${contact.phone}`;
    } else {
      window.open(`https://wa.me/91${cleanPhone}?text=Hello%20MOBO%20SAVIOR,%20I%20want%20to%20enquire%20about%20${encodeURIComponent(offer.title)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" id="home-latest-offers">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
        <div className="space-y-2">
          <span className="text-[10px] font-black tracking-widest text-[#0284C7] uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-100 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#0284C7]" />
            LATEST REPAIR OFFERS
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 font-sans">
            Special Deals & Discounts
          </h2>
          <p className="text-sm text-slate-500 max-w-xl font-medium">
            Save more on screen replacements, battery swaps, and festival repair packages at MOBO SAVIOR Purulia.
          </p>
        </div>
        <button
          onClick={() => onNavigate('offers')}
          className="group inline-flex items-center gap-2 text-xs font-bold text-[#0284C7] hover:text-white hover:bg-[#0284C7] bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 transition-all flex-shrink-0 self-start sm:self-auto"
        >
          <span>View All Offers</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid of Offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeOffers.slice(0, 3).map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col overflow-hidden text-left group"
          >
            {/* Image Banner */}
            <div className="h-44 bg-slate-950 relative overflow-hidden">
              <img
                src={offer.imageUrl || '/assets/images/slide_display_1788168074454.jpg'}
                alt={offer.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

              {/* Category Pill */}
              <div className="absolute top-3 left-3">
                <span className="bg-white/95 backdrop-blur text-[#0284C7] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                  {offer.category}
                </span>
              </div>

              {/* Discount Badge */}
              {offer.discount && (
                <div className="absolute top-3 right-3">
                  <span className="bg-amber-500 text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                    <Tag className="w-3 h-3 fill-white" />
                    {offer.discount}
                  </span>
                </div>
              )}

              {/* Offer Title in Banner */}
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[10px] text-sky-300 font-extrabold uppercase tracking-wider block mb-0.5">
                  Limited Period Deal
                </span>
                <h3 className="text-base font-black text-white font-sans line-clamp-1 leading-snug">
                  {offer.title}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-2">
                  {offer.description}
                </p>

                {/* Validity Badge */}
                {(offer.startDate || offer.endDate) && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <Clock className="w-3 h-3 text-[#0284C7]" />
                    <span>
                      Valid: {offer.startDate || 'Now'} {offer.endDate ? `to ${offer.endDate}` : 'onwards'}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Action */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleCTAClick(offer)}
                  className="w-full py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold rounded-xl shadow transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {offer.ctaType === 'whatsapp' && <MessageSquare className="w-4 h-4" />}
                  {offer.ctaType === 'enquiry' && <Calendar className="w-4 h-4" />}
                  {offer.ctaType === 'call' && <PhoneCall className="w-4 h-4" />}
                  <span>{offer.ctaText || 'Claim Offer'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
