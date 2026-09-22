import React from 'react';
import { Branch } from '../types';
import { isOpenNow, buildBranchWhatsappUrl, buildBranchPhoneCallUrl } from '../utils/branchHelpers';
import { MapPin, Phone, MessageSquare, Navigation, ArrowRight, Clock, Star, Building2, ExternalLink } from 'lucide-react';

interface HomeLocationsSectionProps {
  branches: Branch[];
}

export default function HomeLocationsSection({ branches }: HomeLocationsSectionProps) {
  const activeBranches = branches.filter((b) => b.isActive);

  if (activeBranches.length === 0) return null;

  return (
    <section id="our-locations" className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Subtle Tech Grid FX */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-wider mb-4">
            <Building2 className="w-4 h-4" />
            <span>MOBO SAVIOR LAB LOCATIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            Visit Our Specialized Mobile Repair Labs
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Find the nearest MOBO SAVIOR branch for component-level motherboard reballing, display replacements, and expert phone diagnostics.
          </p>
        </div>

        {/* Branch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {activeBranches.map((branch) => {
            const status = isOpenNow(branch);
            const whatsappUrl = buildBranchWhatsappUrl(branch);
            const phoneUrl = buildBranchPhoneCallUrl(branch);

            return (
              <div
                key={branch.id}
                className={`bg-slate-800/90 rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1 shadow-xl ${
                  branch.isMain
                    ? 'border-red-500/50 hover:border-red-500 ring-1 ring-red-500/20'
                    : 'border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div>
                  {/* Branch Banner Photo */}
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img
                      src={branch.imageUrl || '/assets/images/why_choose_mobo_savior.png'}
                      alt={branch.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/why_choose_mobo_savior.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {branch.isMain && (
                        <span className="px-3 py-1 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-current" /> Main Headquarters
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg backdrop-blur shadow-md ${
                          status.isOpen
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-slate-800/90 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {status.statusText}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase block mb-0.5">
                        {branch.city}, {branch.state}
                      </span>
                      <h3 className="text-xl font-black tracking-tight text-white group-hover:text-red-400 transition-colors">
                        {branch.name}
                      </h3>
                    </div>
                  </div>

                  {/* Branch Details */}
                  <div className="p-5 sm:p-6 space-y-4 text-sm text-slate-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{branch.address}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {branch.city}, {branch.state} - {branch.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-700/60 text-xs">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-slate-400">Timing: </span>
                        <span className="font-medium text-slate-200">{status.todayHoursText}</span>
                        {branch.weeklyHoliday && (
                          <span className="text-[11px] text-red-400 block font-normal">
                            Holiday: {branch.weeklyHoliday}
                          </span>
                        )}
                      </div>
                    </div>

                    {branch.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-2 border-t border-slate-700/60">
                        {branch.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action CTAs */}
                <div className="p-5 bg-slate-900/80 border-t border-slate-700/60 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={phoneUrl}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>Call Now</span>
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={branch.googleMapsUrl || 'https://maps.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>

                    <a
                      href={`#/locations/${branch.slug}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                    >
                      <span>Branch Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Locations Footer CTA */}
        <div className="mt-12 text-center">
          <a
            href="#/locations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition shadow-lg hover:shadow-red-600/20"
          >
            <span>Explore All MOBO SAVIOR Locations</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
