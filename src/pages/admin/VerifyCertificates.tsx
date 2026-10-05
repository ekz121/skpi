import React, { useState } from 'react';
import { CertificateItem, MandatoryActivityKey } from '../../types.ts';
import { api } from '../../lib/api.ts';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  FileText, 
  ExternalLink, 
  Check, 
  X, 
  Building, 
  Calendar, 
  Award,
  History,
  AlertCircle
} from 'lucide-react';

interface VerifyCertificatesProps {
  certificates: CertificateItem[];
  onRefresh: () => void;
}

export const VerifyCertificates: React.FC<VerifyCertificatesProps> = ({
  certificates,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('semua');

  // Active Verification Modal
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [verificationPoints, setVerificationPoints] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [mandatoryMatch, setMandatoryMatch] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = certificates.filter(c => {
    const matchSearch = !searchTerm || 
      c.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studentNim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.organizer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'Semua' || c.status === statusFilter;
    const matchCategory = categoryFilter === 'semua' || c.categoryId === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  const handleOpenVerify = (cert: CertificateItem) => {
    setSelectedCert(cert);
    setVerificationPoints(cert.approvedPoints > 0 ? cert.approvedPoints : cert.estimatedPoints);
    setAdminNotes(cert.adminNotes || '');
    setMandatoryMatch(cert.isMandatoryMatch || '');
    setActionError(null);
  };

  const handleVerifyAction = async (status: 'Disetujui' | 'Perlu Revisi' | 'Ditolak') => {
    if (!selectedCert) return;
    setActionError(null);

    if (status === 'Perlu Revisi' && !adminNotes.trim()) {
      setActionError('Wajib menuliskan catatan perbaikan untuk mahasiswa saat meminta revisi.');
      return;
    }

    if (status === 'Ditolak' && !adminNotes.trim()) {
      setActionError('Wajib menuliskan alasan penolakan secara jelas.');
      return;
    }

    setIsProcessing(true);

    try {
      await api.verifyCertificate(selectedCert.id, {
        status,
        approvedPoints: status === 'Disetujui' ? verificationPoints : 0,
        adminNotes,
        isMandatoryMatch: mandatoryMatch || null
      });

      setSelectedCert(null);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Gagal memproses verifikasi.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Verifikasi Berkas Sertifikat & Kegiatan Mahasiswa
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Periksa keabsahan dokumen, tetapkan poin SKEM yang sah, atau instruksikan perbaikan.
        </p>

        {/* Filters */}
        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama mahasiswa, NIM, kegiatan, atau penyelenggara..."
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
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
              <option value="Draf">Draf</option>
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

      {/* Verification Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">Tidak ada pengajuan yang sesuai dengan kriteria filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Mahasiswa (NIM)</th>
                  <th className="py-3.5 px-4">Nama Kegiatan</th>
                  <th className="py-3.5 px-4">Kategori & Tanggal</th>
                  <th className="py-3.5 px-4 text-center">Estimasi / Sah</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <p className="font-semibold text-slate-900 truncate">{cert.studentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {cert.studentNim} · Angk {cert.studentAngkatan}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{cert.activityName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{cert.organizer}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-slate-700 block capitalize">
                        {cert.categoryId}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {cert.activityDate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      {cert.status === 'Disetujui' ? (
                        <span className="text-emerald-700 font-bold">+{cert.approvedPoints} Poin</span>
                      ) : (
                        <span className="text-slate-500">+{cert.estimatedPoints} Poin</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
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

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenVerify(cert)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        Verifikasi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Panel Verifikasi & Penetapan Poin SKEM
                </h3>
                <p className="text-xs text-slate-500">
                  Mahasiswa: <strong>{selectedCert.studentName}</strong> ({selectedCert.studentNim} · {selectedCert.studentProdi})
                </p>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Activity Info Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Kegiatan</span>
                  <span className="font-bold text-slate-900">{selectedCert.activityName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Penyelenggara / Lembaga</span>
                  <span className="font-semibold text-slate-800">{selectedCert.organizer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Pelaksanaan</span>
                  <span className="font-mono text-slate-800">{selectedCert.activityDate} ({selectedCert.academicYear})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Nomor Sertifikat/SK</span>
                  <span className="font-mono text-slate-800">{selectedCert.certificateNumber || '-'}</span>
                </div>
                {selectedCert.verificationUrl && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Tautan Verifikasi Online</span>
                    <a
                      href={selectedCert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                    >
                      <span>{selectedCert.verificationUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Embedded Document Frame */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Berkas Bukti Terlampir</span>
                  <a
                    href={api.getCertificateFileUrl(selectedCert.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Buka Berkas di Tab Baru</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="h-64 bg-slate-900 rounded-lg overflow-hidden border border-slate-200">
                  <iframe
                    src={api.getCertificateFileUrl(selectedCert.id)}
                    title="Pratinjau Bukti"
                    className="w-full h-full border-0 bg-white"
                  />
                </div>
              </div>

              {/* Point Scoring & Mandatory Match Form */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Penetapan Poin Sah SKEM (Bobot Pedoman)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={verificationPoints}
                      onChange={(e) => setVerificationPoints(parseInt(e.target.value, 10) || 0)}
                      className="w-28 px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                    <span className="text-xs text-slate-500">
                      (Estimasi mahasiswa: {selectedCert.estimatedPoints} Poin)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Kesesuaian 4 Kegiatan Wajib Kampus
                  </label>
                  <select
                    value={mandatoryMatch}
                    onChange={(e) => setMandatoryMatch(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="">Bukan Kegiatan Wajib (Ekstrakurikuler Umum)</option>
                    <option value="bnsp">★ Sertifikasi Profesi BNSP</option>
                    <option value="pkl">★ Magang / PKL Reguler</option>
                    <option value="pkkmb">★ PKKMB Polteksi</option>
                    <option value="lkmm">★ LKMM Pra TD / TD</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Catatan Verifikator BAAK (Wajib jika Revisi / Tolak)
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tuliskan catatan hasil pemeriksaan keabsahan dokumen, tanda tangan, atau instruksi perbaikan bagi mahasiswa..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              {/* Revision History */}
              {selectedCert.revisionHistory && selectedCert.revisionHistory.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                    <History className="w-3.5 h-3.5" />
                    <span>Riwayat Keputusan & Revisi</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedCert.revisionHistory.map((rev, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800">{rev.action}</span>
                          <span className="text-slate-500"> oleh {rev.by} ({rev.byRole})</span>
                          {rev.notes && <p className="text-slate-600 mt-0.5">{rev.notes}</p>}
                        </div>
                        <span className="text-slate-400 font-mono shrink-0 ml-3">
                          {new Date(rev.date).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Tutup Panel
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleVerifyAction('Ditolak')}
                  className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-60"
                >
                  Tolak Pengajuan
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleVerifyAction('Perlu Revisi')}
                  className="px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-60"
                >
                  Minta Revisi
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleVerifyAction('Disetujui')}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-60"
                >
                  {isProcessing ? 'Menyimpan...' : 'Setujui Pengajuan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
