"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Zap, // Mengganti Heart
  Shield,
  Award,
  ArrowRight,
  Truck, // Mengganti Award
  MessageCircle, // Mengganti Shield
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: CTA, Sorotan
  const TEXT_COLOR = "#343A40"; // Warna teks profesional
  const SECONDARY_TEXT = "#6C757D"; // Abu-abu sekunder

  const goToFaqPage = () => {
    router.push("/faq");
  };

  const faqs = [
    {
      question: "Apakah produk yang dijual di Indotoliz 100% original?",
      answer:
        "Ya, kami hanya bekerja dengan distributor resmi. Semua produk dijamin asli dan memiliki garansi resmi.",
    },
    {
      question: "Bagaimana cara menjadi seller di platform ini?",
      answer:
        "Anda dapat mendaftar melalui halaman profil. Kami menerima seller yang menjual produk elektronik, gadget, dan aksesori.",
    },
  ];

  const quickLinks = [
    { name: "Beranda", href: "/" },
    { name: "Tentang Kami", href: "/about" },
    { name: "Cara Pemesanan", href: "/how-to-order" },
    { name: "Testimoni", href: "/testimonials" },
    { name: "FAQs", href: "/faq" },
    { name: "Login Seller", href: "/auth/login" },
  ];

  return (
    <footer className="text-gray-700 relative overflow-hidden border-t" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="pt-16 pb-8 px-6 lg:px-12">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              {/* Company Info */}
              <div className="lg:col-span-2">
                {/* Logo & Company Name */}
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src="/logo-only-indotoliz.png" // Ganti dengan logo Indotoliz
                    alt="Indotoliz Berniaga Logo"
                    width={75}
                    height={75}
                    className="flex-shrink-0 object-contain"
                  />
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: TEXT_COLOR }}>
                      Indotoliz Berniaga
                    </h2>
                    <p className="text-sm" style={{ color: SECONDARY_TEXT }}>
                      Marketplace Elektronik & Solusi Digital
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-3" style={{ color: SECONDARY_TEXT }}>
                  Platform *e-commerce* terpercaya yang menyediakan produk
                  elektronik orisinal dan solusi digital terbaik untuk kebutuhan
                  Anda.
                </p>

                {/* Values (Disesuaikan) */}
                <div className="space-y-3 mb-3 text-sm">
                  <div className="flex items-center gap-2" style={{ color: SECONDARY_TEXT }}>
                    <Shield className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                    <span>Keamanan Transaksi Terjamin</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: SECONDARY_TEXT }}>
                    <MessageCircle className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
                    <span>Dukungan Pelanggan Cepat</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: SECONDARY_TEXT }}>
                    <Truck className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                    <span>Logistik Nasional Terintegrasi</span>
                  </div>
                </div>

                {/* Contact Info (Disesuaikan) */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3" style={{ color: SECONDARY_TEXT }}>
                    <MapPin className="w-4.5 h-4.5" style={{ color: PRIMARY_COLOR }} />
                    <span>
                      Jl Ahmad Yani,Kab Tolitoli Sulawesi Tengah 
                    </span>
                  </div>
                  <div className="flex items-center gap-3" style={{ color: SECONDARY_TEXT }}>
                    <Phone className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                    <span>+62 852 4134 9524(WA Support)</span>
                  </div>
                  <div className="flex items-center gap-3" style={{ color: SECONDARY_TEXT }}>
                    <Mail className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                    <span>indotolizberniaga@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-6" style={{ color: TEXT_COLOR }}>
                  Menu Utama
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="hover:text-[#0077B6] transition-colors flex items-center group"
                        style={{ color: SECONDARY_TEXT }}
                      >
                        <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: ACCENT_COLOR }} />
                        <span className="group-hover:translate-x-1 transition-transform">
                          {link.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQ */}
              <div>
                <h4 className="text-lg font-semibold mb-6" style={{ color: TEXT_COLOR }}>
                  FAQ Singkat
                </h4>
                <div className="space-y-4 mb-4">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                    >
                      <button
                        className="w-full flex justify-between items-center text-left p-4 hover:bg-gray-50 transition-colors"
                        style={{ color: SECONDARY_TEXT }}
                        onClick={() =>
                          setActiveIndex(activeIndex === i ? null : i)
                        }
                      >
                        <span className="font-medium text-sm pr-2">
                          {faq.question}
                        </span>
                        <div className="flex-shrink-0">
                          {activeIndex === i ? (
                            <ChevronUp className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
                          ) : (
                            <ChevronDown className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
                          )}
                        </div>
                      </button>
                      {activeIndex === i && (
                        <div className="px-4 pb-4">
                          <p className="text-sm leading-relaxed" style={{ color: SECONDARY_TEXT }}>
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={goToFaqPage}
                    type="button"
                    className="w-full text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    Punya Pertanyaan Lain?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Bottom Bar */}
        <div className="border-t border-gray-200" style={{ backgroundColor: '#ECEFF1' }}>
          <div className="container mx-auto px-6 lg:px-12 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <p style={{ color: SECONDARY_TEXT }}>
                © {new Date().getFullYear()} Indotoliz Berniaga. All rights
                reserved.
              </p>

              {/* Social Media */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <p className="text-sm" style={{ color: SECONDARY_TEXT }}>Ikuti kami di:</p>
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/indotoliz"
                    target="_blank"
                    rel="noopener noreferrer"
                    // Removed invalid style prop, use Tailwind for hover background
                    className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-[#FF6B35] hover:text-white transition-colors"
                  >
                    <FaInstagram size={18} style={{ color: SECONDARY_TEXT }} />
                  </a>
                  <a
                    className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-[#0077B6] hover:text-white transition-colors"
                    href="https://www.facebook.com/indotoliz"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebookF size={18} style={{ color: SECONDARY_TEXT }} />
                  </a>
                  <a
                    className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-green-500 hover:text-white transition-colors"
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaWhatsapp size={18} style={{ color: SECONDARY_TEXT }} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}