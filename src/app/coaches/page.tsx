'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import Sidebar from '@/components/Sidebar';
import {
  Trophy,
  Phone,
  Clock,
  Users,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  AlertTriangle,
  Search,
} from 'lucide-react';

interface PlayerData {
  _id: string;
  name: string;
  belt: string;
  fileNumber?: string;
}

interface CoachData {
  _id: string;
  name: string;
  phone: string;
  trainingDays: string[];
  trainingTime: string;
  players: PlayerData[];
}

const DAYS_OF_WEEK = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export default function Coaches() {
  const { t, isRtl } = useLanguage();

  // List states
  const [coaches, setCoaches] = useState<CoachData[]>([]);
  const [allPlayers, setAllPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');

  // UI state
  const [expandedCoaches, setExpandedCoaches] = useState<Record<string, boolean>>({});

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<CoachData | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    trainingTime: '18:00',
    trainingDays: [] as string[],
    players: [] as string[], // IDs of assigned players
  });

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coaches');
      if (!res.ok) throw new Error('Error loading coaches data');
      const data = await res.json();
      setCoaches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch coaches list');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPlayers = async () => {
    try {
      const res = await fetch('/api/players');
      if (res.ok) {
        const data = await res.json();
        setAllPlayers(data);
      }
    } catch (err) {
      console.error('Failed to fetch players', err);
    }
  };

  useEffect(() => {
    fetchCoaches();
    fetchAllPlayers();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedCoaches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Action handlers
  const openAddModal = () => {
    setFormData({
      name: '',
      phone: '',
      trainingTime: '18:00',
      trainingDays: [],
      players: [],
    });
    setPlayerSearch('');
    setIsAddOpen(true);
  };

  const openEditModal = (coach: CoachData) => {
    setSelectedCoach(coach);
    setFormData({
      name: coach.name,
      phone: coach.phone,
      trainingTime: coach.trainingTime,
      trainingDays: coach.trainingDays || [],
      players: coach.players ? coach.players.map((p) => p._id) : [],
    });
    setPlayerSearch('');
    setIsEditOpen(true);
  };

  const openDeleteModal = (coach: CoachData) => {
    setSelectedCoach(coach);
    setIsDeleteOpen(true);
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const isSelected = prev.trainingDays.includes(day);
      const updated = isSelected
        ? prev.trainingDays.filter((d) => d !== day)
        : [...prev.trainingDays, day];
      return { ...prev, trainingDays: updated };
    });
  };

  const handlePlayerToggle = (pid: string) => {
    setFormData((prev) => {
      const isSelected = prev.players.includes(pid);
      const updated = isSelected
        ? prev.players.filter((id) => id !== pid)
        : [...prev.players, pid];
      return { ...prev, players: updated };
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create coach');
      }

      setIsAddOpen(false);
      fetchCoaches();
      fetchAllPlayers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach) return;

    try {
      const res = await fetch(`/api/coaches/${selectedCoach._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update coach');
      }

      setIsEditOpen(false);
      fetchCoaches();
      fetchAllPlayers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedCoach) return;

    try {
      const res = await fetch(`/api/coaches/${selectedCoach._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete coach');

      setIsDeleteOpen(false);
      fetchCoaches();
      fetchAllPlayers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter coaches locally based on search
  const filteredCoaches = coaches.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0E0E0E]">
      <Sidebar />

      {/* Content Container */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold uppercase text-[#FF9500]">
              {t('coaches')}
            </h1>
            <p className="text-xs text-[#828282] tracking-wider uppercase font-mono mt-1">
              إدارة مدربي الفئات والجدولة الزمنية للتمارين
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-[#FF9500] hover:bg-[#D90000] text-black hover:text-white font-bold py-2.5 px-4 rounded text-sm transition-colors duration-300 shadow-lg shadow-orange-500/10 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t('addCoach')}</span>
          </button>
        </div>

        {/* Search filter */}
        <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded p-4 mb-6">
          <div className="relative max-w-md">
            <span className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-[#828282]`}>
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
              placeholder="البحث عن اسم المدرب..."
            />
          </div>
        </div>

        {/* Coaches Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="h-8 w-8 border-4 border-[#FF9500] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded p-8 text-center text-[#828282] text-sm">
            {t('noData')}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCoaches.map((coach) => {
              const isExpanded = !!expandedCoaches[coach._id];
              return (
                <div
                  key={coach._id}
                  className="bg-[#1C1B1B] border border-[#2A2A2A] hover:border-[#FF9500] rounded p-5 transition-colors relative flex flex-col justify-between"
                >
                  <div>
                    {/* Head */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-[#FF9500]/10 border border-[#FF9500]/30 text-[#FF9500] flex items-center justify-center">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#F2F2F2] text-base">{coach.name}</h3>
                          <p className="text-[11px] text-[#828282] font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-[#F2C94C]" />
                            <span>{coach.phone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(coach)}
                          className="p-1.5 rounded bg-zinc-800 text-[#F2F2F2] hover:bg-[#FF9500] hover:text-black transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(coach)}
                          className="p-1.5 rounded bg-zinc-800 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Schedule Block */}
                    <div className="bg-[#0E0E0E] border border-[#2A2A2A] rounded p-3 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#FF9500]" />
                        <span className="font-mono text-xs font-bold text-white">
                          {coach.trainingTime}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#828282]">
                        {t('trainingTime')}
                      </span>
                    </div>

                    {/* Weekly Schedule Visual Grid */}
                    <div className="space-y-1.5 mb-4">
                      <span className="block text-[9px] font-mono uppercase tracking-wider text-[#828282] font-bold">
                        {t('weeklySchedule')}
                      </span>
                      <div className="flex gap-1">
                        {DAYS_OF_WEEK.map((day) => {
                          const isActive = coach.trainingDays.includes(day);
                          // Arabic single letter abbreviation: السبت (س)، الأحد (ح)، الاثنين (ن)، الثلاثاء (ث)، الأربعاء (ر)، الخميس (خ)، الجمعة (ج)
                          const getLetter = (d: string) => {
                            if (d === 'Saturday') return 'س';
                            if (d === 'Sunday') return 'ح';
                            if (d === 'Monday') return 'ن';
                            if (d === 'Tuesday') return 'ث';
                            if (d === 'Wednesday') return 'ر';
                            if (d === 'Thursday') return 'خ';
                            return 'ج';
                          };
                          return (
                            <div
                              key={day}
                              title={t(day as any)}
                              className={`flex-1 text-center py-1 rounded text-[10px] font-bold font-mono transition-all border ${
                                isActive
                                  ? 'bg-[#FF9500]/15 text-[#FF9500] border-[#FF9500]/40'
                                  : 'bg-[#0E0E0E] text-zinc-700 border-[#2A2A2A]'
                              }`}
                            >
                              {getLetter(day)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Assigned Players List */}
                  <div className="mt-4 pt-3 border-t border-[#2A2A2A]">
                    <button
                      onClick={() => toggleExpand(coach._id)}
                      className="flex items-center justify-between w-full text-xs font-mono text-[#828282] hover:text-white"
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        <Users className="h-4 w-4 text-[#F2C94C]" />
                        <span>
                          {t('assignedPlayers')} ({coach.players ? coach.players.length : 0})
                        </span>
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {coach.players && coach.players.length > 0 ? (
                          coach.players.map((p) => (
                            <div
                              key={p._id}
                              className="flex items-center justify-between p-2 rounded bg-[#0E0E0E] border border-[#2A2A2A] text-xs"
                            >
                              <span className="font-semibold text-[#F2F2F2]">{p.name}</span>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#FF9500]/10 text-[#FF9500]">
                                {t(p.belt as any)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-zinc-600 italic py-2 text-center">
                            {t('noPlayers')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Coach Modal */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#1C1B1B] border border-[#2A2A2A] rounded p-6 shadow-glow-orange max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
              }}
              className="absolute top-4 left-4 p-1.5 rounded hover:bg-[#2A2A2A] text-[#828282]"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="font-heading font-extrabold text-[#FF9500] text-lg uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-[#2A2A2A] pb-3">
              <Trophy className="h-5 w-5" />
              <span>{isAddOpen ? t('addCoach') : t('editCoach')}</span>
            </h2>

            <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4">
              {/* Coach Name */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                  {t('coachName')}
                </label>
                <input
                  type="text"
                  required={isAddOpen}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  placeholder="الكابتن محمد"
                />
              </div>

              {/* Phone & Training Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                    {t('phone')}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                    placeholder="0599xxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                    {t('trainingTime')}
                  </label>
                  <input
                    type="text"
                    value={formData.trainingTime}
                    onChange={(e) => setFormData({ ...formData, trainingTime: e.target.value })}
                    className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                    placeholder="18:00 - 20:00"
                  />
                </div>
              </div>

              {/* Training Days */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1.5 font-bold">
                  أيام التدريب الأسبوعية
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const active = formData.trainingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-2 py-1.5 text-[10px] font-mono font-semibold rounded border transition-all ${
                          active
                            ? 'bg-[#FF9500] text-black border-[#FF9500]'
                            : 'bg-[#0E0E0E] text-[#828282] border-[#2A2A2A] hover:border-zinc-700'
                        }`}
                      >
                        {t(day as any)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assign Players multi-select */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1.5 font-bold flex items-center justify-between">
                  <span>تعيين لاعبي الأكاديمية للمدرب</span>
                  <span className="text-[9px] text-zinc-500 font-normal">اختر اللاعبين ليتم ربطهم تلقائياً</span>
                </label>

                <div className="mb-2 relative">
                  <input
                    type="text"
                    placeholder="ابحث باسم اللاعب أو رقم الملف..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500] pr-8"
                  />
                  <Search className="h-3.5 w-3.5 text-[#828282] absolute top-1/2 -translate-y-1/2 right-3" />
                </div>

                <div className="border border-[#2A2A2A] bg-[#0E0E0E] rounded p-3 max-h-40 overflow-y-auto space-y-1">
                  {allPlayers.filter(p => p.name.includes(playerSearch) || (p.fileNumber && p.fileNumber.includes(playerSearch))).length === 0 ? (
                    <p className="text-[10px] text-zinc-600 text-center py-2">لا يوجد لاعبون مطابقون</p>
                  ) : (
                    allPlayers.filter(p => p.name.includes(playerSearch) || (p.fileNumber && p.fileNumber.includes(playerSearch))).map((player) => {
                      const isSelected = formData.players.includes(player._id);
                      return (
                        <button
                          key={player._id}
                          type="button"
                          onClick={() => handlePlayerToggle(player._id)}
                          className={`w-full flex items-center justify-between p-2 rounded text-xs transition-colors ${
                            isSelected
                              ? 'bg-[#FF9500]/10 border border-[#FF9500]/30 text-[#FF9500]'
                              : 'bg-transparent border border-transparent text-[#F2F2F2] hover:bg-[#1C1B1B]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{player.name}</span>
                            {player.fileNumber && (
                              <span className="text-[9px] text-[#828282] font-mono">#{player.fileNumber}</span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded">
                            {t(player.belt as any)}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[#F2F2F2] text-xs font-bold rounded"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF9500] hover:bg-[#D90000] text-black hover:text-white text-xs font-bold rounded"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Coach Confirmation Modal */}
      {isDeleteOpen && selectedCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm bg-[#1C1B1B] border border-red-500/30 rounded p-6 shadow-glow-red relative underlit-card-red">
            <h3 className="font-heading font-bold text-red-400 text-lg flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5" />
              <span>{t('confirmDelete')}</span>
            </h3>
            <p className="text-xs text-[#828282] mb-6 leading-relaxed">
              هل أنت متأكد أنك تريد حذف المدرب <b>{selectedCoach.name}</b>؟ سيتم إلغاء ربطه تلقائياً من جميع اللاعبين المرتبطين به.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-3 py-1.5 bg-zinc-800 text-xs font-bold rounded"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
