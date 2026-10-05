import React from 'react';
import { User } from '../types.ts';
import { 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  Award, 
  BookOpen, 
  FileCheck2, 
  UserCircle, 
  CheckSquare, 
  Users, 
  FileText,
  X,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  user: User;
  currentMenu: string;
  onSelectMenu: (menuKey: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingCount?: number;
  skpiPendingCount?: number;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  currentMenu,
  onSelectMenu,
  isOpenMobile,
  onCloseMobile,
  pendingCount = 0,
  skpiPendingCount = 0
}) => {
  const isMahasiswa = user.role === 'mahasiswa';

  const studentMenus: MenuItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'upload', label: 'Unggah Sertifikat', icon: UploadCloud },
    { key: 'history', label: 'Riwayat Pengajuan', icon: History },
    { key: 'recap', label: 'Rekap Poin', icon: Award },
    { key: 'guidelines', label: 'Panduan', icon: BookOpen },
    { key: 'skpi', label: 'Pengajuan & Unduh SKPI', icon: FileCheck2 },
    { key: 'profile', label: 'Profil & Akun', icon: UserCircle },
  ];

  const adminMenus: MenuItem[] = [
    { key: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'admin-verify', label: 'Verifikasi Sertifikat', icon: CheckSquare, badge: pendingCount },
    { key: 'admin-students', label: 'Rekap Mahasiswa', icon: Users },
    { key: 'admin-skpi', label: 'Penerbitan SKPI', icon: FileText, badge: skpiPendingCount },
  ];

  const menus = isMahasiswa ? studentMenus : adminMenus;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-200 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div className="flex items-center justify-between h-16 px-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-base shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>SKEM & SKPI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Politeknik Semen Indonesia</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-md md:hidden hover:bg-slate-800"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Preview in Sidebar */}
        <div className="p-4 mx-3 my-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            {isMahasiswa ? 'Akun Mahasiswa' : 'Hak Akses Administrator'}
          </p>
          <p className="text-sm font-semibold text-white truncate">{user.nama}</p>
          {isMahasiswa ? (
            <p className="text-xs text-blue-300 font-mono mt-0.5">{user.nim} · {user.prodi || 'Polteksi'}</p>
          ) : (
            <p className="text-xs text-amber-300 font-mono mt-0.5">BAAK & Kemahasiswaan</p>
          )}
        </div>

        {/* Navigation Links */}
        <div className="px-3 pt-2">
          <p className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menus.map((item) => {
            const Icon = item.icon;
            const isActive = currentMenu === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectMenu(item.key);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 text-[11px] text-slate-400 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <span>Sistem Versi 2026.1</span>
            <span className="font-mono text-[10px] text-slate-400">POLTEKSI</span>
          </div>
        </div>
      </aside>
    </>
  );
};
