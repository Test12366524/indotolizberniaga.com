/* Stats Section */
"use client";
import { motion } from "framer-motion";

export default function Stats() {
  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: Aksen, Sorotan Angka
  const TEXT_COLOR = "#343A40"; // Warna teks profesional

  // Statistik yang relevan dengan marketplace elektronik
  const stats = [
    { number: "25.000+", label: "Pelanggan Terdaftar" },
    { number: "10.000+", label: "Produk Tersedia" },
    { number: "500K+", label: "Total Transaksi Berhasil" },
    { number: "34 Provinsi", label: "Jangkauan Pengiriman" },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: TEXT_COLOR }}>
            Data dan Fakta{" "}
            <span style={{ color: PRIMARY_COLOR }}>Indotoliz Berniaga</span>
          </h2>
          <p className="text-lg" style={{ color: TEXT_COLOR }}>
            Bukti nyata komitmen kami dalam membangun *marketplace* elektronik yang terpercaya.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-3xl shadow-md p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: ACCENT_COLOR }}>
                {stat.number}
              </h3>
              <p style={{ color: TEXT_COLOR }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}