import React, { useState, useEffect, useMemo } from 'react';
import { BlogPost, ContactSettings } from '../types';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { ChevronLeft, Calendar, User, Tag, Loader2, Sparkles, MessageSquare, PhoneCall, Share2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { trackWhatsAppClick } from '../lib/analytics';

interface BlogDetailProps {
  onNavigate: (route: string) => void;
  slug: string;
  contact: ContactSettings;
}

export default function BlogDetail({ onNavigate, slug, contact }: BlogDetailProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogPost = async () => {
      setLoading(true);
      setError('');
      try {
        const postsRef = collection(db, 'blog_posts');
        const q = query(postsRef, where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const postData = { id: docSnap.id, ...docSnap.data() } as BlogPost;
          
          if (postData.status === 'Published') {
            setPost(postData);
          } else {
            setError('This article is currently a draft or unpublished.');
          }
        } else {
          setError('Article not found.');
        }
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('Failed to load article content.');
        handleFirestoreError(err, OperationType.GET, `blog_posts/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  // A robust custom markdown renderer that processes standard markdown into React components safely.
  const renderedMarkdown = useMemo(() => {
    if (!post || !post.content) return null;

    const lines = post.content.split('\n');
    let inList = false;
    let listType: 'ul' | 'ol' = 'ul';
    const elements: React.ReactNode[] = [];

    const flushList = (key: string) => {
      if (inList) {
        inList = false;
        // The lists are processed inline below for simplicity
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Headings
      if (trimmed.startsWith('#')) {
        flushList(`list-${idx}`);
        const depth = (trimmed.match(/^#+/) || ['#'])[0].length;
        const text = trimmed.replace(/^#+\s*/, '');
        if (depth === 1) {
          elements.push(
            <h1 key={idx} className="text-2xl sm:text-3xl font-black text-slate-950 mt-6 mb-3 tracking-tight">
              {text}
            </h1>
          );
        } else if (depth === 2) {
          elements.push(
            <h2 key={idx} className="text-xl sm:text-2xl font-black text-[#0284C7] mt-6 mb-3 tracking-tight">
              {text}
            </h2>
          );
        } else {
          elements.push(
            <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-900 mt-5 mb-2">
              {text}
            </h3>
          );
        }
        return;
      }

      // Blockquotes
      if (trimmed.startsWith('>')) {
        flushList(`list-${idx}`);
        const text = trimmed.replace(/^>\s*/, '');
        elements.push(
          <blockquote key={idx} className="border-l-4 border-[#0284C7] bg-slate-50 p-4 rounded-r-xl italic my-4 text-slate-600 text-sm">
            {text}
          </blockquote>
        );
        return;
      }

      // Unordered Lists
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        inList = true;
        const text = trimmed.substring(2);
        elements.push(
          <div key={idx} className="flex items-start gap-2.5 pl-4 my-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mt-2 flex-shrink-0" />
            <span className="text-slate-600 text-[14px] sm:text-base leading-relaxed">{text}</span>
          </div>
        );
        return;
      }

      // Empty Lines
      if (trimmed === '') {
        flushList(`list-${idx}`);
        elements.push(<div key={idx} className="h-4" />);
        return;
      }

      // Normal Paragraphs
      flushList(`list-${idx}`);
      // Parse basic bold (**text**) and code (`text`) inline
      let processedContent: React.ReactNode = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        processedContent = parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-slate-950">{part}</strong> : part);
      }

      elements.push(
        <p key={idx} className="text-slate-600 text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap">
          {processedContent}
        </p>
      );
    });

    return <div className="space-y-3.5 text-slate-700">{elements}</div>;
  }, [post]);

  const handleWhatsappCTA = () => {
    trackWhatsAppClick({ source: 'Blog Article CTA' });
    const text = `Hello MOBO SAVIOR, I read your blog post "${post?.title}" and had some questions about my device repair!`;
    window.open(`https://wa.me/91${contact.whatsapp.replace(/\s+/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 select-none text-slate-700">
        <Loader2 className="w-8 h-8 text-[#0284C7] animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading repair secrets...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Oops!</h1>
        <p className="text-xs text-slate-500 font-medium">{error || 'The article you requested is not available.'}</p>
        <button
          onClick={() => onNavigate('blog')}
          className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white pb-20">
      <SEOHead 
        seoSettings={{
          siteTitle: post.seoTitle || `${post.title} | MOBO SAVIOR Blog`,
          metaDescription: post.metaDescription || `Read ${post.title} by Saddam Bhai on MOBO SAVIOR. Component-level diagnostics in Purulia.`,
          primaryKeyword: post.title,
          secondaryKeywords: post.tags || [post.slug],
          robotsConfig: 'index, follow',
          canonicalUrl: `https://mobosavior.com/#/blog/${post.slug}`,
          ogTitle: post.seoTitle || post.title,
          ogDescription: post.metaDescription || post.title,
          ogImageUrl: post.ogImageUrl || post.featuredImage
        }}
        currentRoute={`blog/${post.slug}`}
      />

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4 space-y-4">
        <button
          onClick={() => onNavigate('blog')}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0284C7] hover:text-[#0369A1] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Blog Journals
        </button>

        <span className="inline-block bg-[#E0F2FE] text-[#0284C7] text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider">
          {post.category}
        </span>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-2 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-black text-[10px]">SB</div>
            <span>By <strong className="text-slate-800 font-extrabold">{post.authorName || 'Saddam Bhai'}</strong></span>
          </div>
          <span className="text-slate-200">|</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            {new Date(post.publishDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="max-w-5xl mx-auto px-4 my-6">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-md border border-slate-100">
            <img 
              src={post.featuredImage} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Content layout with Sidebar CTA */}
      <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-8 prose prose-slate max-w-none">
          {renderedMarkdown}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 font-bold text-[10px] uppercase rounded-lg"
                >
                  <Tag className="w-3 h-3 text-[#0284C7]" /> #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Sticky CTA */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-1 text-xs text-[#0284C7] font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" /> Specialist Consultation
            </div>
            
            <h3 className="text-sm font-black text-slate-900 leading-snug">
              Experiencing a similar mobile Motherboard or Screen fault?
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Saddam Bhai has over 8+ years of chip reballing, logic board restoration, and display replacement expertise on iPhone & Android devices in Purulia.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <button
                onClick={handleWhatsappCTA}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 fill-white" /> WhatsApp Saddam Bhai
              </button>
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4 text-[#0284C7]" /> Direct Bench Call
              </a>
            </div>
          </div>
        </div>

      </div>
    </article>
  );
}
