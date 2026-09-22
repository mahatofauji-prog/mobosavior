import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { compressImageToDataUrl, validateImageFile } from '../lib/storageUpload';
import { 
  X, Star, Upload, Image as ImageIcon, CheckCircle2, Copy, 
  ExternalLink, Sparkles, ShieldCheck, AlertCircle, Loader2, ArrowRight,
  User, MessageSquare, Phone, Tag
} from 'lucide-react';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
  googleReviewUrl?: string;
}

export default function SubmitReviewModal({
  isOpen,
  onClose,
  onReviewSubmitted,
  googleReviewUrl = 'https://maps.app.goo.gl/tU41BvTCk3dRAn6r9'
}: SubmitReviewModalProps) {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [phone, setPhone] = useState('');
  
  // Photo State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flow State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success' | 'google_flow'>('form');
  const [copiedReview, setCopiedReview] = useState(false);

  // Submitted Review Snapshot for Google flow
  const [submittedReviewData, setSubmittedReviewData] = useState<{
    name: string;
    rating: number;
    text: string;
    photoUrl?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const validation = validateImageFile(file, 10);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please select a valid JPG, PNG, or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const { dataUrl } = await compressImageToDataUrl(file, 800, 0.85);
      setPhotoPreview(dataUrl);
      setPhotoFile(file);
    } catch {
      setErrorMessage('Could not process image. Please try another photo.');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation
    const cleanName = customerName.trim();
    const cleanReview = reviewText.trim();
    const cleanBookingId = bookingId.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your name (at least 2 characters).');
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (!cleanReview || cleanReview.length < 10) {
      setErrorMessage('Please write at least 10 characters describing your repair experience.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Prepare payload
      const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const isVerified = Boolean(cleanBookingId || cleanPhone);
      const timestamp = new Date().toISOString();

      const newReviewPayload = {
        id: reviewId,
        customer_name: cleanName,
        customerName: cleanName,
        reviewer_name: cleanName,
        reviewerName: cleanName,
        rating: rating,
        review_text: cleanReview,
        reviewText: cleanReview,
        customer_photo_url: photoPreview || null,
        customerPhotoUrl: photoPreview || null,
        source: 'website' as const,
        active: false,
        is_active: false,
        comment: 'status:pending',
        is_verified: isVerified,
        service_availed: cleanBookingId || null,
        device_model: cleanPhone || null,
        featured: false,
        display_order: 0,
        displayOrder: 0,
        created_at: timestamp,
        createdAt: timestamp,
        updated_at: timestamp,
        updatedAt: timestamp
      };

      // 3. Save to Supabase
      const { error: insertErr } = await supabase
        .from('reviews')
        .insert([newReviewPayload]);

      if (insertErr) {
        console.error('Supabase review insert error:', insertErr);
        throw new Error('Database error saving review. Please try again.');
      }

      // Save snapshot for Google flow & Success screen
      setSubmittedReviewData({
        name: cleanName,
        rating,
        text: cleanReview,
        photoUrl: photoPreview || undefined
      });

      setStep('success');
      onReviewSubmitted?.();
    } catch (err: any) {
      console.error('Review submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit review. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReviewText = () => {
    if (!submittedReviewData?.text) return;
    navigator.clipboard.writeText(submittedReviewData.text);
    setCopiedReview(true);
    setTimeout(() => setCopiedReview(false), 3000);
  };

  const handleOpenGoogleReview = () => {
    window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleResetAndClose = () => {
    setCustomerName('');
    setRating(5);
    setReviewText('');
    setBookingId('');
    setPhone('');
    setPhotoPreview(null);
    setPhotoFile(null);
    setErrorMessage(null);
    setStep('form');
    setSubmittedReviewData(null);
    onClose();
  };

  const ratingDescriptions: Record<number, string> = {
    1: '1 Star - Disappointed with service',
    2: '2 Stars - Below expectations',
    3: '3 Stars - Average service',
    4: '4 Stars - Very good repair quality',
    5: '5 Stars - Excellent, highly recommended!'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-[#0284C7] text-white flex items-center justify-between relative">
          <div className="space-y-0.5">
            <span className="px-2.5 py-0.5 bg-sky-400/20 text-sky-200 border border-sky-400/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-300" />
              Verified Client Voice
            </span>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white font-sans">
              {step === 'form' && 'Share Your Experience'}
              {step === 'success' && 'Review Submitted'}
              {step === 'google_flow' && 'Share on Google Maps'}
            </h3>
          </div>
          
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left">
          
          {/* STEP 1: FORM */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Subhasish Roy"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Star Rating Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Your Overall Rating <span className="text-rose-500">*</span>
                </label>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = (hoveredRating || rating) >= starValue;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoveredRating(starValue)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform focus:outline-none"
                          title={`${starValue} Stars`}
                        >
                          <Star 
                            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                              isFilled 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs font-bold text-amber-700">
                    {ratingDescriptions[hoveredRating || rating]}
                  </p>
                </div>
              </div>

              {/* Review Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Your Review & Experience <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[11px] font-bold ${reviewText.length >= 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {reviewText.length}/10 min chars
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about the issue your phone had, the diagnosis, how quickly it was fixed, and your overall experience with Saddam Bhai..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Customer Photo Upload (Real photo from device) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Your Photo <span className="text-slate-400 font-medium lowercase">(optional, real photo only)</span>
                </label>
                
                {photoPreview ? (
                  <div className="flex items-center gap-4 p-3 bg-blue-50/60 border border-blue-100 rounded-2xl">
                    <img 
                      src={photoPreview} 
                      alt="Customer Preview" 
                      className="w-16 h-16 rounded-xl object-cover border border-blue-200 shadow-sm shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {photoFile?.name || 'Photo selected'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Optimized & ready for review submission
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-[#0284C7] bg-slate-50 hover:bg-blue-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-150 flex items-center justify-center text-slate-500 group-hover:text-[#0284C7] group-hover:scale-110 transition-all">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Click to upload your photo
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        JPG, PNG, or WEBP (Max 10MB) • No stock or fake photos
                      </p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoSelect} 
                      accept="image/jpeg,image/png,image/webp,image/jpg" 
                      className="hidden" 
                    />
                  </div>
                )}
              </div>

              {/* Optional Verification: Booking ID or Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-150">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    Booking / Job Sheet ID <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      placeholder="e.g. BK-2026-9812"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 081675 49092"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                * Providing a Booking ID or Phone helps verify your repair for a "Verified Customer Review" badge.
              </p>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#0284C7] hover:bg-[#0369A1] active:scale-[0.99] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Your Review...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Review</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SUCCESS SCREEN */}
          {step === 'success' && (
            <div className="space-y-6 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  Thank you for sharing your experience with MOBO SAVIOR.
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Your review has been securely saved and submitted to our moderation team. Once approved, it will appear live on the MOBO SAVIOR website.
                </p>
              </div>

              {/* Submitted Review Summary Card */}
              {submittedReviewData && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {submittedReviewData.photoUrl ? (
                        <img 
                          src={submittedReviewData.photoUrl} 
                          alt={submittedReviewData.name} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center border border-sky-200">
                          {submittedReviewData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900">{submittedReviewData.name}</h5>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < submittedReviewData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[9px] font-black uppercase tracking-wider">
                      Status: Pending Moderation
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{submittedReviewData.text}"
                  </p>
                </div>
              )}

              {/* Two Clear Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl transition-all"
                >
                  View Website Review Status
                </button>

                <button
                  type="button"
                  onClick={() => setStep('google_flow')}
                  className="py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>Share Review on Google</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: GOOGLE REVIEW FLOW */}
          {step === 'google_flow' && (
            <div className="space-y-6 text-left py-1">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Google Maps Review Notice</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  Your review can be shared on Google Maps too. Google requires customers to submit their own review directly on Google Maps.
                </p>
              </div>

              {/* Copy My Review Section */}
              {submittedReviewData && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Your Submitted Review Text:
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyReviewText}
                      className="px-3 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284C7] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      {copiedReview ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy My Review</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium leading-relaxed max-h-32 overflow-y-auto">
                    {submittedReviewData.text}
                  </div>
                </div>
              )}

              {/* Instructions Steps */}
              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-bold text-slate-800">Quick steps to post on Google Maps:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-slate-600 font-medium">
                  <li>Click <strong>Copy My Review</strong> above to copy your text.</li>
                  <li>Click the button below to open official MOBO SAVIOR Google page in a new tab.</li>
                  <li>Select your star rating and paste your review text.</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenGoogleReview}
                  className="w-full py-3.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <span>Open MOBO SAVIOR Google Review Page</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Done & Return to Website
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
