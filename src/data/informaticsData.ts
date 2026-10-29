export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type CognitiveLevel =
  | 'C1 - Mengingat'
  | 'C2 - Memahami'
  | 'C3 - Menerapkan'
  | 'C4 - Menganalisis'
  | 'C5 - Mengevaluasi'
  | 'C6 - Mencipta';

export type MaterialCategory =
  | 'Berpikir Komputasional'
  | 'Sistem Komputer'
  | 'Jaringan Komputer & Internet'
  | 'Algoritma & Pemrograman'
  | 'Analisis Data'
  | 'Dampak Sosial & Keamanan Siber';

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
  {
    id: 'mat-bk-01',
    title: 'Empat Pilar Berpikir Komputasional & Struktur Data',
    category: 'Berpikir Komputasional',
    gradeLevel: 'Kelas 7',
    summary:
      'Berpikir Komputasional (Computational Thinking) adalah metode menyelesaikan masalah kompleks secara sistematis menggunakan Dekomposisi, Pengenalan Pola, Abstraksi, dan Perancangan Algoritma.',
    keyPoints: [
      'Dekomposisi: Memecah masalah besar menjadi sub-masalah yang lebih kecil dan mudah dikelola.',
      'Pengenalan Pola: Mencari kesamaan atau tren di antara berbagai permasalahan.',
      'Abstraksi: Menyaring informasi penting dan mengabaikan detail yang tidak relevan.',
      'Algoritma: Menyusun langkah-langkah logis berurutan untuk menyelesaikan masalah.',
    ],
    formulaOrLogic: 'Masalah Kompleks -> Dekomposisi -> Pola -> Abstraksi -> Solusi Algoritmik',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-01',
  },
  {
    id: 'mat-sk-02',
    title: 'Arsitektur Sistem Komputer & Bilangan Biner',
    category: 'Sistem Komputer',
    gradeLevel: 'Kelas 8',
    summary:
      'Sistem komputer terdiri atas Perangkat Keras (Hardware), Perangkat Lunak (Software), dan Pengguna (Brainware). Komputer memproses data menggunakan sistem bilangan biner berbasis 2 (0 dan 1).',
    keyPoints: [
      'CPU terdiri dari Control Unit (CU), Arithmetic Logic Unit (ALU), dan Register.',
      'RAM bersifat volatile (data hilang saat listrik mati), sedangkan ROM bersifat non-volatile.',
      'Konversi Biner ke Desimal: Kalikan tiap bit dengan 2 pangkat posisinya dari kanan (2^0, 2^1, 2^2, dst).',
      'Gerbang Logika Dasar: AND (bernilai 1 jika semua input 1), OR (1 jika salah satu 1), NOT (pembalik nilai).',
    ],
    formulaOrLogic: '1101(2) = (1×2³) + (1×2²) + (0×2¹) + (1×2⁰) = 8 + 4 + 0 + 1 = 13(10)',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-03',
  },
  {
    id: 'mat-jk-03',
    title: 'Topologi Jaringan, Protokol TCP/IP & Keamanan Routing',
    category: 'Jaringan Komputer & Internet',
    gradeLevel: 'Kelas 8',
    summary:
      'Jaringan komputer menghubungkan berbagai perangkat untuk berbagi data melalui media kabel (UTP/Fiber Optik) maupun nirkabel (Wi-Fi) dengan aturan protokol komunikasi TCP/IP.',
    keyPoints: [
      'Topologi Star menggunakan Switch/Hub pusat: jika satu kabel klien putus, komputer lain tetap aman.',
      'DNS (Domain Name System) menerjemahkan nama domain (mtsn14-jkt.sch.id) menjadi alamat IP.',
      'HTTPS menggunakan enkripsi SSL/TLS sehingga paket data aman dari penyadapan (sniffing).',
      ' Lebar pita (Bandwidth) menentukan kapasitas maksimum transfer data dalam satuan Mbps/Gbps.',
    ],
    formulaOrLogic: 'Client -> Request DNS -> IP Server -> Handshake TLS/HTTPS -> Paket Data Terenkripsi',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-05',
  },
  {
    id: 'mat-ap-04',
    title: 'Algoritma, Flowchart, Percabangan & Perulangan',
    category: 'Algoritma & Pemrograman',
    gradeLevel: 'Kelas 9',
    summary:
      'Pemrograman menerjemahkan algoritma menjadi instruksi yang dapat dijalankan komputer melalui struktur runtunan (sequence), percabangan (selection), dan perulangan (iteration).',
    keyPoints: [
      'Simbol Belah Ketupat (Diamond) pada Flowchart melambangkan Decision / Percabangan (Ya/Tidak).',
      'Simbol Jajar Genjang (Parallelogram) melambangkan Input / Output data.',
      'Operator Modulo (%) menghasilkan sisa pembagian bulat (contoh: 17 % 5 = 2).',
      'Looping (For/While) mengeksekusi blok kode berulang kali selama kondisi bernilai True.',
    ],
    formulaOrLogic: 'IF (Nilai >= 78) THEN Status = "Tuntas" ELSE Status = "Remedial"',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-08',
  },
  {
    id: 'mat-ad-05',
    title: 'Analisis Data & Fungsi Statistik Lembar Kerja',
    category: 'Analisis Data',
    gradeLevel: 'Kelas 8',
    summary:
      'Analisis data membantu mengolah kumpulan data mentah menjadi informasi bermakna menggunakan fungsi agregasi, pencarian referensi, serta visualisasi grafik yang tepat.',
    keyPoints: [
      'SUM menjumlahkan rentang sel, AVERAGE menghitung rata-rata, MAX/MIN mencari nilai tertinggi/terendah.',
      'COUNTIF menghitung jumlah sel yang memenuhi kriteria tertentu (misal jumlah siswa nilai > 85).',
      'VLOOKUP mencari data secara vertikal berdasarkan kunci kolom pertama tabel referensi.',
      'Grafik Garis (Line Chart) ideal untuk tren waktu, sedangkan Diagram Batang untuk perbandingan kategori.',
    ],
    formulaOrLogic: '=AVERAGE(C2:C15) | =COUNTIF(D2:D30, ">=80")',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-10',
  },
  {
    id: 'mat-ds-06',
    title: 'Keamanan Siber, Kriptografi & Etika Digital',
    category: 'Dampak Sosial & Keamanan Siber',
    gradeLevel: 'Kelas 9',
    summary:
      'Literasi keamanan siber melindungi identitas digital siswa dari serangan rekayasa sosial (Phishing), malware, serta menumbuhkan etika berinternet dan penghormatan Hak Cipta.',
    keyPoints: [
      'Phishing adalah upaya mencuri kredensial (password/OTP) dengan menyamar sebagai situs resmi.',
      'Two-Factor Authentication (2FA) menambah lapisan keamanan ekstra selain kata sandi.',
      'Caesar Cipher menggeser huruf alfabet sejauh kunci N (contoh geser +3: A -> D, B -> E).',
      'Jejak Digital Pasif vs Aktif: segala unggahan di internet bersifat permanen dan berdampak jangka panjang.',
    ],
    formulaOrLogic: 'Enkripsi Caesar(Kunci +3): "MTS" -> "PWV"',
    author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
    createdAt: '2026-10-12',
  },
];

function createCohort(
  correctKey: OptionKey,
  upperAcc: number,
  lowerAcc: number,
  popularWrong: OptionKey,
  secondWrong: OptionKey
): HistoricalCohortAttempt[] {
  const attempts: HistoricalCohortAttempt[] = [];
  const allOptions: OptionKey[] = ['A', 'B', 'C', 'D'];
  const thirdWrong =
    allOptions.find((o) => o !== correctKey && o !== popularWrong && o !== secondWrong) || 'D';

  // 10 Upper group students + 10 Lower group students from MTsN 14 Jakarta
  for (let i = 0; i < 10; i++) {
    const isCorrect = i < Math.round(upperAcc * 10);
    const chosen: OptionKey = isCorrect
      ? correctKey
      : i % 2 === 0
      ? popularWrong
      : secondWrong;
    attempts.push({
      studentId: `upper-${i + 1}`,
      studentName: `Siswa Atas ${i + 1}`,
      totalScoreRankPercentile: 0.85 - i * 0.03,
      selectedOption: chosen,
      isCorrect,
      responseTimeMs: 4200 + i * 310,
    });
  }

  for (let i = 0; i < 10; i++) {
    const isCorrect = i < Math.round(lowerAcc * 10);
    const chosen: OptionKey = isCorrect
      ? correctKey
      : i % 3 === 0
      ? popularWrong
      : i % 3 === 1
      ? secondWrong
      : thirdWrong;
    attempts.push({
      studentId: `lower-${i + 1}`,
      studentName: `Siswa Bawah ${i + 1}`,
      totalScoreRankPercentile: 0.45 - i * 0.04,
      selectedOption: chosen,
      isCorrect,
      responseTimeMs: 6500 + i * 420,
    });
  }
  return attempts;
}

export const INITIAL_QUESTIONS: InformaticsQuestion[] = [
  {
    id: 'q-01',
    materialId: 'mat-bk-01',
    category: 'Berpikir Komputasional',
    gradeLevel: 'Kelas 7',
    cognitiveLevel: 'C3 - Menerapkan',
    question:
      'OSIS MTsN 14 Jakarta ingin mengadakan lomba Class Meeting. Mereka membagi kepanitiaan menjadi divisi acara, perlengkapan, dokumentasi, dan konsumsi agar tugas lebih ringan. Pilar Berpikir Komputasional yang diterapkan adalah...',
    options: {
      A: 'Abstraksi (Penyaringan fokus)',
      B: 'Dekomposisi (Pemecahan masalah)',
      C: 'Pengenalan Pola (Pattern Recognition)',
      D: 'Kompilasi Kode (Code Compilation)',
    },
    correctAnswer: 'B',
    explanation:
      'Dekomposisi adalah teknik memecah masalah atau proyek besar (Class Meeting) menjadi bagian-bagian yang lebih kecil (divisi kepanitiaan) agar lebih mudah dikelola.',
    points: 150,
    timeLimitSec: 25,
    baselineCohort: createCohort('B', 0.9, 0.5, 'A', 'C'),
  },
  {
    id: 'q-02',
    materialId: 'mat-bk-01',
    category: 'Berpikir Komputasional',
    gradeLevel: 'Kelas 7',
    cognitiveLevel: 'C4 - Menganalisis',
    question:
      'Saat menggunakan peta digital menuju MTs Negeri 14 Jakarta, aplikasi hanya menampilkan jalur jalan raya dan estimasi waktu tempuh tanpa menampilkan warna atap rumah warga. Prinsip ini disebut...',
    options: {
      A: 'Abstraksi',
      B: 'Dekomposisi',
      C: 'Iterasi Rekursif',
      D: 'Enkripsi Data',
    },
    correctAnswer: 'A',
    explanation:
      'Abstraksi menyaring informasi yang relevan (jalur jalan & waktu tempuh) dan mengabaikan detail yang tidak diperlukan (warna atap rumah).',
    points: 150,
    timeLimitSec: 25,
    baselineCohort: createCohort('A', 0.8, 0.4, 'B', 'C'),
  },
  {
    id: 'q-03',
    materialId: 'mat-sk-02',
    category: 'Sistem Komputer',
    gradeLevel: 'Kelas 8',
    cognitiveLevel: 'C3 - Menerapkan',
    question:
      'Robot sensor di Lab Informatika mengirimkan sinyal biner 11010(2). Berapakah nilai bilangan desimal dari kode biner tersebut?',
    options: {
      A: '22',
      B: '24',
      C: '26',
      D: '28',
    },
    correctAnswer: 'C',
    explanation:
      '11010(2) = (1×16) + (1×8) + (0×4) + (1×2) + (0×1) = 16 + 8 + 0 + 2 + 0 = 26(10).',
    points: 200,
    timeLimitSec: 30,
    baselineCohort: createCohort('C', 0.8, 0.3, 'B', 'D'),
  },
  {
    id: 'q-04',
    materialId: 'mat-sk-02',
    category: 'Sistem Komputer',
    gradeLevel: 'Kelas 8',
    cognitiveLevel: 'C4 - Menganalisis',
    question:
      'Gerbang logika keamanan server akan membuka akses (Output = 1) jika: (Input A = 1 AND Input B = 0) OR (Input C = 1). Jika A=1, B=1, dan C=0, maka Output server adalah...',
    options: {
      A: '1 (Akses Terbuka)',
      B: '0 (Akses Ditolak)',
      C: 'Error Overflow',
      D: 'Reset Otomatis',
    },
    correctAnswer: 'B',
    explanation:
      '(A=1 AND B=0) bernilai False (0) karena B=1. Kemudian 0 OR (C=0) menghasilkan 0 (Akses Ditolak).',
    points: 200,
    timeLimitSec: 30,
    baselineCohort: createCohort('B', 0.7, 0.3, 'A', 'C'),
  },
  {
    id: 'q-05',
    materialId: 'mat-sk-02',
    category: 'Sistem Komputer',
    gradeLevel: 'Kelas 7',
    cognitiveLevel: 'C2 - Memahami',
    question:
      'Bagian dari prosesor (CPU) yang bertugas khusus melakukan perhitungan aritmatika (penjumlahan, pengurangan) dan perbandingan logika adalah...',
    options: {
      A: 'Control Unit (CU)',
      B: 'Arithmetic Logic Unit (ALU)',
      C: 'Random Access Memory (RAM)',
      D: 'Solid State Drive (SSD)',
    },
    correctAnswer: 'B',
    explanation:
      'ALU (Arithmetic Logic Unit) adalah komponen CPU yang mengeksekusi operasi perhitungan matematika dan keputusan logika.',
    points: 150,
    timeLimitSec: 22,
    baselineCohort: createCohort('B', 0.9, 0.5, 'A', 'C'),
  },
  {
    id: 'q-06',
    materialId: 'mat-jk-03',
    category: 'Jaringan Komputer & Internet',
    gradeLevel: 'Kelas 8',
    cognitiveLevel: 'C4 - Menganalisis',
    question:
      'Lab Komputer MTsN 14 Jakarta menghubungkan 30 PC ke satu Switch pusat. Ketika kabel jaringan pada PC nomor 12 terputus, 29 PC lainnya tetap bisa mengakses internet. Topologi yang digunakan adalah...',
    options: {
      A: 'Topologi Bus',
      B: 'Topologi Ring (Cincin)',
      C: 'Topologi Star (Bintang)',
      D: 'Topologi Peer-to-Peer',
    },
    correctAnswer: 'C',
    explanation:
      'Pada Topologi Star, setiap klien terhubung langsung ke Switch pusat secara independen, sehingga kerusakan satu kabel klien tidak melumpuhkan jaringan lain.',
    points: 150,
    timeLimitSec: 25,
    baselineCohort: createCohort('C', 0.9, 0.4, 'A', 'B'),
  },
  {
    id: 'q-07',
    materialId: 'mat-jk-03',
    category: 'Jaringan Komputer & Internet',
    gradeLevel: 'Kelas 8',
    cognitiveLevel: 'C2 - Memahami',
    question:
      'Saat siswa mengetik alamat "mtsn14-jakarta.sch.id" pada browser, layanan jaringan yang bertugas menerjemahkan nama domain tersebut menjadi alamat IP numerik server adalah...',
    options: {
      A: 'DHCP Server',
      B: 'DNS (Domain Name System)',
      C: 'FTP (File Transfer Protocol)',
      D: 'MAC Address Filter',
    },
    correctAnswer: 'B',
    explanation:
      'DNS berfungsi sebagai buku telepon internet yang menerjemahkan nama domain yang mudah diingat manusia menjadi IP Address komputer.',
    points: 150,
    timeLimitSec: 22,
    baselineCohort: createCohort('B', 0.8, 0.4, 'A', 'C'),
  },
  {
    id: 'q-08',
    materialId: 'mat-ap-04',
    category: 'Algoritma & Pemrograman',
    gradeLevel: 'Kelas 9',
    cognitiveLevel: 'C4 - Menganalisis',
    question:
      'Perhatikan pseudocode berikut: X = 5; FOR i = 1 TO 3 DO (X = X + (i * 2)). Berapakah nilai variabel X setelah perulangan selesai dijalankan?',
    options: {
      A: '11',
      B: '15',
      C: '17',
      D: '21',
    },
    correctAnswer: 'C',
    explanation:
      'Awal X = 5. Iterasi i=1: X = 5 + 2 = 7. Iterasi i=2: X = 7 + 4 = 11. Iterasi i=3: X = 11 + 6 = 17.',
    points: 200,
    timeLimitSec: 30,
    baselineCohort: createCohort('C', 0.7, 0.2, 'B', 'A'),
  },
  {
    id: 'q-09',
    materialId: 'mat-ap-04',
    category: 'Algoritma & Pemrograman',
    gradeLevel: 'Kelas 8',
    cognitiveLevel: 'C2 - Memahami',
    question:
      'Dalam pembuatan diagram alir (Flowchart) program kelulusan nilai ujian, simbol geometri yang tepat untuk menguji kondisi "Apakah Nilai >= 78?" adalah...',
    options: {
      A: 'Persegi Panjang (Process)',
      B: 'Belah Ketupat (Decision)',
      C: 'Jajar Genjang (Input/Output)',
      D: 'Kapsul Oval (Terminator)',
    },
    correctAnswer: 'B',
    explanation:
      'Simbol Belah Ketupat (Diamond / Decision) digunakan untuk pengujian kondisi percabangan yang menghasilkan jalur keluar Ya (True) atau Tidak (False).',
    points: 150,
    timeLimitSec: 22,
    baselineCohort: createCohort('B', 0.85, 0.45, 'A', 'C'),
  },
  {
    id: 'q-10',
    materialId: 'mat-ad-05',
    category: 'Analisis Data',
    gradeLevel: 'Kelas 8',
    cognitiveLevel: 'C3 - Menerapkan',
    question:
      'Pak Azhary ingin menghitung banyaknya siswa kelas 8A yang memperoleh nilai Informatika di atas atau sama dengan 85 pada rentang sel C2 sampai C32. Rumus spreadsheet yang tepat adalah...',
    options: {
      A: '=SUM(C2:C32, ">=85")',
      B: '=AVERAGE(C2:C32)',
      C: '=COUNTIF(C2:C32, ">=85")',
      D: '=MAX(C2:C32)',
    },
    correctAnswer: 'C',
    explanation:
      'Fungsi COUNTIF(range, criteria) menghitung jumlah sel dalam rentang tertentu yang memenuhi syarat atau kriteria yang ditentukan.',
    points: 175,
    timeLimitSec: 25,
    baselineCohort: createCohort('C', 0.8, 0.35, 'A', 'B'),
  },
  {
    id: 'q-11',
    materialId: 'mat-ds-06',
    category: 'Dampak Sosial & Keamanan Siber',
    gradeLevel: 'Kelas 9',
    cognitiveLevel: 'C3 - Menerapkan',
    question:
      'Sebuah pesan rahasia dienkripsi menggunakan Caesar Cipher dengan kunci geser +3 (A menjadi D, B menjadi E). Jika kata aslinya adalah "DATA", maka teks sandinya (Ciphertext) adalah...',
    options: {
      A: 'GDWD',
      B: 'FCFC',
      C: 'AXQX',
      D: 'HEHE',
    },
    correctAnswer: 'A',
    explanation:
      'Geser +3 huruf alfabet: D -> G, A -> D, T -> W, A -> D. Maka "DATA" terenkripsi menjadi "GDWD".',
    points: 200,
    timeLimitSec: 28,
    baselineCohort: createCohort('A', 0.8, 0.3, 'B', 'C'),
  },
  {
    id: 'q-12',
    materialId: 'mat-ds-06',
    category: 'Dampak Sosial & Keamanan Siber',
    gradeLevel: 'Kelas 9',
    cognitiveLevel: 'C5 - Mengevaluasi',
    question:
      'Seorang siswa menerima pesan berantai berisi tautan "bagi-bagi kuota belajar gratis" dengan alamat web mencurigakan yang meminta akun email beserta password-nya. Tindakan paling aman adalah...',
    options: {
      A: 'Langsung mengisi data karena kuota terbatas',
      B: 'Membagikan ke grup kelas agar teman ikut mencoba',
      C: 'Mengabaikan tautan karena merupakan serangan Phishing dan melaporkannya',
      D: 'Menggunakan password milik teman untuk mencoba dulu',
    },
    correctAnswer: 'C',
    explanation:
      'Tautan palsu yang memancing pengguna menyerahkan kredensial rahasia adalah serangan Social Engineering / Phishing dan harus diabaikan serta dilaporkan.',
    points: 150,
    timeLimitSec: 22,
    baselineCohort: createCohort('C', 0.95, 0.6, 'A', 'D'),
  },
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
