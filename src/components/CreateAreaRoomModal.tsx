import React, { useState, useMemo } from 'react';
import {
  Building2,
  Clock,
  KeyRound,
  Sparkles,
  X,
  Copy,
  Check,
  Shuffle,
  ShieldCheck,
  Layers,
  HelpCircle,
  Play,
  Compass,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import {
  InformaticsQuestion,
  KELAS_7_CHAPTERS,
  KELAS_8_CHAPTERS,
} from '../data/informaticsData';

export interface CreateAreaRoomData {
  pin: string;
  roomName: string;
  areaZone: string;
  durationMinutes: number;
  questionLimit: number;
  gradeLevel: 'ALL' | 'Kelas 7' | 'Kelas 8';
}

interface CreateAreaRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchRoom: (data: CreateAreaRoomData) => void;
  currentRoomPin?: string;
  totalAvailableQuestions: number;
  questions: InformaticsQuestion[];
  enabledQuestionIds: string[];
  onUpdateEnabledQuestions: (ids: string[]) => void;
}

export const AREA_ZONES = [
  {
    id: 'ALL_CAMPUS',
    name: 'Seluruh Kampus MTsN 14 Halim',
    badge: '🏫 Open-World Penuh',
    desc: 'Semua 6 gedung sekolah, lapangan upacara, dan pos materi aktif dapat dijelajahi.',
    accent: 'border-sky-500/80 bg-sky-950/40 text-sky-200',
  },
  {
    id: 'LAB_KOMPUTER',
    name: 'Area Lab Komputer & Informatika',
    badge: '💻 Lab Cyber CBT',
    desc: 'Fokus ujian berbasis komputer di Gedung Informatika dengan stasiun CBT prioritas.',
    accent: 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200',
  },
  {
    id: 'LAPANGAN_UPACARA',
    name: 'Area Lapangan Upacara & Olahraga',
    badge: '⚽ Arena Duel & Flagpole',
    desc: 'Area tiang bendera podium juara, lapangan olahraga, dan arena duel 1v1 antar siswa.',
    accent: 'border-amber-500/80 bg-amber-950/40 text-amber-200',
  },
  {
    id: 'AULA_UTAMA',
    name: 'Area Aula Utama & Pos Guru',
    badge: '🏛️ Aula Pertemuan',
    desc: 'Ruang auditorium pusat dengan pos guru utama Pak Azhary Mardhani, S.Kom.',
    accent: 'border-purple-500/80 bg-purple-950/40 text-purple-200',
  },
  {
    id: 'RUANG_KELAS',
    name: 'Area Gedung Belajar & Perpustakaan',
    badge: '📚 Gedung Belajar',
    desc: 'Lingkungan akademik santai di koridor kelas 7 dan kelas 8 serta perpustakaan digital.',
    accent: 'border-rose-500/80 bg-rose-950/40 text-rose-200',
  },
];

const TOKEN_PREFIXES = ['HALIM', 'MTS14', 'CBT', 'INFO', 'LAB', 'CYBER'];

function generateRandomToken(): string {
  const prefix = TOKEN_PREFIXES[Math.floor(Math.random() * TOKEN_PREFIXES.length)];
  const num = Math.floor(10 + Math.random() * 90);
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${prefix}${num}${letter}`;
}

export const CreateAreaRoomModal: React.FC<CreateAreaRoomModalProps> = ({
  isOpen,
  onClose,
  onLaunchRoom,
  currentRoomPin = 'MTN14',
  totalAvailableQuestions,
  questions,
  enabledQuestionIds,
  onUpdateEnabledQuestions,
}) => {
  const [tokenInput, setTokenInput] = useState<string>(() => generateRandomToken());
  const [roomNameInput, setRoomNameInput] = useState<string>('Ujian CBT Informatika MTsN 14');
  const [selectedZone, setSelectedZone] = useState<string>('ALL_CAMPUS');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [questionLimit, setQuestionLimit] = useState<number>(20);
  const [gradeLevel, setGradeLevel] = useState<'ALL' | 'Kelas 7' | 'Kelas 8'>('ALL');
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [teacherChapterGradeTab, setTeacherChapterGradeTab] = useState<'Kelas 7' | 'Kelas 8'>('Kelas 7');
  const [modalError, setModalError] = useState<string | null>(null);

  const effectiveEnabledSet = useMemo(() => {
    if (!enabledQuestionIds || enabledQuestionIds.length === 0) {
      return new Set(questions.map((q) => q.id));
    }
    const valid = enabledQuestionIds.filter((id) => questions.some((q) => q.id === id));
    if (valid.length === 0) return new Set(questions.map((q) => q.id));
    return new Set(valid);
  }, [enabledQuestionIds, questions]);

  const teacherActiveQuestions = useMemo(() => {
    return questions.filter((q) => effectiveEnabledSet.has(q.id));
  }, [questions, effectiveEnabledSet]);

  if (!isOpen) return null;

  const handleCopyToken = () => {
    soundEngine.playClick();
    navigator.clipboard?.writeText(tokenInput).catch(() => {});
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleRandomizeToken = () => {
    soundEngine.playClick();
    const next = generateRandomToken();
    setTokenInput(next);
  };

  const handleToggleChapter = (grade: 'Kelas 7' | 'Kelas 8', chapter: string) => {
    const chapterQs = questions.filter((q) => q.gradeLevel === grade && q.category === chapter);
    if (chapterQs.length === 0) return;
    const allSelected = chapterQs.every((q) => effectiveEnabledSet.has(q.id));
    const next = new Set(effectiveEnabledSet);

    if (allSelected) {
      for (const q of chapterQs) next.delete(q.id);
      const remaining = questions.filter((q) => q.gradeLevel === grade && next.has(q.id));
      if (remaining.length === 0) {
        setModalError(`Minimal harus ada 1 Bab Materi ${grade} yang aktif.`);
        return;
      }
    } else {
      for (const q of chapterQs) next.add(q.id);
    }
    setModalError(null);
    onUpdateEnabledQuestions(Array.from(next));
  };

  const handleActivateOnlyChapter = (grade: 'Kelas 7' | 'Kelas 8', chapter: string) => {
    const otherGrade = grade === 'Kelas 7' ? 'Kelas 8' : 'Kelas 7';
    const otherIds = questions
      .filter((q) => q.gradeLevel === otherGrade && effectiveEnabledSet.has(q.id))
      .map((q) => q.id);
    const targetIds = questions
      .filter((q) => q.gradeLevel === grade && q.category === chapter)
      .map((q) => q.id);
    setModalError(null);
    onUpdateEnabledQuestions([...otherIds, ...targetIds]);
  };

  const handleActivateAllGrade = (grade: 'Kelas 7' | 'Kelas 8') => {
    const next = new Set(effectiveEnabledSet);
    for (const q of questions) {
      if (q.gradeLevel === grade) next.add(q.id);
    }
    setModalError(null);
    onUpdateEnabledQuestions(Array.from(next));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    const cleanToken = tokenInput.toUpperCase().replace(/[^A-Z0-9]/g, '') || generateRandomToken();
    onLaunchRoom({
      pin: cleanToken,
      roomName: roomNameInput.trim() || `Room Area ${cleanToken}`,
      areaZone: selectedZone,
      durationMinutes,
      questionLimit,
      gradeLevel,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[92dvh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-900 border-b border-amber-500/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white truncate">
                  Buat Room Area & Token Ujian Baru
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-amber-500 text-slate-950 shrink-0">
                  GURU
                </span>
              </div>
              <p className="text-xs text-amber-200/80 truncate">
                Buat sesi terpisah dengan Token unik dan aktivasi bab materi permainan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 1. Token Room Box */}
          <div className="p-4 rounded-xl bg-slate-950 border-2 border-amber-500/60 shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                <KeyRound className="w-4 h-4" />
                <span>Token / Kode Room (Kunci Pemisah Siswa)</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Hanya siswa dengan token ini yang masuk
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={tokenInput}
                onChange={(e) =>
                  setTokenInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                }
                placeholder="CONTOH: HALIM7A"
                className="flex-1 px-4 py-2.5 text-lg sm:text-xl font-mono font-extrabold tracking-widest text-amber-300 bg-slate-900 border border-amber-600/80 rounded-xl focus:outline-none focus:border-amber-400 text-center"
              />
              <button
                type="button"
                onClick={handleRandomizeToken}
                title="Acak Token Baru"
                className="px-3 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span className="hidden sm:inline">Acak Token</span>
              </button>
              <button
                type="button"
                onClick={handleCopyToken}
                title="Salin Token"
                className="px-3.5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors shadow"
              >
                {copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedToken ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 <em>Bagikan token ini ke grup kelas. Siswa mengetik token ini pada kolom Kode Room saat login.</em>
            </p>
          </div>

          {/* 2. Room Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Nama Sesi / Label Room Area
            </label>
            <input
              type="text"
              required
              value={roomNameInput}
              onChange={(e) => setRoomNameInput(e.target.value)}
              placeholder="Misal: CBT Informatika Kelas 7A - Bab Berpikir Komputasional"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 3. Area Zone Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Pilih Area Kampus MTsN 14 Halim</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AREA_ZONES.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedZone(zone.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedZone === zone.id
                      ? `${zone.accent} ring-2 ring-amber-400 shadow-md`
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-black">{zone.badge}</span>
                    {selectedZone === zone.id && (
                      <span className="text-[10px] font-mono font-bold text-amber-400">✓ TERPILIH</span>
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-slate-200">{zone.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{zone.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Durasi Waktu Permainan (Timer) & Batas Soal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Durasi Waktu */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Waktu Permainan / Ujian</span>
                </span>
                <span className="font-mono text-emerald-400">
                  {durationMinutes === 0 ? 'Tanpa Batas' : `${durationMinutes} Menit`}
                </span>
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-900 border border-amber-600/70 rounded-xl text-amber-200 focus:outline-none focus:border-amber-400"
              >
                <option value={0}>♾️ Bebas / Tanpa Batas Waktu</option>
                <option value={5}>⚡ 5 Menit (Kuis Kilat)</option>
                <option value={10}>⏱️ 10 Menit</option>
                <option value={15}>⏱️ 15 Menit</option>
                <option value={20}>⏱️ 20 Menit</option>
                <option value={30}>⏱️ 30 Menit (Ujian Standar)</option>
                <option value={45}>⏱️ 45 Menit (1 Jam Pelajaran)</option>
                <option value={60}>⏱️ 60 Menit (Penilaian Akhir)</option>
              </select>
              <p className="text-[10px] text-slate-400">
                Ketika waktu habis, permainan otomatis diselesaikan secara serentak untuk semua siswa.
              </p>
            </div>

            {/* Batas Banyaknya Soal */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-sky-300">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Banyaknya Soal Ujian</span>
                </span>
                <span className="font-mono text-sky-400">
                  {questionLimit === 0 ? 'Semua Soal' : `${questionLimit} Soal`}
                </span>
              </label>
              <select
                value={questionLimit}
                onChange={(e) => setQuestionLimit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-900 border border-sky-600/70 rounded-xl text-sky-200 focus:outline-none focus:border-sky-400"
              >
                <option value={5}>5 Butir Soal</option>
                <option value={10}>10 Butir Soal</option>
                <option value={15}>15 Butir Soal</option>
                <option value={20}>20 Butir Soal (Rekomendasi)</option>
                <option value={25}>25 Butir Soal</option>
                <option value={30}>30 Butir Soal</option>
                <option value={40}>40 Butir Soal</option>
                <option value={50}>50 Butir Soal</option>
                <option value={0}>Semua Soal Aktif ({totalAvailableQuestions} Soal)</option>
              </select>
              <p className="text-[10px] text-slate-400">
                Siswa menyelesaikan sejumlah butir soal ini sebelum otomatis masuk podium juara.
              </p>
            </div>
          </div>

          {/* 5. MENU AKTIVASI BAB MATERI PERMAINAN (ON / OFF) */}
          <div className="p-4 rounded-xl bg-slate-950 border-2 border-amber-500/50 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-extrabold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>⚙️ MENU AKTIVASI BAB MATERI PERMAINAN (ON / OFF)</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pilih bab materi Informatika mana saja yang diaktifkan untuk room area ini:
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(['Kelas 7', 'Kelas 8'] as const).map((gTab) => {
                  const chaps = gTab === 'Kelas 7' ? KELAS_7_CHAPTERS : KELAS_8_CHAPTERS;
                  const activeCount = chaps.filter((ch) =>
                    questions.some(
                      (q) =>
                        q.gradeLevel === gTab &&
                        q.category === ch &&
                        effectiveEnabledSet.has(q.id)
                    )
                  ).length;
                  return (
                    <button
                      key={gTab}
                      type="button"
                      onClick={() => setTeacherChapterGradeTab(gTab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-colors ${
                        teacherChapterGradeTab === gTab
                          ? gTab === 'Kelas 7'
                            ? 'bg-emerald-600 text-white border-emerald-400'
                            : 'bg-sky-600 text-white border-sky-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {gTab} ({activeCount}/9 Bab)
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleActivateAllGrade(teacherChapterGradeTab)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-700 text-emerald-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors"
                >
                  Aktifkan Semua {teacherChapterGradeTab}
                </button>
              </div>
            </div>

            {modalError && (
              <div className="text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-700 px-3 py-2 rounded-xl">
                {modalError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {(teacherChapterGradeTab === 'Kelas 7' ? KELAS_7_CHAPTERS : KELAS_8_CHAPTERS).map(
                (chap, idx) => {
                  const chapQs = questions.filter(
                    (q) => q.gradeLevel === teacherChapterGradeTab && q.category === chap
                  );
                  const activeCount = chapQs.filter((q) => effectiveEnabledSet.has(q.id)).length;
                  const isActive = activeCount > 0;

                  return (
                    <div
                      key={chap}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                        isActive
                          ? 'bg-emerald-950/30 border-emerald-500/60 text-slate-100 shadow'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                            Bab {idx + 1}
                          </div>
                          <div className="text-xs font-extrabold text-slate-100 line-clamp-2">
                            {chap.replace(/^Bab \d+[:\s]*/i, '')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleChapter(teacherChapterGradeTab, chap)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-extrabold shrink-0 border transition-colors ${
                            isActive
                              ? 'bg-emerald-400 text-slate-950 border-emerald-200 shadow'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {isActive ? 'AKTIF' : 'OFF'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-800 text-[10px]">
                        <span className="font-mono text-slate-400">
                          {activeCount}/{chapQs.length} Soal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleActivateOnlyChapter(teacherChapterGradeTab, chap)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 font-bold text-amber-300 transition-colors"
                        >
                          Hanya Bab Ini
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="text-xs text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
              <span>
                Total Butir Soal Aktif di Room Ini:{'  '}
                <strong className="text-emerald-300 font-extrabold">
                  {teacherActiveQuestions.length} dari {questions.length} Soal
                </strong>
              </span>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 py-4 bg-slate-950 border-t border-slate-800 shrink-0">
          <div className="text-xs text-slate-400 font-mono">
            Room Saat Ini: <strong className="text-amber-400 font-bold">{currentRoomPin}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl flex items-center gap-2 shadow-lg transition-all"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Luncurkan Room Area ({tokenInput})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
