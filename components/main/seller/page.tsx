"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Store,
  MapPin,
  Phone,
  Mail,
  User,
  Info,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// New API Services for locations
import {
  useGetProvincesQuery,
  useGetCitiesQuery,
  useGetDistrictsQuery,
} from "@/services/shop/open-shop/open-shop.service";

// New API Service for seller registration
import { useCreateTokoMutation } from "@/services/admin/toko.service";
import DotdLoader from "@/components/loader/3dot";

// ==== Utils for API Data Normalization ====
const toList = (data: any) => data?.rajaongkir?.results || [];

const schema = yup.object().shape({
  name: yup.string().required("Nama toko wajib diisi"),
  phone: yup.string().required("Nomor telepon wajib diisi"),
  email: yup.string().email("Format email tidak valid").required("Email wajib diisi"),
  address: yup.string().required("Alamat lengkap wajib diisi"),
  description: yup.string().required("Deskripsi wajib diisi"),
  rajaongkir_province_id: yup.number().min(1, "Provinsi wajib dipilih").required(),
  rajaongkir_city_id: yup.number().min(1, "Kota wajib dipilih").required(),
  rajaongkir_district_id: yup.number().min(1, "Kecamatan wajib dipilih").required(),
});

export default function SellerPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: "pending",
      latitude: "-6.2088",
      longitude: "106.8456",
    },
  });

  const [createShop, { isLoading, isSuccess, isError, error }] = useCreateTokoMutation();

  const provinceId = watch("rajaongkir_province_id");
  const cityId = watch("rajaongkir_city_id");

  // Fetch location data
  const { data: provinces, isLoading: isProvincesLoading } = useGetProvincesQuery();
  const { data: cities, isLoading: isCitiesLoading } = useGetCitiesQuery(provinceId, { skip: !provinceId });
  const { data: districts, isLoading: isDistrictsLoading } = useGetDistrictsQuery(cityId, { skip: !cityId });

  // Reset city and district when province changes
  useEffect(() => {
    if (provinceId) {
      setValue("rajaongkir_city_id", "");
      setValue("rajaongkir_district_id", "");
    }
  }, [provinceId, setValue]);

  // Reset district when city changes
  useEffect(() => {
    if (cityId) {
      setValue("rajaongkir_district_id", "");
    }
  }, [cityId, setValue]);

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));

    try {
      await createShop(formData).unwrap();
    } catch (err) {
      console.error("Failed to register shop:", err);
    }
  };

  const provinceList = useMemo(() => toList(provinces), [provinces]);
  const cityList = useMemo(() => toList(cities), [cities]);
  const districtList = useMemo(() => toList(districts), [districts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#DFF19D]/10">
      {/* Header Section */}
      <section className="pt-24 pb-12 px-6 lg:px-12">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#E53935]/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#E53935]" />
            <span className="text-sm font-medium text-[#E53935]">
              Bergabung Bersama Kami
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-[#6B6B6B] mb-6">
            Jadilah <span className="block text-[#E53935]">Seller KOPERASI MERAH PUTIH</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Perluas jangkauan produk Anda, dapatkan akses ke ribuan anggota, dan
            berkembang bersama ekosistem koperasi yang kuat.
          </p>
        </div>
      </section>

      {/* Main Content & Form */}
      <section className="px-6 lg:px-12 mb-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-200">
            {/* Kelebihan Bagian Kanan */}
            <div className="lg:order-2 space-y-8 p-6 bg-[#6B6B6B]/5 rounded-2xl border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Mengapa Bergabung dengan Kami?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Store className="w-8 h-8 text-[#E53935] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Jangkauan Luas & Loyal
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Akses langsung ke ribuan anggota koperasi yang merupakan pasar
                      potensial dan loyal untuk produk Anda.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-8 h-8 text-[#E53935] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Dukungan & Pelatihan
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Kami menyediakan dukungan penuh dan pelatihan untuk
                      mengembangkan bisnis Anda.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <User className="w-8 h-8 text-[#E53935] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Sistem yang Mudah Digunakan
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Kelola toko, produk, dan pesanan Anda dengan dashboard yang
                      intuitif dan efisien.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Pendaftaran Bagian Kiri */}
            <div className="lg:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Formulir Pendaftaran
              </h2>

              {isSuccess && (
                <div className="bg-green-50 text-green-700 p-6 rounded-2xl mb-6 flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="font-bold">Pendaftaran Berhasil!</h4>
                    <p className="text-sm mt-1">
                      Terima kasih telah mendaftar. Tim kami akan segera meninjau
                      aplikasi Anda dan menghubungi Anda secepatnya.
                    </p>
                  </div>
                </div>
              )}

              {isError && (
                <div className="bg-red-50 text-red-700 p-6 rounded-2xl mb-6 flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <h4 className="font-bold">Pendaftaran Gagal</h4>
                    <p className="text-sm mt-1">
                      Terjadi kesalahan saat mengirim formulir. Silakan coba
                      kembali.
                    </p>
                    {error?.data?.message && (
                      <p className="text-xs mt-2 text-red-600">
                        Detail: {error.data.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nama Toko</label>
                  <input
                    type="text"
                    id="name"
                    {...register("name")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                  <input
                    type="text"
                    id="phone"
                    {...register("phone")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    {...register("email")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Toko</label>
                  <textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">Provinsi</label>
                    <select
                      id="province"
                      {...register("rajaongkir_province_id")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                      disabled={isProvincesLoading}
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinceList.map(p => (
                        <option key={p.province_id} value={p.province_id}>
                          {p.province}
                        </option>
                      ))}
                    </select>
                    {errors.rajaongkir_province_id && <p className="mt-1 text-sm text-red-600">Pilih provinsi.</p>}
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">Kota</label>
                    <select
                      id="city"
                      {...register("rajaongkir_city_id")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                      disabled={!provinceId || isCitiesLoading}
                    >
                      <option value="">Pilih Kota</option>
                      {cityList.map(c => (
                        <option key={c.city_id} value={c.city_id}>
                          {c.type} {c.city_name}
                        </option>
                      ))}
                    </select>
                    {errors.rajaongkir_city_id && <p className="mt-1 text-sm text-red-600">Pilih kota.</p>}
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
                    <select
                      id="district"
                      {...register("rajaongkir_district_id")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                      disabled={!cityId || isDistrictsLoading}
                    >
                      <option value="">Pilih Kecamatan</option>
                      {districtList.map(d => (
                        <option key={d.subdistrict_id} value={d.subdistrict_id}>
                          {d.subdistrict_name}
                        </option>
                      ))}
                    </select>
                    {errors.rajaongkir_district_id && <p className="mt-1 text-sm text-red-600">Pilih kecamatan.</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                  <textarea
                    id="address"
                    {...register("address")}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                </div>

                <div className="flex items-start p-4 bg-yellow-50 rounded-xl text-yellow-700 text-sm">
                  <Info className="w-5 h-5 flex-shrink-0 mr-3 mt-1" />
                  <span>
                    Untuk saat ini, koordinat (latitude & longitude) akan otomatis terisi dengan nilai default.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#E53935] text-white px-6 py-4 rounded-2xl font-semibold hover:bg-[#c62828] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <DotdLoader /> Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Pendaftaran
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA (reused with updated content) */}
      <section className="px-6 lg:px-12 mb-16">
        <div className="container mx-auto">
          <div className="bg-[#6B6B6B]/10 rounded-3xl p-10 lg:p-16 text-center shadow-sm">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              Pertanyaan Lebih Lanjut?
            </h3>
            <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Hubungi tim kami untuk informasi lebih detail tentang
              bagaimana KOPERASI MERAH PUTIH dapat membantu bisnis Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <button
                className="bg-[#6B6B6B] text-white px-8 py-4 rounded-full font-semibold 
                           hover:bg-[#6B6B6B]/90 transition-colors"
              >
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}