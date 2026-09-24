import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { sanitizePayload } from '../../lib/dbSanitizer';
import { ServiceCategory, Service } from '../../types';
import { DEFAULT_CATEGORIES } from '../../data/modelsData';
import ImageUploader from './ImageUploader';
import { 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle, 
  Save, 
  Loader2, 
  RefreshCw,
  ExternalLink,
  Tag,
  CheckCircle2,
  Wrench,
  Image as ImageIcon
} from 'lucide-react';

interface AdminCategoriesProps {
  servicesList: Service[];
  onRefreshData?: () => void;
}

const PRESET_LAB_IMAGES = [
  { label: 'iPhone Repair', url: '/assets/images/service_iphone_repair_1788169632215.jpg' },
  { label: 'Android Repair', url: '/assets/images/slide_android_1788168049303.jpg' },
  { label: 'Micro-Soldering', url: '/assets/images/differ_micro_soldering_1788169185732.jpg' },
  { label: 'Foldable Repair', url: '/assets/images/service_foldable_repair_1788169709156.jpg' },
  { label: 'Display Replacement', url: '/assets/images/service_display_replace_1788169648346.jpg' },
  { label: 'Software / EDL', url: '/assets/images/service_dead_phone_1788169662887.jpg' },
  { label: 'Thermal Inspection', url: '/assets/images/differ_thermal_inspection_1788169210295.jpg' },
  { label: 'Battery Replacement', url: '/assets/images/service_battery_replace_1788169692807.jpg' },
];

export default function AdminCategories({ servicesList, onRefreshData }: AdminCategoriesProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    category?: ServiceCategory | null;
  }>({ open: false });

  // Form states for editing category
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLongDescription, setFormLongDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formActive, setFormActive] = useState(true);
  const [formProblems, setFormProblems] = useState<string[]>([]);
  const [newProblemInput, setNewProblemInput] = useState('');
  const [formServiceSlugs, setFormServiceSlugs] = useState<string[]>([]);
  const [savingCategory, setSavingCategory] = useState(false);

  // Fetch categories directly from Supabase
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories from Supabase:', error);
        setCategories(DEFAULT_CATEGORIES);
      } else if (data && data.length > 0) {
        const mapped: ServiceCategory[] = data.map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          longDescription: item.long_description || item.longDescription || item.description,
          imageUrl: item.image_url || item.imageUrl || PRESET_LAB_IMAGES[0].url,
          badge: item.badge || 'Specialized Hub',
          displayOrder: item.display_order ?? item.displayOrder ?? 1,
          active: item.is_active ?? item.active ?? true,
          problemsCovered: item.problems_covered || item.problemsCovered || [],
          serviceSlugs: item.service_slugs || item.serviceSlugs || []
        }));
        
        const combined = [...DEFAULT_CATEGORIES];
        mapped.forEach(m => {
          const idx = combined.findIndex(c => c.id === m.id || c.slug === m.slug || c.name?.toLowerCase() === m.name?.toLowerCase());
          if (idx >= 0) {
            combined[idx] = { ...combined[idx], ...m };
          } else {
            combined.push(m);
          }
        });
        setCategories(combined.sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1)));
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open Add/Edit Modal
  const handleOpenModal = (cat?: ServiceCategory) => {
    if (cat) {
      setCategoryModal({ open: true, category: cat });
      setFormName(cat.name || '');
      setFormSlug(cat.slug || '');
      setFormDescription(cat.description || '');
      setFormLongDescription(cat.longDescription || '');
      setFormImageUrl(cat.imageUrl || '');
      setFormBadge(cat.badge || '');
      setFormDisplayOrder(cat.displayOrder ?? 1);
      setFormActive(cat.active ?? true);
      setFormProblems(cat.problemsCovered ? [...cat.problemsCovered] : []);
      setFormServiceSlugs(cat.serviceSlugs ? [...cat.serviceSlugs] : []);
    } else {
      const nextOrder = categories.length > 0 ? Math.max(...categories.map(c => c.displayOrder || 0)) + 1 : 1;
      setCategoryModal({ open: true, category: null });
      setFormName('');
      setFormSlug('');
      setFormDescription('');
      setFormLongDescription('');
      setFormImageUrl(PRESET_LAB_IMAGES[0].url);
      setFormBadge('Specialized Hub');
      setFormDisplayOrder(nextOrder);
      setFormActive(true);
      setFormProblems([]);
      setFormServiceSlugs([]);
    }
    setNewProblemInput('');
  };

  // Add Problem Item to list
  const handleAddProblem = () => {
    const trimmed = newProblemInput.trim();
    if (trimmed && !formProblems.includes(trimmed)) {
      setFormProblems(prev => [...prev, trimmed]);
      setNewProblemInput('');
    }
  };

  // Remove Problem Item from list
  const handleRemoveProblem = (index: number) => {
    setFormProblems(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle Service in Category
  const handleToggleService = (slug: string) => {
    setFormServiceSlugs(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  // Save Category to Supabase
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingCategory) return;
    if (!formName.trim() || !formSlug.trim()) {
      alert('Please provide both category name and URL slug.');
      return;
    }

    setSavingCategory(true);
    try {
      const cleanSlug = formSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const id = categoryModal.category?.id || `cat-${cleanSlug}`;
      const displayOrderNum = Number(formDisplayOrder) || 1;
      const cleanImageUrl = formImageUrl.trim() || PRESET_LAB_IMAGES[0].url;

      const payload: any = {
        name: formName.trim(),
        slug: cleanSlug,
        description: formDescription.trim(),
        long_description: formLongDescription.trim() || formDescription.trim(),
        image_url: cleanImageUrl,
        badge: formBadge.trim() || 'Specialized Hub',
        display_order: displayOrderNum,
        problems_covered: formProblems,
        service_slugs: formServiceSlugs
      };

      const cleanPayload = sanitizePayload('categories', payload);
      let savedRecord: any = null;

      // Ensure id is always set in payload for upsert
      cleanPayload.id = id;

      // Real Supabase UPSERT to safely handle both existing and default preset records
      const { data: upsertRes, error: upsertErr } = await supabase
        .from('categories')
        .upsert(cleanPayload, { onConflict: 'id' })
        .select()
        .single();

      if (upsertErr) {
        console.error('[MOBO ADMIN SAVE ERROR - categories upsert]:', {
          table: 'categories',
          id,
          error: upsertErr
        });
        throw upsertErr;
      }
      savedRecord = upsertRes;

      // Update local state immediately with returned data
      const mappedSaved: ServiceCategory = {
        id: savedRecord.id || id,
        name: savedRecord.name || payload.name,
        slug: savedRecord.slug || payload.slug,
        description: savedRecord.description || payload.description,
        longDescription: savedRecord.long_description || savedRecord.longDescription || payload.longDescription,
        imageUrl: savedRecord.image_url || savedRecord.imageUrl || payload.imageUrl,
        badge: savedRecord.badge || payload.badge,
        displayOrder: savedRecord.display_order ?? savedRecord.displayOrder ?? displayOrderNum,
        active: true,
        problemsCovered: savedRecord.problems_covered || savedRecord.problemsCovered || formProblems,
        serviceSlugs: savedRecord.service_slugs || savedRecord.serviceSlugs || formServiceSlugs
      };

      setCategories(prev => {
        if (categoryModal.category) {
          return prev.map(c => c.id === id ? mappedSaved : c);
        } else {
          return [...prev, mappedSaved];
        }
      });

      setCategoryModal({ open: false });
      await fetchCategories();
      if (onRefreshData) onRefreshData();
      alert(`Category "${mappedSaved.name}" saved successfully!`);
    } catch (err: any) {
      console.error('Error saving category:', err);
      alert('Failed to save category: ' + (err?.message || 'Database error. Please check console.'));
    } finally {
      setSavingCategory(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: ServiceCategory) => {
    if (confirm(`Are you sure you want to permanently delete category "${cat.name}"?`)) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', cat.id);

        if (error) {
          console.error('[MOBO ADMIN DELETE ERROR - categories]:', error);
          throw error;
        }

        setCategories(prev => prev.filter(c => c.id !== cat.id));
        await fetchCategories();
        if (onRefreshData) onRefreshData();
        alert(`Category "${cat.name}" deleted successfully.`);
      } catch (err: any) {
        console.error('Error deleting category:', err);
        alert('Failed to delete category: ' + (err?.message || 'Database error.'));
      }
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (cat: ServiceCategory) => {
    try {
      const nextActive = !cat.active;
      // In Supabase schema, active can be boolean or simulated
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, active: nextActive } : c));
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  // Move Display Order Up or Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentCat = sorted[index];
    const targetCat = sorted[targetIndex];

    const tempOrder = currentCat.displayOrder;
    currentCat.displayOrder = targetCat.displayOrder;
    targetCat.displayOrder = tempOrder;

    try {
      const { error: err1 } = await supabase
        .from('categories')
        .update({ displayOrder: currentCat.displayOrder, display_order: currentCat.displayOrder })
        .eq('id', currentCat.id);
      const { error: err2 } = await supabase
        .from('categories')
        .update({ displayOrder: targetCat.displayOrder, display_order: targetCat.displayOrder })
        .eq('id', targetCat.id);

      if (err1 || err2) throw err1 || err2;

      await fetchCategories();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error reordering categories:', err);
    }
  };

  // Filter categories by search
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0284C7]">
            HOME & HUB ARCHITECTURE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-sans tracking-tight">
            Specialized Repair Hubs & Categories
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage the category cards shown on the Home Page and configure services linked inside each hub.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchCategories}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0284C7] font-medium"
          />
        </div>
        <span className="text-xs font-bold text-slate-400">
          Total: {categories.length} Categories ({categories.filter(c => c.active).length} Active)
        </span>
      </div>

      {/* Category List Cards */}
      <div className="space-y-4">
        {filteredCategories.length > 0 ? (
          filteredCategories
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((cat, index) => {
              const serviceCount = cat.serviceSlugs?.length || 0;
              return (
                <div
                  key={cat.id}
                  className={`p-4 sm:p-5 border rounded-2xl transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    cat.active ? 'border-slate-200 bg-white hover:border-sky-300 shadow-sm' : 'border-slate-100 bg-slate-50 opacity-60'
                  }`}
                >
                  {/* Left: Image, Name & Meta */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative">
                      <img
                        src={cat.imageUrl || PRESET_LAB_IMAGES[0].url}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        #{cat.displayOrder}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284C7] border border-sky-200">
                          {cat.badge || 'Hub'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          /{cat.slug}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                        {cat.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-[#0284C7]" />
                          <strong className="text-slate-700 font-bold">{serviceCount}</strong> services inside
                        </span>
                        <span>•</span>
                        <span>
                          {cat.problemsCovered?.length || 0} problems covered
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                    {/* Active Toggle Button */}
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold border transition-colors ${
                        cat.active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {cat.active ? 'Active on Home' : 'Disabled'}
                    </button>

                    {/* Move Up */}
                    <button
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className="p-2 text-slate-400 hover:text-[#0284C7] disabled:opacity-20 rounded-xl hover:bg-slate-100 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === filteredCategories.length - 1}
                      className="p-2 text-slate-400 hover:text-[#0284C7] disabled:opacity-20 rounded-xl hover:bg-slate-100 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenModal(cat)}
                      className="p-2 text-slate-600 hover:text-[#0284C7] hover:bg-sky-50 rounded-xl transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
            <Layers className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-800 text-sm">No categories found</h4>
            <p className="text-xs text-slate-500">Create a new category to display on the Home page grid.</p>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT CATEGORY */}
      {categoryModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-slate-100 shadow-2xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl font-sans">
                  {categoryModal.category ? `Edit Category: ${categoryModal.category.name}` : 'Create New Repair Category'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Configure visual card content, description, problems covered, and services inside.
                </p>
              </div>
              <button
                onClick={() => setCategoryModal({ open: false })}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveCategory} className="flex-1 overflow-y-auto space-y-5 pr-2 text-xs">
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!categoryModal.category) {
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                      }
                    }}
                    placeholder="e.g. iPhone Repair"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284C7] font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. iphone-repair"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284C7] font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Badge & Display Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Category Badge</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Apple Specialist"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284C7] font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    min={1}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284C7] font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Status</label>
                  <select
                    value={formActive ? 'true' : 'false'}
                    onChange={(e) => setFormActive(e.target.value === 'true')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284C7] font-bold"
                  >
                    <option value="true">Active (Show on Home)</option>
                    <option value="false">Hidden / Disabled</option>
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Short Card Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Concise 1-2 sentence description shown on the Home page card."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284C7] font-medium"
                />
              </div>

              {/* Long Description */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700">Detailed Introduction (Category Page)</label>
                <textarea
                  rows={3}
                  value={formLongDescription}
                  onChange={(e) => setFormLongDescription(e.target.value)}
                  placeholder="In-depth lab capabilities, equipment, and calibration procedures shown at the top of the category detail page."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284C7] font-medium"
                />
              </div>

              {/* Image Uploader & Preset Selection */}
              <div className="space-y-2">
                <ImageUploader
                  label="Category Image"
                  value={formImageUrl}
                  onChange={(url) => setFormImageUrl(url)}
                  folder="categories"
                  helperText="Upload custom category banner image or choose preset"
                />

                {/* Quick Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Lab Image Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_LAB_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormImageUrl(img.url)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          formImageUrl === img.url
                            ? 'bg-[#0284C7] text-white border-[#0284C7]'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Problems Covered */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-700">Problems Covered Checklist</label>
                  <span className="text-[10px] text-slate-400">{formProblems.length} issues listed</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProblemInput}
                    onChange={(e) => setNewProblemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddProblem();
                      }
                    }}
                    placeholder="e.g. Cracked Front Screen & OLED Lines"
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={handleAddProblem}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>

                {formProblems.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {formProblems.map((prob, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#0284C7]" />
                        <span>{prob}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProblem(idx)}
                          className="text-slate-400 hover:text-rose-500 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Services Inside this Category (Checkboxes) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-700">Services Linked Inside Category</label>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {formServiceSlugs.length} selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Select which services appear inside this category's dedicated detail page:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {servicesList.map(srv => {
                    const isChecked = formServiceSlugs.includes(srv.slug);
                    return (
                      <label
                        key={srv.slug}
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors border ${
                          isChecked ? 'bg-sky-50 border-sky-300 text-[#0284C7]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleService(srv.slug)}
                          className="rounded text-[#0284C7] focus:ring-[#0284C7]"
                        />
                        <span className="font-bold text-xs truncate" title={srv.name}>
                          {srv.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ open: false })}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl font-bold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
