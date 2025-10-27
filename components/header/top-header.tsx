// Header.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Globe,
  MessageSquare,
  Zap, // Mengganti Sparkles atau ikon umum lainnya jika diperlukan
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useCart from "@/hooks/use-cart";
import Image from "next/image";

interface TranslationContent {
  home: string;
  about: string;
  products: string;
  service: string;
  testimonials: string;
  news: string;
  ppob: string;
  tagline: string;
  switchLanguage: string;
  shopNow: string; // Tambah untuk mobile footer CTA
}

interface Translations {
  id: TranslationContent;
  en: TranslationContent;
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { switchLang } = useLanguage();
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const cartItems = useCart((s) => s.cartItems);
  const cartCount = useMemo(
    () => cartItems.reduce((t, item) => t + item.quantity, 0),
    [cartItems]
  );

  // === DEFINISI WARNA BRAND ===
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: CTA, Sorotan
  const TEXT_COLOR = "#343A40"; // Warna teks profesional
  const SECONDARY_TEXT = "#6C757D"; // Abu-abu sekunder

  const translations: Translations = {
    id: {
      home: "Beranda",
      products: "Produk",
      service: "Layanan",
      ppob: "PPOB",
      about: "Tentang Kami",
      news: "Artikel",
      testimonials: "Testimoni",
      tagline: "Marketplace Elektronik & Solusi Digital",
      switchLanguage: "Ganti ke English",
      shopNow: "Belanja Sekarang",
    },
    en: {
      home: "Home",
      products: "Products",
      service: "Services",
      ppob: "PPOB",
      about: "About Us",
      news: "Articles",
      testimonials: "Testimonials",
      tagline: "Electronics Marketplace & Digital Solutions",
      switchLanguage: "Switch to Bahasa",
      shopNow: "Shop Now",
    },
  };

  const t = translations[language];

  const menuItems = [
    { name: t.about, href: "/about" },
    { name: t.products, href: "/product" },
    { name: t.ppob, href: "/ppob" },
    { name: t.news, href: "/news" },
    { name: t.testimonials, href: "/testimonials" },
  ];

  // Colors untuk mobile menu, disesuaikan dengan brand
  const menuItemColors = [
    {
      name: t.about,
      href: "/about",
      hoverBg: "hover:bg-gray-100", // Ubah sesuai skema
      activeBg: `bg-[${PRIMARY_COLOR}1A]`, // Warna aktif yang lebih lembut
      textColor: TEXT_COLOR,
    },
    {
      name: t.products,
      href: "/product",
      hoverBg: "hover:bg-gray-100",
      activeBg: `bg-[${PRIMARY_COLOR}1A]`,
      textColor: TEXT_COLOR,
    },
    {
      name: t.ppob,
      href: "/ppob",
      hoverBg: "hover:bg-gray-100",
      activeBg: `bg-[${PRIMARY_COLOR}1A]`,
      textColor: TEXT_COLOR,
    },
    {
      name: t.news,
      href: "/news",
      hoverBg: "hover:bg-gray-100",
      activeBg: `bg-[${PRIMARY_COLOR}1A]`,
      textColor: TEXT_COLOR,
    },
    {
      name: t.testimonials,
      href: "/testimonials",
      hoverBg: "hover:bg-gray-100",
      activeBg: `bg-[${PRIMARY_COLOR}1A]`,
      textColor: TEXT_COLOR,
    },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("indotoliz-language"); // Ganti yameiya
      if (savedLanguage === "id" || savedLanguage === "en") {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  const toggleLanguage = () => {
    const newLang = language === "id" ? "en" : "id";
    setLanguage(newLang);
    switchLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("indotoliz-language", newLang); // Ganti yameiya
      window.dispatchEvent(
        new CustomEvent("languageChanged", { detail: newLang })
      );
    }
  };

  const handleCartClick = () => {
    router.push("/cart"); // Gunakan router.push
    // window.dispatchEvent(new CustomEvent("openCart")); // Ini lebih ke event internal, tidak perlu di sini
  };

  const handleUserClick = () => {
    if (status === "loading") return;
    if (session?.user) {
      router.push("/me");
    } else {
      router.push("/login");
    }
  };

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-100"
            : "bg-white/90 backdrop-blur-sm shadow-md"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="flex items-center gap-1">
                  <Image
                    src="/logo-only-indotoliz.png" // Pastikan path logo benar
                    alt="Indotoliz Berniaga Logo"
                    width={50}
                    height={50}
                    className="flex-shrink-0 object-contain"
                  />
                  <div className="hidden sm:flex flex-col leading-tight">
                    <h2 className="text-lg font-semibold" style={{ color: TEXT_COLOR }}>
                      Indotoliz Berniaga
                    </h2>
                    <p className="text-xs mt-[-5px]" style={{ color: SECONDARY_TEXT }}>
                      {t.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative font-semibold transition-all duration-300 py-3 px-4 rounded-xl ${
                    isActiveLink(item.href)
                      ? `bg-[${PRIMARY_COLOR}1A] text-[${PRIMARY_COLOR}] shadow-sm` // Aktif dengan warna Biru Stabil transparan
                      : `text-[${SECONDARY_TEXT}] hover:bg-gray-100` // Teks abu-abu sekunder saat tidak aktif
                  }`}
                  style={{ color: isActiveLink(item.href) ? PRIMARY_COLOR : SECONDARY_TEXT }} // Inline style for dynamic color
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Language Toggle - Desktop */}
              <button
                onClick={toggleLanguage}
                className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm`}
                style={{ backgroundColor: `${PRIMARY_COLOR}10`, color: PRIMARY_COLOR }}
                title={t.switchLanguage}
              >
                <Globe className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
                <span className="text-sm font-bold">
                  {language.toUpperCase()}
                </span>
              </button>

              {/* User Icon */}
              <button
                onClick={handleUserClick}
                className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-300"
                aria-label="User"
              >
                <User className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
              </button>

              {/* Cart */}
              <button
                onClick={handleCartClick}
                className="relative p-3 rounded-xl hover:bg-gray-100 transition-all duration-300"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 text-white text-xs font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-white shadow-lg`}
                    style={{ backgroundColor: ACCENT_COLOR }} // Warna jingga untuk notifikasi cart
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-300"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                ) : (
                  <Menu className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleMobileMenu}
      >
        <div
          className={`fixed top-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Header */}
          <div className="p-6 border-b border-gray-200" style={{ backgroundColor: `${PRIMARY_COLOR}1A` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-indotoliz-berniaga.png" // Pastikan path logo benar
                  alt="Indotoliz Berniaga Logo"
                  width={40}
                  height={40}
                  className="flex-shrink-0 object-contain"
                />
                <div>
                  <h2 className="font-bold bg-gradient-to-r from-[#0077B6] to-[#FF6B35] text-transparent bg-clip-text">
                    Indotoliz Berniaga
                  </h2>
                  <p className="text-xs" style={{ color: SECONDARY_TEXT }}>{t.tagline}</p>
                </div>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Items */}
          <div className="p-6 space-y-2 flex-1 overflow-y-auto">
            {menuItemColors.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={toggleMobileMenu}
                className={`flex items-center gap-4 p-4 rounded-2xl font-semibold transition-all duration-300 group ${
                  isActiveLink(item.href)
                    ? `text-[${TEXT_COLOR}] ${item.activeBg} border-2 border-[${PRIMARY_COLOR}33] shadow-md`
                    : `text-[${SECONDARY_TEXT}] ${item.hoverBg} hover:shadow-sm`
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isMobileMenuOpen
                    ? "slideInRight 0.3s ease-out forwards"
                    : "none",
                }}
              >
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                    isActiveLink(item.href)
                      ? `bg-[${ACCENT_COLOR}]` // Aktif dengan warna jingga
                      : "bg-gray-300 group-hover:bg-gray-500"
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {isActiveLink(item.href) && (
                  <div className="w-1 h-6 rounded-full shadow-sm" style={{ backgroundColor: ACCENT_COLOR }} />
                )}
              </Link>
            ))}

            {/* Language Toggle - Mobile */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-4 p-4 w-full rounded-2xl font-semibold transition-all duration-300 mt-6 border-2 border-[${PRIMARY_COLOR}33]`}
              style={{ backgroundColor: `${PRIMARY_COLOR}10`, color: PRIMARY_COLOR }}
            >
              <Globe className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
              <span className="flex-1 text-left">{t.switchLanguage}</span>
              <span className={`text-sm font-bold text-white px-3 py-1 rounded-lg shadow-md`} style={{ backgroundColor: PRIMARY_COLOR }}>
                {language === "id" ? "EN" : "ID"}
              </span>
            </button>
          </div>

          {/* Mobile Footer */}
          <div className="p-6 border-t border-gray-200" style={{ backgroundColor: `${PRIMARY_COLOR}1A` }}>
            <div className="flex items-center justify-center gap-4">
              <button
                className={`flex-1 text-white py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg transform hover:scale-105`}
                style={{ backgroundColor: ACCENT_COLOR }} // CTA warna jingga
              >
                {t.shopNow}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}