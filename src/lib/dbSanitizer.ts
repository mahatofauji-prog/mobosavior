/**
 * Database Payload Sanitizer & Mapper for Supabase PostgREST
 * Ensures payloads sent to Supabase contain ONLY valid snake_case PostgreSQL columns.
 * Prevents PostgREST schema cache errors (PGRST204) caused by camelCase keys.
 */

// Known valid columns for each Supabase table
export const TABLE_COLUMNS: Record<string, string[]> = {
  branches: [
    'id', 'name', 'slug', 'branch_code', 'address', 'city', 'state', 'pincode',
    'google_maps_url', 'latitude', 'longitude', 'phone', 'whatsapp', 'email',
    'business_hours', 'is_headquarters', 'display_order', 'created_at', 'updated_at'
  ],
  settings: [
    'id', 'data', 'value', 'updated_at'
  ],
  business_profile: [
    'id', 'brand_name', 'business_name', 'tagline', 'logo_url', 'primary_phone', 'phone',
    'whatsapp_number', 'whatsapp', 'email', 'full_address', 'address', 'city', 'state',
    'pincode', 'about_text', 'bio', 'about_highlight', 'facebook_page_url', 'facebook_url',
    'instagram_profile_url', 'instagram_url', 'whatsapp_channel_link', 'whatsapp_channel_url',
    'google_maps_link', 'google_maps_url', 'map_embed_iframe_link', 'map_iframe_url',
    'youtube_url', 'updated_at'
  ],
  services: [
    'id', 'name', 'slug', 'description', 'overview', 'imageUrl', 'image_url', 'category',
    'price', 'priceType', 'price_type', 'estimatedTime', 'estimated_time', 'problemsCovered', 'problems_covered',
    'symptoms', 'diagnosisProcess', 'repairProcessSteps', 'toolsAndTech', 'supportedBrands',
    'supportedModels', 'modelPrices', 'qualityOptions', 'warranty', 'importantNotes',
    'faqs', 'seoTitle', 'metaDescription', 'seoKeywords', 'canonicalUrl',
    'ogImageUrl', 'active', 'is_active', 'featured', 'displayOrder', 'display_order',
    'createdAt', 'created_at', 'updatedAt', 'updated_at'
  ],
  categories: [
    'id', 'name', 'slug', 'description', 'longDescription', 'imageUrl', 'image_url',
    'icon', 'badge', 'problemsCovered', 'serviceSlugs', 'seoTitle', 'h1Name',
    'metaDescription', 'imageAltText', 'displayOrder', 'display_order'
  ],
  brands: [
    'id', 'name', 'slug', 'logoUrl', 'logo_url', 'popular', 'active', 'is_active', 'displayOrder', 'display_order',
    'created_at', 'updated_at'
  ],
  models: [
    'id', 'name', 'slug', 'brand', 'brandId', 'brand_id', 'releaseYear', 'imageUrl', 'image_url',
    'category', 'availableServices', 'servicePrices', 'displayTypes', 'active', 'is_active',
    'displayOrder', 'display_order', 'created_at', 'updated_at'
  ],
  prices: [
    'id', 'service_id', 'serviceId', 'service_slug', 'serviceSlug', 'service_name', 'serviceName',
    'category', 'brand_id', 'brandId', 'brand', 'model_id', 'modelId', 'model',
    'displayVariant', 'priceType', 'amount', 'price',
    'currency', 'notes', 'warranty', 'turnaround_time', 'is_active', 'active', 'isActive',
    'display_order', 'displayOrder', 'created_at', 'createdAt', 'updated_at', 'updatedAt'
  ],
  gallery: [
    'id', 'imageUrl', 'image_url', 'videoUrl', 'video_url', 'videoPlatform', 'youtubeVideoId',
    'beforeImageUrl', 'afterImageUrl', 'thumbnailUrl', 'title', 'description', 'category',
    'mediaType', 'altText', 'featured', 'active', 'is_active', 'displayOrder', 'display_order',
    'createdAt', 'created_at', 'serviceSlug', 'service_slug', 'brand', 'model', 'updated_at'
  ],
  reviews: [
    'id', 'customerName', 'customer_name', 'reviewerName', 'reviewer_name', 'rating', 'reviewText', 'review_text',
    'customerPhotoUrl', 'customer_photo_url', 'source', 'featured', 'active', 'is_active',
    'displayOrder', 'display_order', 'createdAt', 'created_at', 'updatedAt', 'updated_at',
    'serviceSlug', 'service_slug', 'service_availed', 'device_model', 'comment'
  ],
  offers: [
    'id', 'categoryId', 'category_id', 'category', 'title', 'description', 'imageUrl', 'image_url',
    'discount', 'discount_amount', 'startDate', 'endDate', 'valid_until', 'terms', 'ctaText', 'ctaType',
    'ctaValue', 'isFeatured', 'isActive', 'is_active', 'displayOrder', 'display_order', 'created_at', 'updated_at'
  ],
  offer_categories: [
    'id', 'name', 'slug', 'description', 'display_order', 'is_active', 'active', 'created_at'
  ],
  trust_points: [
    'id', 'title', 'description', 'icon', 'image_url', 'is_featured', 'featured',
    'is_active', 'active', 'display_order', 'created_at', 'updated_at'
  ],
  faqs: [
    'id', 'question', 'answer', 'category', 'display_order', 'is_active', 'active', 'created_at'
  ],
  website_sections: [
    'id', 'page', 'section_key', 'section_name', 'description', 'is_visible',
    'display_order', 'settings', 'updated_at'
  ],
  pages: [
    'id', 'title', 'slug', 'sections', 'featured_image', 'seo_title',
    'meta_description', 'og_image_url', 'display_order', 'featured', 'status',
    'created_at', 'updated_at'
  ],
  blog_posts: [
    'id', 'title', 'slug', 'content', 'featured_image', 'author_name', 'category',
    'tags', 'publish_date', 'seo_title', 'meta_description', 'og_image_url',
    'status', 'display_order', 'created_at', 'updated_at'
  ],
  blog_categories: [
    'id', 'name', 'slug', 'description', 'display_order', 'created_at'
  ],
  navigation_items: [
    'id', 'label', 'url', 'display_order', 'is_active', 'active', 'image_url', 'created_at'
  ],
  legal_pages: [
    'id', 'page_type', 'title', 'slug', 'seo_title', 'meta_description',
    'is_published', 'updated_at'
  ],
  legal_sections: [
    'id', 'page_id', 'heading', 'content', 'display_order', 'is_active', 'active',
    'created_at', 'updated_at'
  ],
  service_bookings: [
    'id', 'service_id', 'customer_name', 'address', 'pin_code', 'contact_number',
    'whatsapp_number', 'mobile_brand', 'mobile_model', 'problem', 'preferred_date',
    'preferred_time', 'front_image_url', 'back_image_url', 'status', 'created_at', 'updated_at'
  ],
  bookings: [
    'id', 'service_id', 'serviceId', 'service_name', 'brand', 'model', 'problem_description',
    'customer_name', 'phone', 'whatsapp', 'address', 'preferred_date', 'preferred_time',
    'status', 'created_at', 'updated_at'
  ],
  media_items: [
    'id', 'name', 'url', 'type', 'size', 'created_at'
  ],
  hero_slides: [
    'id', 'title', 'image_url', 'active', 'is_active', 'display_order', 'created_at'
  ],
  seo_settings: [
    'id', 'site_title', 'meta_description', 'primary_keyword', 'secondary_keywords',
    'canonical_url', 'og_title', 'og_description', 'og_image_url', 'robots_config',
    'search_console_verification', 'google_analytics_id', 'updated_at'
  ],
  videos: [
    'id', 'title', 'description', 'category', 'videoUrl', 'video_url', 'image_url', 'thumbnailUrl', 'thumbnail_url',
    'videoPlatform', 'youtubeVideoId', 'featured', 'active', 'is_active',
    'displayOrder', 'display_order', 'createdAt', 'created_at', 'serviceSlug', 'brand', 'model', 'updated_at'
  ]
};

// Common camelCase to snake_case field mappings
const CAMEL_TO_SNAKE_MAP: Record<string, string> = {
  branchCode: 'branch_code',
  googleMapsUrl: 'google_maps_url',
  businessHours: 'business_hours',
  isHeadquarters: 'is_headquarters',
  displayOrder: 'display_order',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  brandName: 'brand_name',
  businessName: 'business_name',
  primaryPhone: 'primary_phone',
  whatsappNumber: 'whatsapp_number',
  fullAddress: 'full_address',
  aboutText: 'about_text',
  aboutHighlight: 'about_highlight',
  facebookPageUrl: 'facebook_page_url',
  facebookUrl: 'facebook_url',
  instagramProfileUrl: 'instagram_profile_url',
  instagramUrl: 'instagram_url',
  whatsappChannelLink: 'whatsapp_channel_link',
  whatsappChannelUrl: 'whatsapp_channel_url',
  googleMapsLink: 'google_maps_link',
  mapEmbedIframeLink: 'map_embed_iframe_link',
  mapIframeUrl: 'map_iframe_url',
  youtubeUrl: 'youtube_url',
  imageUrl: 'image_url',
  priceType: 'price_type',
  estimatedTime: 'estimated_time',
  problemsCovered: 'problems_covered',
  diagnosisProcess: 'diagnosis_process',
  repairProcessSteps: 'repair_process_steps',
  toolsAndTech: 'tools_and_tech',
  supportedBrands: 'supported_brands',
  supportedModels: 'supported_models',
  modelPrices: 'model_prices',
  qualityOptions: 'quality_options',
  importantNotes: 'important_notes',
  seoTitle: 'seo_title',
  metaDescription: 'meta_description',
  seoKeywords: 'seo_keywords',
  canonicalUrl: 'canonical_url',
  ogImageUrl: 'og_image_url',
  isActive: 'is_active',
  isFeatured: 'is_featured',
  longDescription: 'long_description',
  serviceSlugs: 'service_slugs',
  releaseYear: 'release_year',
  servicePrices: 'service_prices',
  availableServices: 'available_services',
  serviceId: 'service_id',
  serviceSlug: 'service_slug',
  serviceName: 'service_name',
  brandId: 'brand_id',
  modelId: 'model_id',
  displayVariant: 'display_variant',
  mediaType: 'media_type',
  videoUrl: 'video_url',
  videoPlatform: 'video_platform',
  youtubeVideoId: 'youtube_video_id',
  beforeImageUrl: 'before_image_url',
  afterImageUrl: 'after_image_url',
  thumbnailUrl: 'thumbnail_url',
  altText: 'alt_text',
  customerName: 'customer_name',
  reviewerName: 'reviewer_name',
  reviewText: 'review_text',
  customerPhotoUrl: 'customer_photo_url',
  isVerified: 'is_verified',
  bookingId: 'booking_id',
  serviceAvailed: 'service_availed',
  deviceModel: 'device_model',
  googleReviewId: 'google_review_id',
  googleReviewUrl: 'google_review_url',
  categoryId: 'category_id',
  destinationUrl: 'destination_url',
  startDate: 'start_date',
  endDate: 'end_date',
  validUntil: 'valid_until',
  ctaText: 'cta_text',
  ctaType: 'cta_type',
  ctaValue: 'cta_value',
  sectionKey: 'section_key',
  sectionName: 'section_name',
  isVisible: 'is_visible',
  featuredImage: 'featured_image',
  authorName: 'author_name',
  publishDate: 'publish_date',
  pageType: 'page_type',
  isPublished: 'is_published',
  pageId: 'page_id',
  contactNumber: 'contact_number',
  mobileBrand: 'mobile_brand',
  mobileModel: 'mobile_model',
  preferredDate: 'preferred_date',
  preferredTime: 'preferred_time',
  frontImageUrl: 'front_image_url',
  backImageUrl: 'back_image_url',
  siteTitle: 'site_title',
  primaryKeyword: 'primary_keyword',
  secondaryKeywords: 'secondary_keywords',
  ogTitle: 'og_title',
  ogDescription: 'og_description',
  robotsConfig: 'robots_config',
  searchConsoleVerification: 'search_console_verification',
  googleAnalyticsId: 'google_analytics_id'
};

/**
 * Clean a JavaScript object before sending to Supabase PostgREST API.
 * Converts camelCase properties to snake_case and removes any non-column properties.
 */
export function sanitizePayload<T = Record<string, any>>(tableName: string, payload: any): T {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const validCols = TABLE_COLUMNS[tableName];
  const result: Record<string, any> = {};

  if (validCols && validCols.length > 0) {
    const validSet = new Set(validCols);
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined) continue;

      // 1. Direct match with a column name in the database
      if (validSet.has(key)) {
        result[key] = value;
        continue;
      }

      // 2. Check if the snake_case counterpart exists in the database
      const snakeKey = CAMEL_TO_SNAKE_MAP[key];
      if (snakeKey && validSet.has(snakeKey)) {
        result[snakeKey] = value;
        continue;
      }

      // 3. Check if the camelCase counterpart exists in the database (for snake_case payload properties)
      const camelKey = Object.keys(CAMEL_TO_SNAKE_MAP).find(
        (k) => CAMEL_TO_SNAKE_MAP[k] === key
      );
      if (camelKey && validSet.has(camelKey)) {
        result[camelKey] = value;
        continue;
      }
    }
  } else {
    // If table columns are not explicitly listed, keep all converted keys using CAMEL_TO_SNAKE_MAP mapping
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined) continue;
      const snakeKey = CAMEL_TO_SNAKE_MAP[key] || key;
      result[snakeKey] = value;
    }
  }

  return result as T;
}

/**
 * Map a database row retrieved from Supabase (snake_case keys) back to camelCase.
 */
export function mapDatabaseRowToCamelCase<T = any>(row: any): T {
  if (!row || typeof row !== 'object') {
    return row;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    // Find the camelCase counterpart key
    const camelKey = Object.keys(CAMEL_TO_SNAKE_MAP).find(
      (k) => CAMEL_TO_SNAKE_MAP[k] === key
    ) || key;
    result[camelKey] = value;
  }

  // Also support fallback compatibility for active and featured properties
  if (result.active === undefined && row.is_active !== undefined) {
    result.active = !!row.is_active;
  }
  if (result.featured === undefined && row.is_featured !== undefined) {
    result.featured = !!row.is_featured;
  }

  return result as T;
}
