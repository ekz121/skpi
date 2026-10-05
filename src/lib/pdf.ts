import { jsPDF } from 'jspdf';
import { SKPISnapshotData } from '../types.ts';

export function generateSKPIPdf(snapshot: SKPISnapshotData, docNumber: string, isDraft: boolean = false) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 16;
      drawPageWatermark();
    }
  }

  function drawPageWatermark() {
    if (isDraft) {
      doc.saveGraphicsState();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(48);
      doc.setTextColor(220, 220, 220);
      doc.text('DRAF / PRATINJAU', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
      });
      doc.restoreGraphicsState();
    }
  }

  drawPageWatermark();

  // --- Official Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 44, 89); // Polteksi Deep Navy
  doc.text('POLITEKNIK SEMEN INDONESIA', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Kompleks PT Semen Indonesia (Persero) Tbk, Jl. Veteran, Gresik, Jawa Timur 61122', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('Laman: www.polteksi.ac.id | Email: info@polteksi.ac.id | Telepon: (031) 3981732', pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Header separator line
  doc.setDrawColor(15, 44, 89);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineWidth(0.2);
  doc.line(margin, y + 0.8, pageWidth - margin, y + 0.8);
  y += 6;

  // --- Document Title ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('SURAT KETERANGAN PENDAMPING IJAZAH (SKPI)', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('DIPLOMA SUPPLEMENT', pageWidth / 2, y, { align: 'center' });
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Nomor: ${docNumber || 'SKPI/POLTEKSI/2026/DRAFT'}`, pageWidth / 2, y, { align: 'center' });
  y += 7;

  // Helper function for section headings
  function drawSectionHeader(num: string, titleId: string, titleEn: string) {
    checkPageBreak(12);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 44, 89);
    doc.text(`${num}. ${titleId} / ${titleEn}`, margin + 2, y + 4.2);
    y += 8;
  }

  // Helper function for 2-column info key-values
  function drawKeyValue(keyId: string, keyEn: string, val: string) {
    checkPageBreak(6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(keyId, margin + 2, y);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(keyEn, margin + 2, y + 3);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`:  ${val || '-'}`, margin + 65, y);
    y += 6;
  }

  // 1. Informasi Pemegang SKPI
  drawSectionHeader('1', 'INFORMASI TENTANG IDENTITAS DIRI PEMEGANG SKPI', 'Information Identifying The Holder of The Diploma Supplement');
  drawKeyValue('Nama Lengkap', 'Full Name', snapshot.student.nama);
  drawKeyValue('Tempat dan Tanggal Lahir', 'Date and Place of Birth', `${snapshot.student.tempatLahir}, ${snapshot.student.tanggalLahir}`);
  drawKeyValue('Nomor Induk Mahasiswa (NIM)', 'Student Identification Number', snapshot.student.nim);
  drawKeyValue('Tahun Masuk / Kelulusan', 'Year of Admission / Completion', `${snapshot.student.tahunMasuk} / ${snapshot.student.tahunLulus}`);
  drawKeyValue('Nomor Seri Ijazah', 'Diploma Serial Number', snapshot.student.nomorIjazah);
  drawKeyValue('Gelar yang Diberikan', 'Name of Qualification Awarded', snapshot.student.gelar);
  drawKeyValue('Program Studi', 'Study Program', snapshot.student.prodi);
  drawKeyValue('Jenjang Kualifikasi', 'Level of Qualification', snapshot.student.jenjang);
  y += 2;

  // 2. Informasi Penyelenggara Program
  drawSectionHeader('2', 'INFORMASI TENTANG IDENTITAS PENYELENGGARA PROGRAM', 'Information Identifying The Awarding Institution');
  drawKeyValue('Nama Perguruan Tinggi', 'Name of Higher Education Institution', snapshot.institution.namaInstitusi);
  drawKeyValue('SK Pendirian Perguruan Tinggi', 'Establishment License', snapshot.institution.skPendirian);
  drawKeyValue('Alamat Perguruan Tinggi', 'Address', 'Jl. Veteran, Kompleks PT Semen Indonesia, Gresik');
  drawKeyValue('Persyaratan Penerimaan', 'Admission Requirements', 'Lulus SMA/SMK Sederajat & Seleksi Masuk Polteksi');
  drawKeyValue('Bahasa Pengantar Kuliah', 'Language of Instruction', 'Bahasa Indonesia');
  drawKeyValue('Sistem Penilaian', 'Grading Scale', 'Skala 0.00 - 4.00 (A, B+, B, C+, C, D, E)');
  drawKeyValue('Jenis Pendidikan Lanjutan', 'Further Education Access', 'Program Sarjana / Sarjana Terapan Lanjutan');
  y += 2;

  // 3. Capaian Pembelajaran
  drawSectionHeader('3', 'INFORMASI KUALIFIKASI DAN CAPAIAN PEMBELAJARAN', 'Information on The Qualification and Learning Outcomes');

  function drawOutcomeCategory(title: string, items: string[]) {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 138);
    doc.text(title, margin + 2, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    items.forEach((item, idx) => {
      const splitText = doc.splitTextToSize(`${idx + 1}. ${item}`, contentWidth - 6);
      checkPageBreak(splitText.length * 3.8 + 2);
      doc.text(splitText, margin + 4, y);
      y += splitText.length * 3.8 + 1;
    });
    y += 2;
  }

  drawOutcomeCategory('A. Kemampuan Kerja dan Sikap (Attitude & Professional Ethics)', snapshot.learningOutcomes.sikap);
  drawOutcomeCategory('B. Penguasaan Pengetahuan (Knowledge & Field Understanding)', snapshot.learningOutcomes.pengetahuan);
  drawOutcomeCategory('C. Keterampilan Umum (General Skills)', snapshot.learningOutcomes.keterampilanUmum);
  drawOutcomeCategory('D. Keterampilan Khusus (Specific Engineering/Management Skills)', snapshot.learningOutcomes.keterampilanKhusus);
  y += 2;

  // 4. Aktivitas, Prestasi, dan Penghargaan
  drawSectionHeader('4', 'AKTIVITAS, PRESTASI, DAN PENGHARGAAN (SKEM)', 'Activities, Achievements, and Awards');

  function drawActivitiesGroup(groupTitle: string, acts: any[]) {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 138);
    doc.text(groupTitle, margin + 2, y);
    y += 4;

    if (!acts || acts.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('- Tidak ada kegiatan dalam kategori ini / None recorded -', margin + 6, y);
      y += 5;
      return;
    }

    acts.forEach((act, idx) => {
      checkPageBreak(8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);

      const title = `${idx + 1}. ${act.activityName}`;
      const subtitle = `Penyelenggara: ${act.organizer} | Tanggal: ${act.activityDate} | Poin: ${act.approvedPoints} Poin`;
      
      const splitTitle = doc.splitTextToSize(title, contentWidth - 6);
      doc.text(splitTitle, margin + 4, y);
      y += splitTitle.length * 3.8;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(subtitle, margin + 8, y);
      y += 4.5;
    });
    y += 2;
  }

  drawActivitiesGroup('A. Prestasi dan Kejuaraan (Competitions & Awards)', snapshot.activities.prestasi);
  drawActivitiesGroup('B. Sertifikasi Profesi, Pelatihan, & Magang Industri (Certifications & Internship)', snapshot.activities.pelatihanKeprofesian);
  drawActivitiesGroup('C. Organisasi dan Kepemimpinan (Student Governance & Leadership)', snapshot.activities.organisasi);
  drawActivitiesGroup('D. Projek Inovasi, Riset, & Pengabdian Masyarakat (Projects & Community Service)', snapshot.activities.projekPengabdian);

  // Summary box
  checkPageBreak(12);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Akumulasi Poin SKEM Disetujui: ${snapshot.summary.totalPoints} Poin  |  Predikat Kelulusan: ${snapshot.summary.predicate.toUpperCase()}`, margin + 4, y + 6);
  y += 14;

  // 5. Pengesahan SKPI
  drawSectionHeader('5', 'PENGESAHAN SKPI', 'Certification of The Diploma Supplement');
  checkPageBreak(35);

  const signColWidth = contentWidth / 2;
  const leftX = margin + 4;
  const rightX = margin + signColWidth + 10;

  // QR verification mockup
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.rect(leftX, y, 22, 22, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 44, 89);
  doc.text('QR VERIFIKASI', leftX + 2, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Pindai untuk validasi', leftX + 26, y + 8);
  doc.text('keaslian dokumen resmi', leftX + 26, y + 12);
  doc.text('Portal BAAK Polteksi', leftX + 26, y + 16);

  // Right column: Director signature box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Gresik, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, rightX, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.text(snapshot.institution.jabatanPejabat, rightX, y + 8);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  if (isDraft) {
    doc.text('[ DRAF - BELUM DITANDATANGANI ]', rightX, y + 20);
  } else {
    doc.setTextColor(15, 44, 89);
    doc.text('[ DITANDATANGANI SECARA ELEKTRONIK ]', rightX, y + 20);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(snapshot.institution.pejabatPenandatangan, rightX, y + 26);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`NIP. ${snapshot.institution.nipPejabat}`, rightX, y + 30);

  // Save the PDF
  const safeFilename = `SKPI_${snapshot.student.nim}_${docNumber.replace(/[\/\\:]/g, '_')}.pdf`;
  doc.save(safeFilename);
}
