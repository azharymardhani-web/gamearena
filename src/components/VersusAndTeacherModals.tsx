import React, { useEffect, useState } from 'react';
import {
  InformaticsMaterial,
  InformaticsQuestion,
  OptionKey,
  PlayerAnswerEvent,
} from '../data/informaticsData';
import { MapPlayerEntity } from './CyberArenaCanvas';
import { soundEngine } from '../utils/soundEngine';
import {
  Swords,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  X,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface VersusChallengeItem {
  prompt: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

const VERSUS_MINI_CHALLENGES: VersusChallengeItem[] = [
  {
    prompt: 'Konversi cepat bilangan biner 1010(2) ke desimal adalah...',
    options: ['8', '10', '12', '14'],
    correctIndex: 1,
    topic: 'Sistem Bilangan Biner',
  },
  {
    prompt: 'Gerbang logika AND menghasilkan output 1 jika kedua input bernilai...',
    options: ['0 dan 0', '1 dan 0', '0 dan 1', '1 dan 1'],
    correctIndex: 3,
    topic: 'Gerbang Logika CPU',
  },
  {
    prompt: 'Protokol web yang mengenkripsi paket data dengan SSL/TLS adalah...',
    options: ['HTTP', 'FTP', 'HTTPS', 'TELNET'],
    correctIndex: 2,
    topic: 'Keamanan Jaringan',
  },
  {
    prompt: 'Fungsi spreadsheet untuk mencari nilai rata-rata rentang sel adalah...',
    options: ['=SUM()', '=AVERAGE()', '=COUNT()', '=MAX()'],
    correctIndex: 1,
    topic: 'Analisis Data',
  },
  {
    prompt: 'Memecah masalah kompleks menjadi bagian lebih kecil disebut...',
    options: ['Dekomposisi', 'Abstraksi', 'Enkripsi', 'Kompilasi'],
    correctIndex: 0,
    topic: 'Berpikir Komputasional',
  },
  {
    prompt: 'Hasil operasi sisa bagi (Modulo) dari 14 % 4 adalah...',
    options: ['1', '2', '3', '4'],
    correctIndex: 1,
    topic: 'Algoritma & Pemrograman',
  },
  {
    prompt: 'Memori komputer yang datanya hilang saat listrik padam (Volatile) adalah...',
    options: ['ROM', 'Harddisk', 'RAM', 'Flashdisk'],
    correctIndex: 2,
    topic: 'Sistem Komputer',
  },
];

interface VersusDuelModalProps {
  isOpen: boolean;
  opponent: MapPlayerEntity | null;
  localPlayerName: string;
  onClose: () => void;
  onCompleteVersus: (won: boolean, mpEarned: number, scoreEarned: number) => void;
}

export const VersusDuelModal: React.FC<VersusDuelModalProps> = ({
  isOpen,
  opponent,
  localPlayerName,
  onClose,
  onCompleteVersus,
}) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  const [oppPoints, setOppPoints] = useState(0);
  const [roundSet, setRoundSet] = useState<VersusChallengeItem[]>([]);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && opponent) {
      const shuffled = [...VERSUS_MINI_CHALLENGES]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      setRoundSet(shuffled);
      setRoundIdx(0);
      setMyPoints(0);
      setOppPoints(0);
      setFinished(false);
      setTimeLeft(8);
      setLastFeedback(null);
    }
  }, [isOpen, opponent]);

  useEffect(() => {
    if (!isOpen || finished || roundSet.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSelectOption(-1);
          return 8;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  });

  if (!isOpen || !opponent || roundSet.length === 0) return null;

  const currentChallenge = roundSet[roundIdx] || roundSet[0];

  const handleSelectOption = (idx: number) => {
    if (finished) return;
    const isCorrect = idx === currentChallenge.correctIndex;
    const myGain = isCorrect ? 100 + timeLeft * 10 : 0;
    // Opponent simulated reflex score
    const oppCorrect = Math.random() < 0.65;
    const oppGain = oppCorrect ? 95 : 0;

    const nextMy = myPoints + myGain;
    const nextOpp = oppPoints + oppGain;
    setMyPoints(nextMy);
    setOppPoints(nextOpp);

    if (isCorrect) {
      soundEngine.playCorrectAnswer();
      setLastFeedback(`TEPAT! +${myGain} Poin Duel`);
    } else {
      soundEngine.playWrongAnswer();
      setLastFeedback(`Kurang Tepat! Jawaban: ${currentChallenge.options[currentChallenge.correctIndex]}`);
    }

    if (roundIdx + 1 < roundSet.length) {
      setTimeout(() => {
        setRoundIdx((r) => r + 1);
        setTimeLeft(8);
        setLastFeedback(null);
      }, 650);
    } else {
      setTimeout(() => {
        setFinished(true);
        const won = nextMy >= nextOpp;
        if (won) soundEngine.playVictoryFanfare();
      }, 650);
    }
  };

  const wonDuel = myPoints >= oppPoints;
  const rewardMp = wonDuel ? 100 : 40;
  const rewardScore = wonDuel ? 150 : 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Versus Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Swords className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-100 font-display">
                DUEL VERSUS ANTAR SISWA (1v1)
              </h2>
              <p className="text-xs text-slate-400">
                Menangkan duel cepat untuk meraih Poin Misi (MP) pembuka soal Guru!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scoreboard Bar */}
        <div className="grid grid-cols-3 items-center px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 text-center">
          <div className="text-left">
            <div className="text-xs font-bold text-sky-400 truncate">{localPlayerName}</div>
            <div className="text-2xl font-extrabold font-mono text-slate-100 tabular-nums">
              {myPoints}
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-amber-400">
            {finished ? 'HASIL AKHIR' : `RONDE ${roundIdx + 1}/3 · ${timeLeft}d`}
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-rose-400 truncate">
              {opponent.name} ({opponent.studentClass})
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-100 tabular-nums">
              {oppPoints}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {!finished ? (
            <>
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-sky-400">
                  Topik Cepat: {currentChallenge.topic}
                </span>
                <p className="text-base font-bold text-slate-100 leading-snug">
                  {currentChallenge.prompt}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentChallenge.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="p-3.5 text-left text-xs font-semibold text-slate-100 bg-slate-950 hover:bg-sky-950/60 border border-slate-800 hover:border-sky-500 rounded-xl transition-colors"
                  >
                    <span className="font-mono font-bold text-sky-400 mr-2">
                      [{idx + 1}]
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              {lastFeedback && (
                <div className="text-center text-xs font-bold text-amber-300 pt-1">
                  {lastFeedback}
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-100 font-display">
                {wonDuel ? 'KEMENANGAN VERSUS! +RESPECT' : 'DUEL SELESAI! TETAP SEMANGAT'}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Kamu memperoleh tambahan{' '}
                <strong className="text-emerald-400 font-mono">+{rewardMp} Poin Misi (MP)</strong>{' '}
                dan <strong className="text-sky-400 font-mono">+{rewardScore} Skor Respect</strong>!
                Gunakan Poin Misi tersebut untuk menemui <strong>Pak Azhary Mardhani, S.Kom</strong>{' '}
                di map dan menjawab soal ujian!
              </p>

              <button
                onClick={() => {
                  onCompleteVersus(wonDuel, rewardMp, rewardScore);
                  onClose();
                }}
                className="w-full py-3 px-6 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
              >
                Klaim +{rewardMp} Poin Misi & Kembali ke Map 3D
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TeacherQuestModalProps {
  isOpen: boolean;
  teacherStationIndex: number;
  questions: InformaticsQuestion[];
  materials: InformaticsMaterial[];
  answeredQuestionIds: Set<string>;
  missionPoints: number;
  localPlayerId: string;
  localPlayerName: string;
  onClose: () => void;
  onSubmitTeacherAnswer: (
    event: PlayerAnswerEvent,
    missionPointCost: number
  ) => void;
  onOpenFullAnalysis: () => void;
}

export const TeacherQuestModal: React.FC<TeacherQuestModalProps> = ({
  isOpen,
  teacherStationIndex,
  questions,
  materials,
  answeredQuestionIds,
  missionPoints,
  localPlayerId,
  localPlayerName,
  onClose,
  onSubmitTeacherAnswer,
  onOpenFullAnalysis,
}) => {
  // Select the first unanswered question (or allow picking any question in the list)
  const [selectedQId, setSelectedQId] = useState<string>('');
  const [questionStartMs, setQuestionStartMs] = useState<number>(performance.now());
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    chosen: OptionKey;
    correctKey: OptionKey;
    explanation: string;
    pointsEarned: number;
  } | null>(null);
  const [showMaterialTab, setShowMaterialTab] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const firstUnanswered =
        questions.find((q) => !answeredQuestionIds.has(q.id)) ||
        questions[teacherStationIndex % Math.max(1, questions.length)] ||
        questions[0];
      if (firstUnanswered) {
        setSelectedQId(firstUnanswered.id);
      }
      setQuestionStartMs(performance.now());
      setLastResult(null);
    }
  }, [isOpen, teacherStationIndex, questions, answeredQuestionIds]);

  if (!isOpen) return null;

  const activeQ = questions.find((q) => q.id === selectedQId) || questions[0];
  if (!activeQ) return null;

  const relatedMaterial =
    materials.find((m) => m.id === activeQ.materialId || m.category === activeQ.category) ||
    materials[0];

  const isAlreadyAnswered = answeredQuestionIds.has(activeQ.id);
  const QUESTION_MP_COST = 40;
  const canAfford = missionPoints >= QUESTION_MP_COST || isAlreadyAnswered;

  const handleChooseOption = (opt: OptionKey) => {
    if (isAlreadyAnswered || !canAfford) return;
    const elapsedMs = Math.max(600, Math.round(performance.now() - questionStartMs));
    const isCorrect = opt === activeQ.correctAnswer;
    const pointsEarned = isCorrect ? activeQ.points : 0;

    if (isCorrect) {
      soundEngine.playCorrectAnswer();
    } else {
      soundEngine.playWrongAnswer();
    }

    const event: PlayerAnswerEvent = {
      questionId: activeQ.id,
      playerId: localPlayerId,
      playerName: localPlayerName,
      teamColor: 'sky',
      selectedOption: opt,
      isCorrect,
      responseTimeMs: elapsedMs,
      pointsEarned,
      playerTotalScoreAfter: pointsEarned,
    };

    onSubmitTeacherAnswer(event, QUESTION_MP_COST);
    setLastResult({
      isCorrect,
      chosen: opt,
      correctKey: activeQ.correctAnswer,
      explanation: activeQ.explanation,
      pointsEarned,
    });
  };

  const handleSelectNextUnanswered = () => {
    const nextUnanswered = questions.find(
      (q) => q.id !== activeQ.id && !answeredQuestionIds.has(q.id)
    );
    if (nextUnanswered) {
      setSelectedQId(nextUnanswered.id);
      setQuestionStartMs(performance.now());
      setLastResult(null);
    } else {
      onOpenFullAnalysis();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header: Pos Misi Guru Azhary Mardhani, S.Kom */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-400">
                POS MISI GURU INFORMATIKA · MTs NEGERI 14 JAKARTA
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-100 font-display">
                Azhary Mardhani, S.Kom — Pengujian Misi & Evaluasi Soal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono tabular-nums">
              <span className="text-slate-400">Poin Misi (MP): </span>
              <strong className="text-emerald-400">{missionPoints} MP</strong>
            </div>
            <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono tabular-nums">
              <span className="text-slate-400">Progres Misi: </span>
              <strong className="text-sky-400">
                {answeredQuestionIds.size}/{questions.length} Soal
              </strong>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Split: Left Question Selector List + Right Active Question & Material */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: All Mission Questions */}
          <div className="lg:col-span-4 p-4 bg-slate-950/50 space-y-2 overflow-y-auto max-h-[65vh]">
            <div className="text-xs font-bold text-slate-400 px-1 pb-1">
              DAFTAR SOAL MISI ({answeredQuestionIds.size}/{questions.length} TUNTAS)
            </div>
            {questions.map((q, idx) => {
              const done = answeredQuestionIds.has(q.id);
              const isCurrent = q.id === activeQ.id;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQId(q.id);
                    setQuestionStartMs(performance.now());
                    setLastResult(null);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-sky-950/60 border-sky-500 text-slate-100'
                      : done
                      ? 'bg-emerald-950/25 border-emerald-800/50 text-emerald-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-mono font-bold mr-1.5">#{idx + 1}</span>
                    <span>{q.category}</span>
                  </div>
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400 shrink-0">
                      {QUESTION_MP_COST} MP
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Question & Material Briefing */}
          <div className="lg:col-span-8 p-6 space-y-5 overflow-y-auto">
            {/* Toggle Material Briefing */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-400">
                {activeQ.category} · {activeQ.gradeLevel} · {activeQ.cognitiveLevel} · Skor{' '}
                <strong className="font-mono text-sky-400">{activeQ.points} PTS</strong>
              </div>
              <button
                onClick={() => setShowMaterialTab((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-300 bg-sky-950/50 hover:bg-sky-900/60 border border-sky-700/60 rounded-lg transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {showMaterialTab ? 'Sembunyikan Modul Materi' : 'Baca Materi Pendukung'}
              </button>
            </div>

            {showMaterialTab && relatedMaterial && (
              <div className="p-4 bg-slate-950 border border-sky-800/70 rounded-xl space-y-2">
                <div className="text-xs font-bold text-sky-400">
                  Modul Materi: {relatedMaterial.title}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{relatedMaterial.summary}</p>
                <div className="text-xs font-mono text-amber-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  {relatedMaterial.formulaOrLogic}
                </div>
              </div>
            )}

            {/* Question Stem */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <p className="text-sm md:text-base font-bold text-slate-100 leading-relaxed">
                {activeQ.question}
              </p>
            </div>

            {/* If Not Enough Mission Points */}
            {!canAfford && !isAlreadyAnswered && (
              <div className="p-4 bg-amber-950/40 border border-amber-700/70 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-200 leading-relaxed">
                    Kamu membutuhkan <strong>{QUESTION_MP_COST} Poin Misi (MP)</strong> untuk
                    membuka soal ini. Cari <strong>Barang Komponen (+50 MP)</strong> di map jalanan
                    atau lakukan <strong>Duel Versus 1v1 (+100 MP)</strong> saat bertemu siswa lain!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg whitespace-nowrap shrink-0"
                >
                  Cari Barang / Versus di Map
                </button>
              </div>
            )}

            {/* Option Buttons A, B, C, D */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
                const showCorrectHighlight =
                  (lastResult || isAlreadyAnswered) && activeQ.correctAnswer === key;
                const showWrongHighlight =
                  lastResult && !lastResult.isCorrect && lastResult.chosen === key;

                return (
                  <button
                    key={key}
                    disabled={isAlreadyAnswered || !canAfford}
                    onClick={() => handleChooseOption(key)}
                    className={`p-4 rounded-xl border text-left text-xs font-semibold transition-all flex items-start justify-between gap-2 ${
                      showCorrectHighlight
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                        : showWrongHighlight
                        ? 'bg-rose-950/50 border-rose-500 text-rose-200'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-100 disabled:opacity-60'
                    }`}
                  >
                    <span>
                      <strong className="font-mono text-sky-400 mr-2">{key}.</strong>
                      {activeQ.options[key]}
                    </span>
                    {showCorrectHighlight && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {showWrongHighlight && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Immediate Feedback & Explanation */}
            {(lastResult || isAlreadyAnswered) && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                {lastResult && (
                  <div
                    className={`text-sm font-extrabold font-display ${
                      lastResult.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {lastResult.isCorrect
                      ? `✓ JAWABAN BENAR! +${lastResult.pointsEarned} POIN RESPECT`
                      : `✕ JAWABAN KURANG TEPAT (Kunci: Opsi ${lastResult.correctKey})`}
                  </div>
                )}
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-sky-400">Pembahasan Pak Azhary: </strong>
                  {activeQ.explanation}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
                  >
                    Lanjut Eksplorasi Map 3D
                  </button>

                  <button
                    onClick={handleSelectNextUnanswered}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg"
                  >
                    <span>
                      {answeredQuestionIds.size < questions.length
                        ? 'Soal Misi Berikutnya'
                        : 'Misi Selesai! Lihat Analisis Butir Soal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
