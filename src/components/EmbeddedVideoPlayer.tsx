import React, { useState } from 'react';
import { parseVideoUrl } from '../lib/videoUtils';
import { AlertCircle, ExternalLink, Play } from 'lucide-react';

interface EmbeddedVideoPlayerProps {
  videoUrl: string;
  title?: string;
  thumbnailUrl?: string;
  className?: string;
  autoPlay?: boolean;
}

export default function EmbeddedVideoPlayer({
  videoUrl,
  title = 'Repair Video',
  thumbnailUrl,
  className = 'w-full h-full',
  autoPlay = false
}: EmbeddedVideoPlayerProps) {
  const [embedError, setEmbedError] = useState(false);
  const parsed = parseVideoUrl(videoUrl);

  if (!parsed || !parsed.isValid || embedError) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-slate-300 rounded-2xl ${className}`}>
        <AlertCircle className="w-10 h-10 text-amber-400 mb-2.5" />
        <p className="text-sm font-bold text-white mb-1">
          This video cannot be played here because embedding is not available for this post.
        </p>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          The creator or social platform may have set privacy, age, or embed restrictions on this media item.
        </p>
        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Link in New Tab</span>
          </a>
        )}
      </div>
    );
  }

  // 1. Direct HTML5 Video Player
  if (parsed.platform === 'direct' || videoUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) || videoUrl.startsWith('blob:') || videoUrl.includes('/storage/')) {
    return (
      <div className={`relative w-full h-full bg-black overflow-hidden flex items-center justify-center ${className}`}>
        <video
          src={videoUrl}
          controls
          autoPlay={autoPlay}
          poster={thumbnailUrl || undefined}
          playsInline
          className="w-full h-full object-contain max-h-[80vh]"
          onError={() => setEmbedError(true)}
        >
          Your browser does not support HTML5 video playback.
        </video>
      </div>
    );
  }

  // 2. YouTube Player
  if (parsed.platform === 'youtube') {
    return (
      <div className={`relative w-full h-full bg-black overflow-hidden flex items-center justify-center ${className}`}>
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onError={() => setEmbedError(true)}
        />
      </div>
    );
  }

  // 3. Facebook Player
  if (parsed.platform === 'facebook') {
    return (
      <div className={`relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center ${className}`}>
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="w-full h-full border-0"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          onError={() => setEmbedError(true)}
        />
      </div>
    );
  }

  // 4. Instagram Player
  if (parsed.platform === 'instagram') {
    return (
      <div className={`relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 ${className}`}>
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="w-full max-w-[500px] h-[550px] sm:h-[600px] border-0 rounded-xl bg-white shadow-2xl"
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          onError={() => setEmbedError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden flex items-center justify-center ${className}`}>
      <video
        src={videoUrl}
        controls
        autoPlay={autoPlay}
        poster={thumbnailUrl || undefined}
        playsInline
        className="w-full h-full object-contain max-h-[80vh]"
      />
    </div>
  );
}
