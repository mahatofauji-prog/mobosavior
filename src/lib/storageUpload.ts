

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
      const rawText = (xhr.responseText || '').trim();
      const status = xhr.status;

      // 1. Handle HTTP error status codes (e.g. 400, 401, 403, 404, 413, 500)
      if (status < 200 || status >= 300) {
        let errorMessage = `Upload failed with status ${status}.`;
        if (status === 401 || status === 403) {
          errorMessage = 'Authentication failed. Please ensure you are logged in as an administrator.';
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

    // 5 minutes timeout for uploads
    xhr.timeout = 300000;
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
