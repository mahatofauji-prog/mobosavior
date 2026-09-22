import React, { useState, useEffect } from 'react';
import { supabase, signOut } from '../lib/supabase';
import { auth } from '../lib/supabase';
import { uploadMediaFile, deleteMediaFile } from '../lib/storageUpload';
import { 
  Booking, Service, FAQItem, Review, GalleryItem, VideoItem, 
  BrandingSettings, ContactSettings, WebsiteContent, SEOSettings, BookingStatus, SlideItem, BusinessHours 
} from '../types';
import { 
  LayoutDashboard, Calendar, Wrench, Image, Play, Star, HelpCircle, 
  FileText, ShieldAlert, Shield, LogOut, Plus, Edit, Trash2, Check, Search, Filter, 
  AlertCircle, Save, Loader2, Sparkles, SlidersHorizontal, Globe, CheckSquare, X, Eye, Phone, MessageSquare,
  Smartphone, Layers, Clock, Share2, MapPin, BarChart2, Database, Tag, DollarSign, Video, Compass, Copy, ExternalLink, Building2, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getServiceImage } from '../utils/serviceImages';
import AdminOffers from '../components/admin/AdminOffers';
import AdminServiceBookings from '../components/admin/AdminServiceBookings';
import AdminTrustSection from '../components/admin/AdminTrustSection';
import AdminBrandsModels from '../components/admin/AdminBrandsModels';
import AdminCategories from '../components/admin/AdminCategories';
import AdminGalleryManager from '../components/admin/AdminGalleryManager';
import AdminReviewsManager from '../components/admin/AdminReviewsManager';
import AdminSEOSettings from '../components/admin/AdminSEOSettings';
import AdminPrices from '../components/admin/AdminPrices';
import AdminPages from '../components/admin/AdminPages';
import AdminBlog from '../components/admin/AdminBlog';
import AdminNavigation from '../components/admin/AdminNavigation';
import AdminLegalPages from '../components/admin/AdminLegalPages';
import AdminMediaLibrary from '../components/admin/AdminMediaLibrary';
import AdminBranches from '../components/admin/AdminBranches';
import AdminSections from '../components/admin/AdminSections';
import AdminAnalyticsDashboard from '../components/admin/AdminAnalyticsDashboard';
import AdminBrandingBusinessProfile from '../components/admin/AdminBrandingBusinessProfile';
import AdminChangePassword from '../components/admin/AdminChangePassword';
import ImageUploader from '../components/admin/ImageUploader';
import EmbeddedVideoPlayer from '../components/EmbeddedVideoPlayer';
import { parseVideoUrl, getVideoPlatformLabel } from '../lib/videoUtils';


interface AdminDashboardProps {
  onLogout: () => void;
  servicesList: Service[];
  reviewsList: Review[];
  faqsList: FAQItem[];
  brandingSettings: BrandingSettings;
  contactSettings: ContactSettings;
  websiteContent: WebsiteContent;
  seoSettings: SEOSettings;
  onRefreshData: () => void;
  slideshowList: SlideItem[];
  businessHours?: BusinessHours;
}

export default function AdminDashboard({
  onLogout,
  servicesList,
  reviewsList,
  faqsList,
  brandingSettings,
  contactSettings,
  websiteContent,
  seoSettings,
  onRefreshData,
  slideshowList,
  businessHours
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard' | 'bookings' | 'branches' | 'services' | 'categories' | 'brands' | 'models'
    | 'prices' | 'gallery' | 'videos' | 'reviews' | 'offers' | 'trust' | 'faq'
    | 'contact' | 'hours' | 'social' | 'maps' | 'content' | 'seo' | 'sections'
    | 'analytics' | 'slideshow' | 'media' | 'pages' | 'blog' | 'navigation' | 'media-library' | 'legal'
    | 'branding-profile' | 'change-password'
  >('dashboard');

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling when menu drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Business Hours state - synced from live database
  const [monFriHours, setMonFriHours] = useState(businessHours?.monFri || '10:00 AM - 08:30 PM');
  const [satHours, setSatHours] = useState(businessHours?.saturday || '10:00 AM - 08:30 PM');
  const [sunHours, setSunHours] = useState(businessHours?.sunday || 'Closed / Emergency Only');
  const [weeklyHoliday, setWeeklyHoliday] = useState((businessHours as any)?.weeklyHoliday || 'Sunday');
  const [hoursNote, setHoursNote] = useState(businessHours?.hoursNote || (businessHours as any)?.note || 'Open all days except public festival holidays. Express bench service available.');

  useEffect(() => {
    if (businessHours) {
      if (businessHours.monFri) setMonFriHours(businessHours.monFri);
      if (businessHours.saturday) setSatHours(businessHours.saturday);
      if (businessHours.sunday) setSunHours(businessHours.sunday);
      if ((businessHours as any).weeklyHoliday) setWeeklyHoliday((businessHours as any).weeklyHoliday);
      if (businessHours.hoursNote) setHoursNote(businessHours.hoursNote);
      else if ((businessHours as any).note) setHoursNote((businessHours as any).note);
    }
  }, [businessHours]);

  // Analytics ID state
  const [gaMeasurementId, setGaMeasurementId] = useState(seoSettings.googleAnalyticsId || 'G-XXXXXXXXXX');

  // Media State
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaTab, setMediaTab] = useState<'photos' | 'videos'>('photos');

  // Media CRUD Modals
  const [galleryModal, setGalleryModal] = useState<{ open: boolean; item?: GalleryItem | null }>({ open: false });
  const [videoModal, setVideoModal] = useState<{ open: boolean; item?: VideoItem | null }>({ open: false });
  const [previewMedia, setPreviewMedia] = useState<{ open: boolean; type: 'photo' | 'video'; url: string; title: string; description: string } | null>(null);

  // Upload loading
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Search/Filter state for Bookings
  const [searchBooking, setSearchBooking] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');

  // Local state editors
  const [services, setServices] = useState<Service[]>(servicesList);
  const [reviews, setReviews] = useState<Review[]>(reviewsList);
  const [faqs, setFaqs] = useState<FAQItem[]>(faqsList);
  
  // Settings Forms states
  const [brandName, setBrandName] = useState(brandingSettings.brandName || '');
  const [logoUrl, setLogoUrl] = useState(brandingSettings.logoUrl || '');
  const [tagline, setTagline] = useState(brandingSettings.tagline || '');

  const [address, setAddress] = useState(contactSettings.address || '');
  const [phone, setPhone] = useState(contactSettings.phone || '');
  const [whatsapp, setWhatsapp] = useState(contactSettings.whatsapp || '');
  const [facebook, setFacebook] = useState(contactSettings.facebook || 'https://www.facebook.com/share/19aL5sjb28/');
  const [instagram, setInstagram] = useState(contactSettings.instagram || 'https://www.instagram.com/saddam617technical?stkn=MWh2MXNnZjZwNXI5MQ==');
  const [youtube, setYoutube] = useState(contactSettings.youtube || '');
  const [whatsappChannelUrl, setWhatsappChannelUrl] = useState(contactSettings.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K');
  const [mapsUrl, setMapsUrl] = useState(contactSettings.googleMapsUrl || 'https://maps.app.goo.gl/tU41BvTCk3dRAn6r9');
  const [mapIframeUrl, setMapIframeUrl] = useState(contactSettings.mapIframeUrl || '');

  const [heroTitle, setHeroTitle] = useState(websiteContent.heroTitle || '');
  const [heroDesc, setHeroDesc] = useState(websiteContent.heroDescription || '');
  const [aboutText, setAboutText] = useState(websiteContent.aboutText || '');
  const [aboutHighlight, setAboutHighlight] = useState(websiteContent.aboutHighlight || '');

  const [seoTitle, setSeoTitle] = useState(seoSettings.siteTitle || '');
  const [seoDesc, setSeoDesc] = useState(seoSettings.metaDescription || '');
  const [seoVerification, setSeoVerification] = useState(seoSettings.searchConsoleVerification || '');
  const [seoRobots, setSeoRobots] = useState(seoSettings.robotsConfig || 'index, follow');

  // CRUD Modal States
  const [serviceModal, setServiceModal] = useState<{ open: boolean; item?: Service }>({ open: false });
  const [isSavingService, setIsSavingService] = useState(false);
  const [faqModal, setFaqModal] = useState<{ open: boolean; item?: FAQItem }>({ open: false });
  const [reviewModal, setReviewModal] = useState<{ open: boolean; item?: Review }>({ open: false });
  const [slideModal, setSlideModal] = useState<{ open: boolean; item?: SlideItem | null }>({ open: false });
  
  const [serviceFormImageUrl, setServiceFormImageUrl] = useState('');
  const [slideFormImageUrl, setSlideFormImageUrl] = useState('');

  useEffect(() => {
    if (servicesList && servicesList.length > 0) {
      setServices(servicesList);
    }
  }, [servicesList]);

  useEffect(() => {
    if (brandingSettings) {
      if (brandingSettings.brandName !== undefined) setBrandName(brandingSettings.brandName);
      if (brandingSettings.logoUrl !== undefined) setLogoUrl(brandingSettings.logoUrl);
      if (brandingSettings.tagline !== undefined) setTagline(brandingSettings.tagline);
    }
  }, [brandingSettings]);

  useEffect(() => {
    if (contactSettings) {
      if (contactSettings.address !== undefined) setAddress(contactSettings.address);
      if (contactSettings.phone !== undefined) setPhone(contactSettings.phone);
      if (contactSettings.whatsapp !== undefined) setWhatsapp(contactSettings.whatsapp);
      if (contactSettings.facebook !== undefined) setFacebook(contactSettings.facebook);
      if (contactSettings.instagram !== undefined) setInstagram(contactSettings.instagram);
      if (contactSettings.youtube !== undefined) setYoutube(contactSettings.youtube);
      if (contactSettings.whatsappChannelUrl !== undefined) setWhatsappChannelUrl(contactSettings.whatsappChannelUrl);
      if (contactSettings.googleMapsUrl !== undefined) setMapsUrl(contactSettings.googleMapsUrl);
      if (contactSettings.mapIframeUrl !== undefined) setMapIframeUrl(contactSettings.mapIframeUrl);
    }
  }, [contactSettings]);

  useEffect(() => {
    if (websiteContent) {
      if (websiteContent.heroTitle !== undefined) setHeroTitle(websiteContent.heroTitle);
      if (websiteContent.heroDescription !== undefined) setHeroDesc(websiteContent.heroDescription);
      if (websiteContent.aboutText !== undefined) setAboutText(websiteContent.aboutText);
      if (websiteContent.aboutHighlight !== undefined) setAboutHighlight(websiteContent.aboutHighlight);
    }
  }, [websiteContent]);

  useEffect(() => {
    if (seoSettings) {
      if (seoSettings.siteTitle !== undefined) setSeoTitle(seoSettings.siteTitle);
      if (seoSettings.metaDescription !== undefined) setSeoDesc(seoSettings.metaDescription);
      if (seoSettings.searchConsoleVerification !== undefined) setSeoVerification(seoSettings.searchConsoleVerification);
      if (seoSettings.robotsConfig !== undefined) setSeoRobots(seoSettings.robotsConfig);
    }
  }, [seoSettings]);

  useEffect(() => {
    if (reviewsList && reviewsList.length > 0) {
      setReviews(reviewsList);
    }
  }, [reviewsList]);

  useEffect(() => {
    if (faqsList && faqsList.length > 0) {
      setFaqs(faqsList);
    }
  }, [faqsList]);

  useEffect(() => {
    if (serviceModal.open) {
      setServiceFormImageUrl(serviceModal.item?.imageUrl || '');
    }
  }, [serviceModal.open, serviceModal.item]);

  useEffect(() => {
    if (slideModal.open) {
      setSlideFormImageUrl(slideModal.item?.imageUrl || '');
    }
  }, [slideModal.open, slideModal.item]);

  // Load Bookings directly from service_bookings and bookings tables
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const fetched: Booking[] = [];
      const seenIds = new Set<string>();

      // 1. Fetch from service_bookings (where repairs are submitted)
      try {
        const { data: sbRows, error: sbErr } = await supabase
          .from('service_bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (!sbErr && sbRows) {
          sbRows.forEach((d: any) => {
            const id = d.service_id || d.id;
            if (id && !seenIds.has(id)) {
              seenIds.add(id);
              fetched.push({
                id,
                serviceId: id,
                serviceName: d.problem || 'Device Repair',
                brand: d.mobile_brand || '',
                model: d.mobile_model || '',
                problemDescription: d.problem || '',
                customerName: d.customer_name || 'Customer',
                phone: d.contact_number || '',
                whatsapp: d.whatsapp_number || d.contact_number || '',
                address: d.address || '',
                preferredDate: d.preferred_date || '',
                preferredTime: d.preferred_time || '',
                status: (d.status === 'Booking Received' ? 'Pending' : d.status) as any,
                createdAt: d.created_at || new Date().toISOString()
              });
            }
          });
        }
      } catch (e) {
        // Fallback handled silently
      }

      // 2. Fetch from bookings table
      try {
        const { data: bRows, error: bErr } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (!bErr && bRows) {
          bRows.forEach((d: any) => {
            const id = d.serviceId || d.service_id || d.id;
            if (id && !seenIds.has(id)) {
              seenIds.add(id);
              fetched.push({ ...d, id } as Booking);
            }
          });
        }
      } catch (e) {
        // Fallback handled silently
      }

      setBookings(fetched);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const { data: gData } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true });
      if (gData) setGallery(gData as GalleryItem[]);

      const { data: vData } = await supabase
        .from('videos')
        .select('*')
        .order('display_order', { ascending: true });
      if (vData) setVideos(vData as VideoItem[]);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    if (activeTab === 'media') {
      fetchMedia();
    }
  }, [activeTab]);

  const handleSaveGalleryItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const category = formData.get('category') as string;
      const displayOrder = parseInt(formData.get('displayOrder') as string) || 1;
      const active = formData.get('active') === 'true';
      const featured = formData.get('featured') === 'true';
      const altText = (formData.get('altText') as string) || title;
      const fileInput = e.currentTarget.querySelector('input[name="imageFile"]') as HTMLInputElement;
      let imageUrl = (formData.get('imageUrl') as string) || '';

      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        try {
          const res = await uploadMediaFile(file, { folder: 'gallery' });
          if (res && res.success && res.url) {
            imageUrl = res.url;
          }
        } catch (e) {
          console.warn('Upload exception, using FileReader fallback:', e);
        }

        if (!imageUrl) {
          imageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve(URL.createObjectURL(file));
            reader.readAsDataURL(file);
          });
        }
      }

      if (!imageUrl) {
        alert('Please select an image file to upload or enter a custom image URL.');
        setUploadLoading(false);
        return;
      }

      const itemId = galleryModal.item?.id || `gal_${Date.now()}`;
      const itemData: any = {
        id: itemId,
        imageUrl,
        image_url: imageUrl,
        title,
        description,
        category,
        altText,
        alt_text: altText,
        featured: !!featured,
        displayOrder,
        display_order: displayOrder,
        active: active !== false,
        is_active: active !== false,
        createdAt: galleryModal.item?.createdAt || new Date().toISOString(),
        created_at: galleryModal.item?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Instant local backup
      try {
        const localKey = 'ms_backup_gallery';
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        const filtered = existing.filter((i: any) => i.id !== itemId);
        filtered.push(itemData);
        localStorage.setItem(localKey, JSON.stringify(filtered));
      } catch (e) {
        console.warn('Local storage backup error:', e);
      }

      try {
        await supabase.from('gallery').upsert(itemData);
      } catch (e) {
        console.warn('Supabase gallery upsert network error handled gracefully:', e);
      }

      setGalleryModal({ open: false });
      await fetchMedia();
      alert('Photo saved successfully!');
    } catch (err: any) {
      console.error('Error saving gallery item:', err);
      alert('Failed to save photo: ' + (err?.message || 'Database error'));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string, imageUrl: string) => {
    if (confirm('Are you sure you want to permanently delete this photo?')) {
      try {
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) throw error;
        if (imageUrl) {
          await deleteMediaFile(imageUrl);
        }
        await fetchMedia();
        alert('Photo deleted successfully.');
      } catch (err: any) {
        console.error('Error deleting gallery item:', err);
        alert('Failed to delete photo: ' + (err?.message || 'Database error'));
      }
    }
  };

  const handleSaveVideoItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const category = formData.get('category') as string;
      const displayOrder = parseInt(formData.get('displayOrder') as string) || 1;
      const active = formData.get('active') === 'true';
      const featured = formData.get('featured') === 'true';
      const rawVideoUrl = ((formData.get('videoUrl') as string) || '').trim();

      const parsedVideo = parseVideoUrl(rawVideoUrl);
      if (!parsedVideo || !parsedVideo.isValid) {
        alert('Please enter a valid YouTube, Facebook or Instagram video URL.');
        setUploadLoading(false);
        return;
      }

      const itemId = videoModal.item?.id || `vid_${Date.now()}`;
      const itemData: any = {
        id: itemId,
        videoUrl: parsedVideo.originalUrl,
        video_url: parsedVideo.originalUrl,
        videoPlatform: parsedVideo.platform,
        video_platform: parsedVideo.platform,
        youtubeVideoId: parsedVideo.youtubeId || null,
        youtube_video_id: parsedVideo.youtubeId || null,
        thumbnailUrl: parsedVideo.defaultThumbnail || null,
        thumbnail_url: parsedVideo.defaultThumbnail || null,
        title,
        description,
        category,
        featured: !!featured,
        displayOrder,
        display_order: displayOrder,
        active: active !== false,
        is_active: active !== false,
        createdAt: videoModal.item?.createdAt || new Date().toISOString(),
        created_at: videoModal.item?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('videos').upsert(itemData);
      if (error) throw error;

      setVideoModal({ open: false });
      await fetchMedia();
      alert('Video saved successfully!');
    } catch (err: any) {
      console.error('Error saving video item:', err);
      alert('Failed to save video: ' + (err?.message || 'Database error'));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteVideoItem = async (id: string, videoUrl: string) => {
    if (confirm('Are you sure you want to permanently delete this video?')) {
      try {
        const { error } = await supabase.from('videos').delete().eq('id', id);
        if (error) throw error;
        if (videoUrl && (videoUrl.includes('supabase.co/storage') || videoUrl.includes('appspot.com'))) {
          await deleteMediaFile(videoUrl);
        }
        await fetchMedia();
        alert('Video deleted successfully.');
      } catch (err: any) {
        console.error('Error deleting video item:', err);
        alert('Failed to delete video: ' + (err?.message || 'Database error'));
      }
    }
  };

  const handleMoveGalleryItem = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...gallery].sort((a, b) => a.displayOrder - b.displayOrder);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const itemA = sorted[index];
    const itemB = sorted[swapIndex];

    const tempOrder = itemA.displayOrder;
    itemA.displayOrder = itemB.displayOrder === tempOrder ? tempOrder + 1 : itemB.displayOrder;
    itemB.displayOrder = tempOrder;

    try {
      await supabase.from('gallery').update({ displayOrder: itemA.displayOrder, display_order: itemA.displayOrder }).eq('id', itemA.id);
      await supabase.from('gallery').update({ displayOrder: itemB.displayOrder, display_order: itemB.displayOrder }).eq('id', itemB.id);
      fetchMedia();
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleMoveVideoItem = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...videos].sort((a, b) => a.displayOrder - b.displayOrder);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const itemA = sorted[index];
    const itemB = sorted[swapIndex];

    const tempOrder = itemA.displayOrder;
    itemA.displayOrder = itemB.displayOrder === tempOrder ? tempOrder + 1 : itemB.displayOrder;
    itemB.displayOrder = tempOrder;

    try {
      await supabase.from('videos').update({ displayOrder: itemA.displayOrder, display_order: itemA.displayOrder }).eq('id', itemA.id);
      await supabase.from('videos').update({ displayOrder: itemB.displayOrder, display_order: itemB.displayOrder }).eq('id', itemB.id);
      fetchMedia();
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleToggleGalleryActive = async (id: string, currentStatus: boolean) => {
    try {
      await supabase.from('gallery').update({ active: !currentStatus, is_active: !currentStatus }).eq('id', id);
      fetchMedia();
    } catch (err) {
      console.error('Error toggling gallery active state:', err);
    }
  };

  const handleToggleVideoActive = async (id: string, currentStatus: boolean) => {
    try {
      await supabase.from('videos').update({ active: !currentStatus, is_active: !currentStatus }).eq('id', id);
      fetchMedia();
    } catch (err) {
      console.error('Error toggling video active state:', err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  // Safe CRUD Actions for Settings
  const handleSaveBranding = async () => {
    setSaveLoading(true);
    try {
      const data = { brandName, logoUrl, tagline };
      const { error } = await supabase.from('settings').upsert({
        id: 'branding',
        data,
        value: data,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      onRefreshData();
      alert('Branding updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save branding: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveContact = async () => {
    setSaveLoading(true);
    try {
      const data = {
        name: 'MOBO SAVIOR',
        address,
        phone,
        whatsapp,
        facebook,
        instagram,
        youtube,
        whatsappChannelUrl,
        googleMapsUrl: mapsUrl,
        mapIframeUrl
      };
      const { error } = await supabase.from('settings').upsert({
        id: 'contact',
        data,
        value: data,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      onRefreshData();
      alert('Contact, location and social media settings updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save contact settings: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveContent = async () => {
    setSaveLoading(true);
    try {
      const data = {
        heroTitle,
        heroDescription: heroDesc,
        ctaText: 'BOOK A REPAIR',
        aboutText,
        aboutHighlight,
        whyChooseUs: websiteContent.whyChooseUs
      };
      const { error } = await supabase.from('settings').upsert({
        id: 'content',
        data,
        value: data,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      onRefreshData();
      alert('Website Content updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save website content: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSEO = async () => {
    setSaveLoading(true);
    try {
      const data = {
        siteTitle: seoTitle,
        metaDescription: seoDesc,
        searchConsoleVerification: seoVerification,
        robotsConfig: seoRobots,
        primaryKeyword: seoSettings.primaryKeyword,
        secondaryKeywords: seoSettings.secondaryKeywords,
        canonicalUrl: seoSettings.canonicalUrl,
        googleAnalyticsId: gaMeasurementId
      };
      const { error } = await supabase.from('settings').upsert({
        id: 'seo',
        data,
        value: data,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      onRefreshData();
      alert('SEO & Indexing Configurations updated!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save SEO configurations: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveHours = async () => {
    setSaveLoading(true);
    try {
      const data = {
        monFri: monFriHours,
        saturday: satHours,
        sunday: sunHours,
        weeklyHoliday,
        note: hoursNote,
        hoursNote: hoursNote,
        updatedAt: new Date().toISOString()
      };
      const { error } = await supabase.from('settings').upsert({
        id: 'businessHours',
        data,
        value: data,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      onRefreshData();
      alert('Business hours and store schedule saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save business hours: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveAnalytics = async () => {
    setSaveLoading(true);
    try {
      const data = {
        ...seoSettings,
        siteTitle: seoTitle,
        metaDescription: seoDesc,
        googleAnalyticsId: gaMeasurementId
      };
      const { error } = await supabase.from('settings').upsert({
        id: 'seo',
        data,
        value: data,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      onRefreshData();
      alert('Google Analytics settings updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save analytics settings: ' + (err?.message || 'Database error'));
    } finally {
      setSaveLoading(false);
    }
  };

  // Booking details update Notes / Status
  const handleUpdateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const dbUpdates: any = { ...updates };
      if (updates.status) {
        dbUpdates.status = updates.status;
      }
      // Update in service_bookings
      await supabase.from('service_bookings').update(dbUpdates).or(`id.eq.${id},service_id.eq.${id}`);
      // Update in bookings
      await supabase.from('bookings').update(dbUpdates).or(`id.eq.${id},serviceId.eq.${id}`);
      
      await fetchBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => prev ? { ...prev, ...updates } : null);
      }
      alert('Booking status updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update booking status.');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this service booking from the lab registers?')) {
      try {
        await supabase.from('service_bookings').delete().or(`id.eq.${id},service_id.eq.${id}`);
        await supabase.from('bookings').delete().or(`id.eq.${id},serviceId.eq.${id}`);
        setSelectedBooking(null);
        await fetchBookings();
        alert('Booking deleted successfully.');
      } catch (err) {
        console.error(err);
        alert('Failed to delete booking.');
      }
    }
  };

  // Service CRUD operations
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingService) return;

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    
    const id = serviceModal.item?.id || (data.get('slug') as string)?.trim();
    if (!id) {
      alert('Service slug or ID is required.');
      return;
    }

    setIsSavingService(true);
    
    try {
      // Parse modelPrices (Format: Model=Price|Model=Price)
      const modelPricesRaw = data.get('modelPrices') as string || '';
      const modelPrices = modelPricesRaw.split('|').filter(Boolean).map(item => {
        const parts = item.split('=');
        return { model: parts[0]?.trim() || '', price: parts[1]?.trim() || '' };
      }).filter(i => i.model);

      // Parse faqs (Format: Q=A|Q=A)
      const faqsRaw = data.get('faqs') as string || '';
      const faqs = faqsRaw.split('|').filter(Boolean).map(item => {
        const parts = item.split('=');
        return { question: parts[0]?.trim() || '', answer: parts[1]?.trim() || '' };
      }).filter(i => i.question);

      const symptoms = (data.get('symptoms') as string)?.split(',').map(p => p.trim()).filter(Boolean) || [];
      const problemsCovered = symptoms.length > 0 
        ? symptoms 
        : ((data.get('problemsCovered') as string)?.split(',').map(p => p.trim()).filter(Boolean) || []);

      const name = (data.get('name') as string)?.trim() || '';
      const slug = (data.get('slug') as string)?.trim() || '';
      const category = (data.get('category') as string)?.trim() || 'General';
      const description = (data.get('description') as string)?.trim() || '';
      const imageUrl = (serviceFormImageUrl || (data.get('imageUrl') as string))?.trim() || serviceModal.item?.imageUrl || '';
      const price = (data.get('price') as string)?.trim() || '';
      const priceType = data.get('priceType') as any;
      const estimatedTime = (data.get('estimatedTime') as string)?.trim() || '';
      const diagnosisProcess = (data.get('diagnosisProcess') as string)?.trim() || '';
      const repairProcessSteps = (data.get('repairProcessSteps') as string)?.split('|').map(p => p.trim()).filter(Boolean) || [];
      const toolsAndTech = (data.get('toolsAndTech') as string)?.split(',').map(p => p.trim()).filter(Boolean) || [];
      const supportedBrands = (data.get('supportedBrands') as string)?.split(',').map(p => p.trim()).filter(Boolean) || [];
      const supportedModels = (data.get('supportedModels') as string)?.split(',').map(p => p.trim()).filter(Boolean) || [];
      const warranty = (data.get('warranty') as string)?.trim() || '';
      const importantNotes = (data.get('importantNotes') as string)?.trim() || '';
      const active = data.get('active') === 'true';
      const featured = data.get('featured') === 'true';
      const displayOrder = parseInt(data.get('displayOrder') as string) || 5;

      const payload: any = {
        name,
        slug,
        category,
        description,
        imageUrl,
        image_url: imageUrl,
        price,
        priceType,
        price_type: priceType,
        estimatedTime,
        estimated_time: estimatedTime,
        problemsCovered,
        problems_covered: problemsCovered,
        symptoms,
        diagnosisProcess,
        repairProcessSteps,
        toolsAndTech,
        supportedBrands,
        supportedModels,
        modelPrices,
        warranty,
        importantNotes,
        faqs,
        active,
        is_active: active,
        featured,
        displayOrder,
        display_order: displayOrder,
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let savedRecord: any = null;

      if (serviceModal.item) {
        // Real Supabase UPDATE
        const { data: updateRes, error: updateErr } = await supabase
          .from('services')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (updateErr) {
          console.error('[MOBO ADMIN SAVE ERROR - services update]:', {
            table: 'services',
            id,
            error: updateErr
          });
          throw updateErr;
        }
        savedRecord = updateRes;
      } else {
        // Real Supabase INSERT
        payload.id = id;
        payload.createdAt = new Date().toISOString();
        payload.created_at = new Date().toISOString();
        const { data: insertRes, error: insertErr } = await supabase
          .from('services')
          .insert(payload)
          .select()
          .single();

        if (insertErr) {
          console.error('[MOBO ADMIN SAVE ERROR - services insert]:', {
            table: 'services',
            id,
            error: insertErr
          });
          throw insertErr;
        }
        savedRecord = insertRes;
      }

      // Update local state immediately with returned record
      setServices(prev => {
        if (serviceModal.item) {
          return prev.map(s => s.id === id ? { ...s, ...savedRecord } : s);
        } else {
          return [...prev, savedRecord as Service];
        }
      });

      setServiceModal({ open: false });
      if (onRefreshData) onRefreshData();
      alert('Service saved successfully!');
    } catch (err: any) {
      console.error('Failed to save service:', err);
      alert('Failed to save service: ' + (err?.message || 'Database error. Please check connection and console.'));
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('[MOBO ADMIN DELETE ERROR - services]:', error);
          throw error;
        }

        setServices(prev => prev.filter(s => s.id !== id));
        if (onRefreshData) onRefreshData();
        alert('Service deleted successfully.');
      } catch (err: any) {
        console.error('Error deleting service:', err);
        alert('Failed to delete service: ' + (err?.message || 'Database error.'));
      }
    }
  };

  // FAQ CRUD operations
  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const id = faqModal.item?.id || `faq-${Date.now()}`;
    const faqPayload: any = {
      id,
      question: data.get('question') as string,
      answer: data.get('answer') as string,
      category: (data.get('category') as string) || 'General',
      displayOrder: parseInt(data.get('displayOrder') as string) || 1,
      display_order: parseInt(data.get('displayOrder') as string) || 1
    };

    try {
      const { error } = await supabase.from('faqs').upsert(faqPayload);
      if (error) throw error;
      setFaqModal({ open: false });
      if (onRefreshData) onRefreshData();
      alert('FAQ saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save FAQ: ' + (err?.message || 'Database error'));
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const { error } = await supabase.from('faqs').delete().eq('id', id);
        if (error) throw error;
        if (onRefreshData) onRefreshData();
        alert('FAQ deleted successfully.');
      } catch (err: any) {
        console.error(err);
        alert('Failed to delete FAQ: ' + (err?.message || 'Database error'));
      }
    }
  };

  // Slideshow CRUD operations
  const handleSaveSlide = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const id = slideModal.item?.id || `slide-${Date.now()}`;
    const slidePayload: any = {
      id,
      imageUrl: data.get('imageUrl') as string,
      image_url: data.get('imageUrl') as string,
      title: data.get('title') as string,
      active: data.get('active') === 'true',
      is_active: data.get('active') === 'true',
      displayOrder: parseInt(data.get('displayOrder') as string) || 1,
      display_order: parseInt(data.get('displayOrder') as string) || 1
    };

    try {
      const { error } = await supabase.from('slideshow').upsert(slidePayload);
      if (error) throw error;
      setSlideModal({ open: false });
      if (onRefreshData) onRefreshData();
      alert('Slideshow image saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save slideshow image: ' + (err?.message || 'Database error'));
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (confirm('Are you sure you want to delete this slideshow image?')) {
      try {
        const { error } = await supabase.from('slideshow').delete().eq('id', id);
        if (error) throw error;
        if (onRefreshData) onRefreshData();
        alert('Slideshow image deleted successfully.');
      } catch (err: any) {
        console.error(err);
        alert('Failed to delete slideshow: ' + (err?.message || 'Database error'));
      }
    }
  };

  const handleToggleSlideActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase.from('slideshow').update({ active: !currentActive, is_active: !currentActive }).eq('id', id);
      if (error) throw error;
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...slideshowList].sort((a, b) => a.displayOrder - b.displayOrder);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentItem = sorted[index];
    const neighborItem = sorted[targetIndex];

    const tempOrder = currentItem.displayOrder;
    currentItem.displayOrder = neighborItem.displayOrder;
    neighborItem.displayOrder = tempOrder;

    try {
      await supabase.from('slideshow').update({ displayOrder: currentItem.displayOrder, display_order: currentItem.displayOrder }).eq('id', currentItem.id);
      await supabase.from('slideshow').update({ displayOrder: neighborItem.displayOrder, display_order: neighborItem.displayOrder }).eq('id', neighborItem.id);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Bookings list
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesSearch = b.id.toLowerCase().includes(searchBooking.toLowerCase()) ||
                          b.customerName.toLowerCase().includes(searchBooking.toLowerCase()) ||
                          b.phone.includes(searchBooking) ||
                          b.brand.toLowerCase().includes(searchBooking.toLowerCase()) ||
                          b.model.toLowerCase().includes(searchBooking.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Structured Menu navigation groups matching user requirements
  const ADMIN_NAV_GROUPS = [
    {
      title: 'CORE OPERATIONS',
      items: [
        { id: 'dashboard' as const, label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'bookings' as const, label: 'Bookings & Enquiries', icon: Calendar, badge: bookings.length },
        { id: 'branches' as const, label: 'Branches / Locations', icon: MapPin },
        { id: 'services' as const, label: 'Services Catalog', icon: Wrench },
        { id: 'categories' as const, label: 'Specialized Categories', icon: Layers },
        { id: 'brands' as const, label: 'Phone Brands', icon: Smartphone },
        { id: 'models' as const, label: 'Phone Models', icon: Smartphone },
        { id: 'prices' as const, label: 'Pricing Manager', icon: DollarSign },
      ]
    },
    {
      title: 'PORTFOLIO & REVIEWS',
      items: [
        { id: 'gallery' as const, label: 'Repair Gallery (Photos/Before-After)', icon: Image },
        { id: 'videos' as const, label: 'Repair Videos Feed', icon: Video },
        { id: 'reviews' as const, label: 'Customer Reviews', icon: Star },
        { id: 'offers' as const, label: 'Promotional Offers', icon: Tag },
        { id: 'trust' as const, label: 'Why Choose Us (Trust Points)', icon: Shield },
        { id: 'faq' as const, label: 'SEO FAQ Accordion', icon: HelpCircle },
      ]
    },
    {
      title: 'BUSINESS & CONTACT',
      items: [
        { id: 'branding-profile' as const, label: 'Branding & Business Profile', icon: Building2 },
        { id: 'contact' as const, label: 'Address & Phone', icon: Phone },
        { id: 'hours' as const, label: 'Business Hours & Holiday', icon: Clock },
        { id: 'social' as const, label: 'Social Media Profiles', icon: Share2 },
        { id: 'maps' as const, label: 'Google Maps Link', icon: Compass },
      ]
    },
    {
      title: 'WEBSITE & SEO',
      items: [
        { id: 'sections' as const, label: 'Website Sections / Visibility', icon: Eye },
        { id: 'content' as const, label: 'Website Page Content', icon: FileText },
        { id: 'seo' as const, label: 'Local SEO Settings', icon: Globe },
        { id: 'analytics' as const, label: 'Google Analytics GA4', icon: BarChart2 },
        { id: 'slideshow' as const, label: 'Hero Background Slides', icon: SlidersHorizontal },
        { id: 'media' as const, label: 'Media Storage Library', icon: Database },
      ]
    },
    {
      title: 'FUTURE-READY CMS',
      items: [
        { id: 'pages' as const, label: 'Pages CMS', icon: FileText },
        { id: 'blog' as const, label: 'Repair Blogs CMS', icon: FileText },
        { id: 'navigation' as const, label: 'Menu Navigation', icon: Compass },
        { id: 'legal' as const, label: 'Legal Pages', icon: ShieldAlert },
        { id: 'media-library' as const, label: 'Lab Media Library', icon: Database },
      ]
    },
    {
      title: 'SECURITY & ACCOUNT',
      items: [
        { id: 'change-password' as const, label: 'Change Password', icon: ShieldCheck },
      ]
    }
  ];

  const getActiveTabLabel = (tab: typeof activeTab) => {
    for (const group of ADMIN_NAV_GROUPS) {
      const match = group.items.find(i => i.id === tab);
      if (match) return match.label;
    }
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 pb-16 text-left">
      {/* 1. PROFESSIONAL ADMIN TOP HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* LEFT: Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xs">
              <span className="font-black text-base text-[#0284C7] font-mono">MS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-sans">
                  MOBO SAVIOR Admin
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-[#0284C7] font-mono text-[10px] font-black rounded-md border border-sky-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Administration Panel</p>
            </div>
          </div>

          {/* RIGHT: Active Tab Badge & MENU Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">Section:</span>
              <span className="text-slate-900 font-bold">{getActiveTabLabel(activeTab)}</span>
            </div>

            <button
              id="admin-menu-toggle-btn"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              <span className="text-base leading-none">☰</span>
              <span>MENU</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. SLIDE-OUT NAVIGATION DRAWER & BACKDROP OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Slide-out Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 z-10"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
                    <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight font-sans">
                      Admin Navigation
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Select an administration module</p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Navigation List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {ADMIN_NAV_GROUPS.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <div className="px-2 pb-1 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {group.title}
                      </span>
                    </div>
                    <div className="space-y-1 pt-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${
                              isActive
                                ? 'bg-[#0284C7] text-white shadow-sm'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span className="flex items-center gap-2.5 truncate">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                              <span className="truncate">{item.label}</span>
                            </span>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {item.badge !== undefined && Number(item.badge) > 0 && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    isActive
                                      ? 'bg-white/20 text-white'
                                      : 'bg-sky-50 text-[#0284C7] border border-sky-100'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                              {isActive && (
                                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                                  <Check className="w-3 h-3" /> ACTIVE
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Footer with Logout */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-rose-200 rounded-xl text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors focus:outline-none"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Administrative</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium">
                  MOBO SAVIOR Secure Administrative Session
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
                Overview Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Saddam Technical Central Operations & System Statistics.
              </p>
            </div>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold shadow-2xs transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Explore All Modules</span>
            </button>
          </div>
        )}

        {activeTab === 'change-password' && (
          <AdminChangePassword
            onCancel={() => setActiveTab('dashboard')}
            onSuccessLogout={handleLogout}
          />
        )}

        {activeTab === 'sections' && (
          <AdminSections onRefreshData={onRefreshData} />
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Bookings</span>
                <p className="text-2xl font-black text-slate-800 font-sans mt-1">{bookings.length}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Review</span>
                <p className="text-2xl font-black text-amber-500 font-sans mt-1">
                  {bookings.filter(b => b.status === 'Pending').length}
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Repairs</span>
                <p className="text-2xl font-black text-indigo-500 font-sans mt-1">
                  {bookings.filter(b => b.status === 'In Progress' || b.status === 'Confirmed').length}
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ready Pickup</span>
                <p className="text-2xl font-black text-emerald-600 font-sans mt-1">
                  {bookings.filter(b => b.status === 'Ready for Pickup').length}
                </p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm pb-1.5 border-b border-slate-100">
                Quick Action Shortcuts
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => { setActiveTab('services'); setServiceModal({ open: true }); }}
                  className="p-3.5 bg-sky-50 hover:bg-sky-100 rounded-xl text-center flex flex-col items-center gap-1.5 transition-colors focus:outline-none"
                >
                  <Plus className="w-5 h-5 text-[#0284C7]" />
                  <span className="text-[10px] font-bold text-[#0284C7] uppercase">Add New Service</span>
                </button>
                <button
                  onClick={() => { setActiveTab('faq'); setFaqModal({ open: true }); }}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-center flex flex-col items-center gap-1.5 transition-colors focus:outline-none"
                >
                  <Plus className="w-5 h-5 text-slate-600" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Add FAQ Entry</span>
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="p-3.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-center flex flex-col items-center gap-1.5 transition-colors focus:outline-none"
                >
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Manage Bookings</span>
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className="p-3.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-center flex flex-col items-center gap-1.5 transition-colors focus:outline-none"
                >
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Branding & Logo</span>
                </button>
              </div>
            </div>

            {/* Micro Dashboard Table teaser */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm pb-1.5 border-b border-slate-100">
                Recent Unprocessed Bookings
              </h3>
              {loadingBookings ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading bench logs...</div>
              ) : bookings.filter(b => b.status === 'Pending').length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-2.5 font-bold uppercase">ID</th>
                        <th className="py-2.5 font-bold uppercase">Customer</th>
                        <th className="py-2.5 font-bold uppercase">Service / Brand</th>
                        <th className="py-2.5 font-bold uppercase">Schedule</th>
                        <th className="py-2.5 font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {bookings.filter(b => b.status === 'Pending').slice(0, 5).map(b => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-mono text-[#0284C7] font-bold">{b.id}</td>
                          <td className="py-2.5">{b.customerName}</td>
                          <td className="py-2.5">{b.serviceName} ({b.brand} {b.model})</td>
                          <td className="py-2.5">{b.preferredDate}</td>
                          <td className="py-2.5">
                            <button
                              onClick={() => { setSelectedBooking(b); setActiveTab('bookings'); }}
                              className="text-xs font-bold text-[#0284C7] hover:underline focus:outline-none"
                            >
                              Edit Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-8 text-center text-xs text-slate-400">No pending bookings waiting for review. All clear!</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'branches' && <AdminBranches onRefreshData={onRefreshData} />}

        {activeTab === 'bookings' && <AdminServiceBookings />}
        
        {activeTab === 'services' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm font-sans">
                Active Services Catalog CRUD
              </h3>
              <button
                onClick={() => setServiceModal({ open: true })}
                className="px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-bold flex items-center gap-1 focus:outline-none"
              >
                <Plus className="w-3.5 h-3.5" /> New Service
              </button>
            </div>

            <div className="space-y-4">
              {services.map(srv => (
                <div key={srv.id} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50 gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      <img src={getServiceImage(srv)} alt={srv.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{srv.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Category: {srv.category} | Price: {srv.price ? `₹${srv.price}` : 'Inspect estimate'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setServiceModal({ open: true, item: srv })}
                      className="p-1.5 text-slate-500 hover:text-[#0284C7] hover:bg-slate-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <AdminCategories 
            servicesList={services} 
            onRefreshData={onRefreshData} 
          />
        )}

        {activeTab === 'brands' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <AdminBrandsModels 
              servicesList={services} 
              onRefreshData={onRefreshData} 
              defaultTab="brands"
            />
          </div>
        )}

        {activeTab === 'models' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <AdminBrandsModels 
              servicesList={services} 
              onRefreshData={onRefreshData} 
              defaultTab="models"
            />
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm font-sans">
                SEO FAQ Accordion Management
              </h3>
              <button
                onClick={() => setFaqModal({ open: true })}
                className="px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-bold flex items-center gap-1 focus:outline-none"
              >
                <Plus className="w-3.5 h-3.5" /> New FAQ
              </button>
            </div>

            <div className="space-y-4">
              {faqs.map(faq => (
                <div key={faq.id} className="p-3.5 border border-slate-100 rounded-xl flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800">{faq.question}</h4>
                    <p className="text-slate-500 line-clamp-2 leading-normal">{faq.answer}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setFaqModal({ open: true, item: faq })}
                      className="p-1.5 text-slate-400 hover:text-[#0284C7] rounded-lg hover:bg-slate-50"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Branding Management */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-extrabold text-slate-800 text-sm pb-1.5 border-b border-slate-100">
                Administrative Branding & Logo Customizer
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Custom Logo Image URL</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="e.g. https://domain.com/logo.png"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveBranding}
                disabled={saveLoading}
                className="px-4 py-2 bg-[#0284C7] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Save Branding
              </button>
            </div>

            {/* Location, Contact & Social Media Settings */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-slate-800 text-sm font-sans">
                  Location, Contact & Social Media Links
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Configure the official Google Maps location, phone numbers, and verified social media profiles displayed across the website.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">Physical Lab Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Room No B4, Super Market, Hattola More, Purulia, West Bengal 723101"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Support Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081675 49092"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">WhatsApp Phone Line</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="081675 49092"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-600 font-bold">Google Maps URL (Get Directions & Location)</label>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-sky-600 hover:text-sky-700 font-bold underline"
                      >
                        Verify / Test Link ↗
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/tU41BvTCk3dRAn6r9"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] focus:border-sky-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used by 'Get Directions' buttons, Home page location CTA, contact page and footer location links.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-600 font-bold">Facebook Profile / Page URL</label>
                    {facebook && (
                      <a
                        href={facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-bold underline"
                      >
                        Verify / Test Link ↗
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://www.facebook.com/share/19aL5sjb28/"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-600 font-bold">Instagram Profile URL</label>
                    {instagram && (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-pink-600 hover:text-pink-700 font-bold underline"
                      >
                        Verify / Test Link ↗
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://www.instagram.com/saddam617technical?stkn=MWh2MXNnZjZwNXI5MQ=="
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-600 font-bold">YouTube Channel URL (Optional)</label>
                    {youtube && (
                      <a
                        href={youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-red-600 hover:text-red-700 font-bold underline"
                      >
                        Verify / Test Link ↗
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://www.youtube.com/@channel (Optional)"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] focus:border-red-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Leave blank if not provided. Fake or placeholder links will not be shown on the website.
                  </p>
                </div>

                <div className="sm:col-span-2 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <label className="block text-emerald-950 font-bold text-xs">WhatsApp Channel URL</label>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Broadcast Channel
                      </span>
                    </div>
                    {whatsappChannelUrl && (
                      <a
                        href={whatsappChannelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1"
                      >
                        Verify / Test Channel Link ↗
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={whatsappChannelUrl}
                    onChange={(e) => setWhatsappChannelUrl(e.target.value)}
                    placeholder="https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K"
                    className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl font-mono text-[11px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-emerald-800/80 mt-1 font-medium">
                    Official WhatsApp Channel URL for announcements, repair updates and offers. Separate from customer enquiry chat ("WhatsApp Now").
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveContact}
                  disabled={saveLoading}
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Location & Social Settings</span>
                </button>
              </div>
            </div>

            {/* General Home Content */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-extrabold text-slate-800 text-sm pb-1.5 border-b border-slate-100">
                Front-End Page Copy & Storytelling
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Hero Heading Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Hero Supporting Text</label>
                  <textarea
                    rows={2}
                    value={heroDesc}
                    onChange={(e) => setHeroDesc(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">About Biography Description</label>
                  <textarea
                    rows={4}
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">About Quote Highlight</label>
                  <input
                    type="text"
                    value={aboutHighlight}
                    onChange={(e) => setAboutHighlight(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveContent}
                disabled={saveLoading}
                className="px-4 py-2 bg-[#0284C7] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Save Front-End Copy
              </button>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <AdminSEOSettings
            seoSettings={seoSettings}
            onSave={async (updatedSettings) => {
              const { error } = await supabase.from('settings').upsert({ id: 'seo', ...updatedSettings, updated_at: new Date().toISOString() });
              if (error) throw error;
              onRefreshData();
            }}
          />
        )}

        {activeTab === 'slideshow' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-left">
                <h3 className="font-extrabold text-slate-800 text-sm font-sans">
                  Hero Background Slideshow Management
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Manage the 10 custom AI-generated background slideshow images</p>
              </div>
              <button
                onClick={() => setSlideModal({ open: true, item: null })}
                className="px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-bold flex items-center gap-1 focus:outline-none"
              >
                <Plus className="w-3.5 h-3.5" /> Add Slide
              </button>
            </div>

            <div className="space-y-4">
              {[...slideshowList].sort((a, b) => a.displayOrder - b.displayOrder).map((slide, idx, arr) => (
                <div key={slide.id} className="p-4 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800">{slide.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono leading-none">ID: {slide.id} | Order: {slide.displayOrder}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Active Switch Badge */}
                    <button
                      onClick={() => handleToggleSlideActive(slide.id, slide.active)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold select-none transition-colors ${
                        slide.active 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {slide.active ? 'Enabled' : 'Disabled'}
                    </button>

                    {/* Move Up Button */}
                    <button
                      onClick={() => handleMoveSlide(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-slate-400 hover:text-[#0284C7] disabled:opacity-20 rounded-lg hover:bg-slate-50"
                      title="Move Up"
                    >
                      <svg className="w-3.5 h-3.5 transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Move Down Button */}
                    <button
                      onClick={() => handleMoveSlide(idx, 'down')}
                      disabled={idx === arr.length - 1}
                      className="p-1.5 text-slate-400 hover:text-[#0284C7] disabled:opacity-20 rounded-lg hover:bg-slate-50"
                      title="Move Down"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => setSlideModal({ open: true, item: slide })}
                      className="p-1.5 text-slate-400 hover:text-[#0284C7] rounded-lg hover:bg-slate-50"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-800 text-sm font-sans flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0284C7]" />
                Lab Address & Primary Support Lines
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Official shop location and direct telephone contact info shown on customer headers, hero section, contact page, and footer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">Physical Lab Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Room No B4, Super Market, Hattola More, Purulia, West Bengal 723101"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Support Call Line</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081675 49092"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">WhatsApp Business Number</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="081675 49092"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveContact}
              disabled={saveLoading}
              className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" /> Save Contact Info
            </button>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-800 text-sm font-sans flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0284C7]" />
                Store Business Hours & Weekly Holiday Schedule
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Set operating times and holiday notes displayed on the contact card and footer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Monday - Friday Hours</label>
                <input
                  type="text"
                  value={monFriHours}
                  onChange={(e) => setMonFriHours(e.target.value)}
                  placeholder="10:00 AM - 08:30 PM"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Saturday Hours</label>
                <input
                  type="text"
                  value={satHours}
                  onChange={(e) => setSatHours(e.target.value)}
                  placeholder="10:00 AM - 08:30 PM"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Sunday Schedule</label>
                <input
                  type="text"
                  value={sunHours}
                  onChange={(e) => setSunHours(e.target.value)}
                  placeholder="Closed / By Appointment"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Weekly Holiday Day</label>
                <input
                  type="text"
                  value={weeklyHoliday}
                  onChange={(e) => setWeeklyHoliday(e.target.value)}
                  placeholder="Thursday"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">Store Announcement / Express Service Note</label>
                <input
                  type="text"
                  value={hoursNote}
                  onChange={(e) => setHoursNote(e.target.value)}
                  placeholder="Open all days except public festival holidays. Express bench service available."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveHours}
              disabled={saveLoading}
              className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" /> Save Schedule & Hours
            </button>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-800 text-sm font-sans flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#0284C7]" />
                Official Social Media Channels
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Verified social links attached to Saddam Technical's brand presence across Facebook, Instagram, and YouTube.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Facebook Page / Profile URL</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://www.facebook.com/share/19aL5sjb28/"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Instagram Profile URL</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://www.instagram.com/saddam617technical"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">YouTube Channel URL (Optional)</label>
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://www.youtube.com/@saddamtechnical"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <label className="block text-emerald-950 font-bold text-xs">WhatsApp Channel URL</label>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Broadcast Channel
                    </span>
                  </div>
                  {whatsappChannelUrl && (
                    <a
                      href={whatsappChannelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1"
                    >
                      Verify / Test Channel Link ↗
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={whatsappChannelUrl}
                  onChange={(e) => setWhatsappChannelUrl(e.target.value)}
                  placeholder="https://whatsapp.com/channel/0029VaRdZK80QeahHriOTD1K"
                  className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl font-mono text-[11px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-emerald-800/80 mt-1 font-medium">
                  Official WhatsApp Channel URL for announcements, repair updates and offers. Separate from customer enquiry chat ("WhatsApp Now").
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveContact}
              disabled={saveLoading}
              className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" /> Save Social Links
            </button>
          </div>
        )}

        {activeTab === 'maps' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-800 text-sm font-sans flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0284C7]" />
                Google Maps Location & Get Directions Integration
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Exact short link from Google Maps for customer directions and Purulia shop navigation.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 font-bold">Google Maps Share URL</label>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-600 hover:text-sky-700 font-bold underline flex items-center gap-1"
                    >
                      <span>Verify Location Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              <div className="mt-4">
                <label className="block text-slate-600 font-bold mb-1">Google Maps Embed iframe URL (src)</label>
                <input
                  type="text"
                  value={mapIframeUrl}
                  onChange={(e) => setMapIframeUrl(e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] focus:border-sky-500 focus:outline-none"
                />
              </div>
                <input
                  type="text"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/tU41BvTCk3dRAn6r9"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveContact}
              disabled={saveLoading}
              className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" /> Save Google Maps URL
            </button>
          </div>
        )}

        {activeTab === 'branding-profile' && (
          <AdminBrandingBusinessProfile
            brandingSettings={brandingSettings}
            contactSettings={contactSettings}
            websiteContent={websiteContent}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalyticsDashboard />
        )}

        {(activeTab === 'gallery' || activeTab === 'videos' || activeTab === 'media') && (
          <AdminGalleryManager />
        )}

        {activeTab === 'reviews' && (
          <AdminReviewsManager />
        )}

        {activeTab === 'offers' && (
          <AdminOffers />
        )}

        {activeTab === 'prices' && (
          <AdminPrices onRefreshData={onRefreshData} />
        )}

        {activeTab === 'trust' && (
          <AdminTrustSection />
        )}

        {activeTab === 'pages' && (
          <AdminPages onRefreshData={onRefreshData} />
        )}

        {activeTab === 'blog' && (
          <AdminBlog onRefreshData={onRefreshData} />
        )}

        {activeTab === 'navigation' && (
          <AdminNavigation />
        )}

        {activeTab === 'legal' && (
          <AdminLegalPages />
        )}

        {activeTab === 'media-library' && (
          <AdminMediaLibrary />
        )}
      </main>

      {/* 1. Service CRUD Modal */}
      {serviceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto pt-20">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-5 text-xs text-slate-700 shadow-2xl relative my-8">
            <button onClick={() => setServiceModal({ open: false })} className="absolute top-4 right-4 p-1.5 rounded hover:bg-slate-50 text-slate-400">
              <X className="w-4.5 h-4.5" />
            </button>
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              {serviceModal.item ? 'Edit Service Details' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <h4 className="md:col-span-2 font-bold text-slate-800">Basic Information</h4>
                <div>
                  <label className="block text-slate-500 mb-1">Service Name *</label>
                  <input type="text" name="name" required defaultValue={serviceModal.item?.name || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">URL Slug *</label>
                  <input type="text" name="slug" required disabled={!!serviceModal.item} defaultValue={serviceModal.item?.slug || ''} placeholder="e.g. iphone-repair" className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Category *</label>
                  <input type="text" name="category" required defaultValue={serviceModal.item?.category || 'Hardware'} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Image URL</label>
                  <ImageUploader 
                    label="Service Image" 
                    value={serviceFormImageUrl} 
                    onChange={setServiceFormImageUrl} 
                    folder="service_images"
                  />
                  <input type="hidden" name="imageUrl" value={serviceFormImageUrl} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-500 mb-1">Short Description *</label>
                  <textarea name="description" required defaultValue={serviceModal.item?.description || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl h-20"></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 border border-slate-200 rounded-xl">
                <h4 className="md:col-span-3 font-bold text-slate-800">Pricing & Timing</h4>
                <div>
                  <label className="block text-slate-500 mb-1">Price</label>
                  <input type="text" name="price" defaultValue={serviceModal.item?.price || ''} placeholder="e.g. 999" className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Pricing Type *</label>
                  <select name="priceType" defaultValue={serviceModal.item?.priceType || 'upon_inspection'} className="w-full px-3 py-2 border border-slate-200 rounded-xl">
                    <option value="exact">Exact Price</option>
                    <option value="estimate">Estimate Cost</option>
                    <option value="upon_inspection">Upon Inspection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Estimated Time *</label>
                  <input type="text" name="estimatedTime" defaultValue={serviceModal.item?.estimatedTime || '1-3 Hours'} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-slate-500 mb-1">Model-wise Prices (Format: Model=Price | Model=Price)</label>
                  <textarea name="modelPrices" defaultValue={serviceModal.item?.modelPrices?.map(m => m.model + '=' + m.price).join(' | ') || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl h-16"></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <h4 className="md:col-span-2 font-bold text-slate-800">Details & Process</h4>
                <div className="md:col-span-2">
                  <label className="block text-slate-500 mb-1">Symptoms / Problems Covered (Comma separated) *</label>
                  <input type="text" name="symptoms" required defaultValue={serviceModal.item?.symptoms?.join(', ') || serviceModal.item?.problemsCovered?.join(', ') || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                  <input type="hidden" name="problemsCovered" value={serviceModal.item?.problemsCovered?.join(',') || ''} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-500 mb-1">Diagnosis Process Overview</label>
                  <textarea name="diagnosisProcess" defaultValue={serviceModal.item?.diagnosisProcess || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl h-16"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-500 mb-1">Repair Process Steps (Use | to separate steps)</label>
                  <textarea name="repairProcessSteps" defaultValue={serviceModal.item?.repairProcessSteps?.join(' | ') || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl h-20"></textarea>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Tools & Technology (Comma separated)</label>
                  <input type="text" name="toolsAndTech" defaultValue={serviceModal.item?.toolsAndTech?.join(', ') || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Warranty Information</label>
                  <input type="text" name="warranty" defaultValue={serviceModal.item?.warranty || 'Standard Testing'} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 border border-slate-200 rounded-xl">
                <h4 className="md:col-span-2 font-bold text-slate-800">Additional Meta</h4>
                <div>
                  <label className="block text-slate-500 mb-1">Supported Brands (Comma separated)</label>
                  <input type="text" name="supportedBrands" defaultValue={serviceModal.item?.supportedBrands?.join(', ') || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Supported Models (Comma separated)</label>
                  <input type="text" name="supportedModels" defaultValue={serviceModal.item?.supportedModels?.join(', ') || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-500 mb-1">FAQs (Format: Question=Answer | Question=Answer)</label>
                  <textarea name="faqs" defaultValue={serviceModal.item?.faqs?.map(f => f.question + '=' + f.answer).join(' | ') || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl h-20"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-500 mb-1">Important Notes (Disclaimer)</label>
                  <input type="text" name="importantNotes" defaultValue={serviceModal.item?.importantNotes || ''} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-slate-500 mb-1">Display Rank Order *</label>
                  <input type="number" name="displayOrder" required defaultValue={serviceModal.item?.displayOrder || 5} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Active Status</label>
                  <select name="active" defaultValue={serviceModal.item ? String(serviceModal.item.active) : 'true'} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white">
                    <option value="true">Active & Visible</option>
                    <option value="false">Hidden / Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Featured Service</label>
                  <select name="featured" defaultValue={serviceModal.item ? String(serviceModal.item.featured) : 'false'} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={isSavingService}
                  className="flex-1 py-3 bg-[#0284C7] disabled:bg-slate-300 text-white font-bold rounded-xl hover:bg-[#0369A1] transition-all flex items-center justify-center gap-2"
                >
                  {isSavingService ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Service Details...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Service Details
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  disabled={isSavingService}
                  onClick={() => setServiceModal({ open: false })} 
                  className="px-6 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

      )}

      {/* 2. FAQ CRUD Modal */}
      {faqModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 text-xs text-slate-700 relative shadow-2xl">
            <button onClick={() => setFaqModal({ open: false })} className="absolute top-4 right-4 p-1.5 rounded hover:bg-slate-50 text-slate-400">
              <X className="w-4.5 h-4.5" />
            </button>
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              {faqModal.item ? 'Edit FAQ' : 'Add New FAQ Accordion'}
            </h3>

            <form onSubmit={handleSaveFAQ} className="space-y-4">
              <div>
                <label className="block text-slate-500 mb-1">Question / Inquiry *</label>
                <input
                  type="text"
                  name="question"
                  required
                  defaultValue={faqModal.item?.question || ''}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Detailed Answer *</label>
                <textarea
                  name="answer"
                  required
                  rows={4}
                  defaultValue={faqModal.item?.answer || ''}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl leading-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={faqModal.item?.category || 'Services'}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Display Rank Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    defaultValue={faqModal.item?.displayOrder || 1}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl"
              >
                Save FAQ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Slideshow CRUD Modal */}
      {slideModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 text-xs text-slate-700 relative shadow-2xl">
            <button onClick={() => setSlideModal({ open: false })} className="absolute top-4 right-4 p-1.5 rounded hover:bg-slate-50 text-slate-400">
              <X className="w-4.5 h-4.5" />
            </button>
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              {slideModal.item ? 'Edit Slideshow Image' : 'Add New Slideshow Image'}
            </h3>

            <form onSubmit={handleSaveSlide} className="space-y-4">
              <div>
                <label className="block text-slate-500 mb-1">Slide Title / Description *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={slideModal.item?.title || ''}
                  placeholder="e.g. iPhone Repair Expert"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Image URL / Local Asset Path *</label>
                <ImageUploader 
                  label="Slide Image" 
                  value={slideFormImageUrl} 
                  onChange={setSlideFormImageUrl} 
                  folder="hero_slides"
                />
                <input type="hidden" name="imageUrl" value={slideFormImageUrl} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    required
                    defaultValue={slideModal.item?.displayOrder ?? (slideshowList.length + 1)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Status</label>
                  <select
                    name="active"
                    defaultValue={slideModal.item?.active === false ? 'false' : 'true'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="true">Enabled / Visible</option>
                    <option value="false">Disabled / Hidden</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl"
              >
                Save Slide Details
              </button>
            </form>
          </div>
        </div>
      )}
      {/* 4. Gallery Photo CRUD Modal */}
      {galleryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 text-xs text-slate-700 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setGalleryModal({ open: false })} 
              className="absolute top-4 right-4 p-1.5 rounded hover:bg-slate-50 text-slate-400"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              {galleryModal.item ? 'Edit Photo Details' : 'Add New Portfolio Photo'}
            </h3>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4">
              <div>
                <label className="block text-slate-500 mb-1">Upload Photo File (Cloud Storage) *</label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:bg-[#E0F2FE] file:text-[#0284C7] hover:file:bg-sky-100 file:cursor-pointer"
                />
                <p className="text-[9px] text-slate-400 mt-1">Recommended: Clear, non-blurry close-ups of micro-soldering, IC, or high-end display laminations.</p>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">or specify public URL</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Direct Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  defaultValue={galleryModal.item?.imageUrl || ''}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono text-[10px]"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={galleryModal.item?.title || ''}
                  placeholder="e.g. iPhone 14 Pro Max Backglass Laser Repair"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={galleryModal.item?.description || ''}
                  placeholder="e.g. Step-by-step restoration showing the clean high-precision laser separation..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl leading-normal text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Category Category *</label>
                  <input
                    type="text"
                    name="category"
                    required
                    defaultValue={galleryModal.item?.category || 'Motherboard'}
                    placeholder="e.g. Screens, Soldering"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Display Rank Order *</label>
                  <input
                    type="number"
                    name="displayOrder"
                    required
                    defaultValue={galleryModal.item?.displayOrder ?? (gallery.length + 1)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Status Visbility</label>
                  <select
                    name="active"
                    defaultValue={galleryModal.item?.active === false ? 'false' : 'true'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="true">Enabled / Visible</option>
                    <option value="false">Hidden / Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Showcase On Home</label>
                  <select
                    name="featured"
                    defaultValue={galleryModal.item?.featured === true ? 'true' : 'false'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="false">Standard Item</option>
                    <option value="true">Featured</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black rounded-xl shadow flex items-center justify-center gap-1.5"
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Uploading & Bundling...
                  </>
                ) : (
                  'Publish Portfolio Photo'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Video Portfolio CRUD Modal */}
      {videoModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 text-xs text-slate-700 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setVideoModal({ open: false })} 
              className="absolute top-4 right-4 p-1.5 rounded hover:bg-slate-50 text-slate-400"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              {videoModal.item ? 'Edit Video Details' : 'Add New Portfolio Video'}
            </h3>

            <form onSubmit={handleSaveVideoItem} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Video URL *</label>
                <input
                  type="text"
                  name="videoUrl"
                  required
                  defaultValue={videoModal.item?.videoUrl || ''}
                  placeholder="Paste YouTube, Facebook or Instagram video link"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supported Sources:</span>
                  <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-md border border-red-200">
                    YouTube
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-200">
                    Facebook
                  </span>
                  <span className="px-2 py-0.5 bg-pink-50 text-pink-700 text-[10px] font-bold rounded-md border border-pink-200">
                    Instagram
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Videos must be provided as a public YouTube, Facebook, or Instagram link. Local device video uploading is disabled.</p>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Video Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={videoModal.item?.title || ''}
                  placeholder="e.g. iPad Pro CPU Swapping Microscope Demonstration"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={videoModal.item?.description || ''}
                  placeholder="e.g. Watch Saddam Bhai execute microsoldering repairs at 45x magnification..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl leading-normal text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Category *</label>
                  <input
                    type="text"
                    name="category"
                    required
                    defaultValue={videoModal.item?.category || 'Motherboard'}
                    placeholder="e.g. Screens, Soldering"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Display Rank Order *</label>
                  <input
                    type="number"
                    name="displayOrder"
                    required
                    defaultValue={videoModal.item?.displayOrder ?? (videos.length + 1)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Status Visbility</label>
                  <select
                    name="active"
                    defaultValue={videoModal.item?.active === false ? 'false' : 'true'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="true">Enabled / Visible</option>
                    <option value="false">Hidden / Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Showcase On Home</label>
                  <select
                    name="featured"
                    defaultValue={videoModal.item?.featured === true ? 'true' : 'false'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="false">Standard Item</option>
                    <option value="true">Featured</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black rounded-xl shadow flex items-center justify-center gap-1.5"
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    {uploadProgress > 0 && uploadProgress < 100 
                      ? `Uploading Video (${uploadProgress}%)...` 
                      : 'Saving Video Item...'}
                  </>
                ) : (
                  'Publish Portfolio Video'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Unified Media Preview Overlay Lightbox */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            {previewMedia.type === 'photo' ? (
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <img 
                  src={previewMedia.url} 
                  alt={previewMedia.title} 
                  className="max-h-[70vh] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="relative aspect-video bg-black w-full flex items-center justify-center overflow-hidden">
                <EmbeddedVideoPlayer videoUrl={previewMedia.url} title={previewMedia.title} />
              </div>
            )}

            <div className="p-6 bg-white text-slate-700 text-left space-y-1">
              <h4 className="text-lg font-black text-slate-900 font-sans">{previewMedia.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{previewMedia.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
