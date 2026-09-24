import React, { useState, useEffect } from 'react';
import { parseVideoUrl } from '../lib/videoUtils';
import { AlertCircle, ExternalLink, Play } from 'lucide-react';

interface EmbeddedVideoPlayerProps {
  videoUrl?: string | null;
  title?: string;
  thumbnailUrl?: string | null;
  className?: string;
  autoPlay?: boolean;
  onAspectRatioChange?: (ratio: number) => void;
}

export default function EmbeddedVideoPlayer({
  videoUrl,
  title = 'Repair Video',
  thumbnailUrl,
  className = 'w-full h-full',
  autoPlay = false,
  onAspectRatioChange
}: EmbeddedVideoPlayerProps) {
  const [embedError, setEmbedError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const safeVideoUrl = typeof videoUrl === 'string' ? videoUrl.trim() : '';
  const parsed = parseVideoUrl(safeVideoUrl);

  // Guess initial aspect ratio to avoid layout shift (9/16 for Shorts/Reels/Instagram, 16/9 for others)
  const getInitialAspectRatio = () => {
    if (!parsed) return 16 / 9;
    if (parsed.platform === 'youtube') {
      if (safeVideoUrl.toLowerCase().includes('/shorts/')) {
        return 9 / 16;
      }
      return 16 / 9;
    }
    if (parsed.platform === 'facebook') {
      if (
        safeVideoUrl.toLowerCase().includes('/reel/') ||
        safeVideoUrl.toLowerCase().includes('/reels/') ||
        safeVideoUrl.toLowerCase().includes('share/r/')
      ) {
        return 9 / 16;
      }
      return 16 / 9;
    }
    if (parsed.platform === 'instagram') {
      return 9 / 16; // Instagram embeds and reels look amazing in vertical 9:16 aspect ratio
    }
    return 16 / 9;
  };

  const [aspectRatio, setAspectRatio] = useState<number>(getInitialAspectRatio());

  useEffect(() => {
    const initialRatio = getInitialAspectRatio();
    setAspectRatio(initialRatio);
    if (onAspectRatioChange) {
      onAspectRatioChange(initialRatio);
    }
  }, [videoUrl]);

  if (!safeVideoUrl || !parsed || !parsed.isValid) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-slate-300 rounded-2xl ${className}`}>
        <AlertCircle className="w-10 h-10 text-amber-400 mb-2.5" />
        <p className="text-sm font-bold text-white mb-1">
          This video cannot be played here because embedding is not available for this post.
        </p>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          The creator or social platform may have set privacy, age, or embed restrictions on this media item.
        </p>
        {safeVideoUrl ? (
          <a
            href={safeVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Link in New Tab</span>
          </a>
        ) : null}
      </div>
    );
  }

  // 1. Direct HTML5 Video Player
  const isDirectVideo =
    parsed.platform === 'direct' ||
    Boolean(
      safeVideoUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) ||
      safeVideoUrl.startsWith('blob:') ||
      safeVideoUrl.includes('/storage/')
    );

  const renderLoader = () => {
    if (!isLoading) return null;
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-30 transition-all duration-300 pointer-events-none">
        <div className="w-11 h-11 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin mb-3.5" />
        <span className="text-[11px] font-extrabold text-sky-400 tracking-wider uppercase font-sans">Connecting Safe Stream...</span>
        <span className="text-[9px] text-slate-500 mt-1 font-medium">Bypassing platform trackers & loading video player</span>
      </div>
    );
  };

  // Determine container styling: aspect-ratio is key to responsive frames!
  const isPortrait = aspectRatio < 1;
  const playerContainerStyle: React.CSSProperties = {
    aspectRatio: `${aspectRatio}`,
    width: isPortrait ? 'auto' : '100%',
    height: isPortrait ? '100%' : 'auto',
    maxWidth: '100%',
    maxHeight: '75vh',
  };

  // Callback to detect direct video metadata dimensions and update aspect ratio dynamically
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.videoWidth && video.videoHeight) {
      const ratio = video.videoWidth / video.videoHeight;
      setAspectRatio(ratio);
      if (onAspectRatioChange) {
        onAspectRatioChange(ratio);
      }
    }
    setIsLoading(false);
  };

  if (isDirectVideo) {
    return (
      <div 
        style={playerContainerStyle}
        className="relative bg-black overflow-hidden flex items-center justify-center mx-auto rounded-2xl shadow-xl transition-all duration-300"
      >
        {renderLoader()}
        <video
          src={safeVideoUrl}
          controls
          autoPlay={autoPlay}
          preload="auto"
          poster={thumbnailUrl || undefined}
          playsInline
          className="w-full h-full object-contain"
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={() => setIsLoading(false)}
          onCanPlay={() => setIsLoading(false)}
          onError={() => {
            setEmbedError(true);
            setIsLoading(false);
          }}
        >
          Your browser does not support HTML5 video playback.
        </video>
      </div>
    );
  }

  // If embedError occurs or for social links where user wants custom poster/thumbnail fallback view initially
  if (embedError) {
    return (
      <div className={`relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center ${className}`}>
        {thumbnailUrl && (
          <div className="absolute inset-0">
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover opacity-50 blur-sm" />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center text-slate-300">
          <p className="text-sm font-bold text-white mb-2">{title}</p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Open in {parsed.platform.toUpperCase()}
          </a>
        </div>
      </div>
    );
  }

  // 2. YouTube Player
  if (parsed.platform === 'youtube') {
    return (
      <div 
        style={playerContainerStyle}
        className="relative bg-black overflow-hidden flex items-center justify-center mx-auto rounded-2xl shadow-xl transition-all duration-300"
      >
        {renderLoader()}
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  }

  // 3. Facebook Player
  if (parsed.platform === 'facebook') {
    return (
      <div 
        style={playerContainerStyle}
        className="relative bg-black overflow-hidden flex items-center justify-center mx-auto rounded-2xl shadow-xl transition-all duration-300"
      >
        {renderLoader()}
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full border-0"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  }

  // 4. Instagram Player
  if (parsed.platform === 'instagram') {
    return (
      <div 
        style={playerContainerStyle}
        className="relative bg-black overflow-hidden flex items-center justify-center mx-auto rounded-2xl shadow-xl p-1 transition-all duration-300"
      >
        {renderLoader()}
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full border-0 rounded-xl bg-white shadow-md"
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  }

  return (
    <div 
      style={playerContainerStyle}
      className="relative bg-black overflow-hidden flex items-center justify-center mx-auto rounded-2xl shadow-xl transition-all duration-300"
    >
      {renderLoader()}
      <video
        src={videoUrl}
        controls
        preload="auto"
        autoPlay={autoPlay}
        poster={thumbnailUrl || undefined}
        playsInline
        className="w-full h-full object-contain"
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
      />
    </div>
  );
}
