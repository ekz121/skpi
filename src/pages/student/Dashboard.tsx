import React from 'react';
import { User, StudentStats, CertificateItem, SKPIRequest } from '../../types.ts';
import { 
  Award, 
  Target, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  UploadCloud, 
  FileCheck2, 
  ArrowRight, 
  CheckSquare, 
  BookOpen, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  stats: StudentStats | null;
  recentCertificates: CertificateItem[];
  skpiRequest: SKPIRequest | null;
  onNavigate: (menuKey: string) => void;
  onViewCertificate: (cert: CertificateItem) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  stats,
  recentCertificates,
  skpiRequest,
  onNavigate,
  onViewCertificate
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs">Memuat data dashboard SKEM & SKPI...</p>
      </div>
    );
  }

  const {
    totalApprovedPoints,
    targetPoints,
    deficitPoints,
    progressPercentage,
    predicate,
    counts,
    mandatoryChecklist,
    mandatoryAllFulfilled,
    isEligibleForSKPI,
    eligibilityReasons
  } = stats;

  return (
    <div className="space-y-6">
      {/* Student Greeting Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-md">
                Angkatan {user.angkatan || 2023}
              </span>
              <span className="text-xs text-slate-300 font-mono">NIM: {user.nim}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Selamat Datang, {user.nama}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {user.prodi} · Pantau pemenuhan Satuan Kredit Ekstrakurikuler Mahasiswa (SKEM) untuk syarat penerbitan SKPI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Unggah Sertifikat</span>
            </button>
            <button
              onClick={() => onNavigate('skpi')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Status SKPI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics: Points, Target, Deficit, Predicate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Approved Points */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Poin SKEM Disetujui</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalApprovedPoints}
            </span>
            <span className="text-xs text-slate-500 font-medium">Poin Sah</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Hanya poin dari verifikasi <span className="font-semibold text-emerald-700">Disetujui</span> yang dihitung.
          </p>
        </div>

        {/* Target Points */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Target Kelulusan</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {targetPoints}
            </span>
            <span className="text-xs text-slate-500 font-medium">Poin Minimal</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            {user.angkatan === 2022 ? 'Keringanan khusus angkatan 2022' : 'Ketentuan pedoman angkatan 2023+'}
          </p>
        </div>

        {/* Deficit / Progress */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Progres & Kekurangan</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {progressPercentage}%
            </span>
            <span className="text-xs text-slate-500">
              {deficitPoints > 0 ? `(Kurang ${deficitPoints} poin)` : '(Target Tercapai)'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                progressPercentage >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Predicate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Predikat SKEM</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 uppercase">
              {predicate}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Berdasarkan rentang tabel pedoman kelulusan.
          </p>
        </div>
      </div>

      {/* Submission Status Counters Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Status Pengajuan Sertifikat Anda
          </h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>Buka Riwayat Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 block">Draf Tersimpan</span>
            <span className="text-lg font-bold font-mono text-slate-700">{counts.draf}</span>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-center">
            <span className="text-[11px] text-blue-700 block font-medium">Menunggu Verifikasi</span>
            <span className="text-lg font-bold font-mono text-blue-900">{counts.menunggu}</span>
          </div>
          <div className={`p-3 rounded-lg border text-center ${
            counts.revisi > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
          }`}>
            <span className={`text-[11px] block font-medium ${
              counts.revisi > 0 ? 'text-amber-800' : 'text-slate-500'
            }`}>
              Perlu Revisi
            </span>
            <span className={`text-lg font-bold font-mono ${
              counts.revisi > 0 ? 'text-amber-900 font-extrabold' : 'text-slate-700'
            }`}>
              {counts.revisi}
            </span>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-100 text-center">
            <span className="text-[11px] text-emerald-700 block font-medium">Disetujui</span>
            <span className="text-lg font-bold font-mono text-emerald-900">{counts.disetujui}</span>
          </div>
          <div className="p-3 bg-red-50/60 rounded-lg border border-red-100 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] text-red-700 block font-medium">Ditolak</span>
            <span className="text-lg font-bold font-mono text-red-900">{counts.ditolak}</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: 4 Mandatory Activities Checklist + SKPI Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4 Mandatory Activities */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>Checklist 4 Kegiatan Wajib Kampus</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Wajib terpenuhi seluruhnya melalui sertifikat berstatus <strong>Disetujui</strong>.
                </p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                mandatoryAllFulfilled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {Object.values(mandatoryChecklist).filter(m => m.fulfilled).length} / 4 Terpenuhi
              </span>
            </div>

            <div className="space-y-3">
              {Object.values(mandatoryChecklist).map((item) => (
                <div
                  key={item.key}
                  className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                    item.fulfilled
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="mt-0.5">
                    {item.fulfilled ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <span className={`text-[10px] font-semibold uppercase ${
                        item.fulfilled ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        {item.fulfilled ? 'Terpenuhi' : 'Belum Terpenuhi'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                    {item.fulfilled && item.matchedActivityName && (
                      <p className="text-[11px] text-emerald-800 font-medium mt-1 truncate">
                        Sertifikat: {item.matchedActivityName} ({item.matchedDate})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Poin mencukupi belum otomatis membuka SKPI jika kegiatan wajib belum lengkap.</span>
          </div>
        </div>

        {/* SKPI Status & Next Action Callout */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>Status & Kelayakan Pengajuan SKPI</span>
              </h3>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                skpiRequest?.status === 'Terbit' ? 'bg-emerald-600 text-white' :
                skpiRequest?.status === 'Diajukan' ? 'bg-blue-100 text-blue-800' :
                isEligibleForSKPI ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {skpiRequest ? `SKPI: ${skpiRequest.status}` : (isEligibleForSKPI ? 'Siap Diajukan' : 'Belum Memenuhi Syarat')}
              </span>
            </div>

            {/* Condition Explanations */}
            <div className="space-y-2.5 my-4">
              <div className="flex items-start gap-2.5 text-xs">
                {eligibilityReasons.pointsOk ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-slate-800">Syarat Poin SKEM: </span>
                  <span className={eligibilityReasons.pointsOk ? 'text-slate-600' : 'text-red-700'}>
                    {eligibilityReasons.pointsMsg}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                {eligibilityReasons.mandatoryOk ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-slate-800">Syarat Kegiatan Wajib: </span>
                  <span className={eligibilityReasons.mandatoryOk ? 'text-slate-600' : 'text-red-700'}>
                    {eligibilityReasons.mandatoryMsg}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Request Details */}
            {skpiRequest && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs space-y-1 mb-4">
                <div className="flex justify-between text-slate-700">
                  <span>Tanggal Permohonan:</span>
                  <span className="font-mono">{new Date(skpiRequest.submissionDate).toLocaleDateString('id-ID')}</span>
                </div>
                {skpiRequest.documentNumber && (
                  <div className="flex justify-between text-slate-900 font-bold">
                    <span>Nomor SKPI Resmi:</span>
                    <span className="font-mono text-blue-900">{skpiRequest.documentNumber}</span>
                  </div>
                )}
                {skpiRequest.adminNotes && (
                  <div className="pt-1 text-slate-700">
                    <span className="font-semibold">Catatan BAAK: </span>
                    <span>{skpiRequest.adminNotes}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            {skpiRequest?.status === 'Terbit' ? (
              <button
                onClick={() => onNavigate('skpi')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Lihat & Unduh SKPI Final Resmi</span>
              </button>
            ) : isEligibleForSKPI && !skpiRequest ? (
              <button
                onClick={() => onNavigate('skpi')}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Buka Formulir Pengajuan SKPI &rarr;</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('upload')}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Lengkapi Pengajuan Sertifikat &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Submissions Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Aktivitas Pengajuan Terkini</h3>
            <p className="text-xs text-slate-500">Daftar berkas sertifikat yang Anda serahkan</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>Semua Riwayat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentCertificates.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">Belum ada pengajuan sertifikat.</p>
            <button
              onClick={() => onNavigate('upload')}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:underline"
            >
              Mulai Unggah Sertifikat Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Kegiatan</th>
                  <th className="py-3 px-4">Penyelenggara & Tanggal</th>
                  <th className="py-3 px-4 text-center">Poin</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCertificates.slice(0, 5).map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{cert.activityName}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{cert.categoryId}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="truncate max-w-[200px]">{cert.organizer}</p>
                      <span className="text-[11px] text-slate-400 font-mono">{cert.activityDate}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {cert.status === 'Disetujui' ? (
                        <span className="text-emerald-700">+{cert.approvedPoints}</span>
                      ) : (
                        <span className="text-slate-400">+{cert.estimatedPoints}*</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cert.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                        cert.status === 'Perlu Revisi' ? 'bg-amber-100 text-amber-800' :
                        cert.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                        cert.status === 'Menunggu Verifikasi' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewCertificate(cert)}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Detail & Bukti
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
