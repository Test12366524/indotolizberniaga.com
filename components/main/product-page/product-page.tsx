"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  ShoppingCart,
  Eye,
  Star,
  Search,
  Grid3X3,
  List,
  Zap,
  Package,
  MessageCircle,
  Truck,
  ChevronLeft, // Ikon untuk galeri slider
  ChevronRight, // Ikon untuk galeri slider
} from "lucide-react";
import Image from "next/image";
import { Product } from "@/types/admin/product";
import {
  useGetProductListPublicQuery,
  useGetProductBySlugQuery,
} from "@/services/product.service";
import DotdLoader from "@/components/loader/3dot";

// ==== Cart (tanpa sidebar)
import useCart from "@/hooks/use-cart";
import { useGetPublicProductCategoryListQuery } from "@/services/public/public-category.service";
import { useGetSellerShopListQuery } from "@/services/admin/seller.service";
import { Combobox } from "@/components/ui/combo-box";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type ViewMode = "grid" | "list";

// --- FUNGSI HELPER BARU ---
const getAllImages = (product: Product): string[] => {
  const images = [];
  // 1. Gambar utama
  if (typeof product.image === "string" && product.image) {
    images.push(product.image);
  }
  // 2. Gambar tambahan (image_2 sampai image_7)
  for (let i = 2; i <= 7; i++) {
    const key = `image_${i}` as keyof Product;
    if (typeof product[key] === "string" && product[key]) {
      images.push(product[key] as string);
    }
  }
  return images;
};

// --- FUNGSI HELPER YANG ADA ---
const toNumber = (val: number | string): number => {
    if (typeof val === "number") return val;
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) ? parsed : 0;
};
const getImageUrl = (p: Product): string => {
  if (typeof p.image === "string" && p.image) return p.image;
  const media = (p as unknown as { media?: Array<{ original_url: string }> })
    .media;
  if (Array.isArray(media) && media.length > 0 && media[0]?.original_url) {
    return media[0].original_url;
  }
  return "/api/placeholder/400/400";
};


export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [filter, setFilter] = useState({
    category: "all",
    ageGroup: "all",
    priceRange: "all",
    sort: "featured",
    sellerId: null as number | null,
  });

  const router = useRouter();

  const { data: session } = useSession();
  const userRole = session?.user?.roles[0]?.name ?? "";

  // Definisi Warna Brand
  const PRIMARY_COLOR = "#0077B6";
  const ACCENT_COLOR = "#FF6B35";
  const TEXT_COLOR = "#343A40";
  const SECONDARY_TEXT = "#6C757D";

  // Ambil kategori publik
  const {
    data: categoryResp,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
  } = useGetPublicProductCategoryListQuery({
    page: 1,
    paginate: 10,
  });

  const { data: sellerResp, isLoading: isSellerLoading } =
    useGetSellerShopListQuery({ page: 1, paginate: 10 });

  const [sellerQuery, setSellerQuery] = useState("");

  const sellers = useMemo(() => sellerResp?.data ?? [], [sellerResp]);

  const filteredSellers = useMemo(() => {
    const q = sellerQuery.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter((s) => {
      const shopName = s.shop?.name?.toLowerCase() ?? "";
      const name = s.name?.toLowerCase() ?? "";
      const email = s.email?.toLowerCase() ?? "";
      return shopName.includes(q) || name.includes(q) || email.includes(q);
    });
  }, [sellers, sellerQuery]);

  const selectedSeller = useMemo(
    () => sellers.find((s) => s.id === filter.sellerId) ?? null,
    [sellers, filter.sellerId]
  );

  const categoryOptions = useMemo(
    () => categoryResp?.data ?? [],
    [categoryResp]
  );

  // Cart actions
  const { addItem } = useCart();

  // === Pagination from API ===
  const ITEMS_PER_PAGE = 9;

  const {
    data: listResp,
    isLoading,
    isError,
    refetch,
  } = useGetProductListPublicQuery({
    page: currentPage,
    paginate: ITEMS_PER_PAGE,
    merk_id: 1,
  });

  const totalPages = useMemo(() => listResp?.last_page ?? 1, [listResp]);
  const products = useMemo(() => listResp?.data ?? [], [listResp]);

  // === Detail by slug (modal) ===
  const {
    data: detailProduct,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGetProductBySlugQuery(selectedSlug ?? "", {
    skip: !selectedSlug,
  });
  // --- STATE BARU UNTUK GAMBAR UTAMA DI MODAL ---
  const [mainImageUrl, setMainImageUrl] = useState<string>(""); 

  // Reset main image state ketika detailProduct berubah/modal dibuka
  useEffect(() => {
    if (detailProduct) {
      setMainImageUrl(getImageUrl(detailProduct));
    }
  }, [detailProduct]);
  // -----------------------------------------------------

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product: Product) => {
    addItem(product);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    }
  };

  const openProductModal = (p: Product) => {
    setSelectedSlug(p.slug);
    setIsModalOpen(true);
  };

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // === Client-side filter & sort ===
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const selectedShopName = selectedSeller?.shop?.name ?? "";

    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(term) ||
        p.category_name.toLowerCase().includes(term);

      const matchCategory =
        filter.category === "all" || p.category_name === filter.category;

      const price = p.price;
      const matchPrice =
        filter.priceRange === "all" ||
        (filter.priceRange === "under-100k" && price < 100_000) ||
        (filter.priceRange === "100k-200k" &&
          price >= 100_000 &&
          price <= 200_000) ||
        (filter.priceRange === "200k-500k" &&
          price > 200_000 &&
          price <= 500_000) ||
        (filter.priceRange === "above-500k" && price > 500_000);

      const matchSeller =
        !filter.sellerId ||
        (selectedShopName &&
          p.merk_name &&
          p.merk_name.toLowerCase() === selectedShopName.toLowerCase());

      return matchSearch && matchCategory && matchPrice && matchSeller;
    });
  }, [
    products,
    searchTerm,
    filter.category,
    filter.priceRange,
    filter.sellerId,
    selectedSeller,
  ]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (filter.sort) {
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      case "rating":
        return arr.sort((a, b) => toNumber(b.rating) - toNumber(a.rating));
      case "newest":
        return arr;
      default:
        return arr;
    }
  }, [filteredProducts, filter.sort]);

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-3">
            Gagal memuat produk.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl border"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#0077B6]/10">
      {/* ===================== Header / Hero (Tetap sama) ===================== */}
      <section className="relative pt-24 pb-12 px-6 lg:px-12 overflow-hidden bg-white">
        {/* background aksen */}
        <div className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full bg-[#0077B6]/10 blur-3xl opacity-50" />
        <div className="absolute top-1/3 right-[-10%] w-[28rem] h-[28rem] rounded-full bg-[#FF6B35]/10 blur-3xl opacity-40" />

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FF6B35]/10 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
            <span className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
              Pusat Elektronik & Gadget
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold mb-6" style={{ color: TEXT_COLOR }}>
            Jelajahi Produk{" "}
            <span className="block" style={{ color: PRIMARY_COLOR }}>Teknologi Terpercaya</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Temukan smartphone, laptop, dan aksesori terbaru dengan jaminan
            keaslian dan harga terbaik di Indotoliz Berniaga.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: SECONDARY_TEXT }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIMARY_COLOR }} />
              <span>Jaminan Original</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
              <span>Pengiriman Aman</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-black rounded-full" />
              <span>Ribuan Ulasan Positif</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Filters & Search (Tetap sama) ===================== */}
      <section className="px-6 lg:px-12 mb-8">
        <div className="container mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari gadget, komponen, & aksesori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Category */}
                <select
                  value={filter.category}
                  onChange={(e) =>
                    setFilter({ ...filter, category: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0077B6] bg-white"
                  style={{ color: TEXT_COLOR }}
                  disabled={isCategoryLoading}
                >
                  <option value="all">Semua Kategori</option>
                  {isCategoryLoading && (
                    <option value="" disabled>
                      Memuat kategori...
                    </option>
                  )}
                  {!isCategoryLoading &&
                    !isCategoryError &&
                    categoryOptions.map((cat) => (
                      <option key={cat.slug} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  {isCategoryError && (
                    <>
                      <option value="" disabled>
                        Gagal memuat kategori
                      </option>
                      {/* fallback (opsional) */}
                      <option value="lainnya">Lainnya</option>
                    </>
                  )}
                </select>

                {/* Price */}
                <select
                  value={filter.priceRange}
                  onChange={(e) =>
                    setFilter({ ...filter, priceRange: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0077B6] bg-white"
                  style={{ color: TEXT_COLOR }}
                >
                  <option value="all">Semua Harga</option>
                  <option value="under-100k">Di bawah Rp100.000</option>
                  <option value="100k-200k">Rp100.000 - Rp200.000</option>
                  <option value="200k-500k">Rp200.000 - Rp500.000</option>
                  <option value="above-500k">Di atas Rp500.000</option>
                </select>

                {/* Sort */}
                <select
                  value={filter.sort}
                  onChange={(e) =>
                    setFilter({ ...filter, sort: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0077B6] bg-white"
                  style={{ color: TEXT_COLOR }}
                >
                  <option value="featured">Unggulan</option>
                  <option value="newest">Terbaru</option>
                  <option value="price-low">Harga: Rendah - Tinggi</option>
                  <option value="price-high">Harga: Tinggi - Rendah</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>

                {/* Seller (Combobox) */}
                {userRole === "superadmin" && (
                  <div className="w-72 lg:w-40">
                    <Combobox
                      value={filter.sellerId}
                      onChange={(id) => setFilter({ ...filter, sellerId: id })}
                      onSearchChange={(q) => setSellerQuery(q)}
                      data={filteredSellers}
                      isLoading={isSellerLoading}
                      placeholder="Pilih Seller"
                      getOptionLabel={(s) =>
                        s.shop?.name
                          ? `${s.shop.name} (${s.email})`
                          : `${s.name} (${s.email})`
                      }
                      buttonClassName="h-12 rounded-xl" 
                    />
                  </div>
                )}

                {/* Reset semua filter */}
                <Button
                  className="h-12 border-2 text-white font-semibold rounded-2xl shadow-sm hover:opacity-90 transition-colors"
                  style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }} 
                  size="lg"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                    setFilter({
                      category: "all",
                      ageGroup: "all",
                      priceRange: "all",
                      sort: "featured",
                      sellerId: null,
                    });
                  }}
                >
                  Reset Filter
                </Button>
              </div>

              {/* View Mode */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-xl transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#0077B6] text-white shadow-sm"
                      : "text-gray-600 hover:text-[#0077B6]"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-xl transition-colors ${
                    viewMode === "list"
                      ? "bg-[#0077B6] text-white shadow-sm"
                      : "text-gray-600 hover:text-[#0077B6]"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid / List (Tetap sama) */}
      <section className="px-6 lg:px-12 pb-12">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            {isLoading ? (
              <div className="w-full flex justify-center items-center min-h-48">
                <DotdLoader />
              </div>
            ) : (
              <p style={{ color: SECONDARY_TEXT }}>
                Menampilkan {sortedProducts?.length ?? 0} dari{" "}
                {products?.length ?? 0} produk
              </p>
            )}
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {sortedProducts.map((product) => {
                const img = getImageUrl(product);
                const ratingNum = toNumber(product.rating);
                const reviews = product.total_reviews;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
                  >
                    <div className="relative">
                      <Image
                        src={img}
                        alt={product.name}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`p-2 rounded-full shadow-lg transition-colors ${
                            wishlist.includes(product.id)
                              ? "bg-[#0077B6] text-white"
                              : "bg-white text-gray-500 hover:text-[#0077B6]"
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              wishlist.includes(product.id)
                                ? "fill-current"
                                : ""
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => openProductModal(product)}
                          className="p-2 bg-white text-gray-500 hover:text-[#FF6B35] rounded-full shadow-lg transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <span className="text-xs font-medium" style={{ color: SECONDARY_TEXT }}>
                          {product.category_name}
                        </span>
                        <h3 className="text-lg font-bold mt-1 line-clamp-2" style={{ color: TEXT_COLOR }}>
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(ratingNum)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm" style={{ color: SECONDARY_TEXT }}>
                          ({reviews})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => addToCart(product)}
                          className="group flex-1 h-12 rounded-2xl text-white font-semibold shadow-sm transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                          style={{ backgroundColor: ACCENT_COLOR }}
                        >
                          <ShoppingCart className="w-5 h-5" />
                          <span>Tambah ke Keranjang</span>
                        </button>

                        <button
                          onClick={() => router.push("/chat?to=1")}
                          aria-label="Chat penjual"
                          className="h-12 w-12 rounded-2xl bg-white shadow-sm transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                          style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR, border: '2px solid' }}
                          title="Chat penjual"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedProducts.map((product) => {
                const img = getImageUrl(product);
                const ratingNum = toNumber(product.rating);
                const reviews = product.total_reviews;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-80">
                        <Image
                          src={img}
                          alt={product.name}
                          width={400}
                          height={300}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <span className="text-sm font-medium" style={{ color: SECONDARY_TEXT }}>
                                {product.category_name}
                              </span>
                              <h3 className="text-2xl font-bold mt-1" style={{ color: TEXT_COLOR }}>
                                {product.name}
                              </h3>
                            </div>
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className={`p-2 rounded-full transition-colors ${
                                wishlist.includes(product.id)
                                  ? "bg-[#0077B6] text-white"
                                  : "bg-gray-100 text-gray-500 hover:text-[#0077B6]"
                              }`}
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  wishlist.includes(product.id)
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                            </button>
                          </div>

                          <p className="mb-4 line-clamp-3" style={{ color: SECONDARY_TEXT }}>
                            {product.description}
                          </p>

                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.round(ratingNum)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm" style={{ color: SECONDARY_TEXT }}>
                              ({reviews} ulasan)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
                              Rp {product.price.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => openProductModal(product)}
                              className="px-6 py-3 rounded-2xl transition-colors"
                              style={{ borderColor: SECONDARY_TEXT, color: SECONDARY_TEXT, border: '1px solid' }}
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => addToCart(product)}
                              className="px-6 py-3 text-white rounded-2xl transition-colors flex items-center gap-2"
                              style={{ backgroundColor: ACCENT_COLOR }}
                            >
                              <ShoppingCart className="w-5 h-5" />
                              Tambah ke Keranjang
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${PRIMARY_COLOR}1A` }}>
                <Truck className="w-12 h-12" style={{ color: PRIMARY_COLOR }} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: TEXT_COLOR }}>
                Produk Teknologi Tidak Ditemukan
              </h3>
              <p className="mb-6" style={{ color: SECONDARY_TEXT }}>
                Coba ubah filter atau kata kunci pencarian Anda.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilter({
                    category: "all",
                    ageGroup: "all",
                    priceRange: "all",
                    sort: "featured",
                    sellerId: null,
                  });
                }}
                className="text-white px-6 py-3 rounded-2xl transition-colors"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Pagination (Tetap sama) */}
      {totalPages > 1 && (
        <section className="px-6 lg:px-12 pb-4">
          <div className="container mx-auto">
            <div className="flex justify-center items-center gap-4">
              {/* Previous Button */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-6 py-3 rounded-2xl transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR, border: '1px solid' }}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-12 h-12 rounded-2xl font-semibold transition-colors ${
                        currentPage === page
                          ? "text-white"
                          : "border hover:text-white"
                      }`}
                      style={{ 
                        backgroundColor: currentPage === page ? PRIMARY_COLOR : 'transparent',
                        borderColor: PRIMARY_COLOR,
                        color: currentPage === page ? 'white' : PRIMARY_COLOR,
                      }}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              {/* Next Button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-6 py-3 rounded-2xl transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR, border: '1px solid' }}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Product Detail Modal (by slug) */}
      {isModalOpen && selectedSlug && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold" style={{ color: TEXT_COLOR }}>
                  Detail Produk
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedSlug(null);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-2xl transition-colors"
                  style={{ color: TEXT_COLOR }}
                >
                  ✕
                </button>
              </div>

              {/* Error State */}
              {isDetailError && (
                <div style={{ color: ACCENT_COLOR }}>
                  Gagal memuat detail produk.
                </div>
              )}

              {/* Loading State */}
              {isDetailLoading && (
                <div className="w-full flex justify-center items-center min-h-32">
                  <DotdLoader />
                </div>
              )}

              {/* Content */}
              {detailProduct && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* === PRODUCT IMAGE GALLERY === */}
                  <div className="relative">
                    {/* 1. Main Cover Image */}
                    <div className="mb-4 relative">
                      <Image
                        // Menggunakan state lokal untuk main image URL
                        src={mainImageUrl}
                        alt={detailProduct.name}
                        width={500}
                        height={400}
                        className="w-full h-96 object-contain rounded-2xl border border-gray-200"
                        priority={true}
                      />
                    </div>

                    {/* 2. Thumbnails Slider */}
                    <div className="relative">
                      {/* Container untuk slide, overflow-hidden */}
                      <div className="overflow-hidden">
                        <div
                          id="thumbnail-slider"
                          className="flex gap-3 transition-transform duration-300 snap-x snap-mandatory"
                          // Note: Anda perlu menambahkan logika JS/React untuk mengontrol transform X
                          // Untuk kesederhanaan, saya akan membuat container ini scrollable
                          style={{ overflowX: 'auto' }}
                        >
                          {getAllImages(detailProduct).map((imgUrl, index) => (
                            <button
                              key={index}
                              onClick={() => setMainImageUrl(imgUrl)}
                              className={`w-20 h-20 flex-shrink-0 snap-start rounded-xl overflow-hidden border-2 transition-colors focus:outline-none 
                                ${mainImageUrl === imgUrl ? 'border-[#FF6B35]' : 'border-gray-200 hover:border-[#0077B6]'}`
                              }
                              title={`Lihat Gambar ${index + 1}`}
                            >
                              <Image
                                src={imgUrl}
                                alt={`${detailProduct.name} - ${index}`}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Navigation Buttons (Optional, hanya untuk indikasi) 
                       * Implementasi geser penuh memerlukan useRef dan logika DOM *
                      <button className="absolute left-[-15px] top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md z-10" aria-label="Previous image">
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button className="absolute right-[-15px] top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md z-10" aria-label="Next image">
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                      */}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 className="text-3xl font-bold mt-2 mb-4" style={{ color: TEXT_COLOR }}>
                      {detailProduct.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(toNumber(detailProduct.rating))
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span style={{ color: SECONDARY_TEXT }}>
                        ({detailProduct.total_reviews} ulasan)
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mb-6" style={{ color: SECONDARY_TEXT }}>
                      {detailProduct.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm" style={{ color: SECONDARY_TEXT }}>
                        <span className="font-medium">Kategori:</span>
                        <span>{detailProduct.category?.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm" style={{ color: SECONDARY_TEXT }}>
                        <span className="font-medium">Merk/Toko:</span>
                        <span>{detailProduct.merk?.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm" style={{ color: SECONDARY_TEXT }}>
                        <span className="font-medium">Stok Tersedia:</span>
                        <span>{detailProduct.stock}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl font-bold" style={{ color: ACCENT_COLOR }}>
                        Rp {detailProduct.price.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          addToCart(detailProduct);
                          setIsModalOpen(false);
                          setSelectedSlug(null);
                        }}
                        className="flex-1 text-white py-4 rounded-2xl font-semibold 
                             transition-colors flex items-center justify-center gap-2"
                        style={{ backgroundColor: ACCENT_COLOR }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Tambah ke Keranjang
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}