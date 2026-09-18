import React, { useState } from 'react';
import { Play, Film, Video as VideoIcon, Sparkles } from 'lucide-react';
import { parseVideoUrl, getOfficialVideoThumbnail, getVideoPlatformLabel, isDirectVideoUrl } from '../lib/videoUtils';

interface VideoThumbnailProps {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  title?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | '4/3' | 'auto';
  showPlayButton?: boolean;
  priority?: boolean;
}

export default function VideoThumbnail({
  videoUrl,
  thumbnailUrl,
  title = 'Repair Video',
  className = '',
  aspectRatio = '4/3',
  showPlayButton = true
}: VideoThumbnailProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const parsed = parseVideoUrl(videoUrl);
  const officialThumb = getOfficialVideoThumbnail(videoUrl, thumbnailUrl);
  const isDirect = isDirectVideoUrl(videoUrl);

  const platformLabel = parsed?.platform ? getVideoPlatformLabel(parsed.platform) : 'Video';

  const aspectClass = 
    aspectRatio === 'video' ? 'aspect-video' :
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === '4/3' ? 'aspect-[4/3]' : 'h-full w-full';

  // 1. If we have an official or custom uploaded thumbnail
  if (officialThumb && !imgFailed) {
    return (
      <div className={`relative ${aspectClass} bg-slate-950 overflow-hidden flex items-center justify-center group ${className}`}>
        <img
          src={officialThumb}
          alt={title}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Platform Badge */}
        <span
          className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-white font-black text-[9px] uppercase tracking-wider rounded-md shadow-md flex items-center gap-1 z-10 ${
            parsed?.platform === 'youtube'
              ? 'bg-red-600'
              : parsed?.platform === 'facebook'
              ? 'bg-[#1877F2]'
              : parsed?.platform === 'instagram'
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500'
              : 'bg-sky-600'
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

  // 2. If it's a direct video file (MP4/WebM/MOV/Storage), render native video preview frame
  if (isDirect && videoUrl) {
    return (
      <div className={`relative ${aspectClass} bg-slate-950 overflow-hidden flex items-center justify-center group ${className}`}>
        <video
          src={videoUrl}
          preload="metadata"
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Platform Badge */}
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-sky-600 text-white font-black text-[9px] uppercase tracking-wider rounded-md shadow-md flex items-center gap-1 z-10">
          <Film className="w-2.5 h-2.5" />
          HD Video
        </span>

        {/* Play Button */}
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

  // 3. Instagram / Facebook / Social Video Card
  return (
    <div className={`relative ${aspectClass} overflow-hidden flex flex-col items-center justify-center text-center p-4 select-none group ${
      parsed?.platform === 'instagram'
        ? 'bg-gradient-to-br from-purple-950 via-slate-950 to-pink-950 border border-purple-900/40'
        : parsed?.platform === 'facebook'
        ? 'bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950 border border-blue-900/40'
        : 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800'
    } ${className}`}>
      
      {/* Platform Badge */}
      <span
        className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 text-white font-black text-[9px] uppercase tracking-wider rounded-md shadow-md flex items-center gap-1 z-10 ${
          parsed?.platform === 'youtube'
            ? 'bg-red-600'
            : parsed?.platform === 'facebook'
            ? 'bg-[#1877F2]'
            : parsed?.platform === 'instagram'
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500'
            : 'bg-sky-600'
        }`}
      >
        <Play className="w-2.5 h-2.5 fill-current" />
        {platformLabel}
      </span>

      {/* Center Action */}
      <div className="flex flex-col items-center justify-center space-y-2.5 z-10 max-w-[240px]">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform ${
          parsed?.platform === 'instagram'
            ? 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white'
            : parsed?.platform === 'facebook'
            ? 'bg-[#1877F2] text-white'
            : 'bg-[#0284C7] text-white'
        }`}>
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </div>

        <span className="text-xs font-black text-white tracking-wide uppercase line-clamp-1">
          {title || `${platformLabel} Video`}
        </span>
        <span className="text-[10px] text-slate-300 font-medium leading-tight">
          Click to watch {platformLabel} demonstration
        </span>
      </div>

      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1)_0,transparent_70%)] pointer-events-none" />
    </div>
  );
}
