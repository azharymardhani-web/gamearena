import React from 'react';
import { Flag, AlertTriangle, Users, Trophy, X, ShieldAlert, Check } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ConfirmFinishGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmFinish: () => void;
  roomPin: string;
  totalStudents: number;
  roomName?: string;
  remainingGameSec?: number | null;
}

export const ConfirmFinishGameModal: React.FC<ConfirmFinishGameModalProps> = ({
  isOpen,
  onClose,
  onConfirmFinish,
  roomPin,
  totalStudents,
  roomName,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    soundEngine.playVictoryFanfare();
    onConfirmFinish();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto overscroll-contain">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-rose-500/90 rounded-2xl shadow-2xl text-slate-100 flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-900 border-b border-rose-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Selesaikan Permainan Serentak
              </h2>
              <div className="text-xs text-rose-300 font-mono">
                Room Token: <strong>{roomPin}</strong> · {totalStudents} Siswa Aktif
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              Apakah Bapak yakin ingin mengakhiri sesi permainan/ujian di room{' '}
              <strong className="text-white font-mono">{roomPin}</strong>{' '}
              {roomName ? `(${roomName})` : ''} untuk{' '}
              <strong className="text-amber-300">{totalStudents} siswa</strong> secara serentak?
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Efek Penyelesaian Serentak:</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 pl-1">
              <li>
                Semua siswa yang sedang mengerjakan soal akan otomatis dihentikan dan jawaban tersimpan.
              </li>
              <li>
                Seluruh siswa diteleportasikan serentak ke podium tiang bendera lapangan upacara.
              </li>
              <li>
                Layar seluruh siswa akan otomatis membuka <strong>Papan Peringkat (Leaderboard)</strong> hasil akhir dengan mahkota 👑 bagi juara Rank 1.
              </li>
              <li>
                Bapak akan langsung diarahkan ke layar <strong>Analisis Butir Soal & Rekap Nilai</strong>.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 bg-slate-950 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Batal & Lanjutkan
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
          >
            <Flag className="w-4 h-4 fill-current shrink-0" />
            <span>Ya, Selesaikan Serentak Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
