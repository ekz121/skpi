import React, { useState, useEffect } from 'react';
import { User, StudentStats, SKPIRequest, SKPISnapshotData } from '../../types.ts';
import { api } from '../../lib/api.ts';
import { SKPIDocumentView } from '../../components/SKPIDocumentView.tsx';
import { 
  FileCheck2, 
  Download, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  UserCheck, 
  Eye, 
  HelpCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface SKPIPageProps {
  user: User;
  stats: StudentStats | null;
  skpiRequest: SKPIRequest | null;
  onRefresh: () => void;
  onNavigateToUpload: () => void;
}

export const SKPIPage: React.FC<SKPIPageProps> = ({
  user,
  stats,
  skpiRequest,
  onRefresh,
  onNavigateToUpload
}) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [showFullPreviewModal, setShowFullPreviewModal] = useState(false);

  useEffect(() => {
    loadPreview();
  }, [user.id]);

  const loadPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const data = await api.getSKPIPreview();
      setPreviewData(data);
    } catch (err) {
      console.error('Failed to load SKPI preview:', err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleApply = async () => {
    setApplyError(null);
    setIsApplying(true);

    try {
      await api.applySKPI();
      onRefresh();
      loadPreview();
    } catch (err: any) {
      setApplyError(err.message || 'Gagal mengajukan SKPI.');
    } finally {
      setIsApplying(false);
    }
  };

  const isEligible = stats?.isEligibleForSKPI || false;
  const isPublished = skpiRequest?.status === 'Terbit';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Penerbitan Surat Keterangan Pendamping Ijazah (SKPI)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pengajuan dokumen resmi pendamping ijazah Politeknik Semen Indonesia berbasis capaian SKEM.
            </p>
          </div>

          <button
            onClick={() => {
              onRefresh();
              loadPreview();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan Status</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {isPublished ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Dokumen Resmi Telah Terbit
              </span>
              <h3 className="text-base font-bold text-emerald-950 mt-0.5">
                SKPI Anda Telah Disahkan oleh BAAK Polteksi
              </h3>
              <p className="text-xs text-emerald-900/80 mt-1">
                Nomor Dokumen: <strong className="font-mono">{skpiRequest?.documentNumber}</strong> · Tanggal Terbit: {new Date(skpiRequest?.publishedAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFullPreviewModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Buka & Unduh Dokumen Final</span>
          </button>
        </div>
      ) : skpiRequest ? (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-900 uppercase">
                  Status Pengajuan: {skpiRequest.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({new Date(skpiRequest.submissionDate).toLocaleDateString('id-ID')})
                </span>
              </div>
              <p className="text-xs text-blue-950 mt-1">
                {skpiRequest.status === 'Diajukan' && 'Permohonan Anda telah masuk ke antrean verifikasi BAAK. Administrator sedang meninjau kelengkapan akademik.'}
                {skpiRequest.status === 'Dalam Pemeriksaan' && 'Administrator BAAK sedang memverifikasi data kelulusan, nomor seri ijazah, dan capaian pembelajaran.'}
                {skpiRequest.status === 'Perlu Revisi' && `Permohonan memerlukan perbaikan: ${skpiRequest.adminNotes}`}
                {skpiRequest.status === 'Ditolak' && `Permohonan ditolak: ${skpiRequest.adminNotes}`}
              </p>
            </div>
          </div>
        </div>
      ) : isEligible ? (
        <div className="p-6 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
              Persyaratan Lengkap
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Anda Sudah Memenuhi Syarat untuk Mengajukan SKPI
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Poin SKEM telah mencapai target ({stats?.totalApprovedPoints} Poin) dan 4 kegiatan wajib kampus telah disetujui.
            </p>
          </div>

          <button
            onClick={handleApply}
            disabled={isApplying}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-60 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>{isApplying ? 'Mengirim Pengajuan...' : 'Ajukan SKPI Sekarang'}</span>
          </button>
        </div>
      ) : (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-xs font-bold text-amber-950 uppercase">
              Belum Memenuhi Syarat Pengajuan SKPI
            </h3>
            <p className="text-xs text-amber-900 mt-1">
              Tombol pengajuan hanya akan aktif ketika total poin disetujui Anda mencapai minimal target angkatan dan seluruh 4 kegiatan wajib (BNSP, Magang/PKL, PKKMB, LKMM) terpenuhi.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onNavigateToUpload}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md"
              >
                Unggah Sertifikat Tambahan &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {applyError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{applyError}</span>
        </div>
      )}

      {/* Two Column: Student Data Confirmation & Activities Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Konfirmasi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase">Konfirmasi Biodata SKPI</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Nama Mahasiswa</span>
              <span className="font-semibold text-slate-900">{user.nama}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">NIM Mahasiswa</span>
              <span className="font-semibold font-mono text-slate-900">{user.nim}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Program Studi</span>
              <span className="font-semibold text-slate-900">{user.prodi}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tempat, Tanggal Lahir</span>
              <span className="font-semibold text-slate-800">
                {user.tempatLahir ? `${user.tempatLahir}, ${user.tanggalLahir}` : 'Belum dilengkapi di profil'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Nomor Seri Ijazah</span>
              <span className="font-mono text-slate-700">
                {user.nomorIjazah || '(Diverifikasi oleh BAAK saat kelulusan)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Status Akademik</span>
              <span className="font-semibold text-slate-800">{user.statusKelulusan || 'Aktif'}</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live Document Preview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pratinjau Dokumen SKPI Resmi
              </h3>
              <p className="text-xs text-slate-500">
                Format otomatis berdasarkan template Politeknik Semen Indonesia.
              </p>
            </div>

            {previewData && (
              <button
                onClick={() => setShowFullPreviewModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Buka Tampilan Penuh</span>
              </button>
            )}
          </div>

          {isLoadingPreview ? (
            <div className="py-16 text-center text-slate-400">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs">Menyusun draf dokumen SKPI...</p>
            </div>
          ) : previewData ? (
            <div className="max-h-[600px] overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <SKPIDocumentView
                snapshot={skpiRequest?.snapshotData || previewData}
                documentNumber={skpiRequest?.documentNumber || 'SKPI/POLTEKSI/2026/DRAF'}
                isDraft={!isPublished}
                publishedAt={skpiRequest?.publishedAt}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Pratinjau tidak tersedia saat ini.
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Modal View for Document */}
      {showFullPreviewModal && previewData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-4 sm:p-8 backdrop-blur-xs flex justify-center">
          <div className="w-full max-w-5xl my-auto">
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setShowFullPreviewModal(false)}
                className="px-4 py-2 bg-white text-slate-800 font-bold rounded-lg text-xs hover:bg-slate-100 shadow-md"
              >
                Tutup Tampilan Dokumen [X]
              </button>
            </div>

            <SKPIDocumentView
              snapshot={skpiRequest?.snapshotData || previewData}
              documentNumber={skpiRequest?.documentNumber || 'SKPI/POLTEKSI/2026/DRAF'}
              isDraft={!isPublished}
              publishedAt={skpiRequest?.publishedAt}
            />
          </div>
        </div>
      )}
    </div>
  );
};
