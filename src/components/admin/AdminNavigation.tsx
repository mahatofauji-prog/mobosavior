import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { NavigationItem } from '../../types';
import { Plus, Edit, Trash2, Save, X, Layers, Loader2, GripVertical, Check } from 'lucide-react';
import ImageUploader from './ImageUploader';

export default function AdminNavigation() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  const fetchNavItems = async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('navigation_items')
        .select('*')
        .order('displayOrder', { ascending: true });

      if (fetchErr) {
        console.error('Error fetching navigation items:', fetchErr);
      } else if (data) {
        setItems(data as NavigationItem[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavItems();
  }, []);

  const handleEdit = (item: NavigationItem) => {
    setEditingItem(item);
    setLabel(item.label);
    setUrl(item.url);
    setDisplayOrder(item.displayOrder);
    setActive(item.active);
    setImageUrl(item.imageUrl || '');
    setError('');
    setSuccess('');
  };

  const handleReset = () => {
    setEditingItem(null);
    setLabel('');
    setUrl('');
    setDisplayOrder(items.length + 1);
    setActive(true);
    setImageUrl('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this menu link?')) return;
    try {
      const { error: delErr } = await supabase.from('navigation_items').delete().eq('id', id);
      if (delErr) throw delErr;
      setSuccess('Menu link deleted successfully!');
      fetchNavItems();
    } catch (err: any) {
      console.error(err);
      setError('Failed to delete item: ' + (err?.message || 'Database error'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !url) {
      setError('Label and URL are required.');
      return;
    }

    setSaveLoading(true);
    setError('');
    setSuccess('');

    const itemId = editingItem?.id || `nav-${Date.now()}`;
    const payload: any = {
      id: itemId,
      label,
      url,
      displayOrder: Number(displayOrder) || 0,
      display_order: Number(displayOrder) || 0,
      active,
      is_active: active,
      imageUrl: imageUrl || null,
      image_url: imageUrl || null
    };

    try {
      const { error: saveErr } = await supabase.from('navigation_items').upsert(payload);
      if (saveErr) throw saveErr;
      setSuccess('Navigation menu item saved successfully!');
      handleReset();
      await fetchNavItems();
    } catch (err: any) {
      console.error(err);
      setError('Failed to save navigation item: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Form: Add/Edit Menu item */}
      <div className="lg:col-span-4 space-y-4">
        <form onSubmit={handleSave} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0284C7]" />
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Link custom landing pages to the primary navigation menu.</p>
          </div>

          {error && <p className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg">✕ {error}</p>}
          {success && <p className="text-xs font-bold text-emerald-500 bg-emerald-50 p-2 rounded-lg">✓ {success}</p>}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Link Text (Label)</label>
            <input
              type="text"
              required
              placeholder="e.g., iPhone Offers"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Destination URL or slug</label>
            <input
              type="text"
              required
              placeholder="e.g., offers or about or /blog/my-post"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Menu Icon/Image (Optional)</label>
            <ImageUploader 
              label="Menu Icon" 
              value={imageUrl} 
              onChange={setImageUrl} 
              folder="navigation_icons"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Active State</label>
              <select
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-bold"
              >
                <option value="true">Active (Visible)</option>
                <option value="false">Hidden (Disabled)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            {editingItem && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saveLoading}
              className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1"
            >
              <Save className="w-4 h-4" /> Save Link
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Menu Hierarchy display */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Active Navigation Menu Tree</h4>
            <p className="text-[10px] text-slate-400 font-medium">Drag-and-drop or modify the display order numbers below to sort links left-to-right.</p>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#0284C7]" />
              <p className="text-xs">Loading menu tree...</p>
            </div>
          ) : items.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400 font-bold">No custom menu links yet. Using website defaults.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                    item.active ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-100/40 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-400">#{item.displayOrder}</span>
                    <div>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                        {item.label}
                        {!item.active && (
                          <span className="bg-slate-200 text-slate-600 text-[8px] px-1.5 py-0.2 rounded font-bold uppercase">Hidden</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-sky-600 font-bold">URL Slug: {item.url}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Menu Link"
                    >
                      <Edit className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
