import React, { useState, useEffect } from 'react';
import { supabase, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from '../../lib/supabase';
import { db } from '../../lib/supabase';
import { Brand, PhoneModel, ServiceCategory, Service } from '../../types';
import { DEFAULT_BRANDS, DEFAULT_MODELS, DEFAULT_CATEGORIES } from '../../data/modelsData';
import { ALL_COMPREHENSIVE_SERVICES } from '../../data/servicesData';
import { 
  Smartphone, Tag, Plus, Edit, Trash2, Check, X, Search, 
  DollarSign, SlidersHorizontal, AlertCircle, Save, Loader2, RefreshCw
} from 'lucide-react';
import ImageUploader from './ImageUploader';

interface AdminBrandsModelsProps {
  servicesList: Service[];
  onRefreshData?: () => void;
  defaultTab?: 'models' | 'brands' | 'categories';
}

export default function AdminBrandsModels({ servicesList, onRefreshData, defaultTab = 'models' }: AdminBrandsModelsProps) {
  const [subTab, setSubTab] = useState<'models' | 'brands' | 'categories'>(defaultTab);
  
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [models, setModels] = useState<PhoneModel[]>(DEFAULT_MODELS);
  const [categories, setCategories] = useState<ServiceCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [modelModal, setModelModal] = useState<{ open: boolean; item?: PhoneModel | null }>({ open: false });
  const [brandModal, setBrandModal] = useState<{ open: boolean; item?: Brand | null }>({ open: false });
  const [pricingModal, setPricingModal] = useState<{ open: boolean; model?: PhoneModel | null }>({ open: false });

  // Controlled image states for ImageUploader
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [modelImageUrl, setModelImageUrl] = useState('');

  // Saving states
  const [savingBrand, setSavingBrand] = useState(false);
  const [savingModel, setSavingModel] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  // Pricing edit state
  const [modelPricesEdit, setModelPricesEdit] = useState<{ [serviceSlug: string]: string }>({});

  const services = servicesList.length > 0 ? servicesList : ALL_COMPREHENSIVE_SERVICES;

  // Fetch directly from Supabase
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [brandsRes, modelsRes, catsRes] = await Promise.all([
        supabase.from('brands').select('*').order('display_order', { ascending: true }),
        supabase.from('models').select('*').order('display_order', { ascending: true }),
        supabase.from('categories').select('*').order('display_order', { ascending: true })
      ]);

      if (brandsRes.data && brandsRes.data.length > 0) {
        setBrands(brandsRes.data.map(b => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          logoUrl: b.logo_url || b.logoUrl || '',
          displayOrder: b.display_order ?? b.displayOrder ?? 1,
          active: b.is_active ?? b.active ?? true
        })));
      } else {
        const brandsSnap = await getDocs(query(collection(db, 'brands'), orderBy('displayOrder', 'asc')));
        if (!brandsSnap.empty) setBrands(brandsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Brand)));
      }

      if (modelsRes.data && modelsRes.data.length > 0) {
        setModels(modelsRes.data.map(m => ({
          id: m.id,
          name: m.name,
          slug: m.slug,
          brand: m.brand,
          releaseYear: m.release_year ?? m.releaseYear,
          imageUrl: m.image_url || m.imageUrl || '',
          displayOrder: m.display_order ?? m.displayOrder ?? 1,
          active: m.is_active ?? m.active ?? true,
          servicePrices: m.service_prices || m.servicePrices || {},
          availableServices: m.available_services || m.availableServices || []
        })));
      } else {
        const modelsSnap = await getDocs(query(collection(db, 'models'), orderBy('displayOrder', 'asc')));
        if (!modelsSnap.empty) setModels(modelsSnap.docs.map(d => ({ id: d.id, ...d.data() } as PhoneModel)));
      }

      if (catsRes.data && catsRes.data.length > 0) {
        setCategories(catsRes.data.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          longDescription: c.long_description || c.longDescription,
          imageUrl: c.image_url || c.imageUrl,
          badge: c.badge,
          displayOrder: c.display_order ?? c.displayOrder ?? 1,
          active: c.is_active ?? c.active ?? true,
          problemsCovered: c.problems_covered || c.problemsCovered || [],
          serviceSlugs: c.service_slugs || c.serviceSlugs || []
        })));
      }
    } catch (err) {
      console.error('Error fetching brands/models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (brandModal.open) {
      setBrandLogoUrl(brandModal.item?.logoUrl || '');
    }
  }, [brandModal.open, brandModal.item]);

  useEffect(() => {
    if (modelModal.open) {
      setModelImageUrl(modelModal.item?.imageUrl || '');
    }
  }, [modelModal.open, modelModal.item]);

  // Save Brand to Supabase
  const handleSaveBrand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (savingBrand) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const rawName = (formData.get('name') as string)?.trim();
    if (!rawName) {
      alert('Brand name is required.');
      return;
    }

    setSavingBrand(true);
    try {
      const isEdit = Boolean(brandModal.item?.id);
      const id = brandModal.item?.id || `brand_${Date.now()}`;
      const logo = brandLogoUrl || (formData.get('logoUrl') as string)?.trim() || '';
      const order = parseInt(formData.get('displayOrder') as string) || (brands.length + 1);
      const activeVal = formData.get('active') === 'true';

      const payload: any = {
        name: rawName,
        slug: rawName.toLowerCase().replace(/\s+/g, '-'),
        logoUrl: logo,
        logo_url: logo,
        displayOrder: order,
        display_order: order,
        active: activeVal,
        is_active: activeVal
      };

      let savedRecord: any = null;

      if (isEdit) {
        const { data: updateRes, error } = await supabase
          .from('brands')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('[MOBO ADMIN SAVE ERROR - brands update]:', { table: 'brands', id, error });
          throw error;
        }
        savedRecord = updateRes;
      } else {
        payload.id = id;
        const { data: insertRes, error } = await supabase
          .from('brands')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('[MOBO ADMIN SAVE ERROR - brands insert]:', { table: 'brands', id, error });
          throw error;
        }
        savedRecord = insertRes;
      }

      const mappedSaved: Brand = {
        id: savedRecord.id || id,
        name: savedRecord.name || payload.name,
        slug: savedRecord.slug || payload.slug,
        logoUrl: savedRecord.logo_url || savedRecord.logoUrl || logo,
        displayOrder: savedRecord.display_order ?? savedRecord.displayOrder ?? order,
        active: savedRecord.is_active ?? savedRecord.active ?? activeVal
      };

      setBrands(prev => isEdit ? prev.map(b => b.id === id ? mappedSaved : b) : [...prev, mappedSaved]);
      setBrandModal({ open: false });
      await fetchAll();
      if (onRefreshData) onRefreshData();
      alert(`Brand "${mappedSaved.name}" saved successfully!`);
    } catch (err: any) {
      console.error('Failed to save brand:', err);
      alert('Failed to save brand: ' + (err?.message || 'Database error.'));
    } finally {
      setSavingBrand(false);
    }
  };

  // Delete Brand from Supabase
  const handleDeleteBrand = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        const { error } = await supabase.from('brands').delete().eq('id', id);
        if (error) {
          console.error('[MOBO ADMIN DELETE ERROR - brands]:', error);
          throw error;
        }
        setBrands(prev => prev.filter(b => b.id !== id));
        await fetchAll();
        if (onRefreshData) onRefreshData();
        alert('Brand deleted successfully.');
      } catch (err: any) {
        console.error('Error deleting brand:', err);
        alert('Failed to delete brand: ' + (err?.message || 'Database error.'));
      }
    }
  };

  // Save Model to Supabase
  const handleSaveModel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (savingModel) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    const modelName = (formData.get('name') as string)?.trim();
    const brand = (formData.get('brand') as string)?.trim();
    if (!modelName || !brand) {
      alert('Both model name and brand are required.');
      return;
    }

    setSavingModel(true);
    try {
      const isEdit = Boolean(modelModal.item?.id);
      const id = modelModal.item?.id || `model_${Date.now()}`;
      const img = modelImageUrl || (formData.get('imageUrl') as string)?.trim() || '';
      const order = parseInt(formData.get('displayOrder') as string) || (models.length + 1);
      const activeVal = formData.get('active') === 'true';
      const releaseYr = formData.get('releaseYear') ? parseInt(formData.get('releaseYear') as string) : null;

      const payload: any = {
        name: modelName,
        slug: modelName.toLowerCase().replace(/\s+/g, '-'),
        brand: brand,
        releaseYear: releaseYr,
        imageUrl: img,
        image_url: img,
        displayOrder: order,
        display_order: order,
        active: activeVal,
        is_active: activeVal
      };

      let savedRecord: any = null;

      if (isEdit) {
        const { data: updateRes, error } = await supabase
          .from('models')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('[MOBO ADMIN SAVE ERROR - models update]:', { table: 'models', id, error });
          throw error;
        }
        savedRecord = updateRes;
      } else {
        payload.id = id;
        payload.servicePrices = {};
        payload.availableServices = [];
        const { data: insertRes, error } = await supabase
          .from('models')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('[MOBO ADMIN SAVE ERROR - models insert]:', { table: 'models', id, error });
          throw error;
        }
        savedRecord = insertRes;
      }

      const mappedSaved: PhoneModel = {
        id: savedRecord.id || id,
        name: savedRecord.name || payload.name,
        slug: savedRecord.slug || payload.slug,
        brand: savedRecord.brand || payload.brand,
        releaseYear: savedRecord.release_year ?? savedRecord.releaseYear ?? releaseYr,
        imageUrl: savedRecord.image_url || savedRecord.imageUrl || img,
        displayOrder: savedRecord.display_order ?? savedRecord.displayOrder ?? order,
        active: savedRecord.is_active ?? savedRecord.active ?? activeVal,
        servicePrices: savedRecord.service_prices || savedRecord.servicePrices || modelModal.item?.servicePrices || {},
        availableServices: savedRecord.available_services || savedRecord.availableServices || modelModal.item?.availableServices || []
      };

      setModels(prev => isEdit ? prev.map(m => m.id === id ? mappedSaved : m) : [...prev, mappedSaved]);
      setModelModal({ open: false });
      await fetchAll();
      if (onRefreshData) onRefreshData();
      alert(`Phone model "${mappedSaved.name}" saved successfully!`);
    } catch (err: any) {
      console.error('Failed to save model:', err);
      alert('Failed to save model: ' + (err?.message || 'Database error.'));
    } finally {
      setSavingModel(false);
    }
  };

  // Delete Model from Supabase
  const handleDeleteModel = async (id: string) => {
    if (confirm('Are you sure you want to delete this phone model?')) {
      try {
        const { error } = await supabase.from('models').delete().eq('id', id);
        if (error) {
          console.error('[MOBO ADMIN DELETE ERROR - models]:', error);
          throw error;
        }
        setModels(prev => prev.filter(m => m.id !== id));
        await fetchAll();
        if (onRefreshData) onRefreshData();
        alert('Model deleted successfully.');
      } catch (err: any) {
        console.error('Error deleting model:', err);
        alert('Failed to delete model: ' + (err?.message || 'Database error.'));
      }
    }
  };

  // Open Pricing Modal
  const openPricingModal = (model: PhoneModel) => {
    setModelPricesEdit(model.servicePrices || {});
    setPricingModal({ open: true, model });
  };

  // Save Pricing for a Model in Supabase
  const handleSavePricing = async () => {
    if (!pricingModal.model || savingPricing) return;
    setSavingPricing(true);
    try {
      const id = pricingModal.model.id;
      const { data, error } = await supabase
        .from('models')
        .update({
          servicePrices: modelPricesEdit,
          service_prices: modelPricesEdit
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[MOBO ADMIN SAVE ERROR - model pricing update]:', { table: 'models', id, error });
        throw error;
      }

      setModels(prev => prev.map(m => m.id === id ? { ...m, servicePrices: modelPricesEdit } : m));
      setPricingModal({ open: false });
      await fetchAll();
      if (onRefreshData) onRefreshData();
      alert('Model service prices updated successfully!');
    } catch (err: any) {
      console.error('Failed to update service prices:', err);
      alert('Failed to update service prices: ' + (err?.message || 'Database error.'));
    } finally {
      setSavingPricing(false);
    }
  };

  // Filter models
  const filteredModels = models.filter(m => {
    const matchesBrand = selectedBrandFilter === 'All' || m.brand === selectedBrandFilter;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-sans tracking-tight flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#0284C7]" />
            Brands, Models & Model-Wise Pricing
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage device brands, individual phone models, and configure service starting rates per model.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {subTab === 'models' && (
            <button
              onClick={() => setModelModal({ open: true, item: null })}
              className="px-3.5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Model
            </button>
          )}

          {subTab === 'brands' && (
            <button
              onClick={() => setBrandModal({ open: true, item: null })}
              className="px-3.5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Brand
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab('models')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'models' ? 'bg-[#0284C7] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Phone Models ({models.length})
        </button>
        <button
          onClick={() => setSubTab('brands')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'brands' ? 'bg-[#0284C7] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Brands ({brands.length})
        </button>
      </div>

      {/* TAB 1: MODELS MANAGEMENT */}
      {subTab === 'models' && (
        <div className="space-y-4">
          {/* Controls: Brand Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search models (e.g. iPhone 15, OnePlus 11, Poco X3)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedBrandFilter('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedBrandFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Brands
              </button>
              {brands.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrandFilter(b.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedBrandFilter === b.name ? 'bg-[#0284C7] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Models Grid / List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Model Name</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Custom Pricing</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredModels.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        No models found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredModels.map(model => {
                      const pricesCount = model.servicePrices ? Object.keys(model.servicePrices).length : 0;
                      return (
                        <tr key={model.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 text-sm">{model.name}</div>
                            {model.releaseYear && (
                              <span className="text-[10px] text-slate-400 font-medium">Released {model.releaseYear}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 bg-sky-50 text-[#0284C7] font-bold rounded-md border border-sky-100">
                              {model.brand}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openPricingModal(model)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg border border-emerald-200 transition-colors"
                            >
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{pricesCount} Services Configured</span>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              model.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {model.active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openPricingModal(model)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Edit Pricing"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setModelModal({ open: true, item: model })}
                                className="p-1.5 text-slate-500 hover:text-[#0284C7] hover:bg-slate-100 rounded-lg"
                                title="Edit Model"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteModel(model.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                                title="Delete Model"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANDS MANAGEMENT */}
      {subTab === 'brands' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {brands.map(brand => {
            const brandModelsCount = models.filter(m => m.brand === brand.name).length;
            return (
              <div key={brand.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base font-sans">{brand.name}</h4>
                  <p className="text-xs text-slate-500">{brandModelsCount} Models Listed</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    brand.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {brand.active !== false ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBrandModal({ open: true, item: brand })}
                    className="p-2 text-slate-500 hover:text-[#0284C7] hover:bg-slate-50 rounded-xl"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD/EDIT BRAND */}
      {brandModal.open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base font-sans">
                {brandModal.item ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <button 
                onClick={() => setBrandModal({ open: false })} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500">Brand Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={brandModal.item?.name || ''}
                  placeholder="e.g. Apple, Samsung, OnePlus"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <ImageUploader
                label="Brand Logo or Icon"
                value={brandLogoUrl}
                onChange={(url) => setBrandLogoUrl(url)}
                folder="brands"
                helperText="Upload official brand logo file or use public URL"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500">Display Order</label>
                  <input
                    name="displayOrder"
                    type="number"
                    defaultValue={brandModal.item?.displayOrder || 1}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Status</label>
                  <select
                    name="active"
                    defaultValue={brandModal.item?.active !== false ? 'true' : 'false'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-[#0284C7] focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={savingBrand}
                  onClick={() => setBrandModal({ open: false })}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBrand}
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl font-bold shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {savingBrand && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingBrand ? 'Saving...' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT MODEL */}
      {modelModal.open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base font-sans">
                {modelModal.item ? 'Edit Phone Model' : 'Add New Phone Model'}
              </h3>
              <button 
                onClick={() => setModelModal({ open: false })} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500">Model Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={modelModal.item?.name || ''}
                  placeholder="e.g. iPhone 15 Pro Max, Poco X3 Pro"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500">Brand</label>
                  <select
                    name="brand"
                    defaultValue={modelModal.item?.brand || brands[0]?.name || 'Apple'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-[#0284C7] focus:outline-none"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-500">Release Year (Optional)</label>
                  <input
                    name="releaseYear"
                    type="number"
                    defaultValue={modelModal.item?.releaseYear || ''}
                    placeholder="e.g. 2024"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>

              <ImageUploader
                label="Phone Model Photo"
                value={modelImageUrl}
                onChange={(url) => setModelImageUrl(url)}
                folder="models"
                helperText="Upload phone model image file or use direct image URL"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-500">Display Order</label>
                  <input
                    name="displayOrder"
                    type="number"
                    defaultValue={modelModal.item?.displayOrder || 1}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Status</label>
                  <select
                    name="active"
                    defaultValue={modelModal.item?.active !== false ? 'true' : 'false'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-[#0284C7] focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={savingModel}
                  onClick={() => setModelModal({ open: false })}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModel}
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl font-bold shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {savingModel && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingModel ? 'Saving...' : 'Save Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MODEL-WISE PRICING CONFIGURATION */}
      {pricingModal.open && pricingModal.model && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-slate-100 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg font-sans">
                  Configure Pricing: {pricingModal.model.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Set specific repair starting costs for this exact phone model.
                </p>
              </div>
              <button 
                onClick={() => setPricingModal({ open: false })} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map(srv => {
                  const currentVal = modelPricesEdit[srv.slug] || '';
                  return (
                    <div key={srv.slug} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate max-w-[170px]" title={srv.name}>
                          {srv.name}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">
                          {srv.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-400">₹</span>
                        <input
                          type="text"
                          placeholder={srv.price || 'e.g. 1499'}
                          value={currentVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            setModelPricesEdit(prev => ({
                              ...prev,
                              [srv.slug]: val
                            }));
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Leave blank to fallback to service's global default price.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={savingPricing}
                  onClick={() => setPricingModal({ open: false })}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingPricing}
                  onClick={handleSavePricing}
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl font-bold shadow-sm text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingPricing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingPricing ? 'Saving...' : 'Save Prices'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
