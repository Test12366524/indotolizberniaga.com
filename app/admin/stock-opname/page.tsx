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
import { Label } from "@/components/ui/label";
import {
  useGetStockOpnameListQuery,
  useCreateStockOpnameMutation,
  useUpdateStockOpnameMutation,
  useDeleteStockOpnameMutation,
} from "@/services/admin/stock-opname.service";
import { useGetMeQuery } from "@/services/admin/shop.service";
import { useGetProductListQuery } from "@/services/admin/product.service";
import { useGetTokoListQuery } from "@/services/admin/toko.service";
import {
  StockOpname,
  CreateStockOpnameRequest,
} from "@/types/admin/stock-opname";
import { Badge } from "@/components/ui/badge";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import { Package } from "lucide-react";
import ActionsGroup from "@/components/admin-components/actions-group";
import { Seller, useGetSellerListQuery } from "@/services/admin/seller.service";
import StockOpnameFormModal from "@/components/form-modal/admin/stock-opname-form";
import { displayDate } from "@/lib/format-utils";

type ShopFilter = "all" | string;

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
  const [selectedShop, setSelectedShop] = useState<ShopFilter>("all");
  const [sellerId, setSellerId] = useState<number | null>(null);

  const { data: sellerResp, isLoading: isSellerLoading } =
    useGetSellerListQuery({
      page: 1,
      paginate: 200,
    });
  const sellers: Seller[] = useMemo(() => sellerResp?.data ?? [], [sellerResp]);

  const selectedSellerShopId = useMemo(() => {
    const s = sellers.find((x) => x.id === sellerId);
    return s?.shop?.id ?? null;
  }, [sellers, sellerId]);

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
    shopsList.forEach((shop) => {
      categories.push({ value: shop.id.toString(), label: shop.name });
    });
    return categories;
  }, [shopsList]);

  // helper untuk memastikan properti ada & bertipe number
  const hasUserId = (o: unknown): o is { user_id: number } =>
    typeof o === "object" &&
    o !== null &&
    "user_id" in o &&
    typeof (o as Record<"user_id", unknown>).user_id === "number";

  const hasShopId = (o: unknown): o is { shop_id: number } =>
    typeof o === "object" &&
    o !== null &&
    "shop_id" in o &&
    typeof (o as Record<"shop_id", unknown>).shop_id === "number";

  // Filter list by search query and shop
  const filteredList = useMemo(() => {
    let filtered = stockOpnameList;

    // Filter by shop (yang sudah ada)
    if (selectedShop !== "all") {
      const shopId = Number(selectedShop);
      filtered = filtered.filter((item) => item.shop_id === shopId);
    }

    // ✅ Filter by seller (cocokkan user_id atau shop_id milik seller tsb)
    if (sellerId !== null) {
      filtered = filtered.filter((item) => {
        const matchByUser = hasUserId(item) && item.user_id === sellerId;
        const matchByShop =
          selectedSellerShopId !== null &&
          hasShopId(item) &&
          item.shop_id === selectedSellerShopId;
        return matchByUser || matchByShop;
      });
    }

    // Filter by search (yang sudah ada)
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter((item) => {
        const userName =
          item.user?.name || (meData?.id === item.user_id ? meData.name : "");
        const shopName =
          item.shop?.name ||
          (meData?.shop?.id === item.shop_id ? meData.shop.name : "");
        const productName =
          item.product?.name ||
          productsList.find((p) => p.id === item.product_id)?.name ||
          "";

        return (
          userName.toLowerCase().includes(q) ||
          shopName.toLowerCase().includes(q) ||
          productName.toLowerCase().includes(q) ||
          (item.notes ?? "").toLowerCase().includes(q)
        );
      });
    }

    return filtered;
  }, [
    stockOpnameList,
    selectedShop,
    sellerId,
    selectedSellerShopId,
    query,
    meData,
    productsList,
  ]);

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
   const fixedDifference =
     (item.initial_stock || 0) - (item.counted_stock || 0);
   setForm({
     id: item.id,
     user_id: item.user_id,
     shop_id: item.shop_id,
     product_id: item.product_id,
     initial_stock: item.initial_stock,
     counted_stock: item.counted_stock,
     difference: fixedDifference, // pastikan konsisten
     date: item.date,
     notes: item.notes || "",
     created_at: item.created_at || "",
     updated_at: item.updated_at || "",
   });
   setIsEditMode(true);
   setEditingId(item.id);
   setIsModalOpen(true);

   setSellerId(item.user_id ?? null);
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
      Swal.fire(
        "Error",
        "User ID, Shop ID, Product ID, dan Tanggal harus diisi",
        "error"
      );
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
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return (
    <div className="p-6 space-y-6">
      <ProdukToolbar
        openModal={openModal}
        onSearchChange={setQuery}
        initialStatus={selectedShop}
        onStatusChange={(val) => setSelectedShop(val as ShopFilter)}
        enableSellerFilter
        isSuperAdmin={true}
        sellers={sellers}
        selectedSellerId={sellerId}
        onSellerChange={setSellerId}
        isSellerLoading={isSellerLoading}
        onResetAllFilters={() => {
          setQuery("");
          setSelectedShop("all");
          setSellerId(null);
          setCurrentPage(1);
          refetch();
        }}
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
                      <ActionsGroup
                        handleDetail={() => handleOpenDetailModal(item)}
                        handleEdit={() => handleOpenEditModal(item)}
                        handleDelete={() => handleDelete(item)}
                      />
                    </td>
                    {/* <td className="px-4 py-2 whitespace-nowrap">
                      {item.id}
                    </td> */}
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.user?.name ||
                        (meData?.id === item.user_id
                          ? meData.name
                          : `User ID: ${item.user_id}`)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.shop?.name ||
                        (meData?.shop?.id === item.shop_id
                          ? meData.shop.name
                          : `Shop ID: ${item.shop_id}`)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.product?.name ||
                        productsList.find((p) => p.id === item.product_id)
                          ?.name ||
                        `Product ID: ${item.product_id}`}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatNumber(item.initial_stock)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatNumber(item.counted_stock)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Badge
                        variant={
                          item.difference >= 0 ? "success" : "destructive"
                        }
                      >
                        {item.difference >= 0 ? "+" : ""}
                        {formatNumber(item.difference)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {displayDate(item.date)}
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
      <StockOpnameFormModal
        open={isModalOpen}
        onOpenChange={(v) => {
          setIsModalOpen(v);
          if (!v) resetForm();
        }}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        form={form}
        setForm={setForm}
        meData={meData}
        sellers={sellers}
        productsList={productsList}
        selectedSellerId={sellerId}
        setSelectedSellerId={setSellerId}
        selectedSellerShopId={selectedSellerShopId}
        onSubmit={handleSubmit}
      />

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
                    <Label className="text-sm font-medium text-gray-500">
                      ID
                    </Label>
                    <p className="text-lg font-semibold">{selectedItem.id}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      User
                    </Label>
                    <p className="text-lg">
                      {selectedItem.user?.name ||
                        (meData?.id === selectedItem.user_id
                          ? meData.name
                          : `User ID: ${selectedItem.user_id}`)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Shop
                    </Label>
                    <p className="text-lg">
                      {selectedItem.shop?.name ||
                        (meData?.shop?.id === selectedItem.shop_id
                          ? meData.shop.name
                          : `Shop ID: ${selectedItem.shop_id}`)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Product
                    </Label>
                    <p className="text-lg">
                      {selectedItem.product?.name ||
                        productsList.find(
                          (p) => p.id === selectedItem.product_id
                        )?.name ||
                        `Product ID: ${selectedItem.product_id}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Tanggal
                    </Label>
                    <p className="text-lg">
                      {formatDateTime(selectedItem.date)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Stok Awal
                    </Label>
                    <p className="text-lg font-semibold">
                      {formatNumber(selectedItem.initial_stock)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Stok Terhitung
                    </Label>
                    <p className="text-lg font-semibold">
                      {formatNumber(selectedItem.counted_stock)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Selisih
                    </Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          selectedItem.difference >= 0
                            ? "success"
                            : "destructive"
                        }
                        className="text-sm px-3 py-1"
                      >
                        {selectedItem.difference >= 0 ? "+" : ""}
                        {formatNumber(selectedItem.difference)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {selectedItem.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Catatan
                  </Label>
                  <p className="text-lg mt-1 p-3 bg-gray-50 rounded-md">
                    {selectedItem.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Dibuat
                  </Label>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(selectedItem.created_at || "")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Diperbarui
                  </Label>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(selectedItem.updated_at || "")}
                  </p>
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