"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function TeamSection() {
  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: Aksen
  const TEXT_COLOR = "#343A40"; // Warna teks profesional

  // Struktur tim yang relevan dengan E-commerce/Tech
  const team = [
    {
      name: "Hadi Purwanto",
      role: "CEO & Pendiri",
      image: "/hadi.jpeg",
    },
    {
      name: "Sardina",
      role: "Logistic",
      image: "/sardina.jpeg",
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
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: TEXT_COLOR }}>
            Tim Profesional{" "}
            <span style={{ color: PRIMARY_COLOR }}>Indotoliz Berniaga</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: TEXT_COLOR }}>
            Tim berdedikasi yang membangun dan menjaga platform teknologi terpercaya
            untuk pengalaman belanja *e-commerce* terbaik.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center group"
            >
              <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden shadow-lg group-hover:scale-105 transform transition duration-300">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold" style={{ color: TEXT_COLOR }}>
                {member.name}
              </h3>
              {/* Warna peran menggunakan Jingga Energi sebagai aksen */}
              <p className="font-medium" style={{ color: ACCENT_COLOR }}>
                {member.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}