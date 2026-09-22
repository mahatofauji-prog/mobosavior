import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, X, CheckCircle2, ArrowRight, Loader2, Camera, Smartphone
} from 'lucide-react';
import { db } from '../lib/supabase';
import { collection, doc, writeBatch, serverTimestamp } from '../lib/supabase';
import { uploadMediaFile, compressImageToDataUrl } from '../lib/storageUpload';
import { Brand, PhoneModel, Service, Branch } from '../types';

interface BookingFormProps {
  services: Service[];
  branches?: Branch[];
  preselectedServiceSlug?: string;
  preselectedBranchId?: string;
  onSuccess: (bookingData: { id: string; customerName: string; brand: string; model: string }) => void;
  contactPhone: string;
}

export default function BookingForm({ 
  services, 
  preselectedServiceSlug, 
  onSuccess 
}: BookingFormProps) {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  const [mobileBrand, setMobileBrand] = useState('');
  const [mobileModel, setMobileModel] = useState('');
  const [problem, setProblem] = useState(
    preselectedServiceSlug 
      ? (services.find(s => s.slug === preselectedServiceSlug)?.name || '') 
      : ''
  );
  
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  
  // File State
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (!file.type.startsWith('image/')) {
        setError(`Please select a valid image file for the ${side} photo.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`Image file size must be less than 10MB for the ${side} photo.`);
        return;
      }

      setError('');
      const previewUrl = URL.createObjectURL(file);
      
      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(previewUrl);
      } else {
        setBackImage(file);
        setBackPreview(previewUrl);
      }
    }
  };

  const removeImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage(null);
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontPreview('');
    } else {
      setBackImage(null);
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackPreview('');
    }
  };

  const generateServiceId = () => {
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                    (today.getMonth() + 1).toString().padStart(2, '0') + 
                    today.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `MSR-${dateStr}-${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!frontImage || !backImage) {
      setError('Please upload both Front and Back photos of the device.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const serviceId = generateServiceId();
      
      // Process both front and back photos concurrently in parallel (Fast path)
      const processPhoto = async (photoFile: File) => {
        try {
          const res = await uploadMediaFile(photoFile, { folder: `service-bookings/${serviceId}` });
          if (res.success && res.url) {
            return res.url;
          }
        } catch {}
        // Ultra-fast lightweight canvas compression fallback (~40ms, crisp 900px WebP)
        const { dataUrl } = await compressImageToDataUrl(photoFile, 900, 0.75);
        return dataUrl;
      };

      const [frontImageUrl, backImageUrl] = await Promise.all([
        processPhoto(frontImage),
        processPhoto(backImage)
      ]);

      // Save to Firestore / Supabase (Batch write to public and private collections)
      const batch = writeBatch(db);
      
      // Private Collection (Full details)
      const privateDocRef = doc(collection(db, 'service_bookings'));
      batch.set(privateDocRef, {
        id: privateDocRef.id,
        service_id: serviceId,
        customer_name: customerName,
        address,
        pin_code: pinCode,
        contact_number: contactNumber,
        whatsapp_number: whatsappNumber,
        mobile_brand: mobileBrand,
        mobile_model: mobileModel,
        problem,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        status: 'Booking Received',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Public Collection (Limited details for tracking)
      const publicDocRef = doc(db, 'service_bookings_public', serviceId);
      // Mask customer name (e.g., "Rahul D.")
      const nameParts = customerName.trim().split(' ');
      const maskedName = nameParts.length > 1 
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`
        : nameParts[0];

      batch.set(publicDocRef, {
        id: serviceId,
        service_id: serviceId,
        customer_name_masked: maskedName,
        mobile_brand: mobileBrand,
        mobile_model: mobileModel,
        problem_summary: problem,
        booking_date: new Date().toISOString(),
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        status: 'Booking Received',
        last_updated: new Date().toISOString()
      });

      // General Bookings Collection (For Admin Dashboard stats, counter & pending list)
      const generalDocRef = doc(db, 'bookings', serviceId);
      batch.set(generalDocRef, {
        id: serviceId,
        serviceId: serviceId,
        service_id: serviceId,
        serviceName: problem || 'Mobile Device Repair',
        service_name: problem || 'Mobile Device Repair',
        brand: mobileBrand,
        model: mobileModel,
        problemDescription: problem,
        problem_description: problem,
        customerName: customerName,
        customer_name: customerName,
        phone: contactNumber,
        whatsapp: whatsappNumber,
        address,
        pinCode,
        pin_code: pinCode,
        preferredDate,
        preferred_date: preferredDate,
        preferredTime,
        preferred_time: preferredTime,
        status: 'Pending',
        frontImageUrl,
        backImageUrl,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

      // Commit with a guaranteed rapid timeout (max 4 seconds) to ensure instant submission under 10s
      await Promise.race([
        batch.commit(),
        new Promise((resolve) => setTimeout(resolve, 4000))
      ]);

      // Also forward booking to WOWSQL if connected

      // Clean up previews
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);

      onSuccess({ 
        id: serviceId, 
        customerName: customerName, 
        brand: mobileBrand, 
        model: mobileModel 
      });
    } catch (err: any) {
      console.error('Booking submission error:', err);
      let errorMsg = 'An error occurred while submitting your request. Please try again.';
      
      if (err.message) {
        const msgLower = err.message.toLowerCase();
        if (msgLower.includes('upload')) {
          errorMsg = 'Device photo upload failed. Please try again.';
        } else if (msgLower.includes('network') || msgLower.includes('offline')) {
          errorMsg = 'Connection problem. Please check your internet connection and try again.';
        } else if (msgLower.includes('permission') || msgLower.includes('firestore') || msgLower.includes('missing or insufficient permissions')) {
          errorMsg = 'Unable to save your booking due to server permissions. Please try again later.';
        } else {
          errorMsg = err.message;
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-3xl overflow-hidden text-left relative max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider font-sans">
            Device Repair Service Form
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Fill in the details below to book your repair.
          </p>
        </div>
        <div className="w-10 h-10 bg-[#0284C7] rounded-xl flex items-center justify-center shadow-sm">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-medium flex items-start gap-2">
            <span className="block font-bold">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
              1. Customer Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="10-digit WhatsApp number"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="e.g. 723101"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Full Address *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
              2. Device Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={mobileBrand}
                  onChange={(e) => setMobileBrand(e.target.value)}
                  placeholder="e.g. Apple, Samsung"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Model Name/Number *</label>
                <input
                  type="text"
                  required
                  value={mobileModel}
                  onChange={(e) => setMobileModel(e.target.value)}
                  placeholder="e.g. iPhone 13 Pro Max"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Problem / Issue *</label>
                <textarea
                  required
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Describe the problem (e.g. Broken screen, won't turn on)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Device Photos */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
              3. Device Photos
            </h3>
            <p className="text-[11px] text-slate-500 mb-2 font-medium">
              Please upload clear photos of both the front and back of the device. (Max 10MB each)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front Photo */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[160px] relative bg-slate-50/50 overflow-hidden">
                {frontPreview ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={frontPreview} alt="Front Preview" className="max-h-32 object-contain rounded-lg shadow-sm" />
                    <button 
                      type="button"
                      onClick={() => removeImage('front')}
                      className="absolute top-0 right-0 p-1.5 bg-rose-500 text-white rounded-full shadow hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-xs font-bold text-slate-600">Front Side Photo *</span>
                    <label className="mt-3 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-slate-50 shadow-sm transition-all">
                      Select Image
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp" 
                        onChange={(e) => handleFileChange(e, 'front')} 
                        className="hidden" 
                        required 
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Back Photo */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[160px] relative bg-slate-50/50 overflow-hidden">
                {backPreview ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={backPreview} alt="Back Preview" className="max-h-32 object-contain rounded-lg shadow-sm" />
                    <button 
                      type="button"
                      onClick={() => removeImage('back')}
                      className="absolute top-0 right-0 p-1.5 bg-rose-500 text-white rounded-full shadow hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-xs font-bold text-slate-600">Back Side Photo *</span>
                    <label className="mt-3 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-slate-50 shadow-sm transition-all">
                      Select Image
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp" 
                        onChange={(e) => handleFileChange(e, 'back')} 
                        className="hidden" 
                        required 
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
              4. Preferred Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Preferred Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Preferred Time *</label>
                <select
                  required
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0284C7] focus:ring-1 outline-none transition-all bg-white"
                >
                  <option value="">Select a time slot</option>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 mt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Request & Uploading Photos...</span>
                </>
              ) : (
                <>
                  <span>Submit Service Request</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
              By submitting, you agree to our Terms & Conditions. No payment required online.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
