"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import en from "@/translations/home/en";
import id from "@/translations/home/id";
import { HandshakeIcon, LandmarkIcon } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const t = useTranslation({ id, en });

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
            <span className="text-[#E53935]">Koperasi Merah Putih:</span> <br />
            Mandiri, Sejahtera, dan Berdaya
          </h1>
          <p className="text-gray-600 text-lg">
            Wujudkan impian finansial Anda bersama kami. Nikmati layanan simpan
            pinjam yang mudah dan cepat, serta jelajahi beragam produk unggulan
            dari UMKM lokal di marketplace kami.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <Link
              href="/simpan-pinjam"
              className="px-6 py-3 bg-[#E53935] text-white font-medium rounded-xl shadow-md hover:bg-red-600 transition flex items-center gap-x-1.5"
            >
              <LandmarkIcon className="size-5" />
              Simpan Pinjam
            </Link>
            <Link
              href="/marketplace"
              className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-xl shadow-md hover:bg-gray-300 transition flex items-center gap-x-1.5"
            >
              <HandshakeIcon className="size-5" />
              Marketplace
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
          <Image
            src="/images/new/hero/koperasi-merah-putih.webp"
            alt="Koperasi Merah Putih Unit Usaha"
            width={500}
            height={500}
            className="rounded-2xl shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}