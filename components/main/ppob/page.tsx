"use client";

import { useState } from "react";
import {
  Sparkles,
  Smartphone,
  Wifi,
  Bolt,
  Wallet,
  Tv,
  Droplets,
  ShieldCheck,
  Zap,
  TicketPercent,
} from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";

// Tipe untuk kategori PPOB
type PPOBCategory =
  | "pulsa"
  | "data"
  | "pln"
  | "pdam"
  | "ewallet"
//   | "game"
  | "internet";
//   | "lainnya"

// Data layanan PPOB
const ppobServices = [
  { id: "pulsa", name: "Pulsa", icon: <Smartphone className="w-7 h-7" /> },
  { id: "data", name: "Paket Data", icon: <Wifi className="w-7 h-7" /> },
  { id: "pln", name: "Listrik PLN", icon: <Bolt className="w-7 h-7" /> },
  { id: "ewallet", name: "E-Wallet", icon: <Wallet className="w-7 h-7" /> },
//   { id: "game", name: "Voucher Game", icon: <Gamepad2 className="w-7 h-7" /> },
  { id: "pdam", name: "Air PDAM", icon: <Droplets className="w-7 h-7" /> },
  { id: "internet", name: "Internet & TV", icon: <Tv className="w-7 h-7" /> },
] as const; // `as const` untuk type safety
//   { id: "lainnya", name: "Lainnya", icon: <MoreHorizontal className="w-7 h-7" /> },



// Komponen Form untuk setiap layanan (Contoh)
const PulsaForm = () => {
  const [nomor, setNomor] = useState("");
  const [produk, setProduk] = useState<number | null>(null);
  const denominations = [10000, 25000, 50000, 100000];

  const handleSubmit = () => {
    if (!nomor || !produk) {
      Swal.fire("Gagal", "Mohon isi nomor telepon dan pilih nominal.", "error");
      return;
    }
    Swal.fire(
      "Berhasil!",
      `Pembelian pulsa Rp ${produk.toLocaleString(
        "id-ID"
      )} untuk nomor ${nomor} sedang diproses.`,
      "success"
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="nomor-telepon" className="block text-sm font-bold text-gray-800 mb-2">
          Nomor Telepon
        </label>
        <input
          id="nomor-telepon"
          type="tel"
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
          placeholder="Contoh: 081234567890"
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E53935]"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">Pilih Nominal</label>
        <div className="grid grid-cols-2 gap-3">
          {denominations.map((d) => (
            <button
              key={d}
              onClick={() => setProduk(d)}
              className={`text-left p-4 border rounded-2xl transition-all ${
                produk === d
                  ? "bg-[#E53935] text-white border-[#E53935] ring-2 ring-offset-2 ring-[#E53935]"
                  : "bg-white hover:border-[#E53935] hover:bg-red-50"
              }`}
            >
              <span className="font-bold text-lg">Rp {d.toLocaleString("id-ID")}</span>
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-[#E53935] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-red-700 transition-colors"
      >
        Beli Sekarang
      </button>
    </div>
  );
};

const PlnForm = () => {
  const [idPelanggan, setIdPelanggan] = useState("");
  
  const handleCekTagihan = () => {
    if (!idPelanggan) {
        Swal.fire("Gagal", "Mohon isi ID Pelanggan.", "error");
        return;
    }
    Swal.fire({
      title: 'Tagihan Ditemukan!',
      html: `
        <div class="text-left space-y-2">
          <p><strong>Nama:</strong> Budi Santoso</p>
          <p><strong>Periode:</strong> Oktober 2025</p>
          <p class="text-2xl font-bold"><strong>Tagihan:</strong> Rp 152.500</p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'Bayar Tagihan',
      confirmButtonColor: '#E53935'
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
       <div>
        <label htmlFor="id-pelanggan" className="block text-sm font-bold text-gray-800 mb-2">
          ID Pelanggan / Nomor Meter
        </label>
        <input
          id="id-pelanggan"
          type="text"
          value={idPelanggan}
          onChange={(e) => setIdPelanggan(e.target.value)}
          placeholder="Masukkan ID Pelanggan"
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E53935]"
        />
      </div>
       <button
        onClick={handleCekTagihan}
        className="w-full bg-[#E53935] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-red-700 transition-colors"
      >
        Cek Tagihan
      </button>
    </div>
  );
};

const GenericForm = ({ serviceName }: { serviceName: string }) => (
    <div className="space-y-6 animate-fade-in">
       <div>
        <label htmlFor="generic-input" className="block text-sm font-bold text-gray-800 mb-2">
          Nomor Pelanggan / ID
        </label>
        <input
          id="generic-input"
          type="text"
          placeholder={`Masukkan nomor untuk ${serviceName}`}
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E53935]"
        />
      </div>
       <button
        className="w-full bg-[#E53935] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-red-700 transition-colors"
      >
        Lanjutkan
      </button>
    </div>
);


export default function PPOBPage() {
  const [activeCategory, setActiveCategory] =
    useState<PPOBCategory>("pulsa");

  const renderForm = () => {
    switch (activeCategory) {
      case "pulsa":
        return <PulsaForm />;
      case "pln":
        return <PlnForm />;
      case "data":
        return <GenericForm serviceName="Paket Data"/>;
      case "pdam":
        return <GenericForm serviceName="Air PDAM"/>;
      case "ewallet":
        return <GenericForm serviceName="E-Wallet"/>;
    //   case "game":
    //     return <GenericForm serviceName="Voucher Game"/>;
      case "internet":
        return <GenericForm serviceName="Internet & TV"/>;
      default:
        return <p className="text-center text-gray-500">Pilih layanan untuk memulai.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#6B6B6B]/10">
      {/* ===================== Header / Hero ===================== */}
      <section className="relative pt-24 pb-12 px-6 lg:px-12 overflow-hidden bg-white">
        <div className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full bg-[#E53935]/10 blur-3xl opacity-50" />
        <div className="absolute top-1/3 right-[-10%] w-[28rem] h-[28rem] rounded-full bg-[#6B6B6B]/10 blur-3xl opacity-40" />

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#E53935]/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#E53935]" />
            <span className="text-sm font-medium text-[#6B6B6B]">
              Layanan Digital Koperasi
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-[#6B6B6B] mb-6">
            Bayar & Beli Kebutuhan{" "}
            <span className="block text-[#E53935]">Digital Anda</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Nikmati kemudahan membayar tagihan dan membeli produk digital
            langsung dari Koperasi Merah Putih. Cepat, aman, dan terpercaya.
          </p>
        </div>
      </section>

      {/* ===================== PPOB Main Section ===================== */}
      <section className="px-6 lg:px-12 py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Interactive Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-3xl font-bold text-[#6B6B6B] mb-2">Pilih Layanan</h2>
                <p className="text-gray-500 mb-8">Klik layanan yang Anda butuhkan di bawah ini.</p>
              
              {/* Service Selection */}
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mb-10">
                {ppobServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setActiveCategory(service.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl aspect-square transition-all duration-300 ${
                        activeCategory === service.id
                        ? "bg-[#E53935] text-white shadow-lg -translate-y-1"
                        : "bg-gray-100 text-[#6B6B6B] hover:bg-gray-200"
                    }`}
                  >
                    {service.icon}
                    <span className="text-xs font-semibold">{service.name}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Form Area */}
              <div className="border-t border-gray-200 pt-8">
                {renderForm()}
              </div>
            </div>

            {/* Right Column: Why Us & Promo */}
            <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 text-center">
                    <div className="relative h-48 mb-6">
                        <Image src="/ppob.webp" alt="Ilustrasi Pembayaran Digital" layout="fill" objectFit="contain" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#6B6B6B] mb-4">Kenapa Bertransaksi di Sini?</h3>
                    <div className="space-y-5 text-left">
                        <div className="flex items-start gap-4">
                            <div className="bg-[#E53935]/10 p-2 rounded-full"><Zap className="w-6 h-6 text-[#E53935]"/></div>
                            <div>
                                <h4 className="font-bold text-gray-800">Transaksi Cepat & Mudah</h4>
                                <p className="text-sm text-gray-500">Proses instan 24/7, hanya butuh beberapa klik.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="bg-[#E53935]/10 p-2 rounded-full"><ShieldCheck className="w-6 h-6 text-[#E53935]"/></div>
                            <div>
                                <h4 className="font-bold text-gray-800">Aman & Terpercaya</h4>
                                <p className="text-sm text-gray-500">Sistem terenkripsi untuk keamanan data Anda.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="bg-[#E53935]/10 p-2 rounded-full"><TicketPercent className="w-6 h-6 text-[#E53935]"/></div>
                            <div>
                                <h4 className="font-bold text-gray-800">Banyak Promo Menarik</h4>
                                <p className="text-sm text-gray-500">Dapatkan diskon dan cashback spesial untuk anggota.</p>
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
}