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
  X,
  Lock,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Flag,
  Type,
  LayoutGrid,
  LogOut,
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
  const [lastFeedback, setLastFeedback] = useState<{
    isCorrect: boolean;
    text: string;
  } | null>(null);
  const [localAnsweredRound, setLocalAnsweredRound] = useState<number>(-1);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);

  const roundIdx = activeMatch?.roundIdx ?? 0;
  const matchStatus = activeMatch?.status;

  useEffect(() => {
    setTimeLeft(10);
    setLastFeedback(null);
    setChosenIdx(null);
  }, [activeMatch?.id, roundIdx, matchStatus]);

  useEffect(() => {
    if (!activeMatch) {
      setLocalAnsweredRound(-1);
      setChosenIdx(null);
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
    setChosenIdx(idx);
    const isCorrect = idx === currentChallenge.correctIndex;
    const myGain = isCorrect ? 100 + timeLeft * 10 : 0;

    if (isCorrect) {
      soundEngine.playCorrectAnswer();
      setLastFeedback({
        isCorrect: true,
        text: `JAWABAN BENAR! +${myGain} Poin Duel Realtime`,
      });
    } else {
      soundEngine.playWrongAnswer();
      setLastFeedback({
        isCorrect: false,
        text: `KURANG TEPAT! Kunci Jawaban: ${currentChallenge.options[currentChallenge.correctIndex]}`,
      });
    }

    onSubmitRoundAnswer(activeMatch.id, roundIdx, idx, timeLeft);
  };

  const wonDuel = myScore >= oppScore;
  const rewardMp = wonDuel ? 100 : 45;
  const rewardScore = wonDuel ? 150 : 60;
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 p-2.5 sm:p-5 overflow-y-auto overscroll-contain touch-pan-y">
      <div className="w-full max-w-2xl max-h-[94dvh] flex flex-col bg-slate-100 text-slate-900 border-2 border-slate-300 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Versus CBT Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 text-white border-b-4 border-rose-500">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                CBT DUEL CEPAT 1V1 — MTs NEGERI 14 JAKARTA TIMUR
              </h2>
              <p className="text-[11px] text-slate-300 truncate">
                Uji Cepat Kompetensi Informatika · Sinkronisasi Skor Langsung
              </p>
            </div>
          </div>
          <button
            onClick={() => onCloseMatch(activeMatch.id)}
            className="px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-rose-700 rounded-lg shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Tutup</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y">
          {/* STATE 1: PENDING MUTUAL CONSENT */}
          {activeMatch.status === 'PENDING_CONSENT' && (
            <div className="p-6 sm:p-8 text-center space-y-4 bg-white m-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600">
                <Swords className="w-7 h-7" />
              </div>
              {isChallenger ? (
                <>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Menunggu Persetujuan dari {oppName} ({oppClass})...
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Undangan duel CBT 1v1 telah dikirim ke layar <strong>{oppName}</strong> secara
                    realtime. Soal akan langsung terbuka begitu temanmu menekan tombol{' '}
                    <strong className="text-emerald-700">Terima Duel</strong>.
                  </p>
                  <button
                    onClick={() => {
                      onRespondConsent(activeMatch.id, false);
                      onCloseMatch(activeMatch.id);
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
                  >
                    Batalkan Tantangan Duel
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {oppName} ({oppClass}) Mengajak Kamu Duel CBT 1v1!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Terima tantangan duel cepat 3 soal Informatika untuk memperebutkan{' '}
                    <strong className="text-emerald-700">+100 Poin Misi (MP)</strong> dan{' '}
                    <strong className="text-sky-700">+150 Skor Kompetensi</strong>!
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        soundEngine.playDash();
                        onRespondConsent(activeMatch.id, true);
                      }}
                      className="px-6 py-3 text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
                    >
                      Setuju & Mulai Duel Sekarang
                    </button>
                    <button
                      onClick={() => {
                        onRespondConsent(activeMatch.id, false);
                        onCloseMatch(activeMatch.id);
                      }}
                      className="px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STATE 2: DECLINED */}
          {activeMatch.status === 'DECLINED' && (
            <div className="p-6 sm:p-8 text-center space-y-4 bg-white m-4 rounded-xl border border-slate-200">
              <h3 className="text-lg font-extrabold text-rose-600">
                Tantangan Duel Ditolak / Dibatalkan
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Duel Versus dibatalkan karena salah satu pihak belum siap. Silakan kembali ke arena
                MTsN 14 Halim.
              </p>
              <button
                onClick={() => onCloseMatch(activeMatch.id)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
              >
                Kembali ke Arena 3D
              </button>
            </div>
          )}

          {/* STATE 3: IN_PROGRESS OR FINISHED */}
          {(activeMatch.status === 'IN_PROGRESS' || activeMatch.status === 'FINISHED') && (
            <>
              {/* Live Real-Time Scoreboard Bar */}
              <div className="grid grid-cols-3 items-center px-4 sm:px-6 py-3 bg-white border-b border-slate-300 text-center">
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-sky-700 truncate">
                    {localPlayerName} (Kamu)
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                    {myScore}
                  </div>
                  {activeMatch.status === 'IN_PROGRESS' && (
                    <div className="text-[11px] font-semibold text-emerald-700">
                      {hasAnsweredThisRound ? '✓ Sudah Dijawab' : '● Sedang Menjawab...'}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center">
                  <span className="px-3 py-1 rounded-md bg-slate-900 text-amber-400 text-xs font-mono font-extrabold">
                    {activeMatch.status === 'FINISHED'
                      ? 'HASIL AKHIR'
                      : `SOAL ${roundIdx + 1}/3 · ${timeLeft} DETIK`}
                  </span>
                </div>

                <div className="text-right min-w-0">
                  <div className="text-xs font-bold text-rose-700 truncate">
                    {oppName} ({oppClass})
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                    {oppScore}
                  </div>
                  {activeMatch.status === 'IN_PROGRESS' && (
                    <div className="text-[11px] font-semibold text-amber-700">
                      {oppHasAnsweredThisRound ? '✓ Sudah Dijawab' : '● Sedang Menjawab...'}
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 space-y-4">
                {activeMatch.status === 'IN_PROGRESS' ? (
                  <>
                    {/* High-Contrast White CBT Question Card */}
                    <div className="bg-white border-2 border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 border-b border-slate-200 pb-2">
                        <span>TOPIK SOAL: {currentChallenge.topic.toUpperCase()}</span>
                        <span className="font-mono font-bold text-slate-900">
                          BUTIR {roundIdx + 1} DARI 3
                        </span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed pt-1">
                        {currentChallenge.prompt}
                      </p>
                    </div>

                    {/* High-Contrast Vertical CBT Option Buttons */}
                    <div className="space-y-2.5">
                      {currentChallenge.options.map((opt, idx) => {
                        const isSelected = chosenIdx === idx;
                        const isCorrectKey = idx === currentChallenge.correctIndex;
                        let btnStyle =
                          'bg-white hover:bg-sky-50 border-2 border-slate-300 hover:border-sky-600 text-slate-900';
                        let badgeStyle = 'bg-slate-200 text-slate-800 border border-slate-300';

                        if (hasAnsweredThisRound) {
                          if (isCorrectKey) {
                            btnStyle = 'bg-emerald-50 border-2 border-emerald-600 text-emerald-950';
                            badgeStyle = 'bg-emerald-600 text-white';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-50 border-2 border-rose-600 text-rose-950';
                            badgeStyle = 'bg-rose-600 text-white';
                          } else {
                            btnStyle = 'bg-slate-100 border-2 border-slate-200 text-slate-500 opacity-75';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={hasAnsweredThisRound}
                            onClick={() => handleSelectOption(idx)}
                            className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center gap-3.5 shadow-2xs ${btnStyle}`}
                          >
                            <span
                              className={`w-9 h-9 rounded-lg font-mono font-extrabold text-sm flex items-center justify-center shrink-0 ${badgeStyle}`}
                            >
                              {optionLetters[idx] || idx + 1}
                            </span>
                            <span className="text-sm sm:text-base font-semibold leading-snug flex-1">
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {lastFeedback && (
                      <div
                        className={`p-3.5 rounded-xl border-2 text-center text-xs sm:text-sm font-bold ${
                          lastFeedback.isCorrect
                            ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                            : 'bg-rose-100 border-rose-600 text-rose-950'
                        }`}
                      >
                        {lastFeedback.text}
                      </div>
                    )}

                    {hasAnsweredThisRound && !oppHasAnsweredThisRound && (
                      <div className="p-3 bg-amber-50 border border-amber-400 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
                        <Clock className="w-4 h-4 shrink-0 text-amber-700" />
                        <span>Menunggu {oppName} menyelesaikan soal ronde ini...</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white border border-slate-300 rounded-xl p-6 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {wonDuel
                        ? `KEMENANGAN DUEL ATAS ${oppName.toUpperCase()}!`
                        : `DUEL SELESAI MELAWAN ${oppName.toUpperCase()}!`}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
                      Skor Akhir Realtime: <strong>{myScore}</strong> vs <strong>{oppScore}</strong>.
                      Kamu memperoleh{' '}
                      <strong className="text-emerald-700 font-mono">
                        +{rewardMp} Poin Misi (MP)
                      </strong>{' '}
                      dan{' '}
                      <strong className="text-sky-700 font-mono">+{rewardScore} Skor Kompetensi</strong>!
                    </p>

                    <button
                      onClick={() => {
                        soundEngine.playVictoryFanfare();
                        onCloseMatch(activeMatch.id, wonDuel, rewardMp, rewardScore);
                      }}
                      className="w-full py-3.5 px-6 text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
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
  answeredQuestionIds,
  missionPoints,
  localPlayerId,
  localPlayerName,
  onClose,
  onSubmitTeacherAnswer,
  onOpenFullAnalysis,
}) => {
  const [selectedQId, setSelectedQId] = useState<string>('');
  const [questionStartMs, setQuestionStartMs] = useState<number>(performance.now());
  const [textSize, setTextSize] = useState<'SM' | 'MD' | 'LG'>('MD');
  const [doubtfulIds, setDoubtfulIds] = useState<Set<string>>(() => new Set());
  const [recordedChoices, setRecordedChoices] = useState<Record<string, OptionKey>>({});
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    chosen: OptionKey;
    correctKey: OptionKey;
    explanation: string;
    pointsEarned: number;
  } | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, teacherStationIndex]);

  if (!isOpen) return null;

  const currentIdx = Math.max(
    0,
    questions.findIndex((q) => q.id === selectedQId)
  );
  const activeQ = questions[currentIdx] || questions[0];
  if (!activeQ) return null;

  const isAlreadyAnswered = answeredQuestionIds.has(activeQ.id);
  const isDoubtful = doubtfulIds.has(activeQ.id);
  const QUESTION_MP_COST = 40;
  const canAfford = missionPoints >= QUESTION_MP_COST || isAlreadyAnswered;

  const handleSelectQuestionByIndex = (idx: number) => {
    const target = questions[idx];
    if (!target) return;
    soundEngine.playClick();
    setSelectedQId(target.id);
    setQuestionStartMs(performance.now());
    setLastResult(null);
  };

  const handleToggleDoubtful = () => {
    soundEngine.playClick();
    setDoubtfulIds((prev) => {
      const next = new Set(prev);
      if (next.has(activeQ.id)) {
        next.delete(activeQ.id);
      } else {
        next.add(activeQ.id);
      }
      return next;
    });
  };

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

    setRecordedChoices((prev) => ({ ...prev, [activeQ.id]: opt }));
    setDoubtfulIds((prev) => {
      const next = new Set(prev);
      next.delete(activeQ.id);
      return next;
    });

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
      soundEngine.playClick();
      setSelectedQId(nextUnanswered.id);
      setQuestionStartMs(performance.now());
      setLastResult(null);
    } else {
      onOpenFullAnalysis();
    }
  };

  const stemFontClass =
    textSize === 'LG'
      ? 'text-lg sm:text-xl leading-relaxed'
      : textSize === 'SM'
      ? 'text-sm sm:text-base leading-relaxed'
      : 'text-base sm:text-lg leading-relaxed';

  const optionFontClass =
    textSize === 'LG'
      ? 'text-base sm:text-lg'
      : textSize === 'SM'
      ? 'text-xs sm:text-sm'
      : 'text-sm sm:text-base';

  const chosenForActive = lastResult?.chosen || recordedChoices[activeQ.id];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-200 text-slate-900 overflow-hidden select-text">
      {/* ====================================================================
          1. TOP OFFICIAL CBT HEADER BAR (SOLID HIGH-CONTRAST)
         ==================================================================== */}
      <header className="shrink-0 bg-emerald-950 text-white border-b-4 border-amber-400 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-800 border border-emerald-500/50 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold text-amber-300 tracking-wider uppercase">
                <span>CBT ASESMEN MANDIRI · MTs NEGERI 14 JAKARTA TIMUR</span>
              </div>
              <h1 className="text-sm sm:text-lg font-extrabold text-white truncate">
                Ujian Kompetensi Informatika — Azhary Mardhani, S.Kom
              </h1>
            </div>
          </div>

          {/* Right Participant Info & Exit to 3D World */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <div className="hidden md:flex items-center gap-4 bg-emerald-900/90 border border-emerald-700 px-3.5 py-1.5 rounded-xl text-xs">
              <div>
                <span className="text-emerald-300 block text-[10px] font-mono uppercase">
                  PESERTA UJIAN
                </span>
                <strong className="text-white font-bold">{localPlayerName}</strong>
              </div>
              <div className="h-6 w-px bg-emerald-700" />
              <div>
                <span className="text-emerald-300 block text-[10px] font-mono uppercase">
                  POIN MISI (MP)
                </span>
                <strong className="text-amber-300 font-mono">{missionPoints} MP</strong>
              </div>
              <div className="h-6 w-px bg-emerald-700" />
              <div>
                <span className="text-emerald-300 block text-[10px] font-mono uppercase">
                  PROGRES CBT
                </span>
                <strong className="text-sky-300 font-mono">
                  {answeredQuestionIds.size} / {questions.length} Soal
                </strong>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-700 text-white font-bold text-xs transition-colors border border-slate-600 shadow-xs shrink-0"
              title="Kembali ke Arena 3D MTsN 14"
            >
              <LogOut className="w-4 h-4" />
              <span>Kembali ke Arena 3D</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Participant Sub-Bar */}
      <div className="md:hidden shrink-0 bg-emerald-900 text-emerald-100 px-3 py-1.5 border-b border-emerald-800 flex items-center justify-between text-[11px] font-mono">
        <span className="truncate max-w-[140px] font-sans font-bold text-white">
          {localPlayerName}
        </span>
        <div className="flex items-center gap-3">
          <span>
            MP: <strong className="text-amber-300">{missionPoints}</strong>
          </span>
          <span>
            Terjawab:{' '}
            <strong className="text-sky-300">
              {answeredQuestionIds.size}/{questions.length}
            </strong>
          </span>
        </div>
      </div>

      {/* ====================================================================
          2. MAIN CBT WORKSPACE (LEFT: LEMBAR SOAL PUTIH, RIGHT: PANEL NOMOR SOAL)
         ==================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-2.5 sm:p-5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* LEFT / MAIN COLUMN: LEMBAR SOAL & PILIHAN JAWABAN CBT */}
          <div className="lg:col-span-8 xl:col-span-9 bg-white border-2 border-slate-300 rounded-2xl shadow-md overflow-hidden flex flex-col">
            {/* Question Metadata & Font Size Toolbar */}
            <div className="bg-slate-100 border-b-2 border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1.5 rounded-lg bg-emerald-800 text-white font-mono text-xs sm:text-sm font-extrabold tracking-wide shadow-2xs">
                  SOAL NO. {currentIdx + 1}
                </span>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">{activeQ.category}</span>
                  <span className="mx-1.5 text-slate-400">·</span>
                  <span>{activeQ.gradeLevel}</span>
                  <span className="mx-1.5 text-slate-400">·</span>
                  <span>Level {activeQ.cognitiveLevel}</span>
                  <span className="mx-1.5 text-slate-400">·</span>
                  <span className="font-mono font-bold text-emerald-800">
                    Bobot {activeQ.points} Poin
                  </span>
                </div>
              </div>

              {/* Font Size Switcher (Standar Aplikasi CBT / ANBK) */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-1">
                <span className="text-[11px] text-slate-500 px-2 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" /> Ukuran:
                </span>
                {(['SM', 'MD', 'LG'] as const).map((sz, i) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setTextSize(sz)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                      textSize === sz
                        ? 'bg-emerald-700 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {i === 0 ? 'A-' : i === 1 ? 'A' : 'A+'}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Question Body */}
            <div className="p-4 sm:p-7 space-y-6">
              {/* If Not Enough Mission Points */}
              {!canAfford && !isAlreadyAnswered && (
                <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-amber-700 shrink-0" />
                    <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                      Kamu membutuhkan <strong>{QUESTION_MP_COST} Poin Misi (MP)</strong> untuk
                      mengerjakan butir soal ini. Kumpulkan <strong>Komponen Hardware (+50 MP)</strong>{' '}
                      di halaman kampus atau lakukan <strong>Duel 1v1 (+100 MP)</strong>!
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-lg whitespace-nowrap shrink-0 shadow-xs"
                  >
                    Cari Poin Misi di Arena 3D
                  </button>
                </div>
              )}

              {/* Question Stem Box (High Contrast Dark Text on Pure White Surface) */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 sm:p-6 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  <span>NASKAH PERTANYAAN SOAL</span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> Ujian Mandiri Tanpa Modul
                  </span>
                </div>
                <p className={`font-bold text-slate-950 ${stemFontClass}`}>
                  {activeQ.question}
                </p>
              </div>

              {/* Answer Options List (Vertical Full-Width CBT Format) */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
                  PILIH SALAH SATU JAWABAN (A, B, C, ATAU D):
                </div>

                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
                    const showCorrectHighlight =
                      (lastResult || isAlreadyAnswered) && activeQ.correctAnswer === key;
                    const showWrongHighlight =
                      (lastResult && !lastResult.isCorrect && lastResult.chosen === key) ||
                      (isAlreadyAnswered &&
                        chosenForActive === key &&
                        activeQ.correctAnswer !== key);

                    let rowStyle =
                      'bg-white hover:bg-sky-50/80 border-2 border-slate-300 hover:border-sky-600 text-slate-900';
                    let letterBadgeStyle =
                      'bg-slate-100 text-slate-800 border-2 border-slate-300 group-hover:border-sky-600 group-hover:bg-sky-600 group-hover:text-white';

                    if (showCorrectHighlight) {
                      rowStyle = 'bg-emerald-50 border-2 border-emerald-600 text-emerald-950 shadow-xs';
                      letterBadgeStyle = 'bg-emerald-600 text-white border-2 border-emerald-600';
                    } else if (showWrongHighlight) {
                      rowStyle = 'bg-rose-50 border-2 border-rose-600 text-rose-950 shadow-xs';
                      letterBadgeStyle = 'bg-rose-600 text-white border-2 border-rose-600';
                    } else if (isAlreadyAnswered) {
                      rowStyle = 'bg-slate-50 border-2 border-slate-200 text-slate-500';
                      letterBadgeStyle = 'bg-slate-200 text-slate-500 border-2 border-slate-200';
                    }

                    return (
                      <button
                        key={key}
                        disabled={isAlreadyAnswered || !canAfford}
                        onClick={() => handleChooseOption(key)}
                        className={`group w-full p-3.5 sm:p-4 rounded-xl text-left transition-all flex items-center justify-between gap-4 disabled:cursor-not-allowed ${rowStyle}`}
                      >
                        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                          <span
                            className={`w-10 h-10 rounded-lg font-mono font-extrabold text-base flex items-center justify-center shrink-0 transition-colors ${letterBadgeStyle}`}
                          >
                            {key}
                          </span>
                          <span className={`font-semibold text-slate-900 leading-snug ${optionFontClass}`}>
                            {activeQ.options[key]}
                          </span>
                        </div>

                        {showCorrectHighlight && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Kunci Benar</span>
                          </span>
                        )}
                        {showWrongHighlight && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-bold shrink-0">
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Kurang Tepat</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Immediate CBT Answer Evaluation & Explanation Box */}
              {(lastResult || isAlreadyAnswered) && (
                <div
                  className={`p-5 rounded-xl border-2 space-y-3 ${
                    (lastResult ? lastResult.isCorrect : chosenForActive === activeQ.correctAnswer)
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                      : 'bg-amber-50 border-amber-500 text-slate-900'
                  }`}
                >
                  {lastResult && (
                    <div
                      className={`text-base font-extrabold ${
                        lastResult.isCorrect ? 'text-emerald-800' : 'text-rose-700'
                      }`}
                    >
                      {lastResult.isCorrect
                        ? `✓ JAWABAN BENAR! (+${lastResult.pointsEarned} Poin Kompetensi)`
                        : `✕ JAWABAN KURANG TEPAT — Kunci Jawaban yang Benar: Opsi ${lastResult.correctKey}`}
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    <strong className="font-bold text-slate-950 block mb-0.5">
                      Pembahasan Evaluasi (Pak Azhary Mardhani, S.Kom):
                    </strong>
                    {activeQ.explanation}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom CBT Action & Navigation Footer */}
            <div className="bg-slate-100 border-t-2 border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIdx <= 0}
                onClick={() => handleSelectQuestionByIndex(currentIdx - 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Soal Sebelumnya</span>
              </button>

              {!isAlreadyAnswered && (
                <button
                  type="button"
                  onClick={handleToggleDoubtful}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                    isDoubtful
                      ? 'bg-amber-400 text-slate-950 border-amber-600 shadow-xs'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  <span>{isDoubtful ? 'Ditandai Ragu-Ragu' : 'Tandai Ragu-Ragu'}</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {currentIdx + 1 < questions.length ? (
                  <button
                    type="button"
                    onClick={() => handleSelectQuestionByIndex(currentIdx + 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-extrabold shadow-xs transition-colors"
                  >
                    <span>Soal Berikutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSelectNextUnanswered}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-xs transition-colors"
                  >
                    <span>
                      {answeredQuestionIds.size < questions.length
                        ? 'Ke Soal Belum Dijawab'
                        : 'Selesai & Lihat Analisis Nilai'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: PANEL NOMOR SOAL CBT */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white border-2 border-slate-300 rounded-2xl shadow-md p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-emerald-700" />
                <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  DAFTAR NOMOR SOAL
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                {answeredQuestionIds.size}/{questions.length} Selesai
              </span>
            </div>

            {/* Number Grid (5 Columns like standard ANBK/CBT) */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const done = answeredQuestionIds.has(q.id);
                const doubtful = doubtfulIds.has(q.id);
                const isCurrent = q.id === activeQ.id;

                let boxClass =
                  'bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300';
                if (done) {
                  boxClass = 'bg-emerald-600 text-white border-2 border-emerald-700';
                } else if (doubtful) {
                  boxClass = 'bg-amber-400 text-slate-950 border-2 border-amber-600';
                }
                if (isCurrent) {
                  boxClass += ' ring-2 ring-offset-2 ring-sky-600 font-black';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleSelectQuestionByIndex(idx)}
                    className={`h-11 rounded-xl font-mono text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all ${boxClass}`}
                    title={`Soal #${idx + 1}: ${q.category}`}
                  >
                    <span>{idx + 1}</span>
                    {done && recordedChoices[q.id] && (
                      <span className="text-[9px] leading-none opacity-90">
                        {recordedChoices[q.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* CBT Status Legend */}
            <div className="pt-2 border-t border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="font-bold text-slate-900">Keterangan Warna Status:</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-600 border border-emerald-700 shrink-0" />
                  <span>Sudah Dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-amber-400 border border-amber-600 shrink-0" />
                  <span>Ragu-Ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-slate-100 border-2 border-slate-300 shrink-0" />
                  <span>Belum Dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-white border-2 border-sky-600 shrink-0" />
                  <span>Soal Aktif</span>
                </div>
              </div>
            </div>

            {/* Current Question Topic Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="text-slate-500 font-mono text-[10px] uppercase font-bold">
                INDIKATOR SOAL AKTIF
              </div>
              <div className="font-bold text-slate-900">{activeQ.category}</div>
              <div className="text-slate-600">
                Jenjang: <strong>Kelas {activeQ.gradeLevel}</strong> · Level Kognitif:{' '}
                <strong>{activeQ.cognitiveLevel}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={onOpenFullAnalysis}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold transition-colors shadow-xs"
              >
                Lihat Rekap Nilai & Analisis CBT
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
              >
                Lanjutkan Eksplorasi Arena 3D
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
