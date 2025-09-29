"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FaCoins,
  FaHandshake,
  FaChartLine,
  FaPiggyBank,
  FaUsers,
  FaBuilding,
  FaCalculator,
  FaShieldAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

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

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const carouselImages = [
  "/images/koperasi-1.jpg",
  "/images/koperasi-2.jpg",
  "/images/koperasi-3.jpg",
];

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [register] = useRegisterMutation();
  const [resendVerification] = useResendVerificationMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (isLogin) {
      try {
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (signInRes?.ok) {
          router.push("/admin/dashboard");
        } else {
          setError("Gagal masuk. Email atau password salah.");
        }
      } catch (err: unknown) {
        console.error("Login error:", err);
        setError("Login gagal. Cek kembali email dan password.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle Register
      if (password !== passwordConfirmation) {
        setError("Konfirmasi password tidak cocok.");
        setIsLoading(false);
        return;
      }

      try {
        await register({
          name,
          email,
          phone,
          password,
          password_confirmation: passwordConfirmation,
        }).unwrap();

        await Swal.fire({
          title: "Pendaftaran berhasil",
          text: "Silakan cek email kamu untuk verifikasi sebelum login.",
          icon: "success",
        });

        router.push("/auth/login");
      } catch (err) {
        const error = err as RegisterError;
        console.error("Register error:", error);
        const message =
          error?.data?.message || "Pendaftaran gagal. Cek kembali data Anda.";

        const showResend = message.toLowerCase().includes("belum verifikasi");

        if (showResend) {
          const result = await Swal.fire({
            title: "Email belum diverifikasi",
            text: "Apakah kamu ingin mengirim ulang email verifikasi?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Kirim Ulang",
            cancelButtonText: "Batal",
          });

          if (result.isConfirmed) {
            try {
              await resendVerification({ email }).unwrap();
              await Swal.fire({
                title: "Terkirim!",
                text: "Email verifikasi berhasil dikirim ulang.",
                icon: "success",
              });
            } catch {
              await Swal.fire({
                title: "Gagal",
                text: "Gagal mengirim ulang email verifikasi.",
                icon: "error",
              });
            }
          }
        }

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-red-50 to-white">
      {/* Left Pane - Koperasi Merah Putih Theme with Carousel */}
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
                  alt={`Koperasi Merah Putih ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  quality={100}
                  className="select-none pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Overlay hitam transparan */}
        <div className="absolute inset-0 z-10 bg-black/40 flex flex-col items-center justify-center p-8 text-white text-center">
          {/* Floating Icons - Koperasi Theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Top Left Icons */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-20 left-16 text-red-300/60"
            >
              <FaCoins size={32} />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 15, 0],
                rotate: [0, -3, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-32 left-8 text-red-200/50"
            >
              <FaPiggyBank size={24} />
            </motion.div>

            {/* Top Right Icons */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute top-24 right-20 text-red-300/60"
            >
              <FaHandshake size={28} />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, 3, 0],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute top-40 right-12 text-red-200/50"
            >
              <FaChartLine size={26} />
            </motion.div>

            {/* Bottom Left Icons */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 4, 0],
              }}
              transition={{
                duration: 6.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              className="absolute bottom-32 left-12 text-red-300/60"
            >
              <FaUsers size={30} />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 18, 0],
                rotate: [0, -2, 0],
              }}
              transition={{
                duration: 8.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
              className="absolute bottom-20 left-24 text-red-200/50"
            >
              <FaBuilding size={22} />
            </motion.div>

            {/* Bottom Right Icons */}
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, -4, 0],
              }}
              transition={{
                duration: 7.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2.5,
              }}
              className="absolute bottom-28 right-16 text-red-300/60"
            >
              <FaCalculator size={28} />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 16, 0],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 9.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-16 right-8 text-red-200/50"
            >
              <FaShieldAlt size={24} />
            </motion.div>
          </div>

          {/* Logo dan Branding Koperasi */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="z-20 p-8 rounded-2xl backdrop-blur-sm bg-white/95 border-2 border-red-600 shadow-2xl"
          >
            {/* Logo Area */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-1">
                <Image
                  src="/logo-koperasi-merah-putih-online.webp"
                  alt="Koperasi Merah Putih Logo"
                  width={50}
                  height={50}
                  className="flex-shrink-0 object-contain"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Koperasi Merah Putih
                  </h2>
                  <p className="text-xs text-gray-600 mt-[-5px]">
                    Simpan Pinjam & Marketplace
                  </p>
                </div>
              </div>
            </div>

            <div className="w-16 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto mb-4"></div>

            <p className="text-base font-medium text-gray-700 max-w-sm mx-auto leading-relaxed">
              Sistem Manajemen Koperasi Terintegrasi untuk Simpan Pinjam,
              Pengelolaan Anggota, dan Operasional Keuangan
            </p>

            <div className="mt-6 flex justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Simpan Pinjam
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Manajemen Anggota
              </div>
            </div>
          </motion.div>
        </div>

        {/* Indikator Slide */}
        <div className="absolute bottom-6 z-20 flex gap-2">
          {carouselImages.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? "w-8 bg-white shadow-lg"
                  : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Pane - Form Section */}
      <div className="relative flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-red-50 transition-colors duration-500 overflow-hidden">
        {/* Static Icons for Form Area */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-2/12 right-4 text-red-300/50 z-0">
            <FaPiggyBank size={120} />
          </div>

          <div className="absolute bottom-0 -translate-y-1/2 -left-4 text-red-300/50 z-0">
            <FaHandshake size={110} />
          </div>
        </div>
        <motion.div
          className="w-full max-w-md space-y-8 relative z-10"
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {/* Header dengan Logo Koperasi */}
          <motion.div variants={variants} className="text-center">
            <div className="flex items-center justify-center mb-4 gap-1">
              <Image
                src="/logo-koperasi-merah-putih-online.webp"
                alt="Koperasi Merah Putih Logo"
                width={50}
                height={50}
                className="flex-shrink-0 object-contain"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Koperasi Merah Putih
                </h2>
                <p className="text-xs text-gray-600 mt-[-5px]">
                  Simpan Pinjam & Marketplace
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {isLogin
                ? "Akses dashboard admin untuk mengelola operasional koperasi"
                : "Bergabunglah sebagai anggota koperasi untuk memulai"}
            </p>
          </motion.div>

          <motion.form
            variants={variants}
            onSubmit={handleSubmit}
            className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-100"
          >
            {!isLogin && (
              <>
                <motion.div variants={variants} className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Nama Lengkap
                  </Label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 pr-4 py-3 border-red-200 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-all duration-200"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </motion.div>
                <motion.div variants={variants} className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Nomor Telepon
                  </Label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="pl-10 pr-4 py-3 border-red-200 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-all duration-200"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </motion.div>
              </>
            )}

            <motion.div variants={variants} className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email
              </Label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 pr-4 py-3 border-red-200 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-all duration-200"
                />
              </div>
            </motion.div>

            <motion.div variants={variants} className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-4 py-3 border-red-200 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-all duration-200"
                  placeholder="Masukkan password"
                />
              </div>
            </motion.div>

            {!isLogin && (
              <motion.div variants={variants} className="space-y-2">
                <Label
                  htmlFor="password_confirmation"
                  className="text-sm font-semibold text-gray-700"
                >
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    className="pl-10 pr-4 py-3 border-red-200 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-all duration-200"
                    placeholder="Konfirmasi password"
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                variants={variants}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <p className="text-sm text-red-600 text-center font-medium">
                  {error}
                </p>
              </motion.div>
            )}

            <motion.div variants={variants}>
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl py-3 rounded-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                  </div>
                ) : (
                  <>
                    {isLogin ? "Masuk ke Dashboard" : "Daftar sebagai Anggota"}
                    <FaArrowRight className="text-sm" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            variants={variants}
            className="text-center text-sm bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-red-100"
          >
            <span className="text-gray-600">
              {isLogin ? "Belum memiliki akun admin?" : "Sudah memiliki akun?"}{" "}
            </span>
            <a
              href={isLogin ? "/auth/register" : "/auth/login"}
              className="font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors duration-200"
            >
              {isLogin ? "Daftar sekarang" : "Masuk ke sistem"}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
