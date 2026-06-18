'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import Sidebar from '@/components/Sidebar';
import { Users, Shield, Award } from 'lucide-react';

interface StatData {
  totalPlayers: number;
  totalCoaches: number;
  beltGroups: { name: string; count: number }[];
  categoryGroups: { name: string; count: number }[];
}

export default function Dashboard() {
  const { t, isRtl } = useLanguage();
  const [data, setData] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUsername, setAdminUsername] = useState('admin');

  useEffect(() => {
    async function fetchStatsAndMe() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.username) {
            setAdminUsername(meData.username);
          }
        }
      } catch (err) {
        console.error('Failed to load admin profile:', err);
      }

      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) {
          throw new Error('Failed to load statistics');
        }
        const stats = await res.json();
        setData(stats);
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchStatsAndMe();
  }, []);

  const getBeltColorClass = (beltName: string) => {
    switch (beltName) {
      case 'White':
        return 'bg-white text-black';
      case 'Yellow':
        return 'bg-yellow-400 text-black';
      case 'Orange':
        return 'bg-orange-500 text-black';
      case 'Green':
        return 'bg-green-600 text-white';
      case 'Blue':
        return 'bg-blue-600 text-white';
      case 'Brown':
        return 'bg-[#78350F] text-white';
      case 'Black Belt':
        return 'bg-black text-[#FF9500] border border-[#FF9500] shadow-glow-orange';
      default:
        return 'bg-zinc-700 text-white';
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-mesh-dark">
      <Sidebar />

      {/* Content Container */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="animate-float">
            <h1 className="text-2xl md:text-4xl font-heading font-black uppercase text-gradient-premium tracking-wider drop-shadow-[0_0_15px_rgba(255,149,0,0.15)]">
              {t('dashboard')}
            </h1>
            <p className="text-xs text-[#E0E0E0] tracking-wider uppercase font-mono mt-1.5 flex items-center gap-1.5">
              <span className="text-[#FF9500] font-bold">🥋 {t('welcome')} ،</span>
              <span className="text-white font-extrabold underline decoration-[#FF9500] decoration-2 underline-offset-4">{adminUsername}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[#1C1B1B]/80 border border-[#FF9500]/20 shadow-glow-orange-lg backdrop-blur-md glow-breathing">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono text-[10px] font-bold text-emerald-400 tracking-widest">SYSTEM ONLINE</span>
          </div>
        </div>

        {error ? (
          <div className="p-4 bg-red-950/20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        ) : (
          data && (
            <div className="space-y-8">
              {/* Widgets Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Total Players Card */}
                <div className="glass-card-premium border border-[#2A2A2A] rounded-xl p-6 flex items-center justify-between glow-interactive underlit-card-orange shadow-glow-orange/5 hover:shadow-glow-orange/20 transition-all duration-300">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#828282] font-black block mb-1">
                      {t('totalPlayers')}
                    </span>
                    <span className="font-heading font-black text-4xl text-[#FF9500] drop-shadow-[0_0_10px_rgba(255,149,0,0.2)]">
                      {data.totalPlayers}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#FF9500]/10 border border-[#FF9500]/30 text-[#FF9500] shadow-inner transition-transform duration-300">
                    <Users className="h-6 w-6 animate-pulse" />
                  </div>
                </div>

                {/* Total Coaches Card */}
                <div className="glass-card-premium border border-[#2A2A2A] rounded-xl p-6 flex items-center justify-between glow-interactive underlit-card-gold shadow-glow-orange/5 hover:shadow-glow-orange/20 transition-all duration-300">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#828282] font-black block mb-1">
                      {t('totalCoaches')}
                    </span>
                    <span className="font-heading font-black text-4xl text-[#F2C94C] drop-shadow-[0_0_10px_rgba(242,201,76,0.2)]">
                      {data.totalCoaches}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#F2C94C]/10 border border-[#F2C94C]/30 text-[#F2C94C] shadow-inner transition-transform duration-300">
                    <Shield className="h-6 w-6 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Graphical Visualizations Section */}
              <div className="grid grid-cols-1 gap-8">
                {/* Belts rank distribution */}
                <div className="glass-card-premium border border-[#2A2A2A] rounded-xl p-6 shadow-glow-orange/5 hover:border-[#F2C94C]/30 transition-all duration-300">
                  <h3 className="font-heading font-black text-lg text-[#F2F2F2] uppercase tracking-wider mb-6 border-b border-[#2A2A2A] pb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#F2C94C] animate-pulse" />
                    <span>{t('beltBreakdown')}</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {data.beltGroups.map((group) => {
                      const count = group.count;
                      return (
                        <div
                          key={group.name}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-[#0E0E0E]/90 border border-[#2A2A2A]/85 hover:border-[#FF9500]/30 transition-all duration-200"
                        >
                          <span
                            className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase tracking-wider ${getBeltColorClass(
                              group.name
                            )}`}
                          >
                            {t(group.name as any)}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#FF9500]">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
