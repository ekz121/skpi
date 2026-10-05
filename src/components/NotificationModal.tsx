import React from 'react';
import { AppNotification } from '../types.ts';
import { X, CheckCircle, AlertTriangle, Info, Bell, CheckCheck } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToLink?: (link: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateToLink
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Notifikasi Sistem</h3>
              <p className="text-xs text-slate-500">Pemberitahuan verifikasi sertifikat & SKPI</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium px-2 py-1 rounded-md hover:bg-blue-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
              <p className="text-xs">Tidak ada notifikasi saat ini.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.isRead;
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (isUnread) onMarkAsRead(notif.id);
                    if (notif.link && onNavigateToLink) {
                      onNavigateToLink(notif.link);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-lg transition-colors cursor-pointer flex items-start gap-3 ${
                    isUnread ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5">
                    {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                    {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {notif.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    {notif.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-xs ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    {notif.link && (
                      <span className="inline-block mt-1 text-[11px] font-semibold text-blue-700 hover:underline">
                        Buka Halaman &rarr;
                      </span>
                    )}
                  </div>

                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Tutup Notifikasi
          </button>
        </div>
      </div>
    </div>
  );
};
