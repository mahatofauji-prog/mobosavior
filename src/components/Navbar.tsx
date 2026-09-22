import { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone, MessageSquare, Calendar, ChevronDown, Wrench, Smartphone, Cpu, ShieldCheck, Layers, MapPin, Navigation, Facebook, Instagram, Megaphone } from 'lucide-react';
import Logo from './Logo';
import { AnimatePresence, motion } from 'motion/react';
import { BrandingSettings, ContactSettings, NavigationItem } from '../types';
import { trackWhatsAppClick, trackDirectionsClick, trackBookRepairClick } from '../lib/analytics';
import WhatsAppChannelCTA from './WhatsAppChannelCTA';

interface NavbarProps {
  navItems?: NavigationItem[];
  currentRoute: string;
  onNavigate: (route: string) => void;
  branding: BrandingSettings;
  contact: ContactSettings;
}

export default function Navbar({ currentRoute, onNavigate, branding, contact }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const serviceCategories = [
    { label: 'All Services Catalog', route: 'services', desc: 'Browse our full lab offerings', icon: Wrench },
    { label: 'iPhone Repair', route: 'iphone-repair', desc: 'Apple diagnostics, TrueTone & screens', icon: Smartphone },
    { label: 'Android Repair', route: 'android-repair', desc: 'Samsung, OnePlus, Xiaomi, Pixel', icon: Smartphone },
    { label: 'Motherboard & Chip-Level', route: 'motherboard-repair', desc: 'Micro-soldering, short circuit, CPU', icon: Cpu },
    { label: 'Flip & Fold Repair', route: 'flip-fold-repair', desc: 'Foldable display & hinge restoration', icon: Layers },
    { label: 'Display Replacement', route: 'display-replacement', desc: 'Original OLED, AMOLED & glass restoration', icon: ShieldCheck },
  ];

  const navLinks = [
    { label: 'Home', route: 'home', hash: '#/' },
    { label: 'Locations', route: 'locations', hash: '#/locations' },
    { label: 'Gallery', route: 'gallery', hash: '#/gallery' },
    { label: 'Videos', route: 'videos', hash: '#/videos' },
    { label: 'Offers', route: 'offers', hash: '#/offers' },
    { label: 'About', route: 'about', hash: '#/about' },
    { label: 'Reviews', route: 'reviews', hash: '#/reviews' },
    { label: 'FAQ', route: 'faq', hash: '#/faq' },
    { label: 'Contact', route: 'contact', hash: '#/contact' },
  ];

  const handleLinkClick = (route: string) => {
    onNavigate(route);
    setIsOpen(false);
    setServicesDropdownOpen(false);
  };

  const formattedWhatsappLink = `https://wa.me/91${contact.whatsapp.replace(/\s+/g, '')}?text=Hello%20MOBO%20SAVIOR,%20I%20want%20to%20enquire%20about%20mobile%20repair%20service.`;

  return (
    <>
      {/* Golden Tagline Promo Banner Bar */}
      <div 
        className="w-full bg-[#0A0D14] border-b border-yellow-500/25 py-1.5 xs:py-2 px-2 text-center select-none flex items-center justify-center gap-1 sm:gap-2 font-black uppercase text-[7.5px] xs:text-[9px] sm:text-[10px] md:text-xs tracking-[0.03em] xs:tracking-[0.08em] sm:tracking-[0.2em] relative z-50 whitespace-nowrap overflow-hidden"
        style={{
          boxShadow: 'inset 0 -1px 0 rgba(255, 215, 0, 0.1)',
          textShadow: '0 0 5px rgba(255, 215, 0, 0.7)',
          color: '#FFD700'
        }}
      >
        <span className="text-yellow-500 animate-pulse text-[8px] sm:text-xs">★</span>
        <span className="text-yellow-400 font-extrabold">PURULIA KA TRUSTED MOBILE REPAIRING SHOP</span>
        <span className="text-yellow-500 animate-pulse text-[8px] sm:text-xs">★</span>
      </div>

      <header 
        className={`sticky top-0 z-40 w-[calc(100%-12px)] sm:w-[calc(100%-24px)] mx-auto transition-all duration-300 rounded-b-[18px] xs:rounded-b-[24px] sm:rounded-b-[32px] border-b border-x border-slate-200/50 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-[0_12px_24px_-10px_rgba(0,0,0,0.06),0_2px_8px_-4px_rgba(0,0,0,0.02)] py-1.5 sm:py-2.5' 
            : 'bg-white/90 backdrop-blur-md shadow-[0_8px_16px_-8px_rgba(0,0,0,0.03)] py-2 sm:py-3.5'
        }`}
        id="navbar-header"
      >
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-1 xs:gap-2">
        {/* Brand Logo */}
        <button onClick={() => handleLinkClick('home')} className="focus:outline-none flex-shrink max-w-[50%] xs:max-w-[55%] min-w-0">
          <Logo logoUrl={branding.logoUrl} brandName={branding.brandName} />
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => handleLinkClick('home')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-bold tracking-normal transition-colors focus:outline-none ${
              currentRoute === 'home'
                ? 'text-[#0284C7] bg-[#E0F2FE]/50'
                : 'text-slate-600 hover:text-[#0284C7] hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          {/* Services Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              onMouseEnter={() => setServicesDropdownOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold tracking-normal transition-colors focus:outline-none ${
                currentRoute === 'services' || 
                currentRoute === 'service-detail' ||
                ['iphone-repair', 'android-repair', 'motherboard-repair', 'flip-fold-repair', 'display-replacement'].includes(currentRoute)
                  ? 'text-[#0284C7] bg-[#E0F2FE]/50'
                  : 'text-slate-600 hover:text-[#0284C7] hover:bg-slate-50'
              }`}
            >
              <span>Services</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Dropdown Popover */}
            <AnimatePresence>
              {servicesDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                  className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Specialized Repair Hubs</span>
                  </div>
                  <div className="space-y-0.5">
                    {serviceCategories.map((item) => {
                      const IconComp = item.icon;
                      const isActive = currentRoute === item.route;
                      return (
                        <button
                          key={item.route}
                          onClick={() => handleLinkClick(item.route)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                            isActive ? 'bg-[#E0F2FE]/60 text-[#0284C7]' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${isActive ? 'bg-[#0284C7] text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold">{item.label}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.filter(l => l.route !== 'home').map((link) => (
            <button
              key={link.route}
              onClick={() => handleLinkClick(link.route)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold tracking-normal transition-colors focus:outline-none ${
                currentRoute === link.route
                  ? 'text-[#0284C7] bg-[#E0F2FE]/50'
                  : 'text-slate-600 hover:text-[#0284C7] hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions CTA */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Status Tracker link */}
          <button
            onClick={() => handleLinkClick('track-service')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none ${
              currentRoute === 'track-service' 
                ? 'bg-slate-100 text-slate-800' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Track Booking
          </button>

          {/* WhatsApp Icon Trigger */}
          <a
            href={formattedWhatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ source: 'Navbar' })}
            className="flex items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm focus:outline-none"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-4.5 h-4.5" />
          </a>

          {/* WhatsApp Channel Broadcast Trigger */}
          <a
            href={contact.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 rounded-xl bg-emerald-950/10 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-sm focus:outline-none relative group"
            aria-label="Join Our WhatsApp Channel"
            title="Join Our WhatsApp Channel"
          >
            <Megaphone className="w-4.5 h-4.5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </a>

          {/* Location / Directions Icon Trigger */}
          <a
            href={contact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackDirectionsClick({ source: 'Navbar' })}
            className="flex items-center justify-center p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition-all shadow-sm focus:outline-none"
            aria-label="Find us on Google Maps"
            title="Directions on Google Maps"
          >
            <MapPin className="w-4.5 h-4.5" />
          </a>


          <button
            onClick={() => handleLinkClick('track-service')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-all focus:outline-none border border-slate-200"
          >
            Track Service
          </button>
          {/* Core Booking CTA */}
          <button
            onClick={() => {
              trackBookRepairClick({ source: 'Navbar' });
              handleLinkClick('book-repair');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow-md transition-all focus:outline-none"
          >
            <Calendar className="w-3.5 h-3.5" />
            BOOK A REPAIR
          </button>
        </div>

        {/* Mobile Navbar Buttons */}
        <div className="flex lg:hidden items-center gap-1 xs:gap-1.5 flex-shrink-0">

          <button
            onClick={() => handleLinkClick('track-service')}
            className="flex items-center gap-1 px-2 xs:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] xs:text-xs font-extrabold rounded-lg transition-all focus:outline-none border border-slate-200 whitespace-nowrap"
          >
            <span>Track</span>
          </button>
          {/* Direct Mobile Booking Icon CTA */}
          <button
            onClick={() => handleLinkClick('book-repair')}
            className="flex items-center gap-1 px-2 xs:px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-[10px] xs:text-xs font-extrabold rounded-lg shadow-sm transition-all focus:outline-none whitespace-nowrap"
          >
            <Calendar className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
            <span>Book</span>
          </button>

          {/* Toggle Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 xs:p-2 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-4 h-4 xs:w-5 xs:h-5" /> : <Menu className="w-4 h-4 xs:w-5 xs:h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-[60px] z-30 bg-black lg:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="fixed top-[60px] left-0 right-0 z-30 bg-white border-b border-slate-100 shadow-xl overflow-hidden lg:hidden"
            >
              <div className="px-4 py-5 space-y-2 max-h-[80vh] overflow-y-auto">
                {/* Home link */}
                <button
                  onClick={() => handleLinkClick('home')}
                  className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all focus:outline-none ${
                    currentRoute === 'home'
                      ? 'text-[#0284C7] bg-[#E0F2FE]/40'
                      : 'text-slate-600 hover:text-[#0284C7] hover:bg-slate-50'
                  }`}
                >
                  Home
                </button>

                {/* Repair Hubs accordion/block */}
                <div className="bg-slate-50/80 rounded-2xl p-2.5 border border-slate-100 my-1 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 block">Specialized Repair Hubs</span>
                  {serviceCategories.map((item) => {
                    const IconComp = item.icon;
                    const isActive = currentRoute === item.route;
                    return (
                      <button
                        key={item.route}
                        onClick={() => handleLinkClick(item.route)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors text-left ${
                          isActive ? 'bg-[#0284C7] text-white' : 'text-slate-700 hover:bg-white'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {navLinks.filter(l => l.route !== 'home').map((link) => (
                  <button
                    key={link.route}
                    onClick={() => handleLinkClick(link.route)}
                    className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all focus:outline-none ${
                      currentRoute === link.route
                        ? 'text-[#0284C7] bg-[#E0F2FE]/40'
                        : 'text-slate-600 hover:text-[#0284C7] hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                
                <div className="border-t border-slate-100 pt-4 mt-2 grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleLinkClick('track-service')}
                    className="flex items-center justify-center gap-1 px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Track Status
                  </button>
                  <a
                    href={formattedWhatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>

                {/* Mobile Get Directions CTA */}
                <a
                  href={contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284C7] rounded-xl text-xs font-bold transition-colors"
                  title="Open Location in Google Maps"
                >
                  <Navigation className="w-4 h-4 text-[#0284C7]" />
                  <span>Get Directions on Google Maps</span>
                </a>

                {/* Mobile Official WhatsApp Channel CTA */}
                <div className="pt-1">
                  <WhatsAppChannelCTA 
                    channelUrl={contact.whatsappChannelUrl} 
                    variant="compact" 
                  />
                </div>

                {/* Mobile Social Connections */}
                <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400">Connect:</span>
                  <a
                    href={contact.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors"
                    aria-label="Join Our WhatsApp Channel"
                    title="Join Our WhatsApp Channel"
                  >
                    <Megaphone className="w-4 h-4" />
                  </a>
                  {contact.facebook && (
                    <a
                      href={contact.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                      aria-label="Facebook"
                      title="MOBO SAVIOR Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-xl transition-colors"
                    aria-label="Instagram"
                    title="MOBO SAVIOR Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={contact.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-sky-50 text-[#0284C7] hover:bg-sky-100 rounded-xl transition-colors"
                    aria-label="Google Maps"
                    title="MOBO SAVIOR on Google Maps"
                  >
                    <MapPin className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${contact.phone}`}
                    className="p-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
                    aria-label="Call Phone"
                    title="Call MOBO SAVIOR"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}
