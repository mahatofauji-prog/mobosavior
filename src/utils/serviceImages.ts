import { Service, ServiceCategory } from '../types';

/**
 * Normalizes any image URL to ensure compatibility with Vercel and production builds.
 * Converts old '/src/assets/images/' paths to clean public '/assets/images/'.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return '/assets/images/service_iphone_repair_1788169632215.jpg';
  }
  let clean = url.trim();
  if (clean.startsWith('/src/assets/images/')) {
    clean = clean.replace('/src/assets/images/', '/assets/images/');
  } else if (clean.startsWith('src/assets/images/')) {
    clean = clean.replace('src/assets/images/', '/assets/images/');
  }
  return clean;
}

export const DEFAULT_SERVICE_IMAGES: Record<string, string> = {
  // Category Slugs & IDs
  'cat-iphone': '/assets/images/service_iphone_repair_1788169632215.jpg',
  'iphone-repair': '/assets/images/service_iphone_repair_1788169632215.jpg',
  
  'cat-android': '/assets/images/slide_android_1788168049303.jpg',
  'android-repair': '/assets/images/slide_android_1788168049303.jpg',
  
  'cat-motherboard': '/assets/images/differ_micro_soldering_1788169185732.jpg',
  'motherboard-repair': '/assets/images/differ_micro_soldering_1788169185732.jpg',
  
  'cat-cpu-reballing': '/assets/images/service_cpu_soldering_1788169676958.jpg',
  'cpu-reballing': '/assets/images/service_cpu_soldering_1788169676958.jpg',
  
  'cat-emmc-ufs': '/assets/images/slide_cpuic_1788168157704.jpg',
  'emmc-ufs-reballing': '/assets/images/slide_cpuic_1788168157704.jpg',
  'emmc-ufs-programming': '/assets/images/slide_cpuic_1788168157704.jpg',
  
  'cat-software-unlocking': '/assets/images/differ_diagnostic_bench_1788169232321.jpg',
  'software-unlocking': '/assets/images/differ_diagnostic_bench_1788169232321.jpg',
  'software-programming': '/assets/images/service_software_edl_1788169726207.jpg',
  'cat-software': '/assets/images/service_software_edl_1788169726207.jpg',
  
  'cat-motherboard-swapping': '/assets/images/slide_deadphone_1788168106265.jpg',
  'motherboard-swapping': '/assets/images/slide_deadphone_1788168106265.jpg',
  
  'cat-network-solutions': '/assets/images/slide_network_1788168142613.jpg',
  'network-solutions': '/assets/images/slide_network_1788168142613.jpg',
  'network-signal-repair': '/assets/images/slide_network_1788168142613.jpg',
  
  'cat-curved-display': '/assets/images/slide_flip_1788168172190.jpg',
  'curved-display-repair': '/assets/images/slide_flip_1788168172190.jpg',
  'curved-display': '/assets/images/slide_flip_1788168172190.jpg',
  
  'cat-curved-glass-cutting': '/assets/images/slide_display_1788168074454.jpg',
  'curved-glass-cutting': '/assets/images/slide_display_1788168074454.jpg',
  
  'cat-iphone-back-glass': '/assets/images/slide_iphone_1788168033319.jpg',
  'iphone-back-glass': '/assets/images/slide_iphone_1788168033319.jpg',
  
  'cat-flip-fold': '/assets/images/service_foldable_repair_1788169709156.jpg',
  'flip-fold-repair': '/assets/images/service_foldable_repair_1788169709156.jpg',
  'flip-fold-mobile-repair': '/assets/images/service_foldable_repair_1788169709156.jpg',
  'samsung-fold-repair': '/assets/images/service_foldable_repair_1788169709156.jpg',
  'samsung-flip-repair': '/assets/images/slide_foldable_1788168190438.jpg',
  'foldable-display-repair': '/assets/images/service_foldable_repair_1788169709156.jpg',
  'hinge-repair': '/assets/images/slide_foldable_1788168190438.jpg',
  'inner-display-repair': '/assets/images/service_foldable_repair_1788169709156.jpg',
  'outer-display-repair': '/assets/images/slide_display_1788168074454.jpg',
  
  // Display Specialty
  'cat-display': '/assets/images/service_display_replace_1788169648346.jpg',
  'display-replacement': '/assets/images/service_display_replace_1788169648346.jpg',
  'tft-display': '/assets/images/service_display_replace_1788169648346.jpg',
  'oled-display': '/assets/images/slide_display_1788168074454.jpg',
  'premium-display': '/assets/images/slide_display_1788168074454.jpg',
  'original-display': '/assets/images/service_display_replace_1788169648346.jpg',
  'green-line-fix': '/assets/images/service_display_replace_1788169648346.jpg',
  'green-line-white-display': '/assets/images/service_display_replace_1788169648346.jpg',
  'touch-problem': '/assets/images/service_display_replace_1788169648346.jpg',
  
  // Hardware & Logic Board
  'ic-replacement': '/assets/images/slide_cpuic_1788168157704.jpg',
  'dead-no-power-repair': '/assets/images/service_dead_phone_1788169662887.jpg',
  'advanced-chip-level-repair': '/assets/images/differ_micro_soldering_1788169185732.jpg',
  'battery-replacement': '/assets/images/service_battery_replace_1788169692807.jpg',
  'water-damage': '/assets/images/service_dead_phone_1788169662887.jpg',
  'water-damage-repair': '/assets/images/service_dead_phone_1788169662887.jpg',
  'charging-problem': '/assets/images/slide_chargeport_1788168121909.jpg',
  'charging-repair': '/assets/images/slide_chargeport_1788168121909.jpg',
  'network-problem': '/assets/images/slide_network_1788168142613.jpg',
  'network-repair': '/assets/images/slide_network_1788168142613.jpg',
  'camera-problem': '/assets/images/differ_thermal_inspection_1788169210295.jpg',
  'dead-phone-repair': '/assets/images/service_dead_phone_1788169662887.jpg',
  'cpu-ic-level-repair': '/assets/images/service_cpu_soldering_1788169676958.jpg',
  
  // ID Mappings
  'srv-1': '/assets/images/service_iphone_repair_1788169632215.jpg',
  'srv-2': '/assets/images/slide_android_1788168049303.jpg',
  'srv-3': '/assets/images/differ_micro_soldering_1788169185732.jpg',
  'srv-4': '/assets/images/service_cpu_soldering_1788169676958.jpg',
  'srv-5': '/assets/images/differ_diagnostic_bench_1788169232321.jpg',
  'srv-6': '/assets/images/slide_cpuic_1788168157704.jpg',
  'srv-7': '/assets/images/service_display_replace_1788169648346.jpg',
  'srv-8': '/assets/images/slide_display_1788168074454.jpg',
  'srv-9': '/assets/images/slide_display_1788168074454.jpg',
  'srv-10': '/assets/images/service_display_replace_1788169648346.jpg',
  'srv-11': '/assets/images/service_display_replace_1788169648346.jpg',
  'srv-12': '/assets/images/service_foldable_repair_1788169709156.jpg',
  'srv-13': '/assets/images/service_battery_replace_1788169692807.jpg',
  'srv-14': '/assets/images/differ_diagnostic_bench_1788169232321.jpg',
  'srv-15': '/assets/images/service_dead_phone_1788169662887.jpg',
  'srv-16': '/assets/images/slide_chargeport_1788168121909.jpg',
  'srv-17': '/assets/images/slide_network_1788168142613.jpg',
  'srv-18': '/assets/images/differ_thermal_inspection_1788169210295.jpg'
};

/**
 * Returns the exact service image.
 * Uses srv.imageUrl if set (e.g. uploaded/configured in database or admin portal),
 * otherwise resolves to the pre-generated asset for that service.
 */
export function getServiceImage(service?: Partial<Service> | null): string {
  if (!service) {
    return '/assets/images/service_iphone_repair_1788169632215.jpg';
  }

  // 1. Direct database/storage imageUrl property
  if (service.imageUrl && service.imageUrl.trim() !== '') {
    return normalizeImageUrl(service.imageUrl);
  }

  // 2. Lookup by slug
  if (service.slug && DEFAULT_SERVICE_IMAGES[service.slug]) {
    return DEFAULT_SERVICE_IMAGES[service.slug];
  }

  // 3. Lookup by id
  if (service.id && DEFAULT_SERVICE_IMAGES[service.id]) {
    return DEFAULT_SERVICE_IMAGES[service.id];
  }

  // 4. Keyword match by name or category
  const nameLower = (service.name || '').toLowerCase();
  const catLower = (service.category || '').toLowerCase();

  if (nameLower.includes('iphone') || nameLower.includes('apple') || catLower.includes('apple')) {
    return DEFAULT_SERVICE_IMAGES['iphone-repair'];
  }
  if (nameLower.includes('android') || nameLower.includes('samsung') || nameLower.includes('oneplus') || nameLower.includes('xiaomi') || nameLower.includes('pixel') || catLower.includes('android')) {
    return DEFAULT_SERVICE_IMAGES['android-repair'];
  }
  if (nameLower.includes('motherboard') || nameLower.includes('logic board') || nameLower.includes('short') || nameLower.includes('micro-soldering') || catLower.includes('chip-level')) {
    return DEFAULT_SERVICE_IMAGES['motherboard-repair'];
  }
  if (nameLower.includes('cpu') || nameLower.includes('reballing') || nameLower.includes('processor')) {
    return DEFAULT_SERVICE_IMAGES['cpu-reballing'];
  }
  if (nameLower.includes('display') || nameLower.includes('screen') || nameLower.includes('lcd') || nameLower.includes('oled') || nameLower.includes('glass') || nameLower.includes('line') || nameLower.includes('touch') || catLower.includes('display')) {
    return DEFAULT_SERVICE_IMAGES['display-replacement'];
  }
  if (nameLower.includes('battery') || nameLower.includes('drain') || nameLower.includes('backup') || nameLower.includes('charging') || nameLower.includes('port')) {
    return DEFAULT_SERVICE_IMAGES['battery-replacement'];
  }
  if (nameLower.includes('flip') || nameLower.includes('fold') || nameLower.includes('hinge') || catLower.includes('special')) {
    return DEFAULT_SERVICE_IMAGES['flip-fold-repair'];
  }
  if (nameLower.includes('software') || nameLower.includes('emmc') || nameLower.includes('ufs') || nameLower.includes('program') || nameLower.includes('flash') || nameLower.includes('unlock') || catLower.includes('software')) {
    return DEFAULT_SERVICE_IMAGES['software-programming'];
  }
  if (nameLower.includes('water') || nameLower.includes('liquid') || nameLower.includes('dead')) {
    return DEFAULT_SERVICE_IMAGES['dead-phone-repair'];
  }
  if (nameLower.includes('network') || nameLower.includes('signal') || nameLower.includes('wifi') || nameLower.includes('sim') || nameLower.includes('no service')) {
    return DEFAULT_SERVICE_IMAGES['network-problem'];
  }
  if (nameLower.includes('camera') || nameLower.includes('lens') || nameLower.includes('sensor')) {
    return DEFAULT_SERVICE_IMAGES['camera-problem'];
  }

  return '/assets/images/service_iphone_repair_1788169632215.jpg';
}

/**
 * Returns a guaranteed distinct, dedicated image for a repair service category.
 */
export function getCategoryCardImage(cat?: Partial<ServiceCategory> | null): string {
  if (!cat) return '/assets/images/service_iphone_repair_1788169632215.jpg';

  // 1. Direct custom image URL if defined and valid
  if (cat.imageUrl && cat.imageUrl.trim() !== '' && !cat.imageUrl.includes('placeholder')) {
    return normalizeImageUrl(cat.imageUrl);
  }

  // 2. Direct slug/ID match from DEFAULT_SERVICE_IMAGES
  if (cat.slug && DEFAULT_SERVICE_IMAGES[cat.slug]) {
    return DEFAULT_SERVICE_IMAGES[cat.slug];
  }
  if (cat.id && DEFAULT_SERVICE_IMAGES[cat.id]) {
    return DEFAULT_SERVICE_IMAGES[cat.id];
  }

  // 3. Keyword / semantic resolution for distinct service categories
  const slug = (cat.slug || '').toLowerCase();
  const name = (cat.name || '').toLowerCase();

  if (slug.includes('cpu-reballing') || name.includes('cpu reballing')) {
    return '/assets/images/service_cpu_soldering_1788169676958.jpg';
  }
  if (slug.includes('emmc') || slug.includes('ufs') || name.includes('emmc') || name.includes('ufs')) {
    return '/assets/images/slide_cpuic_1788168157704.jpg';
  }
  if (slug.includes('software') || slug.includes('unlock') || name.includes('software') || name.includes('unlocking')) {
    return '/assets/images/differ_diagnostic_bench_1788169232321.jpg';
  }
  if (slug.includes('swapping') || slug.includes('transplant') || name.includes('swapping') || name.includes('transplant')) {
    return '/assets/images/slide_deadphone_1788168106265.jpg';
  }
  if (slug.includes('network') || slug.includes('signal') || name.includes('network') || name.includes('no-service')) {
    return '/assets/images/slide_network_1788168142613.jpg';
  }
  if (slug.includes('curved-display') || name.includes('curved display')) {
    return '/assets/images/slide_flip_1788168172190.jpg';
  }
  if (slug.includes('curved-glass') || name.includes('glass cutting') || name.includes('oca')) {
    return '/assets/images/slide_display_1788168074454.jpg';
  }
  if (slug.includes('back-glass') || name.includes('back glass') || name.includes('laser')) {
    return '/assets/images/slide_iphone_1788168033319.jpg';
  }
  if (slug.includes('flip') || slug.includes('fold') || name.includes('flip') || name.includes('fold')) {
    return '/assets/images/service_foldable_repair_1788169709156.jpg';
  }
  if (slug.includes('display') || slug.includes('screen') || name.includes('display') || name.includes('touch')) {
    return '/assets/images/service_display_replace_1788169648346.jpg';
  }
  if (slug.includes('battery') || name.includes('battery')) {
    return '/assets/images/service_battery_replace_1788169692807.jpg';
  }
  if (slug.includes('motherboard') || name.includes('motherboard') || name.includes('chip-level')) {
    return '/assets/images/differ_micro_soldering_1788169185732.jpg';
  }
  if (slug.includes('android') || name.includes('android')) {
    return '/assets/images/slide_android_1788168049303.jpg';
  }
  if (slug.includes('iphone') || name.includes('iphone') || name.includes('apple')) {
    return '/assets/images/service_iphone_repair_1788169632215.jpg';
  }

  return '/assets/images/differ_micro_soldering_1788169185732.jpg';
}
