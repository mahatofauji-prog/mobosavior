import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadMediaFile, deleteMediaFile } from '../../lib/storageUpload';
import { GalleryItem, Service, GALLERY_CATEGORIES, mapCategoryToId, getCategoryLabel } from '../../types';
import BeforeAfterSlider from '../BeforeAfterSlider';
import ImageUploader from './ImageUploader';
import VideoThumbnail from '../VideoThumbnail';
import { extractFrameFromVideoFile, extractFrameFromVideoUrl, blobToFile } from '../../lib/videoThumbnailExtractor';
import { parseVideoUrl, getVideoPlatformLabel, isValidSocialVideoUrl, isDirectVideoUrl } from '../../lib/videoUtils';
import { 
  Plus, Edit, Trash2, Eye, Star, Upload, Loader2, Sparkles, Image, Video, 
  CheckCircle, AlertTriangle, ArrowUpDown, X, Play, Film, Camera, RefreshCw, 
  Sliders, FileVideo, Check
} from 'lucide-react';

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

  // File states for upload to Cloud Storage
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Video specific state
  const [videoUploadMode, setVideoUploadMode] = useState<'url' | 'file'>('url');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [extractedThumbnailUrl, setExtractedThumbnailUrl] = useState<string | null>(null);
  const [extractedThumbnailBlob, setExtractedThumbnailBlob] = useState<Blob | null>(null);
  const [customThumbnailFile, setCustomThumbnailFile] = useState<File | null>(null);
  const [extractingMetadata, setExtractingMetadata] = useState(false);
  const [frameTimestamp, setFrameTimestamp] = useState<number>(1.0);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-extract thumbnail whenever videoUrl changes in 'url' mode
  useEffect(() => {
    if (mediaType === 'video' && videoUploadMode === 'url' && videoUrl.trim()) {
      const parsed = parseVideoUrl(videoUrl);
      if (parsed && parsed.isValid) {
        if (parsed.platform === 'youtube' && parsed.youtubeId) {
          setExtractedThumbnailUrl(`https://img.youtube.com/vi/${parsed.youtubeId}/hqdefault.jpg`);
          setExtractedThumbnailBlob(null);
          return;
        }

        if (editingItem && editingItem.videoUrl === videoUrl.trim() && editingItem.thumbnailUrl) {
          setExtractedThumbnailUrl(editingItem.thumbnailUrl);
          return;
        }

        // If direct video link, extract frame directly in browser
        if (parsed.platform === 'direct' || isDirectVideoUrl(videoUrl)) {
          setExtractingMetadata(true);
          extractFrameFromVideoUrl(videoUrl.trim(), frameTimestamp)
            .then(res => {
              setExtractedThumbnailUrl(res.dataUrl);
              setExtractedThumbnailBlob(res.blob);
            })
            .catch(err => {
              console.warn('Direct video frame extraction error:', err);
            })
            .finally(() => {
              setExtractingMetadata(false);
            });
          return;
        }

        // For Instagram / Facebook, query backend metadata
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
              setExtractedThumbnailBlob(null);
            }
          })
          .catch(err => {
            if (err.name !== 'AbortError') {
              console.warn('Metadata extraction error:', err);
            }
          })
          .finally(() => {
            setExtractingMetadata(false);
          });

        return () => controller.abort();
      }
    }
  }, [videoUrl, mediaType, videoUploadMode, frameTimestamp]);

  // Handle direct video file selection
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
      alert('Please select a valid video file (.mp4, .webm, .mov)');
      return;
    }

    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setExtractingMetadata(true);

    try {
      const frame = await extractFrameFromVideoFile(file, frameTimestamp);
      setExtractedThumbnailUrl(frame.dataUrl);
      setExtractedThumbnailBlob(frame.blob);
    } catch (err) {
      console.warn('Frame extraction from video file failed:', err);
    } finally {
      setExtractingMetadata(false);
    }
  };

  // Re-extract frame at specified seconds
  const handleExtractAtSeconds = async (seconds: number) => {
    setFrameTimestamp(seconds);
    setExtractingMetadata(true);
    try {
      if (videoFile) {
        const frame = await extractFrameFromVideoFile(videoFile, seconds);
        setExtractedThumbnailUrl(frame.dataUrl);
        setExtractedThumbnailBlob(frame.blob);
      } else if (videoUrl && (isDirectVideoUrl(videoUrl) || videoUrl.startsWith('blob:'))) {
        const frame = await extractFrameFromVideoUrl(videoUrl, seconds);
        setExtractedThumbnailUrl(frame.dataUrl);
        setExtractedThumbnailBlob(frame.blob);
      }
    } catch (e) {
      console.warn('Could not extract frame at', seconds, e);
    } finally {
      setExtractingMetadata(false);
    }
  };

  // Handle custom thumbnail file selection
  const handleCustomThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    setCustomThumbnailFile(file);
    const localUrl = URL.createObjectURL(file);
    setExtractedThumbnailUrl(localUrl);
    setExtractedThumbnailBlob(null);
  };

  async function fetchData() {
    try {
      setLoading(true);
      // Fetch Gallery from Supabase directly
      const { data: gData, error: gErr } = await supabase
        .from('gallery')
        .select('*')
        .order('displayOrder', { ascending: true });

      if (gErr) {
        console.error('[Supabase Gallery fetch error]:', gErr);
      } else if (gData) {
        setGallery(gData as GalleryItem[]);
      }

      // Fetch Services for linking
      const { data: sData, error: sErr } = await supabase
        .from('services')
        .select('*')
        .order('displayOrder', { ascending: true });

      if (sErr) {
        console.error('[Supabase Services fetch error in Gallery]:', sErr);
      } else if (sData) {
        setServices(sData as Service[]);
      }
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
    setVideoFile(null);
    setVideoUploadMode('url');
    setExtractedThumbnailUrl(null);
    setExtractedThumbnailBlob(null);
    setCustomThumbnailFile(null);
    setFrameTimestamp(1.0);
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
    setVideoFile(null);
    setVideoUploadMode('url');
    setExtractedThumbnailUrl(item.thumbnailUrl || null);
    setExtractedThumbnailBlob(null);
    setCustomThumbnailFile(null);
    setFrameTimestamp(1.0);
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

      // 1. Handle image file uploads if selected
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

      // 2. Handle Video File / URL & Extracted Thumbnail for "video" mediaType
      if (mediaType === 'video') {
        if (videoUploadMode === 'file' && videoFile) {
          // Upload local video file to storage
          finalVideoUrl = await uploadFileToStorage(videoFile, 'videos');
          videoPlatform = 'direct';
        } else if (videoUrl.trim()) {
          parsedVideo = parseVideoUrl(videoUrl);
          if (!parsedVideo || !parsedVideo.isValid) {
            alert('Please enter a valid YouTube, Facebook, Instagram, or direct video URL.');
            setUploadLoading(false);
            return;
          }
          finalVideoUrl = parsedVideo.originalUrl;
          videoPlatform = parsedVideo.platform;
          youtubeVideoId = parsedVideo.youtubeId || null;
        } else {
          alert('Please provide a video file or video URL.');
          setUploadLoading(false);
          return;
        }

        // Upload custom thumbnail file or extracted canvas frame blob
        if (customThumbnailFile) {
          officialThumbnailUrl = await uploadFileToStorage(customThumbnailFile, 'thumbnails');
        } else if (extractedThumbnailBlob) {
          const thumbFile = blobToFile(extractedThumbnailBlob, `thumb_${Date.now()}.jpg`);
          officialThumbnailUrl = await uploadFileToStorage(thumbFile, 'thumbnails');
        } else if (extractedThumbnailUrl && extractedThumbnailUrl.startsWith('data:')) {
          try {
            const blobRes = await fetch(extractedThumbnailUrl);
            const blobData = await blobRes.blob();
            const thumbFile = blobToFile(blobData, `thumb_${Date.now()}.jpg`);
            officialThumbnailUrl = await uploadFileToStorage(thumbFile, 'thumbnails');
          } catch (e) {
            console.warn('Failed to upload dataURL thumbnail:', e);
            officialThumbnailUrl = extractedThumbnailUrl;
          }
        } else {
          officialThumbnailUrl = extractedThumbnailUrl;
        }
      }

      const itemId = editingItem ? editingItem.id : `gal-${Date.now()}`;
      const finalCategoryId = mapCategoryToId(category) || (mediaType === 'video' ? 'repairing_videos' : 'repairing');

      // Build safe base payload with guaranteed database columns
      const baseGalleryPayload: any = {
        id: itemId,
        title: title || (mediaType === 'video' ? 'Repair Video' : 'Repair Gallery Item'),
        description: description || '',
        category: finalCategoryId,
        mediaType: mediaType || 'image',
        imageUrl: mediaType === 'video' ? officialThumbnailUrl : (finalImageUrl || finalAfterUrl || finalBeforeUrl || null),
        image_url: mediaType === 'video' ? officialThumbnailUrl : (finalImageUrl || finalAfterUrl || finalBeforeUrl || null),
        thumbnailUrl: mediaType === 'video' ? officialThumbnailUrl : null,
        thumbnail_url: mediaType === 'video' ? officialThumbnailUrl : null,
        videoUrl: finalVideoUrl || null,
        video_url: finalVideoUrl || null,
        videoPlatform: videoPlatform || null,
        video_platform: videoPlatform || null,
        youtubeVideoId: youtubeVideoId || null,
        youtube_video_id: youtubeVideoId || null,
        beforeImageUrl: finalBeforeUrl || null,
        afterImageUrl: finalAfterUrl || null,
        altText: [brand, model, title].filter(Boolean).join(' - ') || null,
        featured: !!featured,
        active: active !== false,
        is_active: active !== false,
        displayOrder: Number(displayOrder) || 1,
        display_order: Number(displayOrder) || 1,
        createdAt: editingItem ? (editingItem.createdAt || new Date().toISOString()) : new Date().toISOString(),
        created_at: editingItem ? (editingItem.createdAt || new Date().toISOString()) : new Date().toISOString()
      };

      // Extended payload including brand/model/serviceSlug if present in database schema
      const extendedGalleryPayload: any = {
        ...baseGalleryPayload,
        serviceSlug: serviceSlug || null,
        service_slug: serviceSlug || null,
        brand: brand || null,
        model: model || null
      };

      let saveErr = null;
      const firstAttempt = await supabase.from('gallery').upsert(extendedGalleryPayload);
      if (firstAttempt.error) {
        if (firstAttempt.error.code === 'PGRST204' || firstAttempt.error.message.includes('column') || firstAttempt.error.message.includes('schema cache')) {
          console.warn('[Supabase Gallery]: Extended columns not yet migrated in database, saving base schema with altText metadata...', firstAttempt.error.message);
          const secondAttempt = await supabase.from('gallery').upsert(baseGalleryPayload);
          saveErr = secondAttempt.error;
        } else {
          saveErr = firstAttempt.error;
        }
      }

      if (saveErr) {
        console.error('[GALLERY SAVE ERROR]', {
          payload: baseGalleryPayload,
          message: saveErr.message,
          code: saveErr.code,
          details: saveErr.details,
          hint: saveErr.hint
        });
        throw saveErr;
      }

      // If it's a video, also sync to videos table (which supports brand, model, serviceSlug)
      if (mediaType === 'video' && finalVideoUrl) {
        const videoPayload = {
          id: itemId,
          title: title || 'Repair Video',
          description: description || '',
          category: finalCategoryId,
          videoUrl: finalVideoUrl,
          video_url: finalVideoUrl,
          videoPlatform: videoPlatform || null,
          thumbnailUrl: officialThumbnailUrl,
          thumbnail_url: officialThumbnailUrl,
          imageUrl: officialThumbnailUrl,
          image_url: officialThumbnailUrl,
          featured: !!featured,
          active: active !== false,
          is_active: active !== false,
          displayOrder: Number(displayOrder) || 1,
          display_order: Number(displayOrder) || 1,
          createdAt: baseGalleryPayload.createdAt,
          created_at: baseGalleryPayload.created_at,
          serviceSlug: serviceSlug || null,
          brand: brand || null,
          model: model || null
        };
        const { error: vErr } = await supabase.from('videos').upsert(videoPayload);
        if (vErr) console.warn('[Supabase Sync Video Warning]:', vErr);
      }

      setModalOpen(false);
      await fetchData();
      alert(`Gallery item ${editingItem ? 'updated' : 'created'} successfully!`);
    } catch (err: any) {
      console.error('Error saving gallery item:', err);
      alert('Failed to save gallery item: ' + (err?.message || 'Database error.'));
    } finally {
      setUploadLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      // 1. Delete from Supabase gallery table
      const { error: gDelErr } = await supabase.from('gallery').delete().eq('id', itemToDelete.id);
      if (gDelErr) throw gDelErr;
      
      // 2. Delete from videos table if present
      try {
        await supabase.from('videos').delete().eq('id', itemToDelete.id);
      } catch (e) {
        // ignore
      }

      // 3. For video items: delete only database records!
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
      alert('Gallery item deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting gallery item:', err);
      setDeleteError(err?.message || 'Unable to delete this gallery item. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      const newActive = !item.active;
      const { error } = await supabase
        .from('gallery')
        .update({ active: newActive, is_active: newActive })
        .eq('id', item.id);
      if (error) throw error;

      try {
        await supabase.from('videos').update({ active: newActive, is_active: newActive }).eq('id', item.id);
      } catch (e) {}

      await fetchData();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    try {
      const newFeatured = !item.featured;
      const { error } = await supabase
        .from('gallery')
        .update({ featured: newFeatured })
        .eq('id', item.id);
      if (error) throw error;

      try {
        await supabase.from('videos').update({ featured: newFeatured }).eq('id', item.id);
      } catch (e) {}

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

              {/* Repair Video specific field layout */}
              {mediaType === 'video' ? (
                <>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                    {/* Mode Selector */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">Video Source *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVideoUploadMode('url');
                            setVideoFile(null);
                          }}
                          className={`py-2 px-3 rounded-xl font-extrabold text-xs border flex items-center justify-center gap-1.5 ${
                            videoUploadMode === 'url'
                              ? 'bg-[#0284C7] text-white border-[#0284C7]'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          <Film className="w-3.5 h-3.5" />
                          Video Link (YouTube / Social / URL)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoUploadMode('file');
                            setVideoUrl('');
                          }}
                          className={`py-2 px-3 rounded-xl font-extrabold text-xs border flex items-center justify-center gap-1.5 ${
                            videoUploadMode === 'file'
                              ? 'bg-[#0284C7] text-white border-[#0284C7]'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload Video File (MP4/WebM)
                        </button>
                      </div>
                    </div>

                    {videoUploadMode === 'url' ? (
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Video URL *</label>
                        <input
                          type="text"
                          required
                          placeholder="Paste YouTube, Facebook, Instagram, or direct video URL"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
                        />
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supported Sources:</span>
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-md border border-red-200">
                            YouTube
                          </span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-200">
                            Facebook
                          </span>
                          <span className="px-2 py-0.5 bg-pink-50 text-pink-700 text-[10px] font-bold rounded-md border border-pink-200">
                            Instagram
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200">
                            Direct MP4 / WebM
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Upload Video File (.mp4, .webm, .mov) *</label>
                        <input
                          ref={videoFileInputRef}
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/*"
                          onChange={handleVideoFileChange}
                          className="hidden"
                        />
                        <div
                          onClick={() => videoFileInputRef.current?.click()}
                          className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                        >
                          <FileVideo className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-800">
                            {videoFile ? videoFile.name : 'Click or Drag & Drop Video File to Upload'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for auto thumbnail extraction` : 'Supported: MP4, WebM, MOV (Auto frame extraction)'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Thumbnail & Frame Extraction Box */}
                    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-sky-500" />
                          Video Poster & Thumbnail
                        </span>
                        {extractingMetadata && (
                          <span className="text-[10px] font-bold text-sky-600 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Processing frame...
                          </span>
                        )}
                      </div>

                      {/* Video Thumbnail Preview */}
                      {(videoUrl.trim() || videoFile) && (
                        <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video max-h-48 flex items-center justify-center">
                          {extractedThumbnailUrl ? (
                            <img
                              src={extractedThumbnailUrl}
                              alt="Extracted Thumbnail"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : videoFile || (videoUrl && isDirectVideoUrl(videoUrl)) ? (
                            <video
                              src={videoUrl}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                          ) : (
                            <VideoThumbnail
                              videoUrl={videoUrl}
                              thumbnailUrl={extractedThumbnailUrl}
                              aspectRatio="video"
                              title="Video Preview"
                              showPlayButton={false}
                              className="w-full h-full"
                            />
                          )}
                        </div>
                      )}

                      {/* Frame extraction timestamps for direct video or uploaded video */}
                      {(videoFile || (videoUrl && (isDirectVideoUrl(videoUrl) || videoUrl.startsWith('blob:')))) && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <Sliders className="w-3 h-3" /> Capture frame at:
                          </span>
                          {[0.5, 1.0, 2.5, 5.0, 10.0].map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => handleExtractAtSeconds(sec)}
                              className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                                frameTimestamp === sec
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Custom Thumbnail Upload Option */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <input
                          ref={thumbnailInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCustomThumbnailChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-sky-500" />
                          {customThumbnailFile ? `Replace: ${customThumbnailFile.name}` : 'Upload Custom Cover / Thumbnail'}
                        </button>
                        {extractedThumbnailUrl && (
                          <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Thumbnail Ready
                          </span>
                        )}
                      </div>
                    </div>
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
