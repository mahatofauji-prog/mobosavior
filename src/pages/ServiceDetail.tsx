import { useState, useEffect, useMemo } from 'react';
import { Service, ContactSettings, GalleryItem, VideoItem, Brand, PhoneModel, PriceItem } from '../types';
import { 
  Clock, ShieldCheck, CheckCircle2, MessageSquare, Calendar, ChevronLeft, 
  HelpCircle, Activity, Award, Check, Wrench, Smartphone, FileText, AlertTriangle, 
  PlayCircle, ArrowRight, Layers, PhoneCall, MapPin, Sparkles, ChevronRight, Tag, DollarSign
} from 'lucide-react';
import { collection, getDocs, orderBy, query } from '../lib/supabase';
import { db } from '../lib/supabase';
import { getServiceImage } from '../utils/serviceImages';
import { ALL_COMPREHENSIVE_SERVICES } from '../data/servicesData';
import { DEFAULT_BRANDS, DEFAULT_MODELS } from '../data/modelsData';
import { resolveServicePrice } from '../utils/priceHelpers';
import SEOHead from '../components/SEOHead';
import LocalBusinessSchema from '../components/LocalBusinessSchema';
import Breadcrumbs from '../components/Breadcrumbs';
import { trackServiceView, trackWhatsAppClick, trackBookRepairClick, trackPhoneCallClick } from '../lib/analytics';

interface ServiceDetailProps {
  slug: string;
  onNavigate: (route: string) => void;
  services: Service[];
  contact: ContactSettings;
  brands?: Brand[];
  models?: PhoneModel[];
  prices?: PriceItem[];
}

export default function ServiceDetail({ 
  slug, 
  onNavigate, 
  services, 
  contact,
  brands = DEFAULT_BRANDS,
  models = DEFAULT_MODELS,
  prices = []
}: ServiceDetailProps) {
  // 1. Resolve slug and query params (e.g., "display-replacement" or "display-replacement?brand=Apple&model=iPhone%2013")
  const [cleanSlug, setCleanSlug] = useState(() => {
    return slug.includes('?') ? slug.split('?')[0] : slug;
  });

  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<string>('');

  useEffect(() => {
    const raw = slug || '';
    const parts = raw.split('?');
    const pathSlug = parts[0];
    setCleanSlug(pathSlug);

    if (parts[1]) {
      const searchParams = new URLSearchParams(parts[1]);
      const b = searchParams.get('brand');
      const m = searchParams.get('model');
      if (b) setSelectedBrand(decodeURIComponent(b));
      if (m) setSelectedModel(decodeURIComponent(m));
    }
  }, [slug]);

  // 2. Lookup Service from Firestore list or Comprehensive catalog fallback
  const service = useMemo(() => {
    return services.find(s => s.slug === cleanSlug && s.active !== false) || null;
  }, [cleanSlug, services]);

  // 3. Dynamic SEO & Analytics updates for this specific dedicated service page
  useEffect(() => {
    if (!service) return;

    trackServiceView({
      service_name: service.name,
      service_slug: service.slug,
      category: service.category
    });
  }, [service]);

  // 4. Fetch related media (Gallery & Videos)
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    if (!service) return;
    
    let isMounted = true;
    const fetchMedia = async () => {
      setLoadingMedia(true);
      try {
        const [gSnap, vSnap] = await Promise.all([
          getDocs(query(collection(db, 'gallery'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'videos'), orderBy('displayOrder', 'asc')))
        ]);
        
        if (!isMounted) return;

        const gItems: GalleryItem[] = [];
        gSnap.forEach(doc => gItems.push({ id: doc.id, ...doc.data() } as GalleryItem));
        
        const vItems: VideoItem[] = [];
        vSnap.forEach(doc => vItems.push({ id: doc.id, ...doc.data() } as VideoItem));
        
        const sCat = (service.category || '').toLowerCase();
        const sName = (service.name || '').toLowerCase();
        
        const relatedG = gItems.filter(g => (g.category || '').toLowerCase().includes(sCat) || (g.title || '').toLowerCase().includes(sName));
        const relatedV = vItems.filter(v => (v.category || '').toLowerCase().includes(sCat) || (v.title || '').toLowerCase().includes(sName));
        
        setGallery(relatedG);
        setVideos(relatedV);
      } catch (err) {
        // Fallback gracefully without breaking UI
      } finally {
        if (isMounted) setLoadingMedia(false);
      }
    };
    
    fetchMedia();
    return () => { isMounted = false; };
  }, [service]);

  // 5. Related Services in the same or complementary category
  const relatedServices = useMemo(() => {
    if (!service) return [];
    const sourceList = services.length > 0 ? services : ALL_COMPREHENSIVE_SERVICES;
    return sourceList
      .filter(s => s.slug !== service.slug && s.active !== false)
      .filter(s => s.category === service.category || Math.random() > 0.4)
      .slice(0, 3);
  }, [service, services]);

  // Resolve dynamic price using the priority engine
  const priceResult = useMemo(() => {
    if (!service) {
      return {
        priceItem: null,
        formattedPrice: 'Price available on enquiry',
        isModelOverride: false
      };
    }
    return resolveServicePrice(prices, service, selectedBrand, selectedModel, selectedQuality);
  }, [service, prices, selectedBrand, selectedModel, selectedQuality]);

  // Category navigation link
  const getCategoryRoute = (cat: string): { route: string; label: string } => {
    const c = (cat || '').toLowerCase();
    if (c.includes('apple') || c.includes('iphone')) return { route: 'iphone-repair', label: 'iPhone Repair' };
    if (c.includes('android') || c.includes('samsung')) return { route: 'android-repair', label: 'Android Repair' };
    if (c.includes('chip') || c.includes('board')) return { route: 'motherboard-repair', label: 'Motherboard Lab' };
    if (c.includes('flip') || c.includes('fold') || c.includes('special')) return { route: 'flip-fold-repair', label: 'Flip & Fold Repair' };
    if (c.includes('display') || c.includes('screen')) return { route: 'display-replacement', label: 'Display Replacement' };
    return { route: 'services', label: 'Services' };
  };

  if (!service) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 font-sans tracking-tight">Service Page Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          The requested repair service page could not be located. It might have been updated or moved.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('services')}
            className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Explore All Services
          </button>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryRoute(service.category);

  const formattedWhatsappText = `Hello MOBO SAVIOR, I want to inquire about ${service.name}${selectedBrand ? ` (${selectedBrand}${selectedModel ? ` ${selectedModel}` : ''})` : selectedModel ? ` (${selectedModel})` : ''}${selectedQuality ? ` [${selectedQuality}]` : ''}. Price: ${priceResult.formattedPrice}. Please confirm availability and repair time.`;
  const formattedWhatsappLink = `https://wa.me/91${contact.whatsapp.replace(/\s+/g, '')}?text=${encodeURIComponent(formattedWhatsappText)}`;

  const symptoms = service.symptoms && service.symptoms.length > 0 ? service.symptoms : service.problemsCovered;
  const defaultProcessSteps = [
    'Microscopic intake inspection & diagnostic logging',
    'Laser heating and safe ESD disassembly',
    'Component-level chip solder & precision replacement',
    '24-point hardware validation and burn-in stress test'
  ];
  const processSteps = service.repairProcessSteps && service.repairProcessSteps.length > 0 
    ? service.repairProcessSteps 
    : defaultProcessSteps;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEOHead serviceData={service} />
      <LocalBusinessSchema contact={contact} service={service} />

      {/* 1. Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-[#0284C7] transition-colors focus:outline-none"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button 
              onClick={() => onNavigate('services')} 
              className="hover:text-[#0284C7] transition-colors focus:outline-none"
            >
              Services
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button 
              onClick={() => onNavigate(categoryInfo.route)} 
              className="hover:text-[#0284C7] transition-colors focus:outline-none text-[#0284C7]"
            >
              {categoryInfo.label}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-bold truncate max-w-[200px]">
              {service.name}
            </span>
            {selectedModel && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-md">
                  {selectedModel}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* 2. Service Hero Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            
            {/* Left Column: Heading & Description */}
            <div className="flex-1 space-y-4 text-left">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-black tracking-wider text-[#0284C7] uppercase bg-[#E0F2FE] px-3 py-1 rounded-full border border-sky-100">
                  {service.category} Specialization
                </span>
                {service.featured && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Featured Lab Service
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight font-sans tracking-tight">
                {service.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-medium">
                {service.overview || service.description}
              </p>

              {/* Quick specs pill badges */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>{service.estimatedTime || '30-45 Mins'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{service.warranty || 'Testing Warranty'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl font-bold">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Saddam Bhai Certified</span>
                </div>
              </div>

              {/* Desktop Quick Action Buttons */}
              <div className="hidden sm:flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => onNavigate(`book-repair?service=${service.slug}${selectedModel ? `&model=${encodeURIComponent(selectedModel)}` : ''}`)}
                  className="px-6 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book This Repair
                </button>
                <a
                  href={formattedWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Saddam Bhai
                </a>
                <a
                  href={`tel:${contact.phone}`}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-slate-500" />
                  Call Lab
                </a>
              </div>
            </div>

            {/* Right Column: High-Res Service Image */}
            <div className="w-full sm:w-80 lg:w-96 aspect-square shrink-0 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white group relative">
              <img 
                src={getServiceImage(service)} 
                alt={service.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('service_iphone_repair')) {
                    target.src = '/assets/images/service_iphone_repair_1788169632215.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-5">
                <div className="text-white space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-sky-300">MOBO SAVIOR Purulia</p>
                  <p className="text-sm font-bold">{service.name}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8 COLUMNS: Detailed Technical Breakdown */}
          <div className="lg:col-span-8 space-y-8">

            {/* A. Quality Options (e.g. for display replacements) */}
            {service.qualityOptions && service.qualityOptions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-50 text-[#0284C7] rounded-xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-sans">Available Quality Grades</h3>
                    <p className="text-xs text-slate-500">Choose the quality level that fits your performance and budget needs.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {service.qualityOptions.map((opt, i) => (
                    <div 
                      key={i}
                      onClick={() => setSelectedQuality(opt.name)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all text-left space-y-2 ${
                        selectedQuality === opt.name 
                          ? 'border-[#0284C7] bg-sky-50/50 ring-2 ring-[#0284C7]/20 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{opt.name}</span>
                        {opt.price && (
                          <span className="text-xs font-black text-[#0284C7]">{opt.price}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{opt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* B. Symptoms / Is your phone showing this? */}
            {symptoms && symptoms.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-sans">Is your phone showing this problem?</h3>
                    <p className="text-xs text-slate-500">Common symptoms diagnosed and resolved under this service.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {symptoms.map((prob, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">{prob}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C. Diagnosis Process & Specialized Tools */}
            {(service.diagnosisProcess || (service.toolsAndTech && service.toolsAndTech.length > 0)) && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                {service.diagnosisProcess && (
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-sans flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#0284C7]" />
                      Specialized Lab Diagnosis
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {service.diagnosisProcess}
                    </p>
                  </div>
                )}

                {service.toolsAndTech && service.toolsAndTech.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-slate-400" />
                      Tools & Technology Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.toolsAndTech.map((tool, i) => (
                        <span key={i} className="px-3 py-1.5 bg-sky-50/80 text-[#0284C7] text-xs font-bold rounded-lg border border-sky-100">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* D. Repair Process Steps */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0F2FE] text-[#0284C7] rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg font-sans">Step-by-Step Repair Process</h3>
                  <p className="text-xs text-slate-500">Transparent execution carried out at our Purulia workstation.</p>
                </div>
              </div>
              
              <div className="space-y-4 relative pl-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-sky-100">
                {processSteps.map((step, index) => (
                  <div key={index} className="relative space-y-1">
                    <div className="absolute -left-6 w-6 h-6 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[10px] font-black -translate-x-[2px] shadow-sm border-2 border-white">
                      {index + 1}
                    </div>
                    <div className="pl-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* E. Supported Devices (Brands & Models) */}
            {(service.supportedBrands || service.supportedModels) && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-sans">Supported Brands & Models</h3>
                    <p className="text-xs text-slate-500">We maintain dedicated micro-soldering jigs and genuine parts for these phones.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                  {service.supportedBrands && service.supportedBrands.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supported Brands</span>
                      <div className="flex flex-wrap gap-2">
                        {service.supportedBrands.map((b, i) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {service.supportedModels && service.supportedModels.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Popular Models</span>
                      <ul className="space-y-2">
                        {service.supportedModels.map((m, i) => (
                          <li key={i} className="flex gap-2 text-xs sm:text-sm text-slate-600 font-medium items-center">
                            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* F. Model-wise Pricing Table */}
            {service.modelPrices && service.modelPrices.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-sans">Model-wise Starting Prices</h3>
                    <p className="text-xs text-slate-500">Estimated cost based on model complexity and screen technology.</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                    Transparent Pricing
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="px-4 py-3">Device Model</th>
                        <th className="px-4 py-3 text-right">Estimated Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {service.modelPrices.map((mp, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{mp.model}</td>
                          <td className="px-4 py-3 text-right font-black text-[#0284C7]">{mp.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* G. Related Repair Photos & Videos */}
            {!loadingMedia && (gallery.length > 0 || videos.length > 0) && (
              <div className="space-y-6 pt-2">
                {gallery.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-lg font-sans">Live Repair Work Bench Photos</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {gallery.map(g => (
                        <div key={g.id} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img src={g.imageUrl} alt={g.altText} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {videos.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-lg font-sans flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-rose-500" />
                      Related Repair Videos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videos.map(v => (
                        <div key={v.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                          <div className="aspect-video rounded-lg bg-slate-900 overflow-hidden relative flex items-center justify-center">
                            {v.thumbnailUrl ? (
                              <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                            ) : (
                              <PlayCircle className="w-10 h-10 text-white/70" />
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{v.title}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* H. Service FAQs */}
            {service.faqs && service.faqs.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <h3 className="font-extrabold text-slate-900 text-lg font-sans">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {service.faqs.map((faq, i) => (
                    <div key={i} className="space-y-1.5 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <h4 className="font-bold text-slate-800 text-sm flex items-start gap-2">
                        <span className="text-[#0284C7] shrink-0 mt-0.5">Q:</span>
                        {faq.question}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 pl-5 leading-relaxed">
                        <span className="text-slate-400 font-bold mr-1.5">A:</span>
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT 4 COLUMNS: Sticky Booking & Estimate Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 space-y-6 sticky top-20">
              
              {/* Brand & Model Selector Box */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Select Your Phone Model for Exact Price:
                </span>
                
                <div className="space-y-2">
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setSelectedModel('');
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="">-- All Brands --</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="">-- Select Specific Model --</option>
                    {models
                      .filter(m => !selectedBrand || m.brand.toLowerCase() === selectedBrand.toLowerCase())
                      .map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Price Display */}
              <div className="border-b border-slate-100 pb-5 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Estimated Repair Cost
                </span>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#0284C7] font-sans">
                    {priceResult.formattedPrice}
                  </span>
                </div>

                {priceResult.isModelOverride && (
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block border border-emerald-100">
                    Model-specific price for {selectedModel}
                  </div>
                )}

                {priceResult.notes && (
                  <p className="text-[11px] text-slate-600 bg-amber-50 p-2 rounded-lg border border-amber-100 font-medium">
                    {priceResult.notes}
                  </p>
                )}

                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  100% upfront quote. If any secondary defect is detected, we notify you before work starts.
                </p>
              </div>

              {/* Duration & Warranty Specs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Duration</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                    <Clock className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span className="truncate">{service.estimatedTime || '30-60 Mins'}</span>
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Warranty</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{service.warranty || 'Testing'}</span>
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={() => onNavigate(`book-repair?service=${service.slug}${selectedModel ? `&model=${encodeURIComponent(selectedModel)}` : ''}`)}
                  className="w-full py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  BOOK REPAIR NOW
                </button>
                
                <a
                  href={formattedWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  WHATSAPP ENQUIRY
                </a>

                <a
                  href={`tel:${contact.phone}`}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-slate-500" />
                  Call Saddam: {contact.phone}
                </a>
              </div>

              {/* Important Note Card */}
              {service.importantNotes ? (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Important Note:</span> 
                    {service.importantNotes}
                  </div>
                </div>
              ) : (
                <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 text-xs text-sky-900 leading-relaxed flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Walk-In Lab in Purulia:</span> 
                    No courier shipping needed. Walk directly into our Hattola More branch for live repair.
                  </div>
                </div>
              )}

              {/* Lab Location */}
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 text-xs text-sky-400 font-bold">
                  <MapPin className="w-4 h-4" />
                  <span>MOBO SAVIOR Purulia</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {contact.address}
                </p>
                <a
                  href={contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all inline-block"
                >
                  Open in Google Maps
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* 4. Related Services Section */}
        {relatedServices.length > 0 && (
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-2xl font-black text-slate-900 font-sans tracking-tight">Related Repair Services</h3>
                <p className="text-xs text-slate-500">Explore complementary repair procedures performed at our lab.</p>
              </div>
              <button
                onClick={() => onNavigate('services')}
                className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                View All Services <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map(rel => (
                <div 
                  key={rel.id} 
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                    <img 
                      src={getServiceImage(rel)} 
                      alt={rel.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                      {rel.category}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-slate-900 text-base font-sans group-hover:text-[#0284C7] transition-colors">
                        {rel.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {rel.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Starting</span>
                        <span className="text-sm font-black text-[#0284C7]">
                          {rel.price ? `₹${rel.price}` : 'On Inspection'}
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigate(`services/${rel.slug}`)}
                        className="px-4 py-2 bg-slate-100 hover:bg-[#0284C7] hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                      >
                        View Page <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
