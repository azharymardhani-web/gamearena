import React, { useState } from 'react';
import {
  CognitiveLevel,
  InformaticsMaterial,
  InformaticsQuestion,
  MaterialCategory,
  OptionKey,
} from '../data/informaticsData';
import { BookOpen, Plus, Trash2, X, CheckCircle2, FileText } from 'lucide-react';

interface MaterialManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: InformaticsMaterial[];
  questions: InformaticsQuestion[];
  onSaveMaterial: (material: InformaticsMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  onSaveQuestion: (question: InformaticsQuestion) => void;
  onDeleteQuestion: (id: string) => void;
}

const CATEGORIES: MaterialCategory[] = [
  'Berpikir Komputasional',
  'Sistem Komputer',
  'Jaringan Komputer & Internet',
  'Algoritma & Pemrograman',
  'Analisis Data',
  'Dampak Sosial & Keamanan Siber',
];

const COGNITIVE_LEVELS: CognitiveLevel[] = [
  'C1 - Mengingat',
  'C2 - Memahami',
  'C3 - Menerapkan',
  'C4 - Menganalisis',
  'C5 - Mengevaluasi',
  'C6 - Mencipta',
];

export const MaterialManagerModal: React.FC<MaterialManagerModalProps> = ({
  isOpen,
  onClose,
  materials,
  questions,
  onSaveMaterial,
  onDeleteMaterial,
  onSaveQuestion,
  onDeleteQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'MATERI' | 'SOAL' | 'TAMBAH_MATERI' | 'TAMBAH_SOAL'>(
    'MATERI'
  );

  // Form State for New Material
  const [matTitle, setMatTitle] = useState('');
  const [matCategory, setMatCategory] = useState<MaterialCategory>('Berpikir Komputasional');
  const [matGrade, setMatGrade] = useState<'Kelas 7' | 'Kelas 8' | 'Kelas 9'>('Kelas 8');
  const [matSummary, setMatSummary] = useState('');
  const [matKeyPointsText, setMatKeyPointsText] = useState('');
  const [matFormula, setMatFormula] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form State for New Question
  const [qMaterialId, setQMaterialId] = useState<string>(materials[0]?.id || 'mat-bk-01');
  const [qCategory, setQCategory] = useState<MaterialCategory>('Berpikir Komputasional');
  const [qGrade, setQGrade] = useState<'Kelas 7' | 'Kelas 8' | 'Kelas 9'>('Kelas 8');
  const [qCognitive, setQCognitive] = useState<CognitiveLevel>('C3 - Menerapkan');
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [qCorrect, setQCorrect] = useState<OptionKey>('A');
  const [qExplanation, setQExplanation] = useState('');
  const [qPoints, setQPoints] = useState(150);
  const [qTimeLimit, setQTimeLimit] = useState(25);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !matSummary.trim()) return;

    const points = matKeyPointsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newMat: InformaticsMaterial = {
      id: `mat-${Date.now()}`,
      title: matTitle.trim(),
      category: matCategory,
      gradeLevel: matGrade,
      summary: matSummary.trim(),
      keyPoints:
        points.length > 0
          ? points
          : ['Konsep inti dipelajari melalui simulasi arena dan latihan soal.'],
      formulaOrLogic: matFormula.trim() || 'Input Data -> Proses Komputasi -> Output Informasi',
      author: 'Azhary Mardhani, S.Kom (MTsN 14 Jakarta)',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onSaveMaterial(newMat);
    setMatTitle('');
    setMatSummary('');
    setMatKeyPointsText('');
    setMatFormula('');
    showToast('Modul materi pembelajaran baru berhasil ditambahkan.');
    setActiveTab('MATERI');
  };

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) return;

    const allOptions: OptionKey[] = ['A', 'B', 'C', 'D'];
    const wrongOpts = allOptions.filter((o) => o !== qCorrect);

    const newQ: InformaticsQuestion = {
      id: `q-${Date.now()}`,
      materialId: qMaterialId || materials[0]?.id || 'mat-bk-01',
      category: qCategory,
      gradeLevel: qGrade,
      cognitiveLevel: qCognitive,
      question: qText.trim(),
      options: {
        A: optA.trim(),
        B: optB.trim(),
        C: optC.trim(),
        D: optD.trim(),
      },
      correctAnswer: qCorrect,
      explanation:
        qExplanation.trim() ||
        `Jawaban yang tepat adalah opsi ${qCorrect} sesuai konsep ${qCategory}.`,
      points: Number(qPoints) || 150,
      timeLimitSec: Number(qTimeLimit) || 25,
      baselineCohort: Array.from({ length: 16 }, (_, idx) => {
        const isUpper = idx < 8;
        const isCorrect = isUpper ? idx < 6 : idx < 3;
        return {
          studentId: `cohort-${idx + 1}`,
          studentName: `Siswa MTsN 14 #${idx + 1}`,
          totalScoreRankPercentile: isUpper ? 0.8 : 0.3,
          selectedOption: isCorrect ? qCorrect : wrongOpts[idx % wrongOpts.length],
          isCorrect,
          responseTimeMs: 5200 + idx * 240,
        };
      }),
    };

    onSaveQuestion(newQ);
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setQExplanation('');
    showToast('Butir soal baru berhasil disimpan ke Bank Soal Arena.');
    setActiveTab('SOAL');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain touch-pan-y">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[94dvh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-slate-100 font-display truncate">
              Bank Materi & Butir Soal Informatika
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              Pengampu: Azhary Mardhani, S.Kom · MTs Negeri 14 Jakarta · Kurikulum Merdeka
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Tutup</span>
          </button>
        </div>

        {/* Interactive Segmented Control Bar */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('MATERI')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'MATERI'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daftar Materi ({materials.length})
            </button>
            <button
              onClick={() => setActiveTab('SOAL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'SOAL'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bank Butir Soal ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('TAMBAH_MATERI')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'TAMBAH_MATERI'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Materi
            </button>
            <button
              onClick={() => setActiveTab('TAMBAH_SOAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'TAMBAH_SOAL'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Butir Soal
            </button>
          </div>

          {feedbackMsg && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-3.5 sm:p-6 space-y-5 sm:space-y-6">
          {activeTab === 'MATERI' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {materials.map((mat, index) => (
                <div
                  key={mat.id}
                  className="flex flex-col justify-between p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span>
                        0{index + 1}. {mat.category} · {mat.gradeLevel}
                      </span>
                      <button
                        onClick={() => onDeleteMaterial(mat.id)}
                        title="Hapus Materi"
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 font-display">
                      {mat.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{mat.summary}</p>
                    <ul className="space-y-1.5 pt-1 text-xs text-slate-400">
                      {mat.keyPoints.map((kp, idx) => (
                        <li key={idx} className="leading-relaxed">
                          • {kp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-xs font-mono text-sky-300 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                      {mat.formulaOrLogic}
                    </div>
                    <div className="text-xs text-slate-500">
                      Penyusun: {mat.author} · {mat.createdAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'SOAL' && (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
                    <span>
                      Butir #{idx + 1} · {q.category} · {q.gradeLevel} · {q.cognitiveLevel} · Skor{' '}
                      <span className="font-mono tabular-nums text-sky-400">{q.points}</span> Poin
                    </span>
                    <button
                      onClick={() => onDeleteQuestion(q.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Soal
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
                      const isCorrect = q.correctAnswer === key;
                      return (
                        <div
                          key={key}
                          className={`px-3.5 py-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-700/70 text-emerald-200 font-semibold'
                              : 'bg-slate-900/70 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>
                            {key}. {q.options[key]}
                          </span>
                          {isCorrect && (
                            <span className="text-emerald-400 font-mono text-[11px] shrink-0">
                              [KUNCI]
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-400 pt-1">
                    <span className="font-semibold text-slate-300">Pembahasan:</span>{' '}
                    {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'TAMBAH_MATERI' && (
            <form onSubmit={handleAddMaterialSubmit} className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 pb-1 border-b border-slate-800">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Form Tambah Modul Materi Pembelajaran Informatika</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Judul Materi Pembelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    placeholder="Contoh: Struktur Data Graf & Pohon (Tree)"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Elemen Kurikulum
                    </label>
                    <select
                      value={matCategory}
                      onChange={(e) => setMatCategory(e.target.value as MaterialCategory)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Tingkat Kelas
                    </label>
                    <select
                      value={matGrade}
                      onChange={(e) =>
                        setMatGrade(e.target.value as 'Kelas 7' | 'Kelas 8' | 'Kelas 9')
                      }
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Kelas 7">Kelas 7</option>
                      <option value="Kelas 8">Kelas 8</option>
                      <option value="Kelas 9">Kelas 9</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Ringkasan Konsep Inti (Ditampilkan pada Kartu Materi Sebelum Permainan)
                </label>
                <textarea
                  rows={3}
                  required
                  value={matSummary}
                  onChange={(e) => setMatSummary(e.target.value)}
                  placeholder="Tuliskan penjelasan ringkas materi yang mudah dipahami siswa MTsN 14 Jakarta..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Poin-Poin Penting (Pisahkan dengan baris baru / Enter)
                </label>
                <textarea
                  rows={3}
                  value={matKeyPointsText}
                  onChange={(e) => setMatKeyPointsText(e.target.value)}
                  placeholder={
                    'Simpul (Node) merepresentasikan entitas data\nSisi (Edge) menghubungkan antar simpul'
                  }
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rumus / Notasi Algoritma / Contoh Kode Singkat
                </label>
                <input
                  type="text"
                  value={matFormula}
                  onChange={(e) => setMatFormula(e.target.value)}
                  placeholder="Contoh: Graf G = (V, E) di mana V = Himpunan Titik, E = Himpunan Sisi"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Simpan Materi Pembelajaran
                </button>
              </div>
            </form>
          )}

          {activeTab === 'TAMBAH_SOAL' && (
            <form onSubmit={handleAddQuestionSubmit} className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 pb-1 border-b border-slate-800">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Form Tambah Butir Soal & Kunci Analisis Evaluasi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kategori Materi
                  </label>
                  <select
                    value={qCategory}
                    onChange={(e) => {
                      const cat = e.target.value as MaterialCategory;
                      setQCategory(cat);
                      const matchingMat = materials.find((m) => m.category === cat);
                      if (matchingMat) setQMaterialId(matchingMat.id);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Level Kognitif (Taksonomi Bloom)
                  </label>
                  <select
                    value={qCognitive}
                    onChange={(e) => setQCognitive(e.target.value as CognitiveLevel)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {COGNITIVE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kelas & Skor Poin
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={qGrade}
                      onChange={(e) =>
                        setQGrade(e.target.value as 'Kelas 7' | 'Kelas 8' | 'Kelas 9')
                      }
                      className="w-1/2 px-2 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    >
                      <option value="Kelas 7">Kelas 7</option>
                      <option value="Kelas 8">Kelas 8</option>
                      <option value="Kelas 9">Kelas 9</option>
                    </select>
                    <input
                      type="number"
                      min={50}
                      max={500}
                      step={25}
                      value={qPoints}
                      onChange={(e) => setQPoints(Number(e.target.value))}
                      className="w-1/2 px-2.5 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rumusan Pokok Soal (Stem Pertanyaan)
                </label>
                <textarea
                  rows={3}
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Tuliskan pertanyaan studi kasus Informatika yang akan muncul di HUD Arena..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-sky-400 mb-1">
                    Terminal A (Opsi A)
                  </label>
                  <input
                    type="text"
                    required
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Teks opsi jawaban A"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-400 mb-1">
                    Terminal B (Opsi B)
                  </label>
                  <input
                    type="text"
                    required
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Teks opsi jawaban B"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-400 mb-1">
                    Terminal C (Opsi C)
                  </label>
                  <input
                    type="text"
                    required
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Teks opsi jawaban C"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-rose-400 mb-1">
                    Terminal D (Opsi D)
                  </label>
                  <input
                    type="text"
                    required
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Teks opsi jawaban D"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kunci Jawaban Benar
                  </label>
                  <select
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value as OptionKey)}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-950 border border-slate-800 rounded-lg text-emerald-400"
                  >
                    <option value="A">Opsi A</option>
                    <option value="B">Opsi B</option>
                    <option value="C">Opsi C</option>
                    <option value="D">Opsi D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Batas Waktu (Detik)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={60}
                    value={qTimeLimit}
                    onChange={(e) => setQTimeLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Simpan Butir Soal
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Pembahasan Materi (Ditampilkan Saat Evaluasi & Analisis Butir Soal)
                </label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Tuliskan alasan mengapa kunci jawaban tersebut benar..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
