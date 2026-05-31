'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import Sidebar from '@/components/Sidebar';
import { BELTS, BeltType } from '@/lib/constants';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  UserPlus,
  Phone,
  Calendar,
  AlertTriangle,
  Award,
} from 'lucide-react';

interface CoachData {
  _id: string;
  name: string;
  phone: string;
}

interface PlayerData {
  _id: string;
  name: string;
  birthYear: number;
  age: number;
  belt: BeltType;
  danDegree?: number;
  parentPhone: string;
  registered: boolean;
  coachId: CoachData | null;
  category: string;
  notes?: string;
  trainingDays: string[];
  trainingType?: string;
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

export default function Players() {
  const { t, isRtl } = useLanguage();

  // List states
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [coaches, setCoaches] = useState<CoachData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [beltFilter, setBeltFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [coachFilter, setCoachFilter] = useState('');
  const [regFilter, setRegFilter] = useState('');
  const [trainingTypeFilter, setTrainingTypeFilter] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Active record states
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    birthYear: 2015,
    belt: 'White' as BeltType,
    danDegree: 1,
    parentPhone: '',
    registered: false,
    coachId: '',
    notes: '',
    trainingDays: [] as string[],
    trainingType: '',
  });

  // Fetch players and coaches
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        belt: beltFilter,
        category: categoryFilter,
        coachId: coachFilter,
        registered: regFilter,
        trainingType: trainingTypeFilter,
      });

      const res = await fetch(`/api/players?${query.toString()}`);
      if (!res.ok) throw new Error('Error loading players data');
      const data = await res.json();
      setPlayers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch players list');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const res = await fetch('/api/coaches');
      if (res.ok) {
        const data = await res.json();
        setCoaches(data);
      }
    } catch (err) {
      console.error('Failed to fetch coaches', err);
    }
  };

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, beltFilter, categoryFilter, coachFilter, regFilter, trainingTypeFilter]);

  useEffect(() => {
    fetchCoaches();
  }, []);

  // Handle forms
  const openAddModal = () => {
    setFormData({
      name: '',
      birthYear: 2015,
      belt: 'White',
      danDegree: 1,
      parentPhone: '',
      registered: false,
      coachId: '',
      notes: '',
      trainingDays: [],
      trainingType: '',
    });
    setIsAddOpen(true);
  };

  const openEditModal = (player: PlayerData) => {
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      birthYear: player.birthYear,
      belt: player.belt,
      danDegree: player.danDegree || 1,
      parentPhone: player.parentPhone,
      registered: player.registered,
      coachId: player.coachId?._id || '',
      notes: player.notes || '',
      trainingDays: player.trainingDays || [],
      trainingType: player.trainingType || '',
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (player: PlayerData) => {
    setSelectedPlayer(player);
    setIsDeleteOpen(true);
  };

  const openDetailModal = (player: PlayerData) => {
    setSelectedPlayer(player);
    setIsDetailOpen(true);
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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create player');
      }

      setIsAddOpen(false);
      fetchPlayers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    try {
      const res = await fetch(`/api/players/${selectedPlayer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update player');
      }

      setIsEditOpen(false);
      fetchPlayers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedPlayer) return;

    try {
      const res = await fetch(`/api/players/${selectedPlayer._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete player');

      setIsDeleteOpen(false);
      fetchPlayers();
    } catch (err: any) {
      alert(err.message);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0E0E0E]">
      <Sidebar />

      {/* Content Container */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold uppercase text-[#FF9500]">
              {t('players')}
            </h1>
            <p className="text-xs text-[#828282] tracking-wider uppercase font-mono mt-1">
              إدارة وتتبع وحساب الفئات العمرية والدرجات
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-[#FF9500] hover:bg-[#D90000] text-black hover:text-white font-bold py-2.5 px-4 rounded text-sm transition-colors duration-300 shadow-lg shadow-orange-500/10 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t('addPlayer')}</span>
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search input */}
          <div className="relative">
            <span className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-[#828282]`}>
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
              placeholder={t('search')}
            />
          </div>

          {/* Belt filter */}
          <select
            value={beltFilter}
            onChange={(e) => setBeltFilter(e.target.value)}
            className="bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
          >
            <option value="">كل الأحزمة</option>
            {BELTS.map((belt) => (
              <option key={belt} value={belt}>
                {t(belt as any)}
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
          >
            <option value="">كل الفئات</option>
            <option value="Under 6">أقل من 6 سنوات</option>
            <option value="Under 8">أقل من 8 سنوات</option>
            <option value="Under 10">أقل من 10 سنوات</option>
            <option value="Under 12">أقل من 12 سنة</option>
            <option value="Teens">يافعين (12 - 17 سنة)</option>
            <option value="Adults">كبار (18+ سنة)</option>
          </select>

          {/* Coach filter */}
          <select
            value={coachFilter}
            onChange={(e) => setCoachFilter(e.target.value)}
            className="bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
          >
            <option value="">كل المدربين</option>
            <option value="null">غير معين لمدرب</option>
            {coaches.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Training Type filter */}
          <select
            value={trainingTypeFilter}
            onChange={(e) => setTrainingTypeFilter(e.target.value)}
            className="bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
          >
            <option value="">كل التمارين</option>
            <option value="كاتا">كاتا (Kata)</option>
            <option value="كوميتيه">كوميتيه (Kumite)</option>
            <option value="فتنس">فتنس (Fitness)</option>
            <option value="اختبارات">اختبارات (Exams)</option>
          </select>

          {/* Registration filter */}
          <select
            value={regFilter}
            onChange={(e) => setRegFilter(e.target.value)}
            className="bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
          >
            <option value="">كل الحالات</option>
            <option value="true">مسجل</option>
            <option value="false">غير مسجل</option>
          </select>
        </div>

        {/* Players Directory Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="h-8 w-8 border-4 border-[#FF9500] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        ) : players.length === 0 ? (
          <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded p-8 text-center text-[#828282] text-sm">
            {t('noData')}
          </div>
        ) : (
          <>
            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden lg:block bg-[#1C1B1B] border border-[#2A2A2A] rounded overflow-hidden">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#0E0E0E] border-b border-[#2A2A2A] text-xs font-mono uppercase tracking-wider text-[#828282]">
                    <th className="p-4 font-bold">{t('fullName')}</th>
                    <th className="p-4 font-bold">{t('birthYear')}</th>
                    <th className="p-4 font-bold">{t('age')}</th>
                    <th className="p-4 font-bold">{t('beltLevel')}</th>
                    <th className="p-4 font-bold">{t('trainingType')}</th>
                    <th className="p-4 font-bold">{t('parentPhone')}</th>
                    <th className="p-4 font-bold">{t('registeredStatus')}</th>
                    <th className="p-4 font-bold">{t('assignedCoach')}</th>
                    <th className="p-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A] text-sm">
                  {players.map((player) => (
                    <tr key={player._id} className="hover:bg-[#252424]/40 transition-colors">
                      <td className="p-4 font-bold text-[#F2F2F2]">{player.name}</td>
                      <td className="p-4 font-mono text-xs">{player.birthYear}</td>
                      <td className="p-4 font-mono text-xs text-[#FF9500] font-bold">
                        {player.age}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase ${getBeltColorClass(
                            player.belt
                          )}`}
                        >
                          {t(player.belt as any)}
                          {player.belt === 'Black Belt' && player.danDegree
                            ? ` - دان ${player.danDegree}`
                            : ''}
                        </span>
                      </td>
                      <td className="p-4">
                        {player.trainingType ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF9500]/10 border border-[#FF9500]/20 text-[#FF9500]">
                            {player.trainingType}
                          </span>
                        ) : (
                          <span className="text-xs text-[#828282] font-mono">—</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs">{player.parentPhone}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            player.registered
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {player.registered ? t('activeBadge') : t('inactiveBadge')}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-[#828282]">
                        {player.coachId ? player.coachId.name : t('noCoach')}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailModal(player)}
                            className="p-1.5 rounded bg-zinc-800 text-[#F2F2F2] hover:bg-[#FF9500] hover:text-black transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(player)}
                            className="p-1.5 rounded bg-zinc-800 text-[#F2F2F2] hover:bg-[#FF9500] hover:text-black transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(player)}
                            className="p-1.5 rounded bg-zinc-800 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout (hidden on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {players.map((player) => (
                <div
                  key={player._id}
                  className="bg-[#1C1B1B] border border-[#2A2A2A] rounded p-4 flex flex-col justify-between hover:border-[#FF9500] transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="font-bold text-[#F2F2F2]">{player.name}</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold ${getBeltColorClass(
                          player.belt
                        )}`}
                      >
                        {t(player.belt as any)}
                      </span>
                    </div>

                    <div className="space-y-1 font-mono text-[11px] text-[#828282] mb-4">
                      <p>
                        السنة/العمر:{' '}
                        <span className="text-[#F2F2F2]">
                          {player.birthYear} ({player.age} {t('age')})
                        </span>
                      </p>
                      <p>
                        الفئة: <span className="text-[#FF9500] font-bold">{player.category}</span>
                      </p>
                      <p>
                        نوع التمرين:{' '}
                        <span className="text-emerald-400 font-bold">
                          {player.trainingType || 'غير محدد'}
                        </span>
                      </p>
                      <p>
                        المدرب:{' '}
                        <span className="text-[#F2F2F2]">
                          {player.coachId ? player.coachId.name : t('noCoach')}
                        </span>
                      </p>
                      <p>
                        الهاتف: <span className="text-[#F2F2F2]">{player.parentPhone}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[#2A2A2A]">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                        player.registered
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {player.registered ? t('activeBadge') : t('inactiveBadge')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetailModal(player)}
                        className="p-1.5 rounded bg-zinc-800 text-[#F2F2F2]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(player)}
                        className="p-1.5 rounded bg-zinc-800 text-[#F2F2F2]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(player)}
                        className="p-1.5 rounded bg-zinc-800 text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Add / Edit Player modal */}
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
              <UserPlus className="h-5 w-5" />
              <span>{isAddOpen ? t('addPlayer') : t('editPlayer')}</span>
            </h2>

            <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  placeholder="أحمد علي"
                />
              </div>

              {/* Birth Year & Mobile Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                    {t('birthYear')}
                  </label>
                  <input
                    type="number"
                    required
                    min={1940}
                    max={2026}
                    value={formData.birthYear}
                    onChange={(e) =>
                      setFormData({ ...formData, birthYear: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                    {t('parentPhone')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                    placeholder="0555xxxxxx"
                  />
                </div>
              </div>

              {/* Belt rank & Dan selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                    {t('beltLevel')}
                  </label>
                  <select
                    value={formData.belt}
                    onChange={(e) => setFormData({ ...formData, belt: e.target.value as BeltType })}
                    className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  >
                    {BELTS.map((belt) => (
                      <option key={belt} value={belt}>
                        {t(belt as any)}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.belt === 'Black Belt' && (
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                      {t('danDegree')}
                    </label>
                    <select
                      value={formData.danDegree}
                      onChange={(e) =>
                        setFormData({ ...formData, danDegree: parseInt(e.target.value, 10) })
                      }
                      className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                        <option key={d} value={d}>
                          دان {d}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Assign Coach & Training status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                    {t('assignedCoach')}
                  </label>
                  <select
                    value={formData.coachId}
                    onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                    className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  >
                    <option value="">{t('noCoach')}</option>
                    {coaches.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                    {t('trainingType')}
                  </label>
                  <select
                    value={formData.trainingType || ''}
                    onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
                    className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  >
                    <option value="">غير محدد</option>
                    <option value="كاتا">كاتا (Kata)</option>
                    <option value="كوميتيه">كوميتيه (Kumite)</option>
                    <option value="فتنس">فتنس (Fitness)</option>
                    <option value="اختبارات">اختبارات (Exams)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                    {t('registeredStatus')}
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="registered"
                      checked={formData.registered}
                      onChange={(e) => setFormData({ ...formData, registered: e.target.checked })}
                      className="h-4 w-4 bg-[#0E0E0E] accent-[#FF9500] border border-[#2A2A2A] rounded"
                    />
                    <label htmlFor="registered" className="text-xs text-[#F2F2F2] cursor-pointer">
                      مسجل في الأكاديمية ونشط
                    </label>
                  </div>
                </div>
              </div>

              {/* Training Days */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1.5 font-bold">
                  {t('trainingDays')}
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

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                  {t('notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  placeholder="ملاحظات طبية، مواعيد خاصة..."
                />
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

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm bg-[#1C1B1B] border border-red-500/30 rounded p-6 shadow-glow-red relative underlit-card-red">
            <h3 className="font-heading font-bold text-red-400 text-lg flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5" />
              <span>{t('confirmDelete')}</span>
            </h3>
            <p className="text-xs text-[#828282] mb-6 leading-relaxed">
              {t('deleteWarning')} (<b>{selectedPlayer.name}</b>)
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

      {/* Player details modal */}
      {isDetailOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-[#1C1B1B] border border-[#2A2A2A] rounded p-6 shadow-glow-orange relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded hover:bg-[#2A2A2A] text-[#828282]"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-heading font-extrabold text-[#FF9500] text-lg uppercase tracking-wider mb-4 pb-2 border-b border-[#2A2A2A]">
              {t('playerDetails')}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded bg-[#0E0E0E] flex items-center justify-center border border-[#2A2A2A]">
                  <span className="font-heading font-bold text-[#FF9500] text-lg">
                    {selectedPlayer.name[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-[#F2F2F2]">{selectedPlayer.name}</h4>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-mono font-black uppercase mt-1 ${getBeltColorClass(
                      selectedPlayer.belt
                    )}`}
                  >
                    {t(selectedPlayer.belt as any)}
                    {selectedPlayer.belt === 'Black Belt' && selectedPlayer.danDegree
                      ? ` - دان ${selectedPlayer.danDegree}`
                      : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#0E0E0E] p-4 rounded border border-[#2A2A2A] font-mono text-xs">
                <div>
                  <span className="text-[#828282] block text-[9px] uppercase tracking-wider">
                    سنة الميلاد
                  </span>
                  <span className="text-white font-bold">{selectedPlayer.birthYear}</span>
                </div>
                <div>
                  <span className="text-[#828282] block text-[9px] uppercase tracking-wider">
                    الفئة العمرية
                  </span>
                  <span className="text-[#FF9500] font-bold">{selectedPlayer.category}</span>
                </div>
                <div>
                  <span className="text-[#828282] block text-[9px] uppercase tracking-wider">
                    نوع التمرين
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {selectedPlayer.trainingType || 'غير محدد'}
                  </span>
                </div>
                <div>
                  <span className="text-[#828282] block text-[9px] uppercase tracking-wider">
                    حالة التسجيل
                  </span>
                  <span
                    className={selectedPlayer.registered ? 'text-emerald-400' : 'text-red-400'}
                  >
                    {selectedPlayer.registered ? 'نشط / مسجل' : 'غير مسجل'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#828282] block text-[9px] uppercase tracking-wider">
                    هاتف ولي الأمر
                  </span>
                  <span className="text-white flex items-center gap-1">
                    <Phone className="h-3 w-3 text-[#F2C94C]" />
                    <span>{selectedPlayer.parentPhone}</span>
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                  {t('assignedCoach')}
                </span>
                <p className="text-xs text-[#F2F2F2] bg-[#0E0E0E] p-2.5 rounded border border-[#2A2A2A]">
                  {selectedPlayer.coachId ? selectedPlayer.coachId.name : t('noCoach')}
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                  {t('trainingDays')}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedPlayer.trainingDays && selectedPlayer.trainingDays.length > 0 ? (
                    selectedPlayer.trainingDays.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#FF9500]/10 border border-[#FF9500]/30 text-[#FF9500] rounded"
                      >
                        {t(d as any)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#828282]">لم يتم تحديد أيام</span>
                  )}
                </div>
              </div>

              {selectedPlayer.notes && (
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                    ملاحظات إضافية
                  </span>
                  <p className="text-xs text-[#828282] bg-[#0E0E0E] p-2.5 rounded border border-[#2A2A2A] leading-relaxed whitespace-pre-wrap">
                    {selectedPlayer.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
