'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import Sidebar from '@/components/Sidebar';
import { Calendar, Users, Award, Shield } from 'lucide-react';

interface PlayerData {
  _id: string;
  name: string;
  birthYear: number;
  age: number;
  belt: string;
  registered: boolean;
  coachId: { name: string } | null;
  category: string;
}

const CATEGORIES = [
  { key: 'Under 6', nameAr: 'براعم (أقل من 6 سنوات)', nameEn: 'Under 6 Years' },
  { key: 'Under 8', nameAr: 'أطفال (6 - 7 سنوات)', nameEn: 'Under 8 Years' },
  { key: 'Under 10', nameAr: 'أمل (8 - 9 سنوات)', nameEn: 'Under 10 Years' },
  { key: 'Under 12', nameAr: 'أشبال (10 - 11 سنة)', nameEn: 'Under 12 Years' },
  { key: 'Teens', nameAr: 'يافعين (12 - 17 سنة)', nameEn: 'Teens (12 - 17 Years)' },
  { key: 'Adults', nameAr: 'كبار (18+ سنة)', nameEn: 'Adults (18+ Years)' },
];

export default function Categories() {
  const { t, language } = useLanguage();
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Under 8');

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await fetch('/api/players');
        if (res.ok) {
          const data = await res.json();
          setPlayers(data);
        }
      } catch (err) {
        console.error('Failed to load players for categories', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  const getBeltColorClass = (beltName: string) => {
    switch (beltName) {
      case 'White':
        return 'bg-white text-black border border-zinc-400';
      case 'Yellow 1':
      case 'Yellow 2':
      case 'Yellow 3':
        return 'bg-yellow-400 text-black border border-yellow-500';
      case 'Orange 1':
      case 'Orange 2':
      case 'Orange 3':
        return 'bg-orange-500 text-black border border-orange-600';
      case 'Green 1':
        return 'bg-green-600 text-white border border-green-700';
      case 'Blue 1':
        return 'bg-blue-600 text-white border border-blue-700';
      case 'Brown 1':
      case 'Brown 2':
        return 'bg-[#78350F] text-white border border-[#5F2B0B]';
      case 'Black Belt':
        return 'bg-black text-[#FF9500] border border-[#FF9500] shadow-glow-orange';
      default:
        return 'bg-zinc-700 text-white';
    }
  };

  // Group players by category dynamically
  const categoryPlayers = players.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0E0E0E]">
      <Sidebar />

      {/* Content Container */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold uppercase text-[#FF9500]">
              {t('categories')}
            </h1>
            <p className="text-xs text-[#828282] tracking-wider uppercase font-mono mt-1">
              تصنيف اللاعبين تلقائياً وتوزيعهم حسب العمر
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1C1B1B] border border-[#2A2A2A]">
            <Users className="h-4 w-4 text-[#F2C94C]" />
            <span className="font-mono text-xs text-white">إجمالي اللاعبين: {players.length}</span>
          </div>
        </div>

        {/* Category Tabs Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            const count = players.filter((p) => p.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`p-3 text-center rounded border transition-all duration-300 ${
                  isActive
                    ? 'bg-[#FF9500] border-[#FF9500] text-black shadow-glow-orange'
                    : 'bg-[#1C1B1B] border-[#2A2A2A] text-[#F2F2F2] hover:border-zinc-700'
                }`}
              >
                <span className="block text-xs font-bold truncate">
                  {language === 'ar' ? cat.nameAr : cat.nameEn}
                </span>
                <span
                  className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isActive ? 'bg-black text-[#FF9500]' : 'bg-[#0E0E0E] text-[#828282]'
                  }`}
                >
                  {count} لاعب
                </span>
              </button>
            );
          })}
        </div>

        {/* Players List in Selected Category */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="h-8 w-8 border-4 border-[#FF9500] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categoryPlayers.length === 0 ? (
          <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded p-12 text-center text-[#828282] text-sm">
            لا يوجد لاعبين مصنفين في هذه الفئة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryPlayers.map((player) => (
              <div
                key={player._id}
                className="bg-[#1C1B1B] border border-[#2A2A2A] hover:border-[#FF9500] rounded p-5 transition-all duration-200 shadow-sm"
              >
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h3 className="font-bold text-[#F2F2F2] text-sm">{player.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase ${getBeltColorClass(
                      player.belt
                    )}`}
                  >
                    {t(player.belt as any)}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[10px] text-[#828282] mb-3">
                  <div className="flex justify-between">
                    <span>تاريخ الميلاد / السن:</span>
                    <span className="text-[#F2F2F2]">
                      {player.birthYear} ({player.age} سنة)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>المدرب المسؤول:</span>
                    <span className="text-[#F2F2F2]">
                      {player.coachId ? player.coachId.name : 'غير معين'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>حالة اللاعب:</span>
                    <span className={player.registered ? 'text-emerald-400' : 'text-red-400'}>
                      {player.registered ? 'مسجل' : 'غير مسجل'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
