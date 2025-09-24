"use client";

import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
import { motion } from "framer-motion";
import Link from "next/link";
import { UserPlus, Store } from "lucide-react";

export default function CTA() {
  const t = useTranslation({ id, en });

  return (
    <section className="relative bg-gray-100 py-20">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-6"
        >
          Bergabunglah Bersama Kami <br />
          <span className="text-[#E53935]">Wujudkan Kesejahteraan Bersama</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-600 text-lg mb-8"
        >
          Daftar menjadi anggota untuk kemudahan simpan pinjam atau mulai jual produk UMKM Anda di marketplace kami dan nikmati keuntungan Sisa Hasil Usaha (SHU).
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href="/register/member"
            className="px-8 py-4 bg-[#E53935] text-white text-lg font-semibold rounded-xl shadow-md hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <UserPlus className="h-6 w-6" />
            Daftar Anggota
          </Link>
          <Link
            href="/register/seller"
            className="px-8 py-4 bg-gray-200 text-gray-800 text-lg font-semibold rounded-xl shadow-md hover:bg-gray-300 transition flex items-center justify-center gap-2"
          >
            <Store className="h-6 w-6" />
            Mulai Jual Sekarang
          </Link>
        </motion.div>
      </div>
    </section>
  );
}