"use client";

import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Siti Rahma",
    role: "Anggota",
    feedback:
      "Pinjaman di Koperasi Merah Putih prosesnya cepat sekali! Sangat membantu saya untuk mengembangkan usaha kecil saya tanpa harus ribet dengan banyak persyaratan.",
    image: "/avatars/1.jpeg",
  },
  {
    name: "Budi Santoso",
    role: "Anggota & Seller",
    feedback:
      "Setelah bergabung dan menjual produk di marketplace Koperasi, omzet saya naik drastis. Penjualan lebih stabil karena diakses langsung oleh sesama anggota. Sangat direkomendasikan!",
    image: "/avatars/2.jpeg",
  },
  {
    name: "Dewi Susanto",
    role: "Anggota",
    feedback:
      "Aplikasi internal Koperasi Merah Putih sangat memudahkan. Saya bisa cek simpanan, ajukan pinjaman, dan lihat produk marketplace, semuanya dalam satu genggaman. Layanan yang luar biasa!",
    image: "/avatars/3.jpeg",
  },
];

export default function Testimonials() {
  const t = useTranslation({ id, en });

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6 text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-12"
        >
          Kata Mereka tentang Koperasi Kami
        </motion.h2>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-lg transition text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={50}
                  height={50}
                  className="rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t.name}
                  </h3>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                “{t.feedback}”
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}