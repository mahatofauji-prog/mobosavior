import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Wrench, 
  Calendar, 
  MessageSquare, 
  Phone, 
  ChevronRight, 
  AlertTriangle,
  HelpCircle,
  MapPin,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Service, ServiceCategory, ContactSettings, Brand, PhoneModel, FAQItem, Review, PriceItem } from '../types';
import { resolveServicePrice } from '../utils/priceHelpers';

interface CategoryDetailProps {
  onNavigate: (route: string) => void;
  categories: ServiceCategory[];
  services: Service[];
  slug: string;
  contact: ContactSettings;
  brands?: Brand[];
  models?: PhoneModel[];
  faqs?: FAQItem[];
  reviews?: Review[];
  prices?: PriceItem[];
}

export default function CategoryDetail({
  onNavigate,
  categories,
  services,
  slug,
  contact,
  brands = [],
  models = [],
  faqs = [],
  prices = []
}: CategoryDetailProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Normalize slug
  const normalizedSlug = (slug || '').toLowerCase().trim();

  // Find matching category
  const category = categories.find(
    c => c.slug?.toLowerCase() === normalizedSlug || c.id?.toLowerCase() === normalizedSlug
  ) || categories[0];

  // If no category found at all
  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Category Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The requested specialized repair category could not be located.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-[#0284C7] text-white font-bold rounded-xl"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Get services belonging to this category
  // 1. By explicit serviceSlugs
  // 2. By matching category name or slug in srv.category
  const categoryServices = services.filter(srv => {
    if (!srv.active) return false;
    
    // Explicit slugs matching
    if (category.serviceSlugs && category.serviceSlugs.length > 0) {
      if (category.serviceSlugs.includes(srv.slug)) return true;
    }

    const catNameLower = category.name.toLowerCase();
    const catSlugLower = category.slug.toLowerCase();
    const srvCatLower = (srv.category || '').toLowerCase();
    const srvNameLower = srv.name.toLowerCase();

    // Specific category mapping heuristics
    if (catSlugLower.includes('iphone') || catNameLower.includes('iphone')) {
      return srvCatLower.includes('iphone') || srvNameLower.includes('iphone') || srv.slug.includes('iphone');
    }
    if (catSlugLower.includes('android') || catNameLower.includes('android')) {
      return srvCatLower.includes('android') || srvNameLower.includes('android') || srv.slug.includes('android');
    }
    if (catSlugLower.includes('motherboard') || catNameLower.includes('motherboard')) {
      return srvCatLower.includes('motherboard') || srvCatLower.includes('chip') || srv.slug.includes('motherboard') || srv.slug.includes('cpu') || srv.slug.includes('dead-phone') || srv.slug.includes('emmc');
    }
    if (catSlugLower.includes('flip') || catSlugLower.includes('fold')) {
      return srvCatLower.includes('flip') || srvCatLower.includes('fold') || srv.slug.includes('flip') || srv.slug.includes('fold');
    }
    if (catSlugLower.includes('display') || catNameLower.includes('display')) {
      return srvCatLower.includes('display') || srvCatLower.includes('screen') || srv.slug.includes('display') || srv.slug.includes('green-line') || srv.slug.includes('oled');
    }
    if (catSlugLower.includes('software') || catNameLower.includes('software')) {
      return srvCatLower.includes('software') || srv.slug.includes('software') || srv.slug.includes('programming') || srv.slug.includes('boot');
    }

    return srvCatLower === catNameLower || srvCatLower.includes(catSlugLower);
  });

  // Filter services by search query
  const filteredServices = categoryServices.filter(srv => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      srv.name.toLowerCase().includes(q) ||
      srv.description.toLowerCase().includes(q) ||
      (srv.problemsCovered && srv.problemsCovered.some(p => p.toLowerCase().includes(q)))
    );
  });

  // Fallback category image
  const categoryHeroImage = category.imageUrl || '/assets/images/service_iphone_repair_1788169632215.jpg';

  // Category specific FAQs
  const categoryFaqs = faqs.filter(f => 
    f.category?.toLowerCase() === category.name.toLowerCase() ||
    f.question.toLowerCase().includes(category.name.toLowerCase())
  );

  // If no specific FAQs found, use fallback general FAQs
  const displayFaqs = categoryFaqs.length > 0 ? categoryFaqs : faqs.slice(0, 4);

  // WhatsApp click handler
  const handleWhatsAppInquiry = (serviceName?: string) => {
    const text = serviceName 
      ? `Hello MOBO SAVIOR, I want to inquire about ${serviceName} under the ${category.name} section.`
      : `Hello MOBO SAVIOR, I want to enquire about ${category.name} services for my mobile phone.`;
    const cleanPhone = (contact.whatsapp || '081675 49092').replace(/\D/g, '');
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // Other categories for footer navigation
  const otherCategories = categories.filter(c => c.id !== category.id && c.active);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* 1. Breadcrumbs Bar */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button 
            onClick={() => onNavigate('home')} 
            className="hover:text-[#0284C7] transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button 
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('specialized-repair-services');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="hover:text-[#0284C7] transition-colors"
          >
            Specialized Repair Services
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold truncate">{category.name}</span>
        </div>
      </div>

      {/* 2. Category Hero Section */}
      <section className="bg-slate-950 text-white relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading & Information */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{category.badge || 'Specialized Diagnostic Hub'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-sans leading-tight">
                {category.name}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                {category.longDescription || category.description}
              </p>

              {/* Lab Capability Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-sky-400 font-black text-lg">100%</div>
                  <div className="text-[11px] text-slate-400 font-medium">ESD Protected Lab</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-teal-400 font-black text-lg">Same-Day</div>
                  <div className="text-[11px] text-slate-400 font-medium">Express Options</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-indigo-400 font-black text-lg">Up to 6M</div>
                  <div className="text-[11px] text-slate-400 font-medium">Warranty Coverage</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-amber-400 font-black text-lg">Free</div>
                  <div className="text-[11px] text-slate-400 font-medium">Bench Diagnosis</div>
                </div>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => handleWhatsAppInquiry()}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
                  <span>WhatsApp Specialist</span>
                </button>
                <button
                  onClick={() => onNavigate(`book-repair?category=${category.slug}`)}
                  className="px-5 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-sky-950/40 flex items-center gap-2 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book In-Lab Repair</span>
                </button>
                <a
                  href={`tel:${contact.phone.replace(/\D/g, '')}`}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-xl border border-white/15 flex items-center gap-2 transition-all"
                >
                  <Phone className="w-4 h-4 text-sky-400" />
                  <span>Call {contact.phone}</span>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Image Frame */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 aspect-[4/3] bg-slate-900 group">
                <img
                  src={categoryHeroImage}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('service_iphone_repair')) {
                      target.src = '/assets/images/service_iphone_repair_1788169632215.jpg';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white font-bold">{categoryServices.length} Specialized Services Available</span>
                  </div>
                  <span className="text-sky-300 font-semibold">Purulia Center</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Problems Covered Section */}
      {category.problemsCovered && category.problemsCovered.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-md text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0284C7]">DIAGNOSTIC COVERAGE</span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  What Problems Are Covered in {category.name}?
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Tested with microscope, oscilloscope & thermal detection
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {category.problemsCovered.map((problem, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 hover:bg-sky-50/50 hover:border-sky-200 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7] flex-shrink-0 mt-0.5" />
                  <span>{problem}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Services Inside Category (Grid/List) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 text-left">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0284C7]">CATALOG & PACKAGES</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight">
              Services Inside {category.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Select any individual service below to view complete diagnostic steps, technical tools, quality tiers, and model-wise pricing.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${category.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0284C7] shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((srv) => {
              const serviceImg = srv.imageUrl || categoryHeroImage;
              return (
                <div
                  key={srv.id || srv.slug}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Service Image Frame */}
                  <div className="h-48 sm:h-52 bg-slate-100 overflow-hidden relative">
                    <img
                      src={serviceImg}
                      alt={srv.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('service_iphone_repair')) {
                          target.src = '/assets/images/service_iphone_repair_1788169632215.jpg';
                        }
                      }}
                    />
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 backdrop-blur text-[#0284C7] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                        {category.name}
                      </span>
                    </div>

                    {/* Warranty pill */}
                    {srv.warranty && (
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur shadow-sm">
                          {srv.warranty}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#0284C7] transition-colors leading-tight mb-2">
                        {srv.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {srv.description}
                      </p>
                    </div>

                    {/* Key Specs Pills: Price, Repair Time, Warranty */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Starting Price</span>
                        <span className="text-sm font-black text-slate-900">
                          {resolveServicePrice(prices, srv).formattedPrice}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Repair Time</span>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#0284C7]" />
                          <span>{srv.estimatedTime || '30 - 60 Mins'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      {/* Primary View Details Button */}
                      <button
                        onClick={() => onNavigate(`services/${srv.slug}`)}
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-[#0284C7] text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 group-hover:shadow-md"
                      >
                        <span>View Service Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Secondary WhatsApp & Book Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleWhatsAppInquiry(srv.name)}
                          className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-emerald-600 text-emerald-50" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => onNavigate(`book-repair?service=${srv.slug}&category=${category.slug}`)}
                          className="py-2 px-3 bg-sky-50 hover:bg-sky-100 text-[#0284C7] text-xs font-bold rounded-xl border border-sky-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book / Enquire</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
            <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No services found matching "{searchQuery}"</h3>
            <p className="text-xs text-slate-500 mb-4">Try checking your spelling or clear the search filter.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Reset Search
            </button>
          </div>
        )}
      </section>

      {/* 5. Frequently Asked Questions */}
      {displayFaqs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-left">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
            <div className="space-y-1 mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0284C7]">COMMON QUESTIONS</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-sans">
                {category.name} Repair FAQs
              </h2>
            </div>

            <div className="space-y-3">
              {displayFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={faq.id || idx}
                    className="border border-slate-100 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-extrabold text-sm text-slate-800">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#0284C7]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6. Explore Other Specialized Repair Categories */}
      {otherCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0284C7]">OTHER DOMAINS</span>
              <h3 className="text-xl font-black text-slate-900">Explore Other Specialized Categories</h3>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1"
            >
              <span>View All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {otherCategories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate(cat.slug)}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-[#0284C7] hover:shadow-md transition-all text-left group flex flex-col justify-between"
              >
                <div className="h-24 rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                  <img
                    src={cat.imageUrl || '/assets/images/service_iphone_repair_1788169632215.jpg'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {cat.badge || 'Lab Service'}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-[#0284C7] transition-colors leading-tight mb-1">
                    {cat.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 block">
                    {cat.serviceSlugs?.length || 'Multiple'} Services Available
                  </span>
                </div>
                <div className="mt-3 flex items-center text-[10px] font-extrabold text-[#0284C7]">
                  <span>Explore Hub</span>
                  <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 7. Walk-in Lab Location & Directions Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">
              PURULIA BENCH DIAGNOSTICS
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Bring Your Device to Saddam's Specialized Lab
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {contact.address}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <a
              href={contact.googleMapsUrl || 'https://maps.app.goo.gl/tU41BvTCk3dRAn6r9'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>Get Directions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => handleWhatsAppInquiry()}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
              <span>WhatsApp Lab</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
