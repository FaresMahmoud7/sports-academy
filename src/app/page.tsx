'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  Facebook,
  Instagram,
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
}

export default function Home() {
  const { t, isRtl, language, setLanguage } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic Theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Loading & State
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<AcademyContent | null>(null);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);

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
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
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
        const contentRes = await fetch('/api/academy/content');
        if (contentRes.ok) {
          setContent(await contentRes.json());
        }

        // Champions
        const championsRes = await fetch('/api/academy/champions');
        if (championsRes.ok) {
          setChampions(await championsRes.json());
        }

        // Testimonials
        const testimonialsRes = await fetch('/api/academy/testimonials');
        if (testimonialsRes.ok) {
          setTestimonials(await testimonialsRes.json());
        }

        // Gallery
        const galleryRes = await fetch('/api/academy/gallery');
        if (galleryRes.ok) {
          setGallery(await galleryRes.json());
        }

        // Coaches (GET is now public!)
        const coachesRes = await fetch('/api/coaches');
        if (coachesRes.ok) {
          setCoaches(await coachesRes.json());
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
    // Simulate API call for form submission
    setTimeout(() => {
      setFormSubmitting(false);
      setFormSubmitted(true);
      setContactForm({ name: '', phone: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormSubmitted(false), 5000);
    }, 1500);
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

  if (loading || !content) {
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
    { name: language === 'ar' ? 'المميزات' : 'Why Us', href: '#why-us' },
    { name: language === 'ar' ? 'أبطالنا' : 'Champions', href: '#champions' },
    { name: language === 'ar' ? 'المدربون' : 'Coaches', href: '#coaches' },
    { name: language === 'ar' ? 'المعرض' : 'Gallery', href: '#gallery' },
    { name: language === 'ar' ? 'الآراء' : 'Reviews', href: '#reviews' },
    { name: language === 'ar' ? 'اتصل بنا' : 'Contact', href: '#contact' },
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
                {language === 'ar' ? 'أكاديمية الأبطال' : 'Champions Academy'}
              </h1>
              <span className="font-mono text-[9px] text-[#828282] uppercase tracking-widest block mt-0.5">
                {content.hero.subtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-wider text-[#828282] hover:text-[#FF9500] transition-colors"
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
                  className="bg-[#FF9500] text-black font-extrabold text-xs uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-[#F2C94C] transition-all shadow-glow-orange cursor-pointer"
                >
                  <span>{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
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
              <span className="font-heading font-black text-[#FF9500] text-sm uppercase">أكاديمية الأبطال</span>
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
              {content.hero.title}
            </h1>

            {/* Slogan */}
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-gradient-premium tracking-wider animate-float drop-shadow-[0_0_15px_rgba(255,149,0,0.2)]">
              "{content.hero.subtitle}"
            </h2>

            <p className="text-sm md:text-base text-[#828282] max-w-xl mx-auto lg:mx-0 leading-relaxed font-body">
              {content.about.introduction}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href={content.hero.ctaLink}
                className="bg-[#FF9500] text-black font-extrabold uppercase tracking-wider px-8 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#F2C94C] hover:scale-[1.02] transition-all shadow-glow-orange cursor-pointer"
              >
                <span>{content.hero.ctaText}</span>
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

          {/* Hero Right Banner Image */}
          <div className="relative aspect-video lg:aspect-square w-full rounded-2xl border border-[#2A2A2A] overflow-hidden shadow-glow-orange max-w-xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.hero.mediaUrl}
              alt="Champions Academy Karate Training"
              className="h-full w-full object-cover hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <div className="flex items-center gap-4 bg-[#1C1B1B]/80 backdrop-blur border border-[#2A2A2A] p-4 rounded-xl max-w-xs">
                <Users className="h-10 w-10 text-[#FF9500] flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs uppercase text-[#F2F2F2]">{language === 'ar' ? 'انضم لأكثر من' : 'Join more than'}</h4>
                  <span className="font-heading font-black text-[#FF9500] text-lg">{content.statistics.traineesCount}+ {language === 'ar' ? 'بطل' : 'champions'}</span>
                </div>
              </div>
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
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider">{language === 'ar' ? 'من نحن - قصة مصنع الأبطال' : 'About Us & Our History'}</h2>
            <p className="text-sm text-[#828282]">{language === 'ar' ? 'تعرف على تاريخ الأكاديمية ورؤيتنا الرياضية الشاملة' : 'Learn about our deep sports vision and karate training ethics'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Image Beside Content */}
            <div className="relative aspect-[4/3] w-full rounded-2xl border border-[#2A2A2A] overflow-hidden shadow-glow-orange max-w-lg mx-auto order-last lg:order-first">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.about.imageUrl} alt="About Champions Academy" className="h-full w-full object-cover" />
            </div>

            {/* Rich Content Panel */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-heading font-black text-[#FF9500] mb-3 uppercase">{language === 'ar' ? 'بناء جيل رياضي متميز' : 'Shaping a Dynamic Generation'}</h3>
                <p className="text-sm md:text-base text-[#828282] leading-relaxed font-body whitespace-pre-line">
                  {content.about.story}
                </p>
              </div>

              {/* Vision and Mission Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#2A2A2A]">
                <div className="p-5 bg-[#0E0E0E] rounded-xl border border-[#2A2A2A] space-y-2 underlit-card-orange">
                  <Compass className="h-6 w-6 text-[#FF9500]" />
                  <h4 className="font-heading font-black text-sm text-[#F2F2F2] uppercase">{language === 'ar' ? 'رؤيتنا' : 'Our Vision'}</h4>
                  <p className="text-xs text-[#828282] leading-relaxed">{content.about.vision}</p>
                </div>

                <div className="p-5 bg-[#0E0E0E] rounded-xl border border-[#2A2A2A] space-y-2 underlit-card-red">
                  <Shield className="h-6 w-6 text-[#D90000]" />
                  <h4 className="font-heading font-black text-sm text-[#F2F2F2] uppercase">{language === 'ar' ? 'رسالتنا' : 'Our Mission'}</h4>
                  <p className="text-xs text-[#828282] leading-relaxed">{content.about.mission}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===============================================================
          SECTION 3: WHY CHOOSE US
          =============================================================== */}
      <section id="why-us" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#FF9500] font-mono text-xs uppercase tracking-widest">{language === 'ar' ? 'نقاط القوة والمزايا' : 'Our Main Strengths'}</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider">{language === 'ar' ? 'لماذا يفضلنا الجميع؟' : 'Why Choose Champions Academy?'}</h2>
            <p className="text-sm text-[#828282]">{language === 'ar' ? 'نقدم لكم منظومة رياضية شاملة تضمن التميز والانضباط للأبطال' : 'Professional coach crew, certified training courses, and top-tier facilities'}</p>
          </div>

          {/* Strengths Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.whyChooseUs.map((strength, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#1C1B1B] rounded-xl border border-[#2A2A2A] space-y-4 glow-interactive hover:scale-102 hover:border-[#FF9500] transition-all duration-300"
              >
                <div className="h-14 w-14 rounded-lg bg-[#FF9500]/5 flex items-center justify-center border border-[#FF9500]/10 shadow-inner">
                  {getStrengthIcon(strength.icon)}
                </div>
                <h3 className="font-heading font-black text-base text-[#F2F2F2] uppercase">{strength.title}</h3>
                <p className="text-xs text-[#828282] leading-relaxed">{strength.description}</p>
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
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#FF9500] font-mono text-xs uppercase tracking-widest">{language === 'ar' ? 'لوحة الشرف للأكاديمية' : 'Showcase Honor Roll'}</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider">{language === 'ar' ? 'تعرف على أبطال الأكاديمية' : 'Meet Our Champions'}</h2>
            <p className="text-sm text-[#828282]">{language === 'ar' ? 'أبطال حصدوا الميداليات الذهبية والفضية في بطولات الجمهورية والبطولات الدولية' : 'Trainees who won gold medals and local/international karate tournaments'}</p>
          </div>

          {/* Champions Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {champions.map((champ) => (
              <div
                key={champ._id}
                className="group relative bg-[#1C1B1B] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#FF9500] hover:scale-102 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo */}
                <div className="relative aspect-square w-full bg-[#0E0E0E] overflow-hidden border-b border-[#2A2A2A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={champ.photoUrl} alt={champ.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Age and Sport Labels */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    <span className="bg-black/85 backdrop-blur-sm border border-[#2A2A2A] text-[#FF9500] font-mono text-[9px] font-semibold py-1 px-2.5 rounded-full">
                      {champ.sportCategory}
                    </span>
                    <span className="bg-black/85 backdrop-blur-sm border border-[#2A2A2A] text-[#F2C94C] font-mono text-[9px] font-semibold py-1 px-2.5 rounded-full">
                      {champ.ageCategory}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-heading font-black text-sm md:text-base text-[#F2F2F2] uppercase tracking-wide group-hover:text-[#FF9500] transition-colors">{champ.name}</h3>
                    <p className="text-xs text-[#828282] leading-relaxed line-clamp-3 italic">"{champ.achievements}"</p>
                  </div>

                  {/* Social links (optional) */}
                  <div className="flex items-center justify-between border-t border-[#2A2A2A]/40 pt-3">
                    <span className="font-mono text-[9px] text-emerald-400 font-semibold tracking-wider uppercase">🏆 بطل الأكاديمية</span>
                    <div className="flex gap-2.5 text-[#828282]">
                      {champ.socialLinks?.facebook && (
                        <a href={champ.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9500] transition-colors">
                          <Facebook className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {champ.socialLinks?.instagram && (
                        <a href={champ.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9500] transition-colors">
                          <Instagram className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {champions.length === 0 && (
              <div className="col-span-2 lg:col-span-4 bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-12 text-center text-[#828282] font-mono text-sm">
                {language === 'ar' ? 'سوف يتم الإعلان عن لوحة الشرف قريباً!' : 'Honor roll will be listed here soon.'}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ===============================================================
          SECTION 5: ACHIEVEMENTS & STATISTICS
          =============================================================== */}
      <section className="py-20 relative overflow-hidden bg-[#0E0E0E] border-b border-[#2A2A2A]/40">
        <div className="absolute inset-0 bg-mesh-dark opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-[#1C1B1B]/40 rounded-xl border border-[#2A2A2A]/60 underlit-card-orange">
              <span className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-[#FF9500] tracking-wider pulse-glow-orange">
                {content.statistics.championsCount}
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-[#828282] uppercase tracking-widest block font-bold">{language === 'ar' ? 'بطل معتمد' : 'Certified Champions'}</span>
            </div>

            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-[#1C1B1B]/40 rounded-xl border border-[#2A2A2A]/60 underlit-card-red">
              <span className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-[#D90000] tracking-wider">
                {content.statistics.tournamentsCount}
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-[#828282] uppercase tracking-widest block font-bold">{language === 'ar' ? 'بطولة مسجلة' : 'Tournaments Won'}</span>
            </div>

            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-[#1C1B1B]/40 rounded-xl border border-[#2A2A2A]/60 underlit-card-gold">
              <span className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-[#F2C94C] tracking-wider">
                {content.statistics.yearsOfExperience}
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-[#828282] uppercase tracking-widest block font-bold">{language === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}</span>
            </div>

            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-[#1C1B1B]/40 rounded-xl border border-[#2A2A2A]/60 underlit-card-orange">
              <span className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-[#FF9500] tracking-wider">
                {content.statistics.traineesCount}
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-[#828282] uppercase tracking-widest block font-bold">{language === 'ar' ? 'متدرب نشط' : 'Active Trainees'}</span>
            </div>

          </div>

        </div>
      </section>

      {/* ===============================================================
          SECTION 8: COACHES SECTION
          =============================================================== */}
      <section id="coaches" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#FF9500] font-mono text-xs uppercase tracking-widest">{language === 'ar' ? 'خبراء التدريب' : 'Expert Trainers'}</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider">{language === 'ar' ? 'طاقمنا التدريبي المعتمد' : 'Meet Our Certified Coaches'}</h2>
            <p className="text-sm text-[#828282]">{language === 'ar' ? 'نخبة من المدربين الدوليين ذوي الخبرة الطويلة والحاصلين على أحزمة سوداء درجات متقدمة' : 'World class karate masters, championship competitors, and black belt degrees'}</p>
          </div>

          {/* Coaches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coaches.map((coach) => (
              <div
                key={coach._id}
                className="p-6 bg-[#1C1B1B] border border-[#2A2A2A] rounded-2xl flex flex-col sm:flex-row gap-6 items-center sm:items-start hover:border-[#FF9500] transition-all duration-300 shadow-md"
              >
                {/* Photo */}
                <div className="h-28 w-28 rounded-xl border border-[#FF9500] overflow-hidden flex-shrink-0 bg-[#0E0E0E]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coach.photoUrl || '/logo.jpg'} alt={coach.name} className="h-full w-full object-cover" />
                </div>

                {/* Profile Bio */}
                <div className="flex-1 min-w-0 text-center sm:text-right space-y-2">
                  <h3 className="font-heading font-black text-[#FF9500] text-lg uppercase">{coach.name}</h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="bg-[#0E0E0E] text-[#828282] font-mono text-[9px] font-semibold py-0.5 px-2 rounded border border-[#2A2A2A] uppercase">
                      {coach.position || (language === 'ar' ? 'مدرب الأكاديمية' : 'Academy Coach')}
                    </span>
                    <span className="bg-[#0E0E0E] text-[#F2C94C] font-mono text-[9px] font-semibold py-0.5 px-2 rounded border border-[#2A2A2A] uppercase">
                      {coach.experience || (language === 'ar' ? 'خبرة رياضية واسعة' : 'Experienced')}
                    </span>
                  </div>

                  <p className="text-xs text-[#828282] leading-relaxed italic whitespace-pre-line pt-2">
                    {coach.biography || (language === 'ar' ? 'مدرب متألق في رياضة الكاراتيه والدفاع عن النفس، كرس جهوده لبناء الأبطال وتعليم أساسيات اللعبة والانضباط.' : 'Dedicated karate master committed to training future champions and teaching focus.')}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-4 pt-3 text-[#828282]">
                    {coach.facebookUrl && (
                      <a href={coach.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9500] transition-colors">
                        <Facebook className="h-4 w-4" />
                      </a>
                    )}
                    {coach.instagramUrl && (
                      <a href={coach.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9500] transition-colors">
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    <span className="text-[10px] font-mono bg-[#0E0E0E] border border-[#2A2A2A] text-[#828282] px-2 py-0.5 rounded">{coach.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===============================================================
          SECTION 6: GALLERY SECTION
          =============================================================== */}
      <section id="gallery" className="py-24 bg-[#1C1B1B]/20 border-t border-b border-[#2A2A2A]/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#FF9500] font-mono text-xs uppercase tracking-widest">{language === 'ar' ? 'معرض صور الأكاديمية' : 'Media Gallery'}</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider">{language === 'ar' ? 'معرض لقطات وتدريبات الأبطال' : 'Our Training & Events Gallery'}</h2>
            <p className="text-sm text-[#828282]">{language === 'ar' ? 'لقطات حية من داخل صالات الكاراتيه والبطولات والمشاركات الجماعية' : 'Snapshots from group sessions, local karate exams, and tournament podiums'}</p>
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
                <img src={item.imageUrl} alt={item.caption || 'Karate'} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
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
                {language === 'ar' ? 'سيتم مشاركة الصور في المعرض قريباً!' : 'No photos available to show in the gallery yet.'}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ===============================================================
          SECTION 7: TESTIMONIALS SECTION
          =============================================================== */}
      <section id="reviews" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#FF9500] font-mono text-xs uppercase tracking-widest">{language === 'ar' ? 'ثقة ومصداقية' : 'Client Feedback'}</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider">{language === 'ar' ? 'ماذا يقول عنا أولياء الأمور؟' : 'Parent & Trainee Reviews'}</h2>
            <p className="text-sm text-[#828282]">{language === 'ar' ? 'نعتز بثقتكم ونسعى دائماً لتقديم أفضل مستوى تدريبي وانضباطي لأبنائنا' : 'Discover what parents and students say about their training experience'}</p>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div
                key={test._id}
                className="p-6 bg-[#1C1B1B] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between hover:border-[#FF9500] hover:scale-102 transition-all duration-300 shadow-md"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 text-[#F2C94C] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < test.rating ? 'fill-[#F2C94C]' : 'opacity-20'}`} />
                    ))}
                  </div>
                  {/* Review Text */}
                  <p className="text-sm text-[#F2F2F2] italic leading-relaxed mb-6 font-body">"{test.reviewText}"</p>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 border-t border-[#2A2A2A] pt-4">
                  <div className="h-10 w-10 rounded-full border border-custom overflow-hidden flex-shrink-0 bg-[#0E0E0E]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={test.profileImageUrl} alt={test.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="font-heading font-black text-sm text-[#FF9500] tracking-wide">{test.name}</span>
                </div>
              </div>
            ))}

            {testimonials.length === 0 && (
              <div className="col-span-1 md:col-span-3 bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-12 text-center text-[#828282] font-mono text-sm">
                {language === 'ar' ? 'التقييمات قيد النشر قريباً!' : 'No client reviews are published yet.'}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="p-4 bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF9500]/10 text-[#FF9500]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#828282] uppercase tracking-wider block font-semibold">{language === 'ar' ? 'المقر' : 'Location'}</span>
                    <span className="text-xs font-bold text-[#F2F2F2] truncate block">{content.contact.address}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF9500]/10 text-[#FF9500]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#828282] uppercase tracking-wider block font-semibold">{language === 'ar' ? 'الهاتف' : 'Phone'}</span>
                    <span className="text-xs font-bold text-[#F2F2F2] truncate block">{content.contact.phone}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF9500]/10 text-[#FF9500]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#828282] uppercase tracking-wider block font-semibold">{language === 'ar' ? 'البريد' : 'Email'}</span>
                    <span className="text-xs font-bold text-[#F2F2F2] truncate block">{content.contact.email}</span>
                  </div>
                </div>

              </div>

              {/* Embedded Google Map */}
              <div className="aspect-video w-full rounded-2xl border border-[#2A2A2A] overflow-hidden shadow-md">
                <iframe
                  title="Champions Academy Location Map"
                  src={content.contact.googleMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 relative overflow-hidden">
              {formSubmitted ? (
                <div className="absolute inset-0 bg-[#1C1B1B] flex flex-col items-center justify-center text-center p-6 space-y-4 animate-float z-10">
                  <CheckCircle className="h-16 w-16 text-emerald-500 animate-pulse" />
                  <h3 className="text-xl font-heading font-black text-[#FF9500] uppercase tracking-wider">{language === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Message Sent Successfully!'}</h3>
                  <p className="text-sm text-[#828282] max-w-xs">{language === 'ar' ? 'شكراً لتواصلك مع أكاديمية الأبطال. سيقوم فريق خدمة العملاء بالتواصل معك قريباً جداً.' : 'Thank you for reaching out. Our administration will contact you shortly.'}</p>
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
                  <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[#828282] uppercase">{language === 'ar' ? 'موضوع الرسالة (مثال: حجز حصة تجريبية)' : 'Subject'}</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-[#FF9500]"
                    required
                  />
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
              <span className="font-heading font-black text-sm uppercase text-[#FF9500]">أكاديمية الأبطال</span>
            </div>
            <p className="leading-relaxed text-[#828282] text-xs">
              {content.about.introduction}
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
              <a href="#coaches" className="hover:text-[#FF9500] transition-colors">{language === 'ar' ? 'طاقم المدربين' : 'Coaches Profiles'}</a>
              <a href="#gallery" className="hover:text-[#FF9500] transition-colors">{language === 'ar' ? 'معرض الصور' : 'Media Gallery'}</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-black text-xs text-[#F2F2F2] uppercase tracking-wider">{language === 'ar' ? 'تابعونا' : 'Social Channels'}</h4>
            <div className="flex gap-4 text-[#828282]">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9500] transition-colors bg-[#1C1B1B] border border-[#2A2A2A] p-2.5 rounded-lg">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9500] transition-colors bg-[#1C1B1B] border border-[#2A2A2A] p-2.5 rounded-lg">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <p className="text-[10px] font-mono pt-2 text-[#828282]">
              {language === 'ar' ? 'مصنع الأبطال - تحت الرعاية الكاملة لأكاديمية الأبطال للكاراتيه' : 'Karate Academy - Under the full patronage of Champions Academy'}
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#2A2A2A]/40 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px]">&copy; 2026 {language === 'ar' ? 'أكاديمية الأبطال. جميع الحقوق محفوظة.' : 'Champions Academy. All rights reserved.'}</p>
          <div className="flex items-center gap-4 text-[#828282] text-[10px] font-mono">
            <span>Powered by Next.js & MongoDB</span>
            <span>•</span>
            <button onClick={() => setIsLoginModalOpen(true)} className="hover:text-[#FF9500] transition-colors">Admin Portal</button>
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
                  <h4 className="font-heading font-black text-xs text-[#FF9500]">{language === 'ar' ? 'أكاديمية الأبطال للكاراتيه' : 'Champions Academy'}</h4>
                  <span className="font-mono text-[9px] text-[#828282] tracking-widest uppercase">"{content.hero.subtitle}"</span>
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
