import React, { useState } from 'react';
import { User } from '../../types.ts';
import { api } from '../../lib/api.ts';
import { 
  UserCircle, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar 
} from 'lucide-react';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  const [tempatLahir, setTempatLahir] = useState(user.tempatLahir || '');
  const [tanggalLahir, setTanggalLahir] = useState(user.tanggalLahir || '');
  const [telepon, setTelepon] = useState(user.telepon || '');
  const [alamat, setAlamat] = useState(user.alamat || '');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.updateProfile({
        tempatLahir,
        tanggalLahir,
        telepon,
        alamat
      });
      onUpdateUser(res.user);
      setSuccessMsg('Biodata profil berhasil disimpan.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Profil & Biodata Mahasiswa
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Lengkapi data diri Anda secara akurat untuk keperluan pencetakan dokumen resmi SKPI.
        </p>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Identity Read-only */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Nama Lengkap (Sesuai Ijazah)</span>
              <span className="font-bold text-slate-900">{user.nama}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Nomor Induk Mahasiswa (NIM)</span>
              <span className="font-bold font-mono text-slate-900">{user.nim}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Program Studi</span>
              <span className="font-semibold text-slate-800">{user.prodi}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tahun Angkatan</span>
              <span className="font-semibold text-slate-800">{user.angkatan}</span>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                required
                value={tempatLahir}
                onChange={(e) => setTempatLahir(e.target.value)}
                placeholder="Contoh: Gresik"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                required
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="08123456789"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Domisili Lengkap
            </label>
            <textarea
              rows={2}
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Jl. Raya Semen No..., Gresik"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Academic Verification Box */}
          <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Data Kelulusan Resmi (Hanya Dapat Diverifikasi oleh BAAK)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Nomor Seri Ijazah</span>
                <span className="font-mono font-medium text-slate-800">{user.nomorIjazah || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tanggal Kelulusan</span>
                <span className="font-mono font-medium text-slate-800">{user.tanggalLulus || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gelar Akademik</span>
                <span className="font-medium text-slate-800">{user.gelar || '-'}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-60 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
