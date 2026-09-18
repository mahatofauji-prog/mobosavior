
import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

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
 * Performs actual media upload with real progress tracking and compression using Firebase Storage
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

  // 3. Upload to Firebase Storage
  return new Promise((resolve) => {
    try {
      const storageRef = ref(storage, uniquePath);
      const uploadTask = uploadBytesResumable(storageRef, processedFile, {
        contentType: processedFile.type,
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Firebase Storage Upload Error:', error);
          resolve({
            success: false,
            url: '',
            filename: file.name,
            size: file.size,
            mimeType: file.type,
            error: error.message || 'Upload to Firebase Storage failed.',
          });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({
              success: true,
              url: downloadURL,
              filename: processedFile.name,
              size: processedFile.size,
              mimeType: processedFile.type,
            });
          } catch (urlError: any) {
            console.error('Error getting download URL:', urlError);
            resolve({
              success: false,
              url: '',
              filename: file.name,
              size: file.size,
              mimeType: file.type,
              error: urlError.message || 'Could not retrieve download URL after upload.',
            });
          }
        }
      );
    } catch (err: any) {
      console.error('Upload initiation error:', err);
      resolve({
        success: false,
        url: '',
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        error: err.message || 'Failed to start upload process.',
      });
    }
  });
}

/**
 * Helper to safely delete or clean up an uploaded media file from Firebase Storage
 */
export async function deleteMediaFile(fileUrl: string): Promise<boolean> {
  if (!fileUrl) return true;
  // If it's a firebase storage URL, delete it
  if (fileUrl.includes('firebasestorage.googleapis.com')) {
    try {
      const storageRef = ref(storage, fileUrl);
      await deleteObject(storageRef);
      return true;
    } catch (err) {
      console.warn('Failed to delete media file from Firebase Storage:', err);
      return false;
    }
  }
  // Ignore local uploads if any remain
  return true;
}
