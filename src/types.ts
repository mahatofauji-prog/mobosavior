export type PriceType = 'fixed' | 'starting_from' | 'contact' | 'diagnosis';

export interface PriceItem {
  id: string;
  serviceId?: string;
  serviceSlug: string;
  serviceName?: string;
  category?: string;
  brandId?: string;
  brand?: string;            // Brand name e.g. "Apple", "Samsung"
  modelId?: string;
  model?: string;            // Model name e.g. "iPhone 13", "Galaxy S23"
  displayVariant?: string;   // e.g. "TFT", "OLED", "Original", "Curved", "Premium Quality"
  priceType: PriceType;      // 'fixed' | 'starting_from' | 'contact' | 'diagnosis'
  amount?: number | string;  // amount e.g. 999 or "999"
  currency?: string;         // defaults to "₹"
  notes?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  overview?: string;
  imageUrl?: string;
  category: string;
  price?: string; // e.g. "999" or empty
  priceType: 'exact' | 'estimate' | 'upon_inspection' | 'fixed' | 'starting_from' | 'contact' | 'diagnosis';
  estimatedTime?: string; // e.g. "30-45 mins", "1-2 days"
  problemsCovered: string[];
  symptoms?: string[];
  diagnosisProcess?: string;
  repairProcessSteps?: string[];
  toolsAndTech?: string[];
  supportedBrands?: string[];
  supportedModels?: string[];
  modelPrices?: { model: string, price: string }[];
  qualityOptions?: { name: string; description: string; price?: string; slug?: string }[];
  warranty?: string;
  importantNotes?: string;
  faqs?: { question: string, answer: string }[];
  seoTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  ogImageUrl?: string;
  active: boolean;
  featured: boolean;
  displayOrder: number;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Ready for Pickup' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string; // MS-YYYY-XXXXX
  serviceId: string;
  serviceName: string;
  brand: string;
  model: string;
  problemDescription: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address?: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  estimatedPrice?: string;
  status: BookingStatus;
  branchId?: string;
  branchName?: string;
  createdAt: string;
  notes?: string;
}

export type GalleryMediaType = 'image' | 'video' | 'before_after';

export interface GalleryItem {
  id: string;
  imageUrl?: string;
  videoUrl?: string;
  videoPlatform?: 'youtube' | 'facebook' | 'instagram' | string;
  youtubeVideoId?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  category: string; // 'Repairing Photos' | 'Before / After' | 'Motherboard Work' | 'Display Replacement' | 'Customer Delivery Photos' | 'Repairing Videos'
  mediaType?: GalleryMediaType;
  altText?: string;
  featured: boolean;
  active?: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
  // Service-specific gallery fields
  serviceSlug?: string;
  brand?: string;
  model?: string;
}

export interface VideoItem {
  id: string;
  videoUrl: string; // youtube, facebook, instagram embed url or original link
  videoPlatform?: 'youtube' | 'facebook' | 'instagram' | string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  category: string;
  featured: boolean;
  active?: boolean;
  displayOrder: number;
  createdAt: string;
  serviceSlug?: string;
  brand?: string;
  model?: string;
}

export type ReviewSource = 'website' | 'google' | 'testimonial';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  customerName?: string;
  customer_name?: string;
  reviewerName?: string; // fallback alias
  reviewer_name?: string;
  rating: number; // 1-5
  reviewText: string;
  review_text?: string;
  customerPhotoUrl?: string;
  customer_photo_url?: string;
  source?: ReviewSource;
  status?: ReviewStatus;
  active?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  booking_id?: string;
  service_availed?: string;
  phone?: string;
  device_model?: string;
  comment?: string;
  google_review_id?: string;
  google_review_url?: string;
  featured?: boolean;
  displayOrder?: number;
  display_order?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  serviceSlug?: string;
  service_slug?: string;
}

export interface GoogleReviewsSettings {
  googlePlaceId?: string;
  googleApiKey?: string;
  enableGoogleReviews?: boolean;
  googleReviewUrl?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
}

export interface BrandingSettings {
  brandName: string;
  tagline: string;
  logoUrl?: string;
}

export interface ContactSettings {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  googleMapsUrl: string;
  mapIframeUrl?: string;
  facebook?: string;
  youtube?: string;
  whatsappChannelUrl?: string;
}

export interface SEOSettings {
  siteTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl?: string;
  robotsConfig: string; // "index, follow" or "noindex, nofollow"
  searchConsoleVerification?: string;
  googleAnalyticsId?: string; // G-XXXXXXXXXX
}

export interface WebsiteContent {
  heroTitle: string;
  heroDescription: string;
  ctaText: string;
  aboutText: string;
  aboutHighlight: string;
  whyChooseUs: {
    title: string;
    description: string;
    icon: string;
  }[];
}

export interface SlideItem {
  id: string;
  imageUrl: string;
  title: string;
  active: boolean;
  displayOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  popular?: boolean;
  active: boolean;
  displayOrder: number;
}

export interface PhoneModel {
  id: string;
  brand: string; // e.g. "Apple", "Samsung", "Xiaomi"
  name: string; // e.g. "iPhone 13", "Galaxy S23"
  slug?: string;
  releaseYear?: number;
  imageUrl?: string;
  category?: 'iPhone' | 'Android' | 'FlipFold';
  availableServices?: string[]; // service slugs
  servicePrices?: Record<string, string>; // serviceSlug -> price
  displayTypes?: { type: string; price: string }[];
  active: boolean;
  displayOrder: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  imageUrl?: string;
  icon?: string;
  badge?: string;
  problemsCovered?: string[];
  serviceSlugs?: string[];
  seoTitle?: string;
  h1Name?: string;
  metaDescription?: string;
  imageAltText?: string;
  displayOrder: number;
  active: boolean;
}

export interface OfferCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

export type OfferCTAType = 'whatsapp' | 'service' | 'enquiry' | 'call' | 'url';

export interface Offer {
  id: string;
  categoryId?: string;
  category: string; // e.g. "Festival Offers", "Free Gift Offers", "Display Offers", "Battery Offers", "Discount Offers"
  title: string;
  description: string;
  imageUrl?: string;
  image_url?: string;
  destinationUrl?: string;
  destination_url?: string;
  discount?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  terms?: string;
  ctaText?: string;
  ctaType: OfferCTAType;
  ctaValue?: string;
  isFeatured: boolean;
  isActive: boolean;
  is_active?: boolean;
  displayOrder: number;
  display_order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrustPoint {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

// CMS - Page Management
export interface PageSection {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'list' | 'button' | 'link' | 'video' | 'faq' | 'cta';
  content: string; // text content, or comma-separated items for lists
  settings?: {
    level?: 'h1' | 'h2' | 'h3' | 'h4';
    align?: 'left' | 'center' | 'right';
    imageUrl?: string;
    imageAlt?: string;
    linkUrl?: string;
    listStyle?: 'disc' | 'decimal';
    ctaBg?: string;
    ctaText?: string;
    faqList?: { question: string; answer: string }[];
  };
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  sections: PageSection[];
  featuredImage?: string;
  seoTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  displayOrder: number;
  featured: boolean;
  status: 'Draft' | 'Published' | 'Unpublished';
  createdAt: string;
  updatedAt?: string;
}

// CMS - Blog / Repair Tips
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // Rich text / markdown string
  featuredImage?: string;
  authorName: string;
  category: string;
  tags: string[];
  publishDate: string; // YYYY-MM-DD
  seoTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  status: 'Draft' | 'Published' | 'Unpublished';
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
}

// CMS - Navigation
export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  displayOrder: number;
  active: boolean;
  imageUrl?: string;
}

// CMS - Media Library
export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size?: number;
  createdAt: string;
}

// Multi-Branch / Multi-Location System
export interface DayBusinessHours {
  isOpen: boolean;
  openTime: string;  // e.g. "09:30"
  closeTime: string; // e.g. "20:30"
}

export interface WeeklyBusinessHours {
  monday: DayBusinessHours;
  tuesday: DayBusinessHours;
  wednesday: DayBusinessHours;
  thursday: DayBusinessHours;
  friday: DayBusinessHours;
  saturday: DayBusinessHours;
  sunday: DayBusinessHours;
}

export interface Branch {
  id: string;
  name: string;
  slug: string;
  branchCode: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsUrl: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  whatsapp: string;
  email?: string;
  businessHours: WeeklyBusinessHours;
  weeklyHoliday?: string;
  description: string;
  imageUrl?: string;
  serviceIds?: string[]; // IDs of services available at this branch. If empty or undefined, all services available.
  isMain: boolean;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchPriceOverride {
  id: string;
  branchId: string;
  serviceId: string;
  brandId?: string;
  modelId?: string;
  price: number;
}

export interface WebsiteSection {
  id: string;
  page: 'home' | 'services' | 'service_detail' | 'category' | 'gallery' | 'reviews' | 'offers' | 'about' | 'contact' | 'blog' | 'global' | string;
  sectionKey: string;
  sectionName: string;
  description?: string;
  isVisible: boolean;
  displayOrder: number;
  settings?: Record<string, any>;
  updatedAt?: string;
}





// Legal Pages CMS
export interface LegalSection {
  id: string;
  pageId: string;
  heading: string;
  content: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegalPage {
  id: string;
  pageType: 'privacy-policy' | 'terms-conditions';
  title: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface ServiceBooking {
  id: string;
  service_id: string;
  customer_name: string;
  address: string;
  pin_code: string;
  contact_number: string;
  whatsapp_number: string;
  mobile_brand: string;
  mobile_model: string;
  problem: string;
  preferred_date: string;
  preferred_time: string;
  front_image_url: string;
  back_image_url: string;
  status: string; // 'New Request' | 'Request Confirmed' | 'Device Received' | 'Diagnosis in Progress' | 'Repair in Progress' | 'Ready for Delivery' | 'Completed' | 'Cancelled'
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  monFri: string;
  saturday: string;
  sunday: string;
  hoursNote: string;
}

export const GALLERY_CATEGORIES = [
  { id: 'repairing', label: 'Repairing Photos' },
  { id: 'before_after', label: 'Before / After' },
  { id: 'motherboard', label: 'Motherboard Work' },
  { id: 'display', label: 'Display Replacement' },
  { id: 'customer_delivery', label: 'Customer Delivery Photos' },
  { id: 'repairing_videos', label: 'Repairing Videos' }
];

export const mapCategoryToId = (cat: string | undefined | null): string => {
  if (!cat) return '';
  const trimmed = String(cat).trim();
  const lower = trimmed.toLowerCase();

  // Direct ID matches first
  if (lower === 'repairing') return 'repairing';
  if (lower === 'before_after') return 'before_after';
  if (lower === 'motherboard') return 'motherboard';
  if (lower === 'display') return 'display';
  if (lower === 'customer_delivery') return 'customer_delivery';
  if (lower === 'repairing_videos') return 'repairing_videos';

  const normalized = lower.replace(/[\s\-_/]+/g, ' ');

  if (normalized.includes('motherboard') || normalized.includes('logic board') || normalized.includes('logicboard')) {
    return 'motherboard';
  }
  if (normalized.includes('before') && normalized.includes('after')) {
    return 'before_after';
  }
  if (normalized.includes('delivery')) {
    return 'customer_delivery';
  }
  if (normalized.includes('display') || normalized.includes('screen')) {
    return 'display';
  }
  if (normalized.includes('video')) {
    return 'repairing_videos';
  }
  if (normalized.includes('repair') || normalized.includes('photo')) {
    return 'repairing';
  }

  return lower;
};

export const getCategoryLabel = (cat: string | undefined | null): string => {
  if (!cat) return 'General';
  const id = mapCategoryToId(cat);
  const found = GALLERY_CATEGORIES.find((c) => c.id === id);
  return found ? found.label : String(cat);
};
