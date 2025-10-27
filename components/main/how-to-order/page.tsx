"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart,
  CreditCard,
  User,
  Package,
  CheckCircle,
  ArrowRight,
  Zap, // Mengganti Sparkles
  ShieldCheck, // Mengganti Shield
  Truck,
  HeadphonesIcon,
  Mail,
  MessageCircle,
  Star,
  Play,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowLeft,
  Store, // Marketplace
  Smartphone, // Digital/PPOB
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Step {
  id: number;
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  image: string;
  tips?: string[];
}
interface FAQ {
  question: string;
  answer: string;
}

export default function HowToOrderPage() {
  const router = useRouter();

  const goToMarketplacePage = () => {
    router.push("/product"); // Diarahkan ke /product (Marketplace Elektronik)
  };

  const [activeStep, setActiveStep] = useState(1);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // === DEFINISI WARNA BRAND ===
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: CTA, Sorotan
  const TEXT_COLOR = "#343A40"; // Warna teks profesional
  const SECONDARY_TEXT = "#6C757D"; // Abu-abu sekunder

  const orderSteps: Step[] = [
    {
      id: 1,
      title: "Cari Produk Elektronik",
      description:
        "Jelajahi Indotoliz Berniaga untuk menemukan smartphone, laptop, aksesori, atau layanan digital (pulsa, data, dll).",
      details: [
        "Jelajahi kategori (Gadget, Komponen, Aksesori, PPOB)",
        "Pilih produk atau layanan yang Anda butuhkan",
        "Cek detail produk, spesifikasi, dan ulasan dari pembeli",
      ],
      icon: <Store className="w-8 h-8" />,
      image: "/images/new/order-steps/step-1.png",
      tips: [
        "Gunakan filter dan pencarian untuk menemukan produk dengan cepat",
        "Periksa rating dan keaslian toko sebelum membeli",
      ],
    },
    {
      id: 2,
      title: "Tambahkan ke Keranjang",
      description:
        "Masukkan produk fisik ke keranjang belanja atau lengkapi data untuk layanan digital (PPOB).",
      details: [
        "Klik 'Tambah ke Keranjang' untuk produk fisik",
        "Ubah jumlah produk yang akan dibeli",
        "Untuk PPOB, masukkan nomor pelanggan/telepon di halaman PPOB",
        "Klik 'Checkout' untuk melanjutkan",
      ],
      icon: <ShoppingCart className="w-8 h-8" />,
      image: "/images/new/order-steps/step-2.png",
      tips: [
        "Pastikan Anda sudah login untuk menyimpan keranjang",
        "Jika ada kode promo, masukkan di halaman checkout",
      ],
    },
    {
      id: 3,
      title: "Lengkapi Alamat & Kontak",
      description:
        "Isi data diri, alamat pengiriman yang valid, dan pilih kurir untuk produk fisik.",
      details: [
        "Verifikasi nama dan nomor WhatsApp aktif",
        "Pilih atau tambahkan alamat lengkap untuk pengiriman produk",
        "Pilih layanan logistik (JNE, SiCepat, dll)",
        "Tambahkan catatan khusus untuk penjual jika diperlukan",
      ],
      icon: <User className="w-8 h-8" />,
      image: "/images/new/order-steps/step-3.png",
      tips: [
        "Pastikan nomor WhatsApp aktif untuk konfirmasi kurir",
        "Alamat harus jelas (patokan, RT/RW, Kelurahan)",
      ],
    },
    {
      id: 4,
      title: "Selesaikan Pembayaran",
      description:
        "Lakukan pembayaran sesuai metode yang Anda pilih untuk mengkonfirmasi pesanan.",
      details: [
        "Pilih metode: Transfer Bank, Virtual Account, atau E-Wallet",
        "Ikuti instruksi pembayaran dan batas waktu yang tertera",
        "Sistem akan memverifikasi pembayaran Anda secara otomatis",
        "Konfirmasi pembayaran dikirim via Email",
      ],
      icon: <CreditCard className="w-8 h-8" />,
      image: "/images/new/order-steps/step-4.png",
      tips: [
        "Gunakan Virtual Account untuk verifikasi tercepat",
        "Simpan bukti pembayaran untuk berjaga-jaga",
      ],
    },
    {
      id: 5,
      title: "Pesanan Diproses",
      description:
        "Produk elektronik segera diproses oleh penjual, dan pesanan PPOB dikirim secara instan.",
      details: [
        "Pesanan produk fisik diproses oleh seller dalam 1 hari kerja",
        "Layanan PPOB (Pulsa/Data) terkirim dalam hitungan detik",
        "Nomor resi pengiriman akan di-update penjual",
        "Estimasi pengiriman produk 2-5 hari kerja (tergantung kurir)",
      ],
      icon: <Package className="w-8 h-8" />,
      image: "/images/new/order-steps/step-5.png",
      tips: [
        "Cek status pesanan secara berkala di menu 'Pesanan Saya'",
        "Hubungi penjual melalui chat jika ada keterlambatan proses",
      ],
    },
    {
      id: 6,
      title: "Terima & Beri Review",
      description:
        "Setelah produk diterima dengan baik, konfirmasi pesanan selesai dan berikan ulasan Anda.",
      details: [
        "Konfirmasi penerimaan produk di menu 'Pesanan Saya'",
        "Beri rating dan ulasan terhadap produk dan pelayanan toko",
        "Nikmati perangkat baru Anda!",
      ],
      icon: <Truck className="w-8 h-8" />,
      image: "/images/new/order-steps/step-6.png",
      tips: [
        "Pastikan barang berfungsi sebelum konfirmasi selesai",
        "Ulasan Anda sangat membantu pembeli lain",
      ],
    },
  ];

  const faqs: FAQ[] = [
    {
      question: "Apakah saya harus punya akun untuk membeli di Indotoliz?",
      answer:
        "Ya, Anda harus membuat akun untuk bertransaksi. Akun memudahkan Anda menyimpan alamat, melacak pesanan, dan mendapatkan notifikasi promo.",
    },
    {
      question: "Bagaimana cara tahu produk yang dijual asli?",
      answer:
        "Kami bekerja sama dengan seller terverifikasi dan merek resmi. Kami mendorong pembeli untuk selalu memeriksa ulasan dan detail garansi sebelum membeli. Jika ada indikasi palsu, Anda dapat melaporkannya.",
    },
    {
      question: "Metode pembayaran apa saja yang tersedia?",
      answer:
        "Kami menerima pembayaran melalui Transfer Bank (BCA, Mandiri, dll.), Virtual Account, dan E-Wallet (GoPay, OVO, Dana).",
    },
    {
      question: "Berapa lama waktu yang dibutuhkan untuk pengiriman?",
      answer:
        "Waktu pengiriman bervariasi tergantung lokasi dan kurir yang dipilih, umumnya 2-5 hari kerja setelah penjual menyerahkan barang ke kurir.",
    },
    {
      question: "Bagaimana jika ada kendala atau produk yang rusak?",
      answer:
        "Anda bisa mengajukan komplain atau retur melalui pusat resolusi pesanan di akun Anda, atau hubungi Customer Service kami untuk bantuan lebih lanjut.",
    },
    {
      question: "Apakah saya bisa menjadi seller di Indotoliz Berniaga?",
      answer:
        "Tentu! Kami menyambut seller yang menjual produk elektronik, gadget, atau aksesori resmi. Anda bisa mendaftar melalui menu 'Jual di Indotoliz' di halaman profil.",
    },
  ];

  const paymentMethods = [
    {
      name: "Transfer Bank",
      icon: "🏦",
      description: "BCA, Mandiri, BNI, BRI",
    },
    {
      name: "Virtual Account",
      icon: "💳",
      description: "Verifikasi Otomatis",
    },
    {
      name: "E-Wallet",
      icon: "📱",
      description: "GoPay, OVO, DANA",
    },
    {
      name: "COD",
      icon: "📦",
      description: "Bayar di Tempat (Area Terpilih)",
    },
  ];

  const benefits = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Terjamin Aman",
      description: "Proteksi Pembeli Penuh",
      color: PRIMARY_COLOR
    },
    {
      icon: <HeadphonesIcon className="w-6 h-6" />,
      title: "Dukungan Cepat",
      description: "Tim Support Fast Response",
      color: ACCENT_COLOR
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Logistik Luas",
      description: "Kurir Nasional Terintegrasi",
      color: PRIMARY_COLOR
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(180deg, #FFFFFF 0%, ${PRIMARY_COLOR}1A 100%)`,
      }}
    >
      {/* ============== HERO (Marketplace theme) ============== */}
      <section className="relative pt-24 pb-12 px-6 lg:px-12 overflow-hidden bg-white">
        {/* bubbles blend */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full"
            style={{
              background: PRIMARY_COLOR, // Biru
              filter: "blur(80px)",
              opacity: 0.15,
            }}
          />
          <div
            className="absolute -top-10 right-[-10%] w-[28rem] h-[28rem] rounded-full"
            style={{
              background: ACCENT_COLOR, // Jingga
              filter: "blur(100px)",
              opacity: 0.12,
            }}
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: ACCENT_COLOR, color: "#FFFFFF" }}
          >
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm font-medium">Panduan Belanja</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6" style={{ color: TEXT_COLOR }}>
            Cara Mudah Bertransaksi
            <span className="block" style={{ color: PRIMARY_COLOR }}>di Indotoliz Berniaga</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: SECONDARY_TEXT }}>
            Ikuti panduan langkah demi langkah untuk membeli produk elektronik
            favorit Anda dan bertransaksi PPOB dengan aman dan cepat.
          </p>

          {/* Quick Stats / Benefits */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
              >
                <div className="flex justify-center mb-3" style={{ color: benefit.color }}>
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: TEXT_COLOR }}>
                  {benefit.title}
                </h3>
                <p className="text-xs" style={{ color: SECONDARY_TEXT }}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== STEP NAV + CONTENT ============== */}
      <section className="px-6 lg:px-12 mb-16 bg-white pt-10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: TEXT_COLOR }}>
              6 Langkah <span style={{ color: ACCENT_COLOR }}>Cepat & Aman</span>
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: SECONDARY_TEXT }}>
              Proses transaksi yang terintegrasi, dirancang untuk keamanan dan kenyamanan pembeli.
            </p>
          </div>

          {/* Step Navigation */}
            <div className="flex justify-center mb-12">
            <div
              className="bg-white rounded-3xl p-6 shadow-lg w-full"
              style={{ border: `1px solid ${PRIMARY_COLOR}33` }}
            >
              <div className="flex flex-wrap gap-3 justify-center items-center">
              {orderSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className="flex flex-col items-center gap-2 w-full sm:w-auto px-4 py-3 rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base"
                    style={
                    activeStep === step.id
                      ? {
                        backgroundColor: PRIMARY_COLOR,
                        color: "#fff",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                      }
                      : {
                        backgroundColor: "#F3F4F6",
                        color: SECONDARY_TEXT,
                      }
                    }
                  >
                    <div
                    className="p-2 rounded-xl flex items-center justify-center mx-auto"
                    style={{
                      backgroundColor:
                      activeStep === step.id ? "#FFFFFF33" : "#fff",
                    }}
                    >
                    <div
                      style={{
                      color:
                        activeStep === step.id ? "#fff" : ACCENT_COLOR,
                      }}
                    >
                      {step.icon}
                    </div>
                    </div>
                    <span className="sm:hidden">{step.id}</span>
                  </button>
                  </TooltipTrigger>
                  <TooltipContent>
                  {index + 1}. {step.title}
                  </TooltipContent>
                </Tooltip>
                {index < orderSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-[#0077B6]/30 mx-2" />
                )}
                </div>
              ))}
              </div>
            </div>
            </div>

          {/* Active Step Content */}
          {orderSteps.map((step) => (
            <div
              key={step.id}
              className={`transition-all duration-500 ${
                activeStep === step.id
                  ? "opacity-100 visible"
                  : "opacity-0 invisible absolute"
              }`}
            >
              {activeStep === step.id && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Content */}
                    <div className="p-8 lg:p-12">
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
                          style={{ backgroundColor: PRIMARY_COLOR }} // Biru Stabil
                        >
                          {step.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: ACCENT_COLOR }}>
                            Langkah {step.id}
                          </div>
                          <h3 className="text-2xl font-bold" style={{ color: TEXT_COLOR }}>
                            {step.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-lg mb-6" style={{ color: SECONDARY_TEXT }}>
                        {step.description}
                      </p>

                      <div className="space-y-4 mb-8">
                        <h4 className="font-semibold" style={{ color: TEXT_COLOR }}>
                          Detail Langkah:
                        </h4>
                        {step.details.map((detail, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${ACCENT_COLOR}10` }}>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
                            </div>
                            <span style={{ color: SECONDARY_TEXT }}>{detail}</span>
                          </div>
                        ))}
                      </div>

                      {step.tips && (
                        <div className="rounded-2xl p-6" style={{ backgroundColor: `${PRIMARY_COLOR}08` }}>
                          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: PRIMARY_COLOR }}>
                            <AlertCircle className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                            Tips Berguna:
                          </h4>
                          <ul className="space-y-2">
                            {step.tips.map((tip, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-start gap-2"
                                style={{ color: SECONDARY_TEXT }}
                              >
                                <Star className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ACCENT_COLOR }} />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Visual */}
                    <div className="relative flex items-center justify-center p-8 bg-gradient-to-br from-[#FFFFFF] via-[#F9F9F9]">
                      <div className="relative w-full max-w-md">
                        <Image
                          src={step.image}
                          alt={step.title}
                          width={400}
                          height={300}
                          className="w-full h-auto rounded-2xl shadow-lg"
                        />
                        <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full opacity-50" style={{ backgroundColor: `${ACCENT_COLOR}30` }} />
                        <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full opacity-50" style={{ backgroundColor: `${PRIMARY_COLOR}30` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border hover:bg-[#0077B6] hover:text-white"
              style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
            >
              <ArrowLeft className="w-5 h-5" />
              Langkah Sebelumnya
            </button>

            <button
              onClick={() => setActiveStep(Math.min(6, activeStep + 1))}
              disabled={activeStep === 6}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              Langkah Selanjutnya
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============== PAYMENT (section putih) ============== */}
      <section className="px-6 lg:px-12 mb-16">
        <div className="container mx-auto">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg">
            {/* Title */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: TEXT_COLOR }}>
                Metode <span style={{ color: ACCENT_COLOR }}>Pembayaran</span>
              </h2>
              <p className="max-w-2xl mx-auto" style={{ color: SECONDARY_TEXT }}>
                Kami menyediakan berbagai metode pembayaran yang aman dan
                terpercaya untuk semua transaksi Anda.
              </p>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl transition-all duration-300 border hover:shadow-md"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div
                    className="text-4xl mb-4"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    {method.icon}
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: TEXT_COLOR }}>
                    {method.name}
                  </h3>
                  <p className="text-sm" style={{ color: SECONDARY_TEXT }}>{method.description}</p>
                </div>
              ))}
            </div>

            {/* Security Info */}
            <div
              className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: `${PRIMARY_COLOR}10` }} // Biru lembut transparan
            >
              <div className="flex justify-center mb-4">
                <ShieldCheck className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: TEXT_COLOR }}>
                Keamanan Terjamin
              </h3>
              <p style={{ color: SECONDARY_TEXT }}>
                Semua transaksi dilindungi sistem keamanan digital terenkripsi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CONTACT (section berwarna) ============== */}
      <section className="px-6 lg:px-12 mb-16">
        <div className="container mx-auto">
          <div
            className="rounded-3xl p-8 lg:p-12 text-gray-900"
            style={{
              background: PRIMARY_COLOR, // Biru Stabil
              color: "#fff",
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Butuh Bantuan?</h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                Tim Customer Services kami siap membantu Anda terkait pesanan, pengiriman, dan produk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <p className="text-white/90">+62 812 345 6789</p>
                <p className="text-sm text-white/70">
                  Respon cepat fast response
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-white/90">support@indotoliz.co.id</p>
                <p className="text-sm text-white/70">Respon dalam 2 jam kerja</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HeadphonesIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-white/90">24/7 Virtual Support</p>
                <p className="text-sm text-white/70">Asisten chatbot tersedia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CTA (section putih) ============== */}
      <section className="px-6 lg:px-12 mb-16">
        <div className="container mx-auto">
          <div className="bg-white rounded-3xl p-8 lg:p-12 text-center shadow-lg">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: TEXT_COLOR }}>
              Siap Jelajahi Dunia Teknologi?
            </h2>
            <p className="mb-8 max-w-2xl mx-auto" style={{ color: SECONDARY_TEXT }}>
              Mulai belanja produk elektronik orisinal dan temukan berbagai solusi digital sekarang!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={goToMarketplacePage}
                className="text-white px-8 py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2 hover:opacity-90"
                style={{ backgroundColor: ACCENT_COLOR }} // CTA utama: Jingga Energi
              >
                <Store className="w-5 h-5" />
                Masuk ke Marketplace
              </button>
              <button
                onClick={() => router.push("/ppob")}
                className="px-8 py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2 border hover:bg-[#0077B6] hover:text-white"
                style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }} // CTA sekunder: Biru Stabil
              >
                <Smartphone className="w-5 h-5" />
                Layanan Digital PPOB
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FAQ (section putih) ============== */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: TEXT_COLOR }}>
              Pertanyaan <span style={{ color: ACCENT_COLOR }}>Umum</span>
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: SECONDARY_TEXT }}>
              Temukan jawaban untuk pertanyaan yang sering ditanyakan tentang
              proses transaksi di platform kami.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === index ? null : index)
                    }
                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold pr-4" style={{ color: TEXT_COLOR }}>
                      {faq.question}
                    </h3>
                    {expandedFAQ === index ? (
                      <ChevronUp
                        className="w-5 h-5"
                        style={{ color: PRIMARY_COLOR }}
                      />
                    ) : (
                      <ChevronDown
                        className="w-5 h-5"
                        style={{ color: PRIMARY_COLOR }}
                      />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-6">
                      <p className="leading-relaxed" style={{ color: SECONDARY_TEXT }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}