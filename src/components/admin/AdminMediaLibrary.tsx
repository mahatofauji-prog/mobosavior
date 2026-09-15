import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadMediaFile, deleteMediaFile } from '../../lib/storageUpload';
import { MediaItem } from '../../types';
import { Plus, Trash2, Loader2, Image as ImageIcon, Copy, Check, UploadCloud, Search } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../firebase/errors';

export default function AdminMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Drag-and-drop state
  const [dragActive, setDragActive] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'media_library'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetched: MediaItem[] = [];
      snapshot.forEach(docSnap => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as MediaItem);
      });
      setItems(fetched);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.GET, 'media_library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');

    const mediaId = `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    try {
      // 1. Upload to Storage
      const res = await uploadMediaFile(file, { folder: 'media' });
      if (!res.success || !res.url) {
        throw new Error(res.error || 'Upload failed');
      }

      // 2. Insert index record in Firestore
      const payload: MediaItem = {
        id: mediaId,
        name: file.name,
        url: res.url,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'media_library', mediaId), payload);
      setSuccess('Asset uploaded to media library!');
      fetchMedia();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  // Copy to clipboard helper
  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete asset
  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm('Are you sure you want to permanently delete this media asset? This might break pages referencing it.')) return;
    try {
      // 1. Delete asset file
      if (item.url) {
        await deleteMediaFile(item.url);
      }

      // 2. Delete index doc
      await deleteDoc(doc(db, 'media_library', item.id));
      setSuccess('Asset deleted!');
      fetchMedia();
    } catch (err) {
      console.error(err);
      setError('Failed to delete asset.');
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {error && <p className="p-3.5 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100">✕ {error}</p>}
      {success && <p className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">✓ {success}</p>}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#0284C7]" /> Media Library
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Upload device pictures, diagnostic receipts, or banner layouts. Copy their public URLs instantly.</p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        onDragEnter={handleDrag} 
        onDragOver={handleDrag} 
        onDragLeave={handleDrag} 
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive 
            ? 'border-[#0284C7] bg-[#E0F2FE]/30 scale-[0.99]' 
            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        {uploading ? (
          <div className="space-y-3.5 select-none py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#0284C7] mx-auto" />
            <p className="text-xs font-bold text-slate-500">Uploading file to lab storage...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
            <div>
              <p className="text-xs font-extrabold text-slate-700">Drag and drop files here, or click to browse</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Supports PNG, JPG, WEBP, MP4 (Max 15MB)</p>
            </div>
            
            <label className="inline-block px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors">
              Browse Local Assets
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0])}
              />
            </label>
          </div>
        )}
      </div>

      {/* Search and Library Grid */}
      <div className="space-y-4">
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search assets by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-white border border-slate-250 rounded-xl focus:outline-none focus:border-[#0284C7] font-bold"
          />
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0284C7]" />
            <p className="text-xs">Opening files locker...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-center py-12 text-xs text-slate-400 font-bold">No assets found in Media Library.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col group relative"
              >
                {/* Thumbnail Display */}
                <div className="aspect-square bg-slate-50 flex items-center justify-center relative overflow-hidden">
                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Copy overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(item)}
                      className="p-1.5 bg-white text-slate-800 rounded-lg hover:bg-slate-100 shadow transition-all"
                      title="Copy Public URL"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 shadow transition-all"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="p-2.5 border-t border-slate-100 space-y-0.5">
                  <div className="text-[10px] font-black text-slate-800 truncate" title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>{item.type}</span>
                    <span>{item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : ''}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
