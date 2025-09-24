"use client";

import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
import { motion } from "framer-motion";
import {
  Handshake,
  Store,
  AppWindow,
  BadgeDollarSign
} from "lucide-react";

export default function Features() {
  const t = useTranslation({ id, en });

  const features = [
    {
      icon: <Handshake className="w-10 h-10 text-[#E53935]" />,
      title: "Unit Usaha Simpan Pinjam",
      desc: "Layanan keuangan yang aman dan terpercaya untuk seluruh anggota. Proses pengajuan pinjaman cepat, syarat ringan, dan bunga kompetitif untuk mendukung kebutuhan finansial Anda.",
    },
    {
      icon: <Store className="w-10 h-10 text-[#E53935]" />,
      title: "Marketplace UMKM",
      desc: "Jelajahi beragam produk berkualitas dari UMKM anggota koperasi. Anggota dapat dengan mudah mendaftar sebagai seller untuk menjangkau pasar yang lebih luas tanpa biaya tersembunyi.",
    },
    {
      icon: <AppWindow className="w-10 h-10 text-[#E53935]" />,
      title: "Aplikasi Internal Anggota",
      desc: "Kelola semua aktivitas koperasi dalam satu platform. Anggota dan seller dapat memantau status pinjaman, transaksi, dan performa penjualan secara real-time dari mana saja.",
    },
    {
      icon: <BadgeDollarSign className="w-10 h-10 text-[#E53935]" />,
      title: "Pendapatan Pasif",
      desc: "Setiap anggota yang berbelanja di marketplace akan mendapatkan Sisa Hasil Usaha (SHU) setiap tahunnya. Semua terintegrasi dan aman.",
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-12"
        >
          Mengapa Bergabung dengan{" "}
          <span className="text-[#E53935]">Koperasi Merah Putih</span>?
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}