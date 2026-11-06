import React from 'react';
import { MapPlayerEntity } from './CyberArenaCanvas';
import { soundEngine } from '../utils/soundEngine';
import {
  Trophy,
  Award,
  Crown,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Users,
  LogOut,
  Flag,
} from 'lucide-react';

interface CompletionCeremonyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAnalysis: () => void;
  onResetAndLeave?: () => void;
  players: MapPlayerEntity[];
  localPlayerId: string;
  localPlayerName: string;
  localPlayerClass: string;
  localScore: number;
  missionPoints: number;
  totalQuestions: number;
}

export const CompletionCeremonyModal: React.FC<CompletionCeremonyModalProps> = ({
  isOpen,
  onClose,
  onOpenAnalysis,
  onResetAndLeave,
  players,
  localPlayerId,
  localPlayerName,
  localPlayerClass,
  localScore,
  missionPoints,
  totalQuestions,
}) => {
  if (!isOpen) return null;

  // Sort all room players by score descending
  const rankedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // Ensure local player is included if missing
  if (!rankedPlayers.some((p) => p.id === localPlayerId)) {
    rankedPlayers.push({
      id: localPlayerId,
      name: localPlayerName || 'Siswa MTsN 14',
      studentClass: localPlayerClass || 'Kelas 7',
      role: 'STUDENT',
      color: '#38bdf8',
      x: 1200,
      y: 480,
      vx: 0,
      vy: 0,
      score: localScore,
      missionPoints,
      streak: 0,
      hp: 100,
      currentSector: null,
      lockedOption: null,
    });
    rankedPlayers.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  const myRankIndex = rankedPlayers.findIndex((p) => p.id === localPlayerId);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : 1;

  const rank1Player = rankedPlayers[0] || {
    name: localPlayerName,
    studentClass: localPlayerClass,
    score: localScore,
    missionPoints,
  };
  const rank2Player = rankedPlayers[1] || null;
  const rank3Player = rankedPlayers[2] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain touch-pan-y">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-400 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col">
        {/* Ceremonial Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 font-sans border-b-4 border-amber-300 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/20 border border-slate-950/30 text-xs font-mono font-black tracking-wider uppercase mb-1">
            <Flag className="w-4 h-4 text-amber-950" />
            <span>UPACARA SELEBRASI TIANG BENDERA MTsN 14</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight uppercase drop-shadow">
            🏆 SELAMAT! KAMU TELAH SELESAI CBT!
          </h2>

          <p className="text-xs sm:text-sm font-extrabold text-slate-900/90 max-w-lg mx-auto mt-1">
            Seluruh {totalQuestions} butir soal telah berhasil kamu jawab. Karakter 3D kamu kini berdiri di depan Tiang Bendera bersama teman sekelas!
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* User Score & Rank Summary Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border-2 border-amber-500/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-mono font-black text-xl shrink-0">
                #{myRank}
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                  HASIL AKHIR KAMU
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white">
                  {localPlayerName} ({localPlayerClass})
                </div>
                <div className="text-xs text-slate-300">
                  Total Skor: <strong className="text-emerald-400 font-mono">${localScore}</strong> · Poin Misi: <strong className="text-amber-300 font-mono">{missionPoints} MP</strong>
                </div>
              </div>
            </div>

            {myRank === 1 ? (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black flex items-center gap-1.5 animate-pulse">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>JUARA 1 - MAHKOTA EMAS 👑</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold font-mono">
                Peringkat Ke-{myRank} dari {rankedPlayers.length} Siswa
              </div>
            )}
          </div>

          {/* 3D Flagpole Podium Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-extrabold text-amber-400 uppercase">
              <span>👑 LEADERBOARD 3D TIANG BENDERA MERAH PUTIH:</span>
              <span>{rankedPlayers.length} Peserta</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
              {/* Rank 2 - Silver */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-400/40 text-center space-y-1 sm:order-1 order-2">
                <div className="text-xs font-mono font-black text-slate-300">🥈 RANK #2</div>
                <div className="text-xs font-extrabold text-white truncate">
                  {rank2Player ? rank2Player.name : '—'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {rank2Player ? rank2Player.studentClass : ''}
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {rank2Player ? `$${rank2Player.score}` : '-'}
                </div>
              </div>

              {/* Rank 1 - Gold Crown */}
              <div className="p-4 rounded-2xl bg-amber-950/60 border-2 border-amber-400 text-center space-y-1 sm:order-2 order-1 transform sm:-translate-y-2 shadow-xl shadow-amber-950/50">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-black uppercase">
                  <Crown className="w-3.5 h-3.5" />
                  <span>RANK #1 MAHKOTA</span>
                </div>
                <div className="text-sm font-black text-amber-200 truncate">
                  {rank1Player.name}
                </div>
                <div className="text-xs text-amber-400/90 truncate font-semibold">
                  {rank1Player.studentClass}
                </div>
                <div className="text-sm font-mono font-black text-emerald-300">
                  ${rank1Player.score}
                </div>
              </div>

              {/* Rank 3 - Bronze */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-700/40 text-center space-y-1 order-3">
                <div className="text-xs font-mono font-black text-amber-600">🥉 RANK #3</div>
                <div className="text-xs font-extrabold text-white truncate">
                  {rank3Player ? rank3Player.name : '—'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {rank3Player ? rank3Player.studentClass : ''}
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {rank3Player ? `$${rank3Player.score}` : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Full Classmates Leaderboard List */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="text-xs font-mono font-bold text-slate-400 flex items-center justify-between">
              <span>DAFTAR NILAI SEKELAS (REALTIME):</span>
              <span className="text-emerald-400 font-semibold">Kunci Jawaban & Analisis Terbuka</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {rankedPlayers.map((player, idx) => {
                const isMe = player.id === localPlayerId;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border ${
                      idx === 0
                        ? 'bg-amber-950/50 border-amber-500/70 text-amber-200 font-bold'
                        : isMe
                        ? 'bg-sky-950/60 border-sky-500/70 text-sky-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-black w-6 text-center text-amber-400 shrink-0">
                        {idx === 0 ? '👑' : `#${idx + 1}`}
                      </span>
                      <span className="truncate">
                        {player.name} <span className="text-[10px] opacity-75">({player.studentClass})</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono font-extrabold shrink-0">
                      <span className="text-emerald-400">${player.score}</span>
                      <span className="text-amber-300 text-[11px]">{player.missionPoints} MP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              <span>Selebrasi 3D</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playVictoryFanfare();
                onOpenAnalysis();
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analisis Soal</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                if (onResetAndLeave) onResetAndLeave();
                else onClose();
              }}
              className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar & Mulai Ulang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
