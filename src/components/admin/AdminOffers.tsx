import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { sanitizePayload } from '../../lib/dbSanitizer';
import { Offer, OfferCategory, OfferCTAType } from '../../types';
import { getOfferStatus } from '../../utils/offerHelpers';
import { DEFAULT_OFFERS, DEFAULT_OFFER_CATEGORIES } from '../../lib/seed';
import ImageUploader from './ImageUploader';
import { 
  Plus, Edit2, Trash2, Tag, Check, X, Eye, EyeOff, FolderPlus, 
  Search, ArrowUp, ArrowDown, ExternalLink, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';

export default function AdminOffers() {
  const [activeTab, setActiveTab] = useState<'offers' | 'categories'>('offers');

  // State for offers & categories
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<OfferCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Editing state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<OfferCategory | null>(null);

  // Form states for Offer
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    category: '',
    discount: '',
    imageUrl: '',
    destinationUrl: '',
    startDate: '',
    endDate: '',
    terms: '',
    ctaText: 'Claim Offer',
    ctaType: 'url' as OfferCTAType,
    ctaValue: '',
    isFeatured: true,
    isActive: true,
    displayOrder: 1
  });

  // Form state for Category
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 1,
    active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [offersRes, categoriesRes] = await Promise.all([
        supabase.from('offers').select('*').order('displayOrder', { ascending: true }),
        supabase.from('offer_categories').select('*').order('displayOrder', { ascending: true })
      ]);

      if (offersRes.error) {
        console.warn('[Supabase Offers fetch error]:', offersRes.error);
      }
      if (categoriesRes.error) {
        console.warn('[Supabase Offer Categories fetch error]:', categoriesRes.error);
      }

      let fetchedOffers = (offersRes.data || []) as any[];
      let fetchedCategories = (categoriesRes.data || []) as any[];

      const mappedOffers: Offer[] = fetchedOffers.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        categoryId: item.categoryId || item.category_id || '',
        category: item.category || 'Special Offers',
        discount: item.discount || item.discount_amount || '',
        imageUrl: item.imageUrl || item.image_url || '',
        destinationUrl: item.destinationUrl || item.destination_url || item.ctaValue || '',
        startDate: item.startDate || '',
        endDate: item.endDate || item.valid_until || '',
        terms: item.terms || '',
        ctaText: item.ctaText || 'Claim Offer',
        ctaType: item.ctaType || 'url',
        ctaValue: item.ctaValue || item.destinationUrl || item.destination_url || '',
        isFeatured: item.isFeatured !== undefined ? item.isFeatured : true,
        isActive: item.isActive !== undefined ? item.isActive : (item.is_active !== undefined ? item.is_active : true),
        displayOrder: item.displayOrder !== undefined ? item.displayOrder : (item.display_order || 1),
        createdAt: item.createdAt || item.created_at || '',
        updatedAt: item.updatedAt || item.updated_at || ''
      }));

      const mappedCats: OfferCategory[] = fetchedCategories.map((item: any) => ({
        id: item.id,
        name: item.name || '',
        slug: item.slug || '',
        description: item.description || '',
        displayOrder: item.displayOrder !== undefined ? item.displayOrder : (item.display_order || 1),
        active: item.active !== undefined ? item.active : (item.is_active !== undefined ? item.is_active : true)
      }));

      setOffers(mappedOffers.length > 0 ? mappedOffers : DEFAULT_OFFERS);
      setCategories(mappedCats.length > 0 ? mappedCats : DEFAULT_OFFER_CATEGORIES);
    } catch (err) {
      console.warn('Error fetching admin offers data:', err);
      setOffers(DEFAULT_OFFERS);
      setCategories(DEFAULT_OFFER_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }

  // Count how many active offers currently exist
  const activeOffersCount = offers.filter(o => getOfferStatus(o) === 'Active').length;

  // Handle Offer Save
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.imageUrl.trim()) {
      return alert('Please provide or upload an offer banner image (16:9 aspect ratio recommended).');
    }

    // Validate 6 active offers limit
    const willBeActive = offerForm.isActive;
    const isCurrentlyActive = editingOffer ? getOfferStatus(editingOffer) === 'Active' : false;
    
    if (willBeActive && !isCurrentlyActive && activeOffersCount >= 6) {
      return alert('Maximum 6 active offers are allowed. Please deactivate another offer first before activating this one.');
    }

    const selectedCat = categories.find(c => c.id === offerForm.categoryId);
    const categoryName = selectedCat ? selectedCat.name : offerForm.category || 'Special Offers';

    try {
      const id = editingOffer ? editingOffer.id : `offer-${Date.now()}`;
      const destUrl = offerForm.destinationUrl.trim();
      
      const payload: any = {
        id,
        title: offerForm.title.trim() || 'Special Offer',
        description: offerForm.description.trim(),
        category_id: offerForm.categoryId || (selectedCat ? selectedCat.id : 'cat-discount'),
        category: categoryName,
        discount: offerForm.discount.trim(),
        image_url: offerForm.imageUrl.trim(),
        destination_url: destUrl,
        start_date: offerForm.startDate || null,
        end_date: offerForm.endDate || null,
        valid_until: offerForm.endDate || null,
        terms: offerForm.terms.trim() || null,
        cta_text: offerForm.ctaText.trim() || 'Claim Offer',
        cta_type: offerForm.ctaType || (destUrl ? 'url' : 'whatsapp'),
        cta_value: destUrl || offerForm.ctaValue.trim() || null,
        is_featured: !!offerForm.isFeatured,
        is_active: offerForm.isActive !== false,
        display_order: Number(offerForm.displayOrder) || 1
      };

      const cleanPayload = sanitizePayload('offers', payload);
      const { error } = await supabase.from('offers').upsert(cleanPayload);
      if (error) {
        console.error('[Supabase Offer Save Error]:', error);
        throw error;
      }
      
      setIsOfferModalOpen(false);
      await fetchData();
      alert(`Offer ${editingOffer ? 'updated' : 'created'} successfully!`);
    } catch (err: any) {
      console.error('Error saving offer:', err);
      alert('Failed to save offer: ' + (err?.message || 'Database error'));
    }
  };

  const handleOpenEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title || '',
      description: offer.description || '',
      categoryId: offer.categoryId || '',
      category: offer.category || '',
      discount: offer.discount || '',
      imageUrl: offer.imageUrl || offer.image_url || '',
      destinationUrl: offer.destinationUrl || offer.destination_url || offer.ctaValue || '',
      startDate: offer.startDate || '',
      endDate: offer.endDate || '',
      terms: offer.terms || '',
      ctaText: offer.ctaText || 'Claim Offer',
      ctaType: offer.ctaType || 'url',
      ctaValue: offer.ctaValue || '',
      isFeatured: !!offer.isFeatured,
      isActive: offer.isActive !== false && offer.is_active !== false,
      displayOrder: offer.displayOrder || offer.display_order || 1
    });
    setIsOfferModalOpen(true);
  };

  const handleOpenNewOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      title: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      category: categories.length > 0 ? categories[0].name : 'Special Offers',
      discount: '',
      imageUrl: '',
      destinationUrl: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      terms: '',
      ctaText: 'Claim Offer',
      ctaType: 'url',
      ctaValue: '',
      isFeatured: true,
      isActive: activeOffersCount < 6,
      displayOrder: offers.length + 1
    });
    setIsOfferModalOpen(true);
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional offer card?')) return;
    try {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting offer:', err);
      alert('Failed to delete offer: ' + (err?.message || 'Database error'));
    }
  };

  const handleToggleOfferActive = async (offer: Offer) => {
    const newActive = !offer.isActive;
    
    // Check if activating would exceed 6 active limit
    if (newActive && activeOffersCount >= 6) {
      return alert('Maximum 6 active offers are allowed. Please deactivate another offer first before activating this one.');
    }

    try {
      const { error } = await supabase
        .from('offers')
        .update({ isActive: newActive, is_active: newActive })
        .eq('id', offer.id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error toggling active:', err);
      alert('Error updating offer active status.');
    }
  };

  // Reorder offers (Move Up / Move Down)
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedOffers.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentOffer = sortedOffers[index];
    const targetOffer = sortedOffers[targetIndex];

    const currentOrder = currentOffer.displayOrder || index + 1;
    const targetOrder = targetOffer.displayOrder || targetIndex + 1;

    try {
      await Promise.all([
        supabase.from('offers').update({ displayOrder: targetOrder, display_order: targetOrder }).eq('id', currentOffer.id),
        supabase.from('offers').update({ displayOrder: currentOrder, display_order: currentOrder }).eq('id', targetOffer.id)
      ]);
      await fetchData();
    } catch (err) {
      console.error('Error reordering offers:', err);
    }
  };

  // Handle Category Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return alert('Please enter category name.');

    try {
      const slug = categoryForm.slug.trim() || categoryForm.name.toLowerCase().replace(/\s+/g, '-');
      const id = editingCategory ? editingCategory.id : `cat-${Date.now()}`;

      const catData: any = {
        id,
        name: categoryForm.name.trim(),
        slug,
        description: categoryForm.description.trim() || '',
        displayOrder: Number(categoryForm.displayOrder) || 1,
        display_order: Number(categoryForm.displayOrder) || 1,
        active: categoryForm.active !== false,
        is_active: categoryForm.active !== false
      };

      const { error } = await supabase.from('offer_categories').upsert(catData);
      if (error) throw error;

      setIsCategoryModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error saving category:', err);
      alert('Failed to save category: ' + (err?.message || 'Database error'));
    }
  };

  const handleOpenEditCategory = (cat: OfferCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      displayOrder: cat.displayOrder || 1,
      active: cat.active !== false
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      displayOrder: categories.length + 1,
      active: true
    });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer category?')) return;
    try {
      const { error } = await supabase.from('offer_categories').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category: ' + (err?.message || 'Database error'));
    }
  };

  const sortedOffers = [...offers].sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

  const filteredOffers = sortedOffers.filter(o =>
    (o.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#0284C7]" />
            <h2 className="text-xl font-black text-slate-900 font-sans">Promotional Offers Slider Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage the 16:9 Offer Card Auto Slider displayed directly below the social media buttons on the homepage.
          </p>
          
          {/* Active Limit Indicator */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
              activeOffersCount >= 6 
                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Slider Cards: {activeOffersCount} / 6 Maximum</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Refresh Offers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {activeTab === 'offers' ? (
            <button
              onClick={handleOpenNewOffer}
              className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Offer</span>
            </button>
          ) : (
            <button
              onClick={handleOpenNewCategory}
              className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('offers')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'offers'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Offers ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'categories'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Offer Categories ({categories.length})
        </button>
      </div>

      {/* Tab 1: OFFERS */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {/* Search bar & Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search offers by title or category..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Only active cards appear in the slider (max 6). Use Move Up/Down to reorder slides.
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading promotional offers...</div>
          ) : filteredOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOffers.map((offer, idx) => {
                const status = getOfferStatus(offer);
                const hasDest = Boolean((offer.destinationUrl || offer.ctaValue || '').trim());

                return (
                  <div
                    key={offer.id}
                    className={`bg-white rounded-2xl border shadow-sm transition-all flex flex-col justify-between overflow-hidden ${
                      offer.isActive ? 'border-slate-200 hover:border-sky-300' : 'border-slate-200 opacity-60 bg-slate-50'
                    }`}
                  >
                    {/* 16:9 Image Preview Box */}
                    <div className="relative w-full aspect-[16/9] bg-slate-900 overflow-hidden group">
                      <img
                        src={offer.imageUrl || offer.image_url || '/assets/images/slide_display_1788168074454.jpg'}
                        alt={offer.title || 'Offer'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/slide_display_1788168074454.jpg';
                        }}
                      />
                      
                      {/* Overlay badge with display order */}
                      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 bg-black/75 text-white text-[10px] font-black rounded-full backdrop-blur-sm border border-white/20">
                          Slide #{offer.displayOrder || idx + 1}
                        </span>
                        {offer.discount && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full shadow-sm">
                            {offer.discount}
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase shadow-sm ${
                          status === 'Active' ? 'bg-emerald-500 text-white' :
                          status === 'Upcoming' ? 'bg-sky-500 text-white' :
                          'bg-slate-500 text-white'
                        }`}>
                          {status}
                        </span>
                      </div>

                      {/* Quick 16:9 Preview button on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewOffer(offer)}
                          className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 text-xs font-black rounded-xl backdrop-blur-sm shadow flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>16:9 Preview</span>
                        </button>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wider">
                          {offer.category || 'Special Offer'}
                        </span>
                        {hasDest && (
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 truncate max-w-[140px]" title={offer.destinationUrl || offer.ctaValue}>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{offer.destinationUrl || offer.ctaValue}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-slate-900 text-sm font-sans truncate">
                        {offer.title || 'Untitled Offer'}
                      </h3>
                      
                      {offer.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{offer.description}</p>
                      )}
                    </div>

                    {/* Footer Actions & Reordering */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveOrder(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg text-xs border border-slate-200 shadow-sm"
                          title="Move Slide Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(idx, 'down')}
                          disabled={idx === sortedOffers.length - 1}
                          className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 rounded-lg text-xs border border-slate-200 shadow-sm"
                          title="Move Slide Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleOfferActive(offer)}
                          className={`ml-1 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                            offer.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                          title="Toggle Active status"
                        >
                          {offer.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{offer.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditOffer(offer)}
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs shadow-sm"
                          title="Edit Offer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 text-xs shadow-sm"
                          title="Delete Offer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-500 text-xs">
              No offers found. Click "Add New Offer" to create your first 16:9 promotional card!
            </div>
          )}
        </div>
      )}

      {/* Tab 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Slug</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-center">Order</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-900">{cat.name}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{cat.slug}</td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="p-3.5 text-center font-bold">{cat.displayOrder || 1}</td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OFFER FORM MODAL */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-sans">
                  {editingOffer ? 'Edit Offer Card' : 'Add New Promotional Offer'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  16:9 banner card for the homepage carousel.
                </p>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4 text-xs font-bold text-slate-700">
              {/* Image Uploader with 16:9 Ratio */}
              <div className="space-y-1">
                <ImageUploader
                  label="Offer Banner Image (16:9 Aspect Ratio) *"
                  value={offerForm.imageUrl}
                  onChange={(url) => setOfferForm({ ...offerForm, imageUrl: url })}
                  folder="offers"
                  aspectRatio="video"
                  helperText="Upload 16:9 promotional banner (e.g. 1920x1080, 1280x720) or paste image URL."
                  required
                />
              </div>

              {/* Destination URL */}
              <div className="space-y-1">
                <label className="flex items-center justify-between">
                  <span>Destination URL (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Clicking card opens this URL</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={offerForm.destinationUrl}
                    onChange={(e) => setOfferForm({ ...offerForm, destinationUrl: e.target.value })}
                    placeholder="e.g. https://wa.me/918167549092 or services or #locations"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-normal">
                  External links (https://...) open in a new tab. Internal words like "services", "book-repair", or "locations" navigate inside the website. Leave empty to display as an info banner.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Offer Title (Optional)</label>
                  <input
                    type="text"
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    placeholder="e.g. Festive Screen & Motherboard Saver"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label>Discount Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={offerForm.discount}
                    onChange={(e) => setOfferForm({ ...offerForm, discount: e.target.value })}
                    placeholder="e.g. Flat 15% OFF or Free Glass"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label>Description (Optional)</label>
                <textarea
                  rows={2}
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  placeholder="Additional details regarding the promotion..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label>Category</label>
                  <select
                    value={offerForm.categoryId}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setOfferForm({
                        ...offerForm,
                        categoryId: e.target.value,
                        category: cat ? cat.name : 'Special Offers'
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={offerForm.displayOrder}
                    onChange={(e) => setOfferForm({ ...offerForm, displayOrder: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label>Active Status</label>
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offerForm.isActive}
                        onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                        className="w-4 h-4 text-[#0284C7] rounded"
                      />
                      <span>Active in Slider</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold rounded-xl shadow"
                >
                  Save Offer Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 16:9 LIVE PREVIEW MODAL */}
      {previewOffer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-800 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-black font-sans">16:9 Public Card Preview</h3>
              </div>
              <button
                onClick={() => setPreviewOffer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 16:9 Aspect Frame */}
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-black shadow-inner border border-white/10">
              <img
                src={previewOffer.imageUrl || previewOffer.image_url || '/assets/images/slide_display_1788168074454.jpg'}
                alt={previewOffer.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {(previewOffer.destinationUrl || previewOffer.ctaValue) && (
                <div className="absolute bottom-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/20">
                    <span>View Offer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Aspect Ratio: 16:9 (Standard Video Banner)</span>
              <span>{previewOffer.destinationUrl ? `Destination: ${previewOffer.destinationUrl}` : 'Display only (no link)'}</span>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY FORM MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 font-sans">
                {editingCategory ? 'Edit Category' : 'New Offer Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="space-y-1">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Festival Offers"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label>Category Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="e.g. festival-offers"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label>Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Short description for this offer category"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label>Display Order</label>
                <input
                  type="number"
                  value={categoryForm.displayOrder}
                  onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold rounded-xl shadow"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
