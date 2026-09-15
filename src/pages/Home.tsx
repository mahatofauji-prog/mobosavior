import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Service, Review, FAQItem, WebsiteContent, ContactSettings, SlideItem, GalleryItem, VideoItem, ServiceCategory, Branch, WebsiteSection } from '../types';
import { isSectionVisible } from '../utils/sectionSettings';
import { Smartphone, Wrench, Cpu, ShieldCheck, ArrowRight, MessageSquare, MapPin, Star, Calendar, Sparkles, Navigation, Clock, ShieldAlert, Eye, X, Play, Camera, Video, Loader2, TabletSmartphone, Terminal, Layers, CheckCircle2, Zap, ChevronDown, Facebook, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getServiceImage, normalizeImageUrl } from '../utils/serviceImages';
import { ALL_COMPREHENSIVE_SERVICES } from '../data/servicesData';
import { DEFAULT_CATEGORIES } from '../data/modelsData';
import HomeGalleryPreview from '../components/HomeGalleryPreview';
import HomeReviewsSection from '../components/HomeReviewsSection';
import HomeTrustSection from '../components/HomeTrustSection';
import HomeOffersSection from '../components/HomeOffersSection';
import HomeLocationsSection from '../components/HomeLocationsSection';
import WhatsAppChannelCTA from '../components/WhatsAppChannelCTA';
import SEOHead from '../components/SEOHead';
import { trackWhatsAppClick, trackPhoneCallClick, trackDirectionsClick, trackBookRepairClick } from '../lib/analytics';

const DEFAULT_FALLBACK_SLIDES: SlideItem[] = [
  { id: 'slide-1', imageUrl: '/assets/images/slide_iphone_1788168033319.jpg', title: 'iPhone Repair Expert', active: true, displayOrder: 1 },
  { id: 'slide-2', imageUrl: '/assets/images/slide_android_1788168049303.jpg', title: 'Android Repair Expert', active: true, displayOrder: 2 },
  { id: 'slide-3', imageUrl: '/assets/images/slide_display_1788168074454.jpg', title: 'Display Screen Replacement', active: true, displayOrder: 3 },
  { id: 'slide-4', imageUrl: '/assets/images/slide_battery_1788168089885.jpg', title: 'Certified Battery Replacement', active: true, displayOrder: 4 },
  { id: 'slide-5', imageUrl: '/assets/images/slide_deadphone_1788168106265.jpg', title: 'Dead Phone Restoration', active: true, displayOrder: 5 },
  { id: 'slide-6', imageUrl: '/assets/images/slide_chargeport_1788168121909.jpg', title: 'USB-C Charging Port Soldering', active: true, displayOrder: 6 },
  { id: 'slide-7', imageUrl: '/assets/images/slide_network_1788168142613.jpg', title: 'Network & Signal IC Repair', active: true, displayOrder: 7 },
  { id: 'slide-8', imageUrl: '/assets/images/slide_cpuic_1788168157704.jpg', title: 'CPU & IC Level Micro-Soldering', active: true, displayOrder: 8 },
  { id: 'slide-9', imageUrl: '/assets/images/slide_flip_1788168172190.jpg', title: 'Premium Flip Phone Restoration', active: true, displayOrder: 9 },
  { id: 'slide-10', imageUrl: '/assets/images/slide_foldable_1788168190438.jpg', title: 'Flexible Foldable Screen Service', active: true, displayOrder: 10 }
];

export interface SpecializedCategoryConfig {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  badge: string;
  image: string;
  description: string;
  highlights: string[];
  serviceSlugs: string[];
}

export const SPECIALIZED_REPAIR_SECTIONS: SpecializedCategoryConfig[] = [
  {
    id: 'iphone-repair',
    title: 'iPhone Repair',
    subtitle: 'Apple Diagnostic & Logic Board Lab',
    route: 'iphone-repair',
    badge: 'Apple Specialist',
    image: '/assets/images/service_iphone_repair_1788169632215.jpg',
    description: 'Precision servicing for iPhone 11 through iPhone 16 Pro Max. Certified TrueTone calibration, original battery health preservation, Face ID sensor restoration, and dual-layer motherboard micro-soldering.',
    highlights: [
      'Original OLED / Retina Screen with TrueTone Transfer',
      'Battery Health Optimization & Cycle Diagnostics',
      'Face ID TrueDepth Micro-Jumper Alignment',
      'Water Damage Ultrasonic Recovery'
    ],
    serviceSlugs: ['iphone-repair', 'iphone-display-replacement', 'battery-replacement', 'water-damage-repair']
  },
  {
    id: 'android-repair',
    title: 'Android Repair',
    subtitle: 'Comprehensive Servicing for All Major Android Brands',
    route: 'android-repair',
    badge: 'Multi-Brand Android',
    image: '/assets/images/service_android_repair_1788169651786.jpg',
    description: 'Complete hardware solutions for Samsung Galaxy, OnePlus, Xiaomi, Vivo, Oppo, Realme, and Google Pixel. High-spec AMOLED panels, sub-board charging repairs, and network signal restoration.',
    highlights: [
      'Samsung Dynamic AMOLED & Curved Displays',
      'OnePlus & Xiaomi Fast Warp / SuperVOOC Port Repair',
      'Network Signal & Baseband IC Replacement',
      'High-Capacity Lithium-Ion Battery Cells'
    ],
    serviceSlugs: ['android-repair', 'charging-port-repair', 'network-repair', 'battery-replacement']
  },
  {
    id: 'motherboard-repair',
    title: 'Motherboard & Chip-Level Repair',
    subtitle: 'Micro-Soldering, CPU Reballing & Logic Board Recovery',
    route: 'motherboard-repair',
    badge: 'Level 4 Micro-Soldering',
    image: '/assets/images/service_motherboard_1788169670691.jpg',
    description: 'Purulia\'s advanced workstation equipped with 7X-45X stereoscopic microscope, ShortCam II thermal detection, and computerized BGA stencils. Specialized in reviving completely dead phones and reboot loops.',
    highlights: [
      'Poco X3 / X3 Pro CPU & RAM Micro-Reballing',
      'Dead Phone Power Rail & Short-Circuit Tracing',
      'eMMC / UFS Storage Memory Re-Programming',
      'PMIC Power Management IC Chip Replacement'
    ],
    serviceSlugs: ['motherboard-repair', 'poco-motherboard-repair', 'dead-phone-repair', 'cpu-reballing']
  },
  {
    id: 'flip-fold-repair',
    title: 'Flip & Fold Repair',
    subtitle: 'Engineering for Flexible & Foldable Screens',
    route: 'flip-fold-repair',
    badge: 'Foldable Engineering',
    image: '/assets/images/service_flip_fold_1788169730419.jpg',
    description: 'Expert mechanical and display servicing for Samsung Galaxy Z Fold, Z Flip, and Motorola Razr. Crease alignment, hinge debris clearance, flexible OLED ribbon restoration, and ultra-thin glass replacement.',
    highlights: [
      'Galaxy Z Fold & Z Flip Screen Servicing',
      'Hinge Dust Clearance & Gear Realignment',
      'Flexible OLED Flex Ribbon Restoration',
      'Ultra-Thin Glass (UTG) Surface Restoration'
    ],
    serviceSlugs: ['flip-fold-repair', 'curved-display-repair', 'green-line-repair', 'oled-display-repair']
  },
  {
    id: 'display-replacement',
    title: 'Display Replacement',
    subtitle: 'Original OLED, AMOLED & Glass Refurbishing',
    route: 'display-replacement',
    badge: 'Display Center',
    image: '/assets/images/service_display_replace_1788169768652.jpg',
    description: 'Restore vivid color accuracy and 120Hz touch response. Specializing in factory-grade OLED & AMOLED panels, laser green line healing, touch IC replacement, and dust-free OCA glass lamination.',
    highlights: [
      'Original OLED & 120Hz Super AMOLED Panels',
      'Display Green / Pink Line Laser Repair',
      'OCA Vacuum Bubble-Free Glass Lamination',
      'Zero Touch Lag & High Refresh Rate Guaranteed'
    ],
    serviceSlugs: ['display-replacement', 'oled-display-repair', 'green-line-repair', 'touch-problem-repair']
  }
];

interface HomeProps {
  onNavigate: (route: string) => void;
  categories?: ServiceCategory[];
  services: Service[];
  reviews: Review[];
  content: WebsiteContent;
  contact: ContactSettings;
  slides?: SlideItem[];
  branches?: Branch[];
  websiteSections?: WebsiteSection[];
}

export default function Home({ onNavigate, services, reviews, content, contact, slides = [], categories = [], branches = [], websiteSections }: HomeProps) {
  const featuredServices = services.filter(s => s.active && s.featured !== false);
  const featuredReviews = reviews.filter(r => r.active && r.featured).slice(0, 3);

  // Dynamic Categories from props or default fallback
  const displayCategories = (categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES)
    .filter(c => c.active !== false)
    .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

  const activeSlides = slides.filter(s => s.active);
  const slideshowItems = activeSlides.length > 0 ? activeSlides : DEFAULT_FALLBACK_SLIDES;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('iphone-repair');
  const [activeDiffIndex, setActiveDiffIndex] = useState(0);

  // Helper to resolve services for a category
  const getCategoryServices = (slugs: string[]): Service[] => {
    return slugs.map(slug => {
      const fromDb = services.find(s => s.slug === slug || s.id === slug || s.id === `srv-${slug}`);
      if (fromDb) return fromDb;
      const fromFallback = ALL_COMPREHENSIVE_SERVICES.find(s => s.slug === slug || s.id === slug || s.id === `srv-${slug}`);
      return fromFallback || null;
    }).filter((s): s is Service => s !== null);
  };

  // States for dynamic media showcase
  const [activePhotos, setActivePhotos] = useState<GalleryItem[]>([]);
  const [activeVideos, setActiveVideos] = useState<VideoItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);

  // States for interactive photo/video modal overlays
  const [isPhotosViewerOpen, setIsPhotosViewerOpen] = useState(false);
  const [isVideosViewerOpen, setIsVideosViewerOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const [galleryRes, videosRes] = await Promise.allSettled([
          getDocs(query(collection(db, 'gallery'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'videos'), orderBy('displayOrder', 'asc')))
        ]);

        if (galleryRes.status === 'fulfilled') {
          const fetchedPhotos: GalleryItem[] = [];
          galleryRes.value.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.active !== false) {
              fetchedPhotos.push({ id: docSnap.id, ...data } as GalleryItem);
            }
          });
          setActivePhotos(fetchedPhotos);
        }

        const fetchedVideos: VideoItem[] = [];
        if (videosRes.status === 'fulfilled') {
          videosRes.value.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.active !== false) {
              fetchedVideos.push({ id: docSnap.id, ...data } as VideoItem);
            }
          });
        }
        if (galleryRes.status === 'fulfilled') {
          galleryRes.value.forEach((docSnap) => {
            const data = docSnap.data();
            if ((data.mediaType === 'video' || data.videoUrl) && data.active !== false) {
              if (!fetchedVideos.some(v => v.id === docSnap.id || v.videoUrl === data.videoUrl)) {
                fetchedVideos.push({
                  id: docSnap.id,
                  videoUrl: data.videoUrl,
                  title: data.title,
                  description: data.description,
                  category: data.category || 'General',
                  featured: data.featured,
                  displayOrder: data.displayOrder || 99,
                  createdAt: data.createdAt
                } as VideoItem);
              }
            }
          });
        }
        setActiveVideos(fetchedVideos);
      } catch (err) {
        console.error('Error fetching showcase media:', err);
      } finally {
        setLoadingMedia(false);
      }
    }
    fetchMedia();
  }, []);

  // Helpers to safely extract media previews
  const getYoutubeEmbed = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  const getYoutubeThumb = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=600';
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('embed/')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
      }
    }
    return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600';
  };

  const firstPhotoUrl = activePhotos.length > 0 ? activePhotos[0].imageUrl : '';
  const firstVideoThumbnailUrl = activeVideos.length > 0 ? getYoutubeThumb(activeVideos[0].videoUrl) : '';

  useEffect(() => {
    if (slideshowItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prevIndex => (prevIndex + 1) % slideshowItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slideshowItems.length]);

  const formattedWhatsappLink = `https://wa.me/91${contact.whatsapp.replace(/\s+/g, '')}?text=Hello%20MOBO%20SAVIOR,%20I%20want%20to%20enquire%20about%20mobile%20repair%20service.`;

  // Helper to map dynamic string representation to Lucide icon components
  const renderWhyIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-[#0284C7]" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-[#0284C7]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#0284C7]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-[#0284C7]" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0284C7]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#0284C7]" />;
      case 'Layers': return <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-[#0284C7]" />;
      case 'Wrench': return <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-[#0284C7]" />;
      default: return <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-[#0284C7]" />;
    }
  };

  return (
    <div className="flex flex-col pb-16">
      {/* 1. Premium Hero Section */}
      {isSectionVisible(websiteSections, 'home', 'hero') && (
        <section 
          className="relative w-full aspect-[16/9] overflow-hidden bg-slate-950 text-white flex items-center select-none" 
          id="premium-hero-16-9"
        >
        {/* Animated Background Slideshow */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {slideshowItems.map((slide, idx) => (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: idx === currentSlideIndex ? 1 : 0 }}
            >
              <img
                src={normalizeImageUrl(slide.imageUrl)}
                alt={slide.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
          {/* Subtle soft-blue/dark tint gradient overlay for pristine readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-sky-950/45" />
          {/* Subtle horizontal grid overlay for a high-tech lab aesthetic */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3vw_3vw] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-20" />
        </div>

        <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 grid grid-cols-12 gap-3 sm:gap-6 md:gap-8 items-end pb-3 xs:pb-4 sm:pb-8 md:pb-12 lg:pb-16">
          
          {/* Left Column: Text Stack & Compact Dynamic Actions */}
          <div className="col-span-12 md:col-span-11 lg:col-span-9 flex flex-col justify-center space-y-1.5 sm:space-y-3 md:space-y-4 lg:space-y-6 text-left max-w-3xl lg:max-w-4xl">
            
            {/* Tagline micro-capsule */}
            <div className="inline-flex self-start items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-sky-500/15 border border-sky-400/30 text-sky-300 rounded-full select-none text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              <span>Motherboard IC & CPU Reballing Specialists</span>
            </div>

            {/* Title with fluid scaling */}
            <h1 className="text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black tracking-tight text-white leading-[1.1] font-sans">
              {content.heroTitle || 'Expert Mobile Repair in Purulia'}
            </h1>
            
            {/* Description - expanded width for elegant widescreen layout */}
            <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-300 leading-normal sm:leading-relaxed font-medium max-w-[95%] sm:max-w-[85%] md:max-w-[75%] line-clamp-2 xs:line-clamp-3 sm:line-clamp-none">
              {content.heroDescription || 'Professional iPhone & Android repair services, from display and battery replacements to advanced CPU / IC level board repairs.'}
            </p>

            {/* Quick stats grid: Hidden on small mobiles, fully visible on md screens */}
            <div className="hidden md:grid grid-cols-3 gap-2.5 max-w-lg pt-1">
              <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-extrabold text-slate-100 leading-none">Genuine Parts</span>
                  <span className="text-[8px] text-slate-400">Premium Grade</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-extrabold text-slate-100 leading-none">Express Repair</span>
                  <span className="text-[8px] text-slate-400">Same Day Option</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800 shadow-sm">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-extrabold text-slate-100 leading-none">All Brands</span>
                  <span className="text-[8px] text-slate-400">iOS & Android</span>
                </div>
              </div>
            </div>

            {/* Smart Micro CTAs */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 pt-1.5 sm:pt-3">
              <button
                onClick={() => onNavigate('book-repair')}
                className="px-2 py-1 sm:px-4 sm:py-2.5 md:px-5 md:py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-black rounded-md sm:rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 select-none focus:outline-none"
              >
                <Calendar className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                <span>{content.ctaText || 'BOOK A REPAIR'}</span>
              </button>
              
              <a
                href={formattedWhatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 sm:px-4 sm:py-2.5 md:px-5 md:py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] xs:text-[9px] sm:text-xs md:text-sm font-bold rounded-md sm:rounded-xl shadow transition-all flex items-center justify-center gap-1 select-none"
              >
                <MessageSquare className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                <span>WHATSAPP</span>
              </a>

              <a
                href={contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 sm:px-3 sm:py-2.5 md:px-4 md:py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-[8px] xs:text-[9px] sm:text-xs font-bold rounded-md sm:rounded-xl transition-all inline-flex items-center justify-center gap-1 select-none"
                title="Get Directions on Google Maps"
              >
                <Navigation className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-sky-400" />
                <span>DIRECTIONS</span>
              </a>
            </div>
          </div>
          
        </div>
      </section>
      )}

      {/* 2. Brand Value Pitch / Experience section */}
      {isSectionVisible(websiteSections, 'home', 'why_choose_us') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 !mt-1 xs:!mt-1.5 sm:!mt-2 md:!mt-3">
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <span className="text-[9px] xs:text-[9.5px] sm:text-[10px] font-extrabold tracking-[0.15em] sm:tracking-widest text-[#0284C7] uppercase">The Premium Standard</span>
          
          <div className="w-full max-w-4xl mx-auto px-1 sm:px-2 flex justify-center items-center my-0.5">
            <h2 className="w-full max-w-full block" aria-label="How We Different From Standard Local Shops">
              <svg 
                viewBox="0 0 740 44" 
                className="w-full h-auto max-w-full block overflow-visible select-none"
                style={{ filter: 'drop-shadow(0px 2px 8px rgba(6, 182, 212, 0.30))' }}
              >
                <defs>
                  <linearGradient id="headingGradientMobo" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284C7" />
                    <stop offset="45%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#0284C7" />
                  </linearGradient>
                </defs>
                <text 
                  x="50%" 
                  y="50%" 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  fill="url(#headingGradientMobo)" 
                  className="font-sans font-black text-[35px]" 
                  letterSpacing="-0.6px"
                >
                  How We Different From Standard Local Shops
                </text>
              </svg>
            </h2>
          </div>

          <p className="text-[15px] xs:text-[16px] sm:text-[18px] md:text-[20px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Most shops only replace full boards or fit cheap copy screens. We utilize microscopic instruments to repair individual components, saving you money and protecting your original devices.
          </p>

          {/* 4 Feature Badges Pill Strip */}
          <div className="grid grid-cols-2 xs:flex xs:flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2">
            {[
              'Advanced Diagnostics',
              'Chip-Level Repair',
              'Quality-Focused Parts',
              'Transparent Service'
            ].map((badge, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-sky-50/90 border border-sky-100 rounded-full text-[10px] sm:text-xs font-bold text-[#0284C7] shadow-2xs"
              >
                <Zap className="w-3 h-3 text-[#06B6D4]" />
                <span>{badge}</span>
              </div>
            ))}
          </div>

          {/* Premium Social Channels & View Work CTA Option Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 pt-2 select-none">
            {/* Facebook Colorful Button */}
            <a
              href={contact.facebook || 'https://www.facebook.com/share/19aL5sjb28/'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-black rounded-xl shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:shadow-[0_6px_16px_rgba(24,119,242,0.35)] hover:-translate-y-0.5 transition-all active:scale-95 duration-200"
            >
              <Facebook className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </a>

            {/* Instagram Colorful Button with Premium Gradient */}
            <a
              href={contact.instagram || 'https://www.instagram.com/saddam617technical?stkn=MWh2MXNnZjZwNXI5MQ=='}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white text-xs font-black rounded-xl shadow-[0_4px_12px_rgba(238,42,123,0.25)] hover:shadow-[0_6px_16px_rgba(238,42,123,0.35)] hover:-translate-y-0.5 transition-all active:scale-95 duration-200"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>

            {/* View Work Interactive Button to open photo & video gallery */}
            <button
              onClick={() => onNavigate('gallery')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl shadow-[0_4px_12px_rgba(2,132,199,0.25)] hover:shadow-[0_6px_16px_rgba(2,132,199,0.35)] hover:-translate-y-0.5 transition-all active:scale-95 duration-200"
            >
              <Eye className="w-3.5 h-3.5 text-white" />
              <span>View Work</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid on ALL devices & screens */}
        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-5 md:gap-6 mt-6 sm:mt-10">
          {[
            {
              title: 'Experienced Technician',
              description: 'Experienced professionals handling mobile repair and diagnosis.',
              icon: 'Wrench',
              image: '/assets/images/differ_micro_soldering_1788169185732.jpg'
            },
            {
              title: 'Professional Tools',
              description: 'Professional equipment for accurate diagnosis and repair.',
              icon: 'Cpu',
              image: '/assets/images/differ_thermal_inspection_1788169210295.jpg'
            },
            {
              title: 'Quality Parts',
              description: 'Quality-focused replacement components selected for reliable performance.',
              icon: 'ShieldCheck',
              image: '/assets/images/differ_premium_parts_1788169251946.jpg'
            },
            {
              title: 'Warranty Available',
              description: 'Applicable repairs can include warranty coverage with clear terms.',
              icon: 'ShieldAlert',
              image: '/assets/images/differ_diagnostic_bench_1788169232321.jpg'
            },
            {
              title: 'Transparent Pricing',
              description: 'Clear pricing/diagnosis before repair where applicable.',
              icon: 'CheckCircle2',
              image: '/assets/images/slide_iphone_1788168033319.jpg'
            },
            {
              title: 'Customer Satisfaction',
              description: 'Focused on reliable service, clear communication and customer care.',
              icon: 'Sparkles',
              image: '/assets/images/slide_android_1788168049303.jpg'
            },
            {
              title: 'Advanced Repairing',
              description: 'Specialized motherboard, IC, CPU and chip-level repair capabilities.',
              icon: 'Layers',
              image: '/assets/images/slide_cpuic_1788168157704.jpg'
            },
            {
              title: 'Android & iPhone Specialist',
              description: 'Support for major Android and iPhone repair requirements.',
              icon: 'Smartphone',
              image: '/assets/images/slide_display_1788168074454.jpg'
            }
          ].map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition-all flex flex-col overflow-hidden text-left group"
            >
              {/* Elegant compact style card image banner */}
              <div className="h-14 xs:h-18 sm:h-28 md:h-36 w-full overflow-hidden bg-slate-100 relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/15 via-transparent to-transparent" />
              </div>
              
              {/* Compact Content block */}
              <div className="p-2.5 xs:p-3 sm:p-4 flex-grow flex flex-col justify-between space-y-1.5 sm:space-y-3">
                <div className="space-y-1 sm:space-y-2">
                  <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 bg-sky-50 rounded-lg sm:rounded-xl flex items-center justify-center border border-sky-100 group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
                    <span className="scale-75 sm:scale-100">
                      {renderWhyIcon(item.icon)}
                    </span>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <h3 className="font-extrabold text-slate-800 text-[11px] xs:text-xs sm:text-sm font-sans line-clamp-1">{item.title}</h3>
                    <p className="text-[9.5px] xs:text-[10.5px] sm:text-xs text-slate-500 leading-normal font-medium line-clamp-2 xs:line-clamp-3 sm:line-clamp-none">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Trust & Guarantees Section */}
      {isSectionVisible(websiteSections, 'home', 'why_choose_us') && (
        <div className="mt-16 sm:mt-20">
          <HomeTrustSection onNavigate={onNavigate} contact={contact} />
        </div>
      )}

      {/* 2.5 Specialized Repair Services - Card Grid */}
      {isSectionVisible(websiteSections, 'home', 'specialized_services') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20" id="specialized-repair-services">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 text-left">
          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-widest text-[#0284C7] uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-100 inline-block">
              ADVANCED BENCH DOMAINS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 font-sans">
              Specialized Repair Services
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl font-medium">
              We operate dedicated precision repair hubs equipped with digital microscopes, thermal imaging cameras, and component-level micro-soldering workstations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:text-[#0369A1] bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 transition-all flex-shrink-0 self-start sm:self-auto"
          >
            <span>View All Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Card Grid: Exactly 2 columns across all screen sizes (mobile, tablet, desktop) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
          {displayCategories.map((cat) => {
            const catImage = cat.imageUrl || '/assets/images/service_iphone_repair_1788169632215.jpg';
            const serviceCount = cat.serviceSlugs?.length || 0;

            return (
              <div
                key={cat.id || cat.slug}
                className="bg-white rounded-xl sm:rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col overflow-hidden group text-left"
              >
                {/* Visual Repair Image with Zoom & Badge */}
                <div className="h-24 xs:h-36 sm:h-52 bg-slate-950 relative overflow-hidden">
                  <img
                    src={catImage}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('service_iphone_repair')) {
                        target.src = '/assets/images/service_iphone_repair_1788169632215.jpg';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5">
                    <span className="bg-white/95 backdrop-blur text-[#0284C7] text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-full shadow-sm">
                      {cat.badge || 'Specialized'}
                    </span>
                  </div>

                  {/* Services count pill */}
                  {serviceCount > 0 && (
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3.5">
                      <span className="bg-black/70 backdrop-blur text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-white/10 flex items-center gap-0.5 sm:gap-1">
                        <Wrench className="w-2.5 h-2.5 text-sky-400" />
                        <span>{serviceCount} Services</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3 sm:p-7 flex-1 flex flex-col justify-between space-y-3 sm:space-y-5">
                  <div className="space-y-1.5 sm:space-y-2.5">
                    <h3 className="text-sm sm:text-xl font-black text-slate-900 group-hover:text-[#0284C7] transition-colors font-sans tracking-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] sm:text-sm text-slate-500 leading-normal sm:leading-relaxed line-clamp-2 sm:line-clamp-3 font-medium">
                      {cat.description}
                    </p>

                    {/* Problems covered mini pills */}
                    {cat.problemsCovered && cat.problemsCovered.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 sm:pt-2">
                        {cat.problemsCovered.slice(0, 2).map((prob, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-slate-50 border border-slate-100 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-semibold text-slate-600 truncate max-w-full"
                          >
                            <CheckCircle2 className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-[#0284C7] flex-shrink-0" />
                            <span className="truncate">{prob}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 sm:pt-3 border-t border-slate-100 space-y-1.5 sm:space-y-2">
                    {/* Primary "View Details" button - Opens Real Dedicated Category Page */}
                    <button
                      onClick={() => onNavigate(cat.slug)}
                      className="w-full py-1.5 sm:py-3 px-2 sm:px-4 bg-slate-900 hover:bg-[#0284C7] text-white text-[10px] sm:text-sm font-extrabold rounded-md sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 group-hover:shadow-md"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Secondary WhatsApp Specialist & Book Bench */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
                      <button
                        onClick={() => {
                          const cleanPhone = (contact.whatsapp || '081675 49092').replace(/\D/g, '');
                          const text = `Hello MOBO SAVIOR, I would like to inquire about ${cat.name} services.`;
                          window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="py-1.5 px-1.5 sm:py-2 sm:px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] sm:text-[11px] font-bold rounded-md sm:rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-emerald-600 text-emerald-50" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => onNavigate(`book-repair?category=${cat.slug}`)}
                        className="py-1.5 px-1.5 sm:py-2 sm:px-3 bg-sky-50 hover:bg-sky-100 text-[#0284C7] text-[9px] sm:text-[11px] font-bold rounded-md sm:rounded-xl border border-sky-200 transition-colors flex items-center justify-center gap-0.5"
                      >
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Book Bench</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* Special Offers & Promotions Section */}
      {isSectionVisible(websiteSections, 'home', 'offers') && (
        <div className="mt-16 sm:mt-20">
          <HomeOffersSection onNavigate={onNavigate} contact={contact} />
        </div>
      )}

      {/* 3. Services Categories Showcase */}
      {isSectionVisible(websiteSections, 'home', 'featured_services') && (
        <section className="bg-sky-50/50 py-16 sm:py-20 border-y border-slate-100 mt-16 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 text-left">
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-widest text-[#0284C7] uppercase">EXPERT MOBILE REPAIR</span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans">
                Our Repair Services
              </h2>
              <p className="text-sm text-slate-500 max-w-xl font-medium">
                From display replacement to advanced motherboard and chip-level repair, our specialists handle all major mobile repair requirements with precision.
              </p>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="group inline-flex items-center gap-1 text-xs font-bold text-[#0284C7] hover:text-[#0369A1] bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-all flex-shrink-0"
            >
              View All Services
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* 2-Column Responsive Card Grid across all viewport sizes */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {featuredServices.length > 0 ? (
              featuredServices.map((srv) => (
                <div 
                  key={srv.id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm hover:border-[#0284C7] hover:shadow-md overflow-hidden transition-all duration-300 flex flex-col"
                >
                  {/* Service Image */}
                  <div className="h-24 xs:h-36 sm:h-48 bg-slate-100 overflow-hidden relative group">
                    <img 
                      src={getServiceImage(srv)} 
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
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                      <span className="bg-white/95 backdrop-blur text-[#0284C7] text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm">
                        {srv.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 flex-1 flex flex-col">
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-lg mb-1 sm:mb-2 leading-tight">{srv.name}</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 mb-2 sm:mb-4 flex-1 line-clamp-2">{srv.description}</p>
                    
                    {srv.price && (
                      <div className="mb-2 sm:mb-4">
                        <span className="text-[9px] sm:text-xs text-slate-400 font-medium">Starting from </span>
                        <span className="text-xs sm:text-lg font-black text-slate-800">₹{srv.price}</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto pt-2 sm:pt-4 border-t border-slate-50">
                      <button
                        onClick={() => onNavigate(`service/${srv.slug}`)}
                        className="py-1.5 px-2 sm:py-2 sm:px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[9px] sm:text-xs font-bold rounded-md sm:rounded-xl transition-all text-center focus:outline-none"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onNavigate(`book-repair?service=${srv.slug}`)}
                        className="py-1.5 px-2 sm:py-2 sm:px-3 bg-[#0284C7] text-white hover:bg-[#0369A1] text-[9px] sm:text-xs font-bold rounded-md sm:rounded-xl shadow-sm transition-all text-center focus:outline-none flex items-center justify-center gap-0.5 sm:gap-1"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-2">Services Currently Updating</h3>
                <p className="text-sm text-slate-500">Please check back shortly or contact us directly.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      )}



      {/* Dedicated Interactive Lightbox for Owner-Uploaded Photos ONLY */}
      {isPhotosViewerOpen && activePhotos.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 bg-black/95 backdrop-blur-md select-none">
          {/* Header Bar */}
          <div className="flex items-center justify-between text-white max-w-7xl w-full mx-auto pb-4 border-b border-white/10">
            <div className="text-left">
              <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded text-[9px] font-extrabold uppercase tracking-wider">
                {activePhotos[selectedPhotoIndex].category}
              </span>
              <h4 className="text-xs xs:text-sm sm:text-base font-black truncate max-w-md xs:max-w-lg mt-1">
                {activePhotos[selectedPhotoIndex].title}
              </h4>
            </div>
            <button 
              onClick={() => setIsPhotosViewerOpen(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Visual Arena */}
          <div className="flex-grow flex items-center justify-center relative max-w-5xl w-full mx-auto my-4">
            {/* Prev Trigger */}
            <button
              disabled={selectedPhotoIndex === 0}
              onClick={() => setSelectedPhotoIndex(prev => Math.max(0, prev - 1))}
              className="absolute left-2 xs:left-4 z-10 p-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all focus:outline-none"
            >
              <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Core Image Display */}
            <div className="relative max-h-[50vh] xs:max-h-[60vh] max-w-full flex items-center justify-center overflow-hidden bg-slate-900 rounded-2xl border border-white/5">
              <img 
                src={activePhotos[selectedPhotoIndex].imageUrl} 
                alt={activePhotos[selectedPhotoIndex].title} 
                className="max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Next Trigger */}
            <button
              disabled={selectedPhotoIndex === activePhotos.length - 1}
              onClick={() => setSelectedPhotoIndex(prev => Math.min(activePhotos.length - 1, prev + 1))}
              className="absolute right-2 xs:right-4 z-10 p-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Bottom Controls Panel & Thumbnails */}
          <div className="max-w-4xl w-full mx-auto space-y-4">
            {/* Description Card */}
            <p className="text-center text-[10px] xs:text-xs text-slate-300 leading-relaxed font-medium bg-white/5 p-3 rounded-xl max-w-2xl mx-auto border border-white/5">
              {activePhotos[selectedPhotoIndex].description}
            </p>

            {/* Scrollable Thumbnails row */}
            <div className="flex justify-center items-center gap-2 overflow-x-auto py-2">
              {activePhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                    idx === selectedPhotoIndex 
                      ? 'ring-2 ring-[#0284C7] opacity-100 scale-105' 
                      : 'opacity-40 hover:opacity-85'
                  }`}
                >
                  <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Interactive Video Player for Owner-Uploaded Videos ONLY */}
      {isVideosViewerOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md select-none">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex flex-col md:flex-row h-[85vh] md:h-[65vh]">
            <button
              onClick={() => setIsVideosViewerOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/45 hover:bg-black/70 text-white border border-white/10 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Portion: Playback Panel */}
            <div className="flex-grow bg-black relative aspect-video md:aspect-auto md:w-3/5">
              {selectedVideo.videoUrl.includes('youtube.com') || selectedVideo.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={`${getYoutubeEmbed(selectedVideo.videoUrl)}?autoplay=1&mute=0`}
                  title={selectedVideo.title}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={selectedVideo.videoUrl} 
                  controls 
                  autoPlay 
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}
            </div>

            {/* Right Portion: Interactive Videos Playlist (Showing ONLY Owner Videos) */}
            <div className="md:w-2/5 p-4 sm:p-6 bg-slate-950 flex flex-col justify-between text-left h-full min-h-0">
              <div className="space-y-4 min-h-0 flex flex-col">
                <div className="space-y-1 pb-3 border-b border-white/10 flex-shrink-0">
                  <span className="text-[9px] font-black tracking-widest text-[#0284C7] uppercase">
                    LAB DEMONSTRATIONS ({activeVideos.length})
                  </span>
                  <h4 className="text-sm font-black text-white truncate">{selectedVideo.title}</h4>
                </div>

                {/* Playlist list */}
                <div className="space-y-2 overflow-y-auto flex-grow pr-1">
                  {activeVideos.map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => setSelectedVideo(vid)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex gap-3 text-xs border ${
                        vid.id === selectedVideo.id
                          ? 'bg-white/10 border-white/15'
                          : 'bg-white/0 border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="w-16 h-10 rounded overflow-hidden bg-slate-900 flex-shrink-0 relative">
                        <img 
                          src={getYoutubeThumb(vid.videoUrl)} 
                          alt={vid.title} 
                          className="w-full h-full object-cover opacity-80" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-white bg-black/20">
                          <Play className="w-3.5 h-3.5 fill-white" />
                        </div>
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <span className="text-[8px] font-bold text-sky-400 uppercase">{vid.category}</span>
                        <p className="text-[10px] text-white font-extrabold truncate leading-tight">{vid.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active description section */}
              <div className="pt-4 border-t border-white/10 text-left flex-shrink-0 space-y-1">
                <p className="text-[10px] text-slate-300 font-medium leading-relaxed line-clamp-3">
                  {selectedVideo.description}
                </p>
                <a
                  href={`https://wa.me/91${contact.whatsapp.replace(/\s+/g, '')}?text=Hello%20MOBO%20SAVIOR,%20I%20watched%20your%20video%20"${encodeURIComponent(selectedVideo.title)}"%20and%20want%20to%20know%20more.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white text-emerald-600" />
                  BOOK REPAIR VIA WHATSAPP
                </a>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Dynamic Featured Repair Gallery Preview */}
      {isSectionVisible(websiteSections, 'home', 'gallery') && (
        <div className="mt-16 sm:mt-20">
          <HomeGalleryPreview onNavigate={onNavigate} />
        </div>
      )}

      {/* Dynamic Customer Reviews & Testimonials Section */}
      {isSectionVisible(websiteSections, 'home', 'reviews') && (
        <div className="mt-16 sm:mt-20">
          <HomeReviewsSection onNavigate={onNavigate} />
        </div>
      )}

      {/* 5. Physical Lab Location & Directions CTA */}
      {isSectionVisible(websiteSections, 'home', 'contact') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-[#0284C7] flex-shrink-0 border border-sky-100">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-[#0284C7] px-2 py-0.5 rounded">
                    Walk-In Diagnostic Lab
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Purulia, West Bengal</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-sans">
                  Visit MOBO SAVIOR at Super Market, Hattola More
                </h3>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                  {contact.address || 'ROOM NO B4, SUPER MERKET, HATTOLA MORE, PURULIA, WEST BENGAL 723101, INDIA'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
              <a
                href={contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
                title="Get Directions on Google Maps"
              >
                <Navigation className="w-4 h-4 text-white" />
                <span>GET DIRECTIONS</span>
              </a>

              {contact.facebook && (
                <a
                  href={contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                  aria-label="Facebook"
                  title="MOBO SAVIOR on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}

              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-xl transition-colors"
                aria-label="Instagram"
                title="MOBO SAVIOR on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 5. MOBO SAVIOR Locations & Branches */}
      {isSectionVisible(websiteSections, 'home', 'locations') && (
        <HomeLocationsSection branches={branches} />
      )}

      {/* Official WhatsApp Channel Community CTA */}
      <WhatsAppChannelCTA 
        channelUrl={contact.whatsappChannelUrl} 
        variant="section"
        className="mt-16 sm:mt-20" 
      />

      {/* 6. Direct Quick Call CTA */}
      {isSectionVisible(websiteSections, 'home', 'cta') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
          <div className="bg-gradient-to-r from-[#0284C7] to-[#0369A1] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative overflow-hidden shadow-lg border border-sky-400/20">
            {/* Subtle details */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-sky-300/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

            <div className="space-y-3 relative z-10 max-w-xl">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 px-3 py-1 rounded-full text-sky-100 inline-block">
                Immediate Support
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight font-sans">
                Need a Fast Price Estimate on Your Faulty Device?
              </h3>
              <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed font-medium">
                Call Saddam directly or send photos of your device and board symptoms via WhatsApp. We will diagnose and offer an immediate approximate cost estimation!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
              <a
                href={`tel:${contact.phone}`}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-900 text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all text-center whitespace-nowrap"
              >
                📞 CALL {contact.phone}
              </a>
              <a
                href={formattedWhatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 fill-white text-emerald-500" />
                WHATSAPP CHAT
              </a>
              <a
                href={contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/80 hover:bg-slate-900 text-white border border-sky-300/30 text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Navigation className="w-4 h-4 text-sky-400" />
                GET DIRECTIONS
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
