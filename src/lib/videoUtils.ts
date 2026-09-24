export type SupportedVideoPlatform = 'youtube' | 'facebook' | 'instagram' | 'direct';

export interface ParsedVideoInfo {
  platform: SupportedVideoPlatform;
  originalUrl: string;
  embedUrl: string;
  youtubeId?: string;
  instagramShortcode?: string;
  defaultThumbnail?: string;
  isValid: boolean;
}

/**
 * Checks if a URL is a direct HTML5 playable video file (MP4, WebM, MOV, storage URL, blob URL)
 */
export function isDirectVideoUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:video/')) return true;
  if (trimmed.includes('/storage/v1/object/public/') && (trimmed.includes('.mp4') || trimmed.includes('.webm') || trimmed.includes('.mov') || trimmed.includes('video'))) return true;
  if (trimmed.includes('/uploads/') && (trimmed.includes('.mp4') || trimmed.includes('.webm') || trimmed.includes('.mov'))) return true;
  return /\.(mp4|webm|mov|m4v|ogv|mkv)(\?.*)?$/i.test(trimmed);
}

/**
 * Validates and extracts embed parameters for YouTube, Facebook, Instagram, and Direct video URLs.
 * Admin can paste YouTube watch/shorts, Facebook video/reel, Instagram reel/post links, or upload/paste MP4/WebM videos.
 */
export function parseVideoUrl(inputUrl: string | undefined | null): ParsedVideoInfo | null {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const url = inputUrl.trim();
  if (!url) return null;

  // 1. YouTube
  // Supports watch?v=, youtu.be/, shorts/, embed/, live/, v/, plus any trailing parameters like ?si= or &t=
  const ytRegexes = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([^"&?\/ ]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/ // raw ID fallback
  ];

  let ytId: string | null = null;
  for (const regex of ytRegexes) {
    if (regex === ytRegexes[1] && url.length === 11 && regex.test(url)) {
      ytId = url;
      break;
    }
    const match = url.match(regex);
    if (match && match[1]) {
      ytId = match[1];
      break;
    }
  }

  if (ytId) {
    return {
      platform: 'youtube',
      originalUrl: url.length === 11 ? `https://www.youtube.com/watch?v=${ytId}` : url,
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0&enablejsapi=1`,
      youtubeId: ytId,
      defaultThumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      isValid: true
    };
  }

  // 2. Direct Video File (MP4, WebM, MOV, Supabase Storage, Blob)
  if (isDirectVideoUrl(url)) {
    return {
      platform: 'direct',
      originalUrl: url,
      embedUrl: url,
      isValid: true
    };
  }

  // 3. Instagram
  // Matches: instagram.com/reel/CODE, instagram.com/reels/CODE, instagram.com/p/CODE, instagram.com/tv/CODE, instagr.am/...
  const igMatch = url.match(/(?:instagram\.com|instagr\.am)\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const shortcode = igMatch[1];
    return {
      platform: 'instagram',
      originalUrl: url,
      embedUrl: `https://www.instagram.com/p/${shortcode}/embed/`,
      instagramShortcode: shortcode,
      defaultThumbnail: undefined,
      isValid: true
    };
  }

  // 4. Facebook
  // Matches: facebook.com, fb.watch, fb.com, standard posts, videos, reels, stories, etc.
  const isFbDomain = /(?:facebook\.com|fb\.watch|fb\.com)/i.test(url);
  if (isFbDomain) {
    let cleanUrl = url;
    // Standardize mobile links to desktop style so embedding works reliably
    cleanUrl = cleanUrl.replace(/^(https?:\/\/)?m\.facebook\.com/i, 'https://www.facebook.com');
    // Normalize leading slash/domain if https is missing
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    return {
      platform: 'facebook',
      originalUrl: url,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=0&autoplay=1&mute=1`,
      defaultThumbnail: undefined,
      isValid: true
    };
  }

  // 5. Fallback for generic http/https URLs that could be custom video endpoints
  if (/^https?:\/\//i.test(url)) {
    return {
      platform: 'direct',
      originalUrl: url,
      embedUrl: url,
      isValid: true
    };
  }

  return null;
}

/**
 * Returns true if the URL is from a supported and valid YouTube, Facebook, Instagram, or Direct video source.
 */
export function isValidSocialVideoUrl(url: string | undefined | null): boolean {
  const parsed = parseVideoUrl(url);
  return !!(parsed && parsed.isValid);
}

/**
 * Safely extracts the official platform thumbnail URL or stored thumbnail.
 */
export function getOfficialVideoThumbnail(
  videoUrl: string | undefined | null,
  storedThumbnail?: string | null
): string | null {
  // 1. Use stored/uploaded thumbnail from Admin portal first
  if (storedThumbnail && typeof storedThumbnail === 'string') {
    const trimmed = storedThumbnail.trim();
    if (trimmed.length > 5) {
      return trimmed;
    }
  }

  // 2. Fallback to YouTube default thumbnail automatically if it is a YouTube video
  const parsed = parseVideoUrl(videoUrl);
  if (parsed && parsed.platform === 'youtube' && parsed.defaultThumbnail) {
    return parsed.defaultThumbnail;
  }

  return null;
}

/**
 * Returns human-readable label for video platform
 */
export function getVideoPlatformLabel(platform: SupportedVideoPlatform | string | undefined | null): string {
  switch (platform) {
    case 'youtube':
      return 'YouTube';
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'direct':
      return 'HD Video';
    default:
      return 'Video';
  }
}
