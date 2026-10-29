import React, { useMemo, useState } from 'react';
import {
  InformaticsQuestion,
  OptionKey,
  PlayerAnswerEvent,
  computeItemAnalysis,
} from '../data/informaticsData';
import { MapPlayerEntity } from './CyberArenaCanvas';
import {
  Download,
  RotateCcw,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Trophy,
  Target,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface ItemAnalysisViewProps {
  roomPin: string;
  questions: InformaticsQuestion[];
  sessionAnswers: PlayerAnswerEvent[];
  players: MapPlayerEntity[];
  isTeacherHost: boolean;
  localPlayerId?: string;
  localPlayerName?: string;
  localPlayerClass?: string;
  onPlayAgain: () => void;
  onBackToMapLobby: () => void;
  onOpenMaterialManager: () => void;
}

type ReportTab = 'RINGKASAN' | 'PEMBAHASAN' | 'PERINGKAT';
type QuestionFilter = 'ALL' | 'WRONG' | 'CORRECT' | 'UNANSWERED';

export const ItemAnalysisView: React.FC<ItemAnalysisViewProps> = ({
  roomPin,
  questions,
  sessionAnswers,
  players,
  isTeacherHost,
  localPlayerId,
  localPlayerName = 'Siswa MTsN 14',
  localPlayerClass = 'Kelas 7',
  onPlayAgain,
  onBackToMapLobby,
  onOpenMaterialManager,
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('RINGKASAN');
  const [questionFilter, setQuestionFilter] = useState<QuestionFilter>('ALL');

  const analysis = useMemo(
    () => computeItemAnalysis(questions, sessionAnswers, true),
    [questions, sessionAnswers]
  );

  // Jawaban terakhir per soal milik siswa yang sedang login
  const myAnswersByQuestionId = useMemo(() => {
    const map = new Map<string, PlayerAnswerEvent>();
    for (const ans of sessionAnswers) {
      if (localPlayerId && ans.playerId === localPlayerId) {
        map.set(ans.questionId, ans);
      } else if (!localPlayerId && ans.playerName === localPlayerName) {
        map.set(ans.questionId, ans);
      }
    }
    return map;
  }, [sessionAnswers, localPlayerId, localPlayerName]);

  // Statistik nilai siswa sendiri
  const myStats = useMemo(() => {
    const totalQuestions = questions.length;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    for (const q of questions) {
      const myAns = myAnswersByQuestionId.get(q.id);
      if (!myAns) {
        unanswered += 1;
      } else if (myAns.isCorrect) {
        correct += 1;
      } else {
        wrong += 1;
      }
    }

    const answered = correct + wrong;
    const finalScore = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    let predicate = 'Perlu Latihan Lagi';
    let predicateColor = 'text-rose-700 bg-rose-100 border-rose-300';
    let summaryAdvice =
      'Jangan menyerah! Masih banyak soal yang belum terjawab dengan tepat. Yuk cek tab Pembahasan Soal untuk memahami konsep dasarnya.';

    if (finalScore >= 85) {
      predicate = 'Sangat Mahir (A)';
      predicateColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
      summaryAdvice =
        'Luar biasa! Kamu sudah menguasai sebagian besar materi Informatika dengan sangat baik. Pertahankan prestasimu!';
    } else if (finalScore >= 70) {
      predicate = 'Mahir / Baik (B)';
      predicateColor = 'text-sky-800 bg-sky-100 border-sky-300';
      summaryAdvice =
        'Hasil yang bagus! Kamu sudah memahami materi utama, tinggal mempelajari kembali beberapa soal yang masih keliru.';
    } else if (finalScore >= 55) {
      predicate = 'Cukup Paham (C)';
      predicateColor = 'text-amber-800 bg-amber-100 border-amber-300';
      summaryAdvice =
        'Cukup baik! Kamu sudah mengenal dasar-dasarnya, namun perlu berlatih lagi pada topik yang nilainya masih di bawah 70%.';
    }

    return {
      totalQuestions,
      answered,
      correct,
      wrong,
      unanswered,
      finalScore,
      predicate,
      predicateColor,
      summaryAdvice,
    };
  }, [questions, myAnswersByQuestionId]);

  // Analisis penguasaan per topik materi Informatika
  const topicMasteryList = useMemo(() => {
    const map = new Map<
      string,
      {
        category: string;
        total: number;
        correct: number;
        wrong: number;
        unanswered: number;
        classCorrectPctSum: number;
      }
    >();

    for (const q of questions) {
      const existing = map.get(q.category) || {
        category: q.category,
        total: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
        classCorrectPctSum: 0,
      };
      existing.total += 1;

      const myAns = myAnswersByQuestionId.get(q.id);
      if (!myAns) {
        existing.unanswered += 1;
      } else if (myAns.isCorrect) {
        existing.correct += 1;
      } else {
        existing.wrong += 1;
      }

      const itemStat = analysis.items.find((it) => it.questionId === q.id);
      const classPct = itemStat ? Math.round(itemStat.difficultyIndex * 100) : 0;
      existing.classCorrectPctSum += classPct;

      map.set(q.category, existing);
    }

    return Array.from(map.values()).map((topic) => {
      const myPct = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0;
      const classAvgPct =
        topic.total > 0 ? Math.round(topic.classCorrectPctSum / topic.total) : 0;

      let statusLabel = 'Perlu Belajar Lagi';
      let statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
      let barColorClass = 'bg-rose-500';

      if (myPct >= 75) {
        statusLabel = 'Sudah Dikuasai';
        statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        barColorClass = 'bg-emerald-600';
      } else if (myPct >= 50) {
        statusLabel = 'Cukup Paham';
        statusBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
        barColorClass = 'bg-amber-500';
      }

      return {
        ...topic,
        myPct,
        classAvgPct,
        statusLabel,
        statusBadgeClass,
        barColorClass,
      };
    });
  }, [questions, myAnswersByQuestionId, analysis.items]);

  // Daftar peringkat siswa di kelas
  const sortedClassPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  // Rata-rata persentase jawaban benar kelas secara keseluruhan
  const classAverageScore = useMemo(() => {
    if (analysis.items.length === 0) return 0;
    return Math.round(analysis.meanDifficulty * 100);
  }, [analysis]);

  // Filter daftar soal untuk tab Pembahasan
  const filteredQuestionItems = useMemo(() => {
    return analysis.items.filter((item) => {
      const myAns = myAnswersByQuestionId.get(item.questionId);
      if (questionFilter === 'CORRECT') return Boolean(myAns?.isCorrect);
      if (questionFilter === 'WRONG') return Boolean(myAns && !myAns.isCorrect);
      if (questionFilter === 'UNANSWERED') return !myAns;
      return true;
    });
  }, [analysis.items, myAnswersByQuestionId, questionFilter]);

  const handleDownloadCsv = () => {
    const headers = [
      'No',
      'Kode Room',
      'Topik Materi',
      'Kelas',
      'Pertanyaan',
      'Kunci Jawaban',
      'Jawaban Siswa',
      'Status Jawaban Siswa',
      'Persentase Kelas Menjawab Benar (%)',
      'Tingkat Kesulitan Soal',
    ];

    const rows = analysis.items.map((item) => {
      const myAns = myAnswersByQuestionId.get(item.questionId);
      const classCorrectPct = Math.round(item.difficultyIndex * 100);
      const simpleDifficulty =
        classCorrectPct >= 70 ? 'Mudah' : classCorrectPct >= 40 ? 'Sedang' : 'Sulit';

      return [
        item.questionNumber,
        roomPin || 'MTN14',
        `"${item.category}"`,
        `Kelas ${item.gradeLevel}`,
        `"${item.question.replace(/"/g, '""')}"`,
        item.correctAnswer,
        myAns ? myAns.selectedOption : '-',
        myAns ? (myAns.isCorrect ? 'Benar' : 'Salah') : 'Belum Dijawab',
        `${classCorrectPct}%`,
        simpleDifficulty,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Hasil_CBT_Informatika_${roomPin || 'MTN14'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-200 text-slate-900 overflow-hidden select-none">
      {/* Header Resmi Hasil CBT */}
      <header className="shrink-0 bg-emerald-950 text-white border-b-4 border-amber-400 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-xs shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-800 text-amber-300 border border-emerald-700">
                HASIL & ANALISIS CBT MANDIRI
              </span>
              <span className="text-xs text-emerald-200 font-medium">
                MTs Negeri 14 Jakarta Timur · Room: {roomPin || 'MTN14'}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white mt-0.5">
              Rapor Kemampuan Informatika — {localPlayerName} ({localPlayerClass})
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Unduh Rekap (CSV)</span>
          </button>

          {isTeacherHost && (
            <button
              type="button"
              onClick={onOpenMaterialManager}
              className="px-3 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 text-xs font-bold transition-colors"
            >
              Kelola Bank Soal
            </button>
          )}

          {isTeacherHost && (
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sesi Kelas</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToMapLobby}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-950 text-xs font-extrabold transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Arena 3D</span>
          </button>
        </div>
      </header>

      {/* Konten Utama (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* 4 Kartu Ringkasan Sederhana */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Kartu 1: Nilai Akhir */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  NILAI AKHIR KAMU
                </span>
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tabular-nums">
                  {myStats.finalScore}
                </span>
                <span className="text-xs font-bold text-slate-500">/ 100</span>
              </div>
              <div>
                <span
                  className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border ${myStats.predicateColor}`}
                >
                  {myStats.predicate}
                </span>
              </div>
            </div>

            {/* Kartu 2: Jawaban Benar */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  JAWABAN BENAR
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono tabular-nums">
                  {myStats.correct}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  dari {myStats.totalQuestions} Soal
                </span>
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Sudah dijawab: <strong>{myStats.answered}</strong> soal
              </div>
            </div>

            {/* Kartu 3: Salah & Belum Dijawab */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  PERLU DIPERBAIKI
                </span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="my-2 flex items-baseline gap-3">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-rose-600 font-mono tabular-nums">
                    {myStats.wrong}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">Salah</span>
                </div>
                <div className="text-slate-300">|</div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tabular-nums">
                    {myStats.unanswered}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">Kosong</span>
                </div>
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Klik tab <strong>Pembahasan Soal</strong> untuk belajar
              </div>
            </div>

            {/* Kartu 4: Rata-Rata Kelas */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  RATA-RATA KELAS
                </span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-sky-700 font-mono tabular-nums">
                  {classAverageScore}
                </span>
                <span className="text-xs font-bold text-slate-500">/ 100</span>
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Total peserta aktif: <strong>{sortedClassPlayers.length}</strong> siswa
              </div>
            </div>
          </div>

          {/* Kotak Kesimpulan Singkat yang Mudah Dipahami */}
          <div className="bg-white rounded-2xl border-2 border-emerald-600/30 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Kesimpulan Kemampuan Mandiri Kamu
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 mt-0.5 leading-relaxed">
                  {myStats.summaryAdvice}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('PEMBAHASAN')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shrink-0 transition-colors shadow-xs"
            >
              Lihat Pembahasan Jawaban →
            </button>
          </div>

          {/* Navigasi 3 Tab Utama */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-300/80 p-1.5 rounded-xl border border-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('RINGKASAN')}
              className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'RINGKASAN'
                  ? 'bg-white text-emerald-950 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>1. Kemampuan per Materi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PEMBAHASAN')}
              className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'PEMBAHASAN'
                  ? 'bg-white text-emerald-950 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:bg-white/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-sky-700" />
              <span>2. Pembahasan Soal ({questions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PERINGKAT')}
              className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'PERINGKAT'
                  ? 'bg-white text-emerald-950 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:bg-white/50'
              }`}
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>3. Peringkat Kelas ({sortedClassPlayers.length})</span>
            </button>
          </div>

          {/* =================================================================
              TAB 1: KEMAMPUAN PER MATERI (MUDAH DIMENGERTI)
             ================================================================= */}
          {activeTab === 'RINGKASAN' && (
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Peta Penguasaan Materi Informatika
                  </h3>
                  <p className="text-xs text-slate-600">
                    Lihat materi mana yang sudah kamu kuasai dan materi mana yang perlu dipelajari lagi.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" /> ≥ 75% (Sudah Dikuasai)
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" /> 50–74% (Cukup)
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" /> &lt; 50% (Perlu Latihan)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topicMasteryList.map((topic) => (
                  <div
                    key={topic.category}
                    className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {topic.category}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Benar <strong>{topic.correct}</strong> dari <strong>{topic.total}</strong> soal
                          {topic.unanswered > 0 ? ` (${topic.unanswered} belum dijawab)` : ''}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md border shrink-0 ${topic.statusBadgeClass}`}
                      >
                        {topic.statusLabel}
                      </span>
                    </div>

                    {/* Progress Bar Penguasaan Siswa */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">Penguasaan Kamu</span>
                        <span className="font-mono text-slate-950">{topic.myPct}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                        <div
                          className={`h-full transition-all duration-300 ${topic.barColorClass}`}
                          style={{ width: `${Math.max(4, topic.myPct)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Rata-rata teman sekelas di materi ini:</span>
                        <span className="font-mono font-bold text-slate-700">
                          {topic.classAvgPct}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 2: PEMBAHASAN SOAL SATU PER SATU (JELAS & MUDAH DIBACA)
             ================================================================= */}
          {activeTab === 'PEMBAHASAN' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Daftar Soal & Pembahasan Lengkap
                  </h3>
                  <p className="text-xs text-slate-600">
                    Pelajari kunci jawaban dan penjelasan di setiap soal agar kamu makin paham.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      questionFilter === 'ALL'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({questions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('WRONG')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      questionFilter === 'WRONG'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Jawaban Salah ({myStats.wrong})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('CORRECT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      questionFilter === 'CORRECT'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Jawaban Benar ({myStats.correct})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('UNANSWERED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      questionFilter === 'UNANSWERED'
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Belum Dijawab ({myStats.unanswered})
                  </button>
                </div>
              </div>

              {filteredQuestionItems.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 text-center text-sm text-slate-600 font-medium">
                  Tidak ada soal pada kategori filter ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestionItems.map((item) => {
                    const fullQ = questions.find((q) => q.id === item.questionId);
                    const myAns = myAnswersByQuestionId.get(item.questionId);
                    const classCorrectPct = Math.round(item.difficultyIndex * 100);
                    const simpleDifficulty =
                      classCorrectPct >= 70
                        ? 'Mudah'
                        : classCorrectPct >= 40
                        ? 'Sedang'
                        : 'Sulit';

                    return (
                      <div
                        key={item.questionId}
                        className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-6 shadow-xs space-y-4"
                      >
                        {/* Baris Atas: Nomor, Topik, Status Jawaban Kamu */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-mono font-black text-xs">
                              SOAL #{item.questionNumber}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold">
                              {item.category}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              Kelas {item.gradeLevel} · Tingkat Kesulitan:{' '}
                              <strong className="text-slate-800">{simpleDifficulty}</strong> (
                              {classCorrectPct}% siswa benar)
                            </span>
                          </div>

                          {/* Status Jawaban Siswa */}
                          <div>
                            {!myAns ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold">
                                <HelpCircle className="w-3.5 h-3.5" />
                                Belum Kamu Jawab
                              </span>
                            ) : myAns.isCorrect ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-extrabold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                Jawabanmu Benar ({myAns.selectedOption})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-100 border border-rose-300 text-rose-900 text-xs font-extrabold">
                                <XCircle className="w-3.5 h-3.5 text-rose-700" />
                                Jawabanmu Kurang Tepat (Pilih {myAns.selectedOption}, Kunci:{' '}
                                {item.correctAnswer})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Teks Pertanyaan */}
                        <div className="text-sm sm:text-base font-bold text-slate-950 leading-relaxed">
                          {item.question}
                        </div>

                        {/* Daftar Opsi A, B, C, D */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(['A', 'B', 'C', 'D'] as OptionKey[]).map((optKey) => {
                            const isCorrectKey = item.correctAnswer === optKey;
                            const isMyChoice = myAns?.selectedOption === optKey;
                            const pct = item.optionPercentages[optKey];

                            let boxStyle = 'bg-slate-50 border-slate-200 text-slate-800';
                            if (isCorrectKey) {
                              boxStyle =
                                'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                            } else if (isMyChoice && !isCorrectKey) {
                              boxStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-semibold';
                            }

                            return (
                              <div
                                key={optKey}
                                className={`p-3 rounded-xl border-2 flex items-start justify-between gap-2 text-xs sm:text-sm ${boxStyle}`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <span
                                    className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                                      isCorrectKey
                                        ? 'bg-emerald-600 text-white'
                                        : isMyChoice
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-slate-200 text-slate-800'
                                    }`}
                                  >
                                    {optKey}
                                  </span>
                                  <div>
                                    <div>{fullQ?.options[optKey] || ''}</div>
                                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                                      {isCorrectKey && (
                                        <span className="font-extrabold text-emerald-700">
                                          ✓ Kunci Jawaban Benar
                                        </span>
                                      )}
                                      {isMyChoice && !isCorrectKey && (
                                        <span className="font-extrabold text-rose-700">
                                          ✗ Pilihan Kamu
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <span className="font-mono text-[11px] font-bold text-slate-500 shrink-0">
                                  {pct}% siswa
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Kotak Penjelasan / Pembahasan */}
                        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                          <span className="font-extrabold text-sky-900">
                            💡 Pembahasan Mudah:{' '}
                          </span>
                          {item.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              TAB 3: PERINGKAT KELAS (LEADERBOARD SEDERHANA)
             ================================================================= */}
          {activeTab === 'PERINGKAT' && (
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Peringkat Nilai Siswa di Kelas (Room: {roomPin || 'MTN14'})
                  </h3>
                  <p className="text-xs text-slate-600">
                    Urutan peringkat berdasarkan skor dan jumlah jawaban benar selama mengerjakan CBT.
                  </p>
                </div>
              </div>

              {sortedClassPlayers.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  Belum ada data siswa di sesi kelas ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200 bg-slate-100 text-xs font-extrabold text-slate-700 uppercase">
                        <th className="py-3 px-4">Peringkat</th>
                        <th className="py-3 px-4">Nama Siswa</th>
                        <th className="py-3 px-4">Kelas</th>
                        <th className="py-3 px-4 text-center">Jawaban Benar</th>
                        <th className="py-3 px-4 text-center">Nilai CBT (0-100)</th>
                        <th className="py-3 px-4 text-right">Total Poin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                      {sortedClassPlayers.map((p, idx) => {
                        const correctCount = sessionAnswers.filter(
                          (a) => a.playerId === p.id && a.isCorrect
                        ).length;
                        const cbtScore =
                          questions.length > 0
                            ? Math.round((correctCount / questions.length) * 100)
                            : 0;
                        const isMe =
                          (localPlayerId && p.id === localPlayerId) ||
                          p.name === localPlayerName;

                        return (
                          <tr
                            key={p.id}
                            className={
                              isMe ? 'bg-emerald-50/80 font-bold' : 'hover:bg-slate-50'
                            }
                          >
                            <td className="py-3 px-4 font-mono font-black text-slate-800">
                              #{idx + 1}
                            </td>
                            <td className="py-3 px-4 flex items-center gap-2.5">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 border border-slate-400"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="text-slate-900">{p.name}</span>
                              {isMe && (
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-700 text-white">
                                  Kamu
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600">{p.studentClass}</td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                              {correctCount} / {questions.length}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-black text-slate-900">
                              {cbtScore}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-sky-800">
                              {p.score} Poin
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
