import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GalleryItem } from '../types';
import BeforeAfterSlider from './BeforeAfterSlider';
import { Sparkles, Eye, Play, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeGalleryPreviewProps {
  onNavigate: (route: string) => void;
}

const FALLBACK_FEATURED: GalleryItem[] = [
  {
    id: 'feat-1',
    title: 'Poco X3 Pro CPU Reballing & Double-Decker RAM Repair',
    description: 'Microsoldering CPU reballing on dead Poco X3 Pro to fix sudden power loss and memory freeze.',
    category: 'Motherboard Work',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80f02e?auto=format&fit=crop&q=80&w=800',
    featured: true,
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'feat-2',
    title: 'iPhone 13 Pro Crushed Glass & Display Panel Restoration',
    description: 'Shattered front glass replaced with original OEM OLED screen assembly, keeping TrueTone.',
    category: 'Before / After',
    mediaType: 'before_after',
    beforeImageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&q=80&w=800',
    afterImageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800',
    imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800',
    featured: true,
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'feat-3',
    title: 'Samsung Galaxy S22 Ultra OLED Screen Repair',
    description: 'Precision frame and curved screen lamination using OCA pressure chamber.',
    category: 'Display Replacement',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&q=80&w=800',
    featured: true,
    displayOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'feat-4',
    title: 'Microscope Reballing Process Video',
    description: 'Watch Saddam Bhai perform high-precision micro-jumpers and BGA stencil reballing.',
    category: 'Repairing Videos',
    mediaType: 'video',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    featured: true,
    displayOrder: 4,
    createdAt: new Date().toISOString()
  }
];

export default function HomeGalleryPreview({ onNavigate }: HomeGalleryPreviewProps) {
  const [featuredItems, setFeaturedItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(
          collection(db, 'gallery'),
          where('featured', '==', true),
          limit(6)
        );
        const snapshot = await getDocs(q);
        const fetched: GalleryItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<GalleryItem, 'id'>;
          if (data.active !== false) {
            fetched.push({ id: doc.id, ...data });
          }
        });
        setFeaturedItems(fetched.length > 0 ? fetched : FALLBACK_FEATURED);
      } catch (err) {
        console.error('Error fetching home gallery preview:', err);
        setFeaturedItems(FALLBACK_FEATURED);
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
        ) : (
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
                      className="relative aspect-[4/3] bg-slate-50 overflow-hidden cursor-pointer group animate-fade-in"
                    >
                      <img
                        src={item.thumbnailUrl || item.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-blue-900/5 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-indigo-50/90 border border-indigo-100/40 text-indigo-600 font-black text-[9px] uppercase tracking-wider rounded-lg shadow-sm">
                        REPAIR VIDEO
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => setActiveModal(item)}
                      className="relative aspect-[4/3] bg-slate-50 overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1597740985671-2a8a3b80f02e?auto=format&fit=crop&q=80&w=600'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
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
