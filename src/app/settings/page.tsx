'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import Sidebar from '@/components/Sidebar';
import { Settings as SettingsIcon, ShieldAlert, CheckCircle, Save } from 'lucide-react';

export default function Settings() {
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch admin credentials on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username || 'admin');
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (newPassword && newPassword !== newPasswordConfirm) {
      setError('كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('updateError'));
      }

      setSuccess(t('updateSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');

      // Reload the page after 1.5s to refresh cookies and the Sidebar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0E0E0E]">
      <Sidebar />

      {/* Content Container */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold uppercase text-[#FF9500]">
              {t('settings')}
            </h1>
            <p className="text-xs text-[#828282] tracking-wider uppercase font-mono mt-1">
              إدارة إعدادات الأمان وبيانات اعتماد الحساب الرئيسي
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-xl bg-[#1C1B1B] border border-[#2A2A2A] rounded p-6 shadow-glow-orange relative overflow-hidden underlit-card-orange">
          <h2 className="font-heading font-bold text-[#F2F2F2] text-base mb-6 pb-3 border-b border-[#2A2A2A] flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-[#FF9500]" />
            <span>{t('adminSettings')}</span>
          </h2>

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-xs rounded-md flex items-center gap-2 font-mono">
              <CheckCircle className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-[#D90000]/10 border border-[#D90000] text-red-200 text-xs rounded-md flex items-center gap-2 font-mono">
              <ShieldAlert className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1.5 font-bold">
                {t('usernameLabel')}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
              />
            </div>

            {/* Divider */}
            <div className="pt-4 border-t border-[#2A2A2A]">
              <h3 className="text-xs text-[#828282] font-semibold mb-4">{t('changePassword')}</h3>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1.5 font-bold">
                {t('currentPassword')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                placeholder="••••••••"
              />
            </div>

            {/* New Password & Confirm Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1.5 font-bold">
                  {t('newPassword')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1.5 font-bold">
                  {t('newPasswordConfirm')}
                </label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#FF9500] hover:bg-[#D90000] text-black hover:text-white font-bold py-2.5 px-6 rounded text-xs uppercase tracking-wider transition-colors duration-300 shadow-lg shadow-orange-500/10 flex items-center gap-2"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{t('save')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
