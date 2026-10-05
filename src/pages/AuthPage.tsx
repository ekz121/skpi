import React, { useState } from 'react';
import { api } from '../lib/api.ts';
import { User } from '../types.ts';
import { STUDY_PROGRAMS } from '../server/rules.ts';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Hash, 
  BookOpen, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state (Mahasiswa only)
  const [regNama, setRegNama] = useState('');
  const [regNim, setRegNim] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regProdi, setRegProdi] = useState(STUDY_PROGRAMS[0]);
  const [regAngkatan, setRegAngkatan] = useState('2024');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.login(loginEmail, loginPassword);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.register({
        nama: regNama,
        nim: regNim,
        email: regEmail,
        prodi: regProdi,
        angkatan: parseInt(regAngkatan, 10),
        password: regPassword,
        confirmPassword: regConfirmPassword
      });

      setSuccessMsg('Pendaftaran mahasiswa berhasil! Mengarahkan ke dashboard...');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Pendaftaran gagal. Pastikan NIM dan Email belum pernah digunakan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for quick filling demo accounts
  const fillDemoAccount = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setIsRegistering(false);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Lockup */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-center text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          Politeknik Semen Indonesia
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Sistem Informasi SKEM & Penerbitan Otomatis SKPI Resmi
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-8 border border-slate-200">
          {/* Header Switcher */}
          <div className="border-b border-slate-200 pb-4 mb-5 text-center">
            <h3 className="text-base font-bold text-slate-900">
              {isRegistering ? 'Daftar Akun Mahasiswa' : 'Masuk ke Sistem Portal'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRegistering
                ? 'Lengkapi biodata akademik Anda untuk membuat akun mahasiswa baru.'
                : 'Satu pintu masuk untuk Mahasiswa dan Administrator BAAK.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form: Login */}
          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Terdaftar
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@student.polteksi.ac.id atau admin@polteksi.ac.id"
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun Anda"
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-colors"
                >
                  {isLoading ? 'Memverifikasi...' : 'Masuk ke Akun'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  Mahasiswa baru belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMsg(null);
                    }}
                    className="font-semibold text-blue-700 hover:text-blue-900 underline ml-1"
                  >
                    Daftar sebagai mahasiswa
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Form: Register (Mahasiswa Only) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Mahasiswa
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="block w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIM Mahasiswa
                  </label>
                  <div className="relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regNim}
                      onChange={(e) => setRegNim(e.target.value)}
                      placeholder="202401001"
                      className="block w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Angkatan
                  </label>
                  <select
                    value={regAngkatan}
                    onChange={(e) => setRegAngkatan(e.target.value)}
                    className="block w-full py-1.5 px-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                  >
                    <option value="2026">2026 (Target 500 Poin)</option>
                    <option value="2025">2025 (Target 500 Poin)</option>
                    <option value="2024">2024 (Target 500 Poin)</option>
                    <option value="2023">2023 (Target 500 Poin)</option>
                    <option value="2022">2022 (Target 300 Poin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Studi (Prodi)
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <select
                    value={regProdi}
                    onChange={(e) => setRegProdi(e.target.value)}
                    className="block w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                  >
                    {STUDY_PROGRAMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Kampus / Aktif
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama.nim@student.polteksi.ac.id"
                    className="block w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    className="block w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ulangi Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi"
                    className="block w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-blue-900">
                Pendaftaran publik otomatis diberikan hak akses <strong>Mahasiswa</strong>. Role admin dibuat khusus oleh pimpinan kampus.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {isLoading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setErrorMsg(null);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                >
                  Sudah punya akun? Kembali ke halaman login
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Akun Uji Coba Terdaftar (Klik untuk Isi Otomatis)</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@polteksi.ac.id', 'AdminPolteksi2026!')}
                className="w-full text-left p-2 rounded-lg bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200/80 flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Administrator BAAK</span>
                  </div>
                  <p className="text-[11px] text-amber-800 font-mono">admin@polteksi.ac.id</p>
                </div>
                <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                  Isi &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('siti.nurhaliza@student.polteksi.ac.id', 'Mahasiswa2026!')}
                className="w-full text-left p-2 rounded-lg bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-200/80 flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mahasiswa (Siti Nurhaliza - SKPI Ready)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-mono">siti.nurhaliza@student.polteksi.ac.id</p>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
                  Isi &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('ahmad.fauzi@student.polteksi.ac.id', 'Mahasiswa2026!')}
                className="w-full text-left p-2 rounded-lg bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200/80 flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-blue-950">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mahasiswa (Ahmad Fauzi - In Progress)</span>
                  </div>
                  <p className="text-[11px] text-blue-800 font-mono">ahmad.fauzi@student.polteksi.ac.id</p>
                </div>
                <span className="text-[10px] font-semibold bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded">
                  Isi &rarr;
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          © 2026 Politeknik Semen Indonesia. BAAK & Sistem Informasi Kemahasiswaan.
        </p>
      </div>
    </div>
  );
};
