"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Package } from "lucide-react"; 

export default function BrandStory() {
  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: Inovasi, Aksi
  const TEXT_COLOR = "#343A40"; // Warna teks profesional

  // Cerita yang relevan dengan evolusi marketplace elektronik
  const story = [
    {
      year: "2018",
      title: "Visi Platform Digital",
      desc: "Indotoliz didirikan sebagai startup teknologi dengan visi menciptakan platform *e-commerce* yang berfokus pada produk elektronik terpercaya dan terjamin.",
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
    },
    {
      year: "2021",
      title: "Peluncuran Marketplace Beta",
      desc: "Setelah pengembangan sistem keamanan dan infrastruktur logistik, Indotoliz Berniaga meluncurkan versi beta, fokus pada pengalaman pengguna yang intuitif dan cepat.",
      icon: <Zap className="w-6 h-6 text-white" />,
    },
    {
      year: "2024",
      title: "Ekspansi Nasional & Logistik",
      desc: "Indotoliz memperkuat kemitraan dengan layanan logistik premium, memungkinkan pengiriman produk elektronik yang aman dan cepat ke seluruh 34 provinsi di Indonesia.",
      icon: <Package className="w-6 h-6 text-white" />,
    },
  ];

  return (
    <section 
      className="py-20" 
      style={{ 
        backgroundImage: `linear-gradient(to right, ${PRIMARY_COLOR}0A, ${ACCENT_COLOR}0A)` 
      }}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: TEXT_COLOR }}>
            Perjalanan{" "}
            <span style={{ color: PRIMARY_COLOR }}>Indotoliz Berniaga</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: TEXT_COLOR }}>
            Evolusi kami dari visi digital hingga menjadi *marketplace* elektronik
            terkemuka di Indonesia.
          </p>
        </motion.div>

        {/* Timeline Line membutuhkan induk RELATIVE dan memiliki tinggi yang cukup (misal padding) */}
        <div className="relative"> 
          {/* -------------------- PERBAIKAN DI SINI -------------------- */}
          <div 
            className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full" 
            style={{ backgroundColor: `${PRIMARY_COLOR}20` }}
          />
          {/* ------------------------------------------------------------- */}

          <div className="space-y-12">
            {story.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`flex flex-col lg:flex-row items-center ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  index % 2 === 0 ? "lg:pr-12" : "lg:pl-12"
                }`}>
                  <div className="text-2xl font-bold mb-2" style={{ color: ACCENT_COLOR }}>
                    {item.year}
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: PRIMARY_COLOR }}>
                    {item.title}
                  </h3>
                  <p style={{ color: TEXT_COLOR }}>{item.desc}</p>
                </div>

                {/* Timeline Dot (Menggunakan Biru Stabil) */}
                <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg mx-8" style={{ backgroundColor: PRIMARY_COLOR }}>
                  {item.icon}
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}