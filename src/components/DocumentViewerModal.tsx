import React from 'react';
import { CertificateItem } from '../types.ts';
import { X, ExternalLink, Download, FileText, Calendar, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.ts';

interface DocumentViewerModalProps {
  certificate: CertificateItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  certificate,
  isOpen,
  onClose
}) => {
  if (!isOpen || !certificate) return null;

  const fileUrl = api.getCertificateFileUrl(certificate.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {certificate.activityName}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {certificate.fileName} · {Math.round(certificate.fileSize / 1024)} KB · {certificate.fileMimeType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Tab Baru</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-3 bg-slate-100/70 text-xs border-b border-slate-200">
          <div>
            <span className="text-slate-500 block">Mahasiswa:</span>
            <span className="font-semibold text-slate-800">{certificate.studentName} ({certificate.studentNim})</span>
          </div>
          <div>
            <span className="text-slate-500 block">Status:</span>
            <span className={`inline-flex items-center gap-1 font-semibold ${
              certificate.status === 'Disetujui' ? 'text-emerald-700' :
              certificate.status === 'Perlu Revisi' ? 'text-amber-700' :
              certificate.status === 'Ditolak' ? 'text-red-700' : 'text-blue-700'
            }`}>
              {certificate.status}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Poin SKEM:</span>
            <span className="font-bold text-slate-900">
              {certificate.status === 'Disetujui' ? `${certificate.approvedPoints} Disetujui` : `${certificate.estimatedPoints} Estimasi`}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Nomor Sertifikat/SK:</span>
            <span className="font-mono text-slate-700 truncate block">{certificate.certificateNumber || '-'}</span>
          </div>
        </div>

        {/* Document Viewer Frame */}
        <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex items-center justify-center min-h-[350px]">
          <iframe
            src={fileUrl}
            title={certificate.activityName}
            className="w-full h-full min-h-[450px] border-0 rounded bg-white shadow-inner"
          />
        </div>

        {/* Verification / Admin Notes Footer */}
        {certificate.adminNotes && (
          <div className="p-3 bg-amber-50 border-t border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Catatan Administrator BAAK: </span>
              <span>{certificate.adminNotes}</span>
            </div>
          </div>
        )}

        <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Penyelenggara: <strong>{certificate.organizer}</strong> · {certificate.activityDate}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
