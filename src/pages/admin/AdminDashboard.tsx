import React from 'react';
import { User, CertificateItem, SKPIRequest } from '../../types.ts';
import { 
  CheckSquare, 
  FileText, 
  Users, 
  Award, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Building2
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  adminStats: any;
  onNavigate: (menuKey: string) => void;
  onViewCertificate: (cert: CertificateItem) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  adminStats,
  onNavigate,
  onViewCertificate
}) => {
  if (!adminStats) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-xs">Memuat dashboard administrator...</p>
      </div>
    );
  }

  const {
    totalStudentsCount,
    pendingCertsCount,
    pendingSkpiCount,
    eligibleStudentsCount,
    totalApprovedPointsAll,
    recentCertificates,
    recentSkpi
  } = adminStats;

  return (
    <div className="space-y-6">
      {/* Admin Greeting */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-md">
              BAAK & Kemahasiswaan
            </span>
            <span className="text-xs text-slate-400">Politeknik Semen Indonesia</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Panel Administrator SKEM & SKPI
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Verifikasi pengajuan bukti kegiatan mahasiswa dan terbitkan dokumen resmi Surat Keterangan Pendamping Ijazah (SKPI).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('admin-verify')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Verifikasi Sertifikat ({pendingCertsCount})</span>
          </button>
          <button
            onClick={() => onNavigate('admin-skpi')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Penerbitan SKPI ({pendingSkpiCount})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Certs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Antrean Sertifikat Menunggu</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-900 tabular-nums">
              {pendingCertsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Berkas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Perlu diverifikasi & penetapan poin sah.
          </p>
        </div>

        {/* Pending SKPI */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Permohonan SKPI Masuk</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
              {pendingSkpiCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Mahasiswa</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Menunggu pemeriksaan data kelulusan.
          </p>
        </div>

        {/* Eligible Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Mahasiswa Memenuhi Syarat</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
              {eligibleStudentsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">dari {totalStudentsCount}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Poin & 4 kegiatan wajib terpenuhi.
          </p>
        </div>

        {/* Total Points */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Akumulasi Poin Disetujui</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-950 tabular-nums">
              {totalApprovedPointsAll}
            </span>
            <span className="text-xs text-slate-500 font-medium">Poin Kampus</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Seluruh rekap capaian mahasiswa aktif.
          </p>
        </div>
      </div>

      {/* Two Column Section: Priority Queue & Recent SKPI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate Queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>Antrean Verifikasi Sertifikat</span>
                </h3>
                <p className="text-xs text-slate-500">Pengajuan mahasiswa yang memerlukan tindakan</p>
              </div>

              <button
                onClick={() => onNavigate('admin-verify')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>Lihat Semua Antrean</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentCertificates.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Tidak ada pengajuan yang menunggu saat ini.
                </div>
              ) : (
                recentCertificates.map((cert: CertificateItem) => (
                  <div key={cert.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{cert.activityName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {cert.studentName} ({cert.studentNim}) · <span className="font-mono">{cert.activityDate}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        cert.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                        cert.status === 'Perlu Revisi' ? 'bg-amber-100 text-amber-800' :
                        cert.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {cert.status}
                      </span>
                      <button
                        onClick={() => onViewCertificate(cert)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md"
                      >
                        Periksa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SKPI Requests Queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Permohonan SKPI Terbaru</span>
                </h3>
                <p className="text-xs text-slate-500">Pemeriksaan dan penerbitan dokumen final</p>
              </div>

              <button
                onClick={() => onNavigate('admin-skpi')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>Buka Penerbitan SKPI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentSkpi.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Belum ada permohonan SKPI baru.
                </div>
              ) : (
                recentSkpi.map((req: SKPIRequest) => (
                  <div key={req.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{req.studentName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        NIM: {req.studentNim} · {req.studentProdi}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        req.status === 'Terbit' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'Dalam Pemeriksaan' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'Perlu Revisi' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status}
                      </span>
                      <button
                        onClick={() => onNavigate('admin-skpi')}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md"
                      >
                        Buka Surat
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
