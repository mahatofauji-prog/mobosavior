import React, { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { Branch, Service, WeeklyBusinessHours, DayBusinessHours } from '../../types';
import { DEFAULT_BRANCHES } from '../../lib/seed';
import { isOpenNow } from '../../utils/branchHelpers';
import ImageUploader from './ImageUploader';
import { 
  MapPin, Plus, Edit2, Trash2, Check, X, Eye, EyeOff, Star, ShieldCheck, 
  Phone, MessageSquare, Clock, Globe, Search, Navigation, Layers, Sparkles, Building2 
} from 'lucide-react';

const DEFAULT_HOURS: WeeklyBusinessHours = {
  monday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
  tuesday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
  wednesday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
  thursday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
  friday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
  saturday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
  sunday: { isOpen: true, openTime: '09:30', closeTime: '20:30' },
};

export default function AdminBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'location' | 'contact' | 'hours' | 'services' | 'seo'>('basic');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [formState, setFormState] = useState<{
    name: string;
    slug: string;
    branchCode: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    googleMapsUrl: string;
    latitude: string;
    longitude: string;
    phone: string;
    whatsapp: string;
    email: string;
    weeklyHoliday: string;
    businessHours: WeeklyBusinessHours;
    description: string;
    imageUrl: string;
    serviceIds: string[];
    isMain: boolean;
    isFeatured: boolean;
    isActive: boolean;
    displayOrder: number;
    seoTitle: string;
    seoDescription: string;
  }>({
    name: '',
    slug: '',
    branchCode: '',
    address: '',
    city: 'Purulia',
    state: 'West Bengal',
    pincode: '723101',
    googleMapsUrl: '',
    latitude: '',
    longitude: '',
    phone: '',
    whatsapp: '',
    email: '',
    weeklyHoliday: 'None (Open All 7 Days)',
    businessHours: DEFAULT_HOURS,
    description: '',
    imageUrl: '',
    serviceIds: [],
    isMain: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 1,
    seoTitle: '',
    seoDescription: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch branches
      const { data: branchData, error: branchErr } = await supabase
        .from('branches')
        .select('*')
        .order('displayOrder', { ascending: true });

      if (branchErr) {
        console.error('Error fetching branches:', branchErr);
      } else if (branchData && branchData.length > 0) {
        const mappedBranches: Branch[] = branchData.map((b: any) => {
          const meta = b.businessHours?._meta || b.business_hours?._meta || {};
          return {
            id: b.id,
            name: b.name || '',
            slug: b.slug || b.id,
            branchCode: b.branchCode || b.branch_code || '',
            address: b.address || '',
            city: b.city || 'Purulia',
            state: b.state || 'West Bengal',
            pincode: b.pincode || '',
            googleMapsUrl: b.googleMapsUrl || b.google_maps_url || '',
            latitude: b.latitude !== null && b.latitude !== undefined ? Number(b.latitude) : undefined,
            longitude: b.longitude !== null && b.longitude !== undefined ? Number(b.longitude) : undefined,
            phone: b.phone || '',
            whatsapp: b.whatsapp || '',
            email: b.email || '',
            weeklyHoliday: meta.weeklyHoliday || 'None (Open All 7 Days)',
            businessHours: b.businessHours || b.business_hours || DEFAULT_HOURS,
            description: meta.description || '',
            imageUrl: meta.imageUrl || '/assets/images/why_choose_mobo_savior.png',
            serviceIds: meta.serviceIds || [],
            isMain: !!(b.isHeadquarters || b.is_headquarters || meta.isMain),
            isFeatured: meta.isFeatured !== undefined ? meta.isFeatured : true,
            isActive: meta.isActive !== undefined ? meta.isActive : true,
            displayOrder: b.displayOrder || b.display_order || 1,
            seoTitle: meta.seoTitle || '',
            seoDescription: meta.seoDescription || ''
          };
        });
        setBranches(mappedBranches);
      } else {
        setBranches(DEFAULT_BRANCHES);
      }

      // Fetch services for assignment
      const { data: serviceData } = await supabase
        .from('services')
        .select('*')
        .order('displayOrder', { ascending: true });

      if (serviceData) {
        setServices(serviceData as Service[]);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      setBranches(DEFAULT_BRANCHES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const emptyForm = {
    name: '',
    slug: '',
    branchCode: '',
    address: '',
    city: '',
    state: 'Jharkhand',
    pincode: '',
    googleMapsUrl: '',
    latitude: '',
    longitude: '',
    phone: '',
    whatsapp: '',
    email: '',
    weeklyHoliday: 'None (Open All 7 Days)',
    businessHours: JSON.parse(JSON.stringify(DEFAULT_HOURS)),
    description: '',
    imageUrl: '/assets/images/why_choose_mobo_savior.png',
    serviceIds: [] as string[],
    isMain: false,
    isFeatured: true,
    isActive: true,
    displayOrder: 1,
    seoTitle: '',
    seoDescription: ''
  };

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setFormState({
      ...emptyForm,
      branchCode: `MS-0${branches.length + 1}`,
      serviceIds: services.map(s => s.id),
      displayOrder: branches.length > 0 ? Math.max(...branches.map(b => b.displayOrder || 1)) + 1 : 1
    });
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormState({
      name: branch.name || '',
      slug: branch.slug || '',
      branchCode: branch.branchCode || '',
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      pincode: branch.pincode || '',
      googleMapsUrl: branch.googleMapsUrl || '',
      latitude: branch.latitude !== undefined && branch.latitude !== null ? String(branch.latitude) : '',
      longitude: branch.longitude !== undefined && branch.longitude !== null ? String(branch.longitude) : '',
      phone: branch.phone || '',
      whatsapp: branch.whatsapp || '',
      email: branch.email || '',
      weeklyHoliday: branch.weeklyHoliday || 'None (Open All 7 Days)',
      businessHours: JSON.parse(JSON.stringify(branch.businessHours || DEFAULT_HOURS)),
      description: branch.description || '',
      imageUrl: branch.imageUrl || '/assets/images/why_choose_mobo_savior.png',
      serviceIds: [...(branch.serviceIds || [])],
      isMain: !!branch.isMain,
      isFeatured: branch.isFeatured !== undefined ? branch.isFeatured : true,
      isActive: branch.isActive !== undefined ? branch.isActive : true,
      displayOrder: branch.displayOrder || 1,
      seoTitle: branch.seoTitle || '',
      seoDescription: branch.seoDescription || ''
    });
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleAutoSlug = (nameValue: string) => {
    if (!editingBranch) {
      const generatedSlug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormState((prev) => ({ ...prev, slug: generatedSlug }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.address.trim()) {
      alert('Branch Name and Address are required.');
      return;
    }

    const finalSlug = formState.slug.trim() || formState.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const isNew = !editingBranch;
    const branchId = editingBranch ? editingBranch.id : `branch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // If this branch is marked as main headquarters, remove headquarters from other branches
    if (formState.isMain) {
      for (const b of branches) {
        if (b.id !== branchId && b.isMain) {
          const otherHours = { ...(b.businessHours || {}), _meta: { ...(b.businessHours as any)?._meta, isMain: false } };
          await supabase.from('branches').update({
            isHeadquarters: false,
            is_headquarters: false,
            businessHours: otherHours,
            business_hours: otherHours
          }).eq('id', b.id);
        }
      }
    }

    const metaObj = {
      description: formState.description.trim(),
      imageUrl: formState.imageUrl.trim() || '/assets/images/why_choose_mobo_savior.png',
      weeklyHoliday: formState.weeklyHoliday.trim(),
      serviceIds: formState.serviceIds,
      isMain: !!formState.isMain,
      isFeatured: !!formState.isFeatured,
      isActive: !!formState.isActive,
      seoTitle: formState.seoTitle.trim() || `${formState.name} | MOBO SAVIOR`,
      seoDescription: formState.seoDescription.trim() || `${formState.name} - ${formState.address}, ${formState.city}`
    };

    const businessHoursWithMeta = {
      ...(typeof formState.businessHours === 'object' && formState.businessHours !== null 
        ? JSON.parse(JSON.stringify(formState.businessHours)) 
        : JSON.parse(JSON.stringify(DEFAULT_HOURS))),
      _meta: metaObj
    };

    const uniqueBranchCode = formState.branchCode.trim() || `MS-${Date.now().toString().slice(-4)}`;
    const branchPayload: any = {
      id: branchId,
      name: formState.name.trim(),
      slug: finalSlug,
      branchCode: uniqueBranchCode,
      branch_code: uniqueBranchCode,
      address: formState.address.trim(),
      city: formState.city.trim() || 'Ranchi',
      state: formState.state.trim() || 'Jharkhand',
      pincode: formState.pincode.trim() || '723101',
      googleMapsUrl: formState.googleMapsUrl.trim(),
      google_maps_url: formState.googleMapsUrl.trim(),
      latitude: formState.latitude !== '' ? parseFloat(formState.latitude) : null,
      longitude: formState.longitude !== '' ? parseFloat(formState.longitude) : null,
      phone: formState.phone.trim(),
      whatsapp: formState.whatsapp.trim(),
      email: formState.email.trim() || null,
      businessHours: businessHoursWithMeta,
      business_hours: businessHoursWithMeta,
      isHeadquarters: !!formState.isMain,
      is_headquarters: !!formState.isMain,
      displayOrder: Number(formState.displayOrder) || 1,
      display_order: Number(formState.displayOrder) || 1
    };

    try {
      if (isNew) {
        // STRICT INSERT FOR NEW BRANCH - NEVER OVERWRITE EXISTING
        const { error } = await supabase.from('branches').insert([branchPayload]);
        if (error) throw error;
      } else {
        // STRICT UPDATE ONLY TARGET BRANCH
        const { error } = await supabase.from('branches').update(branchPayload).eq('id', editingBranch.id);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingBranch(null);
      setFormState(emptyForm);
      await fetchData();
      alert(isNew ? 'New branch created successfully!' : 'Branch updated successfully!');
    } catch (err: any) {
      console.error('Failed to save branch:', err);
      alert('Error saving branch: ' + (err?.message || 'Database error'));
    }
  };

  const handleToggleActive = async (branch: Branch) => {
    try {
      const currentHours: any = branch.businessHours || {};
      const currentMeta = currentHours._meta || {};
      const updatedBusinessHours = {
        ...currentHours,
        _meta: {
          ...currentMeta,
          isActive: !branch.isActive
        }
      };
      const { error } = await supabase.from('branches').update({
        businessHours: updatedBusinessHours,
        business_hours: updatedBusinessHours
      }).eq('id', branch.id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSetMainBranch = async (targetBranch: Branch) => {
    try {
      for (const b of branches) {
        await supabase.from('branches').update({
          isHeadquarters: b.id === targetBranch.id,
          is_headquarters: b.id === targetBranch.id
        }).eq('id', b.id);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to update main branch:', err);
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (branch.isMain && branches.length > 1) {
      alert('You cannot delete the Main Branch. Set another branch as Main Branch first.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete branch "${branch.name}"?`)) {
      try {
        const { error } = await supabase.from('branches').delete().eq('id', branch.id);
        if (error) throw error;
        await fetchData();
        alert('Branch deleted successfully.');
      } catch (err: any) {
        console.error('Failed to delete branch:', err);
        alert('Failed to delete branch: ' + (err?.message || 'Database error'));
      }
    }
  };

  const handleDayHourChange = (dayKey: keyof WeeklyBusinessHours, field: keyof DayBusinessHours, value: any) => {
    setFormState((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [dayKey]: {
          ...prev.businessHours[dayKey],
          [field]: value
        }
      }
    }));
  };

  const handleToggleService = (serviceId: string) => {
    setFormState((prev) => {
      const current = prev.serviceIds || [];
      if (current.includes(serviceId)) {
        return { ...prev, serviceIds: current.filter((id) => id !== serviceId) };
      } else {
        return { ...prev, serviceIds: [...current, serviceId] };
      }
    });
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm)
  );

  const daysList: { key: keyof WeeklyBusinessHours; label: string }[] = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Branches & Locations</h2>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
              {branches.length} Location{branches.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage main headquarters and future branch store locations for MOBO SAVIOR.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Branch
        </button>
      </div>

      {/* Search & Filters */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by branch name, city, address or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Branch Cards Table / Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading branch locations...
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold">No branches found.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Add New Branch" above to create your first store location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBranches.map((branch) => {
            const statusInfo = isOpenNow(branch);
            return (
              <div
                key={branch.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                  branch.isMain ? 'border-red-500/80 ring-2 ring-red-500/10' : 'border-slate-200'
                } ${!branch.isActive ? 'opacity-60 bg-slate-50' : ''}`}
              >
                <div>
                  {/* Top Image Banner */}
                  <div className="relative h-36 bg-slate-100 overflow-hidden">
                    <img
                      src={branch.imageUrl || '/assets/images/why_choose_mobo_savior.png'}
                      alt={branch.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/why_choose_mobo_savior.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {branch.isMain && (
                        <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg shadow-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Main Branch
                        </span>
                      )}
                      {branch.isFeatured && !branch.isMain && (
                        <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg shadow">
                          Featured
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                        branch.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
                      }`}>
                        {branch.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-mono tracking-wider text-red-300 uppercase block">
                        CODE: {branch.branchCode}
                      </span>
                      <h3 className="text-base font-black truncate">{branch.name}</h3>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">{branch.address}</p>
                        <p className="text-slate-500">{branch.city}, {branch.state} {branch.pincode}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium text-slate-700 truncate">{branch.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-700 truncate">{branch.whatsapp}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Today: {statusInfo.todayHoursText}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        statusInfo.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {statusInfo.statusText}
                      </span>
                    </div>

                    {branch.serviceIds && branch.serviceIds.length > 0 ? (
                      <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        ⚡ {branch.serviceIds.length} custom service{branch.serviceIds.length === 1 ? '' : 's'} assigned
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        ✓ All MOBO SAVIOR services available
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {!branch.isMain && (
                      <button
                        onClick={() => handleSetMainBranch(branch)}
                        title="Set as Main Branch"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleActive(branch)}
                      title={branch.isActive ? 'Disable Branch' : 'Enable Branch'}
                      className={`p-1.5 rounded-lg transition ${
                        branch.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {branch.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`#/locations/${branch.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-lg"
                    >
                      View Page
                    </a>
                    <button
                      onClick={() => handleOpenEditModal(branch)}
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    {!branch.isMain && (
                      <button
                        onClick={() => handleDelete(branch)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT BRANCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-500" />
                <h3 className="font-black text-lg">
                  {editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Add New MOBO SAVIOR Branch'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBranch(null);
                  setFormState(emptyForm);
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveFormTab('basic')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition ${
                  activeFormTab === 'basic' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                1. Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('location')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition ${
                  activeFormTab === 'location' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                2. Address & Map
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('contact')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition ${
                  activeFormTab === 'contact' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                3. Contact
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('hours')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition ${
                  activeFormTab === 'hours' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                4. Business Hours
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('services')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition ${
                  activeFormTab === 'services' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                5. Services ({formState.serviceIds?.length || 'All'})
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('seo')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition ${
                  activeFormTab === 'seo' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                6. SEO
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-xs text-slate-700">
              {/* TAB 1: BASIC INFO */}
              {activeFormTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">Branch Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MOBO SAVIOR - Ranchi Branch"
                        value={formState.name}
                        onChange={(e) => {
                          setFormState({ ...formState, name: e.target.value });
                          handleAutoSlug(e.target.value);
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-900 mb-1">Branch Code / Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. MS-RAN-01"
                        value={formState.branchCode}
                        onChange={(e) => setFormState({ ...formState, branchCode: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">URL Slug</label>
                      <input
                        type="text"
                        placeholder="e.g. ranchi-branch"
                        value={formState.slug}
                        onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:border-red-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Page URL: /locations/{formState.slug || 'slug'}</p>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-900 mb-1">Display Order</label>
                      <input
                        type="number"
                        value={formState.displayOrder}
                        onChange={(e) => setFormState({ ...formState, displayOrder: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                      />
                    </div>
                  </div>

                  <ImageUploader
                    label="Branch Shopfront / Banner Photo"
                    value={formState.imageUrl}
                    onChange={(url) => setFormState({ ...formState, imageUrl: url })}
                    folder="branches"
                    helperText="Upload branch lab or store front photo from device gallery or paste image URL"
                  />

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Branch Description</label>
                    <textarea
                      rows={3}
                      placeholder="Brief overview of this branch, technicians, lab facilities..."
                      value={formState.description}
                      onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={formState.isMain}
                        onChange={(e) => setFormState({ ...formState, isMain: e.target.checked })}
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                      />
                      <span>Mark as Main Headquarters Branch</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={formState.isFeatured}
                        onChange={(e) => setFormState({ ...formState, isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                      />
                      <span>Featured Branch</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={formState.isActive}
                        onChange={(e) => setFormState({ ...formState, isActive: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Active & Visible to Public</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: ADDRESS & MAP */}
              {activeFormTab === 'location' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Room No B4, Super Market, Hattola More"
                      value={formState.address}
                      onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={formState.city}
                        onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={formState.state}
                        onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        required
                        value={formState.pincode}
                        onChange={(e) => setFormState({ ...formState, pincode: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Google Maps URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://maps.app.goo.gl/..."
                      value={formState.googleMapsUrl}
                      onChange={(e) => setFormState({ ...formState, googleMapsUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">This specific link will be used for "Get Directions" for this branch.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">Latitude (Optional for Nearest Shop)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 23.3323"
                        value={formState.latitude}
                        onChange={(e) => setFormState({ ...formState, latitude: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">Longitude (Optional for Nearest Shop)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 86.3652"
                        value={formState.longitude}
                        onChange={(e) => setFormState({ ...formState, longitude: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTACT */}
              {activeFormTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">Branch Phone Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="081675 49092"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Direct call button will dial this number.</p>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-900 mb-1">Branch WhatsApp Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="081675 49092"
                        value={formState.whatsapp}
                        onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">WhatsApp chat button will open chat with this number.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Branch Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="branch@mobosavior.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: BUSINESS HOURS */}
              {activeFormTab === 'hours' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Weekly Holiday Notice</label>
                    <input
                      type="text"
                      placeholder="e.g. Sunday or None (Open All 7 Days)"
                      value={formState.weeklyHoliday}
                      onChange={(e) => setFormState({ ...formState, weeklyHoliday: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-3">Daily Opening & Closing Schedule</p>

                    <div className="space-y-2">
                      {daysList.map(({ key, label }) => {
                        const dayData = formState.businessHours?.[key] || { isOpen: true, openTime: '09:30', closeTime: '20:30' };
                        return (
                          <div key={key} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                            <label className="flex items-center gap-2 font-bold text-slate-900 w-28 shrink-0 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={dayData.isOpen}
                                onChange={(e) => handleDayHourChange(key, 'isOpen', e.target.checked)}
                                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                              />
                              <span>{label}</span>
                            </label>

                            {dayData.isOpen ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={dayData.openTime}
                                  onChange={(e) => handleDayHourChange(key, 'openTime', e.target.value)}
                                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                                />
                                <span className="text-slate-400">to</span>
                                <input
                                  type="time"
                                  value={dayData.closeTime}
                                  onChange={(e) => handleDayHourChange(key, 'closeTime', e.target.value)}
                                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                                />
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 italic">CLOSED</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SERVICES */}
              {activeFormTab === 'services' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Services Offered at This Branch</p>
                      <p className="text-[11px] text-slate-500">
                        Select specific services available at this branch. If no services are checked, all services will be available by default.
                      </p>
                    </div>

                    {formState.serviceIds?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, serviceIds: [] })}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg"
                      >
                        Select All Services
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                    {services.map((srv) => {
                      const isSelected = formState.serviceIds?.includes(srv.id);
                      return (
                        <label
                          key={srv.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                            isSelected ? 'bg-red-50 border-red-300 text-red-950 font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleService(srv.id)}
                            className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                          />
                          <div className="truncate">
                            <span className="block truncate">{srv.name}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">{srv.category}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: SEO */}
              {activeFormTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">SEO Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Mobile Repair Shop in Ranchi | MOBO SAVIOR"
                      value={formState.seoTitle}
                      onChange={(e) => setFormState({ ...formState, seoTitle: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Meta Description</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. MOBO SAVIOR Ranchi branch - specialist iPhone & Android micro-soldering..."
                      value={formState.seoDescription}
                      onChange={(e) => setFormState({ ...formState, seoDescription: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBranch(null);
                    setFormState(emptyForm);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {activeFormTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: ('basic' | 'location' | 'contact' | 'hours' | 'services' | 'seo')[] = [
                          'basic', 'location', 'contact', 'hours', 'services', 'seo'
                        ];
                        const idx = tabs.indexOf(activeFormTab);
                        if (idx > 0) setActiveFormTab(tabs[idx - 1]);
                      }}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl"
                    >
                      Previous Step
                    </button>
                  )}

                  {activeFormTab !== 'seo' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: ('basic' | 'location' | 'contact' | 'hours' | 'services' | 'seo')[] = [
                          'basic', 'location', 'contact', 'hours', 'services', 'seo'
                        ];
                        const idx = tabs.indexOf(activeFormTab);
                        if (idx < tabs.length - 1) setActiveFormTab(tabs[idx + 1]);
                      }}
                      className="px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                    >
                      Next Step
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    {editingBranch ? 'Update Branch' : 'Save New Branch'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
