import React, { useState } from 'react';
import { CertificateItem, CertificateStatus } from '../../types.ts';
import { api } from '../../lib/api.ts';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Send, 
  X,
  UploadCloud,
  ArrowRight
} from 'lucide-react';

interface SubmissionHistoryProps {
  certificates: CertificateItem[];
  onRefresh: () => void;
  onViewCertificate: (cert: CertificateItem) => void;
}

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  certificates,
  onRefresh,
  onViewCertificate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('semua');

  // Edit / Revision Modal State
  const [editingCert, setEditingCert] = useState<CertificateItem | null>(null);
  const [revisedActivityName, setRevisedActivityName] = useState('');
  const [revisedOrganizer, setRevisedOrganizer] = useState('');
  const [revisedCertificateNumber, setRevisedCertificateNumber] = useState('');
  const [revisedFile, setRevisedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);

  const filtered = certificates.filter(cert => {
    const matchSearch = !searchTerm || 
      cert.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cert.certificateNumber && cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'Semua' || cert.status === statusFilter;
    const matchCategory = categoryFilter === 'semua' || cert.categoryId === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  const handleOpenRevision = (cert: CertificateItem) => {
    setEditingCert(cert);
    setRevisedActivityName(cert.activityName);
    setRevisedOrganizer(cert.organizer);
    setRevisedCertificateNumber(cert.certificateNumber || '');
    setRevisedFile(null);
    setRevisionError(null);
  };

  const handleSaveRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;

    setIsUpdating(true);
    setRevisionError(null);

    try {
      const formData = new FormData();
      formData.append('activityName', revisedActivityName);
      formData.append('organizer', revisedOrganizer);
      formData.append('certificateNumber', revisedCertificateNumber);
      formData.append('status', 'Menunggu Verifikasi'); // Update status to waiting for review

      if (revisedFile) {
        formData.append('file', revisedFile);
      }

      await api.updateCertificate(editingCert.id, formData);
      setEditingCert(null);
      onRefresh();
    } catch (err: any) {
      setRevisionError(err.message || 'Gagal mengirim perbaikan.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Riwayat Pengajuan SKEM Mahasiswa
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Daftar seluruh kegiatan yang pernah Anda ajukan beserta status verifikasi BAAK dan catatan revisi.
        </p>

        {/* Search & Filters */}
        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama kegiatan, penyelenggara, atau nomor sertifikat..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="Semua">Semua Status</option>
              <option value="Draf">Draf</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="semua">Semua Kategori</option>
              <option value="prestasi">Prestasi Lomba</option>
              <option value="pelatihan">Pelatihan & Keprofesian</option>
              <option value="organisasi">Organisasi & Kepemimpinan</option>
              <option value="projek">Projek & Pengabdian</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">Tidak ada pengajuan kegiatan yang cocok dengan filter pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Nama Kegiatan</th>
                  <th className="py-3.5 px-4">Kategori & Tanggal</th>
                  <th className="py-3.5 px-4 text-center">Poin</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Catatan Administrator</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((cert) => {
                  const isNeedRevision = cert.status === 'Perlu Revisi';

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{cert.activityName}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          {cert.certificateNumber ? `No: ${cert.certificateNumber}` : 'Tanpa No. SK'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-medium text-slate-700 block capitalize">
                          {cert.categoryId}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {cert.activityDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {cert.status === 'Disetujui' ? (
                          <span className="text-emerald-700 text-sm">+{cert.approvedPoints}</span>
                        ) : (
                          <span className="text-slate-400">+{cert.estimatedPoints}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          cert.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                          cert.status === 'Perlu Revisi' ? 'bg-amber-100 text-amber-900 animate-pulse' :
                          cert.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                          cert.status === 'Menunggu Verifikasi' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {cert.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {cert.adminNotes ? (
                          <div className={`p-2 rounded text-[11px] leading-tight ${
                            isNeedRevision ? 'bg-amber-50 text-amber-900 border border-amber-200 font-medium' : 'text-slate-600'
                          }`}>
                            {cert.adminNotes}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewCertificate(cert)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            title="Lihat Detail & Bukti Dokumen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isNeedRevision && (
                            <button
                              onClick={() => handleOpenRevision(cert)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-md shadow-2xs transition-colors"
                              title="Perbaiki pengajuan sesuai catatan BAAK"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Perbaiki</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revision Modal */}
      {editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 bg-amber-50 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-sm font-bold text-amber-950">Perbaiki Pengajuan (Revisi)</h3>
                  <p className="text-xs text-amber-800">Perbarui data atau unggah berkas yang lebih jelas.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCert(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRevision} className="p-6 space-y-4 overflow-y-auto">
              {/* Prior Admin Notes */}
              {editingCert.adminNotes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">Catatan Perbaikan dari Admin:</span>
                  <p>{editingCert.adminNotes}</p>
                </div>
              )}

              {revisionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                  {revisionError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kegiatan
                </label>
                <input
                  type="text"
                  required
                  value={revisedActivityName}
                  onChange={(e) => setRevisedActivityName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penyelenggara
                </label>
                <input
                  type="text"
                  required
                  value={revisedOrganizer}
                  onChange={(e) => setRevisedOrganizer(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Sertifikat / SK
                </label>
                <input
                  type="text"
                  value={revisedCertificateNumber}
                  onChange={(e) => setRevisedCertificateNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unggah Ulang Berkas Bukti (Jika diperlukan perbaikan dokumen)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={(e) => e.target.files && setRevisedFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  File saat ini: {editingCert.fileName}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Menyimpan...' : 'Kirim Ulang Hasil Perbaikan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
