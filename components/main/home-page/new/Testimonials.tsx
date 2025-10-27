"use client";

import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
import { motion } from "framer-motion";
import Image from "next/image";

// Mendefinisikan testimoni baru yang relevan dengan marketplace elektronik
const testimonials = [
  {
    name: "Ahmad Rizky",
    role: "Pembeli",
    feedback:
      "Belanja laptop di Indotoliz Berniaga sangat memuaskan! Prosesnya cepat, barangnya original bergaransi resmi, dan pengirimannya sangat aman. Pelayanan terbaik!",
    image: "/avatars/1.jpeg",
  },
  {
    name: "Fitriana Jaya",
    role: "Seller Elektronik",
    feedback:
      "Setelah berjualan di Indotoliz Berniaga, penjualan komponen elektronik kami meningkat 50%. Fitur tokonya mudah digunakan dan jangkauan pasarnya luas. Sangat direkomendasikan untuk seller tech!",
    image: "/avatars/2.jpeg",
  },
  {
    name: "Rudi H.",
    role: "Pembeli",
    feedback:
      "Pilihan gadgetnya lengkap dan harganya kompetitif. Yang paling penting, sistem transaksinya terpercaya. Saya merasa aman setiap kali melakukan pembayaran untuk barang berharga.",
    image: "/avatars/3.jpeg",
  },
];

export default function Testimonials() {
  const t = useTranslation({ id, en });

  // Warna tidak perlu didefinisikan di sini karena styling menggunakan grayscale (putih, abu-abu, hitam)

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
          Apa Kata Mereka tentang **Indotoliz Berniaga**
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