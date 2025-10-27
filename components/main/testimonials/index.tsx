"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Zap, User, Store, ShieldCheck, Truck, MessageCircle } from "lucide-react"; // Mengganti Landmark
import Image from "next/image";

export default function TestimonialsPage() {
  const router = useRouter();

  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: CTA, Sorotan
  const TEXT_COLOR = "#343A40"; // Warna teks profesional
  const SECONDARY_TEXT = "#6C757D"; // Abu-abu sekunder

  const goToRegisterPage = () => {
    router.push("/register");
  };

  const testimonials = [
    {
      id: 1,
      name: "Budi, 45",
      role: "Pembeli Elektronik",
      image: "/avatars/1.jpeg",
      content:
        "Saya sering belanja komponen PC di sini. Produknya selalu original, harganya kompetitif, dan yang paling penting, pengirimannya aman dan terpercaya sampai tujuan.",
    },
    {
      id: 2,
      name: "Siti, 32",
      role: "Seller Gadget",
      image: "/avatars/2.jpeg",
      content:
        "Sejak menjual produk di Indotoliz Berniaga, jangkauan pasar saya meluas. Sistem pembayaran cepat dan dukungan *seller*-nya sangat membantu meningkatkan omzet toko saya.",
    },
    {
      id: 3,
      name: "Rudi, 55",
      role: "Pembeli PPOB",
      image: "/avatars/3.jpeg",
      content:
        "Platform ini sangat mudah digunakan, bahkan bagi saya yang kurang familiar dengan teknologi. Isi pulsa dan bayar tagihan digital jadi cepat dan tanpa kendala.",
    },
  ];

  return (
    <>
      <section className={`px-6 lg:px-12 py-20 bg-gradient-to-b from-white to-[${PRIMARY_COLOR}10]`}>
        <div className="container mx-auto text-center">
          {/* Heading */}
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ color: PRIMARY_COLOR, backgroundColor: `${PRIMARY_COLOR}20` }}>
            <Zap className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            <span className="text-sm font-medium">Pengalaman Pengguna</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: TEXT_COLOR }}
          >
            Apa Kata Pelanggan Kami?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg mb-12 max-w-2xl mx-auto"
            style={{ color: SECONDARY_TEXT }}
          >
            Dengarkan pengalaman nyata dari pembeli dan *seller* yang sudah
            merasakan manfaat bertransaksi di Indotoliz Berniaga.
          </motion.p>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-all"
              >
                <div className="relative w-20 h-20 mb-4">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: TEXT_COLOR }}>
                  {t.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: ACCENT_COLOR }}>{t.role}</p>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array(5)
                    .fill(0)
                    .map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-5 h-5 text-yellow-500 fill-current"
                      />
                    ))}
                </div>

                <p className="leading-relaxed" style={{ color: SECONDARY_TEXT }}>{t.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Customer Stats Section */}
      <section className="px-6 lg:px-12 py-16">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100"
          >
            <h3 className="text-4xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>500K+</h3>
            <p className="text-gray-600">Total Transaksi Berhasil</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100"
          >
            <h3 className="text-4xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>99%</h3>
            <p className="text-gray-600">Tingkat Keaslian Produk</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100"
          >
            <h3 className="text-4xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>4.8/5</h3>
            <p className="text-gray-600">Rating Rata-rata Toko</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-12 py-20">
        <div className="container mx-auto">
          <div className="rounded-3xl p-12 text-center text-white" style={{ background: PRIMARY_COLOR }}>
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Siap Jelajahi Dunia Teknologi?
            </motion.h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Gabung sekarang, temukan produk elektronik terbaik, atau mulai
              bisnis *e-commerce* Anda sebagai *seller* terverifikasi.
            </p>
            <motion.button
              onClick={goToRegisterPage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center mx-auto gap-2"
              style={{ backgroundColor: ACCENT_COLOR, color: 'white' }}
            >
              <Store className="w-5 h-5" />
              Daftar Jadi Pelanggan/Seller
            </motion.button>
          </div>
        </div>
      </section>
    </>
  );
}