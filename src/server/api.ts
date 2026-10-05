import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db, UPLOADS_DIR } from './db.ts';
import { 
  SKEM_CATEGORIES, 
  MANDATORY_ACTIVITIES_SPEC, 
  ANGKATAN_TARGET_POINTS, 
  STUDY_PROGRAMS,
  PROGRAM_LEARNING_OUTCOMES,
  getTargetPointsForAngkatan,
  getPredicateForPoints
} from './rules.ts';
import { User, UserRole } from '../types.ts';

// Secret key for token signing
const JWT_SECRET = process.env.APP_SECRET || 'polteksi_skem_skpi_secret_key_2026';

function signToken(user: User): string {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
    timestamp: Date.now()
  };
  const str = JSON.stringify(payload);
  const base64 = Buffer.from(str).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(base64).digest('base64url');
  return `${base64}.${signature}`;
}

function verifyToken(token: string): { id: string; role: UserRole; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(base64).digest('base64url');
    if (sig !== expectedSig) return null;
    const decoded = JSON.parse(Buffer.from(base64, 'base64url').toString('utf-8'));
    return decoded;
  } catch (err) {
    return null;
  }
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `proof_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Harap unggah PDF, JPG, atau PNG.'));
    }
  }
});

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Middleware: Authenticate Bearer Token
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sesi tidak valid atau telah berakhir. Harap login kembali.' });
  }

  const token = authHeader.split(' ')[1];
  const verified = verifyToken(token);
  if (!verified) {
    return res.status(401).json({ error: 'Token autentikasi tidak valid.' });
  }

  const user = db.findUserById(verified.id);
  if (!user) {
    return res.status(401).json({ error: 'Pengguna tidak ditemukan dalam sistem.' });
  }

  req.user = user;
  next();
}

// Middleware: Admin Only
export function adminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak: Menu ini hanya diperuntukkan bagi Administrator BAAK.' });
  }
  next();
}

// Middleware: Mahasiswa Only
export function mahasiswaOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'mahasiswa') {
    return res.status(403).json({ error: 'Akses ditolak: Menu ini hanya diperuntukkan bagi Mahasiswa.' });
  }
  next();
}

export const apiRouter = Router();

// --- Auth Endpoints ---

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  }

  const user = db.findUserByEmail(email);
  if (!user || !db.verifyPassword(user, password)) {
    return res.status(401).json({ error: 'Email atau password yang Anda masukkan salah.' });
  }

  const token = signToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      nama: user.nama,
      nim: user.nim,
      prodi: user.prodi,
      angkatan: user.angkatan,
      tempatLahir: user.tempatLahir,
      tanggalLahir: user.tanggalLahir,
      telepon: user.telepon,
      alamat: user.alamat,
      nomorIjazah: user.nomorIjazah,
      tanggalLulus: user.tanggalLulus,
      gelar: user.gelar,
      statusKelulusan: user.statusKelulusan
    }
  });
});

apiRouter.post('/auth/register', (req, res) => {
  const { nama, nim, email, prodi, angkatan, password, confirmPassword, role } = req.body;

  // Strict role check: Never allow registering as admin
  if (role && role !== 'mahasiswa') {
    return res.status(400).json({ error: 'Pendaftaran mandiri hanya dapat dilakukan untuk akun Mahasiswa.' });
  }

  if (!nama || !nim || !email || !prodi || !angkatan || !password) {
    return res.status(400).json({ error: 'Semua kolom formulir pendaftaran wajib diisi.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Konfirmasi password tidak cocok.' });
  }

  const result = db.registerStudent({
    nama,
    nim,
    email,
    prodi,
    angkatan: Number(angkatan),
    password
  });

  if (!result.success || !result.user) {
    return res.status(400).json({ error: result.error || 'Gagal mendaftarkan akun.' });
  }

  const token = signToken(result.user);
  res.status(201).json({
    token,
    user: result.user
  });
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

apiRouter.put('/auth/profile', authMiddleware, (req: AuthenticatedRequest, res) => {
  const updates = req.body;
  const result = db.updateUserProfile(req.user!.id, updates, req.user!.role);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ user: result.user });
});

// --- System Rules & Guidelines ---

apiRouter.get('/rules', (_req, res) => {
  res.json({
    categories: SKEM_CATEGORIES,
    mandatoryActivities: MANDATORY_ACTIVITIES_SPEC,
    angkatanTargets: ANGKATAN_TARGET_POINTS,
    studyPrograms: STUDY_PROGRAMS,
    predicateBrackets: [
      { min: 0, max: 499, label: 'Kurang' },
      { min: 500, max: 600, label: 'Cukup' },
      { min: 601, max: 700, label: 'Baik' },
      { min: 701, max: 800, label: 'Sangat Baik' },
      { min: 801, max: 9999, label: 'Unggul' }
    ]
  });
});

// --- Statistics ---

apiRouter.get('/stats/student', authMiddleware, (req: AuthenticatedRequest, res) => {
  const studentId = req.query.studentId && req.user!.role === 'admin' 
    ? String(req.query.studentId) 
    : req.user!.id;

  const stats = db.computeStudentStats(studentId);
  res.json(stats);
});

apiRouter.get('/stats/admin', authMiddleware, adminOnly, (_req, res) => {
  const stats = db.computeAdminStats();
  res.json(stats);
});

// --- Certificates & Submissions ---

apiRouter.get('/certificates', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { status, categoryId, search, studentId } = req.query;

  // Student can only see their own certificates
  const targetStudentId = req.user!.role === 'mahasiswa' 
    ? req.user!.id 
    : (studentId ? String(studentId) : undefined);

  const list = db.listCertificates({
    studentId: targetStudentId,
    status: status ? String(status) : undefined,
    categoryId: categoryId ? String(categoryId) : undefined,
    search: search ? String(search) : undefined
  });

  res.json(list);
});

const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Gagal memproses unggahan berkas.' });
      }
      next();
    });
  }
  next();
};

apiRouter.post('/certificates', authMiddleware, mahasiswaOnly, handleUpload, (req: AuthenticatedRequest, res) => {
  try {
    const student = req.user!;
    const body = req.body || {};

    const categoryId = body.categoryId;
    const subcategoryId = body.subcategoryId;
    const activityName = body.activityName;
    const organizer = body.organizer;
    const activityDate = body.activityDate;
    const academicYear = body.academicYear || '2025/2026 Ganjil';
    const certificateNumber = body.certificateNumber || '';
    const verificationUrl = body.verificationUrl || '';
    const isDraft = body.isDraft === 'true' || body.isDraft === true;

    if (!isDraft) {
      if (!categoryId || !subcategoryId || !activityName || !organizer || !activityDate) {
        return res.status(400).json({ error: 'Mohon lengkapi seluruh isian wajib pada tahap 1 sampai 3.' });
      }
      const hasFile = req.file || body.existingFilePath || body.existingFileName || body.fileName;
      if (!hasFile) {
        return res.status(400).json({ error: 'Berkas bukti (PDF / JPG / PNG) wajib diunggah untuk pengajuan.' });
      }
    }

    // Find subcategory to calculate point estimate and mandatory matching
    let estimatedPoints = 0;
    let isMandatoryMatch = null;

    const category = SKEM_CATEGORIES.find(c => c.id === categoryId);
    if (category) {
      const sub = category.subcategories.find(s => s.id === subcategoryId);
      if (sub) {
        estimatedPoints = sub.defaultPoints;
        if (sub.mandatoryType) {
          isMandatoryMatch = sub.mandatoryType;
        }
      }
    }

    const file = req.file;
    const fileName = file ? file.originalname : (body.existingFileName || 'bukti_kegiatan.pdf');
    const filePath = file ? file.filename : (body.existingFilePath || 'sample_proof.pdf');
    const fileMimeType = file ? file.mimetype : 'application/pdf';
    const fileSize = file ? file.size : 102400;

    let extraDetails: Record<string, string> = {};
    if (body.extraDetails) {
      try {
        extraDetails = typeof body.extraDetails === 'string' ? JSON.parse(body.extraDetails) : body.extraDetails;
      } catch (e) {
        // ignore json error
      }
    }

    const newCert = db.createCertificate({
      studentId: student.id,
      studentName: student.nama,
      studentNim: student.nim || '-',
      studentProdi: student.prodi || '-',
      studentAngkatan: student.angkatan || new Date().getFullYear(),
      categoryId: categoryId || 'pelatihan',
      subcategoryId: subcategoryId || 'pelatihan_kompetensi_teknis',
      activityName: activityName || 'Kegiatan Tanpa Judul',
      organizer: organizer || '-',
      activityDate: activityDate || new Date().toISOString().split('T')[0],
      academicYear,
      extraDetails,
      certificateNumber,
      verificationUrl,
      fileName,
      filePath,
      fileMimeType,
      fileSize,
      estimatedPoints,
      approvedPoints: 0,
      status: isDraft ? 'Draf' : 'Menunggu Verifikasi',
      isMandatoryMatch,
      ruleVersion: '2026.1'
    });

    res.status(201).json(newCert);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menyimpan pengajuan sertifikat.' });
  }
});

apiRouter.get('/certificates/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const cert = db.getCertificateById(req.params.id);
  if (!cert) {
    return res.status(404).json({ error: 'Pengajuan sertifikat tidak ditemukan.' });
  }

  // Student can only see their own
  if (req.user!.role === 'mahasiswa' && cert.studentId !== req.user!.id) {
    return res.status(403).json({ error: 'Akses ditolak.' });
  }

  res.json(cert);
});

apiRouter.put('/certificates/:id', authMiddleware, handleUpload, (req: AuthenticatedRequest, res) => {
  const cert = db.getCertificateById(req.params.id);
  if (!cert) {
    return res.status(404).json({ error: 'Pengajuan sertifikat tidak ditemukan.' });
  }

  const updates: any = {};
  const body = req.body;

  if (body.activityName) updates.activityName = body.activityName;
  if (body.organizer) updates.organizer = body.organizer;
  if (body.activityDate) updates.activityDate = body.activityDate;
  if (body.academicYear) updates.academicYear = body.academicYear;
  if (body.certificateNumber !== undefined) updates.certificateNumber = body.certificateNumber;
  if (body.verificationUrl !== undefined) updates.verificationUrl = body.verificationUrl;
  if (body.categoryId) updates.categoryId = body.categoryId;
  if (body.subcategoryId) {
    updates.subcategoryId = body.subcategoryId;
    const cat = SKEM_CATEGORIES.find(c => c.id === (body.categoryId || cert.categoryId));
    const sub = cat?.subcategories.find(s => s.id === body.subcategoryId);
    if (sub) {
      updates.estimatedPoints = sub.defaultPoints;
      updates.isMandatoryMatch = sub.mandatoryType || null;
    }
  }

  if (body.extraDetails) {
    try {
      updates.extraDetails = typeof body.extraDetails === 'string' ? JSON.parse(body.extraDetails) : body.extraDetails;
    } catch (e) {
      // ignore
    }
  }

  if (req.file) {
    updates.fileName = req.file.originalname;
    updates.filePath = req.file.filename;
    updates.fileMimeType = req.file.mimetype;
    updates.fileSize = req.file.size;
  }

  if (body.status) {
    updates.status = body.status;
  }

  const result = db.updateCertificate(req.params.id, updates, req.user!.id, req.user!.role);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result.certificate);
});

apiRouter.post('/certificates/:id/verify', authMiddleware, adminOnly, (req: AuthenticatedRequest, res) => {
  const { status, approvedPoints, adminNotes, isMandatoryMatch } = req.body;

  if (!status || !['Disetujui', 'Perlu Revisi', 'Ditolak'].includes(status)) {
    return res.status(400).json({ error: 'Status verifikasi harus: Disetujui, Perlu Revisi, atau Ditolak.' });
  }

  const result = db.verifyCertificate(req.params.id, {
    status,
    approvedPoints: Number(approvedPoints) || 0,
    adminNotes,
    isMandatoryMatch,
    adminId: req.user!.id,
    adminName: req.user!.nama
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result.certificate);
});

apiRouter.get('/certificates/:id/file', authMiddleware, (req: AuthenticatedRequest, res) => {
  const cert = db.getCertificateById(req.params.id);
  if (!cert) {
    return res.status(404).json({ error: 'Sertifikat tidak ditemukan.' });
  }

  // Security: only owner student or admin can access file
  if (req.user!.role === 'mahasiswa' && cert.studentId !== req.user!.id) {
    return res.status(403).json({ error: 'Akses ditolak.' });
  }

  const filePath = path.join(UPLOADS_DIR, cert.filePath);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', cert.fileMimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${cert.fileName}"`);
    return res.sendFile(filePath);
  }

  // Fallback: generate a lightweight mockup PDF response so preview never breaks
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Pratinjau Bukti: ${cert.fileName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; text-align: center; }
          .card { max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .badge { display: inline-block; padding: 4px 12px; background: #eff6ff; color: #1d4ed8; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
          h2 { margin-top: 0; color: #0f172a; }
          .detail { text-align: left; background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; margin-top: 20px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
          .row:last-child { border-bottom: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">Dokumen Bukti Terverifikasi</span>
          <h2>${cert.activityName}</h2>
          <p style="color: #64748b;">${cert.fileName} (${Math.round(cert.fileSize / 1024)} KB)</p>
          <div class="detail">
            <div class="row"><strong>Mahasiswa:</strong> <span>${cert.studentName} (${cert.studentNim})</span></div>
            <div class="row"><strong>Penyelenggara:</strong> <span>${cert.organizer}</span></div>
            <div class="row"><strong>Tanggal Kegiatan:</strong> <span>${cert.activityDate}</span></div>
            <div class="row"><strong>No. Dokumen/SK:</strong> <span>${cert.certificateNumber || '-'}</span></div>
            <div class="row"><strong>Status Verifikasi:</strong> <span>${cert.status}</span></div>
            <div class="row"><strong>Poin SKEM:</strong> <span>${cert.approvedPoints > 0 ? cert.approvedPoints + ' Poin Disetujui' : cert.estimatedPoints + ' Poin Estimasi'}</span></div>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Arsip Dokumen Sistem SKEM & SKPI Politeknik Semen Indonesia</p>
        </div>
      </body>
    </html>
  `);
});

// --- Admin Student Management ---

apiRouter.get('/admin/students', authMiddleware, adminOnly, (_req, res) => {
  const students = db.listAllStudents();
  const result = students.map(student => {
    const stats = db.computeStudentStats(student.id);
    const skpiReq = db.getSKPIRequestByStudentId(student.id);

    return {
      id: student.id,
      nama: student.nama,
      nim: student.nim,
      prodi: student.prodi,
      angkatan: student.angkatan,
      statusKelulusan: student.statusKelulusan || 'Aktif',
      nomorIjazah: student.nomorIjazah,
      tanggalLulus: student.tanggalLulus,
      gelar: student.gelar,
      totalApprovedPoints: stats.totalApprovedPoints,
      targetPoints: stats.targetPoints,
      deficitPoints: stats.deficitPoints,
      predicate: stats.predicate,
      mandatoryChecklist: stats.mandatoryChecklist,
      mandatoryAllFulfilled: stats.mandatoryAllFulfilled,
      isEligibleForSKPI: stats.isEligibleForSKPI,
      skpiStatus: skpiReq ? skpiReq.status : 'Belum Mengajukan',
      skpiDocumentNumber: skpiReq?.documentNumber
    };
  });

  res.json(result);
});

apiRouter.get('/admin/students/:id', authMiddleware, adminOnly, (req, res) => {
  const student = db.findUserById(req.params.id);
  if (!student || student.role !== 'mahasiswa') {
    return res.status(404).json({ error: 'Mahasiswa tidak ditemukan.' });
  }

  const stats = db.computeStudentStats(student.id);
  const certificates = db.listCertificates({ studentId: student.id });
  const skpiRequest = db.getSKPIRequestByStudentId(student.id);

  res.json({
    student,
    stats,
    certificates,
    skpiRequest
  });
});

apiRouter.put('/admin/students/:id/academic', authMiddleware, adminOnly, (req: AuthenticatedRequest, res) => {
  const { nomorIjazah, tanggalLulus, gelar, statusKelulusan } = req.body;
  const result = db.updateUserProfile(req.params.id, {
    nomorIjazah,
    tanggalLulus,
    gelar,
    statusKelulusan
  }, 'admin');

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result.user);
});

// --- SKPI Workflow Endpoints ---

apiRouter.get('/skpi', authMiddleware, (req: AuthenticatedRequest, res) => {
  if (req.user!.role === 'mahasiswa') {
    const reqs = db.listSKPIRequests({ studentId: req.user!.id });
    return res.json(reqs[0] || null);
  }

  // Admin: list all requests
  const { status, search } = req.query;
  const list = db.listSKPIRequests({
    status: status ? String(status) : undefined,
    search: search ? String(search) : undefined
  });
  res.json(list);
});

apiRouter.get('/skpi/preview', authMiddleware, (req: AuthenticatedRequest, res) => {
  const studentId = req.query.studentId && req.user!.role === 'admin'
    ? String(req.query.studentId)
    : req.user!.id;

  const student = db.findUserById(studentId);
  if (!student) {
    return res.status(404).json({ error: 'Data mahasiswa tidak ditemukan.' });
  }

  const stats = db.computeStudentStats(studentId);
  const approvedCerts = db.listCertificates({ studentId, status: 'Disetujui' });

  const prodiOutcomes = PROGRAM_LEARNING_OUTCOMES[student.prodi || ''] || PROGRAM_LEARNING_OUTCOMES['default'];

  const previewData = {
    isDraft: true,
    student: {
      nama: student.nama,
      nim: student.nim || '-',
      tempatLahir: student.tempatLahir || 'Gresik',
      tanggalLahir: student.tanggalLahir || '2004-01-01',
      tahunMasuk: student.angkatan || 2023,
      tahunLulus: student.tanggalLulus || '2026-08-30 (Konfirmasi BAAK)',
      nomorIjazah: student.nomorIjazah || '(Menunggu Verifikasi No. Ijazah BAAK)',
      gelar: student.gelar || (student.prodi?.startsWith('D4') ? 'S.Tr.Kom. / S.Tr.T.' : 'A.Md.M. / A.Md.T.'),
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
      targetPoints: stats.targetPoints,
      predicate: stats.predicate,
      mandatoryChecklist: stats.mandatoryChecklist,
      isEligible: stats.isEligibleForSKPI,
      generatedAt: new Date().toISOString()
    }
  };

  res.json(previewData);
});

apiRouter.post('/skpi/apply', authMiddleware, mahasiswaOnly, (req: AuthenticatedRequest, res) => {
  const result = db.applyForSKPI(req.user!.id);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.status(201).json(result.request);
});

apiRouter.post('/skpi/:id/review', authMiddleware, adminOnly, (req: AuthenticatedRequest, res) => {
  const { status, adminNotes } = req.body;
  if (!status || !['Dalam Pemeriksaan', 'Perlu Revisi', 'Ditolak'].includes(status)) {
    return res.status(400).json({ error: 'Status review harus: Dalam Pemeriksaan, Perlu Revisi, atau Ditolak.' });
  }

  const result = db.reviewSKPIRequest(req.params.id, {
    status,
    adminNotes,
    adminId: req.user!.id,
    adminName: req.user!.nama
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result.request);
});

apiRouter.post('/skpi/:id/publish', authMiddleware, adminOnly, (req: AuthenticatedRequest, res) => {
  const result = db.publishSKPIRequest(req.params.id, req.user!.id, req.user!.nama);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result.request);
});

apiRouter.get('/skpi/:id/download', authMiddleware, (req: AuthenticatedRequest, res) => {
  const request = db.getSKPIRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Dokumen SKPI tidak ditemukan.' });
  }

  // Access control
  if (req.user!.role === 'mahasiswa' && request.studentId !== req.user!.id) {
    return res.status(403).json({ error: 'Akses ditolak.' });
  }

  if (request.status !== 'Terbit') {
    return res.status(400).json({ error: 'Dokumen SKPI belum diterbitkan oleh Admin BAAK.' });
  }

  res.json(request);
});

// --- Notifications ---

apiRouter.get('/notifications', authMiddleware, (req: AuthenticatedRequest, res) => {
  const list = db.listNotifications(req.user!.id);
  res.json(list);
});

apiRouter.post('/notifications/:id/read', authMiddleware, (req: AuthenticatedRequest, res) => {
  const success = db.markNotificationAsRead(req.params.id, req.user!.id);
  res.json({ success });
});

apiRouter.post('/notifications/read-all', authMiddleware, (req: AuthenticatedRequest, res) => {
  db.markAllNotificationsAsRead(req.user!.id);
  res.json({ success: true });
});
