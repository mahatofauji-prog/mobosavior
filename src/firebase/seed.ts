import { doc, getDoc, setDoc, updateDoc, writeBatch, collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from './config';
import { Service, FAQItem, Review, WebsiteContent, ContactSettings, BrandingSettings, SEOSettings, SlideItem, TrustPoint, OfferCategory, Offer, Branch } from '../types';
import { ALL_COMPREHENSIVE_SERVICES } from '../data/servicesData';
import { DEFAULT_BRANDS, DEFAULT_MODELS, DEFAULT_CATEGORIES } from '../data/modelsData';
import { DEFAULT_TERMS_PAGE, DEFAULT_TERMS_SECTIONS, DEFAULT_PRIVACY_PAGE, DEFAULT_PRIVACY_SECTIONS } from '../data/defaultLegalData';

export { DEFAULT_BRANDS, DEFAULT_MODELS, DEFAULT_CATEGORIES };

export const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'branch-purulia-main',
    name: 'MOBO SAVIOR - Main Branch (Purulia)',
    slug: 'main-branch',
    branchCode: 'MS-PUR-01',
    address: 'Room No B4, Super Market, Hattola More',
    city: 'Purulia',
    state: 'West Bengal',
    pincode: '723101',
    googleMapsUrl: 'https://maps.app.goo.gl/tU41BvTCk3dRAn6r9',
    latitude: 23.3323,
    longitude: 86.3652,
    phone: '081675 49092',
    whatsapp: '081675 49092',
    email: 'saddammobosavior@gmail.com',
    weeklyHoliday: 'None (Open All 7 Days)',
    businessHours: {
      monday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
      tuesday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
      wednesday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
      thursday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
      friday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
      saturday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
      sunday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
    },
    description: 'MOBO SAVIOR Purulia is our headquarter lab specialized in microscopic motherboard reballing, dead phone recovery, display glass replacement, and chip-level logic board repairs by Saddam Bhai.',
    imageUrl: '/assets/images/why_choose_mobo_savior.png',
    serviceIds: [], // Empty means all services offered
    isMain: true,
    isFeatured: true,
    isActive: true,
    displayOrder: 1,
    seoTitle: 'MOBO SAVIOR Main Branch Purulia | Mobile Repair & Micro-soldering',
    seoDescription: 'MOBO SAVIOR Main Branch in Hattola More, Purulia. Specialized in dead phone recovery, CPU/IC reballing, iPhone screen replacement & battery calibration.',
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_TRUST_POINTS: TrustPoint[] = [
  {
    id: 'tp-1',
    title: 'Experienced Technician',
    description: 'Experienced professionals handling mobile repair and diagnosis.',
    icon: 'Wrench',
    isFeatured: true,
    isActive: true,
    displayOrder: 1
  },
  {
    id: 'tp-2',
    title: 'Professional Tools',
    description: 'Professional equipment for accurate diagnosis and repair.',
    icon: 'Cpu',
    isFeatured: true,
    isActive: true,
    displayOrder: 2
  },
  {
    id: 'tp-3',
    title: 'Quality Parts',
    description: 'Quality-focused replacement components.',
    icon: 'ShieldCheck',
    isFeatured: true,
    isActive: true,
    displayOrder: 3
  },
  {
    id: 'tp-4',
    title: 'Warranty Available',
    description: 'Warranty information provided where applicable.',
    icon: 'Shield',
    isFeatured: true,
    isActive: true,
    displayOrder: 4
  },
  {
    id: 'tp-5',
    title: 'Transparent Pricing',
    description: 'Clear pricing/diagnosis before repair where applicable.',
    icon: 'DollarSign',
    isFeatured: true,
    isActive: true,
    displayOrder: 5
  },
  {
    id: 'tp-6',
    title: 'Customer Satisfaction',
    description: 'Customer-focused repair experience.',
    icon: 'Smile',
    isFeatured: true,
    isActive: true,
    displayOrder: 6
  },
  {
    id: 'tp-7',
    title: 'Advanced Repairing',
    description: 'Advanced motherboard and chip-level repair capability.',
    icon: 'Layers',
    isFeatured: true,
    isActive: true,
    displayOrder: 7
  },
  {
    id: 'tp-8',
    title: 'Android & iPhone Specialist',
    description: 'Support for major Android and iPhone repair requirements.',
    icon: 'Smartphone',
    isFeatured: true,
    isActive: true,
    displayOrder: 8
  },
  {
    id: 'tp-9',
    title: 'Money Return Policy',
    description: 'Applicable on eligible motherboard repair cases.',
    icon: 'RotateCcw',
    isFeatured: true,
    isActive: true,
    displayOrder: 9
  },
  {
    id: 'tp-10',
    title: 'No Repair Without Customer Approval',
    description: 'We diagnose first and get customer approval before starting any repair or additional work.',
    icon: 'FileCheck',
    isFeatured: true,
    isActive: true,
    displayOrder: 10
  }
];

export const DEFAULT_OFFER_CATEGORIES: OfferCategory[] = [
  { id: 'cat-festival', name: 'Festival Offers', slug: 'festival-offers', description: 'Festive season repair discounts & special deals', displayOrder: 1, active: true },
  { id: 'cat-freegift', name: 'Free Gift Offers', slug: 'free-gift-offers', description: 'Complimentary screen guard, glass lamination or cleaning kit', displayOrder: 2, active: true },
  { id: 'cat-display', name: 'Display Offers', slug: 'display-offers', description: 'Special discounts on selected mobile displays & green line repair', displayOrder: 3, active: true },
  { id: 'cat-battery', name: 'Battery Offers', slug: 'battery-offers', description: 'Certified battery replacement deals with health guarantee', displayOrder: 4, active: true },
  { id: 'cat-discount', name: 'Discount Offers', slug: 'discount-offers', description: 'Combo repair vouchers and instant cashback discounts', displayOrder: 5, active: true }
];

export const DEFAULT_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    categoryId: 'cat-festival',
    category: 'Festival Offers',
    title: 'Festive Screen & Display Combo Saver',
    description: 'Special festival discount on selected iPhone & Android display replacements. Includes free TrueTone calibration.',
    discount: 'Flat 15% OFF',
    imageUrl: '/assets/images/slide_display_1788168074454.jpg',
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    terms: 'Offer valid on original OLED/AMOLED display replacement assemblies. Cannot be combined with other promo codes.',
    ctaText: 'Enquire on WhatsApp',
    ctaType: 'whatsapp',
    ctaValue: 'Hello MOBO SAVIOR, I want to enquire about the Festive Screen & Display Combo Saver offer!',
    isFeatured: true,
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-2',
    categoryId: 'cat-freegift',
    category: 'Free Gift Offers',
    title: 'Free 9H Tempered Glass with Screen Repair',
    description: 'Get a free premium 9H curved tempered glass and free dust cleaning with any mobile display replacement.',
    discount: 'FREE Gift Included',
    imageUrl: '/assets/images/slide_iphone_1788168033319.jpg',
    startDate: '2026-08-15',
    endDate: '2026-12-31',
    terms: 'Applicable for all walk-in customers getting screen replacement at Purulia Hattola More lab.',
    ctaText: 'Book Repair Now',
    ctaType: 'enquiry',
    ctaValue: 'display-replacement',
    isFeatured: true,
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-3',
    categoryId: 'cat-battery',
    category: 'Battery Offers',
    title: 'Express Battery Replacement Special',
    description: 'Replace your worn-out phone battery in 30 minutes with 6 months warranty and free charging port checkup.',
    discount: 'Save ₹300 Instant',
    imageUrl: '/assets/images/slide_battery_1788168089885.jpg',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    terms: 'Valid on high-capacity certified battery stock for Apple, Samsung, Xiaomi, OnePlus, Vivo, Oppo & Realme.',
    ctaText: 'Claim Battery Offer',
    ctaType: 'whatsapp',
    ctaValue: 'Hello MOBO SAVIOR, I want to claim the Express Battery Replacement Special offer!',
    isFeatured: true,
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_SLIDES: SlideItem[] = [
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

export const DEFAULT_SERVICES: Service[] = ALL_COMPREHENSIVE_SERVICES;


export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Where can I get mobile motherboard repair in Purulia?',
    answer: 'MOBO SAVIOR provides expert mobile motherboard repair in Purulia at our workstation in Super Market, Hattola More. We handle chip-level micro-soldering, short circuit removal, and logic board recovery for all major mobile brands.',
    category: 'Motherboard',
    displayOrder: 1
  },
  {
    id: 'faq-2',
    question: 'Where can I get iPhone motherboard repair in Purulia?',
    answer: 'You can get specialist iPhone motherboard repair at MOBO SAVIOR in Purulia. We diagnose and repair dual-layer iPhone logic boards, dead iPhones, Face ID sensors, Tristar charging chips, and power IC issues using microscopic tools.',
    category: 'iPhone Repair',
    displayOrder: 2
  },
  {
    id: 'faq-3',
    question: 'Does MOBO SAVIOR repair Android motherboard problems?',
    answer: 'Yes, MOBO SAVIOR repairs Android motherboard issues for Samsung, OnePlus, Xiaomi, POCO, Vivo, Oppo, and Realme devices in Purulia, including dead boot, power rail shorts, and CPU reboot loops.',
    category: 'Android Repair',
    displayOrder: 3
  },
  {
    id: 'faq-4',
    question: 'Does MOBO SAVIOR provide CPU reballing in Purulia?',
    answer: 'Yes, MOBO SAVIOR offers professional CPU reballing in Purulia for smartphones with CPU/RAM solder disconnection issues, such as POCO X3 Pro, Redmi Note 10 Pro, OnePlus, and Samsung Galaxy series.',
    category: 'Chip-Level',
    displayOrder: 4
  },
  {
    id: 'faq-5',
    question: 'Does MOBO SAVIOR provide eMMC/UFS programming?',
    answer: 'Yes, MOBO SAVIOR provides advanced eMMC and UFS storage memory programming, firmware flashing, partition recovery, and dead boot recovery services in Purulia.',
    category: 'Programming',
    displayOrder: 5
  },
  {
    id: 'faq-6',
    question: 'Where can I get iPhone display repair in Purulia?',
    answer: 'MOBO SAVIOR offers high-quality iPhone display repair in Purulia with TrueTone data transfer, touch responsiveness calibration, and original spec OLED panels for iPhone 11 through iPhone 16 Pro Max.',
    category: 'Display',
    displayOrder: 6
  },
  {
    id: 'faq-7',
    question: 'Do you repair curved displays and Flip & Fold mobiles?',
    answer: 'Yes, we specialize in curved display replacement and flexible screen repairs for Samsung Galaxy Z Fold & Z Flip, Motorola Razr, and OnePlus edge-to-edge curved OLED devices in Purulia.',
    category: 'Display',
    displayOrder: 7
  },
  {
    id: 'faq-8',
    question: 'Do you provide chip-level mobile IC repair in Purulia?',
    answer: 'Yes, MOBO SAVIOR provides chip-level mobile IC repair in Purulia, replacing power management ICs (PMIC), charging ICs, audio ICs, camera driver ICs, and network RF transceivers under stereoscopic microscopes.',
    category: 'Chip-Level',
    displayOrder: 8
  },
  {
    id: 'faq-9',
    question: 'Where is MOBO SAVIOR located in Purulia?',
    answer: 'Our service center is located at Room No B4, Super Market, Hattola More, Purulia, West Bengal 723101, India. You can get step-by-step directions using the Google Maps link on our website.',
    category: 'Location',
    displayOrder: 9
  },
  {
    id: 'faq-10',
    question: 'How can I book a mobile repair at MOBO SAVIOR Purulia?',
    answer: 'You can book a repair online in just 2 minutes! Use our multi-step booking tool on the website to select your service, enter your phone model, describe the issue, and choose your preferred date and time. You will get a unique booking ID to track status.',
    category: 'Booking',
    displayOrder: 10
  }
];

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    reviewerName: 'Sourav Sen',
    rating: 5,
    reviewText: 'My iPhone 12 Pro was stuck in an Apple logo bootloop. Other shops in Purulia said the motherboard was dead and unfixable. Took it to Saddam Bhai at MOBO SAVIOR. He reballed the CPU and solved the issue within 24 hours. Highly skilled micro-soldering expert!',
    featured: true,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rev-2',
    reviewerName: 'Anjali Mahato',
    rating: 5,
    reviewText: 'Excellent service. Replaced my OnePlus 9 display screen. The colors look perfect, and touch response is very smooth. TrueTone was also retained. Very reasonable price compared to official service centers.',
    featured: true,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rev-3',
    reviewerName: 'Subhasish Das',
    rating: 5,
    reviewText: 'Quick battery replacement for my Samsung phone. Took less than 30 minutes, and the backup is amazing now. Very professional behavior. Highly recommended mobile service center in Purulia.',
    featured: true,
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_BRANDING: BrandingSettings = {
  brandName: 'MOBO SAVIOR',
  logoUrl: '/assets/images/mobo_savior_logo.png',
  tagline: 'Expert Mobile Repair & Motherboard Micro-Soldering Specialists'
};

export const DEFAULT_CONTACT: ContactSettings = {
  name: 'MOBO SAVIOR',
  address: 'ROOM NO B4, SUPER MERKET, HATTOLA MORE, PURULIA, WEST BENGAL 723101, INDIA',
  phone: '081675 49092',
  whatsapp: '081675 49092',
  facebook: 'https://www.facebook.com/share/19aL5sjb28/',
  instagram: 'https://www.instagram.com/saddam617technical?stkn=MWh2MXNnZjZwNXI5MQ==',
  googleMapsUrl: 'https://maps.app.goo.gl/tU41BvTCk3dRAn6r9',
  youtube: ''
};

export const DEFAULT_CONTENT: WebsiteContent = {
  heroTitle: 'Expert Mobile Repair in Purulia',
  heroDescription: 'Professional iPhone & Android repair services, from display and battery replacements to advanced CPU / IC level motherboard repairs.',
  ctaText: 'BOOK A REPAIR',
  aboutText: 'MOBO SAVIOR is Purulia\'s premier mobile phone service center, specializing in advanced, chip-level hardware diagnostics and repairs. Led by micro-soldering specialist Saddam, we have built a reputation for reviving devices that other service centers declare unfixable. From precise laser-cutting glass repairs to high-frequency CPU reballing, we combine advanced instrumentation with surgical precision to save your mobile devices.',
  aboutHighlight: 'We do not just replace parts; we save motherboards. Your trusted choice for premium mobile restorations.',
  whyChooseUs: [
    {
      title: 'Expert Micro-Soldering',
      description: 'Specialized CPU, RAM, and Power IC level reballing and micro-jumpers on motherboards.',
      icon: 'Cpu'
    },
    {
      title: 'iPhone & Android Specialist',
      description: 'Deep engineering knowledge of iOS and major Android brands like Samsung, OnePlus, and Xiaomi.',
      icon: 'Smartphone'
    },
    {
      title: 'Transparent Diagnosis',
      description: 'Honest assessments, live testing, and "price on inspection" updates. No hidden charges.',
      icon: 'SearchCode'
    },
    {
      title: 'Premium Quality Parts',
      description: 'Using top-grade OLED panels, safety-certified battery cells, and high-spec replacement components.',
      icon: 'ShieldCheck'
    }
  ]
};

export const DEFAULT_SEO: SEOSettings = {
  siteTitle: 'MOBO SAVIOR | Expert Mobile Repair Shop in Purulia',
  metaDescription: 'Professional iPhone & Android mobile repair services in Purulia, West Bengal. Specialized in display and battery replacements, dead phone repair, and CPU/IC level repair.',
  primaryKeyword: 'Mobile Repair Shop in Purulia',
  secondaryKeywords: [
    'Best Mobile Repair Shop in Purulia',
    'Mobo Savior',
    'iPhone repair in Purulia',
    'Android mobile repair in Purulia',
    'mobile display replacement Purulia',
    'mobile battery replacement Purulia',
    'dead phone repair Purulia',
    'CPU IC level mobile repair Purulia',
    'charging problem repair Purulia',
    'network problem mobile repair Purulia',
    'foldable phone repair Purulia'
  ],
  canonicalUrl: 'https://mobosavior.com',
  ogTitle: 'MOBO SAVIOR | Expert Mobile Repair Shop in Purulia',
  ogDescription: 'Professional iPhone & Android mobile repair services in Purulia, West Bengal. Specialized in display and battery replacements, dead phone repair, and CPU/IC level repair.',
  robotsConfig: 'index, follow'
};

// Seeding function
export async function seedDatabaseIfEmpty() {
  try {
    // 1. Check if settings/branding exists
    try {
      const checkDocRef = doc(db, 'settings', 'branding');
      const docSnap = await getDoc(checkDocRef);
      if (!docSnap.exists()) {
        console.log('Database settings empty. Seeding core settings...');
        await setDoc(doc(db, 'settings', 'branding'), DEFAULT_BRANDING);
        await setDoc(doc(db, 'settings', 'contact'), DEFAULT_CONTACT);
        await setDoc(doc(db, 'settings', 'content'), DEFAULT_CONTENT);
        await setDoc(doc(db, 'settings', 'seo'), DEFAULT_SEO);

        for (const faq of DEFAULT_FAQS) {
          await setDoc(doc(db, 'faqs', faq.id), faq);
        }
        for (const review of DEFAULT_REVIEWS) {
          await setDoc(doc(db, 'reviews', review.id), review);
        }
        for (const slide of DEFAULT_SLIDES) {
          await setDoc(doc(db, 'slideshow', slide.id), slide);
        }
      } else {
        // Ensure official location and social URLs are synchronized in settings/contact
        try {
          const contactDocRef = doc(db, 'settings', 'contact');
          const contactSnap = await getDoc(contactDocRef);
          if (contactSnap.exists()) {
            const contactData = contactSnap.data();
            if (!contactData.facebook || contactData.googleMapsUrl?.includes('zGrUJeVYbiBP7hdZ7') || contactData.googleMapsUrl?.includes('BveQvX7XJ89M1R2i8')) {
              await updateDoc(contactDocRef, {
                facebook: DEFAULT_CONTACT.facebook,
                instagram: DEFAULT_CONTACT.instagram,
                googleMapsUrl: DEFAULT_CONTACT.googleMapsUrl
              });
              console.log('Updated settings/contact with official Google Maps and social URLs.');
            }
          } else {
            await setDoc(contactDocRef, DEFAULT_CONTACT);
          }
        } catch (contactErr) {
          console.warn('Could not sync contact settings:', contactErr);
        }
      }
    } catch (settingsErr) {
      console.warn('Could not check or seed settings:', settingsErr);
    }

    // 2. Check and seed comprehensive services
    try {
      const servicesSnap = await getDocs(query(collection(db, 'services'), limit(1)));
      if (servicesSnap.empty) {
        console.log('Seeding comprehensive services catalog...');
        for (const service of DEFAULT_SERVICES) {
          await setDoc(doc(db, 'services', service.id), service);
        }
      }
    } catch (servicesErr) {
      console.warn('Could not seed services:', servicesErr);
    }

    // 3. Check and seed brands, models, categories
    try {
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      if (categoriesSnap.empty) {
        console.log('Seeding categories...');
        for (const cat of DEFAULT_CATEGORIES) {
          await setDoc(doc(db, 'categories', cat.id), cat);
        }
      } else {
        // Ensure all 6 categories exist with updated serviceSlugs and problemsCovered
        for (const cat of DEFAULT_CATEGORIES) {
          const catRef = doc(db, 'categories', cat.id);
          const catSnap = await getDoc(catRef);
          if (!catSnap.exists() || !catSnap.data().serviceSlugs) {
            await setDoc(catRef, cat, { merge: true });
          }
        }
      }
    } catch (catErr) {
      console.warn('Could not sync categories:', catErr);
    }

    try {
      const brandsSnap = await getDocs(query(collection(db, 'brands'), limit(1)));
      if (brandsSnap.empty) {
        console.log('Seeding brands and models...');
        for (const brand of DEFAULT_BRANDS) {
          await setDoc(doc(db, 'brands', brand.id), brand);
        }
        for (const model of DEFAULT_MODELS) {
          await setDoc(doc(db, 'models', model.id), model);
        }
      }
    } catch (brandsErr) {
      console.warn('Could not seed brands/models:', brandsErr);
    }

    // 4. Check and seed Trust Points ("Why Choose MOBO SAVIOR?")
    try {
      const trustSnap = await getDocs(query(collection(db, 'trust_points'), limit(1)));
      if (trustSnap.empty) {
        console.log('Seeding initial 8 trust points...');
        for (const tp of DEFAULT_TRUST_POINTS) {
          await setDoc(doc(db, 'trust_points', tp.id), tp);
        }
      }
    } catch (tpErr) {
      console.warn('Could not seed trust_points:', tpErr);
    }

    // 5. Check and seed Offer Categories & Offers
    try {
      const offerCatSnap = await getDocs(query(collection(db, 'offer_categories'), limit(1)));
      if (offerCatSnap.empty) {
        console.log('Seeding offer categories...');
        for (const oc of DEFAULT_OFFER_CATEGORIES) {
          await setDoc(doc(db, 'offer_categories', oc.id), oc);
        }
      }

      const offersSnap = await getDocs(query(collection(db, 'offers'), limit(1)));
      if (offersSnap.empty) {
        console.log('Seeding initial offers...');
        for (const offer of DEFAULT_OFFERS) {
          await setDoc(doc(db, 'offers', offer.id), offer);
        }
      }
    } catch (offerErr) {
      console.warn('Could not seed offers/offer_categories:', offerErr);
    }

    // 6. Check and seed Branches
    try {
      const branchesSnap = await getDocs(query(collection(db, 'branches'), limit(1)));
      if (branchesSnap.empty) {
        console.log('Seeding initial branches...');
        for (const branch of DEFAULT_BRANCHES) {
          await setDoc(doc(db, 'branches', branch.id), branch);
        }
      }
    } catch (branchErr) {
      console.warn('Could not seed branches:', branchErr);
    }

    // 7. Check and seed Legal Pages & Sections
    try {
      // Seed Terms & Conditions Page and Sections
      await setDoc(doc(db, 'legal_pages', DEFAULT_TERMS_PAGE.id), DEFAULT_TERMS_PAGE, { merge: true });
      for (const sec of DEFAULT_TERMS_SECTIONS) {
        await setDoc(doc(db, 'legal_sections', sec.id), sec, { merge: true });
      }

      // Seed Privacy Policy Page and Sections
      await setDoc(doc(db, 'legal_pages', DEFAULT_PRIVACY_PAGE.id), DEFAULT_PRIVACY_PAGE, { merge: true });
      for (const sec of DEFAULT_PRIVACY_SECTIONS) {
        await setDoc(doc(db, 'legal_sections', sec.id), sec, { merge: true });
      }
      console.log('Seeded Terms & Conditions and Privacy Policy sections successfully.');
    } catch (legalErr) {
      console.warn('Could not seed legal pages/sections:', legalErr);
    }

    console.log('Database verification and seed complete!');
  } catch (error) {
    console.error('Error in seedDatabaseIfEmpty:', error);
  }
}
