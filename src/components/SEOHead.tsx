import { useEffect } from 'react';
import { SEOSettings, Service, ServiceCategory } from '../types';
import { initGA4 } from '../lib/analytics';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  noindex?: boolean;
  seoSettings?: SEOSettings;
  serviceData?: Service;
  categoryData?: ServiceCategory;
  currentRoute?: string;
}

export default function SEOHead({
  title,
  description,
  canonicalPath,
  ogImage,
  noindex,
  seoSettings,
  serviceData,
  categoryData,
  currentRoute
}: SEOHeadProps) {
  useEffect(() => {
    // Initialize GA4 if measurement ID exists
    if (seoSettings?.googleAnalyticsId) {
      initGA4(seoSettings.googleAnalyticsId);
    }

    const baseUrl = seoSettings?.canonicalUrl?.replace(/\/$/, '') || 'https://mobosavior.com';
    const siteBrand = 'MOBO SAVIOR | Mobile Repair Shop in Purulia';

    // 1. Determine Title
    let finalTitle = '';
    if (serviceData?.seoTitle) {
      finalTitle = serviceData.seoTitle.includes('MOBO SAVIOR')
        ? serviceData.seoTitle
        : `${serviceData.seoTitle} | MOBO SAVIOR`;
    } else if (serviceData) {
      finalTitle = `${serviceData.name} in Purulia | MOBO SAVIOR`;
    } else if (categoryData?.seoTitle) {
      finalTitle = categoryData.seoTitle.includes('MOBO SAVIOR')
        ? categoryData.seoTitle
        : `${categoryData.seoTitle} | MOBO SAVIOR`;
    } else if (categoryData) {
      finalTitle = `${categoryData.name} in Purulia | MOBO SAVIOR`;
    } else if (title) {
      finalTitle = title.includes('MOBO SAVIOR') ? title : `${title} | MOBO SAVIOR`;
    } else {
      finalTitle = seoSettings?.siteTitle || 'Mobile Repair & Motherboard Repair in Purulia | MOBO SAVIOR';
    }

    document.title = finalTitle;

    // 2. Determine Description
    let finalDesc = '';
    if (serviceData?.metaDescription) {
      finalDesc = serviceData.metaDescription;
    } else if (serviceData) {
      finalDesc = `Expert ${serviceData.name} in Purulia by MOBO SAVIOR. Specialized micro-soldering, genuine parts, and same-day diagnostics by Saddam Bhai.`;
    } else if (categoryData?.metaDescription) {
      finalDesc = categoryData.metaDescription;
    } else if (categoryData) {
      finalDesc = `Specialized ${categoryData.name} services in Purulia by MOBO SAVIOR. ${categoryData.description || 'Component-level logic board recovery, display replacement and advanced diagnostics.'}`;
    } else if (description) {
      finalDesc = description;
    } else {
      finalDesc = seoSettings?.metaDescription || 'MOBO SAVIOR is a professional mobile repairing shop in Purulia specializing in iPhone & Android repair, motherboard repair, CPU reballing, IC repair, display replacement and advanced diagnostics.';
    }

    // Helper to set or create meta tag
    const setMetaTag = (selector: string, attrName: string, attrValue: string, contentValue: string) => {
      let meta = document.querySelector(selector);
      if (meta) {
        meta.setAttribute('content', contentValue);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrValue);
        meta.setAttribute('content', contentValue);
        document.head.appendChild(meta);
      }
    };

    setMetaTag('meta[name="description"]', 'name', 'description', finalDesc);

    // 3. Robots Meta Config
    const isPrivate = noindex || currentRoute === 'moboadmin2026' || currentRoute === 'my-booking';
    const robotsValue = isPrivate ? 'noindex, nofollow' : (seoSettings?.robotsConfig || 'index, follow');
    setMetaTag('meta[name="robots"]', 'name', 'robots', robotsValue);

    // 4. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', finalTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDesc);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteBrand);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', serviceData ? 'article' : 'website');

    // OG Image
    const finalOgImage = ogImage || serviceData?.ogImageUrl || serviceData?.imageUrl || categoryData?.imageUrl || seoSettings?.ogImageUrl || `${baseUrl}/logo.png`;
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', finalOgImage);

    // Canonical & OG URL
    const activeHashPath = canonicalPath || (currentRoute ? (currentRoute === 'home' ? '' : `#/${currentRoute}`) : '');
    const fullCanonicalUrl = serviceData?.canonicalUrl || `${baseUrl}/${activeHashPath.replace(/^\//, '')}`;

    setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', fullCanonicalUrl);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = fullCanonicalUrl;
      document.head.appendChild(link);
    }

    // 5. Twitter Card Meta
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', finalDesc);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', finalOgImage);

    // 6. Google Search Console Verification
    if (seoSettings?.searchConsoleVerification) {
      let verificationVal = seoSettings.searchConsoleVerification.trim();
      // Extract content string if user pasted full HTML meta tag like <meta name="google-site-verification" content="XYZ" />
      const contentMatch = verificationVal.match(/content=["']([^"']+)["']/i);
      if (contentMatch) {
        verificationVal = contentMatch[1];
      }
      setMetaTag('meta[name="google-site-verification"]', 'name', 'google-site-verification', verificationVal);
    }
  }, [title, description, canonicalPath, ogImage, noindex, seoSettings, serviceData, categoryData, currentRoute]);

  return null;
}
