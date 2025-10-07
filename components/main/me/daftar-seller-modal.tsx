"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import {
  useCreateShopMutation,
  useGetProvincesQuery,
  useGetCitiesQuery,
  useGetDistrictsQuery,
} from "@/services/shop/open-shop/open-shop.service";
import { toList } from "@/types/geo";
import type { Region } from "@/types/shop";
import type { UserProfile } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userProfile: UserProfile;
}

export default function DaftarSellerModal({
  isOpen,
  onClose,
  onSuccess,
  userProfile,
}: Props) {
  const { data: session } = useSession();
  const [createShop, { isLoading: isCreatingShop }] = useCreateShopMutation();

  const { data: provinces } = useGetProvincesQuery();
  const provinceList = useMemo(() => toList<Region>(provinces), [provinces]);

  const [formData, setFormData] = useState({
    name: "",
    phone: userProfile.phone || session?.user?.phone || "",
    email: userProfile.email || session?.user?.email || "",
    address: "",
    description: "",
    rajaongkir_province_id: null as number | null,
    rajaongkir_city_id: null as number | null,
    rajaongkir_district_id: null as number | null,
    postal_code: "",
    latitude: "0",
    longitude: "0",
  });

  const provinceId = formData.rajaongkir_province_id ?? 0;
  const { data: cities } = useGetCitiesQuery(provinceId, {
    skip: !formData.rajaongkir_province_id,
  });
  const cityList = useMemo(() => toList<Region>(cities), [cities]);

  const cityId = formData.rajaongkir_city_id ?? 0;
  const { data: districts } = useGetDistrictsQuery(cityId, {
    skip: !formData.rajaongkir_city_id,
  });
  const districtList = useMemo(() => toList<Region>(districts), [districts]);

  useEffect(() => {
    if (!isOpen) return;
    setFormData((prev) => ({
      ...prev,
      phone: userProfile.phone || session?.user?.phone || "",
      email: userProfile.email || session?.user?.email || "",
    }));
  }, [isOpen, session, userProfile]);

  const [files, setFiles] = useState<{
    logo: File | null;
    banner: File | null;
  }>({ logo: null, banner: null });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles((p) => ({ ...p, [name]: selectedFiles[0] ?? null }));
    }
  };

  const handleRegionChange = (name: string, value: string | number | null) => {
    const v = value ? Number(value) : null;
    setFormData((prev) => {
      const next = { ...prev, [name]: v } as typeof prev;
      if (name === "rajaongkir_province_id") {
        next.rajaongkir_city_id = null;
        next.rajaongkir_district_id = null;
      } else if (name === "rajaongkir_city_id") {
        next.rajaongkir_district_id = null;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (
        !formData.name ||
        !formData.phone ||
        !formData.email ||
        !formData.address ||
        !formData.rajaongkir_province_id ||
        !formData.rajaongkir_city_id ||
        !formData.rajaongkir_district_id
      ) {
        throw new Error("Mohon lengkapi semua data toko dan alamat.");
      }

      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("phone", formData.phone);
      fd.append("email", formData.email);
      fd.append("address", formData.address);
      fd.append("description", formData.description);
      fd.append(
        "rajaongkir_province_id",
        String(formData.rajaongkir_province_id)
      );
      fd.append("rajaongkir_city_id", String(formData.rajaongkir_city_id));
      fd.append(
        "rajaongkir_district_id",
        String(formData.rajaongkir_district_id)
      );
      fd.append("postal_code", formData.postal_code);
      fd.append("latitude", formData.latitude);
      fd.append("longitude", formData.longitude);
      fd.append("status", "1");
      if (files.logo) fd.append("logo", files.logo);
      if (files.banner) fd.append("banner", files.banner);

      await createShop(fd).unwrap();
      await Swal.fire(
        "Sukses",
        "Formulir pendaftaran seller telah dikirim dan akan segera diverifikasi!",
        "success"
      );
      onSuccess();
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mendaftar seller";
      Swal.fire("Gagal", msg, "error");
      console.error(err);
    }
  };

  const FileInput: React.FC<{
    name: keyof typeof files;
    label: string;
    icon: React.ReactNode;
    currentFile: File | null;
  }> = ({ name, label, icon, currentFile }) => (
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
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );

  if (!isOpen) return null;

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
              Formulir Pendaftaran Seller
            </h3>
            <p className="text-sm text-gray-500">
              Lengkapi data toko Anda untuk mulai berjualan.
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
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Nama Toko
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
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                No. HP Toko
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

            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Email Toko
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

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Deskripsi Toko (Opsional)
              </label>
              <textarea
                name="description"
                id="description"
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
              />
            </div>

            {/* Alamat */}
            <div className="md:col-span-2 border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Alamat Toko
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                <div>
                  <label
                    htmlFor="rajaongkir_province_id"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Provinsi
                  </label>
                  <select
                    id="rajaongkir_province_id"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                    value={formData.rajaongkir_province_id ?? ""}
                    onChange={(e) =>
                      handleRegionChange(
                        "rajaongkir_province_id",
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {provinceList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="rajaongkir_city_id"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Kota/Kabupaten
                  </label>
                  <select
                    id="rajaongkir_city_id"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                    value={formData.rajaongkir_city_id ?? ""}
                    onChange={(e) =>
                      handleRegionChange("rajaongkir_city_id", e.target.value)
                    }
                    disabled={!formData.rajaongkir_province_id}
                    required
                  >
                    <option value="">-- Pilih Kota/Kabupaten --</option>
                    {cityList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="rajaongkir_district_id"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Kecamatan
                  </label>
                  <select
                    id="rajaongkir_district_id"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                    value={formData.rajaongkir_district_id ?? ""}
                    onChange={(e) =>
                      handleRegionChange(
                        "rajaongkir_district_id",
                        e.target.value
                      )
                    }
                    disabled={!formData.rajaongkir_city_id}
                    required
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                    {districtList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Detail Alamat
              </label>
              <textarea
                name="address"
                id="address"
                rows={2}
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="postal_code"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Kode Pos (Opsional)
              </label>
              <input
                type="text"
                name="postal_code"
                id="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Upload Logo & Banner (Opsional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileInput
                name="logo"
                label="Upload Logo Toko"
                icon={<ImageIcon className="w-6 h-6 text-gray-500" />}
                currentFile={files.logo}
              />
              <FileInput
                name="banner"
                label="Upload Banner Toko"
                icon={<ImageIcon className="w-6 h-6 text-gray-500" />}
                currentFile={files.banner}
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
              disabled={isCreatingShop}
              className="px-6 py-2 bg-[#6B6B6B] text-white rounded-lg font-semibold hover:bg-[#5a5a5a] disabled:opacity-50"
            >
              {isCreatingShop ? "Mengirim..." : "Kirim Pendaftaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}