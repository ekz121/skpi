import React from 'react';
import { User, StudentStats, CertificateItem } from '../../types.ts';
import { SKEM_CATEGORIES } from '../../server/rules.ts';
import { 
  Award, 
  Target, 
  CheckCircle2, 
  XCircle, 
  CheckSquare, 
  Info, 
  FileText, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Star
} from 'lucide-react';

interface PointsRecapProps {
  user: User;
  stats: StudentStats | null;
  certificates: CertificateItem[];
  onNavigateToSKPI: () => void;
  onNavigateToUpload: () => void;
}

export const PointsRecap: React.FC<PointsRecapProps> = ({
  user,
  stats,
  certificates,
  onNavigateToSKPI,
  onNavigateToUpload
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-xs">Memuat rekapitulasi poin SKEM...</p>
      </div>
    );
  }

  const approvedCerts = certificates.filter(c => c.status === 'Disetujui');

  // Calculate points per category
  const categoryTotals: Record<string, { count: number; points: number }> = {};
  for (const cat of SKEM_CATEGORIES) {
    categoryTotals[cat.id] = { count: 0, points: 0 };
  }

  for (const cert of approvedCerts) {
    if (categoryTotals[cert.categoryId]) {
      categoryTotals[cert.categoryId].count++;
      categoryTotals[cert.categoryId].points += cert.approvedPoints;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Rekapitulasi Poin SKEM & Analisis Kelayakan SKPI
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Rincian poin yang telah sah disetujui oleh BAAK Politeknik Semen Indonesia.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold font-mono">
              Predikat: {stats.predicate.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Big Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total Poin Disetujui</span>
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {stats.totalApprovedPoints}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Poin Sah</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Target Poin Angkatan</span>
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.targetPoints}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Angkatan {user.angkatan || 2023}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Kekurangan Poin</span>
            <span className={`text-2xl font-bold font-mono tabular-nums ${
              stats.deficitPoints > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {stats.deficitPoints > 0 ? `-${stats.deficitPoints}` : '0 (Terpenuhi)'}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {stats.deficitPoints > 0 ? 'Poin tambahan dibutuhkan' : 'Target tercapai'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Kelayakan SKPI</span>
            <span className={`text-base font-bold block mt-1 ${
              stats.isEligibleForSKPI ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {stats.isEligibleForSKPI ? 'Memenuhi Syarat' : 'Belum Memenuhi'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {stats.isEligibleForSKPI ? 'Siap mengajukan surat' : 'Perlu melengkapi syarat'}
            </span>
          </div>
        </div>
      </div>

      {/* Analysis Box */}
      <div className={`p-5 rounded-xl border ${
        stats.isEligibleForSKPI 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
          : 'bg-amber-50/70 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-start gap-3">
          {stats.isEligibleForSKPI ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <h3 className="text-sm font-bold">
              {stats.isEligibleForSKPI
                ? 'Selamat! Anda Memenuhi Seluruh Kriteria Kelayakan Pengajuan SKPI'
                : 'Pemberitahuan Persyaratan Pengajuan Dokumen SKPI'}
            </h3>
            <p className="text-xs mt-1 leading-relaxed">
              {stats.isEligibleForSKPI
                ? 'Seluruh persyaratan poin akumulasi (minimal target) dan 4 kegiatan wajib kampus telah disetujui. Anda dapat melakukan pengajuan SKPI resmi untuk diproses oleh Administrator BAAK.'
                : 'Untuk dapat mengajukan SKPI resmi, Anda wajib memenuhi dua syarat sekaligus: (1) Total poin disetujui mencapai target, dan (2) Memenuhi seluruh 4 kegiatan wajib.'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                stats.eligibilityReasons.pointsOk ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {stats.eligibilityReasons.pointsOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{stats.eligibilityReasons.pointsMsg}</span>
              </span>

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                stats.eligibilityReasons.mandatoryOk ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {stats.eligibilityReasons.mandatoryOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{stats.eligibilityReasons.mandatoryMsg}</span>
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs font-medium">Tindakan Selanjutnya:</span>
              {stats.isEligibleForSKPI ? (
                <button
                  onClick={onNavigateToSKPI}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Ajukan SKPI Sekarang &rarr;
                </button>
              ) : (
                <button
                  onClick={onNavigateToUpload}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Unggah Berkas Kegiatan &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Mandatory Activities Detail Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Checklist 4 Kegiatan Wajib Kampus</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {Object.values(stats.mandatoryChecklist).filter(m => m.fulfilled).length} dari 4 Selesai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(stats.mandatoryChecklist).map((m) => (
            <div
              key={m.key}
              className={`p-4 rounded-xl border ${
                m.fulfilled ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  m.fulfilled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {m.fulfilled ? 'Terpenuhi' : 'Belum Terpenuhi'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{m.description}</p>
              {m.fulfilled && (
                <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800">
                  <span className="font-semibold block">Dokumen Sah:</span>
                  <p className="truncate">{m.matchedActivityName} ({m.matchedDate})</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Rincian Perolehan Poin per Kategori SKEM</h3>
          <p className="text-xs text-slate-500">Hanya menampilkan kegiatan dengan status Disetujui</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-200">
          {SKEM_CATEGORIES.map((cat) => {
            const tot = categoryTotals[cat.id] || { count: 0, points: 0 };
            return (
              <div key={cat.id} className="p-4">
                <span className="text-[11px] text-slate-500 font-medium block truncate">{cat.name}</span>
                <span className="text-xl font-bold font-mono text-slate-900 block mt-1">
                  +{tot.points} Poin
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {tot.count} kegiatan disetujui
                </span>
              </div>
            );
          })}
        </div>

        {/* Table of Approved Activities */}
        <div className="p-5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Daftar Kegiatan Disetujui ({approvedCerts.length})
          </h4>

          {approvedCerts.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Belum ada kegiatan yang disetujui oleh BAAK.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No.</th>
                    <th className="py-2.5 px-3">Nama Kegiatan</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Penyelenggara & Tanggal</th>
                    <th className="py-2.5 px-3 text-right">Poin Sah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedCerts.map((cert, idx) => (
                    <tr key={cert.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate">
                        {cert.activityName}
                        {cert.isMandatoryMatch && (
                          <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Wajib: {cert.isMandatoryMatch.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 capitalize">{cert.categoryId}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {cert.organizer} ({cert.activityDate})
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        +{cert.approvedPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
