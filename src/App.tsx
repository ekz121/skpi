/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, CertificateItem, SKPIRequest, StudentStats, AppNotification } from './types.ts';
import { api, authStorage } from './lib/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { NotificationModal } from './components/NotificationModal.tsx';
import { DocumentViewerModal } from './components/DocumentViewerModal.tsx';

// Pages
import { AuthPage } from './pages/AuthPage.tsx';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard.tsx';
import { UploadCertificate } from './pages/student/UploadCertificate.tsx';
import { SubmissionHistory } from './pages/student/SubmissionHistory.tsx';
import { PointsRecap } from './pages/student/PointsRecap.tsx';
import { Guidelines } from './pages/student/Guidelines.tsx';
import { SKPIPage } from './pages/student/SKPIPage.tsx';
import { ProfilePage } from './pages/student/ProfilePage.tsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { VerifyCertificates } from './pages/admin/VerifyCertificates.tsx';
import { StudentRecap } from './pages/admin/StudentRecap.tsx';
import { PublishSKPI } from './pages/admin/PublishSKPI.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(authStorage.getUser());
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Navigation State
  const [currentMenu, setCurrentMenu] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Document Viewer Modal State
  const [inspectCertificate, setInspectCertificate] = useState<CertificateItem | null>(null);

  // Data Caches
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [skpiRequest, setSkpiRequest] = useState<SKPIRequest | null>(null);
  const [adminStats, setAdminStats] = useState<any | null>(null);

  // On App Mount: Validate Session
  useEffect(() => {
    const checkSession = async () => {
      if (authStorage.getToken()) {
        try {
          const res = await api.getCurrentUser();
          setCurrentUser(res.user);
          // Set initial menu based on role
          if (res.user.role === 'admin') {
            setCurrentMenu('admin-dashboard');
          } else {
            setCurrentMenu('dashboard');
          }
        } catch {
          authStorage.clear();
          setCurrentUser(null);
        }
      }
      setIsLoadingAuth(false);
    };

    checkSession();

    const handleUnauthorized = () => {
      authStorage.clear();
      setCurrentUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // When currentUser changes, load data
  useEffect(() => {
    if (!currentUser) return;

    loadNotifications();

    if (currentUser.role === 'mahasiswa') {
      loadStudentData();
    } else if (currentUser.role === 'admin') {
      loadAdminData();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  const loadStudentData = async () => {
    try {
      const [stats, certs, skpi] = await Promise.all([
        api.getStudentStats(),
        api.getCertificates(),
        api.getSKPI()
      ]);
      setStudentStats(stats);
      setCertificates(certs);
      setSkpiRequest(skpi);
    } catch (err) {
      console.error('Failed to load student data:', err);
    }
  };

  const loadAdminData = async () => {
    try {
      const [astats, certs] = await Promise.all([
        api.getAdminStats(),
        api.getCertificates()
      ]);
      setAdminStats(astats);
      setCertificates(certs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentMenu('admin-dashboard');
    } else {
      setCurrentMenu('dashboard');
    }
  };

  const handleLogout = () => {
    authStorage.clear();
    setCurrentUser(null);
    setCurrentMenu('dashboard');
    setStudentStats(null);
    setCertificates([]);
    setSkpiRequest(null);
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigateFromLink = (link: string) => {
    if (link === '/riwayat') setCurrentMenu('history');
    else if (link === '/skpi') setCurrentMenu('skpi');
    else if (link === '/admin/verifikasi') setCurrentMenu('admin-verify');
    else if (link === '/admin/skpi') setCurrentMenu('admin-skpi');
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-slate-300">Memuat Portal SKEM & SKPI Politeknik Semen Indonesia...</p>
        </div>
      </div>
    );
  }

  // If not logged in -> Show Unified Auth Page
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getPageTitle = (menu: string) => {
    switch (menu) {
      case 'dashboard': return 'Dashboard Mahasiswa';
      case 'upload': return 'Unggah Sertifikat Kegiatan';
      case 'history': return 'Riwayat Pengajuan SKEM';
      case 'recap': return 'Rekapitulasi Poin & Predikat';
      case 'guidelines': return 'Pedoman SKEM & SKPI';
      case 'skpi': return 'Pengajuan & Unduh SKPI';
      case 'profile': return 'Profil & Pengaturan Akun';
      case 'admin-dashboard': return 'Dashboard Administrator';
      case 'admin-verify': return 'Verifikasi Berkas Sertifikat';
      case 'admin-students': return 'Rekapitulasi Mahasiswa';
      case 'admin-skpi': return 'Penerbitan Dokumen SKPI';
      default: return 'Portal BAAK Polteksi';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        user={currentUser}
        currentMenu={currentMenu}
        onSelectMenu={setCurrentMenu}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        pendingCount={adminStats?.pendingCertsCount}
        skpiPendingCount={adminStats?.pendingSkpiCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          user={currentUser}
          onLogout={handleLogout}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={unreadCount}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          currentTitle={getPageTitle(currentMenu)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Mahasiswa Views */}
          {currentUser.role === 'mahasiswa' && (
            <>
              {currentMenu === 'dashboard' && (
                <StudentDashboard
                  user={currentUser}
                  stats={studentStats}
                  recentCertificates={certificates}
                  skpiRequest={skpiRequest}
                  onNavigate={setCurrentMenu}
                  onViewCertificate={setInspectCertificate}
                />
              )}

              {currentMenu === 'upload' && (
                <UploadCertificate
                  onSuccess={(newCert) => {
                    loadStudentData();
                    loadNotifications();
                    setCurrentMenu('history');
                  }}
                  onCancel={() => setCurrentMenu('dashboard')}
                />
              )}

              {currentMenu === 'history' && (
                <SubmissionHistory
                  certificates={certificates}
                  onRefresh={loadStudentData}
                  onViewCertificate={setInspectCertificate}
                />
              )}

              {currentMenu === 'recap' && (
                <PointsRecap
                  user={currentUser}
                  stats={studentStats}
                  certificates={certificates}
                  onNavigateToSKPI={() => setCurrentMenu('skpi')}
                  onNavigateToUpload={() => setCurrentMenu('upload')}
                />
              )}

              {currentMenu === 'guidelines' && (
                <Guidelines />
              )}

              {currentMenu === 'skpi' && (
                <SKPIPage
                  user={currentUser}
                  stats={studentStats}
                  skpiRequest={skpiRequest}
                  onRefresh={loadStudentData}
                  onNavigateToUpload={() => setCurrentMenu('upload')}
                />
              )}

              {currentMenu === 'profile' && (
                <ProfilePage
                  user={currentUser}
                  onUpdateUser={(updated) => {
                    setCurrentUser(updated);
                    authStorage.setUser(updated);
                  }}
                />
              )}
            </>
          )}

          {/* Admin Views */}
          {currentUser.role === 'admin' && (
            <>
              {currentMenu === 'admin-dashboard' && (
                <AdminDashboard
                  user={currentUser}
                  adminStats={adminStats}
                  onNavigate={setCurrentMenu}
                  onViewCertificate={setInspectCertificate}
                />
              )}

              {currentMenu === 'admin-verify' && (
                <VerifyCertificates
                  certificates={certificates}
                  onRefresh={loadAdminData}
                />
              )}

              {currentMenu === 'admin-students' && (
                <StudentRecap />
              )}

              {currentMenu === 'admin-skpi' && (
                <PublishSKPI />
              )}
            </>
          )}
        </main>
      </div>

      {/* Notifications Drawer Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNavigateToLink={handleNavigateFromLink}
      />

      {/* Global Document Viewer Modal */}
      <DocumentViewerModal
        certificate={inspectCertificate}
        isOpen={!!inspectCertificate}
        onClose={() => setInspectCertificate(null)}
      />
    </div>
  );
}
