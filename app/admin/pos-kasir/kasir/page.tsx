"use client";

import { useState, useMemo } from "react";
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
import {
  useGetProductListQuery,
} from "@/services/product.service";
import {
  useGetPosAnggotaQuery,
} from "@/services/pos-kasir.service";
import { useCreatePosTransactionMutation } from "@/services/pos-kasir.service";
import { Search, Plus, Trash2, ShoppingCart } from "lucide-react";

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  type: string;
  quantity: number;
}

export default function KasirPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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
  const { data: productsData, isLoading: isLoadingProducts } = useGetProductListQuery({
    page: 1,
    paginate: 100,
    product_merk_id: null,
  });

  const { data: anggotaData } = useGetPosAnggotaQuery({
    page: 1,
    paginate: 100,
  });

  const [createTransaction, { isLoading: isCreating }] = useCreatePosTransactionMutation();

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
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.category?.name === selectedCategory
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category?.name).filter(Boolean));
    return Array.from(uniqueCategories);
  }, [products]);

  const addToCart = (product: { id: number; name: string; price: number; type: string }) => {
    const existingItem = cartItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCartItems(prev => 
        prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems(prev => [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        type: product.type,
        quantity: 1,
      }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.product_id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

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
        wallet_id: formData.wallet_id ? parseInt(formData.wallet_id) : undefined,
        status: formData.status,
        data: [{
          shop_id: 1,
          details: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }],
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kasir</h1>
          <p className="text-sm text-gray-500">
            Buat transaksi baru untuk penjualan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Product Selection */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Pilih Produk/Jasa</h2>
            
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search produk atau jasa..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">Kategori Produk</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
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

            {/* Product List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoadingProducts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Memuat produk...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada produk ditemukan
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium text-green-600">
                            Rp {product.price?.toLocaleString('id-ID') || '0'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {product.type || 'Produk'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToCart(product)}
                        className="ml-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Transaction Details */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Detail Transaksi</h2>
            
            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_type">Tipe Pembayaran</Label>
                  <Select
                    value={formData.payment_type}
                    onValueChange={(value: "automatic" | "manual" | "saldo") =>
                      setFormData(prev => ({ ...prev, payment_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="saldo">Saldo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status.toString()}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, status: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">PENDING</SelectItem>
                      <SelectItem value="1">CAPTURED</SelectItem>
                      <SelectItem value="2">SETTLEMENT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.payment_type === "saldo" && (
                <div>
                  <Label htmlFor="user_id">Anggota</Label>
                  <Select
                    value={formData.user_id}
                    onValueChange={(value) => {
                      const selectedAnggota = anggota.find((anggota) => anggota.user_id.toString() === value);
                      setFormData(prev => ({ 
                        ...prev, 
                        user_id: value,
                        wallet_id: selectedAnggota?.id?.toString() || ""
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih anggota" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(anggota) && anggota.map((anggota) => (
                        <SelectItem key={anggota.id} value={anggota.user_id.toString()}>
                          {anggota.name} - {anggota.reference} (Saldo: Rp {anggota.balance?.toLocaleString('id-ID') || '0'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guest_name">Nama Guest</Label>
                  <Input
                    id="guest_name"
                    value={formData.guest_name}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, guest_name: e.target.value }))
                    }
                    placeholder="Nama guest (opsional)"
                  />
                </div>

                <div>
                  <Label htmlFor="guest_email">Email Guest</Label>
                  <Input
                    id="guest_email"
                    type="email"
                    value={formData.guest_email}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, guest_email: e.target.value }))
                    }
                    placeholder="Email guest (opsional)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guest_phone">Telepon Guest</Label>
                <Input
                  id="guest_phone"
                  value={formData.guest_phone}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, guest_phone: e.target.value }))
                  }
                  placeholder="Telepon guest (opsional)"
                />
              </div>

              <div>
                <Label htmlFor="voucher">Voucher (Opsional)</Label>
                <Input
                  id="voucher"
                  placeholder="Masukkan ID voucher (pisahkan dengan koma untuk multiple voucher)"
                  value={formData.voucher.join(", ")}
                  onChange={(e) => {
                    const voucherIds = e.target.value
                      .split(",")
                      .map(id => parseInt(id.trim()))
                      .filter(id => !isNaN(id));
                    setFormData(prev => ({ ...prev, voucher: voucherIds }));
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Contoh: 1, 2, 3 (untuk multiple voucher)
                </p>
              </div>
            </div>

            {/* Item Detail Section */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Item Detail</h3>
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  Tidak ada produk yang ditambahkan.
                </div>
              ) : (
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          Rp {item.price.toLocaleString('id-ID')} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total and Order Button */}
            {cartItems.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    Rp {getTotalAmount().toLocaleString('id-ID')}
                  </span>
                </div>
                <Button
                  onClick={handleOrder}
                  disabled={isCreating}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isCreating ? "Memproses..." : "Order"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
