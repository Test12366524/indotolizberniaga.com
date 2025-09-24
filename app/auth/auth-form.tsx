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
import { FaLock, FaUser, FaEnvelope, FaPhone, FaArrowRight } from "react-icons/fa";
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
  "https://8nc5ppykod.ufs.sh/f/H265ZJJzf6brhe61N04SkjECzBn3WpFPuOw92XJ1obUvc5IV", // Ganti dengan gambar 1 Anda
  "https://8nc5ppykod.ufs.sh/f/H265ZJJzf6brslFOLgKSq0bSQpfe8wyTGY4E9Wi75tl6xUFO", // Ganti dengan gambar 2 Anda
  "https://8nc5ppykod.ufs.sh/f/H265ZJJzf6brsFa05wSq0bSQpfe8wyTGY4E9Wi75tl6xUFOV", // Ganti dengan gambar 3 Anda
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

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
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
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-50 dark:bg-gray-950">
      {/* Left Pane - Merah Putih Theme with Carousel */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {carouselImages.map((src, index) => (
              <div key={index} className="embla__slide relative flex-none w-full h-full">
                <Image
                  src={src}
                  alt={`Koperasi theme ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  quality={100}
                  className="select-none pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Overlay dengan warna gradien */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#9c1313]/70 to-[#d62828]/70 flex flex-col items-center justify-center p-8 text-white text-center">
            {/* Bingkai Kotak dan Konten di dalamnya */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="z-20 p-8 rounded-xl backdrop-blur-sm bg-white/90 border-4 border-[#d62828]"
            >
                <h2 className="text-4xl font-extrabold tracking-tight mb-4 drop-shadow-lg text-black">
                    Koperasi Merah Putih
                </h2>
                <p className="text-lg font-light max-w-sm mx-auto drop-shadow text-black">
                    Solusi keuangan terpercaya, mendukung kemandirian dan kesejahteraan bangsa.
                </p>
            </motion.div>
        </div>

        {/* Indikator Slide */}
        <div className="absolute bottom-6 z-20 flex gap-2">
          {carouselImages.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Pane - Form Section */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 transition-colors duration-500">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          <motion.div variants={variants} className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLogin ? "Selamat Datang Kembali" : "Bergabung Bersama Kami"}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isLogin
                ? "Silakan masuk untuk melanjutkan"
                : "Mulai perjalanan Anda menuju kesuksesan"}
            </p>
          </motion.div>

          <motion.form variants={variants} onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <motion.div variants={variants} className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 pr-4 py-2"
                    />
                  </div>
                </motion.div>
                <motion.div variants={variants} className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="pl-10 pr-4 py-2"
                    />
                  </div>
                </motion.div>
              </>
            )}

            <motion.div variants={variants} className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 pr-4 py-2"
                />
              </div>
            </motion.div>

            <motion.div variants={variants} className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-4 py-2"
                />
              </div>
            </motion.div>

            {!isLogin && (
              <motion.div variants={variants} className="space-y-2">
                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    className="pl-10 pr-4 py-2"
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.p variants={variants} className="text-sm text-red-500 text-center">
                {error}
              </motion.p>
            )}

            <motion.div variants={variants}>
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#d62828] text-white hover:bg-[#a51c1c] transition-colors duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? "Memuat..." : isLogin ? "Masuk" : "Daftar"}
                <FaArrowRight />
              </Button>
            </motion.div>
          </motion.form>

          <motion.div variants={variants} className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            </span>
            <a
              href={isLogin ? "/auth/register" : "/auth/login"}
              className="font-medium text-[#d62828] hover:underline"
            >
              {isLogin ? "Daftar sekarang" : "Masuk"}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}