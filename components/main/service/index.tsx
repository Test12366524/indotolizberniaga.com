"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Zap, // Mengganti Sparkles
  Wrench, // Mengganti Handshake: Layanan Teknis/Perbaikan
  MessageSquare, // Mengganti DollarSign: Konsultasi/Dukungan
  ShieldCheck, // Mengganti BookOpen: Garansi/Proteksi
} from "lucide-react";
import Image from "next/image";
import ReservationModal from "./reservation-modal"; // Asumsi modal ini sudah ada
import { useGetProductListPublicQuery } from "@/services/product.service";

interface Service {
  id: number;
  thumbnail: string;
  images: Array<{ image: string }>;
  name: string;
  description: string;
  price: number;
  duration: string;
  category_name: string;
  merk_name: string;
}

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6"; // Biru Stabil: Kepercayaan, Teknologi
  const ACCENT_COLOR = "#FF6B35"; // Jingga Energi: CTA, Sorotan
  const TEXT_COLOR = "#343A40"; // Warna teks profesional
  const SECONDARY_TEXT = "#6C757D"; // Abu-abu sekunder

  // Fetch services from API
  const {
    data: shopProductsData,
    isLoading,
    error,
  } = useGetProductListPublicQuery({
    page: currentPage,
    paginate: 9,
    merk_id: 2, // API call is already filtering by brand ID
  });

  // Transform API data to Service format
  const services = useMemo(() => {
    if (!shopProductsData?.data) return [];

    return shopProductsData.data.map((product) => {
      const images = [
        product.image,
        product.image_2,
        product.image_3,
        product.image_4,
        product.image_5,
        product.image_6,
        product.image_7,
      ].filter((img) => typeof img === "string" && img.trim() !== "");

      return {
        id: product.id,
        thumbnail:
          typeof product.image === "string"
            ? product.image
            : "/images/placeholder.jpg",
        images: images.map((img) => ({
          image: typeof img === "string" ? img : "",
        })),
        name: product.name,
        description: product.description,
        price: product.price,
        duration: product.stock ? `${product.stock} Jam` : "30 Menit", // Mengubah Durasi dari Menit ke Jam (lebih masuk akal untuk jasa)
        category_name: product.category_name,
        merk_name: product.merk_name,
      };
    });
  }, [shopProductsData]);

  // Pagination logic
  const totalPages = useMemo(
    () => shopProductsData?.last_page ?? 1,
    [shopProductsData]
  );

  const getImageUrl = (p: Service): string => {
    if (typeof p.thumbnail === "string" && p.thumbnail) return p.thumbnail;
    const media = (p as unknown as { media?: Array<{ original_url: string }> })
      .media;
    if (Array.isArray(media) && media.length > 0 && media[0]?.original_url) {
      return media[0].original_url;
    }
    return "/images/placeholder.jpg";
  };

  const openModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const renderPaginationButtons = () => {
    const pageButtons = [];
    const maxButtons = 5;

    // Logic to render a limited number of page buttons with ellipses
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(i);
      }
    } else {
      pageButtons.push(1);
      if (currentPage > 3) {
        pageButtons.push("...");
      }
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pageButtons.push(i);
      }
      if (currentPage < totalPages - 2) {
        pageButtons.push("...");
      }
      pageButtons.push(totalPages);
    }

    return pageButtons.map((page, index) =>
      page === "..." ? (
        <span key={index} className="px-4 py-2" style={{ color: SECONDARY_TEXT }}>
          ...
        </span>
      ) : (
        <button
          key={page}
          onClick={() => setCurrentPage(Number(page))}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            currentPage === page
              ? "text-white"
              : "border hover:text-white"
          }`}
          style={{
            backgroundColor: currentPage === page ? ACCENT_COLOR : 'transparent', // CTA/Aksen untuk halaman aktif
            borderColor: SECONDARY_TEXT,
            color: currentPage === page ? 'white' : SECONDARY_TEXT,
          }}
        >
          {page}
        </button>
      )
    );
  };

  return (
    <section className="bg-white min-h-screen">
      {/* Hero Section - Layanan Purna Jual */}
      <section className="pt-24 pb-16 px-6 lg:px-12 bg-gradient-to-r from-white via-[#F5FBFF] to-[#E6F3FF]">
        <div className="container mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${PRIMARY_COLOR}10` }}>
            <Zap className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>Layanan Nilai Tambah Teknologi</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6" style={{ color: TEXT_COLOR }}>
            Solusi Purna Jual & IT
            <span className="block" style={{ color: ACCENT_COLOR }}>Spesialis Elektronik Anda</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: SECONDARY_TEXT }}>
            Kami menyediakan layanan purna jual, perbaikan, dan konsultasi
            teknis profesional untuk memastikan perangkat elektronik Anda selalu
            berfungsi optimal.
          </p>

          {/* Tags (Ikon dan warna disesuaikan) */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
              <Wrench className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              <span style={{ color: SECONDARY_TEXT }}>Jasa Perbaikan</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
              <MessageSquare className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
              <span style={{ color: SECONDARY_TEXT }}>Konsultasi IT</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
              <ShieldCheck className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
              <span style={{ color: SECONDARY_TEXT }}>Proteksi Garansi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <div id="services" className="container mx-auto px-6 lg:px-12 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-12"
          style={{ color: TEXT_COLOR }}
        >
          Katalog Jasa Kami
        </motion.h2>

        {isLoading ? (
          // Loading state (warna loading dipertahankan netral)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-3xl shadow-md p-6 animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200 rounded-t-2xl mb-3"></div>
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state (warna tombol disesuaikan)
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Gagal memuat layanan</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-2xl font-semibold transition-colors"
              style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
            >
              Coba Lagi
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="mb-4" style={{ color: SECONDARY_TEXT }}>Belum ada layanan tersedia</p>
          </div>
        ) : (
          // Services List
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-3xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <Image
                    className="w-full aspect-video object-cover mb-3 rounded-t-2xl"
                    src={getImageUrl(service)}
                    width={400}
                    height={225}
                    alt={service.name}
                    unoptimized={true}
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.jpg";
                    }}
                    onLoad={() => {
                      console.log(
                        "Image loaded successfully for",
                        service.name
                      );
                    }}
                    priority={false}
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-full" 
                      style={{ backgroundColor: `${ACCENT_COLOR}1A`, color: ACCENT_COLOR }} // Aksen Jingga
                    >
                      {service.category_name}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: PRIMARY_COLOR }}>
                    {service.name}
                  </h3>
                  <p className="mb-4 line-clamp-3" style={{ color: SECONDARY_TEXT }}>
                    {service.description}
                  </p>
                  <p className="text-sm mb-2" style={{ color: SECONDARY_TEXT }}>
                    Durasi: {service.duration}
                  </p>
                  <p className="text-lg font-bold" style={{ color: ACCENT_COLOR }}>
                    Rp {service.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <button
                  onClick={() => openModal(service)}
                  className="mt-6 w-full py-3 rounded-2xl font-semibold transition-colors"
                  style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }} // CTA utama: Biru Stabil
                >
                  Ajukan Layanan
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-12">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ borderColor: SECONDARY_TEXT, color: SECONDARY_TEXT }}
          >
            Previous
          </button>
          {renderPaginationButtons()}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#0077B6] hover:text-white"
            style={{ borderColor: SECONDARY_TEXT, color: SECONDARY_TEXT }}
          >
            Next
          </button>
        </div>
      )}

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
      />
    </section>
  );
}