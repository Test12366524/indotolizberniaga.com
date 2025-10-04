"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Heart,
  Shield,
  Award,
  ArrowRight,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const goToFaqPage = () => {
    router.push("/faq");
  };

  const faqs = [
    {
      question: "Bagaimana cara menjadi anggota Koperasi Merah Putih?",
      answer:
        "Anda dapat mendaftar melalui aplikasi internal kami atau menghubungi tim kami. Prosesnya cepat dan mudah!",
    },
    {
      question: "Apakah UMKM bisa menjual produk di marketplace?",
      answer:
        "Ya, semua anggota koperasi bisa mendaftar sebagai seller di marketplace kami. Ini adalah platform khusus untuk UMKM anggota.",
    },
  ];

  const quickLinks = [
    { name: "Beranda", href: "/" },
    { name: "Tentang Kami", href: "/about" },
    { name: "Cara Pemesanan", href: "/how-to-order" },
    { name: "Testimoni", href: "/testimonials" },
    { name: "FAQs", href: "/faq" },
    { name: "Login Anggota", href: "/auth/login" },
  ];

  return (
    <footer className="bg-gray-50 text-gray-700 relative overflow-hidden border-t">
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="pt-16 pb-8 px-6 lg:px-12">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              {/* Company Info */}
              <div className="lg:col-span-2">
                {/* --- PERUBAHAN DIMULAI DI SINI --- */}
                {/* Struktur diubah agar logo dan teks sejajar */}
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src="/logo-koperasi-merah-putih-online.webp"
                    alt="Koperasi Merah Putih Logo"
                    width={75}
                    height={75}
                    className="flex-shrink-0 object-contain"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Koperasi Merah Putih
                    </h2>
                    <p className="text-sm text-gray-600">
                      Koperasi Simpan Pinjam & Marketplace untuk UMKM
                    </p>
                  </div>
                </div>
                {/* --- PERUBAHAN SELESAI DI SINI --- */}

                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Mewujudkan kemandirian dan kesejahteraan anggota melalui unit
                  usaha simpan pinjam dan marketplace yang terintegrasi.
                </p>

                {/* Values */}
                <div className="space-y-3 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#E53935]" />
                    <span>Anggota sebagai Prioritas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#E53935]" />
                    <span>Transparansi & Akuntabilitas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#E53935]" />
                    <span>Kesejahteraan Bersama</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4.5 h-4.5 text-[#E53935]" />
                    <span>
                      Jl. Kemerdekaan No. 17, Jakarta Pusat, DKI Jakarta 10120
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#E53935]" />
                    <span>+62 812 3456 7890</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#E53935]" />
                    <span>info@koperasimerahputih.co.id</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-gray-800">
                  Menu Utama
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-gray-600 hover:text-[#E53935] transition-colors flex items-center group"
                      >
                        <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#E53935]" />
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
                <h4 className="text-lg font-semibold mb-6 text-gray-800">
                  FAQ
                </h4>
                <div className="space-y-4 mb-4">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                    >
                      <button
                        className="w-full flex justify-between items-center text-left p-4 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() =>
                          setActiveIndex(activeIndex === i ? null : i)
                        }
                      >
                        <span className="font-medium text-sm pr-2">
                          {faq.question}
                        </span>
                        <div className="flex-shrink-0">
                          {activeIndex === i ? (
                            <ChevronUp className="w-4 h-4 text-[#E53935]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#E53935]" />
                          )}
                        </div>
                      </button>
                      {activeIndex === i && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={goToFaqPage}
                    type="button"
                    className="w-full bg-[#E53935] text-white py-3 rounded-2xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    Punya Pertanyaan Lain?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Bottom Bar */}
        <div className="border-t border-gray-200 bg-gray-100">
          <div className="container mx-auto px-6 lg:px-12 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <p>
                © {new Date().getFullYear()} Koperasi Merah Putih. All rights
                reserved.
              </p>

              {/* Social Media */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <p className="text-gray-600 text-sm">Ikuti kami di:</p>
                <div className="flex gap-4">
                  <a
                    className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-pink-500 hover:text-white"
                    href="https://www.instagram.com/koperasimerahputih"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram size={18} />
                  </a>
                  <a
                    className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white"
                    href="https://www.facebook.com/koperasimerahputih"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebookF size={18} />
                  </a>
                  <a
                    className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-green-500 hover:text-white"
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaWhatsapp size={18} />
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