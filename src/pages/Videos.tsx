import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from '../lib/supabase';
import { db } from '../lib/supabase';
import { VideoItem, getCategoryLabel } from '../types';
import EmbeddedVideoPlayer from '../components/EmbeddedVideoPlayer';
import VideoThumbnail from '../components/VideoThumbnail';
import { Play, Calendar, Eye, Sparkles, X, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideosProps {
  onNavigate: (route: string) => void;
  contactWhatsapp: string;
}

// Solid fallback educational repair tutorials to make the video section look rich immediately
const FALLBACK_VIDEO_ITEMS: VideoItem[] = [
  {
    id: 'vid-1',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder embed or realistic tutorial
    title: 'iPhone CPU Reballing Under Microscope',
    description: 'A complete step-by-step documentation of soldering a dead iPhone motherboard CPU, locating the power shorts and reballing with surgical precision.',
    category: 'Motherboard',
    featured: true,
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid-2',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Samsung Galaxy OLED Screen Calibration',
    description: 'Replacing a smashed AMOLED display on Galaxy S22 Ultra, showing the alignment tools, adhesive laminations, and under-display fingerprint recalibrations.',
    category: 'Screens',
    featured: true,
    displayOrder: 2,
    createdAt: new Date().toISOString()
  }
];

export default function Videos({ onNavigate, contactWhatsapp }: VideosProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const [videosRes, galleryRes] = await Promise.allSettled([
          getDocs(query(collection(db, 'videos'), orderBy('displayOrder', 'asc'))),
          getDocs(query(collection(db, 'gallery'), orderBy('displayOrder', 'asc')))
        ]);

        const fetched: VideoItem[] = [];
        if (videosRes.status === 'fulfilled') {
          videosRes.value.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.active !== false && data.videoUrl) {
              fetched.push({
                id: docSnap.id,
                thumbnailUrl: data.thumbnailUrl || data.imageUrl || null,
                ...data
              } as VideoItem);
            }
          });
        }

        if (galleryRes.status === 'fulfilled') {
          galleryRes.value.forEach((docSnap) => {
            const data = docSnap.data();
            if ((data.mediaType === 'video' || data.videoUrl) && data.active !== false) {
              if (!fetched.some(v => v.id === docSnap.id || v.videoUrl === data.videoUrl)) {
                fetched.push({
                  id: docSnap.id,
                  videoUrl: data.videoUrl,
                  thumbnailUrl: data.thumbnailUrl || data.imageUrl || null,
                  title: data.title || 'Repair Video',
                  description: data.description || '',
                  category: getCategoryLabel(data.category),
                  featured: data.featured,
                  displayOrder: data.displayOrder || 99,
                  createdAt: data.createdAt
                } as VideoItem);
              }
            }
          });
        }

        // Use fallback if Firestore is completely empty
        setVideos(fetched.length > 0 ? fetched : FALLBACK_VIDEO_ITEMS);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setVideos(FALLBACK_VIDEO_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))];

  const filteredVideos = videos.filter(v => {
    return selectedFilter === 'All' || v.category === selectedFilter;
  });

  // Safe helper to extract Youtube ID or embed URL cleanly
  const getEmbedUrl = (url: string) => {
    if (url.includes('embed/')) return url;
    // Extract video ID if standard youtube link
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  const formattedWhatsappLink = (title: string) => {
    const msg = `Hello MOBO SAVIOR, I watched your video on "${title}" and want to enquire about booking a similar repair.`;
    return `https://wa.me/91${contactWhatsapp.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 text-left">
      {/* Header */}
      <div className="max-w-2xl border-b border-slate-100 pb-6 space-y-2">
        <span className="text-[10px] font-bold tracking-widest text-[#0284C7] uppercase font-sans">Visual Demonstrations</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">Watch Our Repair Work</h1>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          See the micro-precision firsthand. Watch Saddam Bhai perform complex chip repairs, soldering micro-jumpers, and aligning curved display screen panels on our workbench.
        </p>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none max-w-full">
        <div className="bg-slate-100/60 p-1 rounded-2xl flex gap-1 items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all focus:outline-none ${
                selectedFilter === cat
                  ? 'bg-white text-[#0284C7] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-slate-100 animate-pulse rounded-2xl h-80 border border-slate-200" />
          ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredVideos.map((vid) => (
            <div 
              key={vid.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all text-slate-700"
            >
              {/* Thumbnail Container */}
              <div 
                onClick={() => setActiveVideo(vid)}
                className="relative cursor-pointer group"
              >
                <VideoThumbnail
                  videoUrl={vid.videoUrl}
                  thumbnailUrl={vid.thumbnailUrl}
                  title={vid.title}
                  aspectRatio="video"
                  showPlayButton={true}
                />

                <span className="absolute bottom-4 left-4 px-2.5 py-0.5 bg-black/60 backdrop-blur-sm text-[9px] font-extrabold text-white rounded-lg uppercase tracking-wider z-10">
                  {vid.category}
                </span>
              </div>

              {/* Information Area */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0284C7] leading-snug font-sans">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {vid.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    Microscopic Video Demonstration
                  </span>
                  <button
                    onClick={() => setActiveVideo(vid)}
                    className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1"
                  >
                    Watch Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 p-12 rounded-2xl text-center max-w-sm mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No videos found</h4>
          <p className="text-xs text-slate-500">We couldn't find any repair videos in this category.</p>
        </div>
      )}

      {/* Dynamic Video Player Modal Overlay */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Close Overlay */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors focus:outline-none"
                aria-label="Close video player"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Player aspect-video wrapper */}
              <div className="relative aspect-video bg-black w-full flex items-center justify-center overflow-hidden">
                <EmbeddedVideoPlayer
                  videoUrl={activeVideo.videoUrl}
                  title={activeVideo.title}
                  thumbnailUrl={activeVideo.thumbnailUrl}
                />
              </div>

              {/* Bottom Info bar */}
              <div className="p-6 bg-white text-slate-700 text-left space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#0284C7]">{activeVideo.category}</span>
                  <h4 className="text-lg font-black text-slate-900 font-sans">{activeVideo.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{activeVideo.description}</p>
                </div>
                <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      onNavigate('book-repair');
                      setActiveVideo(null);
                    }}
                    className="py-2 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl"
                  >
                    BOOK THIS TYPE OF REPAIR
                  </button>
                  <a
                    href={formattedWhatsappLink(activeVideo.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 fill-white text-emerald-500" />
                    WHATSAPP INQUIRY
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
