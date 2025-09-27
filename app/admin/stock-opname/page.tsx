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
  useGetStockOpnameListQuery,
  useCreateStockOpnameMutation,
  useUpdateStockOpnameMutation,
  useDeleteStockOpnameMutation,
} from "@/services/admin/stock-opname.service";
import { StockOpname, CreateStockOpnameRequest } from "@/types/admin/stock-opname";
import { Badge } from "@/components/ui/badge";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import { Edit, Trash2, Package } from "lucide-react";

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState("");

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

  const { data, isLoading, refetch } = useGetStockOpnameListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const stockOpnameList = useMemo(() => data?.data || [], [data]);
  
  // Filter list by search query
  const filteredList = useMemo(() => {
    if (!query.trim()) return stockOpnameList;
    
    const q = query.toLowerCase();
    return stockOpnameList.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(q) ||
        item.shop?.name?.toLowerCase().includes(q) ||
        item.product?.name?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
    );
  }, [stockOpnameList, query]);

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
        onCategoryChange={() => {}}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2 whitespace-nowrap">Aksi</th>
                <th className="px-4 py-2 whitespace-nowrap">ID</th>
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
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.user?.name || `User ID: ${item.user_id}`}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.shop?.name || `Shop ID: ${item.shop_id}`}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.product?.name || `Product ID: ${item.product_id}`}
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
        <DialogContent className="max-w-2xl">
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
                  User ID
                </Label>
                <Input
                  id="user_id"
                  type="number"
                  placeholder="Masukkan User ID"
                  value={form.user_id || ""}
                  onChange={(e) => setForm({ ...form, user_id: Number(e.target.value) })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop_id" className="text-sm font-medium text-gray-700">
                  Shop ID
                </Label>
                <Input
                  id="shop_id"
                  type="number"
                  placeholder="Masukkan Shop ID"
                  value={form.shop_id || ""}
                  onChange={(e) => setForm({ ...form, shop_id: Number(e.target.value) })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_id" className="text-sm font-medium text-gray-700">
                  Product ID
                </Label>
                <Input
                  id="product_id"
                  type="number"
                  placeholder="Masukkan Product ID"
                  value={form.product_id || ""}
                  onChange={(e) => setForm({ ...form, product_id: Number(e.target.value) })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Tanggal
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date || ""}
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
                  placeholder="Masukkan stok awal"
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
                  placeholder="Masukkan stok terhitung"
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
                  placeholder="Selisih akan dihitung otomatis"
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
                placeholder="Masukkan catatan (opsional)"
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
    </div>
  );
}
