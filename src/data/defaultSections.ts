import { WebsiteSection } from '../types';

export const DEFAULT_WEBSITE_SECTIONS: WebsiteSection[] = [
  // --- HOME PAGE ---
  {
    id: 'home.hero',
    page: 'home',
    sectionKey: 'hero',
    sectionName: 'Hero Banner & Slideshow',
    isVisible: true,
    displayOrder: 1,
    description: 'Main animated slideshow, headline, micro-stats, and primary booking CTA buttons.'
  },
  {
    id: 'home.featured_services',
    page: 'home',
    sectionKey: 'featured_services',
    sectionName: 'Featured Service Cards',
    isVisible: true,
    displayOrder: 2,
    description: 'Quick-access cards for popular repairs like screen replacement and dead phone recovery.'
  },
  {
    id: 'home.specialized_services',
    page: 'home',
    sectionKey: 'specialized_services',
    sectionName: 'Specialized Repair Categories Grid',
    isVisible: true,
    displayOrder: 3,
    description: 'Detailed grid covering iPhone, Android, Motherboard, Flip/Fold, and Display Repair labs.'
  },
  {
    id: 'home.why_choose_us',
    page: 'home',
    sectionKey: 'why_choose_us',
    sectionName: 'Why Choose MOBO SAVIOR (Trust Section)',
    isVisible: true,
    displayOrder: 4,
    description: 'Laboratory showcase, master technician story, micro-soldering highlights, and trust badges.'
  },
  {
    id: 'home.offers',
    page: 'home',
    sectionKey: 'offers',
    sectionName: 'Promotional Offers & Banners',
    isVisible: true,
    displayOrder: 5,
    description: 'Active festival deals, repair discount banners, and special coupon cards.'
  },
  {
    id: 'home.gallery',
    page: 'home',
    sectionKey: 'gallery',
    sectionName: 'Repair Gallery & Workmanship Showcase',
    isVisible: true,
    displayOrder: 6,
    description: 'Lab photo gallery preview and interactive photo/video popups.'
  },
  {
    id: 'home.transformations',
    page: 'home',
    sectionKey: 'transformations',
    sectionName: 'Recent Workbench Transformations (Before/After)',
    isVisible: true,
    displayOrder: 7,
    description: 'Interactive comparison sliders showing actual device restorations.'
  },
  {
    id: 'home.reviews',
    page: 'home',
    sectionKey: 'reviews',
    sectionName: 'Customer Reviews & Testimonials',
    isVisible: true,
    displayOrder: 8,
    description: 'Combined rating slider featuring local and Google Maps customer feedback.'
  },
  {
    id: 'home.google_reviews',
    page: 'home',
    sectionKey: 'google_reviews',
    sectionName: 'Google Reviews Rating Summary',
    isVisible: true,
    displayOrder: 9,
    description: 'Google Place Rating badge with star counts and direct Google link.'
  },
  {
    id: 'home.testimonials',
    page: 'home',
    sectionKey: 'testimonials',
    sectionName: 'Verified Customer Testimonials',
    isVisible: true,
    displayOrder: 10,
    description: 'Direct customer review quotes and verified customer photo cards.'
  },
  {
    id: 'home.locations',
    page: 'home',
    sectionKey: 'locations',
    sectionName: 'Store Locations & Branches',
    isVisible: true,
    displayOrder: 11,
    description: 'Branch address cards, operating hours, and Google Maps direction triggers.'
  },
  {
    id: 'home.enquiry',
    page: 'home',
    sectionKey: 'enquiry',
    sectionName: 'Instant Repair Booking Form',
    isVisible: true,
    displayOrder: 12,
    description: 'Interactive form for instant repair cost estimation and booking.'
  },
  {
    id: 'home.contact',
    page: 'home',
    sectionKey: 'contact',
    sectionName: 'Contact Info & Business Hours',
    isVisible: true,
    displayOrder: 13,
    description: 'Phone numbers, WhatsApp action button, physical address, and store schedule.'
  },
  {
    id: 'home.blog',
    page: 'home',
    sectionKey: 'blog',
    sectionName: 'Latest Repair Articles & Tips',
    isVisible: true,
    displayOrder: 14,
    description: 'Blog post preview grid highlighting recent device maintenance articles.'
  },
  {
    id: 'home.cta',
    page: 'home',
    sectionKey: 'cta',
    sectionName: 'Emergency Call-to-Action Bar',
    isVisible: true,
    displayOrder: 15,
    description: 'Floating bottom CTA bar for instant calls and WhatsApp consultation.'
  },

  // --- SERVICES PAGE ---
  {
    id: 'services.hero',
    page: 'services',
    sectionKey: 'hero',
    sectionName: 'Services Page Header Banner',
    isVisible: true,
    displayOrder: 1,
    description: 'Main services title, search bar, and category filter header.'
  },
  {
    id: 'services.search',
    page: 'services',
    sectionKey: 'search',
    sectionName: 'Service Search & Category Filters',
    isVisible: true,
    displayOrder: 2,
    description: 'Search box and category filter chips for quick service discovery.'
  },
  {
    id: 'services.categories',
    page: 'services',
    sectionKey: 'categories',
    sectionName: 'Service Categories Grid',
    isVisible: true,
    displayOrder: 3,
    description: 'Grid of specialized service category cards with icons.'
  },
  {
    id: 'services.iphone',
    page: 'services',
    sectionKey: 'iphone',
    sectionName: 'iPhone Repair Section',
    isVisible: true,
    displayOrder: 4,
    description: 'Dedicated section for Apple iPhone repair services.'
  },
  {
    id: 'services.android',
    page: 'services',
    sectionKey: 'android',
    sectionName: 'Android Repair Section',
    isVisible: true,
    displayOrder: 5,
    description: 'Dedicated section for Android smartphone repairs.'
  },
  {
    id: 'services.chip_level',
    page: 'services',
    sectionKey: 'chip_level',
    sectionName: 'Motherboard & Chip-Level Repair',
    isVisible: true,
    displayOrder: 6,
    description: 'Micro-soldering, CPU reballing, and dead phone recovery services.'
  },
  {
    id: 'services.flip_fold',
    page: 'services',
    sectionKey: 'flip_fold',
    sectionName: 'Flip & Fold Repair Section',
    isVisible: true,
    displayOrder: 7,
    description: 'Specialized foldable screen and hinge restoration services.'
  },
  {
    id: 'services.display',
    page: 'services',
    sectionKey: 'display',
    sectionName: 'Display Replacement Section',
    isVisible: true,
    displayOrder: 8,
    description: 'OLED screen, glass refurbishing, and touch digitizer services.'
  },
  {
    id: 'services.software',
    page: 'services',
    sectionKey: 'software',
    sectionName: 'Software & Programming',
    isVisible: true,
    displayOrder: 9,
    description: 'Storage eMMC/UFS flashing, unbricking, and unlock services.'
  },
  {
    id: 'services.featured',
    page: 'services',
    sectionKey: 'featured',
    sectionName: 'Featured Services Showcase',
    isVisible: true,
    displayOrder: 10,
    description: 'Highlighted service cards with detailed breakdown.'
  },
  {
    id: 'services.pricing',
    page: 'services',
    sectionKey: 'pricing',
    sectionName: 'Pricing Tables & Estimates',
    isVisible: true,
    displayOrder: 11,
    description: 'Price list tables and cost estimation breakdown.'
  },
  {
    id: 'services.cta',
    page: 'services',
    sectionKey: 'cta',
    sectionName: 'Service Booking CTA',
    isVisible: true,
    displayOrder: 12,
    description: 'Call-to-action banner to book or request a quote.'
  },

  // --- SERVICE DETAIL PAGE ---
  {
    id: 'service_detail.hero',
    page: 'service_detail',
    sectionKey: 'hero',
    sectionName: 'Service Hero Header',
    isVisible: true,
    displayOrder: 1,
    description: 'Title, cover photo, category badge, and quick booking CTA.'
  },
  {
    id: 'service_detail.overview',
    page: 'service_detail',
    sectionKey: 'overview',
    sectionName: 'Service Overview',
    isVisible: true,
    displayOrder: 2,
    description: 'Detailed description and laboratory capabilities.'
  },
  {
    id: 'service_detail.symptoms',
    page: 'service_detail',
    sectionKey: 'symptoms',
    sectionName: 'Common Device Symptoms',
    isVisible: true,
    displayOrder: 3,
    description: 'Bullet points of fault symptoms requiring this repair.'
  },
  {
    id: 'service_detail.problems',
    page: 'service_detail',
    sectionKey: 'problems',
    sectionName: 'Problems Covered Checklist',
    isVisible: true,
    displayOrder: 4,
    description: 'List of specific technical issues resolved by this service.'
  },
  {
    id: 'service_detail.diagnosis',
    page: 'service_detail',
    sectionKey: 'diagnosis',
    sectionName: 'Microscope Diagnosis Process',
    isVisible: true,
    displayOrder: 5,
    description: 'Step-by-step explanation of lab diagnostic checks.'
  },
  {
    id: 'service_detail.process',
    page: 'service_detail',
    sectionKey: 'process',
    sectionName: 'Repair Workflow Steps',
    isVisible: true,
    displayOrder: 6,
    description: 'Numbered steps of the actual repair procedure.'
  },
  {
    id: 'service_detail.tools',
    page: 'service_detail',
    sectionKey: 'tools',
    sectionName: 'Tools & Technology Used',
    isVisible: true,
    displayOrder: 7,
    description: 'Microscopes, BGA stations, thermal cameras, and stencils list.'
  },
  {
    id: 'service_detail.brands',
    page: 'service_detail',
    sectionKey: 'brands',
    sectionName: 'Supported Brands',
    isVisible: true,
    displayOrder: 8,
    description: 'Supported smartphone brands for this repair.'
  },
  {
    id: 'service_detail.models',
    page: 'service_detail',
    sectionKey: 'models',
    sectionName: 'Supported Models & Model Pricing Grid',
    isVisible: true,
    displayOrder: 9,
    description: 'Model-wise breakdown table of repair costs.'
  },
  {
    id: 'service_detail.pricing',
    page: 'service_detail',
    sectionKey: 'pricing',
    sectionName: 'Pricing & Repair Duration Card',
    isVisible: true,
    displayOrder: 10,
    description: 'Estimated cost, repair time, and pricing type indicator.'
  },
  {
    id: 'service_detail.warranty',
    page: 'service_detail',
    sectionKey: 'warranty',
    sectionName: 'Warranty & Guarantee Terms',
    isVisible: true,
    displayOrder: 11,
    description: 'Warranty coverage duration and conditions.'
  },
  {
    id: 'service_detail.important_notes',
    page: 'service_detail',
    sectionKey: 'important_notes',
    sectionName: 'Important Repair Notes',
    isVisible: true,
    displayOrder: 12,
    description: 'Data backup recommendations and pre-repair instructions.'
  },
  {
    id: 'service_detail.gallery',
    page: 'service_detail',
    sectionKey: 'gallery',
    sectionName: 'Service Repair Photos',
    isVisible: true,
    displayOrder: 13,
    description: 'Photo gallery of recent bench repairs for this service.'
  },
  {
    id: 'service_detail.videos',
    page: 'service_detail',
    sectionKey: 'videos',
    sectionName: 'Repair Demonstration Videos',
    isVisible: true,
    displayOrder: 14,
    description: 'Video demonstrations of microscope repair work.'
  },
  {
    id: 'service_detail.faqs',
    page: 'service_detail',
    sectionKey: 'faqs',
    sectionName: 'Service FAQs Accordion',
    isVisible: true,
    displayOrder: 15,
    description: 'Frequently asked questions related to this service.'
  },
  {
    id: 'service_detail.related',
    page: 'service_detail',
    sectionKey: 'related',
    sectionName: 'Related Services Cards',
    isVisible: true,
    displayOrder: 16,
    description: 'Links to complementary or related repair services.'
  },
  {
    id: 'service_detail.cta',
    page: 'service_detail',
    sectionKey: 'cta',
    sectionName: 'Booking & Contact Action Bar',
    isVisible: true,
    displayOrder: 17,
    description: 'Direct call, WhatsApp, and booking buttons.'
  },

  // --- GALLERY PAGE ---
  {
    id: 'gallery.header',
    page: 'gallery',
    sectionKey: 'header',
    sectionName: 'Gallery Page Header',
    isVisible: true,
    displayOrder: 1,
    description: 'Title, stats summary, and page description.'
  },
  {
    id: 'gallery.filters',
    page: 'gallery',
    sectionKey: 'filters',
    sectionName: 'Category Filter Buttons',
    isVisible: true,
    displayOrder: 2,
    description: 'Category tabs (All, Before/After, Motherboard, Display, Delivery, Videos).'
  },
  {
    id: 'gallery.repairing_photos',
    page: 'gallery',
    sectionKey: 'repairing_photos',
    sectionName: 'Workmanship Photos Section',
    isVisible: true,
    displayOrder: 3,
    description: 'Photos of active repairs and microscope bench work.'
  },
  {
    id: 'gallery.before_after',
    page: 'gallery',
    sectionKey: 'before_after',
    sectionName: 'Before / After Comparison Sliders',
    isVisible: true,
    displayOrder: 4,
    description: 'Interactive comparison sliders showing restored devices.'
  },
  {
    id: 'gallery.motherboard',
    page: 'gallery',
    sectionKey: 'motherboard',
    sectionName: 'Motherboard & Micro-Soldering Work',
    isVisible: true,
    displayOrder: 5,
    description: 'IC replacement, reballing, and power rail diagnostics photos.'
  },
  {
    id: 'gallery.display',
    page: 'gallery',
    sectionKey: 'display',
    sectionName: 'Display Replacement Gallery',
    isVisible: true,
    displayOrder: 6,
    description: 'OLED display, OCA glass lamination, and laser line fix photos.'
  },
  {
    id: 'gallery.delivery',
    page: 'gallery',
    sectionKey: 'delivery',
    sectionName: 'Customer Delivery Photos',
    isVisible: true,
    displayOrder: 7,
    description: 'Happy customers receiving repaired devices.'
  },
  {
    id: 'gallery.videos',
    page: 'gallery',
    sectionKey: 'videos',
    sectionName: 'Video Gallery Feed',
    isVisible: true,
    displayOrder: 8,
    description: 'Reels and repair clip videos.'
  },

  // --- REVIEWS PAGE ---
  {
    id: 'reviews.summary',
    page: 'reviews',
    sectionKey: 'summary',
    sectionName: 'Rating Summary Header',
    isVisible: true,
    displayOrder: 1,
    description: 'Overall star rating, total review count, and rating distribution.'
  },
  {
    id: 'reviews.google',
    page: 'reviews',
    sectionKey: 'google',
    sectionName: 'Google Reviews Cards',
    isVisible: true,
    displayOrder: 2,
    description: 'Synced Google Maps customer feedback cards.'
  },
  {
    id: 'reviews.testimonials',
    page: 'reviews',
    sectionKey: 'testimonials',
    sectionName: 'Customer Testimonials',
    isVisible: true,
    displayOrder: 3,
    description: 'Direct customer review quotes and stories.'
  },
  {
    id: 'reviews.featured',
    page: 'reviews',
    sectionKey: 'featured',
    sectionName: 'Featured Reviews Carousel',
    isVisible: true,
    displayOrder: 4,
    description: 'Top highlighted reviews.'
  },
  {
    id: 'reviews.cta',
    page: 'reviews',
    sectionKey: 'cta',
    sectionName: 'Leave a Review CTA',
    isVisible: true,
    displayOrder: 5,
    description: 'Button prompting satisfied customers to leave feedback on Google.'
  },

  // --- OFFERS PAGE ---
  {
    id: 'offers.header',
    page: 'offers',
    sectionKey: 'header',
    sectionName: 'Offers Page Header',
    isVisible: true,
    displayOrder: 1,
    description: 'Page title and special discounts announcement banner.'
  },
  {
    id: 'offers.categories',
    page: 'offers',
    sectionKey: 'categories',
    sectionName: 'Offer Categories Filter',
    isVisible: true,
    displayOrder: 2,
    description: 'Filter deals by festival, display, battery, or gift offers.'
  },
  {
    id: 'offers.active',
    page: 'offers',
    sectionKey: 'active',
    sectionName: 'Active Offers Section',
    isVisible: true,
    displayOrder: 3,
    description: 'Cards showing currently active repair promotions.'
  },
  {
    id: 'offers.featured',
    page: 'offers',
    sectionKey: 'featured',
    sectionName: 'Featured Mega Offer Banner',
    isVisible: true,
    displayOrder: 4,
    description: 'Highlighted big savings deal banner.'
  },
  {
    id: 'offers.upcoming',
    page: 'offers',
    sectionKey: 'upcoming',
    sectionName: 'Upcoming Offers',
    isVisible: true,
    displayOrder: 5,
    description: 'Preview of upcoming festival discount schemes.'
  },

  // --- ABOUT PAGE ---
  {
    id: 'about.hero',
    page: 'about',
    sectionKey: 'hero',
    sectionName: 'About Page Hero',
    isVisible: true,
    displayOrder: 1,
    description: 'Banner heading introducing the MOBO SAVIOR lab.'
  },
  {
    id: 'about.intro',
    page: 'about',
    sectionKey: 'intro',
    sectionName: 'Master Technician Story & Overview',
    isVisible: true,
    displayOrder: 2,
    description: 'Saddam Bhai history, micro-soldering expertise, and mission.'
  },
  {
    id: 'about.why_choose_us',
    page: 'about',
    sectionKey: 'why_choose_us',
    sectionName: 'Why Choose Us Grid',
    isVisible: true,
    displayOrder: 3,
    description: 'Core laboratory advantages and customer commitment points.'
  },
  {
    id: 'about.tools',
    page: 'about',
    sectionKey: 'tools',
    sectionName: 'Tools & Lab Equipment',
    isVisible: true,
    displayOrder: 4,
    description: 'Stereo microscopes, BGA stations, thermal imaging, and diagnostic gear.'
  },
  {
    id: 'about.trust',
    page: 'about',
    sectionKey: 'trust',
    sectionName: 'Trust Points & Warranty Guarantees',
    isVisible: true,
    displayOrder: 5,
    description: 'Genuine component commitment and warranty policy.'
  },
  {
    id: 'about.cta',
    page: 'about',
    sectionKey: 'cta',
    sectionName: 'Visit Our Lab CTA',
    isVisible: true,
    displayOrder: 6,
    description: 'Call-to-action banner to visit Purulia store.'
  },

  // --- CONTACT PAGE ---
  {
    id: 'contact.info',
    page: 'contact',
    sectionKey: 'info',
    sectionName: 'Contact Information Cards',
    isVisible: true,
    displayOrder: 1,
    description: 'Phone numbers, WhatsApp, email, and store address.'
  },
  {
    id: 'contact.map',
    page: 'contact',
    sectionKey: 'map',
    sectionName: 'Google Maps Location Embed',
    isVisible: true,
    displayOrder: 2,
    description: 'Interactive map and directions link.'
  },
  {
    id: 'contact.hours',
    page: 'contact',
    sectionKey: 'hours',
    sectionName: 'Weekly Business Hours',
    isVisible: true,
    displayOrder: 3,
    description: 'Day-wise shop opening and closing schedule.'
  },
  {
    id: 'contact.social',
    page: 'contact',
    sectionKey: 'social',
    sectionName: 'Social Media Profiles',
    isVisible: true,
    displayOrder: 4,
    description: 'Instagram, Facebook, and YouTube links.'
  },
  {
    id: 'contact.enquiry',
    page: 'contact',
    sectionKey: 'enquiry',
    sectionName: 'Direct Enquiry Form',
    isVisible: true,
    displayOrder: 5,
    description: 'Customer contact and callback request form.'
  },

  // --- BLOG PAGE ---
  {
    id: 'blog.hero',
    page: 'blog',
    sectionKey: 'hero',
    sectionName: 'Blog Hero Banner',
    isVisible: true,
    displayOrder: 1,
    description: 'Page title and search box for repair articles.'
  },
  {
    id: 'blog.categories',
    page: 'blog',
    sectionKey: 'categories',
    sectionName: 'Blog Categories Filter',
    isVisible: true,
    displayOrder: 2,
    description: 'Filter articles by repair category.'
  },
  {
    id: 'blog.featured',
    page: 'blog',
    sectionKey: 'featured',
    sectionName: 'Featured Article Showcase',
    isVisible: true,
    displayOrder: 3,
    description: 'Main highlighted blog post.'
  },
  {
    id: 'blog.latest',
    page: 'blog',
    sectionKey: 'latest',
    sectionName: 'Latest Articles Grid',
    isVisible: true,
    displayOrder: 4,
    description: 'Grid of published repair guides and technical tips.'
  }
];
