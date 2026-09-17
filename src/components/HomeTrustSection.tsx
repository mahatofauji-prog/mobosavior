import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { TrustPoint, ContactSettings } from '../types';
import { renderTrustIcon } from '../utils/offerHelpers';
import { DEFAULT_TRUST_POINTS } from '../firebase/seed';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  MessageSquare, 
  Calendar, 
  Sparkles, 
  Wrench, 
  ShieldCheck, 
  Award, 
  Clock, 
  Users 
} from 'lucide-react';

interface HomeTrustSectionProps {
  onNavigate?: (route: string) => void;
  contact?: ContactSettings;
}

// Interfaces for our dynamic custom configurability
interface TrustConfig {
  sectionHeading?: string;
  sectionLabel?: string;
  sectionDescription?: string;
  mainImageUrl?: string;
  highlightItems?: string[];
  ctaHeading?: string;
  ctaDescription?: string;
  ctaBookText?: string;
  ctaWhatsappText?: string;
  // stats
  showStats?: boolean;
  statRepairsCompleted?: string;
  statYearsExperience?: string;
  statServicesAvailable?: string;
  statCustomerReviews?: string;
}

// Fallback configuration
const DEFAULT_TRUST_CONFIG: TrustConfig = {
  sectionHeading: "WHY CHOOSE MOBO SAVIOR?",
  sectionLabel: "THE MOBO SAVIOR ADVANTAGE",
  sectionDescription: "Professional mobile repair backed by advanced diagnostic equipment, skilled technicians, quality-focused parts and transparent service.",
  mainImageUrl: "/assets/images/why_choose_mobo_savior.png",
  highlightItems: [
    "Advanced Diagnostics",
    "Chip-Level Repair",
    "Quality-Focused Parts",
    "Transparent Service"
  ],
  ctaHeading: "Need a Professional Diagnosis?",
  ctaDescription: "Bring your device to MOBO SAVIOR for proper inspection and repair guidance.",
  ctaBookText: "Book a Repair",
  ctaWhatsappText: "WhatsApp Now",
  showStats: false,
  statRepairsCompleted: "",
  statYearsExperience: "",
  statServicesAvailable: "",
  statCustomerReviews: ""
};

// Premium descriptions fallback
const PREMIUM_REPLACE_DESCRIPTIONS: Record<string, string> = {
  "Experienced Technician": "Experienced professionals handling mobile repair and diagnosis.",
  "Professional Tools": "Professional equipment for accurate diagnosis and repair.",
  "Quality Parts": "Quality-focused replacement components selected for reliable performance.",
  "Warranty Available": "Applicable repairs can include warranty coverage with clear terms.",
  "Transparent Pricing": "Clear pricing/diagnosis before repair where applicable.",
  "Customer Satisfaction": "Focused on reliable service, clear communication and customer care.",
  "Advanced Repairing": "Specialized motherboard, IC, CPU and chip-level repair capabilities.",
  "Android & iPhone Specialist": "Support for major Android and iPhone repair requirements.",
  "Money Return Policy": "Applicable on eligible motherboard repair cases.",
  "No Repair Without Customer Approval": "We diagnose first and get customer approval before starting any repair or additional work."
};

export default function HomeTrustSection({ onNavigate, contact: propContact }: HomeTrustSectionProps) {
  const [items, setItems] = useState<TrustPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<ContactSettings | null>(propContact || null);
  const [config, setConfig] = useState<TrustConfig>(DEFAULT_TRUST_CONFIG);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch custom configuration from settings
      try {
        const configDocRef = doc(db, 'settings', 'trust_config');
        const configSnap = await getDoc(configDocRef);
        if (configSnap.exists()) {
          setConfig({ ...DEFAULT_TRUST_CONFIG, ...configSnap.data() });
        }
      } catch (err) {
        // Offline or connection error - fallback gracefully to default config
        setConfig(DEFAULT_TRUST_CONFIG);
      }

      // 2. Fetch contact info if not provided via props
      if (!propContact) {
        try {
          const contactDocRef = doc(db, 'settings', 'contact');
          const contactSnap = await getDoc(contactDocRef);
          if (contactSnap.exists()) {
            setContact(contactSnap.data() as ContactSettings);
          }
        } catch (err) {
          // Offline fallback
        }
      } else {
        setContact(propContact);
      }

      // 3. Fetch active trust points
      try {
        const q = query(collection(db, 'trust_points'), orderBy('displayOrder', 'asc'));
        const snap = await getDocs(q);
        const fetched: TrustPoint[] = [];
        snap.forEach(docSnap => {
          const data = docSnap.data();
          if (data.isActive !== false) {
            fetched.push({ id: docSnap.id, ...data } as TrustPoint);
          }
        });

        if (fetched.length > 0) {
          const missingDefaults = DEFAULT_TRUST_POINTS.filter(
            def => !fetched.some(f => f.id === def.id || f.title.toLowerCase() === def.title.toLowerCase())
          );
          setItems([...fetched, ...missingDefaults]);
        } else {
          setItems(DEFAULT_TRUST_POINTS);
        }
      } catch (err) {
        // Offline or network error fallback
        setItems(DEFAULT_TRUST_POINTS);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [propContact]);

  // Fallback to static numbers if not available in prop or firebase
  const cleanWhatsapp = (contact?.whatsapp || '081675 49092').replace(/\D/g, '');
  const cleanPhone = (contact?.phone || '081675 49092').replace(/\D/g, '');

  const whatsappMessage = encodeURIComponent(
    "Hello MOBO SAVIOR, I want to bring my mobile device for inspection. Please provide repair guidance."
  );
  const whatsappLink = `https://wa.me/91${cleanWhatsapp}?text=${whatsappMessage}`;

  const activeItems = items
    .filter(item => item.isActive !== false)
    .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

  // Determine if statistical metrics are fully loaded and enabled in DB
  const hasStats = 
    config.showStats && 
    (config.statRepairsCompleted || 
     config.statYearsExperience || 
     config.statServicesAvailable || 
     config.statCustomerReviews);

  return (
    <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-200/80 relative overflow-hidden" id="why-choose-mobo-savior">
      {/* Decorative architectural layout detail */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION HEADER - Left-aligned for high-end look */}
        <div className="max-w-3xl text-left space-y-3">
          <span className="px-3 py-1 bg-sky-500/10 text-[#0284C7] border border-sky-500/10 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#0284C7] animate-pulse" />
            {config.sectionLabel || "THE MOBO SAVIOR ADVANTAGE"}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-sans">
            {config.sectionHeading || "WHY CHOOSE MOBO SAVIOR?"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {config.sectionDescription || "Professional mobile repair backed by advanced diagnostic equipment, skilled technicians, quality-focused parts and transparent service."}
          </p>
        </div>

        {/* MAIN VISUAL LAYOUT - Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Professional Workbench Showcase Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative bg-white p-3 rounded-[24px] border border-slate-200/60 shadow-md overflow-hidden group">
              {/* Image Frame */}
              <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[4/5] rounded-[18px] overflow-hidden bg-slate-100">
                <img
                  src={config.mainImageUrl || "/assets/images/why_choose_mobo_savior.png"}
                  alt="Professional Mobile Repair Workbench"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to high-spec micro-soldering workstation if local image fails
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1597740985671-2a8a3b80f02e?auto=format&fit=crop&q=80&w=800";
                  }}
                />
                
                {/* Visual Glassmorphic Overlay Over Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-900/10" />
                
                {/* Live Diagnostic Bench Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur text-white text-[9px] font-bold rounded-lg border border-white/10 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>BENCH ACTIVE • PURULIA LAB</span>
                </div>
              </div>

              {/* Lab metadata info block beneath the photo */}
              <div className="p-4 text-left space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 font-sans">
                  Saddam Bhai's Specialized Hardware Workstation
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every device undergoes high-magnification stereoscopic examination and multi-channel heat diagnostic mapping before surgical board level micro-soldering begins.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 2-Column Compact Trust Features */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="grid grid-cols-2 gap-2.5 xs:gap-3.5 sm:gap-6">
              {activeItems.map((item) => {
                // Map to premium descriptive text if user hasn't customized it to override the default brief seeds
                const matchedDesc = PREMIUM_REPLACE_DESCRIPTIONS[item.title];
                const displayDesc = matchedDesc || item.description;

                return (
                  <div 
                    key={item.id} 
                    className="flex flex-col xs:flex-row gap-2 xs:gap-3 p-2 xs:p-2.5 bg-white/60 sm:bg-transparent rounded-xl sm:rounded-2xl transition-all duration-300 border border-slate-100 sm:border-transparent hover:border-slate-200"
                  >
                    {/* Compact Icon Badge */}
                    <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-sky-500/10 flex items-center justify-center text-[#0284C7] border border-sky-500/10 flex-shrink-0">
                      {renderTrustIcon(item.icon, "w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0284C7]")}
                    </div>
                    
                    {/* Text block */}
                    <div className="space-y-0.5 sm:space-y-1">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 font-sans leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 leading-snug sm:leading-relaxed font-normal">
                        {displayDesc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* TRUST HIGHLIGHT STRIP */}
        {config.highlightItems && config.highlightItems.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y-0 md:divide-x divide-slate-100 text-center">
              {config.highlightItems.slice(0, 4).map((highlight, index) => (
                <div key={index} className="flex items-center justify-center gap-2 px-2 py-1">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
                  <span className="text-xs font-black text-slate-800 tracking-tight">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPTIONAL STATS GRID (Only rendered if configured by admin) */}
        {hasStats && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {config.statRepairsCompleted && (
                <div className="space-y-1 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-sky-400 font-sans">
                    {config.statRepairsCompleted}
                  </div>
                  <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    Repairs Completed
                  </div>
                </div>
              )}
              {config.statYearsExperience && (
                <div className="space-y-1 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-sky-400 font-sans">
                    {config.statYearsExperience}
                  </div>
                  <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    Years Experience
                  </div>
                </div>
              )}
              {config.statServicesAvailable && (
                <div className="space-y-1 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-sky-400 font-sans">
                    {config.statServicesAvailable}
                  </div>
                  <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    Services Offered
                  </div>
                </div>
              )}
              {config.statCustomerReviews && (
                <div className="space-y-1 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-sky-400 font-sans">
                    {config.statCustomerReviews}
                  </div>
                  <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    5-Star Reviews
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA CARD BLOCK - Action trigger */}
        <div className="bg-sky-50 rounded-[28px] p-6 sm:p-10 border border-sky-150 text-center max-w-4xl mx-auto space-y-6">
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-sans">
              {config.ctaHeading || "Need a Professional Diagnosis?"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {config.ctaDescription || "Bring your device to MOBO SAVIOR for proper inspection and repair guidance."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigate && onNavigate('book-repair')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl shadow-md transition-all uppercase tracking-wider"
            >
              {config.ctaBookText || "Book a Repair"}
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
              <span>{config.ctaWhatsappText || "WhatsApp Now"}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
