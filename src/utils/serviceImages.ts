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
  // 1. Motherboard & Chip-Level Repair
  'cat-motherboard': '/assets/images/motherboard_repair_1790050660908.jpg',
  'motherboard-repair': '/assets/images/motherboard_repair_1790050660908.jpg',
  'advanced-chip-level-repair': '/assets/images/motherboard_repair_1790050660908.jpg',

  // 2. Android Phone Repair
  'cat-android': '/assets/images/android_repair_1790050677195.jpg',
  'android-repair': '/assets/images/android_repair_1790050677195.jpg',

  // 3. Samsung Flip & Fold Repair
  'cat-flip-fold': '/assets/images/flip_fold_repair_1790050690123.jpg',
  'flip-fold-repair': '/assets/images/flip_fold_repair_1790050690123.jpg',
  'samsung-fold-repair': '/assets/images/flip_fold_repair_1790050690123.jpg',
  'samsung-flip-repair': '/assets/images/flip_fold_repair_1790050690123.jpg',

  // 4. Display & Touch Replacement
  'cat-display': '/assets/images/display_replacement_1790050710979.jpg',
  'display-replacement': '/assets/images/display_replacement_1790050710979.jpg',
  'original-display': '/assets/images/display_replacement_1790050710979.jpg',

  // 5. Battery & Charging Port Solutions
  'cat-battery-charging': '/assets/images/battery_charging_1790050730031.jpg',
  'battery-charging-solutions': '/assets/images/battery_charging_1790050730031.jpg',
  'battery-replacement': '/assets/images/battery_charging_1790050730031.jpg',
  'charging-problem': '/assets/images/battery_charging_1790050730031.jpg',

  // 6. Software & Programming
  'cat-software': '/assets/images/software_programming_1790050745198.jpg',
  'software-programming': '/assets/images/software_programming_1790050745198.jpg',

  // 7. CPU Reballing & Restart Solution
  'cat-cpu-reballing': '/assets/images/cpu_reballing_1790050758447.jpg',
  'cpu-reballing': '/assets/images/cpu_reballing_1790050758447.jpg',

  // 8. eMMC/UFS Reballing & Replacement
  'cat-emmc-ufs': '/assets/images/emmc_ufs_reballing_1790050773698.jpg',
  'emmc-ufs-reballing': '/assets/images/emmc_ufs_reballing_1790050773698.jpg',
  'emmc-ufs-programming': '/assets/images/emmc_ufs_reballing_1790050773698.jpg',

  // 9. Software & Unlocking Solutions
  'cat-software-unlocking': '/assets/images/software_unlocking_1790050786705.jpg',
  'software-unlocking': '/assets/images/software_unlocking_1790050786705.jpg',

  // 10. Motherboard Swapping & Pairing Solutions
  'cat-motherboard-swapping': '/assets/images/board_swapping_1790050811341.jpg',
  'motherboard-swapping': '/assets/images/board_swapping_1790050811341.jpg',

  // 11. Network & No Service Solutions
  'cat-network-solutions': '/assets/images/network_solutions_1790050826784.jpg',
  'network-solutions': '/assets/images/network_solutions_1790050826784.jpg',
  'network-signal-repair': '/assets/images/network_solutions_1790050826784.jpg',

  // 12. Curved Display Repair & Replacement
  'cat-curved-display': '/assets/images/curved_display_repair_1790050840795.jpg',
  'curved-display-repair': '/assets/images/curved_display_repair_1790050840795.jpg',
  'curved-display': '/assets/images/curved_display_repair_1790050840795.jpg',

  // 13. Curved Display Glass Cutting & Replacement
  'cat-curved-glass-cutting': '/assets/images/curved_glass_cutting_1790050858654.jpg',
  'curved-glass-cutting': '/assets/images/curved_glass_cutting_1790050858654.jpg',

  // 14. iPhone Back Glass / Back Panel Replacement
  'cat-iphone-back-glass': '/assets/images/back_glass_repair_1790050876115.jpg',
  'iphone-back-glass': '/assets/images/back_glass_repair_1790050876115.jpg',

  // Legacy mappings for backward compatibility
  'cat-iphone': '/assets/images/service_iphone_repair_1788169632215.jpg',
  'iphone-repair': '/assets/images/service_iphone_repair_1788169632215.jpg'
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
