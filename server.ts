import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { 
  getSavedGA4Config, 
  saveGA4Config, 
  testGA4Connection, 
  fetchGA4DashboardData, 
  fetchGA4RealtimeData 
} from './src/lib/ga4Backend';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON and urlencoded
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure public upload directories exist
const UPLOADS_BASE = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_BASE)) {
  fs.mkdirSync(UPLOADS_BASE, { recursive: true });
}

// Multer storage engine
const storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const rawFolder = req.body?.folder || req.query?.folder || 'general';
    // Allow subfolders like gallery/thumbnails safely while preventing directory traversal
    const cleanFolder = String(rawFolder)
      .replace(/\\/g, '/')
      .replace(/\.\./g, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-zA-Z0-9_\-\/]/g, '') || 'general';
    (file as any).targetSubfolder = cleanFolder;
    const targetDir = path.join(UPLOADS_BASE, cleanFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    cb(null, `${timestamp}_${randomSuffix}_${cleanBaseName}${ext}`);
  }
});

const upload = multer({
  storage: storageEngine,
  limits: {
    fileSize: 100 * 1024 * 1024 // Multer limit; frontend enforces 15MB for thumbnails/images
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      // Also allow common file extensions
      const ext = path.extname(file.originalname).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4', '.webm', '.mov'].includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Please upload a JPG, PNG or WEBP image.'));
      }
    }
  }
});

// Explicitly serve static uploads route
app.use('/uploads', express.static(UPLOADS_BASE, {
  maxAge: '1d',
  immutable: false
}));

// Route fallback for /uploads/:folder/:filename and /uploads/:filename
app.get('/uploads/:folder/:filename', (req, res, next) => {
  const filePath = path.join(UPLOADS_BASE, req.params.folder, req.params.filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  next();
});

app.get('/uploads/:filename', (req, res, next) => {
  const filePath = path.join(UPLOADS_BASE, req.params.filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  // Try subfolders
  const subdirs = ['general', 'gallery', 'gallery/thumbnails', 'videos', 'before_after', 'reviews', 'blog', 'pages', 'services', 'offers', 'trust', 'brands', 'models'];
  for (const dir of subdirs) {
    const candidate = path.join(UPLOADS_BASE, dir, req.params.filename);
    if (fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }
  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Metadata extraction endpoint
app.post('/api/metadata', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const trimmedUrl = url.trim();
    let platform = 'unknown';
    let thumbnailUrl = null;

    // 1. YouTube
    const ytMatch = trimmedUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      platform = 'youtube';
      thumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
      return res.json({ success: true, platform, thumbnailUrl });
    }

    // 2. Facebook or Instagram
    const isFb = /(?:facebook\.com|fb\.watch|fb\.com)/i.test(trimmedUrl);
    const isIg = /instagram\.com/i.test(trimmedUrl);

    if (isFb || isIg) {
      platform = isFb ? 'facebook' : 'instagram';
      try {
        const uas = [
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "WhatsApp/2.21.11.17 A"
        ];
        
        for (const ua of uas) {
          const fetchRes = await fetch(trimmedUrl, {
            headers: {
              "User-Agent": ua,
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9"
            },
            redirect: "follow",
            signal: AbortSignal.timeout(6000)
          });
          
          const html = await fetchRes.text();
          
          // Basic og:image search
          const ogImageMatch = html.match(/<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i)
            || html.match(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i);
            
          if (ogImageMatch && ogImageMatch[1]) {
            thumbnailUrl = ogImageMatch[1].replace(/&amp;/g, '&');
            return res.json({ success: true, platform, thumbnailUrl });
          }

          // FB specific JSON thumbnail keys
          if (isFb) {
             const fbcdn = html.match(/https:\\\/\\\/[^"'\s]+?(?:fbcdn\.net|fbsbx\.com)[^"'\s]+?/g) || html.match(/https:\/\/[^"'\s]+?(?:fbcdn\.net|fbsbx\.com)[^"'\s]+?/g) || [];
             if (fbcdn.length > 0) {
               const decoded = fbcdn.map(u => u.replace(/\\\//g, '/').replace(/\\u0026/g, '&'));
               const imageLike = decoded.filter(u => u.includes('.jpg') || u.includes('.png') || u.includes('.webp') || u.includes('/v/t') || u.includes('/p/'));
               if (imageLike.length > 0) {
                 thumbnailUrl = imageLike[0];
                 return res.json({ success: true, platform, thumbnailUrl });
               }
             }
             
             const thumbnailUri = html.match(/"(preferred_thumbnail|video_preview_image|thumbnailUrl|preview_image|story_thumbnail)"\s*:\s*"([^"]+)"/i);
             if (thumbnailUri && thumbnailUri[2]) {
                thumbnailUrl = thumbnailUri[2].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
                return res.json({ success: true, platform, thumbnailUrl });
             }

             const imageObjUri = html.match(/"image"\s*:\s*\{\s*"uri"\s*:\s*"([^"]+)"/i);
             if (imageObjUri && imageObjUri[1]) {
                thumbnailUrl = imageObjUri[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
                return res.json({ success: true, platform, thumbnailUrl });
             }
          }
        }
        
      } catch (e) {
        console.error(`Metadata extraction failed for ${trimmedUrl}`, e);
      }
    }

    return res.json({ success: false, platform, thumbnailUrl: null });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Extraction failed' });
  }
});


// Real Media Upload Endpoint
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE' 
        ? 'Image size must be 15 MB or less.' 
        : `Upload error: ${err.message}`;
      return res.status(400).json({ 
        success: false, 
        message: msg, 
        error: msg 
      });
    } else if (err) {
      const msg = err.message || 'Upload failed';
      return res.status(400).json({ 
        success: false, 
        message: msg, 
        error: msg 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file received in upload request.', 
        error: 'No file received in upload request.' 
      });
    }

    const folder = (req.file as any).targetSubfolder || 'general';
    const publicPath = `/uploads/${folder}/${req.file.filename}`;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host');
    const fullUrl = host ? `${protocol}://${host}${publicPath}` : publicPath;

    return res.status(200).json({
      success: true,
      url: publicPath,
      fullUrl: fullUrl,
      path: publicPath,
      message: 'Upload successful',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

// Media Library list endpoint
// Delete Media Endpoint
app.post('/api/delete', (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
      return res.status(400).json({ success: false, error: 'Invalid URL' });
    }
    
    // Security: prevent directory traversal
    const normalizedUrl = path.normalize(url).replace(/^\\/, '/');
    if (normalizedUrl.includes('..')) {
      return res.status(400).json({ success: false, error: 'Invalid URL path' });
    }

    const relativePath = normalizedUrl.replace(/^\/uploads\//, '');
    const filePath = path.join(UPLOADS_BASE, relativePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/media-library', (req, res) => {
  try {
    const results: Array<{ name: string; url: string; folder: string; size: number; modified: string }> = [];
    
    function scanDir(dir: string, folderName: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath, entry.name);
        } else if (entry.isFile() && !entry.name.startsWith('.')) {
          const stats = fs.statSync(fullPath);
          results.push({
            name: entry.name,
            url: `/uploads/${folderName}/${entry.name}`,
            folder: folderName,
            size: stats.size,
            modified: stats.mtime.toISOString()
          });
        }
      }
    }

    if (fs.existsSync(UPLOADS_BASE)) {
      const subdirs = fs.readdirSync(UPLOADS_BASE, { withFileTypes: true });
      for (const sub of subdirs) {
        if (sub.isDirectory()) {
          scanDir(path.join(UPLOADS_BASE, sub.name), sub.name);
        }
      }
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
    res.json({ success: true, files: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to scan media' });
  }
});

// GA4 Analytics Endpoints
app.get('/api/analytics/status', (req, res) => {
  try {
    const config = getSavedGA4Config();
    res.json({
      success: true,
      measurementId: config.measurementId || 'G-2TK1E36EP9',
      propertyId: config.propertyId || '',
      hasClientEmail: !!config.clientEmail,
      hasPrivateKey: !!config.privateKey,
      clientEmail: config.clientEmail ? `${config.clientEmail.substring(0, 8)}...` : '',
      isFullyConfigured: !!(config.propertyId && config.clientEmail && config.privateKey),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to check GA4 status' });
  }
});

app.post('/api/analytics/config', (req, res) => {
  try {
    const { measurementId, propertyId, clientEmail, privateKey } = req.body || {};
    saveGA4Config({ measurementId, propertyId, clientEmail, privateKey });
    res.json({ success: true, message: 'GA4 configuration saved successfully server-side.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to save GA4 config' });
  }
});

app.post('/api/analytics/test-connection', async (req, res) => {
  try {
    const result = await testGA4Connection();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Connection test failed' });
  }
});

app.post('/api/analytics/report', async (req, res) => {
  try {
    const { dateRangeKey, startDate, endDate, filters } = req.body || {};
    const reportData = await fetchGA4DashboardData({ dateRangeKey, startDate, endDate, filters });
    res.json(reportData);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to fetch GA4 report' });
  }
});

app.post('/api/analytics/realtime', async (req, res) => {
  try {
    const realtimeData = await fetchGA4RealtimeData();
    res.json(realtimeData);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to fetch realtime data' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mobo Savior Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
