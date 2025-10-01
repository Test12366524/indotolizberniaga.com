"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useGetProductListQuery } from "@/services/product.service";
import { useGetPosAnggotaQuery } from "@/services/pos-kasir.service";
import { useCreatePosTransactionMutation } from "@/services/pos-kasir.service";
import {
  Search,
  Plus,
  Trash2,
  ShoppingCart,
  Minus,
  User,
  CreditCard,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  category_name: string;
  quantity: number;
}

export default function KasirPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [formData, setFormData] = useState({
    payment_type: "manual" as "automatic" | "manual" | "saldo",
    user_id: "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    wallet_id: "",
    status: 0,
    voucher: [] as number[],
  });

  // API calls
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductListQuery({
      page: 1,
      paginate: 100,
    });

  const { data: anggotaData } = useGetPosAnggotaQuery({
    page: 1,
    paginate: 100,
  });

  const [createTransaction, { isLoading: isCreating }] =
    useCreatePosTransactionMutation();

  const products = useMemo(() => {
    if (!productsData?.data) return [];
    return Array.isArray(productsData.data) ? productsData.data : [];
  }, [productsData?.data]);

  const anggota = useMemo(() => {
    if (!anggotaData?.data?.data) return [];
    return Array.isArray(anggotaData.data.data) ? anggotaData.data.data : [];
  }, [anggotaData?.data?.data]);

  // Filter products based on search and categories
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category_name === selectedCategory
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products.map((p) => p.category_name).filter(Boolean)
    );
    return Array.from(uniqueCategories);
  }, [products]);

  const addToCart = (product: {
    id: number;
    name: string;
    price: number;
    category_name: string;
  }) => {
    const existingItem = cartItems.find(
      (item) => item.product_id === product.id
    );

    if (existingItem) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          category_name: product.category_name,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product_id !== productId)
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Keyboard shortcut for fullscreen toggle (F11)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "F11") {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [toggleFullscreen]);

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      Swal.fire("Error", "Tidak ada produk yang ditambahkan", "error");
      return;
    }

    try {
      const transactionData = {
        user_id: formData.user_id || undefined,
        guest_name: formData.guest_name || undefined,
        guest_email: formData.guest_email || undefined,
        guest_phone: formData.guest_phone || undefined,
        payment_type: formData.payment_type,
        wallet_id: formData.wallet_id
          ? parseInt(formData.wallet_id)
          : undefined,
        status: formData.status,
        data: [
          {
            shop_id: 1,
            details: cartItems.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
            })),
          },
        ],
        voucher: formData.voucher.length > 0 ? formData.voucher : undefined,
      };

      await createTransaction(transactionData).unwrap();

      // Reset form
      setCartItems([]);
      setFormData({
        payment_type: "manual",
        user_id: "",
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        wallet_id: "",
        status: 0,
        voucher: [],
      });

      Swal.fire("Berhasil", "Transaksi berhasil dibuat", "success");
    } catch (error) {
      Swal.fire("Gagal", "Gagal membuat transaksi", "error");
      console.error(error);
    }
  };

  return (
    <div
      className={`${
        isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"
      } bg-gray-50 transition-all duration-300`}
    >
      {/* Header dengan Quick Stats */}
      <div
        className={`bg-white shadow-sm border-b ${
          isFullscreen ? "sticky top-0 z-10" : ""
        }`}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                POS Kasir
                {isFullscreen && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Fullscreen Mode
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Sistem Point of Sale Koperasi Merah Putih
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-lg font-semibold text-blue-600">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-semibold text-green-600">
                  Rp {getTotalAmount().toLocaleString("id-ID")}
                </p>
              </div>
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                title={`${isFullscreen ? "Minimize" : "Fullscreen"} (F11)`}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    Minimize
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    Fullscreen
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${
          isFullscreen ? "p-4 h-[calc(100vh-80px)] overflow-y-auto" : "p-6"
        }`}
      >
        <div
          className={`grid grid-cols-1 xl:grid-cols-12 gap-6 ${
            isFullscreen ? "min-h-full" : ""
          }`}
        >
          {/* Left Panel - Product Selection (60%) */}
          <div className="xl:col-span-7">
            <Card className="shadow-lg">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    Katalog Produk
                  </h2>
                  <Badge variant="secondary" className="text-sm">
                    {filteredProducts.length} produk tersedia
                  </Badge>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Cari produk atau jasa..."
                      className="pl-10 h-11 text-base"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Semua Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-hidden">
                  {isLoadingProducts ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-500 font-medium">
                        Memuat produk...
                      </p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 font-medium">
                        Tidak ada produk ditemukan
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Coba ubah kata kunci pencarian
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto scroll-smooth pr-2">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
                          onClick={() => addToCart(product)}
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {product.name}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-2 flex-shrink-0"
                                >
                                  {product.category_name || "Produk"}
                                </Badge>
                              </div>
                              <div className="text-2xl font-bold text-green-600 mb-3">
                                Rp{" "}
                                {product.price?.toLocaleString("id-ID") || "0"}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Tambah ke Keranjang
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Cart & Payment (40%) */}
          <div className="xl:col-span-5 space-y-6">
            {/* Cart Section */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    Keranjang Belanja
                  </h2>
                  <Badge variant="secondary" className="text-sm">
                    {cartItems.length} item
                  </Badge>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      Keranjang kosong
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Pilih produk untuk memulai transaksi
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[70vh] overflow-y-auto scroll-smooth">
                    {cartItems.map((item) => (
                      <div
                        key={item.product_id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Rp {item.price.toLocaleString("id-ID")} per item
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  updateQuantity(
                                    item.product_id,
                                    item.quantity - 1
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  updateQuantity(
                                    item.product_id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-green-600">
                              Rp{" "}
                              {(item.price * item.quantity).toLocaleString(
                                "id-ID"
                              )}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 mt-1"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cartItems.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-gray-900">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        Rp {getTotalAmount().toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Form Section */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Pembayaran
                </h2>

                <div className="space-y-4">
                  {/* Payment Type Quick Buttons */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tipe Pembayaran
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={
                          formData.payment_type === "manual"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            payment_type: "manual",
                          }))
                        }
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Manual
                      </Button>
                      <Button
                        variant={
                          formData.payment_type === "automatic"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            payment_type: "automatic",
                          }))
                        }
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Auto
                      </Button>
                      <Button
                        variant={
                          formData.payment_type === "saldo"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            payment_type: "saldo",
                          }))
                        }
                        className="flex items-center gap-2"
                      >
                        <Wallet className="h-4 w-4" />
                        Saldo
                      </Button>
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Status Transaksi
                    </Label>
                    <Select
                      value={formData.status.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            PENDING
                          </div>
                        </SelectItem>
                        <SelectItem value="1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            CAPTURED
                          </div>
                        </SelectItem>
                        <SelectItem value="2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            SETTLEMENT
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Member Selection (if saldo) */}
                  {formData.payment_type === "saldo" && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Pilih Anggota
                      </Label>
                      <Select
                        value={formData.user_id}
                        onValueChange={(value) => {
                          const selectedAnggota = anggota.find(
                            (anggota) => anggota.user_id.toString() === value
                          );
                          setFormData((prev) => ({
                            ...prev,
                            user_id: value,
                            wallet_id: selectedAnggota?.id?.toString() || "",
                          }));
                        }}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Pilih anggota" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(anggota) &&
                            anggota.map((anggota) => (
                              <SelectItem
                                key={anggota.id}
                                value={anggota.user_id.toString()}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {anggota.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {anggota.reference} • Saldo: Rp{" "}
                                    {anggota.balance?.toLocaleString("id-ID") ||
                                      "0"}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Guest Information */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Nama Guest
                      </Label>
                      <Input
                        value={formData.guest_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            guest_name: e.target.value,
                          }))
                        }
                        placeholder="Nama guest (opsional)"
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Email Guest
                      </Label>
                      <Input
                        type="email"
                        value={formData.guest_email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            guest_email: e.target.value,
                          }))
                        }
                        placeholder="Email guest (opsional)"
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Telepon Guest
                      </Label>
                      <Input
                        value={formData.guest_phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            guest_phone: e.target.value,
                          }))
                        }
                        placeholder="Telepon guest (opsional)"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Voucher */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Voucher (Opsional)
                    </Label>
                    <Input
                      placeholder="ID voucher (pisahkan dengan koma)"
                      value={formData.voucher.join(", ")}
                      onChange={(e) => {
                        const voucherIds = e.target.value
                          .split(",")
                          .map((id) => parseInt(id.trim()))
                          .filter((id) => !isNaN(id));
                        setFormData((prev) => ({
                          ...prev,
                          voucher: voucherIds,
                        }));
                      }}
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Contoh: 1, 2, 3 (untuk multiple voucher)
                    </p>
                  </div>

                  {/* Order Button */}
                  {cartItems.length > 0 && (
                    <Button
                      onClick={handleOrder}
                      disabled={isCreating}
                      className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
                    >
                      {isCreating ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Memproses...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Proses Transaksi
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
