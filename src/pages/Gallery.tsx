import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GalleryItem } from '../types';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { Eye, Calendar, Sparkles, X, MessageSquare, AlertCircle, Play, Search, Filter, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryProps {
  onNavigate: (route: string) => void;
  contactWhatsapp: string;
}

const MANDATORY_CATEGORIES = [
  'All',
  'Repairing Photos',
  'Before / After',
  'Motherboard Work',
  'Display Replacement',
  'Customer Delivery Photos',
  'Repairing Videos'
];

const FALLBACK_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Poco X3 Pro CPU Reballing & Double-Decker RAM Repair',
    description: 'Complete double-decker CPU reballing on dead Poco X3 Pro to fix sudden power loss and memory freeze.',
    category: 'Motherboard Work',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80f02e?auto=format&fit=crop&q=80&w=800',
    altText: 'Stereomicroscope motherboard CPU reballing work',
    featured: true,
    active: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    serviceSlug: 'cpu-ic-level-repair',
    brand: 'Poco',
    model: 'Poco X3 Pro'
  },
  {
    id: 'gal-2',
    title: 'iPhone 13 Pro Crushed Glass & Display Panel Restoration',
    description: 'Shattered front glass replaced with original OEM OLED screen assembly, keeping TrueTone and 120Hz ProMotion active.',
    category: 'Before / After',
    mediaType: 'before_after',
    beforeImageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&q=80&w=800',
    afterImageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800',
    imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800',
    altText: 'iPhone 13 Pro display repair before and after',
    featured: true,
    active: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    serviceSlug: 'mobile-display-replacement',
    brand: 'Apple',
    model: 'iPhone 13 Pro'
  },
  {
    id: 'gal-3',
    title: 'Samsung Galaxy S22 Ultra Curved OLED Screen Replacement',
    description: 'Precision frame and curved screen lamination using OCA pressure chamber on flagship Galaxy S22 Ultra.',
    category: 'Display Replacement',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&q=80&w=800',
    altText: 'Samsung S22 Ultra OLED screen repair',
    featured: true,
    active: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    serviceSlug: 'mobile-display-replacement',
    brand: 'Samsung',
    model: 'Galaxy S22 Ultra'
  },
  {
    id: 'gal-4',
    title: 'Type-C Fast Charging Sub-board Micro-soldering',
    description: 'Replacing damaged USB-C port pads and installing high-current fast charging connector on OnePlus 9R.',
    category: 'Repairing Photos',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    altText: 'Sub-board micro soldering charging port',
    featured: true,
    active: true,
    displayOrder: 4,
    createdAt: new Date().toISOString(),
    serviceSlug: 'charging-problem-repair',
    brand: 'OnePlus',
    model: 'OnePlus 9R'
  },
  {
    id: 'gal-5',
    title: 'Happy Customer Handover - iPhone 14 Pro Revived',
    description: 'Client receiving fully tested iPhone 14 Pro after water damage motherboard line shorting diagnosis.',
    category: 'Customer Delivery Photos',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&q=80&w=800',
    altText: 'Customer delivery after successful iPhone repair',
    featured: true,
    active: true,
    displayOrder: 5,
    createdAt: new Date().toISOString(),
    serviceSlug: 'dead-phone-repair',
    brand: 'Apple',
    model: 'iPhone 14 Pro'
  },
  {
    id: 'gal-6',
    title: 'Microscope Reballing Process Video Demonstration',
    description: 'Watch Saddam Bhai perform high-precision micro-jumpers and BGA stencil reballing under 45x optical microscope.',
    category: 'Repairing Videos',
    mediaType: 'video',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    altText: 'Microscope repair video preview',
    featured: true,
    active: true,
    displayOrder: 6,
    createdAt: new Date().toISOString(),
    serviceSlug: 'cpu-ic-level-repair'
  }
];

export default function Gallery({ onNavigate, contactWhatsapp }: GalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const q = query(collection(db, 'gallery'), orderBy('displayOrder', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetched: GalleryItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<GalleryItem, 'id'>;
          if (data.active !== false) {
            fetched.push({ id: doc.id, ...data });
          }
        });

        setItems(fetched.length > 0 ? fetched : FALLBACK_GALLERY_ITEMS);
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setItems(FALLBACK_GALLERY_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  // Filter logic
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      item.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim() ||
      (selectedCategory === 'Repairing Videos' && item.mediaType === 'video') ||
      (selectedCategory === 'Before / After' && (item.mediaType === 'before_after' || (item.beforeImageUrl && item.afterImageUrl)));

    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.model && item.model.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const formattedWhatsappLink = (title: string) => {
    const msg = `Hello MOBO SAVIOR, I saw your work on "${title}" in your gallery and want to consult on a similar repair.`;
    return `https://wa.me/91${contactWhatsapp.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-sky-50 text-[#0284C7] border border-sky-100 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
              AUTHENTIC LAB PROOF
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
            Repair Gallery & Workbench Media
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Explore 100% genuine stereomicroscope micro-soldering photos, Before → After display lamination comparisons, customer deliveries, and repair video clips executed in our Purulia bench facility.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search model, service, IC..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
        <div className="bg-slate-100/70 p-1.5 rounded-2xl flex gap-1 items-center">
          {MANDATORY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all focus:outline-none ${
                selectedCategory === cat
                  ? 'bg-white text-[#0284C7] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-100 animate-pulse rounded-3xl h-80 border border-slate-200" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-[#0284C7]/40 transition-all duration-300 group"
            >
              {/* Media Render Container */}
              <div className="relative">
                {item.mediaType === 'before_after' || (item.beforeImageUrl && item.afterImageUrl) ? (
                  <div className="p-3 bg-slate-950">
                    <BeforeAfterSlider
                      beforeImage={item.beforeImageUrl || item.imageUrl || ''}
                      afterImage={item.afterImageUrl || item.imageUrl || ''}
                      title={item.title}
                    />
                  </div>
                ) : item.mediaType === 'video' || item.videoUrl ? (
                  <div
                    onClick={() => setActiveItem(item)}
                    className="relative aspect-[4/3] bg-black overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={item.thumbnailUrl || item.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 px-3 py-1 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-md">
                      REPAIR VIDEO
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => setActiveItem(item)}
                    className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1597740985671-2a8a3b80f02e?auto=format&fit=crop&q=80&w=800'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-full text-[#0284C7] shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Eye className="w-6 h-6" />
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-md">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Information Body */}
              <div className="p-6 space-y-3 flex-grow flex flex-col justify-between border-t border-slate-100">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.brand && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md font-extrabold text-[10px]">
                        {item.brand} {item.model ? `• ${item.model}` : ''}
                      </span>
                    )}
                    {item.featured && (
                      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md font-extrabold text-[10px] flex items-center gap-1 border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Featured
                      </span>
                    )}
                  </div>

                  <h3 
                    onClick={() => setActiveItem(item)}
                    className="font-black text-slate-900 text-base leading-snug group-hover:text-[#0284C7] transition-colors cursor-pointer"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  
                  <button
                    onClick={() => setActiveItem(item)}
                    className="text-[#0284C7] hover:underline font-extrabold flex items-center gap-1"
                  >
                    Inspect Proof →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/80 p-12 rounded-3xl text-center max-w-md mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-slate-800 text-base">No media items found</h4>
          <p className="text-xs text-slate-500">We couldn't find any portfolio items matching category "{selectedCategory}".</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 bg-[#0284C7] text-white text-xs font-extrabold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Lightbox / Media Modal */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[90vh] border border-slate-800"
            >
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-colors focus:outline-none"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Media Area */}
              <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-0">
                {activeItem.mediaType === 'video' && activeItem.videoUrl ? (
                  <div className="w-full h-full relative aspect-video">
                    {activeItem.videoUrl.includes('youtube.com') || activeItem.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={(() => {
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                          const match = activeItem.videoUrl.match(regExp);
                          const videoId = match && match[2].length === 11 ? match[2] : '';
                          return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                        })()}
                        title={activeItem.title}
                        className="absolute inset-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={activeItem.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                ) : activeItem.mediaType === 'before_after' && activeItem.beforeImageUrl && activeItem.afterImageUrl ? (
                  <div className="w-full p-4">
                    <BeforeAfterSlider
                      beforeImage={activeItem.beforeImageUrl}
                      afterImage={activeItem.afterImageUrl}
                      title={activeItem.title}
                    />
                  </div>
                ) : (
                  <img
                    src={activeItem.imageUrl}
                    alt={activeItem.title}
                    className="max-h-[50vh] md:max-h-[80vh] w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Right Details Area */}
              <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-slate-300 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-sky-950 text-sky-400 border border-sky-800/60 rounded-full text-[9px] font-black uppercase">
                        {activeItem.category}
                      </span>
                      {activeItem.brand && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          {activeItem.brand} {activeItem.model ? `• ${activeItem.model}` : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-white leading-snug font-sans">
                      {activeItem.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {activeItem.description}
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <div className="flex gap-4 text-[11px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      100% Verified Quality
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onNavigate('book-repair');
                        setActiveItem(null);
                      }}
                      className="py-3 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl text-center shadow-md"
                    >
                      BOOK REPAIR
                    </button>
                    <a
                      href={formattedWhatsappLink(activeItem.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
                      WHATSAPP
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
