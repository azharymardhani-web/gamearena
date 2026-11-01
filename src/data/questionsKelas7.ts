import type {
  CognitiveLevel,
  HistoricalCohortAttempt,
  InformaticsQuestion,
  MaterialCategory,
  OptionKey,
} from './informaticsData';

const K7_CATEGORY_MAP: Record<number, { id: string; category: MaterialCategory; zone: string }> = {
  1: {
    id: 'mat-k7-bab1',
    category: 'Bab 1 : Informatika dan Keterampilan Generik',
    zone: 'Gedung Utama',
  },
  2: {
    id: 'mat-k7-bab2',
    category: 'Bab 2 : Berpikir Komputasional',
    zone: 'Gedung Kelas',
  },
  3: {
    id: 'mat-k7-bab3',
    category: 'Bab 3 : Teknologi Informasi dan Komunikasi',
    zone: 'Ruang Guru',
  },
  4: {
    id: 'mat-k7-bab4',
    category: 'Bab 4 : Sistem Komputer',
    zone: 'Lab Komputer',
  },
  5: {
    id: 'mat-k7-bab5',
    category: 'Bab 5 : Jaringan Komputer dan Internet',
    zone: 'Gerbang & Kantin',
  },
  6: {
    id: 'mat-k7-bab6',
    category: 'Bab 6 : Analisis Data',
    zone: 'Aula Serbaguna',
  },
  7: {
    id: 'mat-k7-bab7',
    category: 'Bab 7 : Algoritma dan Pemrograman',
    zone: 'Lab Komputer',
  },
  8: {
    id: 'mat-k7-bab8',
    category: 'Bab 8 : Dampak Sosial Informatika',
    zone: 'Masjid Al - Huda',
  },
  9: {
    id: 'mat-k7-bab9',
    category: 'Bab 9 : Praktika Lintas Bidang Informatika',
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
      studentId: `u-${seed}-${i + 1}`,
      studentName: `Siswa Atas ${i + 1}`,
      totalScoreRankPercentile: 0.85 - i * 0.03,
      selectedOption: chosen,
      isCorrect,
      responseTimeMs: 4100 + i * 290,
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
      studentId: `l-${seed}-${i + 1}`,
      studentName: `Siswa Bawah ${i + 1}`,
      totalScoreRankPercentile: 0.45 - i * 0.04,
      selectedOption: chosen,
      isCorrect,
      responseTimeMs: 6400 + i * 380,
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

const RAW_KELAS_7_QUESTIONS: RawQTuple[] = [
  // ===========================================================================
  // BAB 1 KELAS 7: INFORMATIKA DAN KETERAMPILAN GENERIK (20 SOAL)
  // ===========================================================================
  [
    1, 1, 'C3 - Menerapkan',
    'Tim siswa Kelas 7A ingin membuat proyek peta 3D MTsN 14 ala Roblox. Mereka membagi peran menjadi Desainer Gedung, Pembuat Skrip Soal, dan Penguji Bug, lalu membuat poster ringkasan bergambar untuk dipresentasikan. Poster visual ringkas yang memadukan teks singkat, ikon, dan data tersebut dinamakan...',
    ['Kode Sumber (Source Code)', 'Infografis', 'Basis Data (Database)', 'Sistem Operasi'],
    'B',
    'Infografis adalah media visual yang menyajikan informasi, data, atau hasil kerja kelompok secara ringkas, jelas, dan menarik.',
  ],
  [
    1, 2, 'C1 - Mengingat',
    'Bidang ilmu yang mempelajari studi, perancangan, dan pembuatan sistem komputasi serta prinsip-prinsip yang menjadi dasar perancangannya disebut...',
    ['Mekanika Otomotif', 'Informatika', 'Bioteknologi Pertanian', 'Geologi Lingkungan'],
    'B',
    'Informatika adalah bidang ilmu mengenai studi, perancangan, dan pembuatan sistem komputasi.',
  ],
  [
    1, 3, 'C2 - Memahami',
    'Dalam bekerja kelompok mengembangkan proyek digital di MTsN 14, kegiatan bekerja bersama beberapa orang untuk mencapai tujuan yang sama dengan saling berbagi tugas disebut...',
    ['Kompetisi Individu', 'Kolaborasi', 'Isolasi Mandiri', 'Monopoli Tugas'],
    'B',
    'Kolaborasi adalah proses bekerja sama antaranggota tim dengan pembagian peran yang jelas untuk mencapai tujuan bersama.',
  ],
  [
    1, 4, 'C2 - Memahami',
    'Manakah di bawah ini yang merupakan cara mengomunikasikan hasil kerja kelompok Informatika secara lisan dan visual di depan kelas?',
    ['Presentasi salindia (slide) ringkas', 'Menyimpan file di flashdisk pribadi', 'Menghapus dokumentasi proyek', 'Menulis kode biner tanpa penjelasan'],
    'A',
    'Presentasi yang baik menggunakan slide pendukung berisi poin utama yang jelas serta disampaikan secara sistematis.',
  ],
  [
    1, 5, 'C3 - Menerapkan',
    'Ketika menyusun sebuah infografis bertema "Tips Aman Berinternet di Madrasah", pemilihan jenis dan ukuran huruf (font) harus memperhatikan prinsip...',
    ['Menggunakan 10 jenis huruf rumit', 'Keterbacaan dan kontras warna jelas', 'Menulis teks sangat kecil di pojok', 'Huruf putih di latar putih'],
    'B',
    'Prinsip utama desain infografis adalah kemudahan dibaca (readability), hierarki ukuran teks, dan kontras warna yang jelas.',
  ],
  [
    1, 6, 'C3 - Menerapkan',
    'Kelompokmu terdiri atas 4 siswa yang mendapat tugas menyelesaikan proyek maket ruang Lab Komputer dalam waktu 1 minggu. Langkah pertama perencanaan kerja kelompok yang paling tepat adalah...',
    ['Mengumpulkan tugas tanpa diskusi', 'Menetapkan tujuan, jadwal, dan peran', 'Menyerahkan semua ke ketua tim', 'Menunggu hingga hari terakhir'],
    'B',
    'Perencanaan proyek yang baik dimulai dari penetapan tujuan, pembuatan jadwal kerja, dan pembagian peran yang adil.',
  ],
  [
    1, 7, 'C2 - Memahami',
    'Istilah "Sistem Komputasi" yang dipelajari dalam mata pelajaran Informatika merujuk pada...',
    ['Kesatuan hardware, software, dan pengguna', 'Meja dan kursi laboratorium saja', 'Alat tulis kantor dan papan kapur', 'Mesin ketik manual non-elektronik'],
    'A',
    'Sistem komputasi merupakan kesatuan hardware, software, dan brainware yang saling berinteraksi mengolah data menjadi informasi.',
  ],
  [
    1, 8, 'C4 - Menganalisis',
    'Perhatikan ciri-ciri slide presentasi berikut: (1) Satu slide berisi 30 baris paragraf penuh, (2) Menggunakan poin-poin inti maksimal 5 baris per slide, (3) Terdapat gambar atau grafik pendukung yang relevan. Ciri slide presentasi yang baik ditunjukkan oleh nomor...',
    ['(1) dan (2)', '(2) dan (3)', '(1) dan (3)', '(1) saja'],
    'B',
    'Slide presentasi yang efektif hanya memuat poin-poin inti yang ringkas dan dilengkapi visual/grafik pendukung agar audiens fokus.',
  ],
  [
    1, 9, 'C2 - Memahami',
    'Keterampilan dasar yang diperlukan siswa di semua bidang pelajaran untuk bekerja sama dan menyampaikan gagasan dalam kurikulum Informatika disebut...',
    ['Keterampilan Generik', 'Keterampilan Mesin Berat', 'Keterampilan Tata Boga', 'Keterampilan Tata Busana'],
    'A',
    'Keterampilan Generik mencakup kolaborasi (bekerja dalam kelompok) dan komunikasi (infografis serta presentasi).',
  ],
  [
    1, 10, 'C3 - Menerapkan',
    'Saat melakukan presentasi hasil proyek di depan Pak Azhary dan teman-teman Kelas 7, sikap tubuh dan intonasi suara yang tepat adalah...',
    ['Membelakangi audiens sambil berbisik', 'Kontak mata sopan dan suara jelas', 'Berbicara sangat cepat tanpa jeda', 'Menutupi wajah dengan buku catatan'],
    'B',
    'Kontak mata yang sopan, artikulasi jelas, dan tempo suara yang teratur membuat pesan presentasi mudah dipahami audiens.',
  ],
  [
    1, 11, 'C1 - Mengingat',
    'Era perkembangan industri saat ini yang ditandai dengan pemanfaatan Internet of Things (IoT), kecerdasan buatan (AI), dan mahadata (Big Data) dikenal sebagai...',
    ['Revolusi Industri 1.0', 'Revolusi Industri 2.0', 'Revolusi Industri 3.0', 'Revolusi Industri 4.0'],
    'D',
    'Revolusi Industri 4.0 mengintegrasikan teknologi siber, IoT, komputasi awan, dan kecerdasan buatan dalam kehidupan.',
  ],
  [
    1, 12, 'C2 - Memahami',
    'Konsep masyarakat masa depan yang berpusat pada manusia (human-centered) dan menyeimbangkan kemajuan ekonomi dengan penyelesaian masalah sosial melalui teknologi disebut...',
    ['Society 1.0', 'Society 2.0', 'Society 5.0', 'Society 0.0'],
    'C',
    'Society 5.0 adalah konsep masyarakat cerdas yang memanfaatkan teknologi Revolusi Industri 4.0 untuk kesejahteraan manusia.',
  ],
  [
    1, 13, 'C3 - Menerapkan',
    'Dalam tim pengembang game edukasi MTsN 14, terdapat anggota yang bertugas memeriksa apakah tombol jawaban sudah berfungsi benar dan mencatat jika ditemukan kesalahan. Peran anggota tersebut adalah...',
    ['Quality Assurance (Tester)', 'Bendahara Kelompok', 'Teknisi Listrik Gedung', 'Administrator Jaringan'],
    'A',
    'Tester atau Quality Assurance bertugas menguji program dan memastikan tidak ada bug sebelum karya dipublikasikan.',
  ],
  [
    1, 14, 'C4 - Menganalisis',
    'Jika dalam satu kelompok terdapat satu anggota yang kesulitan memahami tugasnya, tindakan kolaboratif yang paling tepat dilakukan oleh anggota kelompok lainnya adalah...',
    ['Mengeluarkan anggota dari kelompok', 'Membantu menjelaskan dan membimbing', 'Membiarkan tugas tersebut kosong', 'Memarahi anggota di grup kelas'],
    'B',
    'Esensi kolaborasi adalah saling mendukung dan berdiskusi memecahkan kendala bersama demi keberhasilan tim.',
  ],
  [
    1, 15, 'C2 - Memahami',
    'Tujuan utama penggunaan ikon dan ilustrasi visual pada sebuah infografis adalah...',
    ['Memperbesar ukuran file gambar', 'Memudahkan pemahaman isi pesan', 'Menghilangkan seluruh teks judul', 'Membuat tampilan lebih rumit'],
    'B',
    'Elemen visual seperti ikon dan ilustrasi membantu otak manusia memproses informasi lebih cepat dibandingkan teks panjang.',
  ],
  [
    1, 16, 'C3 - Menerapkan',
    'Bagian pembuka saat melakukan presentasi kelompok di depan kelas sebaiknya berisi...',
    ['Salam, perkenalan tim, dan topik', 'Ucapan penutup dan terima kasih', 'Pembacaan daftar pustaka akhir', 'Pemberian soal ujian mendadak'],
    'A',
    'Struktur presentasi diawali dengan pembukaan (salam, perkenalan tim, dan pengantar topik), isi, lalu penutup/kesimpulan.',
  ],
  [
    1, 17, 'C2 - Memahami',
    'Mengapa belajar Informatika penting bagi siswa MTs meskipun kelak tidak semua siswa bekerja sebagai programmer?',
    ['Melatih pola pikir logis dan sistematis', 'Mewajibkan siswa merakit motherboard', 'Agar bebas bermain game setiap hari', 'Menggantikan seluruh pelajaran lain'],
    'A',
    'Informatika membekali siswa dengan keterampilan berpikir komputasional dan literasi digital yang berguna di segala profesi.',
  ],
  [
    1, 18, 'C3 - Menerapkan',
    'Untuk memantau perkembangan tugas setiap anggota kelompok secara teratur, tim siswa Kelas 7B membuat tabel berisi kolom "Daftar Tugas", "Sedang Dikerjakan", dan "Selesai". Papan pemantau tugas seperti ini dikenal dengan istilah...',
    ['Papan Kanban (To-Do, Doing, Done)', 'Tabel Periodik Unsur', 'Diagram Rangkaian Listrik', 'Peta Topografi Wilayah'],
    'A',
    'Papan Kanban memudahkan tim memvisualisasikan alur pekerjaan dari tahap rencana (To-Do), proses (Doing), hingga tuntas (Done).',
  ],
  [
    1, 19, 'C4 - Menganalisis',
    'Sebuah poster infografis menampilkan data persentase ekstrakurikuler favorit siswa MTsN 14. Bentuk grafik yang paling tepat untuk menunjukkan perbandingan porsi persentase terhadap keseluruhan (total 100%) adalah...',
    ['Diagram Lingkaran (Pie Chart)', 'Peta Topografi Gunung', 'Skema Rangkaian Listrik', 'Struktur Folder Direktori'],
    'A',
    'Diagram lingkaran (Pie Chart) sangat efektif menggambarkan proporsi atau persentase bagian terhadap total keseluruhan.',
  ],
  [
    1, 20, 'C5 - Mengevaluasi',
    'Setelah selesai mempresentasikan proyek di kelas, Pak Azhary memberikan saran perbaikan atas desain infografis kelompokmu. Sikap terbaik dalam menerima umpan balik (feedback) tersebut adalah...',
    ['Mencatat saran untuk perbaikan karya', 'Menolak masukan karena merasa sempurna', 'Menyalahkan anggota kelompok lain', 'Menghapus seluruh file proyek'],
    'A',
    'Menerima umpan balik secara terbuka dan konstruktif adalah bagian penting dari evaluasi dan pengembangan diri dalam kerja tim.',
  ],

  // ===========================================================================
  // BAB 2 KELAS 7: BERPIKIR KOMPUTASIONAL (20 SOAL)
  // ===========================================================================
  [
    2, 1, 'C4 - Menganalisis',
    'Di arena Roblox MTsN 14, terdapat teka-teki lantai lampu piksel 4 kotak berurutan. Aturannya: bit 1 berarti lampu MENYALA (Hijau) dan bit 0 berarti lampu PADAM (Hitam). Jika urutan lampu dari kiri ke kanan adalah: MENYALA - PADAM - MENYALA - MENYALA, maka representasi data binernya adalah...',
    ['1011', '0100', '1101', '1001'],
    'A',
    'Menyala = 1 dan Padam = 0. Maka Menyala - Padam - Menyala - Menyala direpresentasikan sebagai 1011.',
  ],
  [
    2, 2, 'C3 - Menerapkan',
    'Panitia Class Meeting MTsN 14 memiliki 3 lapangan mini dan ingin menjadwalkan 6 pertandingan futsal (masing-masing berdurasi 20 menit) agar seluruh pertandingan selesai dalam waktu paling singkat. Konsep Berpikir Komputasional yang digunakan adalah...',
    ['Enkripsi Kriptografi', 'Optimasi Penjadwalan', 'Instalasi Perangkat Keras', 'Kompilasi Bahasa Mesin'],
    'B',
    'Optimasi Penjadwalan mengatur urutan kegiatan dan pemakaian sumber daya secara paralel agar waktu total seminimal mungkin.',
  ],
  [
    2, 3, 'C1 - Mengingat',
    'Cara berpikir untuk menyelesaikan persoalan secara logis, sistematis, dan efisien sehingga solusinya dapat dijalankan oleh manusia maupun komputer disebut...',
    ['Berpikir Komputasional (Computational Thinking)', 'Berpikir Spekulatif Tanpa Data', 'Berpikir Acak (Random Guessing)', 'Berpikir Imajinatif Fiksi'],
    'A',
    'Computational Thinking adalah proses berpikir memformulasikan persoalan dan menyusun solusi yang efektif serta efisien.',
  ],
  [
    2, 4, 'C2 - Memahami',
    'Memecah suatu permasalahan besar dan kompleks menjadi bagian-bagian yang lebih kecil agar lebih mudah diselesaikan satu per satu merupakan pilar berpikir komputasional yang disebut...',
    ['Dekomposisi (Decomposition)', 'Abstraksi (Abstraction)', 'Pengenalan Pola (Pattern Recognition)', 'Enkripsi (Encryption)'],
    'A',
    'Dekomposisi adalah teknik membagi masalah besar menjadi sub-masalah yang lebih kecil dan terkelola.',
  ],
  [
    2, 5, 'C2 - Memahami',
    'Ketika kamu melihat peta denah kampus MTsN 14, peta tersebut hanya menampilkan posisi gedung utama, jalan, dan nama ruangan tanpa menggambar setiap helai rumput atau batu kerikil. Menyaring informasi penting dan mengabaikan detail yang tidak relevan disebut...',
    ['Abstraksi (Abstraction)', 'Dekomposisi (Decomposition)', 'Instalasi (Installation)', 'Duplikasi (Duplication)'],
    'A',
    'Abstraksi adalah proses memfokuskan perhatian pada informasi penting yang relevan dan mengabaikan detail yang tidak diperlukan.',
  ],
  [
    2, 6, 'C3 - Menerapkan',
    'Perhatikan deret pola gelang manik-manik karya siswa Kelas 7 berikut: Merah - Kuning - Hijau - Biru - Merah - Kuning - Hijau - Biru. Jika pola tersebut diulang terus-menerus, manik-manik urutan ke-10 berwarna...',
    ['Merah', 'Kuning', 'Hijau', 'Biru'],
    'B',
    'Pola berulang setiap 4 warna (1:Merah, 2:Kuning, 3:Hijau, 4:Biru). Urutan ke-10 dibagi 4 bersisa 2, yaitu warna Kuning.',
  ],
  [
    2, 7, 'C3 - Menerapkan',
    'Ibu Kantin MTsN 14 memiliki 2 wajan penggorengan. Setiap wajan hanya muat menggoreng 1 roti bakar yang membutuhkan waktu 3 menit. Berapa waktu paling singkat untuk menggoreng 4 roti bakar?',
    ['12 menit', '9 menit', '6 menit', '3 menit'],
    'C',
    'Dengan 2 wajan bekerja bersamaan (paralel): kloter pertama (2 roti) selesai 3 menit, kloter kedua (2 roti) selesai 3 menit. Total = 6 menit.',
  ],
  [
    2, 8, 'C4 - Menganalisis',
    'Terdapat 3 ember berkapasitas 5 liter, 3 liter, dan 8 liter. Kamu ingin membawa tepat 8 liter air dengan jumlah ember paling sedikit. Pilihan optimasi yang tepat adalah...',
    ['1 ember kapasitas 8 liter', '2 ember (5 liter dan 3 liter)', '3 ember diisi setengah penuh', '2 ember (8 liter dan 3 liter)'],
    'A',
    'Menggunakan satu ember berkapasitas 8 liter langsung memenuhi target dengan jumlah wadah paling minimal.',
  ],
  [
    2, 9, 'C2 - Memahami',
    'Urutan langkah-langkah logis, terstruktur, dan terbatas yang disusun untuk menyelesaikan suatu masalah disebut...',
    ['Algoritma', 'Periferal', 'Motherboard', 'Browser'],
    'A',
    'Algoritma adalah urutan langkah terbatas dan logis untuk menyelesaikan suatu masalah secara sistematis.',
  ],
  [
    2, 10, 'C3 - Menerapkan',
    'Perhatikan urutan langkah membuat teh manis yang masih acak berikut: (1) Tuang air panas ke gelas, (2) Siapkan gelas, teh celup, dan gula, (3) Aduk hingga gula larut dan teh siap diminum, (4) Masukkan teh celup dan gula ke dalam gelas. Urutan algoritma yang benar adalah...',
    ['(2) - (4) - (1) - (3)', '(1) - (2) - (3) - (4)', '(3) - (1) - (4) - (2)', '(4) - (3) - (2) - (1)'],
    'A',
    'Langkah logis dimulai dari menyiapkan bahan (2), memasukkan teh & gula ke gelas (4), menuang air panas (1), lalu mengaduknya (3).',
  ],
  [
    2, 11, 'C2 - Memahami',
    'Dalam struktur data sederhana Kelas 7, sekumpulan data yang disimpan secara berurutan (seperti daftar hadir siswa dari nomor urut 1 sampai 32) disebut...',
    ['Struktur Data Daftar (List)', 'Jaringan Nirkabel Lokal', 'Kabel Serat Optik', 'Catu Daya Listrik'],
    'A',
    'List (Daftar) adalah struktur data yang menyimpan elemen-elemen secara berurutan sehingga mudah ditelusuri.',
  ],
  [
    2, 12, 'C4 - Menganalisis',
    'Pada daftar antrean peminjaman buku perpustakaan MTsN 14 tercatat urutan nama: [1. Andi, 2. Budi, 3. Citra, 4. Dinda]. Jika Andi sudah selesai dilayani dan keluar dari antrean, lalu Eka masuk di urutan paling belakang, maka isi daftar sekarang adalah...',
    ['[Budi, Citra, Dinda, Eka]', '[Andi, Eka, Budi, Citra]', '[Eka, Budi, Citra, Dinda]', '[Citra, Dinda, Andi, Eka]'],
    'A',
    'Setelah Andi keluar dari depan antrean dan Eka masuk di posisi terakhir, urutan menjadi Budi, Citra, Dinda, lalu Eka.',
  ],
  [
    2, 13, 'C3 - Menerapkan',
    'Sebuah layar matriks LED berukuran 3×3 kotak membentuk huruf dengan kode baris ke-1: 111, baris ke-2: 010, dan baris ke-3: 010 (angka 1 = menyala, 0 = mati). Huruf yang terbentuk pada layar LED tersebut adalah...',
    ['Huruf T', 'Huruf L', 'Huruf O', 'Huruf U'],
    'A',
    'Baris atas menyala penuh (111) dan bagian tengah bawah menyala lurus vertikal (010 dan 010) membentuk huruf T.',
  ],
  [
    2, 14, 'C2 - Memahami',
    'Representasi data yang hanya memiliki dua kemungkinan nilai, seperti Benar/Salah (True/False), Ya/Tidak, atau 1/0 disebut representasi...',
    ['Biner (Boolean)', 'Desimal', 'Heksadesimal', 'Romawi'],
    'A',
    'Representasi biner atau logika Boolean hanya menggunakan dua keadaan nilai, yaitu 1 (Benar/Ya) dan 0 (Salah/Tidak).',
  ],
  [
    2, 15, 'C4 - Menganalisis',
    'Untuk menebak sebuah angka rahasia antara 1 sampai 16 dengan jumlah pertanyaan "Apakah lebih besar dari X?" paling sedikit, strategi pencarian yang selalu membagi dua rentang angka di tengah disebut...',
    ['Pencarian Bagi Dua (Binary Search)', 'Tebak Acak Tanpa Aturan', 'Hitung Mundur Satu per Satu', 'Pengurutan Abjad Manual'],
    'A',
    'Binary Search (pencarian bagi dua) sangat efisien karena memangkas setengah kemungkinan pada setiap langkah.',
  ],
  [
    2, 16, 'C3 - Menerapkan',
    'Tas ransel seorang siswa maksimal mampu menahan beban 5 kg. Terdapat 4 barang: Buku Paket (2 kg), Laptop (3 kg), Kamus Tebal (4 kg), dan Kotak Pensil (1 kg). Kombinasi barang yang tepat memenuhi kapasitas 5 kg secara optimal adalah...',
    ['Buku Paket (2 kg) dan Kotak Pensil (1 kg)', 'Buku Paket (2 kg), Laptop (3 kg), dan Kamus (4 kg)', 'Buku Paket (2 kg) dan Laptop (3 kg)', 'Kamus Tebal (4 kg) dan Laptop (3 kg)'],
    'C',
    'Kapasitas maksimal 5 kg paling optimal diisi dengan Buku Paket (2 kg) + Laptop (3 kg) = 5 kg.',
  ],
  [
    2, 17, 'C2 - Memahami',
    'Mengenali kesamaan ciri atau keteraturan dari beberapa masalah yang pernah diselesaikan sebelumnya agar solusi dapat diterapkan kembali merupakan tahap...',
    ['Pengenalan Pola (Pattern Recognition)', 'Penghapusan Data Permanen', 'Pemformatan Media Penyimpanan', 'Pencetakan Dokumen Kertas'],
    'A',
    'Pengenalan Pola mencari kesamaan karakteristik masalah sehingga kita dapat memanfaatkan pola solusi yang sudah ada.',
  ],
  [
    2, 18, 'C4 - Menganalisis',
    'Robot pembersih lantai bergerak pada petak ubin dengan perintah: U (Utara/Atas), S (Selatan/Bawah), T (Timur/Kanan), B (Barat/Kiri). Jika robot mulai di petak (0,0) dan menjalankan perintah: T -> T -> U -> U -> B, maka posisi akhir robot berada di koordinat...',
    ['(1, 2)', '(2, 2)', '(0, 1)', '(3, 1)'],
    'A',
    'Dari (0,0): T->(1,0), T->(2,0), U->(2,1), U->(2,2), B->(1,2). Maka koordinat akhirnya adalah (1, 2).',
  ],
  [
    2, 19, 'C3 - Menerapkan',
    'Di perpustakaan MTsN 14 terdapat 5 buku dengan ketebalan halaman: 120, 80, 200, 150, dan 95 halaman. Jika pustakawan menyusun buku dari yang paling tipis ke paling tebal (Ascending), urutan ketebalan yang benar adalah...',
    ['80, 95, 120, 150, 200', '200, 150, 120, 95, 80', '80, 120, 95, 150, 200', '120, 80, 95, 150, 200'],
    'A',
    'Pengurutan menaik (Ascending) menyusun nilai dari terkecil hingga terbesar: 80, 95, 120, 150, 200.',
  ],
  [
    2, 20, 'C5 - Mengevaluasi',
    'Dua siswa menulis algoritma menuju Masjid Al-Huda dari Kelas 7A. Algoritma Raka membutuhkan 45 langkah melewati koridor utama, sedangkan Algoritma Dimas membutuhkan 110 langkah memutari seluruh lapangan belakang. Mengapa Algoritma Raka dinilai lebih optimal?',
    ['Jumlah langkah dan waktu lebih efisien', 'Semakin jauh memutar semakin baik', 'Algoritma tidak perlu sampai tujuan', 'Algoritma wajib paling panjang'],
    'A',
    'Algoritma yang optimal adalah algoritma yang menghasilkan solusi benar dengan penggunaan waktu/langkah paling efisien.',
  ],

  // ===========================================================================
  // BAB 3 KELAS 7: TEKNOLOGI INFORMASI DAN KOMUNIKASI (20 SOAL)
  // ===========================================================================
  [
    3, 1, 'C2 - Memahami',
    'Setelah menyelesaikan misi di Lab Komputer MTsN 14, kamu diminta menyimpan 3 berkas ke dalam folder tugas: dokumen laporan teks, tabel nilai lembar kerja, dan gambar tangkapan layar (screenshot). Pasangan ekstensi file yang tepat secara berurutan adalah...',
    ['.mp3, .mp4, dan .exe', '.docx, .xlsx, dan .png', '.jpg, .html, dan .zip', '.pptx, .mp3, dan .avi'],
    'B',
    '.docx adalah dokumen pengolah kata, .xlsx adalah lembar kerja (spreadsheet), dan .png adalah berkas gambar.',
  ],
  [
    3, 2, 'C1 - Mengingat',
    'Bentuk antarmuka pengguna pada komputer atau smartphone yang menggunakan elemen visual seperti ikon, tombol, jendela (window), dan penunjuk mouse disebut...',
    ['GUI (Graphical User Interface)', 'CLI (Command Line Interface)', 'CPU (Central Processing Unit)', 'RAM (Random Access Memory)'],
    'A',
    'GUI (Graphical User Interface) memungkinkan pengguna berinteraksi dengan perangkat melalui objek grafis/ikon.',
  ],
  [
    3, 3, 'C2 - Memahami',
    'Antarmuka komputer berbasis teks di mana pengguna harus mengetikkan baris perintah secara langsung menggunakan keyboard disebut...',
    ['CLI (Command Line Interface)', 'GUI (Graphical User Interface)', 'Layar Sentuh Grafis', 'Wallpaper Desktop'],
    'A',
    'CLI (Command Line Interface) seperti Command Prompt atau Terminal menerima instruksi melalui ketikan teks perintah.',
  ],
  [
    3, 4, 'C1 - Mengingat',
    'Pada sistem operasi Windows, aplikasi bawaan yang berfungsi untuk mengelola file dan folder (membuat folder, menyalin, memindahkan, atau menghapus berkas) adalah...',
    ['File Explorer (Windows Explorer)', 'Microsoft Paint', 'Calculator', 'Windows Media Player'],
    'A',
    'File Explorer digunakan untuk menelusuri struktur direktori, membuat folder, dan mengatur berkas di media penyimpanan.',
  ],
  [
    3, 5, 'C3 - Menerapkan',
    'Kombinasi tombol pintas (shortcut keyboard) yang digunakan untuk MENYALIN (Copy) dan MENEMPELKAN (Paste) sebuah file atau teks secara berurutan adalah...',
    ['Ctrl + C lalu Ctrl + V', 'Ctrl + Z lalu Ctrl + Y', 'Ctrl + P lalu Ctrl + S', 'Alt + F4 lalu Ctrl + A'],
    'A',
    'Ctrl + C berfungsi menyalin (Copy) objek, sedangkan Ctrl + V berfungsi menempelkan (Paste) objek di lokasi tujuan.',
  ],
  [
    3, 6, 'C3 - Menerapkan',
    'Jika kamu ingin MEMINDAHKAN (Cut) sebuah file tugas dari folder "Unduhan" ke folder "Tugas_Informatika" agar file lama tidak mengganda di folder asal, pintasan keyboard yang digunakan adalah...',
    ['Ctrl + X lalu Ctrl + V', 'Ctrl + C lalu Ctrl + P', 'Ctrl + B lalu Ctrl + I', 'Ctrl + S lalu Ctrl + O'],
    'A',
    'Ctrl + X melakukan perintah Cut (potong/pindah) dan Ctrl + V menempelkannya di folder baru.',
  ],
  [
    3, 7, 'C2 - Memahami',
    'Perbedaan utama antara Peramban Web (Web Browser) dan Mesin Pencari (Search Engine) adalah...',
    ['Browser membuka web, Search Engine mencari info', 'Browser dan Search Engine adalah hardware CPU', 'Search Engine berjalan tanpa koneksi internet', 'Browser hanya untuk mengetik surat offline'],
    'A',
    'Web Browser adalah perangkat lunak aplikasi untuk mengakses halaman web, sedangkan Search Engine adalah situs pencari informasi di internet.',
  ],
  [
    3, 8, 'C1 - Mengingat',
    'Alamat unik yang menunjukkan lokasi suatu halaman web di internet, misalnya https://mtsn14-jakarta.sch.id, disebut...',
    ['URL (Uniform Resource Locator)', 'ISP (Internet Service Provider)', 'USB (Universal Serial Bus)', 'VGA (Video Graphics Array)'],
    'A',
    'URL adalah alamat standar yang digunakan pada baris alamat (Address Bar) browser untuk menuju suatu situs web.',
  ],
  [
    3, 9, 'C3 - Menerapkan',
    'Saat menggunakan mesin pencari Google untuk mencari dokumen berformat PDF tentang "Kurikulum Merdeka Informatika", teknik pengetikan kata kunci yang paling tepat dan spesifik adalah...',
    ['"Kurikulum Merdeka Informatika" filetype:pdf', 'Kurikulum Merdeka Informatika filetype:mp3', 'Kurikulum Merdeka Informatika site:jpg', 'Kurikulum Merdeka Informatika delete:all'],
    'A',
    'Tanda kutip ("...") mencari frasa persis dan operator filetype:pdf menyaring hasil pencarian khusus dokumen berformat PDF.',
  ],
  [
    3, 10, 'C2 - Memahami',
    'Pada halaman peramban web (Browser), tombol berbentuk panah melingkar (Reload / Refresh) berfungsi untuk...',
    ['Memuat ulang halaman web terbaru', 'Mematikan komputer secara paksa', 'Menghapus seluruh sistem operasi', 'Mencetak halaman web ke kertas'],
    'A',
    'Tombol Refresh/Reload (atau tombol F5) memuat ulang halaman web dari server.',
  ],
  [
    3, 11, 'C2 - Memahami',
    'Fitur "Bookmark" (Tanda Buku / Ikon Bintang) pada aplikasi peramban web berfungsi untuk...',
    ['Menyimpan tautan situs web favorit', 'Menghapus riwayat penjelajahan web', 'Mempercepat putaran kipas prosesor', 'Mengubah ukuran layar monitor'],
    'A',
    'Bookmark menyimpan tautan situs web favorit sehingga pengguna tidak perlu mengetik ulang URL-nya setiap saat.',
  ],
  [
    3, 12, 'C3 - Menerapkan',
    'Ketika mengirim surat elektronik (Surel / Email) tugas sekolah kepada Pak Azhary, bagian kolom yang wajib diisi dengan judul singkat mengenai isi pesan email adalah...',
    ['Subject (Subjek)', 'Password (Kata Sandi)', 'Trash (Sampah)', 'Spam'],
    'A',
    'Kolom Subject berisi ringkasan singkat tujuan email (misal: "Tugas Bab 3 Informatika - Nama Siswa Kelas 7A").',
  ],
  [
    3, 13, 'C4 - Menganalisis',
    'Dalam pengiriman email, apakah perbedaan fungsi antara kolom penerima "CC" (Carbon Copy) dan "BCC" (Blind Carbon Copy)?',
    ['CC terlihat penerima lain, BCC disembunyikan', 'CC untuk foto, BCC untuk rekaman suara', 'CC hanya bekerja tanpa jaringan internet', 'CC dan BCC memiliki fungsi yang sama persis'],
    'A',
    'CC menampilkan daftar alamat penerima tembusan secara terbuka, sedangkan BCC merahasiakan alamat penerima tembusan dari penerima lain.',
  ],
  [
    3, 14, 'C2 - Memahami',
    'Ikon berbentuk penjepit kertas (Paperclip) pada saat menulis pesan email berfungsi untuk...',
    ['Melampirkan berkas dokumen (Attachment)', 'Menghapus akun email secara permanen', 'Mengganti tema warna latar email', 'Keluar (Sign Out) dari akun email'],
    'A',
    'Ikon Paperclip adalah fitur Attachment untuk menyertakan lampiran file ke dalam surat elektronik.',
  ],
  [
    3, 15, 'C2 - Memahami',
    'Manakah dari daftar berikut yang merupakan ekstensi berkas khusus untuk dokumen presentasi salindia (slide)?',
    ['.pptx', '.mp3', '.xlsx', '.exe'],
    'A',
    'Ekstensi .pptx merupakan format berkas standar untuk presentasi Microsoft PowerPoint.',
  ],
  [
    3, 16, 'C2 - Memahami',
    'Berkas yang telah dikompresi (dipadatkan ukurannya) agar beberapa file dan folder menyatu menjadi satu paket arsip tunggal biasanya memiliki ekstensi...',
    ['.zip atau .rar', '.txt atau .doc', '.jpg atau .bmp', '.wav atau .mp3'],
    'A',
    'Format .zip dan .rar digunakan untuk mengarsipkan serta mengompresi ukuran sekumpulan file/folder.',
  ],
  [
    3, 17, 'C3 - Menerapkan',
    'Agar penyimpanan file di komputer rapi dan mudah dicari, siswa Kelas 7 disarankan membuat struktur folder hierarkis. Contoh penamaan dan pengelompokan folder yang paling rapi adalah...',
    ['Semester_1 -> Informatika -> Tugas_Bab3.pdf', 'Desktop -> asdf1.pdf, asdf2.pdf, baru.pdf', 'Jangan_Dibuka -> Lagu, Game, dan Tugas', 'Folder_Tanpa_Nama -> File_Titik.pdf'],
    'A',
    'Pengorganisasian folder berjenjang berdasarkan semester/mata pelajaran serta penamaan file yang deskriptif memudahkan pencarian berkas.',
  ],
  [
    3, 18, 'C2 - Memahami',
    'Dalam aplikasi pengolah kata (Word Processor), fitur untuk mengatur perataan teks agar rata di tepi kiri sekaligus rata di tepi kanan halaman disebut...',
    ['Justify (Rata Kiri-Kanan)', 'Align Left (Rata Kiri)', 'Center (Rata Tengah)', 'Align Right (Rata Kanan)'],
    'A',
    'Perataan Justify (Ctrl + J) membuat paragraf tampak rapi dengan tepi kiri dan kanan yang sejajar.',
  ],
  [
    3, 19, 'C3 - Menerapkan',
    'Jika kamu tidak sengaja menghapus paragraf penting saat mengetik laporan di pengolah kata, perintah cepat untuk membatalkan tindakan terakhir (Undo) adalah...',
    ['Ctrl + Z', 'Ctrl + X', 'Ctrl + S', 'Ctrl + P'],
    'A',
    'Tombol kombinasi Ctrl + Z menjalankan fungsi Undo untuk mengembalikan kondisi sebelum perubahan terakhir.',
  ],
  [
    3, 20, 'C5 - Mengevaluasi',
    'Mengapa kita dianjurkan menyimpan dokumen penting dalam format .pdf sebelum dikirimkan melalui email kepada guru?',
    ['Tata letak dan font tetap konsisten', 'Ukuran file menjadi ratusan gigabyte', 'Isi teks otomatis terhapus bersih', 'Dokumen terkunci dan gagal dibuka'],
    'A',
    'Format PDF (Portable Document Format) menjaga konsistensi tampilan tata letak dokumen di berbagai sistem operasi dan perangkat.',
  ],

  // ===========================================================================
  // BAB 4 KELAS 7: SISTEM KOMPUTER (20 SOAL)
  // ===========================================================================
  [
    4, 1, 'C2 - Memahami',
    'Saat kamu menggerakkan karakter 3D di arena MTsN 14 menggunakan tombol WASD pada Keyboard, lalu melihat tampilan gedung sekolah di Monitor dan mendengar efek suara langkah kaki di Speaker, urutan pengelompokan perangkat keras tersebut adalah...',
    ['Input, Output, dan Output', 'Output, Input, dan Proses', 'Proses, Storage, dan Input', 'Storage, Output, dan Input'],
    'A',
    'Keyboard memasukkan perintah ke komputer (Input), sedangkan Monitor dan Speaker menampilkan hasil keluaran (Output).',
  ],
  [
    4, 2, 'C1 - Mengingat',
    'Tiga komponen utama penyusun Sistem Komputer yang saling berkaitan agar komputer dapat berfungsi adalah...',
    ['Hardware, Software, dan Brainware', 'Monitor, Meja, dan Kursi Putar', 'Internet, Kabel, dan Stopkontak', 'Kertas, Tinta, dan Mesin Cetak'],
    'A',
    'Sistem komputer terdiri atas kesatuan Hardware, Software, dan Brainware.',
  ],
  [
    4, 3, 'C1 - Mengingat',
    'Komponen perangkat keras yang berfungsi sebagai "otak" komputer untuk mengeksekusi instruksi dan mengolah data adalah...',
    ['CPU (Prosesor)', 'Flashdisk USB', 'Mouse Optik', 'Casing Komputer'],
    'A',
    'CPU (Central Processing Unit) adalah pusat pemrosesan utama di dalam sistem komputer.',
  ],
  [
    4, 4, 'C2 - Memahami',
    'Di dalam CPU terdapat bagian yang bertugas melakukan perhitungan aritmatika (penjumlahan, pengurangan) dan perbandingan logika (AND, OR, NOT). Bagian tersebut adalah...',
    ['ALU (Arithmetic Logic Unit)', 'CU (Control Unit)', 'ROM (Read Only Memory)', 'PSU (Power Supply Unit)'],
    'A',
    'ALU (Arithmetic Logic Unit) adalah bagian CPU yang menangani operasi perhitungan matematika dan logika.',
  ],
  [
    4, 5, 'C2 - Memahami',
    'Perbedaan mendasar antara memori RAM (Random Access Memory) dan media penyimpanan SSD/Harddisk adalah...',
    ['RAM bersifat sementara, SSD permanen', 'RAM bersifat permanen, SSD sementara', 'RAM di luar CPU, SSD input suara', 'RAM dan SSD tidak menyimpan data'],
    'A',
    'RAM adalah memori kerja sementara (volatile), sedangkan SSD/Harddisk adalah penyimpanan sekunder permanen (non-volatile).',
  ],
  [
    4, 6, 'C1 - Mengingat',
    'Perangkat keras di Lab Komputer MTsN 14 yang berfungsi memindai lembaran kertas dokumen atau foto fisik menjadi file gambar digital di dalam komputer adalah...',
    ['Scanner (Pemindai)', 'Plotter', 'Proyektor LCD', 'Speaker Aktif'],
    'A',
    'Scanner merupakan perangkat masukan (Input Device) yang mengubah dokumen cetak menjadi data gambar digital.',
  ],
  [
    4, 7, 'C2 - Memahami',
    'Proyektor LCD yang terpasang di langit-langit ruang kelas MTsN 14 untuk menampilkan layar komputer guru ke papan tulis termasuk ke dalam kelompok perangkat...',
    ['Perangkat Keluaran (Output Device)', 'Perangkat Masukan (Input Device)', 'Perangkat Penyimpanan (Storage Device)', 'Perangkat Pemroses (Processing Device)'],
    'A',
    'Proyektor mengeluarkan tampilan visual dari komputer ke layar besar sehingga termasuk Output Device.',
  ],
  [
    4, 8, 'C2 - Memahami',
    'Papan sirkuit utama di dalam casing komputer tempat terpasangnya prosesor (CPU), keping RAM, kartu grafis, dan konektor penyimpanan disebut...',
    ['Motherboard (Mainboard)', 'Keyboard Mekanik', 'Touchpad', 'Stabilizer Listrik'],
    'A',
    'Motherboard adalah papan induk yang menghubungkan seluruh komponen perangkat keras internal komputer.',
  ],
  [
    4, 9, 'C2 - Memahami',
    'Perangkat lunak paling mendasar yang bertugas mengelola seluruh perangkat keras komputer dan menjadi jembatan bagi aplikasi lain untuk berjalan (contoh: Windows, Linux, macOS, Android) disebut...',
    ['Sistem Operasi (Operating System)', 'Aplikasi Permainan (Game)', 'Program Pengolah Kata', 'Antivirus Tambahan'],
    'A',
    'Sistem Operasi adalah software sistem utama yang mengatur sumber daya perangkat keras dan menyediakan layanan bagi aplikasi.',
  ],
  [
    4, 10, 'C3 - Menerapkan',
    'Manakah dari kelompok perangkat lunak di bawah ini yang SELURUHNYA merupakan Perangkat Lunak Aplikasi (Application Software)?',
    ['Microsoft Word, Google Chrome, dan Scratch', 'Windows 11, Ubuntu Linux, dan Android', 'BIOS, Firmware, dan Windows Server', 'macOS, iOS, dan Debian Linux'],
    'A',
    'Microsoft Word (pengolah kata), Google Chrome (peramban), dan Scratch (pemrograman visual) adalah program aplikasi pengguna.',
  ],
  [
    4, 11, 'C2 - Memahami',
    'Perangkat lunak yang kode sumbernya (source code) dibuka untuk publik sehingga bebas digunakan, dipelajari, dan dikembangkan bersama tanpa biaya lisensi disebut...',
    ['Open Source Software (Sumber Terbuka)', 'Proprietary / Commercial Software', 'Malware Berbahaya', 'Hardware Eksternal'],
    'A',
    'Open Source Software (seperti Linux atau LibreOffice) membuka kode sumbernya dan bebas digunakan secara legal.',
  ],
  [
    4, 12, 'C1 - Mengingat',
    'Satuan terkecil dalam representasi data digital pada komputer yang hanya bernilai 0 atau 1 disebut...',
    ['Bit (Binary Digit)', 'Megabyte', 'Terabyte', 'Hertz'],
    'A',
    'Bit (Binary Digit) adalah unit data terkecil dalam komputasi yang bernilai 0 atau 1.',
  ],
  [
    4, 13, 'C2 - Memahami',
    'Dalam standar ukuran penyimpanan data komputer, 1 Byte setara dengan berapa bit?',
    ['8 bit', '2 bit', '10 bit', '100 bit'],
    'A',
    '1 Byte terdiri atas rangkaian 8 bit data biner.',
  ],
  [
    4, 14, 'C3 - Menerapkan',
    'Konversikan bilangan biner 4-bit 1101(2) ke dalam bilangan desimal (basis 10)!',
    ['13', '11', '9', '15'],
    'A',
    '1101(2) = (1×8) + (1×4) + (0×2) + (1×1) = 8 + 4 + 0 + 1 = 13.',
  ],
  [
    4, 15, 'C3 - Menerapkan',
    'Jika sebuah angka desimal bernilai 9, maka representasi bilangan biner 4-bit-nya adalah...',
    ['1001', '1010', '1100', '0111'],
    'A',
    '9 = 8 + 1 = (1×8) + (0×4) + (0×2) + (1×1) = 1001(2).',
  ],
  [
    4, 16, 'C2 - Memahami',
    'Komponen pengolah grafis yang bertugas merender objek 3D (seperti gedung dan avatar di arena Roblox MTsN 14) agar tampil mulus di layar monitor adalah...',
    ['GPU / VGA Card (Graphics Processing Unit)', 'Sound Card', 'LAN Card', 'Floppy Disk Drive'],
    'A',
    'GPU (Graphics Processing Unit) atau kartu grafis dirancang khusus untuk mengolah perhitungan visual dan grafis 3D.',
  ],
  [
    4, 17, 'C2 - Memahami',
    'Orang yang mengoperasikan, merawat, maupun membuat program pada sistem komputer (seperti Siswa, Guru, Programmer, dan Teknisi Lab) dikelompokkan sebagai...',
    ['Brainware', 'Hardware', 'Software', 'Firmware'],
    'A',
    'Brainware adalah manusia/pengguna yang terlibat dalam pengoperasian dan pengembangan sistem komputer.',
  ],
  [
    4, 18, 'C4 - Menganalisis',
    'Komputer di Lab MTsN 14 terasa sangat lambat ketika membuka 15 aplikasi secara bersamaan, padahal ruang penyimpanan Harddisk masih kosong 80%. Komponen perangkat keras yang paling berpengaruh terhadap kelancaran membuka banyak aplikasi sekaligus (multitasking) adalah...',
    ['Kapasitas RAM (Random Access Memory)', 'Ukuran Mousepad', 'Panjang Kabel Keyboard', 'Warna Casing Komputer'],
    'A',
    'Setiap aplikasi yang sedang berjalan dimuat ke dalam RAM. Jika kapasitas RAM penuh, performa multitasking akan melambat.',
  ],
  [
    4, 19, 'C2 - Memahami',
    'Memori permanen pada motherboard yang menyimpan program BIOS untuk memeriksa kesiapan perangkat keras saat komputer pertama kali dinyalakan (booting) adalah...',
    ['ROM (Read Only Memory)', 'RAM (Random Access Memory)', 'CD-RW', 'Kertas Berlubang'],
    'A',
    'ROM menyimpan instruksi dasar firmware/BIOS secara permanen yang dijalankan saat proses booting awal.',
  ],
  [
    4, 20, 'C3 - Menerapkan',
    'Sebuah flashdisk memiliki kapasitas kosong sebesar 2 Gigabyte (GB). Jika 1 GB dianggap setara dengan 1.024 Megabyte (MB), berapa banyak file video pembelajaran berukuran 512 MB yang dapat disimpan ke dalam flashdisk tersebut?',
    ['4 file video', '2 file video', '8 file video', '1 file video'],
    'A',
    'Total kapasitas = 2 × 1.024 MB = 2.048 MB. Jumlah file = 2.048 MB ÷ 512 MB = 4 file video.',
  ],

  // ===========================================================================
  // BAB 5 KELAS 7: JARINGAN KOMPUTER DAN INTERNET (20 SOAL)
  // ===========================================================================
  [
    5, 1, 'C3 - Menerapkan',
    'Untuk membuka brankas poin misi di dekat Gerbang MTsN 14, terdapat sandi rahasia menggunakan Caesar Cipher dengan pergeseran 2 huruf ke kanan (A menjadi C, B menjadi D, dst). Jika kata kunci aslinya adalah "HALIM", maka teks sandinya (Ciphertext) adalah...',
    ['JCNKO', 'IBMJN', 'FYNGL', 'KDPNR'],
    'A',
    'Geser setiap huruf "HALIM" maju 2 huruf alfabet: H->J, A->C, L->N, I->K, M->O. Sehingga menghasilkan sandi "JCNKO".',
  ],
  [
    5, 2, 'C1 - Mengingat',
    'Dua atau lebih perangkat komputer yang saling terhubung melalui media kabel maupun nirkabel untuk berbagi data dan sumber daya disebut...',
    ['Jaringan Komputer (Computer Network)', 'Sistem Berkas Mandiri', 'Perangkat Input Tunggal', 'Aplikasi Lembar Kerja'],
    'A',
    'Jaringan komputer menghubungkan beberapa perangkat agar dapat saling bertukar informasi dan berbagi sumber daya (seperti printer/internet).',
  ],
  [
    5, 3, 'C1 - Mengingat',
    'Jaringan komputer raksasa tingkat dunia yang menghubungkan jutaan jaringan komputer di seluruh belahan bumi menggunakan protokol TCP/IP disebut...',
    ['Internet (Interconnected Network)', 'Bluetooth Jarak Dekat', 'Kabel Printer Lokal', 'Penyimpanan Internal'],
    'A',
    'Internet adalah singkatan dari Interconnected Network, yaitu jaringan komunikasi global yang menghubungkan komputer di seluruh dunia.',
  ],
  [
    5, 4, 'C2 - Memahami',
    'Jaringan komputer yang cakupannya hanya meliputi satu ruangan laboratorium atau satu lingkungan gedung sekolah MTsN 14 disebut...',
    ['LAN (Local Area Network)', 'WAN (Wide Area Network)', 'MAN (Metropolitan Area Network)', 'Satelit Antargalaksi'],
    'A',
    'LAN (Local Area Network) adalah jaringan komputer lokal dalam area terbatas seperti ruang lab, sekolah, atau kantor.',
  ],
  [
    5, 5, 'C2 - Memahami',
    'Teknologi jaringan lokal tanpa kabel (nirkabel) yang memanfaatkan gelombang radio agar laptop dan smartphone siswa dapat terhubung ke internet di area sekolah disebut...',
    ['WLAN / Wi-Fi (Wireless Fidelity)', 'Kabel Coaxial', 'Disket Magnetik', 'Port VGA'],
    'A',
    'Wi-Fi (Wireless Local Area Network) menghubungkan perangkat ke jaringan menggunakan sinyal gelombang radio tanpa kabel.',
  ],
  [
    5, 6, 'C3 - Menerapkan',
    'Ketika koneksi Wi-Fi kelas sedang diperbaiki, Budi membagikan koneksi paket data internet dari smartphone miliknya agar laptop teman sebangkunya bisa mengakses tugas online. Fitur berbagi koneksi internet dari ponsel ini disebut...',
    ['Tethering (Hotspot Portabel)', 'Airplane Mode (Mode Pesawat)', 'Formatting Memori', 'Defragmentasi Disk'],
    'A',
    'Tethering mengubah smartphone menjadi titik akses (Mobile Hotspot) untuk membagikan koneksi internet ke perangkat lain.',
  ],
  [
    5, 7, 'C2 - Memahami',
    'Teknologi komunikasi nirkabel jarak pendek (sekitar 1–10 meter) yang hemat daya dan sering digunakan untuk menghubungkan headset nirkabel atau mengirim file antar-smartphone adalah...',
    ['Bluetooth', 'Serat Optik Bawah Laut', 'Satelit Geostasioner', 'Kabel Listrik Tegangan Tinggi'],
    'A',
    'Bluetooth adalah protokol komunikasi nirkabel jarak pendek untuk perangkat personal (PAN).',
  ],
  [
    5, 8, 'C1 - Mengingat',
    'Satuan yang digunakan untuk mengukur kecepatan transfer data pada jaringan internet (banyaknya bit data yang dikirimkan setiap detik) adalah...',
    ['bps (bit per second) / Mbps', 'Kilogram per meter', 'Derajat Celcius', 'Putaran per menit (RPM)'],
    'A',
    'Kecepatan internet diukur dalam satuan bit per second (bps), Kbps, Mbps, atau Gbps.',
  ],
  [
    5, 9, 'C2 - Memahami',
    'Proses mengambil atau menyimpan file materi pelajaran dari server di internet ke dalam penyimpanan komputer atau ponsel kita sendiri disebut...',
    ['Download (Mengunduh)', 'Upload (Mengunggah)', 'Delete (Menghapus)', 'Restart (Memulai Ulang)'],
    'A',
    'Download (mengunduh) adalah proses menerima data dari internet ke perangkat lokal.',
  ],
  [
    5, 10, 'C2 - Memahami',
    'Sebaliknya, proses mengirimkan file tugas dari dalam laptop siswa menuju server penyimpanan daring (cloud/classroom) agar dapat diperiksa oleh guru disebut...',
    ['Upload (Mengunggah)', 'Download (Mengunduh)', 'Offline Mode', 'Shutdown'],
    'A',
    'Upload (mengunggah) adalah proses mengirim data dari perangkat lokal menuju server di internet.',
  ],
  [
    5, 11, 'C2 - Memahami',
    'Dalam keamanan jaringan komputer, teknik mengubah pesan asli menjadi kode acak/rahasia agar tidak dapat dibaca oleh penyadap selama dikirim melalui jaringan disebut...',
    ['Enkripsi (Encryption)', 'Kompresi (Compression)', 'Duplikasi (Duplication)', 'Translasi Bahasa'],
    'A',
    'Enkripsi menyandikan data asli menjadi kode rahasia demi menjaga kerahasiaan informasi saat transmisi data.',
  ],
  [
    5, 12, 'C1 - Mengingat',
    'Dalam istilah kriptografi dasar, teks atau pesan asli sebelum disandikan disebut Plaintext, sedangkan teks yang sudah berhasil disandikan disebut...',
    ['Ciphertext', 'Hypertext', 'Subtext', 'Context'],
    'A',
    'Plaintext adalah pesan asli yang dapat dibaca langsung, sedangkan Ciphertext adalah pesan yang telah dienkripsi.',
  ],
  [
    5, 13, 'C2 - Memahami',
    'Proses mengembalikan teks sandi (Ciphertext) kembali menjadi pesan asli (Plaintext) menggunakan kunci yang sesuai disebut...',
    ['Dekripsi (Decryption)', 'Enkripsi (Encryption)', 'Instalasi (Installation)', 'kompilasi (Compilation)'],
    'A',
    'Dekripsi adalah kebalikan dari enkripsi, yaitu menerjemahkan kembali Ciphertext menjadi Plaintext.',
  ],
  [
    5, 14, 'C3 - Menerapkan',
    'menggunakan metode Caesar Cipher dengan kunci geser +3 ke kanan (A->D, B->E, C->F, dst.), apakah hasil enkripsi dari kata "DATA"?',
    ['GDWD', 'EBUB', 'FCFC', 'HEHE'],
    'A',
    'Geser tiap huruf "DATA" maju 3 langkah alfabet: D->G, A->D, T->W, A->D. Hasilnya adalah "GDWD".',
  ],
  [
    5, 15, 'C4 - Menganalisis',
    'Kamu menerima pesan sandi Ciphertext "KROA" yang dienkripsi menggunakan Caesar Cipher geser +3 ke kanan (A->D). Jika kamu mendekripsi pesan tersebut (geser mundur 3 huruf ke kiri), kata aslinya (Plaintext) adalah...',
    ['HOLA', 'KOTA', 'BOLA', 'PENA'],
    'A',
    'Geser mundur 3 huruf: K->H, R->O, O->L, A->X (atau jika sandi "KROD" -> HOLA). Untuk K->H, R->O, O->L, D->A menjadi HOLA.',
  ],
  [
    5, 16, 'C2 - Memahami',
    'Ketika kamu mengunjungi situs web ujian sekolah, pada bilah alamat browser tampak ikon Gembok Tertutup dan awalan protokol "https://". Huruf "S" pada akhir HTTPS menunjukkan bahwa...',
    ['Secure (Koneksi terenkripsi aman)', 'Slow (Koneksi berjalan lambat)', 'Simple (Halaman web sederhana)', 'Server (Halaman tanpa browser)'],
    'A',
    'HTTPS (Hypertext Transfer Protocol Secure) mengenkripsi komunikasi data antara browser pengguna dan server web.',
  ],
  [
    5, 17, 'C3 - Menerapkan',
    'Saat mengaktifkan fitur Hotspot (Tethering) di smartphone, mengapa kita wajib mengatur kata sandi (Password WPA2/WPA3) pada jaringan Hotspot tersebut?',
    ['Mencegah akses ilegal dan kuota habis', 'Agar baterai ponsel tidak pernah habis', 'Mengubah layar ponsel jadi hitam putih', 'Mengunci layar sentuh secara permanen'],
    'A',
    'Pengamanan password WPA2/WPA3 pada Hotspot mencegah akses ilegal dari perangkat asing.',
  ],
  [
    5, 18, 'C1 - Mengingat',
    'Perusahaan penyedia layanan sambungan internet kepada pengguna rumah maupun sekolah (seperti Telkom Indihome, Biznet, atau operator seluler) disebut...',
    ['ISP (Internet Service Provider)', 'CPU (Central Processing Unit)', 'GUI (Graphical User Interface)', 'PDF (Portable Document Format)'],
    'A',
    'ISP (Internet Service Provider) adalah penyelenggara jasa layanan akses internet.',
  ],
  [
    5, 19, 'C3 - Menerapkan',
    'Jika kecepatan unduh internet di Lab MTsN 14 tercatat stabil sebesar 10 Megabyte per detik (10 MB/s), berapa waktu yang dibutuhkan untuk mengunduh sebuah file modul video berukuran 150 MB?',
    ['15 detik', '150 detik', '5 detik', '60 detik'],
    'A',
    'Waktu unduh = Ukuran File ÷ Kecepatan = 150 MB ÷ 10 MB/detik = 15 detik.',
  ],
  [
    5, 20, 'C4 - Menganalisis',
    'Sebuah sandi substitusi membalik urutan huruf alfabet (A=Z, B=Y, C=X, ..., I=R, S=H, T=G). Jika kamu menyandikan kata "IT" dengan aturan tersebut, hasilnya adalah...',
    ['RG', 'SH', 'AZ', 'BY'],
    'A',
    'Sesuai aturan cermin alfabet (Atbash Cipher): huruf I berpasangan dengan R, dan huruf T berpasangan dengan G, sehingga "IT" menjadi "RG".',
  ],

  // ===========================================================================
  // BAB 6 KELAS 7: ANALISIS DATA (20 SOAL)
  // ===========================================================================
  [
    6, 1, 'C3 - Menerapkan',
    'Pada papan skor turnamen Roblox MTsN 14 di lembar kerja Excel, skor 5 siswa tercatat di sel C2 sampai C6. Jika kamu ingin menampilkan nilai skor TERTINGGI dan TOTAL jumlah seluruh skor secara berurutan, rumus yang harus diketik adalah...',
    ['=MIN(C2:C6) dan =AVERAGE(C2:C6)', '=MAX(C2:C6) dan =SUM(C2:C6)', '=COUNT(C2:C6) dan =MAX(C2:C6)', '=AVERAGE(C2:C6) dan =MIN(C2:C6)'],
    'B',
    '=MAX(range) mencari nilai paling tinggi, sedangkan =SUM(range) menjumlahkan seluruh angka pada rentang sel tersebut.',
  ],
  [
    6, 2, 'C1 - Mengingat',
    'Program aplikasi pengolah angka/lembar kerja (Spreadsheet) yang berbentuk tabel baris dan kolom untuk mengolah serta menganalisis data adalah...',
    ['Microsoft Excel / Google Sheets', 'Microsoft Paint / CorelDraw', 'Windows Media Player', 'Notepad / WordPad'],
    'A',
    'Microsoft Excel, Google Sheets, dan LibreOffice Calc adalah contoh perangkat lunak pengolah lembar kerja (Spreadsheet).',
  ],
  [
    6, 3, 'C1 - Mengingat',
    'Pertemuan antara satu Kolom (huruf A, B, C, dst.) dan satu Baris (angka 1, 2, 3, dst.) pada lembar kerja spreadsheet, misalnya kotak D5, disebut...',
    ['Sel (Cell)', 'Slide', 'Paragraf', 'Folder'],
    'A',
    'Cell (Sel) adalah kotak perpotongan antara kolom dan baris yang diidentifikasi oleh alamat kolom dan nomor barisnya.',
  ],
  [
    6, 4, 'C2 - Memahami',
    'Pada alamat sel "F12", huruf "F" dan angka "12" secara berturut-turut menunjukkan...',
    ['Kolom F dan Baris ke-12', 'Baris F dan Kolom ke-12', 'Halaman F dan Paragraf ke-12', 'Folder F dan File ke-12'],
    'A',
    'Dalam spreadsheet, huruf selalu melambangkan Kolom (vertikal) dan angka melambangkan Baris (horizontal).',
  ],
  [
    6, 5, 'C2 - Memahami',
    'Kumpulan dari beberapa sel yang bersebelahan pada lembar kerja, misalnya dari sel B2 sampai sel B15 yang ditulis "B2:B15", disebut...',
    ['Rentang Sel (Range)', 'Worksheet Tunggal', 'Toolbar Utama', 'Title Bar'],
    'A',
    'Range adalah sekumpulan sel dari titik awal hingga titik akhir yang dipisahkan tanda titik dua (:).',
  ],
  [
    6, 6, 'C1 - Mengingat',
    'Setiap penulisan rumus (formula) atau fungsi matematika pada aplikasi Microsoft Excel maupun Google Sheets WAJIB diawali dengan tanda...',
    ['Sama dengan (=)', 'Tanda tanya (?)', 'Tanda seru (!)', 'Titik koma (;)'],
    'A',
    'Tanda sama dengan (=) memberitahu program spreadsheet bahwa teks yang diketik adalah rumus perhitungan, bukan teks biasa.',
  ],
  [
    6, 7, 'C2 - Memahami',
    'Dalam penulisan rumus operasi matematika di lembar kerja Excel, simbol untuk operasi PERKALIAN dan PEMBAGIAN secara berturut-turut adalah...',
    ['Tanda bintang (*) dan garis miring (/)', 'Huruf x dan titik dua (:)', 'Tanda tambah (+) dan kurang (-)', 'Tanda persen (%) dan pangkat (^)'],
    'A',
    'Spreadsheet menggunakan simbol * (asterisk) untuk perkalian dan / (slash) untuk pembagian.',
  ],
  [
    6, 8, 'C3 - Menerapkan',
    'Jika sel A1 berisi angka 10 dan sel B1 berisi angka 4, maka hasil dari rumus "=A1 + B1 * 2" adalah...',
    ['18', '28', '16', '24'],
    'A',
    'Sesuai prioritas operasi matematika, perkalian dihitung lebih dulu: 4 * 2 = 8, kemudian ditambah 10 = 18.',
  ],
  [
    6, 9, 'C2 - Memahami',
    'Fungsi statistik dasar pada spreadsheet yang digunakan untuk menghitung NILAI RATA-RATA dari sekumpulan angka pada rentang sel adalah...',
    ['=AVERAGE(...)', '=SUM(...)', '=COUNT(...)', '=MIN(...)'],
    'A',
    'Fungsi =AVERAGE(range) menjumlahkan seluruh data lalu membaginya dengan banyaknya data untuk memperoleh nilai rata-rata.',
  ],
  [
    6, 10, 'C2 - Memahami',
    'Untuk mencari nilai skor PALING RENDAH (terkecil) dari daftar nilai ujian siswa di rentang sel D2:D30, fungsi yang digunakan adalah...',
    ['=MIN(D2:D30)', '=MAX(D2:D30)', '=SUM(D2:D30)', '=COUNTA(D2:D30)'],
    'A',
    'Fungsi =MIN(range) menghasilkan nilai minimum (terkecil) dari sekumpulan angka.',
  ],
  [
    6, 11, 'C2 - Memahami',
    'Fungsi "=COUNT(B2:B20)" pada aplikasi pengolah angka berfungsi untuk...',
    ['Menghitung jumlah sel berisi angka', 'Menjumlahkan seluruh nilai angka', 'Mengurutkan data abjad A ke Z', 'Menghapus isi sel yang kosong'],
    'A',
    '=COUNT(range) menghitung jumlah sel yang memuat nilai numerik (angka) di dalam suatu rentang.',
  ],
  [
    6, 12, 'C3 - Menerapkan',
    'Saat menyalin rumus ke baris di bawahnya, kita ingin agar acuan sel diskon di C1 TIDAK BERUBAH (terkunci). Penulisan alamat sel absolut yang benar adalah...',
    ['$C$1', 'C1', '#C#1', '@C@1'],
    'A',
    'Tanda dolar ($) pada kolom dan baris ($C$1) mengunci alamat sel secara absolut agar tidak bergeser saat rumus disalin.',
  ],
  [
    6, 13, 'C2 - Memahami',
    'Fitur pada aplikasi lembar kerja yang digunakan untuk mengurutkan data tabel (misalnya mengurutkan nama siswa sesuai abjad A ke Z, atau mengurutkan skor dari tertinggi ke terendah) disebut...',
    ['Sorting (Pengurutan)', 'Filtering (Penyaringan)', 'Merging (Penggabungan)', 'Freezing (Pembekuan)'],
    'A',
    'Sorting mengatur urutan baris data secara Ascending (A–Z / Kecil–Besar) maupun Descending (Z–A / Besar–Kecil).',
  ],
  [
    6, 14, 'C2 - Memahami',
    'Jika seorang guru ingin mengurutkan peringkat siswa dari pemenang nilai TERTINGGI di baris paling atas hingga nilai terendah di bawah, maka jenis pengurutan yang dipilih adalah...',
    ['Descending (Terbesar ke Terkecil)', 'Ascending (Terkecil ke Terbesar)', 'Random (Urutan Acak)', 'Horizontal (Mendatar)'],
    'A',
    'Pengurutan Descending menyusun data dari nilai terbesar ke nilai terkecil (atau Z ke A).',
  ],
  [
    6, 15, 'C3 - Menerapkan',
    'Pada tabel data 200 siswa MTsN 14, Pak Azhary ingin menampilkan HANYA baris data siswa yang berasal dari "Kelas 7A" saja dan menyembunyikan sementara kelas lainnya. Fitur yang tepat digunakan adalah...',
    ['Filter (Penyaringan Data)', 'Delete Sheet (Hapus Lembar)', 'Format Painter', 'Word Wrap'],
    'A',
    'Fitur Filter menyaring tampilan tabel sehingga hanya baris yang memenuhi kriteria tertentu yang ditampilkan.',
  ],
  [
    6, 16, 'C3 - Menerapkan',
    'Agar angka 50000 pada tabel kas kelas tampil rapi sebagai format mata uang "Rp50.000", pengaturan Format Number yang dipilih pada sel tersebut adalah...',
    ['Currency / Accounting', 'Percentage', 'Date / Tanggal', 'Scientific'],
    'A',
    'Format Currency atau Accounting menambahkan simbol mata uang (Rp) dan pemisah ribuan secara otomatis.',
  ],
  [
    6, 17, 'C3 - Menerapkan',
    'Untuk menggabungkan beberapa sel menjadi satu sel lebar saat membuat judul tabel di bagian paling atas lembar kerja, fitur yang digunakan adalah...',
    ['Merge & Center', 'Sort & Filter', 'Find & Replace', 'Wrap Text'],
    'A',
    'Merge & Center menggabungkan beberapa sel yang dipilih menjadi satu sel besar dan menengahkan teksnya.',
  ],
  [
    6, 18, 'C4 - Menganalisis',
    'Pada sebuah sel Excel muncul pesan kesalahan "#DIV/0!". Penyebab munculnya pesan kesalahan tersebut adalah...',
    ['Pembagian angka dengan nol (0)', 'Lebar kolom terlalu sempit', 'Penulisan nama fungsi salah ketik', 'Komputer belum terhubung printer'],
    'A',
    'Pesan #DIV/0! (Division by Zero) muncul ketika pembagi dalam rumus bernilai 0 atau merujuk ke sel kosong.',
  ],
  [
    6, 19, 'C4 - Menganalisis',
    'Jika sebuah sel menampilkan deretan tanda pagar "######" setelah kita mengetikkan angka jutaan, tindakan yang tepat untuk memperbaikinya adalah...',
    ['Melebarkan ukuran kolom sel tersebut', 'Menghapus seluruh isi tabel data', 'Mematikan layar monitor komputer', 'Mengubah format angka jadi teks'],
    'A',
    'Tanda ###### pada sel angka menandakan lebar kolom kurang lebar untuk menampilkan isi sel secara utuh.',
  ],
  [
    6, 20, 'C3 - Menerapkan',
    'Nilai ulangan harian Informatika Rina pada 4 bab pertama adalah: 80, 90, 70, dan 100. Jika dihitung dengan rumus =AVERAGE(), berapakah nilai rata-rata Rina?',
    ['85', '80', '90', '75'],
    'A',
    'Rata-rata = (80 + 90 + 70 + 100) ÷ 4 = 340 ÷ 4 = 85.',
  ],

  // ===========================================================================
  // BAB 7 KELAS 7: ALGORITMA DAN PEMROGRAMAN (20 SOAL)
  // ===========================================================================
  [
    7, 1, 'C4 - Menganalisis',
    'Sebuah robot penjaga di halaman MTsN 14 diprogram menggunakan blok visual: [Ulangi 4 kali (Repeat 4): Maju 10 langkah -> Belok Kanan 90 derajat]. Jika robot mulai berjalan dari titik tengah lapangan hijau, lintasan yang terbentuk berbentuk...',
    ['Persegi (Bujur Sangkar)', 'Garis Lurus Panjang', 'Segitiga Sama Sisi', 'Lingkaran Penuh'],
    'A',
    'Maju dengan jarak yang sama lalu berbelok 90 derajat sebanyak 4 kali (4 × 90° = 360°) akan membentuk bangun datar Persegi.',
  ],
  [
    7, 2, 'C1 - Mengingat',
    'Lingkungan pemrograman visual berbasis susunan blok warna-warni (drag-and-drop) yang dikembangkan untuk belajar logika koding membuat animasi dan game di Kelas 7 adalah...',
    ['Scratch / Blockly', 'Microsoft Excel', 'Adobe Photoshop', 'Windows Explorer'],
    'A',
    'Scratch dan Blockly adalah bahasa pemrograman visual yang menyusun instruksi kode menggunakan potongan blok.',
  ],
  [
    7, 3, 'C1 - Mengingat',
    'Dalam aplikasi pemrograman visual Scratch, objek karakter (seperti kucing, siswa 3D, atau bola) yang dapat diberi skrip perintah untuk bergerak dan berinteraksi disebut...',
    ['Sprite', 'Backdrop', 'Folder', 'Browser'],
    'A',
    'Sprite adalah objek atau karakter di dalam panggung Scratch yang menjalankan blok-blok kode program.',
  ],
  [
    7, 4, 'C1 - Mengingat',
    'Area latar belakang panggung tempat Sprite bergerak dan menampilkan animasi atau permainan pada aplikasi Scratch disebut...',
    ['Stage / Backdrop', 'Recycle Bin', 'Control Panel', 'Taskbar'],
    'A',
    'Stage adalah area panggung utama, sedangkan gambar latar belakangnya disebut Backdrop.',
  ],
  [
    7, 5, 'C2 - Memahami',
    'Blok perintah "When Green Flag Clicked" (Ketika Bendera Hijau Diklik) pada Scratch berfungsi sebagai pemicu dimulainya program dan berada pada kategori kelompok blok...',
    ['Events (Kejadian)', 'Motion (Gerakan)', 'Looks (Tampilan)', 'Sound (Suara)'],
    'A',
    'Kategori Events berisi blok pemicu (trigger) yang menjalankan skrip saat suatu kejadian terjadi, seperti klik bendera hijau atau tekan tombol spasi.',
  ],
  [
    7, 6, 'C2 - Memahami',
    'Blok perintah "Move 10 steps" (Bergerak 10 langkah), "Turn 15 degrees" (Berputar 15 derajat), dan "Go to x: 0 y: 0" termasuk ke dalam kategori blok...',
    ['Motion (Gerakan)', 'Variables (Variabel)', 'Operators (Operator)', 'My Blocks'],
    'A',
    'Kategori Motion (berwarna biru) mengatur pergerakan, arah hadap, dan perpindahan koordinat Sprite di panggung.',
  ],
  [
    7, 7, 'C2 - Memahami',
    'Jika kamu ingin membuat karakter Sprite menampilkan balon percakapan bertuliskan "Selamat Datang di MTsN 14!" selama 2 detik, blok yang digunakan berada pada kategori...',
    ['Looks -> "Say ... for 2 seconds"', 'Sound -> "Play sound until done"', 'Sensing -> "Touching color"', 'Motion -> "Glide 1 secs to x y"'],
    'A',
    'Blok "Say [teks] for [X] seconds" pada kategori Looks menampilkan balon teks di atas karakter Sprite.',
  ],
  [
    7, 8, 'C3 - Menerapkan',
    'Pada bidang koordinat panggung (Stage) Scratch, titik pusat tengah layar memiliki koordinat (x: 0, y: 0). Jika Sprite berada di (0, 0) lalu menjalankan blok "Change x by -50", maka Sprite akan berpindah ke arah...',
    ['Kiri sejauh 50 satuan', 'Kanan sejauh 50 satuan', 'Atas sejauh 50 satuan', 'Bawah sejauh 50 satuan'],
    'A',
    'Sumbu X mendatar: nilai positif menggeser ke kanan, sedangkan nilai negatif (-50) menggeser Sprite ke arah kiri.',
  ],
  [
    7, 9, 'C3 - Menerapkan',
    'Sebaliknya, jika Sprite berada di koordinat (x: 0, y: 0) lalu menjalankan blok "Change y by 40", maka Sprite akan bergerak ke arah...',
    ['Atas sejauh 40 satuan', 'Bawah sejauh 40 satuan', 'Kiri sejauh 40 satuan', 'Kanan sejauh 40 satuan'],
    'A',
    'Sumbu Y vertikal: nilai positif (+40) menggerakkan Sprite ke atas, sedangkan nilai negatif menggerakkan ke bawah.',
  ],
  [
    7, 10, 'C2 - Memahami',
    'Struktur kontrol perulangan pada Scratch yang berfungsi menjalankan blok-blok di dalamnya secara terus-menerus tanpa henti selama program masih berjalan adalah...',
    ['Forever (Selamanya)', 'Repeat 10 (Ulangi 10 kali)', 'Wait 1 seconds (Tunggu 1 detik)', 'Stop All (Hentikan Semua)'],
    'A',
    'Blok Forever adalah perulangan tak terbatas (infinite loop) yang terus mengeksekusi instruksi di dalamnya hingga program dihentikan.',
  ],
  [
    7, 11, 'C2 - Memahami',
    'Struktur percabangan "If <kondisi> Then ... Else ..." pada pemrograman digunakan ketika...',
    ['Memilih aksi berdasarkan kondisi Benar/Salah', 'Memutar musik pembuka satu kali saja', 'Menghapus gambar latar belakang panggung', 'Mematikan perangkat komputer otomatis'],
    'A',
    'Percabangan If-Then-Else mengeksekusi blok pertama saat syarat terpenuhi (True) dan blok alternatif (Else) saat syarat tidak terpenuhi (False).',
  ],
  [
    7, 12, 'C3 - Menerapkan',
    'Dalam membuat game tangkap apel di Scratch, kita ingin mendeteksi apakah Sprite Keranjang menyentuh Sprite Apel. Blok pendeteksi "Touching [Apel]?" terdapat pada kategori...',
    ['Sensing (Sensor)', 'Motion (Gerakan)', 'Looks (Tampilan)', 'Sound (Suara)'],
    'A',
    'Kategori Sensing (berwarna biru muda) berisi blok sensor pendeteksi sentuhan objek, warna, posisi mouse, dan tombol keyboard.',
  ],
  [
    7, 13, 'C2 - Memahami',
    'Untuk menyimpan nilai "Skor" pemain yang dapat bertambah setiap kali pemain berhasil menjawab soal dengan benar di dalam game, fitur yang harus kita buat pada pemrograman adalah...',
    ['Variable (Variabel)', 'Backdrop (Latar Belakang)', 'Costume (Kostum)', 'Sound Effect'],
    'A',
    'Variabel adalah wadah penampung nilai data (seperti Skor, Nyawa, atau Waktu) yang nilainya dapat berubah selama program berjalan.',
  ],
  [
    7, 14, 'C4 - Menganalisis',
    'Perhatikan susunan blok berikut: [Set Skor to 0] -> [Repeat 5: (Change Skor by 3)]. Berapakah nilai variabel Skor setelah blok tersebut selesai dijalankan?',
    ['15', '8', '5', '30'],
    'A',
    'Skor awal 0, kemudian ditambah 3 sebanyak 5 kali berulang: 0 + (5 × 3) = 15.',
  ],
  [
    7, 15, 'C3 - Menerapkan',
    'Agar karakter Sprite tampak seolah-olah sedang melangkah berjalan saat berpindah tempat, blok pada kategori Looks yang digunakan secara bergantian di dalam perulangan adalah...',
    ['Next Costume (Kostum Berikutnya)', 'Hide (Sembunyikan Objek)', 'Clear Graphic Effects', 'Go to Back Layer'],
    'A',
    'Mengganti gambar kostum karakter secara berurutan menggunakan "Next Costume" menciptakan efek ilusi animasi gerakan berjalan.',
  ],
  [
    7, 16, 'C4 - Menganalisis',
    'Seorang siswa memprogram Sprite agar ketika menyentuh dinding warna merah, Sprite langsung kembali ke titik awal (-180, 0). Susunan logika blok yang tepat adalah...',
    ['Forever -> If <Touching Merah?> -> Go to (-180, 0)', 'Say "Halo" -> Move 10 steps -> Stop All', 'Change volume by 10 -> Next Backdrop', 'Repeat 2 -> Turn 90 degrees -> Hide'],
    'A',
    'Pengecekan sensor sentuhan warna harus berada di dalam loop Forever dan blok percabangan If-Then agar terus memantau posisi Sprite.',
  ],
  [
    7, 17, 'C2 - Memahami',
    'Ketika program yang kita buat tidak berjalan sesuai harapan (misalnya skor justru berkurang saat jawaban benar), kesalahan pada kode atau logika program tersebut dinamakan...',
    ['Bug', 'Fitur Utama', 'Hardware', 'Resolusi Layar'],
    'A',
    'Dalam dunia pemrograman, kesalahan atau cacat logika pada kode program disebut Bug.',
  ],
  [
    7, 18, 'C2 - Memahami',
    'Proses mencari, melacak, dan memperbaiki kesalahan (bug) pada susunan kode program agar program berjalan dengan benar disebut...',
    ['Debugging', 'Uploading', 'Browsing', 'Formatting'],
    'A',
    'Debugging adalah kegiatan menemukan penyebab bug dan memperbaiki logika program hingga berjalan sesuai spesifikasi.',
  ],
  [
    7, 19, 'C3 - Menerapkan',
    'Dalam Scratch, jika kita ingin Sprite ke-1 mengirimkan sinyal pesan tersembunyi kepada Sprite ke-2 agar Sprite ke-2 mulai muncul di layar, pasangan blok Events yang digunakan adalah...',
    ['"Broadcast" dan "When I receive"', '"Move 10 steps" dan "Turn 15 degrees"', '"Show" dan "Hide" tanpa pemicu', '"Play sound" dan "Stop all sounds"'],
    'A',
    'Fitur Broadcast mengirim pesan sinyal antar-Sprite, dan Sprite penerima merespons melalui blok "When I receive [pesan]".',
  ],
  [
    7, 20, 'C4 - Menganalisis',
    'Untuk menggambar bangun Segitiga Sama Sisi menggunakan ekstensi Pen (Pena) di Scratch, berapakah jumlah perulangan (Repeat) dan besar sudut putar luar yang harus diatur?',
    ['Repeat 3 kali, putar 120 derajat', 'Repeat 4 kali, putar 90 derajat', 'Repeat 3 kali, putar 45 derajat', 'Repeat 6 kali, putar 60 derajat'],
    'A',
    'Bangun tertutup memerlukan total putaran luar 360°. Untuk segitiga (3 sisi), sudut putar luarnya adalah 360° ÷ 3 = 120°.',
  ],

  // ===========================================================================
  // BAB 8 KELAS 7: DAMPAK SOSIAL INFORMATIKA (20 SOAL)
  // ===========================================================================
  [
    8, 1, 'C5 - Mengevaluasi',
    'Saat bermain di fitur Chat Global Arena MTsN 14, ada akun tidak dikenal yang menjanjikan hadiah 10.000 Poin Misi gratis asalkan kamu menyebutkan kata sandi email dan nomor telepon pribadimu di kolom chat. Sikap yang paling tepat adalah...',
    ['Menolak karena data pribadi rahasia', 'Mengirim kata sandi di kolom chat', 'Meminjam akun email teman sebangku', 'Membalas dengan kata-kata kasar'],
    'A',
    'Kata sandi, kode OTP, dan nomor kontak pribadi merupakan data rahasia yang tidak boleh pernah dibagikan kepada siapa pun.',
  ],
  [
    8, 2, 'C2 - Memahami',
    'Salah satu dampak POSITIF perkembangan Teknologi Informasi dan Komunikasi di bidang pendidikan madrasah adalah...',
    ['Kemudahan akses e-learning dan CBT', 'Bermain game sepanjang malam', 'Penyebaran berita bohong di grup', 'Kelelahan mata akibat layar dekat'],
    'A',
    'Kemudahan akses e-learning, perpustakaan digital, dan ujian CBT yang efisien merupakan dampak positif TIK di dunia pendidikan.',
  ],
  [
    8, 3, 'C2 - Memahami',
    'Kegiatan jual beli barang atau jasa yang dilakukan secara daring melalui aplikasi pasar digital (Marketplace) di internet disebut...',
    ['E-Commerce (Perdagangan Elektronik)', 'E-Gamelan Nusantara', 'Hardware Maintenance', 'Offline Barter'],
    'A',
    'E-Commerce adalah transaksi perdagangan barang dan jasa melalui jaringan elektronik/internet.',
  ],
  [
    8, 4, 'C2 - Memahami',
    'Pemanfaatan teknologi informasi oleh instansi pemerintah untuk melayani masyarakat secara daring (seperti pembuatan dokumen kependudukan atau informasi publik) disebut...',
    ['E-Government', 'E-Sport', 'Social Media', 'Local Storage'],
    'A',
    'E-Government adalah penyelenggaraan layanan pemerintahan berbasis elektronik untuk meningkatkan efisiensi pelayanan publik.',
  ],
  [
    8, 5, 'C3 - Menerapkan',
    'Manakah dari informasi di bawah ini yang termasuk DATA PRIBADI RAHASIA dan sangat berbahaya jika diunggah secara terbuka ke media sosial publik?',
    ['NIK, alamat rumah, dan kode PIN/OTP', 'Judul buku pelajaran Informatika', 'Nama madrasah saat ikut lomba', 'Hobi olahraga bulu tangkis'],
    'A',
    'Alamat detail rumah, nomor identitas resmi, serta kode PIN/OTP adalah data sensitif yang dapat disalahgunakan untuk kejahatan siber.',
  ],
  [
    8, 6, 'C2 - Memahami',
    'Jejak rekam data yang tertinggal di internet akibat aktivitas kita (seperti komentar yang pernah ditulis, foto yang diunggah, dan riwayat situs yang dikunjungi) disebut...',
    ['Jejak Digital (Digital Footprint)', 'Sidik Jari Tinta Kertas', 'Memori Internal RAM', 'Resolusi Piksel Layar'],
    'A',
    'Jejak Digital adalah rekaman aktivitas seseorang di dunia maya yang dapat bertahan lama dan dilihat oleh orang lain.',
  ],
  [
    8, 7, 'C3 - Menerapkan',
    'Manakah contoh pembuatan kata sandi (Password) akun belajar yang PALING KUAT dan sulit ditebak oleh peretas?',
    ['MtsN14#Halim2026!', '12345678', 'password123', '20122012'],
    'A',
    'Kata sandi yang kuat minimal 8 karakter dengan perpaduan huruf kapital, huruf kecil, angka, dan karakter simbol unik.',
  ],
  [
    8, 8, 'C2 - Memahami',
    'Fitur keamanan tambahan pada akun digital yang meminta kode verifikasi sekali pakai (OTP) melalui SMS atau aplikasi autentikator selain mengetikkan password disebut...',
    ['Two-Factor Authentication (2FA)', 'Auto-Login Tanpa Sandi', 'Screen Saver Otomatis', 'Format Partisi Disk'],
    'A',
    'Autentikasi Dua Faktor (2FA) memberikan lapisan perlindungan ganda sehingga akun tetap aman meski password diketahui orang lain.',
  ],
  [
    8, 9, 'C3 - Menerapkan',
    'Setelah selesai mengerjakan tugas menggunakan akun email pribadi di komputer bersama milik Lab Komputer sekolah, tindakan wajib sebelum meninggalkan kursi adalah...',
    ['Log Out (Sign Out) dari akun email', 'Membiarkan akun tetap terbuka', 'Mencabut kabel mouse komputer', 'Menyimpan sandi di browser umum'],
    'A',
    'Selalu lakukan Log Out/Sign Out dan jangan menyimpan sandi pada perangkat publik atau komputer bersama.',
  ],
  [
    8, 10, 'C2 - Memahami',
    'Aturan sopan santun dan tata krama dalam berkomunikasi serta berinteraksi dengan orang lain di dunia maya/internet dikenal dengan istilah...',
    ['Netiket (Etika Berinternet)', 'Protokol Hardware', 'Topologi Jaringan', 'Algoritma Pemrograman'],
    'A',
    'Netiket (Network Etiquette) adalah pedoman etika dan kesopanan dalam berinteraksi di ruang digital.',
  ],
  [
    8, 11, 'C4 - Menganalisis',
    'Mengapa mengetik seluruh kalimat pesan dengan HURUF KAPITAL SEMUA (CAPS LOCK) di ruang chat kelas dinilai kurang sopan dalam etika berinternet?',
    ['Memberi kesan berteriak atau marah', 'Membuat kuota internet cepat habis', 'Merusak komponen layar monitor', 'Tidak terbaca oleh perangkat lain'],
    'A',
    'Dalam netiket, menulis pesan dengan huruf kapital seluruhnya memberi kesan membentak atau berteriak kepada lawan bicara.',
  ],
  [
    8, 12, 'C2 - Memahami',
    'Hak eksklusif yang diberikan hukum kepada pencipta karya (seperti pembuat perangkat lunak, penulis buku, musisi, atau ilustrator) atas karya ciptaannya disebut...',
    ['Hak Cipta (Copyright / HAKI)', 'Hak Milik Bebas Bajak', 'Lisensi Perangkat Keras', 'Memori Sekunder Eksternal'],
    'A',
    'Hak Cipta melindungi karya intelektual seseorang agar tidak digandakan atau diakui secara ilegal oleh pihak lain.',
  ],
  [
    8, 13, 'C3 - Menerapkan',
    'Tindakan menyalin penuh tugas karangan teman atau artikel dari internet lalu mengumpulkan atas nama sendiri tanpa menyebutkan sumber aslinya disebut...',
    ['Plagiarisme (Menjiplak Karya)', 'Kolaborasi Kelompok', 'Abstraksi Data', 'Enkripsi Pesan'],
    'A',
    'Plagiarisme adalah pelanggaran etika akademik berupa pengambilan karya orang lain dan mengakuinya sebagai karya sendiri.',
  ],
  [
    8, 14, 'C2 - Memahami',
    'Tindakan mengejek, mempermalukan, mengancam, atau mengintimidasi seseorang secara berulang-ulang menggunakan media sosial atau aplikasi pesan disebut...',
    ['Cyberbullying (Perundungan Siber)', 'Debugging Program', 'Cloud Computing', 'Troubleshooting'],
    'A',
    'Cyberbullying adalah perilaku perundungan di dunia digital yang berdampak buruk bagi psikologis korban.',
  ],
  [
    8, 15, 'C3 - Menerapkan',
    'Agar kesehatan mata dan postur tubuh tetap terjaga saat belajar menggunakan komputer, posisi duduk dan jarak pandang yang ergonomis adalah...',
    ['Duduk tegak, jarak layar 45–70 cm', 'Jarak layar 5 cm di ruang gelap', 'Membungkuk dengan monitor di lantai', 'Menatap layar sambil tiduran miring'],
    'A',
    'Prinsip ergonomi komputer mengatur postur tulang belakang tetap tegak, jarak layar aman (45–70 cm), serta aturan istirahat mata 20-20-20.',
  ],
  [
    8, 16, 'C2 - Memahami',
    'Aturan kesehatan mata "20-20-20" saat bekerja di depan layar komputer artinya adalah...',
    ['Tiap 20 menit, lihat jauh 20 kaki selama 20 detik', 'Bermain game 20 jam di depan 20 monitor', 'Mengetik 20 kata dalam waktu 20 menit', 'Mengganti kacamata setiap 20 hari sekali'],
    'A',
    'Metode 20-20-20 mencegah kelelahan otot mata (digital eye strain) akibat fokus jarak dekat terus-menerus.',
  ],
  [
    8, 17, 'C4 - Menganalisis',
    'Seseorang mengirimkan tautan situs web palsu yang tampilannya sangat mirip halaman login media sosial populer dengan tujuan mencuri username dan password korban. Kejahatan siber ini disebut...',
    ['Phishing', 'Sorting', 'Filtering', 'Rendering'],
    'A',
    'Phishing adalah teknik penipuan siber yang memancing korban memasukkan data kredensial rahasia ke situs palsu.',
  ],
  [
    8, 18, 'C2 - Memahami',
    'Program jahat (seperti Virus, Worm, Trojan, atau Ransomware) yang dirancang untuk merusak sistem komputer atau mencuri data pengguna disebut...',
    ['Malware (Malicious Software)', 'Freeware Edukasi', 'Operating System', 'Spreadsheet'],
    'A',
    'Malware adalah singkatan dari Malicious Software, yaitu perangkat lunak berbahaya yang merugikan pengguna komputer.',
  ],
  [
    8, 19, 'C3 - Menerapkan',
    'Ketika kamu ingin mengunggah foto kegiatan di sekolah yang juga menampilkan wajah teman-temanmu secara dekat ke media sosial pribadi, sikap yang bijak adalah...',
    ['Meminta izin teman terlebih dahulu', 'Mengunggah foto untuk bahan ejekan', 'Menambahkan keterangan berita bohong', 'Menandai akun orang tidak dikenal'],
    'A',
    'Menghormati privasi orang lain dengan meminta izin sebelum mengunggah foto bersama adalah bagian dari etika warga digital.',
  ],
  [
    8, 20, 'C5 - Mengevaluasi',
    'Manakah cara pengelolaan waktu layar (Screen Time) yang paling sehat bagi seorang pelajar MTs?',
    ['Memprioritaskan ibadah, belajar, dan istirahat', 'Bermain ponsel hingga pukul 03.00 pagi', 'Bermain game saat guru menjelaskan', 'Mengabaikan orang tua demi layar HP'],
    'A',
    'Keseimbangan antara aktivitas dunia nyata (ibadah, belajar, sosial, olahraga, istirahat) dan waktu layar mencegah kecanduan gawai.',
  ],

  // ===========================================================================
  // BAB 9 KELAS 7: PRAKTIKA LINTAS BIDANG INFORMATIKA (20 SOAL)
  // ===========================================================================
  [
    9, 1, 'C3 - Menerapkan',
    'Dalam proyek Praktika Lintas Bidang, kelompokmu merangkai alat pengendali game interaktif (seperti Makey Makey) yang menggantikan tombol spasi dengan benda di sekitar kelas. Agar arus sinyal sentuhan tangan dapat mengalir menuju papan sirkuit, benda yang dipilih harus bersifat konduktor, contohnya...',
    ['Sendok logam atau grafit pensil 2B', 'Penggaris plastik dan karet penghapus', 'Potongan kayu kering dan tisu', 'Kain wol kering dan botol kaca'],
    'A',
    'Logam dan karbon grafit pada pensil 2B bersifat konduktor (menghantarkan arus listrik lemah), sehingga dapat menutup rangkaian sentuh.',
  ],
  [
    9, 2, 'C2 - Memahami',
    'Tujuan utama kegiatan "Praktika Lintas Bidang" (PLB) pada pembelajaran Informatika Kelas 7 adalah...',
    ['Berkolaborasi membuat karya solusi lintas bidang', 'Menghafal nama komponen tanpa praktik', 'Bekerja sendiri tanpa diskusi kelompok', 'Membongkar paksa perangkat laboratorium'],
    'A',
    'Praktika Lintas Bidang melatih siswa berkolaborasi membangun artefak komputasional untuk menyelesaikan persoalan nyata lintas disiplin ilmu.',
  ],
  [
    9, 3, 'C2 - Memahami',
    'Karya nyata yang dihasilkan melalui pemanfaatan konsep komputasi dan teknologi informasi (seperti program animasi interaktif, purwarupa alat sensor, atau game edukasi) disebut...',
    ['Artefak Komputasional', 'Fosil Prasejarah', 'Dokumen Kertas Manual', 'Lukisan Cat Minyak'],
    'A',
    'Artefak komputasional adalah objek atau produk digital/fisik yang diciptakan menggunakan proses berpikir komputasional dan komputer.',
  ],
  [
    9, 4, 'C2 - Memahami',
    'Papan sirkuit penemuan interaktif (Invention Kit) yang memungkinkan siswa mengubah benda-benda konduktif sehari-hari (seperti buah pisang, plastisin, atau gambar pensil) menjadi tombol keyboard komputer adalah...',
    ['Makey Makey', 'Harddisk Eksternal', 'Printer Inkjet', 'Router Wi-Fi'],
    'A',
    'Makey Makey adalah papan sirkuit edukasi yang mendeteksi rangkaian tertutup arus lemah untuk menyimulasikan input tombol keyboard/mouse.',
  ],
  [
    9, 5, 'C3 - Menerapkan',
    'Saat menggunakan papan sirkuit Makey Makey, agar ketukan jari kita pada buah pisang dapat terdeteksi sebagai tombol "Spasi", salah satu tangan atau tubuh kita juga harus terhubung ke bagian papan yang bertuliskan...',
    ['EARTH (Ground / Arde)', 'POWER 220V', 'HDMI OUT', 'AUDIO JACK'],
    'A',
    'Agar rangkaian listrik tertutup (closed circuit), pengguna harus terhubung ke jalur EARTH (Ground) saat menyentuh objek input.',
  ],
  [
    9, 6, 'C2 - Memahami',
    'Mengapa buah-buahan segar seperti pisang, apel, atau jeruk dapat menghantarkan sinyal listrik lemah pada percobaan piano buah Makey Makey?',
    ['Mengandung air dan ion elektrolit konduktif', 'Memiliki baterai logam di dalamnya', 'Kulit buah terbuat dari tembaga murni', 'Memancarkan gelombang sinyal Wi-Fi'],
    'A',
    'Kandungan air dan mineral/ion di dalam buah segar memungkinkan aliran arus listrik sangat kecil melewati rangkaian.',
  ],
  [
    9, 7, 'C2 - Memahami',
    'Sebaliknya, bahan seperti karet penghapus, plastik kering, dan kayu kering TIDAK DAPAT mengalirkan arus listrik pada rangkaian. Bahan-bahan tersebut dinamakan...',
    ['Isolator (Insulator)', 'Konduktor', 'Semikonduktor', 'Katalisator'],
    'A',
    'Isolator adalah bahan yang menghambat atau tidak dapat menghantarkan arus listrik.',
  ],
  [
    9, 8, 'C3 - Menerapkan',
    'Kelompok Kelas 7C ingin membuat proyek "Piano Kertas" di mana tuts piano digambar di atas kertas karton lalu dihubungkan dengan klip buaya ke laptop. Jenis alat tulis yang dapat digunakan untuk menebalkan gambar tuts piano agar bersifat konduktif adalah...',
    ['Pensil grafit tebal (2B / 6B)', 'Spidol warna berbahan air kering', 'Krayon lilin (wax crayon)', 'Kapur tulis papan'],
    'A',
    'Isi pensil hitam terbuat dari karbon grafit yang bila digoreskan tebal dan rapat tanpa putus dapat menghantarkan arus listrik.',
  ],
  [
    9, 9, 'C3 - Menerapkan',
    'Dalam proyek kolaborasi membuat game kuis interaktif mata pelajaran IPA menggunakan Scratch, tahapan pertama yang harus dilakukan tim sebelum mulai menyusun blok kode adalah...',
    ['Merancang Storyboard dan membagi tugas', 'Langsung presentasi tanpa membuat proyek', 'Menghapus aplikasi Scratch di komputer', 'Menyalin penuh proyek kelompok lain'],
    'A',
    'Setiap proyek rekayasa perangkat lunak dimulai dari analisis kebutuhan, perancangan desain/storyboard, dan pembagian peran tim.',
  ],
  [
    9, 10, 'C2 - Memahami',
    'Sketsa gambar berurutan dari adegan demi adegan yang menjelaskan bagaimana tampilan layar dan alur interaksi pengguna di dalam proyek animasi/game disebut...',
    ['Storyboard (Papan Cerita)', 'Motherboard', 'Clipboard', 'Keyboard'],
    'A',
    'Storyboard membantu seluruh anggota tim memahami alur visual dari tampilan awal, permainan, hingga tampilan akhir proyek.',
  ],
  [
    9, 11, 'C4 - Menganalisis',
    'Saat menguji coba proyek game edukasi yang dikerjakan bersama, ternyata tombol "Mulai Kuis" tidak merespons ketika diklik. Tahapan dalam siklus proyek untuk memeriksa dan memperbaiki kendala tersebut adalah...',
    ['Tahap Testing dan Debugging', 'Tahap Pembubaran Kelompok', 'Tahap Pencetakan Poster', 'Tahap Pengumpulan Biodata'],
    'A',
    'Tahap Testing & Debugging memastikan seluruh fungsi interaktif berjalan sesuai rencana sebelum proyek dipamerkan.',
  ],
  [
    9, 12, 'C3 - Menerapkan',
    'Jika kelasmu tidak memiliki perangkat fisik Makey Makey, bagaimana cara tetap melaksanakan proyek Praktika Lintas Bidang pembuatan instrumen musik interaktif di komputer?',
    ['Membuat simulator musik virtual di Scratch', 'Membatalkan kegiatan belajar satu semester', 'Membeli piano akustik ke laboratorium', 'Menulis lirik lagu di buku catatan'],
    'A',
    'Proyek PLB dapat diadaptasi menggunakan simulasi event tombol keyboard/klik mouse pada Scratch untuk menghasilkan nada musik.',
  ],
  [
    9, 13, 'C2 - Memahami',
    'Pada aplikasi Scratch, untuk menambahkan blok perintah yang dapat memainkan nada alat musik (seperti Piano, Gitar, atau Drum), kita perlu mengklik tombol "Add Extension" (Tambah Ekstensi) dan memilih...',
    ['Ekstensi Music (Musik)', 'Ekstensi Translate (Terjemahan)', 'Ekstensi Pen (Pena Gambar)', 'Ekstensi Video Sensing'],
    'A',
    'Ekstensi Music di Scratch menyediakan blok "Play note [60] for [0.25] beats" dan pemilihan berbagai instrumen musik.',
  ],
  [
    9, 14, 'C3 - Menerapkan',
    'Dalam pembagian peran proyek kelompok PLB yang terdiri atas 4 orang, tugas seorang "Dokumentator / Penulis Laporan" adalah...',
    ['Mencatat jurnal, laporan, dan infografis', 'Menonton teman bekerja tanpa kontribusi', 'Menyembunyikan kabel alat peraga', 'Bermain sendiri di luar laboratorium'],
    'A',
    'Dokumentator berperan merekam proses pengembangan dari perencanaan, kendala, solusi, hingga penyusunan laporan akhir.',
  ],
  [
    9, 15, 'C4 - Menganalisis',
    'Mengapa pada proyek rangkaian sentuh (seperti Makey Makey) kabel penjepit buaya (alligator clip) antar-tuts tidak boleh saling bersentuhan logamnya?',
    ['Mencegah korsleting sinyal dua nada sekaligus', 'Agar warna kabel tidak mudah luntur', 'Karena logam kabel akan berubah bentuk', 'Supaya layar monitor tampak lebih terang'],
    'A',
    'Jika logam penjepit antar-input bersentuhan, sinyal listrik akan menyatu sehingga memicu input ganda yang salah.',
  ],
  [
    9, 16, 'C3 - Menerapkan',
    'Sebuah kelompok siswa membuat proyek "Tempat Sampah Pintar Virtual" di Scratch yang memberikan poin edukasi jika pemain memasukkan sampah organik dan anorganik ke tong yang tepat. Proyek ini mengintegrasikan Informatika dengan bidang...',
    ['IPA dan Peduli Lingkungan Hidup', 'Sejarah Kerajaan Nusantara', 'Seni Tari Tradisional', 'Olahraga Renang'],
    'A',
    'Proyek pemilahan sampah interaktif merupakan contoh nyata kolaborasi lintas bidang antara Informatika dan IPA/Lingkungan.',
  ],
  [
    9, 17, 'C2 - Memahami',
    'Kegiatan di akhir proyek di mana setiap anggota kelompok menuliskan apa saja hal baru yang telah dipelajari, kesulitan yang berhasil diatasi, dan bagaimana kerja sama tim berlangsung disebut...',
    ['Refleksi Diri dan Evaluasi Tim', 'Instalasi Ulang Sistem Operasi', 'Kompresi File Arsip', 'Enkripsi Data'],
    'A',
    'Refleksi membantu siswa mengevaluasi proses belajar dan meningkatkan kualitas kolaborasi pada proyek berikutnya.',
  ],
  [
    9, 18, 'C4 - Menganalisis',
    'Perhatikan pernyataan berikut: (1) Memastikan kabel USB terhubung ke komputer, (2) Memastikan penjepit buaya menempel pada bahan konduktor, (3) Memastikan pemain memegang kabel Earth/Ground. Jika alat peraga sentuh tidak merespons, langkah pemeriksaan (troubleshooting) yang benar adalah...',
    ['Memeriksa poin (1), (2), dan (3) berurutan', 'Mengganti monitor komputer dengan baru', 'Menghapus sistem operasi Windows', 'Memotong kabel keyboard komputer'],
    'A',
    'Troubleshooting rangkaian Makey Makey meliputi pengecekan koneksi USB, konduktivitas objek, dan koneksi Ground/Earth.',
  ],
  [
    9, 19, 'C3 - Menerapkan',
    'Saat memamerkan karya proyek PLB kepada teman-teman kelas lain (Showcase / Pameran Karya), hal penting yang perlu disiapkan di meja kelompok adalah...',
    ['Perangkat siap uji, panduan, dan infografis', 'Meja kosong tanpa penjelasan apa pun', 'Komputer dalam keadaan mati total', 'Lembar kertas ujian tertutup'],
    'A',
    'Pada pameran karya (Showcase), panduan penggunaan yang jelas dan infografis membantu pengunjung mencoba serta memahami cara kerja karya.',
  ],
  [
    9, 20, 'C5 - Mengevaluasi',
    'Manakah indikator keberhasilan paling utama dari sebuah proyek Praktika Lintas Bidang Informatika di sekolah?',
    ['Karya berfungsi, dipahami tim, dan kolaboratif', 'Alat paling mahal meski tidak berfungsi', 'Hanya dikerjakan oleh 1 anggota saja', 'Tampilan menarik tetapi semua tombol error'],
    'A',
    'Keberhasilan PLB diukur dari fungsionalitas solusi, pemahaman konsep oleh seluruh anggota, dan kualitas kerja sama tim.',
  ],
];

export const QUESTIONS_KELAS_7: InformaticsQuestion[] = RAW_KELAS_7_QUESTIONS.map(
  ([bab, no, cognitiveLevel, question, opts, origCorrect, explanation], idx) => {
    const meta = K7_CATEGORY_MAP[bab];
    const padNo = String(no).padStart(2, '0');
    const keys: OptionKey[] = ['A', 'B', 'C', 'D'];
    const origIdx = Math.max(0, keys.indexOf(origCorrect));
    const targetIdx = (bab * 3 + no * 5 + idx) % 4;
    const rotatedOpts = [...opts] as [string, string, string, string];
    if (origIdx !== targetIdx) {
      const temp = rotatedOpts[targetIdx];
      rotatedOpts[targetIdx] = rotatedOpts[origIdx];
      rotatedOpts[origIdx] = temp;
    }
    const finalCorrectKey = keys[targetIdx];
    const points =
      cognitiveLevel.startsWith('C4') || cognitiveLevel.startsWith('C5')
        ? 175
        : 150;
    return {
      id: `q-k7-bab${bab}-${padNo}`,
      materialId: meta.id,
      category: meta.category,
      gradeLevel: 'Kelas 7',
      cognitiveLevel,
      question: `[Misi Bab ${bab} Kelas 7 · ${meta.zone}] ${question}`,
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
      baselineCohort: buildCohort(finalCorrectKey, idx + 1),
    };
  }
);

