import type {
  CognitiveLevel,
  HistoricalCohortAttempt,
  InformaticsQuestion,
  MaterialCategory,
  OptionKey,
} from './informaticsData';

const K8_CATEGORY_MAP: Record<number, { id: string; category: MaterialCategory; zone: string }> = {
  1: {
    id: 'mat-k8-bab1',
    category: 'Bab 1 : Informatika dan Pembelajarannya',
    zone: 'Gedung Utama',
  },
  2: {
    id: 'mat-k8-bab2',
    category: 'Bab 2 : Berpikir Komputasional',
    zone: 'Gedung Kelas',
  },
  3: {
    id: 'mat-k8-bab3',
    category: 'Bab 3 : Teknologi Informasi dan Komunikasi',
    zone: 'Ruang Guru',
  },
  4: {
    id: 'mat-k8-bab4',
    category: 'Bab 4 : Sistem Komputer',
    zone: 'Lab Komputer',
  },
  5: {
    id: 'mat-k8-bab5',
    category: 'Bab 5 : Jaringan Komputer dan Internet',
    zone: 'Gerbang & Kantin',
  },
  6: {
    id: 'mat-k8-bab6',
    category: 'Bab 6 : Analisis Data',
    zone: 'Aula Serbaguna',
  },
  7: {
    id: 'mat-k8-bab7',
    category: 'Bab 7 : Algoritma dan Pemrograman',
    zone: 'Lab Komputer',
  },
  8: {
    id: 'mat-k8-bab8',
    category: 'Bab 8 : Dampak Sosial Informatika',
    zone: 'Masjid Al - Huda',
  },
  9: {
    id: 'mat-k8-bab9',
    category: 'Bab 9 : Praktik Lintas Bidang (Proyek)',
    zone: 'Aula Serbaguna',
  },
};

function buildCohort(correctKey: OptionKey, seed: number): HistoricalCohortAttempt[] {
  const allOptions: OptionKey[] = ['A', 'B', 'C', 'D'];
  const wrongs = allOptions.filter((o) => o !== correctKey);
  const popularWrong = wrongs[seed % wrongs.length];
  const secondWrong = wrongs[(seed + 1) % wrongs.length];
  const thirdWrong = wrongs[(seed + 2) % wrongs.length];
  const upperAcc = 0.8 + (seed % 3) * 0.05;
  const lowerAcc = 0.35 + (seed % 4) * 0.05;

  const attempts: HistoricalCohortAttempt[] = [];
  for (let i = 0; i < 10; i++) {
    const isCorrect = i < Math.round(upperAcc * 10);
    const chosen: OptionKey = isCorrect
      ? correctKey
      : i % 2 === 0
      ? popularWrong
      : secondWrong;
    attempts.push({
      studentId: `u8-${seed}-${i + 1}`,
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
      studentId: `l8-${seed}-${i + 1}`,
      studentName: `Siswa Bawah ${i + 1}`,
      totalScoreRankPercentile: 0.45 - i * 0.04,
      selectedOption: chosen,
      isCorrect,
      responseTimeMs: 6500 + i * 400,
    });
  }
  return attempts;
}

type RawQTuple = [
  number, // bab (1..9)
  number, // no (1..20)
  CognitiveLevel,
  string, // question
  [string, string, string, string], // options A, B, C, D
  OptionKey, // correctAnswer
  string // explanation
];

const RAW_KELAS_8_QUESTIONS: RawQTuple[] = [
  // ===========================================================================
  // BAB 1 KELAS 8: INFORMATIKA DAN PEMBELAJARANNYA (20 SOAL)
  // ===========================================================================
  [
    1, 1, 'C2 - Memahami',
    'Dalam gambaran "Rumah Informatika" Kurikulum Merdeka yang dipelajari di awal Kelas 8, elemen yang menjadi FONDASI paling dasar bagi seluruh pilar materi lainnya (Sistem Komputer, Jaringan, Analisis Data, dan Algoritma) adalah...',
    ['Berpikir Komputasional', 'Pengolah Kata Dasar', 'Desain Grafis Cetak', 'Instalasi Listrik Gedung'],
    'A',
    'Berpikir Komputasional merupakan fondasi utama cara berpikir dalam memecahkan masalah di seluruh bidang Informatika.',
  ],
  [
    1, 2, 'C2 - Memahami',
    'Tujuan dibuatnya Jurnal Refleksi Belajar oleh siswa Kelas 8 setiap selesai mempelajari satu bab Informatika adalah...',
    ['Evaluasi capaian & rencana belajar', 'Menyalin isi buku cetak penuh', 'Mengganti ujian praktik lab', 'Menghapus file tugas lama'],
    'A',
    'Refleksi pembelajaran membantu siswa menyadari capaian kompetensinya dan mengevaluasi bagian materi yang masih perlu diperdalam.',
  ],
  [
    1, 3, 'C1 - Mengingat',
    'Manakah dari elemen berikut yang BUKAN termasuk ke dalam pilar bangunan Rumah Informatika SMP/MTs?',
    ['Sistem Komputer (SK)', 'Jaringan Komputer (JKI)', 'Analisis Data (AD)', 'Pengecoran Beton Bangunan'],
    'D',
    'Pilar Rumah Informatika meliputi BK, TIK, SK, JKI, AD, AP, DSI, dan PLB.',
  ],
  [
    1, 4, 'C2 - Memahami',
    'Perbedaan kedalaman materi Informatika Kelas 8 dibandingkan saat masih di Kelas 7 adalah...',
    ['Pendalaman konsep & integrasi aplikasi', 'Belajar tanpa memakai komputer', 'Hanya mengetik huruf A sampai Z', 'Penghapusan materi algoritma'],
    'A',
    'Pembelajaran Kelas 8 memperluas dan memperdalam fondasi Kelas 7 ke tingkat analisis dan penerapan yang lebih kompleks.',
  ],
  [
    1, 5, 'C3 - Menerapkan',
    'Dalam kegiatan belajar berbasis proyek (Project-Based Learning) di Kelas 8, sikap Profil Pelajar Pancasila yang ditunjukkan ketika siswa menganalisis kebenaran data sebelum mengambil keputusan adalah...',
    ['Bernalar Kritis', 'Bekerja Tanpa Diskusi', 'Meniru Karya Orang', 'Menghindari Tugas Tim'],
    'A',
    'Bernalar kritis tampak saat siswa memproses informasi secara objektif, menganalisis data, dan mengevaluasi bukti sebelum menyimpulkan.',
  ],
  [
    1, 6, 'C2 - Memahami',
    'Bagian "Atap" pada ilustrasi Rumah Informatika yang menaungi seluruh pilar keilmuan dan menghubungkannya dengan penyelesaian masalah nyata di masyarakat adalah...',
    ['Praktik Lintas Bidang & Dampak Sosial', 'Instalasi Kabel Laboratorium', 'Penataan Meja Belajar Siswa', 'Pendingin Ruangan Server'],
    'A',
    'Praktik Lintas Bidang dan kesadaran Dampak Sosial memayungi penerapan seluruh pilar pengetahuan Informatika dalam kehidupan nyata.',
  ],
  [
    1, 7, 'C3 - Menerapkan',
    'Saat menyusun portofolio digital hasil karya Informatika selama Kelas 8, berkas-berkas yang sebaiknya disimpan di dalam folder portofolio siswa adalah...',
    ['Dokumentasi proyek, kode & jurnal', 'File sampah dan iklan internet', 'Foto pribadi tidak relevan', 'Shortcut aplikasi yang rusak'],
    'A',
    'Portofolio digital mendokumentasikan artefak karya terbaik, laporan tugas, dan perkembangan belajar siswa dari waktu ke waktu.',
  ],
  [
    1, 8, 'C2 - Memahami',
    'Pembelajaran Informatika yang dilakukan TANPA menggunakan perangkat komputer secara langsung (melainkan menggunakan permainan kartu logika, teka-teki kertas, atau simulasi gerak) disebut metode...',
    ['Computer Science Unplugged', 'Overclocking Prosesor CPU', 'Cloud Server Hosting', 'Simulasi Virtual Reality'],
    'A',
    'Metode Unplugged mengajarkan konsep berpikir komputasional dan logika algoritma melalui aktivitas fisik/permainan tanpa komputer.',
  ],
  [
    1, 9, 'C3 - Menerapkan',
    'Ketika kelompokmu membagi jadwal pembuatan laporan terintegrasi Kelas 8 menggunakan dokumen kolaboratif daring (Cloud Document), manfaat utamanya adalah...',
    ['Sunting bersama secara real-time', 'Hanya dibuka satu orang sebulan', 'Otomatis terhapus tanpa dicetak', 'Sinkronisasi tanpa jaringan internet'],
    'A',
    'Kolaborasi daring memungkinkan kerja tim secara real-time dengan riwayat revisi yang tercatat rapi.',
  ],
  [
    1, 10, 'C2 - Memahami',
    'Dalam Kurikulum Merdeka, tahapan pencapaian kompetensi siswa SMP/MTs Kelas 7, 8, dan 9 berada pada...',
    ['Fase D', 'Fase A', 'Fase B', 'Fase F'],
    'A',
    'Jenjang SMP/MTs (Kelas 7, 8, dan 9) dikelompokkan ke dalam Capaian Pembelajaran Fase D.',
  ],
  [
    1, 11, 'C3 - Menerapkan',
    'Seorang siswa Kelas 8 menuliskan di jurnal belajarnya: "Saya sudah lancar mengonversi biner ke desimal, tetapi masih perlu berlatih konversi ke heksadesimal." Manfaat catatan jujur seperti ini adalah...',
    ['Fokus melatih topik yang belum kuasai', 'Membuat nilai rapor langsung turun', 'Melarang siswa belajar kembali', 'Menghapus materi Sistem Komputer'],
    'A',
    'Evaluasi diri yang jujur (metakognisi) mempercepat perbaikan pemahaman pada submateri yang belum dikuasai.',
  ],
  [
    1, 12, 'C2 - Memahami',
    'Elemen mata pelajaran Informatika yang mempelajari cara kerja gerbang logika, pengalamatan memori, dan konversi bilangan biner/oktal/heksadesimal di Kelas 8 adalah...',
    ['Sistem Komputer (SK)', 'Teknologi Informasi (TIK)', 'Dampak Sosial (DSI)', 'Keterampilan Generik'],
    'A',
    'Gerbang logika dan arsitektur representasi bilangan dipelajari pada elemen Sistem Komputer Kelas 8.',
  ],
  [
    1, 13, 'C2 - Memahami',
    'Elemen Informatika Kelas 8 yang mempelajari fungsi pencarian referensi tabel (VLOOKUP/HLOOKUP), fungsi statistik bersyarat (SUMIF/COUNTIF), dan visualisasi grafik adalah...',
    ['Analisis Data (AD)', 'Jaringan Komputer (JKI)', 'Sistem Komputer (SK)', 'Sejarah Komputer Tua'],
    'A',
    'Pencarian referensi data, agregasi bersyarat, dan pembuatan grafik dipelajari dalam elemen Analisis Data Kelas 8.',
  ],
  [
    1, 14, 'C4 - Menganalisis',
    'Mengapa kemampuan komunikasi dan presentasi tetap dilatih pada pelajaran Informatika Kelas 8?',
    ['Agar solusi mudah dipahami pengguna', 'Karena dilarang menulis kode program', 'Komputer hanya bekerja lewat suara', 'Supaya bebas dari ujian sekolah'],
    'A',
    'Dalam dunia kerja maupun akademik, kemampuan mengomunikasikan ide teknis secara efektif sama pentingnya dengan kemampuan teknis itu sendiri.',
  ],
  [
    1, 15, 'C3 - Menerapkan',
    'Saat berdiskusi merancang proyek aplikasi sekolah, dua anggota kelompok memiliki ide desain yang berbeda. Cara penyelesaian terbaik sesuai semangat gotong royong adalah...',
    ['Musyawarah memadukan ide terbaik', 'Membatalkan pengerjaan proyek tim', 'Berdebat keras sepanjang pelajaran', 'Memaksakan ide sendiri sepihak'],
    'A',
    'Musyawarah objektif berdasarkan kebutuhan pengguna menghasilkan keputusan tim yang matang dan harmonis.',
  ],
  [
    1, 16, 'C2 - Memahami',
    'Apa yang dimaksud dengan "Belajar Bermakna" (Meaningful Learning) dalam pembelajaran Informatika di MTsN 14?',
    ['Menghubungkan konsep dengan dunia nyata', 'Menghafal buku tanpa paham makna', 'Menyalin jawaban teman sekelas', 'Hadir di kelas tanpa ikut praktik'],
    'A',
    'Belajar bermakna terjadi ketika siswa memahami alasan dan kegunaan nyata dari suatu konsep keilmuan.',
  ],
  [
    1, 17, 'C3 - Menerapkan',
    'Sebelum memulai praktikum di Laboratorium Komputer MTsN 14, langkah disiplin dan keselamatan kerja yang wajib dipatuhi siswa adalah...',
    ['Tertib, bebas makan/minum & sesuai SOP', 'Menaruh es batu di atas keyboard', 'Mencabut paksa kabel CPU menyala', 'Berlari di sela kabel jaringan'],
    'A',
    'Kedisiplinan K3 (Keselamatan dan Kesehatan Kerja) di laboratorium mencegah kerusakan alat serta bahaya kelistrikan.',
  ],
  [
    1, 18, 'C2 - Memahami',
    'Dimensi Profil Pelajar Pancasila "Kreatif" dalam mata pelajaran Informatika tercermin ketika siswa...',
    ['Menciptakan karya digital orisinal', 'Menjiplak karya dari internet', 'Menolak mencoba fitur aplikasi baru', 'Pasif menunggu instruksi teman'],
    'A',
    'Kreativitas dalam Informatika tampak dari kemampuan menghasilkan gagasan dan artefak komputasional yang orisinal.',
  ],
  [
    1, 19, 'C4 - Menganalisis',
    'Jika seorang siswa ingin membuat sistem peminjaman buku perpustakaan digital, elemen Informatika apa saja yang saling berkolaborasi di dalamnya?',
    ['BK, Analisis Data, Pemrograman & TIK', 'Hanya menggambar bebas tanpa data', 'Tanpa elemen ilmu Informatika', 'Hanya perangkat keras printer'],
    'A',
    'Sebuah proyek sistem informasi memadukan berbagai pilar Rumah Informatika secara utuh.',
  ],
  [
    1, 20, 'C5 - Mengevaluasi',
    'Mengapa dokumentasi laporan proyek dan penulisan komentar kode (code comments) sangat ditekankan sejak Kelas 8?',
    ['Mudah dipahami & dikembangkan lagi', 'Membuat ukuran file cepat penuh', 'Komputer hanya baca komentar teks', 'Mencegah orang membaca laporan'],
    'A',
    'Dokumentasi yang baik memastikan keberlanjutan (maintainability) sebuah proyek perangkat lunak.',
  ],

  // ===========================================================================
  // BAB 2 KELAS 8: BERPIKIR KOMPUTASIONAL (20 SOAL)
  // ===========================================================================
  [
    2, 1, 'C4 - Menganalisis',
    'Di dalam game Roblox MTsN 14, fitur tombol "Undo" menyimpan riwayat item dengan struktur data Tumpukan (Stack / LIFO: Last In, First Out). Jika kamu memasukkan item berurutan: [1. Buku] -> [2. Laptop] -> [3. Mouse], lalu menekan tombol ambil (Pop) satu kali, item yang keluar lebih dulu adalah...',
    ['Mouse', 'Buku', 'Laptop', 'Semua item sekaligus'],
    'A',
    'Struktur data Stack menggunakan prinsip LIFO (Last In, First Out), sehingga item terakhir yang masuk (Mouse) keluar pertama kali.',
  ],
  [
    2, 2, 'C3 - Menerapkan',
    'Mesin pemberi skor otomatis di pos Pak Azhary bekerja menggunakan rumus fungsi f(x) = 3x + 15, di mana x adalah jumlah komponen hardware yang kamu kumpulkan. Jika kamu mengumpulkan x = 12 komponen, maka output poin f(12) adalah...',
    ['51 Poin', '36 Poin', '45 Poin', '60 Poin'],
    'A',
    'Substitusikan x = 12 ke dalam f(x) = 3x + 15 -> f(12) = (3 × 12) + 15 = 36 + 15 = 51 Poin.',
  ],
  [
    2, 3, 'C2 - Memahami',
    'Dalam konsep Berpikir Komputasional Kelas 8, suatu pemetaan yang menghubungkan setiap nilai masukan (Input) dari domain tepat ke satu nilai keluaran (Output) berdasarkan aturan tertentu disebut...',
    ['Fungsi (Function)', 'Kabel Jaringan', 'Folder Direktori', 'Layar Monitor'],
    'A',
    'Fungsi memetakan nilai input (x) melalui aturan/rumus pemrosesan f(x) untuk menghasilkan output yang pasti.',
  ],
  [
    2, 4, 'C3 - Menerapkan',
    'Diketahui sebuah mesin fungsi g(x) = 2x² - 5. Jika nilai input yang dimasukkan adalah x = 4, berapakah nilai keluaran g(4)?',
    ['27', '11', '32', '21'],
    'A',
    'g(4) = 2 × (4²) - 5 = 2 × 16 - 5 = 32 - 5 = 27.',
  ],
  [
    2, 5, 'C4 - Menganalisis',
    'Sebuah mesin pengolah angka menerapkan fungsi f(x) = 4x - 7. Jika diketahui hasil keluaran (output) mesin tersebut adalah 25, berapakah nilai input x yang dimasukkan ke dalam mesin?',
    ['x = 8', 'x = 6', 'x = 9', 'x = 5'],
    'A',
    '4x - 7 = 25 -> 4x = 32 -> x = 32 ÷ 4 = 8.',
  ],
  [
    2, 6, 'C2 - Memahami',
    'Struktur data Antrean (Queue) yang diterapkan pada antrean kantin atau antrean cetak dokumen printer menggunakan prinsip...',
    ['FIFO (First In, First Out)', 'LIFO (Last In, First Out)', 'Random Access (Acak)', 'FILO (First In, Last Out)'],
    'A',
    'Queue (Antrean) menerapkan prinsip FIFO: elemen yang pertama kali masuk antrean adalah elemen pertama yang keluar/dilayani.',
  ],
  [
    2, 7, 'C4 - Menganalisis',
    'Pada printer Lab Komputer MTsN 14 masuk 4 perintah cetak berurutan: [Dokumen_A, Dokumen_B, Dokumen_C, Dokumen_D]. Karena antrean printer menggunakan struktur Queue (FIFO), urutan dokumen yang selesai dicetak dari awal hingga akhir adalah...',
    ['Dok_A, Dok_B, Dok_C, Dok_D', 'Dok_D, Dok_C, Dok_B, Dok_A', 'Dok_B, Dok_D, Dok_A, Dok_C', 'Hanya Dok_D yang dicetak'],
    'A',
    'Sesuai prinsip FIFO pada Queue, dokumen yang dikirim lebih awal dicetak lebih dahulu sesuai urutan kedatangan.',
  ],
  [
    2, 8, 'C3 - Menerapkan',
    'Dalam operasi struktur data Tumpukan (Stack), perintah untuk MENAMBAHKAN elemen baru ke puncak tumpukan dan perintah untuk MENGAMBIL elemen dari puncak tumpukan secara berturut-turut disebut...',
    ['Push dan Pop', 'Copy dan Paste', 'Upload dan Download', 'Login dan Logout'],
    'A',
    'Operasi dasar Stack adalah Push (menaruh item ke atas tumpukan) dan Pop (mengambil item paling atas dari tumpukan).',
  ],
  [
    2, 9, 'C4 - Menganalisis',
    'Sebuah Stack (Tumpukan) mula-mula kosong, lalu menerima rangkaian operasi berikut: Push(10) -> Push(20) -> Pop() -> Push(30) -> Push(40) -> Pop(). Angka berapakah yang sekarang berada di PUNCAK (paling atas) tumpukan?',
    ['30', '20', '40', '10'],
    'A',
    'Urutan isi Stack: [10] -> [10, 20] -> Pop mengeluarkan 20 sehingga sisa [10] -> Push(30) menjadi [10, 30] -> Push(40) menjadi [10, 30, 40] -> Pop mengeluarkan 40 sehingga puncak tumpukan sekarang adalah 30.',
  ],
  [
    2, 10, 'C3 - Menerapkan',
    'Konversikan bilangan biner 6-bit 101101(2) ke dalam sistem bilangan desimal (basis 10)!',
    ['45', '43', '37', '53'],
    'A',
    '101101(2) = (1×32) + (0×16) + (1×8) + (1×4) + (0×2) + (1×1) = 32 + 0 + 8 + 4 + 0 + 1 = 45.',
  ],
  [
    2, 11, 'C3 - Menerapkan',
    'Sistem bilangan Oktal menggunakan basis 8 yang terdiri atas digit angka...',
    ['Angka 0 sampai 7', 'Angka 1 sampai 8', 'Angka 0 dan 1 saja', 'Angka 0-9 dan huruf A-F'],
    'A',
    'Bilangan basis 8 (Oktal) hanya menggunakan 8 simbol angka yaitu 0, 1, 2, 3, 4, 5, 6, dan 7.',
  ],
  [
    2, 12, 'C3 - Menerapkan',
    'Berapakah nilai bilangan Oktal 25(8) jika dikonversikan ke dalam bilangan Desimal (basis 10)?',
    ['21', '25', '17', '20'],
    'A',
    '25(8) = (2 × 8¹) + (5 × 8⁰) = (2 × 8) + (5 × 1) = 16 + 5 = 21(10).',
  ],
  [
    2, 13, 'C3 - Menerapkan',
    'Jika bilangan desimal 19(10) diubah ke dalam sistem bilangan Oktal (basis 8), hasilnya adalah...',
    ['23(8)', '21(8)', '32(8)', '19(8)'],
    'A',
    '19 dibagi 8 menghasilkan 2 sisa 3. Maka dalam basis 8 ditulis 23(8).',
  ],
  [
    2, 14, 'C2 - Memahami',
    'Dalam ekspresi aritmatika komputer, cara penulisan operasi standar di mana operator diletakkan DI ANTARA dua operan (contoh: 5 + 3) disebut notasi...',
    ['Infix', 'Postfix', 'Prefix', 'Matrix'],
    'A',
    'Notasi Infix menempatkan operator di tengah-tengah dua operan (A + B), sedangkan Postfix menempatkan operator di belakang (A B +).',
  ],
  [
    2, 15, 'C4 - Menganalisis',
    'Terdapat 2 fungsi berantai: f(x) = x + 4 dan g(x) = 3x. Jika angka 5 dimasukkan lebih dulu ke fungsi f(x), lalu hasilnya dimasukkan ke fungsi g(x), berapakah hasil akhirnya?',
    ['27', '19', '15', '20'],
    'A',
    'Langkah 1: f(5) = 5 + 4 = 9. Langkah 2: masukkan 9 ke g(x) -> g(9) = 3 × 9 = 27.',
  ],
  [
    2, 16, 'C3 - Menerapkan',
    'Sebuah himpunan A = {Siswa Kelas 8A yang mengikuti ekskul Robotik} dan himpunan B = {Siswa Kelas 8A yang mengikuti ekskul Pramuka}. Siswa yang mengikuti KEDUA ekskul tersebut sekaligus berada pada bagian operasi himpunan yang disebut...',
    ['Irisan (Intersection / A AND B)', 'Gabungan (Union / A OR B)', 'Komplemen (NOT A)', 'Selisih Himpunan (A - B)'],
    'A',
    'Irisan dua himpunan memuat anggota yang sekaligus menjadi anggota himpunan A dan anggota himpunan B.',
  ],
  [
    2, 17, 'C4 - Menganalisis',
    'Di Kelas 8B yang berjumlah 32 siswa: 18 siswa gemar koding Scratch, 15 siswa gemar desain grafis, dan 5 siswa gemar keduanya. Berapa banyak siswa yang gemar koding Scratch ATAU desain grafis?',
    ['28 siswa', '33 siswa', '23 siswa', '10 siswa'],
    'A',
    'Menurut prinsip inklusi-eksklusi himpunan: n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = 18 + 15 - 5 = 28 siswa.',
  ],
  [
    2, 18, 'C4 - Menganalisis',
    'Tumpukan kardus buku di gudang perpustakaan hanya boleh diambil dari kardus paling atas satu per satu (Stack). Jika urutan dari BAWAH ke ATAS adalah: [Bawah: Matematika, IPA, Bahasa, Informatika :Atas], berapa kali petugas harus melakukan Pop untuk mengambil kardus IPA?',
    ['3 kali operasi Pop', '1 kali operasi Pop', '4 kali operasi Pop', '2 kali operasi Pop'],
    'A',
    'Untuk mengambil kardus IPA, petugas harus mengangkat kardus di atasnya terlebih dahulu: (1) Informatika, (2) Bahasa, baru (3) IPA.',
  ],
  [
    2, 19, 'C3 - Menerapkan',
    'Sebuah sandi blok mengubah setiap kelompok 3 bit biner menjadi 1 digit Oktal (misal 001=1, 010=2, 011=3, ..., 111=7). Jika kode biner adalah 110 101, maka nilai oktalnya adalah...',
    ['65(8)', '56(8)', '75(8)', '35(8)'],
    'A',
    'Kelompok pertama: 110(2) = 4+2+0 = 6. Kelompok kedua: 101(2) = 4+0+1 = 5. Maka hasilnya adalah 65(8).',
  ],
  [
    2, 20, 'C5 - Mengevaluasi',
    'Mengapa fitur tombol "Back" (Kembali ke halaman sebelumnya) pada aplikasi Web Browser sangat tepat diimplementasikan menggunakan struktur data Stack (LIFO)?',
    ['Halaman terakhir dikunjungi dibuka dulu', 'Memilih halaman web secara acak', 'Membuka halaman paling awal dulu', 'Menghapus seluruh memori komputer'],
    'A',
    'Riwayat kunjungan halaman web disimpan dalam tumpukan (Stack); saat klik Back, halaman terakhir yang masuk (Last In) diambil lebih dulu (First Out).',
  ],

  // ===========================================================================
  // BAB 3 KELAS 8: TEKNOLOGI INFORMASI DAN KOMUNIKASI (20 SOAL)
  // ===========================================================================
  [
    3, 1, 'C3 - Menerapkan',
    'Ketua kelas 8A sedang menyusun laporan hasil turnamen CBT di Microsoft Word dan ingin menyisipkan grafik batang dari Microsoft Excel agar setiap kali angka skor di Excel berubah, grafik di Word ikut terbarui secara otomatis. Teknik integrasi yang digunakan adalah...',
    ['Paste Special -> Paste Link', 'Ketik ulang angka manual', 'Potret layar dengan ponsel', 'Ubah file .xlsx jadi .mp3'],
    'A',
    'Fitur Paste Link / Linked Object menghubungkan grafik di dokumen Word dengan tabel sumber di Excel secara dinamis.',
  ],
  [
    3, 2, 'C2 - Memahami',
    'Menggabungkan dan menghubungkan data atau objek (seperti teks, tabel, dan grafik) di antara beberapa aplikasi perkantoran yang berbeda (Word, Excel, PowerPoint) agar bekerja saling melengkapi disebut...',
    ['Integrasi Aplikasi Perkantoran', 'Instalasi Sistem Operasi Baru', 'Pemformatan Ulang Harddisk', 'Perakitan Jaringan Lokal'],
    'A',
    'Integrasi aplikasi perkantoran menyatukan keunggulan pengolah kata, pengolah angka, dan presentasi dalam satu alur kerja.',
  ],
  [
    3, 3, 'C2 - Memahami',
    'Dalam konsep Object Linking and Embedding (OLE), perbedaan utama antara metode LINKING (Menautkan) dan EMBEDDING (Menanamkan) objek tabel Excel ke dalam Word adalah...',
    ['Linking terhubung sumber, Embedding mandiri', 'Linking hapus Excel, Embedding hapus Word', 'Embedding wajib internet, Linking merusak', 'Linking dan Embedding sama persis'],
    'A',
    'Linking menjaga tautan aktif ke file sumber, sedangkan Embedding menyalin objek sepenuhnya sebagai bagian internal dokumen tujuan.',
  ],
  [
    3, 4, 'C3 - Menerapkan',
    'Panitia kelulusan MTsN 14 ingin membuat 250 surat undangan wali murid di Microsoft Word yang isinya sama, namun bagian "Nama Siswa", "Kelas", dan "Alamat" otomatis terisi dari tabel daftar siswa di Microsoft Excel. Fitur yang paling tepat digunakan adalah...',
    ['Mail Merge (Surat Massal)', 'Find and Replace Manual', 'Screen Recording Layar', 'Page Numbering Otomatis'],
    'A',
    'Mail Merge menggabungkan satu template dokumen utama di Word dengan sumber data tabel (Excel) untuk menghasilkan ratusan dokumen personal secara otomatis.',
  ],
  [
    3, 5, 'C2 - Memahami',
    'Untuk melaksanakan pembuatan surat massal dengan fitur Mail Merge, diperlukan dua komponen file utama, yaitu...',
    ['Main Document (Word) & Data Source (Excel)', 'File Lagu MP3 & File Video MP4', 'Aplikasi Paint & Aplikasi Kalkulator', 'Dua buah printer warna berbeda'],
    'A',
    'Mail Merge membutuhkan Main Document (kerangka surat di Word) dan Data Source (daftar penerima di Excel/Access).',
  ],
  [
    3, 6, 'C3 - Menerapkan',
    'Saat menyusun karya tulis ilmiah atau laporan resmi madrasah yang memiliki 40 halaman di Microsoft Word, agar "Daftar Isi" beserta nomor halamannya dapat dibuat dan diperbarui secara otomatis, setiap judul bab dan subbab harus diatur menggunakan...',
    ['Heading Styles (Heading 1 & 2)', 'Ubah warna huruf secara manual', 'Ketik titik-titik secara manual', 'Tempel tabel Excel jadi gambar'],
    'A',
    'Penerapan Heading 1, Heading 2, dan Heading 3 memungkinkan fitur Table of Contents (Daftar Isi Otomatis) mengenali struktur bab dan nomor halamannya.',
  ],
  [
    3, 7, 'C2 - Memahami',
    'Menu pada Microsoft Word yang berisi fitur "Table of Contents" (Daftar Isi Otomatis), "Insert Caption" (Keterangan Gambar/Tabel), dan "Insert Citation" (Kutipan Daftar Pustaka) adalah tab menu...',
    ['References', 'Animations', 'Transitions', 'Draw'],
    'A',
    'Tab References menyediakan seluruh perkakas rujukan akademik seperti Daftar Isi, Catatan Kaki, Kutipan, dan Daftar Gambar.',
  ],
  [
    3, 8, 'C3 - Menerapkan',
    'Jika setelah selesai membuat Daftar Isi Otomatis ternyata ada tambahan halaman baru sehingga letak halaman Bab 3 bergeser dari halaman 12 ke halaman 15, langkah paling cepat untuk memperbarui nomor halaman di Daftar Isi adalah...',
    ['Klik Daftar Isi -> Update Table', 'Hapus laporan dan ketik ulang', 'Gunakan tipe-x di layar monitor', 'Ganti komputer dengan yang baru'],
    'A',
    'Tombol Update Table secara instan menyesuaikan kembali seluruh nomor halaman dan judul bab sesuai posisi terbaru.',
  ],
  [
    3, 9, 'C2 - Memahami',
    'Bagian atas dan bagian bawah halaman dokumen Word yang muncul secara berulang di setiap halaman (biasanya digunakan untuk menuliskan judul bab di atas dan nomor halaman di bawah) disebut...',
    ['Header dan Footer', 'Margin dan Orientation', 'Columns dan Breaks', 'Subscript dan Superscript'],
    'A',
    'Header terletak di margin atas setiap halaman, sedangkan Footer terletak di margin bawah setiap halaman.',
  ],
  [
    3, 10, 'C3 - Menerapkan',
    'Dalam satu dokumen laporan proyek Kelas 8, halaman "Kata Pengantar" dan "Daftar Isi" menggunakan nomor halaman angka Romawi kecil (i, ii, iii), sedangkan mulai "Bab 1 Pendahuluan" menggunakan angka Arab (1, 2, 3). Fitur pemisah halaman yang wajib disisipkan agar format nomor halaman dapat dibedakan adalah...',
    ['Section Breaks -> Next Page', 'Tekan Enter berkali-kali', 'Tekan Spasi sampai pindah', 'Ubah ukuran kertas amplop'],
    'A',
    'Section Break (Next Page) membagi dokumen menjadi seksi berbeda sehingga format penomoran halaman maupun orientasi kertas tiap seksi dapat diatur terpisah.',
  ],
  [
    3, 11, 'C2 - Memahami',
    'Fitur laboratorium virtual interaktif (seperti PhET Interactive Simulations) yang digunakan siswa untuk melakukan percobaan rangkaian listrik, optik, atau gaya gerak di layar komputer bermanfaat untuk...',
    ['Simulasi eksperimen sains secara aman', 'Mengganti olahraga lari di lapangan', 'Menghapus koneksi internet sekolah', 'Menjalankan PC tanpa sistem operasi'],
    'A',
    'Laboratorium maya (Virtual Lab) memungkinkan simulasi eksperimen sains dan informatika secara aman, murah, dan mudah diamati variabelnya.',
  ],
  [
    3, 12, 'C3 - Menerapkan',
    'Kamu ingin menyisipkan tabel perhitungan anggaran kegiatan OSIS langsung di dalam halaman Microsoft Word sehingga muncul tampilan baris-kolom dan rumus persis seperti Excel. Perintah yang dipilih pada menu Insert -> Table adalah...',
    ['Excel Spreadsheet', 'Draw Table Manual', 'Convert Text to Audio', 'SmartArt Graphic'],
    'A',
    'Pilihan Insert -> Table -> Excel Spreadsheet menanamkan objek lembar kerja Excel aktif langsung di dalam halaman Word.',
  ],
  [
    3, 13, 'C2 - Memahami',
    'Saat menyiapkan bahan presentasi laporan di Microsoft PowerPoint, perbedaan antara "Transitions" dan "Animations" adalah...',
    ['Transitions antar-slide, Animations objek', 'Transitions suara, Animations cetak kertas', 'Animations pindah slide, Transitions huruf', 'Keduanya fitur menghapus slide'],
    'A',
    'Slide Transition bekerja saat berpindah dari satu slide ke slide berikutnya, sementara Animation menggerakkan elemen di dalam slide.',
  ],
  [
    3, 14, 'C3 - Menerapkan',
    'Pada aplikasi PowerPoint, tombol pintas (shortcut) untuk memulai tayangan presentasi (Slide Show) dari slide PERTAMA adalah...',
    ['Tombol F5', 'Tombol Esc', 'Ctrl + W', 'Alt + F4'],
    'A',
    'Menekan tombol F5 pada keyboard langsung menjalankan mode layar penuh Slide Show mulai dari slide pertama.',
  ],
  [
    3, 15, 'C3 - Menerapkan',
    'Jika kamu ingin membuat struktur kerangka presentasi PowerPoint secara cepat dari daftar judul dan poin-poin yang sudah diketik rapi dengan Heading di Microsoft Word, fitur yang digunakan adalah...',
    ['New Slide -> Slides from Outline', 'Cetak kertas lalu tempel ke layar', 'Perkecil ukuran kertas dokumen Word', 'Hapus seluruh teks di dokumen Word'],
    'A',
    'Fitur Slides from Outline mengonversi dokumen Word berstruktur Heading 1 dan Heading 2 menjadi judul dan poin-poin slide PowerPoint secara otomatis.',
  ],
  [
    3, 16, 'C2 - Memahami',
    'Fitur untuk menangkap gambar tampilan yang sedang terbuka di layar komputer lalu langsung menyisipkannya ke dalam dokumen Word atau slide PowerPoint tanpa aplikasi tambahan adalah...',
    ['Insert -> Screenshot', 'Insert -> Equation', 'Insert -> Symbol', 'File -> Print'],
    'A',
    'Fitur Insert Screenshot / Screen Clipping (atau Win + Shift + S) memudahkan pengambilan tangkapan layar secara langsung.',
  ],
  [
    3, 17, 'C3 - Menerapkan',
    'Untuk memberikan keterangan nomor urut otomatis di bawah setiap gambar pada laporan (misalnya "Gambar 1.1 Denah Kampus MTsN 14") agar nantinya dapat dibuat Daftar Gambar otomatis, fitur yang digunakan adalah...',
    ['References -> Insert Caption', 'Home -> Bold Text', 'View -> Zoom Page', 'Review -> Word Count'],
    'A',
    'Insert Caption memberi label penomoran otomatis pada gambar maupun tabel sehingga dapat dirujuk ke dalam Table of Figures (Daftar Gambar).',
  ],
  [
    3, 18, 'C4 - Menganalisis',
    'Seorang siswa menyalin tabel dari Excel lalu menempelkannya ke Word menggunakan opsi "Paste as Picture" (Tempel sebagai Gambar). Apa konsekuensi dari pilihan tersebut?',
    ['Menjadi gambar statis & tak bisa diedit', 'Angka masih bisa dihitung rumus =SUM()', 'Tabel terhubung real-time ke internet', 'Ukuran kertas berubah jadi lingkaran'],
    'A',
    'Menempelkan tabel sebagai gambar (Picture) membekukan tampilannya menjadi citra statis yang tidak dapat disunting selnya.',
  ],
  [
    3, 19, 'C3 - Menerapkan',
    'Dalam kerja kelompok menyusun dokumen laporan di Microsoft Word, fitur yang memungkinkan guru atau ketua kelompok memberikan catatan perbaikan di pinggir halaman serta merekam setiap perubahan teks yang dilakukan anggota adalah...',
    ['Review -> Track Changes & Comment', 'Insert -> Shapes & Icons', 'Design -> Page Watermark', 'Layout -> Custom Margins'],
    'A',
    'Track Changes melacak setiap penyuntingan teks dan New Comment menambahkan balon komentar peninjauan tanpa merusak naskah asli.',
  ],
  [
    3, 20, 'C5 - Mengevaluasi',
    'Mengapa penggunaan fitur integrasi seperti Mail Merge dan Daftar Isi Otomatis sangat dianjurkan dalam dunia pendidikan maupun perkantoran modern?',
    ['Hemat waktu, akurat & rapi standar', 'Membuat pekerjaan jadi lebih rumit', 'Hanya jalan tanpa layar monitor', 'Mencegah dokumen dicetak printer'],
    'A',
    'Otomatisasi dokumen melalui fitur integrasi menghemat waktu kerja berjam-jam dan menjamin akurasi data.',
  ],

  // ===========================================================================
  // BAB 4 KELAS 8: SISTEM KOMPUTER (20 SOAL)
  // ===========================================================================
  [
    4, 1, 'C4 - Menganalisis',
    'Pintu ruang server Lab MTsN 14 dikunci dengan sirkuit Gerbang Logika: Output = (A AND B) OR C. Pintu akan terbuka jika Output bernilai 1. Jika saklar A = 1, saklar B = 0, dan saklar C = 0, maka kondisi pintu server adalah...',
    ['0 (Pintu Tetap Terkunci)', '1 (Pintu Terbuka Lebar)', '1 (Semua Gerbang True)', 'Alarm Konsleting Aktif'],
    'A',
    '(A=1 AND B=0) menghasilkan 0. Selanjutnya (0 OR C=0) menghasilkan 0, sehingga pintu tetap terkunci.',
  ],
  [
    4, 2, 'C3 - Menerapkan',
    'Komputer di Lab Informatika mengirimkan kode biner 5-bit sebesar 11010(2) ke layar monitor. Berapakah nilai bilangan desimal (basis 10) dari kode biner tersebut?',
    ['26', '22', '24', '28'],
    'A',
    '11010(2) = (1×16) + (1×8) + (0×4) + (1×2) + (0×1) = 16 + 8 + 0 + 2 + 0 = 26(10).',
  ],
  [
    4, 3, 'C2 - Memahami',
    'Di dalam arsitektur CPU (Central Processing Unit), bagian yang bertugas mengatur dan mengendalikan jalannya instruksi program serta mengoordinasikan aliran data antar-komponen adalah...',
    ['Control Unit (CU)', 'Arithmetic Logic Unit (ALU)', 'Power Supply Unit (PSU)', 'Optical Disk Drive (ODD)'],
    'A',
    'Control Unit (CU) bertugas mengambil instruksi dari memori, menerjemahkannya, dan mengatur sinyal kendali ke komponen lain.',
  ],
  [
    4, 4, 'C2 - Memahami',
    'Memori berukuran sangat kecil namun berkecepatan paling tinggi yang berada langsung di dalam inti prosesor (CPU) untuk menyimpan data sementara yang sedang diproses saat itu juga disebut...',
    ['Register CPU', 'Harddisk Eksternal', 'Flashdisk USB', 'Keping DVD-ROM'],
    'A',
    'Register adalah lokasi penyimpanan internal tercepat di dalam CPU untuk memegang operan dan hasil instruksi sesaat.',
  ],
  [
    4, 5, 'C2 - Memahami',
    'Siklus kerja pemrosesan instruksi oleh CPU secara berurutan terdiri atas tiga tahapan utama, yaitu...',
    ['Fetch -> Decode -> Execute', 'Shutdown -> Restart -> Sleep', 'Print -> Scan -> Copy', 'Delete -> Format -> Install'],
    'A',
    'Siklus instruksi mesin (Machine Cycle) selalu berjalan melalui tahapan Fetch, Decode, dan Execute.',
  ],
  [
    4, 6, 'C1 - Mengingat',
    'Gerbang logika dasar yang hanya menghasilkan keluaran (Output) bernilai 1 jika SEMUA masukannya (Input A dan Input B) bernilai 1 adalah gerbang...',
    ['AND', 'OR', 'NOT', 'XOR'],
    'A',
    'Gerbang AND bekerja seperti perkalian logika: bernilai 1 hanya ketika A=1 dan B=1.',
  ],
  [
    4, 7, 'C1 - Mengingat',
    'Gerbang logika dasar yang menghasilkan keluaran (Output) bernilai 1 apabila SALAH SATU atau KEDUA masukannya bernilai 1 adalah gerbang...',
    ['OR', 'AND', 'NOT', 'NAND'],
    'A',
    'Gerbang OR menghasilkan 1 selama minimal ada satu input yang bernilai 1; hanya bernilai 0 jika semua input 0.',
  ],
  [
    4, 8, 'C1 - Mengingat',
    'Gerbang logika pembalik (Inverter) yang hanya memiliki 1 masukan dan selalu membalik nilainya (jika Input 1 maka Output 0, jika Input 0 maka Output 1) adalah gerbang...',
    ['NOT', 'AND', 'OR', 'NOR'],
    'A',
    'Gerbang NOT (Inverter) membalikkan keadaan logika masukan menjadi kebalikannya.',
  ],
  [
    4, 9, 'C3 - Menerapkan',
    'Gerbang logika NAND merupakan gabungan dari gerbang AND yang diikuti oleh gerbang NOT. Jika Input A = 1 dan Input B = 1 dimasukkan ke gerbang NAND, maka Output-nya adalah...',
    ['0', '1', '2', '-1'],
    'A',
    'Pada gerbang AND, input (1, 1) menghasilkan 1. Karena NAND membalik hasil AND (NOT AND), maka 1 dibalik menjadi 0.',
  ],
  [
    4, 10, 'C3 - Menerapkan',
    'Gerbang logika XOR (Exclusive OR) menghasilkan Output = 1 hanya jika kedua inputnya memiliki nilai yang BERBEDA. Maka hasil dari (1 XOR 1) dan (1 XOR 0) secara berturut-turut adalah...',
    ['0 dan 1', '1 dan 1', '0 dan 0', '1 dan 0'],
    'A',
    'Karena (1 dan 1) bernilai sama maka 1 XOR 1 = 0; sedangkan (1 dan 0) bernilai berbeda maka 1 XOR 0 = 1.',
  ],
  [
    4, 11, 'C4 - Menganalisis',
    'Perhatikan rangkaian gerbang logika berikut: Output = NOT(A OR B). Jika diketahui Input A = 0 dan Input B = 0, berapakah nilai Output rangkaian tersebut?',
    ['1', '0', '-1', '2'],
    'A',
    'Langkah 1: (A=0 OR B=0) menghasilkan 0. Langkah 2: NOT(0) membalikkan nilai 0 menjadi 1.',
  ],
  [
    4, 12, 'C2 - Memahami',
    'Sistem bilangan Heksadesimal adalah sistem bilangan berbasis 16 yang menggunakan 16 simbol karakter, yaitu...',
    ['Angka 0-9 dan huruf A-F', 'Angka 0-15 tanpa huruf', 'Angka 0 sampai 7 saja', 'Huruf A sampai P saja'],
    'A',
    'Heksadesimal (basis 16) menggunakan digit 0–9 untuk nilai 0–9, serta huruf A=10, B=11, C=12, D=13, E=14, dan F=15.',
  ],
  [
    4, 13, 'C2 - Memahami',
    'Dalam sistem bilangan Heksadesimal (basis 16), huruf "A", "C", dan "F" masing-masing mewakili nilai desimal...',
    ['A = 10, C = 12, F = 15', 'A = 1, C = 3, F = 6', 'A = 11, C = 13, F = 16', 'A = 10, C = 14, F = 18'],
    'A',
    'Urutan nilai huruf heksadesimal adalah A=10, B=11, C=12, D=13, E=14, dan F=15.',
  ],
  [
    4, 14, 'C3 - Menerapkan',
    'Konversikan bilangan Heksadesimal 2F(16) ke dalam bilangan Desimal (basis 10)!',
    ['47', '37', '45', '35'],
    'A',
    '2F(16) = (2 × 16¹) + (15 × 16⁰) = 32 + 15 = 47(10).',
  ],
  [
    4, 15, 'C3 - Menerapkan',
    'Ubahlah bilangan Desimal 29(10) ke dalam bentuk bilangan Biner 5-bit!',
    ['11101(2)', '11011(2)', '10111(2)', '11110(2)'],
    'A',
    '29 = 16 + 8 + 4 + 0 + 1 = (1×16) + (1×8) + (1×4) + (0×2) + (1×1) = 11101(2).',
  ],
  [
    4, 16, 'C3 - Menerapkan',
    'Setiap 1 digit bilangan Heksadesimal mewakili tepat 4 bit bilangan Biner. Jika terdapat kode biner 8-bit: 1010 1100(2), maka bentuk Heksadesimalnya adalah...',
    ['AC(16)', 'AB(16)', 'BC(16)', 'CA(16)'],
    'A',
    '4 bit pertama: 1010(2) = 10 = A. 4 bit kedua: 1100(2) = 12 = C. Sehingga 1010 1100(2) = AC(16).',
  ],
  [
    4, 17, 'C2 - Memahami',
    'Pada desain halaman web dan grafis komputer, kode warna RGB sering ditulis dalam format Heksadesimal 6 digit seperti "#FF0000" (Merah Murni). Dua digit pertama (FF) menunjukkan intensitas warna Merah sebesar...',
    ['255', '100', '16', '0'],
    'A',
    'FF(16) = (15 × 16) + 15 = 240 + 15 = 255, yaitu tingkat kecerahan tertinggi untuk kanal warna 8-bit.',
  ],
  [
    4, 18, 'C2 - Memahami',
    'Mengapa sistem komputer menggunakan pengalamatan memori Heksadesimal ketika menampilkan alamat lokasi di RAM kepada teknisi/programmer?',
    ['Ringkas & mudah dibaca manusia', 'Komputer bekerja tanpa listrik', 'Hanya memakai angka nol saja', 'Mengubah RAM menjadi Harddisk'],
    'A',
    'Satu digit Heksadesimal meringkas 4 digit Biner, sehingga alamat memori 32-bit cukup ditulis dengan 8 karakter Heksadesimal.',
  ],
  [
    4, 19, 'C2 - Memahami',
    'Jalur penghubung elektronik pada motherboard yang mengalirkan alamat memori, data, dan sinyal kendali antara CPU, RAM, dan perangkat Input/Output disebut...',
    ['Sistem Bus Motherboard', 'Kabel HDMI Eksternal', 'Jaringan Satelit Orbit', 'Pipa Pendingin Cairan'],
    'A',
    'Sistem Bus terdiri atas Data Bus (mengangkut data), Address Bus (menunjuk alamat memori), dan Control Bus (sinyal perintah).',
  ],
  [
    4, 20, 'C4 - Menganalisis',
    'Sebuah lampu taman otomatis menyala (Output = 1) HANYA JIKA sensor cahaya mendeteksi kondisi gelap (G = 1) DAN saklar utama dalam keadaan aktif (S = 1). Namun lampu juga bisa dinyalakan paksa kapan saja jika tombol darurat ditekan (D = 1). Ekspresi logika yang tepat adalah...',
    ['Output = (G AND S) OR D', 'Output = (G OR S) AND NOT D', 'Output = NOT(G AND S)', 'Output = G AND S AND D'],
    'A',
    'Syarat normal adalah (G AND S), dan karena tombol darurat D dapat menyalakan lampu kapan saja, maka digabung dengan OR D menjadi (G AND S) OR D.',
  ],

  // ===========================================================================
  // BAB 5 KELAS 8: JARINGAN KOMPUTER DAN INTERNET (20 SOAL)
  // ===========================================================================
  [
    5, 1, 'C4 - Menganalisis',
    'Ketika kamu bergerak di arena multiplayer MTsN 14, paket data posisimu dikirim dari komputer Lab menuju server melalui beberapa titik Router. Proses pemilihan jalur terpendek dan tercepat oleh Router agar paket data sampai ke tujuan disebut...',
    ['Routing', 'Formatting Disk', 'Defragmentasi Memori', 'Rendering Grafis 3D'],
    'A',
    'Routing adalah mekanisme pengiriman paket data melalui jalur terbaik/tercepat dari satu jaringan ke jaringan lainnya.',
  ],
  [
    5, 2, 'C2 - Memahami',
    'Urutan jangkauan jaringan komputer dari yang cakupannya PALING SEMPIT (lokal satu ruangan) hingga yang PALING LUAS (antarnegara/dunia) adalah...',
    ['LAN -> MAN -> WAN (Internet)', 'WAN -> MAN -> LAN', 'MAN -> WAN -> LAN', 'Internet -> LAN -> Bluetooth'],
    'A',
    'LAN mencakup satu ruangan/gedung, MAN mencakup satu kota, dan WAN/Internet mencakup wilayah antarnegara hingga seluruh dunia.',
  ],
  [
    5, 3, 'C1 - Mengingat',
    'Perangkat keras jaringan yang berfungsi menghubungkan banyak komputer di dalam satu jaringan lokal (LAN) menggunakan kabel UTP (RJ-45) adalah...',
    ['Switch / Hub', 'Proyektor', 'Scanner', 'Speaker'],
    'A',
    'Switch menghubungkan perangkat-perangkat komputer dalam satu jaringan LAN dan meneruskan paket data ke komputer tujuan.',
  ],
  [
    5, 4, 'C2 - Memahami',
    'Perangkat jaringan yang berfungsi menghubungkan dua atau lebih jaringan yang memiliki alamat jaringan (Network ID) berbeda serta menentukan rute pengiriman paket data adalah...',
    ['Router', 'Mouse', 'Keyboard', 'Plotter'],
    'A',
    'Router bertugas menghubungkan jaringan yang berbeda (misal jaringan LAN sekolah ke jaringan internet ISP) dan melakukan routing.',
  ],
  [
    5, 5, 'C2 - Memahami',
    'Ketika sebuah file besar dikirim melalui internet, file tersebut tidak dikirim utuh sekaligus, melainkan dipecah menjadi potongan-potongan kecil bernomor urut agar efisien melewati jaringan. Potongan data tersebut dinamakan...',
    ['Paket Data (Data Packet)', 'Kepingan CD', 'Folder Fisik', 'Partisi Harddisk'],
    'A',
    'Dalam jaringan berbasis Packet Switching (TCP/IP), data dipecah menjadi paket-paket kecil (packets) dan disusun kembali di perangkat penerima.',
  ],
  [
    5, 6, 'C1 - Mengingat',
    'Deretan angka identitas unik (contoh: 192.168.1.10) yang dimiliki oleh setiap perangkat komputer atau smartphone yang terhubung ke jaringan TCP/IP disebut...',
    ['IP Address (Alamat IP)', 'Kode Pos Kelurahan', 'Nomor Induk Siswa', 'Ukuran Resolusi Layar'],
    'A',
    'IP Address (Internet Protocol Address) adalah alamat numerik unik sebagai identitas perangkat di dalam jaringan komputer.',
  ],
  [
    5, 7, 'C2 - Memahami',
    'Layanan pada jaringan internet yang berfungsi menerjemahkan nama domain situs web (seperti mtsn14-jakarta.sch.id) menjadi alamat IP numerik yang dimengerti komputer adalah...',
    ['DNS (Domain Name System)', 'USB (Universal Serial Bus)', 'VGA (Video Graphics Array)', 'PSU (Power Supply Unit)'],
    'A',
    'DNS bekerja seperti buku telepon internet yang memetakan nama domain yang mudah diingat manusia ke alamat IP server.',
  ],
  [
    5, 8, 'C4 - Menganalisis',
    'Perhatikan peta jaringan berikut: Router A ke Router B berjarak 4 ms, Router B ke Server berjarak 5 ms. Jalur kedua: Router A ke Router C berjarak 3 ms, Router C ke Server berjarak 10 ms. Jalur manakah yang akan dipilih algoritma Routing terpendek dari Router A ke Server?',
    ['Jalur A -> B -> Server (9 ms)', 'Jalur A -> C -> Server (13 ms)', 'Jalur B -> C -> A (17 ms)', 'Paket dihapus di tengah jalan'],
    'A',
    'Total waktu jalur A -> B -> Server adalah 4 + 5 = 9 ms, lebih cepat daripada jalur A -> C -> Server (3 + 10 = 13 ms).',
  ],
  [
    5, 9, 'C2 - Memahami',
    'Dalam jaringan seluler pada smartphone (2G, 3G, 4G LTE, hingga 5G), huruf "G" merupakan singkatan dari...',
    ['Generation (Generasi Jaringan)', 'Gigabyte Kapasitas Memori', 'Graphics Kartu Layar', 'Ground Kabel Listrik'],
    'A',
    'Huruf G berarti Generation (Generasi), di mana setiap generasi baru menawarkan kecepatan transfer data lebih tinggi dan latensi lebih rendah.',
  ],
  [
    5, 10, 'C1 - Mengingat',
    'Stasiun pemancar dan penerima sinyal radio seluler berbentuk menara tinggi yang menghubungkan ponsel pengguna dengan jaringan operator telekomunikasi disebut...',
    ['BTS (Base Transceiver Station)', 'CPU (Central Processing Unit)', 'UPS (Uninterruptible Power Supply)', 'LCD (Liquid Crystal Display)'],
    'A',
    'Menara BTS (Base Transceiver Station) memancarkan cakupan sinyal seluler bagi perangkat telepon genggam di sekitarnya.',
  ],
  [
    5, 11, 'C3 - Menerapkan',
    'Faktor fisik di lingkungan sekitar yang dapat MELEMAHKAN kekuatan sinyal Wi-Fi atau sinyal seluler di dalam ruangan adalah...',
    ['Tembok tebal, jarak jauh & interferensi', 'Udara bersih di pagi hari', 'Meja belajar kayu di kelas', 'Cahaya lampu belajar di meja'],
    'A',
    'Gelombang radio mengalami redaman (attenuation) saat menembus dinding beton/logam tebal serta ketika jarak dari pemancar semakin jauh.',
  ],
  [
    5, 12, 'C2 - Memahami',
    'Media transmisi kabel jaringan berkecepatan sangat tinggi yang mengirimkan data menggunakan pulsa CAHAYA melalui serat kaca halus disebut...',
    ['Kabel Fiber Optik', 'Kabel Tembaga Coaxial', 'Kabel Listrik Setrika', 'Kawat Logam Jemuran'],
    'A',
    'Fiber Optik mentransmisikan data menggunakan sinyal cahaya sehingga mampu mencapai kecepatan gigabit jarak jauh tanpa gangguan elektromagnetik.',
  ],
  [
    5, 13, 'C2 - Memahami',
    'Sistem keamanan jaringan komputer yang bertugas memantau, menyaring, dan memblokir lalu lintas jaringan yang mencurigakan atau tidak sah disebut...',
    ['Firewall', 'Motherboard', 'Screensaver', 'Spreadsheet'],
    'A',
    'Firewall bertindak sebagai dinding pelindung antara jaringan internal yang aman dan jaringan luar (internet).',
  ],
  [
    5, 14, 'C3 - Menerapkan',
    'Saat kita sedang mengakses internet di kafe atau tempat umum menggunakan "Free Public Wi-Fi" tanpa password, tindakan keamanan yang wajib dihindari adalah...',
    ['Transaksi bank & input password penting', 'Membaca artikel berita pengetahuan', 'Melihat prakiraan cuaca harian', 'Mematikan Wi-Fi setelah selesai'],
    'A',
    'Jaringan Wi-Fi publik terbuka rawan terhadap penyadapan paket data (sniffing / Man-in-the-Middle), sehingga hindari transaksi sensitif.',
  ],
  [
    5, 15, 'C2 - Memahami',
    'Apa yang dimaksud dengan "Bandwidth" pada jaringan internet sekolah?',
    ['Kapasitas maksimal transfer data/detik', 'Lebar fisik layar monitor lab', 'Berat perangkat router dalam gram', 'Jumlah kursi di ruang komputer'],
    'A',
    'Bandwidth diibaratkan seperti lebar jalan raya: semakin besar bandwidth, semakin banyak data yang dapat mengalir per detik.',
  ],
  [
    5, 16, 'C2 - Memahami',
    'Perangkat yang berfungsi mengubah sinyal digital dari komputer menjadi sinyal analog/optik untuk dikirim melalui jalur penyedia internet (ISP) dan sebaliknya disebut...',
    ['Modem (Modulator Demodulator)', 'Speaker Audio Aktif', 'Mouse Optik Wireless', 'Barcode Scanner Kasir'],
    'A',
    'Modem adalah singkatan dari Modulator-Demodulator yang menjembatani sinyal jaringan ISP dengan perangkat jaringan rumah/sekolah.',
  ],
  [
    5, 17, 'C3 - Menerapkan',
    'Untuk menguji apakah komputer kita di Lab MTsN 14 sudah terhubung dengan baik ke server lokal atau internet melalui Command Prompt, perintah jaringan yang biasa diketik adalah...',
    ['ping [alamat_IP]', 'format C:', 'del *.*', 'shutdown -s'],
    'A',
    'Perintah "ping" mengirimkan paket uji (ICMP Echo) ke alamat tujuan untuk mengukur konektivitas dan waktu respons (latency/ms).',
  ],
  [
    5, 18, 'C2 - Memahami',
    'Waktu tunda yang dibutuhkan sebuah paket data untuk berjalan dari perangkat pengirim menuju server tujuan (diukur dalam satuan milidetik / ms) disebut...',
    ['Latency (Ping / Waktu Tunda)', 'Resolusi Layar Monitor', 'Kapasitas Harddisk Utama', 'Ukuran Font Dokumen'],
    'A',
    'Latency yang rendah (misal 5 ms – 20 ms) membuat permainan multiplayer real-time dan panggilan video berjalan responsif tanpa jeda (lag).',
  ],
  [
    5, 19, 'C4 - Menganalisis',
    'Mengapa sistem pengiriman paket data di internet dirancang agar setiap paket dapat melewati rute Router alternatif jika salah satu jalur kabel utama putus?',
    ['Tetap andal lewat jalur cadangan', 'Membuat paket data hilang di jalan', 'Melipatgandakan biaya kirim email', 'Menghapus alamat tujuan server'],
    'A',
    'Keunggulan utama routing dinamis pada jaringan packet-switched adalah kemampuan mengalihkan jalur secara otomatis saat terjadi kerusakan di satu titik.',
  ],
  [
    5, 20, 'C5 - Mengevaluasi',
    'Sekolah MTsN 14 ingin menghubungkan 30 komputer meja (PC Desktop) tetap di ruang Lab Ujian CBT agar memiliki koneksi paling stabil dan tidak terpengaruh gangguan sinyal radio. Media koneksi yang paling tepat dipilih adalah...',
    ['Kabel LAN UTP Cat6 & Switch Gigabit', 'Tethering Bluetooth satu ponsel', 'Sinar inframerah remote televisi', 'Sambungan kawat jemuran biasa'],
    'A',
    'Untuk PC Desktop tetap di ruang ujian CBT, kabel LAN UTP memberikan kecepatan penuh yang stabil, latensi sangat rendah, dan bebas interferensi.',
  ],

  // ===========================================================================
  // BAB 6 KELAS 8: ANALISIS DATA (20 SOAL)
  // ===========================================================================
  [
    6, 1, 'C3 - Menerapkan',
    'Pak Azhary ingin menghitung banyaknya siswa Kelas 8 yang berhasil meraih skor CBT di atas atau sama dengan 85 pada rentang sel D2 sampai D36. Rumus fungsi bersyarat yang tepat digunakan adalah...',
    ['=COUNTIF(D2:D36, ">=85")', '=SUM(D2:D36, ">=85")', '=AVERAGE(D2:D36)', '=VLOOKUP(85, D2:D36, 1)'],
    'A',
    'Fungsi =COUNTIF(range, criteria) digunakan untuk menghitung jumlah sel yang memenuhi kriteria tertentu (">=85").',
  ],
  [
    6, 2, 'C2 - Memahami',
    'Fungsi pencarian referensi pada Microsoft Excel yang digunakan untuk mencari suatu nilai kunci pada kolom paling kiri sebuah tabel referensi yang disusun secara VERTIKAL (tegak) adalah...',
    ['=VLOOKUP(...)', '=HLOOKUP(...)', '=SUMIF(...)', '=AVERAGE(...)'],
    'A',
    'VLOOKUP (Vertical Lookup) mencari data secara vertikal ke bawah pada kolom pertama tabel referensi.',
  ],
  [
    6, 3, 'C2 - Memahami',
    'Sebaliknya, jika tabel referensi disusun memanjang ke samping secara HORIZONTAL (mendatar), maka fungsi pembacaan tabel yang digunakan adalah...',
    ['=HLOOKUP(...)', '=VLOOKUP(...)', '=COUNTIF(...)', '=MAX(...)'],
    'A',
    'HLOOKUP (Horizontal Lookup) mencari nilai kunci pada baris paling atas dari tabel referensi horizontal.',
  ],
  [
    6, 4, 'C3 - Menerapkan',
    'Perhatikan penulisan rumus "=VLOOKUP(A2, $F$2:$H$10, 3, FALSE)". Angka "3" pada parameter ketiga rumus tersebut menunjukkan...',
    ['Nomor indeks kolom ke-3 tabel', 'Jumlah baris yang dihapus', 'Hasil akhir pasti bernilai 3', 'Ukuran huruf diperbesar 3x'],
    'A',
    'Parameter col_index_num (angka 3) memerintahkan VLOOKUP mengambil data dari kolom ke-3 di dalam tabel referensi.',
  ],
  [
    6, 5, 'C4 - Menganalisis',
    'Pada rumus "=VLOOKUP(B2, $G$2:$I$15, 2, FALSE)", mengapa parameter terakhir diisi dengan logika "FALSE" (atau angka 0)?',
    ['Mencari kecocokan persis (Exact Match)', 'Menghasilkan nilai salah sengaja', 'Mengurutkan tabel secara otomatis', 'Menghapus isi tabel referensi'],
    'A',
    'Argumen FALSE (0) pada VLOOKUP memastikan pencarian hanya mengambil data jika ditemukan kode yang sama persis (Exact Match).',
  ],
  [
    6, 6, 'C3 - Menerapkan',
    'Pada tabel kas sumbangan buku MTsN 14, Kolom B berisi "Kelas" (7A, 8A, 9A) dan Kolom C berisi "Jumlah Buku". Jika kita ingin menjumlahkan total buku khusus yang disumbangkan oleh "Kelas 8A" saja, rumus yang digunakan adalah...',
    ['=SUMIF(B2:B50, "Kelas 8A", C2:C50)', '=COUNTIF(B2:B50, "Kelas 8A")', '=SUM(C2:C50)', '=MAX(B2:B50)'],
    'A',
    '=SUMIF(range_kriteria, kriteria, sum_range) menjumlahkan angka pada kolom C hanya untuk baris yang kolom B-nya bernilai "Kelas 8A".',
  ],
  [
    6, 7, 'C4 - Menganalisis',
    'Apakah perbedaan utama antara fungsi "=COUNT(A2:A20)" dan fungsi "=COUNTA(A2:A20)" pada lembar kerja spreadsheet?',
    ['COUNT sel angka, COUNTA sel terisi', 'COUNT sel teks, COUNTA sel kosong', 'Keduanya menjumlahkan nilai uang', 'COUNTA menghapus seluruh tabel'],
    'A',
    'COUNT menghitung sel numerik, sedangkan COUNTA (Count All) menghitung seluruh sel yang terisi data (teks, angka, atau simbol).',
  ],
  [
    6, 8, 'C3 - Menerapkan',
    'Untuk menghitung banyaknya siswa yang BELUM mengikuti ujian susulan (ditandai dengan sel nilai yang masih KOSONG di rentang D2:D34), fungsi yang paling tepat digunakan adalah...',
    ['=COUNTBLANK(D2:D34)', '=SUM(D2:D34)', '=MAX(D2:D34)', '=VLOOKUP(D2:D34)'],
    'A',
    'Fungsi =COUNTBLANK(range) menghitung jumlah sel yang masih kosong (belum terisi) di dalam suatu rentang.',
  ],
  [
    6, 9, 'C3 - Menerapkan',
    'Jika nilai ujian siswa berada di sel C2 dan Kriteria Ketuntasan Minimal (KKM) adalah 75, penulisan rumus fungsi logika IF untuk menampilkan "TUNTAS" jika nilai >= 75 dan "REMEDIAL" jika di bawah 75 adalah...',
    ['=IF(C2>=75, "TUNTAS", "REMEDIAL")', '=SUMIF(C2, ">=75", "TUNTAS")', '=COUNTIF(C2:C10, "TUNTAS")', '=MAX(C2, 75)'],
    'A',
    'Fungsi =IF(syarat_logika, nilai_jika_benar, nilai_jika_salah) mengevaluasi syarat C2>=75 untuk menentukan hasil teks yang ditampilkan.',
  ],
  [
    6, 10, 'C2 - Memahami',
    'Dalam penyajian visualisasi data (Chart/Grafik), jenis grafik yang paling tepat digunakan untuk menunjukkan TREN PERKEMBANGAN nilai rata-rata siswa dari Bulan Januari hingga Desember secara berkesinambungan adalah...',
    ['Grafik Garis (Line Chart)', 'Diagram Lingkaran (Pie Chart)', 'Struktur Organisasi Kelas', 'Tabel Teks Sederhana'],
    'A',
    'Line Chart (Grafik Garis) sangat efektif memvisualisasikan perubahan atau tren data dari waktu ke waktu (time series).',
  ],
  [
    6, 11, 'C2 - Memahami',
    'Jika kita ingin membandingkan tinggi rendahnya perolehan skor antar-kelas (Kelas 7A, 7B, 8A, 8B) secara berdampingan, jenis grafik yang paling mudah dibaca adalah...',
    ['Grafik Batang (Bar/Column Chart)', 'Grafik Jaring (Radar Chart)', 'Peta Lokasi Geografis', 'Diagram Alir (Flowchart)'],
    'A',
    'Column/Bar Chart memudahkan mata membandingkan besaran nilai antar-kategori yang berbeda melalui tinggi batang.',
  ],
  [
    6, 12, 'C2 - Memahami',
    'Fitur tabel rangkuman interaktif di Excel yang mampu mengelompokkan, menjumlahkan, dan meringkas ribuan baris data secara cepat hanya dengan menarik nama kolom (drag-and-drop) adalah...',
    ['PivotTable', 'WordArt', 'ClipArt', 'Page Setup'],
    'A',
    'PivotTable adalah perkakas analisis data tingkat lanjut untuk merangkum dan mengelompokkan data besar secara dinamis.',
  ],
  [
    6, 13, 'C3 - Menerapkan',
    'Agar sel yang memiliki nilai di bawah 75 pada tabel daftar nilai otomatis berubah warna latar belakangnya menjadi merah muda sehingga mudah terlihat oleh guru, fitur yang digunakan adalah...',
    ['Conditional Formatting', 'Merge & Center Cell', 'Print Preview Page', 'Spell Check Document'],
    'A',
    'Conditional Formatting memberikan warna, ikon, atau bar data secara otomatis berdasarkan aturan nilai di dalam sel.',
  ],
  [
    6, 14, 'C4 - Menganalisis',
    'Ketika menyalin rumus "=VLOOKUP(A2, $D$2:$F$8, 2, FALSE)" dari baris ke-2 ke baris ke-3, mengapa alamat tabel referensi "$D$2:$F$8" wajib diberi tanda dolar ($)?',
    ['Mengunci rentang tabel referensi', 'Mengubah angka jadi mata uang dolar', 'Agar papan ketik berfungsi normal', 'Menghapus data pada baris kedua'],
    'A',
    'Referensi absolut ($D$2:$F$8) menjaga posisi tabel rujukan tetap konstan ketika rumus disalin ke sel-sel di bawahnya.',
  ],
  [
    6, 15, 'C4 - Menganalisis',
    'Saat menggunakan fungsi VLOOKUP, muncul pesan kesalahan "#N/A" (Not Available) pada sel hasil. Penyebab utama munculnya pesan "#N/A" adalah...',
    ['Kode pencarian tidak ditemukan', 'Ukuran kolom kurang lebar', 'Baterai laptop mulai habis', 'Pembagian angka dengan nol'],
    'A',
    'Pesan #N/A pada VLOOKUP/HLOOKUP berarti nilai kunci pencarian tidak ditemukan kecocokannya di dalam tabel referensi.',
  ],
  [
    6, 16, 'C3 - Menerapkan',
    'Diketahui data kehadiran ekstrakurikuler: Kolom B berisi status ("Hadir", "Izin", "Sakit") untuk 35 siswa di B2:B36. Untuk menghitung berapa banyak siswa yang statusnya "Hadir", rumusnya adalah...',
    ['=COUNTIF(B2:B36, "Hadir")', '=SUMIF(B2:B36, "Hadir")', '=AVERAGE(B2:B36)', '=COUNTA(B2:B36)'],
    'A',
    '=COUNTIF(B2:B36, "Hadir") menghitung jumlah sel pada rentang B2:B36 yang berisi teks "Hadir".',
  ],
  [
    6, 17, 'C3 - Menerapkan',
    'Jika kita ingin mengurutkan tabel data siswa berdasarkan dua kriteria berjenjang: pertama diurutkan berdasarkan "Kelas" (A–Z), lalu di dalam kelas yang sama diurutkan berdasarkan "Skor CBT" (Tertinggi ke Terendah), fitur yang dipilih adalah...',
    ['Custom Sort -> Add Level', 'Filter Satu Kolom Saja', 'Find & Select Data', 'Wrap Text Otomatis'],
    'A',
    'Custom Sort dengan Add Level memungkinkan pengurutan multi-kolom secara berjenjang (Sort by Kelas, Then by Skor).',
  ],
  [
    6, 18, 'C2 - Memahami',
    'Pada sebuah grafik (Chart), keterangan kotak kecil yang menjelaskan arti dari setiap warna garis atau warna batang data (misalnya Biru = Kelas 7, Oranye = Kelas 8) disebut...',
    ['Legend (Legenda Grafik)', 'Gridlines (Garis Bantu)', 'Formula Bar (Bilah Rumus)', 'Status Bar (Bilah Status)'],
    'A',
    'Legend (Legenda) membantu pembaca grafik mengenali seri data mana yang diwakili oleh setiap warna atau simbol.',
  ],
  [
    6, 19, 'C3 - Menerapkan',
    'Untuk membekukan baris judul tabel paling atas agar tetap terlihat di layar saat kita menggulir (scroll) lembar kerja hingga ke baris ke-500 di bawah, fitur pada menu View yang digunakan adalah...',
    ['Freeze Panes -> Freeze Top Row', 'Zoom Level 10%', 'Hide Active Sheet', 'Split Screen Window'],
    'A',
    'Freeze Top Row mengunci baris pertama (header tabel) agar tetap tampil di bagian atas layar ketika halaman digulir ke bawah.',
  ],
  [
    6, 20, 'C5 - Mengevaluasi',
    'Mengapa sebelum menganalisis data dan membuat grafik, kita perlu melakukan tahap "Pembersihan Data" (Data Cleaning) seperti menghapus baris ganda (Remove Duplicates) dan memperbaiki ejaan yang tidak konsisten?',
    ['Agar hasil rumus & grafik akurat', 'Menghapus seluruh data asli tabel', 'Grafik wajib dari tabel kosong', 'Mengubah warna huruf jadi pelangi'],
    'A',
    'Kualitas analisis data sangat bergantung pada kebersihan data masukan; duplikasi atau salah ketik (misal "Kelas 8A" vs "Kls 8A") akan membuat rumus salah menghitung.',
  ],

  // ===========================================================================
  // BAB 7 KELAS 8: ALGORITMA DAN PEMROGRAMAN (20 SOAL)
  // ===========================================================================
  [
    7, 1, 'C4 - Menganalisis',
    'Perhatikan skrip logika poin di arena Roblox MTsN 14 berikut: Variabel Skor = 10. Kemudian dijalankan perulangan: [Ulangi untuk i = 1 sampai 3: Skor = Skor + (i * 5)]. Berapakah nilai akhir variabel Skor setelah perulangan selesai?',
    ['40', '25', '30', '45'],
    'A',
    'Skor awal = 10. Saat i=1: 10 + 5 = 15. Saat i=2: 15 + 10 = 25. Saat i=3: 25 + 15 = 40.',
  ],
  [
    7, 2, 'C2 - Memahami',
    'Tiga struktur kontrol dasar dalam membangun algoritma dan program komputer adalah...',
    ['Sekuensial, Percabangan & Perulangan', 'Input, Printer & Layar Monitor', 'Copy, Cut & Paste Dokumen', 'Header, Body & Footer Halaman'],
    'A',
    'Setiap algoritma pemrograman disusun dari struktur runtunan (sekuensial), pemilihan/percabangan, dan pengulangan.',
  ],
  [
    7, 3, 'C2 - Memahami',
    'Dalam pemrograman, sebuah nama penampung di dalam memori komputer yang digunakan untuk menyimpan nilai data yang dapat berubah-ubah selama program berjalan (seperti `skor`, `nyawa`, atau `kecepatan`) disebut...',
    ['Variabel (Variable)', 'Konstanta Tetap', 'Komentar Teks', 'Perangkat Keras'],
    'A',
    'Variabel adalah tempat penyimpanan data bernama di memori yang nilainya dapat diperbarui oleh instruksi program.',
  ],
  [
    7, 4, 'C2 - Memahami',
    'Jenis data (Tipe Data) yang digunakan untuk menyimpan nilai berupa bilangan bulat tanpa koma (seperti jumlah pemain = 25) dan tipe data untuk menyimpan nilai logika Benar/Salah (True/False) secara berturut-turut adalah...',
    ['Integer dan Boolean', 'String dan Audio', 'Video dan Gambar', 'Folder dan File'],
    'A',
    'Tipe data Integer menyimpan bilangan bulat, sedangkan Boolean menyimpan nilai logika True atau False.',
  ],
  [
    7, 5, 'C3 - Menerapkan',
    'Pada bahasa pemrograman visual maupun tekstual, operator "MOD" (Modulo) menghasilkan SISA PEMBAGIAN. Berapakah hasil dari operasi "17 MOD 5"?',
    ['2', '3', '5', '0'],
    'A',
    '17 ÷ 5 = 3 dengan sisa 2 (karena 3 × 5 = 15, dan 17 - 15 = 2). Maka 17 MOD 5 = 2.',
  ],
  [
    7, 6, 'C4 - Menganalisis',
    'Operator Modulo (MOD) sangat sering digunakan programmer untuk mengecek apakah suatu bilangan bulat `X` merupakan bilangan GENAP atau GANJIL. Syarat kondisi yang benar untuk menentukan bahwa `X` adalah bilangan GENAP adalah...',
    ['Jika (X MOD 2 = 0)', 'Jika (X MOD 2 = 1)', 'Jika (X + 2 = 0)', 'Jika (X * 2 = 1)'],
    'A',
    'Bilangan genap selalu habis dibagi 2 tanpa sisa, sehingga nilai (X MOD 2) pasti sama dengan 0.',
  ],
  [
    7, 7, 'C4 - Menganalisis',
    'Perhatikan algoritma pertukaran nilai variabel berikut: `A = 5`, `B = 12`. Kemudian dijalankan: `Temp = A`, `A = B`, `B = Temp`. Berapakah nilai `A` dan `B` sekarang?',
    ['A = 12 dan B = 5', 'A = 5 dan B = 12', 'A = 12 dan B = 12', 'A = 5 dan B = 5'],
    'A',
    'Variabel bantuan `Temp` menyimpan nilai lama A (5), lalu A diisi nilai B (12), dan B diisi nilai Temp (5), sehingga nilai keduanya berhasil bertukar.',
  ],
  [
    7, 8, 'C4 - Menganalisis',
    'Jika diketahui variabel `Nilai = 82`, lalu dijalankan percabangan bertingkat: `Jika Nilai >= 90 maka Predikat = "A", Jika Tidak (Else If) Nilai >= 80 maka Predikat = "B", Selain itu Predikat = "C"`. Apakah nilai `Predikat` yang dihasilkan?',
    ['Predikat = "B"', 'Predikat = "A"', 'Predikat = "C"', 'Predikat = "D"'],
    'A',
    'Karena 82 tidak >= 90, program lanjut mengecek syarat kedua (82 >= 80) yang bernilai Benar, sehingga menghasilkan Predikat "B".',
  ],
  [
    7, 9, 'C3 - Menerapkan',
    'Dalam pemrograman Blockly atau Scratch, blok "My Blocks" / "Function" (Prosedur/Subprogram) digunakan untuk...',
    ['Modularisasi kode agar rapi & reusable', 'Menghapus seluruh proyek yang dibuat', 'Mengubah warna fisik layar monitor', 'Memutus koneksi jaringan internet'],
    'A',
    'Pembuatan Prosedur/Fungsi (Modularisasi) menerapkan prinsip DRY (Don\'t Repeat Yourself) sehingga kode mudah dibaca dan dipelihara.',
  ],
  [
    7, 10, 'C4 - Menganalisis',
    'Perhatikan perulangan bersarang (Nested Loop) berikut: [Ulangi 3 kali (Baris): [Ulangi 4 kali (Kolom): Gambar Bintang]]. Berapa total gambar bintang yang tercetak di layar setelah program selesai?',
    ['12 bintang', '7 bintang', '4 bintang', '3 bintang'],
    'A',
    'Dalam perulangan bersarang, perulangan dalam (4 kali) dijalankan penuh untuk setiap putaran luar (3 kali), sehingga totalnya 3 × 4 = 12 kali.',
  ],
  [
    7, 11, 'C2 - Memahami',
    'Perbedaan antara perulangan "Repeat [N]" (Counted Loop) dan perulangan "Repeat Until <Kondisi>" (Conditional Loop) adalah...',
    ['Repeat N jumlah pasti, Repeat Until syarat', 'Repeat N berjalan tanpa henti selamanya', 'Repeat Until hanya jalan setengah kali', 'Keduanya tidak bisa menggerakkan objek'],
    'A',
    'Repeat [N] adalah perulangan dengan jumlah iterasi terhitung pasti, sedangkan Repeat Until berhenti berdasarkan terpenuhinya suatu kondisi logika.',
  ],
  [
    7, 12, 'C4 - Menganalisis',
    'Diketahui variabel `X = 2`. Dijalankan perulangan: `Repeat Until (X > 10) { X = X + 3 }`. Berapakah nilai `X` tepat ketika perulangan tersebut BERHENTI?',
    ['11', '8', '10', '14'],
    'A',
    'Putaran 1: X = 2+3 = 5 (belum > 10). Putaran 2: X = 5+3 = 8 (belum > 10). Putaran 3: X = 8+3 = 11 (sudah > 10, maka perulangan berhenti dengan X = 11).',
  ],
  [
    7, 13, 'C2 - Memahami',
    'Representasi algoritma menggunakan simbol-simbol diagram standar (seperti belah ketupat untuk keputusan/percabangan, persegi panjang untuk proses, dan jajar genjang untuk input/output) disebut...',
    ['Flowchart (Diagram Alir)', 'Pseudocode (Kode Semu)', 'Infografis Poster', 'Tabel Spreadsheet'],
    'A',
    'Flowchart memvisualisasikan urutan alur logika algoritma menggunakan bangun geometri standar yang dihubungkan anak panah.',
  ],
  [
    7, 14, 'C2 - Memahami',
    'Pada diagram alir (Flowchart), simbol bangun ruang berbentuk BELAH KETUPAT (Diamond) digunakan untuk melambangkan...',
    ['Decision (Percabangan Kondisi)', 'Terminator (Mulai / Selesai)', 'Process (Perhitungan Biasa)', 'Flowline (Garis Alir Arah)'],
    'A',
    'Simbol Belah Ketupat (Decision) mengevaluasi suatu syarat logika yang memiliki cabang keluaran Ya (True) dan Tidak (False).',
  ],
  [
    7, 15, 'C3 - Menerapkan',
    'Penulisan rancangan algoritma menggunakan kalimat ringkas yang menyerupai struktur bahasa pemrograman namun mudah dibaca manusia (tanpa terikat aturan tanda baca bahasa tertentu) disebut...',
    ['Pseudocode (Kode Semu)', 'Bahasa Mesin Biner', 'File Eksekusi (.exe)', 'Sandi Telegraf Morse'],
    'A',
    'Pseudocode membantu programmer merancang logika algoritma secara terstruktur sebelum menerjemahkannya ke bahasa pemrograman.',
  ],
  [
    7, 16, 'C4 - Menganalisis',
    'Di dalam game edukasi, karakter pemain hanya boleh masuk ke "Ruang Ujian Akhir" jika memenuhi syarat: `(Poin_Misi >= 100) AND (Kunci_Lab == Benar)`. Jika Raka memiliki `Poin_Misi = 150` tetapi `Kunci_Lab = Salah`, apakah Raka bisa masuk?',
    ['Tidak bisa, syarat AND belum lengkap', 'Bisa masuk, poin sudah di atas 100', 'Bisa masuk tanpa syarat apa pun', 'Karakter langsung terhapus otomatis'],
    'A',
    'Operator logika AND menghasilkan True hanya apabila syarat pertama (Benar) dan syarat kedua (Salah) sama-sama bernilai Benar.',
  ],
  [
    7, 17, 'C3 - Menerapkan',
    'Dalam pemrograman robot penelusur garis (Line Follower) sederhana, logika sensor cahaya yang tepat agar robot tetap mengikuti garis hitam di atas lantai putih adalah...',
    ['Hitam maju lurus, putih belok koreksi', 'Jalan lurus terus tanpa baca sensor', 'Berhenti total saat melihat hitam', 'Berputar di tempat tanpa maju'],
    'A',
    'Robot Line Follower menggunakan percabangan sensor cahaya secara terus-menerus (loop) untuk mengoreksi arah roda agar tetap di atas garis.',
  ],
  [
    7, 18, 'C2 - Memahami',
    'Fitur "Clone" (`Create clone of myself`) pada pemrograman game visual Scratch berfungsi untuk...',
    ['Menggandakan objek Sprite secara dinamis', 'Menghapus akun pengguna Scratch', 'Menggandakan layar monitor fisik', 'Mematikan suara musik latar game'],
    'A',
    'Cloning memungkinkan satu Sprite induk menghasilkan banyak salinan objek dengan perilaku yang sama secara efisien.',
  ],
  [
    7, 19, 'C4 - Menganalisis',
    'Seorang siswa menulis kode perulangan `Repeat Until (Nyawa == 0)`, namun di dalam blok perulangan tersebut tidak ada perintah yang mengubah nilai `Nyawa` sama sekali (padahal awalnya `Nyawa = 3`). Akibat yang akan terjadi adalah...',
    ['Infinite Loop (Perulangan Tak Henti)', 'Program berhenti dalam 0 detik', 'Nilai Nyawa berubah jadi 100', 'Komputer langsung mencetak kertas'],
    'A',
    'Jika variabel pengontrol kondisi berhenti tidak pernah diperbarui di dalam loop, maka perulangan akan berjalan selamanya (Infinite Loop).',
  ],
  [
    7, 20, 'C5 - Mengevaluasi',
    'Mengapa sebelum menulis kode program yang panjang, seorang programmer sebaiknya menelusuri alur algoritmanya dengan nilai uji coba di atas kertas (Tracing / Dry Run)?',
    ['Uji logika & cegah bug sejak awal', 'Komputer tidak bisa jalankan kode', 'Menghabiskan kertas buku tulis', 'Menggantikan fungsi layar monitor'],
    'A',
    'Dry run / tracing tabel variabel mempermudah verifikasi kebenaran logika algoritma di setiap langkah eksekusi.',
  ],

  // ===========================================================================
  // BAB 8 KELAS 8: DAMPAK SOSIAL INFORMATIKA (20 SOAL)
  // ===========================================================================
  [
    8, 1, 'C5 - Mengevaluasi',
    'Di grup media sosial siswa beredar kabar mengejutkan dengan judul provokatif tentang jadwal libur sekolah tambahan, namun berasal dari blog tidak resmi dan tanpa surat edaran madrasah. Langkah pengkajian kritis informasi (anti-hoaks) yang paling tepat adalah...',
    ['Cek info resmi sekolah & wali kelas', 'Langsung teruskan ke semua grup', 'Buat postingan baru lebih heboh', 'Percaya penuh semua kabar internet'],
    'A',
    'Kita wajib menerapkan prinsip Saring Sebelum Sharing dengan memeriksa kredibilitas sumber resmi sebelum menyebarkan informasi.',
  ],
  [
    8, 2, 'C2 - Memahami',
    'Informasi palsu atau berita bohong yang sengaja dibuat dan disebarkan di media sosial untuk menipu, memprovokasi, atau menimbulkan kepanikan masyarakat disebut...',
    ['Hoaks (Fake News)', 'Fakta Ilmiah Valid', 'Jurnal Akademik Resmi', 'Pengumuman Madrasah'],
    'A',
    'Hoaks adalah informasi tidak benar yang direkayasa seolah-olah nyata untuk menyesatkan opini pembaca.',
  ],
  [
    8, 3, 'C2 - Memahami',
    'Teknik penggunaan judul berita atau judul video di media sosial yang sangat sensasional, memancing rasa penasaran berlebihan, namun isinya ternyata tidak sesuai dengan judulnya disebut...',
    ['Clickbait (Umpan Klik)', 'Enkripsi Data Rahasia', 'Validasi Bukti Ilmiah', 'Backup Cloud Otomatis'],
    'A',
    'Clickbait dirancang semata-mata untuk menarik jumlah klik pengunjung menggunakan judul yang bombastis atau mengecoh.',
  ],
  [
    8, 4, 'C3 - Menerapkan',
    'Ketika kamu menerima sebuah foto mencurigakan di pesan berantai yang diklaim sebagai kejadian bencana hari ini, cara teknis untuk memeriksa apakah foto tersebut adalah foto lama yang diambil dari peristiwa lain adalah...',
    ['Cek lewat Reverse Image Search', 'Sebarkan ke sepuluh grup keluarga', 'Cetak foto tersebut ke kertas', 'Ubah warna foto jadi hitam putih'],
    'A',
    'Reverse Image Search membantu memverifikasi jejak digital sebuah foto, kapan pertama kali dimuat, dan konteks peristiwa aslinya.',
  ],
  [
    8, 5, 'C2 - Memahami',
    'Fenomena di media sosial di mana algoritma hanya menampilkan konten, berita, dan opini yang sejalan dengan kesukaan kita saja sehingga kita terisolasi dari sudut pandang lain yang berbeda disebut...',
    ['Filter Bubble / Echo Chamber', 'Firewall Keamanan Jaringan', 'Lisensi Open Source Bebas', 'Motherboard System Bus'],
    'A',
    'Filter Bubble dan Echo Chamber terjadi akibat personalisasi algoritma yang terus menyodorkan konten serupa sehingga mempersempit wawasan pengguna.',
  ],
  [
    8, 6, 'C3 - Menerapkan',
    'Jika seorang teman sekelasmu mengalami perundungan siber (Cyberbullying) berupa komentar penghinaan di media sosial, tindakan yang paling tepat untuk membantunya adalah...',
    ['Simpan bukti, blokir & lapor Guru BK', 'Ikut menertawakan unggahan tersebut', 'Buat akun palsu untuk meneror balik', 'Suruh teman membuang ponselnya'],
    'A',
    'Langkah penanganan cyberbullying meliputi dukungan moral bagi korban, pengamanan bukti digital, pemblokiran/pelaporan akun, dan konsultasi dengan guru/orang tua.',
  ],
  [
    8, 7, 'C2 - Memahami',
    'Upaya manipulasi psikologis oleh penipu siber (misalnya berpura-pura menjadi petugas bank atau panitia undian resmi lewat telepon/pesan) agar korban secara sukarela menyebutkan kode OTP atau PIN rahasia disebut...',
    ['Social Engineering (Rekayasa Sosial)', 'Software Engineering (Rekayasa Lunak)', 'Hardware Maintenance (Perawatan Alat)', 'Data Sorting (Pengurutan Tabel)'],
    'A',
    'Social Engineering memanfaatkan kelengahan psikologis manusia (rasa panik, takut, atau tergiur hadiah) untuk mencuri data rahasia.',
  ],
  [
    8, 8, 'C4 - Menganalisis',
    'Mengapa kita dilarang keras mengunduh dan menginstal perangkat lunak bajakan (Cracked Software) dari situs tidak resmi?',
    ['Langgar hak cipta & rawan Malware', 'Membuat layar monitor lebih bersih', 'Aplikasi resmi tak bisa dijalankan', 'Menambah garansi komputer 10 tahun'],
    'A',
    'File crack/bajakan adalah media penyebaran utama Trojan, Spyware, dan Ransomware yang membahayakan keamanan data pengguna.',
  ],
  [
    8, 9, 'C2 - Memahami',
    'Jenis Malware berbahaya yang mengunci (mengenkripsi) seluruh file dokumen di dalam komputer korban lalu meminta tebusan sejumlah uang agar file dibuka kembali disebut...',
    ['Ransomware', 'Freeware', 'Shareware', 'Firmware'],
    'A',
    'Ransomware menyandera data pengguna dengan enkripsi dan menuntut pembayaran tebusan (ransom).',
  ],
  [
    8, 10, 'C3 - Menerapkan',
    'Langkah pencegahan terbaik agar data tugas sekolah tetap aman dan tidak hilang meskipun komputer tiba-tiba rusak atau terkena serangan Ransomware adalah...',
    ['Rutin backup ke Cloud / disk luar', 'Hapus tugas setiap selesai diketik', 'Matikan antivirus dan update OS', 'Klik semua tautan iklan asing'],
    'A',
    'Melakukan Backup berkala (aturan 3-2-1 backup) memastikan data penting dapat dipulihkan kapan saja.',
  ],
  [
    8, 11, 'C2 - Memahami',
    'Perbedaan antara "Disinformasi" dan "Misinformasi" dalam penyebaran kabar keliru di media sosial adalah...',
    ['Disinformasi sengaja, Misinformasi tak tahu', 'Disinformasi benar, Misinformasi olahraga', 'Keduanya nama perangkat keras PC', 'Misinformasi khusus TV hitam putih'],
    'A',
    'Disinformasi mengandung niat sengaja menyesatkan publik, sedangkan Misinformasi terjadi ketika seseorang ikut menyebarkan berita salah karena mengira berita itu benar.',
  ],
  [
    8, 12, 'C3 - Menerapkan',
    'Saat menggunakan gambar atau musik karya orang lain dari internet untuk melengkapi tugas video sekolah, cara menghargai Hak Cipta yang benar adalah...',
    ['Gunakan lisensi bebas & tulis sumber', 'Hapus watermark dan klaim milikku', 'Jual kembali karya tanpa izin', 'Klaim lagu komersial sebagai ciptaan'],
    'A',
    'Lisensi Creative Commons memperbolehkan penggunaan karya dengan syarat mematuhi ketentuannya seperti mencantumkan sumber/pencipta (Attribution).',
  ],
  [
    8, 13, 'C2 - Memahami',
    'Jejak digital dibagi menjadi dua jenis, yaitu Jejak Digital Aktif dan Jejak Digital Pasif. Contoh dari Jejak Digital AKTIF adalah...',
    ['Status, foto & komentar yang diunggah', 'Catatan IP otomatis di server', 'Suhu udara ruang laboratorium', 'Debu halus di layar monitor'],
    'A',
    'Jejak digital aktif adalah data yang secara sengaja dibagikan oleh pengguna sendiri di internet.',
  ],
  [
    8, 14, 'C4 - Menganalisis',
    'Mengapa jejak digital positif (seperti unggahan prestasi sekolah, karya proyek koding, dan tulisan yang santun) penting dijaga oleh seorang pelajar sejak dini?',
    ['Menjaga reputasi untuk masa depan', 'Otomatis terhapus setiap 5 menit', 'Tidak bisa dilihat pengguna lain', 'Membuat memori ponsel cepat penuh'],
    'A',
    'Reputasi digital mencerminkan integritas dan kompetensi seseorang di dunia nyata maupun dunia maya.',
  ],
  [
    8, 15, 'C2 - Memahami',
    'File teks kecil yang disimpan oleh situs web di dalam peramban (browser) pengguna untuk mengingat status login, preferensi tampilan, atau isi keranjang belanja disebut...',
    ['Browser Cookies', 'Motherboard Chip', 'Processor Cache', 'Power Supply Cable'],
    'A',
    'Cookies digunakan situs web untuk menyimpan data sesi dan preferensi pengguna pada peramban.',
  ],
  [
    8, 16, 'C3 - Menerapkan',
    'Ketika sebuah aplikasi permainan senter sederhana di smartphone meminta izin akses (App Permissions) ke "Kontak Telepon", "Rekaman Mikrofon", dan "Galeri Foto Pribadi", sikap kritis yang tepat adalah...',
    ['Tolak izin karena tak sesuai fungsi', 'Izinkan semua tanpa membaca dulu', 'Tulis nomor PIN ATM di ulasan', 'Unduh sepuluh aplikasi serupa lagi'],
    'A',
    'Prinsip privasi digital mengharuskan kita memeriksa apakah izin akses (permission) yang diminta aplikasi wajar dan sesuai dengan fungsinya.',
  ],
  [
    8, 17, 'C2 - Memahami',
    'Di Indonesia, undang-undang yang mengatur tentang informasi serta transaksi elektronik, termasuk sanksi hukum terhadap pencemaran nama baik, peretasan, dan penyebaran berita bohong di dunia maya adalah...',
    ['UU ITE (Informasi & Transaksi Elektronik)', 'UU Lalu Lintas dan Angkutan Jalan', 'UU Pokok Agraria dan Pertanahan', 'UU Perikanan dan Kelautan Nasional'],
    'A',
    'UU ITE dan UU Perlindungan Data Pribadi (UU PDP) menjadi payung hukum aktivitas ruang siber di Indonesia.',
  ],
  [
    8, 18, 'C4 - Menganalisis',
    'Perhatikan ciri-ciri pesan berikut: (1) Menggunakan bahasa yang mendesak agar korban panik ("Akun Anda akan diblokir dalam 10 menit!"), (2) Meminta klik tautan asing seperti `bit.ly/hadiah-acak-123`, (3) Meminta PIN dan kode OTP. Pesan tersebut dapat dipastikan merupakan...',
    ['Penipuan Siber (Phishing / Scam)', 'Surat Edaran Resmi Madrasah', 'Pembaruan Sistem Operasi Resmi', 'Tugas Pekerjaan Rumah Guru'],
    'A',
    'Pesan yang menciptakan kepanikan, menyertakan tautan tidak resmi, dan meminta OTP/PIN adalah pola klasik kejahatan Phishing.',
  ],
  [
    8, 19, 'C3 - Menerapkan',
    'Bagaimana cara menjaga etika dan keamanan saat mengikuti ruang obrolan (Chat) pembelajaran daring bersama guru dan teman sekelas?',
    ['Pakai nama asli, santun & hargai teman', 'Pakai nama palsu untuk kirim spam', 'Sebar tautan berbahaya di grup kelas', 'Tulis kalimat ejekan pada teman'],
    'A',
    'Ruang belajar digital menerapkan tata krama yang sama dengan ruang kelas fisik: menggunakan identitas jelas, bahasa santun, dan saling menghormati.',
  ],
  [
    8, 20, 'C5 - Mengevaluasi',
    'Teknologi Kecerdasan Buatan (Artificial Intelligence) kini dapat membantu mencari rangkuman materi dengan cepat. Sikap pemanfaatan AI yang bijak dan bertanggung jawab bagi seorang pelajar MTs adalah...',
    ['Teman diskusi belajar & tetap verifikasi', 'Suruh AI kerjakan semua soal ujian', 'Buat foto palsu (Deepfake) teman', 'Percaya AI 100% tanpa cek buku'],
    'A',
    'AI harus dimanfaatkan secara etis sebagai alat bantu belajar (co-pilot), bukan untuk menggantikan proses berpikir kritis dan kejujuran akademik.',
  ],

  // ===========================================================================
  // BAB 9 KELAS 8: PRAKTIK LINTAS BIDANG (PROYEK) (20 SOAL)
  // ===========================================================================
  [
    9, 1, 'C3 - Menerapkan',
    'Dalam Proyek Lintas Bidang Kelas 8, kelompokmu mengembangkan aplikasi antrean kantin digital MTsN 14. Sebelum anggota programmer menulis kode program, anggota desainer membuat sketsa kasar tata letak tombol dan layar aplikasi terlebih dahulu. Sketsa rancangan tampilan layar tersebut disebut...',
    ['Wireframe / Mockup Antarmuka (UI Design)', 'Kabel Jaringan Fiber Optik', 'Firewall Keamanan Server', 'Driver Kartu Suara'],
    'A',
    'Pembuatan Wireframe atau Mockup bertujuan merancang tata letak antarmuka pengguna (UI) sebelum tahap pengkodean (coding).',
  ],
  [
    9, 2, 'C2 - Memahami',
    'Urutan tahapan siklus pengembangan proyek perangkat lunak (Software Development Life Cycle) yang sistematis dalam Praktik Lintas Bidang Kelas 8 adalah...',
    ['Analisis -> Desain -> Koding -> Uji -> Evaluasi', 'Pengujian -> Bubarkan Tim -> Cari Masalah', 'Koding Tanpa Rencana -> Hapus -> Selesai', 'Presentasi Dulu -> Cari Ide Bulan Depan'],
    'A',
    'Rekayasa perangkat lunak yang baik selalu mengikuti alur: Analisis Masalah -> Desain -> Koding -> Testing/Debugging -> Dokumentasi/Rilis.',
  ],
  [
    9, 3, 'C2 - Memahami',
    'Dalam tim proyek pengembangan aplikasi/game sekolah, anggota yang bertanggung jawab mengatur jadwal kerja, memantau progres tiap anggota, dan memastikan proyek selesai tepat waktu adalah...',
    ['Project Manager (Ketua Proyek)', 'End User (Pengguna Akhir)', 'Penonton Pameran Karya', 'Teknisi Listrik Gedung'],
    'A',
    'Project Manager mengoordinasikan komunikasi tim, pembagian tugas, serta ketepatan jadwal (timeline) proyek.',
  ],
  [
    9, 4, 'C2 - Memahami',
    'Anggota tim proyek yang bertugas merancang tampilan warna, tata letak tombol, ikon, serta kenyamanan pengalaman pengguna saat memakai aplikasi adalah...',
    ['UI/UX Designer (Desainer Antarmuka)', 'Network Cable Technician', 'Database Server Admin', 'Building Security Officer'],
    'A',
    'UI (User Interface) Designer merancang tampilan visual layar, sedangkan UX (User Experience) memastikan alur penggunaan mudah dan nyaman.',
  ],
  [
    9, 5, 'C2 - Memahami',
    'Anggota tim yang bertugas menerjemahkan rancangan algoritma dan desain antarmuka menjadi susunan kode program yang dapat dijalankan oleh komputer adalah...',
    ['Programmer / Developer', 'Sekretaris Rapat Umum', 'Juri Penilai Lomba', 'Pembawa Acara Pameran'],
    'A',
    'Programmer menulis, menyusun, dan mengintegrasikan logika kode program hingga aplikasi berfungsi.',
  ],
  [
    9, 6, 'C3 - Menerapkan',
    'Kelompok Kelas 8D ingin membuat solusi digital untuk mengatasi masalah "Sering hilangnya barang temuan di lingkungan madrasah". Langkah pertama pada tahap Analisis Kebutuhan (Problem Identification) adalah...',
    ['Observasi & wawancara kebutuhan data', 'Mewarnai tombol tanpa tahu fungsinya', 'Membeli komputer baru ke toko', 'Menyalin game balap dari internet'],
    'A',
    'Observasi dan wawancara pengguna (user research) memastikan solusi yang dirancang benar-benar menjawab permasalahan nyata di lapangan.',
  ],
  [
    9, 7, 'C3 - Menerapkan',
    'Saat merancang antarmuka (User Interface) aplikasi kuis untuk siswa MTs, prinsip desain yang baik agar pengguna tidak bingung adalah...',
    ['Konsisten, teks jelas & warna kontras', 'Sembunyikan tombol di balik gambar', 'Pakai 15 warna neon berkedip cepat', 'Buat tombol sebesar 1 milimeter'],
    'A',
    'Konsistensi letak navigasi, kejelasan tipografi, dan kontras warna adalah kunci utama User Interface yang ramah pengguna (user-friendly).',
  ],
  [
    9, 8, 'C4 - Menganalisis',
    'Pada tahap Pengujian (Testing), tim proyek meminta 5 siswa dari kelas lain untuk mencoba memainkan aplikasi yang baru selesai dibuat sambil mengamati apakah mereka mengalami kebingungan. Pengujian oleh calon pengguna nyata ini disebut...',
    ['Usability / User Acceptance Testing', 'Harddisk Low-Level Formatting', 'Antivirus System Installation', 'Lossy Image Compression'],
    'A',
    'Usability Testing melibatkan pengguna sasaran untuk menguji apakah aplikasi mudah digunakan dan bebas dari bug alur.',
  ],
  [
    9, 9, 'C3 - Menerapkan',
    'Untuk mencatat setiap kesalahan (bug) yang ditemukan selama tahap uji coba, penguji (Tester) membuat tabel laporan bug yang berisi...',
    ['Deskripsi bug, langkah & status perbaikan', 'Daftar makanan favorit anggota tim', 'Jadwal piket menyapu ruang kelas', 'Teks lirik lagu wajib nasional'],
    'A',
    'Bug report (laporan kutu program) yang terperinci memudahkan programmer menemukan letak kesalahan kode dan memperbaikinya.',
  ],
  [
    9, 10, 'C3 - Menerapkan',
    'Sebuah kelompok siswa membuat proyek "Kalkulator Zakat & Sedekah Madrasah" menggunakan pengolah angka dan antarmuka interaktif. Proyek lintas bidang ini memadukan ilmu Informatika dengan mata pelajaran...',
    ['PAI (Fikih) dan Matematika', 'Penjasorkes dan Olahraga', 'Seni Musik Tradisional', 'Geologi Batuan Vulkanik'],
    'A',
    'Perhitungan nisab zakat dan persentase sedekah memadukan konsep rumus algoritma/spreadsheet Informatika dengan Fikih dan Matematika.',
  ],
  [
    9, 11, 'C3 - Menerapkan',
    'Kelompok lain membuat proyek "Simulasi Cuaca dan Penghitung Curah Hujan Kebun Sekolah" yang mencatat suhu harian ke tabel grafik. Proyek ini berkolaborasi dengan mata pelajaran...',
    ['IPA dan IPS (Geografi)', 'Bahasa Arab Dasar', 'Seni Lukis Kanvas', 'Sejarah Perang Dunia'],
    'A',
    'Pengamatan suhu, kelembapan, dan curah hujan mengintegrasikan Analisis Data Informatika dengan sains IPA dan Geografi.',
  ],
  [
    9, 12, 'C2 - Memahami',
    'Model awal atau purwarupa dari sebuah produk aplikasi/alat yang dibuat untuk menguji konsep dan fungsi utamanya sebelum dikembangkan menjadi produk akhir yang lengkap disebut...',
    ['Prototipe (Prototype)', 'Barang Rongsokan', 'Kemasan Kardus', 'Sertifikat Lomba'],
    'A',
    'Prototipe adalah model kerja awal yang memungkinkan tim menguji ide dan menerima masukan perbaikan secara cepat.',
  ],
  [
    9, 13, 'C4 - Menganalisis',
    'Mengapa dalam manajemen waktu proyek kelompok kita perlu menetapkan "Milestone" (Tenggat Capaian Antara, misalnya: Minggu 1 Desain selesai, Minggu 2 Koding selesai, Minggu 3 Uji Coba)?',
    ['Pantau progres mingguan & cegah telat', 'Menunda semua tugas ke malam akhir', 'Otomatis mengetik kode program sendiri', 'Menambah jumlah sampul halaman laporan'],
    'A',
    'Milestone membagi jadwal proyek menjadi target-target terukur sehingga risiko keterlambatan dapat dikendalikan sejak dini.',
  ],
  [
    9, 14, 'C3 - Menerapkan',
    'Saat menyusun Laporan Akhir Proyek Praktik Lintas Bidang menggunakan aplikasi pengolah kata dan pengolah angka yang terintegrasi, bagian yang menampilkan rekap hasil survei kepuasan pengguna paling tepat disajikan dalam bentuk...',
    ['Tabel ringkasan & grafik spreadsheet', 'Deretan biner 0-1 sepuluh halaman', 'Halaman kosong tanpa keterangan', 'Paragraf panjang tanpa tanda baca'],
    'A',
    'Integrasi tabel dan grafik visual memudahkan pembaca laporan memahami hasil evaluasi proyek secara objektif.',
  ],
  [
    9, 15, 'C4 - Menganalisis',
    'Ketika menguji aplikasi kuis, ditemukan bahwa jika pengguna mengklik tombol "Kirim" tanpa memilih jawaban, aplikasi langsung macet (crash). Solusi perbaikan pemrograman (Input Validation) yang tepat adalah...',
    ['Cek pilihan dulu & beri peringatan', 'Hapus tombol Kirim selamanya', 'Salahkan pengguna yang mengklik', 'Matikan komputer saat tombol diklik'],
    'A',
    'Validasi masukan (Input Validation) mencegah program mengalami error ketika pengguna melakukan tindakan di luar skenario normal.',
  ],
  [
    9, 16, 'C2 - Memahami',
    'Metode berpikir perancangan solusi yang berfokus pada empati memahami kebutuhan manusia/pengguna, mendefinisikan masalah, menggagas ide, membuat prototipe, dan mengujinya disebut...',
    ['Design Thinking', 'Binary Counting', 'Cable Crimping', 'Disk Partitioning'],
    'A',
    'Design Thinking terdiri atas 5 tahap: Empathize, Define, Ideate, Prototype, dan Test.',
  ],
  [
    9, 17, 'C3 - Menerapkan',
    'Pada tahap "Ideate" (Menggagas Ide) dalam Design Thinking, seluruh anggota tim mengumpulkan sebanyak mungkin ide solusi kreatif tanpa saling menyalahkan terlebih dahulu. Kegiatan curah pendapat ini dikenal sebagai...',
    ['Brainstorming (Curah Pendapat)', 'Debugging Kode Program', 'Compiling Source Code', 'Formatting Tabel Data'],
    'A',
    'Brainstorming mendorong seluruh anggota kelompok menyampaikan gagasan secara terbuka untuk menemukan solusi terbaik.',
  ],
  [
    9, 18, 'C3 - Menerapkan',
    'Agar file proyek koding kelompok tidak tertukar antara versi lama dan versi terbaru yang sudah diperbaiki, cara penamaan versi berkas (Versioning) yang baik adalah...',
    ['Beri nomor versi jelas (v1.0, v1.1)', 'Namai Final_Banget_Asli tanpa aturan', 'Timpa satu file tanpa cadangan', 'Gunakan angka acak tanpa arti'],
    'A',
    'Penamaan versi yang terstruktur (Version Control) memudahkan tim melacak perubahan dan kembali ke versi stabil jika terjadi kesalahan.',
  ],
  [
    9, 19, 'C4 - Menganalisis',
    'Saat melakukan demonstrasi langsung (Live Demo) aplikasi proyek di depan kelas, langkah antisipasi profesional yang selalu disiapkan tim developer jika tiba-tiba koneksi internet melambat adalah...',
    ['Siapkan versi offline & video demo', 'Batalkan presentasi dan duduk kembali', 'Marahi perangkat router di kelas', 'Tampilkan layar kosong tanpa bicara'],
    'A',
    'Menyiapkan rencana cadangan (backup plan) berupa mode offline atau video demo menunjukkan kesiapan dan profesionalisme tim proyek.',
  ],
  [
    9, 20, 'C5 - Mengevaluasi',
    'Setelah seluruh rangkaian proyek Praktik Lintas Bidang Kelas 8 selesai dipresentasikan, nilai pembelajaran terpenting apa yang diperoleh siswa dari kolaborasi layaknya tim pengembang Roblox sesungguhnya?',
    ['Paduan logika, teknis & kerja tim', 'Hanya hafal letak tombol keyboard', 'Bergantung penuh pada satu orang', 'Menyalin proyek orang tanpa ubahan'],
    'A',
    'Praktik Lintas Bidang membentuk kompetensi utuh: kecakapan teknis Informatika (hard skills) sekaligus kolaborasi, komunikasi, dan pemecahan masalah (soft skills).',
  ],
];

export const QUESTIONS_KELAS_8: InformaticsQuestion[] = RAW_KELAS_8_QUESTIONS.map(
  ([bab, no, cognitiveLevel, question, opts, origCorrect, explanation], idx) => {
    const meta = K8_CATEGORY_MAP[bab];
    const padNo = String(no).padStart(2, '0');
    const keys: OptionKey[] = ['A', 'B', 'C', 'D'];
    const origIdx = Math.max(0, keys.indexOf(origCorrect));
    const targetIdx = (bab * 5 + no * 3 + idx) % 4;
    const rotatedOpts = [...opts] as [string, string, string, string];
    if (origIdx !== targetIdx) {
      const temp = rotatedOpts[targetIdx];
      rotatedOpts[targetIdx] = rotatedOpts[origIdx];
      rotatedOpts[origIdx] = temp;
    }
    const finalCorrectKey = keys[targetIdx];
    const points =
      cognitiveLevel.startsWith('C4') || cognitiveLevel.startsWith('C5')
        ? 200
        : 175;
    return {
      id: `q-k8-bab${bab}-${padNo}`,
      materialId: meta.id,
      category: meta.category,
      gradeLevel: 'Kelas 8',
      cognitiveLevel,
      question: `[Misi Bab ${bab} Kelas 8 · ${meta.zone}] ${question}`,
      options: {
        A: rotatedOpts[0],
        B: rotatedOpts[1],
        C: rotatedOpts[2],
        D: rotatedOpts[3],
      },
      correctAnswer: finalCorrectKey,
      explanation,
      points,
      timeLimitSec: 25,
      baselineCohort: buildCohort(finalCorrectKey, idx + 101),
    };
  }
);

