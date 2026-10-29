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
import {
  TeacherQuestModal,
  VersusDuelModal,
  VersusMatchStateClient,
} from './components/VersusAndTeacherModals';
import { soundEngine } from './utils/soundEngine';
import { CloudArenaBridge } from './utils/cloudArenaBridge';
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
  Navigation,
  RotateCcw,
  CheckCircle2,
  MessageSquare,
  Send,
  X,
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

interface RoomChatMessageClient {
  id: string;
  senderId: string;
  senderName: string;
  senderClass: string;
  senderRole: 'TEACHER' | 'STUDENT';
  senderColor: string;
  text: string;
  timestamp: number;
}

interface SavedRealtimeSession {
  playerId: string;
  joinedRoom: boolean;
  activePin: string;
  studentName: string;
  studentClass: string;
  localRole: 'STUDENT' | 'TEACHER';
  selectedPresetId: string;
  avatarColor: string;
  selectedCategory: string;
  x: number;
  y: number;
  localScore: number;
  missionPoints: number;
  collectedItemsCount: number;
  answeredQuestionIds: string[];
  savedAt: number;
}

const TAB_PLAYER_ID_KEY = 'mtsn14_tab_player_id_v4';
const TAB_SESSION_STORAGE_KEY = 'mtsn14_halim_tab_session_v4';
const BACKUP_SESSION_STORAGE_KEY = 'mtsn14_halim_backup_session_v4';
const RELOAD_TICKET_KEY = 'mtsn14_reload_ticket_v4';

// Unique per-window in-memory runtime ID (NEVER cloned by Chrome "Duplicate Tab"!)
const WINDOW_RUNTIME_ID = `${Date.now().toString(36).slice(-4)}${Math.random()
  .toString(36)
  .slice(2, 6)}`;

const QUICK_CHAT_PHRASES = [
  'Halo semua! 👋',
  'Kumpul di Lapangan Upacara!',
  'Ayo Duel Versus 1v1! ⚔️',
  'Pak Azhary ada di Lab Komputer!',
  'GGWP Teman MTsN 14! 🔥',
];

function normalizePin(raw: string): string {
  const cleaned = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return cleaned || 'MTN14';
}

function makePlayerIdForWindow(nameOrRole?: string): string {
  const slug = String(nameOrRole || 'siswa')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  return `p-${slug || 'siswa'}-${WINDOW_RUNTIME_ID}`;
}

function getInitialSpawnForPlayer(playerId: string): { x: number; y: number } {
  let seed = 0;
  for (let i = 0; i < playerId.length; i++) {
    seed = (seed * 31 + playerId.charCodeAt(i)) % 360;
  }
  const rad = (seed * Math.PI) / 180;
  return {
    x: Math.round(1200 + Math.cos(rad) * 52),
    y: Math.round(780 + Math.sin(rad) * 34),
  };
}

function loadSavedSession(): SavedRealtimeSession | null {
  try {
    // Check if this page load is an actual F5 / browser reload of an active tab (within 5 seconds of beforeunload)
    // vs a "Duplicate Tab" or newly opened tab (where beforeunload did NOT fire!)
    const ticketRaw = sessionStorage.getItem(RELOAD_TICKET_KEY);
    sessionStorage.removeItem(RELOAD_TICKET_KEY);

    let isTruePageReload = false;
    let ticketPlayerId = '';
    if (ticketRaw) {
      try {
        const ticket = JSON.parse(ticketRaw);
        if (ticket && ticket.playerId && Date.now() - (ticket.ts || 0) < 6000) {
          isTruePageReload = true;
          ticketPlayerId = ticket.playerId;
        }
      } catch {
        // Ignore
      }
    }

    if (isTruePageReload) {
      const tabRaw = sessionStorage.getItem(TAB_SESSION_STORAGE_KEY);
      if (tabRaw) {
        const parsed = JSON.parse(tabRaw) as SavedRealtimeSession;
        if (parsed && parsed.studentName) {
          return { ...parsed, playerId: ticketPlayerId };
        }
      }
    }

    // For a newly opened tab or "Duplicate Tab", ALWAYS generate a 100% unique playerId and start at Lobby (joinedRoom: false)
    const freshTabId = makePlayerIdForWindow('siswa');
    sessionStorage.setItem(TAB_PLAYER_ID_KEY, freshTabId);
    const spawn = getInitialSpawnForPlayer(freshTabId);

    const backupRaw = localStorage.getItem(BACKUP_SESSION_STORAGE_KEY);
    if (backupRaw) {
      const parsedBackup = JSON.parse(backupRaw) as SavedRealtimeSession;
      if (parsedBackup) {
        return {
          ...parsedBackup,
          playerId: freshTabId,
          joinedRoom: false,
          x: spawn.x,
          y: spawn.y,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Merge incoming player list while preserving fresher WebSocket/CloudBridge movement AND active cross-container peers
function mergePlayersPreservingFreshMovement(
  prev: MapPlayerEntity[],
  incoming: MapPlayerEntity[]
): MapPlayerEntity[] {
  const now = Date.now();
  const prevMap = new Map<string, MapPlayerEntity>();
  for (const p of prev) prevMap.set(p.id, p);

  const incomingIds = new Set<string>();
  const merged = incoming.map((inc) => {
    incomingIds.add(inc.id);
    const existing = prevMap.get(inc.id);
    if (
      existing &&
      existing.lastUpdated &&
      inc.lastUpdated &&
      existing.lastUpdated > inc.lastUpdated
    ) {
      return {
        ...inc,
        x: existing.x,
        y: existing.y,
        vx: existing.vx,
        vy: existing.vy,
        facingAngle: existing.facingAngle,
        jumpY: existing.jumpY,
        lastChatText: existing.lastChatText ?? inc.lastChatText,
        lastChatTime: existing.lastChatTime ?? inc.lastChatTime,
        lastUpdated: existing.lastUpdated,
      };
    }
    return inc;
  });

  // Also keep any recently active human players received via CloudArenaBridge / BroadcastChannel (within last 25s)
  for (const p of prev) {
    if (!incomingIds.has(p.id) && !p.isRoamingPeer && now - (p.lastUpdated || 0) < 25000) {
      merged.push(p);
    }
  }

  return merged;
}

export default function App() {
  const initialSession = useMemo(() => loadSavedSession(), []);

  const [entryTab, setEntryTab] = useState<'STUDENT' | 'TEACHER'>(
    initialSession?.localRole === 'TEACHER' ? 'TEACHER' : 'STUDENT'
  );
  const [joinedRoom, setJoinedRoom] = useState<boolean>(Boolean(initialSession?.joinedRoom));
  const [localRole, setLocalRole] = useState<'STUDENT' | 'TEACHER'>(
    initialSession?.localRole || 'STUDENT'
  );

  // Student & Room Form Inputs (Pre-filled from real-time saved session if available)
  const [roomCodeInput, setRoomCodeInput] = useState<string>(
    initialSession?.activePin || 'MTN14'
  );
  const [studentName, setStudentName] = useState<string>(initialSession?.studentName || '');
  const [studentClass, setStudentClass] = useState<string>(
    initialSession?.studentClass || 'Kelas 8A'
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    initialSession?.selectedPresetId || CHARACTER_PRESETS[0].id
  );
  const [avatarColor, setAvatarColor] = useState<string>(
    initialSession?.avatarColor || CHARACTER_PRESETS[0].jacketColor
  );
  const [teacherRoomCode, setTeacherRoomCode] = useState<string>(
    initialSession?.activePin || 'MTN14'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialSession?.selectedCategory || 'Semua Materi'
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Collapsible Bottom Dock State & Mobile Peers Drawer
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isMobilePeersOpen, setIsMobilePeersOpen] = useState<boolean>(false);

  // Roblox-Style Open-World Chat State
  const [chatMessages, setChatMessages] = useState<RoomChatMessageClient[]>([]);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [localChatBubble, setLocalChatBubble] = useState<{
    text: string;
    timestamp: number;
  } | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const lastSeenChatIdRef = useRef<string>('');

  // Real-Time Mutual-Consent Versus Duel State
  const [versusMatches, setVersusMatches] = useState<VersusMatchStateClient[]>([]);
  const [dismissedMatchIds, setDismissedMatchIds] = useState<Set<string>>(() => new Set());
  const [openVersusModalMatchId, setOpenVersusModalMatchId] = useState<string | null>(null);

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
      roomName: 'Kampus MTsN 14 Halim Jakarta Timur',
      teacherName: 'Azhary Mardhani, S.Kom',
      status: 'PLAYING',
      studentCount: 1,
      totalPlayers: 3,
      categoryFilter: 'Semua Materi',
    },
  ]);

  // Synchronized Classroom Room State
  const [activePin, setActivePin] = useState<string>(initialSession?.activePin || 'MTN14');
  const [roomStatus, setRoomStatus] = useState<'LOBBY' | 'PLAYING' | 'ROUND_RESULT' | 'FINISHED'>(
    'PLAYING'
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [classPlayers, setClassPlayers] = useState<MapPlayerEntity[]>([]);
  const [sessionAnswers, setSessionAnswers] = useState<PlayerAnswerEvent[]>([]);

  // Local Open-World Mission Progress
  const [missionPoints, setMissionPoints] = useState<number>(
    initialSession?.missionPoints ?? 100
  );
  const [collectedItemsCount, setCollectedItemsCount] = useState<number>(
    initialSession?.collectedItemsCount ?? 0
  );
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(
    () => new Set(initialSession?.answeredQuestionIds || [])
  );
  const [localScore, setLocalScore] = useState<number>(initialSession?.localScore ?? 0);

  // Teleport / Spawn command
  const [teleportCommand, setTeleportCommand] = useState<{
    x: number;
    y: number;
    seq: number;
  } | null>(() =>
    initialSession && typeof initialSession.x === 'number' && typeof initialSession.y === 'number'
      ? { x: initialSession.x, y: initialSession.y, seq: Date.now() }
      : null
  );

  // Proximity Interactions on the 3D Map
  const [nearbyTeacherPost, setNearbyTeacherPost] = useState<TeacherPostLocation | null>(null);
  const [nearbyVersusTarget, setNearbyVersusTarget] = useState<MapPlayerEntity | null>(null);
  const [activeTeacherModalIndex, setActiveTeacherModalIndex] = useState<number | null>(null);
  const [pickupBanner, setPickupBanner] = useState<{ itemName: string; mpGain: number } | null>(
    null
  );
  const [resumedSessionToast, setResumedSessionToast] = useState<boolean>(
    Boolean(initialSession?.joinedRoom && initialSession?.studentName)
  );
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('Tersimpan Realtime');

  // Camera & Modals
  const [cameraMode, setCameraMode] = useState<'FOLLOW_PLAYER' | 'FULL_MAP'>('FOLLOW_PLAYER');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState<boolean>(false);
  const [isAnalysisPreviewOpen, setIsAnalysisPreviewOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const initialTabPlayerId = useMemo(
    () => initialSession?.playerId || makePlayerIdForWindow(initialSession?.studentName || 'siswa'),
    [initialSession]
  );
  const initialSpawn = useMemo(
    () => getInitialSpawnForPlayer(initialTabPlayerId),
    [initialTabPlayerId]
  );

  const [localHud, setLocalHud] = useState<{ x: number; y: number; hp: number }>({
    x: initialSession?.x ?? initialSpawn.x,
    y: initialSession?.y ?? initialSpawn.y,
    hp: 100,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const cloudBridgeRef = useRef<CloudArenaBridge | null>(null);
  const hasSpawnedInRoomRef = useRef<boolean>(Boolean(initialSession?.joinedRoom));
  const localPlayerIdRef = useRef<string>(initialTabPlayerId);
  const latestPosRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    facingAngle: number;
    jumpY: number;
  }>({
    x: initialSession?.x ?? initialSpawn.x,
    y: initialSession?.y ?? initialSpawn.y,
    vx: 0,
    vy: 0,
    facingAngle: Math.PI,
    jumpY: 0,
  });

  // Always keep a ref of current player metadata so WebSocket & HTTP intervals never need to tear down on score/MP updates
  const playerMetaRef = useRef({
    joinedRoom,
    activePin,
    studentName,
    studentClass,
    localRole,
    avatarColor,
    selectedPresetId,
    localScore,
    missionPoints,
    collectedItemsCount,
    answeredQuestionIds,
    localChatBubble,
  });
  playerMetaRef.current = {
    joinedRoom,
    activePin,
    studentName,
    studentClass,
    localRole,
    avatarColor,
    selectedPresetId,
    localScore,
    missionPoints,
    collectedItemsCount,
    answeredQuestionIds,
    localChatBubble,
  };

  useEffect(() => {
    if (!resumedSessionToast) return;
    const t = setTimeout(() => setResumedSessionToast(false), 5500);
    return () => clearTimeout(t);
  }, [resumedSessionToast]);

  useEffect(() => {
    if (isChatOpen) {
      setUnreadChatCount(0);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  }, [isChatOpen, chatMessages.length]);

  // Save Real-Time Snapshot to localStorage whenever state or position changes
  const persistRealtimeSnapshot = useCallback(
    (overrideJoined?: boolean, overrideX?: number, overrideY?: number) => {
      try {
        const snapshot: SavedRealtimeSession = {
          playerId: localPlayerIdRef.current,
          joinedRoom: overrideJoined !== undefined ? overrideJoined : joinedRoom,
          activePin,
          studentName,
          studentClass,
          localRole,
          selectedPresetId,
          avatarColor,
          selectedCategory,
          x: overrideX !== undefined ? overrideX : latestPosRef.current.x,
          y: overrideY !== undefined ? overrideY : latestPosRef.current.y,
          localScore,
          missionPoints,
          collectedItemsCount,
          answeredQuestionIds: Array.from(answeredQuestionIds),
          savedAt: Date.now(),
        };
        const serialized = JSON.stringify(snapshot);
        sessionStorage.setItem(TAB_SESSION_STORAGE_KEY, serialized);
        if (snapshot.studentName) {
          localStorage.setItem(BACKUP_SESSION_STORAGE_KEY, serialized);
        }
        const now = new Date();
        setLastAutoSaveTime(
          `${now.getHours().toString().padStart(2, '0')}:${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
        );
      } catch {
        // Ignore storage quota errors
      }
    },
    [
      joinedRoom,
      activePin,
      studentName,
      studentClass,
      localRole,
      selectedPresetId,
      avatarColor,
      selectedCategory,
      localScore,
      missionPoints,
      collectedItemsCount,
      answeredQuestionIds,
    ]
  );

  useEffect(() => {
    persistRealtimeSnapshot();
  }, [persistRealtimeSnapshot]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      persistRealtimeSnapshot();
      try {
        sessionStorage.setItem(
          RELOAD_TICKET_KEY,
          JSON.stringify({ playerId: localPlayerIdRef.current, ts: Date.now() })
        );
      } catch {
        // Ignore
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistRealtimeSnapshot();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [persistRealtimeSnapshot]);

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
      setRoomCodeInput(normalizePin(rParam));
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
    const timer = setInterval(fetchBootstrap, 4000);
    return () => clearInterval(timer);
  }, [fetchBootstrap]);

  const applyRestoredServerPlayer = useCallback(
    (serverPlayer?: {
      x?: number;
      y?: number;
      score?: number;
      missionPoints?: number;
      collectedItemsCount?: number;
      answeredQuestionIds?: string[];
    }) => {
      if (!serverPlayer) return;
      if (typeof serverPlayer.score === 'number') {
        setLocalScore((prev) => Math.max(prev, serverPlayer.score!));
      }
      if (typeof serverPlayer.missionPoints === 'number') {
        setMissionPoints(serverPlayer.missionPoints);
      }
      if (typeof serverPlayer.collectedItemsCount === 'number') {
        setCollectedItemsCount((prev) => Math.max(prev, serverPlayer.collectedItemsCount!));
      }
      if (Array.isArray(serverPlayer.answeredQuestionIds) && serverPlayer.answeredQuestionIds.length) {
        setAnsweredQuestionIds((prev) => {
          const next = new Set(prev);
          for (const qId of serverPlayer.answeredQuestionIds!) next.add(qId);
          return next;
        });
      }
    },
    []
  );

  // Merge incoming versus match update
  const upsertVersusMatchState = useCallback((match: VersusMatchStateClient) => {
    setVersusMatches((prev) => {
      const filtered = prev.filter((m) => m.id !== match.id);
      return [...filtered, match];
    });
    if (
      (match.challengerId === localPlayerIdRef.current ||
        match.opponentId === localPlayerIdRef.current) &&
      match.status === 'IN_PROGRESS'
    ) {
      setOpenVersusModalMatchId(match.id);
    }
  }, []);

  // Helper to upsert a single incoming remote player movement packet into classPlayers
  const applyIncomingPlayerMoved = useCallback((payload: any) => {
    if (!payload || !payload.playerId) return;
    const {
      playerId,
      name,
      studentClass: pClass,
      role,
      characterPreset,
      color,
      x,
      y,
      vx,
      vy,
      facingAngle,
      jumpY,
      score,
      missionPoints: mp,
      collectedItemsCount: itemsCount,
      answeredCount,
      lastChatText,
      lastChatTime,
      lastUpdated,
      isRoamingPeer,
    } = payload;

    setClassPlayers((prev) => {
      const exists = prev.some((p) => p.id === playerId);
      if (!exists) {
        return [
          ...prev,
          {
            id: playerId,
            name: name || 'Siswa MTsN 14',
            studentClass: pClass || 'Kelas 8A',
            role: role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
            characterPreset: characterPreset || 'cj_rizky',
            color: color || '#0ea5e9',
            x: x ?? 1200,
            y: y ?? 780,
            vx: vx ?? 0,
            vy: vy ?? 0,
            facingAngle: facingAngle ?? Math.PI,
            jumpY: jumpY ?? 0,
            score: score ?? 0,
            missionPoints: mp ?? 100,
            collectedItemsCount: itemsCount ?? 0,
            answeredCount: answeredCount ?? 0,
            streak: 0,
            hp: 100,
            currentSector: null,
            lockedOption: null,
            lastChatText,
            lastChatTime,
            lastUpdated: lastUpdated || Date.now(),
            isRoamingPeer: Boolean(isRoamingPeer),
          },
        ];
      }
      return prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              name: name || p.name,
              studentClass: pClass || p.studentClass,
              role: role || p.role,
              characterPreset: characterPreset || p.characterPreset,
              color: color || p.color,
              x: typeof x === 'number' ? x : p.x,
              y: typeof y === 'number' ? y : p.y,
              vx: typeof vx === 'number' ? vx : p.vx,
              vy: typeof vy === 'number' ? vy : p.vy,
              facingAngle: typeof facingAngle === 'number' ? facingAngle : p.facingAngle,
              jumpY: typeof jumpY === 'number' ? jumpY : p.jumpY,
              score: score ?? p.score,
              missionPoints: mp ?? p.missionPoints,
              collectedItemsCount: itemsCount ?? p.collectedItemsCount,
              answeredCount: answeredCount ?? p.answeredCount,
              lastChatText: lastChatText ?? p.lastChatText,
              lastChatTime: lastChatTime ?? p.lastChatTime,
              lastUpdated: lastUpdated || Date.now(),
              isRoamingPeer:
                typeof isRoamingPeer === 'boolean' ? isRoamingPeer : p.isRoamingPeer,
            }
          : p
      );
    });
  }, []);

  // Initialize Multi-Transport CloudArenaBridge (BroadcastChannel + Dual MQTT-over-WS Brokers)
  useEffect(() => {
    const bridge = new CloudArenaBridge();
    cloudBridgeRef.current = bridge;

    const unsubscribe = bridge.subscribe((pkt) => {
      if (pkt.type === 'arena:hello') {
        // If another tab or device claims the exact same playerId, immediately switch our playerId so both appear!
        if (
          pkt.payload?.playerId &&
          pkt.payload.playerId === localPlayerIdRef.current &&
          pkt.originTabId !== bridge.tabRuntimeId
        ) {
          const newId = makePlayerIdForWindow(playerMetaRef.current.studentName || 'siswa');
          localPlayerIdRef.current = newId;
        }
        // Immediately reply with our current position so the newly joined classmate sees us right away!
        const meta = playerMetaRef.current;
        if (meta.joinedRoom) {
          bridge.publish('player:moved', {
            playerId: localPlayerIdRef.current,
            name: meta.studentName || 'Siswa MTsN 14',
            studentClass: meta.studentClass,
            role: meta.localRole,
            characterPreset: meta.selectedPresetId,
            color: meta.avatarColor,
            x: latestPosRef.current.x,
            y: latestPosRef.current.y,
            vx: latestPosRef.current.vx,
            vy: latestPosRef.current.vy,
            facingAngle: latestPosRef.current.facingAngle,
            jumpY: latestPosRef.current.jumpY,
            score: meta.localScore,
            missionPoints: meta.missionPoints,
            collectedItemsCount: meta.collectedItemsCount,
            answeredCount: meta.answeredQuestionIds.size,
            answeredQuestionIds: Array.from(meta.answeredQuestionIds),
            lastChatText: meta.localChatBubble?.text,
            lastChatTime: meta.localChatBubble?.timestamp,
            lastUpdated: Date.now(),
            isRoamingPeer: false,
          });
        }
      } else if (pkt.type === 'player:moved') {
        applyIncomingPlayerMoved(pkt.payload);
      } else if (pkt.type === 'player:left' && pkt.payload?.playerId) {
        setClassPlayers((prev) => prev.filter((p) => p.id !== pkt.payload.playerId));
      } else if (pkt.type === 'chat:message' && pkt.payload?.id) {
        const incomingChat = pkt.payload as RoomChatMessageClient;
        setChatMessages((prev) => {
          if (prev.some((c) => c.id === incomingChat.id)) return prev;
          return [...prev, incomingChat].slice(-60);
        });
        setClassPlayers((prev) =>
          prev.map((p) =>
            p.id === incomingChat.senderId
              ? {
                  ...p,
                  lastChatText: incomingChat.text,
                  lastChatTime: incomingChat.timestamp,
                }
              : p
          )
        );
        if (incomingChat.senderId !== localPlayerIdRef.current) {
          soundEngine.playPickupData();
          setUnreadChatCount((c) => c + 1);
        }
      } else if (pkt.type === 'versus:update' && pkt.payload?.id) {
        const match = pkt.payload as VersusMatchStateClient;
        upsertVersusMatchState(match);
        if (
          match.status === 'PENDING_CONSENT' &&
          match.opponentId === localPlayerIdRef.current
        ) {
          soundEngine.playDash();
        }
      } else if (pkt.type === 'teacher:answer' && pkt.payload?.questionId) {
        const ev = pkt.payload as PlayerAnswerEvent;
        setSessionAnswers((prev) => [...prev, ev]);
      } else if (pkt.type === 'room:status' && pkt.payload?.status) {
        setRoomStatus(pkt.payload.status);
      }
    });

    return () => {
      unsubscribe();
      bridge.dispose();
    };
  }, [applyIncomingPlayerMoved, upsertVersusMatchState]);

  // Connect & Auto-Reconnect to Real-Time Classroom WebSocket Server (Depends ONLY on joinedRoom so it never disconnects on score/MP updates!)
  useEffect(() => {
    let isUnmounted = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connectWs = () => {
      if (isUnmounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        const meta = playerMetaRef.current;
        if (meta.joinedRoom) {
          ws.send(
            JSON.stringify({
              type: 'room:join',
              payload: {
                pin: meta.activePin,
                playerId: localPlayerIdRef.current,
                playerName: meta.studentName || 'Siswa MTsN 14',
                studentClass: meta.studentClass,
                role: meta.localRole,
                color: meta.avatarColor,
                characterPreset: meta.selectedPresetId,
                x: latestPosRef.current.x,
                y: latestPosRef.current.y,
                score: meta.localScore,
                missionPoints: meta.missionPoints,
                collectedItemsCount: meta.collectedItemsCount,
                answeredQuestionIds: Array.from(meta.answeredQuestionIds),
              },
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'room:joined') {
            const room = msg.payload;
            setRoomStatus(room.status);
            setSelectedCategory(room.categoryFilter || 'Semua Materi');
            setCurrentQuestionIndex(room.currentQuestionIndex || 0);
            setClassPlayers((prev) =>
              mergePlayersPreservingFreshMovement(prev, room.players || [])
            );
            setSessionAnswers(room.answers || []);
            if (Array.isArray(room.chatMessages)) {
              setChatMessages(room.chatMessages);
            }
            if (Array.isArray(room.versusMatches)) {
              setVersusMatches(room.versusMatches);
            }
            applyRestoredServerPlayer(room.player);
            if (
              !hasSpawnedInRoomRef.current &&
              typeof room.spawnX === 'number' &&
              typeof room.spawnY === 'number'
            ) {
              hasSpawnedInRoomRef.current = true;
              latestPosRef.current.x = room.spawnX;
              latestPosRef.current.y = room.spawnY;
              setTeleportCommand({
                x: room.spawnX,
                y: room.spawnY,
                seq: Date.now(),
              });
            }
            setAuthError(null);
            setJoinedRoom(true);
          } else if (msg.type === 'room:state') {
            const room = msg.payload;
            setRoomStatus((prevStatus) => {
              if (prevStatus !== 'FINISHED' && room.status === 'FINISHED') {
                soundEngine.playVictoryFanfare();
              }
              return room.status;
            });
            setSelectedCategory(room.categoryFilter || 'Semua Materi');
            setCurrentQuestionIndex(room.currentQuestionIndex || 0);
            setClassPlayers((prev) =>
              mergePlayersPreservingFreshMovement(prev, room.players || [])
            );
            setSessionAnswers(room.answers || []);
            if (Array.isArray(room.chatMessages)) {
              setChatMessages(room.chatMessages);
            }
            if (Array.isArray(room.versusMatches)) {
              setVersusMatches(room.versusMatches);
            }
          } else if (msg.type === 'player:moved') {
            applyIncomingPlayerMoved(msg.payload);
          } else if (msg.type === 'chat:message') {
            const incomingChat = msg.payload as RoomChatMessageClient;
            if (incomingChat && incomingChat.id) {
              setChatMessages((prev) => {
                if (prev.some((c) => c.id === incomingChat.id)) return prev;
                return [...prev, incomingChat].slice(-60);
              });
              setClassPlayers((prev) =>
                prev.map((p) =>
                  p.id === incomingChat.senderId
                    ? {
                        ...p,
                        lastChatText: incomingChat.text,
                        lastChatTime: incomingChat.timestamp,
                      }
                    : p
                )
              );
              if (incomingChat.senderId !== localPlayerIdRef.current) {
                soundEngine.playPickupData();
                setUnreadChatCount((c) => c + 1);
              }
            }
          } else if (msg.type === 'versus:update') {
            const match = msg.payload as VersusMatchStateClient;
            if (match && match.id) {
              upsertVersusMatchState(match);
              if (
                match.status === 'PENDING_CONSENT' &&
                match.opponentId === localPlayerIdRef.current
              ) {
                soundEngine.playDash();
              }
            }
          } else if (msg.type === 'room:error') {
            setAuthError(msg.payload?.message || 'Kode Room tidak ditemukan.');
            soundEngine.playWrongAnswer();
          }
        } catch {
          // Ignore malformed packets
        }
      };

      ws.onclose = () => {
        if (!isUnmounted) {
          reconnectTimer = setTimeout(connectWs, 1500);
        }
      };
    };

    connectWs();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [joinedRoom, applyRestoredServerPlayer, applyIncomingPlayerMoved, upsertVersusMatchState]);

  // Dual-Transport HTTP Heartbeat & CloudBridge Announce (Every 350ms while joinedRoom is true)
  useEffect(() => {
    if (!joinedRoom) return;

    // Immediately announce our arrival on CloudArenaBridge so all tabs/devices reply with their positions
    cloudBridgeRef.current?.publish('arena:hello', {
      playerId: localPlayerIdRef.current,
      name: playerMetaRef.current.studentName || 'Siswa MTsN 14',
    });

    const syncNow = () => {
      const meta = playerMetaRef.current;
      // 1. Broadcast our presence over CloudArenaBridge (keeps us visible across tabs, ais-dev, ais-pre, & phones even when standing still!)
      cloudBridgeRef.current?.publish('player:moved', {
        playerId: localPlayerIdRef.current,
        name: meta.studentName || 'Siswa MTsN 14',
        studentClass: meta.studentClass,
        role: meta.localRole,
        characterPreset: meta.selectedPresetId,
        color: meta.avatarColor,
        x: latestPosRef.current.x,
        y: latestPosRef.current.y,
        vx: latestPosRef.current.vx,
        vy: latestPosRef.current.vy,
        facingAngle: latestPosRef.current.facingAngle,
        jumpY: latestPosRef.current.jumpY,
        score: meta.localScore,
        missionPoints: meta.missionPoints,
        collectedItemsCount: meta.collectedItemsCount,
        answeredCount: meta.answeredQuestionIds.size,
        answeredQuestionIds: Array.from(meta.answeredQuestionIds),
        lastChatText: meta.localChatBubble?.text,
        lastChatTime: meta.localChatBubble?.timestamp,
        lastUpdated: Date.now(),
        isRoamingPeer: false,
      });

      // 2. Sync with local server via HTTP
      fetch('/api/room/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: meta.activePin,
          playerId: localPlayerIdRef.current,
          playerName: meta.studentName || 'Siswa MTsN 14',
          studentClass: meta.studentClass,
          role: meta.localRole,
          color: meta.avatarColor,
          characterPreset: meta.selectedPresetId,
          x: latestPosRef.current.x,
          y: latestPosRef.current.y,
          vx: latestPosRef.current.vx,
          vy: latestPosRef.current.vy,
          facingAngle: latestPosRef.current.facingAngle,
          jumpY: latestPosRef.current.jumpY,
          score: meta.localScore,
          missionPoints: meta.missionPoints,
          collectedItemsCount: meta.collectedItemsCount,
          answeredCount: meta.answeredQuestionIds.size,
          answeredQuestionIds: Array.from(meta.answeredQuestionIds),
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.room) {
            setClassPlayers((prev) =>
              mergePlayersPreservingFreshMovement(prev, data.room.players || [])
            );
            if (Array.isArray(data.room.answers) && data.room.answers.length > 0) {
              setSessionAnswers(data.room.answers);
            }
            if (Array.isArray(data.room.chatMessages)) {
              const msgs = data.room.chatMessages as RoomChatMessageClient[];
              setChatMessages((prev) => {
                const map = new Map<string, RoomChatMessageClient>();
                for (const m of prev) map.set(m.id, m);
                for (const m of msgs) map.set(m.id, m);
                return Array.from(map.values())
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .slice(-60);
              });
            }
            if (Array.isArray(data.room.versusMatches)) {
              for (const m of data.room.versusMatches) {
                upsertVersusMatchState(m);
              }
            }
          }
          if (data?.player) {
            applyRestoredServerPlayer(data.player);
          }
        })
        .catch(() => {});
    };

    syncNow();
    const interval = setInterval(syncNow, 350);
    return () => clearInterval(interval);
  }, [joinedRoom, applyRestoredServerPlayer, upsertVersusMatchState]);

  const enterRoomWithPin = async (
    rawPin: string,
    pName: string,
    pClass: string,
    role: 'STUDENT' | 'TEACHER',
    preset: string,
    color: string,
    catFilter: string,
    keepSavedPosition = false
  ) => {
    const cleanPin = normalizePin(rawPin);
    setActivePin(cleanPin);
    setLocalRole(role);

    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: cleanPin,
          playerId: localPlayerIdRef.current,
          playerName: pName,
          studentClass: pClass,
          role,
          color,
          characterPreset: preset,
          categoryFilter: catFilter,
          x: keepSavedPosition ? latestPosRef.current.x : undefined,
          y: keepSavedPosition ? latestPosRef.current.y : undefined,
          score: localScore,
          missionPoints,
          collectedItemsCount,
          answeredQuestionIds: Array.from(answeredQuestionIds),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.room) {
          setClassPlayers(data.room.players || []);
          setSessionAnswers(data.room.answers || []);
          setRoomStatus(data.room.status || 'PLAYING');
          setSelectedCategory(data.room.categoryFilter || 'Semua Materi');
          if (Array.isArray(data.room.chatMessages)) {
            setChatMessages(data.room.chatMessages);
          }
          if (Array.isArray(data.room.versusMatches)) {
            setVersusMatches(data.room.versusMatches);
          }
        }
        if (data?.player) {
          applyRestoredServerPlayer(data.player);
        }
        if (typeof data?.spawnX === 'number' && typeof data?.spawnY === 'number') {
          latestPosRef.current.x = data.spawnX;
          latestPosRef.current.y = data.spawnY;
          setTeleportCommand({
            x: data.spawnX,
            y: data.spawnY,
            seq: Date.now(),
          });
        }
      }
    } catch {
      // Fallback to WS if HTTP is busy
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: role === 'TEACHER' ? 'room:create' : 'room:join',
          payload: {
            pin: cleanPin,
            roomName: `Kampus MTsN 14 Halim (${cleanPin})`,
            teacherName: 'Azhary Mardhani, S.Kom',
            playerId: localPlayerIdRef.current,
            playerName: pName,
            studentClass: pClass,
            role,
            color,
            characterPreset: preset,
            categoryFilter: catFilter,
            x: keepSavedPosition ? latestPosRef.current.x : undefined,
            y: keepSavedPosition ? latestPosRef.current.y : undefined,
            score: localScore,
            missionPoints,
            collectedItemsCount,
            answeredQuestionIds: Array.from(answeredQuestionIds),
          },
        })
      );
    }

    setAuthError(null);
    setJoinedRoom(true);
    persistRealtimeSnapshot(true, latestPosRef.current.x, latestPosRef.current.y);
    soundEngine.playDash();
  };

  const handleStudentJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = normalizePin(roomCodeInput);
    const cleanName = studentName.trim();

    if (!cleanPin) {
      setAuthError('Silakan masukkan Kode Room Kelas terlebih dahulu.');
      return;
    }
    if (!cleanName) {
      setAuthError('Silakan isi Nama Lengkap Siswa terlebih dahulu.');
      return;
    }

    const uniqueId = makePlayerIdForWindow(cleanName);
    localPlayerIdRef.current = uniqueId;
    const spawn = getInitialSpawnForPlayer(uniqueId);
    latestPosRef.current.x = spawn.x;
    latestPosRef.current.y = spawn.y;
    hasSpawnedInRoomRef.current = true;
    setTeleportCommand({ x: spawn.x, y: spawn.y, seq: Date.now() });

    setCameraMode('FOLLOW_PLAYER');
    enterRoomWithPin(
      cleanPin,
      cleanName,
      studentClass,
      'STUDENT',
      selectedPresetId,
      avatarColor,
      selectedCategory,
      true
    );
  };

  const handleTeacherOpenRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = normalizePin(teacherRoomCode);
    const uniqueId = makePlayerIdForWindow('azhary');
    localPlayerIdRef.current = uniqueId;
    const spawn = getInitialSpawnForPlayer(uniqueId);
    latestPosRef.current.x = spawn.x;
    latestPosRef.current.y = spawn.y;
    hasSpawnedInRoomRef.current = true;
    setTeleportCommand({ x: spawn.x, y: spawn.y, seq: Date.now() });

    setStudentName('Azhary Mardhani, S.Kom');
    setStudentClass('Guru Informatika');
    setSelectedPresetId('cj_rizky');
    setAvatarColor('#f59e0b');
    setCameraMode('FULL_MAP');

    enterRoomWithPin(
      cleanPin,
      'Azhary Mardhani, S.Kom',
      'Guru Informatika',
      'TEACHER',
      'cj_rizky',
      '#f59e0b',
      selectedCategory,
      true
    );
  };

  const handleResetSavedSession = () => {
    const oldPlayerId = localPlayerIdRef.current;
    try {
      sessionStorage.removeItem(TAB_SESSION_STORAGE_KEY);
      sessionStorage.removeItem(TAB_PLAYER_ID_KEY);
      sessionStorage.removeItem(RELOAD_TICKET_KEY);
      localStorage.removeItem(BACKUP_SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    if (oldPlayerId) {
      cloudBridgeRef.current?.publish('player:left', { playerId: oldPlayerId });
      fetch('/api/room/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: oldPlayerId }),
      }).catch(() => {});
    }
    const freshId = makePlayerIdForWindow('siswa');
    const freshSpawn = getInitialSpawnForPlayer(freshId);
    localPlayerIdRef.current = freshId;
    hasSpawnedInRoomRef.current = false;
    latestPosRef.current = {
      x: freshSpawn.x,
      y: freshSpawn.y,
      vx: 0,
      vy: 0,
      facingAngle: Math.PI,
      jumpY: 0,
    };
    setStudentName('');
    setLocalScore(0);
    setMissionPoints(100);
    setCollectedItemsCount(0);
    setAnsweredQuestionIds(new Set());
    setJoinedRoom(false);
  };

  const handleEmitLocalMove = useCallback(
    (
      x: number,
      y: number,
      vx: number,
      vy: number,
      facingAngle: number,
      jumpY: number,
      scoreBonus = 0,
      missionPointsDelta = 0,
      collectedDelta = 0
    ) => {
      latestPosRef.current = { x, y, vx, vy, facingAngle, jumpY };

      const meta = playerMetaRef.current;
      const nextScore = meta.localScore + scoreBonus;
      const nextMp = Math.max(0, meta.missionPoints + missionPointsDelta);
      const nextCollected = meta.collectedItemsCount + collectedDelta;

      if (scoreBonus !== 0) {
        setLocalScore(nextScore);
      }
      if (missionPointsDelta !== 0) {
        setMissionPoints(nextMp);
      }
      if (collectedDelta !== 0) {
        setCollectedItemsCount(nextCollected);
      }

      persistRealtimeSnapshot(true, x, y);

      // 1. Broadcast over CloudArenaBridge + BroadcastChannel
      cloudBridgeRef.current?.publish('player:moved', {
        playerId: localPlayerIdRef.current,
        name: meta.studentName || 'Siswa MTsN 14',
        studentClass: meta.studentClass,
        role: meta.localRole,
        characterPreset: meta.selectedPresetId,
        color: meta.avatarColor,
        x,
        y,
        vx,
        vy,
        facingAngle,
        jumpY,
        score: nextScore,
        missionPoints: nextMp,
        collectedItemsCount: nextCollected,
        answeredCount: meta.answeredQuestionIds.size,
        answeredQuestionIds: Array.from(meta.answeredQuestionIds),
        lastChatText: meta.localChatBubble?.text,
        lastChatTime: meta.localChatBubble?.timestamp,
        lastUpdated: Date.now(),
        isRoamingPeer: false,
      });

      // 2. Broadcast over local WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'player:move',
            payload: {
              pin: meta.activePin,
              playerId: localPlayerIdRef.current,
              playerName: meta.studentName || 'Siswa MTsN 14',
              studentClass: meta.studentClass,
              characterPreset: meta.selectedPresetId,
              color: meta.avatarColor,
              x,
              y,
              vx,
              vy,
              facingAngle,
              jumpY,
              scoreBonus,
              missionPointsDelta,
              collectedDelta,
            },
          })
        );
      }
    },
    [persistRealtimeSnapshot]
  );

  // Send Roblox-Style Chat Message + Trigger 3D Overhead Speech Bubble
  const handleSendChatMessage = useCallback(
    (rawText: string) => {
      const cleanText = rawText.trim().slice(0, 140);
      if (!cleanText) return;

      const now = Date.now();
      const chatId = `chat-${now}-${Math.random().toString(36).slice(2, 6)}`;
      const localMsg: RoomChatMessageClient = {
        id: chatId,
        senderId: localPlayerIdRef.current,
        senderName: studentName || 'Siswa MTsN 14',
        senderClass: studentClass,
        senderRole: localRole,
        senderColor: avatarColor,
        text: cleanText,
        timestamp: now,
      };

      setLocalChatBubble({ text: cleanText, timestamp: now });
      setChatMessages((prev) => [...prev, localMsg].slice(-60));
      setChatInput('');
      soundEngine.playPickupData();

      cloudBridgeRef.current?.publish('chat:message', localMsg);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'chat:send',
            payload: {
              pin: activePin,
              senderId: localPlayerIdRef.current,
              senderName: studentName || 'Siswa MTsN 14',
              senderClass: studentClass,
              senderRole: localRole,
              senderColor: avatarColor,
              text: cleanText,
            },
          })
        );
      }

      fetch('/api/room/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: activePin,
          senderId: localPlayerIdRef.current,
          senderName: studentName || 'Siswa MTsN 14',
          senderClass: studentClass,
          senderRole: localRole,
          senderColor: avatarColor,
          text: cleanText,
        }),
      }).catch(() => {});
    },
    [activePin, studentName, studentClass, localRole, avatarColor]
  );

  // Send Real-Time Mutual-Consent Versus Invitation
  const handleSendVersusInvite = useCallback(
    (opponent: MapPlayerEntity) => {
      soundEngine.playDash();
      const isBot = Boolean(opponent.isRoamingPeer);
      const clientMatch: VersusMatchStateClient = {
        id: `vs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        pin: activePin,
        status: isBot ? 'IN_PROGRESS' : 'PENDING_CONSENT',
        challengerId: localPlayerIdRef.current,
        challengerName: studentName || 'Siswa MTsN 14',
        challengerClass: studentClass,
        opponentId: opponent.id,
        opponentName: opponent.name,
        opponentClass: opponent.studentClass,
        isBotOpponent: isBot,
        roundIdx: 0,
        questions: [
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
        ],
        challengerScore: 0,
        opponentScore: 0,
        challengerAnsweredRound: -1,
        opponentAnsweredRound: -1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      upsertVersusMatchState(clientMatch);
      setOpenVersusModalMatchId(clientMatch.id);
      cloudBridgeRef.current?.publish('versus:update', clientMatch);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'versus:invite',
            payload: {
              pin: activePin,
              challengerId: localPlayerIdRef.current,
              challengerName: studentName || 'Siswa MTsN 14',
              challengerClass: studentClass,
              opponentId: opponent.id,
            },
          })
        );
      }
      fetch('/api/versus/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: activePin,
          challengerId: localPlayerIdRef.current,
          challengerName: studentName || 'Siswa MTsN 14',
          challengerClass: studentClass,
          opponentId: opponent.id,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.match) {
            upsertVersusMatchState(data.match);
            setOpenVersusModalMatchId(data.match.id);
            cloudBridgeRef.current?.publish('versus:update', data.match);
          }
        })
        .catch(() => {});
    },
    [activePin, studentName, studentClass, upsertVersusMatchState]
  );

  const handleRespondVersusConsent = useCallback(
    (matchId: string, accept: boolean) => {
      setVersusMatches((prev) => {
        const next = prev.map((m) => {
          if (m.id !== matchId) return m;
          const updated: VersusMatchStateClient = {
            ...m,
            status: accept ? 'IN_PROGRESS' : 'DECLINED',
            updatedAt: Date.now(),
          };
          cloudBridgeRef.current?.publish('versus:update', updated);
          return updated;
        });
        return next;
      });
      if (accept) {
        setOpenVersusModalMatchId(matchId);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'versus:respond',
            payload: { matchId, accept },
          })
        );
      }
      fetch('/api/versus/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, accept }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.match) {
            upsertVersusMatchState(data.match);
            cloudBridgeRef.current?.publish('versus:update', data.match);
          }
        })
        .catch(() => {});
    },
    [upsertVersusMatchState]
  );

  const handleSubmitVersusRoundAnswer = useCallback(
    (matchId: string, roundIdx: number, selectedIndex: number, timeLeftSec: number) => {
      setVersusMatches((prev) =>
        prev.map((m) => {
          if (m.id !== matchId || m.status !== 'IN_PROGRESS') return m;
          const currentQ = m.questions[roundIdx] || m.questions[m.roundIdx];
          const isCorrect = currentQ && selectedIndex === currentQ.correctIndex;
          const gain = isCorrect ? 100 + Math.max(0, Math.min(10, timeLeftSec)) * 10 : 0;

          const updated: VersusMatchStateClient = { ...m, updatedAt: Date.now() };
          if (
            localPlayerIdRef.current === m.challengerId &&
            updated.challengerAnsweredRound < roundIdx
          ) {
            updated.challengerAnsweredRound = roundIdx;
            updated.challengerScore += gain;
          } else if (
            localPlayerIdRef.current === m.opponentId &&
            updated.opponentAnsweredRound < roundIdx
          ) {
            updated.opponentAnsweredRound = roundIdx;
            updated.opponentScore += gain;
          }
          if (updated.isBotOpponent && updated.opponentAnsweredRound < roundIdx) {
            updated.opponentAnsweredRound = roundIdx;
            updated.opponentScore += Math.random() < 0.65 ? 115 : 0;
          }
          if (
            updated.challengerAnsweredRound >= updated.roundIdx &&
            updated.opponentAnsweredRound >= updated.roundIdx
          ) {
            if (updated.roundIdx + 1 < updated.questions.length) {
              updated.roundIdx += 1;
            } else {
              updated.status = 'FINISHED';
            }
          }
          cloudBridgeRef.current?.publish('versus:update', updated);
          return updated;
        })
      );

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'versus:answer',
            payload: {
              matchId,
              playerId: localPlayerIdRef.current,
              roundIdx,
              selectedIndex,
              timeLeftSec,
            },
          })
        );
      }
      fetch('/api/versus/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          playerId: localPlayerIdRef.current,
          roundIdx,
          selectedIndex,
          timeLeftSec,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.match) {
            upsertVersusMatchState(data.match);
            cloudBridgeRef.current?.publish('versus:update', data.match);
          }
        })
        .catch(() => {});
    },
    [upsertVersusMatchState]
  );

  const handleCloseVersusMatch = useCallback(
    (matchId: string, _won?: boolean, mpEarned?: number, scoreEarned?: number) => {
      if (typeof mpEarned === 'number' && mpEarned > 0) {
        setMissionPoints((prev) => prev + mpEarned);
      }
      if (typeof scoreEarned === 'number' && scoreEarned > 0) {
        setLocalScore((prev) => prev + scoreEarned);
      }
      setDismissedMatchIds((prev) => {
        const next = new Set(prev);
        next.add(matchId);
        return next;
      });
      setOpenVersusModalMatchId((prev) => (prev === matchId ? null : prev));
    },
    []
  );

  const handleTeleportToPosition = (targetX: number, targetY: number) => {
    soundEngine.playDash();
    setCameraMode('FOLLOW_PLAYER');
    latestPosRef.current.x = targetX;
    latestPosRef.current.y = targetY;
    setTeleportCommand({
      x: targetX,
      y: targetY,
      seq: Date.now(),
    });
    persistRealtimeSnapshot(true, targetX, targetY);
  };

  const handleItemPickedUpToast = useCallback((itemName: string, mpGain: number) => {
    setPickupBanner({ itemName, mpGain });
    setTimeout(() => {
      setPickupBanner((prev) => (prev?.itemName === itemName ? null : prev));
    }, 3200);
  }, []);

  const handleSubmitTeacherAnswer = (event: PlayerAnswerEvent, missionPointCost: number) => {
    setMissionPoints((prev) => Math.max(0, prev - missionPointCost));
    setAnsweredQuestionIds((prev) => {
      const next = new Set(prev);
      next.add(event.questionId);
      return next;
    });
    setLocalScore((prev) => prev + event.pointsEarned);
    setSessionAnswers((prev) => [...prev, event]);

    cloudBridgeRef.current?.publish('teacher:answer', event);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'player:answer_teacher_question',
          payload: {
            playerId: localPlayerIdRef.current,
            answerEvent: event,
            missionPointCost,
          },
        })
      );
    }

    fetch('/api/room/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: localPlayerIdRef.current,
        answerEvent: event,
        missionPointCost,
      }),
    }).catch(() => {});
  };

  const handleFinishToAnalysis = () => {
    setRoomStatus('FINISHED');
    cloudBridgeRef.current?.publish('room:status', { status: 'FINISHED' });
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'room:finish_game', payload: {} }));
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

  // Active Versus Match for this student
  const activeMyVersusMatch = useMemo(() => {
    const myMatches = versusMatches
      .filter(
        (m) =>
          !dismissedMatchIds.has(m.id) &&
          (m.challengerId === localPlayerIdRef.current || m.opponentId === localPlayerIdRef.current)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);

    if (openVersusModalMatchId) {
      const explicit = myMatches.find((m) => m.id === openVersusModalMatchId);
      if (explicit) return explicit;
    }
    const inProgressOrPending = myMatches.find(
      (m) => m.status === 'IN_PROGRESS' || m.status === 'PENDING_CONSENT'
    );
    return inProgressOrPending || null;
  }, [versusMatches, dismissedMatchIds, openVersusModalMatchId]);

  // Incoming Consent Invitation Banner (when another student invites this student!)
  const incomingVersusInvite = useMemo(() => {
    return (
      versusMatches.find(
        (m) =>
          !dismissedMatchIds.has(m.id) &&
          m.status === 'PENDING_CONSENT' &&
          m.opponentId === localPlayerIdRef.current
      ) || null
    );
  }, [versusMatches, dismissedMatchIds]);

  // Keyboard shortcuts:
  // Tab (Toggle Camera), H (Toggle Collapsible Bottom Dock),
  // F (Interact with Teacher Post), V (Challenge Nearby Student to Mutual-Consent 1v1 Versus)
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
      } else if (e.code === 'KeyV' && nearbyVersusTarget && !activeMyVersusMatch) {
        e.preventDefault();
        handleSendVersusInvite(nearbyVersusTarget);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    joinedRoom,
    nearbyTeacherPost,
    nearbyVersusTarget,
    activeTeacherModalIndex,
    activeMyVersusMatch,
    handleSendVersusInvite,
  ]);

  const myPlayerRecord = classPlayers.find((p) => p.id === localPlayerIdRef.current);
  const displayedScore = Math.max(localScore, myPlayerRecord?.score || 0);
  const displayedMp = myPlayerRecord?.missionPoints ?? missionPoints;

  // Real online classmates in the same room (excluding self and training bots)
  const onlineClassmates = useMemo(
    () =>
      classPlayers.filter((p) => p.id !== localPlayerIdRef.current && !p.isRoamingPeer),
    [classPlayers]
  );

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden select-none bg-slate-950">
      {/* 1. 3D Kampus MTs Negeri 14 Jakarta Timur (Halim Perdanakusuma) Open-World Canvas */}
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
        teleportCommand={teleportCommand}
        localChatBubble={localChatBubble}
        onEmitLocalMove={handleEmitLocalMove}
        onNearbyTeacherPostChange={setNearbyTeacherPost}
        onNearbyVersusTargetChange={setNearbyVersusTarget}
        onItemPickedUpToast={handleItemPickedUpToast}
        onLocalHudSync={setLocalHud}
      />

      {/* ====================================================================
          2. PORTAL MASUK KAMPUS MTsN 14 HALIM & PEMILIHAN KARAKTER 3D
         ==================================================================== */}
      {!joinedRoom && (
        <div className="fixed inset-0 z-20 overflow-y-auto overscroll-contain touch-pan-y pointer-events-auto">
          <div className="min-h-full flex flex-col justify-between gap-3 p-2.5 sm:p-4 md:p-7 pb-10">
          {/* Top Bar: School Identity & Teacher Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
            <div className="text-[10px] sm:text-xs text-slate-200 font-semibold bg-slate-900/95 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-700 truncate max-w-full">
              MTsN 14 Jakarta Timur (Halim PK) · Azhary Mardhani, S.Kom
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-100 bg-slate-900/95 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>Materi & Soal ({questions.length})</span>
              </button>

              <button
                onClick={() => setIsAnalysisPreviewOpen(true)}
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-100 bg-slate-900/95 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analisis Soal</span>
              </button>

              <button
                onClick={() => setIsMuted(soundEngine.toggleMute())}
                aria-label="Toggle Suara"
                className="p-1.5 sm:p-2 text-slate-200 bg-slate-900/95 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
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
          <div className="my-auto mx-auto w-full max-w-3xl flex flex-col items-center text-center pointer-events-auto space-y-2 sm:space-y-3 py-1.5 sm:py-2">
            <svg
              viewBox="0 0 740 104"
              className="w-full max-w-[320px] sm:max-w-xl h-auto drop-shadow"
              role="img"
              aria-label="MTs Negeri 14 Jakarta Timur Halim 3D Open World Title Lockup"
            >
              <defs>
                <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <polygon
                points="40,16 70,6 100,16 100,54 70,70 40,54"
                fill="rgba(16, 185, 129, 0.22)"
                stroke="#10b981"
                strokeWidth="2.5"
              />
              <text
                x="70"
                y="45"
                textAnchor="middle"
                fill="#10b981"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
                fontSize="18"
              >
                3D
              </text>

              <polygon
                points="640,16 670,6 700,16 700,54 670,70 640,54"
                fill="rgba(245, 158, 11, 0.22)"
                stroke="#fbbf24"
                strokeWidth="2.5"
              />
              <text
                x="670"
                y="44"
                textAnchor="middle"
                fill="#fbbf24"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
                fontSize="18"
              >
                14
              </text>

              <text
                x="370"
                y="46"
                textAnchor="middle"
                fill="url(#cyberGrad)"
                fontFamily="Outfit, sans-serif"
                fontWeight="800"
                fontSize="36"
                letterSpacing="2.5"
              >
                MTs NEGERI 14 JAKARTA · HALIM
              </text>
              <line
                x1="120"
                y1="62"
                x2="620"
                y2="62"
                stroke="rgba(16, 185, 129, 0.45)"
                strokeWidth="1.5"
              />
              <text
                x="370"
                y="84"
                textAnchor="middle"
                fill="#e2e8f0"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="600"
                fontSize="11.5"
                letterSpacing="1.2"
              >
                OPEN-WORLD ROBLOX 3D · GURU INFORMATIKA: AZHARY MARDHANI, S.KOM
              </text>
            </svg>

            <div className="w-full p-4 sm:p-6 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl text-left space-y-4">
              {/* Banner Lanjutkan Sesi Terakhir jika ada progres tersimpan */}
              {studentName && (localScore > 0 || answeredQuestionIds.size > 0 || collectedItemsCount > 0) && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/70 rounded-xl flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="text-xs text-slate-200">
                      <div className="font-bold text-emerald-300">
                        Sesi Realtime Tersimpan Ditemukan ({studentName} · {studentClass})
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono">
                        Room: {activePin} · Skor: ${localScore} · MP: {missionPoints} · Soal:{' '}
                        {answeredQuestionIds.size}/{activeQuestions.length}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setJoinedRoom(true);
                        setResumedSessionToast(true);
                      }}
                      className="px-3.5 py-2 text-xs font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Lanjutkan Sesi Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSavedSession}
                      title="Mulai Baru / Ganti Siswa"
                      className="p-2 text-slate-300 hover:text-rose-400 bg-slate-900 border border-slate-700 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEntryTab('STUDENT');
                    setAuthError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    entryTab === 'STUDENT'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Siswa (Pilih Karakter 3D)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryTab('TEACHER');
                    setAuthError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    entryTab === 'TEACHER'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Guru (Azhary Mardhani, S.Kom)</span>
                </button>
              </div>

              {entryTab === 'STUDENT' ? (
                <form onSubmit={handleStudentJoinRoom} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-amber-400 mb-1">
                        Kode Room Kelas
                      </label>
                      <input
                        type="text"
                        required
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(normalizePin(e.target.value))}
                        placeholder="MTN14"
                        className="w-full px-3 py-2 text-base font-mono font-bold tracking-widest uppercase bg-slate-950 border border-amber-600/80 rounded-xl text-amber-300 focus:outline-none focus:border-amber-400 text-center"
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
                        placeholder="Ketik nama lengkapmu..."
                        className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Kelas MTsN 14
                      </label>
                      <select
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
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

                  {/* 3D Character Preset Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        Pilih Karakter 3D Kamu (Kumpul di Lapangan Upacara MTsN 14 Halim):
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
                            {r.pin} ({r.studentCount} Siswa)
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
                            className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                              isSelected
                                ? 'bg-emerald-950/70 border-emerald-400 ring-1 ring-emerald-400'
                                : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div
                              className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono text-[10px] font-extrabold text-white border border-white/20"
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>
                        <strong>Chat & Open-World:</strong> Chat muncul di atas kepala karakter 3D!
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Swords className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>
                        <strong>Duel Persetujuan:</strong> Ajak teman duel 1v1 secara realtime (+100 MP)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>Pos Guru:</strong> Temui Pak Azhary di 6 gedung sekolah [F]
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
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 sm:px-6 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    <span>Masuk ke Open-World 3D MTsN 14 Halim ({roomCodeInput || 'MTN14'})</span>
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
                          onChange={(e) => setTeacherRoomCode(normalizePin(e.target.value))}
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
                    memantau seluruh siswa di lingkungan 3D <strong>MTs Negeri 14 Halim</strong>,
                    berkomunikasi lewat Chat Kelas, serta meninjau <strong>Analisis Butir Soal</strong>{' '}
                    secara real-time.
                  </p>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 sm:px-6 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Buka Kampus 3D MTsN 14 Halim & Pantau Siswa ({teacherRoomCode || 'MTN14'})</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="text-center text-xs font-mono text-slate-300 pointer-events-none pt-1">
            Open-World Roblox 3D · Chat Bubble Realtime · Duel Versus Persetujuan 2 Pihak
          </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          3. ADAPTIVE HUD KAMPUS MTsN 14 HALIM (HANDPHONE vs TABLET/DESKTOP)
         ==================================================================== */}
      {joinedRoom && (
        <>
          {/* Toast Pemulihan Sesi Otomatis */}
          {resumedSessionToast && (
            <div className="fixed top-14 sm:top-20 left-1/2 -translate-x-1/2 z-30 w-[92vw] max-w-lg pointer-events-none">
              <div className="px-3.5 py-2 bg-slate-900/95 border-2 border-emerald-400 rounded-xl shadow-2xl flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-[11px] sm:text-xs font-bold text-slate-100 leading-tight">
                  SESI DILANJUTKAN:{' '}
                  <span className="text-emerald-300">
                    Posisi MTsN 14 Halim, {displayedMp} MP & Soal ({answeredQuestionIds.size}/
                    {activeQuestions.length}) dipulihkan!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* REAL-TIME INCOMING VERSUS DUEL CONSENT BANNER (Appears when a classmate invites you!) */}
          {incomingVersusInvite && openVersusModalMatchId !== incomingVersusInvite.id && (
            <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-lg pointer-events-auto">
              <div className="p-3 sm:p-4 bg-slate-900/98 border-2 border-rose-500 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold text-rose-400 uppercase">
                      TANTANGAN DUEL VERSUS 1V1 MASUK!
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-100 truncate">
                      {incomingVersusInvite.challengerName} ({incomingVersusInvite.challengerClass})
                      mengajak duel!
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      soundEngine.playDash();
                      handleRespondVersusConsent(incomingVersusInvite.id, true);
                      setOpenVersusModalMatchId(incomingVersusInvite.id);
                    }}
                    className="px-3.5 py-2 text-xs font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg transition-colors"
                  >
                    ✓ Terima Duel
                  </button>
                  <button
                    onClick={() => {
                      handleRespondVersusConsent(incomingVersusInvite.id, false);
                      handleCloseVersusMatch(incomingVersusInvite.id);
                    }}
                    className="px-3 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-rose-900 border border-slate-700 rounded-xl transition-colors"
                  >
                    ✕ Tolak
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3A. COMPACT MOBILE TOP HUD BAR (Handphone <768px) */}
          <div className="fixed top-2 left-2 right-2 z-20 md:hidden pointer-events-none flex flex-col gap-1.5">
            <div className="bg-slate-900/95 border border-slate-700/90 rounded-xl px-2 py-1.5 shadow-xl pointer-events-auto flex items-center justify-between gap-1">
              {/* Left: Room PIN, Online Students Drawer Toggle, & Chat Button */}
              <div className="flex items-center gap-1 min-w-0">
                <button
                  onClick={handleCopyRoomPin}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-amber-500/60 text-[10px] font-mono font-extrabold text-amber-400 shrink-0"
                >
                  {activePin}
                </button>
                <button
                  onClick={() => setIsMobilePeersOpen((prev) => !prev)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/90 border border-emerald-600/70 text-[10px] font-bold text-emerald-300 shrink-0"
                >
                  <Users className="w-3 h-3" />
                  <span>{onlineClassmates.length + 1}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsChatOpen((prev) => !prev)}
                  className="relative flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-950/90 border border-sky-500/70 text-[10px] font-bold text-sky-300 shrink-0"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Chat</span>
                  {unreadChatCount > 0 && (
                    <span className="px-1 rounded-full bg-rose-500 text-white text-[9px] font-mono font-extrabold">
                      {unreadChatCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Right: Compact Score, MP & Question Counter */}
              <div className="flex items-center gap-1 font-mono tabular-nums text-[10px] shrink-0">
                <span className="font-extrabold text-emerald-400">${displayedScore}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                  {displayedMp}MP
                </span>
                <span className="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-700 text-sky-300 font-bold">
                  {answeredQuestionIds.size}/{activeQuestions.length}
                </span>
              </div>
            </div>

            {/* Expandable Mobile Classmates Teleport & Versus Invite Drawer */}
            {isMobilePeersOpen && (
              <div className="bg-slate-900/95 border border-emerald-500/80 rounded-xl p-2.5 shadow-2xl pointer-events-auto space-y-1.5 mr-24">
                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-bold">
                  <span>TEMAN SEKELAS ONLINE ({onlineClassmates.length}):</span>
                  <button
                    onClick={() => {
                      handleTeleportToPosition(1200, 780);
                      setIsMobilePeersOpen(false);
                    }}
                    className="px-2 py-0.5 rounded bg-sky-900 text-sky-200 text-[10px]"
                  >
                    Ke Lapangan Upacara
                  </button>
                </div>
                {onlineClassmates.length > 0 ? (
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                    {onlineClassmates.map((peer) => (
                      <div
                        key={peer.id}
                        className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg"
                      >
                        <div className="text-[11px] font-bold text-slate-100 truncate">
                          {peer.name}{' '}
                          <span className="text-[10px] text-slate-400">({peer.studentClass})</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              handleTeleportToPosition(peer.x + 28, peer.y + 18);
                              setIsMobilePeersOpen(false);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-600/70 rounded"
                          >
                            Hampiri
                          </button>
                          <button
                            onClick={() => {
                              handleSendVersusInvite(peer);
                              setIsMobilePeersOpen(false);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-rose-600 rounded"
                          >
                            ⚔️ Duel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-300">
                    Ajak teman sekelas masuk dengan Kode Room <strong>{activePin}</strong> untuk
                    bertemu & Duel Versus 1v1!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3B. DESKTOP / TABLET TOP-LEFT & TOP-RIGHT HUD (Hidden on Handphone <768px) */}
          <div className="hidden md:block fixed top-4 left-4 z-20 max-w-md pointer-events-none">
            <div className="bg-slate-900/95 border border-slate-700/90 rounded-2xl px-4 py-3 shadow-2xl pointer-events-auto space-y-2">
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

                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 tabular-nums">
                    <Users className="w-3.5 h-3.5" />
                    {onlineClassmates.length + 1} Siswa Online
                  </span>
                  <button
                    onClick={() => handleTeleportToPosition(1200, 780)}
                    title="Kumpul di Lapangan Upacara MTsN 14 Halim"
                    className="px-2 py-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-600/60 rounded transition-colors"
                  >
                    Lap. Upacara
                  </button>
                  <button
                    onClick={() => setIsChatOpen((prev) => !prev)}
                    className="relative flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-sky-300 bg-sky-950 hover:bg-sky-900 border border-sky-500/70 rounded transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat Kelas</span>
                    {unreadChatCount > 0 && (
                      <span className="px-1 rounded-full bg-rose-500 text-white text-[9px] font-mono">
                        {unreadChatCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {onlineClassmates.length > 0 ? (
                <div className="pt-1 border-t border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                    TEMAN SEKELAS ONLINE DI ARENA (HAMPIRI / AJAK DUEL REALTIME):
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {onlineClassmates.map((peer) => (
                      <div
                        key={peer.id}
                        className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1"
                      >
                        <span className="text-[11px] font-bold text-slate-100 truncate max-w-[110px]">
                          {peer.name}
                        </span>
                        <button
                          onClick={() => handleTeleportToPosition(peer.x + 28, peer.y + 18)}
                          className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950 hover:bg-emerald-800 border border-emerald-600/60 rounded"
                          title={`Teleport ke sebelah ${peer.name}`}
                        >
                          <Navigation className="w-2.5 h-2.5 inline mr-0.5" />
                          Hampiri
                        </button>
                        <button
                          onClick={() => handleSendVersusInvite(peer)}
                          className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-white bg-rose-600 hover:bg-rose-500 rounded"
                          title={`Kirim undangan Duel 1v1 ke ${peer.name}`}
                        >
                          ⚔️ Duel
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-300 leading-snug pt-0.5 border-t border-slate-800">
                  Arena Open-World <strong>MTsN 14 Halim</strong>. Semua siswa otomatis bertemu,
                  mengobrol lewat Chat Bubble 3D, dan Duel Versus secara persetujuan 2 pihak!
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block fixed top-4 right-4 z-20 pointer-events-none">
            <div className="bg-slate-900/95 border-2 border-slate-700 rounded-2xl px-5 py-3 shadow-2xl text-right space-y-1 font-mono tabular-nums pointer-events-auto">
              <div className="flex items-center justify-end gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-[10px] font-bold text-emerald-300">
                  ● AUTO-SAVE {lastAutoSaveTime}
                </span>
                <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
                  {studentName || 'Siswa'} · {studentClass}
                </span>
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
                Barang: <strong className="text-slate-200">{collectedItemsCount}</strong> · Lokasi
                MTsN 14 Halim: ({Math.round(localHud.x)}, {Math.round(localHud.y)})
              </div>
            </div>
          </div>

          {/* 3C. ROBLOX-STYLE OPEN-WORLD REAL-TIME CHAT WINDOW (Collapsible, works on Handphone & Desktop) */}
          {isChatOpen && (
            <div className="fixed top-14 md:top-40 left-2 md:left-4 z-30 w-[92vw] max-w-sm bg-slate-900/95 border-2 border-sky-500/80 rounded-2xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-extrabold text-slate-100">
                    CHAT OPEN-WORLD MTsN 14 HALIM
                  </span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Message Feed */}
              <div className="p-3 space-y-2 max-h-44 sm:max-h-56 overflow-y-auto text-xs bg-slate-950/60">
                {chatMessages.map((msg) => {
                  const isMe = msg.senderId === localPlayerIdRef.current;
                  return (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-xl border ${
                        msg.senderRole === 'TEACHER'
                          ? 'bg-amber-950/50 border-amber-500/60'
                          : isMe
                          ? 'bg-sky-950/60 border-sky-600/60'
                          : 'bg-slate-900/90 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span
                          className="font-extrabold text-[11px] truncate"
                          style={{
                            color:
                              msg.senderRole === 'TEACHER'
                                ? '#fbbf24'
                                : isMe
                                ? '#38bdf8'
                                : '#34d399',
                          }}
                        >
                          {msg.senderName} ({msg.senderClass})
                        </span>
                      </div>
                      <p className="text-slate-100 text-xs break-words leading-snug">{msg.text}</p>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* 1-Tap Quick Chat Pills for Fast Mobile Communication */}
              <div className="px-2.5 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                {QUICK_CHAT_PHRASES.map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => handleSendChatMessage(phrase)}
                    className="px-2 py-1 text-[10px] font-semibold text-sky-200 bg-slate-900 hover:bg-sky-900 border border-slate-700 rounded-lg whitespace-nowrap shrink-0"
                  >
                    {phrase}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage(chatInput);
                }}
                className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ketik pesan (muncul di atas karakter 3D)..."
                  maxLength={140}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </form>
            </div>
          )}

          {/* Item Pickup Notification Toast */}
          {pickupBanner && (
            <div className="fixed top-28 sm:top-36 left-1/2 -translate-x-1/2 z-30 w-[90vw] max-w-md pointer-events-none">
              <div className="px-3.5 py-2 bg-slate-900/95 border-2 border-emerald-400 rounded-xl shadow-2xl flex items-center justify-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-[11px] sm:text-xs font-bold text-slate-100 truncate">
                  DITEMUKAN: <span className="text-emerald-300">{pickupBanner.itemName}</span>{' '}
                  <span className="font-mono text-amber-300">(+{pickupBanner.mpGain} MP)</span>
                </div>
              </div>
            </div>
          )}

          {/* Proximity Action Prompts */}
          <div className="fixed bottom-44 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 w-[92vw] max-w-lg px-2 pointer-events-none">
            {nearbyTeacherPost && (
              <div className="w-full p-2.5 sm:p-4 bg-slate-900/95 border-2 border-amber-400 rounded-xl sm:rounded-2xl shadow-2xl flex items-center justify-between gap-2.5 pointer-events-auto">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold text-amber-400 uppercase truncate">
                      {nearbyTeacherPost.buildingName}
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-100 truncate">
                      {nearbyTeacherPost.title}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playDash();
                    setActiveTeacherModalIndex(nearbyTeacherPost.index);
                  }}
                  className="px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg sm:rounded-xl shadow-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Jawab Soal [F]
                </button>
              </div>
            )}

            {nearbyVersusTarget && (
              <div className="w-full p-2.5 sm:p-4 bg-slate-900/95 border-2 border-rose-500 rounded-xl sm:rounded-2xl shadow-2xl flex items-center justify-between gap-2.5 pointer-events-auto">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 shrink-0">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold text-rose-400 uppercase truncate">
                      {nearbyVersusTarget.isRoamingPeer
                        ? 'BOT LATIHAN · DUEL 1V1'
                        : 'TEMAN SEKELAS · UNDANG DUEL PERSETUJUAN 1V1'}
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-100 truncate">
                      {nearbyVersusTarget.name} ({nearbyVersusTarget.studentClass})
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSendVersusInvite(nearbyVersusTarget)}
                  className="px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-500 rounded-lg sm:rounded-xl shadow-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Ajak Duel [V]
                </button>
              </div>
            )}
          </div>

          {/* Unified Collapsible Bottom Control Dock */}
          <div className="fixed bottom-1.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 w-[96vw] sm:w-full max-w-[min(860px,94vw)] pointer-events-none flex flex-col items-center">
            <button
              onClick={() => setIsDockCollapsed((prev) => !prev)}
              className="pointer-events-auto flex items-center gap-1 px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-slate-300 bg-slate-900/95 hover:bg-slate-800 border border-b-0 border-slate-700 rounded-t-lg sm:rounded-t-xl transition-colors whitespace-nowrap shrink-0"
            >
              {isDockCollapsed ? (
                <>
                  <ChevronUp className="w-3 h-3 text-sky-400" />
                  <span>Menu Misi (H)</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 text-sky-400" />
                  <span>Tutup Menu (H)</span>
                </>
              )}
            </button>

            {!isDockCollapsed && (
              <div className="pointer-events-auto w-full bg-slate-900/95 border border-slate-700/90 rounded-xl sm:rounded-2xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 shadow-2xl flex items-center justify-between gap-1.5 sm:gap-2.5 overflow-x-auto">
                {/* Left Quick Mission & Chat Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setActiveTeacherModalIndex(0)}
                    className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg sm:rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>
                      Soal ({answeredQuestionIds.size}/{activeQuestions.length})
                    </span>
                  </button>

                  <button
                    onClick={() => setIsChatOpen((prev) => !prev)}
                    className="relative flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg sm:rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                    {unreadChatCount > 0 && (
                      <span className="px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                        {unreadChatCount}
                      </span>
                    )}
                  </button>

                  {nearbyVersusTarget && (
                    <button
                      onClick={() => handleSendVersusInvite(nearbyVersusTarget)}
                      className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg sm:rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span className="max-w-[90px] sm:max-w-none truncate">
                        Ajak Duel {nearbyVersusTarget.name}
                      </span>
                    </button>
                  )}
                </div>

                {/* Right Utility Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() =>
                      setCameraMode((prev) =>
                        prev === 'FOLLOW_PLAYER' ? 'FULL_MAP' : 'FOLLOW_PLAYER'
                      )
                    }
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg sm:rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    {cameraMode === 'FULL_MAP' ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                        <span className="hidden sm:inline">Kamera</span> 3D
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Kamera</span> Peta
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsMaterialModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg sm:rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    <span>Materi</span>
                  </button>

                  <button
                    onClick={handleFinishToAnalysis}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-100 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 rounded-lg sm:rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Analisis</span>
                  </button>

                  <button
                    onClick={() => setIsMuted(soundEngine.toggleMute())}
                    title="Suara / Bisu"
                    className="p-1.5 sm:p-2 text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg sm:rounded-xl transition-colors shrink-0"
                  >
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      persistRealtimeSnapshot(false, latestPosRef.current.x, latestPosRef.current.y);
                      setJoinedRoom(false);
                    }}
                    title="Ke Portal (Progres Tersimpan)"
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg sm:rounded-xl transition-colors shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ====================================================================
          4. DUEL VERSUS ANTAR SISWA MODAL (REAL-TIME MUTUAL CONSENT 1V1)
         ==================================================================== */}
      <VersusDuelModal
        activeMatch={activeMyVersusMatch}
        localPlayerId={localPlayerIdRef.current}
        localPlayerName={studentName || 'Siswa MTsN 14'}
        onRespondConsent={handleRespondVersusConsent}
        onSubmitRoundAnswer={handleSubmitVersusRoundAnswer}
        onCloseMatch={handleCloseVersusMatch}
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
