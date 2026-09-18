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
  // Matches: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/..., youtube.com/embed/..., m.youtube.com/...
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      platform: 'youtube',
      originalUrl: url,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      youtubeId: videoId,
      defaultThumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
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
  // Matches: facebook.com/.../videos/..., facebook.com/watch/?v=..., facebook.com/reel/..., fb.watch/...
  const isFbDomain = /(?:facebook\.com|fb\.watch|fb\.com)/i.test(url);
  if (isFbDomain) {
    const isFbVideo = /(?:videos\/|reel\/|reels\/|watch\/?|share\/(?:v|r)\/|story\.php|video\.php|\?v=)/i.test(url) || /fb\.watch\//i.test(url);
    if (isFbVideo) {
      return {
        platform: 'facebook',
        originalUrl: url,
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1`,
        defaultThumbnail: undefined,
        isValid: true
      };
    }
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
  // If a stored thumbnail is provided and non-empty, use it immediately
  if (storedThumbnail && typeof storedThumbnail === 'string') {
    const trimmed = storedThumbnail.trim();
    if (trimmed.length > 5) {
      return trimmed;
    }
  }

  if (videoUrl) {
    const parsed = parseVideoUrl(videoUrl);
    if (parsed?.platform === 'youtube' && parsed.youtubeId) {
      return `https://img.youtube.com/vi/${parsed.youtubeId}/hqdefault.jpg`;
    }
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
