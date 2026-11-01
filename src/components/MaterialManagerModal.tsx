import React, { useMemo, useState } from 'react';
import {
  ALL_CURRICULUM_CHAPTERS,
  CognitiveLevel,
  InformaticsMaterial,
  InformaticsQuestion,
  KELAS_7_CHAPTERS,
  KELAS_8_CHAPTERS,
  MaterialCategory,
  OptionKey,
} from '../data/informaticsData';
import {
  BookOpen,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  CheckSquare,
  Square,
} from 'lucide-react';

interface MaterialManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: InformaticsMaterial[];
  questions: InformaticsQuestion[];
  enabledQuestionIds: string[];
  onUpdateEnabledQuestions: (ids: string[]) => void;
  questionCountLimit?: number;
  onUpdateQuestionCountLimit?: (limit: number) => void;
  onSaveMaterial: (material: InformaticsMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  onSaveQuestion: (question: InformaticsQuestion) => void;
  onDeleteQuestion: (id: string) => void;
}

const CATEGORIES: MaterialCategory[] = ALL_CURRICULUM_CHAPTERS;

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50, 0] as const;
const PER_CHAPTER_COUNT_OPTIONS = [5, 10, 15, 20] as const;

const COGNITIVE_LEVELS: CognitiveLevel[] = [
  'C1 - Mengingat',
  'C2 - Memahami',
  'C3 - Menerapkan',
  'C4 - Menganalisis',
  'C5 - Mengevaluasi',
  'C6 - Mencipta',
];

export const MaterialManagerModal: React.FC<MaterialManagerModalProps> = ({
  isOpen,
  onClose,
  materials,
  questions,
  enabledQuestionIds,
  onUpdateEnabledQuestions,
  questionCountLimit = 0,
  onUpdateQuestionCountLimit,
  onSaveMaterial,
  onDeleteMaterial,
  onSaveQuestion,
  onDeleteQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<
    'KONFIGURASI_SOAL' | 'MATERI' | 'SOAL' | 'TAMBAH_MATERI' | 'TAMBAH_SOAL'
  >('KONFIGURASI_SOAL');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'Kelas 7' | 'Kelas 8'>('ALL');
  const [configChapterFilter, setConfigChapterFilter] = useState<string>('ALL');

  // Effective set of enabled question IDs (if empty array, all questions are considered enabled)
  const effectiveEnabledSet = useMemo(() => {
    if (!enabledQuestionIds || enabledQuestionIds.length === 0) {
      return new Set(questions.map((q) => q.id));
    }
    const validIds = enabledQuestionIds.filter((id) => questions.some((q) => q.id === id));
    if (validIds.length === 0) {
      return new Set(questions.map((q) => q.id));
    }
    return new Set(validIds);
  }, [enabledQuestionIds, questions]);

  const handleToggleSingleQuestion = (qId: string) => {
    const next = new Set(effectiveEnabledSet);
    if (next.has(qId)) {
      if (next.size <= 1) {
        showToast('Minimal harus ada 1 soal yang aktif untuk dimainkan siswa.');
        return;
      }
      next.delete(qId);
    } else {
      next.add(qId);
    }
    onUpdateEnabledQuestions(Array.from(next));
  };

  const handleToggleChapterGroup = (grade: 'Kelas 7' | 'Kelas 8', chapter: MaterialCategory) => {
    const chapterQs = questions.filter(
      (q) => q.gradeLevel === grade && q.category === chapter
    );
    if (chapterQs.length === 0) return;

    const allCurrentlySelected = chapterQs.every((q) => effectiveEnabledSet.has(q.id));
    const next = new Set(effectiveEnabledSet);

    if (allCurrentlySelected) {
      for (const q of chapterQs) {
        next.delete(q.id);
      }
      if (next.size === 0) {
        showToast('Minimal harus ada 1 bab/soal yang aktif untuk dimainkan.');
        return;
      }
    } else {
      for (const q of chapterQs) {
        next.add(q.id);
      }
    }

    onUpdateEnabledQuestions(Array.from(next));
    showToast(
      allCurrentlySelected
        ? `${chapter} (${grade}) dinonaktifkan dari sesi permainan.`
        : `${chapter} (${grade}) diaktifkan untuk dimainkan siswa!`
    );
  };

  const handleQuickPresetSelect = (preset: 'ALL' | 'KELAS_7' | 'KELAS_8') => {
    if (preset === 'ALL') {
      onUpdateEnabledQuestions(questions.map((q) => q.id));
      showToast('Semua materi & soal Kelas 7 dan Kelas 8 diaktifkan!');
    } else if (preset === 'KELAS_7') {
      const k7Ids = questions.filter((q) => q.gradeLevel === 'Kelas 7').map((q) => q.id);
      onUpdateEnabledQuestions(k7Ids);
      setGradeFilter('Kelas 7');
      showToast('Hanya materi & soal Kelas 7 (Bab 1 – Bab 9) yang diaktifkan!');
    } else if (preset === 'KELAS_8') {
      const k8Ids = questions.filter((q) => q.gradeLevel === 'Kelas 8').map((q) => q.id);
      onUpdateEnabledQuestions(k8Ids);
      setGradeFilter('Kelas 8');
      showToast('Hanya materi & soal Kelas 8 (Bab 1 – Bab 9) yang diaktifkan!');
    }
  };

  const handleActivateOnlySingleChapter = (
    grade: 'Kelas 7' | 'Kelas 8',
    chapter: MaterialCategory
  ) => {
    const otherGrade = grade === 'Kelas 7' ? 'Kelas 8' : 'Kelas 7';
    // Keep existing active questions for the other grade, and activate ONLY the chosen chapter for this grade
    const otherGradeActiveIds = questions
      .filter((q) => q.gradeLevel === otherGrade && effectiveEnabledSet.has(q.id))
      .map((q) => q.id);
    const targetChapterIds = questions
      .filter((q) => q.gradeLevel === grade && q.category === chapter)
      .map((q) => q.id);
    onUpdateEnabledQuestions([...otherGradeActiveIds, ...targetChapterIds]);
    showToast(`Untuk ${grade}, diatur HANYA ${chapter} yang aktif dimainkan!`);
  };

  const handleActivateAllChaptersForGrade = (grade: 'Kelas 7' | 'Kelas 8') => {
    const next = new Set(effectiveEnabledSet);
    for (const q of questions) {
      if (q.gradeLevel === grade) {
        next.add(q.id);
      }
    }
    onUpdateEnabledQuestions(Array.from(next));
    showToast(`Semua 9 Bab Materi untuk ${grade} telah diaktifkan!`);
  };

  const handleSelectCountPerChapter = (countPerChap: number) => {
    const selectedIds: string[] = [];
    const targetGrades: Array<'Kelas 7' | 'Kelas 8'> =
      gradeFilter === 'ALL' ? ['Kelas 7', 'Kelas 8'] : [gradeFilter];

    for (const g of targetGrades) {
      const chapters = g === 'Kelas 7' ? KELAS_7_CHAPTERS : KELAS_8_CHAPTERS;
      for (const ch of chapters) {
        if (configChapterFilter !== 'ALL' && ch !== configChapterFilter) continue;
        const chapQs = questions.filter((q) => q.gradeLevel === g && q.category === ch);
        for (const q of chapQs.slice(0, countPerChap)) {
          selectedIds.push(q.id);
        }
      }
    }

    if (selectedIds.length > 0) {
      onUpdateEnabledQuestions(selectedIds);
      showToast(
        `Diaktifkan ${countPerChap} soal per bab (${selectedIds.length} butir soal aktif)!`
      );
    }
  };

  // Form State for New Material
  const [matTitle, setMatTitle] = useState('');
  const [matCategory, setMatCategory] = useState<MaterialCategory>(
    'Bab 1 : Informatika dan Keterampilan Generik'
  );
  const [matGrade, setMatGrade] = useState<'Kelas 7' | 'Kelas 8' | 'Kelas 9'>('Kelas 7');
  const [matSummary, setMatSummary] = useState('');
  const [matKeyPointsText, setMatKeyPointsText] = useState('');
  const [matFormula, setMatFormula] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form State for New Question
  const [qMaterialId, setQMaterialId] = useState<string>(materials[0]?.id || 'mat-k7-bab1');
  const [qCategory, setQCategory] = useState<MaterialCategory>(
    'Bab 1 : Informatika dan Keterampilan Generik'
  );
  const [qGrade, setQGrade] = useState<'Kelas 7' | 'Kelas 8' | 'Kelas 9'>('Kelas 7');
  const [qCognitive, setQCognitive] = useState<CognitiveLevel>('C3 - Menerapkan');
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [qCorrect, setQCorrect] = useState<OptionKey>('A');
  const [qExplanation, setQExplanation] = useState('');
  const [qPoints, setQPoints] = useState(150);
  const [qTimeLimit, setQTimeLimit] = useState(25);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !matSummary.trim()) return;

    const points = matKeyPointsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newMat: InformaticsMaterial = {
      id: `mat-${Date.now()}`,
      title: matTitle.trim(),
      category: matCategory,
      gradeLevel: matGrade,
      summary: matSummary.trim(),
      keyPoints:
        points.length > 0
          ? points
          : ['Konsep inti dipelajari melalui simulasi arena dan latihan soal.'],
      formulaOrLogic: matFormula.trim() || 'Input Data -> Proses Komputasi -> Output Informasi',
      author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onSaveMaterial(newMat);
    setMatTitle('');
    setMatSummary('');
    setMatKeyPointsText('');
    setMatFormula('');
    showToast('Modul materi pembelajaran baru berhasil ditambahkan.');
    setActiveTab('MATERI');
  };

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) return;

    const allOptions: OptionKey[] = ['A', 'B', 'C', 'D'];
    const wrongOpts = allOptions.filter((o) => o !== qCorrect);

    const newQ: InformaticsQuestion = {
      id: `q-${Date.now()}`,
      materialId: qMaterialId || materials[0]?.id || 'mat-bk-01',
      category: qCategory,
      gradeLevel: qGrade,
      cognitiveLevel: qCognitive,
      question: qText.trim(),
      options: {
        A: optA.trim(),
        B: optB.trim(),
        C: optC.trim(),
        D: optD.trim(),
      },
      correctAnswer: qCorrect,
      explanation:
        qExplanation.trim() ||
        `Jawaban yang tepat adalah opsi ${qCorrect} sesuai konsep ${qCategory}.`,
      points: Number(qPoints) || 150,
      timeLimitSec: Number(qTimeLimit) || 25,
      baselineCohort: Array.from({ length: 16 }, (_, idx) => {
        const isUpper = idx < 8;
        const isCorrect = isUpper ? idx < 6 : idx < 3;
        return {
          studentId: `cohort-${idx + 1}`,
          studentName: `Siswa MTsN 14 #${idx + 1}`,
          totalScoreRankPercentile: isUpper ? 0.8 : 0.3,
          selectedOption: isCorrect ? qCorrect : wrongOpts[idx % wrongOpts.length],
          isCorrect,
          responseTimeMs: 5200 + idx * 240,
        };
      }),
    };

    onSaveQuestion(newQ);
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setQExplanation('');
    showToast('Butir soal baru berhasil disimpan ke Bank Soal Arena.');
    setActiveTab('SOAL');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain touch-pan-y">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[94dvh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-slate-100 font-display truncate">
              Bank Materi & Butir Soal Informatika
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              Pengampu: Azhary Mardhani, S.Kom · MTs Negeri 14 Jakarta · Kurikulum Merdeka
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Tutup</span>
          </button>
        </div>

        {/* Interactive Segmented Control Bar */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('KONFIGURASI_SOAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'KONFIGURASI_SOAL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-400 hover:text-emerald-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Pilih Materi & Soal Dimainkan ({effectiveEnabledSet.size}/{questions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('MATERI')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'MATERI'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daftar Materi ({materials.length})
            </button>
            <button
              onClick={() => setActiveTab('SOAL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'SOAL'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bank Butir Soal ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('TAMBAH_MATERI')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'TAMBAH_MATERI'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Materi
            </button>
            <button
              onClick={() => setActiveTab('TAMBAH_SOAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'TAMBAH_SOAL'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Butir Soal
            </button>
          </div>

          {feedbackMsg && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-3.5 sm:p-6 space-y-5 sm:space-y-6">
          {(activeTab === 'KONFIGURASI_SOAL' || activeTab === 'MATERI' || activeTab === 'SOAL') && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">
                Filter Tampilan Jenjang Kurikulum (Bab 1 s.d. Bab 9):
              </span>
              <div className="flex items-center gap-1.5">
                {(['ALL', 'Kelas 7', 'Kelas 8'] as const).map((gf) => (
                  <button
                    key={gf}
                    type="button"
                    onClick={() => {
                      setGradeFilter(gf);
                      setConfigChapterFilter('ALL');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      gradeFilter === gf
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {gf === 'ALL'
                      ? 'Semua Kelas (Kelas 7 & 8)'
                      : `${gf} (Bab 1 – Bab 9)`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              TAB BARU: PENGATURAN GURU UNTUK MEMILIH MATERI & SOAL DIMAINKAN
             ================================================================= */}
          {activeTab === 'KONFIGURASI_SOAL' && (
            <div className="space-y-6">
              {/* Top Control Summary & Quick Presets */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-sky-950/60 border border-emerald-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-emerald-400">
                    PENGATURAN SESI UJIAN / PERMAINAN GURU
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    Aktif Dimainkan Siswa: {effectiveEnabledSet.size} dari {questions.length} Butir Soal
                  </h3>
                  <p className="text-xs text-slate-300">
                    Centang <strong>Bab Materi</strong> atau <strong>Butir Soal</strong> di bawah ini untuk mengatur soal mana saja yang akan dikerjakan siswa di dalam Arena 3D MTsN 14.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSelect('ALL')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 text-xs font-bold transition-colors"
                  >
                    Aktifkan Semua (Kelas 7 & 8)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSelect('KELAS_7')}
                    className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold transition-colors"
                  >
                    Hanya Kelas 7 (Bab 1–9)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSelect('KELAS_8')}
                    className="px-3 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-extrabold transition-colors"
                  >
                    Hanya Kelas 8 (Bab 1–9)
                  </button>
                </div>
              </div>

              {/* MENU BARU: PILIH BANYAKNYA SOAL (TOTAL SESI UJIAN & PER BAB) */}
              <div className="p-4 sm:p-5 bg-slate-950/95 border-2 border-amber-500/50 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-400">
                      MENU PILIH BANYAKNYA SOAL UJIAN / PERMAINAN
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                      Atur Jumlah Soal yang Dikerjakan Siswa:{' '}
                      <span className="text-emerald-400">
                        {questionCountLimit > 0
                          ? `${questionCountLimit} Butir Soal per Sesi`
                          : `Semua Soal Aktif (${effectiveEnabledSet.size} Soal)`}
                      </span>
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Tersedia 20 Soal / Bab · Total 360 Soal
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Pilihan 1: Batas Total Soal Sesi Ujian */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                    <div className="text-xs font-bold text-amber-300">
                      1. Pilih Banyaknya Soal untuk 1 Sesi Ujian Siswa:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {QUESTION_COUNT_OPTIONS.map((cnt) => {
                        const isSelected = questionCountLimit === cnt;
                        return (
                          <button
                            key={`limit-${cnt}`}
                            type="button"
                            onClick={() => {
                              onUpdateQuestionCountLimit?.(cnt);
                              showToast(
                                cnt === 0
                                  ? 'Banyaknya soal diatur ke Semua Soal Aktif!'
                                  : `Banyaknya soal ujian diatur ke ${cnt} Butir Soal!`
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                                : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-500/60 hover:text-white'
                            }`}
                          >
                            {cnt === 0 ? 'Semua Soal' : `${cnt} Soal`}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Membatasi jumlah butir soal yang tampil di Lembar CBT siswa sesuai angka yang dipilih.
                    </p>
                  </div>

                  {/* Pilihan 2: Pilih Banyaknya Soal per Bab Secara Merata */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                    <div className="text-xs font-bold text-emerald-300">
                      2. Pilih Banyaknya Soal Aktif per Bab (Dari 20 Soal/Bab):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PER_CHAPTER_COUNT_OPTIONS.map((perChap) => (
                        <button
                          key={`per-chap-${perChap}`}
                          type="button"
                          onClick={() => handleSelectCountPerChapter(perChap)}
                          className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-950/80 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-600/60 transition-colors"
                        >
                          {perChap} Soal / Bab
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Otomatis mencentang {gradeFilter === 'ALL' ? 'Kelas 7 & 8' : gradeFilter} sebanyak 5, 10, 15, atau 20 soal di setiap bab.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bagian 1: MENU AKTIVASI BAB MATERI PERMAINAN (KELAS 7 & KELAS 8) */}
              <div className="space-y-4">
                {(gradeFilter === 'ALL' || gradeFilter === 'Kelas 7') && (
                  <div className="p-4 bg-slate-950/95 border-2 border-emerald-500/40 rounded-2xl space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-emerald-400">
                          MENU AKTIVASI BAB MATERI KELAS 7 (7A s.d. 7G)
                        </div>
                        <h4 className="text-sm font-extrabold text-white mt-0.5">
                          Pilih Bab Materi Kelas 7 yang Aktif untuk Permainan Siswa
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-600/60 text-xs font-mono font-bold text-emerald-300">
                          {
                            KELAS_7_CHAPTERS.filter((ch) =>
                              questions.some(
                                (q) =>
                                  q.gradeLevel === 'Kelas 7' &&
                                  q.category === ch &&
                                  effectiveEnabledSet.has(q.id)
                              )
                            ).length
                          }
                          /9 Bab Aktif ·{' '}
                          {
                            questions.filter(
                              (q) => q.gradeLevel === 'Kelas 7' && effectiveEnabledSet.has(q.id)
                            ).length
                          }{' '}
                          Soal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleActivateAllChaptersForGrade('Kelas 7')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-colors"
                        >
                          Aktifkan Semua Bab Kelas 7
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {KELAS_7_CHAPTERS.map((chap) => {
                        const chapQs = questions.filter(
                          (q) => q.gradeLevel === 'Kelas 7' && q.category === chap
                        );
                        const activeCount = chapQs.filter((q) =>
                          effectiveEnabledSet.has(q.id)
                        ).length;
                        const isActive = activeCount > 0;
                        const isAllActive = chapQs.length > 0 && activeCount === chapQs.length;

                        return (
                          <div
                            key={`cfg-k7-${chap}`}
                            className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                              isAllActive
                                ? 'bg-emerald-950/60 border-emerald-500/80 text-white'
                                : isActive
                                ? 'bg-amber-950/40 border-amber-500/70 text-slate-100'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleChapterGroup('Kelas 7', chap)}
                                className="flex items-start gap-2.5 text-left min-w-0 flex-1"
                              >
                                {isActive ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                )}
                                <div className="min-w-0">
                                  <div className="text-xs font-bold leading-snug">{chap}</div>
                                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                                    {activeCount}/{chapQs.length} Soal Aktif
                                  </div>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleChapterGroup('Kelas 7', chap)}
                                className={`px-2 py-1 rounded-md text-[10px] font-mono font-extrabold shrink-0 border transition-colors ${
                                  isActive
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                              >
                                {isActive ? 'AKTIF' : 'NONAKTIF'}
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => handleToggleChapterGroup('Kelas 7', chap)}
                                className="text-[11px] font-bold text-emerald-300 hover:underline"
                              >
                                {isActive ? 'Matikan Bab' : 'Aktifkan Bab'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleActivateOnlySingleChapter('Kelas 7', chap)}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-[10px] font-bold text-amber-300 transition-colors"
                                title="Aktifkan hanya bab ini saja untuk Kelas 7"
                              >
                                Hanya Bab Ini
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(gradeFilter === 'ALL' || gradeFilter === 'Kelas 8') && (
                  <div className="p-4 bg-slate-950/95 border-2 border-sky-500/40 rounded-2xl space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-sky-400">
                          MENU AKTIVASI BAB MATERI KELAS 8 (8A s.d. 8H)
                        </div>
                        <h4 className="text-sm font-extrabold text-white mt-0.5">
                          Pilih Bab Materi Kelas 8 yang Aktif untuk Permainan Siswa
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-600/60 text-xs font-mono font-bold text-sky-300">
                          {
                            KELAS_8_CHAPTERS.filter((ch) =>
                              questions.some(
                                (q) =>
                                  q.gradeLevel === 'Kelas 8' &&
                                  q.category === ch &&
                                  effectiveEnabledSet.has(q.id)
                              )
                            ).length
                          }
                          /9 Bab Aktif ·{' '}
                          {
                            questions.filter(
                              (q) => q.gradeLevel === 'Kelas 8' && effectiveEnabledSet.has(q.id)
                            ).length
                          }{' '}
                          Soal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleActivateAllChaptersForGrade('Kelas 8')}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold transition-colors"
                        >
                          Aktifkan Semua Bab Kelas 8
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {KELAS_8_CHAPTERS.map((chap) => {
                        const chapQs = questions.filter(
                          (q) => q.gradeLevel === 'Kelas 8' && q.category === chap
                        );
                        const activeCount = chapQs.filter((q) =>
                          effectiveEnabledSet.has(q.id)
                        ).length;
                        const isActive = activeCount > 0;
                        const isAllActive = chapQs.length > 0 && activeCount === chapQs.length;

                        return (
                          <div
                            key={`cfg-k8-${chap}`}
                            className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                              isAllActive
                                ? 'bg-sky-950/60 border-sky-500/80 text-white'
                                : isActive
                                ? 'bg-amber-950/40 border-amber-500/70 text-slate-100'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleChapterGroup('Kelas 8', chap)}
                                className="flex items-start gap-2.5 text-left min-w-0 flex-1"
                              >
                                {isActive ? (
                                  <CheckSquare className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                )}
                                <div className="min-w-0">
                                  <div className="text-xs font-bold leading-snug">{chap}</div>
                                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                                    {activeCount}/{chapQs.length} Soal Aktif
                                  </div>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleChapterGroup('Kelas 8', chap)}
                                className={`px-2 py-1 rounded-md text-[10px] font-mono font-extrabold shrink-0 border transition-colors ${
                                  isActive
                                    ? 'bg-sky-400 text-slate-950 border-sky-200'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                              >
                                {isActive ? 'AKTIF' : 'NONAKTIF'}
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => handleToggleChapterGroup('Kelas 8', chap)}
                                className="text-[11px] font-bold text-sky-300 hover:underline"
                              >
                                {isActive ? 'Matikan Bab' : 'Aktifkan Bab'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleActivateOnlySingleChapter('Kelas 8', chap)}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-[10px] font-bold text-amber-300 transition-colors"
                                title="Aktifkan hanya bab ini saja untuk Kelas 8"
                              >
                                Hanya Bab Ini
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bagian 2: Pilih Butir Soal Spesifik Satu per Satu */}
              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-100">
                      Pilih Butir Soal Satu per Satu (Klik Soal untuk Mengaktifkan / Menyembunyikan)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Guru dapat memilih butir soal tertentu saja yang ingin dikeluarkan saat ujian/permainan berlangsung.
                    </p>
                  </div>

                  <select
                    value={configChapterFilter}
                    onChange={(e) => setConfigChapterFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200"
                  >
                    <option value="ALL">Semua Bab</option>
                    {ALL_CURRICULUM_CHAPTERS.map((c) => (
                      <option key={`filter-q-${c}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5">
                  {questions
                    .filter(
                      (q) =>
                        (gradeFilter === 'ALL' || q.gradeLevel === gradeFilter) &&
                        (configChapterFilter === 'ALL' || q.category === configChapterFilter)
                    )
                    .map((q, idx) => {
                      const isChecked = effectiveEnabledSet.has(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => handleToggleSingleQuestion(q.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            isChecked
                              ? 'bg-emerald-950/30 border-emerald-600/70 hover:bg-emerald-950/50'
                              : 'bg-slate-900/50 border-slate-800 opacity-60 hover:opacity-90'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5 shrink-0">
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-500" />
                              )}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-mono font-bold text-amber-400">
                                  #{idx + 1}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-bold">
                                  {q.gradeLevel}
                                </span>
                                <span className="font-bold text-slate-200">{q.category}</span>
                                <span className="text-slate-400">· Kunci: {q.correctAnswer}</span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                                {q.question}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold shrink-0 ${
                              isChecked
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isChecked ? 'AKTIF DIMAINKAN' : 'NONAKTIF'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MATERI' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {materials
                .filter((m) => gradeFilter === 'ALL' || m.gradeLevel === gradeFilter)
                .map((mat, index) => (
                <div
                  key={mat.id}
                  className="flex flex-col justify-between p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span>
                        0{index + 1}. {mat.category} · {mat.gradeLevel}
                      </span>
                      <button
                        onClick={() => onDeleteMaterial(mat.id)}
                        title="Hapus Materi"
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 font-display">
                      {mat.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{mat.summary}</p>
                    <ul className="space-y-1.5 pt-1 text-xs text-slate-400">
                      {mat.keyPoints.map((kp, idx) => (
                        <li key={idx} className="leading-relaxed">
                          • {kp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-xs font-mono text-sky-300 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                      {mat.formulaOrLogic}
                    </div>
                    <div className="text-xs text-slate-500">
                      Penyusun: {mat.author} · {mat.createdAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'SOAL' && (
            <div className="space-y-4">
              {questions
                .filter((q) => gradeFilter === 'ALL' || q.gradeLevel === gradeFilter)
                .map((q, idx) => (
                <div
                  key={q.id}
                  className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
                    <span>
                      Butir #{idx + 1} · {q.category} · {q.gradeLevel} · {q.cognitiveLevel} · Skor{' '}
                      <span className="font-mono tabular-nums text-sky-400">{q.points}</span> Poin
                    </span>
                    <button
                      onClick={() => onDeleteQuestion(q.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Soal
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
                      const isCorrect = q.correctAnswer === key;
                      return (
                        <div
                          key={key}
                          className={`px-3.5 py-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-700/70 text-emerald-200 font-semibold'
                              : 'bg-slate-900/70 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>
                            {key}. {q.options[key]}
                          </span>
                          {isCorrect && (
                            <span className="text-emerald-400 font-mono text-[11px] shrink-0">
                              [KUNCI]
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-400 pt-1">
                    <span className="font-semibold text-slate-300">Pembahasan:</span>{' '}
                    {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'TAMBAH_MATERI' && (
            <form onSubmit={handleAddMaterialSubmit} className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 pb-1 border-b border-slate-800">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Form Tambah Modul Materi Pembelajaran Informatika</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Judul Materi Pembelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    placeholder="Contoh: Struktur Data Graf & Pohon (Tree)"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Elemen Kurikulum
                    </label>
                    <select
                      value={matCategory}
                      onChange={(e) => setMatCategory(e.target.value as MaterialCategory)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Tingkat Kelas
                    </label>
                    <select
                      value={matGrade}
                      onChange={(e) =>
                        setMatGrade(e.target.value as 'Kelas 7' | 'Kelas 8' | 'Kelas 9')
                      }
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Kelas 7">Kelas 7</option>
                      <option value="Kelas 8">Kelas 8</option>
                      <option value="Kelas 9">Kelas 9</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Ringkasan Konsep Inti (Ditampilkan pada Kartu Materi Sebelum Permainan)
                </label>
                <textarea
                  rows={3}
                  required
                  value={matSummary}
                  onChange={(e) => setMatSummary(e.target.value)}
                  placeholder="Tuliskan penjelasan ringkas materi yang mudah dipahami siswa MTsN 14 Jakarta..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Poin-Poin Penting (Pisahkan dengan baris baru / Enter)
                </label>
                <textarea
                  rows={3}
                  value={matKeyPointsText}
                  onChange={(e) => setMatKeyPointsText(e.target.value)}
                  placeholder={
                    'Simpul (Node) merepresentasikan entitas data\nSisi (Edge) menghubungkan antar simpul'
                  }
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rumus / Notasi Algoritma / Contoh Kode Singkat
                </label>
                <input
                  type="text"
                  value={matFormula}
                  onChange={(e) => setMatFormula(e.target.value)}
                  placeholder="Contoh: Graf G = (V, E) di mana V = Himpunan Titik, E = Himpunan Sisi"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Simpan Materi Pembelajaran
                </button>
              </div>
            </form>
          )}

          {activeTab === 'TAMBAH_SOAL' && (
            <form onSubmit={handleAddQuestionSubmit} className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 pb-1 border-b border-slate-800">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Form Tambah Butir Soal & Kunci Analisis Evaluasi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kategori Materi
                  </label>
                  <select
                    value={qCategory}
                    onChange={(e) => {
                      const cat = e.target.value as MaterialCategory;
                      setQCategory(cat);
                      const matchingMat = materials.find((m) => m.category === cat);
                      if (matchingMat) setQMaterialId(matchingMat.id);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Level Kognitif (Taksonomi Bloom)
                  </label>
                  <select
                    value={qCognitive}
                    onChange={(e) => setQCognitive(e.target.value as CognitiveLevel)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {COGNITIVE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kelas & Skor Poin
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={qGrade}
                      onChange={(e) =>
                        setQGrade(e.target.value as 'Kelas 7' | 'Kelas 8' | 'Kelas 9')
                      }
                      className="w-1/2 px-2 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    >
                      <option value="Kelas 7">Kelas 7</option>
                      <option value="Kelas 8">Kelas 8</option>
                      <option value="Kelas 9">Kelas 9</option>
                    </select>
                    <input
                      type="number"
                      min={50}
                      max={500}
                      step={25}
                      value={qPoints}
                      onChange={(e) => setQPoints(Number(e.target.value))}
                      className="w-1/2 px-2.5 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rumusan Pokok Soal (Stem Pertanyaan)
                </label>
                <textarea
                  rows={3}
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Tuliskan pertanyaan studi kasus Informatika yang akan muncul di HUD Arena..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-sky-400 mb-1">
                    Terminal A (Opsi A)
                  </label>
                  <input
                    type="text"
                    required
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Teks opsi jawaban A"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-400 mb-1">
                    Terminal B (Opsi B)
                  </label>
                  <input
                    type="text"
                    required
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Teks opsi jawaban B"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-400 mb-1">
                    Terminal C (Opsi C)
                  </label>
                  <input
                    type="text"
                    required
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Teks opsi jawaban C"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-rose-400 mb-1">
                    Terminal D (Opsi D)
                  </label>
                  <input
                    type="text"
                    required
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Teks opsi jawaban D"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kunci Jawaban Benar
                  </label>
                  <select
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value as OptionKey)}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-950 border border-slate-800 rounded-lg text-emerald-400"
                  >
                    <option value="A">Opsi A</option>
                    <option value="B">Opsi B</option>
                    <option value="C">Opsi C</option>
                    <option value="D">Opsi D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Batas Waktu (Detik)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={60}
                    value={qTimeLimit}
                    onChange={(e) => setQTimeLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Simpan Butir Soal
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Pembahasan Materi (Ditampilkan Saat Evaluasi & Analisis Butir Soal)
                </label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Tuliskan alasan mengapa kunci jawaban tersebut benar..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
