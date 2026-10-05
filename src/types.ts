export type UserRole = 'mahasiswa' | 'admin';

export type CertificateStatus = 
  | 'Draf' 
  | 'Menunggu Verifikasi' 
  | 'Perlu Revisi' 
  | 'Disetujui' 
  | 'Ditolak';

export type SKPIStatus = 
  | 'Diajukan' 
  | 'Dalam Pemeriksaan' 
  | 'Perlu Revisi' 
  | 'Ditolak' 
  | 'Terbit';

export type MandatoryActivityKey = 'bnsp' | 'pkl' | 'pkkmb' | 'lkmm';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  nama: string;
  nim?: string;
  prodi?: string;
  angkatan?: number;
  tempatLahir?: string;
  tanggalLahir?: string;
  telepon?: string;
  alamat?: string;
  nomorIjazah?: string;
  tanggalLulus?: string;
  gelar?: string;
  statusKelulusan?: 'Aktif' | 'Lulus' | 'Menunggu Yudisium';
  createdAt: string;
}

export interface RevisionRecord {
  date: string;
  action: string;
  notes?: string;
  by: string;
  byRole: UserRole;
}

export interface CertificateItem {
  id: string;
  studentId: string;
  studentName: string;
  studentNim: string;
  studentProdi: string;
  studentAngkatan: number;
  categoryId: string; // 'prestasi' | 'pelatihan' | 'organisasi' | 'projek'
  subcategoryId: string;
  activityName: string;
  organizer: string;
  activityDate: string;
  academicYear: string;
  extraDetails?: Record<string, string>;
  certificateNumber?: string;
  verificationUrl?: string;
  fileName: string;
  filePath: string;
  fileMimeType: string;
  fileSize: number;
  estimatedPoints: number;
  approvedPoints: number;
  status: CertificateStatus;
  isMandatoryMatch?: MandatoryActivityKey | null;
  adminNotes?: string;
  reviewerAdminId?: string;
  reviewerAdminName?: string;
  reviewedAt?: string;
  revisionHistory: RevisionRecord[];
  ruleVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface MandatoryItemStatus {
  key: MandatoryActivityKey;
  title: string;
  description: string;
  fulfilled: boolean;
  matchedActivityName?: string;
  matchedCertificateId?: string;
  matchedDate?: string;
}

export interface StudentStats {
  totalApprovedPoints: number;
  targetPoints: number;
  deficitPoints: number;
  progressPercentage: number;
  predicate: string; // 'Kurang' | 'Cukup' | 'Baik' | 'Sangat Baik' | 'Unggul'
  counts: {
    draf: number;
    menunggu: number;
    revisi: number;
    disetujui: number;
    ditolak: number;
    total: number;
  };
  mandatoryChecklist: Record<MandatoryActivityKey, MandatoryItemStatus>;
  mandatoryAllFulfilled: boolean;
  isEligibleForSKPI: boolean;
  eligibilityReasons: {
    pointsOk: boolean;
    pointsMsg: string;
    mandatoryOk: boolean;
    mandatoryMsg: string;
    overallOk: boolean;
  };
}

export interface SKPISnapshotData {
  student: {
    nama: string;
    nim: string;
    tempatLahir: string;
    tanggalLahir: string;
    tahunMasuk: number;
    tahunLulus: string;
    nomorIjazah: string;
    gelar: string;
    prodi: string;
    jenjang: string;
  };
  institution: {
    namaInstitusi: string;
    skPendirian: string;
    alamat: string;
    pejabatPenandatangan: string;
    jabatanPejabat: string;
    nipPejabat: string;
  };
  learningOutcomes: {
    sikap: string[];
    pengetahuan: string[];
    keterampilanUmum: string[];
    keterampilanKhusus: string[];
  };
  activities: {
    prestasi: CertificateItem[];
    pelatihanKeprofesian: CertificateItem[];
    organisasi: CertificateItem[];
    projekPengabdian: CertificateItem[];
  };
  summary: {
    totalPoints: number;
    predicate: string;
    generatedAt: string;
  };
}

export interface SKPIRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentNim: string;
  studentProdi: string;
  studentAngkatan: number;
  submissionDate: string;
  status: SKPIStatus;
  documentNumber?: string;
  publishedAt?: string;
  publisherAdminId?: string;
  publisherAdminName?: string;
  adminNotes?: string;
  revisionHistory: RevisionRecord[];
  snapshotData?: SKPISnapshotData;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}
