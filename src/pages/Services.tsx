import { useState } from 'react';
import { Service, PriceItem } from '../types';
import { Clock, ShieldCheck, Search, Filter, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getServiceImage } from '../utils/serviceImages';
import { resolveServicePrice } from '../utils/priceHelpers';

interface ServicesProps {
  onNavigate: (route: string) => void;
  services: Service[];
  prices?: PriceItem[];
}

export default function Services({ onNavigate, services, prices = [] }: ServicesProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories
  const activeServices = services.filter(s => s.active);
  const categories = ['All', ...Array.from(new Set(activeServices.map(s => s.category)))];

  const filteredServices = activeServices.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="text-left space-y-2 sm:space-y-3 max-w-2xl border-b border-slate-100 pb-4 sm:pb-6">
        <span className="text-[10px] font-bold tracking-widest text-[#0284C7] uppercase">Official Catalog</span>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-sans">
          Mobile Repair & Hardware Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
          Select a repair service category below. We provide microscopic diagnosis, authentic replacement components, and specialized micro-soldering solutions.
        </p>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search e.g. iPhone, display, battery..."
            className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all font-medium text-slate-700"
          />
        </div>

        {/* Category filters container (scrollable on small screens) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all focus:outline-none ${
                selectedCategory === cat
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Service Cards Grid - Exactly 2 columns across all screen sizes */}
      <AnimatePresence mode="wait">
        {filteredServices.length > 0 ? (
          <motion.div 
            key="services-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-3 sm:gap-6"
          >
            {filteredServices.map((srv) => (
              <div 
                key={srv.id}
                className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-[280px] xs:h-[320px] sm:h-[380px] md:h-[400px] text-left group"
              >
                {/* Image Top Area */}
                <div className="h-24 xs:h-28 sm:h-36 md:h-40 bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] relative p-2.5 sm:p-5 flex flex-col justify-between">
                  <img 
                    src={getServiceImage(srv)} 
                    alt={srv.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle layer gradient to ensure tag contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                  {/* Top indicators */}
                  <span className="relative z-10 self-start px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-white/90 backdrop-blur-sm rounded text-[7px] sm:text-[9px] font-extrabold text-[#0369A1] tracking-wider uppercase border border-white/20">
                    {srv.category}
                  </span>

                  {/* Estimation / Price sticker at bottom of image */}
                  <div className="relative z-10 flex items-center justify-between text-white w-full">
                    <span className="text-[7px] xs:text-[8px] sm:text-[10px] font-bold flex items-center gap-0.5 sm:gap-1 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded">
                      <Clock className="w-2 h-2 sm:w-3 sm:h-3 text-sky-300" />
                      {srv.estimatedTime || 'Inspection'}
                    </span>
                    <span className="text-[8px] xs:text-[9px] sm:text-xs font-extrabold bg-[#0284C7] px-1.5 py-0.5 sm:px-3 sm:py-1 rounded shadow-sm">
                      {resolveServicePrice(prices, srv).formattedPrice}
                    </span>
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-2.5 sm:p-5 flex-grow flex flex-col justify-between space-y-2 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-1.5">
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-base group-hover:text-[#0284C7] transition-colors leading-snug font-sans">
                      {srv.name}
                    </h3>
                    <p className="text-[9px] xs:text-[10px] sm:text-xs text-slate-500 leading-normal sm:leading-relaxed line-clamp-2 sm:line-clamp-3 font-medium">
                      {srv.description}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 border-t border-slate-100 pt-2 sm:pt-4">
                    <button
                      onClick={() => onNavigate(`service/${srv.slug}`)}
                      className="py-1 sm:py-2 px-1 sm:px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[8px] xs:text-[9px] sm:text-[11px] font-bold rounded-md sm:rounded-xl transition-all text-center focus:outline-none"
                    >
                      View Process
                    </button>
                    <button
                      onClick={() => onNavigate(`book-repair?service=${srv.slug}`)}
                      className="py-1 sm:py-2 px-1 sm:px-3 bg-[#0284C7] text-white hover:bg-[#0369A1] text-[8px] xs:text-[9px] sm:text-[11px] font-bold rounded-md sm:rounded-xl shadow-sm transition-all text-center focus:outline-none"
                    >
                      Book Online
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="empty-services"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-100 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm"
          >
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">No services found</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We couldn't find any services matching your filter or search query. Try choosing another category or clearing your search.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
