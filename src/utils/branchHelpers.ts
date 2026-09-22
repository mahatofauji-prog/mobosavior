import { Branch, WeeklyBusinessHours, DayBusinessHours } from '../types';

/**
 * Calculates whether a branch is currently open or closed based on local time.
 */
export function isOpenNow(branch: Branch): { isOpen: boolean; statusText: string; todayHoursText: string } {
  if (!branch.isActive) {
    return { isOpen: false, statusText: 'Inactive', todayHoursText: 'Branch Offline' };
  }

  const now = new Date();
  const dayNames: (keyof WeeklyBusinessHours)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  const currentDayKey = dayNames[now.getDay()];
  const hoursToday: DayBusinessHours = branch.businessHours?.[currentDayKey] || {
    isOpen: true,
    openTime: '09:30',
    closeTime: '20:30'
  };

  if (!hoursToday.isOpen) {
    return { isOpen: false, statusText: 'Closed Today', todayHoursText: 'Weekly Holiday' };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = (hoursToday.openTime || '09:30').split(':').map(Number);
  const [closeH, closeM] = (hoursToday.closeTime || '20:30').split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

  const format12H = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const minStr = m < 10 ? `0${m}` : m;
    return `${hour12}:${minStr} ${ampm}`;
  };

  const todayHoursText = `${format12H(hoursToday.openTime)} - ${format12H(hoursToday.closeTime)}`;

  return {
    isOpen,
    statusText: isOpen ? 'Open Now' : 'Closed Now',
    todayHoursText
  };
}

/**
 * Calculates Haversine distance in kilometers between two lat/lon coordinates.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}

export interface BranchWithDistance extends Branch {
  distanceKm?: number;
}

/**
 * Sorts active branches by distance from user coordinates.
 */
export function sortBranchesByDistance(
  branches: Branch[],
  userLat?: number,
  userLon?: number
): BranchWithDistance[] {
  const activeBranches = branches.filter((b) => b.isActive);

  if (userLat === undefined || userLon === undefined) {
    // If no coordinates, main branch first, then displayOrder
    return activeBranches.sort((a, b) => {
      if (a.isMain) return -1;
      if (b.isMain) return 1;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }

  return activeBranches
    .map((branch) => {
      let distanceKm: number | undefined = undefined;
      if (branch.latitude !== undefined && branch.longitude !== undefined) {
        distanceKm = calculateDistanceKm(userLat, userLon, branch.latitude, branch.longitude);
      }
      return { ...branch, distanceKm };
    })
    .sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== undefined) return -1;
      if (b.distanceKm !== undefined) return 1;
      if (a.isMain) return -1;
      if (b.isMain) return 1;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
}

/**
 * Generates a pre-filled WhatsApp click-to-chat URL for a specific branch.
 */
export function buildBranchWhatsappUrl(
  branch: Branch,
  serviceName?: string,
  enquiryMessage?: string
): string {
  const cleanPhone = (branch.whatsapp || branch.phone || '').replace(/[^0-9]/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  let text = `Hello MOBO SAVIOR (${branch.name}), I would like to enquire about mobile repair services.`;

  if (serviceName) {
    text = `Hello MOBO SAVIOR, I want to enquire about [${serviceName}] at ${branch.name}.`;
  }

  if (enquiryMessage) {
    text += ` Details: ${enquiryMessage}`;
  }

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates telephone call link
 */
export function buildBranchPhoneCallUrl(branch: Branch): string {
  const cleanPhone = (branch.phone || '').replace(/[^0-9]/g, '');
  return `tel:${cleanPhone}`;
}
