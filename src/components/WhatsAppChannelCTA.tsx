import React from 'react';
import { ArrowRight, Sparkles, Megaphone, Bell, CheckCircle2 } from 'lucide-react';

interface WhatsAppChannelCTAProps {
  channelUrl?: string;
  variant?: 'section' | 'card' | 'compact' | 'footer';
  className?: string;
}

export const DEFAULT_WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K';

export default function WhatsAppChannelCTA({
  channelUrl = DEFAULT_WHATSAPP_CHANNEL_URL,
  variant = 'section',
  className = ''
}: WhatsAppChannelCTAProps) {
  const targetUrl = channelUrl && channelUrl.trim() !== '' ? channelUrl.trim() : DEFAULT_WHATSAPP_CHANNEL_URL;

  // Compact variant: Ideal for Mobile Menu or Sidebars
  if (variant === 'compact') {
    return (
      <div 
        className={`rounded-2xl p-4 bg-gradient-to-br from-emerald-900/90 via-slate-900 to-slate-950 border border-emerald-500/30 text-white shadow-md relative overflow-hidden ${className}`}
      >
        {/* Subtle background glow */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-950/50">
            <Megaphone className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="space-y-1 text-left min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full">
                Official Channel
              </span>
            </div>
            <h4 className="text-xs font-black text-white leading-tight font-sans">
              Join Our WhatsApp Channel
            </h4>
            <p className="text-[10px] text-slate-300 leading-relaxed font-medium line-clamp-2">
              Get the latest repair updates, special offers, service information and announcements from MOBO SAVIOR.
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-500/20 relative z-10">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            title="Join Our WhatsApp Channel"
          >
            <span>Join Our WhatsApp Channel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Footer variant: Dark theme integration for the footer strip
  if (variant === 'footer') {
    return (
      <div 
        className={`bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/25 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden ${className}`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Broadcast Updates
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight font-sans">
                Join Our WhatsApp Channel
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-medium">
                Get the latest repair updates, special offers, service information and announcements from MOBO SAVIOR.
              </p>
            </div>
          </div>

          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98]"
            title="Join Our WhatsApp Channel"
          >
            <span>Join Our WhatsApp Channel →</span>
          </a>
        </div>
      </div>
    );
  }

  // Card variant: For Contact Page column or side widget
  if (variant === 'card') {
    return (
      <div 
        className={`bg-gradient-to-br from-emerald-50 via-white to-sky-50/50 rounded-2xl border border-emerald-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden ${className}`}
      >
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
              WhatsApp Channel
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight">
              Join Our WhatsApp Channel
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Get the latest repair updates, special offers, service information and announcements from MOBO SAVIOR.
            </p>
          </div>

          <div className="pt-2">
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              title="Join Our WhatsApp Channel"
            >
              <span>Join Our WhatsApp Channel →</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Section variant: Full-width responsive section for Home Page
  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-emerald-500/30">
        {/* Subtle ambient lighting decorations */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 text-center lg:text-left">
          {/* Left info column */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] sm:text-xs font-black tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>OFFICIAL BROADCAST COMMUNITY</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-sans leading-tight">
              Join Our WhatsApp Channel
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-medium">
              Get the latest repair updates, special offers, service information and announcements from MOBO SAVIOR.
            </p>

            {/* Feature highlights chips */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-[11px] text-emerald-200/90 font-semibold">
              <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Daily Repair Updates
              </span>
              <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Exclusive Offers
              </span>
              <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Privacy & No Spam
              </span>
            </div>
          </div>

          {/* Right Action Button Column */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-center">
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
              title="Join Our WhatsApp Channel"
            >
              <span>Join Our WhatsApp Channel →</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
