import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { sanitizePayload } from '../../lib/dbSanitizer';
import { uploadMediaFile, validateImageFile } from '../../lib/storageUpload';
import { BrandingSettings, ContactSettings, WebsiteContent, BusinessProfile } from '../../types';
import { 
  Building2, Sparkles, Upload, Image as ImageIcon, Trash2, CheckCircle2, 
  AlertCircle, Phone, MessageSquare, Mail, MapPin, Globe, Share2, Compass, 
  Save, Loader2, ExternalLink, RefreshCw, Eye, Smartphone, Megaphone, Facebook, Instagram
} from 'lucide-react';
import Logo from '../Logo';

interface AdminBrandingBusinessProfileProps {
  brandingSettings: BrandingSettings;
  contactSettings: ContactSettings;
  websiteContent: WebsiteContent;
  onRefreshData?: () => void;
}

const DEFAULT_REAL_BIO = 'MOBO SAVIOR is a professional mobile repairing shop in Purulia specializing in iPhone and Android motherboard repair, chip-level repair, CPU reballing, eMMC/UFS work, display repair and advanced mobile hardware solutions.';

export default function AdminBrandingBusinessProfile({
  brandingSettings,
  contactSettings,
  websiteContent,
  onRefreshData
}: AdminBrandingBusinessProfileProps) {
  // Form State
  const [businessName, setBusinessName] = useState(brandingSettings.brandName || 'MOBO SAVIOR');
  const [tagline, setTagline] = useState(brandingSettings.tagline || 'PURULIA KA TRUSTED MOBILE REPAIRING SHOP');
  const [logoUrl, setLogoUrl] = useState(brandingSettings.logoUrl || '/assets/images/mobo_savior_logo.png');
  
  // Contact State
  const [phone, setPhone] = useState(contactSettings.phone || '081675 49092');
  const [whatsapp, setWhatsapp] = useState(contactSettings.whatsapp || '081675 49092');
  const [email, setEmail] = useState(contactSettings.email || 'mahatofauji@gmail.com');
  
  // Address State
  const [address, setAddress] = useState(contactSettings.address || 'Room No B4, Super Market, Hattola More, Purulia, West Bengal 723101');
  const [city, setCity] = useState(contactSettings.city || 'Purulia');
  const [state, setState] = useState(contactSettings.state || 'West Bengal');
  const [pincode, setPincode] = useState(contactSettings.pincode || '723101');
  
  // Bio State
  const [bio, setBio] = useState(contactSettings.bio || websiteContent.aboutText || DEFAULT_REAL_BIO);

  // Social & Online State
  const [facebookUrl, setFacebookUrl] = useState(contactSettings.facebook || 'https://www.facebook.com/share/19aL5sjb28/');
  const [instagramUrl, setInstagramUrl] = useState(contactSettings.instagram || 'https://www.instagram.com/saddam617technical?stkn=MWh2MXNnZjZwNXI5MQ==');
  const [whatsappChannelUrl, setWhatsappChannelUrl] = useState(contactSettings.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(contactSettings.googleMapsUrl || 'https://maps.app.goo.gl/tU41BvTCk3dRAn6r9');
  const [youtubeUrl, setYoutubeUrl] = useState(contactSettings.youtube || '');
  const [mapIframeUrl, setMapIframeUrl] = useState(contactSettings.mapIframeUrl || '');

  // Upload & Save UI States
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [logoPreviewTheme, setLogoPreviewTheme] = useState<'light' | 'dark'>('light');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize on props update or initial load
  useEffect(() => {
    if (brandingSettings) {
      if (brandingSettings.brandName) setBusinessName(brandingSettings.brandName);
      if (brandingSettings.tagline) setTagline(brandingSettings.tagline);
      if (brandingSettings.logoUrl) setLogoUrl(brandingSettings.logoUrl);
    }
  }, [brandingSettings]);

  useEffect(() => {
    if (contactSettings) {
      if (contactSettings.phone) setPhone(contactSettings.phone);
      if (contactSettings.whatsapp) setWhatsapp(contactSettings.whatsapp);
      if (contactSettings.email) setEmail(contactSettings.email);
      if (contactSettings.address) setAddress(contactSettings.address);
      if (contactSettings.city) setCity(contactSettings.city);
      if (contactSettings.state) setState(contactSettings.state);
      if (contactSettings.pincode) setPincode(contactSettings.pincode);
      if (contactSettings.bio) setBio(contactSettings.bio);
      if (contactSettings.facebook) setFacebookUrl(contactSettings.facebook);
      if (contactSettings.instagram) setInstagramUrl(contactSettings.instagram);
      if (contactSettings.whatsappChannelUrl) setWhatsappChannelUrl(contactSettings.whatsappChannelUrl);
      if (contactSettings.googleMapsUrl) setGoogleMapsUrl(contactSettings.googleMapsUrl);
      if (contactSettings.youtube) setYoutubeUrl(contactSettings.youtube);
      if (contactSettings.mapIframeUrl) setMapIframeUrl(contactSettings.mapIframeUrl);
    }
  }, [contactSettings]);

  useEffect(() => {
    if (websiteContent && websiteContent.aboutText && !contactSettings.bio) {
      setBio(websiteContent.aboutText);
    }
  }, [websiteContent, contactSettings.bio]);

  // Load authoritative profile directly from Supabase settings / business_profile
  useEffect(() => {
    const fetchAuthoritativeProfile = async () => {
      try {
        // Try business_profile table first
        const { data: bpData, error: bpErr } = await supabase
          .from('business_profile')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!bpErr && bpData) {
          if (bpData.business_name) setBusinessName(bpData.business_name);
          if (bpData.tagline) setTagline(bpData.tagline);
          if (bpData.logo_url) setLogoUrl(bpData.logo_url);
          if (bpData.phone) setPhone(bpData.phone);
          if (bpData.whatsapp) setWhatsapp(bpData.whatsapp);
          if (bpData.email) setEmail(bpData.email);
          if (bpData.address) setAddress(bpData.address);
          if (bpData.city) setCity(bpData.city);
          if (bpData.state) setState(bpData.state);
          if (bpData.pincode) setPincode(bpData.pincode);
          if (bpData.bio) setBio(bpData.bio);
          if (bpData.facebook_url) setFacebookUrl(bpData.facebook_url);
          if (bpData.instagram_url) setInstagramUrl(bpData.instagram_url);
          if (bpData.whatsapp_channel_url) setWhatsappChannelUrl(bpData.whatsapp_channel_url);
          if (bpData.google_maps_url) setGoogleMapsUrl(bpData.google_maps_url);
          if (bpData.updated_at) setLastSavedTime(new Date(bpData.updated_at).toLocaleTimeString());
        } else {
          // Check settings table
          const { data: sData } = await supabase
            .from('settings')
            .select('*')
            .in('id', ['branding', 'contact', 'business_profile', 'content']);

          if (sData && sData.length > 0) {
            sData.forEach((row: any) => {
              const d = row.data || row.value || {};
              if (row.id === 'branding') {
                if (d.brandName) setBusinessName(d.brandName);
                if (d.tagline) setTagline(d.tagline);
                if (d.logoUrl) setLogoUrl(d.logoUrl);
              }
              if (row.id === 'contact') {
                if (d.phone) setPhone(d.phone);
                if (d.whatsapp) setWhatsapp(d.whatsapp);
                if (d.email) setEmail(d.email);
                if (d.address) setAddress(d.address);
                if (d.city) setCity(d.city);
                if (d.state) setState(d.state);
                if (d.pincode) setPincode(d.pincode);
                if (d.bio) setBio(d.bio);
                if (d.facebook) setFacebookUrl(d.facebook);
                if (d.instagram) setInstagramUrl(d.instagram);
                if (d.whatsappChannelUrl) setWhatsappChannelUrl(d.whatsappChannelUrl);
                if (d.googleMapsUrl) setGoogleMapsUrl(d.googleMapsUrl);
              }
              if (row.id === 'business_profile') {
                if (d.businessName) setBusinessName(d.businessName);
                if (d.tagline) setTagline(d.tagline);
                if (d.logoUrl) setLogoUrl(d.logoUrl);
                if (d.phone) setPhone(d.phone);
                if (d.whatsapp) setWhatsapp(d.whatsapp);
                if (d.email) setEmail(d.email);
                if (d.address) setAddress(d.address);
                if (d.city) setCity(d.city);
                if (d.state) setState(d.state);
                if (d.pincode) setPincode(d.pincode);
                if (d.bio) setBio(d.bio);
                if (d.facebookUrl) setFacebookUrl(d.facebookUrl);
                if (d.instagramUrl) setInstagramUrl(d.instagramUrl);
                if (d.whatsappChannelUrl) setWhatsappChannelUrl(d.whatsappChannelUrl);
                if (d.googleMapsUrl) setGoogleMapsUrl(d.googleMapsUrl);
              }
            });
          }
        }
      } catch (err) {
        console.warn('Authoritative profile fetch note:', err);
      }
    };

    fetchAuthoritativeProfile();
  }, []);

  // Handle Logo File Selection
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateImageFile(file, 15);
      if (!validation.valid) {
        setSaveStatus({ type: 'error', message: validation.error || 'Invalid logo image file.' });
        return;
      }
      setSelectedLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreviewUrl(preview);
      setSaveStatus(null);
    }
  };

  const handleResetToDefaultLogo = () => {
    setSelectedLogoFile(null);
    setLogoPreviewUrl('');
    setLogoUrl('/assets/images/mobo_savior_logo.png');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSaveStatus({ type: 'success', message: 'Logo set to default MOBO SAVIOR asset. Click "SAVE CHANGES" to apply.' });
  };

  const handleRemoveLogo = () => {
    setSelectedLogoFile(null);
    setLogoPreviewUrl('');
    setLogoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSaveStatus({ type: 'success', message: 'Logo removed. Click "SAVE CHANGES" to apply.' });
  };

  // Comprehensive Save Handler
  const handleSaveChanges = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Validation
    if (!businessName.trim()) {
      setSaveStatus({ type: 'error', message: 'Business Name is required.' });
      return;
    }
    if (!phone.trim()) {
      setSaveStatus({ type: 'error', message: 'Primary Phone Number is required.' });
      return;
    }
    if (!whatsapp.trim()) {
      setSaveStatus({ type: 'error', message: 'WhatsApp Number is required.' });
      return;
    }
    if (!address.trim()) {
      setSaveStatus({ type: 'error', message: 'Physical Address is required.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      let finalLogoUrl = logoUrl;

      // 2. Upload Logo to Supabase Storage if new file selected
      if (selectedLogoFile) {
        setIsUploadingLogo(true);
        try {
          const uploadRes = await uploadMediaFile(selectedLogoFile, {
            folder: 'branding_logos',
            maxSizeMB: 15
          });

          if (uploadRes && uploadRes.success && uploadRes.url) {
            finalLogoUrl = uploadRes.url;
            setLogoUrl(uploadRes.url);
          } else {
            throw new Error(uploadRes.error || 'Failed to upload logo to Supabase Storage');
          }
        } catch (uploadErr: any) {
          console.error('Logo upload error:', uploadErr);
          throw new Error('Could not upload logo: ' + (uploadErr?.message || 'Storage error'));
        } finally {
          setIsUploadingLogo(false);
        }
      }

      const trimmedName = businessName.trim();
      const trimmedTagline = tagline.trim();
      const trimmedPhone = phone.trim();
      const trimmedWhatsapp = whatsapp.trim();
      const trimmedEmail = email.trim();
      const trimmedAddress = address.trim();
      const trimmedCity = city.trim();
      const trimmedState = state.trim();
      const trimmedPincode = pincode.trim();
      const trimmedBio = bio.trim();
      const trimmedFacebook = facebookUrl.trim();
      const trimmedInstagram = instagramUrl.trim();
      const trimmedWhatsappChannel = whatsappChannelUrl.trim();
      const trimmedGoogleMaps = googleMapsUrl.trim();
      const trimmedYoutube = youtubeUrl.trim();
      const trimmedMapIframe = mapIframeUrl.trim();
      const nowIso = new Date().toISOString();

      // 3. Prepare Payload Objects
      const brandingPayload: BrandingSettings = {
        brandName: trimmedName,
        tagline: trimmedTagline,
        logoUrl: finalLogoUrl
      };

      const contactPayload: ContactSettings = {
        name: trimmedName,
        phone: trimmedPhone,
        whatsapp: trimmedWhatsapp,
        email: trimmedEmail,
        address: trimmedAddress,
        city: trimmedCity,
        state: trimmedState,
        pincode: trimmedPincode,
        bio: trimmedBio,
        facebook: trimmedFacebook,
        instagram: trimmedInstagram,
        whatsappChannelUrl: trimmedWhatsappChannel,
        googleMapsUrl: trimmedGoogleMaps,
        youtube: trimmedYoutube,
        mapIframeUrl: trimmedMapIframe
      };

      const unifiedBusinessProfile: BusinessProfile = {
        id: 'main',
        businessName: trimmedName,
        tagline: trimmedTagline,
        logoUrl: finalLogoUrl,
        phone: trimmedPhone,
        whatsapp: trimmedWhatsapp,
        email: trimmedEmail,
        address: trimmedAddress,
        city: trimmedCity,
        state: trimmedState,
        pincode: trimmedPincode,
        bio: trimmedBio,
        facebookUrl: trimmedFacebook,
        instagramUrl: trimmedInstagram,
        whatsappChannelUrl: trimmedWhatsappChannel,
        googleMapsUrl: trimmedGoogleMaps,
        youtubeUrl: trimmedYoutube,
        mapIframeUrl: trimmedMapIframe,
        updatedAt: nowIso
      };

      // 4. Save to `settings` table (Authoritative records for branding, contact, business_profile, and content bio)
      const settingsUpserts: Array<{ id: string; data: any; value: any; updated_at: string }> = [
        {
          id: 'branding',
          data: brandingPayload,
          value: brandingPayload,
          updated_at: nowIso
        },
        {
          id: 'contact',
          data: contactPayload,
          value: contactPayload,
          updated_at: nowIso
        },
        {
          id: 'business_profile',
          data: unifiedBusinessProfile,
          value: unifiedBusinessProfile,
          updated_at: nowIso
        }
      ];

      for (const row of settingsUpserts) {
        const { error: setErr } = await supabase.from('settings').upsert(row, { onConflict: 'id' });
        if (setErr) {
          console.warn(`Settings upsert note (${row.id}):`, setErr);
        }
      }

      // Also update `content` settings aboutText if present so About and Home sections stay synchronized
      try {
        const { data: contentRow } = await supabase.from('settings').select('*').eq('id', 'content').maybeSingle();
        const existingContent = contentRow?.data || contentRow?.value || websiteContent || {};
        const updatedContent = {
          ...existingContent,
          aboutText: trimmedBio,
          aboutHighlight: existingContent.aboutHighlight || `We do not just replace parts; we save motherboards. Your trusted choice for ${trimmedName}.`
        };
        await supabase.from('settings').upsert({
          id: 'content',
          data: updatedContent,
          value: updatedContent,
          updated_at: nowIso
        }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Content bio sync note:', e);
      }

      // 5. Save to `business_profile` table if exists in Supabase
      try {
        const bpRow: any = {
          id: 'main',
          business_name: trimmedName,
          tagline: trimmedTagline,
          logo_url: finalLogoUrl,
          phone: trimmedPhone,
          whatsapp: trimmedWhatsapp,
          email: trimmedEmail,
          address: trimmedAddress,
          city: trimmedCity,
          state: trimmedState,
          pincode: trimmedPincode,
          bio: trimmedBio,
          facebook_url: trimmedFacebook,
          instagram_url: trimmedInstagram,
          whatsapp_channel_url: trimmedWhatsappChannel,
          google_maps_url: trimmedGoogleMaps,
          updated_at: nowIso
        };

        const cleanBpRow = sanitizePayload('business_profile', bpRow);
        const { error: bpError } = await supabase.from('business_profile').upsert(cleanBpRow, { onConflict: 'id' });
        if (bpError) {
          console.warn('business_profile table upsert note (non-critical):', bpError.message);
        }
      } catch (bpErr) {
        console.warn('business_profile table write note:', bpErr);
      }

      // 6. Reset Local file state
      setSelectedLogoFile(null);
      setLogoPreviewUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setLastSavedTime(new Date().toLocaleTimeString());
      setSaveStatus({
        type: 'success',
        message: 'Branding & Business Profile updated successfully.'
      });

      // 7. Refresh global App state
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err: any) {
      console.error('Save branding profile error:', err);
      setSaveStatus({
        type: 'error',
        message: err?.message || 'Failed to save changes to database. Please check connection and try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const displayLogoUrl = logoPreviewUrl || logoUrl || '/assets/images/mobo_savior_logo.png';

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#0284C7] shadow-xs flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-sans">
                Branding & Business Profile
              </h2>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-md">
                SUPABASE SYNCED
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage your authoritative business identity, logo, direct contact lines, physical address, bio, and social channels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
          {lastSavedTime && (
            <span className="text-[11px] text-slate-400 font-medium">
              Saved at {lastSavedTime}
            </span>
          )}
          <button
            type="button"
            onClick={() => handleSaveChanges()}
            disabled={isSaving || isUploadingLogo}
            className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SAVING...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE CHANGES</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Status Notification Banner */}
      {saveStatus && (
        <div 
          className={`p-4 rounded-xl text-xs font-bold flex items-start gap-3 border shadow-xs transition-all ${
            saveStatus.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-extrabold">{saveStatus.message}</p>
            {saveStatus.type === 'success' && (
              <p className="text-[11px] font-normal text-emerald-700 mt-0.5">
                All changes are saved permanently to Supabase and will reflect immediately across all customer pages and browser refreshes.
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSaveChanges} className="space-y-6">
        {/* CARD 1: Brand Identity */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-sans flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0284C7]" />
                1. Brand Identity & Name Management
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Primary business trade name and marketing tagline displayed on header, promo bar, footer, and meta tags.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Business / Branding Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="MOBO SAVIOR"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] focus:outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Example: <span className="font-mono font-semibold">MOBO SAVIOR</span> or <span className="font-mono font-semibold">MOBO SAVIOR PURULIA</span>
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Tagline / Short Brand Line
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="PURULIA KA TRUSTED MOBILE REPAIRING SHOP"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] focus:outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Example: <span className="font-mono font-semibold">PURULIA KA TRUSTED MOBILE REPAIRING SHOP</span>
              </p>
            </div>
          </div>

          {/* Live Preview Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Live Brand Header & Tagline Preview
            </span>
            <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between gap-4 overflow-hidden border border-slate-800">
              <Logo 
                logoUrl={displayLogoUrl} 
                brandName={businessName || 'MOBO SAVIOR'} 
                tagline={tagline || 'PURULIA KA TRUSTED MOBILE REPAIRING SHOP'}
                isDark={true}
              />
              <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                Live Navbar Appearance
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Brand Logo Management */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-sans flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0284C7]" />
                2. Brand Logo Management (Supabase Storage)
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Upload a new brand logo, replace or remove the current logo. Stored securely in Supabase Storage.
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setLogoPreviewTheme('light')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                  logoPreviewTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Light BG
              </button>
              <button
                type="button"
                onClick={() => setLogoPreviewTheme('dark')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                  logoPreviewTheme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Dark BG
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Current / Selected Logo Display */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 text-center space-y-3" style={{ backgroundColor: logoPreviewTheme === 'dark' ? '#0F172A' : '#F8FAFC' }}>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                {selectedLogoFile ? 'New Logo Selected' : 'Active Website Logo'}
              </span>

              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#0284C7] shadow-md bg-white flex items-center justify-center relative group">
                <img
                  src={displayLogoUrl}
                  alt={businessName}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/mobo_savior_logo.png';
                  }}
                />
              </div>

              <div className="text-[10px] text-slate-500 max-w-[200px] truncate font-mono">
                {selectedLogoFile ? selectedLogoFile.name : (logoUrl.startsWith('http') ? 'Supabase Storage URL' : 'Default Asset')}
              </div>
            </div>

            {/* Upload Controls & Actions */}
            <div className="md:col-span-8 space-y-4 text-xs">
              <div className="p-4 border-2 border-dashed border-slate-200 hover:border-[#0284C7] rounded-2xl bg-slate-50/50 hover:bg-sky-50/30 transition-all text-center space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                  id="brand-logo-file-input"
                />
                <label 
                  htmlFor="brand-logo-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-2"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-[#0284C7] flex items-center justify-center shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#0284C7] hover:underline">
                      Click to choose new logo
                    </span>
                    <span className="text-slate-500"> or drag and drop</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    PNG, JPG, WEBP, SVG (Max 15MB). Recommended: High-res square or circular logo.
                  </p>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaultLogo}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center gap-1.5"
                  title="Reset to default logo image"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Use Default Logo</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-all flex items-center gap-1.5"
                  title="Clear custom logo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Logo</span>
                </button>

                {logoUrl && logoUrl.startsWith('http') && (
                  <a
                    href={logoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 ml-auto"
                  >
                    <span>View in Full Quality</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Contact Details */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 font-sans flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0284C7]" />
              3. Direct Contact Lines & Customer Communication
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Live phone numbers, WhatsApp chat lines, and official support email used across the entire public website.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0284C7]" />
                Primary Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081675 49092"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Used for "Call Now" buttons</p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="081675 49092"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Used for 1-on-1 customer chat</p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mahatofauji@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Customer inquiries & support</p>
            </div>
          </div>
        </div>

        {/* CARD 4: Business Physical Address */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 font-sans flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0284C7]" />
              4. Physical Lab Address & City Details
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Official physical workshop address displayed on contact page, footer, schema tags, and directions cards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
            <div className="sm:col-span-12">
              <label className="block text-slate-700 font-bold mb-1.5">
                Full Physical Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Room No B4, Super Market, Hattola More, Purulia, West Bengal 723101"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-slate-700 font-bold mb-1.5">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Purulia"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0284C7] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-slate-700 font-bold mb-1.5">
                State / Territory
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="West Bengal"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0284C7] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-slate-700 font-bold mb-1.5">
                PIN / Postal Code
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="723101"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-[#0284C7] focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* CARD 5: Business Bio */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-sans flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#0284C7]" />
                5. Business Bio & Lab Story
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Detailed description of your workshop, specialization, chip-level capabilities, and technician experience.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {bio.length} characters
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-slate-700 font-bold">
              Complete Business Description / Story
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              placeholder={DEFAULT_REAL_BIO}
              className="w-full px-3.5 py-3 bg-slate-50/50 border border-slate-200 rounded-xl font-medium text-slate-800 leading-relaxed focus:bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] focus:outline-none"
            />
            <p className="text-[10px] text-slate-400">
              This bio is published dynamically on the customer About page, why choose us highlights, and business profile sections.
            </p>
          </div>
        </div>

        {/* CARD 6: Social & Online Links */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 font-sans flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#0284C7]" />
              6. Social Profiles & Google Maps
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Verified social channels, WhatsApp broadcast channel, and Google Maps location URL.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-emerald-950 font-bold flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-emerald-600" />
                  WhatsApp Broadcast Channel URL
                </label>
                {whatsappChannelUrl && (
                  <a
                    href={whatsappChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1"
                  >
                    <span>Test Channel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={whatsappChannelUrl}
                onChange={(e) => setWhatsappChannelUrl(e.target.value)}
                placeholder="https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K"
                className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl font-mono text-[11px] text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                Facebook Page / Profile URL
              </label>
              <input
                type="text"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://www.facebook.com/share/19aL5sjb28/"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                Instagram Profile URL
              </label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/saddam617technical"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 focus:bg-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-red-500" />
                Google Maps Location URL
              </label>
              <input
                type="text"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/tU41BvTCk3dRAn6r9"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">
              Ready to save business profile to Supabase database
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={isSaving || isUploadingLogo}
              className="w-full sm:w-auto px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SAVING CHANGES TO SUPABASE...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SAVE CHANGES</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
