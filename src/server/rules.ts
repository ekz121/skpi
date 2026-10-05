import { MandatoryActivityKey } from '../types.ts';

export interface CategoryOption {
  id: string;
  name: string;
  description: string;
  subcategories: SubcategoryOption[];
}

export interface SubcategoryOption {
  id: string;
  name: string;
  defaultPoints: number;
  pointsRange?: { min: number; max: number };
  mandatoryType?: MandatoryActivityKey;
  allowedEvidence: string[];
  fieldsRequired: string[];
  description: string;
}

export const SKEM_CATEGORIES: CategoryOption[] = [
  {
    id: 'prestasi',
    name: 'Prestasi Lomba Akademik dan Nonakademik',
    description: 'Kejuaraan, kompetisi, dan perlombaan ilmiah, minat bakat, olahraga, seni, dan inovasi.',
    subcategories: [
      {
        id: 'prestasi_internasional_juara1',
        name: 'Tingkat Internasional — Juara 1 / Medali Emas',
        defaultPoints: 150,
        allowedEvidence: ['Sertifikat Kejuaraan Resmi', 'SK Rektor / Direktur', 'Surat Tugas Internasional'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Kompetisi lintas negara minimal 3 negara peserta.'
      },
      {
        id: 'prestasi_internasional_juara2',
        name: 'Tingkat Internasional — Juara 2 / Medali Perak',
        defaultPoints: 125,
        allowedEvidence: ['Sertifikat Kejuaraan', 'SK Pemenang'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Kompetisi lintas negara minimal 3 negara peserta.'
      },
      {
        id: 'prestasi_internasional_juara3',
        name: 'Tingkat Internasional — Juara 3 / Medali Perunggu',
        defaultPoints: 100,
        allowedEvidence: ['Sertifikat Kejuaraan', 'SK Pemenang'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Kompetisi internasional.'
      },
      {
        id: 'prestasi_internasional_finalis',
        name: 'Tingkat Internasional — Finalis / Harapan / Peserta Aktif',
        defaultPoints: 50,
        allowedEvidence: ['Sertifikat Finalis / Peserta'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Menjadi finalis atau delegasi resmi.'
      },
      {
        id: 'prestasi_nasional_juara1',
        name: 'Tingkat Nasional — Juara 1 / Medali Emas',
        defaultPoints: 100,
        allowedEvidence: ['Sertifikat Juara', 'SK Pemenang', 'Surat Keterangan Lembaga'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Kompetisi berskala nasional (Kemdikbudristek / BUMN / Asosiasi Profesi).'
      },
      {
        id: 'prestasi_nasional_juara2',
        name: 'Tingkat Nasional — Juara 2 / Medali Perak',
        defaultPoints: 80,
        allowedEvidence: ['Sertifikat Juara'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Kompetisi tingkat nasional.'
      },
      {
        id: 'prestasi_nasional_juara3',
        name: 'Tingkat Nasional — Juara 3 / Medali Perunggu',
        defaultPoints: 60,
        allowedEvidence: ['Sertifikat Juara'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Kompetisi tingkat nasional.'
      },
      {
        id: 'prestasi_nasional_finalis',
        name: 'Tingkat Nasional — Finalis / Juara Harapan / Peserta',
        defaultPoints: 30,
        allowedEvidence: ['Sertifikat Peserta / Finalis'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Finalis atau peserta lomba nasional.'
      },
      {
        id: 'prestasi_regional_juara1',
        name: 'Tingkat Regional / Provinsi — Juara 1',
        defaultPoints: 60,
        allowedEvidence: ['Sertifikat Kejuaraan Regional'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Kompetisi tingkat provinsi atau wilayah Jawa Timur.'
      },
      {
        id: 'prestasi_regional_juara2_3',
        name: 'Tingkat Regional / Provinsi — Juara 2 / 3',
        defaultPoints: 45,
        allowedEvidence: ['Sertifikat Kejuaraan Regional'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Kompetisi tingkat provinsi.'
      },
      {
        id: 'prestasi_kampus_juara',
        name: 'Tingkat Kampus / Lokal — Juara 1, 2, atau 3',
        defaultPoints: 30,
        allowedEvidence: ['Sertifikat Panitia Kampus / SK'],
        fieldsRequired: ['namaKompetisi', 'tingkat', 'pencapaian', 'penyelenggara'],
        description: 'Perlombaan yang diadakan di lingkungan internal Politeknik Semen Indonesia.'
      }
    ]
  },
  {
    id: 'pelatihan',
    name: 'Pelatihan dan Keprofesian',
    description: 'Sertifikasi kompetensi, pelatihan keahlian, seminar, magang/PKL, PKKMB, dan LKMM.',
    subcategories: [
      {
        id: 'pelatihan_bnsp',
        name: 'Sertifikasi Profesi BNSP / Lembaga Terakreditasi (Kegiatan Wajib)',
        defaultPoints: 100,
        mandatoryType: 'bnsp',
        allowedEvidence: ['Sertifikat BNSP Resmi', 'Surat Keterangan Uji Kompetensi (LSP)'],
        fieldsRequired: ['skemaSertifikasi', 'nomorRegistrasi', 'lspPenyelenggara'],
        description: 'Sertifikasi dari Badan Nasional Sertifikasi Profesi (BNSP) atau LSP berlisensi.'
      },
      {
        id: 'pelatihan_magang_pkl',
        name: 'Magang / Praktik Kerja Lapangan (PKL) Reguler (Kegiatan Wajib)',
        defaultPoints: 100,
        mandatoryType: 'pkl',
        allowedEvidence: ['Sertifikat Magang Perusahaan', 'Surat Keterangan Selesai Magang', 'Nilai PKL'],
        fieldsRequired: ['namaPerusahaan', 'durasiBulan', 'divisiUnitKerja'],
        description: 'Magang di industri minimal 1-6 bulan (Semen Indonesia Group atau mitra industri).'
      },
      {
        id: 'pelatihan_pkkmb',
        name: 'PKKMB (Pengenalan Kehidupan Kampus Mahasiswa Baru) (Kegiatan Wajib)',
        defaultPoints: 50,
        mandatoryType: 'pkkmb',
        allowedEvidence: ['Sertifikat Resmi Kelulusan PKKMB Polteksi'],
        fieldsRequired: ['tahunPelaksanaan'],
        description: 'Wajib diikuti seluruh mahasiswa baru Politeknik Semen Indonesia.'
      },
      {
        id: 'pelatihan_lkmm',
        name: 'LKMM Pra TD / TD (Latihan Keterampilan Manajemen Mahasiswa) (Kegiatan Wajib)',
        defaultPoints: 60,
        mandatoryType: 'lkmm',
        allowedEvidence: ['Sertifikat LKMM Pra-TD / TD'],
        fieldsRequired: ['tingkatLkmm', 'tahunPelaksanaan'],
        description: 'Pelatihan manajemen kepemimpinan mahasiswa tingkat pra dasar atau tingkat dasar.'
      },
      {
        id: 'pelatihan_kompetensi_teknis',
        name: 'Pelatihan / Workshop Kompetensi Keahlian (Teknis/Manajerial)',
        defaultPoints: 40,
        allowedEvidence: ['Sertifikat Workshop / Kursus'],
        fieldsRequired: ['topikPelatihan', 'penyelenggara', 'durasiJam'],
        description: 'Pelatihan bersertifikat peningkatan keahlian kerja/teknis.'
      },
      {
        id: 'pelatihan_seminar_nasional',
        name: 'Seminar / Webinar Ilmiah / Keprofesian (Peserta / Pembicara)',
        defaultPoints: 20,
        allowedEvidence: ['Sertifikat Peserta / Pemakalah'],
        fieldsRequired: ['judulSeminar', 'peran', 'penyelenggara'],
        description: 'Keikutsertaan dalam seminar ilmiah atau temu profesi.'
      }
    ]
  },
  {
    id: 'organisasi',
    name: 'Organisasi dan Kepemimpinan',
    description: 'Kepengurusan BEM, DPM, Himpunan Mahasiswa (HIMA), UKM, dan kepanitiaan resmi.',
    subcategories: [
      {
        id: 'org_bem_ketua',
        name: 'BEM / DPM — Presiden / Ketua / Wakil Ketua',
        defaultPoints: 80,
        allowedEvidence: ['SK Pengangkatan Direktur / BEM', 'Sertifikat Masa Bakti'],
        fieldsRequired: ['namaOrganisasi', 'jabatan', 'periodeTahun'],
        description: 'Pimpinan organisasi kemahasiswaan tertinggi di Politeknik Semen Indonesia.'
      },
      {
        id: 'org_bem_pengurus',
        name: 'BEM / DPM — Pengurus Inti / Kepala Departemen',
        defaultPoints: 50,
        allowedEvidence: ['SK Pengurus', 'Sertifikat Demisioner'],
        fieldsRequired: ['namaOrganisasi', 'jabatan', 'periodeTahun'],
        description: 'Sekretaris, bendahara, atau koordinator departemen BEM/DPM.'
      },
      {
        id: 'org_hima_ketua',
        name: 'HIMA (Himpunan Mahasiswa Jurusan) — Ketua / Wakil',
        defaultPoints: 60,
        allowedEvidence: ['SK Pengurus HIMA dari Kaprodi/Direktur'],
        fieldsRequired: ['namaHima', 'jabatan', 'periodeTahun'],
        description: 'Pimpinan himpunan program studi.'
      },
      {
        id: 'org_hima_anggota',
        name: 'HIMA / UKM — Pengurus / Koordinator / Anggota Aktif',
        defaultPoints: 30,
        allowedEvidence: ['SK Kepengurusan', 'Sertifikat Pengurus'],
        fieldsRequired: ['namaOrganisasi', 'jabatan', 'periodeTahun'],
        description: 'Pengurus atau anggota aktif UKM dan HIMA.'
      },
      {
        id: 'org_panitia_kegiatan',
        name: 'Kepanitiaan Kegiatan Resmi Kampus (Dies Natalis, Wisuda, dsb)',
        defaultPoints: 25,
        allowedEvidence: ['SK Kepanitiaan', 'Sertifikat Panitia'],
        fieldsRequired: ['namaAcara', 'jabatanKepanitiaan'],
        description: 'Kepanitiaan resmi yang disahkan pimpinan kampus.'
      }
    ]
  },
  {
    id: 'projek',
    name: 'Projek, Penelitian, dan Pengabdian Masyarakat',
    description: 'Program Kreativitas Mahasiswa (PKM), riset industri semen/manufaktur, KKN tematik, bakti sosial.',
    subcategories: [
      {
        id: 'projek_pkm_didanai',
        name: 'Program Kreativitas Mahasiswa (PKM) — Lolos Didanai / PIMNAS',
        defaultPoints: 120,
        allowedEvidence: ['SK Penerima Hibah Kemdikbudristek', 'Surat Perjanjian Pelaksanaan'],
        fieldsRequired: ['skemaPkm', 'judulProposal', 'peranTim'],
        description: 'Proposal PKM yang berhasil didanai Dikti atau melaju ke PIMNAS.'
      },
      {
        id: 'projek_penelitian_dosen',
        name: 'Penelitian Bersama Dosen / Hibah Riset Industri Semen',
        defaultPoints: 60,
        allowedEvidence: ['Surat Tugas Penelitian', 'Laporan Akhir / Jurnal'],
        fieldsRequired: ['judulPenelitian', 'dosenPembimbing', 'durasi'],
        description: 'Keterlibatan dalam riset dosen atau riset aplikatif industri.'
      },
      {
        id: 'projek_pengabdian_kkn',
        name: 'Pengabdian Masyarakat / KKN Tematik / Bakti Sosial Terstruktur',
        defaultPoints: 50,
        allowedEvidence: ['Surat Tugas Pengabdian', 'Sertifikat Pengabdian Masyarakat'],
        fieldsRequired: ['lokasiKegiatan', 'namaProgram', 'durasi'],
        description: 'Kegiatan pemberdayaan masyarakat dan bakti kepedulian sosial desa mitra.'
      },
      {
        id: 'projek_kewirausahaan',
        name: 'Kewirausahaan Mahasiswa / Start-up Inovatif Aktif',
        defaultPoints: 50,
        allowedEvidence: ['Legalitas Usaha / SK PMW / Profil Bisnis Aktif'],
        fieldsRequired: ['namaUsaha', 'bidangUsaha', 'omzetPerBulan'],
        description: 'Bisnis mandiri mahasiswa yang telah berjalan terverifikasi.'
      }
    ]
  }
];

export const MANDATORY_ACTIVITIES_SPEC: Record<MandatoryActivityKey, { title: string; description: string; subcategoryId: string }> = {
  bnsp: {
    title: 'Sertifikasi / Pelatihan BNSP',
    description: 'Wajib memiliki minimal satu sertifikat kompetensi dari Badan Nasional Sertifikasi Profesi (BNSP) atau LSP terakreditasi.',
    subcategoryId: 'pelatihan_bnsp'
  },
  pkl: {
    title: 'Magang / PKL Reguler',
    description: 'Wajib menyelesaikan program Praktik Kerja Lapangan (PKL) atau magang industri di perusahaan mitra.',
    subcategoryId: 'pelatihan_magang_pkl'
  },
  pkkmb: {
    title: 'PKKMB',
    description: 'Wajib lulus kegiatan Pengenalan Kehidupan Kampus Mahasiswa Baru Politeknik Semen Indonesia.',
    subcategoryId: 'pelatihan_pkkmb'
  },
  lkmm: {
    title: 'LKMM Pra TD / TD',
    description: 'Wajib mengikuti Latihan Keterampilan Manajemen Mahasiswa (LKMM) Pra Tingkat Dasar atau Tingkat Dasar.',
    subcategoryId: 'pelatihan_lkmm'
  }
};

export const ANGKATAN_TARGET_POINTS: Record<number, number> = {
  2022: 300, // Keringanan khusus angkatan 2022
  2023: 500, // Angkatan 2023 dan seterusnya minimal 500 poin
  2024: 500,
  2025: 500,
  2026: 500
};

export const DEFAULT_MIN_POINTS = 500;

export function getTargetPointsForAngkatan(angkatan?: number): number {
  if (!angkatan) return DEFAULT_MIN_POINTS;
  return ANGKATAN_TARGET_POINTS[angkatan] || DEFAULT_MIN_POINTS;
}

export function getPredicateForPoints(points: number, targetPoints: number = DEFAULT_MIN_POINTS): string {
  if (targetPoints < 500 && points >= targetPoints && points < 500) {
    return 'Cukup (Target Keringanan 2022)';
  }
  if (points < 500) return 'Kurang';
  if (points <= 600) return 'Cukup';
  if (points <= 700) return 'Baik';
  if (points <= 800) return 'Sangat Baik';
  return 'Unggul';
}

export const STUDY_PROGRAMS = [
  'D4 Teknologi Rekayasa Perangkat Lunak',
  'D4 Teknologi Rekayasa Logistik',
  'D4 Manajemen Rekayasa',
  'D3 Manajemen Perusahaan',
  'D3 Teknik Mesin Industri',
  'D3 Akuntansi'
];

export const PROGRAM_LEARNING_OUTCOMES: Record<string, {
  jenjang: string;
  sikap: string[];
  pengetahuan: string[];
  keterampilanUmum: string[];
  keterampilanKhusus: string[];
}> = {
  'D4 Teknologi Rekayasa Perangkat Lunak': {
    jenjang: 'Diploma 4 (Sarjana Terapan) - Level 6 KKNI',
    sikap: [
      'Bertaqwa kepada Tuhan Yang Maha Esa dan mampu menunjukkan sikap religius.',
      'Menjunjung tinggi nilai kemanusiaan dalam menjalankan tugas berdasarkan agama, moral, dan etika.',
      'Berkontribusi dalam peningkatan mutu kehidupan bermasyarakat, berbangsa, dan bernegara berdasarkan Pancasila.',
      'Menunjukkan sikap bertanggungjawab atas pekerjaan di bidang keahlian rekayasa perangkat lunak secara mandiri.'
    ],
    pengetahuan: [
      'Menguasai konsep teoritis rekayasa perangkat lunak, arsitektur sistem, basis data, dan rekayasa kebutuhan perangkat lunak.',
      'Menguasai metode pengujian perangkat lunak, jaminan kualitas, serta metodologi pengembangan agile/scrum.',
      'Menguasai prinsip keamanan informasi dan integrasi sistem industri modern.'
    ],
    keterampilanUmum: [
      'Mampu menerapkan pemikiran logis, kritis, inovatif, bermutu, dan terukur dalam melakukan pekerjaan yang spesifik.',
      'Mampu mengambil keputusan secara tepat dalam konteks penyelesaian masalah di bidang keahliannya.',
      'Mampu mendokumentasikan, menyimpan, mengamankan, dan menemukan kembali data untuk menjamin kesahihan.'
    ],
    keterampilanKhusus: [
      'Mampu merancang, membangun, dan mengimplementasikan aplikasi berbasis web, mobile, dan enterprise secara terpadu.',
      'Mampu mengintegrasikan sistem perangkat lunak dengan sistem otomatisasi dan kontrol industri semen/manufaktur.',
      'Mampu melakukan analisis kebutuhan pengguna dan memodelkan solusi perangkat lunak yang scalable dan andal.'
    ]
  },
  'D3 Manajemen Perusahaan': {
    jenjang: 'Diploma 3 (Ahli Madya) - Level 5 KKNI',
    sikap: [
      'Menunjukkan etika profesi bisnis, kepemimpinan yang berintegritas, dan rasa tanggung jawab sosial.',
      'Menghargai keanekaragaman budaya, pandangan, serta pendapat dalam organisasi bisnis.'
    ],
    pengetahuan: [
      'Menguasai konsep dasar manajemen operasional, pemasaran, sumber daya manusia, dan keuangan perusahaan.',
      'Menguasai teknik administrasi perkantoran modern dan tata kelola rantai pasok industri.'
    ],
    keterampilanUmum: [
      'Mampu menyelesaikan pekerjaan berlingkup luas dengan memilih metode yang sesuai dari beragam pilihan yang sudah baku.',
      'Mampu bekerja sama dan berkomunikasi efektif dalam tim kerja lintas fungsi.'
    ],
    keterampilanKhusus: [
      'Mampu menyusun rencana kerja operasional dan laporan kinerja divisi perusahaan.',
      'Mampu mengoperasikan perangkat lunak manajemen bisnis dan sistem ERP perusahaan industri.'
    ]
  },
  'D3 Teknik Mesin Industri': {
    jenjang: 'Diploma 3 (Ahli Madya) - Level 5 KKNI',
    sikap: [
      'Menjunjung tinggi keselamatan, kesehatan kerja, dan lingkungan hidup (K3LH) dalam setiap aktivitas industri.',
      'Menunjukkan ketelitian dan disiplin tinggi dalam pengoperasian mesin industri.'
    ],
    pengetahuan: [
      'Menguasai prinsip mekanika terapan, termofluida, sistem hidrolik-pneumatik, dan teknologi pemeliharaan mesin.',
      'Menguasai gambar teknik standar ISO dan pembacaan diagram mekanikal.'
    ],
    keterampilanUmum: [
      'Mampu memecahkan masalah teknis operasional dengan menerapkan prosedur baku pemeliharaan preventif.',
      'Mampu menyusun laporan teknik pengujian dan pemeliharaan secara akurat.'
    ],
    keterampilanKhusus: [
      'Mampu melakukan instalasi, alignment, balancing, dan overhaul mesin rotasi industri semen (kiln, ball mill, crusher).',
      'Mampu mengoperasikan mesin perkakas konvensional maupun CNC sesuai toleransi standar.'
    ]
  },
  'default': {
    jenjang: 'Diploma Pendidikan Vokasi Politeknik Semen Indonesia',
    sikap: [
      'Bertakwa kepada Tuhan Yang Maha Esa dan memiliki integritas moral tinggi.',
      'Memiliki etos kerja tinggi, disiplin, dan kepedulian terhadap kemajuan industri nasional.'
    ],
    pengetahuan: [
      'Menguasai konsep keilmuan vokasional terapan sesuai bidang keahlian di Politeknik Semen Indonesia.',
      'Menguasai standar mutu industri dan wawasan keunggulan bersaing.'
    ],
    keterampilanUmum: [
      'Mampu berkomunikasi efektif dan berpikir kritis memecahkan masalah praktis industri.',
      'Mampu beradaptasi dengan kemajuan teknologi dan transformasi digital.'
    ],
    keterampilanKhusus: [
      'Mampu menerapkan keterampilan terapan spesifik di lingkungan industri dan masyarakat.',
      'Mampu menghasilkan luaran kerja yang teruji dan memenuhi kriteria industri.'
    ]
  }
};
