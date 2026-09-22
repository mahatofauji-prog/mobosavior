import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, collection, getDocs, query, orderBy } from './lib/supabase';
import { auth, db } from './lib/supabase';
import { handleFirestoreError, OperationType } from './lib/errors';
import { 
  Service, Review, FAQItem, BrandingSettings, ContactSettings, WebsiteContent, SEOSettings, SlideItem, Brand, PhoneModel, PriceItem, Branch, WebsiteSection,
  BusinessHours, ServiceCategory, NavigationItem 
} from './types';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';
import LocalBusinessSchema from './components/LocalBusinessSchema';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import BookRepair from './pages/BookRepair';
import TrackService from './pages/TrackService';
import Gallery from './pages/Gallery';
import Videos from './pages/Videos';
import About from './pages/About';
import Reviews from './pages/Reviews';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Offers from './pages/Offers';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import PageDetail from './pages/PageDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Locations from './pages/Locations';
import BranchDetail from './pages/BranchDetail';
import CategoryDetail from './pages/CategoryDetail';


// Fallback seeds in case database is loading
import { DEFAULT_SERVICES, DEFAULT_FAQS, DEFAULT_REVIEWS, DEFAULT_SLIDES, DEFAULT_BRANDS, DEFAULT_MODELS, DEFAULT_BRANCHES, DEFAULT_CATEGORIES, seedDatabaseIfEmpty } from './lib/seed';
import { getServiceImage } from './utils/serviceImages';
import { Sparkles, Loader2 } from 'lucide-react';

const DEFAULT_BRANDING: BrandingSettings = {
  brandName: 'MOBO SAVIOR',
  logoUrl: '/assets/images/mobo_savior_logo.png',
  tagline: 'Professional Micro-soldering & Mobile Repair Lab'
};

const DEFAULT_CONTACT: ContactSettings = {
  name: 'MOBO SAVIOR',
  address: 'Room No B4, Super Market, Hattola More, Purulia, West Bengal 723101',
  phone: '081675 49092',
  whatsapp: '081675 49092',
  facebook: 'https://www.facebook.com/share/19aL5sjb28/',
  instagram: 'https://www.instagram.com/saddam617technical?stkn=MWh2MXNnZjZwNXI5MQ==',
  googleMapsUrl: 'https://maps.app.goo.gl/tU41BvTCk3dRAn6r9',
  youtube: '',
  mapIframeUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.764953935399!2d86.365167!3d23.332194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5dede64253db5%3A0x6b48435d8869ce0d!2sSuper%20Market%2C%20Purulia!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K'
};

const DEFAULT_CONTENT: WebsiteContent = {
  heroTitle: 'iPhone & Android Precision Chip Repair',
  heroDescription: 'Purulia\'s specialist micro-soldering lab. We recover dead devices, replace display screens & calibrate batteries with microscope alignment tools.',
  ctaText: 'BOOK A REPAIR',
  aboutText: 'MOBO SAVIOR is Purulia\'s specialized mobile service center operated by Saddam Bhai. We focus on advanced component-level logic board recovery, display digitizer calibration, and battery replacements.',
  aboutHighlight: 'We do not just swap boards; we find and solder individual failed microscopic elements.',
  whyChooseUs: [
    { title: 'Experienced Technician', description: 'Experienced professionals handling mobile repair and diagnosis.', icon: 'Wrench' },
    { title: 'Professional Tools', description: 'Professional equipment for accurate diagnosis and repair.', icon: 'Cpu' },
    { title: 'Quality Parts', description: 'Quality-focused replacement components selected for reliable performance.', icon: 'ShieldCheck' },
    { title: 'Warranty Available', description: 'Applicable repairs can include warranty coverage with clear terms.', icon: 'ShieldAlert' },
    { title: 'Transparent Pricing', description: 'Clear pricing/diagnosis before repair where applicable.', icon: 'CheckCircle2' },
    { title: 'Customer Satisfaction', description: 'Focused on reliable service, clear communication and customer care.', icon: 'Sparkles' },
    { title: 'Advanced Repairing', description: 'Specialized motherboard, IC, CPU and chip-level repair capabilities.', icon: 'Layers' },
    { title: 'Android & iPhone Specialist', description: 'Support for major Android and iPhone repair requirements.', icon: 'Smartphone' }
  ]
};


const DEFAULT_HOURS: BusinessHours = {
  monFri: '10:00 AM - 08:00 PM',
  saturday: '10:00 AM - 08:00 PM',
  sunday: 'Closed',
  hoursNote: 'Open all days except public festival holidays. Express bench service available.'
};
const DEFAULT_SEO: SEOSettings = {
  siteTitle: 'MOBO SAVIOR | Mobile Repair shop in Purulia | iPhone & Android Repair',
  metaDescription: 'MOBO SAVIOR is a specialized mobile phone service lab in Purulia, West Bengal. Expert iPhone display replacement, reballing, and battery replacements by Saddam Bhai.',
  primaryKeyword: 'Mobile repair shop in Purulia',
  secondaryKeywords: ['iPhone screen replacement Purulia', 'dead phone repair', 'Saddam micro soldering', 'Poco motherboard fix'],
  robotsConfig: 'index, follow',
  canonicalUrl: 'https://mobosavior.com',
  ogTitle: 'MOBO SAVIOR | Mobile Repair shop in Purulia',
  ogDescription: 'Specialized logic board micro-soldering and mobile phone restorations in Purulia West Bengal by Saddam Bhai.',
  searchConsoleVerification: ''
};

export default function App() {
  // Navigation Routing States
  const [currentRoute, setCurrentRoute] = useState('home');
  const [routeParam, setRouteParam] = useState('');

  // Global Config and Listings States
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_CONTACT);
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS);
  const [content, setContent] = useState<WebsiteContent>(DEFAULT_CONTENT);
  const [seo, setSeo] = useState<SEOSettings>(DEFAULT_SEO);

  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [models, setModels] = useState<PhoneModel[]>(DEFAULT_MODELS);
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>(DEFAULT_BRANCHES);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [websiteSections, setWebsiteSections] = useState<WebsiteSection[]>([]);

  const [loading, setLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<boolean>(() => {
    return localStorage.getItem('mobo_admin_session') === 'true';
  });
  const isFetchingRef = useRef(false);

  // Parse routing from location Hash or Pathname
  const handleHashChange = () => {
    let rawPath = '';
    
    // Check if the user navigated to a pathname directly (e.g., /moboadmin2026)
    const pathname = window.location.pathname;
    if (pathname && pathname !== '/' && pathname !== '/index.html') {
      // Normalize pathname by removing leading slash
      rawPath = pathname.substring(1);
      
      // Update hash to match the pathname to ensure app functions as expected with hash routing
      // Use replaceState to avoid adding duplicate history entries
      if (!window.location.hash) {
         window.history.replaceState(null, '', `#/${rawPath}`);
      }
    } else {
      const hash = window.location.hash || '#/';
      rawPath = hash.replace(/^#\//, '');
    }

    const pathWithQuery = rawPath.split('?')[0];
    const queryString = rawPath.includes('?') ? rawPath.substring(rawPath.indexOf('?') + 1) : '';

    if (pathWithQuery.startsWith('services/')) {
      setCurrentRoute('service-detail');
      setRouteParam(pathWithQuery.substring(9) + (queryString ? `?${queryString}` : ''));
    } else if (pathWithQuery.startsWith('service/')) {
      setCurrentRoute('service-detail');
      setRouteParam(pathWithQuery.substring(8) + (queryString ? `?${queryString}` : ''));
    } else if (pathWithQuery.startsWith('category/')) {
      setCurrentRoute('category-detail');
      setRouteParam(pathWithQuery.substring(9) + (queryString ? `?${queryString}` : ''));
    } else if (pathWithQuery.startsWith('categories/')) {
      setCurrentRoute('category-detail');
      setRouteParam(pathWithQuery.substring(11) + (queryString ? `?${queryString}` : ''));
    } else if (pathWithQuery.startsWith('locations/')) {
      setCurrentRoute('branch-detail');
      setRouteParam(pathWithQuery.substring(10) + (queryString ? `?${queryString}` : ''));
    } else if (pathWithQuery.startsWith('location/')) {
      setCurrentRoute('branch-detail');
      setRouteParam(pathWithQuery.substring(9) + (queryString ? `?${queryString}` : ''));
    } else if (pathWithQuery === '') {
      setCurrentRoute('home');
      setRouteParam('');
    } else {
      setCurrentRoute(pathWithQuery);
      setRouteParam(queryString);
    }

    // Smooth scroll page to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  useEffect(() => {
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Local session state monitors the local admin passcode gate

  // Load Database Configurations efficiently in parallel
  const loadConfigurationData = useCallback(async (force = false) => {
    if (!force && isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Timeout promise to prevent indefinite hanging (safety limit: 15 seconds)
    const timeoutPromise = new Promise<{ isTimeout: true }>((resolve) =>
      setTimeout(() => resolve({ isTimeout: true }), 15000)
    );

    const fetchAllData = async () => {
      try {
        const [
          brandingRes,
          contactRes,
          hoursRes,

          contentRes,
          seoRes,
          categoriesRes,

          servicesRes,
          reviewsRes,
          faqsRes,
          slidesRes,
          brandsRes,
          modelsRes,
          pricesRes,
          branchesRes,
          sectionsRes,
          navRes
        ] = await Promise.allSettled([
          getDoc(doc(db, 'settings', 'branding')),
          getDoc(doc(db, 'settings', 'contact')),
          getDoc(doc(db, 'settings', 'businessHours')),

          getDoc(doc(db, 'settings', 'content')),
          getDoc(doc(db, 'settings', 'seo')),
          getDocs(query(collection(db, 'categories'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'services'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'faqs'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'slideshow'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'brands'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'models'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'prices'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'branches'), orderBy('displayOrder', 'asc'))),
          getDocs(collection(db, 'website_sections')),
          getDocs(query(collection(db, 'navigation_items'), orderBy('order', 'asc')))
        ]);

        if (brandingRes.status === 'fulfilled' && brandingRes.value.exists()) {
          setBranding(brandingRes.value.data() as BrandingSettings);
        }
        if (contactRes.status === 'fulfilled' && contactRes.value.exists()) {
          const rawContact = contactRes.value.data() as ContactSettings;
          setContact({
            ...DEFAULT_CONTACT,
            ...rawContact,
            whatsappChannelUrl: rawContact.whatsappChannelUrl || DEFAULT_CONTACT.whatsappChannelUrl
          });
        }
        if (hoursRes.status === 'fulfilled' && hoursRes.value.exists()) {
          const rawHours = hoursRes.value.data();
          setHours({
            monFri: rawHours.monFri || DEFAULT_HOURS.monFri,
            saturday: rawHours.saturday || DEFAULT_HOURS.saturday,
            sunday: rawHours.sunday || DEFAULT_HOURS.sunday,
            hoursNote: rawHours.hoursNote || rawHours.note || DEFAULT_HOURS.hoursNote
          });
        }
        if (contentRes.status === 'fulfilled' && contentRes.value.exists()) {
          setContent(contentRes.value.data() as WebsiteContent);
        }
        if (seoRes.status === 'fulfilled' && seoRes.value.exists()) {
          setSeo(seoRes.value.data() as SEOSettings);
        }

        
        if (categoriesRes.status === 'fulfilled') {
          const fetchedCategories: ServiceCategory[] = [];
          categoriesRes.value.forEach(docSnap => {
            fetchedCategories.push({ id: docSnap.id, ...docSnap.data() } as ServiceCategory);
          });
          
          // Merge with DEFAULT_CATEGORIES to ensure all 14 categories (including 8 new ones) exist with rich metadata and distinct images
          const mergedCategories: ServiceCategory[] = [...DEFAULT_CATEGORIES];
          fetchedCategories.forEach(fCat => {
            const idx = mergedCategories.findIndex(
              c => c.id === fCat.id || c.slug === fCat.slug || c.name?.toLowerCase() === fCat.name?.toLowerCase()
            );
            if (idx >= 0) {
              mergedCategories[idx] = {
                ...mergedCategories[idx],
                ...fCat,
                imageUrl: (fCat.imageUrl && fCat.imageUrl.trim() !== '' && !fCat.imageUrl.includes('placeholder'))
                  ? fCat.imageUrl
                  : mergedCategories[idx].imageUrl,
                problemsCovered: (fCat.problemsCovered && fCat.problemsCovered.length > 0)
                  ? fCat.problemsCovered
                  : mergedCategories[idx].problemsCovered,
                serviceSlugs: (fCat.serviceSlugs && fCat.serviceSlugs.length > 0)
                  ? fCat.serviceSlugs
                  : mergedCategories[idx].serviceSlugs
              };
            } else {
              mergedCategories.push(fCat);
            }
          });

          setCategories(mergedCategories);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
        if (servicesRes.status === 'fulfilled') {
          const fetchedServices: Service[] = [];
          servicesRes.value.forEach(docSnap => {
            const rawData = docSnap.data() as Service;
            const finalImg = (rawData.imageUrl && rawData.imageUrl.trim() !== '') 
              ? rawData.imageUrl 
              : getServiceImage({ slug: rawData.slug, id: docSnap.id, name: rawData.name, category: rawData.category });
            fetchedServices.push({ 
              id: docSnap.id, 
              ...rawData,
              imageUrl: finalImg
            } as Service);
          });
          if (fetchedServices.length > 0) setServices(fetchedServices);
        }

        if (reviewsRes.status === 'fulfilled') {
          const fetchedReviews: Review[] = [];
          reviewsRes.value.forEach(docSnap => {
            fetchedReviews.push({ id: docSnap.id, ...docSnap.data() } as Review);
          });
          if (fetchedReviews.length > 0) setReviews(fetchedReviews);
        }

        if (faqsRes.status === 'fulfilled') {
          const fetchedFaqs: FAQItem[] = [];
          faqsRes.value.forEach(docSnap => {
            fetchedFaqs.push({ id: docSnap.id, ...docSnap.data() } as FAQItem);
          });
          if (fetchedFaqs.length > 0) setFaqs(fetchedFaqs);
        }

        if (slidesRes.status === 'fulfilled') {
          const fetchedSlides: SlideItem[] = [];
          slidesRes.value.forEach(docSnap => {
            fetchedSlides.push({ id: docSnap.id, ...docSnap.data() } as SlideItem);
          });
          if (fetchedSlides.length > 0) setSlides(fetchedSlides);
        }

        if (brandsRes.status === 'fulfilled') {
          const fetchedBrands: Brand[] = [];
          brandsRes.value.forEach(docSnap => {
            fetchedBrands.push({ id: docSnap.id, ...docSnap.data() } as Brand);
          });
          if (fetchedBrands.length > 0) setBrands(fetchedBrands);
        }

        if (modelsRes.status === 'fulfilled') {
          const fetchedModels: PhoneModel[] = [];
          modelsRes.value.forEach(docSnap => {
            fetchedModels.push({ id: docSnap.id, ...docSnap.data() } as PhoneModel);
          });
          if (fetchedModels.length > 0) setModels(fetchedModels);
        }

        if (pricesRes.status === 'fulfilled') {
          const fetchedPrices: PriceItem[] = [];
          pricesRes.value.forEach(docSnap => {
            fetchedPrices.push({ id: docSnap.id, ...docSnap.data() } as PriceItem);
          });
          setPrices(fetchedPrices);
        }

        if (branchesRes.status === 'fulfilled') {
          const fetchedBranches: Branch[] = [];
          branchesRes.value.forEach(docSnap => {
            const raw: any = { id: docSnap.id, ...docSnap.data() };
            const meta = raw.businessHours?._meta || raw.business_hours?._meta || {};
            fetchedBranches.push({
              ...raw,
              isMain: raw.isMain !== undefined ? raw.isMain : !!(raw.isHeadquarters || raw.is_headquarters || meta.isMain),
              isActive: raw.isActive !== undefined ? raw.isActive : (meta.isActive !== undefined ? meta.isActive : true),
              isFeatured: raw.isFeatured !== undefined ? raw.isFeatured : (meta.isFeatured !== undefined ? meta.isFeatured : true),
              imageUrl: raw.imageUrl || meta.imageUrl || '/assets/images/why_choose_mobo_savior.png',
              description: raw.description || meta.description || '',
              weeklyHoliday: raw.weeklyHoliday || meta.weeklyHoliday || 'None (Open All 7 Days)',
              serviceIds: raw.serviceIds || meta.serviceIds || [],
              seoTitle: raw.seoTitle || meta.seoTitle || '',
              seoDescription: raw.seoDescription || meta.seoDescription || ''
            } as Branch);
          });
          if (fetchedBranches.length > 0) setBranches(fetchedBranches);
        }

        if (sectionsRes.status === 'fulfilled') {
          const fetchedSections: WebsiteSection[] = [];
          sectionsRes.value.forEach(docSnap => {
            fetchedSections.push({ id: docSnap.id, ...docSnap.data() } as WebsiteSection);
          });
          setWebsiteSections(fetchedSections);
        }
        if (navRes.status === 'fulfilled') {
          const fetchedNav: NavigationItem[] = [];
          navRes.value.forEach(docSnap => {
            fetchedNav.push({ id: docSnap.id, ...docSnap.data() } as NavigationItem);
          });
          setNavItems(fetchedNav);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'initial-load');
      }
    };

    try {
      // Race between fetch and timeout
      await Promise.race([fetchAllData(), timeoutPromise]);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigurationData(true);
  }, [loadConfigurationData]);

  const handleCustomNavigate = (route: string) => {
    window.location.hash = `#/${route}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3.5 select-none text-slate-700">
        <Loader2 className="w-8 h-8 text-[#0284C7] animate-spin" />
        <div className="text-center space-y-1">
          <h4 className="font-bold text-sm tracking-tight">Loading MOBO SAVIOR Lab...</h4>
          <p className="text-[10px] text-slate-400 font-medium">Connecting to Lab Database...</p>
        </div>
      </div>
    );
  }

  // Route selector
  const renderRoutePage = () => {
    if (currentRoute === 'blog') {
      return <Blog onNavigate={handleCustomNavigate} contact={contact} />;
    }
    if (currentRoute.startsWith('blog/')) {
      const blogSlug = currentRoute.substring(5);
      return <BlogDetail onNavigate={handleCustomNavigate} slug={blogSlug} contact={contact} />;
    }

    switch (currentRoute) {
      case 'home':
        return <Home onNavigate={handleCustomNavigate} services={services} categories={categories} reviews={reviews} content={content} contact={contact} slides={slides} branches={branches} websiteSections={websiteSections} />;
      case 'locations':
        return <Locations onNavigate={handleCustomNavigate} branches={branches} services={services} />;
      case 'branch-detail':
        return <BranchDetail onNavigate={handleCustomNavigate} slug={routeParam} branches={branches} services={services} />;
      case 'services':
        return <Services onNavigate={handleCustomNavigate} services={services} prices={prices} />;
      case 'service-detail':
        return <ServiceDetail onNavigate={handleCustomNavigate} services={services} slug={routeParam} contact={contact} brands={brands} models={models} prices={prices} />;
      case 'book-repair':
        return <BookRepair onNavigate={handleCustomNavigate} services={services} contact={contact} branches={branches} />;
      case 'track-service':
        return <TrackService onNavigate={handleCustomNavigate} />;
      case 'gallery':
        return <Gallery onNavigate={handleCustomNavigate} contactWhatsapp={contact.whatsapp} />;
      case 'videos':
        return <Videos onNavigate={handleCustomNavigate} contactWhatsapp={contact.whatsapp} />;
      case 'about':
        return <About onNavigate={handleCustomNavigate} content={content} />;
      case 'reviews':
        return <Reviews />;
      case 'faq':
        return <FAQ />;
      case 'contact':
        return <Contact contact={contact} hours={hours} />;
      case 'category-detail':
        return <CategoryDetail onNavigate={handleCustomNavigate} categories={categories} services={services} slug={routeParam} contact={contact} brands={brands} models={models} faqs={faqs} reviews={reviews} prices={prices} />;
      case 'iphone-repair':
      case 'android-repair':
      case 'motherboard-repair':
      case 'flip-fold-repair':
      case 'display-replacement':
      case 'cpu-reballing':
      case 'emmc-ufs-reballing':
      case 'software-unlocking':
      case 'motherboard-swapping':
      case 'network-solutions':
      case 'curved-display-repair':
      case 'curved-glass-cutting':
      case 'iphone-back-glass':
        // If it matches a category slug, render CategoryDetail; otherwise ServiceDetail
        {
          const isCategory = categories.some(c => c.slug === currentRoute || c.id === currentRoute);
          if (isCategory) {
            return <CategoryDetail onNavigate={handleCustomNavigate} categories={categories} services={services} slug={currentRoute} contact={contact} brands={brands} models={models} faqs={faqs} reviews={reviews} prices={prices} />;
          }
          return <ServiceDetail onNavigate={handleCustomNavigate} services={services} slug={currentRoute} contact={contact} brands={brands} models={models} prices={prices} />;
        }
      case 'offers':
        return <Offers onNavigate={handleCustomNavigate} contact={contact} />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms-conditions':
        return <TermsConditions />;
      case 'moboadmin2026':
        if (adminUser) {
          return (
            <AdminDashboard 
              onLogout={() => {
                setAdminUser(false);
                localStorage.removeItem('mobo_admin_session');
                window.location.hash = '#/moboadmin2026';
              }} 
              servicesList={services}
              reviewsList={reviews}
              faqsList={faqs}
              brandingSettings={branding}
              contactSettings={contact}
              websiteContent={content}
              seoSettings={seo}
              onRefreshData={loadConfigurationData}
              slideshowList={slides}
              businessHours={hours}
            />
          );
        } else {
          return (
            <AdminLogin 
              onSuccess={() => {
                setAdminUser(true);
                localStorage.setItem('mobo_admin_session', 'true');
                loadConfigurationData();
              }} 
            />
          );
        }
      default:
        return <PageDetail onNavigate={handleCustomNavigate} slug={currentRoute} contact={contact} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between selection:bg-sky-100 selection:text-[#0284C7]">
      {/* 1. Schema markup & Dynamic Page SEO Head */}
      <SEOHead seoSettings={seo} currentRoute={currentRoute} />
      <LocalBusinessSchema contact={contact} />

      {/* Conditionally Render Public Layout Wrapper */}
      {currentRoute !== 'moboadmin2026' ? (
        <>
          {/* 2. Primary Navigation Bar Header */}
          <Navbar onNavigate={handleCustomNavigate} currentRoute={currentRoute} branding={branding} contact={contact} navItems={navItems} />

          {/* 3. Primary View Render Frame */}
          <div className="flex-grow">
            <ErrorBoundary componentName="Main View">
              {renderRoutePage()}
            </ErrorBoundary>
          </div>

          {/* 4. Footer Copy Bar */}
          <Footer onNavigate={handleCustomNavigate} branding={branding} contact={contact} navItems={navItems} />
        </>
      ) : (
        /* Admin Isolated View */
        <div className="flex-grow flex flex-col">
          <ErrorBoundary componentName="Admin Portal">
            {renderRoutePage()}
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}
