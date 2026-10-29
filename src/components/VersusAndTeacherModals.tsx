import React, { useEffect, useState } from 'react';
import {
  InformaticsMaterial,
  InformaticsQuestion,
  OptionKey,
  PlayerAnswerEvent,
} from '../data/informaticsData';
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
  Clock,
  ShieldCheck,
} from 'lucide-react';

export interface VersusChallengeItem {
  prompt: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

export interface VersusMatchStateClient {
  id: string;
  pin: string;
  status: 'PENDING_CONSENT' | 'IN_PROGRESS' | 'FINISHED' | 'DECLINED' | 'CANCELLED';
  challengerId: string;
  challengerName: string;
  challengerClass: string;
  opponentId: string;
  opponentName: string;
  opponentClass: string;
  isBotOpponent: boolean;
  roundIdx: number;
  questions: VersusChallengeItem[];
  challengerScore: number;
  opponentScore: number;
  challengerAnsweredRound: number;
  opponentAnsweredRound: number;
  createdAt: number;
  updatedAt: number;
}

interface VersusDuelModalProps {
  activeMatch: VersusMatchStateClient | null;
  localPlayerId: string;
  localPlayerName: string;
  onRespondConsent: (matchId: string, accept: boolean) => void;
  onSubmitRoundAnswer: (
    matchId: string,
    roundIdx: number,
    selectedIndex: number,
    timeLeftSec: number
  ) => void;
  onCloseMatch: (matchId: string, won?: boolean, mpEarned?: number, scoreEarned?: number) => void;
}

export const VersusDuelModal: React.FC<VersusDuelModalProps> = ({
  activeMatch,
  localPlayerId,
  localPlayerName,
  onRespondConsent,
  onSubmitRoundAnswer,
  onCloseMatch,
}) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [localAnsweredRound, setLocalAnsweredRound] = useState<number>(-1);

  const roundIdx = activeMatch?.roundIdx ?? 0;
  const matchStatus = activeMatch?.status;

  useEffect(() => {
    setTimeLeft(10);
    setLastFeedback(null);
  }, [activeMatch?.id, roundIdx, matchStatus]);

  useEffect(() => {
    if (!activeMatch) {
      setLocalAnsweredRound(-1);
    }
  }, [activeMatch?.id]);

  const isChallenger = activeMatch?.challengerId === localPlayerId;
  const serverAnsweredRound = activeMatch
    ? isChallenger
      ? activeMatch.challengerAnsweredRound
      : activeMatch.opponentAnsweredRound
    : -1;
  const hasAnsweredThisRound =
    serverAnsweredRound >= roundIdx || localAnsweredRound >= roundIdx;

  useEffect(() => {
    if (!activeMatch || activeMatch.status !== 'IN_PROGRESS' || hasAnsweredThisRound) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setLocalAnsweredRound(roundIdx);
          onSubmitRoundAnswer(activeMatch.id, roundIdx, -1, 0);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeMatch, roundIdx, hasAnsweredThisRound, onSubmitRoundAnswer]);

  if (!activeMatch) return null;

  const myScore = isChallenger ? activeMatch.challengerScore : activeMatch.opponentScore;
  const oppScore = isChallenger ? activeMatch.opponentScore : activeMatch.challengerScore;
  const oppName = isChallenger ? activeMatch.opponentName : activeMatch.challengerName;
  const oppClass = isChallenger ? activeMatch.opponentClass : activeMatch.challengerClass;
  const oppAnsweredRound = isChallenger
    ? activeMatch.opponentAnsweredRound
    : activeMatch.challengerAnsweredRound;
  const oppHasAnsweredThisRound = oppAnsweredRound >= roundIdx;

  const currentChallenge =
    activeMatch.questions[roundIdx] || activeMatch.questions[0] || {
      prompt: 'Konversi biner 1010(2) ke desimal adalah...',
      options: ['8', '10', '12', '14'],
      correctIndex: 1,
      topic: 'Sistem Bilangan Biner',
    };

  const handleSelectOption = (idx: number) => {
    if (activeMatch.status !== 'IN_PROGRESS' || hasAnsweredThisRound) return;
    setLocalAnsweredRound(roundIdx);
    const isCorrect = idx === currentChallenge.correctIndex;
    const myGain = isCorrect ? 100 + timeLeft * 10 : 0;

    if (isCorrect) {
      soundEngine.playCorrectAnswer();
      setLastFeedback(`✓ TEPAT! +${myGain} Poin Duel Realtime`);
    } else {
      soundEngine.playWrongAnswer();
      setLastFeedback(
        `✕ Kurang Tepat! Kunci: ${currentChallenge.options[currentChallenge.correctIndex]}`
      );
    }

    onSubmitRoundAnswer(activeMatch.id, roundIdx, idx, timeLeft);
  };

  const wonDuel = myScore >= oppScore;
  const rewardMp = wonDuel ? 100 : 45;
  const rewardScore = wonDuel ? 150 : 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-2.5 sm:p-4 overflow-y-auto overscroll-contain touch-pan-y">
      <div className="w-full max-w-xl max-h-[92dvh] flex flex-col bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Versus Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <Swords className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-extrabold text-slate-100 font-display truncate">
                DUEL VERSUS REAL-TIME (1v1) · MTsN 14 HALIM
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Persetujuan kedua belah pihak · Soal & skor tersinkronisasi secara realtime
              </p>
            </div>
          </div>
          <button
            onClick={() => onCloseMatch(activeMatch.id)}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y">
        {/* STATE 1: PENDING MUTUAL CONSENT */}
        {activeMatch.status === 'PENDING_CONSENT' && (
          <div className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400">
              <Swords className="w-7 h-7" />
            </div>
            {isChallenger ? (
              <>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-100 font-display">
                  Menunggu Persetujuan dari {oppName} ({oppClass})...
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Undangan duel 1v1 telah dikirim ke layar <strong>{oppName}</strong> secara
                  realtime. Duel akan langsung dimulai begitu temanmu menekan tombol{' '}
                  <strong className="text-emerald-400">Terima Duel</strong>.
                </p>
                <button
                  onClick={() => {
                    onRespondConsent(activeMatch.id, false);
                    onCloseMatch(activeMatch.id);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-rose-900/80 border border-slate-700 rounded-xl transition-colors"
                >
                  Batalkan Tantangan Duel
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-100 font-display">
                  {oppName} ({oppClass}) Mengajak Kamu Duel Versus 1v1!
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Terima tantangan duel cepat 3 soal Informatika untuk memperebutkan{' '}
                  <strong className="text-emerald-400">+100 Poin Misi (MP)</strong> dan{' '}
                  <strong className="text-sky-400">+150 Skor Respect</strong>!
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      soundEngine.playDash();
                      onRespondConsent(activeMatch.id, true);
                    }}
                    className="px-6 py-3 text-xs font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg transition-colors"
                  >
                    ✓ Setuju & Mulai Duel Sekarang
                  </button>
                  <button
                    onClick={() => {
                      onRespondConsent(activeMatch.id, false);
                      onCloseMatch(activeMatch.id);
                    }}
                    className="px-5 py-3 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-rose-900 border border-slate-700 rounded-xl transition-colors"
                  >
                    ✕ Tolak
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STATE 2: DECLINED */}
        {activeMatch.status === 'DECLINED' && (
          <div className="p-6 text-center space-y-4">
            <h3 className="text-lg font-extrabold text-rose-400">
              Tantangan Duel Ditolak / Dibatalkan
            </h3>
            <p className="text-xs text-slate-300">
              Duel Versus dibatalkan karena salah satu pihak belum siap. Silakan cari teman lain di
              arena MTsN 14 Halim!
            </p>
            <button
              onClick={() => onCloseMatch(activeMatch.id)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              Kembali ke Map 3D
            </button>
          </div>
        )}

        {/* STATE 3: IN_PROGRESS OR FINISHED */}
        {(activeMatch.status === 'IN_PROGRESS' || activeMatch.status === 'FINISHED') && (
          <>
            {/* Live Real-Time Scoreboard Bar */}
            <div className="grid grid-cols-3 items-center px-4 sm:px-6 py-3 bg-slate-950/70 border-b border-slate-800 text-center">
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-sky-400 truncate">
                  {localPlayerName} (Kamu)
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-100 tabular-nums">
                  {myScore}
                </div>
                {activeMatch.status === 'IN_PROGRESS' && (
                  <div className="text-[10px] font-mono text-emerald-400">
                    {hasAnsweredThisRound ? '✓ Sudah Jawab' : '● Menjawab...'}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center">
                <span className="text-xs font-mono font-extrabold text-amber-400">
                  {activeMatch.status === 'FINISHED'
                    ? 'HASIL AKHIR'
                    : `RONDE ${roundIdx + 1}/3 · ${timeLeft}d`}
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Live Sync
                </span>
              </div>

              <div className="text-right min-w-0">
                <div className="text-xs font-bold text-rose-400 truncate">
                  {oppName} ({oppClass})
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-100 tabular-nums">
                  {oppScore}
                </div>
                {activeMatch.status === 'IN_PROGRESS' && (
                  <div className="text-[10px] font-mono text-amber-300">
                    {oppHasAnsweredThisRound ? '✓ Sudah Jawab' : '● Berpikir...'}
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-4">
              {activeMatch.status === 'IN_PROGRESS' ? (
                <>
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono text-sky-400">
                      Topik Cepat: {currentChallenge.topic}
                    </span>
                    <p className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                      {currentChallenge.prompt}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentChallenge.options.map((opt, idx) => (
                      <button
                        key={idx}
                        disabled={hasAnsweredThisRound}
                        onClick={() => handleSelectOption(idx)}
                        className="p-3.5 text-left text-xs font-semibold text-slate-100 bg-slate-950 hover:bg-sky-950/60 disabled:opacity-60 border border-slate-800 hover:border-sky-500 rounded-xl transition-colors"
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

                  {hasAnsweredThisRound && !oppHasAnsweredThisRound && (
                    <div className="p-3 bg-slate-950 border border-amber-500/50 rounded-xl flex items-center justify-center gap-2 text-xs text-amber-300 font-semibold">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Menunggu {oppName} menjawab soal ronde ini secara realtime...</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center space-y-4 py-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-display">
                    {wonDuel
                      ? `KEMENANGAN DUEL ATAS ${oppName.toUpperCase()}!`
                      : `DUEL SELESAI MELAWAN ${oppName.toUpperCase()}!`}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Skor Akhir Realtime: <strong>{myScore}</strong> vs <strong>{oppScore}</strong>.
                    Kamu memperoleh{' '}
                    <strong className="text-emerald-400 font-mono">
                      +{rewardMp} Poin Misi (MP)
                    </strong>{' '}
                    dan{' '}
                    <strong className="text-sky-400 font-mono">+{rewardScore} Skor Respect</strong>!
                  </p>

                  <button
                    onClick={() => {
                      soundEngine.playVictoryFanfare();
                      onCloseMatch(activeMatch.id, wonDuel, rewardMp, rewardScore);
                    }}
                    className="w-full py-3 px-6 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
                  >
                    Klaim +{rewardMp} Poin Misi & Kembali ke Arena MTsN 14
                  </button>
                </div>
              )}
            </div>
          </>
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
    // Only initialize question selection when opening the modal or switching teacher post station
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, teacherStationIndex]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-2 sm:p-4 overflow-y-auto overscroll-contain touch-pan-y">
      <div className="w-full max-w-4xl max-h-[92dvh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header: Pos Misi Guru Azhary Mardhani, S.Kom */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-3.5 sm:px-6 py-2.5 sm:py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-semibold text-amber-400 truncate">
                POS MISI GURU INFORMATIKA · MTs NEGERI 14 JAKARTA
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl font-extrabold text-slate-100 font-display truncate">
                Azhary Mardhani, S.Kom — Pengujian Misi & Evaluasi Soal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-[11px] sm:text-xs font-mono tabular-nums">
              <span className="text-slate-400 hidden sm:inline">Poin Misi (MP): </span>
              <strong className="text-emerald-400">{missionPoints} MP</strong>
            </div>
            <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-[11px] sm:text-xs font-mono tabular-nums">
              <span className="text-slate-400 hidden sm:inline">Progres Misi: </span>
              <strong className="text-sky-400">
                {answeredQuestionIds.size}/{questions.length} Soal
              </strong>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Split: Single unified vertical scroll on Handphone (<1024px), 2-column split on Desktop (lg:) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y lg:overflow-hidden lg:grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: All Mission Questions (Horizontal strip on HP so it doesn't block vertical scroll, vertical list on Desktop) */}
          <div className="lg:col-span-4 p-3 sm:p-4 bg-slate-950/50 space-y-2 lg:overflow-y-auto lg:max-h-[75dvh]">
            <div className="text-[11px] sm:text-xs font-bold text-slate-400 px-1">
              DAFTAR SOAL MISI ({answeredQuestionIds.size}/{questions.length} TUNTAS)
            </div>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
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
                    className={`shrink-0 lg:w-full text-left px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-sky-950/60 border-sky-500 text-slate-100'
                        : done
                        ? 'bg-emerald-950/25 border-emerald-800/50 text-emerald-300'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate max-w-[140px] lg:max-w-none">
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
          </div>

          {/* Right Column: Active Question & Material Briefing */}
          <div className="lg:col-span-8 p-3.5 sm:p-6 space-y-4 sm:space-y-5 lg:overflow-y-auto lg:max-h-[75dvh]">
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
