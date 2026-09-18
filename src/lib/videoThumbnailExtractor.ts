/**
 * Client-Side Video Frame & Thumbnail Extractor Engine
 * Uses HTML5 <video> and <canvas> to capture high-resolution video frames
 * from both local File objects and remote video URLs.
 */

export interface ExtractedFrame {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  duration: number;
}

/**
 * Extracts a frame from a local video File at a given timestamp (default 1.0s)
 */
export async function extractFrameFromVideoFile(
  file: File,
  seekTime: number = 1.0,
  maxDimension: number = 1280,
  quality: number = 0.85
): Promise<ExtractedFrame> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const result = await extractFrameFromVideoUrl(objectUrl, seekTime, maxDimension, quality);
    return result;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Extracts a frame from a video URL (blob:, http:, or data:) at a given timestamp
 */
export function extractFrameFromVideoUrl(
  videoUrl: string,
  seekTime: number = 1.0,
  maxDimension: number = 1280,
  quality: number = 0.85
): Promise<ExtractedFrame> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = videoUrl;

    let hasSought = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    // Safety timeout after 10s
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Video thumbnail extraction timed out.'));
    }, 10000);

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      // Seek to valid position (clamped within video duration)
      const targetTime = Math.min(Math.max(0.1, seekTime), Math.max(0.1, duration - 0.1));
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      if (hasSought) return;
      hasSought = true;

      try {
        const nativeWidth = video.videoWidth || 640;
        const nativeHeight = video.videoHeight || 360;

        let renderWidth = nativeWidth;
        let renderHeight = nativeHeight;

        if (renderWidth > maxDimension || renderHeight > maxDimension) {
          if (renderWidth > renderHeight) {
            renderHeight = Math.round((renderHeight * maxDimension) / renderWidth);
            renderWidth = maxDimension;
          } else {
            renderWidth = Math.round((renderWidth * maxDimension) / renderHeight);
            renderHeight = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          cleanup();
          reject(new Error('Canvas 2D context not available.'));
          return;
        }

        ctx.drawImage(video, 0, 0, renderWidth, renderHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              cleanup();
              reject(new Error('Failed to create thumbnail blob from canvas.'));
              return;
            }

            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            cleanup();
            resolve({
              dataUrl,
              blob,
              width: renderWidth,
              height: renderHeight,
              duration: video.duration || 0
            });
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video for thumbnail extraction.'));
    };
  });
}

/**
 * Converts a Blob to a standard File object for uploading
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}
