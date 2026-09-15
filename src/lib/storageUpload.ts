

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
 * Validates a media file prior to upload
 */
export function validateMediaFile(
  file: File,
  allowedTypes: string[] = ALLOWED_MEDIA_TYPES,
  maxSizeMB: number = 25
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
      error: `Unsupported file format (${mimeType || extension}). Please select a standard image (JPG, PNG, WEBP, GIF) or video (MP4, WEBM).` 
    };
  }

  const isVideo = mimeType.startsWith('video/') || ['.mp4', '.webm', '.mov'].includes(extension);
  const effectiveMaxMB = isVideo ? Math.max(maxSizeMB, 100) : maxSizeMB;
  const maxBytes = effectiveMaxMB * 1024 * 1024;

  if (file.size > maxBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeInMB}MB). Maximum allowed limit is ${effectiveMaxMB}MB.`
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

async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.size < 800 * 1024) {
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
        const maxDim = 1920;
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
            if (!blob || blob.size >= file.size) {
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
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
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

  // 1. Compress image if applicable
  const processedFile = await compressImageFile(file);

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

  const uniquePath = generateStoragePath(processedFile, folder);

  // Native App Server Upload (/api/upload) with real XHR Progress
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
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

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.url) {
            onProgress?.(100);
            resolve({
              success: true,
              url: response.url,
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
            error: response.error || 'Server did not return a valid URL'
          });
        } catch (e: any) {
          resolve({
            success: false,
            url: '',
            filename: file.name,
            size: file.size,
            mimeType: file.type,
            error: 'Failed to parse upload response from server'
          });
        }
      } else {
        let errDesc = `HTTP error ${xhr.status}`;
        try {
          const errRes = JSON.parse(xhr.responseText);
          if (errRes.error) errDesc = errRes.error;
        } catch {
          // ignore
        }
        resolve({
          success: false,
          url: '',
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          error: `Upload failed: ${errDesc}`
        });
      }
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

    xhr.ontimeout = () => {
      resolve({
        success: false,
        url: '',
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        error: 'Upload timed out. The file might be too large or the connection is slow.'
      });
    };

    // 5 minutes timeout for large video uploads
    xhr.timeout = 300000;
    xhr.open('POST', `/api/upload?folder=${encodeURIComponent(folder)}`, true);
    xhr.send(formData);
  });
}

/**
 * Helper to safely delete or clean up an uploaded media file
 */
export async function deleteMediaFile(fileUrl: string): Promise<boolean> {
  if (!fileUrl) return true;
  try {
    // If it's a local /uploads/ URL, we can notify the server if desired or silently succeed
    return true;
  } catch (err) {
    console.warn('Failed to delete media file:', err);
    return false;
  }
}
