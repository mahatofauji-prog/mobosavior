import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadMediaFile } from '../../lib/storageUpload';
import { Page, PageSection } from '../../types';
import { 
  Plus, Edit, Trash2, Save, X, Eye, FileText, MoveUp, MoveDown, HelpCircle, 
  Settings, Globe, Loader2, Sparkles, Image as ImageIcon, Video, ToggleLeft, Layers 
} from 'lucide-react';
import ImageUploader from './ImageUploader';

interface AdminPagesProps {
  onRefreshData?: () => void;
}

const SECTION_TYPES = [
  { value: 'heading', label: 'Heading' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'image', label: 'Image' },
  { value: 'list', label: 'Bullet List' },
  { value: 'button', label: 'Action Button / Link' },
  { value: 'video', label: 'YouTube Video' },
  { value: 'faq', label: 'FAQ Accordion Block' },
  { value: 'cta', label: 'Call To Action (CTA) Banner' }
];

export default function AdminPages({ onRefreshData }: AdminPagesProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editor Modal States
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Unpublished'>('Draft');
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [featuredImage, setFeaturedImage] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  
  // Page Sections
  const [sections, setSections] = useState<PageSection[]>([]);
  const [uploadingImageSecId, setUploadingImageSecId] = useState<string | null>(null);

  // Load pages
  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('pages')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchErr) {
        console.error('Error loading pages:', fetchErr);
      } else if (data) {
        setPages(data as Page[]);
      }
    } catch (err) {
      console.error('Error loading pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Set default slug based on title
  useEffect(() => {
    if (!editingPage && title) {
      setSlug(title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''));
    }
  }, [title, editingPage]);

  // Open editor for brand new page
  const handleCreateNew = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setStatus('Draft');
    setFeatured(false);
    setDisplayOrder(pages.length + 1);
    setFeaturedImage('');
    setSeoTitle('');
    setMetaDescription('');
    setOgImageUrl('');
    setSections([
      { id: 'sec-1', type: 'heading', content: 'New Page Heading', settings: { level: 'h2', align: 'center' } },
      { id: 'sec-2', type: 'paragraph', content: 'Add your custom page description paragraph here.' }
    ]);
    setError('');
    setSuccess('');
    setEditorOpen(true);
  };

  // Open editor to Edit page
  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setStatus(page.status || 'Draft');
    setFeatured(page.featured || false);
    setDisplayOrder(page.displayOrder || 0);
    setFeaturedImage(page.featuredImage || '');
    setSeoTitle(page.seoTitle || '');
    setMetaDescription(page.metaDescription || '');
    setOgImageUrl(page.ogImageUrl || '');
    setSections(page.sections || []);
    setError('');
    setSuccess('');
    setEditorOpen(true);
  };

  // Delete page
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this page?')) return;
    try {
      const { error: delErr } = await supabase.from('pages').delete().eq('id', id);
      if (delErr) throw delErr;
      setSuccess('Page deleted successfully!');
      fetchPages();
      if (onRefreshData) onRefreshData();
      alert('Page deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting page:', err);
      setError('Failed to delete page: ' + (err?.message || 'Database error'));
    }
  };

  // Handle section block addition
  const handleAddSection = (type: PageSection['type']) => {
    const newSec: PageSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      content: type === 'list' ? 'Bullet item 1\nBullet item 2' : `New ${type} content`,
      settings: type === 'heading' ? { level: 'h2', align: 'left' } : 
                type === 'faq' ? { faqList: [{ question: 'Question 1', answer: 'Answer 1' }] } : 
                type === 'cta' ? { ctaText: 'Contact Saddam Bhai on WhatsApp for a quick estimate!' } : {}
    };
    setSections([...sections, newSec]);
  };

  // Remove section block
  const handleRemoveSection = (secId: string) => {
    setSections(sections.filter(s => s.id !== secId));
  };

  // Move section block Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = temp;
    setSections(copy);
  };

  // Move section block Down
  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = temp;
    setSections(copy);
  };

  // Update specific section property
  const handleUpdateSectionContent = (secId: string, val: string) => {
    setSections(sections.map(s => s.id === secId ? { ...s, content: val } : s));
  };

  const handleUpdateSectionSettings = (secId: string, settingsUpdate: Partial<PageSection['settings']>) => {
    setSections(sections.map(s => s.id === secId ? { ...s, settings: { ...s.settings, ...settingsUpdate } } : s));
  };

  // File uploading inside blocks
  const handleSectionImageUpload = async (secId: string, file: File) => {
    setUploadingImageSecId(secId);
    try {
      const res = await uploadMediaFile(file, { folder: 'pages' });
      if (!res.success || !res.url) {
        throw new Error(res.error || 'Upload failed');
      }
      
      setSections(sections.map(s => s.id === secId ? { 
        ...s, 
        content: res.url,
        settings: { ...s.settings, imageUrl: res.url } 
      } : s));
      
      setSuccess('Image uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Image upload failed.');
    } finally {
      setUploadingImageSecId(null);
    }
  };

  // Featured image upload for the whole page
  const handleFeaturedImageUpload = async (file: File) => {
    setSaveLoading(true);
    try {
      const res = await uploadMediaFile(file, { folder: 'pages' });
      if (!res.success || !res.url) {
        throw new Error(res.error || 'Upload failed');
      }
      setFeaturedImage(res.url);
      setSuccess('Featured Image uploaded!');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Upload failed.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Submit whole page save to Supabase
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      setError('Title and Slug are required.');
      return;
    }
    
    // Check if slug is duplicated
    const dup = pages.find(p => p.slug === slug && (!editingPage || p.id !== editingPage.id));
    if (dup) {
      setError('The URL slug already exists. Please choose a unique slug.');
      return;
    }

    setSaveLoading(true);
    setError('');
    setSuccess('');

    const pageId = editingPage?.id || `page-${slug}`;
    const pagePayload: any = {
      id: pageId,
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9\-]+/g, '-'),
      sections,
      featuredImage: featuredImage || null,
      featured_image: featuredImage || null,
      seoTitle: seoTitle || null,
      seo_title: seoTitle || null,
      metaDescription: metaDescription || null,
      meta_description: metaDescription || null,
      ogImageUrl: ogImageUrl || featuredImage || null,
      og_image_url: ogImageUrl || featuredImage || null,
      displayOrder: Number(displayOrder) || 0,
      display_order: Number(displayOrder) || 0,
      featured: !!featured,
      status,
      createdAt: editingPage?.createdAt || new Date().toISOString(),
      created_at: editingPage?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { error: upsertErr } = await supabase.from('pages').upsert(pagePayload);
      if (upsertErr) {
        console.error('[Supabase Page Save Error]:', upsertErr);
        throw upsertErr;
      }

      setSuccess('Page saved successfully!');
      setEditorOpen(false);
      await fetchPages();
      if (onRefreshData) onRefreshData();
      alert('Page saved successfully!');
    } catch (err: any) {
      console.error('Error saving page:', err);
      setError('Failed to save page to database: ' + (err?.message || 'Database error'));
      alert('Failed to save page: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alert Banners */}
      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
          ✕ {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 flex items-center gap-2">
          ✓ {success}
        </div>
      )}

      {/* Pages Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0284C7]" /> Page Management
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Create completely custom static or rich information landing pages dynamically.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Create Custom Page
        </button>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 select-none text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#0284C7]" />
          <p className="text-xs font-medium">Loading pages library...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6 space-y-2">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700">No Custom Pages Yet</h4>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">Create beautiful, dynamic, custom pages like offers or tutorials for Saddam Bhai's lab.</p>
          <button
            onClick={handleCreateNew}
            className="px-3.5 py-1.5 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0284C7] text-xs font-black rounded-lg transition-colors"
          >
            Create Your First Page
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-150 rounded-xl bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Page Details</th>
                <th className="px-5 py-3">Public URL Slug</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-400">
                    #{p.displayOrder}
                  </td>
                  <td className="px-5 py-3.5 space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      {p.title}
                      {p.featured && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-black uppercase">Featured</span>
                      )}
                    </div>
                    {p.featuredImage && (
                      <div className="text-[10px] text-sky-600 truncate max-w-xs font-medium">📷 Banner Attached</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-sans font-bold text-[#0284C7]">
                    /{p.slug}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      p.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 
                      p.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`/#/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-[#0284C7] bg-slate-100 hover:bg-sky-50 rounded-lg transition-colors"
                        title="View Live Page"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Page Blocks"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Overlay Panel */}
      {editorOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black tracking-tight uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  {editingPage ? `Edit Custom Page: ${editingPage.title}` : 'Create Brand New Page'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Build responsive layout sections with dynamic elements.</p>
              </div>
              <button onClick={() => setEditorOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Main Form */}
            <form onSubmit={handleSavePage} className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Metadata Setting */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-200 pb-1.5">Page Properties</span>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Page Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., iPhone 15 Repair Purulia"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">URL Slug</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., iphone-15-repair"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]+/g, '-'))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Publish Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] font-bold"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Unpublished">Unpublished</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Display Order</label>
                      <input
                        type="number"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="page-featured"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#0284C7]"
                    />
                    <label htmlFor="page-featured" className="text-xs font-bold text-slate-700 select-none">Mark as Featured Landing</label>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <ImageUploader
                    label="Page Banner Image"
                    value={featuredImage}
                    onChange={(url) => setFeaturedImage(url)}
                    folder="pages"
                    helperText="Upload custom banner image or use image URL"
                  />
                </div>

                {/* SEO Sub-form */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-200 pb-1.5">SEO & Meta (Optional)</span>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">SEO Title Tag</label>
                    <input
                      type="text"
                      placeholder="Fallback will be Title"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Meta Description</label>
                    <textarea
                      placeholder="Snippet for Google search results..."
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      rows={2}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Page Content Sections Blocks builder */}
              <div className="lg:col-span-8 space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Page Layout Content Blocks</span>
                  
                  {/* Action Dropdown of types */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {SECTION_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleAddSection(type.value as any)}
                        className="px-2 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-150 text-[#0284C7] text-[10px] font-black rounded-lg transition-colors flex items-center gap-1"
                      >
                        + {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blocks Container */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {sections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 text-slate-400 text-xs font-bold">
                      Your page is empty. Click "+ Heading" or "+ Paragraph" above to design.
                    </div>
                  ) : (
                    sections.map((sec, index) => (
                      <div key={sec.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 relative group">
                        
                        {/* Block Header Toolbar */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                          <span className="text-[10px] font-extrabold text-[#0284C7] uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                            Block {index + 1}: {sec.type.toUpperCase()}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === sections.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSection(sec.id)}
                              className="p-1 text-slate-400 hover:text-red-600 ml-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Block Editors according to type */}
                        {sec.type === 'heading' && (
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-8 space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Heading Text</label>
                              <input
                                type="text"
                                value={sec.content}
                                onChange={(e) => handleUpdateSectionContent(sec.id, e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Size</label>
                              <select
                                value={sec.settings?.level || 'h2'}
                                onChange={(e) => handleUpdateSectionSettings(sec.id, { level: e.target.value as any })}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              >
                                <option value="h1">Display (H1)</option>
                                <option value="h2">Section (H2)</option>
                                <option value="h3">Sub-title (H3)</option>
                                <option value="h4">Mini (H4)</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Align</label>
                              <select
                                value={sec.settings?.align || 'left'}
                                onChange={(e) => handleUpdateSectionSettings(sec.id, { align: e.target.value as any })}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {sec.type === 'paragraph' && (
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Paragraph Content</label>
                            <textarea
                              value={sec.content}
                              onChange={(e) => handleUpdateSectionContent(sec.id, e.target.value)}
                              rows={4}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                              placeholder="Write paragraph content here..."
                            />
                          </div>
                        )}

                        {sec.type === 'image' && (
                          <div className="space-y-3">
                            <ImageUploader
                              label="Section Image Block"
                              value={sec.content}
                              onChange={(url) => handleUpdateSectionContent(sec.id, url)}
                              folder="pages"
                              helperText="Upload image or specify external image URL"
                            />
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Image Alt Text (SEO)</label>
                              <input
                                type="text"
                                placeholder="Describe the photo"
                                value={sec.settings?.imageAlt || ''}
                                onChange={(e) => handleUpdateSectionSettings(sec.id, { imageAlt: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {sec.type === 'list' && (
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">List Items (One item per line)</label>
                            <textarea
                              value={sec.content}
                              onChange={(e) => handleUpdateSectionContent(sec.id, e.target.value)}
                              rows={3}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                              placeholder="Point A&#10;Point B&#10;Point C"
                            />
                          </div>
                        )}

                        {sec.type === 'button' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Button Label</label>
                              <input
                                type="text"
                                placeholder="e.g., Get Estimation Now"
                                value={sec.content}
                                onChange={(e) => handleUpdateSectionContent(sec.id, e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Destination Link / Route Slug</label>
                              <input
                                type="text"
                                placeholder="e.g., contact or https://..."
                                value={sec.settings?.linkUrl || ''}
                                onChange={(e) => handleUpdateSectionSettings(sec.id, { linkUrl: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {sec.type === 'video' && (
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">YouTube Video URL</label>
                            <input
                              type="text"
                              placeholder="e.g., https://www.youtube.com/watch?v=XXXXXXXX"
                              value={sec.content}
                              onChange={(e) => handleUpdateSectionContent(sec.id, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                            />
                          </div>
                        )}

                        {sec.type === 'faq' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">FAQ Questions & Answers</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentFaq = sec.settings?.faqList || [];
                                  handleUpdateSectionSettings(sec.id, { faqList: [...currentFaq, { question: 'New Question', answer: 'New Answer' }] });
                                }}
                                className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold rounded"
                              >
                                + Add Q&A Item
                              </button>
                            </div>
                            <div className="space-y-2">
                              {(sec.settings?.faqList || []).map((faq, idx) => (
                                <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-250/50 space-y-2 relative">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filtered = (sec.settings?.faqList || []).filter((_, fIdx) => fIdx !== idx);
                                      handleUpdateSectionSettings(sec.id, { faqList: filtered });
                                    }}
                                    className="absolute right-1.5 top-1 text-slate-300 hover:text-red-500 text-[10px]"
                                  >
                                    ✕
                                  </button>
                                  <input
                                    type="text"
                                    value={faq.question}
                                    placeholder="Question"
                                    onChange={(e) => {
                                      const updated = [...(sec.settings?.faqList || [])];
                                      updated[idx].question = e.target.value;
                                      handleUpdateSectionSettings(sec.id, { faqList: updated });
                                    }}
                                    className="w-full px-2 py-0.5 border border-slate-200 rounded text-xs font-bold"
                                  />
                                  <textarea
                                    value={faq.answer}
                                    placeholder="Answer"
                                    onChange={(e) => {
                                      const updated = [...(sec.settings?.faqList || [])];
                                      updated[idx].answer = e.target.value;
                                      handleUpdateSectionSettings(sec.id, { faqList: updated });
                                    }}
                                    rows={1.5}
                                    className="w-full px-2 py-0.5 border border-slate-200 rounded text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {sec.type === 'cta' && (
                          <div className="grid grid-cols-1 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Banner Headline</label>
                              <input
                                type="text"
                                value={sec.content}
                                onChange={(e) => handleUpdateSectionContent(sec.id, e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Secondary Sub-text</label>
                              <textarea
                                value={sec.settings?.ctaText || ''}
                                onChange={(e) => handleUpdateSectionSettings(sec.id, { ctaText: e.target.value })}
                                rows={1.5}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                        )}

                      </div>
                    ))
                  )}
                </div>

              </div>

            </form>

            {/* Modal Actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePage}
                disabled={saveLoading}
                className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save & Compile Page
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
