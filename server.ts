import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import {
  INITIAL_MATERIALS,
  INITIAL_QUESTIONS,
  InformaticsMaterial,
  InformaticsQuestion,
  OptionKey,
  PlayerAnswerEvent,
} from './src/data/informaticsData.ts';

export interface ClassMapPlayer {
  id: string;
  name: string;
  studentClass: string;
  role: 'TEACHER' | 'STUDENT';
  characterPreset: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingAngle: number;
  jumpY: number;
  score: number;
  missionPoints: number;
  collectedItemsCount: number;
  answeredCount: number;
  answeredQuestionIds: string[];
  streak: number;
  hp: number;
  currentSector: OptionKey | null;
  lockedOption: OptionKey | null;
  lockTimeMs: number | null;
  lastChatText?: string;
  lastChatTime?: number;
  lastUpdated: number;
  isRoamingPeer?: boolean;
}

export interface RoomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderClass: string;
  senderRole: 'TEACHER' | 'STUDENT';
  senderColor: string;
  text: string;
  timestamp: number;
}

export interface VersusQuestionItem {
  prompt: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

export interface VersusMatchState {
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
  questions: VersusQuestionItem[];
  challengerScore: number;
  opponentScore: number;
  challengerAnsweredRound: number;
  opponentAnsweredRound: number;
  createdAt: number;
  updatedAt: number;
}

export interface ClassroomRoom {
  pin: string;
  roomName: string;
  teacherName: string;
  hostId: string;
  status: 'LOBBY' | 'PLAYING' | 'ROUND_RESULT' | 'FINISHED';
  categoryFilter: string;
  currentQuestionIndex: number;
  questionStartTime: number;
  timeLeftSec: number;
  players: Map<string, ClassMapPlayer>;
  answers: PlayerAnswerEvent[];
  activeQuestionIds: string[];
  chatMessages: RoomChatMessage[];
  versusMatches: Map<string, VersusMatchState>;
}

export const MAP_WIDTH = 2400;
export const MAP_HEIGHT = 1500;
export const SPAWN_CENTER_X = 1200;
export const SPAWN_CENTER_Y = 780;

const STATE_FILE_PATH = path.join(process.cwd(), '.mtsn14_halim_state.json');

const VERSUS_CHALLENGE_POOL: VersusQuestionItem[] = [
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
  {
    prompt: 'Perangkat jaringan yang menghubungkan dua jaringan berbeda segmen IP adalah...',
    options: ['Repeater', 'Hub', 'Router', 'Kabel UTP'],
    correctIndex: 2,
    topic: 'Jaringan Komputer',
  },
  {
    prompt: 'Bilangan desimal 7 jika diubah ke biner 4-bit menjadi...',
    options: ['0101', '0111', '1001', '1110'],
    correctIndex: 1,
    topic: 'Sistem Bilangan Biner',
  },
];

function pickVersusQuestions(): VersusQuestionItem[] {
  return [...VERSUS_CHALLENGE_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
}

let materialsStore: InformaticsMaterial[] = [...INITIAL_MATERIALS];
let questionsStore: InformaticsQuestion[] = [...INITIAL_QUESTIONS];
let globalAnswerHistory: PlayerAnswerEvent[] = [];
const rooms = new Map<string, ClassroomRoom>();

export function normalizeRoomPin(raw: unknown): string {
  const cleaned = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return cleaned || 'MTN14';
}

// Seed 2 clearly labeled training bots so solo practice is always available, while real students are front and center
const ROAMING_PEERS_TEMPLATE: Array<{
  id: string;
  name: string;
  studentClass: string;
  characterPreset: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}> = [
  {
    id: 'peer-aldo',
    name: '[BOT] Aldo Latihan',
    studentClass: 'Bot Kelas 8A',
    characterPreset: 'bima_rider',
    color: '#f59e0b',
    x: 880,
    y: 590,
    vx: 48,
    vy: 26,
  },
  {
    id: 'peer-nabila',
    name: '[BOT] Nabila Latihan',
    studentClass: 'Bot Kelas 8B',
    characterPreset: 'nadia_tech',
    color: '#0ea5e9',
    x: 1520,
    y: 930,
    vx: -46,
    vy: -28,
  },
];

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function schedulePersistStateToDisk() {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    try {
      const serializedRooms = Array.from(rooms.values()).map((r) => ({
        pin: r.pin,
        roomName: r.roomName,
        teacherName: r.teacherName,
        hostId: r.hostId,
        status: r.status,
        categoryFilter: r.categoryFilter,
        currentQuestionIndex: r.currentQuestionIndex,
        questionStartTime: r.questionStartTime,
        timeLeftSec: r.timeLeftSec,
        players: Array.from(r.players.values()),
        answers: r.answers,
        activeQuestionIds: r.activeQuestionIds,
        chatMessages: r.chatMessages.slice(-60),
      }));
      const payload = {
        savedAt: Date.now(),
        materials: materialsStore,
        questions: questionsStore,
        globalAnswerHistory: globalAnswerHistory.slice(-500),
        rooms: serializedRooms,
      };
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(payload), 'utf-8');
    } catch {
      // Ignore write error on read-only fs
    }
  }, 1000);
}

function loadPersistedStateFromDisk() {
  try {
    if (!fs.existsSync(STATE_FILE_PATH)) return;
    const raw = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.materials) && parsed.materials.length > 0) {
      materialsStore = parsed.materials;
    }
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      questionsStore = parsed.questions;
    }
    if (Array.isArray(parsed.globalAnswerHistory)) {
      globalAnswerHistory = parsed.globalAnswerHistory;
    }
    if (Array.isArray(parsed.rooms)) {
      for (const r of parsed.rooms) {
        const pMap = new Map<string, ClassMapPlayer>();
        if (Array.isArray(r.players)) {
          for (const p of r.players) {
            // Skip legacy 4 NPCs if we updated the template
            if (p.isRoamingPeer && !ROAMING_PEERS_TEMPLATE.some((t) => t.id === p.id)) {
              continue;
            }
            pMap.set(p.id, {
              ...p,
              facingAngle: typeof p.facingAngle === 'number' ? p.facingAngle : Math.PI,
              jumpY: typeof p.jumpY === 'number' ? p.jumpY : 0,
              answeredQuestionIds: Array.isArray(p.answeredQuestionIds)
                ? p.answeredQuestionIds
                : [],
            });
          }
        }
        rooms.set(r.pin, {
          pin: r.pin,
          roomName: r.roomName || `Kampus MTsN 14 Halim (${r.pin})`,
          teacherName: r.teacherName || 'Azhary Mardhani, S.Kom',
          hostId: r.hostId || 'teacher-default',
          status: r.status || 'PLAYING',
          categoryFilter: r.categoryFilter || 'Semua Materi',
          currentQuestionIndex: r.currentQuestionIndex || 0,
          questionStartTime: r.questionStartTime || Date.now(),
          timeLeftSec: r.timeLeftSec || 60,
          players: pMap,
          answers: Array.isArray(r.answers) ? r.answers : [],
          activeQuestionIds: Array.isArray(r.activeQuestionIds)
            ? r.activeQuestionIds
            : questionsStore.map((q) => q.id),
          chatMessages: Array.isArray(r.chatMessages) ? r.chatMessages.slice(-60) : [],
          versusMatches: new Map(),
        });
      }
    }
  } catch {
    // Ignore corrupted state file
  }
}

function computeSpawnPosition(room: ClassroomRoom, playerId: string): { x: number; y: number } {
  const existing = room.players.get(playerId);
  if (existing && !existing.isRoamingPeer) {
    return { x: existing.x, y: existing.y };
  }
  const humanPlayers = Array.from(room.players.values()).filter((p) => !p.isRoamingPeer);
  const idx = humanPlayers.length;
  const angle = (idx * 72 * Math.PI) / 180;
  const radius = idx === 0 ? 0 : 48 + Math.floor(idx / 5) * 32;
  const spawnX = Math.round(SPAWN_CENTER_X + Math.cos(angle) * radius);
  const spawnY = Math.round(SPAWN_CENTER_Y + Math.sin(angle) * radius);
  return { x: spawnX, y: spawnY };
}

function getOrCreateRoom(
  rawPin: string,
  roomName?: string,
  teacherName?: string,
  hostId = 'teacher-default',
  categoryFilter = 'Semua Materi'
): ClassroomRoom {
  const pin = normalizeRoomPin(rawPin);
  let room = rooms.get(pin);
  if (!room) {
    const playersMap = new Map<string, ClassMapPlayer>();
    for (const peer of ROAMING_PEERS_TEMPLATE) {
      playersMap.set(peer.id, {
        id: peer.id,
        name: peer.name,
        studentClass: peer.studentClass,
        role: 'STUDENT',
        characterPreset: peer.characterPreset,
        color: peer.color,
        x: peer.x,
        y: peer.y,
        vx: peer.vx,
        vy: peer.vy,
        facingAngle: Math.atan2(peer.vx, peer.vy),
        jumpY: 0,
        score: 150,
        missionPoints: 100,
        collectedItemsCount: 2,
        answeredCount: 1,
        answeredQuestionIds: [],
        streak: 1,
        hp: 100,
        currentSector: null,
        lockedOption: null,
        lockTimeMs: null,
        lastUpdated: Date.now(),
        isRoamingPeer: true,
      });
    }

    room = {
      pin,
      roomName: roomName || `Kampus MTsN 14 Halim Jakarta Timur (${pin})`,
      teacherName: teacherName || 'Azhary Mardhani, S.Kom',
      hostId,
      status: 'PLAYING',
      categoryFilter,
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      timeLeftSec: 60,
      players: playersMap,
      answers: [],
      activeQuestionIds: questionsStore.map((q) => q.id),
      chatMessages: [
        {
          id: 'welcome-msg',
          senderId: 'teacher-system',
          senderName: 'Pak Azhary Mardhani, S.Kom',
          senderClass: 'Guru Informatika',
          senderRole: 'TEACHER',
          senderColor: '#f59e0b',
          text: 'Selamat datang di Open-World 3D MTsN 14 Halim! Silakan berjalan, sapa teman lewat Chat, dan ajak Versus 1v1!',
          timestamp: Date.now(),
        },
      ],
      versusMatches: new Map(),
    };
    rooms.set(pin, room);
    schedulePersistStateToDisk();
  }
  return room;
}

loadPersistedStateFromDisk();
getOrCreateRoom('MTN14', 'Kampus MTsN 14 Halim Jakarta Timur', 'Azhary Mardhani, S.Kom');

function getFilteredQuestions(categoryFilter: string): InformaticsQuestion[] {
  if (!categoryFilter || categoryFilter === 'Semua Materi') return questionsStore;
  const filtered = questionsStore.filter((q) => q.category === categoryFilter);
  return filtered.length > 0 ? filtered : questionsStore;
}

function getSharedVersusMatches(): VersusMatchState[] {
  const now = Date.now();
  const list: VersusMatchState[] = [];
  for (const r of rooms.values()) {
    for (const [mId, match] of r.versusMatches.entries()) {
      // Clean up old matches after 90 seconds
      if (now - match.updatedAt > 90000) {
        r.versusMatches.delete(mId);
        continue;
      }
      list.push(match);
    }
  }
  return list;
}

function serializeRoom(room: ClassroomRoom) {
  const qs = getFilteredQuestions(room.categoryFilter);
  const now = Date.now();
  // Merge all active human players across the shared MTsN 14 Halim arena so every student on any device meets in the same map
  const mergedPlayersMap = new Map<string, ClassMapPlayer>();
  for (const p of room.players.values()) {
    if (p.isRoamingPeer || now - p.lastUpdated < 1000 * 60 * 60 * 2) {
      mergedPlayersMap.set(p.id, p);
    }
  }
  for (const otherRoom of rooms.values()) {
    for (const p of otherRoom.players.values()) {
      if (!p.isRoamingPeer && now - p.lastUpdated < 1000 * 60 * 60 * 2) {
        const currentInMerged = mergedPlayersMap.get(p.id);
        if (!currentInMerged || p.lastUpdated >= currentInMerged.lastUpdated) {
          mergedPlayersMap.set(p.id, p);
        }
      }
    }
  }

  // Merge recent chat messages across shared arena
  const allChatMap = new Map<string, RoomChatMessage>();
  for (const otherRoom of rooms.values()) {
    for (const msg of otherRoom.chatMessages) {
      allChatMap.set(msg.id, msg);
    }
  }
  const mergedChats = Array.from(allChatMap.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-50);

  return {
    pin: room.pin,
    roomName: room.roomName,
    teacherName: room.teacherName,
    hostId: room.hostId,
    status: room.status,
    categoryFilter: room.categoryFilter,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: qs.length,
    timeLeftSec: room.timeLeftSec,
    players: Array.from(mergedPlayersMap.values()),
    answers: room.answers,
    chatMessages: mergedChats,
    versusMatches: getSharedVersusMatches(),
  };
}

function findPlayerAcrossRooms(playerId: string): ClassMapPlayer | undefined {
  for (const r of rooms.values()) {
    const p = r.players.get(playerId);
    if (p) return p;
  }
  return undefined;
}

function upsertPlayerInRoom(
  room: ClassroomRoom,
  payload: {
    playerId: string;
    playerName?: string;
    studentClass?: string;
    role?: 'TEACHER' | 'STUDENT';
    characterPreset?: string;
    color?: string;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    facingAngle?: number;
    jumpY?: number;
    score?: number;
    missionPoints?: number;
    collectedItemsCount?: number;
    answeredQuestionIds?: string[];
  }
): ClassMapPlayer {
  let existing = room.players.get(payload.playerId);

  if (!existing && payload.playerName) {
    const cleanName = payload.playerName.trim().toLowerCase();
    for (const candidate of room.players.values()) {
      if (
        !candidate.isRoamingPeer &&
        candidate.name.trim().toLowerCase() === cleanName &&
        (!payload.studentClass || candidate.studentClass === payload.studentClass)
      ) {
        existing = candidate;
        if (existing.id !== payload.playerId) {
          room.players.delete(existing.id);
        }
        break;
      }
    }
  }

  const spawn = computeSpawnPosition(room, payload.playerId);

  const mergedAnsweredIds = Array.from(
    new Set([
      ...(existing?.answeredQuestionIds || []),
      ...(Array.isArray(payload.answeredQuestionIds) ? payload.answeredQuestionIds : []),
    ])
  );

  const updated: ClassMapPlayer = {
    id: payload.playerId,
    name: payload.playerName || existing?.name || 'Siswa MTsN 14',
    studentClass: payload.studentClass || existing?.studentClass || 'Kelas 8A',
    role: payload.role || existing?.role || 'STUDENT',
    characterPreset: payload.characterPreset || existing?.characterPreset || 'cj_rizky',
    color: payload.color || existing?.color || '#0ea5e9',
    x:
      typeof payload.x === 'number' && !Number.isNaN(payload.x)
        ? Math.max(60, Math.min(MAP_WIDTH - 60, Math.round(payload.x)))
        : existing
        ? existing.x
        : spawn.x,
    y:
      typeof payload.y === 'number' && !Number.isNaN(payload.y)
        ? Math.max(60, Math.min(MAP_HEIGHT - 60, Math.round(payload.y)))
        : existing
        ? existing.y
        : spawn.y,
    vx: typeof payload.vx === 'number' ? payload.vx : existing ? existing.vx : 0,
    vy: typeof payload.vy === 'number' ? payload.vy : existing ? existing.vy : 0,
    facingAngle:
      typeof payload.facingAngle === 'number'
        ? payload.facingAngle
        : existing
        ? existing.facingAngle
        : Math.PI,
    jumpY:
      typeof payload.jumpY === 'number'
        ? payload.jumpY
        : existing
        ? existing.jumpY
        : 0,
    score: Math.max(existing?.score || 0, typeof payload.score === 'number' ? payload.score : 0),
    missionPoints:
      typeof payload.missionPoints === 'number'
        ? payload.missionPoints
        : existing
        ? existing.missionPoints
        : 100,
    collectedItemsCount: Math.max(
      existing?.collectedItemsCount || 0,
      typeof payload.collectedItemsCount === 'number' ? payload.collectedItemsCount : 0
    ),
    answeredCount: Math.max(existing?.answeredCount || 0, mergedAnsweredIds.length),
    answeredQuestionIds: mergedAnsweredIds,
    streak: existing ? existing.streak : 0,
    hp: 100,
    currentSector: existing?.currentSector || null,
    lockedOption: existing?.lockedOption || null,
    lockTimeMs: existing?.lockTimeMs || null,
    lastChatText: existing?.lastChatText,
    lastChatTime: existing?.lastChatTime,
    lastUpdated: Date.now(),
    isRoamingPeer: false,
  };

  room.players.set(payload.playerId, updated);
  schedulePersistStateToDisk();
  return updated;
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clientRoomMap = new Map<WebSocket, { pin: string; playerId: string }>();

  function broadcastToRoom(_pin: string, payload: unknown) {
    const message = JSON.stringify(payload);
    for (const [client] of clientRoomMap.entries()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  // Helper to create a Versus Challenge (Mutual Consent for real students, auto-accept for training bots)
  function createVersusChallenge(
    rawPin: string,
    challengerId: string,
    challengerName: string,
    challengerClass: string,
    opponentId: string
  ): VersusMatchState | null {
    const pin = normalizeRoomPin(rawPin);
    const room = getOrCreateRoom(pin);
    const opponent = findPlayerAcrossRooms(opponentId);
    if (!opponent) return null;

    // Cancel any previous pending match involving challenger
    for (const r of rooms.values()) {
      for (const [mId, existing] of r.versusMatches.entries()) {
        if (
          (existing.challengerId === challengerId || existing.opponentId === challengerId) &&
          existing.status === 'PENDING_CONSENT'
        ) {
          r.versusMatches.delete(mId);
        }
      }
    }

    const isBot = Boolean(opponent.isRoamingPeer);
    const matchId = `vs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const match: VersusMatchState = {
      id: matchId,
      pin,
      status: isBot ? 'IN_PROGRESS' : 'PENDING_CONSENT',
      challengerId,
      challengerName: challengerName || 'Siswa MTsN 14',
      challengerClass: challengerClass || 'Kelas 8A',
      opponentId: opponent.id,
      opponentName: opponent.name,
      opponentClass: opponent.studentClass,
      isBotOpponent: isBot,
      roundIdx: 0,
      questions: pickVersusQuestions(),
      challengerScore: 0,
      opponentScore: 0,
      challengerAnsweredRound: -1,
      opponentAnsweredRound: -1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    room.versusMatches.set(matchId, match);
    broadcastToRoom(pin, { type: 'versus:update', payload: match });
    return match;
  }

  function respondToVersusChallenge(
    matchId: string,
    accept: boolean
  ): VersusMatchState | null {
    for (const r of rooms.values()) {
      const match = r.versusMatches.get(matchId);
      if (match) {
        match.status = accept ? 'IN_PROGRESS' : 'DECLINED';
        match.updatedAt = Date.now();
        broadcastToRoom(r.pin, { type: 'versus:update', payload: match });
        return match;
      }
    }
    return null;
  }

  function submitVersusRoundAnswer(
    matchId: string,
    playerId: string,
    roundIdx: number,
    selectedIndex: number,
    timeLeftSec: number
  ): VersusMatchState | null {
    for (const r of rooms.values()) {
      const match = r.versusMatches.get(matchId);
      if (!match || match.status !== 'IN_PROGRESS') continue;

      const currentQ = match.questions[roundIdx] || match.questions[match.roundIdx];
      if (!currentQ) continue;

      const isCorrect = selectedIndex === currentQ.correctIndex;
      const pointsGain = isCorrect ? 100 + Math.max(0, Math.min(8, timeLeftSec)) * 10 : 0;

      if (playerId === match.challengerId && match.challengerAnsweredRound < roundIdx) {
        match.challengerAnsweredRound = roundIdx;
        match.challengerScore += pointsGain;
      } else if (playerId === match.opponentId && match.opponentAnsweredRound < roundIdx) {
        match.opponentAnsweredRound = roundIdx;
        match.opponentScore += pointsGain;
      }

      // If opponent is a training bot, simulate bot's answer immediately
      if (match.isBotOpponent && match.opponentAnsweredRound < roundIdx) {
        match.opponentAnsweredRound = roundIdx;
        const botCorrect = Math.random() < 0.65;
        match.opponentScore += botCorrect ? 115 : 0;
      }

      // Advance round or finish match once BOTH players have answered this round!
      if (
        match.challengerAnsweredRound >= match.roundIdx &&
        match.opponentAnsweredRound >= match.roundIdx
      ) {
        if (match.roundIdx + 1 < match.questions.length) {
          match.roundIdx += 1;
        } else {
          match.status = 'FINISHED';
          // Credit MP & Score to both players on server
          const challengerPlayer = findPlayerAcrossRooms(match.challengerId);
          const opponentPlayer = findPlayerAcrossRooms(match.opponentId);
          const challengerWon = match.challengerScore >= match.opponentScore;
          const oppWon = match.opponentScore >= match.challengerScore;

          if (challengerPlayer && !challengerPlayer.isRoamingPeer) {
            challengerPlayer.missionPoints += challengerWon ? 100 : 45;
            challengerPlayer.score += challengerWon ? 150 : 60;
            challengerPlayer.lastUpdated = Date.now();
          }
          if (opponentPlayer && !opponentPlayer.isRoamingPeer) {
            opponentPlayer.missionPoints += oppWon ? 100 : 45;
            opponentPlayer.score += oppWon ? 150 : 60;
            opponentPlayer.lastUpdated = Date.now();
          }
          schedulePersistStateToDisk();
        }
      }

      match.updatedAt = Date.now();
      broadcastToRoom(r.pin, { type: 'versus:update', payload: match });
      return match;
    }
    return null;
  }

  app.get('/api/bootstrap', (_req, res) => {
    getOrCreateRoom('MTN14');
    const activeRooms = Array.from(rooms.values()).map((r) => {
      const humanCount = Array.from(r.players.values()).filter((p) => !p.isRoamingPeer).length;
      return {
        pin: r.pin,
        roomName: r.roomName,
        teacherName: r.teacherName,
        status: r.status,
        studentCount: humanCount,
        totalPlayers: r.players.size,
        categoryFilter: r.categoryFilter,
      };
    });

    res.json({
      teacher: {
        name: 'Azhary Mardhani, S.Kom',
        school: 'MTs Negeri 14 Jakarta Timur (Kampus Halim Perdanakusuma)',
        subject: 'Informatika (Kurikulum Merdeka)',
      },
      materials: materialsStore,
      questions: questionsStore,
      activeRooms,
      recentAnswersCount: globalAnswerHistory.length,
    });
  });

  // HTTP Join & Resume Endpoint
  app.post('/api/room/join', (req, res) => {
    const {
      pin: rawPin,
      playerId,
      playerName,
      studentClass,
      role,
      color,
      characterPreset,
      categoryFilter,
      x,
      y,
      score,
      missionPoints,
      collectedItemsCount,
      answeredQuestionIds,
    } = req.body || {};

    if (!playerId) {
      res.status(400).json({ error: 'playerId wajib diisi.' });
      return;
    }

    const pin = normalizeRoomPin(rawPin);
    const room = getOrCreateRoom(
      pin,
      `Kampus MTsN 14 Halim (${pin})`,
      'Azhary Mardhani, S.Kom',
      role === 'TEACHER' ? playerId : 'teacher-default',
      categoryFilter || 'Semua Materi'
    );

    if (role === 'TEACHER' && categoryFilter) {
      room.categoryFilter = categoryFilter;
      room.hostId = playerId;
    }

    const player = upsertPlayerInRoom(room, {
      playerId,
      playerName,
      studentClass,
      role: role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
      characterPreset,
      color,
      x,
      y,
      score,
      missionPoints,
      collectedItemsCount,
      answeredQuestionIds,
    });

    const serialized = serializeRoom(room);
    broadcastToRoom(pin, { type: 'room:state', payload: serialized });

    res.json({
      room: serialized,
      player,
      spawnX: player.x,
      spawnY: player.y,
    });
  });

  // Dual-Transport Real-Time Heartbeat & Auto-Save Sync Endpoint
  app.post('/api/room/sync', (req, res) => {
    const {
      pin: rawPin,
      playerId,
      playerName,
      studentClass,
      role,
      color,
      characterPreset,
      x,
      y,
      vx,
      vy,
      facingAngle,
      jumpY,
      score,
      missionPoints,
      collectedItemsCount,
      answeredCount,
      answeredQuestionIds,
    } = req.body || {};

    if (!playerId) {
      res.status(400).json({ error: 'playerId diperlukan.' });
      return;
    }

    const pin = normalizeRoomPin(rawPin);
    const room = getOrCreateRoom(pin);
    let p = room.players.get(playerId);

    if (!p) {
      p = upsertPlayerInRoom(room, {
        playerId,
        playerName,
        studentClass,
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
        missionPoints,
        collectedItemsCount,
        answeredQuestionIds,
      });
    } else {
      if (playerName) p.name = playerName;
      if (studentClass) p.studentClass = studentClass;
      if (characterPreset) p.characterPreset = characterPreset;
      if (color) p.color = color;
      if (typeof x === 'number' && !Number.isNaN(x)) {
        p.x = Math.max(60, Math.min(MAP_WIDTH - 60, Math.round(x)));
      }
      if (typeof y === 'number' && !Number.isNaN(y)) {
        p.y = Math.max(60, Math.min(MAP_HEIGHT - 60, Math.round(y)));
      }
      if (typeof vx === 'number') p.vx = vx;
      if (typeof vy === 'number') p.vy = vy;
      if (typeof facingAngle === 'number') p.facingAngle = facingAngle;
      if (typeof jumpY === 'number') p.jumpY = jumpY;
      if (typeof score === 'number' && score > p.score) p.score = score;
      if (typeof missionPoints === 'number') p.missionPoints = missionPoints;
      if (typeof collectedItemsCount === 'number' && collectedItemsCount > p.collectedItemsCount) {
        p.collectedItemsCount = collectedItemsCount;
      }
      if (Array.isArray(answeredQuestionIds) && answeredQuestionIds.length > 0) {
        p.answeredQuestionIds = Array.from(
          new Set([...(p.answeredQuestionIds || []), ...answeredQuestionIds])
        );
      }
      if (typeof answeredCount === 'number') {
        p.answeredCount = Math.max(p.answeredCount, answeredCount, p.answeredQuestionIds.length);
      }
      p.lastUpdated = Date.now();
      schedulePersistStateToDisk();
    }

    res.json({
      room: serializeRoom(room),
      player: p,
    });
  });

  // Real-Time Chat Endpoint (Also triggers 3D Overhead Speech Bubble above student avatar!)
  app.post('/api/room/chat', (req, res) => {
    const {
      pin: rawPin,
      senderId,
      senderName,
      senderClass,
      senderRole,
      senderColor,
      text,
    } = req.body || {};

    const cleanText = String(text || '').trim().slice(0, 140);
    if (!senderId || !cleanText) {
      res.status(400).json({ error: 'Pesan chat kosong.' });
      return;
    }

    const pin = normalizeRoomPin(rawPin);
    const room = getOrCreateRoom(pin);
    const msg: RoomChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId,
      senderName: senderName || 'Siswa MTsN 14',
      senderClass: senderClass || 'Kelas 8A',
      senderRole: senderRole === 'TEACHER' ? 'TEACHER' : 'STUDENT',
      senderColor: senderColor || '#38bdf8',
      text: cleanText,
      timestamp: Date.now(),
    };

    room.chatMessages.push(msg);
    if (room.chatMessages.length > 60) {
      room.chatMessages = room.chatMessages.slice(-60);
    }

    const p = findPlayerAcrossRooms(senderId);
    if (p) {
      p.lastChatText = cleanText;
      p.lastChatTime = msg.timestamp;
      p.lastUpdated = Date.now();
    }

    schedulePersistStateToDisk();
    broadcastToRoom(pin, { type: 'chat:message', payload: msg });
    res.json({ ok: true, message: msg });
  });

  // Real-Time Mutual-Consent Versus Endpoints
  app.post('/api/versus/invite', (req, res) => {
    const { pin, challengerId, challengerName, challengerClass, opponentId } = req.body || {};
    if (!challengerId || !opponentId) {
      res.status(400).json({ error: 'Data penantang atau lawan tidak lengkap.' });
      return;
    }
    const match = createVersusChallenge(
      pin || 'MTN14',
      challengerId,
      challengerName,
      challengerClass,
      opponentId
    );
    if (!match) {
      res.status(404).json({ error: 'Siswa lawan tidak ditemukan di map.' });
      return;
    }
    res.json({ match });
  });

  app.post('/api/versus/respond', (req, res) => {
    const { matchId, accept } = req.body || {};
    const match = respondToVersusChallenge(String(matchId || ''), Boolean(accept));
    if (!match) {
      res.status(404).json({ error: 'Tantangan duel tidak ditemukan.' });
      return;
    }
    res.json({ match });
  });

  app.post('/api/versus/answer', (req, res) => {
    const { matchId, playerId, roundIdx, selectedIndex, timeLeftSec } = req.body || {};
    const match = submitVersusRoundAnswer(
      String(matchId || ''),
      String(playerId || ''),
      Number(roundIdx) || 0,
      Number(selectedIndex),
      Number(timeLeftSec) || 5
    );
    if (!match) {
      res.status(404).json({ error: 'Sesi duel tidak ditemukan.' });
      return;
    }
    res.json({ match });
  });

  app.post('/api/materials', (req, res) => {
    const item = req.body as InformaticsMaterial;
    if (!item || !item.title || !item.summary) {
      res.status(400).json({ error: 'Data materi tidak lengkap.' });
      return;
    }
    const existingIdx = materialsStore.findIndex((m) => m.id === item.id);
    if (existingIdx >= 0) {
      materialsStore[existingIdx] = item;
    } else {
      materialsStore.unshift(item);
    }
    schedulePersistStateToDisk();
    res.json({ materials: materialsStore });
  });

  app.delete('/api/materials/:id', (req, res) => {
    materialsStore = materialsStore.filter((m) => m.id !== req.params.id);
    schedulePersistStateToDisk();
    res.json({ materials: materialsStore });
  });

  app.post('/api/questions', (req, res) => {
    const q = req.body as InformaticsQuestion;
    if (!q || !q.question || !q.options || !q.correctAnswer) {
      res.status(400).json({ error: 'Data butir soal tidak lengkap.' });
      return;
    }
    const existingIdx = questionsStore.findIndex((item) => item.id === q.id);
    if (existingIdx >= 0) {
      questionsStore[existingIdx] = q;
    } else {
      questionsStore.push(q);
    }
    schedulePersistStateToDisk();
    res.json({ questions: questionsStore });
  });

  app.delete('/api/questions/:id', (req, res) => {
    if (questionsStore.length <= 3) {
      res.status(400).json({ error: 'Minimal harus terdapat 3 butir soal di dalam bank soal.' });
      return;
    }
    questionsStore = questionsStore.filter((q) => q.id !== req.params.id);
    schedulePersistStateToDisk();
    res.json({ questions: questionsStore });
  });

  app.post('/api/sessions/record', (req, res) => {
    const { answers } = req.body as { answers: PlayerAnswerEvent[] };
    if (Array.isArray(answers)) {
      globalAnswerHistory.push(...answers);
      if (globalAnswerHistory.length > 1000) {
        globalAnswerHistory = globalAnswerHistory.slice(-1000);
      }
      schedulePersistStateToDisk();
    }
    res.json({ ok: true, totalRecorded: globalAnswerHistory.length });
  });

  // Roaming training bots patrol loop along MTsN 14 Halim walkways (every 250ms)
  setInterval(() => {
    for (const room of rooms.values()) {
      for (const p of room.players.values()) {
        if (!p.isRoamingPeer) continue;
        p.x += p.vx * 0.25;
        p.y += p.vy * 0.25;

        if (p.x < 320 || p.x > MAP_WIDTH - 320) p.vx *= -1;
        if (p.y < 260 || p.y > MAP_HEIGHT - 260) p.vy *= -1;
        p.x = Math.max(280, Math.min(MAP_WIDTH - 280, p.x));
        p.y = Math.max(240, Math.min(MAP_HEIGHT - 240, p.y));
        p.facingAngle = Math.atan2(p.vx, p.vy);
        p.lastUpdated = Date.now();

        broadcastToRoom(room.pin, {
          type: 'player:moved',
          payload: {
            playerId: p.id,
            x: Math.round(p.x),
            y: Math.round(p.y),
            vx: p.vx,
            vy: p.vy,
            facingAngle: p.facingAngle,
            jumpY: 0,
            score: p.score,
            missionPoints: p.missionPoints,
            collectedItemsCount: p.collectedItemsCount,
            answeredCount: p.answeredCount,
            lastUpdated: p.lastUpdated,
          },
        });
      }
    }
  }, 250);

  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const { type, payload } = msg;

        if (type === 'room:create' || type === 'room:join') {
          const pin = normalizeRoomPin(payload.pin);
          const room = getOrCreateRoom(
            pin,
            payload.roomName || `Kampus MTsN 14 Halim (${pin})`,
            payload.teacherName || 'Azhary Mardhani, S.Kom',
            payload.playerId,
            payload.categoryFilter || 'Semua Materi'
          );

          if (type === 'room:create' || payload.role === 'TEACHER') {
            room.hostId = payload.playerId;
            if (payload.categoryFilter) {
              room.categoryFilter = payload.categoryFilter;
            }
          }

          const player = upsertPlayerInRoom(room, {
            playerId: payload.playerId,
            playerName: payload.playerName,
            studentClass: payload.studentClass,
            role: payload.role === 'TEACHER' || type === 'room:create' ? 'TEACHER' : 'STUDENT',
            characterPreset: payload.characterPreset,
            color: payload.color,
            x: payload.x,
            y: payload.y,
            score: payload.score,
            missionPoints: payload.missionPoints,
            collectedItemsCount: payload.collectedItemsCount,
            answeredQuestionIds: payload.answeredQuestionIds,
          });

          clientRoomMap.set(ws, { pin, playerId: payload.playerId });
          const serialized = serializeRoom(room);
          ws.send(
            JSON.stringify({
              type: 'room:joined',
              payload: {
                ...serialized,
                player,
                spawnX: player.x,
                spawnY: player.y,
              },
            })
          );
          broadcastToRoom(pin, { type: 'room:state', payload: serialized });
        } else if (type === 'player:move') {
          let meta = clientRoomMap.get(ws);
          if (!meta && payload.pin && payload.playerId) {
            meta = { pin: normalizeRoomPin(payload.pin), playerId: String(payload.playerId) };
            clientRoomMap.set(ws, meta);
          }
          if (!meta) return;
          const room = getOrCreateRoom(meta.pin);
          let p = room.players.get(meta.playerId);
          if (!p) {
            p = upsertPlayerInRoom(room, {
              playerId: meta.playerId,
              playerName: payload.playerName,
              studentClass: payload.studentClass,
              characterPreset: payload.characterPreset,
              color: payload.color,
            });
          }

          p.x = Math.max(60, Math.min(MAP_WIDTH - 60, Number(payload.x) || p.x));
          p.y = Math.max(60, Math.min(MAP_HEIGHT - 60, Number(payload.y) || p.y));
          p.vx = Number(payload.vx) || 0;
          p.vy = Number(payload.vy) || 0;
          if (typeof payload.facingAngle === 'number') {
            p.facingAngle = payload.facingAngle;
          }
          if (typeof payload.jumpY === 'number') {
            p.jumpY = payload.jumpY;
          }
          p.lastUpdated = Date.now();

          if (typeof payload.scoreBonus === 'number' && payload.scoreBonus > 0) {
            p.score += payload.scoreBonus;
          }
          if (typeof payload.missionPointsDelta === 'number' && payload.missionPointsDelta !== 0) {
            p.missionPoints = Math.max(0, p.missionPoints + payload.missionPointsDelta);
          }
          if (typeof payload.collectedDelta === 'number' && payload.collectedDelta > 0) {
            p.collectedItemsCount += payload.collectedDelta;
          }

          schedulePersistStateToDisk();

          broadcastToRoom(meta.pin, {
            type: 'player:moved',
            payload: {
              playerId: p.id,
              name: p.name,
              studentClass: p.studentClass,
              characterPreset: p.characterPreset,
              color: p.color,
              x: p.x,
              y: p.y,
              vx: p.vx,
              vy: p.vy,
              facingAngle: p.facingAngle,
              jumpY: p.jumpY,
              score: p.score,
              missionPoints: p.missionPoints,
              collectedItemsCount: p.collectedItemsCount,
              answeredCount: p.answeredCount,
              lastChatText: p.lastChatText,
              lastChatTime: p.lastChatTime,
              lastUpdated: p.lastUpdated,
            },
          });
        } else if (type === 'chat:send') {
          const meta = clientRoomMap.get(ws);
          const pin = normalizeRoomPin(payload?.pin || meta?.pin || 'MTN14');
          const room = getOrCreateRoom(pin);
          const senderId = String(payload?.senderId || meta?.playerId || '');
          const cleanText = String(payload?.text || '').trim().slice(0, 140);
          if (!senderId || !cleanText) return;

          const chatMsg: RoomChatMessage = {
            id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            senderId,
            senderName: payload?.senderName || 'Siswa MTsN 14',
            senderClass: payload?.senderClass || 'Kelas 8A',
            senderRole: payload?.senderRole === 'TEACHER' ? 'TEACHER' : 'STUDENT',
            senderColor: payload?.senderColor || '#38bdf8',
            text: cleanText,
            timestamp: Date.now(),
          };
          room.chatMessages.push(chatMsg);
          if (room.chatMessages.length > 60) {
            room.chatMessages = room.chatMessages.slice(-60);
          }
          const p = findPlayerAcrossRooms(senderId);
          if (p) {
            p.lastChatText = cleanText;
            p.lastChatTime = chatMsg.timestamp;
            p.lastUpdated = Date.now();
          }
          schedulePersistStateToDisk();
          broadcastToRoom(pin, { type: 'chat:message', payload: chatMsg });
        } else if (type === 'versus:invite') {
          const meta = clientRoomMap.get(ws);
          createVersusChallenge(
            payload?.pin || meta?.pin || 'MTN14',
            String(payload?.challengerId || meta?.playerId || ''),
            String(payload?.challengerName || 'Siswa MTsN 14'),
            String(payload?.challengerClass || 'Kelas 8A'),
            String(payload?.opponentId || '')
          );
        } else if (type === 'versus:respond') {
          respondToVersusChallenge(String(payload?.matchId || ''), Boolean(payload?.accept));
        } else if (type === 'versus:answer') {
          submitVersusRoundAnswer(
            String(payload?.matchId || ''),
            String(payload?.playerId || ''),
            Number(payload?.roundIdx) || 0,
            Number(payload?.selectedIndex),
            Number(payload?.timeLeftSec) || 5
          );
        } else if (type === 'player:answer_teacher_question') {
          const meta = clientRoomMap.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.pin);
          if (!room) return;
          const p = room.players.get(meta.playerId);
          if (!p) return;

          const answerEvent = payload.answerEvent as PlayerAnswerEvent;
          if (!answerEvent || !answerEvent.questionId) return;

          const existingIdx = room.answers.findIndex(
            (a) => a.questionId === answerEvent.questionId && a.playerId === p.id
          );
          if (existingIdx === -1) {
            p.score += answerEvent.pointsEarned;
            if (!p.answeredQuestionIds.includes(answerEvent.questionId)) {
              p.answeredQuestionIds.push(answerEvent.questionId);
            }
            p.answeredCount = p.answeredQuestionIds.length;
            p.lastUpdated = Date.now();
            if (typeof payload.missionPointCost === 'number') {
              p.missionPoints = Math.max(0, p.missionPoints - payload.missionPointCost);
            }
            const recorded: PlayerAnswerEvent = {
              ...answerEvent,
              playerId: p.id,
              playerName: `${p.name} (${p.studentClass})`,
              playerTotalScoreAfter: p.score,
            };
            room.answers.push(recorded);
            globalAnswerHistory.push(recorded);
            schedulePersistStateToDisk();
            broadcastToRoom(meta.pin, { type: 'room:state', payload: serializeRoom(room) });
          }
        } else if (type === 'player:versus_complete') {
          const meta = clientRoomMap.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.pin);
          if (!room) return;
          const p = room.players.get(meta.playerId);
          if (!p) return;

          const won = Boolean(payload.won);
          const mpEarned = Number(payload.mpEarned) || (won ? 100 : 35);
          const scoreEarned = Number(payload.scoreEarned) || (won ? 150 : 40);

          p.missionPoints += mpEarned;
          p.score += scoreEarned;
          p.lastUpdated = Date.now();
          schedulePersistStateToDisk();
          broadcastToRoom(meta.pin, { type: 'room:state', payload: serializeRoom(room) });
        } else if (type === 'room:finish_game') {
          const meta = clientRoomMap.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.pin);
          if (!room) return;
          room.status = 'FINISHED';
          schedulePersistStateToDisk();
          broadcastToRoom(meta.pin, { type: 'room:state', payload: serializeRoom(room) });
        } else if (type === 'room:start_game') {
          const meta = clientRoomMap.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.pin);
          if (!room) return;
          if (payload?.categoryFilter) {
            room.categoryFilter = payload.categoryFilter;
          }
          room.status = 'PLAYING';
          schedulePersistStateToDisk();
          broadcastToRoom(meta.pin, { type: 'room:state', payload: serializeRoom(room) });
        }
      } catch {
        // Ignore malformed packets
      }
    });

    ws.on('close', () => {
      clientRoomMap.delete(ws);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Siber Arena 14 MTsN 14 Halim Server running on http://localhost:${PORT}`);
  });
}

startServer();
