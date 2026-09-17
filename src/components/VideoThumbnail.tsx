import React, { useState } from 'react';
import { Play, VideoOff } from 'lucide-react';
import { parseVideoUrl, getOfficialVideoThumbnail, getVideoPlatformLabel } from '../lib/videoUtils';

interface VideoThumbnailProps {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  title?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | '4/3' | 'auto';
  showPlayButton?: boolean;
  priority?: boolean;
}

/**
 * Renders the official video thumbnail from supported platforms (YouTube).
 * 
 * STRICT NO-DEFAULT-THUMBNAIL RULE:
 * - If official thumbnail is unavailable or fails to load, displays a clean
 *   "Video Preview Unavailable" UI state with the platform indicator.
 * - Under NO circumstances displays an Unsplash image, stock photo, AI graphic,
 *   or hardcoded fallback image.
 */
export default function VideoThumbnail({
  videoUrl,
  thumbnailUrl,
  title = 'Repair Video',
  className = '',
  aspectRatio = '4/3',
  showPlayButton = true
}: VideoThumbnailProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const parsed = parseVideoUrl(videoUrl);
  const officialThumb = getOfficialVideoThumbnail(videoUrl, thumbnailUrl);

  const platformLabel = parsed?.platform ? getVideoPlatformLabel(parsed.platform) : 'Video';

  const aspectClass = 
    aspectRatio === 'video' ? 'aspect-video' :
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === '4/3' ? 'aspect-[4/3]' : 'h-full w-full';

  // If we have an official platform thumbnail and it hasn't failed to load
  if (officialThumb && !imgFailed) {
    return (
      <div className={`relative ${aspectClass} bg-slate-950 overflow-hidden flex items-center justify-center ${className}`}>
        <img
          src={officialThumb}
          alt={title}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* Platform Badge */}
        <span
          className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-white font-black text-[9px] uppercase tracking-wider rounded-md shadow-md flex items-center gap-1 z-10 ${
            parsed?.platform === 'youtube'
              ? 'bg-red-600'
              : parsed?.platform === 'facebook'
              ? 'bg-[#1877F2]'
              : parsed?.platform === 'instagram'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500'
              : 'bg-indigo-600'
          }`}
        >
          <Play className="w-2.5 h-2.5 fill-current" />
          {platformLabel}
        </span>

        {/* Centered Play Button */}
        {showPlayButton && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-12 h-12 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#0369A1] transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // CLEAN "Video Preview Unavailable" state:
  // Strictly NO default image, stock image, or placeholder!
  return (
    <div className={`relative ${aspectClass} bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center text-center p-4 select-none ${className}`}>
      {/* Platform Badge */}
      <span
        className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-white font-black text-[9px] uppercase tracking-wider rounded-md shadow-md flex items-center gap-1 z-10 ${
          parsed?.platform === 'youtube'
            ? 'bg-red-600'
            : parsed?.platform === 'facebook'
            ? 'bg-[#1877F2]'
            : parsed?.platform === 'instagram'
            ? 'bg-gradient-to-r from-purple-600 to-pink-500'
            : 'bg-indigo-600'
        }`}
      >
        <Play className="w-2.5 h-2.5 fill-current" />
        {platformLabel}
      </span>

      {/* Center Icon & Notice */}
      <div className="flex flex-col items-center justify-center space-y-2 z-10 max-w-[220px]">
        {showPlayButton ? (
          <div className="w-11 h-11 rounded-full bg-slate-800/90 text-sky-400 flex items-center justify-center border border-slate-700/80 shadow-lg group-hover:scale-110 group-hover:bg-[#0284C7] group-hover:text-white transition-all">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        ) : (
          <VideoOff className="w-8 h-8 text-slate-500" />
        )}

        <span className="text-xs font-black text-slate-200 tracking-wide uppercase">
          Video Preview Unavailable
        </span>
        <span className="text-[10px] text-slate-400 font-medium leading-tight">
          Click to play {platformLabel} embed
        </span>
      </div>

      {/* Subtle background circuit pattern / decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />
    </div>
  );
}
