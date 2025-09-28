"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetStockOpnameListQuery,
  useCreateStockOpnameMutation,
  useUpdateStockOpnameMutation,
  useDeleteStockOpnameMutation,
} from "@/services/admin/stock-opname.service";
import { useGetMeQuery } from "@/services/admin/shop.service";
import { useGetProductListQuery } from "@/services/admin/product.service";
import { useGetTokoListQuery } from "@/services/admin/toko.service";
import { StockOpname, CreateStockOpnameRequest } from "@/types/admin/stock-opname";
import { Badge } from "@/components/ui/badge";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import { Edit, Trash2, Package, Eye } from "lucide-react";

export default function StockOpnamePage() {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<StockOpname>({
    id: 0,
    user_id: 0,
    shop_id: 0,
    product_id: 0,
    initial_stock: 0,
    counted_stock: 0,
    difference: 0,
    date: "",
    notes: "",
    created_at: "",
    updated_at: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<StockOpname | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState("all");

  // Helper function to format datetime to Indonesian format
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    } catch (error) {
      return String(error);
    }
  };

  // Helper function to convert date to YYYY-MM-DD format for input
  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const { data, isLoading, refetch } = useGetStockOpnameListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  // Get current user profile (includes shop info)
  const { data: meData } = useGetMeQuery();

  // Get products for dropdown
  const { data: productsData } = useGetProductListQuery({
    page: 1,
    paginate: 100,
  });

  // Get shops for category filter
  const { data: shopsData } = useGetTokoListQuery({
    page: 1,
    paginate: 100,
  });

  const stockOpnameList = useMemo(() => data?.data || [], [data]);
  const productsList = useMemo(() => productsData?.data || [], [productsData]);
  const shopsList = useMemo(() => shopsData?.data || [], [shopsData]);
  
  // Create shop categories for filter
  const shopCategories = useMemo(() => {
    const categories = [{ value: "all", label: "Semua Toko" }];
    shopsList.forEach(shop => {
      categories.push({ value: shop.id.toString(), label: shop.name });
    });
    return categories;
  }, [shopsList]);
  
  // Filter list by search query and shop
  const filteredList = useMemo(() => {
    let filtered = stockOpnameList;
    
    // Filter by shop if not "all"
    if (selectedShop !== "all") {
      const shopId = Number(selectedShop);
      filtered = filtered.filter(item => item.shop_id === shopId);
    }
    
    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (item) => {
          const userName = item.user?.name || (meData?.id === item.user_id ? meData.name : '');
          const shopName = item.shop?.name || (meData?.shop?.id === item.shop_id ? meData.shop.name : '');
          const productName = item.product?.name || productsList.find(p => p.id === item.product_id)?.name || '';
          
          return (
            userName.toLowerCase().includes(q) ||
            shopName.toLowerCase().includes(q) ||
            productName.toLowerCase().includes(q) ||
            item.notes?.toLowerCase().includes(q)
          );
        }
      );
    }
    
    return filtered;
  }, [stockOpnameList, query, selectedShop, meData, productsList]);

  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [createStockOpname] = useCreateStockOpnameMutation();
  const [updateStockOpname] = useUpdateStockOpnameMutation();
  const [deleteStockOpname] = useDeleteStockOpnameMutation();

  const resetForm = () => {
    setForm({
      id: 0,
      user_id: 0,
      shop_id: 0,
      product_id: 0,
      initial_stock: 0,
      counted_stock: 0,
      difference: 0,
      date: "",
      notes: "",
      created_at: "",
      updated_at: "",
    });
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openModal = handleOpenCreateModal;

  const handleOpenDetailModal = (item: StockOpname) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleOpenEditModal = (item: StockOpname) => {
    setForm({
      id: item.id,
      user_id: item.user_id,
      shop_id: item.shop_id,
      product_id: item.product_id,
      initial_stock: item.initial_stock,
      counted_stock: item.counted_stock,
      difference: item.difference,
      date: item.date,
      notes: item.notes || "",
      created_at: item.created_at || "",
      updated_at: item.updated_at || "",
    });
    setIsEditMode(true);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmit = async () => {
    if (!form.user_id || !form.shop_id || !form.product_id || !form.date) {
      Swal.fire("Error", "User ID, Shop ID, Product ID, dan Tanggal harus diisi", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editingId) {
        await updateStockOpname({ ...form }).unwrap();
        Swal.fire("Berhasil", "Stock Opname berhasil diperbarui", "success");
      } else {
        await createStockOpname(form as CreateStockOpnameRequest).unwrap();
        Swal.fire("Berhasil", "Stock Opname berhasil ditambahkan", "success");
      }

      await refetch();
      handleCloseModal();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String(error.data.message)
          : "Terjadi kesalahan";
      Swal.fire("Gagal", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: StockOpname) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Stock Opname?",
      text: `Stock Opname ID: ${item.id}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteStockOpname(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Stock Opname berhasil dihapus", "success");
      } catch (error: unknown) {
        const errorMessage =
          error &&
          typeof error === "object" &&
          "data" in error &&
          error.data &&
          typeof error.data === "object" &&
          "message" in error.data
            ? String(error.data.message)
            : "Gagal menghapus Stock Opname";
        Swal.fire("Gagal", errorMessage, "error");
      }
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="p-6 space-y-6">
      <ProdukToolbar
        openModal={openModal}
        onSearchChange={setQuery}
        onCategoryChange={setSelectedShop}
        categories={shopCategories}
        initialCategory="all"
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2 whitespace-nowrap">Aksi</th>
                {/* <th className="px-4 py-2 whitespace-nowrap">ID</th> */}
                <th className="px-4 py-2 whitespace-nowrap">User</th>
                <th className="px-4 py-2 whitespace-nowrap">Shop</th>
                <th className="px-4 py-2 whitespace-nowrap">Product</th>
                <th className="px-4 py-2 whitespace-nowrap">Stok Awal</th>
                <th className="px-4 py-2 whitespace-nowrap">Stok Terhitung</th>
                <th className="px-4 py-2 whitespace-nowrap">Selisih</th>
                <th className="px-4 py-2 whitespace-nowrap">Tanggal</th>
                <th className="px-4 py-2 whitespace-nowrap">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    Tidak ada data stock opname
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDetailModal(item)}
                          className="flex items-center gap-1 h-8 px-3"
                        >
                          <Eye className="h-3 w-3" />
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(item)}
                          className="flex items-center gap-1 h-8 px-3"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item)}
                          className="h-8 px-3"
                        >
                          <Trash2 className="h-3 w-3" />
                          Hapus
                        </Button>
                      </div>
                    </td>
                    {/* <td className="px-4 py-2 whitespace-nowrap">
                      {item.id}
                    </td> */}
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.user?.name || (meData?.id === item.user_id ? meData.name : `User ID: ${item.user_id}`)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.shop?.name || (meData?.shop?.id === item.shop_id ? meData.shop.name : `Shop ID: ${item.shop_id}`)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.product?.name || productsList.find(p => p.id === item.product_id)?.name || `Product ID: ${item.product_id}`}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatNumber(item.initial_stock)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatNumber(item.counted_stock)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Badge 
                        variant={item.difference >= 0 ? "success" : "destructive"}
                      >
                        {item.difference >= 0 ? "+" : ""}{formatNumber(item.difference)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDateTime(item.date)}
                    </td>
                    <td className="px-4 py-2 max-w-xs truncate">
                      {item.notes || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        <div className="p-4 flex items-center justify-between bg-muted">
          <div className="text-sm">
            Halaman <strong>{currentPage}</strong> dari{" "}
            <strong>{lastPage}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= lastPage}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md md:min-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              {isEditMode ? "Edit Stock Opname" : "Tambah Stock Opname"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_id" className="text-sm font-medium text-gray-700">
                  User
                </Label>
                <Select
                  value={form.user_id ? form.user_id.toString() : undefined}
                  onValueChange={(value) => setForm({ ...form, user_id: Number(value) })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="👤 Pilih User..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {!meData?.shop ? (
                      <SelectItem value="no-shop" disabled>
                        <span className="text-gray-500">User harus memiliki shop untuk membuat stock opname</span>
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="placeholder-user" disabled>
                          <span className="text-gray-400 italic">👤 Pilih User...</span>
                        </SelectItem>
                        <SelectItem value={meData.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{meData.name}</span>
                            <span className="text-sm text-gray-500">({meData.email})</span>
                          </div>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop_id" className="text-sm font-medium text-gray-700">
                  Shop
                </Label>
                <Select
                  value={form.shop_id ? form.shop_id.toString() : undefined}
                  onValueChange={(value) => setForm({ ...form, shop_id: Number(value) })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="🏪 Pilih Shop..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {!meData?.shop ? (
                      <SelectItem value="no-shop" disabled>
                        <span className="text-gray-500">Tidak ada shop tersedia</span>
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="placeholder-shop" disabled>
                          <span className="text-gray-400 italic">🏪 Pilih Shop...</span>
                        </SelectItem>
                        <SelectItem value={meData.shop.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{meData.shop.name}</span>
                            <span className="text-sm text-gray-500">({meData.shop.email})</span>
                          </div>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_id" className="text-sm font-medium text-gray-700">
                  Product
                </Label>
                <Select
                  value={form.product_id ? form.product_id.toString() : undefined}
                  onValueChange={(value) => setForm({ ...form, product_id: Number(value) })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="📦 Pilih Product..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {productsList.length === 0 ? (
                      <SelectItem value="no-products" disabled>
                        <span className="text-gray-500">Tidak ada product tersedia</span>
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="placeholder-product" disabled>
                          <span className="text-gray-400 italic">📦 Pilih Product...</span>
                        </SelectItem>
                        {productsList.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-sm text-gray-500">- {product.category_name}</span>
                              <span className="text-xs text-blue-500">({product.merk_name})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Tanggal
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date ? formatDateForInput(form.date) : ""}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initial_stock" className="text-sm font-medium text-gray-700">
                  Stok Awal
                </Label>
                <Input
                  id="initial_stock"
                  type="number"
                  placeholder="🔢 Masukkan stok awal..."
                  value={form.initial_stock || ""}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setForm({ 
                      ...form, 
                      initial_stock: value,
                      difference: (form.counted_stock || 0) - value
                    });
                  }}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="counted_stock" className="text-sm font-medium text-gray-700">
                  Stok Terhitung
                </Label>
                <Input
                  id="counted_stock"
                  type="number"
                  placeholder="📊 Masukkan stok terhitung..."
                  value={form.counted_stock || ""}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setForm({ 
                      ...form, 
                      counted_stock: value,
                      difference: value - (form.initial_stock || 0)
                    });
                  }}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difference" className="text-sm font-medium text-gray-700">
                  Selisih
                </Label>
                <Input
                  id="difference"
                  type="number"
                  value={form.difference || ""}
                  disabled={true}
                  placeholder="⚡ Selisih akan dihitung otomatis..."
                  className="h-11 bg-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Catatan
              </Label>
              <Textarea
                id="notes"
                placeholder="📝 Masukkan catatan (opsional)..."
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="h-10 px-6"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !form.user_id || !form.shop_id || !form.product_id || !form.date}
              className="h-10 px-6"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? "Memperbarui..." : "Menyimpan..."}
                </div>
              ) : isEditMode ? (
                "Perbarui"
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              Detail Stock Opname
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ID</Label>
                    <p className="text-lg font-semibold">{selectedItem.id}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">User</Label>
                    <p className="text-lg">
                      {selectedItem.user?.name || (meData?.id === selectedItem.user_id ? meData.name : `User ID: ${selectedItem.user_id}`)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Shop</Label>
                    <p className="text-lg">
                      {selectedItem.shop?.name || (meData?.shop?.id === selectedItem.shop_id ? meData.shop.name : `Shop ID: ${selectedItem.shop_id}`)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Product</Label>
                    <p className="text-lg">
                      {selectedItem.product?.name || productsList.find(p => p.id === selectedItem.product_id)?.name || `Product ID: ${selectedItem.product_id}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tanggal</Label>
                    <p className="text-lg">{formatDateTime(selectedItem.date)}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Stok Awal</Label>
                    <p className="text-lg font-semibold">{formatNumber(selectedItem.initial_stock)}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Stok Terhitung</Label>
                    <p className="text-lg font-semibold">{formatNumber(selectedItem.counted_stock)}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Selisih</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={selectedItem.difference >= 0 ? "success" : "destructive"}
                        className="text-sm px-3 py-1"
                      >
                        {selectedItem.difference >= 0 ? "+" : ""}{formatNumber(selectedItem.difference)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {selectedItem.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Catatan</Label>
                  <p className="text-lg mt-1 p-3 bg-gray-50 rounded-md">{selectedItem.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dibuat</Label>
                  <p className="text-sm text-gray-600">{formatDateTime(selectedItem.created_at || "")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Diperbarui</Label>
                  <p className="text-sm text-gray-600">{formatDateTime(selectedItem.updated_at || "")}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCloseDetailModal}
              className="h-10 px-6"
            >
              Tutup
            </Button>
            <Button
              onClick={() => {
                handleCloseDetailModal();
                handleOpenEditModal(selectedItem!);
              }}
              className="h-10 px-6"
            >
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
