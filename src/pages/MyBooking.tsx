import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Booking, BookingStatus, ContactSettings } from '../types';
import { Search, Loader2, AlertCircle, Phone, MessageSquare, Calendar, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyBookingProps {
  contact: ContactSettings;
}

export default function MyBooking({ contact }: MyBookingProps) {
  const [bookingId, setBookingId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBooking(null);

    const cleanId = bookingId.trim().toUpperCase();
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');

    if (!cleanId || !cleanPhone) {
      setError('Please provide both the Booking ID and phone number.');
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, 'bookings', cleanId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Booking;
        // Verify customer phone matches the booking
        const savedPhoneClean = data.phone.trim().replace(/\s+/g, '');
        
        if (savedPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(savedPhoneClean)) {
          setBooking({ ...data, id: docSnap.id });
        } else {
          setError('Verification failed. The phone number does not match this Booking ID.');
        }
      } else {
        setError('No active booking found matching this ID. Please verify the ID and try again.');
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setError('An error occurred while communicating with the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Status index for visual timeline
  const STATUSES: BookingStatus[] = ['Pending', 'Confirmed', 'In Progress', 'Ready for Pickup', 'Completed'];

  const getStatusIndex = (currentStatus: BookingStatus) => {
    if (currentStatus === 'Cancelled') return -1;
    return STATUSES.indexOf(currentStatus);
  };

  const getStatusColor = (currentStatus: BookingStatus) => {
    switch (currentStatus) {
      case 'Pending': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'Confirmed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'In Progress': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'Ready for Pickup': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Completed': return 'text-emerald-700 bg-emerald-100 border-emerald-300';
      case 'Cancelled': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const formattedWhatsappLink = (id: string) => {
    const msg = `Hello MOBO SAVIOR, I want to enquire about the status of my booking ${id}.`;
    return `https://wa.me/91${contact.whatsapp.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] font-bold tracking-widest text-[#0284C7] uppercase font-sans">Live Repair Progress</span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">Track Your Service</h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
          Enter your unique reference ID and the phone number provided during your booking to load live bench updates, statuses, and technician notes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Lookup Form */}
        <div className="md:col-span-5 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm font-sans pb-1.5 border-b border-slate-100">
            Secure Verification
          </h3>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Booking ID *
              </label>
              <input
                type="text"
                required
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g. MS-2026-12345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:border-[#0284C7] outline-none text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Customer Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#0284C7] outline-none text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Searching Lab Files...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  Track Repair Progress
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Display Tracker Details */}
        <div className="md:col-span-7">
          <AnimatePresence mode="wait">
            {booking ? (
              <motion.div
                key="booking-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 text-slate-700 text-left space-y-6 shadow-sm"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">Reference: {booking.id}</span>
                    <h3 className="text-xl font-black text-slate-900 font-sans">{booking.serviceName}</h3>
                    <p className="text-xs text-slate-500 font-bold">Device: {booking.brand} {booking.model}</p>
                  </div>
                  <span className={`self-start sm:self-center px-3 py-1 rounded-full border text-xs font-extrabold shadow-sm ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Status Timeline */}
                {booking.status !== 'Cancelled' ? (
                  <div className="space-y-5 py-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-sans">Lab Status Tracking</h4>
                    <div className="grid grid-cols-5 gap-1.5 relative">
                      {STATUSES.map((stat, i) => {
                        const currentActiveIndex = getStatusIndex(booking.status);
                        const isPast = i < currentActiveIndex;
                        const isCurrent = i === currentActiveIndex;
                        return (
                          <div key={stat} className="flex flex-col items-center text-center space-y-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
                              isCurrent 
                                ? 'bg-[#0284C7] border-[#0284C7] text-white shadow-md shadow-sky-100 scale-105'
                                : isPast
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              {isPast ? '✓' : i + 1}
                            </div>
                            <span className={`text-[9px] font-extrabold leading-tight tracking-tight ${isCurrent ? 'text-[#0284C7]' : 'text-slate-400'}`}>
                              {stat}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <div>
                      <span className="font-bold block text-sm mb-0.5">Booking Cancelled</span>
                      This service appointment has been cancelled. Please contact Saddam Bhai directly if you believe this was an error.
                    </div>
                  </div>
                )}

                {/* Notes and scheduling details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                  <div className="space-y-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointment Day</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
                        {booking.preferredDate}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preferred Time</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                        {booking.preferredTime}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Technician's Notes</span>
                      <span className="text-slate-600 leading-relaxed mt-0.5 font-medium italic">
                        {booking.notes || 'Your device is registered in our files. Saddam will perform a dynamic diagnosis when you arrive.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call & WhatsApp actions */}
                <div className="border-t border-slate-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={formattedWhatsappLink(booking.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 fill-white text-emerald-500" />
                    INQUIRE VIA WHATSAPP
                  </a>
                  <a
                    href={`tel:${contact.phone}`}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    CALL SERVICE LAB
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 p-12 rounded-3xl text-center text-slate-400 h-full flex flex-col justify-center items-center space-y-3 min-h-[300px]">
                <ShieldCheck className="w-12 h-12 text-slate-300" />
                <div className="space-y-1 max-w-sm">
                  <h4 className="font-bold text-slate-700 text-sm">Enter Details to Load Tracker</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Once verified, we will display live motherboard soldering metrics, screen installation statuses, and Saddam Bhai's workbench notes.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
