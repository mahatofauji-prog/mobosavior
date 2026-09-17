export type SupportedVideoPlatform = 'youtube' | 'facebook' | 'instagram';

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
 * Validates and extracts embed parameters for YouTube, Facebook, and Instagram URLs.
 * Admin can paste YouTube watch/shorts, Facebook video/reel, or Instagram reel/post links.
 * 
 * Strict platform rules:
 * - YouTube: Extract video ID and use official YouTube thumbnail.
 * - Facebook & Instagram: Do not use stock, default, or artificial thumbnails.
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

  // 2. Facebook
  // Matches: facebook.com/.../videos/..., facebook.com/watch/?v=..., facebook.com/reel/..., fb.watch/...
  const isFbDomain = /(?:facebook\.com|fb\.watch|fb\.com)/i.test(url);
  if (isFbDomain) {
    const isFbVideo = /(?:videos\/|reel\/|reels\/|watch\/?|share\/(?:v|r)\/|story\.php|video\.php|\?v=)/i.test(url) || /fb\.watch\//i.test(url);
    if (isFbVideo) {
      return {
        platform: 'facebook',
        originalUrl: url,
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1`,
        defaultThumbnail: undefined, // No stock/default thumbnail per strict requirements
        isValid: true
      };
    }
  }

  // 3. Instagram
  // Matches: instagram.com/reel/CODE, instagram.com/reels/CODE, instagram.com/p/CODE, instagram.com/tv/CODE
  const igMatch = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const shortcode = igMatch[1];
    return {
      platform: 'instagram',
      originalUrl: url,
      embedUrl: `https://www.instagram.com/p/${shortcode}/embed/`,
      instagramShortcode: shortcode,
      defaultThumbnail: undefined, // No stock/default thumbnail per strict requirements
      isValid: true
    };
  }

  return null;
}

/**
 * Returns true if the URL is from a supported and valid YouTube, Facebook, or Instagram video source.
 */
export function isValidSocialVideoUrl(url: string | undefined | null): boolean {
  const parsed = parseVideoUrl(url);
  return !!(parsed && parsed.isValid);
}

/**
 * Safely extracts the official platform thumbnail URL from a video URL.
 * Strictly adheres to the NO DEFAULT / FALLBACK THUMBNAIL RULE:
 * - YouTube: uses official https://img.youtube.com/vi/{id}/hqdefault.jpg
 * - Facebook & Instagram: returns null (thumbnail extraction unavailable without API tokens)
 * - Under NO circumstances returns a stock image, Unsplash image, AI image, or default placeholder.
 */
export function getOfficialVideoThumbnail(
  videoUrl: string | undefined | null,
  storedThumbnail?: string | null
): string | null {
  if (videoUrl) {
    const parsed = parseVideoUrl(videoUrl);
    if (parsed?.platform === 'youtube' && parsed.youtubeId) {
      return `https://img.youtube.com/vi/${parsed.youtubeId}/hqdefault.jpg`;
    }
  }

  // If a stored thumbnail is provided and it's not a generic placeholder/unsplash image
  if (storedThumbnail && typeof storedThumbnail === 'string') {
    const trimmed = storedThumbnail.trim();
    if (trimmed.length > 5 && !trimmed.includes('unsplash.com')) {
      return trimmed;
    }
  }

  // Never return generic placeholders
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
    default:
      return 'Video';
  }
}
