import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { SKPIRequest } from '../../types.ts';
import { SKPIDocumentView } from '../../components/SKPIDocumentView.tsx';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  XCircle, 
  Eye, 
  Download, 
  Send, 
  X, 
  ShieldCheck, 
  Lock, 
  Printer, 
  RefreshCw,
  FileCheck
} from 'lucide-react';

export const PublishSKPI: React.FC = () => {
  const [requests, setRequests] = useState<SKPIRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Active Review / Publishing Workspace
  const [activeRequest, setActiveRequest] = useState<SKPIRequest | null>(null);
  const [previewSnapshot, setPreviewSnapshot] = useState<any | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSKPI();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load SKPI requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWorkspace = async (req: SKPIRequest) => {
    setActiveRequest(req);
    setReviewNotes(req.adminNotes || '');
    setActionError(null);
    setIsLoadingPreview(true);

    try {
      if (req.status === 'Terbit' && req.snapshotData) {
        setPreviewSnapshot(req.snapshotData);
      } else {
        const preview = await api.getSKPIPreview(req.studentId);
        setPreviewSnapshot(preview);
      }
    } catch (err) {
      console.error('Failed to load preview for workspace:', err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleReviewAction = async (status: 'Dalam Pemeriksaan' | 'Perlu Revisi' | 'Ditolak') => {
    if (!activeRequest) return;
    setActionError(null);

    if ((status === 'Perlu Revisi' || status === 'Ditolak') && !reviewNotes.trim()) {
      setActionError('Wajib menuliskan catatan untuk mahasiswa saat revisi atau tolak.');
      return;
    }

    try {
      const updated = await api.reviewSKPI(activeRequest.id, {
        status,
        adminNotes: reviewNotes
      });
      setActiveRequest(updated);
      loadRequests();
    } catch (err: any) {
      setActionError(err.message || 'Gagal mengubah status review.');
    }
  };

  const handlePublish = async () => {
    if (!activeRequest) return;
    setActionError(null);
    setIsPublishing(true);

    try {
      const published = await api.publishSKPI(activeRequest.id);
      setActiveRequest(published);
      if (published.snapshotData) {
        setPreviewSnapshot(published.snapshotData);
      }
      loadRequests();
    } catch (err: any) {
      setActionError(err.message || 'Gagal menerbitkan SKPI.');
    } finally {
      setIsPublishing(false);
    }
  };

  const filtered = requests.filter(r => {
    const matchSearch = !searchTerm ||
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentNim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.documentNumber && r.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'Semua' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
              Verifikasi kelengkapan yudisium mahasiswa dan terbitkan dokumen resmi SKPI dengan nomor dokumen permanen.
            </p>
          </div>

          <button
            onClick={loadRequests}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan Antrean</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama mahasiswa, NIM, atau nomor dokumen SKPI..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="Semua">Semua Status</option>
              <option value="Diajukan">Diajukan</option>
              <option value="Dalam Pemeriksaan">Dalam Pemeriksaan</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
              <option value="Ditolak">Ditolak</option>
              <option value="Terbit">Terbit</option>
            </select>
          </div>
        </div>
      </div>

      {/* SKPI Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-xs">Memuat permohonan SKPI...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">Tidak ada permohonan SKPI yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Nama Mahasiswa</th>
                  <th className="py-3.5 px-4">Program Studi</th>
                  <th className="py-3.5 px-4">Tanggal Pengajuan</th>
                  <th className="py-3.5 px-4">Nomor Dokumen SKPI</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{req.studentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{req.studentNim}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {req.studentProdi}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(req.submissionDate).toLocaleDateString('id-ID')}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {req.documentNumber || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'Terbit' ? 'bg-emerald-600 text-white' :
                        req.status === 'Diajukan' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'Dalam Pemeriksaan' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'Perlu Revisi' ? 'bg-purple-100 text-purple-800' :
                        req.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenWorkspace(req)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                      >
                        {req.status === 'Terbit' ? 'Lihat Dokumen' : 'Periksa & Terbitkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Publishing Workspace Modal */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-xs">
          <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    activeRequest.status === 'Terbit' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950'
                  }`}>
                    {activeRequest.status}
                  </span>
                  <h3 className="text-sm font-bold tracking-tight">
                    Workspace Penerbitan SKPI: {activeRequest.studentName} ({activeRequest.studentNim})
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Program Studi: {activeRequest.studentProdi} · Angkatan {activeRequest.studentAngkatan}
                </p>
              </div>

              <button
                onClick={() => setActiveRequest(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-md"
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

              {/* Status & Review Notes Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Verifikasi & Catatan Pemeriksaan
                </h4>

                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Tuliskan catatan pemeriksaan kelulusan atau instruksi revisi..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  {activeRequest.status !== 'Terbit' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReviewAction('Dalam Pemeriksaan')}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg"
                      >
                        Set: Dalam Pemeriksaan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewAction('Perlu Revisi')}
                        className="px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg"
                      >
                        Minta Revisi Mahasiswa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewAction('Ditolak')}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg"
                      >
                        Tolak Permohonan
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Live Accurate Document Viewer */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Lembar Pratinjau Dokumen SKPI Resmi
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {activeRequest.status === 'Terbit' ? 'Dokumen Final Terkunci' : 'Status Draf Pratinjau'}
                  </span>
                </div>

                {isLoadingPreview ? (
                  <div className="py-16 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-xs">Menyiapkan pratinjau dokumen...</p>
                  </div>
                ) : previewSnapshot ? (
                  <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                    <SKPIDocumentView
                      snapshot={previewSnapshot}
                      documentNumber={activeRequest.documentNumber || 'SKPI/POLTEKSI/2026/DRAF'}
                      isDraft={activeRequest.status !== 'Terbit'}
                      publishedAt={activeRequest.publishedAt}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Pratinjau tidak dapat dimuat.</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setActiveRequest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Tutup Panel
              </button>

              {activeRequest.status !== 'Terbit' ? (
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-60 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isPublishing ? 'Menerbitkan Dokumen...' : 'Terbitkan Dokumen Final SKPI'}</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dokumen SKPI ini telah terbit dan tersimpan permanen</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
