import React from 'react';
import { Branch, Service } from '../types';
import { 
  isOpenNow, buildBranchWhatsappUrl, buildBranchPhoneCallUrl 
} from '../utils/branchHelpers';
import SEOHead from '../components/SEOHead';
import { 
  MapPin, Phone, MessageSquare, Navigation, Clock, Star, 
  Building2, ArrowLeft, CheckCircle2, ShieldCheck, Wrench, Calendar, Globe, Mail 
} from 'lucide-react';

interface BranchDetailProps {
  slug: string;
  branches: Branch[];
  services: Service[];
  onNavigate?: (route: string) => void;
}

export default function BranchDetail({ slug, branches, services, onNavigate }: BranchDetailProps) {
  // Find branch by slug or ID
  const branch = branches.find(
    (b) => b.slug.toLowerCase() === slug.toLowerCase() || b.id.toLowerCase() === slug.toLowerCase()
  ) || branches.find((b) => b.isMain) || branches[0];

  if (!branch) {
    return (
      <div className="min-h-[60vh] bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <Building2 className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-2xl font-black">Branch Not Found</h1>
        <p className="text-slate-400 text-sm mt-2">The requested store location does not exist or has been moved.</p>
        <a
          href="#/locations"
          className="mt-6 px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
        >
          View All Branches
        </a>
      </div>
    );
  }

  const status = isOpenNow(branch);
  const whatsappUrl = buildBranchWhatsappUrl(branch);
  const phoneUrl = buildBranchPhoneCallUrl(branch);

  // Filter available services for this branch
  const availableServices = (branch.serviceIds && branch.serviceIds.length > 0)
    ? services.filter((s) => branch.serviceIds?.includes(s.id))
    : services.filter((s) => s.active);

  const daysOrder: { key: keyof typeof branch.businessHours; label: string }[] = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const format12H = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const minStr = m < 10 ? `0${m}` : m;
    return `${hour12}:${minStr} ${ampm}`;
  };

  // Structured Data LocalBusiness Schema
  const schemaObj = {
    '@context': 'https://schema.org',
    '@type': 'MobilePhoneRepairShop',
    'name': branch.name,
    'image': branch.imageUrl || 'https://mobosavior.com/assets/images/why_choose_mobo_savior.png',
    '@id': `https://mobosavior.com/#/locations/${branch.slug}`,
    'url': `https://mobosavior.com/#/locations/${branch.slug}`,
    'telephone': branch.phone,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': branch.address,
      'addressLocality': branch.city,
      'addressRegion': branch.state,
      'postalCode': branch.pincode,
      'addressCountry': 'IN'
    },
    'geo': (branch.latitude && branch.longitude) ? {
      '@type': 'GeoCoordinates',
      'latitude': branch.latitude,
      'longitude': branch.longitude
    } : undefined
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 md:py-16">
      <SEOHead
        title={branch.seoTitle || `${branch.name} | Mobile Repair Lab in ${branch.city}`}
        description={branch.seoDescription || `${branch.name} located at ${branch.address}, ${branch.city}. Expert iPhone & Android micro-soldering, dead phone recovery, display replacements.`}
        canonicalPath={`/locations/${branch.slug}`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaObj) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb Back button */}
        <a
          href="#/locations"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Locations</span>
        </a>

        {/* Hero Banner Section */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
          <div className="relative h-64 sm:h-80 md:h-96 bg-slate-950">
            <img
              src={branch.imageUrl || '/assets/images/why_choose_mobo_savior.png'}
              alt={branch.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/images/why_choose_mobo_savior.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

            {/* Badges */}
            <div className="absolute top-6 left-6 flex flex-wrap gap-2.5 z-10">
              {branch.isMain && (
                <span className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-current" /> Main Branch Headquarters
                </span>
              )}
              <span
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl backdrop-blur shadow-md ${
                  status.isOpen ? 'bg-emerald-500/90 text-white' : 'bg-slate-800/90 text-slate-300'
                }`}
              >
                {status.statusText} • Today: {status.todayHoursText}
              </span>
            </div>

            {/* Branch Title & Code */}
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-xs font-mono tracking-widest text-red-400 uppercase font-bold">
                BRANCH CODE: {branch.branchCode}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">{branch.name}</h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium flex items-center gap-2 pt-1">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{branch.address}, {branch.city}, {branch.state} - {branch.pincode}</span>
              </p>
            </div>
          </div>

          {/* Action CTAs Bar */}
          <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={branch.googleMapsUrl || 'https://maps.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition shadow-lg"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>

            <a
              href={phoneUrl}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition"
            >
              <Phone className="w-4 h-4 text-blue-400" />
              <span>Call Branch: {branch.phone}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-sm border border-emerald-500/30 transition"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Branch Description & Facilities */}
            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-500" />
                About This MOBO SAVIOR Location
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {branch.description || `${branch.name} is a fully equipped mobile repair lab offering component-level micro-soldering, CPU/IC reballing, display glass replacements, and original battery installations.`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Microscope-Guided Component Repair</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Original & High-Quality Replacement Parts</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Transparent Diagnostic Reporting</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Warranty Available on Eligible Repairs</span>
                </div>
              </div>
            </div>

            {/* Available Services at this Branch */}
            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-red-500" />
                    Available Services at {branch.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Services supported and carried out by technicians at this location.
                  </p>
                </div>
                <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg border border-red-500/20">
                  {availableServices.length} Services
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                        {srv.category}
                      </span>
                      <h3 className="font-bold text-white text-sm mt-0.5">{srv.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{srv.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-400">
                        {srv.price ? `₹${srv.price}` : 'Get Quote'}
                      </span>
                      <a
                        href={`#/book-repair?branch=${branch.id}&service=${srv.slug}`}
                        className="text-red-400 hover:text-red-300 text-[11px] underline"
                      >
                        Book at this branch →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Branch Contact Details
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Store Address</span>
                    <span className="font-medium">{branch.address}, {branch.city}, {branch.state} - {branch.pincode}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone Number</span>
                    <a href={phoneUrl} className="font-medium text-slate-100 hover:text-blue-400">{branch.phone}</a>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">WhatsApp Number</span>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-300 hover:underline">{branch.whatsapp}</a>
                  </div>
                </div>

                {branch.email && (
                  <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                    <Mail className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Email Address</span>
                      <a href={`mailto:${branch.email}`} className="font-medium">{branch.email}</a>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <a
                  href={`#/book-repair?branch=${branch.id}`}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition text-center block"
                >
                  Book Repair at {branch.name}
                </a>
              </div>
            </div>

            {/* Weekly Operating Schedule */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Weekly Business Hours</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </h3>

              <div className="space-y-2 text-xs">
                {daysOrder.map(({ key, label }) => {
                  const dayData = branch.businessHours?.[key] || { isOpen: true, openTime: '09:30', closeTime: '20:30' };
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-2 rounded-xl ${
                        dayData.isOpen ? 'bg-slate-950/60 text-slate-200' : 'bg-slate-950/30 text-slate-500'
                      }`}
                    >
                      <span className="font-bold">{label}</span>
                      {dayData.isOpen ? (
                        <span className="font-mono text-emerald-400 text-[11px]">
                          {format12H(dayData.openTime)} - {format12H(dayData.closeTime)}
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold text-[10px]">CLOSED</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {branch.weeklyHoliday && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-[11px] text-red-300 font-medium">
                  <strong>Weekly Holiday Notice:</strong> {branch.weeklyHoliday}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
