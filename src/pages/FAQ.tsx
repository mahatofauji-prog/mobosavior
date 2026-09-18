import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from '../lib/supabase';
import { db } from '../lib/supabase';
import { FAQItem } from '../types';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_FAQS } from '../lib/seed';

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>('faq-1'); // default first open

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const q = query(collection(db, 'faqs'), orderBy('displayOrder', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetched: FAQItem[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as FAQItem);
        });

        // Use seed FAQs if empty
        const finalFaqs = fetched.length > 0 ? fetched : DEFAULT_FAQS;
        setFaqs(finalFaqs);
        
        // Inject FAQPage Schema into header
        injectFAQSchema(finalFaqs);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setFaqs(DEFAULT_FAQS);
        injectFAQSchema(DEFAULT_FAQS);
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  const injectFAQSchema = (items: FAQItem[]) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': items.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      }))
    };

    const existingScript = document.getElementById('faq-schema-data');
    if (existingScript) {
      existingScript.innerHTML = JSON.stringify(schema);
    } else {
      const script = document.createElement('script');
      script.id = 'faq-schema-data';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  };

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 text-left">
      {/* Header */}
      <div className="max-w-2xl border-b border-slate-100 pb-6 space-y-2">
        <span className="text-[10px] font-bold tracking-widest text-[#0284C7] uppercase font-sans">SEO GROUNDED</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
          Have questions about your display replacement, battery health, dead mobile diagnostic timeline, or motherboard soldering? Find direct answers below.
        </p>
      </div>

      {/* FAQs List Accordions */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-slate-100 animate-pulse rounded-2xl h-14 border border-slate-200" />
          ))}
        </div>
      ) : faqs.length > 0 ? (
        <div className="space-y-3.5">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isOpen 
                    ? 'border-[#0284C7] shadow-sm ring-1 ring-sky-100' 
                    : 'border-slate-100 shadow-none hover:border-slate-200'
                }`}
              >
                {/* Trigger Button */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-slate-800 text-sm sm:text-base focus:outline-none select-none hover:text-[#0284C7]"
                >
                  <span className="pr-4 leading-snug font-sans">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#0284C7] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {/* Answer Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center bg-white border border-slate-100 p-12 rounded-2xl">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">No FAQs available</h4>
          <p className="text-xs text-slate-500">Check back later or contact us directly.</p>
        </div>
      )}

      {/* Support pitch bubble */}
      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-800 leading-relaxed flex items-center justify-between flex-col sm:flex-row gap-4">
        <div className="flex gap-2 items-center">
          <Sparkles className="w-4 h-4 text-[#0284C7]" />
          <span>Still have an unanswered question about your device?</span>
        </div>
        <button
          onClick={() => window.location.hash = '#/contact'}
          className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-[10px] uppercase rounded-xl shadow-sm transition-all whitespace-nowrap"
        >
          CONTACT SADDAM BHAI
        </button>
      </div>
    </div>
  );
}
