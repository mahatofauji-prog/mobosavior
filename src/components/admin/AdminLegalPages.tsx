import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LegalPage, LegalSection } from '../../types';
import { FileText, Save, Plus, Edit, Trash2, GripVertical, Check, X, Shield, RefreshCw } from 'lucide-react';
import { DEFAULT_TERMS_PAGE, DEFAULT_TERMS_SECTIONS, DEFAULT_PRIVACY_PAGE, DEFAULT_PRIVACY_SECTIONS } from '../../data/defaultLegalData';

// A simple toolbar component that wraps selected text in a textarea
const TextEditorToolbar = ({ textareaId }: { textareaId: string }) => {
  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = `${prefix}${selectedText}${suffix}`;

    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    
    // Set selection back
    textarea.selectionStart = start + prefix.length;
    textarea.selectionEnd = end + prefix.length;
    
    textarea.focus();
    // Dispatch an input event so React state updates
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const insertList = (ordered: boolean) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const lines = selectedText.split('\n');
    const replacement = lines.map((line, index) => `${ordered ? `${index + 1}. ` : '- '}${line}`).join('\n');

    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.selectionStart = start;
    textarea.selectionEnd = start + replacement.length;
    textarea.focus();
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const insertLink = () => {
    const url = prompt('Enter link URL:', 'https://');
    if (url) {
      insertFormatting('[', `](${url})`);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 rounded-t-xl border-b border-slate-200">
      <button type="button" onClick={() => insertFormatting('**')} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-xs font-bold text-slate-700">Bold</button>
      <button type="button" onClick={() => insertFormatting('*')} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-xs italic text-slate-700">Italic</button>
      <div className="w-px h-4 bg-slate-300 mx-1"></div>
      <button type="button" onClick={() => insertFormatting('## ', '')} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-xs font-bold text-slate-700">Heading 2</button>
      <button type="button" onClick={() => insertFormatting('### ', '')} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-xs font-bold text-slate-700">Heading 3</button>
      <div className="w-px h-4 bg-slate-300 mx-1"></div>
      <button type="button" onClick={() => insertList(false)} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-xs font-bold text-slate-700">Bullet List</button>
      <button type="button" onClick={() => insertList(true)} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-xs font-bold text-slate-700">Numbered List</button>
      <div className="w-px h-4 bg-slate-300 mx-1"></div>
      <button type="button" onClick={insertLink} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-xs font-bold text-slate-700">Link</button>
    </div>
  );
};

export default function AdminLegalPages() {
  const [activeTab, setActiveTab] = useState<'privacy-policy' | 'terms-conditions'>('privacy-policy');
  
  const [page, setPage] = useState<LegalPage | null>(null);
  const [sections, setSections] = useState<LegalSection[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Section Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<LegalSection | null>(null);
  const [secHeading, setSecHeading] = useState('');
  const [secContent, setSecContent] = useState('');
  const [secActive, setSecActive] = useState(true);

  const fetchPageAndSections = async (pageType: 'privacy-policy' | 'terms-conditions') => {
    setLoading(true);
    try {
      // 1. Fetch Page
      let pageData: LegalPage | null = null;
      const { data: pageRows } = await supabase
        .from('legal_pages')
        .select('*')
        .eq('pageType', pageType);
      
      if (pageRows && pageRows.length > 0) {
        pageData = pageRows[0] as LegalPage;
      } else {
        // Initialize default
        const newId = `legal_${pageType}`;
        const defaultTitle = pageType === 'privacy-policy' ? 'Privacy Policy' : 'Terms & Conditions';
        pageData = {
          id: newId,
          pageType: pageType,
          title: defaultTitle,
          slug: pageType,
          seoTitle: `${defaultTitle} | MOBO SAVIOR`,
          metaDescription: `Read the ${defaultTitle} for MOBO SAVIOR.`,
          isPublished: true,
          updatedAt: new Date().toISOString()
        };
        await supabase.from('legal_pages').upsert(pageData);
      }
      
      setPage(pageData);
      setSeoTitle(pageData.seoTitle);
      setMetaDescription(pageData.metaDescription);
      setIsPublished(pageData.isPublished);

      // 2. Fetch Sections
      const { data: secRows } = await supabase
        .from('legal_sections')
        .select('*')
        .eq('pageId', pageData.id)
        .order('displayOrder', { ascending: true });

      const fetchedSections: LegalSection[] = (secRows as LegalSection[]) || [];

      if (fetchedSections.length === 0) {
        const defaultSecs = pageType === 'terms-conditions' ? DEFAULT_TERMS_SECTIONS : DEFAULT_PRIVACY_SECTIONS;
        for (const sec of defaultSecs) {
          const secWithPageId: any = { 
            ...sec, 
            pageId: pageData.id,
            page_id: pageData.id,
            display_order: sec.displayOrder,
            is_active: sec.isActive
          };
          await supabase.from('legal_sections').upsert(secWithPageId);
          fetchedSections.push(secWithPageId);
        }
      }

      fetchedSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setSections(fetchedSections);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageAndSections(activeTab);
  }, [activeTab]);

  const handleSavePageSettings = async () => {
    if (!page) return;
    setSaveLoading(true);
    try {
      const updatedPage: any = {
        ...page,
        seoTitle,
        seo_title: seoTitle,
        metaDescription,
        meta_description: metaDescription,
        isPublished,
        is_published: isPublished,
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('legal_pages').upsert(updatedPage);
      if (error) throw error;
      setPage(updatedPage);
      alert('Page settings saved successfully.');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save page settings: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOpenModal = (sec?: LegalSection) => {
    if (sec) {
      setEditingSection(sec);
      setSecHeading(sec.heading);
      setSecContent(sec.content);
      setSecActive(sec.isActive);
    } else {
      setEditingSection(null);
      setSecHeading('');
      setSecContent('');
      setSecActive(true);
    }
    setModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;
    setSaveLoading(true);

    try {
      const secId = editingSection?.id || `sec_${Date.now()}`;
      const newSec: any = {
        id: secId,
        pageId: page.id,
        page_id: page.id,
        heading: secHeading,
        content: secContent,
        isActive: secActive,
        is_active: secActive,
        displayOrder: editingSection?.displayOrder ?? (sections.length + 1),
        display_order: editingSection?.displayOrder ?? (sections.length + 1),
        createdAt: editingSection?.createdAt || new Date().toISOString(),
        created_at: editingSection?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('legal_sections').upsert(newSec);
      if (error) throw error;

      setModalOpen(false);
      await fetchPageAndSections(activeTab);
      alert('Section saved successfully.');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save section: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      const { error } = await supabase.from('legal_sections').delete().eq('id', id);
      if (error) throw error;
      await fetchPageAndSections(activeTab);
      alert('Section deleted successfully.');
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete section: ' + (err?.message || 'Database error'));
    }
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const itemA = sections[index];
    const itemB = sections[swapIndex];

    const tempOrder = itemA.displayOrder;
    itemA.displayOrder = itemB.displayOrder === tempOrder ? tempOrder + 1 : itemB.displayOrder;
    itemB.displayOrder = tempOrder;

    try {
      await supabase.from('legal_sections').update({ displayOrder: itemA.displayOrder, display_order: itemA.displayOrder }).eq('id', itemA.id);
      await supabase.from('legal_sections').update({ displayOrder: itemB.displayOrder, display_order: itemB.displayOrder }).eq('id', itemB.id);
      fetchPageAndSections(activeTab);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('privacy-policy')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl flex items-center gap-2 transition-colors ${
            activeTab === 'privacy-policy' ? 'bg-[#0284C7] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" /> Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms-conditions')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl flex items-center gap-2 transition-colors ${
            activeTab === 'terms-conditions' ? 'bg-[#0284C7] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Terms & Conditions
        </button>
      </div>

      {loading && !page ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0284C7]" />
          <p className="text-sm font-bold">Loading Legal Content...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Page Settings */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Page Settings</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Page Status</label>
                <select
                  value={isPublished ? 'true' : 'false'}
                  onChange={(e) => setIsPublished(e.target.value === 'true')}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-bold"
                >
                  <option value="true">Published (Visible)</option>
                  <option value="false">Draft (Hidden)</option>
                </select>
              </div>
              
              {page?.updatedAt && (
                <div className="text-[10px] text-slate-400 font-medium">
                  Last updated: {new Date(page.updatedAt).toLocaleString()}
                </div>
              )}

              <button
                onClick={handleSavePageSettings}
                disabled={saveLoading}
                className="w-full px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Page Settings
              </button>
            </div>
          </div>

          {/* Right Column: Sections Management */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Content Sections</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Manage the sections and paragraphs of your {page?.title}.</p>
                </div>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-[#0284C7] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </button>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-bold">
                  No content sections yet. Click "Add Section" to start building your page.
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((sec, index) => (
                    <div 
                      key={sec.id}
                      className={`flex items-start justify-between p-4 rounded-xl border transition-colors ${
                        sec.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 mt-1">
                          <button onClick={() => handleMoveSection(index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-sky-500 disabled:opacity-30">▲</button>
                          <GripVertical className="w-4 h-4 text-slate-300" />
                          <button onClick={() => handleMoveSection(index, 'down')} disabled={index === sections.length - 1} className="text-slate-300 hover:text-sky-500 disabled:opacity-30">▼</button>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-black text-slate-900">{sec.heading || '(No Heading)'}</h5>
                            {!sec.isActive && (
                              <span className="bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Hidden</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {sec.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleOpenModal(sec)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl relative max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {editingSection ? 'Edit Content Section' : 'Add New Content Section'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded hover:bg-slate-50 text-slate-400">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Section Heading (Optional)</label>
                <input
                  type="text"
                  value={secHeading}
                  onChange={(e) => setSecHeading(e.target.value)}
                  placeholder="e.g., Information We Collect"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Body Content</label>
                <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#0284C7] focus-within:ring-1 focus-within:ring-[#0284C7]">
                  <TextEditorToolbar textareaId="legal_content_editor" />
                  <textarea
                    id="legal_content_editor"
                    required
                    value={secContent}
                    onChange={(e) => setSecContent(e.target.value)}
                    rows={12}
                    className="w-full px-3.5 py-3 text-xs leading-relaxed outline-none"
                    placeholder="Type your content here... Use the toolbar above for formatting."
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Markdown formatting is supported. Use the toolbar or standard Markdown syntax.
                </p>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Status</label>
                <select
                  value={secActive ? 'true' : 'false'}
                  onChange={(e) => setSecActive(e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="true">Active (Published)</option>
                  <option value="false">Hidden (Draft)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {saveLoading ? 'Saving...' : 'Save Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
