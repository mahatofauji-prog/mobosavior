import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GalleryItem } from '../types';
import BeforeAfterSlider from './BeforeAfterSlider';
import { Sparkles, Eye, Play, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServiceGallerySectionProps {
  serviceSlug: string;
  serviceName: string;
  onNavigate?: (route: string) => void;
}

export default function ServiceGallerySection({
  serviceSlug,
  serviceName,
  onNavigate
}: ServiceGallerySectionProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMediaModal, setActiveMediaModal] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function fetchServiceGallery() {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'gallery'),
          where('serviceSlug', '==', serviceSlug)
        );
        const snapshot = await getDocs(q);
        const fetched: GalleryItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<GalleryItem, 'id'>;
          if (data.active !== false) {
            fetched.push({ id: doc.id, ...data });
          }
        });
        setItems(fetched);
      } catch (err) {
        console.error('Error fetching service gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchServiceGallery();
  }, [serviceSlug]);

  if (!loading && items.length === 0) {
    return null; // Return null gracefully if no specific gallery items linked to this service
  }

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 my-10 space-y-6 text-left shadow-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#0284C7]/20 text-sky-400 border border-sky-500/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              Verified Lab Proof
            </span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight font-sans">
            Real Workbench Portfolio for {serviceName}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Inspect authentic microscopes, Before/After transformations, and repair results executed in our Purulia bench facility.
          </p>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('gallery')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto border border-slate-700"
          >
            <span>View Full Repair Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-800/50 animate-pulse rounded-2xl h-64 border border-slate-700" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-sky-500/50 transition-all group"
            >
              {/* Media Preview Area */}
              <div className="relative">
                {item.mediaType === 'before_after' && item.beforeImageUrl && item.afterImageUrl ? (
                  <BeforeAfterSlider
                    beforeImage={item.beforeImageUrl}
                    afterImage={item.afterImageUrl}
                    title={item.title}
                  />
                ) : item.mediaType === 'video' ? (
                  <div 
                    onClick={() => setActiveMediaModal(item)}
                    className="relative aspect-[4/3] bg-black overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={item.thumbnailUrl || item.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-indigo-600/90 backdrop-blur-sm text-white font-black text-[9px] uppercase tracking-wider rounded-lg">
                      REPAIR VIDEO
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => setActiveMediaModal(item)}
                    className="relative aspect-[4/3] bg-slate-900 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1597740985671-2a8a3b80f02e?auto=format&fit=crop&q=80&w=600'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-3 bg-white/90 rounded-full text-[#0284C7] shadow-lg">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white font-black text-[9px] uppercase tracking-wider rounded-lg">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Text Information */}
              <div className="p-4 space-y-1.5 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  {item.brand && (
                    <span className="text-[10px] font-extrabold text-sky-400 bg-sky-950 px-2 py-0.5 rounded-md border border-sky-800/50">
                      {item.brand} {item.model ? `• ${item.model}` : ''}
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-white text-xs leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Lightbox */}
      <AnimatePresence>
        {activeMediaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl space-y-4 p-6 text-left">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h4 className="text-base font-extrabold text-white font-sans">{activeMediaModal.title}</h4>
                <button
                  onClick={() => setActiveMediaModal(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Close ✕
                </button>
              </div>

              {activeMediaModal.mediaType === 'video' && activeMediaModal.videoUrl ? (
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800">
                  {activeMediaModal.videoUrl.includes('youtube.com') || activeMediaModal.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={(() => {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                        const match = activeMediaModal.videoUrl.match(regExp);
                        const videoId = match && match[2].length === 11 ? match[2] : '';
                        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                      })()}
                      title={activeMediaModal.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeMediaModal.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 max-h-[60vh]">
                  <img
                    src={activeMediaModal.imageUrl}
                    alt={activeMediaModal.title}
                    className="max-h-[60vh] object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeMediaModal.description}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  MOBO SAVIOR Verified Bench Output
                </span>
                {onNavigate && (
                  <button
                    onClick={() => {
                      setActiveMediaModal(null);
                      onNavigate('book-repair');
                    }}
                    className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold rounded-xl"
                  >
                    BOOK THIS REPAIR
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
