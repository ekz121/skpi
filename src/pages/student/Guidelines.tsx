import React, { useState } from 'react';
import { SKEM_CATEGORIES, MANDATORY_ACTIVITIES_SPEC } from '../../server/rules.ts';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  HelpCircle, 
  FileCheck, 
  Layers, 
  AlertCircle,
  FileSpreadsheet,
  Building2,
  ShieldCheck,
  Star
} from 'lucide-react';

export const Guidelines: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'skem' | 'rubric' | 'wajib' | 'alur' | 'asumsi'>('skem');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Pedoman Resmi SKEM & SKPI Politeknik Semen Indonesia
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Panduan lengkap aturan perolehan poin ekstrakurikuler, verifikasi bukti, dan penerbitan Surat Keterangan Pendamping Ijazah.
        </p>

        {/* Tab Navigator */}
        <div className="flex flex-wrap gap-2 mt-5 border-b border-slate-200 pb-3">
          {[
            { id: 'skem', label: 'Pengantar SKEM & SKPI' },
            { id: 'rubric', label: 'Tabel Bobot Poin Lengkap' },
            { id: 'wajib', label: 'Ketentuan 4 Kegiatan Wajib' },
            { id: 'alur', label: 'Alur & Kriteria Bukti Sah' },
            { id: 'asumsi', label: 'Catatan Aturan & Konfigurasi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content: Pengantar SKEM & SKPI */}
      {activeTab === 'skem' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">1. Apa itu SKEM dan SKPI?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Satuan Kredit Ekstrakurikuler Mahasiswa (SKEM)</span>
                </h4>
                <p>
                  SKEM adalah sistem kuantifikasi penghargaan atas keikutsertaan mahasiswa dalam kegiatan non-akademik, kepemimpinan, keprofesian, prestasi lomba, dan pengabdian masyarakat selama menempuh pendidikan di Politeknik Semen Indonesia.
                </p>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">Target Kelulusan:</span>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>Angkatan 2023 dan seterusnya: <strong>Minimal 500 Poin</strong>.</li>
                    <li>Angkatan 2022: <strong>Keringanan 300 Poin</strong>.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Surat Keterangan Pendamping Ijazah (SKPI)</span>
                </h4>
                <p>
                  SKPI adalah dokumen resmi pelengkap ijazah yang menerangkan kemampuan kerja, penguasaan pengetahuan, capaian pembelajaran (learning outcomes), dan rekam jejak prestasi mahasiswa sesuai Kerangka Kualifikasi Nasional Indonesia (KKNI).
                </p>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">Syarat Penerbitan:</span>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>Akumulasi poin SKEM mencukupi target.</li>
                    <li>Lulus seluruh 4 Kegiatan Wajib Kampus.</li>
                    <li>Data akademik (No. Ijazah & Kelulusan) terverifikasi BAAK.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Predicate Brackets */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Rentang Predikat Poin SKEM</h3>
            <p className="text-xs text-slate-500">Predikat kelulusan SKEM tercantum secara resmi pada lembar SKPI:</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <span className="text-xs text-red-700 font-mono block">&lt; 500 Poin</span>
                <span className="text-sm font-bold text-red-900 uppercase">Kurang</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-xs text-slate-600 font-mono block">500 – 600 Poin</span>
                <span className="text-sm font-bold text-slate-900 uppercase">Cukup</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <span className="text-xs text-blue-700 font-mono block">601 – 700 Poin</span>
                <span className="text-sm font-bold text-blue-900 uppercase">Baik</span>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                <span className="text-xs text-indigo-700 font-mono block">701 – 800 Poin</span>
                <span className="text-sm font-bold text-indigo-900 uppercase">Sangat Baik</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center col-span-2 sm:col-span-1">
                <span className="text-xs text-emerald-700 font-mono block">&gt; 800 Poin</span>
                <span className="text-sm font-bold text-emerald-900 uppercase">Unggul</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Tabel Bobot Poin */}
      {activeTab === 'rubric' && (
        <div className="space-y-6">
          {SKEM_CATEGORIES.map((cat, idx) => (
            <div key={cat.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Kategori 0{idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                </div>
                <span className="text-xs font-mono font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700">
                  {cat.subcategories.length} Kegiatan
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {cat.subcategories.map((sub) => (
                  <div key={sub.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900">{sub.name}</h4>
                        {sub.mandatoryType && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            Kegiatan Wajib Kampus
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{sub.description}</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        <span className="font-semibold">Bukti: </span>{sub.allowedEvidence.join(' / ')}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-3 py-1 bg-slate-900 text-white font-mono font-bold rounded-lg text-xs">
                        +{sub.defaultPoints} Poin
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: 4 Kegiatan Wajib */}
      {activeTab === 'wajib' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ketentuan 4 Kegiatan Wajib Kampus</h3>
            <p className="text-xs text-slate-500 mt-1">
              Setiap mahasiswa Politeknik Semen Indonesia wajib menyelesaikan dan mendapatkan persetujuan atas ke-4 kegiatan di bawah ini:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(MANDATORY_ACTIVITIES_SPEC).map((spec, i) => (
              <div key={i} className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <h4 className="text-xs font-bold text-blue-950 uppercase">{spec.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{spec.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-200/50 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Bobot Poin:</span>
                  <span className="font-mono font-bold text-blue-900">Minimal 50–100 Poin</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Aturan Khusus Kegiatan Wajib:</span>
            </span>
            <p>
              1. Total poin SKEM yang melampaui target tidak dapat menggantikan kewajiban checklist ini.
            </p>
            <p>
              2. Bukti magang, sertifikasi BNSP, kelulusan PKKMB, dan LKMM harus diverifikasi dan berstatus <strong>Disetujui</strong> oleh BAAK.
            </p>
          </div>
        </div>
      )}

      {/* Tab Content: Alur & Bukti Sah */}
      {activeTab === 'alur' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900">Alur Pengajuan & Kriteria Keabsahan Berkas</h3>
          
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <h4 className="font-bold text-slate-900">Unggah Berkas (Mahasiswa)</h4>
                <p className="text-slate-500 mt-0.5">Mahasiswa mengunggah berkas sertifikat asli berformat PDF/JPG/PNG. Mengisi nama kegiatan, penyelenggara, dan tanggal.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <h4 className="font-bold text-slate-900">Verifikasi Berkas (Administrator BAAK)</h4>
                <p className="text-slate-500 mt-0.5">Admin memeriksa identitas, tanggal kegiatan, masa studi, keabsahan tanda tangan/QR, dan menentukan poin sah.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">3</div>
              <div>
                <h4 className="font-bold text-slate-900">Keputusan & Poin Masuk Sistem</h4>
                <p className="text-slate-500 mt-0.5">Jika disetujui, poin masuk ke akumulasi dan checklist wajib terupdate. Jika perlu revisi, mahasiswa dapat memperbaiki berkas tanpa menggandakan pengajuan.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">4</div>
              <div>
                <h4 className="font-bold text-slate-900">Pengajuan & Penerbitan SKPI Resmi</h4>
                <p className="text-slate-500 mt-0.5">Setelah memenuhi syarat, mahasiswa mengajukan SKPI. BAAK memeriksa nomor ijazah dan kelulusan, lalu menerbitkan PDF final bertanda tangan digital resmi.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Catatan Aturan & Konfigurasi */}
      {activeTab === 'asumsi' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs leading-relaxed text-slate-600">
          <h3 className="text-sm font-bold text-slate-900">Dokumentasi Asumsi Aturan Kampus</h3>
          <p>
            Sesuai petunjuk implementasi, sistem mencatat asumsi yang digunakan berdasarkan dokumen pedoman:
          </p>

          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Batas Poin Kelulusan:</strong> Digunakan ketentuan minimal 500 poin untuk angkatan 2023 ke atas, dan 300 poin untuk angkatan 2022 (keringanan).
            </li>
            <li>
              <strong>Tabel Predikat:</strong> Digunakan tabel pertama pada lampiran pedoman (&lt;500: Kurang, 500–600: Cukup, 601–700: Baik, 701–800: Sangat Baik, &gt;800: Unggul).
            </li>
            <li>
              <strong>Pemetaan Template SKPI:</strong> Format SKPI mengikuti struktur resmi Politeknik Semen Indonesia dengan 5 bagian baku. Kategori ke-4 (Projek/Riset/Pengabdian) dipetakan ke Bagian 4 sub D agar seluruh kegiatan bernilai SKEM tetap terdokumentasi tanpa menghilangkan integritas template surat.
            </li>
            <li>
              <strong>Nomor Dokumen Permanen:</strong> Dokumen final yang terbit memiliki nomor surat unik (format: <code>SKPI/POLTEKSI/[TAHUN]/[NO_URUT]</code>) yang disimpan secara permanen di database.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
