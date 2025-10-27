"use client";

import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
import { motion } from "framer-motion";
import {
  ShieldCheck, // Keamanan
  Package, // Pengiriman
  Zap, // Produk Terbaru / Kecepatan
  BarChart3 // Pertumbuhan Bisnis Seller
} from "lucide-react";

export default function Features() {
  const t = useTranslation({ id, en });

  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi (Untuk penekanan tertentu jika ada)
  
  // Menggunakan warna Biru Stabil untuk ikon
  const ICON_COLOR_STYLE = { color: PRIMARY_COLOR }; 

  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10" style={ICON_COLOR_STYLE} />,
      title: "Jaminan Keamanan Transaksi",
      desc: "Nikmati pengalaman belanja bebas cemas dengan sistem pembayaran yang aman dan perlindungan pembeli. Dana Anda terjamin hingga barang elektronik diterima dengan baik.",
    },
    {
      icon: <Zap className="w-10 h-10" style={ICON_COLOR_STYLE} />,
      title: "Pilihan Produk Terlengkap",
      desc: "Temukan semua kebutuhan elektronik dan gadget, mulai dari komponen kecil, smartphone, laptop, hingga peralatan smart home terbaru. Selalu update dengan teknologi terkini.",
    },
    {
      icon: <Package className="w-10 h-10" style={ICON_COLOR_STYLE} />,
      title: "Pengiriman Cepat & Terpercaya",
      desc: "Kami bekerja sama dengan mitra logistik terbaik untuk memastikan produk elektronik Anda tiba dengan selamat dan tepat waktu ke seluruh wilayah Indonesia.",
    },
    {
      icon: <BarChart3 className="w-10 h-10" style={ICON_COLOR_STYLE} />,
      title: "Ekosistem Pertumbuhan Seller",
      desc: "Bagi penjual, platform kami menawarkan biaya rendah, fitur analisis penjualan yang canggih, dan akses ke pasar digital yang luas untuk mendorong pertumbuhan bisnis Anda.",
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
          Mengapa Memilih{" "}
          <span style={{ color: PRIMARY_COLOR }}>Indotoliz Berniaga</span>?
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