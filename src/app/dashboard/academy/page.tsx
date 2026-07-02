'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import Sidebar from '@/components/Sidebar';
import {
  Globe,
  Trophy,
  Users,
  Award,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Star,
  Trash2,
  Edit3,
  Plus,
  Save,
  Shield,
  FileText,
  UserCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const Facebook = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);


interface Champion {
  _id?: string;
  name: string;
  photoUrl: string;
  ageCategory: string;
  sportCategory: string;
  achievements: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
  };
}

interface Testimonial {
  _id?: string;
  name: string;
  profileImageUrl: string;
  reviewText: string;
  rating: number;
}

interface GalleryItem {
  _id?: string;
  imageUrl: string;
  caption?: string;
}

interface Coach {
  _id: string;
  name: string;
  phone: string;
  photoUrl?: string;
  position?: string;
  experience?: string;
  biography?: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

interface AcademyContent {
  logoUrl?: string;
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    mediaUrl: string;
  };
  about: {
    introduction: string;
    vision: string;
    mission: string;
    story: string;
    imageUrl: string;
    imageFit?: 'cover' | 'contain';
  };
  whyChooseUs: {
    icon: string;
    title: string;
    description: string;
  }[];
  statistics: {
    championsCount: number;
    tournamentsCount: number;
    yearsOfExperience: number;
    traineesCount: number;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    googleMapUrl: string;
  };
  kickboxing?: {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    coachNameAr: string;
    coachNameEn: string;
    coachBioAr: string;
    coachBioEn: string;
    imageUrl: string;
    imageUrl2?: string;
    imageUrl3?: string;
  };
}

const ImageUploadField = ({
  label,
  value,
  onChange,
  language
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  language: string;
}) => {
  const [fileLoading, setFileLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 600; // Reduced to keep Base64 well under MongoDB 16MB doc limit
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // quality 0.6 to reduce size
          onChange(dataUrl);
        }
        setFileLoading(false);
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-semibold text-[#828282] uppercase">{label}</label>
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3">
        {value ? (
          <div className="relative w-20 h-20 rounded-md border border-[#2A2A2A] overflow-hidden flex-shrink-0 bg-black">
            <img src={value} alt="Preview" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-bl p-1 text-xs"
              title="Remove"
            >
              &times;
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-md border border-dashed border-[#444] flex items-center justify-center text-xs text-[#828282] flex-shrink-0 bg-black/20">
            {language === 'ar' ? 'لا توجد صورة' : 'No Image'}
          </div>
        )}
        <div className="flex-1 w-full space-y-2">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id={`image-upload-${label.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`}
            />
            <label
              htmlFor={`image-upload-${label.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`}
              className="cursor-pointer inline-flex items-center justify-center w-full px-4 py-2 bg-[#FF9500] hover:bg-[#D90000] text-black hover:text-white text-xs font-bold rounded-lg transition-all duration-300"
            >
              {fileLoading
                ? (language === 'ar' ? 'جاري التحميل...' : 'Uploading...')
                : (language === 'ar' ? 'اختر صورة من جهازك' : 'Choose image from device')}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AcademyManagement() {
  const { t, isRtl, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'hero_about' | 'kickboxing' | 'why_stats_contact' | 'champions' | 'testimonials' | 'gallery' | 'coaches'>('hero_about');

  // Loading and alerts
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [content, setContent] = useState<AcademyContent>({
    logoUrl: '/logo.jpg',
    hero: { title: '', subtitle: '', ctaText: '', ctaLink: '', mediaUrl: '' },
    about: { introduction: '', vision: '', mission: '', story: '', imageUrl: '/ابطالنا/احمد سالم.jpeg', imageFit: 'contain' as 'cover' | 'contain' },
    whyChooseUs: [],
    statistics: { championsCount: 0, tournamentsCount: 0, yearsOfExperience: 0, traineesCount: 0 },
    contact: { address: '', phone: '', email: '', googleMapUrl: '' },
    kickboxing: { titleAr: 'الكيك بوكسينج الاحترافي', titleEn: 'Professional Kickboxing Division', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '', imageUrl2: '', imageUrl3: '' }
  });

  // Collections state
  const [champions, setChampions] = useState<Champion[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);

  // Modals state
  const [championModal, setChampionModal] = useState<{ open: boolean; editId?: string; form: Champion }>({
    open: false,
    form: { name: '', photoUrl: '', ageCategory: '', sportCategory: '', achievements: '', socialLinks: { facebook: '', instagram: '' } },
  });

  const [testimonialModal, setTestimonialModal] = useState<{ open: boolean; editId?: string; form: Testimonial }>({
    open: false,
    form: { name: '', profileImageUrl: '', reviewText: '', rating: 5 },
  });

  const [galleryModal, setGalleryModal] = useState<{ open: boolean; editId?: string; form: GalleryItem }>({
    open: false,
    form: { imageUrl: '', caption: '' },
  });

  const [coachModal, setCoachModal] = useState<{ open: boolean; coachId?: string; form: Omit<Coach, '_id' | 'name' | 'phone'> }>({
    open: false,
    form: { photoUrl: '', position: '', experience: '', biography: '', facebookUrl: '', instagramUrl: '' },
  });

  // Fetch all website content on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch singleton content
        const contentRes = await fetch('/api/academy/content');
        if (contentRes.ok) {
          const contentData = await contentRes.json();
          if (!contentData.kickboxing) {
            contentData.kickboxing = {
              titleAr: 'قسم الكيك بوكسينج الاحترافي',
              titleEn: 'Professional Kickboxing Division',
              descriptionAr: 'انضم إلى أحد أقوى البرامج التدريبية في الكيك بوكسينج المصمم خصيصًا لتطوير القوة البدنية، والسرعة، والتركيز الذهني العالي. ندمج بين أحدث أساليب التدريب الرياضي والممارسات القتالية لضمان تحقيق أعلى درجات اللياقة والدفاع عن النفس في بيئة حماسية وآمنة تماماً.',
              descriptionEn: 'Join one of the most powerful Kickboxing training programs designed to enhance physical strength, agility, and deep mental focus. We blend modern athletic training with actual combat drills to guarantee top-tier fitness and self-defense capabilities in an exciting, safe environment.',
              coachNameAr: 'الكابتن مينا ناجي',
              coachNameEn: 'Coach Mina Nagi',
              coachBioAr: 'الكابتن مينا ناجي هو رمز التفاني والاحترافية، ويُعتبر أحد أفضل مدربي الكيك بوكسينج والرياضات القتالية. يتميز بأسلوبه التدريبي الفريد الذي يجمع بين الدعم المعنوي والتركيز البدني المكثف، مما يُمكّن المتدربين من تخطي حدود قدراتهم وتحقيق تحول حقيقي في اللياقة البدنية والمهارات الدفاعية. بفضل شغفه ورؤيته، استطاع كابتن مينا بناء مجتمع رياضي حماسي يلهم الجميع للوصول إلى منصات التتويج والتميز.',
              coachBioEn: 'Coach Mina Nagi is the epitome of dedication and professionalism, widely recognized as one of the premier instructors in Kickboxing and combat sports. He stands out with his unique teaching methodology that merges absolute motivational support with intense physical training, empowering trainees to exceed their limits and achieve remarkable fitness and self-defense transformations. Through his passion and vision, Captain Mina has built an inspiring community where everyone thrives to achieve championship levels.',
              imageUrl: '/logo.jpg'
            };
          }
          setContent(contentData);
        }

        // Fetch champions
        const championsRes = await fetch('/api/academy/champions');
        if (championsRes.ok) {
          setChampions(await championsRes.json());
        }

        // Fetch testimonials
        const testimonialsRes = await fetch('/api/academy/testimonials');
        if (testimonialsRes.ok) {
          setTestimonials(await testimonialsRes.json());
        }

        // Fetch gallery
        const galleryRes = await fetch('/api/academy/gallery');
        if (galleryRes.ok) {
          setGallery(await galleryRes.json());
        }

        // Fetch coaches list
        const coachesRes = await fetch('/api/coaches');
        if (coachesRes.ok) {
          setCoaches(await coachesRes.json());
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast(language === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load content', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [language]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Save general content (Hero, About, Stats, Contact)
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/academy/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (!res.ok) throw new Error('Failed to update content');
      showToast(language === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Content updated successfully', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Failed to update content', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Why choose us helper methods
  const handleWhyChooseUsChange = (index: number, field: string, value: string) => {
    const updated = [...content.whyChooseUs];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, whyChooseUs: updated });
  };

  const handleAddWhyChooseUs = () => {
    const newItem = { icon: 'Award', title: 'عنوان الميزة', description: 'تفاصيل وشرح الميزة...' };
    setContent({ ...content, whyChooseUs: [...content.whyChooseUs, newItem] });
  };

  const handleRemoveWhyChooseUs = (index: number) => {
    const updated = content.whyChooseUs.filter((_, idx) => idx !== index);
    setContent({ ...content, whyChooseUs: updated });
  };

  // Champion CRUD functions
  const openChampionModal = (champ?: Champion) => {
    if (champ) {
      setChampionModal({
        open: true,
        editId: champ._id,
        form: {
          name: champ.name,
          photoUrl: champ.photoUrl,
          ageCategory: champ.ageCategory,
          sportCategory: champ.sportCategory,
          achievements: champ.achievements,
          socialLinks: champ.socialLinks || { facebook: '', instagram: '' },
        },
      });
    } else {
      setChampionModal({
        open: true,
        form: { name: '', photoUrl: '/logo.jpg', ageCategory: '', sportCategory: '', achievements: '', socialLinks: { facebook: '', instagram: '' } },
      });
    }
  };

  const handleSaveChampion = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!championModal.editId;
    const url = isEdit ? `/api/academy/champions/${championModal.editId}` : '/api/academy/champions';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      setSaving(true);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(championModal.form),
      });

      if (!res.ok) throw new Error('Failed to save champion');

      const savedChamp = await res.json();
      if (isEdit) {
        setChampions(champions.map(c => c._id === championModal.editId ? savedChamp : c));
        showToast(language === 'ar' ? 'تم تعديل البطل بنجاح' : 'Champion updated successfully', 'success');
      } else {
        setChampions([savedChamp, ...champions]);
        showToast(language === 'ar' ? 'تم إضافة البطل بنجاح' : 'Champion created successfully', 'success');
      }
      setChampionModal({ open: false, form: { name: '', photoUrl: '', ageCategory: '', sportCategory: '', achievements: '', socialLinks: { facebook: '', instagram: '' } } });
    } catch (err: any) {
      showToast(err.message || 'Error saving champion', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChampion = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا البطل؟' : 'Are you sure you want to delete this champion?')) return;
    try {
      const res = await fetch(`/api/academy/champions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setChampions(champions.filter(c => c._id !== id));
      showToast(language === 'ar' ? 'تم حذف البطل' : 'Champion deleted successfully', 'success');
    } catch (err) {
      showToast('Error deleting champion', 'error');
    }
  };

  // Testimonial CRUD functions
  const openTestimonialModal = (test?: Testimonial) => {
    if (test) {
      setTestimonialModal({
        open: true,
        editId: test._id,
        form: {
          name: test.name,
          profileImageUrl: test.profileImageUrl,
          reviewText: test.reviewText,
          rating: test.rating,
        },
      });
    } else {
      setTestimonialModal({
        open: true,
        form: { name: '', profileImageUrl: '/logo.jpg', reviewText: '', rating: 5 },
      });
    }
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!testimonialModal.editId;
    const url = isEdit ? `/api/academy/testimonials/${testimonialModal.editId}` : '/api/academy/testimonials';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      setSaving(true);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonialModal.form),
      });

      if (!res.ok) throw new Error('Failed to save testimonial');

      const savedTest = await res.json();
      if (isEdit) {
        setTestimonials(testimonials.map(t => t._id === testimonialModal.editId ? savedTest : t));
        showToast(language === 'ar' ? 'تم تعديل الرأي بنجاح' : 'Testimonial updated successfully', 'success');
      } else {
        setTestimonials([savedTest, ...testimonials]);
        showToast(language === 'ar' ? 'تم إضافة الرأي بنجاح' : 'Testimonial added successfully', 'success');
      }
      setTestimonialModal({ open: false, form: { name: '', profileImageUrl: '', reviewText: '', rating: 5 } });
    } catch (err: any) {
      showToast(err.message || 'Error saving testimonial', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/academy/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setTestimonials(testimonials.filter(t => t._id !== id));
      showToast(language === 'ar' ? 'تم حذف التقييم بنجاح' : 'Testimonial deleted successfully', 'success');
    } catch (err) {
      showToast('Error deleting testimonial', 'error');
    }
  };

  // Gallery functions
  const openGalleryModal = (item?: GalleryItem) => {
    if (item) {
      setGalleryModal({
        open: true,
        editId: item._id,
        form: { imageUrl: item.imageUrl, caption: item.caption },
      });
    } else {
      setGalleryModal({
        open: true,
        form: { imageUrl: '/logo.jpg', caption: '' },
      });
    }
  };

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!galleryModal.editId;
    const url = isEdit ? `/api/academy/gallery/${galleryModal.editId}` : '/api/academy/gallery';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      setSaving(true);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryModal.form),
      });

      if (!res.ok) throw new Error('Failed to save gallery item');

      const savedItem = await res.json();
      if (isEdit) {
        setGallery(gallery.map(g => g._id === galleryModal.editId ? savedItem : g));
        showToast(language === 'ar' ? 'تم تحديث الصورة بنجاح' : 'Gallery item updated successfully', 'success');
      } else {
        setGallery([savedItem, ...gallery]);
        showToast(language === 'ar' ? 'تم إضافة الصورة بنجاح' : 'Gallery item added successfully', 'success');
      }
      setGalleryModal({ open: false, form: { imageUrl: '', caption: '' } });
    } catch (err: any) {
      showToast(err.message || 'Error saving gallery item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الصورة؟' : 'Are you sure you want to delete this image?')) return;
    try {
      const res = await fetch(`/api/academy/gallery/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setGallery(gallery.filter(g => g._id !== id));
      showToast(language === 'ar' ? 'تم حذف الصورة بنجاح' : 'Gallery image removed successfully', 'success');
    } catch (err) {
      showToast('Error deleting image', 'error');
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0E0E0E]">
        <div className="flex flex-col items-center gap-3">
          <span className="h-10 w-10 border-4 border-[#FF9500] border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-sm text-[#828282]">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'hero_about', name: language === 'ar' ? 'الرئيسية ومين نحن' : 'Hero & About Us', icon: Globe },
    { id: 'kickboxing', name: language === 'ar' ? 'قسم الكيك بوكسينج' : 'Kickboxing Section', icon: Award },
    { id: 'why_stats_contact', name: language === 'ar' ? 'المميزات والتواصل' : 'Why Us & Contact', icon: Shield },
    { id: 'champions', name: language === 'ar' ? 'إدارة الأبطال' : 'Our Champions', icon: Trophy },
    { id: 'gallery', name: language === 'ar' ? 'إنجازاتنا' : 'Achievements', icon: ImageIcon },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-mesh-dark">
      <Sidebar />

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Toast Notifications */}
        {toast && (
          <div className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg border animate-float max-w-sm ${
            toast.type === 'success' 
              ? 'bg-[#1C1B1B] border-emerald-500 text-emerald-400' 
              : 'bg-[#1C1B1B] border-red-500 text-red-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider drop-shadow-[0_0_15px_rgba(255,149,0,0.15)]">
              {language === 'ar' ? 'إدارة محتوى الموقع' : 'Website Content Management'}
            </h1>
            <p className="font-mono text-xs md:text-sm text-[#828282] uppercase tracking-widest mt-1">
              {language === 'ar' ? 'إدارة بيانات وتفاصيل الصفحة الرئيسية العامة للأكاديمية' : 'Manage your sports academy public page sections dynamically'}
            </p>
          </div>
        </div>

        {/* Dynamic Tab Switcher */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#2A2A2A] pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-semibold transition-all duration-200 border-b-2 rounded-t-lg ${
                  isActive
                    ? 'border-[#FF9500] text-[#FF9500] bg-[#FF9500]/5 shadow-glow-orange'
                    : 'border-transparent text-[#828282] hover:text-[#F2F2F2] hover:bg-[#1C1B1B]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* ===============================================================
            TAB 1: HERO & ABOUT US
            =============================================================== */}
        {activeTab === 'hero_about' && (
          <form onSubmit={handleSaveContent} className="space-y-8 animate-float">
            {/* Hero Panel */}
            <div className="glass-card-premium rounded-xl border border-[#2A2A2A] p-6 shadow-glow-orange">
              <h2 className="text-lg md:text-xl font-heading font-black text-[#FF9500] border-b border-[#2A2A2A] pb-3 mb-6 uppercase flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#F2C94C]" />
                {language === 'ar' ? 'الواجهة الترحيبية (Hero Section)' : 'Hero Banner Settings'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'اسم الأكاديمية' : 'Academy Name'}</label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'الشعار اللفظي (Slogan)' : 'Slogan'}</label>
                  <input
                    type="text"
                    value={content.hero.subtitle}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    placeholder="مثال: مصنع الأبطال"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <ImageUploadField
                    label={language === 'ar' ? 'صورة / خلفية الواجهة الرئيسية' : 'Hero Background Image'}
                    value={content.hero.mediaUrl}
                    onChange={(val) => setContent({ ...content, hero: { ...content.hero, mediaUrl: val } })}
                    language={language}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <ImageUploadField
                    label={language === 'ar' ? 'شعار الأكاديمية (اللوجو)' : 'Academy Logo'}
                    value={content.logoUrl || ''}
                    onChange={(val) => setContent({ ...content, logoUrl: val })}
                    language={language}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'عنوان زر الدعوة للعمل' : 'CTA Button Text'}</label>
                    <input
                      type="text"
                      value={content.hero.ctaText}
                      onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaText: e.target.value } })}
                      className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'رابط زر الدعوة للعمل' : 'CTA Link Anchor'}</label>
                    <input
                      type="text"
                      value={content.hero.ctaLink}
                      onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaLink: e.target.value } })}
                      className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* About Us Panel */}
            <div className="glass-card-premium rounded-xl border border-[#2A2A2A] p-6 shadow-glow-orange">
              <h2 className="text-lg md:text-xl font-heading font-black text-[#FF9500] border-b border-[#2A2A2A] pb-3 mb-6 uppercase flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#F2C94C]" />
                {language === 'ar' ? 'من نحن (About Us Section)' : 'About Us Section Settings'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <ImageUploadField
                    label={language === 'ar' ? 'صورة قسم من نحن' : 'About Us Image'}
                    value={content.about.imageUrl || ''}
                    onChange={(val) => setContent({ ...content, about: { ...content.about, imageUrl: val } })}
                    language={language}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'طريقة عرض الصورة' : 'Image Fit Style'}</label>
                  <select
                    value={content.about.imageFit || 'contain'}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, imageFit: e.target.value as 'cover' | 'contain' } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                  >
                    <option value="cover">تغطية الإطار بالكامل (Cover)</option>
                    <option value="contain">احتواء داخل الإطار بدون قص (Contain)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'المقدمة التعريفية (مع دعم النصوص الغنية)' : 'Academy Introduction'}</label>
                  <textarea
                    rows={4}
                    value={content.about.introduction}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, introduction: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500] text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'قصة نجاح وتأسيس الأكاديمية' : 'Academy Story'}</label>
                  <textarea
                    rows={4}
                    value={content.about.story}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, story: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500] text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'رؤيتنا' : 'Our Vision'}</label>
                  <textarea
                    rows={3}
                    value={content.about.vision}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, vision: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500] text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'رسالتنا' : 'Our Mission'}</label>
                  <textarea
                    rows={3}
                    value={content.about.mission}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, mission: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500] text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#FF9500] text-black font-extrabold uppercase tracking-wider px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#F2C94C] transition-all disabled:opacity-50 cursor-pointer shadow-glow-orange"
              >
                <Save className="h-5 w-5" />
                <span>{saving ? t('loading') : t('save')}</span>
              </button>
            </div>
          </form>
        )}

        {/* ===============================================================
            TAB 1.5: KICKBOXING & COACH MINA NAGI
            =============================================================== */}
        {activeTab === 'kickboxing' && (
          <form onSubmit={handleSaveContent} className="space-y-6">
            <div className="glass-card-premium rounded-xl border border-[#2A2A2A] p-6 shadow-glow-orange animate-float">
              <h2 className="text-lg md:text-xl font-heading font-black text-[#FF9500] border-b border-[#2A2A2A] pb-3 mb-6 uppercase flex items-center gap-2">
                <Award className="h-5 w-5 text-[#F2C94C]" />
                {language === 'ar' ? 'تفاصيل قسم الكيك بوكسينج والمدرب مينا ناجي' : 'Kickboxing Section & Coach Mina Nagi Details'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'العنوان بالعربية' : 'Title (Arabic)'}</label>
                  <input
                    type="text"
                    value={content.kickboxing?.titleAr || ''}
                    onChange={(e) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '' }), titleAr: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'العنوان بالإنجليزية' : 'Title (English)'}</label>
                  <input
                    type="text"
                    value={content.kickboxing?.titleEn || ''}
                    onChange={(e) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '' }), titleEn: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'اسم المدرب بالعربية' : 'Coach Name (Arabic)'}</label>
                  <input
                    type="text"
                    value={content.kickboxing?.coachNameAr || ''}
                    onChange={(e) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '' }), coachNameAr: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'اسم المدرب بالإنجليزية' : 'Coach Name (English)'}</label>
                  <input
                    type="text"
                    value={content.kickboxing?.coachNameEn || ''}
                    onChange={(e) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '' }), coachNameEn: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'الوصف بالعربية' : 'Description (Arabic)'}</label>
                  <textarea
                    value={content.kickboxing?.descriptionAr || ''}
                    onChange={(e) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '' }), descriptionAr: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500] min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'الوصف بالإنجليزية' : 'Description (English)'}</label>
                  <textarea
                    value={content.kickboxing?.descriptionEn || ''}
                    onChange={(e) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '' }), descriptionEn: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500] min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'نبذة عن المدرب ومدحه بالعربية' : 'Coach Biography & Praise (Arabic)'}</label>
                  <textarea
                    value={content.kickboxing?.coachBioAr || ''}
                    onChange={(e) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '' }), coachBioAr: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500] min-h-[120px]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'نبذة عن المدرب ومدحه بالإنجليزية' : 'Coach Biography & Praise (English)'}</label>
                  <textarea
                    value={content.kickboxing?.coachBioEn || ''}
                    onChange={(e) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '' }), coachBioEn: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500] min-h-[120px]"
                    required
                  />
                </div>

                {/* Images Section: up to 3 images */}
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-[#828282] uppercase mb-3 border-b border-[#2A2A2A] pb-2">{language === 'ar' ? '📷 صور الكيك بوكسينج (حتى 3 صور)' : '📷 Kickboxing Images (up to 3)'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ImageUploadField
                      label={language === 'ar' ? 'الصورة الأولى (المدرب)' : 'Image 1 (Coach)'}
                      value={content.kickboxing?.imageUrl || ''}
                      onChange={(val) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '', imageUrl2: '', imageUrl3: '' }), imageUrl: val } })}
                      language={language}
                    />
                    <ImageUploadField
                      label={language === 'ar' ? 'الصورة الثانية (اختياري)' : 'Image 2 (Optional)'}
                      value={content.kickboxing?.imageUrl2 || ''}
                      onChange={(val) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '', imageUrl2: '', imageUrl3: '' }), imageUrl2: val } })}
                      language={language}
                    />
                    <ImageUploadField
                      label={language === 'ar' ? 'الصورة الثالثة (اختياري)' : 'Image 3 (Optional)'}
                      value={content.kickboxing?.imageUrl3 || ''}
                      onChange={(val) => setContent({ ...content, kickboxing: { ...(content.kickboxing || { titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', coachNameAr: '', coachNameEn: '', coachBioAr: '', coachBioEn: '', imageUrl: '', imageUrl2: '', imageUrl3: '' }), imageUrl3: val } })}
                      language={language}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#FF9500] text-black font-extrabold uppercase tracking-wider px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#F2C94C] transition-all disabled:opacity-50 cursor-pointer shadow-glow-orange"
                >
                  <Save className="h-5 w-5" />
                  <span>{saving ? t('loading') : t('save')}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ===============================================================
            TAB 2: WHY US, STATS & CONTACT
            =============================================================== */}
        {activeTab === 'why_stats_contact' && (
          <form onSubmit={handleSaveContent} className="space-y-8 animate-float">
            {/* Why Choose Us dynamic list */}
            <div className="glass-card-premium rounded-xl border border-[#2A2A2A] p-6 shadow-glow-orange">
              <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-3 mb-6">
                <h2 className="text-lg md:text-xl font-heading font-black text-[#FF9500] uppercase flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#F2C94C]" />
                  {language === 'ar' ? 'لماذا تختارنا (Why Choose Us Cards)' : 'Why Choose Us Strengths'}
                </h2>
                <button
                  type="button"
                  onClick={handleAddWhyChooseUs}
                  className="bg-[#FF9500]/10 border border-[#FF9500] text-[#FF9500] hover:bg-[#FF9500] hover:text-black font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>{language === 'ar' ? 'إضافة بطاقة ميزة' : 'Add Strength'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {content.whyChooseUs.map((item, idx) => (
                  <div key={idx} className="relative p-4 bg-[#0E0E0E] rounded-lg border border-[#2A2A2A] flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveWhyChooseUs(idx)}
                      className="absolute top-2 left-2 md:relative md:top-auto md:left-auto text-red-500 hover:text-red-400 p-2 hover:bg-[#1C1B1B] rounded-full transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'أيقونة البطاقة (Award / Shield / MapPin / Trophy)' : 'Lucide Icon Name'}</label>
                        <select
                          value={item.icon}
                          onChange={(e) => handleWhyChooseUsChange(idx, 'icon', e.target.value)}
                          className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-2.5 text-[#F2F2F2] outline-none"
                        >
                          <option value="Award">Award</option>
                          <option value="Shield">Shield</option>
                          <option value="MapPin">MapPin</option>
                          <option value="Trophy">Trophy</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'عنوان الميزة' : 'Title'}</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleWhyChooseUsChange(idx, 'title', e.target.value)}
                          className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-2.5 text-[#F2F2F2] outline-none"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'وصف الميزة والتفاصيل' : 'Description'}</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleWhyChooseUsChange(idx, 'description', e.target.value)}
                          className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-2.5 text-[#F2F2F2] outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {content.whyChooseUs.length === 0 && (
                  <p className="text-center text-[#828282] text-sm py-4">{language === 'ar' ? 'لا توجد مزايا مضافة حالياً. انقر لإضافة واحدة!' : 'No strengths listed yet. Click button above to create.'}</p>
                )}
              </div>
            </div>



            {/* Contact details */}
            <div className="glass-card-premium rounded-xl border border-[#2A2A2A] p-6 shadow-glow-orange">
              <h2 className="text-lg md:text-xl font-heading font-black text-[#FF9500] border-b border-[#2A2A2A] pb-3 mb-6 uppercase flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#F2C94C]" />
                {language === 'ar' ? 'بيانات التواصل والخريطة' : 'Contact & Google Map Settings'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{language === 'ar' ? 'عنوان الأكاديمية' : 'Physical Address'}</span>
                  </label>
                  <input
                    type="text"
                    value={content.contact.address}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{language === 'ar' ? 'رقم الهاتف' : 'Contact Phone'}</span>
                  </label>
                  <input
                    type="text"
                    value={content.contact.phone}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#828282] uppercase flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{language === 'ar' ? 'البريد الإلكتروني' : 'Contact Email'}</span>
                  </label>
                  <input
                    type="email"
                    value={content.contact.email}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-3">
                  <label className="text-xs font-semibold text-[#828282] uppercase">{language === 'ar' ? 'رابط تضمين خريطة جوجل (Google Maps Embed Src Link)' : 'Google Maps Iframe Embed Source URL'}</label>
                  <input
                    type="text"
                    value={content.contact.googleMapUrl}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, googleMapUrl: e.target.value } })}
                    className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-3 text-[#F2F2F2] outline-none focus:border-[#FF9500] font-mono text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#FF9500] text-black font-extrabold uppercase tracking-wider px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#F2C94C] transition-all disabled:opacity-50 cursor-pointer shadow-glow-orange"
              >
                <Save className="h-5 w-5" />
                <span>{saving ? t('loading') : t('save')}</span>
              </button>
            </div>
          </form>
        )}

        {/* ===============================================================
            TAB 3: OUR CHAMPIONS CRUD
            =============================================================== */}
        {activeTab === 'champions' && (
          <div className="space-y-6 animate-float">
            <div className="flex justify-between items-center bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-4">
              <div>
                <h3 className="font-heading font-black text-[#FF9500] uppercase text-sm tracking-wider">{language === 'ar' ? 'إجمالي الأبطال المسجلين في الواجهة' : 'All Showcase Champions'}</h3>
                <span className="font-mono text-xs text-[#828282]">{champions.length} {language === 'ar' ? 'بطل معروض' : 'champions listed'}</span>
              </div>
              <button
                onClick={() => openChampionModal()}
                className="bg-[#FF9500] text-black font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-2 hover:bg-[#F2C94C] transition-all shadow-glow-orange cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{language === 'ar' ? 'إضافة بطل جديد' : 'Add Champion'}</span>
              </button>
            </div>

            {/* Champions Table */}
            <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#0E0E0E] text-[#828282] text-xs font-mono uppercase border-b border-[#2A2A2A]">
                      <th className="p-4">{language === 'ar' ? 'البطل' : 'Champion'}</th>
                      <th className="p-4 text-center">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2A] text-sm text-[#F2F2F2]">
                    {champions.map((champ) => (
                      <tr key={champ._id} className="hover:bg-[#252424]/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full border border-[#FF9500] overflow-hidden flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={champ.photoUrl} alt={champ.name} className="h-full w-full object-cover" />
                            </div>
                            <span className="font-bold">{champ.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openChampionModal(champ)}
                              className="text-[#F2C94C] hover:bg-[#F2C94C]/10 p-2 rounded-lg transition-all"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteChampion(champ._id!)}
                              className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {champions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#828282] font-mono text-sm">
                          {language === 'ar' ? 'لم يتم إضافة أبطال بعد' : 'No champions added to show yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===============================================================
            TAB 4: TESTIMONIALS CRUD
            =============================================================== */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6 animate-float">
            <div className="flex justify-between items-center bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-4">
              <div>
                <h3 className="font-heading font-black text-[#FF9500] uppercase text-sm tracking-wider">{language === 'ar' ? 'آراء وتقييمات أولياء الأمور والطلاب' : 'Reviews & Testimonials'}</h3>
                <span className="font-mono text-xs text-[#828282]">{testimonials.length} {language === 'ar' ? 'تقييم معروض' : 'testimonials listed'}</span>
              </div>
              <button
                onClick={() => openTestimonialModal()}
                className="bg-[#FF9500] text-black font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-2 hover:bg-[#F2C94C] transition-all shadow-glow-orange cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{language === 'ar' ? 'إضافة تقييم جديد' : 'Add Testimonial'}</span>
              </button>
            </div>

            {/* Testimonials grid list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((test) => (
                <div key={test._id} className="glass-card-premium rounded-xl border border-[#2A2A2A] p-5 flex flex-col justify-between hover:border-[#FF9500] transition-all duration-300">
                  <div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-4 text-[#F2C94C]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < test.rating ? 'fill-[#F2C94C]' : 'opacity-20'}`} />
                      ))}
                    </div>
                    {/* Text */}
                    <p className="text-sm text-[#F2F2F2] italic leading-relaxed mb-6">"{test.reviewText}"</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#2A2A2A] pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full border border-custom overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={test.profileImageUrl} alt={test.name} className="h-full w-full object-cover" />
                      </div>
                      <span className="font-bold text-xs text-[#FF9500]">{test.name}</span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openTestimonialModal(test)}
                        className="text-[#F2C94C] hover:bg-[#F2C94C]/10 p-2 rounded-lg transition-all"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(test._id!)}
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {testimonials.length === 0 && (
                <div className="md:col-span-3 bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-12 text-center text-[#828282] font-mono text-sm">
                  {language === 'ar' ? 'لا توجد تقييمات مضافة حالياً' : 'No testimonials have been written yet.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===============================================================
            TAB 5: GALLERY IMAGES
            =============================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-float">
            <div className="flex justify-between items-center bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-4">
              <div>
                <h3 className="font-heading font-black text-[#FF9500] uppercase text-sm tracking-wider">{language === 'ar' ? 'إنجازات وبطولات الأكاديمية' : 'Academy Achievements'}</h3>
                <span className="font-mono text-xs text-[#828282]">{gallery.length} {language === 'ar' ? 'صورة مرفوعة' : 'images uploaded'}</span>
              </div>
              <button
                onClick={() => openGalleryModal()}
                className="bg-[#FF9500] text-black font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-2 hover:bg-[#F2C94C] transition-all shadow-glow-orange cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{language === 'ar' ? 'إضافة صورة جديدة' : 'Add Image'}</span>
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {gallery.map((item) => (
                <div key={item._id} className="group relative aspect-square bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#FF9500] transition-all duration-300 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.caption} className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Bottom overlay with text & delete */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs text-[#F2F2F2] font-semibold mb-3 leading-snug">{item.caption}</p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openGalleryModal(item)}
                        className="bg-[#1C1B1B]/95 text-[#F2C94C] border border-[#2A2A2A] hover:bg-[#F2C94C] hover:text-black hover:border-transparent p-2 rounded-lg transition-all"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGalleryItem(item._id!)}
                        className="bg-red-950/90 text-red-400 border border-red-900/50 hover:bg-red-600 hover:text-white hover:border-transparent p-2 rounded-lg transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {gallery.length === 0 && (
                <div className="col-span-2 md:col-span-4 bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-12 text-center text-[#828282] font-mono text-sm">
                  {language === 'ar' ? 'لا توجد صور في المعرض حالياً' : 'Photo gallery is currently empty.'}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ===============================================================
          MODAL: CHAMPION ADD/EDIT
          =============================================================== */}
      {championModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-float">
            <div className="bg-[#0E0E0E] p-4 border-b border-[#2A2A2A] flex justify-between items-center">
              <h3 className="font-heading font-black text-[#FF9500] uppercase text-sm">
                {championModal.editId ? (language === 'ar' ? 'تعديل بيانات البطل' : 'Edit Champion Profile') : (language === 'ar' ? 'إضافة بطل جديد للأكاديمية' : 'Add New Champion Showcase')}
              </h3>
              <button
                onClick={() => setChampionModal({ ...championModal, open: false })}
                className="text-[#828282] hover:text-[#F2F2F2]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveChampion} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'الاسم الكامل للبطل' : 'Full Name'}</label>
                  <input
                    type="text"
                    value={championModal.form.name}
                    onChange={(e) => setChampionModal({ ...championModal, form: { ...championModal.form, name: e.target.value } })}
                    className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <ImageUploadField
                    label={language === 'ar' ? 'الصورة الشخصية للبطل' : 'Champion Image'}
                    value={championModal.form.photoUrl || ''}
                    onChange={(val) => setChampionModal({ ...championModal, form: { ...championModal.form, photoUrl: val } })}
                    language={language}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'رابط فيسبوك (اختياري)' : 'Facebook Profile URL'}</label>
                  <input
                    type="text"
                    value={championModal.form.socialLinks?.facebook || ''}
                    onChange={(e) => setChampionModal({
                      ...championModal,
                      form: {
                        ...championModal.form,
                        socialLinks: { ...championModal.form.socialLinks, facebook: e.target.value }
                      }
                    })}
                    className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'رابط إنستغرام (اختياري)' : 'Instagram Profile URL'}</label>
                  <input
                    type="text"
                    value={championModal.form.socialLinks?.instagram || ''}
                    onChange={(e) => setChampionModal({
                      ...championModal,
                      form: {
                        ...championModal.form,
                        socialLinks: { ...championModal.form.socialLinks, instagram: e.target.value }
                      }
                    })}
                    className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setChampionModal({ ...championModal, open: false })}
                  className="px-4 py-2 border border-[#2A2A2A] rounded-lg text-sm text-[#828282] hover:text-[#F2F2F2] cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#FF9500] text-black font-semibold rounded-lg text-sm hover:bg-[#F2C94C] cursor-pointer"
                >
                  {saving ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===============================================================
          MODAL: TESTIMONIAL ADD/EDIT
          =============================================================== */}
      {testimonialModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-float">
            <div className="bg-[#0E0E0E] p-4 border-b border-[#2A2A2A] flex justify-between items-center">
              <h3 className="font-heading font-black text-[#FF9500] uppercase text-sm">
                {testimonialModal.editId ? (language === 'ar' ? 'تعديل التقييم' : 'Edit Testimonial') : (language === 'ar' ? 'إضافة تقييم جديد' : 'Add New Testimonial')}
              </h3>
              <button
                onClick={() => setTestimonialModal({ ...testimonialModal, open: false })}
                className="text-[#828282] hover:text-[#F2F2F2]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'اسم كاتب التقييم (ولي الأمر / الطالب)' : 'Reviewer Name'}</label>
                <input
                  type="text"
                  value={testimonialModal.form.name}
                  onChange={(e) => setTestimonialModal({ ...testimonialModal, form: { ...testimonialModal.form, name: e.target.value } })}
                  className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <ImageUploadField
                  label={language === 'ar' ? 'صورة كاتب التقييم' : 'Reviewer Photo'}
                  value={testimonialModal.form.profileImageUrl}
                  onChange={(val) => setTestimonialModal({ ...testimonialModal, form: { ...testimonialModal.form, profileImageUrl: val } })}
                  language={language}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'التقييم بالنجوم' : 'Star Rating'}</label>
                <select
                  value={testimonialModal.form.rating}
                  onChange={(e) => setTestimonialModal({ ...testimonialModal, form: { ...testimonialModal.form, rating: Number(e.target.value) } })}
                  className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-[#F2F2F2] outline-none"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                  <option value="2">⭐⭐ (2/5)</option>
                  <option value="1">⭐ (1/5)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'نص مراجعة التقييم والتعليق' : 'Review Text'}</label>
                <textarea
                  rows={4}
                  value={testimonialModal.form.reviewText}
                  onChange={(e) => setTestimonialModal({ ...testimonialModal, form: { ...testimonialModal.form, reviewText: e.target.value } })}
                  className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-[#F2F2F2] outline-none focus:border-[#FF9500] text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setTestimonialModal({ ...testimonialModal, open: false })}
                  className="px-4 py-2 border border-[#2A2A2A] rounded-lg text-sm text-[#828282] hover:text-[#F2F2F2] cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#FF9500] text-black font-semibold rounded-lg text-sm hover:bg-[#F2C94C] cursor-pointer"
                >
                  {saving ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===============================================================
          MODAL: GALLERY IMAGE ADD/EDIT
          =============================================================== */}
      {galleryModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-float">
            <div className="bg-[#0E0E0E] p-4 border-b border-[#2A2A2A] flex justify-between items-center">
              <h3 className="font-heading font-black text-[#FF9500] uppercase text-sm">
                {galleryModal.editId ? (language === 'ar' ? 'تعديل الصورة' : 'Edit Image Info') : (language === 'ar' ? 'إضافة صورة لمعرض الأكاديمية' : 'Add New Photo')}
              </h3>
              <button
                onClick={() => setGalleryModal({ ...galleryModal, open: false })}
                className="text-[#828282] hover:text-[#F2F2F2]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <ImageUploadField
                  label={language === 'ar' ? 'صورة المعرض' : 'Gallery Image'}
                  value={galleryModal.form.imageUrl}
                  onChange={(val) => setGalleryModal({ ...galleryModal, form: { ...galleryModal.form, imageUrl: val } })}
                  language={language}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'عنوان الصورة أو الوصف القصير' : 'Image Caption'}</label>
                <input
                  type="text"
                  value={galleryModal.form.caption || ''}
                  onChange={(e) => setGalleryModal({ ...galleryModal, form: { ...galleryModal.form, caption: e.target.value } })}
                  className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setGalleryModal({ ...galleryModal, open: false })}
                  className="px-4 py-2 border border-[#2A2A2A] rounded-lg text-sm text-[#828282] hover:text-[#F2F2F2] cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#FF9500] text-black font-semibold rounded-lg text-sm hover:bg-[#F2C94C] cursor-pointer"
                >
                  {saving ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
