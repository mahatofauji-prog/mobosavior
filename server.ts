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
    const folder = String(rawFolder).replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    (file as any).targetSubfolder = folder;
    const targetDir = path.join(UPLOADS_BASE, folder);
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
    fileSize: 100 * 1024 * 1024 // 100MB limit for repair videos and high-res mobile photos
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
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
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
  const subdirs = ['general', 'gallery', 'videos', 'before_after', 'reviews', 'blog', 'pages', 'services', 'offers', 'trust', 'brands', 'models'];
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

// Real Media Upload Endpoint
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File exceeds 100MB limit.' });
      }
      return res.status(400).json({ success: false, error: `Multer upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message || 'File upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file received in upload request.' });
    }

    const folder = (req.file as any).targetSubfolder || 'general';
    const publicUrl = `/uploads/${folder}/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

// Media Library list endpoint
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
