'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('admin');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.username) {
            setAdminUsername(data.username);
          }
        }
      } catch (err) {
        console.error('Failed to fetch admin info:', err);
      }
    }
    fetchMe();
  }, []);

  const menuItems = [
    { name: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('players'), path: '/players', icon: Users },
    { name: t('coaches'), path: '/coaches', icon: Trophy },
    { name: t('academyManagement'), path: '/dashboard/academy', icon: Globe },
    { name: t('settings'), path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4 bg-[#1C1B1B] border-r-0 border-l-0 border-custom border-opacity-40">
      <div className="space-y-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-[#2A2A2A]">
          <div className="relative h-12 w-12 overflow-hidden rounded-md border border-[#FF9500] shadow-glow-orange flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="Champions Academy Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading font-extrabold text-sm tracking-wider text-[#FF9500] uppercase truncate">
              {language === 'ar' ? 'أكاديمية الأبطال' : 'Champions Academy'}
            </h2>
            <span className="font-mono text-[9px] text-[#828282] uppercase tracking-widest block">
              {t('subtitle')}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF9500] text-black font-semibold shadow-glow-orange'
                    : 'text-[#F2F2F2] hover:bg-[#2A2A2A] hover:text-[#FF9500]'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-[#2A2A2A]">
        {/* Language Switcher Button */}
        <button
          onClick={toggleLanguage}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[#F2F2F2] hover:bg-[#2A2A2A] transition-all"
        >
          <Globe className="h-4 w-4 text-[#F2C94C] flex-shrink-0" />
          <span>{language === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}</span>
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[#F2F2F2] hover:bg-[#2A2A2A] transition-all"
        >
          {theme === 'dark' ? (
            <>
              <span className="text-yellow-400 text-xs w-4 flex items-center justify-center flex-shrink-0">☀️</span>
              <span>{language === 'ar' ? 'الوضع النهاري' : 'Light Mode'}</span>
            </>
          ) : (
            <>
              <span className="text-indigo-400 text-xs w-4 flex items-center justify-center flex-shrink-0">🌙</span>
              <span>{language === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}</span>
            </>
          )}
        </button>

        {/* Admin profile detail */}
        <div className="px-3 py-2 rounded-md bg-[#0E0E0E] border border-[#2A2A2A] flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] text-[#828282] uppercase tracking-wider block">
              {t('admin')}
            </p>
            <p className="text-xs font-semibold text-[#F2F2F2] truncate">{adminUsername}</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top-bar (Hidden on desktop) */}
      <header className="flex h-16 items-center justify-between bg-[#1C1B1B] border-b border-[#2A2A2A] px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded border border-[#FF9500]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-heading font-extrabold text-[#FF9500] text-sm uppercase">
            {language === 'ar' ? 'أكاديمية الأبطال' : 'Champions Academy'}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded p-1 text-[#F2F2F2] hover:bg-[#2A2A2A]"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Desktop Sidebar (Permanent) */}
      <aside
        className={`hidden md:flex md:w-64 md:flex-col fixed top-0 bottom-0 z-20 ${
          isRtl ? 'right-0 border-l border-[#2A2A2A]' : 'left-0 border-r border-[#2A2A2A]'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Sidebar (Drawer overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-30 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <aside
            className={`relative flex w-64 max-w-xs flex-col z-40 transition-transform duration-300 ${
              isRtl ? 'mr-0' : 'ml-0'
            }`}
          >
            {navContent}
          </aside>
        </div>
      )}

      {/* Main layout spacing offset for desktop */}
      <div className={`hidden md:block md:w-64 flex-shrink-0`} />
    </>
  );
}
