import React, { useState, useRef, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from '../../lib/supabase';
import { db } from '../../lib/supabase';
import { uploadMediaFile, validateImageFile, validateMediaFile } from '../../lib/storageUpload';
import { 
  Upload, Link as LinkIcon, Image as ImageIcon, X, Check, Loader2, 
  AlertCircle, RefreshCw, Smartphone, Eye, Database, Sparkles, FolderOpen 
} from 'lucide-react';

export interface ImageUploaderProps {
  value: string;
  onChange: (url: string, source?: 'upload' | 'url') => void;
  label?: string;
  helperText?: string;
  folder?: string;
  required?: boolean;
  compact?: boolean;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  id?: string;
  placeholder?: string;
  isThumbnail?: boolean;
}

export default function ImageUploader({
  value,
  onChange,
  label,
  helperText,
  folder = 'uploads',
  required = false,
  compact = false,
  aspectRatio = 'auto',
  id,
  placeholder = 'https://example.com/image.jpg',
  isThumbnail = false
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'library'>('upload');
  const [inputUrl, setInputUrl] = useState(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [isReplacing, setIsReplacing] = useState(!value);

  // Media Library Modal
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [libraryImages, setLibraryImages] = useState<Array<{ id: string; url: string; title?: string }>>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal URL state with external value
  useEffect(() => {
    setInputUrl(value || '');
    if (value) {
      setIsReplacing(false);
      setImgLoadError(false);
    } else {
      setIsReplacing(true);
    }
  }, [value]);

  // Handle File Selection & Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Validation (JPG, PNG, WEBP, GIF, Max 15MB)
    const validation = isThumbnail 
      ? validateImageFile(file, 15) 
      : validateMediaFile(file, undefined, 15);

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Preserve previous URL in case upload fails
    const previousUrl = value || inputUrl;

    // 2. Perform Real Storage Upload with real-time XHR progress
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const result = await uploadMediaFile(file, {
        folder,
        maxSizeMB: 15,
        onProgress: (percent) => {
          setUploadProgress(percent);
        }
      });

      if (!result.success || !result.url) {
        // Keep the existing thumbnail if there was one
        setInputUrl(previousUrl);
        if (previousUrl) {
          setIsReplacing(false);
        }
        setErrorMessage(result.error || 'Upload failed. Please try again.');
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(100);
      setIsUploading(false);
      setInputUrl(result.url);
      onChange(result.url, 'upload');
      setIsReplacing(false);
      setImgLoadError(false);
      setErrorMessage(null);
      setSuccessMessage(isThumbnail ? 'Thumbnail uploaded successfully' : 'Image uploaded successfully');
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setInputUrl(previousUrl);
      if (previousUrl) {
        setIsReplacing(false);
      }
      setErrorMessage(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle Direct URL Commit
  const handleApplyUrl = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a valid image URL.');
      return;
    }

    // Basic URL validation
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:') && !trimmed.startsWith('/')) {
      setErrorMessage('Image URL must begin with http:// or https://');
      return;
    }

    onChange(trimmed, 'url');
    setIsReplacing(false);
    setImgLoadError(false);
  };

  // Handle Removal
  const handleRemove = () => {
    setInputUrl('');
    onChange('', 'url');
    setIsReplacing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setImgLoadError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fetch Media Library Images for reuse
  const fetchLibraryImages = async () => {
    try {
      setLoadingLibrary(true);
      setShowLibraryModal(true);
      const imgs: Array<{ id: string; url: string; title?: string }> = [];

      // 1. Try server media library endpoint
      try {
        const res = await fetch('/api/media-library');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.files)) {
            data.files.forEach((f: any) => {
              imgs.push({ id: f.name, url: f.url, title: f.name });
            });
          }
        }
      } catch (apiErr) {
        console.warn('Server media library fetch failed:', apiErr);
      }

      // 2. Fetch from Firestore gallery
      try {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(24));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const data = d.data();
          if (data.imageUrl && !imgs.some((img) => img.url === data.imageUrl)) {
            imgs.push({ id: d.id, url: data.imageUrl, title: data.title });
          }
        });
      } catch (dbErr) {
        console.warn('Firestore gallery fetch error:', dbErr);
      }

      setLibraryImages(imgs);
    } catch (err) {
      console.error('Error fetching media library:', err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleSelectFromLibrary = (url: string) => {
    setInputUrl(url);
    onChange(url, 'url');
    setIsReplacing(false);
    setShowLibraryModal(false);
    setImgLoadError(false);
  };

  // Compute aspect ratio CSS class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'banner':
        return 'aspect-[3/1]';
      default:
        return 'max-h-52 object-contain';
    }
  };

  return (
    <div className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`} id={id}>
      {/* Field Label */}
      {label && (
        <div className="flex justify-between items-center">
          <label className="block font-bold text-slate-800 text-xs uppercase tracking-wider font-sans">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {value && !isReplacing && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
              <Check className="w-3 h-3" /> {isThumbnail ? 'Thumbnail Set' : 'Image Set'}
            </span>
          )}
        </div>
      )}

      {/* Helper Text */}
      {helperText && <p className="text-[11px] text-slate-500 leading-tight">{helperText}</p>}

      {/* Success Alert Message */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-start gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="flex-grow font-semibold">{successMessage}</div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-600 focus:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Alert Message */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-grow">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-600 focus:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SCENARIO 1: Existing Active Image Preview Card */}
      {value && !isReplacing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3 shadow-sm relative overflow-hidden group">
          <div className="relative bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center min-h-[120px] max-h-60 border border-slate-800/80">
            {imgLoadError ? (
              <div className="p-6 text-center text-rose-400 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
                <p className="text-xs font-bold">Failed to load preview image</p>
                <p className="text-[10px] text-slate-400 break-all max-w-xs mx-auto">{value}</p>
              </div>
            ) : (
              <img
                src={value}
                alt={label || 'Preview'}
                onError={() => setImgLoadError(true)}
                className={`w-full ${getAspectClass()} object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.01]`}
              />
            )}

            {/* Overlaid Source Badge */}
            <div className="absolute top-2 left-2 bg-slate-900/90 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur border border-slate-700 flex items-center gap-1.5 shadow-md">
              <ImageIcon className="w-3 h-3 text-sky-400" />
              <span>{value.startsWith('/uploads/') ? 'Local Storage' : value.includes('supabase.co/storage') ? 'Cloud Storage' : 'Image URL'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsReplacing(true);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-[#0284C7] hover:text-white text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700/80 flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isThumbnail ? 'Replace Thumbnail' : 'Replace Image'}</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="py-2 px-3.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-bold rounded-xl transition-all border border-rose-500/20 flex items-center justify-center gap-1.5 active:scale-95"
              title={isThumbnail ? 'Remove Thumbnail' : 'Remove Image'}
            >
              <X className="w-3.5 h-3.5" />
              <span>{isThumbnail ? 'Remove Thumbnail' : 'Remove'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* SCENARIO 2: Image Selection / Upload Form */
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#0284C7] rounded-2xl p-4 transition-colors space-y-4">
          {/* Method Selection Tabs */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-[#0284C7] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-500" />
              <span>Upload from Device</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('url');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white text-[#0284C7] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-sky-500" />
              <span>Use Image URL</span>
            </button>

            <button
              type="button"
              onClick={fetchLibraryImages}
              className="py-2 px-2.5 rounded-lg text-xs font-black text-slate-600 hover:bg-white/60 hover:text-slate-900 transition-all flex items-center justify-center gap-1"
              title="Select from Lab Media Library"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Library</span>
            </button>
          </div>

          {/* TAB 1: DEVICE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                id={`file-input-${id || Math.random()}`}
              />

              {isUploading ? (
                <div className="py-6 px-4 bg-white rounded-xl border border-sky-100 text-center space-y-3">
                  <Loader2 className="w-7 h-7 text-[#0284C7] animate-spin mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Uploading… {uploadProgress > 0 ? `(${uploadProgress}%)` : ''}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Please wait while media is saved...</p>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(uploadProgress, 10)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 px-4 bg-white hover:bg-sky-50/50 border-2 border-sky-200/80 hover:border-[#0284C7] rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center group active:scale-[0.99]"
                >
                  <div className="w-12 h-12 bg-sky-100 text-[#0284C7] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 group-hover:text-[#0284C7]">
                      {isThumbnail ? 'Upload from Device' : '📱 Tap to Select Image from Mobile / PC'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Supports JPG, PNG, WEBP, GIF up to 15MB
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: URL INPUT */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Paste Direct Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder={placeholder}
                    className="flex-grow px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 text-slate-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 bg-[#0284C7] hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply URL</span>
                  </button>
                </div>
              </div>

              {/* Live Preview of Pasted URL */}
              {inputUrl.trim().length > 10 && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live URL Preview</span>
                  <div className="bg-slate-900 rounded-lg p-2 flex items-center justify-center min-h-[100px] max-h-40 overflow-hidden">
                    <img
                      src={inputUrl.trim()}
                      alt="URL Preview"
                      onError={() => setErrorMessage('Unable to load image from provided URL. Check link permissions.')}
                      className="max-h-36 object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancel Replace Button (if replacing existing value) */}
          {value && isReplacing && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setIsReplacing(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel Replace
              </button>
            </div>
          )}
        </div>
      )}

      {/* MEDIA LIBRARY MODAL */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#0284C7]" />
                <h3 className="font-extrabold text-slate-900 text-base">Lab Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select any previously uploaded photo from your lab database to use it instantly without re-uploading.
            </p>

            <div className="flex-grow overflow-y-auto pr-1">
              {loadingLibrary ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0284C7]" />
                  <span>Loading library media...</span>
                </div>
              ) : libraryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {libraryImages.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleSelectFromLibrary(img.url)}
                      className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-200 hover:border-[#0284C7] hover:ring-2 hover:ring-sky-200 transition-all text-left flex flex-col aspect-square"
                    >
                      <img
                        src={img.url}
                        alt={img.title || 'Library Item'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[10px] font-bold text-white truncate">{img.title || 'Select Image'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No previous media items found in gallery database.
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
