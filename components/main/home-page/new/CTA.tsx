"use client";

import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react"; // Mengganti UserPlus dengan ShoppingBag

export default function CTA() {
  const t = useTranslation({ id, en });

  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: CTA Utama

  return (
    // Mengubah latar belakang menjadi warna yang lebih kontras jika diperlukan, namun tetap mempertahankan kesan modern.
    <section className="relative bg-white py-20"> 
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-6"
        >
          Siap Bertransaksi Teknologi Modern? <br />
          <span style={{ color: PRIMARY_COLOR }}>Akses Dunia Elektronik Hanya di Genggaman</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-600 text-lg mb-8"
        >
          Mulai jelajahi jutaan produk elektronik terpercaya atau kembangkan bisnis Anda dengan menjadi mitra penjual di platform Indotoliz Berniaga.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          {/* CTA 1: Untuk Pembeli (Menggunakan Jingga Energi sebagai CTA utama) */}
          <Link
            href="/product"
            style={{ backgroundColor: ACCENT_COLOR }}
            className="px-8 py-4 text-white text-lg font-semibold rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-6 w-6" />
            Mulai Belanja Sekarang
          </Link>
          
          {/* CTA 2: Untuk Penjual (Menggunakan gaya sekunder, netral/biru) */}
          <Link
            href="/register/seller"
            style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }} // Membuat tombol sekunder beraksen biru
            className="px-8 py-4 bg-transparent border-2 text-lg font-semibold rounded-xl shadow-md hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            <Store className="h-6 w-6" />
            Daftar Menjadi Penjual
          </Link>
        </motion.div>
      </div>
    </section>
  );
}