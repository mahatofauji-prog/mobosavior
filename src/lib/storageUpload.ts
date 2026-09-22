

import { supabase } from './supabase';

export interface UploadOptions {
  folder?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  onProgress?: (percent: number) => void;
  metadata?: Record<string, any>;
}

export interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  error?: string;
}

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const DEFAULT_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];

const DEFAULT_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

export const ALLOWED_MEDIA_TYPES = [...DEFAULT_IMAGE_TYPES, ...DEFAULT_VIDEO_TYPES];

/**
 * Converts any File to a base64 Data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image to a clean, lightweight WebP base64 Data URL.
 * Automatically fits inside maxDim (default 1200px) and quality 0.8.
 * Typically produces a 30KB - 80KB data URL which can be saved safely in Supabase or displayed anywhere.
 */
export async function compressImageToDataUrl(
  file: File,
  maxDim: number = 1200,
  quality: number = 0.8
): Promise<{ dataUrl: string; size: number }> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    const dataUrl = await fileToDataUrl(file).catch(() => '');
    return { dataUrl, size: file.size };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: e.target?.result as string, size: file.size });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/webp', quality);
        const size = Math.round((dataUrl.length * 3) / 4);
        resolve({ dataUrl, size });
      };
      img.onerror = () => {
        resolve({ dataUrl: e.target?.result as string, size: file.size });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = async () => {
      const dataUrl = await fileToDataUrl(file).catch(() => '');
      resolve({ dataUrl, size: file.size });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Validates a custom thumbnail or image file prior to upload (Max 15MB, JPG/PNG/WEBP/GIF)
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 15
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const mimeType = (file.type || '').toLowerCase();
  const extension = '.' + (file.name.split('.').pop() || '').toLowerCase();

  const isMimeValid = SUPPORTED_IMAGE_TYPES.includes(mimeType);
  const isExtValid = SUPPORTED_IMAGE_EXTENSIONS.includes(extension);

  if (!isMimeValid && !isExtValid) {
    return {
      valid: false,
      error: 'Please upload a JPG, PNG or WEBP image.'
    };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: 'Image size must be 15 MB or less.'
    };
  }

  return { valid: true };
}

/**
 * Validates a media file prior to upload
 */
export function validateMediaFile(
  file: File,
  allowedTypes: string[] = ALLOWED_MEDIA_TYPES,
  maxSizeMB: number = 15
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const mimeType = file.type.toLowerCase();
  // If file.type is empty (e.g. some mobile pickers), check extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4', '.webm', '.mov'];

  const typeMatched = allowedTypes.includes(mimeType) || validExtensions.includes(extension);

  if (!typeMatched) {
    return { 
      valid: false, 
      error: 'Please upload a JPG, PNG or WEBP image.' 
    };
  }

  const isVideo = mimeType.startsWith('video/') || ['.mp4', '.webm', '.mov'].includes(extension);
  const effectiveMaxMB = isVideo ? Math.max(maxSizeMB, 100) : maxSizeMB;
  const maxBytes = effectiveMaxMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: isVideo 
        ? `Video file is too large. Maximum allowed limit is ${effectiveMaxMB}MB.` 
        : 'Image size must be 15 MB or less.'
    };
  }

  return { valid: true };
}

/**
 * Generates a unique, sanitized storage path
 */
export function generateStoragePath(file: File, folder: string = 'gallery'): string {
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '') || 'uploads';
  return `${cleanFolder}/${timestamp}_${randomSuffix}_${sanitizedName}`;
}

/**
 * High-performance thumbnail compressor (max 960px width/height, WebP, 0.82 quality)
 * Reduces 5MB-10MB mobile camera photos down to 30KB-80KB in ~50ms
 */
export async function compressThumbnailFile(
  file: File,
  maxDim: number = 960,
  quality: number = 0.82
): Promise<File> {
  if (!file || !file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
            } else {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(file: File, isThumbnailFolder: boolean = false): Promise<File> {
  if (!file || !file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }
  if (isThumbnailFolder) {
    return compressThumbnailFile(file, 960, 0.82);
  }
  if (file.size < 500 * 1024) {
    return file;
  }
  return compressThumbnailFile(file, 1600, 0.85);
}

/**
 * Performs actual media upload with real progress tracking and compression
 */
export async function uploadMediaFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const folder = options.folder || 'gallery';
  const maxSizeMB = options.maxSizeMB || 100;
  const allowedTypes = options.allowedTypes || ALLOWED_MEDIA_TYPES;
  const onProgress = options.onProgress;

  // 1. Compress image if applicable (ultra-compressed if folder is thumbnails)
  const isThumb = folder.toLowerCase().includes('thumbnail');
  const processedFile = await compressImageFile(file, isThumb);

  // 2. Validation
  const validation = validateMediaFile(processedFile, allowedTypes, maxSizeMB);
  if (!validation.valid) {
    return {
      success: false,
      url: '',
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      error: validation.error || 'Validation failed'
    };
  }

  const isImage = processedFile.type.startsWith('image/') || 
    ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some(ext => processedFile.name.toLowerCase().endsWith(ext));

  // Determine appropriate Supabase Storage bucket
  const primaryBucket = (folder === 'offers' || folder === 'promotional-offers') ? 'promotional-offers' : 'mobosavior-media';
  const bucketsToTry = [primaryBucket, 'mobosavior-media', 'media'];

  // Try Supabase Storage buckets first
  for (const bucket of bucketsToTry) {
    try {
      const sPath = generateStoragePath(processedFile, folder);
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(sPath, processedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadErr && uploadData) {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(sPath);

        if (urlData?.publicUrl) {
          onProgress?.(100);
          return {
            success: true,
            url: urlData.publicUrl,
            filename: processedFile.name,
            size: processedFile.size,
            mimeType: processedFile.type
          };
        }
      }
    } catch {
      // Continue trying next bucket or server endpoint
    }
  }

  const uniquePath = generateStoragePath(processedFile, folder);

  // Native App Server Upload (/api/upload) with 60s timeout and real XHR Progress
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 60000;
    const formData = new FormData();
    formData.append('folder', folder);
    formData.append('path', uniquePath);
    formData.append('file', processedFile, processedFile.name);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(Math.min(percent, 100));
      }
    };

    xhr.ontimeout = () => {
      resolve({
        success: false,
        url: '',
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        error: 'Upload timed out. Please check your internet connection and try again.'
      });
    };

    xhr.onerror = () => {
      resolve({
        success: false,
        url: '',
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        error: 'Network error occurred during file upload. Please check your connection.'
      });
    };

    xhr.onload = () => {
      const rawText = (xhr.responseText || '').trim();
      const status = xhr.status;

      // 1. Handle HTTP error status codes
      if (status < 200 || status >= 300) {
        let errorMessage = `Upload failed with status ${status}.`;
        if (status === 401 || status === 403) {
          errorMessage = 'Authentication failed. Please ensure you are logged in as administrator.';
        } else if (status === 413) {
          errorMessage = 'Image size must be 15 MB or less.';
        } else if (status === 404) {
          errorMessage = 'Upload server endpoint (/api/upload) not found.';
        } else if (status >= 500) {
          errorMessage = 'Storage server encountered an internal error. Please try again.';
        }

        if (rawText) {
          try {
            const parsedErr = JSON.parse(rawText);
            if (parsedErr.message) errorMessage = parsedErr.message;
            else if (parsedErr.error) errorMessage = parsedErr.error;
          } catch {
            if (rawText.length < 200 && !rawText.startsWith('<')) {
              errorMessage = rawText;
            }
          }
        }

        resolve({
          success: false,
          url: '',
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          error: errorMessage
        });
        return;
      }

      // 2. Handle empty response
      if (!rawText) {
        resolve({
          success: false,
          url: '',
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          error: 'Empty response received from storage server.'
        });
        return;
      }

      // 3. Handle unexpected HTML responses (e.g. login redirect, proxy error)
      if (rawText.startsWith('<!DOCTYPE') || rawText.startsWith('<html') || rawText.startsWith('<head')) {
        resolve({
          success: false,
          url: '',
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          error: 'Server returned an HTML page instead of upload response. Please check your session.'
        });
        return;
      }

      // 4. Parse JSON or handle raw URL string
      let parsed: any = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // If it's a plain string URL returned directly
        if (rawText.startsWith('http://') || rawText.startsWith('https://') || rawText.startsWith('/uploads/')) {
          onProgress?.(100);
          resolve({
            success: true,
            url: rawText,
            filename: processedFile.name,
            size: processedFile.size,
            mimeType: processedFile.type
          });
          return;
        }

        resolve({
          success: false,
          url: '',
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          error: `Malformed server response: ${rawText.slice(0, 100)}`
        });
        return;
      }

      // 5. Handle parsed string primitive
      if (typeof parsed === 'string') {
        if (parsed.startsWith('http://') || parsed.startsWith('https://') || parsed.startsWith('/uploads/')) {
          onProgress?.(100);
          resolve({
            success: true,
            url: parsed,
            filename: processedFile.name,
            size: processedFile.size,
            mimeType: processedFile.type
          });
          return;
        }
      }

      // 6. Handle standard JSON response object
      if (parsed && typeof parsed === 'object') {
        const fileUrl = parsed.url || parsed.path || parsed.fileUrl || parsed.data?.url;
        if (parsed.success !== false && fileUrl) {
          onProgress?.(100);
          resolve({
            success: true,
            url: fileUrl,
            filename: parsed.filename || processedFile.name,
            size: parsed.size || processedFile.size,
            mimeType: parsed.mimetype || processedFile.type
          });
          return;
        }

        const failMessage = parsed.message || parsed.error || 'Server indicated upload failure.';
        resolve({
          success: false,
          url: '',
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          error: failMessage
        });
        return;
      }

      resolve({
        success: false,
        url: '',
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        error: 'Invalid response structure from storage server.'
      });
    };

    xhr.open('POST', `/api/upload?folder=${encodeURIComponent(folder)}`, true);
    xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    xhr.send(formData);
  });
}

/**
 * Helper to safely delete or clean up an uploaded media file
 */
export async function deleteMediaFile(fileUrl: string): Promise<boolean> {
  if (!fileUrl) return true;
  if (!fileUrl.startsWith('/uploads/')) return true; // Only delete local uploads
  try {
    const res = await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: fileUrl })
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.warn('Failed to delete media file:', err);
    return false;
  }
}
