import { PriceItem, Service } from '../types';

/**
 * Format a numeric or string amount into currency format, e.g. 3500 -> ₹3,500
 */
export function formatAmount(amount: number | string | undefined, currency = '₹'): string {
  if (amount === undefined || amount === null || amount === '') return '';
  const cleanStr = String(amount).replace(/[^0-9.]/g, '');
  const num = parseFloat(cleanStr);
  if (isNaN(num)) return String(amount);
  
  // Format with commas for INR
  const formattedNum = num.toLocaleString('en-IN');
  return `${currency}${formattedNum}`;
}

/**
 * Format a PriceItem into a readable string based on its priceType
 */
export function getFormattedPriceString(
  priceItem: PriceItem | null | undefined,
  fallbackText = 'Price available on enquiry'
): string {
  if (!priceItem || priceItem.isActive === false) {
    return fallbackText;
  }

  const currency = priceItem.currency || '₹';
  const amountStr = formatAmount(priceItem.amount, currency);

  switch (priceItem.priceType) {
    case 'fixed':
      return amountStr ? amountStr : 'Price available on enquiry';
    case 'starting_from':
      return amountStr ? `Starting from ${amountStr}` : 'Starting price on enquiry';
    case 'contact':
      return 'Contact for Price';
    case 'diagnosis':
      return 'Price after diagnosis';
    default:
      if (amountStr) return amountStr;
      return fallbackText;
  }
}

/**
 * Priority resolution engine:
 * 1. Model + Variant + Service match
 * 2. Model + Service match
 * 3. Brand + Variant + Service match
 * 4. Brand + Service match
 * 5. General Service + Variant match
 * 6. General Service price
 * 7. Legacy Service.price field fallback
 * 8. Fallback: "Price available on enquiry"
 */
export function resolveServicePrice(
  prices: PriceItem[],
  service: Service | string,
  brand?: string,
  model?: string,
  displayVariant?: string
): {
  priceItem: PriceItem | null;
  formattedPrice: string;
  isModelOverride: boolean;
  notes?: string;
} {
  const serviceSlug = typeof service === 'string' ? service : service.slug;
  const legacyPrice = typeof service === 'object' ? service.price : undefined;
  const legacyPriceType = typeof service === 'object' ? service.priceType : undefined;

  const activePrices = (prices || []).filter(p => p.isActive !== false);

  const cleanSlug = (serviceSlug || '').toLowerCase().trim();
  const cleanBrand = (brand || '').toLowerCase().trim();
  const cleanModel = (model || '').toLowerCase().trim();
  const cleanVariant = (displayVariant || '').toLowerCase().trim();

  // Filter prices for this service slug
  const servicePrices = activePrices.filter(p => (p.serviceSlug || '').toLowerCase().trim() === cleanSlug);

  let matchedItem: PriceItem | null = null;
  let isModelOverride = false;

  if (servicePrices.length > 0) {
    // Priority 1: Model + Variant + Service
    if (cleanModel && cleanVariant) {
      matchedItem = servicePrices.find(p => 
        (p.model || '').toLowerCase().trim() === cleanModel &&
        (p.displayVariant || '').toLowerCase().trim() === cleanVariant
      ) || null;
      if (matchedItem) isModelOverride = true;
    }

    // Priority 2: Model + Service
    if (!matchedItem && cleanModel) {
      matchedItem = servicePrices.find(p => 
        (p.model || '').toLowerCase().trim() === cleanModel &&
        (!p.displayVariant || p.displayVariant.trim() === '')
      ) || null;
      if (matchedItem) isModelOverride = true;
    }

    // Priority 3: Brand + Variant + Service
    if (!matchedItem && cleanBrand && cleanVariant) {
      matchedItem = servicePrices.find(p => 
        (p.brand || '').toLowerCase().trim() === cleanBrand &&
        (!p.model || p.model.trim() === '') &&
        (p.displayVariant || '').toLowerCase().trim() === cleanVariant
      ) || null;
    }

    // Priority 4: Brand + Service
    if (!matchedItem && cleanBrand) {
      matchedItem = servicePrices.find(p => 
        (p.brand || '').toLowerCase().trim() === cleanBrand &&
        (!p.model || p.model.trim() === '') &&
        (!p.displayVariant || p.displayVariant.trim() === '')
      ) || null;
    }

    // Priority 5: General Service + Variant
    if (!matchedItem && cleanVariant) {
      matchedItem = servicePrices.find(p => 
        (!p.model || p.model.trim() === '') &&
        (!p.brand || p.brand.trim() === '') &&
        (p.displayVariant || '').toLowerCase().trim() === cleanVariant
      ) || null;
    }

    // Priority 6: General Service
    if (!matchedItem) {
      matchedItem = servicePrices.find(p => 
        (!p.model || p.model.trim() === '') &&
        (!p.brand || p.brand.trim() === '') &&
        (!p.displayVariant || p.displayVariant.trim() === '')
      ) || null;
    }
  }

  if (matchedItem) {
    return {
      priceItem: matchedItem,
      formattedPrice: getFormattedPriceString(matchedItem),
      isModelOverride,
      notes: matchedItem.notes
    };
  }

  // Priority 8: Unconfigured fallback
  return {
    priceItem: null,
    formattedPrice: 'Price available on enquiry',
    isModelOverride: false
  };
}
