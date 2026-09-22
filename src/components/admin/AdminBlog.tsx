import React, { useState, useEffect } from 'react';
import { supabase, safeUpsert } from '../../lib/supabase';
import { uploadMediaFile } from '../../lib/storageUpload';
import { BlogPost, BlogCategory } from '../../types';
import { 
  Plus, Edit, Trash2, Save, X, Eye, FileText, Calendar, User, Tag, 
  Settings, Loader2, Sparkles, Image as ImageIcon, Search, CheckSquare 
} from 'lucide-react';
import ImageUploader from './ImageUploader';

interface AdminBlogProps {
  onRefreshData?: () => void;
}

export default function AdminBlog({ onRefreshData }: AdminBlogProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [authorName, setAuthorName] = useState('Saddam Bhai');
  const [category, setCategory] = useState('Motherboard Repair');
  const [tagsInput, setTagsInput] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().substring(0, 10));
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Unpublished'>('Draft');
  const [displayOrder, setDisplayOrder] = useState(0);

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');

  // Dynamic Blog Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Load blogs & categories
  const fetchData = async () => {
    setLoading(true);
    try {
      // Load Posts
      const { data: postsData, error: postsErr } = await supabase
        .from('blog_posts')
        .select('*')
        .order('publish_date', { ascending: false });

      if (postsErr) {
        console.error('[Supabase Blog Posts fetch error]:', postsErr);
      } else if (postsData) {
        setPosts(postsData as BlogPost[]);
      }

      // Load Categories
      const { data: catsData, error: catsErr } = await supabase
        .from('blog_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (catsErr) {
        console.error('[Supabase Blog Cats fetch error]:', catsErr);
      } else if (catsData) {
        setCategories(catsData as BlogCategory[]);
        if (catsData.length > 0 && !category) {
          setCategory(catsData[0].name);
        }
      }
    } catch (err) {
      console.error('Error fetching blog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Slug generator
  useEffect(() => {
    if (!editingPost && title) {
      setSlug(title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''));
    }
  }, [title, editingPost]);

  // Create new post handler
  const handleCreateNew = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setContent('# Repair Summary\n\nExplain the logic board issue Saddam Bhai diagnosed...\n\n## Symptoms Checked\n\n* Short heat map under thermal camera\n* CPU reballing completed\n\n## Resolution Applied\n\nSolder elements micro repaired and device boots successfully!');
    setFeaturedImage('');
    setAuthorName('Saddam Bhai');
    setCategory(categories[0]?.name || 'Motherboard Repair');
    setTagsInput('motherboard, iphone, micro-soldering');
    setPublishDate(new Date().toISOString().substring(0, 10));
    setStatus('Draft');
    setDisplayOrder(posts.length + 1);
    setSeoTitle('');
    setMetaDescription('');
    setOgImageUrl('');
    setError('');
    setSuccess('');
    setEditorOpen(true);
  };

  // Edit post handler
  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content || '');
    setFeaturedImage(post.featuredImage || '');
    setAuthorName(post.authorName || 'Saddam Bhai');
    setCategory(post.category || 'Motherboard Repair');
    setTagsInput(post.tags ? post.tags.join(', ') : '');
    setPublishDate(post.publishDate || new Date().toISOString().substring(0, 10));
    setStatus(post.status || 'Draft');
    setDisplayOrder(post.displayOrder || 0);
    setSeoTitle(post.seoTitle || '');
    setMetaDescription(post.metaDescription || '');
    setOgImageUrl(post.ogImageUrl || '');
    setError('');
    setSuccess('');
    setEditorOpen(true);
  };

  // Delete post
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this blog post?')) return;
    try {
      const { error: delErr } = await supabase.from('blog_posts').delete().eq('id', id);
      if (delErr) throw delErr;
      setSuccess('Post deleted successfully!');
      fetchData();
      if (onRefreshData) onRefreshData();
      alert('Blog post deleted successfully.');
    } catch (err: any) {
      console.error(err);
      setError('Failed to delete blog post: ' + (err?.message || 'Database error'));
    }
  };

  // Category creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    
    try {
      const catId = `blogcat-${Date.now()}`;
      const payload: any = {
        id: catId,
        name: newCatName.trim(),
        slug: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        displayOrder: categories.length + 1,
        display_order: categories.length + 1
      };
      const { error: catErr } = await safeUpsert('blog_categories', payload);
      if (catErr) throw catErr;
      setNewCatName('');
      setCatModalOpen(false);
      setSuccess('Blog category added!');
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError('Failed to save category: ' + (err?.message || 'Database error'));
    }
  };

  // Upload image
  const handleImageUpload = async (file: File) => {
    setSaveLoading(true);
    try {
      const res = await uploadMediaFile(file, { folder: 'blog' });
      if (!res.success || !res.url) {
        throw new Error(res.error || 'Upload failed');
      }
      setFeaturedImage(res.url);
      setSuccess('Image uploaded!');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Image upload failed.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Submit whole post save
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      setError('Title, Slug, and content are required.');
      return;
    }

    const dup = posts.find(p => p.slug === slug && (!editingPost || p.id !== editingPost.id));
    if (dup) {
      setError('Slug is duplicated. Please use a unique URL slug.');
      return;
    }

    setSaveLoading(true);
    setError('');
    setSuccess('');

    const postId = editingPost?.id || `post-${slug}`;
    const parsedTags = tagsInput.split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const payload: any = {
      id: postId,
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9\-]+/g, '-'),
      content,
      featuredImage: featuredImage || null,
      featured_image: featuredImage || null,
      authorName,
      author_name: authorName,
      category,
      tags: parsedTags,
      publishDate,
      publish_date: publishDate,
      status,
      displayOrder: Number(displayOrder) || 0,
      display_order: Number(displayOrder) || 0,
      seoTitle: seoTitle || null,
      seo_title: seoTitle || null,
      metaDescription: metaDescription || null,
      meta_description: metaDescription || null,
      ogImageUrl: ogImageUrl || featuredImage || null,
      og_image_url: ogImageUrl || featuredImage || null,
      createdAt: editingPost?.createdAt || new Date().toISOString(),
      created_at: editingPost?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { error: upsertErr } = await safeUpsert('blog_posts', payload);
      if (upsertErr) {
        console.error('[Supabase Blog Post Save Error]:', upsertErr);
        throw upsertErr;
      }

      setSuccess('Blog post compiled and saved successfully!');
      setEditorOpen(false);
      await fetchData();
      if (onRefreshData) onRefreshData();
      alert('Blog post saved successfully!');
    } catch (err: any) {
      console.error('Error saving post:', err);
      setError('Failed to write blog post: ' + (err?.message || 'Database error'));
      alert('Failed to save blog post: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0284C7]" /> Repair Tips & Blog CMS
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Publish motherboard micro-soldering logs, Display troubleshooting secrets & repair guides.</p>
        </div>
        <div className="flex gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setCatModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Manage Categories
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 justify-center flex-grow sm:flex-grow-0"
          >
            <Plus className="w-4 h-4" /> Add Blog Post
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search articles in dashboard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-250 rounded-xl focus:outline-none focus:border-[#0284C7] font-bold"
          />
        </div>
      </div>

      {/* Blogs List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#0284C7]" />
          <p className="text-xs">Opening Saddam's journals...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6 space-y-1">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700">No blog posts found</h4>
          <p className="text-[11px] text-slate-400">Add detailed repair guides, green-line display fixes or diagnostic benchmarks.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-150 rounded-xl bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3">Publish Date</th>
                <th className="px-5 py-3">Article Details</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-sans font-bold text-slate-500 whitespace-nowrap">
                    {post.publishDate}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900 leading-tight">{post.title}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <User className="w-3 h-3 text-sky-500" /> {post.authorName || 'Saddam Bhai'}
                      <span className="text-slate-200">|</span>
                      <span className="font-mono text-sky-600">/blog/{post.slug}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-700">
                    {post.category}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      post.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 
                      post.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`/#/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-[#0284C7] bg-slate-100 hover:bg-sky-50 rounded-lg transition-colors"
                        title="View Article Live"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Article Content"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Post"
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

      {/* Editor Modal overlay */}
      {editorOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black tracking-tight uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  {editingPost ? 'Edit Blog Article' : 'Compose Blog Article'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Use Markdown-style blocks to write readable repair updates.</p>
              </div>
              <button onClick={() => setEditorOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Main Form */}
            <form onSubmit={handleSavePost} className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Settings Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-200 pb-1">Article Info</span>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Article Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 5 Signs of Motherboard Short Fault"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">URL Slug</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., motherboard-short-fault"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]+/g, '-'))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Author Name</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Publish Date</label>
                      <input
                        type="date"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Publish Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none font-bold"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Unpublished">Unpublished</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Display Order</label>
                      <input
                        type="number"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., motherboard, reballing, logic"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Featured Photo */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <ImageUploader
                    label="Featured Article Photo"
                    value={featuredImage}
                    onChange={(url) => setFeaturedImage(url)}
                    folder="blog"
                    helperText="Upload blog cover image or use image URL"
                  />
                </div>

                {/* SEO Metadata */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-200 pb-1">SEO Config</span>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">SEO Page Title</label>
                    <input
                      type="text"
                      placeholder="Custom Title tag..."
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Meta Description</label>
                    <textarea
                      placeholder="160 chars search preview description..."
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      rows={2}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Article Body Writer */}
              <div className="lg:col-span-8 flex flex-col space-y-2 h-full">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                    <FileText className="w-4 h-4 text-sky-500" /> Article Content (Markdown Supported)
                  </label>
                  
                  <div className="text-[10px] text-slate-400 font-bold">
                    Use **bold**, # Heading 1, ## Heading 2, or * Bullet lines.
                  </div>
                </div>

                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type article body in Markdown here..."
                  className="w-full flex-grow p-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-xs font-mono leading-relaxed"
                  style={{ minHeight: '400px' }}
                />
              </div>

            </form>

            {/* Modal Footer */}
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
                onClick={handleSavePost}
                disabled={saveLoading}
                className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Article
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase">Manage Blog Categories</h3>
              <button onClick={() => setCatModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateCategory} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="New Category Name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-grow px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg"
              >
                Create
              </button>
            </form>

            <div className="max-h-48 overflow-y-auto border border-slate-150 rounded-lg divide-y divide-slate-100">
              {categories.length === 0 ? (
                <p className="text-center py-4 text-[10px] text-slate-400 font-bold">No categories defined yet.</p>
              ) : (
                categories.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700">
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Delete category?')) {
                          await supabase.from('blog_categories').delete().eq('id', c.id);
                          fetchData();
                        }
                      }}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
