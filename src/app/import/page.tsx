'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import Sidebar from '@/components/Sidebar';
import { BELTS } from '@/lib/constants';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Database,
  Trash2,
  Edit,
  Clipboard,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ValidatedPlayer {
  name: string;
  birthYear: number | string;
  age?: number;
  belt: string;
  parentPhone: string;
  registered: boolean;
  category?: string;
  errors: string[];
  isDuplicate: boolean;
}

export default function ImportPlayers() {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [importRows, setImportRows] = useState<ValidatedPlayer[]>([]);
  const [manualText, setManualText] = useState('');
  const [coaches, setCoaches] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [importReport, setImportReport] = useState<{
    successCount: number;
    failCount: number;
    duplicatesSkipped: number;
  } | null>(null);

  useEffect(() => {
    async function loadCoaches() {
      try {
        const res = await fetch('/api/coaches');
        if (res.ok) {
          const data = await res.json();
          setCoaches(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCoaches();
  }, []);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setLoading(true);
    setProgress(10);
    setImportReport(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      setProgress(40);
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Parse sheet to JSON array
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setProgress(70);

        // Header mapping
        // Expected headers: Name, Birth Year, Belt, Parent Phone, Registered Status
        // Skip first row as header if it contains names like 'الاسم' or 'name'
        let startIndex = 0;
        if (json.length > 0) {
          const firstRowStr = JSON.stringify(json[0]).toLowerCase();
          if (firstRowStr.includes('name') || firstRowStr.includes('الاسم') || firstRowStr.includes('اسم')) {
            startIndex = 1;
          }
        }

        const parsedRows = json.slice(startIndex).map((row) => {
          return {
            name: String(row[0] || '').trim(),
            birthYear: String(row[1] || '').trim(),
            belt: String(row[2] || 'White').trim(),
            parentPhone: String(row[3] || '').trim(),
            registered: String(row[4] || '').trim(),
          };
        }).filter(r => r.name !== '');

        await validatePlayersList(parsedRows);
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف الـ Excel. يرجى التأكد من الصيغة.');
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validatePlayersList = async (list: any[]) => {
    try {
      setProgress(85);
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate',
          players: list,
        }),
      });

      if (!res.ok) throw new Error('فشل التحقق من البيانات');
      const data = await res.json();
      setImportRows(data.validatedPlayers || []);
      setProgress(100);
    } catch (err: any) {
      alert(err.message || 'Error validating import data');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  // Clipboard copy-paste text parsing (CSV or tab-separated text)
  const handleParseClipboard = async () => {
    if (!manualText.trim()) return;
    setLoading(true);
    setProgress(50);
    setImportReport(null);

    try {
      // Split lines and parse CSV
      const lines = manualText.split('\n');
      const parsedRows = lines
        .map((line) => {
          // split by comma or tab
          const cols = line.includes('\t') ? line.split('\t') : line.split(',');
          if (cols.length < 2) return null;
          return {
            name: cols[0]?.trim() || '',
            birthYear: cols[1]?.trim() || '',
            belt: cols[2]?.trim() || 'White',
            parentPhone: cols[3]?.trim() || '',
            registered: cols[4]?.trim() || '',
          };
        })
        .filter((r) => r !== null && r.name !== '');

      await validatePlayersList(parsedRows);
      setManualText('');
    } catch (err) {
      alert('خطأ في معالجة النص المنسوخ');
      setLoading(false);
    }
  };

  const handleCellEdit = (index: number, field: keyof ValidatedPlayer, value: any) => {
    setImportRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Clear specific error if fixed manually
      if (field === 'name' && value.trim()) {
        updated[index].errors = updated[index].errors.filter((e) => !e.includes('الاسم'));
      }
      if (field === 'birthYear' && !isNaN(value) && value >= 1940) {
        updated[index].errors = updated[index].errors.filter((e) => !e.includes('الميلاد'));
      }
      if (field === 'parentPhone' && value.trim()) {
        updated[index].errors = updated[index].errors.filter((e) => !e.includes('هاتف'));
      }
      
      return updated;
    });
  };

  const handleRemoveRow = (index: number) => {
    setImportRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveImport = async () => {
    if (importRows.length === 0) return;

    // Check if there are any blocking errors
    const hasErrors = importRows.some((r) => r.errors.length > 0);
    if (hasErrors) {
      if (!confirm('بعض الأسطر تحتوي على أخطاء تحقق. هل تريد المتابعة وتخطي هذه الأسطر أو حفظها بالقيم التلقائية؟')) {
        return;
      }
    }

    setLoading(true);
    try {
      const playersToCommit = importRows.map((r) => ({
        name: r.name,
        birthYear: Number(r.birthYear),
        belt: r.belt,
        parentPhone: r.parentPhone,
        registered: r.registered,
        coachId: selectedCoachId || null,
      }));

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'commit',
          players: playersToCommit,
        }),
      });

      if (!res.ok) throw new Error('Failed to save players database');
      const data = await res.json();
      setImportReport(data.results);
      setImportRows([]);
    } catch (err: any) {
      alert(err.message || 'Error saving imported database');
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
              {t('import')}
            </h1>
            <p className="text-xs text-[#828282] tracking-wider uppercase font-mono mt-1">
              استيراد قاعدة بيانات اللاعبين دفعة واحدة عبر ملفات Excel
            </p>
          </div>
        </div>

        {importReport && (
          <div className="mb-6 p-5 bg-[#1C1B1B] border border-[#2A2A2A] rounded relative overflow-hidden underlit-card-orange">
            <h3 className="text-sm font-bold text-[#FF9500] mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>{t('importReport')}</span>
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center font-mono text-xs">
              <div className="p-3 bg-[#0E0E0E] rounded border border-[#2A2A2A]">
                <span className="text-[#828282] block text-[9px] uppercase">تم إدخالهم بنجاح</span>
                <span className="text-emerald-400 font-extrabold text-lg">
                  {importReport.successCount}
                </span>
              </div>
              <div className="p-3 bg-[#0E0E0E] rounded border border-[#2A2A2A]">
                <span className="text-[#828282] block text-[9px] uppercase">المتخطي (مكرر)</span>
                <span className="text-[#FF9500] font-extrabold text-lg">
                  {importReport.duplicatesSkipped}
                </span>
              </div>
              <div className="p-3 bg-[#0E0E0E] rounded border border-[#2A2A2A]">
                <span className="text-[#828282] block text-[9px] uppercase">فشل إدخالهم</span>
                <span className="text-red-500 font-extrabold text-lg">
                  {importReport.failCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Upload Container area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Uploader Box */}
          <div className="lg:col-span-2">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#FF9500] bg-[#FF9500]/5 shadow-glow-orange'
                  : 'border-[#2A2A2A] bg-[#1C1B1B] hover:border-zinc-700'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                multiple={false}
                accept=".xlsx, .xls"
                onChange={handleFileInput}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="h-10 w-10 text-[#FF9500] mx-auto mb-3 animate-pulse" />
                <p className="font-bold text-sm text-[#F2F2F2] mb-1">
                  {t('importDragDrop')}
                </p>
                <p className="text-xs text-[#828282]">{t('importExcelOnly')}</p>
              </label>
            </div>

            {loading && progress > 0 && (
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs font-mono text-[#828282]">
                  <span>{t('importProgress')}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-[#1C1B1B] rounded overflow-hidden border border-[#2A2A2A]">
                  <div
                    className="h-full bg-[#FF9500] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Manual Clipboard box */}
          <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#FF9500] mb-2 flex items-center gap-2">
                <Clipboard className="h-4 w-4 text-[#F2C94C]" />
                <span>{t('pasteTextTitle')}</span>
              </h3>
              <p className="text-[10px] text-[#828282] mb-3 leading-relaxed">
                يمكنك نسخ جدول البيانات من ملف PDF أو مستند نصي ولصقه هنا مباشرة. افصل بين الأعمدة بـ
                فاصلة أو Tab.
              </p>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={t('pastePlaceholder')}
                rows={4}
                className="w-full bg-[#0E0E0E] text-[10px] font-mono border border-[#2A2A2A] rounded p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500] placeholder-zinc-700"
              />
            </div>
            <button
              onClick={handleParseClipboard}
              disabled={loading || !manualText.trim()}
              className="mt-3 w-full bg-zinc-800 hover:bg-[#FF9500] hover:text-black text-white font-bold py-2 px-3 rounded text-xs transition-colors"
            >
              {t('parseTextBtn')}
            </button>
          </div>
        </div>

        {/* Preview and Edit Section */}
        {importRows.length > 0 && (
          <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded p-5 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#2A2A2A]">
              <div>
                <h3 className="font-heading font-bold text-lg text-white">
                  {t('importPreview')}
                </h3>
                <p className="text-[11px] text-[#828282] mt-0.5">
                  الأسطر المستوردة: {importRows.length} | يمكنك تعديل الخلايا الخاطئة مباشرة
                </p>
              </div>

              {/* Action and global Coach selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#828282] uppercase whitespace-nowrap">
                    تعيين لمدرب مشترك:
                  </span>
                  <select
                    value={selectedCoachId}
                    onChange={(e) => setSelectedCoachId(e.target.value)}
                    className="bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-3 py-1.5 text-[#F2F2F2] focus:outline-none focus:border-[#FF9500]"
                  >
                    <option value="">لا يوجد مدرب مشترك</option>
                    {coaches.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveImport}
                  className="bg-[#FF9500] hover:bg-emerald-500 hover:text-white text-black font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/10 flex items-center gap-2 justify-center"
                >
                  <Database className="h-4 w-4" />
                  <span>{t('importCommit')}</span>
                </button>
              </div>
            </div>

            {/* Editable Preview Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0E0E0E] border-b border-[#2A2A2A] text-[#828282]">
                    <th className="p-3 font-bold">الاسم الكامل</th>
                    <th className="p-3 font-bold">سنة الميلاد</th>
                    <th className="p-3 font-bold">مستوى الحزام</th>
                    <th className="p-3 font-bold">هاتف ولي الأمر</th>
                    <th className="p-3 font-bold text-center">مسجل</th>
                    <th className="p-3 font-bold text-center">الحالة / أخطاء التحقق</th>
                    <th className="p-3 font-bold text-center">تعديل/إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {importRows.map((row, index) => {
                    const hasError = row.errors.length > 0;
                    return (
                      <tr
                        key={index}
                        className={`hover:bg-[#252424]/40 transition-colors ${
                          row.isDuplicate ? 'bg-amber-950/15' : hasError ? 'bg-red-950/10' : ''
                        }`}
                      >
                        {/* Name input */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleCellEdit(index, 'name', e.target.value)}
                            className="bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-2.5 py-1 w-48 text-[#F2F2F2] focus:border-[#FF9500] focus:outline-none"
                          />
                        </td>

                        {/* Birth Year input */}
                        <td className="p-2">
                          <input
                            type="number"
                            value={row.birthYear}
                            onChange={(e) =>
                              handleCellEdit(index, 'birthYear', parseInt(e.target.value, 10))
                            }
                            className="bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-2.5 py-1 w-20 text-center text-[#F2F2F2] focus:border-[#FF9500] focus:outline-none"
                          />
                        </td>

                        {/* Belt dropdown */}
                        <td className="p-2">
                          <select
                            value={row.belt}
                            onChange={(e) => handleCellEdit(index, 'belt', e.target.value)}
                            className="bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-2 py-1 text-[#F2F2F2] focus:border-[#FF9500] focus:outline-none"
                          >
                            {BELTS.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Parent Phone input */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.parentPhone}
                            onChange={(e) => handleCellEdit(index, 'parentPhone', e.target.value)}
                            className="bg-[#0E0E0E] text-xs border border-[#2A2A2A] rounded px-2.5 py-1 w-32 text-[#F2F2F2] focus:border-[#FF9500] focus:outline-none"
                          />
                        </td>

                        {/* Registered toggle */}
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={row.registered}
                            onChange={(e) => handleCellEdit(index, 'registered', e.target.checked)}
                            className="accent-[#FF9500] h-4 w-4"
                          />
                        </td>

                        {/* Validation state / duplicate badge */}
                        <td className="p-2 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {row.isDuplicate && (
                              <span className="px-2 py-0.5 rounded text-[8px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                                {t('duplicateDetected')}
                              </span>
                            )}
                            {hasError ? (
                              row.errors.map((err, errIdx) => (
                                <span
                                  key={errIdx}
                                  className="text-[9px] text-red-400 flex items-center gap-1 font-semibold"
                                >
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                  <span>{err}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-emerald-400 font-bold">✓ جاهز للحفظ</span>
                            )}
                          </div>
                        </td>

                        {/* Remove action button */}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveRow(index)}
                            className="p-1 rounded bg-zinc-800 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
