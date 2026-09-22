/**
 * Google Analytics 4 (GA4) Integration & Event Tracking Utility
 * MOBO SAVIOR - Micro-Soldering & Mobile Repair Lab, Purulia
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Keys that could contain PII (Personally Identifiable Information) and must be blocked from Analytics
const PII_KEYS = [
  'name', 'customerName', 'customer_name',
  'phone', 'phoneNumber', 'phone_number',
  'whatsapp', 'whatsappNumber',
  'email', 'customerEmail',
  'address', 'streetAddress',
  'message', 'notes', 'problemDescription',
  'bookingId', 'id'
];

/**
 * Clean parameters to ensure zero PII is sent to Google Analytics
 */
function sanitizeParams(params?: Record<string, any>): Record<string, any> {
  if (!params) return {};
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!PII_KEYS.includes(key) && value !== undefined && value !== null) {
      sanitized[key] = typeof value === 'string' ? value.substring(0, 100) : value;
    }
  }
  return sanitized;
}

/**
 * Initialize GA4 tracking script dynamically if Measurement ID is provided
 */
export function initGA4(measurementId?: string): void {
  if (!measurementId || typeof window === 'undefined') return;

  const trimmedId = measurementId.trim();
  if (!trimmedId || !/^G-[A-Z0-9]+$/i.test(trimmedId)) {
    return;
  }

  // Avoid duplicate injection
  const existingScript = document.getElementById('ga4-gtag-script');
  if (existingScript) {
    if (window.gtag) {
      window.gtag('config', trimmedId, { send_page_view: true });
    }
    return;
  }

  // Inject Google Tag Manager / Analytics Script
  const script = document.createElement('script');
  script.id = 'ga4-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trimmedId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', trimmedId, {
    send_page_view: true,
    anonymize_ip: true
  });
}

/**
 * Core event tracking function
 */
export function trackEvent(eventName: string, params?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  const safeParams = sanitizeParams(params);

  // Send to GA4 if configured
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, safeParams);
  } else {
    // Fallback dataLayer push if gtag script loaded via another wrapper
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...safeParams
    });
  }
}

// ==========================================
// CUSTOMER ACTION SPECIFIC TRACKING HELPERS
// ==========================================

export function trackWhatsAppClick(params?: { service_name?: string; category?: string; source?: string }): void {
  trackEvent('whatsapp_click', {
    event_category: 'Engagement',
    event_label: 'WhatsApp Contact',
    ...params
  });
}

export function trackPhoneCallClick(params?: { source?: string }): void {
  trackEvent('phone_call_click', {
    event_category: 'Engagement',
    event_label: 'Phone Call Direct',
    ...params
  });
}

export function trackDirectionsClick(params?: { source?: string }): void {
  trackEvent('directions_click', {
    event_category: 'Engagement',
    event_label: 'Google Maps Directions',
    ...params
  });
}

export function trackEnquiryFormOpen(params?: { service_name?: string; category?: string }): void {
  trackEvent('enquiry_form_open', {
    event_category: 'Lead Generation',
    event_label: 'Form Opened',
    ...params
  });
}

export function trackEnquirySubmit(params?: { service_name?: string; brand?: string; model?: string; category?: string; source?: string }): void {
  trackEvent('enquiry_submit', {
    event_category: 'Lead Generation',
    event_label: 'Form Submitted',
    ...params
  });
}

export function trackBookRepairClick(params?: { service_name?: string; category?: string; brand?: string; model?: string; source?: string }): void {
  trackEvent('book_repair_click', {
    event_category: 'Conversion',
    event_label: 'Book Repair CTA',
    ...params
  });
}

export function trackServiceEnquiryClick(params?: { service_name?: string; category?: string }): void {
  trackEvent('service_enquiry_click', {
    event_category: 'Lead Generation',
    event_label: 'Service Spec Query',
    ...params
  });
}

export function trackServiceView(params?: { service_name?: string; service_slug?: string; category?: string }): void {
  trackEvent('service_view', {
    event_category: 'Content View',
    event_label: 'Service Detail Opened',
    ...params
  });
}
