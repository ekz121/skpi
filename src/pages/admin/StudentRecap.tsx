import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { User, CertificateItem } from '../../types.ts';
import { 
  Users, 
  Search, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Award, 
  GraduationCap, 
  Edit, 
  Save, 
  X, 
  AlertCircle,
  FileCheck2,
  Lock
} from 'lucide-react';

export const StudentRecap: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [prodiFilter, setProdiFilter] = useState('Semua');

  // Detail Modal
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Edit Academic Data State
  const [editNomorIjazah, setEditNomorIjazah] = useState('');
  const [editTanggalLulus, setEditTanggalLulus] = useState('');
  const [editGelar, setEditGelar] = useState('');
  const [editStatusKelulusan, setEditStatusKelulusan] = useState('Aktif');
  const [isSavingAcademic, setIsSavingAcademic] = useState(false);
  const [academicSuccessMsg, setAcademicSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminStudents();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetail = async (studentId: string) => {
    setIsLoadingDetail(true);
    setAcademicSuccessMsg(null);
    try {
      const detail = await api.getAdminStudentDetail(studentId);
      setSelectedStudentDetail(detail);
      setEditNomorIjazah(detail.student.nomorIjazah || '');
      setEditTanggalLulus(detail.student.tanggalLulus || '');
      setEditGelar(detail.student.gelar || '');
      setEditStatusKelulusan(detail.student.statusKelulusan || 'Aktif');
    } catch (err) {
      console.error('Failed to load student detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSaveAcademic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentDetail) return;

    setIsSavingAcademic(true);
    setAcademicSuccessMsg(null);

    try {
      const updatedUser = await api.updateStudentAcademic(selectedStudentDetail.student.id, {
        nomorIjazah: editNomorIjazah,
        tanggalLulus: editTanggalLulus,
        gelar: editGelar,
        statusKelulusan: editStatusKelulusan
      });

      setSelectedStudentDetail({
        ...selectedStudentDetail,
        student: updatedUser
      });

      setAcademicSuccessMsg('Data kelulusan akademik resmi berhasil diperbarui.');
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data akademik.');
    } finally {
      setIsSavingAcademic(false);
    }
  };

  const filtered = students.filter(s => {
    const matchSearch = !searchTerm ||
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prodi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchProdi = prodiFilter === 'Semua' || s.prodi === prodiFilter;

    return matchSearch && matchProdi;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Rekapitulasi Mahasiswa & Status Kelayakan SKPI
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Pantau seluruh capaian poin SKEM mahasiswa, verifikasi data kelulusan, dan status penerbitan SKPI.
        </p>

        {/* Search */}
        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama mahasiswa, NIM, atau program studi..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={prodiFilter}
              onChange={(e) => setProdiFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="Semua">Semua Program Studi</option>
              <option value="D4 Teknologi Rekayasa Perangkat Lunak">D4 RPL</option>
              <option value="D3 Manajemen Perusahaan">D3 Manajemen Perusahaan</option>
              <option value="D3 Teknik Mesin Industri">D3 Teknik Mesin Industri</option>
              <option value="D3 Akuntansi">D3 Akuntansi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-xs">Memuat rekapitulasi mahasiswa...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">Tidak ada data mahasiswa yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">NIM & Mahasiswa</th>
                  <th className="py-3.5 px-4">Program Studi</th>
                  <th className="py-3.5 px-4 text-center">Poin / Target</th>
                  <th className="py-3.5 px-4 text-center">Predikat</th>
                  <th className="py-3.5 px-4 text-center">4 Wajib</th>
                  <th className="py-3.5 px-4 text-center">Status SKPI</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{s.nama}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {s.nim} · Angk {s.angkatan}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-700">
                      {s.prodi}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="font-bold text-slate-900">{s.totalApprovedPoints}</span>
                      <span className="text-slate-400"> / {s.targetPoints}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {s.predicate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.mandatoryAllFulfilled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.mandatoryAllFulfilled ? 'Lengkap (4/4)' : 'Belum Lengkap'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.skpiStatus === 'Terbit' ? 'bg-emerald-600 text-white' :
                        s.skpiStatus === 'Diajukan' ? 'bg-blue-100 text-blue-800' :
                        s.skpiStatus === 'Dalam Pemeriksaan' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {s.skpiStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(s.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs"
                      >
                        Detail & Akademik
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Dossier & Academic Data Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Dossier Mahasiswa: {selectedStudentDetail.student.nama}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  NIM: {selectedStudentDetail.student.nim} · {selectedStudentDetail.student.prodi}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {academicSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{academicSuccessMsg}</span>
                </div>
              )}

              {/* Form: Official Academic Graduation Verification */}
              <form onSubmit={handleSaveAcademic} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Lock className="w-4 h-4 text-blue-700" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    Verifikasi Data Akademik Kelulusan (Oleh BAAK)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Nomor Seri Ijazah Resmi
                    </label>
                    <input
                      type="text"
                      value={editNomorIjazah}
                      onChange={(e) => setEditNomorIjazah(e.target.value)}
                      placeholder="POLTEKSI-D4-RPL-2026-0042"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Tanggal Yudisium / Kelulusan
                    </label>
                    <input
                      type="date"
                      value={editTanggalLulus}
                      onChange={(e) => setEditTanggalLulus(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Gelar yang Dianugerahkan
                    </label>
                    <input
                      type="text"
                      value={editGelar}
                      onChange={(e) => setEditGelar(e.target.value)}
                      placeholder="Contoh: S.Tr.Kom. atau A.Md.M."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Status Kelulusan
                    </label>
                    <select
                      value={editStatusKelulusan}
                      onChange={(e) => setEditStatusKelulusan(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Menunggu Yudisium">Menunggu Yudisium</option>
                      <option value="Lulus">Lulus</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingAcademic}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingAcademic ? 'Menyimpan...' : 'Simpan Verifikasi Akademik'}</span>
                  </button>
                </div>
              </form>

              {/* Certificates Dossier */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Seluruh Berkas Kegiatan Mahasiswa ({selectedStudentDetail.certificates.length})
                </h4>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Kegiatan</th>
                        <th className="py-2.5 px-3">Penyelenggara & Tgl</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Poin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStudentDetail.certificates.map((c: CertificateItem) => (
                        <tr key={c.id}>
                          <td className="py-2.5 px-3 max-w-xs truncate font-semibold text-slate-900">
                            {c.activityName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {c.organizer} ({c.activityDate})
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="font-bold text-[10px]">{c.status}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            {c.status === 'Disetujui' ? `+${c.approvedPoints}` : `(${c.estimatedPoints})`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Tutup Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
