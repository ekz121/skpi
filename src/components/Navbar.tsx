import React from 'react';
import { User, AppNotification } from '../types.ts';
import { Bell, LogOut, ShieldCheck, GraduationCap, Menu, Building2 } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onToggleMobileMenu: () => void;
  currentTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenNotifications,
  unreadNotificationsCount,
  onToggleMobileMenu,
  currentTitle
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200">
      {/* Zone 1: Mobile toggle & Breadcrumb title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-slate-600 rounded-lg md:hidden hover:bg-slate-100 focus:outline-none"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {user.role === 'admin' ? 'Portal Admin BAAK' : 'Portal Mahasiswa'}
          </span>
          <span className="hidden sm:inline-block text-slate-300">/</span>
          <h1 className="text-base font-semibold text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-md">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Zone 2: Institution Trust Wordmark */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
        <Building2 className="w-4 h-4 text-blue-800" />
        <span className="font-medium text-slate-700">Politeknik Semen Indonesia</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>Gresik, Jawa Timur</span>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Notifikasi"
          aria-label="Lihat Notifikasi"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Role & Name */}
        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs tracking-wider">
            {user.role === 'admin' ? (
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            ) : (
              <GraduationCap className="w-4 h-4 text-blue-300" />
            )}
          </div>
          <div className="text-left text-xs leading-tight">
            <p className="font-semibold text-slate-900 truncate max-w-[140px]">{user.nama}</p>
            <p className="text-slate-500 font-mono">
              {user.role === 'admin' ? 'Administrator' : `NIM: ${user.nim || '-'}`}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors"
          title="Keluar dari sistem"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
