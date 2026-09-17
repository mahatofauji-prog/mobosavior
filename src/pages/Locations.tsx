import React, { useState, useEffect } from 'react';
import { Branch, Service } from '../types';
import { 
  isOpenNow, sortBranchesByDistance, buildBranchWhatsappUrl, buildBranchPhoneCallUrl, BranchWithDistance 
} from '../utils/branchHelpers';
import SEOHead from '../components/SEOHead';
import { 
  MapPin, Phone, MessageSquare, Navigation, Search, Clock, Star, 
  Building2, ArrowRight, Compass, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';

interface LocationsProps {
  branches: Branch[];
  services: Service[];
  onNavigate?: (route: string) => void;
}

export default function Locations({ branches, services, onNavigate }: LocationsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const activeBranches = branches.filter((b) => b.isActive);

  // Trigger browser geolocation to find nearest shop
  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation permission error:', err);
        setLocating(false);
        setLocError('Location permission was denied or unavailable. Please manually pick a location below.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const sortedBranches: BranchWithDistance[] = sortBranchesByDistance(
    activeBranches,
    userLocation?.lat,
    userLocation?.lon
  );

  const filteredBranches = sortedBranches.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      b.pincode.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 md:py-20">
      <SEOHead
        title="Our Lab Locations & Branches | MOBO SAVIOR Mobile Repair"
        description="Find a MOBO SAVIOR mobile phone repair shop near you. Dedicated micro-soldering labs in Purulia and regional branches for iPhone and Android repairs."
        canonicalPath="/locations"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>MOBO SAVIOR BRANCH NETWORK</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Find Your Nearest MOBO SAVIOR Lab
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Select an authorized MOBO SAVIOR store location for specialized iPhone & Android motherboard micro-soldering, screen restorations, and fast turnaround repairs.
          </p>

          {/* Find Nearest Geolocation Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleFindNearest}
              disabled={locating}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Compass className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Detecting Location...' : 'Find Nearest MOBO SAVIOR Location'}</span>
            </button>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search city, address or pincode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {userLocation && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Location detected! Showing branches sorted by distance to your coordinates.</span>
            </div>
          )}

          {locError && (
            <div className="p-3 bg-amber-950/60 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{locError}</span>
            </div>
          )}
        </div>

        {/* Locations Grid */}
        {filteredBranches.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-lg font-bold text-slate-300">No matching branches found.</p>
            <p className="text-xs text-slate-500">Try clearing your search query to view all available locations.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-700"
            >
              Show All Branches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBranches.map((branch) => {
              const status = isOpenNow(branch);
              const whatsappUrl = buildBranchWhatsappUrl(branch);
              const phoneUrl = buildBranchPhoneCallUrl(branch);

              return (
                <div
                  key={branch.id}
                  className={`bg-slate-900/90 rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl group hover:-translate-y-1 ${
                    branch.isMain
                      ? 'border-red-500/50 hover:border-red-500 ring-1 ring-red-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative h-48 bg-slate-950 overflow-hidden">
                      <img
                        src={branch.imageUrl || '/assets/images/why_choose_mobo_savior.png'}
                        alt={branch.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/why_choose_mobo_savior.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                      {/* Distance & Main Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          {branch.isMain && (
                            <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-current" /> Main Branch
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 text-[10px] font-bold rounded-lg backdrop-blur shadow ${
                              status.isOpen
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-slate-800/90 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {status.statusText}
                          </span>
                        </div>

                        {branch.distanceKm !== undefined && (
                          <span className="px-3 py-1 bg-blue-600/90 backdrop-blur text-white text-[11px] font-bold rounded-lg shadow">
                            📍 {branch.distanceKm} km away
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase block">
                          CODE: {branch.branchCode}
                        </span>
                        <h2 className="text-xl font-black text-white group-hover:text-red-400 transition-colors">
                          {branch.name}
                        </h2>
                      </div>
                    </div>

                    {/* Content Details */}
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

                      <div className="flex items-center gap-3 pt-3 border-t border-slate-800 text-xs">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-slate-400">Hours Today: </span>
                          <span className="font-medium text-slate-200">{status.todayHoursText}</span>
                          {branch.weeklyHoliday && (
                            <span className="text-[11px] text-red-400 block">
                              Weekly Holiday: {branch.weeklyHoliday}
                            </span>
                          )}
                        </div>
                      </div>

                      {branch.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 pt-2 border-t border-slate-800">
                          {branch.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-3">
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
                        <span>Get Directions</span>
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
        )}
      </div>
    </div>
  );
}
