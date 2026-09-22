import { useState, useEffect } from 'react';
import { Page, PageSection, ContactSettings } from '../types';
import { collection, query, where, getDocs, limit } from '../lib/supabase';
import { db } from '../lib/supabase';
import { handleFirestoreError, OperationType } from '../lib/errors';
import { ChevronLeft, Calendar, Loader2, ArrowRight, MessageSquare, PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';
import SEOHead from '../components/SEOHead';
import { trackWhatsAppClick } from '../lib/analytics';

interface PageDetailProps {
  onNavigate: (route: string) => void;
  slug: string;
  contact: ContactSettings;
}

export default function PageDetail({ onNavigate, slug, contact }: PageDetailProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPageBySlug = async () => {
      setLoading(true);
      setError('');
      try {
        const pagesRef = collection(db, 'pages');
        const q = query(pagesRef, where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const pageData = { id: docSnap.id, ...docSnap.data() } as Page;
          
          // Only show published pages unless the user is previewing (for simplicity, we display if published)
          if (pageData.status === 'Published') {
            setPage(pageData);
          } else {
            setError('This page is currently a draft or unpublished.');
          }
        } else {
          setError('Page not found.');
        }
      } catch (err) {
        console.error('Error loading page:', err);
        setError('Failed to load page content.');
        handleFirestoreError(err, OperationType.GET, `pages/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPageBySlug();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 select-none text-slate-700">
        <Loader2 className="w-8 h-8 text-[#0284C7] animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading page content...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Oops!</h1>
        <p className="text-xs text-slate-500 font-medium">{error || 'The page you requested is not available.'}</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Helper to parse lists
  const renderListItems = (content: string) => {
    if (!content) return [];
    return content.split('\n').map(item => item.trim()).filter(Boolean);
  };

  const handleWhatsappCTA = () => {
    trackWhatsAppClick({ source: 'Page CTA' });
    const text = `Hello MOBO SAVIOR, I am on your page "${page.title}" and would like to ask some questions!`;
    window.open(`https://wa.me/91${contact.whatsapp.replace(/\s+/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <article className="min-h-screen bg-slate-50/30 pb-20">
      {/* Dynamic SEO Header */}
      <SEOHead 
        seoSettings={{
          siteTitle: page.seoTitle || `${page.title} | MOBO SAVIOR`,
          metaDescription: page.metaDescription || `Read about ${page.title} on MOBO SAVIOR Purulia.`,
          primaryKeyword: page.title,
          secondaryKeywords: [page.slug],
          robotsConfig: page.status === 'Published' ? 'index, follow' : 'noindex, nofollow',
          canonicalUrl: `https://mobosavior.com/#/${page.slug}`,
          ogTitle: page.seoTitle || page.title,
          ogDescription: page.metaDescription || page.title,
          ogImageUrl: page.ogImageUrl || page.featuredImage
        }}
        currentRoute={page.slug}
      />

      {/* Featured Banner / Header */}
      <div className="relative bg-slate-900 overflow-hidden py-16 sm:py-24 border-b border-slate-100">
        <div className="absolute inset-0 bg-radial-at-t from-slate-800 to-slate-950 opacity-90" />
        {page.featuredImage && (
          <div className="absolute inset-0 z-0 opacity-20 blur-[2px]">
            <img src={page.featuredImage} alt={page.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
        
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10 space-y-4">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {page.title}
          </h1>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>Published: {new Date(page.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Render Dynamic Content Blocks */}
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-10">
        {page.sections && page.sections.length > 0 ? (
          page.sections.map((section: PageSection) => {
            const level = section.settings?.level || 'h2';
            const align = section.settings?.align || 'left';
            const alignClass = align === 'center' ? 'text-center mx-auto' : align === 'right' ? 'text-right' : 'text-left';

            switch (section.type) {
              case 'heading':
                if (level === 'h1') {
                  return (
                    <h1 key={section.id} className={`text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight ${alignClass}`}>
                      {section.content}
                    </h1>
                  );
                } else if (level === 'h3') {
                  return (
                    <h3 key={section.id} className={`text-lg sm:text-xl font-bold text-slate-900 tracking-tight ${alignClass}`}>
                      {section.content}
                    </h3>
                  );
                } else if (level === 'h4') {
                  return (
                    <h4 key={section.id} className={`text-base font-extrabold text-slate-800 tracking-tight ${alignClass}`}>
                      {section.content}
                    </h4>
                  );
                } else {
                  return (
                    <h2 key={section.id} className={`text-xl sm:text-2xl font-black text-[#0284C7] tracking-tight border-b border-slate-100 pb-2 ${alignClass}`}>
                      {section.content}
                    </h2>
                  );
                }

              case 'paragraph':
                return (
                  <p key={section.id} className={`text-slate-600 text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap ${alignClass}`}>
                    {section.content}
                  </p>
                );

              case 'image':
                return (
                  <div key={section.id} className="space-y-2 text-center">
                    <img
                      src={section.settings?.imageUrl || section.content}
                      alt={section.settings?.imageAlt || page.title}
                      className="rounded-xl shadow-md border border-slate-200/60 max-h-[450px] object-cover mx-auto"
                      referrerPolicy="no-referrer"
                    />
                    {section.settings?.imageAlt && (
                      <p className="text-[11px] text-slate-400 font-medium italic">{section.settings.imageAlt}</p>
                    )}
                  </div>
                );

              case 'list':
                const listItems = renderListItems(section.content);
                const listStyle = section.settings?.listStyle || 'disc';
                return (
                  <div key={section.id} className="pl-5 space-y-1.5">
                    {listItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#0284C7] mt-2`} />
                        <span className="text-slate-600 text-sm sm:text-[15px] leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                );

              case 'button':
              case 'link':
                return (
                  <div key={section.id} className={`${alignClass} py-3`}>
                    <button
                      onClick={() => {
                        const url = section.settings?.linkUrl || '#/';
                        if (url.startsWith('http')) {
                          window.open(url, '_blank');
                        } else {
                          const clean = url.replace(/^\/#\//, '').replace(/^#\//, '');
                          onNavigate(clean);
                        }
                      }}
                      className="px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs tracking-wide uppercase rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                    >
                      <span>{section.content || 'Click Here'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );

              case 'video':
                return (
                  <div key={section.id} className="aspect-video w-full rounded-xl overflow-hidden shadow-md border border-slate-200">
                    <iframe
                      src={section.content.replace('watch?v=', 'embed/')}
                      title="YouTube Video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                );

              case 'faq':
                return (
                  <div key={section.id} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Frequently Asked Questions</h3>
                    {section.settings?.faqList?.map((faq, fIdx) => (
                      <div key={fIdx} className="space-y-1 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{faq.question}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                );

              case 'cta':
                return (
                  <div key={section.id} className="bg-radial-at-t from-[#0284C7] to-[#0369A1] text-white p-6 sm:p-8 rounded-2xl shadow-lg text-center space-y-4">
                    <h3 className="text-lg sm:text-xl font-black">{section.content || 'Ready to Solder Your Device back to Life?'}</h3>
                    <p className="text-xs sm:text-sm text-sky-100 max-w-md mx-auto leading-relaxed">
                      {section.settings?.ctaText || 'Get in touch directly with Saddam Bhai on WhatsApp for a super fast estimation!'}
                    </p>
                    <div className="pt-2 flex justify-center gap-3">
                      <button
                        onClick={handleWhatsappCTA}
                        className="px-5 py-2.5 bg-white text-[#0284C7] hover:bg-slate-50 text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-600" /> WhatsApp Saddam Bhai
                      </button>
                      <a
                        href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                        className="px-5 py-2.5 bg-transparent border border-white hover:bg-white/10 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 text-white"
                      >
                        <PhoneCall className="w-4 h-4" /> Direct Lab Call
                      </a>
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })
        ) : (
          <p className="text-center text-slate-400 py-12 text-xs">This page has no content blocks defined.</p>
        )}
      </div>
    </article>
  );
}
