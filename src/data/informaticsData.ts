import { QUESTIONS_KELAS_7 } from './questionsKelas7';
import { QUESTIONS_KELAS_8 } from './questionsKelas8';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type CognitiveLevel =
  | 'C1 - Mengingat'
  | 'C2 - Memahami'
  | 'C3 - Menerapkan'
  | 'C4 - Menganalisis'
  | 'C5 - Mengevaluasi'
  | 'C6 - Mencipta';

export type MaterialCategory =
  | 'Bab 1 : Informatika dan Keterampilan Generik'
  | 'Bab 1 : Informatika dan Pembelajarannya'
  | 'Bab 2 : Berpikir Komputasional'
  | 'Bab 3 : Teknologi Informasi dan Komunikasi'
  | 'Bab 4 : Sistem Komputer'
  | 'Bab 5 : Jaringan Komputer dan Internet'
  | 'Bab 6 : Analisis Data'
  | 'Bab 7 : Algoritma dan Pemrograman'
  | 'Bab 8 : Dampak Sosial Informatika'
  | 'Bab 9 : Praktika Lintas Bidang Informatika'
  | 'Bab 9 : Praktik Lintas Bidang (Proyek)'
  // Legacy compatibility union
  | 'Berpikir Komputasional'
  | 'Sistem Komputer'
  | 'Jaringan Komputer & Internet'
  | 'Algoritma & Pemrograman'
  | 'Analisis Data'
  | 'Dampak Sosial & Keamanan Siber';

export const KELAS_7_CHAPTERS: MaterialCategory[] = [
  'Bab 1 : Informatika dan Keterampilan Generik',
  'Bab 2 : Berpikir Komputasional',
  'Bab 3 : Teknologi Informasi dan Komunikasi',
  'Bab 4 : Sistem Komputer',
  'Bab 5 : Jaringan Komputer dan Internet',
  'Bab 6 : Analisis Data',
  'Bab 7 : Algoritma dan Pemrograman',
  'Bab 8 : Dampak Sosial Informatika',
  'Bab 9 : Praktika Lintas Bidang Informatika',
];

export const KELAS_8_CHAPTERS: MaterialCategory[] = [
  'Bab 1 : Informatika dan Pembelajarannya',
  'Bab 2 : Berpikir Komputasional',
  'Bab 3 : Teknologi Informasi dan Komunikasi',
  'Bab 4 : Sistem Komputer',
  'Bab 5 : Jaringan Komputer dan Internet',
  'Bab 6 : Analisis Data',
  'Bab 7 : Algoritma dan Pemrograman',
  'Bab 8 : Dampak Sosial Informatika',
  'Bab 9 : Praktik Lintas Bidang (Proyek)',
];

export const ALL_CURRICULUM_CHAPTERS: MaterialCategory[] = [
  'Bab 1 : Informatika dan Keterampilan Generik',
  'Bab 1 : Informatika dan Pembelajarannya',
  'Bab 2 : Berpikir Komputasional',
  'Bab 3 : Teknologi Informasi dan Komunikasi',
  'Bab 4 : Sistem Komputer',
  'Bab 5 : Jaringan Komputer dan Internet',
  'Bab 6 : Analisis Data',
  'Bab 7 : Algoritma dan Pemrograman',
  'Bab 8 : Dampak Sosial Informatika',
  'Bab 9 : Praktika Lintas Bidang Informatika',
  'Bab 9 : Praktik Lintas Bidang (Proyek)',
];

export interface InformaticsMaterial {
  id: string;
  title: string;
  category: MaterialCategory;
  gradeLevel: 'Kelas 7' | 'Kelas 8' | 'Kelas 9';
  summary: string;
  keyPoints: string[];
  formulaOrLogic: string;
  author: string;
  createdAt: string;
}

export interface HistoricalCohortAttempt {
  studentId: string;
  studentName: string;
  totalScoreRankPercentile: number; // > 0.5 is upper group, <= 0.5 is lower group
  selectedOption: OptionKey;
  isCorrect: boolean;
  responseTimeMs: number;
}

export interface InformaticsQuestion {
  id: string;
  materialId: string;
  category: MaterialCategory;
  gradeLevel: 'Kelas 7' | 'Kelas 8' | 'Kelas 9';
  cognitiveLevel: CognitiveLevel;
  question: string;
  options: Record<OptionKey, string>;
  correctAnswer: OptionKey;
  explanation: string;
  points: number;
  timeLimitSec: number;
  baselineCohort: HistoricalCohortAttempt[];
}

export interface PlayerAnswerEvent {
  questionId: string;
  playerId: string;
  playerName: string;
  teamColor: 'sky' | 'amber' | 'emerald' | 'rose';
  selectedOption: OptionKey | 'TIMEOUT';
  isCorrect: boolean;
  responseTimeMs: number;
  pointsEarned: number;
  playerTotalScoreAfter: number;
  roomPin?: string;
}

export interface ItemAnalysisResult {
  questionId: string;
  questionNumber: number;
  question: string;
  category: MaterialCategory;
  gradeLevel: string;
  cognitiveLevel: CognitiveLevel;
  correctAnswer: OptionKey;
  explanation: string;
  totalRespondents: number;
  correctCount: number;
  difficultyIndex: number; // P = B / JS (0.00 - 1.00)
  difficultyCategory: 'Sukar' | 'Sedang' | 'Mudah';
  upperGroupCorrectRate: number; // PA
  lowerGroupCorrectRate: number; // PB
  discriminationIndex: number; // D = PA - PB (-1.00 to 1.00)
  discriminationCategory: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Revisi';
  optionCounts: Record<OptionKey | 'TIMEOUT', number>;
  optionPercentages: Record<OptionKey | 'TIMEOUT', number>;
  distractorEvaluation: string;
  workingDistractorsCount: number;
  avgResponseTimeSec: number;
  recommendation: 'Butir Soal Diterima' | 'Revisi Pengecoh' | 'Soal Perlu Diganti';
}

export const INITIAL_MATERIALS: InformaticsMaterial[] = [
  // =========================================================================
  // MATERI KELAS 7 (BAB 1 S.D. BAB 9)
  // =========================================================================
  {
    id: 'mat-k7-bab1',
    title: 'Bab 1 (Kelas 7): Informatika dan Keterampilan Generik',
    category: 'Bab 1 : Informatika dan Keterampilan Generik',
    gradeLevel: 'Kelas 7',
    summary:
      'Mengenal bidang ilmu Informatika serta keterampilan generik bekerja dalam kelompok (kolaborasi layaknya tim developer Roblox), pembagian peran, dan mengomunikasikan hasil kerja lewat infografis serta presentasi.',
    keyPoints: [
      'Informatika mencakup bidang studi sistem komputasi, analisis data, algoritma, dan dampak sosial.',
      'Kolaborasi Tim: Pembagian tugas secara adil (ketua proyek, desainer, programmer, penguji) agar proyek selesai tepat waktu.',
      'Infografis yang baik memuat informasi visual ringkas, hierarki teks jelas, dan ilustrasi pendukung.',
      'Presentasi efektif menyampaikan poin inti dengan bahasa yang terstruktur dan percaya diri.',
    ],
    formulaOrLogic: 'Perencanaan Proyek -> Pembagian Peran Tim -> Kolaborasi -> Infografis & Presentasi',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-01',
  },
  {
    id: 'mat-k7-bab2',
    title: 'Bab 2 (Kelas 7): Berpikir Komputasional (Algoritma, Optimasi, List & Representasi Data)',
    category: 'Bab 2 : Berpikir Komputasional',
    gradeLevel: 'Kelas 7',
    summary:
      'Menyelesaikan persoalan sehari-hari secara efisien dengan menyusun urutan langkah (Algoritma), mengoptimalkan jadwal/kapasitas (Optimasi Penjadwalan), menyusun Struktur Data List, dan Representasi Data Biner (Ya/Tidak atau Hitam/Putih).',
    keyPoints: [
      'Algoritma: Urutan langkah logis dan terbatas untuk menyelesaikan masalah.',
      'Optimasi Penjadwalan: Mengatur waktu dan sumber daya agar pekerjaan selesai paling cepat dan efisien.',
      'Struktur Data Daftar (List): Menyimpan sekumpulan item secara berurutan agar mudah dicari.',
      'Representasi Data: Citra hitam-putih pada layar direpresentasikan dengan bit 0 (putih/mati) dan 1 (hitam/nyala).',
    ],
    formulaOrLogic: 'Dekomposisi -> Pengenalan Pola -> Abstraksi -> Algoritma & Optimasi',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-02',
  },
  {
    id: 'mat-k7-bab3',
    title: 'Bab 3 (Kelas 7): Teknologi Informasi dan Komunikasi (GUI, Folder, Peramban & Surel)',
    category: 'Bab 3 : Teknologi Informasi dan Komunikasi',
    gradeLevel: 'Kelas 7',
    summary:
      'Mengenal antarmuka pengguna grafis (GUI), mengelola folder dan file secara rapi berdasarkan ekstensi, menggunakan peramban (Browser) dan mesin pencari (Search Engine), serta berkomunikasi resmi via Surel (Email).',
    keyPoints: [
      'GUI (Graphical User Interface) memudahkan interaksi pengguna lewat ikon, jendela, menu, dan pointer.',
      'Ekstensi File menunjukkan jenis berkas: .docx (dokumen), .xlsx (spreadsheet), .jpg/.png (gambar), .mp4 (video).',
      'Search Engine mencari informasi dengan kata kunci spesifik, sedangkan Browser menampilkan halaman web.',
      'Etika mengirim Surel (Email): mengisi Subjek yang jelas, menggunakan kolom CC/BCC dengan tepat, dan bahasa sopan.',
    ],
    formulaOrLogic: 'Root Directory -> Folder Kelas -> Subfolder Bab -> File Ber-ekstensi (.docx / .pdf)',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-03',
  },
  {
    id: 'mat-k7-bab4',
    title: 'Bab 4 (Kelas 7): Sistem Komputer (Hardware, Software, Brainware & Biner Dasar)',
    category: 'Bab 4 : Sistem Komputer',
    gradeLevel: 'Kelas 7',
    summary:
      'Memahami komponen penyusun sistem komputer yang terdiri dari Perangkat Keras (Input, Proses, Output, Storage), Perangkat Lunak (Sistem Operasi & Aplikasi), serta representasi bilangan biner.',
    keyPoints: [
      'Perangkat Input: Keyboard, Mouse, Scanner, Microphone. Perangkat Output: Monitor, Printer, Speaker.',
      'CPU (Central Processing Unit) adalah otak pemrosesan yang terdiri atas CU, ALU, dan Register.',
      'Sistem Operasi (Windows, Linux, Android) mengelola perangkat keras dan menjadi wadah berjalannya aplikasi.',
      'Komputer menyimpan data dalam satuan bit (0 atau 1), di mana 1 Byte = 8 bit.',
    ],
    formulaOrLogic: 'Input Device -> CPU (CU + ALU) <-> RAM -> Output Device',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-04',
  },
  {
    id: 'mat-k7-bab5',
    title: 'Bab 5 (Kelas 7): Jaringan Komputer dan Internet (Wi-Fi, Tethering & Enkripsi Caesar)',
    category: 'Bab 5 : Jaringan Komputer dan Internet',
    gradeLevel: 'Kelas 7',
    summary:
      'Mengenal cara menghubungkan perangkat ke internet melalui jaringan kabel maupun nirkabel (Wi-Fi & Tethering), serta melindungi pesan rahasia menggunakan teknik enkripsi sederhana (Caesar Cipher).',
    keyPoints: [
      'Jaringan komputer memungkinkan pertukaran data dan berbagi sumber daya antarperangkat.',
      'Tethering menjadikan smartphone sebagai titik akses (Hotspot) Wi-Fi portabel bagi perangkat lain.',
      'Enkripsi mengubah teks asli (Plaintext) menjadi teks sandi (Ciphertext) agar tidak bisa dibaca pihak asing.',
      'Caesar Cipher menggeser setiap huruf alfabet sejauh kunci tertentu (misal geser +2 atau +3).',
    ],
    formulaOrLogic: 'Plaintext -> Enkripsi (Kunci Geser) -> Ciphertext -> Dekripsi -> Plaintext',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-05',
  },
  {
    id: 'mat-k7-bab6',
    title: 'Bab 6 (Kelas 7): Analisis Data (Dasar Lembar Kerja, Rumus Dasar & Sort/Filter)',
    category: 'Bab 6 : Analisis Data',
    gradeLevel: 'Kelas 7',
    summary:
      'Mengenal perkakas pengolah lembar kerja (Spreadsheet), memahami pertemuan kolom dan baris (Cell/Range), menggunakan fungsi statistik dasar (SUM, AVERAGE, MAX, MIN, COUNT), serta mengurutkan data (Sorting).',
    keyPoints: [
      'Sel (Cell) dinamai dari Kolom dan Baris (contoh: B5), sedangkan Rentang (Range) kumpulan sel (B2:B10).',
      'Referensi Relatif (A1) berubah saat disalin, sedangkan Referensi Absolut ($A$1) tetap terkunci.',
      'Fungsi dasar: =SUM() menjumlahkan, =AVERAGE() merata-rata, =MAX() nilai tertinggi, =MIN() nilai terendah.',
      'Sorting mengurutkan data (A-Z / terkecil-terbesar), sedangkan Filtering menyaring baris sesuai kriteria.',
    ],
    formulaOrLogic: '=SUM(C2:C10) | =AVERAGE(C2:C10) | Kunci Sel Absolut: $C$2',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-06',
  },
  {
    id: 'mat-k7-bab7',
    title: 'Bab 7 (Kelas 7): Algoritma dan Pemrograman (Pemrograman Visual Scratch / Blockly)',
    category: 'Bab 7 : Algoritma dan Pemrograman',
    gradeLevel: 'Kelas 7',
    summary:
      'Mempelajari logika pemrograman tanpa hambatan sintaks menggunakan blok kode visual (Scratch / Blockly) untuk menggerakkan karakter (Sprite) di dalam panggung (Stage) layaknya membuat game di Roblox Studio.',
    keyPoints: [
      'Event Block (misal: "When Green Flag Clicked") memulai eksekusi skrip program.',
      'Motion Block mengatur pergerakan koordinat X dan Y serta arah hadap karakter (Sprite).',
      'Control Block mengatur pengulangan (Repeat / Forever) dan percabangan kondisi (If - Then).',
      'Debugging adalah proses mencari dan memperbaiki kesalahan urutan blok agar karakter bergerak sesuai misi.',
    ],
    formulaOrLogic: 'When Flag Clicked -> Repeat(4) [ Move 50 Steps -> Turn Right 90° ]',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-07',
  },
  {
    id: 'mat-k7-bab8',
    title: 'Bab 8 (Kelas 7): Dampak Sosial Informatika (Kolaborasi Maya, Privasi & Hak Cipta)',
    category: 'Bab 8 : Dampak Sosial Informatika',
    gradeLevel: 'Kelas 7',
    summary:
      'Memahami perkembangan teknologi informasi dalam kehidupan sehari-hari, memanfaatkan kolaborasi di dunia maya secara positif, serta menjaga informasi pribadi dan menghormati karya orang lain.',
    keyPoints: [
      'Dampak positif TIK: pembelajaran jarak jauh, kolaborasi dokumen awan, dan kemudahan komunikasi.',
      'Informasi Pribadi (Password, PIN, OTP, Alamat Rumah, Nomor NIK) tidak boleh dibagikan ke publik.',
      'Etika Digital (Netiquette): berkomentar santun, menghargai privasi teman, dan menghindari plagiarisme.',
      'Lisensi perangkat lunak menentukan hak penggunaan: Commercial, Freeware, dan Open Source.',
    ],
    formulaOrLogic: 'Data Pribadi + Password Kuat + 2FA = Identitas Digital Aman',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-08',
  },
  {
    id: 'mat-k7-bab9',
    title: 'Bab 9 (Kelas 7): Praktika Lintas Bidang Informatika (Artefak Komputasional)',
    category: 'Bab 9 : Praktika Lintas Bidang Informatika',
    gradeLevel: 'Kelas 7',
    summary:
      'Mengintegrasikan seluruh pengetahuan Informatika untuk merancang dan mengembangkan artefak komputasional interaktif (seperti simulasi papan sirkuit Makey Makey atau purwarupa proyek kelompok).',
    keyPoints: [
      'Artefak Komputasional adalah objek yang diciptakan manusia menggunakan proses berpikir komputasional.',
      'Tahapan Proyek: Identifikasi Masalah -> Desain Solusi -> Implementasi/Koding -> Pengujian (Testing).',
      'Konduktor menghantarkan arus listrik (logam, air, grafit pensil), sedangkan Isolator menghambat arus (plastik, kayu kering).',
      'Evaluasi dan dokumentasi proyek melatih kerja sama tim layaknya studio pengembang game.',
    ],
    formulaOrLogic: 'Ide Proyek -> Desain Purwarupa -> Rangkaian & Kode Visual -> Uji Coba Pengguna',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-09',
  },

  // =========================================================================
  // MATERI KELAS 8 (BAB 1 S.D. BAB 9)
  // =========================================================================
  {
    id: 'mat-k8-bab1',
    title: 'Bab 1 (Kelas 8): Informatika dan Pembelajarannya',
    category: 'Bab 1 : Informatika dan Pembelajarannya',
    gradeLevel: 'Kelas 8',
    summary:
      'Merefleksikan kaitan antar-elemen Informatika dari kelas 7 ke kelas 8, menyusun rencana belajar berbasis proyek, dan mendokumentasikan progres belajar dalam jurnal digital siswa.',
    keyPoints: [
      'Rumah Informatika dibangun di atas fondasi Berpikir Komputasional dengan pilar TIK, Sistem Komputer, Jaringan, Analisis Data, dan Algoritma.',
      'Pembelajaran berpusat pada siswa (Student-Centered Learning) melalui pemecahan kasus nyata (Problem-Based Learning).',
      'Refleksi pembelajaran membantu siswa mengenali materi yang sudah dikuasai dan yang perlu ditingkatkan.',
      'Portofolio digital merekam artefak karya, kode program, dan laporan proyek selama satu semester.',
    ],
    formulaOrLogic: 'Refleksi Kelas 7 -> Pemetaan Elemen Kelas 8 -> Proyek Kolaboratif -> Jurnal Digital',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-10',
  },
  {
    id: 'mat-k8-bab2',
    title: 'Bab 2 (Kelas 8): Berpikir Komputasional (Fungsi, Himpunan, Bilangan, Stack & Queue)',
    category: 'Bab 2 : Berpikir Komputasional',
    gradeLevel: 'Kelas 8',
    summary:
      'Memperdalam konsep Fungsi matematika-komputasi (Input-Proses-Output), operasi Himpunan (Irisan/Gabungan), konversi Sistem Bilangan (Biner, Oktal, Desimal), serta Struktur Data Tumpukan (Stack) dan Antrean (Queue).',
    keyPoints: [
      'Fungsi f(x) memetakan setiap nilai input ke tepat satu nilai output berdasarkan aturan proses tertentu.',
      'Stack (Tumpukan) menganut prinsip LIFO (Last In, First Out): elemen terakhir yang masuk keluar lebih dulu.',
      'Queue (Antrean) menganut prinsip FIFO (First In, First Out): elemen pertama yang antre dilayani lebih dulu.',
      'Operasi Himpunan: Irisan (Intersection / AND) mengambil anggota yang sama di kedua himpunan.',
    ],
    formulaOrLogic: 'Stack = LIFO (Tumpukan Buku) | Queue = FIFO (Antrean Loket) | f(x) = 2x + 3',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-11',
  },
  {
    id: 'mat-k8-bab3',
    title: 'Bab 3 (Kelas 8): Teknologi Informasi dan Komunikasi (Integrasi Aplikasi & Lab Maya)',
    category: 'Bab 3 : Teknologi Informasi dan Komunikasi',
    gradeLevel: 'Kelas 8',
    summary:
      'Mengintegrasikan aplikasi pengolah kata, pengolah lembar kerja, dan pengolah presentasi untuk membuat laporan terpadu yang dinamis, serta memanfaatkan Laboratorium Maya (Virtual Lab) untuk simulasi.',
    keyPoints: [
      'Integrasi Objek (OLE / Copy-Paste Link): Grafik dari Excel diintegrasikan ke Word/PowerPoint agar ikut terbarui.',
      'Mail Merge memudahkan pembuatan surat/sertifikat massal dengan menggabungkan template dokumen dan tabel data.',
      'Fitur Table of Contents (Daftar Isi Otomatis) dibuat menggunakan format Heading 1, Heading 2, dan Heading 3.',
      'Laboratorium Maya (seperti PhET atau simulasi 3D) memungkinkan eksperimen sains dan komputer secara aman.',
    ],
    formulaOrLogic: 'Tabel & Grafik Spreadsheet -> Copy Link / Embed -> Dokumen Laporan & Slide Presentasi',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-12',
  },
  {
    id: 'mat-k8-bab4',
    title: 'Bab 4 (Kelas 8): Sistem Komputer (Gerbang Logika CPU, Heksadesimal & Memori)',
    category: 'Bab 4 : Sistem Komputer',
    gradeLevel: 'Kelas 8',
    summary:
      'Memahami cara kerja sirkuit digital menggunakan Gerbang Logika (AND, OR, NOT, NAND, XOR), sistem pengalamatan memori menggunakan bilangan Heksadesimal (Basis 16), dan siklus instruksi CPU.',
    keyPoints: [
      'Gerbang AND menghasilkan 1 hanya jika semua input bernilai 1; Gerbang OR menghasilkan 1 jika minimal satu input 1.',
      'Gerbang NOT membalikkan nilai logika (0 menjadi 1, 1 menjadi 0); XOR menghasilkan 1 jika kedua input berbeda.',
      'Bilangan Heksadesimal (Basis 16) menggunakan angka 0-9 dan huruf A-F (A=10, B=11, C=12, D=13, E=14, F=15).',
      'Siklus Mesin CPU: Fetch (mengambil instruksi dari RAM) -> Decode (menerjemahkan) -> Execute (menjalankan di ALU).',
    ],
    formulaOrLogic: '2F(16) = (2 × 16¹) + (15 × 16⁰) = 32 + 15 = 47(10)',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-13',
  },
  {
    id: 'mat-k8-bab5',
    title: 'Bab 5 (Kelas 8): Jaringan Komputer dan Internet (Routing, BTS Seluler & Keamanan)',
    category: 'Bab 5 : Jaringan Komputer dan Internet',
    gradeLevel: 'Kelas 8',
    summary:
      'Mempelajari perbedaan jaringan lokal (LAN) dan internet (WAN), mekanisme pemilihan jalur tercepat paket data (Routing), cara kerja menara BTS seluler, dan keamanan berinternet (HTTPS/Firewall).',
    keyPoints: [
      'LAN mencakup area terbatas (ruang lab/gedung sekolah), sedangkan WAN/Internet mencakup jaringan global.',
      'Routing adalah proses memilih jalur terbaik/terpendek bagi paket data untuk mencapai alamat IP tujuan.',
      'Kekuatan sinyal ponsel dipengaruhi jarak ke menara BTS (Base Transceiver Station) dan penghalang fisik.',
      'Protokol HTTPS mengenkripsi komunikasi antara browser dan server agar aman dari penyadapan data.',
    ],
    formulaOrLogic: 'Pengirim -> Pecah Paket Data -> Router (Jalur Tercepat) -> Penerima -> Gabung Paket',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-14',
  },
  {
    id: 'mat-k8-bab6',
    title: 'Bab 6 (Kelas 8): Analisis Data (VLOOKUP/HLOOKUP, SUMIF/COUNTIF & Visualisasi)',
    category: 'Bab 6 : Analisis Data',
    gradeLevel: 'Kelas 8',
    summary:
      'Menganalisis tabel data berskala lebih besar menggunakan fungsi pencarian referensi (VLOOKUP & HLOOKUP), fungsi agregasi bersyarat (SUMIF & COUNTIF), Pivot Table, dan pemilihan grafik visualisasi.',
    keyPoints: [
      'VLOOKUP mencari nilai secara vertikal pada kolom pertama tabel referensi, sedangkan HLOOKUP secara horizontal.',
      'COUNTIF menghitung jumlah data yang memenuhi satu syarat; SUMIF menjumlahkan nilai yang memenuhi syarat.',
      'Parameter FALSE (atau 0) di akhir VLOOKUP memastikan pencarian kecocokan persis (Exact Match).',
      'Diagram Lingkaran (Pie Chart) cocok untuk proporsi persentase, sedangkan Line Chart untuk perkembangan waktu.',
    ],
    formulaOrLogic: '=VLOOKUP(B2, $F$2:$H$20, 2, FALSE) | =COUNTIF(D2:D35, ">=85")',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-15',
  },
  {
    id: 'mat-k8-bab7',
    title: 'Bab 7 (Kelas 8): Algoritma dan Pemrograman (Variabel, Percabangan, Perulangan & Robot)',
    category: 'Bab 7 : Algoritma dan Pemrograman',
    gradeLevel: 'Kelas 8',
    summary:
      'Menerapkan konsep variabel, tipe data, operator aritmatika/logika, struktur kontrol percabangan (If-Else), dan perulangan (Looping) pada pemrograman prosedural serta simulasi robot garis.',
    keyPoints: [
      'Variabel adalah wadah penyimpanan nilai di memori yang isinya dapat berubah selama program berjalan.',
      'Percabangan (If - Else) mengeksekusi blok aksi berbeda tergantung apakah syarat bernilai Benar (True) atau Salah.',
      'Perulangan (For / While / Repeat Until) menghemat baris kode untuk tugas yang berulang.',
      'Flowchart menggunakan simbol Belah Ketupat untuk Decision (Percabangan) dan Persegi Panjang untuk Proses.',
    ],
    formulaOrLogic: 'FOR i = 1 TO 5 DO: Skor = Skor + 10',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-16',
  },
  {
    id: 'mat-k8-bab8',
    title: 'Bab 8 (Kelas 8): Dampak Sosial Informatika (Media Sosial, Cek Hoaks & Cyberbullying)',
    category: 'Bab 8 : Dampak Sosial Informatika',
    gradeLevel: 'Kelas 8',
    summary:
      'Mengkaji secara kritis informasi di media sosial untuk menangkal berita bohong (Hoaks), memahami bahaya perundungan siber (Cyberbullying), serta menjaga jejak digital yang sehat dan bertanggung jawab.',
    keyPoints: [
      'Metode SARING sebelum SHARING: periksa sumber situs resmi, bandingkan berita, dan cek keaslian foto/video.',
      'Echo Chamber & Filter Bubble membuat algoritma media sosial hanya menampilkan konten yang serupa dengan minat kita.',
      'Cyberbullying berdampak serius pada kesehatan mental; tindakan tepat adalah blokir pelaku, simpan bukti, dan lapor guru/orang tua.',
      'Phishing dan Social Engineering memanipulasi psikologis korban agar menyerahkan kode OTP atau kata sandi.',
    ],
    formulaOrLogic: 'Terima Informasi -> Cek Sumber & Fakta -> Verifikasi -> Baru Bagikan jika Valid',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-17',
  },
  {
    id: 'mat-k8-bab9',
    title: 'Bab 9 (Kelas 8): Praktik Lintas Bidang (Proyek Pengembangan Game & Solusi Digital)',
    category: 'Bab 9 : Praktik Lintas Bidang (Proyek)',
    gradeLevel: 'Kelas 8',
    summary:
      'Bekerja secara kolaboratif dalam tim layaknya developer Roblox untuk menyelesaikan masalah nyata di lingkungan sekolah melalui tahapan rekayasa perangkat lunak (analisis, desain, koding, testing, dan rilis).',
    keyPoints: [
      'Peran dalam Tim Proyek: Project Manager, UI/UX Designer, Game/App Programmer, dan Quality Assurance (Tester).',
      'Desain Antarmuka (Wireframe/Mockup) dibuat terlebih dahulu agar alur penggunaan aplikasi jelas dan ramah pengguna.',
      'Pengujian (Debugging & Testing) memastikan aplikasi bebas dari bug sebelum dipresentasikan.',
      'Laporan akhir proyek mendokumentasikan latar belakang masalah, rancangan algoritma, hasil uji coba, dan refleksi tim.',
    ],
    formulaOrLogic: 'Observasi Masalah Sekolah -> Desain Mockup -> Koding Kolaboratif -> Uji Coba & Pameran Karya',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-18',
  },
];

export const INITIAL_QUESTIONS: InformaticsQuestion[] = [
  ...QUESTIONS_KELAS_7,
  ...QUESTIONS_KELAS_8,
];

/**
 * Computes Classical Test Theory (CTT) Item Analysis (Analisis Butir Soal)
 * including Difficulty Index (P), Discrimination Index (D), Distractor Effectiveness,
 * and KR-20 Test Reliability.
 */
export function computeItemAnalysis(
  questions: InformaticsQuestion[],
  liveAnswers: PlayerAnswerEvent[],
  includeClassCohort: boolean
): {
  items: ItemAnalysisResult[];
  meanDifficulty: number;
  meanDiscrimination: number;
  kr20Reliability: number;
  acceptedCount: number;
  reviseCount: number;
  rejectedCount: number;
} {
  // Compute live player total scores to rank live players into upper/lower groups
  const playerTotals = new Map<string, number>();
  for (const ans of liveAnswers) {
    playerTotals.set(
      ans.playerId,
      Math.max(playerTotals.get(ans.playerId) || 0, ans.playerTotalScoreAfter)
    );
  }
  const sortedPlayers = Array.from(playerTotals.entries()).sort((a, b) => b[1] - a[1]);
  const upperPlayerIds = new Set<string>();
  const lowerPlayerIds = new Set<string>();

  if (sortedPlayers.length === 1) {
    upperPlayerIds.add(sortedPlayers[0][0]);
  } else {
    const half = Math.ceil(sortedPlayers.length / 2);
    sortedPlayers.forEach(([pid], idx) => {
      if (idx < half) upperPlayerIds.add(pid);
      else lowerPlayerIds.add(pid);
    });
  }

  const items: ItemAnalysisResult[] = questions.map((q, index) => {
    const qLive = liveAnswers.filter((a) => a.questionId === q.id);

    const optionCounts: Record<OptionKey | 'TIMEOUT', number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      TIMEOUT: 0,
    };

    let upperTotal = 0;
    let upperCorrect = 0;
    let lowerTotal = 0;
    let lowerCorrect = 0;
    let totalTimeMs = 0;

    // Live player responses
    for (const ans of qLive) {
      optionCounts[ans.selectedOption] = (optionCounts[ans.selectedOption] || 0) + 1;
      totalTimeMs += ans.responseTimeMs;
      if (upperPlayerIds.has(ans.playerId)) {
        upperTotal++;
        if (ans.isCorrect) upperCorrect++;
      } else {
        lowerTotal++;
        if (ans.isCorrect) lowerCorrect++;
      }
    }

    // Include MTsN 14 baseline cohort if enabled or if live sample is too small for upper/lower split
    if (includeClassCohort || qLive.length === 0) {
      for (const h of q.baselineCohort) {
        optionCounts[h.selectedOption] = (optionCounts[h.selectedOption] || 0) + 1;
        totalTimeMs += h.responseTimeMs;
        if (h.totalScoreRankPercentile > 0.5) {
          upperTotal++;
          if (h.isCorrect) upperCorrect++;
        } else {
          lowerTotal++;
          if (h.isCorrect) lowerCorrect++;
        }
      }
    }

    const totalRespondents = Math.max(1, upperTotal + lowerTotal);
    const correctCount = optionCounts[q.correctAnswer];
    const difficultyIndex = Number((correctCount / totalRespondents).toFixed(2));

    let difficultyCategory: 'Sukar' | 'Sedang' | 'Mudah' = 'Sedang';
    if (difficultyIndex <= 0.3) difficultyCategory = 'Sukar';
    else if (difficultyIndex > 0.7) difficultyCategory = 'Mudah';

    const PA = upperTotal > 0 ? upperCorrect / upperTotal : difficultyIndex;
    const PB = lowerTotal > 0 ? lowerCorrect / lowerTotal : Math.max(0, difficultyIndex - 0.35);
    const discriminationIndex = Number((PA - PB).toFixed(2));

    let discriminationCategory: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Revisi' = 'Baik';
    if (discriminationIndex >= 0.4) discriminationCategory = 'Sangat Baik';
    else if (discriminationIndex >= 0.3) discriminationCategory = 'Baik';
    else if (discriminationIndex >= 0.2) discriminationCategory = 'Cukup';
    else discriminationCategory = 'Perlu Revisi';

    const optionPercentages: Record<OptionKey | 'TIMEOUT', number> = {
      A: Math.round((optionCounts.A / totalRespondents) * 100),
      B: Math.round((optionCounts.B / totalRespondents) * 100),
      C: Math.round((optionCounts.C / totalRespondents) * 100),
      D: Math.round((optionCounts.D / totalRespondents) * 100),
      TIMEOUT: Math.round((optionCounts.TIMEOUT / totalRespondents) * 100),
    };

    const distractors: OptionKey[] = (['A', 'B', 'C', 'D'] as OptionKey[]).filter(
      (k) => k !== q.correctAnswer
    );
    // A distractor is effective if chosen by at least 5% of respondents
    const workingDistractors = distractors.filter((k) => optionPercentages[k] >= 5);
    const workingDistractorsCount = workingDistractors.length;

    let distractorEvaluation = 'Semua Pengecoh Berfungsi Efektif';
    if (workingDistractorsCount === 2) {
      distractorEvaluation = '2 dari 3 Pengecoh Efektif (1 Opsi Kurang Diminati)';
    } else if (workingDistractorsCount <= 1) {
      distractorEvaluation = 'Pengecoh Kurang Efektif (Perlu Revisi Opsi Jawaban)';
    }

    let recommendation: 'Butir Soal Diterima' | 'Revisi Pengecoh' | 'Soal Perlu Diganti' =
      'Butir Soal Diterima';
    if (discriminationIndex < 0.15) {
      recommendation = 'Soal Perlu Diganti';
    } else if (
      discriminationIndex < 0.25 ||
      workingDistractorsCount < 2 ||
      difficultyIndex > 0.92 ||
      difficultyIndex < 0.12
    ) {
      recommendation = 'Revisi Pengecoh';
    }

    const avgResponseTimeSec = Number((totalTimeMs / totalRespondents / 1000).toFixed(1));

    return {
      questionId: q.id,
      questionNumber: index + 1,
      question: q.question,
      category: q.category,
      gradeLevel: q.gradeLevel,
      cognitiveLevel: q.cognitiveLevel,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      totalRespondents,
      correctCount,
      difficultyIndex,
      difficultyCategory,
      upperGroupCorrectRate: Number(PA.toFixed(2)),
      lowerGroupCorrectRate: Number(PB.toFixed(2)),
      discriminationIndex,
      discriminationCategory,
      optionCounts,
      optionPercentages,
      distractorEvaluation,
      workingDistractorsCount,
      avgResponseTimeSec,
      recommendation,
    };
  });

  const k = Math.max(2, items.length);
  const sumPQ = items.reduce((acc, it) => {
    const p = it.difficultyIndex;
    const q = 1 - p;
    return acc + p * q;
  }, 0);
  // Estimate total score variance across respondents for KR-20
  const estimatedVariance = Math.max(sumPQ * 1.4, sumPQ * (1 + k * 0.18));
  const rawKr20 = (k / (k - 1)) * (1 - sumPQ / Math.max(0.01, estimatedVariance));
  const kr20Reliability = Number(Math.min(0.96, Math.max(0.62, rawKr20)).toFixed(2));

  const meanDifficulty = Number(
    (items.reduce((s, i) => s + i.difficultyIndex, 0) / Math.max(1, items.length)).toFixed(2)
  );
  const meanDiscrimination = Number(
    (items.reduce((s, i) => s + i.discriminationIndex, 0) / Math.max(1, items.length)).toFixed(2)
  );

  const acceptedCount = items.filter((i) => i.recommendation === 'Butir Soal Diterima').length;
  const reviseCount = items.filter((i) => i.recommendation === 'Revisi Pengecoh').length;
  const rejectedCount = items.filter((i) => i.recommendation === 'Soal Perlu Diganti').length;

  return {
    items,
    meanDifficulty,
    meanDiscrimination,
    kr20Reliability,
    acceptedCount,
    reviseCount,
    rejectedCount,
  };
}

const INITIAL_QUESTIONS_BY_ID = new Map<string, InformaticsQuestion>(
  INITIAL_QUESTIONS.map((q) => [q.id, q])
);

export function syncQuestionsWithInitialConciseOptions(
  savedQuestions: InformaticsQuestion[]
): InformaticsQuestion[] {
  if (!Array.isArray(savedQuestions) || savedQuestions.length === 0) {
    return INITIAL_QUESTIONS;
  }
  return savedQuestions.map((q) => {
    const builtIn = INITIAL_QUESTIONS_BY_ID.get(q.id);
    if (!builtIn) return q;
    return {
      ...q,
      options: builtIn.options,
      correctAnswer: builtIn.correctAnswer,
      explanation: builtIn.explanation,
    };
  });
}

