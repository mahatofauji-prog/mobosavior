import React, { useState, useEffect, FormEvent } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from '../../lib/supabase';
import { db } from '../../lib/supabase';
import { PriceItem, PriceType, Service, Brand, PhoneModel } from '../../types';
import { getFormattedPriceString, formatAmount } from '../../utils/priceHelpers';
import { ALL_COMPREHENSIVE_SERVICES } from '../../data/servicesData';
import { DEFAULT_BRANDS, DEFAULT_MODELS } from '../../data/modelsData';
import { 
  DollarSign, Plus, Edit2, Trash2, Search, Filter, Check, X, 
  Layers, Smartphone, ShieldCheck, AlertCircle, RefreshCw, Eye, EyeOff, Tag, SlidersHorizontal
} from 'lucide-react';

export default function AdminPrices() {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [selectedModelFilter, setSelectedModelFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PriceItem | null>(null);

  // Form State
  const [formState, setFormState] = useState({
    serviceSlug: '',
    serviceName: '',
    category: '',
    brand: '',
    model: '',
    displayVariant: '',
    priceType: 'starting_from' as PriceType,
    amount: '',
    currency: '₹',
    notes: '',
    isActive: true,
    displayOrder: 1
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    try {
      // 1. Fetch Prices
      const qPrices = query(collection(db, 'prices'), orderBy('displayOrder', 'asc'));
      const pricesSnap = await getDocs(qPrices);
      const fetchedPrices: PriceItem[] = [];
      pricesSnap.forEach(docSnap => {
        fetchedPrices.push({ id: docSnap.id, ...docSnap.data() } as PriceItem);
      });
      setPrices(fetchedPrices);

      // 2. Fetch Services
      const servicesSnap = await getDocs(collection(db, 'services'));
      const fetchedServices: Service[] = [];
      servicesSnap.forEach(docSnap => {
        fetchedServices.push({ id: docSnap.id, ...docSnap.data() } as Service);
      });
      setServices(fetchedServices.length > 0 ? fetchedServices : ALL_COMPREHENSIVE_SERVICES);

      // 3. Fetch Brands
      const brandsSnap = await getDocs(collection(db, 'brands'));
      const fetchedBrands: Brand[] = [];
      brandsSnap.forEach(docSnap => {
        fetchedBrands.push({ id: docSnap.id, ...docSnap.data() } as Brand);
      });
      setBrands(fetchedBrands.length > 0 ? fetchedBrands : DEFAULT_BRANDS);

      // 4. Fetch Models
      const modelsSnap = await getDocs(collection(db, 'models'));
      const fetchedModels: PhoneModel[] = [];
      modelsSnap.forEach(docSnap => {
        fetchedModels.push({ id: docSnap.id, ...docSnap.data() } as PhoneModel);
      });
      setModels(fetchedModels.length > 0 ? fetchedModels : DEFAULT_MODELS);
    } catch (err) {
      console.error('Error fetching data for AdminPrices:', err);
      setServices(ALL_COMPREHENSIVE_SERVICES);
      setBrands(DEFAULT_BRANDS);
      setModels(DEFAULT_MODELS);
    } finally {
      setLoading(false);
    }
  }

  // Handle Modal Open for New Price
  const handleOpenNewModal = () => {
    setEditingPrice(null);
    const defaultService = services.length > 0 ? services[0] : ALL_COMPREHENSIVE_SERVICES[0];
    setFormState({
      serviceSlug: defaultService ? defaultService.slug : 'display-replacement',
      serviceName: defaultService ? defaultService.name : 'Display Replacement',
      category: defaultService ? defaultService.category : '',
      brand: '',
      model: '',
      displayVariant: '',
      priceType: 'starting_from',
      amount: '',
      currency: '₹',
      notes: '',
      isActive: true,
      displayOrder: prices.length + 1
    });
    setIsModalOpen(true);
  };

  // Handle Modal Open for Edit Price
  const handleOpenEditModal = (item: PriceItem) => {
    setEditingPrice(item);
    setFormState({
      serviceSlug: item.serviceSlug || '',
      serviceName: item.serviceName || '',
      category: item.category || '',
      brand: item.brand || '',
      model: item.model || '',
      displayVariant: item.displayVariant || '',
      priceType: item.priceType || 'starting_from',
      amount: item.amount !== undefined ? String(item.amount) : '',
      currency: item.currency || '₹',
      notes: item.notes || '',
      isActive: item.isActive !== false,
      displayOrder: item.displayOrder || 1
    });
    setIsModalOpen(true);
  };

  // Handle Service Selection Change in Form
  const handleServiceChange = (slug: string) => {
    const matchedService = services.find(s => s.slug === slug);
    if (matchedService) {
      setFormState(prev => ({
        ...prev,
        serviceSlug: matchedService.slug,
        serviceName: matchedService.name,
        category: matchedService.category
      }));
    } else {
      setFormState(prev => ({ ...prev, serviceSlug: slug }));
    }
  };

  // Handle Save Price (Create / Update)
  const handleSavePrice = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.serviceSlug) {
      alert('Please select a service.');
      return;
    }

    if ((formState.priceType === 'fixed' || formState.priceType === 'starting_from') && !formState.amount) {
      alert('Please enter a price amount for Fixed or Starting From price types.');
      return;
    }

    try {
      const id = editingPrice ? editingPrice.id : `price-${Date.now()}`;
      const now = new Date().toISOString();

      const matchedService = services.find(s => s.slug === formState.serviceSlug);
      const serviceName = matchedService ? matchedService.name : formState.serviceName || formState.serviceSlug;

      const priceData: PriceItem = {
        id,
        serviceSlug: formState.serviceSlug,
        serviceName,
        category: formState.category || matchedService?.category || '',
        brand: formState.brand.trim() || undefined,
        model: formState.model.trim() || undefined,
        displayVariant: formState.displayVariant.trim() || undefined,
        priceType: formState.priceType,
        amount: formState.amount ? Number(formState.amount) : undefined,
        currency: formState.currency || '₹',
        notes: formState.notes.trim() || undefined,
        isActive: formState.isActive,
        displayOrder: Number(formState.displayOrder) || 1,
        createdAt: editingPrice ? editingPrice.createdAt || now : now,
        updatedAt: now
      };

      await setDoc(doc(db, 'prices', id), priceData);
      setIsModalOpen(false);
      fetchInitialData();
      alert(`Price ${editingPrice ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      console.error('Error saving price:', err);
      alert('Failed to save price. Please check database permissions.');
    }
  };

  // Delete Price
  const handleDeletePrice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price rule? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'prices', id));
      fetchInitialData();
    } catch (err) {
      console.error('Error deleting price:', err);
      alert('Failed to delete price.');
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (item: PriceItem) => {
    try {
      await updateDoc(doc(db, 'prices', item.id), {
        isActive: !item.isActive,
        updatedAt: new Date().toISOString()
      });
      fetchInitialData();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  // Unique Categories & Brands for Filters
  const availableCategories = Array.from(new Set(services.map(s => s.category))).filter(Boolean);
  const availableBrands = Array.from(new Set(brands.map(b => b.name))).filter(Boolean);

  // Models filtered by selected brand in form
  const modelsForSelectedBrand = formState.brand 
    ? models.filter(m => m.brand.toLowerCase() === formState.brand.toLowerCase())
    : models;

  // Filtered Prices List
  const filteredPrices = prices.filter(p => {
    // Search Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = (p.serviceName || p.serviceSlug).toLowerCase().includes(term);
      const matchBrand = (p.brand || '').toLowerCase().includes(term);
      const matchModel = (p.model || '').toLowerCase().includes(term);
      const matchVariant = (p.displayVariant || '').toLowerCase().includes(term);
      const matchNotes = (p.notes || '').toLowerCase().includes(term);
      if (!matchName && !matchBrand && !matchModel && !matchVariant && !matchNotes) {
        return false;
      }
    }

    // Category Filter
    if (selectedCategoryFilter && p.category !== selectedCategoryFilter) {
      return false;
    }

    // Service Filter
    if (selectedServiceFilter && p.serviceSlug !== selectedServiceFilter) {
      return false;
    }

    // Brand Filter
    if (selectedBrandFilter && (p.brand || '').toLowerCase() !== selectedBrandFilter.toLowerCase()) {
      return false;
    }

    // Model Filter
    if (selectedModelFilter && (p.model || '').toLowerCase() !== selectedModelFilter.toLowerCase()) {
      return false;
    }

    // Price Type Filter
    if (selectedTypeFilter && p.priceType !== selectedTypeFilter) {
      return false;
    }

    // Status Filter
    if (selectedStatusFilter === 'active' && p.isActive === false) return false;
    if (selectedStatusFilter === 'disabled' && p.isActive !== false) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-[#0284C7] rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Service & Model Dynamic Pricing</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Manage independent service prices, model-specific overrides (e.g. iPhone 13, Galaxy S23), and display replacement quality options (TFT, OLED, Original, Curved).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInitialData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Refresh Prices"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenNewModal}
            className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Price Rule
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search service, brand, model, display variant or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0284C7]"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Service Filter */}
          <select
            value={selectedServiceFilter}
            onChange={(e) => setSelectedServiceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0284C7]"
          >
            <option value="">All Services</option>
            {services.map(s => (
              <option key={s.id} value={s.slug}>{s.name}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0284C7]"
          >
            <option value="">All Brands</option>
            {availableBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Price Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0284C7]"
          >
            <option value="">All Price Types</option>
            <option value="fixed">Fixed Price</option>
            <option value="starting_from">Starting From</option>
            <option value="contact">Contact for Price</option>
            <option value="diagnosis">Price after Diagnosis</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0284C7]"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>

        {/* Filter Badges & Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong className="text-slate-900">{filteredPrices.length}</strong> of <strong className="text-slate-900">{prices.length}</strong> price rules</span>
          {(searchTerm || selectedServiceFilter || selectedBrandFilter || selectedTypeFilter || selectedStatusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedServiceFilter('');
                setSelectedBrandFilter('');
                setSelectedTypeFilter('');
                setSelectedStatusFilter('all');
              }}
              className="text-[#0284C7] font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Prices Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0284C7]" />
            Loading price configuration database...
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Price Rules Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {prices.length === 0 
                ? 'No custom prices have been configured yet. Unconfigured services will show "Price available on enquiry" on the website.' 
                : 'No prices match your search or filter criteria.'}
            </p>
            <button
              onClick={handleOpenNewModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0284C7] text-white text-xs font-bold rounded-xl hover:bg-[#0369A1] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Price Rule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Scope (Brand / Model / Variant)</th>
                  <th className="py-3 px-4">Price Type</th>
                  <th className="py-3 px-4">Configured Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPrices.map((p) => {
                  const matchedService = services.find(s => s.slug === p.serviceSlug);
                  const serviceTitle = p.serviceName || matchedService?.name || p.serviceSlug;
                  const formatted = getFormattedPriceString(p);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{serviceTitle}</div>
                        <div className="text-[10px] text-slate-400">{p.serviceSlug}</div>
                      </td>

                      {/* Scope */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {p.model ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-[#0284C7] border border-sky-200 rounded-md font-bold text-[11px]">
                              <Smartphone className="w-3 h-3" />
                              {p.brand ? `${p.brand} ` : ''}{p.model}
                            </span>
                          ) : p.brand ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-bold text-[11px]">
                              <Layers className="w-3 h-3" />
                              {p.brand} (All Models)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px]">
                              General Service Default
                            </span>
                          )}

                          {p.displayVariant && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-[10px]">
                              {p.displayVariant}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price Type */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                          p.priceType === 'fixed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          p.priceType === 'starting_from' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                          p.priceType === 'diagnosis' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {p.priceType === 'fixed' ? 'Fixed Price' :
                           p.priceType === 'starting_from' ? 'Starting From' :
                           p.priceType === 'diagnosis' ? 'After Diagnosis' : 'Contact for Price'}
                        </span>
                      </td>

                      {/* Configured Price */}
                      <td className="py-3.5 px-4">
                        <div className="text-sm font-black text-slate-900">{formatted}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            p.isActive !== false 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {p.isActive !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {p.isActive !== false ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 max-w-xs text-slate-500 truncate text-[11px]">
                        {p.notes || '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                            title="Edit Price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePrice(p.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                            title="Delete Price"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Price Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {editingPrice ? 'Edit Price Rule' : 'Add New Price Rule'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure service, model override, or display variant specific pricing.
              </p>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-4 text-xs">
              {/* Service Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Service <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formState.serviceSlug}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0284C7]"
                  required
                >
                  <option value="">-- Select Service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.slug}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand & Model Override Controls */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Smartphone className="w-4 h-4 text-[#0284C7]" />
                  <span>Model Specific Override (Optional)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Leave Brand and Model blank to set the general default price for this service.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Brand */}
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Brand</label>
                    <select
                      value={formState.brand}
                      onChange={(e) => setFormState(prev => ({ ...prev, brand: e.target.value, model: '' }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0284C7]"
                    >
                      <option value="">All / General Brand</option>
                      {availableBrands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Phone Model</label>
                    <input
                      type="text"
                      list="models-datalist"
                      placeholder="e.g. iPhone 13, Galaxy S23"
                      value={formState.model}
                      onChange={(e) => setFormState(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0284C7]"
                    />
                    <datalist id="models-datalist">
                      {modelsForSelectedBrand.map(m => (
                        <option key={m.id} value={m.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Display Variant */}
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Display / Component Variant (Optional)
                  </label>
                  <select
                    value={formState.displayVariant}
                    onChange={(e) => setFormState(prev => ({ ...prev, displayVariant: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="">-- None / Standard Component --</option>
                    <option value="TFT">TFT Panel</option>
                    <option value="OLED">OLED Panel</option>
                    <option value="Premium Quality">Premium Quality</option>
                    <option value="Original Display">Original Display</option>
                    <option value="Curved Display">Curved Display</option>
                  </select>
                </div>
              </div>

              {/* Price Type & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Price Type */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price Type</label>
                  <select
                    value={formState.priceType}
                    onChange={(e) => setFormState(prev => ({ ...prev, priceType: e.target.value as PriceType }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0284C7]"
                  >
                    <option value="starting_from">Starting From</option>
                    <option value="fixed">Fixed Price</option>
                    <option value="contact">Contact for Price</option>
                    <option value="diagnosis">Price after Diagnosis</option>
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={formState.currency}
                    onChange={(e) => setFormState(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0284C7]"
                    placeholder="₹"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount { (formState.priceType === 'fixed' || formState.priceType === 'starting_from') && <span className="text-rose-500">*</span> }
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    disabled={formState.priceType === 'contact' || formState.priceType === 'diagnosis'}
                    value={formState.amount}
                    onChange={(e) => setFormState(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0284C7] disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Preview Box */}
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between">
                <span className="text-sky-900 font-bold">Public Preview Output:</span>
                <span className="text-sm font-black text-[#0284C7]">
                  {getFormattedPriceString({
                    id: 'preview',
                    serviceSlug: formState.serviceSlug,
                    priceType: formState.priceType,
                    amount: formState.amount,
                    currency: formState.currency,
                    isActive: formState.isActive
                  })}
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Terms (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Includes true tone calibration & 6 months warranty"
                  value={formState.notes}
                  onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              {/* Display Order & Active */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="w-32">
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formState.displayOrder}
                    onChange={(e) => setFormState(prev => ({ ...prev, displayOrder: Number(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(e) => setFormState(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-[#0284C7] rounded focus:ring-[#0284C7]"
                  />
                  <span>Enable this price rule</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold rounded-xl shadow-sm transition-all"
                >
                  Save Price Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
