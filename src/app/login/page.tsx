'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Shield, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('/logo.jpg');

  React.useEffect(() => {
    fetch('/api/academy/content')
      .then(res => res.json())
      .then(data => { if (data.logoUrl) setLogoUrl(data.logoUrl); })
      .catch(err => console.error('Failed to fetch logo', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('loginError'));
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0E0E0E] p-4 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#FF9500] opacity-[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#D90000] opacity-[0.03] blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-[#1C1B1B] border border-[#2A2A2A] rounded-lg p-8 shadow-glow-orange flex flex-col relative z-10 underlit-card-orange">
        {/* Eagle Emblem Banner */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#FF9500] shadow-glow-orange-lg mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Champions Academy"
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="font-heading font-extrabold text-2xl tracking-wider text-[#FF9500] uppercase text-center">
            {t('title')}
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-[#828282] mt-1 text-center">
            {t('loginSubtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#D90000]/10 border border-[#D90000] text-red-200 text-xs rounded-md flex items-center gap-2">
            <span className="font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#828282] mb-1.5 font-bold">
              {t('usernameLabel')}
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-[#828282]`}>
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#0E0E0E] text-[#F2F2F2] border border-[#2A2A2A] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF9500] focus:shadow-glow-orange transition-all placeholder-[#828282]"
                placeholder="admin"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#828282] mb-1.5 font-bold">
              {t('passwordLabel')}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-[#828282] hover:text-[#F2F2F2]`}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#0E0E0E] text-[#F2F2F2] border border-[#2A2A2A] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF9500] focus:shadow-glow-orange transition-all placeholder-[#828282]"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF9500] hover:bg-[#D90000] text-black font-bold py-3 px-4 rounded text-sm uppercase tracking-wider transition-colors duration-300 shadow-lg shadow-orange-500/10 hover:shadow-red-500/10 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="h-4 w-4" />
                <span>{t('loginButton')}</span>
              </>
            )}
          </button>
        </form>

        {/* Access Hint Box */}
        <div className="mt-6 pt-4 border-t border-[#2A2A2A] flex items-start gap-2.5 text-[11px] text-[#828282] font-mono">
          <Lock className="h-4 w-4 text-[#F2C94C] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#F2C94C] font-semibold">بوابة المدير المسؤول فقط</p>
            <p>اسم المستخدم الافتراضي: <span className="text-white">Ahmd Salem</span></p>
            <p>كلمة المرور الافتراضية: <span className="text-white">AhmdSalem2026@</span></p>
          </div>
        </div>
      </div>
    </main>
  );
}
