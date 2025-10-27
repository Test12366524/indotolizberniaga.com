"use client";
import { motion } from "framer-motion";
import { 
  ShieldCheck, // Mengganti Users: Kepercayaan/Keamanan
  Zap, // Mengganti Handshake: Inovasi/Kecepatan
  BarChart2, // Mengganti Scale: Pertumbuhan Bisnis
  PackageCheck // Mengganti TrendingUp: Kualitas/Garansi Produk
} from "lucide-react";

export default function Values() {
  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: Inovasi, Aksi
  const TEXT_COLOR = "#343A40"; // Warna teks profesional

  const values = [
    {
      icon: <ShieldCheck className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />,
      title: "Kepercayaan Konsumen",
      description:
        "Kami memprioritaskan keamanan data dan transaksi, memastikan setiap pengalaman belanja di Indotoliz Berniaga bebas cemas dan terlindungi.",
    },
    {
      icon: <Zap className="w-8 h-8" style={{ color: ACCENT_COLOR }} />,
      title: "Inovasi Berkelanjutan",
      description:
        "Kami terus berinovasi dalam fitur platform, layanan pengiriman, dan katalog produk untuk selalu menyediakan teknologi terkini bagi pelanggan.",
    },
    {
      icon: <PackageCheck className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />,
      title: "Kualitas Produk Terjamin",
      description:
        "Kami menjamin keaslian dan kualitas produk elektronik yang dijual di platform kami, didukung oleh garansi resmi dan proses pengembalian yang mudah.",
    },
    {
      icon: <BarChart2 className="w-8 h-8" style={{ color: ACCENT_COLOR }} />,
      title: "Kemitraan Penjual",
      description:
        "Kami berkomitmen untuk mendukung pertumbuhan bisnis penjual (*seller*) melalui sistem yang adil, transparan, dan alat analisis penjualan yang canggih.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: TEXT_COLOR }}>
            Nilai Inti{" "}
            <span style={{ color: PRIMARY_COLOR }}>Indotoliz Berniaga</span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: TEXT_COLOR }}>
            Prinsip yang menggerakkan kami dalam membangun *marketplace* elektronik
            yang modern dan terpercaya.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-2xl bg-gray-100 group-hover:scale-110 transform transition duration-300">
                  {/* Icon dipanggil dari object values, warna sudah diset di sana */}
                  {value.icon} 
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: TEXT_COLOR }}>
                {value.title}
              </h3>
              <p className="leading-relaxed" style={{ color: TEXT_COLOR }}>
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}