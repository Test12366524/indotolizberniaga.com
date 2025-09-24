"use client";
import { motion } from "framer-motion";
import { Users, Handshake, Scale, TrendingUp } from "lucide-react";

const values = [
  {
    icon: <Users className="w-8 h-8 text-[#E53935]" />,
    title: "Keanggotaan Berpusat",
    description:
      "Kami menempatkan anggota sebagai prioritas utama, memastikan setiap keputusan dan layanan berfokus pada kesejahteraan kolektif.",
  },
  {
    icon: <Handshake className="w-8 h-8 text-[#6B6B6B]" />,
    title: "Keadilan & Transparansi",
    description:
      "Kami berkomitmen untuk menjalankan semua operasional dengan adil dan transparan, membangun kepercayaan yang kuat di antara seluruh anggota.",
  },
  {
    icon: <Scale className="w-8 h-8 text-[#E53935]" />,
    title: "Inovasi & Teknologi",
    description:
      "Kami terus berinovasi, memanfaatkan teknologi modern untuk menyediakan layanan simpan pinjam dan marketplace yang efisien dan mudah diakses.",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-[#6B6B6B]" />,
    title: "Kemandirian Ekonomi",
    description:
      "Tujuan kami adalah memberdayakan anggota secara finansial, membantu mereka mencapai kemandirian dan pertumbuhan ekonomi yang berkelanjutan.",
  },
];

export default function Values() {
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
          <h2 className="text-4xl lg:text-5xl font-bold text-[#6B6B6B] mb-6">
            Nilai Utama{" "}
            <span className="text-[#E53935]">Koperasi Merah Putih</span>
          </h2>
          <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
            Prinsip yang selalu kami pegang dalam membangun ekosistem ekonomi
            yang kuat dan terpercaya.
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
                  {value.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#6B6B6B] mb-4">
                {value.title}
              </h3>
              <p className="text-[#6B6B6B] leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}