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

/**
 * Generates an automatic branded, high-res 1280x720 video cover poster
 * when the platform restricts thumbnail scraping.
 */
export async function generateBrandedVideoPoster(
  title: string = 'Repair Video',
  platform: string = 'video',
  category: string = 'Micro-Soldering'
): Promise<ExtractedFrame> {
  const width = 1280;
  const height = 720;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // 1. Background Gradient based on platform
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  if (platform === 'instagram') {
    bgGradient.addColorStop(0, '#2e0854');
    bgGradient.addColorStop(0.5, '#4a0e4e');
    bgGradient.addColorStop(1, '#833ab4');
  } else if (platform === 'facebook') {
    bgGradient.addColorStop(0, '#0a192f');
    bgGradient.addColorStop(0.6, '#1877f2');
    bgGradient.addColorStop(1, '#0d47a1');
  } else if (platform === 'youtube') {
    bgGradient.addColorStop(0, '#1a0000');
    bgGradient.addColorStop(0.7, '#cc0000');
    bgGradient.addColorStop(1, '#282828');
  } else {
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(0.5, '#0369a1');
    bgGradient.addColorStop(1, '#0284c7');
  }

  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Tech Grid Pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Dark vignette overlay
  const vignette = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 600);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // 4. Large Play Icon Circle in Center
  const centerX = width / 2;
  const centerY = height / 2 - 30;
  const radius = 60;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Triangle inside circle
  ctx.beginPath();
  ctx.moveTo(centerX - 15, centerY - 25);
  ctx.lineTo(centerX + 25, centerY);
  ctx.lineTo(centerX - 15, centerY + 25);
  ctx.closePath();
  ctx.fillStyle = '#0284c7';
  ctx.fill();

  // 5. Header / Brand
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('MOBO SAVIOR • LAB REPAIR DEMONSTRATION', 80, 80);

  // 6. Platform Pill
  const platformLabel = platform.toUpperCase();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(width - 240, 50, 160, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(platformLabel, width - 160, 76);
  ctx.textAlign = 'left';

  // 7. Video Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const displayTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
  ctx.fillText(displayTitle, 80, height - 100);

  // 8. Category Tag
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Category: ${category}`, 80, height - 60);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate poster blob'));
        return;
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve({
        dataUrl,
        blob,
        width,
        height,
        duration: 0
      });
    }, 'image/jpeg', 0.9);
  });
}

