import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Search, Loader2, Edit3, CheckCircle2, Clock, 
  AlertTriangle, Hammer, Smartphone, Truck, ExternalLink, Download, X 
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from '../../lib/supabase';
import { ServiceBooking } from '../../types';

export default function AdminServiceBookings() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'service_bookings'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bData: ServiceBooking[] = [];
      const seenIds = new Set<string>();
      snapshot.forEach((doc) => {
        const d = doc.data() as any;
        const sId = d.service_id || d.serviceId || d.id;
        if (sId && !seenIds.has(sId)) {
          seenIds.add(sId);
          bData.push({
            id: d.id || sId,
            service_id: sId,
            customer_name: d.customer_name || d.customerName || 'Customer',
            address: d.address || '',
            pin_code: d.pin_code || d.pinCode || '',
            contact_number: d.contact_number || d.phone || '',
            whatsapp_number: d.whatsapp_number || d.whatsapp || d.contact_number || d.phone || '',
            mobile_brand: d.mobile_brand || d.brand || '',
            mobile_model: d.mobile_model || d.model || '',
            problem: d.problem || d.problemDescription || '',
            preferred_date: d.preferred_date || d.preferredDate || '',
            preferred_time: d.preferred_time || d.preferredTime || '',
            front_image_url: d.front_image_url || d.frontImageUrl || '',
            back_image_url: d.back_image_url || d.backImageUrl || '',
            status: d.status || 'Booking Received',
            created_at: d.created_at || d.createdAt || new Date().toISOString(),
            updated_at: d.updated_at || new Date().toISOString()
          });
        }
      });
      setBookings(bData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredBookings = bookings.filter(b => 
    (b.service_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.contact_number || '').includes(searchTerm) ||
    (b.whatsapp_number || '').includes(searchTerm) ||
    (b.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.mobile_brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.mobile_model || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statuses = [
    'Booking Received', 
    'Diagnosis', 
    'Repairing', 
    'Testing', 
    'Ready for Pickup', 
    'Delivered', 
    'Cancelled'
  ];

  const updateStatus = async (newStatus: string) => {
    if (!selectedBooking || updating) return;
    setUpdating(true);
    try {
      const batch = writeBatch(db);
      
      // Update private collection
      const privateRef = doc(db, 'service_bookings', selectedBooking.id);
      batch.update(privateRef, { 
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      // Update public collection
      const publicRef = doc(db, 'service_bookings_public', selectedBooking.service_id);
      batch.update(publicRef, {
        status: newStatus,
        last_updated: new Date().toISOString()
      });

      // Update general bookings collection
      const generalRef = doc(db, 'bookings', selectedBooking.service_id);
      batch.update(generalRef, {
        status: newStatus === 'Booking Received' ? 'Pending' : (newStatus === 'Repairing' || newStatus === 'Diagnosis' ? 'In Progress' : (newStatus === 'Delivered' ? 'Completed' : newStatus)),
        updated_at: new Date().toISOString()
      });

      await batch.commit();
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Booking Received': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Diagnosis': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Repairing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Testing': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Ready for Pickup': return 'bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="space-y-6 text-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-sans flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0284C7]" />
            Service Bookings
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Manage customer repair requests, device photos, and live statuses.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0284C7] focus:ring-1 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#0284C7] animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service ID</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Device</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-slate-800">{booking.service_id}</td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-800">{booking.customer_name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{booking.contact_number}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-slate-700">{booking.mobile_brand}</p>
                      <p className="text-[11px] text-slate-500">{booking.mobile_model}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-medium">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 sm:p-8 space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 font-sans tracking-tight pr-12">
                    Service Request Details
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-mono text-sm font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {selectedBooking.service_id}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                        <FileText className="w-3.5 h-3.5" /> Customer Info
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Name</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedBooking.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Contact</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedBooking.contact_number}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">WhatsApp</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedBooking.whatsapp_number}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">PIN Code</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedBooking.pin_code}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Full Address</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedBooking.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Device Info */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                        <Smartphone className="w-3.5 h-3.5" /> Device & Problem
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Brand & Model</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedBooking.mobile_brand} {selectedBooking.mobile_model}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Preferred Slot</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedBooking.preferred_date} • {selectedBooking.preferred_time}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Problem Described</p>
                          <p className="text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-200 mt-1">
                            {selectedBooking.problem}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Status & Photos */}
                  <div className="space-y-6">
                    {/* Status Update */}
                    <div className="bg-white border-2 border-[#0284C7]/20 rounded-2xl p-5 space-y-4">
                      <h4 className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider">
                        Update Status
                      </h4>
                      <select
                        value={selectedBooking.status}
                        onChange={(e) => updateStatus(e.target.value)}
                        disabled={updating}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none bg-slate-50 font-medium"
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {updating && <p className="text-xs text-[#0284C7] animate-pulse">Updating status...</p>}
                    </div>

                    {/* Device Photos */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                        Device Photos
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold text-slate-600 mb-2 uppercase">Front Photo</p>
                          <div className="bg-slate-200 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                            {selectedBooking.front_image_url ? (
                              <img 
                                src={selectedBooking.front_image_url} 
                                alt="Front" 
                                className="object-contain w-full h-full cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => window.open(selectedBooking.front_image_url, '_blank')}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`text-slate-400 text-xs font-semibold ${selectedBooking.front_image_url ? 'hidden' : 'block absolute'}`}>
                              Image unavailable
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-bold text-slate-600 mb-2 uppercase">Back Photo</p>
                          <div className="bg-slate-200 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                            {selectedBooking.back_image_url ? (
                              <img 
                                src={selectedBooking.back_image_url} 
                                alt="Back" 
                                className="object-contain w-full h-full cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => window.open(selectedBooking.back_image_url, '_blank')}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`text-slate-400 text-xs font-semibold ${selectedBooking.back_image_url ? 'hidden' : 'block absolute'}`}>
                              Image unavailable
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
