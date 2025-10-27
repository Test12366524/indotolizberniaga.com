"use client";

import Image from "next/image";
import { Zap, Shield, Sparkles, Truck, Globe } from "lucide-react"; // Mengganti Landmark dan Store

const Hero = () => {
  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: Aksen, Inovasi
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient (Mengubah warna dari Merah ke Biru/Netral) */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#F5FBFF] via-[#E6F3FF] to-[#FFFFFF]" 
          // Warna gradien yang lebih ringan, dingin, dan bersih
        ></div>

        {/* Decorative Elements (Menggunakan Biru Stabil dan Jingga Energi) */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-[#0077B6]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 right-16 w-20 h-20 bg-[#FF6B35]/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-[#0077B6]/20 rounded-full blur-md"></div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-20 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-8">
              <div 
                style={{ backgroundColor: `${ACCENT_COLOR}1A` }} // Jingga dengan Opacity
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              >
                <Sparkles className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
                <span className="text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  Marketplace Elektronik Indonesia
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Inovasi Digital,
                <span className="block text-gray-700">Pusat Teknologi</span>
                <span className="block" style={{ color: PRIMARY_COLOR }}>Terpercaya</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Indotoliz Berniaga adalah platform *e-commerce* yang didedikasikan
                untuk menyediakan produk elektronik terbaik, didukung oleh keamanan
                transaksi dan jaringan pengiriman yang luas di seluruh Indonesia.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Feature Card 1: Keamanan Transaksi (Menggunakan Biru Stabil) */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: PRIMARY_COLOR }}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      Transaksi Aman
                    </div>
                    <div className="text-sm text-gray-600">
                      Proteksi Pembeli Penuh
                    </div>
                  </div>
                </div>
                {/* Feature Card 2: Pengiriman Cepat (Menggunakan Jingga Energi) */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: ACCENT_COLOR }}>
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Marketplace</div>
                    <div className="text-sm text-gray-600">
                      Jangkauan Logistik Nasional
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/hero-tentang-kami.webp"
                  alt="Marketplace Indotoliz Berniaga"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Floating Badge (Mengubah fokus ke Pengiriman/Wilayah) */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {["ID", "SG", "MY", "VN"].map((initial, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-white text-xs font-bold"
                          style={{ backgroundColor: `${PRIMARY_COLOR}20`, color: PRIMARY_COLOR }}
                        >
                          {initial}
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="font-bold text-gray-900">34 Provinsi</div>
                      <div className="text-xs text-gray-600">
                        Jangkauan Pengiriman
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;