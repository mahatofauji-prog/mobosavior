import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadMediaFile, deleteMediaFile } from '../../lib/storageUpload';
import { GalleryItem, Service, GALLERY_CATEGORIES, mapCategoryToId, getCategoryLabel } from '../../types';
import BeforeAfterSlider from '../BeforeAfterSlider';
import ImageUploader from './ImageUploader';
import VideoThumbnail from '../VideoThumbnail';
import { parseVideoUrl, getVideoPlatformLabel, isValidSocialVideoUrl } from '../../lib/videoUtils';
import { Plus, Edit, Trash2, Eye, Star, Upload, Loader2, Sparkles, Image, Video, CheckCircle, AlertTriangle, ArrowUpDown, X, Play } from 'lucide-react';



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
  
  // Deletion State
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form State
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'before_after'>('image');
  const [category, setCategory] = useState<string>('repairing');
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

  // File states for upload to Firebase Storage (photos only)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  const [extractedThumbnailUrl, setExtractedThumbnailUrl] = useState<string | null>(null);
  const [extractingMetadata, setExtractingMetadata] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (mediaType === 'video' && videoUrl.trim()) {
      const parsed = parseVideoUrl(videoUrl);
      if (parsed && parsed.isValid) {
        if (parsed.platform === 'youtube' && parsed.youtubeId) {
          setExtractedThumbnailUrl(`https://img.youtube.com/vi/${parsed.youtubeId}/hqdefault.jpg`);
          return;
        }

        if (editingItem && editingItem.videoUrl === videoUrl.trim() && editingItem.thumbnailUrl) {
          setExtractedThumbnailUrl(editingItem.thumbnailUrl);
          return;
        }

        setExtractingMetadata(true);
        const controller = new AbortController();
        fetch('/api/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: videoUrl.trim() }),
          signal: controller.signal
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.thumbnailUrl) {
              setExtractedThumbnailUrl(data.thumbnailUrl);
            } else {
              setExtractedThumbnailUrl(null);
            }
          })
          .catch(err => {
            if (err.name !== 'AbortError') {
              setExtractedThumbnailUrl(null);
            }
          })
          .finally(() => {
            setExtractingMetadata(false);
          });

        return () => controller.abort();
      } else {
        setExtractedThumbnailUrl(null);
      }
    } else {
      setExtractedThumbnailUrl(null);
    }
  }, [videoUrl, mediaType]);

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
    setCategory(activeTabCategory !== 'All' ? mapCategoryToId(activeTabCategory) : 'repairing');
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
    setBeforeFile(null);
    setAfterFile(null);
    setExtractedThumbnailUrl(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setMediaType(item.mediaType || (item.videoUrl ? 'video' : item.beforeImageUrl ? 'before_after' : 'image'));
    setCategory(mapCategoryToId(item.category || 'repairing'));
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
    setBeforeFile(null);
    setAfterFile(null);
    setExtractedThumbnailUrl(item.thumbnailUrl || null);
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
      let finalBeforeUrl = beforeImageUrl;
      let finalAfterUrl = afterImageUrl;

      // 1. Handle file uploads if selected (images only)
      if (imageFile) {
        finalImageUrl = await uploadFileToStorage(imageFile, 'photos');
      }
      if (beforeFile) {
        finalBeforeUrl = await uploadFileToStorage(beforeFile, 'before-after');
      }
      if (afterFile) {
        finalAfterUrl = await uploadFileToStorage(afterFile, 'before-after');
      }

      let parsedVideo = null;
      let finalVideoUrl: string | null = null;
      let videoPlatform: string | null = null;
      let youtubeVideoId: string | null = null;
      let officialThumbnailUrl: string | null = null;

      // 2. Validate Social Media Video URL for "video" mediaType
      if (mediaType === 'video') {
        parsedVideo = parseVideoUrl(videoUrl);
        if (!parsedVideo || !parsedVideo.isValid) {
          alert('Please enter a valid YouTube, Facebook or Instagram video URL.');
          setUploadLoading(false);
          return;
        }
        finalVideoUrl = parsedVideo.originalUrl;
        videoPlatform = parsedVideo.platform;
        youtubeVideoId = parsedVideo.youtubeId || null;
        officialThumbnailUrl = extractedThumbnailUrl;
      }

      const itemId = editingItem ? editingItem.id : `gal-${Date.now()}`;
      const finalCategoryId = mapCategoryToId(category) || (mediaType === 'video' ? 'repairing_videos' : 'repairing');

      const rawPayload: any = {
        id: itemId,
        title: title || (mediaType === 'video' ? 'Repair Video' : 'Repair Gallery Item'),
        description: description || '',
        category: finalCategoryId,
        mediaType: mediaType || 'image',
        imageUrl: mediaType === 'video' ? officialThumbnailUrl : (finalImageUrl || finalAfterUrl || finalBeforeUrl || null),
        thumbnailUrl: mediaType === 'video' ? officialThumbnailUrl : null,
        videoUrl: finalVideoUrl || null,
        videoPlatform: videoPlatform || null,
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

      // If it's a video, also sync to videos collection
      if (mediaType === 'video' && finalVideoUrl) {
        const videoPayload = {
          id: itemId,
          title: title || 'Repair Video',
          description: description || '',
          category: finalCategoryId,
          videoUrl: finalVideoUrl,
          videoPlatform: videoPlatform || null,
          youtubeVideoId: youtubeVideoId || null,
          thumbnailUrl: officialThumbnailUrl,
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

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      // 1. Delete from Firestore gallery collection
      await deleteDoc(doc(db, 'gallery', itemToDelete.id));
      
      // 2. Delete from videos collection (legacy/compatibility)
      try {
        await deleteDoc(doc(db, 'videos', itemToDelete.id));
      } catch (e) {
        // ignore if not in videos
      }

      // 3. For video items: delete only database records!
      // Do NOT attempt to delete anything from social platforms, and no thumbnail storage cleanup.
      const isVideoItem = itemToDelete.mediaType === 'video' || Boolean(itemToDelete.videoUrl);
      if (!isVideoItem) {
        const { imageUrl, beforeImageUrl, afterImageUrl } = itemToDelete;
        
        const candidateFiles = Array.from(new Set([imageUrl, beforeImageUrl, afterImageUrl]))
          .filter((url): url is string => Boolean(url) && url.startsWith('/uploads/'));
        
        for (const fileUrl of candidateFiles) {
          const isShared = gallery.some(
            item => item.id !== itemToDelete.id && (
              item.imageUrl === fileUrl ||
              item.beforeImageUrl === fileUrl ||
              item.afterImageUrl === fileUrl
            )
          );
          if (!isShared) {
            try {
              await deleteMediaFile(fileUrl);
            } catch (delErr) {
              console.warn('Failed to delete file from storage:', delErr);
            }
          }
        }
      }

      // 4. Clean up state and re-fetch
      setItemToDelete(null);
      await fetchData();
      
      setTimeout(() => alert('Gallery item deleted successfully.'), 100);
      
    } catch (err: any) {
      console.error('Error deleting gallery item:', err);
      setDeleteError(err.message || 'Unable to delete this gallery item. Please try again.');
    } finally {
      setDeleteLoading(false);
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
    return mapCategoryToId(item.category) === mapCategoryToId(activeTabCategory);
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
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTabCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTabCategory === cat.id
                ? 'bg-[#0284C7] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label} ({gallery.filter((g) => mapCategoryToId(g.category) === cat.id).length})
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
                    <VideoThumbnail
                      videoUrl={item.videoUrl}
                      thumbnailUrl={item.thumbnailUrl}
                      title={item.title}
                      showPlayButton={true}
                    />
                  ) : (
                    <img
                      src={item.imageUrl || item.afterImageUrl || ''}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white font-bold text-[9px] rounded-md">
                    {getCategoryLabel(item.category)}
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
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteError(null);
                    }}
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

              {/* Repair Video specific field layout: Video URL * -> Category * */}
              {mediaType === 'video' ? (
                <>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Video URL *</label>
                      <input
                        type="text"
                        required
                        placeholder="Paste YouTube, Facebook or Instagram URL"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supported Sources:</span>
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-md border border-red-200">
                          YouTube (Video / Shorts)
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-200">
                          Facebook (Video / Reel)
                        </span>
                        <span className="px-2 py-0.5 bg-pink-50 text-pink-700 text-[10px] font-bold rounded-md border border-pink-200">
                          Instagram (Reel / Post)
                        </span>
                      </div>
                    </div>

                    {/* Real-time Video Preview & Validation */}
                    {videoUrl.trim() && (
                      (() => {
                        const parsed = parseVideoUrl(videoUrl);
                        if (parsed && parsed.isValid) {
                          return (
                            <div className="space-y-2 p-3 bg-white rounded-2xl border border-emerald-200 shadow-sm">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  Valid {getVideoPlatformLabel(parsed.platform)} Video Detected
                                </span>
                              </div>
                              <VideoThumbnail
                                videoUrl={parsed.originalUrl}
                                thumbnailUrl={extractedThumbnailUrl}
                                aspectRatio="video"
                                title="Platform Preview"
                                showPlayButton={false}
                                className="rounded-xl overflow-hidden"
                              />
                              <p className="text-[11px] text-slate-500 italic">
                                {extractingMetadata ? (
                                  <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Extracting thumbnail...</span>
                                ) : extractedThumbnailUrl ? (
                                  'Actual thumbnail successfully extracted.'
                                ) : (
                                  'Thumbnail extraction unavailable. Video will play directly via the official platform embed.'
                                )}
                              </p>
                            </div>
                          );
                        } else {
                          return (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-bold flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                              <span>Please enter a valid YouTube, Facebook or Instagram video URL.</span>
                            </div>
                          );
                        }
                      })()
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category *</label>
                    <select
                      value={mapCategoryToId(category) || 'repairing_videos'}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold"
                    >
                      {GALLERY_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* Category */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category *</label>
                    <select
                      value={mapCategoryToId(category) || 'repairing'}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold"
                    >
                      {GALLERY_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Media File Uploads for Before/After or Standard Photo */}
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
                </>
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

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Delete this gallery item?</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                This action will permanently remove this item from the repair gallery. This cannot be undone.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl text-left">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={executeDelete}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 transition-colors"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
