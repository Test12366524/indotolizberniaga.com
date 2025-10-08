"use client";

import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { ProdukToolbar } from "@/components/ui/produk-toolbar";
import ActionsGroup from "@/components/admin-components/actions-group";

import {
  useGetPurchaseOrderListQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useGetPurchaseOrderByIdQuery,
} from "@/services/admin/pengadaan.service";
import { useGetMeQuery } from "@/services/admin/shop.service";
import { useGetProductListQuery } from "@/services/admin/product.service";
import { useGetSupplierListQuery } from "@/services/master/supplier.service";
import type { Supplier } from "@/types/master/supplier";

import type {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
} from "@/types/admin/pengadaan";

import PurchaseOrderForm from "@/components/form-modal/admin/pengadaan-form";
import { displayDate } from "@/lib/format-utils";

export default function PengadaanPage() {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // ====== FILTERS
  const [query, setQuery] = useState("");
  const [supplierFilterId, setSupplierFilterId] = useState<number | null>(null);
  const [supplierFilterSearch, setSupplierFilterSearch] = useState("");

  // ====== MODALS
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<PurchaseOrder | null>(null);

  // ====== QUERIES (list) — gunakan alias agar tidak bentrok
  const {
    data: listResp,
    isLoading,
    refetch,
  } = useGetPurchaseOrderListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const { data: meData } = useGetMeQuery();

  const { data: productsData } = useGetProductListQuery({
    page: 1,
    paginate: 100,
  });

  const { data: supplierListResp, isLoading: isLoadingSupplierFilter } =
    useGetSupplierListQuery({
      page: 1,
      paginate: 50,
      search: supplierFilterSearch || undefined,
    });

  const { data: poByIdRaw, isFetching: isFetchingPoById } =
    useGetPurchaseOrderByIdQuery(editingId as number, {
      skip: !isFormOpen || !editingId,
    });

  const poById: PurchaseOrder | undefined =
    (poByIdRaw as PurchaseOrder | undefined) ??
    ((poByIdRaw as { data?: PurchaseOrder } | undefined)?.data as
      | PurchaseOrder
      | undefined);

  // Data dari by-id (paling baru), fallback ke list bila belum ada.
  const editingItem: PurchaseOrder | null = useMemo(() => {
    if (!isFormOpen) return null;
    if (poById) return poById;
    const fromList =
      listResp?.data?.find((x: PurchaseOrder) => x.id === editingId) ?? null;
    return fromList;
  }, [isFormOpen, poById, listResp, editingId]);

  const supplierList: Supplier[] = useMemo(() => {
    return [
      { id: 0, name: "Semua Supplier" } as Supplier,
      ...(supplierListResp?.data ?? []),
    ];
  }, [supplierListResp]);

  const purchaseOrderList = useMemo(() => listResp?.data || [], [listResp]);
  const productsList = useMemo(() => productsData?.data || [], [productsData]);
  const lastPage = useMemo(() => listResp?.last_page || 1, [listResp]);

  // ====== HELPERS
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("IDR", "Rp");

  // ====== FILTERED LIST
  const filteredList = useMemo(() => {
    let filtered = purchaseOrderList;

    if (supplierFilterId !== null) {
      filtered = filtered.filter(
        (item) => item.supplier_id === supplierFilterId
      );
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter((item) => {
        const userName =
          item.user?.name || (meData?.id === item.user_id ? meData.name : "");
        const shopName =
          item.shop?.name ||
          (meData?.shop?.id === item.shop_id ? meData.shop.name : "");

        return (
          item.supplier_name?.toLowerCase().includes(q) ||
          item.supplier?.toLowerCase().includes(q) ||
          userName.toLowerCase().includes(q) ||
          shopName.toLowerCase().includes(q) ||
          (item.notes || "").toLowerCase().includes(q)
        );
      });
    }

    return filtered;
  }, [purchaseOrderList, query, supplierFilterId, meData]);

  // ====== MUTATIONS
  const [createPurchaseOrder] = useCreatePurchaseOrderMutation();
  const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation();
  const [deletePurchaseOrder] = useDeletePurchaseOrderMutation();

  // ====== ACTIONS
  const openCreate = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: PurchaseOrder) => {
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const openDetail = (item: PurchaseOrder) => setDetailItem(item);
  const closeDetail = () => setDetailItem(null);

  const onSubmitForm = async (
    payload: CreatePurchaseOrderRequest | PurchaseOrder
  ) => {
    try {
      if ("id" in payload && payload.id) {
        await updatePurchaseOrder(payload as PurchaseOrder).unwrap();
        Swal.fire("Berhasil", "Purchase Order berhasil diperbarui", "success");
      } else {
        await createPurchaseOrder(
          payload as CreatePurchaseOrderRequest
        ).unwrap();
        Swal.fire("Berhasil", "Purchase Order berhasil ditambahkan", "success");
      }
      await refetch();
      setIsFormOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan", "error");
    }
  };

  const handleDelete = async (item: PurchaseOrder) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Purchase Order?",
      text: `PO ID: ${item.id} - ${item.supplier_name || item.supplier}`,
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
      } catch {
        Swal.fire("Gagal", "Gagal menghapus Purchase Order", "error");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toolbar: filter supplier opsional */}
      <ProdukToolbar
        openModal={openCreate}
        onSearchChange={(q: string) => setQuery(q)}
        addButtonLabel="Tambah Pengadaan"
        enableSupplierFilter
        suppliers={supplierList}
        selectedSupplierId={supplierFilterId}
        onSupplierChange={(id) => setSupplierFilterId(id === 0 ? null : id)}
        isSupplierLoading={isLoadingSupplierFilter}
        onSupplierSearchChange={setSupplierFilterSearch}
        onResetAllFilters={() => {
          setQuery("");
          setSupplierFilterId(null);
          setSupplierFilterSearch("");
        }}
      />

      {/* Tabel */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2 whitespace-nowrap">Aksi</th>
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
                  <td colSpan={8} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    Tidak ada data purchase order
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <ActionsGroup
                        handleDetail={() => openDetail(item)}
                        handleEdit={() => openEdit(item)}
                        handleDelete={() => handleDelete(item)}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.supplier_name || item.supplier}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.user?.name ||
                        (meData?.id === item.user_id
                          ? meData.name
                          : `User ID: ${item.user_id}`)}
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
                      {displayDate(item.date)}
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

      {/* FORM (Create/Edit) */}
      <PurchaseOrderForm
        key={editingId ?? "new"} // remount saat ganti id
        open={isFormOpen}
        onOpenChange={(o) => {
          setIsFormOpen(o);
          if (!o) setEditingId(null);
        }}
        initialData={editingItem ?? null} // data by-id (fresh) → form
        meData={meData ?? null}
        products={productsList}
        onSubmit={onSubmitForm}
        isLoadingFromServer={!!(isFormOpen && editingId && isFetchingPoById)}
      />

      {/* DETAIL */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Detail Purchase Order</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Supplier</div>
                <div className="font-medium">
                  {detailItem.supplier_name || detailItem.supplier}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Tanggal</div>
                <div className="font-medium">
                  {displayDate(detailItem.date)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total</div>
                <div className="font-semibold text-green-600">
                  {formatCurrency(detailItem.total)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <Badge variant={detailItem.status ? "success" : "destructive"}>
                  {detailItem.status ? "Lunas" : "Belum Lunas"}
                </Badge>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={closeDetail}>
                Tutup
              </Button>
              <Button
                onClick={() => {
                  closeDetail();
                  openEdit(detailItem);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}