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

// ============================================================================
// SINGLE UNIFIED SHARED ARENA STATE (100% OF STUDENTS MEET ON 1 ARENA)
// ============================================================================
let materialsStore: InformaticsMaterial[] = [...INITIAL_MATERIALS];
let questionsStore: InformaticsQuestion[] = [...INITIAL_QUESTIONS];
let globalAnswerHistory: PlayerAnswerEvent[] = [];

let arenaPin = 'MTN14';
let arenaRoomName = 'Kampus MTsN 14 Halim Jakarta Timur';
let arenaTeacherName = 'Azhary Mardhani, S.Kom';
let arenaStatus: 'LOBBY' | 'PLAYING' | 'ROUND_RESULT' | 'FINISHED' = 'PLAYING';
let arenaCategoryFilter = 'Semua Materi';
const arenaPlayers = new Map<string, ClassMapPlayer>();
let arenaChatMessages: RoomChatMessage[] = [
  {
    id: 'welcome-msg',
    senderId: 'teacher-system',
    senderName: 'Pak Azhary Mardhani, S.Kom',
    senderClass: 'Guru Informatika',
    senderRole: 'TEACHER',
    senderColor: '#f59e0b',
    text: 'Selamat datang di Open-World 3D MTsN 14 Halim! Semua siswa otomatis berkumpul di 1 arena yang sama di Lapangan Upacara!',
    timestamp: Date.now(),
  },
];
const arenaVersusMatches = new Map<string, VersusMatchState>();

export function normalizeRoomPin(raw: unknown): string {
  const cleaned = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return cleaned || 'MTN14';
}

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
    x: 920,
    y: 640,
    vx: 45,
    vy: 25,
  },
  {
    id: 'peer-nabila',
    name: '[BOT] Nabila Latihan',
    studentClass: 'Bot Kelas 8B',
    characterPreset: 'nadia_tech',
    color: '#0ea5e9',
    x: 1480,
    y: 920,
    vx: -45,
    vy: -25,
  },
];

function seedBotsInArena() {
  for (const peer of ROAMING_PEERS_TEMPLATE) {
    if (!arenaPlayers.has(peer.id)) {
      arenaPlayers.set(peer.id, {
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
  }
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function schedulePersistStateToDisk() {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    try {
      const payload = {
        savedAt: Date.now(),
        materials: materialsStore,
        questions: questionsStore,
        globalAnswerHistory: globalAnswerHistory.slice(-500),
        arena: {
          pin: arenaPin,
          roomName: arenaRoomName,
          teacherName: arenaTeacherName,
          status: arenaStatus,
          categoryFilter: arenaCategoryFilter,
          players: Array.from(arenaPlayers.values()),
          chatMessages: arenaChatMessages.slice(-60),
        },
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
    if (parsed.arena) {
      arenaPin = parsed.arena.pin || 'MTN14';
      arenaCategoryFilter = parsed.arena.categoryFilter || 'Semua Materi';
      if (Array.isArray(parsed.arena.chatMessages) && parsed.arena.chatMessages.length > 0) {
        arenaChatMessages = parsed.arena.chatMessages.slice(-60);
      }
      if (Array.isArray(parsed.arena.players)) {
        const now = Date.now();
        for (const p of parsed.arena.players) {
          if (p.isRoamingPeer && !ROAMING_PEERS_TEMPLATE.some((t) => t.id === p.id)) {
            continue;
          }
          // Skip stale human players older than 45 seconds on startup
          if (!p.isRoamingPeer && now - (p.lastUpdated || 0) > 45000) {
            continue;
          }
          arenaPlayers.set(p.id, {
            ...p,
            facingAngle: typeof p.facingAngle === 'number' ? p.facingAngle : Math.PI,
            jumpY: typeof p.jumpY === 'number' ? p.jumpY : 0,
            answeredQuestionIds: Array.isArray(p.answeredQuestionIds)
              ? p.answeredQuestionIds
              : [],
          });
        }
      }
    }
  } catch {
    // Ignore corrupted state file
  }
}

loadPersistedStateFromDisk();
seedBotsInArena();

function computeSpawnPosition(playerId: string): { x: number; y: number } {
  const existing = arenaPlayers.get(playerId);
  if (existing && !existing.isRoamingPeer) {
    return { x: existing.x, y: existing.y };
  }
  // Place students in a tight, clearly visible circle around the center of Lapangan Upacara (1200, 780)
  // Radius is 36..64 map units (3.6..6.4 meters in 3D) so everyone immediately sees each other on screen!
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = (hash * 31 + playerId.charCodeAt(i)) | 0;
  }
  const activeHumans = Array.from(arenaPlayers.values()).filter(
    (p) => !p.isRoamingPeer && Date.now() - p.lastUpdated < 120000
  );
  const idx = activeHumans.length;
  const angle = ((idx * 68 + (Math.abs(hash) % 45)) * Math.PI) / 180;
  const radius = 38 + (idx % 4) * 14;
  const spawnX = Math.round(SPAWN_CENTER_X + Math.cos(angle) * radius);
  const spawnY = Math.round(SPAWN_CENTER_Y + Math.sin(angle) * radius);
  return { x: spawnX, y: spawnY };
}

function getFilteredQuestions(categoryFilter: string): InformaticsQuestion[] {
  if (!categoryFilter || categoryFilter === 'Semua Materi') return questionsStore;
  const filtered = questionsStore.filter((q) => q.category === categoryFilter);
  return filtered.length > 0 ? filtered : questionsStore;
}

function getActiveVersusMatches(): VersusMatchState[] {
  const now = Date.now();
  const list: VersusMatchState[] = [];
  for (const [mId, match] of arenaVersusMatches.entries()) {
    if (now - match.updatedAt > 90000) {
      arenaVersusMatches.delete(mId);
      continue;
    }
    list.push(match);
  }
  return list;
}

function serializeArena(requestedPin?: string) {
  const qs = getFilteredQuestions(arenaCategoryFilter);
  const now = Date.now();
  seedBotsInArena();

  // Keep all bots + all human players active within the last 45 seconds in the live arena list
  const activePlayers: ClassMapPlayer[] = [];
  for (const [id, p] of arenaPlayers.entries()) {
    if (p.isRoamingPeer || now - p.lastUpdated < 45000) {
      activePlayers.push(p);
    } else {
      arenaPlayers.delete(id);
    }
  }

  return {
    pin: requestedPin ? normalizeRoomPin(requestedPin) : arenaPin,
    roomName: arenaRoomName,
    teacherName: arenaTeacherName,
    hostId: 'teacher-default',
    status: arenaStatus,
    categoryFilter: arenaCategoryFilter,
    currentQuestionIndex: 0,
    totalQuestions: qs.length,
    timeLeftSec: 60,
    players: activePlayers,
    answers: globalAnswerHistory.slice(-200),
    chatMessages: arenaChatMessages.slice(-50),
    versusMatches: getActiveVersusMatches(),
  };
}

// CRITICAL: Keyed strictly by `payload.playerId` — NEVER delete or overwrite another player with the same name!
function upsertPlayerInArena(payload: {
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
}): ClassMapPlayer {
  const existing = arenaPlayers.get(payload.playerId);
  const spawn = computeSpawnPosition(payload.playerId);

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

  arenaPlayers.set(payload.playerId, updated);
  schedulePersistStateToDisk();
  return updated;
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clientPlayerMap = new Map<WebSocket, { pin: string; playerId: string }>();

  const serverInstanceId = `srv-${Date.now().toString(36).slice(-4)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  const CLOUD_ARENA_TOPIC = 'mtsn14-halim-2d55d160/arena/v4';
  let cloudBridgeWs: WebSocket | null = null;

  function encodeMqttVarLen(len: number): Buffer {
    const bytes: number[] = [];
    let rem = len;
    do {
      let encoded = rem % 128;
      rem = Math.floor(rem / 128);
      if (rem > 0) encoded = encoded | 128;
      bytes.push(encoded);
    } while (rem > 0);
    return Buffer.from(bytes);
  }

  function publishToCloudBridge(type: string, payload: unknown) {
    if (!cloudBridgeWs || cloudBridgeWs.readyState !== WebSocket.OPEN) return;
    try {
      const pkt = JSON.stringify({
        packetId: `${serverInstanceId}-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
        originTabId: serverInstanceId,
        type,
        payload,
      });
      const tBuf = Buffer.from(CLOUD_ARENA_TOPIC, 'utf8');
      const mBuf = Buffer.from(pkt, 'utf8');
      const body = Buffer.concat([
        Buffer.from([(tBuf.length >> 8) & 0xff, tBuf.length & 0xff]),
        tBuf,
        mBuf,
      ]);
      const full = Buffer.concat([Buffer.from([0x30]), encodeMqttVarLen(body.length), body]);
      cloudBridgeWs.send(full);
    } catch {
      // Ignore bridge send error
    }
  }

  function connectServerCloudBridge() {
    try {
      const ws = new WebSocket('wss://broker.emqx.io:8084/mqtt', ['mqtt']);
      cloudBridgeWs = ws;
      ws.on('open', () => {
        const idBuf = Buffer.from(serverInstanceId, 'utf8');
        const vh = Buffer.from([0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c]);
        const payload = Buffer.concat([
          Buffer.from([(idBuf.length >> 8) & 0xff, idBuf.length & 0xff]),
          idBuf,
        ]);
        ws.send(
          Buffer.concat([Buffer.from([0x10]), encodeMqttVarLen(vh.length + payload.length), vh, payload])
        );

        const tBuf = Buffer.from(CLOUD_ARENA_TOPIC, 'utf8');
        const subBody = Buffer.concat([
          Buffer.from([0x00, 0x01]),
          Buffer.from([(tBuf.length >> 8) & 0xff, tBuf.length & 0xff]),
          tBuf,
          Buffer.from([0x00]),
        ]);
        ws.send(Buffer.concat([Buffer.from([0x82]), encodeMqttVarLen(subBody.length), subBody]));
      });

      ws.on('message', (data: Buffer) => {
        try {
          const buf = Buffer.from(data);
          let offset = 0;
          while (offset < buf.length) {
            const header = buf[offset++];
            let mult = 1;
            let remLen = 0;
            let b = 0;
            do {
              if (offset >= buf.length) return;
              b = buf[offset++];
              remLen += (b & 127) * mult;
              mult *= 128;
            } while ((b & 128) !== 0);
            const packetEnd = offset + remLen;
            if (packetEnd > buf.length) return;

            if (header >> 4 === 3) {
              const tLen = (buf[offset] << 8) | buf[offset + 1];
              const jsonStr = buf.slice(offset + 2 + tLen, packetEnd).toString('utf8');
              const pkt = JSON.parse(jsonStr);
              if (pkt && pkt.originTabId !== serverInstanceId) {
                if (pkt.type === 'player:moved' && pkt.payload?.playerId) {
                  const pl = pkt.payload;
                  upsertPlayerInArena({
                    playerId: pl.playerId,
                    playerName: pl.name,
                    studentClass: pl.studentClass,
                    role: pl.role,
                    characterPreset: pl.characterPreset,
                    color: pl.color,
                    x: pl.x,
                    y: pl.y,
                    vx: pl.vx,
                    vy: pl.vy,
                    facingAngle: pl.facingAngle,
                    jumpY: pl.jumpY,
                    score: pl.score,
                    missionPoints: pl.missionPoints,
                    collectedItemsCount: pl.collectedItemsCount,
                    answeredQuestionIds: pl.answeredQuestionIds,
                  });
                  broadcastToLocalWs({ type: 'player:moved', payload: pl });
                } else if (pkt.type === 'player:left' && pkt.payload?.playerId) {
                  arenaPlayers.delete(pkt.payload.playerId);
                  broadcastToLocalWs({
                    type: 'room:state',
                    payload: serializeArena(arenaPin),
                  });
                } else if (pkt.type === 'chat:message' && pkt.payload?.id) {
                  if (!arenaChatMessages.some((m) => m.id === pkt.payload.id)) {
                    arenaChatMessages.push(pkt.payload);
                    if (arenaChatMessages.length > 60) {
                      arenaChatMessages = arenaChatMessages.slice(-60);
                    }
                    broadcastToLocalWs({ type: 'chat:message', payload: pkt.payload });
                  }
                } else if (pkt.type === 'versus:update' && pkt.payload?.id) {
                  arenaVersusMatches.set(pkt.payload.id, pkt.payload);
                  broadcastToLocalWs({ type: 'versus:update', payload: pkt.payload });
                }
              }
            }
            offset = packetEnd;
          }
        } catch {
          // Ignore malformed cloud packet
        }
      });

      ws.on('close', () => {
        setTimeout(connectServerCloudBridge, 3000);
      });
      ws.on('error', () => {});
    } catch {
      // Ignore bridge error
    }
  }

  connectServerCloudBridge();
  setInterval(() => {
    if (cloudBridgeWs && cloudBridgeWs.readyState === WebSocket.OPEN) {
      cloudBridgeWs.send(Buffer.from([0xc0, 0x00]));
    }
  }, 25000);

  function broadcastToLocalWs(payload: unknown) {
    const message = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  // Broadcast to ALL connected WebSocket clients AND Cross-Container Cloud Bridge
  function broadcastToArena(payload: any) {
    broadcastToLocalWs(payload);
    if (payload && typeof payload === 'object' && payload.type) {
      if (
        payload.type === 'player:moved' &&
        !payload.payload?.isRoamingPeer
      ) {
        publishToCloudBridge('player:moved', payload.payload);
      } else if (payload.type === 'chat:message') {
        publishToCloudBridge('chat:message', payload.payload);
      } else if (payload.type === 'versus:update') {
        publishToCloudBridge('versus:update', payload.payload);
      }
    }
  }

  function createVersusChallenge(
    rawPin: string,
    challengerId: string,
    challengerName: string,
    challengerClass: string,
    opponentId: string
  ): VersusMatchState | null {
    const pin = normalizeRoomPin(rawPin);
    const opponent = arenaPlayers.get(opponentId);
    if (!opponent) return null;

    for (const [mId, existing] of arenaVersusMatches.entries()) {
      if (
        (existing.challengerId === challengerId || existing.opponentId === challengerId) &&
        existing.status === 'PENDING_CONSENT'
      ) {
        arenaVersusMatches.delete(mId);
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

    arenaVersusMatches.set(matchId, match);
    broadcastToArena({ type: 'versus:update', payload: match });
    return match;
  }

  function respondToVersusChallenge(
    matchId: string,
    accept: boolean
  ): VersusMatchState | null {
    const match = arenaVersusMatches.get(matchId);
    if (!match) return null;
    match.status = accept ? 'IN_PROGRESS' : 'DECLINED';
    match.updatedAt = Date.now();
    broadcastToArena({ type: 'versus:update', payload: match });
    return match;
  }

  function submitVersusRoundAnswer(
    matchId: string,
    playerId: string,
    roundIdx: number,
    selectedIndex: number,
    timeLeftSec: number
  ): VersusMatchState | null {
    const match = arenaVersusMatches.get(matchId);
    if (!match || match.status !== 'IN_PROGRESS') return null;

    const currentQ = match.questions[roundIdx] || match.questions[match.roundIdx];
    if (!currentQ) return null;

    const isCorrect = selectedIndex === currentQ.correctIndex;
    const pointsGain = isCorrect ? 100 + Math.max(0, Math.min(10, timeLeftSec)) * 10 : 0;

    if (playerId === match.challengerId && match.challengerAnsweredRound < roundIdx) {
      match.challengerAnsweredRound = roundIdx;
      match.challengerScore += pointsGain;
    } else if (playerId === match.opponentId && match.opponentAnsweredRound < roundIdx) {
      match.opponentAnsweredRound = roundIdx;
      match.opponentScore += pointsGain;
    }

    if (match.isBotOpponent && match.opponentAnsweredRound < roundIdx) {
      match.opponentAnsweredRound = roundIdx;
      const botCorrect = Math.random() < 0.65;
      match.opponentScore += botCorrect ? 115 : 0;
    }

    if (
      match.challengerAnsweredRound >= match.roundIdx &&
      match.opponentAnsweredRound >= match.roundIdx
    ) {
      if (match.roundIdx + 1 < match.questions.length) {
        match.roundIdx += 1;
      } else {
        match.status = 'FINISHED';
        const challengerPlayer = arenaPlayers.get(match.challengerId);
        const opponentPlayer = arenaPlayers.get(match.opponentId);
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
    broadcastToArena({ type: 'versus:update', payload: match });
    return match;
  }

  app.get('/api/bootstrap', (_req, res) => {
    const now = Date.now();
    const humanCount = Array.from(arenaPlayers.values()).filter(
      (p) => !p.isRoamingPeer && now - p.lastUpdated < 45000
    ).length;

    res.json({
      teacher: {
        name: 'Azhary Mardhani, S.Kom',
        school: 'MTs Negeri 14 Jakarta Timur (Kampus Halim Perdanakusuma)',
        subject: 'Informatika (Kurikulum Merdeka)',
      },
      materials: materialsStore,
      questions: questionsStore,
      activeRooms: [
        {
          pin: arenaPin,
          roomName: arenaRoomName,
          teacherName: arenaTeacherName,
          status: arenaStatus,
          studentCount: humanCount,
          totalPlayers: humanCount + ROAMING_PEERS_TEMPLATE.length,
          categoryFilter: arenaCategoryFilter,
        },
      ],
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
    arenaPin = pin;
    if (role === 'TEACHER' && categoryFilter) {
      arenaCategoryFilter = categoryFilter;
    }
    if (arenaStatus === 'FINISHED') {
      arenaStatus = 'PLAYING';
    }

    const player = upsertPlayerInArena({
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

    const serialized = serializeArena(pin);
    broadcastToArena({ type: 'room:state', payload: serialized });

    res.json({
      room: serialized,
      player,
      spawnX: player.x,
      spawnY: player.y,
    });
  });

  // Dual-Transport Real-Time Heartbeat & Auto-Save Sync Endpoint (Every 300ms)
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
    let p = arenaPlayers.get(playerId);

    if (!p) {
      p = upsertPlayerInArena({
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
      room: serializeArena(pin),
      player: p,
    });
  });

  // Explicit Leave Room Endpoint (removes old character when switching students)
  app.post('/api/room/leave', (req, res) => {
    const { playerId } = req.body || {};
    if (playerId && arenaPlayers.has(playerId)) {
      arenaPlayers.delete(playerId);
      schedulePersistStateToDisk();
      publishToCloudBridge('player:left', { playerId });
      broadcastToLocalWs({ type: 'room:state', payload: serializeArena(arenaPin) });
    }
    res.json({ ok: true });
  });

  // HTTP Endpoint for Teacher Question Answer Submission
  app.post('/api/room/answer', (req, res) => {
    const { playerId, answerEvent, missionPointCost } = req.body || {};
    const pid = String(playerId || answerEvent?.playerId || '');
    const p = arenaPlayers.get(pid);
    if (p && answerEvent && answerEvent.questionId) {
      if (!p.answeredQuestionIds.includes(answerEvent.questionId)) {
        p.score += Number(answerEvent.pointsEarned) || 0;
        p.answeredQuestionIds.push(answerEvent.questionId);
        p.answeredCount = p.answeredQuestionIds.length;
        p.lastUpdated = Date.now();
        if (typeof missionPointCost === 'number') {
          p.missionPoints = Math.max(0, p.missionPoints - missionPointCost);
        }
        const recorded: PlayerAnswerEvent = {
          ...answerEvent,
          playerId: p.id,
          playerName: `${p.name} (${p.studentClass})`,
          playerTotalScoreAfter: p.score,
        };
        globalAnswerHistory.push(recorded);
        schedulePersistStateToDisk();
        broadcastToArena({ type: 'room:state', payload: serializeArena(arenaPin) });
      }
    } else if (answerEvent && answerEvent.questionId) {
      globalAnswerHistory.push(answerEvent);
      schedulePersistStateToDisk();
    }
    res.json({ ok: true, room: serializeArena(arenaPin) });
  });

  // Real-Time Chat Endpoint
  app.post('/api/room/chat', (req, res) => {
    const {
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

    arenaChatMessages.push(msg);
    if (arenaChatMessages.length > 60) {
      arenaChatMessages = arenaChatMessages.slice(-60);
    }

    const p = arenaPlayers.get(senderId);
    if (p) {
      p.lastChatText = cleanText;
      p.lastChatTime = msg.timestamp;
      p.lastUpdated = Date.now();
    }

    schedulePersistStateToDisk();
    broadcastToArena({ type: 'chat:message', payload: msg });
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
      pin || arenaPin,
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
    for (const p of arenaPlayers.values()) {
      if (!p.isRoamingPeer) continue;
      p.x += p.vx * 0.25;
      p.y += p.vy * 0.25;

      if (p.x < 320 || p.x > MAP_WIDTH - 320) p.vx *= -1;
      if (p.y < 260 || p.y > MAP_HEIGHT - 260) p.vy *= -1;
      p.x = Math.max(280, Math.min(MAP_WIDTH - 280, p.x));
      p.y = Math.max(240, Math.min(MAP_HEIGHT - 240, p.y));
      p.facingAngle = Math.atan2(p.vx, p.vy);
      p.lastUpdated = Date.now();

      broadcastToArena({
        type: 'player:moved',
        payload: {
          playerId: p.id,
          name: p.name,
          studentClass: p.studentClass,
          characterPreset: p.characterPreset,
          color: p.color,
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
          isRoamingPeer: true,
        },
      });
    }
  }, 250);

  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const { type, payload } = msg;

        if (type === 'room:create' || type === 'room:join') {
          const pin = normalizeRoomPin(payload.pin);
          arenaPin = pin;

          if (type === 'room:create' || payload.role === 'TEACHER') {
            if (payload.categoryFilter) {
              arenaCategoryFilter = payload.categoryFilter;
            }
          }
          if (arenaStatus === 'FINISHED') {
            arenaStatus = 'PLAYING';
          }

          const player = upsertPlayerInArena({
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

          clientPlayerMap.set(ws, { pin, playerId: payload.playerId });
          const serialized = serializeArena(pin);
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
          broadcastToArena({ type: 'room:state', payload: serialized });
        } else if (type === 'player:move') {
          let meta = clientPlayerMap.get(ws);
          const pid = String(payload?.playerId || meta?.playerId || '');
          if (!pid) return;
          if (!meta) {
            meta = { pin: normalizeRoomPin(payload?.pin || arenaPin), playerId: pid };
            clientPlayerMap.set(ws, meta);
          }

          let p = arenaPlayers.get(pid);
          if (!p) {
            p = upsertPlayerInArena({
              playerId: pid,
              playerName: payload.playerName,
              studentClass: payload.studentClass,
              characterPreset: payload.characterPreset,
              color: payload.color,
              x: payload.x,
              y: payload.y,
              vx: payload.vx,
              vy: payload.vy,
              facingAngle: payload.facingAngle,
              jumpY: payload.jumpY,
            });
          } else {
            if (payload.playerName) p.name = payload.playerName;
            if (payload.studentClass) p.studentClass = payload.studentClass;
            if (payload.characterPreset) p.characterPreset = payload.characterPreset;
            if (payload.color) p.color = payload.color;
            if (typeof payload.x === 'number' && !Number.isNaN(payload.x)) {
              p.x = Math.max(60, Math.min(MAP_WIDTH - 60, Number(payload.x)));
            }
            if (typeof payload.y === 'number' && !Number.isNaN(payload.y)) {
              p.y = Math.max(60, Math.min(MAP_HEIGHT - 60, Number(payload.y)));
            }
            p.vx = Number(payload.vx) || 0;
            p.vy = Number(payload.vy) || 0;
            if (typeof payload.facingAngle === 'number') {
              p.facingAngle = payload.facingAngle;
            }
            if (typeof payload.jumpY === 'number') {
              p.jumpY = payload.jumpY;
            }
            p.lastUpdated = Date.now();
          }

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

          broadcastToArena({
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
              isRoamingPeer: false,
            },
          });
        } else if (type === 'chat:send') {
          const meta = clientPlayerMap.get(ws);
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
          arenaChatMessages.push(chatMsg);
          if (arenaChatMessages.length > 60) {
            arenaChatMessages = arenaChatMessages.slice(-60);
          }
          const p = arenaPlayers.get(senderId);
          if (p) {
            p.lastChatText = cleanText;
            p.lastChatTime = chatMsg.timestamp;
            p.lastUpdated = Date.now();
          }
          schedulePersistStateToDisk();
          broadcastToArena({ type: 'chat:message', payload: chatMsg });
        } else if (type === 'versus:invite') {
          const meta = clientPlayerMap.get(ws);
          createVersusChallenge(
            payload?.pin || meta?.pin || arenaPin,
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
          const meta = clientPlayerMap.get(ws);
          const pid = String(
            payload?.playerId || payload?.answerEvent?.playerId || meta?.playerId || ''
          );
          const p = arenaPlayers.get(pid);
          if (!p) return;

          const answerEvent = payload.answerEvent as PlayerAnswerEvent;
          if (!answerEvent || !answerEvent.questionId) return;

          if (!p.answeredQuestionIds.includes(answerEvent.questionId)) {
            p.score += answerEvent.pointsEarned;
            p.answeredQuestionIds.push(answerEvent.questionId);
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
            globalAnswerHistory.push(recorded);
            schedulePersistStateToDisk();
            broadcastToArena({ type: 'room:state', payload: serializeArena(arenaPin) });
          }
        } else if (type === 'room:finish_game') {
          arenaStatus = 'FINISHED';
          schedulePersistStateToDisk();
          broadcastToArena({ type: 'room:state', payload: serializeArena(arenaPin) });
        } else if (type === 'room:start_game') {
          if (payload?.categoryFilter) {
            arenaCategoryFilter = payload.categoryFilter;
          }
          arenaStatus = 'PLAYING';
          schedulePersistStateToDisk();
          broadcastToArena({ type: 'room:state', payload: serializeArena(arenaPin) });
        }
      } catch {
        // Ignore malformed packets
      }
    });

    ws.on('close', () => {
      clientPlayerMap.delete(ws);
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
