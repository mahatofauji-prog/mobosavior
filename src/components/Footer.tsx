import { Phone, MessageSquare, Instagram, Facebook, MapPin, Compass, ShieldCheck, Megaphone } from 'lucide-react';
import Logo from './Logo';
import { BrandingSettings, ContactSettings, NavigationItem } from '../types';
import { trackPhoneCallClick, trackWhatsAppClick, trackDirectionsClick } from '../lib/analytics';
import WhatsAppChannelCTA from './WhatsAppChannelCTA';

interface FooterProps {
  navItems?: NavigationItem[];
  onNavigate: (route: string) => void;
  branding: BrandingSettings;
  contact: ContactSettings;
}

export default function Footer({
  onNavigate,
  branding,
  contact
}: FooterProps) {
  const categoriesList = [
    { name: 'iPhone Repair', route: 'iphone-repair' },
    { name: 'Android Repair', route: 'android-repair' },
    { name: 'Motherboard Repair', route: 'motherboard-repair' },
    { name: 'Flip & Fold Repair', route: 'flip-fold-repair' },
    { name: 'Display Replacement', route: 'display-replacement' }
  ];

  const popularServices = [
    { name: 'iPhone Display Repair', route: 'service/iphone-display-replacement' },
    { name: 'Poco CPU Reballing', route: 'service/poco-motherboard-repair' },
    { name: 'Dead Phone Diagnosis', route: 'service/dead-phone-repair' },
    { name: 'Green Line Display Fix', route: 'service/green-line-repair' },
    { name: 'High-Capacity Battery', route: 'service/battery-replacement' }
  ];

  const formattedWhatsappLink = `https://wa.me/91${contact.whatsapp.replace(/\s+/g, '')}?text=Hello%20MOBO%20SAVIOR,%20I%20want%20to%20enquire%20about%20mobile%20repair%20service.`;

  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800" id="footer-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* WhatsApp Channel Footer Highlight Strip */}
        <WhatsAppChannelCTA 
          channelUrl={contact.whatsappChannelUrl} 
          variant="footer" 
          className="mb-10 lg:mb-12" 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <button onClick={() => onNavigate('home')} className="focus:outline-none">
              <Logo logoUrl={branding.logoUrl} brandName={branding.brandName} isDark={true} />
            </button>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {branding.tagline || 'Expert Mobile Repair & Motherboard Micro-Soldering Specialists'}
            </p>
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href={`tel:${contact.phone}`}
                onClick={() => trackPhoneCallClick({ source: 'Footer' })}
                className="p-2.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-xl hover:bg-[#0284C7] hover:border-[#0284C7] hover:text-white transition-all shadow-sm group"
                aria-label="Call Phone Support"
                title="Call MOBO SAVIOR"
              >
                <Phone className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={formattedWhatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ source: 'Footer' })}
                className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all shadow-sm group"
                aria-label="Chat on WhatsApp"
                title="WhatsApp Chat Enquiry"
              >
                <MessageSquare className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={contact.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-xl hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all shadow-sm group"
                aria-label="Join Our WhatsApp Channel"
                title="Join Our WhatsApp Channel"
              >
                <Megaphone className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              </a>
              {contact.facebook && (
                <a
                  href={contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm group"
                  aria-label="Visit us on Facebook"
                  title="MOBO SAVIOR on Facebook"
                >
                  <Facebook className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                </a>
              )}
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-pink-500/15 border border-pink-500/30 text-pink-400 rounded-xl hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:border-pink-500 hover:text-white transition-all shadow-sm group"
                aria-label="Visit us on Instagram"
                title="MOBO SAVIOR on Instagram"
              >
                <Instagram className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackDirectionsClick({ source: 'Footer' })}
                className="p-2.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:border-red-500 hover:text-white transition-all shadow-sm group"
                aria-label="Find us on Google Maps"
                title="MOBO SAVIOR on Google Maps"
              >
                <MapPin className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Specialized Category Hubs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Repair Hubs</h4>
            <ul className="space-y-2.5">
              {categoriesList.map((cat) => (
                <li key={cat.route}>
                  <button
                    onClick={() => onNavigate(cat.route)}
                    className="text-xs hover:text-[#38BDF8] text-slate-400 transition-colors focus:outline-none"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Support Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('locations')} className="hover:text-[#38BDF8] transition-colors focus:outline-none font-bold text-red-400">
                  Our Locations & Branches
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#38BDF8] transition-colors focus:outline-none">
                  About Saddam & Team
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-[#38BDF8] transition-colors focus:outline-none">
                  Our Repair Work
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('videos')} className="hover:text-[#38BDF8] transition-colors focus:outline-none">
                  Video Demonstration
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-[#38BDF8] transition-colors focus:outline-none">
                  F.A.Q
                </button>
              </li>
              <li>
                <a
                  href={contact.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 text-emerald-400 font-bold transition-colors inline-flex items-center gap-1.5"
                  title="Join Our WhatsApp Channel"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Join WhatsApp Channel</span>
                </a>
              </li>
              <li>
                <button onClick={() => onNavigate('track-service')} className="hover:text-[#38BDF8] transition-colors focus:outline-none font-bold text-[#38BDF8]">
                  Track My Repair
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-[#38BDF8] transition-colors focus:outline-none opacity-50">
                  Staff Login Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Lab Store Address */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Our Service Lab</h4>
            <div className="flex gap-2.5 text-xs text-slate-400 leading-relaxed">
              <MapPin className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <p>{contact.address || 'ROOM NO B4, SUPER MERKET, HATTOLA MORE, PURULIA, WEST BENGAL 723101'}</p>
                <a
                  href={contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold mt-2 text-[11px] transition-colors group"
                  title="Open Location in Google Maps"
                >
                  <span>Get Directions on Google Maps</span>
                  <Compass className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
                </a>
              </div>
            </div>
            
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex gap-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p>Certified repairs with standard testing post-assembly.</p>
            </div>
          </div>
        </div>

        {/* Dedicated Service Links Strip for SEO */}
        <div className="border-t border-slate-800/80 mt-10 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Popular Dedicated Services:</span>
            <div className="flex flex-wrap items-center gap-2">
              {popularServices.map((srv, idx) => (
                <span key={srv.route} className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate(srv.route)}
                    className="text-slate-400 hover:text-[#38BDF8] text-xs transition-colors focus:outline-none"
                  >
                    {srv.name}
                  </button>
                  {idx < popularServices.length - 1 && <span className="text-slate-700 text-xs">•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom info */}
        <div className="border-t border-slate-800 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 text-center sm:text-left flex items-center flex-wrap gap-4">
            <span>© {new Date().getFullYear()} MOBO SAVIOR. All Rights Reserved.</span>
            <button onClick={() => onNavigate('privacy-policy')} className="hover:text-slate-300">Privacy Policy</button>
            <button onClick={() => onNavigate('terms-conditions')} className="hover:text-slate-300">Terms & Conditions</button>
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-[10px] text-slate-500">
            <span>Saddam Technical Specialist Partner</span>
            <span>
              Designed By{' '}
              <a 
                href="https://www.manisolution.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                MANI Solution
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
