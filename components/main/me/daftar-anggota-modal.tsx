"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { X, FileText, Image as ImageIcon } from "lucide-react";
import { useCreateAnggotaMutation } from "@/services/koperasi-service/anggota.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DaftarAnggotaModal({ isOpen, onClose }: Props) {
  const { data: session } = useSession();
  const [createAnggota, { isLoading: isCreating }] = useCreateAnggotaMutation();

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    nik: "",
    email: session?.user?.email || "",
    phone: session?.user?.phone || "",
    gender: "",
    birth_place: "",
    birth_date: "",
    npwp: "",
    nip: "",
    unit_kerja: "",
    jabatan: "",
    address: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: session?.user?.phone || "",
    }));
  }, [session]);

  const [files, setFiles] = useState<{
    fileKtp: File | null;
    foto: File | null;
    slipGaji: File | null;
  }>({ fileKtp: null, foto: null, slipGaji: null });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] ?? null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.nik ||
        !formData.gender ||
        !formData.birth_place ||
        !formData.birth_date ||
        !formData.address
      ) {
        throw new Error("Semua field wajib diisi kecuali yang opsional.");
      }
      if (!files.fileKtp || !files.foto || !files.slipGaji) {
        throw new Error("Semua dokumen wajib diupload.");
      }

      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("nik", formData.nik);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("gender", formData.gender);
      fd.append("birth_place", formData.birth_place);
      fd.append("birth_date", formData.birth_date);
      fd.append("address", formData.address);
      fd.append("status", "0");
      if (formData.npwp) fd.append("npwp", formData.npwp);
      if (formData.nip) fd.append("nip", formData.nip);
      if (formData.unit_kerja) fd.append("unit_kerja", formData.unit_kerja);
      if (formData.jabatan) fd.append("jabatan", formData.jabatan);
      if (files.fileKtp) fd.append("file_nik", files.fileKtp);
      if (files.foto) fd.append("foto", files.foto);
      if (files.slipGaji) fd.append("slip_gaji", files.slipGaji);

      await createAnggota(fd).unwrap();
      await Swal.fire(
        "Sukses",
        "Formulir pendaftaran telah dikirim!",
        "success"
      );
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan";
      Swal.fire("Gagal", msg, "error");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const FileInput = ({
    name,
    label,
    icon,
    currentFile,
  }: {
    name: keyof typeof files;
    label: string;
    icon: React.ReactNode;
    currentFile: File | null;
  }) => (
    <div>
      <label
        htmlFor={name}
        className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#6B6B6B] hover:bg-gray-100 transition-all"
      >
        {icon}
        <div className="flex flex-col">
          <span className="font-semibold text-gray-700">{label}</span>
          <span className="text-xs text-gray-500 truncate">
            {currentFile ? currentFile.name : "Pilih file..."}
          </span>
        </div>
      </label>
      <input
        id={name}
        name={name}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 m-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Formulir Pendaftaran Anggota
            </h3>
            <p className="text-sm text-gray-500">
              Lengkapi data di bawah ini untuk bergabung.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* field-field seperti semula */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="nik"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                No. KTP
              </label>
              <input
                type="number"
                name="nik"
                id="nik"
                value={formData.nik}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                No. HP
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Jenis Kelamin
              </label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                required
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="M">Laki-laki</option>
                <option value="F">Perempuan</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="nip"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                NIP (Opsional)
              </label>
              <input
                type="text"
                name="nip"
                id="nip"
                value={formData.nip}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
              />
            </div>

            <div>
              <label
                htmlFor="birth_place"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Tempat Lahir
              </label>
              <input
                type="text"
                name="birth_place"
                id="birth_place"
                value={formData.birth_place}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="birth_date"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="birth_date"
                id="birth_date"
                value={formData.birth_date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="npwp"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                NPWP (Opsional)
              </label>
              <input
                type="text"
                name="npwp"
                id="npwp"
                value={formData.npwp}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
              />
            </div>

            <div>
              <label
                htmlFor="jabatan"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Jabatan
              </label>
              <input
                type="text"
                name="jabatan"
                id="jabatan"
                value={formData.jabatan}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="unit_kerja"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Unit Kerja
              </label>
              <input
                type="text"
                name="unit_kerja"
                id="unit_kerja"
                value={formData.unit_kerja}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Alamat Lengkap (sesuai KTP)
              </label>
              <textarea
                name="address"
                id="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                required
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Upload Dokumen
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FileInput
                name="fileKtp"
                label="Upload KTP"
                icon={<FileText className="w-6 h-6 text-gray-500" />}
                currentFile={files.fileKtp}
              />
              <FileInput
                name="foto"
                label="Upload Foto"
                icon={<ImageIcon className="w-6 h-6 text-gray-500" />}
                currentFile={files.foto}
              />
              <FileInput
                name="slipGaji"
                label="Upload Slip Gaji"
                icon={<FileText className="w-6 h-6 text-gray-500" />}
                currentFile={files.slipGaji}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2 bg-[#6B6B6B] text-white rounded-lg font-semibold hover:bg-[#5a5a5a] disabled:opacity-60"
            >
              {isCreating ? "Mengirim..." : "Kirim Pendaftaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}