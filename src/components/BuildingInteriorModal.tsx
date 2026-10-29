import React, { useState } from 'react';
import { TeacherPostLocation } from './CyberArenaCanvas';
import { soundEngine } from '../utils/soundEngine';
import {
  X,
  LogOut,
  Sparkles,
  Monitor,
  Server,
  BookOpen,
  GraduationCap,
  Award,
  Wifi,
  Cpu,
  Coffee,
  HeartPulse,
  Shield,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  Tv,
  Radio,
  BookMarked,
  Volume2,
} from 'lucide-react';

interface BuildingInteriorModalProps {
  building: TeacherPostLocation;
  onClose: () => void;
  onStartTeacherQuiz: () => void;
}

export const BuildingInteriorModal: React.FC<BuildingInteriorModalProps> = ({
  building,
  onClose,
  onStartTeacherQuiz,
}) => {
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const [interactedItems, setInteractedItems] = useState<Set<string>>(new Set());
  const [activeItemToast, setActiveItemToast] = useState<string | null>(null);

  const handleItemInteract = (itemId: string, itemTitle: string, itemDesc: string) => {
    soundEngine.playPickupData();
    setInteractedItems((prev) => new Set(prev).add(itemId));
    setActiveItemToast(`[INTERAKSI] ${itemTitle}: ${itemDesc}`);
    setTimeout(() => setActiveItemToast(null), 4500);
  };

  // Content configuration for each of the 6 school buildings
  const getBuildingInteriorData = (index: number) => {
    switch (index) {
      case 0:
        // GEDUNG UTAMA MTsN 14
        return {
          themeColor: 'amber',
          badgeText: 'PUSAT ADMINISTRASI & RUANG GURU',
          headerTitle: 'Gedung Utama MTs Negeri 14 Jakarta Timur',
          headerSubtitle: 'Kampus Halim Perdanakusuma · Ruang Guru & Kepala Madrasah',
          rooms: [
            {
              name: 'Ruang Guru & Meja Pak Azhary',
              icon: GraduationCap,
              bgStyle: 'from-amber-950/80 via-slate-900 to-amber-900/40',
              description:
                'Ruang utama guru Informatika dan mata pelajaran Kurikulum Merdeka. Dilengkapi pendingin udara, jaringan LAN gigabit, dan papan jadwal kegiatan.',
              items: [
                {
                  id: 'g0-1',
                  title: 'Meja Kerja Pak Azhary Mardhani, S.Kom',
                  subtitle: 'Guru Informatika MTsN 14',
                  detail:
                    'Laptop kerja dengan software modul ajar Informatika 2026, lembar kisi-kisi asesmen CTT, dan cangkir kopi favorit.',
                  icon: Monitor,
                },
                {
                  id: 'g0-2',
                  title: 'Papan Modul Kurikulum Merdeka',
                  subtitle: 'Target Pembelajaran Sistem Komputer & Jaringan',
                  detail:
                    'Memuat alur tujuan pembelajaran (ATP) Informatika Kelas 7, 8, dan 9 MTsN 14 Jakarta Timur.',
                  icon: BookOpen,
                },
                {
                  id: 'g0-3',
                  title: 'Router Wi-Fi Utama Kantor',
                  subtitle: 'Akses Poin Ruang Guru',
                  detail:
                    'Dual-band Wi-Fi 6 khusus jaringan guru dan absensi siswa terhubung langsung ke Server MTsN 14.',
                  icon: Wifi,
                },
              ],
            },
            {
              name: 'Ruang Kepala Madrasah & Rapat',
              icon: Award,
              bgStyle: 'from-yellow-950/80 via-slate-900 to-amber-950/40',
              description: 'Ruang pertemuan VIP pimpinan madrasah, kepala tata usaha, dan komite sekolah.',
              items: [
                {
                  id: 'g0-4',
                  title: 'Lemari Piala & Wall of Honor',
                  subtitle: 'Trofi Juara OSN & Robotika Kemenag',
                  detail:
                    'Koleksi trofi Lomba Informatika, KSN Komputer, dan Kompetisi Robotika Madrasah Tingkat DKI Jakarta.',
                  icon: Award,
                },
                {
                  id: 'g0-5',
                  title: 'Meja Rapat Oval & Smart TV',
                  subtitle: 'Fasilitas Konferensi Digital',
                  detail: 'Layar presentasi interaktif untuk rapat evaluasi semester dan pengadaan alat lab.',
                  icon: Tv,
                },
              ],
            },
          ],
        };

      case 1:
        // LAB KOMPUTER & MULTIMEDIA
        return {
          themeColor: 'sky',
          badgeText: 'LABORATORIUM KOMPUTER & CYBER',
          headerTitle: 'Lab Komputer & Multimedia MTsN 14',
          headerSubtitle: 'Fasilitas Praktikum Coding, Jaringan & Keamanan Siber',
          rooms: [
            {
              name: 'Area Workstation PC Siswa',
              icon: Monitor,
              bgStyle: 'from-sky-950/80 via-slate-900 to-blue-900/40',
              description: '36 unit PC workstation Core i7 DDR5 dengan monitor Full HD untuk praktikum siswa.',
              items: [
                {
                  id: 'g1-1',
                  title: 'Workstation PC Client #12',
                  subtitle: 'Perangkat Praktikum Siswa',
                  detail:
                    'Terinstall Python 3.12, Scratch 3.0, Cisco Packet Tracer, dan Environment Pembelajaran Siber 3D.',
                  icon: Cpu,
                },
                {
                  id: 'g1-2',
                  title: 'Papan Tulis Interaktif & Proyektor',
                  subtitle: 'Media Dosen/Guru',
                  detail:
                    'Menampilkan diagram logika gerbang AND/OR/NOT serta struktur logika percabangan IF-ELSE.',
                  icon: Tv,
                },
                {
                  id: 'g1-3',
                  title: 'Station headset VR & IoT Microcontroller',
                  subtitle: 'Modul IoT & Kriptografi',
                  detail: 'Kit praktikum Arduino, ESP32, sensor suhu, dan simulator VR jaringan komputer.',
                  icon: Sparkles,
                },
              ],
            },
            {
              name: 'Ruang Server & Core Network',
              icon: Server,
              bgStyle: 'from-blue-950/80 via-slate-900 to-cyan-950/40',
              description: 'Pusat data server lokal MTsN 14 Halim dengan switch manageable 48-port.',
              items: [
                {
                  id: 'g1-4',
                  title: 'Rack Server Blade MTsN 14',
                  subtitle: 'Server Database & Asesmen',
                  detail:
                    'Menyimpan database lokal nilai siswa, sistem e-learning, dan broker komunikasi multiplayer arena 3D.',
                  icon: Server,
                },
                {
                  id: 'g1-5',
                  title: 'Switch Managed Gigabit & Firewall Hardware',
                  subtitle: 'Keamanan Jaringan Komputer',
                  detail:
                    'Melindungi trafik data sekolah dari serangan malware, virus, dan menyaring konten berbahaya.',
                  icon: Shield,
                },
              ],
            },
          ],
        };

      case 2:
        // MASJID AL - HUDA
        return {
          themeColor: 'emerald',
          badgeText: 'TEMPAT IBADAH & ROCHANI',
          headerTitle: 'Masjid Al - Huda MTsN 14 Halim',
          headerSubtitle: 'Pusat Kegiatan Keagamaan, Sholat Berjamaah & Kajian Karakter',
          rooms: [
            {
              name: 'Ruang Utama Sholat & Serambi',
              icon: Sparkles,
              bgStyle: 'from-emerald-950/80 via-slate-900 to-teal-900/40',
              description:
                'Ruang ibadah yang sejuk dan khusyuk berkapasitas 500 jamaah dengan karpet sajadah hijau tebal.',
              items: [
                {
                  id: 'g2-1',
                  title: 'Mihrab Kaligrafi Emas & Mimbar Jati',
                  subtitle: 'Area Khutbah & Pengimaman',
                  detail: 'Dinding ukiran kaligrafi Arab indah bertuliskan Ayat Kursi dan Asmaul Husna.',
                  icon: Sparkles,
                },
                {
                  id: 'g2-2',
                  title: 'Rak Al-Qur\'an & Kitab Kajian',
                  subtitle: 'Perpustakaan Masjid Al - Huda',
                  detail: 'Koleksi Mushaf Al-Qur\'an, buku tajwid, dan literatur akhlak untuk siswa MTsN 14.',
                  icon: BookMarked,
                },
                {
                  id: 'g2-3',
                  title: 'Amplifier & Central Audio Sound System',
                  subtitle: 'Pengeras Suara Adzan & Doa',
                  detail:
                    'Menyebarkan lantunan adzan, jadwal dzikir pagi, dan pengumuman kegiatan keagamaan sekolah.',
                  icon: Radio,
                },
              ],
            },
            {
              name: 'Area Menara & Tempat Wudhu',
              icon: Layers,
              bgStyle: 'from-teal-950/80 via-slate-900 to-emerald-950/40',
              description: 'Tempat wudhu bersih dengan kran air mengalir lancar dan akses ke tangga menara masjid.',
              items: [
                {
                  id: 'g2-4',
                  title: 'Situs Menara Masjid Al - Huda',
                  subtitle: 'Menara Kotak Hijau Muda 26 Meter',
                  detail: 'Menara ikonik tempat speaker adzan dan pemandangan indah seluruh kampus MTsN 14 Halim.',
                  icon: Radio,
                },
              ],
            },
          ],
        };

      case 3:
        // GEDUNG KELAS & PERPUS
        return {
          themeColor: 'rose',
          badgeText: 'RUANG BELAJAR & LITERASI DIGITAL',
          headerTitle: 'Gedung Kelas 7, 8, 9 & Perpustakaan',
          headerSubtitle: 'Pusat Pembelajaran Ruang Kelas & Koleksi Buku Digital',
          rooms: [
            {
              name: 'Ruang Kelas Digital 8A',
              icon: BookOpen,
              bgStyle: 'from-rose-950/80 via-slate-900 to-pink-900/40',
              description: 'Ruang kelas ber-AC dengan susunan meja fleksibel untuk pembelajaran kolaboratif.',
              items: [
                {
                  id: 'g3-1',
                  title: 'Smart TV Display 65 inchi',
                  subtitle: 'Papan Digital Kelas',
                  detail: 'Menampilkan presentasi kelompok siswa, video pembelajaran, dan kuis interaktif.',
                  icon: Tv,
                },
                {
                  id: 'g3-2',
                  title: 'Majalah Dinding (Mading) Informatika',
                  subtitle: 'Karya Kreatif Siswa Kelas 8',
                  detail: 'Poster etika ber-internet (Netiquette), poster pencegahan cyberbullying, dan komik coding.',
                  icon: BookOpen,
                },
              ],
            },
            {
              name: 'Perpustakaan & Pojok Baca',
              icon: BookMarked,
              bgStyle: 'from-pink-950/80 via-slate-900 to-rose-950/40',
              description: 'Perpustakaan akreditasi A dengan ribuan koleksi cetak dan tablet e-reader.',
              items: [
                {
                  id: 'g3-3',
                  title: 'Rak Buku Seri Informatika & AI',
                  subtitle: 'Buku Pegangan Siswa',
                  detail: 'Buku Algoritma Pemrograman, Berpikir Komputasional, Analisis Data, dan Dampak Sosial Informatika.',
                  icon: BookMarked,
                },
                {
                  id: 'g3-4',
                  title: 'Pojok Baca Lesehan & Tablet E-Book',
                  subtitle: 'Literasi Digital MTsN 14',
                  detail: 'Area nyaman berkarpet empuk bagi siswa yang membaca jurnal dan komik edukasi siber.',
                  icon: BookOpen,
                },
              ],
            },
          ],
        };

      case 4:
        // AULA SERBAGUNA & UKS
        return {
          themeColor: 'purple',
          badgeText: 'AULA UTAMA & HEALTH CENTER',
          headerTitle: 'Aula Serbaguna & UKS MTsN 14 Halim',
          headerSubtitle: 'Gedung Kegiatan Ekstrakurikuler, Pensi & Layanan Kesehatan Siswa',
          rooms: [
            {
              name: 'Panggung & Lapangan Indoor',
              icon: Layers,
              bgStyle: 'from-purple-950/80 via-slate-900 to-indigo-900/40',
              description: 'Aula luas tempat pensi, seminar, pertandingan badminton, dan wisuda madrasah.',
              items: [
                {
                  id: 'g4-1',
                  title: 'Panggung Utama & Mimbar Pidato',
                  subtitle: 'Pentas Seni & Arena Lomba',
                  detail: 'Dilengkapi lighting panggung, backdrop digital, dan sound system konser 3000 Watt.',
                  icon: Award,
                },
                {
                  id: 'g4-2',
                  title: 'Lapangan Badminton Indoor & Tenis Meja',
                  subtitle: 'Fasilitas Olahraga',
                  detail: 'Garis lapangan badminton karpet karet sintetis standar nasional.',
                  icon: Layers,
                },
              ],
            },
            {
              name: 'Ruang UKS & Pelayanan Kesehatan',
              icon: HeartPulse,
              bgStyle: 'from-indigo-950/80 via-slate-900 to-purple-950/40',
              description: 'Ruang Pertolongan Pertama (UKS) dengan tenaga medis dan peralatan P3K lengkap.',
              items: [
                {
                  id: 'g4-3',
                  title: 'Ranjang Peristirahatan UKS',
                  subtitle: 'Tempat Perawatan Siswa',
                  detail: 'Tersedia 4 bed medis dengan tirai pemisah bersih untuk siswa yang kurang sehat.',
                  icon: HeartPulse,
                },
                {
                  id: 'g4-4',
                  title: 'Lemari Obat & Pengukur BMI',
                  subtitle: 'Peralatan Medis Dasar',
                  detail: 'Obat-obatan P3K, alat ukur tekanan darah, timbangan digital, dan stadiometer.',
                  icon: Shield,
                },
              ],
            },
          ],
        };

      case 5:
      default:
        // GERBANG & KANTIN KEJUJURAN
        return {
          themeColor: 'cyan',
          badgeText: 'KANTIN KEJUJURAN & AKSES KAMPUS',
          headerTitle: 'Gerbang Jl. Elang & Kantin MTsN 14',
          headerSubtitle: 'Gerbang Masuk Komp. Rajawali & Pusat Kuliner Sehat Siswa',
          rooms: [
            {
              name: 'Kantin Kejujuran & Food Court',
              icon: Coffee,
              bgStyle: 'from-cyan-950/80 via-slate-900 to-teal-900/40',
              description: 'Area kuliner higienis tempat siswa menikmati sarapan, makan siang, dan es segar.',
              items: [
                {
                  id: 'g5-1',
                  title: 'Stand Bakso & Nasi Goreng Kampus',
                  subtitle: 'Menu Favorit Siswa',
                  detail: 'Makanan hangat, sehat, tanpa pengawet buatan yang disiapkan ibu kantin terakreditasi.',
                  icon: Coffee,
                },
                {
                  id: 'g5-2',
                  title: 'Vending Machine & Kotak Kejujuran',
                  subtitle: 'Kantin Kejujuran MTsN 14',
                  detail: 'Siswa mengambil minuman/makanan ringan dan membayar secara mandiri atau via QRIS.',
                  icon: Sparkles,
                },
              ],
            },
            {
              name: 'Pos Satpam & Absensi Fingerprint',
              icon: Shield,
              bgStyle: 'from-teal-950/80 via-slate-900 to-cyan-950/40',
              description: 'Pos keamanan utama penjagaan Kampus Rajawali Halim Perdanakusuma.',
              items: [
                {
                  id: 'g5-3',
                  title: 'Mesin Absensi Biometrik & RFID',
                  subtitle: 'Pencatat Kehadiran Siswa',
                  detail: 'Siswa menempelkan kartu RFID saat masuk gerbang, terhubung otomatis ke HP orang tua.',
                  icon: Shield,
                },
                {
                  id: 'g5-4',
                  title: 'CCTV Security Station 16-Channel',
                  subtitle: 'Monitoring Kampus 24 Jam',
                  detail: 'Layar pantau sudut-sudut kampus MTsN 14 untuk memastikan keamanan lingkungan.',
                  icon: Tv,
                },
              ],
            },
          ],
        };
    }
  };

  const bData = getBuildingInteriorData(building.index);
  const currentRoom = bData.rooms[selectedRoomIdx] || bData.rooms[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-sans">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-lg">
              🏢
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {bData.badgeText}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  INTERIOR RUANG 3D
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                {bData.headerTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
            title="Keluar ke Halaman Kampus"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
          {bData.rooms.map((room, idx) => {
            const RoomIcon = room.icon;
            const active = idx === selectedRoomIdx;
            return (
              <button
                key={room.name}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedRoomIdx(idx);
                }}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/50'
                }`}
              >
                <RoomIcon className="w-4 h-4" />
                <span>{room.name}</span>
                {active && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
              </button>
            );
          })}
        </div>

        {/* Main Interior Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Active Room Banner */}
          <div className={`relative p-6 rounded-2xl bg-gradient-to-r ${currentRoom.bgStyle} border border-slate-700/60 overflow-hidden shadow-lg`}>
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-bold">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>RUANG DITELUSURI: {currentRoom.name.toUpperCase()}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
                {currentRoom.description}
              </p>
            </div>
            
            {/* Background Roblox Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-25 pointer-events-none" />
          </div>

          {/* Toast Alert when Interacting */}
          {activeItemToast && (
            <div className="p-3.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center gap-2 animate-bounce">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{activeItemToast}</span>
            </div>
          )}

          {/* Interactive Room Equipment & Furniture Items */}
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              PERALATAN & OBJEK INTERAKTIF DI RUANGAN INI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRoom.items.map((item) => {
                const ItemIcon = item.icon;
                const done = interactedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`group relative p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                      done
                        ? 'bg-slate-800/90 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 hover:border-cyan-500/50 text-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 group-hover:scale-105 transition-transform">
                          <ItemIcon className="w-5 h-5" />
                        </div>
                        {done && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> TAHU
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>

                      <p className="text-xs text-slate-300 leading-normal line-clamp-3">
                        {item.detail}
                      </p>
                    </div>

                    <button
                      onClick={() => handleItemInteract(item.id, item.title, item.detail)}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-cyan-600 text-slate-300 hover:text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 border border-slate-700 group-hover:border-cyan-500/40"
                    >
                      <span>{done ? 'BACA ULANG' : 'AMATI / PERIKSA'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pos Misi Guru Banner inside the Building */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/40 via-slate-900 to-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-2xl font-bold">
                🖥️
              </div>
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-400">
                  TERMINAL CBT ASESMEN MANDIRI INFORMATIKA
                </span>
                <h4 className="text-base font-bold text-white">
                  Lembar Ujian CBT: {building.title}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kerjakan soal Computer-Based Test (CBT) Kurikulum Merdeka dari Pak Azhary Mardhani, S.Kom untuk menguji kemampuanmu secara mandiri!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onStartTeacherQuiz();
              }}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono tracking-wider uppercase transition-all shadow-lg shadow-amber-950/50 flex items-center gap-2 shrink-0 border-2 border-amber-200"
            >
              <span>BUKA LEMBAR UJIAN CBT</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Lokasi: {building.buildingName}</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-rose-950/50"
          >
            <LogOut className="w-4 h-4" />
            <span>KELUAR KE HALAMAN KAMPUS</span>
          </button>
        </div>

      </div>
    </div>
  );
};
