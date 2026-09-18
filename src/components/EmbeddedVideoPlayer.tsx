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
        {embedError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-slate-300">
            <p className="text-sm font-bold text-white mb-2">Playing Facebook Video</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Open in Facebook
            </a>
          </div>
        ) : (
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
        )}
      </div>
    );
  }

  // 4. Instagram Player - Render Custom In-Site Video Modal / Fallback if embed is blocked
  if (parsed.platform === 'instagram') {
    return (
      <div className={`relative w-full h-full bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-4 ${className}`}>
        <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
          <div>
            <h3 className="text-white font-black text-base mb-1">{title}</h3>
            <p className="text-xs text-slate-400">
              Instagram reels and posts require viewing directly on Instagram or playing via uploaded MP4 file.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Watch on Instagram
            </a>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Tip for Admin: To play videos directly on the website without redirection, upload the MP4 video file in the Admin Gallery Manager.
          </p>
        </div>
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
