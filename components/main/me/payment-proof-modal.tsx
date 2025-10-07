"use client";

import { useState } from "react";
import { X, Upload, FileText } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  transactionId: string | null;
  uploadFn: (transactionId: string, file: File) => Promise<unknown>;
  onUploaded: () => Promise<void> | void;
  isUploading: boolean;
};

export default function PaymentProofModal({
  open,
  onClose,
  transactionId,
  uploadFn,
  onUploaded,
  isUploading,
}: Props) {
  const [file, setFile] = useState<File | null>(null);

  if (!open) return null;

  const handleUpload = async () => {
    if (!file || !transactionId) return;
    try {
      await uploadFn(transactionId, file);
      await onUploaded();
    } catch {
      // handled di caller (Swal) / service
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Upload Bukti Pembayaran
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              Pilih gambar bukti pembayaran (JPG/PNG)
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B] focus:border-transparent"
            />
          </div>

          {file && (
            <div className="text-sm text-gray-600">
              File dipilih: {file.name}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> Pastikan bukti jelas dan terbaca.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !transactionId || isUploading}
            className="flex-1 px-4 py-2 bg-[#6B6B6B] text-white rounded-lg hover:bg-[#6B6B6B]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}