import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, FileText, CheckCircle2, Clock, AlertTriangle, Smartphone, Hammer, Truck, XCircle, RotateCcw } from 'lucide-react';
import { db } from '../lib/supabase';
import { doc, onSnapshot } from '../lib/supabase';

interface TrackServiceProps {
  onNavigate: (route: string) => void;
}

export default function TrackService({ onNavigate }: TrackServiceProps) {
  const [serviceId, setServiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId.trim()) return;

    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    const docRef = doc(db, 'service_bookings_public', serviceId.trim());
    
    const unsub = onSnapshot(docRef, (docSnap) => {
      setLoading(false);
      if (docSnap.exists()) {
        setTrackingData(docSnap.data());
        setError('');
      } else {
        setTrackingData(null);
        setError('Booking ID not found. Please check your Booking ID and try again.');
      }
    }, (err) => {
      console.error(err);
      setLoading(false);
      setError('An error occurred while tracking. Please try again.');
    });

    setUnsubscribe(() => unsub);
  };

  const sequenceSteps = [
    { name: 'Booking Received', icon: FileText, description: 'Your device repair request has been logged successfully.' },
    { name: 'Diagnosis', icon: Search, description: 'Our senior engineers are inspecting your device to find the root cause.' },
    { name: 'Parts Pending', icon: Clock, description: 'We are waiting for high-quality replacement parts to arrive.' },
    { name: 'Repairing', icon: Hammer, description: 'Our certified engineers are currently repairing your device.' },
    { name: 'Testing', icon: Smartphone, description: 'Post-repair diagnostic and quality-control testing in progress.' },
    { name: 'Ready For Pickup', icon: CheckCircle2, description: 'Your device is fully repaired and ready for pickup.' },
    { name: 'Delivered', icon: Truck, description: 'Repair completed and device has been safely delivered/picked up.' }
  ];

  const getTimelineSteps = (currentStatus: string) => {
    const steps = [...sequenceSteps];
    if (currentStatus === 'Cancelled') {
      steps.push({
        name: 'Cancelled',
        icon: XCircle,
        description: 'This service request has been cancelled.'
      });
    } else if (currentStatus === 'Set Return') {
      steps.push({
        name: 'Set Return',
        icon: RotateCcw,
        description: 'This device is marked to be returned without repair.'
      });
    }
    return steps;
  };

  const getStepState = (stepName: string, currentStatus: string) => {
    if ((stepName === 'Cancelled' && currentStatus === 'Cancelled') || 
        (stepName === 'Set Return' && currentStatus === 'Set Return')) {
      return 'current';
    }

    if (currentStatus === 'Cancelled' || currentStatus === 'Set Return') {
      if (stepName === 'Booking Received') {
        return 'completed';
      }
      return 'pending';
    }

    const seqNames = sequenceSteps.map(s => s.name);
    const currIdx = seqNames.indexOf(currentStatus);
    const stepIdx = seqNames.indexOf(stepName);

    if (stepIdx === -1) return 'pending';

    if (stepIdx < currIdx) return 'completed';
    if (stepIdx === currIdx) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black text-slate-900 font-sans tracking-tight">Track My Repair</h1>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
            Enter your unique Booking ID to check the real-time status of your device repair.
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
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Checking your repair status...</> : 'Track Repair'}
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booking ID</p>
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
                    {getTimelineSteps(trackingData.status).map((step) => {
                      const state = getStepState(step.name, trackingData.status);
                      const Icon = step.icon;

                      return (
                        <div 
                          key={step.name} 
                          className={`flex items-start gap-4 transition-all duration-300 ${
                            state === 'pending' ? 'opacity-40 grayscale' : ''
                          }`}
                        >
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 border transition-all duration-300 ${
                            state === 'completed'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : state === 'current'
                                ? step.name === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm animate-pulse'
                                  : step.name === 'Set Return'
                                    ? 'bg-slate-100 text-slate-700 border-slate-300 shadow-sm animate-pulse'
                                    : 'bg-[#0284C7] text-white border-[#0284C7] shadow-md'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="pt-2.5">
                            <h4 className={`text-sm font-bold tracking-tight ${
                              state === 'completed'
                                ? 'text-emerald-800'
                                : state === 'current'
                                  ? step.name === 'Cancelled'
                                    ? 'text-rose-700'
                                    : step.name === 'Set Return'
                                      ? 'text-slate-800'
                                      : 'text-[#0284C7]'
                                  : 'text-slate-700'
                            }`}>
                              {step.name}
                              {state === 'completed' && (
                                <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded-md">✓ Completed</span>
                              )}
                              {state === 'current' && (
                                <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                                  step.name === 'Cancelled'
                                    ? 'text-rose-600 bg-rose-100'
                                    : step.name === 'Set Return'
                                      ? 'text-slate-700 bg-slate-200'
                                      : 'text-[#0284C7] bg-sky-100'
                                }`}>● Current</span>
                              )}
                            </h4>
                            
                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                              {state === 'current' ? step.description : (state === 'completed' ? 'Successfully processed.' : 'Pending progression.')}
                            </p>
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
