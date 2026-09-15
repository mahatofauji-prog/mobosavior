import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, FileText, CheckCircle2, Clock, AlertTriangle, Smartphone, Hammer, Truck } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

interface TrackServiceProps {
  onNavigate: (route: string) => void;
}

export default function TrackService({ onNavigate }: TrackServiceProps) {
  const [serviceId, setServiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId.trim()) return;

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const docRef = doc(db, 'service_bookings_public', serviceId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTrackingData(docSnap.data());
      } else {
        setError('No service request found with this ID. Please check and try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while tracking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { name: 'New Request', icon: FileText },
    { name: 'Request Confirmed', icon: CheckCircle2 },
    { name: 'Device Received', icon: Smartphone },
    { name: 'Diagnosis in Progress', icon: Search },
    { name: 'Repair in Progress', icon: Hammer },
    { name: 'Ready for Delivery', icon: Truck },
    { name: 'Completed', icon: CheckCircle2 }
  ];

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.findIndex(s => s.name === status);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black text-slate-900 font-sans tracking-tight">Track Your Service</h1>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
            Enter your unique Service ID to check the real-time status of your device repair.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="e.g. MOBO-20260911-1234"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all font-mono font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !serviceId.trim()}
              className="px-8 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track Service'}
            </button>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 text-rose-800 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <p>{error}</p>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {trackingData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
            >
              {/* Header Info */}
              <div className="bg-sky-50/50 p-6 sm:p-8 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service ID</p>
                    <p className="text-xl font-black text-slate-800 font-mono tracking-tight">{trackingData.service_id}</p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-lg border border-sky-100 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse"></div>
                    <span className="text-xs font-bold text-[#0284C7]">{trackingData.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                    <p className="text-sm font-semibold text-slate-800">{trackingData.customer_name_masked}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Device</p>
                    <p className="text-sm font-semibold text-slate-800">{trackingData.mobile_brand} {trackingData.mobile_model}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booking Date</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(trackingData.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Updated</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(trackingData.last_updated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-6 sm:p-8">
                <h3 className="text-sm font-bold text-slate-800 mb-6 font-sans">Service Progress</h3>
                
                <div className="relative">
                  <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
                  
                  <div className="space-y-6 relative">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getCurrentStepIndex(trackingData.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      const isCancelled = trackingData.status === 'Cancelled';
                      const Icon = step.icon;

                      if (isCancelled && index > 0) return null;

                      return (
                        <div key={step.name} className={`flex items-start gap-4 ${!isCompleted && !isCancelled ? 'opacity-40 grayscale' : ''}`}>
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 transition-colors ${
                            isCancelled 
                              ? 'bg-rose-100 text-rose-600 border-2 border-rose-200'
                              : isCurrent 
                                ? 'bg-[#0284C7] text-white shadow-md' 
                                : isCompleted 
                                  ? 'bg-sky-100 text-[#0284C7]' 
                                  : 'bg-slate-100 text-slate-400'
                          }`}>
                            {isCancelled && isCurrent ? <AlertTriangle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                          </div>
                          <div className="pt-2.5">
                            <h4 className={`text-sm font-bold ${
                              isCancelled 
                                ? 'text-rose-700'
                                : isCurrent 
                                  ? 'text-[#0284C7]' 
                                  : 'text-slate-700'
                            }`}>
                              {isCancelled && isCurrent ? 'Cancelled' : step.name}
                            </h4>
                            {isCurrent && (
                              <p className="text-xs text-slate-500 font-medium mt-1">
                                {isCancelled 
                                  ? 'This service request has been cancelled.' 
                                  : 'Currently at this stage.'}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  <span className="font-bold text-slate-700">Problem Summary:</span> {trackingData.problem_summary}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
