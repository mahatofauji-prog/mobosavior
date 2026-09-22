import { ContactSettings, BusinessHours } from '../types';
import { Phone, MessageSquare, Instagram, Facebook, MapPin, Navigation, Clock, ShieldAlert, Compass } from 'lucide-react';
import { trackPhoneCallClick, trackWhatsAppClick, trackDirectionsClick } from '../lib/analytics';
import WhatsAppChannelCTA from '../components/WhatsAppChannelCTA';

interface ContactProps {
  contact: ContactSettings;
  hours: BusinessHours;
}

export default function Contact({ contact, hours }: ContactProps) {
  const formattedWhatsappLink = `https://wa.me/91${contact.whatsapp.replace(/\s+/g, '')}?text=Hello%20MOBO%20SAVIOR,%20I%20want%20to%20enquire%20about%20mobile%20repair%20service.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-left space-y-2 border-b border-slate-100 pb-5 max-w-2xl">
        <span className="text-[10px] font-bold tracking-widest text-[#0284C7] uppercase font-sans">Walk-in Lab Info</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">Contact & Location</h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
          Find our official physical service lab at Hattola More, Purulia, or communicate directly with Saddam Bhai for estimates and diagnostic details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info details */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
            {/* Branding Name & Address */}
            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-slate-800 font-sans">{contact.name || 'MOBO SAVIOR'}</h2>
              <div className="flex gap-2.5 text-xs text-slate-600 font-medium leading-relaxed">
                <MapPin className="w-5 h-5 text-[#0284C7] flex-shrink-0" />
                <p>{contact.address || 'ROOM NO B4, SUPER MERKET, HATTOLA MORE, PURULIA, WEST BENGAL 723101, INDIA'}</p>
              </div>
            </div>

            {/* Operating hours */}
            <div className="flex gap-2.5 items-start text-xs text-slate-600 font-medium border-t border-slate-50 pt-4">
              <Clock className="w-5 h-5 text-[#0284C7] flex-shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800">Operating Lab Hours</h4>
                <p className="text-slate-500 mt-0.5">Mon-Fri: {hours.monFri} <br/> Saturday: {hours.saturday}</p>
                <p className="text-rose-500 font-bold mt-0.5">Sunday: {hours.sunday}</p><p className="text-xs text-sky-600 font-medium mt-1">{hours.hoursNote}</p>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 border-t border-slate-50 pt-5">
              <a
                href={`tel:${contact.phone}`}
                onClick={() => trackPhoneCallClick({ source: 'Contact Page' })}
                className="w-full py-3 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4.5 h-4.5" />
                CALL NOW: {contact.phone}
              </a>

              <a
                href={formattedWhatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ source: 'Contact Page' })}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4.5 h-4.5 fill-white text-emerald-500" />
                WHATSAPP CHAT
              </a>

              <a
                href={contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackDirectionsClick({ source: 'Contact Page' })}
                className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-white" />
                GET DIRECTIONS ON GOOGLE MAPS
              </a>

              {contact.facebook && (
                <a
                  href={contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Facebook className="w-4.5 h-4.5" />
                  FOLLOW ON FACEBOOK
                </a>
              )}

              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Instagram className="w-4.5 h-4.5" />
                FOLLOW ON INSTAGRAM
              </a>
            </div>
          </div>

          {/* WhatsApp Channel CTA Card */}
          <WhatsAppChannelCTA 
            channelUrl={contact.whatsappChannelUrl} 
            variant="card" 
          />

          <div className="bg-sky-50 border border-sky-100/60 p-4 rounded-xl text-xs text-sky-800 leading-relaxed flex items-start gap-2.5">
            <Compass className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Locational Landmark:</span> We are located inside the popular Super Market building at Hattola More in Purulia town. Walk directly to Room No B4 on the ground floor to reach our diagnostic lab.
            </div>
          </div>
        </div>

        {/* Right: Interactive map placement */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-3 relative h-[380px] lg:h-[480px]">
          {/* Embedding standard Google map style iframe cleanly */}
          <iframe
            src={contact.mapIframeUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.764953935399!2d86.365167!3d23.332194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5dede64253db5%3A0x6b48435d8869ce0d!2sSuper%20Market%2C%20Purulia!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"}
            className="w-full h-full border-0 rounded-2xl"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="MOBO SAVIOR Purulia Lab Location Map"
          />

          {/* Floating Get Directions CTA button on the map frame */}
          <div className="absolute top-6 right-6 z-10">
            <a
              href={contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/95 hover:bg-white backdrop-blur shadow-md hover:shadow-lg text-slate-800 hover:text-[#0284C7] px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border border-slate-200/80 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </div>

      {/* Full Width Community Channel CTA */}
      <WhatsAppChannelCTA 
        channelUrl={contact.whatsappChannelUrl} 
        variant="section" 
      />
    </div>
  );
}
