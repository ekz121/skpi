import React from 'react';
import { SKPISnapshotData } from '../types.ts';
import { Download, Printer, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { generateSKPIPdf } from '../lib/pdf.ts';

interface SKPIDocumentViewProps {
  snapshot: SKPISnapshotData;
  documentNumber?: string;
  isDraft?: boolean;
  publishedAt?: string;
  onPrint?: () => void;
}

export const SKPIDocumentView: React.FC<SKPIDocumentViewProps> = ({
  snapshot,
  documentNumber = 'SKPI/POLTEKSI/2026/DRAF',
  isDraft = false,
  publishedAt
}) => {
  const handleDownloadPdf = () => {
    generateSKPIPdf(snapshot, documentNumber, isDraft);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-xl shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
              isDraft ? 'bg-amber-400 text-amber-950' : 'bg-emerald-500 text-white'
            }`}>
              {isDraft ? 'DRAF PRATINJAU' : 'DOKUMEN RESMI TERBIT'}
            </span>
            <span className="font-mono text-sm tracking-wide">{documentNumber}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isDraft
              ? 'Pratinjau otomatis berdasarkan template Word resmi Politeknik Semen Indonesia.'
              : `Diterbitkan secara sah oleh BAAK pada ${new Date(publishedAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 styling) */}
      <div className="relative bg-white border border-slate-300 shadow-lg rounded-xl p-8 sm:p-12 max-w-4xl mx-auto text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Draft Watermark Overlay */}
        {isDraft && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10 opacity-[0.07]">
            <div className="transform -rotate-45 text-slate-950 font-black text-7xl sm:text-9xl select-none tracking-widest whitespace-nowrap">
              DRAF PRATINJAU
            </div>
          </div>
        )}

        {/* 1. Official Header Kop Surat */}
        <div className="text-center pb-4 border-b-2 border-slate-900 relative">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-blue-950 uppercase font-sans">
            POLITEKNIK SEMEN INDONESIA
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Kompleks PT Semen Indonesia (Persero) Tbk, Jl. Veteran, Gresik, Jawa Timur 61122
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Website: www.polteksi.ac.id | Email: info@polteksi.ac.id | Telp: (031) 3981732
          </p>
          <div className="mt-2 h-0.5 bg-slate-900 w-full" />
          <div className="mt-0.5 h-px bg-slate-700 w-full" />
        </div>

        {/* 2. Document Title */}
        <div className="text-center py-6">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-950 uppercase">
            SURAT KETERANGAN PENDAMPING IJAZAH (SKPI)
          </h1>
          <p className="text-xs italic text-slate-500 font-serif">
            DIPLOMA SUPPLEMENT
          </p>
          <p className="text-xs font-semibold text-slate-800 mt-1 font-mono">
            Nomor: {documentNumber}
          </p>
        </div>

        {/* Preamble / Introduction */}
        <div className="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-600 mb-6 border border-slate-200">
          Surat Keterangan Pendamping Ijazah (SKPI) ini mengacu pada Kerangka Kualifikasi Nasional Indonesia (KKNI) dan Konvensi UNESCO tentang pengakuan studi, ijazah dan gelar pendidikan tinggi. Tujuan SKPI adalah memberikan informasi otentik mengenai kualifikasi, capaian pembelajaran, serta prestasi dan aktivitas mahasiswa selama masa studi di Politeknik Semen Indonesia.
        </div>

        {/* Section 1: Informasi Tentang Identitas Diri Pemegang SKPI */}
        <section className="mb-6">
          <div className="bg-slate-100 border-l-4 border-blue-900 px-3 py-1.5 mb-3">
            <h3 className="text-xs font-bold text-blue-950 uppercase">
              1. INFORMASI TENTANG IDENTITAS DIRI PEMEGANG SKPI
            </h3>
            <p className="text-[10px] italic text-slate-500">Information Identifying The Holder of The Diploma Supplement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Nama Lengkap / Full Name</span>
              <span className="font-semibold text-slate-900 flex-1">: {snapshot.student.nama}</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">NIM / Student ID</span>
              <span className="font-semibold text-slate-900 flex-1 font-mono">: {snapshot.student.nim}</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Tempat, Tgl Lahir / DOB</span>
              <span className="font-semibold text-slate-900 flex-1">: {snapshot.student.tempatLahir}, {snapshot.student.tanggalLahir}</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Tahun Masuk / Admission Year</span>
              <span className="font-semibold text-slate-900 flex-1 font-mono">: {snapshot.student.tahunMasuk}</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Tahun Kelulusan / Graduation</span>
              <span className="font-semibold text-slate-900 flex-1 font-mono">: {snapshot.student.tahunLulus}</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Nomor Seri Ijazah / Diploma No.</span>
              <span className="font-semibold text-slate-900 flex-1 font-mono">: {snapshot.student.nomorIjazah}</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Gelar / Qualification Title</span>
              <span className="font-semibold text-slate-900 flex-1">: {snapshot.student.gelar}</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Program Studi / Study Program</span>
              <span className="font-semibold text-slate-900 flex-1">: {snapshot.student.prodi}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Informasi Tentang Identitas Penyelenggara Program */}
        <section className="mb-6">
          <div className="bg-slate-100 border-l-4 border-blue-900 px-3 py-1.5 mb-3">
            <h3 className="text-xs font-bold text-blue-950 uppercase">
              2. INFORMASI TENTANG IDENTITAS PENYELENGGARA PROGRAM
            </h3>
            <p className="text-[10px] italic text-slate-500">Information Identifying The Awarding Institution</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Nama Perguruan Tinggi / Name</span>
              <span className="font-semibold text-slate-900 flex-1">: {snapshot.institution.namaInstitusi}</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">SK Pendirian / Establishment SK</span>
              <span className="font-semibold text-slate-900 flex-1">: {snapshot.institution.skPendirian}</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Jenjang Kualifikasi / Level</span>
              <span className="font-semibold text-slate-900 flex-1">: {snapshot.student.jenjang}</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Persyaratan Penerimaan / Entry</span>
              <span className="font-semibold text-slate-900 flex-1">: Lulus SMA/SMK Sederajat & Seleksi Kampus</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Bahasa Pengantar / Language</span>
              <span className="font-semibold text-slate-900 flex-1">: Bahasa Indonesia</span>
            </div>
            <div className="flex border-b border-slate-100 py-1">
              <span className="w-48 text-slate-500 font-medium">Sistem Penilaian / Grading</span>
              <span className="font-semibold text-slate-900 flex-1">: Skala 0 - 4 (A, B+, B, C+, C, D, E)</span>
            </div>
          </div>
        </section>

        {/* Section 3: Informasi Kualifikasi dan Capaian Pembelajaran */}
        <section className="mb-6">
          <div className="bg-slate-100 border-l-4 border-blue-900 px-3 py-1.5 mb-3">
            <h3 className="text-xs font-bold text-blue-950 uppercase">
              3. INFORMASI KUALIFIKASI DAN HASIL CAPAIAN PEMBELAJARAN
            </h3>
            <p className="text-[10px] italic text-slate-500">Information on The Qualification and Learning Outcomes</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-bold text-blue-900 mb-1">A. Kemampuan Kerja dan Sikap (Attitude & Professional Values)</h4>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                {snapshot.learningOutcomes.sikap.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-blue-900 mb-1">B. Penguasaan Pengetahuan (Knowledge & Theoretical Understanding)</h4>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                {snapshot.learningOutcomes.pengetahuan.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-blue-900 mb-1">C. Keterampilan Umum (General Skills)</h4>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                {snapshot.learningOutcomes.keterampilanUmum.map((k, idx) => (
                  <li key={idx}>{k}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-blue-900 mb-1">D. Keterampilan Khusus (Field-Specific Practical Skills)</h4>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                {snapshot.learningOutcomes.keterampilanKhusus.map((k, idx) => (
                  <li key={idx}>{k}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Informasi Tentang Aktivitas, Prestasi, dan Penghargaan */}
        <section className="mb-6">
          <div className="bg-slate-100 border-l-4 border-blue-900 px-3 py-1.5 mb-3">
            <h3 className="text-xs font-bold text-blue-950 uppercase">
              4. AKTIVITAS, PRESTASI, DAN PENGHARGAAN (SKEM RESMI)
            </h3>
            <p className="text-[10px] italic text-slate-500">Activities, Achievements, and Recognitions</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Prestasi */}
            <div>
              <h4 className="font-bold text-blue-950 border-b border-slate-200 pb-1 mb-2">
                A. Prestasi dan Kejuaraan (Competitions & Awards)
              </h4>
              {snapshot.activities.prestasi.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">- Tidak ada data prestasi perlombaan -</p>
              ) : (
                <div className="space-y-1.5">
                  {snapshot.activities.prestasi.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{idx + 1}. {item.activityName}</p>
                        <p className="text-[11px] text-slate-500">{item.organizer} · {item.activityDate}</p>
                      </div>
                      <span className="font-mono text-slate-700 shrink-0 font-medium">+{item.approvedPoints} Poin</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sertifikasi & Magang */}
            <div>
              <h4 className="font-bold text-blue-950 border-b border-slate-200 pb-1 mb-2">
                B. Sertifikasi Profesi, Pelatihan, & Magang Industri (Certifications & Internship)
              </h4>
              {snapshot.activities.pelatihanKeprofesian.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">- Tidak ada data sertifikasi -</p>
              ) : (
                <div className="space-y-1.5">
                  {snapshot.activities.pelatihanKeprofesian.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{idx + 1}. {item.activityName}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.organizer} · {item.activityDate}
                          {item.certificateNumber ? ` · No: ${item.certificateNumber}` : ''}
                        </p>
                      </div>
                      <span className="font-mono text-slate-700 shrink-0 font-medium">+{item.approvedPoints} Poin</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Organisasi */}
            <div>
              <h4 className="font-bold text-blue-950 border-b border-slate-200 pb-1 mb-2">
                C. Organisasi dan Kepemimpinan (Student Governance & Leadership)
              </h4>
              {snapshot.activities.organisasi.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">- Tidak ada data organisasi -</p>
              ) : (
                <div className="space-y-1.5">
                  {snapshot.activities.organisasi.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{idx + 1}. {item.activityName}</p>
                        <p className="text-[11px] text-slate-500">{item.organizer} · {item.activityDate}</p>
                      </div>
                      <span className="font-mono text-slate-700 shrink-0 font-medium">+{item.approvedPoints} Poin</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projek & Pengabdian */}
            <div>
              <h4 className="font-bold text-blue-950 border-b border-slate-200 pb-1 mb-2">
                D. Projek, Riset Industri, dan Pengabdian Masyarakat (Projects & Community Service)
              </h4>
              {snapshot.activities.projekPengabdian.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">- Tidak ada data projek dan pengabdian -</p>
              ) : (
                <div className="space-y-1.5">
                  {snapshot.activities.projekPengabdian.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{idx + 1}. {item.activityName}</p>
                        <p className="text-[11px] text-slate-500">{item.organizer} · {item.activityDate}</p>
                      </div>
                      <span className="font-mono text-slate-700 shrink-0 font-medium">+{item.approvedPoints} Poin</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rekap Total & Predikat */}
            <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-between border border-slate-200">
              <span className="font-bold text-slate-900">
                Total Akumulasi Poin SKEM Disetujui:
              </span>
              <div className="text-right">
                <span className="text-base font-extrabold text-blue-900 font-mono">
                  {snapshot.summary.totalPoints} Poin
                </span>
                <span className="ml-2 text-xs font-bold text-emerald-800 uppercase px-2 py-0.5 bg-emerald-100 rounded">
                  Predikat: {snapshot.summary.predicate}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Pengesahan SKPI */}
        <section className="pt-4 border-t border-slate-200 mt-6">
          <div className="bg-slate-100 border-l-4 border-blue-900 px-3 py-1.5 mb-4">
            <h3 className="text-xs font-bold text-blue-950 uppercase">
              5. PENGESAHAN SURAT KETERANGAN PENDAMPING IJAZAH
            </h3>
            <p className="text-[10px] italic text-slate-500">Certification of The Diploma Supplement</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 text-xs">
            {/* Left: QR Verification Stamp */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-16 h-16 bg-white border border-slate-300 rounded flex items-center justify-center p-1 text-slate-800">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Verifikasi Dokumen Resmi</p>
                <p className="text-[11px] text-slate-500">Pindai kode QR untuk validasi</p>
                <p className="text-[10px] font-mono text-slate-600 mt-1">{documentNumber}</p>
              </div>
            </div>

            {/* Right: Signature Box */}
            <div className="text-center sm:text-right min-w-[200px]">
              <p className="text-slate-600">Gresik, {new Date(publishedAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-900 mt-0.5">{snapshot.institution.jabatanPejabat}</p>
              
              <div className="my-3 py-2">
                {isDraft ? (
                  <span className="inline-block px-3 py-1 text-[11px] font-mono border border-dashed border-slate-300 text-slate-400 rounded">
                    [ DRAF - BELUM DITANDATANGANI ]
                  </span>
                ) : (
                  <div className="inline-block text-center border border-blue-200 bg-blue-50/50 px-3 py-1.5 rounded">
                    <ShieldCheck className="w-5 h-5 text-blue-800 mx-auto mb-0.5" />
                    <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                      Tersertifikasi Elektronik
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">BAAK POLTEKSI</span>
                  </div>
                )}
              </div>

              <p className="font-bold text-slate-900 underline">{snapshot.institution.pejabatPenandatangan}</p>
              <p className="text-slate-500 font-mono text-[11px]">NIP. {snapshot.institution.nipPejabat}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
