import React, { useState } from 'react';
import { SKEM_CATEGORIES } from '../../server/rules.ts';
import { api } from '../../lib/api.ts';
import { CertificateItem } from '../../types.ts';
import { 
  Trophy, 
  Award, 
  Users2, 
  Lightbulb, 
  CheckCircle2, 
  UploadCloud, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Send, 
  FileText, 
  AlertCircle, 
  Info,
  Calendar,
  Building,
  Check,
  Star
} from 'lucide-react';

interface UploadCertificateProps {
  onSuccess: (newCert: CertificateItem) => void;
  onCancel?: () => void;
}

export const UploadCertificate: React.FC<UploadCertificateProps> = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [categoryId, setCategoryId] = useState<string>('prestasi');
  const [subcategoryId, setSubcategoryId] = useState<string>('prestasi_nasional_juara1');
  
  const [activityName, setActivityName] = useState<string>('');
  const [organizer, setOrganizer] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [academicYear, setAcademicYear] = useState<string>('2025/2026 Ganjil');
  const [certificateNumber, setCertificateNumber] = useState<string>('');
  const [verificationUrl, setVerificationUrl] = useState<string>('');
  
  // Specific extra fields
  const [roleTitle, setRoleTitle] = useState<string>('');
  const [competitionLevel, setCompetitionLevel] = useState<string>('Nasional');
  const [durationText, setDurationText] = useState<string>('1 Semester');

  // File
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  const selectedCategory = SKEM_CATEGORIES.find(c => c.id === categoryId) || SKEM_CATEGORIES[0];
  const selectedSubcategory = selectedCategory.subcategories.find(s => s.id === subcategoryId) || selectedCategory.subcategories[0];

  const handleCategorySelect = (catId: string) => {
    setCategoryId(catId);
    const cat = SKEM_CATEGORIES.find(c => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      setSubcategoryId(cat.subcategories[0].id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      
      if (!validTypes.includes(file.type)) {
        setErrorMsg('Format file tidak didukung. Harap unggah PDF, JPG, atau PNG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal adalah 5MB.');
        return;
      }

      setErrorMsg(null);
      setSelectedFile(file);

      if (file.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    setErrorMsg(null);

    if (!isDraft) {
      if (!activityName.trim()) {
        setErrorMsg('Nama kegiatan wajib diisi.');
        setCurrentStep(3);
        return;
      }
      if (!organizer.trim()) {
        setErrorMsg('Penyelenggara kegiatan wajib diisi.');
        setCurrentStep(3);
        return;
      }
      if (!selectedFile) {
        setErrorMsg('Berkas bukti kegiatan (PDF / JPG / PNG) wajib dilampirkan.');
        setCurrentStep(3);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('subcategoryId', subcategoryId);
      formData.append('activityName', activityName || 'Draf Kegiatan');
      formData.append('organizer', organizer || '-');
      formData.append('activityDate', activityDate);
      formData.append('academicYear', academicYear);
      formData.append('certificateNumber', certificateNumber);
      formData.append('verificationUrl', verificationUrl);
      formData.append('isDraft', isDraft ? 'true' : 'false');

      const extraDetails = {
        roleTitle,
        competitionLevel,
        durationText
      };
      formData.append('extraDetails', JSON.stringify(extraDetails));

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await api.createCertificate(formData);
      onSuccess(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pengajuan kegiatan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category Icons helper
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'prestasi': return Trophy;
      case 'pelatihan': return Award;
      case 'organisasi': return Users2;
      case 'projek': return Lightbulb;
      default: return Award;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Formulir Pengajuan SKEM Mahasiswa
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Ajukan sertifikat dan bukti kegiatan ekstrakurikuler Anda untuk diverifikasi oleh BAAK.
        </p>

        {/* 4 Steps Indicator */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { step: 1, title: '1. Pilih Kategori' },
            { step: 2, title: '2. Jenis Kegiatan' },
            { step: 3, title: '3. Detail & Bukti' },
            { step: 4, title: '4. Ringkasan & Kirim' },
          ].map((item) => (
            <div
              key={item.step}
              onClick={() => {
                // allow clicking previous steps
                if (item.step < currentStep) setCurrentStep(item.step);
              }}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                currentStep === item.step
                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                  : currentStep > item.step
                  ? 'bg-slate-50 border-slate-200 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                currentStep === item.step
                  ? 'bg-blue-600 text-white'
                  : currentStep > item.step
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > item.step ? <Check className="w-3 h-3" /> : item.step}
              </div>
              <span className="truncate">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Pilih Kategori */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Tahap 1: Pilih Kategori Kegiatan SKEM</h3>
            <p className="text-xs text-slate-500">Pilih salah satu dari 4 kategori resmi sesuai pedoman SKEM Politeknik Semen Indonesia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {SKEM_CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const isSelected = categoryId === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-lg shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{cat.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{cat.description}</p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-blue-700">
                        {cat.subcategories.length} Pilihan Subkegiatan
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <span>Lanjut ke Jenis Kegiatan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Jenis Kegiatan & Bobot */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
              Kategori: {selectedCategory.name}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              Tahap 2: Tentukan Klasifikasi & Jenis Kegiatan
            </h3>
            <p className="text-xs text-slate-500">
              Pilih item yang persis sesuai sertifikat. Bobot poin tertera secara eksplisit menurut pedoman kampus.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
            {selectedCategory.subcategories.map((sub) => {
              const isSelected = subcategoryId === sub.id;
              const isMandatory = !!sub.mandatoryType;

              return (
                <div
                  key={sub.id}
                  onClick={() => setSubcategoryId(sub.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900">{sub.name}</h4>
                      {isMandatory && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Kegiatan Wajib</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{sub.description}</p>
                    <div className="mt-2 text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700">Bukti yang diakui: </span>
                      {sub.allowedEvidence.join(' · ')}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-mono font-bold">
                      +{sub.defaultPoints} Poin
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">Estimasi Bobot</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <span>Lanjut Isi Detail & Bukti</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Detail dan Unggah Bukti */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Tahap 3: Informasi Detail Kegiatan & Unggah Dokumen Bukti
            </h3>
            <p className="text-xs text-slate-500">
              Isi data identitas kegiatan dan lampirkan sertifikat/SK resmi (PDF / JPG / PNG, maks. 5MB).
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Kegiatan / Prestasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="Contoh: Juara 1 Lomba Inovasi Teknologi Semen Nasional 2024"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penyelenggara / Institusi Terkait <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="Contoh: PT Semen Indonesia (Persero) Tbk"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal / Periode Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Akademik
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                >
                  <option value="2025/2026 Ganjil">2025/2026 Ganjil</option>
                  <option value="2024/2025 Genap">2024/2025 Genap</option>
                  <option value="2024/2025 Ganjil">2024/2025 Ganjil</option>
                  <option value="2023/2024 Genap">2023/2024 Genap</option>
                  <option value="2023/2024 Ganjil">2023/2024 Ganjil</option>
                  <option value="2022/2023">2022/2023</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Sertifikat / SK (Jika ada)
                </label>
                <input
                  type="text"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  placeholder="Contoh: BNSP-092-2024 atau SK-DIR/042/2024"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tautan / URL Verifikasi Sertifikat Online (Opsional)
              </label>
              <input
                type="url"
                value={verificationUrl}
                onChange={(e) => setVerificationUrl(e.target.value)}
                placeholder="https://verifikasi.lembaga.or.id/id-sertifikat"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {/* File Upload Drop Area */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unggah Berkas Bukti Sah <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 bg-slate-50/50 transition-colors">
                <input
                  type="file"
                  id="certificateFileInput"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="certificateFileInput" className="cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <span className="text-xs font-bold text-blue-700 hover:underline">
                    Pilih file dokumen bukti
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Format: PDF, JPG, JPEG, atau PNG (Maksimal 5 MB)
                  </p>
                </label>

                {selectedFile && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</span>
                  </div>
                )}
              </div>

              {/* Image preview if image selected */}
              {filePreviewUrl && (
                <div className="mt-3 p-2 bg-slate-100 rounded-lg max-w-xs mx-auto border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-1">Pratinjau Gambar:</p>
                  <img src={filePreviewUrl} alt="Pratinjau" className="max-h-40 rounded mx-auto object-contain" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button
              onClick={() => {
                if (!activityName.trim() || !organizer.trim() || !selectedFile) {
                  setErrorMsg('Harap lengkapi nama kegiatan, penyelenggara, dan unggah berkas bukti.');
                  return;
                }
                setErrorMsg(null);
                setCurrentStep(4);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <span>Lanjut ke Ringkasan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Ringkasan & Kirim */}
      {currentStep === 4 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Tahap 4: Ringkasan Pengajuan Sertifikat Kegiatan
            </h3>
            <p className="text-xs text-slate-500">
              Periksa kembali seluruh data sebelum mengirim atau menyimpan sebagai draf.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Kategori SKEM:</span>
              <span className="font-bold text-slate-900">{selectedCategory.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Jenis Kegiatan:</span>
              <span className="font-semibold text-slate-900">{selectedSubcategory.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Nama Kegiatan:</span>
              <span className="font-semibold text-slate-900 text-right max-w-sm">{activityName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Penyelenggara:</span>
              <span className="font-semibold text-slate-900">{organizer}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Tanggal Pelaksanaan:</span>
              <span className="font-mono text-slate-800">{activityDate} ({academicYear})</span>
            </div>
            {certificateNumber && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">No. Sertifikat/SK:</span>
                <span className="font-mono text-slate-800">{certificateNumber}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Berkas Bukti:</span>
              <span className="font-semibold text-blue-700">{selectedFile?.name || 'Belum diunggah'}</span>
            </div>
          </div>

          {/* Points Disclaimer Box */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-950 block">Estimasi Bobot Poin:</span>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Estimasi poin bersifat sementara dan belum masuk ke total poin sah sebelum disetujui Admin BAAK.
                </p>
              </div>
              <span className="text-xl font-black font-mono text-blue-900 px-3 py-1 bg-white rounded-lg border border-blue-200 shadow-2xs">
                +{selectedSubcategory.defaultPoints} Poin
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali & Ubah</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>Simpan Sebagai Draf</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
