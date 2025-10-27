"use client";
import { motion } from "framer-motion";

export default function Mission() {
  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: Aksen
  const TEXT_COLOR = "#343A40"; // Abu-abu gelap/Hitam untuk teks body

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: TEXT_COLOR }}>
            Visi & <span style={{ color: PRIMARY_COLOR }}>Misi</span>
          </h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: TEXT_COLOR }}>
            Indotoliz Berniaga hadir untuk menjadi jembatan utama dalam
            ekosistem digital, memfasilitasi setiap transaksi produk teknologi
            dengan **aman, transparan, dan inovatif** di Indonesia.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Visi Card */}
          <div className="bg-white shadow-lg rounded-3xl p-6 border-l-4" style={{ borderColor: PRIMARY_COLOR }}>
            <h3 className="text-2xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>Visi</h3>
            <p style={{ color: TEXT_COLOR }}>
              Menjadi platform marketplace elektronik terdepan dan paling
              terpercaya di Indonesia yang menghubungkan pembeli dan penjual
              produk teknologi secara efisien.
            </p>
          </div>
          
          {/* Misi Card */}
          <div className="bg-white shadow-lg rounded-3xl p-6 border-l-4" style={{ borderColor: ACCENT_COLOR }}>
            <h3 className="text-2xl font-bold mb-2" style={{ color: TEXT_COLOR }}>Misi</h3>
            <p style={{ color: TEXT_COLOR }}>
              1. Menyediakan ragam produk elektronik berkualitas tinggi dengan
              harga yang kompetitif. <br />
              2. Memastikan keamanan dan kenyamanan transaksi melalui sistem
              yang modern dan transparan. <br />
              3. Mendorong pertumbuhan bisnis *seller* melalui fitur-fitur
              platform yang inovatif dan dukungan logistik yang handal.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}