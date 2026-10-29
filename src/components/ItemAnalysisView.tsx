import React, { useMemo, useState } from 'react';
import {
  InformaticsQuestion,
  OptionKey,
  PlayerAnswerEvent,
  computeItemAnalysis,
} from '../data/informaticsData';
import { MapPlayerEntity } from './CyberArenaCanvas';
import {
  Download,
  RotateCcw,
  Award,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Users,
} from 'lucide-react';

interface ItemAnalysisViewProps {
  roomPin: string;
  questions: InformaticsQuestion[];
  sessionAnswers: PlayerAnswerEvent[];
  players: MapPlayerEntity[];
  isTeacherHost: boolean;
  onPlayAgain: () => void;
  onBackToMapLobby: () => void;
  onOpenMaterialManager: () => void;
}

export const ItemAnalysisView: React.FC<ItemAnalysisViewProps> = ({
  roomPin,
  questions,
  sessionAnswers,
  players,
  isTeacherHost,
  onPlayAgain,
  onBackToMapLobby,
  onOpenMaterialManager,
}) => {
  const [includeClassCohort, setIncludeClassCohort] = useState<boolean>(true);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    questions[0]?.id || null
  );

  const analysis = useMemo(
    () => computeItemAnalysis(questions, sessionAnswers, includeClassCohort),
    [questions, sessionAnswers, includeClassCohort]
  );

  const selectedItem =
    analysis.items.find((it) => it.questionId === selectedQuestionId) || analysis.items[0];

  const sortedClassPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const handleDownloadCsv = () => {
    const headers = [
      'No',
      'Kode Room',
      'ID Soal',
      'Elemen Materi',
      'Kelas',
      'Level Kognitif',
      'Pertanyaan',
      'Kunci Jawaban',
      'Jumlah Penjawab (JS)',
      'Menjawab Benar (B)',
      'Indeks Kesukaran (P)',
      'Kategori Kesukaran',
      'Proporsi Kelompok Atas (PA)',
      'Proporsi Kelompok Bawah (PB)',
      'Daya Pembeda (D)',
      'Kategori Daya Pembeda',
      'Opsi A (%)',
      'Opsi B (%)',
      'Opsi C (%)',
      'Opsi D (%)',
      'Evaluasi Pengecoh',
      'Rata-rata Waktu (Detik)',
      'Rekomendasi Butir Soal',
    ];

    const rows = analysis.items.map((item) => [
      item.questionNumber,
      roomPin || 'MTN14',
      item.questionId,
      `"${item.category}"`,
      item.gradeLevel,
      `"${item.cognitiveLevel}"`,
      `"${item.question.replace(/"/g, '""')}"`,
      item.correctAnswer,
      item.totalRespondents,
      item.correctCount,
      item.difficultyIndex,
      item.difficultyCategory,
      item.upperGroupCorrectRate,
      item.lowerGroupCorrectRate,
      item.discriminationIndex,
      item.discriminationCategory,
      `${item.optionPercentages.A}%`,
      `${item.optionPercentages.B}%`,
      `${item.optionPercentages.C}%`,
      `${item.optionPercentages.D}%`,
      `"${item.distractorEvaluation}"`,
      item.avgResponseTimeSec,
      `"${item.recommendation}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Analisis_Butir_Soal_Room_${roomPin || 'MTN14'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/92 p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Victory & Teacher Identity Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div>
            <div className="text-xs text-sky-400 font-medium">
              Laporan Evaluasi Satu Kelas (Kode Room: {roomPin || 'MTN14'}) · MTs Negeri 14 Jakarta
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-display mt-0.5">
              Peringkat Kelas & Analisis Psikometrik Butir Soal Informatika
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Guru Pengampu: Azhary Mardhani, S.Kom · Kurikulum Merdeka
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              Unduh CSV Analisis
            </button>
            <button
              onClick={onOpenMaterialManager}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Tambah Materi / Soal
            </button>
            <button
              onClick={onBackToMapLobby}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Kembali ke Map Kelas
            </button>
            {isTeacherHost && (
              <button
                onClick={onPlayAgain}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Mulai Ulang Sesi Kelas
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Class Leaderboard & Psychometric Summary Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Classroom Leaderboard Card */}
            <div className="lg:col-span-5 p-5 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold text-slate-100 font-display">
                    Peringkat Peserta Room ({sortedClassPlayers.length} Siswa/Peserta)
                  </span>
                </div>
                <span className="text-xs font-mono text-sky-400">ROOM: {roomPin || 'MTN14'}</span>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {sortedClassPlayers.length === 0 ? (
                  <div className="text-xs text-slate-400 py-4 text-center">
                    Belum ada data skor peserta pada sesi ini.
                  </div>
                ) : (
                  sortedClassPlayers.map((p, index) => {
                    const correctCount = sessionAnswers.filter(
                      (a) => a.playerId === p.id && a.isCorrect
                    ).length;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="font-mono font-bold text-slate-400 tabular-nums">
                            #{index + 1}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="font-semibold text-slate-100 truncate">
                            {p.name}
                          </span>
                          <span className="text-slate-400">· {p.studentClass}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                          <span className="text-emerald-400">
                            {correctCount}/{questions.length} Benar
                          </span>
                          <span className="font-bold text-slate-100">{p.score} Poin</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 4 Psychometric Test Quality KPIs */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-400">Reliabilitas Tes (KR-20)</span>
                <div className="text-2xl font-bold text-sky-400 font-mono tabular-nums my-1">
                  {analysis.kr20Reliability.toFixed(2)}
                </div>
                <span className="text-xs text-slate-300">
                  {analysis.kr20Reliability >= 0.7
                    ? '● Reliabilitas Tinggi'
                    : '▲ Reliabilitas Sedang'}
                </span>
              </div>

              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-400">Rata-Rata Kesukaran (P)</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums my-1">
                  {analysis.meanDifficulty.toFixed(2)}
                </div>
                <span className="text-xs text-slate-300">
                  {analysis.meanDifficulty > 0.7
                    ? 'Kategori Mudah'
                    : analysis.meanDifficulty < 0.3
                    ? 'Kategori Sukar'
                    : 'Ideal / Proporsional'}
                </span>
              </div>

              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-400">Rata-Rata Daya Beda (D)</span>
                <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums my-1">
                  {analysis.meanDiscrimination.toFixed(2)}
                </div>
                <span className="text-xs text-slate-300">
                  {analysis.meanDiscrimination >= 0.4
                    ? 'Sangat Baik (≥ 0.40)'
                    : analysis.meanDiscrimination >= 0.3
                    ? 'Baik (0.30 - 0.39)'
                    : 'Cukup (0.20 - 0.29)'}
                </span>
              </div>

              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-400">Kelayakan Bank Soal</span>
                <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums my-1">
                  {analysis.acceptedCount}/{analysis.items.length}
                </div>
                <span className="text-xs text-slate-300 tabular-nums">
                  {analysis.acceptedCount} Diterima · {analysis.reviseCount} Revisi
                </span>
              </div>
            </div>
          </div>

          {/* Cohort Filter Bar & Formula Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <BarChart3 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Rumus Evaluasi: Tingkat Kesukaran{' '}
                <code className="font-mono text-sky-300">P = B / JS</code> · Daya Pembeda{' '}
                <code className="font-mono text-amber-300">D = PA - PB</code> · Pengecoh Efektif{' '}
                <code className="font-mono text-emerald-300">≥ 5% Pemilih</code>
              </span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setIncludeClassCohort(true)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  includeClassCohort
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Data Room + Kohort Kelas MTsN 14
              </button>
              <button
                onClick={() => setIncludeClassCohort(false)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  !includeClassCohort
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hanya Sesi Room Ini ({sessionAnswers.length} Jawaban)
              </button>
            </div>
          </div>

          {/* Main Item Analysis Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold text-slate-400">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Butir Soal & Elemen Materi</th>
                    <th className="py-3 px-3 text-center">Kunci</th>
                    <th className="py-3 px-4">Tingkat Kesukaran (P)</th>
                    <th className="py-3 px-4">Daya Pembeda (D)</th>
                    <th className="py-3 px-4">Distribusi Opsi Sektor (A · B · C · D)</th>
                    <th className="py-3 px-3 text-right">Waktu</th>
                    <th className="py-3 px-4">Rekomendasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {analysis.items.map((item) => {
                    const isSelected = selectedItem?.questionId === item.questionId;
                    return (
                      <tr
                        key={item.questionId}
                        onClick={() => setSelectedQuestionId(item.questionId)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-sky-950/35' : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-slate-300">
                          #{item.questionNumber}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-slate-100 truncate">{item.question}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.category} · {item.gradeLevel} · {item.cognitiveLevel}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-400">
                          {item.correctAnswer}
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums">
                          <div className="font-semibold text-slate-100">
                            {item.difficultyIndex.toFixed(2)}{' '}
                            <span className="text-slate-400 font-sans font-normal">
                              ({item.correctCount}/{item.totalRespondents})
                            </span>
                          </div>
                          <div className="text-[11px] text-sky-400">{item.difficultyCategory}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums">
                          <div className="font-semibold text-slate-100">
                            {item.discriminationIndex.toFixed(2)}
                          </div>
                          <div
                            className={`text-[11px] ${
                              item.discriminationIndex >= 0.3
                                ? 'text-emerald-400'
                                : item.discriminationIndex >= 0.2
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {item.discriminationCategory}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums">
                          <div className="flex items-center gap-2 text-[11px]">
                            {(['A', 'B', 'C', 'D'] as OptionKey[]).map((optKey) => {
                              const isKey = item.correctAnswer === optKey;
                              const pct = item.optionPercentages[optKey];
                              return (
                                <span
                                  key={optKey}
                                  className={
                                    isKey
                                      ? 'text-emerald-400 font-bold'
                                      : pct >= 5
                                      ? 'text-slate-300'
                                      : 'text-rose-400'
                                  }
                                >
                                  {optKey}:{pct}%
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                            {item.distractorEvaluation}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-300">
                          {item.avgResponseTimeSec}s
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium">
                            {item.recommendation === 'Butir Soal Diterima' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="text-emerald-300">{item.recommendation}</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="text-amber-300">{item.recommendation}</span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Question Detailed Diagnostic Inspector */}
          {selectedItem && (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-sky-400 font-medium">
                    Detail Diagnostik Butir Soal #{selectedItem.questionNumber} ·{' '}
                    {selectedItem.category} ({selectedItem.cognitiveLevel})
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-1">
                    {selectedItem.question}
                  </h3>
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-400">
                  PA = {selectedItem.upperGroupCorrectRate.toFixed(2)} · PB ={' '}
                  {selectedItem.lowerGroupCorrectRate.toFixed(2)} · D ={' '}
                  {selectedItem.discriminationIndex.toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {(['A', 'B', 'C', 'D'] as OptionKey[]).map((k) => {
                  const isCorrect = selectedItem.correctAnswer === k;
                  const pct = selectedItem.optionPercentages[k];
                  const cnt = selectedItem.optionCounts[k];
                  const fullQuestion = questions.find((q) => q.id === selectedItem.questionId);
                  return (
                    <div
                      key={k}
                      className={`p-3.5 rounded-lg border space-y-2 ${
                        isCorrect
                          ? 'bg-emerald-950/30 border-emerald-700/70'
                          : 'bg-slate-900/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-bold ${
                            isCorrect ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          Sektor {k} {isCorrect ? '(Kunci Benar)' : '(Pengecoh)'}
                        </span>
                        <span className="font-mono tabular-nums text-slate-200">
                          {pct}% ({cnt} Siswa)
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        {fullQuestion?.options[k] || ''}
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            isCorrect
                              ? 'bg-emerald-500'
                              : pct >= 5
                              ? 'bg-sky-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-slate-300 leading-relaxed pt-1">
                <strong className="text-sky-400">Pembahasan Konsep Informatika: </strong>
                {selectedItem.explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
