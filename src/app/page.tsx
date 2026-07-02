'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useLanguage } from '@/components/LanguageContext';
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
  Lock,
  ChevronRight,
  ChevronLeft,
  X,
  Shield,
  Clock,
  Compass,
  ArrowRightLeft,
  Menu,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  LogOut,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface Champion {
  _id: string;
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
  _id: string;
  name: string;
  profileImageUrl: string;
  reviewText: string;
  rating: number;
}

interface GalleryItem {
  _id: string;
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

interface DocumentItem {
  name: string;
  url: string;
}

interface AcademyContent {
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
    imageFit?: string;
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

function HomeContent() {
  const { t, isRtl, language, setLanguage } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic Theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Loading & State
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<AcademyContent | null>(null);

  // Safe content with defaults to prevent undefined crashes
  const safeContent: AcademyContent = content ?? {
    hero: { title: 'أكاديمية الأبطال', subtitle: 'مصنع الأبطال', ctaText: 'انضم إلينا', ctaLink: '#contact', mediaUrl: '/logo.jpg' },
    about: { introduction: '', vision: '', mission: '', story: '', imageUrl: '/ابطالنا/احمد سالم.jpeg', imageFit: 'contain' },
    whyChooseUs: [],
    statistics: { championsCount: 0, tournamentsCount: 0, yearsOfExperience: 0, traineesCount: 0 },
    contact: { address: '', phone: '01555888842', email: '', googleMapUrl: '' },
  };
  const [champions, setChampions] = useState<Champion[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  // Gallery Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Mobile Nav Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', phone: '', sportType: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Initialize theme & check login
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAdminLoggedIn(true);
            setAdminName(data.username);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    checkAuth();

    // Trigger login modal if query param is set
    if (searchParams.get('login') === 'true') {
      setIsLoginModalOpen(true);
    }
  }, [searchParams]);

  // Fetch Public Content
  useEffect(() => {
    async function fetchPublicData() {
      try {
        setLoading(true);
        // Singleton content
        const contentRes = await fetch('/api/academy/content', { cache: 'no-store' });
        const defaultContent = {
          hero: { title: 'أكاديمية الأبطال', subtitle: 'مصنع الأبطال', ctaText: 'انضم إلينا', ctaLink: '#contact', mediaUrl: '/logo.jpg' },
          about: { introduction: '', vision: '', mission: '', story: '', imageUrl: '/ابطالنا/احمد سالم.jpeg', imageFit: 'contain' },
          whyChooseUs: [],
          statistics: { championsCount: 0, tournamentsCount: 0, yearsOfExperience: 0, traineesCount: 0 },
          contact: { address: '', phone: '01555888842', email: '', googleMapUrl: '' },
        };
        if (contentRes.ok) {
          const raw = await contentRes.json();
          // Merge with defaults in case DB doc is missing nested fields
          setContent({
            hero: raw.hero ?? defaultContent.hero,
            about: raw.about ?? defaultContent.about,
            whyChooseUs: raw.whyChooseUs ?? defaultContent.whyChooseUs,
            statistics: raw.statistics ?? defaultContent.statistics,
            contact: raw.contact ?? defaultContent.contact,
            kickboxing: raw.kickboxing ?? undefined,
          });
        } else {
          setContent(defaultContent);
        }


        // Champions - fetch from new DB route
        const championsRes = await fetch('/api/champions', { cache: 'no-store' });
        if (championsRes.ok) {
          setChampions(await championsRes.json());
        }

        // Testimonials
        const testimonialsRes = await fetch('/api/academy/testimonials', { cache: 'no-store' });
        if (testimonialsRes.ok) {
          setTestimonials(await testimonialsRes.json());
        }

        // Gallery - fetch from new DB route
        const galleryRes = await fetch('/api/gallery', { cache: 'no-store' });
        if (galleryRes.ok) {
          const dbGallery = await galleryRes.json();
          if (dbGallery.length > 0) {
            setGallery(dbGallery);
          }
        }

        // Coaches (GET is now public!)
        const coachesRes = await fetch('/api/coaches', { cache: 'no-store' });
        if (coachesRes.ok) {
          setCoaches(await coachesRes.json());
        }

        // Documents
        const docsRes = await fetch('/api/documents', { cache: 'no-store' });
        if (docsRes.ok) {
          setDocuments(await docsRes.json());
        }
      } catch (err) {
        console.error('Error fetching public landing page data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicData();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAuthenticating(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || t('loginError'));
      } else {
        setIsAdminLoggedIn(true);
        setAdminName(data.username);
        setIsLoginModalOpen(false);
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setLoginError(language === 'ar' ? 'فشل الاتصال بالخادم' : 'Failed to connect to authentication server');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setIsAdminLoggedIn(false);
        setAdminName('');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    const targetPhone = safeContent.contact.phone || '01555888842';
    let formattedPhone = targetPhone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '2' + formattedPhone;
    }

    const messageText = language === 'ar'
      ? `السلام عليكم ورحمة الله وبركاته،\nأود الاستفسار عن تفاصيل الأكاديمية:\n\n*الاسم بالكامل:* ${contactForm.name}\n*رقم الهاتف:* ${contactForm.phone}\n*نوع الرياضة المهتم بها:* ${contactForm.sportType || 'غير محدد'}\n*الموضوع:* ${contactForm.subject}\n*تفاصيل الاستفسار:* ${contactForm.message}`
      : `Hello, I'd like to inquire about the academy:\n\n*Full Name:* ${contactForm.name}\n*Phone:* ${contactForm.phone}\n*Sport Type:* ${contactForm.sportType || 'Not specified'}\n*Subject:* ${contactForm.subject}\n*Details:* ${contactForm.message}`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(messageText)}`;

    setTimeout(() => {
      setFormSubmitting(false);
      setFormSubmitted(true);
      setContactForm({ name: '', phone: '', sportType: '', subject: '', message: '' });
      
      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank');
      }
      
      setTimeout(() => setFormSubmitted(false), 5000);
    }, 1200);
  };

  const handleLightboxNav = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    if (direction === 'prev') {
      setLightboxIndex(lightboxIndex === 0 ? gallery.length - 1 : lightboxIndex - 1);
    } else {
      setLightboxIndex(lightboxIndex === gallery.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  // Helper icon mapping
  const getStrengthIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award':
        return <Award className="h-8 w-8 text-[#FF9500]" />;
      case 'Shield':
        return <Shield className="h-8 w-8 text-[#FF9500]" />;
      case 'MapPin':
        return <MapPin className="h-8 w-8 text-[#FF9500]" />;
      case 'Trophy':
        return <Trophy className="h-8 w-8 text-[#FF9500]" />;
      default:
        return <Award className="h-8 w-8 text-[#FF9500]" />;
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

  const navLinks = [
    { name: language === 'ar' ? 'الرئيسية' : 'Home', href: '#home' },
    { name: language === 'ar' ? 'من نحن' : 'About Us', href: '#about' },
    { name: language === 'ar' ? 'الرياضات' : 'Sports', href: '#sports' },
    { name: language === 'ar' ? 'المميزات' : 'Why Us', href: '#why-us' },
    { name: language === 'ar' ? 'أبطالنا' : 'Champions', href: '#champions' },
    { name: language === 'ar' ? 'المعرض' : 'Gallery', href: '#gallery' },
    { name: language === 'ar' ? 'تواصل معنا' : 'Contact', href: '#contact' },
  ];

  return (
    <div className="bg-mesh-dark min-h-screen text-[#F2F2F2] selection:bg-[#FF9500] selection:text-black scroll-smooth">
      
      {/* ===============================================================
          STICKY NAVIGATION BAR
          =============================================================== */}
      <header className="sticky top-0 z-40 bg-[#1C1B1B]/90 backdrop-blur-md border-b border-[#2A2A2A]/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link href="#home" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-lg border border-[#FF9500] overflow-hidden shadow-glow-orange group-hover:scale-105 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Champions Academy Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="font-heading font-black text-sm md:text-base tracking-wider text-[#FF9500] leading-none">
                Champions Academy
              </h1>
              <span className="font-mono text-[9px] text-[#828282] uppercase tracking-widest block mt-0.5">
                {safeContent.hero.subtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-bold uppercase tracking-wider text-[#F2F2F2] hover:text-[#FF9500] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons (Language, Theme, Admin Lock) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Lang toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded border border-[#2A2A2A] hover:border-[#FF9500] hover:text-[#FF9500] transition-all cursor-pointer"
            >
              {language === 'ar' ? 'EN' : 'العربية'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded border border-[#2A2A2A] hover:border-[#FF9500] text-sm cursor-pointer"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Admin Access Panel Lock */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="bg-[#FF9500] p-2 rounded-lg text-black hover:bg-[#F2C94C] transition-all shadow-glow-orange flex items-center justify-center cursor-pointer"
                  title={language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                >
                  <Lock className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 border border-red-900/50 hover:bg-red-950/20 text-red-400 rounded-lg transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="p-2.5 rounded-lg border border-[#2A2A2A] hover:border-[#FF9500] text-[#FF9500] hover:bg-[#FF9500]/5 transition-all shadow-glow-orange flex items-center justify-center cursor-pointer"
                title={language === 'ar' ? 'دخول المشرف' : 'Admin Login'}
              >
                <Lock className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="text-[10px] font-bold px-2 py-1 rounded border border-[#2A2A2A]"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[#F2F2F2] hover:text-[#FF9500] transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className={`relative flex flex-col w-64 max-w-xs bg-[#1C1B1B] h-full p-6 border-custom ${
            isRtl ? 'mr-auto border-r' : 'ml-auto border-l'
          }`}>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 left-4 text-[#828282] hover:text-[#F2F2F2]"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mt-8 flex items-center gap-3 border-b border-[#2A2A2A] pb-4 mb-6">
              <div className="h-9 w-9 overflow-hidden rounded-md border border-[#FF9500]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-heading font-black text-[#FF9500] text-sm uppercase">Champions Academy</span>
            </div>

            <nav className="flex flex-col gap-4 flex-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-semibold uppercase tracking-wider text-[#828282] hover:text-[#FF9500]"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="border-t border-[#2A2A2A] pt-4 space-y-4">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 text-xs font-semibold text-[#828282]"
              >
                <span>{theme === 'dark' ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي'}</span>
              </button>

              {isAdminLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center bg-[#FF9500] text-black font-extrabold py-2.5 rounded-lg text-xs"
                  >
                    لوحة التحكم
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center border border-red-900 text-red-400 py-2 rounded-lg text-xs"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center border border-[#2A2A2A] text-[#FF9500] py-2.5 rounded-lg text-xs flex items-center justify-center gap-2"
                >
                  <Lock className="h-3 w-3" />
                  <span>دخول الإدارة</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===============================================================
          SECTION 1: HERO SECTION
          =============================================================== */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-12">
        {/* Decorative Grid Mesh Background */}
        <div className="absolute inset-0 bg-mesh-dark opacity-40 z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="space-y-6 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9500]/10 border border-[#FF9500]/30 text-[#FF9500] font-mono text-[10px] md:text-xs uppercase tracking-widest animate-pulse">
              <Trophy className="h-3.5 w-3.5" />
              <span>{language === 'ar' ? 'بوابة التدريب الاحترافي للكاراتيه' : 'Professional Karate Training Gateway'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black uppercase leading-tight tracking-wider">
              {safeContent.hero.title}
            </h1>

            {/* Slogan */}
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-gradient-premium tracking-wider animate-float drop-shadow-[0_0_15px_rgba(255,149,0,0.2)]">
              "{safeContent.hero.subtitle}"
            </h2>

            <p className="text-sm md:text-base text-[#F2F2F2] max-w-xl mx-auto lg:mx-0 leading-relaxed font-body">
              {safeContent.about.introduction}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href={safeContent.hero.ctaLink}
                className="bg-[#FF9500] text-black font-extrabold uppercase tracking-wider px-8 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#F2C94C] hover:scale-[1.02] transition-all shadow-glow-orange cursor-pointer"
              >
                <span>{safeContent.hero.ctaText}</span>
                <ChevronRight className={`h-5 w-5 ${isRtl ? 'rotate-180' : ''}`} />
              </a>
              <a
                href="#about"
                className="border border-[#2A2A2A] text-[#F2F2F2] hover:border-[#FF9500] hover:bg-[#FF9500]/5 font-extrabold uppercase tracking-wider px-8 py-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{language === 'ar' ? 'تعرف علينا' : 'Discover Us'}</span>
              </a>
            </div>
          </div>

          {/* Hero Right: Founder Highlight Profile */}
          <div className="relative w-full rounded-3xl border border-[#2A2A2A] bg-black/60 backdrop-blur-xl overflow-hidden p-6 shadow-glow-orange max-w-xl mx-auto">
            
            {/* Header Badge */}
            <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-10 bg-[#FF9500] text-black font-extrabold text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg`}>
              {language === 'ar' ? 'مؤسس ورئيس الأكاديمية' : 'Founder & Director'}
            </div>

            <div className={`flex flex-col ${isRtl ? 'sm:flex-row' : 'sm:flex-row-reverse'} gap-6 items-center`}>
              {/* Profile Image with Ring */}
              <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-2xl border-2 border-[#FF9500] overflow-hidden shadow-glow-orange-lg flex-shrink-0 hover:scale-105 transition-transform duration-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={safeContent.hero.mediaUrl || '/founder.jpg'}
                  alt="Captain Ahmed Salem Gamal"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Name & Primary Titles */}
              <div className={`text-center ${isRtl ? 'sm:text-right' : 'sm:text-left'} space-y-2`}>
                <h3 className="text-xl sm:text-2xl font-heading font-black text-gradient-premium tracking-wide">
                  {language === 'ar' ? 'كابتن / أحمد سالم جمال' : 'Capt. Ahmed Salem Gamal'}
                </h3>
                <p className="text-xs font-semibold text-[#FF9500] font-mono">
                  {language === 'ar' ? 'عضو مجلس اللجان والمدير العام للأكاديمية' : 'Technical Committee Member & General Director'}
                </p>
                <p className="text-[11px] text-[#F2F2F2] leading-relaxed font-body">
                  {language === 'ar' 
                    ? 'صانع الأبطال ورائد الفكر التدريبي والتربوي الحديث في رياضة الكاراتيه، قاد الأكاديمية لبناء أجيال من أبطال الجمهورية والمنتخب الوطني.'
                    : 'The championship maker and leader of modern training and educational thought in Karate, who led the academy to build generations of national champions.'
                  }
                </p>
              </div>
            </div>

            {/* List of Titles / Achievements */}
            <div className={`mt-6 pt-5 border-t border-[#2A2A2A]/80 grid grid-cols-1 gap-2 text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
              {[
                { ar: 'عضو اللجنة الفنية لمنطقة الاسكندرية للكاراتية', en: 'Technical Committee Member of Alexandria Karate Region' },
                { ar: 'عضو لجنة المدربين بالاتحاد المصري الكاراتية', en: 'Coaches Committee Member of the Egyptian Karate Federation' },
                { ar: 'مدير فني مركز شباب السيوف 2', en: 'Technical Director of Al-Siyouf 2 Youth Center' },
                { ar: 'مدير فني كلية تربية رياضية بنات - بفلمنج', en: 'Technical Director at the Faculty of Physical Education for Girls (Fleming)' },
                { ar: 'مدير فني نادي قتة السكندري', en: 'Technical Director of Qattah Alexandrian Club' },
                { ar: 'مدير عام اكاديميات The Champions Academy', en: 'General Director of The Champions Academy' },
              ].map((item, idx) => (
                <div key={idx} className={`flex items-start gap-2.5 bg-[#1C1B1B]/40 p-2.5 rounded-lg border border-[#2A2A2A]/50 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="h-4 w-4 rounded-full bg-[#FF9500]/10 border border-[#FF9500]/30 text-[#FF9500] flex items-center justify-center font-mono text-[9px] font-bold mt-0.5">
                    ✓
                  </div>
                  <span className="text-[#F2F2F2] font-semibold leading-relaxed flex-1">
                    {language === 'ar' ? item.ar : item.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===============================================================
          SECTION 2: ABOUT US SECTION
          =============================================================== */}
      <section id="about" className="py-24 bg-[#1C1B1B]/40 border-t border-b border-[#2A2A2A]/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#FF9500] font-mono text-xs uppercase tracking-widest">{language === 'ar' ? 'مسيرة تميز ونجاح' : 'Success Story'}</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider pb-2 leading-relaxed">{language === 'ar' ? 'من نحن - قصة مصنع الأبطال' : 'About Us & Our History'}</h2>
            <p className="text-sm text-[#F2F2F2]">{language === 'ar' ? 'تعرف على تاريخ الأكاديمية ورؤيتنا الرياضية الشاملة' : 'Learn about our deep sports vision and karate training ethics'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Image Beside Content */}
            <div className="relative aspect-[4/3] w-full rounded-2xl border border-[#2A2A2A] overflow-hidden shadow-glow-orange max-w-lg mx-auto order-last lg:order-first">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={safeContent.about.imageUrl} alt="About Champions Academy" className={`h-full w-full ${safeContent.about.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
            </div>

            {/* Rich Content Panel */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-heading font-black text-[#FF9500] mb-3 uppercase">{language === 'ar' ? 'بناء جيل رياضي متميز' : 'Shaping a Dynamic Generation'}</h3>
                <p className="text-sm md:text-base text-[#F2F2F2] leading-relaxed font-body whitespace-pre-line pb-4">
                  {language === 'ar' ? 'تأسست أكاديمية الأبطال في عام 2009، ومنذ ذلك الحين ونحن نحافظ على ثبات المستوى وارتفاع معدل الإنجازات عاماً بعد عام. مسيرتنا تتحدث عن نفسها من خلال أجيال من الأبطال الذين رفعوا اسم الأكاديمية عالياً في شتى المحافل.\n\n' : 'Founded in 2009, Champions Academy has maintained a consistent level of excellence and rising achievements year after year. Our journey speaks for itself through generations of champions who have raised our name high.\n\n'}
                  {safeContent.about.story}
                </p>
              </div>

              {/* Vision and Mission Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#2A2A2A]">
                <div className="p-5 bg-[#0E0E0E] rounded-xl border border-[#2A2A2A] space-y-2 underlit-card-orange">
                  <Compass className="h-6 w-6 text-[#FF9500]" />
                  <h4 className="font-heading font-black text-sm text-[#F2F2F2] uppercase">{language === 'ar' ? 'رؤيتنا' : 'Our Vision'}</h4>
                  <p className="text-xs text-[#828282] leading-relaxed">{safeContent.about.vision}</p>
                </div>

                <div className="p-5 bg-[#0E0E0E] rounded-xl border border-[#2A2A2A] space-y-2 underlit-card-red">
                  <Shield className="h-6 w-6 text-[#D90000]" />
                  <h4 className="font-heading font-black text-sm text-[#F2F2F2] uppercase">{language === 'ar' ? 'رسالتنا' : 'Our Mission'}</h4>
                  <p className="text-xs text-[#828282] leading-relaxed">{safeContent.about.mission}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===============================================================
          SECTION 3: WHY CHOOSE US
          =============================================================== */}
      <section id="why-us" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-dark opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-5">
            <h2 className="text-4xl sm:text-5xl font-heading font-black uppercase text-gradient-premium tracking-wider pb-2 leading-relaxed">{language === 'ar' ? 'لماذا يفضلنا الجميع؟' : 'Why Choose Champions Academy?'}</h2>
            <p className="text-base text-[#F2F2F2] leading-relaxed">{language === 'ar' ? 'منذ تأسيسنا عام 2009، نصنع الأبطال ونبني الأجيال بفلسفة رياضية فريدة تجمع بين الانضباط العسكري والعلم الحديث' : 'Since our founding in 2009, we build champions with a unique philosophy combining military discipline and modern sports science'}</p>
          </div>

          {/* 6 Big Achievement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                titleAr: 'مدربون معتمدون دولياً',
                titleEn: 'Internationally Certified Coaches',
                descAr: 'جميع مدربينا حاصلون على اعتمادات رسمية من الاتحادَين المصري والدولي للكاراتيه، وكثيرون منهم أبطال جمهورية سابقون يحملون حزام أسود دان 3 فأعلى — هذا هو سر التميز الذي لا يجاريه أحد.',
                titleEnFull: 'Our coaches hold official certifications from the Egyptian & International Karate Federations. Many are former national champions with Black Belt Dan 3+ — the secret behind our unmatched excellence.',
                icon: '🏅',
                color: '#FF9500',
              },
              {
                titleAr: 'منهج تدريبي علمي متكامل',
                titleEn: 'Integrated Scientific Training System',
                descAr: 'لا عشوائية في تدريباتنا — كل حصة مبنية على منهج علمي دقيق يراعي عمر اللاعب ومستواه وأهدافه الشخصية، مع متابعة دورية لقياس التقدم وضمان التطور المستمر.',
                titleEnFull: 'No randomness in our training — every session is built on a precise scientific curriculum tailored to the player\'s age, level, and personal goals with periodic progress tracking.',
                icon: '📋',
                color: '#F2C94C',
              },
              {
                titleAr: 'سجل إنجازات يتكلم عن نفسه',
                titleEn: 'Track Record That Speaks for Itself',
                descAr: 'أكثر من 15 عاماً من الفوز ببطولات محلية وإقليمية متواصلة. لاعبونا موجودون في المنتخبات الوطنية وعلى منصات التتويج في أكبر بطولات الجمهورية.',
                titleEnFull: 'Over 15 years of consecutive wins in local and regional championships. Our players compete in national teams and champion podiums in Egypt\'s biggest tournaments.',
                icon: '🏆',
                color: '#D90000',
              },
              {
                titleAr: 'بيئة آمنة وإيجابية 100%',
                titleEn: '100% Safe & Positive Environment',
                descAr: 'نؤمن أن الرياضة تبني الشخصية قبل الجسد. لذلك نحرص على توفير بيئة تدريبية آمنة وداعمة ومحفزة للأطفال والشباب، بعيداً تماماً عن أي شكل من أشكال الضغط النفسي السلبي.',
                titleEnFull: 'We believe sport builds character before body. We provide a safe, supportive and motivating training environment for youth — free from any form of negative pressure.',
                icon: '🛡️',
                color: '#FF9500',
              },
              {
                titleAr: 'برامج مصممة لكل المستويات',
                titleEn: 'Programs for All Levels',
                descAr: 'سواء كنت مبتدئاً في أولى خطواتك أو بطلاً تسعى لمزيد من الإنجاز — لدينا البرنامج المناسب لك. نستقبل اللاعبين من سن 4 سنوات وحتى ما فوق الـ 40!',
                titleEnFull: 'Whether you\'re a beginner in your first steps or a champion seeking more — we have the right program. We accept players from age 4 to 40+!',
                icon: '🎯',
                color: '#F2C94C',
              },
              {
                titleAr: 'انتماء حقيقي ومجتمع رياضي',
                titleEn: 'Real Belonging & Sports Community',
                descAr: 'نحن لسنا مجرد أكاديمية — نحن عائلة رياضية متماسكة. نحتفل بإنجازات بعضنا ونتحمل مسؤولية تطور كل لاعب كأنه من أهلنا، لأن النجاح الحقيقي يُصنع بالجماعة.',
                titleEnFull: 'We are not just an academy — we are a cohesive sports family. We celebrate each other\'s achievements and take responsibility for every player\'s growth because true success is built together.',
                icon: '🤝',
                color: '#D90000',
              },
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-[#1C1B1B] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#FF9500] hover:scale-[1.01] transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF9500]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{item.icon}</span>
                    <div>
                      <h3 className="font-heading font-black text-lg text-[#F2F2F2] leading-tight">
                        {language === 'ar' ? item.titleAr : item.titleEn}
                      </h3>
                      <div className="h-0.5 w-12 mt-1 rounded-full" style={{ backgroundColor: item.color }} />
                    </div>
                  </div>
                  <p className="text-sm text-[#828282] leading-relaxed font-body">
                    {language === 'ar' ? item.descAr : item.titleEnFull}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* DB-loaded Why Choose Us Cards */}
          {safeContent.whyChooseUs && safeContent.whyChooseUs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {safeContent.whyChooseUs.map((strength, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-[#1C1B1B] rounded-xl border border-[#2A2A2A] space-y-4 glow-interactive hover:scale-102 hover:border-[#FF9500] transition-all duration-300"
                >
                  <div className="h-14 w-14 rounded-lg bg-[#FF9500]/5 flex items-center justify-center border border-[#FF9500]/10 shadow-inner">
                    {getStrengthIcon(strength.icon)}
                  </div>
                  <h3 className="font-heading font-black text-base text-[#F2F2F2] uppercase">{strength.title}</h3>
                  <p className="text-sm text-[#F2F2F2] leading-relaxed">{strength.description}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ===============================================================
          SECTION: SPORTS & DISCIPLINES SECTION
          =============================================================== */}
      <section id="sports" className="py-24 bg-[#1C1B1B]/40 border-t border-b border-[#2A2A2A]/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl sm:text-5xl font-heading font-black uppercase text-gradient-premium tracking-wider pb-2 leading-relaxed">{language === 'ar' ? 'الرياضات والأنشطة في الأكاديمية' : 'Our Academy Disciplines'}</h2>
            <p className="text-base text-[#F2F2F2]">{language === 'ar' ? 'منظومة رياضية متكاملة تحت إشراف نخبة من أفضل المدربين المحترفين على مستوى الجمهورية' : 'Integrated sports system supervised by elite professional coaches nationwide'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                titleAr: 'كاراتيه (Karate)',
                titleEn: 'Karate',
                descAr: 'رياضة الدفاع عن النفس العريقة التي تركز على الضربات المباشرة باليدين والركل وصد الهجمات، وبناء شخصية منضبطة وقوية جسدياً وذهنياً. الأكاديمية توفر التدريب المتخصص في أقسام الكاراتيه الرئيسية: (الكاتا - Kata) للاستعراض الحركي الدقيق و (الكوميتيه - Kumite) للقتال الفعلي والبطولات.',
                descEn: 'The traditional self-defense martial art focusing on hand strikes, kicks, block techniques, and building a disciplined character. We provide specialized training in main divisions: (Kata) for precise forms and (Kumite) for actual sparring.',
                praiseAr: 'نفخر بوجود نخبة من مدربي الكاراتيه المعتمدين دولياً بالاتحاد المصري والذين قادوا لاعبينا لمنصات التتويج وحصد البطولات المحلية والدولية.',
                praiseEn: 'We are proud of our elite internationally-certified Egyptian Federation coaches who have led our champions to dominate national and international championships.',
                icon: <Trophy className="h-8 w-8 text-[#FF9500]" />
              },
              {
                titleAr: 'كونغ فو (Kung Fu)',
                titleEn: 'Kung Fu',
                descAr: 'الفن القتالي الصيني التقليدي الذي يجمع بين الحركات الدائرية السلسة والضربات السريعة الفعالة، والأساليب القتالية والاستعراضية (ساندا وتاولو).',
                descEn: 'The traditional Chinese martial art combining smooth circular movements, rapid strikes, and diverse combat/form styles (Sanda & Taolu).',
                praiseAr: 'يشرف على تدريبات الكونغ فو لدينا مدربون استثنائيون يركزون على تنمية المرونة الفائقة، القوة الانفجارية، والدفاع الفعال عن النفس بأساليب علمية حديثة.',
                praiseEn: 'Our Kung Fu section is run by exceptional coaches focusing on developing ultimate flexibility, explosive power, and modern defense methodologies.',
                icon: <Shield className="h-8 w-8 text-[#FF9500]" />
              },
              {
                titleAr: 'كيك بوكسينج (Kickboxing)',
                titleEn: 'Kickboxing',
                descAr: 'رياضة قتالية حماسية تجمع بين تقنيات الملاكمة والركلات القوية، وهي الخيار الأمثل لرفع اللياقة البدنية والتحمل وحرق الدهون وتطوير المهارات الدفاعية.',
                descEn: 'An energetic combat sport combining boxing techniques and powerful kicks, perfect for boosting physical fitness, stamina, fat loss, and practical self-defense.',
                praiseAr: 'طاقم تدريب الكيك بوكسينج لدينا يضم أبطالاً محترفين يضمنون تدريباً آمناً وحماسياً يرفع ثقتك بنفسك ويوصلك لأفضل لياقة وقوة بدنية ممكنة.',
                praiseEn: 'Our Kickboxing training crew includes professional champions who ensure a safe, high-energy environment to boost confidence and physical health.',
                icon: <Users className="h-8 w-8 text-[#FF9500]" />
              },
              {
                titleAr: 'جمباز (Gymnastics)',
                titleEn: 'Gymnastics',
                descAr: 'الرياضة الأساسية لبناء جسد مرن وقوي، تركز على الحركات البهلوانية والتوازن، الرشاقة، والتوافق العضلي العصبي، وهي حجر الأساس لجميع الرياضات.',
                descEn: 'The foundational sport for building a flexible and strong body, focusing on acrobatics, balance, agility, and motor coordination—the key for all sports.',
                praiseAr: 'مدربو الجمباز لدينا متخصصون في تدريب الأطفال والناشئين، ملتزمون تماماً بمعايير الأمان والسلامة الدولية مع التركيز على التطوير الحركي المتكامل.',
                praiseEn: 'Our Gymnastics coaches specialize in children and youth training, fully committed to international safety standards and complete motor development.',
                icon: <Award className="h-8 w-8 text-[#FF9500]" />
              }
            ].map((sport, idx) => (
              <div key={idx} className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#FF9500] hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-transparent via-[#FF9500] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-black/40 rounded-xl border border-[#2A2A2A] text-[#FF9500] group-hover:shadow-glow-orange transition-all duration-300">
                      {sport.icon}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-heading font-black text-[#F2F2F2]">
                        {language === 'ar' ? sport.titleAr : sport.titleEn}
                      </h3>
                      <span className="text-[9px] text-[#FF9500]/70 font-mono tracking-wider block mt-0.5 uppercase">
                        {language === 'ar' ? 'قسم معتمد بالأكاديمية' : 'Approved Discipline'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#828282] leading-relaxed font-body">
                    {language === 'ar' ? sport.descAr : sport.descEn}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2A2A2A]/40 bg-black/20 p-4 rounded-xl border border-[#2A2A2A]/50">
                  <div className="flex items-center gap-1.5 text-[#FF9500] text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
                    <Star className="h-3.5 w-3.5 fill-[#FF9500] animate-pulse" />
                    <span>{language === 'ar' ? 'طاقم التدريب المتميز' : 'Elite Coach Review'}</span>
                  </div>
                  <p className="text-[11px] text-[#F2F2F2]/90 leading-relaxed font-body italic">
                    "{language === 'ar' ? sport.praiseAr : sport.praiseEn}"
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===============================================================
          SECTION 4: OUR CHAMPIONS SECTION
          =============================================================== */}
      <section id="champions" className="py-24 bg-[#1C1B1B]/20 border-t border-b border-[#2A2A2A]/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[#FF9500] font-mono text-xs uppercase tracking-widest">{language === 'ar' ? 'التميز والبطولة' : 'Excellence & Glory'}</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider pb-2 leading-relaxed">{language === 'ar' ? 'أبطال الأكاديمية' : 'Academy Champions'}</h2>
            <p className="text-sm text-[#F2F2F2]">{language === 'ar' ? 'سجل شرف لأبطالنا الذين حققوا المراكز الأولى في البطولات المحلية والدولية' : 'Honor roll of our champions who secured first places in local and international tournaments'}</p>
          </div>

          {/* Champions Card Grid — centered */}
          <div className="flex flex-wrap justify-center gap-6">
            {champions.map((champ) => (
              <div
                key={champ._id}
                className="group relative bg-[#1C1B1B] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#FF9500] hover:scale-105 transition-all duration-300 flex flex-col justify-between w-full sm:w-[260px] lg:w-[280px]"
              >
                {/* Photo — tall portrait */}
                <div className="relative aspect-[3/4] w-full bg-[#0E0E0E] overflow-hidden border-b border-[#2A2A2A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={champ.photoUrl} alt={champ.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1C1B1B] to-transparent" />
                </div>

                {/* Info — centered */}
                <div className="p-4 flex flex-col items-center gap-2 text-center">
                  <h3 className="font-heading font-black text-sm md:text-base text-[#F2F2F2] uppercase tracking-wide group-hover:text-[#FF9500] transition-colors">{champ.name}</h3>
                  <span className="font-mono text-[9px] text-emerald-400 font-semibold tracking-wider uppercase">🏆 بطل الأكاديمية</span>

                  {/* Social links */}
                  {(champ.socialLinks?.facebook || champ.socialLinks?.instagram) && (
                    <div className="flex gap-3 text-[#828282] mt-1">
                      {champ.socialLinks?.facebook && (
                        <a href={champ.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9500] transition-colors">
                          <FacebookIcon className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {champ.socialLinks?.instagram && (
                        <a href={champ.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9500] transition-colors">
                          <InstagramIcon className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {champions.length === 0 && (
              <div className="w-full bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-12 text-center text-[#F2F2F2] font-mono text-sm">
                {language === 'ar' ? 'سوف يتم الإعلان عن لوحة الشرف قريباً!' : 'Honor roll will be listed here soon.'}
              </div>
            )}
          </div>

        </div>
      </section>






      {/* ===============================================================
          SECTION 5.5: KICKBOXING & COACH MINA NAGI SECTION
          =============================================================== */}
      <section id="kickboxing" className="py-24 bg-gradient-to-b from-[#0E0E0E] via-[#1a0a00] to-[#0E0E0E] border-t border-b border-[#FF9500]/20 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF9500]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF6B00]/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="inline-flex items-center gap-2 text-[#FF9500] font-mono text-xs uppercase tracking-widest">
              <span className="w-8 h-px bg-[#FF9500]" />
              {language === 'ar' ? 'الكيك بوكسينج' : 'Kickboxing Division'}
              <span className="w-8 h-px bg-[#FF9500]" />
            </span>
            <h2 className="text-4xl sm:text-5xl font-heading font-black uppercase text-gradient-premium tracking-wider pb-2 leading-relaxed">
              {language === 'ar'
                ? (content?.kickboxing?.titleAr || 'الكيك بوكسينج الاحترافي')
                : (content?.kickboxing?.titleEn || 'Professional Kickboxing Division')}
            </h2>
            <p className="text-base text-[#F2F2F2]/80 leading-relaxed max-w-2xl mx-auto">
              {language === 'ar'
                ? (content?.kickboxing?.descriptionAr || 'انضم إلى أحد أقوى برامج تدريب الكيك بوكسينج المصممة لتعزيز القوة البدنية والرشاقة والتركيز الذهني العميق.')
                : (content?.kickboxing?.descriptionEn || 'Join one of the most powerful Kickboxing training programs designed to enhance physical strength, agility, and deep mental focus.')}
            </p>
          </div>

          {/* Content: Coach Card + Description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Coach Profile Card */}
            <div className="relative">
              {/* Glowing border frame */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#FF9500] via-[#FF6B00] to-transparent rounded-2xl blur opacity-30" />
              <div className="relative bg-[#1C1B1B] border border-[#FF9500]/30 rounded-2xl overflow-hidden shadow-2xl">
                {/* Coach/Section Images */}
                <div className={`relative h-80 sm:h-96 overflow-hidden ${content?.kickboxing?.imageUrl2 ? 'grid grid-cols-2 gap-1 bg-[#1C1B1B]' : ''}`}>
                  {content?.kickboxing?.imageUrl ? (
                    <div className="relative w-full h-full col-span-1">
                      <img
                        src={content.kickboxing.imageUrl}
                        alt={language === 'ar' ? 'المدرب مينا ناجي - كيك بوكسينج' : 'Coach Mina Nagi - Kickboxing'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FF9500]/20 to-[#1C1B1B] flex items-center justify-center col-span-1">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🥊</div>
                        <p className="text-[#828282] text-sm font-mono">{language === 'ar' ? 'صورة المدرب' : 'Coach Photo'}</p>
                      </div>
                    </div>
                  )}

                  {/* Additional Images (2 and 3) */}
                  {(content?.kickboxing?.imageUrl2 || content?.kickboxing?.imageUrl3) && (
                    <div className="relative w-full h-full col-span-1 grid grid-rows-2 gap-1">
                      {content?.kickboxing?.imageUrl2 && (
                        <div className={`relative w-full h-full ${content?.kickboxing?.imageUrl3 ? 'row-span-1' : 'row-span-2'}`}>
                          <img src={content.kickboxing.imageUrl2} alt="Kickboxing 2" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {content?.kickboxing?.imageUrl3 && (
                        <div className="relative w-full h-full row-span-1">
                          <img src={content.kickboxing.imageUrl3} alt="Kickboxing 3" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Gradient overlay (placed over the whole grid) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B1B] via-transparent to-transparent pointer-events-none" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 right-4 bg-[#FF9500] text-black text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-lg z-10">
                    {language === 'ar' ? 'كيك بوكسينج' : 'Kickboxing'}
                  </div>
                </div>

                {/* Coach Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-xl font-heading font-black text-[#F2F2F2] uppercase">
                        {language === 'ar'
                          ? (content?.kickboxing?.coachNameAr || 'الكابتن مينا ناجي')
                          : (content?.kickboxing?.coachNameEn || 'Captain Mina Nagi')}
                      </h3>
                      <p className="text-[#FF9500] text-xs font-mono uppercase tracking-wider mt-1">
                        {language === 'ar' ? 'مدرب الكيك بوكسينج الاحترافي' : 'Professional Kickboxing Coach'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FF9500]/10 border border-[#FF9500]/30 flex items-center justify-center">
                      <span className="text-lg">🥊</span>
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-[#FF9500] fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Description & Stats */}
            <div className="space-y-8">
              {/* Bio */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-[#FF9500]" />
                  <span className="text-[#FF9500] text-xs font-mono uppercase tracking-widest">
                    {language === 'ar' ? 'نبذة عن المدرب' : 'About the Coach'}
                  </span>
                </div>
                <p className="text-[#F2F2F2]/80 leading-relaxed text-sm">
                  {language === 'ar'
                    ? (content?.kickboxing?.coachBioAr || 'الكابتن مينا ناجي هو نموذج للالتزام والاحترافية، ويُعتبر على نطاق واسع أحد أبرز المدربين المتخصصين في رياضة الكيك بوكسينج. يتميز بأسلوبه الفريد في التدريب الذي يمزج بين الدعم التحفيزي المطلق والتدريب البدني المكثف.')
                    : (content?.kickboxing?.coachBioEn || 'Coach Mina Nagi is the epitome of dedication and professionalism, widely recognized as one of the premier instructors in Kickboxing and combat sports. He stands out with his unique teaching methodology that merges absolute motivational support with intense physical training.')}
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: '🥊', titleAr: 'تدريب احترافي', titleEn: 'Pro Training', descAr: 'برامج مدروسة لكل المستويات', descEn: 'Structured programs for all levels' },
                  { icon: '🏆', titleAr: 'مدرب بطولي', titleEn: 'Championship Coach', descAr: 'خبرة في البطولات الرسمية', descEn: 'Experience in official competitions' },
                  { icon: '💪', titleAr: 'تطوير البدنية', titleEn: 'Physical Development', descAr: 'قوة وسرعة ورشاقة متكاملة', descEn: 'Strength, speed & agility combined' },
                  { icon: '🛡️', titleAr: 'دفاع عن النفس', titleEn: 'Self Defense', descAr: 'مهارات دفاعية حقيقية وفعالة', descEn: 'Real and effective defensive skills' },
                ].map((feat, i) => (
                  <div key={i} className="bg-[#1C1B1B] border border-[#2A2A2A] hover:border-[#FF9500]/40 rounded-xl p-4 transition-all duration-300 group">
                    <div className="text-2xl mb-2">{feat.icon}</div>
                    <h4 className="text-[#F2F2F2] font-bold text-sm mb-1 group-hover:text-[#FF9500] transition-colors">
                      {language === 'ar' ? feat.titleAr : feat.titleEn}
                    </h4>
                    <p className="text-[#828282] text-xs leading-relaxed">
                      {language === 'ar' ? feat.descAr : feat.descEn}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="#contact"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF9500] to-[#FF6B00] text-black font-black uppercase text-sm px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-[#FF9500]/20"
              >
                <span>🥊</span>
                <span>{language === 'ar' ? 'سجّل الآن في الكيك بوكسينج' : 'Join Kickboxing Now'}</span>
              </a>
            </div>

          </div>
        </div>
      </section>


      {/* ===============================================================
          SECTION 6: GALLERY SECTION
          =============================================================== */}
      <section id="gallery" className="py-24 bg-[#1C1B1B]/20 border-t border-b border-[#2A2A2A]/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[#FF9500] font-mono text-xs uppercase tracking-widest">{language === 'ar' ? 'لحظات من التألق' : 'Moments of Glory'}</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider pb-2 leading-relaxed">{language === 'ar' ? 'معرض الإنجازات' : 'Achievements Gallery'}</h2>
            <p className="text-sm text-[#F2F2F2]">{language === 'ar' ? 'جانب من مشاركات وتتويجات أبطال الأكاديمية في مختلف الفعاليات الرياضية' : 'Glimpses of our champions participations and coronations in various sports events'}</p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gallery.map((item, idx) => (
              <div
                key={item._id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-square bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#FF9500] hover:scale-102 transition-all duration-300 cursor-pointer shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.caption || 'Karate'} className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity duration-300">
                  <p className="text-xs text-[#F2F2F2] font-semibold leading-snug">{item.caption}</p>
                  <span className="text-[10px] font-mono text-[#FF9500] mt-1.5 uppercase tracking-widest flex items-center gap-1.5">
                    <ImageIcon className="h-3 w-3" />
                    <span>{language === 'ar' ? 'عرض مكبر' : 'Enlarge Image'}</span>
                  </span>
                </div>
              </div>
            ))}

            {gallery.length === 0 && (
              <div className="col-span-2 md:col-span-4 bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-12 text-center text-[#828282] font-mono text-sm">
                {language === 'ar' ? 'سيتم مشاركة صور الإنجازات والبطولات قريباً!' : 'No achievements available to show yet.'}
              </div>
            )}
          </div>

        </div>
      </section>



      {/* ===============================================================
          SECTION 9: CONTACT & REGISTER SECTION
          =============================================================== */}
      <section id="contact" className="py-24 bg-[#1C1B1B]/40 border-t border-[#2A2A2A]/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#FF9500] font-mono text-xs uppercase tracking-widest">{language === 'ar' ? 'تواصل معنا الآن' : 'Get In Touch'}</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider">{language === 'ar' ? 'اتصل بنا وانضم لكتيبة الأبطال' : 'Contact Us & Join The Academy'}</h2>
            <p className="text-sm text-[#828282]">{language === 'ar' ? 'أرسل لنا استفسارك أو احجز حصة تجريبية مجانية اليوم' : 'Send a message or reserve a free trial session'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Details & Map */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="p-4 bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF9500]/10 text-[#FF9500]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#828282] uppercase tracking-wider block font-semibold">{language === 'ar' ? 'المقر' : 'Location'}</span>
                    <span className="text-xs font-bold text-[#F2F2F2] truncate block">{safeContent.contact.address}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF9500]/10 text-[#FF9500]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#828282] uppercase tracking-wider block font-semibold">{language === 'ar' ? 'الهاتف' : 'Phone'}</span>
                    <span className="text-xs font-bold text-[#F2F2F2] truncate block">01555888842</span>
                  </div>
                </div>

              </div>

              {/* Embedded Google Map */}
              <div className="aspect-video w-full rounded-2xl border border-[#2A2A2A] overflow-hidden shadow-md relative group">
                {safeContent.contact.googleMapUrl ? (
                  <iframe
                    title="Champions Academy Location Map"
                    src={safeContent.contact.googleMapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1C1B1B] text-[#828282] text-xs">
                    {language === 'ar' ? 'لم يتم تحديد الموقع على الخريطة بعد' : 'Map location not set yet'}
                  </div>
                )}
                <a href="https://maps.app.goo.gl/eQqqy5B85VhiELtg6?g_st=aw" target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-[#FF9500] text-black font-extrabold py-2 px-6 rounded-lg uppercase text-xs tracking-wider shadow-glow-orange cursor-pointer">
                    {language === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                  </span>
                </a>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 relative overflow-hidden">
              {formSubmitted ? (
                <div className="absolute inset-0 bg-[#1C1B1B] flex flex-col items-center justify-center text-center p-6 space-y-4 animate-float z-10">
                  <CheckCircle className="h-16 w-16 text-emerald-500 animate-pulse" />
                  <h3 className="text-xl font-heading font-black text-[#FF9500] uppercase tracking-wider">{language === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Message Sent Successfully!'}</h3>
                  <p className="text-sm text-[#828282] max-w-xs">{language === 'ar' ? 'شكراً لتواصلك مع Champions Academy. سيقوم فريق خدمة العملاء بالتواصل معك قريباً جداً.' : 'Thank you for reaching out. Our administration will contact you shortly.'}</p>
                </div>
              ) : null}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <h3 className="font-heading font-black text-[#FF9500] text-lg border-b border-[#2A2A2A] pb-3 mb-6 uppercase">
                  {language === 'ar' ? 'أرسل لنا استفسارك مباشرة' : 'Send Us A Message'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'رقم الهاتف للاتصال' : 'Phone Number'}</label>
                    <input
                      type="text"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'نوع الرياضة المهتم بها' : 'Interested Sport'}</label>
                  <select
                    value={contactForm.sportType}
                    onChange={(e) => setContactForm({ ...contactForm, sportType: e.target.value })}
                    className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  >
                    <option value="">{language === 'ar' ? 'اختر الرياضة...' : 'Select a sport...'}</option>
                    <option value="كاراتيه (Karate)">{language === 'ar' ? 'كاراتيه' : 'Karate'}</option>
                    <option value="كونغ فو (Kung Fu)">{language === 'ar' ? 'كونغ فو' : 'Kung Fu'}</option>
                    <option value="كيك بوكسينج (Kickboxing)">{language === 'ar' ? 'كيك بوكسينج' : 'Kickboxing'}</option>
                    <option value="جمباز (Gymnastics)">{language === 'ar' ? 'جمباز' : 'Gymnastics'}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'الرسالة أو الاستفسار' : 'Message details'}</label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full bg-[#FF9500] text-black font-extrabold uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#F2C94C] transition-all disabled:opacity-50 cursor-pointer shadow-glow-orange text-xs"
                  >
                    <Send className="h-4 w-4" />
                    <span>{formSubmitting ? t('loading') : (language === 'ar' ? 'إرسال الرسالة الآن' : 'Send Message Now')}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* ===============================================================
          FOOTER SECTION
          =============================================================== */}
      <footer className="bg-[#0E0E0E] border-t border-[#2A2A2A] py-12 text-[#828282] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md border border-[#FF9500] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-heading font-black text-sm uppercase text-[#FF9500]">Champions Academy</span>
            </div>
            <p className="leading-relaxed text-[#828282] text-xs">
              {safeContent.about.introduction}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-black text-xs text-[#F2F2F2] uppercase tracking-wider">{language === 'ar' ? 'روابط سريعة' : 'Quick Navigation'}</h4>
            <div className="flex flex-col gap-2">
              <a href="#home" className="hover:text-[#FF9500] transition-colors">{language === 'ar' ? 'الرئيسية' : 'Home'}</a>
              <a href="#about" className="hover:text-[#FF9500] transition-colors">{language === 'ar' ? 'من نحن' : 'About Us'}</a>
              <a href="#why-us" className="hover:text-[#FF9500] transition-colors">{language === 'ar' ? 'المميزات' : 'Why Us'}</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-black text-xs text-[#F2F2F2] uppercase tracking-wider">{language === 'ar' ? 'الفئات' : 'Showcases'}</h4>
            <div className="flex flex-col gap-2">
              <a href="#champions" className="hover:text-[#FF9500] transition-colors">{language === 'ar' ? 'أبطال الأكاديمية' : 'Our Champions'}</a>
              <a href="#gallery" className="hover:text-[#FF9500] transition-colors">{language === 'ar' ? 'إنجازاتنا' : 'Achievements'}</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-black text-xs text-[#F2F2F2] uppercase tracking-wider">{language === 'ar' ? 'تابعونا' : 'Social Channels'}</h4>
            <div className="flex gap-4 text-[#828282]">
              <a href="https://www.facebook.com/share/1DmotRhL6M/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9500] transition-colors bg-[#1C1B1B] border border-[#2A2A2A] p-2.5 rounded-lg">
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/the.champions88?igsh=OGRsdHNiY2J1eTdw" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9500] transition-colors bg-[#1C1B1B] border border-[#2A2A2A] p-2.5 rounded-lg">
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
            <p className="text-[10px] font-mono pt-2 text-[#828282]">
              {language === 'ar' ? 'مصنع الأبطال - تحت الرعاية الكاملة لأكاديمية Champions Academy للكاراتيه' : 'Karate Academy - Under the full patronage of Champions Academy'}
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#2A2A2A]/40 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px]">&copy; 2026 {language === 'ar' ? 'Champions Academy. جميع الحقوق محفوظة.' : 'Champions Academy. All rights reserved.'}</p>
          <div className="flex items-center gap-4 text-[#828282] text-[10px] font-mono">
            <span>Powered by Engineer / Fares Mahmoud</span>
          </div>
        </div>
      </footer>

      {/* ===============================================================
          MODAL: LOGIN POPUP (ADMIN ACCESS)
          =============================================================== */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl animate-float">
            <div className="bg-[#0E0E0E] p-4 border-b border-[#2A2A2A] flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#FF9500]">
                <Lock className="h-4 w-4 shadow-glow-orange" />
                <h3 className="font-heading font-black text-sm uppercase">
                  {language === 'ar' ? 'دخول بوابة المشرف' : 'Admin Portal Access'}
                </h3>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-[#828282] hover:text-[#F2F2F2]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              <div className="flex flex-col items-center text-center space-y-2 mb-4">
                <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#FF9500] shadow-glow-orange-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-xs text-[#FF9500]">Champions Academy</h4>
                  <span className="font-mono text-[9px] text-[#828282] tracking-widest uppercase">"{safeContent.hero.subtitle}"</span>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold">{loginError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'اسم المستخدم' : 'Username'}</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                  placeholder={language === 'ar' ? 'اسم مستخدم المشرف...' : 'Enter admin username...'}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-[#FF9500] pr-10 pl-3"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828282] hover:text-[#F2F2F2] text-xs cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authenticating}
                  className="w-full bg-[#FF9500] text-black font-extrabold uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#F2C94C] transition-all disabled:opacity-50 shadow-glow-orange text-xs cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>{authenticating ? t('loading') : (language === 'ar' ? 'دخول لوحة الإدارة' : 'Login to Dashboard')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===============================================================
          GALLERY LIGHTBOX MODAL
          =============================================================== */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 left-4 p-3 bg-[#1C1B1B]/80 text-[#F2F2F2] hover:text-[#FF9500] border border-[#2A2A2A] rounded-full transition-all cursor-pointer z-50"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={() => handleLightboxNav('prev')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-[#1C1B1B]/80 text-[#F2F2F2] hover:text-[#FF9500] border border-[#2A2A2A] rounded-full transition-all cursor-pointer z-50"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image Canvas */}
          <div className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center justify-center space-y-4 px-12 relative z-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery[lightboxIndex].imageUrl}
              alt={gallery[lightboxIndex].caption || 'Karate'}
              className="max-w-full max-h-[70vh] object-contain rounded-lg border border-[#2A2A2A] shadow-glow-orange-lg animate-float"
            />
            {gallery[lightboxIndex].caption && (
              <p className="text-sm font-semibold text-[#F2F2F2] bg-[#1C1B1B]/80 border border-[#2A2A2A] px-4 py-2 rounded-lg text-center leading-relaxed">
                {gallery[lightboxIndex].caption}
              </p>
            )}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => handleLightboxNav('next')}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-[#1C1B1B]/80 text-[#F2F2F2] hover:text-[#FF9500] border border-[#2A2A2A] rounded-full transition-all cursor-pointer z-50"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>
      )}

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0E0E0E]" />}>
      <HomeContent />
    </Suspense>
  );
}
