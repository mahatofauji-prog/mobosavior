import React, { useState, useEffect, FormEvent } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from '../../lib/supabase';
import { db } from '../../lib/supabase';
import { TrustPoint } from '../../types';
import { renderTrustIcon, POPULAR_TRUST_ICONS } from '../../utils/offerHelpers';
import { DEFAULT_TRUST_POINTS } from '../../lib/seed';
import ImageUploader from './ImageUploader';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  X, 
  Sparkles, 
  ImageIcon, 
  Settings, 
  Save, 
  TrendingUp, 
  MessageSquare,
  Wrench
} from 'lucide-react';

export default function AdminTrustSection() {
  const [trustPoints, setTrustPoints] = useState<TrustPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<TrustPoint | null>(null);

  // Trust point single card item form
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    icon: 'Wrench',
    imageUrl: '',
    isFeatured: true,
    isActive: true,
    displayOrder: 1
  });

  // Global Section Level Content Config State
  const [configState, setConfigState] = useState({
    sectionHeading: 'WHY CHOOSE MOBO SAVIOR?',
    sectionLabel: 'THE MOBO SAVIOR ADVANTAGE',
    sectionDescription: 'Professional mobile repair backed by advanced diagnostic equipment, skilled technicians, quality-focused parts and transparent service.',
    mainImageUrl: '/assets/images/why_choose_mobo_savior.png',
    highlightItems: 'Advanced Diagnostics, Chip-Level Repair, Quality-Focused Parts, Transparent Service',
    ctaHeading: 'Need a Professional Diagnosis?',
    ctaDescription: 'Bring your device to MOBO SAVIOR for proper inspection and repair guidance.',
    ctaBookText: 'Book a Repair',
    ctaWhatsappText: 'WhatsApp Now',
    showStats: false,
    statRepairsCompleted: '',
    statYearsExperience: '',
    statServicesAvailable: '',
    statCustomerReviews: ''
  });

  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchTrustPoints();
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const configDocRef = doc(db, 'settings', 'trust_config');
      const configSnap = await getDoc(configDocRef);
      if (configSnap.exists()) {
        const data = configSnap.data();
        setConfigState({
          sectionHeading: data.sectionHeading || 'WHY CHOOSE MOBO SAVIOR?',
          sectionLabel: data.sectionLabel || 'THE MOBO SAVIOR ADVANTAGE',
          sectionDescription: data.sectionDescription || 'Professional mobile repair backed by advanced diagnostic equipment, skilled technicians, quality-focused parts and transparent service.',
          mainImageUrl: data.mainImageUrl || '/assets/images/service_motherboard_1788169670691.jpg',
          highlightItems: Array.isArray(data.highlightItems) ? data.highlightItems.join(', ') : 'Advanced Diagnostics, Chip-Level Repair, Quality-Focused Parts, Transparent Service',
          ctaHeading: data.ctaHeading || 'Need a Professional Diagnosis?',
          ctaDescription: data.ctaDescription || 'Bring your device to MOBO SAVIOR for proper inspection and repair guidance.',
          ctaBookText: data.ctaBookText || 'Book a Repair',
          ctaWhatsappText: data.ctaWhatsappText || 'WhatsApp Now',
          showStats: data.showStats || false,
          statRepairsCompleted: data.statRepairsCompleted || '',
          statYearsExperience: data.statYearsExperience || '',
          statServicesAvailable: data.statServicesAvailable || '',
          statCustomerReviews: data.statCustomerReviews || ''
        });
      }
    } catch (err) {
      console.error('Error fetching global trust configuration:', err);
    }
  }

  async function fetchTrustPoints() {
    setLoading(true);
    try {
      const q = query(collection(db, 'trust_points'), orderBy('displayOrder', 'asc'));
      const snap = await getDocs(q);
      const fetched: TrustPoint[] = [];
      snap.forEach(docSnap => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as TrustPoint);
      });
      if (fetched.length > 0) {
        const missingDefaults = DEFAULT_TRUST_POINTS.filter(
          def => !fetched.some(f => f.id === def.id || f.title.toLowerCase() === def.title.toLowerCase())
        );
        setTrustPoints([...fetched, ...missingDefaults]);
      } else {
        setTrustPoints(DEFAULT_TRUST_POINTS);
      }
    } catch (err) {
      console.error('Error fetching trust points for admin:', err);
      setTrustPoints(DEFAULT_TRUST_POINTS);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenNew = () => {
    setEditingPoint(null);
    setFormState({
      title: '',
      description: '',
      icon: 'Wrench',
      imageUrl: '',
      isFeatured: true,
      isActive: true,
      displayOrder: trustPoints.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tp: TrustPoint) => {
    setEditingPoint(tp);
    setFormState({
      title: tp.title || '',
      description: tp.description || '',
      icon: tp.icon || 'Wrench',
      imageUrl: tp.imageUrl || '',
      isFeatured: tp.isFeatured !== false,
      isActive: tp.isActive !== false,
      displayOrder: tp.displayOrder || 1
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) return alert('Please enter a title.');

    try {
      const id = editingPoint ? editingPoint.id : `tp-${Date.now()}`;
      const data: TrustPoint = {
        id,
        title: formState.title.trim(),
        description: formState.description.trim(),
        icon: formState.icon,
        imageUrl: formState.imageUrl.trim(),
        isFeatured: formState.isFeatured,
        isActive: formState.isActive,
        displayOrder: Number(formState.displayOrder) || 1
      };

      await setDoc(doc(db, 'trust_points', id), data);

      setIsModalOpen(false);
      fetchTrustPoints();
      alert(`Trust point ${editingPoint ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error('Error saving trust point:', err);
      alert('Failed to save trust point.');
    }
  };

  const handleSaveGlobalConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const itemsArr = configState.highlightItems
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const dataToSave = {
        sectionHeading: configState.sectionHeading.trim(),
        sectionLabel: configState.sectionLabel.trim(),
        sectionDescription: configState.sectionDescription.trim(),
        mainImageUrl: configState.mainImageUrl.trim(),
        highlightItems: itemsArr,
        ctaHeading: configState.ctaHeading.trim(),
        ctaDescription: configState.ctaDescription.trim(),
        ctaBookText: configState.ctaBookText.trim(),
        ctaWhatsappText: configState.ctaWhatsappText.trim(),
        showStats: configState.showStats,
        statRepairsCompleted: configState.statRepairsCompleted.trim(),
        statYearsExperience: configState.statYearsExperience.trim(),
        statServicesAvailable: configState.statServicesAvailable.trim(),
        statCustomerReviews: configState.statCustomerReviews.trim()
      };

      await setDoc(doc(db, 'settings', 'trust_config'), dataToSave);
      alert('Global section content configuration saved successfully!');
    } catch (err) {
      console.error('Error saving global section content config:', err);
      alert('Failed to save configuration settings.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trust point?')) return;
    try {
      await deleteDoc(doc(db, 'trust_points', id));
      fetchTrustPoints();
    } catch (err) {
      console.error('Error deleting trust point:', err);
    }
  };

  const handleToggleActive = async (tp: TrustPoint) => {
    try {
      await updateDoc(doc(db, 'trust_points', tp.id), {
        isActive: !tp.isActive
      });
      fetchTrustPoints();
    } catch (err) {
      console.error('Error toggling active state:', err);
    }
  };

  return (
    <div className="space-y-10 text-left">
      
      {/* 1. HEADER BRAND BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0284C7]" />
            <h2 className="text-xl font-black text-slate-900 font-sans">Why Choose MOBO SAVIOR Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage section copy, technical laboratory images, dynamic marketing stats, and visual trust items.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold rounded-xl shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trust Point Card</span>
        </button>
      </div>

      {/* 2. SECTION CONFIGURATION SETTINGS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings className="w-4 h-4 text-[#0284C7]" />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-sans">
            Section Copy, Images & CTA Configuration
          </h3>
        </div>

        <form onSubmit={handleSaveGlobalConfig} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-bold text-slate-700">
          
          {/* LEFT SUB-GRID: Texts */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label>Section Header Label (Eyebrow)</label>
                <input
                  type="text"
                  value={configState.sectionLabel}
                  onChange={(e) => setConfigState({ ...configState, sectionLabel: e.target.value })}
                  placeholder="e.g. THE MOBO SAVIOR ADVANTAGE"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label>Section Main Title</label>
                <input
                  type="text"
                  value={configState.sectionHeading}
                  onChange={(e) => setConfigState({ ...configState, sectionHeading: e.target.value })}
                  placeholder="e.g. WHY CHOOSE MOBO SAVIOR?"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label>Section Sub-Header Description</label>
              <textarea
                rows={3}
                value={configState.sectionDescription}
                onChange={(e) => setConfigState({ ...configState, sectionDescription: e.target.value })}
                placeholder="Brief technical narrative why MOBO SAVIOR stands out..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
              />
            </div>

            <div className="space-y-4">
              <ImageUploader
                label="Main Laboratory Showcase Image"
                value={configState.mainImageUrl}
                onChange={(url) => setConfigState({ ...configState, mainImageUrl: url })}
                folder="trust"
                helperText="Main photo displayed on WHY CHOOSE MOBO SAVIOR section"
              />
              <div className="space-y-1">
                <label>Horizontal Highlights Strip (Comma Separated)</label>
                <input
                  type="text"
                  value={configState.highlightItems}
                  onChange={(e) => setConfigState({ ...configState, highlightItems: e.target.value })}
                  placeholder="Adv. Diagnostics, Chip-Level Repair, Quality Parts, Clear Pricing"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>
            </div>

            {/* CTA Fields */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">
                Call To Action (CTA) Box
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>CTA Heading</label>
                  <input
                    type="text"
                    value={configState.ctaHeading}
                    onChange={(e) => setConfigState({ ...configState, ctaHeading: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label>CTA Description text</label>
                  <input
                    type="text"
                    value={configState.ctaDescription}
                    onChange={(e) => setConfigState({ ...configState, ctaDescription: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>CTA Booking Button text</label>
                  <input
                    type="text"
                    value={configState.ctaBookText}
                    onChange={(e) => setConfigState({ ...configState, ctaBookText: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label>CTA WhatsApp Button text</label>
                  <input
                    type="text"
                    value={configState.ctaWhatsappText}
                    onChange={(e) => setConfigState({ ...configState, ctaWhatsappText: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SUB-GRID: Statistics Panel */}
          <div className="space-y-4 border-l border-slate-150/60 lg:pl-6">
            <div className="flex items-center justify-between pb-2">
              <div className="space-y-0.5">
                <span className="text-slate-800 block text-xs font-black">Dynamic Lab Verified Statistics</span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Numbers will only be shown if checkmark is toggled and numbers exist.
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <input
                  type="checkbox"
                  checked={configState.showStats}
                  onChange={(e) => setConfigState({ ...configState, showStats: e.target.checked })}
                  className="w-4 h-4 text-[#0284C7] rounded"
                />
                <span>Show Stats</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label>Repairs Completed (e.g., 5,000+)</label>
                <input
                  type="text"
                  disabled={!configState.showStats}
                  value={configState.statRepairsCompleted}
                  onChange={(e) => setConfigState({ ...configState, statRepairsCompleted: e.target.value })}
                  placeholder="e.g. 5,000+"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label>Years of Experience (e.g., 8+ Years)</label>
                <input
                  type="text"
                  disabled={!configState.showStats}
                  value={configState.statYearsExperience}
                  onChange={(e) => setConfigState({ ...configState, statYearsExperience: e.target.value })}
                  placeholder="e.g. 8+ Years"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label>Services Offered (e.g., 25+)</label>
                <input
                  type="text"
                  disabled={!configState.showStats}
                  value={configState.statServicesAvailable}
                  onChange={(e) => setConfigState({ ...configState, statServicesAvailable: e.target.value })}
                  placeholder="e.g. 25+"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label>5-Star Reviews (e.g., 1,200+)</label>
                <input
                  type="text"
                  disabled={!configState.showStats}
                  value={configState.statCustomerReviews}
                  onChange={(e) => setConfigState({ ...configState, statCustomerReviews: e.target.value })}
                  placeholder="e.g. 1,200+"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingConfig}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? 'Saving settings...' : 'Save Global Settings'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* 3. GRID OF CUSTOM TRUST POINTS (CARDS) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Wrench className="w-4 h-4 text-[#0284C7]" />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-sans">
            Active Advantage Feature Points ({trustPoints.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading trust points...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustPoints.map((tp) => (
              <div
                key={tp.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                  tp.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center border border-sky-100 text-[#0284C7]">
                      {renderTrustIcon(tp.icon)}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm font-sans">{tp.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-3">{tp.description}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(tp)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                      tp.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tp.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {tp.isActive ? 'Active' : 'Disabled'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(tp)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                      title="Edit Trust Point"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tp.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                      title="Delete Trust Point"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FORM MODAL FOR TRUST POINTS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 font-sans">
                {editingPoint ? 'Edit Trust Point Point' : 'Add Trust Point Point'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="space-y-1">
                <label>Title *</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. Experienced Technician"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label>Short Description *</label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="e.g. Skilled technicians handle detailed mobile diagnosis..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label>Select Icon</label>
                <select
                  value={formState.icon}
                  onChange={(e) => setFormState({ ...formState, icon: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                >
                  {POPULAR_TRUST_ICONS.map((icon) => (
                    <option key={icon.key} value={icon.key}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>

              <ImageUploader
                label="Trust Item Icon / Photo"
                value={formState.imageUrl}
                onChange={(url) => setFormState({ ...formState, imageUrl: url })}
                folder="trust"
                helperText="Upload custom badge image or select icon above"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={formState.displayOrder}
                    onChange={(e) => setFormState({ ...formState, displayOrder: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.isActive}
                      onChange={(e) => setFormState({ ...formState, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#0284C7] rounded"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold rounded-xl shadow"
                >
                  Save Trust Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
