"use client";

import React, { useMemo, useState } from "react";
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
  useGetPurchaseOrderListQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} from "@/services/admin/pengadaan.service";
import { PurchaseOrder, CreatePurchaseOrderRequest, PurchaseOrderDetail } from "@/types/admin/pengadaan";
import { Badge } from "@/components/ui/badge";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import { Edit, Trash2, ShoppingCart, Plus, Minus } from "lucide-react";

export default function PengadaanPage() {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<PurchaseOrder>({
    id: 0,
    user_id: 0,
    shop_id: 0,
    supplier: "",
    date: "",
    notes: "",
    total: 0,
    paid: 0,
    due: 0,
    status: true,
    created_at: "",
    updated_at: "",
    details: [],
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

  const { data, isLoading, refetch } = useGetPurchaseOrderListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const purchaseOrderList = useMemo(() => data?.data || [], [data]);
  
  // Filter list by search query
  const filteredList = useMemo(() => {
    if (!query.trim()) return purchaseOrderList;
    
    const q = query.toLowerCase();
    return purchaseOrderList.filter(
      (item) =>
        item.supplier?.toLowerCase().includes(q) ||
        item.user?.name?.toLowerCase().includes(q) ||
        item.shop?.name?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
    );
  }, [purchaseOrderList, query]);

  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [createPurchaseOrder] = useCreatePurchaseOrderMutation();
  const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation();
  const [deletePurchaseOrder] = useDeletePurchaseOrderMutation();

  const resetForm = () => {
    setForm({
      id: 0,
      user_id: 0,
      shop_id: 0,
      supplier: "",
      date: "",
      notes: "",
      total: 0,
      paid: 0,
      due: 0,
      status: true,
      created_at: "",
      updated_at: "",
      details: [],
    });
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openModal = handleOpenCreateModal;

  const handleOpenEditModal = (item: PurchaseOrder) => {
    setForm({
      id: item.id,
      user_id: item.user_id,
      shop_id: item.shop_id,
      supplier: item.supplier,
      date: item.date,
      notes: item.notes || "",
      total: item.total,
      paid: item.paid,
      due: item.due,
      status: item.status,
      created_at: item.created_at || "",
      updated_at: item.updated_at || "",
      details: item.details || [],
    });
    setIsEditMode(true);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const addDetail = () => {
    const newDetail: PurchaseOrderDetail = {
      product_id: 0,
      quantity: 0,
      price: 0,
      discount: 0,
      tax: 0,
      total: 0,
    };
    setForm({ ...form, details: [...form.details, newDetail] });
  };

  const removeDetail = (index: number) => {
    const newDetails = form.details.filter((_, i) => i !== index);
    setForm({ ...form, details: newDetails });
  };

  const updateDetail = (index: number, field: keyof PurchaseOrderDetail, value: number) => {
    const newDetails = [...form.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    
    // Calculate tax (11% of subtotal)
    const subtotal = (newDetails[index].quantity * newDetails[index].price) - newDetails[index].discount;
    newDetails[index].tax = Math.round(subtotal * 0.11);
    
    // Calculate total
    newDetails[index].total = subtotal + newDetails[index].tax;
    
    setForm({ ...form, details: newDetails });
  };

  // Auto-calculate totals when details change
  React.useEffect(() => {
    const total = form.details.reduce((sum, detail) => sum + detail.total, 0);
    const due = total - form.paid;
    setForm(prev => ({ ...prev, total, due }));
  }, [form.details, form.paid]);

  const handleSubmit = async () => {
    if (!form.user_id || !form.shop_id || !form.supplier || !form.date) {
      Swal.fire("Error", "User ID, Shop ID, Supplier, dan Tanggal harus diisi", "error");
      return;
    }

    if (form.details.length === 0) {
      Swal.fire("Error", "Minimal 1 detail produk harus ditambahkan", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editingId) {
        await updatePurchaseOrder({ ...form }).unwrap();
        Swal.fire("Berhasil", "Purchase Order berhasil diperbarui", "success");
      } else {
        await createPurchaseOrder(form as CreatePurchaseOrderRequest).unwrap();
        Swal.fire("Berhasil", "Purchase Order berhasil ditambahkan", "success");
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

  const handleDelete = async (item: PurchaseOrder) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Purchase Order?",
      text: `PO ID: ${item.id} - ${item.supplier}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });

    if (confirm.isConfirmed) {
      try {
        await deletePurchaseOrder(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Purchase Order berhasil dihapus", "success");
      } catch (error: unknown) {
        const errorMessage =
          error &&
          typeof error === "object" &&
          "data" in error &&
          error.data &&
          typeof error.data === "object" &&
          "message" in error.data
            ? String(error.data.message)
            : "Gagal menghapus Purchase Order";
        Swal.fire("Gagal", errorMessage, "error");
      }
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
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
                <th className="px-4 py-2 whitespace-nowrap">Supplier</th>
                <th className="px-4 py-2 whitespace-nowrap">User</th>
                <th className="px-4 py-2 whitespace-nowrap">Total</th>
                <th className="px-4 py-2 whitespace-nowrap">Paid</th>
                <th className="px-4 py-2 whitespace-nowrap">Due</th>
                <th className="px-4 py-2 whitespace-nowrap">Tanggal</th>
                <th className="px-4 py-2 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-4">
                    Tidak ada data purchase order
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
                      {item.supplier}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.user?.name || `User ID: ${item.user_id}`}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-green-600">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-blue-600">
                      {formatCurrency(item.paid)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-orange-600">
                      {formatCurrency(item.due)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDateTime(item.date)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Badge variant={item.status ? "success" : "destructive"}>
                        {item.status ? "Lunas" : "Belum Lunas"}
                      </Badge>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              {isEditMode ? "Edit Purchase Order" : "Tambah Purchase Order"}
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
                <Label htmlFor="supplier" className="text-sm font-medium text-gray-700">
                  Supplier
                </Label>
                <Input
                  id="supplier"
                  placeholder="Masukkan nama supplier"
                  value={form.supplier || ""}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
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
                <Label htmlFor="paid" className="text-sm font-medium text-gray-700">
                  Jumlah Dibayar
                </Label>
                <Input
                  id="paid"
                  type="number"
                  placeholder="Masukkan jumlah yang sudah dibayar"
                  value={form.paid || ""}
                  onChange={(e) => {
                    const paid = Number(e.target.value);
                    setForm({ ...form, paid, due: form.total - paid });
                  }}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <select
                  id="status"
                  value={form.status ? "1" : "0"}
                  onChange={(e) => setForm({ ...form, status: e.target.value === "1" })}
                  className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">Lunas</option>
                  <option value="0">Belum Lunas</option>
                </select>
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

            {/* Details Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Detail Produk
                </Label>
                <Button
                  type="button"
                  onClick={addDetail}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Produk
                </Button>
              </div>

              {form.details.map((detail, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Produk #{index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeDetail(index)}
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <Minus className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Product ID
                      </Label>
                      <Input
                        type="number"
                        placeholder="Product ID"
                        value={detail.product_id || ""}
                        onChange={(e) => updateDetail(index, 'product_id', Number(e.target.value))}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Quantity
                      </Label>
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={detail.quantity || ""}
                        onChange={(e) => updateDetail(index, 'quantity', Number(e.target.value))}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Price
                      </Label>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={detail.price || ""}
                        onChange={(e) => updateDetail(index, 'price', Number(e.target.value))}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Discount
                      </Label>
                      <Input
                        type="number"
                        placeholder="Discount"
                        value={detail.discount || ""}
                        onChange={(e) => updateDetail(index, 'discount', Number(e.target.value))}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Tax (11%)
                      </Label>
                      <Input
                        type="number"
                        value={detail.tax || ""}
                        disabled
                        className="h-10 bg-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Total
                      </Label>
                      <Input
                        type="number"
                        value={detail.total || ""}
                        disabled
                        className="h-10 bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {form.details.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Purchase Order:</span>
                    <span className="text-green-600">{formatCurrency(form.total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Due Amount:</span>
                    <span className="text-orange-600">{formatCurrency(form.due)}</span>
                  </div>
                </div>
              )}
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
              disabled={isSubmitting || !form.user_id || !form.shop_id || !form.supplier || !form.date || form.details.length === 0}
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
