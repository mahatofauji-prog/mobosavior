import { useState, useEffect, useMemo } from 'react';
import { BlogPost, BlogCategory, ContactSettings } from '../types';
import { collection, query, where, getDocs, orderBy } from '../lib/supabase';
import { db } from '../lib/supabase';
import { handleFirestoreError, OperationType } from '../lib/errors';
import { Search, Calendar, User, ArrowRight, Loader2, Sparkles, Filter, ChevronRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';

interface BlogProps {
  onNavigate: (route: string) => void;
  contact: ContactSettings;
}

export default function Blog({ onNavigate, contact }: BlogProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');

  // Fetch blogs & categories
  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      try {
        const postsRef = collection(db, 'blog_posts');
        const q = query(postsRef, where('status', '==', 'Published'), orderBy('publishDate', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedPosts: BlogPost[] = [];
        querySnapshot.forEach(doc => {
          fetchedPosts.push({ id: doc.id, ...doc.data() } as BlogPost);
        });
        setPosts(fetchedPosts);

        // Fetch categories
        const catsRef = collection(db, 'blog_categories');
        const cq = query(catsRef, orderBy('displayOrder', 'asc'));
        const catSnapshot = await getDocs(cq);
        const fetchedCats: BlogCategory[] = [];
        catSnapshot.forEach(doc => {
          fetchedCats.push({ id: doc.id, ...doc.data() } as BlogCategory);
        });
        setCategories(fetchedCats);
      } catch (err) {
        console.error('Error fetching blog data:', err);
        handleFirestoreError(err, OperationType.GET, 'blog_posts');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesTag = !selectedTag || (post.tags && post.tags.map(t => t.toLowerCase()).includes(selectedTag.toLowerCase()));
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [posts, searchQuery, selectedCategory, selectedTag]);

  // Extract all distinct tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    posts.forEach(p => {
      if (p.tags) p.tags.forEach(t => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [posts]);

  return (
    <div className="min-h-screen bg-slate-50/40 pb-20">
      <SEOHead 
        seoSettings={{
          siteTitle: 'Repair Blog & Tech Tips | MOBO SAVIOR Purulia',
          metaDescription: 'Read the latest mobile motherboard repair tips, micro-soldering guides, and troubleshooting articles written by Saddam Bhai at MOBO SAVIOR Purulia.',
          primaryKeyword: 'Mobile repair blog Purulia',
          secondaryKeywords: ['motherboard repair tips', 'dead phone troubleshooting', 'screen replacement advice'],
          robotsConfig: 'index, follow',
          canonicalUrl: 'https://mobosavior.com/#/blog',
          ogTitle: 'Repair Blog & Tech Tips | MOBO SAVIOR Purulia',
          ogDescription: 'Read the latest mobile motherboard repair tips, micro-soldering guides, and troubleshooting articles written by Saddam Bhai at MOBO SAVIOR Purulia.'
        }}
        currentRoute="blog"
      />

      {/* Header Banner */}
      <div className="relative bg-slate-950 py-16 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-t from-slate-900 to-slate-950 opacity-95" />
        <div className="relative max-w-4xl mx-auto px-4 z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-400/20 text-sky-400 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Saddam's Repair Lab Diary
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white">
            Repair Lab & Blog Tips
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
            Learn component-level details, troubleshoot green line screen issues, and read micro-soldering breakthroughs straight from Saddam Bhai's desk in Purulia.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sidebar Filters */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search Box */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[#0284C7]" /> Search Articles
            </h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Search tips & keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284C7] focus:bg-white text-slate-800 font-bold"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#0284C7]" /> Categories
            </h4>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => { setSelectedCategory('All'); setSelectedTag(''); }}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-[#E0F2FE]/50 text-[#0284C7]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                <ChevronRight className="w-3 h-3" />
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.name); setSelectedTag(''); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[#E0F2FE]/50 text-[#0284C7]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          {allTags.length > 0 && (
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Popular Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-colors border ${
                    !selectedTag 
                      ? 'bg-[#0284C7] border-[#0284C7] text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  All Tags
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-colors border ${
                      selectedTag.toLowerCase() === tag.toLowerCase()
                        ? 'bg-[#0284C7] border-[#0284C7] text-white' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Blog Grid */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3.5 select-none text-slate-700">
              <Loader2 className="w-8 h-8 text-[#0284C7] animate-spin" />
              <p className="text-xs font-semibold text-slate-400">Opening repair journals...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Articles Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No articles matched your criteria. Try resetting filters or using a different search query.
              </p>
              <button
                onClick={() => { setSelectedCategory('All'); setSelectedTag(''); setSearchQuery(''); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <article 
                  key={post.id} 
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col h-full"
                >
                  <div className="relative aspect-[16/9] bg-slate-100 flex-shrink-0">
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-400">
                        <Sparkles className="w-10 h-10" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-[#0284C7] text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-grow flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-extrabold uppercase">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#0284C7]" />
                          {new Date(post.publishDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[#0284C7]" />
                          {post.authorName || 'Saddam Bhai'}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 hover:text-[#0284C7] transition-colors">
                        <button onClick={() => onNavigate(`blog/${post.slug}`)} className="text-left focus:outline-none">
                          {post.title}
                        </button>
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium">
                        {post.content.replace(/[#*`_[\]()-]/g, '').slice(0, 150)}...
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                      {post.tags && post.tags.length > 0 ? (
                        <span className="text-[10px] font-bold text-slate-400 line-clamp-1">
                          #{post.tags[0]}
                        </span>
                      ) : <span />}

                      <button
                        onClick={() => onNavigate(`blog/${post.slug}`)}
                        className="text-xs font-extrabold text-[#0284C7] hover:text-[#0369A1] transition-colors inline-flex items-center gap-1 group focus:outline-none"
                      >
                        Read Article 
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
