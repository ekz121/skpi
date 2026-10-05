import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  User, 
  CertificateItem, 
  SKPIRequest, 
  AppNotification, 
  AuditLog, 
  StudentStats, 
  MandatoryActivityKey, 
  MandatoryItemStatus,
  UserRole
} from '../types.ts';
import { 
  MANDATORY_ACTIVITIES_SPEC, 
  getTargetPointsForAngkatan, 
  getPredicateForPoints,
  PROGRAM_LEARNING_OUTCOMES
} from './rules.ts';

interface DatabaseSchema {
  users: User[];
  userCredentials: Record<string, { salt: string; hash: string }>; // userId -> hash
  certificates: CertificateItem[];
  skpiRequests: SKPIRequest[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  config: {
    systemName: string;
    rulesVersion: string;
    lastDocumentSequence: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    this.seedDefaultsIfEmpty();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to read db file, initializing new data structure:', err);
      }
    }
    return {
      users: [],
      userCredentials: {},
      certificates: [],
      skpiRequests: [],
      notifications: [],
      auditLogs: [],
      config: {
        systemName: 'Sistem SKEM dan SKPI Politeknik Semen Indonesia',
        rulesVersion: '2026.1',
        lastDocumentSequence: 100
      }
    };
  }

  private save(): void {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  private seedDefaultsIfEmpty(): void {
    // If no users exist, seed initial admin and demonstration students
    if (this.data.users.length === 0) {
      console.log('Seeding initial database with default Admin and test accounts...');

      // 1. Seed Admin
      const adminId = 'usr_admin_001';
      const adminSalt = crypto.randomBytes(16).toString('hex');
      const adminUser: User = {
        id: adminId,
        role: 'admin',
        email: 'admin@polteksi.ac.id',
        nama: 'Administrator BAAK & Kemahasiswaan Polteksi',
        createdAt: new Date().toISOString()
      };
      this.data.users.push(adminUser);
      this.data.userCredentials[adminId] = {
        salt: adminSalt,
        hash: hashPassword('AdminPolteksi2026!', adminSalt)
      };

      // 2. Seed Student 1 (Angkatan 2023 - in progress)
      const student1Id = 'usr_std_202301';
      const s1Salt = crypto.randomBytes(16).toString('hex');
      const student1: User = {
        id: student1Id,
        role: 'mahasiswa',
        email: 'ahmad.fauzi@student.polteksi.ac.id',
        nama: 'Ahmad Fauzi',
        nim: '202301045',
        prodi: 'D4 Teknologi Rekayasa Perangkat Lunak',
        angkatan: 2023,
        tempatLahir: 'Gresik',
        tanggalLahir: '2004-05-14',
        telepon: '081234567890',
        alamat: 'Jl. RA Kartini No. 45, Kebomas, Gresik',
        gelar: 'S.Tr.Kom.',
        statusKelulusan: 'Aktif',
        createdAt: new Date().toISOString()
      };
      this.data.users.push(student1);
      this.data.userCredentials[student1Id] = {
        salt: s1Salt,
        hash: hashPassword('Mahasiswa2026!', s1Salt)
      };

      // 3. Seed Student 2 (Angkatan 2022 - eligible for SKPI, target 300)
      const student2Id = 'usr_std_202202';
      const s2Salt = crypto.randomBytes(16).toString('hex');
      const student2: User = {
        id: student2Id,
        role: 'mahasiswa',
        email: 'siti.nurhaliza@student.polteksi.ac.id',
        nama: 'Siti Nurhaliza',
        nim: '202202018',
        prodi: 'D3 Manajemen Perusahaan',
        angkatan: 2022,
        tempatLahir: 'Surabaya',
        tanggalLahir: '2003-11-20',
        telepon: '085712349876',
        alamat: 'Perumahan Semen Gresik Blok C-12, Gresik',
        nomorIjazah: 'POLTEKSI-D3-MP-2026-0042',
        tanggalLulus: '2026-08-25',
        gelar: 'A.Md.M.',
        statusKelulusan: 'Lulus',
        createdAt: new Date().toISOString()
      };
      this.data.users.push(student2);
      this.data.userCredentials[student2Id] = {
        salt: s2Salt,
        hash: hashPassword('Mahasiswa2026!', s2Salt)
      };

      // Seed Student 1 Certificates (variety of statuses)
      const now = new Date().toISOString();
      const s1Certs: CertificateItem[] = [
        {
          id: 'cert_s1_01',
          studentId: student1Id,
          studentName: student1.nama,
          studentNim: student1.nim!,
          studentProdi: student1.prodi!,
          studentAngkatan: student1.angkatan!,
          categoryId: 'pelatihan',
          subcategoryId: 'pelatihan_bnsp',
          activityName: 'Sertifikasi Kompetensi BNSP Pemrograman Web (Junior Web Developer)',
          organizer: 'LSP Teknologi Informasi & Komunikasi Indonesia',
          activityDate: '2024-08-15',
          academicYear: '2024/2025 Ganjil',
          certificateNumber: 'BNSP-LSPTIK-2024-09881',
          verificationUrl: 'https://bnsp.go.id/verifikasi/09881',
          fileName: 'sertifikat_bnsp_ahmad.pdf',
          filePath: 'sample_proof.pdf',
          fileMimeType: 'application/pdf',
          fileSize: 425000,
          estimatedPoints: 100,
          approvedPoints: 100,
          status: 'Disetujui',
          isMandatoryMatch: 'bnsp',
          reviewerAdminId: adminId,
          reviewerAdminName: adminUser.nama,
          reviewedAt: '2024-09-02T10:15:00Z',
          revisionHistory: [{
            date: '2024-09-02T10:15:00Z',
            action: 'Disetujui',
            notes: 'Dokumen keabsahan BNSP valid dan terverifikasi.',
            by: adminUser.nama,
            byRole: 'admin'
          }],
          ruleVersion: '2026.1',
          createdAt: '2024-09-01T08:00:00Z',
          updatedAt: '2024-09-02T10:15:00Z'
        },
        {
          id: 'cert_s1_02',
          studentId: student1Id,
          studentName: student1.nama,
          studentNim: student1.nim!,
          studentProdi: student1.prodi!,
          studentAngkatan: student1.angkatan!,
          categoryId: 'pelatihan',
          subcategoryId: 'pelatihan_pkkmb',
          activityName: 'Pengenalan Kehidupan Kampus Mahasiswa Baru (PKKMB) Polteksi 2023',
          organizer: 'Politeknik Semen Indonesia',
          activityDate: '2023-09-05',
          academicYear: '2023/2024 Ganjil',
          certificateNumber: 'PKKMB/POLTEKSI/2023/045',
          fileName: 'pkkmb_polteksi_2023.pdf',
          filePath: 'sample_proof.pdf',
          fileMimeType: 'application/pdf',
          fileSize: 310000,
          estimatedPoints: 50,
          approvedPoints: 50,
          status: 'Disetujui',
          isMandatoryMatch: 'pkkmb',
          reviewerAdminId: adminId,
          reviewerAdminName: adminUser.nama,
          reviewedAt: '2023-09-20T14:30:00Z',
          revisionHistory: [{
            date: '2023-09-20T14:30:00Z',
            action: 'Disetujui',
            notes: 'Sertifikat resmi PKKMB Polteksi.',
            by: adminUser.nama,
            byRole: 'admin'
          }],
          ruleVersion: '2026.1',
          createdAt: '2023-09-18T09:00:00Z',
          updatedAt: '2023-09-20T14:30:00Z'
        },
        {
          id: 'cert_s1_03',
          studentId: student1Id,
          studentName: student1.nama,
          studentNim: student1.nim!,
          studentProdi: student1.prodi!,
          studentAngkatan: student1.angkatan!,
          categoryId: 'prestasi',
          subcategoryId: 'prestasi_nasional_juara3',
          activityName: 'Lomba Cipta Aplikasi IoT Industri Semen Tingkat Nasional',
          organizer: 'Kementerian Perindustrian & PT Semen Indonesia',
          activityDate: '2024-11-10',
          academicYear: '2024/2025 Ganjil',
          certificateNumber: 'PII-IOT-2024-03',
          fileName: 'iot_award_national.pdf',
          filePath: 'sample_proof.pdf',
          fileMimeType: 'application/pdf',
          fileSize: 520000,
          estimatedPoints: 60,
          approvedPoints: 60,
          status: 'Disetujui',
          reviewerAdminId: adminId,
          reviewerAdminName: adminUser.nama,
          reviewedAt: '2024-11-25T11:00:00Z',
          revisionHistory: [{
            date: '2024-11-25T11:00:00Z',
            action: 'Disetujui',
            notes: 'Prestasi Juara 3 tingkat nasional.',
            by: adminUser.nama,
            byRole: 'admin'
          }],
          ruleVersion: '2026.1',
          createdAt: '2024-11-20T10:00:00Z',
          updatedAt: '2024-11-25T11:00:00Z'
        },
        {
          id: 'cert_s1_04',
          studentId: student1Id,
          studentName: student1.nama,
          studentNim: student1.nim!,
          studentProdi: student1.prodi!,
          studentAngkatan: student1.angkatan!,
          categoryId: 'organisasi',
          subcategoryId: 'org_hima_anggota',
          activityName: 'Pengurus Divisi Kominfo Himpunan Mahasiswa Rekayasa Perangkat Lunak',
          organizer: 'HIMA RPL Politeknik Semen Indonesia',
          activityDate: '2024-10-01',
          academicYear: '2024/2025 Ganjil',
          fileName: 'sk_pengurus_hima_rpl.pdf',
          filePath: 'sample_proof.pdf',
          fileMimeType: 'application/pdf',
          fileSize: 450000,
          estimatedPoints: 30,
          approvedPoints: 0,
          status: 'Menunggu Verifikasi',
          revisionHistory: [{
            date: now,
            action: 'Pengajuan Baru',
            notes: 'Menunggu verifikasi admin BAAK.',
            by: student1.nama,
            byRole: 'mahasiswa'
          }],
          ruleVersion: '2026.1',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'cert_s1_05',
          studentId: student1Id,
          studentName: student1.nama,
          studentNim: student1.nim!,
          studentProdi: student1.prodi!,
          studentAngkatan: student1.angkatan!,
          categoryId: 'pelatihan',
          subcategoryId: 'pelatihan_lkmm',
          activityName: 'Latihan Keterampilan Manajemen Mahasiswa (LKMM) Pra TD',
          organizer: 'Kemenristekdikti & Polteksi',
          activityDate: '2024-03-12',
          academicYear: '2023/2024 Genap',
          fileName: 'lkmm_sertifikat_scan.pdf',
          filePath: 'sample_proof.pdf',
          fileMimeType: 'application/pdf',
          fileSize: 320000,
          estimatedPoints: 40,
          approvedPoints: 0,
          status: 'Perlu Revisi',
          isMandatoryMatch: 'lkmm',
          adminNotes: 'Mohon unggah scan sertifikat yang jelas menampilkan tanda tangan Wakil Direktur serta lampiran SK kelulusan LKMM.',
          reviewerAdminId: adminId,
          reviewerAdminName: adminUser.nama,
          reviewedAt: '2024-03-25T13:00:00Z',
          revisionHistory: [{
            date: '2024-03-25T13:00:00Z',
            action: 'Minta Revisi',
            notes: 'Scan buram pada bagian stempel dan tanda tangan.',
            by: adminUser.nama,
            byRole: 'admin'
          }],
          ruleVersion: '2026.1',
          createdAt: '2024-03-20T08:00:00Z',
          updatedAt: '2024-03-25T13:00:00Z'
        }
      ];
      this.data.certificates.push(...s1Certs);

      // Seed Student 2 (Siti Nurhaliza - fully approved 4 mandatory activities + 320 pts > 300 target)
      const s2Certs: CertificateItem[] = [
        {
          id: 'cert_s2_01',
          studentId: student2Id,
          studentName: student2.nama,
          studentNim: student2.nim!,
          studentProdi: student2.prodi!,
          studentAngkatan: student2.angkatan!,
          categoryId: 'pelatihan',
          subcategoryId: 'pelatihan_bnsp',
          activityName: 'Sertifikasi BNSP Skema Manajemen Administrasi Perkantoran',
          organizer: 'LSP Administrasi Bisnis Indonesia',
          activityDate: '2024-06-10',
          academicYear: '2023/2024 Genap',
          certificateNumber: 'BNSP-ADM-2024-7712',
          fileName: 'sertifikat_bnsp_siti.pdf',
          filePath: 'sample_proof.pdf',
          fileMimeType: 'application/pdf',
          fileSize: 390000,
          estimatedPoints: 100,
          approvedPoints: 100,
          status: 'Disetujui',
          isMandatoryMatch: 'bnsp',
          reviewerAdminId: adminId,
          reviewerAdminName: adminUser.nama,
          reviewedAt: '2024-06-20T10:00:00Z',
          revisionHistory: [{
            date: '2024-06-20T10:00:00Z',
            action: 'Disetujui',
            notes: 'Sertifikasi BNSP terverifikasi sah.',
            by: adminUser.nama,
            byRole: 'admin'
          }],
          ruleVersion: '2026.1',
          createdAt: '2024-06-15T09:00:00Z',
          updatedAt: '2024-06-20T10:00:00Z'
        },
        {
          id: 'cert_s2_02',
          studentId: student2Id,
          studentName: student2.nama,
          studentNim: student2.nim!,
          studentProdi: student2.prodi!,
          studentAngkatan: student2.angkatan!,
          categoryId: 'pelatihan',
          subcategoryId: 'pelatihan_magang_pkl',
          activityName: 'Magang Industri 6 Bulan di Divisi Supply Chain & Logistik',
          organizer: 'PT Semen Indonesia Logistik (SILOG) Gresik',
          activityDate: '2025-01-15',
          academicYear: '2024/2025 Ganjil',
          certificateNumber: 'MAGANG/SILOG/2025/089',
          fileName: 'sertifikat_magang_silog.pdf',
          filePath: 'sample_proof.pdf',
          fileMimeType: 'application/pdf',
          fileSize: 480000,
          estimatedPoints: 100,
          approvedPoints: 100,
          status: 'Disetujui',
          isMandatoryMatch: 'pkl',
          reviewerAdminId: adminId,
          reviewerAdminName: adminUser.nama,
          reviewedAt: '2025-01-25T11:30:00Z',
          revisionHistory: [{
            date: '2025-01-25T11:30:00Z',
            action: 'Disetujui',
            notes: 'Magang industri reguler 6 bulan memenuhi syarat wajib PKL.',
            by: adminUser.nama,
            byRole: 'admin'
          }],
          ruleVersion: '2026.1',
          createdAt: '2025-01-20T08:00:00Z',
          updatedAt: '2025-01-25T11:30:00Z'
        },
        {
          id: 'cert_s2_03',
          studentId: student2Id,
          studentName: student2.nama,
          studentNim: student2.nim!,
          studentProdi: student2.prodi!,
          studentAngkatan: student2.angkatan!,
          categoryId: 'pelatihan',
          subcategoryId: 'pelatihan_pkkmb',
          activityName: 'PKKMB Politeknik Semen Indonesia Angkatan 2022',
          organizer: 'Politeknik Semen Indonesia',
          activityDate: '2022-09-08',
          academicYear: '2022/2023 Ganjil',
          certificateNumber: 'PKKMB/POLTEKSI/2022/112',
          fileName: 'pkkmb_polteksi_2022.pdf',
          filePath: 'sample_proof.pdf',
          fileMimeType: 'application/pdf',
          fileSize: 280000,
          estimatedPoints: 50,
          approvedPoints: 50,
          status: 'Disetujui',
          isMandatoryMatch: 'pkkmb',
          reviewerAdminId: adminId,
          reviewerAdminName: adminUser.nama,
          reviewedAt: '2022-09-22T09:00:00Z',
          revisionHistory: [{
            date: '2022-09-22T09:00:00Z',
            action: 'Disetujui',
            notes: 'Kegiatan wajib PKKMB selesai.',
            by: adminUser.nama,
            byRole: 'admin'
          }],
          ruleVersion: '2026.1',
          createdAt: '2022-09-20T10:00:00Z',
          updatedAt: '2022-09-22T09:00:00Z'
        },
        {
          id: 'cert_s2_04',
          studentId: student2Id,
          studentName: student2.nama,
          studentNim: student2.nim!,
          studentProdi: student2.prodi!,
          studentAngkatan: student2.angkatan!,
          categoryId: 'pelatihan',
          subcategoryId: 'pelatihan_lkmm',
          activityName: 'Latihan Keterampilan Manajemen Mahasiswa Tingkat Dasar (LKMM TD)',
          organizer: 'BEM Politeknik Semen Indonesia',
          activityDate: '2023-04-18',
          academicYear: '2022/2023 Genap',
          certificateNumber: 'LKMM-TD/POLTEKSI/2023/024',
          fileName: 'lkmm_td_siti.pdf',
          filePath: 'sample_proof.pdf',
          fileMimeType: 'application/pdf',
          fileSize: 310000,
          estimatedPoints: 60,
          approvedPoints: 60,
          status: 'Disetujui',
          isMandatoryMatch: 'lkmm',
          reviewerAdminId: adminId,
          reviewerAdminName: adminUser.nama,
          reviewedAt: '2023-04-30T10:00:00Z',
          revisionHistory: [{
            date: '2023-04-30T10:00:00Z',
            action: 'Disetujui',
            notes: 'LKMM TD memenuhi syarat kepemimpinan wajib.',
            by: adminUser.nama,
            byRole: 'admin'
          }],
          ruleVersion: '2026.1',
          createdAt: '2023-04-25T14:00:00Z',
          updatedAt: '2023-04-30T10:00:00Z'
        },
        {
          id: 'cert_s2_05',
          studentId: student2Id,
          studentName: student2.nama,
          studentNim: student2.nim!,
          studentProdi: student2.prodi!,
          studentAngkatan: student2.angkatan!,
          categoryId: 'projek',
          subcategoryId: 'projek_pengabdian_kkn',
          activityName: 'Pengabdian Masyarakat: Digitalisasi UMKM Mitra Semen Indonesia di Gresik',
          organizer: 'P3M Politeknik Semen Indonesia',
          activityDate: '2024-08-20',
          academicYear: '2024/2025 Ganjil',
          fileName: 'pengabdian_umkm_gresik.pdf',
          filePath: 'sample_proof.pdf',
          fileMimeType: 'application/pdf',
          fileSize: 420000,
          estimatedPoints: 50,
          approvedPoints: 50,
          status: 'Disetujui',
          reviewerAdminId: adminId,
          reviewerAdminName: adminUser.nama,
          reviewedAt: '2024-09-01T15:00:00Z',
          revisionHistory: [{
            date: '2024-09-01T15:00:00Z',
            action: 'Disetujui',
            notes: 'Pengabdian masyarakat terverifikasi.',
            by: adminUser.nama,
            byRole: 'admin'
          }],
          ruleVersion: '2026.1',
          createdAt: '2024-08-28T09:00:00Z',
          updatedAt: '2024-09-01T15:00:00Z'
        }
      ];
      this.data.certificates.push(...s2Certs);

      // Add welcome notification for students
      this.data.notifications.push(
        {
          id: 'notif_001',
          userId: student1Id,
          title: 'Selamat Datang di Portal SKEM & SKPI Polteksi',
          message: 'Silakan periksa rekap poin dan lengkapi pengajuan sertifikat kegiatan Anda.',
          type: 'info',
          isRead: false,
          createdAt: now
        },
        {
          id: 'notif_002',
          userId: student1Id,
          title: 'Pengajuan Memerlukan Revisi',
          message: 'Pengajuan LKMM Pra TD Anda memerlukan perbaikan dokumen. Silakan cek Riwayat Pengajuan.',
          type: 'warning',
          isRead: false,
          link: '/riwayat',
          createdAt: now
        },
        {
          id: 'notif_003',
          userId: student2Id,
          title: 'Selamat! Anda Memenuhi Syarat Pengajuan SKPI',
          message: 'Poin SKEM Anda (360) telah melampaui target (300) dan seluruh 4 kegiatan wajib terpenuhi. Anda dapat mengajukan SKPI sekarang.',
          type: 'success',
          isRead: false,
          link: '/skpi',
          createdAt: now
        },
        {
          id: 'notif_004',
          userId: adminId,
          title: 'Pengajuan Sertifikat Menunggu Verifikasi',
          message: 'Terdapat 1 pengajuan sertifikat baru dari Ahmad Fauzi menunggu verifikasi Anda.',
          type: 'info',
          isRead: false,
          link: '/admin/verifikasi',
          createdAt: now
        }
      );

      this.save();
      console.log('Seeding completed successfully!');
    }
  }

  // --- Auth & User Management ---

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByNim(nim: string): User | undefined {
    return this.data.users.find(u => u.nim === nim);
  }

  public verifyPassword(user: User, passAttempt: string): boolean {
    const cred = this.data.userCredentials[user.id];
    if (!cred) return false;
    const computedHash = hashPassword(passAttempt, cred.salt);
    return computedHash === cred.hash;
  }

  public registerStudent(data: {
    nama: string;
    nim: string;
    email: string;
    prodi: string;
    angkatan: number;
    password: string;
    role?: any; // To guarantee protection against role escalation
  }): { success: boolean; user?: User; error?: string } {
    // Explicit protection: public registration can NEVER become admin
    if (data.role && data.role !== 'mahasiswa') {
      return { success: false, error: 'Pendaftaran publik hanya diizinkan untuk role mahasiswa.' };
    }

    if (this.findUserByEmail(data.email)) {
      return { success: false, error: 'Email sudah terdaftar dalam sistem.' };
    }
    if (this.findUserByNim(data.nim)) {
      return { success: false, error: 'NIM sudah terdaftar dalam sistem.' };
    }

    const userId = `usr_std_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(data.password, salt);

    const newUser: User = {
      id: userId,
      role: 'mahasiswa',
      email: data.email.trim().toLowerCase(),
      nama: data.nama.trim(),
      nim: data.nim.trim(),
      prodi: data.prodi,
      angkatan: Number(data.angkatan),
      statusKelulusan: 'Aktif',
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.data.userCredentials[userId] = { salt, hash };

    // Initial notification for new student
    this.createNotification({
      userId,
      title: 'Akun Mahasiswa Berhasil Dibuat',
      message: `Selamat datang di Sistem SKEM dan SKPI Politeknik Semen Indonesia, ${newUser.nama}. Mulailah mengunggah sertifikat kegiatan Anda.`,
      type: 'success'
    });

    this.logAction(userId, newUser.nama, 'mahasiswa', 'REGISTER', 'User', userId, 'Registrasi mahasiswa baru.');
    this.save();

    return { success: true, user: newUser };
  }

  public updateUserProfile(userId: string, updates: Partial<User>, actingRole: UserRole): { success: boolean; user?: User; error?: string } {
    const user = this.findUserById(userId);
    if (!user) return { success: false, error: 'Pengguna tidak ditemukan.' };

    // Fields allowed for mahasiswa
    if (actingRole === 'mahasiswa') {
      if (updates.tempatLahir !== undefined) user.tempatLahir = updates.tempatLahir;
      if (updates.tanggalLahir !== undefined) user.tanggalLahir = updates.tanggalLahir;
      if (updates.telepon !== undefined) user.telepon = updates.telepon;
      if (updates.alamat !== undefined) user.alamat = updates.alamat;
      // Cannot self-modify academic verification fields!
    } else if (actingRole === 'admin') {
      // Admin can update academic fields
      if (updates.nomorIjazah !== undefined) user.nomorIjazah = updates.nomorIjazah;
      if (updates.tanggalLulus !== undefined) user.tanggalLulus = updates.tanggalLulus;
      if (updates.gelar !== undefined) user.gelar = updates.gelar;
      if (updates.statusKelulusan !== undefined) user.statusKelulusan = updates.statusKelulusan;
      if (updates.prodi !== undefined) user.prodi = updates.prodi;
      if (updates.angkatan !== undefined) user.angkatan = updates.angkatan;
      if (updates.nama !== undefined) user.nama = updates.nama;
    }

    this.save();
    return { success: true, user };
  }

  public listAllStudents(): User[] {
    return this.data.users.filter(u => u.role === 'mahasiswa');
  }

  // --- Certificates & Submissions ---

  public listCertificates(options: {
    studentId?: string;
    status?: string;
    categoryId?: string;
    search?: string;
  }): CertificateItem[] {
    let list = [...this.data.certificates];

    if (options.studentId) {
      list = list.filter(c => c.studentId === options.studentId);
    }
    if (options.status && options.status !== 'Semua') {
      list = list.filter(c => c.status === options.status);
    }
    if (options.categoryId && options.categoryId !== 'semua') {
      list = list.filter(c => c.categoryId === options.categoryId);
    }
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(c => 
        c.activityName.toLowerCase().includes(q) ||
        c.organizer.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.studentNim.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  public getCertificateById(id: string): CertificateItem | undefined {
    return this.data.certificates.find(c => c.id === id);
  }

  public createCertificate(item: Omit<CertificateItem, 'id' | 'createdAt' | 'updatedAt' | 'revisionHistory'>): CertificateItem {
    const id = `cert_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const newCert: CertificateItem = {
      ...item,
      id,
      revisionHistory: [{
        date: now,
        action: item.status === 'Draf' ? 'Simpan Draf' : 'Kirim Pengajuan',
        notes: item.status === 'Draf' ? 'Draf disimpan oleh mahasiswa.' : 'Pengajuan baru dikirim.',
        by: item.studentName,
        byRole: 'mahasiswa'
      }],
      createdAt: now,
      updatedAt: now
    };

    this.data.certificates.push(newCert);

    // If submitted (not draft), notify admin
    if (newCert.status === 'Menunggu Verifikasi') {
      const adminUsers = this.data.users.filter(u => u.role === 'admin');
      for (const admin of adminUsers) {
        this.createNotification({
          userId: admin.id,
          title: 'Pengajuan Sertifikat Baru',
          message: `${newCert.studentName} (${newCert.studentNim}) mengajukan: "${newCert.activityName}"`,
          type: 'info',
          link: '/admin/verifikasi'
        });
      }
    }

    this.logAction(newCert.studentId, newCert.studentName, 'mahasiswa', 'CREATE_CERTIFICATE', 'CertificateItem', id, `Mengajukan kegiatan ${newCert.activityName}`);
    this.save();
    return newCert;
  }

  public updateCertificate(id: string, updates: Partial<CertificateItem>, actorId: string, actorRole: UserRole): { success: boolean; certificate?: CertificateItem; error?: string } {
    const cert = this.getCertificateById(id);
    if (!cert) return { success: false, error: 'Sertifikat tidak ditemukan.' };

    if (actorRole === 'mahasiswa') {
      if (cert.studentId !== actorId) {
        return { success: false, error: 'Akses ditolak: Anda hanya dapat mengedit pengajuan Anda sendiri.' };
      }
      if (cert.status === 'Disetujui') {
        return { success: false, error: 'Pengajuan yang telah disetujui tidak dapat diubah oleh mahasiswa.' };
      }
      if (cert.status === 'Ditolak') {
        return { success: false, error: 'Pengajuan yang ditolak tidak dapat diubah lagi. Silakan buat pengajuan baru.' };
      }

      // If resubmitting from 'Perlu Revisi' -> updates to 'Menunggu Verifikasi'
      const isResubmission = cert.status === 'Perlu Revisi' && updates.status === 'Menunggu Verifikasi';

      Object.assign(cert, updates);
      cert.updatedAt = new Date().toISOString();

      if (isResubmission) {
        cert.revisionHistory.push({
          date: cert.updatedAt,
          action: 'Kirim Ulang Revisi',
          notes: 'Mahasiswa telah memperbarui isian / dokumen perbaikan.',
          by: cert.studentName,
          byRole: 'mahasiswa'
        });

        // Notify admins about revised resubmission
        const adminUsers = this.data.users.filter(u => u.role === 'admin');
        for (const admin of adminUsers) {
          this.createNotification({
            userId: admin.id,
            title: 'Pengajuan Telah Diperbaiki (Revisi)',
            message: `${cert.studentName} (${cert.studentNim}) telah mengirim ulang perbaikan: "${cert.activityName}"`,
            type: 'info',
            link: '/admin/verifikasi'
          });
        }
      }
    }

    this.save();
    return { success: true, certificate: cert };
  }

  public verifyCertificate(id: string, data: {
    status: 'Disetujui' | 'Perlu Revisi' | 'Ditolak';
    approvedPoints: number;
    adminNotes?: string;
    isMandatoryMatch?: MandatoryActivityKey | null;
    adminId: string;
    adminName: string;
  }): { success: boolean; certificate?: CertificateItem; error?: string } {
    const cert = this.getCertificateById(id);
    if (!cert) return { success: false, error: 'Pengajuan sertifikat tidak ditemukan.' };

    if (data.status === 'Perlu Revisi' && (!data.adminNotes || !data.adminNotes.trim())) {
      return { success: false, error: 'Catatan perbaikan wajib diisi ketika meminta revisi.' };
    }
    if (data.status === 'Ditolak' && (!data.adminNotes || !data.adminNotes.trim())) {
      return { success: false, error: 'Alasan penolakan wajib diisi ketika menolak pengajuan.' };
    }

    const now = new Date().toISOString();
    cert.status = data.status;
    cert.approvedPoints = data.status === 'Disetujui' ? Math.max(0, data.approvedPoints) : 0;
    cert.adminNotes = data.adminNotes || '';
    cert.reviewerAdminId = data.adminId;
    cert.reviewerAdminName = data.adminName;
    cert.reviewedAt = now;
    cert.updatedAt = now;
    if (data.isMandatoryMatch !== undefined) {
      cert.isMandatoryMatch = data.isMandatoryMatch;
    }

    cert.revisionHistory.push({
      date: now,
      action: data.status,
      notes: data.adminNotes || (data.status === 'Disetujui' ? `Disetujui dengan ${cert.approvedPoints} poin.` : ''),
      by: data.adminName,
      byRole: 'admin'
    });

    // Notify the student
    const notifType = data.status === 'Disetujui' ? 'success' : (data.status === 'Perlu Revisi' ? 'warning' : 'alert');
    this.createNotification({
      userId: cert.studentId,
      title: `Status Sertifikat: ${data.status}`,
      message: data.status === 'Disetujui'
        ? `Pengajuan "${cert.activityName}" telah disetujui (+${cert.approvedPoints} poin).`
        : `Pengajuan "${cert.activityName}": ${data.status}. Catatan: ${data.adminNotes}`,
      type: notifType,
      link: '/riwayat'
    });

    this.logAction(data.adminId, data.adminName, 'admin', `VERIFY_CERTIFICATE_${data.status.toUpperCase()}`, 'CertificateItem', id, `Memverifikasi pengajuan ${cert.activityName}: ${data.status}`);
    this.save();
    return { success: true, certificate: cert };
  }

  // --- Student Statistics & Mandatory Checklist ---

  public computeStudentStats(studentId: string): StudentStats {
    const student = this.findUserById(studentId);
    const targetPoints = getTargetPointsForAngkatan(student?.angkatan);
    const certs = this.data.certificates.filter(c => c.studentId === studentId);

    const counts = {
      draf: 0,
      menunggu: 0,
      revisi: 0,
      disetujui: 0,
      ditolak: 0,
      total: certs.length
    };

    let totalApprovedPoints = 0;

    for (const c of certs) {
      if (c.status === 'Draf') counts.draf++;
      else if (c.status === 'Menunggu Verifikasi') counts.menunggu++;
      else if (c.status === 'Perlu Revisi') counts.revisi++;
      else if (c.status === 'Disetujui') {
        counts.disetujui++;
        totalApprovedPoints += c.approvedPoints;
      } else if (c.status === 'Ditolak') counts.ditolak++;
    }

    // Check 4 mandatory activities against approved certificates
    const approvedCerts = certs.filter(c => c.status === 'Disetujui');
    const mandatoryKeys: MandatoryActivityKey[] = ['bnsp', 'pkl', 'pkkmb', 'lkmm'];

    const mandatoryChecklist: Record<MandatoryActivityKey, MandatoryItemStatus> = {} as any;

    for (const key of mandatoryKeys) {
      const spec = MANDATORY_ACTIVITIES_SPEC[key];
      // Match if explicit isMandatoryMatch === key OR subcategoryId === spec.subcategoryId
      const matched = approvedCerts.find(c => c.isMandatoryMatch === key || c.subcategoryId === spec.subcategoryId);

      mandatoryChecklist[key] = {
        key,
        title: spec.title,
        description: spec.description,
        fulfilled: !!matched,
        matchedActivityName: matched?.activityName,
        matchedCertificateId: matched?.id,
        matchedDate: matched?.activityDate
      };
    }

    const mandatoryAllFulfilled = mandatoryKeys.every(k => mandatoryChecklist[k].fulfilled);
    const deficitPoints = Math.max(0, targetPoints - totalApprovedPoints);
    const progressPercentage = Math.min(100, Math.round((totalApprovedPoints / targetPoints) * 100));
    const predicate = getPredicateForPoints(totalApprovedPoints, targetPoints);

    const pointsOk = totalApprovedPoints >= targetPoints;
    const pointsMsg = pointsOk 
      ? `Poin mencukupi (${totalApprovedPoints}/${targetPoints})` 
      : `Poin belum mencukupi (Kekurangan ${deficitPoints} poin)`;
    
    const mandatoryMsg = mandatoryAllFulfilled
      ? 'Seluruh 4 kegiatan wajib telah disetujui'
      : `Kegiatan wajib belum lengkap (${Object.values(mandatoryChecklist).filter(m => m.fulfilled).length}/4 terpenuhi)`;

    const isEligibleForSKPI = pointsOk && mandatoryAllFulfilled;

    return {
      totalApprovedPoints,
      targetPoints,
      deficitPoints,
      progressPercentage,
      predicate,
      counts,
      mandatoryChecklist,
      mandatoryAllFulfilled,
      isEligibleForSKPI,
      eligibilityReasons: {
        pointsOk,
        pointsMsg,
        mandatoryOk: mandatoryAllFulfilled,
        mandatoryMsg,
        overallOk: isEligibleForSKPI
      }
    };
  }

  // --- SKPI Requests & Publishing ---

  public listSKPIRequests(options?: { studentId?: string; status?: string; search?: string }): SKPIRequest[] {
    let list = [...this.data.skpiRequests];

    if (options?.studentId) {
      list = list.filter(r => r.studentId === options.studentId);
    }
    if (options?.status && options.status !== 'Semua') {
      list = list.filter(r => r.status === options.status);
    }
    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(r => 
        r.studentName.toLowerCase().includes(q) ||
        r.studentNim.toLowerCase().includes(q) ||
        (r.documentNumber && r.documentNumber.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  public getSKPIRequestById(id: string): SKPIRequest | undefined {
    return this.data.skpiRequests.find(r => r.id === id);
  }

  public getSKPIRequestByStudentId(studentId: string): SKPIRequest | undefined {
    // Return latest SKPI request for student
    const studentRequests = this.data.skpiRequests
      .filter(r => r.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return studentRequests[0];
  }

  public applyForSKPI(studentId: string): { success: boolean; request?: SKPIRequest; error?: string } {
    const student = this.findUserById(studentId);
    if (!student) return { success: false, error: 'Mahasiswa tidak ditemukan.' };

    const stats = this.computeStudentStats(studentId);
    if (!stats.isEligibleForSKPI) {
      return { 
        success: false, 
        error: `Anda belum memenuhi persyaratan pengajuan SKPI: ${!stats.eligibilityReasons.pointsOk ? stats.eligibilityReasons.pointsMsg : ''} ${!stats.eligibilityReasons.mandatoryOk ? stats.eligibilityReasons.mandatoryMsg : ''}`.trim() 
      };
    }

    // Check if there is already an active non-rejected request
    const existing = this.data.skpiRequests.find(r => r.studentId === studentId && (r.status === 'Diajukan' || r.status === 'Dalam Pemeriksaan' || r.status === 'Terbit'));
    if (existing) {
      return { 
        success: false, 
        error: `Pengajuan SKPI Anda sudah tercatat dengan status: ${existing.status}.` 
      };
    }

    const id = `skpi_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const newRequest: SKPIRequest = {
      id,
      studentId,
      studentName: student.nama,
      studentNim: student.nim || '-',
      studentProdi: student.prodi || '-',
      studentAngkatan: student.angkatan || new Date().getFullYear(),
      submissionDate: now,
      status: 'Diajukan',
      revisionHistory: [{
        date: now,
        action: 'Diajukan',
        notes: 'Mahasiswa mengajukan permohonan penerbitan SKPI resmi.',
        by: student.nama,
        byRole: 'mahasiswa'
      }],
      createdAt: now,
      updatedAt: now
    };

    this.data.skpiRequests.push(newRequest);

    // Notify admins
    const adminUsers = this.data.users.filter(u => u.role === 'admin');
    for (const admin of adminUsers) {
      this.createNotification({
        userId: admin.id,
        title: 'Pengajuan SKPI Baru',
        message: `${student.nama} (${student.nim}) telah mengajukan permohonan SKPI. Mohon periksa data akademik.`,
        type: 'info',
        link: '/admin/skpi'
      });
    }

    this.logAction(studentId, student.nama, 'mahasiswa', 'APPLY_SKPI', 'SKPIRequest', id, 'Mengajukan penerbitan SKPI.');
    this.save();
    return { success: true, request: newRequest };
  }

  public reviewSKPIRequest(id: string, data: {
    status: 'Dalam Pemeriksaan' | 'Perlu Revisi' | 'Ditolak';
    adminNotes: string;
    adminId: string;
    adminName: string;
  }): { success: boolean; request?: SKPIRequest; error?: string } {
    const req = this.getSKPIRequestById(id);
    if (!req) return { success: false, error: 'Pengajuan SKPI tidak ditemukan.' };

    if ((data.status === 'Perlu Revisi' || data.status === 'Ditolak') && (!data.adminNotes || !data.adminNotes.trim())) {
      return { success: false, error: 'Catatan wajib diisi untuk status revisi atau tolak.' };
    }

    const now = new Date().toISOString();
    req.status = data.status;
    req.adminNotes = data.adminNotes;
    req.updatedAt = now;
    req.revisionHistory.push({
      date: now,
      action: data.status,
      notes: data.adminNotes,
      by: data.adminName,
      byRole: 'admin'
    });

    this.createNotification({
      userId: req.studentId,
      title: `Status SKPI: ${data.status}`,
      message: `Pengajuan SKPI Anda: ${data.status}. Catatan: ${data.adminNotes}`,
      type: data.status === 'Perlu Revisi' ? 'warning' : 'alert',
      link: '/skpi'
    });

    this.logAction(data.adminId, data.adminName, 'admin', `REVIEW_SKPI_${data.status.toUpperCase()}`, 'SKPIRequest', id, `SKPI review: ${data.status}`);
    this.save();
    return { success: true, request: req };
  }

  public publishSKPIRequest(id: string, adminId: string, adminName: string): { success: boolean; request?: SKPIRequest; error?: string } {
    const req = this.getSKPIRequestById(id);
    if (!req) return { success: false, error: 'Pengajuan SKPI tidak ditemukan.' };

    const student = this.findUserById(req.studentId);
    if (!student) return { success: false, error: 'Data mahasiswa tidak ditemukan.' };

    const stats = this.computeStudentStats(req.studentId);
    if (!stats.isEligibleForSKPI) {
      return { success: false, error: 'Mahasiswa ini belum memenuhi kriteria kelayakan SKEM dan kegiatan wajib.' };
    }

    // Generate unique document number
    this.data.config.lastDocumentSequence = (this.data.config.lastDocumentSequence || 100) + 1;
    const year = new Date().getFullYear();
    const docNumber = `SKPI/POLTEKSI/${year}/${String(this.data.config.lastDocumentSequence).padStart(4, '0')}`;

    const now = new Date().toISOString();

    // Group approved activities strictly according to official template mapping
    const approvedCerts = this.data.certificates.filter(c => c.studentId === req.studentId && c.status === 'Disetujui');

    const prodiOutcomes = PROGRAM_LEARNING_OUTCOMES[student.prodi || ''] || PROGRAM_LEARNING_OUTCOMES['default'];

    const snapshotData = {
      student: {
        nama: student.nama,
        nim: student.nim || '-',
        tempatLahir: student.tempatLahir || 'Gresik',
        tanggalLahir: student.tanggalLahir || '2004-01-01',
        tahunMasuk: student.angkatan || 2023,
        tahunLulus: student.tanggalLulus || new Date().toISOString().split('T')[0],
        nomorIjazah: student.nomorIjazah || `POLTEKSI/${student.angkatan || 2023}/${student.nim || '001'}`,
        gelar: student.gelar || 'Sarjana Terapan / Ahli Madya',
        prodi: student.prodi || 'Pendidikan Vokasi',
        jenjang: prodiOutcomes.jenjang
      },
      institution: {
        namaInstitusi: 'Politeknik Semen Indonesia',
        skPendirian: 'Keputusan Menristekdikti RI Nomor 314/KPT/I/2018',
        alamat: 'Kompleks PT Semen Indonesia (Persero) Tbk, Jl. Veteran, Gresik, Jawa Timur 61122',
        pejabatPenandatangan: 'Dr. Ir. Wahyudi Triwahyono, M.T.',
        jabatanPejabat: 'Direktur Politeknik Semen Indonesia',
        nipPejabat: '197405122002121002'
      },
      learningOutcomes: {
        sikap: prodiOutcomes.sikap,
        pengetahuan: prodiOutcomes.pengetahuan,
        keterampilanUmum: prodiOutcomes.keterampilanUmum,
        keterampilanKhusus: prodiOutcomes.keterampilanKhusus
      },
      activities: {
        prestasi: approvedCerts.filter(c => c.categoryId === 'prestasi'),
        pelatihanKeprofesian: approvedCerts.filter(c => c.categoryId === 'pelatihan'),
        organisasi: approvedCerts.filter(c => c.categoryId === 'organisasi'),
        projekPengabdian: approvedCerts.filter(c => c.categoryId === 'projek')
      },
      summary: {
        totalPoints: stats.totalApprovedPoints,
        predicate: stats.predicate,
        generatedAt: now
      }
    };

    req.status = 'Terbit';
    req.documentNumber = docNumber;
    req.publishedAt = now;
    req.publisherAdminId = adminId;
    req.publisherAdminName = adminName;
    req.snapshotData = snapshotData;
    req.updatedAt = now;

    req.revisionHistory.push({
      date: now,
      action: 'Terbit',
      notes: `SKPI resmi telah diterbitkan dengan nomor dokumen: ${docNumber}. Dokumen tersimpan permanen.`,
      by: adminName,
      byRole: 'admin'
    });

    // Notify student
    this.createNotification({
      userId: req.studentId,
      title: 'Dokumen SKPI Telah Diterbitkan!',
      message: `Surat Keterangan Pendamping Ijazah (SKPI) resmi Anda telah terbit dengan No: ${docNumber}. Anda dapat mengunduh dokumen sekarang.`,
      type: 'success',
      link: '/skpi'
    });

    this.logAction(adminId, adminName, 'admin', 'PUBLISH_SKPI', 'SKPIRequest', id, `Menerbitkan SKPI ${docNumber} untuk ${student.nama}`);
    this.save();
    return { success: true, request: req };
  }

  // --- Notifications ---

  public listNotifications(userId: string): AppNotification[] {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): AppNotification {
    const id = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const notif: AppNotification = {
      ...data,
      id,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.push(notif);
    this.save();
    return notif;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    let changed = false;
    for (const notif of this.data.notifications) {
      if (notif.userId === userId && !notif.isRead) {
        notif.isRead = true;
        changed = true;
      }
    }
    if (changed) this.save();
  }

  // --- Audit Logs ---

  public logAction(actorId: string, actorName: string, actorRole: UserRole, action: string, targetType: string, targetId: string, details: string): void {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      actorId,
      actorName,
      actorRole,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.push(log);
    // Keep max 500 audit logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(-500);
    }
    this.save();
  }

  // --- Admin Stats ---

  public computeAdminStats() {
    const students = this.listAllStudents();
    const certs = this.data.certificates;
    const skpiRequests = this.data.skpiRequests;

    const pendingCertsCount = certs.filter(c => c.status === 'Menunggu Verifikasi').length;
    const pendingSkpiCount = skpiRequests.filter(r => r.status === 'Diajukan' || r.status === 'Dalam Pemeriksaan').length;

    let eligibleStudentsCount = 0;
    let totalApprovedPointsAll = 0;

    for (const s of students) {
      const stats = this.computeStudentStats(s.id);
      if (stats.isEligibleForSKPI) {
        eligibleStudentsCount++;
      }
      totalApprovedPointsAll += stats.totalApprovedPoints;
    }

    const recentCertificates = [...certs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const recentSkpi = [...skpiRequests]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalStudentsCount: students.length,
      pendingCertsCount,
      pendingSkpiCount,
      eligibleStudentsCount,
      totalApprovedPointsAll,
      totalCertificatesCount: certs.length,
      recentCertificates,
      recentSkpi
    };
  }
}

export const db = new Database();
