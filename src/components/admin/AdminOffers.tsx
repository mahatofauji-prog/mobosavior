import React, { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { Offer, OfferCategory, OfferCTAType } from '../../types';
import { getOfferStatus } from '../../utils/offerHelpers';
import { DEFAULT_OFFERS, DEFAULT_OFFER_CATEGORIES } from '../../lib/seed';
import ImageUploader from './ImageUploader';
import { Plus, Edit2, Trash2, Tag, Calendar, Sparkles, Check, X, Eye, EyeOff, Layers, FolderPlus, MessageSquare, ArrowUpRight, Search } from 'lucide-react';

export default function AdminOffers() {
  const [activeTab, setActiveTab] = useState<'offers' | 'categories'>('offers');

  // State for offers
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<OfferCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals / Editing state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

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
    startDate: '',
    endDate: '',
    terms: '',
    ctaText: 'Claim Offer',
    ctaType: 'whatsapp' as OfferCTAType,
    ctaValue: '',
    isFeatured: false,
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
        console.error('[Supabase Offers fetch error]:', offersRes.error);
      }
      if (categoriesRes.error) {
        console.error('[Supabase Offer Categories fetch error]:', categoriesRes.error);
      }

      const fetchedOffers = (offersRes.data || []) as Offer[];
      const fetchedCategories = (categoriesRes.data || []) as OfferCategory[];

      setOffers(fetchedOffers.length > 0 ? fetchedOffers : DEFAULT_OFFERS);
      setCategories(fetchedCategories.length > 0 ? fetchedCategories : DEFAULT_OFFER_CATEGORIES);
    } catch (err) {
      console.error('Error fetching admin offers data:', err);
      setOffers(DEFAULT_OFFERS);
      setCategories(DEFAULT_OFFER_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }

  // Handle Offer Save
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title.trim()) return alert('Please enter offer title.');

    const selectedCat = categories.find(c => c.id === offerForm.categoryId);
    const categoryName = selectedCat ? selectedCat.name : offerForm.category || 'General Offers';

    try {
      const id = editingOffer ? editingOffer.id : `offer-${Date.now()}`;
      const payload: any = {
        id,
        title: offerForm.title.trim(),
        description: offerForm.description.trim(),
        categoryId: offerForm.categoryId || (selectedCat ? selectedCat.id : 'cat-discount'),
        category_id: offerForm.categoryId || (selectedCat ? selectedCat.id : 'cat-discount'),
        category: categoryName,
        discount: offerForm.discount.trim(),
        discount_amount: offerForm.discount.trim(),
        imageUrl: offerForm.imageUrl.trim() || null,
        image_url: offerForm.imageUrl.trim() || null,
        startDate: offerForm.startDate || null,
        endDate: offerForm.endDate || null,
        valid_until: offerForm.endDate || null,
        terms: offerForm.terms.trim() || null,
        ctaText: offerForm.ctaText.trim() || 'Claim Offer',
        ctaType: offerForm.ctaType,
        ctaValue: offerForm.ctaValue.trim() || null,
        isFeatured: !!offerForm.isFeatured,
        isActive: offerForm.isActive !== false,
        is_active: offerForm.isActive !== false,
        displayOrder: Number(offerForm.displayOrder) || 1,
        display_order: Number(offerForm.displayOrder) || 1
      };

      const { error } = await supabase.from('offers').upsert(payload);
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
      imageUrl: offer.imageUrl || '',
      startDate: offer.startDate || '',
      endDate: offer.endDate || '',
      terms: offer.terms || '',
      ctaText: offer.ctaText || 'Claim Offer',
      ctaType: offer.ctaType || 'whatsapp',
      ctaValue: offer.ctaValue || '',
      isFeatured: !!offer.isFeatured,
      isActive: offer.isActive !== false,
      displayOrder: offer.displayOrder || 1
    });
    setIsOfferModalOpen(true);
  };

  const handleOpenNewOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      title: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      category: categories.length > 0 ? categories[0].name : 'Festival Offers',
      discount: '',
      imageUrl: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      terms: '',
      ctaText: 'Enquire on WhatsApp',
      ctaType: 'whatsapp',
      ctaValue: '',
      isFeatured: false,
      isActive: true,
      displayOrder: offers.length + 1
    });
    setIsOfferModalOpen(true);
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      alert('Offer deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting offer:', err);
      alert('Failed to delete offer: ' + (err?.message || 'Database error'));
    }
  };

  const handleToggleOfferActive = async (offer: Offer) => {
    try {
      const newActive = !offer.isActive;
      const { error } = await supabase
        .from('offers')
        .update({ isActive: newActive, is_active: newActive })
        .eq('id', offer.id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error toggling active:', err);
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
      if (error) {
        console.error('[Supabase Offer Category Save Error]:', error);
        throw error;
      }

      setIsCategoryModalOpen(false);
      await fetchData();
      alert(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
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
      alert('Offer category deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category: ' + (err?.message || 'Database error'));
    }
  };

  const filteredOffers = offers.filter(o =>
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#0284C7]" />
            <h2 className="text-xl font-black text-slate-900 font-sans">Dynamic Offers Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create, update and organize special repair discounts, gift vouchers, and seasonal promotional offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search offers by title or category..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading offers...</div>
          ) : filteredOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => {
                const status = getOfferStatus(offer);

                return (
                  <div
                    key={offer.id}
                    className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                      offer.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 bg-sky-50 text-[#0284C7] border border-sky-100 rounded text-[10px] font-black uppercase">
                          {offer.category}
                        </span>

                        <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                          status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                          status === 'Upcoming' ? 'bg-sky-100 text-sky-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {status}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm font-sans">{offer.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{offer.description}</p>

                      {offer.discount && (
                        <div className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-extrabold">
                          Discount: {offer.discount}
                        </div>
                      )}

                      {(offer.startDate || offer.endDate) && (
                        <div className="text-[10px] text-slate-400 font-medium">
                          Valid: {offer.startDate || 'Immediate'} to {offer.endDate || 'No expiration'}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleOfferActive(offer)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                          offer.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {offer.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {offer.isActive ? 'Active' : 'Disabled'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditOffer(offer)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                          title="Edit Offer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs"
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
              No offers found. Click "Add New Offer" to create your first promotion!
            </div>
          )}
        </div>
      )}

      {/* Tab 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
              <h3 className="text-lg font-black text-slate-900 font-sans">
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h3>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Offer Category *</label>
                  <select
                    value={offerForm.categoryId}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setOfferForm({
                        ...offerForm,
                        categoryId: e.target.value,
                        category: cat ? cat.name : ''
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
                  <label>Discount / Offer Value *</label>
                  <input
                    type="text"
                    value={offerForm.discount}
                    onChange={(e) => setOfferForm({ ...offerForm, discount: e.target.value })}
                    placeholder="e.g. Flat 15% OFF, FREE Tempered Glass"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label>Offer Title *</label>
                <input
                  type="text"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  placeholder="e.g. Festive Screen & Display Combo Saver"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label>Short Description</label>
                <textarea
                  rows={3}
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  placeholder="Describe what the customer gets with this special offer..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={offerForm.startDate}
                    onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={offerForm.endDate}
                    onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>

              <ImageUploader
                label="Offer Banner Image"
                value={offerForm.imageUrl}
                onChange={(url) => setOfferForm({ ...offerForm, imageUrl: url })}
                folder="offers"
                helperText="Upload custom offer poster/banner or paste image URL"
              />

              <div className="space-y-1">
                <label>Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={offerForm.terms}
                  onChange={(e) => setOfferForm({ ...offerForm, terms: e.target.value })}
                  placeholder="e.g. Valid on walk-in original screen replacements."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label>CTA Type</label>
                  <select
                    value={offerForm.ctaType}
                    onChange={(e) => setOfferForm({ ...offerForm, ctaType: e.target.value as OfferCTAType })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  >
                    <option value="whatsapp">WhatsApp Enquiry</option>
                    <option value="enquiry">Book Repair Page</option>
                    <option value="service">Specific Service Route</option>
                    <option value="call">Call Phone Directly</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label>CTA Button Text</label>
                  <input
                    type="text"
                    value={offerForm.ctaText}
                    onChange={(e) => setOfferForm({ ...offerForm, ctaText: e.target.value })}
                    placeholder="e.g. Enquire on WhatsApp"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label>CTA Target Value</label>
                  <input
                    type="text"
                    value={offerForm.ctaValue}
                    onChange={(e) => setOfferForm({ ...offerForm, ctaValue: e.target.value })}
                    placeholder="Custom msg or service slug"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerForm.isFeatured}
                    onChange={(e) => setOfferForm({ ...offerForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-[#0284C7] rounded"
                  />
                  <span>Featured on Home Page</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerForm.isActive}
                    onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#0284C7] rounded"
                  />
                  <span>Offer Active</span>
                </label>
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
                  Save Offer
                </button>
              </div>
            </form>
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
