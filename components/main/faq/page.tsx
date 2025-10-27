"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Zap, ChevronRight, Monitor, ShoppingCart, Truck, CreditCard, User } from "lucide-react"; // Mengganti Sparkles dan ikon lain
import FaqItems from "./faq-items"; // Asumsi komponen ini tetap

const FaqPage = () => {
  const [groupsActive, setGroupsActive] = useState<Array<number>>([]);
  
  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: CTA, Sorotan
  const TEXT_COLOR = "#343A40"; // Warna teks profesional
  const SECONDARY_TEXT = "#6C757D"; // Abu-abu sekunder


  const groupedFaqs: {
    name: string;
    items: { question: string; answer: string }[];
  }[] = [
    {
      name: "Produk & Keaslian",
      items: [
        {
          question: "Apakah produk yang dijual di Indotoliz Berniaga 100% Original?",
          answer:
            "Ya, kami bekerja sama hanya dengan distributor resmi dan *seller* terverifikasi. Kami menjamin keaslian semua produk elektronik dan *gadget*. Jika terbukti palsu, kami berikan jaminan uang kembali.",
        },
        {
          question: "Apakah produk sudah termasuk garansi resmi?",
          answer:
            "Sebagian besar produk *gadget* dan elektronik besar datang dengan garansi resmi pabrik. Detail garansi selalu tertera di deskripsi produk. Anda juga bisa membeli perlindungan tambahan.",
        },
        {
          question: "Bagaimana cara mengecek spesifikasi produk secara detail?",
          answer:
            "Spesifikasi detail produk dapat Anda lihat di deskripsi. Untuk informasi lebih lanjut, Anda bisa menghubungi *seller* melalui fitur *chat* yang tersedia.",
        },
        {
          question: "Apakah ada layanan jasa instalasi atau perbaikan?",
          answer:
            "Kami menyediakan beberapa layanan purna jual dan konsultasi teknis yang dapat Anda pesan melalui kategori 'Layanan Jasa'.",
        },
      ],
    },
    {
      name: "Pemesanan & Transaksi",
      items: [
        {
          question: "Bagaimana cara melakukan pesanan di Indotoliz?",
          answer:
            "Pilih produk → Tambah ke keranjang → Lanjut ke *checkout* → Isi alamat dan pilih kurir → Pilih metode pembayaran → Bayar sesuai instruksi.",
        },
        {
          question: "Apakah bisa membatalkan pesanan yang sudah dibayar?",
          answer:
            "Pembatalan pesanan hanya dapat dilakukan jika status pesanan masih 'Menunggu Konfirmasi Penjual'. Jika sudah diproses, pembatalan tidak dapat dilakukan, kecuali dengan persetujuan penjual.",
        },
        {
          question:
            "Apakah Indotoliz menyediakan layanan Beli Sekarang Bayar Nanti (*PayLater*)?",
          answer:
            "Saat ini kami menerima pembayaran melalui Virtual Account dan E-Wallet. Kami sedang berupaya mengintegrasikan layanan *PayLater* di masa mendatang.",
        },
      ],
    },
    {
      name: "Pengiriman & Garansi",
      items: [
        {
          question: "Berapa lama estimasi pengiriman produk elektronik?",
          answer:
            "Pengiriman bervariasi. Umumnya 2–5 hari kerja untuk Jabodetabek, dan 5–10 hari kerja untuk luar pulau, tergantung jenis kurir yang Anda pilih.",
        },
        {
          question: "Apakah ada free shipping?",
          answer:
            "Promo *free shipping* tersedia pada periode tertentu atau untuk pembelian di atas nominal tertentu. Cek banner promo di halaman utama kami.",
        },
        {
          question: "Bagaimana jika produk yang diterima rusak saat pengiriman?",
          answer:
            "Kami memiliki Garansi Proteksi Pengiriman. Jika produk rusak, segera ajukan komplain dengan menyertakan video *unboxing* dalam 1x24 jam. Kami akan memproses retur atau pengembalian dana.",
        },
      ],
    },
    {
      name: "Pembayaran & Keamanan",
      items: [
        {
          question: "Metode pembayaran apa saja yang tersedia?",
          answer:
            "Kami menerima Transfer Bank (VA, Bank Lokal), E-wallet (OVO, GoPay, DANA, ShopeePay), dan Kartu Kredit. Semua transaksi aman dan terintegrasi.",
        },
        {
          question: "Apakah aman berbelanja di website Indotoliz Berniaga?",
          answer:
            "Ya, transaksi Anda 100% aman. Kami menggunakan sistem *payment gateway* terpercaya dengan enkripsi SSL untuk melindungi data finansial dan pribadi Anda.",
        },
      ],
    },
    {
      name: "Seller & Kemitraan",
      items: [
        {
          question: "Bagaimana cara menjadi *seller* di Indotoliz Berniaga?",
          answer:
            "Anda bisa mendaftar melalui menu 'Jual di Indotoliz' di halaman profil Anda. Lengkapi dokumen toko dan produk elektronik yang Anda jual. Tim kami akan memverifikasi dalam 1-3 hari kerja.",
        },
        {
          question: "Apa keuntungan menjadi *seller* di platform ini?",
          answer:
            "Anda mendapatkan biaya komisi yang kompetitif, akses ke fitur promosi, integrasi logistik nasional, dan dukungan penuh untuk pertumbuhan bisnis elektronik Anda.",
        },
        {
          question: "Apakah ada biaya tersembunyi untuk *seller*?",
          answer:
            "Tidak ada biaya tersembunyi. Biaya hanya berupa komisi penjualan yang dikenakan setelah produk berhasil terjual dan biaya layanan tambahan (jika digunakan).",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#0077B60A]">
      {/* Header Section */}
      <section className="pt-24 pb-6 px-6 lg:px-12">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${ACCENT_COLOR}10` }}>
            <Zap className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
            <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>FAQ Marketplace</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold mb-6" style={{ color: TEXT_COLOR }}>
            Ada Pertanyaan?
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: SECONDARY_TEXT }}>
            Temukan jawaban cepat seputar produk elektronik, transaksi, garansi, dan pengiriman bersama{" "}
            <span className="font-semibold" style={{ color: PRIMARY_COLOR }}>Indotoliz Berniaga</span>.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="pt-4 pb-24 px-6 lg:px-12">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-3">
            {groupedFaqs.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "border-b border-gray-200 py-3 transition-all",
                  "hover:bg-gray-50 rounded-xl px-3"
                )}
              >
                <button
                  onClick={() => {
                    setGroupsActive((state) =>
                      state.includes(index)
                        ? state.filter((x) => x !== index)
                        : [...state, index]
                    );
                  }}
                  className="w-full flex items-center gap-x-2 text-left"
                >
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      { "rotate-90": groupsActive.includes(index) }
                    )}
                    strokeWidth={2.3}
                    style={{ color: ACCENT_COLOR }} // Warna ikon disesuaikan
                  />
                  <span className="text-lg font-medium" style={{ color: TEXT_COLOR }}>
                    {item.name}
                  </span>
                </button>
                {groupsActive.includes(index) && (
                  <div className="mt-3" style={{ color: SECONDARY_TEXT }}>
                    <FaqItems faqs={item.items} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;