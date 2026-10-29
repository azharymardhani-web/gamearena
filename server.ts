import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'path';
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
  score: number;
  missionPoints: number;
  collectedItemsCount: number;
  answeredCount: number;
  streak: number;
  hp: number;
  currentSector: OptionKey | null;
  lockedOption: OptionKey | null;
  lockTimeMs: number | null;
  lastUpdated: number;
  isRoamingPeer?: boolean;
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
}

export const MAP_WIDTH = 2400;
export const MAP_HEIGHT = 1500;

let materialsStore: InformaticsMaterial[] = [...INITIAL_MATERIALS];
let questionsStore: InformaticsQuestion[] = [...INITIAL_QUESTIONS];
let globalAnswerHistory: PlayerAnswerEvent[] = [];
const rooms = new Map<string, ClassroomRoom>();

// Seed roaming MTsN 14 classmates on the open-world map so any student walking around can meet & Versus them
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
    name: 'Aldo Pratama',
    studentClass: 'Kelas 8A',
    characterPreset: 'bima_rider',
    color: '#f59e0b',
    x: 820,
    y: 520,
    vx: 65,
    vy: 35,
  },
  {
    id: 'peer-nabila',
    name: 'Nabila Putri',
    studentClass: 'Kelas 8B',
    characterPreset: 'nadia_tech',
    color: '#0ea5e9',
    x: 1580,
    y: 540,
    vx: -55,
    vy: 45,
  },
  {
    id: 'peer-farhan',
    name: 'Farhan Syahputra',
    studentClass: 'Kelas 9A',
    characterPreset: 'dimas_hacker',
    color: '#10b981',
    x: 920,
    y: 980,
    vx: 60,
    vy: -40,
  },
  {
    id: 'peer-salma',
    name: 'Salma Azzahra',
    studentClass: 'Kelas 7A',
    characterPreset: 'siti_crypto',
    color: '#f43f5e',
    x: 1520,
    y: 960,
    vx: -60,
    vy: -50,
  },
];

function createRoomWithPeers(
  pin: string,
  roomName: string,
  teacherName: string,
  hostId: string,
  categoryFilter = 'Semua Materi'
): ClassroomRoom {
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
      score: 150,
      missionPoints: 100,
      collectedItemsCount: 2,
      answeredCount: 1,
      streak: 1,
      hp: 100,
      currentSector: null,
      lockedOption: null,
      lockTimeMs: null,
      lastUpdated: Date.now(),
      isRoamingPeer: true,
    });
  }

  return {
    pin,
    roomName,
    teacherName,
    hostId,
    status: 'PLAYING',
    categoryFilter,
    currentQuestionIndex: 0,
    questionStartTime: Date.now(),
    timeLeftSec: 60,
    players: playersMap,
    answers: [],
    activeQuestionIds: questionsStore.map((q) => q.id),
  };
}

function ensureDefaultRoom(): ClassroomRoom {
  let defaultRoom = rooms.get('MTN14');
  if (!defaultRoom) {
    defaultRoom = createRoomWithPeers(
      'MTN14',
      'Distrik Open-World MTsN 14 Jakarta',
      'Azhary Mardhani, S.Kom',
      'teacher-default',
      'Semua Materi'
    );
    rooms.set('MTN14', defaultRoom);
  }
  return defaultRoom;
}

ensureDefaultRoom();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  app.get('/api/bootstrap', (_req, res) => {
    ensureDefaultRoom();
    const activeRooms = Array.from(rooms.values()).map((r) => ({
      pin: r.pin,
      roomName: r.roomName,
      teacherName: r.teacherName,
      status: r.status,
      studentCount: Array.from(r.players.values()).filter((p) => p.role === 'STUDENT').length,
      totalPlayers: r.players.size,
      categoryFilter: r.categoryFilter,
    }));

    res.json({
      teacher: {
        name: 'Azhary Mardhani, S.Kom',
        school: 'MTs Negeri 14 Jakarta',
        subject: 'Informatika (Kurikulum Merdeka)',
      },
      materials: materialsStore,
      questions: questionsStore,
      activeRooms,
      recentAnswersCount: globalAnswerHistory.length,
    });
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
    res.json({ materials: materialsStore });
  });

  app.delete('/api/materials/:id', (req, res) => {
    materialsStore = materialsStore.filter((m) => m.id !== req.params.id);
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
    res.json({ questions: questionsStore });
  });

  app.delete('/api/questions/:id', (req, res) => {
    if (questionsStore.length <= 3) {
      res.status(400).json({ error: 'Minimal harus terdapat 3 butir soal di dalam bank soal.' });
      return;
    }
    questionsStore = questionsStore.filter((q) => q.id !== req.params.id);
    res.json({ questions: questionsStore });
  });

  app.post('/api/sessions/record', (req, res) => {
    const { answers } = req.body as { answers: PlayerAnswerEvent[] };
    if (Array.isArray(answers)) {
      globalAnswerHistory.push(...answers);
      if (globalAnswerHistory.length > 1000) {
        globalAnswerHistory = globalAnswerHistory.slice(-1000);
      }
    }
    res.json({ ok: true, totalRecorded: globalAnswerHistory.length });
  });

  // WebSocket Server for Open-World 1-Map Classroom
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clientRoomMap = new Map<WebSocket, { pin: string; playerId: string }>();

  function getFilteredQuestions(categoryFilter: string): InformaticsQuestion[] {
    if (!categoryFilter || categoryFilter === 'Semua Materi') return questionsStore;
    const filtered = questionsStore.filter((q) => q.category === categoryFilter);
    return filtered.length > 0 ? filtered : questionsStore;
  }

  function serializeRoom(room: ClassroomRoom) {
    const qs = getFilteredQuestions(room.categoryFilter);
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
      players: Array.from(room.players.values()),
      answers: room.answers,
    };
  }

  function broadcastToRoom(pin: string, payload: unknown) {
    const message = JSON.stringify(payload);
    for (const [client, meta] of clientRoomMap.entries()) {
      if (meta.pin === pin && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  // Roaming classmates patrol loop along the open-world streets (every 250ms)
  setInterval(() => {
    for (const room of rooms.values()) {
      let movedAny = false;
      for (const p of room.players.values()) {
        if (!p.isRoamingPeer) continue;
        p.x += p.vx * 0.25;
        p.y += p.vy * 0.25;

        if (p.x < 320 || p.x > MAP_WIDTH - 320) p.vx *= -1;
        if (p.y < 260 || p.y > MAP_HEIGHT - 260) p.vy *= -1;
        p.x = Math.max(280, Math.min(MAP_WIDTH - 280, p.x));
        p.y = Math.max(240, Math.min(MAP_HEIGHT - 240, p.y));
        movedAny = true;

        broadcastToRoom(room.pin, {
          type: 'player:moved',
          payload: {
            playerId: p.id,
            x: Math.round(p.x),
            y: Math.round(p.y),
            vx: p.vx,
            vy: p.vy,
            score: p.score,
            missionPoints: p.missionPoints,
            collectedItemsCount: p.collectedItemsCount,
            answeredCount: p.answeredCount,
          },
        });
      }
      if (movedAny) {
        // Keep peers alive
      }
    }
  }, 250);

  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const { type, payload } = msg;

        if (type === 'room:create') {
          const rawPin = String(payload.pin || '')
            .trim()
            .toUpperCase();
          const pin =
            rawPin.length >= 4
              ? rawPin
              : `14${Math.floor(100 + Math.random() * 900)}`;

          const existing = rooms.get(pin);
          const room: ClassroomRoom =
            existing ||
            createRoomWithPeers(
              pin,
              payload.roomName || `Distrik MTsN 14 (${pin})`,
              payload.teacherName || 'Azhary Mardhani, S.Kom',
              payload.playerId,
              payload.categoryFilter || 'Semua Materi'
            );

          room.hostId = payload.playerId;
          room.categoryFilter = payload.categoryFilter || room.categoryFilter;

          room.players.set(payload.playerId, {
            id: payload.playerId,
            name: payload.playerName || 'Pak Azhary Mardhani, S.Kom',
            studentClass: 'Guru Host',
            role: 'TEACHER',
            characterPreset: payload.characterPreset || 'cj_rizky',
            color: '#38bdf8',
            x: MAP_WIDTH / 2,
            y: MAP_HEIGHT / 2 + 90,
            vx: 0,
            vy: 0,
            score: 0,
            missionPoints: 500,
            collectedItemsCount: 0,
            answeredCount: 0,
            streak: 0,
            hp: 100,
            currentSector: null,
            lockedOption: null,
            lockTimeMs: null,
            lastUpdated: Date.now(),
          });

          rooms.set(pin, room);
          clientRoomMap.set(ws, { pin, playerId: payload.playerId });
          ws.send(JSON.stringify({ type: 'room:joined', payload: serializeRoom(room) }));
          broadcastToRoom(pin, { type: 'room:state', payload: serializeRoom(room) });
        } else if (type === 'room:join') {
          const pin = String(payload.pin || '')
            .trim()
            .toUpperCase();
          const room = rooms.get(pin);
          if (!room) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: {
                  message: `Kode Room "${pin}" tidak ditemukan. Pastikan kode sesuai dengan layar Guru (contoh: MTN14).`,
                },
              })
            );
            return;
          }

          const idx = room.players.size;
          const angle = (idx * 137.5 * Math.PI) / 180;
          const radius = 110 + (idx % 5) * 35;
          const spawnX = Math.round(MAP_WIDTH / 2 + Math.cos(angle) * radius);
          const spawnY = Math.round(MAP_HEIGHT / 2 + Math.sin(angle) * radius);

          const student: ClassMapPlayer = {
            id: payload.playerId,
            name: payload.playerName || `Siswa ${idx + 1}`,
            studentClass: payload.studentClass || 'Kelas 8A',
            role: payload.role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
            characterPreset: payload.characterPreset || 'cj_rizky',
            color: payload.color || '#0ea5e9',
            x: spawnX,
            y: spawnY,
            vx: 0,
            vy: 0,
            score: 0,
            missionPoints: 100, // Initial Mission Points so student can answer 1st Teacher Question or collect items
            collectedItemsCount: 0,
            answeredCount: 0,
            streak: 0,
            hp: 100,
            currentSector: null,
            lockedOption: null,
            lockTimeMs: null,
            lastUpdated: Date.now(),
          };

          room.players.set(payload.playerId, student);
          clientRoomMap.set(ws, { pin, playerId: payload.playerId });
          ws.send(JSON.stringify({ type: 'room:joined', payload: serializeRoom(room) }));
          broadcastToRoom(pin, { type: 'room:state', payload: serializeRoom(room) });
        } else if (type === 'player:move') {
          const meta = clientRoomMap.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.pin);
          if (!room) return;
          const p = room.players.get(meta.playerId);
          if (!p) return;

          p.x = Math.max(60, Math.min(MAP_WIDTH - 60, Number(payload.x) || p.x));
          p.y = Math.max(60, Math.min(MAP_HEIGHT - 60, Number(payload.y) || p.y));
          p.vx = Number(payload.vx) || 0;
          p.vy = Number(payload.vy) || 0;
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

          broadcastToRoom(meta.pin, {
            type: 'player:moved',
            payload: {
              playerId: p.id,
              x: p.x,
              y: p.y,
              vx: p.vx,
              vy: p.vy,
              score: p.score,
              missionPoints: p.missionPoints,
              collectedItemsCount: p.collectedItemsCount,
              answeredCount: p.answeredCount,
            },
          });
        } else if (type === 'player:answer_teacher_question') {
          const meta = clientRoomMap.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.pin);
          if (!room) return;
          const p = room.players.get(meta.playerId);
          if (!p) return;

          const answerEvent = payload.answerEvent as PlayerAnswerEvent;
          if (!answerEvent || !answerEvent.questionId) return;

          // Idempotent check per player + question
          const existingIdx = room.answers.findIndex(
            (a) => a.questionId === answerEvent.questionId && a.playerId === p.id
          );
          if (existingIdx === -1) {
            p.score += answerEvent.pointsEarned;
            p.answeredCount += 1;
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
          broadcastToRoom(meta.pin, { type: 'room:state', payload: serializeRoom(room) });
        } else if (type === 'room:finish_game') {
          const meta = clientRoomMap.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.pin);
          if (!room) return;
          room.status = 'FINISHED';
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
          room.answers = [];
          for (const p of room.players.values()) {
            if (!p.isRoamingPeer) {
              p.score = 0;
              p.missionPoints = 100;
              p.collectedItemsCount = 0;
              p.answeredCount = 0;
            }
          }
          broadcastToRoom(meta.pin, { type: 'room:state', payload: serializeRoom(room) });
        }
      } catch {
        // Ignore malformed packets
      }
    });

    ws.on('close', () => {
      const meta = clientRoomMap.get(ws);
      if (meta) {
        const room = rooms.get(meta.pin);
        if (room) {
          room.players.delete(meta.playerId);
          broadcastToRoom(meta.pin, { type: 'room:state', payload: serializeRoom(room) });
        }
        clientRoomMap.delete(ws);
      }
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
    console.log(`Siber Arena 14 Open-World Server running on http://localhost:${PORT}`);
  });
}

startServer();
