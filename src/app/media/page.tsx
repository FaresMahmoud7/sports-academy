'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  Image as ImageIcon,
  Trash2,
  Plus,
  X,
  Award,
  Edit2,
  CheckCircle,
} from 'lucide-react';

interface GalleryItem {
  _id: string;
  imageUrl: string;
  caption?: string;
}

interface Champion {
  _id: string;
  name: string;
  photoUrl: string;
  ageCategory?: string;
  sportCategory?: string;
  achievements?: string;
}

type ActiveTab = 'gallery' | 'champions';

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('gallery');
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Gallery form
  const [galleryForm, setGalleryForm] = useState({ imageUrl: '', caption: '' });
  const [isGalleryFormOpen, setIsGalleryFormOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);

  // Champion form
  const [champForm, setChampForm] = useState({ name: '', photoUrl: '', ageCategory: '', sportCategory: '', achievements: '' });
  const [isChampFormOpen, setIsChampFormOpen] = useState(false);
  const [editingChamp, setEditingChamp] = useState<Champion | null>(null);


  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setGallery(data.gallery || []);
        setChampions(data.champions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ===== GALLERY ACTIONS =====
  const openAddGallery = () => {
    setEditingGallery(null);
    setGalleryForm({ imageUrl: '', caption: '' });
    setIsGalleryFormOpen(true);
  };

  const openEditGallery = (item: GalleryItem) => {
    setEditingGallery(item);
    setGalleryForm({ imageUrl: item.imageUrl, caption: item.caption || '' });
    setIsGalleryFormOpen(true);
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingGallery) {
        await fetch(`/api/gallery/${editingGallery._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(galleryForm),
        });
        showSuccess('تم تحديث الصورة بنجاح ✓');
      } else {
        await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(galleryForm),
        });
        showSuccess('تم إضافة الصورة بنجاح ✓');
      }
      setIsGalleryFormOpen(false);
      fetchMedia();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    showSuccess('تم حذف الصورة ✓');
    fetchMedia();
  };

  // ===== CHAMPION ACTIONS =====
  const openAddChamp = () => {
    setEditingChamp(null);
    setChampForm({ name: '', photoUrl: '', ageCategory: '', sportCategory: '', achievements: '' });
    setIsChampFormOpen(true);
  };

  const openEditChamp = (c: Champion) => {
    setEditingChamp(c);
    setChampForm({ name: c.name, photoUrl: c.photoUrl, ageCategory: c.ageCategory || '', sportCategory: c.sportCategory || '', achievements: c.achievements || '' });
    setIsChampFormOpen(true);
  };

  const handleChampSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingChamp) {
        await fetch(`/api/champions/${editingChamp._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(champForm),
        });
        showSuccess('تم تحديث البطل بنجاح ✓');
      } else {
        await fetch('/api/champions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(champForm),
        });
        showSuccess('تم إضافة البطل بنجاح ✓');
      }
      setIsChampFormOpen(false);
      fetchMedia();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteChamp = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البطل؟')) return;
    await fetch(`/api/champions/${id}`, { method: 'DELETE' });
    showSuccess('تم حذف البطل ✓');
    fetchMedia();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0E0E0E]" dir="rtl">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold uppercase text-[#FF9500]">
              محتوى الموقع
            </h1>
            <p className="text-xs text-[#828282] tracking-wider uppercase font-mono mt-1">
              إدارة معرض الإنجازات وصور الأبطال المعروضة على الموقع
            </p>
          </div>

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono px-4 py-2 rounded">
              <CheckCircle className="h-4 w-4" />
              {successMsg}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[#2A2A2A]">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
              activeTab === 'gallery'
                ? 'border-[#FF9500] text-[#FF9500]'
                : 'border-transparent text-[#828282] hover:text-[#F2F2F2]'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            معرض الإنجازات ({gallery.length})
          </button>
          <button
            onClick={() => setActiveTab('champions')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
              activeTab === 'champions'
                ? 'border-[#FF9500] text-[#FF9500]'
                : 'border-transparent text-[#828282] hover:text-[#F2F2F2]'
            }`}
          >
            <Award className="h-4 w-4" />
            أبطالنا ({champions.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32 text-[#828282] font-mono text-sm">
            <div className="animate-spin h-6 w-6 border-2 border-[#FF9500] border-t-transparent rounded-full mr-3" />
            جاري التحميل...
          </div>
        ) : (
          <>
            {/* ===== GALLERY TAB ===== */}
            {activeTab === 'gallery' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[#828282] text-xs font-mono">
                    الصور المعروضة في قسم &quot;معرض الإنجازات&quot; على الموقع
                  </p>
                  <button
                    onClick={openAddGallery}
                    className="flex items-center gap-2 bg-[#FF9500] hover:bg-[#D90000] text-black hover:text-white font-bold py-2.5 px-4 rounded text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة صورة
                  </button>
                </div>

                {gallery.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-[#2A2A2A] rounded-xl text-[#828282] font-mono text-sm">
                    لا توجد صور في المعرض بعد. أضف أول صورة!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((item) => (
                      <div
                        key={item._id}
                        className="group relative aspect-square bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#FF9500] transition-all duration-300"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.caption || 'gallery'}
                          className="h-full w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity duration-300 p-3">
                          <p className="text-[10px] text-center text-[#F2F2F2] font-mono leading-snug">
                            {item.caption || '—'}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditGallery(item)}
                              className="p-2 rounded bg-[#FF9500] text-black hover:bg-yellow-400 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteGalleryItem(item._id)}
                              className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== CHAMPIONS TAB ===== */}
            {activeTab === 'champions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[#828282] text-xs font-mono">
                    صور وبيانات الأبطال المعروضة في قسم &quot;أبطالنا&quot; على الموقع
                  </p>
                  <button
                    onClick={openAddChamp}
                    className="flex items-center gap-2 bg-[#FF9500] hover:bg-[#D90000] text-black hover:text-white font-bold py-2.5 px-4 rounded text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة بطل
                  </button>
                </div>

                {champions.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-[#2A2A2A] rounded-xl text-[#828282] font-mono text-sm">
                    لا يوجد أبطال مضافون بعد. أضف أول بطل!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {champions.map((champ) => (
                      <div
                        key={champ._id}
                        className="bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-4 flex gap-4 hover:border-[#FF9500] transition-all duration-300"
                      >
                        <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#0E0E0E]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={champ.photoUrl}
                            alt={champ.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#FF9500] text-sm truncate">{champ.name}</h3>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => openEditChamp(champ)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-[#F2F2F2] hover:bg-[#FF9500] hover:text-black text-[10px] font-bold transition-colors"
                            >
                              <Edit2 className="h-3 w-3" /> تعديل
                            </button>
                            <button
                              onClick={() => deleteChamp(champ._id)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-red-400 hover:bg-red-600 hover:text-white text-[10px] font-bold transition-colors"
                            >
                              <Trash2 className="h-3 w-3" /> حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ===== GALLERY FORM MODAL ===== */}
      {isGalleryFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsGalleryFormOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded hover:bg-[#2A2A2A] text-[#828282]"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="font-heading font-extrabold text-[#FF9500] text-lg uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-[#2A2A2A] pb-3">
              <ImageIcon className="h-5 w-5" />
              {editingGallery ? 'تعديل صورة المعرض' : 'إضافة صورة للمعرض'}
            </h2>
            <form onSubmit={handleGallerySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                  رابط الصورة (URL)
                </label>
                <input
                  type="text"
                  required
                  value={galleryForm.imageUrl}
                  onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                  className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  placeholder="/image/photo.jpg  أو  https://..."
                />
                <p className="text-[10px] text-[#828282] mt-1">
                  الصور الموجودة في مجلد public/image تبدأ بـ /image/اسم_الملف
                </p>
              </div>

              {/* Preview */}
              {galleryForm.imageUrl && (
                <div className="h-40 w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryForm.imageUrl}
                    alt="preview"
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                  وصف الصورة (اختياري)
                </label>
                <input
                  type="text"
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                  className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  placeholder="جانب من فعاليات أكاديمية الأبطال"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setIsGalleryFormOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[#F2F2F2] text-xs font-bold rounded"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#FF9500] hover:bg-[#D90000] text-black hover:text-white text-xs font-bold rounded disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CHAMPION FORM MODAL ===== */}
      {isChampFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
          <div className="w-full max-w-md bg-[#1C1B1B] border border-[#2A2A2A] rounded-xl p-6 shadow-2xl relative my-4">
            <button
              onClick={() => setIsChampFormOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded hover:bg-[#2A2A2A] text-[#828282]"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="font-heading font-extrabold text-[#FF9500] text-lg uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-[#2A2A2A] pb-3">
              <Award className="h-5 w-5" />
              {editingChamp ? 'تعديل بيانات البطل' : 'إضافة بطل جديد'}
            </h2>
            <form onSubmit={handleChampSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                  اسم البطل *
                </label>
                <input
                  type="text"
                  required
                  value={champForm.name}
                  onChange={(e) => setChampForm({ ...champForm, name: e.target.value })}
                  className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  placeholder="أحمد محمد علي"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#828282] mb-1 font-bold">
                  رابط الصورة (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={champForm.photoUrl}
                  onChange={(e) => setChampForm({ ...champForm, photoUrl: e.target.value })}
                  className="w-full bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-2 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  placeholder="/image/champion.jpg  أو  https://..."
                />
              </div>

              {/* Preview */}
              {champForm.photoUrl && (
                <div className="h-32 w-32 mx-auto bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={champForm.photoUrl}
                    alt="preview"
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}





              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setIsChampFormOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[#F2F2F2] text-xs font-bold rounded"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#FF9500] hover:bg-[#D90000] text-black hover:text-white text-xs font-bold rounded disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
