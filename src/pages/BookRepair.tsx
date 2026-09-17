import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Copy, ClipboardCheck, ArrowRight, Sparkles, MessageSquare, Phone, Home } from 'lucide-react';
import { Service, ContactSettings, Brand, Branch, PhoneModel, PriceItem } from '../types';
import BookingForm from '../components/BookingForm';

interface BookRepairProps {
  services: Service[];
  contact: ContactSettings;
  branches: Branch[];
  onNavigate: (route: string) => void;
}

export default function BookRepair({ services, contact, branches, onNavigate }: BookRepairProps) {
  const [bookingData, setBookingData] = useState<{ id: string; customerName: string; brand: string; model: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [preselectedSlug, setPreselectedSlug] = useState('');
  const [preselectedBranchId, setPreselectedBranchId] = useState('');

  // Extract query parameters manually
  useEffect(() => {
    const handleHashQuery = () => {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const queryPart = hash.split('?')[1];
        const params = new URLSearchParams(queryPart);
        const serviceParam = params.get('service');
        const branchParam = params.get('branch');
        if (serviceParam) {
          setPreselectedSlug(serviceParam);
        }
        if (branchParam) {
          setPreselectedBranchId(branchParam);
        }
      }
    };
    handleHashQuery();
    window.addEventListener('hashchange', handleHashQuery);
    return () => window.removeEventListener('hashchange', handleHashQuery);
  }, []);

  const handleCopyId = () => {
    if (bookingData?.id) {
      navigator.clipboard.writeText(bookingData.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate Booking-specific WhatsApp CTA
  const getWhatsappLink = () => {
    if (!bookingData) return '#';
    const msg = `Hello MOBO SAVIOR,\n\nName: ${bookingData.customerName}\nService ID: ${bookingData.id}\nDevice: ${bookingData.brand} ${bookingData.model}\n\nI have submitted a repair request through your website.\n\nPlease confirm my service request.\n\nThank you.`;
    return `https://wa.me/91${contact.whatsapp.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {!bookingData ? (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-[#0284C7] uppercase font-sans">Service Booking</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
              Book Your Repair
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Complete our simple, secure appointment booking form below. Bring your device to our Purulia Super Market lab.
            </p>
          </div>

          <BookingForm
            services={services}
            branches={branches}
            preselectedServiceSlug={preselectedSlug}
            preselectedBranchId={preselectedBranchId}
            onSuccess={(data) => setBookingData(data)}
            contactPhone={contact.phone}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden text-center text-slate-700"
        >
          {/* Header checkmark */}
          <div className="bg-emerald-500 text-white py-10 px-6 relative flex flex-col items-center">
            <div className="absolute top-4 right-4 text-emerald-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-4 border-white mb-4 shadow-sm animate-bounce">
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight">Service Request Submitted Successfully</h2>
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-left mb-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Customer Name</p>
                <p className="font-bold text-slate-800 text-sm">{bookingData.customerName}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Mobile Model</p>
                <p className="font-bold text-slate-800 text-sm">{bookingData.brand} {bookingData.model}</p>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b border-sky-200/50 pb-2">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Service ID</span>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-sky-900">
                  <span>{bookingData.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded hover:bg-sky-200 text-sky-600 transition-colors"
                    title="Copy Service ID"
                  >
                    {copied ? (
                      <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-sky-700 leading-relaxed text-left font-semibold">
                Please save your Service ID. You can use it to track your service request online.
              </p>
            </div>

            {/* Actions CTA buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 border-t border-slate-100 pt-6">
              <a
                href={getWhatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5 fill-white text-[#25D366]" />
                SEND ENQUIRY ON WHATSAPP
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('track-service')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0284C7] hover:text-[#0369A1]"
              >
                Track Service
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></div>
              <button
                onClick={() => onNavigate('')}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                <Home className="w-3.5 h-3.5" />
                Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
