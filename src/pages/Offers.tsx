import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Offer, OfferCategory, ContactSettings } from '../types';
import { getOfferStatus, OfferStatus } from '../utils/offerHelpers';
import { DEFAULT_OFFERS, DEFAULT_OFFER_CATEGORIES } from '../firebase/seed';
import SEOHead from '../components/SEOHead';
import { Tag, Sparkles, Clock, MessageSquare, Calendar, PhoneCall, ChevronDown, ChevronUp, AlertCircle, Gift, CheckCircle2, ShieldCheck, Wrench, ArrowRight } from 'lucide-react';

interface OffersPageProps {
  onNavigate: (route: string) => void;
  contact: ContactSettings;
}

export default function OffersPage({ onNavigate, contact }: OffersPageProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<OfferCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active'); // 'active', 'upcoming', 'all'
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [offersSnap, categoriesSnap] = await Promise.all([
          getDocs(query(collection(db, 'offers'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'offer_categories'), orderBy('displayOrder', 'asc')))
        ]);

        const fetchedOffers: Offer[] = [];
        offersSnap.forEach(docSnap => {
          fetchedOffers.push({ id: docSnap.id, ...docSnap.data() } as Offer);
        });

        const fetchedCategories: OfferCategory[] = [];
        categoriesSnap.forEach(docSnap => {
          fetchedCategories.push({ id: docSnap.id, ...docSnap.data() } as OfferCategory);
        });

        setOffers(fetchedOffers.length > 0 ? fetchedOffers : DEFAULT_OFFERS);
        setCategories(fetchedCategories.length > 0 ? fetchedCategories : DEFAULT_OFFER_CATEGORIES);
      } catch (err) {
        console.error('Error loading offers page data:', err);
        setOffers(DEFAULT_OFFERS);
        setCategories(DEFAULT_OFFER_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleTerms = (id: string) => {
    setExpandedTerms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCTAClick = (offer: Offer) => {
    const cleanPhone = (contact.whatsapp || contact.phone || '081675 49092').replace(/\D/g, '');

    if (offer.ctaType === 'whatsapp' || !offer.ctaType) {
      const msg = offer.ctaValue || `Hello MOBO SAVIOR, I want to claim/enquire about the offer: "${offer.title}". Please share details!`;
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

  // Filter offers based on category & status
  const filteredOffers = offers.filter(offer => {
    const status = getOfferStatus(offer);

    // Filter by Status
    if (selectedStatus === 'active' && status !== 'Active') return false;
    if (selectedStatus === 'upcoming' && status !== 'Upcoming') return false;
    if (selectedStatus === 'expired' && status !== 'Expired') return false;

    // Filter by Category
    if (selectedCategory !== 'all') {
      const matchCat = offer.categoryId === selectedCategory || offer.category.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchCat) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <SEOHead
        title="Special Offers & Mobile Repair Discounts | MOBO SAVIOR Purulia"
        description="Exclusive mobile repair deals, festival discounts, free screen guards & battery replacement offers at MOBO SAVIOR service center in Purulia, West Bengal."
        canonicalPath="#/offers"
      />

      {/* Hero Header */}
      <div className="bg-slate-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950/60 opacity-90" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/15 border border-sky-400/30 text-sky-300 rounded-full text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>MOBO SAVIOR PROMOTIONS & DEALS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-sans">
            Latest Special Offers & Discounts
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Claim instant cashback, free gift accessories, display combo discounts, and seasonal festival offers for your iPhone and Android repairs in Purulia.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-8">
        
        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-md space-y-4">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline">
                Status:
              </span>
              <button
                onClick={() => setSelectedStatus('active')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedStatus === 'active'
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Active Offers
              </button>
              <button
                onClick={() => setSelectedStatus('upcoming')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedStatus === 'upcoming'
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Upcoming Offers
              </button>
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Offers
              </button>
            </div>

            <span className="text-xs font-bold text-slate-500">
              Showing {filteredOffers.length} {filteredOffers.length === 1 ? 'offer' : 'offers'}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-8 h-8 border-3 border-[#0284C7] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading latest repair offers...</p>
          </div>
        ) : filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => {
              const status = getOfferStatus(offer);
              const isTermsOpen = !!expandedTerms[offer.id];

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col overflow-hidden text-left group relative"
                >
                  {/* Offer Image Header */}
                  <div className="h-48 sm:h-52 bg-slate-950 relative overflow-hidden">
                    <img
                      src={offer.imageUrl || '/assets/images/slide_display_1788168074454.jpg'}
                      alt={offer.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Category Tag */}
                    <div className="absolute top-3.5 left-3.5">
                      <span className="bg-white/95 backdrop-blur text-[#0284C7] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                        {offer.category}
                      </span>
                    </div>

                    {/* Discount Badge */}
                    {offer.discount && (
                      <div className="absolute top-3.5 right-3.5">
                        <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-md shadow-md flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 fill-white" />
                          {offer.discount}
                        </span>
                      </div>
                    )}

                    {/* Status Pill */}
                    <div className="absolute bottom-3 left-3.5">
                      {status === 'Active' && (
                        <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          ACTIVE NOW
                        </span>
                      )}
                      {status === 'Upcoming' && (
                        <span className="bg-sky-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                          UPCOMING DEAL
                        </span>
                      )}
                      {status === 'Expired' && (
                        <span className="bg-slate-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                          EXPIRED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0284C7] transition-colors font-sans leading-snug">
                        {offer.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {offer.description}
                      </p>

                      {/* Validity Period */}
                      {(offer.startDate || offer.endDate) && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <Clock className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
                          <span>
                            Valid: {offer.startDate || 'Immediate'} {offer.endDate ? `till ${offer.endDate}` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Terms & Conditions Expander */}
                    {offer.terms && (
                      <div className="border-t border-slate-100 pt-3">
                        <button
                          onClick={() => toggleTerms(offer.id)}
                          className="text-xs font-bold text-slate-500 hover:text-[#0284C7] flex items-center justify-between w-full transition-colors"
                        >
                          <span>Terms & Conditions</span>
                          {isTermsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isTermsOpen && (
                          <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed space-y-1">
                            <p>{offer.terms}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleCTAClick(offer)}
                        className="w-full py-3 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {offer.ctaType === 'whatsapp' && <MessageSquare className="w-4 h-4" />}
                        {offer.ctaType === 'enquiry' && <Calendar className="w-4 h-4" />}
                        {offer.ctaType === 'call' && <PhoneCall className="w-4 h-4" />}
                        <span>{offer.ctaText || 'Claim Offer'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 px-4 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Offers Found</h3>
            <p className="text-xs text-slate-500">
              There are currently no offers matching your selected category or status filter. Please try switching tabs or check back soon!
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Walk-in Repair Guarantee Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-lg">
          <div className="space-y-2 text-left max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-400/20 inline-block">
              WALK-IN SERVICE GUARANTEE
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-sans">
              Get Instant Diagnosis & Transparent Repair Pricing
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Visit Saddam at MOBO SAVIOR, Room B4 Super Market, Hattola More, Purulia. Walk-in customers receive free initial diagnostics and upfront cost quotes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onNavigate('book-repair')}
              className="px-5 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>BOOK DIAGNOSTIC</span>
            </button>

            <a
              href={`https://wa.me/91${(contact.whatsapp || '081675 49092').replace(/\D/g, '')}?text=Hello%20MOBO%20SAVIOR,%20I%20want%20to%20enquire%20about%20your%20offers.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WHATSAPP US</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
