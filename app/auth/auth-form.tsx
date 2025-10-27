"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useRegisterMutation,
  useResendVerificationMutation,
} from "@/services/auth.service";
import Swal from "sweetalert2";
import {
  FaLock,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaArrowRight,
  FaShoppingCart, // Mengganti FaCoins
  FaTruckLoading, // Mengganti FaHandshake
  FaChartLine,
  FaWarehouse, // Mengganti FaPiggyBank
  FaUsers,
  FaBoxes, // Mengganti FaBuilding
  FaCreditCard, // Mengganti FaCalculator
  FaShieldAlt,
  FaPlus,
  FaTrash,
  FaStore, // Ikon baru untuk bisnis
  FaGlobe, // Ikon baru untuk jangkauan
} from "react-icons/fa";
import { motion } from "framer-motion";
import { formatDateForInput } from "@/lib/format-utils";
// import type { DocumentsAnggota } from "@/types/koperasi-types/anggota"; // Ini mungkin tidak relevan lagi, sesuaikan jika ada dokumen seller

type AuthFormProps = {
  mode: "login" | "register";
};

type RegisterError = {
  status: number;
  data?: {
    message?: string;
    [key: string]: unknown;
  };
};

// Sesuaikan tipe dokumen jika ini untuk seller/penjual, bukan anggota koperasi
type DocumentsSeller = {
  id: number;
  seller_id: number;
  key: string; // Misal: "KTP", "SIUP", "NPWP Perusahaan"
  document: File | null;
  created_at: string;
  updated_at: string;
  media: Array<{ original_url: string }>;
};

const makeEmptyDoc = (seller_id = 0): DocumentsSeller => ({
  id: 0,
  seller_id,
  key: "",
  document: null,
  created_at: "",
  updated_at: "",
  media: [] as DocumentsSeller["media"],
});

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Gambar carousel yang lebih relevan untuk e-commerce / B2B
const carouselImages = [
  "https://images.unsplash.com/photo-1572021332263-ad02e93d8b24?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Gudang modern / logistik
  "https://images.unsplash.com/photo-1522071820081-009f0129c7ce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Tim kolaborasi / meeting
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Dashboard analytics
];

// === Interface 2: payload eksplisit untuk register ===
type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  // Field tambahan untuk seller/penjual
  business_name?: string;
  business_category?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  // dokumen mungkin dikirim terpisah atau hanya meta datanya
};

type FieldErrors = Partial<Record<keyof RegisterPayload, string>> & {
  password_confirmation?: string;
};

const digitsOnly = (s: string) => s.replace(/\D+/g, "");
const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isValidPassword = (s: string) =>
  s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s);
const isValidPhoneID = (s: string) => {
  const d = digitsOnly(s);
  return d.startsWith("08") && d.length >= 10 && d.length <= 14;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isLogin = mode === "login";
  const isRegister = !isLogin;

  // === DEFINISI WARNA BRAND ===
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: CTA, Sorotan
  const TEXT_COLOR = "#343A40"; // Warna teks profesional
  const SECONDARY_TEXT = "#6C757D"; // Abu-abu sekunder
  const LIGHT_PRIMARY_BG = `${PRIMARY_COLOR}1A`; // Biru transparan untuk latar belakang ringan

  // ===== Umum (Akun) =====
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  // ===== Field tambahan untuk Seller/Bisnis =====
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // ===== Dokumen dinamis (disesuaikan untuk seller) =====
  const [documents, setDocuments] = useState<DocumentsSeller[]>([
    makeEmptyDoc(0),
  ]);

  // Tabs
  const [activeTab, setActiveTab] = useState<"data" | "dokumen">("data");

  // UI state
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const [register] = useRegisterMutation();
  const [resendVerification] = useResendVerificationMutation();

  // Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000 }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Pastikan minimal 1 baris dokumen pada register
  useEffect(() => {
    if (isRegister && (!documents || documents.length === 0)) {
      setDocuments([makeEmptyDoc(0)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegister]);

  // Dokumen handlers
  const addDocRow = () => setDocuments((prev) => [...prev, makeEmptyDoc(0)]);
  const removeDocRow = (idx: number) =>
    setDocuments((prev) => {
      const cp = prev.slice();
      cp.splice(idx, 1);
      return cp.length ? cp : [makeEmptyDoc(0)];
    });
  const updateDocKey = (idx: number, key: string) =>
    setDocuments((prev) => {
      const cp = prev.slice();
      cp[idx] = { ...cp[idx], key };
      return cp;
    });
  const updateDocFile = (idx: number, file: File | null) =>
    setDocuments((prev) => {
      const cp = prev.slice();
      cp[idx] = { ...cp[idx], document: file };
      return cp;
    });

  // ===== Validasi Register =====
  const validateRegister = (): FieldErrors => {
    const errs: FieldErrors = {};

    if (!name.trim()) errs.name = "Nama Penanggung Jawab wajib diisi.";
    else if (name.trim().length < 3)
      errs.name = "Nama Penanggung Jawab minimal 3 karakter.";

    if (!email.trim()) errs.email = "Email wajib diisi.";
    else if (!isValidEmail(email.trim()))
      errs.email = "Format email tidak valid.";

    if (!phone.trim()) errs.phone = "Nomor telepon wajib diisi.";
    else if (!isValidPhoneID(phone))
      errs.phone = "Nomor telepon harus 10–14 digit, diawali 08.";

    if (!password) errs.password = "Password wajib diisi.";
    else if (!isValidPassword(password))
      errs.password = "Minimal 8 karakter dan mengandung huruf serta angka.";

    if (!passwordConfirmation) {
      errs.password_confirmation = "Konfirmasi password wajib diisi.";
    } else if (passwordConfirmation !== password) {
      errs.password_confirmation = "Konfirmasi password tidak cocok.";
    }

    if (!businessName.trim()) errs.business_name = "Nama Bisnis wajib diisi.";
    else if (businessName.trim().length < 2)
      errs.business_name = "Nama Bisnis minimal 2 karakter.";

    if (!businessCategory.trim())
      errs.business_category = "Kategori Bisnis wajib diisi.";

    if (!address.trim()) errs.address = "Alamat Bisnis wajib diisi.";
    else if (address.trim().length < 10)
      errs.address = "Alamat Bisnis minimal 10 karakter.";

    if (!city.trim()) errs.city = "Kota wajib diisi.";
    if (!province.trim()) errs.province = "Provinsi wajib diisi.";
    if (!postalCode.trim()) errs.postal_code = "Kode Pos wajib diisi.";

    // Dokumen: jika ada file maka nama file wajib
    for (let i = 0; i < documents.length; i++) {
      const d = documents[i];
      if (d.document && !d.key) {
        // Ini contoh bagaimana error dokumen bisa ditangani,
        // Anda mungkin ingin menampilkan pesan error ini di UI dokumen secara spesifik
        errs.address = errs.address ?? ""; // Placeholder: menandakan ada error tambahan di bagian dokumen
      }
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setFieldErrors({});

    if (isLogin) {
      try {
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (signInRes?.ok) {
          router.push("/admin/dashboard"); // Atau ke dashboard seller
        } else {
          setError("Gagal masuk. Email atau password salah.");
        }
      } catch (err: unknown) {
        console.error("Login error:", err);
        setError("Login gagal. Cek kembali email dan password.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const errs = validateRegister();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setIsLoading(false);
      // Pindah ke tab 'data' jika ada error di data diri
      if (
        errs.name ||
        errs.email ||
        errs.phone ||
        errs.password ||
        errs.password_confirmation ||
        errs.business_name ||
        errs.business_category ||
        errs.address ||
        errs.city ||
        errs.province ||
        errs.postal_code
      ) {
        setActiveTab("data");
      } else {
        // Jika error hanya di dokumen, tetap di tab dokumen
        setActiveTab("dokumen");
      }
      return;
    }

    try {
      const payload: RegisterPayload = {
        name: name.trim(),
        email: email.trim(),
        phone: digitsOnly(phone),
        password,
        password_confirmation: passwordConfirmation,
        business_name: businessName.trim(),
        business_category: businessCategory.trim(),
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        postal_code: postalCode.trim(),
      };

      await register(payload).unwrap();

      await Swal.fire({
        title: "Pendaftaran Berhasil",
        text: "Akun Anda berhasil dibuat! Silakan cek email untuk verifikasi sebelum login ke dashboard seller Anda.",
        icon: "success",
      });

      router.push("/auth/login"); // Arahkan ke halaman login seller
    } catch (err) {
      const error = err as RegisterError;
      console.error("Register error:", error);
      const message =
        error?.data?.message || "Pendaftaran gagal. Cek kembali data Anda.";

      const showResend = message.toLowerCase().includes("belum verifikasi");
      if (showResend) {
        const result = await Swal.fire({
          title: "Email belum diverifikasi",
          text: "Apakah Anda ingin mengirim ulang email verifikasi?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Kirim Ulang",
          cancelButtonText: "Batal",
          confirmButtonColor: PRIMARY_COLOR,
          cancelButtonColor: SECONDARY_TEXT,
        });

        if (result.isConfirmed) {
          try {
            await resendVerification({ email }).unwrap();
            await Swal.fire({
              title: "Terkirim!",
              text: "Email verifikasi berhasil dikirim ulang.",
              icon: "success",
              confirmButtonColor: PRIMARY_COLOR,
            });
          } catch {
            await Swal.fire({
              title: "Gagal",
              text: "Gagal mengirim ulang email verifikasi.",
              icon: "error",
              confirmButtonColor: PRIMARY_COLOR,
            });
          }
        }
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2" style={{ background: `linear-gradient(to bottom right, #FFFFFF, ${PRIMARY_COLOR}10)` }}>
      {/* Left Pane - Indotoliz Berniaga Theme with Carousel */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {carouselImages.map((src, index) => (
              <div
                key={index}
                className="embla__slide relative flex-none w-full h-full"
              >
                <Image
                  src={src}
                  alt={`Indotoliz Berniaga ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  quality={100}
                  className="select-none pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-blue-900/60 via-blue-800/50 to-orange-600/50 flex flex-col items-center justify-center p-8 text-white text-center">
          {/* Floating Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute top-20 left-16 text-[${PRIMARY_COLOR}]/60`}
            >
              <FaShoppingCart size={32} />
            </motion.div>
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className={`absolute top-32 left-8 text-[${PRIMARY_COLOR}]/50`}
            >
              <FaWarehouse size={24} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className={`absolute top-24 right-20 text-[${ACCENT_COLOR}]/60`}
            >
              <FaTruckLoading size={28} />
            </motion.div>
            <motion.div
              animate={{ y: [0, 20, 0], rotate: [0, 3, 0] }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className={`absolute top-40 right-12 text-[${ACCENT_COLOR}]/50`}
            >
              <FaChartLine size={26} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
              transition={{
                duration: 6.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              className={`absolute bottom-32 left-12 text-[${PRIMARY_COLOR}]/60`}
            >
              <FaUsers size={30} />
            </motion.div>
            <motion.div
              animate={{ y: [0, 18, 0], rotate: [0, -2, 0] }}
              transition={{
                duration: 8.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
              className={`absolute bottom-20 left-24 text-[${ACCENT_COLOR}]/50`}
            >
              <FaBoxes size={22} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, -4, 0] }}
              transition={{
                duration: 7.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2.5,
              }}
              className={`absolute bottom-28 right-16 text-[${PRIMARY_COLOR}]/60`}
            >
              <FaCreditCard size={28} />
            </motion.div>
            <motion.div
              animate={{ y: [0, 16, 0], rotate: [0, 2, 0] }}
              transition={{
                duration: 9.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className={`absolute bottom-16 right-8 text-[${ACCENT_COLOR}]/50`}
            >
              <FaShieldAlt size={24} />
            </motion.div>
          </div>

          {/* Branding */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`z-20 p-8 rounded-2xl backdrop-blur-sm bg-white/95 border-2 shadow-2xl`}
            style={{ borderColor: ACCENT_COLOR }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                {/* Asumsi Anda memiliki logo Indotoliz Berniaga */}
                <Image
                  src="/logo-only-indotoliz.png" // Ganti dengan path logo Indotoliz Berniaga Anda
                  alt="Indotoliz Berniaga Logo"
                  width={60}
                  height={60}
                  className="flex-shrink-0 object-contain"
                />
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                    Indotoliz Berniaga
                  </h2>
                  <p className="text-sm" style={{ color: SECONDARY_TEXT }}>
                    Solusi E-commerce B2B Terdepan
                  </p>
                </div>
              </div>
            </div>

            <div
              className="w-20 h-1 mx-auto mb-4"
              style={{ background: `linear-gradient(to right, ${PRIMARY_COLOR}, ${ACCENT_COLOR})` }}
            ></div>

            <p className="text-base font-medium text-gray-700 max-w-sm mx-auto leading-relaxed">
              Platform terintegrasi untuk mengelola bisnis Anda, dari inventaris
              hingga penjualan dan analisis performa.
            </p>

            <div className="mt-6 flex justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PRIMARY_COLOR }}></div>
                Manajemen Produk
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: ACCENT_COLOR }}></div>
                Pelacakan Pesanan
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PRIMARY_COLOR }}></div>
                Analisis Penjualan
              </div>
            </div>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 z-20 flex gap-2">
          {carouselImages.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? `w-8 bg-white shadow-lg`
                  : `w-2 bg-white/60`
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="relative flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-500 overflow-hidden" style={{ background: `linear-gradient(to bottom right, #FFFFFF, ${PRIMARY_COLOR}10)` }}>
        {/* Static Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-2/12 right-4 text-[${PRIMARY_COLOR}]/30 z-0`}>
            <FaWarehouse size={120} />
          </div>
          <div className={`absolute bottom-0 -translate-y-1/2 -left-4 text-[${ACCENT_COLOR}]/30 z-0`}>
            <FaTruckLoading size={110} />
          </div>
        </div>

        <motion.div
          className="w-full max-w-2xl space-y-8 relative z-10"
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {/* Header */}
          <motion.div variants={variants} className="text-center">
            <div className="flex items-center justify-center mb-4 gap-2">
              {/* Asumsi Anda memiliki logo Indotoliz Berniaga */}
              <Image
                src="/logo-only-indotoliz.png" // Ganti dengan path logo Indotoliz Berniaga Anda
                alt="Indotoliz Berniaga Logo"
                width={50}
                height={50}
                className="flex-shrink-0 object-contain"
              />
              <div>
                <h2 className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                  Indotoliz Berniaga
                </h2>
                <p className="text-sm" style={{ color: SECONDARY_TEXT }}>
                  Solusi E-commerce B2B Terdepan
                </p>
              </div>
            </div>
            <h1 className="text-3xl font-bold mt-4" style={{ color: TEXT_COLOR }}>
              {isLogin ? "Selamat Datang Kembali!" : "Bergabung sebagai Mitra"}
            </h1>
            <p className="text-sm mt-2" style={{ color: SECONDARY_TEXT }}>
              {isLogin
                ? "Akses dashboard Anda untuk mengelola bisnis."
                : "Daftarkan bisnis Anda dan mulai jualan sekarang!"}
            </p>
          </motion.div>

          {/* FORM: max-h + overflow, tabs & submit sticky */}
          <motion.form
            variants={variants}
            onSubmit={handleSubmit}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border flex flex-col max-h-[70vh] overflow-y-auto`}
            style={{ borderColor: LIGHT_PRIMARY_BG }}
          >
            {/* Sticky Tabs (Register only) */}
            {isRegister && (
              <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b" style={{ borderColor: LIGHT_PRIMARY_BG }}>
                <div className="px-8 pt-6">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("data")}
                      className={`px-4 py-2 text-sm font-semibold ${
                        activeTab === "data"
                          ? `text-[${PRIMARY_COLOR}] border-b-2 border-[${PRIMARY_COLOR}]`
                          : `text-gray-500 hover:text-[${PRIMARY_COLOR}]`
                      }`}
                    >
                      Informasi Bisnis & Akun
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("dokumen")}
                      className={`px-4 py-2 text-sm font-semibold ${
                        activeTab === "dokumen"
                          ? `text-[${PRIMARY_COLOR}] border-b-2 border-[${PRIMARY_COLOR}]`
                          : `text-gray-500 hover:text-[${PRIMARY_COLOR}]`
                      }`}
                    >
                      Dokumen Pendukung
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 px-8 py-6 space-y-6">
              {/* ======= LOGIN VIEW ======= */}
              {isLogin && (
                <>
                  <motion.div variants={variants} className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold"
                      style={{ color: TEXT_COLOR }}
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <FaEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 text-[${PRIMARY_COLOR}]`} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@bisnisanda.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`pl-10 pr-4 py-3 border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                        aria-invalid={!!fieldErrors.email}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={variants} className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold"
                      style={{ color: TEXT_COLOR }}
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 text-[${PRIMARY_COLOR}]`} />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`pl-10 pr-4 py-3 border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                        placeholder="Masukkan password"
                        aria-invalid={!!fieldErrors.password}
                      />
                    </div>
                  </motion.div>
                </>
              )}

              {/* ======= REGISTER: DATA DIRI ======= */}
              {isRegister && activeTab === "data" && (
                <>
                  {/* Bagian Informasi Penanggung Jawab */}
                  <h3 className="text-lg font-bold mt-6 mb-4" style={{ color: TEXT_COLOR }}>
                    Informasi Penanggung Jawab
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div variants={variants} className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold"
                        style={{ color: TEXT_COLOR }}
                      >
                        Nama Lengkap Penanggung Jawab
                      </Label>
                      <div className="relative">
                        <FaUser className={`absolute left-3 top-1/2 -translate-y-1/2 text-[${PRIMARY_COLOR}]`} />
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className={`pl-10 pr-4 py-3 border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                          placeholder="Nama lengkap Anda"
                          aria-invalid={!!fieldErrors.name}
                        />
                      </div>
                      {fieldErrors.name && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.name}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={variants} className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-semibold"
                        style={{ color: TEXT_COLOR }}
                      >
                        Nomor Telepon Penanggung Jawab
                      </Label>
                      <div className="relative">
                        <FaPhone className={`absolute left-3 top-1/2 -translate-y-1/2 text-[${PRIMARY_COLOR}]`} />
                        <Input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className={`pl-10 pr-4 py-3 border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                          placeholder="08xxxxxxxxxx"
                          aria-invalid={!!fieldErrors.phone}
                        />
                      </div>
                      {fieldErrors.phone && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.phone}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Baris Email, Password & Konfirmasi */}
                  <motion.div variants={variants} className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold"
                      style={{ color: TEXT_COLOR }}
                    >
                      Email Bisnis
                    </Label>
                    <div className="relative">
                      <FaEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 text-[${PRIMARY_COLOR}]`} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@bisnisanda.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`pl-10 pr-4 py-3 border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                        aria-invalid={!!fieldErrors.email}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-xs text-red-600">
                        {fieldErrors.email}
                      </p>
                    )}
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div variants={variants} className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-sm font-semibold"
                        style={{ color: TEXT_COLOR }}
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 text-[${PRIMARY_COLOR}]`} />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className={`pl-10 pr-4 py-3 border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                          placeholder="Masukkan password"
                          aria-invalid={!!fieldErrors.password}
                        />
                      </div>
                      {fieldErrors.password && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.password}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={variants} className="space-y-2">
                      <Label
                        htmlFor="password_confirmation"
                        className="text-sm font-semibold"
                        style={{ color: TEXT_COLOR }}
                      >
                        Konfirmasi Password
                      </Label>
                      <div className="relative">
                        <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 text-[${PRIMARY_COLOR}]`} />
                        <Input
                          id="password_confirmation"
                          type="password"
                          value={passwordConfirmation}
                          onChange={(e) =>
                            setPasswordConfirmation(e.target.value)
                          }
                          required
                          className={`pl-10 pr-4 py-3 border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                          placeholder="Konfirmasi password"
                          aria-invalid={!!fieldErrors.password_confirmation}
                        />
                      </div>
                      {fieldErrors.password_confirmation && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.password_confirmation}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Bagian Informasi Bisnis */}
                  <h3 className="text-lg font-bold mt-8 mb-4" style={{ color: TEXT_COLOR }}>
                    Informasi Bisnis Anda
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div variants={variants} className="space-y-2">
                      <Label
                        htmlFor="business_name"
                        className="text-sm font-semibold"
                        style={{ color: TEXT_COLOR }}
                      >
                        Nama Bisnis
                      </Label>
                      <div className="relative">
                        <FaStore className={`absolute left-3 top-1/2 -translate-y-1/2 text-[${PRIMARY_COLOR}]`} />
                        <Input
                          id="business_name"
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          required
                          className={`pl-10 pr-4 py-3 border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                          placeholder="Nama PT, CV, atau Usaha Anda"
                          aria-invalid={!!fieldErrors.business_name}
                        />
                      </div>
                      {fieldErrors.business_name && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.business_name}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={variants} className="space-y-2">
                      <Label
                        htmlFor="business_category"
                        className="text-sm font-semibold"
                        style={{ color: TEXT_COLOR }}
                      >
                        Kategori Bisnis
                      </Label>
                      <div className="relative">
                        <FaBoxes className={`absolute left-3 top-1/2 -translate-y-1/2 text-[${PRIMARY_COLOR}]`} />
                        <select
                          id="business_category"
                          className={`w-full pl-10 pr-4 py-3 border-gray-200 rounded-lg focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 transition-all duration-200 bg-white`}
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                          aria-invalid={!!fieldErrors.business_category}
                          required
                        >
                          <option value="">Pilih Kategori</option>
                          <option value="elektronik">Elektronik</option>
                          <option value="fashion">Fashion</option>
                          <option value="makanan">Makanan & Minuman</option>
                          <option value="rumah_tangga">Rumah Tangga</option>
                          <option value="otomotif">Otomotif</option>
                          <option value="jasa">Jasa</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                      </div>
                      {fieldErrors.business_category && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.business_category}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  <motion.div variants={variants} className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="text-sm font-semibold"
                      style={{ color: TEXT_COLOR }}
                    >
                      Alamat Lengkap Bisnis
                    </Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nama jalan, Nomor gedung, RT/RW, Kelurahan, Kecamatan"
                      className={`border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                      aria-invalid={!!fieldErrors.address}
                      required
                    />
                    {fieldErrors.address && (
                      <p className="text-xs text-red-600">
                        {fieldErrors.address}
                      </p>
                    )}
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div variants={variants} className="space-y-2">
                      <Label
                        htmlFor="city"
                        className="text-sm font-semibold"
                        style={{ color: TEXT_COLOR }}
                      >
                        Kota
                      </Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Contoh: Jakarta"
                        className={`border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                        aria-invalid={!!fieldErrors.city}
                        required
                      />
                      {fieldErrors.city && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.city}
                        </p>
                      )}
                    </motion.div>
                    <motion.div variants={variants} className="space-y-2">
                      <Label
                        htmlFor="province"
                        className="text-sm font-semibold"
                        style={{ color: TEXT_COLOR }}
                      >
                        Provinsi
                      </Label>
                      <Input
                        id="province"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        placeholder="Contoh: DKI Jakarta"
                        className={`border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                        aria-invalid={!!fieldErrors.province}
                        required
                      />
                      {fieldErrors.province && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.province}
                        </p>
                      )}
                    </motion.div>
                    <motion.div variants={variants} className="space-y-2">
                      <Label
                        htmlFor="postal_code"
                        className="text-sm font-semibold"
                        style={{ color: TEXT_COLOR }}
                      >
                        Kode Pos
                      </Label>
                      <Input
                        id="postal_code"
                        value={postalCode}
                        inputMode="numeric"
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Contoh: 12345"
                        className={`border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg transition-all duration-200`}
                        aria-invalid={!!fieldErrors.postal_code}
                        required
                      />
                      {fieldErrors.postal_code && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.postal_code}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Floating next button (sticky di dalam scroll container) */}
                  <div className="sticky bottom-0 z-30 flex justify-end py-4 bg-white/50 backdrop-blur-sm">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("dokumen")}
                      className={`flex items-center gap-2 shadow-md bg-white/90 backdrop-blur-md border hover:bg-gray-50`}
                      style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                    >
                      Lanjut ke Dokumen <FaArrowRight />
                    </Button>
                  </div>
                </>
              )}

              {/* ======= REGISTER: DOKUMEN ======= */}
              {isRegister && activeTab === "dokumen" && (
                <>
                  <div className="flex flex-col sm:flex-row items-center justify-between">
                    <h3 className="text-lg font-bold" style={{ color: TEXT_COLOR }}>
                      Dokumen Pendukung Bisnis Anda
                    </h3>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("data")}
                        className={`hover:bg-gray-50`}
                        style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                      >
                        Kembali ke Informasi Bisnis
                      </Button>
                      <Button
                        type="button"
                        onClick={addDocRow}
                        className={`flex items-center gap-2 bg-[${ACCENT_COLOR}] text-white hover:bg-opacity-90`}
                      >
                        <FaPlus /> Tambah Dokumen
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm" style={{ color: SECONDARY_TEXT }}>
                    Unggah dokumen penting seperti KTP Penanggung Jawab, NPWP Perusahaan, atau SIUP.
                  </p>

                  <div className="space-y-4">
                    {documents.map((doc, idx) => {
                      const firstMedia: { original_url: string } | undefined = doc.media?.[0];
                      const existingUrl = firstMedia?.original_url ?? "";

                      return (
                        <div
                          key={idx}
                          className={`grid grid-cols-1 md:grid-cols-12 gap-3 border rounded-lg p-4 bg-white shadow-sm`}
                          style={{ borderColor: LIGHT_PRIMARY_BG }}
                        >
                          <div className="md:col-span-5 space-y-1">
                            <Label className="text-sm font-medium" style={{ color: TEXT_COLOR }}>Nama Dokumen</Label>
                            <Input
                              value={doc.key ?? ""}
                              onChange={(e) =>
                                updateDocKey(idx, e.target.value)
                              }
                              placeholder="Contoh: KTP Penanggung Jawab, SIUP, Akta Pendirian"
                              className={`border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg`}
                            />
                            {/* Tambahkan pesan error spesifik jika diperlukan */}
                            {/* {fieldErrors.document_key && <p className="text-xs text-red-600">{fieldErrors.document_key}</p>} */}
                          </div>

                          <div className="md:col-span-5 space-y-1">
                            <Label className="text-sm font-medium" style={{ color: TEXT_COLOR }}>Unggah File</Label>
                            <Input
                              type="file"
                              onChange={(e) =>
                                updateDocFile(idx, e.target.files?.[0] || null)
                              }
                              className={`border-gray-200 focus:border-[${PRIMARY_COLOR}] focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20 rounded-lg`}
                            />
                            {existingUrl && (
                              <a
                                className={`text-xs mt-1 inline-block hover:underline`}
                                style={{ color: PRIMARY_COLOR }}
                                href={existingUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Lihat file lama
                              </a>
                            )}
                            {doc.document && doc.document instanceof File && (
                              <p className="text-xs mt-1" style={{ color: SECONDARY_TEXT }}>
                                File baru: {doc.document.name}
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-2 flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeDocRow(idx)}
                              className={`w-full flex items-center justify-center gap-2 hover:bg-red-50`}
                              style={{ color: '#DC2626', borderColor: '#DC2626' }}
                            >
                              <FaTrash /> Hapus
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs" style={{ color: SECONDARY_TEXT }}>
                    * Pastikan nama dokumen jelas dan file yang diunggah berformat PDF, JPG, atau PNG.
                  </p>
                </>
              )}
            </div>

            {/* Sticky Footer (Submit) */}
            <div className="sticky bottom-0 z-20 bg-white/90 backdrop-blur-md border-t" style={{ borderColor: LIGHT_PRIMARY_BG }}>
              <div className="px-8 pt-4">
                {error && (
                  <motion.div
                    variants={variants}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3"
                  >
                    <p className="text-sm text-red-600 text-center font-medium">
                      {error}
                    </p>
                  </motion.div>
                )}
              </div>
              <div className="px-8 pb-8">
                <Button
                  type="submit"
                  className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r text-white hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl py-3 rounded-lg font-semibold`}
                  style={{ background: `linear-gradient(to right, ${PRIMARY_COLOR}, ${ACCENT_COLOR})` }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Memproses...
                    </div>
                  ) : (
                    <>
                      {isLogin ? "Masuk ke Dashboard" : "Daftarkan Bisnis Anda"}
                      <FaArrowRight className="text-sm" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.form>

          {/* <motion.div
            variants={variants}
            className={`text-center text-sm bg-white/60 backdrop-blur-sm rounded-lg p-4 border`}
            style={{ borderColor: LIGHT_PRIMARY_BG }}
          >
            <span style={{ color: SECONDARY_TEXT }}>
              {isLogin ? "Belum memiliki akun bisnis?" : "Sudah memiliki akun bisnis?"}{" "}
            </span>
            <a
              href={isLogin ? "/auth/register" : "/auth/login"}
              className={`font-semibold hover:underline transition-colors duration-200`}
              style={{ color: ACCENT_COLOR }}
            >
              {isLogin ? "Daftar sekarang" : "Masuk ke sistem"}
            </a>
          </motion.div> */}
        </motion.div>
      </div>
    </div>
  );
}