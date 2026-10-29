import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  INITIAL_MATERIALS,
  INITIAL_QUESTIONS,
  InformaticsMaterial,
  InformaticsQuestion,
  PlayerAnswerEvent,
} from './data/informaticsData';
import {
  CHARACTER_PRESETS,
  CyberArenaCanvas,
  MapPlayerEntity,
  TeacherPostLocation,
} from './components/CyberArenaCanvas';
import { MaterialManagerModal } from './components/MaterialManagerModal';
import { ItemAnalysisView } from './components/ItemAnalysisView';
import { TeacherQuestModal, VersusDuelModal } from './components/VersusAndTeacherModals';
import { soundEngine } from './utils/soundEngine';
import {
  Volume2,
  VolumeX,
  Play,
  BookOpen,
  BarChart3,
  Users,
  KeyRound,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  LogOut,
  Swords,
  GraduationCap,
  Cpu,
  UserCheck,
} from 'lucide-react';

interface ActiveRoomSummary {
  pin: string;
  roomName: string;
  teacherName: string;
  status: 'LOBBY' | 'PLAYING' | 'ROUND_RESULT' | 'FINISHED';
  studentCount: number;
  totalPlayers: number;
  categoryFilter: string;
}

export default function App() {
  const [entryTab, setEntryTab] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [joinedRoom, setJoinedRoom] = useState<boolean>(false);
  const [localRole, setLocalRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');

  // Student & Room Form Inputs
  const [roomCodeInput, setRoomCodeInput] = useState<string>('MTN14');
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('Kelas 8A');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CHARACTER_PRESETS[0].id);
  const [avatarColor, setAvatarColor] = useState<string>(CHARACTER_PRESETS[0].jacketColor);
  const [teacherRoomCode, setTeacherRoomCode] = useState<string>('MTN14');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Materi');
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Collapsible Bottom Dock State ("Zen / Cinema Mode")
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);

  // Materials & Question Bank State
  const [materials, setMaterials] = useState<InformaticsMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('mtsn14_materials_v1');
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  const [questions, setQuestions] = useState<InformaticsQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('mtsn14_questions_v1');
      return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  });

  const [activeRoomsList, setActiveRoomsList] = useState<ActiveRoomSummary[]>([
    {
      pin: 'MTN14',
      roomName: 'Distrik 3D Informatika MTsN 14 Jakarta',
      teacherName: 'Azhary Mardhani, S.Kom',
      status: 'PLAYING',
      studentCount: 4,
      totalPlayers: 4,
      categoryFilter: 'Semua Materi',
    },
  ]);

  // Synchronized Classroom Room State
  const [activePin, setActivePin] = useState<string>('MTN14');
  const [roomStatus, setRoomStatus] = useState<'LOBBY' | 'PLAYING' | 'ROUND_RESULT' | 'FINISHED'>(
    'PLAYING'
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [classPlayers, setClassPlayers] = useState<MapPlayerEntity[]>([]);
  const [sessionAnswers, setSessionAnswers] = useState<PlayerAnswerEvent[]>([]);

  // Local Open-World Mission Progress (GTA SA Style)
  const [missionPoints, setMissionPoints] = useState<number>(100);
  const [collectedItemsCount, setCollectedItemsCount] = useState<number>(0);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [localScore, setLocalScore] = useState<number>(0);

  // Proximity Interactions on the 3D Map
  const [nearbyTeacherPost, setNearbyTeacherPost] = useState<TeacherPostLocation | null>(null);
  const [nearbyVersusTarget, setNearbyVersusTarget] = useState<MapPlayerEntity | null>(null);
  const [activeTeacherModalIndex, setActiveTeacherModalIndex] = useState<number | null>(null);
  const [activeVersusOpponent, setActiveVersusOpponent] = useState<MapPlayerEntity | null>(null);
  const [pickupBanner, setPickupBanner] = useState<{ itemName: string; mpGain: number } | null>(
    null
  );

  // Camera & Modals
  const [cameraMode, setCameraMode] = useState<'FOLLOW_PLAYER' | 'FULL_MAP'>('FOLLOW_PLAYER');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState<boolean>(false);
  const [isAnalysisPreviewOpen, setIsAnalysisPreviewOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [localHud, setLocalHud] = useState<{ x: number; y: number; hp: number }>({
    x: 1200,
    y: 780,
    hp: 100,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const localPlayerIdRef = useRef<string>(`p-${Math.random().toString(36).slice(2, 9)}`);

  const activeQuestions = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'Semua Materi') return questions;
    const filtered = questions.filter((q) => q.category === selectedCategory);
    return filtered.length > 0 ? filtered : questions;
  }, [questions, selectedCategory]);

  const currentQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0] || null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rParam = params.get('room');
    if (rParam) {
      setRoomCodeInput(rParam.toUpperCase());
    }
  }, []);

  const fetchBootstrap = useCallback(() => {
    fetch('/api/bootstrap')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.materials?.length) setMaterials(data.materials);
        if (data?.questions?.length) setQuestions(data.questions);
        if (Array.isArray(data?.activeRooms)) setActiveRoomsList(data.activeRooms);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  // Connect to Real-Time Classroom WebSocket Server
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'room:joined') {
          const room = msg.payload;
          setActivePin(room.pin);
          setRoomStatus(room.status);
          setSelectedCategory(room.categoryFilter || 'Semua Materi');
          setCurrentQuestionIndex(room.currentQuestionIndex || 0);
          setClassPlayers(room.players || []);
          setSessionAnswers(room.answers || []);
          setAuthError(null);
          setJoinedRoom(true);
          soundEngine.playDash();
        } else if (msg.type === 'room:state') {
          const room = msg.payload;
          setActivePin(room.pin);
          setRoomStatus((prevStatus) => {
            if (prevStatus !== 'FINISHED' && room.status === 'FINISHED') {
              soundEngine.playVictoryFanfare();
            }
            return room.status;
          });
          setSelectedCategory(room.categoryFilter || 'Semua Materi');
          setCurrentQuestionIndex(room.currentQuestionIndex || 0);
          setClassPlayers(room.players || []);
          setSessionAnswers(room.answers || []);
        } else if (msg.type === 'player:moved') {
          const {
            playerId,
            x,
            y,
            vx,
            vy,
            score,
            missionPoints: mp,
            collectedItemsCount: itemsCount,
            answeredCount,
          } = msg.payload;
          setClassPlayers((prev) =>
            prev.map((p) =>
              p.id === playerId
                ? {
                    ...p,
                    x,
                    y,
                    vx,
                    vy,
                    score: score ?? p.score,
                    missionPoints: mp ?? p.missionPoints,
                    collectedItemsCount: itemsCount ?? p.collectedItemsCount,
                    answeredCount: answeredCount ?? p.answeredCount,
                  }
                : p
            )
          );
        } else if (msg.type === 'room:error') {
          setAuthError(msg.payload?.message || 'Kode Room tidak ditemukan.');
          soundEngine.playWrongAnswer();
        }
      } catch {
        // Ignore malformed packets
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleStudentJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = roomCodeInput.trim().toUpperCase();
    const cleanName = studentName.trim();

    if (!cleanPin) {
      setAuthError('Silakan masukkan Kode Room Kelas terlebih dahulu.');
      return;
    }
    if (!cleanName) {
      setAuthError('Silakan isi Nama Lengkap Siswa terlebih dahulu.');
      return;
    }

    setLocalRole('STUDENT');
    setCameraMode('FOLLOW_PLAYER');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'room:join',
          payload: {
            pin: cleanPin,
            playerId: localPlayerIdRef.current,
            playerName: cleanName,
            studentClass,
            role: 'STUDENT',
            color: avatarColor,
            characterPreset: selectedPresetId,
          },
        })
      );
    } else {
      setActivePin(cleanPin);
      setJoinedRoom(true);
    }
  };

  const handleTeacherOpenRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = teacherRoomCode.trim().toUpperCase() || 'MTN14';
    setLocalRole('TEACHER');
    setStudentName('Azhary Mardhani, S.Kom');
    setStudentClass('Guru Informatika');
    setSelectedPresetId('cj_rizky');
    setAvatarColor('#f59e0b');
    setCameraMode('FULL_MAP');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'room:create',
          payload: {
            pin: cleanPin,
            roomName: `Distrik 3D Informatika MTsN 14 (${cleanPin})`,
            teacherName: 'Azhary Mardhani, S.Kom',
            playerId: localPlayerIdRef.current,
            playerName: 'Azhary Mardhani, S.Kom',
            categoryFilter: selectedCategory,
          },
        })
      );
    } else {
      setActivePin(cleanPin);
      setJoinedRoom(true);
    }
  };

  const handleEmitLocalMove = useCallback(
    (
      x: number,
      y: number,
      vx: number,
      vy: number,
      scoreBonus = 0,
      missionPointsDelta = 0,
      collectedDelta = 0
    ) => {
      if (scoreBonus !== 0) {
        setLocalScore((prev) => prev + scoreBonus);
      }
      if (missionPointsDelta !== 0) {
        setMissionPoints((prev) => Math.max(0, prev + missionPointsDelta));
      }
      if (collectedDelta !== 0) {
        setCollectedItemsCount((prev) => prev + collectedDelta);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'player:move',
            payload: {
              x,
              y,
              vx,
              vy,
              scoreBonus,
              missionPointsDelta,
              collectedDelta,
            },
          })
        );
      }
    },
    []
  );

  const handleItemPickedUpToast = useCallback((itemName: string, mpGain: number) => {
    setPickupBanner({ itemName, mpGain });
    setTimeout(() => {
      setPickupBanner((prev) => (prev?.itemName === itemName ? null : prev));
    }, 3200);
  }, []);

  const handleCompleteVersus = (won: boolean, mpEarned: number, scoreEarned: number) => {
    setMissionPoints((prev) => prev + mpEarned);
    setLocalScore((prev) => prev + scoreEarned);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'player:versus_complete',
          payload: {
            won,
            mpEarned,
            scoreEarned,
          },
        })
      );
    }
  };

  const handleSubmitTeacherAnswer = (event: PlayerAnswerEvent, missionPointCost: number) => {
    setMissionPoints((prev) => Math.max(0, prev - missionPointCost));
    setAnsweredQuestionIds((prev) => {
      const next = new Set(prev);
      next.add(event.questionId);
      return next;
    });
    setLocalScore((prev) => prev + event.pointsEarned);
    setSessionAnswers((prev) => [...prev, event]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'player:answer_teacher_question',
          payload: {
            answerEvent: event,
            missionPointCost,
          },
        })
      );
    }
  };

  const handleFinishToAnalysis = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'room:finish_game', payload: {} }));
    } else {
      setRoomStatus('FINISHED');
    }
  };

  const handleCopyRoomPin = () => {
    navigator.clipboard?.writeText(activePin).catch(() => {});
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleSaveMaterial = (mat: InformaticsMaterial) => {
    setMaterials((prev) => {
      const updated = [mat, ...prev.filter((m) => m.id !== mat.id)];
      localStorage.setItem('mtsn14_materials_v1', JSON.stringify(updated));
      return updated;
    });
    fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mat),
    }).catch(() => {});
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem('mtsn14_materials_v1', JSON.stringify(updated));
      return updated;
    });
    fetch(`/api/materials/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleSaveQuestion = (q: InformaticsQuestion) => {
    setQuestions((prev) => {
      const updated = [...prev.filter((item) => item.id !== q.id), q];
      localStorage.setItem('mtsn14_questions_v1', JSON.stringify(updated));
      return updated;
    });
    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q),
    }).catch(() => {});
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 3) return;
    setQuestions((prev) => {
      const updated = prev.filter((q) => q.id !== id);
      localStorage.setItem('mtsn14_questions_v1', JSON.stringify(updated));
      return updated;
    });
    fetch(`/api/questions/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Keyboard shortcuts:
  // Tab (Toggle Camera), H (Toggle Collapsible Bottom Dock),
  // F (Interact with Teacher Post), V (Challenge Nearby Student to 1v1 Versus)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!joinedRoom) return;

      if (e.code === 'Tab') {
        e.preventDefault();
        setCameraMode((prev) => (prev === 'FOLLOW_PLAYER' ? 'FULL_MAP' : 'FOLLOW_PLAYER'));
      } else if (e.code === 'KeyH') {
        e.preventDefault();
        setIsDockCollapsed((prev) => !prev);
      } else if (e.code === 'KeyF' && nearbyTeacherPost && activeTeacherModalIndex === null) {
        e.preventDefault();
        soundEngine.playDash();
        setActiveTeacherModalIndex(nearbyTeacherPost.index);
      } else if (e.code === 'KeyV' && nearbyVersusTarget && !activeVersusOpponent) {
        e.preventDefault();
        soundEngine.playDash();
        setActiveVersusOpponent(nearbyVersusTarget);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [joinedRoom, nearbyTeacherPost, nearbyVersusTarget, activeTeacherModalIndex, activeVersusOpponent]);

  const myPlayerRecord = classPlayers.find((p) => p.id === localPlayerIdRef.current);
  const displayedScore = Math.max(localScore, myPlayerRecord?.score || 0);
  const displayedMp = myPlayerRecord?.missionPoints ?? missionPoints;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950">
      {/* 1. GTA San Andreas-Style 3D Open-World District Canvas */}
      <CyberArenaCanvas
        joinedRoom={joinedRoom}
        roomStatus={roomStatus}
        cameraMode={cameraMode}
        localPlayerId={localPlayerIdRef.current}
        localPlayerName={studentName || 'Siswa MTsN 14'}
        localPlayerClass={studentClass}
        localPlayerPreset={selectedPresetId}
        localPlayerColor={avatarColor}
        localPlayerRole={localRole}
        players={classPlayers}
        materials={materials}
        currentQuestion={currentQuestion}
        onEmitLocalMove={handleEmitLocalMove}
        onNearbyTeacherPostChange={setNearbyTeacherPost}
        onNearbyVersusTargetChange={setNearbyVersusTarget}
        onItemPickedUpToast={handleItemPickedUpToast}
        onLocalHudSync={setLocalHud}
      />

      {/* ====================================================================
          2. PORTAL MASUK ROOM KELAS & PEMILIHAN KARAKTER 3D (Siswa / Guru)
         ==================================================================== */}
      {!joinedRoom && (
        <div className="fixed inset-0 z-20 flex flex-col justify-between p-4 md:p-7 pointer-events-none overflow-y-auto">
          {/* Top Bar: School Identity & Teacher Tools */}
          <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
            <div className="text-xs text-slate-200 font-semibold bg-slate-900/95 px-3.5 py-2 rounded-lg border border-slate-700">
              MTs Negeri 14 Jakarta · Open-World 3D Informatika · Azhary Mardhani, S.Kom
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-100 bg-slate-900/95 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                Kelola Materi & Soal ({questions.length})
              </button>

              <button
                onClick={() => setIsAnalysisPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-100 bg-slate-900/95 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                Analisis Butir Soal
              </button>

              <button
                onClick={() => setIsMuted(soundEngine.toggleMute())}
                aria-label="Toggle Suara"
                className="p-2 text-slate-200 bg-slate-900/95 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-sky-400" />
                )}
              </button>
            </div>
          </div>

          {/* Center Hero Lockup + Character & Room Code Gate Card */}
          <div className="my-auto mx-auto w-full max-w-3xl flex flex-col items-center text-center pointer-events-auto space-y-3 py-2">
            <svg
              viewBox="0 0 720 102"
              className="w-full max-w-xl h-auto drop-shadow"
              role="img"
              aria-label="Siber Arena 14 GTA 3D Open World Title Lockup"
            >
              <defs>
                <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <polygon
                points="45,16 75,6 105,16 105,54 75,70 45,54"
                fill="rgba(245, 158, 11, 0.2)"
                stroke="#fbbf24"
                strokeWidth="2.5"
              />
              <text
                x="75"
                y="45"
                textAnchor="middle"
                fill="#fbbf24"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
                fontSize="18"
              >
                3D
              </text>

              <polygon
                points="615,16 645,6 675,16 675,54 645,70 615,54"
                fill="rgba(14, 165, 233, 0.2)"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <text
                x="645"
                y="44"
                textAnchor="middle"
                fill="#38bdf8"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
                fontSize="18"
              >
                14
              </text>

              <text
                x="360"
                y="46"
                textAnchor="middle"
                fill="url(#cyberGrad)"
                fontFamily="Outfit, sans-serif"
                fontWeight="800"
                fontSize="40"
                letterSpacing="3"
              >
                SIBER ARENA 14 : OPEN WORLD
              </text>
              <line
                x1="130"
                y1="62"
                x2="590"
                y2="62"
                stroke="rgba(251, 191, 36, 0.45)"
                strokeWidth="1.5"
              />
              <text
                x="360"
                y="84"
                textAnchor="middle"
                fill="#e2e8f0"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="600"
                fontSize="12"
                letterSpacing="1.3"
              >
                MISI CARI BARANG & GURU · DUEL VERSUS ANTAR SISWA · AZHARY MARDHANI, S.KOM
              </text>
            </svg>

            <div className="w-full p-5 md:p-6 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl text-left space-y-4">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEntryTab('STUDENT');
                    setAuthError(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    entryTab === 'STUDENT'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  Siswa (Pilih Karakter 3D & Kode Room)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryTab('TEACHER');
                    setAuthError(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    entryTab === 'TEACHER'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Guru / Host (Azhary Mardhani, S.Kom)
                </button>
              </div>

              {entryTab === 'STUDENT' ? (
                <form onSubmit={handleStudentJoinRoom} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-amber-400 mb-1">
                        Kode Room Kelas
                      </label>
                      <input
                        type="text"
                        required
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                        placeholder="MTN14"
                        className="w-full px-3 py-2.5 text-base font-mono font-bold tracking-widest uppercase bg-slate-950 border border-amber-600/80 rounded-xl text-amber-300 focus:outline-none focus:border-amber-400 text-center"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nama Lengkap Siswa
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Ketik nama lengkapmu untuk tampil di atas karakter 3D..."
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Kelas MTsN 14
                      </label>
                      <select
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500"
                      >
                        <option value="Kelas 7A">Kelas 7A</option>
                        <option value="Kelas 7B">Kelas 7B</option>
                        <option value="Kelas 7C">Kelas 7C</option>
                        <option value="Kelas 8A">Kelas 8A</option>
                        <option value="Kelas 8B">Kelas 8B</option>
                        <option value="Kelas 8C">Kelas 8C</option>
                        <option value="Kelas 9A">Kelas 9A</option>
                        <option value="Kelas 9B">Kelas 9B</option>
                        <option value="Kelas 9C">Kelas 9C</option>
                      </select>
                    </div>
                  </div>

                  {/* 3D GTA-Style Character Preset Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        Pilih Karakter 3D Kamu (Bebas Berjalan ke Mana Saja di Kota MTsN 14):
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Room Aktif:{' '}
                        {activeRoomsList.map((r) => (
                          <button
                            key={r.pin}
                            type="button"
                            onClick={() => setRoomCodeInput(r.pin)}
                            className="font-mono font-bold text-amber-400 hover:underline ml-1"
                          >
                            {r.pin} ({r.totalPlayers} Siswa)
                          </button>
                        ))}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CHARACTER_PRESETS.map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setSelectedPresetId(preset.id);
                              setAvatarColor(preset.jacketColor);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                              isSelected
                                ? 'bg-sky-950/70 border-sky-400 ring-1 ring-sky-400'
                                : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono text-xs font-extrabold text-white border border-white/20"
                              style={{ backgroundColor: preset.jacketColor }}
                            >
                              3D
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-100 truncate">
                                {preset.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {preset.tagline}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mission Rules Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>1. Cari Barang:</strong> Ambil komponen siber di jalan (+50 MP)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Swords className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>
                        <strong>2. Duel Versus:</strong> Temui siswa lain & tekan [V] (+100 MP)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>3. Cari Guru:</strong> Temui Pak Azhary di pilar kuning [F]
                      </span>
                    </div>
                  </div>

                  {authError && (
                    <div className="text-xs font-medium text-rose-400 bg-rose-950/60 border border-rose-800/70 px-3.5 py-2 rounded-lg">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Terjun ke Distrik 3D MTsN 14 & Mulai Misi ({roomCodeInput || 'MTN14'})
                  </button>
                </form>
              ) : (
                <form onSubmit={handleTeacherOpenRoom} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-amber-400 mb-1">
                        Kode Room Kelas (Bagikan ke Siswa)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={teacherRoomCode}
                          onChange={(e) => setTeacherRoomCode(e.target.value.toUpperCase())}
                          className="w-full px-3.5 py-2 text-base font-mono font-bold uppercase bg-slate-950 border border-amber-700/80 rounded-xl text-amber-300"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setTeacherRoomCode(`14${Math.floor(100 + Math.random() * 900)}`)
                          }
                          className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl whitespace-nowrap shrink-0"
                        >
                          Kode Acak
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Modul Materi yang Diujikan pada Pos Guru
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                      >
                        <option value="Semua Materi">Semua Materi ({questions.length} Soal)</option>
                        <option value="Berpikir Komputasional">Berpikir Komputasional</option>
                        <option value="Sistem Komputer">Sistem Komputer</option>
                        <option value="Jaringan Komputer & Internet">
                          Jaringan Komputer & Internet
                        </option>
                        <option value="Algoritma & Pemrograman">Algoritma & Pemrograman</option>
                        <option value="Analisis Data">Analisis Data</option>
                        <option value="Dampak Sosial & Keamanan Siber">
                          Dampak Sosial & Keamanan Siber
                        </option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sebagai <strong>Host Guru (Azhary Mardhani, S.Kom)</strong>, Bapak dapat
                    memantau seluruh siswa yang berjalan mencari barang komponen di jalan raya,
                    melihat duel versus antar siswa, serta meninjau tabel{' '}
                    <strong>Analisis Butir Soal Psikometrik</strong> secara real-time.
                  </p>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Buka Kota 3D Kelas & Pantau Misi Siswa ({teacherRoomCode || 'MTN14'})
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="text-center text-xs font-mono text-slate-300 pointer-events-none">
            WASD Jalan Bebas 3D · Space Lompat · Drag Mouse / Q-E Putar Kamera · [F] Pos Guru · [V]
            Duel Versus Siswa
          </div>
        </div>
      )}

      {/* ====================================================================
          3. GTA SAN ANDREAS-STYLE OPEN-WORLD MISSION HUD
         ==================================================================== */}
      {joinedRoom && (
        <>
          {/* Top-Left Room & Active Mission Objective Bar */}
          <div className="fixed top-4 left-4 z-20 max-w-md pointer-events-none">
            <div className="bg-slate-900/95 border border-slate-700/90 rounded-2xl px-4 py-3 shadow-2xl pointer-events-auto space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">ROOM:</span>
                  <span className="text-sm font-extrabold font-mono text-amber-400 tabular-nums">
                    {activePin}
                  </span>
                  <button
                    onClick={handleCopyRoomPin}
                    title="Salin Kode Room"
                    className="p-1 text-slate-400 hover:text-slate-100 bg-slate-800 rounded transition-colors"
                  >
                    {copiedPin ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 tabular-nums">
                  <Users className="w-3.5 h-3.5" />
                  {classPlayers.length} Karakter di Map
                </span>
              </div>

              <div className="text-xs text-slate-200 leading-snug">
                <strong className="text-amber-400">MISI AKTIF: </strong>
                {answeredQuestionIds.size < activeQuestions.length ? (
                  <span>
                    Cari <strong>Barang Komponen (Hijau)</strong> atau{' '}
                    <strong>Duel Versus Siswa (Merah)</strong> untuk kumpulkan MP, lalu temui{' '}
                    <strong>Pak Azhary (Pilar Kuning)</strong> untuk menjawab seluruh soal!
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">
                    SELURUH SOAL MISI TUNTAS! Klik tombol Analisis Soal di bawah untuk melihat
                    evaluasi kelas.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Top-Right GTA San Andreas Style Status HUD (Respect $, Mission Points MP, Questions Answered) */}
          <div className="fixed top-4 right-4 z-20 pointer-events-none">
            <div className="bg-slate-900/95 border-2 border-slate-700 rounded-2xl px-5 py-3 shadow-2xl text-right space-y-1 font-mono tabular-nums pointer-events-auto">
              <div className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
                {studentName || 'Siswa'} · {studentClass}
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                $ {displayedScore.toString().padStart(6, '0')}
              </div>
              <div className="flex items-center justify-end gap-3 text-xs pt-0.5">
                <span className="px-2.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-600/70 text-emerald-300 font-bold">
                  POIN MISI: {displayedMp} MP
                </span>
                <span className="px-2.5 py-0.5 rounded bg-sky-950/90 border border-sky-600/70 text-sky-300 font-bold">
                  SOAL: {answeredQuestionIds.size}/{activeQuestions.length}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Barang Ditemukan: <strong className="text-slate-200">{collectedItemsCount}</strong>{' '}
                · Pos Koordinat: ({Math.round(localHud.x)}, {Math.round(localHud.y)})
              </div>
            </div>
          </div>

          {/* Item Pickup Notification Toast */}
          {pickupBanner && (
            <div className="fixed top-36 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="px-5 py-2.5 bg-slate-900/95 border-2 border-emerald-400 rounded-2xl shadow-2xl flex items-center gap-3">
                <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs font-bold text-slate-100">
                  BARANG DITEMUKAN:{' '}
                  <span className="text-emerald-300">{pickupBanner.itemName}</span>{' '}
                  <span className="font-mono text-amber-300 ml-1">
                    (+{pickupBanner.mpGain} Poin Misi MP)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Proximity Action Prompts: Meet Teacher OR Meet Another Student for Versus */}
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5 w-full max-w-xl px-4 pointer-events-none">
            {nearbyTeacherPost && (
              <div className="w-full p-4 bg-slate-900/95 border-2 border-amber-400 rounded-2xl shadow-2xl flex items-center justify-between gap-4 pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                      POS MISI GURU DITEMUKAN · {nearbyTeacherPost.buildingName}
                    </div>
                    <div className="text-sm font-extrabold text-slate-100">
                      {nearbyTeacherPost.title}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playDash();
                    setActiveTeacherModalIndex(nearbyTeacherPost.index);
                  }}
                  className="px-4 py-2.5 text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-colors whitespace-nowrap shrink-0"
                >
                  [F] Jawab Soal Guru
                </button>
              </div>
            )}

            {nearbyVersusTarget && (
              <div className="w-full p-4 bg-slate-900/95 border-2 border-rose-500 rounded-2xl shadow-2xl flex items-center justify-between gap-4 pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300">
                    <Swords className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-rose-400 uppercase">
                      BERTEMU SISWA DI MAP · TANTANGAN DUEL VERSUS 1V1
                    </div>
                    <div className="text-sm font-extrabold text-slate-100">
                      {nearbyVersusTarget.name} ({nearbyVersusTarget.studentClass})
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playDash();
                    setActiveVersusOpponent(nearbyVersusTarget);
                  }}
                  className="px-4 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg transition-colors whitespace-nowrap shrink-0"
                >
                  [V] Tantang Versus (+100 MP)
                </button>
              </div>
            )}
          </div>

          {/* Unified Collapsible Bottom Control Dock */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-[min(860px,92vw)] pointer-events-none flex flex-col items-center">
            <button
              onClick={() => setIsDockCollapsed((prev) => !prev)}
              className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1 text-[11px] font-semibold text-slate-300 bg-slate-900/95 hover:bg-slate-800 border border-b-0 border-slate-700 rounded-t-xl transition-colors whitespace-nowrap shrink-0"
            >
              {isDockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                  Tampilkan Panel Misi (H)
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                  Sembunyikan Panel Misi (H)
                </>
              )}
            </button>

            {!isDockCollapsed && (
              <div className="pointer-events-auto w-full bg-slate-900/95 border border-slate-700/90 rounded-2xl px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-2.5">
                {/* Left Quick Mission Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTeacherModalIndex(0)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Daftar Soal Guru ({answeredQuestionIds.size}/{activeQuestions.length})
                  </button>

                  {nearbyVersusTarget && (
                    <button
                      onClick={() => setActiveVersusOpponent(nearbyVersusTarget)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      <Swords className="w-4 h-4" />
                      Duel vs {nearbyVersusTarget.name}
                    </button>
                  )}
                </div>

                {/* Right Utility Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCameraMode((prev) =>
                        prev === 'FOLLOW_PLAYER' ? 'FULL_MAP' : 'FOLLOW_PLAYER'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    {cameraMode === 'FULL_MAP' ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                        Kamera GTA 3D
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                        Kamera Kota 1 Kelas
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsMaterialModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    Tambah Materi & Soal
                  </button>

                  <button
                    onClick={handleFinishToAnalysis}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-100 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-200" />
                    Analisis Butir Soal
                  </button>

                  <button
                    onClick={() => setIsMuted(soundEngine.toggleMute())}
                    title="Suara / Bisu"
                    className="p-2 text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-sky-400" />
                    )}
                  </button>

                  <button
                    onClick={() => setJoinedRoom(false)}
                    title="Keluar Room"
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ====================================================================
          4. DUEL VERSUS ANTAR SISWA MODAL (1V1)
         ==================================================================== */}
      <VersusDuelModal
        isOpen={Boolean(activeVersusOpponent)}
        opponent={activeVersusOpponent}
        localPlayerName={studentName || 'Siswa MTsN 14'}
        onClose={() => setActiveVersusOpponent(null)}
        onCompleteVersus={handleCompleteVersus}
      />

      {/* ====================================================================
          5. POS MISI GURU (PAK AZHARY MARDHANI, S.KOM) QUESTION MODAL
         ==================================================================== */}
      <TeacherQuestModal
        isOpen={activeTeacherModalIndex !== null}
        teacherStationIndex={activeTeacherModalIndex ?? 0}
        questions={activeQuestions}
        materials={materials}
        answeredQuestionIds={answeredQuestionIds}
        missionPoints={displayedMp}
        localPlayerId={localPlayerIdRef.current}
        localPlayerName={studentName || 'Siswa MTsN 14'}
        onClose={() => setActiveTeacherModalIndex(null)}
        onSubmitTeacherAnswer={handleSubmitTeacherAnswer}
        onOpenFullAnalysis={() => {
          setActiveTeacherModalIndex(null);
          handleFinishToAnalysis();
        }}
      />

      {/* ====================================================================
          6. LAPORAN ANALISIS BUTIR SOAL PSIKOMETRIK (POST-GAME / TEACHER VIEW)
         ==================================================================== */}
      {(roomStatus === 'FINISHED' || isAnalysisPreviewOpen) && (
        <ItemAnalysisView
          roomPin={activePin}
          questions={activeQuestions}
          sessionAnswers={sessionAnswers}
          players={classPlayers}
          isTeacherHost={localRole === 'TEACHER'}
          onPlayAgain={() => {
            setIsAnalysisPreviewOpen(false);
            setRoomStatus('PLAYING');
          }}
          onBackToMapLobby={() => {
            setIsAnalysisPreviewOpen(false);
            setRoomStatus('PLAYING');
          }}
          onOpenMaterialManager={() => {
            setIsAnalysisPreviewOpen(false);
            setIsMaterialModalOpen(true);
          }}
        />
      )}

      {/* ====================================================================
          7. MODAL KELOLA MATERI & BANK SOAL INFORMATIKA
         ==================================================================== */}
      <MaterialManagerModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        materials={materials}
        questions={questions}
        onSaveMaterial={handleSaveMaterial}
        onDeleteMaterial={handleDeleteMaterial}
        onSaveQuestion={handleSaveQuestion}
        onDeleteQuestion={handleDeleteQuestion}
      />
    </div>
  );
}
