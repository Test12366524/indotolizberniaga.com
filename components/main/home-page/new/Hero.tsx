"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
// Sesuaikan impor terjemahan jika diperlukan
import en from "@/translations/home/en";
import id from "@/translations/home/id";
// Mengganti ikon Koperasi dengan ikon yang lebih mewakili Teknologi/E-commerce
import { Zap, ShoppingBag } from "lucide-react"; 
import Link from "next/link";

export default function Hero() {
  const t = useTranslation({ id, en });

  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: CTA, Promosi

  return (
    <section className="relative bg-white py-16">
      <div className="container mx-auto grid md:grid-cols-2 gap-10 items-center px-6 overflow-hidden">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            <span style={{ color: PRIMARY_COLOR }}>Indotoliz Berniaga:</span> <br />
            Teknologi Terbaik, Transaksi Terpercaya
          </h1>
          <p className="text-gray-600 text-lg">
            Temukan ribuan produk elektronik dan gadget terbaru dengan penawaran
            terbaik. Kami hadir sebagai platform *marketplace* yang **inovatif**
            dan **terpercaya** untuk kebutuhan digital Anda.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <Link
              href="/category/gadget" // Ubah link ke kategori populer (misal: Gadget)
              style={{ backgroundColor: ACCENT_COLOR }} // Menggunakan Jingga Energi
              className="px-6 py-3 text-white font-medium rounded-xl shadow-md hover:opacity-90 transition flex items-center gap-x-1.5"
            >
              <ShoppingBag className="size-5" />
              Jelajahi Produk
            </Link>
            <Link
              href="/seller-center" // Ubah link ke informasi Penjual
              className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-xl shadow-md hover:bg-gray-300 transition flex items-center gap-x-1.5"
            >
              <Zap className="size-5" />
              Daftar Jadi Penjual
            </Link>
          </div>
        </motion.div>

        {/* Image Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          {/* Ganti src dan alt dengan gambar yang relevan dengan elektronik/gadget */}
          <Image
            src="/hero-indotoliz.webp" 
            alt="Marketplace Elektronik Indotoliz Berniaga"
            width={500}
            height={500}
            className="rounded-2xl shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}