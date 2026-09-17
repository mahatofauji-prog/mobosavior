import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GalleryItem } from '../types';
import BeforeAfterSlider from './BeforeAfterSlider';
import VideoThumbnail from './VideoThumbnail';
import { Sparkles, Eye, Play, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeGalleryPreviewProps {
  onNavigate: (route: string) => void;
}

export default function HomeGalleryPreview({ onNavigate }: HomeGalleryPreviewProps) {
  const [featuredItems, setFeaturedItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(collection(db, 'gallery'));
        const snapshot = await getDocs(q);
        const fetched: GalleryItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<GalleryItem, 'id'>;
          if (data.active !== false) {
            fetched.push({ id: docSnap.id, ...data });
          }
        });

        // Sort by most recently created/published first
        fetched.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setFeaturedItems(fetched.slice(0, 8));
      } catch (err) {
        console.warn('Home gallery preview fetch error:', err);
        setFeaturedItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <section className="bg-[#F8FAFC] py-16 sm:py-24 relative overflow-hidden border-y border-blue-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-blue-50/60 pb-8">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 bg-[#0284C7]/5 text-[#0284C7] border border-[#0284C7]/15 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
              AUTHENTIC LAB PORTFOLIO
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
              Recent Workbench Transformations
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Explore actual stereomicroscope repairs, Before → After display lamination comparisons, and CPU reballing completed at our Purulia laboratory.
            </p>
          </div>

          <button
            onClick={() => onNavigate('gallery')}
            className="px-6 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start md:self-auto group"
          >
            <span>VIEW FULL REPAIR GALLERY</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-100 animate-pulse rounded-2xl h-72 border border-blue-50" />
            ))}
          </div>
        ) : featuredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-blue-50/80 overflow-hidden flex flex-col justify-between hover:border-[#0284C7]/40 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                {/* Media frame */}
                <div className="relative">
                  {item.mediaType === 'before_after' && item.beforeImageUrl && item.afterImageUrl ? (
                    <BeforeAfterSlider
                      beforeImage={item.beforeImageUrl}
                      afterImage={item.afterImageUrl}
                      title={item.title}
                      lightTheme={true}
                    />
                  ) : item.mediaType === 'video' ? (
                    <div
                      onClick={() => setActiveModal(item)}
                      className="relative cursor-pointer group"
                    >
                      <VideoThumbnail
                        videoUrl={item.videoUrl}
                        thumbnailUrl={item.thumbnailUrl}
                        title={item.title}
                        aspectRatio="4/3"
                        showPlayButton={true}
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setActiveModal(item)}
                      className="relative aspect-[4/3] bg-slate-50 overflow-hidden cursor-pointer group"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.altText || item.title || `${item.category || 'Repair'} work`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 p-4 text-center">
                          <Eye className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#0284C7]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="p-3 bg-white/95 border border-blue-100/40 rounded-full text-[#0284C7] shadow-md">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-sky-50/90 border border-sky-100/40 text-[#0284C7] font-black text-[9px] uppercase tracking-wider rounded-lg shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Title & Desc */}
                <div className="p-4 space-y-1 border-t border-slate-50">
                  <h4 className="font-extrabold text-slate-800 text-xs truncate group-hover:text-[#0284C7] transition-colors font-sans">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-blue-50/80 p-8 sm:p-12 text-center space-y-3 max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284C7] flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              No repair work has been uploaded yet.
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              New repair work will appear here after it is published from the Admin Portal.
            </p>
          </div>
        )}

        {/* Bottom CTA Bar */}
        <div className="pt-4 text-center">
          <button
            onClick={() => onNavigate('gallery')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-blue-50/30 text-[#0284C7] font-extrabold text-xs rounded-2xl border border-blue-100/80 hover:border-[#0284C7]/30 transition-all shadow-sm"
          >
            <span>EXPLORE ALL CATEGORIES & VIDEOS IN GALLERY</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Lightbox / Video Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl space-y-4 p-6 text-left">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h4 className="text-base font-extrabold text-white font-sans">{activeModal.title}</h4>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Close ✕
                </button>
              </div>

              {activeModal.mediaType === 'video' && activeModal.videoUrl ? (
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800">
                  {activeModal.videoUrl.includes('youtube.com') || activeModal.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={(() => {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                        const match = activeModal.videoUrl.match(regExp);
                        const videoId = match && match[2].length === 11 ? match[2] : '';
                        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                      })()}
                      title={activeModal.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeModal.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 max-h-[60vh]">
                  <img
                    src={activeModal.imageUrl}
                    alt={activeModal.title}
                    className="max-h-[60vh] object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeModal.description}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                <span className="font-bold text-sky-400 uppercase tracking-wider">
                  Category: {activeModal.category}
                </span>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onNavigate('gallery');
                  }}
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold rounded-xl"
                >
                  GO TO GALLERY
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
