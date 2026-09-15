import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadMediaFile } from '../../lib/storageUpload';
import { GalleryItem, Service } from '../../types';
import BeforeAfterSlider from '../BeforeAfterSlider';
import ImageUploader from './ImageUploader';
import { Plus, Edit, Trash2, Eye, Star, Upload, Loader2, Sparkles, Image, Video, CheckCircle, AlertTriangle, ArrowUpDown, X, Play } from 'lucide-react';

const CATEGORIES = [
  'Repairing Photos',
  'Before / After',
  'Motherboard Work',
  'Display Replacement',
  'Customer Delivery Photos',
  'Repairing Videos'
];

export default function AdminGalleryManager() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTabCategory, setActiveTabCategory] = useState<string>('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form State
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'before_after'>('image');
  const [category, setCategory] = useState<string>('Repairing Photos');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [beforeImageUrl, setBeforeImageUrl] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState('');
  const [serviceSlug, setServiceSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);

  // File states for upload to Firebase Storage
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      // Fetch Gallery
      const qG = query(collection(db, 'gallery'), orderBy('displayOrder', 'asc'));
      const snapG = await getDocs(qG);
      const items: GalleryItem[] = [];
      snapG.forEach((d) => items.push({ id: d.id, ...d.data() } as GalleryItem));
      setGallery(items);

      // Fetch Services for linking
      const qS = query(collection(db, 'services'));
      const snapS = await getDocs(qS);
      const sItems: Service[] = [];
      snapS.forEach((d) => sItems.push({ id: d.id, ...d.data() } as Service));
      setServices(sItems);
    } catch (err) {
      console.error('Error fetching admin gallery:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setMediaType('image');
    setCategory('Repairing Photos');
    setTitle('');
    setDescription('');
    setImageUrl('');
    setVideoUrl('');
    setBeforeImageUrl('');
    setAfterImageUrl('');
    setServiceSlug('');
    setBrand('');
    setModel('');
    setFeatured(false);
    setActive(true);
    setDisplayOrder(gallery.length + 1);
    setImageFile(null);
    setVideoFile(null);
    setBeforeFile(null);
    setAfterFile(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setMediaType(item.mediaType || (item.videoUrl ? 'video' : item.beforeImageUrl ? 'before_after' : 'image'));
    setCategory(item.category || 'Repairing Photos');
    setTitle(item.title || '');
    setDescription(item.description || '');
    setImageUrl(item.imageUrl || '');
    setVideoUrl(item.videoUrl || '');
    setBeforeImageUrl(item.beforeImageUrl || '');
    setAfterImageUrl(item.afterImageUrl || '');
    setServiceSlug(item.serviceSlug || '');
    setBrand(item.brand || '');
    setModel(item.model || '');
    setFeatured(!!item.featured);
    setActive(item.active !== false);
    setDisplayOrder(item.displayOrder || 1);
    setImageFile(null);
    setVideoFile(null);
    setBeforeFile(null);
    setAfterFile(null);
    setModalOpen(true);
  };

  const uploadFileToStorage = async (file: File, folder: string): Promise<string> => {
    setUploadProgress(0);
    const res = await uploadMediaFile(file, { 
      folder: `gallery/${folder}`,
      onProgress: (percent) => setUploadProgress(percent)
    });
    if (!res.success || !res.url) {
      throw new Error(res.error || 'Failed to upload media file');
    }
    setUploadProgress(100);
    return res.url;
  };

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);

    try {
      let finalImageUrl = imageUrl;
      let finalVideoUrl = videoUrl;
      let finalBeforeUrl = beforeImageUrl;
      let finalAfterUrl = afterImageUrl;

      // 1. Handle file uploads if selected
      if (imageFile) {
        finalImageUrl = await uploadFileToStorage(imageFile, 'photos');
      }
      if (videoFile) {
        finalVideoUrl = await uploadFileToStorage(videoFile, 'videos');
      }
      if (beforeFile) {
        finalBeforeUrl = await uploadFileToStorage(beforeFile, 'before-after');
      }
      if (afterFile) {
        finalAfterUrl = await uploadFileToStorage(afterFile, 'before-after');
      }

      const itemId = editingItem ? editingItem.id : `gal-${Date.now()}`;
      let youtubeVideoId = null;
      let finalThumbnailUrl = finalImageUrl;

      if (mediaType === 'video' && finalVideoUrl) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = finalVideoUrl.match(regExp);
        if (match && match[2] && match[2].length === 11) {
          youtubeVideoId = match[2];
          if (!finalThumbnailUrl) {
            finalThumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;
          }
        } else if (!finalVideoUrl.startsWith('http') && !videoFile) {
          alert('Please enter a valid YouTube video URL.');
          setUploadLoading(false);
          return;
        }
      }

      const rawPayload: any = {
        id: itemId,
        title: title || 'Repair Video',
        description: description || '',
        category: category || (mediaType === 'video' ? 'Repairing Videos' : 'Repairing Photos'),
        mediaType: mediaType || 'image',
        imageUrl: finalThumbnailUrl || finalAfterUrl || finalBeforeUrl || (mediaType === 'video' ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800' : null),
        thumbnailUrl: finalThumbnailUrl || null,
        videoUrl: finalVideoUrl || null,
        youtubeVideoId: youtubeVideoId || null,
        beforeImageUrl: finalBeforeUrl || null,
        afterImageUrl: finalAfterUrl || null,
        serviceSlug: serviceSlug || null,
        brand: brand || null,
        model: model || null,
        featured: !!featured,
        active: active !== false,
        displayOrder: Number(displayOrder) || 1,
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const cleanFirestoreData = (data: Record<string, any>) => {
        const cleaned: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          if (value === undefined) {
            cleaned[key] = null;
          } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            cleaned[key] = cleanFirestoreData(value);
          } else {
            cleaned[key] = value;
          }
        }
        return cleaned;
      };

      const payload = cleanFirestoreData(rawPayload);

      await setDoc(doc(db, 'gallery', itemId), payload);

      // If it's a video or has videoUrl, also save to videos collection so it appears in video sections
      if (mediaType === 'video' || finalVideoUrl) {
        const videoPayload = {
          id: itemId,
          title: title || 'Repair Video',
          description: description || '',
          category: category || 'General',
          videoUrl: finalVideoUrl,
          thumbnailUrl: finalImageUrl || null,
          featured: !!featured,
          active: active !== false,
          displayOrder: Number(displayOrder) || 1,
          createdAt: rawPayload.createdAt,
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'videos', itemId), cleanFirestoreData(videoPayload));
      }

      setModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Error saving gallery item:', err);
      alert('Failed to save gallery item. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this repair gallery item?')) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
      try {
        await deleteDoc(doc(db, 'videos', id));
      } catch (e) {
        // ignore if not in videos
      }
      await fetchData();
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      alert('Failed to delete item.');
    }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      const newActive = !item.active;
      await updateDoc(doc(db, 'gallery', item.id), { active: newActive });
      try {
        await updateDoc(doc(db, 'videos', item.id), { active: newActive });
      } catch (e) {
        // ignore
      }
      await fetchData();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    try {
      const newFeatured = !item.featured;
      await updateDoc(doc(db, 'gallery', item.id), { featured: newFeatured });
      try {
        await updateDoc(doc(db, 'videos', item.id), { featured: newFeatured });
      } catch (e) {
        // ignore
      }
      await fetchData();
    } catch (err) {
      console.error('Error toggling featured status:', err);
    }
  };

  const filteredGallery = gallery.filter((item) => {
    if (activeTabCategory === 'All') return true;
    return item.category === activeTabCategory;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-200/80">
        <div>
          <h3 className="text-xl font-black text-slate-900 font-sans flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0284C7]" />
            Repair Gallery & Bench Portfolio
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage bench photos, Before/After slider comparisons, and repair videos linked to services & models.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Gallery Item</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTabCategory('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeTabCategory === 'All'
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          All Items ({gallery.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTabCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTabCategory === cat
                ? 'bg-[#0284C7] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat} ({gallery.filter((g) => g.category === cat).length})
          </button>
        ))}
      </div>

      {/* Gallery Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-100 animate-pulse rounded-3xl h-64 border border-slate-200" />
          ))}
        </div>
      ) : filteredGallery.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:border-sky-300 transition-all p-4 space-y-4"
            >
              <div className="space-y-3">
                {/* Media Preview Box */}
                <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                  {item.mediaType === 'before_after' && item.beforeImageUrl && item.afterImageUrl ? (
                    <BeforeAfterSlider
                      beforeImage={item.beforeImageUrl}
                      afterImage={item.afterImageUrl}
                      title={item.title}
                    />
                  ) : item.mediaType === 'video' && item.videoUrl ? (
                    <div className="w-full h-full relative">
                      <img
                        src={item.thumbnailUrl || item.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider rounded-md">
                        Video
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.imageUrl || item.afterImageUrl || ''}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white font-bold text-[9px] rounded-md">
                    {item.category}
                  </span>
                </div>

                {/* Info Text */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-extrabold text-[9px] rounded-md">
                      Order: {item.displayOrder}
                    </span>
                    {item.serviceSlug && (
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-extrabold text-[9px] rounded-md border border-sky-200">
                        Linked Service
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all border ${
                      item.active !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    {item.active !== false ? 'Active' : 'Hidden'}
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className={`p-1.5 rounded-lg text-[10px] font-extrabold transition-all border ${
                      item.featured
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                    title="Toggle Featured"
                  >
                    <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 text-slate-500 hover:text-[#0284C7] bg-slate-50 hover:bg-sky-50 rounded-lg border border-slate-200 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-12 rounded-3xl text-center max-w-sm mx-auto space-y-3">
          <Image className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-slate-800 text-sm">No items in this category</h4>
          <p className="text-xs text-slate-500">Click "Add New Gallery Item" to upload your first bench proof.</p>
        </div>
      )}

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-10 pb-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 text-xs text-slate-700 relative shadow-2xl my-auto max-h-[90vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3 space-y-1">
              <h3 className="font-black text-slate-900 text-lg">
                {editingItem ? 'Edit Repair Gallery Item' : 'Add New Repair Gallery Item'}
              </h3>
              <p className="text-slate-500 text-[11px]">
                Fill out the media details, category, Before/After files, or link to a specific repair service.
              </p>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="space-y-5">
              
              {/* Media Type Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Media Format *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`py-2 px-3 rounded-xl font-extrabold text-xs border flex items-center justify-center gap-1.5 ${
                      mediaType === 'image'
                        ? 'bg-[#0284C7] text-white border-[#0284C7]'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Image className="w-3.5 h-3.5" />
                    Standard Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('before_after')}
                    className={`py-2 px-3 rounded-xl font-extrabold text-xs border flex items-center justify-center gap-1.5 ${
                      mediaType === 'before_after'
                        ? 'bg-[#0284C7] text-white border-[#0284C7]'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Before / After
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`py-2 px-3 rounded-xl font-extrabold text-xs border flex items-center justify-center gap-1.5 ${
                      mediaType === 'video'
                        ? 'bg-[#0284C7] text-white border-[#0284C7]'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Repair Video
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Media File Uploads depending on type */}
              {mediaType === 'before_after' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <ImageUploader
                    label="1. Before Image (Damaged Device)"
                    value={beforeImageUrl}
                    onChange={(url) => setBeforeImageUrl(url)}
                    folder="gallery/before"
                  />
                  <ImageUploader
                    label="2. After Image (Restored Device)"
                    value={afterImageUrl}
                    onChange={(url) => setAfterImageUrl(url)}
                    folder="gallery/after"
                  />
                </div>
               ) : mediaType === 'video' ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">YouTube Video URL *</label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=ABC123XYZ or https://youtu.be/..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Paste any standard YouTube watch, short, or share link. No YouTube API key required.
                    </p>
                  </div>

                  {/* Automatic Video Preview */}
                  {videoUrl && (
                    (() => {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                      const match = videoUrl.match(regExp);
                      const vidId = match && match[2] && match[2].length === 11 ? match[2] : null;

                      if (vidId) {
                        const thumbUrl = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
                        return (
                          <div className="space-y-2 p-3 bg-white rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-black text-emerald-600 uppercase tracking-wider">
                                ✓ Valid YouTube Video ID: {vidId}
                              </span>
                            </div>
                            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
                              <img
                                src={thumbUrl}
                                alt="YouTube Thumbnail Preview"
                                className="w-full h-full object-cover opacity-90"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
                                }}
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-lg">
                                  <Play className="w-5 h-5 fill-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-bold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>Please enter a valid YouTube video URL.</span>
                          </div>
                        );
                      }
                    })()
                  )}

                  <div className="pt-2 border-t border-slate-200">
                    <ImageUploader
                      label="Custom Thumbnail Poster (Optional)"
                      value={imageUrl}
                      onChange={(url) => setImageUrl(url)}
                      folder="gallery/thumbnails"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <ImageUploader
                    label="Gallery / Repair Photo"
                    value={imageUrl}
                    onChange={(url) => setImageUrl(url)}
                    folder="gallery"
                  />
                </div>
              )}

              {/* Title & Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Poco X3 Pro Double-Decker CPU Reballing"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Short Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what repair steps were executed and the final testing result..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              {/* Service Linking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Link to Service</label>
                  <select
                    value={serviceSlug}
                    onChange={(e) => setServiceSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">None (General Gallery)</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Brand (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Poco"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Model (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Poco X3 Pro"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Display Order & Visibility Toggles */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Visibility Status</label>
                  <select
                    value={String(active)}
                    onChange={(e) => setActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="true">Active / Visible</option>
                    <option value="false">Hidden / Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Showcase on Home</label>
                  <select
                    value={String(featured)}
                    onChange={(e) => setFeatured(e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="false">Standard Item</option>
                    <option value="true">Featured</option>
                  </select>
                </div>
              </div>

              {/* Submit Controls */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex-1 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      {uploadProgress > 0 && uploadProgress < 100 
                        ? `Uploading File (${uploadProgress}%)...` 
                        : 'Saving Item to Database...'}
                    </>
                  ) : (
                    'Save Gallery Item'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
