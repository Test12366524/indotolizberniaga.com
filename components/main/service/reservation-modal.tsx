"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Phone, User, MapPin } from "lucide-react"; // Menambahkan MapPin
import Image from "next/image";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Import dari cart/page.tsx
import { Combobox } from "@/components/ui/combo-box";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  useGetProvincesQuery,
  useGetCitiesQuery,
  useGetDistrictsQuery,
} from "@/services/shop/open-shop/open-shop.service";
import { useGetCurrentUserQuery } from "@/services/auth.service";
import { useCreateTransactionMutation } from "@/services/admin/transaction.service";
import { useGetUserAddressListQuery } from "@/services/address.service";
import type { Address } from "@/types/address";

interface ServiceType {
  id: number;
  thumbnail: string;
  images: Array<{ image: string }>;
  name: string;
  description: string;
  price: number;
  duration: string;
  category_name: string;
  merk_name: string;
}

type ErrorBag = Record<string, string[] | string>;

export default function ReservationModal({
  isOpen,
  onClose,
  service,
}: {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceType | null;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const sessionName = useMemo(() => session?.user?.name ?? "", [session]);

  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: CTA, Sorotan
  const TEXT_COLOR = "#343A40"; // Warna teks profesional
  const SECONDARY_TEXT = "#6C757D"; // Abu-abu sekunder

  // state internal untuk image preview
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    reservationDate: "",
    reservationTime: "",
  });

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address_line_1: "",
    city: "",
    postal_code: "",
    kecamatan: "",
    rajaongkir_province_id: 0,
    rajaongkir_city_id: 0,
    rajaongkir_district_id: 0,
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // Validation
  const validatePhone = (phone: string) => {
    const regex = /^(?:\+62|62|0)8\d{8,11}$/;
    return regex.test(phone);
  };

  useEffect(() => {
    setIsPhoneValid(validatePhone(formData.phone));
  }, [formData.phone]);

  // RTK Query hooks
  const { data: currentUserResp } = useGetCurrentUserQuery();
  const currentUser = useMemo(() => currentUserResp || null, [currentUserResp]);

  const { data: userAddressList } = useGetUserAddressListQuery({
    page: 1,
    paginate: 100,
  });

  const defaultAddress: Address | undefined = userAddressList?.data?.find(
    (a) => a.is_primary
  );

  const { data: provinces = [], isLoading: loadingProvince } =
    useGetProvincesQuery();
  const { data: cities = [], isLoading: loadingCity } = useGetCitiesQuery(
    shippingInfo.rajaongkir_province_id,
    { skip: !shippingInfo.rajaongkir_province_id }
  );
  const { data: districts = [], isLoading: loadingDistrict } =
    useGetDistrictsQuery(shippingInfo.rajaongkir_city_id, {
      skip: !shippingInfo.rajaongkir_city_id,
    });

  const [createTransaction] = useCreateTransactionMutation();

  const didPrefill = useRef(false);

  // Auto-fill user data
  useEffect(() => {
    if (didPrefill.current) return;
    if (sessionName) {
      setFormData((prev) => ({ ...prev, fullName: sessionName }));
      setShippingInfo((prev) => ({ ...prev, fullName: sessionName }));
    }
  }, [sessionName]);

  useEffect(() => {
    if (didPrefill.current) return;
    if (defaultAddress) {
      setShippingInfo((prev) => ({
        ...prev,
        phone: currentUser?.phone || "",
        address_line_1: defaultAddress.address_line_1 ?? prev.address_line_1,
        postal_code: defaultAddress.postal_code ?? prev.postal_code,
        rajaongkir_province_id:
          defaultAddress.rajaongkir_province_id ?? prev.rajaongkir_province_id,
        rajaongkir_city_id:
          defaultAddress.rajaongkir_city_id ?? prev.rajaongkir_city_id,
        rajaongkir_district_id:
          defaultAddress.rajaongkir_district_id ?? prev.rajaongkir_district_id,
      }));

      setFormData((prev) => ({
        ...prev,
        phone: currentUser?.phone || "",
      }));

      didPrefill.current = true;
    }
  }, [defaultAddress, currentUser]);

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Logika handleSubmit (dihilangkan dari contoh untuk fokus pada styling)

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white z-10">
          <h3 className="w-full text-xl md:text-left font-bold" style={{ color: TEXT_COLOR }}>
            Reservasi Jasa Purna Jual Indotoliz
          </h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg transition-colors"
            style={{ color: TEXT_COLOR }}
          >
            ✕
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Image Preview */}
          <div className="flex flex-col gap-4 min-h-80">
            {/* Gambar besar */}
            <div className="flex-5/6">
              <Image
                src={selectedImage || service.images[0].image}
                width={100}
                height={100}
                alt="Preview"
                className="w-full h-full md:max-h-80 object-cover rounded-2xl"
              />
            </div>

            {/* Thumbnail kecil */}
            <div className="grid grid-cols-4 gap-2 flex-1/6">
              {service.images.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(item.image)}
                  className={`border-2 rounded-xl overflow-hidden ${
                    selectedImage === item.image
                      ? "border-[#0077B6]" // Border Biru Stabil
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={`Thumb ${idx}`}
                    width={100}
                    height={100}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <form className="space-y-6">
              {/* Service Info */}
              <div className="p-4 rounded-2xl" style={{ backgroundColor: `${PRIMARY_COLOR}10` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${ACCENT_COLOR}10`, color: ACCENT_COLOR }}>
                    {service.category_name}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${SECONDARY_TEXT}10`, color: SECONDARY_TEXT }}>
                    {service.merk_name}
                  </span>
                </div>
                <p className="font-semibold" style={{ color: TEXT_COLOR }}>{service.name}</p>
                <p className="text-sm" style={{ color: SECONDARY_TEXT }}>{service.duration}</p>
                <p className="font-bold text-2xl" style={{ color: ACCENT_COLOR }}>
                  Rp {service.price.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Personal Info */}
              <div className="p-4 rounded-2xl" style={{ backgroundColor: `${SECONDARY_TEXT}05` }}>
                <h4 className="font-semibold mb-4" style={{ color: TEXT_COLOR }}>
                  Informasi Kontak
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama */}
                  <div className="flex items-center gap-2 border rounded-2xl px-3" style={{ borderColor: `${SECONDARY_TEXT}30` }}>
                    <User className="w-5 h-5" style={{ color: SECONDARY_TEXT }} />
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="w-full py-3 bg-transparent outline-none"
                      style={{ color: TEXT_COLOR }}
                      required
                    />
                  </div>

                  {/* Telepon */}
                  <div className="flex items-center gap-2 border rounded-2xl px-3" style={{ borderColor: `${SECONDARY_TEXT}30` }}>
                    <Phone className="w-5 h-5" style={{ color: SECONDARY_TEXT }} />
                    <input
                      type="text"
                      placeholder="No. WhatsApp"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full py-3 bg-transparent outline-none"
                      style={{ color: TEXT_COLOR }}
                      required
                    />
                  </div>
                  {!isPhoneValid && formData.phone && (
                    <p className="text-sm col-span-2" style={{ color: ACCENT_COLOR }}>
                      Nomor telepon tidak valid
                    </p>
                  )}
                </div>
              </div>

              {/* Reservation Date & Time */}
              <div className="p-4 rounded-2xl" style={{ backgroundColor: `${PRIMARY_COLOR}05` }}>
                <h4 className="font-semibold mb-4" style={{ color: PRIMARY_COLOR }}>
                  Jadwalkan Layanan Teknis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tanggal */}
                  <div className="flex items-center gap-2 border rounded-2xl px-3" style={{ borderColor: `${PRIMARY_COLOR}30` }}>
                    <Calendar className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                    <input
                      type="date"
                      value={formData.reservationDate}
                      onChange={(e) =>
                        handleInputChange("reservationDate", e.target.value)
                      }
                      className="w-full py-3 bg-transparent outline-none"
                      style={{ color: TEXT_COLOR }}
                      required
                    />
                  </div>

                  {/* Waktu */}
                  <div className="flex items-center gap-2 border rounded-2xl px-3" style={{ borderColor: `${PRIMARY_COLOR}30` }}>
                    <Clock className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                    <input
                      type="time"
                      value={formData.reservationTime}
                      onChange={(e) =>
                        handleInputChange("reservationTime", e.target.value)
                      }
                      className="w-full py-3 bg-transparent outline-none"
                      style={{ color: TEXT_COLOR }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address Info (Mengaktifkan kembali alamat untuk jasa yang butuh lokasi) */}
              <div className="p-4 rounded-2xl" style={{ backgroundColor: `${SECONDARY_TEXT}05` }}>
                <h4 className="font-semibold mb-4" style={{ color: TEXT_COLOR }}>Alamat Lokasi Layanan</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-2 border rounded-2xl px-3 pt-2" style={{ borderColor: `${SECONDARY_TEXT}30` }}>
                    <MapPin className="w-5 h-5 mt-2" style={{ color: SECONDARY_TEXT }} />
                    <textarea
                        value={shippingInfo.address_line_1}
                        onChange={(e) =>
                            handleShippingChange("address_line_1", e.target.value)
                        }
                        rows={3}
                        placeholder="Alamat lengkap (Nama jalan, RT/RW, Kelurahan)"
                        className="w-full px-1 py-1 bg-transparent outline-none resize-none"
                        style={{ color: TEXT_COLOR }}
                        required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: SECONDARY_TEXT }}>
                        Provinsi
                      </label>
                      <Combobox
                        value={shippingInfo.rajaongkir_province_id}
                        onChange={(id) => {
                          setShippingInfo((prev) => ({
                            ...prev,
                            rajaongkir_province_id: id,
                            rajaongkir_city_id: 0,
                            rajaongkir_district_id: 0,
                          }));
                        }}
                        data={provinces}
                        isLoading={loadingProvince}
                        getOptionLabel={(item) => item.name}
                        buttonClassName={`border-2 border-[${SECONDARY_TEXT}30]`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: SECONDARY_TEXT }}>
                        Kota / Kabupaten
                      </label>
                      <Combobox
                        value={shippingInfo.rajaongkir_city_id}
                        onChange={(id) => {
                          setShippingInfo((prev) => ({
                            ...prev,
                            rajaongkir_city_id: id,
                            rajaongkir_district_id: 0,
                          }));
                        }}
                        data={cities}
                        isLoading={loadingCity}
                        getOptionLabel={(item) => item.name}
                        disabled={!shippingInfo.rajaongkir_province_id}
                        buttonClassName={`border-2 border-[${SECONDARY_TEXT}30]`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: SECONDARY_TEXT }}>
                        Kecamatan
                      </label>
                      <Combobox
                        value={shippingInfo.rajaongkir_district_id}
                        onChange={(id) => {
                          setShippingInfo((prev) => ({
                            ...prev,
                            rajaongkir_district_id: id,
                          }));
                        }}
                        data={districts}
                        isLoading={loadingDistrict}
                        getOptionLabel={(item) => item.name}
                        disabled={!shippingInfo.rajaongkir_city_id}
                        buttonClassName={`border-2 border-[${SECONDARY_TEXT}30]`}
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={shippingInfo.postal_code}
                    onChange={(e) =>
                      handleShippingChange("postal_code", e.target.value)
                    }
                    placeholder="Kode Pos"
                    className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                    style={{ 
                        borderColor: `${SECONDARY_TEXT}30`, 
                        color: TEXT_COLOR
                    }}
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white py-4 rounded-2xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: ACCENT_COLOR }} // CTA Utama: Jingga Energi
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses Jasa...
                  </>
                ) : (
                  "Ajukan Reservasi Jasa"
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}