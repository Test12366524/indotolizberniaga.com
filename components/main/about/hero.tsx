"use client";

import Image from "next/image";
import { Heart, Shield, Sparkles, Landmark, Store } from "lucide-react";

const Hero = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F5] via-[#FDECEC] to-[#FFFFFF]"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-[#E53935]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 right-16 w-20 h-20 bg-[#6B6B6B]/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-[#E53935]/20 rounded-full blur-md"></div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-20 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#E53935]/10 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-[#E53935]" />
                <span className="text-sm font-medium text-[#E53935]">
                  Tentang Koperasi Merah Putih
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Mandiri, Sejahtera,
                <span className="block text-[#6B6B6B]">dan Berdaya</span>
                <span className="block text-[#E53935]">Bersama Koperasi</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Kami adalah koperasi modern yang berfokus pada pemberdayaan
                anggota melalui unit usaha simpan pinjam yang adil dan
                marketplace inovatif untuk memajukan UMKM lokal.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                  <div className="w-12 h-12 bg-[#6B6B6B] rounded-xl flex items-center justify-center">
                    <Landmark className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      Simpan Pinjam
                    </div>
                    <div className="text-sm text-gray-600">
                      Solusi Finansial Anggota
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                  <div className="w-12 h-12 bg-[#E53935] rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Marketplace</div>
                    <div className="text-sm text-gray-600">
                      Platform Jual-Beli UMKM
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
                  alt="Koperasi Merah Putih Anggota"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {["AP", "DL", "NP", "RS"].map((initial, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#E53935]/20 border-2 border-white text-xs font-bold text-[#E53935]"
                        >
                          {initial}
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="font-bold text-gray-900">2.500+</div>
                      <div className="text-xs text-gray-600">
                        Anggota Aktif
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