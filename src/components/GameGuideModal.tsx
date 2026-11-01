import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Gamepad2,
  GraduationCap,
  Swords,
  Cpu,
  Building2,
  BarChart3,
  Keyboard,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { KELAS_7_CHAPTERS, KELAS_8_CHAPTERS } from '../data/informaticsData';

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'CARA_MAIN' | 'KONTROL' | 'GEDUNG_MATERI'>(
    'CARA_MAIN'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain touch-pan-y">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92dvh] bg-slate-900 border-2 border-emerald-500/60 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-mono font-extrabold text-amber-400 uppercase tracking-wider">
                PANDUAN RESMI · MTs NEGERI 14 JAKARTA TIMUR (HALIM PK)
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-white truncate">
                Petunjuk Permainan & Evaluasi Mandiri CBT 3D
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-rose-600 hover:text-white rounded-xl transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Tutup</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="shrink-0 flex flex-wrap items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('CARA_MAIN')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
              activeTab === 'CARA_MAIN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>1. Cara Bermain & Aturan Misi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('KONTROL')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
              activeTab === 'KONTROL'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>2. Kontrol Karakter (Laptop & HP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GEDUNG_MATERI')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
              activeTab === 'GEDUNG_MATERI'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>3. Peta Gedung & Kurikulum Bab 1–9</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-6 space-y-5 text-slate-200">
          {/* TAB 1: CARA BERMAIN & ATURAN MISI */}
          {activeTab === 'CARA_MAIN' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-sky-950/70 border border-emerald-500/40">
                <h3 className="text-sm sm:text-base font-extrabold text-emerald-300">
                  Tujuan Utama Permainan
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  Mengukur kemampuan Informatika siswa secara mandiri melalui eksplorasi kampus 3D{' '}
                  <strong>MTs Negeri 14 Jakarta Timur</strong>, pengerjaan soal berstandar{' '}
                  <strong>CBT/ANBK</strong> sesuai jenjang kelas (Kelas 7 atau Kelas 8), serta
                  kolaborasi & duel 1v1 bersama teman sekelas secara <em>real-time</em>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-sm">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center font-mono text-xs">
                      01
                    </span>
                    <span>Pilih Kelas, Karakter & Banyak Soal</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Masukkan <strong>Kode Room (MTN14)</strong>, isi nama lengkap, pilih kelas (
                    <strong>7A–7G, 8A–8H, atau 9A–9E</strong>), dan pilih banyaknya soal yang ingin
                    dikerjakan. Soal otomatis menyesuaikan kurikulum kelas yang kamu pilih.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-extrabold text-sm">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center font-mono text-xs">
                      02
                    </span>
                    <Cpu className="w-4 h-4 shrink-0" />
                    <span>Kumpulkan Komponen Hardware (+50 MP)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Kamu memulai permainan dengan <strong>100 Poin Misi (MP)</strong>. Berkelilinglah
                    di area sekolah untuk mengambil item perangkat keras (CPU, RAM, Router, Sensor)
                    yang memberikan tambahan <strong>+50 MP</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2.5 text-sky-400 font-extrabold text-sm">
                    <span className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/50 flex items-center justify-center font-mono text-xs">
                      03
                    </span>
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>Masuk Gedung & Jawab Soal CBT (-40 MP)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dekati pintu gedung dan tekan <strong>[E]</strong> untuk masuk ke dalam ruangan
                    (Lab Komputer, Masjid Al-Huda, Perpustakaan, dll.), atau temui{' '}
                    <strong>Pak Azhary Mardhani, S.Kom</strong> dan tekan <strong>[F]</strong> untuk
                    membuka lembar ujian CBT (biaya <strong>40 MP / soal</strong>).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2.5 text-rose-400 font-extrabold text-sm">
                    <span className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center font-mono text-xs">
                      04
                    </span>
                    <Swords className="w-4 h-4 shrink-0" />
                    <span>Duel Versus 1v1 & Chat Bubble 3D</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dekati teman sekelas dan tekan <strong>[V]</strong> (atau tombol{' '}
                    <strong>⚔️ Duel</strong>) untuk mengirim tantangan duel cepat 3 soal. Pemenang
                    mendapatkan <strong>+100 MP</strong> & <strong>+150 Skor</strong>! Gunakan juga{' '}
                    <strong>Chat Kelas</strong> untuk menampilkan balon pesan di atas kepala karakter.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-white">
                      Evaluasi & Analisis Kemampuan Mandiri
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Setelah selesai mengerjakan soal, klik tombol <strong>Analisis</strong> di
                      bawah layar untuk melihat Rapor Nilai Akhir (0–100), Predikat Kelulusan, dan
                      evaluasi pemahaman per bab secara jelas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KONTROL KARAKTER (LAPTOP/PC & HANDPHONE/TABLET) */}
          {activeTab === 'KONTROL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Keyboard / PC */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/40 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-extrabold text-sm border-b border-slate-800 pb-2.5">
                  <Keyboard className="w-4 h-4" />
                  <span>Kontrol Keyboard (Laptop / Komputer PC)</span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { key: 'W / A / S / D atau Panah', desc: 'Menggerakkan karakter 3D ke segala arah' },
                    { key: 'SPASI (Spacebar)', desc: 'Melompat (Jump) melewati rintangan' },
                    { key: 'SHIFT (Tahan)', desc: 'Lari Cepat (Sprint / Dash)' },
                    { key: 'Tombol [ E ]', desc: 'Masuk ke dalam ruangan gedung sekolah saat dekat pintu' },
                    { key: 'Tombol [ F ]', desc: 'Membuka Lembar Kerja CBT saat di dekat Pos Guru' },
                    { key: 'Tombol [ V ]', desc: 'Mengajak teman terdekat Duel Versus 1v1' },
                    { key: 'Tombol [ TAB ]', desc: 'Ganti mode Kamera 3D / Kamera Peta Penuh' },
                    { key: 'Tombol [ H ]', desc: 'Menyembunyikan / menampilkan panel menu bawah' },
                    { key: 'Tombol [ P ]', desc: 'Membuka / menutup jendela Petunjuk Permainan ini' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800"
                    >
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-sky-500/50 font-mono font-extrabold text-sky-300 shrink-0">
                        {item.key}
                      </span>
                      <span className="text-slate-300 text-right">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Touchscreen / Mobile */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm border-b border-slate-800 pb-2.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Kontrol Layar Sentuh (Handphone / Tablet)</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-extrabold text-emerald-300">
                      1. Analog Joystick Virtual (Kiri Bawah)
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Sentuh dan geser lingkaran analog di kiri bawah layar untuk mengarahkan
                      pergerakan karaktermu di Kampus MTsN 14.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-extrabold text-amber-300">
                      2. Tombol LOMPAT & LARI (Kanan Bawah)
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Ketuk tombol <strong>LOMPAT</strong> untuk melompat dan tahan tombol{' '}
                      <strong>LARI</strong> untuk berlari lebih cepat.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-extrabold text-sky-300">
                      3. Tombol Interaksi Otomatis (Tengah Bawah)
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Saat mendekati pintu gedung, Pos Guru, atau teman sekelas, tombol{' '}
                      <strong>Masuk Ruangan</strong>, <strong>Jawab Soal</strong>, atau{' '}
                      <strong>Ajak Duel</strong> akan muncul otomatis untuk diketuk.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-extrabold text-rose-300">
                      4. Daftar Teman Online & Teleport Cepat
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Ketuk jumlah siswa online di bar atas untuk membuka daftar teman, lalu ketuk{' '}
                      <strong>Hampiri</strong> untuk langsung berpindah ke sebelah temanmu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PETA GEDUNG & KURIKULUM BAB 1-9 */}
          {activeTab === 'GEDUNG_MATERI' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  {
                    building: '1. Gedung Utama & Ruang Guru',
                    chapters: 'Bab 1 & Bab 3 (Informatika & TIK)',
                    color: 'border-emerald-500/50 text-emerald-300',
                  },
                  {
                    building: '2. Lab Komputer & Multimedia',
                    chapters: 'Bab 4 & Bab 7 (Sistem Komputer & Pemrograman)',
                    color: 'border-sky-500/50 text-sky-300',
                  },
                  {
                    building: '3. Masjid Al - Huda MTsN 14',
                    chapters: 'Bab 8 (Dampak Sosial & Etika Digital)',
                    color: 'border-amber-500/50 text-amber-300',
                  },
                  {
                    building: '4. Gedung Kelas 7-8-9 & Perpustakaan',
                    chapters: 'Bab 2 (Berpikir Komputasional)',
                    color: 'border-indigo-500/50 text-indigo-300',
                  },
                  {
                    building: '5. Aula Serbaguna & UKS',
                    chapters: 'Bab 6 & Bab 9 (Analisis Data & Praktik Lintas Bidang)',
                    color: 'border-rose-500/50 text-rose-300',
                  },
                  {
                    building: '6. Gerbang Jl. Elang & Kantin Digital',
                    chapters: 'Bab 5 (Jaringan Komputer & Internet)',
                    color: 'border-teal-500/50 text-teal-300',
                  },
                ].map((z) => (
                  <div
                    key={z.building}
                    className={`p-3 rounded-xl bg-slate-950 border ${z.color} space-y-1`}
                  >
                    <div className="text-xs font-extrabold text-white">{z.building}</div>
                    <div className="text-[11px] font-mono">{z.chapters}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
                  <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                    Daftar Bab Materi Kelas 7 (7A – 7G)
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {KELAS_7_CHAPTERS.map((c) => (
                      <li key={c} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{c} (20 Soal)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-sky-500/40 space-y-2">
                  <div className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                    Daftar Bab Materi Kelas 8 (8A – 8H)
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {KELAS_8_CHAPTERS.map((c) => (
                      <li key={c} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{c} (20 Soal)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/50 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-200 leading-relaxed">
                  <strong className="text-amber-300 block">
                    Panduan Khusus Guru Pengampu (Azhary Mardhani, S.Kom):
                  </strong>
                  Gunakan tab <strong>Guru</strong> untuk mengaktifkan/menonaktifkan{' '}
                  <strong>Bab Materi (ON / OFF)</strong> yang akan dimainkan siswa, memilih{' '}
                  <strong>Banyaknya Soal Ujian</strong> (5 s.d. 50 soal atau semua soal), serta
                  memantau hasil analisis kemampuan seluruh siswa secara langsung.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tekan tombol [P] kapan saja di dalam permainan untuk membuka petunjuk ini.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-colors"
          >
            Mengerti & Siap Bermain
          </button>
        </div>
      </div>
    </div>
  );
};
