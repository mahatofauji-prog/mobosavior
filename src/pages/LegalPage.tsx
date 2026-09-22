import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from '../lib/supabase';
import { db } from '../lib/supabase';
import { LegalPage as LegalPageType, LegalSection } from '../types';
import { Shield, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SEOHead from '../components/SEOHead';
import { DEFAULT_TERMS_PAGE, DEFAULT_TERMS_SECTIONS, DEFAULT_PRIVACY_PAGE, DEFAULT_PRIVACY_SECTIONS } from '../data/defaultLegalData';

interface LegalPageProps {
  pageType: 'privacy-policy' | 'terms-conditions';
}

export default function LegalPage({ pageType }: LegalPageProps) {
  const [page, setPage] = useState<LegalPageType | null>(null);
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const defaultPage = pageType === 'terms-conditions' ? DEFAULT_TERMS_PAGE : DEFAULT_PRIVACY_PAGE;
      const defaultSecs = pageType === 'terms-conditions' ? DEFAULT_TERMS_SECTIONS : DEFAULT_PRIVACY_SECTIONS;

      try {
        const qPage = query(collection(db, 'legal_pages'), where('pageType', '==', pageType));
        const pageSnap = await getDocs(qPage);
        const activeDocs = pageSnap.docs.filter(d => d.data().isPublished !== false);
        
        if (activeDocs.length > 0) {
          const pageData = { id: activeDocs[0].id, ...activeDocs[0].data() } as LegalPageType;
          setPage(pageData);

          // Fetch Sections
          const qSec = query(collection(db, 'legal_sections'), where('pageId', '==', pageData.id));
          const secSnap = await getDocs(qSec);
          const fetchedSections: LegalSection[] = [];
          secSnap.forEach(d => {
            const data = d.data() as LegalSection;
            if (data.isActive !== false) {
              fetchedSections.push({ id: d.id, ...data });
            }
          });
          
          if (fetchedSections.length > 0) {
            fetchedSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setSections(fetchedSections);
          } else {
            setSections(defaultSecs);
          }
        } else {
          setPage(defaultPage);
          setSections(defaultSecs);
        }
      } catch (error) {
        console.error('Error fetching legal page, using defaults:', error);
        setPage(defaultPage);
        setSections(defaultSecs);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [pageType]);

  const Icon = pageType === 'privacy-policy' ? Shield : FileText;

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4">
      {page && (
        <SEOHead 
          title={page.seoTitle || `${page.title} | MOBO SAVIOR`} 
          description={page.metaDescription} 
        />
      )}

      <main className="max-w-4xl mx-auto">
        {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-[#0284C7] animate-spin" />
            </div>
          ) : page ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 px-6 py-12 md:px-12 text-center text-white">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Icon className="w-8 h-8 text-sky-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black font-playfair tracking-tight mb-4">
                  {page.title}
                </h1>
                <p className="text-sky-200/80 text-sm max-w-2xl mx-auto">
                  Last updated: {new Date(page.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="p-6 md:p-12">
                {sections.length > 0 ? (
                  <div className="space-y-12">
                    {sections.map((section) => (
                      <section key={section.id} className="scroll-mt-24">
                        {section.heading && (
                          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 tracking-tight">
                            {section.heading}
                          </h2>
                        )}
                        <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-600 leading-relaxed prose-headings:font-bold prose-headings:text-slate-800 prose-a:text-[#0284C7] hover:prose-a:text-[#0369A1] prose-strong:text-slate-800">
                          <ReactMarkdown>{section.content}</ReactMarkdown>
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-10">This page has no content currently available.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <Icon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-800 mb-2">Page Not Found</h2>
              <p className="text-slate-500">The requested legal document is currently unavailable or unpublished.</p>
            </div>
          )}
      </main>
    </div>
  );
}
